/**
 * Scoring engine (v0.3).
 *
 * Two important behaviours:
 *
 * 1. Categories whose key collectors failed/were skipped are reported as
 *    NOT ASSESSED (`score = null`, `assessed = false`). They no longer
 *    contribute a clean full score to the overall total.
 *
 * 2. The overall score is a normalized 0–100 based on the *assessed* weight,
 *    so a partial scan can still produce a meaningful score without inflating
 *    it with unverified categories.
 *
 * The scorer also computes a *production-equivalent* grade so that reports
 * for non-production tenants surface the underlying risk if it were observed
 * in production.
 */

import { ResourceCoverage } from "../../core/schema";
import {
  CATEGORY_NAMES,
  CATEGORY_WEIGHTS,
  CategoryId,
  Confidence,
  Environment,
  Finding,
  Grade,
  KEY_COLLECTORS_BY_CATEGORY,
  PartialScanImpact,
  ReportCategory,
  ScoreBreakdown,
  Severity,
  SEVERITY_SCORE_IMPACT
} from "../../reporting/markdown/report.types";

const CATEGORY_IDS = Object.keys(CATEGORY_WEIGHTS) as CategoryId[];

export interface ScoringResult {
  overall: number;
  grade: Grade;
  categories: ReportCategory[];
  breakdown: ScoreBreakdown;
}

export function computeCategoryConfidence(
  categoryId: CategoryId,
  coverage: ResourceCoverage[]
): { confidence: Confidence; reason: string; assessed: boolean } {
  const keyCollectors = KEY_COLLECTORS_BY_CATEGORY[categoryId] ?? [];
  if (keyCollectors.length === 0) {
    return {
      confidence: "high",
      reason: "No key collectors defined for this category.",
      assessed: true
    };
  }
  const relevant = coverage.filter((c) => keyCollectors.includes(c.collector));
  if (relevant.length === 0) {
    return {
      confidence: "low",
      reason: `Not assessed: key collectors (${keyCollectors.join(", ")}) did not run.`,
      assessed: false
    };
  }

  const presentCollectors = new Set(relevant.map((collector) => collector.collector));
  const missing = keyCollectors.filter((collector) => !presentCollectors.has(collector));
  const failed = relevant.filter((c) => c.status === "failed" || c.status === "skipped");
  const partial = relevant.filter((c) => c.status === "partial");

  // Any key collector failed/skipped → category is Not Assessed. A category
  // with one missing key collector cannot be honestly distinguished from
  // "fully clean" in those areas, so we do not award a partial score.
  if (missing.length > 0 || failed.length > 0) {
    const labels = [
      ...missing.map((collector) => `${collector} (missing)`),
      ...failed.map((f) => `${f.collector} (${f.status})`)
    ].join(", ");
    return {
      confidence: "low",
      reason: `Not assessed because key collector(s) ${labels}.`,
      assessed: false
    };
  }

  if (partial.length > 0) {
    return {
      confidence: "medium",
      reason: `Some key collectors returned partial data: ${partial.map((p) => p.collector).join(", ")}.`,
      assessed: true
    };
  }
  return {
    confidence: "high",
    reason: "Key collectors succeeded with full data.",
    assessed: true
  };
}

export interface ScoreOptions {
  environment?: Environment;
}

/**
 * v0.3 signature. The 4th parameter is optional for backward compatibility
 * with older test fixtures that called `scoreFindings(findings, partial,
 * coverage)`. It is used to compute the production-equivalent grade.
 */
export function scoreFindings(
  findings: Finding[],
  partial: boolean,
  coverage: ResourceCoverage[],
  options: ScoreOptions = {}
): ScoringResult {
  const subtotals: Record<CategoryId, number> = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, 0])
  ) as Record<CategoryId, number>;
  const counts: Record<CategoryId, number> = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, 0])
  ) as Record<CategoryId, number>;

  for (const f of findings) {
    if (f.severity === "info") continue;
    const cat = f.category as CategoryId;
    if (!(cat in subtotals)) continue;
    subtotals[cat] += f.scoreImpact;
    counts[cat] += 1;
  }

  let observedScore = 0;
  let assessedMaxPoints = 0;
  let unassessedWeight = 0;

  const categories: ReportCategory[] = CATEGORY_IDS.map((id) => {
    const weight = CATEGORY_WEIGHTS[id];
    const { confidence, reason, assessed } = computeCategoryConfidence(id, coverage);

    if (!assessed) {
      unassessedWeight += weight;
      return {
        id,
        name: CATEGORY_NAMES[id],
        weight,
        score: null,
        assessed: false,
        findings: counts[id],
        confidence,
        confidenceReason: reason
      };
    }

    const findingDeduction = Math.min(subtotals[id], weight);
    const score = Math.max(0, weight - findingDeduction);

    observedScore += score;
    assessedMaxPoints += weight;

    return {
      id,
      name: CATEGORY_NAMES[id],
      weight,
      score,
      assessed: true,
      findings: counts[id],
      confidence,
      confidenceReason: reason
    };
  });

  // Normalize observed score to 0–100 over assessed weight only.
  const normalizedScore =
    assessedMaxPoints > 0
      ? Math.round((observedScore / assessedMaxPoints) * 100)
      : 0;

  // Apply environment-adjusted grade caps based on whichever severity is
  // present in `findings` (the analyzer adjusts severities before scoring).
  let overall = Math.max(0, Math.min(100, normalizedScore));
  let grade = applyGradeCaps(grading(overall), findings);

  if (partial && grade === "A") grade = "B";
  overall = Math.min(overall, gradeCeiling(grade));

  // Production-equivalent score: re-run the *numeric* score against findings
  // whose scoreImpact reflects production-equivalent severity. Categories
  // that were Not Assessed remain Not Assessed.
  const prod = computeProductionEquivalentScore(
    findings,
    categories,
    assessedMaxPoints,
    partial
  );

  const breakdown: ScoreBreakdown = {
    observedScore,
    assessedMaxPoints,
    normalizedScore,
    unassessedWeight,
    productionEquivalent: prod,
    environmentAdjustedInterpretation: interpret(
      options.environment ?? "unknown",
      grade,
      prod.grade,
      findings
    )
  };

  return { overall, grade, categories, breakdown };
}

/**
 * Compute the production-equivalent overall score and grade by re-summing
 * findings against `productionEquivalentScoreImpact` (falling back to
 * `scoreImpact` when not set).
 */
function computeProductionEquivalentScore(
  findings: Finding[],
  categories: ReportCategory[],
  assessedMaxPoints: number,
  partial: boolean
): { observedScore: number; normalizedScore: number; overall: number; grade: Grade } {
  const assessedIds = new Set(
    categories.filter((c) => c.assessed).map((c) => c.id)
  );

  const subtotals: Record<string, number> = {};
  for (const f of findings) {
    if (f.severity === "info" && (f.productionEquivalentSeverity ?? "info") === "info")
      continue;
    if (!assessedIds.has(f.category)) continue;
    const impact = f.productionEquivalentScoreImpact ?? f.scoreImpact;
    subtotals[f.category] = (subtotals[f.category] ?? 0) + impact;
  }

  let observed = 0;
  for (const c of categories) {
    if (!c.assessed) continue;
    const deduction = Math.min(subtotals[c.id] ?? 0, c.weight);
    observed += Math.max(0, c.weight - deduction);
  }

  const normalized =
    assessedMaxPoints > 0
      ? Math.round((observed / assessedMaxPoints) * 100)
      : 0;

  // Caps are computed against production-equivalent severities.
  const prodFindings: Finding[] = findings.map((f) => ({
    ...f,
    severity: f.productionEquivalentSeverity ?? f.severity
  }));
  let grade = applyGradeCaps(grading(normalized), prodFindings);
  if (partial && grade === "A") grade = "B";
  const overall = Math.min(Math.max(0, Math.min(100, normalized)), gradeCeiling(grade));

  return {
    observedScore: observed,
    normalizedScore: normalized,
    overall,
    grade
  };
}

function applyGradeCaps(initial: Grade, findings: Finding[]): Grade {
  const ids = new Set(findings.map((f) => f.id));
  let g = initial;
  if (ids.has("AUTH-EXT-001")) g = capGrade(g, "B");
  if (ids.has("AUTH-SEC-001")) g = capGrade(g, "C");
  if (ids.has("AUTH-SEC-004") || ids.has("AUTH-SEC-005") || ids.has("AUTH-SEC-006")) {
    g = capGrade(g, "D");
  }
  if (ids.has("AUTH-OBS-001")) g = capGrade(g, "B");
  if (ids.has("AUTH-API-001")) g = capGrade(g, "C");
  if (ids.has("AUTH-CLI-004")) g = capGrade(g, "C");
  if (ids.has("AUTH-CLI-005")) g = capGrade(g, "C");
  // Any critical finding caps the grade at C as a safety net.
  if (findings.some((f) => f.severity === "critical")) g = capGrade(g, "C");
  return g;
}

function grading(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

const GRADE_ORDER: Grade[] = ["A", "B", "C", "D", "F"];

function capGrade(current: Grade, cap: Grade): Grade {
  return GRADE_ORDER.indexOf(current) >= GRADE_ORDER.indexOf(cap) ? current : cap;
}

function gradeCeiling(grade: Grade): number {
  switch (grade) {
    case "A":
      return 100;
    case "B":
      return 89;
    case "C":
      return 79;
    case "D":
      return 64;
    case "F":
      return 49;
  }
}

function interpret(
  env: Environment,
  envGrade: Grade,
  prodGrade: Grade,
  findings: Finding[]
): string {
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;

  if (env === "production" || env === "unknown") {
    if (criticalCount > 0) {
      return `Critical findings are present and treated as production-impacting. ${criticalCount} critical and ${highCount} high finding(s) require attention.`;
    }
    if (highCount > 0) {
      return `${highCount} high-severity finding(s) require attention before relying on this tenant for sensitive workloads.`;
    }
    return "No critical or high findings observed in the assessed scope.";
  }

  if (env === "development" || env === "sandbox") {
    if (
      findings.some(
        (f) => (f.productionEquivalentSeverity ?? f.severity) === "critical"
      )
    ) {
      return `Significant hardening recommended before production use. Production-equivalent grade is ${prodGrade}; environment-adjusted grade is ${envGrade}.`;
    }
    return `Acceptable for ${env} use. Significant hardening recommended before production use.`;
  }

  // staging
  return `Staging tenant. Production-equivalent grade is ${prodGrade}. Address remaining findings before promoting to production.`;
}

export { interpret as interpretEnvironmentGrade };

export function buildPartialScanImpact(
  partial: boolean,
  coverage: ResourceCoverage[]
): PartialScanImpact {
  if (!partial) return { partial: false, affectedCategories: [] };
  const affected: PartialScanImpact["affectedCategories"] = [];
  for (const id of CATEGORY_IDS) {
    const keyCollectors = KEY_COLLECTORS_BY_CATEGORY[id];
    const failed = coverage
      .filter(
        (c) =>
          keyCollectors.includes(c.collector) &&
          (c.status === "failed" || c.status === "skipped" || c.status === "partial")
      )
      .map((c) => `${c.collector} (${c.status})`);
    if (failed.length > 0) {
      affected.push({
        categoryId: id,
        categoryName: CATEGORY_NAMES[id],
        affectedCollectors: failed
      });
    }
  }
  return { partial: true, affectedCategories: affected };
}

// Re-export severity constant for symmetry.
export { SEVERITY_SCORE_IMPACT };
export type { Severity };

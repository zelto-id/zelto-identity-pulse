import { ResourceCoverage } from "../../core/schema";
import { Environment, Grade, Severity } from "../../reporting/markdown/report.types";
import {
  OKTA_CATEGORY_NAMES,
  OKTA_CATEGORY_WEIGHTS,
  OKTA_KEY_COLLECTORS_BY_CATEGORY,
  OktaAnalysisReport,
  OktaCategoryId,
  OktaFinding,
  OktaPartialScanImpact,
  OktaReportCategory,
  OktaScoreBreakdown
} from "../../reporting/markdown/okta-report.types";

const CATEGORY_IDS = Object.keys(OKTA_CATEGORY_WEIGHTS) as OktaCategoryId[];
const CONFIDENCE_RANK = { low: 0, medium: 1, high: 2 } as const;
const ANALYSIS_MATURITY_LIMITS: Partial<
  Record<OktaCategoryId, { confidence: "medium"; reason: string }>
> = {
  usersAndLifecycle: {
    confidence: "medium",
    reason:
      "Users & Lifecycle remains bounded in MVP; group membership and lifecycle-source signals are sampled rather than exhaustively modeled."
  },
  applicationsAndSSO: {
    confidence: "medium",
    reason:
      "Applications & SSO uses sampled assignment topology and does not yet model every app-to-policy linkage in depth."
  },
  apiAccessManagement: {
    confidence: "medium",
    reason:
      "API Access Management confirms collected authorization-server configuration, but several implemented checks still require architectural review rather than exhaustive client and entitlement modeling."
  },
  adminAndPrivilegedAccess: {
    confidence: "medium",
    reason:
      "Admin & Privileged Access depends on role-assignment endpoint shape and bounded recent log evidence, so coverage is not yet exhaustive."
  },
  networkAndDevicePosture: {
    confidence: "medium",
    reason:
      "Network & Device Posture does not yet include dedicated device-assurance collectors, so device-policy depth remains partial."
  },
  monitoringAndLogs: {
    confidence: "medium",
    reason:
      "Monitoring & Logs is based on bounded recent system-log samples rather than long-range tenant telemetry."
  }
};

export interface OktaScoringResult {
  overall: number;
  grade: Grade;
  categories: OktaReportCategory[];
  breakdown: OktaScoreBreakdown;
}

export function computeOktaCategoryConfidence(
  categoryId: OktaCategoryId,
  coverage: ResourceCoverage[]
): { confidence: "high" | "medium" | "low"; reason: string; assessed: boolean } {
  const keyCollectors = OKTA_KEY_COLLECTORS_BY_CATEGORY[categoryId] ?? [];
  if (keyCollectors.length === 0) {
    return applyAnalysisMaturityCap(categoryId, {
      confidence: "high",
      reason: "No key collectors defined for this category.",
      assessed: true
    });
  }

  const relevant = coverage.filter((item) => keyCollectors.includes(item.collector));
  if (relevant.length === 0) {
    return {
      confidence: "low",
      reason: `Not assessed: key collectors (${keyCollectors.join(", ")}) did not run.`,
      assessed: false
    };
  }

  const presentCollectors = new Set(relevant.map((item) => item.collector));
  const missing = keyCollectors.filter((collector) => !presentCollectors.has(collector));
  const failed = relevant.filter((item) => item.status === "failed" || item.status === "skipped");
  if (missing.length > 0 || failed.length > 0) {
    const unavailable = [
      ...missing.map((collector) => `${collector} (missing)`),
      ...failed.map((item) => `${item.collector} (${item.status})`)
    ];
    return {
      confidence: "low",
      reason: `Not assessed because key collector(s) ${unavailable.join(", ")}.`,
      assessed: false
    };
  }

  const partial = relevant.filter((item) => item.status === "partial");
  if (partial.length > 0) {
    return applyAnalysisMaturityCap(categoryId, {
      confidence: "medium",
      reason: `Some key collectors returned partial data: ${partial.map((item) => item.collector).join(", ")}.`,
      assessed: true
    });
  }

  return applyAnalysisMaturityCap(categoryId, {
    confidence: "high",
    reason: "Key collectors succeeded with full data.",
    assessed: true
  });
}

export function scoreOktaFindings(
  findings: OktaFinding[],
  partial: boolean,
  coverage: ResourceCoverage[],
  options: { environment: Environment }
): OktaScoringResult {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0])) as Record<
    OktaCategoryId,
    number
  >;

  for (const finding of findings) {
    counts[finding.category] += 1;
  }

  let observedScore = 0;
  let assessedMaxPoints = 0;
  let unassessedWeight = 0;

  const categories: OktaReportCategory[] = CATEGORY_IDS.map((id) => {
    const weight = OKTA_CATEGORY_WEIGHTS[id];
    const confidence = computeOktaCategoryConfidence(id, coverage);
    if (!confidence.assessed) {
      unassessedWeight += weight;
      return {
        id,
        name: OKTA_CATEGORY_NAMES[id],
        weight,
        score: null,
        assessed: false,
        findings: counts[id],
        confidence: confidence.confidence,
        confidenceReason: confidence.reason
      };
    }

    const categoryFindings = findings.filter(
      (finding) => finding.category === id && finding.severity !== "info"
    );
    const score = computeCategoryScore(weight, categoryFindings, {
      impactSelector: (finding) => finding.scoreImpact,
      severitySelector: (finding) => finding.severity
    });
    observedScore += score;
    assessedMaxPoints += weight;

    return {
      id,
      name: OKTA_CATEGORY_NAMES[id],
      weight,
      score,
      assessed: true,
      findings: counts[id],
      confidence: confidence.confidence,
      confidenceReason: confidence.reason
    };
  });

  const normalizedScore =
    assessedMaxPoints > 0 ? Math.round((observedScore / assessedMaxPoints) * 100) : 0;

  const overall = Math.max(0, Math.min(100, normalizedScore));
  let grade = applyGradeCaps(grading(overall), findings);
  if (partial && grade === "A") grade = "B";

  const productionEquivalent = computeProductionEquivalent(findings, categories, assessedMaxPoints, partial);

  return {
    overall,
    grade,
    categories,
    breakdown: {
      observedScore,
      assessedMaxPoints,
      normalizedScore,
      unassessedWeight,
      productionEquivalent,
      environmentAdjustedInterpretation: interpretEnvironment(
        options.environment,
        grade,
        productionEquivalent.grade,
        findings
      )
    }
  };
}

export function buildOktaPartialScanImpact(
  partial: boolean,
  coverage: ResourceCoverage[]
): OktaPartialScanImpact {
  if (!partial) return { partial: false, affectedCategories: [] };
  const affected: OktaPartialScanImpact["affectedCategories"] = [];
  for (const id of CATEGORY_IDS) {
    const keyCollectors = OKTA_KEY_COLLECTORS_BY_CATEGORY[id];
    const impacted = coverage
      .filter(
        (item) =>
          keyCollectors.includes(item.collector) &&
          (item.status === "failed" || item.status === "skipped" || item.status === "partial")
      )
      .map((item) => `${item.collector} (${item.status})`);
    if (impacted.length > 0) {
      affected.push({
        categoryId: id,
        categoryName: OKTA_CATEGORY_NAMES[id],
        affectedCollectors: impacted
      });
    }
  }
  return { partial: true, affectedCategories: affected };
}

function computeProductionEquivalent(
  findings: OktaFinding[],
  categories: OktaReportCategory[],
  assessedMaxPoints: number,
  partial: boolean
): OktaScoreBreakdown["productionEquivalent"] {
  const assessedIds = new Set(categories.filter((category) => category.assessed).map((category) => category.id));
  let observedScore = 0;
  for (const category of categories) {
    if (!category.assessed) continue;
    const categoryFindings = findings.filter(
      (finding) =>
        assessedIds.has(finding.category) &&
        finding.category === category.id &&
        (finding.productionEquivalentSeverity ?? finding.severity) !== "info"
    );
    observedScore += computeCategoryScore(category.weight, categoryFindings, {
      impactSelector: (finding) => finding.productionEquivalentScoreImpact ?? finding.scoreImpact,
      severitySelector: (finding) => finding.productionEquivalentSeverity ?? finding.severity
    });
  }

  const normalizedScore =
    assessedMaxPoints > 0 ? Math.round((observedScore / assessedMaxPoints) * 100) : 0;

  const prodFindings = findings.map((finding) => ({
    ...finding,
    severity: finding.productionEquivalentSeverity ?? finding.severity
  }));
  let grade = applyGradeCaps(grading(normalizedScore), prodFindings);
  if (partial && grade === "A") grade = "B";
  const overall = Math.max(0, normalizedScore);

  return { observedScore, normalizedScore, overall, grade };
}

function applyGradeCaps(initial: Grade, findings: Array<{ id: string; severity: Severity }>): Grade {
  const ids = new Set(findings.map((finding) => finding.id));
  let grade = initial;
  if (ids.has("OKTA-MON-001")) grade = capGrade(grade, "B");
  if (ids.has("OKTA-POL-002")) grade = capGrade(grade, "C");
  if (ids.has("OKTA-ADM-001")) grade = capGrade(grade, "C");
  if (ids.has("OKTA-APP-001")) grade = capGrade(grade, "C");
  if (findings.some((finding) => finding.severity === "critical")) {
    grade = capGrade(grade, "C");
  }
  return grade;
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

function interpretEnvironment(
  environment: Environment,
  environmentGrade: Grade,
  productionGrade: Grade,
  findings: OktaFinding[]
): string {
  const criticalCount = findings.filter((finding) => finding.severity === "critical").length;
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  if (environment === "production" || environment === "unknown") {
    if (criticalCount > 0) {
      return `Critical findings are present and treated as production-impacting. ${criticalCount} critical and ${highCount} high finding(s) require attention.`;
    }
    if (highCount > 0) {
      return `${highCount} high-severity finding(s) require attention before relying on this Okta org for sensitive workforce access.`;
    }
    return "No critical or high findings were observed in the assessed Okta scope.";
  }

  if (environment === "development" || environment === "sandbox") {
    return `Environment-adjusted grade is ${environmentGrade}. Production-equivalent grade is ${productionGrade}; hardening is still recommended before promoting these patterns to production.`;
  }

  return `Staging org. Production-equivalent grade is ${productionGrade}. Address remaining findings before promoting these configurations to production.`;
}

function computeCategoryScore(
  weight: number,
  findings: OktaFinding[],
  options: {
    impactSelector: (finding: OktaFinding) => number;
    severitySelector: (finding: OktaFinding) => Severity;
  }
): number {
  if (findings.length === 0) return weight;
  const rawDeduction = findings.reduce((sum, finding) => sum + options.impactSelector(finding), 0);
  const floorRatio = computeCategoryFloorRatio(
    findings.map((finding) => ({
      classification: finding.classification,
      severity: options.severitySelector(finding)
    }))
  );
  const floorScore = weight * floorRatio;
  const rawScore = Math.max(0, weight - rawDeduction);
  return clampCategoryScore(Math.max(rawScore, floorScore), weight);
}

function computeCategoryFloorRatio(
  findings: Array<{ classification: OktaFinding["classification"]; severity: Severity }>
): number {
  if (findings.length === 0) return 1;
  const confirmed = findings.filter((finding) => finding.classification === "confirmed-risk");
  const hasConfirmedCritical = confirmed.some((finding) => finding.severity === "critical");
  const hasConfirmedHigh = confirmed.some((finding) => finding.severity === "high");
  const hasConfirmedAny = confirmed.some(
    (finding) => finding.severity === "medium" || finding.severity === "low"
  );
  const onlyAdvisoryOrPositive = findings.every(
    (finding) => finding.classification === "advisory" || finding.classification === "positive-signal"
  );
  const onlyLowSeverity = findings.every(
    (finding) => finding.severity === "low" || finding.severity === "info"
  );
  const hasOnlyReviewQuestions = findings.every(
    (finding) => finding.classification !== "confirmed-risk"
  );

  if (hasConfirmedCritical) return 0;
  if (hasConfirmedHigh) return 0.3;
  if (onlyAdvisoryOrPositive && onlyLowSeverity) return 0.8;
  if (onlyAdvisoryOrPositive) return 0.75;
  if (hasOnlyReviewQuestions && onlyLowSeverity) return 0.8;
  if (hasOnlyReviewQuestions) return 0.6;
  if (hasConfirmedAny) return 0.5;
  return 0.5;
}

function clampCategoryScore(score: number, weight: number): number {
  return Math.max(0, Math.min(weight, Math.round(score)));
}

function applyAnalysisMaturityCap(
  categoryId: OktaCategoryId,
  input: { confidence: "high" | "medium" | "low"; reason: string; assessed: boolean }
): { confidence: "high" | "medium" | "low"; reason: string; assessed: boolean } {
  if (!input.assessed) return input;
  const cap = ANALYSIS_MATURITY_LIMITS[categoryId];
  if (!cap) return input;
  if (CONFIDENCE_RANK[input.confidence] <= CONFIDENCE_RANK[cap.confidence]) return input;
  return {
    ...input,
    confidence: cap.confidence,
    reason: `${input.reason} ${cap.reason}`
  };
}

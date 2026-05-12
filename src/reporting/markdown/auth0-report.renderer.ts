/**
 * Markdown report renderer (v0.3) for an Auth0AnalysisReport.
 *
 * Output is intended to be readable by both engineering and business
 * stakeholders. No HTML, no PDF — markdown only (MVP scope).
 */

import {
  Auth0AnalysisReport,
  ConsolidatedFinding,
  Finding,
  KeyDecision,
  Opportunity,
  OpportunityGroup,
  PartialScanImpact,
  RemediationBucket,
  ReRunValidation,
  ReportCategory,
  Severity
} from "./report.types";

export function renderAuth0Report(report: Auth0AnalysisReport): string {
  const lines: string[] = [];

  // Title and metadata
  lines.push(`# Auth0 Tenant Posture Report`);
  lines.push("");
  lines.push(`**Tenant:** \`${report.metadata.tenantDomain}\`  `);
  lines.push(`**Environment:** \`${report.metadata.environment}\`  `);
  lines.push(`**Generated:** ${report.metadata.generatedAt}  `);
  lines.push(`**Scan ID:** \`${report.metadata.scanId}\`  `);
  lines.push(`**Connector version:** ${report.metadata.connectorVersion}`);
  lines.push("");

  // Assessment Assumptions
  lines.push(`## Assessment Assumptions`);
  lines.push("");
  if (report.assumptions.length === 0) {
    lines.push(`_None recorded._`);
  } else {
    for (const a of report.assumptions) {
      lines.push(`- ${a}`);
    }
  }
  lines.push("");

  // Executive Summary
  lines.push(`## Executive Summary`);
  lines.push("");
  const isProd = report.metadata.environment === "production";
  const scoreLabel = isProd ? "Overall score" : "Environment-adjusted score";
  lines.push(
    `- **${scoreLabel}:** ${report.score.overall} / 100 — Grade **${report.score.grade}**`
  );
  if (!isProd) {
    const pe = report.score.breakdown.productionEquivalent;
    lines.push(
      `- **Production-equivalent score:** ${pe.overall} / 100 — Grade **${pe.grade}**`
    );
  }
  if (report.collectionStatus.partial) {
    lines.push(
      `- **Scan was partial.** Categories whose key collectors did not run are reported as Not Assessed (score: N/A) rather than scored as clean.`
    );
  }
  const topRisks = report.findings
    .filter((f) => f.severity === "critical" || f.severity === "high")
    .slice(0, 5);
  if (topRisks.length > 0) {
    lines.push(`- **Top risks:**`);
    for (const f of topRisks) {
      lines.push(`  - [${f.severity.toUpperCase()}] ${f.id} — ${f.title}`);
    }
  } else {
    lines.push(`- No critical or high findings detected in the scanned scope.`);
  }
  const topOpps = report.opportunities.slice(0, 5);
  if (topOpps.length > 0) {
    lines.push(`- **Top opportunities:**`);
    for (const o of topOpps) {
      lines.push(`  - ${o.title} _(category: ${o.category}, effort: ${o.effort})_`);
    }
  }
  lines.push("");

  // Score Interpretation
  lines.push(`## Score Interpretation`);
  lines.push("");
  const b = report.score.breakdown;
  const pe = b.productionEquivalent;
  lines.push(`### Environment-adjusted (\`${report.metadata.environment}\`)`);
  lines.push("");
  lines.push(
    `- **Observed score:** ${b.observedScore} / ${b.assessedMaxPoints} assessed points`
  );
  lines.push(`- **Normalized score:** ${b.normalizedScore} / 100`);
  lines.push(`- **Overall:** ${report.score.overall} / 100 — Grade **${report.score.grade}**`);
  lines.push("");
  lines.push(`### Production-equivalent`);
  lines.push("");
  lines.push(
    `- **Observed score:** ${pe.observedScore} / ${b.assessedMaxPoints} assessed points`
  );
  lines.push(`- **Normalized score:** ${pe.normalizedScore} / 100`);
  lines.push(`- **Overall:** ${pe.overall} / 100 — Grade **${pe.grade}**`);
  lines.push("");
  lines.push(`- **Unassessed weight:** ${b.unassessedWeight}`);
  lines.push("");
  lines.push(b.environmentAdjustedInterpretation);
  lines.push("");

  // Key Decisions Required
  lines.push(`## Key Decisions Required`);
  lines.push("");
  if (report.keyDecisions.length === 0) {
    lines.push(
      `_No outstanding decisions identified by the current rule set._`
    );
  } else {
    for (const d of report.keyDecisions) {
      renderKeyDecision(lines, d);
    }
  }
  lines.push("");

  if (report.partialScanImpact.partial) {
    lines.push(`### Partial Scan Impact`);
    lines.push("");
    renderPartialScanImpact(lines, report.partialScanImpact);
    lines.push("");
  }

  // Overall score block
  lines.push(`## Overall Score`);
  lines.push("");
  lines.push(`| Score | Grade | Max |`);
  lines.push(`|---:|:---:|---:|`);
  lines.push(`| ${report.score.overall} | ${report.score.grade} | 100 |`);
  lines.push("");

  // Category breakdown
  lines.push(`## Category Breakdown`);
  lines.push("");
  lines.push(`| Category | Score | Weight | Findings | Confidence | Confidence reason |`);
  lines.push(`|---|---:|---:|---:|---|---|`);
  for (const c of report.categories) {
    const scoreCell = c.assessed && c.score !== null ? String(c.score) : "N/A";
    lines.push(
      `| ${c.name} | ${scoreCell} | ${c.weight} | ${c.findings} | ${c.confidence} | ${escapePipe(c.confidenceReason)} |`
    );
  }
  lines.push("");

  // Recommended Remediation Plan
  lines.push(`## Recommended Remediation Plan`);
  lines.push("");
  if (report.remediationPlan.buckets.every((bk) => bk.items.length === 0)) {
    lines.push(`_No remediation items — no actionable findings detected._`);
    lines.push("");
  } else {
    for (const bk of report.remediationPlan.buckets) {
      renderRemediationBucket(lines, bk);
    }
  }

  // Consolidated findings (grouped by rule ID)
  const bySeverity: Record<Severity, ConsolidatedFinding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: []
  };
  for (const cf of report.consolidatedFindings) {
    if (cf.overallSeverity !== "info") {
      bySeverity[cf.overallSeverity].push(cf);
    }
  }
  for (const sev of ["critical", "high", "medium", "low"] as Severity[]) {
    lines.push(`## ${capitalize(sev)} Findings`);
    lines.push("");
    const list = bySeverity[sev];
    if (list.length === 0) {
      lines.push(`_None._`);
      lines.push("");
      continue;
    }
    for (const cf of list) {
      renderConsolidatedFinding(lines, cf);
    }
  }

  // Opportunities (grouped)
  lines.push(`## Opportunities`);
  lines.push("");
  if (report.opportunities.length === 0) {
    lines.push(`_None._`);
    lines.push("");
  } else {
    for (const g of report.opportunityGroups) {
      renderOpportunityGroup(lines, g);
    }
  }

  // Re-Run Validation
  renderReRunValidation(lines, report.reRunValidation);

  // What Was Not Assessed
  lines.push(`## What Was Not Assessed`);
  lines.push("");
  if (report.notAssessed.length === 0) {
    lines.push(`_All in-scope areas were assessed._`);
  } else {
    for (const n of report.notAssessed) {
      lines.push(`- ${n}`);
    }
  }
  lines.push("");

  // Resource coverage
  lines.push(`## Resource Coverage`);
  lines.push("");
  lines.push(`| Collector | Status | Count | Required scopes | Notes |`);
  lines.push(`|---|---|---:|---|---|`);
  for (const c of report.collectionStatus.coverage) {
    lines.push(
      `| ${c.collector} | ${c.status} | ${c.count ?? "-"} | ${(c.requiredScopes ?? []).join(", ")} | ${escapePipe(c.notes ?? "")} |`
    );
  }
  lines.push("");

  // Collection status
  lines.push(`## Collection Status`);
  lines.push("");
  lines.push(`- Partial scan: **${report.collectionStatus.partial ? "yes" : "no"}**`);
  if (report.collectionStatus.missingScopes.length > 0) {
    lines.push(
      `- **Missing scopes:** ${report.collectionStatus.missingScopes.join(", ")}`
    );
  } else {
    lines.push(`- **Missing scopes:** none reported`);
  }
  if (report.collectionStatus.failedCollectors.length > 0) {
    lines.push(`- **Failed / skipped collectors:**`);
    for (const fc of report.collectionStatus.failedCollectors) {
      lines.push(
        `  - \`${fc.collector}\` — ${fc.status}${fc.missingScopes ? ` (missing: ${fc.missingScopes.join(", ")})` : ""}: ${fc.reason}`
      );
    }
  } else {
    lines.push(`- **Failed / skipped collectors:** none`);
  }
  lines.push("");

  // Methodology
  lines.push(`## Appendix: Methodology`);
  lines.push("");
  lines.push(
    `This report is generated by \`zelto-identity-pulse\`, a local-first,`
  );
  lines.push(
    `read-only Auth0 posture analyzer. Findings are produced by deterministic`
  );
  lines.push(
    `rules against a normalized snapshot of tenant configuration. Scoring uses`
  );
  lines.push(
    `weighted categories (max 100). Categories whose key collectors did not`
  );
  lines.push(
    `run are reported as Not Assessed and omitted from the assessed-points`
  );
  lines.push(
    `total; the overall score is normalized over the assessed weight and`
  );
  lines.push(
    `subject to critical-finding grade caps. Severities are first computed`
  );
  lines.push(
    `production-equivalent and then adjusted for the reported tenant`
  );
  lines.push(
    `environment; both values are preserved on each finding. Secrets are`
  );
  lines.push(
    `redacted from the snapshot before analysis; no raw tenant data, secrets,`
  );
  lines.push(
    `or Management API tokens are sent to any external service.`
  );
  lines.push("");
  lines.push(`Categories and weights:`);
  for (const c of report.categories) {
    lines.push(`- ${c.name} (weight: ${c.weight})`);
  }
  lines.push("");
  lines.push(
    `Grade bands: A 90–100, B 80–89, C 65–79, D 50–64, F <50. Critical findings`
  );
  lines.push(
    `(legacy Rules/Hooks, MFA disabled, attack-protection disabled, etc.) cap`
  );
  lines.push(
    `the achievable grade independently of the numeric score.`
  );
  lines.push("");

  return lines.join("\n");
}

function renderKeyDecision(lines: string[], d: KeyDecision): void {
  lines.push(`### ${d.question}`);
  lines.push("");
  lines.push(d.context);
  if (d.relatedFindingIds.length > 0) {
    lines.push("");
    lines.push(
      `_Related findings:_ ${d.relatedFindingIds.map((id) => `\`${id}\``).join(", ")}`
    );
  }
  lines.push("");
}

function renderPartialScanImpact(lines: string[], p: PartialScanImpact): void {
  if (p.affectedCategories.length === 0) {
    lines.push(
      `Some collectors were partial, but no key category collectors were directly affected. Confidence indicators in the Category Breakdown reflect any residual uncertainty.`
    );
    return;
  }
  lines.push(
    `The following categories have reduced confidence because key collectors did not return complete data:`
  );
  lines.push("");
  for (const c of p.affectedCategories) {
    lines.push(
      `- **${c.categoryName}** — affected collectors: ${c.affectedCollectors.join(", ")}`
    );
  }
}

function renderRemediationBucket(lines: string[], b: RemediationBucket): void {
  lines.push(`### ${b.name} (${b.window})`);
  lines.push("");
  if (b.items.length === 0) {
    lines.push(`_No items in this bucket._`);
    lines.push("");
    return;
  }
  for (const it of b.items) {
    const sevLabel = it.severity ? ` [${it.severity}]` : "";
    lines.push(`${it.priority}. **${it.findingId}**${sevLabel} — ${it.action}`);
    lines.push(`   - Expected outcome: ${it.expectedOutcome}`);
    lines.push(`   - Effort: ${it.effort}`);
  }
  lines.push("");
}

function renderConsolidatedFinding(lines: string[], cf: ConsolidatedFinding): void {
  lines.push(`### ${cf.id} — ${cf.title}`);
  lines.push("");

  // Meta badges
  lines.push(`- **Overall severity:** ${cf.overallSeverity}`);
  if (
    cf.overallProductionEquivalentSeverity &&
    cf.overallProductionEquivalentSeverity !== cf.overallSeverity
  ) {
    lines.push(
      `  - Production-equivalent: **${cf.overallProductionEquivalentSeverity}** | Environment-adjusted: **${cf.overallSeverity}**`
    );
  }
  lines.push(`- **Category:** ${cf.category}`);
  if (
    cf.totalProductionEquivalentScoreImpact !== undefined &&
    cf.totalProductionEquivalentScoreImpact !== cf.totalScoreImpact
  ) {
    lines.push(
      `- **Score impact:** -${cf.totalScoreImpact} (environment-adjusted) / -${cf.totalProductionEquivalentScoreImpact} (production-equivalent)`
    );
  } else {
    lines.push(`- **Score impact:** -${cf.totalScoreImpact}`);
  }
  if (cf.confidence) lines.push(`- **Confidence:** ${cf.confidence}`);
  lines.push("");

  // Risk summary
  lines.push(`**Risk Summary**`);
  lines.push("");
  lines.push(cf.riskSummary);
  lines.push("");

  // Per-resource instances table
  lines.push(`**Affected Resources**`);
  lines.push("");
  const hasAdjusted = cf.instances.some(
    (row) =>
      row.productionEquivalentSeverity &&
      row.productionEquivalentSeverity !== row.environmentAdjustedSeverity
  );
  if (hasAdjusted) {
    lines.push(`| Resource | Severity (adj.) | Severity (prod-equiv.) | Evidence Summary |`);
    lines.push(`|---|:---:|:---:|---|`);
    for (const row of cf.instances) {
      const prodSev = row.productionEquivalentSeverity ?? row.severity;
      lines.push(
        `| ${escapePipe(row.resource)} | ${row.severity} | ${prodSev} | ${escapePipe(row.evidenceSummary)} |`
      );
    }
  } else {
    lines.push(`| Resource | Severity | Evidence Summary |`);
    lines.push(`|---|:---:|---|`);
    for (const row of cf.instances) {
      lines.push(
        `| ${escapePipe(row.resource)} | ${row.severity} | ${escapePipe(row.evidenceSummary)} |`
      );
    }
  }
  lines.push("");

  // Unified recommendation
  lines.push(`**Recommendation**`);
  lines.push("");
  lines.push(cf.recommendation);
  lines.push("");

  // How to Interpret
  if (cf.howToInterpret) {
    renderHowToInterpret(lines, cf.howToInterpret);
  }

  // False-positive notes
  if (cf.falsePositiveNotes && cf.falsePositiveNotes.length > 0) {
    lines.push(`**False-positive notes**`);
    lines.push("");
    for (const n of cf.falsePositiveNotes) {
      lines.push(`- ${n}`);
    }
    lines.push("");
  }

  // Structured remediation block
  if (
    cf.auth0Area ||
    cf.terraformResource ||
    (cf.implementationSteps && cf.implementationSteps.length > 0) ||
    (cf.validationSteps && cf.validationSteps.length > 0)
  ) {
    lines.push(`#### Remediation`);
    lines.push("");
    if (cf.auth0Area) {
      lines.push(`**Auth0 Dashboard**`);
      lines.push("");
      lines.push(cf.auth0Area);
      lines.push("");
    }
    if (cf.terraformResource || (cf.terraformFields && cf.terraformFields.length > 0)) {
      lines.push(`**Terraform**`);
      lines.push("");
      if (cf.terraformResource) lines.push(`Resource: \`${cf.terraformResource}\``);
      if (cf.terraformFields && cf.terraformFields.length > 0) {
        lines.push(`Fields: ${cf.terraformFields.map((x) => `\`${x}\``).join(", ")}`);
      }
      lines.push("");
    }
    if (cf.implementationSteps && cf.implementationSteps.length > 0) {
      lines.push(`**Implementation steps**`);
      lines.push("");
      cf.implementationSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push("");
    }
    if (cf.validationSteps && cf.validationSteps.length > 0) {
      lines.push(`**Validation**`);
      lines.push("");
      cf.validationSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push(`${cf.validationSteps.length + 1}. Re-run \`zelto-pulse scan auth0\`.`);
      lines.push("");
    }
  }

  lines.push("");
}

function renderHowToInterpret(
  lines: string[],
  h: import("./report.types").HowToInterpretContent
): void {
  lines.push(`#### How to Interpret This Finding & Assess Your True Risk`);
  lines.push("");
  lines.push(`**Core Principle: ${h.corePrincipleTitle}**`);
  lines.push("");
  lines.push(h.corePrincipleDetail);
  lines.push("");
  lines.push(`**Objective Risk Model**`);
  lines.push("");
  // riskModelDescription may contain markdown bullets — emit as-is.
  lines.push(h.riskModelDescription);
  lines.push("");
  lines.push(`**Architectural Self-Assessment**`);
  lines.push("");
  for (const q of h.selfAssessmentQuestions) {
    lines.push(`- ${q}`);
  }
  lines.push("");
  lines.push(`**Concluding Advice**`);
  lines.push("");
  lines.push(h.concludingAdvice);
  lines.push("");
}

function renderFinding(lines: string[], f: Finding): void {
  lines.push(`### ${f.id} — ${f.title}`);
  lines.push("");
  lines.push(`- **Severity:** ${f.severity}`);
  if (
    f.productionEquivalentSeverity &&
    f.environmentAdjustedSeverity &&
    f.productionEquivalentSeverity !== f.environmentAdjustedSeverity
  ) {
    lines.push(
      `  - Production-equivalent: **${f.productionEquivalentSeverity}** | Environment-adjusted: **${f.environmentAdjustedSeverity}**`
    );
    if (f.environmentAdjustmentReason) {
      lines.push(`  - _${f.environmentAdjustmentReason}_`);
    }
  }
  lines.push(`- **Category:** ${f.category}`);
  if (
    f.productionEquivalentScoreImpact !== undefined &&
    f.productionEquivalentScoreImpact !== f.scoreImpact
  ) {
    lines.push(
      `- **Score impact:** -${f.scoreImpact} (environment-adjusted) / -${f.productionEquivalentScoreImpact} (production-equivalent)`
    );
  } else {
    lines.push(`- **Score impact:** -${f.scoreImpact}`);
  }
  if (f.confidence) {
    lines.push(`- **Confidence:** ${f.confidence}`);
  }
  if (f.affectedResources.length > 0) {
    lines.push(
      `- **Affected resources:** ${f.affectedResources.slice(0, 10).join(", ")}${f.affectedResources.length > 10 ? ", ..." : ""}`
    );
  }
  if (f.evidenceSplit && (f.evidenceSplit.observedRisks.length > 0 || f.evidenceSplit.requiresValidation.length > 0)) {
    lines.push(`- **Evidence:**`);
    if (f.evidenceSplit.observedRisks.length > 0) {
      lines.push(`  - **Observed risks:**`);
      for (const r of f.evidenceSplit.observedRisks) lines.push(`    - ${r}`);
    }
    if (f.evidenceSplit.requiresValidation.length > 0) {
      lines.push(`  - **Requires validation:**`);
      for (const r of f.evidenceSplit.requiresValidation) lines.push(`    - ${r}`);
    }
  } else {
    lines.push(`- **Evidence:** ${f.evidence}`);
  }
  lines.push(`- **Recommendation:** ${f.recommendation}`);
  lines.push(`- **Business risk:** ${f.businessRisk}`);
  if (f.falsePositiveNotes && f.falsePositiveNotes.length > 0) {
    lines.push(`- **False-positive notes:**`);
    for (const n of f.falsePositiveNotes) {
      lines.push(`  - ${n}`);
    }
  }
  if (f.remediationHint) {
    lines.push(`- **Remediation hint:** ${f.remediationHint}`);
  }

  // Structured Remediation block
  if (
    f.auth0Area ||
    f.terraformResource ||
    (f.terraformFields && f.terraformFields.length > 0) ||
    (f.implementationSteps && f.implementationSteps.length > 0) ||
    (f.validationSteps && f.validationSteps.length > 0)
  ) {
    lines.push("");
    lines.push(`#### Remediation`);
    lines.push("");
    if (f.auth0Area) {
      lines.push(`**Auth0 Dashboard**`);
      lines.push("");
      lines.push(f.auth0Area);
      lines.push("");
    }
    if (f.terraformResource || (f.terraformFields && f.terraformFields.length > 0)) {
      lines.push(`**Terraform**`);
      lines.push("");
      if (f.terraformResource) {
        lines.push(`Resource: \`${f.terraformResource}\``);
      }
      if (f.terraformFields && f.terraformFields.length > 0) {
        lines.push(
          `Fields: ${f.terraformFields.map((x) => `\`${x}\``).join(", ")}`
        );
      }
      lines.push("");
    }
    if (f.implementationSteps && f.implementationSteps.length > 0) {
      lines.push(`**Implementation steps**`);
      lines.push("");
      f.implementationSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push("");
    }
    if (f.validationSteps && f.validationSteps.length > 0) {
      lines.push(`**Validation**`);
      lines.push("");
      f.validationSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
      lines.push(`${f.validationSteps.length + 1}. Re-run \`zelto-pulse scan auth0\`.`);
      lines.push("");
    }
  }

  lines.push("");
}

function renderOpportunityGroup(lines: string[], g: OpportunityGroup): void {
  lines.push(`### ${g.name}`);
  lines.push("");
  lines.push(`_${g.description}_`);
  lines.push("");
  if (g.items.length === 0) {
    lines.push(`_No items in this group._`);
    lines.push("");
    return;
  }
  lines.push(`| Title | Source finding | Category | Type | Effort |`);
  lines.push(`|---|---|---|---|---|`);
  for (const o of g.items) {
    lines.push(
      `| ${escapePipe(o.title)} | ${o.findingId ?? "-"} | ${o.category} | ${o.type} | ${o.effort} |`
    );
  }
  lines.push("");
}

function renderReRunValidation(lines: string[], r: ReRunValidation): void {
  lines.push(`## Re-Run Validation`);
  lines.push("");
  lines.push(
    `After applying remediation, re-run the scan to verify category scores improve:`
  );
  lines.push("");
  lines.push("```bash");
  lines.push(r.command);
  lines.push("```");
  lines.push("");
  if (r.expectedImprovements.length === 0) {
    lines.push(`_No specific category improvements expected — current scan is clean._`);
  } else {
    lines.push(`Expected category improvements:`);
    lines.push("");
    for (const e of r.expectedImprovements) {
      lines.push(`- **${e.categoryName}** — ${e.reason}`);
    }
  }
  lines.push("");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapePipe(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// Re-export for tests/consumers.
export type { Auth0AnalysisReport, ConsolidatedFinding, Finding, Opportunity, ReportCategory };

import {
  OktaAnalysisReport,
  OktaFinding,
  OktaRemediationBucket,
  OKTA_CATEGORY_NAMES
} from "./okta-report.types";
import {
  buildOktaNotAssessedEmptyState,
  buildOktaPartialScanSummary
} from "./okta-report.collection-status";
import { Severity } from "./report.types";

export function renderOktaReport(report: OktaAnalysisReport): string {
  const lines: string[] = [];

  lines.push("# Okta Workforce Posture Report");
  lines.push("");
  lines.push(`**Org:** \`${report.metadata.orgUrl}\`  `);
  lines.push(`**Environment:** \`${report.metadata.environment}\`  `);
  lines.push(`**Generated:** ${report.metadata.generatedAt}  `);
  lines.push(`**Scan ID:** \`${report.metadata.scanId}\`  `);
  lines.push(`**Connector version:** ${report.metadata.connectorVersion}  `);
  lines.push(
    `**Identifiers in report:** ${report.metadata.includeIdentifiers ? "full identifiers included" : "masked by default"}`
  );
  lines.push("");

  lines.push("## Assessment Assumptions");
  lines.push("");
  for (const assumption of report.assumptions) {
    lines.push(`- ${assumption}`);
  }
  lines.push("");

  lines.push("## Conclusion");
  lines.push("");
  for (const line of report.conclusion) {
    lines.push(`- ${line}`);
  }
  lines.push("");

  lines.push("## Executive Summary");
  lines.push("");
  const isProduction = report.metadata.environment === "production";
  lines.push(
    `- **${isProduction ? "Overall score" : "Environment-adjusted score"}:** ${report.score.overall} / 100 — Grade **${report.score.grade}**`
  );
  if (shouldRenderProductionEquivalent(report)) {
    const pe = report.score.breakdown.productionEquivalent;
    lines.push(`- **Production-equivalent score:** ${pe.overall} / 100 — Grade **${pe.grade}**`);
  }
  if (report.collectionStatus.partial) {
    lines.push(`- **${buildOktaPartialScanSummary(report)}**`);
  } else {
    lines.push(
      "- **Collectors completed successfully.** Several categories still rely on bounded or sampled MVP analysis rather than exhaustive relationship expansion."
    );
  }
  const topFindings = report.findings
    .filter((finding) => finding.severity === "critical" || finding.severity === "high")
    .slice(0, 5);
  if (topFindings.length > 0) {
    lines.push("- **Top risks:**");
    for (const finding of topFindings) {
      lines.push(`  - [${finding.severity.toUpperCase()}] ${finding.id} — ${finding.title}`);
    }
  } else {
    lines.push("- No critical or high findings detected in the assessed Okta scope.");
  }
  lines.push("");

  lines.push("## Score Interpretation");
  lines.push("");
  lines.push(
    `- **Observed score:** ${report.score.breakdown.observedScore} / ${report.score.breakdown.assessedMaxPoints} assessed points`
  );
  lines.push(`- **Normalized score:** ${report.score.breakdown.normalizedScore} / 100`);
  lines.push(`- **Hero score:** ${report.score.overall} / 100`);
  lines.push(`- **Unassessed weight:** ${report.score.breakdown.unassessedWeight}`);
  if (shouldRenderProductionEquivalent(report)) {
    const pe = report.score.breakdown.productionEquivalent;
    lines.push(`- **Production-equivalent score:** ${pe.observedScore} observed / ${pe.overall} normalized`);
  }
  lines.push(`- ${report.score.breakdown.environmentAdjustedInterpretation}`);
  lines.push("");

  lines.push("## Recommended Remediation Plan");
  lines.push("");
  if (report.remediationPlan.buckets.every((bucket) => bucket.items.length === 0)) {
    lines.push("_No remediation items — no actionable findings detected._");
    lines.push("");
  } else {
    for (const bucket of report.remediationPlan.buckets) {
      renderRemediationBucket(lines, bucket);
    }
  }

  lines.push("## Positive Signals");
  lines.push("");
  if (report.positiveSignals.length === 0) {
    lines.push("_No positive signals were recorded._");
  } else {
    for (const signal of report.positiveSignals) {
      lines.push(`- **${signal.title}:** ${signal.detail}`);
    }
  }
  lines.push("");

  lines.push("## Partial Scan Impact");
  lines.push("");
  if (report.partialScanImpact.partial) {
    lines.push(
      "- **Partial collectors affected assessed scope.** The following categories had failed, skipped, or partial key collectors:"
    );
    for (const impacted of report.partialScanImpact.affectedCategories) {
      lines.push(`  - **${impacted.categoryName}:** ${impacted.affectedCollectors.join(", ")}`);
    }
  } else {
    lines.push(
      "- All configured collectors completed successfully, but several categories use bounded or sampled analysis in the MVP."
    );
  }
  for (const boundary of report.analysisBoundaries) {
    lines.push(`- ${boundary}`);
  }
  lines.push("");

  lines.push("## Category Breakdown");
  lines.push("");
  lines.push("| Category | Score | Weight | Findings | Confidence | Confidence reason |");
  lines.push("|---|---:|---:|---:|---|---|");
  for (const category of report.categories) {
    const scoreCell = category.assessed && category.score !== null ? String(category.score) : "N/A";
    lines.push(
      `| ${category.name} | ${scoreCell} | ${category.weight} | ${category.findings} | ${category.confidence} | ${escapePipes(category.confidenceReason)} |`
    );
  }
  lines.push("");

  for (const severity of ["critical", "high", "medium", "low", "info"] as Severity[]) {
    const findings = report.findings.filter((finding) => finding.severity === severity);
    lines.push(`## ${capitalize(severity)} Findings`);
    lines.push("");
    if (findings.length === 0) {
      lines.push("_None._");
      lines.push("");
      continue;
    }
    for (const finding of findings) {
      renderFinding(lines, finding);
    }
  }

  lines.push("## What Was Not Assessed");
  lines.push("");
  if (report.notAssessed.length === 0) {
    lines.push(`_${buildOktaNotAssessedEmptyState(report)}_`);
  } else {
    for (const item of report.notAssessed) {
      lines.push(`- ${item}`);
    }
  }
  lines.push("");

  lines.push("## Resource Coverage");
  lines.push("");
  lines.push("| Collector | Status | Count | Required scopes | Notes |");
  lines.push("|---|---|---:|---|---|");
  for (const collector of report.collectionStatus.coverage) {
    lines.push(
      `| ${collector.collector} | ${collector.status} | ${collector.count ?? "-"} | ${(collector.requiredScopes ?? []).join(", ")} | ${escapePipes(collector.notes ?? "")} |`
    );
  }
  lines.push("");

  lines.push("## Collection Status");
  lines.push("");
  lines.push(`- Partial scan: **${report.collectionStatus.partial ? "yes" : "no"}**`);
  lines.push(
    `- Missing scopes: **${report.collectionStatus.missingScopes.length > 0 ? report.collectionStatus.missingScopes.join(", ") : "none reported"}**`
  );
  if (report.collectionStatus.failedCollectors.length > 0) {
    lines.push("- Failed / skipped collectors:");
    for (const collector of report.collectionStatus.failedCollectors) {
      lines.push(
        `  - \`${collector.collector}\` — ${collector.status}${collector.missingScopes ? ` (missing: ${collector.missingScopes.join(", ")})` : ""}: ${collector.reason}`
      );
    }
  } else {
    lines.push("- Failed / skipped collectors: none");
  }
  lines.push("");

  return lines.join("\n");
}

function renderRemediationBucket(lines: string[], bucket: OktaRemediationBucket): void {
  lines.push(`### ${bucket.name} — ${bucket.window}`);
  lines.push("");
  if (bucket.items.length === 0) {
    lines.push("_No items in this bucket._");
    lines.push("");
    return;
  }
  for (const item of bucket.items) {
    lines.push(`- **${item.findingId}** — ${item.action}`);
    lines.push(`  - Expected outcome: ${item.expectedOutcome}`);
    lines.push(`  - Effort: ${item.effort}`);
    lines.push(`  - Validation: ${item.validationStep}`);
  }
  lines.push("");
}

function renderFinding(lines: string[], finding: OktaFinding): void {
  lines.push(`### ${finding.id} — ${finding.title}`);
  lines.push("");
  lines.push(`- **Severity:** ${finding.severity}`);
  if (
    finding.productionEquivalentSeverity &&
    finding.productionEquivalentSeverity !== finding.severity
  ) {
    lines.push(`- **Production-equivalent severity:** ${finding.productionEquivalentSeverity}`);
  }
  lines.push(`- **Classification:** ${humanizeClassification(finding.classification)}`);
  lines.push(`- **Category:** ${OKTA_CATEGORY_NAMES[finding.category] ?? finding.category}`);
  lines.push(
    `- **Confidence:** ${(finding.confidence ?? "not stated")}${finding.confidenceReason ? ` — ${finding.confidenceReason}` : ""}`
  );
  lines.push(`- **Affected resources:** ${formatAffectedResources(finding)}`);
  lines.push(`- **Evidence:** ${finding.evidence}`);
  lines.push(`- **Recommendation:** ${finding.recommendation}`);
  lines.push(`- **Business risk:** ${finding.businessRisk}`);
  if (finding.oktaArea) {
    lines.push(`- **Okta dashboard area:** ${finding.oktaArea}`);
  }
  if (finding.apiHint) {
    lines.push(`- **API hint:** ${finding.apiHint}`);
  }
  if (finding.terraformHint) {
    lines.push(`- **Terraform hint:** ${finding.terraformHint}`);
  }
  if ((finding.validationSteps ?? []).length > 0) {
    lines.push(`- **Validation steps:**`);
    for (const [index, step] of (finding.validationSteps ?? []).entries()) {
      lines.push(`  ${index + 1}. ${step}`);
    }
  }
  if ((finding.falsePositiveNotes ?? []).length > 0) {
    lines.push(`- **False-positive / context notes:**`);
    for (const note of finding.falsePositiveNotes ?? []) {
      lines.push(`  - ${note}`);
    }
  }
  if ((finding.businessContextNotes ?? []).length > 0) {
    lines.push(`- **Business context notes:**`);
    for (const note of finding.businessContextNotes ?? []) {
      lines.push(`  - ${note}`);
    }
  }
  lines.push("");
}

function formatAffectedResources(finding: OktaFinding): string {
  const count = finding.affectedResourceCount ?? finding.affectedResources.length;
  if (count === 0) return "none listed";
  if (finding.affectedResources.length === 0) return `${count} total`;
  if (count > finding.affectedResources.length) {
    return `${count} total; sample: ${finding.affectedResources.join(", ")}`;
  }
  return finding.affectedResources.join(", ");
}

function humanizeClassification(classification: OktaFinding["classification"]): string {
  switch (classification) {
    case "confirmed-risk":
      return "Confirmed Risk";
    case "requires-validation":
      return "Requires Validation";
    case "advisory":
      return "Advisory / Hygiene";
    case "positive-signal":
      return "Positive Signal";
  }
}

function shouldRenderProductionEquivalent(report: OktaAnalysisReport): boolean {
  const productionEquivalent = report.score.breakdown.productionEquivalent;
  return (
    report.metadata.environment !== "production" ||
    productionEquivalent.overall !== report.score.overall ||
    productionEquivalent.grade !== report.score.grade
  );
}

function escapePipes(input: string): string {
  return input.replace(/\|/g, "\\|");
}

function capitalize(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

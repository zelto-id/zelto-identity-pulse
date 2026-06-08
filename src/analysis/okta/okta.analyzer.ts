import { randomBytes } from "crypto";
import { OktaOrgSnapshot } from "../../connectors/okta/okta.types";
import {
  BusinessContextProfile,
  buildBusinessContextAssumptions,
  buildBusinessContextFindingNotes,
  findBusinessContextDesignDecisionForFinding,
  hasBusinessContext
} from "../../core/business-context";
import { Environment } from "../../reporting/markdown/report.types";
import {
  OKTA_CATEGORY_NAMES,
  OKTA_KEY_COLLECTORS_BY_CATEGORY,
  OktaAnalysisReport,
  OktaCategoryId,
  OktaReportCategory
} from "../../reporting/markdown/okta-report.types";
import { CONNECTOR_VERSION } from "../../connectors/okta/okta.connector";
import { runAllOktaRules } from "./okta.rules";
import { adjustOktaFindings } from "./okta.severity";
import { buildOktaPartialScanImpact, scoreOktaFindings } from "./okta.scoring";
import {
  buildOktaAnalysisBoundaries,
  buildOktaPositiveSignals,
  buildOktaRemediationPlan,
  enrichOktaFindings
} from "./okta.report-support";

export function analyzeOktaSnapshot(
  snapshot: OktaOrgSnapshot,
  options: {
    environment?: Environment;
    includeIdentifiers?: boolean;
    businessContext?: BusinessContextProfile;
  } = {}
): OktaAnalysisReport {
  const environment = options.environment ?? "unknown";
  const businessContext = hasBusinessContext(options.businessContext)
    ? options.businessContext
    : undefined;
  const enrichedFindings = enrichOktaFindings(
    runAllOktaRules(snapshot, { includeIdentifiers: options.includeIdentifiers ?? false })
  );
  const adjustedFindings = adjustOktaFindings(enrichedFindings, { environment });
  const findings = applyBusinessContextToFindings(
    filterFindingsSuppressedByDesign(adjustedFindings, businessContext),
    businessContext
  );
  const scoring = scoreOktaFindings(findings, snapshot.metadata.partial, snapshot.coverage, {
    environment
  });
  const analysisBoundaries = buildOktaAnalysisBoundaries(snapshot);

  return {
    metadata: {
      orgUrl: snapshot.metadata.orgUrl,
      environment,
      generatedAt: new Date().toISOString(),
      scanId: `scan_${randomBytes(6).toString("hex")}`,
      connectorVersion: snapshot.metadata.connectorVersion ?? CONNECTOR_VERSION,
      includeIdentifiers: options.includeIdentifiers ?? false
    },
    assumptions: buildAssumptions(
      environment,
      snapshot.metadata.partial,
      businessContext
    ),
    conclusion: buildConclusion(findings.length, scoring.categories, businessContext),
    positiveSignals: buildOktaPositiveSignals(snapshot, findings),
    remediationPlan: buildOktaRemediationPlan(findings),
    analysisBoundaries,
    score: {
      overall: scoring.overall,
      grade: scoring.grade,
      maxScore: 100,
      breakdown: scoring.breakdown
    },
    categories: scoring.categories,
    findings,
    partialScanImpact: buildOktaPartialScanImpact(snapshot.metadata.partial, snapshot.coverage),
    notAssessed: buildNotAssessed(snapshot, scoring.categories),
    collectionStatus: {
      partial: snapshot.metadata.partial,
      missingScopes: snapshot.metadata.missingScopes,
      failedCollectors: snapshot.metadata.failedCollectors,
      coverage: snapshot.coverage
    },
    businessContext
  };
}

function buildAssumptions(
  environment: Environment,
  partial: boolean,
  businessContext?: BusinessContextProfile
): string[] {
  const assumptions = [
    "Findings are produced by deterministic rules over a normalized, redacted snapshot of Okta configuration. They reflect configuration posture, not full runtime or user-behavior analytics.",
    "The connector remains read-only and bounded by default for users and logs to preserve local safety and keep scans tractable on large workforce tenants.",
    "Absence of a finding means no implemented rule triggered for the observed data; it does not prove the absence of risk in uncollected or out-of-scope areas."
  ];
  if (environment === "unknown") {
    assumptions.push(
      "Org environment was not specified; risk interpretation assumes production-equivalent impact unless otherwise documented."
    );
  } else {
    assumptions.push(
      `Org environment was reported as **${environment}**; severities are adjusted for that environment while preserving production-equivalent risk in the score breakdown.`
    );
  }
  if (partial) {
    assumptions.push(
      "Scan included degraded collection. Categories whose key collectors failed, were skipped, or were missing are reported as Not Assessed (score: N/A); categories with partial key collector data remain scored with reduced confidence."
    );
  }
  assumptions.push(
    "When all configured collectors succeed, several categories may still rely on bounded or sampled analysis in the MVP rather than exhaustive relationship expansion."
  );
  assumptions.push(
    "User-level risk scoring, full assignment graphs, and long-range behavior analytics remain outside the initial Okta MVP scope."
  );
  assumptions.push(...buildBusinessContextAssumptions(businessContext));
  return assumptions;
}

function buildConclusion(
  findingCount: number,
  categories: OktaReportCategory[],
  businessContext?: BusinessContextProfile
): string[] {
  const mediumConfidence = categories.filter((category) => category.confidence === "medium");
  const lowConfidence = categories.filter((category) => category.confidence === "low");
  const lines = [
    "The Okta Workforce connector is producing usable posture data, but the analyzer is still maturing and should be read as an early signal rather than exhaustive assurance.",
    `This report evaluated ${findingCount} implemented finding(s) across ${categories.length} categories; a quiet report does not yet mean the tenant is comprehensively hardened.`
  ];

  if (mediumConfidence.length > 0 || lowConfidence.length > 0) {
    lines.push(
      `Confidence was intentionally reduced in ${mediumConfidence.length + lowConfidence.length} category(s) where the MVP still relies on bounded samples, partial evidence, or incomplete policy modeling.`
    );
  }
  if (hasBusinessContext(businessContext)) {
    lines.push(
      "Business context profile was applied deterministically to interpretation and remediation-priority language; technical evidence and rule triggering remain unchanged."
    );
  }

  lines.push(
    "The next analyzer passes should deepen Workforce-specific coverage in privileged access, authentication policy quality, assignment topology, user lifecycle hygiene, and API policy review."
  );
  return lines;
}

function applyBusinessContextToFindings(
  findings: import("../../reporting/markdown/okta-report.types").OktaFinding[],
  businessContext?: BusinessContextProfile
): import("../../reporting/markdown/okta-report.types").OktaFinding[] {
  if (!hasBusinessContext(businessContext)) return findings;
  return findings.map((finding) => {
    const notes = buildBusinessContextFindingNotes({
      provider: "okta",
      findingId: finding.id,
      category: finding.category,
      title: finding.title,
      severity: finding.severity,
      businessContext
    });
    return notes.length > 0
      ? {
          ...finding,
          businessContextNotes: notes
        }
      : finding;
  });
}

function filterFindingsSuppressedByDesign(
  findings: import("../../reporting/markdown/okta-report.types").OktaFinding[],
  businessContext?: BusinessContextProfile
): import("../../reporting/markdown/okta-report.types").OktaFinding[] {
  if (!hasBusinessContext(businessContext)) return findings;
  return findings.filter(
    (finding) =>
      !findBusinessContextDesignDecisionForFinding({
        provider: "okta",
        findingId: finding.id,
        category: finding.category,
        title: finding.title,
        businessContext,
        effect: "suppress-finding"
      })
  );
}

function buildNotAssessed(
  snapshot: OktaOrgSnapshot,
  categories: OktaReportCategory[]
): string[] {
  const items: string[] = [];
  for (const category of categories) {
    if (!category.assessed) {
      items.push(
        `${category.name} — ${category.confidenceReason} Score reported as N/A (weight ${category.weight}/100).`
      );
    }
  }

  for (const collector of (snapshot.metadata.failedCollectors ?? []).filter(
    (item) => item.status === "failed" || item.status === "skipped"
  )) {
    const category = categoryOfCollector(collector.collector);
    items.push(
      `Collector \`${collector.collector}\`${category ? ` (${category})` : ""} — ${collector.status}: ${collector.reason}`
    );
  }

  if ((snapshot.metadata.missingScopes ?? []).length > 0) {
    items.push(
      `Areas requiring missing Okta OAuth scopes: ${snapshot.metadata.missingScopes.join(", ")}.`
    );
  }
  return items;
}

function categoryOfCollector(collector: string): string | undefined {
  for (const id of Object.keys(OKTA_KEY_COLLECTORS_BY_CATEGORY) as OktaCategoryId[]) {
    if (OKTA_KEY_COLLECTORS_BY_CATEGORY[id].includes(collector)) {
      return OKTA_CATEGORY_NAMES[id];
    }
  }
  return undefined;
}

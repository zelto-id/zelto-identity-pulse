import { createHash } from "crypto";
import { Auth0TenantSnapshot } from "../../connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../connectors/okta/okta.types";
import {
  Auth0AnalysisReport,
  Confidence,
  Finding,
  Opportunity
} from "../markdown/report.types";
import {
  OktaAnalysisReport,
  OktaFinding
} from "../markdown/okta-report.types";
import {
  REPORT_CONTRACT_V1_SCHEMA_VERSION,
  ReportFindingClassification,
  ReportProviderId,
  ReportResourceKind,
  StructuredReportEvidence,
  StructuredReportFinding,
  StructuredReportOpportunity,
  StructuredReportPositiveSignal,
  StructuredReportResourceRef,
  StructuredReportV1
} from "./report-contract.types";

export function buildAuth0ReportContractV1(
  report: Auth0AnalysisReport,
  snapshot: Auth0TenantSnapshot
): StructuredReportV1 {
  const categoryConfidence = new Map(
    report.categories.map((category) => [category.id, category.confidence])
  );

  return {
    schemaVersion: REPORT_CONTRACT_V1_SCHEMA_VERSION,
    provider: {
      id: "auth0",
      product: "ciam",
      displayName: "Auth0",
      connectorVersion: report.metadata.connectorVersion,
      collectedAt: snapshot.metadata.collectedAt
    },
    tenant: {
      primaryIdentifier: snapshot.metadata.domain,
      displayName:
        snapshot.tenant?.friendly_name?.trim() || snapshot.metadata.domain,
      kind: "tenant"
    },
    environment: report.metadata.environment,
    generatedAt: report.metadata.generatedAt,
    metadata: {
      scanId: report.metadata.scanId
    },
    score: {
      overall: report.score.overall,
      grade: report.score.grade,
      maxScore: report.score.maxScore,
      breakdown: report.score.breakdown
    },
    categories: report.categories.map((category) => ({ ...category })),
    findings: report.findings.map((finding) =>
      mapAuth0Finding(finding, categoryConfidence.get(finding.category))
    ),
    opportunities: report.opportunities.map(mapOpportunity),
    coverage: {
      partial: report.collectionStatus.partial,
      missingScopes: [...report.collectionStatus.missingScopes],
      failedCollectors: [...report.collectionStatus.failedCollectors],
      collectors: [...report.collectionStatus.coverage]
    },
    assumptions: [...report.assumptions],
    limitations: uniqueStrings(report.notAssessed),
    positiveSignals: buildAuth0PositiveSignals(snapshot, report),
    remediationPlan: {
      buckets: report.remediationPlan.buckets.map((bucket) => ({
        id: bucket.id,
        name: bucket.name,
        window: bucket.window,
        items: bucket.items.map((item) => ({
          priority: item.priority,
          findingId: item.findingId,
          action: item.action,
          expectedOutcome: item.expectedOutcome,
          effort: item.effort,
          severity: item.severity
        }))
      }))
    }
  };
}

export function buildOktaReportContractV1(
  report: OktaAnalysisReport,
  snapshot: OktaOrgSnapshot
): StructuredReportV1 {
  const categoryConfidence = new Map(
    report.categories.map((category) => [category.id, category.confidence])
  );

  return {
    schemaVersion: REPORT_CONTRACT_V1_SCHEMA_VERSION,
    provider: {
      id: "okta",
      product: "workforce",
      displayName: "Okta Workforce",
      connectorVersion: report.metadata.connectorVersion,
      collectedAt: snapshot.metadata.collectedAt,
      authMode: snapshot.metadata.authMode,
      includeIdentifiers: report.metadata.includeIdentifiers
    },
    tenant: {
      primaryIdentifier: snapshot.metadata.orgUrl,
      displayName:
        snapshot.org?.companyName?.trim() || snapshot.metadata.orgUrl,
      kind: "organization"
    },
    environment: report.metadata.environment,
    generatedAt: report.metadata.generatedAt,
    metadata: {
      scanId: report.metadata.scanId
    },
    score: {
      overall: report.score.overall,
      grade: report.score.grade,
      maxScore: report.score.maxScore,
      breakdown: report.score.breakdown
    },
    categories: report.categories.map((category) => ({ ...category })),
    findings: report.findings.map((finding) =>
      mapOktaFinding(finding, categoryConfidence.get(finding.category))
    ),
    opportunities: [],
    coverage: {
      partial: report.collectionStatus.partial,
      missingScopes: [...report.collectionStatus.missingScopes],
      failedCollectors: [...report.collectionStatus.failedCollectors],
      collectors: [...report.collectionStatus.coverage]
    },
    assumptions: [...report.assumptions],
    limitations: uniqueStrings([
      ...report.notAssessed,
      ...report.analysisBoundaries
    ]),
    positiveSignals: report.positiveSignals.map((signal, index) => ({
      id: `okta-positive-${index + 1}`,
      title: signal.title,
      detail: signal.detail
    })),
    remediationPlan: {
      buckets: report.remediationPlan.buckets.map((bucket) => ({
        id: bucket.id,
        name: bucket.name,
        window: bucket.window,
        items: bucket.items.map((item) => ({
          priority: item.priority,
          findingId: item.findingId,
          action: item.action,
          expectedOutcome: item.expectedOutcome,
          effort: item.effort,
          severity: item.severity,
          validationStep: item.validationStep
        }))
      }))
    }
  };
}

export function renderReportContractV1Json(
  report: StructuredReportV1
): string {
  return JSON.stringify(report, null, 2);
}

function mapAuth0Finding(
  finding: Finding,
  categoryConfidence?: Confidence
): StructuredReportFinding {
  const confidence = finding.confidence ?? categoryConfidence ?? "medium";
  const classification = classifyAuth0Finding(finding);
  const affectedResources = buildResourceRefs(
    finding.affectedResources,
    "auth0"
  );
  const evidence = buildAuth0Evidence(finding);

  return {
    id: finding.id,
    fingerprint: buildFindingFingerprint({
      provider: "auth0",
      findingId: finding.id,
      category: finding.category,
      affectedResources,
      evidence
    }),
    title: finding.title,
    provider: "auth0",
    category: finding.category,
    severity: finding.severity,
    confidence,
    classification,
    affectedResources,
    evidence,
    businessRisk: finding.businessRisk,
    recommendation: finding.recommendation,
    validationSteps: [...(finding.validationSteps ?? [])],
    falsePositiveNotes: [...(finding.falsePositiveNotes ?? [])],
    scoreImpact: finding.scoreImpact,
    productionEquivalentSeverity: finding.productionEquivalentSeverity,
    environmentAdjustedSeverity: finding.environmentAdjustedSeverity,
    productionEquivalentScoreImpact: finding.productionEquivalentScoreImpact
  };
}

function mapOktaFinding(
  finding: OktaFinding,
  categoryConfidence?: Confidence
): StructuredReportFinding {
  const confidence = finding.confidence ?? categoryConfidence ?? "medium";
  const affectedResources = buildResourceRefs(
    finding.affectedResources,
    "okta"
  );
  const evidence: StructuredReportEvidence = {
    summary: finding.evidence,
    confidenceReason: finding.confidenceReason
  };

  return {
    id: finding.id,
    fingerprint: buildFindingFingerprint({
      provider: "okta",
      findingId: finding.id,
      category: finding.category,
      affectedResources,
      evidence
    }),
    title: finding.title,
    provider: "okta",
    category: finding.category,
    severity: finding.severity,
    confidence,
    classification: finding.classification,
    affectedResources,
    evidence,
    businessRisk: finding.businessRisk,
    recommendation: finding.recommendation,
    validationSteps: [...(finding.validationSteps ?? [])],
    falsePositiveNotes: [...(finding.falsePositiveNotes ?? [])],
    scoreImpact: finding.scoreImpact,
    productionEquivalentSeverity: finding.productionEquivalentSeverity,
    environmentAdjustedSeverity: finding.environmentAdjustedSeverity,
    productionEquivalentScoreImpact: finding.productionEquivalentScoreImpact
  };
}

function mapOpportunity(opportunity: Opportunity): StructuredReportOpportunity {
  return {
    id: opportunity.id,
    title: opportunity.title,
    category: opportunity.category,
    type: opportunity.type,
    description: opportunity.description,
    effort: opportunity.effort,
    relatedFindingId: opportunity.findingId
  };
}

function buildAuth0Evidence(finding: Finding): StructuredReportEvidence {
  return {
    summary: finding.evidence,
    observedRisks: finding.evidenceSplit?.observedRisks
      ? [...finding.evidenceSplit.observedRisks]
      : undefined,
    requiresValidation: finding.evidenceSplit?.requiresValidation
      ? [...finding.evidenceSplit.requiresValidation]
      : undefined
  };
}

function classifyAuth0Finding(
  finding: Finding
): ReportFindingClassification {
  const observedRiskCount =
    finding.evidenceSplit?.observedRisks?.length ?? 0;
  const validationCount =
    finding.evidenceSplit?.requiresValidation?.length ?? 0;

  if (observedRiskCount > 0) return "confirmed-risk";
  if (validationCount > 0) return "requires-validation";
  if (finding.severity === "info") return "advisory";
  if (
    finding.confidence === "medium" ||
    finding.confidence === "low" ||
    (finding.falsePositiveNotes?.length ?? 0) > 0
  ) {
    return "requires-validation";
  }
  return "confirmed-risk";
}

function buildAuth0PositiveSignals(
  snapshot: Auth0TenantSnapshot,
  report: Auth0AnalysisReport
): StructuredReportPositiveSignal[] {
  const signals: StructuredReportPositiveSignal[] = [];

  if (
    !snapshot.metadata.partial &&
    snapshot.metadata.missingScopes.length === 0 &&
    snapshot.metadata.failedCollectors.length === 0
  ) {
    signals.push({
      id: "auth0-collection-complete",
      title: "Collector coverage completed as configured",
      detail:
        "All configured Auth0 collectors completed without failed or skipped coverage."
    });
  }

  if (snapshot.guardian?.policy && snapshot.guardian.policy !== "never") {
    signals.push({
      id: "auth0-mfa-enabled",
      title: "Tenant MFA policy is enabled",
      detail: `Guardian policy is set to \`${snapshot.guardian.policy}\`.`
    });
  }

  const enabledProtections = [
    snapshot.attackProtection?.breached_password_detection?.enabled
      ? "breached password detection"
      : null,
    snapshot.attackProtection?.brute_force_protection?.enabled
      ? "brute-force protection"
      : null,
    snapshot.attackProtection?.suspicious_ip_throttling?.enabled
      ? "suspicious IP throttling"
      : null
  ].filter((value): value is string => Boolean(value));
  if (enabledProtections.length >= 2) {
    signals.push({
      id: "auth0-attack-protection",
      title: "Multiple attack protection controls are enabled",
      detail: `Enabled controls: ${enabledProtections.join(", ")}.`
    });
  }

  const hasActiveLogStream = (snapshot.logStreams ?? []).some((stream) =>
    ["active", "enabled", "healthy"].includes(
      String(stream.status ?? "").toLowerCase()
    )
  );
  if (hasActiveLogStream) {
    signals.push({
      id: "auth0-log-stream-active",
      title: "At least one log stream is active",
      detail:
        "Auth0 is configured to push tenant events to an external destination."
    });
  }

  const customApiWithRbac = (snapshot.resourceServers ?? []).some(
    (resourceServer) =>
      !String(resourceServer.identifier ?? "").includes("/api/v2/") &&
      resourceServer.enforce_policies === true
  );
  if (customApiWithRbac) {
    signals.push({
      id: "auth0-api-rbac",
      title: "Custom API RBAC is enabled",
      detail:
        "At least one custom API is configured with policy enforcement enabled."
    });
  }

  if (
    report.findings.every(
      (finding) =>
        finding.severity !== "critical" && finding.severity !== "high"
    )
  ) {
    signals.push({
      id: "auth0-no-major-findings",
      title: "No critical or high-severity findings observed",
      detail:
        "The implemented Auth0 rules did not detect critical or high-severity posture issues in this scan."
    });
  }

  return signals;
}

function buildResourceRefs(
  resources: string[],
  provider: ReportProviderId
): StructuredReportResourceRef[] {
  return uniqueStrings(resources).map((resource) => ({
    id: buildResourceId(provider, resource),
    kind: inferResourceKind(resource),
    displayName: resource,
    masked: isMaskedResource(resource)
  }));
}

function buildFindingFingerprint(input: {
  provider: ReportProviderId;
  findingId: string;
  category: string;
  affectedResources: StructuredReportResourceRef[];
  evidence: StructuredReportEvidence;
}): string {
  const canonicalPayload = {
    provider: input.provider,
    findingId: input.findingId,
    category: input.category,
    affectedResourceIds: input.affectedResources
      .map((resource) => resource.id)
      .sort(),
    evidenceSummary: normalizeText(input.evidence.summary),
    observedRisks: normalizedTextList(input.evidence.observedRisks),
    requiresValidation: normalizedTextList(input.evidence.requiresValidation)
  };

  return `fp_${createHash("sha256")
    .update(JSON.stringify(canonicalPayload))
    .digest("hex")
    .slice(0, 24)}`;
}

function buildResourceId(
  provider: ReportProviderId,
  resource: string
): string {
  return `res_${createHash("sha256")
    .update(`${provider}:${normalizeText(resource)}`)
    .digest("hex")
    .slice(0, 16)}`;
}

function inferResourceKind(resource: string): ReportResourceKind {
  const normalized = resource.toLowerCase();
  if (
    normalized.includes("auth0_tenant") ||
    normalized.includes("tenant") ||
    normalized.includes("org ")
  ) {
    return "tenant";
  }
  if (normalized.includes("organization")) return "organization";
  if (
    normalized.includes("client") ||
    normalized.includes("application") ||
    normalized.includes("app ")
  ) {
    return "application";
  }
  if (
    normalized.includes("resource server") ||
    normalized.includes("authorization server") ||
    normalized.includes(" api")
  ) {
    return "api";
  }
  if (normalized.includes("connection")) return "connection";
  if (normalized.includes("role")) return "role";
  if (normalized.includes("group")) return "group";
  if (
    normalized.includes("policy") ||
    normalized.includes("authenticator") ||
    normalized.includes("access rule")
  ) {
    return "policy";
  }
  if (normalized.includes("zone")) return "network-zone";
  if (
    normalized.includes("@") ||
    normalized.includes("user ") ||
    normalized.includes("login")
  ) {
    return "user";
  }
  return "generic";
}

function isMaskedResource(resource: string): boolean {
  return (
    resource.includes("***") ||
    /\bmasked\b/i.test(resource) ||
    /\bredacted\b/i.test(resource)
  );
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizedTextList(values?: string[]): string[] | undefined {
  if (!values || values.length === 0) return undefined;
  return uniqueStrings(values.map(normalizeText)).sort();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    items.push(value);
  }
  return items;
}

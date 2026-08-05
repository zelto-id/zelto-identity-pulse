import {
  REPORT_CONTRACT_V1_SCHEMA_VERSION,
  StructuredReportFinding,
  StructuredReportV1
} from "../json/report-contract.types";
import { Severity } from "../markdown/report.types";
import {
  COMBINED_SUMMARY_SCHEMA_VERSION,
  CombinedExecutiveSummaryV1,
  CombinedFindingRef,
  CombinedProviderSummary,
  CombinedRiskTheme,
  CombinedRemediationPriority,
  SeverityCounts
} from "./combined-summary.types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

const THEME_DEFINITIONS = [
  {
    id: "authentication-mfa",
    title: "Authentication and MFA",
    patterns: [
      "authentication",
      "authenticator",
      "mfa",
      "multi-factor",
      "password",
      "attack protection",
      "session"
    ]
  },
  {
    id: "application-api-authorization",
    title: "Applications, APIs, and Authorization",
    patterns: [
      "application",
      "client",
      "api",
      "oauth",
      "authorization",
      "scope",
      "rbac",
      "role"
    ]
  },
  {
    id: "privileged-access",
    title: "Privileged Access and Administration",
    patterns: ["admin", "administrator", "privileged", "super admin", "role"]
  },
  {
    id: "identity-sources-federation",
    title: "Identity Sources and Federation",
    patterns: [
      "connection",
      "federation",
      "identity source",
      "identity provider",
      "idp",
      "directory"
    ]
  },
  {
    id: "monitoring-detection",
    title: "Monitoring, Logging, and Detection",
    patterns: ["log", "logging", "monitoring", "detection", "event", "stream"]
  },
  {
    id: "user-lifecycle-access",
    title: "User Lifecycle and Access Assignments",
    patterns: ["user", "group", "assignment", "lifecycle", "joiner", "mover", "leaver"]
  },
  {
    id: "coverage-assurance",
    title: "Coverage and Assurance Gaps",
    patterns: ["coverage", "collector", "scope", "not assessed", "partial"]
  },
  {
    id: "tenant-baseline",
    title: "Tenant and Organization Baseline",
    patterns: ["tenant", "organization", "org baseline", "baseline"]
  }
] as const;

export function buildCombinedExecutiveSummary(
  reports: StructuredReportV1[]
): CombinedExecutiveSummaryV1 {
  validateReports(reports);

  const findingRefs = reports.flatMap((report) =>
    report.findings.map((finding) => toFindingRef(report, finding))
  );
  const sortedFindingRefs = [...findingRefs].sort(compareFindings);
  const providerComparison = reports.map(buildProviderSummary);
  const crossProviderRiskThemes = buildRiskThemes(sortedFindingRefs);
  const unifiedRemediationPriorities =
    buildUnifiedRemediationPriorities(crossProviderRiskThemes);
  const totalFindings = findingRefs.length;
  const scores = reports.map((report) => report.score.overall);
  const providerIds = new Set(reports.map((report) => report.provider.id));

  return {
    schemaVersion: COMBINED_SUMMARY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    reportSchemaVersion: REPORT_CONTRACT_V1_SCHEMA_VERSION,
    inputs: reports.map((report) => ({
      provider: report.provider.id,
      providerDisplayName: report.provider.displayName,
      tenantDisplayName: report.tenant.displayName,
      tenantIdentifier: report.tenant.primaryIdentifier,
      environment: report.environment,
      generatedAt: report.generatedAt,
      scanId: report.metadata.scanId,
      score: report.score.overall,
      grade: report.score.grade,
      partialCoverage: report.coverage.partial
    })),
    executiveSummary: {
      providerCount: providerIds.size,
      reportCount: reports.length,
      environments: uniqueStrings(reports.map((report) => report.environment)),
      averageScore: roundAverage(scores),
      lowestScore: Math.min(...scores),
      highestScore: Math.max(...scores),
      totalFindings,
      highestSeverity: sortedFindingRefs[0]?.severity ?? "info",
      criticalOrHighFindings: findingRefs.filter((finding) =>
        ["critical", "high"].includes(finding.severity)
      ).length,
      partialCoverage: reports.some((report) => report.coverage.partial)
    },
    providerComparison,
    crossProviderRiskThemes,
    unifiedRemediationPriorities,
    positiveSignals: reports.flatMap((report) =>
      report.positiveSignals.map((signal) => ({
        provider: report.provider.id,
        providerDisplayName: report.provider.displayName,
        title: signal.title,
        detail: signal.detail
      }))
    ),
    limitations: reports.flatMap((report) =>
      report.limitations.map((limitation) => ({
        provider: report.provider.id,
        providerDisplayName: report.provider.displayName,
        detail: limitation
      }))
    ),
    coverage: {
      partialProviderCount: reports.filter((report) => report.coverage.partial)
        .length,
      totalProviders: reports.length,
      missingScopesByProvider: reports
        .filter((report) => report.coverage.missingScopes.length > 0)
        .map((report) => ({
          provider: report.provider.id,
          providerDisplayName: report.provider.displayName,
          missingScopes: [...report.coverage.missingScopes].sort()
        })),
      failedCollectorsByProvider: reports
        .filter((report) => report.coverage.failedCollectors.length > 0)
        .map((report) => ({
          provider: report.provider.id,
          providerDisplayName: report.provider.displayName,
          failedCollectors: report.coverage.failedCollectors.length
        }))
    },
    methodology: [
      "This summary combines local Report Contract v1 JSON outputs and does not contact identity providers.",
      "Findings are grouped deterministically by provider, severity, category, and stable finding identifiers.",
      "Unified priorities are derived from severity, score impact, provider breadth, and existing deterministic recommendations.",
      "Provider-specific evidence remains traceable through finding IDs and fingerprints."
    ],
    warnings: buildWarnings(reports)
  };
}

export function renderCombinedExecutiveSummaryJson(
  summary: CombinedExecutiveSummaryV1
): string {
  return JSON.stringify(summary, null, 2);
}

function validateReports(reports: StructuredReportV1[]): void {
  if (!Array.isArray(reports) || reports.length < 2) {
    throw new Error("Combined summary requires at least two structured reports.");
  }

  reports.forEach((report, index) => {
    const label = `report ${index + 1}`;
    if (!report || typeof report !== "object") {
      throw new Error(`${label} is not a structured report object.`);
    }
    if (report.schemaVersion !== REPORT_CONTRACT_V1_SCHEMA_VERSION) {
      throw new Error(
        `${label} schemaVersion must be ${REPORT_CONTRACT_V1_SCHEMA_VERSION}; received ${String(report.schemaVersion)}.`
      );
    }
    if (!report.provider?.id || !report.tenant?.primaryIdentifier) {
      throw new Error(`${label} is missing provider or tenant metadata.`);
    }
    if (!Array.isArray(report.findings) || !Array.isArray(report.categories)) {
      throw new Error(`${label} is missing findings or categories.`);
    }
  });
}

function buildProviderSummary(
  report: StructuredReportV1
): CombinedProviderSummary {
  const findingRefs = report.findings
    .map((finding) => toFindingRef(report, finding))
    .sort(compareFindings);

  return {
    provider: report.provider.id,
    providerDisplayName: report.provider.displayName,
    product: report.provider.product,
    tenantDisplayName: report.tenant.displayName,
    tenantIdentifier: report.tenant.primaryIdentifier,
    environment: report.environment,
    score: report.score.overall,
    grade: report.score.grade,
    findingCounts: countSeverities(findingRefs),
    totalFindings: findingRefs.length,
    topFindings: findingRefs.slice(0, 5),
    categoryScores: report.categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        score: category.score,
        assessed: category.assessed,
        confidence: category.confidence,
        findings: category.findings
      }))
      .sort((a, b) => {
        const aScore = a.score ?? -1;
        const bScore = b.score ?? -1;
        if (aScore !== bScore) return aScore - bScore;
        return b.findings - a.findings || a.name.localeCompare(b.name);
      }),
    coverage: {
      partial: report.coverage.partial,
      missingScopes: [...report.coverage.missingScopes].sort(),
      failedCollectors: report.coverage.failedCollectors.length,
      collectorCount: report.coverage.collectors.length
    }
  };
}

function toFindingRef(
  report: StructuredReportV1,
  finding: StructuredReportFinding
): CombinedFindingRef {
  return {
    provider: report.provider.id,
    providerDisplayName: report.provider.displayName,
    tenantDisplayName: report.tenant.displayName,
    id: finding.id,
    fingerprint: finding.fingerprint,
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    confidence: finding.confidence,
    classification: finding.classification,
    scoreImpact: finding.scoreImpact,
    affectedResourceCount: finding.affectedResources.length,
    affectedResourceSamples: finding.affectedResources.slice(0, 3).map((resource) => ({
      kind: resource.kind,
      displayName: resource.displayName,
      masked: resource.masked
    })),
    businessRisk: finding.businessRisk,
    recommendation: finding.recommendation,
    validationSteps: [...finding.validationSteps]
  };
}

function buildRiskThemes(findings: CombinedFindingRef[]): CombinedRiskTheme[] {
  const groups = new Map<string, CombinedFindingRef[]>();

  for (const finding of findings) {
    const theme = classifyTheme(finding);
    const group = groups.get(theme.id) ?? [];
    group.push(finding);
    groups.set(theme.id, group);
  }

  return Array.from(groups.entries())
    .map(([themeId, groupFindings]) => {
      const sortedFindings = [...groupFindings].sort(compareFindings);
      const definition = themeDefinitionById(themeId);
      const providers = uniqueStrings(
        sortedFindings.map((finding) => finding.providerDisplayName)
      );
      const categories = uniqueStrings(sortedFindings.map((finding) => finding.category));
      const topFinding = sortedFindings[0];

      return {
        id: themeId,
        title: definition.title,
        severity: topFinding.severity,
        providerCount: providers.length,
        findingCount: sortedFindings.length,
        totalScoreImpact: sortedFindings.reduce(
          (sum, finding) => sum + finding.scoreImpact,
          0
        ),
        providers,
        categories,
        summary: topFinding.businessRisk,
        recommendation: topFinding.recommendation,
        findings: sortedFindings
      };
    })
    .sort(compareThemes);
}

function buildUnifiedRemediationPriorities(
  themes: CombinedRiskTheme[]
): CombinedRemediationPriority[] {
  const priorityThemes = themes
    .filter((theme) => SEVERITY_RANK[theme.severity] >= SEVERITY_RANK.medium)
    .slice(0, 8);

  return priorityThemes.map((theme, index) => {
    const topFindings = theme.findings.slice(0, 5);
    const actions = uniqueStrings(
      topFindings.map((finding) => firstSentence(finding.recommendation))
    ).slice(0, 4);
    const expectedOutcomes = uniqueStrings(
      topFindings.flatMap((finding) =>
        finding.validationSteps.length > 0
          ? finding.validationSteps.slice(0, 1)
          : [`Validate remediation for ${finding.id}.`]
      )
    ).slice(0, 4);

    return {
      priority: index + 1,
      themeId: theme.id,
      title: `Address ${theme.title.toLowerCase()}`,
      severity: theme.severity,
      providers: theme.providers,
      rationale: `${theme.findingCount} finding(s) across ${theme.providerCount} provider report(s), with ${theme.totalScoreImpact} total score-impact points.`,
      actions,
      expectedOutcomes,
      relatedFindings: topFindings
    };
  });
}

function classifyTheme(finding: CombinedFindingRef): { id: string; title: string } {
  const haystack = [
    finding.title,
    finding.category,
    finding.businessRisk,
    finding.recommendation
  ]
    .join(" ")
    .toLowerCase();

  for (const definition of THEME_DEFINITIONS) {
    if (definition.patterns.some((pattern) => haystack.includes(pattern))) {
      return definition;
    }
  }

  const fallbackId = `category-${slugify(finding.category)}`;
  return {
    id: fallbackId,
    title: titleCase(finding.category)
  };
}

function themeDefinitionById(themeId: string): { id: string; title: string } {
  return (
    THEME_DEFINITIONS.find((definition) => definition.id === themeId) ?? {
      id: themeId,
      title: titleCase(themeId.replace(/^category-/, "").replace(/-/g, " "))
    }
  );
}

function buildWarnings(reports: StructuredReportV1[]): string[] {
  const warnings: string[] = [];
  const schemaVersions = new Set(reports.map((report) => report.schemaVersion));
  const environments = new Set(reports.map((report) => report.environment));

  if (schemaVersions.size > 1) {
    warnings.push("Input report schema versions differ; summary remains best-effort.");
  }
  if (environments.size > 1) {
    warnings.push(
      "Input reports use different environment labels; compare severity and score interpretation carefully."
    );
  }
  if (reports.some((report) => report.coverage.partial)) {
    warnings.push(
      "One or more input reports had partial collection coverage; absence of findings is not complete assurance."
    );
  }

  return warnings;
}

function countSeverities(findings: CombinedFindingRef[]): SeverityCounts {
  const counts = Object.fromEntries(
    SEVERITIES.map((severity) => [severity, 0])
  ) as SeverityCounts;

  for (const finding of findings) {
    counts[finding.severity] += 1;
  }

  return counts;
}

function compareFindings(
  a: Pick<CombinedFindingRef, "severity" | "scoreImpact" | "title" | "id">,
  b: Pick<CombinedFindingRef, "severity" | "scoreImpact" | "title" | "id">
): number {
  return (
    SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
    b.scoreImpact - a.scoreImpact ||
    a.title.localeCompare(b.title) ||
    a.id.localeCompare(b.id)
  );
}

function compareThemes(a: CombinedRiskTheme, b: CombinedRiskTheme): number {
  return (
    SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
    b.providerCount - a.providerCount ||
    b.totalScoreImpact - a.totalScoreImpact ||
    b.findingCount - a.findingCount ||
    a.title.localeCompare(b.title)
  );
}

function roundAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function firstSentence(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return match?.[1] ?? trimmed;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

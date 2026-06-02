import { CollectorStatus } from "../../core/schema";
import { Grade, Severity } from "../markdown/report.types";
import {
  REPORT_CONTRACT_V1_SCHEMA_VERSION,
  StructuredReportCategory,
  StructuredReportFinding,
  StructuredReportV1
} from "../json/report-contract.types";
import {
  CategoryDelta,
  CollectorCoverageDelta,
  DELTA_REPORT_SCHEMA_VERSION,
  DeltaDirection,
  FindingDelta,
  FindingDeltaStatus,
  StructuredDeltaReportV1
} from "./delta.types";

const DELTA_ENGINE_VERSION = "1.0.0" as const;

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

export function compareStructuredReports(
  before: StructuredReportV1,
  after: StructuredReportV1
): StructuredDeltaReportV1 {
  validateReportContract(before, "before");
  validateReportContract(after, "after");

  if (before.provider.id !== after.provider.id) {
    throw new Error(
      `Cannot compare different providers: before=${before.provider.id}, after=${after.provider.id}.`
    );
  }

  const warnings = buildWarnings(before, after);
  const findingDeltas = compareFindings(before.findings, after.findings);
  const coverage = compareCoverage(before, after);
  const summary = {
    scoreChange: after.score.overall - before.score.overall,
    newFindings: findingDeltas.new.length,
    resolvedFindings: findingDeltas.resolved.length,
    unchangedFindings: findingDeltas.unchanged.length,
    worsenedFindings: findingDeltas.worsened.length,
    improvedFindings: findingDeltas.improved.length,
    coverageChanged:
      coverage.partialChanged ||
      coverage.missingScopes.added.length > 0 ||
      coverage.missingScopes.removed.length > 0 ||
      coverage.collectors.some(
        (collector) =>
          collector.statusChanged ||
          (collector.countChange !== null && collector.countChange !== 0)
      )
  };

  return {
    schemaVersion: DELTA_REPORT_SCHEMA_VERSION,
    deltaEngineVersion: DELTA_ENGINE_VERSION,
    reportSchemaVersion: before.schemaVersion,
    provider: {
      id: before.provider.id,
      product: before.provider.product,
      displayName: before.provider.displayName
    },
    tenant: after.tenant,
    environment: {
      before: before.environment,
      after: after.environment
    },
    comparison: {
      before: buildInputRef(before),
      after: buildInputRef(after),
      warnings
    },
    summary,
    score: {
      before: before.score.overall,
      after: after.score.overall,
      change: after.score.overall - before.score.overall,
      direction: direction(after.score.overall - before.score.overall),
      gradeBefore: before.score.grade,
      gradeAfter: after.score.grade
    },
    categories: compareCategories(before.categories, after.categories),
    findings: findingDeltas,
    coverage
  };
}

export function renderDeltaReportJson(report: StructuredDeltaReportV1): string {
  return JSON.stringify(report, null, 2);
}

function validateReportContract(report: StructuredReportV1, label: string): void {
  if (!report || typeof report !== "object") {
    throw new Error(`${label} report is not a structured report object.`);
  }
  if (report.schemaVersion !== REPORT_CONTRACT_V1_SCHEMA_VERSION) {
    throw new Error(
      `${label} report schemaVersion must be ${REPORT_CONTRACT_V1_SCHEMA_VERSION}; received ${String(report.schemaVersion)}.`
    );
  }
  if (!report.provider?.id || !report.tenant?.primaryIdentifier) {
    throw new Error(`${label} report is missing provider or tenant metadata.`);
  }
  if (!Array.isArray(report.findings) || !Array.isArray(report.categories)) {
    throw new Error(`${label} report is missing findings or categories.`);
  }
}

function buildWarnings(
  before: StructuredReportV1,
  after: StructuredReportV1
): string[] {
  const warnings: string[] = [];
  if (before.tenant.primaryIdentifier !== after.tenant.primaryIdentifier) {
    warnings.push(
      "Tenant identifiers differ; review whether this is a valid before/after comparison."
    );
  }
  if (before.environment !== after.environment) {
    warnings.push(
      "Environment labels differ; severity and score movement may reflect environment calibration changes."
    );
  }
  if (before.schemaVersion !== after.schemaVersion) {
    warnings.push(
      "Report schema versions differ; comparison remains best-effort."
    );
  }
  return warnings;
}

function buildInputRef(report: StructuredReportV1) {
  return {
    schemaVersion: report.schemaVersion,
    generatedAt: report.generatedAt,
    scanId: report.metadata.scanId,
    score: report.score.overall,
    grade: report.score.grade,
    partialCoverage: report.coverage.partial
  };
}

function compareFindings(
  beforeFindings: StructuredReportFinding[],
  afterFindings: StructuredReportFinding[]
): StructuredDeltaReportV1["findings"] {
  const afterByFingerprint = new Map(
    afterFindings.map((finding) => [finding.fingerprint, finding])
  );
  const matchedAfterFingerprints = new Set<string>();

  const grouped: StructuredDeltaReportV1["findings"] = {
    new: [],
    resolved: [],
    unchanged: [],
    worsened: [],
    improved: []
  };

  for (const before of beforeFindings) {
    const after = afterByFingerprint.get(before.fingerprint);
    if (!after) {
      grouped.resolved.push(buildFindingDelta("resolved", before, undefined));
      continue;
    }

    matchedAfterFingerprints.add(after.fingerprint);
    const status = classifyMatchedFinding(before, after);
    grouped[status].push(buildFindingDelta(status, before, after));
  }

  for (const after of afterFindings) {
    if (!matchedAfterFingerprints.has(after.fingerprint)) {
      grouped.new.push(buildFindingDelta("new", undefined, after));
    }
  }

  for (const key of Object.keys(grouped) as Array<keyof typeof grouped>) {
    grouped[key] = grouped[key].sort(compareFindingDeltas);
  }

  return grouped;
}

function classifyMatchedFinding(
  before: StructuredReportFinding,
  after: StructuredReportFinding
): "unchanged" | "worsened" | "improved" {
  const severityChange =
    SEVERITY_RANK[after.severity] - SEVERITY_RANK[before.severity];
  const scoreImpactChange = after.scoreImpact - before.scoreImpact;

  if (severityChange > 0 || scoreImpactChange > 0) return "worsened";
  if (severityChange < 0 || scoreImpactChange < 0) return "improved";
  return "unchanged";
}

function buildFindingDelta(
  status: FindingDeltaStatus,
  before?: StructuredReportFinding,
  after?: StructuredReportFinding
): FindingDelta {
  const finding = after ?? before;
  if (!finding) {
    throw new Error("Cannot build finding delta without a finding.");
  }

  const scoreImpactBefore = before?.scoreImpact;
  const scoreImpactAfter = after?.scoreImpact;
  return {
    status,
    fingerprint: finding.fingerprint,
    id: finding.id,
    title: finding.title,
    category: finding.category,
    before,
    after,
    severityBefore: before?.severity,
    severityAfter: after?.severity,
    scoreImpactBefore,
    scoreImpactAfter,
    scoreImpactChange:
      scoreImpactBefore !== undefined && scoreImpactAfter !== undefined
        ? scoreImpactAfter - scoreImpactBefore
        : undefined,
    changedFields: before && after ? changedFindingFields(before, after) : []
  };
}

function changedFindingFields(
  before: StructuredReportFinding,
  after: StructuredReportFinding
): string[] {
  const changed: string[] = [];
  for (const field of [
    "severity",
    "confidence",
    "classification",
    "scoreImpact",
    "businessRisk",
    "recommendation"
  ] as const) {
    if (before[field] !== after[field]) changed.push(field);
  }
  if (JSON.stringify(before.evidence) !== JSON.stringify(after.evidence)) {
    changed.push("evidence");
  }
  return changed;
}

function compareCategories(
  beforeCategories: StructuredReportCategory[],
  afterCategories: StructuredReportCategory[]
): CategoryDelta[] {
  const ids = new Set([
    ...beforeCategories.map((category) => category.id),
    ...afterCategories.map((category) => category.id)
  ]);
  const beforeById = new Map(beforeCategories.map((category) => [category.id, category]));
  const afterById = new Map(afterCategories.map((category) => [category.id, category]));

  return [...ids]
    .sort()
    .map((id) => {
      const before = beforeById.get(id);
      const after = afterById.get(id);
      const scoreChange =
        before?.score !== null &&
        before?.score !== undefined &&
        after?.score !== null &&
        after?.score !== undefined
          ? after.score - before.score
          : null;

      return {
        id,
        name: after?.name ?? before?.name ?? id,
        before: before ? pickCategory(before) : undefined,
        after: after ? pickCategory(after) : undefined,
        scoreChange,
        status: classifyCategoryDelta(before, after)
      };
    });
}

function pickCategory(category: StructuredReportCategory): CategoryDelta["before"] {
  return {
    score: category.score,
    assessed: category.assessed,
    confidence: category.confidence,
    findings: category.findings
  };
}

function classifyCategoryDelta(
  before?: StructuredReportCategory,
  after?: StructuredReportCategory
): CategoryDelta["status"] {
  if (!before && after) return "new";
  if (before && !after) return "removed";
  if (!before || !after) return "unchanged";
  if (!before.assessed && after.assessed) return "now-assessed";
  if (before.assessed && !after.assessed) return "now-not-assessed";
  if (before.score === null || after.score === null) return "unchanged";
  if (after.score > before.score) return "improved";
  if (after.score < before.score) return "worsened";
  return "unchanged";
}

function compareCoverage(before: StructuredReportV1, after: StructuredReportV1) {
  const beforeScopes = before.coverage.missingScopes;
  const afterScopes = after.coverage.missingScopes;
  const beforeScopeSet = new Set(beforeScopes);
  const afterScopeSet = new Set(afterScopes);

  return {
    partialBefore: before.coverage.partial,
    partialAfter: after.coverage.partial,
    partialChanged: before.coverage.partial !== after.coverage.partial,
    missingScopes: {
      added: afterScopes.filter((scope) => !beforeScopeSet.has(scope)).sort(),
      removed: beforeScopes.filter((scope) => !afterScopeSet.has(scope)).sort(),
      unchanged: afterScopes.filter((scope) => beforeScopeSet.has(scope)).sort()
    },
    collectors: compareCollectors(before, after)
  };
}

function compareCollectors(
  before: StructuredReportV1,
  after: StructuredReportV1
): CollectorCoverageDelta[] {
  const beforeByName = new Map(
    before.coverage.collectors.map((collector) => [collector.collector, collector])
  );
  const afterByName = new Map(
    after.coverage.collectors.map((collector) => [collector.collector, collector])
  );
  const names = new Set([...beforeByName.keys(), ...afterByName.keys()]);

  return [...names]
    .sort()
    .map((collector) => {
      const beforeCollector = beforeByName.get(collector);
      const afterCollector = afterByName.get(collector);
      const beforeCount = beforeCollector?.count;
      const afterCount = afterCollector?.count;
      return {
        collector,
        before: beforeCollector
          ? {
              status: beforeCollector.status as CollectorStatus,
              count: beforeCount
            }
          : undefined,
        after: afterCollector
          ? {
              status: afterCollector.status as CollectorStatus,
              count: afterCount
            }
          : undefined,
        statusChanged: beforeCollector?.status !== afterCollector?.status,
        countChange:
          beforeCount !== undefined && afterCount !== undefined
            ? afterCount - beforeCount
            : null
      };
    });
}

function direction(change: number): DeltaDirection {
  if (change > 0) return "improved";
  if (change < 0) return "worsened";
  return "unchanged";
}

function compareFindingDeltas(a: FindingDelta, b: FindingDelta): number {
  return (
    SEVERITY_RANK[b.severityAfter ?? b.severityBefore ?? "info"] -
      SEVERITY_RANK[a.severityAfter ?? a.severityBefore ?? "info"] ||
    a.id.localeCompare(b.id) ||
    a.fingerprint.localeCompare(b.fingerprint)
  );
}

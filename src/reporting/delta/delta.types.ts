import { CollectorStatus } from "../../core/schema";
import { Grade, Severity } from "../markdown/report.types";
import {
  ReportProviderId,
  StructuredReportCategory,
  StructuredReportFinding,
  StructuredReportV1
} from "../json/report-contract.types";

export const DELTA_REPORT_SCHEMA_VERSION = "1.0.0" as const;

export type DeltaReportSchemaVersion = typeof DELTA_REPORT_SCHEMA_VERSION;
export type DeltaDirection = "improved" | "worsened" | "unchanged";
export type FindingDeltaStatus =
  | "new"
  | "resolved"
  | "unchanged"
  | "worsened"
  | "improved";
export type CategoryDeltaStatus =
  | "new"
  | "removed"
  | "improved"
  | "worsened"
  | "unchanged"
  | "now-assessed"
  | "now-not-assessed";

export interface ReportDeltaInputRef {
  schemaVersion: string;
  generatedAt: string;
  scanId: string;
  score: number;
  grade: Grade;
  partialCoverage: boolean;
}

export interface ScoreDelta {
  before: number;
  after: number;
  change: number;
  direction: DeltaDirection;
  gradeBefore: Grade;
  gradeAfter: Grade;
}

export interface CategoryDelta {
  id: string;
  name: string;
  before?: Pick<
    StructuredReportCategory,
    "score" | "assessed" | "confidence" | "findings"
  >;
  after?: Pick<
    StructuredReportCategory,
    "score" | "assessed" | "confidence" | "findings"
  >;
  scoreChange: number | null;
  status: CategoryDeltaStatus;
}

export interface FindingDelta {
  status: FindingDeltaStatus;
  fingerprint: string;
  id: string;
  title: string;
  category: string;
  before?: StructuredReportFinding;
  after?: StructuredReportFinding;
  severityBefore?: Severity;
  severityAfter?: Severity;
  scoreImpactBefore?: number;
  scoreImpactAfter?: number;
  scoreImpactChange?: number;
  changedFields: string[];
}

export interface CollectorCoverageDelta {
  collector: string;
  before?: {
    status: CollectorStatus;
    count?: number;
  };
  after?: {
    status: CollectorStatus;
    count?: number;
  };
  statusChanged: boolean;
  countChange: number | null;
}

export interface CoverageDelta {
  partialBefore: boolean;
  partialAfter: boolean;
  partialChanged: boolean;
  missingScopes: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };
  collectors: CollectorCoverageDelta[];
}

export interface DeltaSummary {
  scoreChange: number;
  newFindings: number;
  resolvedFindings: number;
  unchangedFindings: number;
  worsenedFindings: number;
  improvedFindings: number;
  coverageChanged: boolean;
}

export interface StructuredDeltaReportV1 {
  schemaVersion: DeltaReportSchemaVersion;
  deltaEngineVersion: "1.0.0";
  reportSchemaVersion: string;
  provider: {
    id: ReportProviderId;
    product: string;
    displayName: string;
  };
  tenant: StructuredReportV1["tenant"];
  environment: {
    before: StructuredReportV1["environment"];
    after: StructuredReportV1["environment"];
  };
  comparison: {
    before: ReportDeltaInputRef;
    after: ReportDeltaInputRef;
    warnings: string[];
  };
  summary: DeltaSummary;
  score: ScoreDelta;
  categories: CategoryDelta[];
  findings: {
    new: FindingDelta[];
    resolved: FindingDelta[];
    unchanged: FindingDelta[];
    worsened: FindingDelta[];
    improved: FindingDelta[];
  };
  coverage: CoverageDelta;
}

import { Severity } from "../markdown/report.types";
import {
  ReportFindingClassification,
  ReportProviderId,
  StructuredReportV1
} from "../json/report-contract.types";

export const COMBINED_SUMMARY_SCHEMA_VERSION = "1.0.0" as const;

export type CombinedSummarySchemaVersion =
  typeof COMBINED_SUMMARY_SCHEMA_VERSION;

export interface CombinedReportInputRef {
  provider: ReportProviderId;
  providerDisplayName: string;
  tenantDisplayName: string;
  tenantIdentifier: string;
  environment: StructuredReportV1["environment"];
  generatedAt: string;
  scanId: string;
  score: number;
  grade: StructuredReportV1["score"]["grade"];
  partialCoverage: boolean;
}

export type SeverityCounts = Record<Severity, number>;

export interface CombinedProviderSummary {
  provider: ReportProviderId;
  providerDisplayName: string;
  product: string;
  tenantDisplayName: string;
  tenantIdentifier: string;
  environment: StructuredReportV1["environment"];
  score: number;
  grade: StructuredReportV1["score"]["grade"];
  findingCounts: SeverityCounts;
  totalFindings: number;
  topFindings: CombinedFindingRef[];
  categoryScores: Array<{
    id: string;
    name: string;
    score: number | null;
    assessed: boolean;
    confidence: StructuredReportV1["categories"][number]["confidence"];
    findings: number;
  }>;
  coverage: {
    partial: boolean;
    missingScopes: string[];
    failedCollectors: number;
    collectorCount: number;
  };
}

export interface CombinedFindingRef {
  provider: ReportProviderId;
  providerDisplayName: string;
  tenantDisplayName: string;
  id: string;
  fingerprint: string;
  title: string;
  category: string;
  severity: Severity;
  confidence: StructuredReportV1["findings"][number]["confidence"];
  classification: ReportFindingClassification;
  scoreImpact: number;
  affectedResourceCount: number;
  affectedResourceSamples: Array<{
    kind: string;
    displayName: string;
    masked: boolean;
  }>;
  businessRisk: string;
  recommendation: string;
  validationSteps: string[];
}

export interface CombinedRiskTheme {
  id: string;
  title: string;
  severity: Severity;
  providerCount: number;
  findingCount: number;
  totalScoreImpact: number;
  providers: string[];
  categories: string[];
  summary: string;
  recommendation: string;
  findings: CombinedFindingRef[];
}

export interface CombinedRemediationPriority {
  priority: number;
  themeId: string;
  title: string;
  severity: Severity;
  providers: string[];
  rationale: string;
  actions: string[];
  expectedOutcomes: string[];
  relatedFindings: CombinedFindingRef[];
}

export interface CombinedPositiveSignal {
  provider: ReportProviderId;
  providerDisplayName: string;
  title: string;
  detail: string;
}

export interface CombinedLimitation {
  provider: ReportProviderId;
  providerDisplayName: string;
  detail: string;
}

export interface CombinedCoverageSummary {
  partialProviderCount: number;
  totalProviders: number;
  missingScopesByProvider: Array<{
    provider: ReportProviderId;
    providerDisplayName: string;
    missingScopes: string[];
  }>;
  failedCollectorsByProvider: Array<{
    provider: ReportProviderId;
    providerDisplayName: string;
    failedCollectors: number;
  }>;
}

export interface CombinedExecutiveSummaryV1 {
  schemaVersion: CombinedSummarySchemaVersion;
  generatedAt: string;
  reportSchemaVersion: string;
  inputs: CombinedReportInputRef[];
  executiveSummary: {
    providerCount: number;
    reportCount: number;
    environments: string[];
    averageScore: number;
    lowestScore: number;
    highestScore: number;
    totalFindings: number;
    highestSeverity: Severity;
    criticalOrHighFindings: number;
    partialCoverage: boolean;
  };
  providerComparison: CombinedProviderSummary[];
  crossProviderRiskThemes: CombinedRiskTheme[];
  unifiedRemediationPriorities: CombinedRemediationPriority[];
  positiveSignals: CombinedPositiveSignal[];
  limitations: CombinedLimitation[];
  coverage: CombinedCoverageSummary;
  methodology: string[];
  warnings: string[];
}

import { CollectorFailure, ResourceCoverage } from "../../core/schema";
import { Confidence, Environment, Grade, Severity } from "../markdown/report.types";
import { OktaFindingClassification } from "../markdown/okta-report.types";

export const REPORT_CONTRACT_V1_SCHEMA_VERSION = "1.0.0" as const;

export type ReportContractSchemaVersion =
  typeof REPORT_CONTRACT_V1_SCHEMA_VERSION;
export type ReportProviderId = "auth0" | "okta";
export type ReportFindingClassification = OktaFindingClassification;
export type ReportResourceKind =
  | "tenant"
  | "organization"
  | "application"
  | "api"
  | "connection"
  | "role"
  | "user"
  | "group"
  | "policy"
  | "network-zone"
  | "generic";

export interface StructuredReportResourceRef {
  id: string;
  kind: ReportResourceKind;
  displayName: string;
  masked: boolean;
}

export interface StructuredReportEvidence {
  summary: string;
  observedRisks?: string[];
  requiresValidation?: string[];
  confidenceReason?: string;
}

export interface StructuredReportFinding {
  id: string;
  fingerprint: string;
  title: string;
  provider: ReportProviderId;
  category: string;
  severity: Severity;
  confidence: Confidence;
  classification: ReportFindingClassification;
  affectedResources: StructuredReportResourceRef[];
  evidence: StructuredReportEvidence;
  businessRisk: string;
  recommendation: string;
  validationSteps: string[];
  falsePositiveNotes: string[];
  scoreImpact: number;
  productionEquivalentSeverity?: Severity;
  environmentAdjustedSeverity?: Severity;
  productionEquivalentScoreImpact?: number;
}

export interface StructuredReportOpportunity {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  effort: "low" | "medium" | "high";
  relatedFindingId?: string;
}

export interface StructuredReportCategory {
  id: string;
  name: string;
  weight: number;
  score: number | null;
  assessed: boolean;
  findings: number;
  confidence: Confidence;
  confidenceReason: string;
}

export interface StructuredReportScore {
  overall: number;
  grade: Grade;
  maxScore: 100;
  breakdown: unknown;
}

export interface StructuredReportPositiveSignal {
  id: string;
  title: string;
  detail: string;
}

export interface StructuredReportCoverage {
  partial: boolean;
  missingScopes: string[];
  failedCollectors: CollectorFailure[];
  collectors: ResourceCoverage[];
}

export interface StructuredReportRemediationPlan {
  buckets: Array<{
    id: string;
    name: string;
    window: string;
    items: Array<{
      priority: number;
      findingId: string;
      action: string;
      expectedOutcome: string;
      effort: "low" | "medium" | "high";
      severity?: Severity;
      validationStep?: string;
    }>;
  }>;
}

export interface StructuredReportV1 {
  schemaVersion: ReportContractSchemaVersion;
  provider: {
    id: ReportProviderId;
    product: string;
    displayName: string;
    connectorVersion: string;
    collectedAt: string;
    authMode?: string;
    includeIdentifiers?: boolean;
  };
  tenant: {
    primaryIdentifier: string;
    displayName: string;
    kind: "tenant" | "organization";
  };
  environment: Environment;
  generatedAt: string;
  metadata: {
    scanId: string;
  };
  score: StructuredReportScore;
  categories: StructuredReportCategory[];
  findings: StructuredReportFinding[];
  opportunities: StructuredReportOpportunity[];
  coverage: StructuredReportCoverage;
  assumptions: string[];
  limitations: string[];
  positiveSignals: StructuredReportPositiveSignal[];
  remediationPlan: StructuredReportRemediationPlan;
}

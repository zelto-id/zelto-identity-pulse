import { CollectorFailure, ResourceCoverage } from "../../core/schema";
import { BusinessContextProfile } from "../../core/business-context";
import { Confidence, Environment, Grade, RemediationBucketId, Severity } from "./report.types";

export type OktaFindingClassification =
  | "confirmed-risk"
  | "requires-validation"
  | "advisory"
  | "positive-signal";

export interface OktaRemediationItem {
  priority: number;
  findingId: string;
  action: string;
  expectedOutcome: string;
  effort: "low" | "medium" | "high";
  severity?: Severity;
  validationStep: string;
}

export interface OktaRemediationBucket {
  id: RemediationBucketId;
  name: string;
  window: string;
  items: OktaRemediationItem[];
}

export interface OktaRemediationPlan {
  buckets: OktaRemediationBucket[];
}

export interface OktaPositiveSignal {
  title: string;
  detail: string;
}

export interface OktaRemediationDescriptor {
  bucketId: RemediationBucketId;
  action: string;
  expectedOutcome: string;
  effort: "low" | "medium" | "high";
  validationStep: string;
}

export interface OktaFinding {
  id: string;
  title: string;
  severity: Severity;
  classification: OktaFindingClassification;
  productionEquivalentSeverity?: Severity;
  environmentAdjustedSeverity?: Severity;
  environmentAdjustmentReason?: string;
  category: OktaCategoryId;
  scoreImpact: number;
  productionEquivalentScoreImpact?: number;
  affectedResources: string[];
  affectedResourceCount?: number;
  evidence: string;
  recommendation: string;
  businessRisk: string;
  oktaArea?: string;
  confidence?: Confidence;
  confidenceReason?: string;
  apiHint?: string;
  terraformHint?: string;
  validationSteps?: string[];
  falsePositiveNotes?: string[];
  businessContextNotes?: string[];
  remediation?: OktaRemediationDescriptor;
}

export interface OktaReportCategory {
  id: OktaCategoryId;
  name: string;
  weight: number;
  score: number | null;
  assessed: boolean;
  findings: number;
  confidence: Confidence;
  confidenceReason: string;
}

export interface OktaScoreBreakdown {
  observedScore: number;
  assessedMaxPoints: number;
  normalizedScore: number;
  unassessedWeight: number;
  productionEquivalent: {
    observedScore: number;
    normalizedScore: number;
    overall: number;
    grade: Grade;
  };
  environmentAdjustedInterpretation: string;
}

export interface OktaCategoryImpact {
  categoryId: OktaCategoryId;
  categoryName: string;
  affectedCollectors: string[];
}

export interface OktaPartialScanImpact {
  partial: boolean;
  affectedCategories: OktaCategoryImpact[];
}

export interface OktaAnalysisReport {
  metadata: {
    orgUrl: string;
    environment: Environment;
    generatedAt: string;
    scanId: string;
    connectorVersion: string;
    includeIdentifiers: boolean;
  };
  assumptions: string[];
  conclusion: string[];
  positiveSignals: OktaPositiveSignal[];
  remediationPlan: OktaRemediationPlan;
  analysisBoundaries: string[];
  score: {
    overall: number;
    grade: Grade;
    maxScore: 100;
    breakdown: OktaScoreBreakdown;
  };
  categories: OktaReportCategory[];
  findings: OktaFinding[];
  partialScanImpact: OktaPartialScanImpact;
  notAssessed: string[];
  collectionStatus: {
    partial: boolean;
    missingScopes: string[];
    failedCollectors: CollectorFailure[];
    coverage: ResourceCoverage[];
  };
  businessContext?: BusinessContextProfile;
}

export const OKTA_CATEGORY_WEIGHTS = {
  orgBaseline: 10,
  usersAndLifecycle: 10,
  applicationsAndSSO: 15,
  policiesAndAuthentication: 20,
  apiAccessManagement: 10,
  adminAndPrivilegedAccess: 10,
  networkAndDevicePosture: 10,
  federationAndExtensibility: 5,
  monitoringAndLogs: 10
} as const;

export type OktaCategoryId = keyof typeof OKTA_CATEGORY_WEIGHTS;

export const OKTA_CATEGORY_NAMES: Record<OktaCategoryId, string> = {
  orgBaseline: "Org Baseline",
  usersAndLifecycle: "Users & Lifecycle",
  applicationsAndSSO: "Applications & SSO",
  policiesAndAuthentication: "Policies & Authentication",
  apiAccessManagement: "API Access Management",
  adminAndPrivilegedAccess: "Admin & Privileged Access",
  networkAndDevicePosture: "Network & Device Posture",
  federationAndExtensibility: "Federation & Extensibility",
  monitoringAndLogs: "Monitoring & Logs"
};

export const OKTA_KEY_COLLECTORS_BY_CATEGORY: Record<OktaCategoryId, string[]> = {
  orgBaseline: ["org", "features"],
  usersAndLifecycle: ["users", "groups"],
  applicationsAndSSO: ["apps"],
  policiesAndAuthentication: ["policies", "authenticators"],
  apiAccessManagement: ["authorization_servers"],
  adminAndPrivilegedAccess: ["admin_roles"],
  networkAndDevicePosture: ["network_zones", "trusted_origins"],
  federationAndExtensibility: ["idps", "event_hooks", "inline_hooks"],
  monitoringAndLogs: ["log_streams", "system_log"]
};

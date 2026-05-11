import { CollectorFailure, ResourceCoverage } from "../../core/schema";

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type Confidence = "high" | "medium" | "low";
export type Environment =
  | "production"
  | "staging"
  | "development"
  | "sandbox"
  | "unknown";

export interface Finding {
  id: string;
  title: string;
  /** The severity calibrated for the *current* tenant environment. */
  severity: Severity;
  /**
   * Severity if this exact configuration appeared in a production tenant.
   * Always present so v0.3 reports can show production-equivalent risk
   * regardless of the scanned environment.
   */
  productionEquivalentSeverity?: Severity;
  /**
   * Severity adjusted for the scanned environment (production / staging /
   * development / sandbox / unknown). When this differs from
   * `productionEquivalentSeverity`, the renderer surfaces the delta.
   */
  environmentAdjustedSeverity?: Severity;
  /** Optional plain-English explanation of the environment adjustment. */
  environmentAdjustmentReason?: string;
  category: string;
  scoreImpact: number;
  /**
   * Score impact if this finding's severity were calibrated for production.
   * Always present so reports can show both numbers when severity has been
   * environment-adjusted.
   */
  productionEquivalentScoreImpact?: number;
  affectedResources: string[];
  evidence: string;
  /**
   * Optional split of evidence into clearly-risky vs. requires-validation
   * signals. Used by AUTH-CLI-001 (and similar rules) to avoid lumping
   * "definitely bad" with "context-dependent".
   */
  evidenceSplit?: {
    observedRisks: string[];
    requiresValidation: string[];
  };
  recommendation: string;
  businessRisk: string;
  remediationHint?: string;

  // Engineering-grade enrichment.
  auth0Area?: string;
  terraformResource?: string;
  terraformFields?: string[];
  /** Ordered manual implementation steps (Auth0 dashboard / Terraform). */
  implementationSteps?: string[];
  validationSteps?: string[];
  falsePositiveNotes?: string[];
  confidence?: Confidence;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  type:
    | "security-hardening"
    | "architecture-improvement"
    | "governance-improvement"
    | "audit-readiness"
    | "ux-improvement"
    | "b2b-readiness"
    | "operational-resilience"
    | "productization-opportunity";
  description: string;
  effort: "low" | "medium" | "high";
  findingId?: string;
}

export type OpportunityGroupId =
  | "quickWins"
  | "securityHardening"
  | "auditReadiness"
  | "architectureAndMaturity";

export interface OpportunityGroup {
  id: OpportunityGroupId;
  name: string;
  description: string;
  items: Opportunity[];
}

export interface ReportCategory {
  id: string;
  name: string;
  weight: number;
  /**
   * Score awarded by the rules engine. `null` means the category was not
   * assessed (key collector failed/skipped) — renderers MUST display "N/A"
   * rather than a clean full score.
   */
  score: number | null;
  /** Whether the category was actually assessed at all. */
  assessed: boolean;
  findings: number;
  confidence: Confidence;
  confidenceReason: string;
}

export interface ScoreBreakdown {
  /** Sum of category scores actually assessed (environment-adjusted). */
  observedScore: number;
  /** Sum of weights for categories actually assessed. */
  assessedMaxPoints: number;
  /** Observed score normalized to a 0–100 scale (environment-adjusted). */
  normalizedScore: number;
  /** Sum of weights for categories that were not assessed. */
  unassessedWeight: number;
  /**
   * Numeric score and grade if this exact configuration were observed in a
   * production tenant (severities not down-shifted for non-prod tenants).
   */
  productionEquivalent: {
    observedScore: number;
    normalizedScore: number;
    overall: number;
    grade: Grade;
  };
  /** Plain-English interpretation tailored to the scanned environment. */
  environmentAdjustedInterpretation: string;
}

export type RemediationBucketId = "immediate" | "shortTerm" | "later";

export interface RemediationItem {
  priority: number;
  findingId: string;
  action: string;
  expectedOutcome: string;
  effort: "low" | "medium" | "high";
  /** Severity used for bucketing (already environment-adjusted). */
  severity?: Severity;
}

export interface RemediationBucket {
  id: RemediationBucketId;
  name: string;
  window: string;
  items: RemediationItem[];
}

export interface RemediationPlan {
  buckets: RemediationBucket[];
}

export interface CategoryImpact {
  categoryId: string;
  categoryName: string;
  affectedCollectors: string[];
}

export interface PartialScanImpact {
  partial: boolean;
  affectedCategories: CategoryImpact[];
}

export interface KeyDecision {
  id: string;
  question: string;
  context: string;
  relatedFindingIds: string[];
}

export interface ReRunValidation {
  command: string;
  expectedImprovements: Array<{
    categoryId: string;
    categoryName: string;
    reason: string;
  }>;
}

export interface Auth0AnalysisReport {
  metadata: {
    tenantDomain: string;
    environment: Environment;
    generatedAt: string;
    scanId: string;
    connectorVersion: string;
  };
  assumptions: string[];
  score: {
    overall: number;
    grade: Grade;
    maxScore: 100;
    breakdown: ScoreBreakdown;
  };
  categories: ReportCategory[];
  findings: Finding[];
  keyDecisions: KeyDecision[];
  opportunities: Opportunity[];
  opportunityGroups: OpportunityGroup[];
  remediationPlan: RemediationPlan;
  reRunValidation: ReRunValidation;
  partialScanImpact: PartialScanImpact;
  notAssessed: string[];
  collectionStatus: {
    partial: boolean;
    missingScopes: string[];
    failedCollectors: CollectorFailure[];
    coverage: ResourceCoverage[];
  };
}

/**
 * Category weights (sum = 100).
 */
export const CATEGORY_WEIGHTS = {
  tenantBaseline: 10,
  applications: 15,
  connections: 15,
  apis: 10,
  rbac: 10,
  actionsAndExtensibility: 10,
  attackProtection: 10,
  monitoring: 10,
  brandingAndLoginExperience: 5,
  organizations: 5
} as const;

export type CategoryId = keyof typeof CATEGORY_WEIGHTS;

export const CATEGORY_NAMES: Record<CategoryId, string> = {
  tenantBaseline: "Tenant Baseline",
  applications: "Applications / OAuth Clients",
  connections: "Connections / Identity Sources",
  apis: "APIs / Resource Servers",
  rbac: "RBAC / Authorization",
  actionsAndExtensibility: "Actions & Extensibility",
  attackProtection: "MFA & Attack Protection",
  monitoring: "Monitoring & Log Streams",
  brandingAndLoginExperience: "Branding & Login Experience",
  organizations: "Organizations / B2B"
};

/**
 * Collectors that primarily inform each category's confidence. If any key
 * collector failed or was skipped, confidence drops.
 */
export const KEY_COLLECTORS_BY_CATEGORY: Record<CategoryId, string[]> = {
  tenantBaseline: ["tenant"],
  applications: ["clients"],
  connections: ["connections"],
  apis: ["resource_servers", "client_grants"],
  rbac: ["roles"],
  actionsAndExtensibility: ["actions"],
  attackProtection: ["attack_protection", "guardian"],
  monitoring: ["log_streams"],
  brandingAndLoginExperience: ["branding", "prompts", "custom_domains"],
  organizations: ["organizations"]
};

/**
 * Categories that materially mislead the report when their key collectors
 * fail. These get a small uncertainty penalty on top of the confidence
 * downgrade so the score does not silently look clean.
 */
export const CORE_CATEGORIES: CategoryId[] = [
  "applications",
  "connections",
  "apis",
  "attackProtection",
  "monitoring"
];

export const SEVERITY_SCORE_IMPACT: Record<Severity, number> = {
  critical: 25,
  high: 12,
  medium: 6,
  low: 2,
  info: 0
};

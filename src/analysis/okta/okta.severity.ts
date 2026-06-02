import { Environment, Severity } from "../../reporting/markdown/report.types";
import { OktaFinding } from "../../reporting/markdown/okta-report.types";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

const RANK_TO_SEVERITY: Severity[] = ["info", "low", "medium", "high", "critical"];

const ALWAYS_PROD_EQUIVALENT_IDS = new Set<string>(["OKTA-COV-001", "OKTA-MON-001", "OKTA-ADM-001"]);
const KEEP_SEVERITY_CATEGORIES = new Set<string>([
  "apiAccessManagement",
  "adminAndPrivilegedAccess",
  "monitoringAndLogs"
]);
const CLASSIFICATION_BASE_IMPACT: Record<OktaFinding["classification"], Record<Severity, number>> = {
  "confirmed-risk": {
    critical: 18,
    high: 10,
    medium: 5,
    low: 2,
    info: 0
  },
  "requires-validation": {
    critical: 12,
    high: 6,
    medium: 3,
    low: 1,
    info: 0
  },
  advisory: {
    critical: 8,
    high: 3,
    medium: 1.5,
    low: 0.5,
    info: 0
  },
  "positive-signal": {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  }
};
const CONFIDENCE_IMPACT_MULTIPLIER = {
  high: 1,
  medium: 0.7,
  low: 0.45
} as const;

export function adjustOktaFindings(
  findings: OktaFinding[],
  options: { environment: Environment }
): OktaFinding[] {
  return findings.map((finding) => adjustOktaFindingForEnvironment(finding, options.environment));
}

export function adjustOktaFindingForEnvironment(
  finding: OktaFinding,
  environment: Environment
): OktaFinding {
  const productionEquivalentSeverity = finding.severity;
  const productionEquivalentScoreImpact = computeImpact(finding, productionEquivalentSeverity);
  const adjusted = computeAdjustedSeverity(finding, environment);
  const reason =
    adjusted === productionEquivalentSeverity
      ? undefined
      : `Severity adjusted from ${productionEquivalentSeverity} to ${adjusted} for the reported \`${environment}\` environment.`;

  return {
    ...finding,
    severity: adjusted,
    scoreImpact:
      adjusted === productionEquivalentSeverity
        ? productionEquivalentScoreImpact
        : computeImpact(finding, adjusted),
    productionEquivalentSeverity,
    productionEquivalentScoreImpact,
    environmentAdjustedSeverity: adjusted,
    environmentAdjustmentReason: reason
  };
}

function computeAdjustedSeverity(finding: OktaFinding, environment: Environment): Severity {
  if (environment === "production" || environment === "unknown" || environment === "staging") {
    return finding.severity;
  }

  if (ALWAYS_PROD_EQUIVALENT_IDS.has(finding.id)) return finding.severity;
  if (KEEP_SEVERITY_CATEGORIES.has(finding.category)) return finding.severity;
  if (finding.severity === "info") return "info";

  if (environment === "development") {
    return downshift(finding.severity, 1);
  }

  if (environment === "sandbox") {
    if (
      finding.category === "orgBaseline" ||
      finding.category === "usersAndLifecycle" ||
      finding.category === "federationAndExtensibility"
    ) {
      return downshift(finding.severity, 2);
    }
    return downshift(finding.severity, 1);
  }

  return finding.severity;
}

function downshift(severity: Severity, steps: number): Severity {
  const nextRank = Math.max(0, SEVERITY_RANK[severity] - steps);
  return RANK_TO_SEVERITY[nextRank];
}

function computeImpact(finding: OktaFinding, severity: Severity): number {
  if (severity === "info") return 0;
  const classification = finding.classification ?? "requires-validation";
  const confidence = finding.confidence ?? "medium";
  const base = CLASSIFICATION_BASE_IMPACT[classification][severity];
  const multiplier = CONFIDENCE_IMPACT_MULTIPLIER[confidence];
  return roundScoreImpact(base * multiplier);
}

function roundScoreImpact(value: number): number {
  return Math.round(value * 10) / 10;
}

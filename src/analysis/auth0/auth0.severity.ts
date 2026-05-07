/**
 * Environment-adjusted severity calibration.
 *
 * Most rules emit production-equivalent severity. For non-production tenants,
 * many findings have lower real-world impact (e.g. weak password policy on a
 * sandbox tenant with no real users). A small allowlist of finding IDs always
 * stays at production severity regardless of environment because they
 * represent broad admin authority or real-customer-data exposure.
 */

import {
  Environment,
  Finding,
  Severity,
  SEVERITY_SCORE_IMPACT
} from "../../reporting/markdown/report.types";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

const RANK_TO_SEVERITY: Severity[] = ["info", "low", "medium", "high", "critical"];

function downshift(s: Severity, steps: number): Severity {
  const r = Math.max(0, SEVERITY_RANK[s] - steps);
  return RANK_TO_SEVERITY[r];
}

/**
 * Findings that retain production-equivalent severity regardless of the
 * tenant environment, because the configuration represents broad admin
 * authority or affects controls that materially leak between environments.
 */
const ALWAYS_PROD_EQUIVALENT_IDS = new Set<string>([
  // Confidential client misconfigured as public — leaks across envs once
  // documented as accepted, and is trivially exploitable.
  "AUTH-CLI-005",
  // Legacy Rules/Hooks reach a hard EOL date regardless of environment.
  "AUTH-EXT-001",
  // Coverage transparency is environment-independent.
  "AUTH-COV-001"
]);

/**
 * Categories whose findings clearly relate to broad admin authority or
 * real-customer-data exposure and should not be silently downshifted on
 * non-production tenants.
 */
const KEEP_SEVERITY_CATEGORIES = new Set<string>(["apis"]);

export interface AdjustOptions {
  environment: Environment;
}

/**
 * Compute environment-adjusted severity for a single finding. Pure: does not
 * mutate the input.
 */
export function adjustFindingForEnvironment(
  finding: Finding,
  options: AdjustOptions
): Finding {
  const productionEquivalentSeverity = finding.severity;
  const productionEquivalentScoreImpact =
    finding.productionEquivalentScoreImpact ?? finding.scoreImpact;
  const env = options.environment;
  const adjusted = computeAdjustedSeverity(finding, env);
  const reason =
    adjusted === productionEquivalentSeverity
      ? undefined
      : explainAdjustment(env, productionEquivalentSeverity, adjusted);

  // Score impact tracks the *adjusted* severity so the score actually reflects
  // environment-calibrated risk. The production-equivalent value is preserved
  // so the renderer can show both when they differ.
  const scoreImpact =
    adjusted === productionEquivalentSeverity
      ? productionEquivalentScoreImpact
      : SEVERITY_SCORE_IMPACT[adjusted];

  return {
    ...finding,
    severity: adjusted,
    scoreImpact,
    productionEquivalentScoreImpact,
    productionEquivalentSeverity,
    environmentAdjustedSeverity: adjusted,
    environmentAdjustmentReason: reason
  };
}

export function adjustFindings(
  findings: Finding[],
  options: AdjustOptions
): Finding[] {
  return findings.map((f) => adjustFindingForEnvironment(f, options));
}

function computeAdjustedSeverity(f: Finding, env: Environment): Severity {
  // Production / unknown: keep production-equivalent severity. "unknown"
  // intentionally assumes production impact.
  if (env === "production" || env === "unknown") return f.severity;

  // Findings that are always production-equivalent.
  if (ALWAYS_PROD_EQUIVALENT_IDS.has(f.id)) return f.severity;

  // info severity never moves.
  if (f.severity === "info") return f.severity;

  // AUTH-API-007 special case: development/sandbox + API Explorer Application
  // downshift one step (critical → high). Other Management API clients keep
  // production-equivalent severity because they likely automate real flows.
  if (f.id === "AUTH-API-007") {
    const isApiExplorerEvidence = /client_name_matches_api_explorer/i.test(
      f.evidence ?? ""
    );
    if (
      (env === "development" || env === "sandbox") &&
      isApiExplorerEvidence
    ) {
      return downshift(f.severity, 1);
    }
    return f.severity;
  }

  if (env === "staging") {
    // Staging is mostly strict — keep severities by default.
    return f.severity;
  }

  // Categories that should not silently downshift on non-prod tenants
  // (e.g. APIs — the API contract is the same across environments).
  if (KEEP_SEVERITY_CATEGORIES.has(f.category)) return f.severity;

  if (env === "development") {
    // Development: 1 step softer for security/connection findings; 2 steps
    // softer for branding/UX/tenant-baseline.
    if (
      f.category === "brandingAndLoginExperience" ||
      f.category === "tenantBaseline"
    ) {
      return downshift(f.severity, 2);
    }
    return downshift(f.severity, 1);
  }

  if (env === "sandbox") {
    // Sandbox: typically no real users — softer than development.
    if (
      f.category === "brandingAndLoginExperience" ||
      f.category === "tenantBaseline" ||
      f.category === "actionsAndExtensibility"
    ) {
      return downshift(f.severity, 2);
    }
    return downshift(f.severity, 2);
  }

  return f.severity;
}

function explainAdjustment(
  env: Environment,
  prod: Severity,
  adj: Severity
): string {
  return `Severity adjusted from ${prod} (production-equivalent) to ${adj} for the reported \`${env}\` environment. The underlying configuration is unchanged — only its blast radius differs.`;
}

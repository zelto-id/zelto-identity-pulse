/**
 * Auth0 analyzer (v0.3): snapshot -> Auth0AnalysisReport.
 *
 * Pipeline:
 *   1. Run all rules (rules emit production-equivalent severity).
 *   2. Adjust severity for the reported tenant environment.
 *   3. Score adjusted findings (categories whose key collectors failed/were
 *      skipped are reported as Not Assessed).
 *   4. Build derived sections: opportunities (grouped), remediation plan,
 *      partial-scan impact, key decisions, re-run validation hint,
 *      assumptions, and what-was-not-assessed.
 */

import { randomBytes } from "crypto";
import { Auth0TenantSnapshot } from "../../connectors/auth0/auth0.types";
import {
  Auth0AnalysisReport,
  CategoryId,
  Environment,
  Finding,
  KEY_COLLECTORS_BY_CATEGORY,
  CATEGORY_NAMES,
  ReRunValidation,
  ReportCategory
} from "../../reporting/markdown/report.types";
import { CONNECTOR_VERSION } from "../../connectors/auth0/auth0.connector";
import { runAllRules } from "./auth0.rules";
import { adjustFindings } from "./auth0.severity";
import { buildOpportunities, buildOpportunityGroups } from "./auth0.opportunities";
import { scoreFindings, buildPartialScanImpact } from "./auth0.scoring";
import { buildRemediationPlan } from "./auth0.remediation";
import { buildKeyDecisions } from "./auth0.decisions";
import { consolidateFindings } from "./auth0.consolidation";

export interface AnalyzeOptions {
  environment?: Environment;
}

export function analyzeAuth0Snapshot(
  snapshot: Auth0TenantSnapshot,
  options: AnalyzeOptions = {}
): Auth0AnalysisReport {
  const environment: Environment = options.environment ?? "unknown";

  const rawFindings = runAllRules(snapshot);
  const findings = adjustFindings(rawFindings, { environment });
  const partial = snapshot.metadata.partial;
  const coverage = snapshot.coverage;

  const scoring = scoreFindings(findings, partial, coverage, { environment });
  const consolidatedFindings = consolidateFindings(findings);
  const opportunities = buildOpportunities(findings);
  const opportunityGroups = buildOpportunityGroups(opportunities);
  const remediationPlan = buildRemediationPlan(findings);
  const partialScanImpact = buildPartialScanImpact(partial, coverage);
  const keyDecisions = buildKeyDecisions({ findings, environment, snapshot });
  const reRunValidation = buildReRunValidation(environment, scoring.categories);
  const assumptions = buildAssumptions(environment, partial);
  const notAssessed = buildNotAssessed(snapshot, scoring.categories);

  return {
    metadata: {
      tenantDomain: snapshot.metadata.domain,
      environment,
      generatedAt: new Date().toISOString(),
      scanId: `scan_${randomBytes(6).toString("hex")}`,
      connectorVersion: snapshot.metadata.connectorVersion ?? CONNECTOR_VERSION
    },
    assumptions,
    score: {
      overall: scoring.overall,
      grade: scoring.grade,
      maxScore: 100,
      breakdown: scoring.breakdown
    },
    categories: scoring.categories,
    findings,
    consolidatedFindings,
    keyDecisions,
    opportunities,
    opportunityGroups,
    remediationPlan,
    reRunValidation,
    partialScanImpact,
    notAssessed,
    collectionStatus: {
      partial,
      missingScopes: snapshot.metadata.missingScopes,
      failedCollectors: snapshot.metadata.failedCollectors,
      coverage
    }
  };
}

function buildAssumptions(environment: Environment, partial: boolean): string[] {
  const a: string[] = [];
  a.push(
    "Findings are produced by deterministic rules over a normalized snapshot of tenant configuration. They reflect configuration posture, not runtime behavior or user activity."
  );
  a.push(
    "Severity is calibrated against typical CIAM/B2B production expectations. Sandbox or development tenants may intentionally relax some controls."
  );
  if (environment === "unknown") {
    a.push(
      "Tenant environment was not specified; risk interpretation assumes production impact unless otherwise documented."
    );
  } else {
    a.push(
      `Tenant environment was reported as **${environment}**; severities have been adjusted accordingly. Production-equivalent severity is preserved alongside the adjusted value for transparency.`
    );
  }
  a.push(
    "Absence of a finding indicates that no rule triggered for the data observed; it does not by itself prove the absence of risk in unexamined areas."
  );
  if (partial) {
    a.push(
      "Scan was partial. Categories whose key collectors did not run are reported as Not Assessed (score: N/A) rather than scored as clean."
    );
  }
  a.push(
    "Recommendations cite Auth0 dashboard areas and Terraform fields where applicable so engineering teams can validate and apply changes consistently."
  );
  return a;
}

function buildNotAssessed(
  snapshot: Auth0TenantSnapshot,
  categories: ReportCategory[]
): string[] {
  const items: string[] = [];

  // Categories explicitly not assessed (key collectors failed/skipped).
  for (const c of categories) {
    if (!c.assessed) {
      items.push(
        `${c.name} — ${c.confidenceReason} Score reported as N/A (weight ${c.weight}/100).`
      );
    }
  }

  for (const fc of snapshot.metadata.failedCollectors ?? []) {
    const cat = categoryOfCollector(fc.collector);
    items.push(
      `Collector \`${fc.collector}\`${cat ? ` (${cat})` : ""} — ${fc.status}: ${fc.reason}`
    );
  }
  if ((snapshot.metadata.missingScopes ?? []).length > 0) {
    items.push(
      `Areas requiring missing Management API scopes: ${snapshot.metadata.missingScopes.join(", ")}.`
    );
  }

  items.push(
    "End-user behavior analytics, individual user risk scoring, and historical login telemetry are outside MVP scope."
  );
  items.push(
    "Tenant-side performance, billing, quota, and SLA posture are outside MVP scope."
  );
  items.push(
    "Automated remediation, write operations against Auth0, and code-side application security are outside MVP scope."
  );

  return items;
}

function buildReRunValidation(
  environment: Environment,
  categories: ReportCategory[]
): ReRunValidation {
  const expected = categories
    .filter((c) => c.findings > 0 || !c.assessed)
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      reason: !c.assessed
        ? "Currently Not Assessed; granting the missing collector scopes will produce a real score."
        : `${c.findings} finding(s) currently reduce this category's score; remediation should restore points up to weight ${c.weight}.`
    }));
  return {
    command: `zelto-pulse scan auth0 --environment ${environment}`,
    expectedImprovements: expected
  };
}

function categoryOfCollector(collector: string): string | undefined {
  for (const id of Object.keys(KEY_COLLECTORS_BY_CATEGORY) as CategoryId[]) {
    if (KEY_COLLECTORS_BY_CATEGORY[id].includes(collector)) {
      return CATEGORY_NAMES[id];
    }
  }
  return undefined;
}

// Keep an export usable by tests.
export type { Finding };

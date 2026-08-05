import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { readJsonSync } from "../../src/core/filesystem";
import {
  buildCombinedExecutiveSummary,
  renderCombinedExecutiveSummaryJson
} from "../../src/reporting/combined/combined-summary";
import { COMBINED_SUMMARY_SCHEMA_VERSION } from "../../src/reporting/combined/combined-summary.types";
import { renderCombinedExecutiveSummaryHtml } from "../../src/reporting/html/combined-executive-summary.html-renderer";
import {
  buildAuth0ReportContractV1,
  buildOktaReportContractV1
} from "../../src/reporting/json/report-contract";
import { StructuredReportV1 } from "../../src/reporting/json/report-contract.types";

function loadAuth0(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(
    path.join(process.cwd(), "fixtures", "auth0", name)
  );
}

function loadOkta(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(
    path.join(process.cwd(), "fixtures", "okta", name)
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function auth0Contract(): StructuredReportV1 {
  const snapshot = loadAuth0("risky-tenant.snapshot.json");
  return buildAuth0ReportContractV1(
    analyzeAuth0Snapshot(snapshot, { environment: "production" }),
    snapshot
  );
}

function oktaContract(): StructuredReportV1 {
  const snapshot = loadOkta("risky-org.snapshot.json");
  return buildOktaReportContractV1(
    analyzeOktaSnapshot(snapshot, {
      environment: "production",
      includeIdentifiers: false
    }),
    snapshot
  );
}

describe("combined executive summary", () => {
  it("builds a mixed Auth0 and Okta executive summary with traceable findings", () => {
    const auth0 = auth0Contract();
    const okta = oktaContract();
    const summary = buildCombinedExecutiveSummary([auth0, okta]);

    expect(summary.schemaVersion).toBe(COMBINED_SUMMARY_SCHEMA_VERSION);
    expect(summary.executiveSummary.reportCount).toBe(2);
    expect(summary.executiveSummary.providerCount).toBe(2);
    expect(summary.providerComparison.map((provider) => provider.provider)).toEqual([
      "auth0",
      "okta"
    ]);
    expect(summary.executiveSummary.totalFindings).toBe(
      auth0.findings.length + okta.findings.length
    );
    expect(summary.crossProviderRiskThemes.length).toBeGreaterThan(0);
    expect(summary.unifiedRemediationPriorities.length).toBeGreaterThan(0);

    const referencedFindingIds = new Set(
      summary.crossProviderRiskThemes.flatMap((theme) =>
        theme.findings.map((finding) => finding.id)
      )
    );
    expect(referencedFindingIds.has(auth0.findings[0].id)).toBe(true);
    expect(referencedFindingIds.has(okta.findings[0].id)).toBe(true);
    expect(summary.crossProviderRiskThemes.map((theme) => theme.id)).toEqual(
      Array.from(new Set(summary.crossProviderRiskThemes.map((theme) => theme.id)))
    );
  });

  it("renders client-readable HTML without leaking secret-like values", () => {
    const auth0 = clone(auth0Contract());
    const okta = oktaContract();
    auth0.findings[0].businessRisk =
      "Example leaked value access_token=super-secret-token should be redacted.";
    auth0.limitations.push("authorization: bearer abc.def.ghi");

    const summary = buildCombinedExecutiveSummary([auth0, okta]);
    const html = renderCombinedExecutiveSummaryHtml(summary);

    expect(html).toContain("Combined Identity Posture Summary");
    expect(html).toContain("Provider Comparison");
    expect(html).toContain("Unified Remediation Priorities");
    expect(html).toContain(auth0.findings[0].id);
    expect(html).toContain(auth0.findings[0].fingerprint);
    expect(html).toContain("Okta Workforce");
    expect(html).not.toContain("super-secret-token");
    expect(html).not.toContain("abc.def.ghi");
    expect(html).toContain("[REDACTED]");
  });

  it("rejects fewer than two input reports", () => {
    expect(() => buildCombinedExecutiveSummary([auth0Contract()])).toThrow(
      /at least two/
    );
  });

  it("serializes deterministic structured summary content excluding generation time", () => {
    const reports = [auth0Contract(), oktaContract()];
    const summary = buildCombinedExecutiveSummary(reports);
    const repeated = {
      ...buildCombinedExecutiveSummary(reports),
      generatedAt: summary.generatedAt
    };

    expect(renderCombinedExecutiveSummaryJson(summary)).toEqual(
      renderCombinedExecutiveSummaryJson(repeated)
    );
  });
});

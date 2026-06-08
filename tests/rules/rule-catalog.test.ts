import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import {
  getRuleCatalogEntry,
  listRuleCatalog,
  renderRuleCatalogList,
  renderRuleExplanation,
  RULE_CATALOG
} from "../../src/analysis/rules/rule-catalog";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { readJsonSync } from "../../src/core/filesystem";
import { renderAuth0ReportHtml } from "../../src/reporting/html/auth0-report.html-renderer";
import { renderOktaReportHtml } from "../../src/reporting/html/okta-report.html-renderer";
import {
  buildAuth0ReportContractV1,
  buildOktaReportContractV1,
  renderReportContractV1Json
} from "../../src/reporting/json/report-contract";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";
import { renderOktaReport } from "../../src/reporting/markdown/okta-report.renderer";

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

describe("rule catalog", () => {
  it("lists Auth0 and Okta rules deterministically", () => {
    expect(RULE_CATALOG).toHaveLength(59);
    expect(RULE_CATALOG.map((entry) => entry.id)).toEqual(
      [...RULE_CATALOG.map((entry) => entry.id)].sort((left, right) => {
        const leftProvider = getRuleCatalogEntry(left)?.provider ?? "";
        const rightProvider = getRuleCatalogEntry(right)?.provider ?? "";
        return leftProvider.localeCompare(rightProvider) || left.localeCompare(right);
      })
    );

    const auth0Rules = listRuleCatalog({ provider: "auth0" });
    const oktaRules = listRuleCatalog({ provider: "okta" });
    expect(auth0Rules).toHaveLength(29);
    expect(oktaRules).toHaveLength(30);
    expect(auth0Rules.every((entry) => entry.provider === "auth0")).toBe(true);
    expect(oktaRules.every((entry) => entry.provider === "okta")).toBe(true);

    const rendered = renderRuleCatalogList({ provider: "auth0" });
    expect(rendered).toContain("Rule ID");
    expect(rendered).toContain("AUTH-CLI-004");
    expect(rendered).not.toContain("OKTA-APP-001");
  });

  it("explains rule metadata with required sections", () => {
    const auth0 = getRuleCatalogEntry("AUTH-CLI-004");
    const okta = getRuleCatalogEntry("okta-app-001");

    expect(auth0).toBeDefined();
    expect(okta).toBeDefined();
    expect(auth0?.provider).toBe("auth0");
    expect(okta?.provider).toBe("okta");

    const explanation = renderRuleExplanation(auth0!);
    expect(explanation).toContain("Severity Logic:");
    expect(explanation).toContain("Evidence Used:");
    expect(explanation).toContain("Confidence Logic:");
    expect(explanation).toContain("Remediation Guidance:");
    expect(explanation).toContain("False-Positive Notes:");
    expect(explanation).toContain("non-rotating or non-expiring refresh tokens");
  });

  it("maps fixture findings back to catalog entries and report IDs", () => {
    const auth0Snapshot = loadAuth0("risky-tenant.snapshot.json");
    const auth0Report = analyzeAuth0Snapshot(auth0Snapshot, {
      environment: "production"
    });
    const auth0Markdown = renderAuth0Report(auth0Report);
    const auth0Html = renderAuth0ReportHtml(auth0Report);
    const auth0Json = renderReportContractV1Json(
      buildAuth0ReportContractV1(auth0Report, auth0Snapshot)
    );

    for (const finding of auth0Report.findings) {
      expect(getRuleCatalogEntry(finding.id), finding.id).toBeDefined();
    }
    for (const id of ["AUTH-SEC-001", "AUTH-CLI-004", "AUTH-OBS-001"]) {
      expect(auth0Markdown).toContain(id);
      expect(auth0Html).toContain(id);
      expect(auth0Json).toContain(`"id": "${id}"`);
    }

    const oktaSnapshot = loadOkta("risky-org.snapshot.json");
    const oktaReport = analyzeOktaSnapshot(oktaSnapshot, {
      environment: "production",
      includeIdentifiers: false
    });
    const oktaMarkdown = renderOktaReport(oktaReport);
    const oktaHtml = renderOktaReportHtml(oktaReport);
    const oktaJson = renderReportContractV1Json(
      buildOktaReportContractV1(oktaReport, oktaSnapshot)
    );

    for (const finding of oktaReport.findings) {
      expect(getRuleCatalogEntry(finding.id), finding.id).toBeDefined();
    }
    for (const id of ["OKTA-APP-001", "OKTA-MON-001", "OKTA-ADM-001"]) {
      expect(oktaMarkdown).toContain(id);
      expect(oktaHtml).toContain(id);
      expect(oktaJson).toContain(`"id": "${id}"`);
    }
  });
});

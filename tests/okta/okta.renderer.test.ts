import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { renderOktaReport } from "../../src/reporting/markdown/okta-report.renderer";
import { renderOktaReportHtml } from "../../src/reporting/html/okta-report.html-renderer";

const FIXTURES = path.resolve(__dirname, "../../fixtures/okta");

function load(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(path.join(FIXTURES, name));
}

describe("okta markdown renderer", () => {
  it("renders findings and coverage for a risky report", () => {
    const markdown = renderOktaReport(
      analyzeOktaSnapshot(load("risky-org.snapshot.json"), { environment: "production" })
    );

    expect(markdown).toContain("Okta Workforce Posture Report");
    expect(markdown).toContain("OKTA-APP-001");
    expect(markdown).toContain("Resource Coverage");
    expect(markdown).toContain("## Recommended Remediation Plan");
    expect(markdown).toContain("## Positive Signals");
    expect(markdown).toContain(
      "All configured collectors completed successfully, but several categories use bounded or sampled analysis in the MVP."
    );
  });

  it("renders partial collection status", () => {
    const markdown = renderOktaReport(
      analyzeOktaSnapshot(load("partial-scope-org.snapshot.json"), {
        environment: "production"
      })
    );

    expect(markdown).toContain("Scan was partial");
    expect(markdown).toContain("okta.roles.read");
  });

  it("masks identifiers by default and shows them when explicitly requested", () => {
    const snapshot: OktaOrgSnapshot = {
      metadata: {
        provider: "okta",
        product: "workforce",
        orgUrl: "https://example.okta.com",
        collectedAt: "2026-05-18T00:00:00.000Z",
        connectorVersion: "0.1.0",
        authMode: "oauth",
        partial: false,
        missingScopes: [],
        failedCollectors: [],
        collectionOptions: {
          includeUsers: "bounded",
          maxUsers: 500,
          includeSystemLog: true,
          systemLogDays: 7,
          maxLogs: 1000
        }
      },
      coverage: [
        { collector: "users", status: "success", count: 1, requiredScopes: [] },
        { collector: "groups", status: "success", count: 0, requiredScopes: [] }
      ],
      users: [
        {
          id: "00u1",
          status: "ACTIVE",
          created: "2026-01-01T00:00:00.000Z",
          profile: { email: "alice@example.com" }
        }
      ]
    };

    const masked = renderOktaReport(
      analyzeOktaSnapshot(snapshot, { environment: "production" })
    );
    const full = renderOktaReport(
      analyzeOktaSnapshot(snapshot, {
        environment: "production",
        includeIdentifiers: true
      })
    );

    expect(masked).toContain("a...@example.com");
    expect(masked).not.toContain("alice@example.com");
    expect(full).toContain("alice@example.com");
  });

  it("describes partial-only collection without marking areas as not assessed", () => {
    const snapshot = load("healthy-org.snapshot.json");
    snapshot.metadata.partial = true;
    snapshot.metadata.failedCollectors = [
      {
        collector: "admin_roles",
        status: "partial",
        reason: "GROUP admin role assignments were unavailable."
      }
    ];
    snapshot.coverage = snapshot.coverage.map((item) =>
      item.collector === "admin_roles"
        ? {
            ...item,
            status: "partial",
            notes: "GROUP admin role assignments were unavailable."
          }
        : item
    );

    const markdown = renderOktaReport(
      analyzeOktaSnapshot(snapshot, { environment: "production" })
    );

    expect(markdown).toContain("Partial scan: 1 collector had partial data.");
    expect(markdown).toContain("remain scored with reduced confidence");
    expect(markdown).toContain(
      "_No categories were marked Not Assessed. Partial collector data, if any, is described above._"
    );
    expect(markdown).not.toContain("Collector `admin_roles`");
  });
});

describe("okta html renderer", () => {
  it("renders the interactive report shell instead of a markdown pre block", () => {
    const html = renderOktaReportHtml(
      analyzeOktaSnapshot(load("risky-org.snapshot.json"), { environment: "production" })
    );

    expect(html).toContain("zelto-identity-pulse");
    expect(html).toContain("Detailed Findings");
    expect(html).toContain("Category Breakdown");
    expect(html).toContain("Recommended Remediation Plan");
    expect(html).toContain("Positive Signals");
    expect(html).toContain("filterSeverity");
    expect(html).not.toContain("<pre>");
  });

  it("renders partial-only coverage honestly and suppresses negative zero score tags", () => {
    const snapshot = load("healthy-org.snapshot.json");
    snapshot.metadata.partial = true;
    snapshot.metadata.failedCollectors = [
      {
        collector: "admin_roles",
        status: "partial",
        reason: "GROUP admin role assignments were unavailable."
      }
    ];
    snapshot.coverage = snapshot.coverage.map((item) =>
      item.collector === "admin_roles"
        ? {
            ...item,
            status: "partial",
            notes: "GROUP admin role assignments were unavailable."
          }
        : item
    );

    const html = renderOktaReportHtml(
      analyzeOktaSnapshot(snapshot, { environment: "production" })
    );

    expect(html).toContain("Partial scan: 1 collector had partial data.");
    expect(html).toContain("remain scored with reduced confidence");
    expect(html).not.toContain("failed/skipped. Categories whose key collectors did not run are reported as N/A.");
    expect(html).toContain("No categories were marked Not Assessed.");
    expect(html).toContain('<span class="tag">score 0</span>');
    expect(html).not.toContain('<span class="tag">score -0</span>');
  });
});

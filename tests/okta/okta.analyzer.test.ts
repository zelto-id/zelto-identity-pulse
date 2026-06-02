import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";

const FIXTURES = path.resolve(__dirname, "../../fixtures/okta");

function load(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(path.join(FIXTURES, name));
}

describe("okta analyzer", () => {
  it("flags risky posture on the risky fixture", () => {
    const report = analyzeOktaSnapshot(load("risky-org.snapshot.json"), {
      environment: "production"
    });

    expect(report.findings.some((finding) => finding.id === "OKTA-APP-001")).toBe(true);
    expect(report.findings.some((finding) => finding.id === "OKTA-MON-001")).toBe(true);
    expect(report.findings.some((finding) => finding.id === "OKTA-ADM-001")).toBe(true);
    expect(report.score.grade === "A").toBe(false);
    expect(report.positiveSignals.length).toBeGreaterThan(0);
    expect(report.remediationPlan.buckets.some((bucket) => bucket.items.length > 0)).toBe(true);
  });

  it("marks categories as not assessed when key collectors were skipped", () => {
    const report = analyzeOktaSnapshot(load("partial-scope-org.snapshot.json"), {
      environment: "production"
    });

    expect(report.collectionStatus.partial).toBe(true);
    const monitoring = report.categories.find((category) => category.id === "monitoringAndLogs");
    const admin = report.categories.find((category) => category.id === "adminAndPrivilegedAccess");
    expect(monitoring?.assessed).toBe(false);
    expect(admin?.assessed).toBe(false);
  });

  it("marks categories as not assessed when a required key collector is missing from coverage", () => {
    const snapshot = load("healthy-org.snapshot.json");
    snapshot.metadata.partial = false;
    snapshot.coverage = snapshot.coverage.filter((item) => item.collector !== "system_log");
    delete snapshot.systemLog;

    const report = analyzeOktaSnapshot(snapshot, { environment: "production" });
    const monitoring = report.categories.find((category) => category.id === "monitoringAndLogs");

    expect(monitoring?.assessed).toBe(false);
    expect(monitoring?.score).toBeNull();
    expect(monitoring?.confidenceReason).toMatch(/system_log|missing/i);
  });

  it("keeps partial collectors scored while reserving not-assessed output for unavailable categories", () => {
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

    const report = analyzeOktaSnapshot(snapshot, { environment: "production" });
    const admin = report.categories.find((category) => category.id === "adminAndPrivilegedAccess");

    expect(admin?.assessed).toBe(true);
    expect(report.score.breakdown.unassessedWeight).toBe(0);
    expect(report.notAssessed).toEqual([]);
    expect(report.assumptions.join(" ")).toContain("remain scored with reduced confidence");
  });

  it("keeps the healthy fixture free of critical or high findings", () => {
    const report = analyzeOktaSnapshot(load("healthy-org.snapshot.json"), {
      environment: "production"
    });

    expect(report.findings.some((finding) => finding.severity === "critical")).toBe(false);
    expect(report.findings.some((finding) => finding.severity === "high")).toBe(false);
  });

  it("classifies direct and broad assignment findings as requires-validation", () => {
    const report = analyzeOktaSnapshot(
      {
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
        coverage: [{ collector: "apps", status: "success", count: 2, requiredScopes: [] }],
        apps: [
          {
            id: "app1",
            label: "Portal",
            status: "ACTIVE",
            signOnMode: "SAML_2_0",
            assignmentModel: "mixed",
            sampledDirectUserAssignments: 25,
            sampledGroupAssignments: 1,
            settings: { app: {} }
          },
          {
            id: "app2",
            label: "Portal",
            status: "ACTIVE",
            signOnMode: "SAML_2_0",
            assignmentModel: "mixed",
            sampledDirectUserAssignments: 25,
            sampledGroupAssignments: 1,
            settings: { app: {} }
          }
        ]
      },
      { environment: "production" }
    );

    expect(report.findings.find((finding) => finding.id === "OKTA-APP-003")?.classification).toBe(
      "requires-validation"
    );
    expect(report.findings.find((finding) => finding.id === "OKTA-APP-004")?.classification).toBe(
      "requires-validation"
    );
  });

  it("keeps hero score and category totals consistent", () => {
    const report = analyzeOktaSnapshot(load("risky-org.snapshot.json"), {
      environment: "production"
    });

    const assessedCategoryTotal = report.categories
      .filter((category) => category.assessed && category.score !== null)
      .reduce((sum, category) => sum + (category.score ?? 0), 0);

    expect(report.score.overall).toBe(report.score.breakdown.normalizedScore);
    expect(assessedCategoryTotal).toBe(report.score.breakdown.observedScore);
    expect(report.score.breakdown.unassessedWeight).toBe(
      report.categories
        .filter((category) => !category.assessed)
        .reduce((sum, category) => sum + category.weight, 0)
    );
  });

  it("caps API Access Management category confidence to medium while analysis remains review-heavy", () => {
    const report = analyzeOktaSnapshot(load("risky-org.snapshot.json"), {
      environment: "production"
    });

    const apiAccess = report.categories.find(
      (category) => category.id === "apiAccessManagement"
    );

    expect(apiAccess?.confidence).toBe("medium");
    expect(apiAccess?.confidenceReason).toMatch(/architectural review|entitlement modeling/i);
  });
});

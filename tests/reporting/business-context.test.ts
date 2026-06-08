import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { BusinessContextProfile } from "../../src/core/business-context";
import { readJsonSync } from "../../src/core/filesystem";
import {
  buildAuth0ReportContractV1,
  buildOktaReportContractV1
} from "../../src/reporting/json/report-contract";
import { renderAuth0ReportHtml } from "../../src/reporting/html/auth0-report.html-renderer";
import { renderOktaReportHtml } from "../../src/reporting/html/okta-report.html-renderer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";
import { renderOktaReport } from "../../src/reporting/markdown/okta-report.renderer";

const BUSINESS_CONTEXT: BusinessContextProfile = {
  organizationType: "B2B SaaS",
  environment: "production",
  industry: "healthcare",
  regulatedData: true,
  identityUseCase: "customer-identity",
  userPopulation: {
    customers: 50000,
    workforce: 300,
    admins: 15
  },
  criticalApplications: [
    {
      name: "Customer Portal",
      provider: "auth0",
      businessCriticality: "high",
      dataSensitivity: "regulated"
    },
    {
      name: "Admin Console",
      provider: "okta",
      businessCriticality: "critical",
      dataSensitivity: "high"
    }
  ],
  riskTolerance: "low",
  complianceDrivers: ["SOC2", "HIPAA"],
  businessPriorities: [
    "reduce account takeover risk",
    "improve audit readiness"
  ]
};

function loadAuth0Snapshot(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(
    path.join(process.cwd(), "fixtures", "auth0", name)
  );
}

function loadOktaSnapshot(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(
    path.join(process.cwd(), "fixtures", "okta", name)
  );
}

describe("business context reporting", () => {
  it("adds deterministic Auth0 context assumptions and finding notes without changing evidence", () => {
    const snapshot = loadAuth0Snapshot("risky-tenant.snapshot.json");
    const baseline = analyzeAuth0Snapshot(snapshot, { environment: "production" });
    const report = analyzeAuth0Snapshot(snapshot, {
      environment: "production",
      businessContext: BUSINESS_CONTEXT
    });

    expect(report.businessContext).toEqual(BUSINESS_CONTEXT);
    expect(report.assumptions.join("\n")).toContain(
      "Business context profile provided"
    );
    expect(report.assumptions.join("\n")).toContain("SOC2, HIPAA");

    const notedFinding = report.findings.find(
      (finding) => (finding.businessContextNotes ?? []).length > 0
    );
    expect(notedFinding).toBeDefined();
    const baselineFinding = baseline.findings.find(
      (finding) => finding.id === notedFinding?.id
    );
    expect(notedFinding?.evidence).toBe(baselineFinding?.evidence);

    const markdown = renderAuth0Report(report);
    const html = renderAuth0ReportHtml(report);
    expect(markdown).toContain("Business context notes");
    expect(html).toContain("Business Context Notes");

    const contract = buildAuth0ReportContractV1(report, snapshot);
    expect(contract.businessContext).toEqual(BUSINESS_CONTEXT);
    expect(
      contract.findings.some(
        (finding) => (finding.businessContextNotes ?? []).length > 0
      )
    ).toBe(true);
  });

  it("suppresses Auth0 role findings when roles are intentionally unused by design", () => {
    const snapshot = loadAuth0Snapshot("risky-tenant.snapshot.json");
    const baseline = analyzeAuth0Snapshot(snapshot, { environment: "production" });
    expect(baseline.findings.some((finding) => finding.id === "AUTH-RBAC-001")).toBe(
      true
    );

    const report = analyzeAuth0Snapshot(snapshot, {
      environment: "production",
      businessContext: {
        ...BUSINESS_CONTEXT,
        designDecisions: [
          {
            id: "auth0-roles-external-by-design",
            provider: "auth0",
            effect: "suppress-finding",
            decision:
              "Authorization is managed in the application domain model, not with Auth0 roles.",
            rationale:
              "Product entitlements are evaluated downstream and covered by separate access reviews.",
            owner: "IAM Architecture",
            appliesTo: {
              findingIds: ["AUTH-RBAC-001"]
            }
          }
        ]
      }
    });

    expect(report.findings.some((finding) => finding.id === "AUTH-RBAC-001")).toBe(
      false
    );
    expect(report.consolidatedFindings.some((finding) => finding.id === "AUTH-RBAC-001")).toBe(
      false
    );
    expect(report.remediationPlan.buckets.flatMap((bucket) => bucket.items)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ findingId: "AUTH-RBAC-001" })
      ])
    );
    expect(report.assumptions.join("\n")).toContain(
      "auth0-roles-external-by-design"
    );

    const markdown = renderAuth0Report(report);
    const html = renderAuth0ReportHtml(report);
    const contract = buildAuth0ReportContractV1(report, snapshot);

    expect(markdown).not.toContain("AUTH-RBAC-001");
    expect(html).not.toContain("AUTH-RBAC-001");
    expect(contract.findings.some((finding) => finding.id === "AUTH-RBAC-001")).toBe(
      false
    );
    expect(contract.businessContext?.designDecisions?.[0].id).toBe(
      "auth0-roles-external-by-design"
    );
  });

  it("adds deterministic Okta context assumptions and finding notes without changing evidence", () => {
    const snapshot = loadOktaSnapshot("risky-org.snapshot.json");
    const baseline = analyzeOktaSnapshot(snapshot, {
      environment: "production",
      includeIdentifiers: false
    });
    const report = analyzeOktaSnapshot(snapshot, {
      environment: "production",
      includeIdentifiers: false,
      businessContext: {
        ...BUSINESS_CONTEXT,
        identityUseCase: "workforce-identity"
      }
    });

    expect(report.businessContext?.identityUseCase).toBe("workforce-identity");
    expect(report.assumptions.join("\n")).toContain(
      "Business context profile provided"
    );
    expect(report.conclusion.join("\n")).toContain(
      "Business context profile was applied deterministically"
    );

    const notedFinding = report.findings.find(
      (finding) => (finding.businessContextNotes ?? []).length > 0
    );
    expect(notedFinding).toBeDefined();
    const baselineFinding = baseline.findings.find(
      (finding) => finding.id === notedFinding?.id
    );
    expect(notedFinding?.evidence).toBe(baselineFinding?.evidence);

    const markdown = renderOktaReport(report);
    const html = renderOktaReportHtml(report);
    expect(markdown).toContain("Business context notes");
    expect(html).toContain("Business Context Notes");

    const contract = buildOktaReportContractV1(report, snapshot);
    expect(contract.businessContext?.identityUseCase).toBe("workforce-identity");
    expect(
      contract.findings.some(
        (finding) => (finding.businessContextNotes ?? []).length > 0
      )
    ).toBe(true);
  });
});

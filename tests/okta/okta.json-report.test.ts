import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { readJsonSync } from "../../src/core/filesystem";
import {
  buildOktaReportContractV1,
  renderReportContractV1Json
} from "../../src/reporting/json/report-contract";
import { REPORT_CONTRACT_V1_SCHEMA_VERSION } from "../../src/reporting/json/report-contract.types";

function loadSnapshot(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(
    path.join(process.cwd(), "fixtures", "okta", name)
  );
}

describe("Okta JSON report contract", () => {
  it("builds Report Contract v1 with stable fingerprints", () => {
    const snapshot = loadSnapshot("risky-org.snapshot.json");

    const contractA = buildOktaReportContractV1(
      analyzeOktaSnapshot(snapshot, {
        environment: "production",
        includeIdentifiers: false
      }),
      snapshot
    );
    const contractB = buildOktaReportContractV1(
      analyzeOktaSnapshot(snapshot, {
        environment: "production",
        includeIdentifiers: false
      }),
      snapshot
    );

    expect(contractA.schemaVersion).toBe(REPORT_CONTRACT_V1_SCHEMA_VERSION);
    expect(contractA.provider.id).toBe("okta");
    expect(contractA.provider.includeIdentifiers).toBe(false);
    expect(contractA.tenant.primaryIdentifier).toBe(snapshot.metadata.orgUrl);
    expect(contractA.findings.length).toBeGreaterThan(0);
    expect(contractA.coverage.collectors.length).toBeGreaterThan(0);
    expect(contractA.positiveSignals.length).toBeGreaterThan(0);
    expect(contractA.opportunities).toEqual([]);
    expect(contractA.compliance).toBeUndefined();
    expect(contractA.findings[0].classification).toMatch(
      /confirmed-risk|requires-validation|advisory|positive-signal/
    );

    expect(
      contractA.findings.map((finding) => ({
        id: finding.id,
        fingerprint: finding.fingerprint
      }))
    ).toEqual(
      contractB.findings.map((finding) => ({
        id: finding.id,
        fingerprint: finding.fingerprint
      }))
    );
  });

  it("can include opt-in structured compliance mapping", () => {
    const snapshot = loadSnapshot("risky-org.snapshot.json");
    const contract = buildOktaReportContractV1(
      analyzeOktaSnapshot(snapshot, {
        environment: "production",
        includeIdentifiers: false
      }),
      snapshot,
      { complianceFrameworks: ["iso27001"] }
    );

    expect(contract.compliance?.frameworks).toEqual(["iso27001"]);
    expect(contract.compliance?.summary.mappedFindings).toBeGreaterThan(0);
    expect(contract.compliance?.limitations.join(" ")).toMatch(/manual evidence/i);
  });

  it("does not leak raw secret-like snapshot fields into JSON output", () => {
    const snapshot = loadSnapshot("healthy-org.snapshot.json");
    const snapshotWithSecret = JSON.parse(
      JSON.stringify(snapshot)
    ) as OktaOrgSnapshot & { org?: Record<string, unknown> };

    snapshotWithSecret.org = {
      ...(snapshotWithSecret.org ?? {}),
      apiToken: "super-secret-okta-value"
    };

    const contract = buildOktaReportContractV1(
      analyzeOktaSnapshot(snapshotWithSecret, {
        environment: "production",
        includeIdentifiers: false
      }),
      snapshotWithSecret
    );
    const json = renderReportContractV1Json(contract);

    expect(json).not.toContain("super-secret-okta-value");
    expect(json).not.toContain("apiToken");
  });
});

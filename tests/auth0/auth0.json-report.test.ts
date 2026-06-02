import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { readJsonSync } from "../../src/core/filesystem";
import {
  buildAuth0ReportContractV1,
  renderReportContractV1Json
} from "../../src/reporting/json/report-contract";
import { REPORT_CONTRACT_V1_SCHEMA_VERSION } from "../../src/reporting/json/report-contract.types";

function loadSnapshot(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(
    path.join(process.cwd(), "fixtures", "auth0", name)
  );
}

describe("Auth0 JSON report contract", () => {
  it("builds Report Contract v1 with stable fingerprints", () => {
    const snapshot = loadSnapshot("risky-tenant.snapshot.json");

    const contractA = buildAuth0ReportContractV1(
      analyzeAuth0Snapshot(snapshot, { environment: "production" }),
      snapshot
    );
    const contractB = buildAuth0ReportContractV1(
      analyzeAuth0Snapshot(snapshot, { environment: "production" }),
      snapshot
    );

    expect(contractA.schemaVersion).toBe(REPORT_CONTRACT_V1_SCHEMA_VERSION);
    expect(contractA.provider.id).toBe("auth0");
    expect(contractA.tenant.primaryIdentifier).toBe(snapshot.metadata.domain);
    expect(contractA.findings.length).toBeGreaterThan(0);
    expect(contractA.coverage.collectors.length).toBeGreaterThan(0);
    expect(contractA.limitations.length).toBeGreaterThan(0);
    expect(contractA.positiveSignals.length).toBeGreaterThan(0);
    expect(contractA.findings[0]).toMatchObject({
      provider: "auth0"
    });
    expect(contractA.findings[0].fingerprint).toMatch(/^fp_[a-f0-9]{24}$/);
    expect(contractA.findings[0].affectedResources[0]).toMatchObject({
      id: expect.stringMatching(/^res_[a-f0-9]{16}$/),
      displayName: expect.any(String),
      kind: expect.any(String),
      masked: expect.any(Boolean)
    });

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

  it("does not leak raw secret-like snapshot fields into JSON output", () => {
    const snapshot = loadSnapshot("healthy-tenant.snapshot.json");
    const snapshotWithSecret = JSON.parse(
      JSON.stringify(snapshot)
    ) as Auth0TenantSnapshot & { tenant?: Record<string, unknown> };

    snapshotWithSecret.tenant = {
      ...(snapshotWithSecret.tenant ?? {}),
      client_secret: "super-secret-auth0-value"
    };

    const contract = buildAuth0ReportContractV1(
      analyzeAuth0Snapshot(snapshotWithSecret, { environment: "production" }),
      snapshotWithSecret
    );
    const json = renderReportContractV1Json(contract);

    expect(json).not.toContain("super-secret-auth0-value");
    expect(json).not.toContain("client_secret");
  });
});

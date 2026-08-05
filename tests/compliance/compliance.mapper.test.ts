import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import {
  COMPLIANCE_CONTROLS,
  FINDING_COMPLIANCE_MAPPINGS,
  getComplianceControl,
  mapFindingToCompliance,
  mapReportToCompliance,
  renderComplianceMappingJson
} from "../../src/compliance";
import { readJsonSync } from "../../src/core/filesystem";
import {
  buildAuth0ReportContractV1,
  buildOktaReportContractV1
} from "../../src/reporting/json/report-contract";
import {
  ReportProviderId,
  StructuredReportV1
} from "../../src/reporting/json/report-contract.types";

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

function mappingFor(provider: ReportProviderId, findingId: string) {
  return FINDING_COMPLIANCE_MAPPINGS.find(
    (mapping) => mapping.provider === provider && mapping.findingId === findingId
  );
}

describe("compliance mapping layer", () => {
  it("defines a conservative control registry for all supported frameworks", () => {
    const frameworks = new Set(COMPLIANCE_CONTROLS.map((control) => control.framework));
    expect(frameworks).toEqual(new Set(["nis2", "iso27001", "soc2"]));
    expect(
      COMPLIANCE_CONTROLS.filter((control) => control.framework === "nis2")
        .length
    ).toBeGreaterThanOrEqual(9);
    expect(
      COMPLIANCE_CONTROLS.filter((control) => control.framework === "iso27001")
        .length
    ).toBeGreaterThanOrEqual(10);
    expect(
      COMPLIANCE_CONTROLS.filter((control) => control.framework === "soc2")
        .length
    ).toBeGreaterThanOrEqual(10);

    for (const control of COMPLIANCE_CONTROLS) {
      expect(control.source).toBe("docs/compliance/identity-control-matrix.md");
      expect(control.scannerEvidence.length).toBeGreaterThan(0);
      expect(control.manualEvidence.length).toBeGreaterThan(0);
      expect(control.supportedProviders.length).toBeGreaterThan(0);
      expect(control.reportWordingGuidance).not.toMatch(
        /certif|is compliant|compliance guarantee/i
      );
    }
  });

  it("keeps finding mappings explicit and prevents blind framework overmapping", () => {
    for (const mapping of FINDING_COMPLIANCE_MAPPINGS) {
      const seen = new Set<string>();
      expect(mapping.controls.length).toBeGreaterThan(0);
      expect(mapping.controls.length).toBeLessThanOrEqual(8);

      for (const controlRef of mapping.controls) {
        const key = `${controlRef.framework}:${controlRef.controlId}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        expect(
          getComplianceControl(controlRef.framework, controlRef.controlId)
        ).toBeDefined();
      }
    }

    expect(mappingFor("auth0", "AUTH-SEC-005")?.controls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          framework: "nis2",
          controlId: "Article 21(2)(j)",
          relevance: "direct"
        }),
        expect.objectContaining({
          framework: "iso27001",
          controlId: "A.8.5",
          relevance: "direct"
        }),
        expect.objectContaining({
          framework: "soc2",
          controlId: "CC6.5"
        })
      ])
    );
    expect(mappingFor("auth0", "AUTH-SEC-005")?.controls).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ framework: "iso27001", controlId: "A.5.9" })
      ])
    );
  });

  it("maps fixture-derived Auth0 and Okta report findings to structured controls", () => {
    const auth0 = auth0Contract();
    const okta = oktaContract();
    const auth0Mapped = mapReportToCompliance(auth0);
    const oktaMapped = mapReportToCompliance(okta);

    expect(auth0Mapped.source.provider).toBe("auth0");
    expect(oktaMapped.source.provider).toBe("okta");
    expect(auth0Mapped.summary.mappedFindings).toBeGreaterThan(0);
    expect(oktaMapped.summary.mappedFindings).toBeGreaterThan(0);
    expect(auth0Mapped.summary.manualEvidenceRequired).toBe(true);
    expect(oktaMapped.summary.manualEvidenceRequired).toBe(true);
    expect(
      auth0Mapped.controls.some((control) => control.relatedFindings.length > 0)
    ).toBe(true);
    expect(
      oktaMapped.controls.some((control) => control.relatedFindings.length > 0)
    ).toBe(true);
    expect(auth0Mapped.limitations.join(" ")).toMatch(/do not certify/i);
  });

  it("supports framework filtering and unmapped findings", () => {
    const report = auth0Contract();
    const isoOnly = mapReportToCompliance(report, { frameworks: ["iso27001"] });
    expect(new Set(isoOnly.controls.map((control) => control.framework))).toEqual(
      new Set(["iso27001"])
    );
    expect(
      isoOnly.mappedFindings.every((finding) =>
        finding.controls.every((control) => control.framework === "iso27001")
      )
    ).toBe(true);

    const unknown = {
      ...report.findings[0],
      id: "AUTH-UNKNOWN-999"
    };
    expect(mapFindingToCompliance(unknown)).toBeUndefined();
  });

  it("serializes deterministic compliance mapping JSON", () => {
    const report = oktaContract();
    const first = mapReportToCompliance(report);
    const second = mapReportToCompliance(report);

    expect(renderComplianceMappingJson(first)).toEqual(
      renderComplianceMappingJson(second)
    );
  });
});

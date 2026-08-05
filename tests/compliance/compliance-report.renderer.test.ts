import * as path from "path";
import { describe, expect, it } from "vitest";
import {
  parseComplianceFrameworks,
  resolveComplianceOptions
} from "../../src/cli/compliance-options";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { readJsonSync } from "../../src/core/filesystem";
import {
  appendComplianceMappingHtml,
  renderComplianceMappingHtml,
  renderComplianceMappingMarkdown
} from "../../src/reporting/compliance/compliance-report.renderer";
import { renderAuth0ReportHtml } from "../../src/reporting/html/auth0-report.html-renderer";
import {
  buildAuth0ReportContractV1
} from "../../src/reporting/json/report-contract";

function loadAuth0(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(
    path.join(process.cwd(), "fixtures", "auth0", name)
  );
}

describe("compliance report rendering", () => {
  it("parses opt-in compliance options and framework filters", () => {
    expect(resolveComplianceOptions({}).enabled).toBe(false);
    expect(resolveComplianceOptions({ compliance: true }).frameworks).toEqual([
      "nis2",
      "iso27001",
      "soc2"
    ]);
    expect(resolveComplianceOptions({ framework: "nis2,soc2" })).toMatchObject({
      enabled: true,
      frameworks: ["nis2", "soc2"]
    });
    expect(parseComplianceFrameworks("all")).toEqual([
      "nis2",
      "iso27001",
      "soc2"
    ]);
    expect(() => parseComplianceFrameworks("pci")).toThrow(
      /Invalid compliance framework/
    );
  });

  it("renders Markdown and HTML compliance sections without certification claims", () => {
    const snapshot = loadAuth0("risky-tenant.snapshot.json");
    const report = analyzeAuth0Snapshot(snapshot, { environment: "production" });
    const contract = buildAuth0ReportContractV1(report, snapshot, {
      complianceFrameworks: ["nis2", "iso27001"]
    });
    expect(contract.compliance).toBeDefined();

    const markdown = renderComplianceMappingMarkdown(contract.compliance!);
    expect(markdown).toContain("## Compliance Evidence Mapping");
    expect(markdown).toContain("Manual evidence");
    expect(markdown).toContain("AUTH-SEC-005");
    expect(markdown).toContain("does not certify compliance");
    expect(markdown).not.toContain("is compliant");

    const html = renderComplianceMappingHtml(contract.compliance!);
    expect(html).toContain("Compliance Evidence Mapping");
    expect(html).toContain("Manual Evidence Required");
    expect(html).toContain("AUTH-SEC-005");
    expect(html).toContain("does not certify compliance");
    expect(html).not.toContain("is compliant");
  });

  it("appends compliance HTML to existing provider reports", () => {
    const snapshot = loadAuth0("risky-tenant.snapshot.json");
    const report = analyzeAuth0Snapshot(snapshot, { environment: "production" });
    const contract = buildAuth0ReportContractV1(report, snapshot, {
      complianceFrameworks: ["soc2"]
    });

    const html = appendComplianceMappingHtml(
      renderAuth0ReportHtml(report),
      contract.compliance!
    );

    expect(html).toContain("Auth0 Posture Report");
    expect(html).toContain("Compliance Evidence Mapping");
    expect(html).toContain("SOC 2");
    expect(html.indexOf("Compliance Evidence Mapping")).toBeLessThan(
      html.indexOf("</body>")
    );
  });
});

import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");

function load(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, name));
}

describe("markdown renderer", () => {
  it("renders all required sections from a healthy snapshot", () => {
    const md = renderAuth0Report(analyzeAuth0Snapshot(load("healthy-tenant.snapshot.json")));
    expect(md).toContain("# Auth0 Tenant Posture Report");
    expect(md).toContain("## Executive Summary");
    expect(md).toContain("## Overall Score");
    expect(md).toContain("## Category Breakdown");
    expect(md).toContain("## Critical Findings");
    expect(md).toContain("## High Findings");
    expect(md).toContain("## Medium Findings");
    expect(md).toContain("## Low Findings");
    expect(md).toContain("## Opportunities");
    expect(md).toContain("## Resource Coverage");
    expect(md).toContain("## Collection Status");
    expect(md).toContain("## Appendix: Methodology");
  });

  it("includes critical findings for risky tenant", () => {
    const md = renderAuth0Report(analyzeAuth0Snapshot(load("risky-tenant.snapshot.json")));
    expect(md).toMatch(/AUTH-EXT-001/);
    expect(md).toMatch(/AUTH-SEC-001/);
  });

  it("flags partial scan in collection status section", () => {
    const md = renderAuth0Report(analyzeAuth0Snapshot(load("partial-scope.snapshot.json")));
    expect(md).toMatch(/Partial scan: \*\*yes\*\*/i);
    expect(md).toContain("read:rules");
  });

  it("renders findings without leaking redacted markers as plain secrets", () => {
    const md = renderAuth0Report(analyzeAuth0Snapshot(load("risky-tenant.snapshot.json")));
    expect(md).not.toMatch(/-----BEGIN [A-Z ]*PRIVATE KEY-----/);
  });
});

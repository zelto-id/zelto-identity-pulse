import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");
const load = (n: string): Auth0TenantSnapshot =>
  readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, n));

describe("renderer (extended sections)", () => {
  it("renders Assessment Assumptions and Recommended Remediation Plan", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "production"
      })
    );
    expect(md).toContain("## Assessment Assumptions");
    expect(md).toContain("## Recommended Remediation Plan");
    expect(md).toContain("### Immediate (0–7 days)");
    expect(md).toContain("### Short Term (2–4 weeks)");
    expect(md).toContain("### Later (1–2 months)");
  });

  it("includes Confidence and Confidence reason columns in Category Breakdown", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("healthy-tenant.snapshot.json"))
    );
    expect(md).toMatch(/\| Category \| Score \| Weight \| Findings \| Confidence \| Confidence reason \|/);
  });

  it("renders environment in metadata header", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("healthy-tenant.snapshot.json"), {
        environment: "staging"
      })
    );
    expect(md).toMatch(/\*\*Environment:\*\* `staging`/);
  });

  it("renders Partial Scan Impact subsection when scan is partial", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("partial-scope.snapshot.json"))
    );
    expect(md).toContain("### Partial Scan Impact");
  });

  it("renders What Was Not Assessed section", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("partial-scope.snapshot.json"))
    );
    expect(md).toContain("## What Was Not Assessed");
  });

  it("renders grouped Opportunities (4 groups) when there are findings", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"))
    );
    expect(md).toContain("### Quick Wins");
    expect(md).toContain("### Security Hardening");
    expect(md).toContain("### Audit Readiness");
    expect(md).toContain("### Architecture & Maturity");
  });

  it("renders engineering enrichment fields on findings", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"))
    );
    expect(md).toMatch(/#### Remediation/);
    expect(md).toMatch(/\*\*Auth0 Dashboard\*\*/);
    expect(md).toMatch(/\*\*Terraform\*\*/);
    expect(md).toMatch(/\*\*Validation\*\*/);
  });
});

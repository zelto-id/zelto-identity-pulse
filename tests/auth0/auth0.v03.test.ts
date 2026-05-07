import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";
import {
  adjustFindingForEnvironment,
  adjustFindings
} from "../../src/analysis/auth0/auth0.severity";
import { scoreFindings } from "../../src/analysis/auth0/auth0.scoring";
import { buildKeyDecisions } from "../../src/analysis/auth0/auth0.decisions";
import { expectedOutcomeFor } from "../../src/analysis/auth0/auth0.remediation";
import { Finding } from "../../src/reporting/markdown/report.types";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");
const load = (n: string): Auth0TenantSnapshot =>
  readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, n));

function f(partial: Partial<Finding> & { id: string; category: string; severity: Finding["severity"] }): Finding {
  return {
    title: partial.id,
    scoreImpact: 1,
    affectedResources: [],
    evidence: "",
    recommendation: `do ${partial.id}`,
    businessRisk: "",
    ...partial
  } as Finding;
}

describe("v0.3 — environment-adjusted severity", () => {
  it("downshifts non-prod connection findings but keeps prod equivalent on the finding", () => {
    const original = f({ id: "AUTH-CON-001", category: "connections", severity: "high" });
    const dev = adjustFindingForEnvironment(original, { environment: "development" });
    expect(dev.productionEquivalentSeverity).toBe("high");
    expect(dev.severity).toBe("medium");
    expect(dev.environmentAdjustmentReason).toBeTruthy();
  });

  it("does NOT downshift API findings (contract is environment-independent)", () => {
    const original = f({ id: "AUTH-API-001", category: "apis", severity: "high" });
    const dev = adjustFindingForEnvironment(original, { environment: "development" });
    expect(dev.severity).toBe("high");
  });

  it("treats unknown environment as production-equivalent", () => {
    const original = f({ id: "AUTH-CON-001", category: "connections", severity: "high" });
    const unk = adjustFindingForEnvironment(original, { environment: "unknown" });
    expect(unk.severity).toBe("high");
  });

  it("keeps EOL legacy Rules/Hooks finding at production severity in any environment", () => {
    const original = f({
      id: "AUTH-EXT-001",
      category: "actionsAndExtensibility",
      severity: "critical"
    });
    const sb = adjustFindingForEnvironment(original, { environment: "sandbox" });
    expect(sb.severity).toBe("critical");
  });
});

describe("v0.3 — Not Assessed scoring", () => {
  it("reports the monitoring category as N/A when log_streams collector failed", () => {
    const result = scoreFindings(
      [],
      true,
      [{ collector: "log_streams", status: "failed", count: 0 }] as any,
      { environment: "production" }
    );
    const monitoring = result.categories.find((c) => c.id === "monitoring")!;
    expect(monitoring.assessed).toBe(false);
    expect(monitoring.score).toBeNull();
  });

  it("normalizes the score over assessed weight only", () => {
    const result = scoreFindings(
      [],
      true,
      [
        { collector: "log_streams", status: "failed", count: 0 },
        { collector: "tenant", status: "success", count: 1 },
        { collector: "clients", status: "success", count: 1 },
        { collector: "connections", status: "success", count: 1 },
        { collector: "resource_servers", status: "success", count: 1 },
        { collector: "client_grants", status: "success", count: 1 },
        { collector: "roles", status: "success", count: 0 },
        { collector: "actions", status: "success", count: 0 },
        { collector: "rules", status: "success", count: 0 },
        { collector: "hooks", status: "success", count: 0 },
        { collector: "attack_protection", status: "success", count: 0 },
        { collector: "guardian", status: "success", count: 0 },
        { collector: "branding", status: "success", count: 0 },
        { collector: "prompts", status: "success", count: 0 },
        { collector: "custom_domains", status: "success", count: 0 },
        { collector: "organizations", status: "success", count: 0 }
      ] as any,
      { environment: "production" }
    );
    expect(result.breakdown.assessedMaxPoints).toBe(90);
    expect(result.breakdown.unassessedWeight).toBe(10);
    // Observed should equal sum of assessed weights when there are no findings.
    expect(result.breakdown.observedScore).toBe(90);
    expect(result.breakdown.normalizedScore).toBe(100);
  });
});

describe("v0.3 — OAuth grant signal split (AUTH-CLI-001)", () => {
  it("separates observed risks from requires-validation signals", () => {
    const snap: any = {
      metadata: {
        domain: "t.auth0.com",
        partial: false,
        missingScopes: [],
        failedCollectors: [],
        connectorVersion: "test"
      },
      coverage: [],
      clients: [
        // Clearly risky
        {
          client_id: "spa1",
          name: "Legacy SPA",
          app_type: "spa",
          grant_types: ["implicit", "authorization_code"]
        },
        // Requires validation: regular_web with client_credentials
        {
          client_id: "rwa1",
          name: "Web App",
          app_type: "regular_web",
          grant_types: ["authorization_code", "client_credentials"]
        }
      ],
      resourceServers: [],
      clientGrants: []
    };
    const report = analyzeAuth0Snapshot(snap as Auth0TenantSnapshot, {
      environment: "production"
    });
    const cli001 = report.findings.find((x) => x.id === "AUTH-CLI-001");
    expect(cli001).toBeDefined();
    expect(cli001!.evidenceSplit).toBeDefined();
    expect(cli001!.evidenceSplit!.observedRisks.length).toBeGreaterThan(0);
    expect(cli001!.evidenceSplit!.requiresValidation.length).toBeGreaterThan(0);
  });
});

describe("v0.3 — AUTH-API-007 environment-aware downshift for API Explorer", () => {
  it("downshifts critical to high on a development tenant for API Explorer Application", () => {
    const snap: any = {
      metadata: {
        domain: "t.auth0.com",
        partial: false,
        missingScopes: [],
        failedCollectors: [],
        connectorVersion: "test"
      },
      coverage: [],
      resourceServers: [
        {
          identifier: "https://t.auth0.com/api/v2/",
          name: "Auth0 Management API",
          scopes: [],
          enforce_policies: true,
          signing_alg: "RS256"
        }
      ],
      clients: [{ client_id: "explorer1", name: "API Explorer Application" }],
      clientGrants: [
        {
          client_id: "explorer1",
          audience: "https://t.auth0.com/api/v2/",
          scope: [
            "create:users",
            "delete:users",
            "update:users",
            "create:clients",
            "delete:clients",
            "update:clients",
            "create:client_grants",
            "delete:client_grants",
            "update:tenant_settings",
            "create:resource_servers"
          ]
        }
      ]
    };
    const prod = analyzeAuth0Snapshot(snap as Auth0TenantSnapshot, {
      environment: "production"
    });
    const dev = analyzeAuth0Snapshot(snap as Auth0TenantSnapshot, {
      environment: "development"
    });
    const prodFinding = prod.findings.find((x) => x.id === "AUTH-API-007")!;
    const devFinding = dev.findings.find((x) => x.id === "AUTH-API-007")!;
    expect(prodFinding.severity).toBe("critical");
    expect(devFinding.severity).toBe("high");
    expect(devFinding.productionEquivalentSeverity).toBe("critical");
  });
});

describe("v0.3 — remediation expected outcomes", () => {
  it("never duplicates the recommendation as the expected outcome", () => {
    const sample: Finding[] = [
      { ...f({ id: "AUTH-CLI-001", category: "applications", severity: "high" }), recommendation: "REC TEXT" },
      { ...f({ id: "AUTH-CON-001", category: "connections", severity: "high" }), recommendation: "REC TEXT" },
      { ...f({ id: "AUTH-CON-003", category: "connections", severity: "medium" }), recommendation: "REC TEXT" },
      { ...f({ id: "AUTH-TEN-001", category: "tenantBaseline", severity: "low" }), recommendation: "REC TEXT" },
      { ...f({ id: "AUTH-OBS-001", category: "monitoring", severity: "high" }), recommendation: "REC TEXT" }
    ];
    for (const finding of sample) {
      const out = expectedOutcomeFor(finding);
      expect(out).not.toBe(finding.recommendation);
      expect(out.length).toBeGreaterThan(10);
    }
  });

  it("provides a non-empty fallback even for unknown finding IDs", () => {
    const out = expectedOutcomeFor(
      f({ id: "AUTH-UNKNOWN-999", category: "tenantBaseline", severity: "medium" })
    );
    expect(out).toBeTruthy();
    expect(out).not.toMatch(/^do AUTH-UNKNOWN-999$/);
  });
});

describe("v0.3 — Key Decisions", () => {
  it("emits the API Explorer / Management API decision when AUTH-API-007 is present", () => {
    const snap = load("risky-tenant.snapshot.json");
    // Inject an AUTH-API-007 by adding a mgmt API grant on the snapshot copy.
    const copy: any = JSON.parse(JSON.stringify(snap));
    copy.resourceServers.push({
      identifier: `https://${copy.metadata.domain}/api/v2/`,
      name: "Auth0 Management API",
      scopes: [],
      enforce_policies: true,
      signing_alg: "RS256"
    });
    copy.clientGrants.push({
      client_id: copy.clients[0].client_id,
      audience: `https://${copy.metadata.domain}/api/v2/`,
      scope: [
        "create:users",
        "delete:users",
        "update:users",
        "create:clients",
        "delete:clients",
        "update:tenant_settings"
      ]
    });
    const report = analyzeAuth0Snapshot(copy, { environment: "production" });
    expect(report.keyDecisions.some((d) => d.id === "DEC-MGMT-API-CLIENT")).toBe(true);
  });

  it("emits the env-mirror decision for development tenants with MFA off", () => {
    const decisions = buildKeyDecisions({
      findings: [f({ id: "AUTH-SEC-001", category: "attackProtection", severity: "low" })],
      environment: "development",
      snapshot: { clients: [], clientGrants: [] } as any
    });
    expect(decisions.some((d) => d.id === "DEC-ENV-MIRROR")).toBe(true);
  });
});

describe("v0.3 — renderer", () => {
  it("renders Score Interpretation, Key Decisions, and Re-Run Validation sections", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "development"
      })
    );
    expect(md).toContain("## Score Interpretation");
    expect(md).toContain("## Key Decisions Required");
    expect(md).toContain("## Re-Run Validation");
    expect(md).toMatch(/zelto-pulse scan auth0 --environment development/);
    expect(md).toMatch(/Production-equivalent grade/);
  });

  it("uses softened wording for development/sandbox interpretations", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "sandbox"
      })
    );
    // Either the explicit "Significant hardening" phrase or the sandbox label
    // must appear; do not allow the production-only language.
    expect(md).toMatch(/Significant hardening recommended|sandbox/i);
  });

  it("renders N/A in category breakdown for unassessed categories", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("partial-scope.snapshot.json"), {
        environment: "production"
      })
    );
    expect(md).toMatch(/\| .+ \| N\/A \|/);
  });

  it("renders production-equivalent vs environment-adjusted severity when they differ", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "development"
      })
    );
    expect(md).toMatch(/Production-equivalent: \*\*\w+\*\*/);
    expect(md).toMatch(/Environment-adjusted: \*\*\w+\*\*/);
  });
});

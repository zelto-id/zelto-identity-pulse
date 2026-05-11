import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { runAllRules } from "../../src/analysis/auth0/auth0.rules";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");

function load(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, name));
}

describe("rules", () => {
  it("flags non-rotating refresh tokens on SPA clients", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-CLI-004")).toBe(true);
  });

  it("flags HS256-signed APIs", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-API-001")).toBe(true);
  });

  it("flags Rules/Hooks usage when rules/hooks are present in snapshot", () => {
    // The risky fixture has rules and hooks arrays with data. The rule fires
    // when the snapshot contains legacy extensibility (collected via
    // --include-legacy-extensibility flag or explicitly set in a snapshot).
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-EXT-001")).toBe(true);
  });

  it("does NOT fire AUTH-EXT-001 when rules and hooks are both undefined (default collection)", () => {
    // When rules/hooks are not collected (default), they are undefined in the
    // snapshot. The rule must not treat absence as a positive or negative signal.
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      // rules and hooks intentionally absent (undefined)
      clients: [],
      connections: [],
      resourceServers: [],
      clientGrants: [],
      roles: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    expect(findings.some((f) => f.id === "AUTH-EXT-001")).toBe(false);
  });

  it("flags missing log streams", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-OBS-001")).toBe(true);
  });

  it("flags guardian MFA policy = never", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-SEC-001")).toBe(true);
    // AUTH-SEC-001 is now high severity (CIAM-aware, not blanket critical)
    const f = findings.find((x) => x.id === "AUTH-SEC-001")!;
    expect(f.severity).toBe("high");
    expect(f.scoreImpact).toBe(12); // SEVERITY_SCORE_IMPACT.high
  });

  it("AUTH-SEC-001 includes Actions assessment note when actions collector failed", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: true, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [
        { collector: "actions", status: "failed", count: 0, requiredScopes: [] }
      ],
      guardian: { policy: "never", factors: [] },
      clients: [],
      connections: [],
      resourceServers: [],
      clientGrants: [],
      roles: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const f = findings.find((x) => x.id === "AUTH-SEC-001")!;
    expect(f).toBeDefined();
    expect(f.evidence).toMatch(/Actions were not assessed/i);
    expect(f.confidence).toBe("medium");
  });

  it("AUTH-CON-003 custom DB scripts are advisory (info, scoreImpact=0) by default", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      connections: [
        {
          id: "con1",
          name: "Custom DB",
          strategy: "auth0",
          options: {
            enabledDatabaseCustomization: true,
            customScripts: { login: "function login(email, password, callback) {}" }
          }
        }
      ],
      clients: [],
      resourceServers: [],
      clientGrants: [],
      roles: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const f = findings.find((x) => x.id === "AUTH-CON-003")!;
    expect(f).toBeDefined();
    expect(f.severity).toBe("info");
    expect(f.scoreImpact).toBe(0);
  });

  it("AUTH-RBAC-001 is informational (info, scoreImpact=0) when no elevation signals", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      roles: [],
      // No unenforced APIs with scopes, no organizations, no org clients
      resourceServers: [],
      clients: [],
      connections: [],
      clientGrants: [],
      organizations: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const f = findings.find((x) => x.id === "AUTH-RBAC-001")!;
    expect(f).toBeDefined();
    expect(f.severity).toBe("info");
    expect(f.scoreImpact).toBe(0);
  });

  it("AUTH-RBAC-001 elevates to medium when unenforced APIs with scopes exist", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      roles: [],
      resourceServers: [
        { identifier: "https://api.example.com/", name: "Example API", scopes: [{ value: "read:data" }], enforce_policies: false }
      ],
      clients: [],
      connections: [],
      clientGrants: [],
      organizations: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const f = findings.find((x) => x.id === "AUTH-RBAC-001")!;
    expect(f).toBeDefined();
    expect(f.severity).toBe("medium");
    expect(f.scoreImpact).toBeGreaterThan(0);
  });

  it("AUTH-API-007 groups multiple management API grants into one finding", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      resourceServers: [
        { identifier: "https://t.auth0.com/api/v2/", name: "Auth0 Management API", scopes: [], enforce_policies: true, signing_alg: "RS256" }
      ],
      clients: [
        { client_id: "c1", name: "Ops Bot" },
        { client_id: "c2", name: "CI Pipeline" }
      ],
      clientGrants: [
        { client_id: "c1", audience: "https://t.auth0.com/api/v2/", scope: ["create:users", "delete:users", "update:clients"] },
        { client_id: "c2", audience: "https://t.auth0.com/api/v2/", scope: ["read:users", "read:clients"] }
      ],
      connections: [],
      roles: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const mgmtFindings = findings.filter((x) => x.id === "AUTH-API-007");
    // Must be grouped into exactly one finding
    expect(mgmtFindings.length).toBe(1);
    const f = mgmtFindings[0];
    // Both clients should appear in affectedResources
    expect(f.affectedResources.length).toBe(2);
    // Highest severity (from c1 which has write/delete) should dominate
    expect(["high", "critical"]).toContain(f.severity);
    // Evidence must mention Management API is a default platform API
    expect(f.evidence).toMatch(/default platform API/i);
    expect(f.title).toMatch(/broader than least privilege/i);
  });

  it("does not flag healthy tenant for critical issues", () => {
    const findings = runAllRules(load("healthy-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-CLI-004")).toBe(false);
    expect(findings.some((f) => f.id === "AUTH-EXT-001")).toBe(false);
    expect(findings.some((f) => f.id === "AUTH-SEC-001")).toBe(false);
    expect(findings.some((f) => f.id === "AUTH-OBS-001")).toBe(false);
  });

  it("does not crash on partial snapshots and emits coverage finding", () => {
    const findings = runAllRules(load("partial-scope.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-COV-001")).toBe(true);
  });
});

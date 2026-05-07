import { describe, expect, it } from "vitest";
import {
  buildClientLookup,
  buildResourceServerLookup,
  classifyMgmtScopes,
  formatClientGrantName,
  formatClientName,
  formatResourceServerName,
  isManagementApiIdentifier
} from "../../src/connectors/auth0/auth0.naming";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { runAllRules } from "../../src/analysis/auth0/auth0.rules";

describe("naming helpers", () => {
  it("detects Auth0 Management API identifiers", () => {
    expect(isManagementApiIdentifier("https://acme.auth0.com/api/v2/")).toBe(true);
    expect(isManagementApiIdentifier("https://acme.eu.auth0.com/api/v2")).toBe(true);
    expect(isManagementApiIdentifier("https://api.acme.com/")).toBe(false);
    expect(isManagementApiIdentifier(undefined)).toBe(false);
  });

  it("formats client / resource-server / connection names", () => {
    expect(
      formatClientName({
        client_id: "abcdef1234567890",
        name: "My SPA"
      } as any)
    ).toMatch(/My SPA \(abcdef12/);
    expect(
      formatResourceServerName({
        identifier: "https://api.acme.com/",
        name: "Acme API"
      } as any)
    ).toBe("Acme API — https://api.acme.com/");
    expect(
      formatResourceServerName({
        identifier: "https://acme.auth0.com/api/v2/",
        name: "Auth0 Management API"
      } as any)
    ).toMatch(/Auth0 Management API/);
  });

  it("resolves client grant names via lookups", () => {
    const snap: Partial<Auth0TenantSnapshot> = {
      clients: [{ client_id: "cid_123456", name: "Backend M2M" } as any],
      resourceServers: [
        { identifier: "https://api.acme.com/", name: "Acme API" } as any
      ]
    };
    const cl = buildClientLookup(snap as Auth0TenantSnapshot);
    const rl = buildResourceServerLookup(snap as Auth0TenantSnapshot);
    const text = formatClientGrantName(
      { client_id: "cid_123456", audience: "https://api.acme.com/", scope: [] } as any,
      cl,
      rl
    );
    expect(text).toContain("Backend M2M");
    expect(text).toContain("Acme API");
  });

  it("classifies management API scope sensitivity", () => {
    const cls = classifyMgmtScopes([
      "read:users",
      "create:users",
      "update:clients",
      "delete:clients",
      "read:logs"
    ]);
    expect(cls.total).toBe(5);
    expect(cls.sensitive).toBeGreaterThanOrEqual(4);
  });

  it("AUTH-API-002 does not flag Auth0 Management API resource server", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
      coverage: [],
      resourceServers: [
        {
          identifier: "https://t.auth0.com/api/v2/",
          name: "Auth0 Management API",
          scopes: [{ value: "read:users" }, { value: "update:users" }],
          enforce_policies: false,
          signing_alg: "RS256"
        }
      ],
      clients: [],
      clientGrants: []
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    expect(findings.some((f) => f.id === "AUTH-API-002")).toBe(false);
    expect(findings.some((f) => f.id === "AUTH-API-001")).toBe(false);
  });

  it("AUTH-API-007 fires for sensitive Management API client grants", () => {
    const snap: any = {
      metadata: { domain: "t.auth0.com", partial: false, missingScopes: [], failedCollectors: [], connectorVersion: "test" },
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
      clients: [{ client_id: "cid_aaaaaa", name: "Ops Bot" }],
      clientGrants: [
        {
          client_id: "cid_aaaaaa",
          audience: "https://t.auth0.com/api/v2/",
          scope: [
            "read:users",
            "create:users",
            "update:users",
            "delete:users",
            "create:clients",
            "delete:clients",
            "update:clients",
            "read:client_keys",
            "create:client_grants",
            "update:tenant_settings"
          ]
        }
      ]
    };
    const findings = runAllRules(snap as Auth0TenantSnapshot);
    const f = findings.find((x) => x.id === "AUTH-API-007");
    expect(f).toBeDefined();
    expect(["high", "critical"]).toContain(f!.severity);
    // AUTH-API-005 should NOT also flag the same management-API grant.
    expect(findings.some((x) => x.id === "AUTH-API-005")).toBe(false);
  });
});

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

  it("flags Rules/Hooks usage", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-EXT-001")).toBe(true);
  });

  it("flags missing log streams", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-OBS-001")).toBe(true);
  });

  it("flags MFA policy = never", () => {
    const findings = runAllRules(load("risky-tenant.snapshot.json"));
    expect(findings.some((f) => f.id === "AUTH-SEC-001")).toBe(true);
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

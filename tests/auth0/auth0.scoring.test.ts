import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");

function loadFixture(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, name));
}

describe("scoring", () => {
  it("rates a healthy tenant at grade A or B with no critical findings", () => {
    const snap = loadFixture("healthy-tenant.snapshot.json");
    const report = analyzeAuth0Snapshot(snap);
    expect(report.findings.filter((f) => f.severity === "critical")).toEqual([]);
    expect(["A", "B"]).toContain(report.score.grade);
    expect(report.score.overall).toBeGreaterThanOrEqual(80);
  });

  it("rates a risky tenant poorly with multiple critical findings", () => {
    const snap = loadFixture("risky-tenant.snapshot.json");
    const report = analyzeAuth0Snapshot(snap);
    const critical = report.findings.filter((f) => f.severity === "critical");
    expect(critical.length).toBeGreaterThanOrEqual(3);
    expect(["D", "F", "C"]).toContain(report.score.grade);
    expect(report.score.overall).toBeLessThan(80);
  });

  it("caps a partial scan grade below A", () => {
    const snap = loadFixture("partial-scope.snapshot.json");
    const report = analyzeAuth0Snapshot(snap);
    expect(report.score.grade).not.toBe("A");
    expect(report.collectionStatus.partial).toBe(true);
    // Partial scan must surface as an info-level finding for transparency.
    expect(report.findings.some((f) => f.id === "AUTH-COV-001")).toBe(true);
  });

  it("category scores never exceed weight and never go below zero", () => {
    const snap = loadFixture("risky-tenant.snapshot.json");
    const report = analyzeAuth0Snapshot(snap);
    for (const c of report.categories) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(c.weight);
    }
  });
});

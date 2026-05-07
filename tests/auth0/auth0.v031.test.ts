import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";
import {
  scoreFindings,
  computeCategoryConfidence
} from "../../src/analysis/auth0/auth0.scoring";
import { adjustFindingForEnvironment } from "../../src/analysis/auth0/auth0.severity";
import { buildRemediationPlan } from "../../src/analysis/auth0/auth0.remediation";
import { Finding } from "../../src/reporting/markdown/report.types";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");
const load = (n: string): Auth0TenantSnapshot =>
  readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, n));

describe("v0.3.1 — Not Assessed when ANY key collector failed", () => {
  it("computeCategoryConfidence returns assessed=false if a single key collector failed", () => {
    const r = computeCategoryConfidence(
      "actionsAndExtensibility",
      [
        // actions failed, hooks succeeded, rules succeeded — partial spec.
        { collector: "actions", status: "failed", count: 0, requiredScopes: [] },
        { collector: "rules", status: "success", count: 0, requiredScopes: [] },
        { collector: "hooks", status: "success", count: 0, requiredScopes: [] }
      ] as any
    );
    expect(r.assessed).toBe(false);
    expect(r.confidence).toBe("low");
    expect(r.reason).toMatch(/actions \(failed\)/);
  });

  it("scoreFindings excludes Not Assessed weight from assessedMaxPoints and observedScore", () => {
    const result = scoreFindings(
      [],
      true,
      [
        // Make Actions & Extensibility Not Assessed by failing one of its key
        // collectors. All others succeed.
        { collector: "tenant", status: "success", count: 1, requiredScopes: [] },
        { collector: "clients", status: "success", count: 1, requiredScopes: [] },
        { collector: "connections", status: "success", count: 1, requiredScopes: [] },
        { collector: "resource_servers", status: "success", count: 1, requiredScopes: [] },
        { collector: "client_grants", status: "success", count: 0, requiredScopes: [] },
        { collector: "roles", status: "success", count: 0, requiredScopes: [] },
        { collector: "actions", status: "failed", count: 0, requiredScopes: [] },
        { collector: "rules", status: "success", count: 0, requiredScopes: [] },
        { collector: "hooks", status: "success", count: 0, requiredScopes: [] },
        { collector: "attack_protection", status: "success", count: 1, requiredScopes: [] },
        { collector: "guardian", status: "success", count: 1, requiredScopes: [] },
        { collector: "log_streams", status: "success", count: 0, requiredScopes: [] },
        { collector: "branding", status: "success", count: 1, requiredScopes: [] },
        { collector: "prompts", status: "success", count: 1, requiredScopes: [] },
        { collector: "custom_domains", status: "success", count: 0, requiredScopes: [] },
        { collector: "organizations", status: "success", count: 0, requiredScopes: [] }
      ] as any,
      { environment: "production" }
    );

    const actions = result.categories.find((c) => c.id === "actionsAndExtensibility")!;
    expect(actions.assessed).toBe(false);
    expect(actions.score).toBeNull();

    expect(result.breakdown.assessedMaxPoints).toBe(90);
    expect(result.breakdown.unassessedWeight).toBe(10);
    // No findings → observed equals assessed total weight.
    expect(result.breakdown.observedScore).toBe(90);
    expect(result.breakdown.normalizedScore).toBe(100);
  });

  it("renderer shows N/A in Category Breakdown for Not Assessed category", () => {
    // Construct a minimal snapshot that mirrors the bug: actions collector
    // failed; hooks skipped; rules succeeded.
    const snap: any = {
      metadata: {
        domain: "t.eu.auth0.com",
        partial: true,
        missingScopes: ["read:actions"],
        failedCollectors: [
          { collector: "actions", status: "failed", reason: "HTTP 403" },
          { collector: "hooks", status: "skipped", reason: "missing scope" }
        ],
        connectorVersion: "test"
      },
      coverage: [
        { collector: "tenant", status: "success", count: 1, requiredScopes: [] },
        { collector: "clients", status: "success", count: 0, requiredScopes: [] },
        { collector: "connections", status: "success", count: 0, requiredScopes: [] },
        { collector: "resource_servers", status: "success", count: 0, requiredScopes: [] },
        { collector: "client_grants", status: "success", count: 0, requiredScopes: [] },
        { collector: "roles", status: "success", count: 0, requiredScopes: [] },
        { collector: "actions", status: "failed", count: 0, requiredScopes: [] },
        { collector: "rules", status: "success", count: 0, requiredScopes: [] },
        { collector: "hooks", status: "skipped", count: 0, requiredScopes: [] },
        { collector: "attack_protection", status: "success", count: 0, requiredScopes: [] },
        { collector: "guardian", status: "success", count: 0, requiredScopes: [] },
        { collector: "log_streams", status: "success", count: 0, requiredScopes: [] },
        { collector: "branding", status: "success", count: 0, requiredScopes: [] },
        { collector: "prompts", status: "success", count: 0, requiredScopes: [] },
        { collector: "custom_domains", status: "success", count: 0, requiredScopes: [] },
        { collector: "organizations", status: "success", count: 0, requiredScopes: [] }
      ],
      tenant: { friendly_name: "x", support_email: "a@b", support_url: "https://x", picture_url: "https://x" },
      clients: [],
      connections: [],
      resourceServers: [],
      clientGrants: [],
      roles: [],
      organizations: [],
      branding: {},
      prompts: { universal_login_experience: "new" },
      customDomains: [{ domain: "auth.x.com", type: "auth0_managed_certs", tls_policy: "recommended" }],
      guardian: { policy: "all-applications", factors: [{ name: "otp", enabled: true }] },
      attackProtection: {
        brute_force_protection: { enabled: true },
        breached_password_detection: { enabled: true },
        suspicious_ip_throttling: { enabled: true }
      },
      logStreams: [{ id: "ls", status: "active", type: "http" }]
    };

    const report = analyzeAuth0Snapshot(snap, { environment: "development" });
    const md = renderAuth0Report(report);

    // Category Breakdown row for Actions & Extensibility must show "N/A".
    expect(md).toMatch(/\| Actions & Extensibility \| N\/A \| 10 \|/);
    expect(md).not.toMatch(/\| Actions & Extensibility \| 10 \| 10 \|/);
    expect(report.score.breakdown.unassessedWeight).toBe(10);
  });

  it("applies the same rule on the partial-scope fixture (multiple unassessed)", () => {
    const report = analyzeAuth0Snapshot(load("partial-scope.snapshot.json"));
    const unassessed = report.categories.filter((c) => !c.assessed);
    // partial-scope skips rules, hooks, log_streams, attack_protection →
    // actionsAndExtensibility, monitoring, attackProtection are all N/A.
    const ids = unassessed.map((c) => c.id).sort();
    expect(ids).toEqual(
      ["actionsAndExtensibility", "attackProtection", "monitoring"].sort()
    );
    expect(report.score.breakdown.unassessedWeight).toBeGreaterThan(0);
  });
});

describe("v0.3.1 — score impact tracks environment-adjusted severity", () => {
  it("recomputes scoreImpact after severity downshift and preserves the production-equivalent value", () => {
    const original: Finding = {
      id: "AUTH-CON-001",
      title: "Database connection uses a weak or missing password policy",
      severity: "high",
      category: "connections",
      scoreImpact: 12, // SEVERITY_SCORE_IMPACT.high
      affectedResources: [],
      evidence: "",
      recommendation: "",
      businessRisk: ""
    };
    const dev = adjustFindingForEnvironment(original, { environment: "development" });
    expect(dev.severity).toBe("medium");
    // medium = 6, high = 12 — score impact must follow severity.
    expect(dev.scoreImpact).toBe(6);
    expect(dev.productionEquivalentScoreImpact).toBe(12);
  });

  it("renderer surfaces both score impacts when they differ", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "development"
      })
    );
    expect(md).toMatch(
      /\*\*Score impact:\*\* -\d+ \(environment-adjusted\) \/ -\d+ \(production-equivalent\)/
    );
  });

  it("renderer shows a single score impact when severity matches production-equivalent", () => {
    const md = renderAuth0Report(
      analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
        environment: "production"
      })
    );
    // No "(production-equivalent)" annotation when production.
    expect(md).not.toMatch(/\(environment-adjusted\) \/ -\d+ \(production-equivalent\)/);
  });
});

describe("v0.3.1 — AUTH-API-007 Immediate bucketing for many write/delete/admin scopes", () => {
  it("places production-equivalent critical Mgmt API findings into Immediate even on dev tenant", () => {
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
      clients: [{ client_id: "explorer", name: "API Explorer Application" }],
      clientGrants: [
        {
          client_id: "explorer",
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
            "create:resource_servers",
            "delete:resource_servers"
          ]
        }
      ]
    };
    const dev = analyzeAuth0Snapshot(snap as Auth0TenantSnapshot, {
      environment: "development"
    });
    const finding = dev.findings.find((f) => f.id === "AUTH-API-007")!;
    expect(finding.severity).toBe("high"); // env-adjusted
    expect(finding.productionEquivalentSeverity).toBe("critical");

    const immediate = dev.remediationPlan.buckets.find((b) => b.id === "immediate")!;
    expect(immediate.items.some((i) => i.findingId === "AUTH-API-007")).toBe(true);
  });

  it("buildRemediationPlan routes any production-equivalent critical to Immediate", () => {
    const f: Finding = {
      id: "AUTH-API-007",
      title: "x",
      severity: "high",
      productionEquivalentSeverity: "critical",
      category: "apis",
      scoreImpact: 12,
      affectedResources: [],
      evidence: "",
      recommendation: "",
      businessRisk: ""
    };
    const plan = buildRemediationPlan([f]);
    expect(
      plan.buckets.find((b) => b.id === "immediate")!.items.some(
        (i) => i.findingId === "AUTH-API-007"
      )
    ).toBe(true);
  });
});

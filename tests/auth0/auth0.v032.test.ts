import { describe, expect, it } from "vitest";
import * as path from "path";
import { readJsonSync } from "../../src/core/filesystem";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { renderAuth0Report } from "../../src/reporting/markdown/auth0-report.renderer";
import { describeAuth0HttpError } from "../../src/connectors/auth0/auth0.collectors";
import { HttpError } from "../../src/core/errors";

const FIXTURES = path.resolve(__dirname, "../../fixtures/auth0");
const load = (n: string): Auth0TenantSnapshot =>
  readJsonSync<Auth0TenantSnapshot>(path.join(FIXTURES, n));

describe("v0.3.2 — environment-adjusted vs production-equivalent score", () => {
  it("production scan: Executive Summary uses 'Overall score' and omits production-equivalent line", () => {
    const report = analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
      environment: "production"
    });
    const md = renderAuth0Report(report);
    expect(md).toMatch(/\*\*Overall score:\*\* \d+ \/ 100 — Grade \*\*[A-F]\*\*/);
    expect(md).not.toMatch(/\*\*Environment-adjusted score:\*\*/);
    expect(md).not.toMatch(/\*\*Production-equivalent score:\*\*/);
    // Numerically the two scores must be identical on production.
    expect(report.score.breakdown.productionEquivalent.overall).toBe(report.score.overall);
    expect(report.score.breakdown.productionEquivalent.grade).toBe(report.score.grade);
  });

  it("development scan: Executive Summary shows both labels and Score Interpretation has both H3 sections", () => {
    const report = analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
      environment: "development"
    });
    const md = renderAuth0Report(report);
    expect(md).toMatch(/\*\*Environment-adjusted score:\*\* \d+ \/ 100 — Grade \*\*[A-F]\*\*/);
    expect(md).toMatch(/\*\*Production-equivalent score:\*\* \d+ \/ 100 — Grade \*\*[A-F]\*\*/);
    expect(md).toMatch(/### Environment-adjusted \(`development`\)/);
    expect(md).toMatch(/### Production-equivalent\b/);
  });

  it("development scan: production-equivalent overall is no better than environment-adjusted", () => {
    const report = analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
      environment: "development"
    });
    const env = report.score.overall;
    const prod = report.score.breakdown.productionEquivalent.overall;
    // Production-equivalent applies the original (un-downshifted) severities,
    // so it must score the same or worse than the environment-adjusted view.
    expect(prod).toBeLessThanOrEqual(env);
    // Grade ordering: A < B < C < D < F (worse). Production-equivalent grade
    // must be the same or worse.
    const order = ["A", "B", "C", "D", "F"];
    expect(order.indexOf(report.score.breakdown.productionEquivalent.grade)).toBeGreaterThanOrEqual(
      order.indexOf(report.score.grade)
    );
  });

  it("development scan: numeric scores diverge for a risky tenant with downshifted severities", () => {
    const report = analyzeAuth0Snapshot(load("risky-tenant.snapshot.json"), {
      environment: "development"
    });
    // The risky fixture has critical Mgmt API findings that downshift on dev,
    // so env-adjusted observed/normalized must be strictly higher than prod-eq.
    expect(report.score.breakdown.observedScore).toBeGreaterThan(
      report.score.breakdown.productionEquivalent.observedScore
    );
  });
});

describe("v0.3.2 — Auth0 collector failure diagnostics", () => {
  it("describeAuth0HttpError surfaces Auth0 errorCode and message from the response body", () => {
    const err = new HttpError(403, "Auth0 returned 403 for /actions/actions", {
      details: {
        statusCode: 403,
        error: "Forbidden",
        errorCode: "insufficient_scope",
        message: "Insufficient scope, expected any of: read:actions"
      }
    });
    const out = describeAuth0HttpError(err);
    expect(out).toMatch(/HTTP 403/);
    expect(out).toMatch(/code=insufficient_scope/);
    expect(out).toMatch(/Insufficient scope/);
  });

  it("describeAuth0HttpError handles bodies wrapped under a 'body' key", () => {
    const err = new HttpError(500, "Auth0 returned 500 for /actions/actions", {
      details: {
        body: {
          error: "internal_error",
          message: "Something went wrong"
        }
      }
    });
    const out = describeAuth0HttpError(err);
    expect(out).toMatch(/HTTP 500/);
    expect(out).toMatch(/code=internal_error/);
    expect(out).toMatch(/Something went wrong/);
  });

  it("describeAuth0HttpError falls back to err.message when no body fields are present", () => {
    const err = new HttpError(429, "Rate limited (exhausted retries)", {
      retryAfterMs: 1000
    });
    const out = describeAuth0HttpError(err);
    expect(out).toMatch(/HTTP 429/);
    expect(out).toMatch(/Rate limited/);
  });
});

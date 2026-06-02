import * as path from "path";
import { describe, expect, it } from "vitest";
import { analyzeAuth0Snapshot } from "../../src/analysis/auth0/auth0.analyzer";
import { analyzeOktaSnapshot } from "../../src/analysis/okta/okta.analyzer";
import { Auth0TenantSnapshot } from "../../src/connectors/auth0/auth0.types";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";
import { readJsonSync } from "../../src/core/filesystem";
import {
  compareStructuredReports,
  renderDeltaReportJson
} from "../../src/reporting/delta/delta-compare";
import { DELTA_REPORT_SCHEMA_VERSION } from "../../src/reporting/delta/delta.types";
import {
  buildAuth0ReportContractV1,
  buildOktaReportContractV1
} from "../../src/reporting/json/report-contract";
import {
  StructuredReportFinding,
  StructuredReportV1
} from "../../src/reporting/json/report-contract.types";

function loadAuth0(name: string): Auth0TenantSnapshot {
  return readJsonSync<Auth0TenantSnapshot>(
    path.join(process.cwd(), "fixtures", "auth0", name)
  );
}

function loadOkta(name: string): OktaOrgSnapshot {
  return readJsonSync<OktaOrgSnapshot>(
    path.join(process.cwd(), "fixtures", "okta", name)
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function auth0Contract(): StructuredReportV1 {
  const snapshot = loadAuth0("risky-tenant.snapshot.json");
  return buildAuth0ReportContractV1(
    analyzeAuth0Snapshot(snapshot, { environment: "production" }),
    snapshot
  );
}

function oktaContract(): StructuredReportV1 {
  const snapshot = loadOkta("risky-org.snapshot.json");
  return buildOktaReportContractV1(
    analyzeOktaSnapshot(snapshot, {
      environment: "production",
      includeIdentifiers: false
    }),
    snapshot
  );
}

describe("delta compare engine", () => {
  it("compares Auth0 report deltas across every finding state", () => {
    const base = auth0Contract();
    const before = clone(base);
    const after = clone(base);
    const [unchanged, improvedBefore, worsenedBefore, resolved] =
      before.findings.slice(0, 4).map(clone);

    unchanged.severity = "medium";
    unchanged.scoreImpact = 6;

    improvedBefore.severity = "high";
    improvedBefore.scoreImpact = 12;
    const improvedAfter = clone(improvedBefore);
    improvedAfter.severity = "low";
    improvedAfter.scoreImpact = 2;

    worsenedBefore.severity = "low";
    worsenedBefore.scoreImpact = 2;
    const worsenedAfter = clone(worsenedBefore);
    worsenedAfter.severity = "critical";
    worsenedAfter.scoreImpact = 25;

    const newFinding: StructuredReportFinding = {
      ...clone(resolved),
      id: "AUTH-TEST-NEW",
      fingerprint: "fp_000000000000000000000001",
      title: "Synthetic new finding"
    };

    before.score.overall = 50;
    after.score.overall = 67;
    before.score.grade = "D";
    after.score.grade = "C";

    before.findings = [unchanged, improvedBefore, worsenedBefore, resolved];
    after.findings = [clone(unchanged), improvedAfter, worsenedAfter, newFinding];

    before.categories = before.categories.slice(0, 3).map(clone);
    after.categories = after.categories.slice(0, 3).map(clone);
    before.categories[0].score = 5;
    after.categories[0].score = 8;
    before.categories[1].score = 9;
    after.categories[1].score = 3;
    before.categories[2].score = null;
    before.categories[2].assessed = false;
    after.categories[2].score = 4;
    after.categories[2].assessed = true;

    before.coverage.partial = true;
    after.coverage.partial = false;
    before.coverage.missingScopes = ["read:logs"];
    after.coverage.missingScopes = [];
    before.coverage.collectors = [
      {
        collector: "logs",
        status: "failed",
        count: 0,
        requiredScopes: ["read:logs"],
        missingScopes: ["read:logs"]
      }
    ];
    after.coverage.collectors = [
      {
        collector: "logs",
        status: "success",
        count: 10,
        requiredScopes: ["read:logs"],
        missingScopes: []
      }
    ];

    const delta = compareStructuredReports(before, after);
    const repeated = compareStructuredReports(before, after);

    expect(delta.schemaVersion).toBe(DELTA_REPORT_SCHEMA_VERSION);
    expect(delta.provider.id).toBe("auth0");
    expect(delta.score).toMatchObject({
      before: 50,
      after: 67,
      change: 17,
      direction: "improved",
      gradeBefore: "D",
      gradeAfter: "C"
    });
    expect(delta.summary).toMatchObject({
      newFindings: 1,
      resolvedFindings: 1,
      unchangedFindings: 1,
      worsenedFindings: 1,
      improvedFindings: 1,
      coverageChanged: true
    });
    expect(delta.findings.new[0].id).toBe("AUTH-TEST-NEW");
    expect(delta.findings.resolved[0].id).toBe(resolved.id);
    expect(delta.findings.improved[0]).toMatchObject({
      fingerprint: improvedBefore.fingerprint,
      severityBefore: "high",
      severityAfter: "low",
      scoreImpactChange: -10
    });
    expect(delta.findings.worsened[0]).toMatchObject({
      fingerprint: worsenedBefore.fingerprint,
      severityBefore: "low",
      severityAfter: "critical",
      scoreImpactChange: 23
    });
    const categoryStatusById = new Map(
      delta.categories.map((category) => [category.id, category.status])
    );
    expect(categoryStatusById.get(before.categories[0].id)).toBe("improved");
    expect(categoryStatusById.get(before.categories[1].id)).toBe("worsened");
    expect(categoryStatusById.get(before.categories[2].id)).toBe("now-assessed");
    expect(delta.coverage.missingScopes.removed).toEqual(["read:logs"]);
    expect(delta.coverage.collectors[0]).toMatchObject({
      collector: "logs",
      statusChanged: true,
      countChange: 10
    });
    expect(renderDeltaReportJson(delta)).toEqual(renderDeltaReportJson(repeated));
  });

  it("compares identical Okta reports as unchanged", () => {
    const before = oktaContract();
    const after = clone(before);
    const delta = compareStructuredReports(before, after);

    expect(delta.provider.id).toBe("okta");
    expect(delta.summary.newFindings).toBe(0);
    expect(delta.summary.resolvedFindings).toBe(0);
    expect(delta.summary.worsenedFindings).toBe(0);
    expect(delta.summary.improvedFindings).toBe(0);
    expect(delta.summary.unchangedFindings).toBe(before.findings.length);
    expect(delta.summary.coverageChanged).toBe(false);
    expect(delta.score.direction).toBe("unchanged");
    expect(delta.coverage.partialChanged).toBe(false);
  });

  it("rejects cross-provider comparisons", () => {
    expect(() => compareStructuredReports(auth0Contract(), oktaContract())).toThrow(
      /Cannot compare different providers/
    );
  });
});

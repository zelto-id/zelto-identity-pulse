import { describe, expect, it } from "vitest";
import { parseDeltaReportFormats } from "../../src/cli/commands/compare";
import { StructuredDeltaReportV1 } from "../../src/reporting/delta/delta.types";
import { renderDeltaReportHtml } from "../../src/reporting/html/delta-report.html-renderer";
import { StructuredReportFinding } from "../../src/reporting/json/report-contract.types";
import { Severity } from "../../src/reporting/markdown/report.types";

function finding(
  id: string,
  title: string,
  severity: Severity,
  scoreImpact: number
): StructuredReportFinding {
  return {
    id,
    fingerprint: `fp_${id.toLowerCase()}`,
    title,
    provider: "auth0",
    category: "authentication",
    severity,
    confidence: "high",
    classification: "confirmed-risk",
    affectedResources: [
      {
        id: `res_${id.toLowerCase()}`,
        kind: "application",
        displayName: "Customer Portal",
        masked: false
      }
    ],
    evidence: {
      summary: `${title} evidence summary`
    },
    businessRisk: "Account takeover risk can increase if this control is not remediated.",
    recommendation: "Review the identity control and validate remediation.",
    validationSteps: ["Confirm the control state in the provider dashboard."],
    falsePositiveNotes: [],
    scoreImpact
  };
}

function deltaFixture(): StructuredDeltaReportV1 {
  const resolved = finding("AUTH-RESOLVED", "Resolved MFA gap", "high", 12);
  const newFinding = finding("AUTH-NEW", "New MFA regression", "critical", 20);
  const worsenedBefore = finding("AUTH-WORSE", "Worsened logging gap", "low", 2);
  const worsenedAfter = {
    ...finding("AUTH-WORSE", "Worsened logging gap", "high", 8),
    fingerprint: worsenedBefore.fingerprint
  };
  const improvedBefore = finding("AUTH-IMPROVED", "Improved password policy", "high", 10);
  const improvedAfter = {
    ...finding("AUTH-IMPROVED", "Improved password policy", "medium", 4),
    fingerprint: improvedBefore.fingerprint
  };
  const unchanged = finding("AUTH-UNCHANGED", "Remaining session risk", "medium", 5);

  return {
    schemaVersion: "1.0.0",
    deltaEngineVersion: "1.0.0",
    reportSchemaVersion: "1.0.0",
    provider: {
      id: "auth0",
      product: "Auth0",
      displayName: "Auth0"
    },
    tenant: {
      primaryIdentifier: "example.auth0.com",
      displayName: "example.auth0.com",
      kind: "tenant"
    },
    environment: {
      before: "production",
      after: "production"
    },
    comparison: {
      before: {
        schemaVersion: "1.0.0",
        generatedAt: "2026-06-02T08:00:00.000Z",
        scanId: "before-scan",
        score: 62,
        grade: "D",
        partialCoverage: true
      },
      after: {
        schemaVersion: "1.0.0",
        generatedAt: "2026-06-02T09:00:00.000Z",
        scanId: "after-scan",
        score: 76,
        grade: "C",
        partialCoverage: false
      },
      warnings: []
    },
    summary: {
      scoreChange: 14,
      newFindings: 1,
      resolvedFindings: 1,
      unchangedFindings: 1,
      worsenedFindings: 1,
      improvedFindings: 1,
      coverageChanged: true
    },
    score: {
      before: 62,
      after: 76,
      change: 14,
      direction: "improved",
      gradeBefore: "D",
      gradeAfter: "C"
    },
    categories: [
      {
        id: "authentication",
        name: "Authentication",
        before: {
          score: 4,
          assessed: true,
          confidence: "high",
          findings: 3
        },
        after: {
          score: 7,
          assessed: true,
          confidence: "high",
          findings: 2
        },
        scoreChange: 3,
        status: "improved"
      },
      {
        id: "logging",
        name: "Logging",
        before: {
          score: 8,
          assessed: true,
          confidence: "medium",
          findings: 1
        },
        after: {
          score: 3,
          assessed: true,
          confidence: "medium",
          findings: 2
        },
        scoreChange: -5,
        status: "worsened"
      }
    ],
    findings: {
      new: [
        {
          status: "new",
          fingerprint: newFinding.fingerprint,
          id: newFinding.id,
          title: newFinding.title,
          category: newFinding.category,
          after: newFinding,
          severityAfter: newFinding.severity,
          scoreImpactAfter: newFinding.scoreImpact,
          changedFields: []
        }
      ],
      resolved: [
        {
          status: "resolved",
          fingerprint: resolved.fingerprint,
          id: resolved.id,
          title: resolved.title,
          category: resolved.category,
          before: resolved,
          severityBefore: resolved.severity,
          scoreImpactBefore: resolved.scoreImpact,
          changedFields: []
        }
      ],
      unchanged: [
        {
          status: "unchanged",
          fingerprint: unchanged.fingerprint,
          id: unchanged.id,
          title: unchanged.title,
          category: unchanged.category,
          before: unchanged,
          after: unchanged,
          severityBefore: unchanged.severity,
          severityAfter: unchanged.severity,
          scoreImpactBefore: unchanged.scoreImpact,
          scoreImpactAfter: unchanged.scoreImpact,
          scoreImpactChange: 0,
          changedFields: []
        }
      ],
      worsened: [
        {
          status: "worsened",
          fingerprint: worsenedBefore.fingerprint,
          id: worsenedBefore.id,
          title: worsenedBefore.title,
          category: worsenedBefore.category,
          before: worsenedBefore,
          after: worsenedAfter,
          severityBefore: worsenedBefore.severity,
          severityAfter: worsenedAfter.severity,
          scoreImpactBefore: worsenedBefore.scoreImpact,
          scoreImpactAfter: worsenedAfter.scoreImpact,
          scoreImpactChange: 6,
          changedFields: ["severity", "scoreImpact"]
        }
      ],
      improved: [
        {
          status: "improved",
          fingerprint: improvedBefore.fingerprint,
          id: improvedBefore.id,
          title: improvedBefore.title,
          category: improvedBefore.category,
          before: improvedBefore,
          after: improvedAfter,
          severityBefore: improvedBefore.severity,
          severityAfter: improvedAfter.severity,
          scoreImpactBefore: improvedBefore.scoreImpact,
          scoreImpactAfter: improvedAfter.scoreImpact,
          scoreImpactChange: -6,
          changedFields: ["severity", "scoreImpact"]
        }
      ]
    },
    coverage: {
      partialBefore: true,
      partialAfter: false,
      partialChanged: true,
      missingScopes: {
        added: [],
        removed: ["read:logs"],
        unchanged: []
      },
      collectors: [
        {
          collector: "logs",
          before: {
            status: "failed",
            count: 0
          },
          after: {
            status: "success",
            count: 100
          },
          statusChanged: true,
          countChange: 100
        }
      ]
    }
  };
}

describe("delta HTML renderer", () => {
  it("renders executive, finding, category, and coverage sections", () => {
    const html = renderDeltaReportHtml(deltaFixture());

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Auth0 Delta Report");
    expect(html).toContain("Key Decisions Required");
    expect(html).toContain("Category Deltas");
    expect(html).toContain("Findings by Change State");
    expect(html).toContain("Worsened Findings");
    expect(html).toContain("New Findings");
    expect(html).toContain("Resolved Findings");
    expect(html).toContain("Remaining Unchanged Findings");
    expect(html).toContain("Resource Coverage Changes");
    expect(html).toContain("Coverage changed");
    expect(html).toContain("New MFA regression");
    expect(html).toContain("Worsened logging gap");
  });

  it("escapes HTML and redacts obvious secret patterns", () => {
    const delta = deltaFixture();
    const unsafe = finding(
      "AUTH-UNSAFE",
      "<script>alert(1)</script> access_token=tok_very_sensitive",
      "critical",
      20
    );
    unsafe.evidence.summary = "Authorization: Bearer eyJ.secret.payload";
    unsafe.affectedResources[0].displayName = "client_secret=secret_value_123";
    delta.findings.new = [
      {
        status: "new",
        fingerprint: unsafe.fingerprint,
        id: unsafe.id,
        title: unsafe.title,
        category: unsafe.category,
        after: unsafe,
        severityAfter: unsafe.severity,
        scoreImpactAfter: unsafe.scoreImpact,
        changedFields: []
      }
    ];

    const html = renderDeltaReportHtml(delta);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("tok_very_sensitive");
    expect(html).not.toContain("eyJ.secret.payload");
    expect(html).not.toContain("secret_value_123");
    expect(html).toContain("[REDACTED]");
  });
});

describe("delta compare output formats", () => {
  it("parses delta report formats", () => {
    expect(parseDeltaReportFormats(undefined)).toEqual(["json"]);
    expect(parseDeltaReportFormats("html,json,all")).toEqual(["html", "json"]);
    expect(parseDeltaReportFormats("all")).toEqual(["json", "html"]);
  });

  it("rejects invalid delta report formats", () => {
    expect(() => parseDeltaReportFormats("json,pdf")).toThrow(
      /Invalid delta report format/
    );
  });
});

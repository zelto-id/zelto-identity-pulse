import { describe, expect, it } from "vitest";
import { ResourceCoverage } from "../../src/core/schema";
import { scoreOktaFindings } from "../../src/analysis/okta/okta.scoring";
import {
  OKTA_KEY_COLLECTORS_BY_CATEGORY,
  OktaCategoryId,
  OktaFinding
} from "../../src/reporting/markdown/okta-report.types";

function makeCoverage(): ResourceCoverage[] {
  return Array.from(
    new Set(Object.values(OKTA_KEY_COLLECTORS_BY_CATEGORY).flat())
  ).map((collector) => ({
    collector,
    status: "success" as const,
    count: 1,
    requiredScopes: []
  }));
}

function makeFinding(
  overrides: Partial<OktaFinding> & Pick<OktaFinding, "id" | "severity" | "classification" | "category">
): OktaFinding {
  return {
    id: overrides.id,
    title: overrides.title ?? overrides.id,
    severity: overrides.severity,
    classification: overrides.classification,
    category: overrides.category,
    scoreImpact: overrides.scoreImpact ?? 0,
    affectedResources: overrides.affectedResources ?? [],
    evidence: overrides.evidence ?? "evidence",
    recommendation: overrides.recommendation ?? "recommendation",
    businessRisk: overrides.businessRisk ?? "risk",
    confidence: overrides.confidence ?? "medium",
    ...overrides
  };
}

function categoryScore(result: ReturnType<typeof scoreOktaFindings>, categoryId: OktaCategoryId): number | null {
  return result.categories.find((category) => category.id === categoryId)?.score ?? null;
}

describe("okta scoring", () => {
  it("keeps advisory low findings from collapsing a category", () => {
    const result = scoreOktaFindings(
      [
        makeFinding({
          id: "ADV-1",
          severity: "low",
          classification: "advisory",
          category: "applicationsAndSSO",
          scoreImpact: 0.5
        })
      ],
      false,
      makeCoverage(),
      { environment: "production" }
    );

    expect(categoryScore(result, "applicationsAndSSO")).toBeGreaterThanOrEqual(11);
  });

  it("applies category floors for requires-validation findings", () => {
    const result = scoreOktaFindings(
      [
        makeFinding({
          id: "RV-1",
          severity: "medium",
          classification: "requires-validation",
          category: "applicationsAndSSO",
          scoreImpact: 5
        }),
        makeFinding({
          id: "RV-2",
          severity: "medium",
          classification: "requires-validation",
          category: "applicationsAndSSO",
          scoreImpact: 5
        }),
        makeFinding({
          id: "RV-3",
          severity: "medium",
          classification: "requires-validation",
          category: "applicationsAndSSO",
          scoreImpact: 5
        })
      ],
      false,
      makeCoverage(),
      { environment: "production" }
    );

    expect(categoryScore(result, "applicationsAndSSO")).toBe(9);
  });

  it("preserves strong impact for confirmed high risks", () => {
    const result = scoreOktaFindings(
      [
        makeFinding({
          id: "CONF-1",
          severity: "high",
          classification: "confirmed-risk",
          category: "apiAccessManagement",
          scoreImpact: 10,
          confidence: "high"
        })
      ],
      false,
      makeCoverage(),
      { environment: "production" }
    );

    expect(categoryScore(result, "apiAccessManagement")).toBe(3);
  });
});

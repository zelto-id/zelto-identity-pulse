import { describe, expect, it } from "vitest";
import {
  computeCategoryConfidence,
  scoreFindings
} from "../../src/analysis/auth0/auth0.scoring";

describe("category confidence", () => {
  it("is high when key collectors all succeed", () => {
    const c = computeCategoryConfidence("attackProtection", [
      { collector: "attack_protection", status: "success", count: 1 },
      { collector: "guardian", status: "success", count: 1 }
    ] as any);
    expect(c.confidence).toBe("high");
  });

  it("is low when one required key collector is missing from coverage", () => {
    const c = computeCategoryConfidence("brandingAndLoginExperience", [
      { collector: "branding", status: "success", count: 1 },
      { collector: "prompts", status: "success", count: 1 }
    ] as any);
    expect(c.confidence).toBe("low");
    expect(c.assessed).toBe(false);
    expect(c.reason).toMatch(/custom_domains|missing/i);
  });

  it("is low when a key collector failed", () => {
    const c = computeCategoryConfidence("actionsAndExtensibility", [
      { collector: "actions", status: "failed", count: 0, notes: "403" },
      { collector: "rules", status: "skipped", count: 0 },
      { collector: "hooks", status: "skipped", count: 0 }
    ] as any);
    expect(c.confidence).toBe("low");
    expect(c.reason).toMatch(/failed|skipped/);
  });

  it("is low when no relevant coverage entries exist for the category", () => {
    const c = computeCategoryConfidence("monitoring", [] as any);
    expect(c.confidence).toBe("low");
  });

  it("reports core categories as Not Assessed when their key collector failed", () => {
    const result = scoreFindings(
      [],
      true,
      [
        // monitoring is a core category; key collector failed
        { collector: "log_streams", status: "failed", count: 0, notes: "denied" }
      ] as any
    );
    const monitoring = result.categories.find((c) => c.id === "monitoring")!;
    expect(monitoring.confidence).toBe("low");
    expect(monitoring.assessed).toBe(false);
    expect(monitoring.score).toBeNull();
    expect(result.breakdown.unassessedWeight).toBeGreaterThan(0);
  });
});

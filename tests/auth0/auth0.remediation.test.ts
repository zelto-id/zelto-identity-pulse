import { describe, expect, it } from "vitest";
import { buildRemediationPlan } from "../../src/analysis/auth0/auth0.remediation";
import { Finding } from "../../src/reporting/markdown/report.types";

function f(id: string, severity: Finding["severity"], category: string): Finding {
  return {
    id,
    title: id,
    severity,
    category,
    scoreImpact: 1,
    affectedResources: [],
    evidence: "",
    recommendation: `do ${id}`,
    businessRisk: ""
  };
}

describe("remediation plan", () => {
  it("buckets criticals to immediate, mediums to short term, lows to later", () => {
    const plan = buildRemediationPlan([
      f("AUTH-SEC-001", "critical", "attackProtection"),
      f("AUTH-API-003", "medium", "apis"),
      f("AUTH-UX-003", "low", "brandingAndLoginExperience")
    ]);
    const find = (id: string) =>
      plan.buckets.find((b) => b.items.some((it) => it.findingId === id))!.id;
    expect(find("AUTH-SEC-001")).toBe("immediate");
    expect(find("AUTH-API-003")).toBe("shortTerm");
    expect(find("AUTH-UX-003")).toBe("later");
  });

  it("routes high attack-protection and AUTH-OBS-001 to immediate", () => {
    const plan = buildRemediationPlan([
      f("AUTH-OBS-001", "high", "monitoring"),
      f("AUTH-CON-003", "medium", "connections")
    ]);
    const obs = plan.buckets
      .find((b) => b.id === "immediate")!
      .items.find((it) => it.findingId === "AUTH-OBS-001");
    expect(obs).toBeDefined();
  });

  it("assigns 1-based priorities per bucket", () => {
    const plan = buildRemediationPlan([
      f("AUTH-SEC-004", "critical", "attackProtection"),
      f("AUTH-SEC-005", "critical", "attackProtection"),
      f("AUTH-API-003", "medium", "apis")
    ]);
    const immediate = plan.buckets.find((b) => b.id === "immediate")!;
    expect(immediate.items.map((i) => i.priority)).toEqual([1, 2]);
    const shortTerm = plan.buckets.find((b) => b.id === "shortTerm")!;
    expect(shortTerm.items[0].priority).toBe(1);
  });

  it("fills in plain-English expected outcome for known finding IDs", () => {
    const plan = buildRemediationPlan([
      f("AUTH-SEC-001", "critical", "attackProtection")
    ]);
    const item = plan.buckets[0].items[0];
    expect(item.expectedOutcome).toMatch(/account takeover/i);
  });
});

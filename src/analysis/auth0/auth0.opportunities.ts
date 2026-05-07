/**
 * Map findings into opportunities and group them for the report.
 */

import {
  Finding,
  Opportunity,
  OpportunityGroup,
  OpportunityGroupId
} from "../../reporting/markdown/report.types";

const TYPE_BY_CATEGORY: Record<string, Opportunity["type"]> = {
  tenantBaseline: "governance-improvement",
  applications: "security-hardening",
  connections: "security-hardening",
  apis: "security-hardening",
  rbac: "governance-improvement",
  actionsAndExtensibility: "architecture-improvement",
  attackProtection: "security-hardening",
  monitoring: "audit-readiness",
  brandingAndLoginExperience: "ux-improvement",
  organizations: "b2b-readiness"
};

const EFFORT_BY_SEVERITY: Record<Finding["severity"], Opportunity["effort"]> = {
  critical: "high",
  high: "medium",
  medium: "medium",
  low: "low",
  info: "low"
};

export function buildOpportunities(findings: Finding[]): Opportunity[] {
  return findings
    .filter((f) => f.severity !== "info")
    .map((f) => ({
      id: `OPP-${f.id}`,
      title: f.recommendation,
      category: f.category,
      type: TYPE_BY_CATEGORY[f.category] ?? "security-hardening",
      description: `${f.title}. ${f.businessRisk}`,
      effort: EFFORT_BY_SEVERITY[f.severity],
      findingId: f.id
    }));
}

const GROUP_NAMES: Record<OpportunityGroupId, { name: string; description: string }> = {
  quickWins: {
    name: "Quick Wins",
    description: "Low effort, high value. Enable or tighten existing platform controls."
  },
  securityHardening: {
    name: "Security Hardening",
    description: "Risk-reduction items targeting authentication, authorization, and abuse prevention."
  },
  auditReadiness: {
    name: "Audit Readiness",
    description: "Monitoring, evidence, and governance improvements that support audits and incident response."
  },
  architectureAndMaturity: {
    name: "Architecture & Maturity",
    description: "Longer-term platform/architecture improvements and migrations."
  }
};

function groupFor(o: Opportunity): OpportunityGroupId {
  if (o.type === "architecture-improvement") return "architectureAndMaturity";
  if (o.type === "audit-readiness" || o.category === "monitoring") return "auditReadiness";
  if (o.effort === "low") return "quickWins";
  if (o.type === "security-hardening") return "securityHardening";
  return "architectureAndMaturity";
}

export function buildOpportunityGroups(opps: Opportunity[]): OpportunityGroup[] {
  const grouped: Record<OpportunityGroupId, Opportunity[]> = {
    quickWins: [],
    securityHardening: [],
    auditReadiness: [],
    architectureAndMaturity: []
  };
  for (const o of opps) {
    grouped[groupFor(o)].push(o);
  }
  return (Object.keys(grouped) as OpportunityGroupId[]).map((id) => ({
    id,
    name: GROUP_NAMES[id].name,
    description: GROUP_NAMES[id].description,
    items: grouped[id]
  }));
}

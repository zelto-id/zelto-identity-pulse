/**
 * Consolidation layer: groups per-instance Finding objects (one per resource)
 * that share the same rule ID into a single ConsolidatedFinding for cleaner
 * report output.
 *
 * The consolidation step runs after severity adjustment, so each instance
 * already carries its environment-adjusted severity.
 */

import {
  ConsolidatedFinding,
  ConsolidatedFindingRow,
  Finding,
  HowToInterpretContent,
  Severity
} from "../../reporting/markdown/report.types";

// ---------------------------------------------------------------------------
// Severity ordering
// ---------------------------------------------------------------------------

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};

function highestSeverity(severities: Severity[]): Severity {
  return (
    (["critical", "high", "medium", "low", "info"] as Severity[]).find((s) =>
      severities.some((x) => x === s)
    ) ?? "info"
  );
}

// ---------------------------------------------------------------------------
// Per-rule override catalogue
// ---------------------------------------------------------------------------

interface RuleOverride {
  title: string;
  riskSummary: string;
  recommendation: string;
  howToInterpret?: HowToInterpretContent;
}

/**
 * Overrides keyed by finding ID.
 *
 * Rules that emit per-resource findings with nuanced per-instance
 * recommendations should provide a consolidated title, summary, and
 * unified recommendation here. The per-resource evidence and individual
 * severity are preserved in the instances table.
 */
const RULE_OVERRIDES: Record<string, RuleOverride> = {
  "AUTH-API-007": {
    title: "M2M Clients Have Excessive Management API Privileges",
    riskSummary:
      "This finding identifies Machine-to-Machine (M2M) applications that have been granted " +
      "powerful permissions to the Auth0 Management API. A compromised credential for one of " +
      "these clients could allow an attacker to read sensitive data, modify user permissions, " +
      "delete users, or take over the entire tenant, depending on the scopes granted.",
    recommendation:
      "For each client listed in the table, review the granted scopes against its operational need. " +
      "Apply the Principle of Least Privilege by removing any scope that is not actively used. " +
      "For necessary high-risk scopes, consider architectural changes like the Facade Pattern or " +
      "isolating the permission in a dedicated microservice to reduce the blast radius.",
    howToInterpret: {
      corePrincipleTitle: "Principle of Least Privilege & Defense in Depth",
      corePrincipleDetail:
        "This finding relates to the Principle of Least Privilege and Defense in Depth. " +
        "The goal is to ensure that if a component is compromised, the attacker's " +
        "capabilities are as limited as possible.",
      riskModelDescription:
        "Our tool assesses severity based on the potential 'blast radius' of the granted scopes:\n" +
        "- **Low:** Read-only scopes (`read:users`). Risk: Data exfiltration.\n" +
        "- **Medium:** Metadata write scopes (`update:users_app_metadata`). Risk: In-app privilege escalation.\n" +
        "- **High:** Destructive scopes (`delete:users`). Risk: Irreversible data loss.\n" +
        "- **Critical:** Tenant-admin scopes (`update:clients`, `create:roles`). Risk: Full tenant takeover.",
      selfAssessmentQuestions: [
        "**Is the permission isolated?** Does the client holding a dangerous scope (like `delete:users`) " +
          "do anything else, or is it a tiny, single-purpose microservice whose only job is to perform that one function?",
        "**Do you use a secure 'Facade API'?** Do your services call Auth0 directly, or do they go through " +
          "your own internal API that validates and sanitizes requests before securely calling Auth0?",
        "**Is there an immutable audit trail?** Can you trace every administrative action back to the exact " +
          "service and trigger?"
      ],
      concludingAdvice:
        "If you can answer 'yes' to these questions for a given client, your actual risk is much lower " +
        "than the tool's assessed severity. In this case, you should document your compensating controls " +
        "and can confidently de-prioritize the finding. If the answers are 'no', the assessed severity is " +
        "likely accurate."
    }
  }
};

// ---------------------------------------------------------------------------
// Grouping logic
// ---------------------------------------------------------------------------

/**
 * Derive a short evidence summary from a finding instance suitable for a
 * compact table cell.
 */
function summariseEvidence(f: Finding): string {
  // If evidence is already compact, use it directly.
  if (f.evidence.length <= 120) return f.evidence;
  // Try to pull out the key metric part of evidence strings like:
  // "ClientName (id…); total_scopes=N; write/delete/admin=M; examples=…"
  const writeMatch = f.evidence.match(/write\/delete\/admin=(\d+)/);
  const totalMatch = f.evidence.match(/total_scopes=(\d+)/);
  if (writeMatch || totalMatch) {
    const parts: string[] = [];
    if (totalMatch) parts.push(`total_scopes=${totalMatch[1]}`);
    if (writeMatch) parts.push(`write_scopes=${writeMatch[1]}`);
    const ex = f.evidence.match(/examples=([^;]+)/);
    if (ex) parts.push(`examples=${ex[1].trim()}`);
    return parts.join("; ");
  }
  // Truncate with ellipsis as a last resort.
  return f.evidence.slice(0, 117) + "...";
}

/**
 * Group all findings that share the same rule ID into ConsolidatedFinding
 * objects. Findings without a rule override are also consolidated so the
 * renderer can use a single code path.
 */
export function consolidateFindings(findings: Finding[]): ConsolidatedFinding[] {
  // Group by id.
  const groups = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!groups.has(f.id)) groups.set(f.id, []);
    groups.get(f.id)!.push(f);
  }

  const result: ConsolidatedFinding[] = [];

  for (const [id, instances] of groups) {
    const override = RULE_OVERRIDES[id];

    // Merge recommendations: use override if present, otherwise first instance.
    const title = override?.title ?? instances[0].title;
    const riskSummary = override?.riskSummary ?? instances[0].businessRisk;
    const recommendation = override?.recommendation ?? instances[0].recommendation;

    // Compute aggregate metrics.
    const overallSeverity = highestSeverity(instances.map((i) => i.severity));
    const overallProdEquivSeverity = instances.some((i) => i.productionEquivalentSeverity)
      ? highestSeverity(
          instances.map((i) => i.productionEquivalentSeverity ?? i.severity)
        )
      : undefined;
    const totalScoreImpact = instances.reduce((sum, i) => sum + i.scoreImpact, 0);
    const totalProdEquivImpact = instances.some(
      (i) => i.productionEquivalentScoreImpact !== undefined
    )
      ? instances.reduce(
          (sum, i) => sum + (i.productionEquivalentScoreImpact ?? i.scoreImpact),
          0
        )
      : undefined;

    // Build per-resource rows.
    const instanceRows: ConsolidatedFindingRow[] = instances.map((f) => {
      const resource =
        f.affectedResources.length === 1
          ? f.affectedResources[0]
          : f.affectedResources.join(", ");
      return {
        resource,
        severity: f.severity,
        productionEquivalentSeverity: f.productionEquivalentSeverity,
        environmentAdjustedSeverity: f.environmentAdjustedSeverity,
        scoreImpact: f.scoreImpact,
        productionEquivalentScoreImpact: f.productionEquivalentScoreImpact,
        evidenceSummary: summariseEvidence(f)
      };
    });

    // Pick remediation metadata from the first instance that has it.
    const withRemediation = instances.find(
      (i) =>
        i.auth0Area ||
        i.terraformResource ||
        (i.implementationSteps && i.implementationSteps.length > 0) ||
        (i.validationSteps && i.validationSteps.length > 0)
    ) ?? instances[0];

    // Merge false-positive notes (deduplicated).
    const allFpNotes = instances.flatMap((i) => i.falsePositiveNotes ?? []);
    const fpNotes = [...new Set(allFpNotes)];

    result.push({
      id,
      title,
      overallSeverity,
      overallProductionEquivalentSeverity: overallProdEquivSeverity,
      category: instances[0].category,
      totalScoreImpact,
      totalProductionEquivalentScoreImpact: totalProdEquivImpact,
      riskSummary,
      recommendation,
      instances: instanceRows,
      howToInterpret: override?.howToInterpret,
      auth0Area: withRemediation.auth0Area,
      terraformResource: withRemediation.terraformResource,
      terraformFields: withRemediation.terraformFields,
      implementationSteps: withRemediation.implementationSteps,
      validationSteps: withRemediation.validationSteps,
      falsePositiveNotes: fpNotes.length > 0 ? fpNotes : undefined,
      confidence: instances[0].confidence
    });
  }

  // Preserve severity order (critical first).
  result.sort(
    (a, b) =>
      SEVERITY_RANK[b.overallSeverity] - SEVERITY_RANK[a.overallSeverity]
  );

  return result;
}

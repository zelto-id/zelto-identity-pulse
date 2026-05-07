/**
 * Deterministic remediation plan: groups findings into Immediate / Short Term
 * / Later buckets based on severity (and category for tiebreak).
 */

import {
  Finding,
  RemediationBucket,
  RemediationItem,
  RemediationPlan,
  Severity
} from "../../reporting/markdown/report.types";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4
};

const CATEGORY_PRIORITY: Record<string, number> = {
  attackProtection: 0,
  applications: 1,
  apis: 2,
  connections: 3,
  monitoring: 4,
  actionsAndExtensibility: 5,
  rbac: 6,
  organizations: 7,
  tenantBaseline: 8,
  brandingAndLoginExperience: 9
};

function effortFor(severity: Severity, category: string): "low" | "medium" | "high" {
  if (severity === "low" || severity === "info") return "low";
  if (
    severity === "medium" ||
    category === "brandingAndLoginExperience" ||
    category === "tenantBaseline"
  )
    return "medium";
  if (category === "actionsAndExtensibility") return "high";
  return "medium";
}

export function expectedOutcomeFor(f: Finding): string {
  // Plain-English outcome — never duplicates the recommendation. Use the
  // production-equivalent severity context where helpful.
  switch (f.id) {
    case "AUTH-TEN-001":
      return "Improves trust signals and supportability during authentication flows.";
    case "AUTH-TEN-003-A":
      return "Limits the impact of stolen session cookies and unattended browsers.";
    case "AUTH-TEN-003-B":
      return "Reduces re-use risk of long-idle sessions on shared devices.";
    case "AUTH-TEN-004-A":
      return "Restores clickjack protection on the Universal Login experience.";
    case "AUTH-TEN-004-B":
      return "Restores SMS field obfuscation in Management API responses.";
    case "AUTH-CLI-001":
      return "Reduces token leakage risk and aligns browser-based login flows with modern OAuth/OIDC best practice.";
    case "AUTH-CLI-002":
      return "Shrinks the attack surface for redirect/origin abuse and open-redirect chains.";
    case "AUTH-CLI-004":
      return "Limits the useful lifetime of a stolen refresh token to a bounded window and breaks long-lived takeover persistence.";
    case "AUTH-CLI-005":
      return "Forces confidential apps to authenticate, removing client-id-only spoofing risk.";
    case "AUTH-CON-001":
      return "Reduces weak-password and credential-stuffing takeover risk.";
    case "AUTH-CON-002":
      return "Restores per-account brute-force throttling on the affected connection.";
    case "AUTH-CON-003":
      return "Clarifies ownership of authentication logic and reduces operational risk in the login pipeline.";
    case "AUTH-API-001":
      return "Removes shared-secret distribution across API verifiers and unblocks safer key rotation.";
    case "AUTH-API-002":
      return "Makes existing permissions actually govern access at token-issuance time.";
    case "AUTH-API-003":
      return "Bounds the window during which a stolen access token remains valid.";
    case "AUTH-API-005":
      return "Reduces the blast radius of a compromised M2M client.";
    case "AUTH-API-007":
      return "Limits Management API authority to scopes that are actively required, reducing tenant-wide blast radius.";
    case "AUTH-RBAC-001":
      return "Makes authorization explicit and reviewable, improving entitlement governance.";
    case "AUTH-EXT-001":
      return "Removes a hard 2026-11-18 platform deadline from the auth pipeline.";
    case "AUTH-EXT-002":
      return "Keeps Actions on a supported, security-patched runtime.";
    case "AUTH-SEC-001":
      return "Reduces account takeover risk by requiring a second factor for end users.";
    case "AUTH-SEC-004":
      return "Slows targeted password-guessing attacks at the IP/account boundary.";
    case "AUTH-SEC-005":
      return "Prevents users with known-compromised passwords from authenticating silently.";
    case "AUTH-SEC-006":
      return "Throttles credential stuffing and signup-abuse campaigns at the IP layer.";
    case "AUTH-OBS-001":
      return "Provides durable telemetry for incident response and audit evidence.";
    case "AUTH-UX-001":
      return "Unlocks ongoing platform investments (passkeys, identifier-first, A/B testing).";
    case "AUTH-UX-003":
      return "Strengthens brand trust during login and supports phishing-resistant patterns like passkeys.";
    case "AUTH-ORG-001":
      return "Aligns B2B configuration with product expectations and avoids ambiguous tenant routing.";
    default:
      // Generic, deterministic fallback that does NOT echo the recommendation.
      return `Reduces the risk described under "${f.title}" and improves alignment with platform best practice.`;
  }
}

function bucketFor(f: Finding): "immediate" | "shortTerm" | "later" {
  // Use production-equivalent severity for bucket placement so that
  // environment-adjusted severities (e.g. dev tenant "API Explorer" downshift
  // from critical → high) still drive urgent items into Immediate when the
  // underlying configuration is production-impacting.
  const effective = f.productionEquivalentSeverity ?? f.severity;

  if (effective === "critical") return "immediate";

  if (effective === "high") {
    if (
      f.category === "attackProtection" ||
      f.id === "AUTH-API-001" ||
      f.id === "AUTH-API-007" ||
      f.id === "AUTH-OBS-001" ||
      f.id === "AUTH-CON-002"
    ) {
      return "immediate";
    }
    return "shortTerm";
  }

  if (effective === "medium") return "shortTerm";
  return "later";
}

export function buildRemediationPlan(findings: Finding[]): RemediationPlan {
  const sortable = findings
    .filter((f) => f.severity !== "info")
    .slice()
    .sort((a, b) => {
      const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (s !== 0) return s;
      const c =
        (CATEGORY_PRIORITY[a.category] ?? 99) -
        (CATEGORY_PRIORITY[b.category] ?? 99);
      if (c !== 0) return c;
      return a.id.localeCompare(b.id);
    });

  const immediate: RemediationItem[] = [];
  const shortTerm: RemediationItem[] = [];
  const later: RemediationItem[] = [];

  for (const f of sortable) {
    const item: RemediationItem = {
      priority: 0, // assigned per bucket below
      findingId: f.id,
      action: f.recommendation,
      expectedOutcome: expectedOutcomeFor(f),
      effort: effortFor(f.severity, f.category),
      severity: f.severity
    };
    const b = bucketFor(f);
    if (b === "immediate") immediate.push(item);
    else if (b === "shortTerm") shortTerm.push(item);
    else later.push(item);
  }

  const assignPriority = (items: RemediationItem[]): RemediationItem[] =>
    items.map((it, i) => ({ ...it, priority: i + 1 }));

  const buckets: RemediationBucket[] = [
    {
      id: "immediate",
      name: "Immediate",
      window: "0–7 days",
      items: assignPriority(immediate)
    },
    {
      id: "shortTerm",
      name: "Short Term",
      window: "2–4 weeks",
      items: assignPriority(shortTerm)
    },
    {
      id: "later",
      name: "Later",
      window: "1–2 months",
      items: assignPriority(later)
    }
  ];

  return { buckets };
}

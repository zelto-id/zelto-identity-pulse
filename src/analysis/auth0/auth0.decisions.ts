/**
 * Deterministic Key Decisions generator.
 *
 * Each rule below inspects findings (and environment) and emits a small
 * number of decision questions the engineering and security teams should
 * answer before applying remediation.
 */

import { Auth0TenantSnapshot } from "../../connectors/auth0/auth0.types";
import { isManagementApiIdentifier } from "../../connectors/auth0/auth0.naming";
import {
  Environment,
  Finding,
  KeyDecision
} from "../../reporting/markdown/report.types";

export interface BuildDecisionsInput {
  findings: Finding[];
  environment: Environment;
  snapshot: Auth0TenantSnapshot;
}

export function buildKeyDecisions(input: BuildDecisionsInput): KeyDecision[] {
  const decisions: KeyDecision[] = [];
  const findingsById = new Map<string, Finding[]>();
  for (const f of input.findings) {
    const arr = findingsById.get(f.id) ?? [];
    arr.push(f);
    findingsById.set(f.id, arr);
  }

  // 1. Non-prod tenant mirrors production controls?
  if (
    (input.environment === "development" ||
      input.environment === "sandbox" ||
      input.environment === "staging") &&
    (findingsById.has("AUTH-SEC-001") ||
      findingsById.has("AUTH-OBS-001") ||
      findingsById.has("AUTH-SEC-004") ||
      findingsById.has("AUTH-SEC-005"))
  ) {
    decisions.push({
      id: "DEC-ENV-MIRROR",
      question: `Should this ${input.environment} tenant mirror production MFA and logging controls?`,
      context:
        "If this tenant ever holds real-user data, real customer integrations, or pre-production rehearsals, mirroring production MFA and log streaming reduces drift and post-promotion surprises.",
      relatedFindingIds: ["AUTH-SEC-001", "AUTH-OBS-001", "AUTH-SEC-004", "AUTH-SEC-005"].filter((id) =>
        findingsById.has(id)
      )
    });
  }

  // 2. API Explorer / Management API broad scopes?
  const mgmtGrant = (input.snapshot.clientGrants ?? []).find((g) =>
    isManagementApiIdentifier(g.audience)
  );
  if (mgmtGrant && findingsById.has("AUTH-API-007")) {
    decisions.push({
      id: "DEC-MGMT-API-CLIENT",
      question:
        "Is the API Explorer Application (or this M2M client) still required with broad Management API scopes?",
      context:
        "Long-lived broad Management API authority is a high-blast-radius credential. Prefer a dedicated, least-privilege M2M client per workflow (scanning, IaC, support) and rotate or remove unused grants.",
      relatedFindingIds: ["AUTH-API-007"]
    });
  }

  // 3. Custom DB scripts: temporary or long-term?
  if (findingsById.has("AUTH-CON-003")) {
    decisions.push({
      id: "DEC-CUSTOM-DB-SCRIPTS",
      question:
        "Are custom database scripts temporary migration logic or intended long-term architecture?",
      context:
        "Custom DB scripts run inside the auth pipeline. If they are migration logic, plan a sunset; if they are long-term, document ownership, secret handling, and operational runbooks.",
      relatedFindingIds: ["AUTH-CON-003"]
    });
  }

  // 4. Regular web apps with client_credentials?
  const regWebWithCC = (input.snapshot.clients ?? []).filter(
    (c) =>
      c.app_type === "regular_web" &&
      (c.grant_types ?? []).includes("client_credentials")
  );
  if (regWebWithCC.length > 0) {
    decisions.push({
      id: "DEC-RWA-CLIENT-CREDENTIALS",
      question:
        "Should regular web applications have client_credentials enabled, or should M2M access use a separate client?",
      context:
        "Mixing user-facing and machine-to-machine flows in a single client conflates blast radius and complicates secret rotation. A dedicated M2M client is usually clearer.",
      relatedFindingIds: ["AUTH-CLI-001"].filter((id) => findingsById.has(id))
    });
  }

  // 5. Legacy Rules/Hooks migration ownership?
  if (findingsById.has("AUTH-EXT-001")) {
    decisions.push({
      id: "DEC-RULES-HOOKS-OWNER",
      question:
        "Who owns the Rules/Hooks → Actions migration, and is the 2026-11-18 EOL date on the engineering roadmap?",
      context:
        "Auth0 Rules and Hooks reach end of life on 2026-11-18. Migrations touch the auth pipeline and require coordinated test coverage on each trigger.",
      relatedFindingIds: ["AUTH-EXT-001"]
    });
  }

  // 6. Public confidential client?
  if (findingsById.has("AUTH-CLI-005")) {
    decisions.push({
      id: "DEC-CONFIDENTIAL-CLIENT",
      question:
        "Is the confidential client genuinely public-facing, or has the token endpoint authentication method been misconfigured?",
      context:
        "A confidential app authenticating as `none` is functionally a public client. Confirm whether this is intentional (and document the compensating controls) or an oversight to be corrected.",
      relatedFindingIds: ["AUTH-CLI-005"]
    });
  }

  // 7. No log stream — accept short retention?
  if (findingsById.has("AUTH-OBS-001")) {
    decisions.push({
      id: "DEC-LOG-RETENTION",
      question:
        "Is the default Auth0 log retention window acceptable for this tenant's incident-response and audit needs?",
      context:
        "Without a log stream, security investigations and audits are limited to the platform's default retention. A SIEM or log-analytics destination provides durable evidence and longer retention.",
      relatedFindingIds: ["AUTH-OBS-001"]
    });
  }

  return decisions;
}

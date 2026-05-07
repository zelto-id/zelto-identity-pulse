/**
 * Deterministic Auth0 posture rules.
 *
 * Each rule inspects the snapshot and emits zero or more Findings.
 * Rules tolerate missing/partial data: missing data does not silently pass —
 * the analyzer downgrades confidence (and may apply a small uncertainty
 * penalty) for affected categories.
 */

import { Auth0TenantSnapshot } from "../../connectors/auth0/auth0.types";
import {
  buildClientLookup,
  buildResourceServerLookup,
  classifyMgmtScopes,
  formatClientGrantName,
  formatClientName,
  formatConnectionName,
  formatResourceServerName,
  isManagementApiIdentifier,
  shortId
} from "../../connectors/auth0/auth0.naming";
import {
  Finding,
  SEVERITY_SCORE_IMPACT,
  Severity
} from "../../reporting/markdown/report.types";
import { enrichFinding } from "./auth0.findingMetadata";

export interface RuleContext {
  snapshot: Auth0TenantSnapshot;
}

export type Rule = (ctx: RuleContext) => Finding[];

function mkFinding(opts: Omit<Finding, "scoreImpact"> & { scoreImpact?: number }): Finding {
  return {
    ...opts,
    scoreImpact: opts.scoreImpact ?? SEVERITY_SCORE_IMPACT[opts.severity]
  };
}

// ---------------------------------------------------------------------------
// Tenant baseline
// ---------------------------------------------------------------------------

const ruleTenantMetadata: Rule = ({ snapshot }) => {
  const t = snapshot.tenant;
  if (!t) return [];
  const missing: string[] = [];
  if (!t.friendly_name) missing.push("friendly_name");
  if (!t.support_email) missing.push("support_email");
  if (!t.support_url) missing.push("support_url");
  if (!t.picture_url) missing.push("picture_url (logo)");
  if (missing.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-TEN-001",
      title: "Tenant metadata is incomplete",
      severity: "low",
      category: "tenantBaseline",
      affectedResources: ["auth0_tenant"],
      evidence: `Missing tenant metadata: ${missing.join(", ")}.`,
      recommendation:
        "Set friendly name, support email, support URL, and logo on tenant settings for production-readiness.",
      businessRisk:
        "Incomplete metadata weakens trust signals shown to end users and downstream support tooling.",
      confidence: "high"
    })
  ];
};

const ruleSessionLifetime: Rule = ({ snapshot }) => {
  const t = snapshot.tenant;
  if (!t) return [];
  const findings: Finding[] = [];
  const idle = t.idle_session_lifetime;
  const abs = t.session_lifetime;
  if (typeof abs === "number" && abs > 720) {
    findings.push(
      mkFinding({
        id: "AUTH-TEN-003-A",
        title: "Tenant absolute session lifetime is excessive",
        severity: "medium",
        category: "tenantBaseline",
        affectedResources: ["auth0_tenant.session_lifetime"],
        evidence: `Absolute session lifetime is ${abs}h (>720h).`,
        recommendation:
          "Reduce absolute session lifetime to <= 168h for standard CIAM apps; document any longer lifetime explicitly.",
        businessRisk:
          "Long-lived sessions extend the blast radius of stolen cookies or compromised devices.",
        confidence: "high"
      })
    );
  }
  if (typeof idle === "number" && idle > 168) {
    findings.push(
      mkFinding({
        id: "AUTH-TEN-003-B",
        title: "Tenant idle session lifetime is excessive",
        severity: "low",
        category: "tenantBaseline",
        affectedResources: ["auth0_tenant.idle_session_lifetime"],
        evidence: `Idle session lifetime is ${idle}h (>168h).`,
        recommendation:
          "Reduce idle session lifetime to <= 72h for standard CIAM apps.",
        businessRisk:
          "Idle sessions that never expire increase the chance that an unattended browser session is reused.",
        confidence: "high"
      })
    );
  }
  return findings;
};

const ruleProtectiveFlags: Rule = ({ snapshot }) => {
  const t = snapshot.tenant;
  if (!t || !t.flags) return [];
  const flags = t.flags;
  const findings: Finding[] = [];
  if (flags.disable_clickjack_protection_headers) {
    findings.push(
      mkFinding({
        id: "AUTH-TEN-004-A",
        title: "Clickjack protection headers are disabled",
        severity: "medium",
        category: "tenantBaseline",
        affectedResources: ["auth0_tenant.flags.disable_clickjack_protection_headers"],
        evidence: "Flag `disable_clickjack_protection_headers` is true.",
        recommendation:
          "Re-enable clickjack protection headers unless there is a documented reason.",
        businessRisk:
          "Login UI becomes embeddable in iframes, enabling clickjacking against end users.",
        confidence: "high"
      })
    );
  }
  if (flags.disable_management_api_sms_obfuscation) {
    findings.push(
      mkFinding({
        id: "AUTH-TEN-004-B",
        title: "Management API SMS obfuscation is disabled",
        severity: "low",
        category: "tenantBaseline",
        affectedResources: ["auth0_tenant.flags.disable_management_api_sms_obfuscation"],
        evidence: "Flag `disable_management_api_sms_obfuscation` is true.",
        recommendation:
          "Re-enable SMS obfuscation unless required for an operational use case.",
        businessRisk:
          "Sensitive phone-related fields are exposed in Management API responses.",
        confidence: "high"
      })
    );
  }
  return findings;
};

// ---------------------------------------------------------------------------
// Applications / Clients
// ---------------------------------------------------------------------------

const RISKY_GRANTS = new Set([
  "implicit",
  "password",
  "http://auth0.com/oauth/grant-type/password-realm"
]);

const BROWSERISH_APP_TYPES = new Set(["spa", "native"]);

const ruleClientGrantTypes: Rule = ({ snapshot }) => {
  const clients = snapshot.clients ?? [];

  // Clearly risky: implicit / password / password-realm grants.
  // Requires validation: client_credentials on regular_web/spa clients,
  // or refresh_token without evidence of rotation/expiration controls.
  type Hit = { observed: string[]; needsValidation: string[]; client: typeof clients[number] };
  const hits: Hit[] = [];

  for (const c of clients) {
    const grants = c.grant_types ?? [];
    const observed: string[] = [];
    const needsValidation: string[] = [];

    const risky = grants.filter((g) => RISKY_GRANTS.has(g));
    if (risky.length > 0) {
      observed.push(
        `${formatClientName(c)} [type=${c.app_type ?? "?"}]: risky grants=${risky.join(", ")}`
      );
    }

    if (
      grants.includes("client_credentials") &&
      (c.app_type === "regular_web" || c.app_type === "spa")
    ) {
      needsValidation.push(
        `${formatClientName(c)} [type=${c.app_type}]: client_credentials enabled — confirm M2M usage is intentional and not mixed with end-user flows.`
      );
    }

    if (
      grants.includes("refresh_token") &&
      (BROWSERISH_APP_TYPES.has(c.app_type ?? "") || c.app_type === undefined) &&
      (!c.refresh_token ||
        !c.refresh_token.rotation_type ||
        c.refresh_token.rotation_type !== "rotating" ||
        !c.refresh_token.expiration_type ||
        c.refresh_token.expiration_type === "non-expiring")
    ) {
      // AUTH-CLI-004 already covers the *clearly broken* case (non-rotating /
      // non-expiring). Here we add a softer "requires validation" signal when
      // refresh_token is enabled but the rotation/expiration story is
      // ambiguous (e.g. fields unset).
      const rt = c.refresh_token;
      if (!rt || !rt.rotation_type || !rt.expiration_type) {
        needsValidation.push(
          `${formatClientName(c)} [type=${c.app_type ?? "?"}]: refresh_token enabled but rotation/expiration metadata is unset — confirm rotation policy.`
        );
      }
    }

    if (observed.length > 0 || needsValidation.length > 0) {
      hits.push({ observed, needsValidation, client: c });
    }
  }

  if (hits.length === 0) return [];

  // Promote severity based on whether any *clearly risky* signals exist.
  const anyObserved = hits.some((h) => h.observed.length > 0);
  const observedRisks = hits.flatMap((h) => h.observed).slice(0, 8);
  const requiresValidation = hits.flatMap((h) => h.needsValidation).slice(0, 8);

  const evidenceParts: string[] = [];
  if (observedRisks.length > 0)
    evidenceParts.push(`Observed risks: ${observedRisks.join(" | ")}`);
  if (requiresValidation.length > 0)
    evidenceParts.push(`Requires validation: ${requiresValidation.join(" | ")}`);

  return [
    mkFinding({
      id: "AUTH-CLI-001",
      title: anyObserved
        ? "Risky/legacy OAuth grant types are enabled on one or more clients"
        : "OAuth grant configuration requires validation on one or more clients",
      severity: anyObserved ? "high" : "medium",
      category: "applications",
      affectedResources: hits.map((h) => formatClientName(h.client)),
      evidence: evidenceParts.join(". ") || "(see evidenceSplit)",
      evidenceSplit: { observedRisks, requiresValidation },
      recommendation:
        "Remove `implicit` and resource-owner-password grant types. Migrate SPAs to authorization_code + PKCE. For confirmed M2M needs, use a dedicated client (do not mix with end-user flows).",
      businessRisk:
        "Legacy grants expose tokens in URL fragments or transmit credentials directly, increasing leakage and phishing risk. Mixed-purpose clients enlarge blast radius.",
      confidence: anyObserved ? "high" : "medium"
    })
  ];
};

const ruleCallbackHygiene: Rule = ({ snapshot }) => {
  const clients = snapshot.clients ?? [];
  const offenders = clients.filter((c) => {
    const cbs = c.callbacks ?? [];
    const origins = c.web_origins ?? [];
    const hasNonHttps = [...cbs, ...origins].some(
      (u) => typeof u === "string" && u.startsWith("http://") && !u.startsWith("http://localhost")
    );
    const sprawl = cbs.length > 15;
    return hasNonHttps || sprawl;
  });
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CLI-002",
      title: "Callback / origin sprawl or non-HTTPS endpoints observed",
      severity: "high",
      category: "applications",
      affectedResources: offenders.map(formatClientName),
      evidence: offenders
        .map(
          (c) =>
            `${formatClientName(c)} [type=${c.app_type ?? "?"}]: callbacks=${(c.callbacks ?? []).length}, web_origins=${(c.web_origins ?? []).length}, allowed_origins=${(c.allowed_origins ?? []).length}, auth_method=${c.token_endpoint_auth_method ?? "?"}`
        )
        .slice(0, 5)
        .join(" | "),
      recommendation:
        "Trim callbacks/web origins to the minimum required per environment; require HTTPS for non-localhost URLs.",
      businessRisk:
        "Excess or insecure redirect targets enable token leakage, open-redirect chains, and credential exfiltration.",
      confidence: "high"
    })
  ];
};

const ruleRefreshTokenPosture: Rule = ({ snapshot }) => {
  const clients = snapshot.clients ?? [];
  const offenders = clients.filter((c) => {
    const isBrowserish =
      c.app_type === "spa" || c.app_type === "native" || c.app_type === undefined;
    if (!isBrowserish) return false;
    if (!(c.grant_types ?? []).includes("refresh_token")) return false;
    const rt = c.refresh_token;
    if (!rt) return false;
    const nonRotating = rt.rotation_type && rt.rotation_type !== "rotating";
    const nonExpiring = rt.expiration_type && rt.expiration_type === "non-expiring";
    return Boolean(nonRotating || nonExpiring);
  });
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CLI-004",
      title: "SPA/native client uses non-rotating or non-expiring refresh tokens",
      severity: "critical",
      category: "applications",
      affectedResources: offenders.map(formatClientName),
      evidence: offenders
        .map(
          (c) =>
            `${formatClientName(c)} [type=${c.app_type ?? "?"}]: rotation=${c.refresh_token?.rotation_type ?? "?"}, expiration=${c.refresh_token?.expiration_type ?? "?"}, token_lifetime=${c.refresh_token?.token_lifetime ?? "?"}`
        )
        .slice(0, 5)
        .join(" | "),
      recommendation:
        "Enable refresh token rotation and expiration on all browser-facing and native clients; bound the absolute lifetime.",
      businessRisk:
        "A stolen refresh token remains valid indefinitely, allowing persistent account takeover after a single compromise.",
      confidence: "high"
    })
  ];
};

const ruleConfidentialClientAuth: Rule = ({ snapshot }) => {
  const clients = snapshot.clients ?? [];
  const offenders = clients.filter((c) => {
    const isConfidential =
      c.app_type === "regular_web" || c.app_type === "non_interactive";
    if (!isConfidential) return false;
    return c.token_endpoint_auth_method === "none";
  });
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CLI-005",
      title: "Confidential client misconfigured as public",
      severity: "critical",
      category: "applications",
      affectedResources: offenders.map(formatClientName),
      evidence: offenders
        .map((c) => `${formatClientName(c)} [type=${c.app_type ?? "?"}]: token_endpoint_auth_method=none`)
        .join(" | "),
      recommendation:
        "Use `private_key_jwt` or mTLS for high-assurance integrations; otherwise `client_secret_post`/`client_secret_basic`.",
      businessRisk:
        "Confidential apps that authenticate as public expose APIs to anyone able to spoof the client_id.",
      confidence: "high"
    })
  ];
};

// ---------------------------------------------------------------------------
// Connections
// ---------------------------------------------------------------------------

const ruleDbPasswordPolicy: Rule = ({ snapshot }) => {
  const conns = (snapshot.connections ?? []).filter((c) => c.strategy === "auth0");
  const offenders = conns.filter((c) => {
    const policy = c.options?.password_policy;
    return !policy || policy === "none" || policy === "low";
  });
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CON-001",
      title: "Database connection uses a weak or missing password policy",
      severity: "high",
      category: "connections",
      affectedResources: offenders.map(formatConnectionName),
      evidence: offenders
        .map(
          (c) =>
            `${formatConnectionName(c)}: policy=${c.options?.password_policy ?? "none"}, enabled_clients=${(c.enabled_clients ?? []).length}`
        )
        .join(" | "),
      recommendation:
        "Set password_policy to `good` or `excellent` and enable history, dictionary, and personal-info checks.",
      businessRisk:
        "Weak password policies materially increase credential-stuffing and brute-force takeover risk.",
      confidence: "high"
    })
  ];
};

const ruleBruteForceOnConnection: Rule = ({ snapshot }) => {
  const conns = (snapshot.connections ?? []).filter((c) => c.strategy === "auth0");
  const offenders = conns.filter((c) => c.options?.brute_force_protection === false);
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CON-002",
      title: "Brute-force protection disabled on a database connection",
      severity: "high",
      category: "connections",
      affectedResources: offenders.map(formatConnectionName),
      evidence: offenders
        .map(
          (c) =>
            `${formatConnectionName(c)}: brute_force_protection=false, disable_signup=${c.options?.disable_signup ?? "?"}`
        )
        .join(" | "),
      recommendation: "Re-enable brute-force protection on all production database connections.",
      businessRisk:
        "Disabling brute-force protection enables account-by-account password guessing without throttling.",
      confidence: "high"
    })
  ];
};

const ruleCustomDbScripts: Rule = ({ snapshot }) => {
  const conns = (snapshot.connections ?? []).filter(
    (c) =>
      c.strategy === "auth0" &&
      (c.options?.enabledDatabaseCustomization ||
        (c.options?.customScripts && Object.keys(c.options.customScripts).length > 0))
  );
  if (conns.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-CON-003",
      title: "Custom database scripts in use",
      severity: "medium",
      category: "connections",
      affectedResources: conns.map(formatConnectionName),
      evidence: conns
        .map(
          (c) =>
            `${formatConnectionName(c)}: scripts=${Object.keys(c.options?.customScripts ?? {}).join(", ") || "(enabled)"}`
        )
        .join(" | "),
      recommendation:
        "Review custom DB scripts for governance, secret handling, and migration paths to a standard provider.",
      businessRisk:
        "Custom DB scripts run inside the auth pipeline and create operational and security blind spots.",
      confidence: "medium"
    })
  ];
};

// ---------------------------------------------------------------------------
// APIs / resource servers
// ---------------------------------------------------------------------------

const ruleApiSigningAlg: Rule = ({ snapshot }) => {
  const rs = (snapshot.resourceServers ?? []).filter(
    (r) => !isManagementApiIdentifier(r.identifier)
  );
  const offenders = rs.filter(
    (r) => r.signing_alg && r.signing_alg.toUpperCase() === "HS256"
  );
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-API-001",
      title: "API signed with HS256",
      severity: "high",
      category: "apis",
      affectedResources: offenders.map(formatResourceServerName),
      evidence: offenders
        .map(
          (r) =>
            `${formatResourceServerName(r)}: signing_alg=${r.signing_alg}, scopes=${(r.scopes ?? []).length}, token_dialect=${r.token_dialect ?? "?"}`
        )
        .join(" | "),
      recommendation:
        "Use `RS256` or `PS256` for externally consumed APIs; HS256 requires sharing the secret with verifiers.",
      businessRisk:
        "Symmetric signing forces secret distribution; a compromised verifier can mint valid access tokens.",
      confidence: "high"
    })
  ];
};

const ruleApiRbacEnforcement: Rule = ({ snapshot }) => {
  // Exclude system APIs (Auth0 Management API) — RBAC is not user-managed there.
  const customApis = (snapshot.resourceServers ?? []).filter(
    (r) => !isManagementApiIdentifier(r.identifier)
  );
  const withScopes = customApis.filter((r) => (r.scopes ?? []).length > 0);
  const offenders = withScopes.filter((r) => r.enforce_policies !== true);
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-API-002",
      title: "API has permissions defined but does not enforce RBAC",
      severity: "high",
      category: "apis",
      affectedResources: offenders.map(formatResourceServerName),
      evidence: offenders
        .map(
          (r) =>
            `${formatResourceServerName(r)}: scopes=${(r.scopes ?? []).length}, enforce_policies=${r.enforce_policies}, token_dialect=${r.token_dialect ?? "?"}`
        )
        .join(" | "),
      recommendation: "Enable `enforce_policies` (RBAC) on every custom API that defines permissions.",
      businessRisk:
        "Permissions appear to govern access but are not enforced at token-issuance time.",
      confidence: "high"
    })
  ];
};

const ruleApiTokenLifetime: Rule = ({ snapshot }) => {
  const rs = (snapshot.resourceServers ?? []).filter(
    (r) => !isManagementApiIdentifier(r.identifier)
  );
  const offenders = rs.filter(
    (r) => typeof r.token_lifetime === "number" && r.token_lifetime > 86400 * 7
  );
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-API-003",
      title: "API access token lifetime is excessively long",
      severity: "medium",
      category: "apis",
      affectedResources: offenders.map(formatResourceServerName),
      evidence: offenders
        .map((r) => `${formatResourceServerName(r)}: token_lifetime=${r.token_lifetime}s`)
        .join(" | "),
      recommendation:
        "Reduce access token lifetime to <= 24h; rely on refresh tokens for longer sessions.",
      businessRisk:
        "Long-lived access tokens cannot be revoked and increase the window of abuse after compromise.",
      confidence: "high"
    })
  ];
};

const ruleClientGrantsBroad: Rule = ({ snapshot }) => {
  const grants = snapshot.clientGrants ?? [];
  const clientLookup = buildClientLookup(snapshot);
  const rsLookup = buildResourceServerLookup(snapshot);
  // Custom-API grants only — Management API has its own dedicated rule.
  const customGrants = grants.filter((g) => !isManagementApiIdentifier(g.audience));
  const offenders = customGrants.filter(
    (g) => g.allow_any_organization === true || (g.scope && g.scope.length > 30)
  );
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-API-005",
      title: "Client grant is overly broad",
      severity: "high",
      category: "apis",
      affectedResources: offenders.map((g) =>
        formatClientGrantName(g, clientLookup, rsLookup)
      ),
      evidence: offenders
        .map(
          (g) =>
            `${formatClientGrantName(g, clientLookup, rsLookup)}: scopes=${g.scope?.length ?? 0}, allow_any_organization=${g.allow_any_organization === true}`
        )
        .slice(0, 5)
        .join(" | "),
      recommendation:
        "Tighten scopes to least privilege; avoid `allow_any_organization` in B2B integrations.",
      businessRisk:
        "Over-scoped M2M grants extend a compromised client's blast radius across APIs and tenants.",
      confidence: "high"
    })
  ];
};

const ruleManagementApiGrant: Rule = ({ snapshot }) => {
  const grants = snapshot.clientGrants ?? [];
  const clientLookup = buildClientLookup(snapshot);
  const rsLookup = buildResourceServerLookup(snapshot);
  const mgmtGrants = grants.filter((g) => isManagementApiIdentifier(g.audience));
  if (mgmtGrants.length === 0) return [];

  // Scope categories that change severity calibration.
  const HIGH_RISK_TOKENS = [
    "create:",
    "update:",
    "delete:",
    "write:",
    "admin",
    "keys",
    "secrets",
    "client_grants",
    "clients"
  ];
  const isHighRisk = (s: string): boolean =>
    HIGH_RISK_TOKENS.some((t) => s.startsWith(t) || s.includes(t));

  return mgmtGrants
    .map((g) => {
      const scopes = g.scope ?? [];
      const cls = classifyMgmtScopes(scopes);
      const writeOrAdmin = scopes.filter(isHighRisk).length;
      const mostlyReadOnly = cls.total > 0 && writeOrAdmin === 0;
      const client = clientLookup.get(g.client_id);
      const looksLikeApiExplorer =
        !!client &&
        /api\s*explorer/i.test(client.name);

      // Severity calibration:
      //  - mostly read-only → medium
      //  - many sensitive write/delete/admin scopes → critical
      //  - moderate sensitive → high (production-equivalent)
      //  - small/unknown → low
      let severity: Severity;
      if (writeOrAdmin >= 6 || cls.sensitive >= 10) severity = "critical";
      else if (writeOrAdmin >= 2 || cls.sensitive >= 3) severity = "high";
      else if (mostlyReadOnly) severity = "medium";
      else if (cls.total > 5) severity = "medium";
      else if (cls.total > 0) severity = "low";
      else return null;

      const human = formatClientGrantName(g, clientLookup, rsLookup);
      const evidenceBits = [
        `${human}`,
        `total_scopes=${cls.total}`,
        `sensitive_scopes=${cls.sensitive}`,
        `write/delete/admin=${writeOrAdmin}`
      ];
      if (cls.topSensitive.length > 0) {
        evidenceBits.push(
          `examples=${cls.topSensitive.slice(0, 5).join(", ")}`
        );
      }
      if (looksLikeApiExplorer) {
        evidenceBits.push("client_name_matches_api_explorer");
      }
      const evidence = evidenceBits.join("; ") + ".";

      return mkFinding({
        id: "AUTH-API-007",
        title: "Management API access should be least-privilege",
        severity,
        category: "apis",
        affectedResources: [human],
        evidence,
        recommendation:
          "Create a dedicated least-privilege M2M client for scanning/IaC instead of using the API Explorer Application. Audit Management API scopes against operational need; prefer `read:*` only and remove `create:*`, `update:*`, `delete:*`, and admin/key/secret scopes that are not actively used.",
        businessRisk:
          "Excessive Management API scopes give a single compromised client tenant-wide write authority. Long-lived shared M2M credentials enlarge blast radius and complicate rotation.",
        confidence: mostlyReadOnly ? "medium" : "high"
      });
    })
    .filter((f): f is Finding => f !== null);
};

// ---------------------------------------------------------------------------
// RBAC
// ---------------------------------------------------------------------------

const ruleNoRoles: Rule = ({ snapshot }) => {
  const roles = snapshot.roles;
  if (!roles) return [];
  if (roles.length > 0) return [];
  return [
    mkFinding({
      id: "AUTH-RBAC-001",
      title: "Tenant has no roles defined",
      severity: "medium",
      category: "rbac",
      affectedResources: ["auth0_role"],
      evidence: "0 roles returned from /roles.",
      recommendation:
        "Define roles to model authorization, even for a single application; avoid direct user permissions.",
      businessRisk:
        "Without roles, authorization is ad-hoc and entitlement reviews are difficult.",
      confidence: "medium"
    })
  ];
};

// ---------------------------------------------------------------------------
// Actions / Extensibility
// ---------------------------------------------------------------------------

const ruleLegacyRulesHooks: Rule = ({ snapshot }) => {
  const hasRules = (snapshot.rules ?? []).filter((r) => r.enabled !== false).length > 0;
  const hasHooks = (snapshot.hooks ?? []).filter((h) => h.enabled !== false).length > 0;
  if (!hasRules && !hasHooks) return [];
  const affected: string[] = [];
  if (hasRules) affected.push("auth0_rule");
  if (hasHooks) affected.push("auth0_hook");
  return [
    mkFinding({
      id: "AUTH-EXT-001",
      title: "Production tenant still depends on Rules or Hooks (EOL 2026-11-18)",
      severity: "critical",
      category: "actionsAndExtensibility",
      affectedResources: affected,
      evidence: `Rules enabled: ${(snapshot.rules ?? []).length}, Hooks enabled: ${(snapshot.hooks ?? []).length}.`,
      recommendation:
        "Migrate Rules and Hooks logic to Auth0 Actions before the 2026-11-18 EOL date.",
      businessRisk:
        "Rules and Hooks reach end of life; tenants relying on them will lose functionality and platform support.",
      confidence: "high"
    })
  ];
};

const ruleActionsRuntime: Rule = ({ snapshot }) => {
  const actions = snapshot.actions ?? [];
  const offenders = actions.filter((a) => {
    if (!a.runtime) return false;
    return /node(10|12|14|16)/i.test(a.runtime);
  });
  if (offenders.length === 0) return [];
  return [
    mkFinding({
      id: "AUTH-EXT-002",
      title: "Actions run on outdated Node.js runtime",
      severity: "medium",
      category: "actionsAndExtensibility",
      affectedResources: offenders.map((a) => `${a.name} (${shortId(a.id)})`),
      evidence: offenders.map((a) => `${a.name}: runtime=${a.runtime}`).join(" | "),
      recommendation: "Migrate Actions to `node18` or `node22` before runtime EOL.",
      businessRisk:
        "Outdated runtimes lose security patches and force last-minute migrations under time pressure.",
      confidence: "high"
    })
  ];
};

// ---------------------------------------------------------------------------
// MFA / Attack protection
// ---------------------------------------------------------------------------

const ruleMfaPolicy: Rule = ({ snapshot }) => {
  const g = snapshot.guardian;
  if (!g) return [];
  if (g.policy === "never" || !g.policy) {
    const enabledFactors = (g.factors ?? [])
      .filter((f) => f.enabled === true)
      .map((f) => f.name);
    return [
      mkFinding({
        id: "AUTH-SEC-001",
        title: "MFA policy indicates 'never'",
        severity: "critical",
        category: "attackProtection",
        affectedResources: ["auth0_guardian.policy"],
        evidence: `Guardian policy=${g.policy ?? "not set"}, enabled_factors=${enabledFactors.length ? enabledFactors.join(", ") : "none"}.`,
        recommendation:
          "Set MFA policy to `all-applications` or risk-based `confidence-score` for production tenants.",
        businessRisk:
          "Without enforced MFA, account takeover requires only a leaked or guessed password.",
        confidence: "high"
      })
    ];
  }
  return [];
};

const ruleAttackProtectionShields: Rule = ({ snapshot }) => {
  const ap = snapshot.attackProtection;
  if (!ap) return [];
  const findings: Finding[] = [];
  if (ap.brute_force_protection && ap.brute_force_protection.enabled === false) {
    findings.push(
      mkFinding({
        id: "AUTH-SEC-004",
        title: "Brute-force protection is disabled",
        severity: "critical",
        category: "attackProtection",
        affectedResources: ["auth0_attack_protection.brute_force_protection"],
        evidence: `brute_force_protection.enabled=false, mode=${ap.brute_force_protection.mode ?? "?"}, max_attempts=${ap.brute_force_protection.max_attempts ?? "?"}.`,
        recommendation: "Re-enable brute-force protection at the tenant level.",
        businessRisk:
          "Tenants with brute-force protection off are open to high-velocity password guessing.",
        confidence: "high"
      })
    );
  }
  if (ap.breached_password_detection && ap.breached_password_detection.enabled === false) {
    findings.push(
      mkFinding({
        id: "AUTH-SEC-005",
        title: "Breached password detection is disabled",
        severity: "critical",
        category: "attackProtection",
        affectedResources: ["auth0_attack_protection.breached_password_detection"],
        evidence: `breached_password_detection.enabled=false, method=${ap.breached_password_detection.method ?? "?"}.`,
        recommendation:
          "Enable breached password detection with at least `block` or `admin_notification` shields.",
        businessRisk:
          "Users who reuse compromised credentials remain exploitable indefinitely.",
        confidence: "high"
      })
    );
  }
  if (ap.suspicious_ip_throttling && ap.suspicious_ip_throttling.enabled === false) {
    findings.push(
      mkFinding({
        id: "AUTH-SEC-006",
        title: "Suspicious IP throttling is disabled",
        severity: "critical",
        category: "attackProtection",
        affectedResources: ["auth0_attack_protection.suspicious_ip_throttling"],
        evidence: `suspicious_ip_throttling.enabled=false, allowlist_size=${(ap.suspicious_ip_throttling.allowlist ?? []).length}.`,
        recommendation:
          "Re-enable Suspicious IP Throttling. Auth0 strongly recommends not disabling this control.",
        businessRisk:
          "Without throttling, credential stuffing and signup-abuse campaigns are not slowed at the IP layer.",
        confidence: "high"
      })
    );
  }
  return findings;
};

// ---------------------------------------------------------------------------
// Monitoring
// ---------------------------------------------------------------------------

const ruleNoLogStream: Rule = ({ snapshot }) => {
  const streams = snapshot.logStreams;
  if (!streams) return [];
  const active = streams.filter((s) => (s.status ?? "active") === "active");
  if (active.length > 0) return [];
  return [
    mkFinding({
      id: "AUTH-OBS-001",
      title: "No active log stream",
      severity: "high",
      category: "monitoring",
      affectedResources: ["auth0_log_stream"],
      evidence: `total_streams=${streams.length}, active_streams=0${streams.length ? `, types=${streams.map((s) => s.type ?? "unknown").join(", ")}` : ""}.`,
      recommendation:
        "Configure at least one active log stream to a SIEM or log-analytics platform.",
      businessRisk:
        "Without log streaming, security investigations and audit evidence are limited to a short retention window inside Auth0.",
      confidence: "high"
    })
  ];
};

// ---------------------------------------------------------------------------
// Branding / login experience
// ---------------------------------------------------------------------------

const ruleUniversalLoginExperience: Rule = ({ snapshot }) => {
  const p = snapshot.prompts;
  if (!p) return [];
  if (p.universal_login_experience === "classic") {
    return [
      mkFinding({
        id: "AUTH-UX-001",
        title: "Tenant uses classic Universal Login",
        severity: "medium",
        category: "brandingAndLoginExperience",
        affectedResources: ["auth0_prompt.universal_login_experience"],
        evidence: "universal_login_experience = classic.",
        recommendation: "Migrate to the new Universal Login experience.",
        businessRisk:
          "Classic ULP receives reduced investment and limits future hardening (passkeys, identifier-first).",
        confidence: "high"
      })
    ];
  }
  return [];
};

const ruleNoCustomDomain: Rule = ({ snapshot }) => {
  const cds = snapshot.customDomains;
  if (!cds) return [];
  if (cds.length === 0) {
    return [
      mkFinding({
        id: "AUTH-UX-003",
        title: "No custom domain configured",
        severity: "low",
        category: "brandingAndLoginExperience",
        affectedResources: ["auth0_custom_domain"],
        evidence: "0 custom domains.",
        recommendation:
          "Configure a custom domain with TLS policy `recommended` for production tenants.",
        businessRisk:
          "Default tenant domain weakens branding and complicates phishing-resistant patterns like passkeys.",
        confidence: "medium"
      })
    ];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

const ruleB2BOrganizations: Rule = ({ snapshot }) => {
  const orgs = snapshot.organizations;
  const clients = snapshot.clients ?? [];
  if (!orgs) return [];
  const orgUsingClients = clients.filter(
    (c) => c.organization_usage === "require" || c.organization_usage === "allow"
  );
  if (orgUsingClients.length > 0 && orgs.length === 0) {
    return [
      mkFinding({
        id: "AUTH-ORG-001",
        title: "Clients reference Organizations but no organizations are configured",
        severity: "medium",
        category: "organizations",
        affectedResources: orgUsingClients.map(formatClientName),
        evidence: `${orgUsingClients.length} clients reference orgs; 0 organizations exist.`,
        recommendation:
          "Either remove organization_usage from clients that do not need it, or create the Organizations the product expects.",
        businessRisk:
          "Inconsistent B2B configuration can cause login failures or ambiguous tenant routing.",
        confidence: "medium"
      })
    ];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Coverage / partial-scan transparency
// ---------------------------------------------------------------------------

const rulePartialScan: Rule = ({ snapshot }) => {
  const meta = snapshot.metadata;
  if (!meta?.partial) return [];
  const failed = meta.failedCollectors ?? [];
  const missingScopes = meta.missingScopes ?? [];
  const collectorList = failed.length
    ? failed.map((f) => `${f.collector} (${f.status})`).join(", ")
    : "(none reported)";
  return [
    mkFinding({
      id: "AUTH-COV-001",
      title: "Scan was partial — coverage is incomplete",
      severity: "info",
      category: "tenantBaseline",
      affectedResources: failed.map((f) => f.collector),
      evidence: `Failed/skipped collectors: ${collectorList}.${missingScopes.length ? ` Missing scopes: ${missingScopes.join(", ")}.` : ""}`,
      recommendation:
        "Re-run the scan with the missing Management API scopes granted to obtain full coverage.",
      businessRisk:
        "Unverified areas should be treated as unknown, not safe; absence of findings does not imply absence of risk.",
      confidence: "high"
    })
  ];
};

// ---------------------------------------------------------------------------

export const ALL_RULES: Rule[] = [
  rulePartialScan,
  ruleTenantMetadata,
  ruleSessionLifetime,
  ruleProtectiveFlags,
  ruleClientGrantTypes,
  ruleCallbackHygiene,
  ruleRefreshTokenPosture,
  ruleConfidentialClientAuth,
  ruleDbPasswordPolicy,
  ruleBruteForceOnConnection,
  ruleCustomDbScripts,
  ruleApiSigningAlg,
  ruleApiRbacEnforcement,
  ruleApiTokenLifetime,
  ruleClientGrantsBroad,
  ruleManagementApiGrant,
  ruleNoRoles,
  ruleLegacyRulesHooks,
  ruleActionsRuntime,
  ruleMfaPolicy,
  ruleAttackProtectionShields,
  ruleNoLogStream,
  ruleUniversalLoginExperience,
  ruleNoCustomDomain,
  ruleB2BOrganizations
];

export function runAllRules(snapshot: Auth0TenantSnapshot): Finding[] {
  const ctx: RuleContext = { snapshot };
  const raw = ALL_RULES.flatMap((r) => {
    try {
      return r(ctx);
    } catch {
      return [];
    }
  });
  return raw.map(enrichFinding);
}

import {
  CATEGORY_NAMES,
  CategoryId,
  Severity
} from "../../reporting/markdown/report.types";
import {
  OKTA_CATEGORY_NAMES,
  OktaCategoryId
} from "../../reporting/markdown/okta-report.types";
import { ReportProviderId } from "../../reporting/json/report-contract.types";

export interface RuleCatalogEntry {
  id: string;
  provider: ReportProviderId;
  category: string;
  categoryName: string;
  title: string;
  severityLogic: string;
  evidenceUsed: string;
  confidenceLogic: string;
  remediationGuidance: string;
  falsePositiveNotes: string[];
}

export interface RuleCatalogListOptions {
  provider?: ReportProviderId;
}

interface Auth0Seed {
  id: string;
  category: CategoryId;
  title: string;
  severityLogic: string;
  evidenceUsed: string;
  remediationGuidance: string;
  falsePositiveNotes?: string[];
}

interface OktaSeed {
  id: string;
  category: OktaCategoryId;
  title: string;
  severityLogic: string;
  evidenceUsed: string;
  remediationGuidance: string;
  falsePositiveNotes?: string[];
}

const AUTH0_DEFAULT_CONFIDENCE =
  "Confidence is high when the required collector returned the inspected field directly. Confidence may be reduced by analyzer logic when collection is partial, the signal is context-dependent, or the tenant environment is non-production.";

const OKTA_DEFAULT_CONFIDENCE =
  "Confidence is high for directly collected configuration evidence and medium when assignment, lifecycle, admin, or business-context interpretation requires validation. Partial collection reduces confidence through coverage reporting.";

const AUTH0_RULES: Auth0Seed[] = [
  {
    id: "AUTH-COV-001",
    category: "tenantBaseline",
    title: "Scan was partial — coverage is incomplete",
    severityLogic: "Informational transparency finding with zero or minimal score impact.",
    evidenceUsed: "Collector status, failed/skipped collectors, and missing Auth0 Management API scopes.",
    remediationGuidance: "Grant missing read-only scopes or investigate failed collectors, then rerun the scan."
  },
  {
    id: "AUTH-TEN-001",
    category: "tenantBaseline",
    title: "Tenant metadata is incomplete",
    severityLogic: "Low severity when production-readiness tenant profile fields are missing.",
    evidenceUsed: "Tenant friendly name, support email, support URL, and logo fields.",
    remediationGuidance: "Populate tenant metadata and verify it is visible in login/support flows."
  },
  {
    id: "AUTH-TEN-003-A",
    category: "tenantBaseline",
    title: "Tenant absolute session lifetime is excessive",
    severityLogic: "Medium when absolute session lifetime exceeds the deterministic threshold.",
    evidenceUsed: "Tenant `session_lifetime` value.",
    remediationGuidance: "Reduce absolute session lifetime or document a justified exception.",
    falsePositiveNotes: ["Longer sessions may be intentional for some B2B/admin workflows when explicitly risk-accepted."]
  },
  {
    id: "AUTH-TEN-003-B",
    category: "tenantBaseline",
    title: "Tenant idle session lifetime is excessive",
    severityLogic: "Low when idle session lifetime exceeds the deterministic threshold.",
    evidenceUsed: "Tenant `idle_session_lifetime` value.",
    remediationGuidance: "Reduce idle session lifetime for standard CIAM applications."
  },
  {
    id: "AUTH-TEN-004-A",
    category: "tenantBaseline",
    title: "Clickjack protection headers are disabled",
    severityLogic: "Medium when clickjack protection is explicitly disabled.",
    evidenceUsed: "Tenant advanced flag `disable_clickjack_protection_headers`.",
    remediationGuidance: "Re-enable clickjack protection headers unless a documented embedding exception exists."
  },
  {
    id: "AUTH-TEN-004-B",
    category: "tenantBaseline",
    title: "Management API SMS obfuscation is disabled",
    severityLogic: "Low when Management API SMS obfuscation is explicitly disabled.",
    evidenceUsed: "Tenant advanced flag `disable_management_api_sms_obfuscation`.",
    remediationGuidance: "Re-enable SMS obfuscation unless an operational exception is documented."
  },
  {
    id: "AUTH-CLI-001",
    category: "applications",
    title: "Risky or context-dependent OAuth grants are enabled",
    severityLogic: "High for confirmed risky grants; medium when grants require validation rather than confirmed removal.",
    evidenceUsed: "Client grant types, client app type, and refresh-token metadata.",
    remediationGuidance: "Remove implicit/password grants, prefer authorization code with PKCE, and use dedicated M2M clients.",
    falsePositiveNotes: ["Client credentials can be valid for true machine-to-machine applications."]
  },
  {
    id: "AUTH-CLI-002",
    category: "applications",
    title: "Callback / origin sprawl or non-HTTPS endpoints observed",
    severityLogic: "High when non-localhost HTTP redirect/origin URLs or excessive callback sprawl are observed.",
    evidenceUsed: "Client callback URLs, web origins, allowed origins, and app type.",
    remediationGuidance: "Trim redirect/origin allowlists and require HTTPS outside localhost.",
    falsePositiveNotes: ["Localhost development origins are expected and excluded by the rule."]
  },
  {
    id: "AUTH-CLI-004",
    category: "applications",
    title: "SPA/native client uses non-rotating or non-expiring refresh tokens",
    severityLogic: "Critical when browser/native clients use refresh tokens without rotation or expiration.",
    evidenceUsed: "Client app type, enabled grants, and refresh token rotation/expiration settings.",
    remediationGuidance: "Enable rotating, expiring refresh tokens and retest silent-auth/refresh flows."
  },
  {
    id: "AUTH-CLI-005",
    category: "applications",
    title: "Confidential client authentication is weak or missing",
    severityLogic: "High when confidential integrations use public/no authentication or weak token endpoint authentication.",
    evidenceUsed: "Client authentication method and credential posture.",
    remediationGuidance: "Use a confidential token endpoint auth method; prefer private_key_jwt or mTLS for high assurance."
  },
  {
    id: "AUTH-CON-001",
    category: "connections",
    title: "Database connection password policy is weak or incomplete",
    severityLogic: "Severity depends on observed password policy weakness and plan-gated control availability.",
    evidenceUsed: "Database connection password policy, history, dictionary, personal-info, and complexity options.",
    remediationGuidance: "Enable stronger password controls where available and document compensating controls when plan-gated.",
    falsePositiveNotes: ["Some advanced password-policy options can be Auth0 plan-gated or early-access."]
  },
  {
    id: "AUTH-CON-002",
    category: "connections",
    title: "Database connection brute-force protection is disabled",
    severityLogic: "High when connection-level brute-force protection is disabled.",
    evidenceUsed: "Database connection brute-force protection setting.",
    remediationGuidance: "Re-enable brute-force protection and retest login/signup flows."
  },
  {
    id: "AUTH-CON-003",
    category: "connections",
    title: "Custom database scripts require ownership review",
    severityLogic: "Advisory/info by default because custom database scripts are architecture-dependent.",
    evidenceUsed: "Custom database connection flags and enabled custom scripts.",
    remediationGuidance: "Verify script ownership, secret handling, runbooks, and migration timeline.",
    falsePositiveNotes: ["Custom DB scripts are expected for some migration and custom database architectures."]
  },
  {
    id: "AUTH-API-001",
    category: "apis",
    title: "API uses weak or shared-secret signing algorithm",
    severityLogic: "High when externally consumed APIs use HS256 or weaker signing posture.",
    evidenceUsed: "Resource server signing algorithm.",
    remediationGuidance: "Move APIs to RS256/PS256 and validate JWKS-based verification.",
    falsePositiveNotes: ["Internal-only HS256 APIs may be accepted with documented controls."]
  },
  {
    id: "AUTH-API-002",
    category: "apis",
    title: "API RBAC enforcement is disabled or permissions are absent",
    severityLogic: "Medium/high depending on API context and whether policy enforcement is disabled.",
    evidenceUsed: "Resource server RBAC enforcement and token dialect settings.",
    remediationGuidance: "Enable RBAC and include permissions in tokens where required.",
    falsePositiveNotes: ["Some APIs intentionally use scopes without Auth0 RBAC; confirm design intent."]
  },
  {
    id: "AUTH-API-003",
    category: "apis",
    title: "API token lifetime or offline access posture needs review",
    severityLogic: "Medium when access tokens are long-lived or offline access is broadly enabled.",
    evidenceUsed: "Resource server token lifetime, web token lifetime, and offline access settings.",
    remediationGuidance: "Reduce token lifetime and restrict offline access to clients that need it."
  },
  {
    id: "AUTH-API-005",
    category: "apis",
    title: "Machine-to-machine client grants may be overly broad",
    severityLogic: "Medium/high based on sensitive scope breadth and grant context.",
    evidenceUsed: "Client grant audience, scopes, and organization grant flags.",
    remediationGuidance: "Reduce grants to least privilege and remove unused write/admin scopes.",
    falsePositiveNotes: ["Broad scopes can be valid for automation when documented and time-bound."]
  },
  {
    id: "AUTH-API-007",
    category: "apis",
    title: "Auth0 Management API client grant is sensitive or excessive",
    severityLogic: "Severity increases with create/update/delete/admin/key/secret scopes; read-only scanner scopes are acceptable.",
    evidenceUsed: "Client grants targeting the Auth0 Management API and classified scope sensitivity.",
    remediationGuidance: "Use dedicated least-privilege M2M clients and remove unnecessary sensitive scopes.",
    falsePositiveNotes: ["IaC and automation may need some Management API scopes; document and time-bound exceptions."]
  },
  {
    id: "AUTH-RBAC-001",
    category: "rbac",
    title: "Authorization model requires validation",
    severityLogic: "Informational by default; can elevate when APIs/scopes imply Auth0 should govern authorization.",
    evidenceUsed: "Configured roles, API RBAC settings, scopes, and permissions.",
    remediationGuidance: "Document where authorization is managed and enable Auth0 RBAC where it is the intended authority.",
    falsePositiveNotes: ["Many CIAM tenants manage authorization in the application or a downstream service."]
  },
  {
    id: "AUTH-EXT-001",
    category: "actionsAndExtensibility",
    title: "Legacy Rules or Hooks are present",
    severityLogic: "High/critical depending on legacy extensibility presence and environment calibration.",
    evidenceUsed: "Collected Auth0 Rules and Hooks inventory.",
    remediationGuidance: "Migrate legacy Rules/Hooks to Actions and validate equivalent trigger behavior."
  },
  {
    id: "AUTH-EXT-002",
    category: "actionsAndExtensibility",
    title: "Action runtime is old or dependency posture requires review",
    severityLogic: "Medium/low depending on runtime age and dependency signal.",
    evidenceUsed: "Action runtime and dependency metadata.",
    remediationGuidance: "Move Actions to a current supported runtime and redeploy."
  },
  {
    id: "AUTH-SEC-001",
    category: "attackProtection",
    title: "MFA or step-up posture requires validation",
    severityLogic: "High when no effective MFA/step-up signal exists for sensitive flows; context-aware for CIAM UX.",
    evidenceUsed: "Guardian policy, factors, WebAuthn availability, and Actions step-up indicators.",
    remediationGuidance: "Define MFA/step-up strategy for sensitive flows and enable phishing-resistant options where appropriate.",
    falsePositiveNotes: ["Blanket MFA may not be appropriate for every customer login; validate step-up/risk-based controls."]
  },
  {
    id: "AUTH-SEC-004",
    category: "attackProtection",
    title: "Brute-force protection is disabled",
    severityLogic: "Critical/high when tenant brute-force protection is disabled.",
    evidenceUsed: "Attack protection brute-force setting and shields.",
    remediationGuidance: "Re-enable brute-force protection and confirm shields are configured."
  },
  {
    id: "AUTH-SEC-005",
    category: "attackProtection",
    title: "Breached password detection is disabled",
    severityLogic: "Critical/high when breached password detection is disabled.",
    evidenceUsed: "Attack protection breached-password setting and shields.",
    remediationGuidance: "Enable breached password detection and configure block/admin notification shields."
  },
  {
    id: "AUTH-SEC-006",
    category: "attackProtection",
    title: "Suspicious IP throttling is disabled or weak",
    severityLogic: "Critical/high when suspicious IP throttling is disabled or allowlisted too broadly.",
    evidenceUsed: "Suspicious IP throttling setting, shields, and allowlist posture.",
    remediationGuidance: "Re-enable throttling and limit allowlists to known operational sources.",
    falsePositiveNotes: ["Auth0 recommends not disabling Suspicious IP Throttling."]
  },
  {
    id: "AUTH-OBS-001",
    category: "monitoring",
    title: "No active Auth0 log stream is configured",
    severityLogic: "High when no active external log stream exists for assessed scope.",
    evidenceUsed: "Log stream inventory and status.",
    remediationGuidance: "Configure an active log stream to a SIEM or analytics destination."
  },
  {
    id: "AUTH-UX-001",
    category: "brandingAndLoginExperience",
    title: "Universal Login experience is legacy or misaligned",
    severityLogic: "Low/medium when login experience settings indicate legacy posture.",
    evidenceUsed: "Prompt and Universal Login configuration.",
    remediationGuidance: "Move to the new Universal Login experience and retest flows."
  },
  {
    id: "AUTH-UX-003",
    category: "brandingAndLoginExperience",
    title: "Custom domain is missing or TLS posture needs review",
    severityLogic: "Low when production tenant login does not use a strong custom-domain posture.",
    evidenceUsed: "Custom domain inventory and TLS policy.",
    remediationGuidance: "Provision a custom domain with recommended TLS and update applications."
  },
  {
    id: "AUTH-ORG-001",
    category: "organizations",
    title: "Clients reference Organizations but no organizations are configured",
    severityLogic: "Medium when clients reference Organizations while no organization objects exist.",
    evidenceUsed: "Client organization usage flags and organization inventory.",
    remediationGuidance: "Create expected Organizations or remove organization usage from clients that do not need it."
  }
];

const OKTA_RULES: OktaSeed[] = [
  {
    id: "OKTA-ORG-001",
    category: "orgBaseline",
    title: "Okta org metadata is incomplete",
    severityLogic: "Low when org profile metadata is missing.",
    evidenceUsed: "Org company name and website fields.",
    remediationGuidance: "Populate org profile metadata to improve operational clarity."
  },
  {
    id: "OKTA-APP-001",
    category: "applicationsAndSSO",
    title: "One or more Okta apps allow risky OAuth grant types",
    severityLogic: "High when implicit or password grants are enabled on collected apps.",
    evidenceUsed: "App OAuth grant type configuration.",
    remediationGuidance: "Remove risky grants and prefer authorization code with PKCE for interactive apps."
  },
  {
    id: "OKTA-APP-003",
    category: "applicationsAndSSO",
    title: "Direct user app assignments were detected",
    severityLogic: "Low/medium depending on app criticality and sampled direct-assignment volume.",
    evidenceUsed: "Sampled app user and group assignments.",
    remediationGuidance: "Move durable workforce access to group-based assignments where possible.",
    falsePositiveNotes: ["Direct assignments can be acceptable for break-glass, test, admin, or very small populations."]
  },
  {
    id: "OKTA-APP-004",
    category: "applicationsAndSSO",
    title: "One or more apps appear broadly assigned",
    severityLogic: "Medium for broad assignment on sensitive apps; low for likely baseline apps.",
    evidenceUsed: "Sampled app assignment counts and broad group names.",
    remediationGuidance: "Review broadly assigned apps and narrow sensitive access where not intentional.",
    falsePositiveNotes: ["Baseline workforce apps may be intentionally broad."]
  },
  {
    id: "OKTA-APP-005",
    category: "applicationsAndSSO",
    title: "Inactive or apparently unassigned apps were detected",
    severityLogic: "Low advisory finding for inactive or apparently orphaned app integrations.",
    evidenceUsed: "App status and sampled assignment model.",
    remediationGuidance: "Retire, disable, or document stale app integrations.",
    falsePositiveNotes: ["Reserved infrastructure or staged rollout apps may appear inactive by design."]
  },
  {
    id: "OKTA-APP-006",
    category: "applicationsAndSSO",
    title: "Apps were collected but no app sign-on policies were identified",
    severityLogic: "Medium when active apps exist but no app sign-on policies are collected.",
    evidenceUsed: "Active app count and app sign-on policy inventory.",
    remediationGuidance: "Validate app sign-on policy coverage and collector permissions."
  },
  {
    id: "OKTA-POL-001",
    category: "policiesAndAuthentication",
    title: "Policy coverage appears incomplete",
    severityLogic: "Medium when expected policy families are absent or incomplete.",
    evidenceUsed: "Collected global session, password, enrollment, and app sign-on policies.",
    remediationGuidance: "Review policy coverage and missing policy types before trusting policy posture."
  },
  {
    id: "OKTA-POL-002",
    category: "policiesAndAuthentication",
    title: "Strong authenticators are not clearly available",
    severityLogic: "High when strong or phishing-resistant authenticators are absent.",
    evidenceUsed: "Authenticator inventory and key/status values.",
    remediationGuidance: "Enable strong authenticators such as Okta Verify, WebAuthn, or signed nonce."
  },
  {
    id: "OKTA-POL-003",
    category: "policiesAndAuthentication",
    title: "Weak sign-on policy posture requires review",
    severityLogic: "Medium/high depending on policy rules that allow weak or no MFA conditions.",
    evidenceUsed: "Sign-on policy rule actions and conditions.",
    remediationGuidance: "Require stronger assurance for relevant workforce populations."
  },
  {
    id: "OKTA-POL-004",
    category: "policiesAndAuthentication",
    title: "Password policy strength or recovery posture needs review",
    severityLogic: "Medium when password complexity, history, or recovery controls are weak.",
    evidenceUsed: "Password policy settings and recovery methods.",
    remediationGuidance: "Improve password complexity/history and reduce weak recovery paths."
  },
  {
    id: "OKTA-POL-005",
    category: "policiesAndAuthentication",
    title: "Authenticator enrollment policy does not require strong factors",
    severityLogic: "Medium/high when strong authenticators are optional or absent.",
    evidenceUsed: "Authenticator enrollment policy rules and factor requirements.",
    remediationGuidance: "Require strong authenticators for intended workforce populations."
  },
  {
    id: "OKTA-API-001",
    category: "apiAccessManagement",
    title: "Authorization server policy coverage requires review",
    severityLogic: "Medium when authorization servers exist without adequate active policy coverage.",
    evidenceUsed: "Authorization server and policy inventory.",
    remediationGuidance: "Review authorization-server access policies and ensure expected rule coverage."
  },
  {
    id: "OKTA-API-002",
    category: "apiAccessManagement",
    title: "Authorization server policy allows wildcard scopes",
    severityLogic: "High when a policy rule allows wildcard scope access.",
    evidenceUsed: "Authorization server policy rule scope conditions.",
    remediationGuidance: "Replace wildcard scopes with explicit scopes for the relevant clients."
  },
  {
    id: "OKTA-API-003",
    category: "apiAccessManagement",
    title: "Authorization server policy allows risky grant types",
    severityLogic: "Medium/high depending on risky grant type and client context.",
    evidenceUsed: "Authorization server access policy grant type conditions.",
    remediationGuidance: "Remove unsupported or legacy grants unless explicitly justified.",
    falsePositiveNotes: ["Token exchange and JWT bearer grants can be valid in brokered service architectures."]
  },
  {
    id: "OKTA-API-004",
    category: "apiAccessManagement",
    title: "Authorization server token lifetimes require review",
    severityLogic: "Medium when access or refresh lifetimes exceed deterministic thresholds.",
    evidenceUsed: "Authorization server policy rule token lifetime settings.",
    remediationGuidance: "Shorten token lifetimes where long-lived tokens are not justified.",
    falsePositiveNotes: ["Longer refresh lifetimes may be intentional but should be bounded and documented."]
  },
  {
    id: "OKTA-API-005",
    category: "apiAccessManagement",
    title: "Published custom scopes or claims require review",
    severityLogic: "Advisory unless scope/claim publication creates confirmed overexposure.",
    evidenceUsed: "Custom authorization-server scopes and claims publication metadata.",
    remediationGuidance: "Review custom scopes and claims for least privilege and publication need.",
    falsePositiveNotes: ["Custom scope/claim exposure does not prove over-permission without client and API context."]
  },
  {
    id: "OKTA-ADM-001",
    category: "adminAndPrivilegedAccess",
    title: "No active log stream exists for privileged activity visibility",
    severityLogic: "High when externalized monitoring for privileged activity is missing.",
    evidenceUsed: "Log stream inventory and status.",
    remediationGuidance: "Configure active Okta log streaming to a monitored destination."
  },
  {
    id: "OKTA-ADM-002",
    category: "adminAndPrivilegedAccess",
    title: "High-privilege admin role count requires review",
    severityLogic: "Medium/high based on standard high-privilege role count.",
    evidenceUsed: "Collected admin role assignments.",
    remediationGuidance: "Review high-privilege role population and reduce standing access."
  },
  {
    id: "OKTA-ADM-003",
    category: "adminAndPrivilegedAccess",
    title: "Admin role inventory may be incomplete",
    severityLogic: "Requires validation when admin activity exists but collected assignments appear missing or incomplete.",
    evidenceUsed: "Admin role assignments and recent admin System Log events.",
    remediationGuidance: "Cross-check admin actors against the Okta administrator console.",
    falsePositiveNotes: ["Custom role deployments and tenant-specific IAM endpoint shapes can make role inventory incomplete."]
  },
  {
    id: "OKTA-ADM-004",
    category: "adminAndPrivilegedAccess",
    title: "Admin MFA posture requires validation",
    severityLogic: "Medium/high when admin actors do not show recent MFA evidence.",
    evidenceUsed: "Admin role data and bounded System Log MFA events.",
    remediationGuidance: "Validate MFA enforcement for administrator populations."
  },
  {
    id: "OKTA-ADM-005",
    category: "adminAndPrivilegedAccess",
    title: "Admin-like users appear stale",
    severityLogic: "Medium when privileged or admin-like users appear inactive or never-login.",
    evidenceUsed: "Bounded user summaries, admin role assignments, and activity timestamps.",
    remediationGuidance: "Review stale privileged identities and deactivate or document exceptions."
  },
  {
    id: "OKTA-USR-001",
    category: "usersAndLifecycle",
    title: "User lifecycle state distribution requires review",
    severityLogic: "Low/medium when suspended, staged, or abnormal lifecycle populations exceed thresholds.",
    evidenceUsed: "Bounded user status counts.",
    remediationGuidance: "Review lifecycle state distribution and upstream JML process health."
  },
  {
    id: "OKTA-USR-002",
    category: "usersAndLifecycle",
    title: "Inactive or never-login active users require review",
    severityLogic: "Low/medium depending on stale active user population and environment.",
    evidenceUsed: "Bounded user summaries and recent login/activity timestamps.",
    remediationGuidance: "Deactivate, explain, or clean up dormant active users.",
    falsePositiveNotes: ["Demo, migration, or staged rollout orgs may intentionally contain never-login users."]
  },
  {
    id: "OKTA-USR-003",
    category: "usersAndLifecycle",
    title: "Ungrouped users were detected",
    severityLogic: "Low/medium when active users appear outside group-based governance.",
    evidenceUsed: "Bounded user group membership summary.",
    remediationGuidance: "Move durable access governance to group-based lifecycle processes."
  },
  {
    id: "OKTA-NET-001",
    category: "networkAndDevicePosture",
    title: "Trusted Origin transport posture requires review",
    severityLogic: "Medium when Trusted Origins use insecure transport or broad origin posture.",
    evidenceUsed: "Trusted Origin inventory and origin URLs.",
    remediationGuidance: "Use HTTPS and narrow browser-origin allowlists."
  },
  {
    id: "OKTA-NET-002",
    category: "networkAndDevicePosture",
    title: "Unused network zones were detected",
    severityLogic: "Advisory when network zones are configured but not referenced by collected policies.",
    evidenceUsed: "Network zone inventory and policy references.",
    remediationGuidance: "Remove unused zones or tie them to documented enforcement paths.",
    falsePositiveNotes: ["Zone usage inference may not capture every legitimate control pattern."]
  },
  {
    id: "OKTA-NET-003",
    category: "networkAndDevicePosture",
    title: "Trusted Origins posture requires review",
    severityLogic: "Advisory when browser-facing app posture and Trusted Origins are misaligned or absent.",
    evidenceUsed: "Trusted Origin inventory and browser-facing application signals.",
    remediationGuidance: "Configure only required CORS or redirect origins.",
    falsePositiveNotes: ["Absence of Trusted Origins can be acceptable when app architecture does not require them."]
  },
  {
    id: "OKTA-HOOK-001",
    category: "federationAndExtensibility",
    title: "Hook transport or endpoint posture requires review",
    severityLogic: "Medium when hooks use insecure or questionable endpoint transport.",
    evidenceUsed: "Event hook and inline hook endpoint configuration.",
    remediationGuidance: "Use HTTPS endpoints and review hook ownership and destination security."
  },
  {
    id: "OKTA-MON-001",
    category: "monitoringAndLogs",
    title: "No active Okta log stream is configured",
    severityLogic: "High when log stream collector confirms no active external destination.",
    evidenceUsed: "Log stream inventory and status.",
    remediationGuidance: "Configure an active Okta log stream to a SIEM or analytics destination."
  },
  {
    id: "OKTA-COV-001",
    category: "monitoringAndLogs",
    title: "Scan was partial and some Okta areas were not fully assessed",
    severityLogic: "Informational transparency finding with zero score impact.",
    evidenceUsed: "Collector status, partial collectors, unavailable collectors, and missing scopes.",
    remediationGuidance: "Grant missing read scopes or investigate degraded collectors, then rerun the scan."
  }
];

export const RULE_CATALOG: RuleCatalogEntry[] = [
  ...AUTH0_RULES.map(toAuth0Entry),
  ...OKTA_RULES.map(toOktaEntry)
].sort(compareRuleEntries);

export function listRuleCatalog(
  options: RuleCatalogListOptions = {}
): RuleCatalogEntry[] {
  return RULE_CATALOG.filter((entry) =>
    options.provider ? entry.provider === options.provider : true
  );
}

export function getRuleCatalogEntry(id: string): RuleCatalogEntry | undefined {
  const normalized = id.trim().toUpperCase();
  return RULE_CATALOG.find((entry) => entry.id === normalized);
}

export function renderRuleCatalogList(
  options: RuleCatalogListOptions = {}
): string {
  const entries = listRuleCatalog(options);
  const rows = entries.map((entry) =>
    [
      entry.id.padEnd(15),
      entry.provider.padEnd(5),
      entry.category.padEnd(28),
      entry.title
    ].join("  ")
  );

  return [
    "Rule ID          Prov   Category                      Title",
    "---------------  -----  ----------------------------  -----",
    ...rows
  ].join("\n");
}

export function renderRuleExplanation(entry: RuleCatalogEntry): string {
  return [
    `# ${entry.id} - ${entry.title}`,
    "",
    `Provider: ${entry.provider}`,
    `Category: ${entry.categoryName} (${entry.category})`,
    "",
    "Severity Logic:",
    entry.severityLogic,
    "",
    "Evidence Used:",
    entry.evidenceUsed,
    "",
    "Confidence Logic:",
    entry.confidenceLogic,
    "",
    "Remediation Guidance:",
    entry.remediationGuidance,
    "",
    "False-Positive Notes:",
    entry.falsePositiveNotes.length > 0
      ? entry.falsePositiveNotes.map((note) => `- ${note}`).join("\n")
      : "_No specific false-positive notes recorded for this rule._"
  ].join("\n");
}

function toAuth0Entry(seed: Auth0Seed): RuleCatalogEntry {
  return {
    provider: "auth0",
    categoryName: CATEGORY_NAMES[seed.category],
    confidenceLogic: AUTH0_DEFAULT_CONFIDENCE,
    falsePositiveNotes: seed.falsePositiveNotes ?? [],
    ...seed
  };
}

function toOktaEntry(seed: OktaSeed): RuleCatalogEntry {
  return {
    provider: "okta",
    categoryName: OKTA_CATEGORY_NAMES[seed.category],
    confidenceLogic: OKTA_DEFAULT_CONFIDENCE,
    falsePositiveNotes: seed.falsePositiveNotes ?? [],
    ...seed
  };
}

function compareRuleEntries(left: RuleCatalogEntry, right: RuleCatalogEntry): number {
  return (
    left.provider.localeCompare(right.provider) ||
    left.id.localeCompare(right.id)
  );
}

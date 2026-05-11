/**
 * Per-finding-ID engineering metadata: Auth0 dashboard area, Terraform
 * resource/fields, validation steps, and false-positive notes.
 *
 * Rules emit findings with `id`. After rules run, we merge metadata from this
 * table onto each finding so rule code stays compact.
 */

import { Finding } from "../../reporting/markdown/report.types";

type Metadata = Pick<
  Finding,
  | "auth0Area"
  | "terraformResource"
  | "terraformFields"
  | "implementationSteps"
  | "validationSteps"
  | "falsePositiveNotes"
>;

export const FINDING_METADATA: Record<string, Metadata> = {
  // -------------------- Tenant --------------------
  "AUTH-TEN-001": {
    auth0Area: "Settings → General",
    terraformResource: "auth0_tenant",
    terraformFields: ["friendly_name", "support_email", "support_url", "picture_url"],
    validationSteps: [
      "Confirm friendly name, support email, support URL, and logo are set",
      "Verify changes are visible on the Universal Login page"
    ]
  },
  "AUTH-TEN-003-A": {
    auth0Area: "Settings → Advanced → Login Session Management",
    terraformResource: "auth0_tenant",
    terraformFields: ["session_lifetime", "idle_session_lifetime"],
    validationSteps: [
      "Reduce absolute session lifetime to align with risk profile",
      "Verify users are re-prompted to authenticate after the new lifetime"
    ],
    falsePositiveNotes: [
      "Some B2B/admin-portal use cases intentionally use longer sessions; document and justify."
    ]
  },
  "AUTH-TEN-003-B": {
    auth0Area: "Settings → Advanced → Login Session Management",
    terraformResource: "auth0_tenant",
    terraformFields: ["idle_session_lifetime"],
    validationSteps: ["Reduce idle session lifetime to <= 72h for standard CIAM apps"]
  },
  "AUTH-TEN-004-A": {
    auth0Area: "Settings → Advanced",
    terraformResource: "auth0_tenant",
    terraformFields: ["flags.disable_clickjack_protection_headers"],
    validationSteps: ["Re-enable clickjack protection headers", "Confirm login UI is no longer iframe-embeddable"]
  },
  "AUTH-TEN-004-B": {
    auth0Area: "Settings → Advanced",
    terraformResource: "auth0_tenant",
    terraformFields: ["flags.disable_management_api_sms_obfuscation"]
  },

  // -------------------- Applications --------------------
  "AUTH-CLI-001": {
    auth0Area: "Applications → Applications → [Application] → Advanced Settings → Grant Types",
    terraformResource: "auth0_client",
    terraformFields: ["grant_types"],
    validationSteps: [
      "Confirm `implicit` and `password` grants are removed where not required",
      "Confirm SPAs use `authorization_code` with PKCE"
    ],
    falsePositiveNotes: [
      "`client_credentials` is valid for machine-to-machine apps; evaluate by application type."
    ]
  },
  "AUTH-CLI-002": {
    auth0Area: "Applications → Applications → [Application] → Settings → Application URIs",
    terraformResource: "auth0_client",
    terraformFields: ["callbacks", "allowed_logout_urls", "web_origins", "allowed_origins"],
    validationSteps: [
      "Trim callbacks/web origins to the minimum required per environment",
      "Require HTTPS for all non-localhost callback and origin URLs"
    ],
    falsePositiveNotes: [
      "Local development origins (http://localhost) are expected; the rule excludes them."
    ]
  },
  "AUTH-CLI-004": {
    auth0Area: "Applications → Applications → [Application] → Settings → Refresh Token Rotation",
    terraformResource: "auth0_client",
    terraformFields: [
      "refresh_token.rotation_type",
      "refresh_token.expiration_type",
      "refresh_token.token_lifetime",
      "refresh_token.idle_token_lifetime"
    ],
    validationSteps: [
      "Set rotation_type = rotating and expiration_type = expiring",
      "Bound absolute token_lifetime appropriately for the app type",
      "Re-test silent auth and refresh flows after the change"
    ],
    falsePositiveNotes: [
      "Native apps using device-bound credentials may rely on different controls; review case-by-case."
    ]
  },
  "AUTH-CLI-005": {
    auth0Area: "Applications → Applications → [Application] → Credentials",
    terraformResource: "auth0_client_credentials",
    terraformFields: ["authentication_method", "private_key_jwt", "tls_client_auth"],
    validationSteps: [
      "Set token_endpoint_auth_method to a confidential method",
      "Prefer private_key_jwt or mTLS for high-assurance integrations"
    ]
  },

  // -------------------- Connections --------------------
  "AUTH-CON-001": {
    auth0Area: "Authentication → Database → [Connection] → Password Policy",
    terraformResource: "auth0_connection",
    terraformFields: [
      "options.password_policy",
      "options.password_complexity_options",
      "options.password_history",
      "options.password_dictionary",
      "options.password_no_personal_info"
    ],
    validationSteps: [
      "Verify that advanced password-policy controls (history, dictionary, personal-info) are available on your Auth0 plan",
      "Set password_policy to `good` or `excellent` when the feature is available",
      "If advanced policy is unavailable or Early Access, document compensating controls: attack protection, breached-password detection, rate limiting, bot protection, MFA/step-up on sensitive flows",
      "Verify new-user signup and password reset flows still succeed after any change"
    ],
    falsePositiveNotes: [
      "Advanced password-policy options may be Early Access or plan-gated on some Auth0 tiers; validate availability before flagging as a gap."
    ]
  },
  "AUTH-CON-002": {
    auth0Area: "Authentication → Database → [Connection] → Settings",
    terraformResource: "auth0_connection",
    terraformFields: ["options.brute_force_protection", "options.disable_signup", "options.requires_username"],
    validationSteps: [
      "Re-enable brute-force protection on the connection",
      "Re-test login and signup after the change"
    ]
  },
  "AUTH-CON-003": {
    auth0Area: "Authentication → Database → [Connection] → Custom Database",
    terraformResource: "auth0_connection",
    terraformFields: ["options.enabledDatabaseCustomization", "options.customScripts"],
    implementationSteps: [
      "Confirm which custom scripts are enabled (login, get_user, change_password, etc.)",
      "Verify a named owner and runbook exist for each script",
      "Confirm secrets are managed via Auth0 Action Secrets or an external vault (not hardcoded)",
      "If a user migration is in progress, define and communicate a migration completion timeline"
    ],
    validationSteps: [
      "Review script bodies for hardcoded secrets, credentials, or API keys",
      "Confirm ownership and governance are documented"
    ],
    falsePositiveNotes: [
      "Custom DB scripts are expected and legitimate for Auth0 Custom Database and user-migration architectures. This is an Architecture Note, not a risk finding."
    ]
  },

  // -------------------- APIs --------------------
  "AUTH-API-001": {
    auth0Area: "Applications → APIs → [API] → Settings → Signing Algorithm",
    terraformResource: "auth0_resource_server",
    terraformFields: ["signing_alg"],
    validationSteps: [
      "Switch externally consumed APIs to RS256 or PS256",
      "Rotate verifier configuration to fetch the JWKS endpoint",
      "Re-test token validation with the new algorithm"
    ],
    falsePositiveNotes: [
      "Internal-only APIs with rotating shared secrets may use HS256 with documented controls; confirm context."
    ]
  },
  "AUTH-API-002": {
    auth0Area: "Applications → APIs → [API] → RBAC Settings",
    terraformResource: "auth0_resource_server",
    terraformFields: ["enforce_policies", "token_dialect"],
    validationSteps: [
      "Enable RBAC (enforce_policies = true)",
      "Set token_dialect to include permissions in the access token where required",
      "Verify access tokens include the expected `permissions` claim"
    ],
    falsePositiveNotes: [
      "Do not apply this rule to the Auth0 Management API or other system APIs.",
      "Some APIs use scopes only (without RBAC) by design; confirm intent."
    ]
  },
  "AUTH-API-003": {
    auth0Area: "Applications → APIs → [API] → Settings → Token Settings",
    terraformResource: "auth0_resource_server",
    terraformFields: ["token_lifetime", "token_lifetime_for_web", "allow_offline_access"],
    validationSteps: [
      "Reduce access-token lifetime to <= 24h",
      "Enable offline_access only for clients that need it"
    ]
  },
  "AUTH-API-005": {
    auth0Area: "Applications → APIs → [API] → Machine to Machine Applications",
    terraformResource: "auth0_client_grant",
    terraformFields: ["scopes", "allow_any_organization"],
    validationSteps: [
      "Review assigned scopes for least privilege",
      "Remove unused create/update/delete/admin scopes",
      "Re-test the dependent integration after changes"
    ],
    falsePositiveNotes: [
      "Broad scopes may be temporarily required for automation; document and time-bound any exception.",
      "For Auth0 Management API grants, see also AUTH-API-007."
    ]
  },
  "AUTH-API-007": {
    auth0Area: "Applications → APIs → Auth0 Management API → Machine to Machine Applications",
    terraformResource: "auth0_client_grant",
    terraformFields: ["scopes"],
    implementationSteps: [
      "Note: the Auth0 Management API is a default platform API and cannot be removed. The risk is broad client grants, not the API's existence.",
      "For each affected M2M client: create a purpose-built least-privilege client with only the scopes it needs",
      "Remove `create:`, `update:`, `delete:`, and admin/key/secret scopes not in active use",
      "Avoid using the API Explorer Application for production automation; create a dedicated client instead"
    ],
    validationSteps: [
      "Confirm each remaining scope is actively used by the client",
      "Re-test automation flows after scopes are reduced",
      "Set up token rotation and lifetime limits on all Management API M2M clients"
    ],
    falsePositiveNotes: [
      "Some scopes are required for automation and IaC; document and time-bound them.",
      "If this grant is used by a posture-scanning tool, read-only scopes are sufficient.",
      "The Management API itself is expected to exist in every Auth0 tenant."
    ]
  },

  // -------------------- RBAC --------------------
  "AUTH-RBAC-001": {
    auth0Area: "User Management → Roles",
    terraformResource: "auth0_role",
    validationSteps: [
      "Confirm where authorization is managed: application-side, external service, or Auth0 RBAC",
      "If Auth0 manages authorization: define roles, enable RBAC on APIs, assign roles to users",
      "If authorization is managed outside Auth0: document the decision and ensure access reviews cover it"
    ],
    falsePositiveNotes: [
      "Zero roles is informational by default. Many CIAM tenants manage authorization in the application or a downstream service. Only escalate if Auth0 is expected to govern authorization."
    ]
  },

  // -------------------- Extensibility --------------------
  "AUTH-EXT-001": {
    auth0Area: "Auth Pipeline → Rules / Hooks (legacy) and Actions (new)",
    terraformResource: "auth0_action",
    terraformFields: ["supported_triggers", "code", "deploy"],
    validationSteps: [
      "Inventory existing Rules/Hooks and their dependencies",
      "Re-implement equivalent logic as Auth0 Actions on the matching trigger",
      "Disable the legacy Rules/Hooks once Actions are deployed and verified"
    ]
  },
  "AUTH-EXT-002": {
    auth0Area: "Actions → Library → [Action] → Settings → Runtime",
    terraformResource: "auth0_action",
    terraformFields: ["runtime", "dependencies"],
    validationSteps: [
      "Migrate Actions to node18 or node22",
      "Re-deploy and verify the action runs successfully on the new runtime"
    ]
  },

  // -------------------- MFA / Attack Protection --------------------
  "AUTH-SEC-001": {
    auth0Area: "Security → Multi-factor Auth / Actions (step-up)",
    terraformResource: "auth0_guardian",
    terraformFields: ["policy", "webauthn_platform.enabled", "webauthn_roaming.enabled", "otp"],
    implementationSteps: [
      "Decide the MFA strategy for your CIAM tenant: blanket enforcement, risk-based (`confidence-score`), or Actions-based step-up",
      "For admin/customer-admin access: enforce MFA or step-up unconditionally",
      "For credential changes (password reset, email change): require step-up MFA",
      "For high-value transactions and high-risk logins (new device, unusual geography): apply risk-based MFA",
      "If using Actions for step-up: implement in the Login or Post-Login trigger and test flows end-to-end"
    ],
    validationSteps: [
      "Confirm sensitive flows (admin, credential changes, high-risk logins) require a second factor",
      "Verify that custom step-up Actions are deployed and tested",
      "Confirm at least one phishing-resistant factor (WebAuthn) is available for high-assurance flows"
    ],
    falsePositiveNotes: [
      "For CIAM tenants, enforcing MFA on every customer login is a business and UX decision. Absence of blanket MFA policy is not automatically a risk — confirm step-up/risk-based controls are in place for sensitive flows."
    ]
  },
  "AUTH-SEC-004": {
    auth0Area: "Security → Attack Protection → Brute-Force Protection",
    terraformResource: "auth0_attack_protection",
    terraformFields: ["brute_force_protection.enabled", "brute_force_protection.shields"],
    validationSteps: [
      "Re-enable brute-force protection",
      "Confirm shields include `block` and `user_notification`"
    ]
  },
  "AUTH-SEC-005": {
    auth0Area: "Security → Attack Protection → Breached Password Detection",
    terraformResource: "auth0_attack_protection",
    terraformFields: ["breached_password_detection.enabled", "breached_password_detection.shields"],
    validationSteps: [
      "Enable breached password detection",
      "Configure `block` and/or `admin_notification` shields"
    ]
  },
  "AUTH-SEC-006": {
    auth0Area: "Security → Attack Protection → Suspicious IP Throttling",
    terraformResource: "auth0_attack_protection",
    terraformFields: ["suspicious_ip_throttling.enabled", "suspicious_ip_throttling.shields"],
    validationSteps: [
      "Re-enable suspicious IP throttling",
      "Tighten allowlist to known operational sources only"
    ],
    falsePositiveNotes: [
      "Auth0 strongly recommends not disabling Suspicious IP Throttling."
    ]
  },

  // -------------------- Monitoring --------------------
  "AUTH-OBS-001": {
    auth0Area: "Monitoring → Streams",
    terraformResource: "auth0_log_stream",
    terraformFields: ["status", "type", "sink"],
    validationSteps: [
      "Configure at least one active log stream to a SIEM or log analytics platform",
      "Verify the downstream destination receives recent auth events"
    ]
  },

  // -------------------- Branding / Login --------------------
  "AUTH-UX-001": {
    auth0Area: "Branding → Universal Login",
    terraformResource: "auth0_prompt",
    terraformFields: ["universal_login_experience", "identifier_first", "webauthn_platform_first_factor"],
    validationSteps: [
      "Switch Universal Login to the `new` experience",
      "Re-test all login flows after the change"
    ]
  },
  "AUTH-UX-003": {
    auth0Area: "Branding → Custom Domains",
    terraformResource: "auth0_custom_domain",
    terraformFields: ["domain", "type", "tls_policy"],
    validationSteps: [
      "Provision a custom domain with TLS policy `recommended`",
      "Update applications to use the new domain"
    ]
  },

  // -------------------- Organizations --------------------
  "AUTH-ORG-001": {
    auth0Area: "Organizations",
    terraformResource: "auth0_organization",
    terraformFields: ["name", "display_name", "branding"],
    validationSteps: [
      "Either remove organization_usage from clients that do not need it, or create the Organizations the product expects",
      "Verify the login flow routes users to the correct org"
    ]
  }
};

export function enrichFinding(f: Finding): Finding {
  const meta = FINDING_METADATA[f.id];
  if (!meta) return f;
  return {
    ...f,
    auth0Area: f.auth0Area ?? meta.auth0Area,
    terraformResource: f.terraformResource ?? meta.terraformResource,
    terraformFields: f.terraformFields ?? meta.terraformFields,
    implementationSteps: f.implementationSteps ?? meta.implementationSteps,
    validationSteps: f.validationSteps ?? meta.validationSteps,
    falsePositiveNotes: f.falsePositiveNotes ?? meta.falsePositiveNotes
  };
}

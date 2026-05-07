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
      "Set password_policy to `good` or `excellent`",
      "Enable history, dictionary, and personal-info checks where supported",
      "Verify new-user signup and password reset flows still succeed"
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
    validationSteps: [
      "Confirm which custom scripts are enabled (login, get_user, change_password, etc.)",
      "Review secret handling inside scripts",
      "Confirm ownership and migration plan toward a managed connection or Actions"
    ],
    falsePositiveNotes: [
      "Custom DB scripts may be legitimate during migration; flag for governance and a migration timeline."
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
    validationSteps: [
      "Identify the M2M client that holds Management API scopes",
      "Audit scopes against actual operational need (read-only where possible)",
      "Remove `create:`, `update:`, `delete:`, and admin/key/secret scopes that are not in active use"
    ],
    falsePositiveNotes: [
      "Some scopes are required for automation and IaC; document and time-bound them.",
      "If this grant is used by a posture-scanning tool, read-only scopes are sufficient."
    ]
  },

  // -------------------- RBAC --------------------
  "AUTH-RBAC-001": {
    auth0Area: "User Management → Roles",
    terraformResource: "auth0_role",
    validationSteps: [
      "Define roles to model authorization, even for a single application",
      "Assign roles instead of granting direct user permissions"
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
    auth0Area: "Security → Multi-factor Auth",
    terraformResource: "auth0_guardian",
    terraformFields: ["policy", "webauthn_platform.enabled", "webauthn_roaming.enabled", "otp"],
    validationSteps: [
      "Set Guardian policy to `all-applications` or `confidence-score`",
      "Test the login flow requires MFA for target applications",
      "Confirm at least one phishing-resistant factor (WebAuthn) is available"
    ],
    falsePositiveNotes: [
      "Sandbox tenants may temporarily run without MFA; production tenants should enforce MFA."
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

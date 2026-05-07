import { CollectorFailure, ResourceCoverage } from "../../core/schema";

/**
 * Stable Auth0 tenant snapshot consumed by the analyzer.
 *
 * The analyzer MUST NOT depend on raw API response shapes; only on this
 * normalized snapshot.
 */
export interface Auth0TenantSnapshot {
  metadata: {
    provider: "auth0";
    domain: string;
    collectedAt: string;
    connectorVersion: string;
    partial: boolean;
    missingScopes: string[];
    failedCollectors: CollectorFailure[];
  };

  tenant?: Auth0TenantSettings;
  clients?: Auth0Client[];
  connections?: Auth0Connection[];
  resourceServers?: Auth0ResourceServer[];
  clientGrants?: Auth0ClientGrant[];
  users?: Auth0UserSummary[];
  roles?: Auth0Role[];
  permissions?: Auth0RolePermission[];
  actions?: Auth0Action[];
  rules?: Auth0Rule[];
  hooks?: Auth0Hook[];
  organizations?: Auth0Organization[];
  logStreams?: Auth0LogStream[];
  attackProtection?: Auth0AttackProtection;
  branding?: Auth0Branding;
  prompts?: Auth0Prompt;
  customDomains?: Auth0CustomDomain[];
  guardian?: Auth0Guardian;
  logs?: Auth0LogEvent[];

  coverage: ResourceCoverage[];
}

// --- Resource shapes (loose; only fields we read are typed) ---

export interface Auth0TenantSettings {
  friendly_name?: string;
  support_email?: string;
  support_url?: string;
  picture_url?: string;
  default_redirection_uri?: string;
  allowed_logout_urls?: string[];
  session_lifetime?: number;
  idle_session_lifetime?: number;
  flags?: Record<string, boolean | undefined>;
  session_cookie?: { mode?: string };
  sessions?: { oidc_logout_prompt_enabled?: boolean };
  pushed_authorization_requests_supported?: boolean;
  mtls?: { disable?: boolean; enable_endpoint_aliases?: boolean };
  [key: string]: unknown;
}

export interface Auth0Client {
  client_id: string;
  name: string;
  app_type?: string;
  is_first_party?: boolean;
  oidc_conformant?: boolean;
  grant_types?: string[];
  callbacks?: string[];
  allowed_logout_urls?: string[];
  web_origins?: string[];
  allowed_origins?: string[];
  token_endpoint_auth_method?: string;
  refresh_token?: {
    rotation_type?: "rotating" | "non-rotating" | string;
    expiration_type?: "expiring" | "non-expiring" | string;
    leeway?: number;
    token_lifetime?: number;
    idle_token_lifetime?: number;
  };
  jwt_configuration?: {
    alg?: string;
    lifetime_in_seconds?: number;
  };
  organization_usage?: string;
  organization_require_behavior?: string;
  require_pushed_authorization_requests?: boolean;
  require_proof_of_possession?: boolean;
  cross_origin_auth?: boolean;
  custom_login_page_on?: boolean;
  [key: string]: unknown;
}

export interface Auth0Connection {
  id: string;
  name: string;
  strategy: string;
  is_domain_connection?: boolean;
  enabled_clients?: string[];
  options?: {
    password_policy?: string;
    password_complexity_options?: { min_length?: number };
    password_history?: { enable?: boolean; size?: number };
    password_dictionary?: { enable?: boolean };
    password_no_personal_info?: { enable?: boolean };
    brute_force_protection?: boolean;
    disable_signup?: boolean;
    requires_username?: boolean;
    enabledDatabaseCustomization?: boolean;
    customScripts?: Record<string, string>;
    debug?: boolean;
    scope?: string[] | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Auth0ResourceServer {
  id: string;
  name: string;
  identifier: string;
  signing_alg?: string;
  token_lifetime?: number;
  token_lifetime_for_web?: number;
  allow_offline_access?: boolean;
  enforce_policies?: boolean;
  token_dialect?: string;
  scopes?: Array<{ value: string; description?: string }>;
  [key: string]: unknown;
}

export interface Auth0ClientGrant {
  id: string;
  client_id: string;
  audience: string;
  scope?: string[];
  allow_any_organization?: boolean;
  organization_usage?: string;
  [key: string]: unknown;
}

export interface Auth0Role {
  id: string;
  name: string;
  description?: string;
}

export interface Auth0RolePermission {
  role_id: string;
  permission_name: string;
  resource_server_identifier: string;
}

export interface Auth0UserSummary {
  user_id: string;
  email?: string;
  blocked?: boolean;
  email_verified?: boolean;
  created_at?: string;
  last_login?: string;
  multifactor?: string[];
}

export interface Auth0Action {
  id: string;
  name: string;
  supported_triggers?: Array<{ id?: string; version?: string }>;
  runtime?: string;
  status?: string;
  deployed?: boolean;
  dependencies?: Array<{ name: string; version?: string }>;
  all_changes_deployed?: boolean;
  [key: string]: unknown;
}

export interface Auth0Rule {
  id: string;
  name: string;
  enabled?: boolean;
  stage?: string;
  order?: number;
  [key: string]: unknown;
}

export interface Auth0Hook {
  id: string;
  name: string;
  triggerId?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface Auth0Organization {
  id: string;
  name: string;
  display_name?: string;
  branding?: unknown;
  [key: string]: unknown;
}

export interface Auth0LogStream {
  id: string;
  name: string;
  type?: string;
  status?: string;
  filters?: unknown;
  [key: string]: unknown;
}

export interface Auth0AttackProtection {
  breached_password_detection?: {
    enabled?: boolean;
    shields?: string[];
    admin_notification_frequency?: string[];
    method?: string;
  };
  brute_force_protection?: {
    enabled?: boolean;
    shields?: string[];
    mode?: string;
    max_attempts?: number;
  };
  suspicious_ip_throttling?: {
    enabled?: boolean;
    shields?: string[];
    allowlist?: string[];
    stage?: unknown;
  };
  [key: string]: unknown;
}

export interface Auth0Branding {
  colors?: { primary?: string; page_background?: string };
  logo_url?: string;
  font?: { url?: string };
  [key: string]: unknown;
}

export interface Auth0Prompt {
  universal_login_experience?: "new" | "classic" | string;
  identifier_first?: boolean;
  webauthn_platform_first_factor?: boolean;
  [key: string]: unknown;
}

export interface Auth0CustomDomain {
  custom_domain_id?: string;
  domain: string;
  primary?: boolean;
  status?: string;
  type?: string;
  tls_policy?: string;
  [key: string]: unknown;
}

export interface Auth0Guardian {
  policy?: "all-applications" | "confidence-score" | "never" | string;
  factors?: Array<{ name: string; enabled?: boolean }>;
  [key: string]: unknown;
}

export interface Auth0LogEvent {
  _id?: string;
  date?: string;
  type?: string;
  description?: string;
  client_id?: string;
  ip?: string;
  user_id?: string;
  [key: string]: unknown;
}

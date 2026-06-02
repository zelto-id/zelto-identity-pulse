import { CollectorFailure, ResourceCoverage } from "../../core/schema";

export type OktaAuthMode = "oauth" | "ssws";
export type OktaUserCollectionMode = "none" | "bounded" | "full";

export interface OktaCollectionOptions {
  includeUsers: OktaUserCollectionMode;
  maxUsers?: number;
  includeSystemLog: boolean;
  systemLogDays?: number;
  maxLogs?: number;
}

export interface OktaOrgSnapshot {
  metadata: {
    provider: "okta";
    product: "workforce";
    orgUrl: string;
    collectedAt: string;
    connectorVersion: string;
    authMode: OktaAuthMode;
    partial: boolean;
    missingScopes: string[];
    failedCollectors: CollectorFailure[];
    collectionOptions: OktaCollectionOptions;
  };
  org?: OktaOrgSettings;
  features?: OktaFeature[];
  users?: OktaUserSummary[];
  groups?: OktaGroupSummary[];
  groupRules?: OktaGroupRule[];
  apps?: OktaAppSummary[];
  policies?: OktaPolicySnapshot;
  authenticators?: OktaAuthenticator[];
  authorizationServers?: OktaAuthorizationServer[];
  authorizationServerScopes?: OktaAuthorizationServerScope[];
  authorizationServerClaims?: OktaAuthorizationServerClaim[];
  authorizationServerPolicies?: OktaAuthorizationServerPolicy[];
  adminRoles?: OktaAdminRoleAssignment[];
  networkZones?: OktaNetworkZone[];
  trustedOrigins?: OktaTrustedOrigin[];
  idps?: OktaIdentityProvider[];
  eventHooks?: OktaEventHook[];
  inlineHooks?: OktaInlineHook[];
  logStreams?: OktaLogStream[];
  domains?: OktaDomainSummary[];
  systemLog?: OktaSystemLogSummary;
  coverage: ResourceCoverage[];
}

export interface OktaOrgSettings {
  id?: string;
  subdomain?: string;
  companyName?: string;
  website?: string;
  supportPhoneNumber?: string;
  status?: string;
  [key: string]: unknown;
}

export interface OktaFeature {
  id?: string;
  name?: string;
  stage?: string;
  status?: string;
  type?: string;
  [key: string]: unknown;
}

export interface OktaUserSummary {
  id: string;
  status?: string;
  created?: string;
  activated?: string;
  statusChanged?: string;
  lastLogin?: string;
  lastUpdated?: string;
  passwordChanged?: string;
  credentialProvider?: string;
  hasGroupMembership?: boolean;
  type?: { id?: string };
  profile: {
    login?: string;
    email?: string;
  };
}

export interface OktaGroupSummary {
  id: string;
  type?: string;
  created?: string;
  lastUpdated?: string;
  lastMembershipUpdated?: string;
  profile: {
    name?: string;
    description?: string;
  };
}

export interface OktaGroupRule {
  id: string;
  name?: string;
  status?: string;
  type?: string;
  created?: string;
  lastUpdated?: string;
  conditions?: unknown;
  actions?: unknown;
  [key: string]: unknown;
}

export interface OktaAppSummary {
  id: string;
  name?: string;
  label?: string;
  status?: string;
  signOnMode?: string;
  created?: string;
  lastUpdated?: string;
  settings?: {
    oauthClient?: {
      application_type?: string;
      grant_types?: string[];
      response_types?: string[];
      redirect_uris?: string[];
      post_logout_redirect_uris?: string[];
      consent_method?: string;
      issuer_mode?: string;
      refresh_token?: {
        rotation_type?: string;
        expiration_type?: string;
        leeway?: number;
      };
    };
    app?: Record<string, unknown>;
  };
  visibility?: Record<string, unknown>;
  features?: string[];
  assignmentModel?: "direct" | "group" | "mixed" | "none" | "unknown";
  sampledDirectUserAssignments?: number;
  sampledGroupAssignments?: number;
  sampledAssignedGroupNames?: string[];
  assignmentDataIncomplete?: boolean;
  [key: string]: unknown;
}

export interface OktaPolicyRule {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  priority?: number;
  conditions?: unknown;
  actions?: unknown;
  [key: string]: unknown;
}

export interface OktaPolicy {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  system?: boolean;
  priority?: number;
  created?: string;
  lastUpdated?: string;
  conditions?: unknown;
  settings?: unknown;
  rules?: OktaPolicyRule[];
  [key: string]: unknown;
}

export interface OktaPolicySnapshot {
  all: OktaPolicy[];
  globalSessionPolicies: OktaPolicy[];
  passwordPolicies: OktaPolicy[];
  authenticatorEnrollmentPolicies: OktaPolicy[];
  appSignInPolicies: OktaPolicy[];
  unknownTypePolicies: OktaPolicy[];
}

export interface OktaAuthenticator {
  id: string;
  key?: string;
  name?: string;
  type?: string;
  status?: string;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface OktaAuthorizationServer {
  id: string;
  name?: string;
  issuer?: string;
  audience?: string;
  status?: string;
  created?: string;
  lastUpdated?: string;
  scopeVisibilityLimited?: boolean;
  claimVisibilityLimited?: boolean;
  policyVisibilityLimited?: boolean;
  [key: string]: unknown;
}

export interface OktaAuthorizationServerScope {
  authorizationServerId: string;
  id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  metadataPublish?: string;
  [key: string]: unknown;
}

export interface OktaAuthorizationServerClaim {
  authorizationServerId: string;
  id?: string;
  name?: string;
  claimType?: string;
  valueType?: string;
  status?: string;
  [key: string]: unknown;
}

export interface OktaAuthorizationServerPolicy {
  authorizationServerId: string;
  id: string;
  name?: string;
  status?: string;
  priority?: number;
  system?: boolean;
  ruleVisibilityLimited?: boolean;
  rules?: OktaPolicyRule[];
  [key: string]: unknown;
}

export interface OktaAdminRoleAssignment {
  principalId?: string;
  principalType?: "USER" | "GROUP" | "CLIENT" | "UNKNOWN";
  roleId?: string;
  roleType?: string;
  resourceSetId?: string;
  assignmentType?: string;
  status?: string;
  [key: string]: unknown;
}

export interface OktaNetworkZone {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  usage?: string;
  gateways?: unknown[];
  proxies?: unknown[];
  locations?: unknown[];
  [key: string]: unknown;
}

export interface OktaTrustedOrigin {
  id: string;
  name?: string;
  origin?: string;
  scopes?: Array<{ type?: string }>;
  status?: string;
  [key: string]: unknown;
}

export interface OktaIdentityProvider {
  id: string;
  type?: string;
  name?: string;
  status?: string;
  created?: string;
  lastUpdated?: string;
  protocol?: unknown;
  policy?: unknown;
  [key: string]: unknown;
}

export interface OktaEventHook {
  id: string;
  name?: string;
  status?: string;
  events?: string[];
  channel?: {
    type?: string;
    uri?: string;
  };
  [key: string]: unknown;
}

export interface OktaInlineHook {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  channel?: {
    type?: string;
    uri?: string;
  };
  [key: string]: unknown;
}

export interface OktaLogStream {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  [key: string]: unknown;
}

export interface OktaDomainSummary {
  id?: string;
  domain?: string;
  certificateSourceType?: string;
  validationStatus?: string;
  [key: string]: unknown;
}

export interface OktaSystemLogSummary {
  queryWindow: {
    since: string;
    until: string;
    maxEvents: number;
  };
  totalCollected: number;
  eventTypeCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  actorTypeCounts: Record<string, number>;
  notableEvents: Array<{
    uuid?: string;
    published?: string;
    eventType?: string;
    outcome?: string;
    severity?: string;
    actor?: {
      id?: string;
      type?: string;
    };
    client?: {
      ipAddress?: string;
    };
  }>;
}

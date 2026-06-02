import { HttpError } from "../../core/errors";
import { CollectorResult } from "../../core/schema";
import { Logger } from "../../core/logger";
import { normalizeOktaPageItems, OktaClient, parseNextLink } from "./okta.client";
import {
  OktaAdminRoleAssignment,
  OktaAppSummary,
  OktaAuthMode,
  OktaAuthenticator,
  OktaAuthorizationServer,
  OktaAuthorizationServerClaim,
  OktaAuthorizationServerPolicy,
  OktaAuthorizationServerScope,
  OktaDomainSummary,
  OktaEventHook,
  OktaFeature,
  OktaGroupRule,
  OktaGroupSummary,
  OktaIdentityProvider,
  OktaInlineHook,
  OktaLogStream,
  OktaNetworkZone,
  OktaOrgSettings,
  OktaPolicy,
  OktaPolicyRule,
  OktaPolicySnapshot,
  OktaSystemLogSummary,
  OktaTrustedOrigin,
  OktaUserSummary
} from "./okta.types";

export interface CollectorContext {
  http: OktaClient;
  logger: Logger;
  authMode: OktaAuthMode;
}

type CollectorFn<T> = (ctx: CollectorContext) => Promise<CollectorResult<T>>;
type OktaOauthClient = NonNullable<NonNullable<OktaAppSummary["settings"]>["oauthClient"]>;
const APP_ASSIGNMENT_SAMPLE_LIMIT = 25;

export function describeOktaHttpError(err: HttpError): string {
  const parts: string[] = [`HTTP ${err.status}`];
  const details = err.details;
  const body =
    details && typeof details === "object"
      ? "body" in details && typeof (details as Record<string, unknown>).body === "object"
        ? ((details as Record<string, unknown>).body as Record<string, unknown>)
        : (details as Record<string, unknown>)
      : undefined;
  const code =
    body && typeof body.errorCode === "string"
      ? body.errorCode
      : body && typeof body.errorLink === "string"
        ? body.errorLink
        : undefined;
  if (code) parts.push(`code=${code}`);
  const summary =
    body && typeof body.errorSummary === "string"
      ? body.errorSummary
      : body && Array.isArray(body.errorCauses)
        ? body.errorCauses
            .map((cause) =>
              cause && typeof cause === "object" && typeof (cause as Record<string, unknown>).errorSummary === "string"
                ? (cause as Record<string, unknown>).errorSummary
                : ""
            )
            .filter(Boolean)
            .join("; ")
        : err.message;
  if (summary) parts.push(summary);
  return parts.join(": ");
}

async function safeCollect<T>(
  name: string,
  requiredScopes: string[],
  ctx: CollectorContext,
  body: () => Promise<{
    data: T;
    count?: number;
    notes?: string;
    status?: CollectorResult<T>["status"];
    errors?: string[];
    missingScopes?: string[];
  }>
): Promise<CollectorResult<T>> {
  try {
    const { data, count, notes, status, errors, missingScopes } = await body();
    return {
      name,
      status: status ?? "success",
      requiredScopes,
      errors,
      missingScopes,
      data,
      count,
      notes
    };
  } catch (err) {
    if (err instanceof HttpError) {
      const detail = describeOktaHttpError(err);
      if (err.status === 403) {
        ctx.logger.warn(`Collector ${name} skipped (403)`, { requiredScopes, detail });
        return {
          name,
          status: "skipped",
          requiredScopes,
          missingScopes: ctx.authMode === "oauth" ? requiredScopes : undefined,
          errors: [
            ctx.authMode === "oauth"
              ? `${detail} — missing scope or denied permission`
              : `${detail} — permission denied for SSWS/admin context`
          ]
        };
      }
      if (err.status === 404) {
        ctx.logger.warn(`Collector ${name} skipped (404, feature unavailable)`, { detail });
        return {
          name,
          status: "skipped",
          requiredScopes,
          errors: [`${detail} — feature not enabled or endpoint unavailable`],
          notes: "Feature may not be enabled for this Okta org."
        };
      }
      ctx.logger.error(`Collector ${name} failed`, { status: err.status, detail });
      return {
        name,
        status: "failed",
        requiredScopes,
        errors: [detail]
      };
    }
    throw err;
  }
}

export const orgCollector: CollectorFn<OktaOrgSettings> = (ctx) =>
  safeCollect("org", ["okta.orgs.read"], ctx, async () => {
    const res = await ctx.http.get<Record<string, unknown>>("/api/v1/org", {
      collectorName: "org"
    });
    return {
      data: {
        id: asString(res.data.id),
        subdomain: asString(res.data.subdomain),
        companyName: asString(res.data.companyName),
        website: asString(res.data.website),
        supportPhoneNumber: asString(res.data.supportPhoneNumber),
        status: asString(res.data.status)
      },
      count: 1
    };
  });

export const featuresCollector: CollectorFn<OktaFeature[]> = (ctx) =>
  safeCollect("features", ["okta.features.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/features", {
      collectorName: "features"
    });
    return {
      data: data.map((feature) => ({
        id: asString(feature.id),
        name: asString(feature.name),
        stage: asString(feature.stage?.toString?.() ?? feature.stage),
        status: asString(feature.status),
        type: asString(feature.type)
      })),
      count: data.length
    };
  });

export const usersCollector = (
  maxUsers: number
): CollectorFn<OktaUserSummary[]> => (ctx) =>
  safeCollect("users", ["okta.users.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/users", {
      collectorName: "users",
      maxItems: maxUsers,
      query: { limit: Math.min(maxUsers, 200) }
    });
    let groupMembershipLookupEnabled = true;
    let groupMembershipNotes: string | undefined;
    const users: OktaUserSummary[] = [];

    for (const user of data) {
      const summary: OktaUserSummary = {
        id: asString(user.id) ?? "unknown",
        status: asString(user.status),
        created: asString(user.created),
        activated: asString(user.activated),
        statusChanged: asString(user.statusChanged),
        lastLogin: asString(user.lastLogin),
        lastUpdated: asString(user.lastUpdated),
        passwordChanged: asString(user.passwordChanged),
        credentialProvider: asString(
          (
            (user.credentials as Record<string, unknown> | undefined)?.provider as
              | Record<string, unknown>
              | undefined
          )?.type
        ),
        type: {
          id: asString((user.type as Record<string, unknown> | undefined)?.id)
        },
        profile: {
          login: asString((user.profile as Record<string, unknown> | undefined)?.login),
          email: asString((user.profile as Record<string, unknown> | undefined)?.email)
        }
      };

      if (groupMembershipLookupEnabled) {
        try {
          const groupsResponse = await ctx.http.get<Record<string, unknown>[] | Record<string, unknown>>(
            `/api/v1/users/${encodeURIComponent(summary.id)}/groups`,
            {
              collectorName: "users",
              query: { limit: 1 }
            }
          );
          summary.hasGroupMembership =
            normalizeOktaPageItems<Record<string, unknown>>(groupsResponse.data).length > 0;
        } catch (err) {
          if (err instanceof HttpError && (err.status === 403 || err.status === 404 || err.status === 405)) {
            groupMembershipLookupEnabled = false;
            groupMembershipNotes =
              "Per-user group membership enrichment was unavailable; groupless-user checks may be limited.";
          } else {
            throw err;
          }
        }
      }

      users.push(summary);
    }

    const notes: string[] = [];
    if (maxUsers < Number.MAX_SAFE_INTEGER) {
      notes.push(`Bounded user summary (${data.length}/${maxUsers}). Full export is out of MVP scope.`);
    } else {
      notes.push("Full user summary requested.");
    }
    if (groupMembershipNotes) notes.push(groupMembershipNotes);

    return {
      data: users,
      count: data.length,
      notes: notes.join(" "),
      status: groupMembershipNotes ? "partial" : "success",
      errors: groupMembershipNotes ? [groupMembershipNotes] : undefined
    };
  });

export const groupsCollector: CollectorFn<OktaGroupSummary[]> = (ctx) =>
  safeCollect("groups", ["okta.groups.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/groups", {
      collectorName: "groups",
      query: { limit: 200 }
    });
    return {
      data: data.map((group) => ({
        id: asString(group.id) ?? "unknown",
        type: asString(group.type),
        created: asString(group.created),
        lastUpdated: asString(group.lastUpdated),
        lastMembershipUpdated: asString(group.lastMembershipUpdated),
        profile: {
          name: asString((group.profile as Record<string, unknown> | undefined)?.name),
          description: asString((group.profile as Record<string, unknown> | undefined)?.description)
        }
      })),
      count: data.length
    };
  });

export const groupRulesCollector: CollectorFn<OktaGroupRule[]> = (ctx) =>
  safeCollect("group_rules", ["okta.groups.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/groups/rules", {
      collectorName: "group_rules",
      query: { limit: 200 }
    });
    return {
      data: data.map((rule) => ({
        id: asString(rule.id) ?? "unknown",
        name: asString(rule.name),
        status: asString(rule.status),
        type: asString(rule.type),
        created: asString(rule.created),
        lastUpdated: asString(rule.lastUpdated),
        conditions: rule.conditions,
        actions: rule.actions
      })),
      count: data.length
    };
  });

export const appsCollector: CollectorFn<OktaAppSummary[]> = (ctx) =>
  safeCollect("apps", ["okta.apps.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/apps", {
      collectorName: "apps",
      query: { limit: 200 }
    });
    let appUserAssignmentsEnabled = true;
    let appGroupAssignmentsEnabled = true;
    const notes: string[] = [
      `App assignment sampling inspects up to ${APP_ASSIGNMENT_SAMPLE_LIMIT} direct users and groups per app.`
    ];
    let assignmentSamplingLimited = false;

    const apps: OktaAppSummary[] = [];
    for (const app of data) {
      const summary: OktaAppSummary = {
        id: asString(app.id) ?? "unknown",
        name: asString(app.name),
        label: asString(app.label),
        status: asString(app.status),
        signOnMode: asString(app.signOnMode),
        created: asString(app.created),
        lastUpdated: asString(app.lastUpdated),
        settings: {
          oauthClient: pickOauthClient(app.settings as Record<string, unknown> | undefined),
          app: asRecord((app.settings as Record<string, unknown> | undefined)?.app)
        },
        visibility: asRecord(app.visibility),
        features: Array.isArray(app.features) ? app.features.filter((x): x is string => typeof x === "string") : []
      };

      let sampledDirect = 0;
      let sampledGroups = 0;
      let assignmentDataIncomplete = false;
      const sampledGroupNames: string[] = [];

      if (appUserAssignmentsEnabled) {
        try {
          const response = await ctx.http.get<Record<string, unknown>[] | Record<string, unknown>>(
            `/api/v1/apps/${encodeURIComponent(summary.id)}/users`,
            {
              collectorName: "apps",
              query: { limit: APP_ASSIGNMENT_SAMPLE_LIMIT }
            }
          );
          sampledDirect = normalizeOktaPageItems<Record<string, unknown>>(response.data).length;
          assignmentDataIncomplete ||= Boolean(parseNextLink(response.headers.get("link")));
        } catch (err) {
          if (err instanceof HttpError && (err.status === 403 || err.status === 404 || err.status === 405)) {
            appUserAssignmentsEnabled = false;
            assignmentSamplingLimited = true;
            notes.push("Direct app-user assignment sampling was unavailable for this org or token.");
          } else {
            throw err;
          }
        }
      }

      if (appGroupAssignmentsEnabled) {
        try {
          const response = await ctx.http.get<Record<string, unknown>[] | Record<string, unknown>>(
            `/api/v1/apps/${encodeURIComponent(summary.id)}/groups`,
            {
              collectorName: "apps",
              query: { limit: APP_ASSIGNMENT_SAMPLE_LIMIT }
            }
          );
          const groupItems = normalizeOktaPageItems<Record<string, unknown>>(response.data);
          sampledGroups = groupItems.length;
          assignmentDataIncomplete ||= Boolean(parseNextLink(response.headers.get("link")));
          sampledGroupNames.push(
            ...groupItems
              .map((item) => asString((item.profile as Record<string, unknown> | undefined)?.name))
              .filter((name): name is string => Boolean(name))
          );
        } catch (err) {
          if (err instanceof HttpError && (err.status === 403 || err.status === 404 || err.status === 405)) {
            appGroupAssignmentsEnabled = false;
            assignmentSamplingLimited = true;
            notes.push("App-group assignment sampling was unavailable for this org or token.");
          } else {
            throw err;
          }
        }
      }

      if (appUserAssignmentsEnabled || appGroupAssignmentsEnabled) {
        summary.sampledDirectUserAssignments = sampledDirect;
        summary.sampledGroupAssignments = sampledGroups;
        summary.sampledAssignedGroupNames = sampledGroupNames;
        summary.assignmentDataIncomplete = assignmentDataIncomplete || undefined;
        summary.assignmentModel = deriveAppAssignmentModel(
          sampledDirect,
          sampledGroups,
          appUserAssignmentsEnabled,
          appGroupAssignmentsEnabled
        );
      }

      apps.push(summary);
    }

    return {
      data: apps,
      count: data.length,
      notes: Array.from(new Set(notes)).join(" "),
      status: assignmentSamplingLimited ? "partial" : "success",
      errors: assignmentSamplingLimited
        ? Array.from(new Set(notes.filter((note) => note.includes("sampling was unavailable"))))
        : undefined
    };
  });

export const policiesCollector: CollectorFn<OktaPolicySnapshot> = (ctx) =>
  safeCollect("policies", ["okta.policies.read"], ctx, async () => {
    const policyTypes = ["OKTA_SIGN_ON", "PASSWORD", "MFA_ENROLL", "ACCESS_POLICY"] as const;
    const policies: Record<string, unknown>[] = [];
    const seenIds = new Set<string>();

    for (const policyType of policyTypes) {
      const items = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/policies", {
        collectorName: "policies",
        query: { type: policyType, limit: 200 }
      });
      for (const item of items) {
        const id = asString(item.id);
        if (id && seenIds.has(id)) continue;
        if (id) seenIds.add(id);
        policies.push(item);
      }
    }

    const normalized: OktaPolicy[] = [];
    const ruleVisibilityErrors: string[] = [];
    for (const policy of policies) {
      const normalizedPolicy: OktaPolicy = {
        id: asString(policy.id) ?? "unknown",
        name: asString(policy.name),
        type: asString(policy.type),
        status: asString(policy.status),
        system: typeof policy.system === "boolean" ? policy.system : undefined,
        priority: typeof policy.priority === "number" ? policy.priority : undefined,
        created: asString(policy.created),
        lastUpdated: asString(policy.lastUpdated),
        conditions: policy.conditions,
        settings: policy.settings
      };
      try {
        const rules = await ctx.http.getAllPages<Record<string, unknown>>(
          `/api/v1/policies/${encodeURIComponent(normalizedPolicy.id)}/rules`,
          {
            collectorName: "policies"
          }
        );
        normalizedPolicy.rules = rules.map(normalizePolicyRule);
      } catch (err) {
        if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
          ruleVisibilityErrors.push(
            `Rules for policy ${normalizedPolicy.name ?? normalizedPolicy.id} were unavailable.`
          );
        } else {
          throw err;
        }
      }
      normalized.push(normalizedPolicy);
    }

    const snapshot: OktaPolicySnapshot = {
      all: normalized,
      globalSessionPolicies: normalized.filter((policy) => policy.type === "OKTA_SIGN_ON" || policy.type === "SIGN_ON"),
      passwordPolicies: normalized.filter((policy) => policy.type === "PASSWORD"),
      authenticatorEnrollmentPolicies: normalized.filter((policy) => policy.type === "MFA_ENROLL"),
      appSignInPolicies: normalized.filter((policy) => policy.type === "ACCESS_POLICY"),
      unknownTypePolicies: normalized.filter(
        (policy) =>
          !["OKTA_SIGN_ON", "SIGN_ON", "PASSWORD", "MFA_ENROLL", "ACCESS_POLICY"].includes(
            policy.type ?? ""
          )
      )
    };

    return {
      data: snapshot,
      count: normalized.length,
      notes: [
        "Policies collected from the core MVP policy types: OKTA_SIGN_ON, PASSWORD, MFA_ENROLL, ACCESS_POLICY.",
        ...Array.from(new Set(ruleVisibilityErrors))
      ].join(" "),
      status: ruleVisibilityErrors.length > 0 ? "partial" : "success",
      errors: ruleVisibilityErrors.length > 0 ? Array.from(new Set(ruleVisibilityErrors)) : undefined
    };
  });

export const authenticatorsCollector: CollectorFn<OktaAuthenticator[]> = (ctx) =>
  safeCollect("authenticators", ["okta.authenticators.read"], ctx, async () => {
    const res = await ctx.http.get<Record<string, unknown>[] | Record<string, unknown>>(
      "/api/v1/authenticators",
      { collectorName: "authenticators" }
    );
    const data = Array.isArray(res.data) ? res.data : [];
    return {
      data: data.map((authenticator) => ({
        id: asString(authenticator.id) ?? "unknown",
        key: asString(authenticator.key),
        name: asString(authenticator.name),
        type: asString(authenticator.type),
        status: asString(authenticator.status),
        settings: asRecord(authenticator.settings)
      })),
      count: data.length
    };
  });

export const authorizationServersCollector: CollectorFn<{
  servers: OktaAuthorizationServer[];
  scopes: OktaAuthorizationServerScope[];
  claims: OktaAuthorizationServerClaim[];
  policies: OktaAuthorizationServerPolicy[];
}> = (ctx) =>
  safeCollect("authorization_servers", ["okta.authorizationServers.read"], ctx, async () => {
    const serversRaw = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/authorizationServers", {
      collectorName: "authorization_servers"
    });

    const servers: OktaAuthorizationServer[] = serversRaw.map((server) => ({
      id: asString(server.id) ?? "unknown",
      name: asString(server.name),
      issuer: asString(server.issuer),
      audience: asString(server.audience),
      status: asString(server.status),
      created: asString(server.created),
      lastUpdated: asString(server.lastUpdated)
    }));
    const scopes: OktaAuthorizationServerScope[] = [];
    const claims: OktaAuthorizationServerClaim[] = [];
    const policies: OktaAuthorizationServerPolicy[] = [];
    const visibilityErrors: string[] = [];

    for (const server of servers) {
      try {
        const scopeItems = await ctx.http.getAllPages<Record<string, unknown>>(
          `/api/v1/authorizationServers/${encodeURIComponent(server.id)}/scopes`,
          { collectorName: "authorization_servers" }
        );
        scopes.push(
          ...scopeItems.map((scope) => ({
            authorizationServerId: server.id,
            id: asString(scope.id),
            name: asString(scope.name),
            displayName: asString(scope.displayName),
            description: asString(scope.description),
            metadataPublish: asString(scope.metadataPublish)
          }))
        );
      } catch (err) {
        if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
          server.scopeVisibilityLimited = true;
          visibilityErrors.push(`Scopes for authorization server ${server.name ?? server.id} were unavailable.`);
        } else {
          throw err;
        }
      }

      try {
        const claimItems = await ctx.http.getAllPages<Record<string, unknown>>(
          `/api/v1/authorizationServers/${encodeURIComponent(server.id)}/claims`,
          { collectorName: "authorization_servers" }
        );
        claims.push(
          ...claimItems.map((claim) => ({
            authorizationServerId: server.id,
            id: asString(claim.id),
            name: asString(claim.name),
            claimType: asString(claim.claimType),
            valueType: asString(claim.valueType),
            status: asString(claim.status)
          }))
        );
      } catch (err) {
        if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
          server.claimVisibilityLimited = true;
          visibilityErrors.push(`Claims for authorization server ${server.name ?? server.id} were unavailable.`);
        } else {
          throw err;
        }
      }

      try {
        const policyItems = await ctx.http.getAllPages<Record<string, unknown>>(
          `/api/v1/authorizationServers/${encodeURIComponent(server.id)}/policies`,
          { collectorName: "authorization_servers" }
        );
        for (const policy of policyItems) {
          const normalizedPolicy: OktaAuthorizationServerPolicy = {
            authorizationServerId: server.id,
            id: asString(policy.id) ?? "unknown",
            name: asString(policy.name),
            status: asString(policy.status),
            priority: typeof policy.priority === "number" ? policy.priority : undefined,
            system: typeof policy.system === "boolean" ? policy.system : undefined
          };
          try {
            const ruleItems = await ctx.http.getAllPages<Record<string, unknown>>(
              `/api/v1/authorizationServers/${encodeURIComponent(server.id)}/policies/${encodeURIComponent(
                normalizedPolicy.id
              )}/rules`,
              { collectorName: "authorization_servers" }
            );
            normalizedPolicy.rules = ruleItems.map(normalizePolicyRule);
          } catch (err) {
            if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
              normalizedPolicy.ruleVisibilityLimited = true;
              visibilityErrors.push(
                `Rules for authorization server policy ${normalizedPolicy.name ?? normalizedPolicy.id} were unavailable.`
              );
            } else {
              throw err;
            }
          }
          policies.push(normalizedPolicy);
        }
      } catch (err) {
        if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
          server.policyVisibilityLimited = true;
          visibilityErrors.push(`Policies for authorization server ${server.name ?? server.id} were unavailable.`);
        } else {
          throw err;
        }
      }
    }

    return {
      data: { servers, scopes, claims, policies },
      count: servers.length,
      notes: [
        servers.length === 0
          ? "No custom authorization servers returned. Many Okta orgs rely only on the org authorization server."
          : undefined,
        ...Array.from(new Set(visibilityErrors))
      ]
        .filter((note): note is string => Boolean(note))
        .join(" "),
      status: visibilityErrors.length > 0 ? "partial" : "success",
      errors: visibilityErrors.length > 0 ? Array.from(new Set(visibilityErrors)) : undefined
    };
  });

export const adminRolesCollector: CollectorFn<OktaAdminRoleAssignment[]> = async (ctx) => {
  const requiredScopes = ["okta.roles.read"];
  const assignments: OktaAdminRoleAssignment[] = [];
  let hadAnySuccess = false;
  let permissionDenied = false;
  let notFound = false;
  const visibilityErrors: string[] = [];

  for (const [principalType, path] of [
    ["USER", "/api/v1/iam/assignees/users"],
    ["GROUP", "/api/v1/iam/assignees/groups"],
    ["CLIENT", "/api/v1/iam/assignees/clients"]
  ] as const) {
    try {
      const items = await ctx.http.getAllPages<Record<string, unknown>>(path, {
        collectorName: "admin_roles"
      });
      hadAnySuccess = true;
      assignments.push(...items.map((item) => normalizeAdminRoleAssignment(item, principalType)));
    } catch (err) {
      if (err instanceof HttpError && err.status === 403) {
        permissionDenied = true;
        visibilityErrors.push(`${principalType} admin role assignments were denied.`);
        continue;
      }
      if (err instanceof HttpError && (err.status === 404 || err.status === 405)) {
        notFound = true;
        visibilityErrors.push(`${principalType} admin role assignments were unavailable.`);
        continue;
      }
      if (err instanceof HttpError) {
        return {
          name: "admin_roles",
          status: "failed",
          requiredScopes,
          errors: [describeOktaHttpError(err)]
        };
      }
      throw err;
    }
  }

  if (!hadAnySuccess && permissionDenied) {
    return {
      name: "admin_roles",
      status: "skipped",
      requiredScopes,
      missingScopes: ctx.authMode === "oauth" ? requiredScopes : undefined,
      errors: [
        ctx.authMode === "oauth"
          ? "HTTP 403: missing scope or denied permission"
          : "HTTP 403: denied permission for SSWS/admin context"
      ]
    };
  }

  if (!hadAnySuccess && notFound) {
    return {
      name: "admin_roles",
      status: "skipped",
      requiredScopes,
      errors: ["HTTP 404/405: admin role assignment endpoints unavailable"],
      notes: "Admin role assignment endpoints may not be available in this org, SKU, or API shape."
    };
  }

  return {
    name: "admin_roles",
    status: visibilityErrors.length > 0 ? "partial" : "success",
    requiredScopes,
    data: assignments,
    count: assignments.length,
    notes:
      visibilityErrors.length > 0
        ? "Admin role assignment inventory is incomplete across one or more principal types."
        : undefined,
    errors: visibilityErrors.length > 0 ? visibilityErrors : undefined
  };
};

export const networkZonesCollector: CollectorFn<OktaNetworkZone[]> = (ctx) =>
  safeCollect("network_zones", ["okta.networkZones.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/zones", {
      collectorName: "network_zones"
    });
    return {
      data: data.map((zone) => ({
        id: asString(zone.id) ?? "unknown",
        name: asString(zone.name),
        type: asString(zone.type),
        status: asString(zone.status),
        usage: asString(zone.usage),
        gateways: Array.isArray(zone.gateways) ? zone.gateways : undefined,
        proxies: Array.isArray(zone.proxies) ? zone.proxies : undefined,
        locations: Array.isArray(zone.locations) ? zone.locations : undefined
      })),
      count: data.length
    };
  });

export const trustedOriginsCollector: CollectorFn<OktaTrustedOrigin[]> = (ctx) =>
  safeCollect("trusted_origins", ["okta.trustedOrigins.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/trustedOrigins", {
      collectorName: "trusted_origins"
    });
    return {
      data: data.map((origin) => ({
        id: asString(origin.id) ?? "unknown",
        name: asString(origin.name),
        origin: asString(origin.origin),
        scopes: Array.isArray(origin.scopes)
          ? origin.scopes.map((scope) => ({
              type:
                scope && typeof scope === "object"
                  ? asString((scope as Record<string, unknown>).type)
                  : undefined
            }))
          : undefined,
        status: asString(origin.status)
      })),
      count: data.length
    };
  });

export const idpsCollector: CollectorFn<OktaIdentityProvider[]> = (ctx) =>
  safeCollect("idps", ["okta.idps.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/idps", {
      collectorName: "idps"
    });
    return {
      data: data.map((idp) => ({
        id: asString(idp.id) ?? "unknown",
        type: asString(idp.type),
        name: asString(idp.name),
        status: asString(idp.status),
        created: asString(idp.created),
        lastUpdated: asString(idp.lastUpdated),
        protocol: idp.protocol,
        policy: idp.policy
      })),
      count: data.length
    };
  });

export const eventHooksCollector: CollectorFn<OktaEventHook[]> = (ctx) =>
  safeCollect("event_hooks", ["okta.eventHooks.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/eventHooks", {
      collectorName: "event_hooks"
    });
    return {
      data: data.map((hook) => ({
        id: asString(hook.id) ?? "unknown",
        name: asString(hook.name),
        status: asString(hook.status),
        events: extractStringArray((hook.events as Record<string, unknown> | undefined)?.type),
        channel: {
          type: asString((hook.channel as Record<string, unknown> | undefined)?.type),
          uri: asString((hook.channel as Record<string, unknown> | undefined)?.uri)
        }
      })),
      count: data.length
    };
  });

export const inlineHooksCollector: CollectorFn<OktaInlineHook[]> = (ctx) =>
  safeCollect("inline_hooks", ["okta.inlineHooks.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/inlineHooks", {
      collectorName: "inline_hooks"
    });
    return {
      data: data.map((hook) => ({
        id: asString(hook.id) ?? "unknown",
        name: asString(hook.name),
        type: asString(hook.type),
        status: asString(hook.status),
        channel: {
          type: asString((hook.channel as Record<string, unknown> | undefined)?.type),
          uri: asString((hook.channel as Record<string, unknown> | undefined)?.uri)
        }
      })),
      count: data.length
    };
  });

export const logStreamsCollector: CollectorFn<OktaLogStream[]> = (ctx) =>
  safeCollect("log_streams", ["okta.logStreams.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/logStreams", {
      collectorName: "log_streams"
    });
    return {
      data: data.map((stream) => ({
        id: asString(stream.id) ?? "unknown",
        name: asString(stream.name),
        type: asString(stream.type),
        status: asString(stream.status)
      })),
      count: data.length
    };
  });

export const domainsCollector: CollectorFn<OktaDomainSummary[]> = (ctx) =>
  safeCollect("domains", ["okta.domains.read"], ctx, async () => {
    const data = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/domains", {
      collectorName: "domains"
    });
    return {
      data: data.map((domain) => ({
        id: asString(domain.id),
        domain: asString(domain.domain),
        certificateSourceType: asString(domain.certificateSourceType),
        validationStatus: asString(domain.validationStatus)
      })),
      count: data.length
    };
  });

export const systemLogCollector = (
  systemLogDays: number,
  maxLogs: number
): CollectorFn<OktaSystemLogSummary> => (ctx) =>
  safeCollect("system_log", ["okta.logs.read"], ctx, async () => {
    const until = new Date().toISOString();
    const since = new Date(Date.now() - systemLogDays * 24 * 60 * 60 * 1000).toISOString();
    const events = await ctx.http.getAllPages<Record<string, unknown>>("/api/v1/logs", {
      collectorName: "system_log",
      maxItems: maxLogs,
      query: {
        since,
        until,
        limit: Math.min(maxLogs, 100),
        sortOrder: "DESCENDING"
      }
    });

    const eventTypeCounts: Record<string, number> = {};
    const outcomeCounts: Record<string, number> = {};
    const actorTypeCounts: Record<string, number> = {};

    const notableEvents = events.slice(0, 20).map((event) => {
      const eventType = asString(event.eventType) ?? "unknown";
      const outcome = asString((event.outcome as Record<string, unknown> | undefined)?.result) ?? "unknown";
      const actorType = asString((event.actor as Record<string, unknown> | undefined)?.type) ?? "unknown";

      eventTypeCounts[eventType] = (eventTypeCounts[eventType] ?? 0) + 1;
      outcomeCounts[outcome] = (outcomeCounts[outcome] ?? 0) + 1;
      actorTypeCounts[actorType] = (actorTypeCounts[actorType] ?? 0) + 1;

      return {
        uuid: asString(event.uuid),
        published: asString(event.published),
        eventType,
        outcome,
        severity: asString(event.severity),
        actor: {
          id: asString((event.actor as Record<string, unknown> | undefined)?.id),
          type: actorType
        },
        client: {
          ipAddress: asString((event.client as Record<string, unknown> | undefined)?.ipAddress)
        }
      };
    });

    for (const event of events.slice(20)) {
      const eventType = asString(event.eventType) ?? "unknown";
      const outcome = asString((event.outcome as Record<string, unknown> | undefined)?.result) ?? "unknown";
      const actorType = asString((event.actor as Record<string, unknown> | undefined)?.type) ?? "unknown";
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] ?? 0) + 1;
      outcomeCounts[outcome] = (outcomeCounts[outcome] ?? 0) + 1;
      actorTypeCounts[actorType] = (actorTypeCounts[actorType] ?? 0) + 1;
    }

    return {
      data: {
        queryWindow: { since, until, maxEvents: maxLogs },
        totalCollected: events.length,
        eventTypeCounts,
        outcomeCounts,
        actorTypeCounts,
        notableEvents
      },
      count: events.length,
      notes: `Bounded system log summary (last ${systemLogDays} days, up to ${maxLogs} events).`
    };
  });

function normalizeAdminRoleAssignment(
  input: Record<string, unknown>,
  principalType: OktaAdminRoleAssignment["principalType"]
): OktaAdminRoleAssignment {
  return {
    principalId: asString(input.id) ?? asString(input.assigneeId),
    principalType,
    roleId:
      asString((input.role as Record<string, unknown> | undefined)?.id) ??
      asString(input.roleId),
    roleType:
      asString((input.role as Record<string, unknown> | undefined)?.type) ??
      asString(input.type) ??
      asString(input.roleType),
    resourceSetId: asString(input.resourceSetId),
    assignmentType: asString(input.assignmentType),
    status: asString(input.status)
  };
}

function normalizePolicyRule(rule: Record<string, unknown>): OktaPolicyRule {
  return {
    id: asString(rule.id) ?? "unknown",
    name: asString(rule.name),
    type: asString(rule.type),
    status: asString(rule.status),
    priority: typeof rule.priority === "number" ? rule.priority : undefined,
    conditions: rule.conditions,
    actions: rule.actions
  };
}

function deriveAppAssignmentModel(
  sampledDirectAssignments: number,
  sampledGroupAssignments: number,
  directAssignmentsKnown: boolean,
  groupAssignmentsKnown: boolean
): OktaAppSummary["assignmentModel"] {
  if (!directAssignmentsKnown && !groupAssignmentsKnown) return "unknown";
  if (sampledDirectAssignments > 0 && sampledGroupAssignments > 0) return "mixed";
  if (sampledDirectAssignments > 0) return "direct";
  if (sampledGroupAssignments > 0) return "group";
  return "none";
}

function pickOauthClient(
  settings: Record<string, unknown> | undefined
): OktaOauthClient | undefined {
  const client = asRecord(settings?.oauthClient);
  if (!client) return undefined;
  return {
    application_type: asString(client.application_type),
    grant_types: extractStringArray(client.grant_types),
    response_types: extractStringArray(client.response_types),
    redirect_uris: extractStringArray(client.redirect_uris),
    post_logout_redirect_uris: extractStringArray(client.post_logout_redirect_uris),
    consent_method: asString(client.consent_method),
    issuer_mode: asString(client.issuer_mode),
    refresh_token: asRecord(client.refresh_token)
      ? {
          rotation_type: asString((client.refresh_token as Record<string, unknown>).rotation_type),
          expiration_type: asString((client.refresh_token as Record<string, unknown>).expiration_type),
          leeway:
            typeof (client.refresh_token as Record<string, unknown>).leeway === "number"
              ? ((client.refresh_token as Record<string, unknown>).leeway as number)
              : undefined
        }
      : undefined
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

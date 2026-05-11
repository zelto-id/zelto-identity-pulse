/**
 * Auth0 collectors. Each collector is a small async function that returns a
 * standard `CollectorResult`. Failures are normalized — a missing scope or
 * "feature not enabled" must NOT crash the scan.
 */

import { CollectorResult } from "../../core/schema";
import { Logger } from "../../core/logger";
import { HttpError } from "../../core/errors";
import { Auth0Client } from "./auth0.client";
import {
  Auth0Action,
  Auth0AttackProtection,
  Auth0Branding,
  Auth0Client as Auth0ClientResource,
  Auth0ClientGrant,
  Auth0Connection,
  Auth0CustomDomain,
  Auth0Guardian,
  Auth0Hook,
  Auth0LogEvent,
  Auth0LogStream,
  Auth0Organization,
  Auth0Prompt,
  Auth0ResourceServer,
  Auth0Role,
  Auth0RolePermission,
  Auth0Rule,
  Auth0TenantSettings,
  Auth0UserSummary
} from "./auth0.types";

export interface CollectorContext {
  http: Auth0Client;
  logger: Logger;
}

type CollectorFn<T> = (ctx: CollectorContext) => Promise<CollectorResult<T>>;

/**
 * Extract Auth0-shaped error fields from an HttpError's details payload.
 * Auth0 error bodies typically look like:
 *   { statusCode, error, errorCode, message }
 * We surface `errorCode`/`error` and `message` so failure reasons are
 * actionable rather than just "HTTP 500".
 */
export function describeAuth0HttpError(err: HttpError): string {
  const parts: string[] = [`HTTP ${err.status}`];
  const details = err.details;
  // The client wraps a parsed body either directly as the details object or
  // under a `body` key when JSON parsing failed.
  const body =
    details && typeof details === "object"
      ? "body" in details && typeof (details as Record<string, unknown>).body === "object"
        ? ((details as Record<string, unknown>).body as Record<string, unknown>)
        : (details as Record<string, unknown>)
      : undefined;
  const code =
    body && typeof body.errorCode === "string"
      ? body.errorCode
      : body && typeof body.error === "string"
        ? body.error
        : undefined;
  if (code) parts.push(`code=${code}`);
  const message =
    body && typeof body.message === "string"
      ? body.message
      : body && typeof body.error_description === "string"
        ? body.error_description
        : err.message;
  if (message) parts.push(message);
  return parts.join(": ");
}

/**
 * Wrap a collector body with standard error handling: 403 -> skipped (missing scope),
 * 404 -> skipped (feature unavailable), other errors -> failed (still continues scan).
 */
async function safeCollect<T>(
  name: string,
  requiredScopes: string[],
  ctx: CollectorContext,
  body: () => Promise<{ data: T; count?: number; notes?: string }>
): Promise<CollectorResult<T>> {
  try {
    const { data, count, notes } = await body();
    return {
      name,
      status: "success",
      requiredScopes,
      data,
      count,
      notes
    };
  } catch (err) {
    if (err instanceof HttpError) {
      const detail = describeAuth0HttpError(err);
      if (err.status === 403) {
        ctx.logger.warn(`Collector ${name} skipped (403, missing scope)`, {
          requiredScopes,
          detail
        });
        return {
          name,
          status: "skipped",
          requiredScopes,
          missingScopes: requiredScopes,
          errors: [`${detail} — missing scope (required: ${requiredScopes.join(", ") || "n/a"})`]
        };
      }
      if (err.status === 404) {
        ctx.logger.warn(`Collector ${name} skipped (404, feature/endpoint unavailable)`, {
          detail
        });
        return {
          name,
          status: "skipped",
          requiredScopes,
          errors: [`${detail} — feature not enabled or endpoint unavailable`],
          notes: "Feature may not be enabled for this tenant."
        };
      }
      ctx.logger.error(`Collector ${name} failed`, {
        status: err.status,
        detail
      });
      return {
        name,
        status: "failed",
        requiredScopes,
        errors: [detail]
      };
    }
    // AuthenticationError must propagate; caller decides scan abort.
    throw err;
  }
}

// ----------------------------------------------------------------------------
// Collectors
// ----------------------------------------------------------------------------

export const tenantCollector: CollectorFn<Auth0TenantSettings> = (ctx) =>
  safeCollect("tenant", ["read:tenant_settings"], ctx, async () => {
    const res = await ctx.http.get<Auth0TenantSettings>("/tenants/settings");
    return { data: res.data, count: 1 };
  });

export const clientsCollector: CollectorFn<Auth0ClientResource[]> = (ctx) =>
  safeCollect("clients", ["read:clients"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0ClientResource>("/clients", {
      perPage: 100
    });
    return { data, count: data.length };
  });

export const connectionsCollector: CollectorFn<Auth0Connection[]> = (ctx) =>
  safeCollect("connections", ["read:connections"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0Connection>("/connections", {
      perPage: 100
    });
    return { data, count: data.length };
  });

export const resourceServersCollector: CollectorFn<Auth0ResourceServer[]> = (ctx) =>
  safeCollect("resource_servers", ["read:resource_servers"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0ResourceServer>("/resource-servers", {
      perPage: 100
    });
    return { data, count: data.length };
  });

export const clientGrantsCollector: CollectorFn<Auth0ClientGrant[]> = (ctx) =>
  safeCollect("client_grants", ["read:client_grants"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0ClientGrant>("/client-grants", {
      perPage: 100
    });
    return { data, count: data.length };
  });

export const usersCollector: CollectorFn<Auth0UserSummary[]> = (ctx) =>
  safeCollect("users", ["read:users"], ctx, async () => {
    // PII-light summary only: do NOT collect user_metadata/app_metadata.
    const data = await ctx.http.getAllPages<Auth0UserSummary>("/users", {
      perPage: 50,
      maxPages: 4, // bounded; full export is out of MVP scope
      query: {
        fields: "user_id,email,blocked,email_verified,created_at,last_login,multifactor",
        include_fields: true,
        sort: "created_at:-1"
      }
    });
    return {
      data,
      count: data.length,
      notes: "Bounded summary (max 200 users, last-created first). Full user export is out of scope."
    };
  });

export const rolesCollector: CollectorFn<Auth0Role[]> = (ctx) =>
  safeCollect("roles", ["read:roles"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0Role>("/roles", { perPage: 100 });
    return { data, count: data.length };
  });

export const rolePermissionsCollector = async (
  ctx: CollectorContext,
  roles: Auth0Role[]
): Promise<CollectorResult<Auth0RolePermission[]>> =>
  safeCollect("role_permissions", ["read:roles"], ctx, async () => {
    const all: Auth0RolePermission[] = [];
    for (const role of roles) {
      try {
        const perms = await ctx.http.getAllPages<{
          permission_name: string;
          resource_server_identifier: string;
        }>(`/roles/${encodeURIComponent(role.id)}/permissions`, { perPage: 100 });
        for (const p of perms) {
          all.push({
            role_id: role.id,
            permission_name: p.permission_name,
            resource_server_identifier: p.resource_server_identifier
          });
        }
      } catch (err) {
        if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
          // Skip this role's permissions; continue.
          continue;
        }
        throw err;
      }
    }
    return { data: all, count: all.length };
  });

export const actionsCollector: CollectorFn<Auth0Action[]> = (ctx) =>
  safeCollect("actions", ["read:actions"], ctx, async () => {
    // The /actions/actions endpoint does not support `include_totals`;
    // omit the parameter entirely to avoid invalid_query_string errors.
    const data = await ctx.http.getAllPages<Auth0Action>("/actions/actions", {
      perPage: 100,
      itemsKey: "actions",
      omitIncludeTotals: true
    });
    return { data, count: data.length };
  });

export const rulesCollector: CollectorFn<Auth0Rule[]> = (ctx) =>
  safeCollect("rules", ["read:rules"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0Rule>("/rules", { perPage: 100 });
    return { data, count: data.length };
  });

export const hooksCollector: CollectorFn<Auth0Hook[]> = (ctx) =>
  safeCollect("hooks", ["read:hooks"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0Hook>("/hooks", { perPage: 50 });
    return { data, count: data.length };
  });

export const organizationsCollector: CollectorFn<Auth0Organization[]> = (ctx) =>
  safeCollect("organizations", ["read:organizations"], ctx, async () => {
    const data = await ctx.http.getAllPages<Auth0Organization>("/organizations", {
      perPage: 50
    });
    return { data, count: data.length };
  });

export const logStreamsCollector: CollectorFn<Auth0LogStream[]> = (ctx) =>
  safeCollect("log_streams", ["read:log_streams"], ctx, async () => {
    const res = await ctx.http.get<Auth0LogStream[]>("/log-streams");
    const data = Array.isArray(res.data) ? res.data : [];
    return { data, count: data.length };
  });

export const attackProtectionCollector: CollectorFn<Auth0AttackProtection> = (ctx) =>
  safeCollect(
    "attack_protection",
    [
      "read:attack_protection",
      "read:brute_force_protection",
      "read:breached_passwords",
      "read:suspicious_ip_throttling"
    ],
    ctx,
    async () => {
      const result: Auth0AttackProtection = {};
      // Each subresource may individually 403/404; tolerate per-subresource.
      for (const [path, key] of [
        ["/attack-protection/breached-password-detection", "breached_password_detection"],
        ["/attack-protection/brute-force-protection", "brute_force_protection"],
        ["/attack-protection/suspicious-ip-throttling", "suspicious_ip_throttling"]
      ] as const) {
        try {
          const res = await ctx.http.get<Record<string, unknown>>(path);
          (result as Record<string, unknown>)[key] = res.data;
        } catch (err) {
          if (err instanceof HttpError && (err.status === 403 || err.status === 404)) {
            ctx.logger.warn(`attack_protection sub-endpoint ${path} skipped`, {
              status: err.status
            });
            continue;
          }
          throw err;
        }
      }
      return { data: result, count: Object.keys(result).length };
    }
  );

export const brandingCollector: CollectorFn<Auth0Branding> = (ctx) =>
  safeCollect("branding", ["read:branding"], ctx, async () => {
    const res = await ctx.http.get<Auth0Branding>("/branding");
    return { data: res.data, count: 1 };
  });

export const promptsCollector: CollectorFn<Auth0Prompt> = (ctx) =>
  safeCollect("prompts", ["read:prompts"], ctx, async () => {
    const res = await ctx.http.get<Auth0Prompt>("/prompts");
    return { data: res.data, count: 1 };
  });

export const customDomainsCollector: CollectorFn<Auth0CustomDomain[]> = (ctx) =>
  safeCollect("custom_domains", ["read:custom_domains"], ctx, async () => {
    const res = await ctx.http.get<Auth0CustomDomain[]>("/custom-domains");
    const data = Array.isArray(res.data) ? res.data : [];
    return { data, count: data.length };
  });

export const guardianCollector: CollectorFn<Auth0Guardian> = (ctx) =>
  safeCollect(
    "guardian",
    ["read:guardian_factors", "read:mfa_policies"],
    ctx,
    async () => {
      const result: Auth0Guardian = {};
      try {
        const policies = await ctx.http.get<string[]>("/guardian/policies");
        result.policy = Array.isArray(policies.data)
          ? (policies.data[0] as Auth0Guardian["policy"]) ?? "never"
          : undefined;
      } catch (err) {
        if (!(err instanceof HttpError && (err.status === 403 || err.status === 404))) {
          throw err;
        }
      }
      try {
        const factors = await ctx.http.get<Array<{ name: string; enabled?: boolean }>>(
          "/guardian/factors"
        );
        result.factors = Array.isArray(factors.data) ? factors.data : [];
      } catch (err) {
        if (!(err instanceof HttpError && (err.status === 403 || err.status === 404))) {
          throw err;
        }
      }
      return { data: result, count: 1 };
    }
  );

export const logsCollector: CollectorFn<Auth0LogEvent[]> = (ctx) =>
  safeCollect("logs", ["read:logs"], ctx, async () => {
    // Recent security-relevant events. Bounded for safety in MVP.
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const data = await ctx.http.getAllPages<Auth0LogEvent>("/logs", {
      perPage: 100,
      maxPages: 3,
      query: {
        q: `date:[${since} TO *] AND (type:fp OR type:fpoe OR type:fpos OR type:limit_wc OR type:limit_mu OR type:fnte OR type:fbpa)`,
        sort: "date:-1"
      }
    });
    return {
      data,
      count: data.length,
      notes: "Bounded recent log search (last 7 days, up to 300 events)."
    };
  });

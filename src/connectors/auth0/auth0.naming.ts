/**
 * Resource name formatting helpers.
 *
 * Reports prefer human-readable names; we keep IDs as a short, traceable
 * suffix where useful so engineers can still find the resource in the
 * Auth0 dashboard or via Management API.
 */

import {
  Auth0Client,
  Auth0ClientGrant,
  Auth0Connection,
  Auth0ResourceServer,
  Auth0TenantSnapshot
} from "./auth0.types";

const AUTH0_MGMT_API_RE =
  /^https:\/\/[a-z0-9.-]+\/api\/v2\/?$/i;

export function isManagementApiIdentifier(identifier: string | undefined): boolean {
  if (!identifier) return false;
  return AUTH0_MGMT_API_RE.test(identifier.trim());
}

export function shortId(id: string | undefined, len: number = 8): string {
  if (!id) return "";
  if (id.length <= len + 3) return id;
  return id.slice(0, len) + "…";
}

export function formatClientName(client: Auth0Client | undefined): string {
  if (!client) return "(unknown client)";
  return `${client.name} (${shortId(client.client_id)})`;
}

export function formatResourceServerName(
  rs: Auth0ResourceServer | undefined
): string {
  if (!rs) return "(unknown API)";
  if (isManagementApiIdentifier(rs.identifier)) {
    return `Auth0 Management API — ${rs.identifier}`;
  }
  return `${rs.name} — ${rs.identifier}`;
}

export function formatConnectionName(c: Auth0Connection | undefined): string {
  if (!c) return "(unknown connection)";
  return `${c.name} (${c.strategy})`;
}

export function formatClientGrantName(
  grant: Auth0ClientGrant,
  clientLookup: Map<string, Auth0Client>,
  rsLookup: Map<string, Auth0ResourceServer>
): string {
  const client = clientLookup.get(grant.client_id);
  const rs = rsLookup.get(grant.audience);
  const clientPart = client
    ? `${client.name} (${shortId(client.client_id)})`
    : `${shortId(grant.client_id, 12)}`;
  const rsPart = rs
    ? formatResourceServerName(rs)
    : isManagementApiIdentifier(grant.audience)
      ? `Auth0 Management API — ${grant.audience}`
      : grant.audience;
  return `${clientPart} → ${rsPart}`;
}

export function buildClientLookup(
  snapshot: Auth0TenantSnapshot
): Map<string, Auth0Client> {
  const m = new Map<string, Auth0Client>();
  for (const c of snapshot.clients ?? []) m.set(c.client_id, c);
  return m;
}

export function buildResourceServerLookup(
  snapshot: Auth0TenantSnapshot
): Map<string, Auth0ResourceServer> {
  const m = new Map<string, Auth0ResourceServer>();
  for (const r of snapshot.resourceServers ?? []) m.set(r.identifier, r);
  return m;
}

/**
 * Heuristic: are these scopes high-impact (write/delete/admin/create)?
 * Used for management-API grant severity calibration.
 */
export function classifyMgmtScopes(scopes: string[]): {
  total: number;
  sensitive: number;
  topSensitive: string[];
} {
  const total = scopes.length;
  const SENSITIVE_PREFIXES = ["create:", "update:", "delete:", "write:"];
  const SENSITIVE_TOKENS = ["admin", "users", "clients", "secrets", "keys"];
  const sensitiveSet = scopes.filter(
    (s) =>
      SENSITIVE_PREFIXES.some((p) => s.startsWith(p)) ||
      SENSITIVE_TOKENS.some((t) => s.includes(t))
  );
  return {
    total,
    sensitive: sensitiveSet.length,
    topSensitive: sensitiveSet.slice(0, 8)
  };
}

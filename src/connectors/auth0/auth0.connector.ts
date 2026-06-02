/**
 * Auth0 connector orchestration.
 *
 * Runs collectors, aggregates results, redacts sensitive fields, and emits a
 * stable Auth0TenantSnapshot.
 *
 * Failed (or skipped) non-core collectors do NOT crash the scan. Only an
 * authentication failure (401) aborts.
 */

import { CollectorFailure, CollectorResult, ResourceCoverage } from "../../core/schema";
import { Logger } from "../../core/logger";
import { Auth0Client } from "./auth0.client";
import * as collectors from "./auth0.collectors";
import { redact } from "./auth0.redaction";
import { Auth0TenantSnapshot } from "./auth0.types";

export const CONNECTOR_VERSION = "0.1.0";

export interface RunAuth0ConnectorOptions {
  domain: string;
  token: string;
  logger: Logger;
  fetchImpl?: typeof fetch;
  /** When false, the users collector is skipped entirely. Default: true (PII-light summary). */
  includeUsers?: boolean;
  /** When false, the logs collector is skipped. Default: true. */
  includeLogs?: boolean;
  /**
   * When true, collect Rules and Hooks (legacy extensibility) and report them
   * as EOL migration risk if present. Rules and Hooks are NOT collected by
   * default because they are excluded from the default Actions & Extensibility
   * score and are expected to be absent on migrated tenants.
   */
  includeLegacyExtensibility?: boolean;
}

export async function runAuth0Connector(
  options: RunAuth0ConnectorOptions
): Promise<Auth0TenantSnapshot> {
  const { logger } = options;
  const http = new Auth0Client({
    domain: options.domain,
    token: options.token,
    logger,
    fetchImpl: options.fetchImpl
  });

  const ctx = { http, logger };
  const includeUsers = options.includeUsers ?? true;
  const includeLogs = options.includeLogs ?? true;
  const includeLegacyExtensibility = options.includeLegacyExtensibility ?? false;

  const allResults: CollectorResult[] = [];
  const failedCollectors: CollectorFailure[] = [];
  const missingScopes = new Set<string>();

  const recordResult = (r: CollectorResult): void => {
    allResults.push(r);
    if (r.status === "failed" || r.status === "partial") {
      failedCollectors.push({
        collector: r.name,
        status: r.status,
        reason: r.errors?.join("; ") ?? "unknown"
      });
    }
    if (r.status === "skipped") {
      failedCollectors.push({
        collector: r.name,
        status: r.status,
        reason: r.errors?.join("; ") ?? "skipped",
        missingScopes: r.missingScopes
      });
    }
    if (r.missingScopes) {
      for (const s of r.missingScopes) missingScopes.add(s);
    }
  };

  // Tenant first: serves as effective probe. AuthenticationError will throw.
  logger.info("Collecting tenant settings...");
  const tenantRes = await collectors.tenantCollector(ctx);
  recordResult(tenantRes);

  // Run remaining collectors. They each handle their own 403/404.
  logger.info("Collecting clients...");
  const clientsRes = await collectors.clientsCollector(ctx);
  recordResult(clientsRes);

  logger.info("Collecting connections...");
  const connectionsRes = await collectors.connectionsCollector(ctx);
  recordResult(connectionsRes);

  logger.info("Collecting resource servers (APIs)...");
  const resourceServersRes = await collectors.resourceServersCollector(ctx);
  recordResult(resourceServersRes);

  logger.info("Collecting client grants...");
  const clientGrantsRes = await collectors.clientGrantsCollector(ctx);
  recordResult(clientGrantsRes);

  logger.info("Collecting roles...");
  const rolesRes = await collectors.rolesCollector(ctx);
  recordResult(rolesRes);

  let permissionsRes: CollectorResult<unknown> | undefined;
  if (rolesRes.status === "success" && rolesRes.data && Array.isArray(rolesRes.data)) {
    logger.info("Collecting role permissions...");
    permissionsRes = await collectors.rolePermissionsCollector(ctx, rolesRes.data);
    recordResult(permissionsRes);
  }

  logger.info("Collecting actions...");
  const actionsRes = await collectors.actionsCollector(ctx);
  recordResult(actionsRes);

  let rulesRes: CollectorResult<unknown> | undefined;
  let hooksRes: CollectorResult<unknown> | undefined;
  if (includeLegacyExtensibility) {
    logger.info("Collecting rules (legacy, --include-legacy-extensibility)...");
    rulesRes = await collectors.rulesCollector(ctx);
    recordResult(rulesRes);

    logger.info("Collecting hooks (legacy, --include-legacy-extensibility)...");
    hooksRes = await collectors.hooksCollector(ctx);
    recordResult(hooksRes);
  }

  logger.info("Collecting organizations...");
  const orgsRes = await collectors.organizationsCollector(ctx);
  recordResult(orgsRes);

  logger.info("Collecting log streams...");
  const logStreamsRes = await collectors.logStreamsCollector(ctx);
  recordResult(logStreamsRes);

  logger.info("Collecting attack protection...");
  const attackRes = await collectors.attackProtectionCollector(ctx);
  recordResult(attackRes);

  logger.info("Collecting branding...");
  const brandingRes = await collectors.brandingCollector(ctx);
  recordResult(brandingRes);

  logger.info("Collecting prompts (Universal Login)...");
  const promptsRes = await collectors.promptsCollector(ctx);
  recordResult(promptsRes);

  logger.info("Collecting custom domains...");
  const customDomainsRes = await collectors.customDomainsCollector(ctx);
  recordResult(customDomainsRes);

  logger.info("Collecting guardian (MFA)...");
  const guardianRes = await collectors.guardianCollector(ctx);
  recordResult(guardianRes);

  let usersRes: CollectorResult<unknown> | undefined;
  if (includeUsers) {
    logger.info("Collecting users (bounded summary)...");
    usersRes = await collectors.usersCollector(ctx);
    recordResult(usersRes);
  }

  let logsRes: CollectorResult<unknown> | undefined;
  if (includeLogs) {
    logger.info("Collecting recent logs (bounded)...");
    logsRes = await collectors.logsCollector(ctx);
    recordResult(logsRes);
  }

  const coverage: ResourceCoverage[] = allResults.map((r) => ({
    collector: r.name,
    status: r.status,
    count: r.count,
    requiredScopes: r.requiredScopes,
    missingScopes: r.missingScopes,
    notes: r.notes
  }));

  const partial =
    failedCollectors.length > 0 || allResults.some((r) => r.status !== "success");

  // Build snapshot, then deep-redact.
  const rawSnapshot: Auth0TenantSnapshot = {
    metadata: {
      provider: "auth0",
      domain: options.domain,
      collectedAt: new Date().toISOString(),
      connectorVersion: CONNECTOR_VERSION,
      partial,
      missingScopes: Array.from(missingScopes).sort(),
      failedCollectors
    },
    tenant: tenantRes.status === "success" ? (tenantRes.data as Auth0TenantSnapshot["tenant"]) : undefined,
    clients: pickArray(clientsRes),
    connections: pickArray(connectionsRes),
    resourceServers: pickArray(resourceServersRes),
    clientGrants: pickArray(clientGrantsRes),
    users: pickArray(usersRes),
    roles: pickArray(rolesRes),
    permissions: pickArray(permissionsRes),
    actions: pickArray(actionsRes),
    rules: rulesRes ? pickArray(rulesRes) : undefined,
    hooks: hooksRes ? pickArray(hooksRes) : undefined,
    organizations: pickArray(orgsRes),
    logStreams: pickArray(logStreamsRes),
    attackProtection:
      attackRes.status === "success" ? (attackRes.data as Auth0TenantSnapshot["attackProtection"]) : undefined,
    branding: brandingRes.status === "success" ? (brandingRes.data as Auth0TenantSnapshot["branding"]) : undefined,
    prompts: promptsRes.status === "success" ? (promptsRes.data as Auth0TenantSnapshot["prompts"]) : undefined,
    customDomains: pickArray(customDomainsRes),
    guardian:
      guardianRes.status === "success" ? (guardianRes.data as Auth0TenantSnapshot["guardian"]) : undefined,
    logs: pickArray(logsRes),
    coverage
  };

  return redact(rawSnapshot);
}

function pickArray<T>(r: CollectorResult<unknown> | undefined): T[] | undefined {
  if (!r) return undefined;
  if (r.status !== "success" && r.status !== "partial") return undefined;
  return Array.isArray(r.data) ? (r.data as T[]) : undefined;
}

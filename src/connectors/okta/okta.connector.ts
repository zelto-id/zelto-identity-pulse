import { Logger } from "../../core/logger";
import { CollectorFailure, CollectorResult, ResourceCoverage } from "../../core/schema";
import { OktaClient } from "./okta.client";
import * as collectors from "./okta.collectors";
import { redactOktaObject } from "./okta.redaction";
import {
  OktaAuthMode,
  OktaCollectionOptions,
  OktaOrgSnapshot,
  OktaUserCollectionMode
} from "./okta.types";

export const CONNECTOR_VERSION = "0.1.0";

export interface RunOktaConnectorOptions {
  orgUrl: string;
  authMode: OktaAuthMode;
  token: string;
  logger: Logger;
  fetchImpl?: typeof fetch;
  includeUsers?: OktaUserCollectionMode;
  maxUsers?: number;
  includeSystemLog?: boolean;
  systemLogDays?: number;
  maxLogs?: number;
}

export async function runOktaConnector(
  options: RunOktaConnectorOptions
): Promise<OktaOrgSnapshot> {
  const http = new OktaClient({
    orgUrl: options.orgUrl,
    authMode: options.authMode,
    token: options.token,
    logger: options.logger,
    fetchImpl: options.fetchImpl
  });

  const includeUsers = options.includeUsers ?? "bounded";
  const maxUsers = includeUsers === "full" ? Number.MAX_SAFE_INTEGER : options.maxUsers ?? 500;
  const includeSystemLog = options.includeSystemLog ?? true;
  const systemLogDays = options.systemLogDays ?? 7;
  const maxLogs = options.maxLogs ?? 1000;

  const collectionOptions: OktaCollectionOptions = {
    includeUsers,
    maxUsers: includeUsers === "none" ? undefined : maxUsers,
    includeSystemLog,
    systemLogDays: includeSystemLog ? systemLogDays : undefined,
    maxLogs: includeSystemLog ? maxLogs : undefined
  };

  const ctx = {
    http,
    logger: options.logger,
    authMode: options.authMode
  };

  const allResults: CollectorResult[] = [];
  const failedCollectors: CollectorFailure[] = [];
  const missingScopes = new Set<string>();

  const recordResult = (result: CollectorResult): void => {
    allResults.push(result);
    if (result.status === "failed" || result.status === "partial") {
      failedCollectors.push({
        collector: result.name,
        status: result.status,
        reason: result.errors?.join("; ") ?? "unknown",
        missingScopes: result.missingScopes
      });
    }
    if (result.status === "skipped") {
      failedCollectors.push({
        collector: result.name,
        status: result.status,
        reason: result.errors?.join("; ") ?? "skipped",
        missingScopes: result.missingScopes
      });
    }
    for (const scope of result.missingScopes ?? []) {
      missingScopes.add(scope);
    }
  };

  options.logger.info("Collecting Okta org settings...");
  const orgRes = await collectors.orgCollector(ctx);
  recordResult(orgRes);

  options.logger.info("Collecting Okta features...");
  const featuresRes = await collectors.featuresCollector(ctx);
  recordResult(featuresRes);

  let usersRes: CollectorResult<unknown> | undefined;
  if (includeUsers !== "none") {
    options.logger.info("Collecting Okta users...");
    usersRes = await collectors.usersCollector(maxUsers)(ctx);
    recordResult(usersRes);
  } else {
    recordResult(
      skippedCollectorResult(
        "users",
        ["okta.users.read"],
        "Skipped by collection option (--include-users none)."
      )
    );
  }

  options.logger.info("Collecting Okta groups...");
  const groupsRes = await collectors.groupsCollector(ctx);
  recordResult(groupsRes);

  options.logger.info("Collecting Okta group rules...");
  const groupRulesRes = await collectors.groupRulesCollector(ctx);
  recordResult(groupRulesRes);

  options.logger.info("Collecting Okta apps...");
  const appsRes = await collectors.appsCollector(ctx);
  recordResult(appsRes);

  options.logger.info("Collecting Okta policies...");
  const policiesRes = await collectors.policiesCollector(ctx);
  recordResult(policiesRes);

  options.logger.info("Collecting Okta authenticators...");
  const authenticatorsRes = await collectors.authenticatorsCollector(ctx);
  recordResult(authenticatorsRes);

  options.logger.info("Collecting Okta authorization servers...");
  const authServersRes = await collectors.authorizationServersCollector(ctx);
  recordResult(authServersRes);

  options.logger.info("Collecting Okta admin roles...");
  const adminRolesRes = await collectors.adminRolesCollector(ctx);
  recordResult(adminRolesRes);

  options.logger.info("Collecting Okta network zones...");
  const networkZonesRes = await collectors.networkZonesCollector(ctx);
  recordResult(networkZonesRes);

  options.logger.info("Collecting Okta trusted origins...");
  const trustedOriginsRes = await collectors.trustedOriginsCollector(ctx);
  recordResult(trustedOriginsRes);

  options.logger.info("Collecting Okta identity providers...");
  const idpsRes = await collectors.idpsCollector(ctx);
  recordResult(idpsRes);

  options.logger.info("Collecting Okta event hooks...");
  const eventHooksRes = await collectors.eventHooksCollector(ctx);
  recordResult(eventHooksRes);

  options.logger.info("Collecting Okta inline hooks...");
  const inlineHooksRes = await collectors.inlineHooksCollector(ctx);
  recordResult(inlineHooksRes);

  options.logger.info("Collecting Okta log streams...");
  const logStreamsRes = await collectors.logStreamsCollector(ctx);
  recordResult(logStreamsRes);

  options.logger.info("Collecting Okta domains...");
  const domainsRes = await collectors.domainsCollector(ctx);
  recordResult(domainsRes);

  let systemLogRes: CollectorResult<unknown> | undefined;
  if (includeSystemLog) {
    options.logger.info("Collecting Okta system log summary...");
    systemLogRes = await collectors.systemLogCollector(systemLogDays, maxLogs)(ctx);
    recordResult(systemLogRes);
  } else {
    recordResult(
      skippedCollectorResult(
        "system_log",
        ["okta.logs.read"],
        "Skipped by collection option (--include-system-log false)."
      )
    );
  }

  const coverage: ResourceCoverage[] = allResults.map((result) => ({
    collector: result.name,
    status: result.status,
    count: result.count,
    requiredScopes: result.requiredScopes,
    missingScopes: result.missingScopes,
    notes: result.notes
  }));

  const partial =
    failedCollectors.length > 0 || allResults.some((result) => result.status !== "success");

  const authServerData =
    (authServersRes.status === "success" || authServersRes.status === "partial") &&
    authServersRes.data &&
    typeof authServersRes.data === "object"
      ? (authServersRes.data as {
          servers?: unknown[];
          scopes?: unknown[];
          claims?: unknown[];
          policies?: unknown[];
        })
      : undefined;

  const rawSnapshot: OktaOrgSnapshot = {
    metadata: {
      provider: "okta",
      product: "workforce",
      orgUrl: options.orgUrl,
      collectedAt: new Date().toISOString(),
      connectorVersion: CONNECTOR_VERSION,
      authMode: options.authMode,
      partial,
      missingScopes: Array.from(missingScopes).sort(),
      failedCollectors,
      collectionOptions
    },
    org: pickObject(orgRes),
    features: pickArray(featuresRes),
    users: pickArray(usersRes),
    groups: pickArray(groupsRes),
    groupRules: pickArray(groupRulesRes),
    apps: pickArray(appsRes),
    policies: pickObject(policiesRes),
    authenticators: pickArray(authenticatorsRes),
    authorizationServers: Array.isArray(authServerData?.servers) ? (authServerData?.servers as OktaOrgSnapshot["authorizationServers"]) : undefined,
    authorizationServerScopes: Array.isArray(authServerData?.scopes) ? (authServerData?.scopes as OktaOrgSnapshot["authorizationServerScopes"]) : undefined,
    authorizationServerClaims: Array.isArray(authServerData?.claims) ? (authServerData?.claims as OktaOrgSnapshot["authorizationServerClaims"]) : undefined,
    authorizationServerPolicies: Array.isArray(authServerData?.policies) ? (authServerData?.policies as OktaOrgSnapshot["authorizationServerPolicies"]) : undefined,
    adminRoles: pickArray(adminRolesRes),
    networkZones: pickArray(networkZonesRes),
    trustedOrigins: pickArray(trustedOriginsRes),
    idps: pickArray(idpsRes),
    eventHooks: pickArray(eventHooksRes),
    inlineHooks: pickArray(inlineHooksRes),
    logStreams: pickArray(logStreamsRes),
    domains: pickArray(domainsRes),
    systemLog: pickObject(systemLogRes),
    coverage
  };

  return redactOktaObject(rawSnapshot);
}

function pickArray<T>(result: CollectorResult<unknown> | undefined): T[] | undefined {
  if (
    !result ||
    (result.status !== "success" && result.status !== "partial") ||
    !Array.isArray(result.data)
  ) {
    return undefined;
  }
  return result.data as T[];
}

function pickObject<T>(result: CollectorResult<unknown> | undefined): T | undefined {
  if (
    !result ||
    (result.status !== "success" && result.status !== "partial") ||
    !result.data ||
    Array.isArray(result.data)
  ) {
    return undefined;
  }
  return result.data as T;
}

function skippedCollectorResult(
  name: string,
  requiredScopes: string[],
  reason: string
): CollectorResult<undefined> {
  return {
    name,
    status: "skipped",
    requiredScopes,
    errors: [reason],
    notes: reason
  };
}

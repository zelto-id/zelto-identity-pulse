import { beforeEach, describe, expect, it, vi } from "vitest";

const { usersCollectorMock, systemLogCollectorMock } = vi.hoisted(() => ({
  usersCollectorMock: vi.fn(),
  systemLogCollectorMock: vi.fn()
}));

vi.mock("../../src/connectors/okta/okta.collectors", () => {
  const successArray = (name: string) => async () => ({
    name,
    status: "success" as const,
    requiredScopes: [],
    data: [],
    count: 0
  });
  const successObject = (name: string, data: Record<string, unknown>) => async () => ({
    name,
    status: "success" as const,
    requiredScopes: [],
    data,
    count: 1
  });

  usersCollectorMock.mockImplementation(() => successArray("users"));
  systemLogCollectorMock.mockImplementation(() => successObject("system_log", {}));

  return {
    orgCollector: successObject("org", {}),
    featuresCollector: successArray("features"),
    usersCollector: usersCollectorMock,
    groupsCollector: successArray("groups"),
    groupRulesCollector: successArray("group_rules"),
    appsCollector: successArray("apps"),
    policiesCollector: successObject("policies", {
      all: [],
      globalSessionPolicies: [],
      passwordPolicies: [],
      authenticatorEnrollmentPolicies: [],
      appSignInPolicies: [],
      unknownTypePolicies: []
    }),
    authenticatorsCollector: successArray("authenticators"),
    authorizationServersCollector: successObject("authorization_servers", {
      servers: [],
      scopes: [],
      claims: [],
      policies: []
    }),
    adminRolesCollector: successArray("admin_roles"),
    networkZonesCollector: successArray("network_zones"),
    trustedOriginsCollector: successArray("trusted_origins"),
    idpsCollector: successArray("idps"),
    eventHooksCollector: successArray("event_hooks"),
    inlineHooksCollector: successArray("inline_hooks"),
    logStreamsCollector: successArray("log_streams"),
    domainsCollector: successArray("domains"),
    systemLogCollector: systemLogCollectorMock
  };
});

import { runOktaConnector } from "../../src/connectors/okta/okta.connector";

const logger = {
  info() {},
  warn() {},
  error() {}
};

describe("okta connector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records skipped key collectors when users and system log are disabled", async () => {
    const snapshot = await runOktaConnector({
      orgUrl: "https://example.okta.com",
      authMode: "oauth",
      token: "token",
      logger: logger as any,
      includeUsers: "none",
      includeSystemLog: false
    });

    expect(snapshot.metadata.partial).toBe(true);
    expect(snapshot.coverage.find((item) => item.collector === "users")?.status).toBe("skipped");
    expect(snapshot.coverage.find((item) => item.collector === "system_log")?.status).toBe(
      "skipped"
    );
    expect(snapshot.metadata.failedCollectors.some((item) => item.collector === "users")).toBe(
      true
    );
    expect(snapshot.metadata.failedCollectors.some((item) => item.collector === "system_log")).toBe(
      true
    );
    expect(usersCollectorMock).not.toHaveBeenCalled();
    expect(systemLogCollectorMock).not.toHaveBeenCalled();
  });
});

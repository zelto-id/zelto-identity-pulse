import { describe, expect, it } from "vitest";
import { HttpError } from "../../src/core/errors";
import {
  adminRolesCollector,
  appsCollector,
  authorizationServersCollector,
  policiesCollector,
  usersCollector
} from "../../src/connectors/okta/okta.collectors";

const logger = {
  info() {},
  warn() {},
  error() {}
};

describe("okta collectors", () => {
  it("returns partial users data when per-user group enrichment is unavailable", async () => {
    const result = await usersCollector(100)({
      authMode: "oauth",
      logger: logger as any,
      http: {
        getAllPages: async (path: string) => {
          if (path === "/api/v1/users") {
            return [{ id: "u1", status: "ACTIVE", profile: { email: "a@example.com" } }];
          }
          throw new Error(`unexpected path ${path}`);
        },
        get: async (path: string) => {
          if (path === "/api/v1/users/u1/groups") {
            throw new HttpError(403, "denied");
          }
          throw new Error(`unexpected path ${path}`);
        }
      } as any
    });

    expect(result.status).toBe("partial");
    expect(result.data).toHaveLength(1);
    expect(result.errors?.join(" ")).toMatch(/group membership/i);
  });

  it("returns partial app data when assignment sampling is unavailable", async () => {
    const result = await appsCollector({
      authMode: "oauth",
      logger: logger as any,
      http: {
        getAllPages: async (path: string) => {
          if (path === "/api/v1/apps") {
            return [{ id: "a1", label: "Portal", status: "ACTIVE", signOnMode: "SAML_2_0", settings: { app: {} } }];
          }
          throw new Error(`unexpected path ${path}`);
        },
        get: async (path: string) => {
          if (path === "/api/v1/apps/a1/users" || path === "/api/v1/apps/a1/groups") {
            throw new HttpError(403, "denied");
          }
          throw new Error(`unexpected path ${path}`);
        }
      } as any
    });

    expect(result.status).toBe("partial");
    expect(result.data).toHaveLength(1);
    expect(result.errors?.join(" ")).toMatch(/assignment sampling/i);
  });

  it("returns partial authorization server data when subordinate visibility is unavailable", async () => {
    const result = await authorizationServersCollector({
      authMode: "oauth",
      logger: logger as any,
      http: {
        getAllPages: async (path: string) => {
          if (path === "/api/v1/authorizationServers") {
            return [{ id: "as1", name: "default" }];
          }
          if (
            path === "/api/v1/authorizationServers/as1/scopes" ||
            path === "/api/v1/authorizationServers/as1/claims" ||
            path === "/api/v1/authorizationServers/as1/policies"
          ) {
            throw new HttpError(403, "denied");
          }
          throw new Error(`unexpected path ${path}`);
        }
      } as any
    });

    expect(result.status).toBe("partial");
    expect(result.data?.servers[0]?.policyVisibilityLimited).toBe(true);
    expect(result.errors?.join(" ")).toMatch(/authorization server/i);
  });

  it("returns partial policies data when policy rules are unavailable", async () => {
    const result = await policiesCollector({
      authMode: "oauth",
      logger: logger as any,
      http: {
        getAllPages: async (path: string) => {
          if (path === "/api/v1/policies") {
            return [{ id: "p1", name: "Policy", type: "OKTA_SIGN_ON", status: "ACTIVE" }];
          }
          if (path === "/api/v1/policies/p1/rules") {
            throw new HttpError(403, "denied");
          }
          throw new Error(`unexpected path ${path}`);
        }
      } as any
    });

    expect(result.status).toBe("partial");
    expect(result.data?.all).toHaveLength(1);
    expect(result.errors?.join(" ")).toMatch(/rules for policy/i);
  });

  it("returns partial admin role data when only some principal types are visible", async () => {
    const result = await adminRolesCollector({
      authMode: "oauth",
      logger: logger as any,
      http: {
        getAllPages: async (path: string) => {
          if (path === "/api/v1/iam/assignees/users") {
            return [{ id: "u1", role: { type: "SUPER_ADMIN" } }];
          }
          if (path === "/api/v1/iam/assignees/groups" || path === "/api/v1/iam/assignees/clients") {
            throw new HttpError(403, "denied");
          }
          throw new Error(`unexpected path ${path}`);
        }
      } as any
    });

    expect(result.status).toBe("partial");
    expect(result.data).toHaveLength(1);
    expect(result.errors?.join(" ")).toMatch(/GROUP|CLIENT/);
  });
});

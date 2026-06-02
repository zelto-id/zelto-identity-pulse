import { describe, expect, it } from "vitest";
import { redactOktaObject } from "../../src/connectors/okta/okta.redaction";

describe("okta redaction", () => {
  it("redacts obvious secrets and auth headers", () => {
    const redacted = redactOktaObject({
      authorization: "SSWS 00abc123456789012345678901234567890",
      client_secret: "super-secret-value",
      nested: {
        privateKey: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----"
      }
    });

    expect(redacted.authorization).toMatch(/\[REDACTED:sha256:/);
    expect(redacted.client_secret).toMatch(/\[REDACTED:sha256:/);
    expect(redacted.nested.privateKey).toMatch(/\[REDACTED:sha256:/);
  });

  it("preserves stable public identifiers", () => {
    const redacted = redactOktaObject({
      id: "00u123",
      profile: {
        login: "alice@example.com"
      }
    });

    expect(redacted.id).toBe("00u123");
    expect(redacted.profile.login).toBe("alice@example.com");
  });

  it("preserves structured policy and log fields under sensitive-looking keys", () => {
    const redacted = redactOktaObject({
      policies: {
        globalSessionPolicies: [
          {
            settings: {
              password: {
                minLength: 12
              }
            },
            actions: {
              token: {
                accessTokenLifetimeMinutes: 60
              }
            }
          }
        ]
      },
      systemLog: {
        eventTypeCounts: {
          "user.session.start": 4,
          "app.oauth2.token.grant.access_token": 2
        }
      }
    });

    expect(redacted.policies.globalSessionPolicies[0].settings.password.minLength).toBe(12);
    expect(redacted.policies.globalSessionPolicies[0].actions.token.accessTokenLifetimeMinutes).toBe(60);
    expect(redacted.systemLog.eventTypeCounts["user.session.start"]).toBe(4);
    expect(redacted.systemLog.eventTypeCounts["app.oauth2.token.grant.access_token"]).toBe(2);
  });
});

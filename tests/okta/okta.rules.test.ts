import { describe, expect, it } from "vitest";
import { runAllOktaRules } from "../../src/analysis/okta/okta.rules";
import { OktaOrgSnapshot } from "../../src/connectors/okta/okta.types";

function makeSnapshot(overrides: Partial<OktaOrgSnapshot> = {}): OktaOrgSnapshot {
  return {
    metadata: {
      provider: "okta",
      product: "workforce",
      orgUrl: "https://example.okta.com",
      collectedAt: "2026-05-18T00:00:00.000Z",
      connectorVersion: "0.1.0",
      authMode: "oauth",
      partial: false,
      missingScopes: [],
      failedCollectors: [],
      collectionOptions: {
        includeUsers: "bounded",
        maxUsers: 500,
        includeSystemLog: true,
        systemLogDays: 7,
        maxLogs: 1000
      }
    },
    coverage: [],
    ...overrides
  };
}

describe("okta rules", () => {
  it("flags deeper workforce posture issues from structured Okta evidence", () => {
    const findings = runAllOktaRules(
      makeSnapshot({
        apps: [
          {
            id: "app1",
            label: "Portal",
            status: "ACTIVE",
            assignmentModel: "direct",
            sampledDirectUserAssignments: 25,
            sampledGroupAssignments: 0,
            settings: {
              oauthClient: {
                grant_types: ["authorization_code"],
                redirect_uris: ["https://portal.example/callback"]
              }
            }
          }
        ],
        users: [
          {
            id: "00u1",
            status: "ACTIVE",
            created: "2026-01-01T00:00:00.000Z",
            profile: { email: "admin@example.com" },
            hasGroupMembership: false
          }
        ],
        policies: {
          all: [],
          globalSessionPolicies: [
            {
              id: "pol1",
              name: "Global Session",
              status: "ACTIVE",
              rules: [
                {
                  id: "rule1",
                  status: "ACTIVE",
                  actions: { signon: { access: "ALLOW" } },
                  conditions: { network: { connection: "ANYWHERE" } }
                }
              ]
            }
          ],
          passwordPolicies: [
            {
              id: "pwd1",
              name: "Password",
              status: "ACTIVE",
              settings: {
                password: {
                  complexity: { minLength: 8 },
                  history: { count: 4 }
                }
              },
              rules: [
                {
                  id: "pwd-rule",
                  status: "ACTIVE",
                  actions: {
                    selfServicePasswordReset: {
                      requirement: {
                        primary: {
                          methods: ["email"]
                        }
                      }
                    }
                  }
                }
              ]
            }
          ],
          authenticatorEnrollmentPolicies: [
            {
              id: "mfa1",
              name: "MFA Enrollment",
              status: "ACTIVE",
              settings: {
                factors: {
                  okta_sms: { enroll: { self: "OPTIONAL" } },
                  okta_verify: { enroll: { self: "OPTIONAL" } }
                }
              },
              rules: [{ id: "mfa-rule", status: "ACTIVE" }]
            }
          ],
          appSignInPolicies: [],
          unknownTypePolicies: []
        },
        authenticators: [{ id: "auth1", key: "okta_sms", status: "ACTIVE" }],
        authorizationServers: [{ id: "as1", name: "default", status: "ACTIVE" }],
        authorizationServerPolicies: [
          {
            authorizationServerId: "as1",
            id: "ap1",
            status: "ACTIVE",
            rules: [
              {
                id: "ap-rule",
                status: "ACTIVE",
                conditions: {
                  scopes: { include: ["*"] },
                  grantTypes: {
                    include: ["authorization_code", "urn:ietf:params:oauth:grant-type:jwt-bearer"]
                  }
                },
                actions: {
                  token: {
                    accessTokenLifetimeMinutes: 120
                  }
                }
              }
            ]
          }
        ],
        adminRoles: [],
        networkZones: [{ id: "zone1", name: "HQ", status: "ACTIVE", type: "IP" }],
        trustedOrigins: [],
        systemLog: {
          queryWindow: {
            since: "2026-05-11T00:00:00.000Z",
            until: "2026-05-18T00:00:00.000Z",
            maxEvents: 1000
          },
          totalCollected: 2,
          eventTypeCounts: {
            "user.session.access_admin_app": 1
          },
          outcomeCounts: {
            SUCCESS: 2
          },
          actorTypeCounts: {
            User: 2
          },
          notableEvents: [
            {
              uuid: "evt1",
              published: "2026-05-18T00:00:00.000Z",
              eventType: "user.session.access_admin_app",
              outcome: "SUCCESS",
              actor: { id: "00u1", type: "User" }
            }
          ]
        }
      })
    );

    const ids = new Set(findings.map((finding) => finding.id));
    expect(ids.has("OKTA-APP-003")).toBe(true);
    expect(ids.has("OKTA-APP-004")).toBe(true);
    expect(ids.has("OKTA-POL-003")).toBe(true);
    expect(ids.has("OKTA-POL-004")).toBe(true);
    expect(ids.has("OKTA-POL-005")).toBe(true);
    expect(ids.has("OKTA-POL-002")).toBe(true);
    expect(ids.has("OKTA-API-002")).toBe(true);
    expect(ids.has("OKTA-API-003")).toBe(true);
    expect(ids.has("OKTA-API-004")).toBe(true);
    expect(ids.has("OKTA-ADM-003")).toBe(true);
    expect(ids.has("OKTA-ADM-004")).toBe(true);
    expect(ids.has("OKTA-USR-002")).toBe(true);
    expect(ids.has("OKTA-USR-003")).toBe(true);
    expect(ids.has("OKTA-NET-002")).toBe(true);
    expect(ids.has("OKTA-NET-003")).toBe(true);
  });

  it("masks inactive user identifiers by default and reveals them when requested", () => {
    const snapshot = makeSnapshot({
      users: [
        {
          id: "00u1",
          status: "ACTIVE",
          created: "2026-01-01T00:00:00.000Z",
          profile: { email: "alice@example.com" }
        }
      ]
    });

    const maskedFinding = runAllOktaRules(snapshot).find((finding) => finding.id === "OKTA-USR-002");
    const fullFinding = runAllOktaRules(snapshot, { includeIdentifiers: true }).find(
      (finding) => finding.id === "OKTA-USR-002"
    );

    expect(maskedFinding?.evidence).toContain("a...@example.com");
    expect(maskedFinding?.evidence).not.toContain("alice@example.com");
    expect(fullFinding?.evidence).toContain("alice@example.com");
  });

  it("deduplicates repeated app labels in broad assignment findings", () => {
    const findings = runAllOktaRules(
      makeSnapshot({
        apps: [
          {
            id: "app1",
            label: "Agent0",
            status: "ACTIVE",
            signOnMode: "SAML_2_0",
            assignmentModel: "mixed",
            sampledDirectUserAssignments: 25,
            sampledGroupAssignments: 1,
            settings: { app: {} }
          },
          {
            id: "app2",
            label: "Agent0",
            status: "ACTIVE",
            signOnMode: "SAML_2_0",
            assignmentModel: "mixed",
            sampledDirectUserAssignments: 25,
            sampledGroupAssignments: 1,
            settings: { app: {} }
          }
        ]
      })
    );

    const finding = findings.find((item) => item.id === "OKTA-APP-004");
    expect(finding?.affectedResources).toEqual(["Agent0 (2 apps)"]);
    expect(finding?.affectedResourceCount).toBe(2);
    expect(finding?.evidence).toContain("class=business app");
  });

  it("uses partial-aware coverage guidance when degraded collection is not a missing-scope failure", () => {
    const findings = runAllOktaRules(
      makeSnapshot({
        metadata: {
          ...makeSnapshot().metadata,
          partial: true,
          failedCollectors: [
            {
              collector: "admin_roles",
              status: "partial",
              reason: "GROUP admin role assignments were unavailable."
            }
          ]
        }
      })
    );

    const finding = findings.find((item) => item.id === "OKTA-COV-001");
    expect(finding?.evidence).toContain("Partial collectors: admin_roles (partial).");
    expect(finding?.recommendation).toContain("Review the listed partial collectors");
    expect(finding?.recommendation).not.toContain("missing read scopes");
  });
});

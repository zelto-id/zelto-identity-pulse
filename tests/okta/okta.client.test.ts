import { describe, expect, it } from "vitest";
import { createLogger } from "../../src/core/logger";
import {
  OktaClient,
  buildOktaAuthorizationHeader,
  normalizeOktaOrgUrl,
  parseNextLink
} from "../../src/connectors/okta/okta.client";

describe("okta client helpers", () => {
  it("normalizes org URLs and rejects non-https", () => {
    expect(normalizeOktaOrgUrl("https://example.okta.com/")).toBe("https://example.okta.com");
    expect(() => normalizeOktaOrgUrl("http://example.okta.com")).toThrow(/https/i);
  });

  it("builds auth headers for both modes", () => {
    expect(buildOktaAuthorizationHeader("oauth", "abc")).toBe("Bearer abc");
    expect(buildOktaAuthorizationHeader("ssws", "abc")).toBe("SSWS abc");
  });

  it("parses next links and follows paginated responses", async () => {
    const responses = [
      new Response(JSON.stringify([{ id: "one" }]), {
        status: 200,
        headers: {
          link: '<https://example.okta.com/api/v1/users?after=abc>; rel="next"'
        }
      }),
      new Response(JSON.stringify([{ id: "two" }]), { status: 200 })
    ];

    const client = new OktaClient({
      orgUrl: "https://example.okta.com",
      authMode: "oauth",
      token: "token",
      logger: createLogger({ verbose: false }),
      fetchImpl: async () => responses.shift() as Response
    });

    expect(parseNextLink('<https://example.okta.com/next>; rel="next"')).toBe(
      "https://example.okta.com/next"
    );

    const items = await client.getAllPages<{ id: string }>("/api/v1/users");
    expect(items.map((item) => item.id)).toEqual(["one", "two"]);
  });
});

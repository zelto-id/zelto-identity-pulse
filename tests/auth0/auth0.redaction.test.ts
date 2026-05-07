import { describe, expect, it } from "vitest";
import {
  isSensitiveKey,
  looksLikeSecretValue,
  redact,
  redactTokenForDisplay
} from "../../src/connectors/auth0/auth0.redaction";

describe("redaction", () => {
  it("identifies sensitive keys", () => {
    expect(isSensitiveKey("client_secret")).toBe(true);
    expect(isSensitiveKey("password")).toBe(true);
    expect(isSensitiveKey("api_key")).toBe(true);
    expect(isSensitiveKey("private_key")).toBe(true);
    expect(isSensitiveKey("Authorization")).toBe(true);
    expect(isSensitiveKey("name")).toBe(false);
    expect(isSensitiveKey("email")).toBe(false);
  });

  it("identifies secret-like values", () => {
    expect(looksLikeSecretValue("-----BEGIN RSA PRIVATE KEY-----\nabc")).toBe(true);
    expect(
      looksLikeSecretValue(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      )
    ).toBe(true);
    expect(looksLikeSecretValue("hello")).toBe(false);
  });

  it("redacts sensitive keys deeply", () => {
    const input = {
      name: "ok",
      client_secret: "supersecret-value-1234567890",
      nested: {
        password: "p@ssw0rd!",
        ok: "leave-me",
        webhook_secret: "abc"
      },
      list: [{ token: "t1" }, { ok: 1 }]
    };
    const out = redact(input) as typeof input;
    expect(out.name).toBe("ok");
    expect(out.client_secret).toMatch(/^\[REDACTED:sha256:/);
    expect(out.nested.password).toMatch(/^\[REDACTED:sha256:/);
    expect(out.nested.ok).toBe("leave-me");
    expect(out.nested.webhook_secret).toMatch(/^\[REDACTED:sha256:/);
    expect((out.list[0] as { token: string }).token).toMatch(/^\[REDACTED:sha256:/);
  });

  it("redacts secret-shaped strings even under non-sensitive keys", () => {
    const input = {
      note: "-----BEGIN PRIVATE KEY-----\nabc"
    };
    const out = redact(input) as typeof input;
    expect(out.note).toMatch(/^\[REDACTED:sha256:/);
  });

  it("does not modify the original object", () => {
    const input = { client_secret: "abc" };
    const before = JSON.stringify(input);
    redact(input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("redactTokenForDisplay shows at most 6 leading and 4 trailing chars", () => {
    const t = "abcdefghijklmnopqrstuvwxyz1234567890";
    const r = redactTokenForDisplay(t);
    expect(r.startsWith("abcdef")).toBe(true);
    expect(r.endsWith("7890")).toBe(true);
    expect(r).not.toContain("ghijklmnop");
  });
});

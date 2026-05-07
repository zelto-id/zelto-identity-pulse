/**
 * Redaction utilities.
 *
 * The connector treats the following as ALWAYS redacted:
 *   - tokens (access/refresh/id/bearer)
 *   - client_secret, secrets, passwords, api_key
 *   - signing keys, private keys, certificates (private material)
 *   - webhook authorization headers
 *   - SCIM bearer tokens
 *   - things that look like a long bearer token or PEM private key
 *
 * Redaction is non-reversible. We replace the value with a deterministic
 * marker so diffs across snapshots remain meaningful without leaking secrets.
 */

import { createHash } from "crypto";

const SENSITIVE_KEY_PATTERNS: RegExp[] = [
  /(^|_|\.)secret($|_|\.)/i,
  /(^|_|\.)password($|_|\.)/i,
  /(^|_|\.)passwd($|_|\.)/i,
  /(^|_|\.)token($|_|\.)/i,
  /(^|_|\.)access_token($|_|\.)/i,
  /(^|_|\.)refresh_token($|_|\.)/i,
  /(^|_|\.)id_token($|_|\.)/i,
  /(^|_|\.)bearer($|_|\.)/i,
  /(^|_|\.)api[_-]?key($|_|\.)/i,
  /(^|_|\.)apikey($|_|\.)/i,
  /(^|_|\.)private[_-]?key($|_|\.)/i,
  /(^|_|\.)signing[_-]?key($|_|\.)/i,
  /(^|_|\.)client[_-]?secret($|_|\.)/i,
  /authorization/i,
  /webhook[_-]?secret/i,
  /scim[_-]?token/i
];

// Heuristics for opaque secret-like values.
const PRIVATE_KEY_RE = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const LONG_BEARER_RE = /^[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}$/; // JWT-ish
const LONG_OPAQUE_RE = /^[A-Za-z0-9_\-]{60,}$/;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((re) => re.test(key));
}

export function looksLikeSecretValue(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value.length === 0) return false;
  if (PRIVATE_KEY_RE.test(value)) return true;
  if (LONG_BEARER_RE.test(value)) return true;
  if (LONG_OPAQUE_RE.test(value)) return true;
  return false;
}

export function redactValue(value: unknown): string {
  let s: string;
  if (typeof value === "string") {
    s = value;
  } else {
    try {
      s = JSON.stringify(value);
    } catch {
      s = String(value);
    }
  }
  const hash = createHash("sha256").update(s).digest("hex").slice(0, 12);
  return `[REDACTED:sha256:${hash}]`;
}

/**
 * Recursively redact a value. Pure (returns a new object).
 *
 * - Redacts entire value when the property key is sensitive.
 * - Redacts strings that look like secrets even under non-sensitive keys.
 */
export function redact<T>(value: T): T {
  return redactInternal(value, "") as T;
}

function redactInternal(value: unknown, key: string): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redactInternal(item, key));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(k)) {
        out[k] = v === null || v === undefined ? v : redactValue(v);
      } else {
        out[k] = redactInternal(v, k);
      }
    }
    return out;
  }

  if (typeof value === "string") {
    if (isSensitiveKey(key)) return redactValue(value);
    if (looksLikeSecretValue(value)) return redactValue(value);
    return value;
  }

  return value;
}

/**
 * Redact a token for safe display. Shows at most 6 leading and 4 trailing chars.
 */
export function redactTokenForDisplay(token: string): string {
  if (!token) return "[empty]";
  if (token.length <= 12) return "[REDACTED]";
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

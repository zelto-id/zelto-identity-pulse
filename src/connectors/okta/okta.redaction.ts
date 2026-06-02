import { createHash } from "crypto";

const SENSITIVE_KEY_PATTERNS: RegExp[] = [
  /(^|_|\.)secret($|_|\.)/i,
  /(^|_|\.)password($|_|\.)/i,
  /(^|_|\.)passcode($|_|\.)/i,
  /(^|_|\.)token($|_|\.)/i,
  /(^|_|\.)access_token($|_|\.)/i,
  /(^|_|\.)refresh_token($|_|\.)/i,
  /(^|_|\.)id_token($|_|\.)/i,
  /^authorization$/i,
  /cookie/i,
  /session/i,
  /(^|_|\.)sid($|_|\.)/i,
  /(^|_|\.)private[_-]?key($|_|\.)/i,
  /(^|_|\.)client[_-]?secret($|_|\.)/i,
  /(^|_|\.)shared[_-]?secret($|_|\.)/i,
  /(^|_|\.)credentials($|_|\.)/i,
  /(^|_|\.)api[_-]?key($|_|\.)/i
];

const PRIVATE_KEY_RE = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const JWTISH_RE = /^[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}$/;
const OPAQUE_TOKEN_RE = /^[A-Za-z0-9_\-]{60,}$/;
const SSWS_RE = /^SSWS\s+[A-Za-z0-9._-]{20,}$/i;
const BEARER_RE = /^Bearer\s+[A-Za-z0-9._-]{20,}$/i;

export function isSensitiveOktaKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((re) => re.test(key));
}

export function looksLikeSensitiveOktaValue(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  return (
    PRIVATE_KEY_RE.test(value) ||
    JWTISH_RE.test(value) ||
    OPAQUE_TOKEN_RE.test(value) ||
    SSWS_RE.test(value) ||
    BEARER_RE.test(value)
  );
}

function redactValue(value: unknown): string {
  let source: string;
  if (typeof value === "string") {
    source = value;
  } else {
    try {
      source = JSON.stringify(value);
    } catch {
      source = String(value);
    }
  }
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 12);
  return `[REDACTED:sha256:${hash}]`;
}

export function redactOktaObject<T>(input: T): T {
  return redactInternal(input, "") as T;
}

function redactInternal(value: unknown, key: string): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactInternal(item, key));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveOktaKey(childKey)) {
        if (typeof childValue === "string" || looksLikeSensitiveOktaValue(childValue)) {
          out[childKey] = redactValue(childValue);
        } else {
          out[childKey] = redactInternal(childValue, childKey);
        }
      } else {
        out[childKey] = redactInternal(childValue, childKey);
      }
    }
    return out;
  }
  if (typeof value === "string") {
    if (isSensitiveOktaKey(key) || looksLikeSensitiveOktaValue(value)) {
      return redactValue(value);
    }
    return value;
  }
  return value;
}

import { AuthenticationError, HttpError } from "../../core/errors";
import { Logger } from "../../core/logger";
import { OktaAuthMode } from "./okta.types";

export interface OktaClientOptions {
  orgUrl: string;
  authMode: OktaAuthMode;
  token: string;
  logger: Logger;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
  userAgent?: string;
}

export interface OktaApiResponse<T> {
  status: number;
  headers: Headers;
  data: T;
  requestId?: string;
  rateLimit?: OktaRateLimitInfo;
}

export interface OktaRateLimitInfo {
  limit?: number;
  remaining?: number;
  resetEpochSeconds?: number;
}

export function normalizeOktaOrgUrl(input: string): string {
  if (!input) throw new Error("OktaClient: orgUrl is required");
  const trimmed = input.trim().replace(/\/+$/, "");
  const url = new URL(trimmed);
  if (url.protocol !== "https:") {
    throw new Error("OktaClient: orgUrl must use https");
  }
  return `${url.protocol}//${url.host}`;
}

export function buildOktaAuthorizationHeader(
  authMode: OktaAuthMode,
  token: string
): string {
  return authMode === "ssws" ? `SSWS ${token}` : `Bearer ${token}`;
}

export function parseNextLink(linkHeader: string | null): string | undefined {
  if (!linkHeader) return undefined;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="([^"]+)"/i);
    if (match && match[2].toLowerCase() === "next") {
      return match[1];
    }
  }
  return undefined;
}

export class OktaClient {
  private readonly baseUrl: string;
  private readonly authMode: OktaAuthMode;
  private readonly token: string;
  private readonly logger: Logger;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent: string;

  constructor(options: OktaClientOptions) {
    if (!options.token) throw new Error("OktaClient: token is required");
    this.baseUrl = normalizeOktaOrgUrl(options.orgUrl);
    this.authMode = options.authMode;
    this.token = options.token;
    this.logger = options.logger;
    this.maxRetries = options.maxRetries ?? 5;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.userAgent = options.userAgent ?? "zelto-identity-pulse/0.1 (okta-connector)";
  }

  async get<T = unknown>(
    pathOrUrl: string,
    options: {
      query?: Record<string, string | number | boolean | undefined>;
      collectorName?: string;
    } = {}
  ): Promise<OktaApiResponse<T>> {
    const url = this.buildUrl(pathOrUrl, options.query);
    let attempt = 0;
    let lastErr: unknown;

    while (attempt <= this.maxRetries) {
      try {
        const res = await this.fetchImpl(url, {
          method: "GET",
          headers: {
            Authorization: buildOktaAuthorizationHeader(this.authMode, this.token),
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": this.userAgent
          }
        });

        if (res.status === 401) {
          throw new AuthenticationError(
            "Okta Management API returned 401 Unauthorized. Token is invalid, expired, or for the wrong org."
          );
        }

        if (res.status === 429) {
          const wait = parseRetryDelayMs(res.headers, attempt);
          this.logger.warn(`Okta rate limited (429). Retrying in ${wait}ms`, {
            pathOrUrl,
            collector: options.collectorName,
            attempt
          });
          if (attempt >= this.maxRetries) {
            throw new HttpError(429, "Rate limited (exhausted retries)", {
              retryAfterMs: wait
            });
          }
          await sleep(wait);
          attempt++;
          continue;
        }

        if (res.status >= 500 && res.status < 600) {
          const wait = backoffMs(attempt);
          this.logger.warn(`Okta ${res.status}. Retrying in ${wait}ms`, {
            pathOrUrl,
            collector: options.collectorName,
            attempt
          });
          if (attempt >= this.maxRetries) {
            throw new HttpError(res.status, `Okta server error after ${attempt} retries`);
          }
          await sleep(wait);
          attempt++;
          continue;
        }

        if (res.status < 200 || res.status >= 300) {
          let body: unknown = undefined;
          try {
            body = await res.json();
          } catch {
            body = undefined;
          }
          throw new HttpError(res.status, `Okta returned ${res.status} for ${pathOrUrl}`, {
            details: typeof body === "object" ? (body as Record<string, unknown>) : { body }
          });
        }

        let data: unknown = null;
        const text = await res.text();
        if (text.length > 0) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
        return {
          status: res.status,
          headers: res.headers,
          data: data as T,
          requestId: res.headers.get("x-okta-request-id") ?? undefined,
          rateLimit: {
            limit: numberOrUndefined(res.headers.get("x-rate-limit-limit")),
            remaining: numberOrUndefined(res.headers.get("x-rate-limit-remaining")),
            resetEpochSeconds: numberOrUndefined(res.headers.get("x-rate-limit-reset"))
          }
        };
      } catch (err) {
        if (err instanceof AuthenticationError) throw err;
        if (err instanceof HttpError) throw err;
        lastErr = err;
        if (attempt >= this.maxRetries) break;
        const wait = backoffMs(attempt);
        this.logger.warn(`Okta network error. Retrying in ${wait}ms`, {
          pathOrUrl,
          collector: options.collectorName,
          attempt,
          error: (err as Error)?.message
        });
        await sleep(wait);
        attempt++;
      }
    }

    throw new HttpError(0, `Okta request failed: ${(lastErr as Error)?.message ?? "unknown"}`);
  }

  async getAllPages<T = unknown>(
    initialPath: string,
    options: {
      query?: Record<string, string | number | boolean | undefined>;
      maxItems?: number;
      collectorName?: string;
    } = {}
  ): Promise<T[]> {
    const items: T[] = [];
    let nextUrl: string | undefined = this.buildUrl(initialPath, options.query);

    while (nextUrl) {
      const response = await this.get<T[] | Record<string, unknown>>(nextUrl, {
        collectorName: options.collectorName
      });
      const pageItems = normalizeOktaPageItems<T>(response.data);
      items.push(...pageItems);

      if (options.maxItems && items.length >= options.maxItems) {
        return items.slice(0, options.maxItems);
      }

      nextUrl = parseNextLink(response.headers.get("link"));
    }

    return items;
  }

  buildUrl(
    pathOrUrl: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? new URL(pathOrUrl)
      : new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }
}

export function normalizeOktaPageItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    for (const key of ["items", "results", "data", "logs", "events"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

function parseRetryDelayMs(headers: Headers, attempt: number): number {
  const reset = headers.get("x-rate-limit-reset");
  if (reset) {
    const resetEpoch = Number(reset);
    if (!Number.isNaN(resetEpoch)) {
      const ms = resetEpoch * 1000 - Date.now();
      if (ms > 0) return Math.min(ms + 500, 60000);
    }
  }
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, 60000);
  }
  return backoffMs(attempt);
}

function backoffMs(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 30000);
  const jitter = 250 + Math.floor(Math.random() * 750);
  return base + jitter;
}

function numberOrUndefined(value: string | null): number | undefined {
  if (value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

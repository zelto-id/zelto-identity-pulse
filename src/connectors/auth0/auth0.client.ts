/**
 * Auth0 Management API HTTP client.
 *
 * - Read-only (GET only).
 * - Bearer token from caller; never logged, never persisted.
 * - Retry/backoff on 429 and 5xx.
 * - Surfaces 401/403/404 to caller for graceful handling.
 * - Offset pagination helper.
 */

import { HttpError, AuthenticationError } from "../../core/errors";
import { Logger } from "../../core/logger";

export interface Auth0HttpClientOptions {
  domain: string;
  token: string;
  logger: Logger;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
  userAgent?: string;
}

export interface Auth0Response<T> {
  status: number;
  data: T;
  headers: Headers;
}

export class Auth0Client {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly logger: Logger;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent: string;

  constructor(opts: Auth0HttpClientOptions) {
    if (!opts.domain) throw new Error("Auth0Client: domain is required");
    if (!opts.token) throw new Error("Auth0Client: token is required");
    this.baseUrl = `https://${opts.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}/api/v2`;
    this.token = opts.token;
    this.logger = opts.logger;
    this.maxRetries = opts.maxRetries ?? 5;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.userAgent = opts.userAgent ?? "zelto-identity-pulse/0.1 (auth0-connector)";
  }

  /**
   * Issue a GET request. Throws HttpError for unexpected statuses.
   * 401 throws AuthenticationError so callers can stop the scan early.
   */
  async get<T = unknown>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<Auth0Response<T>> {
    const url = this.buildUrl(path, query);

    let attempt = 0;
    let lastErr: unknown;

    while (attempt <= this.maxRetries) {
      try {
        const res = await this.fetchImpl(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
            "User-Agent": this.userAgent
          }
        });

        if (res.status === 401) {
          throw new AuthenticationError(
            "Auth0 Management API returned 401 Unauthorized. Token is invalid, expired, or for the wrong tenant."
          );
        }

        if (res.status === 429) {
          const wait = parseRetryDelayMs(res.headers, attempt);
          this.logger.warn(`Auth0 rate limited (429). Retrying in ${wait}ms`, { path, attempt });
          if (attempt >= this.maxRetries) {
            throw new HttpError(429, "Rate limited (exhausted retries)", { retryAfterMs: wait });
          }
          await sleep(wait);
          attempt++;
          continue;
        }

        if (res.status >= 500 && res.status < 600) {
          const wait = backoffMs(attempt);
          this.logger.warn(`Auth0 ${res.status}. Retrying in ${wait}ms`, { path, attempt });
          if (attempt >= this.maxRetries) {
            throw new HttpError(res.status, `Auth0 server error after ${attempt} retries`);
          }
          await sleep(wait);
          attempt++;
          continue;
        }

        if (res.status < 200 || res.status >= 300) {
          // Surface 4xx (e.g. 403/404) to caller without retry.
          let body: unknown = undefined;
          try {
            body = await res.json();
          } catch {
            body = undefined;
          }
          throw new HttpError(res.status, `Auth0 returned ${res.status} for ${path}`, {
            details: typeof body === "object" ? (body as Record<string, unknown>) : { body }
          });
        }

        const data = (await res.json()) as T;
        return { status: res.status, data, headers: res.headers };
      } catch (err) {
        if (err instanceof AuthenticationError) throw err;
        if (err instanceof HttpError) throw err;
        // Network error: retry with backoff
        lastErr = err;
        if (attempt >= this.maxRetries) break;
        const wait = backoffMs(attempt);
        this.logger.warn(`Auth0 network error. Retrying in ${wait}ms`, {
          path,
          attempt,
          error: (err as Error)?.message
        });
        await sleep(wait);
        attempt++;
      }
    }

    throw new HttpError(0, `Auth0 request failed: ${(lastErr as Error)?.message ?? "unknown"}`);
  }

  /**
   * Collect all pages using offset pagination (page/per_page).
   */
  async getAllPages<T = unknown>(
    path: string,
    options: {
      perPage?: number;
      maxPages?: number;
      query?: Record<string, string | number | boolean | undefined>;
      itemsKey?: string; // when response is wrapped: { clients: [...], total }
      /**
       * When true, the `include_totals` query parameter is NOT sent at all.
       * Use for endpoints (e.g. /actions/actions) that reject the parameter
       * with `invalid_query_string`.
       */
      omitIncludeTotals?: boolean;
    } = {}
  ): Promise<T[]> {
    const perPage = options.perPage ?? 100;
    const maxPages = options.maxPages ?? 50;
    const items: T[] = [];

    for (let page = 0; page < maxPages; page++) {
      const pageQuery: Record<string, string | number | boolean | undefined> = {
        ...options.query,
        page,
        per_page: perPage
      };
      if (!options.omitIncludeTotals) {
        pageQuery.include_totals = false;
      }
      const res = await this.get<unknown>(path, pageQuery);

      const body = res.data;
      let pageItems: T[];
      if (Array.isArray(body)) {
        pageItems = body as T[];
      } else if (
        body &&
        typeof body === "object" &&
        options.itemsKey &&
        Array.isArray((body as Record<string, unknown>)[options.itemsKey])
      ) {
        pageItems = (body as Record<string, unknown>)[options.itemsKey] as T[];
      } else {
        // Unknown shape; stop.
        break;
      }

      items.push(...pageItems);
      if (pageItems.length < perPage) break;
    }

    return items;
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }
}

function backoffMs(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 30000);
  const jitter = 250 + Math.floor(Math.random() * 750);
  return base + jitter;
}

function parseRetryDelayMs(headers: Headers, attempt: number): number {
  const reset = headers.get("x-ratelimit-reset");
  if (reset) {
    const resetSec = Number(reset);
    if (!Number.isNaN(resetSec)) {
      const ms = resetSec * 1000 - Date.now();
      if (ms > 0) return Math.min(ms + 500, 60000);
    }
  }
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const sec = Number(retryAfter);
    if (!Number.isNaN(sec)) return Math.min(sec * 1000, 60000);
  }
  return backoffMs(attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

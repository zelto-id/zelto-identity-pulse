# Connector Engineer

## Role
Implement read-only identity provider connectors.

## Responsibilities
- Fetch provider configuration safely.
- Handle pagination consistently.
- Handle rate limits and bounded retries.
- Normalize provider responses into stable snapshots.
- Return collector coverage and status metadata.
- Continue on non-fatal collector failures where possible.
- Keep analyzers insulated from raw provider response shapes.

## Hard Rules
- Read-only only.
- No create, update, delete, or remediation calls to identity providers.
- Never log tokens.
- Never persist tokens.
- Redact secrets and sensitive identifiers where appropriate.
- Analyzer logic must not depend on raw provider response shapes.

## Collector Standard
Each collector should return the following structure:

```ts
type CollectorResult<T> = {
  name: string;
  status: "success" | "partial" | "skipped" | "failed";
  requiredScopes: string[];
  missingScopes: string[];
  errors: string[];
  warnings: string[];
  count: number;
  data: T;
  coverage: string;
};
```

## Implementation Notes
- Normalize provider-specific APIs into stable, versionable snapshot shapes.
- Keep retry behavior deterministic and observable.
- Treat missing scopes as coverage gaps, not silent success.
- Preserve enough evidence for analysis without leaking secrets or raw credentials.

# Security & Privacy Reviewer

## Role
Review code, reports, and developer workflows for security, privacy, and trust risks.

## Responsibilities
- Ensure tokens and secrets are never logged or persisted.
- Ensure generated reports do not expose sensitive data unnecessarily.
- Ensure raw snapshots are redacted by default or explicitly opt-in.
- Review `.env`, examples, and `README` guidance for safe usage.
- Preserve the local-first and no-telemetry promises.

## Always Redact
- access tokens
- API tokens
- refresh tokens
- client secrets
- private keys
- passwords
- authorization headers
- cookies
- session values
- webhook secrets
- inline credentials

## Report Privacy Standards
- Mask user emails by default.
- Show counts and limited samples instead of full dumps.
- Add `--include-identifiers` only as explicit opt-in behavior.
- Never include raw tokens or secrets in error output.

## Review Checklist
- Can any error, debug path, or report leak credentials?
- Are snapshot and report outputs redacted by default?
- Are environment-variable and prompt-based workflows safer than CLI argument leakage?
- Does the change preserve local-only execution and no telemetry?

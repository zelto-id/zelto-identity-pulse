# Security Policy

`zelto-identity-pulse` is security tooling. We treat its security posture as
part of its product surface.

## Local-only by default

- The CLI runs entirely on your machine.
- It reads tenant configuration over HTTPS from the Auth0 Management API only.
- It does **not** upload your tenant configuration, snapshots, secrets, logs,
  reports, or Management API tokens to any external service.
- It does **not** call any AI/LLM provider in the MVP.
- It emits **no telemetry**. No analytics. No phone-home.

## Read-only

- The connector issues `GET` requests only.
- It performs no Auth0 write operations of any kind.
- It does not attempt to revoke or rotate the Management API token.

## Sensitive data handling

- The Management API token is read from `--token` or the `AUTH0_MGMT_API_TOKEN`
  environment variable. Prefer the environment variable to avoid shell
  history / process listing leaks.
- The token is held in process memory only. It is never written to disk and
  never written to logs.
- Snapshots are **redacted** before they are written to disk. We strip values
  for keys that match common secret patterns (`*_secret`, `*token*`, `password`,
  `private_key`, `signing_key`, `api_key`, `authorization`, etc.) and we strip
  string values that look like JWTs or PEM private keys regardless of key.
- Redacted values are replaced with a deterministic, non-reversible marker of
  the form `[REDACTED:sha256:<12 hex chars>]`. This allows snapshot diffs to
  remain meaningful without leaking the secret material.
- Raw Auth0 API responses are **never** saved to disk in the MVP.
- User collection, when enabled, is bounded and limited to non-PII-heavy fields
  (no `user_metadata`, no `app_metadata`).
- Local files written by the CLI are created with owner-only file permissions
  (`0600`) on POSIX systems.

## Threat model assumptions

- The operator is trusted with the Management API token they pass in.
- The host machine running the CLI is trusted; we make no claim of memory
  isolation against other processes on that host.
- The Auth0 Management API is trusted to authenticate and authorize the token
  correctly.
- Output files (`reports/`, `snapshots/`) are protected by host filesystem
  permissions; consumers should treat them as **internal** and review before
  sharing externally.

## Reporting a vulnerability

If you believe you have found a security issue, please **do not** open a public
GitHub issue. Instead:

1. Email the maintainers at `security@zelto.io` (or open a private security
   advisory on the GitHub repository if available).
2. Include a description, reproduction steps, and the impact you observed.
3. Allow a reasonable time for triage and a fix before public disclosure.

We will acknowledge receipt within a few business days, work with you on a fix
and a coordinated disclosure date, and credit you in the release notes if you
wish.

## Scope

In scope:

- The `zelto-pulse` CLI and its connectors, analyzers, and report renderers.
- Default-behavior leakage of secrets, tokens, or raw tenant data.
- Vulnerabilities in our redaction logic.

Out of scope:

- Vulnerabilities in Auth0 or third-party services we call.
- Issues that require an attacker to already control the host running the CLI.
- Issues solely caused by a user passing `--token` directly on the command
  line; we explicitly recommend the environment variable instead.

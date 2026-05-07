# zelto-identity-pulse

**Local-first, open-source CLI for identity-security posture analysis.**
First MVP: Auth0.

`zelto-identity-pulse` connects to an Auth0 tenant using a Management API token,
fetches tenant configuration in **read-only** mode, normalizes it into a local
snapshot, runs deterministic security/maturity rules, scores the tenant, and
generates a markdown report.

> No telemetry. No cloud upload. No write operations. Tokens never persisted.

License: Apache-2.0.

---

## Installation

Requirements: Node.js >= 20, npm.

```bash
git clone https://github.com/<your-org>/zelto-identity-pulse.git
cd zelto-identity-pulse
npm install
npm run build
```

Run the CLI directly from the build:

```bash
node dist/cli/index.js --help
```

Or globally link it for convenience:

```bash
npm link
zelto-pulse --help
```

---

## Auth0 token and scopes

Generate a **Management API access token** for the tenant you want to scan.
The simplest path:

1. In the Auth0 Dashboard, go to **Applications → APIs → Auth0 Management API**.
2. Create a new **Machine-to-Machine application** authorized to call this API.
3. Grant it the read-only scopes listed below.
4. Use the application's client to obtain an `access_token` for
   `https://YOUR_DOMAIN/api/v2/`. Use that token as `AUTH0_MGMT_API_TOKEN`.

### Recommended read-only scopes (baseline)

```
read:tenant_settings
read:clients
read:client_grants
read:connections
read:resource_servers
read:roles
read:actions
read:rules
read:hooks
read:guardian_factors
read:mfa_policies
read:attack_protection
read:branding
read:prompts
read:custom_domains
read:log_streams
read:logs
read:organizations
```

The scanner is **graceful about missing scopes**: a missing scope skips the
relevant collector and is reported in the **Collection Status** section. It
will not silently treat unscanned areas as safe.

---

## Usage

```bash
zelto-pulse scan auth0 \
  --domain example.us.auth0.com \
  --token "$AUTH0_MGMT_API_TOKEN" \
  --output reports/auth0-report.md
```

Or with environment variables (recommended — avoids shell history leaks):

```bash
export AUTH0_DOMAIN=example.us.auth0.com
export AUTH0_MGMT_API_TOKEN=eyJ...
zelto-pulse scan auth0
```

Default behavior:

- Markdown report written to `reports/auth0-report-<timestamp>.md`.
- No snapshot saved unless `--save-snapshot` or `--snapshot-output` is passed.
- Raw API responses are **never** persisted in the MVP.
- The token is never written to disk and never logged.

### Options

| Option | Description |
|---|---|
| `--domain <domain>` | Auth0 tenant domain. Falls back to `AUTH0_DOMAIN`. |
| `--token <token>` | Management API token. Falls back to `AUTH0_MGMT_API_TOKEN`. Prefer the env var. |
| `--output <path>` | Markdown report path. Default: `reports/auth0-report-<ts>.md`. |
| `--snapshot-output <path>` | Snapshot JSON path. Implies `--save-snapshot`. |
| `--save-snapshot` | Save the (redacted) snapshot to `snapshots/auth0-snapshot-<ts>.json`. |
| `--include-raw [bool]` | (MVP no-op) ignored; raw responses are never saved. |
| `--fail-on <severity>` | Exit code 2 if any finding at this severity or higher is present. One of `critical`, `high`, `medium`, `low`. |
| `--verbose` | Verbose logging. |
| `--from-snapshot <path>` | Skip live collection and analyze a previously saved snapshot (useful for fixtures or offline review). |

### Examples

```bash
# Live scan, save snapshot too
zelto-pulse scan auth0 --save-snapshot

# Fail CI if any high-severity finding exists
zelto-pulse scan auth0 --fail-on high

# Re-render a report from a saved snapshot
zelto-pulse scan auth0 --from-snapshot snapshots/auth0-snapshot-2026-05-06.json

# Try the demo with bundled fixtures
zelto-pulse scan auth0 --from-snapshot fixtures/auth0/risky-tenant.snapshot.json
```

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Scan completed |
| 1 | Scan failed (config, auth, or unexpected error) |
| 2 | Scan completed but `--fail-on` threshold matched |

---

## What gets analyzed

Categories (weights sum to 100):

- Tenant Baseline (10)
- Applications / OAuth Clients (15)
- Connections / Identity Sources (15)
- APIs / Resource Servers (10)
- RBAC / Authorization (10)
- Actions & Extensibility (10)
- MFA & Attack Protection (10)
- Monitoring & Log Streams (10)
- Branding & Login Experience (5)
- Organizations / B2B (5)

Critical findings such as legacy Rules/Hooks usage, MFA disabled, attack
protection disabled, or no active log stream **cap the achievable grade**
independently of the numeric score. Partial scans cannot reach grade A.

See [`design/auth0-tenant-check-framework.md`](design/auth0-tenant-check-framework.md)
for the full framework that drives the rules.

---

## Limitations (MVP)

- Auth0 only. Okta WIC and other providers are not in scope yet.
- Markdown report only. No PDF / HTML / DOCX export.
- No persistent workspace, database, or web UI.
- No automatic remediation or write operations.
- No AI-generated commentary in the report.
- Bounded users/logs collection (PII-safe defaults).
- Some fields require Auth0 features that aren't enabled on every tenant; the
  scanner reports those as `skipped` rather than failing.

---

## Development

```bash
npm install
npm run build      # type-check + emit dist/
npm test           # vitest
```

Project layout:

```
src/
  cli/                # commander entry point + commands
  connectors/auth0/   # Auth0 Management API client + collectors + redaction
  analysis/auth0/     # rules, scoring, opportunities, analyzer
  reporting/markdown/ # report types + markdown renderer
  core/               # logger, errors, fs, schema
fixtures/auth0/       # snapshot fixtures used in tests + demos
tests/auth0/          # vitest tests
```

---

## See also

- [`SECURITY.md`](SECURITY.md) — security model, token handling, responsible disclosure.
- [`design/auth0-tenant-check-framework.md`](design/auth0-tenant-check-framework.md) — full scoring framework.
- [`design/auth0-connector-module-design.md`](design/auth0-connector-module-design.md) — connector design notes.
- [`design/zelto-identity-pulse-post-mvp-backlog.md`](design/zelto-identity-pulse-post-mvp-backlog.md) — explicitly-out-of-scope items.
# zelto-identity-pulse
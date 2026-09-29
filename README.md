# zelto-identity-pulse

Local-first, read-only Node.js/TypeScript CLI for identity-security posture assessment.

`zelto-identity-pulse` scans identity-provider configuration, normalizes it into local snapshots, runs deterministic posture analysis, and renders reports for engineers and stakeholders. Current first-class providers are Auth0 / CIAM and Okta Workforce Identity.

No telemetry. No cloud upload. No SaaS backend. No write or remediation operations. Tokens are used only for read-only API calls and are never intentionally persisted.

License: Apache-2.0.

---

## Interactive Presentation Demo

The [Identity Pulse demo](outputs/identity-pulse-demo/README.md) opens with a single Business User or Tech SPOC choice, followed by a tailored workspace. The business workspace leads with NIS2 evidence preparation, priority decisions, action ownership and collection gaps. It includes a sample evidence-pack preview/download, an animated data-flow diagram with explicit stage progress, and a technical API/payload inspector with a first-visit guide using the [Zelto](https://zelto.id/) brand palette.

Open [the offline entry page](outputs/identity-pulse-demo/offline/index.html) in a browser, or share the [demo ZIP](outputs/identity-pulse-demo/identity-pulse-demo.zip). The welcome screen explains the product in one sentence. A clearly explained **Demo scenario** selector switches between security gaps, stronger controls and incomplete assessments. The UI includes Auth0, Okta, Microsoft Entra ID, Ping Identity (PingOne example) and Keycloak. Auth0/Okta scores, findings and coverage come from synthetic repository fixtures; the three additional providers are explicitly labeled illustrative previews with no implemented connector or calculated score. The sample evidence pack is a browser-only mockup, not a CLI export or NIS2 compliance verdict; it distinguishes observed settings from recommendations and unverified remediation. It makes no provider requests and performs no remediation. See the [presentation guide](outputs/identity-pulse-demo/demo-guide.md) and [editable architecture diagrams](outputs/identity-pulse-demo/architecture-diagrams.md).

---

## Current Capabilities

- Auth0 tenant scanning and reporting.
- Okta Workforce org scanning and reporting.
- Markdown, HTML, and structured JSON report output.
- Report Contract v1 JSON with stable finding IDs and fingerprints.
- Provider-agnostic delta comparison between two JSON reports.
- Delta JSON and delta HTML output.
- Combined executive HTML summary across multiple provider JSON reports.
- Optional `zelto-pulse.yml` config for repeatable local scan/report settings.
- Structured business context profile support for deterministic report interpretation and remediation-priority wording.
- Redacted snapshots when snapshot saving is explicitly requested.
- Environment-aware deterministic scoring for `production`, `staging`, `development`, `sandbox`, and `unknown`.

---

## Installation

Requirements: Node.js >= 20 and npm.

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

## Safety Model

- The product is local-first and runs on your machine.
- Connectors use read-only provider API operations.
- Tokens are accepted through environment variables or CLI flags; environment variables are recommended to avoid shell-history leakage.
- Raw provider responses are not persisted by default.
- `--include-raw` remains a no-op in the current MVP.
- User identifiers are masked by default where supported; Okta full identifiers require explicit `--include-identifiers`.
- `zelto-pulse.yml` intentionally rejects likely credential keys such as tokens, secrets, passwords, private keys, authorization headers, cookies, sessions, and credentials.
- Business context in `zelto-pulse.yml` is used only locally for deterministic report interpretation; do not store secrets or confidential credentials in it.

---

## Auth0 Usage

Recommended credential pattern:

```bash
export AUTH0_DOMAIN=example.us.auth0.com
export AUTH0_MGMT_API_TOKEN="$AUTH0_MGMT_API_TOKEN"
zelto-pulse scan auth0 --environment production
```

Direct flags also work, but are less safe for secrets:

```bash
zelto-pulse scan auth0 \
  --domain example.us.auth0.com \
  --token "$AUTH0_MGMT_API_TOKEN" \
  --environment production \
  --format html,json \
  --output reports/auth0-posture.md
```

Analyze an existing local snapshot without live provider access:

```bash
zelto-pulse scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format all
```

### Auth0 Options

| Option | Description |
|---|---|
| `--config <path>` | Load scan/report settings from `zelto-pulse.yml`. |
| `--domain <domain>` | Auth0 tenant domain. Falls back to `AUTH0_DOMAIN`. |
| `--token <token>` | Auth0 Management API token. Falls back to `AUTH0_MGMT_API_TOKEN`. Prefer the env var. |
| `--environment <env>` | `production`, `staging`, `development`, `sandbox`, or `unknown`. |
| `--format <format>` | `markdown`, `html`, `json`, `all`, or comma-separated values such as `html,json`. Default: `markdown`. |
| `--compliance [bool]` | Include opt-in Compliance Evidence Mapping sections and structured JSON compliance mapping. |
| `--framework <frameworks>` | Compliance frameworks to include: `nis2`, `iso27001`, `soc2`, `all`, or comma-separated values. Enables compliance reporting. |
| `--output <path>` | Report output path. When multiple formats are requested, sibling files are created with matching extensions. |
| `--snapshot-output <path>` | Redacted snapshot output path. Implies `--save-snapshot`. |
| `--save-snapshot` | Save a redacted snapshot locally. |
| `--include-raw [bool]` | MVP no-op; raw API responses are never enabled by this flag. |
| `--fail-on <severity>` | Exit with code 2 if any finding at this severity or higher exists. |
| `--from-snapshot <path>` | Skip live collection and analyze a saved snapshot. |
| `--include-legacy-extensibility` | Collect Rules and Hooks and report legacy extensibility risk if present. |
| `--verbose` | Verbose logging. |

### Auth0 Read-Only Scopes

Recommended baseline Auth0 Management API scopes:

```text
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

The scanner is graceful about missing scopes. Missing or failed collectors are reported as coverage gaps instead of being silently treated as safe.

---

## Okta Workforce Usage

Recommended OAuth credential pattern:

```bash
export OKTA_ORG_URL=https://example.okta.com
export OKTA_ACCESS_TOKEN="$OKTA_ACCESS_TOKEN"
zelto-pulse scan okta --auth-mode oauth --environment production
```

SSWS token mode is also supported:

```bash
export OKTA_ORG_URL=https://example.okta.com
export OKTA_API_TOKEN="$OKTA_API_TOKEN"
zelto-pulse scan okta --auth-mode ssws --environment production
```

Analyze an existing local fixture:

```bash
zelto-pulse scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format html,json
```

### Okta Options

| Option | Description |
|---|---|
| `--config <path>` | Load scan/report settings from `zelto-pulse.yml`. |
| `--org-url <url>` | Okta org URL. Falls back to `OKTA_ORG_URL`. |
| `--auth-mode <mode>` | `oauth` or `ssws`. Inferred from available token env vars when omitted. |
| `--access-token <token>` | Okta OAuth token. Falls back to `OKTA_ACCESS_TOKEN`. Prefer the env var. |
| `--api-token <token>` | Okta SSWS token. Falls back to `OKTA_API_TOKEN`. Prefer the env var. |
| `--environment <env>` | `production`, `staging`, `development`, `sandbox`, or `unknown`. |
| `--format <format>` | `markdown`, `html`, `json`, `all`, or comma-separated values. Default: `markdown`. |
| `--compliance [bool]` | Include opt-in Compliance Evidence Mapping sections and structured JSON compliance mapping. |
| `--framework <frameworks>` | Compliance frameworks to include: `nis2`, `iso27001`, `soc2`, `all`, or comma-separated values. Enables compliance reporting. |
| `--output <path>` | Report output path. When multiple formats are requested, sibling files are created with matching extensions. |
| `--snapshot-output <path>` | Redacted snapshot output path. Implies `--save-snapshot`. |
| `--save-snapshot` | Save a redacted snapshot locally. |
| `--include-raw [bool]` | MVP no-op; raw API responses are never enabled by this flag. |
| `--fail-on <severity>` | Exit with code 2 if any finding at this severity or higher exists. |
| `--from-snapshot <path>` | Skip live collection and analyze a saved snapshot. |
| `--include-users <mode>` | `none`, `bounded`, or `full`. Default: `bounded`. |
| `--max-users <number>` | Maximum users to collect in bounded mode. Default: `500`. |
| `--include-system-log [bool]` | Collect bounded System Log summary. Default: `true`. |
| `--system-log-days <number>` | System Log lookback window. Default: `7`. |
| `--max-logs <number>` | Maximum System Log events to summarize. Default: `1000`. |
| `--include-identifiers` | Include full user or principal identifiers instead of masked identifiers. |
| `--verbose` | Verbose logging. |

---

## Report Formats

Scan commands support:

```bash
--format markdown
--format html
--format json
--format html,json
--format all
```

Default scan output is Markdown. JSON output uses Report Contract v1 and is intended for repeatable workflows, CI/CD, evidence packs, combined summaries, and delta comparison.

When `--output reports/example.md --format html,json` is used, the CLI writes:

```text
reports/example.html
reports/example.json
```

---

## Delta Comparison

Compare two structured JSON reports:

```bash
zelto-pulse compare \
  --before reports/before.json \
  --after reports/after.json \
  --format html,json \
  --output reports/delta.json
```

The delta engine:

- compares only reports from the same provider
- matches findings by stable fingerprint
- classifies findings as new, resolved, unchanged, worsened, or improved
- compares overall score, grade, category scores, and coverage changes
- emits deterministic JSON and optional client-readable HTML

With `--format html,json`, sibling files are created:

```text
reports/delta.json
reports/delta.html
```

---

## Combined Executive Summary

Combine multiple Report Contract v1 JSON reports into one local HTML executive summary:

```bash
zelto-pulse summary \
  --reports reports/auth0-posture.json reports/okta-posture.json \
  --output reports/combined-executive-summary.html
```

The summary command:

- reads existing local JSON reports only
- does not contact identity providers
- compares provider posture side by side
- groups repeated risk themes across providers
- produces unified remediation priorities
- keeps provider-specific finding IDs and fingerprints traceable
- redacts secret-like values before rendering HTML

Use this after generating Auth0 and Okta JSON reports with `--format json` or `--format html,json`.

---

## Rule Catalog

Inspect deterministic rule metadata without running a scan:

```bash
zelto-pulse rules list
zelto-pulse rules list --provider auth0
zelto-pulse rules list --provider okta
```

Explain a single rule:

```bash
zelto-pulse rules explain AUTH-CLI-004
zelto-pulse rules explain OKTA-APP-001
```

Rule explanations include provider, category, severity logic, evidence used, confidence logic, remediation guidance, and false-positive notes. Finding IDs in Markdown, HTML, and JSON reports are the same rule IDs used by the catalog, so a report finding can be traced back to deterministic rule metadata.

---

## Compliance and Audit-Readiness Design

The repository includes a conservative identity-control mapping document for future compliance reporting and evidence-pack work:

- [docs/compliance/identity-control-matrix.md](docs/compliance/identity-control-matrix.md)

This document maps Auth0 and Okta identity-system evidence to selected NIS2, SOC 2, and ISO/IEC 27001/27002 control areas. It is a design foundation only; Zelto Identity Pulse does not certify compliance, prove operating effectiveness, or replace auditor judgment.

The codebase also includes a deterministic internal compliance mapping layer under `src/compliance`. It defines machine-readable NIS2, SOC 2, and ISO/IEC 27001/27002 control registries plus finding-to-control mappings for compliance report sections, JSON output extensions, and future evidence packs. These mappings are not rendered unless compliance reporting is explicitly enabled.

Compliance report sections are opt-in so normal technical posture reports stay focused:

```bash
zelto-pulse scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --compliance \
  --framework nis2,soc2
```

When enabled, Markdown and HTML reports include a `Compliance Evidence Mapping` section. JSON reports include a structured `compliance` object derived from the same local Report Contract v1 data. The section separates automated identity evidence from manual evidence requirements and repeats the limitation that the report does not certify compliance or prove operating effectiveness.

---

## Config File

`zelto-pulse.yml` can make recurring scans repeatable. See [zelto-pulse.example.yml](zelto-pulse.example.yml).

Run a config-driven scan:

```bash
zelto-pulse scan --config zelto-pulse.yml
```

Or use config with a provider subcommand:

```bash
zelto-pulse scan auth0 --config zelto-pulse.yml --environment sandbox
```

CLI flags override config values deterministically. Credentials should not be stored in config; use environment variables or prompts instead.

Minimal example:

```yaml
provider: auth0
environment: production

reports:
  format:
    - html
    - json
  output: reports/identity-posture.md

compliance:
  enabled: false
  frameworks:
    - nis2
    - iso27001
    - soc2

masking:
  includeIdentifiers: false
  includeRaw: false

businessContext:
  organizationType: "B2B SaaS"
  environment: production
  industry: healthcare
  regulatedData: true
  identityUseCase: customer-identity
  userPopulation:
    customers: 50000
    workforce: 300
    admins: 15
  criticalApplications:
    - name: "Customer Portal"
      provider: auth0
      businessCriticality: high
      dataSensitivity: regulated
  riskTolerance: standard
  complianceDrivers:
    - SOC2
    - HIPAA
  businessPriorities:
    - "reduce account takeover risk"
    - "improve audit readiness"
  designDecisions:
    - id: auth0-roles-external-by-design
      provider: auth0
      effect: suppress-finding
      decision: "Authorization is managed in the application domain model, not with Auth0 roles."
      rationale: "Product entitlements are evaluated downstream and covered by separate access reviews."
      owner: IAM Architecture
      appliesTo:
        findingIds:
          - AUTH-RBAC-001

auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json
```

Supported config areas include provider selection, environment, output formats, masking options, output paths, business context, bounded Okta collection options, scoring profile metadata, and future baseline settings.

### Business Context Profile

`businessContext` is optional. When present, it is passed into the analyzer and report renderers so reports can explain risk and prioritization in customer terms without using AI-generated assumptions.

Supported fields include:

- `organizationType`
- `environment`
- `industry`
- `regulatedData`
- `identityUseCase`
- `userPopulation`
- `criticalApplications`
- `riskTolerance`
- `complianceDrivers`
- `businessPriorities`
- `designDecisions`

Business context affects deterministic interpretation and remediation-priority wording. It does not change technical evidence, does not send data to external services, and does not enable telemetry. If top-level `environment` is omitted, `businessContext.environment` can provide the scan environment used for environment-aware severity calibration.

Use `designDecisions` for intentional architecture choices that should not be reported as issues. For example, if Auth0 roles are intentionally unused because authorization is managed in the application or an external authorization service, target `AUTH-RBAC-001` with `effect: suppress-finding`. Suppression must target deterministic finding IDs, categories, or keywords; it is not free-form AI interpretation.

---

## Exit Codes

| Code | Meaning |
|---|---|
| 0 | Scan or comparison completed successfully. |
| 1 | Command failed due to config, auth, input, or unexpected error. |
| 2 | Scan completed but `--fail-on` threshold matched. |

---

## What Gets Analyzed

Auth0 categories include tenant baseline, applications/OAuth clients, connections/identity sources, APIs/resource servers, RBAC/authorization, Actions and extensibility, MFA and attack protection, monitoring/log streams, branding/login experience, and organizations/B2B.

Okta categories include org baseline, users and groups, applications, policies, authenticators, admin posture, network/security posture, authorization/logging, and lifecycle/operations coverage where available.

Scoring is deterministic and environment-aware. Missing data reduces coverage/confidence rather than being silently treated as safe. Partial scans cannot imply complete assurance.

---

## Limitations

- Current first-class providers are Auth0 and Okta Workforce only.
- No SaaS backend, hosted dashboard, remote config, or telemetry.
- No database or persistent scan history yet.
- No automatic remediation or provider write operations.
- No PDF or DOCX export.
- No AI-generated findings or default AI narrative.
- Config parsing intentionally supports a constrained YAML subset for the documented `zelto-pulse.yml` shape, not arbitrary YAML.
- Okta user and System Log collection use bounded defaults to reduce privacy and runtime risk.
- Reports are posture assessments based on collected configuration, not a guarantee that all identity risk has been eliminated.

---

## Development

```bash
npm install
npm run build
npm test
```

Project layout:

```text
src/
  cli/                 commander entry point and commands
  config/              local zelto-pulse.yml parsing and merge helpers
  core/                logger, errors, filesystem, schemas, business context
  compliance/          Machine-readable compliance control registry and mappings
  connectors/auth0/    Auth0 read-only connector, collectors, redaction
  connectors/okta/     Okta read-only connector, collectors, redaction
  analysis/auth0/      Auth0 deterministic rules, scoring, analyzer
  analysis/okta/       Okta deterministic rules, scoring, analyzer
  reporting/markdown/  Markdown renderers and report types
  reporting/html/      HTML report renderers
  reporting/json/      Report Contract v1 JSON
  reporting/delta/     Provider-agnostic delta comparison
  reporting/combined/  Multi-provider executive summary model
  analysis/rules/      Rule catalog metadata
fixtures/
  auth0/               Auth0 snapshot fixtures
  okta/                Okta snapshot fixtures
tests/
  auth0/
  okta/
  combined/
  compliance/
  delta/
  config/
  reporting/
  rules/
docs/
  compliance/          Audit-readiness and identity control mapping design
  manual-e2e-test-scenarios.md
```

Agentic delivery docs live under [agentic](agentic). The current implementation queue is [agentic/tasks](agentic/tasks). The [verified roadmap](agentic/tasks/ROADMAP.md) prioritizes security and correctness for Auth0/Okta before evidence packs or provider expansion; these planned capabilities are not implemented. See the [assessment and verification limits](agentic/tasks/ASSESSMENT-2026-09-26.md) for the current baseline.

---

## See Also

- [SECURITY.md](SECURITY.md) - security model, token handling, responsible disclosure.
- [docs/manual-e2e-test-scenarios.md](docs/manual-e2e-test-scenarios.md) - manual end-to-end QA scenarios for the full CLI workflow.
- [AGENT.md](AGENT.md) - repository agent workflow and delivery rules.
- [agentic/tasks/README.md](agentic/tasks/README.md) - task workflow.
- [agentic/tasks/CONTROL-VALIDATION.md](agentic/tasks/CONTROL-VALIDATION.md) - proposed validation set drawn from implemented rules.
- [agentic/tasks/RECONCILIATION.md](agentic/tasks/RECONCILIATION.md) - task history, revised priorities and deferred work.

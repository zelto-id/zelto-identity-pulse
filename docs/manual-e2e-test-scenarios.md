# Manual E2E Test Scenarios

This document defines manual end-to-end scenarios for Zelto Identity Pulse across the full local CLI workflow. It covers setup, Auth0 scanning, Okta scanning, report output, JSON contract behavior, delta comparison, combined summaries, rule catalog commands, config-driven scans, business context, compliance evidence mapping, privacy/redaction, and expected failure modes.

The scenarios are intended for release validation, regression checks, client-demo preparation, and manual QA before larger product changes.

## Test Principles

- Keep all test execution local.
- Use fixture-based scans by default.
- Use live provider tests only with dedicated read-only test tenants.
- Do not use production customer credentials for manual QA.
- Do not store tokens in `zelto-pulse.yml`, generated reports, screenshots, or notes.
- Write generated outputs outside the repository, for example `/private/tmp/zelto-e2e`.
- Treat live Auth0 and Okta tests as optional unless a read-only test tenant is available.
- Do not use manual tests to perform create, update, delete, remediation, or provider-side write operations.

## Prerequisites

- Node.js 20 or newer.
- npm installed.
- Repository dependencies installed with `npm install`.
- CLI built with `npm run build`.
- Optional live Auth0 test tenant with a read-only Management API token.
- Optional live Okta test org with read-only OAuth or SSWS token.

Use this output directory for generated manual artifacts:

```bash
mkdir -p /private/tmp/zelto-e2e
```

Use the built CLI unless explicitly testing development mode:

```bash
node dist/cli/index.js --help
```

If the package is linked locally, `zelto-pulse` can be substituted for `node dist/cli/index.js`.

## Baseline Verification

### E2E-001: Fresh Setup and Build

Objective: Confirm a fresh local checkout can install, build, and expose the CLI.

Commands:

```bash
npm install
npm run build
node dist/cli/index.js --help
node dist/cli/index.js scan --help
```

Expected result:

- `npm install` completes without adding unexpected dependencies.
- `npm run build` exits with code `0`.
- CLI help describes `scan`, `compare`, `summary`, and `rules`.
- `scan --help` lists provider subcommands for `auth0` and `okta`.

Manual checks:

- Confirm no generated reports or snapshots were written to the repository by this scenario.
- Confirm no token values appear in terminal output.

### E2E-002: Automated Test Suite Baseline

Objective: Confirm automated tests pass before manual testing.

Commands:

```bash
npm test
```

Expected result:

- Test command exits with code `0`.
- Existing Auth0, Okta, reporting, delta, combined summary, compliance, config, and rule catalog tests pass.

Manual checks:

- Record failing test names if any fail.
- Do not continue release validation until task-related failures are fixed or explicitly documented.

## CLI Help and Command Surface

### E2E-003: Root CLI Help and Version

Objective: Validate the published command surface.

Commands:

```bash
node dist/cli/index.js --help
node dist/cli/index.js --version
node dist/cli/index.js scan auth0 --help
node dist/cli/index.js scan okta --help
node dist/cli/index.js compare --help
node dist/cli/index.js summary --help
node dist/cli/index.js rules --help
```

Expected result:

- Version prints `0.1.0`.
- Auth0 help includes `--domain`, `--token`, `--from-snapshot`, `--format`, `--fail-on`, `--include-legacy-extensibility`, `--compliance`, and `--framework`.
- Okta help includes `--org-url`, `--auth-mode`, token options, `--include-users`, system-log options, `--include-identifiers`, `--compliance`, and `--framework`.
- Compare help requires `--before` and `--after`.
- Summary help requires `--reports`.
- Rules help lists `list` and `explain`.

## Auth0 Fixture Scans

### E2E-004: Auth0 Risky Fixture, All Report Formats

Objective: Validate Auth0 analysis and report rendering from a local fixture.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format all \
  --output /private/tmp/zelto-e2e/auth0-risky.md
```

Expected result:

- Command exits with code `0`.
- Terminal output includes score, grade, finding counts, and report paths.
- Files are created:
  - `/private/tmp/zelto-e2e/auth0-risky.md`
  - `/private/tmp/zelto-e2e/auth0-risky.html`
  - `/private/tmp/zelto-e2e/auth0-risky.json`

Manual checks:

- Markdown and HTML include executive summary, score interpretation, findings, opportunities, resource coverage, limitations, and methodology where applicable.
- JSON includes `schemaVersion`, provider metadata, score, categories, findings, opportunities, coverage, assumptions, limitations, positive signals, and remediation plan.
- Each JSON finding includes a stable `id` and `fingerprint`.
- No `compliance` object appears unless compliance reporting was enabled.
- No raw token, authorization header, client secret, cookie, session, or password value appears in outputs.

### E2E-005: Auth0 Healthy Fixture

Objective: Confirm a healthier tenant produces fewer or lower-severity findings and useful positive signals.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/healthy-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/auth0-healthy.md
```

Expected result:

- Command exits with code `0`.
- HTML and JSON reports are created.
- Score and grade are better than the risky fixture.

Manual checks:

- Positive signals are visible where supported.
- Findings are not over-reported for controls that are healthy.
- JSON finding fingerprints remain deterministic across repeated runs of the same fixture.

### E2E-006: Auth0 Partial-Scope Fixture

Objective: Validate collector coverage and partial-scan behavior.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/partial-scope.snapshot.json \
  --environment production \
  --format markdown,json \
  --output /private/tmp/zelto-e2e/auth0-partial.md
```

Expected result:

- Command exits with code `0`.
- Terminal output indicates a partial scan when collectors are failed or skipped.
- Reports include limitations and coverage gaps.

Manual checks:

- Missing data reduces coverage/confidence instead of being treated as automatically safe.
- Report language does not imply full assurance.

### E2E-007: Auth0 Fail-On Threshold

Objective: Confirm CI/CD-style threshold exit behavior.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-fail-on.json \
  --fail-on high
```

Expected result:

- Command writes the JSON report.
- Command exits with code `2` if high or critical findings exist.

Manual checks:

- Exit code `2` is not treated as a crash; it means scan completed and the threshold matched.
- Report file still exists and is valid JSON.

### E2E-008: Auth0 Invalid Inputs

Objective: Validate error handling for invalid Auth0 CLI inputs.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format xml

node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment prod \
  --format json
```

Expected result:

- Each command exits with code `1`.
- Error messages explain valid values.
- No partial report is written for invalid format or invalid environment.

Manual checks:

- Error output does not include secrets or raw provider data.

## Okta Fixture Scans

### E2E-009: Okta Risky Fixture, All Report Formats

Objective: Validate Okta Workforce analysis and report rendering from a local fixture.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format all \
  --output /private/tmp/zelto-e2e/okta-risky.md
```

Expected result:

- Command exits with code `0`.
- Files are created:
  - `/private/tmp/zelto-e2e/okta-risky.md`
  - `/private/tmp/zelto-e2e/okta-risky.html`
  - `/private/tmp/zelto-e2e/okta-risky.json`
- Terminal output includes score, grade, and finding counts.

Manual checks:

- Reports include Okta-specific categories such as users/groups, applications, policies, authenticators, admin posture, network/security posture, logging, and lifecycle coverage where applicable.
- JSON includes stable finding IDs and fingerprints.
- User or principal identifiers are masked by default.

### E2E-010: Okta Healthy Fixture

Objective: Confirm a healthier Okta org produces better posture output.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/healthy-org.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/okta-healthy.md
```

Expected result:

- Command exits with code `0`.
- HTML and JSON reports are created.
- Score and grade are better than the risky fixture.

Manual checks:

- Positive signals are visible where supported.
- Findings do not duplicate the same issue repeatedly.

### E2E-011: Okta Partial-Scope Fixture

Objective: Validate partial coverage reporting for Okta scans.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/partial-scope-org.snapshot.json \
  --environment production \
  --format markdown,json \
  --output /private/tmp/zelto-e2e/okta-partial.md
```

Expected result:

- Command exits with code `0`.
- Terminal or report output indicates partial scan status where collectors are missing, failed, or skipped.
- Coverage and limitations are visible.

Manual checks:

- Missing scopes or unavailable collectors are not silently treated as safe.
- Report wording remains conservative.

### E2E-012: Okta Identifier Masking and Explicit Identifier Opt-In

Objective: Confirm identifiers are masked by default and only included with explicit opt-in.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/okta-masked.json

node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --include-identifiers \
  --output /private/tmp/zelto-e2e/okta-identifiers.json
```

Expected result:

- Both commands exit with code `0`.
- Default report masks user or principal identifiers where supported.
- Opt-in report may include full identifiers from the fixture.

Manual checks:

- Confirm identifier inclusion is intentional and documented.
- Do not use `--include-identifiers` with real customer data unless approved.

### E2E-013: Okta Invalid Collection Options

Objective: Validate Okta option validation.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --include-users everything

node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --include-system-log maybe
```

Expected result:

- Each command exits with code `1`.
- Error messages identify accepted values.
- No secrets or raw provider data appear in errors.

## Live Provider Scans

### E2E-014: Live Auth0 Read-Only Scan

Objective: Validate live Auth0 collection against a dedicated read-only test tenant.

Prerequisites:

- A non-production Auth0 test tenant.
- A read-only Auth0 Management API token with documented read scopes.

Commands:

```bash
export AUTH0_DOMAIN=example.us.auth0.com
export AUTH0_MGMT_API_TOKEN="<read-only-token>"

node dist/cli/index.js scan auth0 \
  --environment sandbox \
  --format html,json \
  --snapshot-output /private/tmp/zelto-e2e/auth0-live.snapshot.json \
  --output /private/tmp/zelto-e2e/auth0-live.md
```

Expected result:

- Command exits with code `0`, or completes as partial if scopes are missing.
- Snapshot is written only to `/private/tmp/zelto-e2e`.
- Reports are written only to `/private/tmp/zelto-e2e`.

Manual checks:

- Auth0 tenant state is unchanged after the scan.
- Token value is not printed.
- Snapshot is redacted and does not contain raw tokens, secrets, authorization headers, cookies, or sessions.
- Collector status explains missing scopes or failed collectors.

### E2E-015: Live Okta OAuth Read-Only Scan

Objective: Validate live Okta OAuth collection against a dedicated test org.

Prerequisites:

- A non-production Okta org.
- A read-only OAuth access token.

Commands:

```bash
export OKTA_ORG_URL=https://example.okta.com
export OKTA_ACCESS_TOKEN="<read-only-oauth-token>"

node dist/cli/index.js scan okta \
  --auth-mode oauth \
  --environment sandbox \
  --include-users bounded \
  --max-users 25 \
  --include-system-log true \
  --system-log-days 7 \
  --max-logs 100 \
  --format html,json \
  --snapshot-output /private/tmp/zelto-e2e/okta-live-oauth.snapshot.json \
  --output /private/tmp/zelto-e2e/okta-live-oauth.md
```

Expected result:

- Command exits with code `0`, or completes as partial if permissions are limited.
- Reports and snapshot are created under `/private/tmp/zelto-e2e`.

Manual checks:

- Okta org state is unchanged after the scan.
- User collection respects bounded limits.
- System Log collection respects the configured lookback and max event count.
- Token value is not printed or persisted.

### E2E-016: Live Okta SSWS Read-Only Scan

Objective: Validate SSWS token mode where OAuth is not available.

Prerequisites:

- A non-production Okta org.
- A read-only SSWS API token.

Commands:

```bash
export OKTA_ORG_URL=https://example.okta.com
export OKTA_API_TOKEN="<read-only-ssws-token>"

node dist/cli/index.js scan okta \
  --auth-mode ssws \
  --environment sandbox \
  --include-users none \
  --include-system-log false \
  --format json \
  --output /private/tmp/zelto-e2e/okta-live-ssws.json
```

Expected result:

- Command exits with code `0`, or partial if scopes are limited.
- No users or System Log events are collected when disabled.

Manual checks:

- Report coverage explicitly reflects disabled or skipped collection.
- No token appears in logs, report, or output file.

## Report Format and JSON Contract

### E2E-017: Output Path Resolution for Multiple Formats

Objective: Confirm sibling output files are created correctly.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/path-resolution.md
```

Expected result:

- Files are created:
  - `/private/tmp/zelto-e2e/path-resolution.html`
  - `/private/tmp/zelto-e2e/path-resolution.json`
- No `/private/tmp/zelto-e2e/path-resolution.md` is created because Markdown was not requested.

Manual checks:

- Terminal output lists the actual written paths.

### E2E-018: JSON Contract Stability and Fingerprints

Objective: Confirm deterministic JSON report output for unchanged input.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-stability-a.json

node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-stability-b.json
```

Expected result:

- Both commands exit with code `0`.
- Both reports include the same `schemaVersion`.
- Finding IDs and fingerprints match for unchanged findings.
- `generatedAt` may differ; stable identity should be based on finding IDs and fingerprints, not file equality.

Manual checks:

- Confirm every finding has `id`, `title`, `provider`, `category`, `severity`, `confidence`, `classification`, `affectedResources`, `evidence`, `businessRisk`, `recommendation`, `validationSteps`, `falsePositiveNotes`, `scoreImpact`, and `fingerprint`.

## Config-Driven Scans and Business Context

### E2E-019: Config-Driven Auth0 Fixture Scan

Objective: Validate `zelto-pulse.yml` driven scanning.

Setup:

```bash
cat > /private/tmp/zelto-e2e/auth0-config.yml <<'YAML'
provider: auth0
environment: production

reports:
  format:
    - html
    - json
  output: /private/tmp/zelto-e2e/config-auth0.md

masking:
  includeIdentifiers: false
  includeRaw: false

auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json
YAML
```

Commands:

```bash
node dist/cli/index.js scan --config /private/tmp/zelto-e2e/auth0-config.yml
```

Expected result:

- Command exits with code `0`.
- HTML and JSON reports are created from the Auth0 fixture.
- No provider credentials are required because `fromSnapshot` is configured.

Manual checks:

- CLI output and files match configured provider and output settings.

### E2E-020: Config-Driven Okta Fixture Scan with Provider Override

Objective: Validate config provider override and Okta-specific collection settings.

Setup:

```bash
cat > /private/tmp/zelto-e2e/multi-config.yml <<'YAML'
provider: auth0
environment: production

reports:
  format:
    - json
  output: /private/tmp/zelto-e2e/config-provider-override.json

collection:
  includeUsers: bounded
  maxUsers: 100
  includeSystemLog: true
  systemLogDays: 7
  maxLogs: 250

auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json

okta:
  fromSnapshot: fixtures/okta/risky-org.snapshot.json
  includeIdentifiers: false
YAML
```

Commands:

```bash
node dist/cli/index.js scan \
  --config /private/tmp/zelto-e2e/multi-config.yml \
  --provider okta
```

Expected result:

- Command exits with code `0`.
- JSON report is generated for Okta, not Auth0.

Manual checks:

- JSON provider is `okta`.
- Output path follows config.

### E2E-021: Business Context and By-Design Suppression

Objective: Confirm deterministic business context can suppress an intentional by-design finding.

Setup:

```bash
cat > /private/tmp/zelto-e2e/auth0-business-context.yml <<'YAML'
provider: auth0
environment: production

reports:
  format:
    - html
    - json
  output: /private/tmp/zelto-e2e/auth0-business-context.md

businessContext:
  organizationType: "B2B SaaS"
  environment: production
  industry: healthcare
  regulatedData: true
  identityUseCase: customer-identity
  riskTolerance: standard
  complianceDrivers:
    - SOC2
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
YAML
```

Commands:

```bash
node dist/cli/index.js scan --config /private/tmp/zelto-e2e/auth0-business-context.yml
```

Expected result:

- Command exits with code `0`.
- Reports are generated.
- Finding `AUTH-RBAC-001` is not reported as an issue when suppressed by the explicit design decision.
- Assumptions or business-context notes explain the by-design handling where rendered.

Manual checks:

- Suppression is based on deterministic finding ID targeting, not free-form AI interpretation.
- Other findings remain visible.
- No compliance or business claim is overstated.

### E2E-022: Config Rejects Credential-Like Keys

Objective: Confirm config files cannot store obvious secrets.

Setup:

```bash
cat > /private/tmp/zelto-e2e/unsafe-config.yml <<'YAML'
provider: auth0
environment: production
auth0:
  fromSnapshot: fixtures/auth0/risky-tenant.snapshot.json
  token: "do-not-store-token-here"
YAML
```

Commands:

```bash
node dist/cli/index.js scan --config /private/tmp/zelto-e2e/unsafe-config.yml
```

Expected result:

- Command exits with code `1`.
- Error explains that credential-like keys are rejected.
- No report is generated.

Manual checks:

- The token-like value is not echoed back in full in logs.

## Delta Comparison

### E2E-023: Auth0 Before/After Delta JSON and HTML

Objective: Validate provider-agnostic delta comparison for the same provider.

Setup:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/healthy-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-before.json

node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-after.json
```

Commands:

```bash
node dist/cli/index.js compare \
  --before /private/tmp/zelto-e2e/auth0-before.json \
  --after /private/tmp/zelto-e2e/auth0-after.json \
  --format html,json \
  --output /private/tmp/zelto-e2e/auth0-delta.json
```

Expected result:

- Command exits with code `0`.
- Files are created:
  - `/private/tmp/zelto-e2e/auth0-delta.json`
  - `/private/tmp/zelto-e2e/auth0-delta.html`
- Delta output includes score/category deltas and finding status groups such as new, resolved, unchanged, worsened, or improved.

Manual checks:

- Findings are matched by fingerprint.
- Delta report does not imply remediation was performed unless the before/after evidence supports it.

### E2E-024: Delta Compare Rejects Provider Mismatch

Objective: Confirm delta comparison does not compare unrelated providers.

Setup:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-provider-mismatch.json

node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/okta-provider-mismatch.json
```

Commands:

```bash
node dist/cli/index.js compare \
  --before /private/tmp/zelto-e2e/auth0-provider-mismatch.json \
  --after /private/tmp/zelto-e2e/okta-provider-mismatch.json
```

Expected result:

- Command exits with code `1`.
- Error explains that providers must match.
- No misleading delta report is created.

## Combined Executive Summary

### E2E-025: Auth0 + Okta Combined Summary

Objective: Validate multi-provider executive summary from local JSON reports.

Setup:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/summary-auth0.json

node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/summary-okta.json
```

Commands:

```bash
node dist/cli/index.js summary \
  --reports /private/tmp/zelto-e2e/summary-auth0.json /private/tmp/zelto-e2e/summary-okta.json \
  --output /private/tmp/zelto-e2e/combined-summary.html
```

Expected result:

- Command exits with code `0`.
- Combined HTML summary is created.
- Summary compares provider posture side by side.
- Summary groups cross-provider risk themes and remediation priorities.

Manual checks:

- Provider-specific finding IDs and fingerprints remain traceable.
- HTML does not expose secret-like values.
- Summary does not contact identity providers.

### E2E-026: Combined Summary Requires Multiple Reports

Objective: Validate summary input validation.

Commands:

```bash
node dist/cli/index.js summary \
  --reports /private/tmp/zelto-e2e/summary-auth0.json \
  --output /private/tmp/zelto-e2e/invalid-summary.html
```

Expected result:

- Command exits with code `1`.
- Error says at least two report paths are required.
- No invalid summary is written.

## Rule Catalog

### E2E-027: Rule Catalog List and Provider Filter

Objective: Validate deterministic rule metadata can be inspected without scanning.

Commands:

```bash
node dist/cli/index.js rules list
node dist/cli/index.js rules list --provider auth0
node dist/cli/index.js rules list --provider okta
```

Expected result:

- Commands exit with code `0`.
- Unfiltered list includes both Auth0 and Okta rule entries.
- Provider filters only show the selected provider.

Manual checks:

- Rule IDs match finding IDs used in reports.
- Output includes categories and severity metadata.

### E2E-028: Rule Explanation and Unknown Rule Handling

Objective: Validate rule explanation and error handling.

Commands:

```bash
node dist/cli/index.js rules explain AUTH-CLI-004
node dist/cli/index.js rules explain OKTA-APP-001
node dist/cli/index.js rules explain DOES-NOT-EXIST
```

Expected result:

- Known rules exit with code `0` and show provider, category, severity logic, evidence, remediation, and false-positive notes.
- Unknown rule exits with code `1`.

Manual checks:

- Rule explanations are deterministic and do not require provider access.

## Compliance Evidence Mapping

### E2E-029: Compliance Reporting Is Opt-In

Objective: Confirm normal reports do not include compliance sections by default.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/auth0-no-compliance.md
```

Expected result:

- Command exits with code `0`.
- HTML report does not include `Compliance Evidence Mapping`.
- JSON report does not include a top-level `compliance` object.

Manual checks:

- Normal posture reports remain focused and uncluttered.

### E2E-030: Auth0 Compliance Evidence Mapping

Objective: Validate opt-in compliance rendering for selected frameworks.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/auth0-compliance.md \
  --compliance \
  --framework nis2,soc2
```

Expected result:

- Command exits with code `0`.
- HTML report includes `Compliance Evidence Mapping`.
- JSON report includes `compliance` with NIS2 and SOC 2 mappings.

Manual checks:

- Section says the report provides identity-system evidence and does not certify compliance or prove operating effectiveness.
- Automated evidence and manual evidence are separated.
- Caveats and not-assessed areas are visible.

### E2E-031: Okta Compliance Evidence Mapping

Objective: Validate opt-in compliance rendering for Okta.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/okta-compliance.md \
  --compliance \
  --framework iso27001
```

Expected result:

- Command exits with code `0`.
- HTML report includes `Compliance Evidence Mapping`.
- JSON report includes `compliance` with ISO 27001 mappings.

Manual checks:

- Mapped control areas reference identity evidence only.
- Report does not claim the tenant or org is compliant.

### E2E-032: Invalid Compliance Framework

Objective: Confirm invalid framework values fail safely.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --framework pci
```

Expected result:

- Command exits with code `1`.
- Error lists valid values: `nis2`, `iso27001`, `soc2`, `all`, or comma-separated combinations.

## Snapshot and Redaction

### E2E-033: Redacted Snapshot Saving from Fixture

Objective: Confirm snapshot saving writes expected JSON without raw secret material.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --snapshot-output /private/tmp/zelto-e2e/auth0-redacted.snapshot.json \
  --output /private/tmp/zelto-e2e/auth0-redacted-report.json
```

Expected result:

- Command exits with code `0`.
- Snapshot and report are written under `/private/tmp/zelto-e2e`.

Manual checks:

- Snapshot contains normalized provider snapshot data.
- Snapshot does not contain raw access tokens, refresh tokens, authorization headers, cookies, sessions, client secrets, private keys, passwords, or inline credentials.

### E2E-034: Include-Raw No-Op Safety

Objective: Confirm `--include-raw` does not enable raw provider response persistence in the MVP.

Commands:

```bash
node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format json \
  --include-raw true \
  --snapshot-output /private/tmp/zelto-e2e/okta-include-raw.snapshot.json \
  --output /private/tmp/zelto-e2e/okta-include-raw-report.json
```

Expected result:

- Command exits with code `0`.
- Raw provider response blobs are not included merely because `--include-raw true` was passed.

Manual checks:

- Output remains redacted and structured.
- Reports do not expose raw tokens or secrets.

## Environment and Scoring Behavior

### E2E-035: Environment-Aware Severity Calibration

Objective: Confirm environment classification is accepted and reflected consistently.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-production.json

node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment sandbox \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-sandbox.json
```

Expected result:

- Both commands exit with code `0`.
- JSON metadata records the selected environment.
- Severity, score, assumptions, or confidence may differ where deterministic rules are environment-aware.

Manual checks:

- Production reports are stricter where intended.
- Sandbox reports still show risks but avoid overstating business impact.

## Negative Safety and Error Scenarios

### E2E-036: Missing Live Auth0 Credentials

Objective: Confirm missing credentials fail clearly without stack traces or secrets.

Commands:

```bash
unset AUTH0_DOMAIN
unset AUTH0_MGMT_API_TOKEN

node dist/cli/index.js scan auth0 \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/auth0-missing-creds.json
```

Expected result:

- Command exits with code `1`.
- Error asks for domain or token as appropriate.
- No report is generated.

### E2E-037: Missing Live Okta Credentials

Objective: Confirm Okta credential validation.

Commands:

```bash
unset OKTA_ORG_URL
unset OKTA_ACCESS_TOKEN
unset OKTA_API_TOKEN

node dist/cli/index.js scan okta \
  --environment production \
  --format json \
  --output /private/tmp/zelto-e2e/okta-missing-creds.json
```

Expected result:

- Command exits with code `1`.
- Error explains missing org URL or credentials.
- No report is generated.

### E2E-038: Missing Input Files

Objective: Confirm file-read failures are clear.

Commands:

```bash
node dist/cli/index.js scan auth0 \
  --from-snapshot /private/tmp/zelto-e2e/does-not-exist.json \
  --environment production

node dist/cli/index.js compare \
  --before /private/tmp/zelto-e2e/does-not-exist-before.json \
  --after /private/tmp/zelto-e2e/does-not-exist-after.json
```

Expected result:

- Commands exit with code `1`.
- Error identifies missing file path.
- Error does not include secret-like data.

## Release Smoke Suite

Use this shorter suite when a full manual pass is too expensive:

```bash
mkdir -p /private/tmp/zelto-e2e
npm run build
npm test

node dist/cli/index.js --help
node dist/cli/index.js rules list
node dist/cli/index.js rules explain AUTH-CLI-004

node dist/cli/index.js scan auth0 \
  --from-snapshot fixtures/auth0/risky-tenant.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/smoke-auth0.md

node dist/cli/index.js scan okta \
  --from-snapshot fixtures/okta/risky-org.snapshot.json \
  --environment production \
  --format html,json \
  --output /private/tmp/zelto-e2e/smoke-okta.md

node dist/cli/index.js compare \
  --before /private/tmp/zelto-e2e/smoke-auth0.json \
  --after /private/tmp/zelto-e2e/smoke-auth0.json \
  --format html,json \
  --output /private/tmp/zelto-e2e/smoke-delta.json

node dist/cli/index.js summary \
  --reports /private/tmp/zelto-e2e/smoke-auth0.json /private/tmp/zelto-e2e/smoke-okta.json \
  --output /private/tmp/zelto-e2e/smoke-combined-summary.html
```

Expected smoke result:

- Build passes.
- Tests pass.
- Auth0 and Okta fixture reports are generated.
- Delta command works for same-provider reports.
- Combined summary is generated from Auth0 and Okta JSON reports.
- No repository source files are modified by running the smoke suite.

## Cleanup

Remove temporary manual artifacts:

```bash
rm -rf /private/tmp/zelto-e2e
```

Do not delete repository fixtures, source files, task files, or checked-in documentation.

## Manual Sign-Off Checklist

- Setup and build passed.
- Automated tests passed.
- Auth0 risky, healthy, and partial fixture scenarios passed.
- Okta risky, healthy, and partial fixture scenarios passed.
- JSON contract includes stable finding IDs and fingerprints.
- Markdown, HTML, and JSON outputs render successfully.
- Config-driven scans work and reject credential-like config keys.
- Business context and by-design suppression work deterministically.
- Delta comparison works and rejects provider mismatch.
- Combined executive summary works from local JSON reports.
- Rule catalog list and explanation commands work.
- Compliance evidence mapping is opt-in and avoids certification claims.
- Redaction and identifier masking behavior is verified.
- Exit codes `0`, `1`, and `2` behave as documented.
- Live provider tests were either passed with read-only test tenants or explicitly skipped.
- No source code, dependencies, provider state, generated repo reports, snapshots, or secrets were changed during manual QA.

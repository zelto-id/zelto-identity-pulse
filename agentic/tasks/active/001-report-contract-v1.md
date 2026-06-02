# Task: Report Contract v1

## Status
active

## Priority
P0

## Product Rationale
This is the product contract that unlocks delta comparison, evidence packs, CI/CD, combined summaries, business-context-aware reporting, and future provider expansion without moving into SaaS or UI work too early.

## Goal
Every Auth0 and Okta scan can produce a stable, versioned structured JSON report with consistent metadata, scoring, coverage, findings, positive signals, remediation structure, and stable finding fingerprints.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P0 — Product Contract and Remediation Validation`
- `001 — Report Contract v1: JSON Schema + Finding Fingerprints`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Define shared Report Contract v1.
- Add `schemaVersion`.
- Add provider, tenant, and environment metadata.
- Add score, category, finding, resource identity, and coverage models.
- Add assumptions, limitations, positive signals, and remediation plan structure.
- Add stable finding IDs and stable finding fingerprints.
- Add JSON report writer support for Auth0 and Okta.
- Add CLI format selection such as `--format html,json` or equivalent.
- Add tests that verify contract stability and secret-safe output.

## Out of Scope
- Delta comparison.
- Delta HTML reporting.
- Business context profile implementation.
- SaaS, backend, database, or web UI work.
- PDF or DOCX export.
- Auto-remediation or any write operations.
- New providers.

## Acceptance Criteria
- `npm run build` passes.
- `npm test` passes.
- Auth0 scan can output a JSON report.
- Okta scan can output a JSON report.
- JSON includes `schemaVersion`, `provider`, `tenant`, `environment`, `generatedAt`, `score`, `categories`, `findings`, `opportunities`, `coverage`, `assumptions`, `limitations`, `positiveSignals`, and `remediationPlan`.
- Each finding includes `id`, `title`, `provider`, `category`, `severity`, `confidence`, `classification`, `affectedResources`, `evidence`, `businessRisk`, `recommendation`, `validationSteps`, `falsePositiveNotes`, `scoreImpact`, and `fingerprint`.
- Finding fingerprints remain stable across repeated scans when the underlying finding, resource identity, and evidence do not change.
- HTML output still works.
- Markdown output still works if supported.
- No secrets or raw tokens are included.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run an Auth0 scan with JSON output enabled and inspect the emitted contract shape.
- Run an Okta scan with JSON output enabled and inspect the emitted contract shape.
- Re-run the same scan twice and confirm unchanged findings keep the same fingerprint.
- Confirm HTML and Markdown output paths still render when JSON is also requested.
- Inspect sample JSON for tokens, secrets, authorization headers, or raw credential material.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
- 2026-05-29: Added a shared Report Contract v1 JSON builder and JSON renderer for Auth0 and Okta, including `schemaVersion`, provider and tenant metadata, coverage, limitations, positive signals, remediation plan, and stable finding fingerprints.
- 2026-05-29: Extended both scan commands to support `json` output and comma-separated format selection while preserving existing Markdown and HTML outputs.
- 2026-05-29: Added contract and output-format tests, ran `npm run build` and `npm test`, and verified fixture-based Auth0 and Okta CLI output generation from saved snapshots.

## Definition of Done
This task is done only when:
- scope is implemented
- out-of-scope items were not implemented
- acceptance criteria pass
- build passes
- tests pass
- task-related bugs are fixed or documented
- no secrets are exposed
- final summary is provided

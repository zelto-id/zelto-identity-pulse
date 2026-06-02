# Task: Report Config File

## Status
backlog

## Priority
P0

## Product Rationale
Repeatable engagements need repeatable inputs, output formats, masking rules, and scan options without relying on long ad hoc CLI invocations.

## Goal
Add a deterministic `zelto-pulse.yml` configuration model for scan and report settings.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P0 — Product Contract and Remediation Validation`
- `004 — Report Config File`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add config support for provider selection, environment, output formats, masking options, scoring profile, output paths, bounded collection options, and future baseline settings.
- Define CLI precedence so flags can override config values.
- Document safe config patterns that avoid storing secrets by default.

## Out of Scope
- Remote configuration.
- SaaS profiles or hosted settings.
- Policy-as-code DSL.
- Write or remediation operations.

## Acceptance Criteria
- The CLI can load `zelto-pulse.yml`.
- CLI flags can override config values deterministically.
- A documented example config is provided.
- Secrets are not stored in config by default.
- Tests cover parsing, precedence, and safe defaults.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run a scan with config-only settings and confirm expected outputs.
- Override selected config values with CLI flags and confirm precedence.
- Inspect example config and generated behavior for secret-safe defaults.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
_No iterations recorded yet._

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

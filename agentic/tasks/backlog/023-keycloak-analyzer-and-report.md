# Task: Keycloak Analyzer and Report

## Status
backlog

## Priority
P3

## Product Rationale
Keycloak only becomes useful to clients once its normalized data is translated into deterministic findings, scores, and readable reports.

## Goal
Add Keycloak analysis, scoring, and report rendering on top of the connector output.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `021 — Keycloak Analyzer and Report`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add Keycloak analyzer rules, scoring categories, findings, HTML and JSON report support, rule catalog entries, fixtures, and tests.

## Out of Scope
- New provider connector work beyond Keycloak inputs.
- Write operations.
- AI-generated findings.

## Acceptance Criteria
- Keycloak findings use the shared report contract.
- Scoring is deterministic and explainable.
- HTML and JSON reports include Keycloak output.
- Rule catalog entries and fixtures are included.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Generate a Keycloak report from fixtures and review findings and scores.
- Confirm rule IDs, remediation text, and coverage notes are traceable.
- Verify no secrets or raw tokens appear in outputs.

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

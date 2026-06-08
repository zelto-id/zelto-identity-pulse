# Task: Entra ID Analyzer and Report

## Status
backlog

## Priority
P3

## Product Rationale
A connector alone does not create assessment value; Entra ID needs deterministic rules, scoring, and report support to become commercially useful.

## Goal
Add Entra ID analysis, scoring, and report rendering on top of the normalized connector output.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `019 — Entra ID Analyzer and Report`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add Entra ID analyzer rules, scoring categories, findings, HTML and JSON report support, rule catalog entries, fixtures, and tests.

## Out of Scope
- New provider connector work beyond Entra ID inputs.
- Write operations.
- AI-generated findings.

## Acceptance Criteria
- Entra ID findings use the shared report contract.
- Scoring is deterministic and explainable.
- HTML and JSON reports include Entra ID output.
- Rule catalog entries and fixtures are included.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Generate an Entra ID report from fixtures and review findings, scores, and coverage.
- Confirm rule IDs and remediation text are traceable.
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

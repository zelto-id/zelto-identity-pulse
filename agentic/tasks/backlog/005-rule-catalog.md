# Task: Rule Catalog

## Status
backlog

## Priority
P0

## Product Rationale
Users need deterministic explanations for why a rule fired, what evidence it uses, and how severity and remediation are derived.

## Goal
Expose rule metadata through CLI output and documentation for Auth0 and Okta.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P0 — Product Contract and Remediation Validation`
- `005 — Rule Catalog`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- QA & Test Engineer

## Scope
- Add `zelto-pulse rules list`.
- Add `zelto-pulse rules explain <rule-id>`.
- Expose rule metadata including provider, category, severity logic, evidence used, false-positive notes, remediation guidance, and confidence logic.
- Make findings reference rule IDs consistently.

## Out of Scope
- External rule DSL.
- User-authored rule packs.
- Runtime rule editing.

## Acceptance Criteria
- Auth0 rules expose metadata consistently.
- Okta rules expose metadata consistently.
- Rule explanations are deterministic and readable.
- Findings reference rule IDs consistently across report formats.
- Tests cover rule listing and explanation behavior.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run the rules list command and inspect output for stable ordering and completeness.
- Explain a sample Auth0 rule and a sample Okta rule and confirm evidence and remediation text are useful.
- Confirm a report finding can be traced back to its rule ID.

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

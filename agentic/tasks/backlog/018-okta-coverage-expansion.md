# Task: Okta Coverage Expansion

## Status
backlog

## Priority
P2

## Product Rationale
Okta Workforce is part of the MVP base, so deeper coverage should come after the shared output contract and comparison workflows are stable.

## Goal
Expand Okta posture coverage in high-value workforce security areas.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P2 — Provider Scale Readiness`
- `018 — Okta Coverage Expansion`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Reporting Engineer
- QA & Test Engineer

## Scope
- Expand relevant coverage for assignment graph depth, group memberships, app assignments, admin role coverage, device assurance, threat insights, additional policy depth, system log analysis depth, lifecycle source signals, and security-relevant workflows.

## Out of Scope
- Full IGA replacement.
- Full user behavior analytics platform.
- Write or remediation operations.

## Acceptance Criteria
- New Okta coverage areas are prioritized by posture value.
- Findings, coverage reporting, and tests reflect the added depth.
- Added collection remains read-only and secret-safe.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review an expanded Okta report and confirm the new depth improves workforce posture analysis.
- Confirm partial coverage and scope gaps remain visible.
- Inspect outputs for duplication, noisy resource dumps, or leaked identifiers.

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

# Task: Ping Identity Connector

## Status
backlog

## Priority
P3

## Product Rationale
Ping implementation should follow research and design, not precede it, so the first connector targets the right product surface and posture signals.

## Goal
Implement the first read-only Ping Identity connector defined by the approved design task.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `025 — Ping Identity Connector`
- This roadmap adds the explicit follow-on connector task after research completion.

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Implement the read-only Ping connector defined by the research and design task.
- Collect the approved posture surface and produce a normalized snapshot with coverage metadata.
- Add fixtures and tests for representative Ping environments.

## Out of Scope
- Implementing new Ping products beyond the approved first scope.
- Write operations.
- Secret retrieval or unsafe credential handling.

## Acceptance Criteria
- Connector scope matches the approved Ping design.
- Collection is read-only and secret-safe.
- Snapshot output conforms to shared provider contracts.
- Fixtures and tests cover representative data and permission gaps.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run the connector against fixtures or a safe Ping environment and inspect normalized output.
- Confirm coverage and permission gaps are explicit.
- Verify logs and outputs never expose tokens or secrets.

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

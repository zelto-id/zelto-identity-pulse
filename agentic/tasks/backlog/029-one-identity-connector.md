# Task: One Identity Connector

## Status
backlog

## Priority
P3

## Product Rationale
One Identity implementation should start only after research narrows the product surface and defines a safe, useful first scope.

## Goal
Implement the approved read-only One Identity connector.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `024 — One Identity Research and Scope Definition`
- This roadmap adds the explicit connector follow-on after research is complete.

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Implement the One Identity connector defined by the approved scope.
- Produce normalized snapshot output with coverage and collector status.
- Add fixtures and tests for representative One Identity environments.

## Out of Scope
- Expanding beyond the approved first One Identity scope.
- Secret retrieval or write operations.
- Unsafe or unsupported modules not covered by the design.

## Acceptance Criteria
- Connector scope matches the approved One Identity design.
- Collection is read-only and secret-safe.
- Snapshot output conforms to shared provider contracts.
- Fixtures and tests cover representative data and permission gaps.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run the connector against fixtures or a safe environment and inspect normalized output.
- Confirm coverage and permission limits are explicit.
- Verify logs and outputs never expose secrets or raw tokens.

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

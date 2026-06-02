# Task: IGA Platform Research: SailPoint and Saviynt

## Status
backlog

## Priority
P3

## Product Rationale
IGA platforms are commercially relevant, but their posture signals, APIs, and scope boundaries need research before any connector decision.

## Goal
Research SailPoint and Saviynt for future identity-governance posture support and define feasible first scopes.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `Provider Expansion Strategy: SailPoint and Saviynt`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer

## Scope
- Evaluate SailPoint and Saviynt APIs, product surfaces, and read-only posture signals.
- Identify safe and commercially useful first scopes.
- Document exclusions, data sensitivity concerns, and likely report implications.

## Out of Scope
- Immediate connector implementation.
- Full IGA workflow modeling.
- Write operations.

## Acceptance Criteria
- Candidate first scopes are documented for SailPoint and Saviynt.
- Read-only access strategy and data sensitivity constraints are documented.
- Follow-on implementation tasks can be created with reduced ambiguity.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the research against product principles and confirm it remains local-first and read-only.
- Confirm sensitive governance data boundaries are explicit.
- Verify the plan does not imply secret access or write behavior.

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

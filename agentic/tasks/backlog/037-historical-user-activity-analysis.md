# Task: Historical User Activity Analysis

## Status
backlog

## Priority
P4

## Product Rationale
Historical activity can improve risk context, but only if it is bounded, privacy-conscious, and clearly distinct from full analytics platforms.

## Goal
Add bounded historical activity analysis for identity posture context.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P4 — Advanced Workflows`
- `037 — Historical User Activity Analysis`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Support bounded lookback windows.
- Analyze login or activity trends, stale users, admin activity signals, and failed login signals where available.
- Keep identifiers masked by default and collection bounded.

## Out of Scope
- Full UEBA.
- Long-term hosted analytics.
- High-volume log warehousing.

## Acceptance Criteria
- Historical collection is bounded and documented.
- Activity-derived signals remain explainable and privacy-conscious.
- Identifier masking remains on by default.
- Tests cover representative activity analysis cases.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run activity analysis on representative fixtures and inspect summarized signals.
- Confirm identifiers remain masked unless explicitly opted in.
- Verify the feature does not drift into hosted analytics behavior.

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

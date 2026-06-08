# Task: User Risk Scoring

## Status
backlog

## Priority
P4

## Product Rationale
User-level risk can be valuable for prioritization, but it must avoid false precision, surveillance-style behavior, and privacy leakage.

## Goal
Add conservative user risk indicators grounded in explicit posture evidence.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P4 — Advanced Workflows`
- `030 — User Risk Scoring`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add conservative indicators such as privileged admin plus no MFA, stale privileged users, or privileged app access where known.
- Mask identifiers by default.
- Keep the model explainable and low-precision by design.

## Out of Scope
- Behavioral ML.
- Employee surveillance.
- Full UEBA.

## Acceptance Criteria
- Risk indicators are explainable and conservative.
- Identifier masking remains on by default.
- Reports distinguish indicators from definitive user compromise claims.
- Tests cover representative indicator combinations.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review sample user-risk outputs and confirm wording avoids false precision.
- Confirm masked identifiers remain the default.
- Verify the feature does not present itself as behavioral monitoring.

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

# Task: Multi-Environment Comparison

## Status
backlog

## Priority
P1

## Product Rationale
Comparing dev, stage, and prod environments helps clients detect configuration drift and prioritize production-critical gaps.

## Goal
Compare multiple reports from the same provider and highlight environment drift.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P1 — Commercial Assessment Value`
- `014 — Multi-Environment Comparison`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- QA & Test Engineer

## Scope
- Compare multiple reports from the same provider.
- Highlight production gaps and environment drift.
- Generate an environment comparison report using structured inputs.

## Out of Scope
- Continuous monitoring.
- Hosted tenant inventory.
- Cross-provider combined summary logic.

## Acceptance Criteria
- Comparison works across multiple environments for the same provider.
- Production-critical drift is clearly identified.
- Output remains deterministic and grounded in report inputs.
- Tests cover representative dev, stage, and prod cases.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Compare sample reports for dev, stage, and prod and inspect the drift summary.
- Confirm production-only severity differences are explained rather than implied.
- Verify the report does not confuse environment drift with missing coverage.

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

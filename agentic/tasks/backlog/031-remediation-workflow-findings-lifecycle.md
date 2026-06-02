# Task: Remediation Workflow Findings Lifecycle

## Status
backlog

## Priority
P4

## Product Rationale
Recurring reviews need finding lifecycle tracking so teams can distinguish new issues from acknowledged or resolved work.

## Goal
Track finding lifecycle states locally without introducing provider writes or SaaS workflows.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P4 — Advanced Workflows`
- `026 — Remediation Workflow / Findings Lifecycle`

## Relevant Agents
- Orchestrator
- Product Architect
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add local state for open, acknowledged, accepted risk, and resolved findings.
- Support owner notes, due dates, and mapping to delta results.
- Keep workflow local-first and deterministic.

## Out of Scope
- Ticketing integrations.
- SaaS collaboration.
- Write operations to identity providers.

## Acceptance Criteria
- Findings can carry lifecycle state locally.
- Lifecycle state maps cleanly to delta results and recurring reviews.
- Sensitive data handling remains explicit.
- Tests cover state transitions and persistence rules.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Track a finding through state changes locally and inspect the stored workflow data.
- Confirm lifecycle state does not alter raw evidence.
- Verify no provider write operations are introduced.

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

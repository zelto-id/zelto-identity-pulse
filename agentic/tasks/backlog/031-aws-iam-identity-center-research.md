# Task: AWS IAM Identity Center Research

## Status
backlog

## Priority
P3

## Product Rationale
AWS IAM Identity Center is a meaningful identity control plane for workforce access, but the first posture scope must be researched before connector work begins.

## Goal
Research AWS IAM Identity Center posture scope and produce a design recommendation.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `Provider Expansion Strategy: AWS IAM / IAM Identity Center`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer

## Scope
- Identify the right initial AWS identity posture surface.
- Evaluate APIs, permissions, and read-only constraints.
- Define posture signals, exclusions, and likely report implications.
- Produce a scoped design for follow-on implementation.

## Out of Scope
- Immediate connector implementation.
- Broad AWS security platform coverage beyond identity posture.
- Write operations.

## Acceptance Criteria
- The initial AWS IAM Identity Center scope is explicitly chosen.
- Read-only access strategy and safe data boundaries are documented.
- A follow-on implementation task can start from the research outcome.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the research against product principles and confirm it remains local-first and read-only.
- Confirm risky or ambiguous data surfaces are excluded.
- Verify the plan does not imply secret access or tenant writes.

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

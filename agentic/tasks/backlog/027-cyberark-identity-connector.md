# Task: CyberArk Identity Connector

## Status
backlog

## Priority
P3

## Product Rationale
CyberArk implementation should follow scope definition so the first connector targets a clear, commercially useful posture surface.

## Goal
Implement the approved read-only CyberArk identity connector.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `027 — CyberArk Identity Connector`
- This roadmap adds the explicit connector follow-on after research is complete.

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Implement the CyberArk connector defined by the approved scope.
- Produce normalized snapshot output with coverage and collector status.
- Add fixtures and tests for representative CyberArk environments.

## Out of Scope
- Expanding beyond the approved first CyberArk scope.
- Credential retrieval, secret extraction, or secret rotation.
- Write operations.

## Acceptance Criteria
- Connector scope matches the approved CyberArk design.
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

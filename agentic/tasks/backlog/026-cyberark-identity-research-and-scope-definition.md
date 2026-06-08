# Task: CyberArk Research and Scope Definition

## Status
backlog

## Priority
P3

## Product Rationale
CyberArk spans identity, privilege, PAM, and secrets. Scope must be controlled before implementation to avoid unsafe or commercially diffuse work.

## Goal
Define the initial CyberArk posture surface, safe exclusions, and connector design direction.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `023 — CyberArk Research and Scope Definition`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer

## Scope
- Decide whether the first target is CyberArk Identity, PAM, or a narrower scope.
- Identify read-only APIs and safe posture signals.
- Define what should not be collected.
- Produce a connector design document and implementation boundary.

## Out of Scope
- Full CyberArk PAM coverage.
- Credential retrieval or secret inspection.
- Secret rotation or any write operations.

## Acceptance Criteria
- The initial CyberArk target is explicitly chosen.
- Safe read-only APIs and exclusions are documented.
- The design clearly distinguishes risk signals from sensitive data that must not be collected.
- A follow-on connector task can start with reduced ambiguity.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the design against product principles and confirm it remains read-only and local-first.
- Confirm sensitive surfaces and no-collect zones are explicit.
- Verify the plan does not imply secret access or write operations.

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

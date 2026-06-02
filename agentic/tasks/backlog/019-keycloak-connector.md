# Task: Keycloak Connector

## Status
backlog

## Priority
P3

## Product Rationale
Keycloak strengthens OSS credibility and addresses engineering-led companies that need local-first identity posture assessment outside SaaS-first ecosystems.

## Goal
Implement a read-only Keycloak connector with normalized snapshot output.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `020 — Keycloak Connector`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Collect realm metadata, clients, users, groups, roles, identity providers, authentication flows, realm settings, and token or session posture settings in read-only mode.
- Produce a normalized snapshot with coverage metadata.

## Out of Scope
- Admin writes.
- Realm migration tooling.
- Secret extraction.

## Acceptance Criteria
- Keycloak connector is read-only and secret-safe.
- Snapshot output conforms to shared provider contracts.
- Coverage and missing permission limits are explicit.
- Fixtures and tests cover representative realm states.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run the connector against representative fixtures and inspect normalized output.
- Confirm risky credential data is redacted.
- Verify partial collection is reported rather than hidden.

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

# Task: Entra ID Connector

## Status
backlog

## Priority
P3

## Product Rationale
Entra ID is the highest-value next provider after the report contract, delta workflow, and provider onboarding kit are stable.

## Goal
Implement a read-only Entra ID connector that produces a normalized snapshot suitable for the shared report contract.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P3 — New Provider Expansion`
- `020 — Entra ID Connector`
- Numbering is shifted in `/agentic/tasks` so provider readiness work stays ahead of new-provider implementation.

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Design and implement read-only authentication and collection for tenant metadata, users, groups, apps, service principals, Conditional Access where accessible, roles/admins, app registrations, enterprise applications, and sign-in or log coverage where practical.
- Produce a normalized Entra ID snapshot with coverage and collector status.

## Out of Scope
- Write operations.
- Conditional Access changes.
- Full Microsoft security platform integration.

## Acceptance Criteria
- Entra ID connector is read-only and secret-safe.
- Snapshot output conforms to shared provider contracts.
- Coverage gaps and missing permissions are explicit.
- Fixtures and tests cover representative tenant shapes.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run the connector against representative fixtures or a safe tenant and inspect normalized output.
- Confirm missing-permission cases degrade gracefully.
- Inspect logs and outputs for token or secret leakage.

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

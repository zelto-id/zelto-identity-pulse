# Task: SaaS Backend Hosted Platform

## Status
backlog

## Priority
P5

## Product Rationale
A hosted platform could become a business model later, but it adds major security, privacy, compliance, infrastructure, and support burden far beyond the current local-first product phase.

## Goal
Research a future hosted platform architecture without pulling the current product off its local-first roadmap.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P5 — Platform Bets`
- `035 — SaaS Backend / Hosted Platform`

## Relevant Agents
- Orchestrator
- Product Architect
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Research tenant isolation, secure ingestion, storage and redaction, authn and authz, billing, and commercial model considerations for a future hosted platform.

## Out of Scope
- Immediate build.
- Storing customer secrets.
- Hosted scanning without a clear trust model.

## Acceptance Criteria
- SaaS risks and prerequisites are explicitly documented.
- Local-first core product direction remains intact.
- No hosted implementation begins before report maturity and privacy controls justify it.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the platform research against current product principles.
- Confirm the proposal treats hosted capabilities as future optional work.
- Verify no current code or workflows assume a backend exists.

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

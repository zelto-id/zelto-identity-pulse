# Task: Provider Onboarding Kit

## Status
backlog

## Priority
P2

## Product Rationale
Before Entra ID or any later provider work begins, the repo needs a repeatable, secure, testable provider build pattern.

## Goal
Create a provider onboarding kit that standardizes how new providers are added to the product.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P2 — Provider Scale Readiness`
- `016 — Provider Onboarding Kit`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Define standard provider folder structure.
- Define connector, auth, pagination, rate-limit, snapshot schema, analyzer, report mapping, fixture/test, rule catalog, and security/privacy checklists.
- Make the onboarding kit the prerequisite for new provider implementation tasks.

## Out of Scope
- Plugin marketplace.
- External SDK.
- Provider generator CLI.

## Acceptance Criteria
- The onboarding kit covers end-to-end provider delivery requirements.
- Entra ID can use it as the first new-provider path.
- Security and privacy gates are explicit.
- Documentation is concrete enough to avoid one-off provider implementations.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the kit against Auth0 and Okta and confirm it captures the actual work pattern.
- Walk through an Entra ID planning exercise using the checklist.
- Confirm no step introduces write operations or secret persistence.

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

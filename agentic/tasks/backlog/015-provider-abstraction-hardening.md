# Task: Provider Abstraction Hardening

## Status
backlog

## Priority
P2

## Product Rationale
Provider expansion will fail if each connector invents its own incompatible result model, but the product also cannot force false symmetry across Auth0 and Okta.

## Goal
Strengthen shared provider contracts without flattening away provider-specific semantics.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P2 — Provider Scale Readiness`
- `015 — Provider Abstraction Hardening`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Reporting Engineer
- QA & Test Engineer

## Scope
- Harden shared connector result, collector status, report contract, finding model, and score/category model.
- Define renderer contracts where useful.
- Preserve provider-specific analyzers and resource shapes where they add clarity.

## Out of Scope
- Full plugin framework.
- External provider SDK.
- Runtime-loaded providers.

## Acceptance Criteria
- Shared contracts are explicit and versionable.
- Auth0 and Okta both conform without awkward abstraction leaks.
- Tests cover cross-provider compatibility.
- New-provider tasks can reference these contracts directly.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review shared types and confirm they reduce duplication without hiding provider differences.
- Validate that existing providers still express their own semantics clearly.
- Confirm future provider tasks can reference a stable shared contract.

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

# Task: Terraform-Aligned Coverage Matrix

## Status
backlog

## Priority
P2

## Product Rationale
Users need a coverage map that explains what the product assesses, what it only partially covers, and what is intentionally out of scope without turning the roadmap into blind Terraform parity chasing.

## Goal
Maintain a provider coverage matrix aligned to Terraform-style resource expectations where that helps explain posture coverage.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P2 — Provider Scale Readiness`
- `019 — Terraform-Aligned Coverage Matrix`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- QA & Test Engineer

## Scope
- Build Auth0 and Okta Terraform-aligned coverage matrices where applicable.
- Show covered, partially covered, and not covered resources.
- Add posture value rating and inclusion or exclusion rationale.

## Out of Scope
- Full Terraform import.
- Full Terraform provider parity.
- Write operations.

## Acceptance Criteria
- Coverage matrix exists for supported providers.
- Resource coverage status and posture value are explicit.
- The matrix helps explain roadmap priorities without implying unsupported automation.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the matrix for Auth0 and Okta and confirm it matches real product coverage.
- Confirm excluded resources include a posture-value rationale.
- Ensure the document does not imply write/remediation support.

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

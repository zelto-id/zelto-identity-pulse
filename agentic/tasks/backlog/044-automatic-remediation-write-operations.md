# Task: Automatic Remediation Write Operations

## Status
backlog

## Priority
P5

## Product Rationale
Automatic remediation is strategically interesting but high-risk. It must remain very late because it changes the product from read-only assessment into write-capable automation.

## Goal
If ever pursued, design and implement tightly controlled remediation workflows only after the read-only assessment foundation is mature and explicitly approved.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P5 — Platform Bets`
- `044 — Automatic Remediation / Write Operations`

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Safe early scope may include remediation instructions, Terraform snippets, dry-run patch plans, and manual validation steps.
- Any future write path must require explicit approval, auditability, rollback planning, and provider-specific safety controls.

## Out of Scope
- Default write operations.
- Silent provider changes.
- Automated production changes without explicit approval.

## Acceptance Criteria
- The task remains clearly marked as late-stage and high-risk.
- Any design explicitly separates dry-run planning from real write behavior.
- Safety, approval, rollback, and audit requirements are mandatory.
- No write capability is added implicitly through unrelated tasks.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the design against current product principles and confirm the default product remains read-only.
- Confirm dry-run guidance is distinct from actual write behavior.
- Verify the roadmap does not promote provider write operations ahead of core read-only maturity.

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

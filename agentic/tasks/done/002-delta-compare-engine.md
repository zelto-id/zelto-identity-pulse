# Task: Delta Compare Engine

## Status
done

## Priority
P0

## Product Rationale
Delta comparison turns the scanner into a remediation-validation workflow by proving what changed between assessments instead of only describing a single point in time.

## Goal
Compare two structured reports and emit a deterministic delta object that identifies posture improvements, regressions, and unchanged areas.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P0 — Product Contract and Remediation Validation`
- `002 — Delta Compare Engine`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Compare before and after JSON reports from the Report Contract.
- Identify new, resolved, unchanged, worsened, and improved findings.
- Compare overall score, category scores, and coverage changes.
- Produce structured delta JSON for downstream rendering.

## Out of Scope
- Delta HTML rendering.
- Database or history storage.
- SaaS or hosted workflows.
- Auto-remediation or write operations.

## Acceptance Criteria
- Delta comparison works for Auth0 reports.
- Delta comparison works for Okta reports.
- Finding fingerprints are the primary identity mechanism for comparison.
- Delta output is deterministic across repeated runs.
- Tests cover new, resolved, unchanged, worsened, and improved findings.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Compare two reports with known changes and review the delta JSON.
- Re-run the same comparison twice and confirm identical output.
- Confirm coverage changes are explicit rather than silently absorbed into score changes.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
- 2026-06-02: Added provider-agnostic delta report types and comparison logic for Report Contract v1 JSON, including score, category, finding, and coverage deltas.
- 2026-06-02: Added `zelto-pulse compare --before <file> --after <file> [--output <file>]` for deterministic structured delta JSON output.
- 2026-06-02: Added regression tests for new, resolved, unchanged, worsened, and improved finding states, plus category movement, coverage movement, identical Okta reports, and cross-provider rejection.
- 2026-06-02: Ran required build and test checks, then manually verified Auth0 and Okta fixture report comparisons and byte-for-byte deterministic repeated output.

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

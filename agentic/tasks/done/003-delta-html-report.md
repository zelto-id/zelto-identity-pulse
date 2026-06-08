# Task: Delta HTML Report

## Status
done

## Priority
P0

## Product Rationale
Clients need a readable before-and-after artifact that explains remediation progress without asking them to inspect raw JSON deltas.

## Goal
Render a client-readable HTML delta report from structured delta JSON.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P0 — Product Contract and Remediation Validation`
- `003 — Delta HTML Report`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Render score and grade changes.
- Render category deltas and coverage changes.
- Show resolved, new, worsened, and remaining findings.
- Add an executive summary suitable for remediation review meetings.

## Out of Scope
- SaaS dashboards.
- Database history views.
- PDF or DOCX output.
- Auto-remediation or provider writes.

## Acceptance Criteria
- HTML delta output renders from delta JSON.
- The report clearly distinguishes resolved, worsened, new, and unchanged issues.
- Coverage changes and score movements are explained.
- Rendering tests cover representative delta cases.
- No secrets or raw tokens are exposed.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Generate a delta report from two known report fixtures and review readability.
- Confirm a remediation reviewer can identify major changes without opening raw JSON.
- Inspect the rendered output for secret leakage or noisy duplication.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
- 2026-06-02: Added a self-contained delta HTML renderer for `StructuredDeltaReportV1` with executive summary, score movement, key decisions, category deltas, grouped finding states, coverage changes, and methodology.
- 2026-06-02: Extended `zelto-pulse compare` with `--format json|html|all` while preserving JSON as the default output.
- 2026-06-02: Added renderer tests for representative delta content, HTML escaping, obvious secret-pattern redaction, and delta compare format parsing.
- 2026-06-02: Ran required build and test checks, then manually verified Auth0 and Okta fixture-based delta HTML output plus `--format all` sibling JSON/HTML output.

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

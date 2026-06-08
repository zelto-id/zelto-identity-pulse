# Task: Local Scan History Database

## Status
backlog

## Priority
P4

## Product Rationale
Local history enables trend analysis and recurring reviews without introducing SaaS or remote storage.

## Goal
Add local-only report history storage for trends and recurring assessment workflows.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P4 — Advanced Workflows`
- `033 — Local Scan History Database`
- Numbering is shifted in `/agentic/tasks` to preserve the expanded roadmap sequence.

## Relevant Agents
- Orchestrator
- Product Architect
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Add local SQLite or file-based history.
- Store report metadata, score trends, and finding history.
- Keep snapshots optional and redacted.

## Out of Scope
- Hosted databases.
- Multi-user collaboration.
- Remote synchronization.

## Acceptance Criteria
- History remains local-first.
- Stored data is redacted and scoped to report history needs.
- Trend retrieval is deterministic.
- Tests cover storage and retrieval behavior.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Save multiple report runs locally and inspect history output.
- Confirm redaction and retention rules are visible.
- Verify the feature does not create SaaS-like coupling or secret persistence.

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

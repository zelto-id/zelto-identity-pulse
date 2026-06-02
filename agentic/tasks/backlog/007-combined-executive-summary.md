# Task: Combined Executive Summary

## Status
backlog

## Priority
P1

## Product Rationale
Clients with both Auth0 and Okta need one executive identity posture story, not disconnected provider reports that duplicate work for reviewers.

## Goal
Generate a combined summary across multiple provider JSON reports.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P1 — Commercial Assessment Value`
- `007 — Combined Executive Summary`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Accept multiple provider JSON reports as input.
- Produce a combined HTML summary.
- Highlight top cross-provider risks, provider comparison, and unified remediation priorities.
- Summarize overall identity posture across providers.

## Out of Scope
- SaaS dashboards.
- Database storage.
- Real-time monitoring.

## Acceptance Criteria
- Combined summary renders from multiple report inputs.
- Cross-provider priorities are clear and not repetitive.
- Provider-specific evidence remains traceable.
- Tests cover mixed Auth0 and Okta inputs.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Combine one Auth0 report and one Okta report and review the executive summary.
- Confirm duplicated themes are grouped instead of repeated verbatim.
- Verify that no secrets or oversized raw resource dumps appear in the combined output.

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

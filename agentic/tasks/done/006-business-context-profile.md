# Task: Business Context Profile

## Status
done

## Priority
P0

## Product Rationale
Technical findings become more commercially useful when interpreted against environment, regulated data, user population, critical applications, and business priorities without relying on AI-generated assumptions.

## Goal
Allow users to provide structured business context that deterministically influences report interpretation, prioritization, and remediation planning.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P1 — Commercial Assessment Value`
- `006 — Business Context Profile`
- Prioritized to `P0` in this `/agentic/tasks` roadmap to align with the current product direction for deterministic context before SaaS or AI narrative.

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Define a business context profile format, preferably integrated with future `zelto-pulse.yml`.
- Capture organization type, industry, environment, regulated data, identity use case, user population, critical applications, compliance drivers, business priorities, and risk tolerance.
- Make context available to analyzers and report renderers.
- Use context deterministically to improve wording, priority, score interpretation, and severity calibration where appropriate.
- Add tests for context loading and deterministic report impact.

## Out of Scope
- AI-generated findings or scoring.
- Sending tenant data to external AI services.
- SaaS or backend storage.
- Customer data warehousing.
- Write or remediation operations.

## Acceptance Criteria
- Business context can be provided through configuration.
- Reports can include business context assumptions when provided.
- Findings can reference business context without changing technical evidence.
- Severity and remediation priority can use business context deterministically.
- Missing business context does not break scans.
- Sensitive business context is not logged unnecessarily.
- Tests cover context parsing and report rendering impact.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Load a sample business context profile and confirm it appears in report interpretation.
- Compare a production and sandbox context using the same technical finding and confirm deterministic wording differences.
- Inspect logs and outputs for accidental disclosure of sensitive business context.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
- 2026-06-08: Added a structured `businessContext` profile model covering organization type, environment, industry, regulated data, identity use case, user population, critical applications, risk tolerance, compliance drivers, and business priorities.
- 2026-06-08: Integrated `businessContext` with `zelto-pulse.yml`; `businessContext.environment` can supply the scan environment when no explicit top-level or CLI environment is provided.
- 2026-06-08: Passed business context into Auth0 and Okta analyzers, report objects, Markdown/HTML renderers, and Report Contract v1 JSON output.
- 2026-06-08: Added deterministic business context assumptions and per-finding context notes without changing technical evidence or rule triggering.
- 2026-06-08: Added tests for config parsing, environment fallback, report rendering impact, JSON contract output, and evidence stability.
- 2026-06-08: Updated `README.md` and `zelto-pulse.example.yml`; ran build, tests, and Auth0/Okta fixture-based manual verification with temporary outputs under `/private/tmp`.
- 2026-06-08: Extended business context with explicit design decisions so documented architecture choices, such as not using Auth0 roles by design, can suppress targeted deterministic findings without changing unrelated analysis.

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

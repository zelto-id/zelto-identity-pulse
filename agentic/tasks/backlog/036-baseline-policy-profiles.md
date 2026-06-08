# Task: Baseline Policy Profiles

## Status
backlog

## Priority
P4

## Product Rationale
Different environments and identity use cases need different expectations, but the product should express those differences with deterministic baseline profiles instead of ad hoc rule changes.

## Goal
Define baseline policy profiles for common environment and identity patterns.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P4 — Advanced Workflows`
- `036 — Baseline Policy Profiles`

## Relevant Agents
- Orchestrator
- Product Architect
- Analyzer & Scoring Engineer
- QA & Test Engineer

## Scope
- Add default, production, sandbox or dev, CIAM, workforce, and future regulated baseline profiles.
- Make profile selection explicit and deterministic.
- Align baseline logic with scoring and report interpretation.

## Out of Scope
- External DSL.
- Custom rule marketplace.
- AI-defined baselines.

## Acceptance Criteria
- Supported profiles are explicit and documented.
- Profile selection changes expectations deterministically.
- Reports explain which profile was used.
- Tests cover profile-specific scoring and interpretation.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Run equivalent reports under different baseline profiles and inspect the differences.
- Confirm production, CIAM, and workforce expectations are distinguishable.
- Verify profile logic remains explainable rather than opaque.

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

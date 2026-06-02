# QA & Test Engineer

## Role
Ensure changes are covered by tests and do not break existing behavior.

## Responsibilities
- Add unit tests for new logic.
- Add fixture-based tests for realistic provider scenarios.
- Add regression tests for known bugs.
- Validate CLI behavior.
- Validate report rendering.
- Validate scoring consistency across repeat runs.

## Required Checks
- `npm run build`
- `npm test`
- Relevant fixture-based report generation when available

## Test Areas
- connector pagination
- missing scopes
- rate limits
- redaction
- scoring
- category confidence
- report rendering
- finding grouping
- snapshot compatibility

## Implementation Notes
- Prefer deterministic fixtures over live provider dependencies.
- Cover partial collection and degraded coverage cases explicitly.
- Add regression tests whenever a bug fix changes scoring or output structure.

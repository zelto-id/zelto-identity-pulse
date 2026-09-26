# Task 054: Implement explicit control outcomes and evidence requirements

## Status
backlog

## Priority
P1

## Milestone
M2

## Type and readiness
Type: implementation.
Readiness: blocked.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Reliable reassessment needs a record for attempted controls, including failures to assess, rather than only emitted findings.

## Scope
- Implement the agreed versioned rule-outcome/evidence/applicability contract for Auth0 and Okta.
- Carry source field/object references, prerequisite collection states, confidence rationale and validation maturity; unknowns remain explicit.
- Adapt HTML/Markdown/JSON and catalog output without asserting every existing heuristic is validated; maintain legacy-reader behavior.

## Out of scope
- No new rules, full identity graph, compliance verdict or scoring policy beyond the agreed outcome representation.

## Dependencies
- [053 — Define assessment outcomes and scoring policy](053-assessment-semantics-decision.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/analysis/auth0/auth0.rules.ts](../../../src/analysis/auth0/auth0.rules.ts)
- [src/analysis/okta/okta.rules.ts](../../../src/analysis/okta/okta.rules.ts)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [src/reporting/markdown](../../../src/reporting/markdown)
- [src/reporting/html](../../../src/reporting/html)

## Acceptance criteria
- All 59 existing rule IDs have declared evidence/applicability requirements and explicit evaluation/unsupported status; the selected 18 get deeper validation in 017/018.
- A control cannot pass when mandatory source data is unavailable or its evaluation failed.
- Each failed control links to sanitized collected fields; unvalidated inference is labeled; outputs preserve the difference between risk findings and not-assessed/error states.

## Verification
- Outcome matrix tests across both providers and report formats; deny a prerequisite and throw a rule to prove it cannot become pass.
- Contract compatibility tests reject or clearly label unsupported old versions.

For code-changing execution, run source build, the existing test suite, test type-check and meaningful lint after task 045 restores them. Record exact commands, exits and fixture/mock/live provenance. For research/documentation-only execution, validate references and review decisions; do not invent a test run or live result.

## Security, privacy and compatibility
- Preserve the local, read-only, no-telemetry CLI boundary; active tests/writes require a separately approved operating model and per-run authorization.
- Use synthetic/sanitized examples; do not store credentials, customer values or unnecessary personal identifiers in the repository. Apply task 049 policy where relevant.
- Version changed data contracts and document legacy input behavior. Never reinterpret missing evidence as a successful assessment, remediation or compliance.

## Documentation
Review README.md and update affected CLI examples, limitations, methodology and security guidance when behavior changes. Update the control-validation matrix/coverage documentation where applicable. Record the reviewed docs or explain why no user-facing change is needed. Keep planning claims distinct from shipped capability.

## Completion evidence
Pending. This 2026-09-26 update changes planning only; no acceptance criterion is recorded as implemented by this edit. Before completion, attach reviewed changes/artifact references, verification command results, observed acceptance outcomes, compatibility notes and any required human approval. Do not mark human-dependent work complete from fixtures or desk research alone.

## Planning references
- [Roadmap and release gates](../ROADMAP.md)
- [Assessment findings and verification](../ASSESSMENT-2026-09-26.md)
- [Existing-task reconciliation](../RECONCILIATION.md)
- [Initial control validation set](../CONTROL-VALIDATION.md)
- [Human decisions](../HUMAN-DECISIONS.md)

## Bug Queue
See the linked assessment findings; no implementation attempted in this planning update.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

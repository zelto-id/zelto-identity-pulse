# Task 055: Implement consistent score, grade, coverage and confidence

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
The existing engines normalize assessed categories differently and Okta caps grade independently from the displayed number. Users need a consistent, explained result with uncertainty visible.

## Scope
- Implement the policy approved in 053 in both providers and shared report consumers.
- Separate security deductions from maturity/advisory/profile/branding items as decided; expose weights, exclusions, caps and confidence rationale.
- Complete classifications so default advisory is not an accidental fallback for supported risk controls; maintain explicit policy/version metadata.

## Out of scope
- No customer-specific baseline profiles (036), cross-provider score equivalence claim or compliance score.

## Dependencies
- [053 — Define assessment outcomes and scoring policy](053-assessment-semantics-decision.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/auth0/auth0.scoring.ts](../../../src/analysis/auth0/auth0.scoring.ts)
- [src/analysis/okta/okta.scoring.ts](../../../src/analysis/okta/okta.scoring.ts)
- [src/analysis/auth0/auth0.findingMetadata.ts](../../../src/analysis/auth0/auth0.findingMetadata.ts)
- [src/analysis/okta/okta.report-support.ts](../../../src/analysis/okta/okta.report-support.ts)
- [src/reporting/combined/combined-summary.ts](../../../src/reporting/combined/combined-summary.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [tests/auth0/auth0.scoring.test.ts](../../../tests/auth0/auth0.scoring.test.ts)
- [tests/okta/okta.scoring.test.ts](../../../tests/okta/okta.scoring.test.ts)

## Acceptance criteria
- Hero score, grade, categories, JSON and combined-summary explanation agree with approved examples; capped grades/numbers are explicitly explained.
- Removing permissions cannot silently imply improved posture; coverage and confidence remain separate visible measures.
- Advisory/branding/profile findings have the documented impact and every deduction/exclusion can be traced to a rule outcome and policy version.

## Verification
- Healthy/risky/partial and cap-boundary cases in both providers; assert component deductions and explanations rather than only snapshots of totals.
- Compare renderers and mixed-provider summary caveats; do not imply calibrated equivalence without evidence.

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

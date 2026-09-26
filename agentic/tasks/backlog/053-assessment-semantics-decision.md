# Task 053: Define assessment outcomes and scoring policy

## Status
backlog

## Priority
P1

## Milestone
M2

## Type and readiness
Type: design.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
A missing finding currently conflates clean, inapplicable, unavailable and errored checks. The two scoring engines use different penalties/caps, and advisory/branding/profile completeness can affect the security narrative.

## Scope
- Decide an outcome/evidence/applicability table for pass, failed control, not applicable, not assessed and execution error; keep finding classification distinct.
- Decide score/grade/coverage/confidence semantics, denominators, caps and treatment of advisory, branding and profile-completeness findings.
- Specify a versioned migration policy and provisional heuristic labels using the 18 existing controls in CONTROL-VALIDATION.md.

## Out of scope
- No implemented scoring changes in this decision task; no compliance percentage or invented controls.

## Dependencies
- [051 — Expose incomplete collection and rule execution errors](051-collection-completeness-and-analysis-errors.md)
- [052 — Correct Okta policy interpretation](052-okta-policy-semantics.md)

## Human decisions and external prerequisites
Product owner and IAM reviewer choose scoring/outcome semantics; pilot feedback may require a later version.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/analysis/auth0/auth0.scoring.ts](../../../src/analysis/auth0/auth0.scoring.ts)
- [src/analysis/okta/okta.scoring.ts](../../../src/analysis/okta/okta.scoring.ts)
- [src/analysis/auth0/auth0.findingMetadata.ts](../../../src/analysis/auth0/auth0.findingMetadata.ts)
- [src/analysis/okta/okta.report-support.ts](../../../src/analysis/okta/okta.report-support.ts)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)

## Acceptance criteria
- A decision table covers direct evidence, missing permissions, unknown applicability, empty inventory and thrown rule execution.
- Worked examples explain numeric score, letter grade, assessed denominator, confidence and uncertainty together, including the current Okta 80/C and partial high-score cases.
- Product/IAM reviewer approves security versus maturity/advisory treatment; tasks 054/055 have no unresolved policy choice that would change their implementation.

## Verification
- Review synthetic healthy/risky/partial cases; record decisions, alternatives rejected and expected outcomes without claiming empirical validation.

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

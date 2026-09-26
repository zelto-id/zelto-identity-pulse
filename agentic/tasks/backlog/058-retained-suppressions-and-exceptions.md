# Task 058: Preserve findings behind suppressions and exceptions

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
Business-context suppression removes findings before scoring without preserving an auditable suppressed result. A design decision is not a technical fix.

## Scope
- Retain original evaluated finding/evidence and separately record presentation suppression, acceptance rationale, owner/reviewer, scope and expiry.
- Define exception data exchanged with task 034, using the stable identities from 056; avoid a second remediation store.
- Show effects on prioritization/scoring explicitly according to 053 and surface expired or unverifiable exceptions.

## Out of scope
- No workflow service, approval system, automatic remediation or retroactive invention of approvals for old config.

## Dependencies
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/business-context.ts](../../../src/core/business-context.ts)
- [src/config/report-config.ts](../../../src/config/report-config.ts)
- [src/analysis/auth0/auth0.analyzer.ts](../../../src/analysis/auth0/auth0.analyzer.ts)
- [src/analysis/okta/okta.analyzer.ts](../../../src/analysis/okta/okta.analyzer.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [tests/reporting/business-context.test.ts](../../../tests/reporting/business-context.test.ts)

## Acceptance criteria
- Suppressed findings remain in machine-readable evidence with original assessment status and separate exception metadata.
- Expired exceptions reappear for review; suppressions cannot generate configuration-fixed/resolved delta states.
- Legacy design decisions without owner/expiry are imported as incomplete/unreviewed context, not approved risk acceptance.

## Verification
- Apply/remove/expire an exception over repeat scans and compare evidence; use explicit assessment time.
- Validate malformed/overbroad exception selectors and privacy of free-text notes.

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

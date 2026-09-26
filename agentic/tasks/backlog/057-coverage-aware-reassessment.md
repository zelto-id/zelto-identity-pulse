# Task 057: Make reassessment compare like-for-like evidence

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
compareFindings treats every missing fingerprint as resolved. A permission loss, scope exclusion or evidence rewording can therefore look like remediation.

## Scope
- Compare stable identities with tenant/scope/coverage/config/rule-version compatibility; define partial/non-comparable states in JSON and HTML.
- Use current control outcomes to distinguish confirmed configuration fix, not reassessed, excluded and no longer applicable.
- Carry collection/assessment timestamps and source references for a configuration-only verification result.

## Out of scope
- No proof of access revocation, active session/token tests, multi-environment feature expansion (014) or remediation writes.

## Dependencies
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [055 — Implement consistent score, grade, coverage and confidence](055-consistent-score-grade-confidence.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/delta/delta-compare.ts](../../../src/reporting/delta/delta-compare.ts)
- [src/reporting/delta/delta.types.ts](../../../src/reporting/delta/delta.types.ts)
- [src/reporting/html/delta-report.html-renderer.ts](../../../src/reporting/html/delta-report.html-renderer.ts)
- [src/cli/commands/compare.ts](../../../src/cli/commands/compare.ts)
- [tests/delta](../../../tests/delta)

## Acceptance criteria
- Permission disappears: affected previous finding is not reassessed, never resolved.
- Evidence wording/display-name changes retain linkage; a scope-excluded object is not counted as fixed.
- A comparable reassessment with direct evidence of the fixed setting records configuration verified with supporting scan/control references.
- Changed rule/config versions, tenant and unsupported legacy reports are explicitly non-comparable or require a documented safe compatibility path.

## Verification
- Collector → analyzer → report → compare regression for lost Auth0 client scope and Okta policy coverage; assert each finding status and reason.
- Required five cases in CONTROL-VALIDATION.md, plus cross-tenant mismatch and changed rule versions; validate JSON and HTML together.

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

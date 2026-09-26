# Task 049: Decide local identifiers and shareable evidence policy

## Status
backlog

## Priority
P0

## Milestone
M1

## Type and readiness
Type: design.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Snapshot redaction does not remove emails/logins, while masking in reports is uneven. Stable reassessment and client sharing require an explicit data-minimization contract.

## Scope
- Inventory identifier fields and artifact classes; decide the minimum tenant-scoped source IDs needed locally, masking/pseudonymization for shared outputs, and any explicit opt-in.
- Document local retention/deletion responsibilities, file-access assumptions and safe export defaults; distinguish hashes/pseudonyms from anonymization.
- Resolve compatibility expectations for existing --include-identifiers and snapshots; provide synthetic examples for task 050.

## Out of scope
- Decision document only; no implementation, centralized storage, telemetry or change to project permissions/governance.

## Dependencies
None. This does not authorize external access or bypass human decisions below.

## Human decisions and external prerequisites
Product/security owner approves identifier and retention defaults; customer/auditor sharing feedback from 063 may refine them.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/connectors/auth0/auth0.types.ts](../../../src/connectors/auth0/auth0.types.ts)
- [src/connectors/okta/okta.types.ts](../../../src/connectors/okta/okta.types.ts)
- [src/cli/commands/scan-okta.ts](../../../src/cli/commands/scan-okta.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/markdown/okta-report.renderer.ts](../../../src/reporting/markdown/okta-report.renderer.ts)
- [SECURITY.md](../../../SECURITY.md)
- [README.md](../../../README.md)

## Acceptance criteria
- A reviewed field-by-artifact table says retained/masked/omitted for local snapshot, report, log, delta, register and shared pack.
- Linkability, customer confidentiality and practical handover tradeoffs have an explicit chosen default and unresolved items; no vague promise that all data is anonymous.
- Task 050 has reviewable fixtures and task 056 has a stable-identifier privacy constraint.

## Verification
- Review representative synthetic artifacts and proposed behavior with an IAM user/security reviewer; record the decision and reviewer.

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

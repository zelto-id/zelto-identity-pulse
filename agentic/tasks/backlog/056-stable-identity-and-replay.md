# Task 056: Stabilize tenant-scoped identities and reproducible replay

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
Finding fingerprints include evidence wording and resources derived from display strings, without tenant scope. Okta stale-user checks use Date.now, so identical snapshots can produce different assessments.

## Scope
- Separate stable finding/control-instance identity from evidence content/version; key resources by provider, tenant, object type and immutable source ID where available.
- Define deterministic fallback/aggregation behavior for missing IDs and findings spanning multiple objects; avoid false cross-tenant joins.
- Make assessment time explicit, record snapshot/scope/config/tool/rule versions and deterministically order semantic results; distinguish generation metadata from analysis inputs.

## Out of scope
- No cross-system identity matching, global identity registry or database.

## Dependencies
- [049 — Decide local identifiers and shareable evidence policy](049-identifier-and-artifact-policy.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/analysis/okta/okta.rules.ts](../../../src/analysis/okta/okta.rules.ts)
- [src/analysis/auth0/auth0.analyzer.ts](../../../src/analysis/auth0/auth0.analyzer.ts)
- [src/analysis/okta/okta.analyzer.ts](../../../src/analysis/okta/okta.analyzer.ts)
- [src/cli/commands/scan-auth0.ts](../../../src/cli/commands/scan-auth0.ts)
- [src/cli/commands/scan-okta.ts](../../../src/cli/commands/scan-okta.ts)
- [tests/auth0/auth0.json-report.test.ts](../../../tests/auth0/auth0.json-report.test.ts)
- [tests/okta/okta.json-report.test.ts](../../../tests/okta/okta.json-report.test.ts)

## Acceptance criteria
- Changing evidence wording or a display name retains identity for the same source object; identical IDs in different tenants do not collide.
- Same snapshot plus explicit assessment time/config/rule versions yields identical canonical analysis output, independent of wall clock; nondeterministic packaging metadata is documented separately.
- Legacy fingerprints have an explicit compatibility/migration state and cannot silently produce false resolution; source references obey identifier policy.

## Verification
- Rename, wording, resource reordering, multi-resource membership and cross-tenant collision tests.
- Replay stale-user fixtures with different system clocks but identical explicit inputs; verify the semantic result hash remains stable.

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

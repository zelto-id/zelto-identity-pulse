# Task 070: Design a separate controlled session/token test operating model

## Status
backlog

## Priority
P5

## Milestone
Later experiments

## Type and readiness
Type: design.
Readiness: deferred.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
A verified configuration change does not prove that existing sessions or tokens lose access. Runtime verification would exceed the current read-only collector model.

## Scope
- Define customer questions for existing sessions, refresh/access tokens, application caches and propagation delays using dedicated test identities.
- Specify explicit per-run authorization, allowed systems/actions, scope, containment, time limits, credential handling, stop conditions, recovery/rollback and evidence retention.
- Decide if a separate tool/workflow is justified only after customer validation; scope an implementation separately.

## Out of scope
- No revocation, login attempts, provider writes, production-user testing, token capture or change to current CLI permissions in this task.

## Dependencies
- [057 — Make reassessment compare like-for-like evidence](057-coverage-aware-reassessment.md)
- [065 — Make evidence-based pilot release and expansion decisions](065-pilot-release-and-expansion-decision.md)

## Human decisions and external prerequisites
Tenant/application owners, security reviewer and customer sponsor; explicit authorization required for any future active test.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [SECURITY.md](../../../SECURITY.md)
- [src/cli/index.ts](../../../src/cli/index.ts)
- [src/reporting/delta/delta.types.ts](../../../src/reporting/delta/delta.types.ts)
- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)

## Acceptance criteria
- A reviewed threat/operating model specifies allowed and forbidden operations and distinguishes configuration verification from observed session/token behavior.
- Dedicated identities, test apps, tenant-owner authorization, containment and recovery are prerequisites for any future run.
- Customer value and measurable runtime outcomes justify or reject follow-up implementation; no architecture or provider write authorization is assumed.

## Verification
- Tabletop review with identity/app owners and security reviewer; use synthetic scenarios only during design.

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

## Activation / subsequent scope
A committed customer needs runtime access-change evidence beyond task 057 and provides a safe isolated test environment and recovery owner.

## Bug Queue
See the linked assessment findings; no implementation attempted in this planning update.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

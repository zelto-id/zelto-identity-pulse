# Task 045: Restore trustworthy local and CI verification

## Status
active

## Priority
P0

## Milestone
M1

## Type and readiness
Type: implementation.
Readiness: ready.

First executable task. Native dependency mismatch is an observed local environment problem, not proof that every supported machine fails. CI configuration is not currently present.

## Problem and customer value
The source builds, but this checkout cannot run Vitest, test type-checking fails and lint masks failure. Engineers need checks that can detect the security/correctness regressions before changing collection.

## Scope
- Reproduce the supported Node/npm/architecture setup; repair installation reproducibility without blindly deleting the lockfile.
- Fix the four duplicate-field diagnostics in the Okta scoring test helper without weakening assertions.
- Configure a real lint tool and fail on lint errors; add offline CI for install, source build, test type-check, unit tests and lint.

## Out of scope
- No connector, rule or scoring behavior changes; no live integration job or secret-bearing CI.

## Dependencies
None. This does not authorize external access or bypass human decisions below.

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [package.json](../../../package.json)
- [package-lock.json](../../../package-lock.json)
- [tsconfig.json](../../../tsconfig.json)
- [tsconfig.test.json](../../../tsconfig.test.json)
- [vitest.config.ts](../../../vitest.config.ts)
- [tests/okta/okta.scoring.test.ts](../../../tests/okta/okta.scoring.test.ts)
- [tests](../../../tests)

## Acceptance criteria
- A clean supported installation runs the full existing suite; record runtime, OS/architecture, counts and command exits.
- Source and test type-checks pass; missing lint executable and a deliberately introduced lint violation each fail nonzero.
- A proposed new .github/workflows check runs offline on fixtures with no provider credentials, and a failing assertion fails the job.

## Verification
- Run npm run build, npm test, node_modules/.bin/tsc -p tsconfig.test.json --noEmit and npm run lint.
- Verify negative failure propagation locally; do not claim a remote CI run before it occurs.

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

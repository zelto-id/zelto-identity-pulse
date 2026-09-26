# Task 064: Validate Auth0 and Okta against authorized reference tenants

## Status
backlog

## Priority
P1

## Milestone
M4 pilot

## Type and readiness
Type: validation.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Fixtures and mocked HTTP do not establish real API/permission/engine behavior. The first pilot needs a manually verified reference set and least-privilege access evidence.

## Scope
- Prepare the process now: written authorization, dedicated nonproduction tenants, read-only collector scope, privacy/retention plan and human-owned setup/teardown.
- After M1 and fixture/control validation gates, compare collected fields and expected findings with manually checked reference configurations, including secure, insecure and denied/unsupported variants.
- Verify actual required permissions and license/API/engine limits per endpoint/subrequest for both auth modes where supported; distinguish tested from documented-only.

## Out of scope
- No production access, unapproved tenant changes, secret-bearing fixtures or claims of session/token enforcement testing. Tenant setup changes are human-owned and separately authorized.

## Dependencies
- [012 — Release documentation and permission reconciliation](012-oss-release-hardening.md)
- [017 — Validate existing Auth0 controls before coverage expansion](017-auth0-coverage-expansion.md)
- [018 — Validate existing Okta controls before coverage expansion](018-okta-coverage-expansion.md)
- [019 — Publish a control and coverage validation matrix](019-terraform-aligned-coverage-matrix.md)

## Human decisions and external prerequisites
Tenant owners provide authorization, test tenants, licenses and manual reference setup. Process preparation starts now; executing live validation waits for dependencies and M1 gate.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)
- [README.md](../../../README.md)
- [SECURITY.md](../../../SECURITY.md)
- [src/connectors/auth0/auth0.collectors.ts](../../../src/connectors/auth0/auth0.collectors.ts)
- [src/connectors/okta/okta.collectors.ts](../../../src/connectors/okta/okta.collectors.ts)
- [fixtures](../../../fixtures)
- [tests/auth0](../../../tests/auth0)
- [tests/okta](../../../tests/okta)

## Acceptance criteria
- A documented reference set records expected/actual finding IDs, source evidence, outcomes, limits and manually observed settings for the selected controls.
- Each claimed least-privilege permission row includes a real test reference/date, provider/engine/license context and denied-scope behavior; untested combinations are marked.
- False positives/important omissions are measured against the reference set; repeat scans and a configuration-only correction are reproducible with sanitized artifacts.
- No live run occurs without tenant-owner authorization; missing access leaves the task incomplete, never substituted by mocks.

## Verification
- Human-operated authorized integrations; record command versions, scope and sanitized outputs, not tokens or customer values.
- Re-run the offline reference tests after any discovered corrections; report fixture/mock/live results separately.

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

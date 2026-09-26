# Task 011: Minimal local audit evidence pack

## Status
backlog

## Priority
P1

## Milestone
M3

## Type and readiness
Type: implementation.
Readiness: blocked.

Moved from active to backlog on 2026-09-26. Not executable until prerequisites are complete. Original evidence-pack intent retained; static framework output and optional CSV no longer lead the queue.

## Problem and customer value
The old active task depended only on mapping/reporting tasks 008–010. Packaging unreliable collection, unstable comparisons or static coverage would amplify misleading evidence.

## Scope
- Generate a portable local HTML index plus JSON manifest, supported framework/control/source references and a manual-evidence checklist.
- Reuse current HTML/JSON reports and task 059 manifests; include collection scope, dates, limitations, configuration-verification references and optional local remediation register.
- Export only reviewed mapping versions; include KSC only after 062 and a separately reviewed implementation follow-up. Keep manual/process evidence and legal applicability clearly separate.

## Out of scope
- No certification, legal conclusions, compliance percentages, mandatory CSV/PDF, database, hosted portal or raw unredacted snapshots.

## Dependencies
- [010](../done/010-compliance-reporting-section.md)
- [017 — Validate existing Auth0 controls before coverage expansion](017-auth0-coverage-expansion.md)
- [018 — Validate existing Okta controls before coverage expansion](018-okta-coverage-expansion.md)
- [019 — Publish a control and coverage validation matrix](019-terraform-aligned-coverage-matrix.md)
- [034 — Minimal local remediation and exception register](034-remediation-workflow-findings-lifecycle.md)
- [057 — Make reassessment compare like-for-like evidence](057-coverage-aware-reassessment.md)
- [059 — Create a versioned evidence manifest and source references](059-evidence-manifest-and-traceability.md)
- [060 — Derive framework evidence strength from each scan](060-scan-derived-compliance-evidence.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [src/reporting/compliance/compliance-report.renderer.ts](../../../src/reporting/compliance/compliance-report.renderer.ts)
- [src/compliance/compliance.mapper.ts](../../../src/compliance/compliance.mapper.ts)
- [src/core/filesystem.ts](../../../src/core/filesystem.ts)
- [src/cli/index.ts](../../../src/cli/index.ts)
- [docs/compliance/identity-control-matrix.md](../../../docs/compliance/identity-control-matrix.md)

## Acceptance criteria
- An assessor opens index.html on a separate offline machine without Node or development tools and follows all supplied relative evidence links.
- A partial scan displays gaps and requested manual evidence without claiming complete control support; all control results resolve to sanitized sources.
- The package records versions, timestamps, scope and hash checks with the explicit limit that hashes do not prove authenticity, effectiveness or compliance.
- Produce a portable sample ready for the auditor/design-partner review tracked separately in 065. Task 011 can complete on packaging evidence; auditor acceptance remains a pilot release gate and is not claimed by these tests.

## Verification
- Fixture and mocked-collection pipelines generate complete/partial/error packs; verify every link, source reference, hash and privacy sentinel.
- Copy pack to a clean temp folder and open locally; test missing artifacts and unsupported mapping versions.

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

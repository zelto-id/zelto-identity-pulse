# Task 060: Derive framework evidence strength from each scan

## Status
backlog

## Priority
P1

## Milestone
M3

## Type and readiness
Type: implementation.
Readiness: blocked.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
compliance.mapper copies coverage and scannerEvidence from static control definitions. A mapped control can appear supported despite missing collection in this scan.

## Scope
- Compute evidence availability/strength from actual scoped outcomes, source references, collection freshness/completeness and applicability using reviewed mapping versions.
- Keep technical evidence, manual/process evidence and unresolved applicability separate; preserve unmapped controls and limitations.
- Render consistent per-scan evidence states in current HTML/JSON compliance sections and the later evidence pack.

## Out of scope
- No compliance percentages, organization-wide pass/fail, legal applicability engine or inference that a missing finding proves compliance.

## Dependencies
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [059 — Create a versioned evidence manifest and source references](059-evidence-manifest-and-traceability.md)
- [061 — Review and version existing NIS2, ISO 27001 and SOC 2 mappings](061-framework-mapping-provenance-review.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/compliance/compliance.mapper.ts](../../../src/compliance/compliance.mapper.ts)
- [src/compliance/compliance.types.ts](../../../src/compliance/compliance.types.ts)
- [src/compliance/finding-control-map.ts](../../../src/compliance/finding-control-map.ts)
- [src/reporting/compliance/compliance-report.renderer.ts](../../../src/reporting/compliance/compliance-report.renderer.ts)
- [tests/compliance](../../../tests/compliance)

## Acceptance criteria
- Deny a mapped collector and the affected control loses automated evidence strength with a reason, even if its static registry entry advertises coverage.
- An assessed clean result, failed control, stale evidence, not-applicable case and missing manual evidence are distinguishable.
- Each evidence assertion cites the scan/control/source and reviewed mapping version; absent KSC review cannot be presented as supported KSC evidence.

## Verification
- Mapping tests vary identical controls across complete/denied/truncated/stale scope and verify output language.
- Compare generated compliance JSON and HTML; confirm no organizational compliance score is introduced.

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

# Task 061: Review and version existing NIS2, ISO 27001 and SOC 2 mappings

## Status
backlog

## Priority
P1

## Milestone
M3

## Type and readiness
Type: review.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
The existing control registry and identity matrix are implemented internal mappings; source links are not independent validation. Some documentation and registry coverage differ.

## Scope
- Inventory current mapping/control IDs, edition/criterion references, rule relevance, caveats and manual evidence requirements.
- Research current authoritative primary sources when executing this task, record access/effective dates and licensing limits, and obtain qualified framework/auditor review.
- Resolve registry/documentation discrepancies (including the matrix ISO A.5.30 row), version the reviewed mappings, and explicitly label unreviewed entries.

## Out of scope
- No legal applicability opinion, certification, copied restricted standards text or fabricated reviewer approval; KSC is separate task 062.

## Dependencies
- [008](../done/008-compliance-identity-control-mapping.md)
- [009](../done/009-compliance-mapping-layer.md)
- [010](../done/010-compliance-reporting-section.md)

## Human decisions and external prerequisites
Qualified NIS2/ISO/SOC 2 reviewer and access to authoritative standards as needed. Source review can begin now; no legal conclusion is made by this backlog update.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [docs/compliance/identity-control-matrix.md](../../../docs/compliance/identity-control-matrix.md)
- [src/compliance/frameworks/nis2.controls.ts](../../../src/compliance/frameworks/nis2.controls.ts)
- [src/compliance/frameworks/iso27001.controls.ts](../../../src/compliance/frameworks/iso27001.controls.ts)
- [src/compliance/frameworks/soc2.controls.ts](../../../src/compliance/frameworks/soc2.controls.ts)
- [src/compliance/finding-control-map.ts](../../../src/compliance/finding-control-map.ts)
- [tests/compliance/compliance.mapper.test.ts](../../../tests/compliance/compliance.mapper.test.ts)

## Acceptance criteria
- Each retained mapping has an authoritative citation/edition, rationale, evidence boundary, review date/version and named qualified reviewer or explicit unreviewed status.
- Technical settings never stand in for policies, process operation, legal scope or organizational effectiveness.
- Reviewed changes are reconciled with the 18-control matrix before task 060 uses them; unmapped/unsupported areas remain visible.

## Verification
- Human source-by-source review and sample control walkthrough; record qualifications/approval privately as appropriate without exposing personal data.
- Schema/reference consistency tests for any subsequent registry edits; validate source links at execution time.

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

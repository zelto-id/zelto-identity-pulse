# Task 062: Validate a separate Polish KSC evidence mapping

## Status
backlog

## Priority
P1

## Milestone
M3

## Type and readiness
Type: research.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
KSC is not implemented. Reusing NIS2 labels without verifying current Polish law, applicability and evidence expectations would overstate support.

## Scope
- Identify current authoritative KSC legislation, applicable amendments/effective dates and identity/access evidence requirements during execution.
- Obtain qualified Polish legal/compliance review of applicability boundaries and an auditor review of technical/manual evidence mapping.
- Only after review, scope a versioned opt-in mapping using existing outcomes; retain unsupported/manual requirements and expiry/review triggers.

## Out of scope
- No legal advice during backlog maintenance, assumed equivalence to NIS2, organization certification or automatic compliance percentage.

## Dependencies
- [061 — Review and version existing NIS2, ISO 27001 and SOC 2 mappings](061-framework-mapping-provenance-review.md)

## Human decisions and external prerequisites
Polish legal/compliance reviewer, auditor and customer sector/scope information. KSC-labeled release is blocked until this review; generic Auth0/Okta pilot need not wait.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [docs/compliance/identity-control-matrix.md](../../../docs/compliance/identity-control-matrix.md)
- [src/compliance/compliance.types.ts](../../../src/compliance/compliance.types.ts)
- [src/compliance/frameworks/index.ts](../../../src/compliance/frameworks/index.ts)
- [src/compliance/finding-control-map.ts](../../../src/compliance/finding-control-map.ts)
- [tests/compliance](../../../tests/compliance)

## Acceptance criteria
- A dated, source-cited decision separates legal applicability, technical evidence and manual assessment; ambiguous provisions remain unresolved.
- KSC is advertised/exported only for the reviewed mapping version and declared scope; otherwise the product explicitly says unavailable/unreviewed.
- Any implementation follow-up has exact reviewed control IDs and human signoff; this research task alone does not add production support.

## Verification
- Qualified human review against current official sources and auditor walkthrough of a synthetic evidence pack; no live customer evidence required for the research.

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

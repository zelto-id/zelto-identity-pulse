# Task 059: Create a versioned evidence manifest and source references

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
Reports carry basic collection metadata but no complete versioned evidence inventory. Assessors need to reconstruct what was collected, in what scope, and how a control result was derived.

## Scope
- Define a local JSON manifest with declared tenant/provider/environment scope, inclusions/exclusions, collection start/end and assessment time, coverage/limits, tool/connector/rule/config/mapping versions and artifact hashes.
- Resolve each evaluated control to sanitized source object/field references and collected artifact locations, including evidence of successful empty inventory.
- Version the manifest and verify local relative artifact paths/hashes; reuse files, not a database.

## Out of scope
- No claim that hashes establish collection authenticity, control effectiveness or compliance; no signed attestation service or raw secret archive.

## Dependencies
- [050 — Enforce safe artifact and diagnostic handling](050-safe-artifacts-and-diagnostics.md)
- [051 — Expose incomplete collection and rule execution errors](051-collection-completeness-and-analysis-errors.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/core/filesystem.ts](../../../src/core/filesystem.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [src/connectors/auth0/auth0.connector.ts](../../../src/connectors/auth0/auth0.connector.ts)
- [src/connectors/okta/okta.connector.ts](../../../src/connectors/okta/okta.connector.ts)

## Acceptance criteria
- A manifest distinguishes declared scope, collected evidence, unassessed areas and generated artifacts; missing legacy metadata is unknown, never fabricated.
- Every selected control result resolves to the exact sanitized source fields used, or an explicit missing-evidence reason.
- Changing artifact bytes fails hash verification; broken/missing/out-of-root references are reported safely; replays preserve semantic provenance.

## Verification
- Generate manifests for healthy/risky/partial and imported legacy snapshots; follow source references with automated assertions.
- Tamper with a temp artifact, remove one, and supply a path traversal reference; verify safe diagnostic behavior.

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

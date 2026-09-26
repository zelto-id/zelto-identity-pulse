# Task 065: Make evidence-based pilot release and expansion decisions

## Status
backlog

## Priority
P1

## Milestone
M4 pilot

## Type and readiness
Type: decision.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Engineering completion is not customer validation. A release and new-provider commitment need measured usefulness, correctness and repeat-assessment demand.

## Scope
- Evaluate the reference run and partner/customer pilots against thresholds agreed in 063.
- Record false positives, important omissions, preparation time, replay reproducibility and willingness to pay; explain sample limits.
- Decide release/hold/narrow-scope and Entra activation/hold with blockers, owners and follow-up tasks; review KSC separately if offered.

## Out of scope
- No automatic deployment, invented pilot outcomes, legal compliance claim or blanket activation of deferred work.

## Dependencies
- [011 — Minimal local audit evidence pack](011-audit-evidence-pack-generation.md)
- [034 — Minimal local remediation and exception register](034-remediation-workflow-findings-lifecycle.md)
- [063 — Start auditor and pilot-customer discovery](063-pilot-customer-and-auditor-discovery.md)
- [064 — Validate Auth0 and Okta against authorized reference tenants](064-authorized-tenant-reference-validation.md)

## Human decisions and external prerequisites
Pilot customers, auditor/design partner and product/commercial owner decide readiness and demand. No release/deployment action is authorized by this task.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)
- [README.md](../../../README.md)
- [docs/compliance/identity-control-matrix.md](../../../docs/compliance/identity-control-matrix.md)

## Acceptance criteria
- Product/IAM owner and design partner review a dated decision with measured metrics, unresolved defects and explicit supported scope.
- The release excludes controls/mappings without adequate validation or labels their limitations; KSC marketing requires completed 062.
- Expansion decision records committed customer use case, available authorized test environment, narrow scope and support cost; lack of evidence keeps expansion blocked.

## Verification
- Human review of anonymized pilot evidence and reproducible artifact references; confirm metrics are from observed runs, not fixture expectations.

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

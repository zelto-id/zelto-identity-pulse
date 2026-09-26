# Task 068: Research cross-system identity and access relationships

## Status
backlog

## Priority
P4

## Milestone
Later experiments

## Type and readiness
Type: research.
Readiness: deferred.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Combined summaries group themes but do not resolve identities or compute cross-system access. A customer must identify a decision that needs this correlation.

## Scope
- Study one committed multi-provider question, match identifiers/relationships with provenance, ambiguity and confidence, and define expected manually verified answers.
- Evaluate privacy, false joins, scope gaps and changing identifiers before choosing any graph/storage architecture.

## Out of scope
- No global identity graph, new bulk collection, probabilistic match treated as fact, or automatic risk aggregation.

## Dependencies
- [065 — Make evidence-based pilot release and expansion decisions](065-pilot-release-and-expansion-decision.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)
- [059 — Create a versioned evidence manifest and source references](059-evidence-manifest-and-traceability.md)

## Human decisions and external prerequisites
Committed multi-provider design partner and authorized relationship reference data.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/reporting/combined/combined-summary.ts](../../../src/reporting/combined/combined-summary.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/connectors/auth0/auth0.types.ts](../../../src/connectors/auth0/auth0.types.ts)
- [src/connectors/okta/okta.types.ts](../../../src/connectors/okta/okta.types.ts)

## Acceptance criteria
- A bounded decision brief has customer value, reference relationships, match/error metrics, data requirements and explicit no-match/ambiguous states.
- Implementation remains a separately scoped follow-up; current combined summaries are not renamed correlation.

## Verification
- Manually checked synthetic/authorized dataset evaluation and privacy review before implementation.

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
A paying/committed pilot needs a cross-system question that independent reports cannot answer; collection contracts and stable IDs are proven.

## Bug Queue
See the linked assessment findings; no implementation attempted in this planning update.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

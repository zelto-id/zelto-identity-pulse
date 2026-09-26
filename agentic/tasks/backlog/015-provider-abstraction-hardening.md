# Task 015: Narrow provider contract conformance

## Status
backlog

## Priority
P2

## Milestone
M4 expansion

## Type and readiness
Type: implementation.
Readiness: blocked.

Reordered after current-provider repair and pilot decision, before the approved Entra implementation; no speculative platform prerequisite.

## Problem and customer value
Provider expansion should reuse corrected contracts, but an abstraction rewrite before fixing Auth0/Okta would delay usable functionality.

## Scope
- Extract only demonstrated duplication for collection status, validation, source evidence and report contracts needed by the approved next provider.
- Create provider conformance checks using Auth0/Okta, preserving visible provider-specific API and scoring limitations.

## Out of scope
- No plugin framework, dependency injection platform, unified identity graph or mandatory analyzer rewrite.

## Dependencies
- [051 — Expose incomplete collection and rule execution errors](051-collection-completeness-and-analysis-errors.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [055 — Implement consistent score, grade, coverage and confidence](055-consistent-score-grade-confidence.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)
- [059 — Create a versioned evidence manifest and source references](059-evidence-manifest-and-traceability.md)
- [065 — Make evidence-based pilot release and expansion decisions](065-pilot-release-and-expansion-decision.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/connectors/auth0](../../../src/connectors/auth0)
- [src/connectors/okta](../../../src/connectors/okta)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [tests](../../../tests)

## Acceptance criteria
- Both current providers pass conformance with unchanged approved findings/evidence on the same input.
- The approved next-provider task can use the contract without concealing permission, truncation or unsupported-shape states.
- Only abstractions justified by actual consumers are introduced; schema compatibility is tested.

## Verification
- Run source/test type-check, existing suite and collector-to-report conformance for both providers; review diff for accidental behavior changes.

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

## Relevant Agents
- Orchestrator
- Product Architect
- Connector Engineer
- Analyzer & Scoring Engineer
- Reporting Engineer
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

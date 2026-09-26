# Task 016: Provider onboarding kit for corrected contracts

## Status
backlog

## Priority
P2

## Milestone
M4 expansion

## Type and readiness
Type: documentation.
Readiness: blocked.

Existing ID retained; priority/scope reconciled with current implementation. See the reconciliation record.

## Problem and customer value
A short evidence/permission/test checklist can keep the next connector from repeating current defects.

## Scope
- Document origin/redirect rules, bounded pagination, normalization/validation, semantic redaction, evidence outcomes, stable IDs, manifests and license/permission provenance.
- Provide minimal fixture/mock/live-validation checklists using current Auth0/Okta patterns; define unsupported cases and report limitations.

## Out of scope
- No generated plugin SDK, new provider implementation or presumed live access.

## Dependencies
- [015 — Narrow provider contract conformance](015-provider-abstraction-hardening.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/connectors/auth0](../../../src/connectors/auth0)
- [src/connectors/okta](../../../src/connectors/okta)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)
- [README.md](../../../README.md)

## Acceptance criteria
- Walk the checklist against both implemented providers and resolve contradictions with current contracts.
- A new-provider design must specify supported questions, permissions, safe limits, unknown states and separate fixture/mock/live evidence before implementation.
- The kit names human test-access prerequisites and requires evidence/individual-finding assertions.

## Verification
- Documentation walkthrough against conformance tests from 015; link checks and a dry-run review of 066.

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
- Security & Privacy Reviewer
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

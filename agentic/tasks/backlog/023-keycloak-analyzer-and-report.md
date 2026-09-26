# Task 023: Keycloak analyzer/report after validated collection

## Status
backlog

## Priority
P3

## Milestone
Later growth

## Type and readiness
Type: implementation.
Readiness: deferred.

Existing ID retained; priority/scope reconciled with current implementation. See the reconciliation record.

## Problem and customer value
Realm configuration needs actionable, evidence-linked checks within confirmed API coverage.

## Scope
- Scope existing customer questions on clients, roles, authentication flows and session/token configuration.
- Use versioned outcomes/guidance, source references, scoring and comparable reassessment.

## Out of scope
- No implementation or external access before activation and a focused scope decision; no change to the near-term local read-only architecture.
- No credentials/customer data in planning artifacts; no presumed provider-write authorization.

## Dependencies
- [022 — Keycloak connector after provider-choice validation](022-keycloak-connector.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [055 — Implement consistent score, grade, coverage and confidence](055-consistent-score-grade-confidence.md)
- [057 — Make reassessment compare like-for-like evidence](057-coverage-aware-reassessment.md)

## Human decisions and external prerequisites
Product owner and a committed customer/design partner; authorized test access for any future integration.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)

## Acceptance criteria
- A dated activation/defer decision names the customer problem, evidence of demand, prerequisites, success metrics and scope boundaries.
- Research distinguishes implemented capability from documented API capability and unverified assumptions; any build is scoped as a separate approved follow-up.
- Each approved control needs positive/negative/unknown/applicability tests and guidance; configuration checks cannot claim active sessions/tokens are revoked.

## Verification
- Review relevant current source/fixtures and primary provider documentation when the task is activated.
- For a subsequent implementation, add meaningful fixture/mock/contract regressions and separately authorized reference integration; no fabricated validation results.

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
The selected Keycloak pilot has validated collector evidence and manually checked expected outcomes.

## Relevant Agents
- Orchestrator
- Product Architect
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

# Task 019: Publish a control and coverage validation matrix

## Status
backlog

## Priority
P1

## Milestone
M2

## Type and readiness
Type: documentation.
Readiness: blocked.

Original Terraform-aligned matrix narrowed to customer-relevant control validation; Terraform parity is not a milestone gate.

## Problem and customer value
Resource inventory or Terraform parity is not evidence of assessment coverage. Users need a transparent map of supported security questions and how each has been validated.

## Scope
- Publish the 18-control validation matrix with evidence prerequisites, applicability, outcome semantics, fixture/mock/live maturity and known gaps.
- Inventory remaining existing rule IDs and collected resource families as implemented/partial/heuristic/not assessed, separately from roadmap items.
- Keep Terraform resource terminology only as an optional lookup aid where useful; do not imply provider-schema parity.

## Out of scope
- No new Terraform integration, endpoint expansion, framework/legal mapping review (061/062) or invented real integration results.

## Dependencies
- [017 — Validate existing Auth0 controls before coverage expansion](017-auth0-coverage-expansion.md)
- [018 — Validate existing Okta controls before coverage expansion](018-okta-coverage-expansion.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [src/connectors/auth0/auth0.collectors.ts](../../../src/connectors/auth0/auth0.collectors.ts)
- [src/connectors/okta/okta.collectors.ts](../../../src/connectors/okta/okta.collectors.ts)
- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)
- [README.md](../../../README.md)

## Acceptance criteria
- All 59 existing IDs are accounted for and the selected 18 link to executable checks and guidance; unvalidated states are visible.
- Coverage separates objects collected, fields available, controls assessed and permissions/licensing gaps.
- Task 064 can append dated real reference evidence without relabeling mocks as integrations.

## Verification
- Cross-check catalog uniqueness/count and source/test links; inspect one supported, partial and unsupported case for each provider.

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
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

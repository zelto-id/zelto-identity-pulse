# Task 021: Implement Entra controls and reports for the approved scope

## Status
backlog

## Priority
P2

## Milestone
M4 expansion

## Type and readiness
Type: implementation.
Readiness: human-dependent.

Existing ID retained; priority/scope reconciled with current implementation. See the reconciliation record.

## Problem and customer value
A collector alone is not usable assessment coverage. Entra needs a small set of validated questions based only on evidence the approved connector can support.

## Scope
- Derive a reviewed initial control list from 066/customer reference configurations, with evidence prerequisites, outcomes and uncertainty.
- Implement analyzer/guidance and current report/manifest/delta contracts; separate technical findings from any reviewed framework mappings.
- Validate score/grade explanations and cross-provider summary caveats.

## Out of scope
- No manufactured rule-count target, full policy simulator, cross-system access graph or KSC/compliance claim from a connector.

## Dependencies
- [020 — Implement the approved narrow Entra read-only connector](020-entra-id-connector.md)

## Human decisions and external prerequisites
Entra/IAM reviewer and authorized reference tenant; follow expansion decision and contract gates.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [src/reporting/combined/combined-summary.ts](../../../src/reporting/combined/combined-summary.ts)
- [tests](../../../tests)

## Acceptance criteria
- Proposed new Entra analyzer has positive/negative/unknown/applicability cases for each approved control, with source references and complete guidance.
- Offline HTML/Markdown/JSON, replay and comparable config-only reassessment work with explicit license/API gaps.
- Human reference results are recorded separately from fixtures before Entra is added to supported-provider claims.

## Verification
- Conformance and report/delta regression tests plus authorized reference validation; assert individual findings and evidence.
- Check no incomplete policy inventory is interpreted as effective user enforcement.

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

# Task 018: Validate existing Okta controls before coverage expansion

## Status
backlog

## Priority
P1

## Milestone
M2

## Type and readiness
Type: implementation.
Readiness: blocked.

Original 018 expansion scope is retained as deferred candidates; immediate work validates existing controls.

## Problem and customer value
Okta has 30 rule IDs but several interpretation and guidance paths are heuristic. Most risky-fixture findings currently lack detailed validation steps.

## Scope
- Deeply validate the nine existing OKTA-* rules in CONTROL-VALIDATION.md, including supported policy engines/shapes and known license/permission gaps.
- Complete classification, evidence, remediation and validation guidance; document sampling and inability to prove effective user access.
- Keep membership graphs, device posture, richer lifecycle/log/admin coverage as customer-triggered follow-ups.

## Out of scope
- No effective-access graph, active login tests, new control count target or broad endpoint expansion.

## Dependencies
- [051 — Expose incomplete collection and rule execution errors](051-collection-completeness-and-analysis-errors.md)
- [052 — Correct Okta policy interpretation](052-okta-policy-semantics.md)
- [054 — Implement explicit control outcomes and evidence requirements](054-rule-outcomes-and-evidence-contract.md)
- [055 — Implement consistent score, grade, coverage and confidence](055-consistent-score-grade-confidence.md)
- [056 — Stabilize tenant-scoped identities and reproducible replay](056-stable-identity-and-replay.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/okta/okta.rules.ts](../../../src/analysis/okta/okta.rules.ts)
- [src/analysis/okta/okta.report-support.ts](../../../src/analysis/okta/okta.report-support.ts)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [tests/okta](../../../tests/okta)
- [fixtures/okta](../../../fixtures/okta)

## Acceptance criteria
- Nine selected rules have paired expected outcomes and source field evidence including denied/unsupported and inapplicable variants.
- Each supported finding has actionable remediation/validation steps and justified classification/confidence, not accidental advisory fallback.
- Sampled assignments/admin inventory and policy interpretation clearly label unproven conclusions; fixture success is not real-tenant validation.

## Verification
- Collector → analyzer → Markdown/HTML/JSON assertions per selected rule and guidance completeness.
- Test false positives and omissions against synthetic reference configurations; forward real engine/API unknowns to 064.

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
New Okta membership/app/admin/device/threat/lifecycle/log collection requires an important measured pilot omission, authorized API access and a focused follow-up task.

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

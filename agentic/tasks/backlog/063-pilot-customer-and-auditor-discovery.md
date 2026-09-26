# Task 063: Start auditor and pilot-customer discovery

## Status
backlog

## Priority
P1

## Milestone
M4 parallel discovery

## Type and readiness
Type: discovery.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
The engineering direction needs evidence of who will use repeated assessments and what evidence they will pay for. Discovery should not wait for an evidence pack or new provider.

## Scope
- Recruit one auditor/design partner and two prospective pilot customers for IAM-team/assessor/Zelto-led workflows.
- Test the local read-only workflow, selected control priorities, evidence handover needs, reassessment frequency and willingness to pay.
- Agree metrics and a measurement plan: false-positive rate with denominator, important omissions against a manual reference, evidence preparation time, replay reproducibility and willingness to pay for repeat assessment.

## Out of scope
- No fabricated interviews, unsolicited outreach by an agent, customer-tenant access, pricing commitment or hosted-product promise.

## Dependencies
None. This does not authorize external access or bypass human decisions below.

## Human decisions and external prerequisites
Product/commercial owner supplies introductions and conducts or explicitly authorizes outreach. This task can start immediately alongside 045; no engineering dependency.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [README.md](../../../README.md)
- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [docs/compliance/identity-control-matrix.md](../../../docs/compliance/identity-control-matrix.md)

## Acceptance criteria
- Human owner records consented conversations with one auditor/design partner and two prospective customers, separating requests from commitments.
- Each prospect has a stated use case, provider, constraints, success thresholds and interest/decline in a pilot; identities/notes stay in an approved private location.
- Task 065 receives measurable release/expansion criteria and explicit unknowns; task 066 receives actual Entra demand, if any.

## Verification
- Review interview guide and anonymized findings; audit sample size/denominators and do not label interest as revenue.

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

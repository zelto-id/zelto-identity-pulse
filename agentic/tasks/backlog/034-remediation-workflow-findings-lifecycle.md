# Task 034: Minimal local remediation and exception register

## Status
backlog

## Priority
P1

## Milestone
M3

## Type and readiness
Type: implementation.
Readiness: blocked.

Advanced P4 workflow brought forward as a minimal M3 file-based register. Database/collaboration features remain deferred.

## Problem and customer value
Recurring assessments need ownership and follow-up without requiring a database or SaaS. A manually closed item must not be mistaken for verified remediation.

## Scope
- Store a versioned local JSON register keyed by stable scoped finding identity with owner, status, due date, notes, evidence/verification references and expiring exceptions.
- Consume retained exception records from 058 and comparison results from 057; separate workflow status from scan-derived technical verification.
- Expose register context in existing HTML/JSON and task 011; validate imports and safe file updates.

## Out of scope
- No SQLite requirement (033), ticketing integration, collaboration backend, provider writes or automatic session/token tests.

## Dependencies
- [057 — Make reassessment compare like-for-like evidence](057-coverage-aware-reassessment.md)
- [058 — Preserve findings behind suppressions and exceptions](058-retained-suppressions-and-exceptions.md)
- [059 — Create a versioned evidence manifest and source references](059-evidence-manifest-and-traceability.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/business-context.ts](../../../src/core/business-context.ts)
- [src/core/filesystem.ts](../../../src/core/filesystem.ts)
- [src/reporting/delta/delta.types.ts](../../../src/reporting/delta/delta.types.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [src/cli/index.ts](../../../src/cli/index.ts)

## Acceptance criteria
- An owner can record acknowledged/in-progress/accepted-risk/closed workflow states with due dates; technical verification is a separate referenced result.
- A closure without comparable source evidence remains unverified; permission loss, scope exclusion and exception acceptance cannot mark a control fixed.
- Expiry/review dates surface exceptions for reassessment; original observations and evidence history are preserved across updates.
- Data is local, validated and handled under identifier/file-safety policy; concurrent/invalid updates fail safely.

## Verification
- Temporary-file lifecycle tests across owner change, expiry, missing reference, repeat scan and configuration fix.
- Render register plus evidence pack, confirming original evidence survives and no technical status is overwritten by a manual note.

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
- Reporting Engineer
- Security & Privacy Reviewer
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

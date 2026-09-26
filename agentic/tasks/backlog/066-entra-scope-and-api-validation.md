# Task 066: Validate the narrow Entra pilot scope

## Status
backlog

## Priority
P2

## Milestone
M4 expansion

## Type and readiness
Type: design.
Readiness: human-dependent.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
Entra is a provisional next connector with no implementation. Broad users/groups/logs collection would expand privacy and API complexity before proving value.

## Scope
- Discover whether committed pilots need administrative role assignments, authentication-policy coverage, enterprise applications and service principals.
- Map each proposed question to current authoritative Graph API documentation, minimum read permissions, admin consent, tenant roles, licenses and supported/unsupported APIs.
- Define normalized object IDs, completeness and evidence requirements using corrected contracts; identify exclusions and the minimum authorized reference tenant.

## Out of scope
- No connector implementation, bulk user/group/activity inventory by default, active authentication test or assumed effective-access coverage.

## Dependencies
- [063 — Start auditor and pilot-customer discovery](063-pilot-customer-and-auditor-discovery.md)

## Human decisions and external prerequisites
Committed Entra pilot requirement, Entra/Graph reviewer, authorized reference tenant and licenses. Discovery may proceed before an expansion build is approved.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [README.md](../../../README.md)

## Acceptance criteria
- A product/IAM-reviewed scope specifies supported questions, APIs/versions, permissions, license limits, unsupported cases and expected reference findings.
- Conditional Access/authentication-policy availability is not treated as proof of actual enforcement; collection gaps have explicit outcomes.
- Task 020 stays blocked until 065 approves expansion and authorized Entra tenant access is available; desk research alone is insufficient.

## Verification
- Primary-source review at execution time plus an explicitly authorized permission/API feasibility check when access is granted; label documented-only versus integration-tested claims.

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

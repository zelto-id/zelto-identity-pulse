# Task 020: Implement the approved narrow Entra read-only connector

## Status
backlog

## Priority
P2

## Milestone
M4 expansion

## Type and readiness
Type: implementation.
Readiness: human-dependent.

Original broad users/groups/tenant/apps/roles/log scope narrowed. Candidate paths are proposed, not existing Entra implementation.

## Problem and customer value
Entra has no connector. Expansion is provisional until pilot demand and a permission/API feasibility decision justify it.

## Scope
- Implement only the scope approved in 066: administrative roles, authentication-policy coverage, enterprise apps and service principals where APIs/permissions allow.
- Use corrected HTTPS/pagination/coverage/validation/redaction/source-reference contracts and tenant-scoped immutable IDs.
- Document licenses, Graph API versions, consent/role requirements, pagination and unsupported tenant/API cases.

## Out of scope
- No broad user/group/log inventory by default, AD DS, active access tests, writes or inferred effective enforcement.

## Dependencies
- [015 — Narrow provider contract conformance](015-provider-abstraction-hardening.md)
- [016 — Provider onboarding kit for corrected contracts](016-provider-onboarding-kit.md)
- [065 — Make evidence-based pilot release and expansion decisions](065-pilot-release-and-expansion-decision.md)
- [066 — Validate the narrow Entra pilot scope](066-entra-scope-and-api-validation.md)

## Human decisions and external prerequisites
Explicit expansion approval in 065, scoped approval in 066 and authorized Entra tenant/license access.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [src/cli/index.ts](../../../src/cli/index.ts)
- [src/config/report-config.ts](../../../src/config/report-config.ts)
- [tests](../../../tests)

## Acceptance criteria
- Proposed new src/connectors/entra directory provides normalized, validated read-only snapshots with explicit collection timestamps, scope and completeness.
- Mocked forbidden origins, timeout, throttling, denied permission, unsupported API/license and pagination limits yield safe visible outcomes.
- An authorized Entra reference integration confirms supported endpoints/minimum privileges before claiming provider support; missing access leaves status unverified.

## Verification
- Reuse provider conformance suite; safe synthetic fixtures and collector boundary tests.
- Human-authorized integration against the 066 reference tenant, with sanitized evidence and no writes.

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
- Security & Privacy Reviewer
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

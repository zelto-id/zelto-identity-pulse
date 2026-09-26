# Task 067: Choose AD or Keycloak only from committed pilot need

## Status
backlog

## Priority
P3

## Milestone
Later providers

## Type and readiness
Type: discovery.
Readiness: deferred.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
AD has no implementation or dedicated connector task; Keycloak has backlog designs only. Their deployment/access models differ and neither should be assumed next.

## Scope
- Compare committed AD DS and Keycloak assessment needs, deployment constraints, permissible read interfaces, privileges, evidence questions and test access.
- Define a narrow discovery result and create a separate reviewed AD implementation task only if AD is selected; otherwise activate existing 022/023 for selected Keycloak scope.
- Assess local/domain connectivity and identifier sensitivity without committing to an agent, LDAP/Graph bridge or hosted architecture.

## Out of scope
- No AD/Keycloak connector, AD-as-Entra assumption, credential extraction or provider writes.

## Dependencies
- [065 — Make evidence-based pilot release and expansion decisions](065-pilot-release-and-expansion-decision.md)

## Human decisions and external prerequisites
Customer/domain or realm owner and product owner must supply a committed requirement and test access.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/connectors](../../../src/connectors)
- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/reporting/json/report-contract.types.ts](../../../src/reporting/json/report-contract.types.ts)
- [README.md](../../../README.md)

## Acceptance criteria
- Selection or explicit defer decision cites a committed pilot, required controls, authorized test environment and operational constraints.
- API/permission research uses current primary sources; unsupported evidence and costs are explicit.
- An implementation task is scoped only for the chosen provider after corrected contracts and onboarding prerequisites.

## Verification
- Human discovery review and scoped technical feasibility review; do not infer deployment from customer interest.

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
A committed pilot requires AD or Keycloak and cannot be served by validated Auth0/Okta/Entra coverage.

## Bug Queue
See the linked assessment findings; no implementation attempted in this planning update.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

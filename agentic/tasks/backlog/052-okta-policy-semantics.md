# Task 052: Correct Okta policy interpretation

## Status
backlog

## Priority
P0

## Milestone
M1

## Type and readiness
Type: implementation.
Readiness: blocked.

New corrective/direction task; no implementation is claimed.

## Problem and customer value
ruleHasStrongVerification searches serialized action text, so a field such as requireFactor:false can count as strong verification. IAM teams need configuration semantics rather than property-name matches.

## Scope
- Interpret supported action/condition values explicitly for sign-on, enrollment and recovery rules.
- Account for allow/deny, enabled/disabled rule state, supported engine/API shapes and relevant scope; classify unsupported or ambiguous shapes as requiring validation/not assessed.
- Document limitations where effective user/application policy resolution is not collected.

## Out of scope
- No authentication exercises, effective-access graph or broad Okta coverage expansion.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/analysis/okta/okta.rules.ts](../../../src/analysis/okta/okta.rules.ts)
- [src/connectors/okta/okta.types.ts](../../../src/connectors/okta/okta.types.ts)
- [src/analysis/rules/rule-catalog.ts](../../../src/analysis/rules/rule-catalog.ts)
- [tests/okta/okta.rules.test.ts](../../../tests/okta/okta.rules.test.ts)
- [tests/okta/okta.connector.test.ts](../../../tests/okta/okta.connector.test.ts)

## Acceptance criteria
- requireFactor:false and an arbitrary matching field name do not satisfy strong-verification requirements; genuine enabled supported controls do.
- Deny/inactive rules and unknown engine shapes do not generate misleading effective-enforcement claims.
- Mocked collection → analyzer → all report formats shows the expected OKTA-POL-003 finding/evidence for a weak allow rule and clear uncertainty for unsupported shapes.

## Verification
- Pair true/false/missing/malformed fields, allow/deny, active/inactive and relevant supported policy variants.
- Retain fixtures and capture exact evidence/classification differences; real tenant confirmation remains task 064.

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

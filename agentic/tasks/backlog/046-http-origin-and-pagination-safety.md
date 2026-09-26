# Task 046: Contain credentials and bound HTTP collection

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
Okta buildUrl accepts absolute HTTP and foreign-origin next links, and get attaches authorization. Both clients lack explicit request timeouts. A read-only collector still needs credential containment and bounded execution.

## Scope
- Validate configured origins and every initial, pagination and redirect destination as approved HTTPS origins before sending credentials; reject URL credentials and unsafe origin/port changes.
- Choose explicit redirect handling, bounded request/retry duration, pagination page/item limits and repeated-link/offset detection for both clients.
- Return structured stop reasons and truncation metadata for task 051 to propagate; preserve rate-limit backoff within the total budget.

## Out of scope
- No arbitrary endpoint allowlist UI, provider writes, network probing or new auth flow.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/connectors/okta/okta.client.ts](../../../src/connectors/okta/okta.client.ts)
- [src/connectors/auth0/auth0.client.ts](../../../src/connectors/auth0/auth0.client.ts)
- [tests/okta/okta.client.test.ts](../../../tests/okta/okta.client.test.ts)
- [src/core/errors.ts](../../../src/core/errors.ts)

## Acceptance criteria
- A foreign HTTPS next link, HTTP downgrade, credential-bearing URL and unsafe redirect are rejected before a request carrying Authorization is dispatched.
- Same-origin pagination and approved same-origin redirects work; redirects cannot silently escape the origin policy.
- Hanging responses, repeated links, repeated pages, exhausted retries and item/page caps terminate with explicit failure/partial metadata rather than apparent complete success.

## Verification
- Use injected fetch/fake timers, never external endpoints; assert request destinations and authorization presence, without printing token values.
- Exercise 429/5xx, redirect chains, exact-boundary and over-limit collection; task 051 adds final report propagation.

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

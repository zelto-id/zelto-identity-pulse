# Task 047: Preserve security configuration while removing secrets

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
Auth0 redact treats token/password key fragments as secrets and replaces configuration objects/scalars that rules consume. A stable overall score can hide lost findings.

## Scope
- Use field/shape-aware redaction for both normalized snapshot types; separate credential values from security configuration.
- Preserve refresh-token policy, token-endpoint authentication method, API token lifetimes, password-policy settings and breached-password controls.
- Review nested scripts/actions/hooks/headers for secret-bearing fields; use synthetic sentinels only.

## Out of scope
- No retention of real secret values, raw-export bypass or new controls. Identifier policy is task 049.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/connectors/auth0/auth0.redaction.ts](../../../src/connectors/auth0/auth0.redaction.ts)
- [src/connectors/okta/okta.redaction.ts](../../../src/connectors/okta/okta.redaction.ts)
- [src/connectors/auth0/auth0.connector.ts](../../../src/connectors/auth0/auth0.connector.ts)
- [src/connectors/okta/okta.connector.ts](../../../src/connectors/okta/okta.connector.ts)
- [tests/auth0/auth0.redaction.test.ts](../../../tests/auth0/auth0.redaction.test.ts)
- [tests/okta/okta.redaction.test.ts](../../../tests/okta/okta.redaction.test.ts)
- [fixtures](../../../fixtures)

## Acceptance criteria
- Mocked collector → connector redaction → analyzer → HTML/Markdown/JSON retains AUTH-CLI-004, AUTH-CLI-005, AUTH-API-003 and AUTH-SEC-005 with the expected source values/evidence on a risky synthetic input.
- Security configuration stays correctly typed; secrets, authorization headers, cookies, private keys and embedded credential sentinels never appear in serialized snapshots, reports or logs.
- Redaction is idempotent and does not corrupt legitimate identifiers needed for later linking.

## Verification
- Assert exact rule IDs, field types and evidence excerpts before/after collection, not merely overall score.
- Cover arrays, nested keys, harmless token/password policy names, secret-looking strings and already-redacted imports; retain existing redaction tests.

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

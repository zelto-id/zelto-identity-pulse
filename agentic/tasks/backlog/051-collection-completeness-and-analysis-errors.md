# Task 051: Expose incomplete collection and rule execution errors

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
Denied Auth0 Guardian/attack-protection/role subrequests can appear successful; unknown response shapes become empty arrays; Auth0 runAllRules swallows exceptions. Missing evidence must not look like an assessed clean result.

## Scope
- Carry per-subrequest success/empty/denied/unsupported/malformed/failed/truncated information into snapshot coverage.
- Propagate task 046 limits and sampling metadata, including users, app assignments and logs; distinguish unavailable from intentionally disabled collectors.
- Expose sanitized rule execution errors and affected assessment areas through analyzers and reports; do not redesign the full outcome model reserved for 053/054.

## Out of scope
- No new endpoints or expansion of collection volume by default; no scoring redesign.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)
- [046 — Contain credentials and bound HTTP collection](046-http-origin-and-pagination-safety.md)
- [047 — Preserve security configuration while removing secrets](047-semantic-redaction.md)
- [048 — Validate and sanitize every imported snapshot](048-snapshot-validation-and-sanitization.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/connectors/auth0/auth0.collectors.ts](../../../src/connectors/auth0/auth0.collectors.ts)
- [src/connectors/okta/okta.collectors.ts](../../../src/connectors/okta/okta.collectors.ts)
- [src/connectors/auth0/auth0.client.ts](../../../src/connectors/auth0/auth0.client.ts)
- [src/connectors/okta/okta.client.ts](../../../src/connectors/okta/okta.client.ts)
- [src/analysis/auth0/auth0.rules.ts](../../../src/analysis/auth0/auth0.rules.ts)
- [src/analysis/okta/okta.rules.ts](../../../src/analysis/okta/okta.rules.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [src/reporting/markdown/okta-report.collection-status.ts](../../../src/reporting/markdown/okta-report.collection-status.ts)

## Acceptance criteria
- Guardian and attack-protection 403/404 and denied role-permission subrequests produce visible partial/unavailable evidence; a verified successful empty response remains distinguishable.
- Malformed wrapper and unsupported API shape never silently become complete empty inventory.
- Injected rule exception yields a visible analysis-error state and affected coverage, with no claim that the control passed.
- Collector → analyzer → report tests assert status, rule IDs, evidence and limitations for both providers, including cap exhaustion and partial subresources.

## Verification
- Mock 200-empty, 403, 404, malformed, mixed successful/denied children, item caps and thrown rules.
- Render Markdown/HTML/JSON and check that limitations agree; ensure unsafe provider errors are sanitized.

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

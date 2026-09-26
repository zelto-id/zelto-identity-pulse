# Task 048: Validate and sanitize every imported snapshot

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
Both --from-snapshot paths use a generic JSON cast and can resave imported data unchanged. Offline input must meet the same privacy and assessment requirements as collection.

## Scope
- Validate provider, schema/version, collection metadata, coverage states and provider object/field shapes at the CLI boundary.
- Sanitize validated imports before analysis, logging or snapshot persistence using task 047; define supported legacy migration/rejection behavior.
- Bound file size and unsafe structures; reject inconsistent provider and malformed input with safe diagnostics.

## Out of scope
- No database, remote import, silent best-effort coercion of unknown schemas or raw secret persistence.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)
- [047 — Preserve security configuration while removing secrets](047-semantic-redaction.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/cli/commands/scan-auth0.ts](../../../src/cli/commands/scan-auth0.ts)
- [src/cli/commands/scan-okta.ts](../../../src/cli/commands/scan-okta.ts)
- [src/core/filesystem.ts](../../../src/core/filesystem.ts)
- [src/core/schema.ts](../../../src/core/schema.ts)
- [src/connectors/auth0/auth0.types.ts](../../../src/connectors/auth0/auth0.types.ts)
- [src/connectors/okta/okta.types.ts](../../../src/connectors/okta/okta.types.ts)
- [tests/config](../../../tests/config)
- [tests/reporting](../../../tests/reporting)

## Acceptance criteria
- A synthetic credential planted in an import is absent from resaved snapshot, rendered outputs and errors.
- Malformed, wrong-provider, unsupported-version, oversized and inconsistent-coverage imports are rejected before report generation or unsafe persistence.
- Supported existing fixtures still generate reports; legacy imports have explicit warnings/migration and no invented collection completeness.

## Verification
- Run both offline CLI paths through import → sanitize → analysis → --save-snapshot → all reports.
- Test corrupt JSON and valid JSON with invalid nested structures; assert safe error categories and exit codes.

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

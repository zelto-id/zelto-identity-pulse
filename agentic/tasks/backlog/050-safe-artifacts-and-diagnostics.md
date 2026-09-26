# Task 050: Enforce safe artifact and diagnostic handling

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
Logger metadata is serialized without sanitization; provider errors may contain sensitive content. mode 0600 only applies on file creation and does not tighten an existing permissive file.

## Scope
- Apply task 049 identifier policy across snapshots/reports/diagnostics and CLI failure paths.
- Centralize safe error and log formatting; avoid credential-bearing URLs/provider response dumps.
- Secure new and overwritten output files, handle symlinks/unsafe destinations deliberately and document POSIX/Windows limits; preserve safe failure behavior.

## Out of scope
- No encryption service, credential vault, remote storage or change to CLI read-only provider access.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)
- [047 — Preserve security configuration while removing secrets](047-semantic-redaction.md)
- [048 — Validate and sanitize every imported snapshot](048-snapshot-validation-and-sanitization.md)
- [049 — Decide local identifiers and shareable evidence policy](049-identifier-and-artifact-policy.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [src/core/logger.ts](../../../src/core/logger.ts)
- [src/core/filesystem.ts](../../../src/core/filesystem.ts)
- [src/core/errors.ts](../../../src/core/errors.ts)
- [src/cli/index.ts](../../../src/cli/index.ts)
- [src/cli/commands/scan-auth0.ts](../../../src/cli/commands/scan-auth0.ts)
- [src/cli/commands/scan-okta.ts](../../../src/cli/commands/scan-okta.ts)
- [src/reporting/report-output.ts](../../../src/reporting/report-output.ts)
- [src/reporting/json/report-contract.ts](../../../src/reporting/json/report-contract.ts)
- [SECURITY.md](../../../SECURITY.md)

## Acceptance criteria
- Synthetic secrets/identifiers injected into provider error bodies, exceptions and verbose metadata follow the approved policy in every output channel.
- Rewriting a pre-existing 0644 sensitive artifact produces owner-only access on supported POSIX systems or fails safely; symlink handling cannot redirect writes unnoticed.
- Default shared outputs exclude unnecessary personal identifiers; explicit opt-in behavior and platform limits are documented and tested.

## Verification
- Capture stdout/stderr in success/failure/verbose CLI tests; assert absence of secret sentinels.
- Use temporary files to test new/existing files, directory permissions, symlinks and unwritable paths without touching user artifacts.

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

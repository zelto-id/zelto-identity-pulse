# Task 012: Release documentation and permission reconciliation

## Status
backlog

## Priority
P1

## Milestone
M1

## Type and readiness
Type: implementation.
Readiness: blocked.

Existing ID retained; priority/scope reconciled with current implementation. See the reconciliation record.

## Problem and customer value
README, SECURITY and examples can overstate redaction/permissions or hide limitations. A usable release needs instructions that match corrected behavior and verified versus unverified coverage.

## Scope
- Reconcile README, SECURITY, .env.example and manual scenarios with actual auth modes, required scopes, import validation, limits, errors, identifier handling and output permissions.
- Provide reproducible offline quickstart and sanitized sample report references; document no hidden credential prompt unless implemented elsewhere.
- Publish a permission matrix with code/doc/integration-tested provenance; real tenant verification belongs to 064. Review package contents and release notes.

## Out of scope
- No publishing/deployment, new credential prompt/auth flow, dependency fixes (045) or invented least-privilege certification.

## Dependencies
- [045 — Restore trustworthy local and CI verification](../active/045-verification-toolchain.md)
- [046 — Contain credentials and bound HTTP collection](046-http-origin-and-pagination-safety.md)
- [047 — Preserve security configuration while removing secrets](047-semantic-redaction.md)
- [048 — Validate and sanitize every imported snapshot](048-snapshot-validation-and-sanitization.md)
- [050 — Enforce safe artifact and diagnostic handling](050-safe-artifacts-and-diagnostics.md)
- [051 — Expose incomplete collection and rule execution errors](051-collection-completeness-and-analysis-errors.md)
- [052 — Correct Okta policy interpretation](052-okta-policy-semantics.md)

## Human decisions and external prerequisites
None beyond normal implementation review.

## Affected components / verified starting points
Paths below exist at the reviewed baseline. New modules mentioned in acceptance criteria are proposals, not implemented capabilities.

- [README.md](../../../README.md)
- [SECURITY.md](../../../SECURITY.md)
- [.env.example](../../../.env.example)
- [package.json](../../../package.json)
- [src/connectors/auth0/auth0.collectors.ts](../../../src/connectors/auth0/auth0.collectors.ts)
- [src/connectors/okta/okta.collectors.ts](../../../src/connectors/okta/okta.collectors.ts)
- [docs/manual-e2e-test-scenarios.md](../../../docs/manual-e2e-test-scenarios.md)

## Acceptance criteria
- Quickstart works from supported clean setup with fixtures for both providers; auth examples contain no credentials.
- Every permission claim names collected data and required/optional subrequests, with untested license/role/engine variants marked.
- Known limitations and current release gate are explicit; M1 is engineering readiness, not completed pilot/compliance validation.
- Archive/package inspection contains no .env, tenant snapshots or customer artifacts.

## Verification
- Run documented local fixture commands, verify safe error/help behavior and inspect a package dry-run file list without publishing.
- Cross-check every security claim with tests and task 049 policy; check documentation links.

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
- Security & Privacy Reviewer
- QA & Test Engineer

## Bug Queue
Historical placeholder: no implementation bugs were logged in this task. Current baseline issues and corrective ownership are in the assessment record.

## Iteration Log
- 2026-09-26 — Planning reconciliation at `3ba2626747a870c510162060fd6f3ba7849d07af`; scope/dependencies updated, implementation not executed. Completed-task history preserved separately.

## Definition of done
Meet the acceptance criteria and existing repository definition of done; preserve explicit unverified limitations and record completion evidence above. Deferred work also requires its activation evidence.

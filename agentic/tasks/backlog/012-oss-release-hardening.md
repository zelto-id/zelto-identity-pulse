# Task: OSS Release Hardening

## Status
backlog

## Priority
P1

## Product Rationale
An open-source release must be safe, understandable, and credible before it can support adoption, contributions, and commercial trust.

## Goal
Harden repository documentation, examples, and safety guidance for a public-friendly release.

## Relevant Backlog Source
`design/zelto-identity-pulse-post-mvp-backlog-updated-prioritized-business-context.md`:
- `P1 — Commercial Assessment Value`
- `012 — OSS Release Hardening`

## Relevant Agents
- Orchestrator
- Product Architect
- Security & Privacy Reviewer
- QA & Test Engineer

## Scope
- Review and improve README, installation, quick start, Auth0 setup, Okta setup, sample reports, demo fixtures, contributing guidance, security policy, safe `.env.example`, screenshots, and known limitations.
- Clarify licensing and safe usage guidance.

## Out of Scope
- Hosted documentation site.
- SaaS signup or licensing flows.
- Commercial packaging.

## Acceptance Criteria
- Public-facing documentation is coherent and safe.
- Auth0 and Okta quick starts are documented.
- Safety guidance for secrets and `.env` usage is explicit.
- Demo assets and examples are redacted and credible.

## Required Test Commands
- `npm run build`
- `npm test`

## Manual Verification
- Review the repo from a fresh-clone perspective and confirm onboarding steps are clear.
- Check all examples for placeholder-only secrets and safe defaults.
- Confirm documentation still reflects local-first, read-only behavior.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
_No iterations recorded yet._

## Definition of Done
This task is done only when:
- scope is implemented
- out-of-scope items were not implemented
- acceptance criteria pass
- build passes
- tests pass
- task-related bugs are fixed or documented
- no secrets are exposed
- final summary is provided

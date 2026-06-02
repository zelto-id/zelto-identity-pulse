# Zelto Identity Pulse — Agentic Delivery Instructions

## Purpose

This repository uses Markdown-based agents, context files, and task files to guide implementation.

Codex must not work from vague prompts alone. It must read the relevant task, context, and agent files before making changes.

The goal is to make development repeatable, scoped, testable, and aligned with the product direction.

---

## Product Context

Zelto Identity Pulse is a local-first Node.js/TypeScript CLI for identity-security posture assessment.

Current first-class providers:

- Auth0 / CIAM
- Okta Workforce Identity

The product should remain:

- local-first
- read-only
- deterministic
- no SaaS backend yet
- no write/remediation operations
- no telemetry
- no secret leakage
- useful for identity-security assessments, remediation validation, and recurring reviews

---

## Repository Operating Model

The repo uses this structure:

```text
/agentic/agents   = specialist role instructions
/agentic/context  = product and architecture memory
/agentic/tasks    = implementation queue
/design   = deeper design docs and backlog
```

Codex should treat `/agentic/tasks/active` as the source of truth for current implementation work.

---

## Default Workflow

When asked to work on the project, Codex must:

1. Read `/agentic/context/product-principles.md`
2. Read `/agentic/context/architecture-decisions.md`
3. Read `/agentic/context/security-privacy-standards.md`
4. Read `/agentic/context/report-quality-standards.md`
5. Read the active task file from `/agentic/tasks/active`
6. Read `/agentic/agents/00-orchestrator.md`
7. Read any specialist agents listed in the active task
8. Inspect the existing codebase
9. Create a short implementation plan
10. Implement only the requested task scope
11. Run required tests/build commands
12. Fix task-related failures
13. Update the task's Iteration Log if present
14. Summarize files changed, tests run, and remaining risks

---

## Active Task Rule

The source of truth for current work is `/agentic/tasks/active`.

If there is exactly one active task, execute that task.

If there are multiple active tasks, ask which one to execute.

If there are no active tasks, suggest the next task from `/agentic/tasks/backlog`, but do not implement it without confirmation.

---

## Hard Rules

Codex must follow these rules:

- Do not implement beyond the active task scope.
- Do not introduce SaaS/backend/UI unless explicitly requested.
- Do not add write operations to Auth0, Okta, or any identity provider.
- Do not log, print, persist, or expose secrets.
- Do not commit or generate real tokens.
- Do not add telemetry.
- Keep the product local-first.
- Prefer deterministic analysis and reporting over AI-generated findings.
- Do not add new providers unless a task explicitly requests it.
- Do not overbuild abstractions before they are needed.
- Generated reports must not expose tokens, secrets, or unnecessary user identifiers.
- If a discovered issue is unrelated to the active task, create a backlog task instead of expanding scope.

---

## Security and Privacy Rules

Always protect:

- API tokens
- OAuth access tokens
- refresh tokens
- client secrets
- private keys
- passwords
- authorization headers
- cookies
- session values
- webhook secrets
- inline credentials
- real tenant/user data

Generated reports should mask user identifiers by default.

Use explicit opt-in flags for sensitive output, for example:

```text
--include-identifiers
--include-raw
```

Never include secrets in logs, errors, reports, snapshots, tests, or fixtures.

---

## Connector Rules

Connectors must be read-only.

Allowed:

- GET/list/read operations
- pagination
- rate-limit handling
- retry handling
- normalized snapshots
- collector status and coverage

Not allowed:

- create
- update
- delete
- remediation writes
- provider-side configuration changes

Analyzers must consume normalized snapshots, not raw provider response shapes.

---

## Analyzer and Scoring Rules

Findings must be deterministic and explainable.

Findings should distinguish:

- confirmed-risk
- requires-validation
- advisory
- positive-signal

Missing data should reduce confidence, not automatically destroy score.

Medium-confidence findings should not collapse a category unless the active task explicitly defines that behavior.

Scores must be consistent between:

- hero score
- category scores
- score interpretation
- JSON report output
- HTML/Markdown report output

---

## Reporting Rules

Reports should be useful to both:

- IAM/CIAM engineers
- business stakeholders

Reports should include, where applicable:

- Executive Summary
- Score Interpretation
- Key Decisions Required
- Recommended Remediation Plan
- Positive Signals
- Findings by Severity
- Opportunities
- Resource Coverage
- What Was Not Assessed
- Methodology

Reports must not:

- dump large raw user/app lists inline
- expose tokens/secrets
- repeat the same finding many times
- overstate compliance
- imply complete assurance when coverage is partial

---

## Iteration and Bug-Fix Loop

For every active task, Codex must follow this loop:

1. Implement the task.
2. Run the required test commands listed in the task file.
3. If tests fail, fix the failures before stopping.
4. If build fails, fix the build before stopping.
5. If manual verification reveals bugs, they should be added to the task's Bug Queue.
6. Fix only bugs related to the active task.
7. Add regression tests for fixed bugs where practical.
8. Repeat until:
   - build passes
   - tests pass
   - acceptance criteria pass
   - task-related bugs are fixed or clearly documented

Do not mark a task complete after first implementation if bugs remain.

If a discovered bug is unrelated to the active task, create a new backlog task instead of expanding scope.

---

## Definition of Done

A task is done only when:

- active task scope is implemented
- out-of-scope items were not implemented
- acceptance criteria pass
- build passes
- tests pass
- relevant report/fixture generation works if applicable
- no secrets are exposed
- task-related bugs are fixed or documented
- final summary is provided

---

## Required Final Output

At the end of every implementation, Codex must provide:

```text
Summary
Files changed
Tests run
Build result
Known risks / follow-ups
```

If tests or build commands could not be run, Codex must explain why.

---

## Standard Codex Instruction

When the user says:

```text
Read AGENT.md and execute the active task in /agentic/tasks/active.
```

Codex should follow this file completely.

Do not ask for a new long prompt unless the task is unclear.

Read AGENT.md and execute the active task in agentic/tasks/active.
Follow the iteration and bug-fix loop.
Do not implement anything outside the task scope.
Run build/tests and summarize the result.

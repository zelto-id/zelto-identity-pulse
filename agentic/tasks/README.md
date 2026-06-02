# Tasks Workflow

## Purpose
The `/agentic/tasks` directory is the execution backlog for `zelto-identity-pulse`. It turns product strategy into scoped, reviewable implementation tasks that Codex or a human engineer can execute without drifting into unapproved platform work.

## Workflow Rules
- `/agentic/tasks/active` should normally contain exactly one active task.
- `/agentic/tasks/backlog` contains prioritized tasks that are not currently in flight.
- `/agentic/tasks/done` contains completed tasks that met their acceptance criteria and definition of done.
- Each task file is the source of truth for scope, out-of-scope boundaries, and validation requirements.

## Promoting a Backlog Task to Active
1. Confirm the current active task is complete or intentionally paused.
2. Choose the highest-priority ready task from `/agentic/tasks/backlog`.
3. Move it into `/agentic/tasks/active`.
4. Update `## Status` to `active`.
5. Keep the filename prefix and title aligned with roadmap ordering.

## Moving a Completed Task to Done
1. Confirm the task met its acceptance criteria.
2. Confirm `npm run build` and `npm test` passed if code changed.
3. Record unresolved issues or follow-ups in `Bug Queue` or `Iteration Log`.
4. Update `## Status` to `done`.
5. Move the task file into `/agentic/tasks/done`.

## Using Codex with AGENTS.md
- Read `AGENTS.md` first if it exists.
- If `AGENT.md` is missing, use `/agentic/agents` and `/agentic/context` as the operating contract.
- Always read the active task before implementing.
- Use the task file to enforce scope and validation boundaries.
- Do not implement backlog items opportunistically while working an active task.

## Bug Queue and Iteration Log
- Use `Bug Queue` for defects, regressions, and known gaps discovered while executing the task.
- Use `Iteration Log` to capture what changed between attempts, including narrowed scope or follow-up decisions.
- Preserve both sections when a task moves between `active`, `backlog`, and `done`.

## Example Codex Prompt
> Read AGENT.md and execute the active task in /agentic/tasks/active. Follow the iteration and bug-fix loop. Do not implement anything outside the task scope. Run build/tests and summarize the result.

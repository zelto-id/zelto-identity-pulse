# Security & Privacy Standards

- Never print or persist tokens.
- `.env` files must not be committed.
- Reports must mask user identifiers by default.
- Snapshots should be redacted by default unless explicitly configured otherwise.
- No telemetry is permitted.
- Raw output is opt-in.
- Errors must not leak secrets.
- The CLI should support environment variables and hidden prompts for sensitive input.

## Operational Notes
- Prefer safe defaults over convenience when handling identifiers or secrets.
- Any opt-in raw output must be deliberate, explicit, and documented.
- Logging and reporting paths should be reviewed with failure cases, not only success cases.

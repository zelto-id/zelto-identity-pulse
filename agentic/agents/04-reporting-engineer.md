# Reporting Engineer

## Role
Create client-readable reports from structured report objects.

## Responsibilities
- Render HTML, Markdown, and JSON reports.
- Keep output clear, concise, and executive-friendly.
- Preserve enough technical depth for IAM engineers.
- Avoid repetition and noisy dumps.
- Group repeated findings into concise summaries with supporting tables.
- Show positive signals, limitations, and not-assessed areas.

## Report Standards
Reports should include:
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

## Hard Rules
- Do not expose secrets.
- Mask user identifiers by default.
- Do not dump large user or application lists inline.
- Do not repeat the same finding many times.
- Group related findings with resource tables where practical.

## Implementation Notes
- Render from a shared structured report object rather than provider-specific templates alone.
- Keep language suitable for both technical reviewers and business stakeholders.
- Preserve traceability from summary sections back to the underlying findings.
- Make limitations explicit whenever coverage is partial or assumptions are used.

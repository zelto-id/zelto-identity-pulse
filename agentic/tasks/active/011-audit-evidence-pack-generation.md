# Task: Audit Evidence Pack Generation

## Status
active

## Priority
P1

## Purpose
Generate audit/evidence packs after compliance mapping exists.

Evidence packs are evidence-support packages for audit readiness, security review, consulting handover, and remediation validation. They are not certification reports.

## Why Now
Evidence packs become substantially more useful after identity controls are mapped to NIS2, ISO 27001, and SOC 2 and after reports can render compliance evidence sections. This task depends on:
- `008-compliance-identity-control-mapping.md`
- `009-compliance-mapping-layer.md`
- `010-compliance-reporting-section.md`

## Scope
- Generate an audit-ready evidence package from structured report objects and approved supporting artifacts.
- Include framework-specific identity evidence indexes.
- Include provider-specific evidence sections for Auth0 and Okta.
- Include finding-to-control mapping.
- Include timestamped scan metadata.
- Include snapshot/report references.
- Include manual evidence checklist.
- Include known limitations.
- Include remediation status where available.
- Apply redaction and sensitive-data rules.

Potential future output:

```text
reports/evidence-pack/
  index.html
  identity-control-matrix.html
  nis2-evidence.html
  iso27001-evidence.html
  soc2-evidence.html
  manual-evidence-checklist.md
  findings.csv
  metadata.json
```

## Out of Scope
- Compliance certification.
- Auditor attestation.
- Legal advice.
- SaaS collaboration workflows.
- Raw unredacted snapshots.
- Automatic remediation or write operations.

## Required Deliverables
- Executive evidence summary.
- Framework-specific identity evidence index.
- Provider evidence sections for Auth0 and Okta.
- Finding-to-control mapping.
- Timestamped scan metadata.
- Snapshot/report references.
- Manual evidence checklist.
- Known limitations.
- Remediation status where available.
- Redaction/sensitive-data rules.

## Implementation Notes
- Depend on tasks `008`, `009`, and `010`.
- Clearly distinguish automated scanner evidence from manual/process evidence.
- Keep evidence references deterministic and reproducible.
- Prefer links/references to report artifacts over copying large raw data.
- Ensure user identifiers remain masked by default.
- Never include tokens, secrets, authorization headers, cookies, sessions, or raw credentials.

## Acceptance Criteria
- Existing evidence pack task is updated to depend on compliance mapping.
- Evidence pack can be generated from supported report inputs.
- Coverage, assumptions, caveats, and limitations are explicit.
- Automated evidence and manual evidence are clearly separated.
- Evidence excerpts remain redacted and client-safe.
- Redaction requirements are included and tested.
- The pack avoids claiming compliance certification.

## Risks / Caveats
- Evidence packs can be mistaken for audit opinions if wording is not explicit.
- Some evidence must remain manual, such as approvals, HR records, access review records, and incident response records.
- Snapshot references must avoid leaking sensitive identifiers or raw provider data.

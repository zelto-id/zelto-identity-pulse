# Task: Compliance Reporting Section

## Status
done

## Priority
P1

## Purpose
Add compliance evidence sections to Auth0 and Okta reports using the mapping layer from `009-compliance-mapping-layer.md`.

## Why Now
Compliance reporting should be designed before evidence-pack generation and before new provider connectors so report UX, JSON structure, and provider evidence remain consistent.

## Scope
- Add a report section named `Compliance Evidence Mapping`.
- Support NIS2, ISO 27001, and SOC 2 first.
- Show automated evidence strength by identity control area.
- Show manual evidence required.
- Show findings affecting each control area.
- Show not assessed / out-of-scope areas.
- Show caveats and limitations clearly.
- Expose the underlying structured compliance mapping in JSON report output when JSON report output exists.

For each selected framework, show:
- Identity control areas with strong automated evidence
- Identity control areas with partial automated evidence
- Manual evidence required
- Findings affecting each control area
- Not assessed / out of scope areas
- Caveats and limitations

Recommended wording:

> This report provides identity-system evidence that may support selected compliance control areas. It does not certify compliance or prove operating effectiveness.

## Out of Scope
- Certification or compliance guarantee language.
- Full audit attestation.
- Legal advice.
- SaaS/backend reporting.
- PDF/DOCX export.
- New provider connectors.

## Required Deliverables
- HTML report support first.
- Markdown report support second if applicable.
- JSON contract extension for structured compliance evidence where JSON report output exists.
- Optional future CLI flags:
  - `--framework nis2`
  - `--framework iso27001`
  - `--framework soc2`
  - `--framework all`
- Configuration behavior so compliance reporting is enabled intentionally and does not clutter normal technical posture reports by default.

## Implementation Notes
- Depend on `009-compliance-mapping-layer.md`.
- Default should be to include all supported frameworks only when compliance reporting is enabled.
- Keep compliance sections concise and evidence-oriented.
- Preserve traceability from control area to finding IDs and provider evidence.
- Make limitations visible in every output format that includes compliance sections.

## Acceptance Criteria
- Task implementation defines the report UX.
- The report separates automated evidence from manual evidence.
- The report avoids compliance certification claims.
- The report can be used by a consultant/auditor as a structured evidence aid.
- The report makes limitations visible.

## Risks / Caveats
- Report sections can become noisy if every weak mapping is shown by default.
- Control names and references must stay conservative and maintainable.
- JSON structure may need versioning if compliance output becomes part of the stable report contract.

## Bug Queue
_No bugs recorded yet._

## Iteration Log
- 2026-06-10: Added opt-in Compliance Evidence Mapping sections for HTML and Markdown outputs.
- 2026-06-10: Extended JSON report output with structured compliance mapping only when compliance reporting is enabled.
- 2026-06-10: Added CLI and config controls for `--compliance`, `--framework`, and `compliance.enabled` / `compliance.frameworks`.
- 2026-06-10: Added tests for compliance option parsing, config validation, JSON contract inclusion, and compliance report rendering.
- 2026-06-10: Verified `npm run build`, `npm test`, Auth0 fixture output, Okta fixture output, and default opt-out behavior.

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

# Task: Compliance Mapping Layer

## Status
backlog

## Priority
P1

## Purpose
Design and implement the machine-readable compliance mapping layer after `008-compliance-identity-control-mapping.md` is completed.

This task defines the future implementation plan. It is not implemented during roadmap creation.

## Why Now
The product needs a deterministic mapping layer before compliance report sections, evidence packs, CI/CD workflows, or additional provider expansion can reuse compliance evidence safely.

## Scope
- Add compliance mapping types.
- Add a machine-readable control registry.
- Add finding-to-control mappings.
- Support NIS2, ISO 27001, and SOC 2 first.
- Keep the mapping deterministic and local-first.
- Preserve manual evidence requirements in the data model.

## Out of Scope
- SaaS/backend dependencies.
- AI dependencies.
- Compliance certification.
- Auditor attestation.
- New provider connectors.
- Mapping every finding to every framework.

## Required Deliverables
Suggested future files:
- `src/compliance/compliance.types.ts`
- `src/compliance/frameworks/nis2.controls.ts`
- `src/compliance/frameworks/iso27001.controls.ts`
- `src/compliance/frameworks/soc2.controls.ts`
- `src/compliance/finding-control-map.ts`
- `src/compliance/compliance.mapper.ts`
- `tests/compliance/*`

Suggested model:

```ts
type ComplianceControl = {
  framework: "nis2" | "iso27001" | "soc2";
  controlId: string;
  controlName: string;
  identityDomain: string;
  requirementSummary: string;
  scannerEvidence: string[];
  manualEvidence: string[];
  supportedProviders: ("auth0" | "okta")[];
  coverage: "strong" | "partial" | "manual-only" | "not-supported";
  caveats: string[];
};

type FindingComplianceMapping = {
  findingId: string;
  provider: "auth0" | "okta";
  controls: {
    framework: "nis2" | "iso27001" | "soc2";
    controlId: string;
    relevance: "direct" | "supporting" | "indirect";
    evidenceStrength: "strong" | "partial" | "weak";
    caveat?: string;
  }[];
};
```

## Implementation Notes
- Depend on the research output from `008-compliance-identity-control-mapping.md`.
- Only map findings where identity evidence genuinely supports the control area.
- Separate direct evidence from supporting evidence.
- Keep manual evidence requirements visible.
- Make overclaim prevention testable.
- Ensure JSON report output can expose structured compliance mappings later.

## Acceptance Criteria
- Task implementation defines data model and implementation plan in code and tests.
- Mapping layer depends on the research output from task `008`.
- Future implementation can support report rendering, evidence packs, and JSON output.
- Tests are defined for mapping correctness and overclaim prevention.

## Risks / Caveats
- Control mappings can drift if framework interpretation is not maintained.
- Some findings may support multiple frameworks indirectly but should not be overmapped.
- Auditor validation may be needed for customer-facing framework language.

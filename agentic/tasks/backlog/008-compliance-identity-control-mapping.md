# Task: Compliance Identity Control Mapping

## Status
backlog

## Priority
P1

## Purpose
Create the framework-to-identity control map for NIS2, SOC 2, and ISO 27001/27002.

This is a research and design task, not an implementation task.

## Why Now
Compliance and audit-readiness work should be planned before additional provider connectors so the product can preserve a stable evidence model across Auth0, Okta, Entra ID, and later providers.

The correct positioning is: "Identity-system evidence mapped to compliance control areas."

The incorrect positioning is: "This tenant is NIS2/SOC 2/ISO 27001 compliant."

## Scope
- Define identity-relevant control areas for NIS2, SOC 2, and ISO 27001/27002.
- Map Auth0 and Okta evidence to identity control areas.
- Separate automated scanner evidence from manual evidence.
- Identify caveats, evidence strength, and safe report wording.
- Mark areas requiring legal, compliance, or auditor validation.

Identity domains to map:
- Identity inventory
- User lifecycle / joiner-mover-leaver
- Authentication and MFA
- Password/authenticator policy
- Access rights and app assignments
- Privileged access/admin roles
- API/OAuth authorization
- Federation and external identity providers
- Logging and monitoring
- Incident investigation support
- Network zones / trusted origins / device posture where relevant
- Change/configuration drift evidence
- Exceptions and manual evidence

## Out of Scope
- Product code implementation.
- Compliance certification claims.
- Auditor attestation.
- Legal advice.
- SaaS/backend workflows.
- New provider connectors.

## Required Deliverables
1. `docs/compliance/identity-control-matrix.md`
2. A matrix covering:
   - NIS2
   - ISO 27001:2022 / ISO 27002:2022 control areas
   - SOC 2 Trust Services Criteria, especially Security / logical access
3. For each mapped control area:
   - framework
   - control identifier or reference area
   - control name
   - identity relevance
   - Auth0 evidence available
   - Okta evidence available
   - automated evidence strength: strong / partial / weak / not supported
   - manual evidence required
   - caveats
   - report wording guidance
4. Explicit limitations:
   - scanner evidence does not prove operating effectiveness over time
   - scanner evidence does not replace access approvals, HR records, access review records, incident response records, or auditor judgment
   - no certification/compliance guarantee language

## Implementation Notes
- Prefer official or authoritative framework sources.
- Do not quote long copyrighted standard text.
- Paraphrase requirements and cite source areas conservatively.
- Treat scanner output as evidence support, not compliance proof.
- Use cautious wording where control applicability depends on customer scope, auditor interpretation, or operating evidence.

## Acceptance Criteria
- Clear control matrix exists.
- Each framework has identity-relevant mappings.
- Each mapping separates automated identity evidence from manual evidence.
- The document is usable as the foundation for implementation tasks `009-compliance-mapping-layer.md` and `010-compliance-reporting-section.md`.
- No overclaiming of compliance certification.

## Risks / Caveats
- Framework language can be jurisdiction- and auditor-dependent.
- Some ISO 27001/27002 and SOC 2 evidence areas require manual process records outside identity-provider configuration.
- NIS2 applicability varies by entity type, geography, and sector.
- Legal and auditor validation may be required before customer-facing claims are finalized.

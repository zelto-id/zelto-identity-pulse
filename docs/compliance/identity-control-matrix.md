# Identity Control Matrix for Compliance Evidence Mapping

## Purpose

This document maps Zelto Identity Pulse identity-system evidence to selected
compliance control areas for NIS2, SOC 2, and ISO/IEC 27001:2022 /
ISO/IEC 27002:2022.

Correct positioning:

> Identity-system evidence mapped to compliance control areas.

Incorrect positioning:

> This tenant is NIS2/SOC 2/ISO 27001 compliant.

Zelto Identity Pulse is a local-first, read-only identity posture assessment
tool. Its scanner output can support compliance conversations, audit readiness,
security reviews, and consulting handoff. It does not certify compliance, prove
operating effectiveness over time, replace auditor judgment, or replace manual
evidence such as approvals, HR records, access review records, incident
response records, risk registers, policy documents, or change tickets.

## Source References

- NIS2: European Commission overview and Directive (EU) 2022/2555.
  - https://digital-strategy.ec.europa.eu/en/policies/nis2-directive
  - https://eur-lex.europa.eu/eli/dir/2022/2555/oj
- ISO/IEC 27001:2022: official ISO standard overview.
  - https://www.iso.org/standard/27001
- ISO/IEC 27002:2022: official ISO standard overview.
  - https://www.iso.org/standard/75652.html
- SOC 2 / Trust Services Criteria: AICPA and CIMA resources.
  - https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022
  - https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services

Notes:

- ISO and AICPA standards include copyrighted material. This matrix uses short
  identifiers and conservative paraphrases. Product/report wording must avoid
  reproducing long control text.
- Control applicability depends on organization scope, system boundaries,
  auditor interpretation, jurisdiction, and customer facts.
- Legal, compliance, or auditor validation is required before customer-facing
  compliance claims are finalized.

## Evidence Strength Definitions

| Strength | Meaning |
| --- | --- |
| strong | The current scanner can collect direct identity-provider configuration evidence for the control area. Manual evidence may still be required for operating effectiveness. |
| partial | The current scanner can collect useful supporting evidence, but it does not cover the complete control objective or all operating evidence. |
| weak | The scanner can provide limited context only. Manual evidence is the primary source. |
| not supported | The current scanner does not provide meaningful evidence for this control area. |

## Current Provider Evidence Boundaries

Auth0 evidence currently available:

- Tenant settings, session settings, tenant flags, custom domains, prompts, and branding.
- OAuth/OIDC clients, grants, callback/origin allowlists, grant types, client authentication, and refresh-token posture.
- Connections, database password policy settings, brute-force protection, and custom database script indicators.
- APIs/resource servers, scopes, token lifetimes, RBAC enforcement, role permissions, and Management API grants.
- Organizations, roles, Actions, Rules, Hooks, Guardian/MFA, attack protection, log streams, and bounded logs.
- Collector status, missing scopes, partial coverage, failed collectors, and report limitations.

Okta Workforce evidence currently available:

- Org metadata, features, bounded users, groups, group rules, applications, assignment summaries, and app posture.
- Policies and rules, authenticators, authorization servers, scopes, claims, and authorization server policies.
- Admin role assignments, network zones, trusted origins, identity providers, event hooks, inline hooks, log streams, domains, and bounded System Log summary.
- Collector status, missing scopes, collection options, partial coverage, failed collectors, and report limitations.

Provider caveats:

- Auth0 is CIAM-focused. Workforce joiner/mover/leaver evidence is usually external to Auth0 unless the tenant uses Auth0 as the user store.
- Okta Workforce is stronger for workforce users, groups, apps, policies, admin roles, network zones, and System Log evidence.
- Both providers produce point-in-time configuration evidence. Neither proves that controls operated effectively throughout an audit period.
- Bounded collection, missing scopes, or partial collectors reduce evidence confidence.

## Identity Domains Covered

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

## NIS2 Identity Evidence Matrix

| Framework | Control identifier or reference area | Control name | Identity relevance | Auth0 evidence available | Okta evidence available | Automated evidence strength | Manual evidence required | Caveats | Report wording guidance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NIS2 | Article 21(2)(a) | Risk analysis and information system security policy | Identity posture findings can support identity-related risk identification and policy review. | Tenant, app, API, connection, MFA, attack protection, log stream, and coverage findings. | Org, user/group/app, policy, authenticator, admin, network zone, log stream, and coverage findings. | partial | Security policies, risk register, risk treatment decisions, control owners, exceptions, and management approval. | Scanner evidence is technical and point-in-time; it does not prove the risk management process exists or is followed. | "The report provides identity posture evidence that may support risk analysis for identity systems." |
| NIS2 | Article 21(2)(b) | Incident handling | Logs, log streams, admin activity, and event hooks can support investigation readiness. | Log stream configuration, bounded logs where collected, attack protection signals, Actions/Rules/Hooks context. | System Log summary, log streams, event hooks, admin activity indicators, policy/authenticator context. | partial | Incident response plan, ticket evidence, triage records, detection rules, escalation records, and post-incident review. | Bounded logs are not full SIEM evidence. Log stream existence does not prove monitoring or response. | "Identity logs and stream configuration may support incident investigation evidence, subject to retained SIEM/process records." |
| NIS2 | Article 21(2)(c) | Business continuity and crisis management | Identity recovery and continuity depend on admin access, backup access paths, break-glass processes, and provider availability planning. | Admin/RBAC posture is limited; no direct continuity-plan evidence. | Admin roles and authenticator policy can support break-glass review; no continuity-plan evidence. | weak | Business continuity plan, backup admin process, crisis exercises, recovery objectives, DR tests, and break-glass account review. | Identity provider config alone does not demonstrate continuity readiness. | "Scanner output provides limited identity continuity context and requires manual continuity evidence." |
| NIS2 | Article 21(2)(d) | Supply chain security | External identity providers, third-party apps, OAuth grants, hooks, and integrations can indicate identity supply-chain exposure. | Connections, external IdPs, OAuth clients, client grants, hooks/actions, log streams, custom domains. | IdPs, apps, OAuth authorization servers, event/inline hooks, log streams, trusted origins. | partial | Vendor risk reviews, contracts, DPAs, supplier inventory, integration ownership, and third-party monitoring evidence. | Technical integration inventory is not a vendor risk assessment. | "Identity integrations may support supplier/access exposure review but do not replace vendor risk evidence." |
| NIS2 | Article 21(2)(e) | Security in acquisition, development, and maintenance | OAuth app configuration, redirect/origin hygiene, extensibility code posture, and API authorization can support secure identity implementation review. | Client grants, callbacks/origins, token settings, Actions/Rules/Hooks, APIs/scopes/RBAC. | Apps, sign-on modes, OAuth settings, authorization servers/scopes/claims/policies, hooks. | partial | Secure SDLC records, code reviews, vulnerability handling records, change approvals, and owner attestations. | Scanner sees deployed identity config, not complete software lifecycle practice. | "Identity configuration findings may support secure implementation review for applications and APIs." |
| NIS2 | Article 21(2)(f) | Assessment of cybersecurity risk-management effectiveness | Repeated scans and future deltas can support validation of remediation and control drift. | Current report, findings, coverage, and future deltas from JSON reports. | Current report, findings, coverage, and future deltas from JSON reports. | weak | Control testing program, internal audit results, evidence of repeated control operation, remediation tickets, and management review. | Current scanner output is point-in-time. Delta comparison helps but still does not prove operating effectiveness across a period. | "Point-in-time and delta evidence can support control validation, not prove operating effectiveness." |
| NIS2 | Article 21(2)(g) | Basic cyber hygiene and cybersecurity training | Some identity hygiene indicators are visible, but training is outside provider configuration. | MFA, password, attack protection, client/API hygiene indicators. | MFA/authenticator, password/session policy, stale users, app/admin hygiene indicators. | weak | Training completion, awareness materials, phishing exercises, acceptable-use records, and policy acknowledgement. | Training evidence is manual. Scanner evidence is technical hygiene only. | "Identity hygiene indicators are technical support evidence and do not evidence training completion." |
| NIS2 | Article 21(2)(h) | Cryptography and encryption policies | Identity token signing, token endpoint authentication, custom domains, and protocol choices can support limited cryptography review. | API signing algorithms, token endpoint auth method, mTLS/PAR/DPoP indicators where collected, custom domains. | OAuth authorization server posture, app OAuth settings, custom domains, trusted origins. | partial | Cryptography policy, certificate lifecycle records, key management records, TLS scanning, secrets rotation evidence. | Identity config does not cover all cryptography or key management. | "Token/protocol configuration provides supporting evidence for identity cryptography posture." |
| NIS2 | Article 21(2)(i) | HR security, access control, and asset management | Identity inventories, users, groups, apps, roles, admin rights, and API grants directly support access-control review. | Apps, APIs, connections, roles, permissions, organizations, Management API grants. | Users, groups, apps, assignments, policies, admin roles, authorization servers. | partial | HR source-of-truth records, joiner/mover/leaver tickets, access approvals, access reviews, role owner attestations. | Stronger for Okta workforce access; Auth0 CIAM lifecycle may be external to Auth0. | "The report provides identity access-control evidence; approvals and HR lifecycle evidence remain manual." |
| NIS2 | Article 21(2)(j) | MFA, continuous authentication, and secured communications | MFA/authenticator configuration, session policy, attack protection, and app sign-in policy support identity authentication review. | Guardian/MFA, tenant session settings, breached password/brute-force/suspicious IP controls, database password settings. | Authenticators, global session/app sign-in/password policies, network zones, trusted origins, System Log signals. | strong | MFA rollout exceptions, user enrollment evidence, break-glass process, conditional access design decisions, and monitoring records. | Automated evidence shows configuration, not every user experience or enforcement outcome. | "Provider configuration supports MFA/authentication evidence; operating exceptions require manual review." |
| NIS2 | Article 23 and incident reporting support | Significant incident notification support | Identity logs and admin activity can support investigation timelines, but notification obligations are process/legal requirements. | Bounded logs, log streams, attack protection signals, admin/API grant context. | System Log summary, log streams, event hooks, admin activity indicators. | weak | Incident classification, legal notification analysis, regulator/customer notices, incident timeline, and management sign-off. | Scanner cannot determine legal notification obligations. | "Identity evidence may support incident investigation but does not determine reportability." |

## ISO/IEC 27001:2022 / ISO/IEC 27002:2022 Identity Evidence Matrix

| Framework | Control identifier or reference area | Control name | Identity relevance | Auth0 evidence available | Okta evidence available | Automated evidence strength | Manual evidence required | Caveats | Report wording guidance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ISO/IEC 27001/27002 | A.5.9 | Inventory of information and associated assets | Identity inventories help identify applications, APIs, users, groups, roles, integrations, and external identity sources. | Clients, APIs, connections, roles, organizations, log streams, extensibility. | Users, groups, apps, policies, admin roles, IdPs, hooks, log streams, domains. | partial | Asset inventory ownership, criticality, data classification, CMDB, application owner attestations. | Provider inventory is identity-scoped and may omit systems outside Auth0/Okta. | "Identity inventory evidence may support asset inventory for identity-connected resources." |
| ISO/IEC 27001/27002 | A.5.15 | Access control | Access-control design depends on app assignments, policies, roles, groups, API scopes, and provider boundaries. | Client grants, API scopes/RBAC, roles/permissions, organization settings. | Groups, app assignments, policies, authorization servers, admin roles. | partial | Access control policy, role model, approvals, access review results, exception register. | Technical config does not prove access was approved or reviewed. | "Provider configuration supports access-control design review; approval evidence remains manual." |
| ISO/IEC 27001/27002 | A.5.16 | Identity management | User, group, role, lifecycle, and identity-source records support identity management review. | Auth0 users where collected, connections, organizations, roles. | Users, groups, group rules, identity providers, lifecycle status, app assignments. | partial | HR records, joiner/mover/leaver tickets, authoritative source mapping, identity governance evidence. | Okta is stronger for workforce lifecycle; Auth0 CIAM lifecycle may rely on product systems. | "Identity management evidence is provider-scoped and should be reconciled with HR/source-of-truth records." |
| ISO/IEC 27001/27002 | A.5.17 | Authentication information | Password policy, authenticator configuration, client credentials posture, and token settings support authentication-secret review. | Database password settings, MFA, token endpoint auth, refresh tokens, client auth method. | Password policies, authenticators, OAuth app settings, authorization servers, policies. | partial | Secret rotation records, password policy approval, credential vault evidence, break-glass credential review. | Scanner must never expose secrets and should only report posture metadata. | "Authentication configuration supports review without exposing secret values." |
| ISO/IEC 27001/27002 | A.5.18 | Access rights | Privilege assignment, app assignment, API grants, and role permissions support access rights review. | Roles, permissions, APIs, Management API grants, client grants. | Admin roles, users/groups/apps, assignment summaries, authorization server policies. | partial | Periodic access review, access owner approvals, SoD review, ticket evidence, exception approvals. | Provider evidence does not prove periodic review occurred. | "Access-rights evidence should be paired with access review and approval records." |
| ISO/IEC 27001/27002 | A.5.24-A.5.28 | Information security incident management and evidence collection | Logs, streams, admin activity, and security events can support incident detection and evidence preservation. | Log streams, logs where collected, attack protection, hooks/actions context. | System Log summary, log streams, event hooks, admin activity signals. | partial | Incident procedures, incident tickets, forensic evidence handling, retention settings, post-incident lessons learned. | Bounded logs are not a complete audit trail; retention must be verified outside the scanner. | "Identity logs may support incident evidence, but process and retention evidence remain manual." |
| ISO/IEC 27001/27002 | A.5.30 | ICT readiness for business continuity | Identity resilience depends on admin access, fallback auth, and recovery plans. | Limited admin/role and tenant posture context only. | Admin roles, authenticators, policies, network zones can support limited review. | weak | Business continuity plan, DR exercises, break-glass account tests, backup procedures, crisis runbooks. | Provider config does not prove continuity readiness. | "Identity continuity evidence is limited and should be treated as support context only." |
| ISO/IEC 27001/27002 | A.8.2 | Privileged access rights | Admin roles and high-scope API grants directly affect privileged access. | Management API grants, roles/permissions, M2M clients, sensitive scopes. | Admin role assignments, admin activity, app/admin assignments. | partial | Privileged access policy, PAM records, admin access reviews, break-glass approval, separation-of-duties review. | Some high-privilege use may be valid automation with documented ownership and monitoring. | "Privileged identity evidence should identify high-risk assignments and require owner validation." |
| ISO/IEC 27001/27002 | A.8.3 | Information access restriction | Application, API, group, policy, and scope controls restrict identity-mediated access. | App settings, API scopes/RBAC, client grants, connections, organization behavior. | App assignments, groups, policies, authorization servers/scopes/claims. | partial | Data classification, entitlement model, app owner approval, access review evidence. | Identity provider restrictions may not represent downstream application authorization. | "Provider access restrictions are supporting evidence and must be reconciled with application authorization design." |
| ISO/IEC 27001/27002 | A.8.5 | Secure authentication | MFA, session, password, authenticator, and attack protection settings support secure authentication review. | Guardian/MFA, session lifetime, database password policy, brute-force/breached password/suspicious IP controls. | Authenticators, password/session/app sign-in policies, network zones, System Log signals. | strong | MFA exception list, rollout status, conditional access design, user enrollment evidence, helpdesk/break-glass process. | Configuration does not prove every user or transaction was challenged as intended. | "Secure authentication evidence is strong for configuration, but exceptions and enforcement outcomes need validation." |
| ISO/IEC 27001/27002 | A.8.8 | Management of technical vulnerabilities | Legacy extensibility, insecure endpoints, weak auth methods, and risky grants can indicate configuration vulnerabilities. | Rules/Hooks EOL risk, callbacks/origins, weak client auth, token lifetimes, signing algorithms. | App OAuth posture, hooks, trusted origins, domains, policy weaknesses. | weak | Vulnerability management program, patch SLAs, SAST/DAST results, dependency scanning, vendor advisories. | Scanner finds identity misconfiguration, not full vulnerability management. | "Identity misconfiguration findings may support vulnerability review but are not a vulnerability management program." |
| ISO/IEC 27001/27002 | A.8.15 | Logging | Log stream and log availability posture supports identity event logging review. | Log streams and bounded logs where available. | Log streams and bounded System Log summary. | partial | SIEM retention, log parsing rules, alerting, audit-log retention evidence, access to logs. | Log stream configuration does not prove ingestion, retention, alert quality, or review. | "Identity logging configuration can support logging control evidence when paired with SIEM records." |
| ISO/IEC 27001/27002 | A.8.16 | Monitoring activities | Monitoring depends on collecting identity events and using them for detection and response. | Active log streams, attack protection, bounded logs. | System Log summary, log streams, event hooks, admin activity indicators. | partial | Detection rules, alert triage, SOC runbooks, monitoring tickets, response metrics. | Scanner does not know whether alerts are reviewed or acted on. | "Identity monitoring evidence is configuration/supporting evidence, not monitoring operating effectiveness." |
| ISO/IEC 27001/27002 | A.8.20 | Network security | Trusted origins, callback/origin allowlists, custom domains, and network zones affect identity network exposure. | Callback/origin allowlists, custom domains, tenant flags. | Network zones, trusted origins, domains, app sign-on/network conditions. | partial | Network architecture, firewall/VPN controls, WAF/CDN configuration, device posture, endpoint controls. | Identity provider network settings are only part of network security. | "Identity network-exposure evidence should be combined with network and endpoint evidence." |
| ISO/IEC 27001/27002 | A.8.32 | Change management | Report Contract v1 and delta comparisons can support configuration drift review in future workflows. | Point-in-time config and future before/after JSON deltas. | Point-in-time config and future before/after JSON deltas. | weak | Change tickets, approvals, deployment records, emergency change review, configuration baseline owner sign-off. | Current scanner is not a change-management system or database. | "Point-in-time and delta evidence may support change review but do not replace change records." |

## SOC 2 Trust Services Criteria Identity Evidence Matrix

| Framework | Control identifier or reference area | Control name | Identity relevance | Auth0 evidence available | Okta evidence available | Automated evidence strength | Manual evidence required | Caveats | Report wording guidance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SOC 2 | CC3.2 / risk assessment support | Risk identification and assessment | Identity findings can support identification of risks related to access, authentication, logging, and privileged administration. | Findings across tenant, apps, APIs, connections, MFA, logging, extensibility. | Findings across users, groups, apps, policies, authenticators, admins, logs, network zones. | partial | Risk assessment methodology, risk register, control mapping, management review, risk acceptance. | Scanner output is not an entity-wide risk assessment. | "Identity posture findings may support SOC 2 risk assessment evidence." |
| SOC 2 | CC4.1 / monitoring support | Monitoring of controls | Repeated scans, coverage status, and identity logs can support monitoring evidence. | Coverage, findings, log streams, logs where collected. | Coverage, findings, System Log summary, log streams, admin activity. | partial | Control monitoring plan, evidence of periodic review, exception tracking, internal audit results. | Current scans are point-in-time unless customers run and retain them periodically. | "Recurring identity scans can support monitoring evidence when retained and reviewed." |
| SOC 2 | CC5.2 / control activities support | Technology control activities | Deterministic identity rules can evidence whether certain configured controls exist or are missing. | Rule outputs for tenant, apps, APIs, MFA, attack protection, logs. | Rule outputs for policies, authenticators, users/apps, admin roles, logs, network zones. | partial | Control design documentation, control owner attestation, process evidence, evidence of control operation. | Technical findings do not prove control design suitability across the full system. | "The report can provide technical support evidence for selected identity control activities." |
| SOC 2 | CC6.1 | Logical access security | Identity provider configuration controls logical access to applications, APIs, admin functions, and identity resources. | Apps, APIs, roles, permissions, connections, grants, MFA. | Users, groups, apps, policies, authenticators, admin roles, authorization servers. | partial | Access control policy, user authorization records, access reviews, owner approvals. | Provider config may not cover downstream app authorization or non-SSO access paths. | "Identity provider access configuration supports CC6 logical access review but must be reconciled with application access records." |
| SOC 2 | CC6.2 | User registration and authorization before issuing credentials | User status, source, groups, assignments, and connection design can support whether identities are managed deliberately. | Connections, users where collected, organizations, role/permission model. | Users, groups, group rules, app assignments, identity providers, lifecycle status. | partial | HR onboarding records, access request approvals, identity proofing records, user acceptance, IGA workflows. | Stronger in Okta Workforce; Auth0 customer identity onboarding may be product-specific. | "Provider evidence can support user registration review but does not prove approval workflow execution." |
| SOC 2 | CC6.3 | Modify or remove access when roles change or users terminate | Lifecycle status, stale users, inactive users, and assignments can support access removal review. | Users where collected, blocked status, last login, role/organization context. | User statuses, lifecycle dates, groups, app assignments, stale/inactive indicators. | partial | Termination records, mover tickets, access revocation evidence, periodic user access reviews. | Auth0 CIAM accounts may not map to workforce termination. Bounded Okta user collection can limit confidence. | "Lifecycle evidence should be paired with HR and access revocation records." |
| SOC 2 | CC6.4 | Restrict access to privileged functions | Admin role assignments, sensitive API scopes, and Management API grants support privileged access review. | Management API grants, M2M clients, roles/permissions, sensitive scopes. | Admin role assignments, admin activity, privileged app assignments. | partial | PAM records, privileged access approvals, admin access reviews, SoD review, emergency access records. | Automation clients can be privileged by design but require ownership, logging, and least privilege. | "Privileged access findings identify review targets; approval and review evidence remains manual." |
| SOC 2 | CC6.5 | Prevent or detect unauthorized access | MFA, attack protection, password policies, session controls, logs, and monitoring support prevention/detection. | Guardian/MFA, attack protection, password policy, session settings, log streams. | Authenticators, sign-on policies, password/session policies, System Log, network zones. | partial | Security monitoring records, alert triage, exception approval, helpdesk procedures, incident tickets. | Configuration does not prove detection efficacy or alert response. | "Authentication and detection configuration supports unauthorized-access control evidence." |
| SOC 2 | CC6.6 | Logical access through network and perimeter controls | Network zones, trusted origins, redirect allowlists, custom domains, and app sign-in conditions support boundary review. | Callback/origin allowlists, custom domains, tenant settings. | Network zones, trusted origins, domains, policy conditions, app settings. | partial | Network diagrams, firewall/WAF/VPN evidence, device management, endpoint posture, perimeter monitoring. | Identity settings are not full network security evidence. | "Identity network exposure evidence should be combined with infrastructure evidence." |
| SOC 2 | CC6.7 | Restrict data transmission and movement | OAuth grant choices, redirect URIs, token lifetimes, API scopes, and client auth affect identity-mediated data/token exposure. | Grant types, callback/origin posture, token lifetimes, refresh token rotation, API scopes. | OAuth apps, authorization servers, scopes, claims, trusted origins. | weak | Data flow diagrams, encryption/TLS evidence, DLP controls, data handling procedures, app-layer controls. | Identity token posture is supporting evidence only. | "OAuth/token posture can support review of identity-mediated data exposure." |
| SOC 2 | CC7.1 | Detect security events and anomalies | Identity events, admin actions, failed logins, attack-protection signals, and log streams can support event detection. | Bounded logs, attack protection, log streams. | Bounded System Log summary, log streams, event hooks, admin activity. | partial | SIEM detections, alert review, investigation tickets, escalation records, retention evidence. | Bounded provider events are not a complete detection program. | "Identity event evidence may support SOC 2 detection criteria when paired with SOC evidence." |
| SOC 2 | CC7.2-CC7.5 | Monitor, evaluate, respond, and recover from security events | Identity logs can support investigation and response, but response/recovery are process controls. | Logs/log streams and identity configuration context. | System Log summary, log streams, event hooks, admin activity. | weak | Incident tickets, response actions, forensics, postmortems, recovery evidence, management review. | Scanner cannot prove event evaluation, response, or recovery. | "Identity evidence can support incident investigation but does not replace response records." |
| SOC 2 | CC8.1 | Change management | Report deltas and future local history can support identity configuration change review. | Point-in-time config and future JSON deltas. | Point-in-time config and future JSON deltas. | weak | Change requests, approvals, testing evidence, emergency change review, rollback records. | Current product has no local scan-history database; delta comparison requires user-supplied reports. | "Identity delta evidence can support change review when tied to change records." |
| SOC 2 | Common Criteria / manual-only areas | Governance, communication, training, vendor oversight, and broad operations | Some identity evidence supports governance discussions, but most evidence is outside provider configuration. | Limited supporting context from findings, integrations, and coverage. | Limited supporting context from findings, integrations, and coverage. | not supported | Policies, board/management records, training evidence, vendor management, internal communication, operations evidence. | Do not imply coverage for non-identity or non-technical SOC 2 controls. | "This area is outside automated identity evidence and requires manual audit support." |

## Safe Reporting Language

Recommended:

- "This report provides identity-system evidence that may support selected
  compliance control areas."
- "Automated evidence is limited to collected Auth0 and Okta configuration,
  bounded event summaries, findings, and coverage metadata."
- "Manual evidence remains required for policies, approvals, access reviews,
  operating effectiveness, incident response, and auditor judgment."
- "Coverage gaps, missing scopes, and partial collectors reduce confidence."

Avoid:

- "This tenant is compliant."
- "This report certifies NIS2/SOC 2/ISO 27001 readiness."
- "No findings means the control is satisfied."
- "The control operated effectively throughout the audit period."
- "The scanner replaces access reviews, HR evidence, or auditor testing."

## Manual Evidence Checklist Foundation

Future evidence-pack tasks should preserve these manual evidence categories:

- Access control policy and role model.
- HR joiner/mover/leaver records.
- Access request, approval, and revocation tickets.
- Periodic access review results and owner attestations.
- Privileged access review and PAM evidence.
- MFA exception register and break-glass process evidence.
- Incident response plan, incident tickets, postmortems, and notification analysis.
- SIEM/log retention, alert rules, triage records, and monitoring ownership.
- Vendor risk reviews, contracts, DPAs, and supplier inventory.
- Change-management tickets, approvals, testing records, and rollback evidence.
- Business continuity, disaster recovery, and crisis exercise records.
- Risk register, risk treatment decisions, and management acceptance.

## Implementation Handoff for Tasks 009 and 010

The machine-readable mapping layer should preserve:

- `framework`
- `controlId`
- `controlName`
- `identityDomain`
- `requirementSummary`
- `scannerEvidence`
- `manualEvidence`
- `supportedProviders`
- `coverage`
- `caveats`
- `reportWordingGuidance`

The reporting layer should:

- Separate automated scanner evidence from manual evidence.
- Show evidence strength per framework/control area.
- Preserve provider traceability to findings, coverage, and report metadata.
- Keep compliance reporting opt-in or explicitly configured.
- Include limitations near every compliance section.
- Avoid certification, legal, or auditor-opinion language.

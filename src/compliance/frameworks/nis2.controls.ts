import { ComplianceControl } from "../compliance.types";

const SOURCE = "docs/compliance/identity-control-matrix.md" as const;
const BOTH = ["auth0", "okta"] as const;

const POLICY_EVIDENCE = [
  "Security policies and standards",
  "Risk register and treatment decisions",
  "Control owners and exception approvals",
  "Management review evidence"
];

const INCIDENT_EVIDENCE = [
  "Incident response plan",
  "Incident tickets and investigation timelines",
  "Detection rules and escalation records",
  "Post-incident review records"
];

export const NIS2_CONTROLS: ComplianceControl[] = [
  {
    framework: "nis2",
    controlId: "Article 21(2)(a)",
    controlReference: "NIS2 Article 21(2)(a)",
    controlName: "Risk analysis and information system security policy",
    identityDomain: "exceptions-and-manual-evidence",
    requirementSummary:
      "Identity posture findings can support identity-related risk identification and security policy review.",
    scannerEvidence: [
      "Auth0 tenant, application, API, connection, MFA, attack-protection, log-stream, and coverage findings",
      "Okta org, user/group/application, policy, authenticator, admin, network-zone, log-stream, and coverage findings"
    ],
    manualEvidence: POLICY_EVIDENCE,
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Scanner evidence is technical and point-in-time.",
      "Scanner evidence does not prove that the risk management process exists or is followed."
    ],
    reportWordingGuidance:
      "The report provides identity posture evidence that may support risk analysis for identity systems.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(b)",
    controlReference: "NIS2 Article 21(2)(b)",
    controlName: "Incident handling",
    identityDomain: "incident-investigation",
    requirementSummary:
      "Identity logs, log streams, admin activity, and event hooks can support investigation readiness.",
    scannerEvidence: [
      "Auth0 log stream configuration, bounded logs where collected, attack-protection signals, and extensibility context",
      "Okta System Log summaries, log streams, event hooks, admin activity indicators, and policy/authenticator context"
    ],
    manualEvidence: INCIDENT_EVIDENCE,
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Bounded provider logs are not complete SIEM evidence.",
      "Log stream configuration does not prove monitoring, triage, or response."
    ],
    reportWordingGuidance:
      "Identity logs and stream configuration may support incident investigation evidence, subject to retained SIEM and process records.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(c)",
    controlReference: "NIS2 Article 21(2)(c)",
    controlName: "Business continuity and crisis management",
    identityDomain: "privileged-access",
    requirementSummary:
      "Identity recovery and continuity depend on admin access, fallback access paths, break-glass processes, and provider availability planning.",
    scannerEvidence: [
      "Auth0 role/RBAC and tenant posture context where available",
      "Okta admin roles, authenticator policy, and network-zone context where available"
    ],
    manualEvidence: [
      "Business continuity plan",
      "Backup administrator process",
      "Crisis exercises and recovery objectives",
      "Disaster recovery tests and break-glass account reviews"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: [
      "Identity provider configuration alone does not demonstrate continuity readiness."
    ],
    reportWordingGuidance:
      "Scanner output provides limited identity continuity context and requires manual continuity evidence.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(d)",
    controlReference: "NIS2 Article 21(2)(d)",
    controlName: "Supply chain security",
    identityDomain: "federation-and-external-idps",
    requirementSummary:
      "External identity providers, third-party apps, OAuth grants, hooks, and integrations can indicate identity supply-chain exposure.",
    scannerEvidence: [
      "Auth0 connections, external IdPs, OAuth clients, client grants, hooks/actions, log streams, and custom domains",
      "Okta IdPs, applications, OAuth authorization servers, event/inline hooks, log streams, and trusted origins"
    ],
    manualEvidence: [
      "Vendor risk reviews",
      "Contracts and DPAs",
      "Supplier inventory and integration ownership",
      "Third-party monitoring evidence"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Technical integration inventory is not a vendor risk assessment."],
    reportWordingGuidance:
      "Identity integrations may support supplier and access exposure review but do not replace vendor risk evidence.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(e)",
    controlReference: "NIS2 Article 21(2)(e)",
    controlName: "Security in acquisition, development, and maintenance",
    identityDomain: "api-oauth-authorization",
    requirementSummary:
      "OAuth application configuration, redirect/origin hygiene, extensibility code posture, and API authorization can support secure identity implementation review.",
    scannerEvidence: [
      "Auth0 client grants, callbacks/origins, token settings, Actions/Rules/Hooks, APIs, scopes, and RBAC",
      "Okta application sign-on modes, OAuth settings, authorization servers/scopes/claims/policies, and hooks"
    ],
    manualEvidence: [
      "Secure SDLC records",
      "Code reviews",
      "Vulnerability handling records",
      "Change approvals and owner attestations"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Scanner evidence covers deployed identity configuration, not complete software lifecycle practice."
    ],
    reportWordingGuidance:
      "Identity configuration findings may support secure implementation review for applications and APIs.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(f)",
    controlReference: "NIS2 Article 21(2)(f)",
    controlName: "Assessment of cybersecurity risk-management effectiveness",
    identityDomain: "change-configuration-drift",
    requirementSummary:
      "Point-in-time reports and future deltas can support remediation validation and control drift review.",
    scannerEvidence: [
      "Report Contract v1 findings, coverage, scores, and future before/after JSON deltas"
    ],
    manualEvidence: [
      "Control testing program",
      "Internal audit results",
      "Evidence of repeated control operation",
      "Remediation tickets and management review"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: [
      "A current scan is point-in-time.",
      "Delta comparison helps but does not prove operating effectiveness across an audit period."
    ],
    reportWordingGuidance:
      "Point-in-time and delta evidence can support control validation, not prove operating effectiveness.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(h)",
    controlReference: "NIS2 Article 21(2)(h)",
    controlName: "Cryptography and encryption policies",
    identityDomain: "api-oauth-authorization",
    requirementSummary:
      "Identity token signing, token endpoint authentication, custom domains, and protocol choices can support limited cryptography review.",
    scannerEvidence: [
      "Auth0 API signing algorithms, token endpoint auth method, mTLS/PAR/DPoP indicators where collected, and custom domains",
      "Okta OAuth authorization server posture, application OAuth settings, custom domains, and trusted origins"
    ],
    manualEvidence: [
      "Cryptography policy",
      "Certificate lifecycle records",
      "Key management records",
      "TLS scanning and secrets rotation evidence"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Identity configuration does not cover all cryptography or key management."],
    reportWordingGuidance:
      "Token and protocol configuration provides supporting evidence for identity cryptography posture.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(i)",
    controlReference: "NIS2 Article 21(2)(i)",
    controlName: "HR security, access control, and asset management",
    identityDomain: "access-rights-and-app-assignments",
    requirementSummary:
      "Identity inventories, users, groups, applications, roles, admin rights, and API grants support access-control review.",
    scannerEvidence: [
      "Auth0 applications, APIs, connections, roles, permissions, organizations, and Management API grants",
      "Okta users, groups, apps, assignments, policies, admin roles, and authorization servers"
    ],
    manualEvidence: [
      "HR source-of-truth records",
      "Joiner/mover/leaver tickets",
      "Access approvals and access reviews",
      "Role owner attestations"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Okta is stronger for workforce access evidence.",
      "Auth0 CIAM lifecycle may be external to Auth0."
    ],
    reportWordingGuidance:
      "The report provides identity access-control evidence; approvals and HR lifecycle evidence remain manual.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 21(2)(j)",
    controlReference: "NIS2 Article 21(2)(j)",
    controlName: "MFA, continuous authentication, and secured communications",
    identityDomain: "authentication-and-mfa",
    requirementSummary:
      "MFA/authenticator configuration, session policy, attack protection, and app sign-in policy support identity authentication review.",
    scannerEvidence: [
      "Auth0 Guardian/MFA, tenant session settings, breached password, brute-force, suspicious-IP controls, and database password settings",
      "Okta authenticators, global session/app sign-in/password policies, network zones, trusted origins, and System Log signals"
    ],
    manualEvidence: [
      "MFA rollout exceptions",
      "User enrollment evidence",
      "Break-glass process",
      "Conditional access design decisions and monitoring records"
    ],
    supportedProviders: [...BOTH],
    coverage: "strong",
    caveats: [
      "Automated evidence shows configuration, not every user experience or enforcement outcome."
    ],
    reportWordingGuidance:
      "Provider configuration supports MFA and authentication evidence; operating exceptions require manual review.",
    source: SOURCE
  },
  {
    framework: "nis2",
    controlId: "Article 23",
    controlReference: "NIS2 Article 23 support",
    controlName: "Significant incident notification support",
    identityDomain: "incident-investigation",
    requirementSummary:
      "Identity logs and admin activity can support investigation timelines, but notification obligations are process and legal requirements.",
    scannerEvidence: [
      "Auth0 bounded logs, log streams, attack-protection signals, and admin/API grant context",
      "Okta System Log summaries, log streams, event hooks, and admin activity indicators"
    ],
    manualEvidence: [
      "Incident classification",
      "Legal notification analysis",
      "Regulator/customer notices",
      "Incident timeline and management sign-off"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Scanner output cannot determine legal notification obligations."],
    reportWordingGuidance:
      "Identity evidence may support incident investigation but does not determine reportability.",
    source: SOURCE
  }
];

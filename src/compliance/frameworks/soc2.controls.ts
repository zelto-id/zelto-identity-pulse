import { ComplianceControl } from "../compliance.types";

const SOURCE = "docs/compliance/identity-control-matrix.md" as const;
const BOTH = ["auth0", "okta"] as const;

export const SOC2_CONTROLS: ComplianceControl[] = [
  {
    framework: "soc2",
    controlId: "CC3.2",
    controlReference: "SOC 2 CC3.2 support",
    controlName: "Risk identification and assessment",
    identityDomain: "exceptions-and-manual-evidence",
    requirementSummary:
      "Identity findings can support identification of risks related to access, authentication, logging, and privileged administration.",
    scannerEvidence: [
      "Auth0 findings across tenant, apps, APIs, connections, MFA, logging, and extensibility",
      "Okta findings across users, groups, apps, policies, authenticators, admins, logs, and network zones"
    ],
    manualEvidence: [
      "Risk assessment methodology",
      "Risk register",
      "Control mapping",
      "Management review and risk acceptance"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Scanner output is not an entity-wide risk assessment."],
    reportWordingGuidance:
      "Identity posture findings may support SOC 2 risk assessment evidence.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC4.1",
    controlReference: "SOC 2 CC4.1 support",
    controlName: "Monitoring of controls",
    identityDomain: "change-configuration-drift",
    requirementSummary:
      "Repeated scans, coverage status, and identity logs can support control monitoring evidence.",
    scannerEvidence: [
      "Auth0 coverage, findings, log streams, and logs where collected",
      "Okta coverage, findings, System Log summary, log streams, and admin activity"
    ],
    manualEvidence: [
      "Control monitoring plan",
      "Evidence of periodic review",
      "Exception tracking",
      "Internal audit results"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Current scans are point-in-time unless customers run and retain them periodically."],
    reportWordingGuidance:
      "Recurring identity scans can support monitoring evidence when retained and reviewed.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC5.2",
    controlReference: "SOC 2 CC5.2 support",
    controlName: "Technology control activities",
    identityDomain: "exceptions-and-manual-evidence",
    requirementSummary:
      "Deterministic identity rules can evidence whether selected configured controls exist or are missing.",
    scannerEvidence: [
      "Auth0 rule outputs for tenant, apps, APIs, MFA, attack protection, and logs",
      "Okta rule outputs for policies, authenticators, users/apps, admin roles, logs, and network zones"
    ],
    manualEvidence: [
      "Control design documentation",
      "Control owner attestation",
      "Process evidence",
      "Evidence of control operation"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Technical findings do not prove control design suitability across the full system."],
    reportWordingGuidance:
      "The report can provide technical support evidence for selected identity control activities.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.1",
    controlReference: "SOC 2 CC6.1",
    controlName: "Logical access security",
    identityDomain: "access-rights-and-app-assignments",
    requirementSummary:
      "Identity provider configuration controls logical access to applications, APIs, admin functions, and identity resources.",
    scannerEvidence: [
      "Auth0 apps, APIs, roles, permissions, connections, grants, and MFA",
      "Okta users, groups, apps, policies, authenticators, admin roles, and authorization servers"
    ],
    manualEvidence: [
      "Access control policy",
      "User authorization records",
      "Access reviews",
      "Owner approvals"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Provider configuration may not cover downstream app authorization or non-SSO access paths."],
    reportWordingGuidance:
      "Identity provider access configuration supports CC6 logical access review but must be reconciled with application access records.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.2",
    controlReference: "SOC 2 CC6.2",
    controlName: "User registration and authorization before issuing credentials",
    identityDomain: "user-lifecycle",
    requirementSummary:
      "User status, source, groups, assignments, and connection design can support whether identities are managed deliberately.",
    scannerEvidence: [
      "Auth0 connections, users where collected, organizations, and role/permission model",
      "Okta users, groups, group rules, app assignments, identity providers, and lifecycle status"
    ],
    manualEvidence: [
      "HR onboarding records",
      "Access request approvals",
      "Identity proofing records",
      "User acceptance and IGA workflows"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Okta Workforce is stronger for workforce evidence.",
      "Auth0 customer identity onboarding may be product-specific."
    ],
    reportWordingGuidance:
      "Provider evidence can support user registration review but does not prove approval workflow execution.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.3",
    controlReference: "SOC 2 CC6.3",
    controlName: "Modify or remove access when roles change or users terminate",
    identityDomain: "user-lifecycle",
    requirementSummary:
      "Lifecycle status, stale users, inactive users, and assignments can support access removal review.",
    scannerEvidence: [
      "Auth0 users where collected, blocked status, last login, and role/organization context",
      "Okta user statuses, lifecycle dates, groups, app assignments, and stale/inactive indicators"
    ],
    manualEvidence: [
      "Termination records",
      "Mover tickets",
      "Access revocation evidence",
      "Periodic user access reviews"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Auth0 CIAM accounts may not map to workforce termination.",
      "Bounded Okta user collection can limit confidence."
    ],
    reportWordingGuidance:
      "Lifecycle evidence should be paired with HR and access revocation records.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.4",
    controlReference: "SOC 2 CC6.4",
    controlName: "Restrict access to privileged functions",
    identityDomain: "privileged-access",
    requirementSummary:
      "Admin role assignments, sensitive API scopes, and Management API grants support privileged access review.",
    scannerEvidence: [
      "Auth0 Management API grants, M2M clients, roles/permissions, and sensitive scopes",
      "Okta admin role assignments, admin activity, and privileged app assignments"
    ],
    manualEvidence: [
      "PAM records",
      "Privileged access approvals",
      "Admin access reviews",
      "Separation-of-duties review and emergency access records"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Automation clients can be privileged by design but require ownership, logging, and least privilege."],
    reportWordingGuidance:
      "Privileged access findings identify review targets; approval and review evidence remains manual.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.5",
    controlReference: "SOC 2 CC6.5",
    controlName: "Prevent or detect unauthorized access",
    identityDomain: "authentication-and-mfa",
    requirementSummary:
      "MFA, attack protection, password policies, session controls, logs, and monitoring support prevention/detection.",
    scannerEvidence: [
      "Auth0 Guardian/MFA, attack protection, password policy, session settings, and log streams",
      "Okta authenticators, sign-on policies, password/session policies, System Log, and network zones"
    ],
    manualEvidence: [
      "Security monitoring records",
      "Alert triage",
      "Exception approvals",
      "Helpdesk procedures and incident tickets"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Configuration does not prove detection efficacy or alert response."],
    reportWordingGuidance:
      "Authentication and detection configuration supports unauthorized-access control evidence.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.6",
    controlReference: "SOC 2 CC6.6",
    controlName: "Logical access through network and perimeter controls",
    identityDomain: "network-zones-and-trusted-origins",
    requirementSummary:
      "Network zones, trusted origins, redirect allowlists, custom domains, and app sign-in conditions support boundary review.",
    scannerEvidence: [
      "Auth0 callback/origin allowlists, custom domains, and tenant settings",
      "Okta network zones, trusted origins, domains, policy conditions, and app settings"
    ],
    manualEvidence: [
      "Network diagrams",
      "Firewall/WAF/VPN evidence",
      "Device management",
      "Endpoint posture and perimeter monitoring"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Identity settings are not full network security evidence."],
    reportWordingGuidance:
      "Identity network exposure evidence should be combined with infrastructure evidence.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC6.7",
    controlReference: "SOC 2 CC6.7",
    controlName: "Restrict data transmission and movement",
    identityDomain: "api-oauth-authorization",
    requirementSummary:
      "OAuth grant choices, redirect URIs, token lifetimes, API scopes, and client auth affect identity-mediated data/token exposure.",
    scannerEvidence: [
      "Auth0 grant types, callback/origin posture, token lifetimes, refresh token rotation, and API scopes",
      "Okta OAuth apps, authorization servers, scopes, claims, and trusted origins"
    ],
    manualEvidence: [
      "Data flow diagrams",
      "Encryption/TLS evidence",
      "DLP controls",
      "Data handling procedures and app-layer controls"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Identity token posture is supporting evidence only."],
    reportWordingGuidance:
      "OAuth/token posture can support review of identity-mediated data exposure.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC7.1",
    controlReference: "SOC 2 CC7.1",
    controlName: "Detect security events and anomalies",
    identityDomain: "logging-and-monitoring",
    requirementSummary:
      "Identity events, admin actions, failed logins, attack-protection signals, and log streams can support event detection.",
    scannerEvidence: [
      "Auth0 bounded logs, attack protection, and log streams",
      "Okta bounded System Log summary, log streams, event hooks, and admin activity"
    ],
    manualEvidence: [
      "SIEM detections",
      "Alert review",
      "Investigation tickets",
      "Escalation records and retention evidence"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Bounded provider events are not a complete detection program."],
    reportWordingGuidance:
      "Identity event evidence may support SOC 2 detection criteria when paired with SOC evidence.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC7.2-CC7.5",
    controlReference: "SOC 2 CC7.2-CC7.5 support",
    controlName: "Monitor, evaluate, respond, and recover from security events",
    identityDomain: "incident-investigation",
    requirementSummary:
      "Identity logs can support investigation and response, but response/recovery are process controls.",
    scannerEvidence: [
      "Auth0 logs/log streams and identity configuration context",
      "Okta System Log summary, log streams, event hooks, and admin activity"
    ],
    manualEvidence: [
      "Incident tickets",
      "Response actions",
      "Forensics and postmortems",
      "Recovery evidence and management review"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Scanner output cannot prove event evaluation, response, or recovery."],
    reportWordingGuidance:
      "Identity evidence can support incident investigation but does not replace response records.",
    source: SOURCE
  },
  {
    framework: "soc2",
    controlId: "CC8.1",
    controlReference: "SOC 2 CC8.1",
    controlName: "Change management",
    identityDomain: "change-configuration-drift",
    requirementSummary:
      "Report deltas and future local history can support identity configuration change review.",
    scannerEvidence: [
      "Auth0 point-in-time configuration and future JSON deltas",
      "Okta point-in-time configuration and future JSON deltas"
    ],
    manualEvidence: [
      "Change requests",
      "Approvals",
      "Testing evidence",
      "Emergency change review and rollback records"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Delta comparison requires user-supplied reports and does not replace change records."],
    reportWordingGuidance:
      "Identity delta evidence can support change review when tied to change records.",
    source: SOURCE
  }
];

import { ComplianceControl } from "../compliance.types";

const SOURCE = "docs/compliance/identity-control-matrix.md" as const;
const BOTH = ["auth0", "okta"] as const;

export const ISO27001_CONTROLS: ComplianceControl[] = [
  {
    framework: "iso27001",
    controlId: "A.5.9",
    controlReference: "ISO/IEC 27002:2022 A.5.9",
    controlName: "Inventory of information and associated assets",
    identityDomain: "identity-inventory",
    requirementSummary:
      "Identity inventories help identify applications, APIs, users, groups, roles, integrations, and external identity sources.",
    scannerEvidence: [
      "Auth0 clients, APIs, connections, roles, organizations, log streams, and extensibility inventory",
      "Okta users, groups, apps, policies, admin roles, IdPs, hooks, log streams, and domains"
    ],
    manualEvidence: [
      "Asset inventory ownership",
      "Business criticality and data classification",
      "CMDB records",
      "Application owner attestations"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Provider inventory is identity-scoped and may omit systems outside Auth0 or Okta."],
    reportWordingGuidance:
      "Identity inventory evidence may support asset inventory for identity-connected resources.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.5.15",
    controlReference: "ISO/IEC 27002:2022 A.5.15",
    controlName: "Access control",
    identityDomain: "access-rights-and-app-assignments",
    requirementSummary:
      "Access-control design depends on app assignments, policies, roles, groups, API scopes, and provider boundaries.",
    scannerEvidence: [
      "Auth0 client grants, API scopes/RBAC, roles/permissions, and organization settings",
      "Okta groups, app assignments, policies, authorization servers, and admin roles"
    ],
    manualEvidence: [
      "Access control policy",
      "Role model",
      "Approvals and access review results",
      "Exception register"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Technical configuration does not prove access was approved or reviewed."],
    reportWordingGuidance:
      "Provider configuration supports access-control design review; approval evidence remains manual.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.5.16",
    controlReference: "ISO/IEC 27002:2022 A.5.16",
    controlName: "Identity management",
    identityDomain: "user-lifecycle",
    requirementSummary:
      "User, group, role, lifecycle, and identity-source records support identity management review.",
    scannerEvidence: [
      "Auth0 users where collected, connections, organizations, and roles",
      "Okta users, groups, group rules, identity providers, lifecycle status, and app assignments"
    ],
    manualEvidence: [
      "HR records",
      "Joiner/mover/leaver tickets",
      "Authoritative source mapping",
      "Identity governance evidence"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: [
      "Okta is stronger for workforce lifecycle.",
      "Auth0 CIAM lifecycle may rely on product systems."
    ],
    reportWordingGuidance:
      "Identity management evidence is provider-scoped and should be reconciled with HR/source-of-truth records.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.5.17",
    controlReference: "ISO/IEC 27002:2022 A.5.17",
    controlName: "Authentication information",
    identityDomain: "password-authenticator-policy",
    requirementSummary:
      "Password policy, authenticator configuration, client credentials posture, and token settings support authentication-secret review.",
    scannerEvidence: [
      "Auth0 database password settings, MFA, token endpoint auth, refresh tokens, and client auth method",
      "Okta password policies, authenticators, OAuth app settings, authorization servers, and policies"
    ],
    manualEvidence: [
      "Secret rotation records",
      "Password policy approval",
      "Credential vault evidence",
      "Break-glass credential review"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Scanner output must not expose secrets and should only report posture metadata."],
    reportWordingGuidance:
      "Authentication configuration supports review without exposing secret values.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.5.18",
    controlReference: "ISO/IEC 27002:2022 A.5.18",
    controlName: "Access rights",
    identityDomain: "access-rights-and-app-assignments",
    requirementSummary:
      "Privilege assignment, app assignment, API grants, and role permissions support access rights review.",
    scannerEvidence: [
      "Auth0 roles, permissions, APIs, Management API grants, and client grants",
      "Okta admin roles, users/groups/apps, assignment summaries, and authorization server policies"
    ],
    manualEvidence: [
      "Periodic access review",
      "Access owner approvals",
      "Separation-of-duties review",
      "Ticket evidence and exception approvals"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Provider evidence does not prove periodic review occurred."],
    reportWordingGuidance:
      "Access-rights evidence should be paired with access review and approval records.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.5.24-A.5.28",
    controlReference: "ISO/IEC 27002:2022 A.5.24-A.5.28",
    controlName: "Incident management and evidence collection",
    identityDomain: "incident-investigation",
    requirementSummary:
      "Logs, streams, admin activity, and security events can support incident detection and evidence preservation.",
    scannerEvidence: [
      "Auth0 log streams, logs where collected, attack protection, and hooks/actions context",
      "Okta System Log summary, log streams, event hooks, and admin activity signals"
    ],
    manualEvidence: [
      "Incident procedures",
      "Incident tickets",
      "Forensic evidence handling",
      "Retention settings and post-incident lessons learned"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Bounded logs are not a complete audit trail; retention must be verified outside the scanner."],
    reportWordingGuidance:
      "Identity logs may support incident evidence, but process and retention evidence remain manual.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.2",
    controlReference: "ISO/IEC 27002:2022 A.8.2",
    controlName: "Privileged access rights",
    identityDomain: "privileged-access",
    requirementSummary:
      "Admin roles and high-scope API grants directly affect privileged access.",
    scannerEvidence: [
      "Auth0 Management API grants, roles/permissions, M2M clients, and sensitive scopes",
      "Okta admin role assignments, admin activity, and app/admin assignments"
    ],
    manualEvidence: [
      "Privileged access policy",
      "PAM records",
      "Admin access reviews",
      "Break-glass approval and separation-of-duties review"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Some high-privilege use can be valid automation with documented ownership and monitoring."],
    reportWordingGuidance:
      "Privileged identity evidence should identify high-risk assignments and require owner validation.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.3",
    controlReference: "ISO/IEC 27002:2022 A.8.3",
    controlName: "Information access restriction",
    identityDomain: "access-rights-and-app-assignments",
    requirementSummary:
      "Application, API, group, policy, and scope controls restrict identity-mediated access.",
    scannerEvidence: [
      "Auth0 app settings, API scopes/RBAC, client grants, connections, and organization behavior",
      "Okta app assignments, groups, policies, authorization servers, scopes, and claims"
    ],
    manualEvidence: [
      "Data classification",
      "Entitlement model",
      "Application owner approval",
      "Access review evidence"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Identity provider restrictions may not represent downstream application authorization."],
    reportWordingGuidance:
      "Provider access restrictions are supporting evidence and must be reconciled with application authorization design.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.5",
    controlReference: "ISO/IEC 27002:2022 A.8.5",
    controlName: "Secure authentication",
    identityDomain: "authentication-and-mfa",
    requirementSummary:
      "MFA, session, password, authenticator, and attack protection settings support secure authentication review.",
    scannerEvidence: [
      "Auth0 Guardian/MFA, session lifetime, database password policy, brute-force, breached-password, and suspicious-IP controls",
      "Okta authenticators, password/session/app sign-in policies, network zones, and System Log signals"
    ],
    manualEvidence: [
      "MFA exception list",
      "Rollout status",
      "Conditional access design",
      "User enrollment evidence and break-glass process"
    ],
    supportedProviders: [...BOTH],
    coverage: "strong",
    caveats: ["Configuration does not prove every user or transaction was challenged as intended."],
    reportWordingGuidance:
      "Secure authentication evidence is strong for configuration, but exceptions and enforcement outcomes need validation.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.8",
    controlReference: "ISO/IEC 27002:2022 A.8.8",
    controlName: "Management of technical vulnerabilities",
    identityDomain: "api-oauth-authorization",
    requirementSummary:
      "Legacy extensibility, insecure endpoints, weak authentication methods, and risky grants can indicate identity configuration vulnerabilities.",
    scannerEvidence: [
      "Auth0 Rules/Hooks EOL risk, callbacks/origins, weak client auth, token lifetimes, and signing algorithms",
      "Okta app OAuth posture, hooks, trusted origins, domains, and policy weaknesses"
    ],
    manualEvidence: [
      "Vulnerability management program",
      "Patch SLAs",
      "SAST/DAST results",
      "Dependency scanning and vendor advisories"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Scanner output finds identity misconfiguration, not a full vulnerability management program."],
    reportWordingGuidance:
      "Identity misconfiguration findings may support vulnerability review but are not a vulnerability management program.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.15",
    controlReference: "ISO/IEC 27002:2022 A.8.15",
    controlName: "Logging",
    identityDomain: "logging-and-monitoring",
    requirementSummary:
      "Log stream and log availability posture supports identity event logging review.",
    scannerEvidence: [
      "Auth0 log streams and bounded logs where available",
      "Okta log streams and bounded System Log summary"
    ],
    manualEvidence: [
      "SIEM retention",
      "Log parsing rules",
      "Alerting",
      "Audit-log retention evidence and access to logs"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Log stream configuration does not prove ingestion, retention, alert quality, or review."],
    reportWordingGuidance:
      "Identity logging configuration can support logging control evidence when paired with SIEM records.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.16",
    controlReference: "ISO/IEC 27002:2022 A.8.16",
    controlName: "Monitoring activities",
    identityDomain: "logging-and-monitoring",
    requirementSummary:
      "Monitoring depends on collecting identity events and using them for detection and response.",
    scannerEvidence: [
      "Auth0 active log streams, attack protection, and bounded logs",
      "Okta System Log summary, log streams, event hooks, and admin activity indicators"
    ],
    manualEvidence: [
      "Detection rules",
      "Alert triage",
      "SOC runbooks",
      "Monitoring tickets and response metrics"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Scanner output does not know whether alerts are reviewed or acted on."],
    reportWordingGuidance:
      "Identity monitoring evidence is configuration/supporting evidence, not monitoring operating effectiveness.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.20",
    controlReference: "ISO/IEC 27002:2022 A.8.20",
    controlName: "Network security",
    identityDomain: "network-zones-and-trusted-origins",
    requirementSummary:
      "Trusted origins, callback/origin allowlists, custom domains, and network zones affect identity network exposure.",
    scannerEvidence: [
      "Auth0 callback/origin allowlists, custom domains, and tenant flags",
      "Okta network zones, trusted origins, domains, and app sign-on/network conditions"
    ],
    manualEvidence: [
      "Network architecture",
      "Firewall/VPN controls",
      "WAF/CDN configuration",
      "Device posture and endpoint controls"
    ],
    supportedProviders: [...BOTH],
    coverage: "partial",
    caveats: ["Identity provider network settings are only part of network security."],
    reportWordingGuidance:
      "Identity network-exposure evidence should be combined with network and endpoint evidence.",
    source: SOURCE
  },
  {
    framework: "iso27001",
    controlId: "A.8.32",
    controlReference: "ISO/IEC 27002:2022 A.8.32",
    controlName: "Change management",
    identityDomain: "change-configuration-drift",
    requirementSummary:
      "Report Contract v1 and delta comparisons can support configuration drift review in future workflows.",
    scannerEvidence: [
      "Auth0 point-in-time configuration and future before/after JSON deltas",
      "Okta point-in-time configuration and future before/after JSON deltas"
    ],
    manualEvidence: [
      "Change requests",
      "Approvals",
      "Testing evidence",
      "Emergency change review and rollback records"
    ],
    supportedProviders: [...BOTH],
    coverage: "manual-only",
    caveats: ["Current scanner output is not a change-management system or database."],
    reportWordingGuidance:
      "Point-in-time and delta evidence may support change review but do not replace change records.",
    source: SOURCE
  }
];

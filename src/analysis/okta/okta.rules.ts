import {
  OktaAdminRoleAssignment,
  OktaAppSummary,
  OktaAuthenticator,
  OktaAuthorizationServer,
  OktaAuthorizationServerClaim,
  OktaAuthorizationServerPolicy,
  OktaAuthorizationServerScope,
  OktaEventHook,
  OktaInlineHook,
  OktaLogStream,
  OktaNetworkZone,
  OktaOrgSnapshot,
  OktaPolicy,
  OktaPolicyRule,
  OktaTrustedOrigin,
  OktaUserSummary
} from "../../connectors/okta/okta.types";
import { OktaFinding } from "../../reporting/markdown/okta-report.types";
import { SEVERITY_SCORE_IMPACT } from "../../reporting/markdown/report.types";

interface RuleOptions {
  includeIdentifiers?: boolean;
}

const STRONG_AUTHENTICATOR_KEYS = new Set([
  "okta_verify",
  "webauthn",
  "webauthn_platform",
  "signed_nonce"
]);
const ACCEPTABLE_STRONG_AUTHENTICATOR_KEYS = new Set([
  ...STRONG_AUTHENTICATOR_KEYS,
  "token:software:totp"
]);
const WEAK_FACTOR_KEYS = new Set(["okta_sms", "sms", "call", "email", "okta_email", "okta_call", "okta_otp"]);
const HIGH_PRIVILEGE_ROLE_RE = /super_admin|org_admin/i;
const CUSTOM_ROLE_RE = /custom/i;
const RISKY_OAUTH_GRANTS = new Set(["implicit", "password"]);
const RISKY_AUTH_SERVER_GRANTS = new Set([
  "implicit",
  "password",
  "urn:ietf:params:oauth:grant-type:token-exchange",
  "urn:ietf:params:oauth:grant-type:jwt-bearer"
]);
const ADMIN_ACTIVITY_EVENTS = new Set([
  "user.session.access_admin_app",
  "security.protected_action.attempt"
]);
const MFA_EVIDENCE_EVENTS = new Set([
  "user.authentication.auth_via_mfa",
  "system.push.send_factor_verify_push",
  "user.authentication.verify"
]);
const STANDARD_SCOPES = new Set([
  "openid",
  "profile",
  "email",
  "address",
  "phone",
  "offline_access",
  "groups"
]);
const STANDARD_CLAIMS = new Set([
  "sub",
  "aud",
  "iss",
  "iat",
  "exp",
  "jti",
  "ver",
  "cid",
  "uid",
  "scp",
  "auth_time",
  "acr",
  "amr",
  "nonce",
  "preferred_username",
  "name",
  "given_name",
  "family_name",
  "middle_name",
  "nickname",
  "picture",
  "locale",
  "zoneinfo",
  "updated_at",
  "email_verified",
  "at_hash"
]);

function mkFinding(
  input: Omit<OktaFinding, "scoreImpact" | "classification"> & {
    scoreImpact?: number;
    classification?: OktaFinding["classification"];
  }
): OktaFinding {
  return {
    ...input,
    classification: input.classification ?? "advisory",
    scoreImpact: input.scoreImpact ?? SEVERITY_SCORE_IMPACT[input.severity]
  };
}

export function runAllOktaRules(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  return [
    ...ruleOrgMetadata(snapshot),
    ...ruleRiskyGrantTypes(snapshot),
    ...ruleDirectAppAssignments(snapshot),
    ...ruleBroadAppAssignments(snapshot),
    ...ruleInactiveOrOrphanedApps(snapshot),
    ...ruleMissingAppSignOnPolicies(snapshot),
    ...rulePolicyCoverage(snapshot),
    ...ruleWeakSignOnPolicies(snapshot),
    ...ruleWeakPasswordPolicies(snapshot),
    ...ruleWeakEnrollmentPolicies(snapshot),
    ...ruleAuthenticatorCoverage(snapshot),
    ...ruleAuthorizationServerPolicies(snapshot),
    ...rulePermissiveAuthorizationServerPolicies(snapshot),
    ...ruleRiskyAuthorizationServerTokenLifetimes(snapshot),
    ...rulePublishedCustomScopes(snapshot),
    ...ruleAdminRoleCounts(snapshot),
    ...ruleDirectSuperAdminAssignments(snapshot, options),
    ...ruleAdminRoleVisibilityGap(snapshot, options),
    ...ruleAdminMfaPosture(snapshot, options),
    ...ruleStaleAdminLikeUsers(snapshot, options),
    ...ruleUserLifecycleStates(snapshot, options),
    ...ruleInactiveUsers(snapshot, options),
    ...ruleUngroupedUsers(snapshot, options),
    ...ruleUnusedNetworkZones(snapshot),
    ...ruleMissingTrustedOrigins(snapshot),
    ...ruleTrustedOriginTransport(snapshot),
    ...ruleHookTransport(snapshot),
    ...ruleNoLogStreams(snapshot),
    ...ruleCoverage(snapshot)
  ];
}

function ruleOrgMetadata(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const org = snapshot.org;
  if (!org) return [];

  const missing: string[] = [];
  if (!org.companyName) missing.push("companyName");
  if (!org.website) missing.push("website");
  if (missing.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-ORG-001",
      title: "Okta org metadata is incomplete",
      severity: "low",
      category: "orgBaseline",
      affectedResources: ["okta_org"],
      evidence: `Missing org metadata: ${missing.join(", ")}.`,
      recommendation:
        "Populate the org profile so administrators and downstream tooling can distinguish this org cleanly.",
      businessRisk:
        "Sparse org metadata weakens operational clarity and increases the chance of environment confusion during incident response.",
      oktaArea: "Customizations / Org settings",
      confidence: "high"
    })
  ];
}

function ruleRiskyGrantTypes(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = arrayOf<OktaAppSummary>(snapshot.apps)
    .map((app) => ({ app, grants: app.settings?.oauthClient?.grant_types ?? [] }))
    .filter(({ grants }) => grants.some((grant) => RISKY_OAUTH_GRANTS.has(grant)));

  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-APP-001",
      title: "One or more Okta apps allow risky OAuth grant types",
      severity: "high",
      category: "applicationsAndSSO",
      affectedResources: offenders.map(({ app }) => formatAppName(app)),
      evidence: offenders
        .map(({ app, grants }) => `${formatAppName(app)}: grants=${grants.join(", ")}`)
        .slice(0, 8)
        .join(" | "),
      recommendation:
        "Remove `implicit` and password-based grants where possible. Prefer authorization code + PKCE for interactive apps.",
      businessRisk:
        "Legacy grants increase token leakage and credential phishing risk, especially when reused across multiple environments.",
      oktaArea: "Applications",
      confidence: "high"
    })
  ];
}

function ruleDirectAppAssignments(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = activeApps(snapshot)
    .filter((app) => app.assignmentModel === "direct" || app.assignmentModel === "mixed")
    .filter((app) => isUserFacingAssignedApp(app) || classifyAppForAssignmentRisk(app) === "admin/privileged app");
  if (offenders.length === 0) return [];

  const details = offenders.map((app) => ({
    app,
    classification: classifyAppForAssignmentRisk(app)
  }));
  const resources = summarizeAppResources(offenders);
  const hasPrivilegedApp = details.some((item) => item.classification === "admin/privileged app");
  const severity: OktaFinding["severity"] = hasPrivilegedApp
    ? "medium"
    : details.some((item) => (item.app.sampledDirectUserAssignments ?? 0) >= 10)
      ? "medium"
      : "low";

  return [
    mkFinding({
      id: "OKTA-APP-003",
      title: "Direct user app assignments were detected",
      severity,
      category: "applicationsAndSSO",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: details
        .slice(0, 10)
        .map(
          ({ app, classification }) =>
            `${formatAppName(app)}: class=${classification}, assignment_model=${app.assignmentModel}, sampled_direct_users=${app.sampledDirectUserAssignments ?? 0}, sampled_groups=${app.sampledGroupAssignments ?? 0}${app.assignmentDataIncomplete ? ", sample_incomplete=true" : ""}`
        )
        .join(" | "),
      recommendation:
        "Prefer group-based assignment models for workforce applications so access reviews and joiner/mover/leaver flows remain manageable.",
      businessRisk:
        "Direct app-user assignments increase entitlement sprawl and make workforce access harder to govern at scale.",
      oktaArea: "Applications > Assignments",
      confidence: "medium"
    })
  ];
}

function ruleBroadAppAssignments(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = activeApps(snapshot)
    .filter((app) => {
      const groupNames = app.sampledAssignedGroupNames ?? [];
      return (
        groupNames.some((name) => /everyone|all users/i.test(name)) ||
        (app.sampledDirectUserAssignments ?? 0) >= 25 ||
        (app.sampledGroupAssignments ?? 0) >= 25
      );
    })
    .filter((app) => isUserFacingAssignedApp(app) || classifyAppForAssignmentRisk(app) === "admin/privileged app");
  if (offenders.length === 0) return [];

  const details = offenders.map((app) => ({
    app,
    classification: classifyAppForAssignmentRisk(app)
  }));
  const resources = summarizeAppResources(offenders);
  const hasPrivilegedApp = details.some((item) => item.classification === "admin/privileged app");
  const allBaseline = details.every((item) => item.classification === "likely-baseline app");
  const severity: OktaFinding["severity"] = hasPrivilegedApp
    ? "medium"
    : allBaseline
      ? "low"
      : "medium";

  return [
    mkFinding({
      id: "OKTA-APP-004",
      title: "One or more apps appear broadly assigned",
      severity,
      category: "applicationsAndSSO",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: details
        .slice(0, 10)
        .map(({ app, classification }) => {
          const groupNames = (app.sampledAssignedGroupNames ?? []).filter((name) =>
            /everyone|all users/i.test(name)
          );
          return `${formatAppName(app)}: class=${classification}, sampled_direct_users=${app.sampledDirectUserAssignments ?? 0}, sampled_groups=${app.sampledGroupAssignments ?? 0}${groupNames.length > 0 ? `, broad_groups=${groupNames.join(", ")}` : ""}${app.assignmentDataIncomplete ? ", sample_incomplete=true" : ""}`;
        })
        .join(" | "),
      recommendation:
        "Review whether broad assignments are intentional. Reduce blast radius by scoping workforce apps to narrower groups where possible.",
      businessRisk:
        "Broad assignment models can expose sensitive apps to larger populations than intended and increase the cost of access review.",
      oktaArea: "Applications > Assignments",
      confidence: "medium"
    })
  ];
}

function ruleInactiveOrOrphanedApps(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = arrayOf<OktaAppSummary>(snapshot.apps).filter((app) => {
    if (!app.status || app.status !== "ACTIVE") return true;
    return app.assignmentModel === "none" && isUserFacingAssignedApp(app);
  });
  if (offenders.length === 0) return [];

  const resources = summarizeAppResources(offenders);

  return [
    mkFinding({
      id: "OKTA-APP-005",
      title: "Inactive or apparently unassigned apps were detected",
      severity: "low",
      category: "applicationsAndSSO",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: offenders
        .slice(0, 12)
        .map(
          (app) =>
            `${formatAppName(app)}: status=${app.status ?? "unknown"}, assignment_model=${app.assignmentModel ?? "unknown"}`
        )
        .join(" | "),
      recommendation:
        "Review whether inactive or apparently unassigned apps should be retired, disabled, or explicitly documented as reserved infrastructure.",
      businessRisk:
        "Forgotten or unassigned apps add operational clutter and can leave stale integration paths behind without clear ownership.",
      oktaArea: "Applications",
      confidence: "medium"
    })
  ];
}

function ruleMissingAppSignOnPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const appCount = activeApps(snapshot).length;
  const appPolicies = arrayOf<OktaPolicy>(snapshot.policies?.appSignInPolicies);
  if (appCount === 0 || appPolicies.length > 0) return [];

  return [
    mkFinding({
      id: "OKTA-APP-006",
      title: "Apps were collected but no app sign-on policies were identified",
      severity: "medium",
      category: "applicationsAndSSO",
      affectedResources: ["okta_app_policy"],
      evidence: `Active apps=${appCount}, app_sign_in_policies=${appPolicies.length}.`,
      recommendation:
        "Define app sign-on policies for sensitive workforce apps so assurance requirements are not left to defaults alone.",
      businessRisk:
        "Without app-specific sign-on policy coverage, assurance and reauthentication requirements can drift across workforce applications.",
      oktaArea: "Security > Authentication > Policies",
      confidence: "medium"
    })
  ];
}

function rulePolicyCoverage(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const policies = snapshot.policies;
  if (!policies) return [];
  const sessionPolicies = arrayOf<OktaPolicy>(policies.globalSessionPolicies);
  const appPolicies = arrayOf<OktaPolicy>(policies.appSignInPolicies);
  if (sessionPolicies.length > 0 || appPolicies.length > 0) return [];

  return [
    mkFinding({
      id: "OKTA-POL-001",
      title: "No sign-on or app access policies were collected",
      severity: "medium",
      category: "policiesAndAuthentication",
      affectedResources: ["okta_policy"],
      evidence: `Collected policies=${policies.all.length}, global_session=${sessionPolicies.length}, app_sign_in=${appPolicies.length}.`,
      recommendation:
        "Confirm sign-on and app access policies exist and are assigned to the intended user/app populations.",
      businessRisk:
        "Without explicit session or app access policy coverage, sign-in behavior may be governed by defaults that are hard to review and harder to harden consistently.",
      oktaArea: "Security > Authentication > Policies",
      confidence: "medium"
    })
  ];
}

function ruleWeakSignOnPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const policies = [
    ...activePolicies(arrayOf<OktaPolicy>(snapshot.policies?.globalSessionPolicies)),
    ...activePolicies(arrayOf<OktaPolicy>(snapshot.policies?.appSignInPolicies))
  ];
  const weakRules: Array<{ policy: OktaPolicy; rule: OktaPolicyRule }> = [];

  for (const policy of policies) {
    for (const rule of activeRules(policy)) {
      if (!isRecord(rule.actions)) continue;
      const allows = ruleAllowsAccess(rule);
      const hasVerification = ruleHasStrongVerification(rule);
      if (allows && !hasVerification) {
        weakRules.push({ policy, rule });
      }
    }
  }

  if (weakRules.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-POL-003",
      title: "One or more sign-on rules appear to allow access without strong verification",
      severity: "high",
      category: "policiesAndAuthentication",
      affectedResources: weakRules.map(({ policy, rule }) => `${policy.name ?? policy.id}:${rule.name ?? rule.id}`),
      evidence: weakRules
        .slice(0, 10)
        .map(
          ({ policy, rule }) =>
            `${policy.name ?? policy.id}/${rule.name ?? rule.id}: network=${extractNetworkScope(rule)}, verification=${extractVerificationSummary(rule)}`
        )
        .join(" | "),
      recommendation:
        "Require MFA or assurance-driven verification for high-value sign-on flows and avoid blanket allow rules without explicit step-up logic.",
      businessRisk:
        "Access-allow rules without strong verification leave workforce identities more exposed to credential theft and session hijacking.",
      oktaArea: "Security > Authentication > Policies",
      confidence: "medium"
    })
  ];
}

function ruleWeakPasswordPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const policies = activePolicies(arrayOf<OktaPolicy>(snapshot.policies?.passwordPolicies));
  const weakPolicies = policies
    .map((policy) => {
      const detail = describeWeakPasswordPolicy(policy);
      return detail ? { policy, detail } : undefined;
    })
    .filter((item): item is { policy: OktaPolicy; detail: string } => Boolean(item));

  if (weakPolicies.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-POL-004",
      title: "Password policy appears weaker than a modern workforce baseline",
      severity: "medium",
      category: "policiesAndAuthentication",
      affectedResources: weakPolicies.map(({ policy }) => policy.name ?? policy.id),
      evidence: weakPolicies
        .map(({ policy, detail }) => `${policy.name ?? policy.id}: ${detail}`)
        .join(" | "),
      recommendation:
        "Review password complexity, history, and recovery settings. Avoid short passwords and recovery paths that rely on weak single-factor methods alone.",
      businessRisk:
        "Weak password policy settings reduce resistance to password spraying, reused credential abuse, and weak account recovery flows.",
      oktaArea: "Security > Authentication > Policies",
      confidence: "medium"
    })
  ];
}

function ruleWeakEnrollmentPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const policies = activePolicies(arrayOf<OktaPolicy>(snapshot.policies?.authenticatorEnrollmentPolicies));
  const offenders = policies
    .map((policy) => {
      const detail = describeWeakEnrollmentPolicy(policy);
      return detail ? { policy, detail } : undefined;
    })
    .filter((item): item is { policy: OktaPolicy; detail: string } => Boolean(item));

  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-POL-005",
      title: "Authenticator enrollment policy does not clearly require strong factors",
      severity: "medium",
      category: "policiesAndAuthentication",
      affectedResources: offenders.map(({ policy }) => policy.name ?? policy.id),
      evidence: offenders
        .map(({ policy, detail }) => `${policy.name ?? policy.id}: ${detail}`)
        .join(" | "),
      recommendation:
        "Require enrollment of at least one strong authenticator and reduce reliance on weak phone or OTP-only recovery patterns.",
      businessRisk:
        "Optional-only strong factor enrollment can leave workforce users with weaker fallback factors than the tenant intends.",
      oktaArea: "Security > Authenticators / MFA Enrollment",
      confidence: "medium"
    })
  ];
}

function ruleAuthenticatorCoverage(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const authenticators = arrayOf<OktaAuthenticator>(snapshot.authenticators);
  const active = authenticators.filter((authenticator) => isActiveStatus(authenticator.status));
  const strong = active.filter((authenticator) =>
    ACCEPTABLE_STRONG_AUTHENTICATOR_KEYS.has((authenticator.key ?? "").toLowerCase())
  );
  if (strong.length > 0) return [];

  return [
    mkFinding({
      id: "OKTA-POL-002",
      title: "No active strong authenticator was identified",
      severity: "high",
      category: "policiesAndAuthentication",
      affectedResources:
        active.length > 0
          ? active.map((authenticator) => authenticator.name ?? authenticator.id)
          : ["okta_authenticator"],
      evidence: `Active authenticators=${active.map((authenticator) => authenticator.key ?? authenticator.name ?? authenticator.id).join(", ") || "none"}.`,
      recommendation:
        "Enable and roll out at least one phishing-resistant or strong MFA authenticator such as Okta Verify FastPass or WebAuthn where appropriate.",
      businessRisk:
        "Weak or absent strong authenticators leave sensitive sign-ins and step-up flows dependent on less resilient authentication factors.",
      oktaArea: "Security > Authenticators",
      confidence: "medium"
    })
  ];
}

function ruleAuthorizationServerPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const servers = arrayOf<OktaAuthorizationServer>(snapshot.authorizationServers);
  if (servers.length === 0) return [];

  const policiesByServer = new Map<string, number>();
  for (const policy of arrayOf<OktaAuthorizationServerPolicy>(snapshot.authorizationServerPolicies)) {
    policiesByServer.set(
      policy.authorizationServerId,
      (policiesByServer.get(policy.authorizationServerId) ?? 0) + 1
    );
  }

  const offenders = servers.filter(
    (server) =>
      server.policyVisibilityLimited !== true &&
      (policiesByServer.get(server.id) ?? 0) === 0
  );
  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-API-001",
      title: "Custom authorization server lacks access policies",
      severity: "medium",
      category: "apiAccessManagement",
      affectedResources: offenders.map((server) => server.name ?? server.id),
      evidence: offenders.map((server) => `${server.name ?? server.id}: policies=0`).join(" | "),
      recommendation:
        "Define access policies and rules for each custom authorization server so token issuance is constrained intentionally.",
      businessRisk:
        "Authorization servers without explicit policies are harder to reason about and may not enforce intended client, user, or scope restrictions.",
      oktaArea: "Security > API",
      confidence: "high"
    })
  ];
}

function rulePermissiveAuthorizationServerPolicies(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const wildcardRules: Array<{ server: string; policy: string; rule: string }> = [];
  const riskyGrantRules: Array<{ server: string; policy: string; rule: string; grants: string[] }> = [];
  const serversById = new Map(
    arrayOf<OktaAuthorizationServer>(snapshot.authorizationServers).map((server) => [server.id, server])
  );

  for (const policy of arrayOf<OktaAuthorizationServerPolicy>(snapshot.authorizationServerPolicies)) {
    const server = serversById.get(policy.authorizationServerId);
    for (const rule of activeRules(policy)) {
      const scopes = arrayOfStrings(
        asRecord(asRecord(rule.conditions)?.scopes)?.include
      );
      const grantTypes = arrayOfStrings(
        asRecord(asRecord(rule.conditions)?.grantTypes)?.include
      );
      if (scopes.includes("*")) {
        wildcardRules.push({
          server: server?.name ?? policy.authorizationServerId,
          policy: policy.name ?? policy.id,
          rule: rule.name ?? rule.id
        });
      }
      const risky = grantTypes.filter((grant) => RISKY_AUTH_SERVER_GRANTS.has(grant));
      if (risky.length > 0) {
        riskyGrantRules.push({
          server: server?.name ?? policy.authorizationServerId,
          policy: policy.name ?? policy.id,
          rule: rule.name ?? rule.id,
          grants: risky
        });
      }
    }
  }

  const findings: OktaFinding[] = [];
  if (wildcardRules.length > 0) {
    findings.push(
      mkFinding({
        id: "OKTA-API-002",
        title: "Authorization server policy allows wildcard scope access",
        severity: "high",
        category: "apiAccessManagement",
        affectedResources: wildcardRules.map((item) => `${item.server}:${item.rule}`),
        evidence: wildcardRules
          .slice(0, 10)
          .map((item) => `${item.server}/${item.policy}/${item.rule}: scopes=*`)
          .join(" | "),
        recommendation:
          "Replace wildcard scope grants with narrowly enumerated scopes aligned to each client and user population.",
        businessRisk:
          "Wildcard scope grants make token issuance overly permissive and weaken least-privilege design for custom APIs.",
        oktaArea: "Security > API",
        confidence: "high"
      })
    );
  }

  if (riskyGrantRules.length > 0) {
    findings.push(
      mkFinding({
        id: "OKTA-API-003",
        title: "Authorization server policy allows risky or highly privileged grant types",
        severity: "medium",
        category: "apiAccessManagement",
        affectedResources: riskyGrantRules.map((item) => `${item.server}:${item.rule}`),
        evidence: riskyGrantRules
          .slice(0, 10)
          .map((item) => `${item.server}/${item.policy}/${item.rule}: grants=${item.grants.join(", ")}`)
          .join(" | "),
        recommendation:
          "Review whether token-exchange, JWT bearer, password, or implicit grants are all necessary for each authorization server rule.",
        businessRisk:
          "Powerful grant types increase the blast radius of token issuance paths and deserve explicit scoping and review.",
        oktaArea: "Security > API",
        confidence: "high"
      })
    );
  }

  return findings;
}

function ruleRiskyAuthorizationServerTokenLifetimes(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders: Array<{ server: string; rule: string; detail: string }> = [];
  const serversById = new Map(
    arrayOf<OktaAuthorizationServer>(snapshot.authorizationServers).map((server) => [server.id, server])
  );

  for (const policy of arrayOf<OktaAuthorizationServerPolicy>(snapshot.authorizationServerPolicies)) {
    const server = serversById.get(policy.authorizationServerId);
    for (const rule of activeRules(policy)) {
      const observations = describeRiskyTokenLifetime(rule);
      if (observations.length > 0) {
        offenders.push({
          server: server?.name ?? policy.authorizationServerId,
          rule: rule.name ?? rule.id,
          detail: observations.join(", ")
        });
      }
    }
  }

  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-API-004",
      title: "Authorization server token lifetimes appear longer than a conservative default",
      severity: "medium",
      category: "apiAccessManagement",
      affectedResources: offenders.map((item) => `${item.server}:${item.rule}`),
      evidence: offenders
        .slice(0, 10)
        .map((item) => `${item.server}/${item.rule}: ${item.detail}`)
        .join(" | "),
      recommendation:
        "Review access, ID, and refresh token lifetimes on custom authorization server rules and reduce them where long-lived tokens are not strictly required.",
      businessRisk:
        "Long-lived tokens increase exposure when tokens are stolen, replayed, or left active longer than intended.",
      oktaArea: "Security > API",
      confidence: "medium"
    })
  ];
}

function rulePublishedCustomScopes(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const scopeNames = Array.from(
    new Set(
      arrayOf<OktaAuthorizationServerScope>(snapshot.authorizationServerScopes)
        .filter(
          (scope) =>
            scope.name &&
            !STANDARD_SCOPES.has(scope.name) &&
            !scope.name.startsWith("okta.") &&
            (scope.metadataPublish ?? "").toUpperCase() === "ALL_CLIENTS"
        )
        .map((scope) => scope.name as string)
    )
  );
  const claimNames = Array.from(
    new Set(
      arrayOf<OktaAuthorizationServerClaim>(snapshot.authorizationServerClaims)
        .filter(
          (claim) =>
            claim.name &&
            !STANDARD_CLAIMS.has(claim.name) &&
            claim.status === "ACTIVE" &&
            claim.valueType &&
            claim.valueType !== "SYSTEM"
        )
        .map((claim) => claim.name as string)
    )
  );
  if (scopeNames.length === 0 && claimNames.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-API-005",
      title: "Custom API scopes or claims are broadly exposed and should be reviewed",
      severity: scopeNames.length >= 5 || claimNames.length >= 5 ? "medium" : "low",
      category: "apiAccessManagement",
      affectedResources: [
        ...scopeNames,
        ...claimNames
      ],
      evidence: [
        scopeNames.length > 0
          ? `Published custom scopes=${scopeNames.slice(0, 10).join(", ")}`
          : "",
        claimNames.length > 0
          ? `Active custom claims=${claimNames.slice(0, 10).join(", ")}`
          : ""
      ]
        .filter(Boolean)
        .join(" | "),
      recommendation:
        "Review custom scopes and claims for least privilege, publication scope, and whether every client truly needs broad metadata visibility.",
      businessRisk:
        "Broadly exposed custom scopes and claims increase API surface area and make over-entitled clients easier to create by accident.",
      oktaArea: "Security > API",
      confidence: "medium"
    })
  ];
}

function ruleAdminRoleCounts(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const highPrivAssignments = arrayOf<OktaAdminRoleAssignment>(snapshot.adminRoles).filter((assignment) =>
    HIGH_PRIVILEGE_ROLE_RE.test(assignment.roleType ?? "")
  );
  if (highPrivAssignments.length <= 2) return [];

  const uniqueUserPrincipals = new Set(
    highPrivAssignments
      .filter((assignment) => assignment.principalType === "USER" && assignment.principalId)
      .map((assignment) => assignment.principalId as string)
  );

  return [
    mkFinding({
      id: "OKTA-ADM-002",
      title: "High-privilege Okta admin roles are assigned to multiple principals",
      severity: uniqueUserPrincipals.size >= 4 ? "high" : "medium",
      category: "adminAndPrivilegedAccess",
      affectedResources: highPrivAssignments.map(
        (assignment) =>
          `${assignment.roleType ?? "unknown"}:${assignment.principalType ?? "UNKNOWN"}:${assignment.principalId ?? "unknown"}`
      ),
      evidence: `High-privilege assignments=${highPrivAssignments.length}, direct_user_principals=${uniqueUserPrincipals.size}.`,
      recommendation:
        "Review whether super admin or org admin assignments can be reduced, segmented, or delegated through narrower custom role designs.",
      businessRisk:
        "A larger set of high-privilege administrators increases administrative blast radius and makes privileged access review harder to maintain.",
      oktaArea: "Security > Administrators",
      confidence: "medium"
    })
  ];
}

function ruleDirectSuperAdminAssignments(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const offenders = arrayOf<OktaAdminRoleAssignment>(snapshot.adminRoles).filter(
    (assignment) =>
      assignment.principalType === "USER" &&
      HIGH_PRIVILEGE_ROLE_RE.test(assignment.roleType ?? "")
  );

  if (offenders.length === 0) return [];

  const usersById = indexUsersById(snapshot);
  const resources = summarizePrincipalResources(
    offenders
      .map((assignment) => assignment.principalId)
      .filter((principalId): principalId is string => Boolean(principalId)),
    usersById,
    options
  );

  return [
    mkFinding({
      id: "OKTA-ADM-001",
      title: "Direct user assignments hold high-privilege Okta admin roles",
      severity: "high",
      category: "adminAndPrivilegedAccess",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: offenders
        .map(
          (assignment) =>
            `principal=${formatPrincipalIdentifier(assignment.principalId, usersById, options)}, role=${assignment.roleType ?? "unknown"}`
        )
        .slice(0, 8)
        .join(" | "),
      recommendation:
        "Review whether privileged roles can be reduced, delegated through narrower custom roles, or assigned via governed groups instead of direct user grants.",
      businessRisk:
        "Broad direct admin assignments increase blast radius and complicate access reviews, especially in large workforce tenants.",
      oktaArea: "Security > Administrators",
      confidence: "medium"
    })
  ];
}

function ruleAdminRoleVisibilityGap(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const adminRoles = arrayOf<OktaAdminRoleAssignment>(snapshot.adminRoles);
  const adminActors = adminActivityActorIds(snapshot);
  const onlyCustomRoles =
    adminRoles.length > 0 &&
    adminRoles.every((assignment) => !assignment.roleType || CUSTOM_ROLE_RE.test(assignment.roleType));
  if (adminActors.size === 0 || (!onlyCustomRoles && adminRoles.length > 0)) return [];

  const usersById = indexUsersById(snapshot);
  const resources = summarizePrincipalResources(Array.from(adminActors), usersById, options);

  return [
    mkFinding({
      id: "OKTA-ADM-003",
      title: "Admin activity was observed but the role inventory appears incomplete",
      severity: "medium",
      category: "adminAndPrivilegedAccess",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: `Admin activity actors=${adminActors.size}, collected_admin_roles=${adminRoles.length}${onlyCustomRoles ? ", role_types=custom_only" : ""}${resources.resources.length > 0 ? `, sample=${resources.resources.join(", ")}` : ""}.`,
      recommendation:
        "Validate whether admin role endpoints expose only custom-role assignments in this org shape and supplement with manual review before treating privileged access inventory as complete.",
      businessRisk:
        "If privileged role inventory is incomplete, hidden administrators can be missed during review and incident response.",
      oktaArea: "Security > Administrators",
      confidence: "medium"
    })
  ];
}

function ruleAdminMfaPosture(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const adminActors = adminActivityActorIds(snapshot);
  if (adminActors.size === 0 || !snapshot.systemLog) return [];

  const actorsWithMfaEvidence = new Set(
    snapshot.systemLog.notableEvents
      .filter(
        (event) =>
          event.actor?.id &&
          adminActors.has(event.actor.id) &&
          (MFA_EVIDENCE_EVENTS.has(event.eventType ?? "") ||
            (event.eventType === "policy.evaluate_sign_on" && event.outcome === "CHALLENGE"))
      )
      .map((event) => event.actor?.id as string)
  );

  const withoutEvidence = Array.from(adminActors).filter((actorId) => !actorsWithMfaEvidence.has(actorId));
  if (withoutEvidence.length === 0) return [];

  const usersById = indexUsersById(snapshot);
  const resources = summarizePrincipalResources(withoutEvidence, usersById, options);

  return [
    mkFinding({
      id: "OKTA-ADM-004",
      title: "Recent admin activity lacked clear MFA or protected-action evidence in the collected log window",
      severity: "medium",
      category: "adminAndPrivilegedAccess",
      affectedResources: resources.resources,
      affectedResourceCount: resources.total,
      evidence: `Admin activity actors=${adminActors.size}, actors_with_mfa_evidence=${actorsWithMfaEvidence.size}, actors_without_evidence=${withoutEvidence.length}${resources.resources.length > 0 ? `, sample=${resources.resources.join(", ")}` : ""}.`,
      recommendation:
        "Review admin-app sign-on policies and recent privileged access flows to confirm MFA or equivalent protected-action controls consistently protect administrator actions.",
      businessRisk:
        "When recent administrator activity lacks clear MFA evidence, privileged actions may rely on weaker sign-in posture than intended.",
      oktaArea: "Security > Administrators / Authentication",
      confidence: "medium"
    })
  ];
}

function ruleStaleAdminLikeUsers(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const usersById = new Map(arrayOf<OktaUserSummary>(snapshot.users).map((user) => [user.id, user]));
  const adminPrincipalIds = new Set<string>();
  for (const assignment of arrayOf<OktaAdminRoleAssignment>(snapshot.adminRoles)) {
    if (assignment.principalType === "USER" && assignment.principalId) {
      adminPrincipalIds.add(assignment.principalId);
    }
  }
  for (const actorId of adminActivityActorIds(snapshot)) {
    adminPrincipalIds.add(actorId);
  }

  const staleUsers = Array.from(adminPrincipalIds)
    .map((id) => usersById.get(id))
    .filter((user): user is OktaUserSummary => Boolean(user))
    .filter((user) => isStaleAdminUser(user));

  if (staleUsers.length === 0) return [];

  const summary = summarizeUserResources(staleUsers, options);
  const neverLoggedIn = staleUsers.filter((user) => !user.lastLogin).length;

  return [
    mkFinding({
      id: "OKTA-ADM-005",
      title: "Stale or never-used admin-like user accounts were detected",
      severity: "medium",
      category: "adminAndPrivilegedAccess",
      affectedResources: summary.resources,
      affectedResourceCount: summary.total,
      evidence: `Stale admin-like users=${summary.total}, never_logged_in=${neverLoggedIn}, stale_over_90d=${summary.total - neverLoggedIn}, sample=${summary.resources.join(", ")}, provider_summary=${summarizeProviderCounts(staleUsers)}.`,
      recommendation:
        "Review privileged users that have not logged in recently or have never completed normal admin activity, and remove access that is no longer justified.",
      businessRisk:
        "Dormant privileged identities are attractive persistence targets because they often avoid day-to-day scrutiny while retaining powerful access.",
      oktaArea: "Security > Administrators",
      confidence: "medium"
    })
  ];
}

function ruleUserLifecycleStates(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const users = arrayOf<OktaUserSummary>(snapshot.users);
  const staleLifecycleUsers = users.filter((user) => {
    const status = (user.status ?? "").toUpperCase();
    if (!["STAGED", "SUSPENDED", "DEPROVISIONED", "LOCKED_OUT"].includes(status)) return false;
    return isOlderThan(user.statusChanged ?? user.lastUpdated ?? user.created, 30);
  });
  if (staleLifecycleUsers.length === 0) return [];

  const summary = summarizeUserResources(staleLifecycleUsers, options);
  const statusSummary = summarizeUserStatuses(staleLifecycleUsers);

  return [
    mkFinding({
      id: "OKTA-USR-001",
      title: "Staged, suspended, or deprovisioned users remain in the tenant for an extended period",
      severity: staleLifecycleUsers.length >= 10 ? "medium" : "low",
      category: "usersAndLifecycle",
      affectedResources: summary.resources,
      affectedResourceCount: summary.total,
      evidence: `Extended lifecycle-state users=${summary.total}, statuses=${statusSummary}, older_than_days=30, sample=${summary.resources.join(", ")}.`,
      recommendation:
        "Review whether long-lived staged, suspended, or deprovisioned users should be cleaned up, archived, or removed from downstream assignments.",
      businessRisk:
        "Stale lifecycle states can leave abandoned identities behind and complicate reviews of who still has latent workforce access.",
      oktaArea: "Directory > People",
      confidence: "medium"
    })
  ];
}

function ruleInactiveUsers(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const users = arrayOf<OktaUserSummary>(snapshot.users);
  const inactive = users.filter((user) => isInactiveUser(user));
  if (inactive.length === 0) return [];

  const summary = summarizeUserResources(inactive, options);
  const neverLoggedIn = inactive.filter((user) => !user.lastLogin).length;
  const staleLoggedIn = inactive.length - neverLoggedIn;

  return [
    mkFinding({
      id: "OKTA-USR-002",
      title: "Active users have not logged in recently or have never logged in",
      severity: inactive.length >= 10 ? "medium" : "low",
      category: "usersAndLifecycle",
      affectedResources: summary.resources,
      affectedResourceCount: summary.total,
      evidence: `Inactive active users=${summary.total}, threshold_days=90, never_logged_in=${neverLoggedIn}, stale_logged_in=${staleLoggedIn}, providers=${summarizeProviderCounts(inactive)}, sample_count=${summary.resources.length}, sample=${summary.resources.join(", ")}.`,
      recommendation:
        "Review inactive active accounts for entitlement reduction, deactivation, or lifecycle automation so dormant identities do not accumulate.",
      businessRisk:
        "Dormant active workforce accounts can retain access long after their practical need has expired.",
      oktaArea: "Directory > People",
      confidence: "medium"
    })
  ];
}

function ruleUngroupedUsers(
  snapshot: OktaOrgSnapshot,
  options: RuleOptions = {}
): OktaFinding[] {
  const users = arrayOf<OktaUserSummary>(snapshot.users).filter(
    (user) => (user.status ?? "").toUpperCase() === "ACTIVE" && user.hasGroupMembership === false
  );
  if (users.length === 0) return [];

  const summary = summarizeUserResources(users, options);

  return [
    mkFinding({
      id: "OKTA-USR-003",
      title: "Active users without any group membership were detected",
      severity: users.length >= 5 ? "medium" : "low",
      category: "usersAndLifecycle",
      affectedResources: summary.resources,
      affectedResourceCount: summary.total,
      evidence: `Active ungrouped users=${summary.total}, providers=${summarizeProviderCounts(users)}, sample=${summary.resources.join(", ")}.`,
      recommendation:
        "Review whether these users should inherit access through governed groups rather than standing alone with direct or ad hoc assignments.",
      businessRisk:
        "Users outside group-based governance are easier to miss during access review and harder to manage consistently across lifecycle events.",
      oktaArea: "Directory > People / Groups",
      confidence: "medium"
    })
  ];
}

function ruleUnusedNetworkZones(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const zones = arrayOf<OktaNetworkZone>(snapshot.networkZones).filter((zone) => isActiveStatus(zone.status));
  if (zones.length === 0) return [];

  const activeRules = [
    ...allActiveRules(arrayOf<OktaPolicy>(snapshot.policies?.globalSessionPolicies)),
    ...allActiveRules(arrayOf<OktaPolicy>(snapshot.policies?.appSignInPolicies))
  ];
  const usedZoneIds = new Set<string>();
  for (const zone of zones) {
    if (activeRules.some((rule) => ruleMentionsZone(rule, zone))) {
      usedZoneIds.add(zone.id);
    }
  }

  const unused = zones.filter((zone) => !usedZoneIds.has(zone.id));
  if (unused.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-NET-002",
      title: "Configured network zones were not referenced by collected sign-on policies",
      severity: "low",
      category: "networkAndDevicePosture",
      affectedResources: unused.map((zone) => zone.name ?? zone.id),
      evidence: unused
        .map((zone) => `${zone.name ?? zone.id}: type=${zone.type ?? "unknown"}, usage=${zone.usage ?? "unknown"}`)
        .join(" | "),
      recommendation:
        "Review whether configured zones are still needed, and if they are, ensure sign-on or app policies actually reference them intentionally.",
      businessRisk:
        "Unreferenced network zones add configuration noise and can create a false sense that network-based controls are actively enforcing policy.",
      oktaArea: "Security > Network",
      confidence: "medium"
    })
  ];
}

function ruleMissingTrustedOrigins(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const trustedOrigins = arrayOf<OktaTrustedOrigin>(snapshot.trustedOrigins);
  if (trustedOrigins.length > 0) return [];

  const browserApps = activeApps(snapshot).filter((app) => {
    const uris = app.settings?.oauthClient?.redirect_uris ?? [];
    return uris.some((uri) => uri.startsWith("https://") && !uri.includes("localhost"));
  });
  if (browserApps.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-NET-003",
      title: "Browser-facing apps exist but no Trusted Origins were collected",
      severity: "low",
      category: "networkAndDevicePosture",
      affectedResources: browserApps.map(formatAppName),
      evidence: `Trusted origins=0, browser_apps=${browserApps
        .slice(0, 8)
        .map((app) => formatAppName(app))
        .join(", ")}.`,
      recommendation:
        "Confirm whether Trusted Origins are required for your browser apps, CORS flows, or redirect/logout behavior and configure them explicitly where needed.",
      businessRisk:
        "Missing or implicit browser-origin configuration can leave app teams relying on defaults that are hard to validate during change review.",
      oktaArea: "Security > API > Trusted Origins",
      confidence: "medium"
    })
  ];
}

function ruleTrustedOriginTransport(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = arrayOf<OktaTrustedOrigin>(snapshot.trustedOrigins).filter(
    (origin) =>
      typeof origin.origin === "string" &&
      origin.origin.startsWith("http://") &&
      !origin.origin.startsWith("http://localhost")
  );
  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-NET-001",
      title: "Trusted Origin uses insecure HTTP transport",
      severity: "high",
      category: "networkAndDevicePosture",
      affectedResources: offenders.map((origin) => origin.name ?? origin.id),
      evidence: offenders
        .map((origin) => `${origin.name ?? origin.id}: origin=${origin.origin ?? "unknown"}`)
        .join(" | "),
      recommendation:
        "Restrict Trusted Origins to HTTPS endpoints outside local development and remove legacy HTTP entries.",
      businessRisk:
        "Insecure origins weaken browser-side trust boundaries and can expose sign-in or token exchange flows to interception.",
      oktaArea: "Security > API > Trusted Origins",
      confidence: "high"
    })
  ];
}

function ruleHookTransport(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const offenders = [
    ...arrayOf<OktaEventHook>(snapshot.eventHooks).filter((hook) => isInsecureHookUri(hook)),
    ...arrayOf<OktaInlineHook>(snapshot.inlineHooks).filter((hook) => isInsecureHookUri(hook))
  ];
  if (offenders.length === 0) return [];

  return [
    mkFinding({
      id: "OKTA-HOOK-001",
      title: "Hook destination uses insecure transport",
      severity: "high",
      category: "federationAndExtensibility",
      affectedResources: offenders.map((hook) => hook.name ?? hook.id),
      evidence: offenders
        .map((hook) => `${hook.name ?? hook.id}: uri=${hook.channel?.uri ?? "unknown"}`)
        .join(" | "),
      recommendation:
        "Move hook receivers to HTTPS endpoints and rotate any credentials previously exposed to insecure transport.",
      businessRisk:
        "Unencrypted hook delivery can leak lifecycle or identity events and any attached credentials to network intermediaries.",
      oktaArea: "Workflow / Hooks",
      confidence: "high"
    })
  ];
}

function ruleNoLogStreams(snapshot: OktaOrgSnapshot): OktaFinding[] {
  const streams = arrayOf<OktaLogStream>(snapshot.logStreams);
  const active = streams.filter((stream) => isActiveStatus(stream.status));
  if (active.length > 0) return [];

  return [
    mkFinding({
      id: "OKTA-MON-001",
      title: "No active Okta log stream",
      severity: "high",
      category: "monitoringAndLogs",
      affectedResources: ["okta_log_stream"],
      evidence: `Collected log streams=${streams.length}, active_streams=0.`,
      recommendation:
        "Configure at least one active log stream to a SIEM or log analytics destination for retained security visibility.",
      businessRisk:
        "Without externalized logs, investigations depend on limited in-product retention and make forensic reconstruction harder.",
      oktaArea: "Reports / Log Streaming",
      confidence: "high"
    })
  ];
}

function ruleCoverage(snapshot: OktaOrgSnapshot): OktaFinding[] {
  if (!snapshot.metadata.partial) return [];
  const degradedCollectors = snapshot.metadata.failedCollectors ?? [];
  const partialCollectors = degradedCollectors.filter((collector) => collector.status === "partial");
  const unavailableCollectors = degradedCollectors.filter(
    (collector) => collector.status === "failed" || collector.status === "skipped"
  );
  const evidence: string[] = [];

  if (unavailableCollectors.length > 0) {
    evidence.push(
      `Unavailable collectors: ${unavailableCollectors
        .map((collector) => `${collector.collector} (${collector.status})`)
        .join(", ")}.`
    );
  }

  if (partialCollectors.length > 0) {
    evidence.push(
      `Partial collectors: ${partialCollectors
        .map((collector) => `${collector.collector} (${collector.status})`)
        .join(", ")}.`
    );
  }

  if ((snapshot.metadata.missingScopes ?? []).length > 0) {
    evidence.push(`Missing scopes: ${snapshot.metadata.missingScopes.join(", ")}.`);
  }

  let recommendation =
    "Review the degraded collectors and validate the affected categories before treating the report as complete posture coverage.";
  if ((snapshot.metadata.missingScopes ?? []).length > 0) {
    recommendation =
      "Grant the missing read scopes and rerun with the expected read-only access before treating the report as complete posture coverage.";
  } else if (unavailableCollectors.length > 0 && partialCollectors.length === 0) {
    recommendation =
      "Investigate the failed or skipped collectors and rerun with the expected read-only access before treating the report as complete posture coverage.";
  } else if (partialCollectors.length > 0 && unavailableCollectors.length === 0) {
    recommendation =
      "Review the listed partial collectors and validate the affected categories manually before treating the report as complete posture coverage.";
  }

  return [
    mkFinding({
      id: "OKTA-COV-001",
      title: "Scan was partial and some Okta areas were not fully assessed",
      severity: "info",
      category: "monitoringAndLogs",
      scoreImpact: 0,
      affectedResources: ["collection_status"],
      evidence: evidence.join(" ") || "Collector degradation was detected but not fully described.",
      recommendation,
      businessRisk:
        "Uncollected areas cannot be interpreted as safe; missing evidence reduces confidence in the final score.",
      confidence: "high"
    })
  ];
}

function activeApps(snapshot: OktaOrgSnapshot): OktaAppSummary[] {
  return arrayOf<OktaAppSummary>(snapshot.apps).filter((app) => isActiveStatus(app.status));
}

function activePolicies(policies: OktaPolicy[]): OktaPolicy[] {
  return policies.filter((policy) => isActiveStatus(policy.status));
}

function activeRules(policy: OktaPolicy | OktaAuthorizationServerPolicy): OktaPolicyRule[] {
  return arrayOf<OktaPolicyRule>(policy.rules).filter((rule) => isActiveStatus(rule.status));
}

function allActiveRules(policies: OktaPolicy[]): OktaPolicyRule[] {
  return policies.flatMap((policy) => activeRules(policy));
}

function ruleAllowsAccess(rule: OktaPolicyRule): boolean {
  const actions = asRecord(rule.actions);
  const appSignOn = asRecord(actions?.appSignOn);
  if (asString(appSignOn?.access)?.toUpperCase() === "DENY") return false;
  const signOn = asRecord(actions?.signon);
  if (asString(signOn?.access)?.toUpperCase() === "DENY") return false;
  return true;
}

function ruleHasStrongVerification(rule: OktaPolicyRule): boolean {
  const payload = JSON.stringify(rule.actions ?? {});
  return /(2FA|MFA|ASSURANCE|webauthn|okta_verify|signed_nonce|requireFactor|reauthenticateIn)/i.test(
    payload
  );
}

function extractNetworkScope(rule: OktaPolicyRule): string {
  const network = asRecord(asRecord(rule.conditions)?.network);
  return asString(network?.connection) ?? "unspecified";
}

function extractVerificationSummary(rule: OktaPolicyRule): string {
  const actions = JSON.stringify(rule.actions ?? {});
  if (!actions || actions === "{}") return "none";
  if (/2FA|MFA/i.test(actions)) return "mfa";
  if (/ASSURANCE/i.test(actions)) return "assurance";
  if (/DENY/i.test(actions)) return "deny";
  return "weak-or-unspecified";
}

function describeWeakPasswordPolicy(policy: OktaPolicy): string | undefined {
  const settings = asRecord(policy.settings);
  const password = asRecord(settings?.password);
  const complexity = asRecord(password?.complexity);
  const history = asRecord(password?.history);
  const minLength = asNumber(complexity?.minLength);
  const historyCount = asNumber(history?.count);
  const reasons: string[] = [];

  if (minLength !== undefined && minLength < 12) {
    reasons.push(`min_length=${minLength}`);
  }
  if (historyCount !== undefined && historyCount < 12) {
    reasons.push(`history_count=${historyCount}`);
  }
  if (!password && !complexity) {
    reasons.push("password_complexity_not_visible");
  }

  const rules = activeRules(policy);
  if (
    rules.some((rule) => {
      const resetMethods = arrayOfStrings(
        asRecord(asRecord(asRecord(asRecord(rule.actions)?.selfServicePasswordReset)?.requirement)?.primary)?.methods
      );
      return resetMethods.length === 1 && resetMethods[0] === "email";
    })
  ) {
    reasons.push("self_service_reset_email_only");
  }

  return reasons.length > 0 ? reasons.join(", ") : undefined;
}

function describeWeakEnrollmentPolicy(policy: OktaPolicy): string | undefined {
  const settings = asRecord(policy.settings);
  const factors = asRecord(settings?.factors);
  if (!factors) return "factor_settings_not_visible";

  const enabledStrongFactors: string[] = [];
  const requiredStrongFactors: string[] = [];
  const weakOptionalFactors: string[] = [];

  for (const [factorKey, factorValue] of Object.entries(factors)) {
    const factor = asRecord(factorValue);
    const enroll = asRecord(factor?.enroll);
    const self = asString(enroll?.self)?.toUpperCase();
    if (!self || self === "DISABLED" || self === "INACTIVE") continue;

    if (STRONG_AUTHENTICATOR_KEYS.has(factorKey.toLowerCase())) {
      enabledStrongFactors.push(factorKey);
      if (self === "REQUIRED") requiredStrongFactors.push(factorKey);
    } else if (WEAK_FACTOR_KEYS.has(factorKey.toLowerCase()) && self === "OPTIONAL") {
      weakOptionalFactors.push(factorKey);
    }
  }

  if (enabledStrongFactors.length === 0) {
    return "no_phishing_resistant_factor_enabled";
  }
  if (requiredStrongFactors.length === 0 && weakOptionalFactors.length > 0) {
    return `strong_factors_optional=${enabledStrongFactors.join(", ")}, weak_optional_factors=${weakOptionalFactors.join(", ")}`;
  }
  return undefined;
}

function describeRiskyTokenLifetime(rule: OktaPolicyRule): string[] {
  const token = asRecord(asRecord(rule.actions)?.token);
  if (!token) return [];

  const observations: string[] = [];
  collectLifetimeObservations(token, [], observations);
  return observations;
}

function collectLifetimeObservations(
  input: Record<string, unknown>,
  path: string[],
  observations: string[]
): void {
  for (const [key, value] of Object.entries(input)) {
    const nextPath = [...path, key];
    if (typeof value === "number" && /lifetime|ttl|expiration/i.test(key)) {
      const normalizedPath = nextPath.join(".");
      if (value > 60 && /access|id/i.test(normalizedPath)) {
        observations.push(`${normalizedPath}=${value}`);
      } else if (value > 1440 && /refresh/i.test(normalizedPath)) {
        observations.push(`${normalizedPath}=${value}`);
      }
    } else if (typeof value === "string" && /PT/i.test(value) && /lifetime|ttl|expiration/i.test(key)) {
      const minutes = parseIsoDurationMinutes(value);
      if (minutes !== undefined) {
        const normalizedPath = nextPath.join(".");
        if (minutes > 60 && /access|id/i.test(normalizedPath)) {
          observations.push(`${normalizedPath}=${value}`);
        } else if (minutes > 1440 && /refresh/i.test(normalizedPath)) {
          observations.push(`${normalizedPath}=${value}`);
        }
      }
    } else if (isRecord(value)) {
      collectLifetimeObservations(value, nextPath, observations);
    }
  }
}

function adminActivityActorIds(snapshot: OktaOrgSnapshot): Set<string> {
  const actors = new Set<string>();
  for (const event of snapshot.systemLog?.notableEvents ?? []) {
    if (event.actor?.id && ADMIN_ACTIVITY_EVENTS.has(event.eventType ?? "")) {
      actors.add(event.actor.id);
    }
  }
  return actors;
}

function isStaleAdminUser(user: OktaUserSummary): boolean {
  if ((user.status ?? "").toUpperCase() !== "ACTIVE") return false;
  if (!isOlderThan(user.created, 30)) return false;
  return !user.lastLogin || isOlderThan(user.lastLogin, 90);
}

function isInactiveUser(user: OktaUserSummary): boolean {
  if ((user.status ?? "").toUpperCase() !== "ACTIVE") return false;
  if (!isOlderThan(user.created, 30)) return false;
  return !user.lastLogin || isOlderThan(user.lastLogin, 90);
}

function ruleMentionsZone(rule: OktaPolicyRule, zone: OktaNetworkZone): boolean {
  const payload = JSON.stringify(rule.conditions ?? {});
  return payload.includes(zone.id) || payload.includes(zone.name ?? "__no_zone_name__");
}

function isActiveStatus(status: string | undefined): boolean {
  if (!status) return true;
  return !["inactive", "disabled"].includes(status.toLowerCase());
}

function isInsecureHookUri(hook: OktaEventHook | OktaInlineHook): boolean {
  const uri = hook.channel?.uri;
  return typeof uri === "string" && uri.startsWith("http://") && !uri.startsWith("http://localhost");
}

function formatAppName(app: OktaAppSummary): string {
  return app.label ?? app.name ?? app.id;
}

function isUserFacingAssignedApp(app: OktaAppSummary): boolean {
  const label = `${app.label ?? ""} ${app.name ?? ""}`.toLowerCase();
  if (label.startsWith("okta ") || label.includes("admin console") || label.includes("dashboard")) {
    return false;
  }

  const oauth = app.settings?.oauthClient;
  if (oauth?.application_type === "service") return false;
  if ((oauth?.redirect_uris ?? []).length > 0) return true;
  return ["OPENID_CONNECT", "SAML_2_0", "SWA", "BROWSER_PLUGIN"].includes(app.signOnMode ?? "");
}

function isOlderThan(dateValue: string | undefined, days: number): boolean {
  if (!dateValue) return false;
  const parsed = Date.parse(dateValue);
  if (Number.isNaN(parsed)) return false;
  return Date.now() - parsed > days * 24 * 60 * 60 * 1000;
}

function parseIsoDurationMinutes(value: string): number | undefined {
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 60 + minutes + Math.floor(seconds / 60);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function arrayOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function classifyAppForAssignmentRisk(
  app: OktaAppSummary
): "likely-baseline app" | "admin/privileged app" | "business app" | "unknown" {
  const label = `${app.label ?? ""} ${app.name ?? ""}`.toLowerCase();
  if (
    /okta dashboard|okta browser plugin|end user settings|account settings|okta end user|launcher|plugin/.test(
      label
    )
  ) {
    return "likely-baseline app";
  }
  if (
    /admin console|administrator|access review|certification review|privileged|security/.test(label)
  ) {
    return "admin/privileged app";
  }
  if (isUserFacingAssignedApp(app)) {
    return "business app";
  }
  return "unknown";
}

function summarizeAppResources(apps: OktaAppSummary[]): { resources: string[]; total: number } {
  const byId = new Map<string, OktaAppSummary>();
  for (const app of apps) {
    byId.set(app.id, app);
  }

  const byLabel = new Map<string, OktaAppSummary[]>();
  for (const app of byId.values()) {
    const label = formatAppName(app);
    const bucket = byLabel.get(label) ?? [];
    bucket.push(app);
    byLabel.set(label, bucket);
  }

  const resources = Array.from(byLabel.entries())
    .map(([label, bucket]) => (bucket.length === 1 ? label : `${label} (${bucket.length} apps)`))
    .slice(0, 12);

  return { resources, total: byId.size };
}

function indexUsersById(snapshot: OktaOrgSnapshot): Map<string, OktaUserSummary> {
  return new Map(arrayOf<OktaUserSummary>(snapshot.users).map((user) => [user.id, user]));
}

function summarizePrincipalResources(
  principalIds: string[],
  usersById: Map<string, OktaUserSummary>,
  options: RuleOptions
): { resources: string[]; total: number } {
  const uniqueIds = Array.from(new Set(principalIds));
  return {
    resources: uniqueIds
      .slice(0, 8)
      .map((principalId) => formatPrincipalIdentifier(principalId, usersById, options)),
    total: uniqueIds.length
  };
}

function summarizeUserResources(
  users: OktaUserSummary[],
  options: RuleOptions
): { resources: string[]; total: number } {
  const byId = new Map<string, OktaUserSummary>();
  for (const user of users) {
    byId.set(user.id, user);
  }
  const uniqueUsers = Array.from(byId.values());
  return {
    resources: uniqueUsers.slice(0, 8).map((user) => formatUserIdentifier(user, options)),
    total: uniqueUsers.length
  };
}

function formatPrincipalIdentifier(
  principalId: string | undefined,
  usersById: Map<string, OktaUserSummary>,
  options: RuleOptions
): string {
  if (!principalId) return "unknown";
  const user = usersById.get(principalId);
  if (user) return formatUserIdentifier(user, options);
  return options.includeIdentifiers ? principalId : maskIdentifier(principalId);
}

function formatUserIdentifier(user: OktaUserSummary, options: RuleOptions): string {
  const identifier = user.profile.email ?? user.profile.login ?? user.id;
  return options.includeIdentifiers ? identifier : maskIdentifier(identifier);
}

function maskIdentifier(identifier: string): string {
  if (identifier.includes("@")) {
    const [localPart, domain] = identifier.split("@");
    if (!domain) return `${identifier.charAt(0)}...`;
    return `${maskEmailLocalPart(localPart)}@${domain}`;
  }
  if (identifier.length <= 6) return `${identifier.charAt(0)}...`;
  return `${identifier.slice(0, 4)}...${identifier.slice(-3)}`;
}

function maskEmailLocalPart(localPart: string): string {
  const plusParts = localPart.split("+");
  return plusParts
    .map((part) =>
      part
        .split(".")
        .map((segment) => `${segment.charAt(0) || "*"}...`)
        .join(".")
    )
    .join("+");
}

function summarizeProviderCounts(users: OktaUserSummary[]): string {
  const counts = new Map<string, number>();
  for (const user of users) {
    const key = user.credentialProvider ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([provider, count]) => `${provider}=${count}`)
    .join(", ");
}

function summarizeUserStatuses(users: OktaUserSummary[]): string {
  const counts = new Map<string, number>();
  for (const user of users) {
    const key = user.status ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");
}

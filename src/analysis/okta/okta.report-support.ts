import {
  OktaOrgSnapshot
} from "../../connectors/okta/okta.types";
import {
  OktaFinding,
  OktaPositiveSignal,
  OktaRemediationBucket,
  OktaRemediationPlan
} from "../../reporting/markdown/okta-report.types";

interface FindingEnrichment {
  classification: OktaFinding["classification"];
  confidenceReason: string;
  apiHint?: string;
  terraformHint?: string;
  validationSteps?: string[];
  falsePositiveNotes?: string[];
  remediation?: OktaFinding["remediation"];
}

const FINDING_ENRICHMENTS: Partial<Record<string, FindingEnrichment>> = {
  "OKTA-API-002": {
    classification: "confirmed-risk",
    confidenceReason:
      "The rule inspects a collected authorization-server policy condition and confirms a literal wildcard scope grant.",
    apiHint: "Okta API: `GET /api/v1/authorizationServers/{authServerId}/policies/{policyId}/rules`",
    terraformHint:
      "Terraform: review `okta_auth_server_policy_rule` scope conditions and replace `*` with explicit scopes.",
    validationSteps: [
      "Open Security -> API -> Authorization Servers.",
      "Review the affected access policy rule and confirm the `scopes.include` condition is wildcarded.",
      "Replace wildcard scope access with explicit scopes mapped to the client and user population.",
      "Test token issuance for the affected client after narrowing scopes.",
      "Re-run `zelto-pulse scan okta`."
    ],
    remediation: {
      bucketId: "immediate",
      action: "Review and replace wildcard authorization-server scope grants with explicit scopes.",
      expectedOutcome: "Custom API clients receive only the scopes they explicitly require.",
      effort: "medium",
      validationStep: "Confirm the affected access policy rule no longer includes `*` in scope conditions, then re-run the scan."
    }
  },
  "OKTA-MON-001": {
    classification: "confirmed-risk",
    confidenceReason:
      "The connector successfully queried log streams and found no active external destination configured.",
    apiHint: "Okta API: `GET /api/v1/logStreams`",
    terraformHint: "Terraform: configure an `okta_log_stream` resource for your SIEM destination.",
    validationSteps: [
      "Open Reports -> Log Streaming.",
      "Confirm whether any log stream is active for the org.",
      "Create or re-enable a stream to your SIEM or analytics destination.",
      "Verify delivery health on the destination side.",
      "Re-run `zelto-pulse scan okta`."
    ],
    remediation: {
      bucketId: "immediate",
      action: "Configure an active Okta log stream to a monitored destination.",
      expectedOutcome: "Security events leave the Okta tenant and can be retained, correlated, and alerted on externally.",
      effort: "medium",
      validationStep: "Verify the log stream reports active/healthy in Okta and appears in a fresh scan."
    }
  },
  "OKTA-ADM-003": {
    classification: "requires-validation",
    confidenceReason:
      "Recent admin-app or protected-action events were collected, but the role inventory did not return matching admin assignments.",
    apiHint: "Okta APIs: `/api/v1/iam/assignees/*` and `/api/v1/logs`",
    validationSteps: [
      "Open Security -> Administrators and review both standard and custom admin assignments.",
      "Confirm whether the tenant exposes only a subset of role assignments through the collected endpoints.",
      "Cross-check recent admin-app access from the System Log against the administrator inventory.",
      "Document any expected custom-role-only patterns for future scans.",
      "Re-run `zelto-pulse scan okta` after validating the inventory."
    ],
    falsePositiveNotes: [
      "Custom role deployments and tenant-specific IAM endpoint shapes can make the collected role inventory incomplete even when no privileged issue exists."
    ],
    remediation: {
      bucketId: "immediate",
      action: "Validate the admin role inventory when admin activity exists but assignments are missing or incomplete.",
      expectedOutcome: "Privileged access reviews are based on a verified administrator inventory rather than a partial API view.",
      effort: "low",
      validationStep: "Cross-check recent admin actors against the Okta administrator console and confirm expected assignments."
    }
  },
  "OKTA-APP-003": {
    classification: "requires-validation",
    confidenceReason:
      "App assignment topology is sampled safely, so the analyzer can confirm direct assignments exist but not model every assignment edge exhaustively.",
    apiHint: "Okta APIs: `/api/v1/apps/{appId}/users` and `/api/v1/apps/{appId}/groups`",
    validationSteps: [
      "Open Applications -> Applications and review assignments for the named app.",
      "Confirm whether direct user assignments are intentional or should move to governed groups.",
      "Check whether the app is break-glass, test-only, or truly workforce-facing.",
      "Move production workforce access to group-based assignment where possible.",
      "Re-run `zelto-pulse scan okta`."
    ],
    falsePositiveNotes: [
      "Direct assignments may be acceptable for break-glass, test, admin, or small-user-population apps. For production workforce governance, group-based assignments are preferred for scalable reviews and JML automation."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review direct app-user assignments and migrate durable workforce access to groups where appropriate.",
      expectedOutcome: "Application access becomes easier to review and maintain through group-based governance.",
      effort: "medium",
      validationStep: "Confirm the targeted app primarily uses group assignments and the scan no longer reports direct-assignment drift."
    }
  },
  "OKTA-APP-004": {
    classification: "requires-validation",
    confidenceReason:
      "Broad assignment detection is based on sampled user/group assignments and app classification heuristics, so review is required before treating it as misconfiguration.",
    validationSteps: [
      "Open the affected application's Assignments tab.",
      "Check whether the broad assignment is a baseline, admin, or business access pattern.",
      "Confirm whether broad assignment is required by business design or only historical convenience.",
      "Narrow group population where over-assignment is not intentional.",
      "Re-run `zelto-pulse scan okta`."
    ],
    falsePositiveNotes: [
      "Broad assignment may be intentional for baseline end-user apps. Privileged or sensitive business apps deserve a higher bar than baseline workforce utilities."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review apps that appear broadly assigned and confirm whether the population is intentionally scoped.",
      expectedOutcome: "Sensitive or privileged apps are limited to the intended user groups instead of broad standing assignment.",
      effort: "medium",
      validationStep: "Verify the affected app no longer relies on broad sampled direct/group assignment unless explicitly documented."
    }
  },
  "OKTA-API-003": {
    classification: "requires-validation",
    confidenceReason:
      "Risky grant types are confirmed in policy data, but their true risk depends on the specific client architecture and compensating controls.",
    validationSteps: [
      "Open Security -> API -> Authorization Servers and review the listed access policy rules.",
      "Confirm each token-exchange, JWT bearer, password, or implicit grant is required by a documented client flow.",
      "Remove unsupported or legacy grant types from each rule.",
      "Retest affected clients.",
      "Re-run `zelto-pulse scan okta`."
    ],
    falsePositiveNotes: [
      "Token exchange and JWT bearer grants can be valid in brokered service architectures, but they should be explicitly justified and tightly scoped."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review authorization-server grant types and remove any that are not explicitly required.",
      expectedOutcome: "Custom API token issuance paths are reduced to the minimum supported grant surface.",
      effort: "medium",
      validationStep: "Confirm only documented grant types remain on the affected authorization-server rules."
    }
  },
  "OKTA-API-004": {
    classification: "requires-validation",
    confidenceReason:
      "The analyzer confirms the configured lifetimes, but whether they are excessive depends on client class, refresh strategy, and compensating controls.",
    validationSteps: [
      "Open Security -> API -> Authorization Servers and review token settings on the affected policy rules.",
      "Compare token lifetimes to the client type and business need.",
      "Reduce access or refresh lifetimes where long retention is not required.",
      "Retest any affected refresh flows.",
      "Re-run `zelto-pulse scan okta`."
    ],
    falsePositiveNotes: [
      "Longer refresh lifetimes may be intentional for low-friction workforce experiences, but they should still be bounded and justified."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review authorization-server token lifetimes and shorten them where long-lived tokens are not justified.",
      expectedOutcome: "Stolen or stale tokens retain value for a shorter window and API session risk is reduced.",
      effort: "medium",
      validationStep: "Confirm revised token lifetime settings on the affected rules and retest token issuance."
    }
  },
  "OKTA-POL-004": {
    classification: "confirmed-risk",
    confidenceReason:
      "Password policy settings were collected directly and can be evaluated against explicit complexity and recovery conditions.",
    terraformHint: "Terraform: review `okta_policy_password` settings for complexity, history, and recovery behavior.",
    validationSteps: [
      "Open Security -> Authentication -> Password.",
      "Review minimum length, history, and self-service recovery methods for the affected policy.",
      "Increase complexity and reduce weak single-method recovery if required.",
      "Test password reset behavior for impacted users.",
      "Re-run `zelto-pulse scan okta`."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review password policy strength and self-service recovery methods.",
      expectedOutcome: "Password policy aligns more closely to a modern workforce baseline and weak recovery paths are reduced.",
      effort: "medium",
      validationStep: "Confirm the affected password policy reflects the intended complexity and reset requirements."
    }
  },
  "OKTA-POL-005": {
    classification: "confirmed-risk",
    confidenceReason:
      "Authenticator enrollment policy settings were collected directly and show whether strong factors are required or only optional.",
    terraformHint: "Terraform: review `okta_policy_mfa` / enrollment policy settings for factor requirements.",
    validationSteps: [
      "Open Security -> Authenticators or MFA Enrollment policies.",
      "Review whether a phishing-resistant or strong factor is required for relevant users.",
      "Adjust enrollment requirements to ensure strong factors are enrolled intentionally.",
      "Validate end-user enrollment flows.",
      "Re-run `zelto-pulse scan okta`."
    ],
    remediation: {
      bucketId: "shortTerm",
      action: "Review authenticator enrollment policy strength and require strong factors where appropriate.",
      expectedOutcome: "Users consistently enroll stronger authenticators rather than relying only on optional weaker factors.",
      effort: "medium",
      validationStep: "Confirm the enrollment policy requires at least one strong authenticator for the intended workforce population."
    }
  },
  "OKTA-USR-002": {
    classification: "requires-validation",
    confidenceReason:
      "Inactive-user posture is derived from bounded user summaries and recent activity timestamps, so organizational context is required before treating it as excessive risk.",
    validationSteps: [
      "Open Directory -> People and review the affected active accounts.",
      "Check whether never-login or stale users belong to demos, migrations, staged rollouts, or real workforce populations.",
      "Deactivate or clean up stale active users that are no longer needed.",
      "Confirm lifecycle automation or downstream source behavior where relevant.",
      "Re-run `zelto-pulse scan okta`."
    ],
    falsePositiveNotes: [
      "In demo, migration, or staged rollout orgs, never-login users may be expected. In production, active never-login or stale users should be reviewed for lifecycle hygiene."
    ],
    remediation: {
      bucketId: "later",
      action: "Review active users that have never logged in or have become stale.",
      expectedOutcome: "Dormant identities are either explained, deactivated, or removed from the active workforce population.",
      effort: "medium",
      validationStep: "Confirm the affected active-user population is reduced or documented after lifecycle review."
    }
  },
  "OKTA-APP-005": {
    classification: "advisory",
    confidenceReason:
      "Assignment sampling indicates these apps may be inactive or unassigned, but final cleanup decisions depend on ownership and product context.",
    remediation: {
      bucketId: "later",
      action: "Review inactive or apparently unassigned apps for cleanup or documentation.",
      expectedOutcome: "Stale app integrations are retired or clearly documented as intentional placeholders.",
      effort: "low",
      validationStep: "Confirm each listed app has an owner and a documented reason to remain active if it stays."
    }
  },
  "OKTA-NET-002": {
    classification: "advisory",
    confidenceReason:
      "Zone usage is inferred from collected policy references and may not capture every legitimate network-control pattern in the tenant.",
    remediation: {
      bucketId: "later",
      action: "Review configured network zones that were not referenced by collected sign-on policies.",
      expectedOutcome: "Unused network zones are either removed or intentionally referenced by policy where needed.",
      effort: "low",
      validationStep: "Confirm listed zones are either retired or tied to a documented enforcement path."
    }
  },
  "OKTA-NET-003": {
    classification: "advisory",
    confidenceReason:
      "Trusted Origin need depends on browser flow design, so absence alone is a hygiene question unless the application architecture clearly requires it.",
    remediation: {
      bucketId: "later",
      action: "Review Trusted Origins posture for browser-facing apps and configure only what the app architecture requires.",
      expectedOutcome: "Browser-origin configuration is explicit, minimal, and aligned to real app behavior.",
      effort: "low",
      validationStep: "Confirm any required CORS or redirect origins are configured intentionally and unnecessary origins remain absent."
    }
  },
  "OKTA-API-005": {
    classification: "advisory",
    confidenceReason:
      "Published custom scopes or claims were observed, but exposure alone does not prove over-permission without client and API context.",
    remediation: {
      bucketId: "later",
      action: "Review published custom scopes and claims for least privilege and client necessity.",
      expectedOutcome: "Only justified custom scopes and claims remain broadly exposed to clients.",
      effort: "low",
      validationStep: "Confirm each listed custom scope or claim has a documented consumer and publication need."
    }
  }
};

export function enrichOktaFindings(findings: OktaFinding[]): OktaFinding[] {
  return findings.map((finding) => {
    const enrichment = FINDING_ENRICHMENTS[finding.id];
    return {
      ...finding,
      classification: enrichment?.classification ?? finding.classification,
      confidence: finding.confidence ?? "medium",
      confidenceReason: enrichment?.confidenceReason ?? finding.confidenceReason ?? defaultConfidenceReason(finding),
      apiHint: enrichment?.apiHint ?? finding.apiHint,
      terraformHint: enrichment?.terraformHint ?? finding.terraformHint,
      validationSteps: enrichment?.validationSteps ?? finding.validationSteps,
      falsePositiveNotes: enrichment?.falsePositiveNotes ?? finding.falsePositiveNotes,
      remediation: enrichment?.remediation ?? finding.remediation
    };
  });
}

export function buildOktaRemediationPlan(findings: OktaFinding[]): OktaRemediationPlan {
  const bucketsById = new Map<OktaRemediationBucket["id"], OktaRemediationBucket>([
    ["immediate", { id: "immediate", name: "Immediate", window: "0-7 days", items: [] }],
    ["shortTerm", { id: "shortTerm", name: "Short Term", window: "2-4 weeks", items: [] }],
    ["later", { id: "later", name: "Later", window: "1-2 months", items: [] }]
  ]);

  const sortableFindings = [...findings].filter((finding) => finding.remediation);
  sortableFindings.sort((left, right) => severityRank(right.severity) - severityRank(left.severity));

  sortableFindings.forEach((finding, index) => {
    const remediation = finding.remediation;
    if (!remediation) return;
    bucketsById.get(remediation.bucketId)?.items.push({
      priority: index + 1,
      findingId: finding.id,
      action: remediation.action,
      expectedOutcome: remediation.expectedOutcome,
      effort: remediation.effort,
      severity: finding.severity,
      validationStep: remediation.validationStep
    });
  });

  return {
    buckets: (["immediate", "shortTerm", "later"] as const).map(
      (id) => bucketsById.get(id) as OktaRemediationBucket
    )
  };
}

export function buildOktaPositiveSignals(
  snapshot: OktaOrgSnapshot,
  findings: OktaFinding[]
): OktaPositiveSignal[] {
  const signals: OktaPositiveSignal[] = [];
  const coverage = snapshot.coverage ?? [];
  const successfulCollectors = new Set(
    coverage.filter((item) => item.status === "success").map((item) => item.collector)
  );

  if (successfulCollectors.has("policies")) {
    signals.push({
      title: "Policies collected successfully",
      detail: `Collected ${snapshot.policies?.all.length ?? 0} policy object(s) across the core MVP policy types.`
    });
  }
  if (successfulCollectors.has("authenticators")) {
    signals.push({
      title: "Authenticators collected successfully",
      detail: `Collected ${snapshot.authenticators?.length ?? 0} authenticator record(s).`
    });
  }
  if (successfulCollectors.has("authorization_servers")) {
    signals.push({
      title: "Authorization servers collected successfully",
      detail: `Collected ${snapshot.authorizationServers?.length ?? 0} authorization server(s) and related policy metadata.`
    });
  }
  if (successfulCollectors.has("system_log") && (snapshot.systemLog?.totalCollected ?? 0) > 0) {
    signals.push({
      title: "System Log API was accessible",
      detail: `Collected ${snapshot.systemLog?.totalCollected ?? 0} recent event(s) from the bounded system log window.`
    });
  }
  if ((snapshot.networkZones?.length ?? 0) > 0) {
    signals.push({
      title: "Network zones are configured",
      detail: `Collected ${snapshot.networkZones?.length ?? 0} network zone definition(s).`
    });
  }
  if ((snapshot.eventHooks?.length ?? 0) > 0) {
    signals.push({
      title: "Event hooks are present",
      detail: `Collected ${snapshot.eventHooks?.length ?? 0} event hook(s).`
    });
  }
  if (!findings.some((finding) => finding.severity === "critical")) {
    signals.push({
      title: "No critical findings detected",
      detail: "The current implemented Okta rule set did not identify any critical-severity issues in the assessed scope."
    });
  }

  return signals;
}

export function buildOktaAnalysisBoundaries(snapshot: OktaOrgSnapshot): string[] {
  const boundaries = [
    "Full group membership expansion remains outside the current MVP.",
    "Full app assignment graph expansion remains outside the current MVP; assignment topology is sampled safely.",
    "Long-range system log analytics remain outside the current MVP; recent logs are bounded to a configurable window.",
    "Per-user risk scoring remains outside the current MVP."
  ];

  const deviceCollectorPresent = snapshot.coverage.some((item) => item.collector.includes("device"));
  if (!deviceCollectorPresent) {
    boundaries.push("Device assurance and posture depth are not collected in the current MVP.");
  }

  return boundaries;
}

function defaultConfidenceReason(finding: OktaFinding): string {
  if (finding.confidence === "high") {
    return "The finding is based on directly collected configuration data in the scanned scope.";
  }
  if (finding.confidence === "low") {
    return "Evidence for this finding is incomplete or depends on missing collector scope.";
  }
  return "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully.";
}

function severityRank(severity: OktaFinding["severity"]): number {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    case "info":
      return 0;
  }
}

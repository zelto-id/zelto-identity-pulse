# Initial control validation set

This is a proposed deeper-validation set of **18 existing rules**, nine Auth0 and nine Okta, verified against [RULE_CATALOG](../../src/analysis/rules/rule-catalog.ts) and the [Auth0 rule implementation](../../src/analysis/auth0/auth0.rules.ts) / [Okta rule implementation](../../src/analysis/okta/okta.rules.ts) at `3ba2626747a870c510162060fd6f3ba7849d07af`. Selection is a product/IAM hypothesis for customer review in [063](backlog/063-pilot-customer-and-auditor-discovery.md), not a claim of validated controls or newly implemented capability.

The set prioritizes privilege, authentication, OAuth, attack protection and monitoring using collected fields. Branding/profile completeness is intentionally a scoring-policy decision in [053](backlog/053-assessment-semantics-decision.md), not a substitute for these security controls. [017](backlog/017-auth0-coverage-expansion.md) and [018](backlog/018-okta-coverage-expansion.md) own provider validation/guidance; [019](backlog/019-terraform-aligned-coverage-matrix.md) publishes the completed coverage matrix; [064](backlog/064-authorized-tenant-reference-validation.md) adds separately recorded real integration evidence.

| Existing rule ID | Validation focus | Current evidence source | Customer relevance / necessary boundary |
| --- | --- | --- | --- |
| AUTH-CLI-001 | Risky/context-dependent OAuth grants | Client grant_types, app_type and refresh-token context | Protect interactive/M2M grant design; a valid M2M client must not be treated like a public app. |
| AUTH-CLI-004 | Refresh-token rotation/expiry | Client app type, grants and refresh_token policy | High-impact mobile/browser exposure; preserve configuration through redaction. |
| AUTH-CLI-005 | Confidential client authentication | Client type and token_endpoint_auth_method | Distinguish public clients from weak confidential-client authentication. |
| AUTH-CON-002 | Database brute-force protection | Database connection strategy and brute_force_protection | Directly observable protective setting; absent data is not disabled. |
| AUTH-API-002 | API RBAC / permission configuration | Resource-server RBAC enforcement and token dialect | Customer authorization models vary; include explicit externally managed/not-applicable cases. |
| AUTH-API-007 | Management API grant sensitivity | Client-grant audience and scopes | Separate acceptable scanner read scopes from privileged automation requiring review. |
| AUTH-SEC-001 | MFA / step-up context | Guardian policy/factors and Actions indicators | Avoid equating a signal with effective sensitive-flow enforcement; denied subrequests remain unknown. |
| AUTH-SEC-005 | Breached-password protection | Attack-protection enabled/shields configuration | Critical redaction/collection boundary regression; do not claim live attack resistance. |
| AUTH-OBS-001 | External log-stream configuration | Log-stream inventory/status | Absence only follows a complete successful collection; configured stream is not proof of delivery/response. |
| OKTA-APP-001 | Risky OAuth grants | App OAuth grant-type configuration | Directly testable app posture with application context and unknown-shape handling. |
| OKTA-POL-002 | Strong authenticator availability | Authenticator key/status inventory | Availability is not enrollment or enforcement; test inactive and unsupported authenticators. |
| OKTA-POL-003 | Sign-on assurance | Supported sign-on actions/conditions and active/allow/deny state | Value-aware interpretation; requireFactor:false must never count as strong verification. |
| OKTA-POL-004 | Password/recovery policy | Password settings and recovery-method configuration | Validate shape/engine applicability and distinguish weak settings from inaccessible policy. |
| OKTA-POL-005 | Authenticator enrollment policy | Enrollment requirements and rule settings | Required versus optional factors; no proof of every user’s enrollment/effective access. |
| OKTA-API-002 | Wildcard authorization-server scopes | Authorization-server policy-rule scope conditions | Bound excessive scope claims to collected clients/rules and license/API availability. |
| OKTA-ADM-002 | High-privilege role population | Standard high-privilege role assignments/counts | Privileged-access relevance; tenant/custom-role inventory incompleteness limits confidence. |
| OKTA-NET-001 | Trusted Origin transport | Trusted Origin URLs and scope metadata | Observable insecure transport; no assumption that all app access is governed by this inventory. |
| OKTA-MON-001 | External log-stream configuration | Log-stream inventory/status | Test complete-empty versus denied collection and avoid claiming operational monitoring effectiveness. |

## Validation required for each selected rule

1. A manually described expected configuration and expected outcome: observed weakness, assessed clean, context-dependent/not applicable, denied/missing prerequisite, malformed/unsupported shape and execution error where relevant.
2. Paired synthetic provider responses run through collector → normalization/redaction → analyzer → Markdown/HTML/JSON. Assert rule/control ID, scoped source identity, exact field evidence, applicability, outcome, classification/confidence and remediation/validation guidance. Scores alone are insufficient.
3. Versioned decision rationale from [053](backlog/053-assessment-semantics-decision.md) and implementation [054](backlog/054-rule-outcomes-and-evidence-contract.md)/[055](backlog/055-consistent-score-grade-confidence.md). Specify where the rule is a heuristic requiring review; no blanket validation claim for the other 41 catalog IDs.
4. Guidance states the setting to inspect/change, expected configuration, safe manual validation and uncertainty. Instructions are not permission for Pulse to write provider configuration or execute active tests.
5. Separate validation maturity: code inspected, synthetic unit, mocked collector boundary, manual reference tenant, pilot review. Store dated sanitized artifact references and known false positives/omissions, not real customer settings or tokens.

The selected set does not replace regressions outside it: AUTH-API-003 redaction, OKTA-USR-002 assessment-time replay, all collector statuses and all 59 rule-catalog/outcome definitions remain in scope of their corrective tasks.

## Required reassessment scenarios

| Scenario | Observable result | Owner |
| --- | --- | --- |
| A read permission disappears | Previously observed finding becomes **not reassessed** with missing-source reason; never resolved. | [051](backlog/051-collection-completeness-and-analysis-errors.md), [054](backlog/054-rule-outcomes-and-evidence-contract.md), [057](backlog/057-coverage-aware-reassessment.md) |
| Evidence wording or object display name changes | Same tenant/source object/control remains linked; evidence revision is separate from finding identity. | [056](backlog/056-stable-identity-and-replay.md), [057](backlog/057-coverage-aware-reassessment.md) |
| Scope excludes an object | Excluded/not reassessed status explains the scope change; no remediation count increment. | [057](backlog/057-coverage-aware-reassessment.md) |
| Comparable source configuration is corrected | Records **configuration verified** with before/after control and source references; makes no claim about sessions/tokens. | [057](backlog/057-coverage-aware-reassessment.md), [034](backlog/034-remediation-workflow-findings-lifecycle.md) |
| Same snapshot and analysis inputs replay | Canonical assessment matches with explicit assessment time, versions and config; packaging/generated metadata is separately defined. | [056](backlog/056-stable-identity-and-replay.md) |

Suppression/accepted risk is a sixth required boundary: [058](backlog/058-retained-suppressions-and-exceptions.md) preserves the original finding and evidence with owner/rationale/expiry. Acceptance and manual closure do not equal a technical fix.

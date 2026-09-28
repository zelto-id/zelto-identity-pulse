window.PULSE_REPORTS = {
  "auth0": {
    "risk": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "auth0",
        "product": "ciam",
        "displayName": "Auth0",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-01T10:00:00.000Z"
      },
      "tenant": {
        "primaryIdentifier": "risky.us.auth0.com",
        "displayName": "risky.us.auth0.com",
        "kind": "tenant"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:37.306Z",
      "metadata": {
        "scanId": "scan_37fb63dcf780"
      },
      "score": {
        "overall": 15,
        "grade": "F",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 15,
          "assessedMaxPoints": 100,
          "normalizedScore": 15,
          "unassessedWeight": 0,
          "productionEquivalent": {
            "observedScore": 15,
            "normalizedScore": 15,
            "overall": 15,
            "grade": "F"
          },
          "environmentAdjustedInterpretation": "Critical findings are present and treated as production-impacting. 6 critical and 8 high finding(s) require attention."
        }
      },
      "categories": [
        {
          "id": "tenantBaseline",
          "name": "Tenant Baseline",
          "weight": 10,
          "score": 0,
          "assessed": true,
          "findings": 4,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "applications",
          "name": "Applications / OAuth Clients",
          "weight": 15,
          "score": 0,
          "assessed": true,
          "findings": 4,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "connections",
          "name": "Connections / Identity Sources",
          "weight": 15,
          "score": 0,
          "assessed": true,
          "findings": 2,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apis",
          "name": "APIs / Resource Servers",
          "weight": 10,
          "score": 0,
          "assessed": true,
          "findings": 4,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "rbac",
          "name": "RBAC / Authorization",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 1,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "actionsAndExtensibility",
          "name": "Actions & Extensibility",
          "weight": 10,
          "score": 0,
          "assessed": true,
          "findings": 2,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "attackProtection",
          "name": "MFA & Attack Protection",
          "weight": 10,
          "score": 0,
          "assessed": true,
          "findings": 4,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "monitoring",
          "name": "Monitoring & Log Streams",
          "weight": 10,
          "score": 0,
          "assessed": true,
          "findings": 1,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "brandingAndLoginExperience",
          "name": "Branding & Login Experience",
          "weight": 5,
          "score": 0,
          "assessed": true,
          "findings": 2,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "organizations",
          "name": "Organizations / B2B",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        }
      ],
      "findings": [
        {
          "id": "AUTH-TEN-001",
          "fingerprint": "fp_66e2ff18f54830497c291796",
          "title": "Tenant metadata is incomplete",
          "provider": "auth0",
          "category": "tenantBaseline",
          "severity": "low",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_2ed54d32167ad1ca",
              "kind": "tenant",
              "displayName": "auth0_tenant",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Missing tenant metadata: friendly_name, support_email, support_url, picture_url (logo)."
          },
          "businessRisk": "Incomplete metadata weakens trust signals shown to end users and downstream support tooling.",
          "recommendation": "Set friendly name, support email, support URL, and logo on tenant settings for production-readiness.",
          "validationSteps": [
            "Confirm friendly name, support email, support URL, and logo are set",
            "Verify changes are visible on the Universal Login page"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 2,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 2
        },
        {
          "id": "AUTH-TEN-003-A",
          "fingerprint": "fp_4883e644eb55ab0e3495da97",
          "title": "Tenant absolute session lifetime is excessive",
          "provider": "auth0",
          "category": "tenantBaseline",
          "severity": "medium",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_7fcd95b422d0e720",
              "kind": "tenant",
              "displayName": "auth0_tenant.session_lifetime",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Absolute session lifetime is 8760h (>720h)."
          },
          "businessRisk": "Long-lived sessions extend the blast radius of stolen cookies or compromised devices.",
          "recommendation": "Reduce absolute session lifetime to <= 168h for standard CIAM apps; document any longer lifetime explicitly.",
          "validationSteps": [
            "Reduce absolute session lifetime to align with risk profile",
            "Verify users are re-prompted to authenticate after the new lifetime"
          ],
          "falsePositiveNotes": [
            "Some B2B/admin-portal use cases intentionally use longer sessions; document and justify."
          ],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-TEN-003-B",
          "fingerprint": "fp_9b9014b8a309c67f8fdad449",
          "title": "Tenant idle session lifetime is excessive",
          "provider": "auth0",
          "category": "tenantBaseline",
          "severity": "low",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_41f666689d2182da",
              "kind": "tenant",
              "displayName": "auth0_tenant.idle_session_lifetime",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Idle session lifetime is 720h (>168h)."
          },
          "businessRisk": "Idle sessions that never expire increase the chance that an unattended browser session is reused.",
          "recommendation": "Reduce idle session lifetime to <= 72h for standard CIAM apps.",
          "validationSteps": [
            "Reduce idle session lifetime to <= 72h for standard CIAM apps"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 2,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 2
        },
        {
          "id": "AUTH-TEN-004-A",
          "fingerprint": "fp_8bf473241561b9f764918d5d",
          "title": "Clickjack protection headers are disabled",
          "provider": "auth0",
          "category": "tenantBaseline",
          "severity": "medium",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_c2afd1b2e16e5e7f",
              "kind": "tenant",
              "displayName": "auth0_tenant.flags.disable_clickjack_protection_headers",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Flag `disable_clickjack_protection_headers` is true."
          },
          "businessRisk": "Login UI becomes embeddable in iframes, enabling clickjacking against end users.",
          "recommendation": "Re-enable clickjack protection headers unless there is a documented reason.",
          "validationSteps": [
            "Re-enable clickjack protection headers",
            "Confirm login UI is no longer iframe-embeddable"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-CLI-001",
          "fingerprint": "fp_3b488cd75180c72ed2d45517",
          "title": "Risky/legacy OAuth grant types are enabled on one or more clients",
          "provider": "auth0",
          "category": "applications",
          "severity": "high",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_a1fabbc8aaf5e337",
              "kind": "generic",
              "displayName": "Legacy SPA (spa-bad)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Observed risks: Legacy SPA (spa-bad) [type=spa]: risky grants=implicit, password",
            "observedRisks": [
              "Legacy SPA (spa-bad) [type=spa]: risky grants=implicit, password"
            ],
            "requiresValidation": []
          },
          "businessRisk": "Legacy grants expose tokens in URL fragments or transmit credentials directly, increasing leakage and phishing risk. Mixed-purpose clients enlarge blast radius.",
          "recommendation": "Remove `implicit` and resource-owner-password grant types. Migrate SPAs to authorization_code + PKCE. For confirmed M2M needs, use a dedicated client (do not mix with end-user flows).",
          "validationSteps": [
            "Confirm `implicit` and `password` grants are removed where not required",
            "Confirm SPAs use `authorization_code` with PKCE"
          ],
          "falsePositiveNotes": [
            "`client_credentials` is valid for machine-to-machine apps; evaluate by application type."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-CLI-002",
          "fingerprint": "fp_b269675e453e7ed951b3e92f",
          "title": "Callback / origin sprawl or non-HTTPS endpoints observed",
          "provider": "auth0",
          "category": "applications",
          "severity": "high",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_a1fabbc8aaf5e337",
              "kind": "generic",
              "displayName": "Legacy SPA (spa-bad)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy SPA (spa-bad) [type=spa]: callbacks=17, web_origins=1, allowed_origins=0, auth_method=none"
          },
          "businessRisk": "Excess or insecure redirect targets enable token leakage, open-redirect chains, and credential exfiltration.",
          "recommendation": "Trim callbacks/web origins to the minimum required per environment; require HTTPS for non-localhost URLs.",
          "validationSteps": [
            "Trim callbacks/web origins to the minimum required per environment",
            "Require HTTPS for all non-localhost callback and origin URLs"
          ],
          "falsePositiveNotes": [
            "Local development origins (http://localhost) are expected; the rule excludes them."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-CLI-004",
          "fingerprint": "fp_4428c1093e3b04aa0888ac74",
          "title": "SPA/native client uses non-rotating or non-expiring refresh tokens",
          "provider": "auth0",
          "category": "applications",
          "severity": "critical",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_a1fabbc8aaf5e337",
              "kind": "generic",
              "displayName": "Legacy SPA (spa-bad)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy SPA (spa-bad) [type=spa]: rotation=non-rotating, expiration=non-expiring, token_lifetime=?"
          },
          "businessRisk": "A stolen refresh token remains valid indefinitely, allowing persistent account takeover after a single compromise.",
          "recommendation": "Enable refresh token rotation and expiration on all browser-facing and native clients; bound the absolute lifetime.",
          "validationSteps": [
            "Set rotation_type = rotating and expiration_type = expiring",
            "Bound absolute token_lifetime appropriately for the app type",
            "Re-test silent auth and refresh flows after the change"
          ],
          "falsePositiveNotes": [
            "Native apps using device-bound credentials may rely on different controls; review case-by-case."
          ],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-CLI-005",
          "fingerprint": "fp_5890f967f6d36fb3b540c850",
          "title": "Confidential client misconfigured as public",
          "provider": "auth0",
          "category": "applications",
          "severity": "critical",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_5469df7ff4271a88",
              "kind": "api",
              "displayName": "Backend API (confiden…)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Backend API (confiden…) [type=regular_web]: token_endpoint_auth_method=none"
          },
          "businessRisk": "Confidential apps that authenticate as public expose APIs to anyone able to spoof the client_id.",
          "recommendation": "Use `private_key_jwt` or mTLS for high-assurance integrations; otherwise `client_secret_post`/`client_secret_basic`.",
          "validationSteps": [
            "Set token_endpoint_auth_method to a confidential method",
            "Prefer private_key_jwt or mTLS for high-assurance integrations"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-CON-001",
          "fingerprint": "fp_85e7cd529164ada65d0864f4",
          "title": "Database connection has a weak or missing password policy",
          "provider": "auth0",
          "category": "connections",
          "severity": "medium",
          "confidence": "medium",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_ac96106a7f9ad45f",
              "kind": "generic",
              "displayName": "Legacy DB (auth0)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy DB (auth0): effective_policy=low (from: password_policy), enabled_clients=0"
          },
          "businessRisk": "Weak password policies increase credential-stuffing and brute-force takeover risk. When advanced policy controls are a tenant feature, compensating controls must be verified.",
          "recommendation": "Validate that advanced password-policy controls (history, dictionary, personal-info checks) are available and enabled for your Auth0 plan. If `good` or `excellent` policy is available, enable it. If advanced policy controls are unavailable or Early Access on your plan, document compensating controls including: attack protection (brute-force and suspicious-IP throttling), breached-password detection, rate limiting, bot protection, MFA or step-up on sensitive flows, and monitoring/alerting.",
          "validationSteps": [
            "Verify that advanced password-policy controls (history, dictionary, personal-info) are available on your Auth0 plan",
            "Set password_policy to `good` or `excellent` when the feature is available",
            "If advanced policy is unavailable or Early Access, document compensating controls: attack protection, breached-password detection, rate limiting, bot protection, MFA/step-up on sensitive flows",
            "Verify new-user signup and password reset flows still succeed after any change"
          ],
          "falsePositiveNotes": [
            "Advanced password-policy options may be Early Access or plan-gated on some Auth0 tiers; validate availability before flagging as a gap."
          ],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-CON-002",
          "fingerprint": "fp_97588731b4f02ae15eeb476f",
          "title": "Brute-force protection disabled on a database connection",
          "provider": "auth0",
          "category": "connections",
          "severity": "high",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_ac96106a7f9ad45f",
              "kind": "generic",
              "displayName": "Legacy DB (auth0)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy DB (auth0): brute_force_protection=false, disable_signup=?"
          },
          "businessRisk": "Disabling brute-force protection enables account-by-account password guessing without throttling.",
          "recommendation": "Re-enable brute-force protection on all production database connections.",
          "validationSteps": [
            "Re-enable brute-force protection on the connection",
            "Re-test login and signup after the change"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-CON-003",
          "fingerprint": "fp_30f7ade07ade882ab6cd9e4d",
          "title": "Custom database scripts detected (Architecture Note)",
          "provider": "auth0",
          "category": "connections",
          "severity": "info",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_ac96106a7f9ad45f",
              "kind": "generic",
              "displayName": "Legacy DB (auth0)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy DB (auth0): scripts=login"
          },
          "businessRisk": "Custom DB scripts run inside the auth pipeline. If scripts contain hardcoded secrets, lack an owner, or a migration is overdue, operational and security risk increases.",
          "recommendation": "Custom database scripts are expected when using Auth0's Custom Database or migration architecture. Confirm the following: scripts have a named owner and runbook; no plaintext secrets are present in script bodies; if a user-migration is in progress, define and communicate a completion timeline; secrets are managed via Auth0 Action Secrets or an external vault rather than hardcoded values.",
          "validationSteps": [
            "Review script bodies for hardcoded secrets, credentials, or API keys",
            "Confirm ownership and governance are documented"
          ],
          "falsePositiveNotes": [
            "Custom DB scripts are expected and legitimate for Auth0 Custom Database and user-migration architectures. This is an Architecture Note, not a risk finding."
          ],
          "scoreImpact": 0,
          "productionEquivalentSeverity": "info",
          "environmentAdjustedSeverity": "info",
          "productionEquivalentScoreImpact": 0
        },
        {
          "id": "AUTH-API-001",
          "fingerprint": "fp_2cf2e216e3835ee9e0b33c5c",
          "title": "API signed with HS256",
          "provider": "auth0",
          "category": "apis",
          "severity": "high",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_c15d84cfb848baa5",
              "kind": "api",
              "displayName": "Public API — https://api.risky.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Public API — https://api.risky.example: signing_alg=HS256, scopes=2, token_dialect=?"
          },
          "businessRisk": "Symmetric signing forces secret distribution; a compromised verifier can mint valid access tokens.",
          "recommendation": "Use `RS256` or `PS256` for externally consumed APIs; HS256 requires sharing the secret with verifiers.",
          "validationSteps": [
            "Switch externally consumed APIs to RS256 or PS256",
            "Rotate verifier configuration to fetch the JWKS endpoint",
            "Re-test token validation with the new algorithm"
          ],
          "falsePositiveNotes": [
            "Internal-only APIs with rotating shared secrets may use HS256 with documented controls; confirm context."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-API-002",
          "fingerprint": "fp_5d43b6523bb761a34cf51b94",
          "title": "API has permissions defined but does not enforce RBAC",
          "provider": "auth0",
          "category": "apis",
          "severity": "high",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_c15d84cfb848baa5",
              "kind": "api",
              "displayName": "Public API — https://api.risky.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Public API — https://api.risky.example: scopes=2, enforce_policies=false, token_dialect=?"
          },
          "businessRisk": "Permissions appear to govern access but are not enforced at token-issuance time.",
          "recommendation": "Enable `enforce_policies` (RBAC) on every custom API that defines permissions.",
          "validationSteps": [
            "Enable RBAC (enforce_policies = true)",
            "Set token_dialect to include permissions in the access token where required",
            "Verify access tokens include the expected `permissions` claim"
          ],
          "falsePositiveNotes": [
            "Do not apply this rule to the Auth0 Management API or other system APIs.",
            "Some APIs use scopes only (without RBAC) by design; confirm intent."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-API-003",
          "fingerprint": "fp_3128773b056633285469daee",
          "title": "API access token lifetime is excessively long",
          "provider": "auth0",
          "category": "apis",
          "severity": "medium",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_c15d84cfb848baa5",
              "kind": "api",
              "displayName": "Public API — https://api.risky.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Public API — https://api.risky.example: token_lifetime=2592000s"
          },
          "businessRisk": "Long-lived access tokens cannot be revoked and increase the window of abuse after compromise.",
          "recommendation": "Reduce access token lifetime to <= 24h; rely on refresh tokens for longer sessions.",
          "validationSteps": [
            "Reduce access-token lifetime to <= 24h",
            "Enable offline_access only for clients that need it"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-API-005",
          "fingerprint": "fp_8296271cd8c3afe508df0757",
          "title": "Client grant is overly broad",
          "provider": "auth0",
          "category": "apis",
          "severity": "high",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_e3f87f2a4b0f9e9b",
              "kind": "api",
              "displayName": "m2m-bad → Public API — https://api.risky.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "m2m-bad → Public API — https://api.risky.example: scopes=32, allow_any_organization=true"
          },
          "businessRisk": "Over-scoped M2M grants extend a compromised client's blast radius across APIs and tenants.",
          "recommendation": "Tighten scopes to least privilege; avoid `allow_any_organization` in B2B integrations.",
          "validationSteps": [
            "Review assigned scopes for least privilege",
            "Remove unused create/update/delete/admin scopes",
            "Re-test the dependent integration after changes"
          ],
          "falsePositiveNotes": [
            "Broad scopes may be temporarily required for automation; document and time-bound any exception.",
            "For Auth0 Management API grants, see also AUTH-API-007."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-RBAC-001",
          "fingerprint": "fp_79aa1d187df5faa279955270",
          "title": "No Auth0 roles defined — confirm where authorization is managed",
          "provider": "auth0",
          "category": "rbac",
          "severity": "low",
          "confidence": "medium",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_dc755c14c1818eb7",
              "kind": "role",
              "displayName": "auth0_role",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "0 roles returned from /roles. Context signals: unenforced_apis=true, organizations=false, org_clients=false."
          },
          "businessRisk": "If authorization is expected to be governed in Auth0 but no roles exist, entitlement reviews are difficult and access governance is ad-hoc. Custom authorization logic outside Auth0 is opaque to this scanner.",
          "recommendation": "This tenant does not use the built-in Auth0 Roles feature for authorization. This is a valid architectural choice if a custom authorization model is in place (e.g. SAML attributes, application-managed claims, external authorization service, or permissions injected via Actions). Note: this tool cannot analyze the security or correctness of custom authorization logic. If you rely on a custom model, ensure it is documented, owned by a named team, and covered by your access-review process. If you intend to use Auth0 RBAC: define roles, enable RBAC enforcement on APIs that define permissions, and assign roles to users or groups rather than granting direct user permissions.",
          "validationSteps": [
            "Confirm where authorization is managed: application-side, external service, or Auth0 RBAC",
            "If Auth0 manages authorization: define roles, enable RBAC on APIs, assign roles to users",
            "If authorization is managed outside Auth0: document the decision and ensure access reviews cover it"
          ],
          "falsePositiveNotes": [
            "Zero roles is informational by default. Many CIAM tenants manage authorization in the application or a downstream service. Only escalate if Auth0 is expected to govern authorization."
          ],
          "scoreImpact": 0,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 0
        },
        {
          "id": "AUTH-EXT-001",
          "fingerprint": "fp_f871f4c44b8f7e3a7c1b1bd9",
          "title": "Production tenant still depends on Rules or Hooks (EOL 2026-11-18)",
          "provider": "auth0",
          "category": "actionsAndExtensibility",
          "severity": "critical",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_fa6cd06d530b220d",
              "kind": "generic",
              "displayName": "auth0_rule",
              "masked": false
            },
            {
              "id": "res_a2ad09a3d37db8bd",
              "kind": "generic",
              "displayName": "auth0_hook",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Rules enabled: 1, Hooks enabled: 1."
          },
          "businessRisk": "Rules and Hooks reach end of life; tenants relying on them will lose functionality and platform support.",
          "recommendation": "Migrate Rules and Hooks logic to Auth0 Actions before the 2026-11-18 EOL date.",
          "validationSteps": [
            "Inventory existing Rules/Hooks and their dependencies",
            "Re-implement equivalent logic as Auth0 Actions on the matching trigger",
            "Disable the legacy Rules/Hooks once Actions are deployed and verified"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-EXT-002",
          "fingerprint": "fp_09db31cbb048f50aa5a829aa",
          "title": "Actions run on outdated Node.js runtime",
          "provider": "auth0",
          "category": "actionsAndExtensibility",
          "severity": "medium",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_5a4980e46412da49",
              "kind": "generic",
              "displayName": "Old action (a-old)",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Old action: runtime=node12"
          },
          "businessRisk": "Outdated runtimes lose security patches and force last-minute migrations under time pressure.",
          "recommendation": "Migrate Actions to `node18` or `node22` before runtime EOL.",
          "validationSteps": [
            "Migrate Actions to node18 or node22",
            "Re-deploy and verify the action runs successfully on the new runtime"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-SEC-001",
          "fingerprint": "fp_123b31b172279d589adb149f",
          "title": "No tenant-level MFA policy: step-up and risk-based MFA controls should be confirmed",
          "provider": "auth0",
          "category": "attackProtection",
          "severity": "high",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_4c154aaa42e379ac",
              "kind": "policy",
              "displayName": "auth0_guardian.policy",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Guardian policy=never, enabled_factors=none."
          },
          "businessRisk": "Without any MFA or step-up controls, sensitive flows (admin access, credential changes, high-risk logins) are protected only by a password, increasing account-takeover risk for high-value targets.",
          "recommendation": "For CIAM tenants, enforcing MFA on every login is a business and UX decision. Confirm that MFA or step-up authentication is applied to high-risk and sensitive flows, including: admin/customer-admin access, credential changes (password reset, email change), profile changes, high-value transactions, and high-risk logins (new device, unusual geography). Use risk-based MFA (`confidence-score` policy) or Actions-based step-up MFA to scope enforcement to these flows without gating every customer login.",
          "validationSteps": [
            "Confirm sensitive flows (admin, credential changes, high-risk logins) require a second factor",
            "Verify that custom step-up Actions are deployed and tested",
            "Confirm at least one phishing-resistant factor (WebAuthn) is available for high-assurance flows"
          ],
          "falsePositiveNotes": [
            "For CIAM tenants, enforcing MFA on every customer login is a business and UX decision. Absence of blanket MFA policy is not automatically a risk — confirm step-up/risk-based controls are in place for sensitive flows."
          ],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-SEC-004",
          "fingerprint": "fp_b2ee340eea5bd6b6a59b46d3",
          "title": "Brute-force protection is disabled",
          "provider": "auth0",
          "category": "attackProtection",
          "severity": "critical",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_e765324bdfd653f9",
              "kind": "generic",
              "displayName": "auth0_attack_protection.brute_force_protection",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "brute_force_protection.enabled=false, mode=?, max_attempts=?."
          },
          "businessRisk": "Tenants with brute-force protection off are open to high-velocity password guessing.",
          "recommendation": "Re-enable brute-force protection at the tenant level.",
          "validationSteps": [
            "Re-enable brute-force protection",
            "Confirm shields include `block` and `user_notification`"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-SEC-005",
          "fingerprint": "fp_5c73664e29fddc934c322e63",
          "title": "Breached password detection is disabled",
          "provider": "auth0",
          "category": "attackProtection",
          "severity": "critical",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_0cc07138dc1deb34",
              "kind": "generic",
              "displayName": "auth0_attack_protection.breached_password_detection",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "breached_password_detection.enabled=false, method=?."
          },
          "businessRisk": "Users who reuse compromised credentials remain exploitable indefinitely.",
          "recommendation": "Enable breached password detection with at least `block` or `admin_notification` shields.",
          "validationSteps": [
            "Enable breached password detection",
            "Configure `block` and/or `admin_notification` shields"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-SEC-006",
          "fingerprint": "fp_6e204df027c3108e89952213",
          "title": "Suspicious IP throttling is disabled",
          "provider": "auth0",
          "category": "attackProtection",
          "severity": "critical",
          "confidence": "high",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_b491ff7d87633837",
              "kind": "generic",
              "displayName": "auth0_attack_protection.suspicious_ip_throttling",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "suspicious_ip_throttling.enabled=false, allowlist_size=0."
          },
          "businessRisk": "Without throttling, credential stuffing and signup-abuse campaigns are not slowed at the IP layer.",
          "recommendation": "Re-enable Suspicious IP Throttling. Auth0 strongly recommends not disabling this control.",
          "validationSteps": [
            "Re-enable suspicious IP throttling",
            "Tighten allowlist to known operational sources only"
          ],
          "falsePositiveNotes": [
            "Auth0 strongly recommends not disabling Suspicious IP Throttling."
          ],
          "scoreImpact": 25,
          "productionEquivalentSeverity": "critical",
          "environmentAdjustedSeverity": "critical",
          "productionEquivalentScoreImpact": 25
        },
        {
          "id": "AUTH-OBS-001",
          "fingerprint": "fp_ea98e3b0eb3f688104f4421c",
          "title": "No active log stream",
          "provider": "auth0",
          "category": "monitoring",
          "severity": "high",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_047db6495e73c03e",
              "kind": "generic",
              "displayName": "auth0_log_stream",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "total_streams=0, active_streams=0."
          },
          "businessRisk": "Without log streaming, security investigations and audit evidence are limited to a short retention window inside Auth0.",
          "recommendation": "Configure at least one active log stream to a SIEM or log-analytics platform.",
          "validationSteps": [
            "Configure at least one active log stream to a SIEM or log analytics platform",
            "Verify the downstream destination receives recent auth events"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 12,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 12
        },
        {
          "id": "AUTH-UX-001",
          "fingerprint": "fp_aafffd4c1a75d001a4bbf3a4",
          "title": "Tenant uses classic Universal Login",
          "provider": "auth0",
          "category": "brandingAndLoginExperience",
          "severity": "medium",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_2ecf976f04634a29",
              "kind": "user",
              "displayName": "auth0_prompt.universal_login_experience",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "universal_login_experience = classic."
          },
          "businessRisk": "Classic ULP receives reduced investment and limits future hardening (passkeys, identifier-first).",
          "recommendation": "Migrate to the new Universal Login experience.",
          "validationSteps": [
            "Switch Universal Login to the `new` experience",
            "Re-test all login flows after the change"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 6,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 6
        },
        {
          "id": "AUTH-UX-003",
          "fingerprint": "fp_2ba1dc439f60c9b58ed50666",
          "title": "No custom domain configured",
          "provider": "auth0",
          "category": "brandingAndLoginExperience",
          "severity": "low",
          "confidence": "medium",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_b36788a803a02580",
              "kind": "generic",
              "displayName": "auth0_custom_domain",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "0 custom domains."
          },
          "businessRisk": "Default tenant domain weakens branding and complicates phishing-resistant patterns like passkeys.",
          "recommendation": "Configure a custom domain with TLS policy `recommended` for production tenants.",
          "validationSteps": [
            "Provision a custom domain with TLS policy `recommended`",
            "Update applications to use the new domain"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 2,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 2
        }
      ],
      "opportunities": [
        {
          "id": "OPP-AUTH-TEN-001",
          "title": "Set friendly name, support email, support URL, and logo on tenant settings for production-readiness.",
          "category": "tenantBaseline",
          "type": "governance-improvement",
          "description": "Tenant metadata is incomplete. Incomplete metadata weakens trust signals shown to end users and downstream support tooling.",
          "effort": "low",
          "relatedFindingId": "AUTH-TEN-001"
        },
        {
          "id": "OPP-AUTH-TEN-003-A",
          "title": "Reduce absolute session lifetime to <= 168h for standard CIAM apps; document any longer lifetime explicitly.",
          "category": "tenantBaseline",
          "type": "governance-improvement",
          "description": "Tenant absolute session lifetime is excessive. Long-lived sessions extend the blast radius of stolen cookies or compromised devices.",
          "effort": "medium",
          "relatedFindingId": "AUTH-TEN-003-A"
        },
        {
          "id": "OPP-AUTH-TEN-003-B",
          "title": "Reduce idle session lifetime to <= 72h for standard CIAM apps.",
          "category": "tenantBaseline",
          "type": "governance-improvement",
          "description": "Tenant idle session lifetime is excessive. Idle sessions that never expire increase the chance that an unattended browser session is reused.",
          "effort": "low",
          "relatedFindingId": "AUTH-TEN-003-B"
        },
        {
          "id": "OPP-AUTH-TEN-004-A",
          "title": "Re-enable clickjack protection headers unless there is a documented reason.",
          "category": "tenantBaseline",
          "type": "governance-improvement",
          "description": "Clickjack protection headers are disabled. Login UI becomes embeddable in iframes, enabling clickjacking against end users.",
          "effort": "medium",
          "relatedFindingId": "AUTH-TEN-004-A"
        },
        {
          "id": "OPP-AUTH-CLI-001",
          "title": "Remove `implicit` and resource-owner-password grant types. Migrate SPAs to authorization_code + PKCE. For confirmed M2M needs, use a dedicated client (do not mix with end-user flows).",
          "category": "applications",
          "type": "security-hardening",
          "description": "Risky/legacy OAuth grant types are enabled on one or more clients. Legacy grants expose tokens in URL fragments or transmit credentials directly, increasing leakage and phishing risk. Mixed-purpose clients enlarge blast radius.",
          "effort": "medium",
          "relatedFindingId": "AUTH-CLI-001"
        },
        {
          "id": "OPP-AUTH-CLI-002",
          "title": "Trim callbacks/web origins to the minimum required per environment; require HTTPS for non-localhost URLs.",
          "category": "applications",
          "type": "security-hardening",
          "description": "Callback / origin sprawl or non-HTTPS endpoints observed. Excess or insecure redirect targets enable token leakage, open-redirect chains, and credential exfiltration.",
          "effort": "medium",
          "relatedFindingId": "AUTH-CLI-002"
        },
        {
          "id": "OPP-AUTH-CLI-004",
          "title": "Enable refresh token rotation and expiration on all browser-facing and native clients; bound the absolute lifetime.",
          "category": "applications",
          "type": "security-hardening",
          "description": "SPA/native client uses non-rotating or non-expiring refresh tokens. A stolen refresh token remains valid indefinitely, allowing persistent account takeover after a single compromise.",
          "effort": "high",
          "relatedFindingId": "AUTH-CLI-004"
        },
        {
          "id": "OPP-AUTH-CLI-005",
          "title": "Use `private_key_jwt` or mTLS for high-assurance integrations; otherwise `client_secret_post`/`client_secret_basic`.",
          "category": "applications",
          "type": "security-hardening",
          "description": "Confidential client misconfigured as public. Confidential apps that authenticate as public expose APIs to anyone able to spoof the client_id.",
          "effort": "high",
          "relatedFindingId": "AUTH-CLI-005"
        },
        {
          "id": "OPP-AUTH-CON-001",
          "title": "Validate that advanced password-policy controls (history, dictionary, personal-info checks) are available and enabled for your Auth0 plan. If `good` or `excellent` policy is available, enable it. If advanced policy controls are unavailable or Early Access on your plan, document compensating controls including: attack protection (brute-force and suspicious-IP throttling), breached-password detection, rate limiting, bot protection, MFA or step-up on sensitive flows, and monitoring/alerting.",
          "category": "connections",
          "type": "security-hardening",
          "description": "Database connection has a weak or missing password policy. Weak password policies increase credential-stuffing and brute-force takeover risk. When advanced policy controls are a tenant feature, compensating controls must be verified.",
          "effort": "medium",
          "relatedFindingId": "AUTH-CON-001"
        },
        {
          "id": "OPP-AUTH-CON-002",
          "title": "Re-enable brute-force protection on all production database connections.",
          "category": "connections",
          "type": "security-hardening",
          "description": "Brute-force protection disabled on a database connection. Disabling brute-force protection enables account-by-account password guessing without throttling.",
          "effort": "medium",
          "relatedFindingId": "AUTH-CON-002"
        },
        {
          "id": "OPP-AUTH-API-001",
          "title": "Use `RS256` or `PS256` for externally consumed APIs; HS256 requires sharing the secret with verifiers.",
          "category": "apis",
          "type": "security-hardening",
          "description": "API signed with HS256. Symmetric signing forces secret distribution; a compromised verifier can mint valid access tokens.",
          "effort": "medium",
          "relatedFindingId": "AUTH-API-001"
        },
        {
          "id": "OPP-AUTH-API-002",
          "title": "Enable `enforce_policies` (RBAC) on every custom API that defines permissions.",
          "category": "apis",
          "type": "security-hardening",
          "description": "API has permissions defined but does not enforce RBAC. Permissions appear to govern access but are not enforced at token-issuance time.",
          "effort": "medium",
          "relatedFindingId": "AUTH-API-002"
        },
        {
          "id": "OPP-AUTH-API-003",
          "title": "Reduce access token lifetime to <= 24h; rely on refresh tokens for longer sessions.",
          "category": "apis",
          "type": "security-hardening",
          "description": "API access token lifetime is excessively long. Long-lived access tokens cannot be revoked and increase the window of abuse after compromise.",
          "effort": "medium",
          "relatedFindingId": "AUTH-API-003"
        },
        {
          "id": "OPP-AUTH-API-005",
          "title": "Tighten scopes to least privilege; avoid `allow_any_organization` in B2B integrations.",
          "category": "apis",
          "type": "security-hardening",
          "description": "Client grant is overly broad. Over-scoped M2M grants extend a compromised client's blast radius across APIs and tenants.",
          "effort": "medium",
          "relatedFindingId": "AUTH-API-005"
        },
        {
          "id": "OPP-AUTH-RBAC-001",
          "title": "This tenant does not use the built-in Auth0 Roles feature for authorization. This is a valid architectural choice if a custom authorization model is in place (e.g. SAML attributes, application-managed claims, external authorization service, or permissions injected via Actions). Note: this tool cannot analyze the security or correctness of custom authorization logic. If you rely on a custom model, ensure it is documented, owned by a named team, and covered by your access-review process. If you intend to use Auth0 RBAC: define roles, enable RBAC enforcement on APIs that define permissions, and assign roles to users or groups rather than granting direct user permissions.",
          "category": "rbac",
          "type": "governance-improvement",
          "description": "No Auth0 roles defined — confirm where authorization is managed. If authorization is expected to be governed in Auth0 but no roles exist, entitlement reviews are difficult and access governance is ad-hoc. Custom authorization logic outside Auth0 is opaque to this scanner.",
          "effort": "low",
          "relatedFindingId": "AUTH-RBAC-001"
        },
        {
          "id": "OPP-AUTH-EXT-001",
          "title": "Migrate Rules and Hooks logic to Auth0 Actions before the 2026-11-18 EOL date.",
          "category": "actionsAndExtensibility",
          "type": "architecture-improvement",
          "description": "Production tenant still depends on Rules or Hooks (EOL 2026-11-18). Rules and Hooks reach end of life; tenants relying on them will lose functionality and platform support.",
          "effort": "high",
          "relatedFindingId": "AUTH-EXT-001"
        },
        {
          "id": "OPP-AUTH-EXT-002",
          "title": "Migrate Actions to `node18` or `node22` before runtime EOL.",
          "category": "actionsAndExtensibility",
          "type": "architecture-improvement",
          "description": "Actions run on outdated Node.js runtime. Outdated runtimes lose security patches and force last-minute migrations under time pressure.",
          "effort": "medium",
          "relatedFindingId": "AUTH-EXT-002"
        },
        {
          "id": "OPP-AUTH-SEC-001",
          "title": "For CIAM tenants, enforcing MFA on every login is a business and UX decision. Confirm that MFA or step-up authentication is applied to high-risk and sensitive flows, including: admin/customer-admin access, credential changes (password reset, email change), profile changes, high-value transactions, and high-risk logins (new device, unusual geography). Use risk-based MFA (`confidence-score` policy) or Actions-based step-up MFA to scope enforcement to these flows without gating every customer login.",
          "category": "attackProtection",
          "type": "security-hardening",
          "description": "No tenant-level MFA policy: step-up and risk-based MFA controls should be confirmed. Without any MFA or step-up controls, sensitive flows (admin access, credential changes, high-risk logins) are protected only by a password, increasing account-takeover risk for high-value targets.",
          "effort": "medium",
          "relatedFindingId": "AUTH-SEC-001"
        },
        {
          "id": "OPP-AUTH-SEC-004",
          "title": "Re-enable brute-force protection at the tenant level.",
          "category": "attackProtection",
          "type": "security-hardening",
          "description": "Brute-force protection is disabled. Tenants with brute-force protection off are open to high-velocity password guessing.",
          "effort": "high",
          "relatedFindingId": "AUTH-SEC-004"
        },
        {
          "id": "OPP-AUTH-SEC-005",
          "title": "Enable breached password detection with at least `block` or `admin_notification` shields.",
          "category": "attackProtection",
          "type": "security-hardening",
          "description": "Breached password detection is disabled. Users who reuse compromised credentials remain exploitable indefinitely.",
          "effort": "high",
          "relatedFindingId": "AUTH-SEC-005"
        },
        {
          "id": "OPP-AUTH-SEC-006",
          "title": "Re-enable Suspicious IP Throttling. Auth0 strongly recommends not disabling this control.",
          "category": "attackProtection",
          "type": "security-hardening",
          "description": "Suspicious IP throttling is disabled. Without throttling, credential stuffing and signup-abuse campaigns are not slowed at the IP layer.",
          "effort": "high",
          "relatedFindingId": "AUTH-SEC-006"
        },
        {
          "id": "OPP-AUTH-OBS-001",
          "title": "Configure at least one active log stream to a SIEM or log-analytics platform.",
          "category": "monitoring",
          "type": "audit-readiness",
          "description": "No active log stream. Without log streaming, security investigations and audit evidence are limited to a short retention window inside Auth0.",
          "effort": "medium",
          "relatedFindingId": "AUTH-OBS-001"
        },
        {
          "id": "OPP-AUTH-UX-001",
          "title": "Migrate to the new Universal Login experience.",
          "category": "brandingAndLoginExperience",
          "type": "ux-improvement",
          "description": "Tenant uses classic Universal Login. Classic ULP receives reduced investment and limits future hardening (passkeys, identifier-first).",
          "effort": "medium",
          "relatedFindingId": "AUTH-UX-001"
        },
        {
          "id": "OPP-AUTH-UX-003",
          "title": "Configure a custom domain with TLS policy `recommended` for production tenants.",
          "category": "brandingAndLoginExperience",
          "type": "ux-improvement",
          "description": "No custom domain configured. Default tenant domain weakens branding and complicates phishing-resistant patterns like passkeys.",
          "effort": "low",
          "relatedFindingId": "AUTH-UX-003"
        }
      ],
      "coverage": {
        "partial": false,
        "missingScopes": [],
        "failedCollectors": [],
        "collectors": [
          {
            "collector": "tenant",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:tenant_settings"
            ]
          },
          {
            "collector": "clients",
            "status": "success",
            "count": 2,
            "requiredScopes": [
              "read:clients"
            ]
          },
          {
            "collector": "connections",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:connections"
            ]
          },
          {
            "collector": "resource_servers",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:resource_servers"
            ]
          },
          {
            "collector": "client_grants",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:client_grants"
            ]
          },
          {
            "collector": "roles",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:roles"
            ]
          },
          {
            "collector": "actions",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:actions"
            ]
          },
          {
            "collector": "rules",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:rules"
            ]
          },
          {
            "collector": "hooks",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:hooks"
            ]
          },
          {
            "collector": "organizations",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:organizations"
            ]
          },
          {
            "collector": "log_streams",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:log_streams"
            ]
          },
          {
            "collector": "attack_protection",
            "status": "success",
            "count": 3,
            "requiredScopes": [
              "read:attack_protection"
            ]
          },
          {
            "collector": "branding",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:branding"
            ]
          },
          {
            "collector": "prompts",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:prompts"
            ]
          },
          {
            "collector": "custom_domains",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:custom_domains"
            ]
          },
          {
            "collector": "guardian",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:guardian_factors"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized snapshot of tenant configuration. They reflect configuration posture, not runtime behavior or user activity.",
        "Severity is calibrated against typical CIAM/B2B production expectations. Sandbox or development tenants may intentionally relax some controls.",
        "Tenant environment was reported as **production**; severities have been adjusted accordingly. Production-equivalent severity is preserved alongside the adjusted value for transparency.",
        "Absence of a finding indicates that no rule triggered for the data observed; it does not by itself prove the absence of risk in unexamined areas.",
        "Recommendations cite Auth0 dashboard areas and Terraform fields where applicable so engineering teams can validate and apply changes consistently."
      ],
      "limitations": [
        "End-user behavior analytics, individual user risk scoring, and historical login telemetry are outside MVP scope.",
        "Tenant-side performance, billing, quota, and SLA posture are outside MVP scope.",
        "Automated remediation, write operations against Auth0, and code-side application security are outside MVP scope."
      ],
      "positiveSignals": [
        {
          "id": "auth0-collection-complete",
          "title": "Collector coverage completed as configured",
          "detail": "All configured Auth0 collectors completed without failed or skipped coverage."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0–7 days",
            "items": [
              {
                "priority": 1,
                "findingId": "AUTH-SEC-004",
                "action": "Re-enable brute-force protection at the tenant level.",
                "expectedOutcome": "Slows targeted password-guessing attacks at the IP/account boundary.",
                "effort": "medium",
                "severity": "critical"
              },
              {
                "priority": 2,
                "findingId": "AUTH-SEC-005",
                "action": "Enable breached password detection with at least `block` or `admin_notification` shields.",
                "expectedOutcome": "Prevents users with known-compromised passwords from authenticating silently.",
                "effort": "medium",
                "severity": "critical"
              },
              {
                "priority": 3,
                "findingId": "AUTH-SEC-006",
                "action": "Re-enable Suspicious IP Throttling. Auth0 strongly recommends not disabling this control.",
                "expectedOutcome": "Throttles credential stuffing and signup-abuse campaigns at the IP layer.",
                "effort": "medium",
                "severity": "critical"
              },
              {
                "priority": 4,
                "findingId": "AUTH-CLI-004",
                "action": "Enable refresh token rotation and expiration on all browser-facing and native clients; bound the absolute lifetime.",
                "expectedOutcome": "Limits the useful lifetime of a stolen refresh token to a bounded window and breaks long-lived takeover persistence.",
                "effort": "medium",
                "severity": "critical"
              },
              {
                "priority": 5,
                "findingId": "AUTH-CLI-005",
                "action": "Use `private_key_jwt` or mTLS for high-assurance integrations; otherwise `client_secret_post`/`client_secret_basic`.",
                "expectedOutcome": "Forces confidential apps to authenticate, removing client-id-only spoofing risk.",
                "effort": "medium",
                "severity": "critical"
              },
              {
                "priority": 6,
                "findingId": "AUTH-EXT-001",
                "action": "Migrate Rules and Hooks logic to Auth0 Actions before the 2026-11-18 EOL date.",
                "expectedOutcome": "Removes a hard 2026-11-18 platform deadline from the auth pipeline.",
                "effort": "high",
                "severity": "critical"
              },
              {
                "priority": 7,
                "findingId": "AUTH-SEC-001",
                "action": "For CIAM tenants, enforcing MFA on every login is a business and UX decision. Confirm that MFA or step-up authentication is applied to high-risk and sensitive flows, including: admin/customer-admin access, credential changes (password reset, email change), profile changes, high-value transactions, and high-risk logins (new device, unusual geography). Use risk-based MFA (`confidence-score` policy) or Actions-based step-up MFA to scope enforcement to these flows without gating every customer login.",
                "expectedOutcome": "Reduces account takeover risk by requiring a second factor for end users.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 8,
                "findingId": "AUTH-API-001",
                "action": "Use `RS256` or `PS256` for externally consumed APIs; HS256 requires sharing the secret with verifiers.",
                "expectedOutcome": "Removes shared-secret distribution across API verifiers and unblocks safer key rotation.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 9,
                "findingId": "AUTH-CON-002",
                "action": "Re-enable brute-force protection on all production database connections.",
                "expectedOutcome": "Restores per-account brute-force throttling on the affected connection.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 10,
                "findingId": "AUTH-OBS-001",
                "action": "Configure at least one active log stream to a SIEM or log-analytics platform.",
                "expectedOutcome": "Provides durable telemetry for incident response and audit evidence.",
                "effort": "medium",
                "severity": "high"
              }
            ]
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2–4 weeks",
            "items": [
              {
                "priority": 1,
                "findingId": "AUTH-CLI-001",
                "action": "Remove `implicit` and resource-owner-password grant types. Migrate SPAs to authorization_code + PKCE. For confirmed M2M needs, use a dedicated client (do not mix with end-user flows).",
                "expectedOutcome": "Reduces token leakage risk and aligns browser-based login flows with modern OAuth/OIDC best practice.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 2,
                "findingId": "AUTH-CLI-002",
                "action": "Trim callbacks/web origins to the minimum required per environment; require HTTPS for non-localhost URLs.",
                "expectedOutcome": "Shrinks the attack surface for redirect/origin abuse and open-redirect chains.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 3,
                "findingId": "AUTH-API-002",
                "action": "Enable `enforce_policies` (RBAC) on every custom API that defines permissions.",
                "expectedOutcome": "Makes existing permissions actually govern access at token-issuance time.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 4,
                "findingId": "AUTH-API-005",
                "action": "Tighten scopes to least privilege; avoid `allow_any_organization` in B2B integrations.",
                "expectedOutcome": "Reduces the blast radius of a compromised M2M client.",
                "effort": "medium",
                "severity": "high"
              },
              {
                "priority": 5,
                "findingId": "AUTH-API-003",
                "action": "Reduce access token lifetime to <= 24h; rely on refresh tokens for longer sessions.",
                "expectedOutcome": "Bounds the window during which a stolen access token remains valid.",
                "effort": "medium",
                "severity": "medium"
              },
              {
                "priority": 6,
                "findingId": "AUTH-CON-001",
                "action": "Validate that advanced password-policy controls (history, dictionary, personal-info checks) are available and enabled for your Auth0 plan. If `good` or `excellent` policy is available, enable it. If advanced policy controls are unavailable or Early Access on your plan, document compensating controls including: attack protection (brute-force and suspicious-IP throttling), breached-password detection, rate limiting, bot protection, MFA or step-up on sensitive flows, and monitoring/alerting.",
                "expectedOutcome": "Reduces weak-password and credential-stuffing takeover risk.",
                "effort": "medium",
                "severity": "medium"
              },
              {
                "priority": 7,
                "findingId": "AUTH-EXT-002",
                "action": "Migrate Actions to `node18` or `node22` before runtime EOL.",
                "expectedOutcome": "Keeps Actions on a supported, security-patched runtime.",
                "effort": "medium",
                "severity": "medium"
              },
              {
                "priority": 8,
                "findingId": "AUTH-TEN-003-A",
                "action": "Reduce absolute session lifetime to <= 168h for standard CIAM apps; document any longer lifetime explicitly.",
                "expectedOutcome": "Limits the impact of stolen session cookies and unattended browsers.",
                "effort": "medium",
                "severity": "medium"
              },
              {
                "priority": 9,
                "findingId": "AUTH-TEN-004-A",
                "action": "Re-enable clickjack protection headers unless there is a documented reason.",
                "expectedOutcome": "Restores clickjack protection on the Universal Login experience.",
                "effort": "medium",
                "severity": "medium"
              },
              {
                "priority": 10,
                "findingId": "AUTH-UX-001",
                "action": "Migrate to the new Universal Login experience.",
                "expectedOutcome": "Unlocks ongoing platform investments (passkeys, identifier-first, A/B testing).",
                "effort": "medium",
                "severity": "medium"
              }
            ]
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1–2 months",
            "items": [
              {
                "priority": 1,
                "findingId": "AUTH-RBAC-001",
                "action": "This tenant does not use the built-in Auth0 Roles feature for authorization. This is a valid architectural choice if a custom authorization model is in place (e.g. SAML attributes, application-managed claims, external authorization service, or permissions injected via Actions). Note: this tool cannot analyze the security or correctness of custom authorization logic. If you rely on a custom model, ensure it is documented, owned by a named team, and covered by your access-review process. If you intend to use Auth0 RBAC: define roles, enable RBAC enforcement on APIs that define permissions, and assign roles to users or groups rather than granting direct user permissions.",
                "expectedOutcome": "Makes authorization explicit and reviewable, improving entitlement governance.",
                "effort": "low",
                "severity": "low"
              },
              {
                "priority": 2,
                "findingId": "AUTH-TEN-001",
                "action": "Set friendly name, support email, support URL, and logo on tenant settings for production-readiness.",
                "expectedOutcome": "Improves trust signals and supportability during authentication flows.",
                "effort": "low",
                "severity": "low"
              },
              {
                "priority": 3,
                "findingId": "AUTH-TEN-003-B",
                "action": "Reduce idle session lifetime to <= 72h for standard CIAM apps.",
                "expectedOutcome": "Reduces re-use risk of long-idle sessions on shared devices.",
                "effort": "low",
                "severity": "low"
              },
              {
                "priority": 4,
                "findingId": "AUTH-UX-003",
                "action": "Configure a custom domain with TLS policy `recommended` for production tenants.",
                "expectedOutcome": "Strengthens brand trust during login and supports phishing-resistant patterns like passkeys.",
                "effort": "low",
                "severity": "low"
              }
            ]
          }
        ]
      }
    },
    "healthy": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "auth0",
        "product": "ciam",
        "displayName": "Auth0",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-01T10:00:00.000Z"
      },
      "tenant": {
        "primaryIdentifier": "healthy.us.auth0.com",
        "displayName": "Healthy Co",
        "kind": "tenant"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:37.584Z",
      "metadata": {
        "scanId": "scan_a1ddefb2efce"
      },
      "score": {
        "overall": 100,
        "grade": "A",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 100,
          "assessedMaxPoints": 100,
          "normalizedScore": 100,
          "unassessedWeight": 0,
          "productionEquivalent": {
            "observedScore": 100,
            "normalizedScore": 100,
            "overall": 100,
            "grade": "A"
          },
          "environmentAdjustedInterpretation": "No critical or high findings observed in the assessed scope."
        }
      },
      "categories": [
        {
          "id": "tenantBaseline",
          "name": "Tenant Baseline",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "applications",
          "name": "Applications / OAuth Clients",
          "weight": 15,
          "score": 15,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "connections",
          "name": "Connections / Identity Sources",
          "weight": 15,
          "score": 15,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apis",
          "name": "APIs / Resource Servers",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "rbac",
          "name": "RBAC / Authorization",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "actionsAndExtensibility",
          "name": "Actions & Extensibility",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "attackProtection",
          "name": "MFA & Attack Protection",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "monitoring",
          "name": "Monitoring & Log Streams",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "brandingAndLoginExperience",
          "name": "Branding & Login Experience",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "organizations",
          "name": "Organizations / B2B",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        }
      ],
      "findings": [],
      "opportunities": [],
      "coverage": {
        "partial": false,
        "missingScopes": [],
        "failedCollectors": [],
        "collectors": [
          {
            "collector": "tenant",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:tenant_settings"
            ]
          },
          {
            "collector": "clients",
            "status": "success",
            "count": 2,
            "requiredScopes": [
              "read:clients"
            ]
          },
          {
            "collector": "connections",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:connections"
            ]
          },
          {
            "collector": "resource_servers",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:resource_servers"
            ]
          },
          {
            "collector": "client_grants",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:client_grants"
            ]
          },
          {
            "collector": "roles",
            "status": "success",
            "count": 2,
            "requiredScopes": [
              "read:roles"
            ]
          },
          {
            "collector": "actions",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:actions"
            ]
          },
          {
            "collector": "rules",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:rules"
            ]
          },
          {
            "collector": "hooks",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:hooks"
            ]
          },
          {
            "collector": "organizations",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:organizations"
            ]
          },
          {
            "collector": "log_streams",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:log_streams"
            ]
          },
          {
            "collector": "attack_protection",
            "status": "success",
            "count": 3,
            "requiredScopes": [
              "read:attack_protection"
            ]
          },
          {
            "collector": "branding",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:branding"
            ]
          },
          {
            "collector": "prompts",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:prompts"
            ]
          },
          {
            "collector": "custom_domains",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:custom_domains"
            ]
          },
          {
            "collector": "guardian",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:guardian_factors"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized snapshot of tenant configuration. They reflect configuration posture, not runtime behavior or user activity.",
        "Severity is calibrated against typical CIAM/B2B production expectations. Sandbox or development tenants may intentionally relax some controls.",
        "Tenant environment was reported as **production**; severities have been adjusted accordingly. Production-equivalent severity is preserved alongside the adjusted value for transparency.",
        "Absence of a finding indicates that no rule triggered for the data observed; it does not by itself prove the absence of risk in unexamined areas.",
        "Recommendations cite Auth0 dashboard areas and Terraform fields where applicable so engineering teams can validate and apply changes consistently."
      ],
      "limitations": [
        "End-user behavior analytics, individual user risk scoring, and historical login telemetry are outside MVP scope.",
        "Tenant-side performance, billing, quota, and SLA posture are outside MVP scope.",
        "Automated remediation, write operations against Auth0, and code-side application security are outside MVP scope."
      ],
      "positiveSignals": [
        {
          "id": "auth0-collection-complete",
          "title": "Collector coverage completed as configured",
          "detail": "All configured Auth0 collectors completed without failed or skipped coverage."
        },
        {
          "id": "auth0-mfa-enabled",
          "title": "Tenant MFA policy is enabled",
          "detail": "Guardian policy is set to `all-applications`."
        },
        {
          "id": "auth0-attack-protection",
          "title": "Multiple attack protection controls are enabled",
          "detail": "Enabled controls: breached password detection, brute-force protection, suspicious IP throttling."
        },
        {
          "id": "auth0-log-stream-active",
          "title": "At least one log stream is active",
          "detail": "Auth0 is configured to push tenant events to an external destination."
        },
        {
          "id": "auth0-api-rbac",
          "title": "Custom API RBAC is enabled",
          "detail": "At least one custom API is configured with policy enforcement enabled."
        },
        {
          "id": "auth0-no-major-findings",
          "title": "No critical or high-severity findings observed",
          "detail": "The implemented Auth0 rules did not detect critical or high-severity posture issues in this scan."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0–7 days",
            "items": []
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2–4 weeks",
            "items": []
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1–2 months",
            "items": []
          }
        ]
      }
    },
    "partial": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "auth0",
        "product": "ciam",
        "displayName": "Auth0",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-01T10:00:00.000Z"
      },
      "tenant": {
        "primaryIdentifier": "partial.us.auth0.com",
        "displayName": "Partial Co",
        "kind": "tenant"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:37.839Z",
      "metadata": {
        "scanId": "scan_4644bbb57c0a"
      },
      "score": {
        "overall": 89,
        "grade": "B",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 78,
          "assessedMaxPoints": 80,
          "normalizedScore": 98,
          "unassessedWeight": 20,
          "productionEquivalent": {
            "observedScore": 78,
            "normalizedScore": 98,
            "overall": 89,
            "grade": "B"
          },
          "environmentAdjustedInterpretation": "No critical or high findings observed in the assessed scope."
        }
      },
      "categories": [
        {
          "id": "tenantBaseline",
          "name": "Tenant Baseline",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "applications",
          "name": "Applications / OAuth Clients",
          "weight": 15,
          "score": 15,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "connections",
          "name": "Connections / Identity Sources",
          "weight": 15,
          "score": 15,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apis",
          "name": "APIs / Resource Servers",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "rbac",
          "name": "RBAC / Authorization",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "actionsAndExtensibility",
          "name": "Actions & Extensibility",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "attackProtection",
          "name": "MFA & Attack Protection",
          "weight": 10,
          "score": null,
          "assessed": false,
          "findings": 0,
          "confidence": "low",
          "confidenceReason": "Not assessed because key collector(s) attack_protection (skipped)."
        },
        {
          "id": "monitoring",
          "name": "Monitoring & Log Streams",
          "weight": 10,
          "score": null,
          "assessed": false,
          "findings": 0,
          "confidence": "low",
          "confidenceReason": "Not assessed because key collector(s) log_streams (skipped)."
        },
        {
          "id": "brandingAndLoginExperience",
          "name": "Branding & Login Experience",
          "weight": 5,
          "score": 3,
          "assessed": true,
          "findings": 1,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "organizations",
          "name": "Organizations / B2B",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        }
      ],
      "findings": [
        {
          "id": "AUTH-COV-001",
          "fingerprint": "fp_dab9ed7aec0fd67f4bbeb868",
          "title": "Scan was partial — coverage is incomplete",
          "provider": "auth0",
          "category": "tenantBaseline",
          "severity": "info",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_a3faf96d1002ac66",
              "kind": "generic",
              "displayName": "rules",
              "masked": false
            },
            {
              "id": "res_7459ad135d875e63",
              "kind": "generic",
              "displayName": "hooks",
              "masked": false
            },
            {
              "id": "res_c62224947aee9710",
              "kind": "generic",
              "displayName": "log_streams",
              "masked": false
            },
            {
              "id": "res_d0038219c3fe5ce2",
              "kind": "generic",
              "displayName": "attack_protection",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Failed/skipped collectors: rules (skipped), hooks (skipped), log_streams (skipped), attack_protection (skipped). Missing scopes: read:rules, read:hooks, read:log_streams, read:attack_protection."
          },
          "businessRisk": "Unverified areas should be treated as unknown, not safe; absence of findings does not imply absence of risk.",
          "recommendation": "Re-run the scan with the missing Management API scopes granted to obtain full coverage.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 0,
          "productionEquivalentSeverity": "info",
          "environmentAdjustedSeverity": "info",
          "productionEquivalentScoreImpact": 0
        },
        {
          "id": "AUTH-UX-003",
          "fingerprint": "fp_2ba1dc439f60c9b58ed50666",
          "title": "No custom domain configured",
          "provider": "auth0",
          "category": "brandingAndLoginExperience",
          "severity": "low",
          "confidence": "medium",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_b36788a803a02580",
              "kind": "generic",
              "displayName": "auth0_custom_domain",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "0 custom domains."
          },
          "businessRisk": "Default tenant domain weakens branding and complicates phishing-resistant patterns like passkeys.",
          "recommendation": "Configure a custom domain with TLS policy `recommended` for production tenants.",
          "validationSteps": [
            "Provision a custom domain with TLS policy `recommended`",
            "Update applications to use the new domain"
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 2,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 2
        }
      ],
      "opportunities": [
        {
          "id": "OPP-AUTH-UX-003",
          "title": "Configure a custom domain with TLS policy `recommended` for production tenants.",
          "category": "brandingAndLoginExperience",
          "type": "ux-improvement",
          "description": "No custom domain configured. Default tenant domain weakens branding and complicates phishing-resistant patterns like passkeys.",
          "effort": "low",
          "relatedFindingId": "AUTH-UX-003"
        }
      ],
      "coverage": {
        "partial": true,
        "missingScopes": [
          "read:rules",
          "read:hooks",
          "read:log_streams",
          "read:attack_protection"
        ],
        "failedCollectors": [
          {
            "collector": "rules",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "read:rules"
            ]
          },
          {
            "collector": "hooks",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "read:hooks"
            ]
          },
          {
            "collector": "log_streams",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "read:log_streams"
            ]
          },
          {
            "collector": "attack_protection",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "read:attack_protection"
            ]
          }
        ],
        "collectors": [
          {
            "collector": "tenant",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:tenant_settings"
            ]
          },
          {
            "collector": "clients",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:clients"
            ]
          },
          {
            "collector": "connections",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:connections"
            ]
          },
          {
            "collector": "resource_servers",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:resource_servers"
            ]
          },
          {
            "collector": "client_grants",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:client_grants"
            ]
          },
          {
            "collector": "roles",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:roles"
            ]
          },
          {
            "collector": "actions",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:actions"
            ]
          },
          {
            "collector": "rules",
            "status": "skipped",
            "requiredScopes": [
              "read:rules"
            ],
            "missingScopes": [
              "read:rules"
            ]
          },
          {
            "collector": "hooks",
            "status": "skipped",
            "requiredScopes": [
              "read:hooks"
            ],
            "missingScopes": [
              "read:hooks"
            ]
          },
          {
            "collector": "organizations",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:organizations"
            ]
          },
          {
            "collector": "log_streams",
            "status": "skipped",
            "requiredScopes": [
              "read:log_streams"
            ],
            "missingScopes": [
              "read:log_streams"
            ]
          },
          {
            "collector": "attack_protection",
            "status": "skipped",
            "requiredScopes": [
              "read:attack_protection"
            ],
            "missingScopes": [
              "read:attack_protection"
            ]
          },
          {
            "collector": "branding",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:branding"
            ]
          },
          {
            "collector": "prompts",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:prompts"
            ]
          },
          {
            "collector": "custom_domains",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "read:custom_domains"
            ]
          },
          {
            "collector": "guardian",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "read:guardian_factors"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized snapshot of tenant configuration. They reflect configuration posture, not runtime behavior or user activity.",
        "Severity is calibrated against typical CIAM/B2B production expectations. Sandbox or development tenants may intentionally relax some controls.",
        "Tenant environment was reported as **production**; severities have been adjusted accordingly. Production-equivalent severity is preserved alongside the adjusted value for transparency.",
        "Absence of a finding indicates that no rule triggered for the data observed; it does not by itself prove the absence of risk in unexamined areas.",
        "Scan was partial. Categories whose key collectors did not run are reported as Not Assessed (score: N/A) rather than scored as clean.",
        "Recommendations cite Auth0 dashboard areas and Terraform fields where applicable so engineering teams can validate and apply changes consistently."
      ],
      "limitations": [
        "MFA & Attack Protection — Not assessed because key collector(s) attack_protection (skipped). Score reported as N/A (weight 10/100).",
        "Monitoring & Log Streams — Not assessed because key collector(s) log_streams (skipped). Score reported as N/A (weight 10/100).",
        "Collector `rules` — skipped: HTTP 403: missing scope",
        "Collector `hooks` — skipped: HTTP 403: missing scope",
        "Collector `log_streams` (Monitoring & Log Streams) — skipped: HTTP 403: missing scope",
        "Collector `attack_protection` (MFA & Attack Protection) — skipped: HTTP 403: missing scope",
        "Areas requiring missing Management API scopes: read:rules, read:hooks, read:log_streams, read:attack_protection.",
        "End-user behavior analytics, individual user risk scoring, and historical login telemetry are outside MVP scope.",
        "Tenant-side performance, billing, quota, and SLA posture are outside MVP scope.",
        "Automated remediation, write operations against Auth0, and code-side application security are outside MVP scope."
      ],
      "positiveSignals": [
        {
          "id": "auth0-mfa-enabled",
          "title": "Tenant MFA policy is enabled",
          "detail": "Guardian policy is set to `all-applications`."
        },
        {
          "id": "auth0-api-rbac",
          "title": "Custom API RBAC is enabled",
          "detail": "At least one custom API is configured with policy enforcement enabled."
        },
        {
          "id": "auth0-no-major-findings",
          "title": "No critical or high-severity findings observed",
          "detail": "The implemented Auth0 rules did not detect critical or high-severity posture issues in this scan."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0–7 days",
            "items": []
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2–4 weeks",
            "items": []
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1–2 months",
            "items": [
              {
                "priority": 1,
                "findingId": "AUTH-UX-003",
                "action": "Configure a custom domain with TLS policy `recommended` for production tenants.",
                "expectedOutcome": "Strengthens brand trust during login and supports phishing-resistant patterns like passkeys.",
                "effort": "low",
                "severity": "low"
              }
            ]
          }
        ]
      }
    }
  },
  "okta": {
    "risk": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "okta",
        "product": "workforce",
        "displayName": "Okta Workforce",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-18T10:00:00.000Z",
        "authMode": "ssws",
        "includeIdentifiers": false
      },
      "tenant": {
        "primaryIdentifier": "https://risky.okta.com",
        "displayName": "Risky Corp",
        "kind": "organization"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:38.087Z",
      "metadata": {
        "scanId": "scan_42116f38194e"
      },
      "score": {
        "overall": 80,
        "grade": "C",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 80,
          "assessedMaxPoints": 100,
          "normalizedScore": 80,
          "unassessedWeight": 0,
          "productionEquivalent": {
            "observedScore": 80,
            "normalizedScore": 80,
            "overall": 80,
            "grade": "C"
          },
          "environmentAdjustedInterpretation": "6 high-severity finding(s) require attention before relying on this Okta org for sensitive workforce access."
        }
      },
      "categories": [
        {
          "id": "orgBaseline",
          "name": "Org Baseline",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 1,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "usersAndLifecycle",
          "name": "Users & Lifecycle",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Users & Lifecycle remains bounded in MVP; group membership and lifecycle-source signals are sampled rather than exhaustively modeled."
        },
        {
          "id": "applicationsAndSSO",
          "name": "Applications & SSO",
          "weight": 15,
          "score": 11,
          "assessed": true,
          "findings": 2,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Applications & SSO uses sampled assignment topology and does not yet model every app-to-policy linkage in depth."
        },
        {
          "id": "policiesAndAuthentication",
          "name": "Policies & Authentication",
          "weight": 20,
          "score": 17,
          "assessed": true,
          "findings": 2,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apiAccessManagement",
          "name": "API Access Management",
          "weight": 10,
          "score": 9,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. API Access Management confirms collected authorization-server configuration, but several implemented checks still require architectural review rather than exhaustive client and entitlement modeling."
        },
        {
          "id": "adminAndPrivilegedAccess",
          "name": "Admin & Privileged Access",
          "weight": 10,
          "score": 8,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Admin & Privileged Access depends on role-assignment endpoint shape and bounded recent log evidence, so coverage is not yet exhaustive."
        },
        {
          "id": "networkAndDevicePosture",
          "name": "Network & Device Posture",
          "weight": 10,
          "score": 8,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Network & Device Posture does not yet include dedicated device-assurance collectors, so device-policy depth remains partial."
        },
        {
          "id": "federationAndExtensibility",
          "name": "Federation & Extensibility",
          "weight": 5,
          "score": 4,
          "assessed": true,
          "findings": 1,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "monitoringAndLogs",
          "name": "Monitoring & Logs",
          "weight": 10,
          "score": 3,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Monitoring & Logs is based on bounded recent system-log samples rather than long-range tenant telemetry."
        }
      ],
      "findings": [
        {
          "id": "OKTA-ORG-001",
          "fingerprint": "fp_78ddbcaaf969f2b5bd83c170",
          "title": "Okta org metadata is incomplete",
          "provider": "okta",
          "category": "orgBaseline",
          "severity": "low",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_b0a148af81873141",
              "kind": "generic",
              "displayName": "okta_org",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Missing org metadata: website.",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Sparse org metadata weakens operational clarity and increases the chance of environment confusion during incident response.",
          "recommendation": "Populate the org profile so administrators and downstream tooling can distinguish this org cleanly.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 0.5,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 0.5
        },
        {
          "id": "OKTA-APP-001",
          "fingerprint": "fp_adbf511b6a380a88f7063e0c",
          "title": "One or more Okta apps allow risky OAuth grant types",
          "provider": "okta",
          "category": "applicationsAndSSO",
          "severity": "high",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_0184e1d08c7e4d74",
              "kind": "generic",
              "displayName": "Legacy Workforce App",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy Workforce App: grants=authorization_code, implicit, refresh_token",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Legacy grants increase token leakage and credential phishing risk, especially when reused across multiple environments.",
          "recommendation": "Remove `implicit` and password-based grants where possible. Prefer authorization code + PKCE for interactive apps.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 3,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 3
        },
        {
          "id": "OKTA-APP-006",
          "fingerprint": "fp_1a1ae66e32b6ebd6d7e0ab14",
          "title": "Apps were collected but no app sign-on policies were identified",
          "provider": "okta",
          "category": "applicationsAndSSO",
          "severity": "medium",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_5432c3d866e6ad8d",
              "kind": "policy",
              "displayName": "okta_app_policy",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Active apps=1, app_sign_in_policies=0.",
            "confidenceReason": "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully."
          },
          "businessRisk": "Without app-specific sign-on policy coverage, assurance and reauthentication requirements can drift across workforce applications.",
          "recommendation": "Define app sign-on policies for sensitive workforce apps so assurance requirements are not left to defaults alone.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 1,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 1
        },
        {
          "id": "OKTA-POL-001",
          "fingerprint": "fp_c28251d3f0efd25121989d3a",
          "title": "No sign-on or app access policies were collected",
          "provider": "okta",
          "category": "policiesAndAuthentication",
          "severity": "medium",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_2c48b8d604a67c00",
              "kind": "policy",
              "displayName": "okta_policy",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Collected policies=0, global_session=0, app_sign_in=0.",
            "confidenceReason": "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully."
          },
          "businessRisk": "Without explicit session or app access policy coverage, sign-in behavior may be governed by defaults that are hard to review and harder to harden consistently.",
          "recommendation": "Confirm sign-on and app access policies exist and are assigned to the intended user/app populations.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 1,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 1
        },
        {
          "id": "OKTA-POL-002",
          "fingerprint": "fp_3104e48470cfff89caa194b2",
          "title": "No active strong authenticator was identified",
          "provider": "okta",
          "category": "policiesAndAuthentication",
          "severity": "high",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_7e50e20c03d7b32f",
              "kind": "generic",
              "displayName": "SMS",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Active authenticators=sms.",
            "confidenceReason": "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully."
          },
          "businessRisk": "Weak or absent strong authenticators leave sensitive sign-ins and step-up flows dependent on less resilient authentication factors.",
          "recommendation": "Enable and roll out at least one phishing-resistant or strong MFA authenticator such as Okta Verify FastPass or WebAuthn where appropriate.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 2.1,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 2.1
        },
        {
          "id": "OKTA-API-001",
          "fingerprint": "fp_1031888b73a1f0052ee50798",
          "title": "Custom authorization server lacks access policies",
          "provider": "okta",
          "category": "apiAccessManagement",
          "severity": "medium",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_db55a6cdc85bfebf",
              "kind": "generic",
              "displayName": "default",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "default: policies=0",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Authorization servers without explicit policies are harder to reason about and may not enforce intended client, user, or scope restrictions.",
          "recommendation": "Define access policies and rules for each custom authorization server so token issuance is constrained intentionally.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 1.5,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 1.5
        },
        {
          "id": "OKTA-ADM-001",
          "fingerprint": "fp_685a4f80a9d8fcf29c133855",
          "title": "Direct user assignments hold high-privilege Okta admin roles",
          "provider": "okta",
          "category": "adminAndPrivilegedAccess",
          "severity": "high",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_8f45afa060447498",
              "kind": "user",
              "displayName": "a...@risky.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "principal=a...@risky.example, role=SUPER_ADMIN",
            "confidenceReason": "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully."
          },
          "businessRisk": "Broad direct admin assignments increase blast radius and complicate access reviews, especially in large workforce tenants.",
          "recommendation": "Review whether privileged roles can be reduced, delegated through narrower custom roles, or assigned via governed groups instead of direct user grants.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 2.1,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 2.1
        },
        {
          "id": "OKTA-NET-001",
          "fingerprint": "fp_7164bce55353ce70ef5a552c",
          "title": "Trusted Origin uses insecure HTTP transport",
          "provider": "okta",
          "category": "networkAndDevicePosture",
          "severity": "high",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_a68aa1fbfe1bff40",
              "kind": "generic",
              "displayName": "Legacy Portal",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy Portal: origin=http://legacy.risky.example",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Insecure origins weaken browser-side trust boundaries and can expose sign-in or token exchange flows to interception.",
          "recommendation": "Restrict Trusted Origins to HTTPS endpoints outside local development and remove legacy HTTP entries.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 3,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 3
        },
        {
          "id": "OKTA-HOOK-001",
          "fingerprint": "fp_6dfe31d6538ee481d1b22fc2",
          "title": "Hook destination uses insecure transport",
          "provider": "okta",
          "category": "federationAndExtensibility",
          "severity": "high",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_840157a134645fa5",
              "kind": "generic",
              "displayName": "Legacy Event Hook",
              "masked": false
            },
            {
              "id": "res_9616d411e20419f6",
              "kind": "generic",
              "displayName": "Legacy Inline Hook",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Legacy Event Hook: uri=http://hooks.risky.example/event | Legacy Inline Hook: uri=http://hooks.risky.example/inline",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Unencrypted hook delivery can leak lifecycle or identity events and any attached credentials to network intermediaries.",
          "recommendation": "Move hook receivers to HTTPS endpoints and rotate any credentials previously exposed to insecure transport.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 3,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 3
        },
        {
          "id": "OKTA-MON-001",
          "fingerprint": "fp_90ae238a79f33bc2135961a4",
          "title": "No active Okta log stream",
          "provider": "okta",
          "category": "monitoringAndLogs",
          "severity": "high",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_c02f367fafa64f41",
              "kind": "generic",
              "displayName": "okta_log_stream",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Collected log streams=0, active_streams=0.",
            "confidenceReason": "The connector successfully queried log streams and found no active external destination configured."
          },
          "businessRisk": "Without externalized logs, investigations depend on limited in-product retention and make forensic reconstruction harder.",
          "recommendation": "Configure at least one active log stream to a SIEM or log analytics destination for retained security visibility.",
          "validationSteps": [
            "Open Reports -> Log Streaming.",
            "Confirm whether any log stream is active for the org.",
            "Create or re-enable a stream to your SIEM or analytics destination.",
            "Verify delivery health on the destination side.",
            "Re-run `zelto-pulse scan okta`."
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 10,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 10
        }
      ],
      "opportunities": [],
      "coverage": {
        "partial": false,
        "missingScopes": [],
        "failedCollectors": [],
        "collectors": [
          {
            "collector": "org",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.orgs.read"
            ]
          },
          {
            "collector": "features",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.features.read"
            ]
          },
          {
            "collector": "users",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.users.read"
            ]
          },
          {
            "collector": "groups",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "group_rules",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "apps",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.apps.read"
            ]
          },
          {
            "collector": "policies",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.policies.read"
            ]
          },
          {
            "collector": "authenticators",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.authenticators.read"
            ]
          },
          {
            "collector": "authorization_servers",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.authorizationServers.read"
            ]
          },
          {
            "collector": "admin_roles",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.roles.read"
            ]
          },
          {
            "collector": "network_zones",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.networkZones.read"
            ]
          },
          {
            "collector": "trusted_origins",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.trustedOrigins.read"
            ]
          },
          {
            "collector": "idps",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.idps.read"
            ]
          },
          {
            "collector": "event_hooks",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.eventHooks.read"
            ]
          },
          {
            "collector": "inline_hooks",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.inlineHooks.read"
            ]
          },
          {
            "collector": "log_streams",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.logStreams.read"
            ]
          },
          {
            "collector": "domains",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.domains.read"
            ]
          },
          {
            "collector": "system_log",
            "status": "success",
            "count": 4,
            "requiredScopes": [
              "okta.logs.read"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized, redacted snapshot of Okta configuration. They reflect configuration posture, not full runtime or user-behavior analytics.",
        "The connector remains read-only and bounded by default for users and logs to preserve local safety and keep scans tractable on large workforce tenants.",
        "Absence of a finding means no implemented rule triggered for the observed data; it does not prove the absence of risk in uncollected or out-of-scope areas.",
        "Org environment was reported as **production**; severities are adjusted for that environment while preserving production-equivalent risk in the score breakdown.",
        "When all configured collectors succeed, several categories may still rely on bounded or sampled analysis in the MVP rather than exhaustive relationship expansion.",
        "User-level risk scoring, full assignment graphs, and long-range behavior analytics remain outside the initial Okta MVP scope."
      ],
      "limitations": [
        "Full group membership expansion remains outside the current MVP.",
        "Full app assignment graph expansion remains outside the current MVP; assignment topology is sampled safely.",
        "Long-range system log analytics remain outside the current MVP; recent logs are bounded to a configurable window.",
        "Per-user risk scoring remains outside the current MVP.",
        "Device assurance and posture depth are not collected in the current MVP."
      ],
      "positiveSignals": [
        {
          "id": "okta-positive-1",
          "title": "Policies collected successfully",
          "detail": "Collected 0 policy object(s) across the core MVP policy types."
        },
        {
          "id": "okta-positive-2",
          "title": "Authenticators collected successfully",
          "detail": "Collected 1 authenticator record(s)."
        },
        {
          "id": "okta-positive-3",
          "title": "Authorization servers collected successfully",
          "detail": "Collected 1 authorization server(s) and related policy metadata."
        },
        {
          "id": "okta-positive-4",
          "title": "System Log API was accessible",
          "detail": "Collected 4 recent event(s) from the bounded system log window."
        },
        {
          "id": "okta-positive-5",
          "title": "Event hooks are present",
          "detail": "Collected 1 event hook(s)."
        },
        {
          "id": "okta-positive-6",
          "title": "No critical findings detected",
          "detail": "The current implemented Okta rule set did not identify any critical-severity issues in the assessed scope."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0-7 days",
            "items": [
              {
                "priority": 1,
                "findingId": "OKTA-MON-001",
                "action": "Configure an active Okta log stream to a monitored destination.",
                "expectedOutcome": "Security events leave the Okta tenant and can be retained, correlated, and alerted on externally.",
                "effort": "medium",
                "severity": "high",
                "validationStep": "Verify the log stream reports active/healthy in Okta and appears in a fresh scan."
              }
            ]
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2-4 weeks",
            "items": []
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1-2 months",
            "items": []
          }
        ]
      }
    },
    "healthy": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "okta",
        "product": "workforce",
        "displayName": "Okta Workforce",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-18T10:00:00.000Z",
        "authMode": "oauth",
        "includeIdentifiers": false
      },
      "tenant": {
        "primaryIdentifier": "https://healthy.okta.com",
        "displayName": "Healthy Corp",
        "kind": "organization"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:38.327Z",
      "metadata": {
        "scanId": "scan_d7bcbf214751"
      },
      "score": {
        "overall": 99,
        "grade": "A",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 99,
          "assessedMaxPoints": 100,
          "normalizedScore": 99,
          "unassessedWeight": 0,
          "productionEquivalent": {
            "observedScore": 99,
            "normalizedScore": 99,
            "overall": 99,
            "grade": "A"
          },
          "environmentAdjustedInterpretation": "No critical or high findings were observed in the assessed Okta scope."
        }
      },
      "categories": [
        {
          "id": "orgBaseline",
          "name": "Org Baseline",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "usersAndLifecycle",
          "name": "Users & Lifecycle",
          "weight": 10,
          "score": 9,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Users & Lifecycle remains bounded in MVP; group membership and lifecycle-source signals are sampled rather than exhaustively modeled."
        },
        {
          "id": "applicationsAndSSO",
          "name": "Applications & SSO",
          "weight": 15,
          "score": 15,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Applications & SSO uses sampled assignment topology and does not yet model every app-to-policy linkage in depth."
        },
        {
          "id": "policiesAndAuthentication",
          "name": "Policies & Authentication",
          "weight": 20,
          "score": 20,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apiAccessManagement",
          "name": "API Access Management",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. API Access Management confirms collected authorization-server configuration, but several implemented checks still require architectural review rather than exhaustive client and entitlement modeling."
        },
        {
          "id": "adminAndPrivilegedAccess",
          "name": "Admin & Privileged Access",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Admin & Privileged Access depends on role-assignment endpoint shape and bounded recent log evidence, so coverage is not yet exhaustive."
        },
        {
          "id": "networkAndDevicePosture",
          "name": "Network & Device Posture",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Network & Device Posture does not yet include dedicated device-assurance collectors, so device-policy depth remains partial."
        },
        {
          "id": "federationAndExtensibility",
          "name": "Federation & Extensibility",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "monitoringAndLogs",
          "name": "Monitoring & Logs",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Monitoring & Logs is based on bounded recent system-log samples rather than long-range tenant telemetry."
        }
      ],
      "findings": [
        {
          "id": "OKTA-USR-002",
          "fingerprint": "fp_a50713fdbecbf56da618c610",
          "title": "Active users have not logged in recently or have never logged in",
          "provider": "okta",
          "category": "usersAndLifecycle",
          "severity": "low",
          "confidence": "medium",
          "classification": "requires-validation",
          "affectedResources": [
            {
              "id": "res_e750ad3b29b89feb",
              "kind": "user",
              "displayName": "a...@healthy.example",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Inactive active users=1, threshold_days=90, never_logged_in=0, stale_logged_in=1, providers=unknown=1, sample_count=1, sample=a...@healthy.example.",
            "confidenceReason": "Inactive-user posture is derived from bounded user summaries and recent activity timestamps, so organizational context is required before treating it as excessive risk."
          },
          "businessRisk": "Dormant active workforce accounts can retain access long after their practical need has expired.",
          "recommendation": "Review inactive active accounts for entitlement reduction, deactivation, or lifecycle automation so dormant identities do not accumulate.",
          "validationSteps": [
            "Open Directory -> People and review the affected active accounts.",
            "Check whether never-login or stale users belong to demos, migrations, staged rollouts, or real workforce populations.",
            "Deactivate or clean up stale active users that are no longer needed.",
            "Confirm lifecycle automation or downstream source behavior where relevant.",
            "Re-run `zelto-pulse scan okta`."
          ],
          "falsePositiveNotes": [
            "In demo, migration, or staged rollout orgs, never-login users may be expected. In production, active never-login or stale users should be reviewed for lifecycle hygiene."
          ],
          "scoreImpact": 0.7,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 0.7
        },
        {
          "id": "OKTA-NET-002",
          "fingerprint": "fp_cf275f47947cbd7346895bbe",
          "title": "Configured network zones were not referenced by collected sign-on policies",
          "provider": "okta",
          "category": "networkAndDevicePosture",
          "severity": "low",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_28eacc5e6a445f86",
              "kind": "generic",
              "displayName": "HQ",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "HQ: type=IP, usage=unknown",
            "confidenceReason": "Zone usage is inferred from collected policy references and may not capture every legitimate network-control pattern in the tenant."
          },
          "businessRisk": "Unreferenced network zones add configuration noise and can create a false sense that network-based controls are actively enforcing policy.",
          "recommendation": "Review whether configured zones are still needed, and if they are, ensure sign-on or app policies actually reference them intentionally.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 0.4,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 0.4
        }
      ],
      "opportunities": [],
      "coverage": {
        "partial": false,
        "missingScopes": [],
        "failedCollectors": [],
        "collectors": [
          {
            "collector": "org",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.orgs.read"
            ]
          },
          {
            "collector": "features",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.features.read"
            ]
          },
          {
            "collector": "users",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.users.read"
            ]
          },
          {
            "collector": "groups",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "group_rules",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "apps",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.apps.read"
            ]
          },
          {
            "collector": "policies",
            "status": "success",
            "count": 2,
            "requiredScopes": [
              "okta.policies.read"
            ]
          },
          {
            "collector": "authenticators",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.authenticators.read"
            ]
          },
          {
            "collector": "authorization_servers",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.authorizationServers.read"
            ]
          },
          {
            "collector": "admin_roles",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.roles.read"
            ]
          },
          {
            "collector": "network_zones",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.networkZones.read"
            ]
          },
          {
            "collector": "trusted_origins",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.trustedOrigins.read"
            ]
          },
          {
            "collector": "idps",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.idps.read"
            ]
          },
          {
            "collector": "event_hooks",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.eventHooks.read"
            ]
          },
          {
            "collector": "inline_hooks",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.inlineHooks.read"
            ]
          },
          {
            "collector": "log_streams",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.logStreams.read"
            ]
          },
          {
            "collector": "domains",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.domains.read"
            ]
          },
          {
            "collector": "system_log",
            "status": "success",
            "count": 12,
            "requiredScopes": [
              "okta.logs.read"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized, redacted snapshot of Okta configuration. They reflect configuration posture, not full runtime or user-behavior analytics.",
        "The connector remains read-only and bounded by default for users and logs to preserve local safety and keep scans tractable on large workforce tenants.",
        "Absence of a finding means no implemented rule triggered for the observed data; it does not prove the absence of risk in uncollected or out-of-scope areas.",
        "Org environment was reported as **production**; severities are adjusted for that environment while preserving production-equivalent risk in the score breakdown.",
        "When all configured collectors succeed, several categories may still rely on bounded or sampled analysis in the MVP rather than exhaustive relationship expansion.",
        "User-level risk scoring, full assignment graphs, and long-range behavior analytics remain outside the initial Okta MVP scope."
      ],
      "limitations": [
        "Full group membership expansion remains outside the current MVP.",
        "Full app assignment graph expansion remains outside the current MVP; assignment topology is sampled safely.",
        "Long-range system log analytics remain outside the current MVP; recent logs are bounded to a configurable window.",
        "Per-user risk scoring remains outside the current MVP.",
        "Device assurance and posture depth are not collected in the current MVP."
      ],
      "positiveSignals": [
        {
          "id": "okta-positive-1",
          "title": "Policies collected successfully",
          "detail": "Collected 2 policy object(s) across the core MVP policy types."
        },
        {
          "id": "okta-positive-2",
          "title": "Authenticators collected successfully",
          "detail": "Collected 1 authenticator record(s)."
        },
        {
          "id": "okta-positive-3",
          "title": "Authorization servers collected successfully",
          "detail": "Collected 1 authorization server(s) and related policy metadata."
        },
        {
          "id": "okta-positive-4",
          "title": "System Log API was accessible",
          "detail": "Collected 12 recent event(s) from the bounded system log window."
        },
        {
          "id": "okta-positive-5",
          "title": "Network zones are configured",
          "detail": "Collected 1 network zone definition(s)."
        },
        {
          "id": "okta-positive-6",
          "title": "Event hooks are present",
          "detail": "Collected 1 event hook(s)."
        },
        {
          "id": "okta-positive-7",
          "title": "No critical findings detected",
          "detail": "The current implemented Okta rule set did not identify any critical-severity issues in the assessed scope."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0-7 days",
            "items": []
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2-4 weeks",
            "items": []
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1-2 months",
            "items": [
              {
                "priority": 1,
                "findingId": "OKTA-USR-002",
                "action": "Review active users that have never logged in or have become stale.",
                "expectedOutcome": "Dormant identities are either explained, deactivated, or removed from the active workforce population.",
                "effort": "medium",
                "severity": "low",
                "validationStep": "Confirm the affected active-user population is reduced or documented after lifecycle review."
              },
              {
                "priority": 2,
                "findingId": "OKTA-NET-002",
                "action": "Review configured network zones that were not referenced by collected sign-on policies.",
                "expectedOutcome": "Unused network zones are either removed or intentionally referenced by policy where needed.",
                "effort": "low",
                "severity": "low",
                "validationStep": "Confirm listed zones are either retired or tied to a documented enforcement path."
              }
            ]
          }
        ]
      }
    },
    "partial": {
      "schemaVersion": "1.0.0",
      "provider": {
        "id": "okta",
        "product": "workforce",
        "displayName": "Okta Workforce",
        "connectorVersion": "0.1.0",
        "collectedAt": "2026-05-18T10:00:00.000Z",
        "authMode": "oauth",
        "includeIdentifiers": false
      },
      "tenant": {
        "primaryIdentifier": "https://partial.okta.com",
        "displayName": "Partial Corp",
        "kind": "organization"
      },
      "environment": "production",
      "generatedAt": "2026-09-28T09:18:38.564Z",
      "metadata": {
        "scanId": "scan_4e2e69ee0c7b"
      },
      "score": {
        "overall": 99,
        "grade": "B",
        "maxScore": 100,
        "breakdown": {
          "observedScore": 79,
          "assessedMaxPoints": 80,
          "normalizedScore": 99,
          "unassessedWeight": 20,
          "productionEquivalent": {
            "observedScore": 79,
            "normalizedScore": 99,
            "overall": 99,
            "grade": "B"
          },
          "environmentAdjustedInterpretation": "1 high-severity finding(s) require attention before relying on this Okta org for sensitive workforce access."
        }
      },
      "categories": [
        {
          "id": "orgBaseline",
          "name": "Org Baseline",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "usersAndLifecycle",
          "name": "Users & Lifecycle",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Users & Lifecycle remains bounded in MVP; group membership and lifecycle-source signals are sampled rather than exhaustively modeled."
        },
        {
          "id": "applicationsAndSSO",
          "name": "Applications & SSO",
          "weight": 15,
          "score": 14,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Applications & SSO uses sampled assignment topology and does not yet model every app-to-policy linkage in depth."
        },
        {
          "id": "policiesAndAuthentication",
          "name": "Policies & Authentication",
          "weight": 20,
          "score": 20,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "apiAccessManagement",
          "name": "API Access Management",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 0,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. API Access Management confirms collected authorization-server configuration, but several implemented checks still require architectural review rather than exhaustive client and entitlement modeling."
        },
        {
          "id": "adminAndPrivilegedAccess",
          "name": "Admin & Privileged Access",
          "weight": 10,
          "score": null,
          "assessed": false,
          "findings": 0,
          "confidence": "low",
          "confidenceReason": "Not assessed because key collector(s) admin_roles (skipped)."
        },
        {
          "id": "networkAndDevicePosture",
          "name": "Network & Device Posture",
          "weight": 10,
          "score": 10,
          "assessed": true,
          "findings": 1,
          "confidence": "medium",
          "confidenceReason": "Key collectors succeeded with full data. Network & Device Posture does not yet include dedicated device-assurance collectors, so device-policy depth remains partial."
        },
        {
          "id": "federationAndExtensibility",
          "name": "Federation & Extensibility",
          "weight": 5,
          "score": 5,
          "assessed": true,
          "findings": 0,
          "confidence": "high",
          "confidenceReason": "Key collectors succeeded with full data."
        },
        {
          "id": "monitoringAndLogs",
          "name": "Monitoring & Logs",
          "weight": 10,
          "score": null,
          "assessed": false,
          "findings": 2,
          "confidence": "low",
          "confidenceReason": "Not assessed because key collector(s) log_streams (skipped), system_log (skipped)."
        }
      ],
      "findings": [
        {
          "id": "OKTA-APP-006",
          "fingerprint": "fp_1a1ae66e32b6ebd6d7e0ab14",
          "title": "Apps were collected but no app sign-on policies were identified",
          "provider": "okta",
          "category": "applicationsAndSSO",
          "severity": "medium",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_5432c3d866e6ad8d",
              "kind": "policy",
              "displayName": "okta_app_policy",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Active apps=1, app_sign_in_policies=0.",
            "confidenceReason": "The finding is directionally useful, but context or broader tenant evidence is still required to interpret it fully."
          },
          "businessRisk": "Without app-specific sign-on policy coverage, assurance and reauthentication requirements can drift across workforce applications.",
          "recommendation": "Define app sign-on policies for sensitive workforce apps so assurance requirements are not left to defaults alone.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 1,
          "productionEquivalentSeverity": "medium",
          "environmentAdjustedSeverity": "medium",
          "productionEquivalentScoreImpact": 1
        },
        {
          "id": "OKTA-NET-002",
          "fingerprint": "fp_cf275f47947cbd7346895bbe",
          "title": "Configured network zones were not referenced by collected sign-on policies",
          "provider": "okta",
          "category": "networkAndDevicePosture",
          "severity": "low",
          "confidence": "medium",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_28eacc5e6a445f86",
              "kind": "generic",
              "displayName": "HQ",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "HQ: type=IP, usage=unknown",
            "confidenceReason": "Zone usage is inferred from collected policy references and may not capture every legitimate network-control pattern in the tenant."
          },
          "businessRisk": "Unreferenced network zones add configuration noise and can create a false sense that network-based controls are actively enforcing policy.",
          "recommendation": "Review whether configured zones are still needed, and if they are, ensure sign-on or app policies actually reference them intentionally.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 0.4,
          "productionEquivalentSeverity": "low",
          "environmentAdjustedSeverity": "low",
          "productionEquivalentScoreImpact": 0.4
        },
        {
          "id": "OKTA-MON-001",
          "fingerprint": "fp_90ae238a79f33bc2135961a4",
          "title": "No active Okta log stream",
          "provider": "okta",
          "category": "monitoringAndLogs",
          "severity": "high",
          "confidence": "high",
          "classification": "confirmed-risk",
          "affectedResources": [
            {
              "id": "res_c02f367fafa64f41",
              "kind": "generic",
              "displayName": "okta_log_stream",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Collected log streams=0, active_streams=0.",
            "confidenceReason": "The connector successfully queried log streams and found no active external destination configured."
          },
          "businessRisk": "Without externalized logs, investigations depend on limited in-product retention and make forensic reconstruction harder.",
          "recommendation": "Configure at least one active log stream to a SIEM or log analytics destination for retained security visibility.",
          "validationSteps": [
            "Open Reports -> Log Streaming.",
            "Confirm whether any log stream is active for the org.",
            "Create or re-enable a stream to your SIEM or analytics destination.",
            "Verify delivery health on the destination side.",
            "Re-run `zelto-pulse scan okta`."
          ],
          "falsePositiveNotes": [],
          "scoreImpact": 10,
          "productionEquivalentSeverity": "high",
          "environmentAdjustedSeverity": "high",
          "productionEquivalentScoreImpact": 10
        },
        {
          "id": "OKTA-COV-001",
          "fingerprint": "fp_5efd476479c8cb66bcb13ed4",
          "title": "Scan was partial and some Okta areas were not fully assessed",
          "provider": "okta",
          "category": "monitoringAndLogs",
          "severity": "info",
          "confidence": "high",
          "classification": "advisory",
          "affectedResources": [
            {
              "id": "res_62b6c28ce78f0fdc",
              "kind": "generic",
              "displayName": "collection_status",
              "masked": false
            }
          ],
          "evidence": {
            "summary": "Unavailable collectors: admin_roles (skipped), log_streams (skipped), system_log (skipped). Missing scopes: okta.roles.read, okta.logStreams.read, okta.logs.read.",
            "confidenceReason": "The finding is based on directly collected configuration data in the scanned scope."
          },
          "businessRisk": "Uncollected areas cannot be interpreted as safe; missing evidence reduces confidence in the final score.",
          "recommendation": "Grant the missing read scopes and rerun with the expected read-only access before treating the report as complete posture coverage.",
          "validationSteps": [],
          "falsePositiveNotes": [],
          "scoreImpact": 0,
          "productionEquivalentSeverity": "info",
          "environmentAdjustedSeverity": "info",
          "productionEquivalentScoreImpact": 0
        }
      ],
      "opportunities": [],
      "coverage": {
        "partial": true,
        "missingScopes": [
          "okta.roles.read",
          "okta.logStreams.read",
          "okta.logs.read"
        ],
        "failedCollectors": [
          {
            "collector": "admin_roles",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "okta.roles.read"
            ]
          },
          {
            "collector": "log_streams",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "okta.logStreams.read"
            ]
          },
          {
            "collector": "system_log",
            "status": "skipped",
            "reason": "HTTP 403: missing scope",
            "missingScopes": [
              "okta.logs.read"
            ]
          }
        ],
        "collectors": [
          {
            "collector": "org",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.orgs.read"
            ]
          },
          {
            "collector": "features",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.features.read"
            ]
          },
          {
            "collector": "users",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.users.read"
            ]
          },
          {
            "collector": "groups",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "group_rules",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.groups.read"
            ]
          },
          {
            "collector": "apps",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.apps.read"
            ]
          },
          {
            "collector": "policies",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.policies.read"
            ]
          },
          {
            "collector": "authenticators",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.authenticators.read"
            ]
          },
          {
            "collector": "authorization_servers",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.authorizationServers.read"
            ]
          },
          {
            "collector": "admin_roles",
            "status": "skipped",
            "requiredScopes": [
              "okta.roles.read"
            ],
            "missingScopes": [
              "okta.roles.read"
            ]
          },
          {
            "collector": "network_zones",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.networkZones.read"
            ]
          },
          {
            "collector": "trusted_origins",
            "status": "success",
            "count": 1,
            "requiredScopes": [
              "okta.trustedOrigins.read"
            ]
          },
          {
            "collector": "idps",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.idps.read"
            ]
          },
          {
            "collector": "event_hooks",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.eventHooks.read"
            ]
          },
          {
            "collector": "inline_hooks",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.inlineHooks.read"
            ]
          },
          {
            "collector": "log_streams",
            "status": "skipped",
            "requiredScopes": [
              "okta.logStreams.read"
            ],
            "missingScopes": [
              "okta.logStreams.read"
            ]
          },
          {
            "collector": "domains",
            "status": "success",
            "count": 0,
            "requiredScopes": [
              "okta.domains.read"
            ]
          },
          {
            "collector": "system_log",
            "status": "skipped",
            "requiredScopes": [
              "okta.logs.read"
            ],
            "missingScopes": [
              "okta.logs.read"
            ]
          }
        ]
      },
      "assumptions": [
        "Findings are produced by deterministic rules over a normalized, redacted snapshot of Okta configuration. They reflect configuration posture, not full runtime or user-behavior analytics.",
        "The connector remains read-only and bounded by default for users and logs to preserve local safety and keep scans tractable on large workforce tenants.",
        "Absence of a finding means no implemented rule triggered for the observed data; it does not prove the absence of risk in uncollected or out-of-scope areas.",
        "Org environment was reported as **production**; severities are adjusted for that environment while preserving production-equivalent risk in the score breakdown.",
        "Scan included degraded collection. Categories whose key collectors failed, were skipped, or were missing are reported as Not Assessed (score: N/A); categories with partial key collector data remain scored with reduced confidence.",
        "When all configured collectors succeed, several categories may still rely on bounded or sampled analysis in the MVP rather than exhaustive relationship expansion.",
        "User-level risk scoring, full assignment graphs, and long-range behavior analytics remain outside the initial Okta MVP scope."
      ],
      "limitations": [
        "Admin & Privileged Access — Not assessed because key collector(s) admin_roles (skipped). Score reported as N/A (weight 10/100).",
        "Monitoring & Logs — Not assessed because key collector(s) log_streams (skipped), system_log (skipped). Score reported as N/A (weight 10/100).",
        "Collector `admin_roles` (Admin & Privileged Access) — skipped: HTTP 403: missing scope",
        "Collector `log_streams` (Monitoring & Logs) — skipped: HTTP 403: missing scope",
        "Collector `system_log` (Monitoring & Logs) — skipped: HTTP 403: missing scope",
        "Areas requiring missing Okta OAuth scopes: okta.roles.read, okta.logStreams.read, okta.logs.read.",
        "Full group membership expansion remains outside the current MVP.",
        "Full app assignment graph expansion remains outside the current MVP; assignment topology is sampled safely.",
        "Long-range system log analytics remain outside the current MVP; recent logs are bounded to a configurable window.",
        "Per-user risk scoring remains outside the current MVP.",
        "Device assurance and posture depth are not collected in the current MVP."
      ],
      "positiveSignals": [
        {
          "id": "okta-positive-1",
          "title": "Policies collected successfully",
          "detail": "Collected 1 policy object(s) across the core MVP policy types."
        },
        {
          "id": "okta-positive-2",
          "title": "Authenticators collected successfully",
          "detail": "Collected 1 authenticator record(s)."
        },
        {
          "id": "okta-positive-3",
          "title": "Authorization servers collected successfully",
          "detail": "Collected 0 authorization server(s) and related policy metadata."
        },
        {
          "id": "okta-positive-4",
          "title": "Network zones are configured",
          "detail": "Collected 1 network zone definition(s)."
        },
        {
          "id": "okta-positive-5",
          "title": "No critical findings detected",
          "detail": "The current implemented Okta rule set did not identify any critical-severity issues in the assessed scope."
        }
      ],
      "remediationPlan": {
        "buckets": [
          {
            "id": "immediate",
            "name": "Immediate",
            "window": "0-7 days",
            "items": [
              {
                "priority": 1,
                "findingId": "OKTA-MON-001",
                "action": "Configure an active Okta log stream to a monitored destination.",
                "expectedOutcome": "Security events leave the Okta tenant and can be retained, correlated, and alerted on externally.",
                "effort": "medium",
                "severity": "high",
                "validationStep": "Verify the log stream reports active/healthy in Okta and appears in a fresh scan."
              }
            ]
          },
          {
            "id": "shortTerm",
            "name": "Short Term",
            "window": "2-4 weeks",
            "items": []
          },
          {
            "id": "later",
            "name": "Later",
            "window": "1-2 months",
            "items": [
              {
                "priority": 2,
                "findingId": "OKTA-NET-002",
                "action": "Review configured network zones that were not referenced by collected sign-on policies.",
                "expectedOutcome": "Unused network zones are either removed or intentionally referenced by policy where needed.",
                "effort": "low",
                "severity": "low",
                "validationStep": "Confirm listed zones are either retired or tied to a documented enforcement path."
              }
            ]
          }
        ]
      }
    }
  }
};

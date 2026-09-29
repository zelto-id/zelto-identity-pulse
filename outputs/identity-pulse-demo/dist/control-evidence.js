window.PULSE_CONTROLS = {
  "auth0": {
    "risk": {
      "source": "fixtures/auth0/risky-tenant.snapshot.json",
      "provider": "auth0",
      "target": "risky.us.auth0.com",
      "collectedAt": "2026-05-01T10:00:00.000Z",
      "controls": [
        {
          "name": "Multi-factor authentication (MFA)",
          "collector": "guardian",
          "sourcePath": "guardian",
          "status": "Observed configuration",
          "settings": {
            "policy": "never",
            "factors": []
          },
          "note": "Configured policy and factors; runtime enforcement and enrollment have not been verified."
        },
        {
          "name": "Breached-password detection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.breached_password_detection",
          "status": "Observed configuration",
          "settings": {
            "enabled": false
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Brute-force protection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.brute_force_protection",
          "status": "Observed configuration",
          "settings": {
            "enabled": false
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Suspicious-IP throttling",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.suspicious_ip_throttling",
          "status": "Observed configuration",
          "settings": {
            "enabled": false
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Session policy",
          "collector": "tenant",
          "sourcePath": "tenant.session_lifetime / tenant.idle_session_lifetime",
          "status": "Observed configuration",
          "settings": {
            "session_lifetime": 8760,
            "idle_session_lifetime": 720
          },
          "note": "Lifetime values are in hours. Application-specific behavior has not been validated."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    },
    "healthy": {
      "source": "fixtures/auth0/healthy-tenant.snapshot.json",
      "provider": "auth0",
      "target": "healthy.us.auth0.com",
      "collectedAt": "2026-05-01T10:00:00.000Z",
      "controls": [
        {
          "name": "Multi-factor authentication (MFA)",
          "collector": "guardian",
          "sourcePath": "guardian",
          "status": "Observed configuration",
          "settings": {
            "policy": "all-applications",
            "factors": [
              {
                "name": "otp",
                "enabled": true
              }
            ]
          },
          "note": "Configured policy and factors; runtime enforcement and enrollment have not been verified."
        },
        {
          "name": "Breached-password detection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.breached_password_detection",
          "status": "Observed configuration",
          "settings": {
            "enabled": true,
            "shields": [
              "block",
              "admin_notification"
            ]
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Brute-force protection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.brute_force_protection",
          "status": "Observed configuration",
          "settings": {
            "enabled": true,
            "shields": [
              "block"
            ]
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Suspicious-IP throttling",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.suspicious_ip_throttling",
          "status": "Observed configuration",
          "settings": {
            "enabled": true
          },
          "note": "Configuration observation only; effectiveness has not been tested."
        },
        {
          "name": "Session policy",
          "collector": "tenant",
          "sourcePath": "tenant.session_lifetime / tenant.idle_session_lifetime",
          "status": "Observed configuration",
          "settings": {
            "session_lifetime": 168,
            "idle_session_lifetime": 72
          },
          "note": "Lifetime values are in hours. Application-specific behavior has not been validated."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    },
    "partial": {
      "source": "fixtures/auth0/partial-scope.snapshot.json",
      "provider": "auth0",
      "target": "partial.us.auth0.com",
      "collectedAt": "2026-05-01T10:00:00.000Z",
      "controls": [
        {
          "name": "Multi-factor authentication (MFA)",
          "collector": "guardian",
          "sourcePath": "guardian",
          "status": "Observed configuration",
          "settings": {
            "policy": "all-applications",
            "factors": [
              {
                "name": "otp",
                "enabled": true
              }
            ]
          },
          "note": "Configured policy and factors; runtime enforcement and enrollment have not been verified."
        },
        {
          "name": "Breached-password detection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.breached_password_detection",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Brute-force protection",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.brute_force_protection",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Suspicious-IP throttling",
          "collector": "attack_protection",
          "sourcePath": "attackProtection.suspicious_ip_throttling",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Session policy",
          "collector": "tenant",
          "sourcePath": "tenant.session_lifetime / tenant.idle_session_lifetime",
          "status": "Observed configuration",
          "settings": {
            "session_lifetime": 168,
            "idle_session_lifetime": 72
          },
          "note": "Lifetime values are in hours. Application-specific behavior has not been validated."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    }
  },
  "okta": {
    "risk": {
      "source": "fixtures/okta/risky-org.snapshot.json",
      "provider": "okta",
      "target": "https://risky.okta.com",
      "collectedAt": "2026-05-18T10:00:00.000Z",
      "controls": [
        {
          "name": "MFA authenticators",
          "collector": "authenticators",
          "sourcePath": "authenticators",
          "status": "Observed configuration",
          "settings": [
            {
              "key": "sms",
              "name": "SMS",
              "status": "ACTIVE"
            }
          ],
          "note": "Available authenticators do not prove MFA is required for all users or applications."
        },
        {
          "name": "Authentication policies",
          "collector": "policies",
          "sourcePath": "policies.all",
          "status": "Observed configuration",
          "settings": [],
          "note": "Policy inventory only. Rule conditions, enforcement and organizational approval are not verified. An empty list means no policies were returned in this fixture."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    },
    "healthy": {
      "source": "fixtures/okta/healthy-org.snapshot.json",
      "provider": "okta",
      "target": "https://healthy.okta.com",
      "collectedAt": "2026-05-18T10:00:00.000Z",
      "controls": [
        {
          "name": "MFA authenticators",
          "collector": "authenticators",
          "sourcePath": "authenticators",
          "status": "Observed configuration",
          "settings": [
            {
              "key": "okta_verify",
              "name": "Okta Verify",
              "status": "ACTIVE"
            }
          ],
          "note": "Available authenticators do not prove MFA is required for all users or applications."
        },
        {
          "name": "Authentication policies",
          "collector": "policies",
          "sourcePath": "policies.all",
          "status": "Observed configuration",
          "settings": [
            {
              "name": "Global Session",
              "type": "OKTA_SIGN_ON",
              "status": "ACTIVE",
              "rules": [
                {
                  "name": "Default",
                  "status": "ACTIVE"
                }
              ]
            },
            {
              "name": "App Sign-In",
              "type": "ACCESS_POLICY",
              "status": "ACTIVE",
              "rules": [
                {
                  "name": "Default",
                  "status": "ACTIVE"
                }
              ]
            }
          ],
          "note": "Policy inventory only. Rule conditions, enforcement and organizational approval are not verified. An empty list means no policies were returned in this fixture."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    },
    "partial": {
      "source": "fixtures/okta/partial-scope-org.snapshot.json",
      "provider": "okta",
      "target": "https://partial.okta.com",
      "collectedAt": "2026-05-18T10:00:00.000Z",
      "controls": [
        {
          "name": "MFA authenticators",
          "collector": "authenticators",
          "sourcePath": "authenticators",
          "status": "Observed configuration",
          "settings": [
            {
              "key": "okta_verify",
              "name": "Okta Verify",
              "status": "ACTIVE"
            }
          ],
          "note": "Available authenticators do not prove MFA is required for all users or applications."
        },
        {
          "name": "Authentication policies",
          "collector": "policies",
          "sourcePath": "policies.all",
          "status": "Observed configuration",
          "settings": [
            {
              "name": "Global Session",
              "type": "OKTA_SIGN_ON",
              "status": "ACTIVE",
              "rules": [
                {
                  "name": "Default",
                  "status": "ACTIVE"
                }
              ]
            }
          ],
          "note": "Policy inventory only. Rule conditions, enforcement and organizational approval are not verified. An empty list means no policies were returned in this fixture."
        },
        {
          "name": "Bot protection configuration",
          "collector": "not_collected",
          "sourcePath": "Not present in these fixtures",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        },
        {
          "name": "Approved organizational security policies",
          "collector": "not_collected",
          "sourcePath": "Not supplied",
          "status": "Not assessed",
          "settings": null,
          "note": "No collected settings are available for this control."
        }
      ]
    }
  }
};

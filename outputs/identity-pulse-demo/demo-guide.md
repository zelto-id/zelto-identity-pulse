# Identity Pulse — presentation guide

**Positioning:** See the risk. Trace the evidence. Decide what changes.

Identity Pulse turns identity-provider configuration into a local assessment that engineers can explain and stakeholders can use to prioritize work. Its current CLI supports Auth0 and Okta Workforce. The proposed workspace makes the same findings, evidence and limits easier to explore.

## Three-minute walkthrough

1. **Start with the assessment workspace.** Select Auth0 and the at-risk configuration. Show the current engine’s score, the critical/high findings and collector coverage. Explain that this is a synthetic sample, not a customer assessment.
2. **Open one finding.** Use “Brute-force protection is disabled.” Follow the evidence through business risk, recommendation and validation steps. The selling point is traceability from configuration to a decision.
3. **Switch to limited API permissions.** Highlight the partial-coverage notice and skipped collectors. A high score does not settle what was not collected.
4. **Show the action plan.** Engineers apply provider changes separately. Pulse recommends and reassesses; it does not push configuration changes.
5. **Play the animated data flow.** Show the provider boundary, local collection, normalized snapshot, deterministic analysis and report outputs. Switch to offline snapshot mode to illustrate the local analysis path.
6. **Open technical architecture.** Select an application read and toggle between request and response. Show scopes/authentication, pagination and the local collector contract. Use the 403 or 429 scenario for a technical audience.

## Messages by audience

| Audience | Message | Show |
| --- | --- | --- |
| Security / IAM leader | Prioritize review with explainable findings and visible assessment limits. | Score, findings, coverage |
| Identity engineer | Trace a result to configuration and review a recommended validation step. | Finding detail, technical inspector |
| Consultant / assessor | Use a repeatable local workflow with portable outputs. | API versus snapshot journey, JSON download |
| Business stakeholder | Translate configuration observations into business risk and an action plan. | Risk explanation and recommended priorities |

## Keep the promise precise

This is a read-only posture assessment workflow. The demo does not establish complete assurance, certify compliance, measure individual user risk or validate a real remediation. A hardened fixture is an independent example. The interactive workspace is proposed; the CLI capabilities shown beneath it already exist with documented limitations.

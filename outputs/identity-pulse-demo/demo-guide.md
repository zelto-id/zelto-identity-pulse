# Identity Pulse — presentation guide

**Positioning:** See the risk. Trace the evidence. Decide what changes.

Identity Pulse turns identity-provider configuration into a local assessment that engineers can explain and stakeholders can use to prioritize work. Its current CLI supports Auth0 and Okta Workforce. The proposed workspace makes the same findings, evidence and limits easier to explore, and adds clearly labeled Entra ID, Ping Identity and Keycloak previews.

## Three-minute walkthrough

1. **Choose Business User on the entry page.** Open Business view, then start the journey from the coach panel. This is the only audience-selection screen. Read the one-line introduction, then start with Auth0 and **Demo scenario → Security gaps found**. The explanation beneath the selectors makes clear that this is a fictional assessment, not a live scan.
2. **Start with NIS2 Material.** Show the prominent evidence-pack action and available/missing evidence checklist. Generate the sample pack and expand its sections. Approved organizational policies and completed remediation are not supplied; the pack does not certify compliance.
3. **Explain the business decisions.** Show priority findings, recommended actions and collection gaps. Open a leading decision card: the business impact and next decision come first, with original technical evidence available on demand.
4. **Open Action Plans and the **Incomplete assessment** scenario.** Owners and target dates are not recorded. Show how missing collection changes what can be concluded, even when the score in the technical report is high. The business workspace keeps the collection date visible.
5. **Return through “Change view” and choose Technical User.** The provider and sample stay selected. Inspect Coverage and Findings, then open the animated flow and its explicit stage progress.
6. **Open technical architecture.** Reopen “How to use this page” if needed, select an exchange and inspect request/response, scopes, authentication and failure handling. Use “Change view” to return to the two-choice entry page.

## Messages by audience

| Audience | Message | Show |
| --- | --- | --- |
| Security / IAM leader | Prioritize review with explainable findings and visible assessment limits. | Score, findings, coverage |
| Identity engineer | Trace a result to configuration and review a recommended validation step. | Finding detail, technical inspector |
| Consultant / assessor | Use a repeatable local workflow with portable outputs. | API versus snapshot journey, JSON download |
| Business stakeholder | Translate configuration observations into business risk and an action plan. | Risk explanation and recommended priorities |

## Keep the promise precise

This is a read-only posture assessment workflow. The demo does not establish complete assurance, certify compliance, measure individual user risk or validate a real remediation. A hardened fixture is an independent example. The interactive workspace is proposed. Auth0/Okta illustrate existing CLI capabilities with documented limitations. Entra ID, Ping Identity (PingOne customer example) and Keycloak are hand-authored previews: no connector, scoring or provider-specific API contract is implemented. Try each provider with **Security gaps found**, **Stronger controls** and **Incomplete assessment**; the helper text explains how to read the results.

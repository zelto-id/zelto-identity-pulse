# Identity Pulse presentation demo

A clickable product concept and two architecture diagrams, using the Zelto brand palette with an assessment workspace, animated system connections, and selectable technical payloads. The interaction depth follows the earlier One Elavon presentation.

## Brand palette

Colors were read from the live [zelto.id](https://zelto.id/) CSS variables on 2026-09-28: primary mint `#7ADDC6`, secondary purple `#83219B`, lime accent `#E1F297`, background `#141429`, and surface `#262659`. Derived indigo surfaces and light text maintain contrast throughout the workspace, dialogs, diagrams and payload inspector; red and amber retain their severity meanings.

## Open the demo

Open `offline/index.html` directly in a browser. It introduces Identity Pulse, NIS2 / KSC evidence preparation, a five-area interactive radar and S46 context. “Explore the demo” moves to the Business User or Tech SPOC choices. Both lead to `offline/workspace.html`; the diagrams are `offline/data-flow.html` and `offline/technical-flow.html`. Each page contains its own CSS and JavaScript; keep all four together so navigation works. No installation, external assets, account, token or API connection is needed. External guidance links need an internet connection. Clipboard support depends on the browser; selecting the payload text also works.

For a local preview of the editable sources:

```bash
python3 start-preview.py
```

Open http://127.0.0.1:8793. The server binds only to loopback. Stop it with Ctrl+C. If this port is already occupied by this demo, reuse that preview.

## What to explore

- **Entry page:** introduces the product with “From identity risk to NIS2 evidence.” The explorable radar adapts Zelto’s website concept: MFA, lifecycle, logs, S46 and evidence. Each button explains a preparation area, with keyboard operation, visible selection and an announced description. A short, non-looping sweep respects reduced-motion preferences. S46 context links to official guidance; no live connection, reporting integration or compliance verdict is claimed. “Explore the demo” leads to the Business User and Tech SPOC choices. “Change view” returns here; provider and sample selection are preserved.
- **Business workspace:** opens on NIS2 Material with a prominent sample evidence-pack action and a checklist separating available identity evidence from missing remediation and policy records. Priority findings, action counts and collection gaps use the original report. Leading findings have plain-language summaries and a next decision; original technical titles and evidence remain available in finding detail. The three sections are NIS2 Material, Findings and Action Plans. The collection date stays visible; technical diagrams are secondary, under “How the assessment works.”
- **Tech SPOC workspace:** retains Overview, Findings, Coverage, Action Plans and NIS2 Material, along with the numeric score, engine grade, classification, confidence, validation, JSON download and simulated assessment replay. Both audiences use the same six Auth0/Okta reports and nine additional illustrative examples. The new provider previews show no engine score or replay of a completed CLI assessment.
- **Animated flow:** provider selection; read-only API assessment, offline snapshot input, 403 permission gap, 401 abort and 429 retry; play/pause/replay; manual stage selection; a prominent Step X of Y indicator, explicit Completed/Current/Upcoming labels and contrasted active nodes. Diagrams reflow on mobile and suppress moving packets for reduced-motion preferences.
- **Technical architecture:** provider selection and Okta OAuth/SSWS modes; collection, errors and local reporting sequences; inspect requests, responses, authentication, state effects, payloads and implementation references. Play through each sequence or select a message. A dismissible four-step guide opens on the first visit and can be reopened with “How to use this page.”

## Providers and demo scenarios

**Demo scenario** replaces “Sample configuration.” The always-visible explanation says that choosing an example changes the fictional assessment shown; it does not scan or modify an environment. A second sentence updates with the selection:

- **Security gaps found:** review priority findings, business impact and recommended actions.
- **Stronger controls:** a separate example with stronger settings and fewer findings, not proof of compliance or completed remediation.
- **Incomplete assessment:** some settings could not be read; missing evidence remains unknown.

Microsoft Entra ID, Ping Identity and Keycloak are available throughout the workspace and both diagrams. Each has three hand-authored examples in `dist/provider-samples.js`, with distinct findings, recommended actions and illustrative control settings. The Ping example is explicitly scoped to PingOne customer identity, not PingFederate or the complete Ping portfolio. The new examples carry `demo.illustrative`, `connectorImplemented: false` and `schemaVersion: mockup-preview`; they are not production Report Contract v1 artifacts. Collection dates and scores are null rather than fabricated. JSON exports retain this provenance, and sample HTML evidence packs label every new provider as an illustrative preview with no implemented connector.

`dist/provider-journeys.js` provides proposed flows and technical design sequences for these three providers. No native API endpoints, payloads, OAuth scopes, supported versions or CLI commands are invented. Auth0/Okta sequences continue to describe the existing code. Provider and scenario context survive navigation, reload and a return through the role-selection screen.

The conceptual control vocabulary was checked against primary documentation: [Microsoft Entra authentication strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strength-how-it-works), [PingOne MFA policies](https://docs.pingidentity.com/pingone/authentication/p1_mfa_policies.html), [PingOne authentication policies](https://docs.pingidentity.com/pingone/authentication/p1_add_an_auth_policy.html), and the [Keycloak administration guide](https://www.keycloak.org/docs/latest/server_admin/). These references ground terminology only; the example findings, settings and proposed connector designs are authored mockup content, not vendor assessments.

## Sample evidence pack

In **NIS2 Material**, choose **Generate evidence pack**, expand the four preview sections, then **Download sample pack (HTML)**. The self-contained, print-friendly download contains scope and collector coverage; findings and unassessed areas; recommended actions with ownership/completion/evidence/verification gaps; and observed security settings from the matching synthetic snapshot (or explicitly fictional settings for the three provider previews). The preview and export use the same captured report. All sections are expanded in the downloaded document.

This is an implemented browser mockup of a proposed workflow, not an evidence-pack backend or CLI command. No owners, completed changes or validation outcomes are invented. Organizational policy documents and bot protection configuration are not supplied in these fixtures and are marked **Not assessed**. Available MFA, attack-protection, session and authentication-policy settings are observations, not proof of enforcement. The pack supports auditor review; it does not certify NIS2 compliance.

Only the audience preference and architecture-guide dismissal are saved in browser local storage, when available. No assessment data is stored there. Navigation also carries the audience, provider and sample in the page URL. The entry page does not bypass the choice based on a saved preference. These are presentation views, not access-control roles. If storage is disabled, navigation still works and the guide may appear again on a later visit.

## Business design rationale

The business view prioritizes four questions: what needs attention; what decision and accountable owner are needed; what evidence is available; and what remains unknown. NIS2 preparation is the first destination, with Findings and Action Plans alongside it. A posture score is available in the technical view and evidence pack, but is not presented as a business compliance score.

Priority counts include critical/high findings and distinguish confirmed configuration risks from validation/advisory review. Decision cards show up to three distinct assessment areas, ordered by severity and then classification; they do not change the rules or risk assessment. Action counts come from the report's remediation buckets, so advisory findings may still need review outside that plan. No owners, target dates, completion records or monetary impacts are invented.

[ENISA’s NIS2 implementation guidance](https://www.enisa.europa.eu/publications/nis2-technical-implementation-guidance) provides examples of evidence and mappings for its covered entities. It informed the evidence-oriented presentation. This mockup does not determine legal applicability or assess the full range of NIS2 obligations; an incomplete evidence checklist remains incomplete even for the hardened fixture.

## Provenance and scope

This is a local presentation artifact, not an implemented GUI for the CLI. The browser uses embedded synthetic reports and does not call identity-provider APIs or run the CLI. The Auth0/Okta sample scores, grades, findings, classifications, recommendations and coverage are generated from the six existing repository fixtures using the current CLI in a temporary working directory. API samples are simplified illustrations of the checked-in clients and collectors, not live captures or independently verified vendor contracts.

| Fixture | Score / grade | Findings | Reported partial coverage |
| --- | --- | --- | --- |
| Auth0 at risk | 15 / F | 25 | No |
| Auth0 hardened | 100 / A | 0 | No |
| Auth0 limited permissions | 89 / B | 2 | Yes |
| Okta at risk | 80 / C | 10 | No |
| Okta hardened | 99 / A | 2 | No |
| Okta limited permissions | 99 / B | 4 | Yes |

The scenario selector changes between independent fixtures, not before/after scans of one tenant. No remediation is claimed. Category values are weighted points (score / category weight), not percentages from the report. Provider scoring models differ; the UI preserves the engine’s numeric score and grade even when grade caps diverge from numeric bands. Some Okta findings have no generated validation steps; the UI explicitly displays that limitation.

Collection status is not a guarantee of exhaustive coverage. Current hardening work covers API origin/pagination safety, snapshot import validation, redaction and artifact privacy, rule semantics, confidence/scoring and coverage-aware reassessment. The technical inspector surfaces the relevant gaps. Optional framework mappings do not establish certification or compliance. Microsoft Entra ID, Ping Identity and Keycloak are selectable presentation previews only. Their connectors, rules and scoring are not implemented. Hosted SaaS, automatic remediation and continuous monitoring are not presented as implemented features.

## Edit and package

- `dist/`: editable HTML, shared styles, audience preferences, sample evidence export, walkthrough scripts, generated synthetic reports, allowlisted control evidence, a shared provider catalog, and separately authored provider previews.
- `offline/`: self-contained pages produced by `support/package.py`.
- `identity-pulse-demo.zip`: shareable offline pages and guide.
- `architecture-diagrams.md`: editable Mermaid architecture and sequence diagrams.
- `demo-guide.md`: presentation story and walkthrough.

Rebuild the underlying CLI only when regenerating the sample reports:

```bash
npm run build
python3 outputs/identity-pulse-demo/support/generate-samples.py
python3 outputs/identity-pulse-demo/support/generate-controls.py
python3 outputs/identity-pulse-demo/support/package.py
```

Run those commands from the repository root. Packaging alone can be run from any directory. It refreshes content-based revisions in source asset links for local preview caching, then inlines assets into the four portable pages. `generate-controls.py` projects only named MFA, attack-protection, session and policy fields from the six fixtures; it does not copy user identities or credentials. Provider, assessment target, collection date and collector status must match before settings are labeled observed. Existing sample reports were retained for this UI update. Fixture generation uses no provider credentials and reads no repository `.env` file; it invokes snapshot mode from a temporary working directory. Timestamps and scan IDs may change between generations, and time-sensitive rules can change their result.

## Validation

See `verification.md` for the checks performed for this artifact. Production TypeScript and provider behavior were not modified. The pre-existing verification-toolchain task remains open.

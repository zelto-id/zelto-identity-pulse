# Identity Pulse presentation demo

A clickable product concept and two architecture diagrams, using the Zelto brand palette with an assessment workspace, animated system connections, and selectable technical payloads. The interaction depth follows the earlier One Elavon presentation.

## Brand palette

Colors were read from the live [zelto.id](https://zelto.id/) CSS variables on 2026-09-28: primary mint `#7ADDC6`, secondary purple `#83219B`, lime accent `#E1F297`, background `#141429`, and surface `#262659`. Derived indigo surfaces and light text maintain contrast throughout the workspace, dialogs, diagrams and payload inspector; red and amber retain their severity meanings.

## Open the demo

Open `offline/index.html` directly in a browser. Its sibling pages are `offline/data-flow.html` and `offline/technical-flow.html`. Each page contains its own CSS and JavaScript; keep all three together so navigation works. No installation, external assets, account, token or API connection is needed. Clipboard support depends on the browser; selecting the payload text also works.

For a local preview of the editable sources:

```bash
python3 start-preview.py
```

Open http://127.0.0.1:8793. The server binds only to loopback. Stop it with Ctrl+C. If this port is already occupied by this demo, reuse that preview.

## What to explore

- **Assessment workspace:** Business User View opens by default with Findings, Action Plans and NIS2 Material. Tech SPOC View also includes Overview and Coverage, with evidence, classification, confidence and validation details. Both views use the same selected report. Auth0 or Okta; at-risk, hardened or limited-permission fixtures; score and engine grade; finding detail; search and severity filter; collector coverage; recommended action plan; sample JSON download; simulated assessment replay.
- **Animated flow:** provider selection; read-only API assessment, offline snapshot input, 403 permission gap, 401 abort and 429 retry; play/pause/replay; manual stage selection; a prominent Step X of Y indicator, explicit Completed/Current/Upcoming labels and contrasted active nodes. Diagrams reflow on mobile and suppress moving packets for reduced-motion preferences.
- **Technical architecture:** provider selection and Okta OAuth/SSWS modes; collection, errors and local reporting sequences; inspect requests, responses, authentication, state effects, payloads and implementation references. Play through each sequence or select a message. A dismissible four-step guide opens on the first visit and can be reopened with “How to use this page.”

## Sample evidence pack

In **NIS2 Material**, choose **Generate evidence pack**, expand the four preview sections, then **Download sample pack (HTML)**. The self-contained, print-friendly download contains scope and collector coverage; findings and unassessed areas; recommended actions with ownership/completion/evidence/verification gaps; and observed security settings from the matching synthetic snapshot. The preview and export use the same captured report. All sections are expanded in the downloaded document.

This is an implemented browser mockup of a proposed workflow, not an evidence-pack backend or CLI command. No owners, completed changes or validation outcomes are invented. Organizational policy documents and bot protection configuration are not supplied in these fixtures and are marked **Not assessed**. Available MFA, attack-protection, session and authentication-policy settings are observations, not proof of enforcement. The pack supports auditor review; it does not certify NIS2 compliance.

Only the audience preference and architecture-guide dismissal are saved in browser local storage, when available. No assessment data is stored there. Navigation also carries the audience in the page URL. If storage is disabled, navigation still works and the guide may appear again on a later visit.

## Provenance and scope

This is a local presentation artifact, not an implemented GUI for the CLI. The browser uses embedded synthetic reports and does not call identity-provider APIs or run the CLI. The sample scores, grades, findings, classifications, recommendations and coverage are generated from the six existing repository fixtures using the current CLI in a temporary working directory. API samples are simplified illustrations of the checked-in clients and collectors, not live captures or independently verified vendor contracts.

| Fixture | Score / grade | Findings | Reported partial coverage |
| --- | --- | --- | --- |
| Auth0 at risk | 15 / F | 25 | No |
| Auth0 hardened | 100 / A | 0 | No |
| Auth0 limited permissions | 89 / B | 2 | Yes |
| Okta at risk | 80 / C | 10 | No |
| Okta hardened | 99 / A | 2 | No |
| Okta limited permissions | 99 / B | 4 | Yes |

The scenario selector changes between independent fixtures, not before/after scans of one tenant. No remediation is claimed. Category values are weighted points (score / category weight), not percentages from the report. Provider scoring models differ; the UI preserves the engine’s numeric score and grade even when grade caps diverge from numeric bands. Some Okta findings have no generated validation steps; the UI explicitly displays that limitation.

Collection status is not a guarantee of exhaustive coverage. Current hardening work covers API origin/pagination safety, snapshot import validation, redaction and artifact privacy, rule semantics, confidence/scoring and coverage-aware reassessment. The technical inspector surfaces the relevant gaps. Optional framework mappings do not establish certification or compliance. Entra, Keycloak, hosted SaaS, automatic remediation and continuous monitoring are not presented as implemented features.

## Edit and package

- `dist/`: editable HTML, shared styles, audience preferences, sample evidence export, walkthrough scripts, generated synthetic reports and allowlisted control evidence.
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

Run those commands from the repository root. Packaging alone can be run from any directory. `generate-controls.py` projects only named MFA, attack-protection, session and policy fields from the six fixtures; it does not copy user identities or credentials. Provider, assessment target, collection date and collector status must match before settings are labeled observed. Existing sample reports were retained for this UI update. Fixture generation uses no provider credentials and reads no repository `.env` file; it invokes snapshot mode from a temporary working directory. Timestamps and scan IDs may change between generations, and time-sensitive rules can change their result.

## Validation

See `verification.md` for the checks performed for this artifact. Production TypeScript and provider behavior were not modified. The pre-existing verification-toolchain task remains open.

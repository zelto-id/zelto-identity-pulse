# Verification — 2026-09-28

## Scope

Presentation assets and README only. No production TypeScript, provider behavior, dependencies, scoring rules or active-task status were changed. All assessment inputs are existing synthetic repository fixtures; no live provider validation was performed.

## Checks performed

| Check | Result |
| --- | --- |
| `npm run build` | Passed, exit 0, Node v25.2.1 |
| Offline CLI report generation | All six Auth0/Okta fixtures produced JSON, exit 0 |
| JavaScript syntax | `node --check` passed for all four scripts and all packaged inline scripts |
| HTML structure/references | All three source pages and three portable pages: no duplicate IDs; local page/style/script references resolve |
| Packaging | Three self-contained HTML pages emitted; ZIP integrity check passed |
| README/reference and whitespace review | Presentation paths verified; `git diff --check` passed |

## Browser checks

Used the local loopback preview, without provider access.

- All six provider/scenario choices display the expected fixture score and finding count.
- Finding detail shows evidence, classification, confidence, business risk, recommendation and validation steps.
- A no-match finding search shows an empty state. Coverage displays missing scopes and skipped collectors. Action plans link to their findings.
- Assessment replay reaches completion and returns to the selected sample.
- All five animated paths can be stepped through to their final state; API playback starts; 401 stops the scan path. Provider selection, next/previous and stage selection are available.
- Collection, failure and local-report scenarios render payloads for Auth0 and Okta. Request/response switching updates the inspector. SSWS permission denial omits inferred OAuth missing scopes. Rate-limit recovery and authentication abort outcomes were inspected.
- Technical sequence playback starts and advances. Clipboard copy has a visible fallback when browser permissions do not allow it.
- Visual inspection covered the desktop assessment/dialog, animated flow and technical inspector, and mobile assessment/technical layouts.
- Layout measurements at 320px showed document width = scroll width on all three pages. The 390px assessment, flow and technical pages also fit the viewport. Desktop review used 1440px.
- No browser console errors were reported in the inspected preview states.

The browser tool blocks `file://` navigation, so direct-file execution of the offline pages was not browser-tested. Portable pages were statically checked for self-contained assets, inline script syntax and working relative page references. The same scripts and styles were exercised in the localhost preview. Clipboard permissions may differ when opened as local files.

No claim is made that the repository's pre-existing full unit-test suite, test type-check or lint issues have been repaired; task 045 remains open. Those production checks were not rerun for this presentation-only change.

## Zelto palette update — 2026-09-28

The five brand colors were verified from live zelto.id computed CSS variables and the local website stylesheet. Applied the indigo background/surface, mint primary, purple secondary and lime accent across all source pages, dialogs, semantic badges, diagrams, chart marks, favicons and editable Mermaid themes. Rebuilt all portable pages and the ZIP. Reviewed workspace/dialog and both diagrams in the browser; no console errors observed. Main text, muted text, primary buttons and severity badge color pairs meet 4.5:1 contrast. No behavior or production-code changes; no additional production build or unit-test run was necessary.

## Audience and evidence workflow — 2026-09-29

Implemented the requested feedback in the local presentation sources. Production CLI behavior, dependencies and active-task status remain unchanged.

- Business mode defaults to Findings, Action Plans and NIS2 Material. Tech mode preserves Overview, Findings, Coverage and Action Plans, and adds NIS2 Material. Switching retains the selected report and its score. Keyboard arrow navigation selects and focuses the corresponding tab.
- All six provider/scenario combinations were checked in the browser against the existing scores and finding totals above. Partial-coverage notices remain visible. Action plans show unassigned ownership and unverified remediation.
- Pack preview contains four expandable sections; the HTML export includes every section expanded. Script-level assertions exercised all six packs: one recommendation per finding, unknown remediation fields, absent bot-policy evidence, explicit false/true control settings, partial-coverage controls withheld, provider/target/date mismatches withheld, and HTML escaping of injected markup. The preview and export share the same captured pack.
- The download link has a Blob URL, HTML MIME type and a sample-labeled filename. Clicking updates its status without browser console errors. The in-app browser did not emit a download event, so writing the resulting file to the user's download folder could not be confirmed; exported HTML content and self-containment were verified separately in Node.
- Flow checks covered all five paths through their final states, manual stepping, timed playback to completion, replay/pause, completed/current/upcoming labels and the three-step 401 stop. Active nodes have textual current-stage badges. Reduced-motion code checks confirm the active connection remains visible and moving packets are omitted.
- The four-step architecture guide was checked on first visit, with Next/Back, completion, reopening, Escape dismissal and dismissal persistence after reload. The existing Okta SSWS 403 response still omits inferred OAuth missing scopes.
- Desktop review at 1440px and mobile review at 320px/390px covered the workspace, pack preview, flow and architecture guide. All three pages fit a 320px viewport without document-level horizontal overflow; the pack dialog also fits. Wide evidence tables scroll within their container.
- `npm run build` passed. Source and packaged inline JavaScript syntax, local references, duplicate IDs, ZIP integrity and `git diff --check` were checked after packaging. The unrelated production test-suite/toolchain work remains open; the full unit suite was not rerun for this mockup change.

Direct `file://` execution retains the browser-tool limitation documented above. Preferences and guide dismissal use guarded local storage; browser file-mode storage policies may cause the guide to reappear. No live provider or NIS2 compliance validation was performed.

## Entry page and business priorities — 2026-09-29

- Added `index.html` as a dedicated two-choice entry page and moved the application to `workspace.html`. Browser checks confirmed exactly two interactive controls on the entry page, including after reload with a saved audience. The workspace and both diagrams contain no audience toggle; “Change view” returns to the entry page.
- Business users land on NIS2 Material. Its large evidence panel and generation action appear before the metrics. The evidence checklist shows available configuration separately from missing organizational policies and remediation proof. The collection date is visible. No compliance percentage, financial estimate, assigned owner, deadline or verified completion was invented.
- Checked all six samples against source-derived priority, action and collection-gap counts. Priority summaries preserve confirmed/validation/advisory distinctions; decision cards select up to three distinct areas without mutating reports. Empty/hardened and limited-permission cases retain missing-evidence caveats. Plain-language search, finding details, action plans and pack preview were exercised.
- Provider and sample survive the entry-page handoff between Business User and Tech SPOC. Provider context also carries into the animated flow and technical inspector. A stale cached technical script was found during this check; explicit asset revisions now load the changed scripts/styles, and the packager strips query revisions when inlining them.
- Verified keyboard tab navigation in horizontal mobile and vertical desktop layouts, and reopened the architecture guide. Entry, business workspace, technical workspace and both diagrams were checked at 320px without document-level horizontal overflow. Visual review also covered 390px and 1440px; both choices remain visible on the compact mobile entry screen.
- `npm run build` passed. Node assertions covered six business summaries, priority selection, source immutability, escaping, original pack evidence and unknown verification state. Source/packaged JavaScript syntax, local references, duplicate IDs, four-page packaging, ZIP CRC and `git diff --check` passed. The unrelated full production test suite was not rerun.

The existing in-app download and direct-file testing limitations above remain. This iteration changes presentation and navigation only; no production CLI or provider behavior changed.


## Welcome clarity and additional providers — 2026-09-29

- The entry screen has a one-sentence product introduction and still contains only the two audience choices. Checked at desktop 1440 px and mobile 390/320 px. The audience choice remains on this page only.
- “Sample configuration” is now **Demo scenario**. An always-visible explanation distinguishes fictional examples from environment configuration; scenario-specific text explains security gaps, stronger controls and missing evidence. All 15 provider/scenario combinations were exercised in both Business and Tech SPOC workspaces.
- Auth0/Okta retain the six original scores and finding counts listed above. Entra ID, Ping Identity (explicit PingOne customer scope) and Keycloak each have three distinct illustrative examples. Each shows 2 findings for security gaps, 0 for stronger controls and 2 for incomplete assessment; no engine score or collection date is claimed.
- Provider/scenario selection survives changing audience through the entry screen and navigation to both diagrams. Finding detail, business action plans and the sample pack preview were exercised for a new provider. The selected provider also remains correct after page reload.
- All 25 provider/path combinations in the animated flow reached their final stage. Authentication failures stop at 3 stages; other paths have 6. Active SVG paths contained valid coordinates. Existing-provider behavior and proposed-provider behavior remain labeled separately.
- All 15 provider/technical-scenario combinations reached their final exchange with nonempty response panels. New-provider sequences say “Proposed design · not implemented” and contain no invented scan command or native API payload. Browser console checks reported no errors.
- Script-level checks validated all 15 evidence packs, original CLI metrics, one action per finding, explicit unassigned/unverified remediation, null scores and collection dates for previews, withheld controls for partial coverage, and withheld controls on a mismatched source. Proposed flows and all three failure variants were checked as pure data. Export HTML has no external assets or scripts. Existing browser download-save limitations described above still apply.
- Mobile checks found no horizontal document overflow at 320 px on the entry page, business workspace, flow and technical architecture; architecture also fit at 390 px. Desktop workspace and mobile entry/control screenshots were inspected. Temporary viewport overrides were reset after testing.
- All source JavaScript passed `node --check`; all four offline pages' combined inline JavaScript passed syntax checks. All eight HTML pages have unique IDs and valid local references; source asset revisions match their content hashes. Portable pages are self-contained and the ZIP passes CRC verification with all four HTML pages.
- `npm run build` and `git diff --check` passed. Production connectors, rules, scores, package dependencies and active task 045 were not changed. Browser `file://` testing remains unavailable under the tool's URL policy; portable files were validated statically rather than by bypassing that restriction.

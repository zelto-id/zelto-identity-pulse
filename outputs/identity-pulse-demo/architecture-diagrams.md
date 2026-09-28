# Identity Pulse — editable architecture diagrams

These diagrams describe the checked-in CLI at the time this demo was built. The interactive browser workspace is a proposed presentation layer. Credentials and payloads in the demo are placeholders or synthetic examples.

## Assessment architecture

```mermaid
%%{init: {"theme":"base","themeVariables":{"darkMode":true,"background":"#141429","primaryColor":"#262659","primaryTextColor":"#f5f5fb","primaryBorderColor":"#83219b","lineColor":"#7addc6","secondaryColor":"#222246","tertiaryColor":"#1c1c38","textColor":"#f5f5fb","clusterBkg":"#1c1c38","clusterBorder":"#83219b","edgeLabelBackground":"#141429","actorBkg":"#262659","actorBorder":"#83219b","actorTextColor":"#f5f5fb","signalColor":"#7addc6","signalTextColor":"#f5f5fb","labelBoxBkgColor":"#262659","labelTextColor":"#f5f5fb","loopTextColor":"#f5f5fb","noteBkgColor":"#222246","noteTextColor":"#e1f297","noteBorderColor":"#7addc6"}}}%%
flowchart LR
  Operator[Operator: settings and existing API token]
  Auth0[Auth0 Management API]
  Okta[Okta Management API]
  subgraph Local[Operator machine]
    CLI[Read-only provider connector]
    Snapshot[Normalized snapshot and collector status]
    Rules[Provider-specific deterministic rules]
    Report[Structured Report Contract v1]
    Render[HTML / Markdown / JSON]
    Saved[Optional redacted snapshot]
    Prior[Earlier JSON report]
    Compare[Delta comparison]
    Combined[Combined executive HTML]
    Other[Other provider JSON reports]
  end
  Operator --> CLI
  CLI -->|HTTPS GET + Bearer token| Auth0
  CLI -->|HTTPS GET + Bearer or SSWS| Okta
  Auth0 -->|Configuration JSON| CLI
  Okta -->|Configuration JSON| CLI
  CLI --> Snapshot
  Snapshot --> Rules
  Snapshot -. Explicit save .-> Saved
  Rules --> Report
  Report --> Render
  Prior --> Compare
  Report --> Compare
  Report --> Combined
  Other --> Combined
```

An alternate `--from-snapshot` path loads local JSON directly for analysis and skips provider collection. Current import validation and sanitization are incomplete; do not treat an arbitrary imported file as trusted evidence.

## Read-only API collection

```mermaid
%%{init: {"theme":"base","themeVariables":{"darkMode":true,"background":"#141429","primaryColor":"#262659","primaryTextColor":"#f5f5fb","primaryBorderColor":"#83219b","lineColor":"#7addc6","secondaryColor":"#222246","tertiaryColor":"#1c1c38","textColor":"#f5f5fb","clusterBkg":"#1c1c38","clusterBorder":"#83219b","edgeLabelBackground":"#141429","actorBkg":"#262659","actorBorder":"#83219b","actorTextColor":"#f5f5fb","signalColor":"#7addc6","signalTextColor":"#f5f5fb","labelBoxBkgColor":"#262659","labelTextColor":"#f5f5fb","loopTextColor":"#f5f5fb","noteBkgColor":"#222246","noteTextColor":"#e1f297","noteBorderColor":"#7addc6"}}}%%
sequenceDiagram
  actor Operator
  participant CLI as Local Pulse CLI
  participant API as Auth0 or Okta API
  participant Analyzer as Local analyzer
  participant Files as Local files
  Operator->>CLI: Provider, environment, existing token, output settings
  CLI->>API: HTTPS GET configuration endpoint
  API-->>CLI: 200 JSON configuration
  opt Another page is available
    CLI->>API: GET next offset page or Link URL
    API-->>CLI: JSON resource page
  end
  CLI->>CLI: Normalize CollectorResult and provider snapshot
  CLI->>Analyzer: Snapshot and business/environment context
  Analyzer-->>CLI: Findings, evidence, confidence, score and coverage
  CLI->>Files: Write selected report formats
  opt Snapshot save explicitly requested
    CLI->>Files: Save snapshot using current redaction policy
  end
```

Auth0 app collection uses `/api/v2/clients` with `page`, `per_page` and `include_totals=false`. Okta app collection uses `/api/v1/apps?limit=200`, then follows `Link: rel="next"`. These are implementation examples; endpoint-dependent fields and collection bounds vary. The current Okta next-link path lacks an origin guard; task 046 tracks that issue and related HTTP safety work.

## Error and interpretation boundaries

```mermaid
%%{init: {"theme":"base","themeVariables":{"darkMode":true,"background":"#141429","primaryColor":"#262659","primaryTextColor":"#f5f5fb","primaryBorderColor":"#83219b","lineColor":"#7addc6","secondaryColor":"#222246","tertiaryColor":"#1c1c38","textColor":"#f5f5fb","clusterBkg":"#1c1c38","clusterBorder":"#83219b","edgeLabelBackground":"#141429","actorBkg":"#262659","actorBorder":"#83219b","actorTextColor":"#f5f5fb","signalColor":"#7addc6","signalTextColor":"#f5f5fb","labelBoxBkgColor":"#262659","labelTextColor":"#f5f5fb","loopTextColor":"#f5f5fb","noteBkgColor":"#222246","noteTextColor":"#e1f297","noteBorderColor":"#7addc6"}}}%%
flowchart TD
  Read[Provider read] --> Result{HTTP result}
  Result -->|200| Normalize[Normalize collected data]
  Result -->|401| Stop[Raise AuthenticationError and abort scan]
  Result -->|403| Skip[Mark collector skipped and record access gap]
  Result -->|404| Unavailable[Mark feature or endpoint unavailable]
  Result -->|429 / 5xx| Retry[Bounded retry with header delay or backoff]
  Retry -->|Success| Normalize
  Retry -->|Exhausted| Failed[Record failed collector]
  Normalize --> Assessment[Analyze available evidence]
  Skip --> Assessment
  Unavailable --> Assessment
  Failed --> Assessment
  Assessment --> Report[Score + findings + coverage + limitations]
  Report --> Review[Engineer reviews scope and context]
```

Missing data is not a passed control. Current nested-collector coverage and delta resolution semantics need further hardening. A finding absent in a later report does not, by itself, prove remediation.

## Code reference map

Paths are relative to the repository root.

| Concern | Implementation |
| --- | --- |
| Auth0 HTTP and pagination | `src/connectors/auth0/auth0.client.ts` |
| Auth0 resource reads and status handling | `src/connectors/auth0/auth0.collectors.ts` |
| Okta HTTP, authentication and Link pagination | `src/connectors/okta/okta.client.ts` |
| Okta resource reads and normalization | `src/connectors/okta/okta.collectors.ts` |
| CollectorResult / coverage | `src/core/schema.ts` |
| Provider analysis | `src/analysis/auth0/`, `src/analysis/okta/` |
| Structured JSON report | `src/reporting/json/report-contract.types.ts` |
| Delta comparison | `src/reporting/delta/delta-compare.ts` |
| Combined summary | `src/reporting/combined/combined-summary.ts` |
| Current limitations and backlog | `agentic/tasks/ASSESSMENT-2026-09-26.md` |

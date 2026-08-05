import {
  CombinedExecutiveSummaryV1,
  CombinedFindingRef,
  CombinedProviderSummary,
  CombinedRemediationPriority,
  CombinedRiskTheme,
  SeverityCounts
} from "../combined/combined-summary.types";
import { Severity } from "../markdown/report.types";

function redactSensitiveText(value: string): string {
  return value
    .replace(
      /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
      "[REDACTED_PRIVATE_KEY]"
    )
    .replace(
      /(authorization\s*[:=]\s*bearer\s+)[A-Za-z0-9._~+/=-]+/gi,
      "$1[REDACTED]"
    )
    .replace(
      /\b(access[_-]?token|api[_-]?token|refresh[_-]?token|client[_-]?secret|password|private[_-]?key|session|cookie)(\s*[:=]\s*)(["']?)[^"'\s<>&]+/gi,
      "$1$2$3[REDACTED]"
    );
}

function esc(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  return redactSensitiveText(String(value))
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CSS = `
:root {
  --bg: #0c111d;
  --surface: #151d2e;
  --surface2: #1e293f;
  --border: #31405f;
  --text: #e7edf7;
  --muted: #94a3b8;
  --accent: #5eead4;
  --critical: #fb7185;
  --high: #fb923c;
  --medium: #facc15;
  --low: #38bdf8;
  --info: #94a3b8;
}
*, *::before, *::after { box-sizing: border-box; }
body {
  background:
    radial-gradient(circle at 15% 0%, rgba(94,234,212,.18), transparent 28%),
    linear-gradient(135deg, #0c111d 0%, #111827 100%);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.55;
  margin: 0;
}
.topbar {
  align-items: center;
  background: rgba(12,17,29,.92);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 18px;
  padding: 12px 24px;
  position: sticky;
  top: 0;
}
.brand { color: var(--accent); font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
nav { display: flex; flex-wrap: wrap; gap: 8px; }
nav a { color: var(--muted); font-size: .88em; padding: 3px 7px; text-decoration: none; }
main { margin: 0 auto; max-width: 1180px; padding: 34px 24px 80px; }
h1 { font-size: 2.1em; line-height: 1.1; margin: 0 0 8px; }
h2 { border-bottom: 1px solid var(--border); font-size: 1.3em; margin-top: 42px; padding-bottom: 8px; }
h3 { font-size: 1em; margin: 0 0 8px; }
p { margin: 0 0 10px; }
.muted { color: var(--muted); }
.hero {
  align-items: stretch;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(260px, 1.35fr) minmax(240px, .65fr);
}
.panel, .card {
  background: rgba(21,29,46,.92);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
}
.score { font-size: 3.2em; font-weight: 900; line-height: 1; }
.score small { color: var(--muted); font-size: .33em; font-weight: 700; }
.stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-top: 18px; }
.stat { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 13px; }
.stat-value { font-size: 1.75em; font-weight: 850; line-height: 1; }
.stat-label { color: var(--muted); font-size: .76em; letter-spacing: .06em; margin-top: 4px; text-transform: uppercase; }
.grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; font-size: .9em; width: 100%; }
thead th { background: var(--surface2); color: var(--muted); font-size: .78em; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
th, td { border-bottom: 1px solid var(--border); padding: 9px 10px; vertical-align: top; }
.badge {
  border: 1px solid var(--border);
  border-radius: 999px;
  display: inline-block;
  font-size: .72em;
  font-weight: 850;
  letter-spacing: .06em;
  margin: 2px 4px 2px 0;
  padding: 2px 8px;
  text-transform: uppercase;
}
.sev-critical { color: var(--critical); }
.sev-high { color: var(--high); }
.sev-medium { color: var(--medium); }
.sev-low { color: var(--low); }
.sev-info { color: var(--info); }
.theme, .priority { margin-bottom: 14px; }
.theme-header, .priority-header { align-items: center; display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; }
.finding-id { color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .86em; }
ul { margin: 8px 0 0; padding-left: 18px; }
li { margin: 4px 0; }
@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; }
  main { padding: 24px 16px 60px; }
  .topbar { align-items: flex-start; flex-direction: column; }
}
`;

export function renderCombinedExecutiveSummaryHtml(
  summary: CombinedExecutiveSummaryV1
): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Zelto Identity Pulse Combined Executive Summary</title>
  <style>${CSS}</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">Zelto Identity Pulse</div>
    <nav>
      <a href="#summary">Summary</a>
      <a href="#providers">Providers</a>
      <a href="#priorities">Priorities</a>
      <a href="#themes">Risk Themes</a>
      <a href="#coverage">Coverage</a>
      <a href="#methodology">Methodology</a>
    </nav>
  </header>
  <main>
    ${renderHero(summary)}
    ${renderWarnings(summary.warnings)}
    ${renderProviderComparison(summary.providerComparison)}
    ${renderPriorities(summary.unifiedRemediationPriorities)}
    ${renderRiskThemes(summary.crossProviderRiskThemes)}
    ${renderPositiveSignals(summary)}
    ${renderCoverageAndLimitations(summary)}
    ${renderMethodology(summary)}
  </main>
</body>
</html>`;
}

function renderHero(summary: CombinedExecutiveSummaryV1): string {
  const exec = summary.executiveSummary;
  return `<section id="summary" class="hero">
    <div class="panel">
      <h1>Combined Identity Posture Summary</h1>
      <p class="muted">Generated ${esc(summary.generatedAt)} from ${esc(exec.reportCount)} local Report Contract v1 JSON reports.</p>
      <div class="stats">
        <div class="stat"><div class="stat-value">${esc(exec.providerCount)}</div><div class="stat-label">Providers</div></div>
        <div class="stat"><div class="stat-value">${esc(exec.totalFindings)}</div><div class="stat-label">Total Findings</div></div>
        <div class="stat"><div class="stat-value sev-${esc(exec.highestSeverity)}">${esc(exec.highestSeverity)}</div><div class="stat-label">Highest Severity</div></div>
        <div class="stat"><div class="stat-value">${esc(exec.criticalOrHighFindings)}</div><div class="stat-label">Critical/High</div></div>
      </div>
    </div>
    <div class="panel">
      <h3>Average Score</h3>
      <div class="score">${esc(exec.averageScore)}<small>/100</small></div>
      <p class="muted">Range: ${esc(exec.lowestScore)} to ${esc(exec.highestScore)}. Environments: ${esc(exec.environments.join(", "))}.</p>
      ${
        exec.partialCoverage
          ? `<p class="sev-medium">At least one provider report had partial coverage.</p>`
          : `<p class="muted">All provider reports claim complete collector coverage.</p>`
      }
    </div>
  </section>`;
}

function renderWarnings(warnings: string[]): string {
  if (warnings.length === 0) return "";
  return `<section class="panel" style="margin-top: 18px;">
    <h3>Warnings</h3>
    ${renderList(warnings)}
  </section>`;
}

function renderProviderComparison(providers: CombinedProviderSummary[]): string {
  return `<section id="providers">
    <h2>Provider Comparison</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Tenant</th>
            <th>Environment</th>
            <th>Score</th>
            <th>Findings</th>
            <th>Coverage</th>
            <th>Lowest categories</th>
          </tr>
        </thead>
        <tbody>
          ${providers.map(renderProviderRow).join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

function renderProviderRow(provider: CombinedProviderSummary): string {
  const lowestCategories = provider.categoryScores
    .slice(0, 3)
    .map((category) =>
      `${category.name}: ${category.assessed ? category.score : "N/A"}`
    );

  return `<tr>
    <td><strong>${esc(provider.providerDisplayName)}</strong><br><span class="muted">${esc(provider.product)}</span></td>
    <td>${esc(provider.tenantDisplayName)}</td>
    <td>${esc(provider.environment)}</td>
    <td><strong>${esc(provider.score)}</strong>/100<br><span class="muted">Grade ${esc(provider.grade)}</span></td>
    <td>${renderSeverityCounts(provider.findingCounts)}</td>
    <td>${provider.coverage.partial ? "Partial" : "Complete"}<br><span class="muted">${esc(provider.coverage.failedCollectors)} failed, ${esc(provider.coverage.missingScopes.length)} missing scopes</span></td>
    <td>${renderList(lowestCategories, "No assessed categories.")}</td>
  </tr>`;
}

function renderPriorities(priorities: CombinedRemediationPriority[]): string {
  return `<section id="priorities">
    <h2>Unified Remediation Priorities</h2>
    ${
      priorities.length === 0
        ? `<p class="muted">No medium-or-higher remediation priorities were identified across the input reports.</p>`
        : priorities.map(renderPriority).join("")
    }
  </section>`;
}

function renderPriority(priority: CombinedRemediationPriority): string {
  return `<article class="card priority">
    <div class="priority-header">
      <h3>${esc(priority.priority)}. ${esc(priority.title)}</h3>
      <span class="badge sev-${esc(priority.severity)}">${esc(priority.severity)}</span>
    </div>
    <p class="muted">${esc(priority.rationale)}</p>
    <p><strong>Providers:</strong> ${esc(priority.providers.join(", "))}</p>
    <div class="grid">
      <div>
        <h3>Actions</h3>
        ${renderList(priority.actions)}
      </div>
      <div>
        <h3>Validation</h3>
        ${renderList(priority.expectedOutcomes)}
      </div>
    </div>
    ${renderFindingTable(priority.relatedFindings)}
  </article>`;
}

function renderRiskThemes(themes: CombinedRiskTheme[]): string {
  return `<section id="themes">
    <h2>Cross-Provider Risk Themes</h2>
    ${
      themes.length === 0
        ? `<p class="muted">No findings were present in the input reports.</p>`
        : themes.map(renderTheme).join("")
    }
  </section>`;
}

function renderTheme(theme: CombinedRiskTheme): string {
  return `<article class="card theme">
    <div class="theme-header">
      <h3>${esc(theme.title)}</h3>
      <span class="badge sev-${esc(theme.severity)}">${esc(theme.severity)}</span>
    </div>
    <p class="muted">${esc(theme.findingCount)} finding(s) across ${esc(theme.providerCount)} provider report(s). Score impact: ${esc(theme.totalScoreImpact)}.</p>
    <p><strong>Providers:</strong> ${esc(theme.providers.join(", "))}</p>
    <p><strong>Risk:</strong> ${esc(theme.summary)}</p>
    <p><strong>Recommended direction:</strong> ${esc(theme.recommendation)}</p>
    ${renderFindingTable(theme.findings.slice(0, 8))}
  </article>`;
}

function renderFindingTable(findings: CombinedFindingRef[]): string {
  if (findings.length === 0) return `<p class="muted">No related findings.</p>`;

  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Provider</th>
          <th>Finding</th>
          <th>Severity</th>
          <th>Category</th>
          <th>Traceability</th>
        </tr>
      </thead>
      <tbody>
        ${findings
          .map(
            (finding) => `<tr>
              <td>${esc(finding.providerDisplayName)}</td>
              <td>${esc(finding.title)}<br><span class="finding-id">${esc(finding.id)}</span></td>
              <td><span class="sev-${esc(finding.severity)}">${esc(finding.severity)}</span></td>
              <td>${esc(finding.category)}</td>
              <td><span class="finding-id">${esc(finding.fingerprint)}</span><br><span class="muted">${esc(finding.affectedResourceCount)} affected resource(s)</span></td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderPositiveSignals(summary: CombinedExecutiveSummaryV1): string {
  return `<section>
    <h2>Positive Signals</h2>
    ${
      summary.positiveSignals.length === 0
        ? `<p class="muted">No positive signals were recorded in the input reports.</p>`
        : `<div class="grid">${summary.positiveSignals
            .slice(0, 12)
            .map(
              (signal) => `<div class="card">
                <h3>${esc(signal.title)}</h3>
                <p class="muted">${esc(signal.providerDisplayName)}</p>
                <p>${esc(signal.detail)}</p>
              </div>`
            )
            .join("")}</div>`
    }
  </section>`;
}

function renderCoverageAndLimitations(summary: CombinedExecutiveSummaryV1): string {
  const coverage = summary.coverage;
  return `<section id="coverage">
    <h2>Coverage and Limitations</h2>
    <div class="grid">
      <div class="card">
        <h3>Resource Coverage</h3>
        <p>${esc(coverage.partialProviderCount)} of ${esc(coverage.totalProviders)} provider report(s) had partial coverage.</p>
        <h3>Missing Scopes</h3>
        ${
          coverage.missingScopesByProvider.length === 0
            ? `<p class="muted">No missing scopes were reported.</p>`
            : renderList(
                coverage.missingScopesByProvider.map(
                  (item) =>
                    `${item.providerDisplayName}: ${item.missingScopes.join(", ")}`
                )
              )
        }
        <h3>Failed Collectors</h3>
        ${
          coverage.failedCollectorsByProvider.length === 0
            ? `<p class="muted">No failed collectors were reported.</p>`
            : renderList(
                coverage.failedCollectorsByProvider.map(
                  (item) =>
                    `${item.providerDisplayName}: ${item.failedCollectors} failed collector(s)`
                )
              )
        }
      </div>
      <div class="card">
        <h3>Limitations</h3>
        ${
          summary.limitations.length === 0
            ? `<p class="muted">No limitations were recorded in the input reports.</p>`
            : renderList(
                summary.limitations
                  .slice(0, 18)
                  .map(
                    (limitation) =>
                      `${limitation.providerDisplayName}: ${limitation.detail}`
                  )
              )
        }
      </div>
    </div>
  </section>`;
}

function renderMethodology(summary: CombinedExecutiveSummaryV1): string {
  return `<section id="methodology">
    <h2>Methodology</h2>
    <div class="grid">
      <div class="card">
        <h3>Inputs</h3>
        ${renderList(
          summary.inputs.map(
            (input) =>
              `${input.providerDisplayName} / ${input.tenantDisplayName}: scan ${input.scanId}, generated ${input.generatedAt}`
          )
        )}
      </div>
      <div class="card">
        <h3>Rules</h3>
        ${renderList(summary.methodology)}
      </div>
    </div>
  </section>`;
}

function renderSeverityCounts(counts: SeverityCounts): string {
  return (["critical", "high", "medium", "low", "info"] as Severity[])
    .map(
      (severity) =>
        `<span class="badge sev-${esc(severity)}">${esc(severity)} ${esc(counts[severity])}</span>`
    )
    .join("");
}

function renderList(values: string[], empty = "None recorded."): string {
  if (values.length === 0) return `<p class="muted">${esc(empty)}</p>`;
  return `<ul>${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

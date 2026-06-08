import {
  CategoryDelta,
  CollectorCoverageDelta,
  FindingDelta,
  FindingDeltaStatus,
  StructuredDeltaReportV1
} from "../delta/delta.types";
import {
  StructuredReportFinding,
  StructuredReportResourceRef
} from "../json/report-contract.types";
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

function md(raw: string | undefined): string {
  if (!raw) return "";
  let value = esc(raw);
  value = value.replace(/^- (.+)$/gm, "<li>$1</li>");
  value = value.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`);
  value = value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  value = value.replace(/\n/g, "<br>");
  return value;
}

const CSS = `
:root {
  --bg: #0f1117;
  --surface: #1a1d27;
  --surface2: #22263a;
  --border: #2e3250;
  --text: #e2e8f0;
  --muted: #8892a4;
  --accent: #38bdf8;
  --good: #22c55e;
  --bad: #ef4444;
  --warn: #f97316;
  --neutral: #94a3b8;
  --critical: #ef4444;
  --high: #f97316;
  --medium: #eab308;
  --low: #22d3ee;
  --info: #94a3b8;
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(circle at 20% 0%, rgba(56,189,248,.18), transparent 28%), var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
code {
  background: var(--surface2);
  border-radius: 4px;
  color: #a5b4fc;
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: .86em;
  padding: 1px 5px;
}
.topbar {
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(15,17,23,.92);
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 20px;
  padding: 10px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo { color: var(--accent); font-size: .9em; font-weight: 800; letter-spacing: .06em; }
nav { display: flex; flex-wrap: wrap; gap: 12px; }
nav a { color: var(--muted); font-size: .84em; padding: 3px 8px; }
.page-wrap { margin: 0 auto; max-width: 1200px; padding: 0 24px 80px; }
.hero {
  align-items: center;
  display: flex;
  gap: 28px;
  padding: 42px 0 22px;
  flex-wrap: wrap;
}
.score-shift {
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  display: flex;
  gap: 14px;
  padding: 18px 22px;
}
.score-box { text-align: center; min-width: 82px; }
.score-value { font-size: 2.35em; font-weight: 850; line-height: 1; }
.score-label { color: var(--muted); font-size: .75em; margin-top: 4px; text-transform: uppercase; }
.score-arrow { color: var(--muted); font-size: 1.4em; }
.score-change { border-left: 1px solid var(--border); padding-left: 16px; }
.direction-improved { color: var(--good); }
.direction-worsened { color: var(--bad); }
.direction-unchanged { color: var(--neutral); }
.hero-meta h1 { font-size: 1.7em; margin: 0 0 5px; }
.sub { color: var(--muted); font-size: .9em; }
.section { margin-top: 42px; }
.section-title {
  border-bottom: 1px solid var(--border);
  font-size: 1.28em;
  font-weight: 800;
  margin-bottom: 18px;
  padding-bottom: 8px;
}
.grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
.panel, .stat-card, .finding-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.panel { padding: 18px; }
.panel h3 { font-size: 1em; margin: 0 0 8px; }
.panel p, .panel li { font-size: .9em; }
.muted { color: var(--muted); }
.stat-card { padding: 15px 18px; }
.stat-value { font-size: 2em; font-weight: 850; line-height: 1; }
.stat-label { color: var(--muted); font-size: .76em; margin-top: 4px; text-transform: uppercase; }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; font-size: .88em; width: 100%; }
thead th {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-weight: 700;
  padding: 8px 12px;
  text-align: left;
}
tbody tr { border-bottom: 1px solid var(--border); }
tbody td { padding: 8px 12px; vertical-align: top; }
.badge, .tag {
  border-radius: 99px;
  display: inline-block;
  font-size: .72em;
  font-weight: 800;
  letter-spacing: .05em;
  padding: 2px 8px;
  text-transform: uppercase;
}
.tag { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }
.badge.improved, .badge.resolved, .badge.now-assessed { background: rgba(34,197,94,.16); color: var(--good); }
.badge.worsened, .badge.new, .badge.now-not-assessed { background: rgba(239,68,68,.16); color: var(--bad); }
.badge.unchanged { background: rgba(148,163,184,.12); color: var(--neutral); }
.badge.removed { background: rgba(249,115,22,.14); color: var(--warn); }
.sev-critical { color: var(--critical); }
.sev-high { color: var(--high); }
.sev-medium { color: var(--medium); }
.sev-low { color: var(--low); }
.sev-info { color: var(--info); }
.finding-list { display: flex; flex-direction: column; gap: 10px; }
details.finding-card { overflow: hidden; }
summary.finding-header {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 10px;
  list-style: none;
  padding: 14px 18px;
}
summary.finding-header::-webkit-details-marker { display: none; }
.finding-title { flex: 1; font-weight: 700; }
.finding-id { color: var(--muted); font-family: monospace; font-size: .82em; }
.finding-body { border-top: 1px solid var(--border); padding: 0 18px 18px; }
.finding-section { margin-top: 16px; }
.finding-section-title {
  color: var(--muted);
  font-size: .78em;
  font-weight: 800;
  letter-spacing: .08em;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.kv { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }
.kv-item { background: rgba(34,38,58,.65); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
.kv-label { color: var(--muted); font-size: .73em; letter-spacing: .06em; text-transform: uppercase; }
.kv-value { margin-top: 2px; }
.warning {
  background: rgba(249,115,22,.12);
  border: 1px solid rgba(249,115,22,.35);
  border-radius: 10px;
  color: #fdba74;
  padding: 10px 14px;
}
ul.compact { margin: 0; padding-left: 18px; }
@media (max-width: 700px) {
  .score-shift { align-items: flex-start; flex-direction: column; }
  .score-change { border-left: 0; border-top: 1px solid var(--border); padding-left: 0; padding-top: 12px; width: 100%; }
  summary.finding-header { align-items: flex-start; flex-direction: column; }
}
`;

const FINDING_SECTION_ORDER: Array<{
  status: FindingDeltaStatus;
  title: string;
  description: string;
}> = [
  {
    status: "worsened",
    title: "Worsened Findings",
    description: "Existing findings whose severity or score impact increased."
  },
  {
    status: "new",
    title: "New Findings",
    description: "Findings present in the after report that were not present before."
  },
  {
    status: "resolved",
    title: "Resolved Findings",
    description: "Findings present before that no longer appear in the after report."
  },
  {
    status: "improved",
    title: "Improved Findings",
    description: "Existing findings whose severity or score impact decreased."
  },
  {
    status: "unchanged",
    title: "Remaining Unchanged Findings",
    description: "Findings that remain with the same severity and score impact."
  }
];

export function renderDeltaReportHtml(report: StructuredDeltaReportV1): string {
  const title = `Identity Posture Delta - ${report.provider.displayName}`;
  const navLinks = [
    ["#summary", "Summary"],
    ["#decisions", "Decisions"],
    ["#categories", "Categories"],
    ["#findings", "Findings"],
    ["#coverage", "Coverage"],
    ["#methodology", "Methodology"]
  ]
    .map(([href, label]) => `<a href="${href}">${esc(label)}</a>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="topbar">
    <span class="logo">zelto-identity-pulse</span>
    <nav>${navLinks}</nav>
  </div>

  <div class="page-wrap">
    ${renderHero(report)}
    ${renderWarnings(report)}

    <div class="section" id="decisions">
      <div class="section-title">Key Decisions Required</div>
      ${renderDecisionPanel(report)}
    </div>

    <div class="section" id="categories">
      <div class="section-title">Category Deltas</div>
      ${renderCategoryTable(report.categories)}
    </div>

    <div class="section" id="findings">
      <div class="section-title">Findings by Change State</div>
      ${renderFindingSections(report)}
    </div>

    <div class="section" id="coverage">
      <div class="section-title">Resource Coverage Changes</div>
      ${renderCoverage(report)}
    </div>

    <div class="section" id="methodology">
      <div class="section-title">Methodology</div>
      ${renderMethodology(report)}
    </div>
  </div>
</body>
</html>`;
}

function renderHero(report: StructuredDeltaReportV1): string {
  const direction = report.score.direction;
  const summaryCards = [
    ["New", report.summary.newFindings, "new"],
    ["Resolved", report.summary.resolvedFindings, "resolved"],
    ["Worsened", report.summary.worsenedFindings, "worsened"],
    ["Improved", report.summary.improvedFindings, "improved"],
    ["Remaining", report.summary.unchangedFindings, "unchanged"]
  ];

  return `<div class="hero" id="summary">
    <div class="score-shift">
      <div class="score-box">
        <div class="score-value">${esc(report.score.before)}</div>
        <div class="score-label">Before ${esc(report.score.gradeBefore)}</div>
      </div>
      <div class="score-arrow">to</div>
      <div class="score-box">
        <div class="score-value">${esc(report.score.after)}</div>
        <div class="score-label">After ${esc(report.score.gradeAfter)}</div>
      </div>
      <div class="score-change">
        <div class="stat-label">Score movement</div>
        <div class="stat-value direction-${esc(direction)}">${esc(formatSigned(report.score.change))}</div>
        <div class="muted">${esc(humanizeDirection(direction))}</div>
      </div>
    </div>
    <div class="hero-meta">
      <h1>${esc(report.provider.displayName)} Delta Report</h1>
      <div class="sub">Tenant: <strong>${esc(report.tenant.displayName || report.tenant.primaryIdentifier)}</strong> | Environment: ${esc(report.environment.before)} to ${esc(report.environment.after)} | Report schema: ${esc(report.reportSchemaVersion)}</div>
      <div class="grid" style="margin-top:14px">${summaryCards
        .map(
          ([label, value, status]) =>
            `<div class="stat-card"><div class="stat-value ${esc(String(status))}">${esc(value)}</div><div class="stat-label">${esc(label)}</div></div>`
        )
        .join("")}</div>
    </div>
  </div>
  <div class="grid">
    <div class="panel">
      <h3>Executive Summary</h3>
      <p>${esc(buildExecutiveSummary(report))}</p>
    </div>
    <div class="panel">
      <h3>Score Interpretation</h3>
      <p>${renderScoreInterpretation(report)}</p>
    </div>
    <div class="panel">
      <h3>Coverage Interpretation</h3>
      <p>${renderCoverageInterpretation(report)}</p>
    </div>
  </div>`;
}

function renderWarnings(report: StructuredDeltaReportV1): string {
  if (report.comparison.warnings.length === 0) return "";
  return `<div class="section"><div class="warning"><strong>Comparison warning:</strong><ul class="compact">${report.comparison.warnings
    .map((warning) => `<li>${esc(warning)}</li>`)
    .join("")}</ul></div></div>`;
}

function renderDecisionPanel(report: StructuredDeltaReportV1): string {
  const decisions: string[] = [];
  if (report.summary.worsenedFindings > 0) {
    decisions.push(
      `Escalate ${report.summary.worsenedFindings} worsened finding(s) and confirm whether the regression is expected.`
    );
  }
  if (report.summary.newFindings > 0) {
    decisions.push(
      `Review ${report.summary.newFindings} new finding(s) before considering remediation complete.`
    );
  }
  if (report.summary.resolvedFindings > 0) {
    decisions.push(
      `Validate ${report.summary.resolvedFindings} resolved finding(s) against the change record or control owner evidence.`
    );
  }
  if (report.summary.coverageChanged) {
    decisions.push(
      "Review collector and scope changes before attributing all score movement to remediation."
    );
  }
  if (decisions.length === 0) {
    decisions.push(
      "No new regression decision is indicated by this delta. Continue recurring review using the same report contract."
    );
  }

  return `<div class="panel"><ul>${decisions.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>`;
}

function renderCategoryTable(categories: CategoryDelta[]): string {
  const rows = [...categories]
    .sort(compareCategoriesForDisplay)
    .map((category) => `<tr>
      <td>${esc(category.name)}</td>
      <td><span class="badge ${esc(category.status)}">${esc(humanizeStatus(category.status))}</span></td>
      <td>${esc(formatCategoryScore(category.before?.score, category.before?.assessed))}</td>
      <td>${esc(formatCategoryScore(category.after?.score, category.after?.assessed))}</td>
      <td class="${esc(directionClass(category.scoreChange ?? 0))}">${category.scoreChange === null ? "N/A" : esc(formatSigned(category.scoreChange))}</td>
      <td>${esc(category.before?.findings ?? "N/A")}</td>
      <td>${esc(category.after?.findings ?? "N/A")}</td>
      <td>${esc(category.after?.confidence ?? category.before?.confidence ?? "unknown")}</td>
    </tr>`)
    .join("");

  return `<div class="table-wrap"><table>
    <thead><tr><th>Category</th><th>Status</th><th>Before</th><th>After</th><th>Score Change</th><th>Findings Before</th><th>Findings After</th><th>Confidence</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderFindingSections(report: StructuredDeltaReportV1): string {
  return FINDING_SECTION_ORDER.map(({ status, title, description }) => {
    const findings = report.findings[status];
    return `<div class="section" style="margin-top:28px">
      <h3>${esc(title)} <span class="tag">${esc(findings.length)} item${findings.length === 1 ? "" : "s"}</span></h3>
      <p class="muted">${esc(description)}</p>
      ${findings.length === 0 ? `<p class="muted">None.</p>` : `<div class="finding-list">${findings.map(renderFindingCard).join("")}</div>`}
    </div>`;
  }).join("");
}

function renderFindingCard(delta: FindingDelta): string {
  const finding = primaryFinding(delta);
  const severity = delta.severityAfter ?? delta.severityBefore ?? "info";
  const resources = renderResourceSample(finding.affectedResources);

  return `<details class="finding-card" id="finding-${esc(delta.fingerprint)}">
    <summary class="finding-header">
      <span class="finding-id">${esc(delta.id)}</span>
      <span class="badge ${esc(delta.status)}">${esc(delta.status)}</span>
      <span class="sev-${esc(severity)}">${esc(severity.toUpperCase())}</span>
      <span class="finding-title">${esc(delta.title)}</span>
      <span class="tag">score ${esc(formatScoreImpact(delta))}</span>
    </summary>
    <div class="finding-body">
      <div class="kv" style="margin-top:16px">
        ${renderKv("Category", delta.category)}
        ${renderKv("Classification", finding.classification)}
        ${renderKv("Confidence", finding.confidence)}
        ${renderKv("Severity", formatSeverityChange(delta))}
        ${renderKv("Fingerprint", delta.fingerprint)}
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Evidence</div>
        <div>${renderEvidence(finding)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Business Risk</div>
        <div>${md(finding.businessRisk)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Recommendation</div>
        <div>${md(finding.recommendation)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Validation Steps</div>
        ${renderStringList(finding.validationSteps)}
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Affected Resources</div>
        ${resources}
      </div>
      ${delta.changedFields.length > 0 ? `<div class="finding-section">
        <div class="finding-section-title">Changed Fields</div>
        ${renderStringList(delta.changedFields)}
      </div>` : ""}
    </div>
  </details>`;
}

function renderCoverage(report: StructuredDeltaReportV1): string {
  const changedCollectors = report.coverage.collectors.filter(
    (collector) =>
      collector.statusChanged ||
      (collector.countChange !== null && collector.countChange !== 0)
  );
  const missingScopesChanged =
    report.coverage.missingScopes.added.length > 0 ||
    report.coverage.missingScopes.removed.length > 0;

  const collectorRows = changedCollectors.length === 0
    ? `<tr><td colspan="5" class="muted">No collector status or count changes.</td></tr>`
    : changedCollectors
        .map((collector) => `<tr>
          <td><code>${esc(collector.collector)}</code></td>
          <td>${esc(collector.before?.status ?? "not present")}</td>
          <td>${esc(collector.after?.status ?? "not present")}</td>
          <td>${esc(formatOptionalNumber(collector.before?.count))} to ${esc(formatOptionalNumber(collector.after?.count))}</td>
          <td class="${esc(directionClass(collector.countChange ?? 0))}">${collector.countChange === null ? "N/A" : esc(formatSigned(collector.countChange))}</td>
        </tr>`)
        .join("");

  return `<div class="grid">
    <div class="panel">
      <h3>Coverage Summary</h3>
      <p>${renderCoverageInterpretation(report)}</p>
      <div class="kv">
        ${renderKv("Partial before", report.coverage.partialBefore ? "yes" : "no")}
        ${renderKv("Partial after", report.coverage.partialAfter ? "yes" : "no")}
        ${renderKv("Partial changed", report.coverage.partialChanged ? "yes" : "no")}
      </div>
    </div>
    <div class="panel">
      <h3>Missing Scope Changes</h3>
      ${missingScopesChanged ? `<p><strong>Added:</strong> ${renderCodeList(report.coverage.missingScopes.added)}</p><p><strong>Removed:</strong> ${renderCodeList(report.coverage.missingScopes.removed)}</p>` : `<p class="muted">No missing-scope changes.</p>`}
    </div>
  </div>
  <div class="table-wrap" style="margin-top:16px"><table>
    <thead><tr><th>Collector</th><th>Before Status</th><th>After Status</th><th>Count</th><th>Count Change</th></tr></thead>
    <tbody>${collectorRows}</tbody>
  </table></div>`;
}

function renderMethodology(report: StructuredDeltaReportV1): string {
  return `<div class="grid">
    <div class="panel">
      <h3>Comparison Method</h3>
      <p>Findings are matched by stable finding fingerprint. The delta engine then classifies matched findings as unchanged, worsened, or improved based on severity and score-impact movement.</p>
    </div>
    <div class="panel">
      <h3>Inputs</h3>
      <ul>
        <li>Before scan: <code>${esc(report.comparison.before.scanId)}</code>, generated ${esc(report.comparison.before.generatedAt)}</li>
        <li>After scan: <code>${esc(report.comparison.after.scanId)}</code>, generated ${esc(report.comparison.after.generatedAt)}</li>
        <li>Delta schema: <code>${esc(report.schemaVersion)}</code>, engine: <code>${esc(report.deltaEngineVersion)}</code></li>
      </ul>
    </div>
    <div class="panel">
      <h3>Boundaries</h3>
      <p>This report is local-first and read-only. It does not perform provider writes, remediation actions, hosted synchronization, or telemetry.</p>
    </div>
  </div>`;
}

function renderScoreInterpretation(report: StructuredDeltaReportV1): string {
  return `Overall score moved from <strong>${esc(report.score.before)}/100 (${esc(report.score.gradeBefore)})</strong> to <strong>${esc(report.score.after)}/100 (${esc(report.score.gradeAfter)})</strong>, a <span class="${esc(directionClass(report.score.change))}">${esc(formatSigned(report.score.change))}</span> point change.`;
}

function renderCoverageInterpretation(report: StructuredDeltaReportV1): string {
  if (!report.summary.coverageChanged) {
    return "Coverage appears unchanged between the compared reports.";
  }
  const parts: string[] = [];
  if (report.coverage.partialChanged) {
    parts.push(
      `partial coverage changed from ${report.coverage.partialBefore ? "yes" : "no"} to ${report.coverage.partialAfter ? "yes" : "no"}`
    );
  }
  if (report.coverage.missingScopes.added.length > 0) {
    parts.push(`${report.coverage.missingScopes.added.length} missing scope(s) were added`);
  }
  if (report.coverage.missingScopes.removed.length > 0) {
    parts.push(`${report.coverage.missingScopes.removed.length} missing scope(s) were removed`);
  }
  const collectorChanges = report.coverage.collectors.filter(
    (collector) =>
      collector.statusChanged ||
      (collector.countChange !== null && collector.countChange !== 0)
  ).length;
  if (collectorChanges > 0) {
    parts.push(`${collectorChanges} collector(s) changed status or count`);
  }
  return `Coverage changed: ${parts.join("; ")}.`;
}

function buildExecutiveSummary(report: StructuredDeltaReportV1): string {
  const movement =
    report.score.direction === "improved"
      ? "improved"
      : report.score.direction === "worsened"
        ? "declined"
        : "remained unchanged";
  const regressionText =
    report.summary.newFindings + report.summary.worsenedFindings > 0
      ? `${report.summary.newFindings} new and ${report.summary.worsenedFindings} worsened finding(s) require review.`
      : "No new or worsened findings were detected.";
  return `Posture ${movement} by ${formatSigned(report.score.change)} point(s), with ${report.summary.resolvedFindings} resolved, ${report.summary.improvedFindings} improved, and ${report.summary.unchangedFindings} unchanged finding(s). ${regressionText}`;
}

function renderEvidence(finding: StructuredReportFinding): string {
  const lines = [finding.evidence.summary];
  if (finding.evidence.observedRisks?.length) {
    lines.push(`Observed risks: ${finding.evidence.observedRisks.join("; ")}`);
  }
  if (finding.evidence.requiresValidation?.length) {
    lines.push(`Requires validation: ${finding.evidence.requiresValidation.join("; ")}`);
  }
  if (finding.evidence.confidenceReason) {
    lines.push(`Confidence reason: ${finding.evidence.confidenceReason}`);
  }
  return lines.map((line) => `<p>${md(line)}</p>`).join("");
}

function renderResourceSample(resources: StructuredReportResourceRef[]): string {
  if (resources.length === 0) {
    return `<p class="muted">No specific resources are attached to this finding.</p>`;
  }
  const sample = resources.slice(0, 5);
  const suffix =
    resources.length > sample.length
      ? `<p class="muted">${esc(resources.length - sample.length)} additional resource(s) omitted from this inline sample.</p>`
      : "";
  return `<p>${esc(resources.length)} affected resource(s); sample shown below.</p><ul>${sample
    .map(
      (resource) =>
        `<li><code>${esc(resource.kind)}</code> ${esc(resource.displayName)}${resource.masked ? ` <span class="tag">masked</span>` : ""}</li>`
    )
    .join("")}</ul>${suffix}`;
}

function renderStringList(items: string[]): string {
  if (items.length === 0) return `<p class="muted">None recorded.</p>`;
  return `<ul>${items.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function renderCodeList(items: string[]): string {
  if (items.length === 0) return `<span class="muted">none</span>`;
  return items.map((item) => `<code>${esc(item)}</code>`).join(", ");
}

function renderKv(label: string, value: string | number | boolean): string {
  return `<div class="kv-item"><div class="kv-label">${esc(label)}</div><div class="kv-value">${esc(value)}</div></div>`;
}

function primaryFinding(delta: FindingDelta): StructuredReportFinding {
  const finding = delta.after ?? delta.before;
  if (!finding) {
    throw new Error("Cannot render delta finding without before or after content.");
  }
  return finding;
}

function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function formatScoreImpact(delta: FindingDelta): string {
  if (delta.scoreImpactBefore === undefined && delta.scoreImpactAfter !== undefined) {
    return `new -${delta.scoreImpactAfter}`;
  }
  if (delta.scoreImpactBefore !== undefined && delta.scoreImpactAfter === undefined) {
    return `resolved -${delta.scoreImpactBefore}`;
  }
  if (delta.scoreImpactChange !== undefined) {
    return `${delta.scoreImpactBefore ?? 0} to ${delta.scoreImpactAfter ?? 0} (${formatSigned(delta.scoreImpactChange)})`;
  }
  return "N/A";
}

function formatSeverityChange(delta: FindingDelta): string {
  if (delta.severityBefore && delta.severityAfter) {
    if (delta.severityBefore === delta.severityAfter) return delta.severityAfter;
    return `${delta.severityBefore} to ${delta.severityAfter}`;
  }
  return delta.severityAfter ?? delta.severityBefore ?? "unknown";
}

function formatCategoryScore(score: number | null | undefined, assessed?: boolean): string {
  if (assessed === false || score === null || score === undefined) return "N/A";
  return String(score);
}

function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? "N/A" : String(value);
}

function directionClass(change: number): string {
  if (change > 0) return "direction-improved";
  if (change < 0) return "direction-worsened";
  return "direction-unchanged";
}

function humanizeDirection(direction: StructuredDeltaReportV1["score"]["direction"]): string {
  switch (direction) {
    case "improved":
      return "Improved";
    case "worsened":
      return "Worsened";
    case "unchanged":
      return "Unchanged";
  }
}

function humanizeStatus(status: CategoryDelta["status"]): string {
  return status.replace(/-/g, " ");
}

const CATEGORY_STATUS_RANK: Record<CategoryDelta["status"], number> = {
  worsened: 0,
  "now-not-assessed": 1,
  new: 2,
  improved: 3,
  "now-assessed": 4,
  removed: 5,
  unchanged: 6
};

function compareCategoriesForDisplay(left: CategoryDelta, right: CategoryDelta): number {
  return (
    CATEGORY_STATUS_RANK[left.status] - CATEGORY_STATUS_RANK[right.status] ||
    left.name.localeCompare(right.name)
  );
}

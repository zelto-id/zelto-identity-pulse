import {
  OktaAnalysisReport,
  OktaFinding,
  OktaReportCategory,
  OKTA_CATEGORY_NAMES
} from "../markdown/okta-report.types";
import {
  buildOktaNotAssessedEmptyState,
  buildOktaPartialScanSummary
} from "../markdown/okta-report.collection-status";
import { Severity } from "../markdown/report.types";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function md(raw: string): string {
  let value = esc(raw);
  value = value.replace(/^- (.+)$/gm, "<li>$1</li>");
  value = value.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`);
  value = value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  value = value.replace(/\n/g, "<br>");
  return value;
}

function sevClass(severity: Severity): string {
  return `sev-${severity}`;
}

function sevBadge(severity: Severity): string {
  return `<span class="badge ${sevClass(severity)}">${esc(severity.toUpperCase())}</span>`;
}

function formatScoreImpact(impact: number | undefined): string {
  if (!impact) return "0";
  return `-${esc(String(impact))}`;
}

function classificationTag(classification: OktaFinding["classification"]): string {
  return `<span class="tag">${esc(humanizeClassification(classification))}</span>`;
}

function gradeClass(grade: string): string {
  if (grade === "A") return "grade-a";
  if (grade === "B") return "grade-b";
  if (grade === "C") return "grade-c";
  if (grade === "D") return "grade-d";
  return "grade-f";
}

const CSS = `
:root {
  --bg: #0f1117;
  --surface: #1a1d27;
  --surface2: #22263a;
  --border: #2e3250;
  --text: #e2e8f0;
  --text-muted: #8892a4;
  --accent: #6366f1;

  --crit: #ef4444;
  --high: #f97316;
  --med:  #eab308;
  --low:  #22d3ee;
  --info: #94a3b8;

  --grade-a: #22c55e;
  --grade-b: #84cc16;
  --grade-c: #eab308;
  --grade-d: #f97316;
  --grade-f: #ef4444;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.6;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

code {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 0.85em;
  background: var(--surface2);
  padding: 1px 5px;
  border-radius: 4px;
  color: #a5b4fc;
}

.page-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15,17,23,0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.topbar .logo {
  font-weight: 700;
  font-size: 0.9em;
  letter-spacing: 0.05em;
  color: var(--accent);
}
.topbar nav { display: flex; gap: 16px; flex-wrap: wrap; }
.topbar nav a {
  font-size: 0.82em;
  color: var(--text-muted);
  border-radius: 4px;
  padding: 3px 8px;
}
.topbar nav a:hover { background: var(--surface2); color: var(--text); }

.section { margin-top: 48px; }
.section-title {
  font-size: 1.3em;
  font-weight: 700;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 20px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 40px 0 24px;
  flex-wrap: wrap;
}
.grade-circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 5px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.grade-circle.grade-a { border-color: var(--grade-a); color: var(--grade-a); }
.grade-circle.grade-b { border-color: var(--grade-b); color: var(--grade-b); }
.grade-circle.grade-c { border-color: var(--grade-c); color: var(--grade-c); }
.grade-circle.grade-d { border-color: var(--grade-d); color: var(--grade-d); }
.grade-circle.grade-f { border-color: var(--grade-f); color: var(--grade-f); }
.grade-letter { font-size: 3em; font-weight: 800; line-height: 1; }
.grade-score  { font-size: 0.75em; font-weight: 600; color: var(--text-muted); }

.hero-meta h1 { font-size: 1.6em; font-weight: 700; margin-bottom: 4px; }
.hero-meta .sub { color: var(--text-muted); font-size: 0.88em; }

.stat-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 20px;
  min-width: 110px;
  text-align: center;
}
.stat-card .stat-value {
  font-size: 2em;
  font-weight: 800;
  line-height: 1;
}
.stat-card .stat-label { font-size: 0.75em; color: var(--text-muted); margin-top: 4px; }
.stat-card.sev-critical .stat-value { color: var(--crit); }
.stat-card.sev-high     .stat-value { color: var(--high); }
.stat-card.sev-medium   .stat-value { color: var(--med); }
.stat-card.sev-low      .stat-value { color: var(--low); }

.badge {
  display: inline-block;
  font-size: 0.7em;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 2px 8px;
  border-radius: 99px;
  vertical-align: middle;
}
.sev-critical.badge { background: rgba(239,68,68,.18); color: var(--crit); }
.sev-high.badge     { background: rgba(249,115,22,.18); color: var(--high); }
.sev-medium.badge   { background: rgba(234,179,8,.18); color: var(--med); }
.sev-low.badge      { background: rgba(34,211,238,.18); color: var(--low); }
.sev-info.badge     { background: rgba(148,163,184,.12); color: var(--info); }

.finding-list { display: flex; flex-direction: column; gap: 10px; }
details.finding-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}
details.finding-card[open] { border-color: var(--accent); }
details.finding-card.sev-critical { border-left: 4px solid var(--crit); }
details.finding-card.sev-high     { border-left: 4px solid var(--high); }
details.finding-card.sev-medium   { border-left: 4px solid var(--med); }
details.finding-card.sev-low      { border-left: 4px solid var(--low); }
details.finding-card.sev-info     { border-left: 4px solid var(--info); }

summary.finding-header {
  list-style: none;
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
}
summary.finding-header::-webkit-details-marker { display: none; }
summary.finding-header::marker { display: none; }

.finding-toggle {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: transform 0.2s;
}
details[open] .finding-toggle { transform: rotate(90deg); }

.finding-id { font-size: 0.8em; color: var(--text-muted); font-family: monospace; }
.finding-title { flex: 1; font-weight: 600; font-size: 0.95em; }
.finding-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.resource-count { font-size: 0.78em; color: var(--text-muted); }

.finding-body {
  padding: 0 18px 18px;
  border-top: 1px solid var(--border);
}
.finding-section { margin-top: 16px; }
.finding-section-title {
  font-size: 0.78em;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.finding-text { font-size: 0.9em; color: var(--text); }
.finding-text ul { padding-left: 20px; margin-top: 4px; }
.finding-text li { margin-bottom: 3px; }

.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88em;
}
thead th {
  background: var(--surface2);
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
tbody tr { border-bottom: 1px solid var(--border); }
tbody tr:last-child { border-bottom: none; }
tbody td { padding: 8px 12px; }
tbody tr:hover { background: var(--surface); }

.tag {
  font-size: 0.72em;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--surface2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.cat-bar-wrap { display: flex; flex-direction: column; gap: 8px; }
.cat-bar-row { display: flex; align-items: center; gap: 10px; font-size: 0.88em; }
.cat-bar-name { width: 230px; flex-shrink: 0; color: var(--text); }
.cat-bar-track {
  flex: 1;
  height: 8px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}
.cat-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--accent);
  transition: width 0.5s ease;
}
.cat-bar-fill.na { background: var(--border); }
.cat-bar-score { width: 70px; text-align: right; color: var(--text-muted); font-size: 0.88em; }

.status-success { color: #22c55e; }
.status-failed  { color: var(--crit); }
.status-partial { color: var(--med); }
.status-skipped { color: var(--text-muted); }

.partial-banner {
  background: rgba(234,179,8,.12);
  border: 1px solid rgba(234,179,8,.3);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88em;
  color: var(--med);
  margin-bottom: 16px;
}

.assumptions-list { font-size: 0.88em; color: var(--text-muted); }
.assumptions-list li { margin-bottom: 6px; padding-left: 4px; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.info-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
}
.info-item .info-label {
  font-size: 0.75em;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.info-item .info-value { font-size: 0.92em; margin-top: 2px; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px;
}
.panel h3 {
  font-size: 0.95em;
  margin-bottom: 10px;
}
.panel p, .panel li {
  font-size: 0.88em;
  color: var(--text);
}
.panel ul {
  padding-left: 18px;
}
.panel .muted {
  color: var(--text-muted);
}

.finding-kv {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.finding-kv .info-item { margin-top: 0; }

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-row .actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.filter-btn.active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

@media (max-width: 640px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .topbar nav { gap: 8px; }
  .cat-bar-name { width: 140px; }
  .finding-meta { display: none; }
}
`;

const JS = `
function toggleAll(open) {
  document.querySelectorAll('details.finding-card').forEach((item) => {
    item.open = open;
  });
}

function filterSeverity(severity) {
  document.querySelectorAll('details.finding-card').forEach((item) => {
    if (!severity || item.dataset.severity === severity) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === (severity || 'all'));
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
`;

function renderInfoGrid(report: OktaAnalysisReport): string {
  const items = [
    ["Org", report.metadata.orgUrl],
    ["Environment", report.metadata.environment],
    ["Generated", report.metadata.generatedAt],
    ["Scan ID", report.metadata.scanId],
    ["Connector", report.metadata.connectorVersion],
    ["Identifiers", report.metadata.includeIdentifiers ? "Full identifiers included" : "Masked by default"]
  ];
  return `<div class="info-grid">${items
    .map(
      ([label, value]) =>
        `<div class="info-item"><div class="info-label">${esc(label)}</div><div class="info-value">${esc(value)}</div></div>`
    )
    .join("")}</div>`;
}

function renderStatCards(report: OktaAnalysisReport): string {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };
  for (const finding of report.findings) {
    counts[finding.severity] = (counts[finding.severity] ?? 0) + 1;
  }

  const relevantSeverities: Severity[] = ["critical", "high", "medium", "low"];
  return `<div class="stat-row">
    ${relevantSeverities
      .map(
        (severity) =>
          `<div class="stat-card ${sevClass(severity)}"><div class="stat-value">${counts[severity]}</div><div class="stat-label">${severity.toUpperCase()}</div></div>`
      )
      .join("")}
    <div class="stat-card"><div class="stat-value" style="color:var(--text-muted)">${report.findings.length}</div><div class="stat-label">TOTAL</div></div>
  </div>`;
}

function renderAssumptions(report: OktaAnalysisReport): string {
  if (report.assumptions.length === 0) return `<p class="muted">No explicit assumptions recorded.</p>`;
  return `<ul class="assumptions-list">${report.assumptions.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function renderConclusion(report: OktaAnalysisReport): string {
  if (report.conclusion.length === 0) return `<p class="muted">No conclusion generated.</p>`;
  return `<ul class="assumptions-list">${report.conclusion.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function renderCategoryBars(report: OktaAnalysisReport): string {
  return `<div class="cat-bar-wrap">${report.categories
    .map((category) => {
      const score = category.assessed && category.score !== null ? category.score : null;
      const percent = score !== null ? Math.round((score / category.weight) * 100) : 0;
      const fillClass = score === null ? "na" : "";
      const label = score === null ? "N/A" : `${score}/${category.weight}`;
      return `<div class="cat-bar-row">
        <span class="cat-bar-name" title="${esc(category.confidenceReason)}">${esc(category.name)}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill ${fillClass}" style="width:${percent}%"></div></div>
        <span class="cat-bar-score">${esc(label)}</span>
      </div>`;
    })
    .join("")}</div>`;
}

function renderScoreSummary(report: OktaAnalysisReport): string {
  const productionEquivalent = report.score.breakdown.productionEquivalent;
  const items = [
    ["Observed score", `${report.score.breakdown.observedScore} / ${report.score.breakdown.assessedMaxPoints}`],
    ["Normalized score", `${report.score.breakdown.normalizedScore} / 100`],
    ["Hero score", `${report.score.overall} / 100`],
    ["Unassessed weight", String(report.score.breakdown.unassessedWeight)]
  ];
  if (shouldRenderProductionEquivalent(report)) {
    items.push([
      "Production-equivalent",
      `${productionEquivalent.overall} / 100 (${productionEquivalent.grade})`
    ]);
  }

  const topRisks = report.findings
    .filter((finding) => finding.severity === "critical" || finding.severity === "high")
    .slice(0, 5);

  const partialImpact =
    report.partialScanImpact.partial && report.partialScanImpact.affectedCategories.length > 0
      ? `<p>Partial collectors affected assessed scope.</p><ul>${report.partialScanImpact.affectedCategories
          .map(
            (category) =>
              `<li><strong>${esc(category.categoryName)}</strong>: ${esc(category.affectedCollectors.join(", "))}</li>`
          )
          .join("")}</ul>${renderBoundaryList(report)}`
      : `<p>All configured collectors completed successfully, but several categories use bounded or sampled analysis in the MVP.</p>${renderBoundaryList(report)}`;

  const topRiskList =
    topRisks.length > 0
      ? `<ul>${topRisks
          .map(
            (finding) =>
              `<li>${sevBadge(finding.severity)} <a href="#finding-${esc(finding.id)}">${esc(finding.id)}</a> — ${esc(finding.title)}</li>`
          )
          .join("")}</ul>`
      : `<p class="muted">No critical or high findings were detected in the assessed Okta scope.</p>`;

  return `<div class="summary-grid">
    <div class="panel">
      <h3>Score Interpretation</h3>
      <div class="info-grid">${items
        .map(
          ([label, value]) =>
            `<div class="info-item"><div class="info-label">${esc(label)}</div><div class="info-value">${esc(value)}</div></div>`
        )
        .join("")}</div>
      <p style="margin-top:12px">${md(report.score.breakdown.environmentAdjustedInterpretation)}</p>
    </div>
    <div class="panel">
      <h3>Top Risks</h3>
      ${topRiskList}
    </div>
    <div class="panel">
      <h3>Partial Scan Impact</h3>
      ${partialImpact}
    </div>
  </div>`;
}

function renderFindingMetaGrid(finding: OktaFinding): string {
  const rows = [
    ["Category", OKTA_CATEGORY_NAMES[finding.category] ?? finding.category],
    ["Finding type", humanizeClassification(finding.classification)],
    ["Score impact", formatScoreImpact(finding.scoreImpact)],
    ["Confidence", finding.confidence ?? "not stated"],
    ["Okta area", finding.oktaArea ?? "not mapped"]
  ];

  if (
    finding.productionEquivalentSeverity &&
    finding.productionEquivalentSeverity !== finding.severity
  ) {
    rows.push(["Production severity", finding.productionEquivalentSeverity]);
  }

  if (finding.productionEquivalentScoreImpact !== undefined) {
    rows.push([
      "Production score impact",
      formatScoreImpact(finding.productionEquivalentScoreImpact)
    ]);
  }

  return `<div class="finding-kv">${rows
    .map(
      ([label, value]) =>
        `<div class="info-item"><div class="info-label">${esc(label)}</div><div class="info-value">${esc(value)}</div></div>`
    )
    .join("")}</div>`;
}

function renderFindingCard(finding: OktaFinding): string {
  const resources = renderAffectedResources(finding);

  const environmentAdjustment =
    finding.environmentAdjustmentReason &&
    finding.environmentAdjustedSeverity &&
    finding.productionEquivalentSeverity &&
    finding.environmentAdjustedSeverity !== finding.productionEquivalentSeverity
      ? `<div class="finding-section">
          <div class="finding-section-title">Environment Adjustment</div>
          <div class="finding-text">${md(finding.environmentAdjustmentReason)}</div>
        </div>`
      : "";

  return `<details class="finding-card ${sevClass(finding.severity)}" id="finding-${esc(finding.id)}" data-severity="${esc(finding.severity)}">
    <summary class="finding-header">
      <span class="finding-toggle">▶</span>
      <span class="finding-id">${esc(finding.id)}</span>
      ${sevBadge(finding.severity)}
      ${classificationTag(finding.classification)}
      <span class="finding-title">${esc(finding.title)}</span>
      <span class="finding-meta">
        <span class="resource-count">${(finding.affectedResourceCount ?? finding.affectedResources.length)} resource${(finding.affectedResourceCount ?? finding.affectedResources.length) !== 1 ? "s" : ""}</span>
        <span class="tag">score ${formatScoreImpact(finding.scoreImpact)}</span>
      </span>
    </summary>
    <div class="finding-body">
      ${renderFindingMetaGrid(finding)}
      <div class="finding-section">
        <div class="finding-section-title">Evidence</div>
        <div class="finding-text">${md(finding.evidence)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Business Risk</div>
        <div class="finding-text">${md(finding.businessRisk)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Recommendation</div>
        <div class="finding-text">${md(finding.recommendation)}</div>
      </div>
      ${finding.confidenceReason ? `<div class="finding-section">
        <div class="finding-section-title">Confidence Reason</div>
        <div class="finding-text">${md(finding.confidenceReason)}</div>
      </div>` : ""}
      <div class="finding-section">
        <div class="finding-section-title">Affected Resources</div>
        <div class="finding-text">${resources}</div>
      </div>
      ${finding.apiHint ? `<div class="finding-section">
        <div class="finding-section-title">API Hint</div>
        <div class="finding-text">${md(finding.apiHint)}</div>
      </div>` : ""}
      ${finding.terraformHint ? `<div class="finding-section">
        <div class="finding-section-title">Terraform Hint</div>
        <div class="finding-text">${md(finding.terraformHint)}</div>
      </div>` : ""}
      ${(finding.validationSteps ?? []).length > 0 ? `<div class="finding-section">
        <div class="finding-section-title">Validation Steps</div>
        <div class="finding-text">${renderStringList(finding.validationSteps ?? [])}</div>
      </div>` : ""}
      ${(finding.falsePositiveNotes ?? []).length > 0 ? `<div class="finding-section">
        <div class="finding-section-title">False-Positive / Context Notes</div>
        <div class="finding-text">${renderStringList(finding.falsePositiveNotes ?? [])}</div>
      </div>` : ""}
      ${environmentAdjustment}
    </div>
  </details>`;
}

function renderRemediationPlan(report: OktaAnalysisReport): string {
  if (report.remediationPlan.buckets.every((bucket) => bucket.items.length === 0)) {
    return `<p class="muted">No remediation items — no actionable findings detected.</p>`;
  }

  return `<div class="summary-grid">${report.remediationPlan.buckets
    .map((bucket) => `<div class="panel">
        <h3>${esc(bucket.name)} <span class="muted">(${esc(bucket.window)})</span></h3>
        ${bucket.items.length === 0 ? `<p class="muted">No items in this bucket.</p>` : `<ul>${bucket.items
          .map(
            (item) =>
              `<li><strong>${esc(item.findingId)}</strong> — ${esc(item.action)}<br><span class="muted">Outcome:</span> ${esc(item.expectedOutcome)}<br><span class="muted">Effort:</span> ${esc(item.effort)}<br><span class="muted">Validation:</span> ${esc(item.validationStep)}</li>`
          )
          .join("")}</ul>`}
      </div>`)
    .join("")}</div>`;
}

function renderPositiveSignals(report: OktaAnalysisReport): string {
  if (report.positiveSignals.length === 0) {
    return `<p class="muted">No positive signals were recorded.</p>`;
  }
  return `<ul>${report.positiveSignals
    .map((signal) => `<li><strong>${esc(signal.title)}</strong>: ${esc(signal.detail)}</li>`)
    .join("")}</ul>`;
}

function renderFindingsSection(report: OktaAnalysisReport): string {
  const order: Severity[] = ["critical", "high", "medium", "low", "info"];
  const filterButtons = ["all", ...order]
    .map(
      (severity) =>
        `<button class="filter-btn badge sev-${severity === "all" ? "info" : severity}${severity === "all" ? " active" : ""}" data-filter="${severity}" onclick="filterSeverity('${severity === "all" ? "" : severity}')">${severity.toUpperCase()}</button>`
    )
    .join(" ");

  if (report.findings.length === 0) {
    return `<p class="muted">No actionable findings detected in scanned scope.</p>`;
  }

  const sorted = [...report.findings].sort((left, right) => {
    const severityOrder = order.indexOf(left.severity) - order.indexOf(right.severity);
    if (severityOrder !== 0) return severityOrder;
    return left.id.localeCompare(right.id);
  });

  return `<div class="filter-row">
      <div>${filterButtons}</div>
      <div class="actions">
        <button class="tag" onclick="toggleAll(true)" style="cursor:pointer">Expand all</button>
        <button class="tag" onclick="toggleAll(false)" style="cursor:pointer">Collapse all</button>
      </div>
    </div>
    <div class="finding-list">${sorted.map((finding) => renderFindingCard(finding)).join("")}</div>`;
}

function renderCoverageTable(report: OktaAnalysisReport): string {
  const rows = report.collectionStatus.coverage.map((collector) => {
    const statusClass = `status-${collector.status}`;
    return `<tr>
      <td><code>${esc(collector.collector)}</code></td>
      <td><span class="${statusClass}">${esc(collector.status)}</span></td>
      <td>${collector.count !== undefined ? esc(String(collector.count)) : "—"}</td>
      <td style="font-size:0.82em">${(collector.requiredScopes ?? []).map((scope) => `<code>${esc(scope)}</code>`).join(", ")}</td>
      <td style="font-size:0.82em;color:var(--text-muted)">${esc(collector.notes ?? "")}</td>
    </tr>`;
  });

  return `<div class="table-wrap"><table>
    <thead><tr><th>Collector</th><th>Status</th><th>Count</th><th>Required Scopes</th><th>Notes</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table></div>`;
}

function renderNotAssessed(report: OktaAnalysisReport): string {
  if (report.notAssessed.length === 0) {
    return `<p class="muted">${esc(buildOktaNotAssessedEmptyState(report))}</p>`;
  }
  return `<ul class="assumptions-list">${report.notAssessed.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function renderCategoryTable(report: OktaAnalysisReport): string {
  const rows = report.categories
    .map(
      (category: OktaReportCategory) => `<tr>
        <td>${esc(category.name)}</td>
        <td>${category.assessed && category.score !== null ? esc(`${category.score}/${category.weight}`) : "N/A"}</td>
        <td>${esc(String(category.findings))}</td>
        <td>${esc(category.confidence)}</td>
        <td style="font-size:0.82em;color:var(--text-muted)">${esc(category.confidenceReason)}</td>
      </tr>`
    )
    .join("");

  return `<div class="table-wrap"><table>
    <thead><tr><th>Category</th><th>Score</th><th>Findings</th><th>Confidence</th><th>Reason</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

export function renderOktaReportHtml(report: OktaAnalysisReport): string {
  const grade = report.score.grade;
  const title = `Okta Workforce Posture Report — ${report.metadata.orgUrl}`;
  const partialBanner = report.collectionStatus.partial
    ? `<div class="partial-banner">⚠ ${esc(buildOktaPartialScanSummary(report))}</div>`
    : "";

  const navLinks = [
    ["#summary", "Summary"],
    ["#assumptions", "Assumptions"],
    ["#conclusion", "Conclusion"],
    ["#score", "Score"],
    ["#remediation", "Remediation"],
    ["#positive-signals", "Positive"],
    ["#categories", "Categories"],
    ["#findings", "Findings"],
    ["#not-assessed", "Not Assessed"],
    ["#coverage", "Coverage"]
  ]
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
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
    <div class="hero" id="summary">
      <div class="grade-circle ${gradeClass(grade)}">
        <span class="grade-letter">${esc(grade)}</span>
        <span class="grade-score">${esc(String(report.score.overall))}/100</span>
      </div>
      <div class="hero-meta">
        <h1>${esc(report.metadata.orgUrl)}</h1>
        <div class="sub">Environment: <strong>${esc(report.metadata.environment)}</strong> &nbsp;|&nbsp; Generated: ${esc(report.metadata.generatedAt)} &nbsp;|&nbsp; Scan: <code>${esc(report.metadata.scanId)}</code></div>
        ${renderStatCards(report)}
      </div>
    </div>

    ${partialBanner}
    ${renderInfoGrid(report)}

    <div class="section" id="assumptions">
      <div class="section-title">Assessment Assumptions</div>
      ${renderAssumptions(report)}
    </div>

    <div class="section" id="conclusion">
      <div class="section-title">Conclusion</div>
      ${renderConclusion(report)}
    </div>

    <div class="section" id="score">
      <div class="section-title">Score Interpretation</div>
      ${renderScoreSummary(report)}
    </div>

    <div class="section" id="remediation">
      <div class="section-title">Recommended Remediation Plan</div>
      ${renderRemediationPlan(report)}
    </div>

    <div class="section" id="positive-signals">
      <div class="section-title">Positive Signals</div>
      ${renderPositiveSignals(report)}
    </div>

    <div class="section" id="categories">
      <div class="section-title">Category Breakdown</div>
      ${renderCategoryBars(report)}
      <div style="margin-top:18px">${renderCategoryTable(report)}</div>
    </div>

    <div class="section" id="findings">
      <div class="section-title">Detailed Findings</div>
      ${renderFindingsSection(report)}
    </div>

    <div class="section" id="not-assessed">
      <div class="section-title">What Was Not Assessed</div>
      ${renderNotAssessed(report)}
    </div>

    <div class="section" id="coverage">
      <div class="section-title">Resource Coverage</div>
      ${renderCoverageTable(report)}
    </div>
  </div>

  <script>${JS}</script>
</body>
</html>`;
}

function renderBoundaryList(report: OktaAnalysisReport): string {
  if (report.analysisBoundaries.length === 0) {
    return `<p class="muted">No additional MVP boundaries were recorded.</p>`;
  }
  return `<ul>${report.analysisBoundaries.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function renderAffectedResources(finding: OktaFinding): string {
  const count = finding.affectedResourceCount ?? finding.affectedResources.length;
  if (count === 0) {
    return `<p class="muted">No specific resources were attached to this finding.</p>`;
  }
  if (finding.affectedResources.length === 0) {
    return `<p>${count} total resource(s).</p>`;
  }
  const sampleIntro =
    count > finding.affectedResources.length
      ? `<p>${count} total resource(s); sample shown below.</p>`
      : "";
  return `${sampleIntro}<ul>${finding.affectedResources
    .map((resource) => `<li><code>${esc(resource)}</code></li>`)
    .join("")}</ul>`;
}

function renderStringList(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${md(item)}</li>`).join("")}</ul>`;
}

function humanizeClassification(classification: OktaFinding["classification"]): string {
  switch (classification) {
    case "confirmed-risk":
      return "Confirmed Risk";
    case "requires-validation":
      return "Requires Validation";
    case "advisory":
      return "Advisory / Hygiene";
    case "positive-signal":
      return "Positive Signal";
  }
}

function shouldRenderProductionEquivalent(report: OktaAnalysisReport): boolean {
  const productionEquivalent = report.score.breakdown.productionEquivalent;
  return (
    report.metadata.environment !== "production" ||
    productionEquivalent.overall !== report.score.overall ||
    productionEquivalent.grade !== report.score.grade
  );
}

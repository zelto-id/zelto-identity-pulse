/**
 * Self-contained interactive HTML report renderer for Auth0AnalysisReport.
 *
 * Output is a single file with embedded CSS and vanilla JS.
 * No external dependencies, no CDN. The file is safe to open offline.
 */

import {
  Auth0AnalysisReport,
  ConsolidatedFinding,
  ConsolidatedFindingRow,
  RemediationBucket,
  RemediationItem,
  Severity
} from "../markdown/report.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render a markdown-ish string as safe HTML (bold, inline code, bullets). */
function md(raw: string): string {
  // Escape first to neutralise any HTML.
  let s = esc(raw);
  // Fenced code blocks and block bullets — render before inline.
  s = s.replace(/^- (.+)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`);
  // Inline: **bold**, `code`
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Line breaks
  s = s.replace(/\n/g, "<br>");
  return s;
}

const SEV_RANK: Record<Severity, number> = {
  critical: 4, high: 3, medium: 2, low: 1, info: 0
};

function sevClass(s: Severity): string {
  return `sev-${s}`;
}

function sevBadge(s: Severity): string {
  return `<span class="badge ${sevClass(s)}">${esc(s.toUpperCase())}</span>`;
}

function gradeClass(g: string): string {
  if (g === "A") return "grade-a";
  if (g === "B") return "grade-b";
  if (g === "C") return "grade-c";
  if (g === "D") return "grade-d";
  return "grade-f";
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

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

/* ── Layout ──────────────────────────────────────────────────────────────── */
.page-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* ── Top nav ─────────────────────────────────────────────────────────────── */
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

/* ── Section headings ────────────────────────────────────────────────────── */
.section { margin-top: 48px; }
.section-title {
  font-size: 1.3em;
  font-weight: 700;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 20px;
}
.section-subtitle {
  font-size: 1em;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 4px;
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
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

/* ── Stat cards ──────────────────────────────────────────────────────────── */
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
.stat-card.sev-medium   .stat-value { color: var(--med);  }
.stat-card.sev-low      .stat-value { color: var(--low);  }

/* ── Badges ──────────────────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  font-size: 0.7em;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 2px 8px;
  border-radius: 99px;
  vertical-align: middle;
}
.sev-critical.badge { background: rgba(239,68,68,.18);  color: var(--crit); }
.sev-high.badge     { background: rgba(249,115,22,.18); color: var(--high); }
.sev-medium.badge   { background: rgba(234,179,8,.18);  color: var(--med);  }
.sev-low.badge      { background: rgba(34,211,238,.18); color: var(--low);  }
.sev-info.badge     { background: rgba(148,163,184,.12);color: var(--info); }

/* ── Category breakdown table ────────────────────────────────────────────── */
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

/* ── Findings list ──────────────────────────────────────────────────────── */
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
details.finding-card.sev-medium   { border-left: 4px solid var(--med);  }
details.finding-card.sev-low      { border-left: 4px solid var(--low);  }

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

.finding-id   { font-size: 0.8em; color: var(--text-muted); font-family: monospace; }
.finding-title { flex: 1; font-weight: 600; font-size: 0.95em; }
.finding-meta  { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.resource-count { font-size: 0.78em; color: var(--text-muted); }

.finding-body {
  padding: 0 18px 18px;
  border-top: 1px solid var(--border);
}

/* ── Finding body sub-sections ──────────────────────────────────────────── */
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

/* Resource instances table */
.instances-table { width: 100%; font-size: 0.83em; }
.instances-table th { background: var(--surface2); }
.instances-table td, .instances-table th { padding: 6px 10px; }

/* ── How to Interpret box ────────────────────────────────────────────────── */
.interpret-box {
  margin-top: 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
}
.interpret-box h4 {
  font-size: 0.82em;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}
.interpret-section { margin-top: 10px; }
.interpret-section strong {
  display: block;
  font-size: 0.82em;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.interpret-section p, .interpret-section ul { font-size: 0.88em; }
.interpret-section ul { padding-left: 18px; }
.interpret-section li { margin-bottom: 4px; }
.interpret-section code { font-size: 0.82em; }

/* ── Remediation plan ────────────────────────────────────────────────────── */
.remediation-bucket { margin-bottom: 28px; }
.bucket-title {
  font-size: 1em;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.bucket-title .bucket-window {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.88em;
}
.remediation-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.remediation-number {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--surface2);
  color: var(--text-muted);
  font-size: 0.78em;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remediation-content { flex: 1; }
.remediation-action { font-size: 0.9em; font-weight: 600; margin-bottom: 4px; }
.remediation-outcome { font-size: 0.82em; color: var(--text-muted); }
.remediation-tags { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.tag {
  font-size: 0.72em;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--surface2);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

/* ── Category bar ────────────────────────────────────────────────────────── */
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
.cat-bar-score { width: 50px; text-align: right; color: var(--text-muted); font-size: 0.88em; }

/* ── Coverage table ──────────────────────────────────────────────────────── */
.status-success { color: #22c55e; }
.status-failed  { color: var(--crit); }
.status-partial { color: var(--med); }
.status-skipped { color: var(--text-muted); }

/* ── Misc ────────────────────────────────────────────────────────────────── */
.assumptions-list { font-size: 0.88em; color: var(--text-muted); }
.assumptions-list li { margin-bottom: 6px; padding-left: 4px; }
.partial-banner {
  background: rgba(234,179,8,.12);
  border: 1px solid rgba(234,179,8,.3);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88em;
  color: var(--med);
  margin-bottom: 16px;
}
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
.info-item .info-label { font-size: 0.75em; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.info-item .info-value { font-size: 0.92em; margin-top: 2px; }

@media (max-width: 640px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .topbar nav { gap: 8px; }
  .cat-bar-name { width: 140px; }
}
`;

// ---------------------------------------------------------------------------
// JavaScript
// ---------------------------------------------------------------------------

const JS = `
// Expand/collapse all
function toggleAll(open) {
  document.querySelectorAll('details.finding-card').forEach(d => d.open = open);
}

// Filter findings by severity
function filterSeverity(sev) {
  document.querySelectorAll('details.finding-card').forEach(d => {
    if (!sev || d.dataset.severity === sev) {
      d.style.display = '';
    } else {
      d.style.display = 'none';
    }
  });
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === (sev || 'all'));
  });
}

// Smooth jump to anchor
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});
`;

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function renderInfoGrid(report: Auth0AnalysisReport): string {
  const items = [
    ["Tenant", report.metadata.tenantDomain],
    ["Environment", report.metadata.environment],
    ["Generated", report.metadata.generatedAt],
    ["Scan ID", report.metadata.scanId],
    ["Connector", report.metadata.connectorVersion]
  ];
  return `<div class="info-grid">${items
    .map(
      ([label, value]) =>
        `<div class="info-item"><div class="info-label">${esc(label)}</div><div class="info-value">${esc(value)}</div></div>`
    )
    .join("")}</div>`;
}

function renderStatCards(report: Auth0AnalysisReport): string {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of report.findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;
  const relevantSevs: Severity[] = ["critical", "high", "medium", "low"];
  return `<div class="stat-row">
    ${relevantSevs
      .map(
        (s) =>
          `<div class="stat-card ${sevClass(s)}"><div class="stat-value">${counts[s]}</div><div class="stat-label">${s.toUpperCase()}</div></div>`
      )
      .join("")}
    <div class="stat-card"><div class="stat-value" style="color:var(--text-muted)">${report.findings.length}</div><div class="stat-label">TOTAL</div></div>
  </div>`;
}

function renderCategoryBars(report: Auth0AnalysisReport): string {
  return `<div class="cat-bar-wrap">${report.categories
    .map((c) => {
      const score = c.assessed && c.score !== null ? c.score : null;
      const pct = score !== null ? Math.round((score / c.weight) * 100) : 0;
      const fillClass = score === null ? "na" : "";
      const label = score === null ? "N/A" : `${score}/${c.weight}`;
      return `<div class="cat-bar-row">
        <span class="cat-bar-name" title="${esc(c.confidenceReason)}">${esc(c.name)}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill ${fillClass}" style="width:${pct}%"></div></div>
        <span class="cat-bar-score">${label}</span>
      </div>`;
    })
    .join("")}</div>`;
}

function renderRemediationPlan(report: Auth0AnalysisReport): string {
  const nonEmpty = report.remediationPlan.buckets.filter((b) => b.items.length > 0);
  if (nonEmpty.length === 0) {
    return `<p style="color:var(--text-muted)">No remediation items — no actionable findings detected.</p>`;
  }
  return nonEmpty.map((b) => renderBucket(b)).join("");
}

function renderBucket(b: RemediationBucket): string {
  if (b.items.length === 0) return "";
  const items = b.items
    .map(
      (it, i) =>
        `<div class="remediation-item">
          <div class="remediation-number">${i + 1}</div>
          <div class="remediation-content">
            <div class="remediation-action">${esc(it.action)}</div>
            <div class="remediation-outcome">${esc(it.expectedOutcome)}</div>
            <div class="remediation-tags">
              <a class="tag" href="#finding-${esc(it.findingId)}">${esc(it.findingId)}</a>
              ${it.severity ? `<span class="tag badge ${sevClass(it.severity)}">${esc(it.severity.toUpperCase())}</span>` : ""}
              <span class="tag">effort: ${esc(it.effort)}</span>
            </div>
          </div>
        </div>`
    )
    .join("");
  return `<div class="remediation-bucket">
    <div class="bucket-title">${esc(b.name)} <span class="bucket-window">(${esc(b.window)})</span></div>
    ${items}
  </div>`;
}

function renderHowToInterpret(cf: ConsolidatedFinding): string {
  const h = cf.howToInterpret;
  if (!h) return "";
  const questions = h.selfAssessmentQuestions
    .map((q) => `<li>${md(q)}</li>`)
    .join("");
  return `<div class="interpret-box">
    <h4>How to Interpret This Finding &amp; Assess Your True Risk</h4>
    <div class="interpret-section">
      <strong>Core Principle: ${esc(h.corePrincipleTitle)}</strong>
      <p>${md(h.corePrincipleDetail)}</p>
    </div>
    <div class="interpret-section">
      <strong>Objective Risk Model</strong>
      <p>${md(h.riskModelDescription)}</p>
    </div>
    <div class="interpret-section">
      <strong>Architectural Self-Assessment</strong>
      <ul>${questions}</ul>
    </div>
    <div class="interpret-section">
      <strong>Concluding Advice</strong>
      <p>${md(h.concludingAdvice)}</p>
    </div>
  </div>`;
}

function renderInstancesTable(rows: ConsolidatedFindingRow[]): string {
  const hasAdjusted = rows.some(
    (r) => r.productionEquivalentSeverity && r.productionEquivalentSeverity !== r.environmentAdjustedSeverity
  );
  const header = hasAdjusted
    ? `<tr><th>Resource</th><th>Severity (adj.)</th><th>Severity (prod)</th><th>Evidence</th></tr>`
    : `<tr><th>Resource</th><th>Severity</th><th>Evidence</th></tr>`;
  const rows_html = rows
    .map((r) => {
      const prodSev = r.productionEquivalentSeverity ?? r.severity;
      return hasAdjusted
        ? `<tr>
            <td>${esc(r.resource)}</td>
            <td>${sevBadge(r.severity)}</td>
            <td>${sevBadge(prodSev)}</td>
            <td style="font-size:0.82em">${esc(r.evidenceSummary)}</td>
          </tr>`
        : `<tr>
            <td>${esc(r.resource)}</td>
            <td>${sevBadge(r.severity)}</td>
            <td style="font-size:0.82em">${esc(r.evidenceSummary)}</td>
          </tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table class="instances-table"><thead>${header}</thead><tbody>${rows_html}</tbody></table></div>`;
}

function renderRemediationBlock(cf: ConsolidatedFinding): string {
  const parts: string[] = [];
  if (cf.auth0Area) {
    parts.push(`<div class="finding-section">
      <div class="finding-section-title">Auth0 Dashboard</div>
      <div class="finding-text">${esc(cf.auth0Area)}</div>
    </div>`);
  }
  if (cf.terraformResource || (cf.terraformFields && cf.terraformFields.length > 0)) {
    const fields = (cf.terraformFields ?? []).map((f) => `<code>${esc(f)}</code>`).join(", ");
    parts.push(`<div class="finding-section">
      <div class="finding-section-title">Terraform</div>
      <div class="finding-text">${cf.terraformResource ? `Resource: <code>${esc(cf.terraformResource)}</code>` : ""}${fields ? ` — Fields: ${fields}` : ""}</div>
    </div>`);
  }
  if (cf.implementationSteps && cf.implementationSteps.length > 0) {
    const steps = cf.implementationSteps.map((s, i) => `<li>${i + 1}. ${esc(s)}</li>`).join("");
    parts.push(`<div class="finding-section">
      <div class="finding-section-title">Implementation Steps</div>
      <div class="finding-text"><ul style="list-style:none;padding:0">${steps}</ul></div>
    </div>`);
  }
  if (cf.validationSteps && cf.validationSteps.length > 0) {
    const steps = cf.validationSteps.map((s, i) => `<li>${i + 1}. ${esc(s)}</li>`).join("");
    parts.push(`<div class="finding-section">
      <div class="finding-section-title">Validation</div>
      <div class="finding-text"><ul style="list-style:none;padding:0">${steps}</ul></div>
    </div>`);
  }
  return parts.join("");
}

function renderConsolidatedFinding(cf: ConsolidatedFinding): string {
  const scoreImpactLabel =
    cf.totalProductionEquivalentScoreImpact !== undefined &&
    cf.totalProductionEquivalentScoreImpact !== cf.totalScoreImpact
      ? `-${cf.totalScoreImpact} adj. / -${cf.totalProductionEquivalentScoreImpact} prod.`
      : `-${cf.totalScoreImpact}`;

  const fpNotes =
    cf.falsePositiveNotes && cf.falsePositiveNotes.length > 0
      ? `<div class="finding-section">
          <div class="finding-section-title">False-positive Notes</div>
          <div class="finding-text"><ul>${cf.falsePositiveNotes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>
        </div>`
      : "";

  return `<details class="finding-card ${sevClass(cf.overallSeverity)}" id="finding-${esc(cf.id)}" data-severity="${esc(cf.overallSeverity)}">
    <summary class="finding-header">
      <span class="finding-toggle">▶</span>
      <span class="finding-id">${esc(cf.id)}</span>
      ${sevBadge(cf.overallSeverity)}
      <span class="finding-title">${esc(cf.title)}</span>
      <span class="finding-meta">
        <span class="resource-count">${cf.instances.length} resource${cf.instances.length !== 1 ? "s" : ""}</span>
        <span class="tag">score ${scoreImpactLabel}</span>
      </span>
    </summary>
    <div class="finding-body">
      <div class="finding-section">
        <div class="finding-section-title">Risk Summary</div>
        <div class="finding-text">${md(cf.riskSummary)}</div>
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Affected Resources (${cf.instances.length})</div>
        ${renderInstancesTable(cf.instances)}
      </div>
      <div class="finding-section">
        <div class="finding-section-title">Recommendation</div>
        <div class="finding-text">${md(cf.recommendation)}</div>
      </div>
      ${renderHowToInterpret(cf)}
      ${fpNotes}
      ${renderRemediationBlock(cf)}
    </div>
  </details>`;
}

function renderFindingsSection(report: Auth0AnalysisReport): string {
  const sevOrder: Severity[] = ["critical", "high", "medium", "low"];
  const bySev = new Map<Severity, ConsolidatedFinding[]>();
  for (const s of sevOrder) bySev.set(s, []);
  for (const cf of report.consolidatedFindings) {
    if (bySev.has(cf.overallSeverity)) {
      bySev.get(cf.overallSeverity)!.push(cf);
    }
  }

  const filterBtns = ["all", ...sevOrder]
    .map(
      (s) =>
        `<button class="filter-btn badge sev-${s === "all" ? "info" : s}${s === "all" ? " active" : ""}" data-filter="${s}" onclick="filterSeverity('${s === "all" ? "" : s}')">${s.toUpperCase()}</button>`
    )
    .join(" ");

  const controls = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
    <div>${filterBtns}</div>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="tag" onclick="toggleAll(true)" style="cursor:pointer">Expand all</button>
      <button class="tag" onclick="toggleAll(false)" style="cursor:pointer">Collapse all</button>
    </div>
  </div>`;

  const all = sevOrder.flatMap((s) => bySev.get(s) ?? []);
  if (all.length === 0) {
    return `<p style="color:var(--text-muted)">No actionable findings detected in scanned scope.</p>`;
  }

  return controls + `<div class="finding-list">${all.map(renderConsolidatedFinding).join("")}</div>`;
}

function renderCoverageTable(report: Auth0AnalysisReport): string {
  const rows = report.collectionStatus.coverage.map((c) => {
    const statusClass = `status-${c.status}`;
    return `<tr>
      <td><code>${esc(c.collector)}</code></td>
      <td><span class="${statusClass}">${esc(c.status)}</span></td>
      <td>${c.count !== undefined ? esc(String(c.count)) : "—"}</td>
      <td style="font-size:0.82em">${(c.requiredScopes ?? []).map((s: string) => `<code>${esc(s)}</code>`).join(", ")}</td>
      <td style="font-size:0.82em;color:var(--text-muted)">${esc(c.notes ?? "")}</td>
    </tr>`;
  });
  return `<div class="table-wrap"><table>
    <thead><tr><th>Collector</th><th>Status</th><th>Count</th><th>Required Scopes</th><th>Notes</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table></div>`;
}

function renderAssumptions(report: Auth0AnalysisReport): string {
  if (report.assumptions.length === 0) return "";
  return `<ul class="assumptions-list">${report.assumptions.map((a) => `<li>${md(a)}</li>`).join("")}</ul>`;
}

// ---------------------------------------------------------------------------
// Main render entry point
// ---------------------------------------------------------------------------

export function renderAuth0ReportHtml(report: Auth0AnalysisReport): string {
  const g = report.score.grade;
  const title = `Auth0 Posture Report — ${report.metadata.tenantDomain}`;

  const partialBanner = report.collectionStatus.partial
    ? `<div class="partial-banner">⚠ Partial scan: ${report.collectionStatus.failedCollectors.length} collector(s) failed/skipped. Categories whose key collectors did not run are reported as N/A.</div>`
    : "";

  const navLinks = [
    ["#summary", "Summary"],
    ["#categories", "Categories"],
    ["#remediation", "Remediation"],
    ["#findings", "Findings"],
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

    <!-- HERO -->
    <div class="hero" id="summary">
      <div class="grade-circle ${gradeClass(g)}">
        <span class="grade-letter">${esc(g)}</span>
        <span class="grade-score">${report.score.overall}/100</span>
      </div>
      <div class="hero-meta">
        <h1>${esc(report.metadata.tenantDomain)}</h1>
        <div class="sub">Environment: <strong>${esc(report.metadata.environment)}</strong> &nbsp;|&nbsp; Generated: ${esc(report.metadata.generatedAt)} &nbsp;|&nbsp; Scan: <code>${esc(report.metadata.scanId)}</code></div>
        ${renderStatCards(report)}
      </div>
    </div>

    ${partialBanner}

    <!-- INFO GRID -->
    ${renderInfoGrid(report)}

    <!-- ASSESSMENT ASSUMPTIONS -->
    <div class="section">
      <div class="section-title">Assessment Assumptions</div>
      ${renderAssumptions(report)}
    </div>

    <!-- CATEGORY BREAKDOWN -->
    <div class="section" id="categories">
      <div class="section-title">Category Breakdown</div>
      ${renderCategoryBars(report)}
    </div>

    <!-- REMEDIATION PLAN -->
    <div class="section" id="remediation">
      <div class="section-title">Recommended Remediation Plan</div>
      ${renderRemediationPlan(report)}
    </div>

    <!-- DETAILED FINDINGS -->
    <div class="section" id="findings">
      <div class="section-title">Detailed Findings</div>
      ${renderFindingsSection(report)}
    </div>

    <!-- RESOURCE COVERAGE -->
    <div class="section" id="coverage">
      <div class="section-title">Resource Coverage</div>
      ${renderCoverageTable(report)}
    </div>

  </div><!-- /page-wrap -->

  <script>${JS}</script>
</body>
</html>`;
}

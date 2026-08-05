import {
  ComplianceControlEvidence,
  ComplianceFramework,
  ComplianceMappingResult
} from "../../compliance";

const FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  nis2: "NIS2",
  iso27001: "ISO/IEC 27001/27002",
  soc2: "SOC 2"
};

function esc(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function renderComplianceMappingMarkdown(
  mapping: ComplianceMappingResult
): string {
  const lines: string[] = [];
  lines.push("## Compliance Evidence Mapping");
  lines.push("");
  lines.push(
    "This report provides identity-system evidence that may support selected compliance control areas. It does not certify compliance or prove operating effectiveness."
  );
  lines.push("");
  lines.push(
    `- **Frameworks:** ${mapping.frameworks.map(labelFramework).join(", ")}`
  );
  lines.push(
    `- **Mapped findings:** ${mapping.summary.mappedFindings} / ${mapping.summary.totalFindings}`
  );
  lines.push(
    `- **Controls with mapped findings:** ${mapping.summary.controlsWithFindings}`
  );
  lines.push("- **Manual evidence:** required for all mapped frameworks.");
  lines.push("");

  for (const framework of mapping.frameworks) {
    const controls = mapping.controls.filter(
      (control) => control.framework === framework
    );
    lines.push(`### ${labelFramework(framework)}`);
    lines.push("");
    renderControlTable(lines, controls);
    renderNotAssessed(lines, controls);
  }

  lines.push("### Compliance Limitations");
  lines.push("");
  for (const limitation of mapping.limitations) {
    lines.push(`- ${limitation}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function renderComplianceMappingHtml(
  mapping: ComplianceMappingResult
): string {
  return `<style>
.compliance-panel {
  background: rgba(34,38,58,.65);
  border: 1px solid var(--border, #2e3250);
  border-radius: 10px;
  margin-top: 16px;
  padding: 16px;
}
.compliance-muted { color: var(--text-muted, #8892a4); }
.compliance-panel ul { padding-left: 18px; }
.compliance-panel li { margin-bottom: 4px; }
</style>
<div class="page-wrap">
  <div class="section" id="compliance">
    <div class="section-title">Compliance Evidence Mapping</div>
    <div class="compliance-panel">
      <p>This report provides identity-system evidence that may support selected compliance control areas. It does not certify compliance or prove operating effectiveness.</p>
      <p class="compliance-muted">Frameworks: ${esc(
        mapping.frameworks.map(labelFramework).join(", ")
      )}. Mapped findings: ${esc(mapping.summary.mappedFindings)} / ${esc(
        mapping.summary.totalFindings
      )}. Controls with mapped findings: ${esc(
        mapping.summary.controlsWithFindings
      )}.</p>
    </div>
    ${mapping.frameworks.map((framework) => renderFrameworkHtml(mapping, framework)).join("")}
    <div class="compliance-panel">
      <h3>Compliance Limitations</h3>
      ${renderHtmlList(mapping.limitations)}
    </div>
  </div>
</div>`;
}

export function appendComplianceMappingHtml(
  html: string,
  mapping: ComplianceMappingResult
): string {
  const section = renderComplianceMappingHtml(mapping);
  return html.includes("</body>")
    ? html.replace("</body>", `${section}\n</body>`)
    : `${html}\n${section}`;
}

function renderFrameworkHtml(
  mapping: ComplianceMappingResult,
  framework: ComplianceFramework
): string {
  const controls = mapping.controls.filter(
    (control) => control.framework === framework
  );
  const assessed = controls.filter((control) => control.relatedFindings.length > 0);
  const notAssessed = controls.filter(
    (control) => control.relatedFindings.length === 0
  );

  return `<div class="section">
    <div class="section-title">${esc(labelFramework(framework))}</div>
    <div class="table-wrap"><table>
      <thead>
        <tr>
          <th>Control Area</th>
          <th>Evidence Strength</th>
          <th>Mapped Findings</th>
          <th>Manual Evidence Required</th>
          <th>Caveats</th>
        </tr>
      </thead>
      <tbody>
        ${assessed.map(renderControlRowHtml).join("")}
      </tbody>
    </table></div>
    <div class="compliance-panel">
      <h3>Not Assessed / No Mapped Findings</h3>
      ${
        notAssessed.length === 0
          ? `<p class="compliance-muted">Every configured ${esc(
              labelFramework(framework)
            )} control area has at least one mapped identity finding.</p>`
          : renderHtmlList(
              notAssessed
                .slice(0, 10)
                .map(
                  (control) =>
                    `${control.controlReference} — ${control.controlName}: no mapped findings in this report. This is not a compliance conclusion.`
                )
            )
      }
    </div>
  </div>`;
}

function renderControlRowHtml(control: ComplianceControlEvidence): string {
  const findings = control.relatedFindings
    .slice(0, 6)
    .map(
      (finding) =>
        `${finding.findingId} (${finding.severity}, ${finding.relevance})`
    );
  return `<tr>
    <td><strong>${esc(control.controlReference)}</strong><br>${esc(control.controlName)}<br><span class="compliance-muted">${esc(control.reportWordingGuidance)}</span></td>
    <td>${esc(control.coverage)}</td>
    <td>${renderHtmlList(findings, "No mapped findings.")}</td>
    <td>${renderHtmlList(control.manualEvidence.slice(0, 5))}</td>
    <td>${renderHtmlList(control.caveats.slice(0, 4))}</td>
  </tr>`;
}

function renderControlTable(
  lines: string[],
  controls: ComplianceControlEvidence[]
): void {
  const assessed = controls.filter((control) => control.relatedFindings.length > 0);
  if (assessed.length === 0) {
    lines.push("_No mapped findings for this framework in the current report._");
    lines.push("");
    return;
  }

  lines.push(
    "| Control area | Evidence strength | Mapped findings | Manual evidence required | Caveats |"
  );
  lines.push("|---|---|---|---|---|");
  for (const control of assessed) {
    const findings = control.relatedFindings
      .slice(0, 6)
      .map(
        (finding) =>
          `${finding.findingId} (${finding.severity}, ${finding.relevance})`
      )
      .join("<br>");
    lines.push(
      `| ${escapePipe(`${control.controlReference} — ${control.controlName}`)} | ${control.coverage} | ${escapePipe(findings)} | ${escapePipe(control.manualEvidence.slice(0, 5).join("; "))} | ${escapePipe(control.caveats.slice(0, 4).join("; "))} |`
    );
  }
  lines.push("");
}

function renderNotAssessed(
  lines: string[],
  controls: ComplianceControlEvidence[]
): void {
  const notAssessed = controls.filter(
    (control) => control.relatedFindings.length === 0
  );
  lines.push("#### Not Assessed / No Mapped Findings");
  lines.push("");
  if (notAssessed.length === 0) {
    lines.push("_Every configured control area has at least one mapped identity finding._");
  } else {
    for (const control of notAssessed.slice(0, 10)) {
      lines.push(
        `- **${control.controlReference} — ${control.controlName}:** no mapped findings in this report. This is not a compliance conclusion.`
      );
    }
  }
  lines.push("");
}

function renderHtmlList(values: string[], empty = "None recorded."): string {
  if (values.length === 0) return `<p class="compliance-muted">${esc(empty)}</p>`;
  return `<ul>${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

function labelFramework(framework: ComplianceFramework): string {
  return FRAMEWORK_LABELS[framework];
}

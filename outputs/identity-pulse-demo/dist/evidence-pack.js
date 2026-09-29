/* Browser-only sample export. This does not add an evidence-pack CLI command. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = (values, empty = 'Not supplied.') => values.length ? `<ul>${values.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : `<p>${esc(empty)}</p>`;
  function build(report, evidence, scenario) {
    const r = JSON.parse(JSON.stringify(report));
    const matchingSource = evidence?.provider === r.provider.id && evidence?.target === r.tenant.primaryIdentifier && evidence?.collectedAt === r.provider.collectedAt;
    const recommendations = r.remediationPlan.buckets.flatMap(bucket => bucket.items.map(item => ({...item, window: bucket.window})));
    return {
      sample: true,
      generatedAt: new Date().toISOString(),
      scenario,
      source: matchingSource ? evidence.source : 'No matching control snapshot',
      report: r,
      controls: (evidence?.controls || []).map(control => {
        const covered = r.coverage.collectors.some(c => c.collector === control.collector && c.status === 'success');
        return matchingSource && covered ? {...control} : {...control, status:'Not assessed', settings:null, note:'Matching, successfully collected evidence is not available.'};
      }),
      actions: r.findings.map(f => ({
        findingId:f.id, title:f.title,
        recommendation:recommendations.find(i => i.findingId === f.id)?.action || f.recommendation,
        window:recommendations.find(i => i.findingId === f.id)?.window || 'Not supplied',
        owner:'Unassigned', status:'Recommended — no completion recorded',
        reportedCompletion:'Not supplied', remediationEvidence:'Not supplied', verification:'Not verified',
        validationSteps:f.validationSteps || [],
      })),
    };
  }
  function content(pack, compact = false) {
    const r = pack.report, preview = Boolean(r.demo?.illustrative);
    const unassessed = r.categories.filter(c => !c.assessed).map(c => c.name);
    const markup = `<div class="pack-document">
      <div class="pack-banner"><strong>SAMPLE EVIDENCE PACK</strong><p>${preview?'Illustrative provider preview · connector not implemented · no environment assessed.':'Synthetic assessment · auditor-supporting material.'} Not NIS2 certification or proof of compliance.</p></div>
      <p class="pack-provenance">Prepared ${esc(pack.generatedAt)}<br>${preview?'Hand-authored example · no collection date or engine report':'Report generated '+esc(r.generatedAt)+'<br>Configuration collected '+esc(r.provider.collectedAt)}<br>Source: ${esc(pack.source)}</p>
      <section><h2>01 · What was checked</h2>
        <dl class="pack-facts"><div><dt>Provider</dt><dd>${esc(r.provider.displayName || r.provider.id)}</dd></div><div><dt>Environment</dt><dd>${esc(r.environment)} · synthetic</dd></div><div><dt>Assessment target</dt><dd>${esc(r.tenant.displayName || r.tenant.primaryIdentifier)}</dd></div><div><dt>Sample</dt><dd>${esc(pack.scenario)}</dd></div><div><dt>Posture score</dt><dd>${preview?'Not calculated · illustrative preview':esc(r.score.overall)+' / 100 · '+esc(r.score.grade)}</dd></div></dl>
        <p>${preview?'Scope: fictional configuration and simulated collection outcomes below. There are no implemented provider rules or collectors for this preview.':'Scope: configuration represented by the collectors below, evaluated with the current provider-specific rules.'} This is not an exhaustive assessment of NIS2 obligations.</p>
        <h3>${preview?'Illustrated areas':'Assessed categories'}</h3>${list(r.categories.filter(c => c.assessed).map(c => c.name))}
        <div class="table-wrap"><table><thead><tr><th>Collector</th><th>State</th><th>Resources</th><th>Required scopes</th></tr></thead><tbody>${r.coverage.collectors.map(c => `<tr><td>${esc(c.collector)}</td><td>${esc(c.status)}</td><td>${esc(c.count ?? 'Not supplied')}</td><td>${esc((c.requiredScopes || []).join(', ') || 'Not supplied')}</td></tr>`).join('')}</tbody></table></div>
        <p>Collector success does not establish exhaustive coverage. A score is a posture indicator, not a compliance verdict.</p>
      </section>
      <section><h2>02 · Gaps and unassessed areas</h2>
        <p><strong>${r.findings.length} findings · ${r.coverage.partial ? 'partial coverage reported' : 'no collector gaps reported'}</strong></p>
        <h3>Unassessed categories</h3>${list(unassessed, 'No categories marked unassessed by the report. Other limitations still apply.')}
        <h3>Unsuccessful collectors</h3>${list(r.coverage.collectors.filter(c => c.status !== 'success').map(c => `${c.collector}: ${c.status}${c.notes ? ' — ' + c.notes : ''}`), 'None reported.')}
        <h3>Missing scopes</h3>${list(r.coverage.missingScopes, 'None reported; this does not establish complete access.')}
        <h3>Assessment limitations</h3>${list(r.limitations)}
        <h3>Assumptions</h3>${list(r.assumptions || [])}
        ${r.findings.map(f => `<article class="pack-entry"><h3>${esc(f.title)}</h3><p class="pack-label">${esc(f.id)} · ${esc(f.severity)} · ${esc(f.classification)} · ${esc(f.confidence)} confidence</p><p><strong>${preview?'Illustrative evidence:':'Observed evidence:'}</strong> ${esc(f.evidence.summary)}</p><p><strong>Business risk:</strong> ${esc(f.businessRisk)}</p>${f.falsePositiveNotes.length ? `<p><strong>Context and exceptions</strong></p>${list(f.falsePositiveNotes)}` : ''}</article>`).join('') || '<p>No findings in this fixture. This does not prove absence of risk.</p>'}
      </section>
      <section><h2>03 · How gaps were addressed</h2><p>No completed remediation or validation results are recorded in these samples. The entries below are recommendations awaiting ownership and verification.</p>
        ${pack.actions.map(a => `<article class="pack-entry"><h3>${esc(a.findingId)} · ${esc(a.title)}</h3><p><strong>Recommended action:</strong> ${esc(a.recommendation)}</p><p><strong>Suggested timing:</strong> ${esc(a.window)}</p><dl class="pack-facts"><div><dt>Owner</dt><dd>${esc(a.owner)}</dd></div><div><dt>Status</dt><dd>${esc(a.status)}</dd></div><div><dt>Reported completion</dt><dd>${esc(a.reportedCompletion)}</dd></div><div><dt>Remediation evidence</dt><dd>${esc(a.remediationEvidence)}</dd></div><div><dt>Verification</dt><dd>${esc(a.verification)}</dd></div></dl><p><strong>Suggested validation steps</strong></p>${list(a.validationSteps, 'No rule-specific steps supplied; engineering review is required.')}</article>`).join('') || '<p>No finding-linked recommendations in this fixture. Remediation history is not supplied.</p>'}
      </section>
      <section><h2>04 · Security controls and policies</h2><p>${preview?'These are hand-authored fictional settings for the provider preview; they are not observations from a provider.':'These are observed settings from the matching synthetic snapshot.'} A configuration observation is separate from a recommendation, a reported change or a verified outcome. Runtime effectiveness and organizational policy approval have not been verified.</p>
        ${pack.controls.map(c => `<article class="pack-entry"><h3>${esc(c.name)}</h3><p class="pack-label">${esc(c.status)}</p>${c.settings !== null ? `<pre>${esc(JSON.stringify(c.settings, null, 2))}</pre>` : '<p>No evidence available. Do not infer that this control is enabled or disabled.</p>'}<p>${esc(c.note)}</p><p class="pack-provenance">Source field: ${esc(c.sourcePath)} · collector: ${esc(c.collector)}</p></article>`).join('')}
      </section>
    </div>`;
    if (!compact) return markup;
    let index = 0;
    return markup.replace(/<section><h2>(.*?)<\/h2>/g, (_, title) => `<details class="pack-section" ${index++ === 0 ? 'open' : ''}><summary>${title}</summary><div>`).replace(/<\/section>/g, '</div></details>');
  }
  const exportStyles = `body{font:16px/1.65 system-ui,sans-serif;color:#141429;background:#fff;margin:0}main{max-width:960px;margin:auto;padding:40px 24px}h1{font-size:30px}h2{margin:0 0 16px;font-size:24px}h3{font-size:17px;margin:18px 0 8px}p{margin:8px 0}section{margin-top:36px;padding-top:24px;border-top:2px solid #83219b}.pack-banner{padding:20px;background:#141429;color:#fff;border-left:6px solid #7addc6}.pack-provenance,.pack-label{font-size:13px;color:#4a4a65;overflow-wrap:anywhere}.pack-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pack-facts dt{font-size:13px;color:#4a4a65}.pack-facts dd{margin:2px 0;overflow-wrap:anywhere}.pack-entry{padding:14px 0;border-top:1px solid #c9c9d8;break-inside:avoid}table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:10px;border:1px solid #c9c9d8;text-align:left;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f0f0f6;padding:16px;font-size:13px}.table-wrap{overflow:auto}@media(max-width:500px){.pack-facts{grid-template-columns:1fr}main{padding:24px 16px}}@media print{main{padding:0}.table-wrap{overflow:visible}a{color:inherit}}`;
  function html(pack) {
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Identity Pulse — sample evidence pack</title><style>${exportStyles}</style></head><body><main><h1>Identity Pulse · NIS2 Material</h1>${content(pack)}</main></body></html>`;
  }
  window.PulseEvidence = {build, content, html};
})();

/* Plain-language presentation of existing findings, without changing their assessment. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const briefs = {
    'AUTH-CLI-004': ['Stolen access could last too long', 'Ask the identity team to confirm the risk and propose a safe limit on long-lived access.'],
    'AUTH-CLI-005': ['An application is missing its expected identity check', 'Assign an application owner to restore the appropriate authentication method and validate access.'],
    'AUTH-EXT-001': ['Legacy login components need a migration plan', 'Agree ownership and a migration plan before the support deadline stated in the finding.'],
    'AUTH-SEC-004': ['Password-guessing protection is switched off', 'Prioritize restoring this protection and ask for evidence that login still works correctly.'],
    'AUTH-SEC-005': ['Compromised-password protection is switched off', 'Agree how compromised passwords should be blocked and how the change will be checked.'],
    'AUTH-SEC-006': ['Automated attack protection needs review', 'Ask the identity team to review IP throttling and justify any exception before accepting the risk.'],
    'AUTH-SEC-001': ['Sensitive customer actions need an MFA review', 'Agree which sensitive journeys need a second factor; ask the team to verify those controls.'],
    'AUTH-OBS-001': ['Security logs lack an external destination', 'Agree where security logs should be retained and who will monitor them.'],
    'AUTH-COV-001': ['Some security controls could not be checked', 'Ask the assessment owner to resolve collection gaps before drawing conclusions about these controls.'],
    'OKTA-COV-001': ['Some security controls could not be checked', 'Ask the assessment owner to resolve collection gaps before drawing conclusions about these controls.'],
    'OKTA-MON-001': ['Security logs lack an external destination', 'Agree where security logs should be retained and who will monitor them.'],
    'OKTA-APP-001': ['Some applications use older sign-in methods', 'Ask the application owners to confirm which methods are needed and plan any migration.'],
    'OKTA-POL-002': ['Stronger sign-in protection needs review', 'Ask the team to confirm available authenticators and the requirements for sensitive sign-ins.'],
    'OKTA-ADM-001': ['Powerful administrator access needs review', 'Confirm who needs high-level access and who owns the access-review process.'],
    'OKTA-NET-001': ['A trusted destination uses an unencrypted connection', 'Ask the application owner to review the insecure origin and plan a move to HTTPS.'],
    'OKTA-HOOK-001': ['Identity events may travel without encryption', 'Ask the integration owner to review the destination and secure the connection.'],
    'OKTA-USR-002': ['Unused accounts may still have access', 'Ask account owners to confirm whether dormant accounts still need access.'],
  };
  const title = finding => briefs[finding.id]?.[0] || finding.title;
  const decision = finding => briefs[finding.id]?.[1] || (finding.id.startsWith('DEMO-') ? finding.recommendation : null) || 'Ask your technical contact to confirm the recommendation, assign an owner and agree how the result will be verified.';
  const impacts = {
    'AUTH-CLI-004': 'Compromised access could remain usable for a long time after an account is breached.',
    'AUTH-CLI-005': 'An application may be impersonated, exposing the services it can access.',
    'AUTH-EXT-001': 'Unsupported login components can disrupt customer journeys and create last-minute migration work.',
    'AUTH-SEC-004': 'Attackers can repeatedly guess passwords, increasing the chance of account takeover.',
    'AUTH-SEC-005': 'Reused, leaked passwords can leave customer accounts exposed.',
    'AUTH-SEC-006': 'Automated attacks may be harder to slow down before they affect customers.',
    'AUTH-SEC-001': 'Sensitive customer actions may depend on a password alone unless additional controls are in place.',
    'AUTH-OBS-001': 'Missing externally retained logs can make security incidents harder to investigate.',
    'OKTA-MON-001': 'Missing externally retained logs can make security incidents harder to investigate.',
    'AUTH-COV-001': 'Unchecked controls remain unknown, even when the posture score looks strong.',
    'OKTA-COV-001': 'Unchecked controls remain unknown, even when the posture score looks strong.',
    'OKTA-APP-001': 'Older sign-in methods can make access credentials easier to steal.',
    'OKTA-POL-002': 'Sensitive sign-ins may rely on weaker authentication factors.',
    'OKTA-ADM-001': 'Powerful access increases the potential impact of an account compromise and needs clear ownership.',
    'OKTA-NET-001': 'Sign-in information may be exposed through an insecure trusted destination.',
    'OKTA-HOOK-001': 'Identity events and attached sensitive information could be exposed in transit.',
    'OKTA-USR-002': 'Accounts that are no longer needed may still provide access to the organization.',
  };
  const impact = finding => impacts[finding.id] || finding.businessRisk;
  const status = finding => finding.classification === 'confirmed-risk' ? 'Confirmed configuration risk' : finding.classification === 'requires-validation' ? 'Needs validation' : 'Advisory · review context';
  const actions = report => report.remediationPlan.buckets.flatMap(bucket => bucket.items);
  function priorities(report) {
    const severity = {critical:0, high:1, medium:2, low:3, info:4};
    const classification = {'confirmed-risk':0, 'requires-validation':1, advisory:2};
    const sorted = [...report.findings].sort((a,b) => (severity[a.severity] ?? 5) - (severity[b.severity] ?? 5) || (classification[a.classification] ?? 3) - (classification[b.classification] ?? 3));
    const areas = new Set();
    return sorted.filter(finding => {
      if (areas.has(finding.category)) return false;
      areas.add(finding.category); return true;
    }).slice(0,3);
  }
  function metrics(report) {
    const all = report.findings, confirmed = all.filter(f => f.classification === 'confirmed-risk').length;
    const gaps = report.coverage.collectors.filter(c => c.status !== 'success').length;
    return `<article><div><strong>${all.length}</strong><span>Total findings</span></div><p>${confirmed} confirmed · ${all.length - confirmed} to validate or review</p><button class="textlink" data-view="findings">Review business impact</button></article>
      <article><div><strong>${actions(report).length}</strong><span>Recommended actions</span></div><p>${actions(report).length ? 'Ownership and completion are not recorded.' : 'No actions listed; evidence still needs review.'}</p><button class="textlink" data-view="plan">Review next actions</button></article>
      <article><div><strong>${gaps}</strong><span>${report.demo?.illustrative?'Example coverage gaps':'Collection gaps'}</span></div><p>${gaps ? 'Some controls remain unknown.' : report.demo?.illustrative?'No gaps represented in this example.':'No failed or skipped collections reported.'}</p><button class="textlink" data-view="nis2" data-evidence-limits>Review evidence limits</button></article>`;
  }
  function decisions(report) {
    const selected = priorities(report);
    return `<section class="decision-panel"><div class="panel-head"><div><p class="eyebrow">What needs a decision?</p><h2>${selected.length ? 'Start with these conversations.' : 'Confirm what the evidence can support.'}</h2><p>${selected.length ? 'Highest-severity findings across distinct assessment areas.' : 'No findings in this sample.'}</p></div><button class="textlink" data-view="findings">All findings (${report.findings.length})</button></div>
      ${selected.map(f => `<article class="decision-row"><div><span class="decision-class">${esc(f.severity)} · ${esc(status(f))}</span><h3>${esc(title(f))}</h3><p>${esc(impact(f))}</p></div><div class="decision-next"><span>Next decision</span><p>${esc(decision(f))}</p><button type="button" class="textlink" data-explore="${esc(f.id)}">Review finding ↗</button></div></article>`).join('') || '<div class="empty-decision"><h3>Request the supporting records</h3><p>Ask the accountable teams for approved policies and validation evidence. These are not supplied in the assessment.</p><button class="textlink" data-view="nis2">Review NIS2 Material</button></div>'}</section>`;
  }
  function material(report, evidence, sections = '', obligations = '') {
    const gaps = report.coverage.collectors.filter(c => c.status !== 'success');
    const preview = Boolean(report.demo?.illustrative);
    return `<section class="nis2-focus" aria-labelledby="nis2-heading"><div class="nis2-lead"><span class="eyebrow">NIS2 Material</span><h2 id="nis2-heading">Prepare your<br><span>NIS2 evidence.</span></h2><p>${preview?'Explore how example findings, action plans and illustrative controls would appear in an evidence pack.':'Bring the identity-security findings, action plans and observed controls into one reviewable record.'}</p><div class="actions"><button class="button primary" id="generate-pack" data-generate-pack>Generate evidence pack</button><span class="pill amber">Supporting evidence incomplete</span></div></div>
      ${obligations}</section>
      ${sections}
      ${decisions(report)}
      <details class="material-scope" id="material-scope"><summary>Assessment boundaries & uncollected areas</summary><p>This view covers identity configuration only. Legal applicability and the wider NIS2 obligations are not assessed. A generated pack may still contain missing or unverified evidence.</p><h3>Collection gaps</h3>${gaps.length ? `<ul>${gaps.map(c => `<li>${esc(c.collector)} · ${esc(c.status)}</li>`).join('')}</ul>` : '<p>No failed or skipped collectors reported. Collection success does not establish exhaustive coverage.</p>'}<h3>Assessment limitations</h3><ul>${report.limitations.map(l => `<li>${esc(l)}</li>`).join('')}</ul><p class="section-note">${preview?'Hand-authored preview. No configuration was collected and no report was generated by the engine.':'Configuration collected '+esc(report.provider.collectedAt)+' · report generated '+esc(report.generatedAt)+'.'} Independent synthetic fixtures; not before/after remediation evidence.</p></details>`;
  }
  const progressClass = v => v === 'In Progress' ? 'amber' : ['Verified', 'Completed'].includes(v) ? 'green' : v === 'Closed' ? 'blue' : '';
  const dateText = v => v ? new Date(v + 'T00:00:00Z').toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'}) : '';
  // statusNote: optional (finding, tracking) => text shown under the status (Technical User).
  function plan(report, items, trackOf, statusNote = null) {
    if (!items.length) return '<p class="empty" role="status">No actions match this selection.</p>';
    return `<div class="table-wrap dash-wrap"><table class="dash-table plan-table"><thead><tr><th scope="col">Severity</th><th scope="col">Finding</th><th scope="col">Status</th><th scope="col">Owner</th><th scope="col">Target date</th><th scope="col">Recommended corrective action</th><th scope="col">Additional comments</th><th scope="col"><span class="sr-only">Explore</span></th></tr></thead><tbody>${items.map(a => {
      const f = report.findings.find(x => x.id === a.findingId), t = trackOf(a.findingId);
      return `<tr class="dash-row" data-explore="${esc(a.findingId)}" tabindex="0" aria-label="Update action plan: ${esc(f ? title(f) : a.action)}"><td>${f ? `<span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span>` : ''}</td><td><strong>${esc(f ? title(f) : a.findingId)}</strong></td><td><span class="pill ${progressClass(t.status)}">${esc(t.status)}</span>${statusNote && f && statusNote(f, t) ? `<small class="status-note">${esc(statusNote(f, t))}</small>` : ''}</td><td>${t.owner ? esc(t.owner) : '<span class="muted">Unassigned</span>'}</td><td>${t.date ? esc(dateText(t.date)) : '<span class="muted">Not set</span>'}</td><td class="dash-action"><p>${esc(a.action)}</p><small><b>Expected outcome:</b> ${esc(a.expectedOutcome)}</small></td><td class="plan-comment"><textarea data-row-comment="${esc(a.findingId)}" rows="2" placeholder="Add a comment" aria-label="Additional comments for ${esc(f ? title(f) : a.action)}">${esc(t.comments)}</textarea></td><td><span class="arrow" aria-hidden="true">↗</span></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  const actionFor = (report, finding) => actions(report).find(a => a.findingId === finding.id);
  const sevClass = s => ['critical','high'].includes(s) ? 'red' : s === 'medium' ? 'amber' : 'blue';
  const typeClass = f => f.classification === 'confirmed-risk' ? 'red' : 'amber';
  function dashboard(report, findings) {
    if (!findings.length) return '<p class="empty" role="status">No findings match this selection.</p>';
    return `<div class="table-wrap dash-wrap"><table class="dash-table"><thead><tr><th scope="col">Severity</th><th scope="col">Finding</th><th scope="col">Type</th><th scope="col">Action Plan</th><th scope="col"><span class="sr-only">Explore</span></th></tr></thead><tbody>${findings.map(f => {
      const a = actionFor(report, f);
      return `<tr class="dash-row" data-explore="${esc(f.id)}" tabindex="0" aria-label="Explore ${esc(title(f))}"><td><span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span></td><td><strong>${esc(title(f))}</strong><small>${esc(impact(f))}</small></td><td><span class="pill ${typeClass(f)}">${esc(status(f))}</span></td><td class="dash-action"><p>${esc(a ? a.action : decision(f))}</p>${a ? `<small><b>Expected outcome:</b> ${esc(a.expectedOutcome)}</small>` : ''}</td><td><span class="arrow" aria-hidden="true">↗</span></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  const progress = ['Not Started', 'In Progress', 'Verified', 'Completed', 'Closed'];
  const opt = (value, selected) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(value)}</option>`;
  function tracker(f, track, owners) {
    return `<div class="plan-form" data-track="${esc(f.id)}"><label class="plan-field"><span>Owner</span><select data-field="owner"><option value="" ${track.owner ? '' : 'selected'}>Unassigned</option>${owners.map(o => opt(o, track.owner)).join('')}<option value="__new">+ Add new name…</option></select></label><div class="add-owner" hidden><input type="text" data-new-owner placeholder="Full name" aria-label="New owner name"><button type="button" class="button primary" data-add-owner>Add</button></div>
      <label class="plan-field"><span>Target date</span><input type="date" data-field="date" value="${esc(track.date)}"></label>
      <label class="plan-field"><span>Completion / validation</span><select data-field="status">${progress.map(v => opt(v, track.status)).join('')}</select></label>
      <label class="plan-field"><span>Additional comments</span><textarea data-field="comments" rows="3" placeholder="Add context, decisions or links to evidence">${esc(track.comments)}</textarea></label></div>`;
  }
  // extra: optional {left, right, bottom} HTML from the Technical User layer.
  function explore(report, f, track, owners, extra = null) {
    const a = actionFor(report, f), bucket = report.remediationPlan.buckets.find(b => b.items.includes(a));
    return `<div class="explore-head"><span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span><span class="pill ${typeClass(f)}">${esc(status(f))}</span></div><h2 id="explore-title">${esc(title(f))}</h2>
      <div class="explore-grid"><section class="explore-card"><p class="eyebrow">Finding</p><h3>Why it matters</h3><p>${esc(impact(f))}</p><h3>Technical finding</h3><p>${esc(f.title)}</p><h3>${report.demo?.illustrative ? 'Illustrative evidence' : 'Observed evidence'}</h3><div class="evidence">${esc(f.evidence.summary)}</div><h3>Affected resources</h3><p>${esc(f.affectedResources.map(x => x.displayName).join(', ') || 'Not specified')}</p>${extra ? extra.left : f.validationSteps.length ? `<details class="technical-evidence"><summary>How to validate</summary><ul>${f.validationSteps.map(v => `<li>${esc(v)}</li>`).join('')}</ul></details>` : ''}</section>
      <section class="explore-card"><p class="eyebrow">Action Plan</p>${bucket ? `<span class="pill">${esc(bucket.name)} · ${esc(bucket.window)}</span>` : ''}<h3>Recommended change</h3><p>${esc(a ? a.action : f.recommendation)}</p>${a ? `<h3>Expected outcome</h3><p>${esc(a.expectedOutcome)}</p>` : ''}<h3>Next decision</h3><p>${esc(decision(f))}</p>${tracker(f, track, owners)}${extra ? extra.right : ''}</section></div>${extra?.bottom || ''}
      <p class="section-note">${f.classification === 'requires-validation' ? 'Engineering validation is needed before treating this as a confirmed risk.' : 'Review the observed configuration and its context with your technical contact.'}${report.demo?.illustrative ? ' Fictional example · connector not implemented.' : ''}</p>`;
  }

  /* Summary charts above the Findings and Action Plans tables. Each mark is a button that sets the matching filter. */
  const sevOrder = ['critical', 'high', 'medium', 'low', 'info'];
  const sevColor = {critical: '#ffa3ae', high: '#f27b8e', medium: '#d95e75', low: '#b84a63', info: '#963f5c'};
  const typeCols = [['confirmed-risk', 'Confirmed risk'], ['requires-validation', 'Needs validation'], ['advisory', 'Advisory']];
  const statusColor = {'Not Started': '#8a8ab0', 'In Progress': '#f2ce86', Verified: '#3fa58e', Completed: '#7addc6', Closed: '#b7a6f0'};
  const cap = v => v[0].toUpperCase() + v.slice(1);
  const pct = (n, total) => total ? Math.round(n / total * 100) : 0;
  function stacked(parts, total, label) {
    const shown = parts.filter(p => p.count);
    return `<div class="stack" role="group" aria-label="${esc(label)}">${shown.map(p => `<button type="button" class="stack-seg ${p.dim ? 'dim' : ''}" style="flex:${p.count};--c:${p.color}" data-chart-filter="${esc(p.filter)}" data-tip="${esc(p.label)} · ${p.count} (${pct(p.count, total)}%)" aria-label="${esc(p.label)}: ${p.count}. Filter the table">${p.count / total >= .08 ? `<span>${p.count}</span>` : ''}</button>`).join('')}</div>
      <ul class="chart-legend">${parts.map(p => `<li><button type="button" class="${p.dim ? 'dim' : ''}" data-chart-filter="${esc(p.filter)}" ${p.count ? '' : 'disabled'}><i style="--c:${p.color}"></i>${esc(p.label)} <b>${p.count}</b></button></li>`).join('')}</ul>`;
  }
  function findingCharts(report, filters) {
    const fs = report.findings, total = fs.length;
    const parts = sevOrder.map(v => ({label: cap(v), count: fs.filter(f => f.severity === v).length, color: sevColor[v], filter: 'severity:' + v, dim: filters.severity !== 'all' && filters.severity !== v}));
    const rows = sevOrder.filter(v => fs.some(f => f.severity === v));
    const max = Math.max(1, ...rows.flatMap(v => typeCols.map(([t]) => fs.filter(f => f.severity === v && f.classification === t).length)));
    const matrix = `<table class="matrix"><caption class="sr-only">Findings by severity and type</caption><thead><tr><th scope="col"><span class="sr-only">Severity</span></th>${typeCols.map(([, l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead><tbody>${rows.map(v => `<tr><th scope="row">${cap(v)}</th>${typeCols.map(([t, l]) => {
      const n = fs.filter(f => f.severity === v && f.classification === t).length, a = n ? .16 + .64 * n / max : 0;
      const active = filters.severity === v && filters.type === t, dim = (filters.severity !== 'all' || filters.type !== 'all') && !active;
      return `<td><button type="button" class="cell ${a > .5 ? 'strong' : ''} ${active ? 'active' : ''} ${dim ? 'dim' : ''}" style="--a:${a.toFixed(2)}" data-chart-filter="matrix:${v}|${t}" data-tip="${cap(v)} · ${l} · ${n}" aria-label="${cap(v)}, ${l}: ${n}. Filter the table" ${n ? '' : 'disabled'}>${n || '–'}</button></td>`;
    }).join('')}</tr>`).join('')}</tbody></table>`;
    const critical = fs.filter(f => f.severity === 'critical').length;
    return `<div class="chart-row three"><article class="chart-card"><header><h3>Findings by severity</h3><p><strong>${critical}</strong> of ${total} are critical</p></header>${donut(parts, total)}</article>
      <article class="chart-card"><header><h3>Severity × type</h3><p>Confirmed risks versus findings that still need validation</p></header>${matrix}</article>
      ${coverageChart(report)}</div>`;
  }
  function coverageChart(report) {
    const all = report.coverage.collectors, ok = all.filter(c => c.status === 'success'), gaps = all.filter(c => c.status !== 'success');
    const preview = Boolean(report.demo?.illustrative), share = all.length ? ok.length / all.length : 0;
    const r = 46, c = 2 * Math.PI * r, len = share * c, name = v => String(v).replaceAll('_', ' ');
    return `<article class="chart-card"><header><h3>Assessment coverage</h3><p><strong>${pct(ok.length, all.length)}%</strong> of ${preview ? 'areas illustrated' : 'areas checked'}</p></header>
      <div class="donut-wrap"><svg class="donut" viewBox="0 0 120 120" role="img" aria-label="${ok.length} of ${all.length} areas checked"><circle cx="60" cy="60" r="${r}" class="coverage-rest"></circle>${ok.length ? `<circle cx="60" cy="60" r="${r}" class="coverage-done" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" transform="rotate(-90 60 60)" data-tip="Checked · ${ok.length} of ${all.length}"></circle>` : ''}<text x="60" y="58" class="donut-total">${ok.length}/${all.length}</text><text x="60" y="75" class="donut-label">${preview ? 'illustrated' : 'checked'}</text></svg>
      <div class="coverage-detail"><ul class="chart-legend vertical"><li><span class="legend-row"><i style="--c:#7addc6"></i>Checked <b>${ok.length}</b></span></li><li><span class="legend-row"><i style="--c:#727296"></i>Not checked <b>${gaps.length}</b></span></li></ul>
      ${gaps.length ? `<p class="coverage-note">Unknown, not safe:</p><div class="coverage-gaps">${gaps.map(g => `<span class="pill amber" data-tip="${esc(name(g.collector))} · ${esc(g.status)}">${esc(name(g.collector))}</span>`).join('')}</div>` : '<p class="coverage-note">No collection gaps reported. This does not prove every resource was covered.</p>'}
      <button type="button" class="textlink" data-view="nis2" data-evidence-limits>Review evidence limits</button></div></div></article>`;
  }
  function donut(parts, total) {
    const r = 46, c = 2 * Math.PI * r, gap = parts.filter(p => p.count).length > 1 ? 2.5 : 0;
    let offset = 0;
    const arcs = parts.filter(p => p.count).map(p => {
      const len = p.count / total * c, arc = `<circle class="donut-seg ${p.dim ? 'dim' : ''}" cx="60" cy="60" r="${r}" stroke="${p.color}" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${(c - Math.max(0, len - gap)).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" data-chart-filter="${esc(p.filter)}" data-tip="${esc(p.label)} · ${p.count} (${pct(p.count, total)}%)" tabindex="0" role="button" aria-label="${esc(p.label)}: ${p.count}. Filter the table"></circle>`;
      offset += len; return arc;
    }).join('');
    return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 120 120" aria-label="Findings by severity"><g transform="rotate(-90 60 60)">${arcs}</g><text x="60" y="58" class="donut-total">${total}</text><text x="60" y="75" class="donut-label">findings</text></svg>
      <ul class="chart-legend vertical">${parts.map(p => `<li><button type="button" class="${p.dim ? 'dim' : ''}" data-chart-filter="${esc(p.filter)}" ${p.count ? '' : 'disabled'}><i style="--c:${p.color}"></i>${esc(p.label)} <b>${p.count}</b><span class="legend-pct">${pct(p.count, total)}%</span></button></li>`).join('')}</ul></div>`;
  }
  const dueBuckets = [['overdue', 'Overdue', '#ff8e9c'], ['soon', 'Next 30 days', '#f2ce86'], ['quarter', '31–90 days', '#4fbfa6'], ['later', 'Later', '#b7a6f0'], ['none', 'No date', '#727296']];
  function dueBucket(t) {
    if (['Completed', 'Closed'].includes(t.status)) return 'done';
    if (!t.date) return 'none';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((new Date(t.date + 'T00:00:00') - today) / 864e5);
    return days < 0 ? 'overdue' : days <= 30 ? 'soon' : days <= 90 ? 'quarter' : 'later';
  }
  function planCharts(report, trackOf, owners, filters) {
    const items = actions(report), total = items.length, tracks = items.map(a => trackOf(a.findingId));
    const parts = Object.keys(statusColor).map(v => ({label: v, count: tracks.filter(t => t.status === v).length, color: statusColor[v], filter: 'status:' + v, dim: filters.status !== 'all' && filters.status !== v}));
    const done = tracks.filter(t => ['Completed', 'Closed'].includes(t.status)).length;
    const unassigned = tracks.filter(t => !t.owner).length;
    const rows = [...owners.map(o => [o, tracks.filter(t => t.owner === o).length, o]), ['Unassigned', unassigned, '']];
    const max = Math.max(1, ...rows.map(r => r[1]));
    return `<div class="chart-row three"><article class="chart-card"><header><h3>Progress by status</h3><p><strong>${done}</strong> of ${total} completed or closed</p></header>${stacked(parts, total, 'Actions by status')}</article>
      <article class="chart-card"><header><h3>Ownership</h3><p><strong>${unassigned}</strong> of ${total} actions have no owner</p></header><div class="owner-bars">${rows.map(([label, n, value]) => {
        const dim = filters.owner !== 'all' && filters.owner !== value;
        return `<button type="button" class="owner-bar ${value ? '' : 'unassigned'} ${dim ? 'dim' : ''}" data-chart-filter="owner:${esc(value)}" data-tip="${esc(label)} · ${n} action${n === 1 ? '' : 's'}" aria-label="${esc(label)}: ${n} actions. Filter the table"><span class="owner-name">${esc(label)}</span><span class="owner-track"><span style="width:${n ? Math.max(2, n / max * 100) : 0}%"></span></span><b>${n}</b></button>`;
      }).join('')}</div></article>
      <article class="chart-card"><header><h3>Due-date timeline</h3><p><strong>${tracks.filter(t => dueBucket(t) === 'overdue').length}</strong> overdue · open actions only</p></header><div class="owner-bars">${(() => {
        const counts = dueBuckets.map(([key]) => tracks.filter(t => dueBucket(t) === key).length), top = Math.max(1, ...counts);
        return dueBuckets.map(([key, label, color], i) => `<button type="button" class="owner-bar ${filters.due !== 'all' && filters.due !== key ? 'dim' : ''}" style="--c:${color}" data-chart-filter="due:${key}" data-tip="${label} · ${counts[i]} action${counts[i] === 1 ? '' : 's'}" aria-label="${label}: ${counts[i]} actions. Filter the table"><span class="owner-name">${label}</span><span class="owner-track"><span style="width:${counts[i] ? Math.max(2, counts[i] / top * 100) : 0}%"></span></span><b>${counts[i]}</b></button>`).join('');
      })()}</div></article></div>`;
  }
  window.PulseBusiness = {title, impact, status, metrics, decisions, material, plan, priorities, dashboard, explore, actions, findingCharts, planCharts, dueBucket, dueBuckets};
})();

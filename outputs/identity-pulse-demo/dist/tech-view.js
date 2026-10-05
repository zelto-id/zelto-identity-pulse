/* Tech SPOC: the shared workspace with a technical layer on the same findings, actions and evidence.
   Adds rule-level detail, the collector and API scope behind each finding, observed settings, validation-step
   tracking, collector-to-finding coverage and NIS2 traceability. Links into the technical architecture page. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const B = () => window.PulseBusiness;
  const sevClass = s => ['critical', 'high'].includes(s) ? 'red' : s === 'medium' ? 'amber' : 'blue';
  const progressClass = v => v === 'In Progress' ? 'amber' : ['Verified', 'Completed'].includes(v) ? 'green' : v === 'Closed' ? 'blue' : '';
  const cap = v => v ? v[0].toUpperCase() + v.slice(1) : '';

  // The collector whose data produced each finding (Auth0 and Okta CLI collectors). Preview providers
  // name their illustrated areas after the finding category, so those resolve by category.
  const byId = {
    'AUTH-SEC-001': 'guardian', 'AUTH-EXT-001': 'rules', 'AUTH-EXT-002': 'actions', 'AUTH-API-005': 'client_grants',
    'AUTH-UX-001': 'prompts', 'AUTH-UX-003': 'custom_domains',
    'OKTA-POL-002': 'authenticators', 'OKTA-NET-001': 'trusted_origins', 'OKTA-NET-002': 'network_zones', 'OKTA-MON-001': 'log_streams',
  };
  const byCategory = {
    tenantBaseline: 'tenant', applications: 'clients', connections: 'connections', apis: 'resource_servers', rbac: 'roles',
    actionsAndExtensibility: 'actions', monitoring: 'log_streams', attackProtection: 'attack_protection', brandingAndLoginExperience: 'branding',
    orgBaseline: 'org', usersAndLifecycle: 'users', applicationsAndSSO: 'apps', policiesAndAuthentication: 'policies',
    adminAndPrivilegedAccess: 'admin_roles', apiAccessManagement: 'authorization_servers', federationAndExtensibility: 'event_hooks',
  };
  function collectorFor(report, f) {
    if (/-COV(ERAGE)?-?\d*$/.test(f.id) || f.category === 'Coverage') return null;
    const name = byId[f.id] || byCategory[f.category] || f.category;
    return report.coverage.collectors.find(c => c.collector === name) || null;
  }
  const preview = report => Boolean(report.demo?.illustrative);
  // Links are built after page load, so they carry the current audience, provider and sample themselves.
  const flowLink = (params, label) => { const {audience, context} = window.PulseExperience; return `<a class="deep-link" href="technical-flow.html?${new URLSearchParams({audience, provider: context.provider, sample: context.sample, ...params})}">${esc(label)} <span aria-hidden="true">↗</span></a>`; };
  const stepsDone = t => (t.steps || []).filter(Boolean).length;
  const stepsText = (f, t) => f?.validationSteps?.length ? `${stepsDone(t)}/${f.validationSteps.length} validation steps` : '';

  function findingsTable(report, findings, trackOf) {
    if (!findings.length) return '<p class="empty" role="status">No findings match this selection.</p>';
    return `<div class="table-wrap dash-wrap"><table class="dash-table tech-table"><thead><tr><th scope="col">Severity</th><th scope="col">Finding</th><th scope="col">Type</th><th scope="col">Confidence</th><th scope="col">Data source</th><th scope="col">Action status</th><th scope="col"><span class="sr-only">Explore</span></th></tr></thead><tbody>${findings.map(f => {
      const c = collectorFor(report, f), t = trackOf(f.id);
      return `<tr class="dash-row" data-explore="${esc(f.id)}" tabindex="0" aria-label="Explore ${esc(B().title(f))}"><td><span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span></td><td><strong>${esc(B().title(f))}</strong><small class="rule-line"><code>${esc(f.id)}</code> ${esc(f.title)}</small></td><td><span class="pill ${f.classification === 'confirmed-risk' ? 'red' : 'amber'}">${esc(B().status(f))}</span></td><td><span class="conf conf-${esc(f.confidence)}">${esc(cap(f.confidence))}</span></td><td>${c ? `<code class="src">${esc(c.collector)}</code>${c.requiredScopes?.length ? `<small>${esc(c.requiredScopes.join(', '))}</small>` : ''}` : '<span class="muted">Coverage check</span>'}</td><td><span class="pill ${progressClass(t.status)}">${esc(t.status)}</span><small>${t.owner ? esc(t.owner) : 'Unassigned'}${stepsText(f, t) ? ` · ${stepsText(f, t)}` : ''}</small></td><td><span class="arrow" aria-hidden="true">↗</span></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  // Extra pop-up content: technical detail on the left, validation-step tracking on the right.
  function exploreExtra(report, f, controls, t) {
    const c = collectorFor(report, f), settings = c ? (controls?.controls || []).filter(x => x.collector === c.collector && x.settings) : [];
    const left = `<div class="tech-detail"><p class="eyebrow">Technical detail</p>
      <dl class="tech-facts"><div><dt>Rule</dt><dd><code>${esc(f.id)}</code></dd></div><div><dt>Classification</dt><dd>${esc(f.classification.replaceAll('-', ' '))}</dd></div><div><dt>Confidence</dt><dd>${esc(cap(f.confidence))}</dd></div><div><dt>Score impact</dt><dd>${preview(report) ? 'Not scored (preview)' : `−${esc(f.scoreImpact)} points`}</dd></div><div><dt>Data source</dt><dd>${c ? `<code>${esc(c.collector)}</code> · ${esc(c.status)}` : 'Assessment coverage'}</dd></div><div><dt>API scope</dt><dd>${c?.requiredScopes?.length ? `<code>${esc(c.requiredScopes.join(', '))}</code>` : preview(report) ? 'Not defined (proposed connector)' : '—'}</dd></div></dl>
      ${f.evidence.confidenceReason ? `<p class="muted">${esc(f.evidence.confidenceReason)}</p>` : ''}
      ${settings.length ? `<p class="settings-label">Observed settings in this data source</p>` : ''}${settings.map(s => `<h3>${esc(s.name)} · ${esc(s.status.toLowerCase())}</h3><pre class="settings-json">${esc(JSON.stringify(s.settings, null, 2))}</pre><p class="muted">${esc(s.note)}</p>`).join('')}
      ${f.falsePositiveNotes.length ? `<h3>Context & exceptions</h3><ul>${f.falsePositiveNotes.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : ''}
      <div class="deep-links">${flowLink({scenario: 'collect'}, preview(report) ? 'See the proposed collection design' : 'See how this is collected')}${c && c.status !== 'success' ? flowLink({scenario: 'failure', error: '403'}, 'Why this area was skipped') : ''}</div></div>`;
    const right = f.validationSteps.length ? `<div class="validation-steps" data-steps="${esc(f.id)}"><h3>Validation steps <span class="muted">${stepsDone(t)}/${f.validationSteps.length} done</span></h3>${f.validationSteps.map((s, i) => `<label class="step-check"><input type="checkbox" data-step-index="${i}" ${(t.steps || [])[i] ? 'checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div>` : '';
    return {left, right};
  }

  // Coverage: every collector with its scope and the findings that depend on it.
  function coverage(report) {
    const all = report.coverage.collectors, gaps = all.filter(c => c.status !== 'success');
    const linked = c => report.findings.filter(f => collectorFor(report, f)?.collector === c.collector);
    return `<section class="panel"><div class="panel-head"><div><h2>Coverage</h2><p>What each data source collected, the API scope it needs and the findings that depend on it. ${preview(report) ? 'Illustrated areas only; no connector or permissions are implemented.' : 'Collector success does not guarantee every resource was covered.'}</p></div><span class="pill ${gaps.length ? 'amber' : 'green'}">${all.length - gaps.length} / ${all.length} ${preview(report) ? 'illustrated' : 'collected'}</span></div>
      ${gaps.length ? `<div class="notice">${gaps.length} data source${gaps.length === 1 ? ' was' : 's were'} not collected. Findings that depend on ${gaps.length === 1 ? 'it' : 'them'} cannot be raised, so these areas are unknown, not safe. ${preview(report) ? '' : flowLink({scenario: 'failure', error: '403'}, 'How missing permissions are handled')}</div>` : ''}
      <div class="table-wrap dash-wrap"><table class="dash-table coverage-table"><thead><tr><th scope="col">Data source</th><th scope="col">Status</th><th scope="col">API scope</th><th scope="col">Resources</th><th scope="col">Findings from this source</th></tr></thead><tbody>${all.map(c => {
        const fs = linked(c);
        return `<tr><td><code class="src">${esc(c.collector)}</code></td><td><span class="pill ${c.status === 'success' ? 'green' : 'amber'}">${esc(c.status)}</span>${c.missingScopes?.length ? `<small>Missing: <code>${esc(c.missingScopes.join(', '))}</code></small>` : ''}</td><td>${c.requiredScopes?.length ? `<code>${esc(c.requiredScopes.join(', '))}</code>` : '<span class="muted">Not defined</span>'}</td><td>${c.count ?? '<span class="muted">—</span>'}</td><td>${c.status !== 'success' ? '<span class="muted">Unknown: not collected</span>' : fs.length ? `<div class="linked-findings">${fs.slice(0, 3).map(f => `<button type="button" class="linked" data-explore="${esc(f.id)}"><span class="dot ${sevClass(f.severity)}"></span>${esc(B().title(f))}</button>`).join('')}${fs.length > 3 ? `<span class="muted">+ ${fs.length - 3} more</span>` : ''}</div>` : '<span class="muted">No findings</span>'}</td></tr>`;
      }).join('')}</tbody></table></div></section>`;
  }

  // NIS2 traceability: rule → finding → Art. 21 measure / KSC → evidence item → action status.
  function traceability(report, trackOf, checklistOf) {
    const N = window.PulseNIS2, ref = id => N.measures.find(m => m.id === id);
    const rows = report.findings.map(f => {
      const m = N.measureFor(f), item = N.checklist.find(i => i.measure === m && i.source === 'assessment') || N.checklist.find(i => i.measure === m);
      return {f, m: ref(m), item, t: trackOf(f.id), e: item ? checklistOf(item) : null};
    }).sort((a, b) => a.m.ref.localeCompare(b.m.ref));
    return `<section class="panel nis2-section" id="traceability" aria-labelledby="trace-heading"><div class="panel-head"><div><p class="eyebrow">Traceability</p><h2 id="trace-heading">From rule to requirement.</h2><p>Each finding mapped to its primary NIS2 measure and KSC article, the evidence item it supports and the progress of its fix. Select a row to open the finding.</p></div><span class="pill">${rows.length} findings</span></div>
      <div class="table-wrap dash-wrap"><table class="dash-table trace-table"><thead><tr><th scope="col">Rule</th><th scope="col">Finding</th><th scope="col">NIS2 / KSC</th><th scope="col">Evidence item</th><th scope="col">Action status</th></tr></thead><tbody>${rows.map(({f, m, item, t, e}) => `<tr class="dash-row" data-explore="${esc(f.id)}" tabindex="0"><td><code>${esc(f.id)}</code></td><td><strong>${esc(B().title(f))}</strong></td><td><span class="trace-ref">${esc(m.ref)}</span><small>${esc(m.name)} · KSC art. 8</small></td><td>${item ? `${esc(item.label.replace(/^21\([a-j]\) /, ''))}<small>${esc(e.status)}</small>` : '<span class="muted">—</span>'}</td><td><span class="pill ${progressClass(t.status)}">${esc(t.status)}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="section-note">Indicative mapping to the primary measure only. KSC art. 8 covers the information security management system areas that correspond to NIS2 Art. 21. Not a compliance verdict.</p></section>`;
  }

  window.PulseTech = {collectorFor, findingsTable, exploreExtra, coverage, traceability, stepsText};
})();

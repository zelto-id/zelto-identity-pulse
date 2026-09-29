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
    const priority = report.findings.filter(f => ['critical','high'].includes(f.severity));
    const confirmed = priority.filter(f => f.classification === 'confirmed-risk').length;
    const gaps = report.coverage.collectors.filter(c => c.status !== 'success').length;
    return `<article><div><strong>${priority.length}</strong><span>Priority findings</span></div><p>${confirmed} confirmed · ${priority.length - confirmed} to validate or review</p><button class="textlink" data-view="findings">Review business impact</button></article>
      <article><div><strong>${actions(report).length}</strong><span>Recommended actions</span></div><p>${actions(report).length ? 'Ownership and completion are not recorded.' : 'No actions listed; evidence still needs review.'}</p><button class="textlink" data-view="plan">Review next actions</button></article>
      <article><div><strong>${gaps}</strong><span>${report.demo?.illustrative?'Example coverage gaps':'Collection gaps'}</span></div><p>${gaps ? 'Some controls remain unknown.' : report.demo?.illustrative?'No gaps represented in this example.':'No failed or skipped collections reported.'}</p><button class="textlink" data-view="nis2" data-evidence-limits>Review evidence limits</button></article>`;
  }
  function decisions(report) {
    const selected = priorities(report);
    return `<section class="decision-panel"><div class="panel-head"><div><p class="eyebrow">What needs a decision?</p><h2>${selected.length ? 'Start with these conversations.' : 'Confirm what the evidence can support.'}</h2><p>${selected.length ? 'Highest-severity findings across distinct assessment areas.' : 'No findings in this sample. Collection success and a high score do not establish compliance.'}</p></div><button class="textlink" data-view="findings">All findings (${report.findings.length})</button></div>
      ${selected.map(f => `<article class="decision-row"><div><span class="decision-class">${esc(f.severity)} · ${esc(status(f))}</span><h3>${esc(title(f))}</h3><p>${esc(impact(f))}</p></div><div class="decision-next"><span>Next decision</span><p>${esc(decision(f))}</p><button class="textlink" data-finding="${esc(f.id)}">Review finding</button></div></article>`).join('') || '<div class="empty-decision"><h3>Request the supporting records</h3><p>Ask the accountable teams for approved policies and validation evidence. These are not supplied in the assessment.</p><button class="textlink" data-view="nis2">Review NIS2 Material</button></div>'}</section>`;
  }
  function material(report, evidence) {
    const successful = report.coverage.collectors.filter(c => c.status === 'success').length;
    const gaps = report.coverage.collectors.filter(c => c.status !== 'success');
    const preview = Boolean(report.demo?.illustrative);
    const observed = evidence.controls.filter(c => ['Observed configuration','Illustrative setting'].includes(c.status) && report.coverage.collectors.some(r => r.collector === c.collector && r.status === 'success')).length;
    return `<section class="nis2-focus" aria-labelledby="nis2-heading"><div class="nis2-lead"><span class="eyebrow">NIS2 Material</span><h2 id="nis2-heading">Prepare your<br><span>NIS2 evidence.</span></h2><p>${preview?'Explore how example findings, action plans and illustrative controls would appear in an evidence pack.':'Bring the identity-security findings, action plans and observed controls into one reviewable record.'}</p><div class="actions"><button class="button primary" id="generate-pack" data-generate-pack>Generate evidence pack</button><span class="pill amber">Supporting evidence incomplete</span></div><small>Sample pack · identity-security scope · not a NIS2 compliance verdict</small></div>
      <div class="evidence-checklist"><h3>What evidence is available?</h3><dl><div><dt>Assessment findings & scope</dt><dd class="available">${preview?'Illustrative only':'Available'} · ${successful}/${report.coverage.collectors.length} ${preview?'areas shown':'collections succeeded'}</dd></div><div><dt>${preview?'Illustrative security settings':'Observed security settings'}</dt><dd class="available">${observed} control ${observed===1?'record':'records'} · enforcement not verified</dd></div><div><dt>Completed remediation & validation</dt><dd class="missing">Not supplied</dd></div><div><dt>Approved organizational policies</dt><dd class="missing">Not supplied</dd></div></dl></div></section>
      ${decisions(report)}
      <section class="review-preparation panel"><div><p class="eyebrow">Before the review</p><h2>Close the gaps in the record.</h2></div><ol><li><strong>Assign accountability.</strong><span>Agree an owner and target date for each accepted action. None are recorded here.</span></li><li><strong>Collect proof of the outcome.</strong><span>Request change records and validation results; recommendations alone do not prove completion.</span></li><li><strong>Add the organizational evidence.</strong><span>Bring approved policies and the wider security records held outside this identity assessment.</span></li></ol></section>
      <details class="material-scope" id="material-scope"><summary>Assessment boundaries & uncollected areas</summary><p>This view covers identity configuration only. Legal applicability and the wider NIS2 obligations are not assessed. A generated pack may still contain missing or unverified evidence.</p><h3>Collection gaps</h3>${gaps.length ? `<ul>${gaps.map(c => `<li>${esc(c.collector)} · ${esc(c.status)}</li>`).join('')}</ul>` : '<p>No failed or skipped collectors reported. Collection success does not establish exhaustive coverage.</p>'}<h3>Assessment limitations</h3><ul>${report.limitations.map(l => `<li>${esc(l)}</li>`).join('')}</ul><p class="section-note">${preview?'Hand-authored preview. No configuration was collected and no report was generated by the engine.':'Configuration collected '+esc(report.provider.collectedAt)+' · report generated '+esc(report.generatedAt)+'.'} Independent synthetic fixtures; not before/after remediation evidence.</p></details>`;
  }
  function plan(report) {
    return `<section class="panel business-plan-intro"><p class="eyebrow">Action Plans</p><h2>Agree who will do what next.</h2><p>Use these recommendations to agree priorities, ownership and target dates with your technical contact. Completion and verification are not recorded in this sample. Advisory findings may also need review outside the listed action plan.</p><button class="textlink" data-view="nis2">Include the plan in your NIS2 material</button></section>
      <div class="business-plan">${report.remediationPlan.buckets.map(bucket => `<section class="panel"><div class="panel-head"><h2>${esc(bucket.name)}</h2><span class="pill">Suggested window: ${esc(bucket.window)}</span></div>${bucket.items.map(action => {
        const finding = report.findings.find(f => f.id === action.findingId);
        return `<article class="business-action"><h3>${esc(finding ? title(finding) : action.action)}</h3><p>${esc(finding ? decision(finding) : action.expectedOutcome)}</p><dl class="action-status"><div><dt>Owner</dt><dd>Not assigned in this sample</dd></div><div><dt>Target date</dt><dd>Not recorded</dd></div><div><dt>Completion / validation</dt><dd>Not recorded / not verified</dd></div></dl><details><summary>Recommended change & expected outcome</summary><p>${esc(action.action)}</p><p><strong>Expected outcome:</strong> ${esc(action.expectedOutcome)}</p></details><button class="textlink" data-finding="${esc(action.findingId)}">Review supporting finding</button></article>`;
      }).join('') || '<p class="empty">No recommendations in this time window.</p>'}</section>`).join('')}</div>`;
  }
  window.PulseBusiness = {title, impact, status, metrics, decisions, material, plan, priorities};
})();

/* NIS2 and Polish KSC obligation model for the business NIS2 Material page: categories, Art. 21
   measures, finding-to-measure mapping and the auditor evidence checklist. KSC references follow the
   amended Act on the National Cybersecurity System (Dz.U. 2026 poz. 252, in force 3 April 2026).
   Supports evidence preparation; it is not legal advice or a compliance verdict. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // How much of each Art. 21 measure an identity-configuration assessment can evidence.
  const levels = {
    covered: ['Covered by assessment', 'green'],
    partial: ['Partially covered', 'amber'],
    external: ['Evidence needed from org', ''],
  };

  const categories = [
    {id: 'scope', level: 'external', article: 'NIS2 Art. 2–3, 27', ksc: 'KSC art. 5–7c', name: 'Scope & registration'},
    {id: 'governance', level: 'external', article: 'NIS2 Art. 20', ksc: 'KSC art. 8c–8e', name: 'Governance & accountability'},
    {id: 'measures', level: 'partial', article: 'NIS2 Art. 21', ksc: 'KSC art. 8', name: 'Risk-management measures'},
    {id: 'reporting', level: 'external', article: 'NIS2 Art. 23', ksc: 'KSC art. 11', name: 'Incident reporting'},
    {id: 'supervision', level: 'partial', article: 'NIS2 Art. 31–37', ksc: 'KSC art. 15, 73', name: 'Supervision & audit'},
    {id: 'sharing', level: 'external', article: 'NIS2 Art. 29–30', ksc: 'KSC (voluntary)', name: 'Information sharing'},
    {id: 'standards', level: 'external', article: 'NIS2 Art. 24–25', ksc: 'KSC art. 8', name: 'Certification & standards'},
    {id: 'documentation', level: 'external', article: 'Cross-cutting', ksc: 'KSC art. 10', name: 'Evidence & documentation'},
    {id: 'ksc', level: 'external', article: 'Poland only', ksc: 'KSC art. 9, 46, high-risk suppliers', name: 'Poland KSC specifics'},
  ];

  // Art. 21(2) a–j, plus governance and reporting; used to group findings and evidence in the evidence pack.
  const measures = [
    {id: 'a', ref: '21(a)', name: 'Risk analysis & security policies', level: 'external'},
    {id: 'b', ref: '21(b)', name: 'Incident handling', level: 'partial'},
    {id: 'c', ref: '21(c)', name: 'Business continuity & recovery', level: 'external'},
    {id: 'd', ref: '21(d)', name: 'Supply-chain security', level: 'partial'},
    {id: 'e', ref: '21(e)', name: 'Secure acquisition, development & maintenance', level: 'partial'},
    {id: 'f', ref: '21(f)', name: 'Effectiveness assessment', level: 'partial'},
    {id: 'g', ref: '21(g)', name: 'Cyber hygiene & training', level: 'partial'},
    {id: 'h', ref: '21(h)', name: 'Cryptography & encryption', level: 'partial'},
    {id: 'i', ref: '21(i)', name: 'Access control & asset management', level: 'covered'},
    {id: 'j', ref: '21(j)', name: 'MFA & secured communications', level: 'covered'},
    {id: 'gov', ref: 'Art. 20', name: 'Management approval & training', level: 'external'},
    {id: 'rep', ref: 'Art. 23', name: 'Incident reporting readiness', level: 'external'},
  ];

  // Primary Art. 21 measure for each finding rule. Unlisted rules fall back to access control.
  const findingMeasure = {
    'AUTH-OBS-001': 'b', 'OKTA-MON-001': 'b',
    'AUTH-CON-003': 'd',
    'AUTH-EXT-001': 'e', 'AUTH-EXT-002': 'e', 'AUTH-UX-001': 'e', 'AUTH-TEN-004-A': 'e', 'AUTH-CLI-002': 'e',
    'AUTH-COV-001': 'f', 'OKTA-COV-001': 'f', 'DEMO-ENTRA-COVERAGE': 'f', 'DEMO-PING-COVERAGE': 'f', 'DEMO-KEYCLOAK-COVERAGE': 'f',
    'AUTH-SEC-004': 'g', 'AUTH-SEC-005': 'g', 'AUTH-SEC-006': 'g', 'AUTH-CON-001': 'g', 'AUTH-CON-002': 'g', 'DEMO-KEYCLOAK-1': 'g', 'AUTH-UX-003': 'g',
    'AUTH-API-001': 'h', 'OKTA-HOOK-001': 'h', 'OKTA-NET-001': 'h',
    'AUTH-SEC-001': 'j', 'OKTA-POL-001': 'j', 'OKTA-POL-002': 'j', 'DEMO-ENTRA-1': 'j', 'DEMO-ENTRA-2': 'j', 'DEMO-KEYCLOAK-2': 'j', 'DEMO-PING-1': 'j', 'DEMO-PING-2': 'j',
  };
  const measureFor = finding => findingMeasure[finding.id] || 'i';

  // What an auditor would expect to see, with the NIS2 and KSC requirement behind each item.
  // source "assessment" = evidenced by this Identity Pulse report; "external" = supplied by the organization.
  const C = (id, category, label, source, measure, nis2, ksc, steps) => ({id, category, label, source, measure, nis2, ksc, steps});
  const checklist = [
    C('S1', 'scope', 'In-scope determination and essential / important classification', 'external', null,
      'Determine whether the organization falls within a sector in Annex I or II and meets the size threshold, and whether it is an essential or important entity.',
      'Classify the organization as a key (kluczowy) or important (ważny) entity using the KSC criteria for sector, size and the services provided in Poland.',
      ['List the services and legal entities in the group that operate in NIS2 sectors.', 'Apply the size and sector criteria and record the classification with its reasoning.', 'Have legal or compliance approve the determination and set a date to review it.']),
    C('S2', 'scope', 'Registration with the authority, kept up to date', 'external', null,
      'Provide entity details, contact information, IP ranges and the Member States where services are provided to the competent authority, and notify changes.',
      'Self-register in the register of key and important entities (wykaz) by 3 October 2026, unless entered ex officio, and keep the entry current.',
      ['Collect the registration data: legal details, services, IP ranges and contacts.', 'Submit the registration application and keep the confirmation.', 'Assign an owner to update the entry whenever details change.']),
    C('G1', 'governance', 'Management approval of the risk-management measures', 'external', 'gov',
      'The management body must approve the cybersecurity risk-management measures and oversee their implementation (Art. 20(1)).',
      'The head of the entity (kierownik podmiotu) is responsible for meeting the cybersecurity obligations and cannot delegate that responsibility.',
      ['Present the risk-management measures and this assessment to the management body.', 'Record the formal approval in minutes or a signed resolution.', 'Schedule recurring oversight reviews and keep the records.']),
    C('G2', 'governance', 'Management oversight records (board minutes, status reporting)', 'external', 'gov',
      'Management bodies oversee implementation and can be held liable for infringements (Art. 20(1)).',
      'Management carries defined oversight tasks, and directors of private entities face personal fines for breaches.',
      ['Define a regular cybersecurity status report to management.', 'Include finding and action-plan progress from this workspace.', 'Keep minutes that show decisions and follow-up.']),
    C('G3', 'governance', 'Management cybersecurity training records', 'external', 'gov',
      'Members of management bodies must follow cybersecurity training; similar training is encouraged for employees (Art. 20(2)).',
      'Management must complete documented cybersecurity training each year.',
      ['Select a training programme suitable for management.', 'Record attendance and completion dates for each member.', 'Plan the next annual session.']),
    C('Ma', 'measures', '21(a) Risk assessment and approved information-security policy', 'external', 'a',
      'Policies on risk analysis and information-system security (Art. 21(2)(a)).',
      'Run systematic risk assessment and maintain security policies as part of the information security management system (ISMS) required by KSC art. 8, in place by 3 April 2027.',
      ['Perform and document a risk assessment covering the in-scope services.', 'Draft or update the information-security policy and have it approved.', 'Link identity risks from this assessment to the risk register.']),
    C('Mb1', 'measures', '21(b) Incident response plan and playbooks', 'external', 'b',
      'Incident handling: prevention, detection, response and recovery (Art. 21(2)(b)).',
      'Have incident-handling procedures as part of the ISMS and the ability to report through the S46 system.',
      ['Write or update the incident response plan with roles and escalation.', 'Add playbooks for identity incidents such as account takeover.', 'Run a tabletop exercise and record lessons learned.']),
    C('Mb2', 'measures', '21(b) Identity security logs retained and monitored', 'assessment', 'b',
      'Detection and handling of incidents relies on security logging (Art. 21(2)(b)).',
      'Continuous monitoring of information systems is one of the ISMS areas in KSC art. 8.',
      ['Confirm identity-provider logs stream to an external, retained destination.', 'Define retention periods and who monitors alerts.', 'Attach the log-stream configuration as evidence.']),
    C('Mc', 'measures', '21(c) Backup and disaster-recovery plan, with test results', 'external', 'c',
      'Business continuity, backup management, disaster recovery and crisis management (Art. 21(2)(c)).',
      'Maintain business continuity and recovery plans within the ISMS.',
      ['Document backup scope, frequency and restore objectives.', 'Include identity-provider recovery and break-glass access.', 'Test a restore and keep the results.']),
    C('Md1', 'measures', '21(d) Supplier security requirements and assessments', 'external', 'd',
      'Supply-chain security, including security aspects of relationships with direct suppliers (Art. 21(2)(d)).',
      'Manage ICT supply-chain risk; the KSC also allows suppliers to be designated high-risk with mandatory phase-out.',
      ['List critical ICT suppliers, including the identity provider.', 'Add security requirements to contracts and assess suppliers.', 'Track supplier risks and review them each year.']),
    C('Md2', 'measures', '21(d) Inventory of identity integrations and extensions', 'assessment', 'd',
      'Supply-chain security covers third-party components that connect to core systems (Art. 21(2)(d)).',
      'Supply-chain risk management within the ISMS (KSC art. 8).',
      ['Export the list of integrations, hooks and custom scripts from this assessment.', 'Confirm an owner and purpose for each integration.', 'Remove or secure integrations without a clear owner.']),
    C('Me1', 'measures', '21(e) Secure development, vulnerability handling and patching process', 'external', 'e',
      'Security in acquisition, development and maintenance, including vulnerability handling and disclosure (Art. 21(2)(e)).',
      'Vulnerability management and secure maintenance within the ISMS.',
      ['Document the secure-development and change process.', 'Define patching timelines by severity.', 'Publish a vulnerability-disclosure contact.']),
    C('Me2', 'measures', '21(e) Identity platform maintenance (runtimes, deprecated features)', 'assessment', 'e',
      'Maintenance of network and information systems (Art. 21(2)(e)).',
      'Keep systems maintained and updated within the ISMS.',
      ['Review deprecated features and outdated runtimes found in this assessment.', 'Plan migrations before vendor end-of-life dates.', 'Record completed upgrades as evidence.']),
    C('Mf1', 'measures', '21(f) Control-effectiveness testing and audit results', 'external', 'f',
      'Policies and procedures to assess the effectiveness of risk-management measures (Art. 21(2)(f)).',
      'Assess the effectiveness of security measures; key entities also need a periodic security audit.',
      ['Define metrics and tests for key controls.', 'Run internal audits or penetration tests.', 'Track and close the findings.']),
    C('Mf2', 'measures', '21(f) Identity configuration assessment (this report)', 'assessment', 'f',
      'Assessing the effectiveness of measures includes technical configuration reviews (Art. 21(2)(f)).',
      'Supports the ISMS effectiveness assessment and audit preparation.',
      ['Keep this assessment report with its collection date.', 'Repeat the assessment after remediation to show improvement.', 'Record any collection gaps as open items.']),
    C('Mg1', 'measures', '21(g) Security awareness training records', 'external', 'g',
      'Basic cyber hygiene practices and cybersecurity training (Art. 21(2)(g)).',
      'Cyber hygiene and training are ISMS areas under KSC art. 8.',
      ['Run awareness training for all staff.', 'Record completion rates.', 'Add phishing and password-hygiene topics.']),
    C('Mg2', 'measures', '21(g) Password and attack-protection settings', 'assessment', 'g',
      'Basic cyber hygiene includes strong authentication hygiene and protection against password attacks (Art. 21(2)(g)).',
      'Cyber hygiene measures within the ISMS.',
      ['Review brute-force, breached-password and throttling settings in this assessment.', 'Enable the missing protections through the Action Plans.', 'Export the updated settings as evidence.']),
    C('Mh1', 'measures', '21(h) Encryption and key-management policy', 'external', 'h',
      'Policies and procedures on cryptography and, where appropriate, encryption (Art. 21(2)(h)).',
      'Use cryptography in line with the ISMS policies.',
      ['Write an encryption and key-management policy.', 'Define approved algorithms and key rotation.', 'Assign ownership of keys and certificates.']),
    C('Mh2', 'measures', '21(h) Token signing and encrypted transport in identity flows', 'assessment', 'h',
      'Cryptography applied to authentication tokens and data in transit (Art. 21(2)(h)).',
      'Cryptography within the ISMS.',
      ['Review token-signing algorithms and insecure HTTP endpoints in this assessment.', 'Move to asymmetric signing and HTTPS-only endpoints.', 'Record the changes as evidence.']),
    C('Mi1', 'measures', '21(i) Joiner / mover / leaver process and access reviews', 'external', 'i',
      'Human-resources security, access-control policies and asset management (Art. 21(2)(i)).',
      'Access control and asset management policies within the ISMS.',
      ['Document the joiner, mover and leaver process.', 'Run periodic access reviews for critical systems.', 'Keep the review sign-offs.']),
    C('Mi2', 'measures', '21(i) Privileged access, roles and dormant accounts', 'assessment', 'i',
      'Access-control policies, including privileged access (Art. 21(2)(i)).',
      'Access control within the ISMS.',
      ['Review admin roles and dormant accounts in this assessment.', 'Remove unneeded privileges and inactive accounts.', 'Export the updated role assignments.']),
    C('Mi3', 'measures', '21(i) Application and identity asset inventory', 'assessment', 'i',
      'Asset management (Art. 21(2)(i)).',
      'Asset management within the ISMS.',
      ['Export the application and client inventory from this assessment.', 'Assign an owner to each application.', 'Reconcile it with the wider asset register.']),
    C('Mj1', 'measures', '21(j) MFA enforcement for users and administrators', 'assessment', 'j',
      'Use of multi-factor or continuous authentication solutions (Art. 21(2)(j)).',
      'Multi-factor authentication within the ISMS.',
      ['Review the MFA findings in this assessment.', 'Enforce MFA for administrators and sensitive actions.', 'Export the MFA policy as evidence.']),
    C('Mj2', 'measures', '21(j) Secured voice, video, text and emergency communications', 'external', 'j',
      'Secured voice, video and text communications and secured emergency communication systems (Art. 21(2)(j)).',
      'Secure communications within the ISMS.',
      ['Identify the tools used for crisis communication.', 'Confirm they are encrypted and available during an outage.', 'Document the emergency contact procedure.']),
    C('R1', 'reporting', 'Incident reporting procedure (24 h / 72 h / 1 month)', 'external', 'rep',
      'Early warning within 24 hours, incident notification within 72 hours and a final report within one month (Art. 23).',
      'Report incidents to the competent CSIRT (NASK, GOV or MON) through the S46 system: early warning in 24 hours, notification in 72 hours, final report within one month.',
      ['Write the reporting procedure with timelines and decision criteria.', 'Name who decides whether an incident is significant.', 'Prepare report templates and test the S46 submission.']),
    C('R2', 'reporting', 'Authority and CSIRT contact register', 'external', 'rep',
      'Know the competent authority and CSIRT for notifications (Art. 23).',
      'Identify the competent CSIRT (NASK, GOV or MON) and the sector authority.',
      ['Record the CSIRT and authority contacts.', 'Store the register where the incident team can reach it.', 'Review it every six months.']),
    C('V1', 'supervision', 'Audit-ready evidence pack', 'assessment', null,
      'Essential entities face proactive supervision and important entities reactive supervision, including audits and information requests (Art. 31–37).',
      'Key entities need a periodic security audit, with the first due by 3 April 2028; fines apply from that date.',
      ['Generate the evidence pack from this workspace.', 'Add the organizational evidence from this checklist.', 'Keep versions for each audit period.']),
    C('I1', 'sharing', 'Threat-intelligence sharing arrangements (voluntary)', 'external', null,
      'Voluntary cybersecurity information-sharing arrangements and voluntary notifications (Art. 29–30).',
      'Voluntary notifications and information sharing with the CSIRTs are possible; no additional mandatory duty identified.',
      ['Decide whether to join a sector sharing group.', 'Define what can be shared and who approves it.', 'Record any agreements.']),
    C('C1', 'standards', 'Mapping to ISO 27001 or certified products where required', 'external', null,
      'Use certified ICT products, services and processes where required, and apply European or international standards (Art. 24–25).',
      'ISMS requirements can be evidenced through alignment with recognised standards such as PN-EN ISO/IEC 27001.',
      ['Map the ISMS controls to ISO/IEC 27001.', 'Check whether any national certification requirement applies.', 'Keep certificates or the gap analysis.']),
    C('D1', 'documentation', 'Cybersecurity documentation and record retention', 'external', null,
      'Keep the records that demonstrate the measures in Art. 21 for supervisory review.',
      'Maintain cybersecurity documentation for the information systems used to provide the service.',
      ['Define the documentation set and where it is stored.', 'Set retention periods and version control.', 'Assign document owners.']),
    C('K1', 'ksc', 'At least two designated contact persons', 'external', null,
      'Provide contact details to the competent authority (Art. 3 and 27).',
      'Designate at least two contact persons for communication with the authorities.',
      ['Name two contact persons with backups.', 'Register them with the authority.', 'Update the details when people change roles.']),
    C('K2', 'ksc', 'S46 system onboarding', 'external', 'rep',
      'Notifications must reach the competent CSIRT without undue delay (Art. 23).',
      'Use the S46 system for reporting and for communication with the authorities; it has been available to the newly covered entities since 12 June 2026.',
      ['Create S46 accounts for the reporting team.', 'Test access and the reporting workflow.', 'Document who can submit reports.']),
    C('K3', 'ksc', 'High-risk supplier review', 'external', 'd',
      'Coordinated EU risk assessments of critical supply chains (Art. 22).',
      'The KSC allows ICT suppliers to be designated high-risk, which requires phasing out their products within set deadlines.',
      ['Check suppliers against any high-risk designation.', 'Assess the impact on identity and network components.', 'Plan replacement where a designation applies.']),
  ];
  // Official sites where the organization registers or reports (Poland). Shown as labelled links.
  const L = (label, url) => ({label, url});
  const links = {
    S1: [L('Self-registration guide (gov.pl)', 'https://www.gov.pl/web/system-s46/wpis-do-wykazu-ksc')],
    S2: [L('Register in Wykaz KSC', 'https://wykaz-ksc.gov.pl'), L('Registration guide (gov.pl)', 'https://www.gov.pl/web/system-s46/wpis-do-wykazu-ksc')],
    K1: [L('Update contacts in Wykaz KSC', 'https://wykaz-ksc.gov.pl')],
    K2: [L('System S46 (gov.pl)', 'https://www.gov.pl/web/system-s46'), L('What changed in S46', 'https://www.gov.pl/web/system-s46/zmiany-w-systemie-s46-po-nowelizacji')],
    R1: [L('Report via System S46', 'https://www.gov.pl/web/system-s46'), L('CERT Polska incident form', 'https://incydent.cert.pl')],
    R2: [L('CERT Polska contacts', 'https://cert.pl/kontakt/')],
  };
  checklist.forEach(item => { item.links = links[item.id] || []; });
  const linkList = (item, cls = 'ev-links') => item.links.length ? `<span class="${cls}">${item.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" title="${esc(l.url)}">${esc(l.label)}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>`).join('')}</span>` : '';
  const evidenceStatuses = ['Not Started', 'In Progress', 'Completed'];

  // Pre-filled sample state; dates are relative to today so the demo stays realistic.
  const isoIn = days => { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const sampleExternal = [['In Progress', 'Jan Czajkowski', 30], ['Completed', 'Nathanael Chu', null], ['Not Started', '', 60], ['In Progress', 'Nathanael Chu', 14], ['Completed', 'Jan Czajkowski', null], ['Not Started', '', null]];
  function seed(item, index) {
    const base = {date: '', comments: '', generatedAt: ''};
    if (item.id === 'I1') return {...base, status: 'Not Started', owner: '', comments: 'Voluntary; decide whether to join a sharing group this year.'};
    if (item.source === 'assessment') return {...base, status: 'Completed', owner: index % 2 ? 'Nathanael Chu' : 'Jan Czajkowski'};
    const [status, owner, days] = sampleExternal[index % sampleExternal.length];
    return {...base, status, owner, date: days === null ? '' : isoIn(days)};
  }

  const sevRank = {critical: 0, high: 1, medium: 2, low: 3, info: 4};
  const sevClass = s => ['critical', 'high'].includes(s) ? 'red' : s === 'medium' ? 'amber' : 'blue';
  const relatedFindings = (report, measure) => report.findings.filter(f => measureFor(f) === measure).sort((a, b) => (sevRank[a.severity] ?? 5) - (sevRank[b.severity] ?? 5));
  const categoryName = id => categories.find(c => c.id === id)?.name || id;
  const progressOf = (items, stateOf) => ({done: items.filter(i => stateOf(i).status === 'Completed').length, total: items.length});

  function obligations(report, stateOf) {
    return `<div class="obligations"><h3>NIS2 obligations by category</h3><p class="obligations-note">Evidence items completed in each category, including Poland's KSC Act.</p><ol>${categories.map(c => {
      const p = progressOf(checklist.filter(i => i.category === c.id), stateOf);
      return `<li><button type="button" data-checklist-category="${c.id}"><span class="ob-text"><b>${esc(c.name)}</b><small>${esc(c.article)} · ${esc(c.ksc)}</small></span><span class="ob-count" aria-label="${p.done} of ${p.total} evidence items completed"><b>${p.done}/${p.total}</b> evidence completed</span></button></li>`;
    }).join('')}</ol></div>`;
  }

  // Same status colors as the Action Plans table.
  const statusClass = v => v === 'In Progress' ? 'amber' : v === 'Completed' ? 'green' : '';
  // Organizational items produce a template to fill in; assessment items produce an evidence record.
  const generateLabel = item => item.source === 'external' ? 'Generate template' : 'Generate evidence';

  function checklistSection(rows, filters, owners, totals) {
    const done = totals.completed, all = totals.total;
    return `<section class="panel nis2-section" id="evidence-checklist" aria-labelledby="checklist-heading"><div class="panel-head"><div><p class="eyebrow">Evidence checklist</p><h2 id="checklist-heading">What will an auditor ask for?</h2><p>Select an item for the NIS2 and KSC requirement and the recommended steps. Generate evidence creates a record from this assessment; Generate template creates a document to complete for the auditor. Statuses, owners and dates are pre-filled sample data.</p></div><span class="pill">${done} of ${all} completed</span></div>
      <div class="checklist-progress" aria-hidden="true"><span style="width:${all ? done / all * 100 : 0}%"></span></div>
      <div class="filters"><select id="checklist-category" aria-label="Filter by category"><option value="all">Category</option>${categories.map(c => `<option value="${c.id}" ${filters.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><select id="checklist-status" aria-label="Filter by status"><option value="all">Status</option>${evidenceStatuses.map(s => `<option ${filters.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select><select id="checklist-owner" aria-label="Filter by owner"><option value="all">Owner</option><option value="" ${filters.owner === '' ? 'selected' : ''}>Unassigned</option>${owners.map(o => `<option ${filters.owner === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select><select id="checklist-source" aria-label="Filter by source"><option value="all">Source</option><option value="assessment" ${filters.source === 'assessment' ? 'selected' : ''}>Identity Pulse</option><option value="external" ${filters.source === 'external' ? 'selected' : ''}>Your organization</option></select></div>
      ${rows.length ? `<div class="table-wrap dash-wrap"><table class="dash-table checklist-table"><thead><tr><th scope="col">Category</th><th scope="col">Evidence item</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Owner</th><th scope="col">Evidence</th><th scope="col"><span class="sr-only">Open</span></th></tr></thead><tbody>${rows.map(({item, state}) => `<tr class="dash-row" data-evidence-item="${item.id}" tabindex="0" aria-label="Open requirement: ${esc(item.label)}"><td><span class="cl-cat">${esc(categoryName(item.category))}</span></td><td><strong>${esc(item.label)}</strong>${linkList(item)}</td><td><span class="pill ${item.source === 'assessment' ? 'light' : ''}">${item.source === 'assessment' ? 'Identity Pulse' : 'Your organization'}</span></td><td><span class="pill ${statusClass(state.status)}">${esc(state.status)}</span></td><td>${state.owner ? esc(state.owner) : '<span class="muted">Unassigned</span>'}</td><td><button type="button" class="button primary generate-evidence ${state.generatedAt ? 'done' : ''}" data-generate-evidence="${item.id}" aria-label="${generateLabel(item)} for ${esc(item.label)}${state.generatedAt ? ' (generated)' : ''}" ${state.generatedAt ? `title="Generated ${esc(new Date(state.generatedAt).toLocaleString('en-GB'))}"` : ''}>${generateLabel(item)}</button></td><td><span class="arrow" aria-hidden="true">↗</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty" role="status">No checklist items match this selection.</p>'}</section>`;
  }

  // Requirement pop-up for one checklist item, with editable tracking fields.
  function evidenceDialog(item, state, owners, report) {
    const cat = categories.find(c => c.id === item.category), related = item.measure ? relatedFindings(report, item.measure) : [];
    const opt = (v, sel) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(v)}</option>`;
    return `<div class="explore-head"><span class="pill ${item.source === 'assessment' ? 'light' : ''}">${item.source === 'assessment' ? 'Identity Pulse' : 'Your organization'}</span><span class="pill">${esc(cat.name)}</span></div><h2 id="evidence-title">${esc(item.label)}</h2>
      <div class="explore-grid"><section class="explore-card"><p class="eyebrow">Requirement</p><h3>NIS2 requirement <span class="req-ref">${esc(cat.article)}</span></h3><p>${esc(item.nis2)}</p><h3>KSC requirement (Poland) <span class="req-ref">${esc(cat.ksc)}</span></h3><p>${esc(item.ksc)}</p>${item.links.length ? `<h3>Where to register or report</h3>${linkList(item, 'ev-links stacked')}` : ''}<h3>Recommended action steps</h3><ol class="req-steps">${item.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>${related.length ? `<h3>Related findings in this assessment</h3><ul class="req-findings">${related.slice(0, 5).map(f => `<li><span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span>${esc(window.PulseBusiness.title(f))}</li>`).join('')}</ul>${related.length > 5 ? `<p class="muted">+ ${related.length - 5} more</p>` : ''}` : ''}</section>
      <section class="explore-card"><p class="eyebrow">Tracking</p><div class="plan-form" data-evidence-form="${item.id}"><label class="plan-field"><span>Owner</span><select data-ev-field="owner"><option value="" ${state.owner ? '' : 'selected'}>Unassigned</option>${owners.map(o => opt(o, state.owner)).join('')}<option value="__new">+ Add new name…</option></select></label><div class="add-owner" hidden><input type="text" data-new-owner placeholder="Full name" aria-label="New owner name"><button type="button" class="button primary" data-add-ev-owner>Add</button></div>
        <label class="plan-field"><span>Status</span><select data-ev-field="status">${evidenceStatuses.map(s => opt(s, state.status)).join('')}</select></label>
        <label class="plan-field"><span>Target date</span><input type="date" data-ev-field="date" value="${esc(state.date)}"></label>
        <label class="plan-field"><span>Additional comments</span><textarea data-ev-field="comments" rows="3" placeholder="Add context, decisions or links to evidence">${esc(state.comments)}</textarea></label></div>
        <button type="button" class="button primary generate-evidence-wide" data-generate-evidence="${item.id}">${generateLabel(item)}</button>${state.generatedAt ? `<p class="section-note">Last generated ${esc(new Date(state.generatedAt).toLocaleString('en-GB'))}.</p>` : ''}</section></div>
      <p class="section-note">Article references are indicative. Confirm against NIS2 (Directive (EU) 2022/2555) and the consolidated KSC Act (Dz.U. 2026 poz. 252). This is not legal advice.</p>`;
  }

  // Self-contained evidence record for one checklist item (sample, browser-generated).
  function evidenceRecord(item, state, report, trackOf, scenario) {
    const cat = categories.find(c => c.id === item.category), related = item.measure ? relatedFindings(report, item.measure) : [];
    const preview = Boolean(report.demo?.illustrative), coll = report.coverage.collectors;
    const body = `<div class="banner"><strong>${item.source === 'external' ? 'EVIDENCE TEMPLATE' : 'SAMPLE EVIDENCE RECORD'}</strong><p>${preview ? 'Illustrative provider preview · no environment assessed.' : 'Synthetic assessment data.'} Supports auditor review; not proof of compliance.</p></div>
      <h1>${esc(item.label)}</h1><p class="meta">${esc(cat.name)} · ${esc(cat.article)} · ${esc(cat.ksc)}<br>Provider: ${esc(report.provider.displayName || report.provider.id)} · Scenario: ${esc(scenario)}<br>Generated ${esc(new Date().toISOString())}</p>
      <h2>Requirement</h2><h3>NIS2</h3><p>${esc(item.nis2)}</p><h3>KSC (Poland)</h3><p>${esc(item.ksc)}</p>
      <h2>Tracking</h2><table><tr><th>Status</th><td>${esc(state.status)}</td></tr><tr><th>Owner</th><td>${esc(state.owner || 'Unassigned')}</td></tr><tr><th>Target date</th><td>${esc(state.date || 'Not set')}</td></tr><tr><th>Comments</th><td>${esc(state.comments || '—')}</td></tr></table>
      ${item.links.length ? `<h2>Where to register or report</h2><ul>${item.links.map(l => `<li><a href="${esc(l.url)}">${esc(l.label)}</a></li>`).join('')}</ul>` : ''}<h2>Recommended action steps</h2><ol>${item.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${item.source === 'assessment' ? `<h2>Evidence from the identity assessment</h2><p>${coll.filter(c => c.status === 'success').length} of ${coll.length} collection areas ${preview ? 'illustrated' : 'collected successfully'}${preview ? '' : ` · configuration collected ${esc(report.provider.collectedAt)}`}.</p>
        ${related.length ? `<table><thead><tr><th>Finding</th><th>Severity</th><th>Evidence</th><th>Action status</th><th>Owner</th></tr></thead><tbody>${related.map(f => { const t = trackOf(f.id); return `<tr><td>${esc(f.id)} · ${esc(f.title)}</td><td>${esc(f.severity)}</td><td>${esc(f.evidence.summary)}</td><td>${esc(t.status)}</td><td>${esc(t.owner || 'Unassigned')}</td></tr>`; }).join('')}</tbody></table>` : '<p>No findings mapped to this item in this assessment. This does not prove the requirement is met.</p>'}`
      : `<h2>Evidence to attach</h2><p>This item is evidenced by organizational records outside the identity assessment. Attach them below.</p><table><thead><tr><th>Document</th><th>Reference / location</th><th>Approved by</th><th>Date</th></tr></thead><tbody>${item.steps.map(s => `<tr><td>${esc(s)}</td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>`}
      <p class="foot">Article references are indicative; confirm against Directive (EU) 2022/2555 and Dz.U. 2026 poz. 252. Tracking values are sample data entered in the demo workspace.</p>`;
    const css = 'body{font:15px/1.6 system-ui,sans-serif;color:#141429;max-width:900px;margin:auto;padding:36px 24px}h1{font-size:26px;margin:18px 0 4px}h2{font-size:19px;margin-top:28px;padding-top:14px;border-top:2px solid #83219b}h3{font-size:15px;margin:14px 0 4px}.banner{padding:16px 18px;background:#141429;color:#fff;border-left:6px solid #7addc6}.banner p{margin:4px 0 0}.meta,.foot{font-size:13px;color:#4a4a65}table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}th,td{border:1px solid #c9c9d8;padding:8px;text-align:left;vertical-align:top}th{background:#f0f0f6;width:22%}td:empty{height:28px}@media print{body{padding:0}}';
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${item.source === 'external' ? 'Evidence template' : 'Evidence record'} — ${esc(item.label)}</title><style>${css}</style></head><body>${body}</body></html>`;
  }

  // Structured NIS2 / KSC view for the evidence pack.
  function packData(report, trackOf, checklistOf) {
    const evidenceRow = item => ({label: item.label, source: item.source === 'assessment' ? 'Identity Pulse' : 'Organization', ...checklistOf(item)});
    return measures.map(m => ({
      ref: m.ref, name: m.name, coverage: levels[m.level][0],
      findings: relatedFindings(report, m.id).map(f => ({id: f.id, title: f.title, severity: f.severity, ...trackOf(f.id)})),
      evidence: checklist.filter(item => (m.id === 'gov' && item.category === 'governance') || (m.id === 'rep' && item.category === 'reporting') || item.label.startsWith(m.ref + ' ')).map(evidenceRow),
    })).concat(categories.filter(c => ['scope', 'supervision', 'sharing', 'standards', 'documentation', 'ksc'].includes(c.id)).map(c => ({
      ref: `${c.article} · ${c.ksc}`, name: c.name, coverage: 'Organizational evidence', findings: [],
      evidence: checklist.filter(item => item.category === c.id).map(evidenceRow),
    })));
  }

  window.PulseNIS2 = {categories, measures, checklist, evidenceStatuses, seed, measureFor, obligations, checklistSection, evidenceDialog, evidenceRecord, packData};
})();

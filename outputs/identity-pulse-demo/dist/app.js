'use strict';
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Keep column context and native table semantics when rows stack on narrow screens.
function mobileTables(root){
  root.querySelectorAll('.dash-table, .pack-document table').forEach(table=>{
    table.classList.add('mobile-table');
    table.setAttribute('role','table');
    const labels=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    table.querySelectorAll('thead,tbody').forEach(group=>group.setAttribute('role','rowgroup'));
    table.querySelectorAll('tr').forEach(row=>row.setAttribute('role','row'));
    table.querySelectorAll('th').forEach(th=>th.setAttribute('role','columnheader'));
    table.querySelectorAll('tbody tr').forEach(row=>[...row.cells].forEach((cell,i)=>{
      cell.setAttribute('role','cell');
      cell.dataset.label=labels[i]||'';
    }));
  });
}
const state={provider:window.PulseExperience.context.provider,scenario:window.PulseExperience.context.sample,view:'nis2',query:'',severity:'all',type:'all',planQuery:'',planStatus:'all',planOwner:'all',planSeverity:'all',planDue:'all',appId:null,clCategory:'all',clStatus:'all',clOwner:'all',clSource:'all'};
// Action-plan tracking entered in the explore dialog; kept in memory for this page session only.
const owners=['Jan Czajkowski','Nathanael Chu'],tracking={};
const trackKey=id=>state.provider+'/'+state.scenario+'/'+id;
// Pre-filled sample tracking so the Action Plans charts have something to show; dates are relative to today.
const samplePlan=[['Jan Czajkowski','In Progress',-6,'Change window requested with the platform team.'],['Nathanael Chu','Completed',-12,''],['Jan Czajkowski','Not Started',9,''],['','Not Started',null,''],['Nathanael Chu','In Progress',21,'Waiting on application owner sign-off.'],['Jan Czajkowski','Verified',3,''],['','Not Started',45,''],['Nathanael Chu','Not Started',75,''],['Jan Czajkowski','Closed',-20,'Accepted as a documented exception.'],['','Not Started',120,'']];
const isoIn=days=>{const d=new Date();d.setDate(d.getDate()+days);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function seedTrack(id){const i=window.PulseBusiness.actions(report()).findIndex(a=>a.findingId===id);if(i<0)return{owner:'',date:'',status:'Not Started',comments:''};const[owner,status,days,comments]=samplePlan[i%samplePlan.length];return{owner,status,date:days===null?'':isoIn(days),comments};}
const track=id=>tracking[trackKey(id)]??=seedTrack(id);
// NIS2 evidence checklist state, pre-filled with sample statuses and owners; in memory only.
const checklistState={};
const checklistOf=item=>checklistState[trackKey('nis2:'+item.id)]??=window.PulseNIS2.seed(item,window.PulseNIS2.checklist.indexOf(item));
const severityOrder={critical:0,high:1,medium:2,low:3,info:4};
// Both audiences share one workspace; the Technical User adds the technical layer (tech-view.js, Applications tab, remediation code).
const tech=()=>window.PulseExperience.audience==='tech';
const report=()=>window.PULSE_REPORTS[state.provider][state.scenario];
const sorted=()=>[...report().findings].sort((a,b)=>(severityOrder[a.severity]??5)-(severityOrder[b.severity]??5));
function render(){
  const summary=$('business-summary');
  if(summary.parentElement!==$('main'))$('assessment-view').before(summary);
  renderTabs();
  const r=report(),preview=Boolean(r.demo?.illustrative),provider=window.PulseProviders.get(state.provider);
  $('sample-context').textContent=provider.name+' · '+provider.scope+(preview?'':' · Example collected '+new Date(r.provider.collectedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}));
  $('scenario-description').textContent=window.PulseProviders.scenarios[state.scenario].description;
  $('provider-status').innerHTML=preview?`<div class="notice neutral"><strong>${esc(provider.name)} · Preview.</strong> Connector and scoring are not implemented.${state.provider==='ping'?' PingOne customer identity.':''}</div>`:'';
  $('report-origin').textContent='';
  $('export-json').textContent=preview?'Download illustrative example JSON ↓':'Download sample report JSON ↓';
  $('coverage-notice').innerHTML=r.coverage.partial?'<div class="notice"><strong>Incomplete assessment example.</strong> Some evidence could not be collected. Missing evidence is not proof that a control is safe.</div>':'';
  $('assessment-view').setAttribute('aria-labelledby','tab-'+state.view);
  summary.innerHTML=window.PulseBusiness.metrics(r);
  renderView();
  if(state.view==='nis2')$('assessment-view').querySelector('.nis2-focus').after(summary);
}
function renderView(){renderViewContent();mobileTables($('assessment-view'));}
function renderViewContent(){if(state.view==='nis2'){renderMaterial();return;}const r=report(),view=$('assessment-view');if(state.view==='apps'){view.innerHTML=window.PulseApps.render(state.provider,state.scenario,r,state.appId,'data-explore');}
else if(state.view==='findings'){view.innerHTML=`<section class="panel"><div class="panel-head"><div><h2>Findings</h2><p>Every finding with its severity, type and recommended action plan. Select a finding for the full detail.</p></div><span class="pill">${r.findings.length} Total Findings</span></div>${window.PulseBusiness.findingCharts(r,{severity:state.severity,type:state.type})}<div class="filters"><input id="finding-search" type="search" aria-label="Search findings" placeholder="Search finding or rule ID" value="${esc(state.query)}"><select id="severity-filter" aria-label="Filter by severity"><option value="all">Severity</option>${Object.keys(severityOrder).map(s=>`<option value="${s}" ${state.severity===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select><select id="type-filter" aria-label="Filter by type"><option value="all">Type</option>${[['confirmed-risk','Confirmed configuration risk'],['requires-validation','Needs validation'],['advisory','Advisory · review context']].map(([v,l])=>`<option value="${v}" ${state.type===v?'selected':''}>${l}</option>`).join('')}</select></div><div id="finding-results"></div></section>`;renderResults();$('finding-search').addEventListener('input',e=>{state.query=e.target.value;renderResults();});$('severity-filter').addEventListener('change',e=>{state.severity=e.target.value;renderView();});$('type-filter').addEventListener('change',e=>{state.type=e.target.value;renderView();});}
else if(state.view==='coverage'){view.innerHTML=window.PulseTech.coverage(r);}
else if(state.view==='plan'){const items=window.PulseBusiness.actions(r),progress=['Not Started','In Progress','Verified','Completed','Closed'];view.innerHTML=`<section class="panel"><div class="panel-head"><div><h2>Action Plans</h2><p>Track the owner, target date and progress of each recommended action. Select a row to update it. Owners, dates, statuses and comments are pre-filled sample data.</p></div><span class="pill">${items.length} Total Actions</span></div>${window.PulseBusiness.planCharts(r,track,owners,{status:state.planStatus,owner:state.planOwner,due:state.planDue})}<div class="filters"><input id="plan-search" type="search" aria-label="Search actions" placeholder="Search finding or action" value="${esc(state.planQuery)}"><select id="plan-severity" aria-label="Filter by severity"><option value="all">Severity</option>${Object.keys(severityOrder).map(v=>`<option value="${v}" ${state.planSeverity===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select><select id="plan-status" aria-label="Filter by status"><option value="all">Status</option>${progress.map(v=>`<option ${state.planStatus===v?'selected':''}>${v}</option>`).join('')}</select><select id="plan-owner" aria-label="Filter by owner"><option value="all">Owner</option><option value="" ${state.planOwner===''?'selected':''}>Unassigned</option>${owners.map(o=>`<option ${state.planOwner===o?'selected':''}>${esc(o)}</option>`).join('')}</select><select id="plan-due" aria-label="Filter by due date"><option value="all">Due date</option>${window.PulseBusiness.dueBuckets.map(([v,l])=>`<option value="${v}" ${state.planDue===v?'selected':''}>${l}</option>`).join('')}</select></div><div id="plan-results"></div></section>`;renderPlanResults();$('plan-search').addEventListener('input',e=>{state.planQuery=e.target.value;renderPlanResults();});$('plan-severity').addEventListener('change',e=>{state.planSeverity=e.target.value;renderPlanResults();});$('plan-status').addEventListener('change',e=>{state.planStatus=e.target.value;renderView();});$('plan-owner').addEventListener('change',e=>{state.planOwner=e.target.value;renderView();});$('plan-due').addEventListener('change',e=>{state.planDue=e.target.value;renderView();});}}
function renderPlanResults(){const r=report(),q=state.planQuery.toLowerCase(),items=window.PulseBusiness.actions(r).filter(a=>{const t=track(a.findingId),f=r.findings.find(x=>x.id===a.findingId);return(state.planDue==='all'||window.PulseBusiness.dueBucket(t)===state.planDue)&&(state.planSeverity==='all'||f?.severity===state.planSeverity)&&(state.planStatus==='all'||t.status===state.planStatus)&&(state.planOwner==='all'||t.owner===state.planOwner)&&((f?window.PulseBusiness.title(f):'')+' '+a.findingId+' '+a.action+' '+t.comments).toLowerCase().includes(q);});$('plan-results').innerHTML=window.PulseBusiness.plan(r,items,track,tech()?window.PulseTech.stepsText:null);mobileTables($('plan-results'));}
function renderResults(){const matches=sorted().filter(f=>(state.severity==='all'||f.severity===state.severity)&&(state.type==='all'||f.classification===state.type)&&(f.title+' '+f.id+' '+window.PulseBusiness.title(f)+' '+f.businessRisk).toLowerCase().includes(state.query.toLowerCase()));$('finding-results').innerHTML=tech()?window.PulseTech.findingsTable(report(),matches,track):window.PulseBusiness.dashboard(report(),matches);mobileTables($('finding-results'));}
function exploreFinding(id){const f=report().findings.find(x=>x.id===id);if(!f)return;$('explore-detail').innerHTML=window.PulseBusiness.explore(report(),f,track(id),owners,tech()?{...window.PulseTech.exploreExtra(report(),f,window.PULSE_CONTROLS[state.provider]?.[state.scenario],track(id)),bottom:window.PulseRemediation.panel(state.provider,state.scenario,f,report())}:null);$('explore-dialog').showModal();}
document.addEventListener('click',e=>{const v=e.target.closest('[data-view]');if(v){state.view=!tech()&&v.dataset.view==='coverage'?'nis2':v.dataset.view;render();if(v.hasAttribute('data-evidence-limits')){const limits=$('material-scope');if(limits){limits.open=true;limits.querySelector('summary').focus();limits.scrollIntoView({block:'start'});}}else if(v.getAttribute('role')==='tab')$('tab-'+state.view).focus();}const x=e.target.closest('textarea,input,select')?null:e.target.closest('[data-explore]');if(x)exploreFinding(x.dataset.explore);if(e.target.closest('[data-generate-pack]'))generatePack();});$('provider').addEventListener('change',e=>{state.provider=e.target.value;window.PulseExperience.updateContext(state.provider,state.scenario);render();});$('scenario').addEventListener('change',e=>{state.scenario=e.target.value;window.PulseExperience.updateContext(state.provider,state.scenario);render();});$('close-explore').onclick=()=>{$('explore-dialog').close();refreshBehindExplore();};$('export-json').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`identity-pulse-${state.provider}-${state.scenario}-sample.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function renderTabs(){
  const views=[['nis2','NIS2 Material'],['findings','Findings'],['plan','Action Plans'],...(tech()?[['coverage','Coverage'],['apps','Applications']]:[])];
  if(!views.some(([id])=>id===state.view))state.view='nis2';
  $('assessment-tabs').innerHTML=views.map(([id,label])=>`<button id="tab-${id}" type="button" role="tab" tabindex="${id===state.view?'0':'-1'}" aria-selected="${id===state.view}" aria-controls="assessment-view" data-view="${id}">${label}</button>`).join('');
}
function renderMaterial(){
    const r=report(),N=window.PulseNIS2,all=N.checklist.map(item=>({item,state:checklistOf(item)}));
    const rows=all.filter(({item,state:c})=>(state.clCategory==='all'||item.category===state.clCategory)&&(state.clStatus==='all'||c.status===state.clStatus)&&(state.clOwner==='all'||c.owner===state.clOwner)&&(state.clSource==='all'||item.source===state.clSource));
    const totals={completed:all.filter(x=>x.state.status==='Completed').length,total:all.length};
    const filters={category:state.clCategory,status:state.clStatus,owner:state.clOwner,source:state.clSource};
    $('assessment-view').innerHTML=window.PulseBusiness.material(r,window.PULSE_CONTROLS[state.provider][state.scenario],N.checklistSection(rows,filters,owners,totals)+(tech()?window.PulseTech.traceability(r,track,checklistOf):''),N.obligations(r,checklistOf));
    mobileTables($('assessment-view'));
    [['checklist-category','clCategory'],['checklist-status','clStatus'],['checklist-owner','clOwner'],['checklist-source','clSource']].forEach(([id,key])=>$(id).addEventListener('change',e=>{state[key]=e.target.value;renderMaterialKeep(id);}));
}
function generatePack(){
    currentPack=window.PulseEvidence.build(report(),window.PULSE_CONTROLS[state.provider][state.scenario],$('scenario').selectedOptions[0].textContent,{trackOf:track,nis2:window.PulseNIS2.packData(report(),track,checklistOf)});
    $('pack-preview').innerHTML=window.PulseEvidence.content(currentPack,true);
    mobileTables($('pack-preview'));
    if(currentPackURL)URL.revokeObjectURL(currentPackURL);
    currentPackURL=URL.createObjectURL(new Blob([window.PulseEvidence.html(currentPack)],{type:'text/html;charset=utf-8'}));
    $('download-pack').href=currentPackURL;
    $('download-pack').download=`identity-pulse-${currentPack.report.provider.id}-sample-evidence-pack.html`;
    $('pack-download-status').textContent='Self-contained HTML · browser mockup';
    $('pack-dialog').showModal();
}
let currentPack=null,currentPackURL=null;
$('close-pack').onclick=()=>$('pack-dialog').close();
$('download-pack').onclick=()=>{
  $('pack-download-status').textContent='Sample HTML download requested. Open the file to review or print.';
};

$('assessment-tabs').addEventListener('keydown',event=>{
  const tabs=[...$('assessment-tabs').querySelectorAll('[role=tab]')],index=tabs.indexOf(event.target);
  if(index<0||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+tabs.length)%tabs.length;
  state.view=tabs[next].dataset.view;render();$('tab-'+state.view).focus();
});
$('provider').value=state.provider;
$('scenario').value=state.scenario;
const requestedView=new URLSearchParams(location.search).get('view');
if(['findings','coverage','apps','plan','nis2'].includes(requestedView))state.view=requestedView;
{
  $('business-navigation').append($('assessment-tabs'));
  $('assessment-tabs').setAttribute('aria-label','Workspace navigation');
  $('workspace-title').textContent='Risk, actions & evidence';
  $('workspace-eyebrow').textContent='Business overview';
  $('workspace-heading').textContent='Know what needs your attention.';
  $('workspace-intro').textContent='Prioritize the risks, agree ownership and prepare the evidence for review.';
  document.title=tech()?'Identity Pulse — Technical User workspace':'Identity Pulse — Business workspace';
  if(tech()){$('workspace-eyebrow').textContent='Technical User workspace';$('workspace-intro').textContent='Prioritize the risks, agree ownership and prepare the evidence, with the technical detail behind each one.';}
  const selectors=document.createElement('div');selectors.className='topbar-context';
  selectors.append(...document.querySelectorAll('.contextbar > label'));
  document.querySelector('.topbar > p').after(selectors);
  document.querySelector('.contextbar').hidden=true;
}
function tabOrientation(){$('assessment-tabs').setAttribute('aria-orientation',innerWidth>850?'vertical':'horizontal');}
window.addEventListener('resize',tabOrientation);tabOrientation();
render();

$('explore-detail').addEventListener('change',e=>{
  const form=e.target.closest('[data-track]'),field=e.target.dataset.field;if(!form||!field)return;
  if(field==='owner'&&e.target.value==='__new'){e.target.value=track(form.dataset.track).owner;const add=form.querySelector('.add-owner');add.hidden=false;add.querySelector('input').focus();return;}
  track(form.dataset.track)[field]=e.target.value;refreshBehindExplore();
});
$('explore-detail').addEventListener('input',e=>{const form=e.target.closest('[data-track]');if(form&&e.target.dataset.field==='comments')track(form.dataset.track).comments=e.target.value;});
function addOwner(form){
  const input=form.querySelector('[data-new-owner]'),name=input.value.trim();if(!name)return input.focus();
  if(!owners.includes(name))owners.push(name);
  track(form.dataset.track).owner=name;
  const select=form.querySelector('[data-field=owner]'),opt=new Option(name,name);
  if(![...select.options].some(o=>o.value===name))select.insertBefore(opt,select.querySelector('[value=__new]'));
  select.value=name;input.value='';form.querySelector('.add-owner').hidden=true;select.focus();
}
$('explore-detail').addEventListener('click',e=>{if(e.target.closest('[data-add-owner]'))addOwner(e.target.closest('[data-track]'));});
$('explore-detail').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-new-owner]')){e.preventDefault();addOwner(e.target.closest('[data-track]'));}});
$('assessment-view').addEventListener('keydown',e=>{const row=e.target.closest('tr[data-explore]');if(row&&e.target===row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();exploreFinding(row.dataset.explore);}});
// Refresh tables behind the finding pop-up; called on edits and on close, since the dialog close event is not always delivered.
function refreshBehindExplore(){if(['plan','nis2'].includes(state.view)){const y=scrollY;render();scrollTo(0,y);}}
$('explore-dialog').addEventListener('close',refreshBehindExplore);
$('assessment-view').addEventListener('input',e=>{const id=e.target.dataset.rowComment;if(id)track(id).comments=e.target.value;});
// Chart marks set (or clear, when already active) the matching table filter.
$('assessment-view').addEventListener('click',e=>{
  const mark=e.target.closest('[data-chart-filter]');if(!mark)return;
  const [kind,value]=mark.dataset.chartFilter.split(/:(.*)/s),toggle=(key,v)=>{state[key]=state[key]===v?'all':v;};
  if(kind==='severity')toggle('severity',value);
  else if(kind==='matrix'){const [sev,type]=value.split('|'),same=state.severity===sev&&state.type===type;state.severity=same?'all':sev;state.type=same?'all':type;}
  else if(kind==='status')toggle('planStatus',value);
  else if(kind==='owner')toggle('planOwner',value);
  else if(kind==='due')toggle('planDue',value);
  hideTip();renderView();
  document.querySelector(`[data-chart-filter="${CSS.escape(mark.dataset.chartFilter)}"]`)?.focus();
});
const tip=document.createElement('div');tip.className='chart-tip';tip.setAttribute('role','presentation');tip.hidden=true;document.body.append(tip);
function hideTip(){tip.hidden=true;}
function showTip(el){const r=el.getBoundingClientRect();tip.textContent=el.dataset.tip;tip.hidden=false;const w=tip.offsetWidth;tip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';tip.style.top=(r.top-tip.offsetHeight-8)+'px';}
$('assessment-view').addEventListener('mouseover',e=>{const el=e.target.closest('[data-tip]');el?showTip(el):hideTip();});
$('assessment-view').addEventListener('mouseleave',hideTip);
$('assessment-view').addEventListener('focusin',e=>{const el=e.target.closest('[data-tip]');el?showTip(el):hideTip();});
window.addEventListener('scroll',hideTip,{passive:true});
$('assessment-view').addEventListener('keydown',e=>{const el=e.target.closest('[data-chart-filter][role=button]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
// NIS2 Material: re-render while keeping scroll position and focus on the control that changed.
function renderMaterialKeep(focusId){const y=scrollY;render();scrollTo(0,y);if(focusId)document.getElementById(focusId)?.focus();}
document.addEventListener('click',e=>{
  const cat=e.target.closest('[data-checklist-category]');
  if(cat){state.view='nis2';state.clCategory=cat.dataset.checklistCategory;state.clStatus=state.clOwner=state.clSource='all';render();$('evidence-checklist')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
});
// Evidence checklist: requirement pop-up, per-item tracking and evidence-record generation.
const evidenceItem=id=>window.PulseNIS2.checklist.find(x=>x.id===id);
function openEvidence(id){const item=evidenceItem(id);$('evidence-dialog').dataset.itemId=id;$('evidence-detail').innerHTML=window.PulseNIS2.evidenceDialog(item,checklistOf(item),owners,report());if(!$('evidence-dialog').open)$('evidence-dialog').showModal();}
function generateEvidence(id){
  const item=evidenceItem(id),st=checklistOf(item);
  const html=window.PulseNIS2.evidenceRecord(item,st,report(),track,$('scenario').selectedOptions[0].textContent);
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download=`identity-pulse-${state.provider}-evidence-${item.id.toLowerCase()}.html`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  st.generatedAt=new Date().toISOString();
}
document.addEventListener('click',e=>{
  const gen=e.target.closest('[data-generate-evidence]');
  if(gen){generateEvidence(gen.dataset.generateEvidence);if($('evidence-dialog').open)openEvidence(gen.dataset.generateEvidence);renderMaterialKeep();return;}
  if(e.target.closest('select,input,textarea,button,a'))return;
  const row=e.target.closest('tr[data-evidence-item]');if(row)openEvidence(row.dataset.evidenceItem);
});
$('assessment-view').addEventListener('keydown',e=>{const row=e.target.closest('tr[data-evidence-item]');if(row&&e.target===row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openEvidence(row.dataset.evidenceItem);}});
$('evidence-detail').addEventListener('change',e=>{
  const field=e.target.dataset.evField;if(!field)return;const st=checklistOf(evidenceItem($('evidence-dialog').dataset.itemId));
  if(field==='owner'&&e.target.value==='__new'){e.target.value=st.owner;const add=$('evidence-detail').querySelector('.add-owner');add.hidden=false;add.querySelector('input').focus();return;}
  st[field]=e.target.value;renderMaterialKeep();
});
$('evidence-detail').addEventListener('input',e=>{if(e.target.dataset.evField==='comments')checklistOf(evidenceItem($('evidence-dialog').dataset.itemId)).comments=e.target.value;});
$('evidence-detail').addEventListener('focusout',e=>{if(e.target.dataset.evField==='comments')renderMaterialKeep();});
function addEvidenceOwner(){
  const box=$('evidence-detail'),input=box.querySelector('[data-new-owner]'),name=input.value.trim();if(!name)return input.focus();
  if(!owners.includes(name))owners.push(name);checklistOf(evidenceItem($('evidence-dialog').dataset.itemId)).owner=name;openEvidence($('evidence-dialog').dataset.itemId);box.querySelector('[data-ev-field=owner]').focus();
}
$('evidence-detail').addEventListener('click',e=>{if(e.target.closest('[data-add-ev-owner]'))addEvidenceOwner();});
$('evidence-detail').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-new-owner]')){e.preventDefault();addEvidenceOwner();}});
$('close-evidence').onclick=()=>{$('evidence-dialog').close();renderMaterialKeep();};
$('evidence-dialog').addEventListener('close',()=>renderMaterialKeep());
// Technical User: tick off a finding's validation steps in the pop-up.
$('explore-detail').addEventListener('change',e=>{
  const box=e.target.closest('[data-steps]');if(!box||!e.target.matches('[data-step-index]'))return;
  const t=track(box.dataset.steps);t.steps=t.steps||[];t.steps[Number(e.target.dataset.stepIndex)]=e.target.checked;
  const f=report().findings.find(x=>x.id===box.dataset.steps);box.querySelector('h3 .muted').textContent=`${t.steps.filter(Boolean).length}/${f.validationSteps.length} done`;
  refreshBehindExplore();
});
// Applications tab: choose which application's login journey to show.
$('assessment-view').addEventListener('click',e=>{const a=e.target.closest('[data-app-select]');if(!a||e.target.closest('[data-explore],[data-finding]'))return;state.appId=a.dataset.appSelect;const y=scrollY;renderView();scrollTo(0,y);});
$('assessment-view').addEventListener('keydown',e=>{const a=e.target.closest('tr[data-app-select]');if(a&&e.target===a&&(e.key==='Enter'||e.key===' ')){e.preventDefault();a.click();}});

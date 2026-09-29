/* Proposed journeys for providers without a production connector. No API contracts are invented. */
(() => {
  'use strict';
  function flowStages(provider, journey) {
    const name = window.PulseProviders.get(provider).name;
    const steps = [
      {label:'Define scope',title:'01 / Agree the proposed assessment scope',text:`Choose the ${name} environment and the identity controls to review. This is a proposed journey; the connector is not implemented.`,nodes:['collect'],edge:null},
      {label:'Read access',title:'02 / Design least-privilege collection',text:'A future connector would need approved read access. Exact APIs, permissions, authentication and supported product versions still need implementation and validation.',nodes:['collect',provider],edge:['collect',provider]},
      {label:'Evidence',title:'03 / Make evidence and gaps explicit',text:'The proposed collector would record configuration and collection outcomes. The current workspace uses hand-authored examples, not provider responses.',nodes:[provider,'collect'],edge:[provider,'collect']},
      {label:'Organize',title:'04 / Preserve the evidence context',text:'The proposed snapshot would link each setting to its source, scope and collection time. No snapshot import or collection is implemented for this provider.',nodes:['collect','snapshot'],edge:['collect','snapshot']},
      {label:'Review',title:'05 / Explain risk and next actions',text:'The preview illustrates findings and recommended actions. Provider-specific rules and a validated scoring model do not exist yet; no score is calculated.',nodes:['snapshot','analyze'],edge:['snapshot','analyze']},
      {label:'Prepare',title:'06 / Prepare material for review',text:'Explore the fictional findings, action plans and NIS2 evidence pack in the workspace. No completed remediation is recorded. CLI reports and comparisons are not implemented for this provider.',nodes:['analyze','report'],edge:['analyze','report']},
    ];
    if (journey === 'offline') {
      steps[0] = {...steps[0],label:'Define input',text:'A future offline path would require a validated snapshot schema and a trustworthy source. No import contract is implemented for this provider.',nodes:['snapshot']};
      steps[1] = {...steps[1],label:'Validate',text:'Proposed: validate input structure, provenance and collection time before interpreting saved evidence. No provider API would be needed.',nodes:['snapshot'],edge:null};
      steps[2] = {...steps[2],text:'Proposed: preserve the original collection gaps. A saved file must not turn unknown settings into a positive result.',nodes:['snapshot'],edge:null};
      steps[3] = {...steps[3],nodes:['snapshot'],edge:null};
    }
    if (journey === 'partial') steps[2] = {...steps[2],label:'Access gap',text:'Proposed behavior: show the missing evidence explicitly after denied access. Exact permission diagnostics are not implemented; this is an illustrative 403 case.'};
    if (journey === 'retry') steps[2] = {...steps[2],label:'Rate limit',text:'Proposed behavior: apply bounded retries according to the provider contract and preserve a gap if collection cannot finish. Retry behavior is not implemented for this provider.'};
    if (journey === 'unauthorized') return steps.slice(0,2).concat({...steps[2],label:'Stop',title:'03 / Proposed stop on invalid authentication',text:'The proposed flow stops for invalid authentication and asks the operator to correct access. No completed assessment should be claimed. This 401 path is illustrative only.'});
    return steps;
  }
  function messages(provider, scenario, error) {
    const name=window.PulseProviders.get(provider).name;
    const item=(title,from,to,input,output,data,handling)=>({title,from,to,input,output,data,handling,protocol:'Proposed operation',authentication:'Not implemented',effect:'Illustration only · no requests or provider changes',sourcePath:'outputs/identity-pulse-demo/dist/provider-journeys.js (UI concept)',kind:'Proposed design · not implemented'});
    const setup=item('Define the provider scope',0,1,`Provider: ${name}\nPurpose: read-only identity assessment\n${provider==='ping'?'Product scope: PingOne customer identity':'Target: fictional demo environment'}`, 'Connector: not implemented\nAPI permissions: to be defined\nPosture score: not calculated', 'Agree the environment, supported product versions and controls to review.', 'This is a design example. There is no scan command or credential flow for this provider in the current CLI.');
    if(scenario==='failure') return [setup,
      item(`Illustrate an access outcome · ${error}`,1,2,'Proposed read attempt\nNo endpoint, credential or request is implemented.',`Illustrative outcome: ${error === '401'?'invalid authentication':error === '403'?'access denied':'rate limited'}`, 'The selected outcome illustrates the information an operator would need.', 'These are generic design cases, not captured responses or verified provider behavior.'),
      item(error==='401'?'Stop without a completed report':'Keep the evidence gap visible',1,error==='401'?1:3,'Outcome from the proposed read',error==='401'?'Proposed: stop and correct authentication.':error==='403'?'Proposed: record the uncollected area; do not infer safety.':'Proposed: retry within a bounded policy; record a gap if exhausted.', 'Missing evidence must remain visible in the assessment.', 'Error mapping, permission diagnostics and retry rules need provider-specific implementation and tests.'),
    ];
    if(scenario==='reports') return [
      item('Read a fictional UI example',3,1,'Hand-authored provider-samples.js example',`Provider: ${name}\nSource: illustrative UI data\nCollected at: not applicable`, 'The browser loads embedded fictional data to demonstrate the user experience.', 'This is not a provider snapshot and cannot be passed to an implemented scan command.'),
      item('Show findings and recommended actions',1,1,'Illustrative settings and findings', 'Business impact → recommended action → owner needed\nScore: not calculated\nCompletion: not recorded', 'The workspace organizes example findings, actions and evidence limits.', 'No analyzer ran. Rule coverage, classifications and a scoring model would need validation before production use.'),
      item('Preview the sample evidence pack',1,3,'Illustrative findings, actions and settings','Self-contained sample HTML\nMarked as fictional provider preview\nNo compliance or remediation verdict','The existing browser mockup can generate a clearly labeled illustrative pack.', 'This is a presentation export, not an implemented CLI evidence-pack command or an auditor-ready record.'),
    ];
    return [setup,
      item('Propose a configuration read',1,2,'Approved read access and agreed control scope\nExact API contract: not yet defined','Proposed output: settings plus collection status\nNo native API response is represented here.','A future connector would read relevant identity configuration without modifying it.','API endpoints, authentication, pagination and permission requirements must be verified against the chosen product and version.'),
      item('Preserve provenance and unknowns',2,1,'Proposed configuration and collection outcomes','Proposed record: source, scope, collection time, successful and missing areas','Evidence provenance allows reviewers to distinguish an observation from a recommendation.','The current examples use no collection timestamp because no real collection occurred.'),
      item('Display the proposed assessment',1,3,'Hand-authored sample findings','Findings · Action Plans · NIS2 Material\nIllustrative provider preview; no score','Both workspaces can explore the same fictional findings.','No connector, provider rules, runtime validation or production reporting pipeline has been added.'),
    ];
  }
  window.PulseProviderJourneys = {flowStages, messages};
})();

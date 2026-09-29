/* Hand-authored, fictional UI examples. No connector, API payload, scoring model or CLI report is implied. */
(() => {
  'use strict';
  const examples = {
    entra: {
      target:'Fictional Entra workforce tenant',
      areas:['Conditional Access', 'Authentication methods', 'Application access'],
      controls:[
        ['Conditional Access MFA requirement', 'Conditional Access', {examplePolicy:'Workforce access', mode:'Report-only', mfaRequired:true}, {examplePolicy:'Workforce access', mode:'Enabled', mfaRequired:true}],
        ['Authentication strength', 'Authentication methods', {exampleStrength:'Password plus SMS'}, {exampleStrength:'Phishing-resistant MFA'}],
      ],
      findings:[
        ['MFA requirements are not enforced by the example policy', 'Conditional Access', 'high', 'confirmed-risk', 'The fictional Workforce access policy requires MFA but is in report-only mode.', 'If no other control enforces MFA, a stolen password could expose workforce applications.', 'Ask the identity team to review all applicable policies, test the impact and agree a safe enforcement rollout.'],
        ['Sensitive access needs stronger authentication', 'Authentication methods', 'medium', 'requires-validation', 'The example sensitive-access journey allows password plus SMS; no phishing-resistant requirement is represented.', 'Phishable sign-in methods can leave sensitive access exposed to account takeover.', 'Confirm which users and applications need phishing-resistant MFA, then test the appropriate authentication strength.'],
      ],
    },
    ping: {
      target:'Fictional PingOne customer environment',
      areas:['Authentication policies', 'MFA policies', 'Application assignments'],
      controls:[
        ['Customer authentication policy', 'Authentication policies', {exampleJourney:'Customer portal', additionalFactor:'Not required'}, {exampleJourney:'Customer portal', additionalFactor:'Required'}],
        ['MFA method selection', 'MFA policies', {exampleMethods:['SMS']}, {exampleMethods:['FIDO2']}],
      ],
      findings:[
        ['The customer portal relies on a password alone', 'Authentication policies', 'high', 'requires-validation', 'The fictional customer-portal policy has no additional-factor requirement represented.', 'A stolen customer password could be enough to access sensitive account functions.', 'Agree which customer actions require MFA, check the complete sign-in flow and test the policy assigned to the portal.'],
        ['MFA options need a phishing-resistance review', 'MFA policies', 'medium', 'requires-validation', 'Only SMS is represented in the fictional MFA-method selection.', 'An intercepted or phished code may weaken protection for sensitive customer actions.', 'Review FIDO2 suitability, enrollment and recovery for the intended customer journeys.'],
      ],
    },
    keycloak: {
      target:'Fictional Keycloak customer realm',
      areas:['Realm protection', 'Authentication flows', 'Client configuration'],
      controls:[
        ['Brute-force detection', 'Realm protection', {exampleRealm:'customer-demo', bruteForceProtection:false}, {exampleRealm:'customer-demo', bruteForceProtection:true}],
        ['Additional-factor requirement', 'Authentication flows', {exampleFlow:'Customer browser login', otpRequirement:'Not required'}, {exampleFlow:'Customer browser login', otpRequirement:'Required'}],
      ],
      findings:[
        ['Password-guessing protection is switched off', 'Realm protection', 'high', 'confirmed-risk', 'Brute-force detection is disabled in the fictional customer realm.', 'Repeated password guesses could increase the chance of customer account takeover.', 'Review upstream protections and configure appropriate brute-force detection with lockout and recovery testing.'],
        ['The login flow needs an additional-factor review', 'Authentication flows', 'medium', 'requires-validation', 'The fictional browser-login flow does not require OTP or another second factor.', 'Sensitive customer actions may depend on a password alone.', 'Inspect the complete authentication flow and its bindings, then agree and test an additional-factor policy.'],
      ],
    },
  };
  for (const [id, example] of Object.entries(examples)) {
    const provider = window.PulseProviders.get(id);
    const reports = {}, controls = {};
    for (const scenario of ['risk','healthy','partial']) {
      const partial = scenario === 'partial', healthy = scenario === 'healthy';
      const availableAreas = partial ? example.areas.slice(0,1) : example.areas;
      const findings = (healthy ? [] : example.findings.filter(f => availableAreas.includes(f[1]))).map((f,i) => ({
        id:`DEMO-${id.toUpperCase()}-${i+1}`, title:f[0], category:f[1], severity:f[2], classification:f[3], confidence:'illustrative',
        evidence:{summary:f[4]}, businessRisk:f[5], recommendation:f[6], scoreImpact:null,
        validationSteps:['Confirm the actual configuration and all applicable policy assignments.', 'Agree test cases with the service owner and record the results before concluding that the risk is addressed.'],
        falsePositiveNotes:['Fictional UI example. Compensating controls and actual policy applicability have not been assessed.'],
        affectedResources:[{displayName:example.target}],
      }));
      if (partial) findings.push({
        id:`DEMO-${id.toUpperCase()}-COVERAGE`, title:'Some security controls could not be checked', category:'Coverage', severity:'medium', classification:'requires-validation', confidence:'illustrative',
        evidence:{summary:`This example withholds ${example.areas.slice(1).join(' and ')} to demonstrate incomplete access.`},
        businessRisk:'Unchecked controls remain unknown and cannot support a conclusion that access is protected.',
        recommendation:'Ask the technical owner to resolve the collection gap and reassess before accepting the results.',
        validationSteps:['Confirm the intended collection scope and permissions.', 'Repeat the assessment and verify that the missing evidence is available.'],
        falsePositiveNotes:['Simulated access gap; no API request was made.'], affectedResources:[{displayName:example.target}], scoreImpact:null,
      });
      reports[scenario] = {
        schemaVersion:'mockup-preview', demo:{illustrative:true, connectorImplemented:false, scenario, note:'Hand-authored fictional UI example. Not generated by the CLI and not a production report contract.'},
        provider:{id, displayName:provider.name, product:provider.scope, connectorVersion:'not-implemented', collectedAt:null},
        tenant:{primaryIdentifier:`fictional-${id}-demo`,displayName:example.target,kind:'fictional'}, environment:'Demo only', generatedAt:null,
        score:{overall:null, grade:null, maxScore:null, breakdown:[]},
        categories:example.areas.map(name=>({name,assessed:availableAreas.includes(name),score:null,weight:null})),
        findings,
        coverage:{partial,missingScopes:[],collectors:example.areas.map(name=>({collector:name,status:availableAreas.includes(name)?'success':'skipped',requiredScopes:[],count:availableAreas.includes(name)?1:null,notes:'Illustrated result only. Provider permissions are not implemented.'}))},
        limitations:['Illustrative preview: no connector, collection, analysis or score is implemented for this provider.', 'All settings and findings are fictional, authored for this mockup. No real environment has been assessed.', ...(id==='ping'?['The Ping example covers PingOne customer journeys; it does not represent PingFederate or every Ping product.']:[]), 'Organizational policies, runtime effectiveness and completed remediation are not supplied.'],
        assumptions:['Each scenario is an independent example, not a before-and-after assessment.'],
        positiveSignals:healthy?[{title:'Stronger settings are represented in this example',detail:'Review policy applicability, runtime enforcement and supporting records in a real assessment.'}]:[],
        remediationPlan:{buckets:[{name:'Agree the next actions',window:'Prioritize with the service owner',items:findings.map(f=>({findingId:f.id,severity:f.severity,action:f.recommendation,expectedOutcome:'Validated protection and a documented decision; no completion is recorded.'}))}]},
      };
      controls[scenario] = {
        source:'Hand-authored illustrative UI example · provider-samples.js', provider:id, target:`fictional-${id}-demo`, collectedAt:null,
        controls:example.controls.map(([name,collector,riskSettings,strongSettings])=>({name,collector,sourcePath:'Fictional example; not a provider API field',status:availableAreas.includes(collector)?'Illustrative setting':'Not assessed',settings:availableAreas.includes(collector)?(healthy?strongSettings:riskSettings):null,note:'Concept data only. No actual provider setting or runtime enforcement has been verified.'})).concat([
          {name:'Bot protection outside the illustrated controls',collector:'Not collected',sourcePath:'Not supplied',status:'Not assessed',settings:null,note:'No bot-protection configuration is supplied.'},
          {name:'Approved organizational policies',collector:'Not collected',sourcePath:'Not supplied',status:'Not assessed',settings:null,note:'Approved policy documents are not supplied.'},
        ]),
      };
    }
    window.PULSE_REPORTS[id] = reports;
    window.PULSE_CONTROLS[id] = controls;
  }
})();

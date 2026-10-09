/* Presentation catalog only. This does not register production CLI connectors. */
(() => {
  'use strict';
  const providers = {
    auth0: {name:'Auth0', scope:'Customer identity', implemented:true},
    okta: {name:'Okta', scope:'Workforce identity', implemented:true},
    entra: {name:'Microsoft Entra ID', scope:'Workforce identity', implemented:false},
    ping: {name:'Ping Identity', scope:'PingOne example', implemented:false},
    keycloak: {name:'Keycloak', scope:'Realm & application security', implemented:false},
  };
  const scenarios = {
    risk: {name:'Security gaps found', description:'This example has security gaps. Start with the priority findings, then review the recommended actions.'},
    healthy: {name:'Stronger controls', description:'This example has stronger settings and fewer findings.'},
    partial: {name:'Incomplete assessment', description:'Some settings could not be read. Missing evidence means unknown.'},
  };
  const resolve = id => Object.hasOwn(providers, id) ? id : 'auth0';
  const get = id => providers[resolve(id)];
  const isPreview = id => !get(id).implemented;
  const options = () => Object.entries(providers).map(([id,p]) => `<option value="${id}">${p.name}${p.implemented ? '' : ' · Preview'}</option>`).join('');
  window.PulseProviders = {providers, scenarios, resolve, get, isPreview, options};
})();

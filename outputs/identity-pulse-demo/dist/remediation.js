/* Remediation as code: example Terraform and Management API changes for a finding, generated from the
   synthetic fixture snapshot (window.PULSE_APPS). Identity Pulse stays read-only; these are snippets for an
   engineer to review and apply through their own pipeline. Only Auth0 and Okta (implemented connectors). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = values => JSON.stringify(values);
  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'this';
  const json = value => JSON.stringify(value, null, 2);
  const auth0Call = (method, path, body) => `curl -X ${method} "https://$AUTH0_DOMAIN/api/v2${path}" \\\n  -H "Authorization: Bearer $AUTH0_MGMT_TOKEN" \\\n  -H "Content-Type: application/json"${body === undefined ? '' : ` \\\n  -d '${JSON.stringify(body)}'`}`;
  const oktaCall = (method, path, body) => `curl -X ${method} "https://$OKTA_ORG_URL/api/v1${path}" \\\n  -H "Authorization: Bearer $OKTA_ACCESS_TOKEN" \\\n  -H "Accept: application/json" -H "Content-Type: application/json"${body === undefined ? '' : ` \\\n  -d '${JSON.stringify(body)}'`}`;
  const fix = (target, before, after, terraform, api, note = '') => ({target, before, after, terraform, api, note});

  function auth0(f, c, report) {
    const clients = c.clients || [], apis = c.resourceServers || [], conns = c.connections || [];
    const spaRisk = clients.find(x => (x.grant_types || []).some(g => ['implicit', 'password'].includes(g))) || clients[0];
    const nonRotating = clients.find(x => x.refresh_token && x.refresh_token.rotation_type !== 'rotating') || clients.find(x => (x.grant_types || []).includes('refresh_token'));
    const publicConf = clients.find(x => x.app_type === 'regular_web' && x.token_endpoint_auth_method === 'none') || clients.find(x => x.app_type === 'regular_web');
    const httpCb = clients.find(x => (x.callbacks || []).some(u => u.startsWith('http://')) || (x.callbacks || []).length > 10);
    const api = apis[0], grant = (c.clientGrants || [])[0], db = conns.find(x => x.strategy === 'auth0') || conns[0], action = (c.actions || [])[0], rule = (c.rules || [])[0];
    const ap = (block, enabled, extra) => fix('Tenant attack protection', {[block]: {enabled}}, {[block]: {enabled: true, ...extra}},
      `resource "auth0_attack_protection" "this" {\n  ${block} {\n    enabled = true\n${Object.entries(extra).map(([k, v]) => `    ${k} = ${typeof v === 'string' ? `"${v}"` : list(v)}`).join('\n')}\n  }\n}`,
      auth0Call('PATCH', `/attack-protection/${block.replaceAll('_', '-')}`, {enabled: true, ...extra}));
    const attack = c.attackProtection || {};
    switch (f.id) {
      case 'AUTH-SEC-004': return ap('brute_force_protection', attack.brute_force_protection?.enabled ?? false, {shields: ['block', 'user_notification'], mode: 'count_per_identifier_and_ip', max_attempts: 10});
      case 'AUTH-SEC-005': return ap('breached_password_detection', attack.breached_password_detection?.enabled ?? false, {shields: ['block', 'admin_notification'], method: 'standard'});
      case 'AUTH-SEC-006': return ap('suspicious_ip_throttling', attack.suspicious_ip_throttling?.enabled ?? false, {shields: ['block', 'admin_notification']});
      case 'AUTH-SEC-001': return fix('Guardian MFA policy', c.guardian || {}, {policy: 'all-applications', factors: [{name: 'otp', enabled: true}, {name: 'webauthn-roaming', enabled: true}]},
        `resource "auth0_guardian" "this" {\n  policy = "all-applications"\n  otp    = true\n\n  webauthn_roaming {\n    user_verification = "required"\n  }\n}`,
        `${auth0Call('PUT', '/guardian/policies', ['all-applications'])}\n\n${auth0Call('PUT', '/guardian/factors/otp', {enabled: true})}`,
        'Requiring MFA on every login can affect sign-in conversion. For customer identity, consider step-up MFA for sensitive actions through a post-login Action instead of "all-applications".');
      case 'AUTH-CLI-001': if (!spaRisk) break; {
        const grants = ['authorization_code', 'refresh_token'];
        return fix(`Application "${spaRisk.name}" (${spaRisk.client_id})`, {grant_types: spaRisk.grant_types, oidc_conformant: spaRisk.oidc_conformant ?? false}, {grant_types: grants, oidc_conformant: true},
          `resource "auth0_client" "${slug(spaRisk.name)}" {\n  name            = "${spaRisk.name}"\n  app_type        = "${spaRisk.app_type}"\n  oidc_conformant = true\n  grant_types     = ${list(grants)}\n}`,
          auth0Call('PATCH', `/clients/${spaRisk.client_id}`, {grant_types: grants, oidc_conformant: true}),
          'Removing implicit and password grants breaks clients that still use them. Move the app to authorization code with PKCE first.');
      }
      case 'AUTH-CLI-002': if (!httpCb) break; {
        const keep = (httpCb.callbacks || []).filter(u => u.startsWith('https://')).slice(0, 3), origins = (httpCb.web_origins || []).map(u => u.replace(/^http:/, 'https:'));
        return fix(`Application "${httpCb.name}" (${httpCb.client_id})`, {callbacks: `${(httpCb.callbacks || []).length} URLs, ${(httpCb.callbacks || []).filter(u => u.startsWith('http://')).length} over http://`, web_origins: httpCb.web_origins}, {callbacks: keep, web_origins: origins},
          `resource "auth0_client" "${slug(httpCb.name)}" {\n  name        = "${httpCb.name}"\n  app_type    = "${httpCb.app_type}"\n  # Keep only the HTTPS callbacks the application really uses.\n  callbacks   = ${list(keep)}\n  web_origins = ${list(origins)}\n}`,
          auth0Call('PATCH', `/clients/${httpCb.client_id}`, {callbacks: keep, web_origins: origins}),
          'The callback list here is an example. Confirm the real redirect URLs with the application owner before removing any.');
      }
      case 'AUTH-CLI-004': if (!nonRotating) break; {
        const rt = {rotation_type: 'rotating', expiration_type: 'expiring', token_lifetime: 2592000, idle_token_lifetime: 1296000, leeway: 0};
        return fix(`Application "${nonRotating.name}" (${nonRotating.client_id})`, {refresh_token: nonRotating.refresh_token || 'not configured'}, {refresh_token: rt},
          `resource "auth0_client" "${slug(nonRotating.name)}" {\n  name     = "${nonRotating.name}"\n  app_type = "${nonRotating.app_type}"\n\n  refresh_token {\n    rotation_type       = "rotating"\n    expiration_type     = "expiring"\n    token_lifetime      = 2592000 # 30 days absolute\n    idle_token_lifetime = 1296000 # 15 days idle\n    leeway              = 0\n  }\n}`,
          auth0Call('PATCH', `/clients/${nonRotating.client_id}`, {refresh_token: rt}));
      }
      case 'AUTH-CLI-005': if (!publicConf) break;
        return fix(`Application "${publicConf.name}" (${publicConf.client_id})`, {token_endpoint_auth_method: publicConf.token_endpoint_auth_method}, {token_endpoint_auth_method: 'client_secret_post'},
          `resource "auth0_client_credentials" "${slug(publicConf.name)}" {\n  client_id             = "${publicConf.client_id}"\n  authentication_method = "client_secret_post"\n  # Prefer "private_key_jwt" for high-assurance integrations.\n}`,
          auth0Call('PATCH', `/clients/${publicConf.client_id}`, {token_endpoint_auth_method: 'client_secret_post'}),
          'The application must be updated to send its client secret (or a signed JWT) before this change, or token requests will fail.');
      case 'AUTH-API-001': case 'AUTH-API-002': case 'AUTH-API-003': if (!api) break; {
        const change = f.id === 'AUTH-API-001' ? {signing_alg: 'RS256'} : f.id === 'AUTH-API-002' ? {enforce_policies: true, token_dialect: 'access_token_authz'} : {token_lifetime: 86400};
        const before = Object.fromEntries(Object.keys(change).map(k => [k, api[k] ?? 'not set']));
        return fix(`API "${api.name}" (${api.identifier})`, before, change,
          `resource "auth0_resource_server" "${slug(api.name)}" {\n  name       = "${api.name}"\n  identifier = "${api.identifier}"\n${Object.entries(change).map(([k, v]) => `  ${k.padEnd(16)} = ${typeof v === 'string' ? `"${v}"` : v}`).join('\n')}\n}`,
          auth0Call('PATCH', `/resource-servers/${api.id}`, change),
          f.id === 'AUTH-API-001' ? 'APIs that validate tokens with the shared HS256 secret must switch to the tenant JWKS (RS256) at the same time.' : f.id === 'AUTH-API-003' ? 'Shorter access tokens rely on refresh tokens or silent authentication; check client behavior.' : '');
      }
      case 'AUTH-API-005': if (!grant) break;
        return fix(`Client grant ${grant.id} (${grant.client_id} → ${grant.audience})`, {scope: `${(grant.scope || []).length} scopes`, allow_any_organization: grant.allow_any_organization ?? false}, {scope: ['<only the scopes the worker needs>'], allow_any_organization: false},
          `resource "auth0_client_grant" "${slug(grant.client_id)}" {\n  client_id = "${grant.client_id}"\n  audience  = "${grant.audience}"\n  scopes    = ["<only the scopes the worker needs>"]\n}`,
          auth0Call('PATCH', `/client-grants/${grant.id}`, {scope: ['<only the scopes the worker needs>'], allow_any_organization: false}));
      case 'AUTH-CON-001': case 'AUTH-CON-002': if (!db) break; {
        const change = f.id === 'AUTH-CON-001' ? {password_policy: 'good'} : {brute_force_protection: true};
        return fix(`Connection "${db.name}" (${db.id})`, Object.fromEntries(Object.keys(change).map(k => [k, db.options?.[k] ?? 'not set'])), change,
          `resource "auth0_connection" "${slug(db.name)}" {\n  name     = "${db.name}"\n  strategy = "${db.strategy}"\n\n  options {\n${Object.entries(change).map(([k, v]) => `    ${k} = ${typeof v === 'string' ? `"${v}"` : v}`).join('\n')}\n  }\n}`,
          auth0Call('PATCH', `/connections/${db.id}`, {options: {...(db.options || {}), ...change, customScripts: undefined}}),
          'PATCH replaces the whole options object. Read the current options first and send them back with only this value changed.');
      }
      case 'AUTH-TEN-001': return fix('Tenant settings', {friendly_name: c.tenant?.friendly_name ?? 'not set', support_email: c.tenant?.support_email ?? 'not set'}, {friendly_name: '<Your brand>', support_email: 'support@example.com', support_url: 'https://example.com/support', picture_url: 'https://example.com/logo.png'},
        'resource "auth0_tenant" "this" {\n  friendly_name = "<Your brand>"\n  support_email = "support@example.com"\n  support_url   = "https://example.com/support"\n  picture_url   = "https://example.com/logo.png"\n}',
        auth0Call('PATCH', '/tenants/settings', {friendly_name: '<Your brand>', support_email: 'support@example.com', support_url: 'https://example.com/support', picture_url: 'https://example.com/logo.png'}));
      case 'AUTH-TEN-003-A': case 'AUTH-TEN-003-B':
        return fix('Tenant session policy', {session_lifetime: `${c.tenant?.session_lifetime ?? '?'} h`, idle_session_lifetime: `${c.tenant?.idle_session_lifetime ?? '?'} h`}, {session_lifetime: '168 h (7 days)', idle_session_lifetime: '72 h (3 days)'},
          'resource "auth0_tenant" "this" {\n  session_lifetime      = 168 # hours, absolute\n  idle_session_lifetime = 72  # hours, idle\n}',
          auth0Call('PATCH', '/tenants/settings', {session_lifetime: 168, idle_session_lifetime: 72}),
          'Values are examples. Set them from your own risk appetite and the user experience you need.');
      case 'AUTH-TEN-004-A': return fix('Tenant flags', {disable_clickjack_protection_headers: c.tenant?.flags?.disable_clickjack_protection_headers ?? 'not set'}, {disable_clickjack_protection_headers: false},
        'resource "auth0_tenant" "this" {\n  flags {\n    disable_clickjack_protection_headers = false\n  }\n}',
        auth0Call('PATCH', '/tenants/settings', {flags: {disable_clickjack_protection_headers: false}}));
      case 'AUTH-UX-001': return fix('Universal Login', {universal_login_experience: c.prompts?.universal_login_experience ?? 'not set'}, {universal_login_experience: 'new', identifier_first: true},
        'resource "auth0_prompt" "this" {\n  universal_login_experience = "new"\n  identifier_first           = true\n}',
        auth0Call('PATCH', '/prompts', {universal_login_experience: 'new', identifier_first: true}),
        'Custom classic login pages need to be rebuilt with Universal Login branding or page templates.');
      case 'AUTH-UX-003': return fix('Custom domain', {custom_domains: (c.customDomains || []).length ? c.customDomains.map(d => d.domain) : 'none'}, {custom_domain: 'login.example.com', type: 'auth0_managed_certs'},
        'resource "auth0_custom_domain" "login" {\n  domain = "login.example.com"\n  type   = "auth0_managed_certs"\n}\n\nresource "auth0_custom_domain_verification" "login" {\n  custom_domain_id = auth0_custom_domain.login.id\n  # Requires the DNS CNAME record to be in place first.\n}',
        auth0Call('POST', '/custom-domains', {domain: 'login.example.com', type: 'auth0_managed_certs'}));
      case 'AUTH-OBS-001': return fix('Log streams', {log_streams: (c.logStreams || []).length || 'none active'}, {log_stream: 'HTTP stream to your SIEM'},
        'resource "auth0_log_stream" "siem" {\n  name = "SIEM"\n  type = "http"\n\n  sink {\n    http_endpoint       = "https://siem.example.com/ingest/auth0"\n    http_content_type   = "application/json"\n    http_content_format = "JSONLINES"\n    http_authorization  = var.siem_token\n  }\n}',
        auth0Call('POST', '/log-streams', {name: 'SIEM', type: 'http', sink: {httpEndpoint: 'https://siem.example.com/ingest/auth0', httpContentType: 'application/json', httpContentFormat: 'JSONLINES', httpAuthorization: '<token>'}}));
      case 'AUTH-EXT-001': return fix(`Rule "${rule?.name ?? 'legacy rule'}"`, {rules_enabled: (c.rules || []).filter(r => r.enabled).map(r => r.name), hooks_enabled: (c.hooks || []).filter(h => h.enabled).map(h => h.name)}, {post_login_action: `${rule?.name ?? 'migrated logic'} (node22)`, rules_enabled: []},
        `resource "auth0_action" "${slug(rule?.name ?? 'migrated')}" {\n  name    = "${rule?.name ?? 'migrated logic'}"\n  runtime = "node22"\n  deploy  = true\n  code    = file("\${path.module}/actions/${slug(rule?.name ?? 'migrated')}.js")\n\n  supported_triggers {\n    id      = "post-login"\n    version = "v3"\n  }\n}\n\nresource "auth0_trigger_actions" "post_login" {\n  trigger = "post-login"\n\n  actions {\n    id           = auth0_action.${slug(rule?.name ?? 'migrated')}.id\n    display_name = auth0_action.${slug(rule?.name ?? 'migrated')}.name\n  }\n}\n\n# After testing, disable the rule.\nresource "auth0_rule" "${slug(rule?.name ?? 'legacy')}" {\n  name    = "${rule?.name ?? 'legacy'}"\n  script  = file("\${path.module}/rules/${slug(rule?.name ?? 'legacy')}.js")\n  enabled = false\n}`,
        `${auth0Call('POST', '/actions/actions', {name: rule?.name ?? 'migrated logic', runtime: 'node22', code: '<ported rule code>', supported_triggers: [{id: 'post-login', version: 'v3'}]})}\n\n# Then deploy it, bind it to the post-login trigger and disable the rule:\n${auth0Call('POST', '/actions/actions/{action_id}/deploy')}\n\n${auth0Call('PATCH', '/actions/triggers/post-login/bindings', {bindings: [{ref: {type: 'action_id', value: '{action_id}'}, display_name: rule?.name ?? 'migrated logic'}]})}\n\n${auth0Call('PATCH', `/rules/${rule?.id ?? '{rule_id}'}`, {enabled: false})}`,
        'Rules and Hooks reach end of life on 18 November 2026. Port and test the logic in a development tenant first.');
      case 'AUTH-EXT-002': if (!action) break;
        return fix(`Action "${action.name}" (${action.id})`, {runtime: action.runtime}, {runtime: 'node22'},
          `resource "auth0_action" "${slug(action.name)}" {\n  name    = "${action.name}"\n  runtime = "node22"\n  deploy  = true\n  code    = file("\${path.module}/actions/${slug(action.name)}.js")\n}`,
          `${auth0Call('PATCH', `/actions/actions/${action.id}`, {runtime: 'node22'})}\n\n${auth0Call('POST', `/actions/actions/${action.id}/deploy`)}`,
          'Test the Action on the new runtime; npm dependencies may need updating.');
      case 'AUTH-RBAC-001': return fix('Roles', {roles: 0}, {roles: ['<role per access level>']},
        `resource "auth0_role" "customer_admin" {\n  name        = "Customer admin"\n  description = "Manages their own organization"\n}\n\nresource "auth0_role_permissions" "customer_admin" {\n  role_id = auth0_role.customer_admin.id\n\n  permissions {\n    resource_server_identifier = "${api?.identifier ?? 'https://api.example.com'}"\n    name                       = "${api?.scopes?.[0]?.value ?? 'read:profile'}"\n  }\n}`,
        auth0Call('POST', '/roles', {name: 'Customer admin', description: 'Manages their own organization'}),
        'Only needed if authorization is meant to live in Auth0. Confirm where it is managed first.');
      case 'AUTH-COV-001': {
        const missing = report.coverage.missingScopes || [];
        return fix('Pulse scanner application', {missing_scopes: missing}, {scopes_added: missing},
          `resource "auth0_client_grant" "pulse_scanner" {\n  client_id = var.pulse_scanner_client_id\n  audience  = "https://\${var.auth0_domain}/api/v2/"\n  scopes    = ${list(['read:tenant_settings', 'read:clients', '...existing scopes', ...missing])}\n}`,
          auth0Call('PATCH', '/client-grants/{pulse_scanner_grant_id}', {scope: ['...existing scopes', ...missing]}),
          'Read-only scopes only. Re-run the assessment afterwards to close the coverage gap.');
      }
    }
    return null;
  }

  function okta(f, c, report) {
    const app = (c.apps || [])[0], oc = app?.settings?.oauthClient || {}, hook = (c.eventHooks || [])[0], inline = (c.inlineHooks || [])[0], origin = (c.trustedOrigins || [])[0];
    switch (f.id) {
      case 'OKTA-APP-001': if (!app) break; {
        const after = {grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], redirect_uris: (oc.redirect_uris || []).map(u => u.replace(/^http:/, 'https:'))};
        return fix(`App "${app.label}" (${app.id})`, {grant_types: oc.grant_types, response_types: oc.response_types}, after,
          `resource "okta_app_oauth" "${slug(app.label)}" {\n  label                  = "${app.label}"\n  type                   = "${oc.application_type || 'web'}"\n  grant_types            = ${list(after.grant_types)}\n  response_types         = ${list(after.response_types)}\n  redirect_uris          = ${list(after.redirect_uris)}\n  refresh_token_rotation = "ROTATE"\n}`,
          oktaCall('PUT', `/apps/${app.id}`, {name: app.name, label: app.label, signOnMode: app.signOnMode, settings: {oauthClient: {...oc, ...after}}}),
          'PUT replaces the whole app. Read the current app object first and send it back with only these values changed.');
      }
      case 'OKTA-HOOK-001': if (!hook && !inline) break; {
        const h = hook || inline, uri = h.channel?.uri?.replace(/^http:/, 'https:');
        return fix(`${hook ? 'Event' : 'Inline'} hook "${h.name}" (${h.id})`, {uri: h.channel?.uri}, {uri},
          hook ? `resource "okta_event_hook" "${slug(h.name)}" {\n  name   = "${h.name}"\n  events = ["user.lifecycle.create"] # keep your existing events\n\n  channel = {\n    type    = "HTTP"\n    version = "1.0.0"\n    uri     = "${uri}"\n  }\n}` : `resource "okta_inline_hook" "${slug(h.name)}" {\n  name    = "${h.name}"\n  type    = "com.okta.oauth2.tokens.transform"\n  version = "1.0.0"\n\n  channel = {\n    version = "1.0.0"\n    uri     = "${uri}"\n    method  = "POST"\n  }\n}`,
          oktaCall('PUT', `/${hook ? 'eventHooks' : 'inlineHooks'}/${h.id}`, {name: h.name, channel: {...h.channel, uri}}),
          'The receiving endpoint must serve a valid TLS certificate before the change.');
      }
      case 'OKTA-NET-001': if (!origin) break; {
        const o = origin.origin.replace(/^http:/, 'https:');
        return fix(`Trusted origin "${origin.name}" (${origin.id})`, {origin: origin.origin}, {origin: o},
          `resource "okta_trusted_origin" "${slug(origin.name)}" {\n  name   = "${origin.name}"\n  origin = "${o}"\n  scopes = ["CORS", "REDIRECT"]\n}`,
          oktaCall('PUT', `/trustedOrigins/${origin.id}`, {name: origin.name, origin: o, scopes: [{type: 'CORS'}, {type: 'REDIRECT'}]}));
      }
      case 'OKTA-POL-002': return fix('Authenticators', {active: (c.authenticators || []).filter(a => a.status === 'ACTIVE').map(a => a.key)}, {active: ['okta_verify', 'webauthn']},
        'resource "okta_authenticator" "okta_verify" {\n  name   = "Okta Verify"\n  key    = "okta_verify"\n  status = "ACTIVE"\n}\n\nresource "okta_authenticator" "passkeys" {\n  name   = "FIDO2 (WebAuthn)"\n  key    = "webauthn"\n  status = "ACTIVE"\n}',
        `${oktaCall('POST', '/authenticators/{okta_verify_authenticator_id}/lifecycle/activate')}\n\n${oktaCall('POST', '/authenticators/{webauthn_authenticator_id}/lifecycle/activate')}`,
        'Then require these authenticators in the relevant app sign-in policies; activation alone does not enforce them.');
      case 'OKTA-POL-001': case 'OKTA-APP-006': return fix(app ? `App "${app.label}"` : 'App sign-in policy', {app_sign_in_policies: (c.policies?.appSignInPolicies || []).length}, {app_sign_in_policy: 'MFA required'},
        `resource "okta_app_signon_policy" "standard" {\n  name        = "Standard app sign-in"\n  description = "Requires two factors"\n}\n\nresource "okta_app_signon_policy_rule" "mfa" {\n  policy_id   = okta_app_signon_policy.standard.id\n  name        = "Require MFA"\n  factor_mode = "2FA"\n  re_authentication_frequency = "PT12H"\n}`,
        oktaCall('POST', '/policies', {type: 'ACCESS_POLICY', name: 'Standard app sign-in', description: 'Requires two factors'}),
        'Assign the policy to each app after creating it. Rule constraints depend on your authenticators.');
      case 'OKTA-MON-001': return fix('Log streams', {log_streams: (c.logStreams || []).length || 'none active'}, {log_stream: 'Splunk Cloud'},
        'resource "okta_log_stream" "splunk" {\n  name = "Splunk Cloud"\n  type = "splunk_cloud_logstreaming"\n\n  settings {\n    host    = "acme.splunkcloud.com"\n    edition = "aws"\n    token   = var.splunk_hec_token\n  }\n}',
        oktaCall('POST', '/logStreams', {type: 'splunk_cloud_logstreaming', name: 'Splunk Cloud', settings: {host: 'acme.splunkcloud.com', edition: 'aws', token: '<HEC token>'}}));
      case 'OKTA-ADM-001': return fix('Admin role assignments', {assignment: 'direct to users'}, {assignment: 'via an admin group'},
        'resource "okta_group" "super_admins" {\n  name = "Okta Super Admins"\n}\n\nresource "okta_group_role" "super_admin" {\n  group_id  = okta_group.super_admins.id\n  role_type = "SUPER_ADMIN"\n}',
        `${oktaCall('POST', '/groups/{admin_group_id}/roles', {type: 'SUPER_ADMIN'})}\n\n# Then remove the direct assignment from each user:\n${oktaCall('DELETE', '/users/{user_id}/roles/{role_assignment_id}')}`,
        'Keep at least one break-glass admin while moving assignments.');
      case 'OKTA-API-001': { const as = (c.authorizationServers || [])[0];
        return fix(`Authorization server "${as?.name ?? 'default'}"`, {access_policies: (c.authorizationServerPolicies || []).length}, {access_policy: 'Default policy with explicit lifetimes'},
          `resource "okta_auth_server_policy" "default" {\n  auth_server_id   = "${as?.id ?? '{auth_server_id}'}"\n  name             = "Default policy"\n  description      = "Explicit token lifetimes"\n  priority         = 1\n  client_whitelist = ["ALL_CLIENTS"]\n}\n\nresource "okta_auth_server_policy_rule" "default" {\n  auth_server_id                 = "${as?.id ?? '{auth_server_id}'}"\n  policy_id                      = okta_auth_server_policy.default.id\n  name                           = "Default rule"\n  priority                       = 1\n  grant_type_whitelist           = ["authorization_code"]\n  scope_whitelist                = ["*"]\n  group_whitelist                = ["EVERYONE"]\n  access_token_lifetime_minutes  = 60\n  refresh_token_lifetime_minutes = 43200\n}`,
          oktaCall('POST', `/authorizationServers/${as?.id ?? '{auth_server_id}'}/policies`, {type: 'OAUTH_AUTHORIZATION_POLICY', name: 'Default policy', priority: 1, conditions: {clients: {include: ['ALL_CLIENTS']}}}));
      }
      case 'OKTA-ORG-001': return fix(`Org "${c.org?.companyName ?? c.org?.subdomain ?? 'org'}"`, {website: c.org?.website ?? 'not set'}, {website: 'https://www.example.com', supportPhoneNumber: '+48 22 000 00 00'},
        'resource "okta_org_configuration" "this" {\n  company_name         = "' + (c.org?.companyName ?? '<Company>') + '"\n  website              = "https://www.example.com"\n  support_phone_number = "+48 22 000 00 00"\n}',
        oktaCall('POST', '/org', {website: 'https://www.example.com', supportPhoneNumber: '+48 22 000 00 00'}),
        'Values are placeholders; use your organization\'s real website and support contact.');
      case 'OKTA-NET-002': { const zone = (c.networkZones || [])[0], pol = (c.policies?.globalSessionPolicies || [])[0];
        return fix(`Global session policy "${pol?.name ?? 'Global Session'}"`, {network_zones_referenced: 0}, {network_connection: 'ZONE', network_includes: [zone?.name ?? '<trusted zone>']},
          `resource "okta_policy_rule_signon" "trusted_network" {\n  policy_id          = "${pol?.id ?? '{policy_id}'}"\n  name               = "Trusted network"\n  status             = "ACTIVE"\n  access             = "ALLOW"\n  network_connection = "ZONE"\n  network_includes   = ["${zone?.id ?? '{zone_id}'}"]\n  mfa_required       = true\n}`,
          oktaCall('POST', `/policies/${pol?.id ?? '{policy_id}'}/rules`, {type: 'SIGN_ON', name: 'Trusted network', conditions: {network: {connection: 'ZONE', include: [zone?.id ?? '{zone_id}']}}, actions: {signon: {access: 'ALLOW', requireFactor: true}}}),
          'Decide what each zone should allow (for example, block or require MFA outside trusted networks) before referencing it.');
      }
      case 'OKTA-USR-002': return fix('Dormant users', {dormant_users: 'present'}, {dormant_users: 'reviewed and deactivated'}, null,
        `# List users who have not signed in for 90 days (adjust the date):\n${oktaCall('GET', '/users?search=lastLogin+lt+"2026-07-01T00:00:00.000Z"')}\n\n# Deactivate a confirmed dormant user:\n${oktaCall('POST', '/users/{user_id}/lifecycle/deactivate')}`,
        'User lifecycle is not managed in Terraform here. Confirm with account owners before deactivating.');
      case 'OKTA-COV-001': { const missing = report.coverage.missingScopes || [];
        return fix('Pulse scanner app', {missing_scopes: missing}, {scopes_granted: missing},
          `resource "okta_app_oauth_api_scope" "pulse_scanner" {\n  app_id = var.pulse_scanner_app_id\n  issuer = "https://\${var.okta_org_url}"\n  scopes = ${list(missing.length ? missing : ['<missing read scopes>'])}\n}`,
          oktaCall('POST', '/apps/{pulse_scanner_app_id}/grants', {issuer: 'https://$OKTA_ORG_URL', scopeId: missing[0] || '<scope>'}),
          'Read-only scopes only. Re-run the assessment afterwards to close the coverage gap.');
      }
    }
    return null;
  }

  // Returns {available, reason?, fix?} for a finding.
  function forFinding(provider, sample, finding, report) {
    if (report.demo?.illustrative || !['auth0', 'okta'].includes(provider)) return {available: false, reason: `No snippet: the ${window.PulseProviders.get(provider).name} connector is a proposed design, so no API or Terraform contract is defined.`};
    const config = window.PULSE_APPS?.[provider]?.[sample];
    const result = config ? (provider === 'auth0' ? auth0 : okta)(finding, config, report) : null;
    return result ? {available: true, fix: result, source: config.source} : {available: false, reason: 'No generated snippet for this rule. Follow the recommended change and validation steps.'};
  }

  function panel(provider, sample, finding, report) {
    const r = forFinding(provider, sample, finding, report);
    if (!r.available) return `<section class="remediation"><div class="rem-head"><p class="eyebrow">Remediation as code</p></div><p class="muted">${esc(r.reason)}</p></section>`;
    const {fix: x} = r, tfName = provider === 'auth0' ? 'Terraform · auth0/auth0' : 'Terraform · okta/okta', apiName = provider === 'auth0' ? 'Management API' : 'Okta API';
    const tabs = [x.terraform && ['tf', tfName, x.terraform], ['api', apiName, x.api]].filter(Boolean);
    return `<section class="remediation" data-remediation><div class="rem-head"><div><p class="eyebrow">Remediation as code</p><h3>${esc(x.target)}</h3></div><span class="pill">Generated example · review before applying</span></div>
      <div class="rem-diff"><div><span>Current</span><pre>${esc(json(x.before))}</pre></div><span class="rem-arrow" aria-hidden="true">→</span><div><span>Proposed</span><pre>${esc(json(x.after))}</pre></div></div>
      <div class="rem-tabs" role="tablist">${tabs.map(([id, label], i) => `<button type="button" role="tab" data-rem-tab="${id}" aria-selected="${i === 0}">${esc(label)}</button>`).join('')}<button type="button" class="rem-copy" data-rem-copy>Copy</button></div>
      ${tabs.map(([id, , code], i) => `<pre class="rem-code" data-rem-panel="${id}" ${i ? 'hidden' : ''}><code>${esc(code)}</code></pre>`).join('')}
      ${x.note ? `<p class="rem-note"><strong>Before you apply:</strong> ${esc(x.note)}</p>` : ''}
      <p class="section-note">Generated from ${esc(r.source)} (synthetic). Check attribute names against your provider version and apply through your own pipeline; Identity Pulse never writes to the tenant.</p></section>`;
  }

  // Tabs and copy, delegated so the panel works in any dialog.
  document.addEventListener('click', async e => {
    const tab = e.target.closest('[data-rem-tab]'), copy = e.target.closest('[data-rem-copy]'), box = e.target.closest('[data-remediation]');
    if (!box) return;
    if (tab) { box.querySelectorAll('[data-rem-tab]').forEach(b => b.setAttribute('aria-selected', String(b === tab))); box.querySelectorAll('[data-rem-panel]').forEach(p => { p.hidden = p.dataset.remPanel !== tab.dataset.remTab; }); }
    if (copy) { const code = box.querySelector('[data-rem-panel]:not([hidden])').textContent; try { await navigator.clipboard.writeText(code); copy.textContent = 'Copied'; } catch { copy.textContent = 'Select to copy'; } setTimeout(() => { copy.textContent = 'Copy'; }, 1600); }
  });

  window.PulseRemediation = {forFinding, panel};
})();

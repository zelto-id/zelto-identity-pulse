/* Applications tab (Tech SPOC): per-app token lifetime matrix and login journey,
   built from the synthetic fixture snapshot in window.PULSE_APPS. Read-only; nothing here changes a tenant. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const B = () => window.PulseBusiness;
  const RISKY_GRANTS = ['implicit', 'password'];
  const duration = seconds => {
    if (seconds == null) return null;
    const d = seconds / 86400;
    return d >= 1 ? `${+d.toFixed(1)} day${d === 1 ? '' : 's'}` : `${+(seconds / 3600).toFixed(1)} h`;
  };
  const hours = h => h == null ? null : h >= 24 ? `${+(h / 24).toFixed(1)} days` : `${h} h`;
  const tag = (text, level) => `<span class="lvl lvl-${level}">${esc(text)}</span>`;
  const notCollected = '<span class="muted">Not collected</span>';
  const typeLabel = {spa: 'Single-page app', regular_web: 'Regular web app', native: 'Native app', non_interactive: 'Machine-to-machine', web: 'Web app', browser: 'Single-page app', service: 'Service'};

  // ---- Auth0 ----
  function auth0Apps(c) {
    return (c.clients || []).map(x => {
      const rt = x.refresh_token, hasRefresh = (x.grant_types || []).includes('refresh_token'), m2m = x.app_type === 'non_interactive';
      const exposure = !hasRefresh ? ['No refresh tokens', 'ok'] : !rt || rt.expiration_type === 'non-expiring' ? ['Unlimited', 'risk']
        : rt.rotation_type !== 'rotating' ? [duration(rt.token_lifetime) || 'Expiring', 'warn'] : [`${duration(rt.token_lifetime) || 'Expiring'} · reuse detected`, 'ok'];
      const http = (x.callbacks || []).filter(u => u.startsWith('http://')).length;
      return {
        id: x.client_id, name: x.name, type: x.app_type, m2m,
        grants: x.grant_types || [],
        clientAuth: x.token_endpoint_auth_method ? [x.token_endpoint_auth_method, x.token_endpoint_auth_method === 'none' && ['regular_web', 'non_interactive'].includes(x.app_type) ? 'risk' : 'ok'] : ['not set', 'warn'],
        refresh: !hasRefresh ? null : rt ? {rotation: rt.rotation_type, expiration: rt.expiration_type, absolute: duration(rt.token_lifetime), idle: duration(rt.idle_token_lifetime)} : {rotation: 'not set', expiration: 'not set'},
        window: exposure,
        callbacks: (x.callbacks || []).length ? [`${x.callbacks.length}${http ? ` · ${http} over http://` : ''}`, http || x.callbacks.length > 10 ? 'warn' : 'ok'] : m2m ? null : ['None', 'ok'],
      };
    });
  }
  function auth0Journey(app, c) {
    const t = c.tenant || {}, ap = c.attackProtection, g = c.guardian, domain = (c.customDomains || []).find(d => d.primary) || (c.customDomains || [])[0];
    const on = v => v ? 'on' : 'off';
    if (app.m2m) return [
      {title: 'Client authentication', level: app.clientAuth[1], detail: `Client credentials grant · ${app.clientAuth[0]}`, rules: ['AUTH-CLI-005']},
      {title: 'API permissions', level: (c.clientGrants || []).some(g2 => g2.client_id === app.id && (g2.scope || []).length > 10) ? 'warn' : 'ok', detail: (c.clientGrants || []).filter(g2 => g2.client_id === app.id).map(g2 => `${g2.audience} · ${(g2.scope || []).length} scopes`).join('; ') || 'No client grants', rules: ['AUTH-API-005']},
      {title: 'Access token', level: (c.resourceServers || []).some(r => r.signing_alg === 'HS256') ? 'risk' : 'ok', detail: (c.resourceServers || []).map(r => `${r.name}: ${r.signing_alg}, ${duration(r.token_lifetime)}`).join('; ') || notCollected, rules: ['AUTH-API-001', 'AUTH-API-003']},
      {title: 'Monitoring', level: c.logStreams == null ? 'unknown' : c.logStreams.length ? 'ok' : 'warn', detail: c.logStreams == null ? 'Not collected' : c.logStreams.length ? `${c.logStreams.length} log stream(s)` : 'No log stream to a SIEM', rules: ['AUTH-OBS-001']},
    ];
    return [
      {title: 'Sign-in page', level: c.prompts?.universal_login_experience === 'classic' || !domain ? 'warn' : 'ok', detail: `${domain ? domain.domain : 'Default *.auth0.com domain'} · ${c.prompts ? `${c.prompts.universal_login_experience === 'new' ? 'Universal Login' : 'Classic login'}${c.prompts.identifier_first ? ', identifier first' : ''}` : 'login experience not collected'}${t.flags?.disable_clickjack_protection_headers ? ' · clickjack headers off' : ''}`, rules: ['AUTH-UX-001', 'AUTH-UX-003', 'AUTH-TEN-004-A']},
      {title: 'Identity source', level: (c.connections || []).some(x => x.options?.password_policy === 'low' || x.options?.brute_force_protection === false) ? 'risk' : 'ok', detail: (c.connections || []).map(x => `${x.name} (${x.strategy}) · password policy ${x.options?.password_policy ?? '?'}, brute force ${on(x.options?.brute_force_protection)}${x.options?.enabledDatabaseCustomization ? ', custom DB scripts' : ''}`).join('; ') || 'No connections', rules: ['AUTH-CON-001', 'AUTH-CON-002', 'AUTH-CON-003'], hint: 'Per-application connection enablement is not in the snapshot; all connections are shown.'},
      {title: 'Attack protection', level: ap == null ? 'unknown' : [ap.brute_force_protection, ap.breached_password_detection, ap.suspicious_ip_throttling].every(x => x?.enabled) ? 'ok' : 'risk', detail: ap == null ? 'Not collected' : `Brute force ${on(ap.brute_force_protection?.enabled)} · breached passwords ${on(ap.breached_password_detection?.enabled)} · IP throttling ${on(ap.suspicious_ip_throttling?.enabled)}`, rules: ['AUTH-SEC-004', 'AUTH-SEC-005', 'AUTH-SEC-006']},
      {title: 'MFA', level: g == null ? 'unknown' : g.policy === 'never' || !(g.factors || []).some(x => x.enabled) ? 'risk' : 'ok', detail: g == null ? 'Not collected' : `Policy "${g.policy}" · factors: ${(g.factors || []).filter(x => x.enabled).map(x => x.name).join(', ') || 'none'}`, rules: ['AUTH-SEC-001']},
      {title: 'Login pipeline', level: (c.rules || []).some(r => r.enabled) || (c.hooks || []).some(h => h.enabled) ? 'risk' : c.rules == null || c.hooks == null || c.actions == null ? 'unknown' : (c.actions || []).some(a => /node1[0-8]/.test(a.runtime)) ? 'warn' : 'ok', detail: [c.rules == null ? 'Rules not collected' : `${(c.rules || []).filter(r => r.enabled).length} rule(s)${(c.rules || []).some(r => r.enabled) ? ' — end of life 18 Nov 2026' : ''}`, c.actions == null ? 'Actions not collected' : `${(c.actions || []).length} Action(s)${(c.actions || []).length ? ` (${c.actions.map(a => a.runtime).join(', ')})` : ''}`, c.hooks == null ? 'Hooks not collected' : `${(c.hooks || []).filter(h => h.enabled).length} hook(s)`].join(' · '), rules: ['AUTH-EXT-001', 'AUTH-EXT-002']},
      {title: 'Tokens & session', level: app.window[1] === 'risk' || app.grants.some(x => RISKY_GRANTS.includes(x)) ? 'risk' : app.window[1], detail: `Grants: ${app.grants.join(', ')} · refresh: ${app.refresh ? `${app.refresh.rotation}, ${app.refresh.expiration}` : 'none'} · session ${hours(t.session_lifetime) ?? '?'} absolute / ${hours(t.idle_session_lifetime) ?? '?'} idle`, rules: ['AUTH-CLI-001', 'AUTH-CLI-004', 'AUTH-TEN-003-A', 'AUTH-TEN-003-B']},
      {title: 'Monitoring', level: c.logStreams == null ? 'unknown' : c.logStreams.length ? 'ok' : 'warn', detail: c.logStreams == null ? 'Not collected' : c.logStreams.length ? `${c.logStreams.length} log stream(s)` : 'No log stream to a SIEM', rules: ['AUTH-OBS-001']},
    ];
  }
  function auth0Apis(c) {
    const apis = c.resourceServers;
    if (apis == null) return '';
    return `<h3 class="apps-sub">APIs and access tokens</h3><div class="table-wrap dash-wrap"><table class="dash-table apps-table"><thead><tr><th scope="col">API</th><th scope="col">Signing</th><th scope="col">Access token lifetime</th><th scope="col">Authorization</th></tr></thead><tbody>${apis.map(r => `<tr><td><strong>${esc(r.name)}</strong><small>${esc(r.identifier)}</small></td><td>${tag(r.signing_alg, r.signing_alg === 'HS256' ? 'risk' : 'ok')}</td><td>${tag(duration(r.token_lifetime) ?? 'default', r.token_lifetime > 86400 ? 'warn' : 'ok')}</td><td>${tag(r.enforce_policies ? 'RBAC enforced' : 'RBAC not enforced', r.enforce_policies ? 'ok' : 'warn')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  // ---- Okta ----
  function oktaApps(c) {
    return (c.apps || []).map(a => {
      const oc = a.settings?.oauthClient || {}, grants = oc.grant_types || [], rt = oc.refresh_token, hasRefresh = grants.includes('refresh_token');
      const http = (oc.redirect_uris || []).filter(u => u.startsWith('http://')).length;
      return {
        id: a.id, name: a.label, type: oc.application_type, m2m: oc.application_type === 'service', grants,
        clientAuth: [oc.token_endpoint_auth_method || 'set in app', 'ok'],
        refresh: !hasRefresh ? null : {rotation: rt?.rotation_type || 'not set', expiration: rt?.expiration_type || 'not set', absolute: null, idle: null},
        window: !hasRefresh ? ['No refresh tokens', 'ok'] : rt?.rotation_type === 'ROTATE' ? ['Per auth server policy · reuse detected', 'ok'] : ['Per auth server policy · no rotation', 'warn'],
        callbacks: [`${(oc.redirect_uris || []).length}${http ? ` · ${http} over http://` : ''}`, http ? 'warn' : 'ok'],
      };
    });
  }
  function oktaJourney(app, c) {
    const p = c.policies || {}, auth = c.authenticators, active = (auth || []).filter(a => a.status === 'ACTIVE').map(a => a.key);
    const strong = active.some(k => ['okta_verify', 'webauthn', 'smart_card_idp'].includes(k));
    return [
      {title: 'Sign-in domain', level: c.domains == null ? 'unknown' : (c.domains || []).length ? 'ok' : 'warn', detail: c.domains == null ? 'Not collected' : (c.domains || []).length ? c.domains.map(d => d.domain).join(', ') : `Default ${c.org?.subdomain ?? 'org'}.okta.com domain`, rules: ['OKTA-ORG-001']},
      {title: 'Global session policy', level: (p.globalSessionPolicies || []).length ? 'ok' : 'warn', detail: (p.globalSessionPolicies || []).map(x => `${x.name} (${(x.rules || []).length} rule)`).join('; ') || 'No global session policy collected', rules: ['OKTA-POL-001', 'OKTA-NET-002']},
      {title: 'App sign-in policy', level: (p.appSignInPolicies || []).length ? 'ok' : 'risk', detail: (p.appSignInPolicies || []).map(x => x.name).join('; ') || 'No app sign-in policy identified', rules: ['OKTA-APP-006', 'OKTA-POL-001']},
      {title: 'Authenticators', level: auth == null ? 'unknown' : strong ? 'ok' : 'risk', detail: auth == null ? 'Not collected' : `Active: ${active.join(', ') || 'none'}${strong ? '' : ' · no phishing-resistant or app-based factor'}`, rules: ['OKTA-POL-002']},
      {title: 'Token inline hooks', level: c.inlineHooks == null ? 'unknown' : (c.inlineHooks || []).some(h => h.channel?.uri?.startsWith('http://')) ? 'risk' : 'ok', detail: c.inlineHooks == null ? 'Not collected' : (c.inlineHooks || []).map(h => `${h.name} → ${h.channel?.uri}`).join('; ') || 'None', rules: ['OKTA-HOOK-001']},
      {title: 'Tokens', level: app.grants.some(x => RISKY_GRANTS.includes(x)) ? 'risk' : app.window[1], detail: `Grants: ${app.grants.join(', ')} · refresh: ${app.refresh ? `${app.refresh.rotation}, ${app.refresh.expiration}` : 'none'} · auth server policies: ${(c.authorizationServerPolicies || []).length}`, rules: ['OKTA-APP-001', 'OKTA-API-001', 'OKTA-NET-001']},
      {title: 'Monitoring', level: c.logStreams == null ? 'unknown' : (c.logStreams || []).length ? 'ok' : 'warn', detail: `${c.logStreams == null ? 'Log streams not collected' : `${(c.logStreams || []).length} log stream(s)`} · ${(c.eventHooks || []).length} event hook(s)`, rules: ['OKTA-MON-001', 'OKTA-HOOK-001']},
    ];
  }
  function oktaServers(c) {
    const servers = c.authorizationServers;
    if (servers == null) return '';
    return `<h3 class="apps-sub">Authorization servers and token policy</h3><div class="table-wrap dash-wrap"><table class="dash-table apps-table"><thead><tr><th scope="col">Authorization server</th><th scope="col">Status</th><th scope="col">Access policies</th><th scope="col">Token lifetimes</th></tr></thead><tbody>${servers.map(s => { const pol = (c.authorizationServerPolicies || []).filter(x => x.authorizationServerId === s.id); return `<tr><td><strong>${esc(s.name)}</strong><small>${esc(s.issuer)}</small></td><td>${tag(s.status, s.status === 'ACTIVE' ? 'ok' : 'warn')}</td><td>${tag(pol.length ? `${pol.length} policy` : 'None', pol.length ? 'ok' : 'risk')}</td><td><span class="muted">Set in policy rules (not in this snapshot)</span></td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">No authorization servers</td></tr>'}</tbody></table></div>`;
  }

  // ---- Rendering ----
  function render(provider, sample, report, selectedId, findingAttr) {
    const c = window.PULSE_APPS?.[provider]?.[sample];
    if (report.demo?.illustrative || !c) return `<section class="panel"><div class="panel-head"><div><h2>Applications</h2><p>Per-application token settings and login journeys.</p></div></div><p class="empty">Not available for ${esc(window.PulseProviders.get(provider).name)}: the connector is a proposed design, so no application configuration is collected. Choose Auth0 or Okta to explore this view.</p></section>`;
    const apps = provider === 'auth0' ? auth0Apps(c) : oktaApps(c), app = apps.find(a => a.id === selectedId) || apps.find(a => !a.m2m) || apps[0];
    const ids = new Set(report.findings.map(f => f.id));
    const finding = id => report.findings.find(f => f.id === id);
    const t = c.tenant || {};
    const matrix = `<div class="table-wrap dash-wrap"><table class="dash-table apps-table token-matrix"><thead><tr><th scope="col">Application</th><th scope="col">Grant types</th><th scope="col">Client auth</th><th scope="col">Refresh token</th><th scope="col">Stolen refresh token usable for</th><th scope="col">Session</th><th scope="col">Callbacks</th></tr></thead><tbody>${apps.map(a => `<tr class="dash-row ${a.id === app?.id ? 'selected' : ''}" data-app-select="${esc(a.id)}" tabindex="0" aria-label="Show login journey for ${esc(a.name)}"><td><strong>${esc(a.name)}</strong><small>${esc(typeLabel[a.type] || a.type || 'App')} · <code>${esc(a.id)}</code></small></td><td><div class="grant-list">${a.grants.map(g => tag(g, RISKY_GRANTS.includes(g) ? 'risk' : 'neutral')).join('')}</div></td><td>${tag(a.clientAuth[0], a.clientAuth[1])}</td><td>${a.refresh ? `${tag(a.refresh.rotation, /^(rotating|ROTATE)$/.test(a.refresh.rotation) ? 'ok' : 'warn')}${tag(a.refresh.expiration, /non-expiring/.test(a.refresh.expiration) ? 'risk' : /^(expiring|EXPIRING)$/.test(a.refresh.expiration) ? 'ok' : 'warn')}${a.refresh.absolute ? `<small>${esc(a.refresh.absolute)} absolute · ${esc(a.refresh.idle ?? '—')} idle</small>` : ''}` : '<span class="muted">Not used</span>'}</td><td>${tag(a.window[0], a.window[1])}</td><td>${a.m2m ? '<span class="muted">n/a</span>' : provider === 'auth0' ? `<small class="nowrap">${esc(hours(t.session_lifetime) ?? '?')} absolute</small><small class="nowrap">${esc(hours(t.idle_session_lifetime) ?? '?')} idle</small>` : '<small>Global session policy</small>'}</td><td>${a.callbacks ? tag(a.callbacks[0], a.callbacks[1]) : '<span class="muted">n/a</span>'}</td></tr>`).join('')}</tbody></table></div>`;
    const steps = app ? (provider === 'auth0' ? auth0Journey(app, c) : oktaJourney(app, c)) : [];
    const levelText = {ok: 'OK', warn: 'Review', risk: 'Risk', unknown: 'Not collected'};
    const journey = app ? `<div class="journey-head"><h3 class="apps-sub">Login journey · ${esc(app.name)}</h3><div class="app-pills">${apps.map(a => `<button type="button" class="app-pill" data-app-select="${esc(a.id)}" aria-pressed="${a.id === app.id}">${esc(a.name)}</button>`).join('')}</div></div>
      <ol class="journey">${steps.map((s, i) => { const fs = s.rules.filter(id => ids.has(id)).map(finding); return `<li class="journey-step lvl-border-${s.level}"><div class="js-top"><span class="js-num">${i + 1}</span>${tag(levelText[s.level], s.level)}</div><h4>${esc(s.title)}</h4><p>${esc(s.detail)}</p>${s.hint ? `<p class="js-hint">${esc(s.hint)}</p>` : ''}${fs.length ? `<div class="js-findings">${fs.map(f => `<button type="button" class="js-finding" ${findingAttr}="${esc(f.id)}"><span class="dot ${['critical', 'high'].includes(f.severity) ? 'red' : f.severity === 'medium' ? 'amber' : ''}"></span>${esc(findingAttr === 'data-explore' ? B().title(f) : f.title)}</button>`).join('')}</div>` : ''}</li>`; }).join('')}</ol>` : '';
    const risky = apps.filter(a => a.window[1] === 'risk' || a.grants.some(g => RISKY_GRANTS.includes(g))).length;
    return `<section class="panel"><div class="panel-head"><div><h2>Applications</h2><p>Token lifetimes for every application and the path a user takes to sign in. Select an application to see its login journey; select a finding to open it.</p></div><span class="pill ${risky ? 'amber' : 'green'}">${apps.length} application${apps.length === 1 ? '' : 's'}${risky ? ` · ${risky} with token risks` : ''}</span></div>
      <h3 class="apps-sub">Token lifetime matrix</h3>${matrix}
      ${journey}
      ${provider === 'auth0' ? auth0Apis(c) : oktaServers(c)}
      <p class="section-note">Built from ${esc(c.source)} (synthetic fixture). "Stolen refresh token usable for" is the longest time a leaked refresh token could keep working under these settings; rotation lets the provider detect reuse.</p></section>`;
  }

  window.PulseApps = {render};
})();

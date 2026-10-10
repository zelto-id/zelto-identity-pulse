/* Audience is chosen on the entry page, then carried through the workspace. */
(() => {
  'use strict';
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* URL navigation works without storage. */ } };
  const params = new URLSearchParams(location.search);
  const validAudience = value => ['business', 'tech'].includes(value);
  const page = location.pathname.split('/').pop() || '';
  const diagramFallback = /^(technical-flow|data-flow)\.html$/.test(page) ? 'tech' : null;
  const audience = [params.get('audience'), read('pulse-demo-audience'), diagramFallback].find(validAudience);
  const context = {
    provider: window.PulseProviders.resolve(params.get('provider')),
    sample: ['risk', 'healthy', 'partial'].includes(params.get('sample')) ? params.get('sample') : 'risk',
  };
  function syncLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!/^(index|workspace|data-flow|technical-flow)\.html(?:\?|$)/.test(raw)) return;
      const url = new URL(raw, location.href);
      if (!url.pathname.endsWith('/index.html')) url.searchParams.set('audience', audience);
      else url.searchParams.delete('audience');
      url.searchParams.set('provider', context.provider);
      url.searchParams.set('sample', context.sample);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search);
    });
  }
  function updateContext(provider, sample = context.sample) {
    context.provider = window.PulseProviders.resolve(provider);
    context.sample = ['risk', 'healthy', 'partial'].includes(sample) ? sample : 'risk';
    syncLinks();
    try {
      const url = new URL(location.href);
      for (const [key, value] of Object.entries({...context, audience})) url.searchParams.set(key, value);
      history.replaceState(null, '', url);
    } catch { /* Optional for local files. */ }
  }
  window.PulseExperience = {audience, context, read, write, updateContext};
  if (!validAudience(audience)) {
    document.documentElement.style.visibility = 'hidden';
    location.replace('index.html?' + new URLSearchParams(context));
    return;
  }
  document.querySelectorAll('[data-provider-select]').forEach(select => { select.innerHTML = window.PulseProviders.options(); select.value = context.provider; });
  write('pulse-demo-audience', audience);
  document.body.dataset.audience = audience;
  // data-audience-only may list several audiences, separated by spaces.
  document.querySelectorAll('[data-audience-only]').forEach(el => { el.hidden = !el.dataset.audienceOnly.split(' ').includes(audience); });
  const bar = document.createElement('div');
  bar.className = 'workspace-context';
  bar.innerHTML = `<span class="pill light">${audience === 'business' ? 'Business workspace' : 'Technical User workspace'}</span><a href="index.html" class="change-view">Change view</a>`;
  const header = document.querySelector('.topbar');
  header.querySelector(':scope > .pill')?.remove();
  header.append(bar);
  syncLinks();
  if (!validAudience(params.get('audience'))) {
    try {
      const url = new URL(location.href);
      url.searchParams.set('audience', audience);
      history.replaceState(null, '', url);
    } catch { /* Optional for local files. */ }
  }
})();

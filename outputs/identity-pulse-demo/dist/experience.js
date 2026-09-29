/* Shared presentation preferences; no assessment or credential data is stored. */
(() => {
  'use strict';
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* File/private mode: URL navigation still works. */ } };
  const requested = new URLSearchParams(location.search).get('audience');
  let audience = (requested || read('pulse-demo-audience')) === 'tech' ? 'tech' : 'business';
  window.PulseExperience = { get audience() { return audience; }, read, write };
  const bar = document.createElement('section');
  bar.className = 'audience-bar';
  bar.setAttribute('aria-label', 'Audience view');
  bar.innerHTML = `<div><span class="eyebrow">Your workspace</span><p id="audience-caption"></p></div><div class="audience-switch" role="group" aria-label="Choose audience"><button type="button" data-audience="business">Business User View</button><button type="button" data-audience="tech">Tech SPOC View</button></div>`;
  document.querySelector('main').prepend(bar);
  function apply() {
    document.body.dataset.audience = audience;
    bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.audience === audience)));
    document.getElementById('audience-caption').textContent = audience === 'business' ? 'Understand the risks. Decide the next action.' : 'Trace the evidence. Review coverage and validation.';
    document.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!/^(index|data-flow|technical-flow)\.html(?:\?|$)/.test(raw)) return;
      const url = new URL(raw, location.href);
      url.searchParams.set('audience', audience);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search);
      if (url.pathname.endsWith('/technical-flow.html')) link.classList.add('technical-link');
    });
  }
  bar.addEventListener('click', e => {
    const button = e.target.closest('[data-audience]');
    if (!button) return;
    audience = button.dataset.audience;
    write('pulse-demo-audience', audience);
    // Keep a bookmarked query from overriding a subsequent selection on refresh.
    try { const url = new URL(location.href); url.searchParams.set('audience', audience); history.replaceState(null, '', url); } catch { /* Optional for local files. */ }
    apply();
    window.dispatchEvent(new Event('pulse:audience'));
  });
  apply();
})();

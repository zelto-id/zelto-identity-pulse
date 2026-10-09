/* The welcome page always offers both choices, including on a return visit. */
(() => {
  const params = new URLSearchParams(location.search);
  const provider = window.PulseProviders.resolve(params.get('provider'));
  const sample = ['risk', 'healthy', 'partial'].includes(params.get('sample')) ? params.get('sample') : 'risk';
  document.querySelectorAll('[data-enter]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.href);
    url.searchParams.set('provider', provider);
    url.searchParams.set('sample', sample);
    link.setAttribute('href', 'workspace.html' + url.search);
  });

  // These are preparation topics, not assessed controls or a live compliance score.
  const radar = {
    mfa: ['Make strong authentication visible.', 'Review MFA settings and policy gaps. Separate what is configured from what still needs to be verified.'],
    jml: ['Follow access through its lifecycle.', 'Explore application access and privileged identities. Identify where joiner, mover and leaver processes still need organizational evidence.'],
    logs: ['Keep the trail behind the finding.', 'Trace findings to observed settings and collection coverage. Use the gaps to guide a review of logging and detection practices.'],
    s46: ['Prepare the people and the process.', 'Review incident contacts, reporting ownership and supporting records for S46 Cyber Hub.'],
    evidence: ['Give each review a starting point.', 'Preview a sample NIS2 evidence pack with observed controls, recommended actions and missing records.']
  };
  document.querySelectorAll('[data-radar]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-radar]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const [title, copy] = radar[button.dataset.radar];
      document.getElementById('radar-title').textContent = title;
      document.getElementById('radar-copy').textContent = copy;
    });
  });

  const motionControl = document.getElementById('radar-motion');
  const radarCard = document.querySelector('.entry-radar-card');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const updateMotion = () => {
    radarCard.dataset.motion = paused || reducedMotion.matches ? 'paused' : 'running';
    motionControl.disabled = reducedMotion.matches;
    motionControl.textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume radar' : 'Pause radar';
  };
  motionControl.hidden = false;
  motionControl.addEventListener('click', () => {
    paused = !paused;
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();
})();

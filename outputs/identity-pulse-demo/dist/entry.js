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

  const copy = {
    mfa: ['Make strong authentication visible.', 'Review MFA settings and policy gaps. Separate what is configured from what still needs to be verified.'],
    jml: ['Follow access through its lifecycle.', 'Explore application access and privileged identities. Identify where joiner, mover and leaver processes still need organizational evidence.'],
    logs: ['Keep the trail behind the finding.', 'Trace findings to observed settings and collection coverage. Use the gaps to guide a review of logging and detection practices.'],
    s46: ['Prepare the people and the process.', 'Review incident contacts, reporting ownership and supporting records for S46 Cyber Hub.'],
    evidence: ['Give each review a starting point.', 'Preview a sample NIS2 evidence pack with observed controls, recommended actions and missing records.']
  };

  const radarCard = document.querySelector('.entry-radar-card');
  const radarEl = document.querySelector('.entry-radar');
  const beam = document.querySelector('.entry-radar-beam');
  const motionControl = document.getElementById('radar-motion');
  if (!radarCard || !radarEl || !beam || !motionControl) return;

  const TRAVEL_MS = 10000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...document.querySelectorAll('[data-radar]')];

  let paused = false;
  let index = 0;
  let angle = 0;
  let travelFrom = 0;
  let travelTo = 0;
  let travelElapsed = 0;
  let last = performance.now();

  function nodeAngle(el) {
    const area = radarEl.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const x = box.left + box.width / 2 - (area.left + area.width / 2);
    const y = box.top + box.height / 2 - (area.top + area.height / 2);
    let deg = Math.atan2(x, -y) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    return deg;
  }

  function clockwise(from, to) {
    return (to - from + 360) % 360;
  }

  function setSweep(deg) {
    angle = (deg + 360) % 360;
    beam.style.transform = `rotate(${angle}deg)`;
  }

  function markTravel() {
    const next = nodes[(index + 1) % nodes.length];
    nodes.forEach(item => {
      item.setAttribute('aria-pressed', String(item === nodes[index]));
      item.classList.toggle('is-arriving', item === next);
    });
  }

  function select(i) {
    index = (i + nodes.length) % nodes.length;
    const button = nodes[index];
    markTravel();
    const [title, body] = copy[button.dataset.radar];
    document.getElementById('radar-title').textContent = title;
    document.getElementById('radar-copy').textContent = body;
    return nodeAngle(button);
  }

  function beginTravel(fromIndex) {
    select(fromIndex);
    travelFrom = nodeAngle(nodes[index]);
    travelTo = nodeAngle(nodes[(index + 1) % nodes.length]);
    travelElapsed = 0;
    setSweep(travelFrom);
  }

  function setPaused(next) {
    paused = next || reducedMotion.matches;
    radarCard.dataset.motion = paused ? 'paused' : 'running';
    motionControl.disabled = reducedMotion.matches;
    motionControl.setAttribute('aria-pressed', String(paused));
    motionControl.setAttribute('aria-label', reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume radar' : 'Pause radar');
  }

  function tick(now) {
    const dt = Math.min(48, now - last);
    last = now;
    if (!paused && !reducedMotion.matches) {
      travelElapsed += dt;
      const t = Math.min(1, travelElapsed / TRAVEL_MS);
      setSweep(travelFrom + clockwise(travelFrom, travelTo) * t);
      if (t >= 1) beginTravel((index + 1) % nodes.length);
    }
    requestAnimationFrame(tick);
  }

  nodes.forEach((button, i) => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      beginTravel(i);
      setPaused(true);
    });
  });

  motionControl.hidden = false;
  motionControl.addEventListener('click', event => {
    event.stopPropagation();
    setPaused(!paused);
  });

  document.addEventListener('click', event => {
    if (!paused || reducedMotion.matches) return;
    if (event.target.closest('#radar-motion, .entry-radar-node, .view-panel, [data-open-view]')) return;
    if (event.target.closest('.entry-radar-card')) return;
    setPaused(false);
  });

  reducedMotion.addEventListener('change', () => setPaused(paused));
  window.addEventListener('resize', () => {
    travelFrom = nodeAngle(nodes[index]);
    travelTo = nodeAngle(nodes[(index + 1) % nodes.length]);
    const t = Math.min(1, travelElapsed / TRAVEL_MS);
    setSweep(travelFrom + clockwise(travelFrom, travelTo) * t);
  });

  beginTravel(0);
  setPaused(false);
  requestAnimationFrame(tick);
})();

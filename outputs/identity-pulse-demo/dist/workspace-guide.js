(() => {
  'use strict';
  const el = id => document.getElementById(id);
  if (!el('guide-dialog') || !window.PulseExperience) return;
  if (document.documentElement.style.visibility === 'hidden') return;
  const tech = window.PulseExperience.audience === 'tech';
  const key = `pulse-demo-workspace-guide-v2-${tech ? 'tech' : 'business'}`;
  const force = new URLSearchParams(location.search).get('guide') === '1';
  const tours = {
    business: {
      eyebrow: 'Business workspace · quick guide',
      steps: [
        { visual: 'Find', title: 'Find the gaps', text: 'You are in the example assessment. Start with Findings for what needs a decision. NIS2 Material shows which evidence items are already available.', tip: 'Open a finding when you want the full story and recommended next step.' },
        { visual: 'Plan', title: 'Plan the work', text: 'Action Plans is where ownership, dates and status live for this example.', tip: 'Nothing here is written back to a provider.' },
        { visual: 'Evidence', title: 'Prepare the evidence', text: 'When you are ready, generate the sample pack from NIS2 Material. It is one record for review.', tip: 'Reopen this guide with “How this workspace works” whenever you need it.' }
      ]
    },
    tech: {
      eyebrow: 'Technical workspace · quick guide',
      steps: [
        { visual: 'Trace', title: 'Trace a finding', text: 'You are in the example assessment. Open a row to see the rule, collector, API scope and observed JSON.', tip: 'Change view returns to the landing if you want the business path instead.' },
        { visual: 'Coverage', title: 'Review coverage', text: 'Coverage shows what was collected and what was missing. Applications sit with token lifetimes and login journeys.', tip: 'Open a finding when you want the observed JSON and recommended validation steps.' },
        { visual: 'Architecture', title: 'How collection works', text: 'Animated flow and Technical architecture show the read-only path from provider to local report.', tip: 'The architecture page has its own three-step guide the first time you open it.' }
      ]
    }
  };
  const tour = tours[tech ? 'tech' : 'business'];
  let step = 0;

  function draw() {
    const current = tour.steps[step];
    el('guide-count').textContent = `Step ${step + 1} of ${tour.steps.length}`;
    el('guide-title').textContent = current.title;
    el('guide-text').textContent = current.text;
    el('guide-tip').textContent = current.tip;
    el('guide-back').disabled = step === 0;
    el('guide-next').textContent = step === tour.steps.length - 1 ? 'Start exploring' : 'Next';
    tour.steps.forEach((item, index) => {
      const node = el(`guide-visual-${index + 1}`);
      if (!node) return;
      node.textContent = item.visual;
      node.classList.toggle('is-current', index === step);
    });
  }

  function open() {
    step = 0;
    draw();
    const dialog = el('guide-dialog');
    if (!dialog || typeof dialog.showModal !== 'function' || dialog.open) return;
    dialog.showModal();
  }

  const eyebrow = el('guide-eyebrow');
  if (eyebrow) eyebrow.textContent = tour.eyebrow;
  el('open-guide').onclick = open;
  el('close-guide').onclick = () => el('guide-dialog').close();
  el('guide-back').onclick = () => { step = Math.max(0, step - 1); draw(); };
  el('guide-next').onclick = () => {
    if (step === tour.steps.length - 1) el('guide-dialog').close();
    else { step++; draw(); }
  };
  el('guide-dialog').addEventListener('close', () => {
    if (document.documentElement.style.visibility !== 'hidden') {
      window.PulseExperience.write(key, 'seen');
    }
    el('open-guide')?.focus();
  });

  const hidden = document.documentElement.style.visibility === 'hidden';
  const seen = !force && window.PulseExperience.read(key) === 'seen';
  if (!hidden && !seen) {
    requestAnimationFrame(() => {
      try { open(); } catch { /* How this workspace works remains the fallback. */ }
    });
  }
})();

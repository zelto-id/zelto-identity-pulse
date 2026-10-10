(() => {
  'use strict';
  const el = id => document.getElementById(id);
  if (!el('guide-dialog') || !window.PulseExperience) return;
  if (document.documentElement.style.visibility === 'hidden') return;
  const tech = window.PulseExperience.audience === 'tech';
  const key = `pulse-demo-workspace-guide-v1-${tech ? 'tech' : 'business'}`;
  const force = new URLSearchParams(location.search).get('guide') === '1';
  const tours = {
    business: {
      eyebrow: 'Business workspace · quick guide',
      visual: ['Find', 'Plan', 'Evidence'],
      steps: [
        ['You are in the example assessment', 'This is the business starting point for the same sample as Technical view. Findings, action plans and NIS2 material are already here.', 'Change view returns to the landing if you want the technical path instead.'],
        ['Find the gaps', 'Start with Findings for what needs a decision. NIS2 Material shows which evidence items are already available.', 'Open a finding when you want the full story and recommended next step.'],
        ['Plan the work', 'Action Plans is where ownership, dates and status live for this example.', 'Nothing here is written back to a provider.'],
        ['Prepare the evidence', 'When you are ready, generate the sample pack from NIS2 Material. It is one record for review.', 'Reopen this guide with “How this workspace works” whenever you need it.']
      ]
    },
    tech: {
      eyebrow: 'Technical workspace · quick guide',
      visual: ['Trace', 'Coverage', 'Architecture'],
      steps: [
        ['You are in the example assessment', 'This is the technical starting point for the same sample. Every finding still has the rule, collector and observed setting behind it.', 'Change view returns to the landing if you want the business path instead.'],
        ['Trace a finding', 'Open a row to see the rule, collector, API scope and observed JSON.', 'Coverage shows what was collected and what was missing.'],
        ['Applications and fixes', 'Token lifetimes, login journeys and recommended validation steps sit with the finding.', 'Remediation examples stay on this page.'],
        ['How collection works', 'Animated flow and Technical architecture show the read-only path from provider to local report.', 'The architecture page has its own four-step guide the first time you open it.']
      ]
    }
  };
  const tour = tours[tech ? 'tech' : 'business'];
  let step = 0;

  function draw() {
    const [title, text, tip] = tour.steps[step];
    el('guide-count').textContent = `Step ${step + 1} of ${tour.steps.length}`;
    el('guide-title').textContent = title;
    el('guide-text').textContent = text;
    el('guide-tip').textContent = tip;
    el('guide-back').disabled = step === 0;
    el('guide-next').textContent = step === tour.steps.length - 1 ? 'Start exploring' : 'Next';
    [el('guide-visual-1'), el('guide-visual-2'), el('guide-visual-3')].forEach((node, index) => {
      if (!node) return;
      node.textContent = tour.visual[index];
      node.classList.toggle('is-current', index === Math.min(step, tour.visual.length - 1));
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

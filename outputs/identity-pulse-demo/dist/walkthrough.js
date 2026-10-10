(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const key = 'pulse-demo-architecture-guide-v2';
  const force = new URLSearchParams(location.search).get('guide') === '1';
  const steps = [
    ['Start with a question', 'Choose a provider, then select API collection, Failure handling or Local analysis & reports. Auth0 and Okta illustrate existing CLI behavior; Entra ID, Ping Identity and Keycloak show proposed designs.', 'Business users: start with Failure handling to understand what missing permissions mean for the assessment.'],
    ['Select an exchange', 'Click a message in the sequence, or use the next and previous controls. The inspector shows where information moves and what the local CLI does with it.', 'Technical users: inspect the protocol, authentication and state effect before reviewing the payload.'],
    ['Compare request and response', 'Use Request / input and Response / output to see both sides of the selected exchange. Authentication uses placeholders; nothing is sent to a provider.', 'Read Handling & limitations for permission gaps, retry behavior and other boundaries.'],
    ['Know what to take away', 'Business users can focus on where evidence comes from, what remains unknown and which decisions need technical review. Technical users can trace scopes, payloads, failure states and implementation references.', 'Reopen this guide with “How to use this page” whenever you need it. The assessment workspace keeps the findings and action plans together.'],
  ];
  let step = 0;
  function draw() {
    const [title, text, tip] = steps[step];
    el('guide-count').textContent = `Step ${step + 1} of ${steps.length}`;
    el('guide-title').textContent = title;
    el('guide-text').textContent = text;
    el('guide-tip').textContent = tip;
    el('guide-back').disabled = step === 0;
    el('guide-next').textContent = step === steps.length - 1 ? 'Explore architecture' : 'Next';
  }
  function open() {
    const play = el('sequence-play');
    // Pause an existing sequence so it does not advance underneath the guide.
    if (play && play.textContent.includes('Pause')) play.click();
    step = 0; draw();
    const dialog = el('guide-dialog');
    if (!dialog || typeof dialog.showModal !== 'function' || dialog.open) return;
    dialog.showModal();
  }
  el('open-guide').onclick = open;
  el('close-guide').onclick = () => el('guide-dialog').close();
  el('guide-back').onclick = () => { step = Math.max(0, step - 1); draw(); };
  el('guide-next').onclick = () => {
    if (step === steps.length - 1) el('guide-dialog').close();
    else { step++; draw(); }
  };
  el('guide-dialog').addEventListener('close', () => {
    // A hidden document means the audience gate is redirecting; do not consume first-visit.
    if (document.documentElement.style.visibility !== 'hidden') {
      window.PulseExperience.write(key, 'seen');
    }
    el('open-guide')?.focus();
  });
  const hidden = document.documentElement.style.visibility === 'hidden';
  const seen = !force && window.PulseExperience.read(key) === 'seen';
  if (!hidden && !seen) {
    requestAnimationFrame(() => {
      try { open(); } catch { /* How to use this page remains the fallback. */ }
    });
  }
})();

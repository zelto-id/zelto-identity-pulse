(() => {
  const views = {
    business: {
      label: 'For business & security leaders',
      title: 'Business User',
      body: 'Prioritize risks and actions. Prepare your NIS2 evidence.',
      items: ['NIS2 material & evidence packs', 'Business impact & priorities', 'Action plans & ownership gaps'],
      cta: 'Open business workspace',
      audience: 'business'
    },
    tech: {
      label: 'For identity & security engineers',
      title: 'Technical User',
      body: 'The shared workspace, with the technical evidence and fixes behind every finding.',
      items: ['Rules, data sources, coverage & observed settings', 'App token lifetimes, login journeys & fixes as code', 'Validation steps, NIS2 traceability & architecture'],
      cta: 'Open technical workspace',
      audience: 'tech'
    }
  };

  const layer = document.querySelector('.view-layer');
  const triggers = document.querySelectorAll('[data-open-view]');
  if (!layer || !triggers.length) return;

  const panel = layer.querySelector('.view-panel');
  const labelEl = layer.querySelector('.view-label');
  const titleEl = layer.querySelector('#view-title');
  const bodyEl = layer.querySelector('.view-body');
  const listEl = layer.querySelector('.view-points');
  const ctaEl = layer.querySelector('[data-view-cta]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 700px)');
  let lastTrigger = null;
  let openTween = null;
  let closing = false;

  function gsap() {
    return window.gsap;
  }

  function contextHref(audience) {
    const url = new URL('workspace.html', location.href);
    const page = new URLSearchParams(location.search);
    url.searchParams.set('audience', audience);
    url.searchParams.set('provider', window.PulseProviders.resolve(page.get('provider')));
    url.searchParams.set('sample', ['risk', 'healthy', 'partial'].includes(page.get('sample')) ? page.get('sample') : 'risk');
    return 'workspace.html' + url.search;
  }

  function fill(key) {
    const view = views[key];
    labelEl.textContent = view.label;
    titleEl.textContent = view.title;
    bodyEl.textContent = view.body;
    listEl.innerHTML = view.items.map(item => `<li>${item}</li>`).join('');
    ctaEl.textContent = view.cta;
    ctaEl.setAttribute('href', contextHref(view.audience));
    ctaEl.setAttribute('data-enter', view.audience);
    layer.querySelectorAll('[data-switch-view]').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.dataset.switchView === key));
    });
    panel.dataset.audience = key;
  }

  function clearPlacement() {
    panel.style.top = '';
    panel.style.left = '';
    panel.style.right = '';
    panel.style.bottom = '';
    panel.style.width = '';
    panel.style.maxHeight = '';
    panel.style.overflowY = '';
    panel.style.overflow = '';
    panel.style.position = '';
    layer.dataset.placement = '';
    document.body.style.overflow = '';
  }

  function placePanel() {
    if (!layer.classList.contains('is-open')) return;

    const margin = compact.matches ? 12 : 24;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const slot = lastTrigger?.closest('.entry-choice-slot') || document.querySelector('.entry-choice-slot');
    const slotRect = slot.getBoundingClientRect();
    const brand = document.querySelector('.entry-brand')?.getBoundingClientRect();
    const minTop = Math.max(margin, (brand?.bottom || 0) + 8);

    panel.style.position = 'fixed';
    panel.style.right = 'auto';

    if (compact.matches) {
      const width = vw - margin * 2;
      panel.style.left = `${margin}px`;
      panel.style.width = `${width}px`;
      panel.style.top = 'auto';
      panel.style.bottom = `${margin}px`;
      panel.style.maxHeight = `${Math.min(vh * 0.86, vh - margin * 2)}px`;
      panel.style.overflow = 'hidden';
      layer.dataset.placement = 'sheet';
      document.body.style.overflow = 'hidden';
      return;
    }

    const width = Math.min(Math.max(slotRect.width, 360), vw - margin * 2);
    let left = slotRect.left;
    if (left + width > vw - margin) left = vw - margin - width;
    if (left < margin) left = margin;

    panel.style.bottom = 'auto';
    panel.style.left = `${left}px`;
    panel.style.width = `${width}px`;
    panel.style.top = `${minTop}px`;
    panel.style.maxHeight = 'none';
    panel.style.overflow = 'visible';
    const contentH = panel.scrollHeight;
    const below = vh - margin - slotRect.top;
    const room = vh - minTop - margin;

    if (contentH <= below && slotRect.top >= minTop - 24) {
      panel.style.top = `${Math.round(slotRect.top)}px`;
      panel.style.maxHeight = 'none';
      panel.style.overflow = 'visible';
      layer.dataset.placement = 'anchor';
    } else if (contentH <= room) {
      panel.style.top = `${Math.round(Math.max(minTop, vh - margin - contentH))}px`;
      panel.style.maxHeight = 'none';
      panel.style.overflow = 'visible';
      layer.dataset.placement = 'flip';
    } else {
      panel.style.top = `${minTop}px`;
      panel.style.maxHeight = `${Math.floor(room)}px`;
      panel.style.overflow = 'hidden';
      layer.dataset.placement = 'scroll';
    }
    document.body.style.overflow = '';
  }

  function killTween() {
    if (openTween) {
      openTween.kill();
      openTween = null;
    }
    const lib = gsap();
    if (lib) lib.killTweensOf(panel);
  }

  function playOpen() {
    const lib = gsap();
    if (!lib || reducedMotion.matches) return;

    killTween();
    const fromY = compact.matches ? 28 : 12;
    const rail = panel.querySelector('.view-rail');
    openTween = lib.timeline();
    openTween.fromTo(panel, { opacity: 0, y: fromY }, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' });
    if (rail) {
      openTween.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power2.out', transformOrigin: '50% 0%' }, '-=0.22');
    }
    openTween.from(panel.querySelectorAll('.view-label, .view-switch, h2, .view-body'), {
      opacity: 0,
      y: 8,
      stagger: 0.04,
      duration: 0.28,
      ease: 'power2.out'
    }, '-=0.28');
    openTween.from(panel.querySelectorAll('.view-points li'), {
      opacity: 0,
      x: compact.matches ? 0 : -10,
      stagger: 0.05,
      duration: 0.28,
      ease: 'power2.out'
    }, '-=0.18');
    openTween.from(ctaEl, { opacity: 0, y: 6, duration: 0.22, ease: 'power2.out' }, '-=0.16');
  }

  function playClose(done) {
    const lib = gsap();
    if (!lib || reducedMotion.matches) {
      done();
      return;
    }
    killTween();
    openTween = lib.to(panel, {
      opacity: 0,
      y: compact.matches ? 24 : 8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: done
    });
  }

  function open(key, trigger) {
    closing = false;
    fill(key);
    lastTrigger = trigger;
    const slot = trigger.closest('.entry-choice-slot');
    slot?.classList.add('is-guiding');
    layer.hidden = false;
    layer.classList.add('is-open');
    triggers.forEach(btn => btn.setAttribute('aria-expanded', String(btn === trigger)));
    const lib = gsap();
    if (lib && !reducedMotion.matches) lib.set(panel, { opacity: 0 });
    placePanel();
    requestAnimationFrame(() => {
      placePanel();
      playOpen();
      (layer.querySelector('.view-close') || ctaEl).focus();
    });
  }

  function close() {
    if (!layer.classList.contains('is-open') || closing) return;
    closing = true;
    const slot = lastTrigger?.closest('.entry-choice-slot');
    triggers.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    playClose(() => {
      layer.classList.remove('is-open');
      slot?.classList.remove('is-guiding');
      layer.hidden = true;
      const lib = gsap();
      if (lib) lib.set(panel, { clearProps: 'all' });
      clearPlacement();
      closing = false;
    });
    lastTrigger?.focus();
  }

  triggers.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const key = btn.dataset.openView;
      if (btn.getAttribute('aria-expanded') === 'true') close();
      else open(key, btn);
    });
  });

  layer.addEventListener('click', event => {
    if (event.target.closest('[data-close-view]')) close();
  });

  layer.querySelectorAll('[data-switch-view]').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const key = btn.dataset.switchView;
      fill(key);
      triggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', String(trigger.dataset.openView === key));
        if (trigger.dataset.openView === key) lastTrigger = trigger;
      });
      placePanel();
      const lib = gsap();
      if (lib && !reducedMotion.matches) {
        lib.fromTo([titleEl, bodyEl, listEl, ctaEl], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out' });
      }
    });
  });

  document.addEventListener('click', event => {
    if (!layer.classList.contains('is-open')) return;
    if (event.target.closest('.view-panel, [data-open-view]')) return;
    close();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab' || !layer.classList.contains('is-open')) return;
    const focusable = [...layer.querySelectorAll('a,button')].filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', placePanel);
  window.addEventListener('scroll', placePanel, { passive: true });
})();

document.addEventListener('DOMContentLoaded', () => {
  initShell();
  initCounters();
  initVideoControl();
  initForms();
  initFeatureSystem();
  initPricingEngine();
});

function initShell() {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const isOpen = body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  siteNav?.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      body.classList.remove('menu-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open menu');
    }
  });
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));

      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = String(target);
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
}

function initVideoControl() {
  const videoToggle = document.querySelector('[data-video-toggle]');
  const demoVideo = document.querySelector('.demo-video');

  videoToggle?.addEventListener('click', () => {
    if (!demoVideo) return;

    if (demoVideo.paused) {
      demoVideo.play();
      videoToggle.classList.remove('is-paused');
      videoToggle.setAttribute('aria-label', 'Pause demo video');
    } else {
      demoVideo.pause();
      videoToggle.classList.add('is-paused');
      videoToggle.setAttribute('aria-label', 'Play demo video');
    }
  });
}

function initForms() {
  const contactForm = document.querySelector('#contactForm');
  const formNote = document.querySelector('[data-form-note]');
  const newsletterForm = document.querySelector('#newsletterForm');

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"] span');
    const original = submitButton?.textContent || 'Send brief';

    if (submitButton) submitButton.textContent = 'Brief sent';
    if (formNote) formNote.textContent = 'Got it. We will turn this into a practical first-build conversation.';

    window.setTimeout(() => {
      contactForm.reset();
      if (submitButton) submitButton.textContent = original;
      if (formNote) formNote.textContent = '';
    }, 3200);
  });

  newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    newsletterForm.reset();
  });
}

function initFeatureSystem() {
  const featureRoot = document.querySelector('[data-features]');
  if (!featureRoot) return;

  const nodes = Array.from(featureRoot.querySelectorAll('[data-feature-index]'));
  let activeIndex = Number(nodes.find((node) => node.classList.contains('is-active'))?.dataset.featureIndex || 0);

  const setActiveFeature = (index) => {
    activeIndex = index;
    nodes.forEach((node) => {
      const isActive = Number(node.dataset.featureIndex) === activeIndex;
      node.classList.toggle('is-active', isActive);
      node.querySelector('.feature-trigger')?.setAttribute('aria-expanded', String(isActive));
    });
  };

  nodes.forEach((node) => {
    const index = Number(node.dataset.featureIndex);
    const trigger = node.querySelector('.feature-trigger');

    node.addEventListener('mouseenter', () => setActiveFeature(index));
    node.addEventListener('focusin', () => setActiveFeature(index));
    trigger?.addEventListener('click', () => setActiveFeature(index));
  });

  const preserveFeatureContext = () => setActiveFeature(activeIndex);
  window.addEventListener('resize', debounce(preserveFeatureContext, 120));
  setActiveFeature(activeIndex);
}

function initPricingEngine() {
  const pricingMatrix = {
    currencies: {
      INR: { symbol: '₹', locale: 'en-IN', tariff: 1, starter: 6900, pro: 18900, enterprise: 49900 },
      USD: { symbol: '$', locale: 'en-US', tariff: 1.08, starter: 89, pro: 239, enterprise: 629 },
      EUR: { symbol: '€', locale: 'de-DE', tariff: 1.03, starter: 82, pro: 219, enterprise: 579 }
    },
    billing: {
      monthly: { multiplier: 1, period: '/mo', note: 'Billed monthly' },
      annual: { multiplier: 12 * 0.8, period: '/yr', note: 'Billed annually with 20% discount' }
    },
    plans: ['starter', 'pro', 'enterprise']
  };

  const state = { billing: 'monthly', currency: 'INR' };
  const controls = {
    billingButtons: Array.from(document.querySelectorAll('[data-billing]')),
    currencySelect: document.querySelector('[data-currency-select]')
  };
  const planNodes = pricingMatrix.plans.map((plan) => {
    const card = document.querySelector(`[data-plan="${plan}"]`);
    return {
      plan,
      price: card?.querySelector('[data-price-value]'),
      period: card?.querySelector('[data-price-period]'),
      note: card?.querySelector('[data-price-note]')
    };
  });

  const formatPrice = (amount, currencyConfig, currencyCode) => {
    const adjusted = Math.round(amount * currencyConfig.tariff);
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(adjusted);
  };

  const updatePricingTextNodes = () => {
    const currencyConfig = pricingMatrix.currencies[state.currency];
    const billingConfig = pricingMatrix.billing[state.billing];

    planNodes.forEach(({ plan, price, period, note }) => {
      const baseRate = currencyConfig[plan];
      const computedPrice = baseRate * billingConfig.multiplier;
      if (price) price.textContent = formatPrice(computedPrice, currencyConfig, state.currency);
      if (period) period.textContent = billingConfig.period;
      if (note) note.textContent = billingConfig.note;
    });
  };

  controls.billingButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.billing = button.dataset.billing;
      controls.billingButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      updatePricingTextNodes();
    });
  });

  controls.currencySelect?.addEventListener('change', (event) => {
    state.currency = event.target.value;
    updatePricingTextNodes();
  });

  updatePricingTextNodes();
}

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}

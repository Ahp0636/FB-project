document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const counters = document.querySelectorAll('.counter');
  const contactForm = document.querySelector('#contactForm');
  const formNote = document.querySelector('[data-form-note]');
  const videoToggle = document.querySelector('[data-video-toggle]');
  const demoVideo = document.querySelector('.demo-video');

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

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = String(target);
      }
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
    }, 3600);
  });
});

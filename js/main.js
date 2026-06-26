(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal via Intersection Observer
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Animated counter
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const text = el.dataset.text;
    const suffix = el.querySelector('.suffix');
    const suffixText = suffix ? suffix.textContent : '';
    if (text) { el.textContent = text; return; }
    if (prefersReducedMotion) {
      el.innerHTML = target.toLocaleString() + (suffixText ? '<span class="suffix">' + suffixText + '</span>' : '');
      return;
    }
    const duration = 2000;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.innerHTML = current.toLocaleString() + (suffixText ? '<span class="suffix">' + suffixText + '</span>' : '');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('[data-count], [data-text]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => {
    const suffix = el.querySelector('.suffix');
    const suffixText = suffix ? suffix.textContent : '';
    if (!el.dataset.text) el.innerHTML = '0' + (suffixText ? '<span class="suffix">' + suffixText + '</span>' : '');
    counterObserver.observe(el);
  });

  // Page loader
  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => {
    setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 1400);
  });

  // Navbar scroll + WhatsApp hide on quote section
  const navbar = document.querySelector('.navbar');
  const whatsappBtn = document.querySelector('.whatsapp');
  const quoteSection = document.querySelector('.quote');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
    if (whatsappBtn && quoteSection) {
      const qRect = quoteSection.getBoundingClientRect();
      const inQuote = qRect.top < window.innerHeight && qRect.bottom > 0;
      whatsappBtn.style.opacity = inQuote ? '0' : '1';
      whatsappBtn.style.pointerEvents = inQuote ? 'none' : 'auto';
    }
  }, { passive: true });

  // Mobile menu
  const toggleBtn = document.querySelector('.navbar__toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Unit toggle (KG / CBM)
  document.querySelectorAll('.form__toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.form__toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const input = document.getElementById('weight');
      if (input) input.placeholder = btn.dataset.unit === 'kg' ? 'e.g. 500' : 'e.g. 2.5';
    });
  });

  // Form validation + submission
  const form = document.getElementById('quoteForm');
  if (form) {
    const requiredFields = [
      { id: 'fullName', msg: 'Please enter your name' },
      { id: 'email', msg: 'Please enter a valid email' },
      { id: 'phone', msg: 'Please enter your phone number' },
      { id: 'departure', msg: 'Please enter departure city' },
      { id: 'destination', msg: 'Please enter destination city' },
      { id: 'cargoType', msg: 'Please select a cargo type' },
    ];

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('.has-error').forEach(g => g.classList.remove('has-error'));
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      requiredFields.forEach(({ id, msg }) => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
          valid = false;
          el.classList.add('error');
          const group = el.closest('.form__group');
          if (group) {
            group.classList.add('has-error');
            let errEl = group.querySelector('.form__error');
            if (!errEl) { errEl = document.createElement('span'); errEl.className = 'form__error'; group.appendChild(errEl); }
            errEl.textContent = msg;
          }
        }
      });

      const emailEl = document.getElementById('email');
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        valid = false;
        emailEl.classList.add('error');
        const g = emailEl.closest('.form__group');
        if (g) { g.classList.add('has-error'); const e = g.querySelector('.form__error'); if (e) e.textContent = 'Invalid email format'; }
      }

      if (valid) {
        const submitBtn = form.querySelector('.form__submit');
        submitBtn.classList.add('sending');
        submitBtn.textContent = 'Sending...';
        setTimeout(() => {
          form.style.display = 'none';
          document.getElementById('formSuccess').classList.add('show');
        }, 1500);
      }
    });

    form.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const g = input.closest('.form__group');
        if (g) g.classList.remove('has-error');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq__item.active').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Back to top
  const backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Subtle parallax on hero background
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = 'scale(' + (1.1 - y * 0.0001) + ') translateY(' + (y * 0.15) + 'px)';
      }
    }, { passive: true });
  }

  // Shipment tracker demo
  const trackerForm = document.getElementById('trackerForm');
  const trackerResult = document.getElementById('trackerResult');
  if (trackerForm) {
    trackerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('trackingInput');
      if (!input || !input.value.trim()) return;

      trackerResult.classList.add('show');
      document.getElementById('trackerIdDisplay').textContent = input.value.trim().toUpperCase();

      const steps = trackerResult.querySelectorAll('.tracker__step');
      const lineFill = trackerResult.querySelector('.tracker__line-fill');

      steps.forEach((s, i) => {
        s.classList.remove('completed', 'active');
        setTimeout(() => {
          if (i < 3) s.classList.add('completed');
          else if (i === 3) s.classList.add('active');
        }, 300 + i * 400);
      });

      setTimeout(() => {
        if (lineFill) lineFill.style.width = '70%';
      }, 500);
    });
  }

  // Language toggle
  document.querySelectorAll('.footer__lang').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.trim() === 'AR' ? 'ar' : 'en';
      if (typeof setLanguage === 'function') setLanguage(lang);
    });
  });

  const savedLang = localStorage.getItem('masar-lang');
  if (savedLang && typeof setLanguage === 'function') {
    setLanguage(savedLang);
  }
})();

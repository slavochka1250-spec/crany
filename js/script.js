// ===================================================================
// КРАНСЕРВИС — лёгкая, ненавязчивая интерактивность
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Тень хедера при прокрутке ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Мобильное меню ----------
  const burger = document.querySelector('.burger');
  const mainNav = document.querySelector('.main-nav');
  if (burger && mainNav) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      mainNav.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mainNav.classList.remove('open');
      });
    });
  }

  // ---------- Полоска контактов (звонок/WhatsApp/Telegram/почта) ----------
  const contactWidget = document.querySelector('.contact-widget');
  const contactTrigger = document.querySelector('.contact-trigger');
  if (contactWidget && contactTrigger) {
    contactTrigger.addEventListener('click', (e) => {
      // Первый тап на тач-устройстве раскрывает полоску, не переходя по tel:
      // Второй тап (когда уже открыта) звонит как обычно
      if (!contactWidget.classList.contains('open')) {
        e.preventDefault();
        contactWidget.classList.add('open');
      }
    });
    document.addEventListener('click', (e) => {
      if (!contactWidget.contains(e.target)) {
        contactWidget.classList.remove('open');
      }
    });
  }

  // ---------- Плавное появление блоков при скролле ----------
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && revealEls.length && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Счётчики статистики ----------
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (prefersReducedMotion) { el.textContent = target + suffix; return; }
      const duration = 1300;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
    };
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  }

  // ---------- FAQ-аккордеон ----------
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ---------- Фильтр парка техники ----------
  const craneCards = document.querySelectorAll('.crane-card[data-category]');
  const classTags = document.querySelectorAll('.filter-tag[data-filter]');
  const brandTags = document.querySelectorAll('.filter-tag[data-brand]');
  if (craneCards.length && (classTags.length || brandTags.length)) {
    let activeClass = 'all';
    let activeBrand = 'all';

    const applyFilters = () => {
      craneCards.forEach(card => {
        const okClass = activeClass === 'all' || card.dataset.category === activeClass;
        const okBrand = activeBrand === 'all' || card.dataset.brand === activeBrand;
        card.classList.toggle('hidden', !(okClass && okBrand));
      });
    };

    classTags.forEach(tag => {
      tag.addEventListener('click', () => {
        classTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        activeClass = tag.dataset.filter;
        applyFilters();
      });
    });

    brandTags.forEach(tag => {
      tag.addEventListener('click', () => {
        brandTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        activeBrand = tag.dataset.brand;
        applyFilters();
      });
    });
  }

  // ---------- Форма обратной связи (демо, без бэкенда) ----------
  document.querySelectorAll('.js-contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const wrapper = form.closest('.contact-form') || form.parentElement;
      const success = wrapper.querySelector('.form-success');
      form.style.display = 'none';
      if (success) success.classList.add('show');
    });
  });


  // ---------- Поп-ап с описанием и ценой услуги ----------
  const sModal = document.getElementById('serviceModal');
  if (sModal) {
    const sTitle = sModal.querySelector('#smTitle');
    const sDesc  = sModal.querySelector('.service-modal-desc');
    const sPrice = sModal.querySelector('.service-modal-price b');
    let lastFocused = null;

    const openModal = (card) => {
      sTitle.textContent = card.dataset.title || '';
      sDesc.textContent  = card.dataset.desc  || '';
      sPrice.textContent = card.dataset.price || '';
      sModal.hidden = false;
      document.body.style.overflow = 'hidden';
      sModal.querySelector('.service-modal-close').focus();
    };
    const closeModal = () => {
      sModal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('.service-more').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        lastFocused = btn;
        const card = btn.closest('.service-card');
        if (card) openModal(card);
      });
    });

    sModal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sModal.hidden) closeModal();
    });
  }


  // ---------- Уходящие карточки лент плавно уменьшаются ----------
  const rails = [
    { el: document.querySelector('.crane-rail'), axis: 'x' },
    { el: document.querySelector('.crane-grid'), axis: 'x' },
    { el: document.querySelector('.service-rail'), axis: 'y' },
    { el: document.querySelector('.review-rail'), axis: 'x' }
  ].filter(r => r.el);

  rails.forEach(({ el, axis }) => {
    const items = [...el.children];
    if (!items.length) return;

    const update = () => {
      const box = el.getBoundingClientRect();
      const start = axis === 'x' ? box.left : box.top;
      const end   = axis === 'x' ? box.right : box.bottom;

      items.forEach(item => {
        const r = item.getBoundingClientRect();
        const iStart = axis === 'x' ? r.left : r.top;
        const iEnd   = axis === 'x' ? r.right : r.bottom;
        const size   = axis === 'x' ? r.width : r.height;
        if (!size) return;

        // какая доля карточки вышла за пределы ленты
        const hiddenBefore = Math.max(0, start - iStart);
        const hiddenAfter  = Math.max(0, iEnd - end);
        const hidden = Math.min(1, (hiddenBefore + hiddenAfter) / size);

        const scale = 1 - hidden * 0.18;
        const opacity = 1 - hidden * 0.45;
        item.style.transform = 'scale(' + scale.toFixed(3) + ')';
        item.style.opacity = opacity.toFixed(3);
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  });

});

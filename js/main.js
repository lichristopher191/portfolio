/* ==========================================================================
   Christopher Li — Portfolio · Multi-page Skeleton
   Shared by every page. Anything that only exists on one page (filter pills,
   case-study modal) is guarded so this file never errors elsewhere.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. nav: mark the current page's pill active + slide indicator ---------- */
  const pillNav = document.querySelector('.pill-nav');
  const indicator = document.querySelector('.pill-indicator');
  const pillLinks = Array.from(document.querySelectorAll('.pill-link'));
  const currentPage = document.body.dataset.page;

  // Move the black bubble under `link` and make that link's text light.
  // `instant` skips the slide animation (used on page load so the bubble
  // simply appears under the current tab instead of sliding in from the left).
  function moveIndicator(link, instant) {
    if (!indicator || !link) return;
    if (instant) { indicator.classList.add('no-anim'); pillNav.classList.add('no-anim'); }
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + (link.offsetLeft - 5) + 'px)';
    pillLinks.forEach(function (l) { l.classList.toggle('is-indicated', l === link); });
    if (instant) {
      void indicator.offsetWidth; // flush so the jump happens without a transition
      indicator.classList.remove('no-anim');
      pillNav.classList.remove('no-anim');
    }
  }

  function currentLink() {
    return pillLinks.find(function (l) { return l.dataset.section === currentPage; });
  }

  function setActivePill(instant) {
    const active = currentLink();
    pillLinks.forEach(function (l) { l.classList.toggle('is-active', l === active); });
    moveIndicator(active, instant === true);
  }

  if (pillNav) {
    setActivePill(true);
    window.addEventListener('resize', function () { setActivePill(true); });
    // fonts load late and change widths — re-measure once they're in
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setActivePill(true); });

    // hover / keyboard focus: the bubble (and its light text) follows the pointer
    pillLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () { moveIndicator(link); });
      link.addEventListener('focus', function () { moveIndicator(link); });
      // on click the bubble stays exactly where it is; the next page draws it
      // in the same spot, so there is no sliding in from the left
      link.addEventListener('click', function () { moveIndicator(link, true); });
    });
    pillNav.addEventListener('mouseleave', function () { setActivePill(); });
  }

  /* ---------- 2. mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const headerInner = document.querySelector('.header-inner');
  if (navToggle && headerInner) {
    navToggle.addEventListener('click', function () {
      const open = headerInner.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    pillLinks.forEach(function (l) {
      l.addEventListener('click', function () {
        headerInner.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 3. hero down-arrow: smooth-scroll to the next section ---------- */
  const scrollArrow = document.querySelector('.scroll-arrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', function () {
      const target = document.querySelector(scrollArrow.dataset.target || '#projects-preview');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- 4. work page: category filter pills ---------- */
  const filterWrap = document.querySelector('.filter-pills');
  if (filterWrap) {
    const filterIndicator = filterWrap.querySelector('.filter-indicator');
    const filterPills = Array.from(filterWrap.querySelectorAll('.filter-pill'));
    const cards = Array.from(document.querySelectorAll('#workGrid .work-card'));

    function moveFilterIndicator(pill) {
      if (!filterIndicator || !pill) return;
      filterIndicator.style.width = pill.offsetWidth + 'px';
      filterIndicator.style.transform = 'translateX(' + (pill.offsetLeft - 5) + 'px)';
    }

    function applyFilter(pill) {
      const filter = pill.dataset.filter;
      filterPills.forEach(function (p) {
        const on = p === pill;
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-selected', String(on));
      });
      moveFilterIndicator(pill);
      cards.forEach(function (card) {
        const cats = (card.dataset.category || '').split(' ');
        card.classList.toggle('is-hidden', filter !== 'all' && cats.indexOf(filter) === -1);
      });
    }

    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () { applyFilter(pill); });
    });
    const initial = filterPills.find(function (p) { return p.classList.contains('is-active'); }) || filterPills[0];
    moveFilterIndicator(initial);
    window.addEventListener('resize', function () {
      moveFilterIndicator(filterPills.find(function (p) { return p.classList.contains('is-active'); }));
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        moveFilterIndicator(filterPills.find(function (p) { return p.classList.contains('is-active'); }));
      });
    }

    /* ---------- 5. work page: case-study popout modal ---------- */
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      const mTitle = document.getElementById('modalTitle');
      const mMeta = document.getElementById('modalMeta');
      const mDesc = document.getElementById('modalDesc');
      const mClose = document.getElementById('modalClose');
      let lastFocus = null;

      function openModal(card) {
        lastFocus = document.activeElement;
        mTitle.textContent = card.dataset.title || '';
        mMeta.textContent = card.dataset.meta || '';
        mDesc.textContent = card.dataset.desc || '';
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        mClose.focus();
      }
      function closeModal() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
      }

      cards.forEach(function (card) {
        card.addEventListener('click', function () { openModal(card); });
      });
      mClose.addEventListener('click', closeModal);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
      });
    }
  }

  /* ---------- 6. fade-in on scroll: any element tagged [data-reveal] ---------- */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('reveal', 'in-view'); });
    } else {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) {
        el.classList.add('reveal');
        io.observe(el);
      });
    }
  }

  /* ---------- 7. headshot: 3D perspective tilt on hover (mouse / trackpad only) ---------- */
  const heroVisual = document.querySelector('.hero-visual');
  const portrait = document.querySelector('.portrait-frame');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroVisual && portrait && canHover && !reduceMotion) {
    const MAX_TILT = 12; // degrees
    heroVisual.addEventListener('pointermove', function (e) {
      const r = portrait.getBoundingClientRect();
      // -1..1 from the photo's center, clamped so it never over-rotates
      const px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      const py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      portrait.classList.add('is-tilting');
      portrait.style.setProperty('--ry', (px * MAX_TILT).toFixed(2) + 'deg');
      portrait.style.setProperty('--rx', (-py * MAX_TILT).toFixed(2) + 'deg');
      portrait.style.setProperty('--lift', '1.03');
      portrait.style.setProperty('--mx', ((px + 1) * 50).toFixed(1) + '%');
      portrait.style.setProperty('--my', ((py + 1) * 50).toFixed(1) + '%');
    });
    heroVisual.addEventListener('pointerleave', function () {
      portrait.classList.remove('is-tilting');
      portrait.style.setProperty('--rx', '0deg');
      portrait.style.setProperty('--ry', '0deg');
      portrait.style.setProperty('--lift', '1');
    });
  }
})();

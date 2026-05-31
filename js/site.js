/* ============================================================
   FORWELL — site.js
   ============================================================ */
(function () {
  'use strict';

  /* ── NAV: solid on scroll ─────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  function reveal(el, instant) {
    if (el.classList.contains('in')) return;
    if (instant) el.classList.add('instant');
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(runCounter);
    if (el.hasAttribute('data-count')) runCounter(el);
  }
  function inView(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.92 && r.bottom > 0;
  }

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  // Fail-safe 1: reveal anything already in the viewport on load (instant — never depend on a transition that can freeze in a throttled/background frame).
  function revealVisible(instant) {
    revealEls.forEach((el) => { if (!el.classList.contains('in') && inView(el)) reveal(el, instant); });
  }
  // Fail-safe 2: scroll-driven check (animated; only runs when the page is in the foreground).
  window.addEventListener('scroll', () => revealVisible(false), { passive: true });
  window.addEventListener('resize', () => revealVisible(false));
  window.addEventListener('load', () => revealVisible(true));
  revealVisible(true);
  // Fail-safe 3: never leave content permanently hidden, even if rendering is throttled (instant).
  setTimeout(() => revealVisible(true), 400);
  setTimeout(() => revealEls.forEach((el) => reveal(el, true)), 2200);

  /* ── ANIMATED COUNTERS ────────────────────────────────── */
  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.innerHTML = val + (suffix ? '<span class="suffix">' + suffix + '</span>' : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  /* ── INTERACTIVE EGYPT MAP ────────────────────────────── */
  const cities = {
    cairo: {
      en: 'Greater Cairo', ar: 'القاهرة الكبرى',
      role: 'Headquarters · Central Hub',
      desc: 'Forwell HQ and primary distribution center. Full multi-channel coverage across Greater Cairo, Giza, and the surrounding metro region.'
    },
    alex: {
      en: 'Alexandria', ar: 'الإسكندرية',
      role: 'Coastal Distribution Hub',
      desc: 'Coverage of the Mediterranean coast and northern governorates, serving modern and traditional trade across Alexandria and Beheira.'
    },
    delta: {
      en: 'Nile Delta', ar: 'الدلتا',
      role: 'Dense Retail Network',
      desc: 'High-density distribution across the Delta governorates — wholesale, independent retail, and pharmacy channels throughout Lower Egypt.'
    },
    upper: {
      en: 'Upper Egypt', ar: 'صعيد مصر',
      role: 'Expanding Coverage',
      desc: 'Growing reach across Upper Egypt — from Assiut to Aswan — extending traditional trade and pharmacy distribution southward.'
    },
    canal: {
      en: 'Canal & Sinai', ar: 'القناة وسيناء',
      role: 'Eastern Corridor',
      desc: 'Coverage of the Suez Canal cities and Sinai — connecting Port Said, Ismailia, and Suez through the eastern distribution corridor.'
    }
  };

  const mapInfo = document.getElementById('mapInfo');
  const nodes = document.querySelectorAll('.map-node');
  function showCity(key) {
    const c = cities[key];
    if (!c || !mapInfo) return;
    nodes.forEach((n) => n.classList.toggle('active', n.dataset.city === key));
    mapInfo.style.opacity = '0';
    setTimeout(() => {
      mapInfo.innerHTML =
        '<div class="map-info__city">' + c.en + ' <span class="ar">' + c.ar + '</span></div>' +
        '<div class="map-info__role">' + c.role + '</div>' +
        '<div class="map-info__desc">' + c.desc + '</div>';
      mapInfo.style.opacity = '1';
    }, 180);
  }
  nodes.forEach((n) => {
    n.addEventListener('click', () => showCity(n.dataset.city));
    n.addEventListener('mouseenter', () => showCity(n.dataset.city));
  });
  showCity('cairo');

  /* ── PRODUCT CATALOG: render + filter ─────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function textOn(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) > 150 ? '#0C1C36' : '#ffffff';
  }
  const arrowSvg = '<a href="#contact" class="product__arrow" aria-label="Enquire about this product"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';

  function productCard(p) {
    let media, phClass = '';
    if (p.img) {
      media = '<img src="assets/products/' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">';
    } else if (p.swatch) {
      phClass = ' product__img--swatch';
      const code = (p.name.match(/^[0-9.]+/) || [p.name])[0];
      media = '<div class="product__swatch" style="background:' + esc(p.swatch) + '"><span class="code" style="color:' + textOn(p.swatch) + '">' + esc(code) + '</span></div>';
    } else {
      phClass = ' product__img--ph';
      media = '<span class="ph">Photo soon</span>';
    }
    const meta = esc(p.sub || p.cat) + (p.color ? ' · ' + esc(p.color) : (p.size && !p.swatch ? ' · ' + esc(p.size) : ''));
    const price = p.price
      ? '<span class="product__price"><span class="cur">EGP</span> ' + p.price + '</span>'
      : '<span class="product__price tbd">Price on request</span>';
    return '<article class="product" data-brand="' + esc(p.brand) + '" title="' + esc(p.desc || '') + '">'
      + '<div class="product__img' + phClass + '"><span class="product__badge">' + esc(p.brandLabel) + '</span>' + media + '</div>'
      + '<div class="product__body"><span class="product__cat">' + meta + '</span>'
      + '<h3 class="product__name">' + esc(p.name) + '</h3>'
      + '<div class="product__foot">' + price + arrowSvg + '</div></div></article>';
  }

  const grid = document.getElementById('prodGrid');
  if (grid && window.FW_PRODUCTS) {
    grid.innerHTML = window.FW_PRODUCTS.map(productCard).join('');
  }

  const chips = document.querySelectorAll('.chip');
  const products = grid ? grid.querySelectorAll('.product') : [];
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      products.forEach((el) => {
        el.classList.toggle('hide', !(f === 'all' || el.dataset.brand === f));
      });
    });
  });

  /* ── CONTACT FORM ─────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll('input, select, textarea');
      const v = (i) => (fields[i] && fields[i].value || '').trim();
      const name = v(0), company = v(1), email = v(2), phone = v(3), interest = v(4), message = v(5);
      const subject = encodeURIComponent('Website enquiry' + (name ? ' — ' + name : ''));
      const body = encodeURIComponent(
        'Name: ' + name + '\nCompany: ' + company + '\nEmail: ' + email + '\nPhone: ' + phone +
        '\nInterested in: ' + interest + '\n\nMessage:\n' + message);
      window.location.href = 'mailto:info@for-well.com?subject=' + subject + '&body=' + body;
      form.style.display = 'none';
      const ok = document.getElementById('formOk');
      if (ok) ok.classList.add('show');
    });
  }

  /* ── YEAR ─────────────────────────────────────────────── */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

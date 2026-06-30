/* ============================================================
   nav.js — Navigation, scroll effects, fade-in, curseur custom
   Vanilla JS · aucune dépendance
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Burger menu ---------- */
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      const open = navLinks.classList.contains('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Ferme le menu au clic sur un lien
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    // Ferme le menu si clic en dehors
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !burger.contains(e.target)
      ) {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. Navbar blur au scroll ---------- */
  const navbar = document.querySelector('.navbar');
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Lien actif selon la page courante ---------- */
  (function setActiveLink() {
    if (!navLinks) return;
    let path = window.location.pathname.split('/').pop();
    if (!path) path = 'index.html';
    navLinks.querySelectorAll('a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === path) link.classList.add('active');
      else link.classList.remove('active');
    });
  })();

  /* ---------- 4. Fade-in au scroll (Intersection Observer) ---------- */
  const faders = document.querySelectorAll('.fade-in, .fade-in-2, .fade-in-3, .fade-in-4');
  if ('IntersectionObserver' in window && faders.length) {
    const io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    faders.forEach(function (el) { io.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 5. Barres de compétences (animation à l'apparition) ---------- */
  const bars = document.querySelectorAll('.skillbar .fill');
  if ('IntersectionObserver' in window && bars.length) {
    const bio = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.width = (el.dataset.pct || '0') + '%';
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach(function (el) { bio.observe(el); });
  } else {
    bars.forEach(function (el) { el.style.width = (el.dataset.pct || '0') + '%'; });
  }

  /* ---------- 6. Curseur personnalisé (croix de visée, desktop) ---------- */
  (function customCursor() {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('custom-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    // Suivi fluide de l'anneau
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    }
    loop();

    // État "hover" sur les éléments interactifs
    const hoverSel = 'a, button, .btn, .card, .burger, input, .source';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverSel)) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverSel)) ring.classList.remove('hovered');
    });

    // Masque hors fenêtre
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0'; ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1'; ring.style.opacity = '1';
    });
  })();

  /* ---------- 7. Année dynamique dans le footer ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

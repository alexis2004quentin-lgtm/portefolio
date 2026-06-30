/* ============================================================
   particles.js — Réseau de points connectés (style graphe réseau)
   Canvas standalone · vanilla JS · responsive
   Cible : <canvas id="particles"></canvas>
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CONFIG = {
    count: 80,            // ~80 points
    maxDist: 120,         // connexion si distance < 120px
    speed: 0.35,          // vitesse lente
    dotColor: 'rgba(0, 229, 255, 0.7)',
    lineColor: '0, 229, 255', // rgb pour interpolation alpha
    dotRadius: 1.8
  };

  // Réduction si l'utilisateur préfère moins d'animations
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let mouse = { x: null, y: null };
  let rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Densité adaptée à la surface (sans dépasser le count cible)
    const target = Math.min(
      CONFIG.count,
      Math.floor((width * height) / 13000)
    );
    initParticles(Math.max(28, target));
  }

  function initParticles(n) {
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Mise à jour + dessin des points
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Rebond sur les bords
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.dotColor;
      ctx.fill();
    }

    // Connexions entre points proches
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.4; // cyan à ~40%
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(' + CONFIG.lineColor + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Connexion vers le curseur (interaction subtile)
      if (mouse.x !== null) {
        const p = particles[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist * 1.6) {
          const alpha = (1 - dist / (CONFIG.maxDist * 1.6)) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(' + CONFIG.lineColor + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function drawStatic() {
    // Rendu unique sans animation (reduced motion)
    step();
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Suivi du curseur (relatif au canvas)
  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', function () {
    mouse.x = null; mouse.y = null;
  });

  // Resize responsive (throttle léger)
  let rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  // Pause hors écran pour économiser le CPU
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId && !reduceMotion) {
      step();
    }
  });

  resize();
  if (reduceMotion) drawStatic();
  else step();
})();

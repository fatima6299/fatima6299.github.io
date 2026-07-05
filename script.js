document.addEventListener('DOMContentLoaded', () => {

  // ==============================
  // CANVAS — CONSTELLATION ÉPURÉE
  // ==============================
  const canvas = document.getElementById('networkCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, dots, animFrame;

  const CFG = {
    count:   32,
    maxDist: 150,
    speed:   0.12,
    minR:    0.6,
    maxR:    1.4,
  };

  class Dot {
    constructor() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CFG.speed;
      this.vy = (Math.random() - 0.5) * CFG.speed;
      this.r  = CFG.minR + Math.random() * (CFG.maxR - CFG.minR);
      this.a  = 0.1 + Math.random() * 0.25;
      this.da = (Math.random() > 0.5 ? 1 : -1) * 0.0015;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
      this.a += this.da;
      if (this.a > 0.35 || this.a < 0.05) this.da *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${this.a})`;
      ctx.fill();
    }
  }

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dots = Array.from({ length: CFG.count }, () => new Dot());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (d < CFG.maxDist) {
          const a = (1 - d / CFG.maxDist) * 0.055;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(34,211,238,${a})`;
          ctx.lineWidth   = 0.4;
          ctx.stroke();
        }
      }
    }

    dots.forEach(d => { d.update(); d.draw(); });
    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(animFrame); init(); draw(); });
  init();
  draw();


  // ==============================
  // RESTE DU SCRIPT
  // ==============================

  // Année
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Curseur custom
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    }
  });

  (function animateCursor() {
    dotX += (mouseX - dotX) * 0.12;
    dotY += (mouseY - dotY) * 0.12;
    if (cursor) {
      cursor.style.left = dotX + 'px';
      cursor.style.top  = dotY + 'px';
    }
    requestAnimationFrame(animateCursor);
  })();

  // Header + back-to-top
  const header  = document.getElementById('header');
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header?.classList.toggle('solid', y > 50);
    backTop?.classList.toggle('visible', y > 400);
  }, { passive: true });

  backTop?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Menu mobile
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Reveal au scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.querySelectorAll(
    '.skill-card, .tl-item, .project-card, .contact-list li'
  ).forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    observer.observe(el);
  });

  // Feedback formulaire
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = 'Envoyer <i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
      }, 4000);
    }
  });

});
// Listo Visual-FX: Glas-Nav, Scroll-Reveal, Zähler, lebender Chat, Parallax-Punkte.
// Rein dekorativ — ohne JS oder mit "Bewegung reduzieren" bleibt alles normal lesbar.
(function () {
  // Glas-Navigation (läuft auch bei reduzierter Bewegung — reiner Stilwechsel)
  const nav = document.querySelector("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ---- Scroll-Reveal mit Staffelung unter Geschwistern
  const targets = document.querySelectorAll(
    ".card, .section-title, .section-sub, .gstep > div, .btn-explain .row, " +
    ".stats .stat, .cat-chip, .guide-cta h2, .faq details"
  );
  targets.forEach((el) => el.classList.add("reveal"));
  targets.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = (sibs.indexOf(el) % 4) * 90 + "ms";
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => io.observe(el));

  // ---- Zahlen zählen hoch, sobald sichtbar
  const counters = document.querySelectorAll('.stat .v, [data-i18n="math.m1v"], [data-i18n="math.m2v"]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target;
      const txt = el.textContent;
      const m = txt.match(/\d+/);
      if (!m || +m[0] === 0) return;
      const n = +m[0], t0 = performance.now(), dur = 1100;
      (function tick(t) {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = txt.replace(m[0], String(Math.round(n * eased)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));

  // ---- Lebender Chat: Bubbles erscheinen nacheinander, Bot "tippt" vorher
  document.querySelectorAll(".chat").forEach((chat) => {
    const bubbles = [...chat.querySelectorAll(".bubble")];
    if (!bubbles.length) return;
    chat.classList.add("fx");
    const chio = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      chio.disconnect();
      let delay = 350;
      bubbles.forEach((b) => {
        if (b.classList.contains("bot")) {
          const typing = document.createElement("div");
          typing.className = "bubble bot typing";
          typing.innerHTML = "<i></i><i></i><i></i>";
          b.before(typing);
          setTimeout(() => typing.classList.add("on"), delay);
          delay += 900;
          setTimeout(() => { typing.remove(); b.classList.add("on"); }, delay);
          delay += 650;
        } else {
          setTimeout(() => b.classList.add("on"), delay);
          delay += 650;
        }
      });
    }, { threshold: 0.35 });
    chio.observe(chat);
  });

  // ---- Holo-Tilt: Karte neigt sich zur Maus, Glanz wandert mit (wie ein Holo in der Hand)
  document.querySelectorAll(".holo-wrap").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transform =
        `perspective(700px) rotateY(${((px - 0.5) * 16).toFixed(2)}deg) rotateX(${((0.5 - py) * 14).toFixed(2)}deg)`;
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      el.classList.add("glow");
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
      el.classList.remove("glow");
    });
  });

  // ---- Parallax: Hintergrund-Punkte wandern beim Scrollen unterschiedlich schnell
  const dots = document.querySelectorAll(".bg-dot");
  if (dots.length) {
    let raf = null;
    const update = () => {
      raf = null;
      dots.forEach((d) => {
        const speed = parseFloat(d.dataset.speed || "0.1");
        d.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
      });
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }
})();

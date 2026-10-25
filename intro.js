/* EVEX Crafts: scroll-driven 3D tunnel intro. You fly through the logo ring, past the shoes, and into the shop. */
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), tunnel = $('tunnel'), veil = $('veil'), cue = $('cue'), bar = $('bar');
  const items = [...tunnel.querySelectorAll('.item')].map(el => ({
    el, z: +el.dataset.z, kind: el.dataset.kind, cap: el.querySelector('figcaption'), last: el.classList.contains('hero')
  }));
  const chapters = [...intro.querySelectorAll('.chapter')];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = t => t * t * (3 - 2 * t);
  const TOTAL = 11000;                    // how far the camera travels (px)

  /* ---------- gold dust ---------- */
  const cv = intro.querySelector('.dust'), cx = cv.getContext('2d');
  let DW = 0, DH = 0; const DPR = Math.min(devicePixelRatio || 1, 2);
  const parts = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random(), r: Math.random() * 1.6 + .6, s: Math.random() * .04 + .01, ph: Math.random() * 6.28 }));
  function fit() { DW = cv.clientWidth; DH = cv.clientHeight; cv.width = DW * DPR; cv.height = DH * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  fit(); addEventListener('resize', fit);
  function dust(p, t) {
    cx.clearRect(0, 0, DW, DH); cx.globalCompositeOperation = 'lighter';
    for (const q of parts) {
      const depth = .35 + q.z * .9;
      const y = ((q.y - p * depth * 2.2 - t * q.s * .12) % 1 + 1) % 1, x = q.x + Math.sin(t * .4 + q.ph) * .02;
      const tw = .45 + .55 * Math.sin(t * 1.6 + q.ph), R = q.r * depth * 2.4;
      const g = cx.createRadialGradient(x * DW, y * DH, 0, x * DW, y * DH, R * 3);
      g.addColorStop(0, `rgba(255,226,140,${.7 * tw * depth})`); g.addColorStop(1, 'rgba(255,226,140,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(x * DW, y * DH, R * 3, 0, 6.283); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
  }

  /* ---------- progress (speed limited so one flick cannot skip the story) ---------- */
  let target = 0, sp = 0, last = performance.now(), visible = true;
  function onScroll() { const r = intro.getBoundingClientRect(); target = clamp(-r.top / Math.max(1, intro.offsetHeight - innerHeight)); }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll(); sp = target;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(intro);
  window.__tunnel = { jump(p) { target = sp = p; render(p, 0); } };      // handy for testing

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const lim = 0.15 * dt;                                // whole journey takes at least ~7 seconds
    sp += Math.max(-lim, Math.min(lim, (target - sp) * Math.min(1, dt * 6)));
    render(sp, now / 1000);
  }

  function render(p, t) {
    const camZ = p * TOTAL;
    tunnel.style.transform = `rotateY(${Math.sin(p * 11) * 2.4}deg) rotateX(${Math.sin(p * 7) * 1.3}deg) translateZ(${camZ}px)`;
    stage.style.perspectiveOrigin = `${50 + Math.sin(p * 13) * 5}% ${48 + Math.sin(p * 9) * 3}%`;
    for (const it of items) {
      const d = it.z + camZ;                              // distance from the viewer's plane: 0 = natural size, more = closer
      let o;
      if (it.kind === 'portal') o = 1 - clamp((d - 420) / 520);
      else if (it.kind === 'sign') o = clamp((d + 5200) / 2400) * (1 - clamp((d - 260) / 520));
      else o = clamp((d + 5200) / 2500) * (1 - clamp((d - 560) / 480));
      it.el.style.opacity = o.toFixed(3);
      it.el.style.visibility = o < .01 ? 'hidden' : 'visible';
      if (it.cap) it.cap.style.opacity = (1 - clamp((Math.abs(d) - 260) / 460)).toFixed(3);
    }
    veil.style.opacity = ease(clamp((p - .94) / .05)).toFixed(3);
    chapters.forEach(c => c.classList.toggle('on', p >= +c.dataset.s && p <= +c.dataset.e));
    cue.style.opacity = p < .035 ? 1 : 0;
    bar.style.width = (p * 100) + '%';
    dust(p, t);
  }
  render(sp, 0);
  requestAnimationFrame(frame);
})();

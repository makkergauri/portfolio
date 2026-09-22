/* =============================================================
   VISION LAYER (hero)
   Sits on top of the render and "sees" it:
   - detection boxes that follow each sphere, with live confidence scores
   - a scan line that sweeps down; boxes flash as it passes
   - dust motes drifting through the key light
   - a running detection log in the corner
   ============================================================= */
(function () {
  const hero = document.querySelector('.hero');
  const layer = document.getElementById('hero-boxes');
  const motes = document.getElementById('motes');
  const scan = document.getElementById('scan');
  const logEl = document.getElementById('log');
  const root = document.documentElement;
  if (!hero || !layer) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = window.PT_SPHERES || [];

  /* ---------- boxes ---------- */
  const base = [0.97, 0.95, 0.93, 0.91];
  const boxes = S.map((s, i) => {
    const el = document.createElement('div');
    el.className = 'det';
    el.innerHTML = `<span class="det-label">${s.label} <b>${base[i].toFixed(2)}</b></span>`;
    layer.appendChild(el);
    return { el, conf: el.querySelector('b'), r: null, s, i };
  });

  // same camera maths as the shader, so the boxes land exactly on the spheres
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
  function project(cam) {
    if (!cam) return;
    const P = [cam.pos.x, cam.pos.y, cam.pos.z], T = [cam.target.x, cam.target.y, cam.target.z];
    const fw = norm(sub(T, P)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
    const d = 0.5 / Math.tan(cam.fov * Math.PI / 360), w = cam.w, h = cam.h;
    boxes.forEach(b => {
      const v = sub(b.s.p, P), z = dot(v, fw), x = dot(v, rt), y = dot(v, up), r = b.s.r;
      const cx = w / 2 + (x / z) * d * h, cy = h / 2 - (y / z) * d * h;
      const rr = (r / Math.sqrt(Math.max(z * z - r * r, 1e-3))) * d * h * 1.05;
      b.r = { x: cx - rr, y: cy - rr, s: 2 * rr };
    });
  }
  window.addEventListener('pt:camera', e => project(e.detail));
  addEventListener('resize', () => window.PT_camera && project(window.PT_camera()));
  if (window.PT_camera) project(window.PT_camera());

  /* ---------- motes ---------- */
  const mc = motes && motes.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], mx = -999, my = -999;
  function sizeMotes() {
    if (!motes) return;
    dpr = Math.min(devicePixelRatio, 2); W = hero.clientWidth; H = hero.clientHeight;
    motes.width = W * dpr; motes.height = H * dpr;
    const n = W < 700 ? 40 : 90;
    parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .3) * .12, vy: (Math.random() - .5) * .1 + .03, s: .6 + Math.random() * 1.6, ph: Math.random() * 6.28 }));
  }
  sizeMotes(); addEventListener('resize', sizeMotes);
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mx = my = -999; });

  /* ---------- log ---------- */
  const t0 = performance.now();
  const stamp = () => { const s = (performance.now() - t0) / 1000; return `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`; };
  function logLine(text) {
    if (!logEl) return;
    const line = document.createElement('div');
    line.textContent = `${stamp()}  ${text}`;
    logEl.appendChild(line);
    while (logEl.children.length > 5) logEl.firstChild.remove();
  }
  let samples = 0, loggedConv = false, lastLog = 0, logIdx = 0;
  window.addEventListener('pt:samples', e => {
    samples = e.detail;
    if (samples <= 4) { loggedConv = false; logLine(`render   restart`); }
    if (!loggedConv && samples >= 96) { loggedConv = true; logLine(`render   ${samples} spp, converging`); }
  });
  window.addEventListener('pt:camera', () => { if (samples > 8) logLine('camera   moved'); });

  /* ---------- animation loop ---------- */
  let lastConf = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    const conv = root.classList.contains('converged');

    // scan line position (7 s per sweep)
    const scanY = ((now % 7000) / 7000) * (H + 80) - 40;
    if (scan) scan.style.transform = `translate3d(0, ${scanY}px, 0)`;

    // boxes: follow the spheres with a tiny tracker wobble
    boxes.forEach((b, i) => {
      if (!b.r) return;
      const jx = reduce ? 0 : Math.sin(now / 420 + i * 2.1) * 1.2 + Math.sin(now / 173 + i) * .6;
      const jy = reduce ? 0 : Math.cos(now / 380 + i * 1.7) * 1.2;
      const js = reduce ? 0 : Math.sin(now / 600 + i) * 1.5;
      Object.assign(b.el.style, { transform: `translate3d(${b.r.x + jx}px, ${b.r.y + jy}px, 0)`, width: (b.r.s + js) + 'px', height: (b.r.s + js) + 'px' });
      b.el.classList.toggle('hit', conv && Math.abs(scanY - (b.r.y + b.r.s / 2)) < b.r.s / 2);
    });
    if (!reduce && now - lastConf > 650) {
      lastConf = now;
      boxes.forEach((b, i) => { b.conf.textContent = Math.min(0.99, base[i] + (Math.random() - .5) * .02).toFixed(2); });
    }

    // log a detection every ~1.6 s once converged
    if (conv && now - lastLog > 1600 && boxes.length) {
      lastLog = now;
      const b = boxes[logIdx++ % boxes.length];
      if (b.r) logLine(`detect   ${b.s.label.padEnd(15)} ${b.conf.textContent}  [${Math.round(b.r.x)},${Math.round(b.r.y)},${Math.round(b.r.s)}]`);
    }

    // motes: brighter inside the key light, which comes from the upper left
    if (mc && !reduce) {
      mc.setTransform(dpr, 0, 0, dpr, 0, 0);
      mc.clearRect(0, 0, W, H);
      const light = root.dataset.theme === 'light';
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my, dd = dx * dx + dy * dy;
        if (dd < 14000) { const f = (1 - dd / 14000) * .9; p.x += dx / Math.sqrt(dd + 1) * f; p.y += dy / Math.sqrt(dd + 1) * f; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        const beam = Math.max(0, 1 - (p.x / W * .75 + p.y / H * .7));
        const a = (.12 + beam * .75) * (.6 + .4 * Math.sin(now / 900 + p.ph));
        mc.fillStyle = light ? `rgba(70,55,35,${a * .45})` : `rgba(255,196,120,${a})`;
        mc.beginPath(); mc.arc(p.x, p.y, p.s, 0, 6.2832); mc.fill();
      });
    }
  }
  requestAnimationFrame(loop);
})();

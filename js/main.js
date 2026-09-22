/* =============================================================
   main.js: everything except the hero render.
   Used by both index.html and project.html.
   ============================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const css = v => getComputedStyle(root).getPropertyValue(v).trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = window.SITE || { experience: [], projects: [], notes: [] };

  /* a stable "confidence" for any label, so the same thing always gets the same score */
  function conf(label) { let h = 0; for (const c of label) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (0.9 + (h % 10) / 100).toFixed(2); }

  /* ---------- theme ---------- */
  const toggle = $('#themeToggle');
  function syncToggle() { if (toggle) { const light = root.dataset.theme === 'light'; $('.switch-text', toggle).textContent = light ? 'Day' : 'Night'; toggle.setAttribute('aria-pressed', String(light)); } }
  syncToggle();
  toggle && toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    syncToggle();
    window.dispatchEvent(new Event('themechange'));
  });
  window.addEventListener('themechange', () => $$('.frame').forEach(drawArt));

  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- content from data.js ---------- */
  const timeline = $('#timeline');
  if (timeline) {
    timeline.insertAdjacentHTML('beforeend', S.experience.map(j => `
      <article class="job">
        <div class="when mono">${esc(j.dates)}</div>
        <span class="dot" aria-hidden="true"></span>
        <div>
          <h3 data-detect="role">${esc(j.role)}</h3>
          <div class="org">${esc(j.org)}</div>
          <ul>${j.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>
      </article>`).join(''));
  }

  function artHTML(p) {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy">`;
    switch (p.visual) {
      case 'sms': return `<div class="art sms">
          <div>IMD alert: heavy rain likely in your district tonight. Stay away from river banks.</div>
          <div lang="hi">IMD चेतावनी: आज रात आपके ज़िले में भारी बारिश की संभावना। नदी किनारों से दूर रहें।</div>
          <div lang="pa">ਚੇਤਾਵਨੀ: ਅੱਜ ਰਾਤ ਭਾਰੀ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ। ਦਰਿਆ ਦੇ ਕੰਢਿਆਂ ਤੋਂ ਦੂਰ ਰਹੋ।</div></div>`;
      case 'docs': return `<div class="art docs" aria-hidden="true"><i></i><i></i><i></i></div>`;
      case 'spheres': return `<div class="art spheres" aria-hidden="true"><b></b><b></b><b></b></div>`;
      case 'gantt': return `<div class="art gantt" aria-hidden="true"></div>`;
      default: return `<canvas aria-hidden="true"></canvas>`;   // radar, cave
    }
  }

  const track = $('#track');
  if (track) {
    track.innerHTML = S.projects.map(p => `
      <article class="proj" data-slug="${p.slug}">
        <a class="frame" data-visual="${p.visual}" href="project.html?p=${p.slug}" aria-label="${esc(p.title)} case study" tabindex="-1">
          ${artHTML(p)}<span class="det-label" aria-hidden="true">project ${conf(p.slug)}</span>
        </a>
        <div>
          <span class="kind mono">${esc(p.kind)}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.oneLine)}</p>
          <ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          <div class="proj-links">
            <a href="project.html?p=${p.slug}" data-detect="case_study">Read the case study</a>
            ${p.links.live ? `<a href="${p.links.live}" data-detect="live_demo">Live demo</a>` : ''}
            <a href="${p.links.code}" data-detect="source_code">Code</a>
            ${p.team ? '<span class="team">Team project</span>' : ''}
          </div>
        </div>
      </article>`).join('');
  }

  const notes = $('#notesList');
  if (notes) notes.innerHTML = S.notes.map(n => `<li><h3>${esc(n.title)}</h3><span class="soon">coming soon</span><p>${esc(n.blurb)}</p></li>`).join('');

  /* ---------- project art ---------- */
  const radars = [], caves = [];
  // cellular-automata cave, animated one smoothing step at a time (the dungeon crawler's cave generator)
  const GW = 72, GH = 48;
  function newCave(st) { st.g = Array.from({ length: GH }, () => Array.from({ length: GW }, () => Math.random() < .45 ? 1 : 0)); st.step = 0; st.t = performance.now(); return st; }
  function stepCave(st) {
    const g = st.g, n = g.map(r => r.slice());
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const yy = y + dy, xx = x + dx; s += (yy < 0 || xx < 0 || yy >= GH || xx >= GW) ? 1 : g[yy][xx]; }
      n[y][x] = s > 4 ? 1 : s < 4 ? 0 : g[y][x];
    }
    st.g = n; st.step++;
  }
  function drawCave(st) {
    const cv = st.cv, w = cv.width = cv.clientWidth * devicePixelRatio, h = cv.height = cv.clientHeight * devicePixelRatio, c = cv.getContext('2d');
    const cw = w / GW, ch = h / GH; c.fillStyle = css('--ink'); c.globalAlpha = .85;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (st.g[y][x]) c.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch));
    c.globalAlpha = 1; c.fillStyle = css('--sight'); c.font = `${10 * devicePixelRatio}px ${css('--mono')}`;
    c.fillText(st.step < 5 ? `smoothing pass ${st.step}/5` : 'cave ready', 10 * devicePixelRatio, h - 10 * devicePixelRatio);
  }
  function drawArt(frame) {
    const kind = frame.dataset.visual, cv = $('canvas', frame);
    if (kind === 'gantt') {
      const g = $('.gantt', frame); if (!g || g.childElementCount) return;
      const rows = [[3, 0, 2, 0, 4], [0, 3, 0, 0, 0, 2], [0, 0, 0, 5], [2, 0, 0, 0, 0, 3]];
      rows.forEach((row, ri) => {
        const d = document.createElement('div'); const total = row.reduce((a, b) => a + (b || 1.4), 0); let pos = 0;
        row.forEach(len => {
          const s = document.createElement('span'); s.style.flex = len || 1.4;
          s.style.background = len ? (ri % 2 ? 'var(--sight)' : 'var(--light)') : 'transparent';
          s.style.setProperty('--o', len ? .55 + ri * .12 : 0);
          s.style.setProperty('--d', (pos / total * 4.3) + 's');   // bars appear as the playhead reaches them
          pos += len || 1.4; d.appendChild(s);
        });
        g.appendChild(d);
      });
      const ph = document.createElement('i'); ph.className = 'playhead'; g.appendChild(ph);
      return;
    }
    if (!cv) return;
    cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio;
    if (kind === 'cave') { const st = caves.find(c => c.cv === cv); if (st) newCave(st); else caves.push(newCave({ cv })); drawCave(caves.find(c => c.cv === cv)); }
    if (kind === 'radar' && !radars.includes(cv)) radars.push(cv);
  }
  $$('.frame').forEach(drawArt);

  // animated tactical radar for PlayVision
  const players = Array.from({ length: 16 }, (_, i) => ({ team: i % 2, x: Math.random(), y: Math.random(), a: Math.random() * 6.28, id: 1 + i }));
  const ball = { x: .5, y: .5, tx: .5, ty: .5 };
  function drawRadar(cv) {
    const w = cv.width = cv.clientWidth * devicePixelRatio, h = cv.height = cv.clientHeight * devicePixelRatio, c = cv.getContext('2d'), dp = devicePixelRatio;
    const m = w * .07, pw = w - 2 * m, ph = h - 2 * m;
    c.strokeStyle = css('--rule'); c.lineWidth = 1.5 * dp;
    c.strokeRect(m, m, pw, ph); c.beginPath(); c.moveTo(w / 2, m); c.lineTo(w / 2, h - m); c.stroke();
    c.beginPath(); c.arc(w / 2, h / 2, ph * .14, 0, 6.28); c.stroke();
    c.strokeRect(m, h / 2 - ph * .22, pw * .12, ph * .44); c.strokeRect(w - m - pw * .12, h / 2 - ph * .22, pw * .12, ph * .44);
    c.font = `${10 * dp}px ${css('--mono')}`;
    players.forEach(p => {
      if (!reduce) { p.a += (Math.random() - .5) * .3; p.x = clamp(p.x + Math.cos(p.a) * .0015 + (ball.x - p.x) * .002, 0, 1); p.y = clamp(p.y + Math.sin(p.a) * .0015 + (ball.y - p.y) * .002, 0, 1); }
      const x = m + p.x * pw, y = m + p.y * ph;
      c.fillStyle = p.team ? css('--sight') : css('--light');
      c.beginPath(); c.arc(x, y, 5 * dp, 0, 6.28); c.fill();
      if (p.id < 4) { c.fillStyle = css('--ink-2'); c.fillText('#' + p.id, x + 8 * dp, y - 6 * dp); }
    });
    if (!reduce) { if (Math.random() < .012) { ball.tx = Math.random(); ball.ty = Math.random(); } ball.x += (ball.tx - ball.x) * .03; ball.y += (ball.ty - ball.y) * .03; }
    c.fillStyle = css('--ink'); c.beginPath(); c.arc(m + ball.x * pw, m + ball.y * ph, 3.5 * dp, 0, 6.28); c.fill();
  }
  (function radarLoop(now) {
    now = now || performance.now();
    caves.forEach(st => {
      const r = st.cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
      if (st.step < 5 && now - st.t > 380) { stepCave(st); st.t = now; drawCave(st); }
      else if (st.step >= 5 && now - st.t > 3200 && !reduce) { newCave(st); drawCave(st); }
    });
    radars.forEach(cv => { const r = cv.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) drawRadar(cv); });
    if (!reduce) requestAnimationFrame(radarLoop);
  })();
  // click the cave to generate a new one
  $$('.frame[data-visual="cave"]').forEach(f => f.addEventListener('click', e => { e.preventDefault(); drawArt(f); }));

  // detection box on each project when it comes into view
  const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); } }), { threshold: .55 });
  $$('.proj').forEach(p => seen.observe(p));

  /* ---------- cursor: tracking reticle + trail + hover detection ---------- */
  if (finePointer && !reduce) {
    root.classList.add('has-reticle');
    const ret = document.createElement('div'); ret.id = 'reticle'; ret.setAttribute('aria-hidden', 'true');
    ret.innerHTML = '<span>track #07</span>'; document.body.appendChild(ret);
    const trail = document.createElement('canvas'); trail.id = 'trail'; trail.setAttribute('aria-hidden', 'true'); document.body.appendChild(trail);
    const tc = trail.getContext('2d'); const pts = [];
    let mx = -100, my = -100, moved = false;
    const sizeTrail = () => { trail.width = innerWidth * devicePixelRatio; trail.height = innerHeight * devicePixelRatio; };
    sizeTrail(); addEventListener('resize', sizeTrail);
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; moved = true; });
    (function loop() {
      ret.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      if (moved) { pts.push({ x: mx, y: my }); if (pts.length > 18) pts.shift(); }
      tc.clearRect(0, 0, trail.width, trail.height);
      tc.strokeStyle = css('--sight'); tc.lineWidth = 1.5 * devicePixelRatio; tc.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) > 160) continue;
        tc.globalAlpha = i / pts.length * .5; tc.beginPath();
        tc.moveTo(pts[i - 1].x * devicePixelRatio, pts[i - 1].y * devicePixelRatio);
        tc.lineTo(pts[i].x * devicePixelRatio, pts[i].y * devicePixelRatio); tc.stroke();
      }
      tc.globalAlpha = 1;
      requestAnimationFrame(loop);
    })();
  }
  const hb = $('#hoverbox');
  if (hb && finePointer) {
    const lab = $('.det-label', hb); let cur = null;
    function place() { if (!cur) return; const r = cur.getBoundingClientRect(), p = 6; Object.assign(hb.style, { left: (r.left - p) + 'px', top: (r.top - p) + 'px', width: (r.width + 2 * p) + 'px', height: (r.height + 2 * p) + 'px', position: 'fixed' }); }
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-detect]');
      if (t === cur) return;
      cur = t;
      if (!t || t.classList.contains('name')) { hb.classList.remove('on'); return; }
      lab.textContent = `${t.dataset.detect} ${conf(t.dataset.detect + t.textContent)}`;
      place(); hb.classList.add('on');
    });
    addEventListener('scroll', place, { passive: true });
  }

  /* ---------- radar page map ---------- */
  const radar = $('#radar'), svg = $('#radarSvg');
  const secs = [['top', 'render'], ['about', 'emit'], ['statement', 'signal'], ['experience', 'bounce'], ['work', 'detect'], ['notes', 'track'], ['toolkit', 'materials'], ['outliers', 'outliers'], ['contact', 'converge']]
    .map(([id, name]) => ({ el: document.getElementById(id), name })).filter(s => s.el);
  let you;
  if (radar && svg && secs.length) {
    const NS = 'http://www.w3.org/2000/svg';
    secs.forEach((s, i) => {
      const x = 8 + i * (118 / (secs.length - 1));
      const a = document.createElementNS(NS, 'a'); a.setAttribute('href', '#' + s.el.id); a.setAttribute('aria-label', 'Go to ' + s.name);
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'mark-dot'); c.setAttribute('cx', x); c.setAttribute('cy', 43); c.setAttribute('r', 3.2);
      a.appendChild(c); svg.appendChild(a); s.x = x;
    });
    you = document.createElementNS(NS, 'circle'); you.setAttribute('class', 'you'); you.setAttribute('r', 4.5); you.setAttribute('cy', 43); svg.appendChild(you);
  }

  /* ---------- reveal on scroll ---------- */
  const revealSel = '.h2, .pass, .intro, .about-text p, .facts > div, .job, .notes li, .kit > div, .feed, .ood, .email, .elsewhere, .proj > div:last-child, .cs-body > *';
  // clipped headings can't be observed directly (they have no visible area yet), so watch their parent instead
  const watchers = new Map();
  const rev = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    (watchers.get(e.target) || []).forEach(el => el.classList.add('in'));
    watchers.delete(e.target); rev.unobserve(e.target);
  }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  function watch(el) { const t = el.matches('.h2') ? el.parentElement : el; if (!watchers.has(t)) { watchers.set(t, []); rev.observe(t); } watchers.get(t).push(el); }
  function armReveal(scope) {
    $$(revealSel, scope).forEach(el => {
      if (el.dataset.reveal !== undefined) return;
      const sibs = [...el.parentElement.children].filter(c => c.matches(revealSel));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.08 + 's');
      el.dataset.reveal = ''; watch(el);
    });
  }
  if (!reduce) armReveal(document);

  /* ---------- scroll-driven pieces ---------- */
  const photon = $('#photon');
  const work = $('#work'), workProg = $('#workProgress');
  function sizeWork() {
    if (!work || !track) return;
    if (reduce || innerWidth <= 860) { work.style.height = ''; return; }
    const extra = track.scrollWidth - innerWidth;
    work.style.height = (innerHeight + Math.max(0, extra) * 1.1) + 'px';
  }
  function horizontal() {
    if (!work || !track || reduce || innerWidth <= 860) { if (track) track.style.transform = ''; return; }
    const r = work.getBoundingClientRect(), total = work.offsetHeight - innerHeight;
    const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    track.style.transform = `translate3d(${-p * Math.max(0, track.scrollWidth - innerWidth)}px,0,0)`;
    if (workProg) workProg.style.width = (p * 100) + '%';
  }

  // the light ray bouncing between timeline dots
  const rayPath = $('#rayPath'), rayGhost = $('#rayGhost');
  let rayLen = 0;
  function buildRay() {
    if (!timeline || !rayPath) return;
    const tr = timeline.getBoundingClientRect();
    const dots = $$('.dot', timeline).map(d => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - tr.left, r.top + r.height / 2 - tr.top]; });
    if (!dots.length) return;
    let d = `M ${dots[0][0]} ${-30}`;
    dots.forEach(([x, y], i) => { const side = i % 2 ? -1 : 1; const midY = i ? (dots[i - 1][1] + y) / 2 : y - 30; if (i) d += ` L ${x + side * 26} ${midY}`; d += ` L ${x} ${y}`; });
    rayPath.setAttribute('d', d); rayGhost.setAttribute('d', d);
    rayLen = rayPath.getTotalLength();
    rayPath.style.strokeDasharray = rayLen; rayPath.style.strokeDashoffset = reduce ? 0 : rayLen;
  }
  function drawRay() {
    if (!rayLen || reduce) return;
    const r = timeline.getBoundingClientRect();
    const p = clamp((innerHeight * .75 - r.top) / r.height, 0, 1);
    rayPath.style.strokeDashoffset = rayLen * (1 - p);
    if (photon) { const pt = rayPath.getPointAtLength(rayLen * p); photon.setAttribute('cx', pt.x); photon.setAttribute('cy', pt.y); photon.style.opacity = p > 0 && p < 1 ? 1 : 0; }
  }

  // rays converging on the email address
  const conv = $('#converge'), email = $('#email');
  let rays = [];
  function buildConverge() {
    if (!conv || !email) return;
    const box = conv.getBoundingClientRect(), e = email.getBoundingClientRect();
    const fx = e.left - box.left, fy = e.top - box.top + e.height / 2;
    conv.innerHTML = ''; rays = [];
    const W = box.width, H = box.height, n = 14;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const sx = i % 2 ? W : W * (0.35 + t * .65), sy = i % 2 ? H * t : 0;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', sx); l.setAttribute('y1', sy); l.setAttribute('x2', fx); l.setAttribute('y2', fy);
      const len = Math.hypot(sx - fx, sy - fy); l.style.strokeDasharray = len; l.style.strokeDashoffset = reduce ? 0 : len; l._len = len;
      conv.appendChild(l); rays.push(l);
    }
  }
  function drawConverge() {
    if (!rays.length || reduce) return;
    const r = conv.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (r.height * .8), 0, 1);
    rays.forEach((l, i) => { const k = clamp(p * 1.3 - i * .02, 0, 1); l.style.strokeDashoffset = l._len * (1 - k); });
  }

  function radarUpdate() {
    if (!radar || !you) return;
    radar.classList.toggle('show', scrollY > innerHeight * .5);
    let idx = 0; secs.forEach((s, i) => { if (s.el.getBoundingClientRect().top < innerHeight * .45) idx = i; });
    const a = secs[idx], b = secs[Math.min(idx + 1, secs.length - 1)];
    const ra = a.el.getBoundingClientRect(), span = Math.max(1, (b.el.getBoundingClientRect().top - ra.top));
    const f = b === a ? 0 : clamp((innerHeight * .45 - ra.top) / span, 0, 1);
    you.setAttribute('cx', a.x + (b.x - a.x) * f);
    $('#radarNow').textContent = a.name;
    $$('.nav a').forEach(n => n.setAttribute('aria-current', String(n.getAttribute('href') === '#' + a.el.id)));
  }

  let ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(() => { horizontal(); drawRay(); drawConverge(); radarUpdate(); ticking = false; }); }
  function onResize() { sizeWork(); buildRay(); buildConverge(); caves.forEach(drawCave); onScroll(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('load', onResize);
  document.fonts && document.fonts.ready.then(onResize);
  onResize();

  /* ---------- case-study page ---------- */
  const cs = $('#cs');
  if (cs) {
    const slug = new URLSearchParams(location.search).get('p');
    const i = Math.max(0, S.projects.findIndex(p => p.slug === slug));
    const p = S.projects[i];
    const prev = S.projects[(i - 1 + S.projects.length) % S.projects.length], next = S.projects[(i + 1) % S.projects.length];
    const para = t => `<p${/PLACEHOLDER/.test(t) ? ' class="placeholder"' : ''}>${esc(t)}</p>`;
    document.title = `${p.title} · Gauri Makker`;
    cs.innerHTML = `
      <div class="wrap cs-head">
        <a href="index.html#work" class="mono">Back to projects</a>
        <span class="pass mono" style="margin-top:2rem">${esc(p.kind)}${p.team ? ', team project' : ''}</span>
        <h1 class="h2">${esc(p.title)}</h1>
        <p class="cs-lede">${esc(p.oneLine)}</p>
        <ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="proj-links">
          ${p.links.live ? `<a href="${p.links.live}" data-detect="live_demo">Live demo</a>` : ''}
          <a href="${p.links.code}" data-detect="source_code">Code on GitHub</a>
        </div>
        <div class="frame cs-frame seen-frame" data-visual="${p.visual}">${artHTML(p)}<span class="det-label" aria-hidden="true">project ${conf(p.slug)}</span></div>
      </div>
      <div class="wrap cs-body">
        <h2>The problem</h2>${para(p.problem)}
        <h2>My approach</h2>${para(p.approach)}
        <h2>My role</h2>${para(p.role)}
        <h2>The hard part</h2>${para(p.hard)}
        <h2>What I'd do differently</h2>${para(p.differently)}
      </div>
      <nav class="wrap cs-nav" aria-label="More projects">
        <a href="project.html?p=${prev.slug}">Previous: ${esc(prev.title)}</a>
        <a href="project.html?p=${next.slug}">Next: ${esc(next.title)}</a>
      </nav>`;
    $$('.frame', cs).forEach(drawArt);
    if (!reduce) armReveal(cs);
    $$('.frame[data-visual="cave"]', cs).forEach(f => f.addEventListener('click', () => drawArt(f)));
  }
})();
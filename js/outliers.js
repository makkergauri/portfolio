/* =============================================================
   outliers.js
   1. The video statement, shown as a camera feed.
   2. Hobbies, shown as outliers in an embedding plot: the work
      clusters on the left, the hobbies sit far away from it.
   ============================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = v => getComputedStyle(root).getPropertyValue(v).trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* =================== 1. VIDEO STATEMENT =================== */
  const feed = $('#feed');
  if (feed) {
    const video = $('#feedVideo', feed), play = $('#feedPlay', feed), time = $('#feedTime', feed);
    const yt = (feed.dataset.youtube || '').trim();
    const source = video && $('source', video);

    // no YouTube ID and the video file is missing: show the "coming soon" state
    const empty = () => { if (!yt) feed.classList.add('no-video'); };
    if (source) source.addEventListener('error', empty);
    if (video) video.addEventListener('error', empty);
    if (yt) feed.classList.remove('no-video');

    const pad = n => String(Math.floor(n)).padStart(2, '0');
    function tick() {
      if (!video) return;
      const t = video.currentTime;
      time.textContent = `${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * 25)}`;   // mm:ss:frames
      if (!video.paused) requestAnimationFrame(tick);
    }

    play.addEventListener('click', () => {
      if (yt) {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0&cc_load_policy=1`;
        f.title = 'Video statement'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        feed.appendChild(f); feed.classList.add('playing', 'youtube');
        return;
      }
      video.controls = true;
      video.play();
    });
    if (video) {
      video.addEventListener('play', () => { feed.classList.add('playing'); tick(); });
      video.addEventListener('pause', () => feed.classList.remove('rolling'));
      video.addEventListener('playing', () => feed.classList.add('rolling'));
      video.addEventListener('ended', () => feed.classList.remove('rolling'));
    }
  }

  /* =================== 2. OUTLIERS (HOBBIES) =================== */
  const embed = $('#embed'), canvas = $('#embedCanvas'), card = $('#oodCard');
  const hobbies = (window.SITE && window.SITE.hobbies) || [];
  if (!embed || !canvas || !card || !hobbies.length) return;

  // the "work" clusters: tight groups on the left side of the plot
  const clusters = [
    { name: 'vision', x: 0.20, y: 0.34, sx: 0.055, sy: 0.07 },
    { name: 'llm systems', x: 0.33, y: 0.62, sx: 0.06, sy: 0.055 },
    { name: 'rendering', x: 0.14, y: 0.72, sx: 0.04, sy: 0.05 },
    { name: 'systems', x: 0.38, y: 0.26, sx: 0.045, sy: 0.05 }
  ];
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const dots = [];
  clusters.forEach(c => { for (let i = 0; i < 70; i++) dots.push({ c, x: c.x + gauss() * c.sx, y: c.y + gauss() * c.sy, ph: Math.random() * 6.28 }); });

  // outlier score: distance to the nearest cluster, in "sigmas"
  function nearest(h) {
    let best = null;
    clusters.forEach(c => { const d = Math.hypot((h.x - c.x) / c.sx, (h.y - c.y) / c.sy); if (!best || d < best.d) best = { c, d }; });
    return best;
  }

  const buttons = hobbies.map((h, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pt';
    b.style.left = (h.x * 100) + '%'; b.style.top = (h.y * 100) + '%';
    b.setAttribute('aria-label', `Show ${h.title.replace(/^PLACEHOLDER:\s*/, '')}`);
    b.innerHTML = `<span class="pt-dot"></span><span class="pt-label mono">${esc(h.title.replace(/^PLACEHOLDER:\s*/, '').toLowerCase().replace(/\s+/g, '_'))}</span>`;
    b.addEventListener('click', () => { stopAuto(); select(i); });
    b.addEventListener('mouseenter', () => { stopAuto(); select(i); });
    embed.appendChild(b);
    return b;
  });

  let current = -1;
  function select(i) {
    if (i === current) return;
    current = i;
    const h = hobbies[i], n = nearest(h);
    buttons.forEach((b, j) => b.classList.toggle('on', j === i));
    card.classList.remove('show'); void card.offsetWidth;
    card.innerHTML = `
      <span class="det-label">outlier ${Math.min(0.99, 0.8 + n.d / 60).toFixed(2)}</span>
      ${h.image ? `<img src="${esc(h.image)}" alt="" loading="lazy">` : ''}
      <span class="pass mono">${n.d.toFixed(1)}σ from the nearest cluster (${esc(n.c.name)})</span>
      <h3${/PLACEHOLDER/.test(h.title) ? ' class="placeholder"' : ''}>${esc(h.title)}</h3>
      <p${/PLACEHOLDER/.test(h.text) ? ' class="placeholder"' : ''}>${esc(h.text)}</p>
      <span class="ood-count mono">${i + 1} / ${hobbies.length}</span>`;
    card.classList.add('show');
  }

  // cycle through the outliers on its own until someone interacts
  let auto = null;
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  const inView = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !auto && current < 0 && !reduce) auto = setInterval(() => select((current + 1) % hobbies.length), 4500);
  }, { threshold: .4 });
  inView.observe(embed);
  select(0);

  /* ---- draw the plot ---- */
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function size() { dpr = Math.min(devicePixelRatio, 2); W = embed.clientWidth; H = embed.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; }
  size(); addEventListener('resize', size);

  function draw(now) {
    requestAnimationFrame(draw);
    const r = embed.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const light = css('--light'), sight = css('--sight'), rule = css('--rule'), ink2 = css('--ink-2');

    // faint grid
    ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.globalAlpha = .5;
    for (let i = 1; i < 6; i++) { const x = Math.round(W * i / 6) + .5, y = Math.round(H * i / 6) + .5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // cluster points, breathing slightly
    ctx.fillStyle = light;
    dots.forEach(d => {
      const j = reduce ? 0 : .004;
      const x = (d.x + Math.sin(now / 1400 + d.ph) * j) * W, y = (d.y + Math.cos(now / 1700 + d.ph) * j) * H;
      ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.2832); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // cluster names
    ctx.font = `500 11px ${css('--mono')}`; ctx.fillStyle = ink2;
    clusters.forEach(c => ctx.fillText(c.name, c.x * W - c.sx * W * 1.4, c.y * H - c.sy * H * 2.3));

    // dashed line from the selected outlier to its nearest cluster
    if (current >= 0) {
      const h = hobbies[current], n = nearest(h);
      const x1 = n.c.x * W, y1 = n.c.y * H, x2 = h.x * W, y2 = h.y * H;
      ctx.strokeStyle = sight; ctx.setLineDash([4, 5]); ctx.lineDashOffset = reduce ? 0 : -now / 40; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = sight; ctx.fillText(`d = ${n.d.toFixed(1)}σ`, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8);
    }
  }
  requestAnimationFrame(draw);
})();
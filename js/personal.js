/* =============================================================
   personal.js: everything on personal.html
   - theme toggle (shared with the work portfolio)
   - avatar breathes and sways with the mouse (first screen only)
   - content from js/personal-data.js
   - photo gallery with a viewer
   - travel globe: dream places pinned, flight paths from home
   ============================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ph = t => /PLACEHOLDER/.test(t || '') ? ' class="placeholder"' : '';
  const css = v => getComputedStyle(root).getPropertyValue(v).trim();
  const M = window.ME || {};

  /* ---------- theme ---------- */
  const toggle = $('#themeToggle');
  const sync = () => { const light = root.dataset.theme === 'light'; $('.switch-text', toggle).textContent = light ? 'Light' : 'Dark'; toggle.setAttribute('aria-pressed', String(light)); };
  if (toggle) {
    sync();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      sync();
    });
  }
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- text content ---------- */
  const tag = $('#tagline');
  if (tag && M.tagline) { tag.textContent = M.tagline; if (/PLACEHOLDER/.test(M.tagline)) tag.classList.add('placeholder'); }

  const nowTrack = $('#nowTrack');
  if (nowTrack && M.now && M.now.length) {
    const item = t => { const i = t.indexOf(':'); return i > 0 ? `<span>${esc(t.slice(0, i + 1))} <b>${esc(t.slice(i + 1).trim())}</b></span>` : `<span><b>${esc(t)}</b></span>`; };
    const row = M.now.map(item).join('');
    nowTrack.innerHTML = row + row;          // doubled so the loop is seamless
  }

  const about = $('#aboutText');
  if (about) about.innerHTML = (M.about || []).map(p => `<p${ph(p)}>${esc(p)}</p>`).join('');
  const facts = $('#factList');
  if (facts) facts.innerHTML = (M.facts || []).map(f => `<li${ph(f)}>${esc(f)}</li>`).join('');

  const qt = $('#quoteText'), qb = $('#quoteBy');
  if (qt && M.quote) { qt.textContent = M.quote.text || ''; qb.textContent = M.quote.by ? '— ' + M.quote.by : ''; }

  const hobbies = $('#hobbyList');
  if (hobbies) hobbies.innerHTML = (M.hobbies || []).map((h, i) => `
    <article class="hobby">
      <span class="hobby-num">${String(i + 1).padStart(2, '0')}</span>
      ${h.image ? `<img src="${esc(h.image)}" alt="" loading="lazy">` : ''}
      <h3${ph(h.title)}>${esc(h.title)}</h3>
      <p${ph(h.text)}>${esc(h.text)}</p>
    </article>`).join('');

  const tracks = $('#trackList');
  if (tracks) tracks.innerHTML = (M.music || []).map(t => {
    const inner = `<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <span><span class="track-title${/PLACEHOLDER/.test(t.title) ? ' placeholder' : ''}">${esc(t.title)}</span><span class="track-artist${/PLACEHOLDER/.test(t.artist) ? ' placeholder' : ''}">${esc(t.artist)}</span></span>`;
    return t.url ? `<a class="track" href="${esc(t.url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="track">${inner}</div>`;
  }).join('');

  const posts = $('#postList');
  if (posts) posts.innerHTML = (M.writing || []).map(p => {
    const inner = `
      <span class="post-date mono">${esc(p.date || '')}</span>
      <h3${ph(p.title)}>${esc(p.title)}</h3>
      <p${ph(p.blurb)}>${esc(p.blurb || '')}</p>
      ${p.url ? '<span class="post-arrow" aria-hidden="true">→</span>' : '<span class="post-arrow soon">coming soon</span>'}`;
    return `<li>${p.url ? `<a class="post" href="${esc(p.url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="post">${inner}</div>`}</li>`;
  }).join('');

  /* ---------- photo gallery ---------- */
  const gallery = $('#gallery'), viewer = $('#viewer');
  const shapes = ['4 / 5', '1 / 1', '3 / 4', '4 / 3', '4 / 5', '3 / 2'];
  if (gallery) {
    gallery.innerHTML = (M.photos || []).map((p, i) => {
      const tilt = ((i * 37) % 7 - 3) * .6;
      const text = `<span class="cap${/PLACEHOLDER/.test(p.caption) ? ' placeholder' : ''}">${esc(p.caption || '')}</span>
                    <span class="where${/PLACEHOLDER/.test(p.place) ? ' placeholder' : ''}">${esc(p.place || '')}</span>`;
      return p.src
        ? `<button class="shot" type="button" style="--tilt:${tilt}deg" data-i="${i}"><img src="${esc(p.src)}" alt="${esc(p.caption || 'Photo')}" loading="lazy">${text}</button>`
        : `<div class="shot empty" style="--tilt:${tilt}deg; --ar:${shapes[i % shapes.length]}"><span class="ph-frame">photo ${String(i + 1).padStart(2, '0')}</span>${text}</div>`;
    }).join('');
    gallery.addEventListener('click', e => {
      const b = e.target.closest('.shot[data-i]'); if (!b || !viewer) return;
      const p = M.photos[+b.dataset.i];
      $('#viewerImg').src = p.src; $('#viewerImg').alt = p.caption || '';
      $('#viewerCap').textContent = [p.caption, p.place].filter(x => x && !/PLACEHOLDER/.test(x)).join(' · ');
      viewer.showModal();
    });
    if (viewer) {
      $('.viewer-close', viewer).addEventListener('click', () => viewer.close());
      viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
    }
  }

  /* ---------- avatar: breathes, and sways a little with the mouse ---------- */
  if (!reduce && fine) {
    let tx = 0, ty = 0, x = 0, y = 0, mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      x += (tx - x) * .07; y += (ty - y) * .07; gx += (mx - gx) * .15; gy += (my - gy) * .15;
      const s = root.style;
      s.setProperty('--ax', (x * 26).toFixed(1) + 'px'); s.setProperty('--ay', (y * 14).toFixed(1) + 'px'); s.setProperty('--ar', (x * 2.5).toFixed(2) + 'deg');
      s.setProperty('--hx', (x * -30).toFixed(1) + 'px'); s.setProperty('--hy', (y * -10).toFixed(1) + 'px');
      s.setProperty('--mx', gx.toFixed(0) + 'px'); s.setProperty('--my', gy.toFixed(0) + 'px');
      s.setProperty('--sy', scrollY.toFixed(0));
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- travel globe ---------- */
  const canvas = $('#globe'), list = $('#placeList');
  const places = M.travel || [], home = M.home;
  if (list) {
    list.innerHTML = places.map((p, i) => `
      <li><button type="button" data-i="${i}">
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="name">${esc(p.place)}</span>
        <span class="st${p.visited ? ' done' : ''}">${p.visited ? 'been there' : 'someday'}</span>
        ${p.note ? `<span class="note">${esc(p.note)}</span>` : ''}
      </button></li>`).join('');
    const done = places.filter(p => p.visited).length;
    const c = $('#travelCount'); if (c) c.textContent = `${done} of ${places.length} visited · ${places.length - done} to go`;
  }
  if (canvas && window.LAND) {
    const ctx = canvas.getContext('2d');
    const L = window.LAND, rad = Math.PI / 180;
    let W = 0, dpr = 1;
    let rotLon = -(home ? home.lon : 0), rotLat = -15, targetLon = null, targetLat = null, focus = -1;
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    function size() { dpr = Math.min(devicePixelRatio, 2); W = canvas.clientWidth; canvas.width = W * dpr; canvas.height = W * dpr; }
    size(); addEventListener('resize', size);

    // lat/lon -> point on screen (orthographic projection)
    function project(lat, lon) {
      const la = lat * rad, lo = (lon + rotLon) * rad, t = rotLat * rad;
      const x = Math.cos(la) * Math.sin(lo);
      let y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
      const y2 = y * Math.cos(t) - z * Math.sin(t), z2 = y * Math.sin(t) + z * Math.cos(t);
      const r = W * .42;
      return { x: W / 2 + x * r, y: W / 2 - y2 * r, z: z2 };
    }
    // points along the great circle between two places, for flight paths
    function arc(a, b, n = 48) {
      const v = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
      const p = v(a.lat, a.lon), q = v(b.lat, b.lon);
      const d = Math.acos(Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])), out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, s = Math.sin(d) || 1, k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
        const x = k1 * p[0] + k2 * q[0], y = k1 * p[1] + k2 * q[1], z = k1 * p[2] + k2 * q[2];
        const lift = 1 + Math.sin(t * Math.PI) * .12;               // arcs rise above the surface
        out.push({ lat: Math.asin(z / Math.hypot(x, y, z)) / rad, lon: Math.atan2(y, x) / rad, lift });
      }
      return out;
    }
    const paths = home ? places.map(p => arc(home, p)) : [];

    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; targetLon = null; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      rotLon += (e.clientX - lastX) * .35; rotLat = Math.max(-60, Math.min(60, rotLat - (e.clientY - lastY) * .25));
      lastX = e.clientX; lastY = e.clientY; idle = 0;
    });
    const up = () => { dragging = false; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    function focusOn(i) {
      focus = i; const p = places[i];
      targetLon = -p.lon; targetLat = -p.lat * .6; idle = 0;
      $$('.places button').forEach((b, j) => b.classList.toggle('on', j === i));
    }
    if (list) list.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) focusOn(+b.dataset.i); });

    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);

    (function draw(now) {
      requestAnimationFrame(draw);
      if (!visible) return;
      const light = css('--light'), sight = css('--sight'), ink = css('--ink'), ink2 = css('--ink-2'), rule = css('--rule');
      // spin slowly on its own, or glide to a chosen place
      if (targetLon !== null) {
        let d = ((targetLon - rotLon + 540) % 360) - 180;
        rotLon += d * .06; rotLat += (targetLat - rotLat) * .06;
        if (Math.abs(d) < .1) targetLon = null;
      } else if (!dragging && !reduce) { idle++; if (idle > 90) rotLon += .12; }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      const r = W * .42;
      // soft glow + outline of the sphere
      const g = ctx.createRadialGradient(W / 2 - r * .3, W / 2 - r * .35, r * .1, W / 2, W / 2, r * 1.05);
      g.addColorStop(0, 'rgba(255,178,63,.10)'); g.addColorStop(1, 'rgba(255,61,139,.02)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, W / 2, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.stroke();

      // land dots
      for (let i = 0; i < L.length; i += 2) {
        const p = project(L[i + 1], L[i]);
        if (p.z <= 0) continue;
        ctx.globalAlpha = .25 + p.z * .65; ctx.fillStyle = ink2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.25 + p.z * .6, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // flight paths from home
      const t = reduce ? 1 : ((now || 0) / 2600) % 1;
      paths.forEach((path, k) => {
        ctx.beginPath(); let started = false;
        path.forEach(pt => {
          const p = project(pt.lat, pt.lon);
          const px = W / 2 + (p.x - W / 2) * pt.lift, py = W / 2 + (p.y - W / 2) * pt.lift;
          if (p.z > -.05) { started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; } else started = false;
        });
        ctx.strokeStyle = k === focus ? sight : light; ctx.globalAlpha = k === focus ? .9 : .35; ctx.lineWidth = k === focus ? 2 : 1.2;
        ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 36; ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.globalAlpha = 1;

      // home + pins
      const pin = (lat, lon, color, label, big) => {
        const p = project(lat, lon); if (p.z <= 0) return;
        ctx.fillStyle = color; ctx.globalAlpha = .25;
        ctx.beginPath(); ctx.arc(p.x, p.y, big ? 13 : 9, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(p.x, p.y, big ? 5 : 4, 0, 6.2832); ctx.fill();
        if (label && p.z > .25) {
          ctx.font = `500 ${big ? 12 : 11}px ${css('--mono')}`; ctx.fillStyle = ink;
          ctx.fillText(label, p.x + 10, p.y - 8);
        }
      };
      if (home) pin(home.lat, home.lon, ink, 'home', false);
      places.forEach((p, i) => pin(p.lat, p.lon, p.visited ? light : sight, i === focus ? p.place : p.place.split(',')[0], i === focus));
    })();
  }

  /* ---------- reveal on scroll ---------- */
  if (!reduce) {
    const sel = '.intro, .p-about-text p, .facts-chips, .p-quote figure, .shot, .hobby, .track, .travel, .posts li, .p-cta-big, .elsewhere';
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$(sel).forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.matches(sel));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * .08 + 's');
      el.dataset.reveal = ''; io.observe(el);
    });
    $$('.section .h2').forEach(h => {
      h.dataset.reveal = '';
      const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { h.classList.add('in'); o.disconnect(); } }, { rootMargin: '0px 0px -12% 0px' });
      o.observe(h.parentElement);
    });
  }
})();
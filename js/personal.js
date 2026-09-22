/* =============================================================
   personal.js
   - theme toggle (shared with the work portfolio)
   - avatar breathes and sways with the mouse
   - a mandala that draws itself, click for a new one
   - globe of the places I've been
   - photos, video, guestbook
   ============================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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

  /* ---------- words ---------- */
  const tagline = $('#tagline'); if (tagline) tagline.textContent = M.tagline || '';

  const nowTrack = $('#nowTrack');
  if (nowTrack && M.now && M.now.length) {
    const item = t => { const i = t.indexOf(':'); return i > 0 ? `<span>${esc(t.slice(0, i + 1))} <b>${esc(t.slice(i + 1).trim())}</b></span>` : `<span><b>${esc(t)}</b></span>`; };
    const row = M.now.map(item).join('');
    nowTrack.innerHTML = row + row + row;      // repeated so the loop never shows a gap
  }

  const about = $('#aboutText');
  if (about) about.innerHTML = (M.about || []).map(p => `<p>${esc(p)}</p>`).join('');
  const facts = $('#factList');
  if (facts) facts.innerHTML = (M.facts || []).map(f => `<li>${esc(f)}</li>`).join('');

  const qt = $('#quoteText'), qb = $('#quoteBy');
  if (qt && M.quote) { qt.textContent = M.quote.text || ''; qb.textContent = M.quote.by ? '— ' + M.quote.by : ''; }

  /* ---------- things I do ---------- */
  const things = $('#thingList');
  const art = kind => {
    if (kind === 'mandala') return '<div class="thing-art"><canvas data-mini="1"></canvas></div>';
    if (kind === 'film') return '<div class="thing-art"><div class="film" aria-hidden="true"><div class="film-strip"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>';
    if (kind === 'dance') return '<div class="thing-art"><div class="dance" aria-hidden="true"><i></i></div></div>';
    if (kind === 'cook') return '<div class="thing-art"><div class="cook" aria-hidden="true"><i></i><i></i><i></i><span></span></div></div>';
    if (kind === 'bake') return '<div class="thing-art"><div class="bake" aria-hidden="true"><span><i></i></span></div></div>';
    if (kind === 'music') return '<div class="thing-art"><div class="music" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>';
    if (kind === 'lens') return '<div class="thing-art"><div class="lens" aria-hidden="true"><span><i></i><i></i><i></i></span></div></div>';
    if (kind === 'talk') return '<div class="thing-art"><div class="talk" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>';
    return '';
  };
  if (things) things.innerHTML = (M.things || []).map(t => `
    <article class="thing">
      ${art(t.art)}
      <div><h3>${esc(t.title)}</h3><p>${esc(t.line)}</p></div>
    </article>`).join('');

  /* ---------- mandala: drawn with code, like the ones on paper ---------- */
  function mandala(cv, seed, progress) {
    const dpr = Math.min(devicePixelRatio, 2), W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    c.translate(W / 2, H / 2);
    const R = Math.min(W, H) * .46, light = css('--light'), sight = css('--sight'), ink = css('--ink-2');
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const rings = 5 + Math.floor(rnd() * 3);
    const arms = 8 + Math.floor(rnd() * 5) * 2;          // always even, so it stays symmetrical
    c.lineWidth = 1.1;
    for (let r = 0; r < rings; r++) {
      const t = (r + 1) / rings, rad = R * t;
      const shown = Math.max(0, Math.min(1, progress * rings - r));
      if (shown <= 0) break;
      c.strokeStyle = r % 3 === 1 ? sight : (r % 3 === 2 ? light : ink);
      c.globalAlpha = .35 + .5 * shown;
      // the ring itself
      c.beginPath(); c.arc(0, 0, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shown); c.stroke();
      // petals around it
      const kind = Math.floor(rnd() * 3);
      const n = Math.round(arms * (r % 2 ? 1 : .5)) || arms;
      for (let i = 0; i < n * shown; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
        c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
        c.beginPath();
        if (kind === 0) { c.arc(0, 0, R * .045 * (1 + t), 0, 6.2832); }
        else if (kind === 1) { c.moveTo(0, -R * .07); c.quadraticCurveTo(R * .05, 0, 0, R * .07); c.quadraticCurveTo(-R * .05, 0, 0, -R * .07); }
        else { c.moveTo(-R * .035, 0); c.lineTo(0, -R * .09); c.lineTo(R * .035, 0); c.closePath(); }
        c.stroke(); c.restore();
      }
    }
    c.globalAlpha = 1;
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  function runMandala(cv, seed) {
    let t0 = null;
    (function step(now) {
      if (!t0) t0 = now;
      const p = reduce ? 1 : Math.min(1, (now - t0) / 2600);
      mandala(cv, seed, p);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  const bigMandala = $('#mandala');
  if (bigMandala) {
    let seed = Math.floor(Math.random() * 1e6) + 7;
    const start = () => runMandala(bigMandala, seed);
    let started = false;
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; start(); } }).observe(bigMandala);
    bigMandala.addEventListener('click', () => { seed = Math.floor(Math.random() * 1e6) + 7; start(); });
    addEventListener('resize', () => mandala(bigMandala, seed, 1));
  }
  $$('canvas[data-mini]').forEach((cv, i) => {
    let started = false;
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; runMandala(cv, 99 + i * 31); } }).observe(cv);
  });

  /* ---------- avatar sway ---------- */
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

  /* ---------- the globe of places I've been ----------
     Drag to spin. Click a pin (or a name in the list) and the globe turns
     to it and zooms in, so you can see the region. Click empty space or the
     same pin again to zoom back out. */
  const canvas = $('#globe'), list = $('#placeList');
  const been = M.visited || [], home = M.home;
  const title = $('#placesTitle');
  if (title) title.textContent = `${been.length} places, so far`;
  if (list) {
    list.innerHTML = been.map((p, i) => `
      <li><button type="button" data-i="${i}">
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="name">${esc(p.place)}</span>
        <span class="st">${esc(p.note || 'checked')}</span>
      </button></li>`).join('');
    const c = $('#travelCount');
    if (c) c.innerHTML = `<b>${been.length}</b> down. The world awaits!`;
  }
  if (canvas && window.LAND) {
    const ctx = canvas.getContext('2d');
    const L = window.LAND, rad = Math.PI / 180, N = L.length / 2;
    // pre-compute each land point on the unit sphere, so每 frame only needs a rotation
    const A = new Float32Array(N), B = new Float32Array(N), Yv = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const lon = L[i * 2] * rad, lat = L[i * 2 + 1] * rad, cl = Math.cos(lat);
      A[i] = cl * Math.sin(lon); B[i] = cl * Math.cos(lon); Yv[i] = Math.sin(lat);
    }
    let W = 0, dpr = 1;
    let rotLon = -(home ? home.lon : 0), rotLat = (home ? home.lat * .7 : 15), targetLon = null, targetLat = null;
    let zoom = 1, zoomTarget = 1, focus = -1;
    let dragging = false, lastX = 0, lastY = 0, idle = 0, downAt = null;
    function size() { dpr = Math.min(devicePixelRatio, 2); W = canvas.clientWidth; canvas.width = W * dpr; canvas.height = W * dpr; }
    size(); addEventListener('resize', size);

    const R = () => W * .42 * zoom;
    function project(lat, lon) {
      const la = lat * rad, lo = lon * rad, cl = Math.cos(la);
      const a = cl * Math.sin(lo), b = cl * Math.cos(lo), y = Math.sin(la);
      const rl = rotLon * rad, t = rotLat * rad;
      const x = a * Math.cos(rl) + b * Math.sin(rl);
      const z0 = b * Math.cos(rl) - a * Math.sin(rl);
      const y2 = y * Math.cos(t) - z0 * Math.sin(t), z2 = y * Math.sin(t) + z0 * Math.cos(t);
      const r = R();
      return { x: W / 2 + x * r, y: W / 2 - y2 * r, z: z2 };
    }
    function arc(a, b, n = 40) {
      const v = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
      const p = v(a.lat, a.lon), q = v(b.lat, b.lon);
      const d = Math.acos(Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])), out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, s = Math.sin(d) || 1, k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
        const x = k1 * p[0] + k2 * q[0], y = k1 * p[1] + k2 * q[1], z = k1 * p[2] + k2 * q[2];
        out.push({ lat: Math.asin(z / Math.hypot(x, y, z)) / rad, lon: Math.atan2(y, x) / rad, lift: 1 + Math.sin(t * Math.PI) * .06 });
      }
      return out;
    }
    const trips = home ? been.filter(p => p.place !== home.place).map(p => arc(home, p)) : [];

    const pick = $('#globePick');
    function focusOn(p, i) {
      if (focus === i) return zoomOut();
      focus = i; targetLon = -p.lon; targetLat = p.lat; zoomTarget = 3.6; idle = 0;   // tilt equals the latitude, so the place sits in the middle
      $$('.places button').forEach((b, j) => b.classList.toggle('on', j === i));
      if (pick) pick.innerHTML = `<b>${esc(p.place)}</b>${p.note ? ' — ' + esc(p.note) : ''} <span class="mono">· click again to zoom out</span>`;
    }
    function zoomOut() {
      focus = -1; zoomTarget = 1; targetLon = null; targetLat = null;
      $$('.places button').forEach(b => b.classList.remove('on'));
      if (pick) pick.innerHTML = '';
    }
    if (list) list.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) focusOn(been[+b.dataset.i], +b.dataset.i); });

    canvas.addEventListener('pointerdown', e => { dragging = true; downAt = { x: e.clientX, y: e.clientY }; lastX = e.clientX; lastY = e.clientY; targetLon = null; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      rotLon += (e.clientX - lastX) * (.35 / zoom); rotLat = Math.max(-75, Math.min(75, rotLat - (e.clientY - lastY) * (.25 / zoom)));
      lastX = e.clientX; lastY = e.clientY; idle = 0;
    });
    canvas.addEventListener('pointerup', e => {
      dragging = false;
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return;    // that was a drag
      const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = null;
      been.forEach((p, i) => {
        const s = project(p.lat, p.lon); if (s.z <= 0) return;
        const d = Math.hypot(s.x - mx, s.y - my);
        if (d < 24 && (!best || d < best.d)) best = { d, p, i };
      });
      if (best) focusOn(best.p, best.i); else zoomOut();
    });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);

    (function draw(now) {
      requestAnimationFrame(draw);
      if (!visible) return;
      const light = css('--light'), sight = css('--sight'), ink = css('--ink'), ink2 = css('--ink-2'), rule = css('--rule');
      if (targetLon !== null) {
        const d = ((targetLon - rotLon + 540) % 360) - 180;
        rotLon += d * .08; rotLat += (targetLat - rotLat) * .08;
        if (Math.abs(d) < .1) targetLon = null;
      } else if (!dragging && !reduce && zoom < 1.05) { idle++; if (idle > 90) rotLon += .1; }
      zoom += (zoomTarget - zoom) * .08;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      const view = W * .42, r = R();
      // everything stays inside the same circle, so zooming looks like a magnifier
      ctx.save();
      ctx.beginPath(); ctx.arc(W / 2, W / 2, view, 0, Math.PI * 2); ctx.clip();
      const g = ctx.createRadialGradient(W / 2 - view * .3, W / 2 - view * .35, view * .1, W / 2, W / 2, view * 1.05);
      g.addColorStop(0, 'rgba(255,178,63,.10)'); g.addColorStop(1, 'rgba(255,61,139,.02)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);

      // land dots
      const rl = rotLon * rad, t = rotLat * rad;
      const cr = Math.cos(rl), sr = Math.sin(rl), ct = Math.cos(t), st = Math.sin(t);
      const step = zoom < 1.5 ? 3 : 1;                 // fewer dots when zoomed out, all of them up close
      const dot = Math.max(1, 1.1 * zoom * .8);
      ctx.fillStyle = ink2;
      for (let i = 0; i < N; i += step) {
        const a = A[i], b = B[i], y = Yv[i];
        const z0 = b * cr - a * sr;
        const z2 = y * st + z0 * ct;
        if (z2 <= 0) continue;
        const x = (a * cr + b * sr) * r + W / 2;
        if (x < -10 || x > W + 10) continue;
        const yy = W / 2 - (y * ct - z0 * st) * r;
        if (yy < -10 || yy > W + 10) continue;
        ctx.globalAlpha = .2 + z2 * .6;
        ctx.fillRect(x, yy, dot, dot);
      }
      ctx.globalAlpha = 1;

      // travel lines from home
      const dash = reduce ? 1 : ((now || 0) / 2600) % 1;
      trips.forEach((path, k) => {
        ctx.beginPath(); let started = false;
        path.forEach(pt => {
          const p = project(pt.lat, pt.lon);
          const px = W / 2 + (p.x - W / 2) * pt.lift, py = W / 2 + (p.y - W / 2) * pt.lift;
          if (p.z > -.05) { started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; } else started = false;
        });
        ctx.strokeStyle = light; ctx.globalAlpha = k === focus ? .95 : .4; ctx.lineWidth = k === focus ? 2 : 1.2;
        ctx.stroke(); ctx.globalAlpha = 1;
      });

      // pins
      const pin = (p, i) => {
        const s = project(p.lat, p.lon); if (s.z <= 0) return;
        const big = i === focus;
        ctx.fillStyle = light; ctx.globalAlpha = .25;
        ctx.beginPath(); ctx.arc(s.x, s.y, big ? 14 : 9, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(s.x, s.y, big ? 5 : 3.6, 0, 6.2832); ctx.fill();
        if ((big || zoom > 1.6) && s.z > .2) {
          ctx.font = `500 ${big ? 13 : 11}px ${css('--mono')}`; ctx.fillStyle = ink;
          ctx.fillText(p.place, s.x + 11, s.y - 9);
        }
      };
      been.forEach((p, i) => { if (home && p.place === home.place) return; pin(p, i); });
      if (home) {
        const hp = project(home.lat, home.lon);
        if (hp.z > 0) {
          ctx.globalAlpha = .25; ctx.fillStyle = light;
          ctx.beginPath(); ctx.arc(hp.x, hp.y, 13, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
          ctx.font = '16px system-ui, "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('🏠', hp.x, hp.y);
          ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
        }
      }
      ctx.restore();
      ctx.strokeStyle = rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(W / 2, W / 2, view, 0, Math.PI * 2); ctx.stroke();
    })();
  }

  /* ---------- video ---------- */
  const feed = $('#feed');
  if (feed) {
    const v = M.video || {}, cap = $('#videoCap');
    if (cap) cap.textContent = v.caption || '';
    const play = $('#feedPlay'), time = $('#feedTime');
    let video = null;
    if (!v.youtube && v.file) {
      video = document.createElement('video');
      video.preload = 'metadata'; video.playsInline = true;
      video.innerHTML = `<source src="${esc(v.file)}" type="video/mp4">`;
      feed.prepend(video);
      const missing = () => feed.classList.add('no-video');
      video.addEventListener('error', missing);
      $('source', video).addEventListener('error', missing);
      const pad = n => String(Math.floor(n)).padStart(2, '0');
      const tick = () => { time.textContent = `${pad(video.currentTime / 60)}:${pad(video.currentTime % 60)}`; if (!video.paused) requestAnimationFrame(tick); };
      video.addEventListener('play', () => { feed.classList.add('playing', 'rolling'); tick(); });
      video.addEventListener('pause', () => feed.classList.remove('rolling'));
      video.addEventListener('ended', () => feed.classList.remove('rolling'));
    } else if (!v.youtube) feed.classList.add('no-video');

    play.addEventListener('click', () => {
      if (v.youtube) {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&rel=0`;
        f.title = 'Video'; f.allow = 'autoplay; encrypted-media; fullscreen'; f.allowFullscreen = true;
        feed.appendChild(f); feed.classList.add('playing');
      } else if (video) { video.controls = true; video.play(); }
    });
  }

  /* ---------- guestbook ---------- */
  const wall = $('#noteWall');
  if (wall) {
    const notes = M.guestbook || [];
    wall.innerHTML = notes.map((n, i) => `
      <figure class="note" style="--tilt:${((i * 31) % 5 - 2) * .7}deg">
        <p>${esc(n.line)}</p>
        <footer>— ${esc(n.name)}</footer>
      </figure>`).join('');
    wall.hidden = !notes.length;
  }
  const form = $('#noteForm');
  if (form) {
    const status = $('.note-status', form), btn = $('button[type="submit"]', form), count = $('.note-count', form), msg = form.elements.message;
    const upd = () => { count.textContent = `${msg.value.length} / ${msg.maxLength}`; };
    msg.addEventListener('input', upd); upd();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.elements._honey.value) return;
      if (!form.reportValidity()) return;
      if (!M.guestbookForm) { status.textContent = 'The form isn’t connected yet.'; return; }
      btn.disabled = true; status.textContent = 'sending…';
      const data = Object.fromEntries(new FormData(form));
      data._subject = 'Someone wrote about you: ' + data.name;
      try {
        const res = await fetch(M.guestbookForm, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        form.classList.add('sent');
        status.textContent = 'Got it. Thank you.';
        form.reset(); upd();
      } catch (err) {
        status.innerHTML = 'That didn’t send. Email it to <a href="mailto:gaurimakker2006@gmail.com">gaurimakker2006@gmail.com</a> instead.';
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- reveal on scroll ---------- */
  if (!reduce) {
    const sel = '.intro, .p-about-text p, .facts-chips, .p-quote figure, .mandala-box, .thing, .travel, .feed, .note, .note-form, .p-cta-big, .elsewhere';
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
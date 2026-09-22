/* =============================================================
   personal.js
   - theme toggle (shared with the work portfolio)
   - avatar breathes and sways with the mouse (first screen only)
   - a mandala that draws itself, click for a new one
   - globe of the places you've been
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

  /* ---------- photos ---------- */
  const gallery = $('#gallery'), viewer = $('#viewer');
  const shapes = ['4 / 5', '1 / 1', '3 / 4', '4 / 3', '4 / 5', '3 / 2'];
  if (gallery) {
    gallery.innerHTML = (M.photos || []).map((p, i) => {
      const tilt = ((i * 37) % 7 - 3) * .6;
      const text = `<span class="cap">${esc(p.caption || '')}</span><span class="where">${esc(p.place || '')}</span>`;
      return p.src
        ? `<button class="shot" type="button" style="--tilt:${tilt}deg" data-i="${i}"><img src="${esc(p.src)}" alt="${esc(p.caption || 'Photo')}" loading="lazy">${text}</button>`
        : `<div class="shot empty" style="--tilt:${tilt}deg; --ar:${shapes[i % shapes.length]}"><span class="ph-frame">photo ${String(i + 1).padStart(2, '0')}</span></div>`;
    }).join('');
    gallery.addEventListener('click', e => {
      const b = e.target.closest('.shot[data-i]'); if (!b || !viewer) return;
      const p = M.photos[+b.dataset.i];
      $('#viewerImg').src = p.src; $('#viewerImg').alt = p.caption || '';
      $('#viewerCap').textContent = [p.caption, p.place].filter(Boolean).join(' · ');
      viewer.showModal();
    });
    if (viewer) {
      $('.viewer-close', viewer).addEventListener('click', () => viewer.close());
      viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
    }
  }

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

  /* ---------- the globe of places I've been ---------- */
  const canvas = $('#globe'), list = $('#placeList');
  const been = M.visited || [], home = M.home, next = M.next;
  const title = $('#placesTitle');
  if (title) title.textContent = `${been.length} places, so far`;
  if (list) {
    list.innerHTML = been.map((p, i) => `
      <li><button type="button" data-i="${i}">
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="name">${esc(p.place)}</span>
        <span class="st">${esc(p.note || 'been there')}</span>
      </button></li>`).join('') + (next ? `
      <li><button type="button" data-next="1">
        <span class="n">→</span><span class="name">${esc(next.place)}</span><span class="st">next</span>
      </button></li>` : '');
    const c = $('#travelCount');
    if (c) c.innerHTML = `<b>${been.length}</b> down. The rest of the map is still blank.`;
  }
  if (canvas && window.LAND) {
    const ctx = canvas.getContext('2d');
    const L = window.LAND, rad = Math.PI / 180;
    let W = 0, dpr = 1;
    let rotLon = -(home ? home.lon : 0), rotLat = -18, targetLon = null, targetLat = null, focus = -1;
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    function size() { dpr = Math.min(devicePixelRatio, 2); W = canvas.clientWidth; canvas.width = W * dpr; canvas.height = W * dpr; }
    size(); addEventListener('resize', size);

    function project(lat, lon) {
      const la = lat * rad, lo = (lon + rotLon) * rad, t = rotLat * rad;
      const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
      const y2 = y * Math.cos(t) - z * Math.sin(t), z2 = y * Math.sin(t) + z * Math.cos(t);
      const r = W * .42;
      return { x: W / 2 + x * r, y: W / 2 - y2 * r, z: z2 };
    }
    function arc(a, b, n = 40) {
      const v = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
      const p = v(a.lat, a.lon), q = v(b.lat, b.lon);
      const d = Math.acos(Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])), out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, s = Math.sin(d) || 1, k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
        const x = k1 * p[0] + k2 * q[0], y = k1 * p[1] + k2 * q[1], z = k1 * p[2] + k2 * q[2];
        out.push({ lat: Math.asin(z / Math.hypot(x, y, z)) / rad, lon: Math.atan2(y, x) / rad, lift: 1 + Math.sin(t * Math.PI) * .10 });
      }
      return out;
    }
    const trips = home ? been.filter(p => p.place !== home.place).map(p => arc(home, p)) : [];
    const dream = home && next ? arc(home, next, 60) : null;

    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; targetLon = null; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      rotLon += (e.clientX - lastX) * .35; rotLat = Math.max(-60, Math.min(60, rotLat - (e.clientY - lastY) * .25));
      lastX = e.clientX; lastY = e.clientY; idle = 0;
    });
    const up = () => { dragging = false; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

    function focusOn(p, i) { focus = i; targetLon = -p.lon; targetLat = -p.lat * .6; idle = 0; $$('.places button').forEach((b, j) => b.classList.toggle('on', j === i)); }
    if (list) list.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.next && next) focusOn(next, been.length);
      else if (b.dataset.i) focusOn(been[+b.dataset.i], +b.dataset.i);
    });

    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);

    (function draw(now) {
      requestAnimationFrame(draw);
      if (!visible) return;
      const light = css('--light'), sight = css('--sight'), ink = css('--ink'), ink2 = css('--ink-2'), rule = css('--rule');
      if (targetLon !== null) {
        const d = ((targetLon - rotLon + 540) % 360) - 180;
        rotLon += d * .06; rotLat += (targetLat - rotLat) * .06;
        if (Math.abs(d) < .1) targetLon = null;
      } else if (!dragging && !reduce) { idle++; if (idle > 90) rotLon += .1; }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      const r = W * .42;
      const g = ctx.createRadialGradient(W / 2 - r * .3, W / 2 - r * .35, r * .1, W / 2, W / 2, r * 1.05);
      g.addColorStop(0, 'rgba(255,178,63,.10)'); g.addColorStop(1, 'rgba(255,61,139,.02)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, W / 2, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.stroke();

      for (let i = 0; i < L.length; i += 2) {
        const p = project(L[i + 1], L[i]);
        if (p.z <= 0) continue;
        ctx.globalAlpha = .22 + p.z * .6; ctx.fillStyle = ink2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + p.z * .6, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;

      const t = reduce ? 1 : ((now || 0) / 2600) % 1;
      const line = (path, color, alpha, width, dash) => {
        ctx.beginPath(); let started = false;
        path.forEach(pt => {
          const p = project(pt.lat, pt.lon);
          const px = W / 2 + (p.x - W / 2) * pt.lift, py = W / 2 + (p.y - W / 2) * pt.lift;
          if (p.z > -.05) { started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; } else started = false;
        });
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
        if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = -t * 36; }
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      };
      trips.forEach((p, k) => line(p, light, k === focus ? .95 : .45, k === focus ? 2 : 1.2));
      if (dream) line(dream, sight, .6, 1.4, [4, 6]);

      const pin = (lat, lon, color, label, big) => {
        const p = project(lat, lon); if (p.z <= 0) return;
        ctx.fillStyle = color; ctx.globalAlpha = .25;
        ctx.beginPath(); ctx.arc(p.x, p.y, big ? 13 : 9, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(p.x, p.y, big ? 5 : 3.6, 0, 6.2832); ctx.fill();
        if (label && p.z > .25) { ctx.font = `500 ${big ? 12 : 11}px ${css('--mono')}`; ctx.fillStyle = ink; ctx.fillText(label, p.x + 10, p.y - 8); }
      };
      // only the pin you picked shows its name, so the map stays readable
      been.forEach((p, i) => pin(p.lat, p.lon, light, i === focus ? p.place : '', i === focus));
      if (next) pin(next.lat, next.lon, sight, next.place + ' · someday', focus === been.length);
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
    const sel = '.intro, .p-about-text p, .facts-chips, .p-quote figure, .mandala-box, .shot, .thing, .travel, .feed, .note, .note-form, .p-cta-big, .elsewhere';
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
/* =============================================================
   features.js
   1. Background: soft moving light and a dot grid that your cursor
      lights up like a torch.
   2. Command palette: press Ctrl+K (or /) to jump anywhere.
   3. Live from GitHub: your most recently pushed repos.
   4. Recommendations: a wall of published notes, and a form to
      leave a new one (sent to your email via FormSubmit).
   Used by both index.html and project.html.
   ============================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = window.SITE || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onHome = !!$('#main');
  const real = v => v && !/PLACEHOLDER/.test(v);

  /* =================== 1. BACKGROUND =================== */
  if (!reduce) {
    let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      x += (mx - x) * .15; y += (my - y) * .15;
      root.style.setProperty('--mx', x.toFixed(0) + 'px');
      root.style.setProperty('--my', y.toFixed(0) + 'px');
      root.style.setProperty('--sy', scrollY.toFixed(0));
      requestAnimationFrame(loop);
    })();
  }

  /* =================== 2. COMMAND PALETTE =================== */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  $$('.cmdk kbd').forEach(k => k.textContent = isMac ? '⌘K' : 'Ctrl K');

  const go = id => () => { if (onHome) { const el = $(id); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } else location.href = 'index.html' + id; };
  const open = url => () => window.open(url, '_blank', 'noopener');
  const items = [
    { label: 'About', hint: 'section', run: go('#about') },
    { label: 'Experience', hint: 'section', run: go('#experience') },
    { label: 'Projects', hint: 'section', run: go('#work') },
    { label: 'Notes', hint: 'section', run: go('#notes') },
    { label: 'Recommendations', hint: 'section', run: go('#signal') },
    { label: 'Contact', hint: 'section', run: go('#contact') },
    ...(S.projects || []).map(p => ({ label: p.title, hint: 'case study · ' + p.kind, run: () => { location.href = 'project.html?p=' + p.slug; } })),
    { label: 'Leave a recommendation', hint: 'action', run: go('#signal') },
    { label: 'Copy email address', hint: 'action', run: () => { navigator.clipboard && navigator.clipboard.writeText('gaurimakker2006@gmail.com'); toast('Email copied'); } },
    { label: 'Switch dark / light', hint: 'action', run: () => { const t = $('#themeToggle'); t && t.click(); } },
    { label: 'Resume', hint: 'link', run: open('resume.pdf') },
    { label: 'GitHub', hint: 'link', run: open('https://github.com/makkergauri') },
    { label: 'LinkedIn', hint: 'link', run: open('https://www.linkedin.com/in/gauri-makker/') },
    ...(real(S.personalSite) ? [{ label: 'Personal site', hint: 'link', run: open(S.personalSite) }] : [])
  ];

  const pal = document.createElement('div');
  pal.className = 'palette'; pal.hidden = true;
  pal.innerHTML = `
    <div class="pal-box" role="dialog" aria-modal="true" aria-label="Command palette">
      <span class="det-label">command 0.99</span>
      <input class="pal-input" type="text" placeholder="Type a project, section or action…" aria-label="Search" autocomplete="off" spellcheck="false">
      <ul class="pal-list" role="listbox"></ul>
      <div class="pal-foot mono"><span>↑↓ move</span><span>enter open</span><span>esc close</span></div>
    </div>`;
  document.body.appendChild(pal);
  const input = $('.pal-input', pal), list = $('.pal-list', pal);
  let shown = [], sel = 0, lastFocus = null;

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = items.filter(it => !q || (it.label + ' ' + it.hint).toLowerCase().includes(q))
      .sort((a, b) => (b.label.toLowerCase().startsWith(q)) - (a.label.toLowerCase().startsWith(q)));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((it, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}"><span>${esc(it.label)}</span><span class="mono">${esc(it.hint)}</span></li>`).join('')
      : '<li class="pal-empty">No match. Try "projects" or "email".</li>';
    const cur = list.children[sel]; cur && cur.scrollIntoView({ block: 'nearest' });
  }
  function openPal() { lastFocus = document.activeElement; pal.hidden = false; input.value = ''; sel = 0; render(); requestAnimationFrame(() => { pal.classList.add('on'); input.focus(); }); }
  function closePal() { pal.classList.remove('on'); setTimeout(() => { pal.hidden = true; }, 180); lastFocus && lastFocus.focus && lastFocus.focus(); }
  function runSel() { const it = shown[sel]; if (!it) return; closePal(); setTimeout(it.run, 60); }

  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(); }
    else if (e.key === 'Escape') closePal();
  });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { sel = +li.dataset.i; runSel(); } });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
    else if (e.key === '/' && !typing && pal.hidden) { e.preventDefault(); openPal(); }
  });
  $$('.cmdk').forEach(b => b.addEventListener('click', openPal));

  // small toast message
  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast mono'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 2200);
  }

  /* =================== 3. LIVE FROM GITHUB =================== */
  const gh = $('#ghLive'), ghList = $('#ghList');
  if (gh && ghList && S.github) {
    const ago = iso => {
      const s = (Date.now() - new Date(iso)) / 1000;
      if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
      if (s < 86400) return Math.round(s / 3600) + ' h ago';
      const d = Math.round(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago';
    };
    const show = repos => {
      const top = repos.filter(r => !r.fork).slice(0, 4);
      if (!top.length) return;
      ghList.innerHTML = top.map(r => `
        <li><a href="${esc(r.html_url)}" target="_blank" rel="noopener" data-detect="repo">
          <span class="live-name">${esc(r.name)}</span>
          <span class="live-desc">${esc(r.description || '')}</span>
          <span class="live-meta mono">${esc(r.language || '')}${r.language ? ' · ' : ''}pushed ${ago(r.pushed_at)}</span>
        </a></li>`).join('');
      gh.hidden = false;
    };
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('gh') || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < 30 * 60 * 1000) show(cached.d);
    else fetch(`https://api.github.com/users/${encodeURIComponent(S.github)}/repos?sort=pushed&per_page=10`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { try { sessionStorage.setItem('gh', JSON.stringify({ t: Date.now(), d })); } catch (e) {} show(d); })
      .catch(() => {});   // if GitHub is unreachable the strip simply stays hidden
  }

  /* =================== 4. RECOMMENDATIONS =================== */
  const recs = $('#recs');
  if (recs) {
    const list = S.recommendations || [];
    recs.innerHTML = list.map((r, i) => `
      <figure class="rec">
        <span class="det-label">recommendation ${String(i + 1).padStart(2, '0')}</span>
        <blockquote>${esc(r.text)}</blockquote>
        <figcaption><strong>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.name)}</a>` : esc(r.name)}</strong><span>${esc(r.role || '')}</span></figcaption>
      </figure>`).join('');
    recs.hidden = !list.length;
  }

  const form = $('#recForm');
  if (form) {
    const status = $('.rec-status', form), btn = $('button[type="submit"]', form), count = $('.rec-count', form), msg = form.elements.message;
    const upd = () => { count.textContent = `${msg.value.length} / ${msg.maxLength}`; };
    msg.addEventListener('input', upd); upd();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.elements._honey.value) return;            // spam bots fill hidden fields
      if (!form.reportValidity()) return;
      if (!real(S.recommendForm)) { status.textContent = 'The form isn’t connected yet.'; return; }
      btn.disabled = true; form.classList.add('sending'); status.textContent = 'transmitting…';
      const data = Object.fromEntries(new FormData(form));
      data._subject = 'New portfolio recommendation from ' + data.name;
      data.may_publish = form.elements.publish.checked ? 'Yes' : 'No';
      delete data.publish;
      try {
        const res = await fetch(S.recommendForm, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        form.classList.add('sent');
        status.textContent = 'Signal received. Thank you, I’ll read it soon.';
        form.reset(); upd();
      } catch (err) {
        status.innerHTML = 'That didn’t go through. You can email it to <a href="mailto:gaurimakker2006@gmail.com">gaurimakker2006@gmail.com</a> instead.';
      } finally { btn.disabled = false; form.classList.remove('sending'); }
    });
  }
})();
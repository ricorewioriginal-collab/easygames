/* Klavierlicht – Oberfläche: Laden, Titel, Konsolen-Menü, Liederbuch (im Spiel + Online-Archiv), Spiel auf dem Canvas,
 * Zuhören, Ergebnis. Speichern unter klavierlicht-* (Cloud über anmacha-cloud), Gesamtpunkte als klavierlicht-highscore. */
(function () {
  'use strict';
  const C = KLCore, P = KLPiano, $ = id => document.getElementById(id), PX = 'klavierlicht-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(PX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(PX + k, JSON.stringify(v)); } catch (e) { /* voll/privat */ } } };
  const SET = Object.assign({ level: 'normal', acc: 0.8, help: true, labels: true }, LS.get('settings', {})), saveSet = () => LS.set('settings', SET);
  const BEST = LS.get('best', {});
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  // Online-Archiv: auf der Homepage relativ, in den Apps (ohne Archiv-Ordner) von der easygames-Homepage
  const PUB = (window.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/') + 'klavierlicht/archiv/';
  const ARCH = [new URL('archiv/', location.href).href, PUB].filter((v, i, a) => a.indexOf(v) === i);
  let cur = 'sLoad', toastT = 0, archive = null, archBase = '', libTab = 'spiel', libCat = 'alle', libQ = '';
  function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2200); }

  /* ---------- Bildschirme, Fenster, Tastatur ---------- */
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const ovOpen = () => !$('ov').hidden;
  function focusFirst() { if (coarse() || cur === 'sGame' && !ovOpen()) return; const r = ovOpen() ? $('ovBox') : $(cur); const el = r && (r.querySelector('[data-focus]') || r.querySelector('.mi, .nav:not([disabled])')); if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  let ovEsc = null;
  function overlay(html, binds) { $('ovBox').innerHTML = html; $('ov').hidden = false; ovEsc = binds.esc || closeOv; $('ovBox').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { const f = binds[b.dataset.act] || (b.dataset.act === 'esc' ? ovEsc : null); if (f) f(b); }; }); setTimeout(focusFirst, 0); }
  function closeOv() { $('ov').hidden = true; $('ovBox').innerHTML = ''; ovEsc = null; setTimeout(focusFirst, 0); }
  function navMove(dx, dy) {
    const r = ovOpen() ? $('ovBox') : $(cur), els = Array.from(r.querySelectorAll('.nav, .mi')).filter(x => !x.disabled && x.offsetParent !== null); if (!els.length) return;
    const a = document.activeElement; if (!els.includes(a)) { els[0].focus(); return; }
    const q = a.getBoundingClientRect(), ax = q.left + q.width / 2, ay = q.top + q.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const b = e.getBoundingClientRect(), x = b.left + b.width / 2 - ax, y = b.top + b.height / 2 - ay, al = x * dx + y * dy; if (al <= 2) continue; const d = al + Math.abs(x * dy + y * dx) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
  }
  const BACK = { sMenu: () => scr('sTitle'), sLib: () => menu(), sHelp: () => menu(), sGame: () => pause() };
  addEventListener('keydown', e => {
    const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type === 'search' || t.tagName === 'TEXTAREA');
    if (cur === 'sGame' && !ovOpen() && G.run) { if (gameKey(e, true)) { e.preventDefault(); return; } }
    if (e.code === 'Escape') { e.preventDefault(); if (ovOpen()) { if (ovEsc) ovEsc(); return; } if (typing) { t.blur(); return; } if (BACK[cur]) BACK[cur](); return; }
    if (typing) return;
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); menu(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d && cur !== 'sGame') { e.preventDefault(); navMove(d[0], d[1]); }
  });
  addEventListener('keyup', e => { if (cur === 'sGame' && G.run) gameKey(e, false); });

  /* ---------- Menü ---------- */
  const total = () => Object.values(BEST).reduce((a, b) => a + (b.score || 0), 0);
  function menu() { stopGame(); scr('sMenu');
    const items = [['play', '🎹', 'Spielen', 'Lichter fallen im Takt der Melodie – tippe sie, wenn sie die Tasten erreichen, und das Lied spielt sich wie von selbst. Kinderlieder, Weihnachten, Volkslieder und Klassik.'],
      ['arch', '🌐', 'Online-Archiv', 'Noch mehr Lieder zum Mitspielen – sie werden erst beim Spielen geladen (nur Noten, ein paar KB je Lied). Braucht Internet.'],
      ['listen', '🎧', 'Zuhören', 'Das Klavier spielt ein Lied ganz allein vor – so hörst du, wie es klingen soll.'],
      ['help', '❓', 'So geht\'s', 'Steuerung mit Touch, Tastatur und Controller, Schwierigkeiten und Wertung.'],
      ['opts', '⚙️', 'Einstellungen', 'Schwierigkeit, Lautstärke der Begleitung, Tastenbeschriftung.']];
    $('mList').innerHTML = items.map(([id, ic, t, d], i) => `<button class="mi${i ? '' : ' hero'}" data-go="${id}" data-i="${esc(d)}" data-ic="${ic}"><i>${ic}</i><b>${t}</b></button>`).join('');
    const info = b => { $('mInfo').innerHTML = `<i>${b.dataset.ic}</i><b>${b.querySelector('b').textContent}</b><p>${b.dataset.i}</p><p class="best">⭐ ${Object.values(BEST).reduce((a, x) => a + (x.stars || 0), 0)} Sterne · ${total().toLocaleString('de-DE')} Punkte</p>`; };
    $('mList').querySelectorAll('.mi').forEach(b => { b.onfocus = b.onmouseenter = () => info(b); b.onclick = () => go(b.dataset.go); }); info($('mList').firstElementChild);
  }
  function go(g) { if (g === 'play') lib('spiel', false); else if (g === 'arch') lib('archiv', false); else if (g === 'listen') lib('spiel', true); else if (g === 'help') help(); else opts(); }

  /* ---------- Liederbuch ---------- */
  let listenMode = false;
  const builtin = () => KLSongs.list.map(s => Object.assign({ chart: C.fromNotation(s) }, s));
  const key = s => (s.chart && s.chart.builtin ? 'b:' : 'a:') + s.id;
  function lib(tab, listen) { scr('sLib'); libTab = tab; listenMode = listen; renderLib(); if (tab === 'archiv' && !archive) loadArchive(); }
  async function loadArchive() {
    $('libList').innerHTML = '<p class="empty">🌐 Archiv wird geladen …</p>';
    for (const b of ARCH) {
      try { const r = await fetch(b + 'index.json', { cache: 'no-cache' }); if (!r.ok) continue; const j = await r.json(); if (!Array.isArray(j.songs)) continue; archive = j.songs; archBase = b; break; } catch (e) { /* nächste Adresse */ }
    }
    if (!archive) { $('libList').innerHTML = '<p class="empty">📡 Das Online-Archiv ist gerade nicht erreichbar. Prüfe die Internetverbindung – die Lieder im Spiel gehen immer.</p><div class="row center"><button class="btn nav" id="retry">🔄 Nochmal</button></div>'; $('retry').onclick = loadArchive; return; }
    if (cur === 'sLib' && libTab === 'archiv') renderLib();
  }
  function renderLib() {
    $('libTitle').textContent = listenMode ? '🎧 Zuhören' : libTab === 'archiv' ? '🌐 Online-Archiv' : '🎹 Liederbuch';
    $('libTabs').innerHTML = [['spiel', '🎹 Im Spiel'], ['archiv', '🌐 Archiv']].map(([k, n]) => `<button class="chip nav${libTab === k ? ' on' : ''}" data-tab="${k}">${n}</button>`).join('') +
      '<span class="sep"></span>' + Object.keys(KLSongs.CATS).filter(k => k === 'alle' || (libTab === 'archiv' ? (archive || []) : KLSongs.list).some(s => s.cat === k)).map(k => `<button class="chip sm nav${libCat === k ? ' on' : ''}" data-cat="${k}">${KLSongs.CATS[k]}</button>`).join('');
    $('libTabs').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { libTab = b.dataset.tab; libCat = 'alle'; renderLib(); if (libTab === 'archiv' && !archive) loadArchive(); });
    $('libTabs').querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { libCat = b.dataset.cat; renderLib(); });
    $('libLvl').innerHTML = Object.keys(C.LEVELS).map(k => `<button class="chip sm nav${SET.level === k ? ' on' : ''}" data-l="${k}">${['🟢', '🟡', '🔴'][Object.keys(C.LEVELS).indexOf(k)]} ${C.LEVELS[k].n}</button>`).join('');
    $('libLvl').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { SET.level = b.dataset.l; saveSet(); renderLib(); });
    $('libLvl').hidden = listenMode;
    if (libTab === 'archiv' && !archive) return;
    const q = libQ.trim().toLowerCase();
    let list = libTab === 'archiv' ? archive.map(s => Object.assign({ online: true }, s)) : builtin().map(s => Object.assign({ diff: C.difficulty(s.chart), dur: C.duration(s.chart) }, s));
    if (libCat !== 'alle') list = list.filter(s => s.cat === libCat);
    if (q) list = list.filter(s => (s.title + ' ' + s.artist).toLowerCase().includes(q));
    $('libCount').textContent = list.length + (list.length === 1 ? ' Lied' : ' Lieder');
    $('libList').innerHTML = list.length ? list.map(s => { const b = BEST[(s.online ? 'a:' : 'b:') + s.id]; return `<button class="song nav" data-id="${esc(s.id)}" data-on="${s.online ? 1 : 0}">
        <i class="cv c-${esc(s.cat)}">${s.cat === 'kinder' ? '🧸' : s.cat === 'weihnacht' ? '🎄' : s.cat === 'klassik' ? '🎻' : '🌍'}</i>
        <span class="st"><b>${esc(s.title)}</b><small>${esc(s.artist)}${s.dur ? ' · ' + C.fmt(s.dur) : ''}</small></span>
        <span class="df" title="Schwierigkeit">${'♪'.repeat(s.diff || 2)}<em>${'♪'.repeat(4 - (s.diff || 2))}</em></span>
        <span class="bs">${b ? '⭐'.repeat(b.stars) + '<em>' + '☆'.repeat(3 - b.stars) + '</em>' : '<em>☆☆☆</em>'}${s.online ? '<small>🌐</small>' : ''}</span></button>`; }).join('') : '<p class="empty">Nichts gefunden.</p>';
    $('libList').querySelectorAll('.song').forEach(b => b.onclick = () => pick(b.dataset.id, b.dataset.on === '1'));
  }
  $('libSearch').addEventListener('input', e => { libQ = e.target.value; renderLib(); });
  async function pick(id, online) {
    if (!online) { const s = builtin().find(x => x.id === id); return start(s.chart, 'b:' + id); }
    toast('🌐 Lied wird geladen …', 1500);
    try { const r = await fetch(archBase + encodeURIComponent(id) + '.json'); const c = await r.json(); if (!C.check(c)) throw new Error('Format'); start(c, 'a:' + id); }
    catch (e) { toast('📡 Lied konnte nicht geladen werden – bitte später nochmal.'); }
  }

  /* ---------- Spiel ---------- */
  const G = { run: false };
  const cv = $('cv'), cx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, raf = 0;
  function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  addEventListener('resize', () => { if (cur === 'sGame') resize(); });
  const KEYS = { 4: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], 5: ['KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK'], 6: ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL'] };
  const LABEL = c => c === 'Space' ? '␣' : c.replace('Key', '');
  const COLORS = ['#ff5fa2', '#ffb03a', '#ffe14d', '#5dffa0', '#4dd8ff', '#a78bff'];
  function start(chart, k) {
    if (!P.init()) { toast('Dein Browser kann keinen Ton erzeugen.'); return; }
    const L = C.LEVELS[listenMode ? 'normal' : SET.level];
    Object.assign(G, { chart, key: k, L, notes: C.playable(chart, listenMode ? 'normal' : SET.level), acc: C.accompaniment(chart), ai: 0, st: C.newState(), auto: listenMode, run: true, paused: false, fx: [], held: {}, flash: {} });
    G.len = C.duration(chart) + 1.2; G.t0 = P.ctx.currentTime + 2.2;   // 2 Sekunden zum Ankommen, Einzähler
    scr('sGame'); resize(); $('gTitle').textContent = chart.title; $('gArtist').textContent = chart.artist || ''; $('gAuto').hidden = !G.auto;
    for (let i = 0; i < 4; i++) P.note(chart.bpm ? 84 : 84, G.t0 - (4 - i) * 60 / (chart.bpm || 100) * (i < 3 ? 1 : 1), 0.08, i ? 0.25 : 0.35);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stopGame() { G.run = false; cancelAnimationFrame(raf); P.stopAll(); }
  const now = () => P.ctx.currentTime - G.t0;
  function frame() {
    if (!G.run) return; raf = requestAnimationFrame(frame); if (G.paused) return;
    const t = now();
    // Begleitung vorausplanen
    while (G.ai < G.acc.length && G.acc[G.ai][0] < t + 0.3) { const [at, p, d, v] = G.acc[G.ai++]; if (at > t - 0.05) P.note(p, G.t0 + at, d, v * SET.acc); }
    // Zuhören: Melodie spielt selbst; sonst verpasste Lichter werten
    for (const n of G.notes) {
      if (n.hit !== null) continue;
      if (G.auto) { if (n.t < t + 0.25) { P.note(n.p, G.t0 + n.t, n.d, 0.75); n.hit = 'perfect'; n.at = n.t; C.scoreHit(G.st, 'perfect'); setTimeout(() => burst(n, 'perfect'), Math.max(0, (n.t - t) * 1000)); } continue; }
      if (n.t < t - C.WIN.good) { n.hit = 'miss'; C.scoreHit(G.st, null); if (SET.help) P.note(n.p, G.t0 + n.t + 0.01, n.d, 0.16); G.flash.miss = performance.now(); }
      if (n.t > t + 3) break;
    }
    draw(t);
    if (t > G.len) finish();
  }
  function laneHit(lane) {
    if (!G.run || G.paused || G.auto) return;
    const t = now(); G.flash[lane] = performance.now();
    let best = null, bd = 9;
    for (const n of G.notes) { if (n.hit !== null) continue; if (n.t > t + C.WIN.good) break; const d = Math.abs(n.t - t); if ((G.L.any || n.lane === lane) && d < bd) { bd = d; best = n; } }
    if (!best) { if (!G.L.any) { const near = G.notes.find(n => n.hit === null && Math.abs(n.t - t) < C.WIN.good); if (near) P.note(near.p - 1, 0, 0.12, 0.08); } return; }
    const kind = C.judge(best.t - t); best.hit = kind || 'miss'; best.at = t; C.scoreHit(G.st, kind);
    P.note(best.p, 0, best.d, kind === 'perfect' ? 0.85 : 0.7); burst(best, kind);
  }
  function gameKey(e, down) {
    if (e.repeat) return true;
    const keys = KEYS[G.L.lanes]; let lane = keys.indexOf(e.code);
    if (lane < 0 && (e.code === 'Enter' || e.code === 'NumpadEnter')) lane = Math.floor(G.L.lanes / 2);
    if (lane < 0) { const a = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }[e.code]; if (a != null) lane = Math.round(a / 3 * (G.L.lanes - 1)); }
    if (lane < 0) { if (G.L.any && down && /^(Key|Digit|Space)/.test(e.code)) { laneHit(0); return true; } return false; }
    if (down) { G.held[lane] = true; laneHit(lane); } else G.held[lane] = false;
    return true;
  }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); if (!G.run) return; const r = cv.getBoundingClientRect(); const lane = Math.max(0, Math.min(G.L.lanes - 1, Math.floor((e.clientX - r.left) / r.width * G.L.lanes))); G.held[lane] = true; laneHit(lane); });
  cv.addEventListener('pointerup', () => { G.held = {}; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  function burst(n, kind) { const lw = W / G.L.lanes; for (let i = 0; i < (kind === 'perfect' ? 14 : 8); i++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 160; G.fx.push({ x: (n.lane + 0.5) * lw, y: H * 0.84, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, c: COLORS[n.lane], t: performance.now() }); }
    G.fx.push({ txt: kind === 'perfect' ? 'Perfekt!' : kind === 'good' ? 'Gut' : 'Daneben', x: (n.lane + 0.5) * lw, y: H * 0.78, t: performance.now(), c: kind === 'perfect' ? '#ffe14d' : kind === 'good' ? '#9ef' : '#f88' }); }
  function draw(t) {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0730'); g.addColorStop(1, '#2a0f4f'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    const N = G.L.lanes, lw = W / N, hy = H * 0.84, fall = G.L.fall, pn = performance.now();
    // Sterne im Takt
    const beat = 60 / (G.chart.bpm || 100), pulse = 1 - ((t % beat) + beat) % beat / beat;
    cx.fillStyle = 'rgba(255,255,255,' + (0.05 + pulse * 0.05) + ')'; for (let i = 0; i < 40; i++) { const x = (i * 97.3) % W, y = (i * 53.1 + t * 12) % H; cx.fillRect(x, y, 2, 2); }
    for (let i = 0; i < N; i++) { cx.fillStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.06)'; cx.fillRect(i * lw, 0, lw, H);
      const fl = G.flash[i] ? Math.max(0, 1 - (pn - G.flash[i]) / 250) : 0; if (fl > 0 || G.held[i]) { const lg = cx.createLinearGradient(0, hy - 260, 0, hy); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, COLORS[i] + '66'); cx.globalAlpha = Math.max(fl, G.held[i] ? 0.5 : 0); cx.fillStyle = lg; cx.fillRect(i * lw, hy - 260, lw, 260); cx.globalAlpha = 1; } }
    // Tasten / Trefferlinie
    for (let i = 0; i < N; i++) { const x = i * lw; cx.fillStyle = G.held[i] ? COLORS[i] : 'rgba(255,255,255,.12)'; cx.beginPath(); cx.roundRect(x + 6, hy - 4, lw - 12, H - hy - 8, 14); cx.fill();
      cx.strokeStyle = COLORS[i]; cx.lineWidth = 3; cx.beginPath(); cx.arc(x + lw / 2, hy, Math.min(34, lw * 0.32), 0, 7); cx.stroke();
      if (SET.labels && !coarse() && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.7)'; cx.font = '600 15px Fredoka,system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(G.L.any ? '' : LABEL(KEYS[N][i]), x + lw / 2, hy + Math.min(56, (H - hy) / 2 + 6)); } }
    if (G.L.any && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.55)'; cx.font = '600 14px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText('Irgendwo tippen oder eine Taste drücken – im Takt der Lichter', W / 2, H - 14); }
    // Lichter
    const r = Math.min(30, lw * 0.3);
    for (const n of G.notes) {
      const dt = n.t - t; if (dt > fall + 0.2) break; if (n.hit && n.hit !== 'miss' && t - n.at > 0.12) continue; if (n.hit === 'miss' && dt < -0.5) continue;
      const x = (n.lane + 0.5) * lw, y = hy - dt / fall * hy, tail = Math.min(hy, n.d / fall * hy);
      if (n.d > 0.35 && n.hit === null) { cx.strokeStyle = COLORS[n.lane] + '55'; cx.lineWidth = r * 0.5; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x, y - tail); cx.stroke(); }
      cx.globalAlpha = n.hit === 'miss' ? 0.25 : 1; const rg = cx.createRadialGradient(x, y, 2, x, y, r * 1.6); rg.addColorStop(0, '#fff'); rg.addColorStop(0.35, COLORS[n.lane]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = rg; cx.beginPath(); cx.arc(x, y, r * 1.6, 0, 7); cx.fill(); cx.globalAlpha = 1;
    }
    // Funken und Texte
    for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i], a = (pn - f.t) / (f.txt ? 650 : 520); if (a >= 1) { G.fx.splice(i, 1); continue; }
      if (f.txt) { cx.globalAlpha = 1 - a; cx.fillStyle = f.c; cx.font = '700 20px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(f.txt, f.x, f.y - a * 40); cx.globalAlpha = 1; continue; }
      const s = a * 0.52; cx.globalAlpha = 1 - a; cx.fillStyle = f.c; cx.beginPath(); cx.arc(f.x + f.vx * s, f.y + f.vy * s + 200 * s * s, 3.5, 0, 7); cx.fill(); cx.globalAlpha = 1; }
    // Einzähler
    if (t < 0) { const n = Math.ceil(-t / (60 / (G.chart.bpm || 100))); if (n <= 4) { cx.fillStyle = '#fff'; cx.font = '700 64px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(n, W / 2, H * 0.42); } }
    // Kopfzeile
    $('gScore').textContent = G.st.score.toLocaleString('de-DE'); $('gCombo').textContent = G.st.combo > 4 ? G.st.combo + '× Combo' : '';
    $('gProg').style.width = Math.max(0, Math.min(100, t / G.len * 100)) + '%';
  }
  function pause() { if (!G.run) return; G.paused = true; P.ctx.suspend();
    overlay(`<h2>⏸️ Pause</h2><div class="col"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter</button><button class="btn nav" data-act="again">🔄 Neu starten</button><button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn nav" data-act="menu">☰ Hauptmenü</button></div>`,
      { esc: resume, go: resume, again: () => { closeOv(); P.ctx.resume(); stopGame(); start(G.chart, G.key); }, lib: () => { closeOv(); P.ctx.resume(); stopGame(); lib(libTab, listenMode); }, menu: () => { closeOv(); P.ctx.resume(); menu(); } }); }
  function resume() { closeOv(); P.ctx.resume(); G.paused = false; }
  $('bPause').onclick = pause;
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.run && !G.paused) pause(); });
  function finish() {
    G.run = false; cancelAnimationFrame(raf);
    const s = G.st, st = C.stars(s), acc = Math.round(C.accuracy(s) * 100);
    let rec = false;
    if (!G.auto) { const b = BEST[G.key]; if (!b || s.score > b.score) { BEST[G.key] = { score: s.score, stars: Math.max(st, b ? b.stars : 0), lvl: SET.level }; rec = !!b && s.score > 0; } else if (st > b.stars) b.stars = st; LS.set('best', BEST); LS.set('highscore', total()); }
    overlay(`<div class="res"><div class="stars">${G.auto ? '🎧' : '⭐'.repeat(st) + '<em>' + '☆'.repeat(3 - st) + '</em>'}</div><h2>${esc(G.chart.title)}</h2><p class="dim">${esc(G.chart.artist || '')}</p>
      ${G.auto ? '<p>Das war die Klavierfassung zum Zuhören. Jetzt selbst spielen?</p>' : `<div class="stats"><span><b>${s.score.toLocaleString('de-DE')}</b>Punkte</span><span><b>${acc} %</b>Genauigkeit</span><span><b>${s.max}</b>beste Combo</span></div>
      <p class="dim">Perfekt ${s.perfect} · Gut ${s.good} · Daneben ${s.miss}</p>${rec ? '<p class="rec">🏆 Neuer Rekord!</p>' : ''}`}
      <div class="row center"><button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn gold nav" data-act="again" data-focus>${G.auto ? '🎹 Selbst spielen' : '🔄 Nochmal'}</button></div></div>`,
      { esc: () => { closeOv(); lib(libTab, false); }, lib: () => { closeOv(); lib(libTab, false); }, again: () => { closeOv(); listenMode = false; start(G.chart, G.key); } });
  }

  /* ---------- Hilfe, Einstellungen ---------- */
  function help() { scr('sHelp'); $('helpBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>❓ So geht's</h2><span></span></header><div class="helpGrid">
    <div><h3>🎹 Spielen</h3><p>Lichter fallen von oben auf die Tasten zu. Tippe ein Licht genau dann, wenn es den Kreis erreicht – dann erklingt die Note. Bass und Begleitung spielen von selbst, du spielst die Melodie. Höhere Töne fallen weiter rechts, tiefere weiter links.</p></div>
    <div><h3>🟢🟡🔴 Schwierigkeit</h3><p><b>Leicht:</b> 4 Bahnen, weniger Noten, du kannst überall tippen – nur der Takt zählt. <b>Normal:</b> 5 Bahnen, die richtige Bahn treffen. <b>Profi:</b> 6 Bahnen, fast alle Noten, schnellere Lichter.</p></div>
    <div><h3>⭐ Wertung</h3><p>Perfekt = 100 Punkte, Gut = 60, eine lange Combo verdoppelt die Punkte. Ab 50 % Genauigkeit gibt es einen Stern, ab 75 % zwei, ab 92 % drei. Dein bestes Ergebnis je Lied wird gespeichert.</p></div>
    <div><h3>🌐 Online-Archiv</h3><p>Weitere Lieder werden erst beim Spielen geladen – nur Noten, ein paar Kilobyte. Die Lieder im Spiel gehen immer, auch ohne Internet. Alle Melodien sind gemeinfrei (Volkslieder und Komponisten, die vor über 70 Jahren gestorben sind).</p></div>
    <div><h3>🎮 Steuerung</h3><p><b>Touch/Maus:</b> auf die Bahn tippen. <b>Tastatur:</b> D F J K (Leicht), D F Leertaste J K (Normal), S D F J K L (Profi), Esc = Pause. <b>Controller:</b> LB X A Y RB (Normal), LT/RT für die äußeren Bahnen bei Profi, B = Pause.</p></div>
    </div>`; $('helpBox').querySelector('[data-back]').onclick = menu; }
  function opts() { overlay(`<h2>⚙️ Einstellungen</h2>
    <label class="lab2">Schwierigkeit<span class="row">${Object.keys(C.LEVELS).map(k => `<button class="chip nav${SET.level === k ? ' on' : ''}" data-act="lvl" data-k="${k}">${C.LEVELS[k].n}</button>`).join('')}</span></label>
    <label class="lab2">Lautstärke der Begleitung <input type="range" class="nav" id="oAcc" min="0" max="1.2" step="0.1" value="${SET.acc}"></label>
    <label class="tg nav"><input type="checkbox" id="oHelp"${SET.help ? ' checked' : ''}> 🎵 Verpasste Noten leise mitspielen (Lied bleibt hörbar)</label>
    <label class="tg nav"><input type="checkbox" id="oLab"${SET.labels ? ' checked' : ''}> ⌨️ Tasten auf den Bahnen anzeigen</label>
    <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
    { lvl: b => { SET.level = b.dataset.k; saveSet(); b.parentNode.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); },
      esc: () => { SET.acc = +$('oAcc').value; SET.help = $('oHelp').checked; SET.labels = $('oLab').checked; saveSet(); closeOv(); } }); }
  $('ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-back]'); if (b && !b.onclick) menu(); });
  $('bPress').onclick = () => { P.init(); menu(); };
  $('libBack').onclick = menu;

  /* ---------- Start ---------- */
  const tips = ['Die Tasten werden gestimmt …', 'Der Flügel wird poliert …', 'Die Lichter werden angezündet …', 'Noten werden sortiert …'];
  $('loadTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  let lp = 0; const lt = setInterval(() => { lp = Math.min(100, lp + 10 + Math.random() * 14); $('loadBar').style.width = lp + '%'; if (lp >= 100) { clearInterval(lt); setTimeout(() => { if (cur === 'sLoad') scr('sTitle'); }, 200); } }, 90);
  window.KLApp = { start, lib, menu, get game() { return G; }, builtin, laneHit, scr: () => cur, archiveBases: ARCH };
})();

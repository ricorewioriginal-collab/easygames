/* Klavierlicht – Oberfläche im Stil von Magic Piano / Piano Tiles: Laden, Titel, Konsolen-Menü (Spielmodi), Liederbuch mit
 * bunten Liedkarten (im Spiel + Online-Archiv), Medaillen-Auswahl (Leicht/Mittel/Schwer), Spiel als Kacheln oder Lichter,
 * Ergebnis mit Sternen und Kronen. Jedes Lied zeigt seine Rechte-Angabe. Speichern: klavierlicht-*, Gesamtpunkte als klavierlicht-highscore. */
(function () {
  'use strict';
  const C = KLCore, P = KLPiano, $ = id => document.getElementById(id), PX = 'klavierlicht-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(PX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(PX + k, JSON.stringify(v)); } catch (e) { /* voll/privat */ } } };
  const SET = Object.assign({ level: 'normal', acc: 0.8, help: true, labels: true, rate: 0.75 }, LS.get('settings', {})), saveSet = () => LS.set('settings', SET);
  const BEST = LS.get('best2', {});
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  // Online-Archiv: auf der Homepage relativ, in den Apps (ohne Archiv-Ordner) von der easygames-Homepage
  const PUB = (window.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/') + 'klavierlicht/archiv/';
  const ARCH = [new URL('archiv/', location.href).href, PUB].filter((v, i, a) => a.indexOf(v) === i);
  const LVL = Object.keys(C.LEVELS);
  let cur = 'sLoad', toastT = 0, archive = null, archBase = '', archTried = false, mode = 'klassisch', libCat = 'alle', libQ = '', song = null;
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
  const BACK = { sMenu: () => scr('sTitle'), sLib: () => menu(), sSong: () => lib(), sHelp: () => menu(), sGame: () => pause() };
  addEventListener('keydown', e => {
    const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type === 'search' || t.tagName === 'TEXTAREA');
    if (cur === 'sGame' && !ovOpen() && G.run) { if (gameKey(e, true)) { e.preventDefault(); return; } }
    if (e.code === 'Escape') { e.preventDefault(); if (ovOpen()) { if (ovEsc) ovEsc(); return; } if (typing) { t.blur(); return; } if (BACK[cur]) BACK[cur](); return; }
    if (typing) return;
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); P.init(); menu(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d && cur !== 'sGame') { e.preventDefault(); navMove(d[0], d[1]); }
  });
  addEventListener('keyup', e => { if (cur === 'sGame' && G.run) gameKey(e, false); });

  /* ---------- Menü: Spielmodi ---------- */
  const total = () => Object.values(BEST).reduce((a, b) => a + (b.score || 0), 0);
  const starsTotal = () => Object.values(BEST).reduce((a, b) => a + (b.stars || 0), 0);
  function menu() { stopGame(); scr('sMenu'); loadArchive(true);
    $('mStats').innerHTML = `<span>⭐ ${starsTotal()}</span><span>👑 ${Object.values(BEST).filter(b => b.crown).length}</span><span>🎵 ${total().toLocaleString('de-DE')}</span>`;
    const keys = ['klassisch', 'magie', 'endlos', 'ueben', 'tag', 'hoeren'];
    $('mList').innerHTML = keys.map((k, i) => { const M = C.MODES[k]; return `<button class="mi m-${k}${i ? '' : ' hero'}" data-go="${k}"><i>${M.ic}</i><b>${M.n}</b><small>${M.d}</small></button>`; }).join('') +
      `<div class="mRow"><button class="mi sm" data-go="help"><i>❓</i><b>So geht's</b></button><button class="mi sm" data-go="opts"><i>⚙️</i><b>Einstellungen</b></button></div>`;
    $('mList').querySelectorAll('.mi').forEach(b => { b.onclick = () => go(b.dataset.go); });
  }
  function go(g) {
    if (g === 'help') return help(); if (g === 'opts') return opts();
    mode = g; libQ = ''; $('libSearch').value = '';
    if (g === 'tag') { const all = allSongs(); const s = all[C.dailyIndex(all.length)]; song = s; return pick(s, 'normal'); }
    lib();
  }

  /* ---------- Lieder: im Spiel + Archiv ---------- */
  const builtinList = () => KLSongs.list.map(s => ({ id: s.id, title: s.title, artist: s.artist, cat: s.cat, lic: s.lic, src: 'Klaviersatz: easygames (eigene Notensetzung)', builtin: true, notation: s }));
  function allSongs() { const b = builtinList().map(s => Object.assign({ diff: C.difficulty(C.fromNotation(s.notation)), dur: C.duration(C.fromNotation(s.notation)) }, s)); return b.concat((archive || []).map(s => Object.assign({ online: true }, s))); }
  const skey = s => (s.builtin ? 'b:' : 'a:') + s.id;
  const bkey = (s, lvl) => mode + ':' + lvl + ':' + skey(s);
  async function loadArchive(quiet) {
    if (archive || archTried && quiet) return;
    archTried = true;
    for (const b of ARCH) {
      try { const r = await fetch(b + 'index.json', { cache: 'no-cache' }); if (!r.ok) continue; const j = await r.json(); if (!Array.isArray(j.songs)) continue; archive = j.songs; archBase = b; break; } catch (e) { /* nächste Adresse */ }
    }
    if (cur === 'sLib') renderLib();
  }
  const CAT_ART = { kinder: ['🧸', 'g-kinder'], weihnacht: ['🎄', 'g-weihnacht'], volk: ['🌍', 'g-volk'], klassik: ['🎻', 'g-klassik'], choral: ['⛪', 'g-choral'] };
  const LVLN = d => d <= 1 ? ['LEICHT', 'easy'] : d === 2 ? ['MITTEL', 'mid'] : ['SCHWER', 'hard'];
  function lib() { scr('sLib'); renderLib(); if (!archive) loadArchive(false); }
  function renderLib() {
    const M = C.MODES[mode]; $('libTitle').innerHTML = `${M.ic} ${M.n}`;
    const list0 = allSongs();
    $('libTabs').innerHTML = Object.keys(KLSongs.CATS).filter(k => k === 'alle' || list0.some(s => s.cat === k)).map(k => `<button class="chip nav${libCat === k ? ' on' : ''}" data-cat="${k}">${KLSongs.CATS[k]}</button>`).join('');
    $('libTabs').querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { libCat = b.dataset.cat; renderLib(); });
    const q = libQ.trim().toLowerCase();
    let list = list0; if (libCat !== 'alle') list = list.filter(s => s.cat === libCat);
    if (q) list = list.filter(s => (s.title + ' ' + s.artist + ' ' + (s.lic || '')).toLowerCase().includes(q));
    $('libCount').textContent = list.length + ' Lieder' + (archive ? '' : ' · 🌐 Archiv lädt …');
    $('libList').innerHTML = (list.length ? list.map(s => {
      const [art, g] = CAT_ART[s.cat] || ['🎵', 'g-volk'], [ln, lc] = LVLN(s.diff || 2), st = Math.max(0, ...LVL.map(l => (BEST[bkey(s, l)] || {}).stars || 0)), cr = LVL.some(l => (BEST[bkey(s, l)] || {}).crown);
      return `<button class="card nav ${g}" data-id="${esc(s.id)}" data-on="${s.online ? 1 : 0}">
        <span class="art"><i>${art}</i><em class="lv ${lc}">${ln}</em></span>
        <span class="tx"><b>${esc(s.title)}</b><small>${esc(s.artist)}${s.dur ? ' · ' + C.fmt(s.dur) : ''}${s.online ? ' · 🌐' : ''}</small><small class="lic">© ${esc(s.lic || '')}</small></span>
        <span class="rt"><span class="st">${cr ? '👑' : ''}${'★'.repeat(st)}<em>${'★'.repeat(3 - st)}</em></span><span class="play">${mode === 'hoeren' ? '▶ HÖREN' : '▶ PLAY'}</span></span></button>`; }).join('') : '<p class="empty">Nichts gefunden.</p>') +
      (archive ? '' : archTried ? '<p class="empty">📡 Das Online-Archiv ist gerade nicht erreichbar – die Lieder im Spiel gehen immer. <button class="btn sm nav" id="retry">🔄 Nochmal</button></p>' : '');
    $('libList').querySelectorAll('.card').forEach(b => b.onclick = () => { song = allSongs().find(x => x.id === b.dataset.id && (x.online ? 1 : 0) === +b.dataset.on); songScreen(); });
    const r = $('retry'); if (r) r.onclick = () => { archTried = false; loadArchive(false); renderLib(); };
  }
  $('libSearch').addEventListener('input', e => { libQ = e.target.value; renderLib(); });

  /* ---------- Lied: Medaillen (Leicht / Mittel / Schwer) ---------- */
  function songScreen() {
    if (mode === 'hoeren') return pick(song, 'normal');
    scr('sSong'); const M = C.MODES[mode];
    $('sgTitle').textContent = song.title; $('sgArtist').textContent = song.artist;
    $('sgMedals').innerHTML = LVL.map(l => { const b = BEST[bkey(song, l)] || {}, s = b.stars || 0;
      return `<button class="medal nav m-${C.LEVELS[l].medal}" data-l="${l}"${l === SET.level ? ' data-focus' : ''}><span class="coin"><i>${s >= 1 ? '★' : '☆'}</i><i>${s >= 2 ? '★' : '☆'}</i><i>${s >= 3 ? '★' : '☆'}</i>${b.crown ? '<u>👑</u>' : ''}</span><b>${C.LEVELS[l].n}</b><small>${b.score ? b.score.toLocaleString('de-DE') + ' Punkte' : 'noch nicht gespielt'}</small></button>`; }).join('');
    $('sgMedals').querySelectorAll('.medal').forEach(b => b.onclick = () => { SET.level = b.dataset.l; saveSet(); pick(song, b.dataset.l); });
    $('sgInfo').innerHTML = `<p class="md">${M.ic} ${M.n}</p><p>${M.d}</p>${M.practice ? `<label class="lab2">Tempo <b id="rateV">${Math.round(SET.rate * 100)} %</b><input type="range" class="nav" id="rate" min="0.5" max="1" step="0.05" value="${SET.rate}"></label>` : ''}
      <div class="copy"><b>©</b> ${esc(song.lic || '')}<br><small>${esc(song.src || '')}</small></div>`;
    const r = $('rate'); if (r) r.oninput = () => { SET.rate = +r.value; $('rateV').textContent = Math.round(SET.rate * 100) + ' %'; saveSet(); };
  }
  $('sgBack').onclick = () => lib();
  async function pick(s, level) {
    song = s;
    if (s.builtin) return start(C.fromNotation(s.notation), level);
    toast('🌐 Lied wird geladen …', 1500);
    try { const r = await fetch(archBase + encodeURIComponent(s.id) + '.json'); const c = await r.json(); if (!C.check(c)) throw new Error('Format'); start(c, level); }
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
  function start(chart, level) {
    if (!P.init()) { toast('Dein Browser kann keinen Ton erzeugen.'); return; }
    const M = C.MODES[mode], L0 = C.LEVELS[M.auto ? 'normal' : level];
    const tiles = M.view === 'tiles', lanes = tiles ? 4 : L0.lanes;
    const L = Object.assign({}, L0, { lanes, any: tiles ? false : L0.any, fall: tiles ? L0.fall * 0.95 : L0.fall });
    const rate = M.practice ? SET.rate : 1, ch = rate !== 1 ? C.withRate(chart, rate) : chart;
    Object.assign(G, { chart, ch, level, M, L, tiles, rate, round: 1, lives: M.lives, notes: C.playable(ch, M.auto ? 'normal' : level, lanes), acc: C.accompaniment(ch), ai: 0, st: C.newState(), auto: !!M.auto, run: true, paused: false, fx: [], held: {}, flash: {}, wrong: 0, msg: null, over: false, word: null });
    G.len = C.duration(ch) + 1.2; G.t0 = P.ctx.currentTime + 2.2;
    scr('sGame'); resize(); bgKey = ''; $('gTitle').textContent = chart.title; $('gLic').textContent = '© ' + (chart.lic || song && song.lic || ''); $('gMode').textContent = M.ic + ' ' + M.n + (M.auto ? '' : ' · ' + C.LEVELS[level].n) + (rate !== 1 ? ' · ' + Math.round(rate * 100) + ' %' : '');
    document.body.dataset.view = G.tiles ? 'tiles' : 'lights';
    const beat = 60 / (ch.bpm || 100); for (let i = 0; i < 4; i++) P.note(84, G.t0 - (4 - i) * beat, 0.08, i ? 0.22 : 0.32);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stopGame() { G.run = false; cancelAnimationFrame(raf); P.stopAll(); }
  const now = () => P.ctx.currentTime - G.t0;
  function nextRound() {   // Endlos: gleiches Lied, 10 % schneller
    G.round++; G.rate = Math.min(2, G.rate * 1.1); G.ch = C.withRate(G.chart, G.rate);
    G.notes = C.playable(G.ch, G.level, G.L.lanes); G.acc = C.accompaniment(G.ch); G.ai = 0; G.len = C.duration(G.ch) + 1.2; G.t0 = P.ctx.currentTime + 1.2;
    G.msg = { t: performance.now(), txt: 'Runde ' + G.round + ' · ' + Math.round(G.rate * 100) + ' %' };
  }
  function loseLife() {
    if (!G.M.lives) return; G.lives--; G.wrong = performance.now();
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { /* egal */ }
    if (G.lives <= 0) { G.over = true; G.run = false; setTimeout(finish, 450); }
  }
  function frame() {
    if (!G.run) return; raf = requestAnimationFrame(frame); if (G.paused) return;
    const t = now();
    while (G.ai < G.acc.length && G.acc[G.ai][0] < t + 0.3) { const [at, p, d, v] = G.acc[G.ai++]; if (at > t - 0.05) P.note(p, G.t0 + at, d, v * SET.acc); }
    for (const n of G.notes) {
      if (n.hit !== null) continue;
      if (G.auto) { if (n.t < t + 0.25) { P.note(n.p, G.t0 + n.t, n.d, 0.75); n.hit = 'perfect'; n.at = n.t; C.scoreHit(G.st, 'perfect'); setTimeout(() => burst(n, 'perfect'), Math.max(0, (n.t - t) * 1000)); } continue; }
      if (n.t < t - C.WIN.good) { n.hit = 'miss'; n.at = t; C.scoreHit(G.st, null); if (SET.help || !G.M.lives) P.note(n.p, G.t0 + n.t + 0.01, n.d, 0.16); loseLife(); if (!G.run) break; }
      if (n.t > t + 3) break;
    }
    if (G.run) draw(t);
    if (G.run && t > G.len) { if (G.M.loop) nextRound(); else finish(); }
  }
  function laneHit(lane) {
    if (!G.run || G.paused || G.auto) return;
    const t = now(); G.flash[lane] = performance.now();
    let best = null, bd = 9;
    for (const n of G.notes) { if (n.hit !== null) continue; if (n.t > t + C.WIN.good) break; const d = Math.abs(n.t - t); if ((G.L.any || n.lane === lane) && d < bd) { bd = d; best = n; } }
    if (!best) {
      // Kachel-Modi: ins Leere getippt = Fehler (kommt die Kachel gleich, war es bloß zu früh)
      if (G.tiles && t > 0) { const soon = G.notes.find(n => n.hit === null && n.lane === lane && n.t - t < 0.35); if (!soon) { G.fx.push({ wrongLane: lane, t: performance.now() }); P.note(40, 0, 0.15, 0.15); loseLife(); } }
      return;
    }
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
  const WORD = { perfect: ['PERFEKT', '#fff'], good: ['GUT', '#fff3b0'] };
  function burst(n, kind) { const lw = W / G.L.lanes, y = H * (G.tiles ? 0.8 : 0.84); for (let i = 0; i < (kind === 'perfect' ? 12 : 7); i++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 150; G.fx.push({ x: (n.lane + 0.5) * lw, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, c: G.tiles ? '#dff' : COLORS[n.lane], t: performance.now() }); }
    G.word = { k: kind || 'miss', t: performance.now() }; }
  // Hintergrund: Farbverlauf Pink–Lila–Blau mit Lichtkreisen (Bokeh), einmal vorgezeichnet
  let bg = null, bgKey = '';
  function background() {
    const k = W + 'x' + H + (G.tiles ? 't' : 'l'); if (bgKey === k) return bg; bgKey = k;
    bg = document.createElement('canvas'); bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr); const g = bg.getContext('2d'); g.scale(dpr, dpr);
    const lg = g.createLinearGradient(0, 0, W, H); if (G.tiles) { lg.addColorStop(0, '#ff7ad9'); lg.addColorStop(0.45, '#a77bff'); lg.addColorStop(1, '#4fc8ff'); } else { lg.addColorStop(0, '#2a0f5e'); lg.addColorStop(0.6, '#5b1f9e'); lg.addColorStop(1, '#c2368f'); }
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = (i * 137.5) % W, y = (i * 89.3) % H, r = 14 + (i * 7) % 46, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(255,255,255,.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    return bg;
  }
  function draw(t) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(background(), 0, 0); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (G.tiles) drawTiles(t); else drawLights(t);
    const pn = performance.now();
    for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i], a = (pn - f.t) / 520; if (a >= 1) { G.fx.splice(i, 1); continue; }
      if (f.wrongLane != null) { const lw = W / G.L.lanes; cx.fillStyle = 'rgba(255,40,70,' + (0.55 * (1 - a)) + ')'; cx.fillRect(f.wrongLane * lw, 0, lw, H); continue; }
      const s = a * 0.52; cx.globalAlpha = 1 - a; cx.fillStyle = f.c; cx.beginPath(); cx.arc(f.x + f.vx * s, f.y + f.vy * s + 200 * s * s, 3.5, 0, 7); cx.fill(); cx.globalAlpha = 1; }
    if (G.word) { const a = (pn - G.word.t) / 600; if (a < 1 && G.word.k !== 'miss') { const [w, c] = WORD[G.word.k]; cx.globalAlpha = 1 - a * a; cx.fillStyle = c; cx.font = '800 ' + Math.round(26 + 8 * (1 - a)) + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(80,0,120,.6)'; cx.shadowBlur = 12; cx.fillText(w, W / 2, H * 0.22); cx.shadowBlur = 0; cx.globalAlpha = 1; } }
    if (G.msg) { const a = (pn - G.msg.t) / 1800; if (a < 1) { cx.globalAlpha = 1 - a; cx.fillStyle = '#fff'; cx.font = '700 24px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(G.msg.txt, W / 2, H * 0.32); cx.globalAlpha = 1; } }
    if (G.wrong && pn - G.wrong < 300) { cx.strokeStyle = 'rgba(255,40,70,' + (1 - (pn - G.wrong) / 300) + ')'; cx.lineWidth = 10; cx.strokeRect(5, 5, W - 10, H - 10); }
    if (t < 0) { const n = Math.ceil(-t / (60 / (G.ch.bpm || 100))); if (n <= 4) { cx.fillStyle = '#fff'; cx.font = '800 72px Fredoka,system-ui'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(80,0,120,.6)'; cx.shadowBlur = 16; cx.fillText(n, W / 2, H * 0.45); cx.shadowBlur = 0; } }
    $('gScore').textContent = G.st.score.toLocaleString('de-DE'); $('gCombo').textContent = G.st.combo > 4 ? '×' + G.st.combo : '';
    $('gProg').style.width = Math.max(0, Math.min(1, t / G.len)) * 100 + '%';
    const stp = G.st.perfect + G.st.good + G.st.miss ? C.stars(G.st) : 0; $('gStars').innerHTML = [1, 2, 3].map(i => `<i class="${stp >= i ? 'on' : ''}">★</i>`).join('');
    $('gLives').innerHTML = G.M.lives ? '❤'.repeat(Math.max(0, G.lives)) + '<em>' + '❤'.repeat(Math.max(0, G.M.lives - G.lives)) + '</em>' : '';
    $('gRound').textContent = G.M.loop ? 'Runde ' + G.round : '';
  }
  // Kacheln (Piano-Tiles-Art): schwarz-blaue Kacheln, lange Töne als lange Kachel mit Linie und Kreis, kurze mit Raute
  function drawTiles(t) {
    const N = G.L.lanes, lw = W / N, hy = H * 0.8, speed = hy / G.L.fall, pn = performance.now();
    cx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 1; i < N; i++) cx.fillRect(Math.round(i * lw), 0, 1, H);
    cx.fillStyle = 'rgba(255,255,255,.75)'; cx.fillRect(0, hy - 1, W, 2);
    for (let i = 0; i < N; i++) { const fl = G.flash[i] ? Math.max(0, 1 - (pn - G.flash[i]) / 220) : 0; if (fl > 0 || G.held[i]) { cx.fillStyle = 'rgba(255,255,255,' + (Math.max(fl, G.held[i] ? 0.4 : 0) * 0.35) + ')'; cx.fillRect(i * lw, 0, lw, H); } }
    for (const n of G.notes) {
      const dt = n.t - t; if (dt > G.L.fall + 0.3) break;
      const bottom = hy - dt * speed + 18, h = Math.max(H * 0.17, n.d * speed), top = bottom - h, x = n.lane * lw + 1, w = lw - 2;
      if (top > H) continue;
      if (n.hit && n.hit !== 'miss') { const a = Math.max(0, 1 - (t - n.at) / 0.35); if (a <= 0) continue; cx.fillStyle = 'rgba(200,245,255,' + (0.5 * a) + ')'; cx.fillRect(x, top, w, h); continue; }
      const g = cx.createLinearGradient(0, top, 0, bottom); if (n.hit === 'miss') { g.addColorStop(0, '#ff6a8a'); g.addColorStop(1, '#a8143c'); } else { g.addColorStop(0, '#1d9bff'); g.addColorStop(0.55, '#0b1f4d'); g.addColorStop(1, '#050812'); }
      cx.fillStyle = g; cx.fillRect(x, top, w, h);
      const cxm = x + w / 2;
      if (n.d * speed > H * 0.2) { cx.strokeStyle = 'rgba(160,230,255,.85)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(cxm, top + 14); cx.lineTo(cxm, bottom - 32); cx.stroke(); cx.beginPath(); cx.arc(cxm, bottom - 22, 9, 0, 7); cx.stroke(); }
      else { cx.save(); cx.translate(cxm, bottom - 26); cx.rotate(Math.PI / 4); cx.strokeStyle = '#7ff3ff'; cx.lineWidth = 2; cx.strokeRect(-7, -7, 14, 14); cx.restore(); }
    }
    if (!coarse() && SET.labels && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.8)'; cx.font = '600 15px Fredoka,system-ui'; cx.textAlign = 'center'; for (let i = 0; i < N; i++) cx.fillText(LABEL(KEYS[N][i]), (i + 0.5) * lw, H - 16); }
  }
  // Lichter (Magic-Piano-Art)
  function drawLights(t) {
    const N = G.L.lanes, lw = W / N, hy = H * 0.84, fall = G.L.fall, pn = performance.now();
    for (let i = 0; i < N; i++) { cx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; cx.fillRect(i * lw, 0, lw, H);
      const fl = G.flash[i] ? Math.max(0, 1 - (pn - G.flash[i]) / 250) : 0; if (fl > 0 || G.held[i]) { const lg = cx.createLinearGradient(0, hy - 260, 0, hy); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, COLORS[i] + '66'); cx.globalAlpha = Math.max(fl, G.held[i] ? 0.5 : 0); cx.fillStyle = lg; cx.fillRect(i * lw, hy - 260, lw, 260); cx.globalAlpha = 1; } }
    for (let i = 0; i < N; i++) { const x = i * lw; cx.fillStyle = G.held[i] ? COLORS[i] : 'rgba(255,255,255,.12)'; cx.beginPath(); cx.roundRect(x + 6, hy - 4, lw - 12, H - hy - 8, 14); cx.fill();
      cx.strokeStyle = COLORS[i]; cx.lineWidth = 3; cx.beginPath(); cx.arc(x + lw / 2, hy, Math.min(34, lw * 0.32), 0, 7); cx.stroke();
      if (SET.labels && !coarse() && !G.auto && !G.L.any) { cx.fillStyle = 'rgba(255,255,255,.7)'; cx.font = '600 15px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(LABEL(KEYS[N][i]), x + lw / 2, hy + Math.min(56, (H - hy) / 2 + 6)); } }
    if (G.L.any && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.6)'; cx.font = '600 14px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText('Irgendwo tippen – im Takt der Lichter', W / 2, H - 14); }
    const r = Math.min(30, lw * 0.3);
    for (const n of G.notes) {
      const dt = n.t - t; if (dt > fall + 0.2) break; if (n.hit && n.hit !== 'miss' && t - n.at > 0.12) continue; if (n.hit === 'miss' && dt < -0.5) continue;
      const x = (n.lane + 0.5) * lw, y = hy - dt / fall * hy, tail = Math.min(hy, n.d / fall * hy);
      if (n.d > 0.35 && n.hit === null) { cx.strokeStyle = COLORS[n.lane] + '55'; cx.lineWidth = r * 0.5; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x, y - tail); cx.stroke(); }
      cx.globalAlpha = n.hit === 'miss' ? 0.25 : 1; const rg = cx.createRadialGradient(x, y, 2, x, y, r * 1.6); rg.addColorStop(0, '#fff'); rg.addColorStop(0.35, COLORS[n.lane]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = rg; cx.beginPath(); cx.arc(x, y, r * 1.6, 0, 7); cx.fill(); cx.globalAlpha = 1;
    }
  }
  function pause() { if (!G.run) return; G.paused = true; P.ctx.suspend();
    overlay(`<h2>⏸️ Pause</h2><p class="dim">${esc(G.chart.title)}</p><p class="copy small">© ${esc(G.chart.lic || '')}</p><div class="col"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter</button><button class="btn nav" data-act="again">🔄 Neu starten</button><button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn nav" data-act="menu">☰ Hauptmenü</button></div>`,
      { esc: resume, go: resume, again: () => { closeOv(); P.ctx.resume(); stopGame(); start(G.chart, G.level); }, lib: () => { closeOv(); P.ctx.resume(); stopGame(); lib(); }, menu: () => { closeOv(); P.ctx.resume(); menu(); } }); }
  function resume() { closeOv(); P.ctx.resume(); G.paused = false; }
  $('bPause').onclick = pause;
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.run && !G.paused) pause(); });
  function finish() {
    G.run = false; cancelAnimationFrame(raf); setTimeout(() => P.stopAll(), 600);
    const s = G.st, acc = Math.round(C.accuracy(s) * 100), lost = G.over && !G.M.loop, st = lost ? 0 : C.stars(s), crown = !lost && !G.auto && s.miss === 0 && s.good === 0 && s.perfect > 0;
    let rec = false;
    if (!G.auto && song) { const k = bkey(song, G.level), b = BEST[k]; if (!b || s.score > b.score) { rec = !!b && s.score > 0; BEST[k] = { score: s.score, stars: Math.max(st, b ? b.stars : 0), crown: crown || !!(b && b.crown) }; } else { b.stars = Math.max(b.stars, st); b.crown = b.crown || crown; } LS.set('best2', BEST); LS.set('highscore', total()); }
    const head = G.auto ? '🎧' : lost ? '💔' : (crown ? '👑' : '') + '★'.repeat(st) + '<em>' + '★'.repeat(3 - st) + '</em>';
    overlay(`<div class="res"><div class="stars">${head}</div><h2>${lost ? 'Leider daneben!' : esc(G.chart.title)}</h2><p class="dim">${esc(G.chart.title)} · ${esc(G.M.n)}${G.auto ? '' : ' · ' + C.LEVELS[G.level].n}${G.M.loop ? ' · Runde ' + G.round : ''}</p>
      ${G.auto ? '<p>Das war die Klavierfassung zum Zuhören. Jetzt selbst spielen?</p>' : `<div class="stats"><span><b>${s.score.toLocaleString('de-DE')}</b>Punkte</span><span><b>${acc} %</b>Genauigkeit</span><span><b>${s.max}</b>beste Combo</span></div>
      <p class="dim">Perfekt ${s.perfect} · Gut ${s.good} · Daneben ${s.miss}</p>${rec ? '<p class="rec">🏆 Neuer Rekord!</p>' : ''}${crown ? '<p class="rec">👑 Fehlerfrei – Krone!</p>' : ''}`}
      <p class="copy small">© ${esc(G.chart.lic || '')}<br>${esc(G.chart.src || '')}</p>
      <div class="row center"><button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn gold nav" data-act="again" data-focus>${G.auto ? '🎹 Selbst spielen' : '🔄 Nochmal'}</button></div></div>`,
      { esc: () => { closeOv(); lib(); }, lib: () => { closeOv(); lib(); }, again: () => { closeOv(); if (G.auto) { mode = 'klassisch'; songScreen(); } else start(G.chart, G.level); } });
  }

  /* ---------- Hilfe, Einstellungen ---------- */
  function help() { scr('sHelp'); $('helpBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>❓ So geht's</h2><span></span></header><div class="helpGrid">
    <div><h3>🎹 Klassisch</h3><p>Schwarze Kacheln fallen auf vier Bahnen nach unten. Tippe jede Kachel, wenn sie die weiße Linie erreicht – dann erklingt der Ton, Bass und Begleitung spielen von selbst. Wer ins Leere tippt oder eine Kachel verpasst, verliert ein Herz. Nach drei Fehlern ist das Lied vorbei.</p></div>
    <div><h3>✨ Magie</h3><p>Leuchtende Lichter wie bei Magic Piano – höhere Töne weiter rechts, tiefere links. Entspannt spielen, ohne Verlieren. Auf Leicht kannst du überall tippen, nur der Takt zählt.</p></div>
    <div><h3>♾️ Endlos · 🧘 Üben · 🏆 Tages-Challenge</h3><p><b>Endlos:</b> Das Lied wiederholt sich und wird jede Runde 10 % schneller. <b>Üben:</b> keine Herzen, Tempo 50–100 %. <b>Tages-Challenge:</b> jeden Tag ein anderes Lied auf Mittel.</p></div>
    <div><h3>🥉🥈🥇 Schwierigkeit</h3><p><b>Leicht</b> (Bronze): weniger Noten, langsamer. <b>Mittel</b> (Silber). <b>Schwer</b> (Gold): fast alle Noten, schneller.</p></div>
    <div><h3>⭐ Sterne und Kronen</h3><p>Perfekt = 100 Punkte, Gut = 60, lange Combos verdoppeln. Ab 50 % Genauigkeit ein Stern, ab 75 % zwei, ab 92 % drei. Ganz ohne Fehler gibt es die 👑 Krone.</p></div>
    <div><h3>© Lieder und Rechte</h3><p>Alle Melodien sind gemeinfrei: Volks-, Kinder- und Weihnachtslieder sowie Werke von Komponisten, die vor über 70 Jahren gestorben sind. Jedes Lied zeigt Komponist, Lebensdaten und Notenvorlage. Klaviersatz: easygames. Viele Lieder liegen im Online-Archiv und werden erst beim Spielen geladen.</p></div>
    <div><h3>🎮 Steuerung</h3><p><b>Touch/Maus:</b> auf die Bahn tippen. <b>Tastatur:</b> D F J K (4 Bahnen), D F Leertaste J K (5), S D F J K L (6), Esc = Pause. <b>Controller:</b> LB X Y RB (4 Bahnen), A = Mitte, LT/RT außen, B = Pause.</p></div>
    </div>`; $('helpBox').querySelector('[data-back]').onclick = menu; }
  function opts() { overlay(`<h2>⚙️ Einstellungen</h2>
    <label class="lab2">Lautstärke der Begleitung <input type="range" class="nav" id="oAcc" min="0" max="1.2" step="0.1" value="${SET.acc}"></label>
    <label class="tg nav"><input type="checkbox" id="oHelp"${SET.help ? ' checked' : ''}> 🎵 Verpasste Noten leise mitspielen (Lied bleibt hörbar)</label>
    <label class="tg nav"><input type="checkbox" id="oLab"${SET.labels ? ' checked' : ''}> ⌨️ Tasten auf den Bahnen anzeigen</label>
    <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
    { esc: () => { SET.acc = +$('oAcc').value; SET.help = $('oHelp').checked; SET.labels = $('oLab').checked; saveSet(); closeOv(); } }); }
  $('ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-back]'); if (b && !b.onclick) menu(); });
  $('bPress').onclick = () => { P.init(); menu(); };
  $('libBack').onclick = menu;

  /* ---------- Start ---------- */
  const tips = ['Die Tasten werden gestimmt …', 'Der Flügel wird poliert …', 'Die Lichter werden angezündet …', 'Noten werden sortiert …'];
  $('loadTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  let lp = 0; const lt = setInterval(() => { lp = Math.min(100, lp + 10 + Math.random() * 14); $('loadBar').style.width = lp + '%'; if (lp >= 100) { clearInterval(lt); setTimeout(() => { if (cur === 'sLoad') scr('sTitle'); }, 200); } }, 90);
  window.KLApp = { start, lib, menu, go, songScreen, pick, get game() { return G; }, get song() { return song; }, allSongs, laneHit, scr: () => cur, setMode(m) { mode = m; }, archiveBases: ARCH, get archive() { return archive; } };
})();

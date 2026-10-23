/* Wortgitter – Oberfläche, Eingabe (Wischen, Tippen, Tastatur, Gamecontroller über ../gamepad.js) und Online-Runden */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const COLORS = ['#00E5FF', '#FF2D95', '#FFC94D', '#2EE6A0', '#8B5CF6', '#FF9A1F'];
  const BOTS = ['Rita Radio', 'DJ Bit', 'Funky Fred', 'Lexi Loop'];
  const BOTRATE = { leicht: .12, mittel: .22, schwer: .35 }; // Anteil der bekannten Wörter, die ein Computer findet
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const SET = Object.assign({ sound: true, zen: false }, LS.get('wortgitter-settings', {}));
  const saveSet = () => LS.set('wortgitter-settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0;
  function toast(m, cls) { const t = $('toast'); t.textContent = m; t.className = 'toast' + (cls ? ' ' + cls : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }

  /* ---------- Wörterbuch (gemeinsam mit Wortfunk) ---------- */
  let dict = null, common = null;
  const get = u => fetch(u).then(r => { if (!r.ok) throw new Error('http'); return r.arrayBuffer(); });
  Promise.all([get('../wortfunk/data/woerter.dawg'), get('../wortfunk/data/bekannt.dawg').catch(() => null)]).then(([a, b]) => {
    dict = WF.Dict(new Uint32Array(a)); if (b) common = WF.Dict(new Uint32Array(b));
    $('loadInfo').hidden = true; onReady();
  }).catch(() => { $('loadInfo').textContent = 'Das Wörterbuch konnte nicht geladen werden. Bitte prüfe die Verbindung und lade die Seite neu.'; });

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(kind, n) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      const seqs = { step: [[400 + (n || 0) * 60, .045]], ok: [[523, .07], [659, .07], [784, .12]], bad: [[220, .1], [165, .14]], dup: [[600, .06], [600, .06]],
        big: [[523, .07], [659, .07], [784, .07], [1047, .22]], end: [[784, .1], [659, .1], [523, .25]], tick: [[1200, .03]] };
      let t = AC.currentTime;
      for (const [f, d] of seqs[kind] || []) {
        const o = AC.createOscillator(), g = AC.createGain(); o.type = kind === 'bad' ? 'square' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.1, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
      }
    } catch (e) { }
  }

  /* ---------- Zustand ---------- */
  const S = { mode: '', game: null, found: [], foundSet: new Set(), score: 0, path: [], cur: 0, kbd: false, typed: [], endAt: 0, running: false, timer: 0, day: false,
    net: null, players: [], unique: true, total: {}, round: 0, gameId: 0 };
  const scr = id => { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); if (id === 'sGame') fit(); };
  const curScr = () => (document.querySelector('.scr.on') || {}).id;
  const openOv = id => { $(id).hidden = false; setTimeout(() => focusFirst($(id)), 30); };
  const closeOv = id => { $(id).hidden = true; };
  const ovOpen = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);

  /* ---------- Gitter darstellen ---------- */
  let cells = [];
  function buildGrid() {
    const g = S.game, el = $('grid'); el.style.setProperty('--n', g.n); el.innerHTML = '';
    cells = g.grid.map((c, i) => { const d = document.createElement('div'); d.className = 'gc'; d.dataset.i = i; d.innerHTML = WF.ch(c) + '<i>' + WF.VAL[c] + '</i>'; el.appendChild(d); return d; });
    fit();
  }
  function fit() {
    const w = $('gridWrap'); if (!w.clientWidth || !S.game) return;
    const n = S.game.n, W = w.clientWidth - 12, H = w.clientHeight - 12, side = Math.min(W, H);
    // Gitterbreite = n·c + (n−1)·0,1c + 2·0,14c
    const c = Math.max(34, Math.min(120, Math.floor(side / (n + (n - 1) * .1 + .28))));
    document.documentElement.style.setProperty('--cell', c + 'px');
    drawTrail();
  }
  addEventListener('resize', () => { if (curScr() === 'sGame') fit(); });
  function render() {
    const on = new Set(S.path), head = S.path[S.path.length - 1];
    cells.forEach((d, i) => { d.classList.toggle('on', on.has(i)); d.classList.toggle('head', i === head); d.classList.toggle('cur', S.kbd && i === S.cur && S.running && canPlay()); });
    const w = S.path.map(i => WF.ch(S.game.grid[i])).join('');
    const word = $('word'); if (!word.dataset.hold) { $('wordTxt').textContent = w || (canPlay() && !S.found.length ? 'Wische über die Buchstaben' : '\u00a0'); word.className = 'word' + (w ? ' live' : (canPlay() && !S.found.length ? ' idle' : '')); }
    drawTrail();
  }
  function drawTrail() {
    const svg = $('trail'), line = $('trailLine');
    if (!S.path.length || !cells.length) { line.setAttribute('points', ''); return; }
    const box = svg.getBoundingClientRect();
    line.setAttribute('points', S.path.map(i => { const r = cells[i].getBoundingClientRect(); return (r.left + r.width / 2 - box.left) + ',' + (r.top + r.height / 2 - box.top); }).join(' '));
    line.style.strokeWidth = Math.max(6, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) || 60) * .16) + 'px';
  }
  function feedback(kind, text) {
    const word = $('word'); word.dataset.hold = '1'; word.className = 'word ' + kind; $('wordTxt').textContent = text;
    const cls = 'flash-' + (kind === 'ok' ? 'ok' : kind === 'dup' ? 'dup' : 'bad'), p = S.path.slice();
    p.forEach(i => cells[i].classList.add(cls));
    setTimeout(() => { p.forEach(i => cells[i] && cells[i].classList.remove(cls)); delete word.dataset.hold; render(); }, 650);
  }
  function renderFound(newW) {
    $('score').textContent = S.score; $('count').textContent = S.found.length + (S.found.length === 1 ? ' Wort' : ' Wörter');
    $('found').innerHTML = S.found.slice().reverse().map(w => '<span' + (w === newW ? ' class="new"' : '') + '>' + esc(w) + '</span>').join('');
  }

  /* ---------- Spielablauf ---------- */
  const canPlay = () => S.running && S.mode !== 'tv';
  function startRound(level, seed, opt) {
    opt = opt || {};
    S.gameId++; S.game = WG.make(level, seed, dict); S.found = []; S.foundSet = new Set(); S.score = 0; S.path = []; S.typed = [];
    S.cur = Math.floor(S.game.n * S.game.n / 2); S.day = !!opt.day;
    const zen = SET.zen && !opt.day && !opt.online;
    S.endAt = zen ? 0 : Date.now() + (opt.dur || S.game.time) * 1000;
    S.running = true;
    $('aDone').hidden = !zen; $('controls').classList.toggle('two', !zen); $('controls').hidden = S.mode === 'tv'; $('grid').classList.toggle('off', S.mode === 'tv');
    $('players').hidden = !(S.mode === 'host' || S.mode === 'guest' || S.mode === 'tv');
    ['ovEnd', 'ovMenu'].forEach(closeOv);
    scr('sGame'); buildGrid(); renderFound(); render(); renderPlayers();
    clearInterval(S.timer); S.timer = setInterval(tick, 250); tick();
  }
  function tick() {
    const el = $('tTxt'), bar = $('tBar'), t = $('tBar').parentNode;
    if (!S.endAt) { el.textContent = '∞ Zen'; bar.style.width = '100%'; t.classList.remove('low'); return; }
    const left = Math.max(0, S.endAt - Date.now()), tot = S.game.time * 1000;
    const s = Math.ceil(left / 1000); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    bar.style.width = Math.min(100, left / tot * 100) + '%'; t.classList.toggle('low', left < 15000);
    if (left < 10500 && left > 0 && s !== tick.last) { tick.last = s; sfx('tick'); }
    if (left <= 0 && S.running) finish();
  }
  function submit() {
    if (!canPlay() || !S.path.length) return;
    const r = WG.check(S.game, S.path, S.foundSet, dict);
    if (r.res === 'ok') {
      S.found.push(r.w); S.foundSet.add(r.w); S.score += r.pts;
      feedback('ok', r.w + ' +' + r.pts); sfx(r.pts >= 5 ? 'big' : 'ok'); renderFound(r.w);
      if (S.mode === 'guest') S.net.send({ t: 'n', n: S.found.length });
      if (S.mode === 'host') { const me = S.players.find(p => p.kind === 'host'); if (me) me.n = S.found.length; renderPlayers(); sendPlayers(); }
    } else if (r.res === 'doppelt') { feedback('dup', r.w + ' – hast du schon'); sfx('dup'); }
    else if (r.res === 'kurz') { feedback('bad', 'mindestens ' + S.game.min + ' Buchstaben'); sfx('bad'); }
    else if (r.res === 'unbekannt') { feedback('bad', r.w + ' – kenne ich nicht'); sfx('bad'); }
    S.path = []; S.typed = [];
    setTimeout(render, 0);
  }
  function clearPath() { S.path = []; S.typed = []; render(); }
  function finish() {
    if (!S.running) return;
    S.running = false; clearInterval(S.timer); S.path = []; render(); sfx('end');
    if (S.mode === 'guest') { S.net.send({ t: 'words', list: S.found }); showWait(); return; }
    if (S.mode === 'host' || S.mode === 'tv') { hostCollect(); return; }
    showSolo();
  }
  function missed() { // nicht gefundene Wörter: erst bekannte, lange zuerst
    const all = Array.from(S.game.words.keys()).filter(w => !S.foundSet.has(w));
    const known = w => common && common.hasWord(w);
    return all.sort((a, b) => (known(b) - known(a)) || (b.length - a.length) || a.localeCompare(b, 'de'));
  }
  function wl(words, longMin) { return words.map(w => '<span' + (Array.from(w).length >= longMin ? ' class="long"' : '') + '>' + esc(w) + '</span>').join('') || '<span>–</span>'; }
  function showSolo() {
    const g = S.game, L = WG.LEVELS[g.level], tot = Array.from(g.words.keys()).reduce((s, w) => s + WG.points(Array.from(w).length), 0);
    const st = LS.get('wortgitter-stats', { best: {}, games: 0, words: 0 });
    st.games++; st.words += S.found.length;
    const rec = S.score > (st.best[g.level] || 0); if (rec) st.best[g.level] = S.score;
    if (S.day) { const d = WG.daySeed(); if (!st.day || st.day.seed !== d) st.day = { seed: d, score: S.score, n: S.found.length }; else if (S.score > st.day.score) st.day = { seed: d, score: S.score, n: S.found.length }; }
    LS.set('wortgitter-stats', st);
    $('endTitle').textContent = (S.day ? '📅 Tagesgitter · ' : '') + L.label + ' ' + L.name + (rec && S.score ? ' – neuer Rekord! 🏆' : '');
    $('endScore').textContent = S.score + ' Punkte';
    $('endRank').innerHTML = '<li><span>Gefunden</span><span><b>' + S.found.length + '</b> von ' + g.words.size + ' Wörtern</span></li><li><span>Möglich</span><span>' + tot + ' Punkte</span></li>';
    $('endFoundH').hidden = false; $('endFound').innerHTML = wl(S.found.slice().sort((a, b) => b.length - a.length), 7);
    const m = missed(); $('endMissH').textContent = 'Nicht gefunden (' + m.length + ')'; $('endMiss').innerHTML = wl(m.slice(0, 80), 7) + (m.length > 80 ? '<span>… und ' + (m.length - 80) + ' weitere</span>' : '');
    $('endMissH').hidden = false; $('endMiss').hidden = false;
    $('bEndAgain').hidden = false; $('bEndAgain').textContent = S.day ? 'Neues Gitter ▶' : 'Nochmal ▶';
    openOv('ovEnd'); menuStat();
  }
  $('bEndAgain').onclick = () => {
    closeOv('ovEnd');
    if (S.mode === 'host' || S.mode === 'tv') { hostRound(); return; }
    startRound(S.day ? 'mittel' : S.game.level, (Math.random() * 4294967296) >>> 0);
  };
  $('bEndMenu').onclick = () => quit();
  function quit() {
    S.running = false; S.gameId++; clearInterval(S.timer);
    ['ovEnd', 'ovMenu'].forEach(closeOv);
    if (S.net) { if (S.mode === 'host' || S.mode === 'tv' || S.mode === 'lobby') S.net.send({ t: 'bye' }); S.net.close(); S.net = null; }
    S.mode = ''; menuStat(); scr('sMenu'); focusFirst($('sMenu'));
  }
  function menuStat() {
    const st = LS.get('wortgitter-stats', null);
    document.querySelectorAll('.lvl').forEach(b => { const lv = b.dataset.lv, r = st && st.best[lv]; let x = b.querySelector('.rec'); if (r) { if (!x) { x = document.createElement('span'); x.className = 'rec'; b.appendChild(x); } x.textContent = '🏆 ' + r; } else if (x) x.remove(); });
    const d = st && st.day && st.day.seed === WG.daySeed() ? st.day : null;
    $('bDay').textContent = d ? '📅 Tagesgitter · heute ' + d.score + ' Punkte' : '📅 Tagesgitter';
    $('menuStat').textContent = st && st.games ? st.words + ' Wörter in ' + st.games + ' Runden gefunden' : '';
  }

  /* ---------- Menü ---------- */
  $('lvls').onclick = e => { const b = e.target.closest('.lvl'); if (!b || !dict) return; S.mode = 'solo'; startRound(b.dataset.lv, (Math.random() * 4294967296) >>> 0); };
  $('bDay').onclick = () => { if (!dict) return; S.mode = 'solo'; startRound('mittel', WG.daySeed(), { day: true }); };
  $('bHelp').onclick = () => openOv('ovHelp'); $('bHelpX').onclick = () => closeOv('ovHelp');
  $('bSet').onclick = () => { $('setSound').checked = SET.sound; $('setZen').checked = SET.zen; openOv('ovSet'); };
  $('bSetX').onclick = () => { SET.sound = $('setSound').checked; SET.zen = $('setZen').checked; saveSet(); closeOv('ovSet'); };
  $('bMenu').onclick = e => { $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; $('mQuit').textContent = S.mode === 'guest' ? '⏹ Raum verlassen' : (S.mode === 'host' || S.mode === 'tv') ? '⏹ Raum schließen' : '⏹ Runde beenden'; openOv('ovMenu'); if (e.detail) e.currentTarget.blur(); };
  $('mGo').onclick = () => closeOv('ovMenu');
  $('mHelp').onclick = () => { closeOv('ovMenu'); openOv('ovHelp'); };
  $('mSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('mQuit').onclick = () => { closeOv('ovMenu'); if (S.mode === 'solo' && S.running) finish(); else quit(); };
  $('aOk').onclick = e => { submit(); if (e.detail) e.currentTarget.blur(); };
  $('aClear').onclick = e => { clearPath(); if (e.detail) e.currentTarget.blur(); };
  $('aDone').onclick = e => { finish(); if (e.detail) e.currentTarget.blur(); };

  /* ---------- Wischen und Tippen ---------- */
  let drag = null;
  function cellAt(x, y, strict) { // strict: nur der innere Kreis zählt (damit schräges Wischen sauber klappt)
    for (let i = 0; i < cells.length; i++) {
      const r = cells[i].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (strict ? Math.hypot(x - cx, y - cy) < r.width * .42 : (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) return i;
    }
    return -1;
  }
  const adj = (a, b) => WG.nbOf(S.game.n)[a].includes(b);
  function extend(i) { // Feld an den Weg hängen oder zurückgehen
    const p = S.path, k = p.indexOf(i);
    if (k >= 0) { if (k === p.length - 2) { p.pop(); render(); } return; }
    if (!p.length || adj(p[p.length - 1], i)) { p.push(i); sfx('step', p.length); render(); }
  }
  $('grid').addEventListener('pointerdown', e => {
    if (!canPlay() || ovOpen()) return;
    const i = cellAt(e.clientX, e.clientY, false); if (i < 0) return;
    e.preventDefault(); S.kbd = false; S.typed = [];
    try { $('grid').setPointerCapture(e.pointerId); } catch (x) { }
    const p = S.path, last = p[p.length - 1];
    drag = { start: i, moved: false, wasLast: i === last && p.length > 0, before: p.slice() };
    if (!p.length || (!p.includes(i) && !adj(last, i))) { S.path = [i]; sfx('step', 1); render(); }
    else if (!p.includes(i)) extend(i);
  });
  $('grid').addEventListener('pointermove', e => {
    if (!drag || !canPlay()) return;
    const i = cellAt(e.clientX, e.clientY, true); if (i < 0 || i === S.path[S.path.length - 1]) return;
    if (!drag.moved) { drag.moved = true; if (drag.before.length && S.path.length > 1 && S.path[0] !== drag.start) { S.path = [drag.start]; } }
    extend(i);
  });
  const up = () => {
    const d = drag; drag = null; if (!d || !canPlay()) return;
    if (d.moved) { if (S.path.length >= 2) submit(); else render(); return; }
    // Tippen: letzten Buchstaben nochmal antippen = prüfen, früheren = zurück bis dorthin
    const k = d.before.indexOf(d.start);
    if (d.wasLast && d.before.length >= 2) { S.path = d.before; submit(); return; }
    if (k >= 0 && k < d.before.length - 1) { S.path = d.before.slice(0, k + 1); render(); }
  };
  $('grid').addEventListener('pointerup', up); $('grid').addEventListener('pointercancel', () => { drag = null; render(); });

  /* ---------- Tastatur und Gamecontroller ---------- */
  const KEYL = {}; WF.AL.split('').forEach((c, k) => { KEYL[c] = k + 1; });
  function focusables(layer) { return Array.from(layer.querySelectorAll('button,input,select,a[href]')).filter(el => !el.disabled && el.offsetParent !== null); }
  function focusFirst(layer) { if (!layer || ('ontouchstart' in window && !S.kbd)) return; const f = focusables(layer); const p = f.find(el => el.classList.contains('pri')) || f[0]; if (p) try { p.focus({ preventScroll: true }); } catch (e) { } }
  function moveFocus(layer, dx, dy) {
    const f = focusables(layer); if (!f.length) return; const a = document.activeElement;
    if (!f.includes(a)) { f[0].focus(); return; }
    const r0 = a.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2; let best = null, bd = 1e9;
    for (const el of f) {
      if (el === a) continue; const r = el.getBoundingClientRect(), ddx = r.left + r.width / 2 - x0, ddy = r.top + r.height / 2 - y0;
      if (dx && (Math.sign(ddx) !== dx || Math.abs(ddx) < 4)) continue; if (dy && (Math.sign(ddy) !== dy || Math.abs(ddy) < 4)) continue;
      const d = dx ? Math.abs(ddx) + Math.abs(ddy) * 2.5 : Math.abs(ddy) + Math.abs(ddx) * 2.5; if (d < bd) { bd = d; best = el; }
    }
    if (best) best.focus();
  }
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  addEventListener('keydown', e => {
    const tg = e.target, typing = tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName), k = e.key, ov = ovOpen();
    if (ov) {
      if (ARROWS[k] && !typing) { e.preventDefault(); moveFocus(ov, ARROWS[k][0], ARROWS[k][1]); return; }
      if (k === 'Escape' || (k === 'Backspace' && !typing)) { e.preventDefault(); if (ov.id === 'ovSet') $('bSetX').click(); else if (ov.id !== 'ovEnd') closeOv(ov.id); return; }
      if ((k === 'Enter' || k === ' ') && !ov.contains(document.activeElement)) { const b = ov.querySelector('.btn.pri'); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (curScr() !== 'sGame') {
      if (typing) return;
      if (ARROWS[k]) { e.preventDefault(); moveFocus(document.querySelector('.scr.on'), ARROWS[k][0], ARROWS[k][1]); }
      else if (k === 'Escape' || k === 'Backspace') { const b = Array.from(document.querySelectorAll('.scr.on [id$="Back"]')).find(x => x.offsetParent); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (typing) return;
    if (k === 'Escape') { e.preventDefault(); $('bMenu').click(); return; }
    if (!canPlay()) return;
    const n = S.game.n;
    if (ARROWS[k]) {
      e.preventDefault(); S.kbd = true; let r = (S.cur / n) | 0, c = S.cur % n;
      c = Math.max(0, Math.min(n - 1, c + ARROWS[k][0])); r = Math.max(0, Math.min(n - 1, r + ARROWS[k][1])); S.cur = r * n + c; render(); return;
    }
    if (k === ' ') {
      if (tg && tg.tagName === 'BUTTON' && e.isTrusted) return;
      e.preventDefault(); S.kbd = true; S.typed = [];
      const p = S.path, last = p[p.length - 1];
      if (p.length && S.cur === last) { if (p.length >= 2) submit(); else clearPath(); return; }
      if (p.includes(S.cur)) { S.path = p.slice(0, p.indexOf(S.cur) + 1); render(); return; }
      if (!p.length || adj(last, S.cur)) { p.push(S.cur); sfx('step', p.length); render(); } else { S.path = [S.cur]; sfx('step', 1); render(); }
      return;
    }
    if (k === 'Enter') { if (tg && tg.tagName === 'BUTTON' && e.isTrusted) return; e.preventDefault(); submit(); return; }
    if (k === 'Backspace') {
      e.preventDefault();
      if (S.typed.length) { S.typed.pop(); S.path = S.typed.length ? (WG.findPath(S.game.grid, n, S.typed) || []) : []; }
      else S.path.pop();
      render(); return;
    }
    if (k && k.length === 1 && KEYL[k.toUpperCase()] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); S.kbd = false;
      const codes = (S.typed.length ? S.typed : S.path.map(i => S.game.grid[i])).concat(KEYL[k.toUpperCase()]);
      const p = WG.findPath(S.game.grid, n, codes, S.path);
      if (!p) { feedback('bad', WF.dec(codes) + ' – liegt so nicht im Gitter'); sfx('bad'); S.typed = []; S.path = []; return; }
      S.typed = codes; S.path = p; sfx('step', p.length); render();
    }
  });

  /* ---------- Online (PeerJS-kompatibel, Vermittlung über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'wortgitter-', MAX = 6;
    const Nt = { role: '', code: '', peer: null, conns: new Map(), busy: false }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    Nt.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    Nt.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    Nt.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    Nt.link = () => { const u = location.href.split('#')[0].split('?')[0] + '#join=' + Nt.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => {
        if (Nt.role === 'host' && Nt.conns.size >= MAX) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
        Nt.conns.set(conn.peer, conn); if (onOpen) onOpen();
      });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (Nt.conns.get(conn.peer) !== conn) return; Nt.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    Nt.host = async function () {
      if (Nt.busy) return; Nt.busy = true; Nt.close();
      try {
        await Nt.loadPeer();
        for (let k = 0; k < 6 && !Nt.peer; k++) {
          const code = mkCode();
          const ok = await new Promise(res => {
            const p = new Peer(PRE + code); let done = false;
            p.on('open', () => { done = true; Nt.peer = p; Nt.code = code; Nt.role = 'host'; res(true); });
            p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } else toast('Verbindung wackelt …'); });
          });
          if (ok === 'err') throw new Error('broker');
        }
        if (!Nt.peer) throw new Error('code');
        Nt.peer.on('connection', c => reg(c)); Nt.peer.on('disconnected', () => { try { Nt.peer.reconnect(); } catch (e) { } });
        Nt.busy = false; return Nt.code;
      } catch (e) { Nt.busy = false; Nt.close(); throw e; }
    };
    Nt.join = async function (code) {
      if (Nt.busy) return; code = Nt.norm(code); if (code.length !== 4) throw new Error('code'); Nt.busy = true; Nt.close();
      try {
        await Nt.loadPeer();
        await new Promise((res, rej) => {
          const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
          p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); else toast('Verbindung wackelt …'); });
          p.on('open', () => { Nt.peer = p; Nt.role = 'guest'; Nt.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); });
        });
        Nt.busy = false;
      } catch (e) { Nt.busy = false; Nt.close(); throw e; }
    };
    Nt.sendTo = (id, d) => { const c = Nt.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    Nt.send = d => { for (const [, c] of Nt.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    Nt.close = function () { for (const [, c] of Nt.conns) { try { c.close(); } catch (e) { } } Nt.conns.clear(); if (Nt.peer) { try { Nt.peer.destroy(); } catch (e) { } } Nt.peer = null; Nt.role = ''; Nt.code = ''; };
    return Nt;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Code prüfen?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar.');
  const myName = () => ($('onName').value || '').trim().slice(0, 14) || 'Spieler';
  function onlineScreen() {
    $('onName').value = LS.get('wortgitter-name', '') || LS.get('wortfunk-name', '') || '';
    $('onChoose').hidden = false; $('onLobby').hidden = true; $('onGuest').hidden = true; $('onBack').hidden = false;
    scr('sOnline'); focusFirst($('sOnline'));
  }
  $('bOnline').onclick = onlineScreen;
  $('bOnBack').onclick = () => { scr('sMenu'); focusFirst($('sMenu')); };
  $('joinCode').addEventListener('input', e => { e.target.value = mkNet({}).norm(e.target.value); });
  let keepT = null;
  function keepAwake() { try { if (navigator.wakeLock && !keepT) navigator.wakeLock.request('screen').then(w => { keepT = w; w.addEventListener('release', () => { keepT = null; }); }).catch(() => { }); } catch (e) { } }

  // Gastgeber
  let lobby = []; // [{ name, kind: 'guest'|'bot', id, level }]
  async function hostOpen(tv) {
    LS.set('wortgitter-name', myName());
    if (S.net) S.net.close();
    S.net = mkNet({ onMsg: hostMsg, onLeave: hostLeave }); $('bHost').disabled = true;
    try {
      const code = await S.net.host();
      S.mode = 'lobby'; lobby = []; S.total = {}; S.round = 0; $('hostPlays').checked = !tv;
      $('onChoose').hidden = true; $('onLobby').hidden = false; $('onBack').hidden = true;
      $('lobCode').textContent = code; $('lobLink').textContent = S.net.link();
      S.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(S.net.link()); q.make(); $('lobQr').innerHTML = '<img alt="QR-Code zum Beitreten" src="' + q.createDataURL(5, 0) + '">'; }).catch(() => { $('lobQr').textContent = code; });
      renderLobby(); keepAwake(); focusFirst($('onLobby'));
    } catch (e) { toast(netErr(e), 'bad'); if (S.net) S.net.close(); S.net = null; }
    $('bHost').disabled = false;
  }
  $('bHost').onclick = () => hostOpen(false);
  const lobbySeats = () => ($('hostPlays').checked ? [{ name: myName(), kind: 'host' }] : []).concat(lobby);
  function renderLobby() {
    const s = lobbySeats();
    $('lobSeats').innerHTML = s.map((p, k) => '<div class="pl"><span style="width:12px;height:12px;border-radius:50%;background:' + COLORS[k % COLORS.length] + '"></span>' +
      (p.kind === 'bot' ? '🤖 ' : p.kind === 'guest' ? '📱 ' : '📺 ') + esc(p.name) + (p.kind === 'bot' ? ' <small class="hint">(' + p.level + ')</small><button class="btn small rm" data-k="' + lobby.indexOf(p) + '">✕</button>' : '') + '</div>').join('') ||
      '<p class="hint">Noch niemand da – scanne den QR-Code mit dem Handy.</p>';
    const humans = s.filter(p => p.kind !== 'bot').length;
    $('bAddBot').disabled = s.length >= 6;
    $('bLobStart').disabled = !humans || s.length < 1;
    $('lobInfo').textContent = !humans ? 'Mindestens ein Mensch muss mitspielen (Handy oder dieses Gerät).' : s.length + ' von 6 Plätzen belegt.';
    if (S.net) S.net.send({ t: 'lobby', names: s.map(p => p.name) });
  }
  $('hostPlays').onchange = renderLobby;
  $('lobSeats').onclick = e => { const b = e.target.closest('.rm'); if (b) { lobby.splice(+b.dataset.k, 1); renderLobby(); } };
  $('bAddBot').onclick = () => { if (lobbySeats().length >= 6) return; const n = lobby.filter(p => p.kind === 'bot').length; lobby.push({ name: BOTS[n % BOTS.length], kind: 'bot', level: ['mittel', 'leicht', 'schwer'][n % 3] }); renderLobby(); };
  $('bCopy').onclick = () => { const l = S.net && S.net.link(); if (!l) return; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => toast('Link kopiert', 'ok')).catch(() => toast(l)); };
  $('bLobBack').onclick = () => { if (S.net) { S.net.send({ t: 'bye' }); S.net.close(); } S.net = null; S.mode = ''; onlineScreen(); };
  $('bLobStart').onclick = () => { S.players = lobbySeats().map(p => Object.assign({ n: 0, words: null }, p)); hostRound(); };
  function uniqueName(n) { n = String(n || 'Gast').trim().slice(0, 14) || 'Gast'; const all = lobbySeats().map(p => p.name.toLowerCase()); let x = n, k = 2; while (all.includes(x.toLowerCase())) x = n.slice(0, 12) + ' ' + k++; return x; }
  function sendPlayers() { if (S.net) S.net.send({ t: 'players', p: S.players.map(p => ({ name: p.name, n: p.n, kind: p.kind })) }); }
  function renderPlayers() {
    if ($('players').hidden) return;
    $('players').innerHTML = S.players.map((p, k) => '<div class="pl"><span style="width:10px;height:10px;border-radius:50%;background:' + COLORS[k % COLORS.length] + '"></span>' + (p.kind === 'bot' ? '🤖 ' : '') + esc(p.name) + ' <b>' + (p.n || 0) + '</b>' + (p.off ? ' <small>offline</small>' : '') + '</div>').join('');
  }
  function hostRound() {
    if (!S.players.length) return;
    const level = $('lobLevel').value, seed = (Math.random() * 4294967296) >>> 0;
    S.unique = $('lobUnique').checked; S.round++;
    S.players.forEach(p => { p.n = 0; p.words = null; if (p.kind === 'guest') p.off = !S.net.conns.has(p.id); });
    S.mode = S.players.some(p => p.kind === 'host') ? 'host' : 'tv';
    const dur = WG.LEVELS[level].time;
    S.net.send({ t: 'round', level, seed, dur, unique: S.unique, round: S.round });
    startRound(level, seed, { online: true, dur });
    sendPlayers(); keepAwake();
    // Computer finden über die Zeit verteilt Wörter
    const id = S.gameId, known = Array.from(S.game.words.keys()).filter(w => !common || common.hasWord(w));
    S.players.filter(p => p.kind === 'bot').forEach((p, k) => {
      const rnd = WF.rng(seed + k * 7919), mine = known.filter(() => rnd() < BOTRATE[p.level]); p.words = [];
      mine.forEach(w => setTimeout(() => { if (S.gameId !== id || !S.running) return; p.words.push(w); p.n = p.words.length; renderPlayers(); sendPlayers(); }, 4000 + rnd() * (dur * 1000 - 8000)));
    });
  }
  let collectT = 0;
  function hostCollect() {
    const me = S.players.find(p => p.kind === 'host'); if (me) me.words = S.found.slice();
    S.net.send({ t: 'stop' });
    const id = S.gameId; clearTimeout(collectT);
    const check = () => S.players.every(p => p.words || p.off);
    const done = () => { if (S.gameId !== id) return; clearTimeout(collectT); hostResult(); };
    if (check()) { done(); return; }
    collectT = setTimeout(done, 4000); S.waitDone = () => { if (check()) done(); };
    showWait();
  }
  function hostResult() {
    S.waitDone = null;
    const ps = S.players, lists = ps.map(p => (p.words || []).filter(w => S.game.words.has(w)));
    const res = WG.scoreRound(lists, S.unique);
    ps.forEach((p, k) => { S.total[p.name] = (S.total[p.name] || 0) + res[k].score; });
    const out = { t: 'result', unique: S.unique, total: S.game.words.size, players: ps.map((p, k) => ({ id: p.id || null, name: p.name, kind: p.kind, score: res[k].score, sum: S.total[p.name], words: res[k].words })), missed: missed().slice(0, 60) };
    S.net.send(out); showResult(out);
  }
  function hostMsg(id, d) {
    if (d.t === 'hello') {
      if (S.mode === 'lobby') { if (lobbySeats().length >= 6) { S.net.sendTo(id, { t: 'full' }); return; } lobby.push({ name: uniqueName(d.name), kind: 'guest', id }); sfx('ok'); renderLobby(); return; }
      // während des Spiels: zurückkehren oder neu dazukommen (ab der nächsten Runde)
      const nm = String(d.name || '').toLowerCase();
      let p = S.players.find(x => x.kind === 'guest' && x.off && x.name.toLowerCase() === nm);
      if (!p && S.players.length < 6) { p = { name: uniqueName(d.name), kind: 'guest', n: 0, words: [] }; S.players.push(p); lobby.push(p); }
      if (!p) { S.net.sendTo(id, { t: 'full' }); return; }
      p.id = id; p.off = false; toast(p.name + ' ist dabei', 'ok'); renderPlayers(); sendPlayers();
      if (S.running) S.net.sendTo(id, { t: 'round', level: S.game.level, seed: S.game.seed, dur: Math.max(5, Math.round((S.endAt - Date.now()) / 1000)), unique: S.unique, round: S.round, late: true });
      return;
    }
    const p = S.players.find(x => x.id === id && x.kind === 'guest'); if (!p) return;
    if (d.t === 'n') { p.n = d.n | 0; renderPlayers(); sendPlayers(); }
    if (d.t === 'words' && Array.isArray(d.list)) { p.words = d.list.map(String).slice(0, 2000); p.n = p.words.length; if (S.waitDone) S.waitDone(); }
  }
  function hostLeave(id) {
    if (S.mode === 'lobby') { const k = lobby.findIndex(p => p.id === id); if (k >= 0) { lobby.splice(k, 1); renderLobby(); } return; }
    const p = S.players.find(x => x.id === id); if (!p) return;
    p.off = true; p.id = null; toast(p.name + ' ist offline', 'bad'); renderPlayers(); sendPlayers(); if (S.waitDone) S.waitDone();
  }

  // Mitspieler
  async function guestJoin(code) {
    const name = myName(); LS.set('wortgitter-name', name);
    if (S.net) S.net.close();
    S.net = mkNet({ onMsg: guestMsg, onLeave: guestLeave }); $('bJoin').disabled = true;
    try {
      await S.net.join(code); S.mode = 'guestLobby'; S.net.send({ t: 'hello', name });
      $('onChoose').hidden = true; $('onGuest').hidden = false; $('onBack').hidden = true; $('guestCode').textContent = S.net.code; $('guestSeats').innerHTML = '';
      scr('sOnline'); keepAwake(); focusFirst($('onGuest'));
    } catch (e) { toast(netErr(e), 'bad'); if (S.net) S.net.close(); S.net = null; }
    $('bJoin').disabled = false;
  }
  $('bJoin').onclick = () => guestJoin($('joinCode').value);
  $('bGuestBack').onclick = () => { if (S.net) S.net.close(); S.net = null; S.mode = ''; onlineScreen(); };
  function guestMsg(id, d) {
    if (d.t === 'lobby') { $('guestSeats').innerHTML = d.names.map((n, k) => '<div class="pl"><span style="width:12px;height:12px;border-radius:50%;background:' + COLORS[k % COLORS.length] + '"></span>' + esc(n) + '</div>').join(''); return; }
    if (d.t === 'full') { toast('Der Raum ist voll.', 'bad'); return; }
    if (d.t === 'bye') { toast('Der Raum wurde geschlossen.', 'bad'); quit(); return; }
    if (d.t === 'round') { S.mode = 'guest'; startRound(d.level, d.seed, { online: true, dur: d.dur }); if (d.late) toast('Runde läuft schon – leg los!', 'ok'); return; }
    if (d.t === 'players') { S.players = d.p; renderPlayers(); return; }
    if (d.t === 'stop') { if (S.running) finish(); return; }
    if (d.t === 'result') { if (S.running) { S.running = false; clearInterval(S.timer); } showResult(d); }
  }
  function guestLeave() { if (S.mode === 'guest' || S.mode === 'guestLobby') { const c = S.net && S.net.code; toast('Verbindung zum Raum verloren.', 'bad'); quit(); onlineScreen(); if (c) $('joinCode').value = c; } }

  function showWait() {
    $('endTitle').textContent = '⏱ Zeit ist um!'; $('endScore').textContent = S.mode === 'tv' ? '' : S.score + ' Punkte'; $('endRank').innerHTML = '<li><span>Auswertung läuft …</span></li>';
    ['endFoundH', 'endFound', 'endMissH', 'endMiss'].forEach(x => { $(x).hidden = true; }); $('bEndAgain').hidden = true; openOv('ovEnd');
  }
  function showResult(r) {
    const ord = r.players.slice().sort((a, b) => b.score - a.score || b.sum - a.sum), best = ord[0] ? ord[0].score : 0;
    const myId = S.net && S.net.peer && S.net.peer.id, me = r.players.find(p => S.mode === 'guest' ? p.id && p.id === myId : p.kind === 'host');
    const winners = ord.filter(p => p.score === best);
    $('endTitle').textContent = winners.length > 1 ? 'Gleichstand!' : '🏆 ' + winners[0].name + ' gewinnt die Runde!';
    $('endScore').textContent = me ? me.score + ' Punkte' : '';
    $('endRank').innerHTML = ord.map(p => '<li class="' + (p.score === best ? 'win' : '') + '"><span>' + (p.kind === 'bot' ? '🤖 ' : '') + esc(p.name) + ' <small>' + p.words.length + ' Wörter</small></span><span><b>' + p.score + '</b>' + (p.sum !== p.score ? ' <small>gesamt ' + p.sum + '</small>' : '') + '</span></li>').join('');
    $('endFoundH').hidden = false; $('endFound').hidden = false;
    $('endFoundH').textContent = r.unique ? 'Gefundene Wörter (durchgestrichen = mehrfach gefunden)' : 'Gefundene Wörter';
    $('endFound').innerHTML = (me ? me.words : ord.flatMap(p => p.words)).slice(0, 120).map(([w, ok]) => '<span class="' + (ok ? '' : 'dup') + '">' + esc(w) + '</span>').join('') || '<span>–</span>';
    $('endMissH').hidden = false; $('endMiss').hidden = false; $('endMissH').textContent = 'Niemand gefunden (Auswahl)';
    const all = new Set(r.players.flatMap(p => p.words.map(x => x[0])));
    $('endMiss').innerHTML = wl((r.missed || []).filter(w => !all.has(w)).slice(0, 40), 7);
    $('bEndAgain').hidden = !(S.mode === 'host' || S.mode === 'tv'); $('bEndAgain').textContent = 'Nächste Runde ▶';
    openOv('ovEnd'); sfx('end');
  }

  /* ---------- Start ---------- */
  if (window.self !== window.top) $('backLink').hidden = true;
  menuStat();
  document.querySelectorAll('.lvl, #bDay, #bOnline').forEach(b => { b.disabled = true; });
  function onReady() {
    document.querySelectorAll('.lvl, #bDay, #bOnline').forEach(b => { b.disabled = false; });
    focusFirst($('sMenu'));
    const m = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
    if (m) { onlineScreen(); $('joinCode').value = m[1].toUpperCase(); if (!$('onName').value) $('onName').value = 'Spieler ' + (10 + ((Math.random() * 90) | 0)); guestJoin(m[1]); return; }
    if (/[?&]tv(=1)?(&|$)/.test(location.search)) { onlineScreen(); hostOpen(true); }
  }
  addEventListener('pagehide', () => { if (S.net && (S.mode === 'host' || S.mode === 'tv' || S.mode === 'lobby')) S.net.send({ t: 'bye' }); });
})();

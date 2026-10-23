/* AnMaCha Solitaire – Oberfläche: Karten, Ziehen/Antippen, Tastatur, Gamecontroller (über ../gamepad.js), Speichern, Statistik */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  const P = 'anmacha-solitaire-';
  const SET = Object.assign({ sound: true, auto: true, tap: true, left: false, game: 'klondike', draw: 1, suits: 1, solv: true }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const NAMES = { klondike: 'Patience', spider: 'Spider', freecell: 'FreeCell' };
  const RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'], SUIT = ['♠', '♥', '♦', '♣'];
  const LOGO = 'img/anmacha-logo.png';
  let toastT = 0;
  function toast(m, cls) { const t = $('toast'); t.textContent = m; t.className = 'toast' + (cls ? ' ' + cls : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }
  const variant = st => st.game + (st.game === 'klondike' ? '-' + st.opt.draw : st.game === 'spider' ? '-' + st.opt.suits : '');
  const vName = st => NAMES[st.game] + (st.game === 'klondike' ? ' · ' + st.opt.draw + (st.opt.draw === 1 ? ' Karte' : ' Karten') : st.game === 'spider' ? ' · ' + st.opt.suits + (st.opt.suits === 1 ? ' Farbe' : ' Farben') : '');
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  /* ---------- lösbare Partien ---------- */
  let SEEDS = null;
  fetch('data/loesbar.json').then(r => r.ok ? r.json() : null).then(j => { SEEDS = j; }).catch(() => { });
  function newSeed(game, opt) {
    if (game === 'klondike' && SET.solv && SEEDS) {
      const list = SEEDS['d' + opt.draw] || [], used = LS.get(P + 'used', {}), k = 'd' + opt.draw;
      if (list.length) { let i = used[k] || ((Math.random() * list.length) | 0); used[k] = (i + 1) % list.length; LS.set(P + 'used', used); return list[i % list.length]; }
    }
    return (Math.random() * 4294967296) >>> 0;
  }
  const daySeed = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(kind) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      const t0 = AC.currentTime;
      if (kind === 'card' || kind === 'flip') { // kurzes Rauschen wie eine Karte
        const n = AC.sampleRate * .05, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
        const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = kind === 'flip' ? 2600 : 1800; g.gain.value = .35;
        s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t0); return;
      }
      const seq = { found: [[880, .06], [1175, .1]], bad: [[200, .09], [160, .12]], win: [[523, .1], [659, .1], [784, .1], [1047, .35]], hint: [[660, .08]] }[kind] || [];
      let t = t0;
      for (const [fq, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = fq; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.1, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .85; }
    } catch (e) { }
  }

  /* ---------- Zustand ---------- */
  const G = { st: null, hist: [], elapsed: 0, started: false, daily: false, held: null, cur: { z: 't', i: 0, n: -1 }, kbd: false, busy: false, els: new Map(), L: null, timer: 0, hintT: 0, prevPile: new Map(), stats: false };
  const scr = id => { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); if (id === 'sGame') layout(); };
  const curScr = () => (document.querySelector('.scr.on') || {}).id;
  const ovOpen = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  const openOv = id => { $(id).hidden = false; setTimeout(() => focusFirst($(id)), 30); };
  const closeOv = id => { $(id).hidden = true; };

  /* ---------- Karten erzeugen ---------- */
  function faceHtml(c) {
    const R = RANK[c.r], S = SUIT[c.s];
    let mid;
    if (c.r === 1 && c.s === 0) mid = '<div class="mid ace"><img src="' + LOGO + '" alt=""><span>♠</span></div>';
    else if (c.r >= 11) mid = '<div class="mid face"><img src="' + LOGO + '" alt=""><span class="fl">' + R + S + '</span></div>';
    else mid = '<div class="mid">' + S + '</div>';
    return '<div class="fc"><div class="ix tl"><b>' + R + '</b><i>' + S + '</i></div>' + mid + '<div class="ix br"><b>' + R + '</b><i>' + S + '</i></div></div><div class="bk"><img src="' + LOGO + '" alt=""></div>';
  }
  function allCards(st) { const a = []; st.t.forEach(p => a.push(...p)); st.f.forEach(p => a.push(...p)); a.push(...st.stock, ...st.waste); (st.cells || []).forEach(c => { if (c) a.push(c); }); return a; }
  function buildCards() {
    const box = $('cards'); box.innerHTML = ''; G.els.clear(); G.prevPile.clear();
    for (const c of allCards(G.st)) {
      const el = document.createElement('div'); el.className = 'crd' + (AS.RED(c.s) ? ' red' : ''); el.dataset.id = c.id; el.innerHTML = faceHtml(c);
      el.setAttribute('aria-label', RANK[c.r] + SUIT[c.s]); box.appendChild(el); G.els.set(c.id, el);
    }
  }

  /* ---------- Anordnung ---------- */
  function topSlots(st) { // Spalte je Feld der oberen Reihe
    const L = SET.left;
    if (st.game === 'klondike') return L ? [{ k: 's', col: 6 }, { k: 'w', col: 5 }, ...[0, 1, 2, 3].map(i => ({ k: 'f', i, col: i }))] : [{ k: 's', col: 0 }, { k: 'w', col: 1 }, ...[0, 1, 2, 3].map(i => ({ k: 'f', i, col: 3 + i }))];
    if (st.game === 'freecell') return L ? [...[0, 1, 2, 3].map(i => ({ k: 'f', i, col: i })), ...[0, 1, 2, 3].map(i => ({ k: 'c', i, col: 4 + i }))] : [...[0, 1, 2, 3].map(i => ({ k: 'c', i, col: i })), ...[0, 1, 2, 3].map(i => ({ k: 'f', i, col: 4 + i }))];
    return [{ k: 's', col: L ? 9 : 0 }];
  }
  function layout() {
    const st = G.st, tb = $('table'); if (!st || !tb.clientWidth) return;
    const W = tb.clientWidth, H = tb.clientHeight, cols = st.t.length;
    const gap = Math.max(4, Math.round(W * .012));
    let cw = Math.floor((W - gap * (cols + 1)) / cols);
    cw = Math.min(cw, Math.floor((H - gap * 3) / 4.2 / 1.4), 132);
    const ch = Math.round(cw * 1.4);
    const ox = Math.round((W - (cols * cw + (cols - 1) * gap)) / 2);
    document.documentElement.style.setProperty('--cw', cw + 'px'); document.documentElement.style.setProperty('--ch', ch + 'px');
    document.documentElement.style.setProperty('--cr', Math.round(cw * .1) + 'px');
    const X = col => ox + col * (cw + gap), ty = gap * 2 + ch + (st.game === 'spider' ? 0 : Math.round(gap * .5));
    G.L = { W, H, cw, ch, gap, X, ty, y0: gap, cols };
    // Fächerabstände je Spalte, damit alles in die Höhe passt
    G.L.fan = st.t.map(p => {
      let dd = ch * .12, du = ch * .27;
      const need = p.reduce((s, c, k) => k === p.length - 1 ? s : s + (c.up ? du : dd), 0), avail = H - ty - ch - gap;
      if (need > avail && need > 0) { const f = Math.max(.25, avail / need); dd *= f; du *= f; }
      return [dd, du];
    });
    renderSlots(); render();
  }
  addEventListener('resize', () => { if (curScr() === 'sGame') layout(); });
  function pos(st) { // id -> { x, y, z }
    const L = G.L, out = new Map(), ts = topSlots(st);
    const slotXY = (k, i) => { const s = ts.find(x => x.k === k && (x.i === undefined || x.i === i)); return s ? [L.X(s.col), L.y0] : [0, 0]; };
    st.t.forEach((p, i) => { let y = L.ty; p.forEach((c, k) => { out.set(c.id, { x: L.X(i), y, z: 10 + k, pile: 't' + i }); y += c.up ? L.fan[i][1] : L.fan[i][0]; }); });
    if (st.game === 'spider') {
      const [sx, sy] = slotXY('s'); const groups = Math.ceil(st.stock.length / 10);
      st.stock.forEach((c, k) => { const g = Math.floor(k / 10); out.set(c.id, { x: sx + (SET.left ? -1 : 1) * g * L.cw * .14, y: sy, z: 1 + k, pile: 's' }); });
      void groups;
      st.f.forEach((run, i) => { const col = SET.left ? i : 2 + i; run.forEach((c, k) => out.set(c.id, { x: L.X(col), y: L.y0, z: 1 + k, pile: 'f' + i })); });
    } else {
      st.f.forEach((f, i) => { const [x, y] = slotXY('f', i); f.forEach((c, k) => out.set(c.id, { x, y, z: 1 + k, pile: 'f' + i })); });
      if (st.game === 'klondike') {
        const [sx, sy] = slotXY('s'), [wx, wy] = slotXY('w');
        st.stock.forEach((c, k) => out.set(c.id, { x: sx, y: sy, z: 1 + k, pile: 's' }));
        const n = st.waste.length, fanN = st.opt.draw === 3 ? Math.min(3, n) : 1, dx = L.cw * .26 * (SET.left ? -1 : 1);
        st.waste.forEach((c, k) => { const j = k - (n - fanN); out.set(c.id, { x: wx + (j > 0 ? j * dx : 0), y: wy, z: 1 + k, pile: 'w' }); });
      } else st.cells.forEach((c, i) => { if (c) { const [x, y] = slotXY('c', i); out.set(c.id, { x, y, z: 1, pile: 'c' + i }); } });
    }
    return out;
  }
  function renderSlots() {
    const st = G.st, L = G.L, box = $('slots'); let h = '';
    const sl = (x, y, cls, txt, data) => '<div class="slot ' + cls + '" style="transform:translate(' + x + 'px,' + y + 'px)" ' + data + '>' + (txt || '') + '</div>';
    for (const s of topSlots(st)) {
      const x = L.X(s.col), y = L.y0;
      if (s.k === 's') h += sl(x, y, 'stock' + (st.game === 'klondike' && !st.stock.length && !st.waste.length || st.game === 'spider' && !st.stock.length ? ' none' : ''), '', 'data-k="s"');
      else if (s.k === 'w') h += sl(x, y, 'waste', '', 'data-k="w" style2');
      else if (s.k === 'f') h += sl(x, y, 'found', 'A', 'data-k="f" data-i="' + s.i + '"');
      else h += sl(x, y, 'cell', '', 'data-k="c" data-i="' + s.i + '"');
    }
    if (st.game === 'spider') for (let i = 0; i < 8; i++) h += sl(L.X(SET.left ? i : 2 + i), L.y0, 'found', i < st.done ? '' : '', 'data-k="F" data-i="' + i + '"');
    st.t.forEach((p, i) => { h += sl(L.X(i), L.ty, 'tab', st.game === 'klondike' ? 'K' : '', 'data-k="t" data-i="' + i + '"'); });
    box.innerHTML = h.replace(/ style2/g, '');
  }
  function render() {
    const st = G.st; if (!st || !G.L) return;
    const P2 = pos(st), held = heldIds(), hint = G.hintIds || new Set(), cur = curIds();
    for (const c of allCards(st)) {
      const el = G.els.get(c.id), p = P2.get(c.id); if (!el || !p) continue;
      if (el.classList.contains('drag')) continue;
      const moved = G.prevPile.get(c.id) !== p.pile; G.prevPile.set(c.id, p.pile);
      el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
      if (moved) { el.style.zIndex = 500 + p.z; clearTimeout(el._z); el._z = setTimeout(() => { el.style.zIndex = el._zz; }, 260); } else el.style.zIndex = p.z;
      el._zz = p.z; el._x = p.x;
      el.classList.toggle('down', !c.up); el.classList.toggle('held', held.has(c.id)); el.classList.toggle('hint', hint.has(c.id)); el.classList.toggle('cur', cur.has(c.id));
    }
    // Rahmen auf leeren Feldern
    document.querySelectorAll('.slot').forEach(s => { s.classList.remove('cur'); s.classList.toggle('hint', !!(G.hintSlot && G.hintSlot === slotKey(s))); });
    if (G.kbd && !cur.size) { const s = slotEl(G.cur); if (s) s.classList.add('cur'); }
    const stockEl = document.querySelector('.slot.stock'); if (stockEl) stockEl.classList.toggle('none', st.game === 'klondike' ? !st.stock.length && !st.waste.length : !st.stock.length);
    $('aUndo').disabled = !G.hist.length; $('aFinish').hidden = !AS.canFinish(st);
    info();
  }
  const slotKey = s => s.dataset.k + (s.dataset.i || '');
  function slotEl(c) {
    if (c.z === 't') return document.querySelector('.slot[data-k="t"][data-i="' + c.i + '"]');
    const s = topSlots(G.st)[c.i]; if (!s) return null;
    return document.querySelector('.slot[data-k="' + s.k + '"]' + (s.i !== undefined ? '[data-i="' + s.i + '"]' : ''));
  }
  function info() { $('gTitle').textContent = (G.daily ? '📅 ' : '') + vName(G.st); $('gInfo').textContent = fmt(G.elapsed) + ' · ' + G.st.moves + ' Züge' + (G.st.game === 'spider' ? ' · ' + G.st.done + '/8 Reihen' : ''); }

  /* ---------- Stellen ---------- */
  function locate(id) {
    const st = G.st;
    for (let i = 0; i < st.t.length; i++) { const n = st.t[i].findIndex(c => c.id === id); if (n >= 0) return { k: 't', i, n }; }
    if (st.waste.some(c => c.id === id)) return { k: 'w', i: 0, n: st.waste.findIndex(c => c.id === id) };
    if (st.stock.some(c => c.id === id)) return { k: 's' };
    for (let i = 0; i < st.f.length; i++) if (st.f[i].some(c => c.id === id)) return { k: 'f', i };
    if (st.cells) for (let i = 0; i < st.cells.length; i++) if (st.cells[i] && st.cells[i].id === id) return { k: 'c', i };
    return null;
  }
  function srcIds(src) { if (!src) return new Set(); return new Set(AS.cardsOf(G.st, src).map(c => c.id)); }
  function heldIds() { return srcIds(G.held); }
  function curIds() {
    if (!G.kbd) return new Set();
    const c = G.cur, st = G.st;
    if (c.z === 't') { const p = st.t[c.i]; if (!p.length) return new Set(); const n = c.n < 0 || c.n >= p.length ? p.length - 1 : c.n; return new Set(p.slice(n).map(x => x.id)); }
    const s = topSlots(st)[c.i]; if (!s) return new Set();
    if (s.k === 's') return new Set(st.stock.length ? [st.stock[st.stock.length - 1].id] : []);
    const cs = AS.cardsOf(st, { k: s.k, i: s.i || 0 }); return new Set(cs.map(x => x.id));
  }
  // movable source from a found location (the whole run from n in tableau, top of other piles)
  function sourceFrom(loc) {
    if (!loc) return null;
    if (loc.k === 't') return AS.runOK(G.st, G.st.t[loc.i], loc.n) ? { k: 't', i: loc.i, n: loc.n } : null;
    if (loc.k === 'w') return loc.n === G.st.waste.length - 1 ? { k: 'w', i: 0 } : null;
    if (loc.k === 'f') return G.st.game !== 'spider' ? { k: 'f', i: loc.i } : null;
    if (loc.k === 'c') return { k: 'c', i: loc.i };
    return null;
  }

  /* ---------- Züge, Rückgängig, Automatik ---------- */
  function push() { G.hist.push(JSON.stringify(G.st)); if (G.hist.length > 300) G.hist.shift(); }
  function startClock() { if (!G.started) { G.started = true; } }
  function doMove(m, quiet) {
    if (G.busy && !quiet) return false;
    if (!AS.legal(G.st, m)) return false;
    push(); startClock();
    const toF = m.to.k === 'f'; AS.apply(G.st, m); sfx(toF ? 'found' : 'card');
    G.held = null; clearHint(); after();
    return true;
  }
  function doDraw() {
    if (G.busy || !AS.canDraw(G.st)) { if (G.st.game === 'spider' && G.st.stock.length) { toast('Zum Austeilen darf keine Spalte leer sein', 'bad'); sfx('bad'); } return; }
    push(); startClock(); AS.draw(G.st); sfx('flip'); G.held = null; clearHint(); after();
  }
  function undo() {
    if (G.autoT && G.busy) { clearTimeout(G.autoT); G.autoT = 0; G.busy = false; } // laufendes Ablegen abbrechen
    if (G.busy || !G.hist.length) return;
    G.st = JSON.parse(G.hist.pop()); G.held = null; clearHint(); sfx('card'); closeOv('ovStuck'); render(); save();
  }
  function after() {
    render(); save();
    if (G.st.won) { win(); return; }
    if (SET.auto) autoStep();
    else checkStuck();
  }
  function autoStep() {
    const m = AS.safeAuto(G.st); if (!m) { checkStuck(); return; }
    G.busy = true; clearTimeout(G.autoT);
    G.autoT = setTimeout(() => { G.busy = false; if (!G.st || G.st.won) return; if (AS.legal(G.st, m)) { AS.apply(G.st, m); sfx('found'); render(); save(); if (G.st.won) { win(); return; } } autoStep(); }, 140);
  }
  function finishAll() {
    if (!AS.canFinish(G.st) || G.busy) return;
    push(); G.busy = true;
    const step = () => { const m = AS.finishStep(G.st); if (!m) { G.busy = false; if (G.st.game === 'klondike' && G.st.waste.length === 1 && AS.finishStep(G.st) === null) { } render(); save(); if (G.st.won) win(); return; } AS.apply(G.st, m); sfx('found'); render(); setTimeout(step, 90); };
    step();
  }
  function anyLegal(st) {
    if (AS.moves(st).length) return true;
    if (st.game === 'klondike') { // könnte eine Karte aus Stapel/Abwurf irgendwo hin?
      for (const c of [...st.stock, ...st.waste]) { if (AS.canFound(st, c, 0) || AS.canFound(st, c, 1) || AS.canFound(st, c, 2) || AS.canFound(st, c, 3)) return true; for (const p of st.t) if (AS.canStack(st, c, p)) return true; }
      return false;
    }
    return AS.canDraw(st);
  }
  function checkStuck() { if (G.st && !G.st.won && !anyLegal(G.st)) setTimeout(() => { if (G.st && !G.st.won && !anyLegal(G.st)) openOv('ovStuck'); }, 400); }
  let hintIdx = 0;
  function showHint() {
    if (G.busy || !G.st || G.st.won) return;
    const ms = AS.moves(G.st).filter(m => m.w > 0);
    clearHint();
    if (ms.length) {
      const m = ms[hintIdx++ % ms.length];
      G.hintIds = srcIds(m.from);
      const dst = m.to.k === 't' ? G.st.t[m.to.i] : m.to.k === 'f' ? G.st.f[m.to.i] : [];
      if (dst.length) G.hintIds.add(dst[dst.length - 1].id); else G.hintSlot = m.to.k + m.to.i;
    } else if (AS.canDraw(G.st)) { G.hintSlot = 's'; if (G.st.stock.length) G.hintIds = new Set([G.st.stock[G.st.stock.length - 1].id]); }
    else { toast('Keine sinnvollen Züge – versuch ↶ Rückgängig', 'bad'); sfx('bad'); return; }
    sfx('hint'); render();
    G.hintT = setTimeout(() => { clearHint(); render(); }, 1600);
  }
  function clearHint() { clearTimeout(G.hintT); G.hintIds = null; G.hintSlot = null; }
  function shake(ids) { ids.forEach(id => { const el = G.els.get(id); if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } }); sfx('bad'); }

  /* ---------- Spiel starten, speichern, gewinnen ---------- */
  function start(game, opt, seed, daily) {
    G.st = AS.deal(game, opt, seed); G.hist = []; G.elapsed = 0; G.started = false; G.daily = !!daily; G.held = null; G.busy = false; G.stats = false; clearHint();
    G.cur = { z: 't', i: 0, n: -1 };
    ['ovWin', 'ovStuck', 'ovMenu'].forEach(closeOv);
    scr('sGame'); buildCards(); layout(); save();
    countPlayed();
  }
  function countPlayed() { const s = stats(); s.played = (s.played || 0) + 1; const v = s.v[variant(G.st)] = s.v[variant(G.st)] || { p: 0, w: 0 }; v.p++; LS.set(P + 'stats', s); }
  function stats() { const s = LS.get(P + 'stats', null) || {}; s.v = s.v || {}; s.wins = s.wins || 0; return s; }
  function save() { if (G.st && !G.st.won) LS.set(P + 'save', { st: G.st, elapsed: G.elapsed, daily: G.daily, hist: G.hist.slice(-40) }); }
  function resume() {
    const s = LS.get(P + 'save', null); if (!s || !s.st) return;
    G.st = s.st; G.hist = s.hist || []; G.elapsed = s.elapsed || 0; G.started = G.st.moves > 0; G.daily = !!s.daily; G.held = null; G.busy = false; G.stats = false; clearHint();
    scr('sGame'); buildCards(); layout();
  }
  setInterval(() => { if (curScr() === 'sGame' && G.started && G.st && !G.st.won && !document.hidden && !ovOpen()) { G.elapsed++; info(); if (G.elapsed % 10 === 0) save(); } }, 1000);
  function win() {
    if (G.stats) return; G.stats = true; LS.del(P + 'save');
    const s = stats(), k = variant(G.st), v = s.v[k] = s.v[k] || { p: 1, w: 0 };
    v.w++; s.wins++; s.streak = (s.streak || 0) + 1; s.top = Math.max(s.top || 0, s.streak);
    const newTime = !v.bt || G.elapsed < v.bt; if (newTime) v.bt = G.elapsed;
    const newMoves = !v.bm || G.st.moves < v.bm; if (newMoves) v.bm = G.st.moves;
    LS.set(P + 'stats', s);
    if (G.daily) LS.set(P + 'day', { d: daySeed(), won: true, t: G.elapsed, m: G.st.moves });
    sfx('win');
    // Karten fliegen davon
    let k2 = 0;
    for (const [, el] of G.els) { el.style.setProperty('--d', (k2++ * 18) + 'ms'); el.style.setProperty('--x', ((el._x || 0) + (Math.random() - .5) * 500) + 'px'); el.style.setProperty('--rot', ((Math.random() - .5) * 720) + 'deg'); el.classList.add('win'); }
    setTimeout(() => {
      $('winTitle').textContent = (G.daily ? '📅 Tagesspiel geschafft!' : '🎉 Gewonnen!');
      $('winRank').innerHTML = '<li' + (newTime ? ' class="new"' : '') + '><span>Zeit</span><b>' + fmt(G.elapsed) + (newTime ? ' · Bestzeit!' : ' (beste ' + fmt(v.bt) + ')') + '</b></li>' +
        '<li' + (newMoves ? ' class="new"' : '') + '><span>Züge</span><b>' + G.st.moves + (newMoves ? ' · Rekord!' : ' (beste ' + v.bm + ')') + '</b></li>' +
        '<li><span>' + vName(G.st) + '</span><b>' + v.w + ' von ' + v.p + ' gewonnen</b></li><li><span>Siege in Folge</span><b>' + s.streak + '</b></li>';
      openOv('ovWin'); menuStat();
    }, Math.min(2600, 600 + G.els.size * 18));
  }
  function loseStreak() { const s = stats(); if (s.streak) { s.streak = 0; LS.set(P + 'stats', s); } }
  function newGame() {
    if (G.st && !G.st.won && G.st.moves > 0) loseStreak();
    const opt = SET.game === 'klondike' ? { draw: SET.draw } : SET.game === 'spider' ? { suits: SET.suits } : {};
    start(SET.game, opt, newSeed(SET.game, opt), false);
  }
  function daily() {
    const d = daySeed(), list = SEEDS && SEEDS.d1;
    const seed = list && list.length ? list[(d * 7) % list.length] : d;
    start('klondike', { draw: 1 }, seed, true);
  }

  /* ---------- Menü ---------- */
  function menuSync() {
    document.querySelectorAll('.gm').forEach(b => b.classList.toggle('on', b.dataset.g === SET.game));
    $('optKlondike').hidden = SET.game !== 'klondike'; $('optSpider').hidden = SET.game !== 'spider'; $('optFree').hidden = SET.game !== 'freecell';
    document.querySelectorAll('[data-draw]').forEach(b => b.classList.toggle('on', +b.dataset.draw === SET.draw));
    document.querySelectorAll('[data-suits]').forEach(b => b.classList.toggle('on', +b.dataset.suits === SET.suits));
    $('optSolv').checked = SET.solv;
    const sv = LS.get(P + 'save', null); $('bResume').hidden = !(sv && sv.st && !sv.st.won && sv.st.moves > 0);
    if (!$('bResume').hidden) $('bResume').textContent = '▶ Weiterspielen · ' + vName(sv.st);
    menuStat();
  }
  function menuStat() {
    const s = stats(), dd = LS.get(P + 'day', null);
    $('bDay').textContent = dd && dd.d === daySeed() && dd.won ? '📅 Tagesspiel ✓ ' + fmt(dd.t) : '📅 Tagesspiel';
    document.querySelectorAll('.gm').forEach(b => {
      let w = 0; for (const k in s.v) if (k.split('-')[0] === b.dataset.g) w += s.v[k].w || 0;
      let x = b.querySelector('.rec'); if (w) { if (!x) { x = document.createElement('span'); x.className = 'rec'; b.appendChild(x); } x.textContent = '🏆 ' + w; } else if (x) x.remove();
    });
    $('menuStat').textContent = s.played ? s.wins + ' Siege in ' + s.played + ' Partien' + (s.top ? ' · beste Serie ' + s.top : '') : '';
  }
  $('games').onclick = e => { const b = e.target.closest('.gm'); if (!b) return; SET.game = b.dataset.g; saveSet(); menuSync(); };
  document.querySelectorAll('[data-draw]').forEach(b => { b.onclick = () => { SET.draw = +b.dataset.draw; saveSet(); menuSync(); }; });
  document.querySelectorAll('[data-suits]').forEach(b => { b.onclick = () => { SET.suits = +b.dataset.suits; saveSet(); menuSync(); }; });
  $('optSolv').onchange = () => { SET.solv = $('optSolv').checked; saveSet(); };
  $('bNew').onclick = newGame; $('bResume').onclick = resume; $('bDay').onclick = daily;
  $('bHelp').onclick = () => openOv('ovHelp'); $('bHelpX').onclick = () => closeOv('ovHelp');
  $('bSet').onclick = () => { $('setSound').checked = SET.sound; $('setAuto').checked = SET.auto; $('setTap').checked = SET.tap; $('setLeft').checked = SET.left; openOv('ovSet'); };
  $('bSetX').onclick = () => { SET.sound = $('setSound').checked; SET.auto = $('setAuto').checked; SET.tap = $('setTap').checked; SET.left = $('setLeft').checked; saveSet(); closeOv('ovSet'); if (curScr() === 'sGame') layout(); };
  const blurAfter = (id, fn) => { $(id).addEventListener('click', e => { fn(); if (e.detail) e.currentTarget.blur(); }); };
  blurAfter('aUndo', undo); blurAfter('aHint', showHint); blurAfter('aFinish', finishAll);
  blurAfter('bMenu', () => { $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; openOv('ovMenu'); });
  $('mGo').onclick = () => closeOv('ovMenu');
  $('mNew').onclick = () => { closeOv('ovMenu'); newGame(); };
  $('mRestart').onclick = () => { closeOv('ovMenu'); start(G.st.game, G.st.opt, G.st.seed, G.daily); };
  $('mHelp').onclick = () => { closeOv('ovMenu'); openOv('ovHelp'); };
  $('mSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('mQuit').onclick = () => { closeOv('ovMenu'); save(); toMenu(); };
  $('bWinMenu').onclick = () => { closeOv('ovWin'); toMenu(); };
  $('bWinNew').onclick = () => { closeOv('ovWin'); if (G.daily) { SET.game = 'klondike'; SET.draw = 1; } newGame(); };
  $('bStuckUndo').onclick = () => { closeOv('ovStuck'); undo(); };
  $('bStuckRe').onclick = () => { closeOv('ovStuck'); start(G.st.game, G.st.opt, G.st.seed, G.daily); };
  $('bStuckNew').onclick = () => { closeOv('ovStuck'); loseStreak(); newGame(); };
  function toMenu() { menuSync(); scr('sMenu'); focusFirst($('sMenu')); }

  /* ---------- Zeiger: ziehen und antippen ---------- */
  let drag = null;
  $('table').addEventListener('pointerdown', e => {
    if (!G.st || G.busy || ovOpen() || e.button > 0 || G.st.won) return;
    G.kbd = false; clearHint();
    const el = e.target.closest('.crd'), slot = e.target.closest('.slot');
    if (!el) {
      if (slot && slot.dataset.k === 's') { doDraw(); return; }
      if (slot && G.held) { const to = { k: slot.dataset.k, i: +slot.dataset.i || 0 }; if (!doMove({ from: G.held, to })) { shake(heldIds()); G.held = null; render(); } return; }
      if (G.held) { G.held = null; render(); }
      return;
    }
    const loc = locate(+el.dataset.id);
    if (!loc) return;
    if (loc.k === 's') { doDraw(); return; }
    const src = sourceFrom(loc);
    if (G.held && !SET.tap) { // Ziel antippen
      const to = loc.k === 't' ? { k: 't', i: loc.i } : loc.k === 'f' ? { k: 'f', i: loc.i } : loc.k === 'c' ? { k: 'c', i: loc.i } : null;
      if (to && !(G.held.k === to.k && G.held.i === to.i)) { if (!doMove({ from: G.held, to })) { shake(heldIds()); G.held = null; render(); } return; }
    }
    if (!src) { shake([+el.dataset.id]); return; }
    const ids = Array.from(srcIds(src)), box = $('table').getBoundingClientRect(), P2 = pos(G.st);
    drag = { src, ids, x0: e.clientX, y0: e.clientY, moved: false, box, start: ids.map(id => P2.get(id)), pid: e.pointerId };
    try { $('table').setPointerCapture(e.pointerId); } catch (x) { }
  });
  $('table').addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) { if (Math.hypot(dx, dy) < 7) return; drag.moved = true; drag.ids.forEach((id, k) => { const el = G.els.get(id); el.classList.add('drag'); el.style.zIndex = 900 + k; }); }
    drag.ids.forEach((id, k) => { const p = drag.start[k]; G.els.get(id).style.transform = 'translate(' + (p.x + dx) + 'px,' + (p.y + dy) + 'px)'; });
    const t = dropTarget(drag.start[0].x + dx + G.L.cw / 2, drag.start[0].y + dy + G.L.ch / 2);
    document.querySelectorAll('.slot.drop').forEach(s => s.classList.remove('drop'));
    if (t) { const s = t.k === 't' && G.st.t[t.i].length ? null : document.querySelector('.slot[data-k="' + t.k + '"][data-i="' + t.i + '"]'); if (s) s.classList.add('drop'); }
  });
  function endDrag(e, cancel) {
    const d = drag; drag = null; if (!d) return;
    document.querySelectorAll('.slot.drop').forEach(s => s.classList.remove('drop'));
    d.ids.forEach(id => { const el = G.els.get(id); el.classList.remove('drag'); });
    if (cancel) { render(); return; }
    if (d.moved) {
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0, t = dropTarget(d.start[0].x + dx + G.L.cw / 2, d.start[0].y + dy + G.L.ch / 2);
      if (!t || !doMove({ from: d.src, to: t })) { render(); if (t) shake(d.ids); }
      return;
    }
    // Antippen
    if (SET.tap) { const m = AS.bestMoveFrom(G.st, d.src); if (m && doMove(m)) return; shake(d.ids); return; }
    G.held = G.held && G.held.k === d.src.k && G.held.i === d.src.i && G.held.n === d.src.n ? null : d.src; sfx('card'); render();
  }
  $('table').addEventListener('pointerup', e => endDrag(e, false));
  $('table').addEventListener('pointercancel', e => endDrag(e, true));
  function dropTarget(x, y) {
    const L = G.L, st = G.st;
    let best = null, bd = 1e9;
    if (y < L.ty - L.gap) { // obere Reihe
      for (const s of topSlots(st)) { if (s.k !== 'f' && s.k !== 'c') continue; const cx = L.X(s.col) + L.cw / 2, cy = L.y0 + L.ch / 2, d = Math.hypot(x - cx, y - cy); if (d < bd && d < L.cw * 1.1) { bd = d; best = { k: s.k, i: s.i }; } }
      return best;
    }
    for (let i = 0; i < st.t.length; i++) { const cx = L.X(i) + L.cw / 2, d = Math.abs(x - cx); if (d < bd && d < L.cw * .9) { bd = d; best = { k: 't', i }; } }
    return best;
  }

  /* ---------- Tastatur und Gamecontroller ---------- */
  function focusables(layer) { return Array.from(layer.querySelectorAll('button,input,select,a[href]')).filter(el => !el.disabled && el.offsetParent !== null); }
  function focusFirst(layer) { if (!layer || ('ontouchstart' in window && !G.kbd)) return; const f = focusables(layer); const p = f.find(el => el.classList.contains('pri') && !el.hidden) || f[0]; if (p) try { p.focus({ preventScroll: true }); } catch (e) { } }
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
  function curSource() { // Karten unter dem Rahmen
    const c = G.cur, st = G.st;
    if (c.z === 't') { const p = st.t[c.i]; if (!p.length) return null; const n = c.n < 0 || c.n >= p.length ? p.length - 1 : c.n; return sourceFrom({ k: 't', i: c.i, n }); }
    const s = topSlots(st)[c.i]; if (!s || s.k === 's') return null;
    if (s.k === 'w') return st.waste.length ? { k: 'w', i: 0 } : null;
    if (s.k === 'f') return st.f[s.i].length && st.game !== 'spider' ? { k: 'f', i: s.i } : null;
    return st.cells[s.i] ? { k: 'c', i: s.i } : null;
  }
  function curTarget() { const c = G.cur; if (c.z === 't') return { k: 't', i: c.i }; const s = topSlots(G.st)[c.i]; return s && (s.k === 'f' || s.k === 'c') ? { k: s.k, i: s.i } : null; }
  function moveCur(dx, dy) {
    const st = G.st, c = G.cur, ts = topSlots(st).slice().sort((a, b) => a.col - b.col);
    G.kbd = true;
    if (c.z === 't') {
      const p = st.t[c.i];
      if (dx) { c.i = Math.max(0, Math.min(st.t.length - 1, c.i + dx)); c.n = -1; }
      else if (dy < 0) {
        const n = c.n < 0 ? p.length - 1 : c.n;
        if (n > 0 && AS.runOK(st, p, n - 1)) c.n = n - 1;
        else { // zur oberen Reihe
          let bi = 0, bd = 1e9; ts.forEach(s => { const d = Math.abs(s.col - c.i); if (d < bd) { bd = d; bi = topSlots(st).indexOf(s); } });
          G.cur = { z: 'top', i: bi };
        }
      } else if (dy > 0) { const n = c.n < 0 ? p.length - 1 : c.n; c.n = n < p.length - 1 ? n + 1 : -1; }
    } else {
      const all = topSlots(st), s = all[c.i], k = ts.indexOf(s);
      if (dx) { const ns = ts[Math.max(0, Math.min(ts.length - 1, k + dx))]; c.i = all.indexOf(ns); }
      else if (dy > 0) G.cur = { z: 't', i: Math.min(st.t.length - 1, s.col), n: -1 };
    }
    render();
  }
  function act() {
    const st = G.st; G.kbd = true; clearHint();
    if (G.cur.z === 'top' && topSlots(st)[G.cur.i].k === 's') { doDraw(); return; }
    if (G.held) {
      const to = curTarget();
      if (to && G.held.k === to.k && G.held.i === to.i) { G.held = null; render(); return; }
      if (!to || !doMove({ from: G.held, to })) { shake(heldIds()); }
      return;
    }
    const src = curSource();
    if (!src) { shake(Array.from(curIds())); return; }
    G.held = src; sfx('card'); render();
  }
  function quick() { const src = G.held || curSource(); if (!src) return; const m = AS.bestMoveFrom(G.st, src); if (!m || !doMove(m)) shake(Array.from(srcIds(src))); }
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  addEventListener('keydown', e => {
    const tg = e.target, typing = tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName) && tg.type !== 'checkbox', k = e.key, ov = ovOpen();
    if (ov) {
      if (ARROWS[k] && !typing) { e.preventDefault(); moveFocus(ov, ARROWS[k][0], ARROWS[k][1]); return; }
      if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); if (ov.id === 'ovSet') $('bSetX').click(); else if (ov.id !== 'ovWin') closeOv(ov.id); return; }
      if ((k === 'Enter' || k === ' ') && !ov.contains(document.activeElement)) { const b = ov.querySelector('.btn.pri'); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (curScr() !== 'sGame') {
      if (typing) return;
      if (ARROWS[k]) { e.preventDefault(); moveFocus($('sMenu'), ARROWS[k][0], ARROWS[k][1]); }
      return;
    }
    if (typing || !G.st) return;
    const btnFocused = tg && tg.tagName === 'BUTTON' && e.isTrusted;
    if (ARROWS[k]) { e.preventDefault(); moveCur(ARROWS[k][0], ARROWS[k][1]); return; }
    switch (k) {
      case ' ': case 'Enter': if (btnFocused) return; e.preventDefault(); act(); return;
      case 'Escape': e.preventDefault(); $('bMenu').click(); return;
      case 'Backspace': e.preventDefault(); if (G.held) { G.held = null; render(); } else undo(); return;
    }
    if (e.ctrlKey || e.metaKey) { if (k.toLowerCase() === 'z') { e.preventDefault(); undo(); } return; }
    switch (k.toLowerCase()) {
      case 'z': e.preventDefault(); undo(); return;
      case 'h': e.preventDefault(); showHint(); return;
      case 'd': e.preventDefault(); doDraw(); return;
      case 'f': e.preventDefault(); quick(); return;
      case 'a': e.preventDefault(); finishAll(); return;
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('pagehide', save);

  /* ---------- Start ---------- */
  if (window.self !== window.top) $('backLink').hidden = true;
  menuSync(); focusFirst($('sMenu'));
})();

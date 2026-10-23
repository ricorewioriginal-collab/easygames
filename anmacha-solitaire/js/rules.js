/* AnMaCha Solitaire – Regeln (ohne DOM; Browser und Node)
 * Karte: { id, s: Farbe 0 ♠ 1 ♥ 2 ♦ 3 ♣, r: Rang 1 (Ass) … 13 (König), up: aufgedeckt }
 * Spielstand: { game, opt, seed, t: Stapel[], f: Ablagen[], stock, waste, cells, done, moves, time, won } */
(function (root) {
  'use strict';
  const RED = s => s === 1 || s === 2;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function deck(nDecks, suits) { // Spider: weniger Farben, dafür mehr Karten je Farbe
    const out = []; let id = 0; const S = suits === 1 ? [0] : suits === 2 ? [0, 1] : [0, 1, 2, 3];
    const per = 4 * nDecks / S.length;
    for (const s of S) for (let k = 0; k < per; k++) for (let r = 1; r <= 13; r++) out.push({ id: id++, s, r, up: false });
    return out;
  }
  function shuffle(a, seed) { const rnd = rng(seed); for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function deal(game, opt, seed) {
    opt = Object.assign({ draw: 1, suits: 1 }, opt || {}); seed = seed >>> 0;
    const st = { v: 1, game, opt, seed, t: [], f: [], stock: [], waste: [], cells: [], done: 0, moves: 0, time: 0, won: false, passes: 0 };
    if (game === 'klondike') {
      const d = shuffle(deck(1, 4), seed);
      for (let i = 0; i < 7; i++) { const p = []; for (let k = 0; k <= i; k++) p.push(d.pop()); p[p.length - 1].up = true; st.t.push(p); }
      st.stock = d; st.f = [[], [], [], []];
    } else if (game === 'spider') {
      const d = shuffle(deck(2, opt.suits), seed);
      for (let i = 0; i < 10; i++) { const p = [], n = i < 4 ? 6 : 5; for (let k = 0; k < n; k++) p.push(d.pop()); p[p.length - 1].up = true; st.t.push(p); }
      st.stock = d; st.f = [];
    } else { // freecell
      const d = shuffle(deck(1, 4), seed); d.forEach(c => { c.up = true; });
      for (let i = 0; i < 8; i++) st.t.push([]);
      for (let k = 0; d.length; k++) st.t[k % 8].push(d.pop());
      st.cells = [null, null, null, null]; st.f = [[], [], [], []];
    }
    return st;
  }

  /* ---------- Hilfen ---------- */
  const top = p => p[p.length - 1];
  const clone = st => JSON.parse(JSON.stringify(st));
  function pile(st, k, i) { return k === 't' ? st.t[i] : k === 'f' ? st.f[i] : k === 'w' ? st.waste : k === 's' ? st.stock : null; }
  // ist ab Index n eine bewegliche Reihe?
  function runOK(st, p, n) {
    if (n < 0 || n >= p.length || !p[n].up) return false;
    for (let k = n + 1; k < p.length; k++) {
      const a = p[k - 1], b = p[k];
      if (!b.up || a.r !== b.r + 1) return false;
      if (st.game === 'spider' ? a.s !== b.s : RED(a.s) === RED(b.s)) return false;
    }
    return true;
  }
  function freeCellMax(st, toEmpty) {
    const cells = st.cells.filter(c => !c).length, empties = st.t.filter(p => !p.length).length - (toEmpty ? 1 : 0);
    return (cells + 1) * Math.pow(2, Math.max(0, empties));
  }
  function canStack(st, card, onto) { // Karte (Basis einer Reihe) auf Stapel legen
    if (!onto.length) return st.game === 'klondike' ? card.r === 13 : true;
    const t = top(onto); if (!t.up) return false;
    if (t.r !== card.r + 1) return false;
    return st.game === 'spider' ? true : RED(t.s) !== RED(card.s);
  }
  function canFound(st, card, fi) {
    if (st.game === 'spider') return false;
    const f = st.f[fi];
    if (!f.length) return card.r === 1;
    return top(f).s === card.s && top(f).r === card.r - 1;
  }
  const foundFor = (st, card) => { for (let i = 0; i < 4; i++) if (canFound(st, card, i)) return i; return -1; };

  /* ---------- Zug prüfen und ausführen ----------
   * m = { from: { k: 't'|'w'|'f'|'c', i, n }, to: { k: 't'|'f'|'c', i } } */
  function cardsOf(st, from) {
    if (from.k === 't') return st.t[from.i].slice(from.n);
    if (from.k === 'w') return st.waste.length ? [top(st.waste)] : [];
    if (from.k === 'f') return st.f[from.i].length ? [top(st.f[from.i])] : [];
    if (from.k === 'c') return st.cells[from.i] ? [st.cells[from.i]] : [];
    return [];
  }
  function legal(st, m) {
    if (st.won) return false;
    const { from, to } = m; if (from.k === to.k && from.i === to.i) return false;
    const cs = cardsOf(st, from); if (!cs.length) return false;
    if (from.k === 't' && !runOK(st, st.t[from.i], from.n)) return false;
    if (from.k === 'f' && st.game !== 'klondike' && st.game !== 'freecell') return false;
    if (to.k === 'f') return cs.length === 1 && canFound(st, cs[0], to.i) && from.k !== 'f';
    if (to.k === 'c') return st.game === 'freecell' && cs.length === 1 && !st.cells[to.i] && from.k !== 'c';
    if (to.k === 't') {
      const dst = st.t[to.i];
      if (st.game === 'freecell' && cs.length > freeCellMax(st, !dst.length)) return false;
      if (st.game === 'klondike' && from.k === 't' && !dst.length && from.n === 0 && cs[0].r === 13) return false; // König von leer nach leer bringt nichts
      return canStack(st, cs[0], dst);
    }
    return false;
  }
  function flipTop(st) { let n = 0; for (const p of st.t) if (p.length && !top(p).up) { top(p).up = true; n++; } return n; }
  function spiderCollect(st) { // fertige Reihe König → Ass einer Farbe ablegen
    let n = 0;
    for (const p of st.t) {
      if (p.length < 13) continue;
      const k = p.length - 13;
      if (p[k].r === 13 && runOK(st, p, k)) { st.f.push(p.splice(k, 13)); st.done++; n++; }
    }
    return n;
  }
  function apply(st, m) {
    if (!legal(st, m)) return false;
    const { from, to } = m;
    let cs;
    if (from.k === 't') cs = st.t[from.i].splice(from.n);
    else if (from.k === 'w') cs = [st.waste.pop()];
    else if (from.k === 'f') cs = [st.f[from.i].pop()];
    else { cs = [st.cells[from.i]]; st.cells[from.i] = null; }
    if (to.k === 't') st.t[to.i].push(...cs);
    else if (to.k === 'f') st.f[to.i].push(cs[0]);
    else st.cells[to.i] = cs[0];
    st.moves++;
    flipTop(st);
    if (st.game === 'spider') { spiderCollect(st); flipTop(st); }
    checkWin(st);
    return true;
  }
  // Stapel: Patience zieht 1/3 Karten bzw. legt den Abwurf zurück; Spider teilt 10 Karten aus
  function canDraw(st) {
    if (st.won) return false;
    if (st.game === 'klondike') return st.stock.length > 0 || st.waste.length > 0;
    if (st.game === 'spider') return st.stock.length > 0 && st.t.every(p => p.length);
    return false;
  }
  function draw(st) {
    if (!canDraw(st)) return false;
    if (st.game === 'klondike') {
      if (!st.stock.length) { st.stock = st.waste.reverse().map(c => (c.up = false, c)); st.waste = []; st.passes++; }
      else for (let k = 0; k < st.opt.draw && st.stock.length; k++) { const c = st.stock.pop(); c.up = true; st.waste.push(c); }
    } else {
      for (const p of st.t) { const c = st.stock.pop(); c.up = true; p.push(c); }
      spiderCollect(st); flipTop(st);
    }
    st.moves++;
    return true;
  }
  function checkWin(st) {
    if (st.game === 'spider') st.won = st.done === 8;
    else st.won = st.f.every(f => f.length === 13);
    return st.won;
  }

  /* ---------- alle sinnvollen Züge (für Tipp, Antippen und Computer-Hilfen) ---------- */
  function moves(st) {
    const out = [], T = st.t;
    const add = (from, to, w) => { const m = { from, to }; if (legal(st, m)) out.push(Object.assign(m, { w })); };
    // Quellen
    const srcs = [];
    T.forEach((p, i) => { for (let n = 0; n < p.length; n++) if (runOK(st, p, n)) { srcs.push({ k: 't', i, n }); } });
    if (st.waste.length) srcs.push({ k: 'w', i: 0 });
    st.cells.forEach((c, i) => { if (c) srcs.push({ k: 'c', i }); });
    for (const s of srcs) {
      const cs = cardsOf(st, s), base = cs[0];
      const p = s.k === 't' ? T[s.i] : null;
      const reveals = p && s.n > 0 && !p[s.n - 1].up, empties = p && s.n === 0;
      if (cs.length === 1) for (let fi = 0; fi < (st.game === 'spider' ? 0 : 4); fi++) add(s, { k: 'f', i: fi }, 100 + (reveals ? 20 : 0));
      for (let ti = 0; ti < T.length; ti++) {
        if (s.k === 't' && ti === s.i) continue;
        const dst = T[ti];
        let w = 10;
        if (reveals) w += 50; if (empties) w += 15;
        if (!dst.length) { if (empties) continue; w += reveals ? 0 : (s.k === 'w' || s.k === 'c' ? 10 : -25); } // in leere Spalte nur, wenn es etwas bringt
        if (st.game === 'spider' && dst.length && top(dst).s === base.s) w += 25;
        if (st.game === 'spider' && p && s.n > 0 && p[s.n - 1].up && p[s.n - 1].r === base.r + 1 && p[s.n - 1].s === base.s) continue; // zerreißt eine gleichfarbige Reihe
        if (st.game === 'klondike' && p && s.n > 0 && p[s.n - 1].up && !reveals) { const below = p[s.n - 1]; if (foundFor(st, below) < 0) w -= 30; }
        if (s.k === 'w') w += 5;
        if (s.k === 'c') w += 8;
        add(s, { k: 't', i: ti }, w);
      }
      if (st.game === 'freecell' && cs.length === 1 && s.k === 't') { const ci = st.cells.indexOf(null); if (ci >= 0) add(s, { k: 'c', i: ci }, reveals ? 4 : 1); }
    }
    if (st.game === 'klondike') st.f.forEach((f, i) => { if (f.length) for (let ti = 0; ti < 7; ti++) add({ k: 'f', i }, { k: 't', i: ti }, -5); });
    return out.sort((a, b) => b.w - a.w);
  }
  // beste Zielstelle für einen angetippten Stapelteil
  function bestMoveFrom(st, from) {
    const ms = moves(st).filter(m => m.from.k === from.k && m.from.i === from.i && (from.n === undefined || m.from.n === from.n));
    return ms[0] || null;
  }
  // Tipp: sinnvollster Zug, sonst Stapel ziehen
  function hint(st) {
    const ms = moves(st).filter(m => m.w > 0);
    if (ms.length) return ms[0];
    if (canDraw(st)) return { draw: true };
    return null;
  }
  // sicher ablegen: Karten, die sicher auf die Ablage können (Patience/FreeCell)
  function safeAuto(st) {
    if (st.game === 'spider' || st.won) return null;
    const minRank = col => Math.min(...[0, 1, 2, 3].filter(s => RED(s) === col).map(s => { const f = st.f.find(x => x.length && x[0].s === s); return f ? f.length : 0; }));
    const srcs = st.t.map((p, i) => p.length ? { k: 't', i, n: p.length - 1 } : null).filter(Boolean);
    if (st.waste.length) srcs.push({ k: 'w', i: 0 });
    st.cells.forEach((c, i) => { if (c) srcs.push({ k: 'c', i }); });
    for (const s of srcs) {
      const c = cardsOf(st, s)[0]; if (!c || !c.up) continue;
      const fi = foundFor(st, c); if (fi < 0) continue;
      if (c.r <= 2 || c.r <= minRank(!RED(c.s)) + 1) return { from: s, to: { k: 'f', i: fi } };
    }
    return null;
  }
  // automatisch fertig spielen möglich? (alles aufgedeckt, Patience: Stapel leer)
  function canFinish(st) {
    if (st.won || st.game === 'spider') return false;
    if (st.game === 'klondike' && (st.stock.length || st.waste.length > 1)) return false;
    return st.t.every(p => p.every(c => c.up));
  }
  function finishStep(st) { // nächste Karte (niedrigste zuerst) auf die Ablage
    let best = null;
    const srcs = st.t.map((p, i) => p.length ? { k: 't', i, n: p.length - 1 } : null).filter(Boolean);
    if (st.waste.length) srcs.push({ k: 'w', i: 0 });
    st.cells.forEach((c, i) => { if (c) srcs.push({ k: 'c', i }); });
    for (const s of srcs) { const c = cardsOf(st, s)[0], fi = foundFor(st, c); if (fi >= 0 && (!best || c.r < best.r)) best = { m: { from: s, to: { k: 'f', i: fi } }, r: c.r }; }
    return best ? best.m : null;
  }

  /* ---------- Patience-Löser (offline für die Liste lösbarer Partien und für Tests) ---------- */
  function solveKlondike(st0, limit) {
    limit = limit || 200000;
    const seen = new Set(); let nodes = 0;
    const key = st => st.t.map(p => p.filter(c => !c.up).length + ':' + p.filter(c => c.up).map(c => c.id).join(',')).sort().join('|') + '#' + st.f.map(f => f.length).join(',') + '#' + st.stock.map(c => c.id).join(',') + '/' + st.waste.map(c => c.id).join(',');
    function dfs(st, depth) {
      if (st.won) return true;
      if (++nodes > limit || depth > 400) return false;
      const k = key(st); if (seen.has(k)) return false; seen.add(k);
      const auto = safeAuto(st); if (auto) { const s2 = clone(st); apply(s2, auto); return dfs(s2, depth + 1); }
      const ms = moves(st).filter(m => m.w > 0 && m.from.k !== 'f');
      for (const m of ms) { const s2 = clone(st); if (apply(s2, m) && dfs(s2, depth + 1)) return true; if (nodes > limit) return false; }
      if (canDraw(st) && st.passes < 30) { const s2 = clone(st); draw(s2); s2.moves--; if (dfs(s2, depth + 1)) return true; }
      return false;
    }
    const ok = dfs(clone(st0), 0);
    return { ok, nodes, aborted: !ok && nodes > limit };
  }

  const AS = { RED, rng, deal, clone, pile, top, runOK, canStack, canFound, legal, apply, canDraw, draw, checkWin, moves, bestMoveFrom, hint, safeAuto, canFinish, finishStep, solveKlondike, freeCellMax, cardsOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = AS;
  root.AS = AS;
})(typeof self !== 'undefined' ? self : this);

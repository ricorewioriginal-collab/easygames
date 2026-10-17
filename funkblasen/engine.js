/* FUNKBLASEN – Spielregeln (rein und deterministisch: kein DOM, kein Three.js, in Node testbar).
 *
 * Koordinatensystem (gilt für Renderer, Platzierung, Suche und Tests):
 *   Spielfeld-Einheiten, Kugelradius R = 1, Breite W = 22 (11 Kugeln), x nach rechts, y nach UNTEN, y = 0 ist die Unterkante
 *   der Decke (bei ceil = 0). Gitter = versetzte Sechseck-Reihen ("odd-r"): Reihe r hat 11 Zellen, wenn (r + shift) gerade ist,
 *   sonst 10 Zellen, um R nach rechts versetzt. Zellmitte: x = R + 2R·c (+R bei kurzer Reihe), y = R + (r + ceil)·√3·R.
 *   shift wechselt nur, wenn oben eine neue Reihe eingeschoben wird (Endlos), ceil zählt, wie weit die Decke abgesenkt ist.
 */
(function (root, factory) {
  const E = factory();
  if (typeof module === 'object' && module.exports) module.exports = E; else root.FBEngine = E;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const COLS = 11, R = 1, ROW_H = Math.sqrt(3), W = COLS * 2 * R;
  const ROWS = 16;                 // Speicherreihen (mehr als je erreichbar)
  const DANGER = 12;               // effektive Reihe (r + ceil) >= DANGER nach einem Schuss = verloren
  const LAUNCH = { x: W / 2, y: R + 13.4 * ROW_H };
  const FIELD_H = LAUNCH.y + 2.2;
  const DANGER_Y = R + (DANGER - 0.5) * ROW_H;
  const COLL = 1.7;                // Kollisionsabstand: etwas kleiner als 2R, damit Lücken von einer Kugel passierbar sind
  const SPEED = 40, DT = 1 / 240;  // Simulation in festen Zeitschritten (unabhängig von der Bildrate)
  const MIN_ANG = 0.14;            // ≈ 8° über der Waagerechten
  const COLORS = 6;
  const COLORED = { n: 1, i: 1, l: 1, h: 1, w: 1 };
  const NEAR = { b: 1, q: 1, k: 1, x: 1 };   // normal, Eis, Blitz, Kette, Farbwandler
  // n normal · i Eis (gefroren) · l Blitzblase · h Kettenblase · w Farbwandler · s Stein · k Kristall · x Stern · b Bombe · q Schalter
  // Regeln: Kristall, Stern, Bombe und Schalter lösen aus, wenn direkt daneben etwas platzt (oder sie fallen). Steine brauchen zwei
  // solche Treffer (in zwei verschiedenen Schüssen: erst Riss, dann Bruch) und fallen sonst nur mit herunter. So bleibt jedes Feld lösbar.

  // ---------- Zufall (mulberry32, Zustand ist eine Zahl im Spielzustand) ----------
  function rnd(st, key) {
    let t = (st[key] = (st[key] + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ---------- Gitter ----------
  const isShort = (st, r) => ((r + st.shift) & 1) === 1;
  const rowLen = (st, r) => (isShort(st, r) ? COLS - 1 : COLS);
  const cellX = (st, r, c) => R + c * 2 * R + (isShort(st, r) ? R : 0);
  const cellY = (st, r) => R + (r + st.ceil) * ROW_H;
  const inside = (st, r, c) => r >= 0 && r < ROWS && c >= 0 && c < rowLen(st, r);
  const N_SHORT = [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  const N_LONG = [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]];
  function neighbors(st, r, c) {
    const d = isShort(st, r) ? N_SHORT : N_LONG, out = [];
    for (let i = 0; i < 6; i++) { const rr = r + d[i][0], cc = c + d[i][1]; if (inside(st, rr, cc)) out.push([rr, cc]); }
    return out;
  }
  function axial(st, r, c) { const rr = r + st.shift; return [c - ((rr - (rr & 1)) >> 1), rr]; }
  function hexDist(st, r1, c1, r2, c2) {
    const a = axial(st, r1, c1), b = axial(st, r2, c2), dq = a[0] - b[0], dr = a[1] - b[1];
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  }
  function emptyRow(st, r) { return new Array(rowLen(st, r)).fill(null); }
  function eachCell(st, fn) { for (let r = 0; r < ROWS; r++) { const row = st.grid[r]; for (let c = 0; c < row.length; c++) if (row[c]) fn(row[c], r, c); } }
  const isColored = cell => !!cell && COLORED[cell.k] === 1 && cell.c >= 0;
  const matchable = cell => isColored(cell) && cell.k !== 'i';

  function colorsPresent(st) {
    const seen = new Array(COLORS).fill(0); eachCell(st, cell => { if (isColored(cell)) seen[cell.c]++; });
    const out = []; for (let i = 0; i < COLORS; i++) if (seen[i]) out.push(i); return out;
  }
  function count(st, pred) { let n = 0; eachCell(st, cell => { if (pred(cell)) n++; }); return n; }
  const coloredCount = st => count(st, isColored);
  function maxRow(st) { let m = -1; eachCell(st, (cell, r) => { if (r > m) m = r; }); return m < 0 ? -1 : m + st.ceil; }

  // ---------- Zustand ----------
  // def: { mode, rows:[[cell|null]] (Reihen bei shift 0), colors:[…], shots (-1 = unbegrenzt), goal:{type:'clear'|'rescue'|'score', n},
  //        seed, specials:[{at, k}], wind, ceilEvery, s2, s3, endless:{…} }
  function createState(def) {
    const st = {
      mode: def.mode || 'level', id: def.id || 0, shift: 0, ceil: 0, grid: [], colors: (def.colors || [0, 1, 2]).slice(),
      score: 0, combo: 0, bestCombo: 0, shotsLeft: def.shots == null ? -1 : def.shots, shotsTotal: def.shots == null ? -1 : def.shots, shotsUsed: 0,
      goal: Object.assign({ type: 'clear', n: 0 }, def.goal || {}), rescued: 0, crystals: 0,
      rng: (def.seed >>> 0) || 1, rngRow: ((def.seed >>> 0) ^ 0x5bd1e995) || 7, drawn: 0,
      specials: (def.specials || []).map(s => ({ at: s.at, k: s.k })), wind: def.wind || 0,
      ceilEvery: def.ceilEvery || 0, ceilCount: 0, s2: def.s2 == null ? 0.2 : def.s2, s3: def.s3 == null ? 0.4 : def.s3,
      wave: 0, pushEvery: 0, pushCount: 0, rowsPushed: 0, jokerUsed: false, cur: null, next: null
    };
    for (let r = 0; r < ROWS; r++) {
      st.grid.push(emptyRow(st, r));
      const src = def.rows && def.rows[r];
      if (src) for (let c = 0; c < st.grid[r].length; c++) if (src[c]) st.grid[r][c] = Object.assign({}, src[c]);
    }
    if (st.mode === 'endless') {
      st.pushEvery = 6;
      const n = def.startRows || 6; for (let i = 0; i < n; i++) pushRow(st);
    }
    linkChains(st);
    st.crystals = count(st, cell => cell.k === 'k');
    if (st.goal.type === 'rescue' && !(st.goal.n > 0)) st.goal.n = st.crystals;
    st.cur = draw(st); st.next = draw(st);
    return st;
  }
  function linkChains(st) {   // zusammenhängende Kettenblasen bilden eine Gruppe
    let g = 0; eachCell(st, cell => { if (cell.k === 'h') cell.g = -1; });
    eachCell(st, (cell, r, c) => {
      if (cell.k !== 'h' || cell.g >= 0) return;
      const stack = [[r, c]]; cell.g = ++g;
      while (stack.length) { const [a, b] = stack.pop(); for (const [x, y] of neighbors(st, a, b)) { const n = st.grid[x][y]; if (n && n.k === 'h' && n.g < 0) { n.g = g; stack.push([x, y]); } } }
    });
  }
  function clone(st) {
    const o = Object.assign({}, st);
    o.grid = st.grid.map(row => row.map(cell => (cell ? Object.assign({}, cell) : null)));
    o.colors = st.colors.slice(); o.goal = Object.assign({}, st.goal); o.specials = st.specials.map(s => Object.assign({}, s));
    o.cur = st.cur && Object.assign({}, st.cur); o.next = st.next && Object.assign({}, st.next);
    return o;
  }

  // ---------- Warteschlange (aktuelle + nächste Kugel) ----------
  function draw(st) {
    const idx = st.drawn++;
    for (const s of st.specials) if (s.at === idx + 1) return { c: -1, s: s.k };
    if (st.mode === 'endless' && idx > 0 && idx % 24 === 0) return { c: -1, s: ['bomb', 'rainbow', 'bolt'][(idx / 24) % 3] };
    const cols = colorsPresent(st);
    const list = cols.length ? cols : st.colors;
    return { c: list[Math.floor(rnd(st, 'rng') * list.length)], s: null };
  }
  function fixQueue(st) {   // nie eine Farbe ausgeben, die nicht mehr auf dem Feld liegt
    const cols = colorsPresent(st); if (!cols.length) return;
    for (const key of ['cur', 'next']) {
      const b = st[key];
      if (b && !b.s && cols.indexOf(b.c) < 0) st[key] = { c: cols[Math.floor(rnd(st, 'rng') * cols.length)], s: null };
    }
  }
  function swap(st) { const t = st.cur; st.cur = st.next; st.next = t; return true; }

  // ---------- Flugbahn ----------
  const clampAng = a => Math.max(MIN_ANG, Math.min(Math.PI - MIN_ANG, a));
  function collide(st, x, y) {
    const r0 = Math.floor((y - R) / ROW_H - st.ceil);
    let best = null, bd = COLL * COLL;
    for (let r = r0 - 1; r <= r0 + 2; r++) {
      if (r < 0 || r >= ROWS) continue;
      const dy = y - cellY(st, r); if (dy * dy >= bd) continue;
      const row = st.grid[r];
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) continue;
        const dx = x - cellX(st, r, c), d2 = dx * dx + dy * dy;
        if (d2 < bd) { bd = d2; best = [r, c]; }
      }
    }
    return best;
  }
  function attached(st, r, c) {
    if (r === 0) return true;
    for (const [a, b] of neighbors(st, r, c)) if (st.grid[a][b]) return true;
    return false;
  }
  function snap(st, x, y, hit) {
    let cands = [];
    if (hit && hit.type === 'cell') cands = neighbors(st, hit.r, hit.c).filter(([a, b]) => !st.grid[a][b]);
    else for (let c = 0; c < rowLen(st, 0); c++) if (!st.grid[0][c]) cands.push([0, c]);
    if (!cands.length) for (let r = 0; r < ROWS; r++) for (let c = 0; c < rowLen(st, r); c++) if (!st.grid[r][c] && attached(st, r, c)) cands.push([r, c]);
    let best = null, bd = Infinity;
    for (const [r, c] of cands) { const dx = x - cellX(st, r, c), dy = y - cellY(st, r), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { r, c }; } }
    return best;
  }
  function simulate(st, ang) {
    ang = clampAng(ang);
    let x = LAUNCH.x, y = LAUNCH.y, vx = Math.cos(ang) * SPEED; const vy = -Math.sin(ang) * SPEED;
    const wind = st.wind || 0, ceilY = st.ceil * ROW_H, path = [{ x, y }];
    let bounces = 0, hit = null, steps = 0;
    for (let i = 0; i < 20000; i++) {
      if (wind) vx += wind * DT;
      x += vx * DT; y += vy * DT;
      if (x < R) { x = 2 * R - x; vx = -vx; bounces++; path.push({ x: R, y, b: 1 }); steps = 0; }
      else if (x > W - R) { x = 2 * (W - R) - x; vx = -vx; bounces++; path.push({ x: W - R, y, b: 1 }); steps = 0; }
      if (y <= ceilY + R) { y = ceilY + R; hit = { type: 'ceil' }; break; }
      const h = collide(st, x, y); if (h) { hit = { type: 'cell', r: h[0], c: h[1] }; break; }
      if (wind && ++steps % 12 === 0) path.push({ x, y });
    }
    path.push({ x, y });
    const cell = snap(st, x, y, hit);
    if (cell) path.push({ x: cellX(st, cell.r, cell.c), y: cellY(st, cell.r) });
    let len = 0; for (let i = 1; i < path.length; i++) len += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    return { ang, path, len, cell, bounces, hit };
  }

  // ---------- Treffer auswerten ----------
  function flood(st, r, c) {
    const start = st.grid[r][c]; if (!matchable(start)) return [];
    const col = start.c, seen = new Set([r * 32 + c]), out = [[r, c]], stack = [[r, c]];
    while (stack.length) {
      const [a, b] = stack.pop();
      for (const [x, y] of neighbors(st, a, b)) {
        const k = x * 32 + y, n = st.grid[x][y];
        if (!seen.has(k) && matchable(n) && n.c === col) { seen.add(k); out.push([x, y]); stack.push([x, y]); }
      }
    }
    return out;
  }
  // Regenbogen: Farbe der größten angrenzenden Gruppe; Gleichstand -> Farbe mit mehr Kugeln auf dem Feld, dann kleinste Farbnummer
  function rainbowColor(st, r, c) {
    let best = -1, bestSize = -1, bestTotal = -1;
    const tried = new Set();
    for (const [a, b] of neighbors(st, r, c)) {
      const n = st.grid[a][b]; if (!matchable(n) || tried.has(n.c)) continue;
      tried.add(n.c);
      st.grid[r][c] = { k: 'n', c: n.c };
      const size = flood(st, r, c).length, total = count(st, x => isColored(x) && x.c === n.c);
      st.grid[r][c] = null;
      if (size > bestSize || (size === bestSize && (total > bestTotal || (total === bestTotal && n.c < best)))) { best = n.c; bestSize = size; bestTotal = total; }
    }
    if (best < 0) { const cols = colorsPresent(st); best = cols.length ? cols[0] : st.colors[0]; }
    return best;
  }
  function anchoredSet(st) {
    const seen = new Set(), stack = [];
    for (let c = 0; c < rowLen(st, 0); c++) if (st.grid[0][c]) { seen.add(c); stack.push([0, c]); }
    while (stack.length) {
      const [a, b] = stack.pop();
      for (const [x, y] of neighbors(st, a, b)) { const k = x * 32 + y; if (!seen.has(k) && st.grid[x][y]) { seen.add(k); stack.push([x, y]); } }
    }
    return seen;
  }

  // Legt die Kugel ab und wertet alles aus. Liefert die Ereignisse (für Grafik, Ton, Erfolge und Tests).
  function land(st, sim, bubble) {
    const r = sim.cell.r, c = sim.cell.c;
    const ev = { r, c, special: bubble.s || null, color: -1, matched: 0, popped: [], dropped: [], thawed: [], cracked: [], booms: [], bolts: [],
      rescued: 0, starsHit: 0, iceBroken: 0, points: 0, bounces: sim.bounces, switchFired: false, chainFired: false, clearedAll: false, combo: 0 };
    const toPop = new Map(), queue = [];
    const enqueue = (a, b, cause) => { const k = a * 32 + b, cell = st.grid[a][b]; if (!cell || toPop.has(k)) return; toPop.set(k, { r: a, c: b, cell, cause }); queue.push([a, b]); };
    const area = (a, b, rad, cause) => { for (let x = Math.max(0, a - rad); x <= Math.min(ROWS - 1, a + rad); x++) for (let y = 0; y < rowLen(st, x); y++) if (hexDist(st, a, b, x, y) <= rad) enqueue(x, y, cause); };
    if (bubble.s === 'bomb') { ev.booms.push({ r, c, rad: 2 }); area(r, c, 2, 'boom'); }
    else if (bubble.s === 'bolt') { ev.bolts.push(r); for (let y = 0; y < rowLen(st, r); y++) enqueue(r, y, 'bolt'); }
    else {
      const col = bubble.s === 'rainbow' ? rainbowColor(st, r, c) : bubble.c;
      st.grid[r][c] = { k: 'n', c: col }; ev.color = col;
      const grp = flood(st, r, c);
      if (grp.length >= 3) { ev.matched = grp.length; for (const [a, b] of grp) enqueue(a, b, 'match'); }
      for (const [a, b] of neighbors(st, r, c)) { const n = st.grid[a][b]; if (n && n.k === 'q') enqueue(a, b, 'switch'); }
    }
    let thawAll = false; const cracked = new Set();
    for (let qi = 0; qi < queue.length; qi++) {       // Kettenreaktionen: jede Zelle höchstens einmal (toPop), keine Rekursion
      const [a, b] = queue[qi], cell = st.grid[a][b];
      if (cell.k === 'l') { ev.bolts.push(a); for (let y = 0; y < rowLen(st, a); y++) enqueue(a, y, 'bolt'); }
      else if (cell.k === 'h') { ev.chainFired = true; eachCell(st, (n, x, y) => { if (n.k === 'h' && n.g === cell.g) enqueue(x, y, 'chain'); }); }
      else if (cell.k === 'b') { ev.booms.push({ r: a, c: b, rad: 1 }); area(a, b, 1, 'boom'); }
      else if (cell.k === 'q') { thawAll = true; ev.switchFired = true; }
      for (const [x, y] of neighbors(st, a, b)) {
        const n = st.grid[x][y]; if (!n) continue;
        if (NEAR[n.k]) enqueue(x, y, 'near');                     // Bombe, Schalter, Kristall, Stern reagieren auf Platzen daneben
        else if (n.k === 's' && !cracked.has(x * 32 + y)) {       // Stein: erster Treffer daneben = Riss, zweiter = zerbricht
          cracked.add(x * 32 + y);
          if (n.cr) enqueue(x, y, 'near'); else { n.cr = 1; ev.cracked.push({ r: x, c: y }); }
        }
      }
    }
    for (const p of toPop.values()) {
      st.grid[p.r][p.c] = null; ev.popped.push(p);
      if (p.cell.k === 'k') ev.rescued++; else if (p.cell.k === 'x') ev.starsHit++; else if (p.cell.k === 'i') ev.iceBroken++;
    }
    // Eis taut: neben der gelandeten Kugel, neben jeder geplatzten Kugel oder überall, wenn ein Schalter ausgelöst wurde
    const thaw = (a, b) => { const n = st.grid[a][b]; if (n && n.k === 'i') { n.k = 'n'; ev.thawed.push({ r: a, c: b, c0: n.c }); } };
    if (thawAll) eachCell(st, (n, a, b) => thaw(a, b));
    else {
      for (const [a, b] of neighbors(st, r, c)) thaw(a, b);
      for (const p of ev.popped) for (const [a, b] of neighbors(st, p.r, p.c)) thaw(a, b);
    }
    // Nicht mehr mit der Decke verbundene Gruppen fallen (genau einmal)
    const anchored = anchoredSet(st);
    const dropAll = (only) => eachCell(st, (cell, a, b) => {
      if (only && anchored.has(a * 32 + b)) return;
      st.grid[a][b] = null; ev.dropped.push({ r: a, c: b, cell });
      if (cell.k === 'k') ev.rescued++; else if (cell.k === 'x') ev.starsHit++;
    });
    dropAll(true);
    if (!colorsPresent(st).length && count(st, () => true)) { ev.clearedAll = true; dropAll(false); }   // Feld ohne Farbkugeln: Rest fällt
    // Farbwandler springen nach jedem Schuss eine Farbe weiter – außer sie wurden direkt getroffen (Kugel landet daneben)
    const hold = new Set(neighbors(st, r, c).map(([a, b]) => a * 32 + b));
    eachCell(st, (cell, a, b) => { if (cell.k === 'w' && !hold.has(a * 32 + b)) { const i = st.colors.indexOf(cell.c); cell.c = st.colors[(i + 1) % st.colors.length]; } });
    // Punkte
    const popN = ev.popped.length, dropN = ev.dropped.length;
    if (popN + dropN > 0) st.combo++; else st.combo = 0;
    st.bestCombo = Math.max(st.bestCombo, st.combo); ev.combo = st.combo;
    const mult = 1 + 0.5 * Math.min(Math.max(st.combo - 1, 0), 4);
    let pts = Math.round((popN * 10 + dropN * 20 + (dropN >= 8 ? 200 : 0)) * mult);
    if (popN > 0 && sim.bounces > 0) pts += 50 * Math.min(sim.bounces, 4);
    pts += ev.rescued * 100 + ev.starsHit * 250;
    st.score += pts; ev.points = pts; st.rescued += ev.rescued;
    return ev;
  }

  // ---------- Endlos: neue Reihe oben einschieben ----------
  function pushRow(st) {
    st.grid.pop(); st.shift ^= 1;
    const n = Math.min(COLORS, 3 + Math.floor(st.wave / 4)), row = emptyRow(st, 0);
    if (st.colors.length < n) st.colors = Array.from({ length: n }, (_, i) => i);
    const below = st.grid[0];
    for (let c = 0; c < row.length; c++) {
      const p = rnd(st, 'rngRow');
      let col;
      if (c > 0 && row[c - 1] && row[c - 1].c >= 0 && p < 0.42) col = row[c - 1].c;
      else if (below && below[c] && isColored(below[c]) && p < 0.62) col = below[c].c;
      else col = st.colors[Math.floor(rnd(st, 'rngRow') * st.colors.length)];
      const q = rnd(st, 'rngRow');
      if (st.wave >= 8 && q < 0.04) row[c] = { k: 's', c: -1 };
      else if (st.wave >= 3 && q < 0.075) row[c] = { k: 'x', c: -1 };
      else if (st.wave >= 5 && q < 0.1) row[c] = { k: 'i', c: col };
      else row[c] = { k: 'n', c: col };
    }
    st.grid.unshift(row); st.rowsPushed++;
  }

  const goalDone = st => st.goal.type === 'rescue' ? st.rescued >= st.goal.n
    : st.goal.type === 'score' ? (st.score >= st.goal.n || coloredCount(st) === 0) : coloredCount(st) === 0;
  function goalProgress(st) {
    if (st.goal.type === 'rescue') return { cur: Math.min(st.rescued, st.goal.n), max: st.goal.n };
    if (st.goal.type === 'score') return { cur: Math.min(st.score, st.goal.n), max: st.goal.n };
    return { cur: coloredCount(st), max: 0 };
  }
  function stars(st) {
    if (st.shotsTotal <= 0) return 3;
    const q = st.shotsLeft / st.shotsTotal;
    return q >= st.s3 ? 3 : q >= st.s2 ? 2 : 1;
  }
  const starShots = st => st.shotsTotal > 0 ? [Math.ceil(st.s2 * st.shotsTotal), Math.ceil(st.s3 * st.shotsTotal)] : [0, 0];

  // Nach dem Auswerten: Sieg, Niederlage, Decke, neue Reihen, Warteschlange
  function afterShot(st) {
    const out = { status: 'play', reason: null, bonus: 0, ceilDropped: false, pushed: 0 };
    if (st.mode !== 'endless' && goalDone(st)) {
      out.status = 'win';
      if (st.shotsLeft > 0) { out.bonus = st.shotsLeft * 50; st.score += out.bonus; }
      return out;
    }
    if (maxRow(st) >= DANGER) return Object.assign(out, { status: 'lose', reason: 'danger' });
    if (st.mode === 'endless') {
      st.pushCount++;
      const empty = coloredCount(st) === 0;
      if (empty) { st.score += 500; out.bonus = 500; }
      if (st.pushCount >= st.pushEvery || empty) {
        const n = empty ? 4 : 1;
        for (let i = 0; i < n; i++) { st.wave++; pushRow(st); }
        out.pushed = n; st.pushCount = 0; st.pushEvery = Math.max(3, 6 - Math.floor(st.wave / 6));
        linkChains(st);
        if (maxRow(st) >= DANGER) { fixQueue(st); return Object.assign(out, { status: 'lose', reason: 'danger' }); }
      }
    } else {
      if (st.shotsLeft === 0) return Object.assign(out, { status: 'lose', reason: 'shots' });
      if (st.ceilEvery > 0 && ++st.ceilCount >= st.ceilEvery) {
        st.ceilCount = 0; st.ceil++; out.ceilDropped = true;
        if (maxRow(st) >= DANGER) return Object.assign(out, { status: 'lose', reason: 'danger' });
      }
    }
    fixQueue(st);
    return out;
  }

  function shoot(st, ang) {
    const bubble = st.cur, sim = simulate(st, ang);
    st.cur = st.next; st.next = draw(st);
    if (st.shotsLeft > 0) st.shotsLeft--;
    st.shotsUsed++;
    return { sim, bubble };
  }
  function useJoker(st) { if (st.jokerUsed || st.cur.s) return false; st.jokerUsed = true; st.cur = { c: -1, s: 'rainbow' }; return true; }

  // ---------- Zustandsmaschine einer Spielrunde (menu → ready ⇄ aiming → flying → resolving → ready | win | lose, paused) ----------
  function Session(def, opts) {
    this.def = def; this.opts = opts || {};
    this.st = def.state ? def.state : createState(def);
    this.phase = 'ready'; this.prev = null; this.angle = Math.PI / 2;
    this.flight = null; this.t = 0; this.ev = null; this.result = null; this.resolveTime = 0;
    this.listeners = [];
  }
  Session.prototype.on = function (fn) { this.listeners.push(fn); };
  Session.prototype.emit = function (type, data) { for (const fn of this.listeners) fn(type, data, this); };
  Session.prototype.canAct = function () { return this.phase === 'ready' || this.phase === 'aiming'; };
  Session.prototype.aim = function (ang) { if (!this.canAct()) return false; this.angle = clampAng(ang); this.phase = 'aiming'; return true; };
  Session.prototype.fire = function (ang) {
    if (!this.canAct()) return false;                    // Schutz gegen Doppelschüsse: nur in ready/aiming
    if (ang != null) this.angle = clampAng(ang);
    const shot = shoot(this.st, this.angle);
    this.flight = shot; this.t = 0; this.phase = 'flying';
    this.emit('fire', shot);
    return true;
  };
  Session.prototype.swap = function () { if (!this.canAct()) return false; swap(this.st); this.emit('swap'); return true; };
  Session.prototype.joker = function () { if (!this.canAct()) return false; const ok = useJoker(this.st); if (ok) this.emit('joker'); return ok; };
  Session.prototype.pause = function () { if (this.phase === 'paused' || this.phase === 'win' || this.phase === 'lose') return false; this.prev = this.phase; this.phase = 'paused'; this.emit('pause'); return true; };
  Session.prototype.resume = function () { if (this.phase !== 'paused') return false; this.phase = this.prev || 'ready'; this.prev = null; this.emit('resume'); return true; };
  Session.prototype.flightPos = function () {   // Position der fliegenden Kugel entlang der vorab berechneten Bahn
    const f = this.flight; if (!f) return null;
    let d = Math.min(this.t * SPEED, f.sim.len); const p = f.sim.path;
    for (let i = 1; i < p.length; i++) {
      const seg = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      if (d <= seg || i === p.length - 1) { const k = seg ? Math.min(1, d / seg) : 1; return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k }; }
      d -= seg;
    }
    return p[p.length - 1];
  };
  Session.prototype.update = function (dt) {
    if (this.phase === 'flying') {
      this.t += dt;
      if (this.t * SPEED >= this.flight.sim.len) {
        const f = this.flight; this.flight = null;
        this.ev = land(this.st, f.sim, f.bubble);
        this.result = afterShot(this.st);
        this.phase = 'resolving'; this.resolveTime = this.opts.resolveTime == null ? 0.38 : this.opts.resolveTime;
        this.emit('land', { ev: this.ev, result: this.result, sim: f.sim, bubble: f.bubble });
      }
    } else if (this.phase === 'resolving') {
      this.resolveTime -= dt;
      if (this.resolveTime <= 0) {
        const res = this.result; this.result = null;
        if (res.status === 'win') { this.phase = 'win'; this.emit('win', res); }
        else if (res.status === 'lose') { this.phase = 'lose'; this.emit('lose', res); }
        else { this.phase = 'ready'; this.emit('ready'); }
      }
    }
  };

  return {
    COLS, R, ROW_H, W, ROWS, DANGER, DANGER_Y, LAUNCH, FIELD_H, COLL, SPEED, DT, MIN_ANG, COLORS,
    rnd, hashStr, isShort, rowLen, cellX, cellY, inside, neighbors, hexDist, eachCell, isColored, matchable, colorsPresent, coloredCount, count, maxRow,
    createState, clone, draw, fixQueue, swap, clampAng, simulate, collide, snap, flood, rainbowColor, anchoredSet, land, pushRow,
    goalDone, goalProgress, stars, starShots, afterShot, shoot, useJoker, Session, attached
  };
});

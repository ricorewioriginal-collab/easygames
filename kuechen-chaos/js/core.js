/* Küchen-Chaos – Spielkern ohne Grafik: Küche als Raster, Köche mit Bewegung und Zusammenstoß, Nehmen/Ablegen,
 * Schneiden, Kochen (Topf/Pfanne), Anbrennen und Feuer, Spülen, Förderband, Bestellungen mit Zeit und Trinkgeld –
 * und Computer-Köche, die selbst planen (Zutaten holen, schneiden, kochen, anrichten, servieren, löschen, spülen).
 * Läuft auf dem Fernseher/Solo-Gerät; Handys schicken nur Eingaben. */
const KC = (() => {
  'use strict';
  const D = typeof KC_DATA !== 'undefined' ? KC_DATA : require('./data.js');
  const { ING, CRATE, RECIPES, LEVELS } = D;
  const BOT_SPEED = .82, BOT_PAUSE = .3, SPEED = 4.3, RAD = .32, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const isFloorCh = ch => ch === '.' || ch === '1' || ch === '2';
  const mkRng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ing = i => ({ t: 'ing', ing: i, st: 'raw', prog: 0 });
  const plate = () => ({ t: 'plate', parts: [] });
  const keyOf = it => it && it.t === 'ing' ? (it.ing === 'bun' ? 'bun' : it.st === 'c' ? it.ing + ':c' : it.st === 'k' ? it.ing + ':k' : it.st === 'x' ? 'burnt' : it.ing) : null;
  // Multimenge: a ⊆ b
  const subset = (a, b) => { const m = {}; for (const x of b) m[x] = (m[x] || 0) + 1; for (const x of a) { if (!m[x]) return false; m[x]--; } return true; };
  const sameSet = (a, b) => a.length === b.length && subset(a, b);
  const canAdd = (G, parts, k, recs) => !!k && (recs || G.L.menu).some(r => subset(parts.concat([k]), RECIPES[r].parts));
  const contentKey = c => {
    if (!c || c.burnt) return null;
    if (c.t === 'pot') return c.parts.length === 3 && c.cook >= 1 ? (c.parts.every(p => p === c.parts[0]) ? 'soup:' + c.parts[0] : 'soup:mix') : null;
    if (c.t === 'pan') return c.parts.length === 1 && c.cook >= 1 ? c.parts[0] + ':k' : null;
    return null;
  };
  const fits = (c, it) => it && it.t === 'ing' && it.st === 'c' && !c.burnt && (c.t === 'pot' ? ING[it.ing].pot && c.parts.length < 3 && c.cook < 1 : ING[it.ing].pan && c.parts.length === 0);

  function newGame(li, chefs, opt) {
    opt = opt || {}; const L = LEVELS[li], map = L.map, H = map.length, W = map[0].length, tiles = [], spawns = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = map[r][c], t = { c, r, ch, kind: 'counter', it: null, n: 0, prog: 0, fire: 0, fireT: 0 };
      if (isFloorCh(ch)) { t.kind = 'floor'; if (ch !== '.') spawns[+ch - 1] = [c, r]; }
      else if (CRATE[ch]) { t.kind = 'crate'; t.ing = CRATE[ch]; }
      else if (ch === 'X') t.kind = 'board';
      else if (ch === 'S') { t.kind = 'stove'; t.it = { t: 'pot', parts: [], cook: 0, over: 0 }; }
      else if (ch === 'P') { t.kind = 'stove'; t.it = { t: 'pan', parts: [], cook: 0, over: 0 }; }
      else if (ch === 'A') t.kind = 'serve';
      else if (ch === 'Q') { t.kind = 'plates'; t.n = L.plates || 4; }
      else if (ch === 'R') t.kind = 'ret';
      else if (ch === 'W') t.kind = 'sink';
      else if (ch === 'Z') t.kind = 'trash';
      else if (ch === 'E') t.it = { t: 'ext' };
      else if ('<>^v'.includes(ch)) { t.kind = 'belt'; t.dir = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], 'v': [0, 1] }[ch]; }
      tiles.push(t);
    }
    const G = { L, li, W, H, tiles, chefs: [], orders: [], t: opt.time || L.time, total: opt.time || L.time, score: 0, served: 0, failed: 0, tips: 0, events: [], nextOrder: 2.5, oid: 0, rnd: mkRng(opt.seed || (Date.now() & 0xffff)), returns: [], beltT: 0, over: false, claims: {}, combo: 0 };
    G.idx = {}; tiles.forEach((t, i) => { (G.idx[t.kind] = G.idx[t.kind] || []).push(i); });
    regions(G);
    // Startplätze: 1, 2 aus dem Plan, weitere auf freien Bodenfeldern daneben
    const used = new Set();
    chefs.forEach((cd, i) => {
      let p = spawns[i]; if (!p || used.has(p + '')) { const base = spawns[i % 2] || spawns[0]; let best = null, bd = 1e9; for (const ti of G.idx.floor) { const t = tiles[ti], k = [t.c, t.r] + '', d = Math.abs(t.c - base[0]) + Math.abs(t.r - base[1]); if (!used.has(k) && d > 0 && d < bd) { bd = d; best = [t.c, t.r]; } } p = best || base; }
      used.add(p + '');
      G.chefs.push({ i, name: cd.name, look: cd.look == null ? i : cd.look, bot: !!cd.bot, x: p[0] + .5, z: p[1] + .5, vx: 0, vz: 0, fx: 0, fz: 1, held: null, dashT: 0, dashCd: 0, pickPrev: false, dashPrev: false, act: '', actT: 0, tgt: -1 });
    });
    if (opt.tutorial) { G.tut = true; G.orders.push({ id: ++G.oid, r: 'salat', t: 99, max: 99 }); } else { addOrder(G); addOrder(G); }
    return G;
  }
  const T = (G, c, r) => c < 0 || r < 0 || c >= G.W || r >= G.H ? null : G.tiles[r * G.W + c];
  const solid = (G, c, r) => { const t = T(G, c, r); return !t || t.kind !== 'floor'; };
  function regions(G) {
    G.reg = new Int8Array(G.tiles.length).fill(-1); let n = 0;
    for (const s of G.idx.floor) { if (G.reg[s] >= 0) continue; const st = [s]; G.reg[s] = n; while (st.length) { const i = st.pop(), t = G.tiles[i]; for (const [dx, dz] of DIRS) { const q = T(G, t.c + dx, t.r + dz); if (q && q.kind === 'floor') { const j = q.r * G.W + q.c; if (G.reg[j] < 0) { G.reg[j] = n; st.push(j); } } } } n++; }
    // Theken, die von mehreren Bereichen erreichbar sind (geteilte Küche)
    G.shared = []; G.tiles.forEach((t, i) => { if (t.kind !== 'counter' && t.kind !== 'board') return; const rs = new Set(); for (const [dx, dz] of DIRS) { const q = T(G, t.c + dx, t.r + dz); if (q && q.kind === 'floor') rs.add(G.reg[q.r * G.W + q.c]); } if (rs.size > 1) G.shared.push(i); });
  }
  function addOrder(G) {
    if (G.orders.length >= 4) return; const m = G.L.menu, r = m[Math.floor(G.rnd() * m.length)], max = G.L.otime + RECIPES[r].parts.length * 6;
    G.orders.push({ id: ++G.oid, r, t: max, max }); G.events.push({ e: 'order', r });
  }
  const nChefs = G => G.chefs.length;

  /* ---------- Aktionen ---------- */
  function combine(G, a, b) {
    if (!a || !b) return null;
    const pa = a.t === 'plate', pb = b.t === 'plate', ca = a.t === 'pot' || a.t === 'pan', cb = b.t === 'pot' || b.t === 'pan';
    if (a.t === 'ing' && pb) { const k = keyOf(a); if (canAdd(G, b.parts, k)) { b.parts.push(k); return [null, b]; } return null; }
    if (pa && b.t === 'ing') { const k = keyOf(b); if (canAdd(G, a.parts, k)) { a.parts.push(k); return [a, null]; } return null; }
    if (a.t === 'ing' && cb) { if (fits(b, a)) { b.parts.push(a.ing); return [null, b]; } return null; }
    if (ca && b.t === 'ing') { if (fits(a, b)) { a.parts.push(b.ing); return [a, null]; } return null; }
    if (pa && cb) { const k = contentKey(b); if (k && canAdd(G, a.parts, k)) { a.parts.push(k); empty(b); return [a, b]; } return null; }
    if (ca && pb) { const k = contentKey(a); if (k && canAdd(G, b.parts, k)) { b.parts.push(k); empty(a); return [a, b]; } return null; }
    return null;
  }
  const empty = c => { c.parts = []; c.cook = 0; c.over = 0; c.burnt = false; };
  function interact(G, ch, ti) {
    const t = G.tiles[ti], h = ch.held, ev = e => G.events.push(Object.assign({ i: ch.i, ti }, e));
    if (t.fire > 0) return ev({ e: 'blocked' });
    switch (t.kind) {
      case 'crate': if (!h) { ch.held = ing(t.ing); ev({ e: 'pick' }); } return;
      case 'plates':
        if (!h && t.n > 0) { t.n--; ch.held = plate(); ev({ e: 'pick' }); }
        else if (h && h.t === 'plate' && !h.parts.length) { t.n++; ch.held = null; ev({ e: 'put' }); }
        else if (h && h.t === 'ing' && t.n > 0 && canAdd(G, [], keyOf(h))) { t.n--; ch.held = { t: 'plate', parts: [keyOf(h)] }; ev({ e: 'put' }); }
        return;
      case 'ret': if (!h && t.n > 0) { ch.held = { t: 'dirty', n: t.n }; t.n = 0; ev({ e: 'pick' }); } else if (h && h.t === 'dirty') { t.n += h.n; ch.held = null; ev({ e: 'put' }); } return;
      case 'sink': if (h && h.t === 'dirty') { t.n += h.n; ch.held = null; ev({ e: 'put' }); } return;
      case 'trash':
        if (!h) return;
        if (h.t === 'ing') ch.held = null; else if (h.t === 'plate') h.parts = []; else if (h.t === 'pot' || h.t === 'pan') empty(h); else return;
        return ev({ e: 'trash' });
      case 'serve':
        if (!h || h.t !== 'plate' || !h.parts.length) return;
        { const k = G.orders.findIndex(o => sameSet(h.parts, RECIPES[o.r].parts));
          if (k < 0) return ev({ e: 'wrong' });
          const o = G.orders.splice(k, 1)[0], tip = Math.ceil(8 * o.t / o.max), first = k === 0;
          G.combo = first ? G.combo + 1 : 0; const bonus = first ? Math.min(4, G.combo) * 2 : 0;
          G.score += RECIPES[o.r].pts + tip + bonus; G.tips += tip + bonus; G.served++; ch.held = null; G.returns.push({ t: 6 });
          ev({ e: 'serve', r: o.r, pts: RECIPES[o.r].pts + tip + bonus, tip: tip + bonus }); if (!G.orders.length) G.nextOrder = Math.min(G.nextOrder, 1.5);
        }
        return;
      default: // Theke, Brett, Herd, Band
        if (!h) { if (t.it) { ch.held = t.it; t.it = null; ev({ e: 'pick' }); } return; }
        if (!t.it) { if (t.kind === 'stove' && h.t !== 'pot' && h.t !== 'pan') return; if (t.kind === 'board' && h.t !== 'ing') return; t.it = h; ch.held = null; return ev({ e: 'put' }); }
        { const r = combine(G, h, t.it); if (r) { ch.held = r[0]; t.it = r[1]; ev({ e: 'combine' }); } else ev({ e: 'nope' }); }
    }
  }
  function useAct(G, ch, ti, dt) {
    ch.act = '';
    if (ch.held && ch.held.t === 'ext') {
      ch.act = 'spray'; for (const k of [.7, 1.5, 2.3]) { const t = T(G, Math.floor(ch.x + ch.fx * k), Math.floor(ch.z + ch.fz * k)); if (t && t.fire > 0) { t.fire = Math.max(0, t.fire - dt * 1.3); if (!t.fire) { t.fireT = 0; G.events.push({ e: 'out', ti: t.r * G.W + t.c }); } } }
      return;
    }
    if (ti < 0 || ch.held) return; const t = G.tiles[ti]; if (t.fire > 0) return;
    if (t.kind === 'board' && t.it && t.it.t === 'ing' && t.it.st === 'raw' && ING[t.it.ing].chop) {
      ch.act = 'chop'; const it = t.it, p0 = it.prog; it.prog += dt / (it.ing === 'meat' || it.ing === 'fish' ? 1.8 : 1.4);
      if (Math.floor(p0 * 4) !== Math.floor(it.prog * 4)) G.events.push({ e: 'chop', i: ch.i, ti });
      if (it.prog >= 1) { it.st = 'c'; it.prog = 0; G.events.push({ e: 'chopped', i: ch.i, ti }); }
    } else if (t.kind === 'sink' && t.n > 0) {
      ch.act = 'wash'; const p0 = t.prog; t.prog += dt / 1.6; if (Math.floor(p0 * 3) !== Math.floor(t.prog * 3)) G.events.push({ e: 'wash', i: ch.i, ti });
      if (t.prog >= 1) { t.prog = 0; t.n--; const q = G.idx.plates && G.tiles[G.idx.plates[0]]; if (q) q.n++; G.events.push({ e: 'washed', i: ch.i, ti }); }
    }
  }
  /* ---------- Bewegung ---------- */
  function move(G, ch, inp, dt) {
    let mx = +inp.mx || 0, mz = +inp.mz || 0; const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
    const acc = G.L.ice ? 4.2 : 16, k = Math.min(1, acc * dt);
    ch.vx += (mx * SPEED - ch.vx) * k; ch.vz += (mz * SPEED - ch.vz) * k;
    if (l > .2) { const n = Math.hypot(mx, mz); ch.fx = mx / n; ch.fz = mz / n; }
    ch.dashCd -= dt; ch.dashT -= dt;
    if (inp.dash && !ch.dashPrev && ch.dashCd <= 0) { ch.dashCd = .7; ch.dashT = .16; ch.vx += ch.fx * 9; ch.vz += ch.fz * 9; G.events.push({ e: 'dash', i: ch.i }); }
    ch.dashPrev = !!inp.dash;
    const sp = Math.hypot(ch.vx, ch.vz), cap = ch.dashT > 0 ? 13 : SPEED * (G.L.ice ? 1.15 : 1.05); if (sp > cap) { ch.vx *= cap / sp; ch.vz *= cap / sp; }
    ch.x += ch.vx * dt; ch.z += ch.vz * dt;
    for (let it = 0; it < 2; it++) {
      const c0 = Math.floor(ch.x), r0 = Math.floor(ch.z);
      for (let r = r0 - 1; r <= r0 + 1; r++) for (let c = c0 - 1; c <= c0 + 1; c++) {
        if (!solid(G, c, r)) continue; const px = Math.max(c, Math.min(ch.x, c + 1)), pz = Math.max(r, Math.min(ch.z, r + 1)), dx = ch.x - px, dz = ch.z - pz, d = Math.hypot(dx, dz);
        if (d < RAD) { if (d < 1e-4) { ch.x = c0 + .5; ch.z = r0 + .5; continue; } const nx = dx / d, nz = dz / d, push = RAD - d; ch.x += nx * push; ch.z += nz * push; const vn = ch.vx * nx + ch.vz * nz; if (vn < 0) { ch.vx -= vn * nx * (G.L.ice ? 1.6 : 1); ch.vz -= vn * nz * (G.L.ice ? 1.6 : 1); } }
      }
    }
  }
  function targetTile(G, ch) {
    for (const k of [.75, .55]) { const c = Math.floor(ch.x + ch.fx * k), r = Math.floor(ch.z + ch.fz * k), t = T(G, c, r); if (t && t.kind !== 'floor') return r * G.W + c; }
    if (ch.bot) return -1;
    // Hilfe für Menschen: steht man schräg, zählt die Station, die am ehesten in Blickrichtung liegt
    const c0 = Math.floor(ch.x), r0 = Math.floor(ch.z); let best = -1, bs = .35;
    for (const [dx, dz] of DIRS) { const t = T(G, c0 + dx, r0 + dz); if (!t || t.kind === 'floor') continue; const tx = c0 + dx + .5 - ch.x, tz = r0 + dz + .5 - ch.z, l = Math.hypot(tx, tz), sc = (tx * ch.fx + tz * ch.fz) / l - l * .25; if (l < 1.05 && sc > bs) { bs = sc; best = (r0 + dz) * G.W + c0 + dx; } }
    return best;
  }
  /* ---------- Schritt ---------- */
  function step(G, dt, inputs) {
    G.events.length = 0; if (G.over) return;
    if (!G.tut) G.t -= dt;
    for (let i = G.orders.length - 1; i >= 0; i--) { const o = G.orders[i]; if (!G.tut) o.t -= dt; if (o.t <= 0) { G.orders.splice(i, 1); G.score = Math.max(0, G.score - 10); G.failed++; G.combo = 0; G.events.push({ e: 'expire', r: o.r }); } }
    if (!G.tut) G.nextOrder -= dt; if (G.nextOrder <= 0 || (!G.orders.length && !G.tut)) { addOrder(G); G.nextOrder = G.L.every * [1.2, 1, .85, .72][Math.min(3, nChefs(G) - 1)]; }
    G.chefs.forEach((ch, i) => {
      const inp = ch.bot ? botInput(G, ch, dt) : (inputs && inputs[i]) || {};
      move(G, ch, inp, dt); ch.tgt = targetTile(G, ch);
      if (inp.pick && !ch.pickPrev && ch.tgt >= 0) interact(G, ch, ch.tgt); ch.pickPrev = !!inp.pick;
      if (inp.use) useAct(G, ch, ch.tgt, dt); else ch.act = '';
    });
    // Zusammenstoß der Köche
    for (let a = 0; a < G.chefs.length; a++) for (let b = a + 1; b < G.chefs.length; b++) { const A = G.chefs[a], B = G.chefs[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); if (d < .62 && d > 1e-4) { const p = (.62 - d) / 2, nx = dx / d, nz = dz / d; A.x -= nx * p; A.z -= nz * p; B.x += nx * p; B.z += nz * p; } }
    // Herde: kochen, anbrennen, Feuer
    for (const ti of G.idx.stove || []) {
      const t = G.tiles[ti], c = t.it; if (!c || t.fire > 0 || c.burnt) continue;
      const ready = c.t === 'pot' ? c.parts.length === 3 : c.parts.length === 1; c.stale = !ready && c.parts.length ? (c.stale || 0) + dt : 0; if (!ready) continue;
      if (c.cook < 1) { c.cook += dt / (c.t === 'pot' ? 10 : 6); if (c.cook >= 1) { c.cook = 1; G.events.push({ e: 'done', ti }); } }
      else { const o0 = c.over; c.over += dt / (c.t === 'pot' ? 10 : 8); if (o0 < .5 && c.over >= .5) G.events.push({ e: 'warn', ti }); if (c.over >= 1) { c.burnt = true; t.fire = 1; t.fireT = 0; G.events.push({ e: 'fire', ti }); } }
    }
    for (let i = 0; i < G.tiles.length; i++) {
      const t = G.tiles[i]; if (!(t.fire > 0)) continue; t.fireT += dt;
      if (t.fireT > 7) { t.fireT = 0; const opts = DIRS.map(([dx, dz]) => T(G, t.c + dx, t.r + dz)).filter(q => q && q.kind !== 'floor' && !(q.fire > 0) && q.kind !== 'serve'); if (opts.length) { const q = opts[Math.floor(G.rnd() * opts.length)]; q.fire = 1; q.fireT = 0; if (q.it && q.it.t === 'ing') q.it.st = 'x'; G.events.push({ e: 'fire', ti: q.r * G.W + q.c }); } }
    }
    // Förderband
    if (G.idx.belt) { G.beltT += dt; if (G.beltT >= 1) { G.beltT = 0; const bs = G.idx.belt.map(i => G.tiles[i]).sort((a, b) => (b.c * a.dir[0] + b.r * a.dir[1]) - (a.c * a.dir[0] + a.r * a.dir[1])); for (const t of bs) { if (!t.it) continue; const q = T(G, t.c + t.dir[0], t.r + t.dir[1]); if (q && (q.kind === 'belt' || q.kind === 'counter') && !q.it && !(q.fire > 0)) { q.it = t.it; t.it = null; } } } }
    // zurückkommende Teller
    for (let i = G.returns.length - 1; i >= 0; i--) { const r = G.returns[i]; r.t -= dt; if (r.t <= 0) { G.returns.splice(i, 1); const q = G.L.sink ? G.idx.ret : G.idx.plates; if (q) G.tiles[q[0]].n++; G.events.push({ e: 'plateback' }); } }
    if (G.t <= 0) { G.t = 0; G.over = true; G.events.push({ e: 'end' }); }
  }
  const stars = G => { const s = G.L.stars, f = [1, 1, 1.2, 1.4][Math.min(3, nChefs(G) - 1)]; return s.filter(x => G.score >= x * f).length; };

  /* ---------- Computer-Köche ---------- */
  function bfs(G, from) {
    const N = G.tiles.length, dist = new Int16Array(N).fill(-1), q = [from]; dist[from] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], t = G.tiles[i]; for (const [dx, dz] of DIRS) { const n = T(G, t.c + dx, t.r + dz); if (!n || n.kind !== 'floor') continue; const j = n.r * G.W + n.c; if (dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); } } }
    return dist;
  }
  // bestes Bodenfeld neben einer Station (nah am Koch)
  function standFor(G, ti, dist) { const t = G.tiles[ti]; let best = -1, bd = 1e9; for (const [dx, dz] of DIRS) { const n = T(G, t.c + dx, t.r + dz); if (!n || n.kind !== 'floor') continue; const j = n.r * G.W + n.c; if (dist[j] >= 0 && dist[j] < bd) { bd = dist[j]; best = j; } } return best; }
  const allPlates = G => { const out = []; G.tiles.forEach(t => { if (t.it && t.it.t === 'plate') out.push(t.it); }); G.chefs.forEach(c => { if (c.held && c.held.t === 'plate') out.push(c.held); }); return out; };
  // fehlende Zutaten (in Kisten-Einheiten) für die nächsten Bestellungen
  function demand(G) {
    const rem = G.orders.slice(0, 3).map(o => RECIPES[o.r].parts.slice()), used = new Set();
    for (const p of allPlates(G)) { if (!p.parts.length) continue; const k = rem.findIndex((r, j) => !used.has(j) && subset(p.parts, r)); if (k < 0) continue; used.add(k); for (const x of p.parts) rem[k].splice(rem[k].indexOf(x), 1); }
    const need = {};
    for (const r of rem) for (const p of r) { if (p === 'bun') need.bun = (need.bun || 0) + 1; else if (p.startsWith('soup:')) { const x = p.slice(5); need[x] = (need[x] || 0) + 3; } else { const x = p.split(':')[0]; need[x] = (need[x] || 0) + 1; } }
    const have = {}, add = x => { have[x] = (have[x] || 0) + 1; };
    const scan = it => { if (!it) return; if (it.t === 'ing' && it.st !== 'x') add(it.ing); else if ((it.t === 'pot' || it.t === 'pan') && !it.burnt) it.parts.forEach(add); };
    G.tiles.forEach(t => scan(t.it)); G.chefs.forEach(c => { scan(c.held); if (c.B && c.B.fetch) add(c.B.fetch); });
    for (const x in need) need[x] -= have[x] || 0;
    return need;
  }
  const orderRecs = G => G.orders.map(o => o.r);
  const fitsOrder = (G, parts, k) => canAdd(G, parts, k, orderRecs(G));
  const completeFor = (G, p) => p.parts.length && G.orders.some(o => sameSet(p.parts, RECIPES[o.r].parts));
  function decide(G, ch, dist) {
    const tiles = G.tiles, h = ch.held, mine = ti => G.claims[ti] == null || G.claims[ti] === ch.i;
    const ok = (ti, hot) => standFor(G, ti, dist) >= 0 && (hot || !(tiles[ti].fire > 0)) && mine(ti);
    const near = (list, hot) => { let best = -1, bd = 1e9; for (const ti of list) { if (!ok(ti, hot)) continue; const s = standFor(G, ti, dist), d = dist[s]; if (d < bd) { bd = d; best = ti; } } return best; };
    const find = f => near(tiles.map((t, i) => i).filter(i => f(tiles[i], i)));
    const goal = (ti, act, until) => ti >= 0 ? { ti, act: act || 'pick', until } : null;
    const fireOn = tiles.some(t => t.fire > 0), emptyCounter = () => find(t => t.kind === 'counter' && !t.it) , shared = () => near(G.shared.filter(i => !tiles[i].it));
    const stash = () => goal(G.shared.length ? (shared() >= 0 ? shared() : emptyCounter()) : emptyCounter());
    const needs = demand(G), soupWanted = x => G.orders.some(o => RECIPES[o.r].parts.includes('soup:' + x));
    const dest = it => { // wohin mit einem gehaltenen/liegenden Gegenstand? (Ziel-Station oder -1)
      if (it.t === 'ing') {
        if (it.st === 'x') return find(t => t.kind === 'trash');
        if (it.st === 'raw' && ING[it.ing].chop) return find(t => t.kind === 'board' && !t.it);
        const k = keyOf(it);
        let ti = find(t => t.it && t.it.t === 'plate' && fitsOrder(G, t.it.parts, k)); if (ti >= 0) return ti;
        if (it.st === 'c' && ING[it.ing].pot && soupWanted(it.ing)) { ti = find(t => t.kind === 'stove' && t.it && t.it.t === 'pot' && fits(t.it, it) && t.it.parts.length > 0 && t.it.parts[0] === it.ing); if (ti < 0) ti = find(t => t.kind === 'stove' && t.it && t.it.t === 'pot' && fits(t.it, it) && !t.it.parts.length); if (ti >= 0) return ti; }
        if (it.st === 'c' && ING[it.ing].pan) { ti = find(t => t.kind === 'stove' && t.it && t.it.t === 'pan' && fits(t.it, it)); if (ti >= 0) return ti; }
        if (fitsOrder(G, [], k)) { ti = find(t => t.kind === 'plates' && t.n > 0); if (ti >= 0) return ti; }
        return -1;
      }
      return -1;
    };
    if (h) {
      if (h.t === 'ext') { if (fireOn) { const ti = near(tiles.map((t, i) => i).filter(i => tiles[i].fire > 0), true); if (ti >= 0) return goal(ti, 'use', () => !(tiles[ti].fire > 0)); } return goal(emptyCounter()); }
      if (h.t === 'dirty') return goal(find(t => t.kind === 'sink')) || stash();
      if (h.t === 'pot' || h.t === 'pan') { if (h.burnt || h.parts.length && !contentKey(h) && (h.cook >= 1 || h.stale > 45)) return goal(find(t => t.kind === 'trash')); return goal(find(t => t.kind === 'stove' && !t.it)) || goal(emptyCounter()); }
      if (h.t === 'plate') {
        if (completeFor(G, h)) return goal(find(t => t.kind === 'serve')) || stash();
        if (h.parts.length && !G.orders.some(o => subset(h.parts, RECIPES[o.r].parts))) return goal(find(t => t.kind === 'trash'));
        let ti = find(t => t.kind === 'stove' && t.it && contentKey(t.it) && fitsOrder(G, h.parts, contentKey(t.it))); if (ti >= 0) return goal(ti);
        ti = find(t => t.kind !== 'stove' && t.it && t.it.t === 'ing' && t.it.st !== 'raw' && fitsOrder(G, h.parts, keyOf(t.it))); if (ti >= 0) return goal(ti);
        ti = find(t => t.kind === 'crate' && t.ing === 'bun' && fitsOrder(G, h.parts, 'bun')); if (ti >= 0 && !h.parts.length) { /* Brötchen kommt separat */ }
        if (!h.parts.length) return goal(find(t => t.kind === 'plates')) || goal(emptyCounter());
        return goal(emptyCounter()) || stash();
      }
      if (h.t === 'ing') { const ti = dest(h); if (ti >= 0) return goal(ti); return h.st === 'raw' && !ING[h.ing].chop && !G.shared.length ? goal(emptyCounter()) : stash() || goal(find(t => t.kind === 'trash')); }
      return goal(emptyCounter());
    }
    // Hände frei
    if (fireOn && !G.chefs.some(c => c !== ch && c.held && c.held.t === 'ext')) { const ti = find(t => t.it && t.it.t === 'ext'); if (ti >= 0) return goal(ti); }
    let ti = find(t => t.kind !== 'serve' && t.it && t.it.t === 'plate' && completeFor(G, t.it)); if (ti >= 0) return goal(ti);
    // fertiges Essen auf dem Herd: Teller holen (vorhandenen passenden oder neuen)
    for (const si of G.idx.stove || []) {
      const t = tiles[si], k = contentKey(t.it) || (t.it && !t.it.burnt && t.it.cook > .5 ? (t.it.t === 'pot' ? 'soup:' + t.it.parts[0] : t.it.parts[0] + ':k') : null);
      if (!k || !ok(si) || !G.orders.some(o => RECIPES[o.r].parts.includes(k))) continue;
      if (G.chefs.some(c => c !== ch && c.B && c.B.goal && c.B.goal.for === si)) continue;
      ti = find(q => q.kind !== 'stove' && q.it && q.it.t === 'plate' && fitsOrder(G, q.it.parts, k)); if (ti >= 0) return Object.assign(goal(ti), { for: si });
      ti = find(q => q.kind === 'plates' && q.n > 0); if (ti >= 0) return Object.assign(goal(ti), { for: si });
    }
    ti = find(t => t.kind === 'stove' && t.it && (t.it.burnt || (t.it.cook >= 1 && !contentKey(t.it)) || t.it.stale > 45)); if (ti >= 0) return goal(ti);
    ti = find(t => t.kind === 'board' && t.it && t.it.t === 'ing' && t.it.st === 'raw' && ING[t.it.ing].chop); if (ti >= 0) return goal(ti, 'use', () => !tiles[ti].it || tiles[ti].it.st !== 'raw');
    // liegende Zutaten weiterbringen (auch über die Theke gereichte)
    const useful = it => { const x = it.ing; return G.orders.some(o => RECIPES[o.r].parts.some(p => p === 'bun' ? x === 'bun' : p.startsWith('soup:') ? p.slice(5) === x : p.split(':')[0] === x)); };
    const canPass = i => G.shared.length && !G.shared.includes(i) && shared() >= 0;
    ti = find((t, i) => t.it && t.it.t === 'ing' && (t.kind === 'board' ? t.it.st !== 'raw' : t.kind !== 'stove') && ((dest(t.it) >= 0 && dest(t.it) !== i) || (t.it.st !== 'x' && useful(t.it) && canPass(i)))); if (ti >= 0) return goal(ti);
    const q = G.idx.plates ? tiles[G.idx.plates[0]] : null, sinkI = G.idx.sink ? G.idx.sink[0] : -1;
    if (sinkI >= 0 && tiles[sinkI].n > 0 && q && q.n < 2 && ok(sinkI)) return goal(sinkI, 'use', () => tiles[sinkI].n === 0 || q.n >= 3);
    ti = find(t => t.kind === 'ret' && t.n > 0); if (ti >= 0) return goal(ti);
    // fehlende Zutat holen
    const others = G.chefs.filter(c => c !== ch && c.B && c.B.fetch).map(c => c.B.fetch);
    for (const o of G.orders.slice(0, 3)) for (const p of RECIPES[o.r].parts) {
      const x = p === 'bun' ? 'bun' : p.startsWith('soup:') ? p.slice(5) : p.split(':')[0];
      if (!(needs[x] > 0) || others.filter(f => f === x).length >= needs[x]) continue;
      ti = find(t => t.kind === 'crate' && t.ing === x); if (ti >= 0) return Object.assign(goal(ti), { fetch: x });
    }
    if (sinkI >= 0 && tiles[sinkI].n > 0 && ok(sinkI)) return goal(sinkI, 'use', () => tiles[sinkI].n === 0);
    return null;
  }
  function botInput(G, ch, dt) {
    const B = ch.B || (ch.B = { goal: null, wait: 0, stuck: 0, best: 1e9, nudge: 0, useT: 0, think: 0 });
    const out = { mx: 0, mz: 0, pick: false, use: false, dash: false }, ci = Math.floor(ch.z) * G.W + Math.floor(ch.x);
    if (B.wait > 0) { B.wait -= dt; return out; }
    if (B.nudge > 0) { B.nudge -= dt; out.mx = B.nx; out.mz = B.nz; return out; }
    const dist = bfs(G, ci);
    const drop = () => { if (B.goal && G.claims[B.goal.ti] === ch.i) delete G.claims[B.goal.ti]; B.goal = null; B.fetch = null; };
    if (!B.goal) { B.think -= dt; if (B.think > 0) return out; const g = decide(G, ch, dist); if (!g) { B.think = .4; B.fetch = null; return out; } B.goal = g; B.fetch = g.fetch || null; B.best = 1e9; B.stuck = 0; B.useT = 0; if (g.act === 'use' || ['board', 'counter', 'belt'].includes(G.tiles[g.ti].kind)) G.claims[g.ti] = ch.i; }
    const g = B.goal, s = standFor(G, g.ti, dist);
    if (s < 0 || (G.tiles[g.ti].fire > 0 && g.act !== 'use')) { drop(); B.think = .3; return out; }
    const st = G.tiles[s], tt = G.tiles[g.ti];
    if (s !== ci || Math.hypot(ch.x - (st.c + .5), ch.z - (st.r + .5)) > .3) {
      // nächstes Feld Richtung Ziel (Abstandskarte vom Ziel aus)
      let wx = st.c + .5, wz = st.r + .5;
      if (s !== ci) { const dg = bfs(G, s); let bj = -1, bd = dg[ci] < 0 ? 1e9 : dg[ci]; const t = G.tiles[ci]; for (const [dx, dz] of DIRS) { const n = T(G, t.c + dx, t.r + dz); if (!n || n.kind !== 'floor') continue; const j = n.r * G.W + n.c; if (dg[j] >= 0 && dg[j] < bd) { bd = dg[j]; bj = j; } } if (bj >= 0) { wx = G.tiles[bj].c + .5; wz = G.tiles[bj].r + .5; } }
      const dx = wx - ch.x, dz = wz - ch.z, d = Math.hypot(dx, dz) || 1, sl = G.L.ice ? Math.min(1, d * .9) : 1;
      out.mx = BOT_SPEED * dx / d * sl; out.mz = BOT_SPEED * dz / d * sl;
      if (G.L.ice) { const tx = out.mx * SPEED, tz = out.mz * SPEED; out.mx += (tx - ch.vx) / SPEED * 1.6; out.mz += (tz - ch.vz) / SPEED * 1.6; }
      const rem = (dist[s] < 0 ? 99 : dist[s]) + Math.hypot(ch.x - (st.c + .5), ch.z - (st.r + .5));
      if (rem < B.best - .05) { B.best = rem; B.stuck = 0; } else if ((B.stuck += dt) > 1.3) { const a = G.rnd() * 6.28; B.nx = Math.cos(a); B.nz = Math.sin(a); B.nudge = .35; drop(); B.think = .2; }
      return out;
    }
    // am Ziel: zur Station drehen, dann handeln
    const fx = tt.c - st.c, fz = tt.r - st.r; out.mx = fx * .3; out.mz = fz * .3;
    if (ch.tgt !== g.ti) { if ((B.stuck += dt) > 1) { drop(); B.think = .2; } return out; }
    if (g.act === 'pick') { if (!ch.pickPrev) { out.pick = true; drop(); B.wait = BOT_PAUSE; } return out; }
    out.use = true; B.useT += dt; if ((g.until && g.until()) || B.useT > 8) { out.use = false; drop(); B.wait = BOT_PAUSE; }
    return out;
  }
  return { newGame, step, interact, combine, keyOf, contentKey, stars, demand, RECIPES, ING, LEVELS, SPEED };
})();
if (typeof module !== 'undefined') module.exports = KC;

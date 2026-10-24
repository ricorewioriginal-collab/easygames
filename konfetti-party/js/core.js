/* Konfetti-Party – Spielkern ohne Grafik: Rasterarena mit Säulen und Geschenkkartons, Partygäste laufen (mit Eckhilfe),
 * legen Knallbonbons, die nach kurzer Zeit einen Konfetti-Strahl in alle vier Richtungen schießen. Kartons platzen und
 * lassen Extras fallen, Bonbons lösen sich gegenseitig aus, wer getroffen wird, ist für die Runde raus. Am Ende der Zeit
 * schließt sich die Arena. Computer-Gäste weichen Gefahr aus, sammeln Extras, sprengen Kartons und jagen Gegner. */
const KP = (() => {
  'use strict';
  const D = typeof KP_DATA !== 'undefined' ? KP_DATA : require('./data.js');
  const { ARENAS, POWERS } = D, PKEYS = Object.keys(POWERS);
  const FUSE = 2.4, BLAST = .55, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const mkRng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  function newMatch(ai, players, opt) {
    opt = opt || {}; const A = ARENAS[ai];
    const G = { A, ai, W: A.map[0].length, H: A.map.length, wins: opt.wins || 2, time: opt.time || 150, rnd: mkRng(opt.seed || (Date.now() & 0xffff)), round: 0, over: false, events: [], players: [] };
    players.forEach((p, i) => G.players.push({ i, name: p.name, look: p.look == null ? i : p.look, bot: !!p.bot, skill: p.skill == null ? 1 : p.skill, wins: 0 }));
    newRound(G); return G;
  }
  function newRound(G) {
    const A = G.A, N = G.W * G.H; G.round++; G.grid = new Uint8Array(N); G.items = new Int8Array(N).fill(-1); G.fire = new Float32Array(N); G.bombs = []; G.blasts = []; G.t = G.time; G.sd = 0; G.sdT = 0; G.endT = 0; G.roundOver = false; G.winner = -1;
    const spawn = [];
    for (let r = 0; r < G.H; r++) for (let c = 0; c < G.W; c++) { const ch = A.map[r][c], i = r * G.W + c; if (ch === '#') G.grid[i] = 1; else if (ch === '.' && G.rnd() < A.crates) G.grid[i] = 2; else if (ch >= '1' && ch <= '4') spawn[+ch - 1] = [c, r]; }
    G.players.forEach((p, k) => { const s = spawn[k % 4]; Object.assign(p, { x: s[0] + .5, z: s[1] + .5, alive: true, cap: 1, range: 2, speed: 0, kick: false, shield: false, remote: false, wirr: 0, inv: 0, dir: [0, 1], actPrev: false, detPrev: false, B: null, moving: false }); });
    // Spirale von außen nach innen für das Ende der Zeit
    G.spiral = []; let c0 = 1, r0 = 1, c1 = G.W - 2, r1 = G.H - 2;
    while (c0 <= c1 && r0 <= r1) { for (let c = c0; c <= c1; c++) G.spiral.push([c, r0]); for (let r = r0 + 1; r <= r1; r++) G.spiral.push([c1, r]); if (r0 < r1) for (let c = c1 - 1; c >= c0; c--) G.spiral.push([c, r1]); if (c0 < c1) for (let r = r1 - 1; r > r0; r--) G.spiral.push([c0, r]); c0++; r0++; c1--; r1--; }
    G.spiral = G.spiral.filter(([c, r]) => G.grid[r * G.W + c] !== 1);
    G.events.push({ e: 'round', n: G.round });
  }
  const idx = (G, c, r) => r * G.W + c;
  const inside = (G, c, r) => c >= 0 && r >= 0 && c < G.W && r < G.H;
  const bombAt = (G, c, r) => G.bombs.find(b => b.c === c && b.r === r);
  function free(G, c, r, p) { if (!inside(G, c, r) || G.grid[idx(G, c, r)]) return false; const b = bombAt(G, c, r); return !b || (p && b.pass.has(p.i)); }

  /* ---------- Bewegung mit Eckhilfe ---------- */
  function move(G, p, mx, mz, dt) {
    if (p.wirr > 0) { mx = -mx; mz = -mz; }
    p.moving = false; if (Math.abs(mx) < .3 && Math.abs(mz) < .3) return;
    const hor = Math.abs(mx) >= Math.abs(mz), d = Math.sign(hor ? mx : mz), step = Math.min(6.2, 3.4 + .45 * p.speed) * dt;
    p.dir = hor ? [d, 0] : [0, d]; p.moving = true;
    const c = Math.floor(p.x), r = Math.floor(p.z), oa = hor ? p.x - (c + .5) : p.z - (r + .5), op = hor ? p.z - (r + .5) : p.x - (c + .5);
    const nc = hor ? c + d : c, nr = hor ? r : r + d;
    const set = (a, b) => { if (hor) { p.x += a; p.z += b; } else { p.z += a; p.x += b; } };
    const toward = (v, s) => -Math.sign(v) * Math.min(Math.abs(v), s);
    if (free(G, nc, nr, p)) {
      if (Math.abs(op) <= .16 || d * oa < -.05) set(d * step, toward(op, step)); else set(0, toward(op, step));
    } else if (d * oa < -.001) set(d * Math.min(step, Math.abs(oa)), toward(op, step * .5));
    else {
      const sp = Math.sign(op); if (Math.abs(op) > .1 && free(G, hor ? c + d : c + sp, hor ? r + sp : r + d, p) && free(G, hor ? c : c + sp, hor ? r + sp : r, p)) set(0, sp * step);
      else if (p.kick) { const b = bombAt(G, nc, nr); if (b && !b.slide) { b.slide = [hor ? d : 0, hor ? 0 : d]; G.events.push({ e: 'kick', i: p.i }); } }
    }
  }
  /* ---------- Bonbons und Konfetti ---------- */
  function place(G, p) {
    const c = Math.floor(p.x), r = Math.floor(p.z);
    if (bombAt(G, c, r) || G.bombs.filter(b => b.owner === p.i).length >= p.cap || G.grid[idx(G, c, r)]) return;
    const pass = new Set(); G.players.forEach(q => { if (q.alive && Math.abs(q.x - (c + .5)) < .85 && Math.abs(q.z - (r + .5)) < .85) pass.add(q.i); });
    G.bombs.push({ c, r, x: c + .5, z: r + .5, t: p.remote && !p.bot ? 30 : FUSE, range: p.range, owner: p.i, pass, slide: null, remote: p.remote && !p.bot });
    G.events.push({ e: 'place', i: p.i, c, r });
  }
  function cross(G, c, r, range, stopAtBombs) { // Felder des Strahls (Säulen stoppen, Kartons werden getroffen und stoppen)
    const out = [[c, r]];
    for (const [dx, dz] of DIRS) for (let k = 1; k <= range; k++) { const x = c + dx * k, z = r + dz * k; if (!inside(G, x, z)) break; const g = G.grid[idx(G, x, z)]; if (g === 1 || g === 3) break; out.push([x, z]); if (g === 2) break; if (stopAtBombs && bombAt(G, x, z)) break; }
    return out;
  }
  function explode(G, b) {
    G.bombs.splice(G.bombs.indexOf(b), 1);
    const cells = cross(G, b.c, b.r, b.range), drops = [];
    for (const [x, z] of cells) {
      const i = idx(G, x, z); G.fire[i] = BLAST;
      if (G.grid[i] === 2) { G.grid[i] = 0; G.events.push({ e: 'crate', c: x, r: z }); if (G.rnd() < .38) drops.push(i); }
      else if (G.items[i] >= 0) { G.items[i] = -1; G.events.push({ e: 'burnItem', c: x, r: z }); }
      const o = bombAt(G, x, z); if (o && o !== b) o.t = Math.min(o.t, .06);
    }
    for (const i of drops) { let tot = 0; for (const k of PKEYS) tot += POWERS[k].w; let x = G.rnd() * tot, pick = 0; for (let k = 0; k < PKEYS.length; k++) { x -= POWERS[PKEYS[k]].w; if (x <= 0) { pick = k; break; } } G.items[i] = pick; }
    G.blasts.push({ cells, t: BLAST, c: b.c, r: b.r, owner: b.owner }); G.events.push({ e: 'boom', c: b.c, r: b.r, owner: b.owner, n: cells.length });
  }
  function hit(G, p, by) {
    if (!p.alive || p.inv > 0) return;
    if (p.shield) { p.shield = false; p.inv = 1.4; G.events.push({ e: 'shield', i: p.i }); return; }
    p.alive = false; G.events.push({ e: 'out', i: p.i, by });
  }
  function grab(G, p) {
    const i = idx(G, Math.floor(p.x), Math.floor(p.z)), k = G.items[i]; if (k < 0) return; G.items[i] = -1; const key = PKEYS[k];
    if (key === 'bomb') p.cap = Math.min(8, p.cap + 1); else if (key === 'fire') p.range = Math.min(9, p.range + 1); else if (key === 'speed') p.speed = Math.min(6, p.speed + 1);
    else if (key === 'kick') p.kick = true; else if (key === 'shield') p.shield = true; else if (key === 'remote') p.remote = true; else if (key === 'wirr') p.wirr = 10;
    G.events.push({ e: 'power', i: p.i, k: key });
  }
  /* ---------- Schritt ---------- */
  function step(G, dt, inputs) {
    G.events.length = 0; if (G.over || G.roundOver) return;
    G.t -= dt;
    G.players.forEach((p, i) => {
      if (!p.alive) return; p.inv = Math.max(0, p.inv - dt); p.wirr = Math.max(0, p.wirr - dt);
      const inp = p.bot ? botInput(G, p, dt) : (inputs && inputs[i]) || {};
      move(G, p, +inp.mx || 0, +inp.mz || 0, dt);
      if (inp.act && !p.actPrev) place(G, p); p.actPrev = !!inp.act;
      if (inp.det && !p.detPrev) { const mine = G.bombs.filter(b => b.owner === p.i && b.remote); if (mine.length) { mine[0].t = 0; } } p.detPrev = !!inp.det;
      grab(G, p);
    });
    for (const b of G.bombs) for (const k of Array.from(b.pass)) { const q = G.players[k]; if (!q.alive || Math.abs(q.x - b.x) > .8 || Math.abs(q.z - b.z) > .8) b.pass.delete(k); }
    // rutschende Bonbons
    for (const b of G.bombs) if (b.slide) {
      const [dx, dz] = b.slide, nx = b.c + dx, nz = b.r + dz, blocked = !inside(G, nx, nz) || G.grid[idx(G, nx, nz)] || bombAt(G, nx, nz) || G.players.some(q => q.alive && Math.floor(q.x) === nx && Math.floor(q.z) === nz);
      const cx = b.c + .5, cz = b.r + .5;
      if (blocked && Math.abs(b.x - cx) + Math.abs(b.z - cz) < .05) { b.x = cx; b.z = cz; b.slide = null; continue; }
      b.x += dx * 7 * dt; b.z += dz * 7 * dt; if (blocked) { if ((b.x - cx) * dx > 0 || (b.z - cz) * dz > 0) { b.x = cx; b.z = cz; b.slide = null; } }
      else { const c = Math.floor(b.x), r = Math.floor(b.z); if (c !== b.c || r !== b.r) { b.c = c; b.r = r; } }
    }
    for (const b of G.bombs.slice()) { b.t -= dt; if (b.t <= 0 && G.bombs.includes(b)) explode(G, b); }
    // Konfetti trifft
    for (let i = 0; i < G.fire.length; i++) if (G.fire[i] > 0) G.fire[i] = Math.max(0, G.fire[i] - dt);
    for (const bl of G.blasts) bl.t -= dt; G.blasts = G.blasts.filter(b => b.t > 0);
    G.players.forEach(p => { if (p.alive && G.fire[idx(G, Math.floor(p.x), Math.floor(p.z))] > 0) { const bl = G.blasts.find(b => b.cells.some(([x, z]) => x === Math.floor(p.x) && z === Math.floor(p.z))); hit(G, p, bl ? bl.owner : -1); } });
    for (const b of G.bombs.slice()) if (G.fire[idx(G, b.c, b.r)] > 0 && b.t > .06) b.t = .06;
    // Zeit um: die Arena schließt sich
    if (G.t <= 0) { G.sdT -= dt; if (G.sdT <= 0 && G.sd < G.spiral.length) { G.sdT = .3; const [c, r] = G.spiral[G.sd++], i = idx(G, c, r); G.grid[i] = 3; G.items[i] = -1; G.bombs = G.bombs.filter(b => !(b.c === c && b.r === r)); G.players.forEach(p => { if (p.alive && Math.floor(p.x) === c && Math.floor(p.z) === r) { p.shield = false; p.inv = 0; hit(G, p, -2); } }); G.events.push({ e: 'drop', c, r }); } }
    const alive = G.players.filter(p => p.alive);
    if (alive.length <= 1 || (G.sd >= G.spiral.length && G.t < 0)) {
      G.endT += dt;
      if (G.endT > 1.3) { G.roundOver = true; G.winner = alive.length === 1 ? alive[0].i : -1; if (G.winner >= 0) G.players[G.winner].wins++; if (G.winner >= 0 && G.players[G.winner].wins >= G.wins) G.over = true; G.events.push({ e: 'roundEnd', winner: G.winner, over: G.over }); }
    }
  }

  /* ---------- Computer-Gäste ---------- */
  function danger(G, extra) { // Zeit bis Konfetti jedes Feld erreicht (Infinity = sicher)
    const N = G.W * G.H, d = new Float32Array(N).fill(Infinity), bs = G.bombs.map(b => ({ c: b.c, r: b.r, t: b.remote ? Math.min(b.t, 1.2) : b.t, range: b.range })).concat(extra || []);
    for (let pass = 0; pass < 3; pass++) for (const b of bs) for (const [x, z] of cross(G, b.c, b.r, b.range)) { const o = bs.find(q => q !== b && q.c === x && q.r === z); if (o && o.t > b.t) o.t = b.t; }
    for (const b of bs) for (const [x, z] of cross(G, b.c, b.r, b.range)) { const i = idx(G, x, z); if (b.t < d[i]) d[i] = b.t; }
    for (let i = 0; i < N; i++) if (G.fire[i] > 0) d[i] = 0;
    if (G.t < 6) for (let k = G.sd; k < Math.min(G.spiral.length, G.sd + 14); k++) { const [c, r] = G.spiral[k], i = idx(G, c, r); d[i] = Math.min(d[i], Math.max(0, G.t) + (k - G.sd) * .3); }
    return d;
  }
  function search(G, p, dang, avoidT) { // Breitensuche über begehbare Felder; Felder, die beim Betreten gefährlich sind, werden gemieden
    const N = G.W * G.H, dist = new Int16Array(N).fill(-1), prev = new Int32Array(N).fill(-1), sp = Math.min(6.2, 3.4 + .45 * p.speed), s = idx(G, Math.floor(p.x), Math.floor(p.z)), q = [s]; dist[s] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], c = i % G.W, r = (i / G.W) | 0; for (const [dx, dz] of DIRS) { const x = c + dx, z = r + dz; if (!inside(G, x, z)) continue; const j = idx(G, x, z); if (dist[j] >= 0 || G.grid[j] || bombAt(G, x, z)) continue; const arr = (dist[i] + 1) / sp + .1; if (dang[j] < Infinity && dang[j] < arr + (avoidT || .35) && dang[j] > arr - BLAST - .2) continue; if (dang[j] === 0) continue; dist[j] = dist[i] + 1; prev[j] = i; q.push(j); } }
    return { dist, prev, s, sp };
  }
  const pathTo = (S, j) => { const path = []; while (j >= 0 && j !== S.s) { path.unshift(j); j = S.prev[j]; } return path; };
  function nearest(G, S, ok, max) { let best = -1, bd = 1e9; for (let i = 0; i < S.dist.length; i++) { const d = S.dist[i]; if (d < 0 || d > (max || 99)) continue; if (d < bd && ok(i, d)) { bd = d; best = i; } } return best; }
  function decide(G, p) {
    const B = p.B, dang = danger(G), S = search(G, p, dang), me = S.s, rnd = G.rnd;
    B.act = false;
    if (dang[me] < Infinity) { // in Gefahr: zum nächsten sicheren Feld
      let t = nearest(G, S, i => dang[i] === Infinity); if (t < 0) { let bt = -1; for (let i = 0; i < S.dist.length; i++) if (S.dist[i] >= 0 && (bt < 0 || dang[i] > dang[bt])) bt = i; t = bt; }
      B.path = t >= 0 ? pathTo(S, t) : []; B.mode = 'flee'; return;
    }
    const c = me % G.W, r = (me / G.W) | 0, mine = G.bombs.filter(b => b.owner === p.i).length, enemies = G.players.filter(q => q.alive && q !== p);
    const inCross = (cells, test) => cells.some(([x, z]) => test(x, z));
    const myCross = cross(G, c, r, p.range);
    const crateHit = inCross(myCross, (x, z) => G.grid[idx(G, x, z)] === 2), foeHit = enemies.some(q => myCross.some(([x, z]) => x === Math.floor(q.x) && z === Math.floor(q.z)) && Math.abs(q.x - p.x) + Math.abs(q.z - p.z) < p.range + (p.skill > 1 ? 2 : 1));
    if (mine < p.cap && (crateHit || foeHit) && !bombAt(G, c, r) && rnd() < [.55, .8, .95][p.skill]) {
      const d2 = danger(G, [{ c, r, t: FUSE, range: p.range }]), S2 = search(G, p, d2, .2), esc = nearest(G, S2, i => d2[i] === Infinity, 9);
      if (esc >= 0) { B.act = true; B.path = esc >= 0 ? pathTo(S2, esc) : []; B.mode = 'flee'; return; }
    }
    // Extras einsammeln
    let t = nearest(G, S, i => G.items[i] >= 0 && D.POWERS[PKEYS[G.items[i]]] && PKEYS[G.items[i]] !== 'wirr' && dang[i] === Infinity, [5, 8, 12][p.skill]);
    // Platz neben einem Karton
    if (t < 0) t = nearest(G, S, i => { if (dang[i] < Infinity) return false; const x = i % G.W, z = (i / G.W) | 0; return cross(G, x, z, p.range).some(([a, b]) => G.grid[idx(G, a, b)] === 2); });
    // Gegner jagen
    if ((t < 0 || (p.skill > 0 && rnd() < [0, .25, .45][p.skill])) && enemies.length) { const e = enemies[(rnd() * enemies.length) | 0], ei = idx(G, Math.floor(e.x), Math.floor(e.z)); let bt = -1, bd = 1e9; for (let i = 0; i < S.dist.length; i++) { if (S.dist[i] < 0 || dang[i] < Infinity) continue; const x = i % G.W, z = (i / G.W) | 0, dd = Math.abs(x - (ei % G.W)) + Math.abs(z - ((ei / G.W) | 0)); if (dd < bd) { bd = dd; bt = i; } } if (bt >= 0) t = bt; }
    if (t < 0) t = nearest(G, S, (i, d) => d > 0 && dang[i] === Infinity && rnd() < .2, 6);
    B.path = t >= 0 ? pathTo(S, t) : []; B.mode = 'go';
  }
  function botInput(G, p, dt) {
    const B = p.B || (p.B = { path: [], think: 0, act: false, mode: '' }), out = { mx: 0, mz: 0, act: false };
    B.think -= dt;
    if (B.think <= 0 || (!B.path.length && B.mode !== 'flee') || B.mode === 'idle') { decide(G, p); B.think = [.5, .28, .14][p.skill] + G.rnd() * .1; if (B.act) { out.act = true; B.act = false; return out; } }
    // nächstes Feld noch sicher? sonst neu planen
    while (B.path.length) { const j = B.path[0], cx = j % G.W + .5, cz = ((j / G.W) | 0) + .5; if (Math.abs(p.x - cx) < .12 && Math.abs(p.z - cz) < .12) { B.path.shift(); continue; } break; }
    if (!B.path.length) { B.mode = B.mode === 'flee' ? 'idle' : B.mode; return out; }
    const j = B.path[0], cx = j % G.W + .5, cz = ((j / G.W) | 0) + .5;
    if (G.grid[j] || (bombAt(G, j % G.W, (j / G.W) | 0) && !bombAt(G, j % G.W, (j / G.W) | 0).pass.has(p.i))) { B.think = 0; return out; }
    const dx = cx - p.x, dz = cz - p.z;
    if (Math.abs(dx) > Math.abs(dz)) out.mx = Math.sign(dx); else out.mz = Math.sign(dz);
    return out;
  }
  return { newMatch, newRound, step, danger, PKEYS, FUSE, BLAST };
})();
if (typeof module !== 'undefined') module.exports = KP;

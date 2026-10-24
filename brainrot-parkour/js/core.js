/* Brainrot Parkour – Spielkern ohne Grafik: Streckenbau (Obby-Welten, Rennen, Pavimento Lava, Torre Infinita), Spielfigur-Physik
 * (Laufen, Springen, Doppelsprung, Coyote-Time, Eis, Förderband, Sprungpolster), bewegte/fallende Plattformen, Drehbalken,
 * Checkpoints, Münzen und Computer-Läufer. Läuft auch in Node (Tests). */
const BRCore = (() => {
  'use strict';
  const DIFF = {
    bambini: { gap: .55, spin: .6, move: .6, dbl: true, killSpin: false, cpEvery: 1, beam: 1.6, lives: 0 },
    normale: { gap: .85, spin: 1, move: 1, dbl: false, killSpin: true, cpEvery: 1, beam: 1, lives: 0 },
    esperto: { gap: 1.05, spin: 1.35, move: 1.3, dbl: false, killSpin: true, cpEvery: 2, beam: .8, lives: 0 },
  };
  const PHYS = { speed: 7.6, accG: 60, accA: 26, accIce: 7, grav: 32, jump: 11.6, bounce: 19, coyote: .11, buf: .13, hw: .34, h: 1.6, fallY: -12 };
  const WORLDS = [
    { id: 'cucina', name: 'Cucina Cosmica', kill: 'Tomatensoße', icon: '🍝' },
    { id: 'spiaggia', name: 'Spiaggia Assurda', kill: 'Brausewasser', icon: '🏖️' },
    { id: 'galassia', name: 'Galassia Gelato', kill: 'Schoko-Lava', icon: '🍨' },
  ];
  function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  /* ---------- Streckenbau ---------- */
  // Bauhelfer mit Laufrichtung (heading 0..3 = +z, +x, -z, -x); vorwärts f, seitlich s, Höhe y relativ zur aktuellen Spitze
  function builder(o) {
    const B = { objs: [], route: [], cps: [], coins: 0, x: 0, y: 0, z: 0, hd: 0, id: 0 };
    const dir = () => [[0, 1], [1, 0], [0, -1], [-1, 0]][B.hd];
    B.at = (f, s) => { const [dx, dz] = dir(); return [B.x + dx * f - dz * s, B.z + dz * f + dx * s]; };
    B.box = (f, s, y, w, h, d, kind, extra) => { // w = quer, d = längs (in Laufrichtung)
      const [x, z] = B.at(f, s), sw = B.hd % 2 === 1;
      const ob = Object.assign({ id: ++B.id, x, y: B.y + y - h / 2, z, w: sw ? d : w, h, d: sw ? w : d, kind: kind || 'solid', seg: B.seg }, extra || {});
      if (ob.move && sw) ob.move.ax = ob.move.ax === 'x' ? 'z' : ob.move.ax === 'z' ? 'x' : 'y';
      B.objs.push(ob); return ob;
    };
    B.way = (f, s, y, jump, ob) => { const [x, z] = B.at(f, s), lo = B.objs[B.objs.length - 1]; B.route.push({ x, y: B.y + y, z, jump: !!jump, seg: B.seg, ob: ob || (lo && lo.move ? lo : null), hs: lo && lo.kind !== 'coin' ? Math.min(lo.w, lo.d) / 2 : .5 }); };
    B.coin = (f, s, y) => { const [x, z] = B.at(f, s); B.objs.push({ id: ++B.id, kind: 'coin', x, y: B.y + y + .9, z, w: .7, h: .7, d: .7 }); B.coins++; };
    B.adv = (f, dy) => { const [x, z] = B.at(f, 0); B.x = x; B.z = z; B.y += dy || 0; };
    B.turn = d => { B.hd = (B.hd + d + 4) % 4; };
    return B;
  }
  // Segmente: jedes beginnt am Rand der letzten Plattform (Oberkante = B.y) und endet auf fester Fläche
  const SEG = {
    gaps(B, r, D, k) { const n = 3 + (r() * 3 | 0); for (let i = 0; i < n; i++) { const gap = (1.6 + r() * 1.8) * D.gap + .4, sz = 2.6 - k * .9 + r() * .5, s = (r() - .5) * 2.4 * k, dy = (r() - .4) * 1.2 * k; B.box(gap + sz / 2, s, dy, sz, .8, sz); B.way(gap + sz / 2, s, dy, true); if (r() < .35) B.coin(gap + sz / 2, s, dy); B.adv(gap + sz, dy); B.x += 0; } },
    lava(B, r, D, k) { const len = 10 + r() * 6; B.box(len / 2 + .5, 0, -1.4, 7, .6, len + 1, 'kill'); let f = 0; while (f < len - 1.5) { const g = (1.4 + r() * 1.2) * D.gap + .3, sz = 1.8 - k * .5 + (D.dbl ? .5 : 0), s = (r() - .5) * 3.6; f += g + sz / 2; B.box(f, s, (r() - .5) * .5, sz, .7, sz); B.way(f, s, 0, true); if (r() < .3) B.coin(f, s, 0); f += sz / 2; } B.adv(f); },
    mover(B, r, D, k) { // Gegenläufige Schiebe-Plattformen (Phase um π versetzt) – sie kommen sich regelmäßig nah
      const n = 2 + (r() * 2 | 0), sp = (.7 + r() * .45) * D.move, ph = r() * 6; let prevHalf = 0;
      for (let i = 0; i < n; i++) { const side = r() < .5, amp = (1.5 + r() * 1.3) * D.gap, sz = 2.6 - k * .6, fa = side ? 0 : amp, f = (i ? prevHalf : 0) + 1.8 * D.gap + .6 + sz / 2 + fa;
        const ob = B.box(f, 0, 0, sz, .6, sz, 'solid', { move: { ax: side ? 'x' : 'z', amp, sp, ph: ph + i * Math.PI }, tint: 'mover' }); B.way(f, 0, 0, true, ob); B.adv(f); prevHalf = sz / 2 + fa; }
      B.adv(prevHalf);
    },
    spinner(B, r, D, k) { const n = 1 + (k > .5 ? 1 : 0), len = 7.6 * n + 1.6; B.box(len / 2, 0, 0, 7.4, .8, len); for (let i = 0; i < n; i++) { const f = .8 + 3.8 + i * 7.6, [x, z] = B.at(f, 0), side = i % 2 ? -2.3 : 2.3; B.box(f, 0, 1.6, .7, 1.6, .7, 'solid', { tint: 'pole' }); B.objs.push({ id: ++B.id, kind: 'spin', x, y: B.y, z, len: 3.3, r: .28, sp: (1.4 + r()) * D.spin * (i % 2 ? -1 : 1), ph: r() * 6, w: 7, h: 1, d: 7, seg: 'spinner' }); B.way(f - 1.2, side, 0, false); B.way(f + 1.2, side, 0, false); } B.adv(len); },
    beam(B, r, D, k) { const len = 8 + r() * 6, w = Math.max(.45, (1 - k * .5) * D.beam); B.box(len / 2, 0, 0, w, .5, len); B.way(.6, 0, 0, false); B.box(len / 2, 0, -3, 9, .5, len + 2, 'kill'); B.way(len, 0, 0, false); B.coin(len / 2, 0, 0); B.adv(len); },
    stairs(B, r, D, k) { const n = 5 + (r() * 3 | 0); for (let i = 0; i < n; i++) { const s = (i % 2 ? 1 : -1) * (1 + r() * 1.2) * k, f = 2.2 + .6 * D.gap; B.box(f, s, 1.1, 2, .6, 2, 'solid', i % 3 === 2 ? { kind: 'solid', tint: 'alt' } : null); B.way(f, s, 1.1, true); B.adv(f, 1.1); B.x += 0; } },
    falling(B, r, D, k) { const n = 4 + (r() * 3 | 0); for (let i = 0; i < n; i++) { const f = 2.4 + .5 * D.gap; B.box(f, (r() - .5) * 2 * k, 0, 2.2, .4, 2.2, 'fall'); B.way(f, 0, 0, true); B.adv(f); } },
    bounce(B, r, D, k) { B.box(3, 0, 0, 2.4, .4, 2.4, 'bounce'); B.way(3, 0, 0, true); B.adv(3); const up = 3.6 + r() * 1.4; B.box(4.5, 0, up, 3, .8, 3); B.way(4.5, 0, up, true); B.coin(4.5, 0, up); B.adv(6, up); },
    conveyor(B, r, D, k) { const len = 12; B.box(len / 2, 0, 0, 3, .6, len, 'conv', { conv: -(2.5 + k * 2.5) }); B.way(len, 0, 0, false); B.adv(len); },
    pillars(B, r, D, k) { const n = 4 + (r() * 3 | 0); for (let i = 0; i < n; i++) { const f = (2 + r() * 1.2) * D.gap + 1, s = (r() - .5) * 3 * k, sz = Math.max(.9, 1.4 - k * .4 + (D.dbl ? .4 : 0)); B.box(f, s, (r() - .5) * .8, sz, 6, sz, 'solid', { tint: 'pillar' }); B.way(f, s, 0, true); B.adv(f); } },
    ice(B, r, D, k) { const len = 10 + r() * 5; B.box(len / 2, 0, 0, 2.6 - k * .8, .4, len, 'ice'); B.box(len / 2, 0, -3, 10, .5, len + 2, 'kill'); B.way(len, 0, 0, false); B.adv(len); },
    zigzag(B, r, D, k) { const n = 4 + (r() * 2 | 0); for (let i = 0; i < n; i++) { const s = (i % 2 ? 1.7 : -1.7) * (.6 + k * .4), f = 2.2 * D.gap + .6; B.box(f, s, .4 * i % 1, 1.6, .5, 1.6); B.way(f, s, 0, true); B.adv(f); } },
  };
  const SEGS = Object.keys(SEG);
  const PLATE = (B, len) => { B.box(len / 2, 0, 0, 6, 1, len); B.way(len / 2, 0, 0, false); B.adv(len); };
  function checkpoint(B, n) { B.box(2.5, 0, 0, 6, 1, 5, 'solid', { tint: 'cp' }); const [x, z] = B.at(2.5, 0); B.objs.push({ id: ++B.id, kind: 'check', n, x, y: B.y + 1, z, w: 5.5, h: 2, d: 4.5 }); B.cps.push({ n, x, y: B.y + .02, z, hd: B.hd }); B.way(2.5, 0, 0, false); B.adv(5); }
  // Obby/Rennen: stages Abschnitte mit je 2–4 Segmenten, ab und zu eine Kurve, am Ende das Ziel
  function obby(world, diff, opt) {
    opt = opt || {}; const D = DIFF[diff] || DIFF.normale, r = rng((opt.seed || 1) * 7919 + world * 131 + 17), B = builder();
    const stages = opt.stages || 10; B.box(0, 0, 0, 8, 1, 10, 'solid', { tint: 'start' }); B.cps.push({ n: 0, x: 0, y: .02, z: 0, hd: 0 }); B.adv(5);
    const pool = world === 0 ? ['gaps', 'stairs', 'mover', 'beam', 'bounce', 'pillars', 'lava', 'spinner', 'falling', 'conveyor', 'zigzag']
      : world === 1 ? ['gaps', 'mover', 'lava', 'ice', 'spinner', 'falling', 'pillars', 'zigzag', 'bounce', 'beam', 'conveyor']
      : ['pillars', 'spinner', 'falling', 'mover', 'ice', 'zigzag', 'lava', 'beam', 'bounce', 'stairs', 'gaps', 'conveyor'];
    let last = '', turn = 0;
    for (let s = 1; s <= stages; s++) {
      const k = Math.min(1, (s - 1) / (stages - 1) * .85 + world * .12), segs = 2 + (s > stages / 2 ? 1 : 0);
      for (let i = 0; i < segs; i++) { let t; do t = pool[(r() * Math.min(pool.length, 3 + s) | 0)]; while (t === last); last = t; B.seg = t; SEG[t](B, r, D, k); B.seg = 'plate'; PLATE(B, 3); }
      if (s === stages || s % D.cpEvery === 0) { if (s === stages) { B.box(3, 0, 0, 8, 1, 6, 'solid', { tint: 'goal' }); const [x, z] = B.at(3, 0); B.objs.push({ id: ++B.id, kind: 'goal', x, y: B.y + 1.2, z, w: 7, h: 2.4, d: 5 }); B.way(3, 0, 0, false); B.adv(6); } else checkpoint(B, s); }
      else PLATE(B, 4);
      // gelegentlich abbiegen (nie zweimal in dieselbe Richtung → keine Überschneidung)
      if (s < stages && r() < .45) { const d = turn >= 1 ? -1 : turn <= -1 ? 1 : (r() < .5 ? -1 : 1); B.turn(d); turn += d; PLATE(B, 4); }
    }
    return finish(B, { mode: 'obby', world, diff, stages });
  }
  // Pavimento Lava: Raster aus Fliesen über Soße
  function lavaFloor(n, layers) { n = n || 10; layers = layers || 3; const B = builder(), objs = B.objs, S = 2.2;
    for (let L = 0; L < layers; L++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) objs.push({ id: ++B.id, kind: 'tile', x: (i - (n - 1) / 2) * S, y: -.25 - L * 6, z: (j - (n - 1) / 2) * S, w: S - .12, h: .5, d: S - .12, gi: i, gj: j, L, state: 0, timer: 0 });
    objs.push({ id: ++B.id, kind: 'kill', x: 0, y: -layers * 6 - 2, z: 0, w: n * S + 40, h: 1, d: n * S + 40 }); B.cps.push({ n: 0, x: 0, y: .02, z: 0, hd: 0 }); return finish(B, { mode: 'lava', n, S, layers });
  }
  // Torre Infinita: Plattformen spiralförmig nach oben; tower.extend() baut weiter
  function tower(seed, diff) {
    const D = DIFF[diff] || DIFF.normale, r = rng(seed || 3), B = builder(); B.box(0, 0, 0, 9, 1, 9, 'solid', { tint: 'start' }); B.cps.push({ n: 0, x: 0, y: .02, z: 0, hd: 0 });
    let a = 0, h = 0, R = 4.5; const W = finish(B, { mode: 'tower' });
    W.extend = upTo => { while (h < upTo) { a += (.75 + r() * .4) * D.gap; h += 1.2 + r() * .9; const x = Math.cos(a) * R, z = Math.sin(a) * R, sz = 2.4 - Math.min(1, h / 120) * .9 + (D.dbl ? .4 : 0), kind = h > 15 && r() < .18 ? 'fall' : h > 30 && r() < .12 ? 'bounce' : 'solid';
        const ob = { id: ++B.id, kind, x, y: h - .2, z, w: sz, h: .4, d: sz }; if (h > 20 && r() < .2) ob.move = { ax: r() < .5 ? 'x' : 'z', amp: 1.2, sp: .8 * D.move, ph: r() * 6 }; W.objs.push(ob); W.statics = null; if (r() < .25) W.objs.push({ id: ++B.id, kind: 'coin', x, y: h + .9, z, w: .7, h: .7, d: .7 }); W.route.push({ x, y: h, z, jump: true }); }
      prep(W); };
    W.extend(40); return W;
  }
  function finish(B, info) { const W = Object.assign({ objs: B.objs, route: B.route, cps: B.cps, coins: B.coins, t: 0 }, info); prep(W); return W; }
  // Statische Körper in ein Raster sortieren (schnelle Kollision); bewegte separat
  function prep(W) {
    const C = 6, grid = new Map(), dyn = []; W.minY = Infinity; W.maxZ = -Infinity;
    for (const o of W.objs) { o.bx = o.x; o.by = o.y; o.bz = o.z; if (o.move || o.kind === 'fall' || o.kind === 'tile' || o.kind === 'spin') { dyn.push(o); } else { const x0 = Math.floor((o.x - o.w / 2) / C), x1 = Math.floor((o.x + o.w / 2) / C), z0 = Math.floor((o.z - o.d / 2) / C), z1 = Math.floor((o.z + o.d / 2) / C); for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const k = i + ',' + j; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(o); } } if (o.kind !== 'coin' && o.kind !== 'check' && o.kind !== 'goal' && o.kind !== 'kill') W.minY = Math.min(W.minY, o.y - o.h / 2); }
    W.grid = grid; W.dyn = dyn; W.C = C; W.killY = (W.minY === Infinity ? 0 : W.minY) - 8;
  }
  function near(W, x, z, out) { out.length = 0; const C = W.C, i0 = Math.floor((x - 1) / C), i1 = Math.floor((x + 1) / C), j0 = Math.floor((z - 1) / C), j1 = Math.floor((z + 1) / C); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const a = W.grid.get(i + ',' + j); if (a) for (const o of a) if (!out.includes(o)) out.push(o); } for (const o of W.dyn) out.push(o); return out; }

  /* ---------- Welt fortschreiben (bewegte, fallende Plattformen, Fliesen) ---------- */
  function worldStep(W, dt) {
    W.t += dt;
    for (const o of W.dyn) {
      o.px = o.x; o.py = o.y; o.pz = o.z;
      if (o.move) { const m = o.move, v = Math.sin(W.t * m.sp + m.ph) * m.amp; o.x = o.bx + (m.ax === 'x' ? v : 0); o.y = o.by + (m.ax === 'y' ? v : 0); o.z = o.bz + (m.ax === 'z' ? v : 0); }
      if (o.kind === 'fall') { if (o.trig > 0) { o.trig += dt; if (o.trig > .55) { o.vy = (o.vy || 0) - 25 * dt; o.y += o.vy * dt; } if (o.trig > 3.5) { o.trig = 0; o.vy = 0; o.y = o.by; o.gone = false; } o.gone = o.trig > .55 && o.y < o.by - 6; } }
      if (o.kind === 'tile') { if (o.state === 1) { o.timer -= dt; if (o.timer <= 0) { o.state = 2; } } if (o.state === 2) { o.vy = (o.vy || 0) - 20 * dt; o.y += o.vy * dt; } }
      if (o.kind === 'spin') o.ang = W.t * o.sp + o.ph;
    }
  }
  const solid = o => o.kind !== 'coin' && o.kind !== 'check' && o.kind !== 'goal' && o.kind !== 'spin' && !(o.kind === 'tile' && o.state === 2 && o.y < -2) && !o.gone;

  /* ---------- Spielfigur ---------- */
  function newPlayer(W, o) { const cp = W.cps[0]; return Object.assign({ x: cp.x, y: cp.y, z: cp.z, vx: 0, vy: 0, vz: 0, yaw: 0, ground: null, coy: 0, buf: 0, jumps: 0, cp: 0, dead: 0, deaths: 0, coins: 0, got: new Set(), done: false, t: 0, air: 0, events: [] }, o || {}); }
  function respawn(W, P) { const c = W.cps.find(c => c.n === P.cp) || W.cps[0]; P.x = c.x; P.y = c.y + .05; P.z = c.z; P.vx = P.vy = P.vz = 0; P.ground = null; P.yaw = [0, PI2 / 4, PI2 / 2, -PI2 / 4][c.hd || 0]; P.inv = .8; }
  const PI2 = Math.PI * 2, tmp = [];
  // inp: { mx, mz (Weltrichtung, Länge ≤ 1), jump (Taste gedrückt), run }
  function step(W, P, inp, dt, D) {
    D = D || DIFF.normale; P.events.length = 0; if (P.done) return P;
    if (P.dead > 0) { P.dead -= dt; if (P.dead <= 0) { respawn(W, P); P.events.push('respawn'); } return P; }
    P.t += dt; if (P.inv > 0) P.inv -= dt;
    const g = P.ground;
    // mitbewegte Plattform
    if (g && g.px !== undefined && solid(g)) { P.x += g.x - g.px; P.y += g.y - g.py; P.z += g.z - g.pz; }
    const ice = g && g.kind === 'ice', acc = g ? (ice ? PHYS.accIce : PHYS.accG) : PHYS.accA;
    let tx = inp.mx * PHYS.speed, tz = inp.mz * PHYS.speed;
    if (g && g.kind === 'conv') { const [cx, cz] = g.w > g.d ? [g.conv, 0] : [0, g.conv]; tx += cx; tz += cz; }
    const ax = tx - P.vx, az = tz - P.vz, al = Math.hypot(ax, az), mx = acc * dt; if (al > mx) { P.vx += ax / al * mx; P.vz += az / al * mx; } else { P.vx = tx; P.vz = tz; }
    if (Math.hypot(inp.mx, inp.mz) > .1) P.yaw = Math.atan2(inp.mx, inp.mz);
    // Springen (Puffer + Coyote-Time + Doppelsprung)
    if (inp.jump && !P.jHeld) P.buf = PHYS.buf; P.jHeld = !!inp.jump; if (P.buf > 0) P.buf -= dt;
    if (g) { P.coy = PHYS.coyote; P.jumps = 0; } else if (P.coy > 0) P.coy -= dt;
    if (P.buf > 0 && (P.coy > 0 || (D.dbl && P.jumps < 2))) { P.vy = Math.max(P.vy, PHYS.jump * (P.coy > 0 ? 1 : .9)); P.buf = 0; P.coy = 0; P.jumps = (P.jumps || 0) + 1 + (g ? 0 : 0); P.ground = null; P.events.push(P.jumps > 1 ? 'jump2' : 'jump'); }
    if (!inp.jump && P.vy > 4 && !P.bounced) P.vy -= PHYS.grav * dt * 1.2; // kurzer Tastendruck = kleiner Sprung
    P.vy -= PHYS.grav * dt; if (P.vy < -30) P.vy = -30;
    // Bewegung je Achse mit Unterschritten
    const steps = Math.ceil(Math.max(Math.abs(P.vx), Math.abs(P.vy), Math.abs(P.vz)) * dt / .25) || 1, h = dt / steps; let landed = null;
    near(W, P.x, P.z, tmp);
    for (let s = 0; s < steps; s++) {
      P.x += P.vx * h; for (const o of tmp) if (solid(o) && hit(P, o)) { if (o.kind === 'kill') return die(P, W); if (stepUp(P, o)) { landed = o; continue; } P.x = P.vx > 0 ? o.x - o.w / 2 - PHYS.hw - 1e-4 : o.x + o.w / 2 + PHYS.hw + 1e-4; P.vx = 0; }
      P.z += P.vz * h; for (const o of tmp) if (solid(o) && hit(P, o)) { if (o.kind === 'kill') return die(P, W); if (stepUp(P, o)) { landed = o; continue; } P.z = P.vz > 0 ? o.z - o.d / 2 - PHYS.hw - 1e-4 : o.z + o.d / 2 + PHYS.hw + 1e-4; P.vz = 0; }
      P.y += P.vy * h; for (const o of tmp) if (solid(o) && hit(P, o)) { if (o.kind === 'kill') return die(P, W); if (P.vy <= 0) { P.y = o.y + o.h / 2; landed = o; } else P.y = o.y - o.h / 2 - PHYS.h - 1e-4; P.vy = 0; }
    }
    // Bodenkontakt prüfen (auch wenn die Figur still steht)
    if (!landed && P.vy <= 0) for (const o of tmp) if (solid(o) && P.y - (o.y + o.h / 2) < .06 && P.y - (o.y + o.h / 2) > -.2 && Math.abs(P.x - o.x) < o.w / 2 + PHYS.hw - .05 && Math.abs(P.z - o.z) < o.d / 2 + PHYS.hw - .05) { if (o.kind === 'kill') return die(P, W); landed = o; P.y = o.y + o.h / 2; P.vy = 0; break; }
    if (landed && !P.ground) P.events.push('land');
    // Bodenhöhe unter der Figur (für den Schatten)
    if (landed) P.groundY = P.y; else { let gy = -1e9; for (const o of tmp) if (solid(o) && Math.abs(P.x - o.x) < o.w / 2 && Math.abs(P.z - o.z) < o.d / 2) { const tp = o.y + o.h / 2; if (tp <= P.y + .05 && tp > gy) gy = tp; } P.groundY = gy > -1e8 ? gy : P.y - 50; }
    P.ground = landed; P.bounced = P.bounced && P.vy > 0; P.air = landed ? 0 : P.air + dt;
    if (landed) {
      if (landed.kind === 'bounce') { P.vy = PHYS.bounce; P.ground = null; P.bounced = true; P.events.push('bounce'); }
      if (landed.kind === 'fall' && !landed.trig) landed.trig = .001;
      if (landed.kind === 'tile' && landed.state === 0) { landed.state = 1; landed.timer = W.tileTime || .9; P.events.push('tile'); }
    }
    // Drehbalken, Münzen, Checkpoints, Ziel
    for (const o of tmp) {
      if (o.kind === 'spin') { const dx = P.x - o.x, dz = P.z - o.z; if (P.y < o.y + .5 + o.r && P.y + PHYS.h > o.y + .5 - o.r) { const ca = Math.cos(o.ang), sa = Math.sin(o.ang); for (const sg of [1, -1]) { const t = Math.max(0, Math.min(o.len, (dx * ca + dz * sa) * sg)), px = ca * t * sg, pz = sa * t * sg; if (Math.hypot(dx - px, dz - pz) < o.r + PHYS.hw && !(P.inv > 0)) { if (D.killSpin) return die(P, W); const nx = -sa * Math.sign(o.sp) * sg, nz = ca * Math.sign(o.sp) * sg; P.vx = nx * 5.5; P.vz = nz * 5.5; P.vy = 5; P.ground = null; P.inv = .5; P.events.push('knock'); } } } continue; }
      if (o.kind === 'coin' && !P.got.has(o.id) && Math.abs(P.x - o.x) < .8 && Math.abs(P.z - o.z) < .8 && P.y < o.y + .5 && P.y + PHYS.h > o.y - .4) { P.got.add(o.id); P.coins++; P.events.push('coin'); }
      if (o.kind === 'check' && o.n > P.cp && inside(P, o)) { P.cp = o.n; P.events.push('check'); }
      if (o.kind === 'goal' && inside(P, o)) { P.done = true; P.events.push('goal'); }
    }
    if (P.y < W.killY) return die(P, W);
    return P;
  }
  // kleine Stufen (bis 0,45) werden automatisch erstiegen
  const stepUp = (P, o) => { const top = o.y + o.h / 2; if (top - P.y > 0 && top - P.y <= .45 && P.vy <= .5) { P.y = top; P.vy = 0; return true; } return false; };
  const hit = (P, o) => Math.abs(P.x - o.x) < o.w / 2 + PHYS.hw && Math.abs(P.z - o.z) < o.d / 2 + PHYS.hw && P.y < o.y + o.h / 2 - 1e-4 && P.y + PHYS.h > o.y - o.h / 2 + 1e-4;
  const inside = (P, o) => Math.abs(P.x - o.x) < o.w / 2 && Math.abs(P.z - o.z) < o.d / 2 && P.y < o.y + o.h / 2 && P.y + PHYS.h > o.y - o.h / 2;
  function die(P, W) { P.dead = .9; P.deaths++; P.vx = P.vy = P.vz = 0; P.ground = null; P.events.push('die'); return P; }

  /* ---------- Computer-Läufer ---------- */
  // Rennen: Läufer folgt der Route mit echter Physik; je Stärke etwas langsamer/ungenauer. Fehlt der Sprung, fällt er wie alle.
  function botInput(W, P, skill, r) {
    const R = W.route; if (!R.length) return { mx: 0, mz: 0, jump: false };
    if (P.wi === undefined) P.wi = nearestRoute(W, P);
    if (P.dead > 0) { P.wi = nearestRoute(W, P); return { mx: 0, mz: 0, jump: false }; }
    const tgt = w => w.ob ? { x: w.ob.x, y: w.ob.y + w.ob.h / 2, z: w.ob.z } : w;
    // Wegpunkt erreicht (auf der richtigen Plattform stehend) → weiter
    const bounced = P.events && P.events.includes('bounce');
    for (let k = 0; k < 3 && P.wi < R.length - 1; k++) { const w = tgt(R[P.wi]); if (Math.hypot(w.x - P.x, w.z - P.z) < (R[P.wi].ob ? 1.1 : .9) && Math.abs(w.y - P.y) < 1.2 && (P.ground || bounced)) P.wi++; else break; }
    const W0 = R[P.wi], w = tgt(W0), dx = w.x - P.x, dz = w.z - P.z, d = Math.hypot(dx, dz) || 1, sp = [.74, .87, .97][skill] * (P.slow || 1);
    let jump = false, f = sp;
    if (!P.ground) {
      // in der Luft: so steuern, dass die Landung auf dem Ziel liegt
      const g = PHYS.grav, dy = P.y - w.y, disc = P.vy * P.vy + 2 * g * dy, tl = disc > 0 ? (P.vy + Math.sqrt(disc)) / g : .3;
      f = Math.min(sp, d / Math.max(.08, tl) / PHYS.speed); if (P.vy > 0) jump = true;
      for (const o of W.dyn) if (o.kind === 'spin' && Math.hypot(P.x - o.x, P.z - o.z) < o.len + 1) f = sp;
    } else {
      // Lücke vor dem Ziel? → an der Kante springen (oder auf die bewegte Plattform warten)
      const e = edgeDist(W, P, dx / d, dz / d), reach = 5.0 + (w.y < P.y ? 1.5 : 0) - Math.max(0, w.y - P.y) * .35 + (W0.hs || .5) * .8;
      if (e < d - .25 && e < .45) { if (d < reach) jump = true; else f = 0; }
      else if (P.ground.kind === 'fall' && P.ground.trig > .2 && d < reach) jump = true;
      else if (w.y > P.y + .9 && d < 3) jump = true;
      if (W0.ob && d > reach && e < .9) f = 0;
      // Drehbalken: Treffer vorausberechnen (eigene Bewegung + Drehung) → im richtigen Moment springen oder draußen warten
      const vx = dx / d * f * PHYS.speed, vz = dz / d * f * PHYS.speed;
      for (const o of W.dyn) if (o.kind === 'spin' && Math.abs(P.y - o.y) < .8) { const th = spinHit(o, P.x, P.z, vx, vz, W.t, 1.2); if (th === null) continue; const out = Math.hypot(P.x - o.x, P.z - o.z) > o.len + .6;
        if (th >= .08 && th <= .3) jump = true; else if (th < .08) { jump = true; } else if (out && th < .55) f = 0; }
    }
    return { mx: dx / d * f, mz: dz / d * f, jump };
  }
  // Wie weit trägt der Boden noch in Laufrichtung? (alle Flächen in Fußhöhe zählen, auch überlappende)
  function edgeDist(W, P, ux, uz) { near(W, P.x, P.z, tmp2); for (let t = 0; t <= 3; t += .15) { const x = P.x + ux * t, z = P.z + uz * t; let ok = false; for (const o of tmp2) if (solid(o) && o.kind !== 'kill' && Math.abs(o.y + o.h / 2 - P.y) < .15 && Math.abs(x - o.x) < o.w / 2 + .2 && Math.abs(z - o.z) < o.d / 2 + .2) { ok = true; break; } if (!ok) return t; } return 3; }
  const tmp2 = [];
  function spinHit(o, x, z, vx, vz, t0, horizon) { for (let tau = 0; tau <= horizon; tau += .04) { const a = (t0 + tau) * o.sp + o.ph, ca = Math.cos(a), sa = Math.sin(a), dx = x + vx * tau - o.x, dz = z + vz * tau - o.z; for (const sg of [1, -1]) { const q = Math.max(0, Math.min(o.len, (dx * ca + dz * sa) * sg)); if (Math.hypot(dx - ca * q * sg, dz - sa * q * sg) < o.r + PHYS.hw + .12) return tau; } } return null; }
  function nearestRoute(W, P) { let b = 0, bd = 1e9; const c = W.cps.find(c => c.n === P.cp) || W.cps[0]; W.route.forEach((w, i) => { const d = Math.hypot(w.x - c.x, w.z - c.z) + Math.abs(w.y - c.y) * 2; if (d < bd) { bd = d; b = i; } }); return b; }
  // Lava-Fliesen: Computer sucht die nächste sichere Fliese
  function lavaBot(W, P, r) {
    const tiles = W.objs.filter(o => o.kind === 'tile' && o.state === 0 && Math.abs(o.y + o.h / 2 - P.y) < 1.5); if (!tiles.length) return { mx: 0, mz: 0, jump: false };
    if (!P.tgt || P.tgt.state !== 0 || !tiles.includes(P.tgt) || r() < .01) { let best = null, bd = 1e9; for (const t of tiles) { const d = Math.hypot(t.x - P.x, t.z - P.z), nb = tiles.filter(u => Math.abs(u.gi - t.gi) + Math.abs(u.gj - t.gj) === 1).length, sc = Math.abs(d - 2.4) - nb * .6 + r() * 1.5; if (d > 1 && sc < bd) { bd = sc; best = t; } } P.tgt = best || tiles[0]; }
    const dx = P.tgt.x - P.x, dz = P.tgt.z - P.z, d = Math.hypot(dx, dz) || 1;
    // Loch voraus → springen
    const ax = P.x + dx / d * 1.1, az = P.z + dz / d * 1.1, under = W.objs.find(o => o.kind === 'tile' && Math.abs(o.x - ax) < o.w / 2 && Math.abs(o.z - az) < o.d / 2 && o.state < 2);
    return { mx: d > .3 ? dx / d * .8 : 0, mz: d > .3 ? dz / d * .8 : 0, jump: !under && !!P.ground };
  }
  // Fliesen nach und nach zum Wackeln bringen
  function lavaTick(W, dt, r, rate) { W.lt = (W.lt || 0) - dt; if (W.lt > 0) return null; W.lt = rate; const live = W.objs.filter(o => o.kind === 'tile' && o.state === 0); if (!live.length) return null; const t = live[(r() * live.length) | 0]; t.state = 1; t.timer = 1.2; return t; }

  // Test-Hilfe: Start + ein Segment + Ziel
  function mini(seg, diff, seed) { const D = DIFF[diff] || DIFF.normale, r = rng(seed), B = builder(); B.box(0, 0, 0, 8, 1, 10); B.cps.push({ n: 0, x: 0, y: .02, z: 0, hd: 0 }); B.adv(5); B.seg = seg; SEG[seg](B, r, D, .7); B.seg = 'plate'; PLATE(B, 3); B.box(3, 0, 0, 8, 1, 6); const [x, z] = B.at(3, 0); B.objs.push({ id: ++B.id, kind: 'goal', x, y: B.y + 1.2, z, w: 7, h: 2.4, d: 5 }); B.way(3, 0, 0, false); return finish(B, { mode: 'mini' }); }
  return { _mini: mini, DIFF, PHYS, WORLDS, SEG, SEGS, rng, obby, lavaFloor, tower, prep, worldStep, newPlayer, respawn, step, botInput, lavaBot, lavaTick, near };
})();
if (typeof module !== 'undefined') module.exports = BRCore;

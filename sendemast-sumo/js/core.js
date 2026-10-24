/* Sendemast-Sumo – Spiellogik ohne DOM (auch in Node testbar).
 * Runde Kämpfer schubsen sich auf einer Plattform hoch oben auf einem Sendemast gegenseitig über den Rand.
 * Physik in der Ebene (x, z) mit Kreis-Stößen, Schubser (Dash), Stampfer (Sprung + Druckwelle), Power-ups,
 * bröckelnde Plattform und Gefahren je Arena (Wind, Blitze, Neigung). KI-Gegner in drei Stufen. */
(function (root) {
  'use strict';
  const ARENAS = [
    { id: 'abendrot', n: 'Abendrot-Mast', d: 'Klassisch: Die Plattform bröckelt Ring für Ring.', fric: 2.8, haz: null, sky: ['#ff8a5b', '#ffd38a', '#8fd3e8'], plat: '#e2b38a', acc: '#ff6b35', fog: '#ffc79a' },
    { id: 'eis', n: 'Eiszacken-Gipfel', d: 'Spiegelglatt – wer zu schnell ist, rutscht ins Leere.', fric: 0.85, haz: null, sky: ['#7fb7ff', '#d9f1ff', '#ffffff'], plat: '#bfe0f5', acc: '#3fa9f5', fog: '#cfe9ff' },
    { id: 'sturm', n: 'Sturmmast', d: 'Böen schieben alle in eine Richtung – gegenhalten!', fric: 2.5, haz: 'wind', sky: ['#5e7a9b', '#a7c0cf', '#e3e9e1'], plat: '#bccbc6', acc: '#2ec4b6', fog: '#b7c8d1' },
    { id: 'gewitter', n: 'Gewitterspitze', d: 'Blitze schlagen ein – raus aus dem leuchtenden Kreis!', fric: 2.7, haz: 'blitz', sky: ['#2b2350', '#5b3f8c', '#b07ad9'], plat: '#b9aed8', acc: '#ffd23f', fog: '#4a3a78' },
    { id: 'wackel', n: 'Wackelturm', d: 'Die Plattform kippt hin und her – nicht abrutschen!', fric: 2.6, haz: 'tilt', sky: ['#1f9e89', '#9ee6b8', '#fff6c9'], plat: '#d7e6b0', acc: '#ff4f8b', fog: '#bfe8cf' }
  ];
  const RINGS = [7, 6.2, 5.4, 4.6, 3.8, 3.1];
  const SHRINK_AT = 16, SHRINK_EVERY = 8, FINAL_AT = SHRINK_AT + SHRINK_EVERY * (RINGS.length - 1) + 6, MIN_R = 1.3;
  // Erfundene Kämpfer und Fantasie-Sender (eigene Embleme, keine echten Marken)
  const FIGHTERS = [
    { id: 'toni', n: 'Toni Tornado', st: 'Sturmwelle 99', col: '#ff5a4e', col2: '#ffd166', ic: 'bolt', skin: '#f2c19b', hair: '#2b1d14', hs: 'knot', spd: 1.0, mass: 1.0, dash: 1.0 },
    { id: 'bella', n: 'Bella Bass', st: 'Basswerk FM', col: '#8e5cff', col2: '#3df0c4', ic: 'note', skin: '#c98a62', hair: '#1a1020', hs: 'buns', spd: 1.08, mass: 0.9, dash: 1.05 },
    { id: 'kalle', n: 'Kalle Koloss', st: 'Bergfunk 7', col: '#3a86ff', col2: '#ffbe0b', ic: 'mount', skin: '#f5cfb0', hair: '#7a4a24', hs: 'knot', band: true, spd: 0.88, mass: 1.35, dash: 0.95 },
    { id: 'mimi', n: 'Mimi Mikro', st: 'Pling Radio', col: '#ff70a6', col2: '#ffffff', ic: 'star', skin: '#ffd9c2', hair: '#ff9f1c', hs: 'pony', spd: 1.15, mass: 0.82, dash: 1.1 },
    { id: 'ole', n: 'Ole Orkan', st: 'Tiefsee-Welle', col: '#06d6a0', col2: '#073b4c', ic: 'wave', skin: '#8d5a3b', hair: '#111111', hs: 'mohawk', spd: 1.0, mass: 1.05, dash: 1.0 },
    { id: 'frieda', n: 'Frieda Frost', st: 'Polarstern 104', col: '#9bf6ff', col2: '#4361ee', ic: 'flake', skin: '#f7d7c4', hair: '#e8eef7', hs: 'buns', band: true, spd: 1.04, mass: 0.95, dash: 1.05 },
    { id: 'bruno', n: 'Bruno Brummer', st: 'Honig-FM', col: '#ffb703', col2: '#6a4c93', ic: 'hex', skin: '#e0a47a', hair: '#3b2a1a', hs: 'beard', spd: 0.94, mass: 1.2, dash: 0.98 },
    { id: 'nova', n: 'Nova Neon', st: 'Kosmo 3000', col: '#c77dff', col2: '#f72585', ic: 'moon', skin: '#a86b4c', hair: '#f72585', hs: 'pony', band: true, spd: 1.1, mass: 0.92, dash: 1.12 }
  ];
  const PU = { mega: { n: 'Mega', dur: 7, ic: '🍔' }, turbo: { n: 'Turbo', dur: 6, ic: '⚡' }, schild: { n: 'Schild', dur: 5, ic: '🛡️' }, welle: { n: 'Druckwelle', dur: 0, ic: '💥' } };
  const DIFF = [{ n: 'Locker', react: .6, aim: .5, agg: .4, edge: 2.2, spd: .7 }, { n: 'Normal', react: .32, aim: .25, agg: .65, edge: 1.7, spd: .85 }, { n: 'Profi', react: .16, aim: .1, agg: .9, edge: 1.35, spd: 1 }];
  const R0 = .62, ACC = 24, VMAX = 6.4, DASH_V = 13.5, DASH_CD = 1.15, DASH_T = .2, SLAM_CD = 4, SLAM_AIR = .42, SLAM_R = 2.7, KO_WINDOW = 3;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const fighter = id => FIGHTERS.find(f => f.id === id) || FIGHTERS[0];

  // Ein Match: Spieler [{ fid, kind: 'human'|'cpu', diff, name, slot }], Arena, Siege bis zum Gewinn
  function newMatch(o) {
    return { arena: o.arena || 0, players: o.players.map((p, i) => Object.assign({ i, wins: 0, ko: 0, falls: 0, pushes: 0, slams: 0 }, p)), target: o.target || 2, round: 0, rng: mulberry(o.seed || (Math.random() * 1e9) | 0), done: false, winner: -1, randomArena: !!o.randomArena };
  }
  function newRound(M) {
    M.round++;
    if (M.randomArena && M.round > 1) M.arena = Math.floor(M.rng() * ARENAS.length);
    const A = ARENAS[M.arena], n = M.players.length, F = [];
    M.players.forEach((p, i) => {
      const a = Math.PI / 2 + i / n * Math.PI * 2, d = n > 4 ? 4.4 : 4, fd = fighter(p.fid);
      F.push({ i, fid: p.fid, x: Math.cos(a) * d, z: Math.sin(a) * d, vx: 0, vz: 0, y: 0, vy: 0, face: a + Math.PI, r: R0, m: fd.mass, alive: true, falling: false,
        dashT: 0, dashCd: .9, slamT: 0, slamCd: 2, stun: 0, pu: { mega: 0, turbo: 0, schild: 0 }, last: { by: -1, t: -9 }, out: -1, place: 0, ai: { t: .8 + i * .15, tx: 0, tz: 0, want: null } });
    });
    return { M, A, ai: M.arena, t: 0, fightT: 0, ring: 0, R: RINGS[0], f: F, pus: [], strikes: [], wind: { x: 0, z: 0, t: 0, warn: 0 }, tilt: { x: 0, z: 0, a: 0 },
      phase: 'count', count: 3, nextPU: 6 + M.rng() * 3, nextHaz: 7, ev: [], winner: -1, order: [], suddenDeath: false };
  }
  const alive = W => W.f.filter(f => f.alive && !f.falling);

  function hit(W, a, b, j, kind) {   // Stoß j auf Kämpfer b (von a), Schild dämpft
    if (b.slamT > 0) return;          // in der Luft: unantastbar
    const k = b.pu.schild > 0 ? .25 : 1;
    b.vx += j.x * k / b.m; b.vz += j.z * k / b.m;
    if (Math.hypot(j.x, j.z) * k / b.m > 6) b.hitT = .25;   // kurz nach einem Treffer weniger Kontrolle – so wirkt der Stoß
    if (a) { b.last = { by: a.i, t: W.t }; }
    W.ev.push({ k: kind || 'hit', i: a ? a.i : -1, j: b.i, p: Math.hypot(j.x, j.z) * k, x: b.x, z: b.z });
  }

  // Ein Zeitschritt. inp[i] = { x, z, dash, slam } (dash/slam: in diesem Schritt gedrückt)
  function step(W, inp, dt) {
    const M = W.M, A = W.A, rng = M.rng; W.t += dt;
    if (W.phase === 'count') { const c = Math.ceil(3 - W.t); if (c !== W.count) { W.count = c; W.ev.push({ k: c > 0 ? 'beep' : 'go', n: c }); } if (W.t >= 3) { W.phase = 'fight'; W.t = 0; } else return W; }
    if (W.phase === 'end') { W.endT += dt; return W; }
    W.fightT += dt; const T = W.fightT;
    // Plattform bröckelt
    const want = T < SHRINK_AT ? 0 : Math.min(RINGS.length - 1, 1 + Math.floor((T - SHRINK_AT) / SHRINK_EVERY));
    if (W.ring < RINGS.length - 1 && T > SHRINK_AT + W.ring * SHRINK_EVERY - 2.5 && W.warnRing !== W.ring + 1) { W.warnRing = W.ring + 1; W.ev.push({ k: 'ringWarn', ring: W.ring + 1 }); }
    if (want > W.ring) { W.ring = want; W.R = RINGS[want]; W.ev.push({ k: 'ring', ring: want }); }
    if (T > FINAL_AT) { if (!W.suddenDeath) { W.suddenDeath = true; W.ev.push({ k: 'sudden' }); } W.R = Math.max(MIN_R, RINGS[RINGS.length - 1] - (T - FINAL_AT) * .09); }
    // Gefahren
    if (A.haz === 'wind') {
      if (W.wind.t > 0) { W.wind.t -= dt; if (W.wind.t <= 0) { W.wind.x = W.wind.z = 0; W.nextHaz = 5 + rng() * 4; } }
      else if (W.wind.warn > 0) { W.wind.warn -= dt; if (W.wind.warn <= 0) { W.wind.t = 2.6; W.ev.push({ k: 'wind' }); } }
      else if ((W.nextHaz -= dt) <= 0) { const a = rng() * Math.PI * 2; W.wind.x = Math.cos(a); W.wind.z = Math.sin(a); W.wind.warn = 1.3; W.ev.push({ k: 'windWarn', x: W.wind.x, z: W.wind.z }); W.nextHaz = 99; }
    } else if (A.haz === 'blitz') {
      if ((W.nextHaz -= dt) <= 0) {
        const tgt = alive(W), n = 1 + Math.min(3, Math.floor(T / 20));
        for (let k = 0; k < n; k++) { const f = tgt[Math.floor(rng() * tgt.length)], a = rng() * 6.283, d = rng() * 1.2; let x = f ? f.x + Math.cos(a) * d : 0, z = f ? f.z + Math.sin(a) * d : 0; const r = Math.hypot(x, z), lim = W.R - .4; if (r > lim) { x *= lim / r; z *= lim / r; } W.strikes.push({ x, z, t: 1.25, r: 1.7 }); W.ev.push({ k: 'strikeWarn', x, z }); }
        W.nextHaz = 3.2 + rng() * 2.4 - Math.min(1.2, T / 60);
      }
      for (const s of W.strikes) { s.t -= dt; if (s.t <= 0 && !s.done) { s.done = true; W.ev.push({ k: 'strike', x: s.x, z: s.z }); for (const f of W.f) { if (!f.alive || f.falling) continue; const dx = f.x - s.x, dz = f.z - s.z, d = Math.hypot(dx, dz); if (d < s.r) { const p = 7 + 7 * (1 - d / s.r), n = d > .05 ? { x: dx / d, z: dz / d } : { x: Math.cos(f.face), z: Math.sin(f.face) }; f.stun = .5; hit(W, null, f, { x: n.x * p, z: n.z * p }, 'zap'); } } } }
      W.strikes = W.strikes.filter(s => s.t > -.6);
    } else if (A.haz === 'tilt') { W.tilt.a += dt * (.55 + T * .004); const amp = Math.min(1, .35 + T / 40); W.tilt.x = Math.cos(W.tilt.a) * amp; W.tilt.z = Math.sin(W.tilt.a * .73) * amp; }
    // Power-ups
    if ((W.nextPU -= dt) <= 0 && W.pus.length < 2) {
      const types = Object.keys(PU), a = rng() * 6.283, d = rng() * Math.max(.5, W.R - 1.4);
      W.pus.push({ type: types[Math.floor(rng() * types.length)], x: Math.cos(a) * d, z: Math.sin(a) * d, t: 0 }); W.ev.push({ k: 'puSpawn' }); W.nextPU = 6 + rng() * 4;
    }
    for (const p of W.pus) { p.t += dt; const r = Math.hypot(p.x, p.z); if (r > W.R - .5) p.gone = true; }
    // Bewegung
    const fric = A.fric;
    for (const f of W.f) {
      if (!f.alive) continue;
      const fd = fighter(f.fid), u = inp[f.i] || {}, mega = f.pu.mega > 0, turbo = f.pu.turbo > 0;
      for (const k in f.pu) if (f.pu[k] > 0) f.pu[k] = Math.max(0, f.pu[k] - dt);
      f.r = R0 * (mega ? 1.38 : 1); f.m = fd.mass * (mega ? 2.2 : 1);
      if (f.falling) { f.vy -= 30 * dt; f.y += f.vy * dt; f.x += f.vx * dt; f.z += f.vz * dt; if (f.y < -14) { f.alive = false; } continue; }
      f.dashCd = Math.max(0, f.dashCd - dt); f.slamCd = Math.max(0, f.slamCd - dt); f.stun = Math.max(0, f.stun - dt);
      let ix = +u.x || 0, iz = +u.z || 0; const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
      if (f.stun > 0) { ix *= .2; iz *= .2; }
      if (il > .15) f.face = Math.atan2(iz, ix);
      const sp = fd.spd * (turbo ? 1.3 : 1);
      // Schubser
      // Tastendruck kurz merken, falls der Schubs noch lädt (fühlt sich sonst „verschluckt“ an)
      f.dashBuf = u.dash ? .3 : Math.max(0, (f.dashBuf || 0) - dt); f.slamBuf = u.slam ? .25 : Math.max(0, (f.slamBuf || 0) - dt);
      if (f.dashBuf > 0 && f.dashCd <= 0 && f.slamT <= 0 && f.stun <= 0) { f.dashBuf = 0;
        const a = il > .15 ? Math.atan2(iz, ix) : f.face, v = DASH_V * fd.dash * (turbo ? 1.15 : 1);
        f.vx = Math.cos(a) * v; f.vz = Math.sin(a) * v; f.face = a; f.dashT = DASH_T; f.dashCd = turbo ? .4 : DASH_CD; M.players[f.i].pushes++;
        W.ev.push({ k: 'dash', i: f.i, x: f.x, z: f.z });
      }
      // Stampfer: kurzer Sprung, bei der Landung Druckwelle
      if (f.slamBuf > 0 && f.slamCd <= 0 && f.slamT <= 0) { f.slamBuf = 0; f.slamT = SLAM_AIR; f.vy = 9; f.slamCd = SLAM_CD; W.ev.push({ k: 'jump', i: f.i }); }
      if (f.slamT > 0) {
        f.slamT -= dt; f.y = Math.max(0, f.y + f.vy * dt); f.vy -= 9 / (SLAM_AIR / 2) * dt;
        if (f.slamT <= 0) { f.y = 0; f.vy = 0; slam(W, f, SLAM_R * (mega ? 1.25 : 1), 7); M.players[f.i].slams++; }
      }
      // Steuerung: direkt auf die Wunschgeschwindigkeit zulenken (straff, bremst beim Loslassen). Wind und Neigung verschieben
      // das Ziel, kurz nach einem Treffer und auf Eis greift die Steuerung schwächer – so bleiben Stöße wirksam.
      f.hitT = Math.max(0, (f.hitT || 0) - dt);
      if (f.dashT > 0) { f.dashT -= dt; f.vx *= Math.exp(-1.5 * dt); f.vz *= Math.exp(-1.5 * dt); }
      else {
        const vm = VMAX * sp; let tx = ix * vm, tz = iz * vm;
        if (W.wind.t > 0) { tx += W.wind.x * 2.6 / f.m; tz += W.wind.z * 2.6 / f.m; }
        if (A.haz === 'tilt') { tx += W.tilt.x * 2.2; tz += W.tilt.z * 2.2; }
        const ice = fric < 1.5, ctrl = (f.hitT > 0 || f.stun > 0 ? .4 : 1) * (ice ? .45 : 1), dx = tx - f.vx, dz = tz - f.vz, dl = Math.hypot(dx, dz), mx = 50 * ctrl * dt;
        if (dl > mx) { f.vx += dx / dl * mx; f.vz += dz / dl * mx; } else { f.vx = tx; f.vz = tz; }
        if (f.hitT > 0) { const d = Math.exp(-Math.max(1.2, fric) * dt); f.vx *= d; f.vz *= d; }
      }
      f.x += f.vx * dt; f.z += f.vz * dt;
    }
    // Stöße zwischen Kämpfern
    const L = W.f.filter(f => f.alive && !f.falling);
    for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
      const p = L[a], q = L[b]; if (p.slamT > 0 || q.slamT > 0) continue;
      const dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz), rr = p.r + q.r;
      if (d >= rr || d < 1e-6) continue;
      const nx = dx / d, nz = dz / d, ov = rr - d, im = 1 / p.m + 1 / q.m;
      p.x -= nx * ov * (1 / p.m) / im; p.z -= nz * ov * (1 / p.m) / im; q.x += nx * ov * (1 / q.m) / im; q.z += nz * ov * (1 / q.m) / im;
      const vr = (q.vx - p.vx) * nx + (q.vz - p.vz) * nz; if (vr > 0) continue;
      const j = -1.0 * vr / im;
      // Wer schubst, gibt mehr ab und steht stabiler
      const pa = p.dashT > 0 ? 1 : 0, qa = q.dashT > 0 ? 1 : 0, bonusQ = pa ? 2 : 0, bonusP = qa ? 2 : 0;
      const jq = j + bonusQ, jp = j * (pa && !qa ? .35 : 1) + bonusP;   // wer schubst, bekommt weniger Rückstoß
      hit(W, p, q, { x: nx * jq, z: nz * jq }, 'bump');
      hit(W, q, p, { x: -nx * jp, z: -nz * jp }, 'bump');
      if (pa) { p.vx *= .35; p.vz *= .35; p.dashT = 0; } if (qa) { q.vx *= .35; q.vz *= .35; q.dashT = 0; }
      W.ev.push({ k: 'clash', i: p.i, j: q.i, p: -vr, x: (p.x + q.x) / 2, z: (p.z + q.z) / 2 });
    }
    // Power-ups einsammeln
    for (const pu of W.pus) { if (pu.gone) continue; for (const f of L) { if (Math.hypot(f.x - pu.x, f.z - pu.z) < f.r + .45) { pu.gone = true; if (pu.type === 'welle') slam(W, f, 3.6, 10); else f.pu[pu.type] = PU[pu.type].dur; W.ev.push({ k: 'pu', i: f.i, type: pu.type }); break; } } }
    W.pus = W.pus.filter(p => !p.gone);
    // Rand: wer drüber ist, fällt
    for (const f of L) {
      if (f.slamT > 0) continue;
      if (Math.hypot(f.x, f.z) > W.R + f.r * .15) {
        f.falling = true; f.vy = 1.5; f.out = W.order.length; W.order.push(f.i); M.players[f.i].falls++;
        const by = W.t - f.last.t < KO_WINDOW && f.last.by >= 0 && f.last.by !== f.i ? f.last.by : -1; if (by >= 0) M.players[by].ko++;
        W.ev.push({ k: 'fall', i: f.i, by, x: f.x, z: f.z });
      }
    }
    // Rundenende
    const st = alive(W);
    if (st.length <= 1) {
      W.phase = 'end'; W.endT = 0; W.winner = st.length ? st[0].i : -1;
      if (W.winner >= 0) { M.players[W.winner].wins++; W.order.push(W.winner); }
      const best = M.players.reduce((a, p) => p.wins > a.wins ? p : a, M.players[0]);
      if (best.wins >= M.target) { M.done = true; M.winner = best.i; }
      W.ev.push({ k: 'roundEnd', i: W.winner, done: M.done });
    }
    return W;
  }
  function slam(W, f, R, P) {
    W.ev.push({ k: 'slam', i: f.i, x: f.x, z: f.z, r: R });
    for (const o of W.f) { if (o === f || !o.alive || o.falling) continue; const dx = o.x - f.x, dz = o.z - f.z, d = Math.hypot(dx, dz); if (d < R + o.r) { const p = P * (1 - Math.min(1, d / (R + o.r))) + 2.5, n = d > .05 ? { x: dx / d, z: dz / d } : { x: 1, z: 0 }; hit(W, f, o, { x: n.x * p, z: n.z * p }, 'slamHit'); o.stun = Math.max(o.stun, .35); } }
  }

  // KI: sucht das Opfer nahe am Rand, stellt sich dahinter (Richtung Mitte) und schubst nach außen
  function ai(W, i, lvl) {
    const f = W.f[i], D = DIFF[lvl] || DIFF[1], m = f.ai, rng = W.M.rng, out = { x: 0, z: 0, dash: false, slam: false };
    if (!f.alive || f.falling || W.phase !== 'fight') return out;
    m.t -= 1 / 60;
    const r = Math.hypot(f.x, f.z), others = W.f.filter(o => o !== f && o.alive && !o.falling);
    // Gefahr: Rand oder Blitz → zur Mitte
    let dang = r > W.R - D.edge, sx = 0, sz = 0;
    for (const s of W.strikes) if (!s.done && Math.hypot(f.x - s.x, f.z - s.z) < s.r + .4) { dang = true; sx += f.x - s.x; sz += f.z - s.z; }
    if (W.wind.t > 0 || W.wind.warn > 0) { sx -= W.wind.x * 1.4; sz -= W.wind.z * 1.4; }
    if (W.A.haz === 'tilt') { sx -= W.tilt.x * 1.2; sz -= W.tilt.z * 1.2; }
    if (m.t <= 0) {
      m.t = D.react * (.7 + rng() * .6);
      let tgt = null, best = -1e9;
      for (const o of others) { const or = Math.hypot(o.x, o.z), d = Math.hypot(o.x - f.x, o.z - f.z), sc = or * 1.4 - d * .8 + (o.pu.schild > 0 ? -3 : 0); if (sc > best) { best = sc; tgt = o; } }
      const pu = W.pus.find(p => Math.hypot(p.x - f.x, p.z - f.z) < 3.5 && Math.hypot(p.x, p.z) < W.R - 1.2);
      m.want = pu && rng() < .7 ? { x: pu.x, z: pu.z, pu: true } : tgt ? { o: tgt.i } : null;
      m.err = (rng() - .5) * D.aim * 2;
    }
    let tx = 0, tz = 0, o = m.want && m.want.o != null ? W.f[m.want.o] : null;
    if (o && (!o.alive || o.falling)) o = null;
    if (m.want && m.want.pu) { tx = m.want.x; tz = m.want.z; }
    else if (o) {
      const or = Math.hypot(o.x, o.z) || 1, ox = o.x / or, oz = o.z / or;
      // Position hinter dem Gegner (von der Mitte aus gesehen)
      tx = o.x - ox * 1.6; tz = o.z - oz * 1.6;
      const d = Math.hypot(o.x - f.x, o.z - f.z), ax = (o.x - f.x) / d, az = (o.z - f.z) / d, along = ax * ox + az * oz;
      if (d < 3.2 && along > .45 - D.agg * .25 && or > W.R * .5 && f.dashCd <= 0 && rng() < D.agg * .25) { const a = Math.atan2(az, ax) + m.err; out.x = Math.cos(a); out.z = Math.sin(a); out.dash = true; return out; }
      if (d < 1.9) { tx = o.x; tz = o.z; }
    }
    if (f.slamCd <= 0 && others.filter(q => Math.hypot(q.x - f.x, q.z - f.z) < SLAM_R).length >= (lvl >= 2 ? 1 : 2) && rng() < .01 + D.agg * .025) out.slam = true;
    let dx = tx - f.x, dz = tz - f.z;
    if (dang) { dx = -f.x * 1.5 + sx * 2; dz = -f.z * 1.5 + sz * 2; }
    else { dx += sx; dz += sz; }
    const l = Math.hypot(dx, dz); if (l > .05) { const sp = dang ? 1 : D.spd * Math.min(1, l / 1.2); out.x = dx / l * sp; out.z = dz / l * sp; }
    // Auf Eis vorsichtiger
    if (W.A.fric < 1.5 && r > W.R - 2.6) { out.x = out.x * .5 - f.x / (r || 1) * .6; out.z = out.z * .5 - f.z / (r || 1) * .6; }
    return out;
  }

  // Turnier: 5 Stationen (Arenen), je 3 KI-Gegner, steigende Stärke
  function tourStage(k, fid, rng) {
    rng = rng || Math.random;
    const pool = FIGHTERS.filter(f => f.id !== fid).map(f => f.id).sort(() => rng() - .5);
    return { arena: k % ARENAS.length, target: 2, players: [{ fid, kind: 'human', slot: 0 }].concat([0, 1, 2].map(j => ({ fid: pool[j], kind: 'cpu', diff: k < 1 ? 0 : k < 3 ? (j === 0 ? 2 : 1) : 2 }))) };
  }
  function tourPoints(M, idx) {
    const p = M.players[idx]; let pts = p.wins * 250 + p.ko * 100;
    if (M.done && M.winner === idx) { pts += 500 * (1 + (M.stage || 0)); if (M.players.every((q, j) => j === idx || q.wins === 0)) pts += 300; }
    return pts;
  }

  const SM = { ARENAS, RINGS, FIGHTERS, PU, DIFF, SHRINK_AT, SHRINK_EVERY, FINAL_AT, mulberry, fighter, newMatch, newRound, step, ai, alive, tourStage, tourPoints };
  if (typeof module !== 'undefined' && module.exports) module.exports = SM;
  root.SM = SM;
})(typeof window !== 'undefined' ? window : globalThis);

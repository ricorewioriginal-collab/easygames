/* Funk-Minigolf 3D – Bahnen und Ballphysik (ohne DOM; Browser und Node).
 * Ebene: x nach rechts, z nach vorn (Meter). Die 3D-Ansicht baut alles aus diesen Daten. */
(function (root) {
  'use strict';
  const BALL = 0.1, CUP = 0.17, MAXV = 7.2;
  const R = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  // Logos: ../anmacha-memory/logos/NN.png (01 RicoReWi, 02 YourTime-FM, 03 Rapradio 24, 04 Schlagerpop 24, 05 Chartradio 24, 06 Clubradio 24,
  // 07 AnMaCha 24, 08 RadioFloh!, 09 Rockradio 24, 10 Christmasradio 24, 11 Kultradio 24, 12 Zocker-FM, 13 Special-Radio, 14 AnMaChaCast)
  const HOLES = [
    { n: 'Willkommen im Radioportal', sub: 'Schön, dass du da bist!', par: 2, logo: 1, theme: 'portal', bounds: [R(0, 0, 2.4, 10)], tee: [1.2, 1], cup: [1.2, 9] },
    { n: 'YourTime-FM Strandbar', sub: 'Sender · Sand im Schuh', par: 3, logo: 2, theme: 'strand', bounds: [[[0, 0], [2.4, 0], [2.4, 8], [7, 8], [7, 10.4], [0, 10.4]]], tee: [1.2, 1], cup: [6.1, 9.2],
      sand: [R(0, 8.6, 1.3, 10.4), R(3.5, 8, 4.6, 9.2)] },
    { n: 'Rapradio 24 Straße', sub: 'Sender · Zickzack durch die Hood', par: 4, logo: 3, theme: 'street', bounds: [R(0, 0, 4, 14)], tee: [1, 1], cup: [2, 13],
      walls: [[[0, 4], [2.8, 4]], [[1.2, 8], [4, 8]], [[0, 11.2], [2.6, 11.2]]] },
    { n: 'Schlagerpop 24 Party', sub: 'Sender · Discokugeln im Weg', par: 3, logo: 4, theme: 'party', bounds: [R(0, 0, 4, 12)], tee: [2, 1], cup: [2, 11],
      bumpers: [[1.2, 4, .35], [2.8, 5.5, .35], [2, 7.5, .4], [1, 9.4, .3], [3, 9.4, .3]] },
    { n: 'Chartradio 24 Hitparade', sub: 'Sender · Rauf aufs Treppchen', par: 3, logo: 5, theme: 'charts', bounds: [R(0, 0, 3, 12)], tee: [1.5, 1], cup: [2.3, 11],
      slopes: [{ p: R(0, 4, 3, 6), f: [0, -1.0], h: .25 }, { p: R(0, 7.5, 3, 9.5), f: [0, -1.3], h: .5 }] },
    { n: 'Clubradio 24 Plattenteller', sub: 'Sender · Der DJ dreht durch', par: 3, logo: 6, theme: 'club', bounds: [R(0, 0, 4, 12)], tee: [2, 1], cup: [2, 11],
      movers: [{ k: 'rot', c: [2, 6], len: 3.3, w: .14, sp: 1.15 }] },
    { n: 'AnMaCha 24 Studio', sub: 'ON AIR · Mischpult-Regler', par: 3, logo: 7, theme: 'studio', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      movers: [{ k: 'slide', a: [.9, 4], b: [4.1, 4], w: 1.4, d: .3, sp: .55 }, { k: 'slide', a: [4.1, 6.5], b: [.9, 6.5], w: 1.4, d: .3, sp: .7 }, { k: 'slide', a: [.9, 9], b: [4.1, 9], w: 1.4, d: .3, sp: .45 }] },
    { n: 'Sendeplan', sub: 'Rubrik · Jeder Pfosten ein Termin', par: 3, logo: 0, theme: 'plan', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      bumpers: [[.9, 3.5, .17], [2.5, 3.5, .17], [4.1, 3.5, .17], [1.7, 5.3, .17], [3.3, 5.3, .17], [.9, 7.1, .17], [2.5, 7.1, .17], [4.1, 7.1, .17], [1.7, 8.9, .17], [3.3, 8.9, .17]] },
    { n: 'Voting', sub: 'Rubrik · Links oder rechts? Du entscheidest!', par: 3, logo: 0, theme: 'voting', bounds: [R(0, 0, 6, 12)], tee: [3, 1], cup: [3, 11],
      walls: [[[2.4, 3], [3.6, 3], [3.6, 9], [2.4, 9], [2.4, 3]]], sand: [R(0, 5, 2.4, 7)], slopes: [{ p: R(3.6, 4.5, 6, 7.5), f: [-.9, 0], h: .2 }] },
    { n: 'RadioFloh! Kinderzimmer', sub: 'Sender · Ums Eck mit Schwung', par: 3, logo: 8, theme: 'kids', bounds: [[[0, 0], [2.4, 0], [2.4, 8], [4.6, 8], [4.6, 0], [7, 0], [7, 10.4], [0, 10.4]]], tee: [1.2, 1], cup: [5.8, 1.2],
      bumpers: [[3.5, 9.4, .3]] },
    { n: 'Rockradio 24 Gitarrenhals', sub: 'Sender · Bloß nicht ins Wasser', par: 3, logo: 9, theme: 'rock', bounds: [R(0, 0, 4, 14)], tee: [2, 1], cup: [2, 13],
      water: [R(0, 4, 1.35, 10), R(2.65, 4, 4, 10)] },
    { n: 'Christmasradio 24 Winterwald', sub: 'Sender · Glatteis zwischen den Tannen', par: 3, logo: 10, theme: 'winter', bounds: [R(0, 0, 4, 13)], tee: [2, 1], cup: [2, 12],
      ice: [R(0, 3, 4, 10)], bumpers: [[1, 5, .35], [3, 7, .35], [1.6, 9, .3], [2.2, 6.2, .3]] },
    { n: 'Kultradio 24 Kassette', sub: 'Sender · Zwei Spulen, ein Ziel', par: 3, logo: 11, theme: 'retro', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      movers: [{ k: 'rot', c: [1.4, 6], len: 2.2, w: .12, sp: 1.5 }, { k: 'rot', c: [3.6, 6], len: 2.2, w: .12, sp: -1.5 }] },
    { n: 'Zocker-FM Arcade', sub: 'Sender · Ab durchs Portal', par: 2, logo: 12, theme: 'arcade', bounds: [R(0, 0, 3, 6), R(0, 8, 3, 14)], tee: [1.5, 1], cup: [1.5, 13],
      portals: [{ a: [1.5, 5], b: [1.5, 9.2] }] },
    { n: 'Special-Radio Insel', sub: 'Sender · Ein Steg zur Insel', par: 3, logo: 13, theme: 'insel', bounds: [R(0, 0, 6, 14)], tee: [3, 1], cup: [3, 9],
      water: [R(0, 5, 2.6, 13), R(3.4, 5, 6, 13), R(2.6, 10.6, 3.4, 13)], island: R(2, 7.4, 4, 10.6) },
    { n: 'AnMaChaCast Podcast', sub: 'Podcast · Auf der Schallwelle', par: 3, logo: 14, theme: 'podcast', bounds: [R(0, 0, 3.5, 14)], tee: [1.75, 1], cup: [1.75, 13],
      slopes: [{ p: R(0, 3, 3.5, 5), f: [.9, 0], h: .15 }, { p: R(0, 6, 3.5, 8), f: [-.9, 0], h: .15 }, { p: R(0, 9, 3.5, 11), f: [.9, 0], h: .15 }] },
    { n: 'Sleep-Timer', sub: 'Funktion · 15, 30 oder 60 Minuten?', par: 3, logo: 0, theme: 'nacht', bounds: [R(0, 0, 4, 14)], tee: [2, 1], cup: [2, 13],
      walls: [[[0, 7], [1.3, 7]], [[2.7, 7], [4, 7]]], movers: [{ k: 'rot', c: [2, 7], len: 1.25, w: .14, sp: .9, half: true }] },
    { n: 'Funkturm-Finale', sub: 'Empfang · Bis zum Sendemast!', par: 4, logo: 1, theme: 'turm', bounds: [[[0, 0], [3, 0], [3, 10], [8, 10], [8, 18], [5, 18], [5, 13], [0, 13]]], tee: [1.5, 1], cup: [6.5, 17],
      bumpers: [[1.5, 11.5, .3], [4, 11.5, .3]], slopes: [{ p: R(5, 14.5, 8, 16.5), f: [0, -.7], h: .25 }] }
  ];

  /* ---------- Geometrie ---------- */
  function inPoly(p, x, z) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, zi] = p[i], [xj, zj] = p[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
  const inAny = (ps, x, z) => (ps || []).some(p => inPoly(p, x, z));
  function segsOf(h) { // alle festen Wandstücke
    const out = [];
    for (const p of h.bounds) for (let i = 0; i < p.length; i++) out.push([p[i], p[(i + 1) % p.length]]);
    for (const w of h.walls || []) for (let i = 0; i + 1 < w.length; i++) out.push([w[i], w[i + 1]]);
    return out;
  }
  // bewegliche Hindernisse zur Zeit t: Liste von Strecken mit Geschwindigkeit
  function moverSegs(m, t) {
    if (m.k === 'rot') {
      const a = m.sp * t, ca = Math.cos(a), sa = Math.sin(a), L = m.len / 2;
      const p0 = m.half ? [m.c[0], m.c[1]] : [m.c[0] - ca * L, m.c[1] - sa * L], p1 = m.half ? [m.c[0] + ca * m.len, m.c[1] + sa * m.len] : [m.c[0] + ca * L, m.c[1] + sa * L];
      return { segs: [[p0, p1]], vel: (x, z) => [-(z - m.c[1]) * m.sp, (x - m.c[0]) * m.sp], w: m.w };
    }
    // slide: Kasten pendelt zwischen a und b
    const ph = (Math.sin(t * m.sp * Math.PI) + 1) / 2, cx = m.a[0] + (m.b[0] - m.a[0]) * ph, cz = m.a[1] + (m.b[1] - m.a[1]) * ph;
    const dv = Math.cos(t * m.sp * Math.PI) * m.sp * Math.PI / 2, vx = (m.b[0] - m.a[0]) * dv, vz = (m.b[1] - m.a[1]) * dv;
    const hw = m.w / 2, hd = m.d / 2, P = [[cx - hw, cz - hd], [cx + hw, cz - hd], [cx + hw, cz + hd], [cx - hw, cz + hd]];
    return { segs: [[P[0], P[1]], [P[1], P[2]], [P[2], P[3]], [P[3], P[0]]], vel: () => [vx, vz], w: 0, box: { cx, cz, hw, hd } };
  }

  /* ---------- Ball ---------- */
  function newBall(h) { return { x: h.tee[0], z: h.tee[1], vx: 0, vz: 0, rest: [h.tee[0], h.tee[1]], moving: false, inCup: false, portalT: 0, events: [] }; }
  function shoot(b, ang, power) { const v = Math.max(.05, Math.min(1, power)); const s = MAXV * v * v * .85 + MAXV * v * .15; b.vx = Math.cos(ang) * s; b.vz = Math.sin(ang) * s; b.rest = [b.x, b.z]; b.moving = true; }
  function collideSeg(b, a, c, u, e, thick) {
    const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1e-9;
    let t = ((b.x - a[0]) * dx + (b.z - a[1]) * dz) / l2; t = Math.max(0, Math.min(1, t));
    const px = a[0] + t * dx, pz = a[1] + t * dz; let nx = b.x - px, nz = b.z - pz; const d = Math.hypot(nx, nz), rr = BALL + (thick || .04);
    if (d >= rr) return false;
    if (d < 1e-6) { nx = -dz; nz = dx; } const nl = Math.hypot(nx, nz); nx /= nl; nz /= nl;
    b.x = px + nx * rr; b.z = pz + nz * rr;
    const ux = u ? u[0] : 0, uz = u ? u[1] : 0, rvx = b.vx - ux, rvz = b.vz - uz, vn = rvx * nx + rvz * nz;
    if (vn < 0) { const tx = rvx - vn * nx, tz = rvz - vn * nz; b.vx = ux + tx * .96 - vn * e * nx; b.vz = uz + tz * .96 - vn * e * nz; }
    else if (u) { b.vx += ux * .1; b.vz += uz * .1; }
    return Math.abs(vn) > .4;
  }
  // ein Zeitschritt; t = Bahnzeit (für bewegliche Hindernisse)
  function step(h, b, t, dt) {
    if (!b.moving || b.inCup) return;
    const ice = inAny(h.ice, b.x, b.z), sand = inAny(h.sand, b.x, b.z);
    let dec = .95, lin = .2; if (sand) { dec = 4; lin = .9; } if (ice) { dec = .2; lin = .05; }
    for (const s of h.slopes || []) if (inPoly(s.p, b.x, b.z)) { b.vx += s.f[0] * dt; b.vz += s.f[1] * dt; }
    const sp = Math.hypot(b.vx, b.vz);
    if (sp > 0) { const ns = Math.max(0, sp - (dec + lin * sp) * dt); b.vx *= ns / sp; b.vz *= ns / sp; }
    b.x += b.vx * dt; b.z += b.vz * dt;
    let hit = false;
    for (const [a, c] of segsOf(h)) hit = collideSeg(b, a, c, null, .72) || hit;
    for (const m of h.movers || []) { const M = moverSegs(m, t); for (const [a, c] of M.segs) { const mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; hit = collideSeg(b, a, c, M.vel(b.x, b.z, mid), .8, (M.w || .04) / 2 + .02) || hit; } }
    for (const [cx, cz, r] of h.bumpers || []) {
      let nx = b.x - cx, nz = b.z - cz; const d = Math.hypot(nx, nz), rr = r + BALL;
      if (d < rr) { nx /= d || 1; nz /= d || 1; b.x = cx + nx * rr; b.z = cz + nz * rr; const vn = b.vx * nx + b.vz * nz; if (vn < 0) { b.vx -= 2 * vn * nx; b.vz -= 2 * vn * nz; b.vx += nx * .4; b.vz += nz * .4; b.events.push('bump'); } }
    }
    if (hit) b.events.push('wall');
    // Teleporter
    b.portalT = Math.max(0, b.portalT - dt);
    for (const pt of h.portals || []) if (!b.portalT && Math.hypot(b.x - pt.a[0], b.z - pt.a[1]) < .26) { b.x = pt.b[0]; b.z = pt.b[1]; b.portalT = .6; b.events.push('portal'); }
    // Wasser oder ins Aus
    if (inAny(h.water, b.x, b.z) && !inAny(h.island ? [h.island] : null, b.x, b.z) || !inAny(h.bounds, b.x, b.z)) {
      b.x = b.rest[0]; b.z = b.rest[1]; b.vx = b.vz = 0; b.moving = false; b.events.push('water'); return;
    }
    // Loch
    const dc = Math.hypot(b.x - h.cup[0], b.z - h.cup[1]), v = Math.hypot(b.vx, b.vz);
    if (dc < CUP) {
      if (v < 2.3) { b.inCup = true; b.moving = false; b.x = h.cup[0]; b.z = h.cup[1]; b.vx = b.vz = 0; b.events.push('cup'); return; }
      const pull = .55; b.vx += (h.cup[0] - b.x) / dc * pull; b.vz += (h.cup[1] - b.z) / dc * pull; b.vx *= .9; b.vz *= .9; b.events.push('lip');
    } else if (dc < CUP * 2.2 && v < 1.2) { b.vx += (h.cup[0] - b.x) * dt * 2.2; b.vz += (h.cup[1] - b.z) * dt * 2.2; } // leichter Sog am Rand
    if (Math.hypot(b.vx, b.vz) < .04 && !(h.slopes || []).some(s => inPoly(s.p, b.x, b.z))) { b.vx = b.vz = 0; b.moving = false; b.rest = [b.x, b.z]; }
    else if (Math.hypot(b.vx, b.vz) < .04) { b.slow = (b.slow || 0) + dt; if (b.slow > 1.5) { b.vx = b.vz = 0; b.moving = false; b.rest = [b.x, b.z]; b.slow = 0; } } else b.slow = 0;
  }
  // ganzen Schlag simulieren (Tests, Computer-Hilfe): gibt Endlage zurück
  function simulate(h, b0, ang, power, t0, maxT) {
    const b = Object.assign({}, b0, { events: [] }); b.rest = b0.rest.slice(); shoot(b, ang, power);
    let t = t0 || 0; const dt = 1 / 240;
    for (let k = 0; k < (maxT || 14) / dt && b.moving; k++) { step(h, b, t, dt); t += dt; }
    if (b.moving) { b.moving = false; b.vx = b.vz = 0; }
    return { b, t };
  }
  const totalPar = () => HOLES.reduce((s, h) => s + h.par, 0);
  // Punkte für die Rangliste (höher = besser): 100 + 10 je Schlag unter dem Gesamt-Par
  const points = strokes => Math.max(0, 100 + (totalPar() - strokes) * 10);
  const MAXSTROKES = 8;

  const FG = { HOLES, BALL, CUP, MAXV, MAXSTROKES, inPoly, inAny, segsOf, moverSegs, newBall, shoot, step, simulate, totalPar, points };
  if (typeof module !== 'undefined' && module.exports) module.exports = FG;
  root.FG = FG;
})(typeof self !== 'undefined' ? self : this);

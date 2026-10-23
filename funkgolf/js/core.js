/* Funk-Minigolf 3D – Bahnen und Ballphysik (ohne DOM; Browser und Node).
 * Ebene: x nach rechts, z nach vorn (Meter). Die 3D-Ansicht baut alles aus diesen Daten. */
(function (root) {
  'use strict';
  const BALL = 0.1, CUP = 0.17, MAXV = 7.2;
  const R = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  // Logos: ../anmacha-memory/logos/NN.png (01 RicoReWi, 02 YourTime-FM, 03 Rapradio 24, 04 Schlagerpop 24, 05 Chartradio 24, 06 Clubradio 24,
  // 07 AnMaCha 24, 08 RadioFloh!, 09 Rockradio 24, 10 Christmasradio 24, 11 Kultradio 24, 12 Zocker-FM, 13 Special-Radio, 14 AnMaChaCast)
  // Windmühle: Tunnel mit Tür (Breite door) quer zur Laufrichtung dir (+1/-1 in z), Vorderseite bei cz, Bahn von x0 bis x1
  const mill = (cx, cz, x0, x1, door, dir, sp) => { const d = door / 2, bz = cz + dir * .55;
    return { walls: [[[x0, cz], [cx - d, cz], [cx - d, bz], [x0, bz]], [[x1, cz], [cx + d, cz], [cx + d, bz], [x1, bz]]], mover: { k: 'mill', c: [cx, cz], door, dir, sp, n: 4, x0, x1 } }; };
  const M10 = mill(5.8, 5.4, 4.6, 7, .56, -1, 1.1);
  const HOLES = [
    { n: 'Willkommen im Radioportal', sub: 'Begrüßung · Tor in der Mitte', par: 2, logo: 1, theme: 'portal', bounds: [R(0, 0, 2.4, 10)], tee: [1.2, 1], cup: [1.2, 8.8],
      walls: [[[.72, 5.6], [1.68, 5.6]]], ridges: [{ p: R(0, 2.6, 2.4, 3.6), H: .07 }] },
    { n: 'YourTime-FM Strandbar', sub: 'Sender · Düne und Bunker', par: 3, logo: 2, theme: 'strand', bounds: [[[0, 0], [2.4, 0], [2.4, 8], [7, 8], [7, 10.4], [0, 10.4]]], tee: [1.2, 1], cup: [6.1, 9.2],
      ridges: [{ p: R(0, 3.6, 2.4, 5.2), H: .15 }], sand: [R(0, 8.6, 1.3, 10.4), R(3.5, 8, 4.6, 9.2), R(6.2, 10, 7, 10.4)], bumpers: [[2.4, 8, .22]] },
    { n: 'Rapradio 24 Blitz', sub: 'Sender · Zickzack, Vorsicht Verkehr!', par: 4, logo: 3, theme: 'street', bounds: [R(0, 0, 4, 14)], tee: [1, 1], cup: [2, 13],
      walls: [[[0, 4], [2.8, 4]], [[1.2, 8], [4, 8]], [[0, 11.2], [2.6, 11.2]]], movers: [{ k: 'slide', a: [.7, 6], b: [3.3, 6], w: 1, d: .45, sp: .45 }] },
    { n: 'Schlagerpop 24 Vulkan', sub: 'Sender · Discokugeln und Vulkan', par: 3, logo: 4, theme: 'party', bounds: [R(0, 0, 4, 12)], tee: [2, 1], cup: [2, 10.4],
      bumpers: [[1.2, 4.4, .35], [2.8, 5.9, .35], [1.5, 7.6, .3]], hills: [{ c: [2, 10.4], r: 1.05, H: .2 }] },
    { n: 'Chartradio 24 Looping', sub: 'Sender · Mit Schwung an die Spitze', par: 3, logo: 5, theme: 'charts', bounds: [R(0, 0, 3, 12)], tee: [1.5, 1], cup: [2.2, 11],
      walls: [[[0, 3], [1.2, 4.4], [1.2, 6.1], [0, 7]], [[3, 3], [1.8, 4.4], [1.8, 6.1], [3, 7]]], loops: [{ a: [1.5, 5], b: [1.5, 5.35], r: .36, w: .6 }],
      slopes: [{ p: R(0, 8.4, 3, 9.8), f: [0, -1.1], h: .3 }] },
    { n: 'Clubradio 24 Plattenteller', sub: 'Sender · Der Teller dreht sich mit!', par: 3, logo: 6, theme: 'club', bounds: [R(0, 0, 4, 12)], tee: [2, 1], cup: [2, 11],
      spins: [{ c: [2, 6], r: 1.75, w: .9 }], movers: [{ k: 'rot', c: [2, 6], len: 3.3, w: .14, sp: .9 }] },
    { n: 'AnMaCha 24 Studio', sub: 'ON AIR · Mischpult-Regler', par: 3, logo: 7, theme: 'studio', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      movers: [{ k: 'slide', a: [1.1, 4], b: [3.9, 4], w: 2, d: .3, sp: .5 }, { k: 'slide', a: [3.9, 6.5], b: [1.1, 6.5], w: 2, d: .3, sp: .65 }, { k: 'slide', a: [1.1, 9], b: [3.9, 9], w: 2, d: .3, sp: .42 }] },
    { n: 'Sendeplan', sub: 'Rubrik · Netz mit wechselnden Lücken', par: 3, logo: 0, theme: 'plan', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      walls: [[[0, 4.2], [3.5, 4.2]], [[1.5, 7.6], [5, 7.6]]], bumpers: [[2.4, 5.9, .17], [1.2, 9.6, .17], [3.8, 9.6, .17]] },
    { n: 'Voting', sub: 'Rubrik · Links oder rechts? Du entscheidest!', par: 3, logo: 0, theme: 'voting', bounds: [R(0, 0, 6, 12)], tee: [3, 1], cup: [3, 11],
      walls: [[[2.4, 3], [3.6, 3], [3.6, 9], [2.4, 9], [2.4, 3]]], sand: [R(0, 5, 2.4, 7)], slopes: [{ p: R(3.6, 4.5, 6, 7.5), f: [-.9, 0], h: .2 }], hills: [{ c: [3, 10], r: .65, H: .1 }] },
    { n: 'RadioFloh! Windmühle', sub: 'Sender · Ums Eck und durch die Mühle', par: 3, logo: 8, theme: 'kids', bounds: [[[0, 0], [2.4, 0], [2.4, 8], [4.6, 8], [4.6, 0], [7, 0], [7, 10.4], [0, 10.4]]], tee: [1.2, 1], cup: [5.8, 1.6],
      walls: M10.walls, movers: [M10.mover], bumpers: [[3.5, 9.4, .3]] },
    { n: 'Rockradio 24 Gitarrenhals', sub: 'Sender · Über die Bünde, nicht ins Wasser', par: 3, logo: 9, theme: 'rock', bounds: [R(0, 0, 4, 14)], tee: [2, 1], cup: [2, 13],
      water: [R(0, 4, 1.35, 10), R(2.65, 4, 4, 10)], ridges: [{ p: R(1.35, 5.8, 2.65, 6.6), H: .08 }, { p: R(1.35, 7.6, 2.65, 8.4), H: .08 }] },
    { n: 'Christmasradio 24 Winterwald', sub: 'Sender · Glatteis und Schneehügel', par: 3, logo: 10, theme: 'winter', bounds: [R(0, 0, 4, 13)], tee: [2, 1], cup: [2.5, 12],
      ice: [R(0, 3, 4, 10)], bumpers: [[1, 5, .35], [3, 7, .35], [1.6, 8.8, .3]], hills: [{ c: [1.7, 11], r: .7, H: .12 }] },
    { n: 'Kultradio 24 Kassette', sub: 'Sender · Zwei Spulen ziehen mit', par: 3, logo: 11, theme: 'retro', bounds: [R(0, 0, 5, 12)], tee: [2.5, 1], cup: [2.5, 11],
      spins: [{ c: [1.4, 6], r: 1.1, w: 1.3 }, { c: [3.6, 6], r: 1.1, w: -1.3 }],
      movers: [{ k: 'rot', c: [1.4, 6], len: 2.1, w: .12, sp: 1.3 }, { k: 'rot', c: [3.6, 6], len: 2.1, w: .12, sp: -1.3 }] },
    { n: 'Zocker-FM Arcade', sub: 'Sender · Treff das Portal, dann Flipper', par: 3, logo: 12, theme: 'arcade', bounds: [R(0, 0, 3, 6), R(0, 8, 3, 14)], tee: [1.5, 1], cup: [1.5, 13.2],
      walls: [[[1.2, 3.4], [2.4, 3.4]]], portals: [{ a: [.55, 5.3], b: [1.5, 8.8] }], bumpers: [[.9, 10.9, .25], [2.1, 10.9, .25], [1.5, 12, .22]] },
    { n: 'Special-Radio Insel', sub: 'Sender · Über den Steg auf den Inselhügel', par: 3, logo: 13, theme: 'insel', bounds: [R(0, 0, 6, 14)], tee: [3, 1], cup: [3, 9],
      water: [R(0, 5, 2.6, 13), R(3.4, 5, 6, 13), R(2.6, 10.6, 3.4, 13)], island: R(2, 7.4, 4, 10.6), hills: [{ c: [3, 9], r: .9, H: .14 }] },
    { n: 'AnMaChaCast Podcast', sub: 'Podcast · Doppelwelle und Mikrofon', par: 3, logo: 14, theme: 'podcast', bounds: [R(0, 0, 3.5, 14)], tee: [1.75, 1], cup: [1.75, 13],
      ridges: [{ p: R(0, 3, 3.5, 4.4), H: .13 }, { p: R(0, 5, 3.5, 6.4), H: .13 }], slopes: [{ p: R(0, 8, 3.5, 10), f: [.9, 0], h: .15 }], bumpers: [[1.75, 11.4, .3]] },
    { n: 'Sleep-Timer', sub: 'Funktion · Warte auf den Mond', par: 3, logo: 0, theme: 'nacht', bounds: [R(0, 0, 4, 14)], tee: [2, 1], cup: [2, 13],
      walls: [[[0, 7], [1.3, 7]], [[2.7, 7], [4, 7]]], movers: [{ k: 'rot', c: [2, 7], len: 1.25, w: .14, sp: .9, half: true }],
      slopes: [{ p: R(0, 8.6, 4, 10.4), f: [.9, 0], h: .15 }], bumpers: [[1.1, 11.6, .2], [2.9, 11.9, .2]] },
    { n: 'Funkturm-Finale', sub: 'Empfang · Schranke, Hang und Gipfel', par: 4, logo: 1, theme: 'turm', bounds: [[[0, 0], [3, 0], [3, 10], [8, 10], [8, 18], [5, 18], [5, 13], [0, 13]]], tee: [1.5, 1], cup: [6.5, 16.8],
      movers: [{ k: 'slide', a: [.65, 5], b: [2.35, 5], w: 1.3, d: .3, sp: .55 }], bumpers: [[1.5, 11.5, .3], [4, 11.5, .3]],
      slopes: [{ p: R(5, 13.6, 8, 15.2), f: [0, -.8], h: .25 }], hills: [{ c: [6.5, 16.8], r: .85, H: .18 }] }
  ];

  /* ---------- Geometrie ---------- */
  const GR = 7; // Rollbeschleunigung (5/7 g)
  // Geländehöhe (Hügel, Wellen) für Physik und Darstellung
  function heightAt(h, x, z) {
    let y = 0;
    for (const k of h.hills || []) { const d = Math.hypot(x - k.c[0], z - k.c[1]); if (d < k.r) y += k.H * (1 + Math.cos(Math.PI * d / k.r)) / 2; }
    for (const r of h.ridges || []) { const [[x0, z0], , [x1, z1]] = r.p; if (x >= x0 && x <= x1 && z >= z0 && z <= z1) y += r.H * (1 - Math.cos(2 * Math.PI * (z - z0) / (z1 - z0))) / 2; }
    return y;
  }
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
    if (m.k === 'mill') { // Flügel vor der Tür: zu, wenn ein Flügel nach unten zeigt
      const a = m.sp * t, step = Math.PI * 2 / m.n; let down = false;
      for (let k = 0; k < m.n; k++) { let d = (a + k * step + Math.PI / 2) % (Math.PI * 2); if (d < 0) d += Math.PI * 2; if (d < .32 || d > Math.PI * 2 - .32) down = true; }
      const d = m.door / 2 + .04;
      return { segs: down ? [[[m.c[0] - d, m.c[1]], [m.c[0] + d, m.c[1]]]] : [], vel: () => [0, 0], w: .1, angle: a };
    }
    // slide: Kasten pendelt zwischen a und b
    const ph = (Math.sin(t * m.sp * Math.PI) + 1) / 2, cx = m.a[0] + (m.b[0] - m.a[0]) * ph, cz = m.a[1] + (m.b[1] - m.a[1]) * ph;
    const dv = Math.cos(t * m.sp * Math.PI) * m.sp * Math.PI / 2, vx = (m.b[0] - m.a[0]) * dv, vz = (m.b[1] - m.a[1]) * dv;
    const hw = m.w / 2, hd = m.d / 2, P = [[cx - hw, cz - hd], [cx + hw, cz - hd], [cx + hw, cz + hd], [cx - hw, cz + hd]];
    return { segs: [[P[0], P[1]], [P[1], P[2]], [P[2], P[3]], [P[3], P[0]]], vel: () => [vx, vz], w: 0, box: { cx, cz, hw, hd } };
  }

  /* ---------- Ball ---------- */
  function newBall(h) { return { x: h.tee[0], z: h.tee[1], y: 0, vx: 0, vz: 0, rest: [h.tee[0], h.tee[1]], moving: false, inCup: false, portalT: 0, age: 0, lp: null, events: [] }; }
  function shoot(b, ang, power) { const v = Math.max(.05, Math.min(1, power)); const s = MAXV * v * v * .85 + MAXV * v * .15; b.vx = Math.cos(ang) * s; b.vz = Math.sin(ang) * s; b.rest = [b.x, b.z]; b.moving = true; b.age = 0; b.lp = null; }
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
    b.age += dt;
    if (b.lp) { loopStep(b, dt); return; }
    const px = b.x, pz = b.z;
    const ice = inAny(h.ice, b.x, b.z), sand = inAny(h.sand, b.x, b.z);
    let dec = .95, lin = .2; if (sand) { dec = 4; lin = .9; } if (ice) { dec = .2; lin = .05; }
    for (const s of h.slopes || []) if (inPoly(s.p, b.x, b.z)) { b.vx += s.f[0] * dt; b.vz += s.f[1] * dt; }
    if (h.hills || h.ridges) { const e = .02, gx = (heightAt(h, b.x + e, b.z) - heightAt(h, b.x - e, b.z)) / (2 * e), gz = (heightAt(h, b.x, b.z + e) - heightAt(h, b.x, b.z - e)) / (2 * e); b.vx -= GR * gx * dt; b.vz -= GR * gz * dt; }
    if (b.age < 9) for (const s of h.spins || []) { const dx = b.x - s.c[0], dz = b.z - s.c[1]; if (dx * dx + dz * dz < s.r * s.r) { b.vx += (-dz * s.w - b.vx) * 1.4 * dt; b.vz += (dx * s.w - b.vz) * 1.4 * dt; } }
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
    // Looping: Einfahrt quer überfahren
    for (const L of h.loops || []) {
      const dx = L.b[0] - L.a[0], dz = L.b[1] - L.a[1], ln = Math.hypot(dx, dz), ux = dx / ln, uz = dz / ln;
      const s0 = (px - L.a[0]) * ux + (pz - L.a[1]) * uz, s1 = (b.x - L.a[0]) * ux + (b.z - L.a[1]) * uz, lat = Math.abs((b.x - L.a[0]) * uz - (b.z - L.a[1]) * ux), v = b.vx * ux + b.vz * uz;
      if (s0 < 0 && s1 >= 0 && lat < L.w / 2 && v > .2) { const ok = v * v >= 5 * GR * L.r * 1.08; b.lp = { L, ux, uz, ln, v0: v, th: 0, dir: 1, ok, max: ok ? 0 : Math.min(Math.PI * .92, Math.acos(Math.max(-1, 1 - v * v / (2 * GR * L.r)))) }; b.x = L.a[0]; b.z = L.a[1]; b.events.push('loop'); return; }
    }
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
    } else if (dc < CUP * 1.7 && v < 1.2) { b.vx += (h.cup[0] - b.x) * dt * 2.2; b.vz += (h.cup[1] - b.z) * dt * 2.2; } // leichter Sog am Rand
    const tilted = (h.slopes || []).some(s => inPoly(s.p, b.x, b.z)) || ((h.hills || h.ridges) && Math.abs(heightAt(h, b.x + .03, b.z) - heightAt(h, b.x - .03, b.z)) + Math.abs(heightAt(h, b.x, b.z + .03) - heightAt(h, b.x, b.z - .03)) > .004);
    if (b.age > 25) { b.vx = b.vz = 0; b.moving = false; b.rest = [b.x, b.z]; return; }
    if (Math.hypot(b.vx, b.vz) < .04 && !tilted) { b.vx = b.vz = 0; b.moving = false; b.rest = [b.x, b.z]; }
    else if (Math.hypot(b.vx, b.vz) < .04) { b.slow = (b.slow || 0) + dt; if (b.slow > 1.5) { b.vx = b.vz = 0; b.moving = false; b.rest = [b.x, b.z]; b.slow = 0; } } else b.slow = 0;
  }
  function loopStep(b, dt) {
    const P = b.lp, L = P.L, v = Math.sqrt(Math.max(.25, P.v0 * P.v0 - 2 * GR * L.r * (1 - Math.cos(P.th))));
    P.th += P.dir * v / L.r * dt;
    if (P.ok) {
      if (P.th >= Math.PI * 2) { b.lp = null; b.y = 0; b.x = L.b[0] + P.ux * .02; b.z = L.b[1] + P.uz * .02; const o = P.v0 * .9; b.vx = P.ux * o; b.vz = P.uz * o; return; }
      const f = P.th / (Math.PI * 2), s = f * P.ln + L.r * Math.sin(P.th); b.x = L.a[0] + P.ux * s; b.z = L.a[1] + P.uz * s;
    } else {
      if (P.dir > 0 && P.th >= P.max) P.dir = -1;
      if (P.th <= 0) { b.lp = null; b.y = 0; b.x = L.a[0] - P.ux * .03; b.z = L.a[1] - P.uz * .03; const o = -P.v0 * .7; b.vx = P.ux * o; b.vz = P.uz * o; b.events.push('loopfail'); return; }
      const s = L.r * Math.sin(P.th) * .5; b.x = L.a[0] + P.ux * s; b.z = L.a[1] + P.uz * s;
    }
    b.y = L.r * (1 - Math.cos(P.th));
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

  const FG = { HOLES, BALL, CUP, MAXV, MAXSTROKES, heightAt, inPoly, inAny, segsOf, moverSegs, newBall, shoot, step, simulate, totalPar, points };
  if (typeof module !== 'undefined' && module.exports) module.exports = FG;
  root.FG = FG;
})(typeof self !== 'undefined' ? self : this);

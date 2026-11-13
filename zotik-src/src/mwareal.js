// Areale der Märchenwelten (wie in Kingdom Hearts): offene Plätze und Gassen, dazwischen dichte Waldwände;
// Höhenebenen (Plateaus mit Rampe/Treppe, Brücken, Schluchten) und Requisiten je Ort.
// Daten je Welt in mwdata.js unter `areal`:
//   tiers: [[x, z, r, y, fx, fz]]  Plateau (Oberkante y absolut) mit Rampe hinunter zum Fußpunkt (fx, fz)
//   cuts:  [[x0, z0, x1, z1, breite, tiefe]]  Schlucht (Absturz = zurück an den Rand)
//   bridges: [[x0, z0, x1, z1, y]]  Brücke (begehbar über PLAT), y = Oberkante
//   lanes: [[x0, z0, x1, z1, hw?]]  zusätzliche Gasse
//   piers: [[x0, z0, x1, z1, y]]  Steg vom Ufer (x0, z0) übers Wasser, endet offen bei (x1, z1)
//   wall: DECOR-Arten der Waldwand, wz: Wizp-Bäume der vordersten Reihe [[name, höhe]], rock: Wizp-Felsen an Klippen
//   props: { zonenId: [[datei, name, größe (>0 Höhe, <0 Maßstab), anzahl]] }
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const segD = (x, z, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return [Math.hypot(x - ax - dx * t, z - az - dz * t), t]; };

/* Maske: Abstand außerhalb der offenen Fläche (0 = begehbar), als Raster vorberechnet und bilinear gelesen */
export function arealMask(w, roads, PATHX, CX, CZ, R) {
  const A = w.areal, C0 = [], S0 = [];   // Kreise [x, z, r] und Strecken [ax, az, bx, bz, hw]
  for (const q of w.zones) C0.push([q[3], q[4], q[5] + 3]);
  for (const [ax, az, bx, bz] of roads) S0.push([ax, az, bx, bz, 4.5]);
  { const [pz0, pz1, phw] = A.path || [16, -88, 6]; for (let z = pz0; z > pz1; z -= 6) S0.push([PATHX(z), z, PATHX(z - 6), z - 6, phw]); }   // Hauptweg (Kapitelwelten: länger und breiter)
  C0.push([0, 10, 14], [-7, 15, 7]);
  for (const [x, z, r] of w.pads) C0.push([x, z, r + 2]);
  for (const [x, z, r] of (w.pools || [])) C0.push([x, z, r + 3]);
  if (A.openRects) for (const [x0, x1, z0, z1] of (w.rects || [])) { const zc = (z0 + z1) / 2, hw = (z1 - z0) / 2; S0.push([x0, zc, x1, zc, hw]); }   // Platz entlang eines Bauwerks (z. B. Mauer)
  if (w.river) { const P = w.river.pts; for (let i = 0; i < P.length - 1; i++) S0.push([P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], w.river.w * .5 + 3]); }
  for (const q of (A.cuts || [])) S0.push([q[0], q[1], q[2], q[3], q[4] * .5]);
  for (const q of (A.lanes || [])) S0.push([q[0], q[1], q[2], q[3], q[4] || 2.6]);   // feste Gassen (z. B. Teich ans Wegenetz)
  const C1 = [], S1 = [];   // Plateaus und Rampen: offen, aber keine Ziele für Gassen (sonst endet eine Gasse an der Klippe)
  const near = (x, z, C, S) => { let e = 1e9; for (const [cx, cz, r] of C) e = Math.min(e, Math.hypot(x - cx, z - cz) - r); for (const s of S) e = Math.min(e, segD(x, z, s[0], s[1], s[2], s[3])[0] - s[4]); return e; };
  const base0 = (x, z) => near(x, z, C0, S0), base = (x, z) => Math.min(base0(x, z), near(x, z, C1, S1));
  // Einzelne Dinge in der Wildnis (Truhen, Krüge, Steine, Figuren, Auftragsorte) bekommen eine Gasse zum nächsten offenen Ort
  const link = (x, z) => { let bx = x, bz = z, bd = 1e9;
    for (let a = 0; a < 32; a++) for (let d = 2; d < 60; d += 2) { const px = x + Math.cos(a * .196) * d, pz = z + Math.sin(a * .196) * d; if (base0(px, pz) < -1.5) { if (d < bd) { bd = d; bx = px; bz = pz; } break; } }
    if (bd < 1e9) S0.push([x, z, bx, bz, 2.6]); };
  if (A.maze) { const [mx, mz, n, c] = A.maze, hs = n * c / 2; link(mx - hs - 1.5, mz); C0.push([mx - hs - 1.5, mz, 2.6]); for (let k = 0; k < n; k++) { const zk = mz - hs + (k + .5) * c; S0.push([mx - hs + c * .5, zk, mx + hs - c * .5, zk, c * .72]); } }   // Irrgarten: quadratische Fläche, Eingang West mit Gasse
  // Plateaus: Rampenfuß mit Gasse ans Wegenetz, dann Plateau und Rampe selbst offen
  for (const q of (A.tiers || [])) { if (base(q[4], q[5]) > -2) link(q[4], q[5]); C0.push([q[4], q[5], 3]); }
  for (const q of (A.tiers || [])) { C1.push([q[0], q[1], q[2] + .2]); S1.push([q[0], q[1], q[4], q[5], 2.6]); }
  const pts = []; for (const q of [...(w.chests || []), ...(w.pots || []), ...(w.lore || []), ...(w.portals || []), ...(A.extra || [])]) pts.push([q[0], q[1], 3.2]);
  for (const d of w.npcs) pts.push([d.x, d.z, 3.5]); for (const m of w.ms) { for (const q of (m.pts || [])) pts.push([q[0], q[1], 3.5]); if (m.at) pts.push([m.at[0], m.at[1], Math.max(4, m.r || 4)]); }
  pts.sort((a, b) => base(a[0], a[1]) - base(b[0], b[1]));
  for (const [x, z, r] of pts) { if (base(x, z) < -r) continue; link(x, z); C0.push([x, z, r]); }
  // Raster
  const ST = 1.25, X0 = CX - R - 12, Z0 = CZ - R - 12, N = Math.ceil((2 * R + 24) / ST) + 1, E = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) E[j * N + i] = Math.max(0, base(X0 + i * ST, Z0 + j * ST));
  const at = (x, z) => { const fx = Math.max(0, Math.min(N - 1.001, (x - X0) / ST)), fz = Math.max(0, Math.min(N - 1.001, (z - Z0) / ST)), i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = j * N + i;
    return (E[k] * (1 - u) + E[k + 1] * u) * (1 - v) + (E[k + N] * (1 - u) + E[k + N + 1] * u) * v; };
  return { E: at, N, ST, X0, Z0 };
}

/* Höhe: Waldwand (Rücken), Plateaus mit Rampe, Schluchten. Gibt die neue Höhe zurück. */
export function arealHeight(w, M) {
  const A = w.areal, T = A.tiers || [], K = A.cuts || [], BR = A.bridges || [];
  return (x, z, q) => {
    let ff = 1; for (const [cx, cz, r, , fx, fz] of T) { const d = Math.hypot(x - cx, z - cz); if (d > r + 30) continue; ff = Math.min(ff, sm(r + .5, r + 8, d), sm(2.6, 7, segD(x, z, cx, cz, fx, fz)[0])); }
    q *= ff;   // Gelände rund um Plateau und Rampe eben, damit die Rampe gleichmäßig steigt
    let e = M.E(x, z);
    if (e > 0 && !A.city) { let u = 1; for (const b of BR) u = Math.min(u, sm(2.5, 4.5, segD(x, z, b[0], b[1], b[2], b[3])[0])); q += (6.5 * sm(.8, 4.5, e) + .3 * Math.max(0, e - 4.5)) * u - (1 - u) * 1.5; }
    for (const [cx, cz, r, y, fx, fz] of T) { const d = Math.hypot(x - cx, z - cz); if (d > r + 30) continue;
      let k = 1 - sm(r, r + 1.3, d); const L = Math.hypot(fx - cx, fz - cz), [sd, t] = segD(x, z, cx, cz, fx, fz);
      if (sd < 2.4 && L > r) { const s = t * L; if (s > r - 1) k = Math.max(k, (1 - Math.max(0, Math.min(1, (s - r + 1) / (L - r + 1)))) * (1 - sm(1.8, 2.5, sd))); }
      if (k > 0) q += (y - q) * k; }
    for (const [ax, az, bx, bz, wd, dp] of K) { const [d, t] = segD(x, z, ax, az, bx, bz); const k = (1 - sm(wd * .5 - 1.4, wd * .5, d)) * sm(0, .12, t) * sm(1, .88, t); if (k > 0) q -= dp * k; }
    return q;
  };
}
/* Schlucht- und Plateaukanten-Sperre: tiefe Schlucht = Absturz */
export function arealCutDepth(w, x, z) { let m = 0; for (const [ax, az, bx, bz, wd] of (w.areal.cuts || [])) { const [d, t] = segD(x, z, ax, az, bx, bz); if (d < wd * .5 - .6 && t > .1 && t < .9) m = 1; } return m; }

/* Ausstattung: Waldwand, Felsen an Klippen, Treppen, Brücken, Requisiten je Ort */
export function arealDress({ C, w, b, g, h, M, R2, blk, busy, roadD, wallList, TOUCH, mk, G, MAT }) {
  const A = w.areal, KK = C.KK, wz = [], kk = [], kb = [];
  // Waldwand: dichte Bäume auf dem Rücken, vorderste Reihe aus Wizp-Bäumen (begrenzte Zahl fürs Handy)
  const step = TOUCH ? 3.6 : 3, maxWz = TOUCH ? 90 : 220; let nwz = 0;
  for (let j = 0; j < M.N; j += step / M.ST) for (let i = 0; i < M.N; i += step / M.ST) {
    const x = M.X0 + i * M.ST + (R2() - .5) * step * .8, z = M.Z0 + j * M.ST + (R2() - .5) * step * .8, e = M.E(x, z);
    if (A.city || e < (A.hedge ? 3.4 : 1.4) || e > (A.wallMax || 12) || Math.hypot(x, z - 12) < 16) continue; if ((A.bridges || []).some(q => segD(x, z, q[0], q[1], q[2], q[3])[0] < 4)) continue;
    if (e < 4.6 && A.wz && nwz < maxWz && R2() < .75) { const [k, hh] = A.wz[R2() * A.wz.length | 0]; wz.push({ k, x, y: h(x, z) - .1, z, ry: R2() * 6.28, h: hh * (.8 + R2() * .4) }); nwz++; continue; }
    const kind = A.wall[R2() * A.wall.length | 0]; wallList.push([x, z, kind, 1 + R2() * .7, R2() * 6.3, 1]); }
  // Stadt: statt Waldwand geschlossene Häuserzeilen, Giebel zur Gasse, dahinter Dächer als Silhouette
  if (A.city) { const T = C.T, acc = [], tx = (t, c, o) => C.TX.tri(t, c, o || { s: .5, gain: 1.5 }), win = MAT(0xffd890, { e: 0xffb050, ei: 1.3 });
    for (let j = 0; j < M.N; j += 1.6) for (let i = 0; i < M.N; i += 1.6) { const x = M.X0 + i * M.ST, z = M.Z0 + j * M.ST, e = M.E(x, z);
      if (!((e > 3 && e < 4.6) || (e > 9.5 && e < 11.5)) || Math.hypot(x, z - 12) < 16 || acc.some(q => Math.hypot(q[0] - x, q[1] - z) < 6.3)) continue; acc.push([x, z]);
      const gx = M.E(x + 1, z) - M.E(x - 1, z), gz = M.E(x, z + 1) - M.E(x, z - 1), ry = Math.atan2(-gx, -gz), k = acc.length, W = 7.4, D = 5.6, H = 5 + (k * 7 % 4), y = h(x, z) - .2;
      const wc = A.city.walls[k % A.city.walls.length], rc = A.city.roofs[(k >> 1) % A.city.roofs.length], hg = new T.Group(); hg.position.set(x, y, z); hg.rotation.y = ry; g.add(hg);
      hg.add(mk(G.box, A.city.flat ? tx('plaster', wc, { s: .5, gain: 2.2, n: .45, e: 0x6a4a2a, ei: 1 }) : tx('plaster', wc, { s: .45, gain: 1.7, n: .6, e: 0x3a3026, ei: 1 }), 0, H / 2, 0, W, H, D));
      if (A.city.beam) for (const bx of [-W / 2 + .15, 0, W / 2 - .15]) hg.add(mk(G.box, tx('wood', A.city.beam), bx, H / 2, D / 2 + .03, .24, H, .08, false));
      if (A.city.flat) {   // Lehmhaus: Flachdach mit Brüstung, manche mit Kuppel
        const pm = tx('plaster', wc, { s: .5, gain: 2.2, n: .45, e: 0x6a4a2a, ei: 1 }); for (const [px, pz, lx, lz] of [[0, D / 2, W + .3, .3], [0, -D / 2, W + .3, .3], [W / 2, 0, .3, D], [-W / 2, 0, .3, D]]) hg.add(mk(G.box, pm, px, H + .3, pz, lx, .6, lz, false));
        if (k % 3 === 0) { hg.add(mk(G.cyl, pm, 0, H + .35, 0, 1.9, .7, 1.9, false)); hg.add(mk(G.sph, MAT(rc, { m: .5, r: .35 }), 0, H + .7, 0, 1.9, 1.7, 1.9, false)); }
        else if (k % 3 === 1) for (const sx of [-1.6, 1.6]) hg.add(mk(G.box, MAT(rc, { r: .9 }), sx, H + 1.1, 0, 1.4, .06, 1.6, false));   // Sonnentuch
      } else {
      for (const s of [-1, 1]) { const r = mk(G.box, tx(A.city.slate ? 'slate' : 'roof', rc, { s: .6 }), 0, H + D * .27, s * D * .26, W + .6, .28, D * .62); r.rotation.x = s * .72; hg.add(r); }
      hg.add(mk(G.box, tx('plaster', wc, { s: .45, gain: 1.7, n: .6, e: 0x3a3026, ei: 1 }), 0, H + D * .14, 0, W * .99, D * .3, D * .02, false)); }
      for (const wy of [H * .38, H * .72]) for (const wx of [-W * .28, W * .28]) if ((k + wx + wy | 0) % 3) hg.add(mk(G.box, win, wx, wy, D / 2 + .04, .8, .9, .05, false));
      hg.add(mk(G.box, MAT(0x3a2a1e), 0, .9, D / 2 + .04, 1.2, 1.8, .05, false)); }
  }
  // Hecken: geschnittene Heckenwand an jeder Gasse (Instanzen), Irrgarten mit festen Heckenwänden
  if (A.hedge) { const T = C.T, acc = [], hm = C.TX.tri('grass', A.hedge, { s: .6, gain: 2 });
    for (let j = 0; j < M.N; j += 1.4) for (let i = 0; i < M.N; i += 1.4) { const x = M.X0 + i * M.ST, z = M.Z0 + j * M.ST, e = M.E(x, z);
      if (e < 1.5 || e > 3 || Math.hypot(x, z - 12) < 16 || acc.some(q => Math.abs(q[0] - x) < 2.2 && Math.abs(q[1] - z) < 2.2 && Math.hypot(q[0] - x, q[1] - z) < 2.2)) continue;
      if ((A.bridges || []).some(q => segD(x, z, q[0], q[1], q[2], q[3])[0] < 4)) continue; acc.push([x, z]); }
    const im = new T.InstancedMesh(G.box, hm, acc.length), o = new T.Object3D();
    acc.forEach(([x, z], k) => { const gx = M.E(x + 1, z) - M.E(x - 1, z), gz = M.E(x, z + 1) - M.E(x, z - 1), H = 2.4 + (k * 7 % 5) * .12;
      o.position.set(x, h(x, z) - .3 + H / 2, z); o.rotation.set(0, Math.atan2(-gx, -gz), 0); o.scale.set(3.4, H, 2.6); o.updateMatrix(); im.setMatrixAt(k, o.matrix); });
    im.receiveShadow = true; g.add(im); }
  if (A.maze) { const [mx, mz, n, c] = A.maze, hs = n * c / 2, x0 = mx - hs, z0 = mz - hs, hd = A.hedge || 0x2a6a2a, seen = new Uint8Array(n * n), H = [], V = [];
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let j = 0; j <= n; j++) for (let i = 0; i < n; i++) H.push(1); for (let j = 0; j < n; j++) for (let i = 0; i <= n; i++) V.push(1);   // H[j*n+i]: Wand nördlich Zelle (i,j); V[j*(n+1)+i]: Wand westlich
    const st = [[0, n >> 1]]; seen[(n >> 1) * n] = 1;
    while (st.length) { const [i, j] = st[st.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b2]) => [i + a, j + b2, a, b2]).filter(([a, b2]) => a >= 0 && b2 >= 0 && a < n && b2 < n && !seen[b2 * n + a]);
      if (!nb.length) { st.pop(); continue; } const [a, b2, da, db] = nb[rnd() * nb.length | 0]; seen[b2 * n + a] = 1; st.push([a, b2]);
      if (da) V[j * (n + 1) + Math.max(i, a)] = 0; else H[Math.max(j, b2) * n + i] = 0; }
    V[(n >> 1) * (n + 1)] = 0;   // Eingang West
    const wall = (x, z, lx, lz) => b.box(x, h(x, z) - .3, z, lx, 2.9, lz, hd, { solid: 1, tex: 'grass', to: { s: .6 } });
    for (let j = 0; j <= n; j++) for (let i = 0; i < n; i++) if (H[j * n + i]) wall(x0 + (i + .5) * c, z0 + j * c, c + 1, 1);
    for (let j = 0; j < n; j++) for (let i = 0; i <= n; i++) if (V[j * (n + 1) + i]) wall(x0 + i * c, z0 + (j + .5) * c, 1, c + 1);
    for (const [x, z] of [[x0 - .9, mz - c * .5 - .2], [x0 - .9, mz + c * .5 + .2]]) lampAt(b, x, z, h(x, z)); }
  // Plateaus: Felsen an der Kante, Treppe auf der Rampe, Laternen oben und unten
  const stone = C.TX.tri('stone', A.step || 0x8a847a, { s: .6, gain: 1.5 });
  for (const [cx, cz, r, y, fx, fz] of (A.tiers || [])) { const ra = Math.atan2(fx - cx, fz - cz), L = Math.hypot(fx - cx, fz - cz);
    for (let a = 0; a < 6.283; a += 3.2 / (r + 1)) { let da = Math.abs(((a - ra) % 6.283 + 9.425) % 6.283 - 3.1416); if (da < .55) continue; const x = cx + Math.sin(a) * (r + 1.1), z = cz + Math.cos(a) * (r + 1.1);
      wz.push({ k: (A.rock || ['rock_big_B_gray_1'])[(a * 7 | 0) % (A.rock || [1]).length], x, y: h(x, z) - .4, z, ry: a * 3.1, h: Math.max(1.6, y - h(x, z) + .6) * (.85 + R2() * .3) }); }
    const ux = Math.sin(ra), uz = Math.cos(ra);
    for (let s = r - .6; s < L - .4; s += .62) { const x = cx + ux * s, z = cz + uz * s, yy = h(x, z); const m = mk(G.box, stone, x, yy - .12, z, 4.4, .3, .66); m.rotation.y = ra; g.add(m); }
    for (const sd of [-1, 1]) { const px = -uz * sd * 2.5, pz = ux * sd * 2.5; b.box(cx + ux * (r - .6) + px, y, cz + uz * (r - .6) + pz, .3, 1.1, .3, 0x6a5a4a, { tex: 'wood' }); b.box(fx - ux * .4 + px, h(fx, fz), fz - uz * .4 + pz, .3, 1.1, .3, 0x6a5a4a, { tex: 'wood' }); }
    lampAt(b, cx + ux * (r - 1) - uz * 2.8, cz + uz * (r - 1) + ux * 2.8, y); lampAt(b, fx + uz * 2.8, fz - ux * 2.8, h(fx, fz)); }
  // Brücken: Planken als Plattformen, Geländer mit Pfosten und Seilen
  const plank = C.TX.tri('wood', 0x7a5a3a, { s: .8, gain: 1.4 }), rope = MAT(0xc8b080);
  for (const [ax, az, bx, bz, y, wk] of (A.bridges || [])) { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    if (wk) { for (let s = 0; s <= L; s += 1.1) C.PLAT.push({ x: ax + ux * s, z: az + uz * s, hx: 1.25, hz: 1.25, top: y, th: .5 }); continue; }   // Wehrgang: begehbare Mauerkrone, ohne Planken
    for (let s = 0; s <= L; s += 1.1) { const x = ax + ux * s, z = az + uz * s; C.PLAT.push({ x, z, hx: 1.25, hz: 1.25, top: y, th: .5 }); const m = mk(G.box, plank, x, y - .1, z, 2.6, .2, 1); m.rotation.y = ry; g.add(m); }
    for (let s = 0; s <= L + .01; s += L / Math.max(2, Math.round(L / 2.2))) for (const sd of [-1, 1]) { const x = ax + ux * s - uz * sd * 1.35, z = az + uz * s + ux * sd * 1.35; g.add(mk(G.cyl0, MAT(0x5a4030), x, y + .5, z, .08, 1.2, .08)); }
    for (const sd of [-1, 1]) for (const yy of [.6, 1.05]) { const m = mk(G.box, rope, (ax + bx) / 2 - uz * sd * 1.35, y + yy, (az + bz) / 2 + ux * sd * 1.35, .05, .05, L, false); m.rotation.y = ry; g.add(m); } }
  // Stege [x0, z0, x1, z1, y]: vom Ufer ins Wasser, breite Planken auf Pfählen, enden über dem Wasser
  for (const [ax, az, bx, bz, y] of (A.piers || [])) { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let s = 0; s <= L; s += 1.1) { const x = ax + ux * s, z = az + uz * s; C.PLAT.push({ x, z, hx: 1.4, hz: 1.4, top: y, th: .5 }); const m = mk(G.box, plank, x, y - .1, z, 3, .2, 1); m.rotation.y = ry; g.add(m); }
    for (let s = 0; s <= L + .01; s += L / Math.max(2, Math.round(L / 2.6))) for (const sd of [-1, 1]) { const x = ax + ux * s - uz * sd * 1.5, z = az + uz * s + ux * sd * 1.5; g.add(mk(G.cyl0, MAT(0x4a3020), x, y - 1.2 + (s > L - .5 ? .25 : 0), z, .14, 2.6 + (s > L - .5 ? .5 : 0), .14)); } }
  // Requisiten je Ort (Instanzen, große Teile mit Kollision)
  const placed = [];
  for (const q of w.zones) { const L0 = (A.props || {})[q[0]]; if (!L0) continue; const [, , , zx, zz, zr] = q;
    for (const [f, k, sz, n] of L0) { const rad = sz > 0 ? Math.min(1.4, sz * .3) : Math.min(5, -sz * .55); let c = 0;
      for (let t = 0; t < 80 && c < n; t++) { const a = R2() * 6.283, rr = zr * (.3 + R2() * .65), x = zx + Math.sin(a) * rr, z = zz + Math.cos(a) * rr;
        if (blk(x, z) || !C.colFree(x, z, rad + .3) || C.inHouse(x, z, rad + .6) || roadD(x, z) < rad + 2.4 || busy.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br * .7 + rad)) continue;
        if (placed.some(p => Math.hypot(p[0] - x, p[1] - z) < p[2] + rad + 1)) continue; if (Math.abs(h(x + rad, z) - h(x - rad, z)) > 1 || Math.abs(h(x, z + rad) - h(x, z - rad)) > 1) continue;
        const it = { k, x, y: h(x, z) - .03, z, ry: Math.atan2(zx - x, zz - z) + (R2() - .5) * .8 }; if (sz > 0) it.h = sz; else it.s = -sz;
        (f === 'wz' ? wz : f === 'kb' ? kb : kk).push(it); placed.push([x, z, rad]); if (sz > .9 || sz < 0) C.addCol(x, z, rad); c++; } } }
  if (KK) { KK.place(g, wz, 'wz'); KK.place(g, kb, 'kb'); KK.place(g, kk); }
  return wz.length + kb.length + kk.length;
}
function lampAt(b, x, z, y) { b.cyl(x, y, z, .08, 2.6, 0x2a2a2e, { lo: 1 }); b.sph(x, y + 2.7, z, .2, .26, .2, 0xffd890, { mat: { e: 0xffc060, ei: 2 }, cast: false }); b.glow(0xffc060, 2.2, x, y + 2.7, z, .6); b.addCol(x, z, .25); }

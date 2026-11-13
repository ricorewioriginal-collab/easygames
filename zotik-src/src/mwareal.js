// Areale der Märchenwelten (wie in Kingdom Hearts): offene Plätze und Gassen, dazwischen dichte Waldwände;
// Höhenebenen (Plateaus mit Rampe/Treppe, Brücken, Schluchten) und Requisiten je Ort.
// Daten je Welt in mwdata.js unter `areal`:
//   tiers: [[x, z, r, y, fx, fz]]  Plateau (Oberkante y absolut) mit Rampe hinunter zum Fußpunkt (fx, fz)
//   cuts:  [[x0, z0, x1, z1, breite, tiefe]]  Schlucht (Absturz = zurück an den Rand)
//   bridges: [[x0, z0, x1, z1, y]]  Brücke (begehbar über PLAT), y = Oberkante
//   wall: DECOR-Arten der Waldwand, wz: Wizp-Bäume der vordersten Reihe [[name, höhe]], rock: Wizp-Felsen an Klippen
//   props: { zonenId: [[datei, name, größe (>0 Höhe, <0 Maßstab), anzahl]] }
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const segD = (x, z, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return [Math.hypot(x - ax - dx * t, z - az - dz * t), t]; };

/* Maske: Abstand außerhalb der offenen Fläche (0 = begehbar), als Raster vorberechnet und bilinear gelesen */
export function arealMask(w, roads, PATHX, CX, CZ, R) {
  const A = w.areal, C0 = [], S0 = [];   // Kreise [x, z, r] und Strecken [ax, az, bx, bz, hw]
  for (const q of w.zones) C0.push([q[3], q[4], q[5] + 3]);
  for (const [ax, az, bx, bz] of roads) S0.push([ax, az, bx, bz, 4.5]);
  for (let z = 16; z > -88; z -= 6) S0.push([PATHX(z), z, PATHX(z - 6), z - 6, 6]);
  C0.push([0, 10, 14], [-7, 15, 7]);
  for (const [x, z, r] of w.pads) C0.push([x, z, r + 2]);
  for (const [x, z, r] of (w.pools || [])) C0.push([x, z, r + 3]);
  for (const q of (A.cuts || [])) S0.push([q[0], q[1], q[2], q[3], q[4] * .5]);
  const base = (x, z) => { let e = 1e9; for (const [cx, cz, r] of C0) e = Math.min(e, Math.hypot(x - cx, z - cz) - r); for (const s of S0) e = Math.min(e, segD(x, z, s[0], s[1], s[2], s[3])[0] - s[4]); return e; };
  // Einzelne Dinge in der Wildnis (Truhen, Krüge, Steine, Figuren, Auftragsorte) bekommen eine Gasse zum nächsten offenen Ort
  const link = (x, z) => { let bx = x, bz = z, bd = 1e9;
    for (let a = 0; a < 32; a++) for (let d = 2; d < 60; d += 2) { const px = x + Math.cos(a * .196) * d, pz = z + Math.sin(a * .196) * d; if (base(px, pz) < -1.5) { if (d < bd) { bd = d; bx = px; bz = pz; } break; } }
    if (bd < 1e9) S0.push([x, z, bx, bz, 2.6]); };
  // Plateaus: Rampenfuß mit Gasse ans Wegenetz, dann Plateau und Rampe selbst offen
  for (const q of (A.tiers || [])) { if (base(q[4], q[5]) > -2) link(q[4], q[5]); C0.push([q[4], q[5], 3]); }
  for (const q of (A.tiers || [])) { C0.push([q[0], q[1], q[2] + .2]); S0.push([q[0], q[1], q[4], q[5], 2.6]); }
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
    if (e > 0) { let u = 1; for (const b of BR) u = Math.min(u, sm(2.5, 4.5, segD(x, z, b[0], b[1], b[2], b[3])[0])); q += (6.5 * sm(.8, 4.5, e) + .3 * Math.max(0, e - 4.5)) * u - (1 - u) * 1.5; }
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
  const step = TOUCH ? 3.6 : 3, maxWz = TOUCH ? 70 : 150; let nwz = 0;
  for (let j = 0; j < M.N; j += step / M.ST) for (let i = 0; i < M.N; i += step / M.ST) {
    const x = M.X0 + i * M.ST + (R2() - .5) * step * .8, z = M.Z0 + j * M.ST + (R2() - .5) * step * .8, e = M.E(x, z);
    if (e < 1.4 || e > 12 || Math.hypot(x, z - 12) < 16) continue; if ((A.bridges || []).some(q => segD(x, z, q[0], q[1], q[2], q[3])[0] < 4)) continue;
    if (e < 3.4 && A.wz && nwz < maxWz && R2() < .55) { const [k, hh] = A.wz[R2() * A.wz.length | 0]; wz.push({ k, x, y: h(x, z) - .1, z, ry: R2() * 6.28, h: hh * (.8 + R2() * .4) }); nwz++; continue; }
    const kind = A.wall[R2() * A.wall.length | 0]; wallList.push([x, z, kind, 1 + R2() * .7, R2() * 6.3, 1]); }
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
  for (const [ax, az, bx, bz, y] of (A.bridges || [])) { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let s = 0; s <= L; s += 1.1) { const x = ax + ux * s, z = az + uz * s; C.PLAT.push({ x, z, hx: 1.25, hz: 1.25, top: y, th: .5 }); const m = mk(G.box, plank, x, y - .1, z, 2.6, .2, 1); m.rotation.y = ry; g.add(m); }
    for (let s = 0; s <= L + .01; s += L / Math.max(2, Math.round(L / 2.2))) for (const sd of [-1, 1]) { const x = ax + ux * s - uz * sd * 1.35, z = az + uz * s + ux * sd * 1.35; g.add(mk(G.cyl0, MAT(0x5a4030), x, y + .5, z, .08, 1.2, .08)); }
    for (const sd of [-1, 1]) for (const yy of [.6, 1.05]) { const m = mk(G.box, rope, (ax + bx) / 2 - uz * sd * 1.35, y + yy, (az + bz) / 2 + ux * sd * 1.35, .05, .05, L, false); m.rotation.y = ry; g.add(m); } }
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

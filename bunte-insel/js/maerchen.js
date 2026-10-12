'use strict';
/* Bunte Insel – Märchenland ✨🏰 (Erweiterung): eine große Zauberinsel im Nordwesten, INSPIRIERT von der Stimmung der großen Märchen- und Trickfilm-Welten
   (Savanne mit Löwenfelsen, Eispalast, Piratenschiff, Meerjungfrauen-Lagune, Wüsten-Basar mit Wunschgeist, Dschungel & Honigwald, Spielzeug-Land,
   Gruselhügel, Strand mit kleinem Außerirdischen, Roboter-Ecke, Schloss mit Prinzessin) – aber mit ganz EIGENEN, selbst erfundenen Figuren, Namen,
   Farben und Formen. Nichts davon ist ein Original oder ein geschütztes Zeichen; die Figuren sind bewusst „neutralisiert“ (andere Namen, andere Gestalt).
   Aufbau: Insel mit echten Höhen – begehbare Hügel (Eisberg, Königsfels, Baumhaus-Hügel, Gruselhügel) und ein betretbares Piratenschiff (Deck + Laufplanke),
   14 Themen-Bereiche rund um das Schloss (neu: 🌙 Nimmerland mit fliegendem Jungen Pit, Fee Glimmer und Krokodil Tick-Tack – Feenstaub lässt dich 14 Sekunden schweben),
   Greifer-Automat im Spielzeug-Land, Ukulele am Strand, Elch Fridolin im Eisreich, 32 ansprechbare Figuren, Wunschbrunnen, Glühfeen, Schmetterlinge, fliegender Teppich, Feuerwerk.
   Lokale Koordinaten (a, b): a = Richtung Schloss (weg von der Brücke), b = quer dazu. */
BI.MAERCHEN = (function () {
  const R = 78, cx = -175, cz = -275, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Märchenland
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) }, hills: [], rects: [],
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
})();
BI.MAERCHEN.at = function (a, b) { const M = BI.MAERCHEN; return { x: M.x + M.ux * a - M.uz * b, z: M.z + M.uz * a + M.ux * b }; };
BI.MAERCHEN.loc = function (x, z) { const M = BI.MAERCHEN, dx = x - M.x, dz = z - M.z; return { a: dx * M.ux + dz * M.uz, b: -dx * M.uz + dz * M.ux }; };
/* Höhe des Bodens (begehbare Hügel in 1-Stufen-Schritten, Schiffsdeck + Laufplanke) – wird von world.js (groundY) benutzt */
BI.MAERCHEN.floor = function (x, z) {
  const M = BI.MAERCHEN, p = M.loc(x, z); if (Math.abs(p.a) > 80 || Math.abs(p.b) > 80) return 0;
  for (const r of M.rects) if (p.a > r.a0 && p.a < r.a1 && p.b > r.b0 && p.b < r.b1) return r.ramp ? r.y * (r.dir > 0 ? (p.b - r.b0) / (r.b1 - r.b0) : (r.b1 - p.b) / (r.b1 - r.b0)) : r.y;
  for (const h of M.hills) { const d = Math.hypot(p.a - h.a, p.b - h.b); if (d < h.r0) return Math.min(h.tiers, 1 + Math.floor((h.r0 - d) / h.dr)) * h.step; }
  return 0;
};

BI.buildMaerchenGround = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.MAERCHEN, TAU = Math.PI * 2, rn = BI.rng(4711), L = M.at, ry = Math.atan2(M.ux, M.uz), GOLD = 0xffd23f, BL = 0x5a7ae8, PK = 0xffd6e8, WH = 0xfff0fa;
  W.spots.maerchen = { x: M.entry.x, z: M.entry.z }; W.maerchen = M; M.shade = []; M.shadeR = [];
  st.disc(M.x, M.z, M.R + 9, 0, 0x9be88a, 96); st.ring(M.x, M.z, M.R - 5, M.R + 9, .012, 0xfff0c8, 96); BI.buildIsleBridge(c, M);
  /* ---- Helfer (alles in lokalen Koordinaten) ---- */
  const bx = (a, b, wb, h, da, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, wb, h, da, col, ry + (yaw || 0)); return p; };   /* Quader: wb quer (b), da längs (a) */
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const cone = (a, b, r, h, col, y0, seg) => { const p = L(a, b); st.cone(p.x, y0 || 0, p.z, r, h, col, seg || 12); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const glow = (a, b, y, r, col) => { const p = L(a, b); lamp.sph(p.x, y, p.z, r, col, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const path = (a0, b0, a1, b1, w, col) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), q0 = L(a0, b0), q1 = L(a1, b1); st.strip(p.x, p.z, w, Math.hypot(a1 - a0, b1 - b0), Math.atan2(q1.x - q0.x, q1.z - q0.z), ROADY, col || 0xf6d9ec); };
  const hill = (a, b, r0, tiers, step, dr, cA, cB) => { M.hills.push({ a, b, r0, tiers, step, dr }); for (let k = 1; k <= tiers; k++) { const r = r0 - dr * (k - 1); cyl(a, b, r, r, step, k % 2 ? cA : cB, (k - 1) * step, 40); } };
  const tree = (a, b, h, col, r) => { cyl(a, b, .25, .38, h, 0x7a4a2a, 0, 6); sph(a, b, h + 1.2, r || 1.9, col, .95); sph(a + .5, b - .3, h + 2.5, (r || 1.9) * .62, col + 0x0a140a, .95); solid(a, b, .5, 3); M.shade.push([L(a, b), (r || 1.9) * 1.1, h]); };
  const palm = (a, b, h, lean) => { const q = L(a, b); st.cyl(q.x, 0, q.z, .2, .3, h, 0x9a6a3a, 6); for (let f = 0; f < 6; f++) { const g = f / 6 * TAU; st.box(q.x + Math.sin(g) * 1.3, h - .2, q.z + Math.cos(g) * 1.3, 2.8, .1, .8, 0x3fae4a, g); } solid(a, b, .45, 6); };
  const flowers = (a, b, r, n, seed) => { const rr = BI.rng(seed || 7); for (let i = 0; i < n; i++) { const g = rr() * TAU, d = Math.sqrt(rr()) * r, p = L(a + Math.sin(g) * d, b + Math.cos(g) * d); st.sph(p.x, .25, p.z, .22 + rr() * .12, [0xff5a8a, 0xffd23f, 0xb48aff, 0xff8a1f, 0x7fe0ff][i % 5], 1); st.cyl(p.x, 0, p.z, .03, .03, .25, 0x3fae4a, 3); } };
  const lantern = (a, b, h) => { cyl(a, b, .07, .09, h || 3.6, 0x5a4a7a, 0, 6); glow(a, b, (h || 3.6) + .2, .32, 0xfff3b0); };
  const zones = [[-66, 0, 10], [-42, 0, 14], [38, 0, 24], [31, -30, 14], [-10, -52, 18], [-10, 52, 19], [-44, -42, 15], [-46, 38, 15], [12, -44, 16], [12, 44, 16], [52, -30, 14], [52, 30, 14], [64, -12, 10], [63, 10, 9]];
  /* ---- Wege (Pastell-Pflaster) und Laternen ---- */
  path(-66, 0, 26, 0, 7); for (const [a, b] of [[-10, -52], [-10, 52], [12, -44], [12, 44], [52, -30], [52, 30], [-44, -42], [-46, 38]]) path(Math.min(-20, Math.max(-42, a)) , b > 0 ? 8 : -8, a, b > 0 ? b - 12 : b + 12, 3.4, 0xf1e0ff);
  path(-42, -8, -44, -30, 3.4); path(-42, 8, -46, 28, 3.4); path(26, 0, 52, 0, 4.4); path(40, 0, 52, -30, 3); path(40, 0, 52, 30, 3);
  for (let a = -60; a <= 22; a += 9) for (const sd of [-1, 1]) lantern(a, sd * 5.2);
  /* ---- Märchentor: hohe Sternen-Säulen mit Bogen ---- */
  for (const sd of [-1, 1]) { cyl(-66, sd * 5.4, 1.2, 1.5, 9, WH, 0, 10); cone(-66, sd * 5.4, 1.9, 3.4, BL, 9, 10); glow(-66, sd * 5.4, 13.2, .6, GOLD); solid(-66, sd * 5.4, 1.6, 12); }
  for (let k = -4; k <= 4; k++) bx(-66, k * 1.2, 1.3, .8, 1.5, k % 2 ? 0xff8fc8 : GOLD, 9.6 + 1.8 - Math.abs(k) * .26);
  { const e = L(-66, 0); W.spots.maerchenGate = { x: e.x, y: 15, z: e.z }; }
  /* ---- Plaza mit Wunschbrunnen, Blumenbeeten und Hecken ---- */
  { const p = L(-42, 0); st.disc(p.x, p.z, 14, ROADY + .01, WH, 48); st.ring(p.x, p.z, 11.5, 12.6, ROADY + .02, 0xff8fc8, 48); st.ring(p.x, p.z, 8, 9, ROADY + .02, 0x6ad0ff, 48); st.ring(p.x, p.z, 4.8, 5.4, ROADY + .02, GOLD, 48);
    cyl(-42, 0, 4, 4.3, 1.1, 0xe8f0ff, 0, 24); cyl(-42, 0, 3.6, 3.6, .12, 0x6ad0ff, 1.1, 24); cyl(-42, 0, .5, .8, 3.2, 0xdde6ff, 1.1, 10); cyl(-42, 0, 1.6, .5, .5, 0xdde6ff, 4.2, 12); glow(-42, 0, 5.2, .6, 0xfff7b0);
    for (let k = 0; k < 8; k++) { const g = k / 8 * TAU; glow(-42 + Math.sin(g) * 2, Math.cos(g) * 2, 2.2 + (k % 2), .2, 0x9fe3ff); }
    W.addCircle(p.x, p.z, 4.3, false, 1.2); W.spots.wunsch = { x: p.x, z: p.z };
    for (const [a, b] of [[-42, -17], [-42, 17], [-30, -13], [-30, 13], [-54, -13], [-54, 13]]) { cyl(a, b, 2.2, 2.4, .5, 0x8a5a3a, 0, 14); flowers(a, b, 2, 22, a * 3 + b); }
    for (const sd of [-1, 1]) { bx(-42, sd * 20, .9, 1.4, 16, 0x3fae4a); W.addCircle(L(-42, sd * 20).x, L(-42, sd * 20).z, 1, false, 1.4); }
    for (const [a, b] of [[-33, -8], [-33, 8], [-51, -8], [-51, 8]]) { sph(a, b, 1.6, 1.3, 0x4cb85a); cyl(a, b, .15, .2, .5, 0x7a4a2a, 0, 6); }
  }
  /* ---- Schloss „Sternenglanz“: großes Haupthaus, vier Ecktürme, hoher Mittelturm, Zinnen, Tor, Fahnen, Gärten ---- */
  { const CA = 38, kd = 18, kw = 24, H = 12, T = .8, DG = 2.4, rb = M.roofB = new BI.Batch(), rbx = (a, b, wb, h, da, col, y0, yaw) => { const q = L(a, b); rb.box(q.x, y0 || 0, q.z, wb, h, da, col, ry + (yaw || 0)); };
    /* Hohlkörper statt Vollkörper: vier Wände (Tor vorn), Boden, Dach als eigenes Mesh (verschwindet drinnen) – Thronsaal ist begehbar */
    const wl = (a0, b0, a1, b1) => bx((a0 + a1) / 2, (b0 + b1) / 2, b1 - b0, H, a1 - a0, PK), wc = (a0, b0, a1, b1) => { const n = Math.max(1, Math.round(Math.hypot(a1 - a0, b1 - b0) / 1.4)); for (let i = 0; i <= n; i++) solid(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n, .95, H + 2); };
    wl(CA + kd / 2 - T, -kw / 2, CA + kd / 2, kw / 2); wl(CA - kd / 2, -kw / 2, CA + kd / 2, -kw / 2 + T); wl(CA - kd / 2, kw / 2 - T, CA + kd / 2, kw / 2); wl(CA - kd / 2, -kw / 2, CA - kd / 2 + T, -DG); wl(CA - kd / 2, DG, CA - kd / 2 + T, kw / 2); bx(CA - kd / 2 + T / 2, 0, DG * 2, H - 5.2, T, PK, 5.2);
    wc(CA + kd / 2 - T / 2, -kw / 2, CA + kd / 2 - T / 2, kw / 2); wc(CA - kd / 2, -kw / 2 + T / 2, CA + kd / 2, -kw / 2 + T / 2); wc(CA - kd / 2, kw / 2 - T / 2, CA + kd / 2, kw / 2 - T / 2); wc(CA - kd / 2 + T / 2, -kw / 2, CA - kd / 2 + T / 2, -DG - .6); wc(CA - kd / 2 + T / 2, DG + .6, CA - kd / 2 + T / 2, kw / 2);
    path(CA - kd / 2 + T, 0, CA + kd / 2 - T, 0, kw - 2 * T, 0xf6e4ee); path(CA - kd / 2 - 1, 0, CA + 6, 0, 3.6, 0xc23a3a); path(CA - kd / 2 - 1, -1.9, CA + 6, -1.9, .35, GOLD); path(CA - kd / 2 - 1, 1.9, CA + 6, 1.9, .35, GOLD);
    /* Thron auf Podest, Säulen, Banner, Kronleuchter */
    bx(CA + 6.2, 0, 7, .4, 3, 0xc23a8a); bx(CA + 6.7, 0, 6, .4, 2.2, 0xe05aa8, .4); bx(CA + 7.4, 0, 2.2, .8, 1.2, GOLD, .8); bx(CA + 8, 0, 2.2, 3.4, .35, GOLD, .8); bx(CA + 7.95, 0, 3, .4, .6, 0xff5a8a, 4.1); solid(CA + 7.2, 0, 1.6, 3);
    for (const [a, b] of [[CA - 3, -6], [CA - 3, 6], [CA + 2, -6], [CA + 2, 6]]) { cyl(a, b, .6, .65, H - .2, WH, 0, 12); cone(a, b, .9, .6, GOLD, H - .8, 12); solid(a, b, .8, H); }
    for (const b of [-8, -4, 4, 8]) { bx(CA - kd / 2 + T + .06, b, 1.6, 4, .1, [0xc23a8a, 0x5a7ae8][(b < 0 ? 0 : 1)], 3.2); bx(CA + kd / 2 - T - .06, b, 1.6, 4.6, .1, [0x5a7ae8, 0xc23a8a][(b < 0 ? 0 : 1)], 3.2); }
    for (const b of [-5, 0, 5]) { rbx(CA + 1, b, .12, 2.6, .12, 0x8a6a2a, H - 2.6); rbx(CA + 1, b, 1.4, .2, 1.4, GOLD, H - 3); for (let k = 0; k < 4; k++) { const g = k * 1.57, q = L(CA + 1 + Math.sin(g) * .6, b + Math.cos(g) * .6); lamp.sph(q.x, H - 3.4, q.z, .14, 0xfff3b0, 1); } }
    W.spots.thron = L(CA + 5, 0); W.spots.thronSeat = L(CA + 7, 0);
    /* Dach-Mesh */
    rbx(CA, 0, kw + 1, 1, kd + 1, WH, H); for (let k = -5; k <= 5; k++) for (const sd of [-1, 1]) rbx(CA + sd * (kd / 2 + .3), k * 2.2, 1.1, 1.1, .9, WH, H + 1);
    for (const sd of [-1, 1]) for (let k = -5; k <= 5; k += 2) rbx(CA, sd * (kw / 2 + .3), .9, 1.1, 1.1, WH, H + 1);
    { const pr = L(CA, 0); rb.prism(pr.x, H + 1, pr.z, kw - 6, 5.5, kd - 2, BL, ry + Math.PI / 2); const q = L(CA + 2, 0); rb.cyl(q.x, H, q.z, 4.5, 4.8, 14, WH, 16); rb.cone(q.x, H + 14, q.z, 5.8, 13, 0xc23a8a, 16); rb.sph(q.x, H + 28, q.z, .8, GOLD, 1); for (let w = 0; w < 3; w++) { const f = L(CA + 2 - 4.5, 0); rb.box(f.x, H + 4 + w * 3.4, f.z, 1, 1.8, .1, 0xffe9a0, ry); } }
    for (const bb of [-9, 9]) { const f = L(CA - kd / 2 - .5, bb); rb.cyl(f.x, H + 1, f.z, .07, .1, 5, 0xdddddd, 5); rb.box(f.x, H + 5, f.z, .1, 1.4, 2, bb < 0 ? 0xff5a8a : 0x5a8aff, ry); }
    M.roofIn = { a0: CA - kd / 2 + T, a1: CA + kd / 2 - T, b0: -kw / 2 + T, b1: kw / 2 - T };
    for (const [aa, bb] of [[CA - kd / 2, -kw / 2], [CA - kd / 2, kw / 2], [CA + kd / 2, -kw / 2], [CA + kd / 2, kw / 2]]) { cyl(aa, bb, 3, 3.3, 18, WH, 0, 14); cone(aa, bb, 4.2, 9, bb < 0 ? 0xc23a8a : BL, 18, 14); glow(aa, bb, 27.6, .55, GOLD); solid(aa, bb, 3.4, 18); for (let w = 0; w < 4; w++) { const q = L(aa - 3.1, bb); lamp.box(q.x, 4 + w * 3.6, q.z, .1, 1.5, .9, 0xffe9a0, ry); } }
    const dg = L(CA - kd / 2 - .1, 0); st.prism(dg.x, 5.2, dg.z, 5.4, 1.2, .8, 0x8a4a3a, ry + Math.PI / 2);
    W.spots.schloss = { x: dg.x, z: dg.z, fx: L(CA - kd / 2 - 3, 0).x, fz: L(CA - kd / 2 - 3, 0).z }; W.spots.keep = L(CA, 0);
    path(CA - kd / 2 - 1, -6, CA - kd / 2 - 1, 6, 6, 0xf6d9ec);
    for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { const a = 20 + k * 4.4; cone(a, sd * 9, 1.1, 2.6, 0x3fae4a, .6, 8); cyl(a, sd * 9, .8, .9, .6, 0x8a5a3a, 0, 8); solid(a, sd * 9, 1.1, 3); }
  }
  /* ---- Schloss-Details: Fenster mit Rahmen, Steinbänder, Treppe, Torbogen, Balkon, Turmfenster (echte Tiefe statt glatter Wände) ---- */
  { const CA = 38, kd = 18, kw = 24, H = 12, FR = 0xfff0fa, DK = 0xe8b0cc;
    const win2 = (a, b, y, face, sgn, big) => { const w = big ? 1.5 : 1.2, h = big ? 2.4 : 1.8; if (face === 'a') { bx(a + sgn * .12, b, w + .5, h + .5, .3, FR, y - .25); const p = L(a + sgn * .26, b); lamp.box(p.x, y, p.z, w, h, .1, 0xffe9a0, ry); bx(a + sgn * .3, b, w + .6, .2, .5, DK, y - .4); }
      else { bx(a, b + sgn * .12, .3, h + .5, w + .5, FR, y - .25); const p = L(a, b + sgn * .26); lamp.box(p.x, y, p.z, .1, h, w, 0xffe9a0, ry); bx(a, b + sgn * .3, .5, .2, w + .6, DK, y - .4); } };
    for (const y of [5.2, 9.8]) { for (const sd of [-1, 1]) { bx(CA + sd * (kd / 2 + .1), 0, kw + .35, .4, .35, DK, y); bx(CA, sd * (kw / 2 + .1), .35, .4, kd + .35, DK, y); } }
    for (const sg of [-1, 1]) { for (const b of [-9, -6, -3, 3, 6, 9]) for (const y of [3.4, 8]) { if (sg < 0 && y < 5 && Math.abs(b) < 4) continue; win2(CA + sg * kd / 2, b, y, 'a', sg); } for (const a of [CA - 5, CA, CA + 5]) for (const y of [3.4, 8]) win2(a, sg * kw / 2, y, 'b', sg); }
    for (const [aa, bb] of [[CA - kd / 2, -kw / 2], [CA - kd / 2, kw / 2], [CA + kd / 2, -kw / 2], [CA + kd / 2, kw / 2]]) { const sa = aa < CA ? -1 : 1, sb = bb < 0 ? -1 : 1; for (const y of [4, 9, 14, 19.5]) { const p = L(aa + sa * 2.1, bb + sb * 2.1); st.box(p.x, y - .9, p.z, 1.2, .35, 1.2, DK, ry + Math.PI / 4 * sa * sb); lamp.box(p.x, y, p.z, .9, 1.7, .1, 0xffe9a0, ry + Math.PI / 4 * sa * sb * -1 * -1); } bx(aa, bb, 7, .5, 7, DK, 17.4, Math.PI / 4); }
    for (let k = 0; k < 3; k++) bx(CA - kd / 2 - 1 - k * .5, 0, 6.4 - k * .3, .15, .5, k % 2 ? 0xe8b0cc : 0xfff0fa, (2 - k) * .05, 0);
    for (const sd of [-1, 1]) { bx(CA - kd / 2 - .1, sd * 2.9, 1.1, 8.2, 1.1, WH, 0); bx(CA - kd / 2 - .1, sd * 2.9, 1.5, .4, 1.5, DK, 8.2); }
    bx(CA - kd / 2 - .4, 0, 7.2, .5, 1.6, DK, 7.6); bx(CA - kd / 2 - .9, 0, 7.4, 1, 1.4, WH, 7.1); for (let k = -3; k <= 3; k++) bx(CA - kd / 2 - 1.5, k * 1.1, .3, 1.3, .3, WH, 8.1);
    M.shadeR.push([L(CA, 0), kw, kd, H + 4]); for (const [aa, bb] of [[CA - kd / 2, -kw / 2], [CA - kd / 2, kw / 2], [CA + kd / 2, -kw / 2], [CA + kd / 2, kw / 2]]) M.shade.push([L(aa, bb), 4.2, 18]); M.shade.push([L(CA + 2, 0), 5.2, 26]);
  }
  /* ---- Eisreich „Frostgipfel“: begehbarer Eisberg (Stufen), Kristalle, Schneedecke, Schneemann ---- */
  { hill(-10, -52, 14, 8, .8, 1.6, 0xf4fbff, 0xcdeaff); for (let i = 0; i < 9; i++) { const g = i / 9 * TAU, d = i ? 3 + (i % 3) * 2.4 : 0, a = -10 + Math.sin(g) * d, b = -52 + Math.cos(g) * d, h = 4 + (i * 7 % 5) + (i ? 0 : 6); cone(a, b, 1.2 + (i ? .3 : 1), h, [0xbfeaff, 0xa0dcff, 0xe0f6ff][i % 3], 6.4, 6); glow(a, b, 6.4 + h + .4, .22, 0xdff6ff); }
    for (let i = 0; i < 8; i++) { const g = i / 8 * TAU + .3, a = -10 + Math.sin(g) * 17, b = -52 + Math.cos(g) * 17; cone(a, b, 1.1, 3 + i % 3, 0xbfeaff, 0, 6); solid(a, b, 1.1, 3); sph(a + 1, b + 1, .4, 1.1 + (i % 2) * .5, 0xffffff, .5); }
    W.spots.eis = L(-10, -52); sph(-18, -40, 1.0, 1.15, 0xffffff); sph(-18, -40, 2.5, .9, 0xffffff); sph(-18, -40, 3.6, .6, 0xffffff); cone(-18 + .8, -40, .13, .8, 0xff8a1f, 3.6, 5); solid(-18, -40, 1.3, 4); }
  /* ---- Königsfels: breiter Stufenfelsen mit Sonnenlöwe, Savanne mit Schirmakazien ---- */
  { const p = L(-6, 50); st.disc(p.x, p.z, 24, ROADY + .008, 0xd9c26a, 40); hill(-10, 52, 15, 9, .9, 1.55, 0xb3a28a, 0x9a8a78);
    const TY = 9 * .9; { const lb = (a, b, wb, h, da, col, y0) => bx(-10 + a, 52 + b, wb, h, da, col, TY + (y0 || 0)); lb(0, 0, 4, 1.8, 7, 0xe0a030); lb(0, 3.8, 2.2, 1.8, 2.6, 0xe0a030, 1.2); sph(-10 - 1, 52 + 4.2, TY + 3.6, 1.9, 0xa8551a); sph(-10 - 1, 52 + 4.2, TY + 3.5, 1.4, 0xe0a030); lb(-3.4, 3.4, .9, 1.4, .9, 0xe0a030, 0); lb(-3.4, -3.4, .9, 1.4, .9, 0xe0a030, 0); lb(3.4, 3.4, .9, 1.4, .9, 0xe0a030, 0); lb(3.4, -3.4, .9, 1.4, .9, 0xe0a030, 0); lb(-1.8, -4.6, .5, .5, 3.4, 0xe0a030, 1.4); sph(-10 - 1.2, 52 - 6.2, TY + 1.5, .5, 0xa8551a); }
    { const q = L(-10, 52); st.ring(q.x, q.z, 5.2, 5.8, TY + .02, GOLD, 24); for (let k = 0; k < 12; k++) { const g = k / 12 * TAU, f = L(-10 + Math.sin(g) * 6.5, 52 + Math.cos(g) * 6.5); lamp.box(f.x, TY + .9, f.z, .2, 1.6, .2, 0xffe08a, ry + g); } }
    for (const [a, b] of [[10, 36], [4, 66], [-20, 36], [-26, 62], [6, 58]]) { cyl(a, b, .3, .5, 4.6, 0x7a5a3a, 0, 6); sph(a, b, 5.4, 3.2, 0x7fae3a, .28); solid(a, b, .6, 6); }
    for (let i = 0; i < 5; i++) { const a = -2 + i * 4, b = 34 + (i % 2) * 3; sph(a, b, .5, 1 + (i % 2) * .4, 0x9a8a78, .7); solid(a, b, 1, 1.2); } W.spots.fels = L(-10, 52); W.spots.felsTop = { x: L(-10, 52).x, z: L(-10, 52).z, y: TY }; }
  /* ---- Piratenbucht: betretbares Schiff (Deck 2,4 m, Laufplanke), Steg, Fässer, Schatztruhe ---- */
  { const sa = -44, sb = -42, DY = 2.4; bx(sa, sb, 7, 2.4, 22, 0x6b3f22); bx(sa, sb, 7.4, .35, 22.4, 0x8a5a33, 2.4); { const bow = L(sa + 12.5, sb); st.prism(bow.x, 0, bow.z, 7, 2.4, 4, 0x6b3f22, ry + Math.PI / 2); } { const st2 = L(sa - 12, sb); st.box(st2.x, 0, st2.z, 7.2, 3.8, 3, 0x7a4a2a, ry); st.box(st2.x, 3.8, st2.z, 7.6, .3, 3.4, 0x8a5a33, ry); }
    cyl(sa + 1, sb, .26, .34, 14, 0x4a2f18, 2.4, 6); { const q = L(sa + 1, sb); st.box(q.x, 8.2, q.z, 5.6, 5.6, .14, 0xfff3d6, ry + Math.PI / 2); st.box(q.x, 14.8, q.z, .14, 1.4, 2.2, 0x222222, ry + Math.PI / 2); }
    cyl(sa + 8, sb, .2, .26, 8, 0x4a2f18, 2.4, 6); { const q = L(sa + 8, sb); st.box(q.x, 6.4, q.z, 4, 3.4, .14, 0xfff3d6, ry + Math.PI / 2); }
    for (const sd of [-1, 1]) for (let i = -3; i <= 3; i++) { sph(sa + i * 3, sb + sd * 3.7, 1.4, .34, 0x222222); bx(sa + i * 3, sb + sd * 3.5, .2, .6, .2, 0x4a2f18, 2.4); }
    cyl(sa - 9, sb + 1, .5, .5, .3, 0x8a5a33, 2.4, 10); cyl(sa - 9, sb + 1, .1, .1, 1.6, 0x4a2f18, 2.4, 6);
    M.rects.push({ a0: sa - 11, a1: sa + 11, b0: sb - 3.4, b1: sb + 3.4, y: DY }); M.rects.push({ a0: sa - 1.6, a1: sa + 1.6, b0: sb + 3.4, b1: sb + 9, y: DY, ramp: 1, dir: -1 });
    bx(sa, sb + 6.2, 5.8, .18, 3.2, 0xb98650, 1.1); /* Laufplanke */ for (let i = -5; i <= 5; i++) { solid(sa + i * 2.1, sb - 3.7, .85, 5); if (i !== 0) solid(sa + i * 2.1, sb + 3.7, .85, 5); } /* an der Laufplanke bleibt eine Lücke */ for (const a of [sa - 12.2, sa + 12.6]) solid(a, sb, 1.9, 5);
    bx(sa - 18, sb + 12, 3.2, .5, 12, 0xb98650, 0); /* Anlegesteg */ for (let k = 0; k < 4; k++) cyl(sa - 18 + (k % 2 ? 1.4 : -1.4), sb + 8 + k * 2.6, .25, .3, 1.6, 0x6a4a2a, -.5, 6);
    for (const [a, b] of [[sa - 22, sb + 14], [sa - 14, sb + 15]]) { cyl(a, b, .8, .8, 1.3, 0x7a4a2a, 0, 10); solid(a, b, .9, 1.3); } bx(sa + 3, sb + 15, 1.6, 1, 1.2, 0x8a5a33); bx(sa + 3, sb + 15, 1.7, .2, 1.3, GOLD, 1); solid(sa + 3, sb + 15, 1.1, 1.2); W.spots.schiff = L(sa, sb); W.spots.schiffDeck = { x: L(sa, sb).x, z: L(sa, sb).z, y: DY }; }
  /* ---- Perlenlagune mit Wasserfall ---- */
  { const p = L(-46, 38); st.disc(p.x, p.z, 11.5, ROADY + .008, 0xf4e6b8, 36); st.disc(p.x, p.z, 10, ROADY + .02, 0x4ac8ff, 36); st.ring(p.x, p.z, 10, 11.2, ROADY + .03, 0xffffff, 36);
    for (let i = 0; i < 6; i++) { const g = i / 6 * TAU + .5, a = -46 + Math.sin(g) * 6, b = 38 + Math.cos(g) * 6; cyl(a, b, .9, .9, .05, 0x3fae4a, ROADY + .03, 8); } for (const [a, b] of [[-48, 40], [-43, 36]]) { sph(a, b, .55, .5, 0xff8fc8, .6); sph(a, b, .55, .5, 0xffffff, .3); }
    hill(-58, 46, 7.5, 5, 1.1, 1.5, 0x8a96a8, 0x7a869a); for (let k = 0; k < 5; k++) { const a = -58 + 5.5, b = 46 - 1 + k * .6; } { const f = L(-52, 44); st.box(f.x, 0, f.z, .9, 5.4, 1.6, 0x7fe0ff, ry); st.box(f.x - M.ux * .2, 5.4, f.z - M.uz * .2, 1.6, .3, 2.4, 0xaee9ff, ry); }
    for (let i = 0; i < 7; i++) { const g = i / 7 * TAU + 1, a = -46 + Math.sin(g) * 12, b = 38 + Math.cos(g) * 12; sph(a, b, .45, 1.2 + (i % 2) * .6, 0x8a96a8, .8); solid(a, b, 1.3, 1.4); } for (let i = 0; i < 4; i++) glow(-46 + Math.sin(i * 1.7) * 7, 38 + Math.cos(i * 1.7) * 7, .6, .16, 0xffffff);
    solid(-58, 46, 7, 7); W.spots.lagune = L(-46, 38); }
  /* ---- Wüsten-Basar: Zwiebeltürme, Zelte, Teppiche, Wunschlampe ---- */
  { for (const [a, b, r, h, col] of [[12, -52, 3, 7, 0x35d6e0], [20, -46, 2.4, 5, 0xff8a1f], [4, -50, 2.2, 6, 0xb48aff]]) { cyl(a, b, r, r * 1.05, h, 0xf4d9a8, 0, 14); sph(a, b, h + r * .9, r * 1.1, col, 1.2); cone(a, b, .25, 2, GOLD, h + r * 2, 5); glow(a, b, h + r * 2 + 2.1, .3, GOLD); solid(a, b, r + .2, h + 4); for (let w = 0; w < 3; w++) { const q = L(a - r - .05, b); lamp.box(q.x, 1.8 + w * 1.6, q.z, .1, .8, .5, 0xffe9a0, ry); } }
    for (let i = 0; i < 6; i++) { const t = L(8 + (i % 3) * 5.2, -34 - Math.floor(i / 3) * 5); for (let k = 0; k < 8; k++) st.prism(t.x, 2.6, t.z, 2.2, 1.8, 4.6, k % 2 ? [0xff8a1f, 0xff5a8a, 0x35d6e0][i % 3] : WH, ry + k * Math.PI / 8); st.box(t.x, 0, t.z, 4, 2.6, 4, 0xf4d9a8, ry); W.addCircle(t.x, t.z, 2.6, false, 4); }
    for (const [a, b, col] of [[14, -30, 0x8a2ad8], [18, -28, 0xe8453c], [10, -28, 0x35d6e0]]) { bx(a, b, 3.2, .06, 2, col, .04); bx(a, b, 2.6, .07, 1.4, GOLD, .045); }
    { const p = L(22, -47); st.cyl(p.x, 0, p.z, 1.4, 2, .5, GOLD, 12); st.sph(p.x, 1.4, p.z, 1.5, GOLD, 1, 1, .7, 1); st.cone(p.x + M.ux * 1.6, .9, p.z + M.uz * 1.6, .35, 2.2, GOLD, 6); st.cyl(p.x - M.ux * 1.4, 1.3, p.z - M.uz * 1.4, .1, .5, 1.4, GOLD, 6); st.sph(p.x, 3.6, p.z, 1.1, 0x6ad0ff, 1, 1, 1.8, 1); W.addCircle(p.x, p.z, 2, false, 2); }
    W.spots.basar = L(12, -44); }
  /* ---- Honigwald & Dschungel: hohe Bäume, Baumhaus-Hügel, Honigtöpfe, Lianen ---- */
  { hill(26, 40, 6.5, 4, .9, 1.5, 0x9a7a4a, 0x8a6a3a); { const q = L(26, 40), ty = 3.6; st.box(q.x, ty, q.z, 4.6, 2.6, 4.6, 0xc8903c, ry); st.prism(q.x, ty + 2.6, q.z, 5.4, 1.9, 5.6, 0x3fae4a, ry + Math.PI / 2); lamp.box(q.x - M.ux * 2.35, ty + 1.2, q.z - M.uz * 2.35, .1, .8, .8, 0xffe9a0, ry); }
    for (const [a, b, h] of [[6, 52, 10], [18, 54, 12], [0, 40, 9], [30, 52, 11], [34, 34, 10], [2, 56, 11]]) { cyl(a, b, .5, .8, h, 0x7a4a2a, 0, 8); sph(a, b, h + 1.4, 3.6, 0x2f9a4a, .9); sph(a + 1.4, b - 1, h - .6, 2.4, 0x3fae4a, .9); sph(a - 1.2, b + 1, h + 3, 2.2, 0x4cc85a, .9); solid(a, b, .9, 9); for (let v = 0; v < 3; v++) { const g = v * 2.2, q2 = L(a + Math.sin(g) * 1.8, b + Math.cos(g) * 1.8); st.cyl(q2.x, h * .35, q2.z, .04, .04, h * .62, 0x3a8a3a, 3); } }
    for (const [a, b] of [[10, 34], [16, 34], [20, 38], [8, 46]]) { cyl(a, b, .55, .7, .8, 0xe0902a, 0, 10); cyl(a, b, .6, .6, .12, 0x7a4a2a, .8, 10); solid(a, b, .8, .9); }
    for (let i = 0; i < 14; i++) { const q = L(6 + (i % 7) * 4.5, 34 + Math.floor(i / 7) * 14 + (i * 3 % 5)); st.cone(q.x, 0, q.z, .9, 1.8, 0x3fae4a, 5); } W.spots.dschungel = L(12, 44); W.spots.honig = L(26, 40); }
  /* ---- Spielzeug-Land: riesige ABC-Würfel, Rakete, Zinnsoldaten, Bauklotz-Brücke ---- */
  { for (const [a, b, s, col, y0] of [[48, -34, 4, 0xff5a5a, 0], [53, -34, 4, 0x4da3ff, 0], [50.5, -34, 4, 0xffd23f, 4], [48, -27, 4, 0x4cd07d, 0], [44, -33, 3, 0xb48aff, 0]]) { bx(a, b, s, s, s, col, y0, .2); for (const f of [0, 1]) { const q = L(a, b); } if (y0 === 0) solid(a, b, s * .75, s); }
    { const p = L(58, -22); st.cyl(p.x, 0, p.z, 1.2, 1.5, 7, 0xe8453c, 12); st.cone(p.x, 7, p.z, 1.2, 3, WH, 12); for (let k = 0; k < 3; k++) { const g = k * TAU / 3; st.box(p.x + Math.sin(g) * 1.6, .4, p.z + Math.cos(g) * 1.6, .3, 2.4, 1.6, 0x4da3ff, g); } st.sph(p.x, 4.6, p.z, .5, 0x9fe3ff, 1); glow(58, -22, 10.4, .3, 0xff8a1f); W.addCircle(p.x, p.z, 1.9, false, 8); }
    for (let i = 0; i < 8; i++) { const a = 44 + (i % 4) * 2.4, b = -20 + Math.floor(i / 4) * 2.4, p = L(a, b); st.box(p.x, 0, p.z, .8, 2.2, .8, 0x3fae4a, ry); st.sph(p.x, 2.6, p.z, .5, 0xf3c9a0, 1); st.cyl(p.x, 3, p.z, .5, .35, .8, 0x3fae4a, 6); } solid(46.8, -19, 4, 3);
    for (const [a, b, col] of [[56, -36, 0xff8fc8], [47, -41, 0x4da3ff]]) { sph(a, b, 1.7, 1.7, col, 1); solid(a, b, 1.7, 3.4); } W.spots.spielzeug = L(52, -30); }
  /* ---- Gruselhügel: lila Stufenhügel, krummer Baum, Kürbisse, Fledermaus-Laternen ---- */
  { hill(52, 30, 11, 6, .8, 1.7, 0x6a4a8a, 0x4a3a6a); { const q = L(52, 30), ty = 4.8; for (let k = 0; k < 5; k++) { const g = k * 1.3; st.cyl(q.x + Math.sin(g) * k * .3, ty + k * 1.0, q.z + Math.cos(g) * k * .3, .25 - k * .03, .3 - k * .03, 1.1, 0x2a1a3a, 5); } st.box(q.x + 1.2, ty + 4.2, q.z, 2.4, .2, .2, 0x2a1a3a, 0, 0, .5); }
    for (const [a, b, s] of [[44, 38, 1.1], [58, 38, .9], [40, 24, 1], [60, 22, 1.2], [46, 40, .8]]) { sph(a, b, s, s, 0xff8a1f, .85); cyl(a, b, .1, .12, .4, 0x3a6a3a, s * 1.6, 5); glow(a, b, s * .9, s * .5, 0xffd23f); solid(a, b, s + .1, s * 2); }
    for (let i = 0; i < 4; i++) { const q = L(46 + i * 4.4, 20 + (i % 2) * 20); st.cyl(q.x, 0, q.z, .08, .1, 3.2, 0x2a1a3a, 5); lamp.sph(q.x, 3.4, q.z, .3, 0xb48aff, 1); } W.spots.grusel = L(52, 30); }
  /* ---- Strand der Träume (Hütte, Palmen, Surfbretter) und Roboter-Ecke ---- */
  { const sp = L(64, -12); st.disc(sp.x, sp.z, 11, ROADY + .008, 0xf4e6b8, 36); const hut = L(66, -16); st.box(hut.x, 0, hut.z, 5, 2.8, 5, 0xc8903c, ry); st.prism(hut.x, 2.8, hut.z, 6.2, 2.4, 6.2, 0x3fae4a, ry); W.addCircle(hut.x, hut.z, 3.2, false, 5);
    for (const [a, b, h] of [[60, -22, 7], [66, -6, 8], [58, -4, 6.5], [69, -22, 7.5]]) palm(a, b, h);
    for (const [a, b, col] of [[60, -14, 0xff5a8a], [60.8, -12.6, 0x35d6e0], [61.6, -11.2, 0xffd23f]]) { const q = L(a, b); st.box(q.x, 0, q.z, .5, 2.4, .12, col, ry + .3, .2); W.addCircle(q.x, q.z, .4, false, 2.4); }
    for (let i = 0; i < 6; i++) { const q = L(62 + (i % 3) * 2, -2 + Math.floor(i / 3) * 3); st.sph(q.x, .15, q.z, .5, [0xff5a8a, 0xffd23f][i % 2], 1, 1, .4, 1); } W.spots.strand = L(64, -12);
    for (const [a, b, w, h, col] of [[62, 12, 3, 1.8, 0x9a9aa6], [66, 8, 2.4, 1.4, 0x7a7a86], [60, 15, 2.6, 2.2, 0x8a8a96]]) { bx(a, b, w, h, w, col, 0, a * .3); W.addCircle(L(a, b).x, L(a, b).z, w * .8, false, h); }
    { const q = L(62, 10); st.cyl(q.x, 0, q.z, .5, .6, .6, 0x6a4a2a, 8); st.cone(q.x, .6, q.z, .35, 1.2, 0x3fae4a, 5); } for (let i = 0; i < 3; i++) { const q = L(64 + i, 14 - i); lamp.sph(q.x, .5, q.z, .12, [0x7fe0ff, 0xff8a1f][i % 2], 1); } W.spots.roboter = L(63, 10); }
  /* ---- Nimmerland 🌙: Mondhügel mit Baumhaus-Versteck, Sterne, Uhr-Turm, Teich (Tick-Tack) ---- */
  { hill(31, -30, 10, 6, .9, 1.5, 0x5a4a9a, 0x4a3a8a); const TY = 5.4, hp = L(31, -30);
    bx(31, -30, 5, 2.8, 5, 0xc8903c, TY); st.prism(hp.x, TY + 2.8, hp.z, 6, 2.2, 6, 0x3fae4a, ry + Math.PI / 2); for (const sd of [-1, 1]) { const q = L(31 - 2.55, sd * 1.4); lamp.box(q.x, TY + 1.2, q.z, .1, .9, .8, 0xffe9a0, ry); } solid(31, -30, 3, 9);
    cyl(31, -30, .1, .12, 6, 0x8a5a33, TY + 5, 6); glow(31, -30, TY + 11.6, 1.7, 0xfff3b0); glow(31, -30, TY + 11.6, 1.2, 0xffffff); for (let i = 0; i < 18; i++) { const g = i * 1.9, d = 6 + (i % 5) * 1.6; glow(31 + Math.sin(g) * d, -30 + Math.cos(g) * d, TY + 3 + (i % 6) * 1.4, .13 + (i % 3) * .05, [0xfff3b0, 0xbfeaff, 0xffd6f0][i % 3]); }
    for (let k = 0; k < 8; k++) { const g = k / 8 * TAU + .2; lantern(31 + Math.sin(g) * 12.5, -30 + Math.cos(g) * 12.5, 3.2); }
    { const q = L(38, -41); st.disc(q.x, q.z, 5.2, ROADY + .008, 0xf4e6b8, 28); st.disc(q.x, q.z, 4.2, ROADY + .02, 0x4ac8ff, 28); for (let i = 0; i < 3; i++) { const g = i * 2.1 + .4; cyl(38 + Math.sin(g) * 2.2, -41 + Math.cos(g) * 2.2, .7, .7, .05, 0x3fae4a, ROADY + .03, 8); } }
    { const q = L(24, -42); st.cyl(q.x, 0, q.z, 1.1, 1.3, .6, 0x8a5a33, 10); st.box(q.x, .6, q.z, 1.6, 4.4, 1.6, 0x6a4a2a, ry); st.sph(q.x - M.ux * .85, 3.4, q.z - M.uz * .85, .7, 0xfff6d8, 1, .2, 1, 1); st.box(q.x - M.ux * .88, 3.4, q.z - M.uz * .88, .08, .05, .55, 0x2a2a2a, ry, 0, .6); st.box(q.x - M.ux * .88, 3.4, q.z - M.uz * .88, .05, .4, .08, 0x2a2a2a, ry); solid(24, -42, 1.3, 5); }
    W.spots.nimmer = L(31, -30); W.spots.nimmerTop = { x: hp.x, z: hp.z, y: TY }; W.spots.tickteich = L(38, -41); }
  /* ---- Greifer-Automat im Spielzeug-Land ---- */
  { const g = L(53, -15), CY = 4.8; st.box(g.x, 0, g.z, 3.8, 1.2, 3.2, 0xe8453c, ry); for (const [da, db] of [[-1.5, -1.8], [-1.5, 1.8], [1.5, -1.8], [1.5, 1.8]]) { const q = L(53 + da, -15 + db); st.cyl(q.x, 1.2, q.z, .1, .1, CY - 1.2, 0xf6f6f6, 6); } st.box(g.x, CY, g.z, 4, .5, 3.4, 0xe8453c, ry); lamp.box(g.x, CY + .55, g.z, 3.4, .12, .12, 0xffd23f, ry);
    for (let i = 0; i < 9; i++) { const q = L(53 + ((i % 3) - 1) * .9, -15 + (Math.floor(i / 3) - 1) * .9); st.sph(q.x, 1.55 + (i % 2) * .15, q.z, .38, [0xff8fc8, 0x7fe05a, 0x4da3ff, 0xffd23f, 0xb48aff][i % 5], 1); } W.addCircle(g.x, g.z, 2.4, false, 5); W.spots.greifer = L(53, -15); }
  /* ---- Ukulele-Stein am Strand ---- */
  { const q = L(62, -4); st.cyl(q.x, 0, q.z, .7, .8, .6, 0x8a5a33, 8); st.sph(q.x, .95, q.z, .34, 0xc8803c, 1, 1, 1.2, .6); st.box(q.x, 1.2, q.z, .09, .06, .8, 0x6a4a2a, ry, 0, -.5); glow(62, -4, 2.4, .12, 0xfff3b0); W.addCircle(q.x, q.z, .8, false, 1); W.spots.uku = L(62, -4); }
  /* ---- Blumen, Märchenbäume und Hecken am Rand ---- */
  flowers(-10, -30, 7, 40, 21); flowers(-10, 30, 7, 40, 22); flowers(10, 0, 8, 40, 23); flowers(30, 22, 5, 25, 24); flowers(30, -22, 5, 25, 25);
  for (let i = 0; i < 70; i++) { const a = rn() * TAU, d = 52 + rn() * 17, x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d, pl = M.loc(x, z); if (zones.some(zn => Math.hypot(pl.a - zn[0], pl.b - zn[1]) < zn[2] + 3)) continue; if (Math.abs(pl.b) < 8 && pl.a < 30) continue;
    const h = 2.6 + rn() * 2; st.cyl(x, 0, z, .24, .34, h, 0x8a5a7a, 6); st.sph(x, h + 1.2, z, 1.6 + rn() * .6, [0xff9ad5, 0xb48aff, 0x7fe0ff, 0xffe08a][i % 4], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  /* ---- Wiesenflecken (verschiedene Grüntöne, wie auf der Hauptinsel – damit die Insel nicht flach wirkt) ---- */
  { const cols = [0x82c174, 0xa6d591, 0x77b869, 0x8cc77d, 0xb4dd8f]; for (let i = 0; i < 70; i++) { const a = rn() * TAU, d = Math.sqrt(rn()) * (M.R - 12), r = 3 + rn() * 7, x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d; st.disc(x, z, r, .024 + (i % 4) * .0008, cols[i % cols.length], 14); } }
};

BI.createMaerchen = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, TAU = Math.PI * 2, M = BI.MAERCHEN, L = M.at, S = () => (save.maerchen || (save.maerchen = { visit: 0, wishes: 0, talked: {}, played: 0 }));
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#6a2a7a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff6c8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  const SP = W.spots; { const g = SP.maerchenGate; sign('✨ Märchenland ✨', g.x, g.y, g.z, 13); }
  const sg = (txt, p, y, w) => sign(txt, p.x, y, p.z, w);
  sg('🏰 Schloss Sternenglanz', L(38, 0), 36, 12); sg('❄️ Frostgipfel', SP.eis, 14.5, 7); sg('🦁 Königsfels', SP.fels, 16, 7); sg('🏴‍☠️ Salzige Möwe', SP.schiff, 17, 7); sg('🧜 Perlenlagune', SP.lagune, 6, 7);
  sg('🪔 Wüsten-Basar', SP.basar, 11, 7); sg('🌴 Dschungel & Honigwald', SP.dschungel, 14, 9); sg('🧸 Spielzeug-Land', SP.spielzeug, 10, 7); sg('🎃 Gruselhügel', SP.grusel, 10, 7); sg('🏖️ Strand der Träume', SP.strand, 9, 8); sg('🤖 Roboter-Ecke', SP.roboter, 5, 6); sg('⭐ Wunschbrunnen', SP.wunsch, 7, 6); sg('🌙 Nimmerland', SP.nimmer, 20, 8); sg('🕹️ Greifer', SP.greifer, 7.4, 4);
  /* weiche eingebrannte Schatten (1 Mesh, wie auf der Hauptinsel) + Blumen & Grasbüschel (Instanzen; im Sparmodus weniger) */
  { const dx = -.83, dz = -.55, b = new BI.Batch(), C = 0x1c2a44;
    for (const [q, r, h] of M.shade) { const l = h * .5; b.disc(q.x + dx * l, q.z + dz * l, r, .075, C, 10); }
    for (const [q, w, d, h] of M.shadeR) { const l = h * .5, hw = (w + 1) / 2, hd = (d + 1) / 2; b.quad(q.x + dx * l - M.uz * hw + M.ux * hd, q.z + dz * l + M.ux * hw + M.uz * hd, q.x + dx * l + M.uz * hw + M.ux * hd, q.z + dz * l - M.ux * hw + M.uz * hd, q.x + dx * l + M.uz * hw - M.ux * hd, q.z + dz * l - M.ux * hw - M.uz * hd, q.x + dx * l - M.uz * hw - M.ux * hd, q.z + dz * l + M.ux * hw - M.uz * hd, .072, C); }
    const m = b.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .26, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); m.frustumCulled = false; m.renderOrder = 1; scene.add(m);
    let soft = false; try { const gl = G.renderer.getContext(), ex = gl.getExtension('WEBGL_debug_renderer_info'); soft = !!ex && /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(ex.UNMASKED_RENDERER_WEBGL))); } catch (e) { }
    if (!soft) { const eco = !!save.eco, rr = BI.rng(909), mt = BI.mat(), fl = new BI.Batch(), tf = new BI.Batch(); fl.cyl(0, 0, 0, .02, .02, .34, 0x3fa84e, 4); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; fl.sph(Math.sin(a) * .105, .38, Math.cos(a) * .105, .095, 0xffffff, 0, 1, .45, 1); } fl.sph(0, .405, 0, .065, 0xffd23f, 0, 1, .6, 1); for (let k = 0; k < 3; k++) tf.cone(Math.sin(k * 2.1) * .07, 0, Math.cos(k * 2.1) * .07, .09, .42 + k * .05, 0x5cc04a, 4);
      const put = (bt, n, cols) => { const im = new THREE.InstancedMesh(bt.mesh(mt).geometry, mt, n), o = new THREE.Object3D(), cl = new THREE.Color(); let c = 0; for (let t = 0; t < n * 6 && c < n; t++) { const a = rr() * TAU, d = Math.sqrt(rr()) * (M.R - 8), x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d; if (!W.free(x, z, .5) || W.groundY(x, z) > .05) continue; o.position.set(x, 0, z); o.rotation.y = rr() * 6; o.scale.setScalar(.8 + rr() * .6); o.updateMatrix(); im.setMatrixAt(c, o.matrix); if (cols) { cl.setHex(cols[c % cols.length]); im.setColorAt(c, cl); } c++; } im.count = c; im.frustumCulled = false; scene.add(im); };
      put(fl, eco ? 80 : 220, [0xffffff, 0xff8fc8, 0xffd23f, 0xb48aff, 0x7fe0ff]); put(tf, eco ? 120 : 340, null); }
  }
  const hallRoof = M.roofB.mesh(BI.mat()); hallRoof.frustumCulled = false; scene.add(hallRoof); K.hallRoof = hallRoof; M.roofB = null; const RI = M.roofIn;
  /* fliegender Teppich, Glühfeen und Schmetterlinge (instanziert), Mäuserich Willi am Tor */
  const carpet = (() => { const b = new BI.Batch(); b.box(0, 0, 0, 3.2, .12, 1.8, 0x8a2ad8); b.box(0, .12, 0, 2.8, .04, 1.4, 0xffd23f); for (const sd of [-1, 1]) b.box(sd * 1.7, 0, 0, .1, .1, 1.8, 0xffd23f); const m = b.mesh(BI.mat()), q = L(12, -40); m.position.set(q.x, 1.4, q.z); m.rotation.y = Math.atan2(M.ux, M.uz) + Math.PI / 2; scene.add(m); return m; })();
  const orbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.22, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff7b0, fog: false }), 18), dm = new THREE.Object3D(); orbs.frustumCulled = false; scene.add(orbs);
  const bfly = new THREE.InstancedMesh(new THREE.PlaneGeometry(.7, .5), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, fog: false }), 22), bf = []; bfly.frustumCulled = false; scene.add(bfly); { const rr = BI.rng(88), cl = new THREE.Color(); for (let i = 0; i < 22; i++) { bf.push({ a: rr() * 6.28, r: 4 + rr() * 16, y: 1 + rr() * 3, sp: .3 + rr() * .5, ph: rr() * 6, cx: [-42, 12, -10, 30][i % 4], cz: [0, 0, 30, -22][i % 4] }); bfly.setColorAt(i, cl.setHex([0xff5a8a, 0xffd23f, 0x7fe0ff, 0xb48aff, 0xff8a1f][i % 5])); } }
  let willi = null; try { willi = BI.makeWilli(); const g = SP.maerchenGate, p = L(-62, -7); willi.root.scale.setScalar(1.5); willi.root.position.set(p.x, 0, p.z); willi.root.rotation.y = Math.atan2(g.x - p.x, g.z - p.z) + .6; scene.add(willi.root); sign('Willi', p.x, 3.9, p.z, 3); } catch (e) { willi = null; }
  /* ---- Fee Glimmer (schwebt, streut Feenstaub), Greifer-Arm, Hilfsfunktionen ---- */
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const wingsB = () => { const b = new BI.Batch(); for (const sd of [-1, 1]) { b.box(sd * .32, 1.15, -.22, .5, .85, .04, 0xbfeaff, 0, 0, sd * .35); b.box(sd * .36, .8, -.22, .38, .5, .04, 0xffd6f0, 0, 0, sd * .5); } return b.mesh(BI.mat()); };
  const antlersB = () => { const b = new BI.Batch(); for (const sd of [-1, 1]) { b.cyl(sd * .17, 1.62, 0, .035, .05, .55, 0x6a4a2a, 5); b.cyl(sd * .3, 2.0, 0, .025, .035, .35, 0x6a4a2a, 4); b.cyl(sd * .1, 2.0, 0, .025, .035, .3, 0x6a4a2a, 4); } return b.mesh(BI.mat()); };
  let glim = null; { const gp = L(28, -19), c = BI.makeChar({ shirt: 0x6bff9a, pants: 0x35c870, hair: 0xfff3a0, skin: 0xf6d2b0, hat: 'none', style: 'bun', dress: true, scale: .4 }); c.group.position.set(gp.x, 1.8, gp.z); c.group.rotation.y = Math.atan2(L(31, -30).x - gp.x, L(31, -30).z - gp.z); c.group.add(wingsB()); const orb = new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff7b0, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); orb.position.y = .8; c.group.add(orb); scene.add(c.group); sign('✨ Fee Glimmer', gp.x, 3.9, gp.z, 5); glim = { c, x: gp.x, z: gp.z }; }
  const claw = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, .05, .05, 2, 0x555a66, 5); for (const sd of [-1, 1]) b.box(sd * .28, -.45, 0, .1, .6, .1, 0xc9ccdc, 0, 0, sd * .35); const m = b.mesh(BI.mat()), g = new THREE.Group(); g.add(m); const base = L(53, -15); g.position.set(base.x, 4.2, base.z); scene.add(g); const prize = new THREE.Mesh(new THREE.SphereGeometry(.4, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff8fc8 })); prize.position.y = -.9; prize.visible = false; g.add(prize); return { g, m, prize, st: 'idle', t: 0, base }; })();
  /* ---- Figuren (alle selbst erfunden; Tierfreunde als Kostüm-Figuren) ---- */
  K.people = function (folk) {
    const free = (x, z) => { if (W.free(x, z, .6)) return { x, z }; for (let r = 1; r <= 5; r += 1) for (let k = 0; k < 12; k++) { const g = k / 12 * TAU + r, qx = x + Math.sin(g) * r, qz = z + Math.cos(g) * r; if (W.free(qx, qz, .6)) return { x: qx, z: qz }; } return { x, z }; }; /* steht etwas im Weg, rückt die Figur ein Stück beiseite */
    const mk = (a, b, look, name, lines, face) => { const p = free(L(a, b).x, L(a, b).z), c = BI.makeChar(look), f = face ? L(face[0], face[1]) : L(-42, 0), h = Math.atan2(f.x - p.x, f.z - p.z); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const SK = { fair: 0xf6d2b0, tan: 0xd8a070, dark: 0x8a5a33, green: 0x7fe05a, teal: 0x5ad0a0, blue: 0x5aa8ff, white: 0xf6f6f6 };
    /* Schloss & Garten */
    mk(43, 4, { shirt: 0xc23a8a, pants: 0xffd23f, hair: 0xe8e8f0, skin: SK.fair, hat: 'crown', style: 'long', dress: true, scale: 1.05 }, 'Königin Aurelia', ['Willkommen in meinem Thronsaal! 👑', 'Setz dich ruhig auf den Thron – er gehört heute dir.', 'Die goldenen Säulen tragen das ganze Dach.', 'Draußen im Garten wartet Prinzessin Lilia. ✨'], [29, 0]);
    mk(24, 5, { shirt: 0x6ad0ff, pants: 0xffffff, hair: 0xf7e08a, skin: SK.fair, hat: 'crown', style: 'long', dress: true, scale: 1.0 }, 'Prinzessin Lilia', ['Hallo, ich bin Lilia! Willkommen im Märchenland. ✨', 'Mein Schloss heißt Sternenglanz. Es funkelt jede Nacht.', 'Besuche meine Freunde auf der ganzen Insel!', 'Wünsch dir etwas am Wunschbrunnen! ⭐']);
    /* Eisreich */
    mk(-4, -44, { shirt: 0xcfeeff, pants: 0xe8f6ff, hair: 0xf2f8ff, skin: SK.white, hat: 'none', style: 'long', dress: true, scale: 1.0 }, 'Eisfee Frida', ['Brr, schön kühl hier! ❄️', 'Aus meinen Händen wird Eis. Schau, wie es glitzert!', 'Steig auf den Eisberg, da oben sieht man alles.'], [-10, -52]);
    mk(-2, -40, { shirt: 0xb48aff, pants: 0xe8f6ff, hair: 0xe0a070, skin: SK.fair, hat: 'none', style: 'braids', dress: true, scale: .9 }, 'Anni, die Eisfee-Schwester', ['Meine Schwester Frida friert nie. Ich schon! 🧣', 'Willst du mit mir Schneebälle bauen?'], [-10, -52]);
    mk(-17, -37, { shirt: 0xffffff, pants: 0xffffff, hair: 0x555555, skin: 0xffffff, hat: 'cap', style: 'short', scale: .8 }, 'Olli der Schneemann', ['Hallo! Ich bin Olli. Ich schmelze nie. Fast nie. ⛄', 'Hast du eine Möhre für mich?'], [-10, -45]);
    /* Königsfels & Savanne */
    mk(-4, 46, { shirt: 0xe8453c, pants: 0x5a3a1a, hair: 0xe0a030, skin: SK.tan, hat: 'cat', style: 'curly', cape: true, scale: 1.12 }, 'Löwenkönig Leo', ['Ich bin Leo, der König vom Königsfels! Rooaar! 🦁', 'Ein König beschützt seine Freunde.', 'Klettere auf den Felsen – oben wartet die Sonne!'], [-10, 52]);
    mk(0, 42, { shirt: 0xf0b040, pants: 0x8a5a2a, hair: 0xe0a030, skin: SK.tan, hat: 'cat', style: 'short', scale: .6 }, 'Löwenkind Samu', ['Ich bin Samu! Ich will auch mal König werden. 🦁', 'Fang mich doch!'], [-10, 52]);
    mk(1, 45, { shirt: 0xf6c860, pants: 0x8a5a2a, hair: 0xd09030, skin: SK.tan, hat: 'cat', style: 'braids', dress: true, scale: .58 }, 'Löwenmädchen Jara', ['Samu ist so frech! Aber wir sind beste Freunde.', 'Wollen wir Verstecken spielen?'], [-10, 52]);
    mk(-9, 38, { shirt: 0x8a5a3a, pants: 0x6a4a2a, hair: 0x7a4a3a, skin: 0xe0a08a, hat: 'none', style: 'pig', scale: 1.1 }, 'Warzel das Wildschwein', ['Grunz! Ich bin Warzel. Ich esse gern Käfer. 🐗', 'Schmeckt wie Schokolade, ehrlich!'], [-10, 52]);
    mk(-6, 37, { shirt: 0xc89a5a, pants: 0x8a6a3a, hair: 0x8a6a3a, skin: SK.tan, hat: 'bear', style: 'short', scale: .5 }, 'Erdi das Erdmännchen', ['Ich halte Wache! Ich sehe alles. 👀', 'Da hinten kommt jemand… ach, du bist es.'], [-10, 52]);
    /* Piratenbucht */
    mk(-44, -30, { shirt: 0xc23a3a, pants: 0x2a2a3a, hair: 0x222222, skin: SK.tan, hat: 'pirate', style: 'short', beard: 5, beardc: 0x222222, scale: 1.05 }, "Käpt'n Kralle", ['Ahoi! Ich bin Käpt\'n Kralle. 🏴‍☠️', 'Geh über die Planke auf mein Schiff Salzige Möwe!', 'Oben im Mast ist die Flagge. Und im Fass? Ein Schatz!'], [-44, -42]);
    /* Lagune */
    mk(-46, 27, { shirt: 0x35d6e0, pants: 0x2fa8b8, hair: 0xe8453c, skin: SK.fair, hat: 'none', style: 'long', dress: true, scale: .96 }, 'Meerjungfrau Marina', ['Blubb! Ich bin Marina. 🧜', 'In der Lagune finde ich Perlen und Muscheln.', 'Hinten rauscht ein Wasserfall. Hör mal!'], [-46, 38]);
    /* Wüsten-Basar */
    mk(10, -34, { shirt: 0x8a2ad8, pants: 0xffe08a, hair: 0x222222, skin: 0xc89060, hat: 'party', style: 'short', beard: 3, beardc: 0x222222, scale: 1.0 }, 'Teppich-Tom', ['Willkommen im Basar! Mein Teppich kann fliegen. ✨', 'Schau, er schwebt ganz von allein!'], [12, -40]);
    mk(15, -37, { shirt: 0x35d6e0, pants: 0x2a8a9a, hair: 0x111111, skin: 0xc89060, hat: 'none', style: 'long', dress: true, scale: .98 }, 'Prinzessin Jasra', ['Ich bin Jasra. Der Basar ist mein Lieblingsplatz. 🌙', 'Hast du schon den Wunschgeist gesehen?'], [12, -40]);
    mk(20, -43, { shirt: 0x4aa8ff, pants: 0x2a6ad8, hair: 0x1a3a8a, skin: SK.blue, hat: 'party', style: 'bun', cape: true, scale: 2.1 }, 'Wunschgeist Dschinni', ['Huuuh! Ich bin Dschinni, der Wunschgeist! ✨', 'Du hast einen Wunsch frei – aber nur einen kleinen!', 'Tipp: Wünsch dir Sterne am Wunschbrunnen.'], [12, -40]);
    /* Honigwald & Dschungel */
    mk(8, 36, { shirt: 0xe0a060, pants: 0x8a5a33, hair: 0x6b4a2a, skin: 0xc8905a, hat: 'bear', style: 'short', scale: 1.15 }, 'Bär Bruno', ['Brumm! Ich bin Bruno der Bär. 🐻', 'Ich esse am liebsten Honig.', 'Im Dschungel gibt es leckere Beeren.'], [12, 44]);
    mk(14, 38, { shirt: 0xf09a30, pants: 0xe8453c, hair: 0xe0a030, skin: 0xe0b050, hat: 'bear', style: 'short', scale: .85 }, 'Honigbär Brummi', ['Hast du Honig dabei? Ich hab immer Hunger! 🍯', 'Schau, die Töpfe da. Alle für mich!'], [12, 44]);
    mk(18, 42, { shirt: 0xf08a1f, pants: 0x222222, hair: 0xf08a1f, skin: 0xf0b060, hat: 'cat', style: 'curly', scale: .8 }, 'Hüpf-Tiger Tiggo', ['Boing! Ich bin Tiggo und hüpfe überall! 🐯', 'Hüpf mit mir!'], [12, 44]);
    mk(10, 42, { shirt: 0xff9ac0, pants: 0xff9ac0, hair: 0xffb0c8, skin: 0xffc0d0, hat: 'none', style: 'pig', scale: .55 }, 'Ferkel Pinky', ['Ich bin ganz klein, aber mutig! 🐷', 'Naja… ein bisschen mutig.'], [12, 44]);
    mk(6, 45, { shirt: 0x8a8a96, pants: 0x6a6a76, hair: 0x7a7a86, skin: 0x9a9aa6, hat: 'bunny', style: 'short', scale: .9 }, 'Esel Grauchen', ['Ach ja… heute ist wieder ein grauer Tag. 😌', 'Aber mit dir wird er bunt, danke!'], [12, 44]);
    /* Spielzeug-Land */
    mk(46, -24, { shirt: 0xc8803c, pants: 0x1f3d8f, hair: 0x6b4a2a, skin: SK.fair, hat: 'cowboy', style: 'braids', dress: false, scale: 1.0 }, 'Sheriff Wilma', ['Howdy! Ich bin Sheriff Wilma, ein Spielzeug! 🤠', 'Nachts, wenn keiner guckt, werden wir lebendig.'], [52, -30]);
    mk(50, -21, { shirt: 0xf6f6f6, pants: 0x5ad07a, hair: 0x333333, skin: SK.fair, hat: 'helmet', style: 'short', scale: 1.05 }, 'Raumfahrer Rex', ['Zum Mond und noch viel weiter! 🚀', 'Ich bin ein Spielzeug-Raumfahrer. Fast ein echter!'], [52, -30]);
    mk(55, -26, { shirt: 0x7fe05a, pants: 0x5ad07a, hair: 0x5ad07a, skin: SK.green, hat: 'goggles', style: 'short', scale: .55 }, 'Quietschi', ['Quiiiiek! Der Greifer ruft uns! 👽', 'Wir sind Spielzeug-Außerirdische.'], [52, -30]);
    mk(57, -28, { shirt: 0x6ae080, pants: 0x4ac86a, hair: 0x4ac86a, skin: SK.green, hat: 'goggles', style: 'short', scale: .5 }, 'Quietschi Zwei', ['Quiek quiek! Wir lieben den Greifer! 👽'], [52, -30]);
    /* Gruselhügel */
    mk(46, 24, { shirt: 0x1a1a22, pants: 0x1a1a22, hair: 0xf4f4f4, skin: 0xf4f4f4, hat: 'none', style: 'short', scale: 1.15 }, 'Knochi das Skelett', ['Klapper klapper! Ich bin Knochi. 💀', 'Keine Angst, ich bin ganz lieb! Nur ein bisschen knochig.'], [52, 30]);
    mk(50, 22, { shirt: 0x5a2a8a, pants: 0x3a1a5a, hair: 0x2a1a3a, skin: 0xa8d8a0, hat: 'cat', style: 'long', dress: true, cape: true, scale: 1.1 }, 'Dunkelfee Morgana', ['Muhaha! Ich bin Morgana, die Dunkelfee. 🦇', 'Eigentlich bin ich gar nicht böse. Ich mag nur Lila.'], [52, 30]);
    /* Strand & Roboter */
    /* Neu: Elch im Eisreich, Nimmerland (Pit, Tick-Tack) */
    { const n = mk(-3, -40, { shirt: 0xb08050, pants: 0x6a4a2a, hair: 0x6a4a2a, skin: 0x9a6a3a, hat: 'bunny', style: 'short', scale: 1.15 }, 'Elch Fridolin', ['Mmmh, Schnee! Mein Lieblingsessen. 🫎', 'Ich trage die Frostfeen über den Eisberg.', 'Mein Geweih ist ganz echt, schau!'], [-10, -52]); n.c.group.add(antlersB()); }
    mk(31, -17, { shirt: 0x3fae4a, pants: 0x6a4a2a, hair: 0xc8501a, skin: SK.fair, hat: 'cap', style: 'short', scale: .92 }, 'Pit, der fliegende Junge', ['Juhu! Ich bin Pit und ich kann fliegen! 🌙', 'Fee Glimmer gibt dir Feenstaub – dann fliegst du mit mir!', 'Mein Versteck ist oben auf dem Mondhügel.'], [31, -30]);
    mk(36, -37, { shirt: 0x4cb85a, pants: 0x3a8a4a, hair: 0x3a8a4a, skin: 0x7fd060, hat: 'none', style: 'short', scale: 1.1 }, 'Krokodil Tick-Tack', ['Tick-tack, tick-tack! Ich habe eine Uhr verschluckt. ⏰', 'Keine Sorge, ich beiße nicht. Ich esse nur Kekse! 🍪', 'Hör mal, wie es in meinem Bauch tickt!'], [38, -41]);
    mk(60, -13, { shirt: 0xe8453c, pants: 0xe8453c, hair: 0x1a1a1a, skin: SK.dark, hat: 'none', style: 'long', dress: true, scale: .9 }, 'Mali vom Strand', ['Aloha! Ich bin Mali. 🌺', 'Pico spielt so schön auf der Ukulele!'], [64, -12]);
    mk(62, -10, { shirt: 0x5ad0a0, pants: 0x35a07a, hair: 0x35a07a, skin: SK.teal, hat: 'bunny', style: 'short', scale: .62 }, 'Pico, der kleine Außerirdische', ['Ich bin Pico! Ich komme von ganz weit weg. 🛸', 'Auf der Insel ist es so schön, ich bleibe hier!'], [64, -12]);
    mk(60, 8, { shirt: 0xc9a227, pants: 0x8a8a96, hair: 0x555555, skin: 0xb0b0b8, hat: 'goggles', style: 'short', scale: .85 }, 'Rolli, der Müllroboter', ['Piep. Ich sammle Müll und finde Schätze. 🤖', 'Schau, ich habe eine kleine Pflanze gefunden!'], [63, 10]);
    mk(66, 12, { shirt: 0xffffff, pants: 0xffffff, hair: 0xf0f0f0, skin: 0xffffff, hat: 'none', style: 'short', scale: 1.3 }, 'Pummel, der Pflege-Roboter', ['Ich bin Pummel und mache dich wieder heile! 🩹', 'Ein Pflaster, ein Lächeln – und alles ist gut.'], [63, 10]);
  };
  /* Nähe / Aktion: Wunschbrunnen */
  const nr = (o, r) => Math.hypot(P.x - o.x, P.z - o.z) < r;
  K.near = function () {
    if (P.veh || P.y > 6) return null; if (nr(SP.wunsch, 6.2)) return { k: 'mwish' };
    if (glim && nr(glim, 3.8) && P.y < 3) return { k: 'mdust', label: ['✨', S().flew ? 'Feenstaub streuen' : 'Fee Glimmer: Feenstaub (Fliegen!)'] };
    if (nr(SP.greifer, 3.6) && claw.st === 'idle') return { k: 'mclaw', label: ['🕹️', 'Greifer spielen'] };
    if (nr(SP.uku, 2.8)) return { k: 'muku', label: ['🎶', 'Ukulele spielen'] };
    if (nr(SP.thronSeat, 2.6)) return { k: 'mthron', label: ['👑', 'Auf dem Thron sitzen'] };
    return null;
  };
  K.act = function (n) {
    if (n && n.k === 'mdust') { const s = S(); if (!s.flew) { s.flew = 1; persist(); G.addStars(1); say('✨ Glimmer streut Feenstaub über dich: Du kannst fliegen! +1 ⭐', 4200); } else say('✨ Feenstaub! Du schwebst …', 2200); A.speak && A.speak('Feenstaub! Du kannst fliegen!'); flyT = 14; fx.burst(P.x, 1.6, P.z, 40, [[1, .95, .5], [1, 1, 1], [.7, 1, .8]], 4, 1.4, 30, 2); [784, 988, 1175, 1568].forEach((f, i) => note(f, .5, 'sine', .1, i * .09)); return; }
    if (n && n.k === 'mclaw') { claw.st = 'down'; claw.t = 0; claw.prize.visible = false; say('🕹️ Der Greifer fährt hinunter …', 1600); note(330, .8, 'triangle', .08); return; }
    if (n && n.k === 'mthron') { const s = S(); A.fanfare && A.fanfare(); fx.burst(SP.thronSeat.x, 2.5, SP.thronSeat.z, 30, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 4, 1.4, 30, 3); if (!s.throne) { s.throne = 1; persist(); G.addStars(1); say('👑 Du sitzt auf dem Thron! Alle jubeln. +1 ⭐', 4200); } else say('👑 Eure Majestät!', 2200); return; }
    if (n && n.k === 'muku') { const s = S(); [392, 440, 523, 659, 523, 440, 392, 330, 392, 523].forEach((f, i) => note(f, .32, 'triangle', .12, i * .26)); fx.burst(SP.uku.x, 2.2, SP.uku.z, 14, [[1, .9, .5], [1, .6, .8]], 2.4, 1, 28, 3); say('🎶 Plink plonk! Die Ukulele klingt wie Urlaub.', 3200); if (!s.uku) { s.uku = 1; persist(); G.addStars(1); say('🎶 Die Ukulele klingt wie Urlaub! +1 ⭐', 3600); } return; }
    if (!n || n.k !== 'mwish') return; const s = S(), w = SP.wunsch; s.wishes++; fx.burst(w.x, 4.4, w.z, 30, [[1, .9, .5], [1, 1, 1], [1, .6, .9], [.5, .8, 1]], 5, 1.4, 28, -1); A.star && A.star();
    if (s.wishes <= 3) { G.addStars(1); say('⭐ Dein Wunsch wurde gehört! +1 ⭐', 3200); } else say('✨ Dein Wunsch glitzert in den Sternen.', 2600); A.speak && A.speak('Dein Wunsch wurde gehört.'); persist();
  };
  let was = false, fireT = 4, flyT = 0;
  K.update = function (dt, t) {
    const raw = Math.min(dt, .25);
    /* Feenstaub: 14 Sekunden schweben (Höhe ≈ 6 m über dem Boden), mit Glitzerspur */
    if (flyT > 0 && !P.veh) { flyT -= raw; const gy = W.groundY(P.x, P.z), ty = gy + 6; P.vy = Math.max(-3, Math.min(4.6, (ty - P.y) * 2.6)); if (Math.random() < raw * 18) fx.emit(P.x + (Math.random() - .5), P.y + .2, P.z + (Math.random() - .5), 0, -.4, 0, .9, 22, .6, .9, 1, -.4, .8); if (flyT <= 0) say('✨ Der Feenstaub ist verbraucht – gleite sanft nach unten!', 2400); }
    if (glim) { glim.c.group.position.y = 1.8 + Math.sin(t * 2) * .25; if (Math.random() < raw * 3 && Math.hypot(P.x - glim.x, P.z - glim.z) < 60) fx.emit(glim.x + (Math.random() - .5) * .8, 1.6, glim.z + (Math.random() - .5) * .8, 0, -.3, 0, 1.2, 20, .6, .95, .7, -.2, .6); }
    if (claw.st !== 'idle') { claw.t += raw; const g = claw.g, gx = Math.sin(claw.t * 2) * .4;
      if (claw.st === 'down') { g.position.y = 4.2 - Math.min(1, claw.t / .9) * 2.4; if (claw.t > 1.2) { claw.st = 'up'; claw.t = 0; claw.prize.material.color.setHex([0xff8fc8, 0x7fe05a, 0x4da3ff, 0xffd23f, 0xb48aff][(Math.random() * 5) | 0]); claw.prize.visible = true; note(660, .3, 'sine', .1); } }
      else if (claw.st === 'up') { g.position.y = 1.8 + Math.min(1, claw.t / .9) * 2.4; if (claw.t > 1.1) { claw.st = 'show'; claw.t = 0; const s = S(); s.claw = (s.claw || 0) + 1; const names = ['🧸 Teddy', '🚀 Rakete', '🐻 Bär', '👽 Quietschi', '🤖 Roboter', '⭐ Stern']; const nm = names[(Math.random() * names.length) | 0]; if (s.claw <= 5) { G.addStars(1); say('🕹️ Gewonnen: ' + nm + '! +1 ⭐ (' + s.claw + '/5)', 3200); } else say('🕹️ Gewonnen: ' + nm + '! Schön!', 2600); persist(); A.star && A.star(); fx.burst(claw.base.x, 3, claw.base.z, 14, [[1, .9, .5], [1, .6, .8], [.5, .9, 1]], 3, 1, 28, 3); } }
      else if (claw.st === 'show') { if (claw.t > 1.2) { claw.st = 'idle'; claw.prize.visible = false; g.position.y = 4.2; } } }
    const d0 = Math.hypot(P.x - M.x, P.z - M.z), ins = d0 < M.R + 12; { const lp = M.loc(P.x, P.z), inHall = !P.veh && P.y < 4 && lp.a > RI.a0 && lp.a < RI.a1 && lp.b > RI.b0 && lp.b < RI.b1; if (hallRoof.visible === inHall) hallRoof.visible = !inHall; }
    if (ins !== was) { was = ins; if (ins) { const s = S(); if (!s.visit) { s.visit = 1; persist(); G.addStars(1); say('✨ Willkommen im Märchenland! +1 ⭐', 3600); } else say('✨ Märchenland', 2000); } }
    const near = d0 < 280; orbs.visible = carpet.visible = bfly.visible = near; if (!near) return;
    const cq = L(12, -40); carpet.position.set(cq.x, 1.4 + Math.sin(t * 1.6) * .35, cq.z); carpet.rotation.z = Math.sin(t * 1.1) * .06; const cp = L(38, 0);
    for (let i = 0; i < 18; i++) { const a = t * .35 + i * .35, r = 14 + (i % 4) * 3.2, y = 7 + Math.sin(t * 1.3 + i) * 2 + (i % 5) * 2.4; dm.position.set(cp.x + Math.sin(a) * r, y, cp.z + Math.cos(a) * r); dm.scale.setScalar(.8 + .3 * Math.sin(t * 4 + i)); dm.rotation.set(0, 0, 0); dm.updateMatrix(); orbs.setMatrixAt(i, dm.matrix); } orbs.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < bf.length; i++) { const q = bf[i], c0 = L(q.cx, q.cz), a = q.a + t * q.sp; dm.position.set(c0.x + Math.sin(a) * q.r, q.y + Math.sin(t * 2 + q.ph) * .5, c0.z + Math.cos(a * 1.3) * q.r); dm.rotation.set(Math.PI / 2 + .3, a, 0); dm.scale.set(.4 + Math.abs(Math.sin(t * 9 + q.ph)) * .8, 1, 1); dm.updateMatrix(); bfly.setMatrixAt(i, dm.matrix); } bfly.instanceMatrix.needsUpdate = true;
    if (ins) { fireT -= dt; if (fireT <= 0) { fireT = 7 + Math.random() * 5; const x = cp.x + (Math.random() - .5) * 20, z = cp.z + (Math.random() - .5) * 20, cols = [[[1, .8, .3], [1, 1, 1]], [[1, .4, .7], [1, 1, 1]], [[.4, .8, 1], [1, 1, 1]]][(Math.random() * 3) | 0]; fx.burst(x, 46 + Math.random() * 8, z, 36, cols, 7, 1.6, 34, 3); A.pop && A.pop(); } }
    if (G.mini && G.mini().active && G.mini().kind === 'sterne_maerchen') { const s = S(); if (!s.played) { s.played = 1; persist(); } }
  };
  K.log = () => { const s = S(); return { title: '✨ Märchenland', count: ((s.visit ? 1 : 0) + Math.min(3, s.wishes) + (s.played ? 1 : 0) + (s.flew ? 1 : 0) + (s.uku ? 1 : 0) + (s.throne ? 1 : 0) + ((s.claw || 0) >= 1 ? 1 : 0)) + ' von 9', rows: [
    { ok: !!s.visit, icon: '🏰', text: 'Märchenland besuchen (Brücke im Nordwesten)', dest: 'maerchen' },
    { ok: s.wishes >= 1, icon: '⭐', text: 'Am Wunschbrunnen einen Wunsch tun: ' + Math.min(3, s.wishes) + ' von 3 (je +1 ⭐)', dest: 'maerchen' },
    { ok: !!s.played, icon: '🌠', text: 'Sternschnuppen am Spielautomaten fangen', dest: 'maerchen' },
    { ok: !!s.flew, icon: '🧚', text: 'Von Fee Glimmer Feenstaub holen und fliegen (Nimmerland)', dest: 'nimmer' },
    { ok: (s.claw || 0) >= 1, icon: '🕹️', text: 'Am Greifer im Spielzeug-Land etwas gewinnen: ' + Math.min(5, s.claw || 0) + ' von 5 (je +1 ⭐)', dest: 'spielzeug' },
    { ok: !!s.uku, icon: '🎶', text: 'Am Strand die Ukulele spielen', dest: 'strand' },
    { ok: !!s.throne, icon: '👑', text: 'Im Schloss auf dem Thron sitzen', dest: 'schloss' }] }; };
  return K;
};

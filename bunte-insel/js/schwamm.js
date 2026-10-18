'use strict';
/* Bunte Insel – Schwammi-Bucht 🧽🦀 (Erweiterung): eine fröhliche Unterwasser-Stadt-Insel im hohen Norden, INSPIRIERT von der Stimmung großer Trickfilm-Serien über einen Schwamm am Meeresgrund –
   aber mit ganz EIGENEN, selbst erfundenen Namen und Formen (Schwammi, Sternchen, Tadeus Tintenfuß, Eichhörnchen Sunny, Käpt'n Zangenfuß, Winzling Plankto, Schneckerich …).
   Highlights: das Restaurant „Die Knusper-Krabbe“ (wirklich essen: Menü, Tisch, Mitnehmen), Burger selber braten (Mini-Spiel am Grill), Quallenfischen (Kescher),
   Schwammis Fruchthaus mit Türklingel und Schneckerich, Sternchens Stein, Tadeus' Steinkopf mit Klarinette, Sunnys Luftkuppel mit Karate-Puppe, das Eimerchen von Winzling Plankto
   und das Wannen-Mobil von Meeresmann & Napfschnecken-Bub (fahrbar, kehrt nach dem Aussteigen an seinen Platz zurück). Lokale Koordinaten (a, b): a = Richtung Inselmitte (weg von der Brücke), b = quer dazu. */
BI.SCHWAMM = (function () {
  const R = 82, cx = 150, cz = -470, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Schwammi-Bucht
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) }, hills: [], rects: [],
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
})();
BI.SCHWAMM.at = function (a, b) { const M = BI.SCHWAMM; return { x: M.x + M.ux * a - M.uz * b, z: M.z + M.uz * a + M.ux * b }; };
BI.SCHWAMM.loc = function (x, z) { const M = BI.SCHWAMM, dx = x - M.x, dz = z - M.z; return { a: dx * M.ux + dz * M.uz, b: -dx * M.uz + dz * M.ux }; };
/* Restaurant „Die Knusper-Krabbe“ (lokal): Grundriss, Tische/Hocker, Kasse, Grill */
BI.SCHWAMM.KK = { a0: -25, a1: -1, b0: -44, b1: -18, door: [-16, -8], tables: [[-21, -30], [-21, -23.5], [-3.5, -30], [-3.5, -23.5], [-12.5, -31.5]], kasse: [-18.5, -35.6], grill: [-6, -36.4] };
BI.SCHWAMM.DISHES = [['burger', '🍔', 'Krabbenburger', 2, 'krabbenburger'], ['shake', '🥤', 'Quallen-Shake', 1, 'quallenshake'], ['pommes', '🍟', 'Algen-Pommes', 1, 'pommes'], ['salat', '🥗', 'Seetang-Salat', 1, 'seetang'], ['eis', '🍦', 'Muschel-Eis', 1, 'icecream']];
/* Quallenfeld (Mitte a,b und Radius) */
BI.SCHWAMM.FIELD = { a: 48, b: 24, r: 13 };

BI.buildSchwammGround = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.SCHWAMM, TAU = Math.PI * 2, rn = BI.rng(5151), L = M.at, ry = Math.atan2(M.ux, M.uz), KK = M.KK;
  W.spots.schwamm = { x: M.entry.x, z: M.entry.z }; W.schwamm = M; M.shade = [];
  st.disc(M.x, M.z, M.R + 9, 0, 0xf2dfa8, 96); st.ring(M.x, M.z, M.R - 5, M.R + 9, .012, 0xfff2c8, 96); BI.buildIsleBridge(c, M);
  /* ---- Helfer ---- */
  const bx = (a, b, wb, h, da, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, wb, h, da, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const cone = (a, b, r, h, col, y0, seg) => { const p = L(a, b); st.cone(p.x, y0 || 0, p.z, r, h, col, seg || 8); return p; };
  const sph = (a, b, y, r, col, sy, sx) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, sx || 1, sy || 1, sx || 1); return p; };
  const glow = (a, b, y, r, col) => { const p = L(a, b); lamp.sph(p.x, y, p.z, r, col, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const path = (a0, b0, a1, b1, w, col) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), q0 = L(a0, b0), q1 = L(a1, b1); st.strip(p.x, p.z, w, Math.hypot(a1 - a0, b1 - b0), Math.atan2(q1.x - q0.x, q1.z - q0.z), ROADY, col || 0xf0e0b0); };
  const wallC = (a0, b0, a1, b1) => { const n = Math.max(1, Math.round(Math.hypot(a1 - a0, b1 - b0) / 1.1)); for (let i = 0; i <= n; i++) solid(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n, .8, 6); };
  const zone = (a, b, r, col, y) => { const p = L(a, b); st.disc(p.x, p.z, r, y || ROADY + .004, col, 40); };
  const kelp = (a, b, h, col) => { const q = L(a, b); for (let k = 0; k < 4; k++) st.box(q.x + Math.sin(k * 1.3) * .35, k * h / 4, q.z + Math.cos(k * 1.3) * .35, .5, h / 4 + .1, .12, col, ry + k * .6, 0, Math.sin(k * 1.3) * .25); solid(a, b, .5, 3); };
  const coral = (a, b, s, col) => { const q = L(a, b); for (let k = 0; k < 5; k++) { const g = k * 1.26; st.cone(q.x + Math.sin(g) * .5 * s, 0, q.z + Math.cos(g) * .5 * s, .26 * s, (1.2 + (k % 3) * .5) * s, col, 5); } solid(a, b, .8 * s, 2); };
  /* ---- Wege, Plaza mit Seestern-Brunnen, Quallen-Laternen ---- */
  path(-70, 0, 58, 0, 7); path(-12, 0, -12, -17.5, 5); path(14, -8, 14, -26, 3.6); path(26, -8, 26, -26, 3.2); path(38, -8, 38, -26, 3.2); path(22, 8, 22, 28, 3.6); path(-14, 8, -14, 28, 3.6); path(-44, 8, -44, 26, 3.6); path(46, 8, 48, 18, 3.6);
  { zone(-44, 0, 12, 0xfff2c8); const p = L(-44, 0); st.ring(p.x, p.z, 9, 10, ROADY + .02, 0xff8fb8, 40); st.ring(p.x, p.z, 5, 5.8, ROADY + .02, 0x5fd0e0, 40);
    cyl(-44, 0, 3.6, 3.9, .9, 0xf6e6c0, 0, 20); cyl(-44, 0, 3.2, 3.2, .1, 0x5fd0e0, .9, 20); cyl(-44, 0, .5, .8, 2.2, 0xff8fb8, .9, 8); for (let k = 0; k < 5; k++) { const g = k / 5 * TAU; cone(-44 + Math.sin(g) * 1.3, Math.cos(g) * 1.3, .45, 1.6, 0xff8fb8, 3.0, 4); } glow(-44, 0, 5.1, .5, 0xfff7b0); solid(-44, 0, 3.9, 1.2); W.spots.sw_brunnen = L(-44, 0); }
  for (let a = -62; a <= 54; a += 9) for (const sd of [-1, 1]) { cyl(a, sd * 5.2, .07, .09, 3.4, 0x6a7a8a, 0, 6); const col = [0xff8fc8, 0x7fe0ff, 0xffe27a, 0xb48aff][(Math.abs(a) / 9 | 0) % 4]; glow(a, sd * 5.2, 3.9, .5, col); const q = L(a, sd * 5.2); for (let k = 0; k < 3; k++) st.cone(q.x + Math.sin(k * 2.1) * .25, 2.9, q.z + Math.cos(k * 2.1) * .25, .1, .6, col, 4); }
  /* ---- Eingangsbogen: zwei riesige Muscheln mit Blasenring ---- */
  for (const sd of [-1, 1]) { cyl(-63, sd * 6, 1.6, 1.9, 1.2, 0xf6e6c0, 0, 12); sph(-63, sd * 6, 3.8, 2.4, 0xff9ac8, 1.5); for (let k = 0; k < 5; k++) cone(-63 + (k - 2) * .6, sd * 6 - 1.8 * sd, .3, 4.4, 0xffd0e4, 1.4, 4); solid(-63, sd * 6, 2.2, 7); }
  for (let k = -5; k <= 5; k++) { const y = 8.2 - Math.abs(k) * .22; sph(-63, k * 1.1, y, .55 + (k % 2) * .15, [0x8fe8ff, 0xffffff][k & 1 ? 1 : 0]); }
  { const e = L(-63, 0); W.spots.swGate = { x: e.x, y: 11, z: e.z }; }
  /* ---- Restaurant „Die Knusper-Krabbe“: Schiffsrumpf-Optik, Bullaugen, Krabbenscheren, innen Tische, Theke, Grill ---- */
  { const rb = M.roofB = new BI.Batch(), rbx = (a, b, wb, h, da, col, y0, yaw) => { const q = L(a, b); rb.box(q.x, y0 || 0, q.z, wb, h, da, col, ry + (yaw || 0)); }, H = 6, T = .7, HULL = 0x9a5a2a, PLK = 0xb67a3e, RED = 0xe0382b;
    const wl = (a0, b0, a1, b1) => { bx((a0 + a1) / 2, (b0 + b1) / 2, b1 - b0, H, a1 - a0, HULL); wallC(a0, b0, a1, b1); };
    wl(KK.a0, KK.b0, KK.a1, KK.b0 + T); wl(KK.a0, KK.b0, KK.a0 + T, KK.b1); wl(KK.a1 - T, KK.b0, KK.a1, KK.b1); wl(KK.a0, KK.b1 - T, KK.door[0], KK.b1); wl(KK.door[1], KK.b1 - T, KK.a1, KK.b1);
    for (const y of [1.2, 2.4, 3.6, 4.8]) { bx((KK.a0 + KK.a1) / 2, KK.b1 + .08, KK.b1 - KK.b1 + .2, .16, KK.a1 - KK.a0 + .4, PLK, y); bx((KK.a0 + KK.a1) / 2, KK.b0 - .08 + T, .2, .16, KK.a1 - KK.a0 + .4, PLK, y); }
    for (const a of [-22.5, -19.5, -4, -1.8]) { const q = L(a, KK.b1 + .15); lamp.box(q.x, 3.2, q.z, .9, .9, .1, 0xffe9a0, ry); bx(a, KK.b1 + .1, 1.2, 1.2, .12, 0xe8d8b0, 2.9); }
    bx((KK.a0 + KK.a1) / 2, (KK.b0 + KK.b1) / 2, KK.b1 - KK.b0 - 1, .08, KK.a1 - KK.a0 - 1, 0xd9a868, 0);
    /* Dach (eigenes Mesh) mit Krabbenscheren und Schiffsmast */
    rbx((KK.a0 + KK.a1) / 2, (KK.b0 + KK.b1) / 2, KK.b1 - KK.b0 + 1, .8, KK.a1 - KK.a0 + 1, RED, H); rbx((KK.a0 + KK.a1) / 2, (KK.b0 + KK.b1) / 2, KK.b1 - KK.b0 - 1, .5, KK.a1 - KK.a0 - 1, 0xff6a4a, H + .8);
    for (const sd of [-1, 1]) { const q = L((KK.a0 + KK.a1) / 2 + sd * 7, KK.b1 - 3); rb.sph(q.x, H + 3.4, q.z, 2.2, RED, 1, 1, 1.15, .8); rb.cyl(q.x, H + .8, q.z, .9, 1.2, 2, RED, 8); const q2 = L((KK.a0 + KK.a1) / 2 + sd * 7 + sd * 1.8, KK.b1 - 3); rb.cone(q2.x, H + 3.2, q2.z, .9, 2.4, 0xff6a4a, 5); }
    { const q = L((KK.a0 + KK.a1) / 2, (KK.b0 + KK.b1) / 2 + 3); rb.cyl(q.x, H + 1.3, q.z, .22, .3, 8, 0x6a3a1a, 6); rb.box(q.x, H + 7.2, q.z, 4.4, 3.6, .12, 0xfff3d6, ry + Math.PI / 2); rb.sph(q.x, H + 9.4, q.z, .35, GOLD(), 1); }
    /* Steuerrad + Rettungsringe am Eingang, Treppe */
    { const q = L(-12, KK.b1 + .5); st.cyl(q.x, 3.6, q.z, 1.1, 1.1, .12, 0x6a3a1a, 12, Math.PI / 2, ry); st.cyl(q.x, 3.6, q.z, .3, .3, .3, 0xffd23f, 8, Math.PI / 2, ry); }
    for (const sd of [-1, 1]) { const q = L(-12 + sd * 5.6, KK.b1 + .3); st.cyl(q.x, 2.4, q.z, .8, .8, .2, 0xffffff, 12, Math.PI / 2, ry); st.cyl(q.x, 2.42, q.z, .55, .55, .22, RED, 12, Math.PI / 2, ry); }
    path(-12, KK.b1, -12, KK.b1 + 5, 9, 0xd9a868);
    /* Innen: Theke, Kasse, Grill, Tische mit Hockern, Speisekarte */
    bx(-12, -39, 1.6, 1.15, 20, 0xc98f55); bx(-12, -39, 2, .12, 20.4, 0xf6e6c0, 1.15); wallC(-22, -39, -2, -39);
    { const k = KK.kasse, q = L(k[0], -39); st.box(q.x, 1.27, q.z, 1, .6, .8, 0x4a505c, ry); st.box(q.x, 1.87, q.z, .7, .4, .1, 0x9fe3ff, ry); }
    { const g = KK.grill, q = L(g[0], -40.4); st.box(q.x, 1.0, q.z, 3.4, .5, 1.6, 0x2a2d36, ry); const pq = L(g[0], -40.4); lamp.box(pq.x, 1.55, pq.z, 3, .08, 1.3, 0xff7a2a, ry); for (let i = 0; i < 4; i++) { const t = L(g[0] - 1.2 + i * .8, -40.3); st.cyl(t.x, 1.56, t.z, .3, .3, .12, 0x7a3a1a, 8); } }
    for (const [a, b] of KK.tables) { cyl(a, b, .95, .95, .08, 0xfff0d8, .9, 12); cyl(a, b, .15, .3, .9, 0x6a3a1a, 0, 8); solid(a, b, .95, 1); for (const sd of [-1, 1]) { cyl(a + sd * 1.7, b, .42, .4, .55, [0xe0382b, 0x2f8cff][sd < 0 ? 0 : 1], 0, 8); cyl(a + sd * 1.7, b, .12, .14, .55, 0xdddddd, 0, 6); } sph(a, b, 1.06, .16, [0xff5a5a, 0xffd23f, 0x4cd07d][((a + b) | 0) & 3 || 0]); }
    M.seats = KK.tables.flatMap(([a, b]) => [[a - 1.7, b], [a + 1.7, b]]).map(([a, b]) => ({ a, b }));
    for (const [a, b] of [[-23.4, -41], [-2.6, -41]]) { cyl(a, b, .4, .5, .5, 0x8a5a33, 0, 8); sph(a, b, 1.1, .5, 0x3fae4a); }
    W.spots.sw_krabbe = L(-12, KK.b1 + 4.5); W.spots.sw_kasse = L(KK.kasse[0], KK.kasse[1]); W.spots.sw_grill = L(KK.grill[0], KK.grill[1]);
    M.roofIn = { a0: KK.a0 + T, a1: KK.a1 - T, b0: KK.b0 + T, b1: KK.b1 - T }; }
  /* ---- Schwammis Fruchthaus (große gelb-orange Frucht mit grünem Blätterschopf), Gary-Platz ---- */
  { const A = 14, B = -32, ORG = 0xff9a2e; cyl(A, B, 3.9, 3.4, 9, ORG, 0, 16);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { const g = k / 8 * TAU + r * .4, q = L(A + Math.sin(g) * 3.7, B + Math.cos(g) * 3.7); st.sph(q.x, 1.4 + r * 1.9, q.z, .42, 0xe0742a, 1, 1, .8, 1); }
    for (let k = 0; k < 9; k++) { const g = k / 9 * TAU, q = L(A + Math.sin(g) * .9, B + Math.cos(g) * .9); st.box(q.x, 9, q.z, .6, 3.2 + (k % 3), .12, 0x3fae4a, ry + g, .15 * Math.sin(g), .3 * Math.cos(g)); } cone(A, B, 1.4, 2, 0x3fae4a, 9, 8);
    bx(A, B + 3.5, 1.7, 2.6, .5, 0x6a3a1a, 0); cyl(A, B + 3.78, .85, .85, .3, 0x6a3a1a, 2.6, 10); for (const sd of [-1, 1]) { cyl(A + sd * 1.6, B + 3.15, .75, .75, .25, 0xffffff, 5.0, 12); cyl(A + sd * 1.6, B + 3.28, .55, .55, .22, 0x9fe3ff, 5.02, 12); } cyl(A, B + 3.4, .9, .9, .25, 0xffffff, 6.7, 12);
    solid(A, B, 4, 9); W.spots.sw_frucht = L(A, B + 8); W.spots.sw_klingel = L(A, B + 5.4); W.spots.sw_gary = L(A + 5.5, B + 6); zone(A, B + 6, 4.5, 0xe8d490); }
  /* ---- Sternchens Stein (flacher Kuppelstein) ---- */
  { const A = 26, B = -32; st.sph(L(A, B).x, 0, L(A, B).z, 3.8, 0xc67a8a, 1, 1, .8, 1); st.sph(L(A + 1.4, B + .6).x, 1.5, L(A + 1.4, B + .6).z, 1.6, 0xd88a9a, 1, 1, .6, 1); for (let k = 0; k < 4; k++) sph(A + (k - 1.5) * 1.3, B + 3.4, .15, .5, 0xe8b0c0, .5); solid(A, B, 3.6, 3); W.spots.sw_stein = L(A, B + 5); zone(A, B + 5, 3.5, 0xe8d490); }
  /* ---- Tadeus' Steinkopf (großer Kopf mit Nase) ---- */
  { const A = 38, B = -32, GR = 0x8aa098; cyl(A, B, 3.2, 3.6, 3.4, GR, 0, 14); st.box(L(A, B).x, 3.4, L(A, B).z, 6.4, 5.2, 4.6, GR, ry); cone(A, B - .2, 2.4, 2, GR, 8.4, 4);
    bx(A, B + 2.4, 1.3, 3.2, 1.6, 0x7a9088, 3.6); for (const sd of [-1, 1]) { cyl(A + sd * 1.5, B + 2.4, .75, .75, .22, 0xffffff, 6.5, 10); bx(A + sd * 1.5, B + 2.5, .8, .1, .3, 0x333333, 6.1); }
    bx(A, B + 2.45, 2.2, .35, .3, 0x4a3a3a, 3.8); bx(A, B + 2.6, 1.3, 2.0, .25, 0x6a3a1a, 0); solid(A, B, 4, 9); W.spots.sw_kopf = L(A, B + 5.5); zone(A, B + 5.5, 3.5, 0xe8d490); }
  /* ---- Sunnys Luftkuppel (Glas-Kuppel mit Baum und Karate-Puppe) – Glas ist Laufzeit-Mesh ---- */
  { const A = 22, B = 36; zone(A, B, 8.5, 0x9ad8a0); cyl(A, B, 8.6, 8.8, .5, 0xd8e6f0, 0, 28); cyl(A + 3.5, B - 3, .4, .6, 5, 0x7a4a2a, 0, 8); sph(A + 3.5, B - 3, 6.2, 2.6, 0x3fae4a, .85); sph(A + 4.6, B - 2.4, 7.4, 1.6, 0x4cc65a, .85); solid(A + 3.5, B - 3, .8, 6);
    for (let k = 0; k < 6; k++) { const g = k / 6 * TAU, q = L(A + Math.sin(g) * 5.5, B + Math.cos(g) * 5.5); st.sph(q.x, .25, q.z, .35, [0xff5a8a, 0xffd23f, 0xffffff][k % 3], 1); }
    W.spots.sw_kuppel = L(A, B); W.spots.sw_karate = L(A - 2, B + 2); }
  /* ---- Eimerchen (Winzling Plankto): grauer Eimer mit Henkel, Speisekarte ---- */
  { const A = -14, B = 34, BU = 0x8a96a8; cyl(A, B, 5.6, 4.6, 6.4, BU, 0, 16); cyl(A, B, 5.8, 5.8, .4, 0x6a7686, 6.2, 16); cyl(A, B, 5.0, 5.0, .2, 0x4a5666, 6.45, 16); for (let k = 0; k < 3; k++) cyl(A, B, 5.5 - k * .3, 5.5 - k * .3, .18, 0x6a7686, 1.2 + k * 1.8, 16);
    for (const sd of [-1, 1]) { bx(A, B + sd * 5.5, .3, 3.2, .3, 0x4a5666, 6.4); } bx(A, B, 11, .25, .3, 0x4a5666, 9.4); bx(A, B - 4.9, 1.6, 2.6, .5, 0x2a3a4a, 0); for (const sd of [-1, 1]) { cyl(A + sd * 2.5, B - 5.1, .6, .6, .2, 0xffe27a, 3.4, 10); }
    solid(A, B, 5.4, 7); W.spots.sw_eimer = L(A, B - 7); W.spots.sw_plankto = L(A + 4, B - 7); zone(A, B - 7, 4.5, 0xe8d490); }
  /* ---- Heldenheim (Meeresmann & Napfschnecken-Bub) mit Garage fürs Wannen-Mobil ---- */
  { const A = -44, B = 34; bx(A, B, 8, 6, 7, 0xe8f0fa); st.prism(L(A, B).x, 6, L(A, B).z, 9, 2.4, 8, 0x2f8cff, ry + Math.PI / 2); cyl(A, B, .12, .12, 6, 0xdddddd, 8.4, 6); { const q = L(A, B); st.box(q.x, 12.4, q.z, .1, 1.6, 2.4, 0xff5a5a, ry + Math.PI / 2); } for (const sd of [-1, 1]) { cyl(A, B + sd * 2, .6, .6, .22, 0xffe27a, 3.6, 8); } bx(A, B - 3.55, 2.2, 3.2, .4, 0x6a3a1a, 0); solid(A, B, 4.6, 6);
    zone(A, B - 8, 5.5, 0xd8d8e8); const gp = L(A, B - 10); const ring = (r0, r1, col) => st.ring(gp.x, gp.z, r0, r1, ROADY + .02, col, 28); ring(4.6, 5.2, 0xffd23f); W.spots.sw_held = L(A, B - 5); W.spots.sw_wanne = L(A, B - 10);
    W.vehicleSpawns.push({ type: 'wannenmobil', x: gp.x, z: gp.z, h: Math.atan2(M.ux, M.uz), home: 99 }); }
  /* ---- Quallenfeld: Seegras-Wiese mit Pilzkorallen ---- */
  { const F = M.FIELD; zone(F.a, F.b, F.r + 1, 0xa8e8c0); zone(F.a, F.b, F.r * .6, 0x8fdcb0, ROADY + .008); for (let k = 0; k < 12; k++) { const g = k / 12 * TAU, a = F.a + Math.sin(g) * (F.r + 2), b = F.b + Math.cos(g) * (F.r + 2); if (Math.hypot(a, b) > M.R - 12) continue; kelp(a, b, 3 + rn() * 2.4, [0x2fae6a, 0x3fc87a, 0x1f9a5a][k % 3]); } W.spots.sw_quallen = L(F.a, F.b); W.spots.sw_glas = L(F.a - F.r - 3, F.b); { const q = L(F.a - F.r - 3, F.b); st.cyl(q.x, 0, q.z, .8, .8, 1.3, 0xd8f4ff, 10); st.cyl(q.x, 1.3, q.z, .9, .9, .15, 0x6a3a1a, 10); } }
  /* ---- Strand-Rand: Seetang, Korallen, Muscheln, Bojen; Strandhütte von Hummer-Lenny ---- */
  for (let i = 0; i < 26; i++) { const g = rn() * TAU, d = M.R - 17 + rn() * 7, a = Math.sin(g) * d, b = Math.cos(g) * d, q = L(a, b); if (path0(a, b)) continue; if (i % 2) kelp(a, b, 3.4 + rn() * 3, [0x2fae6a, 0x3fc87a, 0x7fb83a][i % 3]); else coral(a, b, .9 + rn() * .7, [0xff8fb8, 0xffb04a, 0xb48aff, 0x7fe0ff][i % 4]); }
  function path0(a, b) { return Math.abs(b) < 6 && a < -50 || Math.hypot(a, b) > M.R - 8 && (a < -58 && Math.abs(b) < 12); }
  { const A = -56, B = -20, q = L(A, B); st.box(q.x, 0, q.z, 4.4, 2.6, 4.4, 0xe8c070, ry); st.prism(q.x, 2.6, q.z, 5.4, 2.2, 5.4, 0xe0382b, ry + Math.PI / 2); solid(A, B, 3, 4); W.spots.sw_hummer = L(A + 3, B + 3.5); for (let k = 0; k < 4; k++) { const p = L(A - 6 + k * 1.2, B + 5); st.box(p.x, 0, p.z, .5, 2.4, .12, [0xff5a8a, 0x35d6e0, 0xffd23f, 0x9a6aff][k], ry + .3, .2); } }
  /* ---- Wiesenflecken (Türkis- und Grüntöne) ---- */
  { const cols = [0xc8ecd8, 0xb8e4cc, 0xa8dcc0, 0xd0e8b8], put = [[], [], []]; for (let i = 0, n = 0; i < 400 && n < 50; i++) { const a = rn() * TAU, d = Math.sqrt(rn()) * (M.R - 14), r = 3 + rn() * 6, x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d, k = n % 3; if (put[k].some(q => Math.hypot(q[0] - x, q[1] - z) < q[2] + r + .2)) continue; put[k].push([x, z, r]); st.disc(x, z, r, .024 + k * .0008, cols[n % cols.length], 14); n++; } }
  function GOLD() { return 0xffd23f; }
};

/* ===================================================================== Laufzeit ===================================================================== */
BI.createSchwamm = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { open: false, eat: null }, TAU = Math.PI * 2, M = BI.SCHWAMM, L = M.at, SP = W.spots, KK = M.KK, mat = BI.mat();
  const S = () => { const s = save.schwamm || (save.schwamm = {}); s.visit |= 0; s.ate = s.ate || {}; s.meals |= 0; s.jelly |= 0; s.bank |= 0; s.karate |= 0; s.once = s.once || {}; return s; };
  S();
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const stars = () => save.stars | 0, earn = id => G.earn && G.earn(id);
  const nr = (o, r) => o && Math.hypot(P.x - o.x, P.z - o.z) < r, onIsle = () => Math.hypot(P.x - M.x, P.z - M.z) < M.R + 4;
  const sign = (txt, p, y, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#0a4a6a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3b0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(p.x, y, p.z); scene.add(sp); return sp; };
  { const g = SP.swGate; sign('🧽 Schwammi-Bucht 🦀', g, g.y, 13); }
  sign('🦀 Die Knusper-Krabbe', SP.sw_krabbe, 9, 10); sign('🍍 Schwammis Fruchthaus', SP.sw_frucht, 10.8, 9); sign('⭐ Sternchens Stein', SP.sw_stein, 5.6, 7); sign('🗿 Tadeus’ Steinkopf', SP.sw_kopf, 11, 8); sign('🌳 Sunnys Luftkuppel', SP.sw_kuppel, 11, 9);
  sign('🪣 Eimerchen', SP.sw_eimer, 10.2, 6); sign('🛁 Heldenheim', SP.sw_held, 14, 8); sign('🪼 Quallenfeld', SP.sw_quallen, 6.4, 8); sign('🍔 Grill', { x: SP.sw_grill.x, z: SP.sw_grill.z }, 4.2, 4);
  /* Dach der Knusper-Krabbe (verschwindet, wenn man drin ist) */
  const roof = M.roofB.mesh(mat); roof.frustumCulled = false; scene.add(roof); M.roofB = null; const RI = M.roofIn;
  /* ---------- Emoji-Sprites (Essen am Tisch) ---------- */
  const emoCache = {}; const emo = e => { if (emoCache[e]) return emoCache[e]; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.font = '96px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 64, 70); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.visible = false; scene.add(sp); return emoCache[e] = sp; };
  /* ---------- Schneckerich (kriecht langsam) ---------- */
  const gary = (() => { const b = new BI.Batch(); b.sph(0, .35, 0, .35, 0x9ad8ff, 1, 1, .7, 1.6); b.sph(0, .62, -.1, .46, 0xff9ab8, 1, 1, 1, .9); b.cone(0, .6, -.1, .3, .5, 0xff7aa0, 6); b.cone(-.12, .5, .5, .03, .4, 0x9ad8ff, 4); b.cone(.12, .5, .5, .03, .4, 0x9ad8ff, 4); b.sph(-.12, .86, .55, .07, 0xffffff, 0); b.sph(.12, .86, .55, .07, 0xffffff, 0); const m = b.mesh(mat), g = new THREE.Group(); g.add(m); g.scale.setScalar(1.3); scene.add(g); return g; })();
  const GP = SP.sw_gary; let gAng = 0;
  /* ---------- Karate-Puppe im Luftkuppel ---------- */
  const dummy = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, .12, .16, 1.6, 0x8a5a2a, 6); b.sph(0, 1.8, 0, .32, 0xf0c890, 1); b.box(0, 1.2, 0, 1.4, .18, .18, 0x8a5a2a); b.box(0, .9, 0, .5, .5, .3, 0xffffff); b.box(0, .4, 0, .9, .1, .9, 0x6a4a2a); const m = b.mesh(mat), g = new THREE.Group(); g.add(m); g.position.set(SP.sw_karate.x, 0, SP.sw_karate.z); scene.add(g); return g; })(); let dummyW = 0;
  /* ---------- Glaskuppel ---------- */
  { const q = SP.sw_kuppel, m = new THREE.Mesh(new THREE.SphereGeometry(8.7, 24, 12, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false })); m.position.set(q.x, .3, q.z); scene.add(m); }
  /* ---------- Quallen ---------- */
  const JCOL = [0xff8fc8, 0x7fe0ff, 0xb48aff, 0xffe27a], bellG = new THREE.SphereGeometry(.75, 10, 6, 0, TAU, 0, Math.PI / 2), tentG = new THREE.CylinderGeometry(.04, .02, 1.1, 4), jm = JCOL.map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .82 }));
  const JEL = []; for (let i = 0; i < 9; i++) { const g = new THREE.Group(), mm = jm[i % 4]; g.add(new THREE.Mesh(bellG, mm)); for (let k = 0; k < 6; k++) { const t = new THREE.Mesh(tentG, mm), a = k / 6 * TAU; t.position.set(Math.sin(a) * .45, -.55, Math.cos(a) * .45); g.add(t); } g.visible = true; scene.add(g); JEL.push({ g, ph: Math.random() * 6, rad: 3 + Math.random() * (M.FIELD.r - 4), sp: (.12 + Math.random() * .12) * (i % 2 ? 1 : -1), y: 2 + Math.random() * 2.2, ang: Math.random() * 6, dead: 0 }); }
  const FC = L(M.FIELD.a, M.FIELD.b);
  function nearJelly(r) { let best = null, bd = r; for (const j of JEL) { if (j.dead > 0) continue; const d = Math.hypot(j.g.position.x - P.x, j.g.position.z - P.z); if (d < bd) { bd = d; best = j; } } return best; }
  /* ---------- Figuren ---------- */
  K.people = function (folk) {
    const free = (x, z) => { if (W.free(x, z, .6)) return { x, z }; for (let r = 1; r <= 5; r += 1) for (let k = 0; k < 12; k++) { const g = k / 12 * TAU + r, qx = x + Math.sin(g) * r, qz = z + Math.cos(g) * r; if (W.free(qx, qz, .6)) return { x: qx, z: qz }; } return { x, z }; };
    const mk = (a, b, look, name, lines, face) => { const p = free(L(a, b).x, L(a, b).z), c = BI.makeChar(look), f = face ? L(face[0], face[1]) : L(-60, 0), h = Math.atan2(f.x - p.x, f.z - p.z); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const SK = { fair: 0xf6d2b0, tan: 0xd8a070, dark: 0x8a5a33 };
    mk(-10, -40.6, { shirt: 0xffffff, pants: 0x8a5a2a, hair: 0xffe14a, skin: 0xffe14a, hat: 'chef', style: 'none', scale: .85 }, 'Schwammi', ['Hihi! Ich bin Schwammi und der beste Burgerbrater der Welt! 🧽', 'Gleich neben dem Grill kannst du selbst Burger braten – tipp auf den Grill!', 'Mein Fruchthaus ist das orange da drüben. Klingel doch mal! 🔔'], [-12, -30]);
    mk(-18.5, -41, { shirt: 0x3a4aa0, pants: 0x3a4aa0, hair: 0xe0382b, skin: 0xe0382b, hat: 'cap', style: 'none', scale: .75 }, 'Käpt’n Zangenfuß', ['Die Knusper-Krabbe ist mein Restaurant! Hier gibt es das beste Krabbenburger-Menü am Meeresgrund. 🦀', 'Das Geheimrezept? Pssst! Das verrate ich nicht mal dir.', 'Bring mir Quallen-Gelee, und ich zahle dir einen Stern für drei Stück! ⭐'], [-18.5, -34]);
    mk(26, -26.8, { shirt: 0xff8fb8, pants: 0x4cd07d, hair: 0xff8fb8, skin: 0xff8fb8, hat: 'none', style: 'none', scale: 1.15 }, 'Sternchen', ['Hallo! Ich bin Sternchen. Ich wohne unter einem Stein. Das ist richtig gemütlich! 🪨', 'Weißt du, was ich am liebsten esse? Eis! Und noch mehr Eis.', 'Heb den Stein hoch – ich schlafe vielleicht noch. 😴'], [26, -20]);
    mk(38, -26.6, { shirt: 0xc8903c, pants: 0x6a4a2a, hair: 0x9fd6c8, skin: 0x9fd6c8, hat: 'none', style: 'none', scale: 1.1 }, 'Tadeus Tintenfuß', ['Ich bin Tadeus. Kunst ist mein Leben – und meine Klarinette. 🎷', 'Warum ist hier immer so laut? Ich brauche Ruhe!', 'Willst du mir zuhören? Dann drück beim Steinkopf auf „Klarinette hören“.'], [38, -20]);
    mk(22, 33, { shirt: 0xffffff, pants: 0xffffff, hair: 0x8a5a2a, skin: 0xc89a5a, hat: 'helmet', style: 'ponytail', scale: .8 }, 'Sunny das Eichhörnchen', ['Howdy! Ich bin Sunny und lebe in meiner Luftkuppel. 🐿️', 'Da drin gibt es Luft für mich – und eine Karate-Puppe zum Üben! Probier es aus.', 'Zehn Karate-Schläge bringen dir einen Stern! ⭐'], [22, 28]);
    mk(-10, 29.5, { shirt: 0x3fae4a, pants: 0x3fae4a, hair: 0x3fae4a, skin: 0x3fae4a, hat: 'none', style: 'none', scale: .36 }, 'Winzling Plankto', ['Ich bin Plankto – klein, grün und genial! 🧪', 'Mein Eimerchen ist das beste Restaurant! … Nur kommt niemand. Snif.', 'Das Geheimrezept von Zangenfuß will ich haben! Auf der Wald-Insel kannst du mich besiegen – wenn du dich traust! 🌲'], [-10, 20]);
    mk(-44, 26, { shirt: 0x2f8cff, pants: 0xffffff, hair: 0xffffff, skin: SK.fair, hat: 'none', style: 'short', beard: 5, beardc: 0xffffff, cape: true, scale: 1.0 }, 'Meeresmann', ['Beim Wellenschlag! Ich bin der Meeresmann, Held der sieben Meere! 🦸', 'Mein Wannen-Mobil steht in der Garage. Du darfst eine Runde drehen!', 'Aber vergiss nicht: Nach dem Aussteigen fährt es von allein wieder nach Hause.'], [-44, 20]);
    mk(-41.6, 27, { shirt: 0xff8fc8, pants: 0xffffff, hair: 0x6a4a2a, skin: SK.tan, hat: 'goggles' === 'x' ? 'none' : 'cap', style: 'short', cape: true, scale: .62 }, 'Napfschnecken-Bub', ['Ich bin der Napfschnecken-Bub! Meeresmanns bester Freund. 🐚', 'Wir waren früher die allerbesten Helden. Jetzt sind wir ein bisschen müde.', 'Fahr mit dem Mobil – es ist ganz leicht zu lenken!'], [-44, 20]);
    mk(-52.5, -16.5, { shirt: 0xe0382b, pants: 0xe0382b, hair: 0x222222, skin: 0xe0382b, hat: 'cap', style: 'none', scale: 1.1 }, 'Hummer-Lenny', ['Ich bin Lenny, der Bademeister vom Meeresgrund! 🏊', 'Quallen sind zwar flauschig, aber nicht anfassen – nur mit dem Kescher fangen!', 'Das Quallenfeld ist ganz da hinten im Osten. 🪼'], [-50, -10]);
    mk(-34, -8, { shirt: 0xffe27a, pants: 0xffffff, hair: 0xffe27a, skin: 0xfff0a0, hat: 'party', style: 'none', dress: true, scale: .95 }, 'Frau Kugelfisch', ['Puff! Ich bin Frau Kugelfisch und leite die Boots-Fahrschule. 🐡', 'Merke: Erst gucken, dann fahren, und nie die Möwen ärgern.', 'Bei Aufregung werde ich ein bisschen rund. Puff!'], [-30, 0]);
    mk(-46, 4, { shirt: 0x7fe0ff, pants: 0x2a5a8a, hair: 0xff8fc8, skin: 0xffb08a, hat: 'none', style: 'pixie', scale: .6 }, 'Perlchen', ['Ich sammle Perlen! Schau, wie sie glänzen! ✨', 'Die schönste habe ich im Brunnen gefunden.'], [-44, 0]);
    mk(8, 8, { shirt: 0xa8dcc0, pants: 0x2f8cff, hair: 0x6a4a2a, skin: 0xc8e8f0, hat: 'cap', style: 'short', scale: 1.0 }, 'Fisch-Fiete', ['Blubb! Ich bin Fiete und liebe Algen-Pommes. 🍟', 'Wenn du in der Knusper-Krabbe isst, kannst du dir auch etwas mitnehmen!'], [4, 0]);
  };
  /* ---------- Speisekarte (Panel) ---------- */
  const panel = document.createElement('div'); panel.hidden = true; panel.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,30,60,.55);z-index:60;font-family:Fredoka,system-ui,sans-serif'; document.body.appendChild(panel);
  const el = (t, css, h) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (h != null) e.innerHTML = h; return e; };
  function renderPanel() {
    const s = S(); panel.innerHTML = ''; const card = el('div', 'background:#fffaf0;border:6px solid #e0382b;border-radius:24px;padding:14px 16px;width:min(92vw,440px);max-height:90vh;overflow:auto;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.4)'); panel.appendChild(card);
    card.appendChild(el('div', 'font-size:30px;font-weight:900;color:#c0301f', '🦀 Die Knusper-Krabbe')); card.appendChild(el('div', 'font-size:16px;font-weight:700;color:#6a3a1a;margin:2px 0 8px', 'Käpt’n Zangenfuß: „Was darf es sein?“   ⭐ ' + stars() + (s.meals % 5 === 4 ? '   🎁 Treuekarte: dieses Essen ist gratis!' : '')));
    for (const [id, em, nm, price, item] of M.DISHES) { const free = s.meals % 5 === 4, row = el('div', 'display:flex;align-items:center;gap:8px;margin:6px 0;background:#fff;border:3px solid #f0c890;border-radius:16px;padding:6px 8px');
      row.appendChild(el('div', 'font-size:38px', em)); row.appendChild(el('div', 'flex:1;text-align:left;font-size:17px;font-weight:800;color:#4a2a1a', nm + '<br><span style="font-size:14px;color:#b07a00">' + (free ? 'gratis!' : '⭐ ' + price) + '</span>'));
      for (const [lab, take] of [['🍽️ Essen', false], ['🎒 Mit', true]]) { const b = el('button', 'font-family:inherit;font-weight:800;font-size:15px;border-radius:14px;border:3px solid ' + (take ? '#4da3ff' : '#4cd07d') + ';background:#fff;padding:8px 10px;cursor:pointer', lab); b.type = 'button'; b.onclick = () => order(id, take); row.appendChild(b); } card.appendChild(row); }
    if (s.bank >= 3) { const jb = el('button', 'font-family:inherit;font-weight:800;font-size:17px;border-radius:16px;border:3px solid #b48aff;background:#f6eeff;padding:8px 14px;margin:6px;cursor:pointer', '🪼 Quallen-Gelee abgeben (' + s.bank + ') → +' + Math.floor(s.bank / 3) + ' ⭐'); jb.type = 'button'; jb.onclick = () => { const n = Math.floor(s.bank / 3); s.bank -= n * 3; G.addStars(n); A.buy && A.buy(); say('🪼 Käpt’n Zangenfuß: „Gelee! Danke!“ +' + n + ' ⭐', 3200); persist(); renderPanel(); }; card.appendChild(jb); } else card.appendChild(el('div', 'font-size:14px;font-weight:700;color:#8a6a4a;margin:6px', '🪼 Quallen-Gelee: ' + s.bank + ' (drei Stück = 1 ⭐ – fang Quallen im Quallenfeld!)'));
    const done = el('button', 'font-family:inherit;font-weight:900;font-size:20px;border-radius:18px;border:4px solid #4cd07d;background:#fff;padding:10px 30px;margin:6px;cursor:pointer', '✔ Fertig'); done.type = 'button'; done.onclick = () => K.close(); card.appendChild(done);
  }
  K.show = function () { if (K.open || K.eat) return; K.open = true; G.setStick && G.setStick(0, 0); renderPanel(); panel.hidden = false; };
  K.close = function () { if (!K.open) return; K.open = false; panel.hidden = true; G.updateButtons && G.updateButtons(true); persist(); };
  addEventListener('keydown', e => { if (K.open && e.code === 'Escape') { K.close(); e.preventDefault(); } });
  function order(id, take) {
    const s = S(), d = M.DISHES.find(q => q[0] === id), free = s.meals % 5 === 4; if (!d) return;
    if (!free && stars() < d[3]) { say('⭐ Dafür fehlen dir noch ' + (d[3] - stars()) + ' Sterne. Spiel Mini-Spiele oder brate selbst Burger!', 3000); A.bonk && A.bonk(); return; }
    if (!free) G.addStars(-d[3]); s.meals++; s.ate[id] = 1; A.buy && A.buy(); persist();
    if (take) { const iv = G.inv && G.inv(); if (iv) { iv[d[4]] = (iv[d[4]] || 0) + 1; } say(d[1] + ' ' + d[2] + ' eingepackt! (Rucksack 🎒 – Burger & Shake heilen auf der Wald-Insel)', 3600); if (Object.keys(s.ate).length >= 3) earn('stammgast'); persist(); renderPanel(); return; }
    K.close(); startEat(d);
  }
  function startEat(d) {
    const seats = M.seats, my = M.loc(P.x, P.z); let best = null, bd = 1e9; seats.forEach((q, i) => { const w = L(q.a, q.b), dd = Math.hypot(w.x - P.x, w.z - P.z) + (K.seatUsed === i ? 99 : 0); if (dd < bd) { bd = dd; best = i; } }); K.seatUsed = best;
    const q = seats[best], tb = KK.tables.reduce((m, t) => Math.hypot(t[0] - q.a, t[1] - q.b) < Math.hypot(m[0] - q.a, m[1] - q.b) ? t : m), w = L(q.a, q.b), tw = L(tb[0], tb[1]);
    K.eat = { t: 0, dur: 5.2, d, sx: w.x, sz: w.z, tx: tw.x, tz: tw.z, spr: emo(d[1]), bites: 0 }; P.x = w.x; P.z = w.z; P.y = .1; P.vy = 0; P.h = Math.atan2(tw.x - w.x, tw.z - w.z);
    say('🍽️ Guten Appetit! ' + d[1], 2400); const s = S(); if (Object.keys(s.ate).length >= 3) earn('stammgast');
  }
  /* ---------- Aktionen ---------- */
  K.near = function () {
    if (P.veh || P.y > 3 || K.eat || K.open || !onIsle()) return null; const s = S();
    if (nr(SP.sw_kasse, 3.1)) return { k: 'swkasse', label: ['🍽️', 'Speisekarte (Essen)'] };
    if (nr(SP.sw_grill, 3.2)) return { k: 'swgrill', label: ['🍔', 'Burger braten!'] };
    if (nr(SP.sw_klingel, 2.4)) return { k: 'swklingel', label: ['🔔', 'Klingeln'] };
    if (nr({ x: gary.position.x, z: gary.position.z }, 2.8)) return { k: 'swgary', label: ['🐌', 'Schneckerich streicheln'] };
    if (nr(SP.sw_stein, 3.6)) return { k: 'swstein', label: ['🪨', 'Stein hochheben'] };
    if (nr(SP.sw_kopf, 3.6)) return { k: 'swklari', label: ['🎷', 'Klarinette hören'] };
    if (nr(SP.sw_karate, 2.8)) return { k: 'swkarate', label: ['🥋', 'Karate üben (' + (s.karate % 10) + '/10)'] };
    if (nr(SP.sw_plankto, 3)) return { k: 'swplankto', label: ['🧪', 'Winzling Plankto besuchen'] };
    if (nearJelly(4.2)) return { k: 'swjelly', label: ['🪼', 'Qualle fangen!'] };
    if (nr(SP.sw_held, 3.4)) return { k: 'swheld', label: ['🛁', 'Wannen-Mobil ansehen'] };
    return null;
  };
  K.busy = () => !!K.eat || K.open;
  K.act = function (n) {
    if (!n) return; const s = S(), once = (k, f) => { if (!s.once[k]) { s.once[k] = 1; persist(); G.addStars(1); f && f(); return true; } return false; };
    if (n.k === 'swkasse') { K.show(); return; }
    if (n.k === 'swgrill') { G.start && G.start('burger_krabbe'); return; }
    if (n.k === 'swklingel') { note(784, .5, 'sine', .12); note(988, .7, 'sine', .1, .22); say('🔔 Ding-dong! Schwammi ruft: „Ich komme gleich! … Äh, ich bin ja gerade im Restaurant!“ Hihi.', 4200); once('klingel', () => say('🔔 Ding-dong! +1 ⭐', 1800)); return; }
    if (n.k === 'swgary') { A.hello && A.hello(); K.meow = (K.meow | 0) + 1; say('🐌 Schneckerich macht „Miau!“ – ja, wirklich Miau! Hihi.', 3200); fx.burst(gary.position.x, 1.2, gary.position.z, 8, [[1, .5, .7], [1, 1, 1]], 3, 1, 28, 2); once('gary'); return; }
    if (n.k === 'swstein') { fx.burst(SP.sw_stein.x, 2, SP.sw_stein.z, 20, [[1, .7, .8], [1, 1, 1]], 4, 1.2, 28, 2); A.pop && A.pop(); say('🪨 Unter dem Stein: Sternchen! „Noch fünf Minuten …“ 😴 Es macht die Augen wieder zu.', 4200); once('stein'); return; }
    if (n.k === 'swklari') { [330, 311, 370, 294, 349, 262, 392].forEach((f, i) => note(f, .22, 'sawtooth', .07, i * .24)); say('🎷 Tadeus spielt Klarinette … autsch, ein bisschen schief! Er ist stolz darauf.', 4200); once('klari'); return; }
    if (n.k === 'swkarate') { dummyW = 1; s.karate++; A.whoosh && A.whoosh(); P.punchT = .4; P.punchHit = true; fx.burst(SP.sw_karate.x, 1.5, SP.sw_karate.z, 8, [[1, .95, .6], [1, 1, 1]], 3, .9, 28, 1); note(220, .12, 'square', .08); if (s.karate % 10 === 0) { G.addStars(2); A.fanfare && A.fanfare(); say('🥋 10 Schläge! Sunny: „Yeehaw! Du bist ein Karate-Profi!“ +2 ⭐', 3600); earn('karate_s'); } else say('🥋 Hai-jah! (' + (s.karate % 10) + ' von 10)', 1200); persist(); return; }
    if (n.k === 'swplankto') { say('🧪 Plankto: „Muahaha! Das Rezept wird MIR gehören! Wir sehen uns auf der Wald-Insel!“', 5200); fx.burst(SP.sw_plankto.x, 1.2, SP.sw_plankto.z, 10, [[.4, 1, .5], [1, 1, 1]], 3, 1, 28, 2); A.speak && A.speak('Wir sehen uns auf der Wald-Insel!'); once('plankto'); return; }
    if (n.k === 'swjelly') { const j = nearJelly(4.5); if (!j) return; P.punchT = .4; P.punchHit = true; A.whoosh && A.whoosh(); j.dead = 6; j.g.visible = false; fx.burst(j.g.position.x, j.g.position.y, j.g.position.z, 16, [[1, .6, .9], [.6, .9, 1], [1, 1, 1]], 4, 1.1, 28, 3); A.star && A.star(); s.jelly++; s.bank++;
      say('🪼 Gefangen! (' + s.jelly + ' Quallen' + (s.jelly === 1 ? ' – drei Gelee = 1 ⭐ bei Zangenfuß' : '') + ')', 2200); if (s.jelly === 5) { G.addStars(2); say('🪼 5 Quallen! +2 ⭐', 2600); } if (s.jelly === 15) { G.addStars(5); A.fanfare && A.fanfare(); earn('qualler'); say('🪼 15 Quallen! Du bist ein Quallenfischer! +5 ⭐', 3600); } persist(); return; }
    if (n.k === 'swheld') { say('🛁 Das Wannen-Mobil von Meeresmann & Napfschnecken-Bub – einfach einsteigen (E / 🚗) und losfahren!', 4200); once('held'); return; }
  };
  /* ---------- Bild für Bild ---------- */
  let was = false;
  K.update = function (dt, t) {
    const raw = Math.min(dt, .25), d0 = Math.hypot(P.x - M.x, P.z - M.z), ins = d0 < M.R + 12; const near = d0 < 260; gary.visible = near; for (const j of JEL) if (!near) j.g.visible = false;
    { const lp = M.loc(P.x, P.z), inside = !P.veh && P.y < 4 && lp.a > RI.a0 && lp.a < RI.a1 && lp.b > RI.b0 && lp.b < RI.b1; if (roof.visible === inside) roof.visible = !inside; }
    if (ins !== was) { was = ins; if (ins) { const s = S(); if (!s.visit) { s.visit = 1; persist(); G.addStars(1); earn('schwammi'); say('🧽 Willkommen in der Schwammi-Bucht! +1 ⭐', 3600); } else say('🧽 Schwammi-Bucht', 2000); } }
    if (!near) return;
    /* Schneckerich kriecht im Kreis */
    gAng += raw * .12; const gx = GP.x + Math.sin(gAng) * 2.2, gz = GP.z + Math.cos(gAng) * 2.2; gary.position.set(gx, 0, gz); gary.rotation.y = gAng + Math.PI / 2;
    /* Karate-Puppe wackelt */
    dummyW = Math.max(0, dummyW - raw * 2.2); dummy.rotation.z = Math.sin(t * 28) * .35 * dummyW; dummy.rotation.x = Math.cos(t * 23) * .2 * dummyW;
    /* Quallen schweben im Feld */
    for (const j of JEL) { if (j.dead > 0) { j.dead -= raw; if (j.dead <= 0) { j.g.visible = true; j.ang = Math.random() * 6; } continue; } j.ang += j.sp * raw; j.g.visible = true; const r = j.rad + Math.sin(t * .6 + j.ph) * 1.2; j.g.position.set(FC.x + Math.sin(j.ang) * r, j.y + Math.sin(t * 1.8 + j.ph) * .45, FC.z + Math.cos(j.ang) * r); j.g.scale.set(1 + Math.sin(t * 3 + j.ph) * .08, 1 + Math.cos(t * 3 + j.ph) * .12, 1 + Math.sin(t * 3 + j.ph) * .08); j.g.rotation.y = t * .4 + j.ph; }
    /* Essen am Tisch */
    const e = K.eat; if (!e) return; e.t += raw; const u = Math.min(1, e.t / e.dur), ch = G.char(), g = ch.group; P.x = e.sx; P.z = e.sz; P.y = .1; P.vy = 0; g.position.set(P.x, .5, P.z); g.rotation.set(0, P.h, 0); ch.pose(0, 0, false); const bite = Math.sin(e.t * 5);
    ch.armR.rotation.set(-1.6 - Math.max(0, bite) * .6, 0, -.2); ch.armL.rotation.set(-.8, 0, .2); e.spr.visible = true; e.spr.position.set(e.tx, 1.7 + Math.max(0, bite) * .1, e.tz); const sc = 1.6 * (1 - u * .85); e.spr.scale.set(sc, sc, 1);
    if (Math.floor(e.t * 1.6) > e.bites) { e.bites++; note(300 + e.bites * 40, .12, 'square', .06); fx.burst(e.tx, 1.8, e.tz, 4, [[1, .8, .4], [1, 1, 1]], 2, .6, 22, 1); }
    if (u >= 1) { e.spr.visible = false; K.eat = null; g.position.y = 0; g.rotation.set(0, P.h, 0); ch.armL.rotation.set(0, 0, 0); ch.armR.rotation.set(0, 0, 0); const o = L(-12, -16); P.x = o.x; P.z = o.z; P.y = 0; A.giggle && A.giggle(); fx.burst(P.x, 2.2, P.z, 14, [[1, .5, .7], [1, .9, .5], [1, 1, 1]], 3, 1, 28, 3); say('😋 Mmh, lecker! Das war ein toller ' + e.d[2] + '!', 3000); const s = S(); if (Object.keys(s.ate).length >= 3) earn('stammgast'); persist(); }
  };
  K.log = function () {
    const s = S(), n = (s.visit ? 1 : 0) + (s.meals > 0 ? 1 : 0) + (s.jelly >= 5 ? 1 : 0) + (s.karate >= 10 ? 1 : 0) + (s.once.klingel ? 1 : 0) + (s.once.stein ? 1 : 0) + (s.once.plankto ? 1 : 0) + (s.once.held ? 1 : 0);
    return { title: '🧽 Schwammi-Bucht', count: n + ' von 8', rows: [
      { ok: !!s.visit, icon: '🧽', text: 'Schwammi-Bucht besuchen (Brücke im Norden)', dest: 'schwamm' }, { ok: s.meals > 0, icon: '🦀', text: 'In der Knusper-Krabbe essen (Theke: Speisekarte) – ' + s.meals + ' Mahlzeiten', dest: 'krabbe_s' },
      { ok: !!s.once.klingel, icon: '🔔', text: 'An Schwammis Fruchthaus klingeln', dest: 'frucht_s' }, { ok: !!s.once.stein, icon: '🪨', text: 'Sternchens Stein hochheben', dest: 'frucht_s' }, { ok: s.jelly >= 5, icon: '🪼', text: 'Quallen fangen: ' + Math.min(5, s.jelly) + ' von 5', dest: 'quallen_s' },
      { ok: s.karate >= 10, icon: '🥋', text: 'In Sunnys Luftkuppel zehnmal Karate üben', dest: 'frucht_s' }, { ok: !!s.once.plankto, icon: '🧪', text: 'Winzling Plankto am Eimerchen besuchen', dest: 'krabbe_s' }, { ok: !!s.once.held, icon: '🛁', text: 'Das Wannen-Mobil im Heldenheim ansehen (und fahren!)', dest: 'held_s' }] };
  };
  K.dbg = { JEL, gary, order, startEat, M, dummy, get panel() { return panel; } };
  return K;
};

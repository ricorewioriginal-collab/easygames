'use strict';
/* Bunte Insel – Schlüsselreich 🗝️💛 (Erweiterung): eine große Insel im Westen, INSPIRIERT von der Stimmung großer Schlüssel-/Herz-Abenteuer-Rollenspiele
   (Strand der Freunde, Glasmosaik-Plattform, Dämmerstadt mit Uhrturm, Kristall-Burg, Wald der Schatten, Sternen-Hafen, Schlüsselloch-Siegel …) –
   aber mit ganz EIGENEN, selbst erfundenen Figuren, Namen, Waffen und Orten (Lichtwanderer Lio, Lichtschlüssel, Dunkelwichtel, Wuscheln, der Schleier-Orden …).
   Nichts davon ist ein Original oder ein geschütztes Zeichen; alles ist bewusst „neutralisiert“.
   Spielidee: Mit dem Lichtschlüssel Dunkelwichtel vertreiben (Herz-Kristalle 💎 sammeln), fünf Schlüssellöcher öffnen (Sternfrüchte am Strand, Meersalz-Eis & Uhrturm,
   Licht-Rätsel in der Burg, Wald der Schatten, Splitter am Schleier-Turm), danach öffnet sich das Tor der Herzen mit dem Dunkelriesen. Highlight: das Schlüsselschwert-Mobil.
   Lokale Koordinaten (a, b): a = Richtung Inselmitte (weg von der Brücke), b = quer dazu. Aufbau wie Märchenland (Höhen, Brücke, Figuren, Log). */
BI.SCHLUESSEL = (function () {
  const R = 84, cx = -500, cz = -135, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Schlüsselreich
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) }, hills: [], rects: [],
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
})();
BI.SCHLUESSEL.at = function (a, b) { const M = BI.SCHLUESSEL; return { x: M.x + M.ux * a - M.uz * b, z: M.z + M.uz * a + M.ux * b }; };
BI.SCHLUESSEL.loc = function (x, z) { const M = BI.SCHLUESSEL, dx = x - M.x, dz = z - M.z; return { a: dx * M.ux + dz * M.uz, b: -dx * M.uz + dz * M.ux }; };
/* Höhe des Bodens (begehbare Hügel in 1-Stufen-Schritten) – wird von world.js (groundY) benutzt */
BI.SCHLUESSEL.floor = function (x, z) {
  const M = BI.SCHLUESSEL, p = M.loc(x, z); if (Math.abs(p.a) > 90 || Math.abs(p.b) > 90) return 0;
  for (const r of M.rects) if (p.a > r.a0 && p.a < r.a1 && p.b > r.b0 && p.b < r.b1) return r.y;
  for (const h of M.hills) { const d = Math.hypot(p.a - h.a, p.b - h.b); if (d < h.r0) return Math.min(h.tiers, 1 + Math.floor((h.r0 - d) / h.dr)) * h.step; }
  return 0;
};
/* Die fünf Schlüssellöcher (Reihenfolge = Säulen am Platz) und die fünf Lichtschlüssel (Aussehen) */
BI.SCHL_KEYS = [['strand', '🌴', 'Strand der Freunde'], ['stadt', '🕰️', 'Dämmerstadt'], ['burg', '🏰', 'Kristall-Burg'], ['wald', '🌲', 'Wald der Schatten'], ['turm', '🗼', 'Schleier-Turm']];
BI.SCHL_BLADES = [['Sternenschlüssel', '⭐', 0, 0xffd23f, 0x4da3ff], ['Blütenschlüssel', '🌸', 5, 0xff8fc8, 0x4cd07d], ['Flammenschlüssel', '🔥', 8, 0xff7a1a, 0xe0382b], ['Eisschlüssel', '❄️', 10, 0xbfeaff, 0x6ac8ff], ['Mondschlüssel', '🌙', 12, 0xd8d8f0, 0x7a4ad8]];

BI.buildSchluesselGround = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.SCHLUESSEL, TAU = Math.PI * 2, rn = BI.rng(1313), L = M.at, ry = Math.atan2(M.ux, M.uz), GOLD = 0xffd23f;
  W.spots.schluessel = { x: M.entry.x, z: M.entry.z }; W.schluessel = M; M.shade = [];
  st.disc(M.x, M.z, M.R + 9, 0, 0x8fd87a, 96); st.ring(M.x, M.z, M.R - 5, M.R + 9, .012, 0xf6e6b8, 96); BI.buildIsleBridge(c, M);
  /* ---- Helfer (alles in lokalen Koordinaten) ---- */
  const bx = (a, b, wb, h, da, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, wb, h, da, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const cone = (a, b, r, h, col, y0, seg) => { const p = L(a, b); st.cone(p.x, y0 || 0, p.z, r, h, col, seg || 12); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const glow = (a, b, y, r, col) => { const p = L(a, b); lamp.sph(p.x, y, p.z, r, col, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const path = (a0, b0, a1, b1, w, col) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), q0 = L(a0, b0), q1 = L(a1, b1); st.strip(p.x, p.z, w, Math.hypot(a1 - a0, b1 - b0), Math.atan2(q1.x - q0.x, q1.z - q0.z), ROADY, col || 0xf0e0b8); };
  const hill = (a, b, r0, tiers, step, dr, cA, cB) => { M.hills.push({ a, b, r0, tiers, step, dr }); for (let k = 1; k <= tiers; k++) { const r = r0 - dr * (k - 1); cyl(a, b, r, r, step, k % 2 ? cA : cB, (k - 1) * step, 40); } };
  const tree = (a, b, h, col, r) => { cyl(a, b, .25, .38, h, 0x7a4a2a, 0, 6); sph(a, b, h + 1.2, r || 1.9, col, .95); sph(a + .5, b - .3, h + 2.5, (r || 1.9) * .62, col + 0x0a140a, .95); solid(a, b, .5, 3); M.shade.push([L(a, b), (r || 1.9) * 1.1, h]); };
  const lantern = (a, b, h, col) => { cyl(a, b, .08, .1, h || 3.2, 0x44485a, 0, 6); glow(a, b, (h || 3.2) + .3, .28, col || 0xfff0b0); };
  const zone = (a, b, r, col, y) => { const p = L(a, b); st.disc(p.x, p.z, r, y || ROADY + .004, col, 40); };

  /* ---- Strand der Freunde: krumme Palme mit Sternfrüchten, Hütte, Sandburg, Surfbretter ---- */
  { zone(-58, 2, 16, 0xf6e6b8); const pa = L(-62, -14); for (let k = 0; k < 6; k++) { const t = k / 6; st.cyl(pa.x + M.uz * (t * t) * 4 * -1 + M.ux * 0, k * 1.05, pa.z + M.ux * (t * t) * 4, .3 - k * .02, .3 - k * .02 - .02, 1.1, 0x9a6a3a, 6); }
    const top = L(-62, -14 + 4); for (let f = 0; f < 7; f++) { const g = f / 7 * TAU; st.box(top.x + Math.sin(g) * 1.5, 6.2, top.z + Math.cos(g) * 1.5, 3.1, .12, .9, 0x3fae4a, g); } solid(-62, -14, .6, 6);
    const hut = L(-56, 18); st.box(hut.x, 0, hut.z, 5, 2.8, 5, 0xc8903c, ry); st.prism(hut.x, 2.8, hut.z, 6.2, 2.4, 6.2, 0x3fae4a, ry + Math.PI / 2); solid(-56, 18, 3.2, 5);
    for (let i = 0; i < 3; i++) { const q = L(-64 + i * 2, 8 + i * 1.2); st.cyl(q.x, 0, q.z, 1.8 - i * .5, 2 - i * .5, .9, 0xe6cf98, 12); if (i < 2) st.cone(q.x, .9, q.z, .5, 1.2, 0xff5a5a, 6); }
    for (const [a, b, col] of [[-54, -6, 0xff5a8a], [-53, -4.4, 0x35d6e0], [-52, -2.8, 0xffd23f]]) { const q = L(a, b); st.box(q.x, 0, q.z, .5, 2.4, .12, col, ry + .3, .2); }
    for (const [a, b] of [[-66, -22], [-48, 14], [-70, 14], [-47, -26]]) palmish(a, b);
    W.spots.sk_strand = L(-60, 0); W.spots.palme = L(-62, -10); }
  function palmish(a, b) { const q = L(a, b), h = 5 + rn() * 2; st.cyl(q.x, 0, q.z, .2, .3, h, 0x9a6a3a, 6); for (let f = 0; f < 6; f++) { const g = f / 6 * TAU; st.box(q.x + Math.sin(g) * 1.3, h - .2, q.z + Math.cos(g) * 1.3, 2.8, .1, .8, 0x3fae4a, g); } solid(a, b, .45, 6); }
  /* ---- Erwachens-Plattform: Glasmosaik-Kreis mit der großen Statue des Lichtwanderers Lio ---- */
  { const SA = -14, SB = 0, p = L(SA, SB), COL = [0x4da3ff, 0xffd23f, 0xff5a8a, 0x7a4ad8, 0x35d6e0, 0xffffff];
    st.disc(p.x, p.z, 17, ROADY + .002, 0x2a3a6a, 48); for (let i = 0; i < 24; i++) st.ring(p.x, p.z, 12, 16.4, ROADY + .006, COL[i % 6], 1, i / 24 * TAU, (i + 1) / 24 * TAU - .02);
    for (let i = 0; i < 12; i++) st.ring(p.x, p.z, 7.2, 11.4, ROADY + .008, COL[(i + 2) % 6], 1, i / 12 * TAU, (i + 1) / 12 * TAU - .03); st.disc(p.x, p.z, 7, ROADY + .01, 0xfff0c0, 40); st.ring(p.x, p.z, 5.6, 6.3, ROADY + .014, GOLD, 40);
    /* Sockel */ st.cyl(p.x, 0, p.z, 6.2, 6.6, .7, 0x8f98ad, 24); st.cyl(p.x, .7, p.z, 5.2, 5.5, .9, 0xaab2c6, 24); st.cyl(p.x, 1.6, p.z, 4.2, 4.4, 1.2, 0xc9d0e0, 24); solid(SA, SB, 5.6, 3);
    const S = 0xc9d0e0, S2 = 0xaab2c6, DK = 0x4a5068; /* Figur aus hellem Stein, Schlüssel golden; Blick zum Eingang (−a) */
    const part = (a, b, wb, h, da, y0, col, yaw) => bx(SA + a, SB + b, wb, h, da, col, y0, yaw);
    for (const sd of [-1, 1]) { part(-.6, sd * 1.5, 1.7, .9, 3.2, 2.8, DK); part(-.2, sd * 1.5, 1.2, 4.6, 1.2, 3.7, S2); }  /* große Schuhe + Beine */
    part(0, 0, 4.2, 1.2, 2.4, 8.3, 0x6a7390); part(0, 0, 4.4, 4.6, 2.4, 9.4, S); part(-1.25, 0, .15, 3.2, .3, 9.6, GOLD); /* Hüfte, Jacke, Reißverschluss */
    part(-1.25, -1.2, 1.1, 1.1, .2, 11.6, GOLD); sph(SA - 1.2, SB, 11.4, .55, GOLD); /* Kronen-Anhänger */
    part(0, -2.9, 1.2, 4.2, 1.2, 9.4, S2); part(0, 2.9, 1.2, 4.6, 1.2, 9.2, S2);       /* Arme */
    part(0, 3.5, 1.3, 2.2, 1.3, 13.4, S2, .0);                                       /* rechter Arm nach oben */
    sph(SA, SB, 15.6, 2.3, S, 1); for (let i = 0; i < 9; i++) { const g = i / 9 * TAU, p2 = L(SA + Math.sin(g) * 1.6, SB + Math.cos(g) * 1.6); st.cone(p2.x, 16.6 + (i % 3) * .3, p2.z, .9, 3 + (i % 3), S2, 5); } /* Igelhaare */
    sph(SA - 1.9, SB - .8, 15.5, .3, DK); sph(SA - 1.9, SB + .8, 15.5, .3, DK);
    /* Lichtschlüssel (7 m) in der erhobenen Hand: Schaft, Zähne, Parierstange, Stern-Anhänger */
    const kb = (a, b, wb, h, da, y0, col) => bx(SA + a, SB + b, wb, h, da, col, y0);
    kb(0, 4.4, .5, 7, .5, 14.4, GOLD); kb(0, 4.4, 1.9, .4, .5, 14.7, 0x7a4ad8); kb(0, 4.4, .9, .9, .9, 13.9, 0xffffff); for (let i = 0; i < 3; i++) kb(.75, 4.4 + i * .2, 1.1 - i * .25, .7, .4, 17.8 + i * 1.1, GOLD); sph(SA, SB + 4.4, 22.2, .9, GOLD); sph(SA, SB + 4.4, 22.2, 1.3, 0xfff3b0, .6);
    glow(SA, SB + 4.4, 23.4, .9, 0xfff3b0); W.spots.statue = L(SA - 8, SB); W.spots.statueTop = { x: p.x, z: p.z, y: 25 };
    /* Schlüsselloch-Säulen am Rand (leuchten, wenn das Schlüsselloch geöffnet ist – Laufzeit) */
    W.spots.pillars = []; for (let k = 0; k < 5; k++) { const g = -Math.PI / 2 + k / 5 * TAU + .6, a = SA + Math.sin(g) * 20, b = SB + Math.cos(g) * 20, q = L(a, b); st.cyl(q.x, 0, q.z, .9, 1.1, 4.4, 0x8f98ad, 10); st.cyl(q.x, 4.4, q.z, 1.2, 1, .5, 0xc9d0e0, 10); solid(a, b, 1.1, 5); W.spots.pillars.push({ x: q.x, z: q.z, y: 5.6 }); }
    for (let k = 0; k < 8; k++) { const g = k / 8 * TAU + .2; lantern(SA + Math.sin(g) * 25, SB + Math.cos(g) * 25, 3.4, 0xcfe8ff); } }
  /* ---- Dämmerstadt: warme Häuser, Uhrturm, Eisstand, Sonnenuntergangs-Hügel ---- */
  { zone(30, -36, 22, 0xe8c9a0); const HC = [0xe8965a, 0xf0b070, 0xd9785a, 0xf4c68a], RC = [0xa83a2a, 0x8a3a3a, 0x6a3a5a];
    [[16, -50, 9, 8, 6], [24, -50, 8, 8, 7], [44, -50, 9, 8, 6.5], [16, -18, 8, 7, 5.5], [48, -34, 8, 8, 6]].forEach(([a, b, w, d, h], i) => { bx(a, b, w, h, d, HC[i % 4]); const p = L(a, b); st.prism(p.x, h, p.z, d + 1, 2.4, w + 1, RC[i % 3], ry); for (let k = 0; k < 3; k++) { const q = L(a - d / 2 - .05, b - 2 + k * 2); lamp.box(q.x, 2 + (k % 2) * 1.8, q.z, .1, 1.1, .8, 0xffe9a0, ry); } solid(a, b, Math.max(w, d) * .62, h + 2); });
    /* Uhrturm */ { const A = 34, B = -44, p = L(A, B); bx(A, B, 6, 22, 6, 0xd9a070); st.prism(p.x, 22, p.z, 7, 6, 7, 0x6a3a5a, ry); for (const sa of [-3.1, 3.1]) { bx(A + sa, B, 3.8, 3.8, .2, 0xfff6d8, 14); bx(A + sa * 1.03, B, .2, 1.6, .15, 0x2a2a2a, 15); bx(A + sa * 1.03, B, 1.3, .2, .15, 0x2a2a2a, 15.6); } sph(A, B, 29.6, .8, GOLD); solid(A, B, 3.6, 26); W.spots.uhrturm = L(A - 7, B); W.spots.glocke = L(A - 4.2, B + 3); cyl(A - 4.2, B + 3, .1, .1, 2.2, 0x44485a, 0, 6); const g = L(A - 4.2, B + 3); st.sph(g.x, 2.6, g.z, .5, GOLD, 1, 1, 1.2, 1); }
    /* Eisstand mit Streifendach */ { const A = 18, B = -28, p = L(A, B); bx(A, B, 4, 1.2, 2.4, 0xfff0e0); for (let k = 0; k < 6; k++) bx(A - 1.4, B - 2.1 + k * .84, .84, .25, 2.4, k % 2 ? 0xffffff : 0xff5a8f, 2.8); cyl(A - 1.2, B - 1.8, .08, .08, 2.8, 0x6a6a7a, 0, 6); cyl(A - 1.2, B + 1.8, .08, .08, 2.8, 0x6a6a7a, 0, 6); const q = L(A - .2, B); st.cone(q.x, 1.2, q.z, .5, 1.1, 0xe0a458, 6); st.sph(q.x, 2.4, q.z, .55, 0x7fd8ff, 1); solid(A, B, 2.4, 3); W.spots.sk_eis = L(A - 3.2, B); }
    /* Sonnenuntergangs-Hügel mit Bank */ hill(44, -20, 9, 4, .9, 1.7, 0xf0b070, 0xe8965a); { const q = bx(44, -20, 2.4, .5, .8, 0x8a5a33, 3.6 + .0); bx(44, -20.6, 2.4, .8, .15, 0x8a5a33, 4.1); W.spots.sonne = { x: q.x, z: q.z, y: 3.6 }; }
    for (const [a, b] of [[24, -34], [40, -26], [30, -22], [22, -40], [44, -42]]) lantern(a, b, 3.4, 0xffd890); path(14, -34, 52, -34, 3.4, 0xe8c9a0); path(30, -52, 30, -16, 3.4, 0xe8c9a0); W.spots.stadt = L(30, -30); }
  /* ---- Kristall-Burg mit Licht-Rätsel im Hof ---- */
  { const BA = 58, BB = 14, ST = 0xaab6dc, ST2 = 0x8a96c4, BLU = 0x5a6ae8, VIO = 0x8a4ad8;
    bx(BA, BB, 18, 12, 14, ST); bx(BA, BB, 19, 1, 15, 0xe6ecff, 12); for (let k = -4; k <= 4; k++) for (const sd of [-1, 1]) bx(BA + sd * 7.4, BB + k * 2, 1.1, 1.1, .9, 0xe6ecff, 13);
    const pr = L(BA, BB); st.prism(pr.x, 13, pr.z, 14, 5, 12, BLU, ry + Math.PI / 2); solid(BA, BB, 9, 16);
    for (const [a, b] of [[BA - 7, BB - 8], [BA - 7, BB + 8], [BA + 7, BB - 8], [BA + 7, BB + 8]]) { cyl(a, b, 2.4, 2.6, 17, ST2, 0, 12); cone(a, b, 3.4, 8, VIO, 17, 12); glow(a, b, 26, .5, 0xfff3b0); solid(a, b, 3, 18); }
    cyl(BA + 2, BB, 3.6, 3.8, 12, ST, 12, 14); cone(BA + 2, BB, 4.8, 12, BLU, 24, 14); glow(BA + 2, BB, 37, .7, GOLD);
    const dg = L(BA - 7.1, BB); st.box(dg.x, 0, dg.z, .6, 5, 4, 0x4a3a6a, ry); for (const w of [-3, 3]) { const q = L(BA - 7.2, BB + w); lamp.box(q.x, 5, q.z, .12, 2, 1, 0xffe9a0, ry); }
    for (const [a, b] of [[BA - 12, BB - 10], [BA - 12, BB + 10]]) { cyl(a, b, 1.6, 1.8, 1, 0xe6ecff, 0, 10); cone(a, b, 1.4, 3.6, 0x4cd07d, 1, 8); }
    /* Hof: Brunnen + vier Licht-Platten */ { const HA = 44, HB = 14, p = L(HA, HB); zone(HA, HB, 11, 0xe6ecff); st.cyl(p.x, 0, p.z, 2, 2.2, .7, 0xc9d0e0, 16); st.cyl(p.x, .7, p.z, 1.7, 1.7, .1, 0x57c4ff, 16); st.cone(p.x, .8, p.z, .4, 2.2, 0xc9d0e0, 8); solid(HA, HB, 2.3, 1.2);
      W.spots.simon = L(HA, HB); W.spots.plates = [[0, -6], [6, 0], [0, 6], [-6, 0]].map(([da, db]) => L(HA + da, HB + db)); }
    for (const [a, b] of [[44, 4], [44, 24], [54, 28], [54, 2], [38, 14]]) lantern(a, b, 3.2, 0xcfe0ff); path(18, 14, BA - 9, BB, 4.4, 0xd9e2ff); W.spots.burg = L(BA - 12, BB); }
  /* ---- Sternen-Hafen: Landeplatz mit dem Klötzchen-Sternenschiff ---- */
  { const HA = 6, HB = 44, p = L(HA, HB); st.disc(p.x, p.z, 11, ROADY + .004, 0x5a6280, 36); st.ring(p.x, p.z, 8.6, 9.4, ROADY + .008, GOLD, 36); st.ring(p.x, p.z, 4.6, 5.2, ROADY + .008, 0x4da3ff, 36);
    const sb = (a, b, w, h, d, y0, col, yaw) => bx(HA + a, HB + b, w, h, d, col, y0, yaw);
    sb(0, 0, 3.2, 1.8, 7, .6, 0xe8453c); sb(0, 0, 2.4, 1.2, 4, 2.4, 0xf4f4ff); sb(0, -3.4, 1.6, 1.2, 1.6, 1.2, 0xffd23f); sb(0, 1.2, 2.6, .9, 1.2, 3.2, 0x4da3ff); /* Rumpf, Kuppel, Bug, Dach */
    for (const sd of [-1, 1]) { sb(sd * 2.9, 1, .6, 1.6, 4.4, .4, 0x4da3ff, 0); sb(sd * 2.9, -1.4, .4, 2.6, 1.2, .4, 0xffd23f); sb(sd * 1.1, 3.8, 1, 1, 1.4, .8, 0x7a4ad8); lamp.sph(L(HA, HB).x + (sd * 1.1) * -M.uz + 3.8 * M.ux, .9, L(HA, HB).z + (sd * 1.1) * M.ux + 3.8 * M.uz, .45, 0xffa23a, 1); }
    sb(0, 3.8, 1.2, 4, 1.2, 1.2, 0xffffff); solid(HA, HB, 4, 6); W.spots.hafen = L(HA - 9, HB); W.spots.sk_schiff = L(HA, HB); W.spots.mobil = L(-8, 22); for (const [a, b] of [[-8, 26], [-4, 30]]) { const q = L(a, b); W.vehicleSpawns.push({ type: 'keymobil', x: q.x, z: q.z, h: Math.atan2(M.ux, M.uz) + Math.PI / 2 }); } }
  /* ---- Wald der Schatten: dunkle Bäume, Leuchtpilze ---- */
  { const FA = -34, FB = 46; zone(FA, FB, 22, 0x4a3a6a); for (let i = 0; i < 20; i++) { const g = rn() * TAU, d = 4 + Math.sqrt(rn()) * 18, a = FA + Math.sin(g) * d, b = FB + Math.cos(g) * d; if (Math.hypot(a, b) > M.R - 12) continue; tree(a, b, 3 + rn() * 2.4, [0x2a1a4a, 0x3a2a6a, 0x1f1a3a][i % 3], 2 + rn() * .6); }
    for (let i = 0; i < 12; i++) { const g = rn() * TAU, d = 3 + rn() * 19, a = FA + Math.sin(g) * d, b = FB + Math.cos(g) * d; if (Math.hypot(a, b) > M.R - 8) continue; cyl(a, b, .1, .14, .5, 0xe8e0f8, 0, 6); glow(a, b, .6, .3, [0x9affc8, 0xc89aff, 0xffe27a][i % 3]); }
    W.spots.wald = L(FA, FB); }
  /* ---- Wuschel-Dorf: Pilzhäuschen mit Bommeln, Laden und Schmiede ---- */
  { const DA = -42, DB = -46; zone(DA, DB, 15, 0xf2e2b8); [[0, 0, 0xe0382b], [8, 3, 0xffd23f], [-7, 5, 0x4da3ff], [3, -9, 0xb36bff], [-4, -8, 0xff8fc8]].forEach(([da, db, col], i) => { const a = DA + da, b = DB + db; cyl(a, b, 2.2, 2.4, 2.6, 0xf6ead0, 0, 10); cone(a, b, 3.4, 2.6, col, 2.6, 10); sph(a, b, 5.5, .35, 0xffffff); for (let k = 0; k < 5; k++) { const g = k * 1.26, q = L(a + Math.sin(g) * 2.4, b + Math.cos(g) * 2.4); st.sph(q.x, 2.9, q.z, .2, 0xffffff, 0); } lamp.sph(L(a - 2.3, b).x, 1.6, L(a - 2.3, b).z, .22, 0xffd890, 1); solid(a, b, 2.5, 5); });
    for (const [a, b] of [[DA - 6, DB - 4], [DA + 4, DB + 8]]) lantern(a, b, 2.8, 0xffd890); W.spots.wuschel = L(DA + 2, DB + 9); W.spots.schmiede = L(DA - 4, DB + 9); const amb = L(DA - 4, DB + 4); bx(DA - 4, DB + 4, 2.6, 1.1, 1.6, 0x4a4f5a); st.box(amb.x, 1.1, amb.z, 1.1, .5, .8, 0x2a2a2a, ry); st.box(amb.x, 1.6, amb.z, .5, .5, .5, 0xff7a1a, ry); }
  /* ---- Schleier-Turm: Stufenhügel mit hohem Turm ---- */
  { const TA = 62, TB = -38; hill(TA, TB, 13, 8, .9, 1.4, 0xb8b0d0, 0x9a92c0); const p = L(TA, TB); bx(TA, TB, 4, 12, 4, 0xe8e4f4, 7.2); st.prism(p.x, 19.2, p.z, 5, 5, 5, 0x6a4ad8, ry); solid(TA, TB, 2.8, 22); for (let k = 0; k < 4; k++) { const g = k * 1.57 + .4, q = L(TA + Math.sin(g) * 6, TB + Math.cos(g) * 6); st.cyl(q.x, 7.2, q.z, .3, .3, 3, 0xe8e4f4, 6); lamp.sph(q.x, 10.5, q.z, .3, 0xcfe0ff, 1); }
    W.spots.turm = L(TA - 14, TB); W.spots.turmTop = { x: p.x, z: p.z, y: 7.2 }; W.spots.splitter = [[TA - 8, TB - 5, 1.8], [TA + 4, TB + 9, 3.6], [TA - 1, TB - 10, 5.4]].map(([a, b, y]) => Object.assign(L(a, b), { y })); }
  /* ---- Wiesenflecken (verschiedene Grüntöne) und ein paar Bäume ---- */
  { const cols = [0x82c174, 0xa6d591, 0x77b869, 0x8cc77d, 0xb4dd8f], put = [[], [], [], []]; for (let i = 0, n = 0; i < 400 && n < 60; i++) { const a = rn() * TAU, d = Math.sqrt(rn()) * (M.R - 14), r = 3 + rn() * 6, x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d, k = n % 4; if (put[k].some(q => Math.hypot(q[0] - x, q[1] - z) < q[2] + r + .2)) continue; put[k].push([x, z, r]); st.disc(x, z, r, .024 + k * .0008, cols[n % cols.length], 14); n++; }
    for (let i = 0; i < 14; i++) { const a = -70 + rn() * 130, b = -70 + rn() * 140, l = L(a, b); if (Math.hypot(a, b) > M.R - 12 || !W.free(l.x, l.z, 2.5)) continue; if (Math.hypot(a + 14, b) < 24 || Math.hypot(a - 30, b + 34) < 24 || Math.hypot(a - 56, b - 14) < 22 || Math.hypot(a + 34, b - 46) < 24 || Math.hypot(a + 42, b + 46) < 18 || Math.hypot(a - 62, b + 38) < 16 || Math.hypot(a - 6, b - 44) < 14) continue; tree(a, b, 3 + rn() * 1.5, [0x4cb85a, 0x5ac966, 0x3fa84e, 0xe8b84a][i % 4]); } }
};

/* ===================================================================== Laufzeit ===================================================================== */
BI.createSchluessel = function (G) {
  const { scene, W, A, fx, P, say, save, persist, addStars } = G, K = {}, TAU = Math.PI * 2, M = BI.SCHLUESSEL, L = M.at, SP = W.spots, $ = id => document.getElementById(id);
  const S = () => { const s = save.schluessel || (save.schluessel = {}); s.visit |= 0; s.herz |= 0; s.kills |= 0; s.keys = s.keys || {}; s.fr = s.fr || [0, 0, 0, 0, 0]; s.sp = s.sp || [0, 0, 0]; s.eis |= 0; s.bell |= 0; s.simon |= 0; s.blade |= 0; s.owned = s.owned || [0]; s.boss |= 0; s.fin |= 0; s.once = s.once || {}; return s; };
  S();
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#2a2a6a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3b0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  const sg = (txt, p, y, w) => sign(txt, p.x, y, p.z, w);
  sg('🗝️ Schlüsselreich', SP.schluessel, 9, 13); sg('🗽 Lichtwanderer Lio', SP.statue, 30, 12); sg('🌴 Strand der Freunde', SP.sk_strand, 9, 10); sg('🕰️ Dämmerstadt', SP.stadt, 16, 10); sg('🍦 Meersalz-Eis', SP.sk_eis, 5, 6); sg('🏰 Kristall-Burg', SP.burg, 16, 10); sg('💡 Licht-Rätsel', SP.simon, 5, 6);
  sg('🚀 Sternen-Hafen', SP.hafen, 10, 9); sg('🌲 Wald der Schatten', SP.wald, 11, 11); sg('🍄 Wuschel-Dorf', SP.wuschel, 8, 9); sg('🗼 Schleier-Turm', { x: L(62, -38).x, z: L(62, -38).z }, 25, 11); sg('🌇 Sonnenhügel', SP.sonne, 7, 7);
  /* ---- Schlüsselloch-Säulen: grau = zu, golden = offen ---- */
  const pill = SP.pillars.map((q, k) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(.75, 0), new THREE.MeshBasicMaterial({ color: 0x555a70 })); m.scale.set(1, 1.5, 1); m.position.set(q.x, q.y, q.z); scene.add(m); sign(BI.SCHL_KEYS[k][1], q.x, q.y + 2.4, q.z, 2.6); return m; });
  /* ---- Tor der Herzen (öffnet, wenn alle fünf Schlüssellöcher offen sind) ---- */
  const PORT = L(-14, 27), portal = new THREE.Mesh(new THREE.TorusGeometry(3.2, .35, 8, 36), new THREE.MeshBasicMaterial({ color: 0xfff3b0 })); portal.position.set(PORT.x, 3.6, PORT.z); portal.rotation.y = Math.atan2(M.ux, M.uz) + Math.PI / 2; portal.visible = false; scene.add(portal);
  const portalIn = new THREE.Mesh(new THREE.CircleGeometry(3, 28), new THREE.MeshBasicMaterial({ color: 0x7a4ad8, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false })); portalIn.position.copy(portal.position); portalIn.rotation.copy(portal.rotation); portalIn.visible = false; scene.add(portalIn);
  const refreshKeys = () => { const s = S(); BI.SCHL_KEYS.forEach((k, i) => pill[i].material.color.setHex(s.keys[k[0]] ? 0xffd23f : 0x555a70)); portal.visible = portalIn.visible = !!s.fin && !boss.on; };
  /* ---- Lichtschlüssel (5 Aussehen), in der Hand auf der Insel ---- */
  const keyMesh = i => { const [, , , c1, c2] = BI.SCHL_BLADES[i], b = new BI.Batch(); b.box(0, 0, .55, .07, .07, 1.0, c1); b.box(0, 0, 1.15, .05, .05, .3, c1); for (let k = 0; k < 3; k++) b.box(0, -.09 - k * .0, .95 + k * .13, .05, .14, .07, c1); b.box(0, 0, .02, .34, .07, .08, c2); b.sph(0, 0, -.1, .1, c2, 1); if (i === 0) b.sph(0, 0, -.28, .12, 0xffe14a, 0); if (i === 1) { for (let k = 0; k < 5; k++) b.sph(Math.sin(k * 1.26) * .12, Math.cos(k * 1.26) * .12, -.3, .06, 0xffffff, 0); } if (i === 2) b.cone(0, 0, -.3, .08, .22, 0xffe14a, 5); if (i === 3) b.cone(0, 0, -.3, .09, .26, 0xffffff, 4); if (i === 4) { b.sph(0, 0, -.28, .12, 0xffffff, 1); b.sph(.05, 0, -.28, .1, c2, 1); } return b.mesh(BI.mat()); };
  let keyG = null, keyAt = null, keySk = -1; const attach = () => { const ch = G.char && G.char(); if (!ch || !ch.armR) return false; if (keyAt !== ch.armR) { keyAt = ch.armR; keyG = null; keySk = -1; } if (keySk !== S().blade) { if (keyG) keyAt.remove(keyG); keySk = S().blade; keyG = new THREE.Group(); keyG.add(keyMesh(keySk)); keyG.position.set(0, -.78, .06); keyG.rotation.set(-Math.PI / 2 + .35, 0, 0); keyAt.add(keyG); } return true; };
  /* ---- Gegner: Dunkelwichtel und der Dunkelriese ---- */
  const shadowGeo = (() => { const b = new BI.Batch(); b.sph(0, .55, 0, .5, 0x1a1228, 1, 1, .9, 1); b.cone(-.2, .95, 0, .12, .45, 0x1a1228, 4); b.cone(.2, .95, 0, .12, .45, 0x1a1228, 4); b.sph(-.18, .62, .4, .11, 0xffe14a, 0); b.sph(.18, .62, .4, .11, 0xffe14a, 0); b.box(0, .02, 0, .9, .1, .7, 0x2a1a3a); return b.mesh(BI.mat()).geometry; })();
  const NE = 8, E = [], boss = { on: false, g: null, hp: 0, max: 14, x: 0, z: 0, ring: null, rt: 0, ringT: 0, cool: 0, bar: null };
  for (let i = 0; i < NE; i++) { const g = new THREE.Group(), m = new THREE.Mesh(shadowGeo, BI.mat()); g.add(m); g.visible = false; scene.add(g); E.push({ on: false, g, m, x: 0, z: 0, hp: 2, hit: 0, ph: Math.random() * 6, cd: 0, t: 0 }); }
  boss.g = new THREE.Group(); { const m = new THREE.Mesh(shadowGeo, BI.mat()); m.scale.setScalar(3.4); boss.g.add(m); boss.m = m; boss.g.visible = false; scene.add(boss.g); boss.ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 32), new THREE.MeshBasicMaterial({ color: 0xff4a4a, transparent: true, opacity: .6, side: THREE.DoubleSide, depthWrite: false })); boss.ring.rotation.x = -Math.PI / 2; boss.ring.visible = false; scene.add(boss.ring);
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 16; boss.cv = cv; boss.bar = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); boss.bar.scale.set(5, .6, 1); boss.bar.visible = false; scene.add(boss.bar); }
  const drawBar = () => { const c = boss.cv.getContext('2d'); c.clearRect(0, 0, 128, 16); c.fillStyle = '#222'; c.fillRect(0, 0, 128, 16); c.fillStyle = '#ff4a6a'; c.fillRect(2, 2, 124 * Math.max(0, boss.hp) / boss.max, 12); boss.bar.material.map.needsUpdate = true; };
  const onIsle = () => Math.hypot(P.x - M.x, P.z - M.z) < M.R + 4, fromL = (a, b) => L(a, b);
  const safe = (x, z) => { const p = M.loc(x, z); return Math.hypot(p.a + 14, p.b) < 26 || Math.hypot(p.a + 42, p.b + 46) < 19 || Math.hypot(p.a - 6, p.b - 44) < 12 || p.a < -60; };
  const heart = (x, z, n) => { const s = S(); s.herz += n; fx.burst(x, 1.2, z, 12, [[1, .4, .6], [1, .9, .5], [1, 1, 1]], 3, 1, 28, 3); };
  function defeat(e) {
    e.on = false; e.g.visible = false; const s = S(); s.kills++; heart(e.x, e.z, 1 + (Math.random() < .3 ? 1 : 0)); A.star && A.star(); combo++; comboT = 2.2; if (G.note) G.note('kill');
    if (s.kills === 1) { if (G.earn) G.earn('schatten'); say('🗝️ Dunkelwichtel besiegt! Du bekommst 💎 Herz-Kristalle.', 3200); } else if (s.kills % 5 === 0) { addStars(1); say('🗝️ ' + s.kills + ' Dunkelwichtel! +1 ⭐', 2400); } if (combo >= 3) say('✨ Kombo ×' + combo + '!', 1200);
    if (s.kills >= 8) unlock('wald'); if (s.kills >= 10 && G.earn) G.earn('schatten10'); persist();
  }
  let combo = 0, comboT = 0, swingCd = 0;
  function swing() {
    if (swingCd > 0 || P.veh) return; swingCd = .38; P.punchT = .4; P.punchHit = true; A.pop && A.pop(); const fx0 = P.x + Math.sin(P.h) * 1.6, fz0 = P.z + Math.cos(P.h) * 1.6; fx.burst(fx0, 1.2, fz0, 8, [[1, .95, .6], [1, 1, 1]], 3, .8, 28, 1); note(660, .12, 'sine', .08);
    let hit = false; for (const e of E) if (e.on && Math.hypot(e.x - P.x, e.z - P.z) < 3.6) { e.hp--; e.hit = .3; hit = true; const d = Math.atan2(e.x - P.x, e.z - P.z); e.x += Math.sin(d) * 1.4; e.z += Math.cos(d) * 1.4; fx.burst(e.x, .8, e.z, 8, [[.4, .2, .6], [1, .9, .5]], 3, .8, 28, 3); if (e.hp <= 0) defeat(e); }
    if (boss.on && Math.hypot(boss.x - P.x, boss.z - P.z) < 5.4) { boss.hp--; boss.hit = .3; hit = true; fx.burst(boss.x, 2.5, boss.z, 12, [[.5, .2, .8], [1, .9, .5]], 4, 1, 28, 3); drawBar(); if (boss.hp <= 0) bossDown(); }
    if (hit) { note(220, .15, 'square', .06); } else { comboT = Math.min(comboT, .4); }
  }
  const nearE = r => { for (const e of E) if (e.on && Math.hypot(e.x - P.x, e.z - P.z) < r) return true; return boss.on && Math.hypot(boss.x - P.x, boss.z - P.z) < r + 2; };
  function startBoss() {
    const s = S(); boss.on = true; boss.hp = boss.max; boss.hit = 0; const p = L(-14, 14); boss.x = p.x; boss.z = p.z; boss.g.visible = boss.bar.visible = true; boss.cool = 2.5; boss.ringT = 0; drawBar(); refreshKeys(); A.fanfare && A.fanfare(); say('🌑 Der Dunkelriese erscheint! Schwing den Lichtschlüssel – weich den roten Kreisen aus!', 4600); for (const e of E) { e.on = false; e.g.visible = false; }
  }
  function bossDown() {
    boss.on = false; boss.g.visible = boss.bar.visible = boss.ring.visible = false; const s = S(), first = !s.boss; s.boss++; const r = first ? 10 : 3; addStars(r); heart(boss.x, boss.z, first ? 20 : 6); A.fanfare && A.fanfare(); fx.burst(boss.x, 3, boss.z, 50, [[1, .9, .5], [1, .6, .9], [.5, .8, 1], [1, 1, 1]], 7, 1.6, 30, 4);
    say(first ? '🏆 Der Dunkelriese ist besiegt! Alle Welten sind sicher. Du bist ein Schlüsselträger! +' + r + ' ⭐' : '🏆 Der Dunkelriese ist wieder besiegt! +' + r + ' ⭐', 5200); if (first && G.earn) G.earn('schluesseltraeger'); persist(); refreshKeys();
  }
  /* ---- Schlüssellöcher ---- */
  function unlock(id) {
    const s = S(); if (s.keys[id]) return; s.keys[id] = 1; const k = BI.SCHL_KEYS.find(q => q[0] === id); addStars(3); heart(P.x, P.z, 5); A.fanfare && A.fanfare(); refreshKeys();
    const n = Object.keys(s.keys).length; say('🗝️ Schlüsselloch geöffnet: ' + k[1] + ' ' + k[2] + '! +3 ⭐ (' + n + ' von 5)', 4600); [523, 659, 784, 1047].forEach((f, i) => note(f, .5, 'sine', .1, i * .12));
    if (n >= 5 && !s.fin) { s.fin = 1; setTimeout(() => say('🌟 Alle Schlüssellöcher sind offen! Das Tor der Herzen öffnet sich am Platz!', 5200), 2600); refreshKeys(); } persist();
  }
  /* ---- Einsammel-Dinge: Sternfrüchte am Strand, Licht-Splitter am Turm ---- */
  const itemGeo = new THREE.OctahedronGeometry(.4, 0), FR = [[-58, -6], [-64, -8], [-60, -18], [-52, 2], [-66, 4]].map(([a, b]) => L(a, b)), SPL = SP.splitter;
  const frM = FR.map((q, i) => { const m = new THREE.Mesh(itemGeo, new THREE.MeshBasicMaterial({ color: 0xffe14a })); m.scale.set(1, 1.3, 1); m.position.set(q.x, 1.1, q.z); scene.add(m); return m; });
  const spM = SPL.map((q, i) => { const m = new THREE.Mesh(itemGeo, new THREE.MeshBasicMaterial({ color: 0x9ad8ff })); m.scale.set(1.2, 1.8, 1.2); m.position.set(q.x, q.y + 1.1, q.z); scene.add(m); return m; });
  /* ---- Licht-Rätsel in der Burg (Merk-Spiel mit vier Platten) ---- */
  const PC = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d], PF = [330, 392, 494, 587], plates = SP.plates.map((q, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), new THREE.MeshBasicMaterial({ color: PC[i], transparent: true, opacity: .35 })); m.rotation.x = -Math.PI / 2; m.position.set(q.x, .1, q.z); scene.add(m); return m; });
  const Si = { st: 'idle', seq: [], pos: 0, t: 0, lit: -1, litT: 0, last: -1 };
  const lightPlate = (i, d) => { Si.lit = i; Si.litT = d || .5; note(PF[i], .4, 'triangle', .1); };
  function simonStart() { const s = S(); if (s.keys.burg) { say('💡 Dieses Licht-Rätsel hast du schon gelöst! Spiel gern nochmal.', 2400); } const n = 3 + Math.min(2, s.simon); Si.seq = []; for (let i = 0; i < n; i++) Si.seq.push((Math.random() * 4) | 0); Si.st = 'show'; Si.pos = 0; Si.t = 1; Si.last = -1; say('💡 Merk dir die Reihenfolge der leuchtenden Platten – dann tritt in dieser Reihenfolge darauf!', 3600); }
  /* ---- Figuren (alle selbst erfunden) ---- */
  K.people = function (folk) {
    const free = (x, z) => { if (W.free(x, z, .6)) return { x, z }; for (let r = 1; r <= 5; r += 1) for (let k = 0; k < 12; k++) { const g = k / 12 * TAU + r, qx = x + Math.sin(g) * r, qz = z + Math.cos(g) * r; if (W.free(qx, qz, .6)) return { x: qx, z: qz }; } return { x, z }; };
    const mk = (a, b, look, name, lines, face) => { const p = free(L(a, b).x, L(a, b).z), c = BI.makeChar(look), f = face ? L(face[0], face[1]) : L(-60, 0), h = Math.atan2(f.x - p.x, f.z - p.z); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const SK = { fair: 0xf6d2b0, tan: 0xd8a070, dark: 0x8a5a33, white: 0xf6f6f6, grey: 0x8a8aa0 };
    /* Strand */
    mk(-52, -12, { shirt: 0x2a2a3a, pants: 0x1a1a2a, hair: 0xe8e8f4, skin: SK.fair, hat: 'none', style: 'long', scale: 1.05 }, 'Rivo', ['Ich bin Rivo. Lio und ich waren schon als Kinder Freunde. 🌊', 'Er wollte immer die Welten sehen. Ich auch!', 'Pass im Wald auf: Dunkelwichtel mögen keine Freunde.'], [-60, 0]);
    mk(-50, -16, { shirt: 0xff8fc8, pants: 0xffffff, hair: 0xd06040, skin: SK.fair, hat: 'none', style: 'ponytail', dress: true, scale: .98 }, 'Luma', ['Hallo, ich bin Luma! 🌸', 'Am krummen Palmenbaum wachsen Sternfrüchte. Sammle fünf davon!', 'Man sagt: Wer eine Sternfrucht teilt, bleibt für immer Freund.'], [-60, 0]);
    mk(-47, 8, { shirt: 0xffd23f, pants: 0x4da3ff, hair: 0x6a4a2a, skin: SK.tan, hat: 'none', style: 'spiky', scale: .62 }, 'Kiko', ['Ich baue ein Floß! Fast fertig. 🛶', 'Hilfst du mir? Ach nee, du hast ja Wichtigeres vor.'], [-58, 12]);
    mk(-46, 11, { shirt: 0xff5a8a, pants: 0xffffff, hair: 0xf4c040, skin: SK.fair, hat: 'none', style: 'twinbuns', dress: true, scale: .6 }, 'Mara', ['Ich sammle Muscheln für das Sandschloss. 🐚', 'Das Meer rauscht so schön.'], [-58, 12]);
    mk(-58, 22, { shirt: 0xc8903c, pants: 0x6a4a2a, hair: 0xffffff, skin: SK.tan, hat: 'cowboy', style: 'short', beard: 5, beardc: 0xffffff, scale: 1.0 }, 'Fischer Opa Alwin', ['Früher war hier nur Sand. Jetzt ist hier die ganze Welt!', 'Mein Tipp: Stell dich an den Strand und fang einen Fisch. 🎣'], [-64, 26]);
    /* Plattform */
    mk(-22, -9, { shirt: 0x2a6ae8, pants: 0xf4f4ff, hair: 0xffffff, skin: SK.fair, hat: 'wizard', style: 'long', beard: 6, beardc: 0xffffff, cape: true, scale: 1.1 }, 'Meister Orrin', ['Willkommen, Wanderer! Ich bin Meister Orrin. 🧙', 'Diese Statue zeigt Lio, den Lichtwanderer. Er hat die Welten gerettet.', 'Fünf Schlüssellöcher sind versiegelt. Öffne sie alle – dann öffnet sich das Tor der Herzen!', 'Dein Lichtschlüssel hilft dir gegen die Dunkelwichtel. 🗝️'], [-14, 0]);
    mk(-6, 8, { shirt: 0xe8453c, pants: 0x1a1a22, hair: 0x7a4a2a, skin: SK.fair, hat: 'none', style: 'spiky', scale: 1.0 }, 'Lio', ['Hi! Ich bin Lio – die Statue ist viel zu groß geraten! 😅', 'Die Welten sind nur dunkel, wenn niemand sie mag. Halt zu deinen Freunden!', 'Mit dem Lichtschlüssel öffnest du Türen und Herzen.'], [-14, 0]);
    mk(-8, -12, { shirt: 0x3a6ae8, pants: 0xf4f4ff, hair: 0x2a2a3a, skin: 0x2a3a6a, hat: 'wizard', style: 'none', scale: .6 }, 'Pico der Zauber-Pinguin', ['Plitsch-platsch-ZAUBER! 🐧', 'Ich zaubere Feuer, Eis und Blitze. Meistens klappt es.', 'Bruno passt auf mich auf. Er ist ein Ritter!'], [-14, 0]);
    mk(-9, -9, { shirt: 0x8a8a96, pants: 0x4a4a5a, hair: 0xf4f4f4, skin: 0x9a9aa6, hat: 'helmet', style: 'none', scale: 1.15 }, 'Bruno der Dachs-Ritter', ['Bruno meldet: Alles in Ordnung! 🛡️', 'Ein Ritter beschützt seine Freunde – und manchmal auch Pico.', 'Der Dunkelriese ist riesig, aber du bist stärker!'], [-14, 0]);
    /* Dämmerstadt */
    mk(14, -26, { shirt: 0xffffff, pants: 0xff5a8f, hair: 0x6a3a2a, skin: SK.tan, hat: 'chef', style: 'curly', scale: 1.0 }, 'Eisverkäufer Sal', ['Meersalz-Eis! Süß und salzig – das beste der Welt! 🍦', 'Hol dir eins am Stand. Vielleicht freut sich jemand über ein Eis.'], [18, -28]);
    mk(30, -40, { shirt: 0x6a4a2a, pants: 0x3a2a1a, hair: 0xe8e8e8, skin: SK.fair, hat: 'tophat', style: 'short', beard: 5, beardc: 0xe8e8e8, scale: 1.0 }, 'Uhrmacher Tilo', ['Tick tack. Ich bin Tilo, der Uhrmacher. 🕰️', 'Die Glocke vom Uhrturm schweigt. Ich habe so einen Durst nach etwas Süßem …', 'Bring mir ein Meersalz-Eis von Sal, dann läutest du die Glocke für mich!'], [34, -44]);
    mk(24, -34, { shirt: 0xff9a3a, pants: 0x3a4a8a, hair: 0x4a2a1a, skin: SK.tan, hat: 'cap', style: 'short', scale: .62 }, 'Pim', ['Wir spielen Fangen! Du kannst mich nicht kriegen. 🏃'], [18, -28]);
    mk(26, -31, { shirt: 0x6ad07a, pants: 0x3a4a8a, hair: 0x2a2a3a, skin: SK.dark, hat: 'none', style: 'afro', scale: .6 }, 'Pam', ['Pim ist so schnell! Aber ich bin schlauer. 😎'], [18, -28]);
    mk(40, -24, { shirt: 0xe8965a, pants: 0x5a3a2a, hair: 0x2a2a2a, skin: SK.fair, hat: 'none', style: 'bob', dress: true, scale: .96 }, 'Zeitreisende Sunny', ['Von hier oben sieht der Sonnenuntergang am schönsten aus. 🌇', 'Er ist jeden Abend orange und rosa.'], [44, -20]);
    /* Burg */
    mk(46, 14, { shirt: 0x5a6ae8, pants: 0xe6ecff, hair: 0xe8f0ff, skin: SK.fair, hat: 'crown', style: 'long', dress: true, cape: true, scale: 1.08 }, 'Hüterin Aurelle', ['Ich bin Aurelle, die Hüterin der Kristall-Burg. 🏰', 'Im Hof liegt ein altes Licht-Rätsel: vier Platten, ein Muster.', 'Merk dir die Reihenfolge und tritt auf die Platten – ich traue es dir zu!'], [44, 14]);
    mk(52, 22, { shirt: 0x8a5a3a, pants: 0x4a3a2a, hair: 0xe8d8c0, skin: SK.fair, hat: 'none', style: 'bun', dress: true, scale: .95 }, 'Bibliothekarin Ferda', ['Psst, in der Bibliothek ist es leise. 📚', 'Hier steht alles über die sieben Welten.'], [58, 14]);
    mk(40, 4, { shirt: 0x4cd07d, pants: 0x4a6a3a, hair: 0xc0a040, skin: SK.fair, hat: 'flowers', style: 'wavy', dress: true, scale: .95 }, 'Gärtnerin Flora', ['Kristall-Blumen leuchten im Dunkeln! 🌷', 'Sie wachsen nur dort, wo Freunde zusammenstehen.'], [44, 8]);
    /* Hafen */
    mk(0, 38, { shirt: 0xe8453c, pants: 0x2a2a3a, hair: 0x7a4a2a, skin: SK.tan, hat: 'helmet', style: 'short', scale: 1.05 }, 'Kapitän Nova', ['Ahoi, Sternenreisender! Ich bin Kapitän Nova. 🚀', 'Mein Klötzchen-Schiff fliegt zu allen Welten. Tippe am Automaten auf „Weltenreise“!', 'Oder nimm das Schlüsselschwert-Mobil – das fliegt auch!'], [6, 44]);
    mk(12, 38, { shirt: 0xffd23f, pants: 0x3a4a8a, hair: 0xff5a8a, skin: SK.fair, hat: 'goggles' === 'x' ? 'none' : 'headphones', style: 'pixie', scale: .98 }, 'Mechanikerin Zahni', ['Ich schraube am Schlüsselschwert-Mobil. 🔧', 'Es fliegt wie ein Brett durch die Luft! Steigen mit ⬆, Sinken mit ⬇.'], [8, 44]);
    /* Wald */
    mk(-22, 36, { shirt: 0x4a2a6a, pants: 0x2a1a3a, hair: 0x9a8ac0, skin: SK.fair, hat: 'none', style: 'long', dress: true, cape: true, scale: 1.0 }, 'Waldhexe Nyx', ['Hu-hu! Ich bin Nyx. Die Schatten im Wald sind eigentlich einsam. 🌙', 'Aber sie springen dich an. Besiege acht Dunkelwichtel, dann öffnet sich ein Schlüsselloch!'], [-34, 46]);
    /* Wuschel-Dorf */
    mk(-40, -37, { shirt: 0xff8fc8, pants: 0xffffff, hair: 0xffb0d8, skin: 0xffe8f0, hat: 'bunny', style: 'none', scale: .55 }, 'Wuschel Bommel', ['Kupo-kupo! Ich bin Bommel, ein Wuschel! 🧸', 'Wuscheln mögen Bommeln, Honig und Herz-Kristalle.'], [-42, -46]);
    mk(-45, -38, { shirt: 0xffd23f, pants: 0xffffff, hair: 0xffe890, skin: 0xfff4d8, hat: 'bunny', style: 'none', scale: .5 }, 'Wuschel Fussel', ['Kupo! Hast du 💎 für Pom? Sie hat tolle Sachen.'], [-42, -46]);
    mk(-38, -35, { shirt: 0x4da3ff, pants: 0xffffff, hair: 0x9ad0ff, skin: 0xeaf4ff, hat: 'bunny', style: 'none', scale: .5 }, 'Wuschel Plüsch', ['Kupo! Mein Bommel ist der größte! Fast. 😤'], [-42, -46]);
    mk(-40, -34, { shirt: 0xe0382b, pants: 0x6a4a2a, hair: 0x3a2a2a, skin: SK.tan, hat: 'cap', style: 'short', beard: 4, beardc: 0x3a2a2a, scale: 1.05 }, 'Schmied Kupfer', ['Klong! Ich schmiede Lichtschlüssel in allen Formen. 🔨', 'Sternen-, Blüten-, Flammen-, Eis- und Mondschlüssel – such dir einen aus!'], [-40, -34]);
    mk(-34, -35, { shirt: 0xb36bff, pants: 0xffffff, hair: 0xe8c8ff, skin: 0xfff0f8, hat: 'bunny', style: 'none', dress: true, scale: .6 }, 'Händlerin Pom', ['Kupo! Willkommen im Wuschel-Laden! 🛍️', 'Tausche Herz-Kristalle gegen neue Lichtschlüssel.'], [-42, -46]);
    /* Schleier-Turm */
    mk(60, -34, { shirt: 0xffffff, pants: 0xffffff, hair: 0xf4f4f4, skin: SK.fair, hat: 'none', style: 'long', cape: true, scale: 1.1 }, 'Schleier Eins', ['Wir sind der Schleier-Orden. Wir sehen alles, wir sagen wenig. 👁️', 'Drei Licht-Splitter liegen auf den Stufen. Sammle sie, dann öffnet sich das Siegel.'], [62, -38]);
    for (let k = 0; k < 6; k++) { const g = k / 6 * TAU + .3; mk(62 + Math.sin(g) * 4.4, -38 + Math.cos(g) * 4.4, { shirt: 0xf4f4ff, pants: 0xf4f4ff, hair: 0xdedeea, skin: SK.fair, hat: 'none', style: 'long', cape: true, scale: 1.05 }, 'Schleier ' + ['Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben'][k], [['Wir sind nicht böse. Nur geheimnisvoll. 🌫️'], ['Hast du die Splitter gesehen? Sie glitzern blau. 💠'], ['Ohne Herz kein Licht. Mit Herz alles. 💛'], ['Der Turm ist alt. Älter als die Statue.'], ['Pssst. Wir flüstern nur.'], ['Tick tack. Das war Tilo, nicht wir.']][k], [62, -38]); }
  };
  /* ---- Aktionstaste ---- */
  const nr = (o, r) => o && Math.hypot(P.x - o.x, P.z - o.z) < r;
  K.busy = () => false;
  K.near = function () {
    if (P.veh || P.y > 12 || !onIsle()) return null; const s = S();
    if (Si.st === 'show') return { k: 'idle0', label: ['👀', 'Gut aufpassen …'] };
    if (nr(SP.simon, 4) && Si.st === 'idle') return { k: 'msimon', label: ['💡', 'Licht-Rätsel starten'] };
    if (nr(SP.sk_eis, 3.4)) return { k: 'meis', label: ['🍦', 'Meersalz-Eis holen'] };
    if (s.eis === 1 && nr(SP.uhrturm, 4.5)) return { k: 'mtilo', label: ['🍦', 'Eis an Tilo geben'] };
    if (nr(SP.glocke, 3.2)) return { k: 'mbell', label: ['🔔', 'Glocke läuten'] };
    if (nr(SP.sonne, 2.6) && P.y > 3) return { k: 'msun', label: ['🌇', 'Sonnenuntergang ansehen'] };
    if (nr(SP.statue, 8)) return { k: 'mstat', label: ['🗝️', 'Statue berühren'] };
    if (s.fin && !boss.on && nr({ x: PORT.x, z: PORT.z }, 5)) return { k: 'mportal', label: ['🌟', 'Tor der Herzen öffnen'] };
    if (nr(SP.wuschel, 4.5) || nr(SP.schmiede, 3.5)) return { k: 'mshop', label: ['💎', 'Wuschel-Laden'] };
    if (nr(SP.mobil, 3.6)) return { k: 'mmobil', label: ['🗝️', 'Schlüsselschwert-Mobil rufen'] };
    if (nearE(3.6) && swingCd <= 0) return { k: 'mswing', label: ['🗝️', 'Schwingen!'] };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'mswing') { swing(); return; }
    if (n.k === 'msimon') { simonStart(); return; }
    if (n.k === 'meis') { A.pop && A.pop(); fx.burst(SP.sk_eis.x, 1.6, SP.sk_eis.z, 10, [[1, .6, .8], [.6, .9, 1], [1, 1, 1]], 2.4, 1, 28, 3); if (!s.eis) { s.eis = 1; persist(); say('🍦 Meersalz-Eis! Süß und salzig. Uhrmacher Tilo hätte sicher auch gern eins …', 4200); } else say('🍦 Lecker! Das Eis schmeckt nach Meer und Sonne.', 2400); return; }
    if (n.k === 'mtilo') { s.eis = 2; addStars(1); persist(); A.fanfare && A.fanfare(); say('🕰️ Tilo: „Mmmh, danke! Jetzt läute die Glocke am Uhrturm für mich!“ +1 ⭐', 4600); return; }
    if (n.k === 'mbell') { if (s.eis < 2) { say('🔔 Tilo hätte gern erst ein Meersalz-Eis von Sal. Dann läutest du die Glocke!', 3600); return; } note(392, 1.6, 'sine', .14); note(523, 1.6, 'sine', .1, .05); fx.burst(SP.glocke.x, 3, SP.glocke.z, 16, [[1, .9, .5], [1, 1, 1]], 3, 1, 28, 2); if (!s.bell) { s.bell = 1; persist(); unlock('stadt'); } else say('🔔 Bimm-bamm! Die Glocke klingt über die ganze Insel.', 2600); return; }
    if (n.k === 'msun') { fx.burst(SP.sonne.x, 5, SP.sonne.z, 20, [[1, .6, .3], [1, .8, .5], [1, .5, .8]], 4, 1.2, 28, 1); if (!s.once.sun) { s.once.sun = 1; persist(); addStars(1); say('🌇 Wie schön! Der Himmel ist orange und rosa. +1 ⭐', 3600); } else say('🌇 Der Sonnenuntergang ist wunderschön.', 2400); return; }
    if (n.k === 'mstat') { A.fanfare && A.fanfare(); fx.burst(SP.statue.x, 3, SP.statue.z, 24, [[1, .9, .5], [1, 1, 1], [.6, .8, 1]], 5, 1.4, 28, 2); if (!s.once.stat) { s.once.stat = 1; persist(); addStars(1); say('🗽 Lichtwanderer Lio: Er hat die Welten mit seinem Lichtschlüssel gerettet. +1 ⭐', 4600); } else say('🗽 Die Statue funkelt. Lio hat die Welten gerettet.', 2800); A.speak && A.speak('Lichtwanderer Lio hat die Welten gerettet.'); return; }
    if (n.k === 'mportal') { startBoss(); return; }
    if (n.k === 'mshop') { K.shop(); return; }
    if (n.k === 'mmobil') { G.callMobil && G.callMobil(); A.fanfare && A.fanfare(); say('🗝️ Dein Schlüsselschwert-Mobil ist da! Einsteigen und los – ⬆ steigen, ⬇ sinken.', 3600); return; }
  };
  K.fun = k => { if (k === 'schluessel') { if (!onIsle()) { say('🗝️ Der Lichtschlüssel wirkt im Schlüsselreich. Dort kannst du Dunkelwichtel vertreiben!', 3000); return; } swing(); } };
  /* ---- Laden: Lichtschlüssel kaufen/wählen, Mobil rufen ---- */
  K.open = false;
  K.shop = function () { if (K.open) return; K.open = true; G.setStick && G.setStick(0, 0); renderShop(); $('schlPanel').hidden = false; };
  K.close = function () { if (!K.open) return; K.open = false; $('schlPanel').hidden = true; G.updateButtons && G.updateButtons(true); persist(); };
  function renderShop() {
    const s = S(), b = $('schlBox'); if (!b) return; b.innerHTML = ''; const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
    b.appendChild(el('div', 'logo', '🛍️ Wuschel-Laden')); b.lastChild.style.fontSize = '30px'; b.appendChild(el('div', 'sub', '💎 ' + s.herz + ' Herz-Kristalle')); b.lastChild.style.margin = '4px 0 10px';
    const grid = el('div', ''); grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 4px 10px';
    BI.SCHL_BLADES.forEach((q, i) => { const own = s.owned.includes(i), sel = s.blade === i, c = el('button', '', '<div style="font-size:40px">' + q[1] + '</div><div style="font-size:14px;font-weight:800">' + q[0] + '</div><div style="font-size:13px;font-weight:800;color:' + (sel ? '#2a9a4a' : own ? '#3f9bff' : '#b07a00') + '">' + (sel ? '✔ in der Hand' : own ? 'Wählen' : '💎 ' + q[2]) + '</div>'); c.type = 'button'; c.style.cssText = 'border-radius:16px;border:4px solid ' + (sel ? '#4cd07d' : own ? '#8fb8ff' : '#e0c060') + ';background:#fff;padding:8px 2px;cursor:pointer;font-family:inherit';
      c.onclick = () => { if (!own) { if (s.herz < q[2]) { say('💎 Dafür brauchst du noch ' + (q[2] - s.herz) + ' Herz-Kristalle. Vertreibe Dunkelwichtel!', 2800); return; } s.herz -= q[2]; s.owned.push(i); A.buy && A.buy(); say('🗝️ ' + q[0] + ' gekauft!', 2200); } s.blade = i; attach(); persist(); renderShop(); }; grid.appendChild(c); }); b.appendChild(grid);
    const mb = el('button', 'big', '🗝️ Schlüsselschwert-Mobil rufen'); mb.style.cssText = 'font-size:18px;padding:10px 20px;margin:4px'; mb.onclick = () => { G.callMobil && G.callMobil(); K.close(); say('🗝️ Dein Schlüsselschwert-Mobil ist da!', 2600); }; b.appendChild(mb);
    const done = el('button', 'big', '✔ Fertig'); done.style.cssText = 'margin:6px;font-size:20px;padding:10px 28px'; done.onclick = () => K.close(); b.appendChild(done);
  }
  addEventListener('keydown', e => { if (K.open && e.code === 'Escape') { K.close(); e.preventDefault(); } });
  /* ---- Aufgaben-Log ---- */
  K.log = function () {
    const s = S(), rows = BI.SCHL_KEYS.map(([id, ic, nm]) => ({ ok: !!s.keys[id], icon: '🗝️', text: 'Schlüsselloch ' + ic + ' ' + nm + ({ strand: ': 5 Sternfrüchte sammeln (' + s.fr.filter(Boolean).length + '/5)', stadt: ': Meersalz-Eis → Tilo → Glocke läuten', burg: ': Licht-Rätsel im Burghof', wald: ': 8 Dunkelwichtel besiegen (' + Math.min(8, s.kills) + '/8)', turm: ': 3 Licht-Splitter am Schleier-Turm (' + s.sp.filter(Boolean).length + '/3)' })[id], dest: id === 'stadt' ? 'stadt_s' : id === 'burg' ? 'burg_s' : id === 'wald' ? 'wald_s' : id === 'turm' ? 'turm_s' : 'strand_s' }));
    rows.push({ ok: s.boss > 0, icon: '🌑', text: 'Das Tor der Herzen öffnen und den Dunkelriesen besiegen', dest: 'statue_s' }); rows.push({ ok: s.once.mobil === 1, icon: '🗝️', text: 'Mit dem Schlüsselschwert-Mobil fliegen', dest: 'hafen_s' });
    return { title: '🗝️ Schlüsselreich', count: (Object.keys(s.keys).length + (s.boss > 0 ? 1 : 0) + (s.once.mobil ? 1 : 0)) + ' von 7', rows };
  };
  K.ride = function () { const s = S(); if (!s.once.mobil) { s.once.mobil = 1; persist(); addStars(1); if (G.earn) G.earn('mobil_s'); say('🗝️ Du fliegst auf dem Schlüsselschwert-Mobil! +1 ⭐', 3600); } };
  K.dbg = { E, boss, Si, defeat, unlock, swing, startBoss, simonStart };
  /* ---- Bild für Bild ---- */
  let was = false, t0 = 0, spawnT = 3;
  K.update = function (dt, t) {
    const raw = Math.min(dt, .25), ins = onIsle(); swingCd -= raw; if (comboT > 0 && (comboT -= raw) <= 0) combo = 0;
    if (ins !== was) { was = ins; if (ins) { const s = S(); if (!s.visit) { s.visit = 1; persist(); addStars(1); if (G.earn) G.earn('schluesselreich'); say('🗝️ Willkommen im Schlüsselreich! Du hast einen Lichtschlüssel bekommen. +1 ⭐', 5200); } else say('🗝️ Schlüsselreich', 2000); refreshKeys(); } }
    /* Lichtschlüssel in der Hand (nur auf der Insel, nicht im Fahrzeug) */
    if (attach()) keyG.visible = ins && !P.veh;
    const near = Math.hypot(P.x - M.x, P.z - M.z) < 260; for (let i = 0; i < 5; i++) pill[i].rotation.y = t * 1.2 + i; if (!near) return;
    portal.rotation.z = t * .6; if (portal.visible) portalIn.material.opacity = .45 + Math.sin(t * 3) * .12;
    /* Sammel-Dinge */
    for (let i = 0; i < 5; i++) { const m = frM[i], s = S(), got = s.fr[i]; m.visible = !got; if (!got) { m.rotation.y = t * 2 + i; m.position.y = 1.1 + Math.sin(t * 2 + i) * .15; if (ins && !P.veh && Math.hypot(P.x - FR[i].x, P.z - FR[i].z) < 1.7) { s.fr[i] = 1; A.star && A.star(); fx.burst(FR[i].x, 1.4, FR[i].z, 12, [[1, .9, .4], [1, 1, 1]], 3, 1, 28, 3); const n = s.fr.filter(Boolean).length; say('🌟 Sternfrucht! (' + n + ' von 5)', 1800); persist(); if (n >= 5) unlock('strand'); } } }
    for (let i = 0; i < 3; i++) { const m = spM[i], s = S(), got = s.sp[i]; m.visible = !got; if (!got) { m.rotation.y = t * 1.6 + i; m.position.y = SPL[i].y + 1.1 + Math.sin(t * 2 + i) * .18; if (ins && !P.veh && Math.hypot(P.x - SPL[i].x, P.z - SPL[i].z) < 2 && P.y > SPL[i].y - 1.4) { s.sp[i] = 1; A.star && A.star(); fx.burst(SPL[i].x, SPL[i].y + 1.4, SPL[i].z, 14, [[.6, .85, 1], [1, 1, 1]], 3, 1, 28, 3); const n = s.sp.filter(Boolean).length; say('💠 Licht-Splitter! (' + n + ' von 3)', 1800); persist(); if (n >= 3) unlock('turm'); } } }
    /* Licht-Rätsel */
    for (let i = 0; i < 4; i++) plates[i].material.opacity = Si.lit === i ? .95 : .35; if (Si.litT > 0 && (Si.litT -= raw) <= 0) Si.lit = -1;
    if (Si.st === 'show') { Si.t -= raw; if (Si.t <= 0) { if (Si.pos < Si.seq.length) { lightPlate(Si.seq[Si.pos], .45); Si.pos++; Si.t = .8; } else { Si.st = 'input'; Si.pos = 0; Si.t = 14; say('💡 Jetzt du! Tritt auf die Platten in derselben Reihenfolge.', 2600); } } }
    else if (Si.st === 'input') { Si.t -= raw; let on = -1; for (let i = 0; i < 4; i++) if (Math.hypot(P.x - SP.plates[i].x, P.z - SP.plates[i].z) < 1.4) on = i; if (on !== Si.last) { Si.last = on; if (on >= 0) { lightPlate(on, .35); if (on === Si.seq[Si.pos]) { Si.pos++; if (Si.pos >= Si.seq.length) { const s = S(); Si.st = 'idle'; s.simon++; addStars(1); A.fanfare && A.fanfare(); say('💡 Geschafft! Runde ' + Math.min(3, s.simon) + ' von 3. +1 ⭐', 2800); persist(); if (s.simon >= 3) unlock('burg'); } } else { Si.st = 'idle'; A.bonk && A.bonk(); say('💡 Nicht ganz – versuch es nochmal! Tippe wieder auf „Licht-Rätsel“.', 2800); } } } if (Si.t <= 0) { Si.st = 'idle'; say('💡 Zu langsam – versuch es nochmal!', 2000); } }
    /* Dunkelwichtel */
    if (ins && !P.veh && !boss.on) { spawnT -= raw; const cnt = E.filter(e => e.on).length; if (spawnT <= 0 && cnt < NE) { spawnT = 2.5 + Math.random() * 2.5; for (let tr = 0; tr < 10; tr++) { const a = Math.random() * TAU, d = 9 + Math.random() * 10, x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d; if (Math.hypot(x - M.x, z - M.z) > M.R - 10 || safe(x, z) || !W.free(x, z, .8) || W.groundY(x, z) > .3) continue; const e = E.find(q => !q.on); if (!e) break; e.on = true; e.x = x; e.z = z; e.hp = 2; e.hit = 0; e.cd = 1; e.g.visible = true; fx.burst(x, .6, z, 8, [[.3, .15, .5], [.6, .3, .9]], 2, .8, 28, 2); break; } } }
    for (const e of E) { if (!e.on) continue; const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz); if (d > 40 || P.veh && d > 30 || !ins) { e.on = false; e.g.visible = false; continue; } e.t += raw; e.cd -= raw; e.hit = Math.max(0, e.hit - raw);
      if (d < 16 && !(safe(P.x, P.z))) { const sp = 2.3; const nx = e.x + dx / d * sp * raw, nz = e.z + dz / d * sp * raw; if (d > 1.1 && W.free(nx, nz, .5)) { e.x = nx; e.z = nz; } if (d < 1.2 && e.cd <= 0) { e.cd = 2; P.x -= dx / d * 1.8; P.z -= dz / d * 1.8; A.bump && A.bump(); say('💥 Hoppla! Ein Dunkelwichtel – schwing den Lichtschlüssel!', 1800); } } else { e.x += Math.sin(e.ph + e.t * .4) * .6 * raw; e.z += Math.cos(e.ph + e.t * .4) * .6 * raw; }
      e.g.position.set(e.x, Math.abs(Math.sin(e.t * 5 + e.ph)) * .25, e.z); e.g.rotation.y = Math.atan2(dx, dz); e.g.scale.setScalar(e.hit > 0 ? 1.25 : 1); }
    /* Dunkelriese */
    if (boss.on) { const dx = P.x - boss.x, dz = P.z - boss.z, d = Math.hypot(dx, dz); boss.t = (boss.t || 0) + raw; boss.hit = Math.max(0, (boss.hit || 0) - raw); if (d > 4.6) { const sp = 1.6; boss.x += dx / d * sp * raw; boss.z += dz / d * sp * raw; } boss.g.position.set(boss.x, Math.abs(Math.sin(boss.t * 2)) * .4, boss.z); boss.g.rotation.y = Math.atan2(dx, dz); boss.g.scale.setScalar(boss.hit > 0 ? 1.12 : 1); boss.bar.position.set(boss.x, 6.2, boss.z);
      boss.cool -= raw; if (boss.cool <= 0 && !boss.ringT) { boss.ringT = 1.6; boss.rx = P.x; boss.rz = P.z; boss.cool = 4.5; boss.ring.visible = true; boss.ring.position.set(boss.rx, .12, boss.rz); note(110, .8, 'sawtooth', .08); }
      if (boss.ringT > 0) { boss.ringT -= raw; boss.ring.scale.setScalar(1 + (1 - boss.ringT / 1.6) * 3.4); boss.ring.material.opacity = .35 + (1 - boss.ringT / 1.6) * .4; if (boss.ringT <= 0) { boss.ringT = 0; boss.ring.visible = false; fx.burst(boss.rx, .5, boss.rz, 22, [[.8, .2, .2], [1, .7, .3]], 5, 1, 28, 2); A.bump && A.bump(); if (Math.hypot(P.x - boss.rx, P.z - boss.rz) < 4.4 && !P.veh) { const a = Math.atan2(P.x - boss.rx, P.z - boss.rz); P.x += Math.sin(a) * 4; P.z += Math.cos(a) * 4; say('💥 Hoppla! Weich den roten Kreisen aus!', 1800); } } } }
  };
  refreshKeys();
  return K;
};

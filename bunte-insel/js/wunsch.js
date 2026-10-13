'use strict';
/* Bunte Insel – Wunsch-Insel 🌠 (Erweiterung des Schlüsselreichs, selbst erfunden, „inspiriert“ von der Stimmung von Strand- und Dunkelheits-Geschichten):
   kleine Insel hinter dem Schlüsselreich, erreichbar über eine lange Holzbrücke an der Westküste. Strand mit Palmen, Hütte mit Hängematte, großer Baum mit Geheimversteck,
   Wunschfrüchte, geheime Schlucht mit leuchtenden Wandzeichen, Floß-Bauplatz, Aussichtsturm mit Kletterwegen und Truhen, versiegelte Schattenarena.
   Lokale Koordinaten (a, b): a = nach außen (weg vom Schlüsselreich), b = quer dazu. Laufzeit & Kämpfe: js/wunsch-game.js. */
BI.WUNSCH = (function () {
  const M = BI.SCHLUESSEL, R = 66, cx = M.at(M.R + 30 + R, 0).x, cz = M.at(M.R + 30 + R, 0).z, ux = M.ux, uz = M.uz;
  const A0 = M.at(M.R - 4, 0), A1 = { x: cx + ux * -(R - 5), z: cz + uz * -(R - 5) };
  const T = { id: 'wunsch', partOf: 'SCHLUESSEL', x: cx, z: cz, R, ux, uz, hills: [], rects: [], ex: [], entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
  T.at = (a, b) => ({ x: cx + ux * a - uz * b, z: cz + uz * a + ux * b });
  T.loc = (x, z) => { const dx = x - cx, dz = z - cz; return { a: dx * ux + dz * uz, b: -dx * uz + dz * ux }; };
  /* Höhe des Bodens: Felsen-Stufen (Hügel) und Holzplattformen (Rechtecke) – world.js (groundY) fragt das ab */
  T.floor = function (x, z) {
    const p = T.loc(x, z); if (Math.abs(p.a) > R + 4 || Math.abs(p.b) > R + 4) return 0;
    for (const r of T.rects) if (p.a > r.a0 && p.a < r.a1 && p.b > r.b0 && p.b < r.b1) return r.y;
    for (const h of T.hills) { const d = Math.hypot(p.a - h.a, p.b - h.b); if (d < h.r0) return Math.min(h.tiers, 1 + Math.floor((h.r0 - d) / h.dr)) * h.step; }
    return 0;
  };
  /* zusätzlich begehbar: Holzstege zu den Mini-Inselchen und die Inselchen selbst (world.js → isleWalk) */
  T.walkExtra = function (x, z, r) { const p = T.loc(x, z); for (const e of T.ex) { if (e.r) { if (Math.hypot(p.a - e.a, p.b - e.b) <= e.r - r) return true; } else if (p.a > e.a0 + r * .3 && p.a < e.a1 - r * .3 && p.b > e.b0 + r * .3 && p.b < e.b1 - r * .3) return true; } return false; };
  /* Orte der Aufgaben (lokal) – Welt UND Laufzeit benutzen dieselben Zahlen */
  T.P = {
    fruits: [[-46, 26], [-14, -37], [33, -46]], hut: [-18, -28], hammock: [-8, -40], tree: [30, -44], nook: [33, -48.5], symbol: [30, -44],
    gorge: { a0: -4, a1: 16, b0: 27, b1: 34 }, crystal: [-2, 30.5], glyphs: [[3, 27.4], [7.5, 27.4], [12, 27.4], [4, 33.6], [10, 33.6]], door: [16, 30.5],
    raft: [-42, -16], dock: [-80, -16], buoy: [-104, -30], parts: [['holz', -48, 40], ['holz', 44, 8], ['holz', 6, -8], ['seil', -20, -34], ['seil', 52, -24], ['segel', 58, 30]],
    tower: [36, 26], rockA: [-6, -6], rockB: [52, -20], rockC: [58, 30], chests: [[36, 26], [-6, -6], [52, -20]], stars: [[-6, -6], [52, -20], [58, 30], [14, 56], [-30, 52]],
    arena: [26, -4], arenaR: 17, silvan: [-47, -8], kira: [-24, -22], glass: [8, 6]
  };
  return T;
})();

BI.buildWunschGround = function (c) {
  const { W, st, lamp, ROADY } = c, T = BI.WUNSCH, Q = T.P, TAU = Math.PI * 2, rn = BI.rng(4242), L = T.at, ry = Math.atan2(T.ux, T.uz), GOLD = 0xffd23f;
  W.spots.wunsch = { x: T.entry.x, z: T.entry.z }; W.wunsch = T; (W.isles || (W.isles = []));
  st.disc(T.x, T.z, T.R + 9, 0, 0xf4e2b0, 96); st.ring(T.x, T.z, T.R - 5, T.R + 9, .012, 0xfff0c8, 96);
  { const p = L(8, 0); st.disc(p.x, p.z, T.R - 16, ROADY - .03, 0x8fd87a, 80); }          /* Wiese in der Mitte, Sand am Rand */
  BI.buildIsleBridge(c, T);
  /* ---- Helfer ---- */
  const bx = (a, b, w, h, d, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, w, h, d, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const glow = (a, b, y, r, col) => { const p = L(a, b); lamp.sph(p.x, y, p.z, r, col, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const hill = (a, b, r0, tiers, step, dr, cA, cB) => { T.hills.push({ a, b, r0, tiers, step, dr }); for (let k = 1; k <= tiers; k++) cyl(a, b, r0 - dr * (k - 1), r0 - dr * (k - 1), step, k % 2 ? cA : cB, (k - 1) * step, 40); };
  const plat = (a0, b0, a1, b1, y, col) => { T.rects.push({ a0, b0, a1, b1, y }); bx((a0 + a1) / 2, (b0 + b1) / 2, b1 - b0, .3, a1 - a0, col || 0xb98a52, y - .3); for (const [a, b] of [[a0 + .5, b0 + .5], [a1 - .5, b0 + .5], [a0 + .5, b1 - .5], [a1 - .5, b1 - .5]]) cyl(a, b, .18, .2, y - .3, 0x7a4a2a, 0, 6); };
  const palm = (a, b, h0) => { const h = h0 || 5 + rn() * 2.4, q = L(a, b), lean = (rn() - .5) * 1.2; for (let k = 0; k < 5; k++) st.cyl(q.x + lean * k * .15, k * h / 5, q.z, .24 - k * .02, .3 - k * .02, h / 5 + .05, 0x9a6a3a, 6); for (let f = 0; f < 7; f++) { const g = f / 7 * TAU; st.box(q.x + lean * .6 + Math.sin(g) * 1.35, h - .2 - (f & 1) * .2, q.z + Math.cos(g) * 1.35, 3, .1, .85, 0x3fae4a, g); } st.sph(q.x + lean * .6, h - .3, q.z, .28, 0x7a4a2a, 0); solid(a, b, .5, 6); return q; };
  const rock = (a, b, r, col) => { const p = L(a, b); st.sph(p.x, r * .45, p.z, r, col || 0x9a96a0, 1, 1, .75, 1, .08); solid(a, b, r * .8, 3); };
  const sand = (a, b, r, col) => { const p = L(a, b); st.disc(p.x, p.z, r, ROADY + .004, col || 0xf6e6b8, 32); };
  /* ---- Strand am Eingang: Palmen, Surfbretter, Fels ---- */
  for (const [a, b] of [[-56, 12], [-54, -26], [-48, 32], [-58, -4], [-38, 46], [-30, -46], [-24, 48], [0, 52], [18, 50], [54, 4], [48, 32], [44, -34], [8, -54], [-6, 58]]) palm(a, b);
  for (const [a, b, col] of [[-50, -4, 0xff5a8a], [-49, -2.4, 0x35d6e0], [-48, -.8, 0xffd23f]]) bx(a, b, .5, 2.4, .12, col, 0, .3);
  for (const [a, b, r] of [[-60, 26, 1.6], [-62, -30, 2.2], [58, -34, 2.4], [60, 22, 1.8], [30, 58, 2.2]]) rock(a, b, r);
  /* ---- Hütte mit Hängematte ---- */
  { const [a, b] = Q.hut; bx(a, b, 6, 3, 5, 0xc8903c); const p = L(a, b); st.prism(p.x, 3, p.z, 7.4, 2.6, 6.4, 0x3fae4a, ry + Math.PI / 2); bx(a + 2.55, b, .2, 2.0, 1.2, 0x5a3a1a); solid(a, b, 3.4, 5);
    const [ha, hb] = Q.hammock; palm(ha - 1, hb - 4.2, 5); palm(ha - 1, hb + 4.2, 5); for (let k = 0; k <= 8; k++) { const t = k / 8 - .5, y = 1.5 - Math.cos(t * Math.PI) * .75 + .5; bx(ha - 1, hb + t * 8, .9, .1, .9, k % 2 ? 0xff7a5a : 0xffb08a, y); } W.spots.wHammock = L(ha - 1, hb); }
  /* ---- Großer Baum mit Wurzel-Versteck ---- */
  { const [a, b] = Q.tree; cyl(a, b, 1.7, 2.6, 8, 0x7a4a2a, 0, 10); for (let i = 0; i < 6; i++) { const g = i / 6 * TAU; sph(a + Math.sin(g) * 3.2, b + Math.cos(g) * 3.2, 5.8 + (i & 1) * 1.4, 4.4, [0x3fae4a, 0x4cc85a, 0x35a042][i % 3], .9); } sph(a, b, 11.5, 5.5, 0x4cc85a, .8);
    for (let i = 0; i < 5; i++) { const g = .5 + i * .45; cyl(a + Math.sin(g) * 2.8, b + Math.cos(g) * 2.8, .3, .8, 1.3, 0x6a3a1a, 0, 6); }
    solid(a, b, 2.4, 12); bx(a + 3.2, b - 4.4, 3, 1.4, .5, 0x4a2a14); glow(Q.nook[0], Q.nook[1], 1.0, .4, 0xffe9a0); W.spots.wTree = L(a, b - 5); }
  /* ---- Geheime Schlucht: zwei Felswände, dunkler Boden, Abschlusswand mit Tor, Wandzeichen ---- */
  { const G = Q.gorge, cm = (G.b0 + G.b1) / 2;
    for (const sd of [G.b0 - 1.1, G.b1 + 1.1]) { bx((G.a0 + G.a1) / 2, sd, 2.2, 8, G.a1 - G.a0 + 2, 0x6a6470); for (let a = G.a0; a < G.a1; a += 3.2) sph(a, sd + (sd < cm ? -.4 : .4), 7.4, 1.8 + rn() * .6, 0x7a7480, .8); }
    const dk = L((G.a0 + G.a1) / 2, cm); st.strip(dk.x, dk.z, G.b1 - G.b0, G.a1 - G.a0, ry, ROADY + .01, 0x2f2a42);
    bx(G.a1 + 1, cm, G.b1 - G.b0 + 4.4, 9, 2, 0x5a5462); const dr = Q.door; bx(dr[0] - .2, dr[1], 3.6, 4.6, .6, 0x1a1626); bx(dr[0] - .1, dr[1], 4.4, 5.4, .3, 0x8a6ad8, 0); solid(G.a1 + 1, cm, 3.4, 9);
    for (const [a, b] of [[G.a0 + 1, G.b0 + 1], [G.a1 - 1, G.b1 - 1]]) glow(a, b, 2.4, .35, 0xb89aff);
    for (const [a, b] of Q.glyphs) bx(a, b, .5, 1.5, 1.5, 0x3a3450, 1.4);                                   /* Sockel der Wandzeichen */
    W.spots.wGorge = L(G.a0 - 4, cm); bx(Q.crystal[0], Q.crystal[1], .9, 1.6, .9, 0x9a7ae8, 0, .5); glow(Q.crystal[0], Q.crystal[1], 2.1, .55, 0xd8c8ff); solid(Q.crystal[0], Q.crystal[1], 1, 2); }
  /* ---- Floß-Bauplatz am Strand + Steg ---- */
  { const [a, b] = Q.raft; sand(a, b, 8, 0xe9d49c); for (let i = 0; i < 3; i++) bx(a + 4, b - 3 + i * 3, 4, .3, .6, 0x9a6a3a, i * .35); bx(a - 3, b, 1.6, 1, 1.6, 0xc8903c); bx(a - 3, b + 2, 1.2, .8, 1.2, 0xc8903c);
    bx((Q.dock[0] + a) / 2 - 1, b, 2.6, .3, Math.abs(a - Q.dock[0]) - 4, 0xb98a52, .35); for (let k = 0; k < 4; k++) cyl(Q.dock[0] + 1 + k * 4, b + 1.6, .16, .18, .9, 0x7a4a2a, 0, 6); W.spots.wRaft = L(a, b); W.spots.wDock = L(Q.dock[0] + 2, b); T.ex.push({ a0: Q.dock[0] - 6, a1: a - 3, b0: b - 1.3, b1: b + 1.3 }); }
  /* ---- Aussichtsturm: Felsen-Stufen zum Hochklettern + Holzhütte oben, Fernrohr, Truhe; zwei weitere Felsen mit Truhen; Holzsteg dazwischen ---- */
  { const [a, b] = Q.tower; hill(a, b, 15, 7, .9, 2, 0xa89878, 0xb8a888); const top = 7 * .9; bx(a, b, 5.4, .2, 5.4, 0xb98a52, top); for (const [da, db] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) bx(a + da, b + db, .3, 2.4, .3, 0x7a4a2a, top); const p = L(a, b); st.prism(p.x, top + 2.4, p.z, 6.4, 2, 6.4, 0xe8453c, ry + Math.PI / 2);
    bx(a + 1.6, b - 1.4, .3, 1, .3, 0x555a66, top); bx(a + 1.7, b - 1.4, 1.2, .25, .25, 0x2a2a38, top + 1); glow(a, b, top + 2.8, .3, 0xfff3b0); W.spots.wTower = L(a + 1.8, b - 1.4); W.spots.wTowerTop = { x: p.x, z: p.z, y: top };
    hill(...Q.rockA, 7, 3, 1, 2, 0x9a96a0, 0xaaa6b0); hill(...Q.rockB, 8, 4, 1, 2, 0x9a96a0, 0xaaa6b0);
    hill(...Q.rockC, 6, 3, .9, 1.5, 0x9a96a0, 0xaaa6b0); plat(46, 28.2, 56, 31.8, 2.7, 0xb98a52); for (const sd of [28.2, 31.8]) bx(51, sd, .15, .9, 10, 0x7a4a2a, 2.7); /* Abkürzung: Holzsteg vom Turm zum Felsen C */ }  /* Truhen-Sockel (Meshes der Truhen kommen zur Laufzeit) */
  for (const [i, ch] of Q.chests.entries()) { const y = i === 0 ? 7 * .9 : i === 1 ? 3 : 4; bx(ch[0], ch[1], 2.2, .25, 1.6, 0x8a5a2a, y); }
  /* ---- Schattenarena (versiegelt): runde Steinplatte mit Rissen, vier Pfeiler, dunkle Symbole ---- */
  { const [a, b] = Q.arena, r = Q.arenaR, p = L(a, b); st.disc(p.x, p.z, r + 1.4, ROADY + .002, 0x3a3548, 56); st.disc(p.x, p.z, r, ROADY + .006, 0x4a4560, 56); st.ring(p.x, p.z, r - 2.4, r - 1.8, ROADY + .01, 0x8a6ad8, 56); st.ring(p.x, p.z, 7, 7.5, ROADY + .01, 0x8a6ad8, 40); st.disc(p.x, p.z, 1.6, ROADY + .012, 0x1a1626, 20);
    for (let i = 0; i < 8; i++) { const g = i / 8 * TAU, x = p.x + Math.sin(g) * (r + .8), z = p.z + Math.cos(g) * (r + .8); st.box(x, 0, z, 2.2, 1.1, .9, 0x5a5470, g); W.addCircle(x, z, 1.1, false, 1.1); }
    for (let i = 0; i < 4; i++) { const g = i / 4 * TAU + Math.PI / 4, x = p.x + Math.sin(g) * 10, z = p.z + Math.cos(g) * 10; st.cyl(x, 0, z, 1.0, 1.2, 4.6, 0x6a6480, 8); st.cyl(x, 4.6, z, 1.2, 1.0, .4, 0x8a8aa8, 8); lamp.sph(x, 5.3, z, .45, 0x9a7ae8, 1); }
    for (let i = 0; i < 4; i++) { const g = i / 4 * TAU + Math.PI / 4, q = L(a, b); W.addCircle(q.x + Math.sin(g) * 10, q.z + Math.cos(g) * 10, 1.3, false, 5); } W.spots.wArena = L(a - r - 3, b); W.spots.wArenaC = { x: p.x, z: p.z }; }
  /* ---- Wunschfrucht-Palmen, Steine und kleine Laternen am Weg ---- */
  for (const [a, b] of [[-38, -4], [-24, 2], [-12, 14], [2, 18], [18, 12], [40, 6], [-30, 28], [-18, 40]]) { cyl(a, b, .07, .09, 2.6, 0x44485a, 0, 6); glow(a, b, 2.8, .26, 0xfff0b0); }
  /* ---- Mini-Inselchen mit Steg (Geheimversteck): kleine Sandbank im Norden ---- */
  { const [a, b, r] = [-8, 78, 7]; sand(a, b, r, 0xf4e2b0); const q = L(a, b); st.disc(q.x, q.z, r, .02, 0xf4e2b0, 28); T.ex.push({ a: a, b: b, r }); T.ex.push({ a0: a - 1.2, a1: a + 1.2, b0: 58, b1: b - r + 1 }); bx(a, 68, 20, .3, 2.4, 0xb98a52, .02); palm(a - 2, b + 2, 4.5); W.spots.wBank = L(a, b); }
};

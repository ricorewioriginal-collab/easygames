'use strict';
/* Bunte Insel – Zotik: Lunaris, das Dorf am Mondblick. Zotik ist Ricos eigenes 3D-Rollenspiel (Ordner ../zotik); diese Welt folgt dem
   aktuellen Spiel (Kapitel 1 „Der erste Riss“): Kristallbrunnen im Dorf, Mondwald im Süden, Mondtor mit Mondsteinen, Risstor mit dem
   Mondwolf-Alpha, Professoriums Kuppel-Werkstatt mit der Nautilux, Camp der Weltenreisenden (Lyra, Nia, Rovan am Lagerfeuer), Weltentore
   und schwebende Inseln mit Schloss. Figuren in den Farben der Master-Sheets: Zotik (oranger Fuchs, grüner Schal), Mira (blaue Haare,
   Mondschmuck), Professorium (Fliegerbrille, Technikrucksack), Lyra (rosa Wellen), Nia (grünes Haar, Bogen), Rovan (blaues Hemd), Felli.
   Häuser, Brunnen, Markt, Wachturm, Schloss und Fantasiebäume: dieselben freien CC0-Modelle wie im Zotik-Spiel (KayKit Medieval Builder
   von Kay Lousberg, Wizp Fantasy Environment), gebacken in models/welt.bin und erst in der Nähe geladen; bis dahin einfache Ersatzformen.
   Kindgerecht: niemand wird besiegt – Riftlinge werden mit Licht beruhigt, der Mondwolf wollte nur das Tor beschützen und wird ein Freund. */
BI.ZOTIK = { x: 0, z: 380, S: .625, R: 70, hill: { x: 50, z: -52, R: 36, tiers: 8 }, bridge: { x0: -2.5, x1: 2.5, z0: 207, z1: 310 } }; /* Insel südlich der Hauptinsel, Brücke ab dem Steg */

/* ---------- Moosling „Felli“: kleiner Waldgeist (eigene Figur) ---------- */
/* ---------- Moosling „Felli“: kleiner Waldgeist (eigene Figur) ---------- */
BI.makeMoosling = function () {
  const G = 0x9be05a, G2 = 0xd0f08a, DK = 0x4a8a2a, root = new THREE.Group(), inner = new THREE.Group(), mat = BI.mat(); root.add(inner);
  const mesh = (fn, x, y, z) => { const b = new BI.Batch(); fn(b); const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(x, y, z); inner.add(g); return g; };
  mesh(b => { b.sph(0, 0, 0, .42, G, 1, 1, .95, .95); b.sph(0, -.08, .2, .28, G2, 1, .9, 1, .5); b.box(0, .18, .12, .56, .1, .36, 0xe0382b); b.sph(-.2, -.4, .08, .13, DK, 1, 1, .6, 1.3); b.sph(.2, -.4, .08, .13, DK, 1, 1, .6, 1.3); }, 0, .55, 0);
  const head = mesh(b => { b.sph(0, 0, 0, .36, G, 1, 1.1, 1, 1); for (const sd of [-1, 1]) { b.sph(sd * .15, .02, .3, .12, 0xffffff, 1, 1, 1.1, .5); b.sph(sd * .15, .02, .35, .075, 0x2a7a3a, 1); b.sph(sd * .16, .05, .39, .03, 0xffffff, 0); b.sph(sd * .22, -.1, .3, .05, 0xff9aa8, 0, 1, .6, .3); b.box(sd * .3, .28, -.02, .1, .42, .04, 0xc8f070, 0, 0, sd * -.7); b.box(sd * .4, .45, -.02, .06, .3, .03, G2, 0, 0, sd * -.9); }
    for (let k = 0; k < 4; k++) b.box((k - 1.5) * .09, .4, .06, .07, .22 + (k % 2) * .08, .03, k % 2 ? 0xc8f070 : 0x7fd03a, 0, 0, (k - 1.5) * .22); b.sph(0, -.1, .34, .04, 0x2a5a2a, 0, 1, .6, .7); }, 0, 1.18, 0);
  const aL = mesh(b => b.sph(0, -.12, 0, .1, G, 1, .8, 1.5, .8), -.4, .72, .05), aR = mesh(b => b.sph(0, -.12, 0, .1, G, 1, .8, 1.5, .8), .4, .72, .05);
  const D = { root, inner, head, aL, aR };
  D.set = function (name, t) {
    inner.position.y = 0; inner.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); aL.rotation.set(0, 0, 0); aR.rotation.set(0, 0, 0);
    if (name === 'walk') { inner.position.y = Math.abs(Math.sin(t * 9)) * .07; aL.rotation.x = Math.sin(t * 9) * .6; aR.rotation.x = -Math.sin(t * 9) * .6; head.rotation.z = Math.sin(t * 9) * .08; }
    else if (name === 'happy') { inner.position.y = Math.abs(Math.sin(t * 8)) * .25; aL.rotation.z = .9 + Math.sin(t * 10) * .3; aR.rotation.z = -.9 - Math.sin(t * 10) * .3; head.rotation.z = Math.sin(t * 6) * .2; }
    else { inner.position.y = .02 * Math.abs(Math.sin(t * 2)); head.rotation.y = Math.sin(t * .9) * .25; head.rotation.z = Math.sin(t * 1.6) * .06; aL.rotation.z = Math.sin(t * 2) * .08; aR.rotation.z = -Math.sin(t * 2) * .08; }
  };
  return D;
};


/* ---------- Mondwolf (eigene Figur nach dem Zotik-Spiel, rund und freundlich): blaugrau, leuchtende Augen, buschiger Schwanz ---------- */
BI.makeMondwolf = function () {
  const b = new BI.Batch(), F = 0x7a86b8, F2 = 0xc8d0f0, D = 0x3a4270;
  b.sph(0, 1.0, 0, .75, F, 1, 1.5, .85, .9); b.sph(0, .95, .35, .45, F2, 1, 1.1, .8, .7);
  for (const [x, z] of [[-.4, .5], [.4, .5], [-.4, -.55], [.4, -.55]]) { b.cyl(x, 0, z, .14, .17, .75, F, 7); b.sph(x, .06, z + .06, .17, D, 0, 1, .6, 1.3); }
  b.sph(0, 1.55, .9, .5, F, 1, 1, .95, 1.05); b.sph(0, 1.42, 1.32, .26, F2, 1, .9, .75, 1.2); b.sph(0, 1.5, 1.56, .08, 0x23263a, 0);
  for (const sd of [-1, 1]) { b.cone(sd * .26, 1.9, .82, .17, .42, F, 5); b.cone(sd * .26, 1.93, .86, .09, .26, 0xffb0c8, 5); b.sph(sd * .2, 1.66, 1.28, .09, 0x7fe0ff, 1); b.sph(sd * .21, 1.68, 1.35, .035, 0xffffff, 0); }
  b.sph(0, 1.4, -.95, .32, F, 1, .8, .8, 1.6); b.sph(0, 1.6, -1.35, .22, F2, 1, .9, .9, 1.2);
  const g = new THREE.Group(); g.add(b.mesh(BI.mat())); return g;
};

/* ---------- statisch: Insel, Wege, Dorf, Wald, Tore, Hügel, Camp, schwebende Inseln ---------- */
BI.buildZotikGround = function (c) {
  /* Miniatur-Maßstab: Alles wird in Original-Maßen (Radius R0) gebaut und dann um den Mittelpunkt auf A.S verkleinert (Meshes skaliert, Kollisionen umgerechnet); nur die Brücke bleibt in echten Maßen */
  const { W: W0, scene } = c, A = BI.ZOTIK, S = A.S, R0 = A.R / S, M = (x, z) => [A.x + (x - A.x) * S, A.z + (z - A.z) * S], TAU = Math.PI * 2, rn = BI.rng(31337), X = u => A.x + u, Z = v => A.z + v, P = (r, a) => [X(Math.sin(a) * r), Z(Math.cos(a) * r)];
  const st = new BI.Batch(), glow = new BI.Batch(), fb = new BI.Batch(), MARB = 0xe6e2f0, STONE = 0x8e93ae, STONE2 = 0x6d7290, GOLD = 0xd8a24a, BLUE = 0x5a6ec8, WOOD = 0x7a5232, PATH = 0x7a6248, GRASS = 0x4c9a5e, GL = [0x7fb8ff, 0xb48aff, 0x6bffd0, 0xff9ad5];
  const W = Object.create(W0); W.addBox = (x0, z0, x1, z1, u, h) => { const p = M(x0, z0), q = M(x1, z1); return W0.addBox(p[0], p[1], q[0], q[1], u, h && h * S); }; W.addCircle = (x, z, r, u, h) => { const p = M(x, z); return W0.addCircle(p[0], p[1], r * S, u, h && h * S); };
  const D = BI.Deko, WELT = A.welt = [], wk = (name, u, y, v, s, ry) => { const p = M(X(u), Z(v)); WELT.push([name, p[0], y * S, p[1], s * S, ry || 0]); };
  const H = A.hill, hx = X(H.x), hz = Z(H.z), bst = new BI.Batch();
  const Bz = A.bridge, bh = .65; W0.zotik = { x: A.x, z: A.z, R: A.R, bridge: Bz,
    floor(x, z) { if (Math.abs(x - A.x) < 2.6 && z > Bz.z0 + 1 && z < Bz.z1) return z > Bz.z1 - 7 ? bh * (Bz.z1 - z) / 7 : bh; const lx = (x - A.x) / S - H.x, lz = (z - A.z) / S - H.z; if (lx < -40 || lx > 40 || lz < -40 || lz > 40) return 0; const d = Math.hypot(lx, lz); return d < H.R ? Math.min(H.tiers, 1 + Math.floor((H.R - d) / 4)) * S : 0; } };
  /* Insel: Wiese, Felsrand, schwebende Felsunterseite mit Kristallen */
  st.disc(X(0), Z(0), R0, 0, GRASS, 80); st.ring(X(0), Z(0), R0 - 3, R0 + 5, .012, STONE, 80); st.cyl(X(0), -78.08, Z(0), R0 + 4.6, 8, 78, 0x5d5a7a, 28); st.cyl(X(0), -40.2, Z(0), R0 * .7, 6, 40, 0x6d6a86, 14);
  for (let i = 0; i < 140; i++) { const a = rn() * TAU, d = Math.sqrt(rn()) * (R0 - 6), [x, z] = P(d, a); st.disc(x, z, 2 + rn() * 5, .006, [0x438c56, 0x55a466, 0x3f8a5e][i % 3], 9); }
  for (let i = 0; i < 12; i++) { const a = rn() * TAU, d = 20 + rn() * (R0 - 40), [x, z] = P(d, a); glow.cone(x, -30 - rn() * 30, z, 2 + rn() * 3, 14 + rn() * 14, GL[i % 4], 5); }
  for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, [x, z] = P(R0 - 1.2, a); if (Math.abs(x - X(0)) < 5 && z < Z(0)) continue; st.cyl(x, 0, z, .45, .55, 1.1 + (k % 3) * .25, STONE2, 6, 0, 0, 0, .06); if (k % 6 === 0) glow.sph(x, 1.9, z, .3, 0xffe0a0, 1); }
  /* Wege (Erdweg mit flachen Randsteinen, wie im Zotik-Spiel): Nord = Brücke → Dorf, Süd = Mondwald → Risstor, West = Werkstatt, Südwest = Weltentore, Nordwest = Camp */
  const path = (u0, v0, u1, v1, w) => { const L = Math.hypot(u1 - u0, v1 - v0), a = Math.atan2(u1 - u0, v1 - v0), cx = X((u0 + u1) / 2), cz = Z((v0 + v1) / 2); st.strip(cx, cz, w, L, a, .014, PATH); for (let t = 1.2; t < L; t += 2.4) { const o = ((t * 7) % 3 - 1.5) * w * .18, px = X(u0 + Math.sin(a) * t + Math.cos(a) * o), pz = Z(v0 + Math.cos(a) * t - Math.sin(a) * o); st.cyl(px, 0, pz, .7 + (t % 1) * .4, .8 + (t % 1) * .4, .2, (t | 0) % 2 ? 0x9a98a8 : 0x8a889a, 7); } for (let t = 2; t < L; t += 5) for (const sd of [-1, 1]) st.sph(X(u0 + Math.sin(a) * t + Math.cos(a) * sd * (w / 2 + .5)), .1, Z(v0 + Math.cos(a) * t - Math.sin(a) * sd * (w / 2 + .5)), .5, 0x6a687a, 0, 1.2, .5, 1); };
  path(0, -R0 + 2, 0, -24, 7); path(0, 24, 0, R0 - 12, 6); path(-24, 0, -58, 0, 6); path(-17, 17, -42, 42, 5.5); path(-17, -17, -50, -34, 5);
  /* Dorfplatz mit Pflaster und Kristallbrunnen */
  st.disc(X(0), Z(0), 25, .016, 0x9a96aa, 48); for (let k = 0; k < 70; k++) { const a = rn() * TAU, d = 7.5 + rn() * 16.5; st.cyl(X(Math.sin(a) * d), .012, Z(Math.cos(a) * d), .6 + rn() * .5, .7 + rn() * .5, .04, [0xaaa6b8, 0x8a869c, 0xb4b0c0][k % 3], 6); } for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; st.strip(X(Math.sin(a) * 15), Z(Math.cos(a) * 15), .25, 20, a, .02, 0x9a94aa); } for (const [r0, r1, col] of [[9, 9.6, GOLD], [24.4, 25.2, STONE2]]) st.ring(X(0), Z(0), r0, r1, .024, col, 48);
  st.cyl(X(0), 0, Z(0), 6.2, 6.6, .9, STONE, 24); st.cyl(X(0), .9, Z(0), 5.4, 5.4, .12, 0x30d6e8, 24); glow.ring(X(0), Z(0), 4.8, 5.2, 1.03, 0x7fe8ff, 32); st.cyl(X(0), .9, Z(0), 1.0, 1.4, 2.2, 0x9aa0be, 10); W.addCircle(X(0), Z(0), 6.8, false, 3);
  /* Häuser (KayKit-Modelle; Kollision und Türen unabhängig vom Laden) – Tür zeigt zum Platz */
  A.houses = []; const house = (u, v, ry, name, kind, roof) => { const x = X(u), z = Z(v), w = 11; W.addBox(x - w / 2, z - w / 2, x + w / 2, z + w / 2, false, 9); wk('kb_house', u, 0, v, 8.2, ry);
    fb.box(x, 0, z, w, 6, w, 0xe8dcc0, ry); fb.prism(x, 6, z, w + 1, 3.6, w + 1, roof, ry); const q = M(x, z), f = M(x + Math.sin(ry) * 14, z + Math.cos(ry) * 14); A.houses.push({ x: q[0], z: q[1], tx: f[0], tz: f[1], name, kind }); };
  house(-40, -12, Math.PI / 2, 'Wirtshaus „Mondschein“', 'haus', 0x4aa88a); house(-40, 16, Math.PI / 2, 'Tränke-Laden', 'huette', 0x5a6ec8); house(40, 16, -Math.PI / 2, 'Magieladen', 'haus', 0x2a9a9a);
  /* Boros Schmiede (Ausrüstung): offene Werkstatt mit Esse und Amboss */
  { const x = X(36), z = Z(-12); st.box(x, 0, z, 9, .3, 7, 0x8a8478); for (const sx of [-1, 1]) for (const sz of [-1, 1]) st.cyl(x + sx * 4, 0, z + sz * 3, .3, .35, 5, WOOD, 6); st.prism(x, 5, z, 10, 2.4, 8, 0x7a4a4a, Math.PI / 2);
    st.box(x + 2.5, 0, z - 1.8, 3, 2, 2.6, 0x6a6a72); glow.box(x + 2.5, 2.02, z - 1.8, 2.2, .1, 1.8, 0xff6a2a); st.cyl(x + 2.5, 2, z - 1.8, .5, .6, 4.6, 0x5a5a6a, 6); st.box(x - 1.5, 0, z + .5, .9, .9, .9, 0x3a3a42); st.box(x - 1.5, .9, z + .5, 1.6, .35, .8, 0x2a2a30);
    W.addBox(x - 4.6, z - 3.6, x + 4.6, z - .4, false, 5); A.smith = { x: X(30), z: Z(-12) }; }
  /* Markt am Nordweg: zwei KayKit-Marktstände, Fässer, Kisten */
  for (const [u, sd] of [[-14, 1], [14, -1]]) { const x = X(u), z = Z(-40); wk('kb_market', u, 0, -40, 7.5, sd * Math.PI / 2); W.addBox(x - 4, z - 4.5, x + 4, z + 4.5, false, 5); fb.box(x, 0, z, 6, 1, 8, 0xa8703a); fb.prism(x, 3.6, z, 7, 1.4, 9, 0xc23a4a, Math.PI / 2); for (let k = 0; k < 4; k++) glow.sph(x + sd * 3.6, 1.3, z - 3 + k * 2, .22, GL[k % 4], 1, .8, 1.3, .8); }
  wk('kb_well', -26, 0, -32, 5.5, .4); W.addCircle(X(-26), Z(-32), 2.8, false, 3); fb.cyl(X(-26), 0, Z(-32), 2.2, 2.4, 1.2, STONE, 12);
  /* Laternen am Dorfplatz und an den Wegen (Wizp-Lampe, bis zum Laden kleine Pfähle) */
  const lamp = (u, v) => { wk('wz_lamp', u, 0, v, 1.7, 0); fb.cyl(X(u), 0, Z(v), .12, .14, 3.2, 0x3a2a22, 6); glow.sph(X(u), 3.5, Z(v), .32, 0xffd890, 1); W.addCircle(X(u), Z(v), .5, false, 3); };
  for (const [u, v] of [[-6, -30], [6, -30], [-6, -60], [6, -60], [-6, -88], [6, -88], [-20, -20], [20, -20], [-20, 20], [20, 20], [-30, 4], [-52, 4], [-6, 30]]) lamp(u, v);
  /* Professoriums Werkstatt im Westen: Kuppel aus Messing, Leuchttür, Antenne, Zahnräder – davor parkt die Nautilux */
  { const x = X(-66), z = Z(4); st.cyl(x, 0, z, 9, 9.4, 6.5, 0xd8cfc0, 24); st.sph(x, 6.5, z, 9.2, 0xb98a4a, 2, 1, .62, 1); st.cyl(x + 5, 6, z - 3, .45, .5, 9, 0xb98a4a, 8); glow.sph(x + 5, 15.3, z - 3, .8, 0x4fe8ff, 1);
    glow.box(x + 9.15, 0, z, .2, 4, 2.6, 0x4fe8ff); st.box(x + 9.2, 4, z, .4, .5, 3.4, 0xb98a4a); for (const [dy, dz, r] of [[2.6, -4.5, 1.6], [3.8, 4.6, 1.1]]) { st.cyl(x + 8.6, dy, z + dz, r, r, .3, 0xb98a4a, 10, 0, 0, Math.PI / 2); st.cyl(x + 8.75, dy, z + dz, r * .35, r * .35, .2, 0x7a5a30, 8, 0, 0, Math.PI / 2); }
    st.sph(x, 11.6, z, 1.2, 0x4fe8ff); W.addCircle(x, z, 9.6, false, 14); A.werk = { x: X(-55), z: Z(4) }; W0.vehicleSpawns.push({ type: 'nautilux', x: M(X(-60), Z(24))[0], z: M(X(-60), Z(24))[1], h: Math.PI / 2 }); }
  /* Mondblick-Hügel mit 8 Stufen (je 1 m, überall begehbar): Fels-Terrassen mit Gras, oben der Mondturm (KayKit-Wachturm) */
  for (let k = 1; k <= H.tiers; k++) { const R = H.R - 4 * (k - 1); st.cyl(hx, k - 1, hz, R, R + .3, 1, k % 2 ? 0x8a8a9e : 0x7a7a90, 48, 0, 0, 0, .05); st.disc(hx, hz, R - .2, k + .01, k % 2 ? 0x62b265 : 0x58a85c, 48); }
  { wk('kb_watchtower', H.x, H.tiers, H.z, 8, Math.PI); W.addBox(hx - 5, hz - 5, hx + 5, hz + 5, false, 30); fb.cyl(hx, H.tiers, hz, 4.5, 5, 16, 0x8e8e9a, 12); fb.cone(hx, H.tiers + 16, hz, 5.6, 6, 0x9a5a3a, 12); A.turm = { x: hx, z: hz };
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + .3, [x, z] = [hx + Math.sin(a) * 26, hz + Math.cos(a) * 26]; st.cyl(x, 2, z, .12, .14, 4.4, WOOD, 6); st.box(x, 5.2, z, 1.2, 2.2, .1, BLUE, a); glow.sph(x, 6.7, z, .28, GOLD, 1); } }
  /* Weltentor-Platz (Südwesten): 6 Tore in die anderen Welten + großes Tor ins Zotik-Spiel (Ringe kommen zur Laufzeit) */
  { const cx = X(-54), cz = Z(52), cols = [0xff8a3d, 0x4da3ff, 0xdddddd, 0xff5ab4, 0xffd23f, 0x35d6e0]; st.disc(cx, cz, 22, .016, 0xb0aabc, 36); st.ring(cx, cz, 17, 18, .024, GOLD, 36); A.gates = [];
    for (let k = 0; k < 6; k++) { const a = (-60 + k * 24) * Math.PI / 180 + Math.PI * .75, [x, z] = [cx + Math.sin(a) * 15, cz + Math.cos(a) * 15]; st.cyl(x, 0, z, 2.6, 2.8, .4, STONE, 16); for (const sd of [-1, 1]) { const ox = Math.cos(a) * sd * 2.6, oz = -Math.sin(a) * sd * 2.6; st.cyl(x + ox, 0, z + oz, .35, .45, 4.4, STONE, 8); W.addCircle(x + ox, z + oz, .7, false, 5); } A.gates.push({ x, z, a, col: cols[k], i: k }); } A.gateC = { x: cx, z: cz };
    st.cyl(cx, 0, cz, 3.6, 3.9, .5, STONE, 20); for (const sd of [-1, 1]) { st.cyl(cx + sd * 3.2, .5, cz, .55, .7, 5.6, STONE, 8); W.addCircle(cx + sd * 3.2, cz, 1, false, 8); } A.zportal = { x: cx, z: cz }; }
  /* Mondwald im Süden: Tannen (Kenney), Fantasiebäume (Wizp, rosa), leuchtende Mondbäume, lila Gräser */
  const inWald = (x, z) => z > Z(30) && Math.abs(x - X(0)) > 6 && Math.hypot(x - X(-54), z - Z(52)) > 26 && Math.hypot(x - X(0), z - Z(R0 - 14)) > 14 && Math.hypot(x - X(-12), z - Z(44)) > 6 && Math.hypot(x - X(0), z - Z(0)) < R0 - 8;
  A.trees = []; for (let i = 0, n = 0; i < 900 && n < 70; i++) { const a = rn() * TAU, d = 32 + Math.sqrt(rn()) * (R0 - 40), [x, z] = P(d, a); if (!inWald(x, z) || A.trees.some(t => Math.hypot(t.x - x, t.z - z) < 7)) continue; A.trees.push({ x, z }); n++; const u = x - A.x, v = z - A.z, ty = [3, 4, 2, 3, 1, 4, 3, 0, 4, 2][n % 10];
    if (ty === 0) { wk('wz_garden_pink', u, 0, v, 1.6 + rn() * .4, rn() * TAU); fb.cyl(x, 0, z, .3, .4, 3.4, WOOD, 6); fb.sph(x, 5, z, 3, 0xff9ad5, 1); W.addCircle(x, z, .7, false, 6); }
    else if (ty === 1) { wk('wz_tree_pink', u, 0, v, 1.3 + rn() * .3, rn() * TAU); fb.cyl(x, 0, z, .5, .7, 4, WOOD, 6); fb.sph(x, 5, z, 3, 0xd890e0, 1); W.addCircle(x, z, 1.1, false, 6); }
    else if (ty === 2) { const h = 3 + rn() * 2; st.cyl(x, 0, z, .26, .38, h, 0x6a4a8a, 7); glow.sph(x, h + 1.2, z, 1.7 + rn() * .6, GL[i % 4], 1, 1, .9, 1); glow.sph(x + .9, h + .5, z + .4, .8, GL[(i + 1) % 4], 1); W.addCircle(x, z, .5, false, 4); }
    else if (ty === 3) { const h = 9 + rn() * 4; st.cyl(x, 0, z, .3, .4, 2, 0x5a3a2a, 6); for (let k = 0; k < 3; k++) st.cone(x, 1.6 + k * h * .24, z, 3.4 - k * .9, h * .42, [0x4a9ab8, 0x62b4cc, 0x86cce0][k], 8, .08); W.addCircle(x, z, .8, false, 8); }
    else { const h = 3 + rn() * 2; st.cyl(x, 0, z, .4, .55, h, 0x5a3a2a, 7); for (let k = 0; k < 4; k++) st.sph(x + Math.sin(k * 1.7) * 1.6, h + 1.4 + (k % 2) * .9, z + Math.cos(k * 1.7) * 1.6, 2.2 + (k % 2) * .5, [0x2f8a8a, 0x3aa0a0, 0x45b0a8, 0x2a7a8a][k], 1); W.addCircle(x, z, .8, false, 6); }
    if (n % 2) wk(n % 4 === 1 ? 'wz_grass_purple' : 'wz_grass_green', u + 2.5, 0, v + 1.5, 2 + rn(), rn() * TAU); }
  for (let i = 0; i < 9; i++) { const a = rn() * TAU, d = 40 + rn() * 60, [x, z] = P(d, a); if (!inWald(x, z) && z < Z(30)) { if (W0.free(M(x, z)[0], M(x, z)[1], 2)) wk(i % 2 ? 'wz_plant' : 'wz_grass_purple', x - A.x, 0, z - A.z, 1.6 + rn(), rn() * TAU); } }
  /* Mondtor am Waldrand (Steinsäulen mit Kristallen, Ring), daneben drei Mondsteine fürs Rätsel */
  { const x = X(0), z = Z(40); for (const sd of [-1, 1]) { st.cyl(x + sd * 5, 0, z, .9, 1.1, 7, STONE, 8); glow.sph(x + sd * 5, 7.8, z, .7, 0x6ad0ff, 0); W.addCircle(x + sd * 5, z, 1.2, false, 8); } st.box(x, 7, z, 11.6, 1, 1.4, STONE); A.mondtor = { x, z };
    A.stones = [36, 44, 52].map(v => { st.cyl(X(-12), 0, Z(v), 1.1, 1.3, 1.6, 0x9aa0be, 8); W.addCircle(X(-12), Z(v), 1.3, false, 2); return { x: X(-12), z: Z(v) }; }); }
  /* Risstor am Ende des Weges: zwei schräge Felsspitzen (Ring zur Laufzeit) */
  { const x = X(0), z = Z(R0 - 14); for (const sd of [-1, 1]) { st.cyl(x + sd * 6.5, 0, z, .4, 2.6, 11, 0x55507a, 7, 0, 0, -sd * .12); W.addCircle(x + sd * 6.5, z, 2, false, 10); } st.disc(x, z, 9, .02, 0x4a4470, 20); A.riss = { x, z }; }
  /* Zotik-Statue (Hauptheld) am Nordweg: Sockel mit Goldring – die Figur kommt zur Laufzeit */
  { const sx = X(-24), sz = Z(-64); st.cyl(sx, 0, sz, 7.2, 7.8, .6, STONE, 28); st.cyl(sx, .6, sz, 6, 6.4, .5, MARB, 28); st.cyl(sx, 1.1, sz, 4.2, 4.6, 1.6, MARB, 20); st.ring(sx, sz, 6.2, 6.8, 1.12, GOLD, 40); st.ring(sx, sz, 4.7, 5, 1.14, BLUE, 40);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, x = sx + Math.sin(a) * 6.6, z = sz + Math.cos(a) * 6.6; st.cyl(x, .6, z, .25, .3, 2.4, MARB, 8); glow.sph(x, 3.2, z, .4, GL[k % 4], 1); }
    W.addCircle(sx, sz, 7.6, false, 3); A.statue = { x: sx, z: sz, top: 2.7 }; }
  /* Camp der Weltenreisenden (Nordwesten): Lagerfeuer, Sitzstämme, zwei Zelte */
  { const x = X(-58), z = Z(-40); st.disc(x, z, 12, .012, 0x8a7a5a, 24); st.cyl(x, 0, z, 1.6, 1.8, .4, 0x6a6a72, 10); for (let k = 0; k < 4; k++) st.box(x, .5, z, 2.4, .35, .35, 0x5a3a22, k * .8); W.addCircle(x, z, 2, false, 2);
    for (const [a, r] of [[.4, 5], [2.5, 5], [4.6, 5]]) st.cyl(x + Math.sin(a) * r, .4, z + Math.cos(a) * r, .4, .4, 3, 0x6a4a2a, 8, 0, a + Math.PI / 2, Math.PI / 2);
    for (const [dx, dz, col] of [[-6, -8, 0xc23a4a], [6, -8, 0x3a6ac8]]) { st.prism(x + dx, 0, z + dz, 5, 3.6, 5.5, col, 0); W.addBox(x + dx - 2.5, z + dz - 2.8, x + dx + 2.5, z + dz + 2.8, false, 3.6); }
    A.camp = { x, z }; }
  /* Schwebende Inseln am Himmel (wie über Lunaris im Zotik-Spiel): die größte trägt das Schloss mit Lichtsäule */
  A.sky = []; for (const [u, y, v, r] of [[-30, 70, -150, 22], [120, 55, 40, 14], [-130, 62, 90, 12], [90, 80, -120, 10]]) { const x = X(u), z = Z(v); st.cyl(x, y - r * 1.6, z, r, 1, r * 1.6, 0x6d6a86, 9, 0, 0, 0, .1); st.cyl(x, y - .1, z, r, r * .96, 1.2, 0x7a7090, 18); st.disc(x, z, r * .97, y + 1.12, GRASS, 18); glow.cone(x, y - r * 1.9, z, r * .18, r * .5, GL[A.sky.length % 4], 5); A.sky.push({ x, y: y + 1.1, z, r }); }
  { const I = A.sky[0]; wk('kb_castle', I.x - A.x, I.y, I.z - A.z, 14, Math.PI / 4); fb.box(I.x, I.y, I.z, 14, 12, 14, 0x9a9aa8, Math.PI / 4); fb.cone(I.x, I.y + 12, I.z, 6, 8, BLUE, 4);
    for (const s of A.sky.slice(1)) for (let k = 0; k < 2; k++) wk('wz_garden_pink', s.x - A.x + (k ? 3 : -3), s.y, s.z - A.z + (k ? -2 : 2), 2.4, k * 2); }
  /* Brücke vom Steg der Hauptinsel (Holzdeck mit Geländer, Pfähle im Wasser, Rampe zur Insel) */
  { const x = A.x, z0 = Bz.z0 + 1, z1 = Bz.z1 - 7, L = z1 - z0; bst.box(x, .35, (z0 + z1) / 2, 5.2, .3, L, 0xb98650); for (let k = 0; k < L; k += 2.5) bst.box(x, .64, z0 + k, 5.2, .02, .08, 0x7a5a33);
    bst.box(x, .22, z1 + 3.5, 5.2, .2, 7.1, 0xb98650, 0, Math.atan(.65 / 7)); for (const sd of [-1, 1]) { bst.box(x + sd * 2.45, .65, (z0 + z1) / 2, .14, 1.0, L, 0x8a5a33); for (let k = 0; k <= L; k += 4) bst.cyl(x + sd * 2.45, 0, z0 + k, .12, .14, 1.2, 0x6a4a2a, 5); }
    for (let k = 4; k < L; k += 10) for (const sd of [-1, 1]) bst.cyl(x + sd * 1.9, -1.6, z0 + k, .4, .45, 1.9, 0x4a4a52, 8);
    for (const sd of [-1, 1]) W0.addBox(x + sd * 2.45 - .1, z0, x + sd * 2.45 + .1, z1 + 1, false, 1.3); }
  /* Ortseingang: Torbogen (Wizp) am Brückenkopf */
  wk('wz_arch', 0, 0, -R0 + 8, 1.15, 0); for (const sd of [-1, 1]) { fb.cyl(X(sd * 4.3), 0, Z(-R0 + 8), .6, .7, 4, STONE, 8); W.addCircle(X(sd * 4.3), Z(-R0 + 8), .8, false, 4); }
  /* eigene Meshes (nur in der Nähe sichtbar) */
  const grp = new THREE.Group(), stMs = BI.layerMeshes(st), glM = glow.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })), fbM = fb.mesh(BI.mat()); glM.frustumCulled = false; for (const m of [...stMs, glM, fbM]) { m.frustumCulled = false; m.scale.setScalar(S); m.position.set(A.x * (1 - S), 0, A.z * (1 - S)); } grp.add(...stMs, glM, fbM); { const bM = bst.mesh(BI.mat()); bM.frustumCulled = false; grp.add(bM); }
  A.fb = fbM; for (const o of [A.statue, A.gateC, A.zportal, A.smith, A.werk, A.turm, A.mondtor, A.riss, A.camp].concat(A.gates, A.stones, A.trees, A.sky)) { const q = M(o.x, o.z); o.x = q[0]; o.z = q[1]; if (o.y != null) o.y *= S; } A.statue.top *= S; grp.visible = false; scene.add(grp); A.group = grp;
  /* Arcade (Elementar-Kampf) am Dorfplatz – nach den Hauptwelt-Automaten gebaut */
  A.addArcade = function () { const a = { x: A.x + 18 * S, z: A.z - 26 * S }, ast = new BI.Batch(), alamp = new BI.Batch(); BI.buildArcades({ W: W0, st: ast, lamp: alamp, only: [{ kind: 'elementar_zotik', x: a.x, z: a.z, yaw: Math.atan2(A.x - a.x, A.z - a.z), body: 0x2a2a6a, top: 0xff8a1f }] }); grp.add(ast.mesh(BI.mat())); if (!alamp.empty) grp.add(alamp.mesh(W.lampMat)); };
  /* Modelle aus welt.bin: erst laden, wenn man sich Lunaris nähert (A.loadWelt aus createZotik); dann Ersatzformen ausblenden */
  A.loadWelt = function () { if (A._wl) return; A._wl = 1; D.welt(() => { for (const it of WELT) D.add(...it); D.flush(scene, null, true); fbM.visible = false; A.weltReady = true; }); };
};

/* ---------- Laufzeit ---------- */
BI.createZotik = function (G) {
  const { scene, W, A: AU, fx, P, say, save, persist } = G, K = { nav: u => { location.href = u; } }, A = BI.ZOTIK, TAU = Math.PI * 2, X = u => A.x + u * A.S, Z = v => A.z + v * A.S;
  /* Spielstand: st = Schritt der Quest „Der erste Riss“ (0–8, wie Kapitel 1 im Zotik-Spiel); alte Stände (q 0–4) bleiben gültig, q ≥ 4 = geschafft */
  const S = () => { const s = save.zotik || (save.zotik = { q: 0, shards: [], pts: 0, paid: 0, fought: 0, visit: 0, gates: 0, ship: 0, felli: 0, talk: {} }); if (s.st == null) { s.st = s.q >= 4 ? 8 : 0; s.herbs = 0; s.rift = 0; s.moon = [1, 3, 2]; } if (!s.moon) s.moon = [1, 3, 2]; return s; };
  const note = (f, d, ty, v, del) => { try { AU.note && AU.note(f, d, ty, v, del || 0); } catch (e) { } }, snd = n => { try { AU[n] && AU[n](); } catch (e) { } };
  const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3600); snd('fanfare'); };
  const canvasSprite = (draw, w, h, sc) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); draw(c); const tx = new THREE.CanvasTexture(cv), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, fog: false })); sp.scale.set(sc, sc * h / w, 1); sp.userData.redraw = f => { c.clearRect(0, 0, w, h); f(c); tx.needsUpdate = true; }; A.group.add(sp); return sp; };
  const sign = (txt, x, y, z, w) => { const sp = canvasSprite(c => { let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#1e1a4a'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffe9a8'; c.fillText(txt, 256, 50); }, 512, 96, w); sp.position.set(x, y, z); return sp; };
  const grp = A.group, ring = (x, y, z, r, col, ry, op) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * .1, 8, 32), new THREE.MeshBasicMaterial({ color: col, fog: false })); m.position.set(x, y, z); m.rotation.y = ry || 0; grp.add(m); const sw = new THREE.Mesh(new THREE.CircleGeometry(r * .92, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op || .4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); sw.position.copy(m.position); sw.rotation.y = m.rotation.y; grp.add(sw); return { m, sw }; };
  K.floor = W.zotik.floor;
  /* ===== Lichtsäule vom Schloss am Himmel, Brunnenkristall, Glühwürmchen ===== */
  const I0 = A.sky[0], beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 420, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); beam.position.set(I0.x, I0.y + 210, I0.z); grp.add(beam);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, fog: false })); crystal.scale.set(1.3, 2.3, 1.3); crystal.position.set(X(0), 4.4, Z(0)); grp.add(crystal);
  /* ===== Schilder ===== */
  sign('🌙 Lunaris – Dorf am Mondblick', A.x, 6.5, Z(-112 + 10), 9); sign('💧 Kristallbrunnen', X(0), 7.4, Z(0), 6); sign('⚒️ Boros Schmiede', A.smith.x + 2, 5, A.smith.z, 6); sign('⚙️ Professoriums Werkstatt', X(-66), 11, Z(4), 8); sign('🗼 Mondblick', A.turm.x, 21, A.turm.z, 6);
  sign('🌲 Mondwald', X(0), 6, Z(32), 6); sign('🌙 Mondtor', A.mondtor.x, 7.4, A.mondtor.z, 5); sign('🌀 Risstor', A.riss.x, 10, A.riss.z, 5); sign('🔥 Camp der Weltenreisenden', A.camp.x, 5.4, A.camp.z - 4, 8); sign('🌀 Weltentore', A.gateC.x, 6.5, A.gateC.z + 8, 6); sign('🕹️ Elementar-Kampf', X(18), 6, Z(-26), 7);
  const gateNames = ['🐉 Drachenhöhen', '🐶 Fellretter-Bucht', '🎬 Dampfer-Hafen', '🌈 Regenbogenwelt', '🏗️ Bauland', '🔱 Atlantis'], gateDest = ['drachen', 'pups', 'dampf', 'rainbow', 'bauland', 'atlantis'];
  A.gates.forEach((g, i) => sign(gateNames[i], g.x, 4.6, g.z, 4.2));
  const gateR = A.gates.map(g => ring(g.x, 2.2, g.z, 1.35, g.col, g.a + Math.PI, .5));
  /* Tor zum Zotik-Spiel: großer blauer Weltentor-Ring wie im Zotik-Spiel; Rückkehr (?from=zotik) setzt uns hier ab */
  const ZP = A.zportal, zR = ring(ZP.x, 2.6, ZP.z, 1.6, 0x7ab8ff, 0, .45); sign('🦊 Tor nach Zotik – das große Spiel', ZP.x, 6.4, ZP.z, 7);
  let arrive = /[?&]from=zotik\b/.test(location.search); if (arrive) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }
  /* Mondtor-Ring, Risstor-Ring */
  const mR = ring(A.mondtor.x, 5.4, A.mondtor.z, .85, 0xc8e4ff, 0, .25), rR = ring(A.riss.x, 3.6, A.riss.z, 3.2, 0xa66cff, 0, .45);
  /* ===== Bewohner (Farben nach den Master-Sheets des Zotik-Spiels) ===== */
  const NPC = [];
  const mk = (id, x, z, look, name, lines, scale, onTalk) => { const c = BI.makeChar(look), h = Math.atan2(X(0) - x, Z(0) - z); c.group.position.set(x, 0, z); c.group.rotation.y = h; c.group.scale.setScalar(scale || 1); grp.add(c.group); const t = sign(name, x, 3.2 * (scale || 1) + .4, z, 3.6); const n = { id, c, x, z, h, lines, name, i: 0, onTalk, t }; NPC.push(n); return n; };
  const H = id => id === 'prof' ? { shirt: 0xefe4c8, pants: 0x5a4030, hair: 0xf4f4f4, skin: 0xf6e2d6, style: 'wavy', beard: 3, beardc: 0xf0f0f0, hat: 'goggles', pack: true, wrink: 1, shoeT: 1, shoe: 0x4a3426 } : BI.heroById(id).o;
  mk('mira', X(9), Z(7), H('mira'), 'Mira – Mondmagierin', ['Hörst du das Summen im Boden? Es kommt aus dem Mondwald. 🌙', 'Das Dorf ist wieder ruhig. Danke, Zotik!', 'Hinter dem Weltentor liegen so viele Welten – und alle sind miteinander verbunden.']);
  mk('prof', X(-54), Z(10), H('prof'), 'Professorium – Erfinder', ['Aha! Meine Instrumente schlagen aus, sobald du näher kommst. Faszinierend! ⚙️', 'Die Nautilux schwebt, taucht und fliegt. Steig ein – und lande, bevor du aussteigst!', 'Wissen ist Macht – aber Neugier ist der Schlüssel zu neuen Welten!']);
  mk('boro', A.smith.x, A.smith.z + 2.2, { shirt: 0xb85a3a, pants: 0x3a2a22, hair: 0x5a3a26, skin: 0xe0a888, style: 'bald', beard: 5, beardc: 0x5a3a26, build: 2, overall: true, scale: 1.08 }, 'Boro – Schmied', ['Willkommen in meiner Schmiede! Schwerter, Schilde, Tränke – schau dir alles an! ⚒️', 'Gute Ausrüstung hilft auf der Wald-Insel. Probier sie dort aus!', 'Die Dornenwölfe sind ruhiger geworden, seit du da bist.'], 1, () => G.gear && setTimeout(() => G.gear.show('Boros Schmiede'), 600));
  mk('elwen', X(-12), Z(-8), { shirt: 0xe07ab0, pants: 0x7a3a6a, hair: 0xf0c060, skin: 0xf3c9a0, style: 'bun', dress: true, scale: .92 }, 'Elwen', ['Die Blumen leuchten heute so hell. Das ist doch ein gutes Zeichen! 🌸', 'Mondphasen? Voll, neu, abnehmend … meine Oma hat davon immer gesungen.', 'Zotik wird das schon richten!']);
  mk('sari', X(-30), Z(16), { shirt: 0xd9a050, pants: 0x6a4a28, hair: 0x2a1c16, skin: 0xc68a5a, style: 'ponytail', hat: 'chef', scale: .94 }, 'Sari – Bäckerin', ['Frisches Mondbrot! … leider schon aufgegessen. 🍞', 'Wenn du aus dem Wald zurückkommst, hab ich Tee für dich.', 'Am Lagerfeuer im Camp sitzen die Weltenreisenden.']);
  mk('pip', X(11), Z(-6), { shirt: 0x4a6ae0, pants: 0x2a3a8a, hair: 0x8a4a2a, skin: 0xf3c9a0, style: 'spiky', scale: .7 }, 'Pip', ['Ich will auch mal ein Abenteurer werden! 🗡️', 'Felli ist mein Lieblingsmoosling!', 'Zeig mir deinen Schwanz-Trick, Zotik!']);
  mk('finn', X(-6), Z(-74), { shirt: 0x4a8a50, pants: 0x2a4a30, hair: 0x6b4423, skin: 0xe0a979, style: 'short', pack: true, scale: .96 }, 'Finn – Wanderer', ['Willkommen in Lunaris! Der Brunnen ist geradeaus, der Mondwald liegt dahinter. 🌲', 'Ich wandere durch alle Welten – aber hier ist es am gemütlichsten.']);
  /* Weltenreisende am Lagerfeuer (Begleiter aus dem Zotik-Spiel) */
  [['lyra', 'Lyra – Heilerin', ['Manchmal entscheidet nicht die stärkste Klinge, sondern das Herz, das nicht aufgibt. ✨', 'Ich heile jeden, der Hilfe braucht – auch Riftlinge, wenn sie sich beruhigen.']], ['nia', 'Nia – Bogenschützin', ['Ich schreibe alles auf, was der Wald erzählt! 🏹', 'Das Leben ist zu kurz für nur einen Weg!']], ['rovan', 'Rovan – Beschützer', ['Stärke heißt, für andere da zu sein. 🛡️', 'Ich stehe immer an deiner Seite, Zotik.']]].forEach(([id, nm, ln], i) => { const a = .4 + i * 2.1, n = mk(id, A.camp.x + Math.sin(a) * 3.1, A.camp.z + Math.cos(a) * 3.1, H(id), nm, ln, 1, () => { const s = S(); if (!s.camp) { s.camp = 1; persist(); setTimeout(() => bonus(1, '🔥 Am Lagerfeuer der Weltenreisenden!'), 900); } }); n.c.group.rotation.y = Math.atan2(A.camp.x - n.x, A.camp.z - n.z); n.home = A.camp; });
  /* Zotik-Statue in Originalfarben (Fuchs-Mensch: orange Fell, grüner Schal, Lederriemen) */
  const statue = BI.makeChar(Object.assign({}, H('zotik'), { scale: 1 })); statue.group.scale.setScalar(6 * A.S); statue.group.position.set(A.statue.x, A.statue.top, A.statue.z); statue.group.rotation.y = Math.atan2(A.x - A.statue.x, Z(-30) - A.statue.z); statue.pose && statue.pose(0, 0, false); grp.add(statue.group);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.2, .14, 6, 32), new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false })); halo.rotation.x = Math.PI / 2; halo.position.set(A.statue.x, A.statue.top + 14 * A.S, A.statue.z); grp.add(halo);
  sign('🦊 Zotik – der Weltenhörer', A.statue.x, A.statue.top + 17.4 * A.S, A.statue.z, 9);
  /* Moosling „Felli“ (Seelenbegleiter): hüpft neben Mira, geht als Partner mit */
  const felli = BI.makeMoosling(); felli.root.scale.setScalar(1.15); felli.root.position.set(X(5), 0, Z(12)); grp.add(felli.root); sign('Felli – Moosling', X(5), 2.6, Z(12), 3.6);
  /* Mondwolf-Alpha am Risstor */
  const wolf = BI.makeMondwolf(); wolf.scale.setScalar(1.25); wolf.position.set(A.riss.x, 0, A.riss.z - 3); wolf.rotation.y = Math.PI; grp.add(wolf); const wolfSign = sign('🐺 Mondwolf-Alpha', A.riss.x, 4.2, A.riss.z - 3, 5);
  /* ===== Quest „Der erste Riss“ (wie Kapitel 1 im Zotik-Spiel, kindgerecht) ===== */
  const QS = ['Sprich mit Mira am Kristallbrunnen.', 'Sammle 3 leuchtende Mondkräuter im Mondwald (Süden).', 'Bring die Mondkräuter zu Mira.', 'Beruhige 5 Riftlinge im Mondwald mit Licht.', 'Besuche Professorium in seiner Werkstatt (Westen).', 'Öffne das Mondtor: Dreh alle drei Mondsteine auf Vollmond 🌕.', 'Geh durchs Mondtor zum Risstor und beruhige den Mondwolf (Elementar-Kampf).', 'Kehre zu Mira zurück.', 'Geschafft – die Weltentore sind offen!'];
  K.QS = QS;
  const herbM = [], HERB = [[-20, 60], [26, 70], [-8, 88]].map(([u, v]) => ({ x: X(u), z: Z(v) }));
  for (const h of HERB) { const g = new THREE.Group(), b = new BI.Batch(); for (let k = 0; k < 5; k++) b.box(Math.sin(k * 1.26) * .22, .25, Math.cos(k * 1.26) * .22, .12, .55, .05, 0x6bffa0, k * 1.26, .35); g.add(b.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))); g.position.set(h.x, 0, h.z); grp.add(g); herbM.push(g); }
  const RIFT = Array.from({ length: 5 }, (_, i) => { const a = i / 5 * TAU + .5, u = Math.sin(a) * 26, v = 64 + Math.cos(a) * 18, x = X(u), z = Z(v), g = new THREE.Group(), b = new BI.Batch(); b.sph(0, 0, 0, .55, 0x3a1a6a, 1, 1, 1.1, 1); for (const sd of [-1, 1]) b.sph(sd * .2, .1, .45, .12, 0xd8b0ff, 0); b.cone(0, .45, 0, .3, .5, 0x6a3ad8, 5); g.add(b.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }))); g.position.set(x, 1.4, z); grp.add(g); return { x, z, g, ph: i }; });
  const stoneSp = A.stones.map((q, i) => { const sp = canvasSprite(() => { }, 128, 128, 1.6); sp.position.set(q.x, 2.1, q.z); return sp; }), PH = ['🌑', '🌒', '🌓', '🌕', '🌗'];
  const drawStones = () => { const s = S(); stoneSp.forEach((sp, i) => sp.userData.redraw(c => { c.font = '96px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PH[s.moon[i] % 5], 64, 70); })); }; drawStones();
  const goal = () => { const s = S(); return QS[Math.min(8, s.st)] + (s.st === 1 ? ' (' + s.herbs + '/3)' : s.st === 3 ? ' (' + s.rift + '/5)' : ''); };
  const step = (n, msg, stars) => { const s = S(); s.st = Math.max(s.st, n); s.q = s.st >= 8 ? 4 : Math.min(3, s.st >= 7 ? 3 : s.st >= 3 ? 2 : s.st >= 1 ? 1 : 0); persist(); if (stars) G.addStars(stars); snd('star'); if (msg) say(msg + (stars ? ' +' + stars + ' ⭐' : '') + '  ➜ ' + goal(), 6500); };
  let busy = 0; const later = (f, ms) => { busy = performance.now() + ms; setTimeout(() => { busy = 0; f(); }, ms); };
  function talk(n) {
    const s = S(), st = s.st; let line = n.lines[n.i++ % n.lines.length]; if (busy && performance.now() < busy) return;
    if (n.id === 'mira') {
      if (st === 0) { say('💬 Mira: „Zotik! Hörst du das Summen im Boden? Es kommt aus dem Mondwald. Ich brauche drei Mondkräuter für einen Schutztrank – sie leuchten grün zwischen den Bäumen im Süden.“', 8000); n.c.pose && n.c.pose(0, 0, true); return later(() => step(1, '🌿 Neue Aufgabe!', 1), 8200); }
      if (st === 1) line = 'Drei Mondkräuter, Zotik. Sie leuchten grün im Mondwald im Süden! 🌿';
      else if (st === 2) { say('💬 Mira: „Wunderbar, sie sind frisch! Damit halte ich das Summen vom Dorf fern. Aber im Wald schwirren Riftlinge herum – sie sind nur verängstigt. Berühre sie, dann beruhigt sie dein Licht.“', 8000); return later(() => step(3, '✨ Neue Aufgabe!', 2), 8200); }
      else if (st === 3) line = 'Die Riftlinge schweben zwischen den Bäumen. Lauf zu ihnen – dein Licht beruhigt sie. ✨';
      else if (st === 4) line = 'Professorium wartet in seiner Werkstatt im Westen. Er hat das Summen gemessen! ⚙️';
      else if (st === 5) line = 'Die Mondsteine am Mondtor zeigen Mondphasen. Elwen kennt das alte Lied: alle drei auf Vollmond! 🌕';
      else if (st === 6) line = 'Hinter dem Mondtor wartet der Mondwolf am Risstor. Sei mutig – und freundlich! 🐺';
      else if (st === 7) { say('💬 Mira: „Du hast es geschafft – das Summen ist leiser geworden! Der Wolf wollte nur beschützen, was hinter dem Tor liegt. Jetzt sind die Weltentore offen!“', 8000); return later(() => { step(8); bonus(10, '🏆 Kapitel „Der erste Riss“ geschafft! Die Weltentore sind offen.'); }, 8200); }
    }
    if (n.id === 'prof' && st === 4) { say('💬 Professorium: „Da bist du! Mein Resonator hat die Quelle gefunden: das Risstor hinter dem Mondtor. Nimm diese Mondlaterne – und die Nautilux steht draußen bereit! Das Mondtor öffnet sich nur bei Vollmond.“', 9000); return later(() => step(5, '🏮 Mondlaterne erhalten!', 2), 9200); }
    say('💬 ' + n.name.split(' – ')[0] + ': „' + line + '“', 7000); n.c.pose && n.c.pose(0, 0, true); if (n.onTalk) n.onTalk();
  }
  K.near = function () {
    if (P.veh || P.y > 12) return null; const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
    if (!K.inside) return null;
    if (nr(A.zportal.x, A.zportal.z, 4.2)) return { k: 'zspiel', label: ['🌀', 'Ins Zotik-Spiel reisen'] };
    for (const n of NPC) if (nr(n.x, n.z, 3)) return { k: 'zspeak', id: n.id, label: ['💬', 'Mit ' + n.name.split(' – ')[0] + ' sprechen'] };
    if (nr(A.statue.x, A.statue.z, 6.4)) return { k: 'zstatue', label: ['📸', 'Zotik-Statue bewundern'] };
    if (nr(felli.root.position.x, felli.root.position.z, 2.6)) return { k: 'zfelli', label: ['🌱', 'Felli streicheln'] };
    for (let i = 0; i < A.stones.length; i++) if (nr(A.stones[i].x, A.stones[i].z, 2.2)) return { k: 'zstone', i, label: ['🌙', 'Mondstein drehen'] };
    if (nr(A.riss.x, A.riss.z - 3, 5)) return { k: 'zriss', label: ['🐺', S().st >= 7 ? 'Mondwolf streicheln' : 'Zum Mondwolf'] };
    if (nr(A.camp.x, A.camp.z, 3.2)) return { k: 'zfire', label: ['🔥', 'Am Lagerfeuer ausruhen'] };
    for (const g of A.gates) if (nr(g.x, g.z, 3.2)) return { k: 'zgate', i: g.i, label: ['🌀', 'Durch das Tor: ' + gateNames[g.i].replace(/^\S+\s/, '')] };
    if (nr(X(0), Z(0), 7.4)) return { k: 'zcrystal', label: ['💎', 'Kristallbrunnen berühren'] };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'zspiel') { const now = performance.now(); if (now - (K._askT || -1e9) < 5000) { K._askT = -1e9; persist(); say('🌀 Auf zum Zotik-Spiel! Dein Fortschritt ist gespeichert …', 2400); A.speak && A.speak('Auf zum Zotik Spiel!'); setTimeout(() => K.nav(new URL('../zotik/?from=bunteinsel', location.href).href), 900); } else { K._askT = now; say('🌀 Das Tor führt ins große Zotik-Spiel – dort beginnt Zotiks Reise durch zehn Welten. Nochmal drücken zum Reisen!', 4600); } return; }
    if (n.k === 'zspeak') talk(NPC.find(q => q.id === n.id));
    else if (n.k === 'zfelli') { felli.set('happy', 0); fx.burst(felli.root.position.x, 1.4, felli.root.position.z, 12, [[.6, 1, .4], [1, 1, .6]], 3, 1, 28, -1); say('🌱 Felli kichert und kuschelt sich an dich!', 2400); G.takeMascot('moosling'); }
    else if (n.k === 'zstone') { s.moon[n.i] = (s.moon[n.i] + 1) % 5; persist(); drawStones(); note(392 + s.moon[n.i] * 98, .3, 'sine', .1, 0); if (s.moon.every(m => m === 3)) { if (s.st === 5) { fx.burst(A.mondtor.x, 6, A.mondtor.z, 30, [[.6, .8, 1], [1, 1, 1]], 5, 1.4, 28, -1); step(6, '🌕🌕🌕 Das Mondtor öffnet sich!', 2); } else say('🌕🌕🌕 Vollmond! ' + (s.st < 5 ? 'Professorium weiß mehr über das Tor.' : 'Das Mondtor ist offen.'), 3600); } }
    else if (n.k === 'zriss') { if (s.st >= 7) { fx.burst(wolf.position.x, 2.4, wolf.position.z, 14, [[1, .6, .8], [1, 1, 1]], 3, 1, 28, -1); say('🐺💙 Der Mondwolf wedelt mit dem Schwanz – er ist jetzt dein Freund!', 3200); } else if (s.st < 6) say('🐺 Der Mondwolf knurrt leise und bewacht das Risstor. ' + (s.st === 5 ? 'Öffne erst das Mondtor (🌕🌕🌕)!' : 'Hilf zuerst Mira im Dorf.'), 4600); else { s.fought = 0; persist(); say('🐺 Der Mondwolf heult! Zeig ihm im Elementar-Kampf, dass du das Tor beschützen kannst!', 3000); G.start('elementar_zotik'); } }
    else if (n.k === 'zfire') { fx.burst(A.camp.x, 1.5, A.camp.z, 16, [[1, .7, .3], [1, .9, .5]], 3, 1.2, 28, -2); say('🔥 Du wärmst dich am Lagerfeuer. Lyra, Nia und Rovan erzählen von ihren Reisen.', 3600); if (!s.camp) { s.camp = 1; persist(); setTimeout(() => bonus(1, '🔥 Am Lagerfeuer der Weltenreisenden!'), 900); } }
    else if (n.k === 'zgate') { if (s.st < 8) { say('🌀 Das Tor schläft noch … es wacht erst auf, wenn der Riss ruhig ist. ➜ ' + goal(), 4600); return; } if (!s.gates) { s.gates = 1; persist(); G.addStars(2); say('🌀 Das erste Weltentor! +2 ⭐', 2200); } G.go(gateDest[n.i]); }
    else if (n.k === 'zstatue') { fx.burst(A.statue.x, A.statue.top + 4, A.statue.z, 26, [[1, .85, .4], [1, 1, 1], [.5, .8, 1]], 5, 1.4, 28, -1); [523, 659, 784, 1047].forEach((f, i) => note(f, 1.2, 'sine', .1, i * .1)); if (!s.statue) { s.statue = 1; persist(); G.addStars(1); say('🦊 Zotik, der Weltenhörer – er hört, wenn Welten rufen! +1 ⭐', 4200); } else say('🦊 Zotik, der Weltenhörer – er hört, wenn Welten rufen!', 3000); }
    else if (n.k === 'zcrystal') { fx.burst(X(0), 5, Z(0), 24, [[.5, .8, 1], [1, 1, 1], [.8, .6, 1]], 4, 1.3, 28, -1); [523, 659, 784].forEach((f, i) => note(f, 1.4, 'sine', .1, i * .12)); say('💎 Der Kristall summt – „Alle Welten sind verbunden.“ ➜ ' + goal(), 4200); }
  };
  /* ===== Splitter (Zotik-Währung): einsammeln, 10 = 1 ⭐ ===== */
  const SP = []; { const rr = BI.rng(909); for (let i = 0; SP.length < 48 && i < 900; i++) { const a = rr() * TAU, d = 8 + rr() * (A.R - 14), x = A.x + Math.sin(a) * d, z = A.z + Math.cos(a) * d; if (!W.free(x, z, .9)) continue; SP.push({ x, z, y: Math.min(A.hill.tiers, K.floor(x, z)) + 1.0, v: SP.length % 8 === 7 ? 5 : 1 }); } }
  K.shards = SP; const shardM = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.42, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), SP.length), dm = new THREE.Object3D(), col = new THREE.Color(); shardM.frustumCulled = false; SP.forEach((q, i) => shardM.setColorAt(i, col.setHex(q.v > 1 ? 0xffd23f : [0x7fb8ff, 0xb48aff][i % 2]))); grp.add(shardM);
  /* Feuerschein im Camp */
  const fire = new THREE.Mesh(new THREE.ConeGeometry(.7, 1.6, 7), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: .85, fog: false })); fire.position.set(A.camp.x, 1.2, A.camp.z); grp.add(fire);
  /* ===== Frame ===== */
  let was = false, shardT = 0;
  K.goal = goal; K.dbg = { RIFT, HERB, wolf, NPC };
  K.update = function (dt, t) {
    zR.m.rotation.z = t * .5; zR.sw.material.opacity = .35 + .12 * Math.sin(t * 2.4);
    if (arrive && G.playing && G.playing()) { arrive = false; P.veh = null; P.x = ZP.x; P.z = ZP.z + 5; P.y = 0; P.vy = 0; P.h = Math.PI; const s0 = S(); if (!s0.back) { s0.back = 1; persist(); setTimeout(() => bonus(2, '🌀 Willkommen zurück aus dem Zotik-Spiel!'), 600); } else say('🌀 Willkommen zurück aus dem Zotik-Spiel!', 2600); }
    const d0 = Math.hypot(P.x - A.x, P.z - A.z), ins = d0 < A.R + 25; K.inside = ins; if (d0 < 330 && A.loadWelt) A.loadWelt();
    if (ins !== was) { was = ins; if (ins) { const s0 = S(); if (!s0.visit) { s0.visit = 1; persist(); setTimeout(() => bonus(2, '🌙 Willkommen in Lunaris, dem Dorf am Mondblick!'), 700); } else say('🌙 Lunaris – Dorf am Mondblick  ➜ ' + goal(), 3200); } }
    const near = d0 < 650; if (grp.visible !== near) grp.visible = near;
    if (!ins) return; const s = S();
    halo.rotation.z = t * .5; halo.position.y = A.statue.top + 14 * A.S + Math.sin(t * 1.4) * .1; crystal.rotation.y = t * .7; crystal.position.y = 4.4 + Math.sin(t * 1.5) * .25; beam.material.opacity = .26 + .08 * Math.sin(t * 2.2);
    rR.m.rotation.z = t * .4; rR.sw.material.opacity = (s.st >= 7 ? .2 : .4) + .1 * Math.sin(t * 2); mR.m.rotation.z = t * .6; mR.sw.material.opacity = s.st >= 6 ? .5 + .2 * Math.sin(t * 3) : .1;
    fire.scale.set(1 + .12 * Math.sin(t * 11), 1 + .2 * Math.sin(t * 7.3), 1 + .12 * Math.cos(t * 9)); if (Math.random() < dt * 8) fx.emit(A.camp.x + (Math.random() - .5) * .8, 1.6, A.camp.z + (Math.random() - .5) * .8, 0, 1.6, 0, .9, 26, 1, .6, .2, -1, .9);
    gateR.forEach((g, i) => { g.m.rotation.z = t * .5 + i; g.sw.material.opacity = (s.st >= 8 ? .55 : .14) + .1 * Math.sin(t * 2.4 + i); });
    for (const n of NPC) { const dn = Math.hypot(P.x - n.x, P.z - n.z); if (dn < 9) n.c.group.rotation.y += BI.angDiff(n.c.group.rotation.y, Math.atan2(P.x - n.x, P.z - n.z)) * Math.min(1, dt * 4); else if (n.home) n.c.group.rotation.y += BI.angDiff(n.c.group.rotation.y, Math.atan2(n.home.x - n.x, n.home.z - n.z)) * Math.min(1, dt * 2); n.c.pose && n.c.pose(t * 1.3 + n.x, 0, dn < 5); }
    felli.set('idle', t); { const px = felli.root.position.x, pz = felli.root.position.z; felli.root.rotation.y += BI.angDiff(felli.root.rotation.y, Math.atan2(P.x - px, P.z - pz)) * Math.min(1, dt * 3); }
    /* Mondwolf: wach und wachsam – nach dem Kampf ruhig und fröhlich */
    { const calm = s.st >= 7; wolf.position.y = calm ? Math.abs(Math.sin(t * 3)) * .15 : 0; wolf.rotation.y = Math.PI + (calm ? Math.sin(t * 1.3) * .4 : Math.sin(t * .6) * .15); wolfSign.visible = !calm || Math.hypot(P.x - wolf.position.x, P.z - wolf.position.z) < 12; }
    if (s.st === 6 && s.fought) step(7, '🐺💙 Der Mondwolf ist ruhig – er wollte nur das Tor beschützen! Bring Mira die gute Nachricht.', 3);
    /* Mondkräuter (Schritt 1) */
    herbM.forEach((g, i) => { const on = s.st <= 1 && !((s.hb || 0) & (1 << i)); g.visible = on; if (!on) return; g.rotation.y = t * .8; g.position.y = .1 + Math.sin(t * 2 + i) * .08; if (s.st === 1 && Math.hypot(P.x - HERB[i].x, P.z - HERB[i].z) < 1.6) { s.hb = (s.hb || 0) | (1 << i); s.herbs = Math.min(3, (s.herbs || 0) + 1); persist(); fx.burst(HERB[i].x, 1, HERB[i].z, 12, [[.4, 1, .6], [1, 1, .7]], 3, 1, 26, -1); note(784, .3, 'triangle', .1, 0); if (s.herbs >= 3) step(2, '🌿🌿🌿 Alle Mondkräuter! Bring sie zu Mira.', 1); else say('🌿 Mondkraut ' + s.herbs + '/3', 1800); } });
    /* Riftlinge (Schritt 3): schweben im Mondwald, Berühren beruhigt sie */
    RIFT.forEach((r, i) => { const on = s.st === 3 && !((s.rb || 0) & (1 << i)); r.g.visible = on; if (!on) return; r.g.position.set(r.x + Math.sin(t * .9 + r.ph) * 2.2, 1.4 + Math.sin(t * 2.3 + r.ph) * .35, r.z + Math.cos(t * .7 + r.ph) * 2.2); r.g.rotation.y = t * 1.4; if (Math.hypot(P.x - r.g.position.x, P.z - r.g.position.z) < 1.7) { s.rb = (s.rb || 0) | (1 << i); s.rift = Math.min(5, (s.rift || 0) + 1); persist(); fx.burst(r.g.position.x, 1.6, r.g.position.z, 20, [[1, 1, .7], [.8, .7, 1]], 4, 1.1, 28, -1); [659, 880].forEach((f, k) => note(f, .4, 'sine', .1, k * .08)); if (s.rift >= 5) step(4, '✨ Alle Riftlinge sind ruhig! Professorium will dich sprechen (Werkstatt im Westen).', 2); else say('✨ Riftling beruhigt ' + s.rift + '/5', 1800); } });
    const pm = P.veh && P.veh.type === 'nautilux'; if (pm && !s.ship) { s.ship = 1; persist(); setTimeout(() => bonus(2, '🚤 Erster Flug mit der Nautilux!'), 600); }
    SP.forEach((q, i) => { if (s.shards.includes(i)) { dm.position.set(0, -80, 0); dm.scale.setScalar(.001); } else { dm.position.set(q.x, q.y + Math.sin(t * 2 + i) * .18, q.z); dm.scale.setScalar(q.v > 1 ? 1.5 : 1); dm.rotation.set(0, t * 1.2 + i, Math.sin(t + i) * .3); } dm.updateMatrix(); shardM.setMatrixAt(i, dm.matrix); }); shardM.instanceMatrix.needsUpdate = true;
    shardT -= dt; if (shardT <= 0) { shardT = .08; for (let i = 0; i < SP.length; i++) { const q = SP[i]; if (s.shards.includes(i)) continue; if (Math.abs(P.x - q.x) < 1.4 && Math.abs(P.z - q.z) < 1.4 && Math.abs(P.y + .8 - q.y) < 2.2) { s.shards.push(i); s.pts += q.v; note(988, .25, 'triangle', .09, 0); fx.burst(q.x, q.y, q.z, 8, [[.5, .7, 1], [.8, .6, 1]], 2.4, .6, 24, 3); const due = Math.floor(s.pts / 10) - s.paid; if (due > 0) { s.paid += due; G.addStars(due); say('💠 → ⭐ Splitter werden zu Sternen: +' + due + ' ⭐ (' + s.pts + ' Splitter)', 3000); } else say('💠 Splitter ' + s.pts + ' (alle 10 = 1 ⭐)', 1100); persist(); } } }
    /* Glühwürmchen und Mondfunken (wie im Mondwald des Zotik-Spiels) */
    if (Math.random() < dt * 6) { const a = Math.random() * TAU, d = Math.random() * A.R * .9; fx.emit(A.x + Math.sin(a) * d, .6 + Math.random() * 2.5, A.z + Math.cos(a) * d, (Math.random() - .5) * .4, .3, (Math.random() - .5) * .4, 2.2, 18, [.7, 1, .8][Math.random() * 3 | 0], 1, .6, -.05, .9); }
    if (Math.random() < dt * 5 && Math.hypot(P.x - X(0), P.z - Z(0)) < 50) fx.emit(X(0) + (Math.random() - .5) * 3, 4 + Math.random() * 2, Z(0) + (Math.random() - .5) * 3, 0, 1.2, 0, 1.4, 34, .6, .8, 1, -.5, .8);
  };
  K.log = () => { const s = S(), st = s.st; return { title: '🌙 Zotik – Lunaris', count: ([s.visit, st >= 1, st >= 3, st >= 4, st >= 6, st >= 7, st >= 8, s.ship, s.statue, s.gates, s.camp].filter(Boolean).length + Math.min(3, Math.floor(s.pts / 20))) + ' von 14', rows: [
    { ok: !!s.visit, icon: '🌉', text: 'Lunaris besuchen (Brücke am Steg im Süden der Hauptinsel)', dest: 'zotik' },
    { ok: st >= 1, icon: '💬', text: 'Quest „Der erste Riss“: ' + QS[0], dest: 'zotik' },
    { ok: st >= 3, icon: '🌿', text: 'Drei Mondkräuter im Mondwald sammeln und zu Mira bringen', dest: 'zotik' },
    { ok: st >= 4, icon: '✨', text: QS[3], dest: 'zotik' },
    { ok: st >= 6, icon: '🌕', text: 'Professorium besuchen und das Mondtor öffnen (alle Mondsteine auf Vollmond)', dest: 'zotik' },
    { ok: st >= 7, icon: '🐺', text: 'Den Mondwolf am Risstor beruhigen (Elementar-Kampf)', dest: 'zotik' },
    { ok: st >= 8, icon: '🏆', text: QS[7] + ' – die Weltentore öffnen sich', dest: 'zotik' },
    { ok: !!s.ship, icon: '🚤', text: 'Mit der Nautilux fliegen (parkt an Professoriums Werkstatt)', dest: 'zotik' },
    { ok: !!s.statue, icon: '🦊', text: 'Die große Zotik-Statue bewundern', dest: 'zotik' },
    { ok: !!s.camp, icon: '🔥', text: 'Am Lagerfeuer der Weltenreisenden ausruhen', dest: 'zotik' },
    { ok: !!s.gates, icon: '🌀', text: 'Durch ein Weltentor reisen', dest: 'zotik' },
    { ok: s.pts >= 60, icon: '💠', text: 'Splitter sammeln: ' + s.pts + ' (alle 10 = 1 ⭐)', dest: 'zotik' }] }; };
  return K;
};

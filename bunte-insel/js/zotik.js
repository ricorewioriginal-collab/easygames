'use strict';
/* Bunte Insel – Zotik: Die Splitter der Welten (Erweiterung). Zotik ist ein eigenes 3D-Rollenspiel-Projekt von Rico (Fantasy, schwebende Inseln, Weltenreisen);
   hier steht seine Hauptstadt „Lunaris“ als begehbare Welt. Zotik (Fuchs-Mensch), Lyra, Rovan, Nia, Moosling „Felli“, Professorium, Rurik, Mira und das
   Luftschiff Nautilux sind seine eigenen Figuren. Anregungen aus Fantasy-Rollenspielen sind nur allgemeine Ideen (schwebende Inseln, Weltentore, Elemente).
   Eingang: Rissportal auf der Hauptinsel. Die Stadt liegt weit weg auf einer eigenen schwebenden Insel mit lila Abendhimmel, Mond und Sternen.
   Inhalt: Marktplatz mit Händler Rurik, Taverne, Akademie, Burg (Stufen-Hügel), Hafen mit fliegendem Luftschiff Nautilux, Weltentor-Platz (6 Tore zu den anderen Welten),
   Splitter einsammeln (10 = 1 ⭐), Quest „Der Ruf des Kristalls“, Highlight-Spiel „Elementar-Kampf“ (rundenbasiert, Elementkreis), Moosling Felli als Partner. */
BI.ZOTIK = { x: -1500, z: 0, R: 112, hill: { x: 0, z: -62, R: 36, tiers: 8 }, portal: { x: -84, z: -42 } };

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

/* ---------- statisch: Plateau, Plaza, Markt, Taverne, Akademie, Burghügel, Hafen, Weltentore, Bäume (+ Rissportal an der Oberfläche) ---------- */
BI.buildZotikGround = function (c) {
  const { W, st: mainSt, lamp: mainLamp, scene } = c, A = BI.ZOTIK, TAU = Math.PI * 2, rn = BI.rng(31337), X = u => A.x + u, Z = v => A.z + v, P = (r, a) => [X(Math.sin(a) * r), Z(Math.cos(a) * r)];
  const st = new BI.Batch(), glow = new BI.Batch(), MARB = 0xe8e2f4, STONE = 0xb8b4d0, STONE2 = 0x9a96b8, GOLD = 0xd8a24a, BLUE = 0x3f6fd8, WOOD = 0x8a5a33, GL = [0x7fb8ff, 0xb48aff, 0x6bffd0, 0xff9ad5];
  const H = A.hill, hx = X(H.x), hz = Z(H.z);
  W.zotik = { x: A.x, z: A.z, R: A.R,
    fix(px, pz, r, out) { const lx = px - A.x, lz = pz - A.z, d = Math.hypot(lx, lz); if (d > 420) return false; let hit = false, nx = px, nz = pz; if (d > A.R - r) { const k = (A.R - r) / d; nx = A.x + lx * k; nz = A.z + lz * k; hit = true; } out.fx = nx; out.fz = nz; out.fhit = hit; return true; },
    floor(x, z) { const lx = x - hx, lz = z - hz; if (lx < -40 || lx > 40 || lz < -40 || lz > 40) return 0; const d = Math.hypot(lx, lz); return d < H.R ? Math.min(H.tiers, 1 + Math.floor((H.R - d) / 4)) : 0; } };
  /* Schwebende Insel: Platte, Felsunterseite, Rand */
  st.disc(X(0), Z(0), A.R, 0, 0x78c868, 80); st.ring(X(0), Z(0), A.R - 4, A.R + 5, .012, STONE, 80); st.cyl(X(0), -78.08, Z(0), A.R + 4.6, 8, 78, 0x6a5a8a, 28); st.cyl(X(0), -40.2, Z(0), A.R * .7, 6, 40, 0x7a6a9a, 14);
  for (let i = 0; i < 12; i++) { const a = rn() * TAU, d = 20 + rn() * (A.R - 40), [x, z] = P(d, a); glow.cone(x, -30 - rn() * 30, z, 2 + rn() * 3, 14 + rn() * 14, GL[i % 4], 5); }
  for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, [x, z] = P(A.R - 1.2, a); st.cyl(x, 0, z, .3, .34, 1.3, STONE2, 6); if (k % 5 === 0) glow.sph(x, 1.6, z, .3, 0xffe8b0, 1); }
  /* Plaza mit Kristallbrunnen und Wegen */
  st.disc(X(0), Z(0), 26, .012, 0xd8d0e8, 48); for (const [r0, r1, col] of [[8, 9, GOLD], [14, 15, BLUE], [22, 23, GOLD]]) st.ring(X(0), Z(0), r0, r1, .02, col, 48);
  for (const [a, len] of [[Math.PI, 60], [Math.PI / 2 * 3, 70], [Math.PI / 2, 52], [0, 60], [Math.PI * .75, 62]]) { const m = 26 + len / 2, [x, z] = P(m, a); st.strip(x, z, 7, len, a, .012, 0xcfc6dc); }
  st.cyl(X(0), 0, Z(0), 6.2, 6.6, .9, MARB, 24); st.cyl(X(0), .9, Z(0), 5.2, 5.2, .15, 0x6aa8ff, 24); st.cyl(X(0), .9, Z(0), 1.0, 1.4, 2.2, STONE, 10); W.addCircle(X(0), Z(0), 6.8, false, 3);
  /* Markt „Wanderhand“ im Westen: Stände mit Stoffdächern, Regalen, Fässern, Laternen */
  const stall = (x, z, col, big) => { const w = big ? 9 : 5.2, d = big ? 5 : 3.6; for (const sx of [-1, 1]) for (const sz of [-1, 1]) st.cyl(x + sx * w / 2, 0, z + sz * d / 2, .14, .16, 3.4, WOOD, 6); for (let i = 0; i < 6; i++) st.box(x - w / 2 + (i + .5) * w / 6, 3.4, z, w / 6, .14, d + .8, i % 2 ? col : 0xf4eede, 0, .18); st.box(x, 0, z + d / 2 - .3, w, 1, .8, 0xa8703a); st.box(x, 1.0, z + d / 2 - .3, w + .1, .1, .9, 0xc9a070); for (let i = 0; i < (big ? 9 : 5); i++) glow.sph(x - w / 2 + .7 + i * ((w - 1.4) / (big ? 8 : 4)), 1.35, z + d / 2 - .3, .22, GL[i % 4], 1, .8, 1.3, .8); st.box(x, 0, z - d / 2 + .3, w - .6, 2.2, .3, 0x6b4a2a); W.addBox(x - w / 2, z + d / 2 - .8, x + w / 2, z + d / 2 + .2, false, 1.1); };
  stall(X(-38), Z(0), BLUE, true); stall(X(-36), Z(-18), 0xc23a4a); stall(X(-36), Z(18), 0x2f9a6a); stall(X(-52), Z(-9), 0xd8a24a); stall(X(-52), Z(9), 0x8a5ad8);
  for (let i = 0; i < 8; i++) { const a = i * .8, [x, z] = [X(-46 + Math.sin(a) * 9), Z(Math.cos(a * 1.7) * 14)]; st.cyl(x, 0, z, .45, .5, .9, 0x8a5a33, 8); }
  /* Taverne (Osten) mit Giebeldach, Fenstern und Schild; Akademie-Turm (Südosten) */
  { const tx = X(40), tz = Z(8); st.box(tx, 0, tz, 16, 6.5, 11, 0xe8d8b8); st.prism(tx, 6.5, tz, 17, 4.2, 12, 0x8a3a3a, Math.PI / 2); for (let i = 0; i < 4; i++) glow.box(tx - 5 + i * 3.3, 2.2, tz + 5.55, 1.4, 1.6, .1, 0xffe08a); st.box(tx, 0, tz + 5.5, 2, 3, .2, 0x6b4a2a); W.addBox(tx - 8, tz - 5.5, tx + 8, tz + 5.5, false, 11); A.tavern = { x: tx, z: tz }; }
  { const ax = X(60), az = Z(52); st.cyl(ax, 0, az, 6, 6.5, 22, MARB, 14); st.cone(ax, 22, az, 7.5, 9, BLUE, 14); for (let i = 0; i < 4; i++) glow.box(ax + Math.sin(i * 1.57) * 6.1, 9 + i * 3, az + Math.cos(i * 1.57) * 6.1, .8, 1.6, .8, 0xffe08a); st.sph(ax, 31, az, .6, GOLD, 1); st.box(ax - 14, 0, az, 12, 8, 8, 0xd8d0ec); st.prism(ax - 14, 8, az, 13, 3, 9, 0x4a5aa8, Math.PI / 2); W.addCircle(ax, az, 6.6, false, 22); W.addBox(ax - 20, az - 4, ax - 8, az + 4, false, 8); A.akad = { x: ax, z: az }; }
  /* Burghügel mit 8 Stufen (je 1 m, überall begehbar) und Burg obenauf */
  for (let k = 1; k <= H.tiers; k++) { const R = H.R - 4 * (k - 1); st.cyl(hx, k - 1, hz, R, R, 1, k % 2 ? STONE : STONE2, 48); glow.ring(hx, hz, R - .5, R, k + .015, k % 2 ? 0x7fb8ff : GOLD, 48); }
  st.box(hx, H.tiers, hz, 11, 14, 11, MARB); st.box(hx, H.tiers + 14, hz, 12.4, .8, 12.4, STONE); st.cone(hx, H.tiers + 14.8, hz, 8, 18, BLUE, 4, 0); st.sph(hx, H.tiers + 33, hz, .7, GOLD, 1); W.addBox(hx - 5.6, hz - 5.6, hx + 5.6, hz + 5.6, false, 30);
  for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + TAU / 8, [x, z] = [hx + Math.sin(a) * 7.8, hz + Math.cos(a) * 7.8]; st.cyl(x, H.tiers, z, 1.5, 1.7, 17, MARB, 10); st.cone(x, H.tiers + 17, z, 2.3, 6.5, i % 2 ? 0xc23a4a : BLUE, 10); W.addCircle(x, z, 1.8, false, 25); glow.sph(x, H.tiers + 11, z + 1.6, .3, 0xffe08a, 1); }
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + .3, [x, z] = [hx + Math.sin(a) * 26, hz + Math.cos(a) * 26]; st.cyl(x, 2, z, .12, .14, 4.4, WOOD, 6); st.box(x, 5.2, z, 1.2, 2.2, .1, BLUE, a); glow.sph(x, 6.7, z, .28, GOLD, 1); }
  /* Hafen im Süden: Steg, Pfähle, Kisten, Fässer, Leuchtfeuer; das Luftschiff Nautilux wartet */
  { const px0 = X(-24), px1 = X(24), pz0 = Z(76), pz1 = Z(102); st.rect(px0, pz0, px1, pz1, .02, 0x9a6b3d); for (let z = pz0 + 1; z < pz1; z += 2) st.rect(px0, z, px1, z + .08, .03, 0x7a5230); for (let x = px0 + 2; x < px1; x += 6) for (const z of [pz0 + .5, pz1 - .5]) st.cyl(x, 0, z, .3, .34, 1.4, WOOD, 6);
    for (const [x, z] of [[-18, 94], [-14, 97], [18, 92]]) { st.box(X(x), 0, Z(z), 2, 1.6, 2, 0xb98650); W.addBox(X(x) - 1, Z(z) - 1, X(x) + 1, Z(z) + 1, false, 1.6); } for (const [x, z] of [[-20, 90], [20, 96]]) { st.cyl(X(x), 0, Z(z), .7, .7, 1.3, 0x7a4a2a, 10); W.addCircle(X(x), Z(z), .8, false, 1.3); }
    st.cyl(X(0), 0, Z(106), 1.2, 1.6, 7, MARB, 8); glow.sph(X(0), 7.6, Z(106), .9, 0xfff0a0, 1); W.vehicleSpawns.push({ type: 'nautilux', x: X(0), z: Z(88), h: Math.PI }); A.hint = { x: X(-16), z: Z(90) }; glow.cone(A.hint.x, 0, A.hint.z, .6, 1.6, 0xffd23f, 5); }
  /* Weltentor-Platz (Südwesten): 6 leuchtende Tore */
  { const cx = X(-54), cz = Z(52), cols = [0xff8a3d, 0x4da3ff, 0xdddddd, 0xff5ab4, 0xffd23f, 0x35d6e0]; st.disc(cx, cz, 22, .012, 0xd8d0e8, 36); st.ring(cx, cz, 17, 18, .02, GOLD, 36); A.gates = [];
    for (let k = 0; k < 6; k++) { const a = (-60 + k * 24) * Math.PI / 180 + Math.PI * .75, [x, z] = [cx + Math.sin(a) * 15, cz + Math.cos(a) * 15], ry = a + Math.PI; for (const sd of [-1, 1]) { const ox = Math.cos(a) * sd * 2.2, oz = -Math.sin(a) * sd * 2.2; st.cyl(x + ox, 0, z + oz, .45, .55, 5, MARB, 8); glow.sph(x + ox, 5.2, z + oz, .5, cols[k], 1); W.addCircle(x + ox, z + oz, .8, false, 5); } st.box(x, 5, z, 5.4, .8, .8, MARB, ry); A.gates.push({ x, z, a, col: cols[k], i: k }); } A.gateC = { x: cx, z: cz }; }
  /* Mondbäume (violett, leuchtend) und Laternen */
  for (let i = 0; i < 46; i++) { const a = rn() * TAU, d = 30 + rn() * (A.R - 44), [x, z] = P(d, a); if (Math.hypot(x - hx, z - hz) < H.R + 6 || Math.hypot(x - X(-44), z - Z(0)) < 22 || Math.hypot(x - X(40), z - Z(8)) < 14 || Math.hypot(x - X(60), z - Z(52)) < 18 || Math.hypot(x - X(-54), z - Z(52)) < 26 || (z > Z(70) && Math.abs(x - A.x) < 32) || Math.hypot(x - X(0), z - Z(0)) < 28 || Math.hypot(x - X(75), z - Z(-10)) < 9 || Math.hypot(x - X(22), z - Z(30)) < 15) continue; const h = 3 + rn() * 2; st.cyl(x, 0, z, .26, .38, h, 0x6a4a8a, 7); glow.sph(x, h + 1.2, z, 1.7 + rn() * .6, GL[i % 4], 1, 1, .9, 1); glow.sph(x + .9, h + .5, z + .4, .8, GL[(i + 1) % 4], 1); W.addCircle(x, z, .5, false, 4); }
  for (let k = 0; k < 20; k++) { const a = k / 20 * TAU, [x, z] = P(30, a); if (z > Z(70) || Math.hypot(x - hx, z - hz) < H.R + 3) continue; st.cyl(x, 0, z, .08, .1, 3.2, 0x3a3a52, 6); glow.sph(x, 3.4, z, .3, 0xffe08a, 1); }
  /* Zotik-Statue (Hauptheld) auf Marmorsockel mit Goldring und Lichtsäulen – die Figur selbst kommt zur Laufzeit */
  { const sx = X(22), sz = Z(30); st.cyl(sx, 0, sz, 7.2, 7.8, .6, STONE, 28); st.cyl(sx, .6, sz, 6, 6.4, .5, MARB, 28); st.cyl(sx, 1.1, sz, 4.2, 4.6, 1.6, MARB, 20); st.ring(sx, sz, 6.2, 6.8, 1.12, GOLD, 40); st.ring(sx, sz, 4.7, 5, 1.14, BLUE, 40);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, x = sx + Math.sin(a) * 6.6, z = sz + Math.cos(a) * 6.6; st.cyl(x, .6, z, .25, .3, 2.4, MARB, 8); glow.sph(x, 3.2, z, .4, GL[k % 4], 1); }
    W.addCircle(sx, sz, 7.6, false, 3); A.statue = { x: sx, z: sz, top: 2.7 }; }
  /* Rückkehr-Rissportal (Osten) */
  { const [x, z] = [X(76), Z(-10)]; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; glow.cone(x + Math.sin(a) * 3.2, 0, z + Math.cos(a) * 3.2, .5, 2 + (k % 2) * 1.2, GL[k % 4], 5); } st.cyl(x, 0, z, 3.6, 3.8, .3, STONE, 20); W.addCircle(x, z, 4.2, false, 3); A.back = { x, z }; }
  /* eigene Meshes (nur in der Nähe sichtbar) */
  const grp = new THREE.Group(), stM = st.mesh(BI.mat()), glM = glow.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); stM.frustumCulled = glM.frustumCulled = false; grp.add(stM, glM); grp.visible = false; scene.add(grp); A.group = grp;
  /* Arcade (Elementar-Kampf) neben der Taverne – nach den Hauptwelt-Automaten gebaut */
  A.addArcade = function () { const a = { x: X(26), z: Z(-12) }, ast = new BI.Batch(), alamp = new BI.Batch(); BI.buildArcades({ W, st: ast, lamp: alamp, only: [{ kind: 'elementar_zotik', x: a.x, z: a.z, yaw: Math.atan2(X(0) - a.x, Z(0) - a.z), body: 0x2a2a6a, top: 0xff8a1f }] }); grp.add(ast.mesh(BI.mat())); if (!alamp.empty) grp.add(alamp.mesh(W.lampMat)); };
  /* Rissportal an der Oberfläche (Hauptinsel): leuchtender Kristallring */
  { const { x, z } = A.portal; mainSt.cyl(x, 0, z, 3.6, 3.9, .35, 0x9a96b8, 20); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; mainSt.cone(x + Math.sin(a) * 3.0, .35, z + Math.cos(a) * 3.0, .45, 2.2 + (k % 3) * .6, [0x7fb8ff, 0xb48aff, 0x6bffd0][k % 3], 5); } mainSt.cyl(x, .35, z, 2.6, 2.6, .1, 0x2a1a6a, 20); mainLamp.cyl(x, .45, z, 2.3, 2.3, .05, 0xc8b8ff, 20); mainSt.cone(x, .45, z, .6, 4.5, 0x7fb8ff, 6); W.addCircle(x, z, 4.4, false, 3); W.spots.zotikPortal = { x, z }; }
};

/* ---------- Laufzeit ---------- */
BI.createZotik = function (G) {
  const { scene, W, A: AU, fx, P, say, save, persist } = G, K = {}, A = BI.ZOTIK, TAU = Math.PI * 2, X = u => A.x + u, Z = v => A.z + v;
  const S = () => save.zotik || (save.zotik = { q: 0, shards: [], pts: 0, paid: 0, fought: 0, visit: 0, gates: 0, ship: 0, felli: 0, talk: {} });
  const note = (f, d, ty, v, del) => { try { AU.note && AU.note(f, d, ty, v, del || 0); } catch (e) { } }, snd = n => { try { AU[n] && AU[n](); } catch (e) { } };
  const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3600); snd('fanfare'); };
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#2a1a5a'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffe9a8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, fog: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); A.group.add(sp); return sp; };
  const grp = A.group, hx = X(A.hill.x), hz = Z(A.hill.z);
  K.floor = W.zotik.floor;
  /* ===== Himmel, Mond, Sterne, Strahl, schwebende Inseln ===== */
  { const g = new THREE.SphereGeometry(700, 24, 12), pos = g.attributes.position, col = new Float32Array(pos.count * 3), top = new THREE.Color(0x1a1250), mid = new THREE.Color(0x5a3ac8), hor = new THREE.Color(0xff9ac0), cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 700, k = Math.max(0, y); cc.copy(hor).lerp(mid, Math.min(1, k * 2.4)).lerp(top, Math.max(0, (k - .35) * 1.5)); if (y < 0) cc.copy(hor).multiplyScalar(.5); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); const dome = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); dome.position.set(A.x, 0, A.z); dome.renderOrder = -1; grp.add(dome);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(70, 20, 12), new THREE.MeshBasicMaterial({ color: 0xe8f0ff, fog: false })); moon.position.set(A.x + 260, 230, A.z - 420); grp.add(moon); const halo = new THREE.Mesh(new THREE.SphereGeometry(95, 16, 10), new THREE.MeshBasicMaterial({ color: 0xaab8ff, transparent: true, opacity: .25, fog: false, depthWrite: false })); halo.position.copy(moon.position); grp.add(halo);
    const n = 300, sp = new Float32Array(n * 3), rr = BI.rng(5); for (let i = 0; i < n; i++) { const a = rr() * TAU, e = .2 + rr() * 1.2, d = 650; sp[i * 3] = A.x + Math.sin(a) * Math.cos(e) * d; sp[i * 3 + 1] = Math.sin(e) * d; sp[i * 3 + 2] = A.z + Math.cos(a) * Math.cos(e) * d; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, sizeAttenuation: false, fog: false })); stars.frustumCulled = false; grp.add(stars); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 420, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); beam.position.set(X(0), 210, Z(0)); grp.add(beam);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, fog: false })); crystal.scale.set(1.5, 2.6, 1.5); crystal.position.set(X(0), 5.6, Z(0)); grp.add(crystal);
  const floats = []; { const rr = BI.rng(1212), cols = [0x78c868, 0x9be05a, 0x6bd0c0]; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + rr(), d = 175 + rr() * 110, s = 14 + rr() * 26, b = new BI.Batch(); b.cyl(0, -s * .9, 0, s, s * .15, s * .9, 0x6a5a8a, 9); b.cyl(0, -.05, 0, s, s, .5, cols[i % 3], 12); const tr = 3 + (rr() * 4) | 0; for (let k = 0; k < tr; k++) { const ta = rr() * TAU, td = rr() * s * .7; b.cyl(Math.sin(ta) * td, .4, Math.cos(ta) * td, .3, .4, 3, 0x6a4a8a, 6); b.sph(Math.sin(ta) * td, 4.2, Math.cos(ta) * td, 1.8, [0x7fb8ff, 0xb48aff, 0x6bffd0][k % 3], 1); } if (i % 3 === 0) { b.cyl(0, .4, 0, 2, 2.4, 9, 0xe8e2f4, 8); b.cone(0, 9.4, 0, 3, 6, 0x3f6fd8, 8); } const m = b.mesh(BI.mat()); m.position.set(X(Math.sin(a) * d), 18 + rr() * 90, Z(Math.cos(a) * d)); m.frustumCulled = false; grp.add(m); floats.push({ m, y: m.position.y, ph: rr() * 6, sp: .2 + rr() * .3 }); } }
  /* ===== Schilder ===== */
  sign('⭐ Lunaris – Hauptstadt der Splitter', X(0), 12, Z(12), 14); sign('🛒 Wanderhand – Ausrüstung, Tränke', X(-38), 7, Z(2), 11); sign('🍺 Taverne', X(40), 11.5, Z(14), 6); sign('🎓 Akademie', X(60), 33, Z(52), 7); sign('⚓ Hafen', X(0), 9, Z(106), 5); sign('🏰 Burg Lunaris', hx, 44, hz, 11); sign('🌀 Weltentore', X(-54), 8, Z(52), 8); sign('↩ Rissportal zur Bunten Insel', A.back.x, 6, A.back.z, 10); sign('🕹️ Elementar-Kampf', X(26), 6, Z(-12), 8);
  { const q = W.spots.zotikPortal; const s = sign('🌀 Rissportal nach Lunaris', q.x, 7.4, q.z, 9); grp.remove(s); scene.add(s); K.portalSign = s; }
  const gateNames = ['🐉 Drachenhöhen', '🐶 Fellretter-Bucht', '🎬 Dampfer-Hafen', '🌈 Regenbogenwelt', '🏗️ Bauland', '🔱 Atlantis'], gateDest = ['drachen', 'pups', 'dampf', 'rainbow', 'bauland', 'atlantis'];
  A.gates.forEach((g, i) => sign(gateNames[i], g.x, 7, g.z, 5.4));
  const gateGlow = A.gates.map(g => { const m = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), new THREE.MeshBasicMaterial({ color: g.col, transparent: true, opacity: .55, side: THREE.DoubleSide, fog: false })); m.position.set(g.x, 2.6, g.z); m.rotation.y = g.a + Math.PI; grp.add(m); return m; });
  /* ===== Bewohner (eigene Figuren, mit Dialog und Quest) ===== */
  const NPC = [];
  const mk = (id, x, z, look, name, lines, scale, onTalk) => { const c = BI.makeChar(look), h = Math.atan2(X(0) - x, Z(0) - z); c.group.position.set(x, 0, z); c.group.rotation.y = h; c.group.scale.setScalar(scale || 1); grp.add(c.group); const t = sign(name, x, 3.2 * (scale || 1) + .4, z, 3.6); NPC.push({ id, c, x, z, h, lines, name, i: 0, onTalk, t }); };
  mk('mira', X(30), Z(11), { shirt: 0x7a3dc2, pants: 0x3a2a5a, hair: 0x6b4423, skin: 0xf3c9a0, style: 'braids', dress: true, scale: 1 }, 'Mira – Questgeberin', ['Schön, dass du da bist! Ich bin Mira. Seit ein paar Tagen flackert über der Akademie ein Riss in der Luft.', 'Kannst du dir den Riss ansehen? Zuerst brauchst du einen Hinweis – ich habe gehört, im Hafen wurde etwas gefunden. ⚓', 'Pass auf dich auf, Abenteurer. Wissen ist Macht – aber Neugier ist der Schlüssel zu neuen Welten!']);
  mk('rurik', X(-33), Z(2), { shirt: 0x2a4a8a, pants: 0x4a3a2a, hair: 0x6b4423, skin: 0xd8a070, style: 'short', beard: 5, beardc: 0x6b4423, hat: 'helmet', glassT: 2, scale: 1.06 }, 'Rurik – Händler „Wanderhand“', ['Schön, dich zu sehen, Abenteurer! Was darf es heute sein? Heiltränke, Stärketränke, Reparatursets – alles für deine Reise!', 'Mein kleiner grüner Freund da hilft mir beim Zählen. Er verzählt sich nur ständig. 🧪', 'Gute Ausrüstung, starke Abenteuer – das ist mein Motto!']);
  mk('lyra', X(-26), Z(24), { shirt: 0x1d2a6a, pants: 0x2a2a3a, hair: 0x3fa0ff, skin: 0xf3c9a0, style: 'long', cape: true, glassT: 0, scale: 1 }, 'Lyra – Lichtmagierin', ['Manchmal sind es nicht die stärksten Waffen, die den Kampf entscheiden, sondern das Herz, das nicht aufgibt. ✨', 'Licht ist stark gegen Schatten, aber schwach gegen Natur. Merk dir den Elementkreis!', 'Gemeinsam sind wir stärker. Das ist keine Floskel, das ist die Wahrheit.']);
  mk('rovan', X(44), Z(-8), { shirt: 0x5a3a2a, pants: 0x2a2a2a, hair: 0x222222, skin: 0xd8a070, style: 'short', beard: 5, beardc: 0x222222, ctype: 3, brow: 3, build: 2, scale: 1.08 }, 'Rovan – Schwertkämpfer', ['Stärke ist nicht die Gewalt, sondern die Kraft, für andere da zu sein. Ruhig und beschützend – so kämpfe ich.', 'Feuer schlägt Natur, Natur schlägt Licht, Licht schlägt Schatten, Schatten schlägt Wasser – und Wasser löscht Feuer.', 'Ich stehe immer an deiner Seite, Zotik.']);
  mk('nia', X(9), Z(-30), { shirt: 0x2f6a4a, pants: 0x3a2a1a, hair: 0x4a3322, skin: 0xe0a979, style: 'ponytail', glassT: 3, hat: 'none', cape: true, scale: .98 }, 'Nia – Bogenjägerin', ['Das Leben ist zu kurz, um nur einen Weg zu gehen! 🏹', 'Von hier oben auf den Stufen sieht man ganz Lunaris – und die schwebenden Inseln. Keine Sorge, die fallen nicht runter.', 'Frech sein, klug sein, frei sein – und immer das Ziel treffen.']);
  mk('prof', X(10), Z(82), { shirt: 0xe8e2d8, pants: 0x4a3a2a, hair: 0xeeeeee, skin: 0xf3c9a0, style: 'wavy', beard: 3, beardc: 0xeeeeee, glassT: 3, ctype: 4, hsc: .98, scale: 1 }, 'Professorium – Erfinder', ['Das ist die Nautilux! Sie taucht, sie fliegt, sie entdeckt überall hin. Steig ein – aber lande, bevor du aussteigst! ⚙️', 'Ich weiß mehr, als ich zeige. Zum Beispiel: Die Splitter in den Gassen sind Reste der zerbrochenen Welten.', 'Wissen ist Macht – aber Neugier ist der Schlüssel zu neuen Welten!']);
  /* Zotik-Statue in Originalfarben (Fuchs-Mensch: orange Fell, grüner Schal, Lederriemen) */
  const statue = BI.makeChar(Object.assign({}, BI.heroById('zotik').o, { scale: 1 })); statue.group.scale.setScalar(6); statue.group.position.set(A.statue.x, A.statue.top, A.statue.z); statue.group.rotation.y = Math.atan2(X(-4) - A.statue.x, Z(48) - A.statue.z); statue.pose && statue.pose(0, 0, false); grp.add(statue.group);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(5.2, .12, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false })); halo.rotation.x = Math.PI / 2; halo.position.set(A.statue.x, A.statue.top + 1, A.statue.z); grp.add(halo);
  sign('🦊 Zotik – der Weltenhörer', A.statue.x, A.statue.top + 17.4, A.statue.z, 13);
  /* Moosling „Felli“ (Waldgeist): hüpft herum, geht als Partner mit */
  const felli = BI.makeMoosling(); felli.root.scale.setScalar(1.15); felli.root.position.set(X(-8), 0, Z(7)); grp.add(felli.root); sign('Felli – Moosling', X(-8), 2.6, Z(7), 3.6);
  /* ===== Quest: Der Ruf des Kristalls ===== */
  const QS = ['Sprich mit Mira in der Taverne.', 'Finde den Hinweis im Hafen.', 'Untersuche den Riss an der Akademie.', 'Berichte Mira vom Kampf.', 'Geschafft – die Weltentore sind offen!'];
  const hintM = new THREE.Mesh(new THREE.OctahedronGeometry(.5, 0), new THREE.MeshBasicMaterial({ color: 0xffd23f, fog: false })); hintM.position.set(A.hint.x, 1.6, A.hint.z); grp.add(hintM);
  const rissPos = { x: X(40), z: Z(36) }, riss = new THREE.Mesh(new THREE.TorusGeometry(2.4, .22, 8, 24), new THREE.MeshBasicMaterial({ color: 0xb48aff, fog: false })); riss.position.set(rissPos.x, 3.4, rissPos.z); riss.rotation.y = .6; grp.add(riss); const rissIn = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), new THREE.MeshBasicMaterial({ color: 0x4a2ad8, transparent: true, opacity: .5, side: THREE.DoubleSide, fog: false })); rissIn.position.copy(riss.position); rissIn.rotation.y = .6; grp.add(rissIn); sign('⚡ Der Riss', rissPos.x, 7, rissPos.z, 4.4);
  function talk(n) {
    const s = S(), q = s.q; let line = n.lines[n.i++ % n.lines.length];
    if (n.id === 'mira') { if (q === 0) { s.q = 1; persist(); G.addStars(1); line = 'Schön, dass du da bist! Seit ein paar Tagen flackert über der Akademie ein Riss in der Luft. Im Hafen wurde etwas gefunden – schau dir den Hinweis dort an! ⚓  (+1 ⭐)'; } else if (q === 3) { s.q = 4; persist(); setTimeout(() => bonus(10, '🏆 Quest „Der Ruf des Kristalls“ geschafft! Die Weltentore sind offen.'), 900); line = 'Du hast es geschafft! Der Riss ist versiegelt – vorerst. Danke, Zotik!'; } }
    say('💬 ' + n.name.split(' – ')[0] + ': „' + line + '“', 7000); n.c.pose && n.c.pose(0, 0, true);
  }
  K.near = function () {
    if (P.veh || P.y > 12) return null; const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
    const q = W.spots.zotikPortal; if (nr(q.x, q.z, 6.4)) return { k: 'zin' }; if (!K.inside) return null; if (nr(A.back.x, A.back.z, 6)) return { k: 'zout' };
    for (const n of NPC) if (nr(n.x, n.z, 3)) return { k: 'zspeak', id: n.id, label: ['💬', 'Mit ' + n.name.split(' – ')[0] + ' sprechen'] };
    if (nr(A.statue.x, A.statue.z, 9.5)) return { k: 'zstatue', label: ['📸', 'Zotik-Statue bewundern'] };
    if (nr(felli.root.position.x, felli.root.position.z, 2.6)) return { k: 'zfelli', label: ['🌱', 'Felli streicheln'] };
    if (nr(A.hint.x, A.hint.z, 3)) return { k: 'zhint', label: ['📜', 'Hinweis untersuchen'] };
    if (nr(rissPos.x, rissPos.z, 4.4)) return { k: 'zriss', label: ['⚡', 'Den Riss untersuchen'] };
    for (const g of A.gates) if (nr(g.x, g.z, 3.2)) return { k: 'zgate', i: g.i, label: ['🌀', 'Durch das Tor: ' + gateNames[g.i].replace(/^\S+\s/, '')] };
    if (nr(X(0), Z(0), 7.4) ) return { k: 'zcrystal', label: ['💎', 'Mondkristall berühren'] };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'zin') K.enter(); else if (n.k === 'zout') K.leave();
    else if (n.k === 'zspeak') talk(NPC.find(q => q.id === n.id));
    else if (n.k === 'zfelli') { felli.set('happy', 0); fx.burst(felli.root.position.x, 1.4, felli.root.position.z, 12, [[.6, 1, .4], [1, 1, .6]], 3, 1, 28, -1); say('🌱 Felli kichert und kuschelt sich an dich!', 2400); G.takeMascot('moosling'); }
    else if (n.k === 'zhint') { if (s.q === 1) { s.q = 2; persist(); G.addStars(1); say('📜 Hinweis gefunden: „Der Riss öffnet sich über der Akademie. Nur wer die Elemente kennt, kann ihn schließen.“ +1 ⭐', 7000); snd('star'); } else say('📜 Alte Notiz: „Der Riss öffnet sich über der Akademie …“', 3600); }
    else if (n.k === 'zriss') { if (s.q < 2) say('⚡ Ein flackernder Riss in der Luft … Vielleicht hat Mira mehr Hinweise? (Quest-Log: 📋)', 4200); else { say('⚡ Aus dem Riss springt ein Wesen hervor – Elementar-Kampf!', 2600); G.start('elementar_zotik'); } }
    else if (n.k === 'zgate') { if (s.q < 4) { say('🌀 Das Tor schläft noch … Hilf zuerst Mira mit dem Riss (📋 Quest-Log).', 4200); return; } const g = A.gates[n.i]; if (!s.gates) { s.gates = 1; persist(); G.addStars(2); say('🌀 Das erste Weltentor! +2 ⭐', 2200); } G.go(gateDest[n.i]); }
    else if (n.k === 'zstatue') { fx.burst(A.statue.x, A.statue.top + 4, A.statue.z, 26, [[1, .85, .4], [1, 1, 1], [.5, .8, 1]], 5, 1.4, 28, -1); [523, 659, 784, 1047].forEach((f, i) => note(f, 1.2, 'sine', .1, i * .1)); if (!s.statue) { s.statue = 1; persist(); G.addStars(1); say('🦊 Zotik, der Weltenhörer – der Held von Lunaris! +1 ⭐', 4200); } else say('🦊 Zotik, der Weltenhörer – der Held von Lunaris!', 3000); }
    else if (n.k === 'zcrystal') { fx.burst(X(0), 6, Z(0), 24, [[.5, .8, 1], [1, 1, 1], [.8, .6, 1]], 4, 1.3, 28, -1); [523, 659, 784].forEach((f, i) => note(f, 1.4, 'sine', .1, i * .12)); say('💎 Der Mondkristall summt – „Zehn Welten, ein Abenteuer.“', 3200); }
  };
  /* ===== Ein- und Ausgang ===== */
  K.enter = function () { G.fade(() => { P.x = X(0); P.z = Z(40); P.y = 0; P.vy = 0; P.h = Math.PI; G.cam.yaw = 0; const s = S(); if (!s.visit) { s.visit = 1; persist(); setTimeout(() => bonus(2, '⭐ Willkommen in Lunaris!'), 900); } else say('⭐ Willkommen zurück in Lunaris!', 2400); }); };
  K.leave = function () { G.fade(() => { const q = W.spots.zotikPortal; P.x = q.x; P.z = q.z + 5.6; P.y = 0; P.vy = 0; P.h = 0; G.cam.yaw = Math.PI; say('☀️ Zurück auf der Bunten Insel', 2000); }); };
  /* ===== Splitter (Zotik-Währung): einsammeln, 10 = 1 ⭐ ===== */
  const SP = []; { const rr = BI.rng(909); for (let i = 0; SP.length < 64 && i < 900; i++) { const a = rr() * TAU, d = 8 + rr() * (A.R - 14), x = A.x + Math.sin(a) * d, z = A.z + Math.cos(a) * d; if (!W.free(x, z, .9)) continue; SP.push({ x, z, y: Math.min(A.hill.tiers, K.floor(x, z)) + 1.0, v: SP.length % 8 === 7 ? 5 : 1 }); } }
  K.shards = SP; const shardM = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.42, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), SP.length), dm = new THREE.Object3D(), col = new THREE.Color(); shardM.frustumCulled = false; SP.forEach((q, i) => shardM.setColorAt(i, col.setHex(q.v > 1 ? 0xffd23f : [0x7fb8ff, 0xb48aff][i % 2]))); grp.add(shardM);
  /* ===== Frame ===== */
  let was = false, shardT = 0, felT = 0;
  K.update = function (dt, t) {
    const ins = Math.hypot(P.x - A.x, P.z - A.z) < 420; K.inside = ins; if (ins !== was) { was = ins; G.mood(ins); }
    const near = Math.hypot(P.x - A.x, P.z - A.z) < 900; if (grp.visible !== near) grp.visible = near;
    if (K.portalSign) K.portalSign.visible = Math.hypot(P.x - W.spots.zotikPortal.x, P.z - W.spots.zotikPortal.z) < 40;
    if (!ins) return; const s = S();
    halo.rotation.z = t * .5; halo.position.y = A.statue.top + 1 + Math.sin(t * 1.4) * .15;     crystal.rotation.y = t * .7; crystal.position.y = 5.6 + Math.sin(t * 1.5) * .3; beam.material.opacity = .28 + .08 * Math.sin(t * 2.2); hintM.rotation.y = t * 1.6; hintM.position.y = 1.6 + Math.sin(t * 2) * .15; riss.rotation.z = t * .8; rissIn.material.opacity = .42 + .15 * Math.sin(t * 4);
    for (const f of floats) f.m.position.y = f.y + Math.sin(t * f.sp + f.ph) * 3; gateGlow.forEach((m, i) => { m.material.opacity = (s.q >= 4 ? .6 : .22) + .12 * Math.sin(t * 2.4 + i); });
    for (const n of NPC) { if (Math.hypot(P.x - n.x, P.z - n.z) < 9) n.c.group.rotation.y += BI.angDiff(n.c.group.rotation.y, Math.atan2(P.x - n.x, P.z - n.z)) * Math.min(1, dt * 4); n.c.pose && n.c.pose(t * 1.3 + n.x, 0, Math.hypot(P.x - n.x, P.z - n.z) < 5); }
    felli.set('idle', t); { const px = felli.root.position.x, pz = felli.root.position.z; felli.root.rotation.y += BI.angDiff(felli.root.rotation.y, Math.atan2(P.x - px, P.z - pz)) * Math.min(1, dt * 3); }
    const pm = P.veh && P.veh.type === 'nautilux'; if (pm && !s.ship) { s.ship = 1; persist(); setTimeout(() => bonus(2, '🚢 Erster Flug mit der Nautilux!'), 600); }
    SP.forEach((q, i) => { if (s.shards.includes(i)) { dm.position.set(0, -80, 0); dm.scale.setScalar(.001); } else { dm.position.set(q.x, q.y + Math.sin(t * 2 + i) * .18, q.z); dm.scale.setScalar(q.v > 1 ? 1.5 : 1); dm.rotation.set(0, t * 1.2 + i, Math.sin(t + i) * .3); } dm.updateMatrix(); shardM.setMatrixAt(i, dm.matrix); }); shardM.instanceMatrix.needsUpdate = true;
    shardT -= dt; if (shardT <= 0) { shardT = .08; for (let i = 0; i < SP.length; i++) { const q = SP[i]; if (s.shards.includes(i)) continue; if (Math.abs(P.x - q.x) < 1.4 && Math.abs(P.z - q.z) < 1.4 && Math.abs(P.y + .8 - q.y) < 2.2) { s.shards.push(i); s.pts += q.v; note(988, .25, 'triangle', .09, 0); fx.burst(q.x, q.y, q.z, 8, [[.5, .7, 1], [.8, .6, 1]], 2.4, .6, 24, 3); const due = Math.floor(s.pts / 10) - s.paid; if (due > 0) { s.paid += due; G.addStars(due); say('💠 → ⭐ Splitter werden zu Sternen: +' + due + ' ⭐ (' + s.pts + ' Splitter)', 3000); } else say('💠 Splitter ' + s.pts + ' (alle 10 = 1 ⭐)', 1100); persist(); } } }
    if (s.q === 2 && s.fought) { s.q = 3; persist(); say('⚔️ Der Riss ist geschlossen! Berichte Mira vom Kampf.', 4200); }
    if (Math.random() < dt * 5 && Math.hypot(P.x - X(0), P.z - Z(0)) < 50) fx.emit(X(0) + (Math.random() - .5) * 3, 5 + Math.random() * 3, Z(0) + (Math.random() - .5) * 3, 0, 1.2, 0, 1.4, 34, .6, .8, 1, -.5, .8);
  };
  K.log = () => { const s = S(), q = s.q; return { title: '⭐ Zotik – Lunaris', count: (Math.min(4, q) + (s.visit ? 1 : 0) + (s.ship ? 1 : 0) + (s.gates ? 1 : 0) + Math.min(3, Math.floor(s.pts / 20)) + (s.fought ? 1 : 0) + (s.statue ? 1 : 0)) + ' von 12', rows: [
    { ok: !!s.visit, icon: '🌀', text: 'Lunaris betreten (Rissportal auf der Bunten Insel)', dest: 'zotik' },
    { ok: q >= 1, icon: '💬', text: 'Quest „Der Ruf des Kristalls“: ' + QS[0], dest: 'zotik' },
    { ok: q >= 2, icon: '📜', text: QS[1], dest: 'zotik' }, { ok: q >= 3, icon: '⚡', text: QS[2] + ' (Elementar-Kampf)', dest: 'zotik' }, { ok: q >= 4, icon: '🏆', text: QS[3], dest: 'zotik' },
    { ok: !!s.ship, icon: '🚢', text: 'Mit dem Luftschiff Nautilux fliegen', dest: 'zotik' },
    { ok: !!s.statue, icon: '🦊', text: 'Die große Zotik-Statue bewundern', dest: 'zotik' },
    { ok: !!s.gates, icon: '🌀', text: 'Durch ein Weltentor reisen', dest: 'zotik' },
    { ok: s.pts >= 60, icon: '💠', text: 'Splitter sammeln: ' + s.pts + ' (alle 10 = 1 ⭐)', dest: 'zotik' }] }; };
  return K;
};

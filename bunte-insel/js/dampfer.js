'use strict';
/* Bunte Insel – Dampfer-Hafen (Erweiterung): Stummfilm-Welt im Nordwesten, über eine lange Brücke erreichbar.
   Optik wie ein Zeichentrickfilm der 1920er: alles in Schwarz-Weiß-Grau, Gummischlauch-Arme, Schachbrett-Boden, Filmstreifen.
   Die Hauptfigur „Dampfer-Willi“ (Hafenmaus) lehnt sich an den Look von 1928 an, der seit 2024 gemeinfrei ist: schwarzer Körper, weißes Gesicht,
   runde Ohren, kreisrunde Augen, dünne Gummi-Glieder – bewusst OHNE Handschuhe, ohne Farben, ohne Logo und ohne Namen/Figuren späterer Filme;
   alles andere ist frei erfunden (eigene Namen, eigene Geschichten, eigene Musik). Keine Verbindung zu irgendeiner Firma.
   Spielidee: Die Welt ist schwarz-weiß – bring die FARBE zurück (6 Farbeimer), spiel das Dampfer-Orchester (6 Instrumente), finde 8 Noten,
   zieh die Dampfpfeife, schau einen Stummfilm im Freiluftkino, spiel mit Willi und stapel Kisten am Kran (Mini-Spiel). */
BI.DAMPF = { x: -262, z: -150, R: 48, bridge: { x0: -218, x1: -92, z0: -154.5, z1: -145.5 } };
BI.DAMPF_COL = [0xff4d4d, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0xa66bff];
BI.DAMPF_INST = [['xylo', '🎹', 'Flaschen-Xylophon'], ['wasch', '🧺', 'Waschbrett'], ['trommel', '🥁', 'Blechtrommel'], ['ente', '🦆', 'Quietsch-Ente'], ['tuba', '🎺', 'Tuba'], ['pfeife', '📯', 'Dampfpfeife']];
BI.DAMPF_NOTES = [[-30, -14], [-14, -33], [18, -30], [34, 12], [22, 30], [-8, 38], [-34, 24], [4, 14]];

/* ---------- Boden, Brücke, Tor, Plaza, Dampfer, Kino, Pavillon, Kran (statisch) ---------- */
BI.buildDampfGround = function (c) {
  const { W, st, lamp, ROADY } = c, P = BI.DAMPF, TAU = Math.PI * 2, BK = 0x1e1e22, WH = 0xf4f4f4, G1 = 0xdadada, G2 = 0xb5b5b5, G3 = 0x8a8a8a, WD = 0x7d7d7d;
  const X = u => P.x + u, Z = v => P.z + v; W.dampf = P; W.spots.dampf = { x: X(34), z: Z(0) };
  st.disc(P.x, P.z, P.R + 9, 0, G1, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, WH, 56);
  /* Brücke (entlang x) */
  { const b = P.bridge, L = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, G3); for (let x = b.x0 + 1; x < b.x1; x += 2) st.rect(x, b.z0, x + .08, b.z1, ROADY + .01, 0x5e5e5e);
    for (let x = b.x0 + 2, i = 0; x < b.x1; x += 4, i++) st.rect(x, P.z - .12, x + 2, P.z + .12, ROADY + .015, i % 2 ? BK : WH);
    for (const sd of [-1, 1]) { const z = P.z + sd * 4.6; st.box(cx, 0, z, L, 1.15, .25, 0x6a6a6a); st.box(cx, 1.15, z, L, .1, .35, 0xcfcfcf); W.addBox(b.x0 + 2, z - .15, b.x1, z + .15, false, 1.3); }
    for (let x = b.x0 + 4; x < b.x1; x += 10) for (const sd of [-1, 1]) st.cyl(x, -1.6, P.z + sd * 3.8, .45, .5, 1.62, 0x4a4a4a, 8); }
  /* Eingangstor: Filmstreifen-Pfosten und Kino-Leuchtschild */
  { const gx = X(38); for (const sd of [-1, 1]) { for (let k = 0; k < 8; k++) st.box(gx, k * .8, Z(sd * 6), .9, .8, .9, k % 2 ? WH : BK); }
    st.box(gx, 6.4, P.z, .9, 1.4, 14, BK); for (let k = 0; k < 14; k++) lamp.sph(gx - .5, 7.1, Z(-6.5 + k), .22, 0xfff6c8, 1); W.addBox(gx - .6, Z(-6.6), gx + .6, Z(-5.4), false, 7); W.addBox(gx - .6, Z(5.4), gx + .6, Z(6.6), false, 7); W.spots.dampfGate = { x: gx, y: 8.8, z: P.z }; }
  /* Schachbrett-Plaza und -Promenade (wie ein Filmset) */
  for (let i = -6; i < 6; i++) for (let j = -6; j < 6; j++) { const cx = i * 2 + 1, cz = j * 2 + 1; if (Math.hypot(cx, cz) < 12.2) st.rect(X(i * 2), Z(j * 2), X(i * 2 + 2), Z(j * 2 + 2), ROADY + .01, (i + j) & 1 ? BK : WH); }
  for (let i = 6; i < 20; i++) for (let j = -1; j < 1; j++) st.rect(X(i * 2), Z(j * 2), X(i * 2 + 2), Z(j * 2 + 2), ROADY + .01, (i + j) & 1 ? BK : WH);
  /* Statuen-Sockel in der Mitte (die Statue selbst entsteht zur Laufzeit) */
  st.cyl(X(0), 0, Z(0), 2.9, 3.2, .8, G3, 20); st.cyl(X(0), .8, Z(0), 2.4, 2.6, .7, G2, 20); st.cyl(X(0), 1.5, Z(0), 2.2, 2.2, .18, WH, 20); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; st.box(X(Math.sin(a) * 3.05), .15, Z(Math.cos(a) * 3.05), .5, .45, .18, k % 2 ? BK : WH, a); }
  W.addCircle(X(0), Z(0), 3.2, false, 3); W.spots.dampfStatue = { x: X(0), y: 1.68, z: Z(0) };
  /* Dampfer am Kai (Bug nach Norden): Rumpf, Aufbauten, zwei Schornsteine, Reling, Steuerhaus */
  { const bx = X(-39), L = 20;
    st.box(bx, 0, P.z, 8, 2.4, L, BK); st.box(bx, 0, Z(-L / 2 - 1.1), 5.4, 2.4, 5.4, BK, Math.PI / 4); st.box(bx, 2.4, P.z, 8.4, .35, L + .4, G2); for (const sd of [-1, 1]) for (let k = -4; k <= 4; k++) st.box(bx + sd * 3.9, 2.75, Z(k * 2), .12, 1.1, .12, WH);
    for (const sd of [-1, 1]) st.box(bx + sd * 3.9, 3.55, P.z, .14, .1, L, WH); st.box(bx, 2.75, P.z, 6.6, 2.2, 8, WH); st.box(bx, 4.95, Z(-1), 6.9, .3, 8.4, G3);
    st.box(bx, 5.25, Z(-5), 3.6, 2.2, 3.6, WH); st.box(bx, 7.45, Z(-5), 4, .3, 4, BK); for (const sd of [-1, 1]) st.sph(bx + sd * 1.2, 6.45, Z(-6.8), .32, BK, 1);
    for (const k of [-1, 1]) { st.cyl(bx, 5.25, Z(2 + k * 2.2), 1.1, 1.3, 3.6, BK, 12); st.cyl(bx, 8.35, Z(2 + k * 2.2), 1.15, 1.15, .7, WH, 12); st.cyl(bx, 8.9, Z(2 + k * 2.2), 1.2, 1.2, 1.1, BK, 12); }
    st.box(bx, 2.75, Z(L / 2 - 1), 6, 3, 1.4, G3); W.addBox(bx - 4.2, Z(-L / 2 - 2), bx + 4.2, Z(L / 2), false, 9);
    W.spots.dampfBoat = { x: bx + 5.4, z: Z(-5) }; W.spots.dampfStack = { x: bx, y: 10.4, z: Z(2) }; W.spots.dampfWheel = { x: bx, z: Z(L / 2 + 1.5) }; }
  /* Kai-Planken zwischen Plaza und Dampfer */
  for (let i = 0; i < 12; i++) for (let j = -1; j < 1; j++) st.rect(X(-32 + i * 1.6), Z(j * 3), X(-32 + i * 1.6 + 1.5), Z(j * 3 + 3), ROADY + .01, (i + j) & 1 ? WD : 0x909090);
  /* Freiluftkino im Norden: Leinwand-Rahmen, Bänke, Kassenhäuschen */
  { const sx = X(10), sz = Z(-37); st.box(sx, 0, sz, .6, 6, .6, BK); st.box(sx + 11, 0, sz, .6, 6, .6, BK); st.box(sx + 5.5, 6, sz, 12, .6, .7, BK); st.box(sx + 5.5, .5, sz + .1, 11.2, .6, .5, G3); W.addBox(sx - .3, sz - .4, sx + 11.3, sz + .8, false, 7); W.spots.dampfScreen = { x: sx + 5.5, y: 3.4, z: sz + .55 };
    for (let r = 0; r < 3; r++) for (const u of [0, 1]) { const bx = sx + 2 + u * 5.2, bz = Z(-31 + r * 1.8); st.box(bx, .4, bz, 3.6, .14, .7, 0x6a6a6a); st.box(bx, .55, bz + .35, 3.6, .6, .12, 0x6a6a6a); for (const sd of [-1, 1]) st.box(bx + sd * 1.6, 0, bz, .12, .4, .5, BK); }
    const kx = X(-4), kz = Z(-27); st.box(kx, 0, kz, 3.2, 3, 2.4, WH); st.box(kx, 3, kz, 3.8, .35, 3, BK); for (let k = 0; k < 6; k++) st.box(kx - 1.5 + k * .6, 3.35, kz - 1.4, .6, .5, .12, k % 2 ? WH : BK); st.box(kx, 1.2, kz - 1.3, 2, .9, .1, G3); W.addBox(kx - 1.8, kz - 1.4, kx + 1.8, kz + 1.4, false, 4); W.spots.dampfKasse = { x: kx, z: kz - 3 }; }
  /* Musik-Pavillon im Süden: Bühne, Säulen, Zeltdach (die Instrumente stehen davor) */
  { const px = X(6), pz = Z(33); st.cyl(px, 0, pz, 7.4, 7.6, .5, G3, 18); st.cyl(px, .5, pz, 7, 7, .1, WH, 18); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; st.cyl(px + Math.sin(a) * 6.5, .5, pz + Math.cos(a) * 6.5, .16, .16, 4.6, k % 2 ? BK : WH, 6); }
    st.cone(px, 5.1, pz, 8, 2.8, BK, 8); st.sph(px, 8.2, pz, .35, WH, 1); W.spots.dampfPav = { x: px, z: pz }; }
  /* Kran + Kisten am Kai (Highlight-Spiel „Hafen-Kran“ steht davor) */
  { const kx = X(-24), kz = Z(27); st.box(kx, 0, kz, 3, 1, 3, BK); st.box(kx, 1, kz, .8, 8, .8, G3); st.box(kx + 3.2, 8.4, kz, 8, .6, .6, BK, 0, 0, .08); st.box(kx + 7, 5.5, kz, .08, 2.8, .08, 0x555555); st.box(kx + 7, 4.9, kz, 1.6, 1.1, 1.6, 0x9a9a9a); W.addCircle(kx, kz, 1.9, false, 9);
    for (const [u, v, h] of [[-18, 32, 2], [-20.5, 33, 1], [-15.5, 33.5, 1], [-18, 36, 1]]) for (let k = 0; k < h; k++) { st.box(X(u), k * 1.1, Z(v), 2, 1.1, 2, k ? 0xa8a8a8 : 0x9a9a9a, k * .3); st.box(X(u), k * 1.1 + .4, Z(v), 2.04, .2, 2.04, 0x6a6a6a, k * .3); } for (const [u, v] of [[-18, 32], [-20.5, 33], [-15.5, 33.5], [-18, 36]]) W.addCircle(X(u), Z(v), 1.3, false, 2.5); }
  /* Laternen (warmes Glühbirnen-Licht), graue Büsche */
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .3, x = X(Math.sin(a) * 15.5), z = Z(Math.cos(a) * 15.5); st.cyl(x, 0, z, .08, .1, 4.2, 0x444444, 6); lamp.sph(x, 4.4, z, .34, 0xfff2c0, 1); }
  const rn = BI.rng(77); for (let i = 0; i < 18; i++) { const a = rn() * TAU, d = 38 + rn() * 5, u = Math.sin(a) * d, v = Math.cos(a) * d; if (u > 28 && Math.abs(v) < 8) continue; st.cyl(X(u), 0, Z(v), .2, .3, 1.6, 0x555555, 6); st.sph(X(u), 2.7, Z(v), 1.4, i % 2 ? 0x9a9a9a : 0xc4c4c4, 1); W.addCircle(X(u), Z(v), .5, false, 3); }
};

/* ---------- Gummischlauch-Maus „Dampfer-Willi“: kleines Skelett aus Teilen (Kopf, Arme, Beine, Schwanz) ---------- */
BI.makeWilli = function (o) {
  o = o || {}; const BK = o.dark || 0x1c1c20, WH = o.light || 0xf6f6f6, mat = BI.mat(), root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const mesh = (fn, parent, x, y, z) => { const b = new BI.Batch(); fn(b); const m = b.mesh(mat), g = new THREE.Group(); g.add(m); g.position.set(x, y, z); (parent || inner).add(g); return g; };
  mesh(b => { b.sph(0, 0, 0, .3, BK, 1, 1, 1.2, .9); b.sph(0, -.04, .2, .2, WH, 1, .9, 1.1, .5); b.sph(0, -.3, 0, .27, BK, 1, 1, .8, .9); b.sph(-.09, -.24, .26, .035, WH, 1); b.sph(.09, -.24, .26, .035, WH, 1); }, inner, 0, .8, 0);
  const head = mesh(b => { b.sph(0, 0, 0, .27, BK, 1); b.sph(-.27, .27, 0, .17, BK, 1, 1, 1, .35); b.sph(.27, .27, 0, .17, BK, 1, 1, 1, .35); b.sph(0, -.05, .17, .17, WH, 1, 1, .85, .8); b.sph(0, -.02, .33, .06, BK, 1); b.sph(-.085, .07, .22, .075, WH, 1, .75, 1.2, .5); b.sph(.085, .07, .22, .075, WH, 1, .75, 1.2, .5); b.sph(-.085, .06, .275, .033, BK, 1); b.sph(.085, .06, .275, .033, BK, 1); b.box(0, -.13, .3, .15, .02, .02, BK); }, inner, 0, 1.28, 0);
  const arm = sd => { const sh = mesh(b => { b.cyl(0, -.34, 0, .04, .04, .34, BK, 6); b.sph(0, 0, 0, .06, BK, 1); }, inner, sd * .32, 1.02, 0), el = mesh(b => { b.cyl(0, -.3, 0, .035, .035, .3, BK, 6); b.sph(0, -.34, 0, .075, BK, 1); }, sh, 0, -.34, 0); return { sh, el }; };
  const leg = sd => { const hip = mesh(b => { b.cyl(0, -.34, 0, .045, .045, .34, BK, 6); }, inner, sd * .14, .5, 0); mesh(b => { b.sph(0, 0, .07, .12, BK, 1, 1, .5, 1.5); b.sph(0, .02, .17, .06, WH, 1, 1, .6, 1); }, hip, 0, -.36, 0); return hip; };
  const aL = arm(-1), aR = arm(1), lL = leg(-1), lR = leg(1), tail = mesh(b => { b.cyl(0, -.3, 0, .025, .03, .3, BK, 5, 1.2, 0, 0); b.cyl(0, -.5, .26, .02, .025, .22, BK, 5, 1.6, 0, 0); }, inner, 0, .58, -.2);
  const W = { root, inner, head, aL, aR, lL, lR, tail, pose: 'idle', st: 0 };
  /* Posen: idle, dance (Charleston), whistle, wave, stretch (Gummi-Arme) */
  W.set = function (name, t, k) {
    const s = Math.sin; inner.position.y = 0; inner.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); for (const a of [aL, aR]) { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); a.sh.scale.set(1, 1, 1); } lL.rotation.set(0, 0, 0); lR.rotation.set(0, 0, 0);
    if (name === 'idle') { inner.position.y = .03 * Math.abs(s(t * 2)); head.rotation.z = s(t * 1.3) * .08; aL.sh.rotation.z = .12 + s(t * 1.7) * .05; aR.sh.rotation.z = -.12 - s(t * 1.9) * .05; tail.rotation.y = s(t * 3) * .4; }
    else if (name === 'dance') { inner.position.y = Math.abs(s(t * 8)) * .12; inner.rotation.z = s(t * 4) * .1; lL.rotation.x = s(t * 8) * .7; lR.rotation.x = -s(t * 8) * .7; lL.rotation.z = -.25 * s(t * 8); lR.rotation.z = .25 * s(t * 8); aL.sh.rotation.z = .9 + .6 * s(t * 8); aR.sh.rotation.z = -.9 - .6 * s(t * 8); aL.el.rotation.z = .5 * s(t * 16); aR.el.rotation.z = -.5 * s(t * 16); head.rotation.z = s(t * 4) * .2; tail.rotation.y = s(t * 8) * .8; }
    else if (name === 'whistle') { aR.sh.rotation.z = -2.7; aR.el.rotation.z = -.4 + s(t * 6) * .15; aL.sh.rotation.z = .5; aL.el.rotation.z = .9; head.rotation.x = -.25; inner.position.y = .02 * Math.abs(s(t * 6)); tail.rotation.y = s(t * 5) * .5; }
    else if (name === 'wave') { aR.sh.rotation.z = -2.4; aR.el.rotation.z = s(t * 10) * .6; aL.sh.rotation.z = .15; head.rotation.z = s(t * 3) * .12; inner.position.y = .02 * Math.abs(s(t * 3)); }
    else if (name === 'stretch') { const e = k == null ? 0 : k, st = e < .4 ? e / .4 * 2.6 : Math.max(0, 2.6 * Math.exp(-(e - .4) * 6) * Math.cos((e - .4) * 22)); aL.sh.scale.y = 1 + st; aR.sh.scale.y = 1 + st; aL.sh.rotation.z = .5 + .3 * s(t * 8); aR.sh.rotation.z = -.5 - .3 * s(t * 8); head.rotation.z = s(t * 6) * .1; }
  };
  return W;
};

/* ---------- Laufzeit ---------- */
BI.createDampf = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, D = BI.DAMPF, COL = BI.DAMPF_COL, INST = BI.DAMPF_INST, X = u => D.x + u, Z = v => D.z + v, mat = BI.mat(), TAU = Math.PI * 2;
  const S = () => save.dampf || (save.dampf = { col: [0, 0, 0, 0, 0, 0], notes: [], inst: [0, 0, 0, 0, 0, 0], concert: 0, film: 0 });
  const snd = (n, a, b, c) => { try { A[n] && A[n](a, b, c); } catch (e) { } }, note = (f, d, ty, v, del, sl) => { try { A.note && A.note(f, d, ty, v, del, sl); } catch (e) { } }, drum = (k, del) => { try { A.drum && A.drum(k, del); } catch (e) { } };
  const COLS = [[1, .3, .3], [1, .6, .18], [1, .88, .29], [.3, .82, .49], [.25, .63, 1], [.65, .42, 1], [1, 1, 1]];
  /* Schilder */
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#111'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.dampfGate; sign('🎬 Dampfer-Hafen – ein Stummfilm-Abenteuer', g.x - .6, g.y, g.z, 12); sign('📯 Dampfer „Brummel“', W.spots.dampfStack.x, 12.4, W.spots.dampfStack.z, 7); sign('🎞️ Freiluftkino', W.spots.dampfScreen.x, 8.6, W.spots.dampfScreen.z, 6); sign('🎵 Dampfer-Orchester', W.spots.dampfPav.x, 9.6, W.spots.dampfPav.z, 7); sign('🏗️ Hafen-Kran', X(-24), 11.2, Z(27), 5); sign('🐭 Dampfer-Willi, der Hafenmaus', X(0), 7.2, Z(0), 8); }
  /* ===== Statue + lebendiger Willi ===== */
  const statue = BI.makeWilli({ dark: 0x2c2f36, light: 0xe9ecef }), sp = W.spots.dampfStatue; statue.root.scale.setScalar(2.7); statue.root.position.set(sp.x, sp.y, sp.z); statue.root.rotation.y = Math.PI / 2; statue.set('whistle', 0); scene.add(statue.root);
  const willi = BI.makeWilli(), wp = { x: X(5.5), z: Z(5.5) }; willi.root.scale.setScalar(1.55); willi.root.position.set(wp.x, 0, wp.z); willi.root.rotation.y = Math.PI * .75; scene.add(willi.root);
  let wAct = null, wFace = Math.PI * .75, wLabel = null;
  { const cv = document.createElement('canvas'); cv.width = 192; cv.height = 56; const c = cv.getContext('2d'); c.font = 'bold 36px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#111'; c.strokeText('Willi', 96, 30); c.fillStyle = '#fff'; c.fillText('Willi', 96, 30); wLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); wLabel.scale.set(1.5, .44, 1); wLabel.position.set(wp.x, 3.1, wp.z); scene.add(wLabel); }
  /* ===== Dampfer: Schaufelrad + Dampf ===== */
  const wheel = (() => { const b = new BI.Batch(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; b.box(Math.cos(a) * 1.7, Math.sin(a) * 1.7 - .2, 0, 3.4, .3, 1.2, i % 2 ? 0xf4f4f4 : 0x1e1e22, 0, 0, a); } b.cyl(0, -.7, 0, .5, .5, 1.4, 0x555555, 8, Math.PI / 2); const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(W.spots.dampfWheel.x, 1.9, W.spots.dampfWheel.z); g.rotation.y = Math.PI / 2; scene.add(g); return g; })();
  /* ===== Farbeimer: bringen die Farbe zurück ===== */
  const BU = [20, 80, 140, 200, 260, 320].map((deg, i) => { const a = deg / 180 * Math.PI, u = Math.sin(a) * 22, v = Math.cos(a) * 22; return { i, x: X(u), z: Z(v), a }; });
  const bGroups = [], decos = [];
  BU.forEach(q => { const b = new BI.Batch(); b.cyl(0, 0, 0, .55, .45, .8, 0x9a9a9a, 10); b.cyl(0, .8, 0, .5, .5, .06, 0xdddddd, 10); b.cyl(.55, .1, 0, .05, .05, .9, 0x6a6a6a, 5, 0, 0, -.3); const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(q.x, 0, q.z); scene.add(g);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .07, 12), new THREE.MeshLambertMaterial({ color: 0xdddddd })); lid.position.set(0, .84, 0); g.add(lid); bGroups.push({ g, lid }); W.addCircle(q.x, q.z, .7, false, 1);
    /* Farb-Dekoration (erst unsichtbar): Wimpel, Ballons, Blumenbeet in der Farbe des Eimers */
    const d = new BI.Batch(), col = COL[q.i], rn = BI.rng(40 + q.i); for (let k = 0; k < 7; k++) { const aa = k / 7 * TAU, rr = 2.8 + rn(); d.sph(Math.sin(aa) * rr, .25, Math.cos(aa) * rr, .3, col, 1, 1, .7, 1); d.cyl(Math.sin(aa) * rr, .25, Math.cos(aa) * rr, .03, .03, .3, 0x4a8a4a, 5); }
    for (let k = 0; k < 4; k++) { const bx = (rn() - .5) * 3, bz = (rn() - .5) * 3; d.cyl(bx, 0, bz, .015, .015, 3.2 + k * .3, 0xffffff, 3); d.sph(bx, 3.4 + k * .3, bz, .42, COL[(q.i + k) % 6], 1, 1, 1.2, 1); }
    for (let k = 0; k < 6; k++) { const aa = k / 6 * TAU + .3; d.cyl(Math.sin(aa) * 1.6, 3.6, Math.cos(aa) * 1.6, 0, .35, .55, k % 2 ? col : 0xffffff, 3); }
    const dm = d.mesh(mat); dm.position.set(q.x, 0, q.z); dm.scale.setScalar(.001); dm.visible = false; scene.add(dm); decos.push({ m: dm, t: -1 }); });
  /* ===== Instrumente im Pavillon (Aufgabe: alle sechs ausprobieren) ===== */
  const IN = INST.map((it, i) => { const a = (i / 6) * TAU + .5, u = 6 + Math.sin(a) * 4.6, v = 33 + Math.cos(a) * 4.6, b = new BI.Batch();
    if (it[0] === 'xylo') { for (let k = 0; k < 6; k++) b.cyl(-.6 + k * .24, 0, 0, .07, .07, .4 + k * .08, k % 2 ? 0xdddddd : 0x9a9a9a, 6); b.box(0, 0, 0, 1.6, .08, .5, 0x555555); }
    else if (it[0] === 'wasch') { b.box(0, .2, 0, .8, 1.1, .1, 0x777777); for (let k = 0; k < 6; k++) b.box(0, .35 + k * .14, .07, .7, .04, .04, 0xf4f4f4); b.box(0, .15, 0, .9, .1, .4, 0x555555); }
    else if (it[0] === 'trommel') { b.cyl(0, 0, 0, .55, .55, .7, 0xcfcfcf, 14); b.cyl(0, .7, 0, .57, .57, .08, 0x1e1e22, 14); for (let k = 0; k < 8; k++) b.box(Math.sin(k * .785) * .56, .15, Math.cos(k * .785) * .56, .05, .4, .05, 0x1e1e22); }
    else if (it[0] === 'ente') { b.cyl(0, 0, 0, .5, .5, .5, 0x555555, 8); b.sph(0, .95, 0, .4, 0xf4f4f4, 1, 1.1, .9, 1.3); b.sph(0, 1.45, .25, .26, 0xf4f4f4, 1); b.cone(0, 1.42, .6, .12, .3, 0x1e1e22, 4); b.sph(-.1, 1.55, .45, .04, 0x1e1e22, 1); b.sph(.1, 1.55, .45, .04, 0x1e1e22, 1); }
    else if (it[0] === 'tuba') { b.cyl(0, 0, 0, .35, .4, .5, 0x555555, 8); b.cyl(0, .5, 0, .25, .5, 1.1, 0xe8e8e8, 12); b.cone(0, 1.6, 0, .7, .5, 0xf6f6f6, 12); b.cyl(.5, .6, 0, .08, .08, 1, 0xdddddd, 6, 0, 0, 1.2); }
    else { b.cyl(0, 0, 0, .3, .35, .5, 0x555555, 8); b.cyl(0, .5, 0, .13, .13, 1.2, 0xe8e8e8, 8); b.sph(0, 1.8, 0, .22, 0xf6f6f6, 1); b.cone(0, 1.7, 0, .4, .3, 0x1e1e22, 8); b.cyl(.16, 1.0, 0, .02, .02, .5, 0x1e1e22, 4); }
    const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(X(u), .55, Z(v)); g.rotation.y = Math.PI + a; scene.add(g); W.addCircle(X(u), Z(v), .8, false, 2); return { i, g, x: X(u), z: Z(v), k: 0 }; });
  /* ===== Noten sammeln (schweben, werden beim Durchlaufen eingesammelt) ===== */
  const noteTex = (() => { const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96; const c = cv.getContext('2d'); c.font = '72px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🎵', 48, 52); return new THREE.CanvasTexture(cv); })();
  const NT = BI.DAMPF_NOTES.map((q, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, transparent: true, depthWrite: false })); s.scale.set(1.4, 1.4, 1); s.position.set(X(q[0]), 1.6, Z(q[1])); scene.add(s); return { s, x: X(q[0]), z: Z(q[1]), i }; });
  /* ===== Freiluftkino: Stummfilm auf der Leinwand (Canvas-Animation) ===== */
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv), scr = W.spots.dampfScreen;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 5.96), new THREE.MeshBasicMaterial({ map: tex })); screen.position.set(scr.x, scr.y + .1, scr.z + .05); scene.add(screen);
  let film = -1, filmDraw = 0; const FILM = 46;
  const hose = (x0, y0, x1, y1, w, bend) => { cx.lineWidth = w; cx.beginPath(); cx.moveTo(x0, y0); cx.quadraticCurveTo((x0 + x1) / 2 + bend, (y0 + y1) / 2 - bend * .6, x1, y1); cx.stroke(); };
  function drawFilm(t) {
    const g = cx.createLinearGradient(0, 0, 0, 288); g.addColorStop(0, '#e8e8e8'); g.addColorStop(1, '#8e8e8e'); cx.fillStyle = g; cx.fillRect(0, 0, 512, 288);
    if (t < 0) { cx.fillStyle = '#111'; cx.fillRect(0, 0, 512, 288); cx.fillStyle = '#eee'; cx.textAlign = 'center'; cx.font = 'bold 34px Georgia, serif'; cx.fillText('WILLI AM STEUER', 256, 120); cx.font = '22px Georgia, serif'; cx.fillText('ein Stummfilm', 256, 160); cx.fillText('Drück am Kassenhäuschen „Film ansehen“ 🎬', 256, 220); return; }
    const ph = t % 4;
    /* Meer, Dampfer, Willi am Rad */
    cx.fillStyle = '#b8b8b8'; cx.fillRect(0, 200, 512, 88); cx.strokeStyle = '#666'; cx.lineWidth = 3; for (let k = 0; k < 9; k++) { cx.beginPath(); cx.arc(k * 64 + ((t * 30) % 64), 214 + (k % 3) * 18, 20, Math.PI, 0); cx.stroke(); }
    const bob = Math.sin(t * 3) * 4; cx.fillStyle = '#1e1e22'; cx.beginPath(); cx.moveTo(60, 190 + bob); cx.lineTo(450, 190 + bob); cx.lineTo(410, 245 + bob); cx.lineTo(100, 245 + bob); cx.closePath(); cx.fill(); cx.fillStyle = '#f2f2f2'; cx.fillRect(150, 140 + bob, 170, 50); cx.fillStyle = '#1e1e22'; cx.fillRect(335, 90 + bob, 36, 100); cx.fillStyle = '#f2f2f2'; cx.fillRect(335, 100 + bob, 36, 12);
    const whistle = t > 14 && t < 34, puff = (t * 1.3) % 1; if (whistle) { cx.fillStyle = 'rgba(255,255,255,' + (1 - puff) + ')'; for (let k = 0; k < 3; k++) { cx.beginPath(); cx.arc(353 + k * 14 + puff * 40, 80 - puff * 60 - k * 12 + bob, 10 + puff * 22, 0, 6.283); cx.fill(); } }
    const wx = 230, wy = 130 + bob, sw = Math.sin(t * 6); cx.strokeStyle = '#1e1e22'; cx.fillStyle = '#1e1e22'; cx.lineCap = 'round';
    cx.beginPath(); cx.ellipse(wx, wy + 8, 19, 24, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#f6f6f6'; cx.beginPath(); cx.ellipse(wx + 4, wy + 10, 10, 15, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#1e1e22';
    hose(wx - 8, wy + 28, wx - 16 + sw * 6, wy + 62, 5, 8); hose(wx + 8, wy + 28, wx + 18 - sw * 6, wy + 62, 5, -8); cx.beginPath(); cx.ellipse(wx - 20 + sw * 6, wy + 66, 11, 5, 0, 0, 6.283); cx.ellipse(wx + 22 - sw * 6, wy + 66, 11, 5, 0, 0, 6.283); cx.fill();
    const hy = wy - 22; cx.beginPath(); cx.arc(wx, hy, 17, 0, 6.283); cx.fill(); cx.beginPath(); cx.arc(wx - 18, hy - 15, 9, 0, 6.283); cx.arc(wx + 18, hy - 15, 9, 0, 6.283); cx.fill(); cx.fillStyle = '#f6f6f6'; cx.beginPath(); cx.ellipse(wx + 6, hy + 4, 10, 8, 0, 0, 6.283); cx.fill(); cx.beginPath(); cx.arc(wx - 5, hy - 3, 5, 0, 6.283); cx.arc(wx + 6, hy - 3, 5, 0, 6.283); cx.fill(); cx.fillStyle = '#1e1e22'; cx.beginPath(); cx.arc(wx - 4, hy - 3, 2, 0, 6.283); cx.arc(wx + 7, hy - 3, 2, 0, 6.283); cx.arc(wx + 13, hy + 2, 3, 0, 6.283); cx.fill();
    cx.save(); cx.translate(wx + 56, wy + 28); cx.rotate(t * (whistle ? 2 : 1.2)); cx.strokeStyle = '#555'; cx.lineWidth = 5; cx.beginPath(); cx.arc(0, 0, 26, 0, 6.283); cx.stroke(); for (let k = 0; k < 6; k++) { cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(k * 1.047) * 34, Math.sin(k * 1.047) * 34); cx.stroke(); } cx.restore();
    cx.strokeStyle = '#1e1e22'; hose(wx + 14, wy + 4, wx + 50, wy + 22 + sw * 4, 5, 10); hose(wx - 14, wy + 4, wx - 40, whistle ? wy - 40 - sw * 10 : wy + 22, 5, -10); if (whistle) { cx.lineWidth = 2; cx.beginPath(); cx.moveTo(wx - 40, wy - 40 - sw * 10); cx.lineTo(353, 100 + bob); cx.stroke(); }
    /* Zwischentitel */
    const card = t < 5 ? 'Willi, der Hafenmaus-Kapitän' : t < 12 ? 'Heute ist großer Dampfer-Tag!' : t > 16 && t < 22 ? 'Die Pfeife klemmt …' : t > 28 && t < 34 ? 'TUUUUT! Alle jubeln.' : t > 40 ? 'ENDE' : ''; if (card) { cx.fillStyle = 'rgba(10,10,10,.82)'; cx.fillRect(40, 20, 432, 54); cx.fillStyle = '#f0f0f0'; cx.textAlign = 'center'; cx.font = 'bold 24px Georgia, serif'; cx.fillText(card, 256, 55); }
    /* Filmkorn, Vignette, Kratzer */
    cx.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 40; k++) cx.fillRect(Math.random() * 512, Math.random() * 288, 2, 2); if (Math.random() < .12) { cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(Math.random() * 512, 0, 1.5, 288); } const vg = cx.createRadialGradient(256, 144, 90, 256, 144, 300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); cx.fillStyle = vg; cx.fillRect(0, 0, 512, 288);
  }
  drawFilm(-1); tex.needsUpdate = true;
  /* ===== Hunde-ähnliche Spielleiste für Willi ===== */
  BI.injectHudCss(); const host = (document.getElementById('mission') || {}).parentNode || document.body, panel = document.createElement('div'); panel.className = 'pPanel'; panel.hidden = true; panel.innerHTML = '<div class="pT">🐭 Willi – was machen wir?</div><div class="pB"></div>';
  const OPT = [['talk', '🎞️', 'Reden'], ['dance', '💃', 'Tanzen'], ['whistle', '📯', 'Pfeifen'], ['wave', '👋', 'Winken'], ['stretch', '🤹', 'Gummi-Arme']];
  for (const [k, ic, tx] of OPT) { const b = document.createElement('button'); b.innerHTML = '<span>' + ic + '</span>' + tx; b.addEventListener('click', e => { e.stopPropagation(); willChoose(k); }); panel.querySelector('.pB').appendChild(b); }
  { const x = document.createElement('button'); x.className = 'pX'; x.textContent = '✖'; x.addEventListener('click', e => { e.stopPropagation(); panel.hidden = true; }); panel.appendChild(x); } host.appendChild(panel);
  const LINES = ['🎞️ „Pssst … ich spreche nur in Zwischentiteln. Das hier ist einer!“', '🎞️ „Mein Dampfer heißt Brummel. Er ist alt, aber sein Tuut ist jung!“', '🎞️ „Bring die Farbe zurück – dann tanzen sogar die Schornsteine!“', '🎞️ „Früher gab es keinen Ton. Heute pfeife ich einfach selbst.“', '🎞️ „Ein Gummischlauch-Arm ist praktisch: Er reicht bis zur Keksdose!“', '🎞️ „Hast du schon alle sechs Instrumente ausprobiert? Das Orchester wartet!“'];
  let li = 0;
  function willChoose(k) {
    panel.hidden = true; if (k === 'talk') { say(LINES[li++ % LINES.length], 4600); wAct = { n: 'wave', t: 0, d: 1.6 }; return; }
    wAct = { n: k, t: 0, d: k === 'stretch' ? 2.2 : 3 }; if (k === 'whistle') whistle(true); else if (k === 'dance') { for (let i = 0; i < 8; i++) { note([392, 494, 587, 494][i % 4], .12, 'triangle', .09, i * .2); drum(i % 2 ? 's' : 'k', i * .2); } say('🎞️ „Charleston!“', 1800); } else if (k === 'stretch') { snd('whoosh'); say('🎞️ „Gummi-Arme! Boing!“', 1800); } else say('🎞️ „Hallöchen!“', 1500);
    fx.burst(wp.x, 2.2, wp.z, 10, [[1, 1, 1], [.8, .8, .8]], 3, 1, 26, 3);
  }
  function whistle(fromWilli) { note(523, .55, 'square', .06, 0, 466); note(659, .55, 'square', .05, 0, 587); drum('s', 0); drum('s', .1); const s = W.spots.dampfStack; for (let i = 0; i < 4; i++) setTimeout(() => fx.burst(s.x + (i % 2 ? 1.6 : -1.6) * 0, s.y, s.z + (i % 2 ? 2.2 : -2.2), 8, [[1, 1, 1], [.85, .85, .85]], 2, 2.2, 40, -1), i * 180); if (fromWilli) say('📯 Tuuut! Der Dampfer pfeift!', 2000); }
  /* ===== Bewohner (monochrom, original) ===== */
  K.people = function (folk) {
    const mk = (x, z, look, name, lines, h) => { const c = BI.makeChar(look); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    [['Käpt’n Muschel', -29, 6, { shirt: 0xffffff, pants: 0x222222, hair: 0xdddddd, skin: 0xe8e8e8, hat: 'pirate', style: 'short', wrink: 1, scale: 1.05 }, ['Willkommen an Bord! Mein Dampfer „Brummel“ pfeift besser als jeder Chor. 📯', 'Früher war alles grau in grau. Dank dir kommt die Farbe zurück!', 'Zieh am Steuerrad die Dampfpfeife – aber nicht zu laut, sonst fliegen die Möwen weg!']],
      ['Matrosin Mina', -26, -9, { shirt: 0x222222, pants: 0xffffff, hair: 0x222222, skin: 0xe0e0e0, hat: 'cap', style: 'ponytail', scale: .97 }, ['Ich poliere die Reling seit sieben Jahren. Sie glänzt immer noch nicht. ⚓', 'Hast du schon alle Noten gefunden? Sie schweben überall herum!', 'Der Kran am Kai braucht einen guten Kranführer. Probier den Kisten-Turm!']],
      ['Pianist Paulchen', 10, 30, { shirt: 0x111111, pants: 0x111111, hair: 0xeeeeee, skin: 0xeaeaea, hat: 'none', style: 'curly', glassT: 1, scale: .98 }, ['Ich spiele nur auf schwarzen und weißen Tasten. Das reicht für jede Melodie! 🎹', 'Im Pavillon steht ein ganzes Orchester aus Flaschen, Enten und einer Tuba.', 'Spiel alle sechs Instrumente, dann gibt es ein Konzert-Bonbon!']],
      ['Kino-Karl', -2, -29, { shirt: 0xffffff, pants: 0x333333, hair: 0x555555, skin: 0xdddddd, hat: 'cap', style: 'bald', scale: 1 }, ['Willkommen im Freiluftkino! Der Film läuft von allein, wenn du am Kassenhäuschen „Film ansehen“ drückst. 🎬', 'Alle Filme hier haben keinen Ton – aber unser Pianist erfindet dazu die Musik.', 'Popcorn gibt es nicht, aber Fantasie-Popcorn ist ja bekanntlich kalorienfrei!']],
      ['Fritzi', 14, -7, { shirt: 0xffffff, pants: 0x555555, hair: 0x222222, skin: 0xe4e4e4, hat: 'party', style: 'twinbuns', dress: true, scale: .62 }, ['Hihi, ich sehe alles nur in Grau! Aber wenn du die Farbeimer öffnest, wird’s bunt! 🎨', 'Willi kann seine Arme lang machen wie ein Gummiband. Ich auch, ein bisschen.', 'Ich sammle Noten für meine Spieluhr.']],
      ['Hafenarbeiter Hein', -17, 31, { shirt: 0x555555, pants: 0x222222, hair: 0x999999, skin: 0xd8d8d8, hat: 'cap', style: 'short', scale: 1.02 }, ['Kisten schleppen macht stark. Kisten stapeln macht klug. 📦', 'Der Kran dreht sich im Kreis, und ich drehe mich mit. Mir wird nie schwindelig.', 'Wenn der Turm zu schief wird, fällt er um – ganz einfach.']]]
      .forEach(([name, u, v, look, lines]) => mk(X(u), Z(v), look, name, lines, Math.atan2(-u, -v)));
  };
  /* ===== Interaktion ===== */
  const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  K.near = function () {
    if (P.veh || P.y > 1.5) return null; if (Math.hypot(P.x - D.x, P.z - D.z) > D.R + 4) return null;
    if (nr(wp.x, wp.z, 3.2)) return { k: 'wwilli' };
    for (const q of BU) if (nr(q.x, q.z, 2.4)) return { k: 'wbucket', i: q.i };
    for (const q of IN) if (nr(q.x, q.z, 2.5)) return { k: 'winst', i: q.i };
    if (nr(W.spots.dampfWheel.x, W.spots.dampfWheel.z + 1, 3.4) || nr(W.spots.dampfBoat.x, W.spots.dampfBoat.z, 3)) return { k: 'wboat' };
    if (nr(W.spots.dampfKasse.x, W.spots.dampfKasse.z, 2.6)) return { k: 'wkino' };
    if (nr(sp.x, sp.z, 5.2)) return { k: 'wstatue' };
    return null;
  };
  let lastStar = -1e9; const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3200); snd('fanfare'); };
  const burstAt = (x, y, z, n) => fx.burst(x, y, z, n, COLS, 4, 1.4, 28, 3);
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'wwilli') { panel.querySelector('.pT').textContent = '🐭 Willi – was machen wir?'; panel.hidden = !panel.hidden; return; }
    if (n.k === 'wbucket') { const i = n.i; if (s.col[i]) { say('🎨 Diese Farbe ist schon zurück! Schau dich um.', 2000); return; } s.col[i] = 1; const d = decos[i]; d.m.visible = true; d.t = 0; bGroups[i].lid.material.color.setHex(COL[i]); persist(); G.addStars(1); snd('star'); burstAt(BU[i].x, 1.6, BU[i].z, 26);
      const k = s.col.reduce((a, b) => a + b, 0); say('🎨 Farbe ' + k + ' von 6 ist zurück! +1 ⭐', 3000); if (k === 6) { setTimeout(() => { bonus(10, '🎆 Das Farbfest! Der ganze Hafen ist wieder bunt!'); for (let j = 0; j < 5; j++) setTimeout(() => burstAt(D.x + (Math.random() - .5) * 20, 6 + Math.random() * 5, D.z + (Math.random() - .5) * 20, 50), j * 300); }, 1200); } return; }
    if (n.k === 'winst') { playInst(n.i); return; }
    if (n.k === 'wboat') { whistle(false); wAct = wAct || { n: 'whistle', t: 0, d: 1.5, far: true }; say('📯 Tuuut! Der Dampfer „Brummel“ pfeift!', 2200); return; }
    if (n.k === 'wkino') { if (film < 0) { film = 0; filmDraw = 0; say('🎬 Film ab! „Willi am Steuer“ – ein Stummfilm. Setz dich auf eine Bank! 🍿', 4200); } else say('🎬 Der Film läuft schon – schau hin!', 1800); return; }
    if (n.k === 'wstatue') { burstAt(sp.x, 5, sp.z, 18); snd('ding'); say('🐭 Dampfer-Willi, der Hafenmaus – Wahrzeichen des Dampfer-Hafens (im Stil der Stummfilm-Zeit)', 4600); const now = performance.now(); if (now - lastStar > 60000) { lastStar = now; G.addStars(1); say('📸 +1 ⭐ fürs Bestaunen!', 1600); } }
  };
  function playInst(i) {
    const s = S(), it = INST[i], q = IN[i]; q.k = .5; const k = s.inst.filter(Boolean).length; burstAt(q.x, 2, q.z, 8);
    if (it[0] === 'xylo') { q.n = ((q.n || 0) + 1) % 6; note([523, 587, 659, 784, 880, 988][q.n], .5, 'sine', .14, 0); note([523, 587, 659, 784, 880, 988][q.n] * 2, .3, 'sine', .04, .02); }
    else if (it[0] === 'wasch') for (let j = 0; j < 7; j++) drum('h', j * .045);
    else if (it[0] === 'trommel') { drum('k', 0); drum('s', .12); drum('k', .24); drum('s', .36); }
    else if (it[0] === 'ente') { note(900, .12, 'square', .06, 0, 1500); note(1500, .12, 'square', .06, .14, 800); }
    else if (it[0] === 'tuba') { note(98, .6, 'sawtooth', .13, 0); note(147, .4, 'sawtooth', .1, .5); }
    else whistle(false);
    say(it[1] + ' ' + it[2] + '!', 1300); if (!s.inst[i]) { s.inst[i] = 1; persist(); const n2 = s.inst.filter(Boolean).length; if (n2 === 6 && !s.concert) { s.concert = 1; persist(); setTimeout(() => { bonus(5, '🎼 Konzert! Alle sechs Instrumente gespielt!'); for (let j = 0; j < 8; j++) { note([523, 659, 784, 659, 523, 784, 1047, 784][j], .2, 'triangle', .1, j * .18); drum(j % 2 ? 's' : 'k', j * .18); } }, 700); } }
  }
  /* ===== Frame-Update (nur in der Nähe) ===== */
  let tk = 0, steamT = 0; const toggle = (on) => { if (K.on === on) return; K.on = on; for (const o of [willi.root, statue.root, wheel, screen, wLabel]) o.visible = on; for (const q of IN) q.g.visible = on; for (const n of NT) n.s.visible = on && !S().notes.includes(n.i); };
  K.update = function (dt, t) {
    const near = Math.hypot(P.x - D.x, P.z - D.z) < D.R + 40; toggle(near); if (!near) return; const s = S();
    wheel.rotation.z = (wheel.rotation.z || 0) - dt * (film >= 0 || (wAct && wAct.n === 'whistle') ? 3.2 : .9);
    /* Willi: schaut zum Spieler, Pose nach Aktion */
    const dx = P.x - wp.x, dz = P.z - wp.z, d = Math.hypot(dx, dz); if (d < 9) wFace += BI.angDiff(wFace, Math.atan2(dx, dz)) * Math.min(1, dt * 5); willi.root.rotation.y = wFace;
    if (wAct) { wAct.t += dt; willi.set(wAct.n, t, wAct.n === 'stretch' ? wAct.t / wAct.d : 0); if (wAct.t >= wAct.d) wAct = null; } else willi.set('idle', t);
    /* Instrumente wippen */
    for (const q of IN) { q.k = Math.max(0, q.k - dt * 3); const k = Math.sin(q.k * 9) * q.k; q.g.scale.set(1 + k * .12, 1 - k * .1, 1 + k * .12); }
    /* Farb-Dekos poppen auf */
    for (const dco of decos) if (dco.t >= 0 && dco.t < 1) { dco.t = Math.min(1, dco.t + dt * 1.6); const e = dco.t, sc = e < .6 ? e / .6 * 1.15 : 1.15 - (e - .6) / .4 * .15; dco.m.scale.setScalar(Math.max(.001, sc)); } else if (dco.t < 0 && s.col[decos.indexOf(dco)]) { dco.m.visible = true; dco.m.scale.setScalar(1); dco.t = 1; bGroups[decos.indexOf(dco)].lid.material.color.setHex(COL[decos.indexOf(dco)]); }
    /* Noten: schweben, einsammeln */
    for (const n of NT) { if (s.notes.includes(n.i)) { n.s.visible = false; continue; } n.s.position.y = 1.6 + Math.sin(t * 2 + n.i) * .35; if (Math.hypot(P.x - n.x, P.z - n.z) < 1.5) { s.notes.push(n.i); n.s.visible = false; persist(); const k = s.notes.length; note([523, 587, 659, 698, 784, 880, 988, 1047][k - 1], .4, 'triangle', .12, 0); burstAt(n.x, 1.8, n.z, 10); say('🎵 Note ' + k + ' von 8!', 1500); if (k === 8) setTimeout(() => bonus(8, '🎶 Alle Noten gefunden! Dein Lied ist komplett!'), 800); } }
    /* Dampf aus den Schornsteinen */
    steamT -= dt; if (steamT <= 0) { steamT = 1.1; const b = W.spots.dampfStack; for (const k of [-1, 1]) fx.burst(b.x, 10.2, b.z + k * 2.2, 3, [[1, 1, 1], [.8, .8, .8]], 1.2, 2.4, 36, -1.5); }
    /* Stummfilm */
    if (film >= 0) { film += dt; filmDraw -= dt; if (filmDraw <= 0) { filmDraw = .08; drawFilm(film); tex.needsUpdate = true; } if (film >= FILM) { film = -1; drawFilm(-1); tex.needsUpdate = true; if (!s.film) { s.film = 1; persist(); G.addStars(2); say('🎬 Ende! Applaus! +2 ⭐ fürs Zuschauen', 3000); } else say('🎬 Ende! Applaus!', 2000); } }
    /* Dampfer-Musik für den Film: kleine Klavier-Begleitung (zusätzlich zur Bereichs-Musik, leise) */
    tk -= dt; if (film >= 0 && tk <= 0) { tk = .5; note([262, 330, 392, 330][((film * 2) | 0) % 4], .3, 'triangle', .04, 0); }
  };
  /* Für das Aufgaben-Log */
  K.log = () => { const s = S(), c = s.col.reduce((a, b) => a + b, 0), n = s.notes.length, i = s.inst.filter(Boolean).length; return { title: '🎬 Dampfer-Hafen', count: (c + n + i + (s.film ? 1 : 0)) + ' von 21', rows: [
    { ok: c === 6, icon: '🎨', text: 'Farbe zurückbringen: ' + c + '/6 Farbeimer öffnen', dest: 'dampf' }, { ok: i === 6, icon: '🎼', text: 'Dampfer-Orchester: ' + i + '/6 Instrumente spielen', dest: 'dampf' }, { ok: n === 8, icon: '🎵', text: 'Noten finden: ' + n + '/8', dest: 'dampf' }, { ok: !!s.film, icon: '🎬', text: 'Einen Stummfilm im Freiluftkino ansehen', dest: 'dampf' }] }; };
  K.state = S; K.willi = willi; K.statue = statue;
  return K;
};

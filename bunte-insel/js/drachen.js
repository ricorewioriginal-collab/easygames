'use strict';
/* Bunte Insel – Drachenhöhen (Erweiterung): Fantasy-Welt im Süden mit einem kleinen Drachen als Begleiter.
   Inspiriert von der Spielidee „kleiner Drache sammelt Edelsteine, speit Feuer, gleitet durch die Luft, befreit Freunde“ – diese Ideen sind frei.
   Alles Konkrete ist selbst erfunden: eigener Drache „Zündel“ (mintgrün mit orangem Bauch und blauen Flügeln), eigene Namen, Orte, Geschichte und Musik;
   keine Figuren, Namen, Orte, Farbkombinationen oder Musik aus bestehenden Spielen. Nicht mit irgendeiner Firma verbunden.
   Inhalt: Zündel folgt dir und speit Feuer für die 6 Fackeln, 6 Kristall-Freunde befreien, ~44 Funkelsteine sammeln, 4 Aufwind-Säulen und 8 Flugringe
   (mit Drachenflügel-Gadget gleiten), Himmelstor mit Highlight-Spiel „Drachenflug“ (Ring-Flug in Pseudo-3D), Statue, Bewohner. */
BI.DRACHEN = { x: 100, z: 275, R: 48, bridge: { x0: 95.5, x1: 104.5, z0: 140, z1: 232 } };
BI.DRACHEN_GEM = [[0xff4d6a, 1], [0x4cd07d, 2], [0x3fa0ff, 5], [0xffd23f, 10]];
BI.DRACHEN_FREUNDE = [['Brandy', 0xff8a3d], ['Wölkchen', 0x8fd8ff], ['Rosalie', 0xff8fc8], ['Sunny', 0xffe14a], ['Minto', 0x4cd0a8], ['Rubin', 0xe0455a]];

/* ---------- Boden, Brücke, Tor, Plaza, Fackeln, Kristalle, Berge, Himmelstor, Aufwind-Säulen (statisch) ---------- */
BI.buildDrachenGround = function (c) {
  const { W, st, lamp, ROADY } = c, P = BI.DRACHEN, TAU = Math.PI * 2, X = u => P.x + u, Z = v => P.z + v, STONE = 0xb7bcc9, STONE2 = 0x9aa0b4, DARK = 0x5d6275;
  W.drachen = P; W.spots.drachen = { x: P.x, z: P.z - 40 };
  st.disc(P.x, P.z, P.R + 9, 0, 0x7fd66b, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, 0xe8d9a8, 56);
  /* Brücke (entlang z) aus Stein mit Drachenkopf-Pfosten */
  { const b = P.bridge, L = b.z1 - b.z0, cz = (b.z0 + b.z1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, STONE2); for (let z = b.z0 + 1; z < b.z1; z += 2) st.rect(b.x0, z, b.x1, z + .08, ROADY + .01, DARK);
    for (const sd of [-1, 1]) { const x = P.x + sd * 4.6; st.box(x, 0, cz, .3, 1.2, L, STONE); st.box(x, 1.2, cz, .4, .12, L, 0xdfe3ee); W.addBox(x - .2, b.z0 + 2, x + .2, b.z1, false, 1.3); }
    for (let z = b.z0 + 4; z < b.z1; z += 10) for (const sd of [-1, 1]) st.cyl(P.x + sd * 3.8, -1.6, z, .45, .5, 1.62, DARK, 8);
    for (let z = b.z0 + 8; z < b.z1 - 4; z += 16) for (const sd of [-1, 1]) { st.cyl(P.x + sd * 4.6, 1.3, z, .22, .26, .9, STONE, 6); st.sph(P.x + sd * 4.6, 2.35, z, .32, 0x5fd6a8, 1, 1, .9, 1.2); st.cone(P.x + sd * 4.6 - .12, 2.6, z, .09, .3, 0xfff0c8, 4); st.cone(P.x + sd * 4.6 + .12, 2.6, z, .09, .3, 0xfff0c8, 4); } }
  /* Eingangstor: zwei Steintürme und ein Bogen, oben ein Drachenschädel-Stein (eigenes Wappen: Flamme im Kreis) */
  { const gz = Z(-42); for (const sd of [-1, 1]) { st.cyl(X(sd * 6), 0, gz, 1.1, 1.3, 6.5, STONE, 10); st.cone(X(sd * 6), 6.5, gz, 1.6, 2.2, 0x3fa0ff, 10); st.sph(X(sd * 6), 9.2, gz, .3, 0xffd23f, 1); } st.box(P.x, 5.2, gz, 11, 1.2, 1.2, STONE2); st.cyl(P.x, 6.4, gz, 1.1, 1.1, .35, 0xfff0c8, 14, Math.PI / 2); st.cone(P.x, 6.9, gz, .5, 1.1, 0xff8a1f, 6);
    W.addCircle(X(-6), gz, 1.3, false, 8); W.addCircle(X(6), gz, 1.3, false, 8); W.spots.drachenGate = { x: P.x, y: 10.8, z: gz }; }
  /* Plaza: Ringe aus Stein, Sockel für die große Drachenstatue */
  st.disc(X(0), Z(0), 13, ROADY + .01, 0xcfd3de, 40); for (let k = 0; k < 4; k++) st.ring(X(0), Z(0), 4 + k * 2.4, 5 + k * 2.4, ROADY + .02, k % 2 ? 0x8fa0d8 : 0xe2b27a, 40);
  st.cyl(X(0), 0, Z(0), 3.1, 3.4, .9, STONE2, 18); st.cyl(X(0), .9, Z(0), 2.6, 2.8, .7, STONE, 18); st.cyl(X(0), 1.6, Z(0), 2.4, 2.4, .2, 0xe2b27a, 18); W.addCircle(X(0), Z(0), 3.4, false, 3); W.spots.drachenStatue = { x: X(0), y: 1.8, z: Z(0) };
  /* Fackeln (Feuerschalen): zunächst dunkel, Zündel entzündet sie */
  W.spots.drachenFackeln = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .52, u = Math.sin(a) * 17, v = Math.cos(a) * 17; st.cyl(X(u), 0, Z(v), .35, .5, 1.5, STONE2, 8); st.cyl(X(u), 1.5, Z(v), .8, .5, .5, DARK, 10); st.cyl(X(u), 2.0, Z(v), .65, .65, .08, 0x2a2a33, 10); W.addCircle(X(u), Z(v), .7, false, 2); W.spots.drachenFackeln.push({ x: X(u), z: Z(v), i: k }); }
  /* Kristall-Freunde: sechs kleine Drachen, eingeschlossen in Kristall */
  { const px = X(-10.4), pz = Z(-6), hd = Math.atan2(10.4, 6); st.cyl(px, 0, pz, 4.4, 4.6, .3, STONE2, 20); st.cyl(px, .3, pz, 3.9, 3.9, .08, 0xe2b27a, 20); st.ring(px, pz, 3.2, 3.5, .4, 0xff8a1f, 20);
    W.spots.drachenReit = { x: px, z: pz, h: hd }; W.vehicleSpawns.push({ type: 'drake', x: px, z: pz, h: hd }); }
  W.spots.drachenKristalle = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .1, u = Math.sin(a) * 31, v = Math.cos(a) * 31; st.cyl(X(u), 0, Z(v), 1.7, 2, .35, STONE2, 10); W.addCircle(X(u), Z(v), 1.7, false, 2); W.spots.drachenKristalle.push({ x: X(u), z: Z(v), i: k }); }
  /* Himmelstor (Portal) im Norden: zwei Säulen, Bogen, Sterne */
  { const px = X(0), pz = Z(-27); for (const sd of [-1, 1]) { st.cyl(px + sd * 3.4, 0, pz, .7, .85, 6.6, STONE, 8); st.sph(px + sd * 3.4, 6.9, pz, .5, 0x3fa0ff, 1); } st.box(px, 6.4, pz, 8.6, 1, 1.2, STONE2); for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI; st.box(px + Math.cos(a) * 3.4, 6.2 + Math.sin(a) * 3.4, pz, .9, .9, 1.1, k % 2 ? STONE : 0xe2b27a, 0, 0, a + Math.PI / 2); }
    W.addCircle(px - 3.4, pz, 1, false, 7); W.addCircle(px + 3.4, pz, 1, false, 7); W.spots.drachenTor = { x: px, y: 5.2, z: pz }; }
  /* Aufwind-Säulen: runde Pads mit Wimpeln */
  W.spots.drachenWind = []; [[-14, 10], [14, 10], [-18, -8], [18, -8]].forEach(([u, v], i) => { st.cyl(X(u), 0, Z(v), 2.1, 2.3, .25, STONE, 14); st.ring(X(u), Z(v), 1, 1.8, .26, 0x8fe8ff, 16); st.cyl(X(u), .25, Z(v), .12, .12, 3, DARK, 5); for (let k = 0; k < 3; k++) st.box(X(u) + .45, 2.6 - k * .45, Z(v), .8, .3, .04, [0x3fa0ff, 0xffffff, 0xff8a1f][k]); W.spots.drachenWind.push({ x: X(u), z: Z(v), i }); });
  /* Flügel-Ständer + Gem-Händler-Stand */
  { const sx = X(10.4), sz = Z(-6); st.box(sx, 0, sz, 2.4, 1, 1.2, 0x8a5a33); st.box(sx, 1, sz, .12, 1.6, .12, 0x6a4a2a); st.box(sx - .6, 1.2, sz, 1.2, .1, .1, 0x6a4a2a, 0, 0, .4); st.box(sx + .6, 1.2, sz, 1.2, .1, .1, 0x6a4a2a, 0, 0, -.4); W.addBox(sx - 1.3, sz - .7, sx + 1.3, sz + .7, false, 2); W.spots.drachenFluegel = { x: sx, z: sz + 2.6 }; }
  /* Berge außen (nur Kulisse, mit Schnee) und Kristall-Bäume */
  const rn = BI.rng(808); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + rn() * .3, d = 40 + rn() * 3, u = Math.sin(a) * d, v = Math.cos(a) * d; if (Math.abs(u) < 8 && v < -30) continue; const h = 6 + rn() * 5, r = 4 + rn() * 2; st.cone(X(u), 0, Z(v), r, h, i % 2 ? 0x8d97b5 : 0x7e89a8, 7); st.cone(X(u), h * .72, Z(v), r * .3, h * .28, 0xffffff, 7); W.addCircle(X(u), Z(v), r * .6, false, h); }
  for (let i = 0; i < 16; i++) { const a = rn() * TAU, d = 20 + rn() * 17, u = Math.sin(a) * d, v = Math.cos(a) * d; if (Math.hypot(u, v) < 15 || (Math.abs(u) < 6 && v < -20 && v > -34)) continue; if (Math.hypot(u - 0, v - 31) < 4) continue; st.cyl(X(u), 0, Z(v), .22, .3, 1.8, 0x6a4a2a, 6); st.cone(X(u), 1.4, Z(v), 1.3, 2.4, [0x35c4b0, 0x4cd07d, 0x8fd86b][i % 3], 6); W.addCircle(X(u), Z(v), .5, false, 3); }
  /* Kristallhaufen (Deko) */
  for (let i = 0; i < 12; i++) { const a = rn() * TAU, d = 14 + rn() * 26, u = Math.sin(a) * d, v = Math.cos(a) * d; if (Math.hypot(u, v) < 14) continue; for (let k = 0; k < 3; k++) st.cone(X(u + (rn() - .5) * 1.2), 0, Z(v + (rn() - .5) * 1.2), .35, 1 + rn() * 1.2, [0xff6a8a, 0x6ac8ff, 0xa66bff, 0xffd23f][(i + k) % 4], 5); }
  /* Laternen */
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .2, x = X(Math.sin(a) * 11), z = Z(Math.cos(a) * 11); st.cyl(x, 0, z, .08, .1, 3.4, 0x444a5a, 6); lamp.sph(x, 3.6, z, .3, 0xaee4ff, 1); }
};

/* ---------- Drachen „Zündel“: eigene Figur aus Teilen (Kopf, Flügel, Beine, Schwanz) ---------- */
BI.makeDrache = function (o) {
  o = o || {}; const BODY = o.body != null ? o.body : 0x5fd6a8, BELLY = o.belly != null ? o.belly : 0xffb347, WING = o.wing != null ? o.wing : 0x6cc6ff, WING2 = 0x3a8fe0, HORN = 0xfff0c8, mat = BI.mat(), root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const mesh = (fn, parent, x, y, z) => { const b = new BI.Batch(); fn(b); const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(x, y, z); (parent || inner).add(g); return g; };
  mesh(b => { b.sph(0, 0, 0, .42, BODY, 1, 1, 1, 1.25); b.sph(0, -.06, .22, .3, BELLY, 1, .9, 1.1, .6); for (let k = 0; k < 3; k++) b.cone(0, .36 - k * .02, -.2 + k * .18, .08, .22, 0xff8a3d, 4); }, inner, 0, .62, 0);
  const head = mesh(b => { b.sph(0, 0, 0, .3, BODY, 1); b.sph(0, -.08, .26, .17, BODY, 1, 1, .8, 1.3); b.sph(-.05, -.04, .42, .035, 0x2a4a3a, 1); b.sph(.05, -.04, .42, .035, 0x2a4a3a, 1); for (const sd of [-1, 1]) { b.sph(sd * .13, .1, .24, .1, 0xffffff, 1, 1, 1.15, .5); b.sph(sd * .13, .09, .31, .05, 0x1f7a4a, 1); b.sph(sd * .13, .09, .335, .025, 0x111111, 1); b.cone(sd * .16, .28, -.02, .07, .3, HORN, 5); b.sph(sd * .2, -.1, .18, .06, 0xffa7a7, 1, 1, .7, .4); b.cone(sd * .14, .3, -.18, .05, .18, 0xff8a3d, 4); } }, inner, 0, 1.08, .3);
  const wing = sd => { const g = mesh(b => { b.box(sd * .3, 0, 0, .6, .05, .05, WING2, 0, 0, sd * .3); b.box(sd * .52, -.12, -.02, .55, .02, .46, WING, 0, 0, sd * .15); b.box(sd * .26, -.1, -.02, .4, .02, .38, WING, 0, 0, sd * .1); b.cone(sd * .78, -.04, 0, .06, .18, HORN, 4); }, inner, sd * .26, 1.0, -.2); return g; };
  const wL = wing(-1), wR = wing(1);
  const leg = sd => mesh(b => { b.sph(0, -.12, .04, .15, BODY, 1, 1, 1.1, 1.2); b.sph(0, -.22, .12, .1, BELLY, 1, 1.1, .5, 1.3); }, inner, sd * .2, .3, .05);
  const arm = sd => mesh(b => { b.sph(0, -.1, .02, .09, BODY, 1, 1, 1.4, 1); b.sph(0, -.2, .08, .07, BELLY, 1, 1.2, .8, 1.2); }, inner, sd * .36, .72, .1);
  const lL = leg(-1), lR = leg(1), aL = arm(-1), aR = arm(1);
  const tail = mesh(b => { b.sph(0, 0, -.3, .2, BODY, 1, .8, .8, 1.5); b.sph(0, 0, -.62, .13, BODY, 1, .8, .8, 1.4); b.cone(0, .05, -.88, .13, .3, 0xff8a3d, 4); }, inner, 0, .5, -.38);
  const D = { root, inner, head, wL, wR, lL, lR, aL, aR, tail, t: 0 };
  D.set = function (name, t) {
    const s = Math.sin; inner.position.y = 0; inner.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0); lL.rotation.set(0, 0, 0); lR.rotation.set(0, 0, 0); aL.rotation.set(0, 0, 0); aR.rotation.set(0, 0, 0);
    const fold = (a, b) => { wL.rotation.set(0, a, b); wR.rotation.set(0, -a, -b); };
    if (name === 'idle') { inner.position.y = .02 * Math.abs(s(t * 2)); head.rotation.y = s(t * .9) * .25; head.rotation.x = s(t * 1.3) * .05; fold(.5, .1 + s(t * 1.6) * .05); tail.rotation.y = s(t * 2.2) * .35; }
    else if (name === 'walk') { inner.position.y = Math.abs(s(t * 9)) * .05; lL.rotation.x = s(t * 9) * .6; lR.rotation.x = -s(t * 9) * .6; aL.rotation.x = -s(t * 9) * .4; aR.rotation.x = s(t * 9) * .4; fold(.45, .05); tail.rotation.y = s(t * 5) * .5; head.rotation.x = .05; }
    else if (name === 'fly') { inner.position.y = .5 + .12 * s(t * 3); wL.rotation.set(0, .2, s(t * 14) * .8); wR.rotation.set(0, -.2, -s(t * 14) * .8); lL.rotation.x = .5; lR.rotation.x = .5; tail.rotation.x = -.3; tail.rotation.y = s(t * 3) * .3; head.rotation.x = .1; }
    else if (name === 'fire') { head.rotation.x = -.55 + s(t * 20) * .03; inner.rotation.x = -.08; fold(.9, .3); tail.rotation.y = s(t * 8) * .5; inner.position.y = .03; }
    else if (name === 'happy') { inner.position.y = Math.abs(s(t * 8)) * .3; wL.rotation.set(0, .2, s(t * 18) * .9); wR.rotation.set(0, -.2, -s(t * 18) * .9); aL.rotation.z = .8 + s(t * 10) * .3; aR.rotation.z = -.8 - s(t * 10) * .3; head.rotation.z = s(t * 6) * .2; tail.rotation.y = s(t * 12) * .7; }
    else if (name === 'frozen') { fold(.5, .1); }
  };
  return D;
};

/* ---------- Laufzeit ---------- */
BI.createDrachen = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, D = BI.DRACHEN, X = u => D.x + u, Z = v => D.z + v, mat = BI.mat(), TAU = Math.PI * 2, GEM = BI.DRACHEN_GEM, FR = BI.DRACHEN_FREUNDE;
  const S = () => save.drachen || (save.drachen = { fackeln: [0, 0, 0, 0, 0, 0], freunde: [0, 0, 0, 0, 0, 0], gems: [], gemPts: 0, paid: 0, ringe: 0, ringBonus: 0, tor: 0, wings: 0 });
  const note = (f, d, ty, v, del, sl) => { try { A.note && A.note(f, d, ty, v, del, sl); } catch (e) { } }, drum = (k, del) => { try { A.drum && A.drum(k, del); } catch (e) { } }, snd = n => { try { A[n] && A[n](); } catch (e) { } };
  const FIRE = [[1, .55, .1], [1, .8, .2], [1, .35, .1]], COLS = [[1, .82, .2], [.35, .7, 1], [1, .6, .2], [1, 1, 1], [.4, 1, .7]];
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#2a2a5a'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffe9a8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.drachenGate; sign('🐉 Willkommen in den Drachenhöhen!', g.x, g.y, g.z, 11); const rp = W.spots.drachenReit; sign('🐲 Reit-Drache – E zum Aufsteigen', rp.x, 6.4, rp.z, 6.4); const t = W.spots.drachenTor; sign('🌀 Himmelstor', t.x, t.y + 5.4, t.z, 5); const f = W.spots.drachenFluegel; sign('🪽 Flügel-Ständer', f.x, 3.6, f.z - 2.6, 4.4); const s = W.spots.drachenStatue; sign('🐲 Zündel, der kleine Drache', s.x, s.y + 8.8, s.z, 8); }
  /* ===== Statue (groß, Stein) + Begleiter Zündel ===== */
  const statue = BI.makeDrache({ body: 0x9aa0b4, belly: 0xc9cfdd, wing: 0xb7bcc9 }), sp = W.spots.drachenStatue; statue.root.scale.setScalar(3.6); statue.root.position.set(sp.x, sp.y, sp.z); statue.root.rotation.y = Math.PI; statue.set('fire', 0); scene.add(statue.root);
  const zun = BI.makeDrache(), zs = { x: X(5), z: Z(6), h: Math.PI, mode: 'idle', t: 0, act: null, fl: 0 }; zun.root.scale.setScalar(1.5); zun.root.position.set(zs.x, 0, zs.z); scene.add(zun.root);
  { const cv = document.createElement('canvas'); cv.width = 192; cv.height = 56; const c = cv.getContext('2d'); c.font = 'bold 36px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#2a2a5a'; c.strokeText('Zündel', 96, 30); c.fillStyle = '#fff'; c.fillText('Zündel', 96, 30); zs.lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); zs.lab.scale.set(1.6, .47, 1); scene.add(zs.lab); }
  /* ===== Fackeln (Flammen) ===== */
  const FK = W.spots.drachenFackeln.map(q => { const m = new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa23a })); m.scale.set(1, 1.5, 1); m.position.set(q.x, 2.5, q.z); m.visible = false; scene.add(m); return { q, m }; });
  /* ===== Kristall-Freunde ===== */
  const KR = W.spots.drachenKristalle.map(q => { const [name, col] = FR[q.i], fr = BI.makeDrache({ body: col, belly: 0xfff0c8, wing: 0xdfe8ff }); fr.root.scale.setScalar(.95); fr.root.position.set(q.x, .35, q.z); fr.root.rotation.y = Math.atan2(D.x - q.x, D.z - q.z); fr.set('frozen', 0); scene.add(fr.root);
    const shell = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshLambertMaterial({ color: 0xaee8ff, transparent: true, opacity: .55 })); shell.scale.set(1, 1.35, 1); shell.position.set(q.x, 1.5, q.z); scene.add(shell); return { q, fr, shell, name, t: -1 }; });
  /* ===== Aufwind-Säulen (leuchtende Ringe, Partikel) ===== */
  const WD = W.spots.drachenWind.map(q => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 9, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0x8fe8ff, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide })); m.position.set(q.x, 4.5, q.z); scene.add(m); return { q, m }; });
  /* ===== Flugringe (8, der Reihe nach, Höhe 5–13) ===== */
  const RG = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .3, r = 20 + (k % 2) * 4, y = 5 + k * 1.1, m = new THREE.Mesh(new THREE.TorusGeometry(2.1, .22, 8, 24), new THREE.MeshBasicMaterial({ color: 0x8fb4d8, transparent: true, opacity: .55 })); m.position.set(X(Math.sin(a) * r), y, Z(Math.cos(a) * r)); m.rotation.y = a + Math.PI / 2; scene.add(m); RG.push({ m, x: m.position.x, y, z: m.position.z, k }); }
  /* ===== Funkelsteine (Instanzen), Werte 1/2/5/10 ===== */
  const gr = BI.rng(3131), GP = []; { const spots = W.spots.drachenKristalle.concat(W.spots.drachenFackeln); for (let i = 0; i < 44; i++) { let u, v, ok = false, tries = 0; while (!ok && tries++ < 30) { const a = gr() * TAU, d = 6 + gr() * 36; u = Math.sin(a) * d; v = Math.cos(a) * d; ok = Math.hypot(u, v) > 5 && !(Math.abs(u) < 7 && v < -22 && v > -34) && spots.every(s => Math.hypot(X(u) - s.x, Z(v) - s.z) > 2); } const r = gr(), val = i < 4 ? 3 : r < .55 ? 0 : r < .85 ? 1 : r < .97 ? 2 : 3, air = i >= 36; GP.push({ x: X(u), z: Z(v), y: air ? 5 + gr() * 8 : 1.0, val, got: false }); } }
  const gemMesh = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.4, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), GP.length); gemMesh.frustumCulled = false; scene.add(gemMesh);
  { const cc = new THREE.Color(); GP.forEach((g, i) => gemMesh.setColorAt(i, cc.setHex(GEM[g.val][0]))); }
  const gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), gp = new THREE.Vector3(), gs = new THREE.Vector3(1, 1, 1), gy = new THREE.Vector3(0, 1, 0);
  function placeGems(t) { GP.forEach((g, i) => { gq.setFromAxisAngle(gy, t * 1.5 + i); const sc = g.got ? 0 : (g.val === 3 ? 1.4 : g.val === 2 ? 1.2 : 1); gs.set(sc, sc * 1.3, sc); gp.set(g.x, g.y + Math.sin(t * 2 + i) * .15 + .4, g.z); gm.compose(gp, gq, gs); gemMesh.setMatrixAt(i, gm); }); gemMesh.instanceMatrix.needsUpdate = true; }
  /* ===== Himmelstor-Scheibe ===== */
  const tor = W.spots.drachenTor, disc = new THREE.Mesh(new THREE.CircleGeometry(3.1, 24), new THREE.MeshBasicMaterial({ color: 0x4a4a7a, transparent: true, opacity: .55, side: THREE.DoubleSide })); disc.position.set(tor.x, tor.y + .95, tor.z); scene.add(disc);
  /* ===== Spielleiste für Zündel ===== */
  BI.injectHudCss(); const host = (document.getElementById('mission') || {}).parentNode || document.body, panel = document.createElement('div'); panel.className = 'pPanel'; panel.hidden = true; panel.innerHTML = '<div class="pT">🐲 Zündel – was machen wir?</div><div class="pB"></div>';
  const OPT = [['talk', '💬', 'Reden'], ['fire', '🔥', 'Feuer!'], ['wing', '🪽', 'Flattern'], ['hug', '🤗', 'Kuscheln'], ['happy', '🎉', 'Freudentanz'], ['partner', '🎒', 'Als Partner mitnehmen']];
  for (const [k, ic, tx] of OPT) { const b = document.createElement('button'); b.innerHTML = '<span>' + ic + '</span>' + tx; b.addEventListener('click', e => { e.stopPropagation(); choose(k); }); panel.querySelector('.pB').appendChild(b); }
  { const x = document.createElement('button'); x.className = 'pX'; x.textContent = '✖'; x.addEventListener('click', e => { e.stopPropagation(); panel.hidden = true; }); panel.appendChild(x); } host.appendChild(panel);
  const LINES = ['🐲 „Rrrr! Ich bin Zündel. Mein Feuer ist so warm wie eine Umarmung!“', '🐲 „Sechs Fackeln warten auf meine Flamme. Und sechs Freunde sitzen im Kristall. Hilfst du mir?“', '🐲 „Mit Flügeln kannst du gleiten: Spring und halte den Sprung-Knopf. Probier den Flügel-Ständer!“', '🐲 „Funkelsteine sind rot, grün, blau und golden. Gold ist am wertvollsten!“', '🐲 „Wenn alle Fackeln brennen, öffnet sich das Himmelstor. Dahinter liegt der Drachenflug!“', '🐲 „Ich habe mal einen Pups gemacht, der war so heiß, dass der Kakao gekocht hat. Entschuldigung!“'];
  let li = 0, lastHug = -1e9;
  function breathe(tx, ty, tz, n) { const sx = zs.x + Math.sin(zs.h) * 1.3, sz = zs.z + Math.cos(zs.h) * 1.3; for (let i = 0; i < n; i++) setTimeout(() => { const f = Math.min(1, i / n); fx.emit && fx.emit(sx, 1.7, sz, (tx - sx) * (1.1 + Math.random() * .6), (ty - 1.7) * 1 + Math.random() * 1.2, (tz - sz) * (1.1 + Math.random() * .6), .7, 46, 1, .5 + Math.random() * .4, .2, 0, .9); }, i * 40); drum('s'); snd('whoosh'); }
  function choose(k) {
    panel.hidden = true; if (k === 'partner') { zs.act = { n: 'happy', t: 0, d: 1.6 }; G.takeMascot('zuendel'); return; }
    if (k === 'talk') { say(LINES[li++ % LINES.length], 5200); zs.act = { n: 'happy', t: 0, d: 1.4 }; return; }
    if (k === 'fire') { const f = Math.sin(P.h), g = Math.cos(P.h); zs.h = P.h; zs.act = { n: 'fire', t: 0, d: 1.6 }; breathe(zs.x + Math.sin(zs.h) * 6, 2.4, zs.z + Math.cos(zs.h) * 6, 30); say('🔥 „Fauuuch!“', 1500); return; }
    if (k === 'wing') { zs.act = { n: 'fly', t: 0, d: 2.6 }; snd('whoosh'); say('🪽 „Flatter, flatter!“', 1600); return; }
    if (k === 'hug') { zs.act = { n: 'happy', t: 0, d: 2 }; fx.burst(zs.x, 2, zs.z, 12, [[1, .45, .7], [1, .7, .8]], 3, 1.4, 26, -1); say('🤗 „Drachen-Umarmung! So warm!“', 2600); const now = performance.now(); if (now - lastHug > 45000) { lastHug = now; G.addStars(1); say('🤗 +1 ⭐ fürs Kuscheln!', 1600); } return; }
    zs.act = { n: 'happy', t: 0, d: 3 }; for (let i = 0; i < 8; i++) { note([392, 523, 659, 784][i % 4], .15, 'triangle', .1, i * .18); drum(i % 2 ? 's' : 'k', i * .18); } say('🎉 „Drachen-Freudentanz!“', 2200);
  }
  /* ===== Bewohner ===== */
  K.people = function (folk) {
    const mk = (x, z, look, name, lines, h) => { const c = BI.makeChar(look); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    [['Drachenwächterin Brisa', 9, -8, { shirt: 0x3fa0ff, pants: 0x3d4a7a, hair: 0xffe14a, skin: 0xe0a979, hat: 'helmet', style: 'braids', scale: 1.0 }, ['Willkommen in den Drachenhöhen! Hier wohnt Zündel – er ist ein bisschen tollpatschig, aber ganz lieb. 🐲', 'Sechs Kristall-Freunde brauchen seine Flamme. Schmelze sie vorsichtig!', 'Fliegen darf man hier mit Flügeln. Aber bitte nicht gegen die Berge!']],
     ['Edelstein-Händler Krümel', -10, 10, { shirt: 0x9b4de0, pants: 0x222222, hair: 0x6b4423, skin: 0xc68a5a, hat: 'cap', style: 'curly', glassT: 1, scale: .96 }, ['Funkelsteine, Funkelsteine! Rot ist 1, grün ist 2, blau ist 5 und gold ist 10. 💎', 'Ich zähle sie jeden Abend. Jetzt gerade fehlen drei. Hast du sie gesehen?', 'Die goldenen liegen manchmal hoch in der Luft. Nimm einen Aufwind!']],
     ['Schmied Funke', 20, -2, { shirt: 0xff7a1a, pants: 0x4a3a2a, hair: 0x222222, skin: 0xd8a070, hat: 'none', style: 'bald', wrink: 1, scale: 1.04 }, ['Mein Hammer macht Bumm, mein Amboss macht Bamm. 🔨', 'Die Fackeln habe ich selbst gebaut. Sie brennen nur mit Drachenfeuer – ganz ohne Streichholz!', 'Feuer ist nur etwas für Drachen und Erwachsene. Kinder: Finger weg von echtem Feuer!']],
     ['Flori', -16, -16, { shirt: 0x4cd07d, pants: 0x7a5ce0, hair: 0xd9a441, skin: 0xf3c9a0, hat: 'party', style: 'pig', dress: true, scale: .62 }, ['Ich will auch Flügel! Aber ich bin noch zu klein. 🪽', 'Zündel hat mir mal die Nase gewärmt. Das war lustig!', 'Hast du schon den Drachenflug gespielt? Man fliegt durch Ringe!']]]
      .forEach(([name, u, v, look, lines]) => mk(X(u), Z(v), look, name, lines, Math.atan2(-u, -v)));
  };
  /* ===== Interaktion ===== */
  const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  K.near = function () {
    if (P.veh || P.y > 1.8) return null; if (Math.hypot(P.x - D.x, P.z - D.z) > D.R + 4) return null;
    if (nr(zs.x, zs.z, 3) && save.pet !== 'zuendel') return { k: 'dzuendel' };
    for (const f of FK) if (nr(f.q.x, f.q.z, 2.6)) return { k: 'dfackel', i: f.q.i };
    for (const q of KR) if (nr(q.q.x, q.q.z, 2.8)) return { k: 'dfreund', i: q.q.i };
    if (nr(tor.x, tor.z + 2, 3.6)) return { k: 'dtor' };
    const fl = W.spots.drachenFluegel; if (nr(fl.x, fl.z, 2.6)) return { k: 'dfluegel' };
    if (nr(sp.x, sp.z, 5.4)) return { k: 'dstatue' };
    return null;
  };
  const burstAt = (x, y, z, n, c) => fx.burst(x, y, z, n, c || COLS, 4, 1.4, 28, 3);
  const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3600); snd('fanfare'); };
  let lastStat = -1e9; const litCount = () => S().fackeln.reduce((a, b) => a + b, 0), freeCount = () => S().freunde.reduce((a, b) => a + b, 0);
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'dzuendel') { panel.querySelector('.pT').textContent = '🐲 Zündel – was machen wir?'; panel.hidden = !panel.hidden; return; }
    if (n.k === 'dfackel') { const i = n.i, f = FK[i]; if (s.fackeln[i]) { say('🔥 Diese Fackel brennt schon! Schön warm hier.', 1800); return; } zs.h = Math.atan2(f.q.x - zs.x, f.q.z - zs.z); zs.act = { n: 'fire', t: 0, d: 1.4 }; breathe(f.q.x, 2.4, f.q.z, 24); s.fackeln[i] = 1; setTimeout(() => { f.m.visible = true; burstAt(f.q.x, 2.4, f.q.z, 16, [[1, .6, .2], [1, .85, .3]]); }, 500); persist(); G.addStars(1); snd('star'); const k = litCount(); say('🔥 Fackel ' + k + ' von 6 brennt! +1 ⭐', 3000);
      if (k === 6) setTimeout(() => { bonus(6, '🌀 Das Himmelstor öffnet sich! Alle Fackeln brennen.'); s.tor = 1; persist(); for (let j = 0; j < 4; j++) setTimeout(() => burstAt(tor.x + (Math.random() - .5) * 6, 6 + Math.random() * 4, tor.z, 40), j * 260); }, 1300); return; }
    if (n.k === 'dfreund') { const i = n.i, q = KR[i]; if (s.freunde[i]) { say('🐲 ' + q.name + ': „Danke nochmal! Ich passe auf die Gemmen auf.“', 3000); return; } zs.h = Math.atan2(q.q.x - zs.x, q.q.z - zs.z); zs.act = { n: 'fire', t: 0, d: 1.4 }; breathe(q.q.x, 1.6, q.q.z, 26); s.freunde[i] = 1; q.t = 0; persist(); snd('star'); const k = freeCount(); say('💎 Kristall schmilzt! Freund ' + k + ' von 6 befreit! +1 ⭐', 3200); G.addStars(1); if (k === 6) setTimeout(() => bonus(8, '🐉 Alle Drachenfreunde sind frei!'), 1400); return; }
    if (n.k === 'dtor') { if (!s.tor) { say('🌀 Das Himmelstor ist noch dunkel. Zünde zuerst alle 6 Fackeln an – Zündel hilft dir! (' + litCount() + '/6)', 4200); return; } G.start('ringflug_drache'); return; }
    if (n.k === 'dfluegel') { const own = save.gadgets || (save.gadgets = []); if (!own.includes('wings')) { own.push('wings'); s.wings = 1; say('🪽 Du bekommst Drachenflügel geschenkt! Anlegen: nochmal drücken. Gleiten: in der Luft den Sprung-Knopf halten.', 6000); persist(); snd('fanfare'); burstAt(P.x, 2, P.z, 20); return; } save.gadget = save.gadget === 'wings' ? '' : 'wings'; persist(); snd('pop'); say(save.gadget === 'wings' ? '🪽 Flügel an! Spring und halte den Sprung-Knopf zum Gleiten.' : '🪽 Flügel abgelegt.', 3200); return; }
    if (n.k === 'dstatue') { burstAt(sp.x, 6, sp.z, 18); snd('ding'); say('🐲 Zündel, der kleine Drache – Wahrzeichen der Drachenhöhen (Statue)', 4200); const now = performance.now(); if (now - lastStat > 60000) { lastStat = now; G.addStars(1); say('📸 +1 ⭐ fürs Bestaunen!', 1600); } }
  };
  /* ===== Frame-Update (nur in der Nähe) ===== */
  let on = null, windT = 0, ringNext = 0; const toggle = v => { if (on === v) return; on = v; for (const o of [statue.root, zun.root, zs.lab, gemMesh, disc]) o.visible = v; for (const f of FK) f.m.visible = v && !!S().fackeln[f.q.i]; for (const r of RG) r.m.visible = v; for (const w of WD) w.m.visible = v; for (const q of KR) { q.fr.root.visible = v; q.shell.visible = v && !S().freunde[q.q.i]; } };
  const vis = (h, v) => { h.visible = v; };
  K.update = function (dt, t) {
    const near = Math.hypot(P.x - D.x, P.z - D.z) < D.R + 40; toggle(near); if (!near) return; if (save.pet === 'zuendel') zun.root.visible = zs.lab.visible = false; const s = S(), inIsle = Math.hypot(P.x - D.x, P.z - D.z) < D.R;
    /* Zündel: folgt dir auf der Insel, sonst wartet er an der Plaza */
    const tx = inIsle ? P.x - Math.sin(P.h) * 2.4 + Math.cos(P.h) * 1.4 : X(5), tz = inIsle ? P.z - Math.cos(P.h) * 2.4 - Math.sin(P.h) * 1.4 : Z(6), dx = tx - zs.x, dz = tz - zs.z, d = Math.hypot(dx, dz);
    if (zs.act) { zs.act.t += dt; const a = zs.act; zun.set(a.n, t); zun.root.rotation.y = zs.h; if (a.t >= a.d) zs.act = null; }
    else { if (d > .5) { const sp2 = Math.min(d, (d > 8 ? 9 : 5.5) * dt); zs.x += dx / d * sp2; zs.z += dz / d * sp2; zs.h += BI.angDiff(zs.h, Math.atan2(dx, dz)) * Math.min(1, dt * 8); zun.set('walk', t); } else { zs.h += BI.angDiff(zs.h, Math.atan2(P.x - zs.x, P.z - zs.z)) * Math.min(1, dt * 4); zun.set('idle', t); } zun.root.rotation.y = zs.h; }
    zun.root.position.set(zs.x, 0, zs.z); zs.lab.position.set(zs.x, 3, zs.z);
    /* Fackel-Flammen flackern, Kristalle schmelzen, Freunde hüpfen */
    for (const f of FK) if (f.m.visible) { f.m.scale.set(1 + Math.sin(t * 9 + f.q.i) * .1, 1.5 + Math.sin(t * 7 + f.q.i) * .25, 1); }
    for (const q of KR) { if (s.freunde[q.q.i]) { if (q.t >= 0 && q.t < 1) { q.t += dt * .9; q.shell.visible = true; q.shell.scale.setScalar(Math.max(.001, 1 - q.t)); q.shell.scale.y *= 1.35; if (q.t >= 1) q.shell.visible = false; } else q.shell.visible = false; q.fr.set(q.t >= 0 && q.t < 1 ? 'happy' : 'idle', t + q.q.i); } else { q.shell.rotation.y += dt * .3; q.shell.material.opacity = .45 + .1 * Math.sin(t * 2 + q.q.i); } }
    /* Aufwind: nach oben tragen (mit Flügeln lange gleiten) */
    windT -= dt; for (const w of WD) { w.m.rotation.y += dt * 2; const inside = Math.hypot(P.x - w.q.x, P.z - w.q.z) < 2.3 && !P.veh; if (inside && P.y < 14) { P.vy = Math.min(P.vy + 46 * dt, 8.5); if (windT <= 0) { fx.emit && fx.emit(w.q.x + (Math.random() - .5) * 2, P.y - .5, w.q.z + (Math.random() - .5) * 2, 0, 5, 0, .9, 30, 1, .8, .6, 0, .9); } } } if (windT <= 0) windT = .06;
    /* Himmelstor-Scheibe glimmt (bunt, wenn offen) */
    disc.material.color.setHex(s.tor ? 0x7fd8ff : 0x4a4a7a); disc.material.opacity = s.tor ? .5 + .2 * Math.sin(t * 3) : .55; disc.rotation.z += dt * (s.tor ? 1.2 : 0);
    /* Flugringe der Reihe nach */
    RG.forEach((r, i) => { const done = i < s.ringe, nxt = i === s.ringe; r.m.material.color.setHex(done ? 0x4cd07d : nxt ? 0xffd23f : 0x8fb4d8); r.m.material.opacity = done ? .25 : nxt ? .9 : .5; r.m.scale.setScalar(nxt ? 1 + .06 * Math.sin(t * 6) : 1); }); if (s.ringe < 8) { const r = RG[s.ringe]; if (Math.hypot(P.x - r.x, P.z - r.z) < 2.4 && Math.abs(P.y + .6 - r.y) < 2.4) { s.ringe++; persist(); G.addStars(1); note([523, 587, 659, 784, 880, 988, 1047, 1175][s.ringe - 1], .35, 'triangle', .12, 0); burstAt(r.x, r.y, r.z, 18); say('🎯 Ring ' + s.ringe + ' von 8! +1 ⭐', 1700); if (s.ringe === 8) setTimeout(() => bonus(10, '🏅 Ringmeister! Alle Flugringe durchflogen!'), 800); } }
    /* Funkelsteine einsammeln */
    placeGems(t); GP.forEach((g, i) => { if (s.gems.includes(i)) { g.got = true; return; } if (Math.abs(P.x - g.x) < 1.3 && Math.abs(P.z - g.z) < 1.3 && Math.abs(P.y + .6 - g.y) < 1.9) { s.gems.push(i); g.got = true; const v = GEM[g.val][1]; s.gemPts += v; note([784, 988, 1175, 1568][g.val], .25, 'triangle', .1, 0); burstAt(g.x, g.y + .4, g.z, 8, [[1, 1, 1], [.7, .9, 1]]); say('💎 +' + v + ' Funkelstein' + (v > 1 ? 'e' : '') + ' (' + s.gemPts + ' Wert)', 1100); persist(); const due = Math.floor(s.gemPts / 20) - s.paid; if (due > 0) { s.paid += due; G.addStars(2 * due); say('💎 ' + s.gemPts + ' Funkelsteine gesammelt! +' + 2 * due + ' ⭐', 3000); persist(); } } });
  };
  K.log = () => { const s = S(), f = litCount(), fr = freeCount(); return { title: '🐉 Drachenhöhen', count: (f + fr + s.ringe + (s.tor ? 1 : 0) + Math.min(5, Math.floor(s.gemPts / 20))) + ' von 21', rows: [
    { ok: f === 6, icon: '🔥', text: 'Fackeln anzünden (Zündel hilft): ' + f + '/6', dest: 'drachen' }, { ok: fr === 6, icon: '💎', text: 'Kristall-Freunde befreien: ' + fr + '/6', dest: 'drachen' }, { ok: s.ringe === 8, icon: '🎯', text: 'Flugringe der Reihe nach durchfliegen (Aufwind + Flügel): ' + s.ringe + '/8', dest: 'drachen' },
    { ok: s.gemPts >= 100, icon: '💎', text: 'Funkelsteine sammeln: ' + s.gemPts + ' Wert (alle 20 gibt es +2 ⭐)', dest: 'drachen' }, { ok: !!s.tor, icon: '🌀', text: 'Himmelstor öffnen und „Drachenflug“ spielen', dest: 'drachen' }] }; };
  K.state = S; K.zuendel = zun;
  return K;
};

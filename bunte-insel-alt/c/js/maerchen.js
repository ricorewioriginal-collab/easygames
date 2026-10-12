'use strict';
/* Bunte Insel – Märchenland ✨🏰 (Erweiterung): eine kleine Zauberinsel im Nordwesten, INSPIRIERT von den großen Märchen- und Trickfilm-Welten
   (Schloss, Eispalast, Löwenfelsen, Piratenschiff, Meerjungfrauen-Lagune, Zauberteppich-Basar, Dschungel, ein freundlicher Mäuserich) –
   aber mit ganz eigenen, selbst erfundenen Figuren, Namen und Orten. Nichts davon ist ein Original oder ein geschütztes Zeichen.
   Inhalt: Märchentor, Wunschbrunnen (Wunsch tun = Glitzer, die ersten drei bringen ⭐), Schloss „Sternenglanz“ mit Prinzessin Lilia,
   Eispalast „Frostgipfel“ (Eisfee Frida, Schneemann Olli), Königsfels (Löwenkönig Leo), Piratenschiff „Salzige Möwe“ (Käpt'n Kralle),
   Perlenlagune (Meerjungfrau Marina), Teppich-Basar (Teppich-Tom mit fliegendem Teppich), Dschungelpfad (Bär Bruno), Glühfeen, Feuerwerk,
   Spielautomat „Sternschnuppen“ (minis3.js). Alle Figuren sind ansprechbar (Hauptknopf) und sprechen kurze, leichte Sätze. */
BI.MAERCHEN = (function () {
  const R = 62, cx = -175, cz = -275, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Märchenland
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
})();
/* lokale Koordinaten: a = Richtung Schloss (weg von der Brücke), b = quer dazu */
BI.MAERCHEN.at = function (a, b) { const M = BI.MAERCHEN; return { x: M.x + M.ux * a - M.uz * b, z: M.z + M.uz * a + M.ux * b }; };

BI.buildMaerchenGround = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.MAERCHEN, TAU = Math.PI * 2, rn = BI.rng(4711), L = M.at, ry = Math.atan2(M.ux, M.uz), PK = 0xffd6e8, BL = 0x5a7ae8, GOLD = 0xffd23f;
  W.spots.maerchen = { x: M.entry.x, z: M.entry.z }; W.maerchen = M;
  st.disc(M.x, M.z, M.R + 9, 0, 0x9be88a, 80); st.ring(M.x, M.z, M.R - 5, M.R + 9, .012, 0xfff0c8, 80); BI.buildIsleBridge(c, M);
  const spot = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  /* Wege (Pastell-Pflaster) vom Tor über den Platz zum Schloss, Zweige zu den Orten */
  const path = (a0, b0, a1, b1, w) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), l = Math.hypot(a1 - a0, b1 - b0); st.strip(p.x, p.z, w, l, Math.atan2(L(a1, b1).x - L(a0, b0).x, L(a1, b1).z - L(a0, b0).z), ROADY, 0xf6d9ec); };
  path(-50, 0, 14, 0, 6); path(-12, 0, -12, -36, 4); path(-12, 0, -12, 36, 4); path(8, 0, 8, -30, 3.4); path(8, 0, 8, 30, 3.4); path(-12, -34, -30, -40, 3); path(-12, 34, -28, 30, 3);
  /* Entrée: Märchentor mit zwei Sternen-Säulen und Bogen */
  { const e = L(-50, 0); for (const sd of [-1, 1]) { const p = L(-50, sd * 5.2); st.cyl(p.x, 0, p.z, 1.1, 1.3, 7, 0xfff0fa, 10); st.cone(p.x, 7, p.z, 1.6, 2.6, BL, 10); lamp.sph(p.x, 10, p.z, .55, GOLD, 1); W.addCircle(p.x, p.z, 1.4, false, 10); }
    for (let k = -4; k <= 4; k++) { const p = L(-50, k * 1.15); st.box(p.x, 7.4 + 1.6 - Math.abs(k) * .22, p.z, 1.2, .7, 1.4, k % 2 ? 0xff8fc8 : 0xffd23f, ry); } W.spots.maerchenGate = { x: e.x, y: 12.4, z: e.z }; }
  /* Plaza + Wunschbrunnen */
  { const p = L(-12, 0); st.disc(p.x, p.z, 12, ROADY + .01, 0xfff0fa, 40); st.ring(p.x, p.z, 9.5, 10.6, ROADY + .02, 0xff8fc8, 40); st.ring(p.x, p.z, 6.5, 7.4, ROADY + .02, 0x6ad0ff, 40);
    st.cyl(p.x, 0, p.z, 3.4, 3.6, .9, 0xe8f0ff, 20); st.cyl(p.x, .9, p.z, 3, 3, .1, 0x6ad0ff, 20); st.cyl(p.x, .9, p.z, .4, .6, 2.6, 0xdde6ff, 8); lamp.sph(p.x, 3.7, p.z, .55, 0xfff7b0, 1); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; lamp.sph(p.x + Math.sin(a) * 1.6, 2.1, p.z + Math.cos(a) * 1.6, .18, 0x9fe3ff, 0); }
    W.addCircle(p.x, p.z, 3.7, false, 1); W.spots.wunsch = { x: p.x, z: p.z }; }
  /* Schloss „Sternenglanz“: Haupthaus, vier Ecktürme, hoher Mittelturm, Tor, Fahnen, leuchtende Fenster */
  { const k = L(28, 0), kw = 15, kd = 12; st.box(k.x, 0, k.z, kd, 9, kw, PK, ry); st.box(k.x, 9, k.z, kd + .8, .8, kw + .8, 0xffffff, ry); st.prism(k.x, 9.8, k.z, kd + 1.6, 4.5, kw + 1.6, BL, ry + Math.PI / 2); W.addCircle(k.x, k.z, 8.6, false, 14);
    for (const [aa, bb] of [[-5.5, -9], [-5.5, 9], [5.5, -9], [5.5, 9]]) { const t = L(28 + aa, bb); st.cyl(t.x, 0, t.z, 2.4, 2.6, 13, 0xfff0fa, 12); st.cone(t.x, 13, t.z, 3.2, 7.5, BL, 12); lamp.sph(t.x, 20.9, t.z, .45, GOLD, 1); W.addCircle(t.x, t.z, 2.8, false, 14); for (let w = 0; w < 3; w++) { const q = L(28 + aa - Math.sign(aa) * 2.45, bb); lamp.box(q.x, 4 + w * 3, q.z, .1, 1.2, .8, 0xffe9a0, ry); } }
    const m = L(32, 0); st.cyl(m.x, 9, m.z, 3.4, 3.6, 12, 0xfff0fa, 14); st.cone(m.x, 21, m.z, 4.4, 11, 0xc23a8a, 14); lamp.sph(m.x, 32.4, m.z, .7, GOLD, 1); W.addCircle(m.x, m.z, 3.8, false, 30);
    const g = L(22.2, 0); st.box(g.x, 0, g.z, .6, 5.2, 4.2, 0x6b3a2a, ry); st.prism(g.x, 5.2, g.z, .8, 1.4, 4.4, 0x8a4a3a, ry + Math.PI / 2); W.spots.schloss = { x: g.x, z: g.z, fx: L(19.5, 0).x, fz: L(19.5, 0).z };
    for (const bb of [-7, 7]) { const f = L(22, bb); st.cyl(f.x, 9.8, f.z, .06, .08, 4.4, 0xdddddd, 5); st.box(f.x, 13, f.z, .1, 1.2, 1.6, bb < 0 ? 0xff5a8a : 0x5a8aff, ry); } }
  /* Eispalast „Frostgipfel“ (links): Schneefläche, Kristall-Türme */
  { const e = L(10, -34); st.disc(e.x, e.z, 11, ROADY + .01, 0xf4fbff, 28); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, d = i ? 4 + (i % 3) * 2.2 : 0, p = { x: e.x + Math.sin(a) * d, z: e.z + Math.cos(a) * d }, h = 5 + (i * 7 % 6) + (i ? 0 : 7); st.cone(p.x, 0, p.z, 1.4 + (i ? .3 : 1.2), h, [0xbfeaff, 0xa0dcff, 0xe0f6ff][i % 3], 6); lamp.sph(p.x, h + .3, p.z, .25, 0xdff6ff, 1); if (i < 4) W.addCircle(p.x, p.z, 1.6 + (i ? 0 : 1), false, h); }
    W.spots.eis = { x: e.x, z: e.z };
    const sm = L(10, -24); st.sph(sm.x, 1.0, sm.z, 1.05, 0xffffff, 1); st.sph(sm.x, 2.3, sm.z, .8, 0xffffff, 1); st.sph(sm.x, 3.3, sm.z, .55, 0xffffff, 1); st.cone(sm.x, 3.3, sm.z + .5, .12, .7, 0xff8a1f, 5); st.sph(sm.x - .2, 3.5, sm.z + .5, .06, 0x222222, 0); st.sph(sm.x + .2, 3.5, sm.z + .5, .06, 0x222222, 0); W.addCircle(sm.x, sm.z, 1.2, false, 4); W.spots.schneemann = { x: sm.x, z: sm.z }; }
  /* Königsfels (rechts): Felsstufen mit Sonnenring */
  { const r = L(8, 34); for (const [rad, h, col] of [[6, 2.2, 0x9a8a78], [4.8, 4.4, 0xa89886], [3.4, 6.6, 0xb8a894], [2.1, 8.6, 0xc8b8a0]]) st.cyl(r.x, 0, r.z, rad * .92, rad, h, col, 12); st.ring(r.x, r.z, 1.2, 2, 8.65, GOLD, 24); st.cyl(r.x, 8.6, r.z, 2.1, 2.1, .15, 0xffe9a0, 14); W.addCircle(r.x, r.z, 6, false, 10); W.spots.fels = { x: r.x, z: r.z };
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, p = { x: r.x + Math.sin(a) * 9, z: r.z + Math.cos(a) * 9 }; st.sph(p.x, .5, p.z, 1 + (i % 2) * .5, 0x9a8a78, 1, 1, .7, 1, .15); W.addCircle(p.x, p.z, 1.1, false, 1.2); } }
  /* Piratenschiff „Salzige Möwe“ (vorne links) */
  { const s = L(-30, -41), sry = ry + 0.4; st.box(s.x, 0, s.z, 15, 2.6, 5.6, 0x6b3f22, sry); st.box(s.x, 2.6, s.z, 15.4, .35, 6, 0x8a5a33, sry); st.prism(s.x + Math.sin(sry) * 8.4, 0, s.z + Math.cos(sry) * 8.4, 5.6, 2.6, 3.4, 0x6b3f22, sry + Math.PI / 2);
    const m1 = { x: s.x + Math.sin(sry) * 1, z: s.z + Math.cos(sry) * 1 }; st.cyl(m1.x, 2.9, m1.z, .22, .28, 10.5, 0x4a2f18, 6); st.box(m1.x, 6.2, m1.z, 5, 4.4, .12, 0xfff3d6, sry + Math.PI / 2); st.box(m1.x, 12.9, m1.z, .12, 1.2, 1.8, 0x222222, sry + Math.PI / 2);
    for (let i = -2; i <= 2; i++) { const p = { x: s.x + Math.sin(sry) * i * 2.8, z: s.z + Math.cos(sry) * i * 2.8 }; st.sph(p.x - Math.cos(sry) * 2.9, 1.4, p.z + Math.sin(sry) * 2.9, .32, 0x222222, 1); st.sph(p.x + Math.cos(sry) * 2.9, 1.4, p.z - Math.sin(sry) * 2.9, .32, 0x222222, 1); }
    W.addCircle(s.x, s.z, 4.2, false, 5); W.addCircle(s.x + Math.sin(sry) * 5.5, s.z + Math.cos(sry) * 5.5, 2.4, false, 5); W.addCircle(s.x - Math.sin(sry) * 5.5, s.z - Math.cos(sry) * 5.5, 2.4, false, 5); W.spots.schiff = { x: s.x, z: s.z }; }
  /* Perlenlagune (vorne rechts) */
  { const l = L(-28, 31); st.disc(l.x, l.z, 9.5, ROADY + .008, 0xf4e6b8, 30); st.disc(l.x, l.z, 8, ROADY + .02, 0x4ac8ff, 30); st.ring(l.x, l.z, 8, 9.2, ROADY + .03, 0xffffff, 30); lamp.sph(l.x + 2, ROADY + .5, l.z, .2, 0xffffff, 1);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 1, p = { x: l.x + Math.sin(a) * 8.4, z: l.z + Math.cos(a) * 8.4 }; st.sph(p.x, .4, p.z, 1.2 + (i % 2) * .5, 0x8a96a8, 1, 1, .8, 1, .15); W.addCircle(p.x, p.z, 1.3, false, 1.4); } W.spots.lagune = { x: l.x, z: l.z }; }
  /* Teppich-Basar (hinten links): gestreiftes Zelt */
  { const t = L(43, -22); for (let i = 0; i < 8; i++) st.prism(t.x, 3.4, t.z, 2.6, 2.4, 9.4, i % 2 ? 0xff8a1f : 0xfff0d6, ry + i * Math.PI / 8); st.box(t.x, 0, t.z, 8, 3.4, 8, 0xf4d9a8, ry); st.box(t.x - M.ux * 4.05, 0, t.z - M.uz * 4.05, 4, 3, .3, 0x3a2a4a, ry); W.addCircle(t.x, t.z, 5.3, false, 7); W.spots.basar = { x: t.x, z: t.z }; }
  /* Dschungelpfad (hinten rechts): Palmen, Farn, Bambus */
  { for (let i = 0; i < 12; i++) { const a = rn() * TAU, d = 3 + rn() * 12, p = L(41 + Math.sin(a) * d, 26 + Math.cos(a) * d), h = 5 + rn() * 3; if (Math.hypot(p.x - L(36, 24).x, p.z - L(36, 24).z) < 3.2) continue; st.cyl(p.x, 0, p.z, .2, .32, h, 0x8a6a3a, 6); for (let f = 0; f < 5; f++) { const a2 = f / 5 * TAU; st.box(p.x + Math.sin(a2) * 1.1, h - .2, p.z + Math.cos(a2) * 1.1, 2.4, .12, .7, 0x3fae4a, a2); } W.addCircle(p.x, p.z, .5, false, 6); } W.spots.dschungel = L(38, 24); }
  /* Blumen, Märchenbäume, Laternen */
  for (let i = 0; i < 40; i++) { const a = rn() * TAU, d = 24 + rn() * (M.R - 32), x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d; let near = false; for (const q of Object.values(W.spots.maerchenKeep || [])) if (Math.hypot(x - q.x, z - q.z) < 6) near = true; if (near || Math.hypot(x - M.entry.x, z - M.entry.z) < 12) continue;
    const loc = ((x - M.x) * M.ux + (z - M.z) * M.uz), lb = (-(x - M.x) * M.uz + (z - M.z) * M.ux); if (Math.abs(lb) < 5 && loc < 18) continue; if (Math.hypot(loc - 28, lb) < 14 || Math.hypot(loc - 10, lb + 34) < 14 || Math.hypot(loc - 8, lb - 34) < 12 || Math.hypot(loc + 30, lb + 41) < 12 || Math.hypot(loc + 28, lb - 31) < 12 || Math.hypot(loc - 43, lb + 22) < 9 || Math.hypot(loc - 40, lb - 24) < 16 || Math.hypot(loc + 12, lb) < 14) continue;
    const h = 2.6 + rn() * 1.6; st.cyl(x, 0, z, .22, .32, h, 0x8a5a7a, 6); st.sph(x, h + 1.1, z, 1.5 + rn() * .5, [0xff9ad5, 0xb48aff, 0x7fe0ff, 0xffe08a][i % 4], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, p = L(-12 + Math.sin(a) * 11, Math.cos(a) * 11); st.cyl(p.x, 0, p.z, .08, .1, 3.4, 0x5a4a7a, 6); lamp.sph(p.x, 3.6, p.z, .3, 0xfff3b0, 1); }
};

BI.createMaerchen = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, M = BI.MAERCHEN, L = M.at, S = () => (save.maerchen || (save.maerchen = { visit: 0, wishes: 0, talked: {}, played: 0 }));
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#6a2a7a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff6c8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  { const g = W.spots.maerchenGate; sign('✨ Märchenland ✨', g.x, g.y, g.z, 12); }
  { const p = L(28, 0); sign('🏰 Schloss Sternenglanz', p.x, 27, p.z, 11); } { const p = W.spots.eis; sign('❄️ Frostgipfel', p.x, 12, p.z, 6); } { const p = W.spots.fels; sign('🦁 Königsfels', p.x, 11.5, p.z, 6); } { const p = W.spots.schiff; sign('🏴‍☠️ Salzige Möwe', p.x, 14.5, p.z, 6); }
  { const p = W.spots.lagune; sign('🧜 Perlenlagune', p.x, 5, p.z, 6); } { const p = W.spots.basar; sign('🪔 Teppich-Basar', p.x, 8.5, p.z, 6); } { const p = W.spots.dschungel; sign('🌴 Dschungelpfad', p.x, 9, p.z, 6); } { const p = W.spots.wunsch; sign('⭐ Wunschbrunnen', p.x, 5.4, p.z, 5.5); }
  /* fliegender Teppich + Glühfeen (instanziert) + Mäuserich Willi am Tor */
  const carpet = (() => { const b = new BI.Batch(); b.box(0, 0, 0, 3.2, .12, 1.8, 0x8a2ad8); b.box(0, .12, 0, 2.8, .04, 1.4, 0xffd23f); for (const sd of [-1, 1]) b.box(sd * 1.7, 0, 0, .1, .1, 1.8, 0xffd23f); const m = b.mesh(BI.mat()); const p = W.spots.basar; const q = { x: p.x + M.ux * 6.5, z: p.z + M.uz * 6.5 }; m.position.set(q.x, 1.2, q.z); m.rotation.y = Math.atan2(M.ux, M.uz) + Math.PI / 2; scene.add(m); m._q = q; return m; })();
  const orbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.22, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff7b0, fog: false }), 14), dm = new THREE.Object3D(); orbs.frustumCulled = false; scene.add(orbs);
  let willi = null; try { willi = BI.makeWilli(); const g = W.spots.maerchenGate, p = L(-44, -6); willi.root.scale.setScalar(1.5); willi.root.position.set(p.x, 0, p.z); willi.root.rotation.y = Math.atan2(g.x - p.x, g.z - p.z) + .6; scene.add(willi.root); sign('Willi', p.x, 3.9, p.z, 3); } catch (e) { willi = null; }
  /* Figuren */
  K.people = function (folk) {
    const mk = (a, b, look, name, lines, face) => { const p = L(a, b), c = BI.makeChar(look), f = face ? L(face[0], face[1]) : L(-12, 0), h = Math.atan2(f.x - p.x, f.z - p.z); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    mk(17.5, 3.6, { shirt: 0x6ad0ff, pants: 0xffffff, hair: 0xf7e08a, skin: 0xf6d2b0, hat: 'crown', style: 'long', dress: true, scale: 1.0 }, 'Prinzessin Lilia', ['Hallo, ich bin Lilia! Willkommen im Märchenland. ✨', 'Mein Schloss heißt Sternenglanz. Es funkelt jede Nacht.', 'Wünsch dir etwas am Wunschbrunnen! ⭐', 'Besuche meine Freunde auf der ganzen Insel.']);
    mk(8, -29, { shirt: 0xcfeeff, pants: 0xe8f6ff, hair: 0xf2f8ff, skin: 0xf6e4d8, hat: 'none', style: 'long', dress: true, scale: 1.0 }, 'Eisfee Frida', ['Brr, schön kühl hier! ❄️', 'Aus meinen Händen wird Eis. Schau, wie es glitzert!', 'Mein Freund Olli der Schneemann liebt Umarmungen.'], [10, -34]);
    mk(10, -21.5, { shirt: 0xffffff, pants: 0xffffff, hair: 0x555555, skin: 0xffffff, hat: 'cap', style: 'short', scale: .8 }, 'Olli der Schneemann', ['Hallo! Ich bin Olli. Ich schmelze nie. Fast nie. ⛄', 'Hast du eine Möhre für mich?'], [4, -10]);
    mk(8, 28.5, { shirt: 0xe8453c, pants: 0x5a3a1a, hair: 0xe0a030, skin: 0xe8b070, hat: 'cat', style: 'curly', cape: true, scale: 1.12 }, 'Löwenkönig Leo', ['Ich bin Leo, der König vom Königsfels! Rooaar! 🦁', 'Ein König beschützt seine Freunde.', 'Von meinem Felsen sieht man die ganze Insel.'], [8, 34]);
    mk(-30, -35, { shirt: 0xc23a3a, pants: 0x2a2a3a, hair: 0x222222, skin: 0xd8a070, hat: 'pirate', style: 'short', beard: 5, beardc: 0x222222, scale: 1.05 }, "Käpt'n Kralle", ['Ahoi! Ich bin Käpt\'n Kralle. 🏴‍☠️', 'Mein Schiff heißt Salzige Möwe.', 'Wir suchen den goldenen Schatz. Hilfst du mit?'], [-30, -41]);
    mk(-24, 25.5, { shirt: 0x35d6e0, pants: 0x2fa8b8, hair: 0xe8453c, skin: 0xf6d2b0, hat: 'none', style: 'long', dress: true, scale: .96 }, 'Meerjungfrau Marina', ['Blubb! Ich bin Marina. 🧜', 'In der Lagune finde ich Perlen und Muscheln.', 'Das Wasser hier ist ganz warm.'], [-28, 31]);
    mk(41, -15.5, { shirt: 0x8a2ad8, pants: 0xffe08a, hair: 0x222222, skin: 0xc89060, hat: 'party', style: 'short', beard: 3, beardc: 0x222222, scale: 1.0 }, 'Teppich-Tom', ['Willkommen im Basar! Mein Teppich kann fliegen. ✨', 'Schau, er schwebt ganz von allein!', 'Alles Gute kommt von oben.'], [43, -22]);
    mk(34.5, 24, { shirt: 0xe0a060, pants: 0x8a5a33, hair: 0x6b4a2a, skin: 0xc8905a, hat: 'bear', style: 'short', scale: 1.15 }, 'Bär Bruno', ['Brumm! Ich bin Bruno der Bär. 🐻', 'Ich esse am liebsten Honig.', 'Im Dschungel gibt es leckere Beeren.'], [38, 24]);
  };
  /* Nähe / Aktion: Wunschbrunnen */
  K.near = function () { if (P.veh || P.y > 1.5) return null; const w = W.spots.wunsch; if (Math.hypot(P.x - w.x, P.z - w.z) < 5.2) return { k: 'mwish' }; return null; };
  K.act = function (n) {
    if (!n || n.k !== 'mwish') return; const s = S(), w = W.spots.wunsch; s.wishes++; fx.burst(w.x, 3.2, w.z, 30, [[1, .9, .5], [1, 1, 1], [1, .6, .9], [.5, .8, 1]], 5, 1.4, 28, -1); A.star && A.star();
    if (s.wishes <= 3) { G.addStars(1); say('⭐ Dein Wunsch wurde gehört! +1 ⭐', 3200); } else say('✨ Dein Wunsch glitzert in den Sternen.', 2600); A.speak && A.speak('Dein Wunsch wurde gehört.'); persist();
  };
  /* Frame: Begrüßung, Teppich schweben, Glühfeen kreisen, Feuerwerk über dem Schloss */
  let was = false, fireT = 4;
  K.update = function (dt, t) {
    const d0 = Math.hypot(P.x - M.x, P.z - M.z), ins = d0 < M.R + 12;
    if (ins !== was) { was = ins; if (ins) { const s = S(); if (!s.visit) { s.visit = 1; persist(); G.addStars(1); say('✨ Willkommen im Märchenland! +1 ⭐', 3600); } else say('✨ Märchenland', 2000); } }
    const near = d0 < 260; orbs.visible = carpet.visible = near; if (!near) return;
    carpet.position.y = 1.2 + Math.sin(t * 1.6) * .35; carpet.rotation.z = Math.sin(t * 1.1) * .06; const cp = L(28, 0);
    for (let i = 0; i < 14; i++) { const a = t * .35 + i * 0.45, r = 9 + (i % 4) * 2.6, y = 6 + Math.sin(t * 1.3 + i) * 2 + (i % 5) * 2; dm.position.set(cp.x + Math.sin(a) * r, y, cp.z + Math.cos(a) * r); dm.scale.setScalar(.8 + .3 * Math.sin(t * 4 + i)); dm.updateMatrix(); orbs.setMatrixAt(i, dm.matrix); } orbs.instanceMatrix.needsUpdate = true;
    if (ins) { fireT -= dt; if (fireT <= 0) { fireT = 7 + Math.random() * 5; const x = cp.x + (Math.random() - .5) * 14, z = cp.z + (Math.random() - .5) * 14, cols = [[[1, .8, .3], [1, 1, 1]], [[1, .4, .7], [1, 1, 1]], [[.4, .8, 1], [1, 1, 1]]][(Math.random() * 3) | 0]; fx.burst(x, 36 + Math.random() * 6, z, 36, cols, 7, 1.6, 34, 3); A.pop && A.pop(); } }
    if (G.mini && G.mini().active && G.mini().kind === 'sterne_maerchen') { const s = S(); if (!s.played) { s.played = 1; persist(); } }
  };
  K.log = () => { const s = S(); return { title: '✨ Märchenland', count: ((s.visit ? 1 : 0) + Math.min(3, s.wishes) + (s.played ? 1 : 0)) + ' von 5', rows: [
    { ok: !!s.visit, icon: '🏰', text: 'Märchenland besuchen (Brücke im Nordwesten)', dest: 'maerchen' },
    { ok: s.wishes >= 1, icon: '⭐', text: 'Am Wunschbrunnen einen Wunsch tun: ' + Math.min(3, s.wishes) + ' von 3 (je +1 ⭐)', dest: 'maerchen' },
    { ok: !!s.played, icon: '🌠', text: 'Sternschnuppen am Spielautomaten fangen', dest: 'maerchen' }] }; };
  return K;
};

'use strict';
/* Bunte Insel – Bauland (Erweiterung): eine riesige Insel (Radius 150 m, etwa dreimal so groß wie die anderen Welten) nordöstlich der Hauptinsel
   zum freien Bauen und Austoben. Eine Brücke führt von der Hauptinsel hinüber. Hier gibt es zwei Bauarten:
   • Bauteile (wie bei den Sims): Wände, Möbel, Garten … im 4-m-Raster (js/build.js) – auch hier erlaubt
   • Blöcke (Minecraft-/Roblox-Mix): 1-m-Würfel stapeln, begehen, abbauen; Spezialblöcke (js/voxel.js)
   Highlight-Spiel: „Pixel-Plan“ (Merkspiel, siehe minis2.js). Alles in der Welt ist selbst erfunden. */
(function () {
  const R = 150, cx = 277, cz = -233, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Bauland
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  BI.BAULAND = {
    x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 18), z: cz - uz * (R - 18) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 9, ry: Math.atan2(ux, uz) }
  };
})();

/* ---------- Boden, Brücke, Tor, Plaza, Beispielbauten, Bäume (statisch) ---------- */
BI.buildBaulandGround = function (c) {
  const { W, st, lamp, ROADY } = c, B = BI.BAULAND, TAU = Math.PI * 2, rn = BI.rng(1717), BR = B.bridge, px = -B.uz, pz = B.ux; // (px,pz) = quer zur Brücke
  W.bauland = B; W.spots.bauland = { x: B.entry.x, z: B.entry.z };
  st.disc(B.x, B.z, B.R + 9, 0, 0x7fd66b, 96); st.ring(B.x, B.z, B.R - 5, B.R + 9, .012, 0xf1e3b0, 96);
  /* Schachbrett-Raster (16 m) hilft beim Orientieren */
  for (let i = -9; i < 9; i++) for (let j = -9; j < 9; j++) { if ((i + j) & 1) continue; const x0 = B.x + i * 16, z0 = B.z + j * 16; if (Math.hypot(x0 + 8 - B.x, z0 + 8 - B.z) > B.R - 14) continue; st.rect(x0, z0, x0 + 16, z0 + 16, ROADY, 0x86dc72); }
  /* Brücke: Holzplanken, Geländer mit Laternen */
  st.strip(BR.mx, BR.mz, BR.w, BR.L, BR.ry, ROADY, 0x9a6b3d); for (let t = -BR.L / 2 + 1; t < BR.L / 2; t += 2) st.strip(BR.mx + B.ux * t, BR.mz + B.uz * t, BR.w, .1, BR.ry + Math.PI / 2, ROADY + .01, 0x7a5230);
  for (const sd of [-1, 1]) { const ox = px * sd * 4.6, oz = pz * sd * 4.6; st.box(BR.mx + ox, 0, BR.mz + oz, .3, 1.1, BR.L, 0xc8a27a, BR.ry); st.box(BR.mx + ox, 1.1, BR.mz + oz, .4, .12, BR.L, 0xe8c99a, BR.ry);
    for (let t = -BR.L / 2 + 1; t <= BR.L / 2 - 1; t += 2) W.addCircle(BR.mx + ox + B.ux * t, BR.mz + oz + B.uz * t, .4, false, 1.3);
    for (let t = -BR.L / 2 + 6; t < BR.L / 2 - 3; t += 14) { st.cyl(BR.mx + ox + B.ux * t, 1.1, BR.mz + oz + B.uz * t, .08, .1, 2.2, 0x444a5a, 6); lamp.sph(BR.mx + ox + B.ux * t, 3.5, BR.mz + oz + B.uz * t, .3, 0xfff3b0, 1); } }
  for (let t = -BR.L / 2 + 5; t < BR.L / 2 - 3; t += 10) for (const sd of [-1, 1]) st.cyl(BR.mx + px * sd * 3.8 + B.ux * t, -1.6, BR.mz + pz * sd * 3.8 + B.uz * t, .45, .5, 1.62, 0x6b4a2a, 8);
  /* Eingangstor aus bunten Blöcken */
  { const gx = B.x - B.ux * (B.R - 4), gz = B.z - B.uz * (B.R - 4), COL = [0xe8453c, 0x3f8cff, 0xffd23f, 0x4cd07d, 0xa66bff, 0xff8a1f];
    for (const sd of [-1, 1]) { const ox = gx + px * sd * 8, oz = gz + pz * sd * 8; for (let k = 0; k < 7; k++) st.box(ox, k * 1.3, oz, 2.6, 1.3, 2.6, COL[(k + (sd > 0 ? 3 : 0)) % 6], BR.ry); W.addCircle(ox, oz, 1.9, false, 9); }
    for (let k = -4; k <= 4; k++) st.box(gx + px * k * 1.9, 9.1, gz + pz * k * 1.9, 2, 1.4, 2.6, COL[(k + 4) % 6], BR.ry);
    W.spots.baulandGate = { x: gx, y: 12.4, z: gz }; }
  /* Plaza mit Werkbank und Beispielbauten */
  const E = B.entry; st.disc(E.x, E.z, 14, ROADY + .01, 0xf0e4c8, 40); st.ring(E.x, E.z, 11, 12.4, ROADY + .02, 0xff8a1f, 40); st.ring(E.x, E.z, 8, 9.2, ROADY + .02, 0x3f8cff, 40);
  { const wx = E.x + B.ux * 7 + px * 4, wz = E.z + B.uz * 7 + pz * 4; st.box(wx, 0, wz, 3.4, 1.0, 1.4, 0x8a5a33, BR.ry); st.box(wx, 1.0, wz, 3.6, .14, 1.6, 0xc8a27a, BR.ry); st.box(wx - .8 * B.ux, 1.14, wz - .8 * B.uz, .5, .5, .5, 0xe8453c, BR.ry); st.box(wx + .6 * B.ux, 1.14, wz + .6 * B.uz, .4, .3, .9, 0x9aa0a8, BR.ry); st.cyl(wx + px * 1.1, 1.14, wz + pz * 1.1, .12, .12, .7, 0xffd23f, 6);
    W.addCircle(wx, wz, 1.6, false, 1.4); W.spots.baulandWerk = { x: wx, z: wz, fx: wx - B.ux * 1.6, fz: wz - B.uz * 1.6 }; }
  /* Beispielbauten zum Abschauen (seitlich der Plaza) */
  { const bx = E.x + B.ux * 24 - px * 20, bz = E.z + B.uz * 24 - pz * 20; // Pixelhaus
    st.box(bx, 0, bz, 8, 4.6, 7, 0xffe9a8, BR.ry); st.box(bx + B.ux * 3.6, 0, bz + B.uz * 3.6, 1.8, 3, .4, 0x8a5a33, BR.ry); st.prism(bx, 4.6, bz, 8.8, 3, 7.8, 0xc9524a, BR.ry + Math.PI / 2); for (const s of [-1, 1]) st.box(bx + B.ux * 3.6 + px * s * 2.4, 1.4, bz + B.uz * 3.6 + pz * s * 2.4, 1.4, 1.4, .3, 0xa8dcff, BR.ry); W.addCircle(bx, bz, 4.7, false, 7); }
  { const bx = E.x + B.ux * 24 + px * 20, bz = E.z + B.uz * 24 + pz * 20; // Pyramide aus Blöcken
    for (let k = 0; k < 6; k++) st.box(bx, k * 1.4, bz, 9.4 - k * 1.5, 1.4, 9.4 - k * 1.5, [0xe8d398, 0xf1d98a, 0xe0c98a][k % 3], BR.ry); W.addCircle(bx, bz, 4.5, false, 8.4); }
  { const bx = E.x + B.ux * 40, bz = E.z + B.uz * 40; // Treppenturm
    for (let k = 0; k < 8; k++) st.box(bx + px * (k - 4) * 1.6, 0, bz + pz * (k - 4) * 1.6, 1.6, 1.2 + k * 1.2, 1.6, [0xff5ab4, 0x4de0ff, 0x6bff8a, 0xfff04d][k % 4], BR.ry); W.addCircle(bx, bz, 7, false, 10); }
  /* Bäume und Felsen am Rand (Mitte bleibt frei zum Bauen) */
  for (let i = 0; i < 90; i++) { const a = rn() * TAU, d = B.R - 12 - rn() * 22, x = B.x + Math.sin(a) * d, z = B.z + Math.cos(a) * d; if (Math.hypot(x - E.x, z - E.z) < 34) continue;
    if (i % 5 === 4) { st.sph(x, .5, z, 1.2 + rn() * .8, 0x9aa0a8, 1, 1, .7, 1, .15); W.addCircle(x, z, 1.4, false, 1.2); continue; }
    const h = 2.2 + rn() * 1.4; st.cyl(x, 0, z, .24, .34, h, 0x6b4a2a, 6); st.sph(x, h + 1.1, z, 1.6 + rn() * .5, [0x4cb85a, 0x5ac966, 0x3fa84e, 0xe8b84a][i % 4], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  /* Laternen um die Plaza */
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, x = E.x + Math.sin(a) * 13, z = E.z + Math.cos(a) * 13; st.cyl(x, 0, z, .08, .1, 3.4, 0x444a5a, 6); lamp.sph(x, 3.6, z, .3, 0xfff3b0, 1); }
};

/* ---------- Laufzeit ---------- */
BI.createBauland = function (G) {
  const { scene, W, A, P, say, save, persist } = G, K = {}, B = BI.BAULAND;
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#7a3a00'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3c8'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.baulandGate; sign('🏗️ Willkommen im Bauland!', g.x, g.y, g.z, 12); const w = W.spots.baulandWerk; sign('🛠️ Werkbank – E zum Bauen', w.x, 3.4, w.z, 6); }
  K.near = function () { if (P.veh || P.y > 1.5) return null; const w = W.spots.baulandWerk; if (Math.hypot(P.x - w.x, P.z - w.z) < 3.2) return { k: 'bwerk' }; return null; };
  K.act = function (n) { if (n && n.k === 'bwerk') G.build(); };
  K.people = function (folk) {
    const E = B.entry, mk = (u, v, look, name, lines) => { const x = E.x + B.ux * u - B.uz * v, z = E.z + B.uz * u + B.ux * v, c = BI.makeChar(look), h = Math.atan2(E.x - x, E.z - z) + Math.PI * .5; c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    mk(5, 8.5, { shirt: 0xffb800, pants: 0x3d4a7a, hair: 0x6b4423, skin: 0xd8a070, hat: 'hard', style: 'braids', scale: 1.0 }, 'Baumeisterin Bea', ['Willkommen im Bauland! Hier darfst du bauen, so viel du willst. 🏗️', 'Tippe zuerst die Werkbank an oder drücke B. Dann wählst du Blöcke oder Bauteile.', 'Tippe auf den Boden oder auf einen Block: dort entsteht dein neuer Block. Mit ⛏ baust du ihn wieder ab.', 'Grüne Sprungblöcke katapultieren dich hoch – baue dir einen Parcours! Lava schickt dich zum Start zurück.', 'Mit dem Startblock 🚩 bestimmst du, wo du nach der Lava wieder landest.']);
    mk(2, -7, { shirt: 0x3fa0ff, pants: 0x222222, hair: 0x222222, skin: 0x8a5a33, hat: 'cap', style: 'curly', scale: .96 }, 'Bob Brummel', ['Ich baue gerade einen Turm bis in die Wolken! Naja, bis 32 Meter.', 'Tipp: Mit ▲ und ▼ kannst du die Höhe des Bauplatzes ändern – so baust du auch Brücken in der Luft.', 'Spiel mal „Pixel-Plan“ am Automaten – da muss man sich Bauplänen merken!']);
    mk(8, -3, { shirt: 0xff5ab4, pants: 0x4a3a7a, hair: 0xffe14a, skin: 0xf3c9a0, hat: 'party', style: 'pig', dress: true, scale: .62 }, 'Pixel', ['Ich habe eine Pyramide gebaut! Na gut, die da drüben war schon da. 🔺', 'Wenn du Mist baust: einfach ↶ drücken. Alles zurück!', 'Ich wünsche mir eine Rutsche aus Neon-Blöcken.']);
  };
  K.log = () => { const v = W.vox, placed = v ? v.placed : 0, ms = v ? v.ms() : 0; return { title: '🏗️ Bauland', count: ms + ' von 5', rows: [
    { ok: placed >= 25, icon: '🧱', text: 'Blöcke gebaut: ' + placed + ' (bei 25 / 100 / 300 / 1000 / 3000 gibt es ⭐)', dest: 'bauland' },
    { ok: !!BI.store.get('voxspawn', null), icon: '🚩', text: 'Startblock 🚩 setzen und draufstellen', dest: 'bauland' },
    { ok: !!(save.bauland && save.bauland.played), icon: '🕹️', text: 'Pixel-Plan am Spielautomaten spielen', dest: 'bauland' }] }; };
  return K;
};

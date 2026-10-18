'use strict';
/* Bunte Insel – Wald-Insel 🌲 (hier wird gekämpft): eigene große Insel hinter der Rätsel-Insel (Holzbrücke an der Nordküste).
   Hier – und nur hier (außer in der Arena) – darf gekämpft werden; der alte Verbotene Wald der Hauptinsel ist friedlich und hat ein Waldtor hierher, aber wie in einem Rollenspiel: Kampfstufe (Erfahrung), gekaufte Waffen,
   Schilde und Tränke (js/ausruestung.js). Fünf Lichtungen mit den Monstern aus den Welten (Rätsel-Insel, Schlüsselreich, Zotik, Trickfilm-Wüste, Schwammi-Bucht),
   je ein Wächter (Endgegner). In der Mitte das Waldlager: Waldhändlerin Fenja, Heilquelle, Lagerfeuer – dort greifen keine Monster an.
   Lokale Koordinaten (a, b): a = weg von der Rätsel-Insel (nach Norden), b = quer dazu. Teil-Insel der Rätsel-Insel (Story-Modus: gleiche Sperre). */
BI.WALD = (function () {
  const M = BI.RAETSEL, R = 100, ux = 0, uz = 1, cx = M.x, cz = M.z + M.R + 28 + R;
  const A0 = { x: M.x, z: M.z + M.R - 4 }, A1 = { x: cx, z: cz - (R - 5) };
  const T = { id: 'wald', partOf: 'RAETSEL', x: cx, z: cz, R, ux, uz, entry: { x: cx, z: cz - (R - 12) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
  T.at = (a, b) => ({ x: cx + ux * a - uz * b, z: cz + uz * a + ux * b });
  T.loc = (x, z) => { const dx = x - cx, dz = z - cz; return { a: dx * ux + dz * uz, b: -dx * uz + dz * ux }; };
  T.camp = { a: -64, b: 0, r: 12 }; T.cross = { a: 8, b: 0 };
  /* Lichtungen: Monster aus den Welten und ihr Wächter (Endgegner) */
  T.ZONES = [
    { id: 'titan', icon: '🗿', name: 'Titanenkreis', from: 'Rätsel-Insel', a: -22, b: -50, r: 20, ground: 0x8a8272, mobs: ['blob', 'spike', 'mush'], boss: 'titan' },
    { id: 'schatten', icon: '🗝️', name: 'Schattenhain', from: 'Schlüsselreich', a: -22, b: 50, r: 20, ground: 0x3e3258, mobs: ['wichtel', 'wichtel', 'blob'], boss: 'riese' },
    { id: 'mond', icon: '🌙', name: 'Mondlichtung', from: 'Zotik', a: 32, b: -48, r: 20, ground: 0x34467e, mobs: ['moos', 'wolf', 'frost', 'lava'], boss: 'mondwolf' },
    { id: 'tinte', icon: '🎬', name: 'Tintenschlucht', from: 'Trickfilm-Wüste', a: 32, b: 48, r: 20, ground: 0xefe9da, mobs: ['klecks', 'kaeferbot', 'verduenner', 'skizze'], boss: 'tintenriese' },
    { id: 'meer', icon: '🫧', name: 'Muschelstrand', from: 'Schwammi-Bucht', a: 66, b: 0, r: 20, ground: 0xf0dca0, mobs: ['plankto', 'plankto', 'spike'], boss: 'planktobot' }
  ];
  T.zoneAt = (x, z) => { const p = T.loc(x, z); for (const Z of T.ZONES) if (Math.hypot(p.a - Z.a, p.b - Z.b) < Z.r + 4) return Z; return null; };
  T.inCamp = (x, z) => { const p = T.loc(x, z); return Math.hypot(p.a - T.camp.a, p.b - T.camp.b) < T.camp.r + 2; };
  T.onIsle = (x, z, m) => Math.hypot(x - cx, z - cz) < R + (m || 0);
  return T;
})();

BI.buildWaldGround = function (c) {
  const { W, st, lamp, ROADY } = c, T = BI.WALD, L = T.at, TAU = Math.PI * 2, rn = BI.rng(5150);
  W.spots.waldinsel = { x: T.entry.x, z: T.entry.z }; W.wald = T;
  st.disc(T.x, T.z, T.R + 9, 0, 0x4f7a44, 96); st.ring(T.x, T.z, T.R - 4, T.R + 9, .012, 0xd8cc98, 96);
  BI.buildIsleBridge(c, T);
  const dsk = (a, b, r, col, y) => { const p = L(a, b); st.disc(p.x, p.z, r, y || ROADY + .004, col, 40); return p; };
  const path = (a0, b0, a1, b1, w) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), q0 = L(a0, b0), q1 = L(a1, b1); st.strip(p.x, p.z, w || 3.2, Math.hypot(a1 - a0, b1 - b0), Math.atan2(q1.x - q0.x, q1.z - q0.z), ROADY + .002, 0xb89a6a); };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 3); return p; };
  /* Wege: Brücke → Lager → Kreuzweg → Lichtungen */
  const C = T.camp, X = T.cross; path(-T.R + 2, 0, C.a, 0); path(C.a, 0, X.a, 0);
  for (const Z of T.ZONES) path(X.a, X.b, Z.a, Z.b, 3);
  const segD = (a, b, a0, b0, a1, b1) => { const dx = a1 - a0, db = b1 - b0, t = Math.max(0, Math.min(1, ((a - a0) * dx + (b - b0) * db) / (dx * dx + db * db))); return Math.hypot(a - a0 - t * dx, b - b0 - t * db); };
  const onPath = (a, b) => segD(a, b, -T.R, 0, X.a, 0) < 4.5 || T.ZONES.some(Z => segD(a, b, X.a, X.b, Z.a, Z.b) < 4);
  /* Dichter Wald (einfache Bäume: wenige Dreiecke) */
  for (let i = 0, n = 0; i < 900 && n < 190; i++) {
    const g = rn() * TAU, d = Math.sqrt(rn()) * (T.R - 5), a = Math.cos(g) * d, b = Math.sin(g) * d;
    if (Math.hypot(a - C.a, b - C.b) < C.r + 4 || Math.hypot(a - X.a, b - X.b) < 9 || T.ZONES.some(Z => Math.hypot(a - Z.a, b - Z.b) < Z.r + 2) || onPath(a, b)) continue;
    const p = L(a, b), h = 4 + rn() * 3, pine = rn() < .55, col = [0x2d6245, 0x355a3e, 0x3b6847, 0x2a5a3a][n % 4];
    st.cyl(p.x, 0, p.z, .22, .32, h * .5, 0x6b4a2a, 6);
    if (pine) { st.cone(p.x, h * .3, p.z, 1.6, h * .5, col, 7); st.cone(p.x, h * .62, p.z, 1.1, h * .42, col + 0x0a0a0a, 7); }
    else { st.sph(p.x, h * .72, p.z, 1.7, col, 0, 1, .85, 1); st.sph(p.x + .5, h * .9, p.z - .3, 1.0, col + 0x0a140a, 0); }
    W.addCircle(p.x, p.z, .55, false, 3); BI.isleTree(p.x, p.z, h); n++;
  }
  /* Waldlager (sicher): Lagerfeuer, Zelt, Holzbänke, Stand der Händlerin, Heilquelle */
  { dsk(C.a, C.b, C.r, 0x9a8a5a); const f = L(C.a + 2, 0); st.ring(f.x, f.z, .9, 1.4, ROADY + .05, 0x8a8f99, 12); st.disc(f.x, f.z, .9, ROADY + .04, 0x2b2b30, 12); W.addCircle(f.x, f.z, 1.3, false, .6);
    for (let k = 0; k < 3; k++) { const g = k / 3 * TAU + .5, q = L(C.a + 2 + Math.cos(g) * 3.2, Math.sin(g) * 3.2); st.box(q.x, 0, q.z, 2, .45, .5, 0x8a5a33, g); W.addCircle(q.x, q.z, .6, false, .5); }
    const t = L(C.a - 5, -6); st.prism(t.x, 0, t.z, 3.6, 2.6, 3.4, 0x3fa84e, 0); W.addBox(t.x - 1.8, t.z - 1.7, t.x + 1.8, t.z + 1.7, false, 2.4);
    const s = L(C.a - 3, 6.5); st.box(s.x, 0, s.z, 3.4, .9, 1.2, 0x9a6a3a); st.box(s.x, 2.4, s.z, 3.8, .2, 1.8, 0xe0382b); for (const dx of [-1.6, 1.6]) st.box(s.x + dx, 0, s.z, .15, 2.4, .15, 0x6b4a2a); W.addBox(s.x - 1.7, s.z - .6, s.x + 1.7, s.z + .6, false, 1);
    for (let k = 0; k < 3; k++) st.sph(s.x - 1 + k, 1.05, s.z, .2, [0xe0382b, 0x3f8cff, 0xffd23f][k], 1);
    const q = L(C.a + 6, -6); st.disc(q.x, q.z, 2.2, ROADY + .03, 0x9fe3ff, 24); st.ring(q.x, q.z, 2.2, 2.7, ROADY + .04, 0xc9ccdc, 24); lamp.sph(q.x, .9, q.z, .35, 0xbff6ff, 1);
    for (const k of [-1, 1]) { const l = L(C.a + C.r - 1, k * 3.5); st.cyl(l.x, 0, l.z, .08, .1, 2.6, 0x444a5a, 6); lamp.sph(l.x, 2.8, l.z, .3, 0xfff3b0, 1); }
    W.spots.waldCamp = L(C.a, 0); W.spots.waldShop = L(C.a - 3, 4.8); W.spots.waldQuelle = q; }
  /* Kreuzweg mit Wegweiser */
  { const p = dsk(X.a, X.b, 7, 0x8a7a52); st.cyl(p.x, 0, p.z, .12, .14, 3, 0x6b4a2a, 6); W.addCircle(p.x, p.z, .4, false, 3); W.spots.waldCross = p; }
  /* Lichtungen */
  for (const Z of T.ZONES) {
    const p = dsk(Z.a, Z.b, Z.r, Z.ground); W.spots['wald_' + Z.id] = p;
    if (Z.id === 'titan') { for (let k = 0; k < 8; k++) { const g = k / 8 * TAU, x = p.x + Math.sin(g) * (Z.r - 3), z = p.z + Math.cos(g) * (Z.r - 3); st.cyl(x, 0, z, .8, 1, 3.6, 0x9a96a0, 8); st.box(x, 3.6, z, 2, .5, 2, 0xb0aab8, g); W.addCircle(x, z, 1, false, 4); } st.box(p.x, 0, p.z, 1.6, 2.2, .7, 0x6a6a7a); lamp.sph(p.x, 1.6, p.z + .36, .25, 0xff8a3a, 1); W.addCircle(p.x, p.z, 1.1, false, 2.2); }
    else if (Z.id === 'schatten') { for (let k = 0; k < 10; k++) { const g = rn() * TAU, r = 6 + rn() * (Z.r - 8), x = p.x + Math.sin(g) * r, z = p.z + Math.cos(g) * r; st.cone(x, 0, z, .5, 1.6 + rn() * 1.6, 0x6a3ab8, 5); lamp.sph(x, .3, z, .18, 0xb48aff, 1); W.addCircle(x, z, .5, false, 2); } }
    else if (Z.id === 'mond') { for (let k = 0; k < 9; k++) { const g = rn() * TAU, r = 5 + rn() * (Z.r - 7), x = p.x + Math.sin(g) * r, z = p.z + Math.cos(g) * r; st.cone(x, 0, z, .45, 1.4 + rn() * 1.4, [0x9fd8ff, 0xffffff, 0xb48aff][k % 3], 5); W.addCircle(x, z, .45, false, 2); } lamp.sph(p.x, 6, p.z, 1.2, 0xfff6d0, 1); }
    else if (Z.id === 'tinte') { for (let k = 0; k < 9; k++) { const g = rn() * TAU, r = 3 + rn() * (Z.r - 5); st.disc(p.x + Math.sin(g) * r, p.z + Math.cos(g) * r, .8 + rn() * 1.4, ROADY + .01, 0x15121e, 16); } for (let k = 0; k < 5; k++) { const g = k / 5 * TAU + .3, x = p.x + Math.sin(g) * (Z.r - 4), z = p.z + Math.cos(g) * (Z.r - 4); st.box(x, 0, z, 1.6, 2.2, .1, 0xfafafa, g); st.box(x, 2.2, z, 1.7, .08, .14, 0x222222, g); W.addCircle(x, z, .8, false, 2.2); } }
    else if (Z.id === 'meer') { for (let k = 0; k < 10; k++) { const g = rn() * TAU, r = 4 + rn() * (Z.r - 6), x = p.x + Math.sin(g) * r, z = p.z + Math.cos(g) * r; if (k % 2) { st.cone(x, 0, z, .4, 1.3 + rn(), [0xff7a8a, 0xffa04a, 0xff5ab0][k % 3], 5); W.addCircle(x, z, .4, false, 1.5); } else st.sph(x, .12, z, .3, [0xffd6e0, 0xfff0d0][k % 2], 0, 1, .5, 1); } st.disc(p.x + 6, p.z + 5, 3.2, ROADY + .02, 0x6ac8ff, 24); }
  }
};

BI.createWald = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, T = BI.WALD, L = T.at, K = {};
  const S = () => { const s = save.wald || (save.wald = {}); s.visit |= 0; s.zb = s.zb || {}; s.seen = s.seen || {}; return s; };
  const sign = (text, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = 'rgba(30,40,20,.82)'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#ffd23f'; c.lineWidth = 8; c.strokeRect(4, 4, 504, 120); c.fillStyle = '#fff'; let f = 54; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; while (c.measureText(text).width > 480 && f > 20) { f -= 2; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 66);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); s.scale.set(w, w / 4, 1); s.position.set(x, y, z); scene.add(s); return s; };
  { const e = L(-T.R + 6, 0); sign('🌲 Wald-Insel – hier wird gekämpft!', e.x, 4.2, e.z, 7); const c = W.spots.waldCamp; sign('🏕️ Waldlager (sicher)', c.x, 4.4, c.z, 5.6); const x = W.spots.waldCross; sign('🧭 Kreuzweg', x.x, 3.8, x.z, 4);
    for (const Z of T.ZONES) { const p = W.spots['wald_' + Z.id]; sign(Z.icon + ' ' + Z.name, p.x, 5.2, p.z, 5.6); } }
  /* Waldhändlerin Fenja am Stand */
  const shop = W.spots.waldShop, fenja = BI.makeChar({ shirt: 0x3fa84e, pants: 0x6b4a2a, hair: 0xc8642a, skin: 0xf3c9a0, style: 'braids', hat: 'none', name: 'Waldhändlerin Fenja', scale: 1 });
  fenja.group.position.set(shop.x, 0, shop.z + 1.2); fenja.group.rotation.y = Math.PI; scene.add(fenja.group); W.addCircle(shop.x, shop.z + 1.2, .5, false, 2);
  const near = (q, r) => q && Math.hypot(P.x - q.x, P.z - q.z) < r;
  /* Waldtor: der alte Verbotene Wald der Hauptinsel führt jetzt hierher (dort wird nicht mehr gekämpft) */
  const FO = W.spots.forest, back = L(-T.R + 8, 3);
  if (FO) { const g = new THREE.Mesh(new THREE.TorusGeometry(1.5, .2, 8, 24), new THREE.MeshBasicMaterial({ color: 0x7affc8 })), g2 = g.clone(); g.position.set(FO.gx, 1.8, FO.gz); g.rotation.y = FO.ang || 0; g2.position.set(back.x, 1.8, back.z); scene.add(g, g2); }
  function beam(x, z, msg) { fx.burst(P.x, 1.2, P.z, 18, [BI.C.white, BI.C.green || BI.C.blue, BI.C.gold], 4, 1, 28, 4); const q = W.resolve(x, z, .6, {}); P.x = q.x; P.z = q.z; P.y = 0; P.vy = 0; A.star && A.star(); say(msg, 3600); }
  K.near = function () {
    if (P.veh) return null;
    if (FO && Math.hypot(P.x - FO.gx, P.z - FO.gz) < 4.5) return { k: 'wtor', label: ['🌀', 'Waldtor zur Wald-Insel'] };
    if (Math.hypot(P.x - back.x, P.z - back.z) < 3) return { k: 'wback', label: ['🌀', 'Zurück zur Hauptinsel'] };
    if (!T.onIsle(P.x, P.z, 4)) return null;
    if (near({ x: shop.x, z: shop.z - 1.4 }, 3)) return { k: 'wshop', label: ['🎒', 'Ausrüstung kaufen'] };
    if (near(W.spots.waldQuelle, 3.4)) return { k: 'wquelle', label: ['💧', 'Heilquelle'] };
    return null;
  };
  K.act = function (n) {
    if (n.k === 'wtor') { const lk = G.locked && G.locked(T.entry.x, T.entry.z); if (lk) { say(G.reqText(lk), 6000); return; } const e = W.spots.waldinsel; return beam(e.x, e.z, '🌀 Das Waldtor bringt dich zur Wald-Insel – hier wird gekämpft!'); }
    if (n.k === 'wback') return beam(FO.gx + Math.sin(FO.ang || 0) * 3, FO.gz + Math.cos(FO.ang || 0) * 3, '🌀 Zurück am alten Wald der Hauptinsel.');
    if (n.k === 'wshop') { say('🧝 Fenja: „Willkommen, Waldläufer! Mit guter Ausrüstung sind die Wächter viel leichter.“', 3200); G.gear.show('Waldhändlerin Fenja'); }
    else if (n.k === 'wquelle') { G.heal && G.heal(); A.star && A.star(); fx.burst(P.x, 1.4, P.z, 24, [BI.C.blue, BI.C.white, BI.C.pink], 4, 1, 26, 4); say('💧 Das Quellwasser kitzelt – Herzen und Energie sind wieder voll!', 2600); }
  };
  let lastZone = null, visitT = 0;
  K.update = function (dt) {
    const on = T.onIsle(P.x, P.z, 2) && !P.veh; if (!on) { lastZone = null; return; }
    const s = S(); if (!s.visit) { s.visit = 1; persist(); G.earn && G.earn('wald_insel'); setTimeout(() => say('🌲 Willkommen auf der Wald-Insel! Im Lager ist es sicher – auf den Lichtungen warten Monster aus allen Welten.', 5200), 5000); }
    if ((visitT -= dt) > 0) return; visitT = .4;
    const Z = T.zoneAt(P.x, P.z); if (Z !== lastZone) { lastZone = Z; if (Z) { s.seen[Z.id] = 1; say(Z.icon + ' ' + Z.name + ' – Monster aus ' + Z.from + (s.zb[Z.id] ? '. Den Wächter hast du schon besiegt! 🏆' : '. Besiege 8 Monster, dann kommt der Wächter!'), 3600); } }
  };
  K.bossDown = function (zid) { const s = S(); if (s.zb[zid]) return false; s.zb[zid] = 1; persist(); if (T.ZONES.every(Z => s.zb[Z.id])) { G.earn && G.earn('wald_held'); setTimeout(() => say('👑 Alle fünf Wächter besiegt – du bist der Held des Waldes!', 5200), 2600); } return true; };
  K.log = function () {
    const s = S(), lv = G.level ? G.level() : 1, g = save.gear || {}, rows = [
      { ok: !!s.visit, icon: '🌲', text: 'Wald-Insel besuchen (Holzbrücke an der Nordküste der Rätsel-Insel)', dest: 'waldinsel' },
      { ok: (g.own || []).length > 1 || !!g.amu, icon: '🎒', text: 'Bei Waldhändlerin Fenja Ausrüstung kaufen (Waffe, Schild oder Amulett)', dest: 'wald_lager' },
      { ok: lv >= 5, icon: '💪', text: 'Kampfstufe 5 erreichen (jetzt: Stufe ' + lv + ')', dest: 'waldinsel' }];
    for (const Z of T.ZONES) rows.push({ ok: !!s.zb[Z.id], icon: Z.icon, text: Z.name + ': den Wächter besiegen (Monster aus ' + Z.from + ')', dest: 'wald_' + Z.id });
    return { title: '🌲 Wald-Insel', count: rows.filter(r => r.ok).length + ' von ' + rows.length, rows };
  };
  K.cheatAll = function () { const s = S(); s.visit = 1; for (const Z of T.ZONES) s.zb[Z.id] = 1; persist(); };
  return K;
};

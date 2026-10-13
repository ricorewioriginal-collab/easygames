'use strict';
/* Bunte Insel – Innenräume 🚪 (Open-World-Prinzip): Gebäude in allen Welten sind betretbar und haben Inhalte.
   Jedes Gebäude hat eine Tür (BI.addDoor). An der Tür: „Hineingehen“ → ein eigener kleiner Innenraum (wird erst beim ersten Betreten gebaut, liegt weit draußen im Meer)
   mit Möbeln, Bewohner zum Reden und Dingen zum Mitmachen: Bett (ausruhen), Tisch (Snack), Bücherregal (Wissen), Schatztruhe (⭐ + Futter), je nach Gebäude Laden (einkaufen),
   Schmiede (hämmern), Fernrohr, Kristallkugel, Kamin, Höhle (Abstieg ins Mini-Spiel) … Alles läuft über W.dyn-freie Kollisionsboxen und eigene Wand-Flächen,
   die man nur von innen sieht (Puppenstuben-Ansicht, Kamera sieht nie eine Wand von außen). */
BI.DOORS = BI.DOORS || [];
/* spec: { x, z, h (Blickrichtung beim Rauskommen, Winkel), kind, name, isle } – (x,z) = Platz VOR der Tür */
BI.addDoor = function (d) { d.id = BI.DOORS.length; d.name = d.name || 'Haus'; BI.DOORS.push(d); return d; };
/* Tür-Helfer für Inseln mit lokalem Koordinatensystem at(a,b): door = Tür-Platz, from = Gebäudemitte → Blickrichtung weg vom Gebäude */
BI.doorAt = function (I, a, b, fa, fb, kind, name, isle) { const p = I.at(a, b), f = I.at(fa, fb); return BI.addDoor({ x: p.x, z: p.z, h: Math.atan2(p.x - f.x, p.z - f.z), kind, name, isle }); };
/* Tür-Helfer mit Weltkoordinaten: Gebäudemitte + Radius, Tür zeigt zu (tx,tz) */
BI.doorToward = function (cx, cz, r, tx, tz, kind, name, isle) { const dx = tx - cx, dz = tz - cz, l = Math.hypot(dx, dz) || 1; return BI.addDoor({ x: cx + dx / l * (r + 1.3), z: cz + dz / l * (r + 1.3), h: Math.atan2(dx, dz), kind, name, isle }); };
BI.INNEN_X = 3000; BI.INNEN_Z = 3000;
/* Tür an einem massiven Gebäude finden: vom Mittelpunkt (cx,cz) in Richtung (dx,dz) laufen, bis man aus der Kollision heraus ist; dort steht die Tür.
   Probiert 8 Richtungen (die gewünschte zuerst). Hohle/begehbare Gebäude (Mitte frei) bekommen keine Tür. */
BI.doorScan = function (W, cx, cz, dx, dz, kind, name, isle) {
  const a0 = Math.atan2(dx, dz);
  for (const da of [0, .785, -.785, 1.571, -1.571, 2.356, -2.356, 3.14]) {
    const g = a0 + da, ex = Math.sin(g), ez = Math.cos(g); let seen = false;
    for (let t = 0; t <= 14; t += .25) { const x = cx + ex * t, z = cz + ez * t; if (!W.free(x, z, .35)) seen = true; else if (seen) { const q = t + .8, X = cx + ex * q, Z = cz + ez * q; if (W.free(X, Z, .6) && BI.DOORS.every(o => Math.hypot(o.x - X, o.z - Z) > 2.6)) return BI.addDoor({ x: X, z: Z, h: g, kind, name, isle }); break; } }
  }
  return null;
};
/* Alle massiven Gebäude der Welten bekommen eine Tür (Open-World-Prinzip) – nach dem Bau aller Inseln aufrufen */
BI.registerDoors = function (W) {
  const lo = (I, a, b, da, db, kind, name, isle) => { const c = I.at(a, b), t = I.at(a + da, b + db); return BI.doorScan(W, c.x, c.z, t.x - c.x, t.z - c.z, kind, name, isle || I.id); };
  const wo = (x, z, kind, name, isle, tx, tz) => BI.doorScan(W, x, z, (tx == null ? 0 : tx) - x, (tz == null ? 0 : tz) - z, kind, name, isle);
  const R = BI.RAETSEL, S = BI.SCHLUESSEL, M = BI.MAERCHEN, Q = BI.SCHWAMM, B = BI.BADE;
  if (R) {
    for (const [a, b] of [[-58, -22], [-58, 22], [-44, -24], [-44, 24], [-30, -22], [-30, 22]]) lo(R, a, b, 0, b < 0 ? 1 : -1, 'haus', b > 0 && a === -30 ? 'Gasthaus' : 'Dorfhaus', 'raetsel');
    lo(R, -20, -36, 0, 1, 'schmiede', 'Schmiede', 'raetsel');
    const q = R.at(-40, 47), f = R.at(-40, 52); R.hoehleDoor = BI.addDoor({ x: q.x, z: q.z, h: Math.atan2(q.x - f.x, q.z - f.z), kind: 'hoehle', name: 'Uralte Höhle', isle: 'raetsel' });
  }
  if (S) {
    [[16, -50], [24, -50], [44, -50], [16, -18], [48, -34]].forEach(([a, b], i) => lo(S, a, b, -1, 0, 'haus', 'Haus ' + (i + 1), 'schluessel'));
    lo(S, 34, -44, 0, 1, 'turm', 'Uhrturm', 'schluessel'); lo(S, -56, 18, 1, 0, 'huette', 'Strandhütte', 'schluessel'); lo(S, 58, 14, -1, 0, 'schloss', 'Kristall-Burg', 'schluessel');
    [[0, 0], [8, 3], [-7, 5], [3, -9], [-4, -8]].forEach(([da, db], i) => lo(S, -42 + da, -46 + db, 0, 1, 'pilz', 'Pilzhaus ' + (i + 1), 'schluessel'));
  }
  if (BI.WUNSCH) { const Wn = BI.WUNSCH, h = Wn.P.hut; lo(Wn, h[0], h[1], -1, 0, 'huette', 'Strandhütte (Wunsch-Insel)', 'wunsch'); }
  if (BI.TASCHI) { const T = BI.TASCHI; lo(T, -38, 28, 0, -1, 'labor', 'Labor von Professor Ulme', 'taschi'); lo(T, -38, -28, 0, 1, 'heil', 'Taschi-Heilhaus', 'taschi'); { const fd = lo(T, -16, -30, 0, 1, 'laden', 'Taschi-Fangladen', 'taschi'); if (fd) fd.tshop = true; } }
  if (M) { lo(M, 66, -16, -1, 0, 'huette', 'Strandhütte', 'maerchen'); [[5, -33], [19, -33], [5, -41], [19, -41]].forEach(([a, b], i) => lo(M, a, b, 0, 1, 'zelt', ['Wahrsager-Zelt', 'Teppich-Zelt', 'Gewürz-Zelt', 'Lampen-Zelt'][i], 'maerchen')); }
  if (Q) { lo(Q, 14, -32, 0, 1, 'frucht', 'Ananas-Haus', 'schwamm'); lo(Q, 26, -32, 0, 1, 'stein', 'Stein-Haus', 'schwamm'); lo(Q, 38, -32, 0, 1, 'kopf', 'Steinkopf-Haus', 'schwamm'); lo(Q, -14, 34, 0, -1, 'eimer', 'Eimerchen', 'schwamm'); lo(Q, -44, 34, 0, -1, 'held', 'Heldenheim', 'schwamm'); lo(Q, -56, -20, 1, 0, 'huette', 'Strandhütte', 'schwamm'); }
  if (B) { const t = B.at(194, -5.5), k = B.at(184, 12); BI.doorScan(W, t.x, t.z, -B.ux, -B.uz, 'turm', 'Bademeister-Turm', 'bade'); BI.doorScan(W, k.x, k.z, -B.ux, -B.uz, 'laden', 'Eis-Kiosk', 'bade'); }
  wo(25, 385, 'haus', 'Mondhaus', 'zotik', 0, 330); wo(29, 413, 'huette', 'Kristallhütte', 'zotik', 0, 330); wo(31, 348, 'turm', 'Mondturm', 'zotik', 0, 330);
  wo(181, -179, 'haus', 'Bauhaus', 'bauland', 0, -150); wo(207, -148, 'huette', 'Bauhütte', 'bauland', 0, -150); wo(207, -174, 'werkstatt', 'Werkstatt-Haus', 'bauland', 0, -150);
  wo(246, 8, 'laden', 'Park-Büro', 'park', 200, 0); wo(-266, -162, 'haus', 'Hafenhaus', 'dampf', -230, -150); wo(-301, -135, 'kapitaen', 'Kapitänshaus', 'dampf', -270, -150); wo(240, 184, 'turm', 'Funkturm', 'radio', 200, 170);
  wo(-66, 60, 'turm', 'Wasserturm', 'insel', 0, 0); wo(162, -28, 'haus', 'Ferienhaus', 'insel', 100, 0); wo(-165, -11, 'huette', 'Bauernhütte', 'insel', -100, 0);
};

/* Türmatten und goldene Türrahmen (sichtbar, damit Kinder die Tür finden) – nach dem Bau aller Inseln aufrufen */
BI.buildDoorMarks = function (c) {
  const { st, lamp, W } = c; W.doors = BI.DOORS;
  for (const d of BI.DOORS) {
    st.disc(d.x, d.z, 1.1, .05, 0xffd23f, 16); st.disc(d.x, d.z, .75, .06, 0xfff0a0, 16);
    /* sichtbare Haustür an der Wand (Rahmen, Tür, Knauf, Fenster, Laterne, Stufe) – Wand liegt ca. .85 hinter dem Türplatz */
    const nx = Math.sin(d.h), nz = Math.cos(d.h), tx = nz, tz = -nx, wx = d.x - nx * .85, wz = d.z - nz * .85, col = [0x8a4a2a, 0x3a6ad8, 0xc23a3a, 0x2f9a5a][d.id % 4];
    st.box(wx, 0, wz, 2.3, 3.1, .22, 0xf6e6c8, d.h); st.box(wx + nx * .06, 0, wz + nz * .06, 1.8, 2.7, .2, col, d.h); st.box(wx + nx * .17, 1.3, wz + nz * .17, 1.1, 2.1, .06, col + 0x151515, d.h);
    st.sph(wx + nx * .24 + tx * .55, 1.25, wz + nz * .24 + tz * .55, .1, 0xffd23f, 0); lamp.sph(wx + nx * .3 + tx * 1.5, 2.6, wz + nz * .3 + tz * 1.5, .16, 0xfff3b0, 1); lamp.sph(wx + nx * .3 - tx * 1.5, 2.6, wz + nz * .3 - tz * 1.5, .16, 0xfff3b0, 1);
    st.box(wx + nx * .5, 0, wz + nz * .5, 2.2, .14, .7, 0xb8b0a0, d.h);
  }
};

BI.createInnen = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { inside: null, panel: null }, TAU = Math.PI * 2, XI = BI.INNEN_X, ZI = BI.INNEN_Z;
  const S = () => { const s = save.innen || (save.innen = {}); s.v = s.v || {}; s.c = s.c || {}; s.o = s.o || {}; return s; };
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const earn = id => G.earn && G.earn(id), stars = n => G.addStars(n), nr = (o, r) => o && Math.hypot(P.x - o.x, P.z - o.z) < r;
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const rooms = new Map(); /* id → Raum */
  const KIND = {
    haus: { w: 9, d: 8, wall: [0xf6e6c8, 0xe8d0b0, 0xd8e8d0, 0xf0d8e0], floor: [0xc89a5a, 0xb88a4a], title: '🏠' }, labor: { w: 11, d: 9, wall: [0xd8e8f0, 0xd8f0e0], floor: [0x9aa8b8], title: '🧪' }, kapitaen: { w: 10, d: 9, wall: [0xe8d8b8, 0xc8b090], floor: [0x8a5a3a], title: '⚓' }, werkstatt: { w: 10, d: 8, wall: [0xd0d8e0, 0xaeb8c4], floor: [0x888c94], title: '🛠️' }, huette: { w: 7, d: 6.4, wall: [0xc8a070, 0xb89060], floor: [0x9a6a3a], title: '🛖' },
    laden: { w: 11, d: 8, wall: [0xfff0c8, 0xd8f0e8], floor: [0xd0c8b0], title: '🛍️' }, schmiede: { w: 10, d: 8, wall: [0x9a9aa8, 0xb0a898], floor: [0x6a6a78], title: '⚒️' },
    turm: { w: 7.4, d: 7.4, wall: [0xc8c8d8, 0xd8c8c0], floor: [0xa8a8b8], title: '🗼' }, zelt: { w: 8.4, d: 7.4, wall: [0xff9ac0, 0xffb04a, 0x9a7af0], floor: [0xc84a6a], title: '⛺' },
    schloss: { w: 48, d: 38, wall: [0xe8d8f0, 0xc8d0f0], floor: [0xd8c8e8], title: '🏰' }, hoehle: { w: 10, d: 9, wall: [0x4a4658, 0x3a3648], floor: [0x6a6070], title: '🕳️' },
    pilz: { w: 7.4, d: 6.6, wall: [0xfff0d8, 0xffe0e8], floor: [0xf0c898], title: '🍄' }, frucht: { w: 9, d: 8, wall: [0xffe8a0, 0xffd080], floor: [0xd8a050], title: '🍍' },
    stein: { w: 7.4, d: 6.6, wall: [0xe8b0c0, 0xd89aaa], floor: [0xb88a7a], title: '🪨' }, kopf: { w: 8, d: 7, wall: [0x9ab8b0, 0x8aa8a0], floor: [0x6a8a80], title: '🗿' },
    heil: { w: 12, d: 9, wall: [0xffd6e0, 0xfff0f4], floor: [0xf6e8ec], title: '💖' },
    eimer: { w: 8.4, d: 7.4, wall: [0xaab4c4, 0x8a96a8], floor: [0x6a7686], title: '🪣' }, held: { w: 9, d: 8, wall: [0xe8f0fa, 0xd0e0f8], floor: [0x6a8ad8], title: '🦸' }
  };
  const NAMEN = [['Oma Berta', ['Komm rein, ich habe Kekse gebacken! 🍪', 'Hier ist es immer gemütlich.']], ['Opa Fritz', ['Setz dich doch! Ich erzähle dir von früher.', 'Früher gab es hier nur Wiese – heute gibt es Abenteuer! 🌍']], ['Lotta', ['Das ist mein Zimmer! Schau, mein Bett ist ganz weich. 🛏️', 'Spielst du mit mir?']], ['Bruno', ['Brumm! Willkommen in meinem Haus!', 'Im Regal stehen spannende Bücher. 📚']], ['Mia', ['Hallo! Hast du die Truhe gesehen? Da ist bestimmt etwas Schönes drin! 🎁', 'Ich sammle Muscheln.']], ['Tilo', ['Pssst, hier drin ist es schön ruhig. 🤫', 'Wenn du Hunger hast: Auf dem Tisch liegt ein Snack!']], ['Frieda', ['Ich putze jeden Tag! Und trotzdem wird es wieder bunt. 🧹', 'Besuch mich gern wieder!']], ['Jonas', ['Cool, dass du da bist! 😎', 'Hier drin ist mein Geheimversteck.']]];
  const TIPPS = ['📚 Im Verbotenen Wald hilft dein Kapselmonster beim Kämpfen.', '📚 In jeder Welt gibt es Schätze – schau in Häuser, Truhen und Höhlen!', '📚 Mit Sternen ⭐ kaufst du im Spielzeugladen tolle Sachen.', '📚 Im Meer kannst du schwimmen – überall am Strand!', '📚 Wenn du essen gehst, kannst du dir Burger für den Wald einpacken.', '📚 Freunde können mit dem Handy dein Controller sein – am Fernseher!', '📚 Rätsel-Insel: Bomben, Bogen und Haken lösen die Rätsel im Turm.', '📚 Das Märchenland hat einen Umzug – lauf mit!'];
  const SHOP = [['apple', '🍎', 'Apfel', 1], ['cookie', '🍪', 'Keks', 1], ['juice', '🧃', 'Saft', 1], ['cakeslice', '🍰', 'Kuchenstück', 2]];
  const sprite = (txt, y, w, x, z) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 50; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 9; c.strokeStyle = '#3a2a1a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3b0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, depthTest: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); sp.renderOrder = 9; return sp; };
  const floorTex = col => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), r = (col >> 16) & 255, g = (col >> 8) & 255, b = col & 255; for (let i = 0; i < 8; i++) { const k = .86 + (i % 3) * .07; c.fillStyle = `rgb(${r * k | 0},${g * k | 0},${b * k | 0})`; c.fillRect(0, i * 8, 64, 8); c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(0, i * 8, 64, 1); c.fillRect((i * 23) % 64, i * 8, 1, 8); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plane = (w, h, col, x, y, z, ry, rx) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); return m; };
  /* ---------- Raum bauen ---------- */
  function build(d) {
    const K0 = KIND[d.kind] || KIND.haus, rng = BI.rng(1000 + d.id * 17), idx = d.id, X0 = XI + (idx % 10) * 36, Z0 = ZI + Math.floor(idx / 10) * 36, hw = K0.w / 2, hd = K0.d / 2, H = 3.6, grp = new THREE.Group(), b = new BI.Batch(), items = [], pick = a => a[(rng() * a.length) | 0];
    const R = { d, X0, Z0, hw, hd, grp, items, npc: null, exit: { x: X0, z: Z0 + hd - .7 } }, wcol = pick(K0.wall), fcol = pick(K0.floor); scene.add(grp);
    /* Wände (nur von innen sichtbar), Boden, Tür, Fenster */
    grp.add(plane(K0.w, H, wcol, X0, H / 2, Z0 - hd, 0)); grp.add(plane(K0.w, H, wcol, X0, H / 2, Z0 + hd, Math.PI)); grp.add(plane(K0.d, H, wcol, X0 - hw, H / 2, Z0, Math.PI / 2)); grp.add(plane(K0.d, H, wcol, X0 + hw, H / 2, Z0, -Math.PI / 2));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(K0.w, K0.d), new THREE.MeshBasicMaterial({ map: floorTex(fcol) })); fl.material.map.repeat.set(K0.w / 2.5, K0.d / 2.5); fl.rotation.x = -Math.PI / 2; fl.position.set(X0, .01, Z0); grp.add(fl);
    grp.add(plane(K0.w, .3, 0x6a4a2a, X0, .15, Z0 - hd + .02, 0)); grp.add(plane(K0.w, .3, 0x6a4a2a, X0, .15, Z0 + hd - .02, Math.PI)); grp.add(plane(K0.d, .3, 0x6a4a2a, X0 - hw + .02, .15, Z0, Math.PI / 2)); grp.add(plane(K0.d, .3, 0x6a4a2a, X0 + hw - .02, .15, Z0, -Math.PI / 2));
    grp.add(plane(1.8, 2.7, 0x7a4a2a, X0, 1.35, Z0 + hd - .03, Math.PI)); grp.add(plane(1.5, 2.4, 0xc89a5a, X0, 1.25, Z0 + hd - .04, Math.PI)); { const kn = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffd23f })); kn.position.set(X0 + .5, 1.2, Z0 + hd - .1); grp.add(kn); }
    for (const sx of [-1, 1]) { grp.add(plane(1.5, 1.3, 0x9fe3ff, X0 + sx * hw * .5, 2.0, Z0 - hd + .03, 0)); grp.add(plane(1.7, .12, 0xffffff, X0 + sx * hw * .5, 1.35, Z0 - hd + .04, 0)); grp.add(plane(.12, 1.5, 0xffffff, X0 + sx * hw * .5, 2.0, Z0 - hd + .04, 0)); }
    const box = (x, z, w, dd, h, col, y0) => { b.box(x, y0 || 0, z, w, h, dd, col); }, solid = (x, z, w, dd, h) => { W.addBox(x - w / 2, z - dd / 2, x + w / 2, z + dd / 2, false, h); };
    const fur = (x, z, w, dd, h, col, y0) => { box(x, z, w, dd, h, col, y0); solid(x, z, w, dd, h + (y0 || 0)); };
    /* Außenkollision: Wände als Boxen */
    W.addBox(X0 - hw - 1, Z0 - hd - 1, X0 + hw + 1, Z0 - hd, false, 6); W.addBox(X0 - hw - 1, Z0 + hd, X0 + hw + 1, Z0 + hd + 1, false, 6); W.addBox(X0 - hw - 1, Z0 - hd, X0 - hw, Z0 + hd, false, 6); W.addBox(X0 + hw, Z0 - hd, X0 + hw + 1, Z0 + hd, false, 6);
    /* Teppich */ box(X0, Z0 + .3, hw * 1.0, hd * .8, .03, pick([0xc23a3a, 0x3a6ad8, 0x4cae5a, 0xb48aff]), .02); box(X0, Z0 + .3, hw * .85, hd * .66, .035, 0xfff0d0, .021);
    const it = (type, x, z, r, label, extra) => items.push(Object.assign({ type, x, z, r, label }, extra || {}));
    const bed = (x, z) => { fur(x, z, 2.1, 3.0, .55, 0x8a5a2a); box(x, z - .2, 1.9, 2.4, .25, pick([0xff8fc8, 0x7fb8ff, 0xffd23f]), .55); box(x, z - 1.15, 1.3, .6, .22, 0xffffff, .8); it('bed', x, z + 1.9, 1.7, ['🛏️', 'Ausruhen']); };
    const table = (x, z, food) => { fur(x, z, 1.8, 1.2, .8, 0xa86a3a); for (const sx of [-1, 1]) { box(x + sx * 1.4, z, .7, .7, .5, 0x8a5a2a); } if (food) { box(x - .3, z, .5, .5, .12, 0xfafafa, .8); box(x - .3, z, .3, .3, .25, 0xe0382b, .9); box(x + .4, z, .3, .3, .18, 0xffe27a, .8); it('table', x, z + 1.5, 1.7, ['🍽️', 'Snack nehmen']); } };
    const shelf = (x, z, wall) => { const w = wall === 'n' ? 2.6 : .7, dd = wall === 'n' ? .7 : 2.6; fur(x, z, w, dd, 2.3, 0x7a4a2a); for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) box(x + (wall === 'n' ? (j - 1.5) * .55 : 0), z + (wall === 'n' ? 0 : (j - 1.5) * .55), wall === 'n' ? .4 : .5, wall === 'n' ? .5 : .4, .4, [0xe0382b, 0x2f8cff, 0xffd23f, 0x4cd07d, 0xb48aff][(k + j) % 5], .3 + k * .55); it('shelf', x + (wall === 'e' ? -1.4 : wall === 'w' ? 1.4 : 0), z + (wall === 'n' ? 1.4 : 0), 1.8, ['📚', 'Lesen']); };
    const plant = (x, z) => { fur(x, z, .7, .7, .4, 0xc8703a); box(x, z, .5, .5, 1.1, 0x3fae4a, .4); box(x, z, 1.0, 1.0, .5, 0x4cc65a, 1.1); };
    const lamp = (x, z) => { box(x, z, .2, .2, 1.7, 0x6a6a7a); box(x, z, .6, .6, .5, 0xfff0a0, 1.7); solid(x, z, .5, .5, 2.2); };
    const chest = (x, z) => { fur(x, z, 1.4, .9, .8, 0x8a5a2a); box(x, z, 1.5, 1.0, .12, 0xc23a2a, .8); box(x, z + .46, .3, .12, .3, 0xffd23f, .35); const open = !!S().c[d.id]; it('chest', x, z + 1.3, 1.5, ['🎁', 'Truhe öffnen'], { open }); };
    const kind = d.kind;
    /* kleine Auswahl an Möbeln je Gebäude */
    if (kind === 'laden') {
      fur(X0, Z0 - hd + 1.6, hw * 1.5, .9, 1.1, 0xc98f55); box(X0, Z0 - hd + 1.6, hw * 1.55, 1.0, .1, 0xf6e6c0, 1.1); fur(X0 + hw * .5, Z0 - hd + 1.6, .8, .6, .5, 0x4a505c, 1.1); shelf(X0 - hw + .7, Z0 - 1, 'w'); shelf(X0 + hw - .7, Z0 - 1, 'e'); plant(X0 - hw + 1, Z0 + hd - 1.2); lamp(X0 + hw - 1, Z0 + hd - 1.2); chest(X0 + hw - 1.2, Z0 + 2);
      it('shop', X0, Z0 - hd + 3.2, 2.2, ['🛍️', 'Einkaufen']); R.npcAt = [X0 - 1.5, Z0 - hd + .9, 0];
    } else if (kind === 'labor') {
      /* Professor Ulmes Labor: Versuchstisch, beschriftete Tränke und Sternenmodell */
      fur(X0, Z0 - .7, 2.8, 1.4, .9, 0x536b7c); box(X0, Z0 - .7, 2.9, 1.45, .12, 0xeaf6ff, .9);
      for (let k = 0; k < 5; k++) { const x = X0 - 2.5 + k * 1.25, col = [0x43d6c5, 0xb48aff, 0xff7ba0, 0xffd23f, 0x6bbcff][k]; box(x, Z0 - .55, .42, .42, .6, col, 1.05); b.sph(x, 1.72, Z0 - .55, .22, col, 1); }
      shelf(X0 - hw + .8, Z0 - 1, 'w'); chest(X0 + hw - 1.2, Z0 + 2); it('experiment', X0, Z0 + .7, 1.9, ['🧪', 'Experiment ansehen']); R.npcAt = [X0 + 2.3, Z0 + 1.7, 3.14];
    } else if (kind === 'kapitaen') {
      /* Kapitänshaus: Seekarte, Steuerrad und Fernrohr statt eines gewöhnlichen Wohnzimmers */
      fur(X0, Z0 - 1.1, 3.2, 2.1, .9, 0x7a4a2a); box(X0, Z0 - 1.1, 3.3, 2.2, .12, 0xd8bf8c, .9); box(X0, Z0 - 1.1, 2.2, 1.2, .035, 0x3a9ac8, 1.02);
      for (let k = 0; k < 4; k++) box(X0 - 1.1 + k * .7, Z0 - 1.1, .035, 1.5, .05, [0x3a9ac8, 0x45b87a, 0xe8b43a, 0x3a9ac8][k], 1.06);
      box(X0, Z0 + 1.7, .12, .9, .12, 0x8a5a2a, 1.5); box(X0, Z0 + 1.7, .9, .12, .12, 0x8a5a2a, 1.5); it('map', X0, Z0 + .5, 1.9, ['🗺️', 'Seekarte ansehen']);
      fur(X0 + hw - 1.3, Z0 - hd + 1.3, .7, .7, 1.4, 0x8a5a2a); it('scope', X0 + hw - 1.3, Z0 - hd + 2.3, 1.8, ['🔭', 'Zum Meer spähen']); chest(X0 - hw + 1.2, Z0 + 2.4); R.npcAt = [X0 - 2.5, Z0 + .8, .6];
    } else if (kind === 'werkstatt') {
      /* Werkstatt-Haus: Werkbank, Werkzeugwand und ein benutzbarer Hammerplatz */
      fur(X0, Z0 - hd + 1.4, hw * 1.2, 1, 1, 0x8a5a2a); box(X0, Z0 - hd + 1.4, hw * 1.24, 1.04, .12, 0xd0b070, 1);
      for (let k = 0; k < 4; k++) { box(X0 - 2.2 + k * 1.45, Z0 - hd + .65, .12, .14, 1.4, 0x6b5540, .4); box(X0 - 2.2 + k * 1.45, Z0 - hd + .65, .44, .18, .12, [0xc0d0e0, 0xd0a050, 0xc0d0e0, 0xd0a050][k], 1.2); }
      chest(X0 + hw - 1.2, Z0 + 2); it('hammer', X0, Z0 + .4, 1.9, ['🔨', 'Hämmern']); R.npcAt = [X0 - 2.6, Z0 + 1.3, .8];
    } else if (kind === 'schmiede') {
      fur(X0 - 1.8, Z0 - 1.2, 1.4, 1.0, .9, 0x3a3f4a); box(X0 - 1.8, Z0 - 1.2, 1.9, .6, .25, 0x5a6070, .9); fur(X0 + 2.8, Z0 - hd + 1.2, 2.4, 1.6, 1.3, 0x6a5a4a); box(X0 + 2.8, Z0 - hd + 1.4, 1.8, .2, .9, 0xff7a2a, .3); fur(X0 - hw + .7, Z0 + 1.5, .6, 2.6, 1.6, 0x7a4a2a); for (let k = 0; k < 4; k++) box(X0 - hw + .75, Z0 + .4 + k * .7, .3, .15, 1.2, 0xc9ccdc, .3); chest(X0 + hw - 1.2, Z0 + 2.2); plant(X0 + hw - 1, Z0 + hd - 1.2); lamp(X0 - hw + 1, Z0 + hd - 1.2);
      it('hammer', X0 - 1.8, Z0 + .3, 1.9, ['🔨', 'Hämmern']); R.npcAt = [X0 + 1, Z0 - 1.5, 3.14];
    } else if (kind === 'turm') {
      fur(X0 + hw - 1.2, Z0 - hd + 1.2, 1.4, 1.4, .8, 0x7a4a2a); box(X0 + hw - 1.2, Z0 - hd + 1.2, .25, .25, 1.4, 0x6a6a7a, .8); box(X0 + hw - 1.2, Z0 - hd + .8, .4, .4, 1.6, 0xb08a4a, 1.6 + 0); it('scope', X0 + hw - 1.2, Z0 - hd + 2.6, 1.8, ['🔭', 'Fernrohr']); for (let k = 0; k < 7; k++) fur(X0 - hw + 1.3 + Math.cos(k * .55) * 1.1, Z0 - hd + 1.3 + Math.sin(k * .55) * 1.1, .9, .5, .3 + k * .22, 0xa8a8b8); table(X0 - 1.2, Z0 + 1, true); lamp(X0 + hw - 1, Z0 + hd - 1.2); chest(X0 - hw + 1.2, Z0 + hd - 1.4); R.npcAt = [X0 + 1.4, Z0 + .5, 3.9];
    } else if (kind === 'zelt') {
      fur(X0, Z0 - 1.3, 1.3, 1.3, .9, 0x6a3a8a); box(X0, Z0 - 1.3, .9, .9, .6, 0xbfeaff, .9); it('ball', X0, Z0 + .3, 1.9, ['🔮', 'Kristallkugel']); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(X0 + sx * 2.2, Z0 + sz * 1.8 + .8, .9, .9, .35, [0xff5a8a, 0xffd23f, 0x35d6e0, 0xb48aff][(sx + 1 + (sz + 1) / 2) | 0], .02);
      shelf(X0 - hw + .7, Z0 - 1.5, 'w'); chest(X0 + hw - 1.2, Z0 + 2); lamp(X0 + hw - 1, Z0 - hd + 1.2); plant(X0 - hw + 1, Z0 + hd - 1.2); R.npcAt = [X0 + 1.8, Z0 - .5, 4.2];
    } else if (kind === 'schloss') {
      /* Große Kristall-Burg: zentraler Thronsaal, zwei Seitenflügel, Galerie und hohe Fenster. */
      const stone = 0xded4ec, gold = 0xffd45b, rose = 0x9d4e9f, glass = 0x8fd8ff;
      box(X0, Z0 - hd + 4, 9, 5, .65, 0xc23a8a); fur(X0, Z0 - hd + 2.2, 3.2, 2.2, 1.2, rose); box(X0, Z0 - hd + 1.4, 2.2, .45, 2.2, gold, 1.2); box(X0, Z0 - hd + .5, 5.4, .28, 2.0, gold, 2.8);
      box(X0, Z0 + 5, 3.4, 18, .05, 0xc23a3a, .03); box(X0, Z0 + 5, 2.4, 16, .06, 0xffe9b0, .04);
      /* Teilwände lassen breite Tore offen und teilen Thronsaal, Schatzraum und Musikflügel. */
      for (const side of [-1, 1]) {
        const sx = X0 + side * 12;
        box(sx, Z0, 1.1, 27, 5.6, stone);
        box(sx, Z0, 1.25, 27.2, .2, rose, 5.6);
        W.addBox(sx - .6, Z0 - 13.5, sx + .6, Z0 - 4.2, false, 5.7);
        W.addBox(sx - .6, Z0 + 4.2, sx + .6, Z0 + 13.5, false, 5.7);
      }
      for (const sx of [-19, -15, 15, 19]) for (const sz of [-13, -5, 4, 13]) {
        fur(X0 + sx, Z0 + sz, 1.25, 1.25, 8.5, stone);
        box(X0 + sx, Z0 + sz, 1.55, 1.55, .35, gold, 8.5);
      }
      for (const side of [-1, 1]) for (const sz of [-11, 0, 11]) {
        const wx = X0 + side * 23.7;
        box(wx, Z0 + sz, .12, 5.4, 3.3, glass, 4.1);
        box(wx, Z0 + sz, .24, 5.6, .14, gold, 4.1);
        box(wx, Z0 + sz, .24, .14, 3.5, gold, 4.1);
      }
      for (let i = 0; i < 9; i++) {
        const y = .25 + i * .32, z = Z0 - 7 - i * .72;
        box(X0 - 19 + i * .7, z, 3.4, .34, 1.5, stone, y);
        box(X0 + 19 - i * .7, z, 3.4, .34, 1.5, stone, y);
      }
      box(X0, Z0 - 14, 2.6, 12, .22, gold, 5.5);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const tx = X0 + sx * 22, tz = Z0 + sz * 16;
        fur(tx, tz, 6.8, 6.8, 15, stone);
        const tower = new THREE.Mesh(new THREE.ConeGeometry(4.8, 9, 8), new THREE.MeshBasicMaterial({ color: ((sx * sz) > 0 ? 0x9b78d1 : 0x668ad6) }));
        tower.position.set(tx, 18, tz); grp.add(tower);
        box(tx, tz, 2.3, 2.3, .5, gold, 10);
      }
      chest(X0 + 18, Z0 - 5); shelf(X0 - 18, Z0 - 5, 'w');
      for (let i = 0; i < 5; i++) { const cx = X0 + (i - 2) * 3, cz = Z0 + 13; box(cx, cz, .6, .6, 1.8 + i % 2, [0xff687f,0xffd34d,0x55b8ff,0x62cf8e,0xb882ff][i]); }
      lamp(X0, Z0 - 4);
      it('throne', X0, Z0 - hd + 6, 2.2, ['👑', 'Auf den Thron setzen']);
      it('stairs', X0 - 16, Z0 - 5, 2.8, ['🪜', 'Galerie erkunden']);
      R.npcAt = [X0 - 3.6, Z0, 4.8];
    } else if (kind === 'hoehle') {
      for (let k = 0; k < 9; k++) { const sx = (rng() - .5) * (K0.w - 2), sz = (rng() - .5) * (K0.d - 3) - 1; if (Math.hypot(sx, sz) < 2.4) continue; b.cone(X0 + sx, 0, Z0 + sz, .4 + rng() * .4, 1.2 + rng() * 1.8, 0x7a7488, 6); solid(X0 + sx, Z0 + sz, .8, .8, 2); } for (const [dx, dz, col] of [[-3.5, -2.5, 0x9ad8ff], [3.4, -3, 0xff9ad8], [-3, 2.5, 0x9affc8]]) { b.cone(X0 + dx, 0, Z0 + dz, .35, 1.4, col, 5); b.sph(X0 + dx, 1.5, Z0 + dz, .25, col, 1); solid(X0 + dx, Z0 + dz, .6, .6, 1.5); }
      box(X0, Z0 - 1.6, 3.2, 3.2, .05, 0x1a1a24, .02); box(X0, Z0 - 1.6, 2.4, 2.4, .06, 0x000000, .03); for (let k = 0; k < 4; k++) box(X0, Z0 - .4 - k * .55, 3.0 - k * .5, .5, .25, 0x8a8a98, 0); it('stairs', X0, Z0 + .6, 2.2, ['🕳️', 'Abstieg ins Mini-Spiel']); chest(X0 + hw - 1.3, Z0 + 2.4); R.npcAt = [X0 - 2.6, Z0 + 2.4, 1.2];
    } else if (kind === 'heil') {
      /* Taschi-Heilhaus: Tresen mit Heil-Automat (Ballregal), Betten, Team-Tisch */
      fur(X0, Z0 - hd + 1.5, hw * 1.7, .9, 1.1, 0xffffff); box(X0, Z0 - hd + 1.5, hw * 1.75, 1.0, .12, 0xe8453c, 1.1); box(X0, Z0 - hd + 1.5, 1.2, .2, .14, 0xffffff, 1.2);
      fur(X0 + hw * .5, Z0 - hd + 1.5, 2.4, .9, 1.7, 0xf4f4ff); for (let k = 0; k < 6; k++) { box(X0 + hw * .5 - 1.0 + (k % 3) * 1.0, Z0 - hd + 1.9, .5, .3, .5, [0xe8453c, 0x3f8cff, 0x4cc05a][k % 3], 1.95 - (k > 2 ? .6 : 0)); }
      it('tcenter', X0 + hw * .5, Z0 - hd + 3.1, 2.6, ['💖', 'Taschis heilen']);
      fur(X0 - hw * .5, Z0 - hd + 1.5, 2.2, .9, 1.0, 0xffe0ea); box(X0 - hw * .5, Z0 - hd + 1.5, 1.4, .3, .1, 0xff9ac0, 1.05); it('tteam', X0 - hw * .5, Z0 - hd + 3.1, 2.4, ['🎒', 'Team & Lager ansehen']);
      bed(X0 - hw + 1.4, Z0 + 1.2); bed(X0 + hw - 1.4, Z0 + 1.2); plant(X0 - hw + 1, Z0 + hd - 1.2); plant(X0 + hw - 1, Z0 + hd - 1.2); lamp(X0, Z0 + hd - 1.2);
      R.npcAt = [X0, Z0 - hd + 2.6, 0];
    } else {
      /* Wohnhaus, Hütte, Pilz, Frucht, Stein, Kopf, Eimer, Heldenheim */
      bed(X0 - hw + 1.4, Z0 - hd + 2); table(X0 + 1.2, Z0 - .6, true); shelf(X0 + hw - .7, Z0 - 1.6, 'e'); plant(X0 - hw + 1, Z0 + hd - 1.2); lamp(X0 + hw - 1, Z0 + hd - 1.2); chest(X0 + hw - 1.3, Z0 + 2.2);
      if (kind === 'huette') { fur(X0, Z0 - hd + .9, 2.4, 1.2, 1.5, 0x6a5a4a); box(X0, Z0 - hd + 1.1, 1.6, .2, .9, 0xff7a2a, .3); it('fire', X0, Z0 - hd + 2.6, 1.8, ['🔥', 'Aufwärmen']); }
      else if (kind === 'frucht') { fur(X0 - 1.8, Z0 + 1.6, 1.6, .6, .7, 0x4a505c); box(X0 - 1.8, Z0 + 1.6, 1.4, .1, .9, 0x2a2a3a, .6); it('tv', X0 - 1.8, Z0 + 2.6, 1.8, ['📺', 'Fernsehen']); }
      else if (kind === 'held') { fur(X0 - 2.6, Z0 - hd + .9, 1.2, 1.2, 1.1, 0xc9d0e0); box(X0 - 2.6, Z0 - hd + .9, .5, .5, .5, 0xffd23f, 1.1); it('cup', X0 - 2.6, Z0 - hd + 2.4, 1.8, ['🏆', 'Heldenpokal ansehen']); }
      else if (kind === 'eimer') { fur(X0 - 2.2, Z0 + 1.8, 1.4, .8, .9, 0xc9d0e0); box(X0 - 2.2, Z0 + 1.8, .9, .6, .08, 0x3fae4a, .9); it('recipe', X0 - 2.2, Z0 + 2.9, 1.8, ['📜', 'Geheimrezept lesen']); }
      R.npcAt = [X0 - .6, Z0 + 1.2, 0.8];
    }
    grp.add(b.mesh(mat)); const [nm, lines] = NAMEN[(idx * 3 + (d.name.length | 0)) % NAMEN.length]; if (d.tshop) it('tshop', X0 + hw * .5, Z0 - hd + 3.0, 2.6, ['🔴', 'Taschiball-Laden']);
    const themedTalk = { labor: ['Professor Ulme', ['Willkommen in meinem Labor! Hier untersuche ich die bunten Inselpflanzen. 🧪', 'Die Tränke sind nur zum Anschauen – aber das Sternenmodell darfst du drehen!']], kapitaen: ['Kapitänin Mira', ['Willkommen an Bord! Die Karte zeigt alle Inseln, die ich schon besucht habe. 🗺️', 'Durch das Fernrohr kannst du nach neuen Abenteuern Ausschau halten. 🔭']], werkstatt: ['Tüftler Ben', ['Hier repariere ich Fahrzeuge und baue neue Spielsachen. 🛠️', 'Am Werktisch darfst du mir beim Hämmern helfen! 🔨']] };
    R.res = themedTalk[d.kind] || (d.kind === 'heil' ? ['Schwester Hanna', ['Willkommen im Heilhaus! Gib mir dein Team – im Nu sind alle Taschis wieder fit. 💖', 'Tipp: Wenn dein ganzes Team müde ist, wachst du hier wieder auf.']] : [d.kind === 'laden' ? 'Verkäufer ' + nm.split(' ')[0] : d.kind === 'schloss' ? 'Wächter ' + nm.split(' ')[0] : nm, lines]);
    const sp = sprite((K0.title || '🏠') + ' ' + d.name, 3.1, 5.2, X0, Z0 - hd + .5); grp.add(sp);
    grp.visible = false; return R;
  }
  const folkRef = { arr: null };
  K.people = function (folk) { folkRef.arr = folk; };
  function spawnResident(R) {
    const a = R.npcAt || [R.X0, R.Z0, 0], look = [{ shirt: 0xe8453c, pants: 0x4a3a2a, hair: 0x6a4a2a, skin: 0xf6d2b0 }, { shirt: 0x3a8ae8, pants: 0xf4f4ff, hair: 0xf4d060, skin: 0xd8a070, dress: true }, { shirt: 0x4cd07d, pants: 0x3a4a6a, hair: 0x2a2a2a, skin: 0x8a5a33 }, { shirt: 0xb48aff, pants: 0xffffff, hair: 0xe8e8e8, skin: 0xf6d2b0, style: 'long', dress: true }][R.d.id % 4], c = BI.makeChar(Object.assign({ hat: R.d.kind === 'laden' ? 'chef' : R.d.kind === 'schloss' ? 'helmet' : 'none', style: look.style || 'short', scale: .95 }, look));
    c.group.position.set(a[0], 0, a[1]); c.group.rotation.y = a[2]; scene.add(c.group); c.group.visible = false; const n = { c, x: a[0], z: a[1], h: a[2], h0: a[2], p: { name: R.res[0], lines: R.res[1], i: 0 }, wait: 0, hop: 0, kid: false, fixed: true, indoor: R.d.id }; if (folkRef.arr) folkRef.arr.push(n); R.npc = n; W.addCircle(a[0], a[1], .5, false, 1.8);
  }
  /* ---------- Hineingehen / Hinausgehen ---------- */
  K.enter = function (d) {
    if (P.veh) { say('🚪 Steig erst aus 🙂', 1800); return; }
    let R = rooms.get(d.id); if (!R) { R = build(d); rooms.set(d.id, R); spawnResident(R); }
    K.inside = R; K.back = { x: d.x, z: d.z, h: d.h }; for (const r of rooms.values()) { r.grp.visible = r === R; if (r.npc) r.npc.c.group.visible = r === R; }
    fx.burst(P.x, 1.2, P.z, 10, [[1, .85, .3], [1, 1, 1]], 3, .8, 26, 3); A.pop && A.pop(); P.x = R.X0; P.z = R.Z0 + R.hd - 2.8; P.y = 0; P.vy = 0; P.h = Math.PI; if (G.cam) { G.cam.yaw = 0; }
    if (d.onEnter) d.onEnter(); const s = S(); if (!s.v[d.id]) { s.v[d.id] = 1; persist(); stars(1); const n = Object.keys(s.v).length; say('🚪 ' + d.name + ' – neu entdeckt! +1 ⭐ (' + n + ' Gebäude)', 3600); if (n === 5) earn('forscher5'); if (n === 20) earn('forscher20'); if (n === 40) earn('forscher40'); } else say('🚪 ' + d.name, 1800);
  };
  K.leave = function () {
    const R = K.inside; if (!R) return; const b = K.back; K.inside = null; R.grp.visible = false; if (R.npc) R.npc.c.group.visible = false; P.x = b.x; P.z = b.z; P.y = W.groundY(b.x, b.z); P.vy = 0; P.h = b.h; A.pop && A.pop(); fx.burst(P.x, 1.2, P.z, 10, [[1, .85, .3], [1, 1, 1]], 3, .8, 26, 3);
  };
  /* ---------- Aktionen ---------- */
  K.near = function () {
    if (P.veh || P.y - (K.inside ? 0 : W.groundY(P.x, P.z)) > 2.5 || K.panel) return null;
    if (K.inside) { const R = K.inside; if (nr(R.exit, 1.9)) return { k: 'inout', label: ['🚪', 'Hinausgehen'] }; for (const i of R.items) if (nr(i, i.r)) return { k: 'initem', i, label: i.type === 'chest' && i.open ? ['🎁', 'Truhe (leer)'] : i.label }; return null; }
    if (P.x < 2500) for (const d of BI.DOORS) if (Math.abs(P.x - d.x) < 3 && Math.abs(P.z - d.z) < 3 && Math.hypot(P.x - d.x, P.z - d.z) < 2.3) return { k: 'door', d, label: ['🚪', d.name + ' betreten'] };
    return null;
  };
  K.busy = () => !!K.panel;
  const close = () => { if (!K.panel) return; K.panel.remove(); K.panel = null; G.updateButtons && G.updateButtons(true); };
  function shop() {
    G.setStick && G.setStick(0, 0); const p = K.panel = document.createElement('div'); p.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.55);z-index:60;font-family:Fredoka,system-ui,sans-serif'; const card = document.createElement('div'); card.style.cssText = 'background:#fffaf0;border:6px solid #e0902a;border-radius:24px;padding:14px 16px;width:min(92vw,400px);text-align:center'; p.appendChild(card);
    const draw = () => { card.innerHTML = '<div style="font-size:26px;font-weight:900;color:#8a4a1a">🛍️ Einkaufen</div><div style="font-weight:700;color:#6a4a2a;margin:4px 0 8px">⭐ ' + (save.stars | 0) + '</div>'; for (const [id, em, nm, pr] of SHOP) { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'display:flex;width:100%;align-items:center;gap:10px;margin:5px 0;background:#fff;border:3px solid #f0c890;border-radius:14px;padding:6px 10px;font:800 17px inherit;cursor:pointer'; b.innerHTML = '<span style="font-size:32px">' + em + '</span><span style="flex:1;text-align:left">' + nm + '</span><span style="color:#b07a00">⭐ ' + pr + '</span>'; b.onclick = () => { if ((save.stars | 0) < pr) { say('⭐ Dafür fehlen dir noch Sterne.', 2200); A.bonk && A.bonk(); return; } stars(-pr); const iv = G.inv && G.inv(); if (iv) iv[id] = (iv[id] || 0) + 1; A.buy && A.buy(); say(em + ' ' + nm + ' im Rucksack! (zum Essen oder Füttern)', 2200); draw(); }; card.appendChild(b); } const x = document.createElement('button'); x.type = 'button'; x.textContent = '✔ Fertig'; x.style.cssText = 'margin:8px;border-radius:16px;border:4px solid #4cd07d;background:#fff;padding:8px 26px;font:900 19px inherit;cursor:pointer'; x.onclick = close; card.appendChild(x); };
    draw(); document.body.appendChild(p);
  }
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'door') { K.enter(n.d); return; } if (n.k === 'inout') { K.leave(); return; }
    const i = n.i, R = K.inside, id = R.d.id;
    if (i.type === 'chest') { if (s.c[id]) { say('🎁 Die Truhe ist schon leer.', 1800); return; } s.c[id] = 1; i.open = true; const nn = Object.keys(s.c).length, big = ['schloss', 'hoehle', 'schmiede'].includes(R.d.kind); stars(big ? 3 : 1); const iv = G.inv && G.inv(), f = ['apple', 'cookie', 'banana', 'cakeslice', 'icecream'][(id + nn) % 5]; if (iv) iv[f] = (iv[f] || 0) + 1; A.fanfare && A.fanfare(); fx.burst(P.x, 1.6, P.z, 22, [[1, .9, .4], [1, 1, 1], [1, .5, .5]], 4, 1.2, 28, 3); say('🎁 Truhe: +' + (big ? 3 : 1) + ' ⭐ und etwas Leckeres für dein Kapselmonster! (' + nn + ' Truhen)', 4200); if (nn === 10) earn('truhen10'); persist(); return; }
    if (i.type === 'tcenter') { G.taschiHeal && G.taschiHeal(); return; } if (i.type === 'tteam') { G.taschiTeam && G.taschiTeam(); return; } if (i.type === 'tshop') { G.taschiShop && G.taschiShop(); return; }
    if (i.type === 'bed') { fx.burst(P.x, 1.4, P.z, 12, [[.6, .7, 1], [1, 1, 1]], 2, .8, 30, 2); say('😴 Zzz … schön ausgeruht! Jetzt geht es weiter.', 2800); A.hello && A.hello(); return; }
    if (i.type === 'table') { const k = 't' + id; if (!s.o[k]) { s.o[k] = 1; const iv = G.inv && G.inv(); if (iv) iv.apple = (iv.apple || 0) + 1; stars(1); say('🍎 Lecker! Ein Apfel im Rucksack. +1 ⭐', 3000); persist(); } else say('🍽️ Der Tisch ist leer – du hast schon alles aufgegessen. 😋', 2400); A.buy && A.buy(); return; }
    if (i.type === 'shelf') { const t = TIPPS[(id + (s.o.r | 0)) % TIPPS.length]; s.o.r = (s.o.r | 0) + 1; say(t, 5200); A.speak && A.speak(t.replace('📚 ', '')); return; }
    if (i.type === 'shop') { shop(); return; }
    if (i.type === 'hammer') { for (let k = 0; k < 5; k++) note(330 + (k % 2) * 60, .12, 'square', .08, k * .13); fx.burst(P.x - 1, 1, P.z - 1, 14, [[1, .7, .2], [1, 1, .6]], 4, .8, 22, 2); say('🔨 Klong-klong! Funken sprühen!', 2200); return; }
    if (i.type === 'map') { say('🗺️ Auf der Karte sind Strand, Wald und die Inseln eingezeichnet. Wo möchtest du als Nächstes hin?', 3600); return; }
    if (i.type === 'experiment') { const t = ['🧪 Die blaue Mischung glitzert wie das Meer!', '🧪 Die Pflanzenprobe duftet nach Sommer.', '🧪 Das Sternenmodell dreht sich ganz langsam.'][(s.o.lab | 0) % 3]; s.o.lab = (s.o.lab | 0) + 1; say(t, 3200); return; }
    if (i.type === 'scope') { const t = ['🔭 Du siehst die ganze Insel – und das Meer dahinter!', '🔭 Dort hinten schwimmt ein Schwarm bunter Fische.', '🔭 Weit weg leuchtet eine schwebende Festung am Himmel!'][(s.o.s | 0) % 3]; s.o.s = (s.o.s | 0) + 1; say(t, 3600); return; }
    if (i.type === 'ball') { const t = ['🔮 Ich sehe: Heute findest du einen Schatz!', '🔮 Ich sehe: Du bekommst bald ein neues Abenteuer.', '🔮 Ich sehe: Ein Freund wartet auf dich! ❤️'][(s.o.b | 0) % 3]; s.o.b = (s.o.b | 0) + 1; fx.burst(P.x, 1.8, P.z - 1, 14, [[.7, .5, 1], [1, 1, 1]], 3, 1, 28, 2); say(t, 3600); return; }
    if (i.type === 'fire') { say('🔥 Brrr, drinnen ist es schön warm. Du wärmst dir die Hände.', 2800); fx.burst(P.x, 1.2, P.z - 1.4, 10, [[1, .6, .2], [1, .9, .4]], 2, 1, 26, 3); return; }
    if (i.type === 'tv') { say('📺 Ein lustiger Trickfilm läuft: Ein Schwamm brät Burger … Hihi!', 3600); return; }
    if (i.type === 'cup') { say('🏆 Der Heldenpokal! Hier steht: „Für den mutigsten Helden der sieben Meere.“', 4200); return; }
    if (i.type === 'recipe') { say('📜 „Geheimrezept: 1 Brötchen, 1 Frikadelle, viel Liebe.“ Mehr verrät es nicht!', 4200); return; }
    if (i.type === 'throne') { A.fanfare && A.fanfare(); fx.burst(P.x, 2.4, P.z, 24, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 4, 1.4, 30, 3); say('👑 Du sitzt auf dem Thron! Alle jubeln.', 3200); return; }
    if (i.type === 'stairs') { say('🕳️ Du steigst die Stufen hinab … Stockwerk 1!', 2200); G.start && G.start('hoehle_raetsel'); return; }
  };
  /* Bild für Bild: Innenraum gibt es nur, solange man drin ist; Tür-Hinweis außen */
  let doorHint = 0;
  K.update = function (dt) {
    if (K.inside) { if (P.x < 2500) { K.inside = null; for (const r of rooms.values()) { r.grp.visible = false; if (r.npc) r.npc.c.group.visible = false; } } else { const R = K.inside; P.x = BI.clamp(P.x, R.X0 - R.hw + .5, R.X0 + R.hw - .5); P.z = BI.clamp(P.z, R.Z0 - R.hd + .5, R.Z0 + R.hd - .5); } }
    else if (P.x < 2500) { doorHint -= dt; if (doorHint <= 0) { doorHint = 1; if (!S().o.hint) for (const d of BI.DOORS) if (Math.hypot(P.x - d.x, P.z - d.z) < 6) { S().o.hint = 1; persist(); say('🚪 Gebäude kann man betreten! Stell dich auf die goldene Türmatte und drück die Aktionstaste.', 5200); break; } } }
  };
  K.log = function () {
    const s = S(), n = Object.keys(s.v).length, N = BI.DOORS.length, c = Object.keys(s.c).length; return { title: '🚪 Gebäude erkunden', count: Math.min(3, (n >= 5 ? 1 : 0) + (n >= 20 ? 1 : 0) + (c >= 10 ? 1 : 0)) + ' von 3', rows: [{ ok: n >= 5, icon: '🚪', text: 'Gebäude betreten: ' + n + ' von ' + N + ' (5 für den Sticker)', dest: 'insel' }, { ok: n >= 20, icon: '🏘️', text: '20 verschiedene Gebäude betreten', dest: 'insel' }, { ok: c >= 10, icon: '🎁', text: 'Schatztruhen in Gebäuden öffnen: ' + c + ' von 10', dest: 'insel' }] };
  };
  K.dbg = { rooms, build, S, DOORS: BI.DOORS };
  return K;
};

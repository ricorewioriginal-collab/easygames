'use strict';
/* Bunte Insel – Märchenland-Extras 🎠🎆 (mehr Märchenpark-Gefühl, mehr Mitmachen): Märchen-Karussell, Schwanenboot-Fahrt durch die Perlenlagune, Eisrutsche vom Frostgipfel,
   Schloss-Show mit Lichtstrahlen und Feuerwerk, Umzug mit Wagen und Maskottchen Willi, Stempelheft (10 Stempel), Willi umarmen, Popcorn-Wagen, Mausohren-Laden,
   Fähnchen-Girlanden an der Hauptstraße. Alles mit eigenen Namen und Formen. Lokale Koordinaten (a, b) wie in maerchen.js. */
BI.buildMaerchenPlus = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.MAERCHEN, L = M.at, ry = Math.atan2(M.ux, M.uz), TAU = Math.PI * 2, GOLD = 0xffd23f;
  const bx = (a, b, wb, h, da, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, wb, h, da, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const cone = (a, b, r, h, col, y0, seg) => { const p = L(a, b); st.cone(p.x, y0 || 0, p.z, r, h, col, seg || 8); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const P = M.plus = { carousel: { a: 6, b: 16 }, dock: { a: -46, b: 28.4 }, lagoon: { a: -46, b: 38 }, ice: { a: -10, b: -52 }, show: { a: 16, b: 12 }, parade: { a: 16, b: -12 }, popcorn: { a: -24, b: 10 }, ears: { a: -24, b: -10 }, willi: { a: -62, b: -7 } };
  /* Eisrutsche: Spirale vom Gipfel (y ≈ 6,9) zum Fuß des Frostgipfels */
  P.slide = []; for (let i = 0; i <= 18; i++) { const u = i / 18, g = u * TAU * 1.25 + .3, r = 3.6 + u * 11.6, y = 6.95 * (1 - u) + .2 + 0 * u; P.slide.push([P.ice.a + Math.sin(g) * r, P.ice.b + Math.cos(g) * r, y]); }
  /* Schwanenboot-Bahn: ein Kreis in der Lagune */
  P.boatR = 6.6;
  /* Wegweiser-Plätze (Stempel) */
  for (const k of ['carousel', 'show', 'parade', 'popcorn', 'ears', 'dock', 'ice']) W.spots['mp_' + k] = L(P[k].a, P[k].b);
  W.spots.mp_willi = L(P.willi.a, P.willi.b);
  /* ---- Karussell: Sockel, Stufen, Lichter (der drehende Teil mit Pferden und Dach ist ein Laufzeit-Objekt) ---- */
  { const ca = P.carousel.a, cb = P.carousel.b; cyl(ca, cb, 5.9, 6.1, .35, 0xe8b0cc, 0, 24); cyl(ca, cb, 5.2, 5.4, .1, 0xfff0fa, .35, 24); solid(ca, cb, 5.8, 5);
    for (let k = 0; k < 16; k++) { const g = k / 16 * TAU, q = L(ca + Math.sin(g) * 5.9, cb + Math.cos(g) * 5.9); lamp.sph(q.x, .62, q.z, .17, k % 2 ? 0xfff3b0 : 0xff8fc8, 1); }
    for (let k = 0; k < 3; k++) bx(ca - 6.4 - k * .4, cb, 3, .12 + (2 - k) * .1, .5, 0xfff0fa, 0); }
  /* ---- Schloss-Show-Pult und Umzug-Pult ---- */
  for (const [k, col, ic] of [['show', 0xff5a8a, 0x5a7ae8], ['parade', 0x5a7ae8, 0xffd23f]]) { const a = P[k].a, b = P[k].b; cyl(a, b, 1.3, 1.5, .5, 0xfff0fa, 0, 12); cyl(a, b, .9, 1.0, .9, col, .5, 12); cone(a, b, 1.2, .8, GOLD, 1.4, 6); sph(a, b, 2.5, .35, ic); solid(a, b, 1.5, 2.5); }
  /* ---- Popcorn-Wagen ---- */
  { const a = P.popcorn.a, b = P.popcorn.b; bx(a, b, 3.2, 1.3, 2.2, 0xe8453c, .5); bx(a, b, 3.5, .2, 2.5, 0xfff0fa, 1.8); for (let k = -2; k <= 2; k++) bx(a, b + k * .64, .64, .12, 2.5, k % 2 ? 0xe8453c : 0xfff0fa, 3.2); cyl(a - 1, b - 1.4, .08, .08, 3.2, 0xffffff, 0, 6); cyl(a - 1, b + 1.4, .08, .08, 3.2, 0xffffff, 0, 6);
    for (const dx of [-1.1, 1.1]) { cyl(a + dx, b - 1.3, .45, .45, .2, 0x444a5a, 0, 10); cyl(a + dx, b + 1.3, .45, .45, .2, 0x444a5a, 0, 10); }
    for (let k = 0; k < 7; k++) sph(a - .6 + (k % 3) * .6, b + (Math.floor(k / 3) - 1) * .6, 2.05, .26, k % 2 ? 0xfff3b0 : 0xffe9a0); sph(a, b, 4.0, .9, 0xff8fc8); solid(a, b, 2, 3); }
  /* ---- Mausohren-Laden ---- */
  { const a = P.ears.a, b = P.ears.b; bx(a, b, 4, 3, 3, 0xb48aff); bx(a, b, 4.6, .3, 3.6, 0x4a3a8a, 3); for (const sd of [-1, 1]) { sph(a, b + sd * 1.4, 4.1, .7, 0x1c1c20, .25); sph(a - .05, b + sd * 1.4, 4.1, .45, 0xff8fc8, .22); } bx(a - 1.6, b, .12, 1.4, 2.4, 0x9fe3ff, 1.0); for (const sd of [-1, 1]) { const q = L(a - 1.7, b + sd * .8); lamp.sph(q.x, 2.4, q.z, .14, 0xfff3b0, 1); } solid(a, b, 2.3, 4); }
  /* ---- Fähnchen-Girlanden an der Hauptstraße (zwischen den Laternen, b = ±5,2) ---- */
  { const cols = [0xff5a8a, 0xffd23f, 0x5a7ae8, 0x4cd07d, 0xff8a1f, 0xb48aff];
    for (const sd of [-1, 1]) for (let a = -60; a < 18; a += 9) for (let k = 1; k <= 7; k++) { const u = k / 8, aa = a + 9 * u, y = 3.8 - Math.sin(u * Math.PI) * .7, q = L(aa, sd * 5.2); st.prism(q.x, y - .45, q.z, .5, .55, .08, cols[(k + ((a + 60) / 9 | 0)) % 6], ry + Math.PI / 2); } }
  /* ---- Lagune: Bootssteg + Laternen am Ufer ---- */
  { const a = P.dock.a, b = P.dock.b; bx(a, b + .6, 3.2, .3, 2.6, 0xb98650, .05); for (const sd of [-1, 1]) { cyl(a + sd * 1.5, b - .5, .12, .12, 1.4, 0x6a4a2a, 0, 6); sph(a + sd * 1.5, b - .5, 1.5, .2, 0xfff3b0); }
    for (let k = 0; k < 9; k++) { const g = k / 9 * TAU + .2, aa = P.lagoon.a + Math.sin(g) * 9.4, bb = P.lagoon.b + Math.cos(g) * 9.4, col = [0xff8fc8, 0x5a7ae8, 0xffd23f, 0x4cd07d][k % 4]; if (Math.hypot(aa - a, bb - b) < 3) continue; cyl(aa, bb, .2, .26, .5, 0xfff0fa, 0, 6); cone(aa, bb, .3, .6, col, .5, 6); sph(aa, bb, 1.35, .22, 0xf3c9a0); } }
  /* ---- Eisrutsche: Bahn aus Eis mit weißen Rändern (spiegelt die Fahrt) ---- */
  { const s = P.slide; for (let i = 0; i < s.length - 1; i++) { const p0 = L(s[i][0], s[i][1]), p1 = L(s[i + 1][0], s[i + 1][1]), dx = p1.x - p0.x, dz = p1.z - p0.z, h = Math.hypot(dx, dz) || 1e-6, dy = s[i + 1][2] - s[i][2], len = Math.hypot(h, dy), ay = Math.atan2(dx, dz), ax = Math.atan2(-dy, h), mx = (p0.x + p1.x) / 2, mz = (p0.z + p1.z) / 2, my = (s[i][2] + s[i + 1][2]) / 2;
      st.box(mx, my - .08, mz, 1.6, .14, len + .15, 0x8fd8ff, ay, ax); for (const sd of [-1, 1]) st.box(mx + Math.cos(ay) * .8 * sd, my + .1, mz - Math.sin(ay) * .8 * sd, .12, .34, len + .1, 0xffffff, ay, ax); } }
};

BI.createMaerchenPlus = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { ride: null }, M = BI.MAERCHEN, L = M.at, TAU = Math.PI * 2, PL = M.plus, SP = W.spots, mat = BI.mat();
  const S = () => { const s = save.mplus || (save.mplus = {}); s.st = s.st || []; s.ear |= 0; s.ride = s.ride || {}; s.once = s.once || {}; return s; };
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const stars = n => G.addStars(n), earn = id => G.earn && G.earn(id);
  const nr = (o, r) => Math.hypot(P.x - o.x, P.z - o.z) < r, onIsle = () => Math.hypot(P.x - M.x, P.z - M.z) < M.R + 4;
  const sign = (txt, p, y, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#5a2a7a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3b0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(p.x, y, p.z); scene.add(sp); return sp; };
  sign('🎠 Märchen-Karussell', SP.mp_carousel, 8.4, 8); sign('🎆 Schloss-Show', SP.mp_show, 4.4, 6); sign('🎭 Umzug', SP.mp_parade, 4.4, 4.5); sign('🍿 Popcorn', SP.mp_popcorn, 6, 5); sign('🐭 Mausohren-Laden', SP.mp_ears, 6.6, 8); sign('🦢 Schwanenboot', SP.mp_dock, 4, 6); sign('🛷 Eisrutsche', { x: SP.mp_ice.x, z: SP.mp_ice.z }, 11.5, 6.5);
  /* ---------- Karussell (drehender Teil als eigenes Mesh) ---------- */
  const CAR = (() => { const b = new BI.Batch(), cols = [0xff8fc8, 0x5a7ae8, 0xffd23f, 0x4cd07d, 0xb48aff, 0xff8a1f, 0x35d6e0, 0xe8453c];
    b.cyl(0, .35, 0, .5, .6, 4.2, 0xfff0fa, 12); for (let k = 0; k < 8; k++) { const g = k / 8 * TAU, x = Math.sin(g) * 3.6, z = Math.cos(g) * 3.6; b.cyl(x, .5, z, .06, .06, 3.2, GOLD_(), 6);
      b.box(x, 1.0, z, .55, .6, 1.2, cols[k], g + Math.PI / 2); b.sph(x + Math.cos(g) * .05, 1.85, z - Math.sin(g) * .05, .3, cols[k], 1); b.box(x, 1.3, z, .12, .25, .6, 0xfff0fa, g + Math.PI / 2); }
    b.cyl(0, 4.4, 0, 4.9, 5.2, .5, 0xfff0fa, 16); b.cone(0, 4.9, 0, 5.4, 2.2, 0xff5a8a, 16); b.sph(0, 7.3, 0, .35, GOLD_(), 1);
    for (let k = 0; k < 12; k++) { const g = k / 12 * TAU; b.sph(Math.sin(g) * 5.1, 4.4, Math.cos(g) * 5.1, .18, k % 2 ? 0xfff3b0 : 0xff8fc8, 0); }
    const m = b.mesh(mat); m.frustumCulled = false; const g = new THREE.Group(); g.add(m); const q = L(PL.carousel.a, PL.carousel.b); g.position.set(q.x, .45, q.z); scene.add(g); return g; })();
  function GOLD_() { return 0xffd23f; }
  /* ---------- Schwanenboot ---------- */
  const BOAT = (() => { const b = new BI.Batch(); b.sph(0, .35, 0, .9, 0xfff0fa, 1, 1, .6, 1.5); b.sph(0, 1.2, .95, .35, 0xfff0fa, 1, 1, 1.6, 1); b.sph(0, 1.9, 1.1, .28, 0xfff0fa, 1); b.cone(0, 1.85, 1.35, .1, .35, 0xff8a1f, 5); b.box(0, .55, -.2, 1.6, .14, 1.1, 0xff8fc8); b.box(0, .5, -.2, .1, .5, 1.1, 0xff5a8a);
    for (const sd of [-1, 1]) b.sph(sd * .75, .85, -.9, .5, 0xfff0fa, 1, .3, 1.2, 1); const m = b.mesh(mat); m.frustumCulled = false; const g = new THREE.Group(); g.add(m); const q = L(PL.dock.a, PL.dock.b - 2.4); g.position.set(q.x, .1, q.z); scene.add(g); return g; })();
  /* ---------- Show: Lichtstrahlen ---------- */
  const beams = [[29, -14], [29, 14], [47, -14], [47, 14]].map(([a, b], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.2, 2.6, 60, 10, 1, true), new THREE.MeshBasicMaterial({ color: [0xff8fc8, 0x7fe0ff, 0xffe27a, 0xb48aff][i], transparent: true, opacity: .26, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); const q = L(a, b); m.position.set(q.x, 30, q.z); m.visible = false; scene.add(m); return m; });
  /* ---------- Umzug: Maskottchen Willi + drei Wagen ---------- */
  const mkFloat = k => { const b = new BI.Batch(); b.box(0, .35, 0, 3, .7, 5, [0xff8fc8, 0x5a7ae8, 0xffd23f][k]); for (const [x, z] of [[-1.4, -1.8], [1.4, -1.8], [-1.4, 1.8], [1.4, 1.8]]) b.cyl(x, 0, z, .45, .45, .3, 0x444a5a, 10, 0, 0, Math.PI / 2);
    if (k === 0) { b.cyl(0, 1.0, 0, .12, .12, 1.4, 0xffffff, 6); b.sph(0, 2.9, 0, 1.2, 0xffd6e8, 1); b.sph(.6, 2.6, .4, .8, 0xff8fc8, 1); b.sph(-.6, 2.5, -.3, .7, 0xfff0fa, 1); }
    else if (k === 1) { b.box(0, .7, 0, 2.2, 1.8, 2.2, 0xfff0fa); for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) { b.cyl(x, .7, z, .3, .3, 2.6, 0xfff0fa, 8); b.cone(x, 3.3, z, .5, .9, 0xc23a8a, 8); } b.cone(0, 2.5, 0, 1.4, 1.8, 0x5a7ae8, 8); b.sph(0, 4.5, 0, .2, GOLD_(), 1); }
    else { b.cyl(0, .7, 0, .1, .1, 1.5, 0xffffff, 6); b.sph(0, 2.9, 0, .9, GOLD_(), 0, 1, 1, .35); for (let i = 0; i < 5; i++) { const g = i / 5 * TAU; b.cone(Math.sin(g) * 1.0, 2.9 + Math.cos(g) * 1.0, 0, .3, 1, GOLD_(), 4, 0); } b.sph(0, 2.9, 0, .5, 0xfff3b0, 1); }
    const m = b.mesh(mat); m.frustumCulled = false; const g = new THREE.Group(); g.add(m); g.visible = false; scene.add(g); return g; };
  const FL = [0, 1, 2].map(mkFloat); let willi = null; try { willi = BI.makeWilli(); willi.root.scale.setScalar(1.4); willi.root.visible = false; scene.add(willi.root); } catch (e) { willi = null; }
  let par = null; /* { t, joinT } */
  const PA0 = -62, PA1 = 24, PSPD = 2.0;
  function startParade(manual) { if (par) return false; par = { t: 0, joinT: 0, got: false }; say('🎭 Der Märchen-Umzug beginnt! Lauf mit – Willi tanzt voran!', 4200); A.fanfare && A.fanfare(); return true; }
  /* ---------- Stempelheft ---------- */
  const STAMPS = [['eis', '❄️', 'Frostgipfel'], ['fels', '🦁', 'Königsfels'], ['schiff', '🏴‍☠️', 'Piratenschiff'], ['lagune', '🧜', 'Perlenlagune'], ['basar', '🪔', 'Wüsten-Basar'], ['dschungel', '🌴', 'Honigwald'], ['spielzeug', '🧸', 'Spielzeug-Land'], ['grusel', '🎃', 'Gruselhügel'], ['strand', '🏖️', 'Strand der Träume'], ['nimmer', '🌙', 'Nimmerland']];
  /* ---------- Mausohren ---------- */
  const EARS = (() => { const b = new BI.Batch(); for (const sd of [-1, 1]) { b.sph(sd * .27, 0, 0, .2, 0x1c1c20, 1, 1, 1, .35); b.sph(sd * .27, 0, .05, .13, 0xff8fc8, 1, 1, 1, .2); } b.box(0, -.12, 0, .55, .05, .05, 0x1c1c20); const g = new THREE.Group(); g.add(b.mesh(mat)); g.visible = false; return g; })();
  const wearEars = () => { const ch = G.char && G.char(); if (!ch) return; const on = !!S().ear; if (EARS.parent !== ch.group) { if (EARS.parent) EARS.parent.remove(EARS); ch.group.add(EARS); EARS.position.set(0, 1.92, -.03); } EARS.visible = on && !P.veh; };
  /* ---------- Fahrten (Film-Fahrten wie in der Wasserrutsche) ---------- */
  const catmull = (pts, u) => { const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), t = f - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
  const WALTZ = [392, 494, 587, 494, 440, 523, 659, 523, 392, 494, 587, 784, 659, 587, 523, 494];
  function startRide(kind) {
    const s = S(); let r = null;
    if (kind === 'carousel') r = { kind, dur: 14, from: Math.atan2(P.x - L(PL.carousel.a, PL.carousel.b).x, P.z - L(PL.carousel.a, PL.carousel.b).z) };
    else if (kind === 'boat') r = { kind, dur: 20 };
    else r = { kind: 'ice', dur: 4.2, path: PL.slide.map(p => { const q = L(p[0], p[1]); return [q.x, p[2] + .2, q.z]; }) };
    r.t = 0; r.n = 0; K.ride = r; s.ride[kind] = (s.ride[kind] | 0) + 1; persist(); A.whoosh && A.whoosh();
    say(kind === 'carousel' ? '🎠 Das Karussell dreht sich – festhalten!' : kind === 'boat' ? '🦢 Das Schwanenboot gleitet durch die Lagune …' : '🛷 Wiiiii – die Eisrutsche!', 2600);
    if (s.ride[kind] === 1) { stars(1); earn(kind === 'carousel' ? 'karussell' : kind === 'boat' ? 'schwan' : 'eisrutsche'); }
  }
  function endRide() {
    const r = K.ride; K.ride = null; const g = G.char().group; g.rotation.set(0, P.h, 0); G.char().armL.rotation.set(0, 0, 0); G.char().armR.rotation.set(0, 0, 0);
    if (r.kind === 'carousel') { const c = L(PL.carousel.a, PL.carousel.b); P.x = c.x + Math.sin(r.from) * 7.4; P.z = c.z + Math.cos(r.from) * 7.4; P.y = 0; say('🎠 Das war schön! Nochmal?', 2200); }
    else if (r.kind === 'boat') { const d = L(PL.dock.a, PL.dock.b); P.x = d.x; P.z = d.z; P.y = 0; say('🦢 Schön war die Fahrt!', 2200); }
    else { P.y = W.groundY(P.x, P.z); A.splash && A.splash(); fx.burst(P.x, .4, P.z, 24, [BI.C.white, [.6, .85, 1]], 5, 1.2, 28, 6); say('❄️ Schnee-Schleuder! Das war toll!', 2200); }
    P.vy = 0;
  }
  /* ---------- Show ---------- */
  let show = null, showCd = 0, parCd = 0;
  function startShow() { if (show) return; if (showCd > 0) { say('🎆 Die nächste Schloss-Show startet gleich – kurz warten!', 2400); return; } show = { t: 0, n: 0 }; showCd = 45; A.fanfare && A.fanfare(); say('🎆 Schloss-Show! Schau zum Schloss hoch!', 4200); const s = S(); if (!s.once.show) { s.once.show = 1; stars(1); earn('schlossshow'); persist(); } }
  /* ---------- Aktionen ---------- */
  K.near = function () {
    if (P.veh || P.y > 8 || K.ride || !onIsle()) return null; const s = S();
    if (nr(SP.mp_carousel, 7.6)) return { k: 'mcar', label: ['🎠', 'Karussell fahren'] };
    if (nr(SP.mp_dock, 3.2)) return { k: 'mboat', label: ['🦢', 'Schwanenboot fahren'] };
    if (nr(SP.mp_ice, 3.5) && P.y > 4.5) return { k: 'mice', label: ['🛷', 'Eisrutsche!'] };
    if (nr(SP.mp_show, 3)) return { k: 'mshow', label: ['🎆', 'Schloss-Show starten'] };
    if (nr(SP.mp_parade, 3)) return { k: 'mpar', label: ['🎭', 'Umzug starten'] };
    if (nr(SP.mp_popcorn, 3.6)) return { k: 'mpop', label: ['🍿', 'Popcorn kaufen'] };
    if (nr(SP.mp_ears, 3.8)) return { k: 'mear', label: ['🐭', s.ear ? 'Mausohren abnehmen' : 'Mausohren aufsetzen'] };
    if (nr(SP.mp_willi, 3.4)) return { k: 'mwilli', label: ['💛', 'Willi umarmen'] };
    return null;
  };
  K.busy = () => !!K.ride;
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'mcar') startRide('carousel'); else if (n.k === 'mboat') startRide('boat'); else if (n.k === 'mice') startRide('ice'); else if (n.k === 'mshow') startShow();
    else if (n.k === 'mpar') { if (parCd > 0) say('🎭 Der nächste Umzug startet gleich – kurz warten!', 2400); else if (startParade(true)) parCd = 60; }
    else if (n.k === 'mpop') { const now = performance.now(); if (now - (K.popT == null ? -1e9 : K.popT) < 25000) { say('🍿 Du hast gerade erst Popcorn – gleich wieder!', 2200); return; } K.popT = now; stars(1); A.buy && A.buy(); fx.burst(P.x, 2, P.z, 14, [[1, .95, .6], [1, 1, 1], [1, .6, .8]], 3, 1, 26, 4); say('🍿 Knusper-Popcorn! +1 ⭐', 2600); if (!s.once.pop) { s.once.pop = 1; persist(); } }
    else if (n.k === 'mear') { s.ear = s.ear ? 0 : 1; persist(); A.pop && A.pop(); fx.burst(P.x, 2, P.z, 14, [[1, .6, .8], [1, 1, 1]], 3, 1, 26, 3); say(s.ear ? '🐭 Mausohren! Jetzt bist du ein Märchenpark-Star.' : '🐭 Mausohren abgenommen.', 2600); if (s.ear && !s.once.ear) { s.once.ear = 1; stars(1); earn('mausohren'); persist(); } }
    else if (n.k === 'mwilli') { fx.burst(SP.mp_willi.x, 2.4, SP.mp_willi.z, 16, [[1, .4, .6], [1, .8, .9], [1, 1, 1]], 3, 1.2, 30, 2); A.hello && A.hello(); K.hug = ((K.hug | 0) + 1) % 3; say(['💛 Willi: „Hihi! Ich mag Umarmungen!“', '💛 Willi: „Der Umzug beginnt bald – lauf mit!“', '💛 Willi: „Hast du schon alle Stempel im Heft?“'][K.hug], 3600); if (!s.once.willi) { s.once.willi = 1; stars(1); persist(); } }
  };
  /* ---------- Bild für Bild ---------- */
  let fireT = 0;
  K.update = function (dt, t) {
    const raw = Math.min(dt, .25); showCd = Math.max(0, showCd - raw); parCd = Math.max(0, parCd - raw); wearEars();
    const ins = onIsle(); const near = Math.hypot(P.x - M.x, P.z - M.z) < 220;
    CAR.visible = BOAT.visible = near; if (!near) return;
    /* Karussell dreht immer langsam, schneller beim Fahren */
    CAR.rotation.y += raw * (K.ride && K.ride.kind === 'carousel' ? 1.5 : .25);
    /* Stempel einsammeln */
    if (ins && !P.veh) { const s = S(); for (const [id, ic, nm] of STAMPS) { const q = SP[id]; if (!q || s.st.includes(id)) continue; if (Math.hypot(P.x - q.x, P.z - q.z) < 7) { s.st.push(id); A.star && A.star(); fx.burst(P.x, 1.6, P.z, 12, [[1, .9, .5], [1, 1, 1]], 3, 1, 28, 3); say('🔖 Stempel: ' + ic + ' ' + nm + '! (' + s.st.length + ' von 10)', 2600); if (s.st.length === 5) { stars(2); say('🔖 5 Stempel! +2 ⭐', 2800); } if (s.st.length === 10) { stars(5); A.fanfare && A.fanfare(); earn('stempel'); say('🔖 Stempelheft voll! Alle 10 Stempel! +5 ⭐', 4600); } persist(); } } }
    /* automatischer Umzug alle ~3 Minuten, wenn jemand auf der Insel ist */
    if (ins && !par && !show) { K.autoT = (K.autoT == null ? 100 : K.autoT) - raw; if (K.autoT <= 0) { K.autoT = 200; if (parCd <= 0) startParade(false); } }
    /* Show */
    if (show) { show.t += raw; const cq = L(40, 0); if (show.t > show.n * .55) { const k = show.n++, cols = [[[1, .8, .3], [1, 1, 1]], [[1, .4, .7], [1, 1, 1]], [[.4, .8, 1], [1, 1, 1]], [[.7, .5, 1], [1, 1, 1]]][k % 4]; fx.burst(cq.x + (Math.random() - .5) * 26, 34 + Math.random() * 18, cq.z + (Math.random() - .5) * 26, 40, cols, 7, 1.6, 34, 3); A.pop && A.pop(); [523, 659, 784, 1047][k % 4] && note([523, 659, 784, 1047][k % 4], .5, 'triangle', .1); }
      beams.forEach((m, i) => { m.visible = true; m.rotation.z = Math.sin(show.t * 1.3 + i * 1.7) * .5; m.rotation.x = Math.cos(show.t * 1.1 + i) * .4; m.position.y = 30; });
      if (show.t > 17) { show = null; beams.forEach(m => m.visible = false); say('🎆 Bravo! Das war die Schloss-Show!', 2600); } }
    /* Umzug */
    if (par) { par.t += raw; const dist = PA0 + par.t * PSPD, along = a => L(a, 0);
      const lead = dist, offs = [0, -7, -14, -21]; if (willi) { const q = along(lead); willi.root.visible = true; willi.root.position.set(q.x, 0, q.z); willi.root.rotation.y = Math.atan2(M.ux, M.uz); willi.set('dance', t); }
      let nearest = 99; FL.forEach((g, i) => { const a = lead + offs[i + 1], q = along(a); g.visible = a > PA0 - 6 && a < PA1 + 8; g.position.set(q.x, Math.sin(t * 3 + i) * .04, q.z); g.rotation.y = Math.atan2(M.ux, M.uz); nearest = Math.min(nearest, Math.hypot(P.x - q.x, P.z - q.z)); });
      if (Math.random() < raw * 6) { const q = along(lead - 3); fx.emit(q.x + (Math.random() - .5) * 4, 3 + Math.random() * 2, q.z + (Math.random() - .5) * 4, 0, -1, 0, 1.8, 22, .5, .95, 1, [1, .6, .9][(Math.random() * 3) | 0], .9); }
      if (par.t % 2 < raw) note(WALTZ[(par.t / 2 | 0) % WALTZ.length], .5, 'triangle', .08);
      if (nearest < 7 && !P.veh) { par.joinT += raw; if (par.joinT > 8 && !par.got) { par.got = true; stars(1); A.star && A.star(); say('🎭 Du hast beim Umzug mitgemacht! +1 ⭐', 3200); const s = S(); if (!s.once.par) { s.once.par = 1; earn('umzug'); persist(); } } }
      if (lead > PA1 + 30) { par = null; if (willi) willi.root.visible = false; FL.forEach(g => g.visible = false); say('🎭 Der Umzug ist vorbei – bis zum nächsten Mal!', 2600); } }
    /* Fahrten */
    const r = K.ride; if (!r) return; r.t += raw; const u = Math.min(1, r.t / r.dur), ch = G.char(), g = ch.group;
    if (r.n < 16 && r.t > r.n * .9 && r.kind !== 'ice') note(WALTZ[r.n++ % WALTZ.length], .8, 'triangle', .09);
    if (r.kind === 'carousel') { const c = L(PL.carousel.a, PL.carousel.b), ang = r.from + u * TAU * 2.2; P.x = c.x + Math.sin(ang) * 3.6; P.z = c.z + Math.cos(ang) * 3.6; P.y = .45 + 1.5 + Math.sin(u * TAU * 14) * .4; P.h = ang + Math.PI / 2; g.position.set(P.x, P.y, P.z); g.rotation.set(0, P.h, 0); ch.pose(0, 0, false); ch.armL.rotation.set(-2.5, 0, .3); ch.armR.rotation.set(-2.5, 0, -.3); }
    else if (r.kind === 'boat') { const ph = -Math.PI / 2 + u * TAU, a = PL.lagoon.a + Math.cos(ph) * PL.boatR, b = PL.lagoon.b + Math.sin(ph) * PL.boatR, q = L(a, b), q2 = L(PL.lagoon.a + Math.cos(ph + .1) * PL.boatR, PL.lagoon.b + Math.sin(ph + .1) * PL.boatR); const h = Math.atan2(q2.x - q.x, q2.z - q.z); BOAT.position.set(q.x, .1 + Math.sin(r.t * 2) * .05, q.z); BOAT.rotation.y = h; P.x = q.x; P.z = q.z; P.y = .7; P.h = h; g.position.set(P.x, P.y, P.z); g.rotation.set(0, h, 0); ch.pose(0, 0, false); ch.armR.rotation.set(-1.6, 0, -.3); ch.armR.rotation.x = -1.2 + Math.sin(r.t * 4) * .2; if (u > .97) BOAT.position.copy(L(PL.dock.a, PL.dock.b - 2.4)), BOAT.rotation.y = 0; }
    else { const e = u * u * .4 + u * .6, p = catmull(r.path, e), q = catmull(r.path, Math.min(1, e + .04)); P.x = p[0]; P.y = p[1]; P.z = p[2]; P.h = Math.atan2(q[0] - p[0], q[2] - p[2]); g.position.set(P.x, P.y, P.z); g.rotation.set(-.5, P.h, 0); ch.pose(0, 0, false); ch.armL.rotation.set(-2.6, 0, .4); ch.armR.rotation.set(-2.6, 0, -.4); if (Math.random() < raw * 25) fx.emit(P.x, P.y + .3, P.z, (Math.random() - .5), 1.5, (Math.random() - .5), .6, 22, .8, .95, 1, 6, .9); }
    if (u >= 1) endRide();
  };
  K.log = function () {
    const s = S(), n = ((s.ride.carousel ? 1 : 0) + (s.ride.boat ? 1 : 0) + (s.ride.ice ? 1 : 0) + (s.once.show ? 1 : 0) + (s.once.par ? 1 : 0) + (s.st.length >= 10 ? 1 : 0) + (s.once.willi ? 1 : 0) + (s.once.pop ? 1 : 0) + (s.once.ear ? 1 : 0));
    return { title: '🎠 Märchenland: Mitmachen', count: n + ' von 9', rows: [
      { ok: !!s.ride.carousel, icon: '🎠', text: 'Mit dem Märchen-Karussell fahren', dest: 'maerchen' }, { ok: !!s.ride.boat, icon: '🦢', text: 'Schwanenboot durch die Perlenlagune fahren', dest: 'maerchen' }, { ok: !!s.ride.ice, icon: '🛷', text: 'Vom Frostgipfel die Eisrutsche hinuntersausen', dest: 'maerchen' },
      { ok: !!s.once.show, icon: '🎆', text: 'Die Schloss-Show starten (Pult vor dem Schloss)', dest: 'schloss' }, { ok: !!s.once.par, icon: '🎭', text: 'Beim Umzug mitlaufen (8 Sekunden bei den Wagen bleiben)', dest: 'maerchen' },
      { ok: s.st.length >= 10, icon: '🔖', text: 'Stempelheft füllen: ' + s.st.length + ' von 10 Orten besucht', dest: 'maerchen' }, { ok: !!s.once.willi, icon: '💛', text: 'Willi am Märchentor umarmen', dest: 'maerchen' }, { ok: !!s.once.pop, icon: '🍿', text: 'Popcorn kaufen', dest: 'maerchen' }, { ok: !!s.once.ear, icon: '🐭', text: 'Mausohren aufsetzen', dest: 'maerchen' }] };
  };
  K.dbg = { startRide, endRide, startShow, startParade, STAMPS, get par() { return par; }, get show() { return show; }, CAR, BOAT };
  return K;
};

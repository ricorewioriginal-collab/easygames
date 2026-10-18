'use strict';
/* Bunte Insel – Freizeitpark (Erweiterung): eigene Insel im Osten, über eine Brücke erreichbar.
   Riesenrad 🎡, Karussell 🎠, Kettenkarussell, Achterbahn 🎢, Autoscooter, Imbissbuden (Zuckerwatte, Popcorn, Eis) und Besucher.
   Alles sparsam: Boden/Wege/Gerüste in wenigen Sammel-Meshes, nur die drehenden Teile sind eigene Objekte. */
BI.PARK = { x: 285, z: 20, R: 56, bridge: { x0: 168, x1: 232, z0: 15.5, z1: 24.5 }, arena: { x0: 249, x1: 267, z0: -11, z1: 3 }, office: { x: 246, z: 8 } };

/* ---------- Boden, Brücke, Eingang, Wege (statisch, in die Welt-Sammelgeometrie) ---------- */
BI.buildParkGround = function (c) {
  const { W, st, lamp, ROADY, GRASS, SAND } = c, P = BI.PARK, WD = 0x8a5a33, COL = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8fc8];
  W.park = P; W.spots.park = { x: P.bridge.x1 + 4, z: P.z };
  st.disc(P.x, P.z, P.R + 9, 0, GRASS, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, SAND, 56);
  /* Brücke (entlang x) */
  { const b = P.bridge, L = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, 0x9a6b3d); for (let x = b.x0 + 1; x < b.x1; x += 2) st.rect(x, b.z0, x + .08, b.z1, ROADY + .01, 0x7a5230);
    for (let x = b.x0 + 2; x < b.x1; x += 6) st.rect(x, P.z - .12, x + 2.4, P.z + .12, ROADY + .015, 0xfff3c0);
    for (const sd of [-1, 1]) { const z = P.z + sd * 4.6; st.box(cx, 0, z, L, 1.15, .25, 0xc8803c); st.box(cx, 1.15, z, L, .1, .35, 0xe3a45a); W.addBox(b.x0 + 2, sd > 0 ? z - .15 : z - .15, b.x1, sd > 0 ? z + .15 : z + .15, false, 1.3); }
    for (let x = b.x0 + 4; x < b.x1; x += 10) for (const sd of [-1, 1]) st.cyl(x, -1.6, P.z + sd * 3.8, .45, .5, 1.62, 0x6b4a2a, 8); }
  /* Eingangstor mit Regenbogen-Bogen */
  { const gx = P.bridge.x1 + 1.5; for (const sd of [-1, 1]) { st.box(gx, 0, P.z + sd * 6.2, .7, 6.5, .7, 0xffffff); st.sph(gx, 7, P.z + sd * 6.2, 1.1, COL[(sd + 1) ? 1 : 0], 1); }
    for (let i = 0; i < 12; i++) st.box(gx, 6.5 + Math.sin(i / 11 * Math.PI) * 1.2, P.z - 6.2 + i * 1.127, .8, .9, 1.2, COL[i % COL.length]); W.spots.parkGate = { x: gx, y: 8.6, z: P.z }; }
  /* Promenade + Platz + Ring */
  const pave = (x0, z0, x1, z1) => { for (let i = 0; i < Math.floor((x1 - x0) / 3); i++) for (let j = 0; j < Math.floor((z1 - z0) / 2); j++) st.rect(x0 + i * 3, z0 + j * 2, x0 + i * 3 + 3, z0 + j * 2 + 2, ROADY + .01, (i + j) % 2 ? 0xf1e4c8 : 0xe3d0a8); };
  pave(P.bridge.x1, P.z - 4, P.x - 12, P.z + 4);
  st.disc(P.x, P.z, 13, ROADY + .01, 0xf1e4c8, 36); st.ring(P.x, P.z, 9, 13, ROADY + .02, 0xffd23f, 36); st.ring(P.x, P.z, 4.5, 5.2, ROADY + .02, 0xff8fc8, 24);
  /* Wege zu den Attraktionen */
  const way = (x0, z0, x1, z1, w) => { const l = Math.hypot(x1 - x0, z1 - z0); st.strip((x0 + x1) / 2, (z0 + z1) / 2, w, l, Math.atan2(x1 - x0, z1 - z0), ROADY + .012, 0xe3d0a8); };
  way(P.x, P.z, 258, -4, 3); /* nur der Weg zum Autoscooter ist fest – alle anderen Wege legt der Parkdirektor selbst (js/tycoon.js) */
  /* Brunnen mit Wasserspiel */
  st.cyl(P.x, 0, P.z, 3.6, 3.9, .7, 0xcfd6e2, 18); st.cyl(P.x, .65, P.z, 3.2, 3.2, .1, 0x57c4ff, 18); st.cyl(P.x, .5, P.z, .5, .7, 3, 0xff8fc8, 8); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; st.sph(P.x + Math.sin(a) * 1.2, 3.4, P.z + Math.cos(a) * 1.2, .35, COL[i], 1); } W.addCircle(P.x, P.z, 3.9, false, 1.4);
  /* Laternen mit Lichterkette */
  for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2, x = P.x + Math.sin(an) * 15.5, z = P.z + Math.cos(an) * 15.5; st.cyl(x, 0, z, .08, .1, 4.2, 0x555a66, 6); lamp.sph(x, 4.4, z, .34, COL[a % COL.length], 1); }
  for (let x = P.bridge.x1 + 6; x < P.x - 14; x += 9) for (const sd of [-1, 1]) { st.cyl(x, 0, P.z + sd * 5, .08, .1, 4.2, 0x555a66, 6); lamp.sph(x, 4.4, P.z + sd * 5, .34, COL[((x / 9) | 0) % COL.length], 1); }
  /* Bäume, Bänke, Ballons am Rand */
  const crnd = BI.rng(909); for (let i = 0; i < 26; i++) { const an = crnd() * 6.283, d = 51.5 + crnd() * 3, x = P.x + Math.sin(an) * d, z = P.z + Math.cos(an) * d; if (x < P.bridge.x1 + 4 && Math.abs(z - P.z) < 8) continue; st.cyl(x, 0, z, .2, .3, 2, WD, 6); st.sph(x, 3.2, z, 1.6, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); BI.isleTree(x, z, 4); }
  /* Park-Büro: kleines Häuschen am Eingang (hier verwaltet man den Park, Tafel mit Missionen) */
  { const O = BI.PARK.office; st.box(O.x, 0, O.z, 6.4, 3.4, 3.8, 0xfff0c0); st.box(O.x, 3.4, O.z, 7.2, .35, 4.6, 0xe0382b); for (let i = 0; i < 6; i++) st.box(O.x - 3 + i * 1.2, 3.75, O.z, .6, .12, 4.6, i % 2 ? 0xffffff : 0xe0382b);
    st.box(O.x - 1.4, 0, O.z + 1.95, 1.3, 2.3, .12, 0x8a5a33); st.box(O.x + 1.4, 1.1, O.z + 1.95, 1.8, 1.0, .12, 0xa8dcff); st.box(O.x + 1.4, .9, O.z + 2.2, 2.0, .15, .6, 0x8a5a33); st.sph(O.x, 4.7, O.z, .5, 0xffd23f, 1);
    W.addBox(O.x - 3.3, O.z - 1.95, O.x + 3.3, O.z + 1.95, false, 4); W.spots.parkOffice = { x: O.x, z: O.z + 4.2 }; }
  for (const [x, z, r] of [[270, 14, 0], [296, 26, Math.PI], [270, 26, Math.PI], [296, 14, 0]]) { st.box(x, .4, z, 2, .12, .6, 0xc8803c); st.box(x, .52, z + (r ? .3 : -.3), 2, .5, .12, 0xc8803c); st.box(x - .8, 0, z, .12, .4, .5, 0x555a66); st.box(x + .8, 0, z, .12, .4, .5, 0x555a66); W.addBox(x - 1, z - .3, x + 1, z + .3, false, .8); }
};

/* ---------- Laufzeit: Fahrgeschäfte (frei platzierbar), Autoscooter, Besucher ----------
   Jedes Fahrgeschäft entsteht in lokalen Koordinaten um seinen Mittelpunkt (x, z) und lässt sich beliebig oft bauen, verschieben und verkaufen
   (die Verwaltung dazu steckt in js/tycoon.js). fp = Grundfläche lokal [x0, z0, x1, z1] zum Platzieren. */
BI.PARK_RIDES = {
  carousel: { icon: '🎠', name: 'Karussell', fp: [-10, -10, 10, 10] },
  chain: { icon: '🪢', name: 'Kettenkarussell', fp: [-9.5, -9.5, 9.5, 9.5] },
  ferris: { icon: '🎡', name: 'Riesenrad', fp: [-11, -4, 11, 7] },
  coaster: { icon: '🎢', name: 'Achterbahn', fp: [-18, -18, 19.5, 11.5] }
};
BI.createPark = function (G) {
  const { scene, W, A, fx, P, say } = G, K = { ride: null, rides: [], noRide: false }, PK = BI.PARK, TAU = Math.PI * 2, COL = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8fc8];
  const ch = () => G.char();
  const mat = BI.mat(), gmat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: .6, depthWrite: false }); K.ghostMat = gmat;
  const shade = c => { const k = .78, f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); };
  /* Schilder: ein Material je Text (gemeinsam genutzt), nur das Sprite ist pro Fahrgeschäft neu */
  const sgn = {};
  const sign = (txt, x, y, z, w) => {
    let m = sgn[txt]; if (!m) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 56; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#16335e'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff'; c.fillText(txt, 256, 50); m = sgn[txt] = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }); }
    const sp = new THREE.Sprite(m); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); return sp;
  };
  K.sign = sign;
  const d2 = (x, z) => Math.hypot(P.x - x, P.z - z);
  /* ===== gemeinsame Teile ===== */
  let _gg = null; const gondGeo = () => _gg || (_gg = (() => { const b = new BI.Batch(); b.box(0, -1.5, 0, 1.7, 1.1, 1.9, 0xffffff); b.box(0, -.4, 0, 1.9, .2, 2.1, 0xe0e0e0); b.cone(0, -.2, 0, 1.3, .7, 0xffffff, 4); b.box(0, -.4, 0, .1, .6, .1, 0x555a66); return b.mesh(mat).geometry; })());
  /* Achterbahn-Strecke (lokal, für alle Bahnen gleich): Mittelpunkte der Strecke, Länge, Position nach Weg */
  const CO = (() => {
    const s = .85, RAW = [[-20, 8, 1.2], [-20, -1, 6], [-20, -14, 15], [-8, -20, 6], [6, -20, 11], [18, -14, 4], [22, -2, 9], [14, 8, 3.5], [2, 12, 8], [-10, 12, 2.5]], PATH = RAW.map(p => [p[0] * s, p[2], p[1] * s]);
    const catmull = (pts, u) => { const n = pts.length, f = ((u % 1) + 1) % 1 * n, i = Math.floor(f), t = f - i, p0 = pts[(i + n - 1) % n], p1 = pts[i % n], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
    const TR = [{ u: 0, s: 0 }]; let acc = 0, prev = catmull(PATH, 0); const M = 240; for (let i = 1; i <= M; i++) { const u = i / M, p = catmull(PATH, u); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]); TR.push({ u, s: acc }); prev = p; }
    const L = acc, uAt = q => { q = ((q % L) + L) % L; let lo = 0, hi = TR.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TR[m].s <= q) lo = m; else hi = m; } const a = TR[lo], b = TR[hi]; return a.u + (b.u - a.u) * ((q - a.s) / Math.max(1e-6, b.s - a.s)); };
    return { PATH, catmull, L, uAt };
  })();
  const rotp = (x, z, a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
  const gm = new THREE.Matrix4(), gp = new THREE.Vector3(), gq = new THREE.Quaternion(), gs = new THREE.Vector3(1, 1, 1), gcc = new THREE.Color();
  const grp = (R, b, M, y) => { const g = new THREE.Group(); g.add(b.mesh(M)); g.position.set(0, y || 0, 0); R.root.add(g); return g; };

  /* ===== die vier Fahrgeschäfte ===== */
  const DEF = {
    ferris(R, g) {
      const M = g ? gmat : mat, FY = 16, FR = 13, N = 12, w = .27; R.a = 0;
      { const b = new BI.Batch(); for (const sd of [-1, 1]) { b.box(-9, 0, sd * 2.2, .7, FY + .5, .7, 0xffffff, 0, 0, .55); b.box(9, 0, sd * 2.2, .7, FY + .5, .7, 0xffffff, 0, 0, -.55); } b.box(0, 0, 0, 20, .5, 6, 0x8a5a33); b.cyl(0, FY - .5, -1.6, .7, .7, 3.2, 0xe0382b, 10, Math.PI / 2);
        for (let i = 0; i < 5; i++) b.box(-4 + i * 2, .5, 4.2, 1.6, 1.2, .2, COL[i % COL.length]); R.root.add(b.mesh(M)); }
      const wheel = (() => { const b = new BI.Batch(), n = 24; for (const zz of [-1.4, 1.4]) { for (let i = 0; i < n; i++) { const a = i / n * TAU; b.box(Math.cos(a) * FR, Math.sin(a) * FR - .15, zz, 2 * Math.PI * FR / n + .1, .3, .35, i % 2 ? 0xffd23f : 0xff5a5a, 0, 0, a + Math.PI / 2); } for (let i = 0; i < N; i++) { const a = i / N * TAU; b.box(Math.cos(a) * FR / 2, Math.sin(a) * FR / 2 - .1, zz, FR, .2, .22, 0xffffff, 0, 0, a); } } for (let i = 0; i < N; i++) { const a = i / N * TAU; b.box(Math.cos(a) * FR, Math.sin(a) * FR - .1, 0, .2, .2, 2.8, 0xdddddd); } b.cyl(0, -.6, 0, .9, .9, 1.2, 0xe0382b, 10, Math.PI / 2); return grp(R, b, M, FY); })();
      const gond = new THREE.InstancedMesh(gondGeo(), M === mat ? M.clone() : M, N); gond.frustumCulled = false; gond.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.root.add(gond); for (let i = 0; i < N; i++) gond.setColorAt(i, gcc.setHex(COL[i % COL.length]));
      const gpos = i => { const a = i / N * TAU + R.a; return { x: Math.sin(a) * FR, y: FY - Math.cos(a) * FR, a }; };
      const place = () => { for (let i = 0; i < N; i++) { const q = gpos(i); gp.set(q.x, q.y, 0); gm.compose(gp, gq, gs); gond.setMatrixAt(i, gm); } gond.instanceMatrix.needsUpdate = true; }; place();
      R.tick = (dt, act) => { if (!act) return; R.a += w * dt; wheel.rotation.z = R.a; place(); };
      R.near = () => d2(R.x, R.z + 4.6) < 2.6;
      R.board = () => { let bi = 0, ba = 1e9; for (let i = 0; i < N; i++) { const a = ((gpos(i).a % TAU) + TAU) % TAU, dd = Math.min(a, TAU - a); if (dd < ba) { ba = dd; bi = i; } } return { kind: 'ferris', R, i: bi, dur: TAU / w + 1, exit: [R.x, R.z + 4.6], msg: '🎡 Das Riesenrad dreht sich – genieße die Aussicht!' }; };
      R.pose = (r, dt, t, c, gg) => { const q = gpos(r.i); P.x = R.x + q.x; P.z = R.z; P.y = q.y - 1.55; gg.position.set(P.x, P.y + .35, P.z); gg.rotation.set(0, Math.PI, 0); c.sit(); c.armL.rotation.set(-.7, 0, .3); c.armR.rotation.set(-.7, 0, -.3); return r.t >= r.dur; };
      R.sign = '🎡 Riesenrad'; R.signAt = [0, FY + FR + 3, 0, 6];
      if (!g) { R.cols.push(W.addBox(R.x - 10, R.z - 3, R.x - 8, R.z + 3, false, 6), W.addBox(R.x + 8, R.z - 3, R.x + 10, R.z + 3, false, 6)); }
    },
    carousel(R, g) {
      const M = g ? gmat : mat, CR = 6.2, N = 8; R.a = 0;
      { const b = new BI.Batch(); b.cyl(0, 0, 0, 8.4, 8.6, .3, 0x8a5a33, 20); R.root.add(b.mesh(M)); }
      const b = new BI.Batch(); b.cyl(0, 0, 0, 7.6, 7.6, .5, 0xffd23f, 24); b.cyl(0, .5, 0, 7.2, 7.2, .1, 0xffffff, 24); b.cyl(0, .5, 0, .8, .8, 6.5, 0xff8fc8, 10); b.cone(0, 7.0, 0, 8.4, 2.6, 0xe0382b, 16); b.cyl(0, 6.8, 0, 8.2, 8.2, .3, 0xffffff, 16);
      for (let i = 0; i < N; i++) { const a = i / N * TAU, x = Math.sin(a) * CR, z = Math.cos(a) * CR; b.cyl(x, .5, z, .07, .07, 5.8, 0xffd23f, 5); const col = COL[i % COL.length]; b.box(x, 1.6, z, .6, .8, 1.5, col, a); b.box(x, 2.35, z, .5, .6, .7, shade(col), a); b.box(x, 2.4, z, .35, .7, .45, shade(col), a); }
      const top = grp(R, b, M);
      R.tick = (dt, act) => { if (!act) return; R.a += dt * .8; top.rotation.y = R.a; };
      R.near = () => { const d = d2(R.x, R.z); return d < 10 && d > 8.6; };
      R.board = () => { let bi = 0, ba = 1e9; for (let i = 0; i < N; i++) { const a = i / N * TAU + R.a, d = Math.hypot(P.x - (R.x + Math.sin(a) * CR), P.z - (R.z + Math.cos(a) * CR)); if (d < ba) { ba = d; bi = i; } } return { kind: 'carousel', R, i: bi, dur: 26, canStop: true, exit: [R.x + 9.8 * Math.sin(P.h + Math.PI), R.z + 9.8 * Math.cos(P.h + Math.PI)], msg: '🎠 Hüh! Das Karussell fährt los – mit 🚪 absteigen', snd: 'melody' }; };
      R.pose = (r, dt, t, c, gg) => { const a = r.i / N * TAU + R.a; P.x = R.x + Math.sin(a) * CR; P.z = R.z + Math.cos(a) * CR; P.y = 1.45 + Math.sin(t * 3 + r.i) * .35; gg.position.set(P.x, P.y, P.z); gg.rotation.set(0, a + Math.PI / 2, 0); c.sit(); c.armL.rotation.set(-1.3, 0, .15); c.armR.rotation.set(-1.3, 0, -.15); return r.t >= r.dur; };
      R.sign = '🎠 Karussell'; R.signAt = [0, 10.4, 0, 5];
      if (!g) R.cols.push(W.addCircle(R.x, R.z, 8.6, false, .8));
    },
    chain(R, g) {
      const M = g ? gmat : mat, CR = 5.4, N = 10, H = 9; R.a = 0; R.sw = 0;
      { const b = new BI.Batch(); b.cyl(0, 0, 0, 7.4, 7.6, .3, 0x8a5a33, 20); R.root.add(b.mesh(M)); }
      const b = new BI.Batch(); b.cyl(0, 0, 0, .9, 1.1, H + 1, 0xdddddd, 10); b.cyl(0, H, 0, 5.2, 5.2, .35, 0xe0382b, 20); b.cone(0, H + .35, 0, 5.4, 2.2, 0xffd23f, 16);
      for (let i = 0; i < N; i++) { const a = i / N * TAU, x = Math.sin(a) * CR, z = Math.cos(a) * CR; b.cyl(x, 3.0, z, .03, .03, H - 3, 0x555a66, 4); b.box(x, 2.8, z, .9, .12, .9, COL[i % COL.length], a); b.box(x, 2.8, z - Math.cos(a) * .4, .9, .7, .15, COL[i % COL.length], a); }
      const top = grp(R, b, M);
      R.tick = (dt, act, r) => { if (!act) return; R.a += dt * (.9 + .4 * Math.min(1, r ? r.t / 4 : 0)); top.rotation.y = R.a; };
      R.near = () => { const d = d2(R.x, R.z); return d < 8.8 && d > 7.4; };
      R.board = () => ({ kind: 'chain', R, i: (Math.random() * N) | 0, dur: 24, canStop: true, exit: [R.x + 8.6 * Math.sin(P.h + Math.PI), R.z + 8.6 * Math.cos(P.h + Math.PI)], msg: '🪢 Festhalten! Das Kettenkarussell schwingt hinaus …', snd: 'whoosh' });
      R.pose = (r, dt, t, c, gg) => { const a = r.i / N * TAU + R.a, sw = .75 * Math.min(1, r.t / 4), rr = CR + (H - 3) * Math.sin(sw) * .55, y = 2.8 + (H - 3) * (1 - Math.cos(sw)) * 1.2; P.x = R.x + Math.sin(a) * rr; P.z = R.z + Math.cos(a) * rr; P.y = y; gg.position.set(P.x, P.y, P.z); gg.rotation.set(0, a + Math.PI / 2, 0); c.sit(); c.armL.rotation.set(-1.2, 0, .3); c.armR.rotation.set(-1.2, 0, -.3); return r.t >= r.dur; };
      R.sign = '🪢 Kettenkarussell'; R.signAt = [0, H + 4.2, 0, 6];
      if (!g) R.cols.push(W.addCircle(R.x, R.z, 1.2, false, 6));
    },
    coaster(R, g) {
      const M = g ? gmat : mat, { PATH, catmull, L, uAt } = CO; R.cs = 0;
      { const b = new BI.Batch(); for (let s = 0; s < L; s += 1.1) { const u = uAt(s), p = catmull(PATH, u), q = catmull(PATH, uAt(s + .5)), yaw = Math.atan2(q[0] - p[0], q[2] - p[2]), pitch = -Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2]));
          for (const sd of [-.6, .6]) { const o = rotp(sd, 0, yaw); b.box(p[0] + o[0], p[1] - .1, p[2] + o[1], .12, .12, 1.3, 0xe0382b, yaw, pitch); } if ((s / 1.1 | 0) % 2 === 0) b.box(p[0], p[1] - .22, p[2], 1.5, .1, .25, 0x8a5a33, yaw, pitch);
          if (p[1] > 1.8 && (s / 1.1 | 0) % 7 === 0) b.cyl(p[0], 0, p[2], .22, .3, p[1] - .25, 0xdddddd, 6); }
        const s0 = PATH[0]; b.box(s0[0] + 2.4, 0, s0[2], 2, .5, 8, 0x8a5a33); b.box(s0[0] + 3.4, 0, s0[2] - 2, .2, 3.4, .2, 0xffffff); b.box(s0[0] + 3.4, 0, s0[2] + 2, .2, 3.4, .2, 0xffffff); b.box(s0[0] + 2.4, 3.2, s0[2], 2.6, .3, 8.4, 0xe0382b); R.root.add(b.mesh(M)); }
      const cart = (() => { const b = new BI.Batch(); b.box(0, 0, 0, 1.5, .5, 3.0, 0xe0382b); b.box(0, .5, -1.2, 1.5, .8, .3, 0xffd23f); for (const z of [-.7, .7]) b.box(0, .5, z, 1.5, .25, .6, 0xffffff); b.box(0, .5, 1.4, 1.2, .5, .3, 0xff8a1f); const gg = new THREE.Group(); gg.add(b.mesh(M)); gg.rotation.order = 'YXZ'; R.root.add(gg); return gg; })();
      const onTrack = s => { const u = uAt(s), p = catmull(PATH, u), q = catmull(PATH, uAt(s + .6)); cart.position.set(p[0], p[1] - .05, p[2]); cart.rotation.y = Math.atan2(q[0] - p[0], q[2] - p[2]); cart.rotation.x = -Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2])); return { p, yaw: cart.rotation.y, pitch: cart.rotation.x }; }; onTrack(0);
      R.tick = (dt, act, r) => { if (!act || r) return; R.cs += dt * 5; onTrack(R.cs); };
      const s0 = PATH[0];
      R.near = () => d2(R.x + s0[0] + 3.4, R.z + s0[2]) < 3.2;
      R.board = () => ({ kind: 'coaster', R, s: 0, laps: 2, dur: 90, exit: [R.x + s0[0] + 5.2, R.z + s0[2]], msg: '🎢 Achterbahn! Hände hoch! 🙌', snd: 'whoosh' });
      R.pose = (r, dt, t, c, gg) => {
        const p0 = catmull(PATH, uAt(r.s)), v = r.t < 3 ? 3 + r.t * 2.5 : Math.max(5.5, 7.5 + (15 - p0[1]) * .95 + 2); r.s += v * dt; const tr = onTrack(r.s);
        P.x = R.x + tr.p[0]; P.z = R.z + tr.p[2]; P.y = tr.p[1] + .2; gg.position.set(P.x, P.y, P.z); gg.rotation.order = 'YXZ'; gg.rotation.set(tr.pitch, tr.yaw, 0); c.sit(); c.armL.rotation.set(-2.9 + Math.sin(t * 6) * .15, 0, .35); c.armR.rotation.set(-2.9 - Math.sin(t * 6) * .15, 0, -.35);
        if (Math.random() < dt * 14) fx.emit(P.x, tr.p[1] - .2, P.z, (Math.random() - .5) * 2, .5, (Math.random() - .5) * 2, .5, 22, 1, .85, .4, 0, .9);
        if (r.s >= L * r.laps || r.t > r.dur) { gg.rotation.order = 'XYZ'; return true; } return false; };
      R.sign = '🎢 Achterbahn'; R.signAt = [0, 20, -14, 6];
    }
  };
  function mk(kind, x, z, ghost) {
    if (!DEF[kind]) return null; const R = { kind, x, z, root: new THREE.Group(), cols: [], ghost: !!ghost }; R.root.position.set(x, 0, z); DEF[kind](R, ghost);
    if (!ghost && R.sign) R.root.add(sign(R.sign, R.signAt[0], R.signAt[1], R.signAt[2], R.signAt[3]));
    scene.add(R.root); return R;
  }
  function dispose(R) { scene.remove(R.root); R.root.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry) o.geometry.dispose(); }); for (const c of R.cols) W.removeCollider(c); R.cols.length = 0; }
  K.addRide = (kind, x, z) => { const R = mk(kind, x, z, false); if (R) K.rides.push(R); return R; };
  K.removeRide = R => { if (K.ride && K.ride.R === R) end(true); const i = K.rides.indexOf(R); if (i >= 0) K.rides.splice(i, 1); dispose(R); };
  /* Vorschau-Fahrgeschäft (durchsichtig, ohne Kollision) – eines je Sorte, wird nur verschoben */
  const ghosts = {}; K.ghost = kind => { let R = ghosts[kind]; if (!R) { R = ghosts[kind] = mk(kind, 0, 0, true); if (R) R.root.visible = false; } return R; };
  K.clearGhosts = () => { for (const k of Object.keys(ghosts)) { if (ghosts[k]) dispose(ghosts[k]); delete ghosts[k]; } };

  /* ===== Autoscooter-Halle (fest) ===== */
  { const a = PK.arena, b = new BI.Batch(), cx = (a.x0 + a.x1) / 2, cz = (a.z0 + a.z1) / 2; b.box(cx, 0, cz, a.x1 - a.x0, .06, a.z1 - a.z0, 0x3a3f4d); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) b.box(a.x0 + 1.5 + i * 3, .06, a.z0 + 1.75 + j * 3.5, 3, .02, 3.5, 0x4a5064);
    const fence = (x0, z0, x1, z1) => { b.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, 1.1, z1 - z0, 0xe0382b); b.box((x0 + x1) / 2, 1.1, (z0 + z1) / 2, x1 - x0, .15, z1 - z0, 0xffffff); W.addBox(x0, z0, x1, z1, false, 1.4); };
    fence(a.x0 - .4, a.z0 - .4, a.x1 + .4, a.z0); fence(a.x0 - .4, a.z1, a.x1 + .4, a.z1 + .4); fence(a.x0 - .4, a.z0, a.x0, a.z1); fence(a.x1, a.z0, a.x1 + .4, a.z1 - 4); /* Tor an der Ostseite offen (z1-4..z1 zu) */
    for (const [x, z] of [[a.x0, a.z0], [a.x1, a.z0], [a.x0, a.z1], [a.x1, a.z1]]) b.cyl(x, 0, z, .2, .2, 5, 0xdddddd, 6); b.box(cx, 5, cz, a.x1 - a.x0, .25, a.z1 - a.z0, 0x4da3ff, 0, 0, 0); for (let i = 0; i < 10; i++) b.box(a.x0 + i * 1.9, 5.25, cz, .3, .5, a.z1 - a.z0, COL[i % COL.length]);
    const m = b.mesh(mat); scene.add(m); K.arenaCenter = { x: cx, z: cz }; scene.add(sign('🚗 Autoscooter', cx, 7, cz, 5)); }
  { const g = W.spots.parkGate; if (g) scene.add(sign('🎡 Willkommen im Freizeitpark!', g.x - .5, g.y + 1.2, g.z, 9)); }

  /* ===== Interaktion ===== */
  K.near = function () {
    if (P.veh || K.ride || P.y > 1.5 || K.noRide) return null; if (Math.hypot(P.x - PK.x, P.z - PK.z) > PK.R + 4) return null;
    for (const R of K.rides) if (R.near()) return { k: R.kind, R };
    return null;
  };
  K.busy = () => !!K.ride;
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'stop') { if (K.ride && K.ride.canStop) end(true); else say('Bitte noch sitzen bleiben 😊 – gleich ist die Fahrt vorbei', 1800); return; }
    const R = n.R; if (!R || !K.rides.includes(R) || K.ride) return;
    const o = R.board(); K.ride = Object.assign({ t: 0 }, o); A.pop && A.pop(); G.earn('play'); G.earn('park'); if (o.snd && A[o.snd]) A[o.snd](); say(o.msg, 3000); if (G.onRide) G.onRide(o.kind);
  };
  const cd = {}; K.ready = (k, ms) => { const n = performance.now(); if (n - (cd[k] == null ? -1e9 : cd[k]) < ms) return false; cd[k] = n; return true; };
  function end(manual) {
    const r = K.ride; if (!r) return; K.ride = null; const g = ch().group, c = ch(); g.rotation.set(0, P.h, 0); c.armL.rotation.set(0, 0, 0); c.armR.rotation.set(0, 0, 0); c.legL.rotation.x = c.legR.rotation.x = 0;
    const q = W.resolve(r.exit[0], r.exit[1], .5, {}); P.x = q.x; P.z = q.z; P.y = W.groundY(P.x, P.z); P.vy = 0; g.position.set(P.x, P.y, P.z);
    if (!manual && K.ready('star' + r.kind, 45000)) { G.addStars(1); say('⭐ Tolle Fahrt! +1 ⭐', 1800); A.star && A.star(); } else if (!manual) say('😄 Das war toll! Nochmal?', 1600);
    fx.burst(P.x, 1.2, P.z, 8, [BI.C.gold, BI.C.white], 3, .8, 26, 3);
  }
  K.stop = () => { if (K.ride && K.ride.canStop) end(true); else if (K.ride) say('Bitte noch sitzen bleiben 😊 – gleich ist die Fahrt vorbei', 1800); };
  /* ---------- Bewegung ---------- */
  K.update = function (dt, t) {
    const r = K.ride, near = r || Math.hypot(P.x - PK.x, P.z - PK.z) < PK.R + 30;
    for (const R of K.rides) R.tick(dt, near, r && r.R === R ? r : null);
    if (!r) return; r.t += dt;
    if (r.R.pose(r, dt, t, ch(), ch().group)) end(false);
  };
  /* ---------- Besucher (feste Gesprächspartner auf dem Platz am Brunnen) ---------- */
  K.people = function (folk) {
    const mk2 = (x, z, look, name, lines, h) => { const cc = BI.makeChar(look); cc.group.position.set(x, 0, z); cc.group.rotation.y = h; scene.add(cc.group); const n = { c: cc, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const pr = [
      ['Clown Pippo', 0xff5a5a, 'party', ['Hihi! Ich habe heute schon 100 Luftballons aufgepustet! 🎈', 'Warum können Clowns so gut Fahrrad fahren? Weil sie Übung haben! 🤡', 'Hast du schon dein eigenes Fahrgeschäft gebaut? Frag im Park-Büro!']],
      ['Kartenfrau Kim', 0x4da3ff, 'cap', ['Im Park ist alles gratis, nur Naschen kostet einen Stern! 🍬', 'Mit dem Park-Büro 🏢 am Eingang baust du deinen eigenen Freizeitpark.', 'Am Karussell kannst du jederzeit mit 🚪 absteigen.']],
      ['Zuckerwatte-Zoe', 0xff8fc8, 'none', ['Zuckerwatte ist nur gesponnener Zucker – und ganz viel Glück! 🍥', 'Stell einen Stand neben einen Weg, dann kommen die Gäste!', 'Im Rucksack 🎒 kannst du deine Naschereien essen.']],
      ['Karussell-Karl', 0xffd23f, 'none', ['Such dir das schönste Pferd aus! 🐴', 'Ich fahre seit 30 Jahren im Kreis – und mir wird nie schwindelig.', 'Ohne Weg findet kein Gast dein Karussell!']],
      ['Bahn-Berta', 0xe0382b, 'cap', ['Hände hoch beim Looping! 🙌', 'Für die Achterbahn musst du erst forschen – im Park-Büro.', 'Wer schreit, fährt schneller. Stimmt gar nicht, aber es macht Spaß!']],
      ['Autoscooter-Anton', 0x4cd07d, 'cap', ['Fahr zu den Autoscootern – Rempeln erlaubt! 🚗', 'Ganz sanft anstoßen, dann lacht jeder.', 'Mit dem Joystick lenkst du, mit B gibst du Gas.']],
      ['Zauberer Zarino', 0xb36bff, 'wizard', ['Abrakadabra – ein Stern hinter deinem Ohr! ✨', 'Müll in der Ecke? Mülleimer machen deine Gäste glücklich.', 'Im Park gibt es abends bunte Lichter, schau mal!']]
    ];
    pr.forEach((p, i) => { const a = i / pr.length * TAU + .4, x = PK.x + Math.sin(a) * 9.5, z = PK.z + Math.cos(a) * 9.5; mk2(x, z, { shirt: p[1], pants: 0x3d4a7a, hair: 0x6b4423, skin: 0xffd2a8, hat: p[2], scale: .96 }, p[0], p[3], a + Math.PI); });
    const kids = [['Mia', ['Ich war schon dreimal im Riesenrad! 🎡', 'Mir ist ein bisschen schwindelig, aber lustig!', 'Hast du Zuckerwatte probiert?']], ['Lukas', ['Die Achterbahn war mega! 🎢', 'Ich will gleich nochmal!', 'Wer rempelt, gewinnt im Autoscooter!']], ['Emma', ['Ich habe einen Luftballon bekommen! 🎈', 'Das Karussell ist mein Lieblingsplatz.', 'Magst du Popcorn?']], ['Tim', ['Ich bin zu klein für die ganz große Bahn – sagt Mama. 😅', 'Hihi, die Kette schwingt weit raus!', 'Komm, wir fahren zusammen!']]];
    kids.forEach((k, i) => { const a = i / kids.length * TAU + 1.1, x = PK.x + Math.sin(a) * 6.6, z = PK.z + Math.cos(a) * 6.6; mk2(x, z, { shirt: COL[i], pants: 0x5a3d2b, hair: 0xd9a441, skin: 0xf3c9a0, hat: 'party', scale: .62 }, k[0], k[1], i * 1.3); });
  };
  K.arena = PK.arena;
  return K;
};

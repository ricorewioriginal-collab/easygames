'use strict';
/* Bunte Insel – Themenbereiche 🎪: vier neue Ecken auf vorhandenen Inseln, jede mit eigenem kleinen Spiel (inspiriert von anderen easygames):
   ⛳ Minigolf auf der Fußball-Insel (3 Bahnen, zielen + Schlagkraft mit zwei Tipps – wie bei Funk-Golf),
   🦕 Dino-Ausgrabung auf der Rätsel-Insel (6 Hügel ausgraben, Skelett im Museum zusammensetzen),
   🍭 Zuckerland auf der Regenbogeninsel (Lebkuchenhaus, Bonbon-Jagd mit Zeit, Zuckerwatte),
   🔭 Sternwarte auf der Hauptinsel (Sternbilder verbinden – wie bei KIKO Sterneninseln).
   Statisches in die Welt-Sammelgeometrie (BI.buildThemenGround, world.js), Bewegtes hier. Spielstand: save.themen (nur Felder ergänzt). */
BI.THEMEN = {
  golf: { x: -256, z: 143, ic: '⛳', name: 'Minigolf', isle: 'FUSSBALL', L: 28, x0: -270, lanes: [137.4, 143, 148.6], W: 4.2 },
  dino: { x: -236, z: 370, ic: '🦕', name: 'Dino-Ausgrabung', isle: 'RAETSEL' },
  zucker: { x: -311, z: 36, ic: '🍭', name: 'Zuckerland', isle: 'RAINBOW' },
  stern: { x: -62, z: 130, ic: '🔭', name: 'Sternwarte', isle: null }
};
/* Hindernisse je Minigolf-Bahn (u = entlang der Bahn ab Abschlag, v = quer): Kästen [u0, u1, v0, v1]; Bahn 3 hat eine drehende Windmühle */
BI.THEMEN.golf.obst = [[[12, 13.2, -.7, .7]], [[8.5, 9.5, -2.1, .25], [16.5, 17.5, -.25, 2.1]], []];
BI.THEMEN.golf.mill = { lane: 2, u: 17, len: 1.75 };
BI.THEMEN.dino.mounds = [[-8, -6], [0, -9], [8, -6], [-8, 5], [1, 8], [9, 4]];

BI.buildThemenGround = function (c) {
  const { W, st } = c, T = BI.THEMEN;
  /* ---------- ⛳ Minigolf ---------- */
  { const G = T.golf, hw = G.W / 2, WD = 0x9a6a3a, FELT = [0x4fbf5a, 0x45b452, 0x5ac865];
    st.rect(G.x0 - 4, G.lanes[0] - hw - 1.4, G.x0 + G.L + 1.6, G.lanes[2] + hw + 1.4, .012, 0xe9dcb8); /* heller Kiesweg rundherum */
    G.lanes.forEach((zc, i) => {
      st.rect(G.x0, zc - hw, G.x0 + G.L, zc + hw, .03, FELT[i]);
      st.rect(G.x0 + .8, zc - .5, G.x0 + 2.2, zc + .5, .034, 0xffffff); /* Abschlag */
      for (const sd of [-1, 1]) st.box(G.x0 + G.L / 2, 0, zc + sd * (hw + .12), G.L + .5, .26, .24, WD);
      st.box(G.x0 - .12, 0, zc, .24, .26, G.W + .5, WD); st.box(G.x0 + G.L + .12, 0, zc, .24, .26, G.W + .5, WD);
      for (const o of G.obst[i]) { const cu = (o[0] + o[1]) / 2, cv = (o[2] + o[3]) / 2; st.box(G.x0 + cu, 0, zc + cv, o[1] - o[0], .45, o[3] - o[2], [0xff8a1f, 0x4da3ff, 0xb36bff][i]); st.box(G.x0 + cu, .45, zc + cv, o[1] - o[0] + .08, .06, o[3] - o[2] + .08, 0xffffff); }
      const cu = G.x0 + G.L - 3; st.disc(cu, zc, .19, .036, 0x1c2430, 16); st.cyl(cu, 0, zc, .025, .025, 1.6, 0xffffff, 6);
      st.box(cu + .23, 1.32, zc, .44, .28, .02, [0xff5a5a, 0xffd23f, 0xff8fc8][i]);
      st.box(G.x0 - 1.3, 0, zc, .5, .9, .1, 0xffffff); st.box(G.x0 - 1.3, .62, zc + .06, .4, .26, .02, [0xff5a5a, 0xffd23f, 0xff8fc8][i]); /* Bahn-Nummer */
    });
    /* Windmühle (Bahn 3): Häuschen neben der Bahn, die Flügel drehen sich (createThemen) */
    { const zc = G.lanes[G.mill.lane]; st.cyl(G.x0 + G.mill.u, 0, zc + hw + 1.6, .9, 1.15, 2.6, 0xfff0c8, 10); st.cone(G.x0 + G.mill.u, 2.6, zc + hw + 1.6, 1.25, 1.2, 0xe0382b, 10); W.addCircle(G.x0 + G.mill.u, zc + hw + 1.6, 1.2, false, 3); }
    /* Kasse mit Schläger-Ständer und Schild */
    { const kx = G.x0 - 3, kz = G.lanes[0] - 3.4; st.box(kx, 0, kz, 2.2, 2.2, 1.6, 0xfff7e0); st.box(kx, 2.2, kz, 2.6, .2, 2, 0x2f8cff); st.box(kx + 1.12, .9, kz, .02, .7, 1.2, 0x9fd8ff); W.addBox(kx - 1.1, kz - .8, kx + 1.1, kz + .8, false, 2.4);
      for (let i = 0; i < 4; i++) st.cyl(kx - .6 + i * .4, 0, kz + 1.1, .03, .03, .9, [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d][i], 6); }
    W.spots.golf = { x: G.x0 - 2.2, z: G.lanes[1] };
  }
  /* ---------- 🦕 Dino-Ausgrabung ---------- */
  { const D = T.dino, X = D.x, Z = D.z, ROPE = 0xd8b070, POST = 0x8a5a33;
    st.disc(X, Z, 11.5, .02, 0xe6cc8f, 40); st.ring(X, Z, 11.5, 12.2, .022, 0xcfb06e, 40);
    for (let i = 0; i < 16; i++) { const a = i / 16 * BI.TAU, x = X + Math.sin(a) * 12.4, z = Z + Math.cos(a) * 12.4; if (Math.abs(Math.sin(a)) > .97 && Math.cos(a) < 0) continue; st.cyl(x, 0, z, .07, .08, 1, POST, 6); }
    for (let i = 0; i < 16; i++) { const a0 = i / 16 * BI.TAU, a1 = (i + 1) / 16 * BI.TAU; if ((Math.abs(Math.sin(a0)) > .97 && Math.cos(a0) < 0) || (Math.abs(Math.sin(a1)) > .97 && Math.cos(a1) < 0)) continue; const x0 = X + Math.sin(a0) * 12.4, z0 = Z + Math.cos(a0) * 12.4, x1 = X + Math.sin(a1) * 12.4, z1 = Z + Math.cos(a1) * 12.4; st.box((x0 + x1) / 2, .78, (z0 + z1) / 2, .05, .05, Math.hypot(x1 - x0, z1 - z0), ROPE, Math.atan2(x1 - x0, z1 - z0)); }
    /* Forscherzelt, Museumssockel, Werkzeug */
    st.prism(X - 7.5, 0, Z - 1, 4, 2.6, 4.2, 0x6aa86a, Math.PI / 2); st.box(X - 7.5, 0, Z - 1, .1, 2.3, .1, POST); W.addBox(X - 9.6, Z - 3, X - 5.4, Z + 1, false, 2.6);
    st.box(X, 0, Z - 1.2, 5, .55, 2.4, 0xd9d2c3); st.box(X, .55, Z - 1.2, 5.2, .08, 2.6, 0xf3eee2); st.box(X, 0, Z + .15, 1.6, .9, .08, 0x8a5a33); st.box(X, .5, Z + .2, 1.3, .32, .02, 0xffe8a8); W.addBox(X - 2.5, Z - 2.4, X + 2.5, Z, false, 1);
    st.box(X + 6.2, 0, Z - 8.8, .9, .45, .6, 0x8a5a33); st.cyl(X + 6.9, 0, Z - 8.6, .03, .03, 1.1, POST, 6); st.box(X + 6.9, 0, Z - 8.6, .26, .08, .34, 0x9aa5b8);
    W.spots.dino = { x: X, z: Z + 2.5 };
  }
  /* ---------- 🍭 Zuckerland ---------- */
  { const Q = T.zucker, X = Q.x, Z = Q.z, CAN = [0xff5a8f, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8a1f];
    st.disc(X, Z, 7.6, .025, 0xffd9ec, 40); st.ring(X, Z, 7.6, 8.1, .027, 0xffffff, 40);
    /* Lebkuchenhaus */
    const hx = X - 1.5, hz = Z - 3.2; st.box(hx, 0, hz, 4.4, 2.8, 3.4, 0xb8763c); st.prism(hx, 2.8, hz, 4.9, 1.9, 3.9, 0xffb3d1); st.box(hx, 2.8, hz, 4.9, .14, 3.9, 0xffffff);
    st.box(hx, 0, hz + 1.72, 1.2, 1.9, .08, 0x7a4a24); st.sph(hx, 1.98, hz + 1.75, .42, 0xff5a8f, 1, 1, 1, .3);
    for (const sd of [-1, 1]) { st.box(hx + sd * 1.45, 1.35, hz + 1.72, .8, .8, .06, 0xffffff); st.box(hx + sd * 1.45, 1.35, hz + 1.75, .6, .6, .06, 0x9fd8ff); }
    for (let i = 0; i < 9; i++) st.sph(hx - 2 + i * .5, 2.75, hz + 1.74, .12, CAN[i % 6], 1);
    W.addBox(hx - 2.25, hz - 1.75, hx + 2.25, hz + 1.75, false, 4.5);
    /* Lutscher-Bäume */
    for (let i = 0; i < 5; i++) { const a = -.4 + i * .95, x = X + Math.sin(a) * 6.3, z = Z + Math.cos(a) * 6.3; st.cyl(x, 0, z, .07, .07, 2.4, 0xffffff, 8); st.cyl(x, 2.9, z - .1, .75, .75, .2, CAN[i], 20, Math.PI / 2); st.cyl(x, 2.9, z - .09, .45, .45, .24, 0xffffff, 20, Math.PI / 2); st.cyl(x, 2.9, z - .08, .22, .22, .28, CAN[(i + 2) % 6], 16, Math.PI / 2); W.addCircle(x, z, .25, false, 3); }
    /* Zuckerstangen-Tor (Eingang Richtung Inselmitte) */
    { const gz = Z + 8.6; for (const sd of [-1, 1]) for (let k = 0; k < 7; k++) st.cyl(X + 1.5 + sd * 1.8, k * .45, gz, .16, .16, .45, k % 2 ? 0xffffff : 0xe0382b, 10);
      for (let k = 0; k < 9; k++) { const a = Math.PI * k / 8, x = X + 1.5 - Math.cos(a) * 1.8, y = 3.15 + Math.sin(a) * .9; st.sph(x, y, gz, .2, k % 2 ? 0xffffff : 0xe0382b, 1); } }
    /* Riesen-Muffin + Zuckerwatte-Maschine */
    st.cyl(X + 4.2, 0, Z - 2.6, .95, .75, 1.1, 0xff8fc8, 18); st.sph(X + 4.2, 1.2, Z - 2.6, 1.05, 0xfff3e0, 2, 1, .75, 1); st.sph(X + 4.2, 1.95, Z - 2.6, .26, 0xe0382b, 1); for (let i = 0; i < 8; i++) { const a = i / 8 * BI.TAU; st.box(X + 4.2 + Math.sin(a) * .7, 1.45, Z - 2.6 + Math.cos(a) * .7, .16, .05, .05, CAN[i % 6], a); } W.addCircle(X + 4.2, Z - 2.6, 1.05, false, 2.2);
    st.box(X - 4.6, 0, Z + 2.2, 1.2, .95, .9, 0xffffff); st.cyl(X - 4.6, .95, Z + 2.2, .5, .38, .4, 0xd0d8e8, 14); st.sph(X - 4.6, 1.75, Z + 2.2, .55, 0xffb3e6, 2); W.addBox(X - 5.2, Z + 1.75, X - 4, Z + 2.65, false, 1.4);
    W.spots.zucker = { x: X + 1.5, z: Z + 6.2 };
  }
  /* ---------- 🔭 Sternwarte ---------- */
  { const S = T.stern, X = S.x, Z = S.z;
    st.disc(X, Z, 6.4, .02, 0xd9dfe8, 36); st.ring(X, Z, 6.4, 6.9, .022, 0x6a7fb8, 36);
    st.cyl(X, 0, Z, 3.2, 3.3, 3.2, 0xf4f6fb, 24); st.cyl(X, 3.05, Z, 3.36, 3.36, .2, 0x3d5aa8, 24); st.sph(X, 3.2, Z, 3.2, 0xe6ebf5, 3, 1, .92, 1);
    st.box(X, 3.4, Z - 2.1, .9, 2.6, 2.4, 0x2a3358, 0, -.55); st.cyl(X, 4.1, Z - 1.6, .32, .42, 2.6, 0x9aa5b8, 14, -.75);
    st.box(X, 0, Z - 3.25, 1.3, 2.2, .1, 0x3d5aa8); st.sph(X, 2.55, Z - 3.27, .3, 0xffd23f, 1, 1, 1, .2);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * BI.TAU; st.sph(X + Math.sin(a) * 3.32, 1.9, Z + Math.cos(a) * 3.32, .09, 0xffd23f, 0); }
    W.addCircle(X, Z, 3.35, false, 6.5);
    /* Fernrohr auf Dreibein vor der Tür */
    const tx = X + 2.6, tz = Z - 4.6; for (let k = 0; k < 3; k++) { const a = k / 3 * BI.TAU; st.cyl(tx + Math.sin(a) * .28, 0, tz + Math.cos(a) * .28, .03, .03, 1.2, 0x555a66, 5, Math.cos(a) * .22, 0, -Math.sin(a) * .22); }
    st.cyl(tx, 1.25, tz - .1, .11, .15, 1.1, 0x3d5aa8, 12, -1.0); st.sph(tx, 1.2, tz, .12, 0x555a66, 1); W.addCircle(tx, tz, .4, false, 1.6);
    W.spots.stern = { x: X + 1.2, z: Z - 6 };
  }
};

BI.createThemen = function (G) {
  const { scene, W, A, fx, P, say, addStars } = G, T = BI.THEMEN, TAU = BI.TAU, K = { mode: null, open: false };
  const S = () => { const s = G.save.themen || (G.save.themen = {}); s.golf = s.golf || { holes: [0, 0, 0], best: 0, n: 0 }; s.dino = s.dino || { bones: [], done: false }; s.zucker = s.zucker || { best: 0, done: false }; s.stern = s.stern || { done: [] }; return s; };
  const near = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  const snd = (n, ...a) => { try { A[n] && A[n](...a); } catch (e) { } };
  const mat = BI.mat();
  if (window.BunteInselI18n && BunteInselI18n.addDictionary) BunteInselI18n.addDictionary(BI.THEMEN_EN || {});
  /* Schild mit Symbol + Name über jedem Bereich */
  function sign(text, x, y, z) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c = cv.getContext('2d'); let fs = 54; c.font = 'bold 54px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const tw = c.measureText(text).width; if (tw > 440) { fs = Math.floor(54 * 440 / tw); c.font = 'bold ' + fs + 'px Fredoka, system-ui, sans-serif'; }
    c.fillStyle = 'rgba(255,255,255,.92)'; const w = Math.min(500, c.measureText(text).width + 50); c.beginPath(); if (c.roundRect) c.roundRect(256 - w / 2, 14, w, 100, 50); else c.rect(256 - w / 2, 14, w, 100); c.fill();
    c.fillStyle = '#16335e'; c.fillText(text, 256, 66);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: BI.labelTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(4.4, 1.1, 1); sp.position.set(x, y, z); scene.add(sp); return sp;
  }
  const NPC = (o, x, z, h) => { const c = BI.makeChar(o); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); return c; };
  /* ===================== ⛳ Minigolf ===================== */
  const GF = T.golf, hw = GF.W / 2, BR = .12;
  sign('⛳ Minigolf', GF.x0 - 3, 4, GF.lanes[0] - 3.4);
  const caddie = NPC({ shirt: 0x4cd07d, pants: 0xffffff, hair: 0x6b4423, skin: 0xf3c9a0, hat: 'cap', name: 'Gustl' }, GF.x0 - 3, GF.lanes[0] - 1.9, Math.PI / 2);
  const ballG = new THREE.Mesh(new THREE.SphereGeometry(BR, 14, 10), new THREE.MeshLambertMaterial({ color: 0xffffff })); ballG.visible = false; scene.add(ballG);
  const arrow = new THREE.Group(); { const b = new BI.Batch(); b.box(0, -.04, .55, .1, .08, 1.1, 0xffd23f); b.cyl(0, .02, 1.25, 0, .22, .4, 0xff8a1f, 10, Math.PI / 2); arrow.add(b.mesh(mat)); } arrow.visible = false; scene.add(arrow);
  const mill = new THREE.Group(); { const b = new BI.Batch(); b.box(0, 0, 0, .18, .25, GF.mill.len * 2, 0x8a5a33); b.box(0, 0, 0, GF.mill.len * 2, .25, .18, 0x8a5a33); b.cyl(0, -.15, 0, .2, .2, .4, 0xe0382b, 10); mill.add(b.mesh(mat)); }
  mill.position.set(GF.x0 + GF.mill.u, .28, GF.lanes[GF.mill.lane]); scene.add(mill);
  let gs = null; /* laufende Runde: { hole, strokes, total, phase: 'aim'|'power'|'roll'|'done', u, v, vu, vv, ang, pow, t } */
  const cupU = GF.L - 3, toW = (u, v, lane) => ({ x: GF.x0 + u, z: GF.lanes[lane] + v });
  function golfStart() {
    gs = { hole: 0, strokes: 0, total: 0, phase: 'aim', u: 1.5, v: 0, vu: 0, vv: 0, t: 0, ang: 0, pow: 0, res: [] }; K.mode = 'golf'; hud(true);
    say('Gustl: „Willkommen beim Minigolf! Tipp einmal zum Zielen, dann noch einmal für die Kraft. 3 Bahnen – wenig Schläge = viele Sterne!“', 5200); snd('hello'); placeBall();
  }
  function placeBall() { const w = toW(gs.u, gs.v, gs.hole); ballG.position.set(w.x, .03 + BR, w.z); ballG.visible = true; P.x = w.x - 1.3; P.z = w.z; P.y = 0; P.vy = 0; P.h = Math.PI / 2; if (G.cam) G.cam.yaw = P.h + Math.PI; }
  function golfShot() {
    if (!gs) return;
    if (gs.phase === 'aim') { gs.phase = 'power'; gs.t = 0; snd('pop'); return; }
    if (gs.phase === 'power') { const sp = 2.2 + gs.pow * 10.5; gs.vu = Math.cos(gs.ang) * sp; gs.vv = Math.sin(gs.ang) * sp; gs.phase = 'roll'; gs.strokes++; arrow.visible = false; snd('thwack'); return; }
  }
  function holeDone(auto) {
    const n = gs.strokes, st = n <= 1 ? 3 : n <= 2 ? 2 : 1, s = S(); gs.total += n; gs.res.push(n);
    s.golf.holes[gs.hole] = s.golf.holes[gs.hole] ? Math.min(s.golf.holes[gs.hole], n) : n; addStars(st); snd('fanfare'); fx.burst(ballG.position.x, .6, ballG.position.z, 26, [BI.C.gold, BI.C.white, BI.C.green], 4, 1, 26, 6);
    say((auto ? '⛳ Ab ins Loch! ' : n === 1 ? '⛳ Ass! Mit einem Schlag! ' : '⛳ Eingelocht! ') + 'Bahn ' + (gs.hole + 1) + ': ' + n + (n === 1 ? ' Schlag' : ' Schläge') + ' · +' + st + ' ⭐', 3400);
    if (gs.hole < 2) { gs.hole++; gs.strokes = 0; gs.u = 1.5; gs.v = 0; gs.vu = gs.vv = 0; gs.phase = 'wait'; gs.wait = 1.2; } /* kurz jubeln, dann geht es an der nächsten Bahn weiter */
    else { s.golf.n++; s.golf.best = s.golf.best ? Math.min(s.golf.best, gs.total) : gs.total; G.earn('minigolf'); G.persist(); const tot = gs.total; setTimeout(() => say('🏆 Runde fertig: ' + tot + ' Schläge für 3 Bahnen' + (tot <= 6 ? ' – Profi!' : '') + ' (Bestwert ' + s.golf.best + ')', 4200), 1500); golfEnd(true); }
    G.persist();
  }
  function golfEnd(keepMsg) { gs = null; K.mode = null; ballG.visible = false; arrow.visible = false; hud(false); if (!keepMsg) say('⛳ Minigolf beendet.', 1600); }
  const millHit = (u, v) => { /* Flügel als zwei Strecken durch die Mitte (Drehwinkel = mill.rotation.y) */
    const cu = GF.mill.u, a = mill.rotation.y, L = GF.mill.len; let hit = null;
    for (const b of [a, a + Math.PI / 2]) { const du = Math.sin(b), dv = Math.cos(b), ru = u - cu, rv = v, t = BI.clamp(ru * du + rv * dv, -L, L), qu = ru - du * t, qv = rv - dv * t, d = Math.hypot(qu, qv); if (d < BR + .12) hit = { nu: qu / (d || 1), nv: qv / (d || 1), pen: BR + .12 - d }; }
    return hit;
  };
  function golfUpdate(dt, t) {
    mill.rotation.y = t * 1.1;
    if (!gs) return;
    { const ch = G.char && G.char(); if (ch) { ch.group.position.set(P.x, P.y, P.z); ch.group.rotation.set(0, P.h, 0); ch.pose(t * 2, 0, false); if (gs.phase === 'power') { ch.armL.rotation.x = ch.armR.rotation.x = -.6 - gs.pow * .9; } } }
    if (gs.phase === 'wait') { gs.wait -= dt; if (gs.wait <= 0) { gs.phase = 'aim'; gs.t = 0; placeBall(); } }
    else if ((gs.phase === 'aim' || gs.phase === 'power') && Math.hypot(P.x - ballG.position.x, P.z - ballG.position.z) > 9) { golfEnd(); return; }
    if (gs.phase === 'aim') { gs.t += dt; gs.ang = Math.sin(gs.t * 1.7) * .85; }
    else if (gs.phase === 'power') { gs.t += dt; gs.pow = .5 - .5 * Math.cos(gs.t * 2.6); }
    if (gs.phase === 'aim' || gs.phase === 'power') { arrow.visible = true; arrow.position.set(ballG.position.x, .1, ballG.position.z); arrow.rotation.y = Math.PI / 2 - gs.ang; arrow.scale.set(1, 1, gs.phase === 'power' ? .5 + gs.pow * 1.6 : 1); }
    if (gs.phase === 'roll') {
      const steps = 4, h = dt / steps, lane = gs.hole;
      for (let k = 0; k < steps; k++) {
        gs.u += gs.vu * h; gs.v += gs.vv * h;
        if (gs.v < -hw + BR) { gs.v = -hw + BR; gs.vv = Math.abs(gs.vv) * .78; snd('tin'); } if (gs.v > hw - BR) { gs.v = hw - BR; gs.vv = -Math.abs(gs.vv) * .78; snd('tin'); }
        if (gs.u < BR) { gs.u = BR; gs.vu = Math.abs(gs.vu) * .78; } if (gs.u > GF.L - BR) { gs.u = GF.L - BR; gs.vu = -Math.abs(gs.vu) * .78; snd('tin'); }
        for (const o of GF.obst[lane]) { if (gs.u > o[0] - BR && gs.u < o[1] + BR && gs.v > o[2] - BR && gs.v < o[3] + BR) { const pl = [gs.u - (o[0] - BR), (o[1] + BR) - gs.u, gs.v - (o[2] - BR), (o[3] + BR) - gs.v], m = Math.min(...pl), i = pl.indexOf(m); if (i === 0) { gs.u = o[0] - BR; gs.vu = -Math.abs(gs.vu) * .75; } else if (i === 1) { gs.u = o[1] + BR; gs.vu = Math.abs(gs.vu) * .75; } else if (i === 2) { gs.v = o[2] - BR; gs.vv = -Math.abs(gs.vv) * .75; } else { gs.v = o[3] + BR; gs.vv = Math.abs(gs.vv) * .75; } snd('tin'); } }
        if (lane === GF.mill.lane) { const mh = millHit(gs.u, gs.v); if (mh) { gs.u += mh.nu * mh.pen; gs.v += mh.nv * mh.pen; const dot = gs.vu * mh.nu + gs.vv * mh.nv; if (dot < 0) { gs.vu -= 1.8 * dot * mh.nu; gs.vv -= 1.8 * dot * mh.nv; } gs.vu += mh.nu * 1.2; gs.vv += mh.nv * 1.2; snd('bonk'); } }
        const sp = Math.hypot(gs.vu, gs.vv), dc = Math.hypot(gs.u - cupU, gs.v);
        if (dc < .26 && sp < 6.5) { gs.u = cupU; gs.v = 0; gs.vu = gs.vv = 0; gs.phase = 'done'; break; }
        if (dc < .26) { gs.vu *= .82; gs.vv += (gs.v - 0) * .5; }
        const nsp = Math.max(0, sp - (.9 + sp * .18) * h); if (sp > 0) { gs.vu *= nsp / sp; gs.vv *= nsp / sp; }
      }
      const w = toW(gs.u, gs.v, lane); ballG.position.set(w.x, .03 + BR, w.z); ballG.rotation.z -= gs.vu * dt / BR; ballG.rotation.x += gs.vv * dt / BR;
      if (gs.phase === 'done') { ballG.position.y = -.05; holeDone(false); return; }
      if (Math.hypot(gs.vu, gs.vv) < .08) { if (gs.strokes >= 6) { gs.u = cupU; gs.v = 0; const q = toW(cupU, 0, lane); ballG.position.set(q.x, -.05, q.z); holeDone(true); return; } gs.phase = 'aim'; gs.t = 0; placeBall(); }
    }
    hudText('⛳ Bahn ' + (gs.hole + 1) + '/3 · ' + gs.strokes + (gs.strokes === 1 ? ' Schlag' : ' Schläge') + (gs.phase === 'aim' ? ' · Tippen: Richtung' : gs.phase === 'power' ? ' · Tippen: Kraft!' : ''));
  }
  /* ===================== 🦕 Dino-Ausgrabung ===================== */
  const DN = T.dino, BONES = [['Schädel', '💀'], ['Wirbelsäule', '🦴'], ['Rippen', '🦴'], ['Beine', '🦵'], ['Schwanz', '🦎'], ['Kralle', '🦖']];
  sign('🦕 Dino-Ausgrabung', DN.x, 4.2, DN.z + 13);
  const prof = NPC({ shirt: 0xd9b26a, pants: 0x6b5a3a, hair: 0xe0e0e0, skin: 0xe0a979, hat: 'cowboy', glasses: true, name: 'Professorin Fossi' }, DN.x - 4.2, DN.z - 3, .9);
  const mounds = DN.mounds.map(([dx, dz], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshLambertMaterial({ color: 0xc9a46a })); m.scale.set(1.3, .55, 1.3); m.position.set(DN.x + dx, 0, DN.z + dz); scene.add(m); return { m, i, x: DN.x + dx, z: DN.z + dz, dig: 0 }; });
  /* Skelett auf dem Sockel: 6 Teile, jedes erscheint, wenn der Knochen gefunden ist */
  const skel = new THREE.Group(); skel.position.set(DN.x, .63, DN.z - 1.2); scene.add(skel);
  const BONE = 0xf2ead2, parts = [
    b => { b.sph(1.45, .95, 0, 1, BONE, 2, .38, .3, .26); b.sph(1.78, .86, 0, 1, BONE, 1, .22, .14, .2); for (const sd of [-1, 1]) b.sph(1.5, 1.04, sd * .2, .07, 0x3a3020, 1); for (let i = 0; i < 5; i++) b.cyl(1.62 + i * .07, .7, 0, .015, .03, .1, 0xffffff, 5, Math.PI); },
    b => { for (let i = 0; i < 9; i++) b.sph(.95 - i * .26, .78 - Math.sin(i / 8 * Math.PI) * -.12, 0, .1, BONE, 1); },
    b => { for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) b.cyl(.55 - i * .2, .35, sd * .16, .025, .03, .42, BONE, 6, 0, 0, 0); },
    b => { for (const [x, sd] of [[.45, 1], [.45, -1], [-.65, 1], [-.65, -1]]) { b.cyl(x, .05, sd * .2, .05, .06, .62, BONE, 8); b.sph(x + .08, .02, sd * .2, 1, BONE, 1, .14, .05, .08); } },
    b => { for (let i = 0; i < 7; i++) b.sph(-1.25 - i * .22, .72 - i * .08, 0, .085 - i * .008, BONE, 1); },
    b => { for (const sd of [-1, 1]) { b.cyl(.95, .45, sd * .2, .02, .03, .32, BONE, 6, 0, 0, .6); b.cone(1.08, .3, sd * .2, .04, .12, 0xffffff, 8); } }
  ].map(f => { const b = new BI.Batch(); f(b); const m = b.mesh(mat); m.visible = false; skel.add(m); return m; });
  skel.scale.setScalar(.9);
  function dinoSync() { const s = S().dino; parts.forEach((m, i) => { m.visible = s.bones.includes(i); }); mounds.forEach(q => { const got = s.bones.includes(q.i) && !q.re; q.m.scale.set(1.3, got ? .08 : .55 - q.dig * .14, 1.3); }); }
  /* ===================== 🍭 Zuckerland ===================== */
  const ZK = T.zucker, BIS = ZK.x, BZS = ZK.z, RB = BI.RAINBOW;
  sign('🍭 Zuckerland', ZK.x + 1.5, 4.6, ZK.z + 8.6);
  const lolli = NPC({ shirt: 0xff8fc8, pants: 0xffffff, hair: 0xb36bff, skin: 0xffe4d1, hat: 'chef', name: 'Lolli' }, ZK.x + 1.5, ZK.z + 2.5, 0);
  const bonGeo = (() => { const b = new BI.Batch(); b.sph(0, 0, 0, 1, 0xffffff, 2, .28, .22, .22); b.cyl(-.42, -.0, 0, .0, .2, .22, 0xffffff, 10, 0, 0, -Math.PI / 2); b.cyl(.42, 0, 0, .0, .2, .22, 0xffffff, 10, 0, 0, Math.PI / 2); return b.mesh(mat).geometry; })();
  const BCOL = [0xff5a8f, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8a1f];
  const bons = []; let hunt = null, wattT = -1e9;
  function huntStart() {
    if (hunt) return; const rnd = BI.rng((Date.now() / 1000) | 0); const pts = [];
    for (let tries = 0; pts.length < 12 && tries < 600; tries++) { const a = rnd() * TAU, d = 8 + Math.sqrt(rnd()) * (RB.R - 12), x = RB.x + Math.sin(a) * d, z = RB.z + Math.cos(a) * d; if (!W.free(x, z, .9) || pts.some(q => Math.hypot(q.x - x, q.z - z) < 5)) continue; pts.push({ x, z }); }
    while (bons.length) { const b = bons.pop(); scene.remove(b.m); b.m.material.dispose(); }
    for (const [i, q] of pts.entries()) { const m = new THREE.Mesh(bonGeo, new THREE.MeshLambertMaterial({ color: BCOL[i % 6], emissive: 0x222222 })); m.position.set(q.x, 1.2, q.z); scene.add(m); bons.push({ m, x: q.x, z: q.z, got: false }); }
    hunt = { t: 100, n: 0, all: bons.length }; K.mode = K.mode || 'hunt'; hud(true);
    say('Lolli: „Oh nein, der Wind hat meine Bonbons über die ganze Regenbogeninsel geweht! Sammelst du alle ' + bons.length + ' ein? Du hast 100 Sekunden!“', 5200); snd('fanfare');
  }
  function huntEnd(quit) {
    if (!hunt) return; const n = hunt.n, all = hunt.all, s = S().zucker; hunt = null; if (K.mode === 'hunt') K.mode = null; hud(false);
    while (bons.length) { const b = bons.pop(); scene.remove(b.m); b.m.material.dispose(); }
    if (quit) { say('🍬 Bonbon-Jagd beendet.', 1600); return; }
    const st = n >= all ? 4 : n >= 8 ? 2 : n > 0 ? 1 : 0; if (st) addStars(st); s.best = Math.max(s.best, n); if (n >= all) { s.done = true; G.earn('zucker'); } G.persist();
    say(n >= all ? '🍭 Alle ' + all + ' Bonbons gefunden! Lolli backt dir einen Extra-Muffin. +' + st + ' ⭐' : '🍬 ' + n + ' von ' + all + ' Bonbons gesammelt' + (st ? ' · +' + st + ' ⭐' : '') + ' – probier es gleich nochmal bei Lolli!', 4600); snd(n >= all ? 'fanfare' : 'ding');
  }
  function huntUpdate(dt, t) {
    if (!hunt) return; hunt.t -= dt;
    for (const b of bons) { if (b.got) continue; b.m.rotation.y = t * 2 + b.x; b.m.position.y = 1.15 + Math.sin(t * 3 + b.z) * .18; if (Math.hypot(P.x - b.x, P.z - b.z) < 1.5 && P.y < 3) { b.got = true; b.m.visible = false; hunt.n++; snd('coins'); fx.burst(b.x, 1.2, b.z, 14, [BI.C.pink, BI.C.gold, BI.C.white], 3, .8, 22, 4); } }
    hudText('🍬 ' + hunt.n + '/' + hunt.all + ' Bonbons · ⏱️ ' + Math.max(0, Math.ceil(hunt.t)) + ' s');
    if (hunt.n >= hunt.all || hunt.t <= 0) huntEnd(false);
  }
  /* ===================== 🔭 Sternwarte ===================== */
  const SW = T.stern;
  sign('🔭 Sternwarte', SW.x, 7.6, SW.z);
  const stella = NPC({ shirt: 0x3d5aa8, pants: 0x2a3358, hair: 0x222222, skin: 0xc68a5a, hat: 'none', name: 'Stella' }, SW.x - 1.6, SW.z - 4.4, Math.PI);
  const SB = [ /* Sternbilder: Punkte (0..10 × 0..6) und Linien-Weg (Reihenfolge der Tipps) */
    { id: 'wagen', ic: '🐻', name: 'Großer Wagen', pts: [[1, 1.6], [2.4, 1.9], [3.7, 2.5], [5, 3.1], [5.6, 4.7], [7.8, 4.6], [8.2, 2.8]], path: [0, 1, 2, 3, 4, 5, 6, 3] },
    { id: 'herz', ic: '❤️', name: 'Herz', pts: [[5, 5.2], [3, 3.6], [2.4, 2], [3.6, .9], [5, 1.8], [6.4, .9], [7.6, 2], [7, 3.6]], path: [0, 1, 2, 3, 4, 5, 6, 7, 0] },
    { id: 'fisch', ic: '🐟', name: 'Fisch', pts: [[1.4, 3], [3, 1.6], [5.4, 1.4], [7.2, 3], [5.4, 4.6], [3, 4.4], [8.8, 1.6], [8.8, 4.4]], path: [0, 1, 2, 3, 4, 5, 0, 3, 6, 7, 3] },
    { id: 'rakete', ic: '🚀', name: 'Rakete', pts: [[5, .6], [6.2, 2.2], [6.2, 4.4], [7.4, 5.4], [5, 4.8], [2.6, 5.4], [3.8, 4.4], [3.8, 2.2]], path: [0, 1, 2, 3, 4, 5, 6, 7, 0] },
    { id: 'katze', ic: '🐱', name: 'Katze', pts: [[2.6, .8], [3.6, 2.2], [6.4, 2.2], [7.4, .8], [7.6, 3.6], [5, 5.2], [2.4, 3.6]], path: [0, 1, 2, 3, 4, 5, 6, 0] }
  ];
  let ui = null, sb = null;
  function sternOpen(idx) {
    if (!ui) {
      ui = document.createElement('div'); ui.id = 'sternUI';
      ui.style.cssText = 'position:fixed;inset:0;z-index:45;background:radial-gradient(ellipse at 50% 30%,#22306a,#070b24 75%);color:#fff;display:flex;flex-direction:column;touch-action:none;font-family:Fredoka,system-ui,sans-serif';
      ui.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 14px 6px"><b id="sbTitle" style="flex:1;font-size:20px"></b><button id="sbX" aria-label="Schließen" style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:22px">✕</button></div>'
        + '<div id="sbHint" style="padding:0 16px;font-size:15px;opacity:.85"></div><canvas id="sbCv" style="flex:1;width:100%;min-height:0;display:block"></canvas>'
        + '<div style="display:flex;justify-content:center;gap:10px;padding:8px 14px max(14px,env(safe-area-inset-bottom))"><button id="sbNext" style="padding:12px 22px;border-radius:18px;background:#ff9e28;color:#fff;font-size:17px;font-weight:700" hidden>Nächstes Sternbild ➜</button></div>';
      document.body.appendChild(ui);
      ui.querySelector('#sbX').onclick = () => sternClose(); ui.querySelector('#sbNext').onclick = () => sternOpen((sb.i + 1) % SB.length);
      ui.querySelector('#sbCv').addEventListener('pointerdown', e => { e.preventDefault(); sternTap(e); });
    }
    const done = S().stern.done; if (idx == null) { idx = SB.findIndex(q => !done.includes(q.id)); if (idx < 0) idx = 0; }
    sb = { i: idx, c: SB[idx], step: 1, ok: false, shake: 0, bg: Array.from({ length: 90 }, () => [Math.random(), Math.random(), Math.random() * 1.6 + .4, Math.random() * TAU]) };
    ui.hidden = false; K.open = true; ui.querySelector('#sbNext').hidden = true;
    ui.querySelector('#sbTitle').textContent = '🔭 Sternbild ' + (idx + 1) + ' von ' + SB.length + (done.includes(sb.c.id) ? ' ✔️' : '');
    const h = 'Tippe die Sterne der Reihe nach an: 1, 2, 3 … Der blinkende Stern ist der nächste!'; ui.querySelector('#sbHint').textContent = h; if (idx === 0 || !K.sbSaid) { K.sbSaid = true; snd('speak', h); }
    resizeCv(); if (!K.sbRaf) { const loop = () => { if (!K.open) { K.sbRaf = 0; return; } drawSky(performance.now() / 1000); K.sbRaf = requestAnimationFrame(loop); }; K.sbRaf = requestAnimationFrame(loop); }
  }
  function sternClose() { if (ui) ui.hidden = true; K.open = false; }
  function resizeCv() { const cv = ui.querySelector('#sbCv'), r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.max(10, r.width * d) | 0; cv.height = Math.max(10, r.height * d) | 0; sb.d = d; }
  function starXY(p) { const cv = ui.querySelector('#sbCv'), W0 = cv.width, H0 = cv.height, sc = Math.min(W0 / 10.6, H0 / 6.6), ox = (W0 - sc * 10) / 2, oy = (H0 - sc * 6) / 2; return [ox + p[0] * sc, oy + p[1] * sc, sc]; }
  function sternTap(e) {
    if (!sb || sb.ok) return; const cv = ui.querySelector('#sbCv'), r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * sb.d, y = (e.clientY - r.top) * sb.d, c = sb.c, tgt = c.path[sb.step];
    let best = -1, bd = 1e9; c.pts.forEach((p, i) => { const q = starXY(p), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = i; } });
    const lim = starXY(c.pts[0])[2] * .75; if (bd > lim) return;
    if (best === tgt || (sb.step === 0 && best === c.path[0])) { sb.step++; snd('note', 520 + sb.step * 60, .25, 'sine', .14); if (sb.step >= c.path.length) sternDone(); }
    else if (best !== c.path[sb.step - 1]) { sb.shake = .35; snd('bonk'); }
  }
  function sternDone() {
    sb.ok = true; const s = S().stern, first = !s.done.includes(sb.c.id); snd('fanfare');
    if (first) { s.done.push(sb.c.id); addStars(2); if (s.done.length >= SB.length) G.earn('sterne'); G.persist(); }
    const msg = sb.c.ic + ' Das ist das Sternbild „' + sb.c.name + '“!' + (first ? ' +2 ⭐' : '') + (s.done.length >= SB.length && first ? ' · Alle Sternbilder gefunden! 🏅' : '');
    ui.querySelector('#sbHint').textContent = msg; snd('speak', msg); ui.querySelector('#sbNext').hidden = false;
  }
  function drawSky(t) {
    const cv = ui.querySelector('#sbCv'), c = cv.getContext('2d'), W0 = cv.width, H0 = cv.height, C = sb.c; c.clearRect(0, 0, W0, H0);
    for (const [x, y, s, ph] of sb.bg) { c.globalAlpha = .35 + .3 * Math.sin(t * 2 + ph); c.fillStyle = '#fff'; c.beginPath(); c.arc(x * W0, y * H0, s * sb.d, 0, TAU); c.fill(); }
    c.globalAlpha = 1; const sh = sb.shake > 0 ? Math.sin(t * 60) * 6 * sb.d : 0; if (sb.shake > 0) sb.shake -= 1 / 60;
    c.save(); c.translate(sh, 0);
    c.lineWidth = 4 * sb.d; c.lineCap = 'round'; c.strokeStyle = sb.ok ? '#ffe27a' : '#9fd8ff'; c.shadowColor = '#ffe27a'; c.shadowBlur = sb.ok ? 18 * sb.d : 6 * sb.d;
    c.beginPath(); for (let k = 0; k < sb.step; k++) { const q = starXY(C.pts[C.path[k]]); if (k) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); } c.stroke(); c.shadowBlur = 0;
    const order = []; for (const i of C.path) if (!order.includes(i)) order.push(i);
    C.pts.forEach((p, i) => {
      const q = starXY(p), next = !sb.ok && C.path[sb.step] === i, used = C.path.slice(0, sb.step).includes(i), r = q[2] * (.16 + (next ? .06 * (1 + Math.sin(t * 8)) : 0));
      c.fillStyle = used || sb.ok ? '#ffe27a' : next ? '#ffffff' : 'rgba(255,255,255,.75)'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? r * .45 : r; c.lineTo(q[0] + Math.cos(a) * rr, q[1] + Math.sin(a) * rr); } c.closePath(); c.fill();
      if (!sb.ok) { c.fillStyle = '#fff'; c.font = 'bold ' + Math.round(q[2] * .3) + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(String(order.indexOf(i) + 1), q[0], q[1] - r - q[2] * .08); }
    });
    if (sb.ok) { const q = starXY([5, 3]); c.font = Math.round(q[2] * 1.5) + 'px system-ui'; c.textAlign = 'center'; c.globalAlpha = .9; c.fillText(C.ic, q[0], q[1] + q[2] * .5); c.globalAlpha = 1; }
    c.restore();
  }
  /* ===================== HUD-Chip (Minigolf, Bonbon-Jagd) ===================== */
  let hudEl = null;
  function hud(on) {
    if (!hudEl) { hudEl = document.createElement('div'); hudEl.id = 'themenHud'; hudEl.style.cssText = 'position:fixed;left:50%;top:calc(max(10px,env(safe-area-inset-top)) + 64px);transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 14px;border-radius:999px;background:rgba(255,255,255,.9);color:#16335e;font:700 15px Fredoka,system-ui,sans-serif;box-shadow:0 6px 18px rgba(20,50,100,.28);max-width:calc(100vw - 24px)';
      hudEl.innerHTML = '<span id="thTxt"></span><button id="thX" aria-label="Aufhören" style="width:34px;height:34px;border-radius:50%;background:#ff8a7a;color:#fff;font-size:17px;flex:none">✕</button>'; document.body.appendChild(hudEl);
      hudEl.querySelector('#thX').onclick = () => { if (gs) golfEnd(); else if (hunt) huntEnd(true); }; }
    hudEl.hidden = !on && !gs && !hunt;
  }
  const hudText = t => { if (hudEl && hudEl.firstChild.textContent !== t) hudEl.firstChild.textContent = t; };
  /* ===================== Aktionen ===================== */
  K.busy = () => !!gs || K.open;
  K.near = function () {
    if (P.veh) return null;
    if (gs) return gs.phase === 'aim' ? { k: 'gshot', label: ['🎯', 'Richtung!'] } : gs.phase === 'power' ? { k: 'gshot', label: ['💪', 'Schlagen!'] } : null;
    if (P.y > 1.5) return null;
    if (near(W.spots.golf.x, W.spots.golf.z, 3.2) || near(caddie.group.position.x, caddie.group.position.z, 2.4)) return { k: 'golf', label: ['⛳', 'Minigolf spielen'] };
    const ds = S().dino; for (const q of mounds) if (near(q.x, q.z, 2.3) && (!ds.bones.includes(q.i) || q.re)) return { k: 'dig', q, label: ['⛏️', 'Graben (' + (q.dig + 1) + '/3)'] };
    if (near(prof.group.position.x, prof.group.position.z, 2.6) || near(DN.x, DN.z + .6, 2.4)) return { k: 'prof', label: ['🦕', 'Professorin Fossi'] };
    if (near(ZK.x - 4.6, ZK.z + 3.2, 2.2)) return { k: 'watte', label: ['🍭', 'Zuckerwatte drehen'] };
    if (near(lolli.group.position.x, lolli.group.position.z, 2.6)) return { k: 'lolli', label: hunt ? ['🍬', 'Lolli'] : ['🍬', 'Bonbon-Jagd starten'] };
    if (near(W.spots.stern.x, W.spots.stern.z, 2.6) || near(stella.group.position.x, stella.group.position.z, 2.2)) return { k: 'stern', label: ['🔭', 'Sternbilder suchen'] };
    return null;
  };
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'gshot') golfShot();
    else if (n.k === 'golf') golfStart();
    else if (n.k === 'dig') {
      const q = n.q; q.dig++; snd('chop'); fx.burst(q.x, .5, q.z, 14, [BI.C.dust, BI.C.orange], 3, .8, 24, 7); P.wave = Math.max(P.wave || 0, .4);
      if (q.dig >= 3) {
        q.dig = 0; const s = S().dino;
        if (q.re) { q.re = false; if (!K.fragT || performance.now() - K.fragT > 20000) { K.fragT = performance.now(); addStars(1); say('🦴 Ein kleiner Fossil-Splitter! +1 ⭐', 2600); } else say('🪨 Nur Steine … grab später nochmal!', 2200); }
        else { s.bones.push(q.i); addStars(1); snd('ding'); const B = BONES[q.i]; say(B[1] + ' Gefunden: ' + B[0] + '! (' + s.bones.length + ' von 6) +1 ⭐' + (s.bones.length >= 6 ? ' · Bring alles zu Professorin Fossi!' : ''), 3600); G.persist(); }
      }
      dinoSync();
    }
    else if (n.k === 'prof') {
      const s = S().dino, nb = s.bones.length;
      if (nb >= 6 && !s.done) { s.done = true; addStars(5); G.earn('dino'); G.persist(); snd('fanfare'); fx.burst(DN.x, 2, DN.z - 1.2, 40, [BI.C.gold, BI.C.white, BI.C.orange], 6, 1.4, 30, 6); say('Professorin Fossi: „Unglaublich! Ein ganzes Dino-Skelett – ein kleiner Knochen-Rex! Das kommt ins Museum. Danke, Forscher!“ +5 ⭐', 5400); mounds.forEach(q => { q.re = true; }); }
      else if (s.done) { say('Professorin Fossi: „Unser Knochen-Rex ist der Star im Museum! In den Hügeln findest du noch kleine Fossil-Splitter.“', 4200); mounds.forEach(q => { q.re = true; }); }
      else say('Professorin Fossi: „In den sechs Sandhügeln stecken Dino-Knochen! Grab jeden Hügel dreimal aus (Aktions-Knopf). Du hast schon ' + nb + ' von 6.“', 4800);
      dinoSync(); snd('hello');
    }
    else if (n.k === 'lolli') { if (hunt) say('Lolli: „Schnell, die Bonbons schweben überall auf der Regenbogeninsel! Noch ' + (hunt.all - hunt.n) + '!“', 3000); else huntStart(); }
    else if (n.k === 'watte') { const now = performance.now(); if (now - wattT < 30000) { say('🍭 Die Maschine muss erst wieder warm werden …', 2200); return; } wattT = now; addStars(1); snd('blow'); fx.burst(ZK.x - 4.6, 2, ZK.z + 2.2, 26, [BI.C.pink, BI.C.white, BI.C.purple], 3, 1.2, 30, 2); say('🍭 Sssssst – eine riesige rosa Zuckerwatte! Mmmh! +1 ⭐', 2800); }
    else if (n.k === 'stern') { snd('hello'); sternOpen(); }
  };
  K.key = function (code) { if (K.open && code === 'Escape') { sternClose(); return true; } return false; };
  K.update = function (dt, t) {
    golfUpdate(dt, t); huntUpdate(dt, t);
    if (near(caddie.group.position.x, caddie.group.position.z, 30)) caddie.pose(t * 1.1, 0, near(caddie.group.position.x, caddie.group.position.z, 7));
    if (near(DN.x, DN.z, 30)) prof.pose(t, 0, near(prof.group.position.x, prof.group.position.z, 7));
    if (near(ZK.x, ZK.z, 30)) lolli.pose(t * 1.2, 0, near(lolli.group.position.x, lolli.group.position.z, 7));
    if (near(SW.x, SW.z, 30)) stella.pose(t * .9, 0, near(stella.group.position.x, stella.group.position.z, 7));
    for (const [k, I] of [['golf', GF], ['dino', DN], ['zucker', ZK], ['stern', SW]]) { const on = near(I.x, I.z, 14); if (on && K.was !== k) { K.was = k; say(I.ic + ' ' + I.name + '! ' + TIP[k], 3800); } else if (!on && K.was === k) K.was = null; }
  };
  const TIP = { golf: 'Sprich mit Gustl und spiel drei Bahnen.', dino: 'Grab die Sandhügel aus und finde Dino-Knochen.', zucker: 'Lolli braucht Hilfe bei der Bonbon-Jagd!', stern: 'Am Fernrohr kannst du Sternbilder verbinden.' };
  K.cheatAll = function () { const s = S(); s.golf.holes = s.golf.holes.map(v => v || 2); s.golf.n = Math.max(1, s.golf.n); s.golf.best = s.golf.best || 6; s.dino.bones = [0, 1, 2, 3, 4, 5]; s.dino.done = true; s.zucker.done = true; s.zucker.best = 12; s.stern.done = SB.map(q => q.id); dinoSync(); };
  K.log = function () {
    const s = S(), r = [s.golf.n > 0, s.dino.done, s.zucker.done, s.stern.done.length >= SB.length];
    return { title: '🎪 Themenbereiche', count: r.filter(Boolean).length + ' von 4', rows: [
      { ok: r[0], icon: '⛳', text: 'Minigolf: alle 3 Bahnen spielen (Fußball-Insel)' + (s.golf.best ? ' · Bestwert ' + s.golf.best : ''), dest: 'minigolf' },
      { ok: r[1], icon: '🦕', text: 'Dino-Ausgrabung: 6 Knochen finden und zu Professorin Fossi bringen (Rätsel-Insel)' + (r[1] ? '' : ' · ' + s.dino.bones.length + ' von 6'), dest: 'dino' },
      { ok: r[2], icon: '🍭', text: 'Zuckerland: alle 12 Bonbons bei Lollis Bonbon-Jagd sammeln (Regenbogeninsel)', dest: 'zucker' },
      { ok: r[3], icon: '🔭', text: 'Sternwarte: alle 5 Sternbilder verbinden (Hauptinsel)' + (r[3] ? '' : ' · ' + s.stern.done.length + ' von 5'), dest: 'sterne' }] };
  };
  K.SB = SB; K.dbg = { golf: () => gs, hunt: () => hunt, bons, mounds, sb: () => sb, golfStart, golfShot, huntStart, sternOpen, sternTap, sternClose };
  dinoSync();
  return K;
};

/* Englische Texte (Englisch-Modus) */
BI.THEMEN_EN = {
  'Minigolf': 'Mini golf', 'Dino-Ausgrabung': 'Dino dig', 'Zuckerland': 'Candy Land', 'Sternwarte': 'Observatory', '⛳ Minigolf': '⛳ Mini golf', '🦕 Dino-Ausgrabung': '🦕 Dino dig', '🍭 Zuckerland': '🍭 Candy Land', '🔭 Sternwarte': '🔭 Observatory',
  'Minigolf spielen': 'Play mini golf', 'Richtung!': 'Aim!', 'Schlagen!': 'Swing!', 'Graben (1/3)': 'Dig (1/3)', 'Graben (2/3)': 'Dig (2/3)', 'Graben (3/3)': 'Dig (3/3)', 'Professorin Fossi': 'Professor Fossi', 'Zuckerwatte drehen': 'Spin cotton candy',
  'Bonbon-Jagd starten': 'Start the candy hunt', 'Sternbilder suchen': 'Find constellations', 'Nächstes Sternbild ➜': 'Next constellation ➜', 'Minigolf-Ass': 'Mini golf ace', 'Dino-Forscher': 'Dino explorer', 'Naschkatze': 'Sweet tooth', 'Sternengucker': 'Stargazer',
  'Spiel alle 3 Bahnen beim Minigolf auf der Fußball-Insel': 'Play all 3 holes of mini golf on Football Island', 'Grab alle 6 Dino-Knochen auf der Rätsel-Insel aus und bring sie ins Museum': 'Dig up all 6 dino bones on Riddle Island and bring them to the museum',
  'Sammle alle 12 Bonbons bei Lollis Bonbon-Jagd im Zuckerland': 'Collect all 12 sweets in Lolli\'s candy hunt in Candy Land', 'Verbinde alle 5 Sternbilder in der Sternwarte': 'Connect all 5 constellations in the observatory',
  '🎪 Themenbereiche': '🎪 Theme areas', 'Tippe die Sterne der Reihe nach an: 1, 2, 3 … Der blinkende Stern ist der nächste!': 'Tap the stars in order: 1, 2, 3 … The blinking star is the next one!',
  'Großer Wagen': 'Big Dipper', 'Herz': 'Heart', 'Fisch': 'Fish', 'Rakete': 'Rocket', 'Katze': 'Cat', 'Sprich mit Gustl und spiel drei Bahnen.': 'Talk to Gustl and play three holes.', 'Grab die Sandhügel aus und finde Dino-Knochen.': 'Dig up the sand mounds and find dino bones.',
  'Lolli braucht Hilfe bei der Bonbon-Jagd!': 'Lolli needs help with the candy hunt!', 'Am Fernrohr kannst du Sternbilder verbinden.': 'Use the telescope to connect constellations.', '⛳ Minigolf beendet.': '⛳ Mini golf ended.', '🍬 Bonbon-Jagd beendet.': '🍬 Candy hunt ended.',
  'Minigolf (Fußball-Insel)': 'Mini golf (Football Island)', 'Dino-Ausgrabung (Rätsel-Insel)': 'Dino dig (Riddle Island)', 'Zuckerland (Regenbogeninsel)': 'Candy Land (Rainbow Island)', 'Sternwarte (Hauptinsel)': 'Observatory (main island)'
};

'use strict';
/* Bunte Insel – Regenbogenwelt (Erweiterung): kleine Insel im Westen, über eine Brücke erreichbar.
   Regenbogen-Plaza mit Brunnen, Regenbogen-Bögen, Flaggen, bunte Häuser, Tanzfläche und Bewohner, die kindgerecht erzählen:
   Jeder gehört dazu, Familien sind verschieden, Auslachen ist nicht okay.
   Sparsam: Boden, Bögen, Flaggen, Häuser in den EINEN Welt-Mesh; zur Laufzeit nur Schilder, Bewohner und ein paar Funken. */
BI.RAINBOW = { x: -285, z: 20, R: 46, bridge: { x0: -250, x1: -168, z0: 15.5, z1: 24.5 } };
BI.RAINBOW_COL = [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x9b4de0];
/* Flaggen als Streifenfolgen [Farbe, Höhenanteil] – Regenbogen, Trans, Bi, Pan */
BI.RAINBOW_FLAGS = [
  [[0xff3b3b, 1], [0xff9a2e, 1], [0xffe14a, 1], [0x4cd07d, 1], [0x3fa0ff, 1], [0x9b4de0, 1]],
  [[0x5bcefa, 1], [0xf5a9b8, 1], [0xffffff, 1], [0xf5a9b8, 1], [0x5bcefa, 1]],
  [[0xd60270, 2], [0x9b4f96, 1], [0x0038a8, 2]],
  [[0xff218c, 1], [0xffd800, 1], [0x21b1ff, 1]]
];

/* ---------- Boden, Brücke, Tor, Plaza, Bögen, Flaggen, Häuser (statisch) ---------- */
BI.buildRainbowGround = function (c) {
  const { W, st, lamp, ROADY, GRASS, SAND } = c, P = BI.RAINBOW, RB = BI.RAINBOW_COL, FL = BI.RAINBOW_FLAGS, WD = 0x8a5a33, TAU = Math.PI * 2;
  W.rainbow = P; W.spots.rainbow = { x: P.bridge.x0 - 6, z: P.z };
  const loc = (cx, cz, an, lx, lz) => [cx + lx * Math.cos(an) + lz * Math.sin(an), cz - lx * Math.sin(an) + lz * Math.cos(an)];
  st.disc(P.x, P.z, P.R + 9, 0, GRASS, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, SAND, 56);
  /* Brücke (entlang x) */
  { const b = P.bridge, L = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, 0x9a6b3d); for (let x = b.x0 + 1; x < b.x1; x += 2) st.rect(x, b.z0, x + .08, b.z1, ROADY + .01, 0x7a5230);
    for (let x = b.x0 + 2, i = 0; x < b.x1; x += 4, i++) st.rect(x, P.z - .12, x + 2, P.z + .12, ROADY + .015, RB[i % 6]);
    for (const sd of [-1, 1]) { const z = P.z + sd * 4.6; st.box(cx, 0, z, L, 1.15, .25, 0xc8803c); st.box(cx, 1.15, z, L, .1, .35, 0xe3a45a); W.addBox(b.x0 + 2, z - .15, b.x1, z + .15, false, 1.3); }
    for (let x = b.x0 + 4; x < b.x1; x += 10) for (const sd of [-1, 1]) st.cyl(x, -1.6, P.z + sd * 3.8, .45, .5, 1.62, 0x6b4a2a, 8); }
  /* Regenbogen-Bogen: sechs Farbbänder als Halbkreis. yaw 0 = Bogen spannt entlang x, π/2 = entlang z */
  const arch = (cx, cz, rin, bw, depth, yaw) => {
    const N = 16; for (let k = 0; k < 6; k++) { const r = rin + k * bw + bw / 2; for (let i = 0; i < N; i++) { const a = (i + .5) / N * Math.PI, u = Math.cos(a) * r, y = Math.sin(a) * r, len = Math.PI * r / N + .14;
      if (yaw) st.box(cx, y - bw / 2, cz - u, len, bw + .02, depth, RB[k], yaw, 0, a + Math.PI / 2); else st.box(cx + u, y - bw / 2, cz, len, bw + .02, depth, RB[k], 0, 0, a + Math.PI / 2); } }
  };
  /* Tor an der Brücke (Bogen spannt entlang z) */
  { const gx = P.bridge.x0 - 3; arch(gx, P.z, 6.5, .45, .9, Math.PI / 2); for (const sd of [-1, 1]) W.addBox(gx - .6, sd > 0 ? P.z + 6.5 : P.z - 9.2, gx + .6, sd > 0 ? P.z + 9.2 : P.z - 6.5, false, 10); W.spots.rainbowGate = { x: gx, y: 9.8, z: P.z }; }
  /* großer Bogen im Norden (Fotostelle) */
  { const az = P.z - 27; arch(P.x, az, 9, 1.1, 1.6, 0); for (const sd of [-1, 1]) W.addBox(sd > 0 ? P.x + 9 : P.x - 15.6, az - 1, sd > 0 ? P.x + 15.6 : P.x - 9, az + 1, false, 14); W.spots.rainbowArch = { x: P.x, y: 17.4, z: az };
    st.strip(P.x, (P.z + az) / 2 + 3, 5, Math.abs(P.z - az) - 6, 0, ROADY + .012, 0xf1e4c8); }
  /* Plaza: helle Scheibe, sechs Regenbogen-Ringe, Brunnen in der Mitte */
  st.disc(P.x, P.z, 17, ROADY + .01, 0xf6ecd6, 40); for (let k = 0; k < 6; k++) st.ring(P.x, P.z, 5.2 + k * 1.6, 6.8 + k * 1.6, ROADY + .02, RB[k], 48);
  st.cyl(P.x, 0, P.z, 3.6, 3.9, .7, 0xcfd6e2, 18); st.cyl(P.x, .65, P.z, 3.2, 3.2, .1, 0x57c4ff, 18); st.cyl(P.x, .5, P.z, .5, .7, 3, 0xff8fc8, 8);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; st.sph(P.x + Math.sin(a) * 1.2, 3.4, P.z + Math.cos(a) * 1.2, .35, RB[i], 1); } W.addCircle(P.x, P.z, 3.9, false, 1.4);
  /* Promenade zum Tor: Streifen in Regenbogenfarben (heller gemischt) */
  { const x1 = P.bridge.x0 - 3; for (let x = P.x + 17, i = 0; x < x1; x += 3, i++) st.rect(x, P.z - 4, Math.min(x + 3, x1 + 2), P.z + 4, ROADY + .01, i % 2 ? 0xf6ecd6 : 0xe9dcc0); }
  /* Flaggen rund um die Plaza (Regenbogen, Trans, Bi, Pan im Wechsel) */
  for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + .26, x = P.x + Math.sin(an) * 19.5, z = P.z + Math.cos(an) * 19.5; if (x > P.x + 14 && Math.abs(z - P.z) < 6) continue;
    st.cyl(x, 0, z, .09, .12, 7.2, 0xdddddd, 6); st.sph(x, 7.3, z, .18, 0xffd23f, 1); const fl = FL[i % 4], tot = fl.reduce((s, q) => s + q[1], 0), H = 1.7, [fx0, fz0] = [Math.cos(an) * 1.15, -Math.sin(an) * 1.15]; let y = 7.0;
    for (const [col, w] of fl) { const h = H * w / tot; y -= h; st.box(x + fx0, y, z + fz0, 2.3, h, .05, col, an); } W.addCircle(x, z, .35, false, 7); }
  /* bunte Häuser (nicht begehbar) rund um die Plaza, Tür zur Mitte */
  { const WALL = [0xffd0e0, 0xfff1a8, 0xc9f0d6, 0xc7e0ff, 0xe3d0ff], ROOF = [0xff5a8a, 0xff9a2e, 0x4cd07d, 0x3fa0ff, 0x9b4de0];
    [60, 120].forEach((deg, i) => { const an = deg / 180 * Math.PI, hx = P.x + Math.sin(an) * 33, hz = P.z + Math.cos(an) * 33;
      st.box(hx, 0, hz, 7, 4.2, 6, WALL[i], an); st.cyl(hx, 4.2, hz, 0, 5.2, 2.6, ROOF[i], 4, 0, an + Math.PI / 4, 0);
      let [dx, dz] = loc(hx, hz, an, 0, -3.06); st.box(dx, 0, dz, 1.3, 2.4, .16, 0x8a5a33, an); [dx, dz] = loc(hx, hz, an, 0, -3.1); st.sph(dx + Math.sin(an) * 0, 1.2, dz, .08, 0xffd23f, 1);
      for (const sx of [-2.2, 2.2]) { const [wx, wz] = loc(hx, hz, an, sx, -3.06); st.box(wx, 1.5, wz, 1.2, 1.2, .14, 0xbfe6ff, an); st.box(wx, 1.4, wz, 1.5, .1, .2, 0xffffff, an); st.box(wx, 2.6, wz, 1.5, .1, .2, 0xffffff, an); }
      const [fx, fz] = loc(hx, hz, an, 3.7, -3.1), q = FL[(i + 1) % 4]; { const tot = q.reduce((s, e) => s + e[1], 0); let y = 3.6; for (const [col, w] of q) { const h = .9 * w / tot; y -= h; st.box(fx, y, fz, 1.4, h, .05, col, an); } }
      W.addCircle(hx, hz, 4.3, false, 6); });
  }
  /* Tanzfläche im Süden: Disco-Fliesen */
  { const dz = P.z + 28; for (let i = -2; i < 2; i++) for (let j = -2; j < 2; j++) st.rect(P.x + i * 2.6, dz + j * 2.6, P.x + i * 2.6 + 2.6, dz + j * 2.6 + 2.6, ROADY + .012, RB[((i + 2) + (j + 2) * 2) % 6]); W.spots.rainbowDance = { x: P.x, z: dz };
    st.strip(P.x, P.z + 16.5, 4, 6, 0, ROADY + .012, 0xf1e4c8); }
  /* Regenbogen-Bühne im Westen (blickt nach Osten zur Plaza): Podest, Rückwand für die Leinwand, Traversen mit bunten Lichtern, Boxen, Tanzfläche davor */
  { const SX = P.x - 36, ST = { x: SX, z: P.z, y: 1.2 }; W.spots.rainbowStage = ST;
    st.box(SX, 0, P.z, 8, 1.2, 16, 0x3a2a5a); for (let k = 0; k < 6; k++) st.box(SX + 4.05, 0, P.z - 8 + (k + .5) * 16 / 6, .12, 1.2, 16 / 6 - .06, RB[k]);
    st.box(SX - 4.2, 1.2, P.z, .6, 9.4, 15, 0x2a1d44);
    for (const sd of [-1, 1]) { st.cyl(SX + 3.6, 1.2, P.z + sd * 7.4, .22, .22, 7.6, 0xdddddd, 8); st.box(SX + 3.2, 1.2, P.z + sd * 6.2, 1.4, 2.8, 1.4, 0x23262d); st.cyl(SX + 3.95, 2.3, P.z + sd * 6.2, .5, .5, .1, 0x555a66, 10, 0, 0, Math.PI / 2); }
    st.box(SX + 3.6, 8.5, P.z, .5, .5, 15.6, 0xdddddd); for (let k = 0; k < 14; k++) lamp.sph(SX + 4.0, 8.2, P.z - 7 + k * 1.08, .26, RB[k % 6], 1);
    for (let k = 0; k < 6; k++) st.box(SX - 3.9, 10.6, P.z - 7.5 + k * 2.5, .2, .5, 2.4, RB[k]);
    W.addBox(SX - 4.6, P.z - 8.5, SX + 4.5, P.z + 8.5, false, 12);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) st.rect(P.x - 31 + i * 2.6, P.z - 7.8 + j * 2.6, P.x - 31 + i * 2.6 + 2.6, P.z - 7.8 + j * 2.6 + 2.6, ROADY + .012, (i + j) % 2 ? RB[(i * 2 + j) % 6] : 0x3a2a5a);
    st.strip(P.x - 21.5, P.z, 2.6, 8, Math.PI / 2, ROADY + .012, 0xf1e4c8); }
  /* Laternen mit bunten Lichtern, Bänke, bunte Bäume */
  for (let a = 0; a < 8; a++) { const an = a / 8 * TAU + .39, x = P.x + Math.sin(an) * 16.8, z = P.z + Math.cos(an) * 16.8; st.cyl(x, 0, z, .08, .1, 4.2, 0x555a66, 6); lamp.sph(x, 4.4, z, .34, RB[a % 6], 1); }
  for (const deg of [30, 150, 210, 330]) { const an = deg / 180 * Math.PI, bx = P.x + Math.sin(an) * 14.2, bz = P.z + Math.cos(an) * 14.2; st.box(bx, .4, bz, 2, .12, .6, 0xc8803c, an); const [kx, kz] = loc(bx, bz, an, 0, .3); st.box(kx, .52, kz, 2, .5, .12, 0xc8803c, an);
    for (const sx of [-.8, .8]) { const [lx, lz] = loc(bx, bz, an, sx, 0); st.box(lx, 0, lz, .12, .4, .5, 0x555a66, an); } W.addCircle(bx, bz, 1, false, .8); }
  const crnd = BI.rng(1313), FOL = [0xff9ccf, 0xb8f0c8, 0xd2b8ff, 0xffe27a, 0x9ad4ff];
  for (let i = 0; i < 22; i++) { const an = crnd() * TAU, d = 40 + crnd() * 5, x = P.x + Math.sin(an) * d, z = P.z + Math.cos(an) * d; if ((x > P.x + 30 && Math.abs(z - P.z) < 9) || (x < P.x - 28 && Math.abs(z - P.z) < 15)) continue;
    st.cyl(x, 0, z, .2, .3, 2, WD, 6); st.sph(x, 3.2, z, 1.6, FOL[i % 5], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
};

/* ---------- Laufzeit: Schilder, Bewohner, Brunnen-Freude ---------- */
BI.createRainbow = function (G) {
  const { scene, W, A, fx, P, say } = G, K = {}, R = BI.RAINBOW, RB = BI.RAINBOW_COL, TAU = Math.PI * 2;
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 56; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#4a1d6e'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.rainbowGate; if (g) sign('🌈 Willkommen in der Regenbogenwelt!', g.x - .5, g.y + 1.2, g.z, 10); const a = W.spots.rainbowArch; if (a) sign('Alle Farben • Alle Menschen', a.x, a.y + 1.6, a.z, 9); const d = W.spots.rainbowDance; if (d) sign('💃 Tanzfläche', d.x, 4.2, d.z, 5); }
  /* ===== Brunnen: Freude teilen ===== */
  const SAYS = ['🌈 Jeder Mensch ist richtig, genau so wie er ist!', '🌈 Es gibt ganz viele Arten von Familien – wichtig ist, dass man sich lieb hat.', '🌈 Wir lachen niemanden aus. Wir spielen zusammen!', '🌈 Man darf Rosa mögen, Fußball mögen oder beides.', '🌈 Wer sich traurig fühlt, darf mit einem Erwachsenen reden, dem er vertraut.', '🌈 Alle Farben zusammen machen den schönsten Regenbogen!'];
  let si = 0, last = -1e9; const COLS = [[1, .23, .23], [1, .6, .18], [1, .88, .29], [.3, .82, .49], [.25, .63, 1], [.61, .3, .88]];
  K.near = function () { if (P.veh || P.y > 1.5) return null; return Math.hypot(P.x - R.x, P.z - R.z) < 6.8 ? { k: 'rbow' } : null; };
  K.act = function (n) {
    if (!n || n.k !== 'rbow') return; G.flag && G.flag('rb_share'); const now = performance.now(); fx.burst(R.x, 3.2, R.z, 24, COLS, 4, 1.4, 28, 3); A.fanfare && A.fanfare(); say(SAYS[si++ % SAYS.length], 4200);
    if (now - last > 45000) { last = now; G.addStars(1); say('🌈 +1 ⭐ fürs Freude teilen!', 1800); G.earn && G.earn('play'); }
  };
  /* ===== Regenbogen-Bühne: Leinwand mit 5 Pride-Songs (nur Titel + Künstler zum Lesen), Pride-Party rund um die Uhr ===== */
  const ST = W.spots.rainbowStage, SONGS = [['Over the Rainbow', 'Judy Garland'], ['I Will Survive', 'Gloria Gaynor'], ['Dancing Queen', 'ABBA'], ['Vogue', 'Madonna'], ['Born This Way', 'Lady Gaga']], CSS = ['#ff3b3b', '#ff9a2e', '#ffe14a', '#4cd07d', '#3fa0ff', '#9b4de0'];
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 530; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
  let song = -1;
  const paint = i => { song = i; const g = cx.createLinearGradient(0, 0, 0, 530); g.addColorStop(0, '#2a1650'); g.addColorStop(1, '#14082b'); cx.fillStyle = g; cx.fillRect(0, 0, 1024, 530);
    CSS.forEach((c, k) => { cx.fillStyle = c; cx.fillRect(0, k * 9, 1024, 9); cx.fillRect(0, 530 - (k + 1) * 9, 1024, 9); });
    cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff'; cx.font = 'bold 54px Fredoka, system-ui, sans-serif'; cx.fillText('🏳️‍🌈 PRIDE 24/7 · 365 TAGE 🌈', 512, 92);
    SONGS.forEach((q, k) => { const y = 170 + k * 62, on = k === i; if (on) { cx.fillStyle = CSS[k % 6]; cx.globalAlpha = .9; cx.fillRect(60, y - 28, 904, 56); cx.globalAlpha = 1; } cx.fillStyle = on ? '#14082b' : '#fff'; cx.font = (on ? 'bold ' : '') + '38px Fredoka, system-ui, sans-serif'; cx.textAlign = 'left'; cx.fillText((on ? '▶ ' : (k + 1) + '. ') + q[0], 90, y); cx.textAlign = 'right'; cx.fillText(q[1], 934, y); });
    cx.textAlign = 'center'; cx.fillStyle = '#d9c4ff'; cx.font = '26px Fredoka, system-ui, sans-serif'; cx.fillText('Heute für alle: Tanzen, lachen, so sein, wie man ist!', 512, 492); tex.needsUpdate = true; };
  paint(0);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 6.5), new THREE.MeshBasicMaterial({ map: tex })); scr.position.set(ST.x - 3.85, 5.6, ST.z); scr.rotation.y = Math.PI / 2; scene.add(scr);
  sign('🎤 Regenbogen-Bühne', ST.x + 3.6, 11.4, ST.z, 8);
  /* Tanzende Menge + Künstler (eigene Animation, nur in der Nähe) */
  const crowd = [], rr = BI.rng(77), SKN = BI.SKINS.slice(0, 9), HRC = BI.HAIRS, STY = BI.STYLES.filter(q => q !== 'bald' && q !== 'none'), SH = [0xff3b3b, 0xff9a2e, 0xffe14a, 0x4cd07d, 0x3fa0ff, 0x9b4de0, 0xff8fc8, 0xffffff, 0x7de0d0], pk = a => a[(rr() * a.length) | 0];
  const lookOf = kid => ({ shirt: pk(SH), pants: pk([0x3d4a7a, 0x16335e, 0x7a5ce0, 0x23262d, 0xffffff]), hair: pk(HRC), skin: pk(SKN), style: pk(STY), dress: rr() < .3, hat: rr() < .2 ? 'party' : 'none', scale: kid ? .62 + rr() * .08 : .92 + rr() * .1 });
  const person = (x, z, y, kid, h) => { if (!y) y = W.groundY(x, z); /* auf der Tanzfläche stehen, nicht darin */ const c = BI.makeChar(lookOf(kid)); c.group.position.set(x, y, z); c.group.rotation.y = h; scene.add(c.group); crowd.push({ c, y, ph: rr() * 6, st: (rr() * 3) | 0, x, z }); };
  for (let i = 0; i < 30; i++) { const x = R.x - 31 + 1.3 + (i % 5) * 2.6 + (rr() - .5) * 1.2, z = R.z - 7.8 + 1.3 + ((i / 5) | 0) * 2.6 + (rr() - .5) * 1.2; person(x, z, 0, i % 6 === 0, Math.atan2(ST.x - x, ST.z - z)); }
  for (let i = 0; i < 4; i++) person(ST.x + 1.5 - (i % 2) * 2.2, ST.z - 4.5 + i * 3, ST.y, false, Math.PI / 2);
  /* ===== Pride-Parade: Trucks, Anhänger und Menschen, die friedlich feiern und hinterherlaufen – dreht rund um den Brunnen ===== */
  const PR = { r: 10.5, v: 2.1 }, pmat = BI.mat(), parade = [];
  const pAt = (d, off) => { const a = (ps + d) / PR.r, r = PR.r + (off || 0); return [R.x + Math.sin(a) * r, R.z + Math.cos(a) * r, Math.atan2(Math.cos(a), -Math.sin(a))]; };
  let ps = 0;
  const board = txt => { const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 128; const x = c2.getContext('2d'), g = x.createLinearGradient(0, 0, 512, 0); CSS.forEach((c, k) => g.addColorStop(k / 5, c)); x.fillStyle = g; x.fillRect(0, 0, 512, 128); x.fillStyle = 'rgba(255,255,255,.88)'; x.fillRect(10, 10, 492, 108); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#4a1d6e'; x.font = 'bold 60px Fredoka, system-ui, sans-serif'; x.fillText(txt, 256, 68); return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c2), side: THREE.FrontSide }); };
  const wheel = (b, x, z, r) => b.cyl(x, r - .2, z, r, r, .4, 0x1b1b22, 10, 0, 0, Math.PI / 2);
  const vehicle = (kind, cab, d, txt, dancers) => { const b = new BI.Batch(), g = new THREE.Group();
    if (kind === 'truck') { b.box(0, .5, 0, 2.4, .45, 6, 0x2a2f3a); b.box(0, .95, 2.0, 2.4, 1.9, 1.9, cab); b.box(0, 1.9, 2.97, 2.0, .7, .06, 0xbfe6ff); b.box(0, .95, -.9, 2.6, .25, 4.0, 0x6b4a2a);
      for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) b.box(sd * 1.32, .62 + k * .1, -.9, .06, .1, 4.0, RB[k]);
      for (const z of [2, -1.2, -2.4]) for (const sd of [-1, 1]) wheel(b, sd * 1.3, z, .55);
      for (const sd of [-1, 1]) { b.box(sd * .8, 1.2, -2.5, .8, 1.6, .7, 0x23262d); b.sph(sd * .8, 1.7, -2.14, .22, 0xdddddd, 1); }
      b.cyl(1.2, 1.2, -2.7, .05, .05, 3.4, 0xdddddd, 6); for (let k = 0; k < 6; k++) b.box(1.2, 4.5 - .22 * (k + 1), -3.5, .04, .22, 1.6, RB[k]); }
    else { b.box(0, .45, 0, 2.4, .2, 5, 0x2a2f3a); b.box(0, .65, 0, 2.6, .2, 5, 0x6b4a2a); b.box(0, .5, 3.1, .25, .2, 1.2, 0x555a66); for (const z of [-1.4, -2.2]) for (const sd of [-1, 1]) wheel(b, sd * 1.3, z, .45);
      for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) b.box(sd * 1.32, .85 + k * .1, 0, .05, .1, 5, RB[k]);
      for (let k = 0; k < 4; k++) b.sph(-1.1 + k * .75, 3.3 + (k % 2) * .3, -2.2, .3, RB[(k * 2) % 6], 1); }
    g.add(b.mesh(pmat));
    if (txt) { const m = board(txt); for (const sd of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), m); pl.position.set(sd * 1.38, 2.1, 0); pl.rotation.y = sd * Math.PI / 2; g.add(pl); } }
    const it = { g, d, dancers: [] }; dancers.forEach(([x, z], i) => { const c = BI.makeChar(lookOf(false)); c.group.position.set(x, kind === 'truck' ? 1.2 : .85, z); g.add(c.group); it.dancers.push({ c, ph: i * 1.7, st: i % 3 }); });
    scene.add(g); parade.push(it); return it; };
  vehicle('truck', 0xff5aa0, 0, 'PRIDE 🌈', [[-.5, -1.2], [.5, -.2]]); vehicle('trailer', 0, -6.7, 'LIEBE FÜR ALLE', [[-.5, -1.5], [.5, -.2], [0, 1.2]]);
  vehicle('truck', 0x9b4de0, -24, '🏳️‍🌈 24/7', [[-.5, -1.2], [.5, -.2]]); vehicle('trailer', 0, -30.7, 'JEDER IST WILLKOMMEN', [[-.5, -1.5], [.5, -.2], [0, 1.2]]);
  const walkers = []; const FLG = 6;
  [[-11, -17], [-35, -41], [-45, -51]].forEach(([a, b2], gi) => { const n = gi === 2 ? 4 : 6; for (let i = 0; i < n; i++) { const kid = (i + gi) % 4 === 0, c = BI.makeChar(lookOf(kid)); const d = a + (b2 - a) * ((i >> 1) / Math.max(1, (n >> 1) - 1 || 1)), off = i % 2 ? 1.7 : -1.7;
      if (i % 2 === 0) { const fb = new BI.Batch(); fb.cyl(0, .2, 0, .025, .025, 1.9, 0xdddddd, 5); for (let k = 0; k < 6; k++) fb.box(0, 1.95 - .17 * (k + 1), -.3, .03, .17, .6, RB[(k + i) % 6]); const fm = fb.mesh(pmat); fm.position.set(.45, 0, .1); c.group.add(fm); }
      scene.add(c.group); walkers.push({ c, d, off, ph: Math.random() * 6 }); } });
  K.parade = parade; K.walkers = walkers;
  let live = true;
  K.crowd = crowd; K.songs = SONGS;
  /* ===== Bewohner: verschiedene Menschen, bunte Haare & Kleider, erzählen kindgerecht ===== */
  K.people = function (folk) {
    const mk = (x, z, look, name, lines, h) => { const cc = BI.makeChar(look); cc.group.position.set(x, 0, z); cc.group.rotation.y = h; scene.add(cc.group); const n = { c: cc, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const at = (dx, dz) => [R.x + dx, R.z + dz], face = (dx, dz) => Math.atan2(-dx, -dz);
    const L = [
      ['Regenbogen-Romy', [10, -9], { shirt: 0xff3b3b, pants: 0x9b4de0, hair: 0xff8fc8, skin: 0xe0a979, style: 'long', dress: true, hat: 'party', scale: .96 }, ['Willkommen in der Regenbogenwelt! 🌈 Hier darf jeder so sein, wie er ist.', 'Die Regenbogenfahne zeigt: Es gibt viele Farben, und jede gehört dazu.', 'Schau dir die Flaggen an – jede steht für Menschen, die gern gesehen sind!']],
      ['Mama Mara', [-7, 11], { shirt: 0x4cd07d, pants: 0x3d4a7a, hair: 0x222222, skin: 0x8d5a3b, style: 'bun', necklace: 0xffd23f, scale: .95 }, ['Wir sind zwei Mamas. Unsere Tochter hat uns beide sehr lieb – und wir sie! 💕', 'Manche Kinder haben eine Mama und einen Papa, manche zwei Mamas oder zwei Papas, manche nur einen Elternteil.', 'Eine Familie ist da, wo man sich liebt und füreinander sorgt.']],
      ['Papa Paul', [-12, -3], { shirt: 0xff9a2e, pants: 0x2d6a4f, hair: 0x6b4423, skin: 0xf3c9a0, style: 'short', scale: .98 }, ['Wir sind zwei Papas! Abends kochen wir zusammen Nudeln. 🍝', 'Bei uns gibt es auch Streit – und danach Versöhnen. Wie in jeder Familie.', 'Frag ruhig, wenn du etwas wissen willst. Fragen sind gut!']],
      ['Oma Else', [4, -13], { shirt: 0x9b4de0, pants: 0x5a3d2b, hair: 0xdddddd, skin: 0xffe4d1, style: 'bun', dress: true, wrink: 1, glassT: 1, scale: .92 }, ['Wir sind schon 50 Jahre verheiratet. Liebe hat kein Alter! 💞', 'Früher war nicht alles so offen wie heute. Gut, dass ihr Kinder es besser macht!', 'Das Wichtigste: freundlich sein und zuhören.']],
      ['Lehrer Leo', [13, 8], { shirt: 0x3fa0ff, pants: 0x16335e, hair: 0x2dc4c4, skin: 0xc68a5a, style: 'curly', hat: 'none', glassT: 1, scale: .98 }, ['Streiten ist okay. Auslachen und gemein sein nicht. 🙅', 'Wenn dich jemand ärgert: Sag es einem Erwachsenen, dem du vertraust. Das ist mutig, nicht petzen!', 'Wenn du siehst, dass jemand ausgelacht wird: Sei nett zu ihm und hol Hilfe.']],
      ['Sam', [-4, -9], { shirt: 0xffe14a, pants: 0x7a5ce0, hair: 0x3fa0ff, skin: 0xffd2a8, style: 'pixie', logo: 0xffffff, scale: .96 }, ['Manche Menschen fühlen sich als Junge, manche als Mädchen, und manche so dazwischen. 🌈', 'Ich bin Sam. Du darfst mich einfach so nennen, wie ich es mag – das ist höflich.', 'Alle Menschen sind richtig so, wie sie sind.']],
      ['Amara', [8, 15], { shirt: 0xff8fc8, pants: 0x3fa0ff, hair: 0x222222, skin: 0x5a3a28, style: 'twinbuns', dress: true, scale: .62 }, ['Meine beste Freundin hat zwei Mamas. Wir malen zusammen Regenbogen! 🖍️', 'Ich mag Kleider UND Fußball. Das geht beides!', 'Spielst du mit uns?']],
      ['Noah', [-9, 6], { shirt: 0xff5a8a, pants: 0x4cd07d, hair: 0x6b4423, skin: 0xf3c9a0, style: 'curly', scale: .64 }, ['Ich bin ein Junge und mag Rosa. Na und? 💗', 'Farben haben kein Geschlecht!', 'Mein Papa sagt: Mach, was dir Freude macht, solange du keinem wehtust.']],
      ['Yuki', [-1, 22], { shirt: 0x9b4de0, pants: 0xffffff, hair: 0xff8fc8, skin: 0xffe4d1, style: 'ponytail', hat: 'party', scale: .66 }, ['Ich tanze gern! Komm auf die Tanzfläche! 💃', 'Bei uns in der Schule sind alle verschieden: groß, klein, laut, leise.', 'Das macht es richtig bunt!']],
      ['Tanz-Tina', [-5, 27], { shirt: 0xff3b3b, pants: 0xffe14a, hair: 0x4cd07d, skin: 0xe0a979, style: 'wavy', scale: .95 }, ['Musik an, Sorgen aus! 🎶', 'Beim Tanzen darf jeder mitmachen – ganz egal, wie gut man ist.', 'Drück auf Tanzen im Spaß-Menü 🎉 und das ganze Dorf tanzt mit!']]
    ];
    L.forEach(([name, [dx, dz], look, lines]) => { const [x, z] = at(dx, dz); mk(x, z, look, name, lines, face(dx, dz)); });
    /* eine zweite Person direkt neben der ersten – die Paare stehen zusammen */
    mk(R.x - 7 + 1.6, R.z + 11, { shirt: 0xff9a2e, pants: 0x9b4de0, hair: 0xe0382b, skin: 0xffd2a8, style: 'bob', dress: true, scale: .95 }, 'Mama Lena', ['Ich bin Lena, die andere Mama! 🌈', 'Unsere Tochter sagt, sie hat doppelt so viele Küsse zum Einschlafen.', 'Das ist doch das Schönste.'], face(-7, 11));
    mk(R.x + 4 + 1.6, R.z - 13, { shirt: 0x3fa0ff, pants: 0x5a3d2b, hair: 0xdddddd, skin: 0xffe4d1, style: 'short', wrink: 1, glassT: 1, scale: .93 }, 'Opa Otto', ['Ich bin Opa Otto. Else und ich tanzen jeden Samstag! 🕺', 'Als Kind habe ich gelernt: Wer anders ist, ist nicht falsch.', 'Das gebe ich euch gern weiter.'], face(4, -13));
    mk(R.x - 12 + 1.7, R.z - 3, { shirt: 0x4cd07d, pants: 0x16335e, hair: 0x222222, skin: 0x8d5a3b, style: 'short', scale: .97 }, 'Papa Jonas', ['Hallo, ich bin Jonas! 👋', 'Paul und ich haben unser Kind adoptiert – wir haben uns riesig gefreut.', 'Kinder brauchen vor allem Liebe, Zeit und ein warmes Bett.'], face(-12, -3));
  };
  /* ===== Funken über dem Brunnen und der Bühne, nur in der Nähe ===== */
  let tk = 0, ts = 0, pLive = true;
  K.update = function (dt, t) {
    const dS = Math.hypot(P.x - ST.x, P.z - ST.z), on = dS < 80;
    const dP = Math.hypot(P.x - R.x, P.z - R.z), onP = dP < 90;
    if (onP !== pLive) { pLive = onP; for (const v of parade) v.g.visible = onP; for (const w of walkers) w.c.group.visible = onP; }
    if (onP) { ps += dt * PR.v; for (const v of parade) { const [x, z, h] = pAt(v.d, 0); v.g.position.set(x, 0, z); v.g.rotation.y = h; for (const q of v.dancers) { q.c.dance(t + q.ph, q.st); q.c.group.position.y = (v.dancers.length === 3 ? .85 : 1.2) + Math.abs(Math.sin((t + q.ph) * 8)) * .1; } }
      for (const w of walkers) { const [x, z, h] = pAt(w.d, w.off); w.c.group.position.set(x, W.groundY(x, z) + Math.abs(Math.sin(t * 7 + w.ph)) * .05, z); w.c.group.rotation.y = h; w.c.pose(t * 7 + w.ph, .7, false); } }
    if (on !== live) { live = on; for (const q of crowd) q.c.group.visible = on; scr.visible = on; }
    if (on) { const i = ((t / 12) | 0) % SONGS.length; if (i !== song) paint(i); for (const q of crowd) { q.c.dance(t + q.ph, q.st); q.c.group.position.y = q.y + Math.abs(Math.sin((t + q.ph) * 8)) * .14; } ts -= dt; if (ts <= 0 && dS < 50) { ts = 1.1; fx.burst(ST.x + 4, 9, ST.z + (Math.random() - .5) * 12, 4, COLS, 3, 1.6, 22, 2); } }
    if (Math.hypot(P.x - R.x, P.z - R.z) > R.R + 30) return; tk -= dt; if (tk > 0) return; tk = 1.3; fx.burst(R.x, 3.6, R.z, 4, COLS, 2.4, 1.6, 22, 2); };
  return K;
};

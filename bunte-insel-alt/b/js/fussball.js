'use strict';
/* Bunte Insel – Fußball-Arena ⚽ (Erweiterung): eine kleine Insel im Südwesten mit einem richtigen Fußballplatz (Rasenstreifen, Linien, zwei Tore mit Netz,
   Banden, Flutlicht, Tribüne), Anzeigetafel und zwei Torwarten. Der Ball läuft über den Platz (Dribbeln beim Draufzulaufen, Hauptknopf = Schuss).
   Mit Freunden: Der Ball wird geteilt – wer ihn zuletzt berührt hat, rechnet ihn aus, die anderen bekommen die Daten (Nachricht 'fb'); die Tore zählen für alle.
   5 Tore = 1 ⭐. Alles ist selbst erfunden. Die Figur „Jannis“ ist der Kapitän der Insel (Wunsch des Neffen). */
BI.FUSSBALL = (function () {
  const R = 58, cx = -250, cz = 175, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Fußball-Insel
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 14), z: cz - uz * (R - 14) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) },
    /* Spielfeld (Weltachsen): Mitte, halbe Länge (x), halbe Breite (z), Tor-Halbbreite/-tiefe/-höhe */
    pitch: { x: cx - 6, z: cz + 6, HX: 26, HZ: 17, GW: 3.7, GD: 2.6, GH: 2.4 } };
})();

/* Gemeinsamer Helfer für kleine Brücken-Inseln: trägt die Insel in W.isles ein (Begehbarkeit, Flughöhe, Schaum – siehe world.js) und baut die Brücke. */
BI.buildIsleBridge = function (c, I) {
  const { W, st, lamp, ROADY } = c, BR = I.bridge, px = -I.uz, pz = I.ux;
  (W.isles || (W.isles = [])).push(I);
  st.strip(BR.mx, BR.mz, BR.w, BR.L, BR.ry, ROADY, 0x9a6b3d);
  for (let t = -BR.L / 2 + 1; t < BR.L / 2; t += 2) st.strip(BR.mx + I.ux * t, BR.mz + I.uz * t, BR.w, .1, BR.ry + Math.PI / 2, ROADY + .01, 0x7a5230);
  for (const sd of [-1, 1]) { const ox = px * sd * (BR.w / 2 - .4), oz = pz * sd * (BR.w / 2 - .4); st.box(BR.mx + ox, 0, BR.mz + oz, .3, 1.1, BR.L, 0xc8a27a, BR.ry); st.box(BR.mx + ox, 1.1, BR.mz + oz, .4, .12, BR.L, 0xe8c99a, BR.ry);
    for (let t = -BR.L / 2 + 1; t <= BR.L / 2 - 1; t += 2.5) W.addCircle(BR.mx + ox + I.ux * t, BR.mz + oz + I.uz * t, .4, false, 1.3);
    for (let t = -BR.L / 2 + 6; t < BR.L / 2 - 3; t += 14) { st.cyl(BR.mx + ox + I.ux * t, 1.1, BR.mz + oz + I.uz * t, .08, .1, 2.2, 0x444a5a, 6); lamp.sph(BR.mx + ox + I.ux * t, 3.5, BR.mz + oz + I.uz * t, .3, 0xfff3b0, 1); } }
  for (let t = -BR.L / 2 + 5; t < BR.L / 2 - 3; t += 10) for (const sd of [-1, 1]) st.cyl(BR.mx + px * sd * (BR.w / 2 - 1) + I.ux * t, -1.6, BR.mz + pz * sd * (BR.w / 2 - 1) + I.uz * t, .45, .5, 1.62, 0x6b4a2a, 8);
};

BI.buildFussballGround = function (c) {
  const { W, st, lamp, ROADY } = c, F = BI.FUSSBALL, Pt = F.pitch, TAU = Math.PI * 2, rn = BI.rng(2626), E = F.entry, LY = ROADY + .02;
  W.spots.fussball = { x: E.x, z: E.z }; W.fussball = F;
  st.disc(F.x, F.z, F.R + 9, 0, 0x7fd66b, 80); st.ring(F.x, F.z, F.R - 5, F.R + 9, .012, 0xf1e3b0, 80);
  BI.buildIsleBridge(c, F);
  /* Platz am Eingang */
  st.disc(E.x, E.z, 9, ROADY + .01, 0xf0e4c8, 36); st.ring(E.x, E.z, 6.5, 7.6, ROADY + .02, 0x3f8cff, 36);
  /* Rasen mit Mähstreifen */
  const x0 = Pt.x - Pt.HX - 2.6, x1 = Pt.x + Pt.HX + 2.6, z0 = Pt.z - Pt.HZ - 1.5, z1 = Pt.z + Pt.HZ + 1.5; st.rect(x0, z0, x1, z1, ROADY, 0x4cae4a);
  for (let i = 0; i < 13; i++) if (i & 1) { const a0 = Pt.x - Pt.HX + i * (Pt.HX * 2 / 13), a1 = a0 + Pt.HX * 2 / 13; st.rect(Math.max(a0, x0), Pt.z - Pt.HZ, Math.min(a1, x1), Pt.z + Pt.HZ, ROADY + .005, 0x57bb54); }
  /* Linien */
  const LW = .16, W1 = 0xffffff, ln = (a0, b0, a1, b1) => st.rect(Pt.x + a0, Pt.z + b0, Pt.x + a1, Pt.z + b1, LY, W1), HX = Pt.HX, HZ = Pt.HZ;
  ln(-HX, -HZ, HX, -HZ + LW); ln(-HX, HZ - LW, HX, HZ); ln(-HX, -HZ, -HX + LW, HZ); ln(HX - LW, -HZ, HX, HZ); ln(-LW / 2, -HZ, LW / 2, HZ);
  st.ring(Pt.x, Pt.z, 4.5, 4.66, LY, W1, 40); st.disc(Pt.x, Pt.z, .3, LY, W1, 10);
  for (const sd of [-1, 1]) { const ex = sd * HX, ix = sd * (HX - 6.5), gx = sd * (HX - 2.2); ln(Math.min(ex, ix), -8.5, Math.max(ex, ix), -8.5 + LW); ln(Math.min(ex, ix), 8.5 - LW, Math.max(ex, ix), 8.5); ln(ix - LW / 2, -8.5, ix + LW / 2, 8.5); ln(Math.min(ex, gx), -4.6, Math.max(ex, gx), -4.6 + LW); ln(Math.min(ex, gx), 4.6 - LW, Math.max(ex, gx), 4.6); ln(gx - LW / 2, -4.6, gx + LW / 2, 4.6); }
  /* Tore: Pfosten, Latte, Netz (Gitter), Kollision so, dass man nicht hineinläuft */
  for (const sd of [-1, 1]) { const gx = Pt.x + sd * Pt.HX, d = sd * Pt.GD, gy = Pt.GH, gw = Pt.GW;
    for (const s2 of [-1, 1]) { st.cyl(gx, 0, Pt.z + s2 * gw, .1, .1, gy, 0xffffff, 8); st.cyl(gx + d, 0, Pt.z + s2 * gw, .05, .05, gy - .4, 0xdfe6ee, 6); W.addCircle(gx, Pt.z + s2 * gw, .22, false, gy); W.addBox(Math.min(gx, gx + d) - .05, Pt.z + s2 * gw - .1, Math.max(gx, gx + d) + .05, Pt.z + s2 * gw + .1, false, gy); }
    st.box(gx, gy, Pt.z, .2, .12, gw * 2 + .2, 0xffffff); st.box(gx + d, gy - .4, Pt.z, .1, .1, gw * 2, 0xdfe6ee);
    for (let k = -gw + .6; k < gw; k += .7) { st.box(gx + d, 0, Pt.z + k, .04, gy - .4, .04, 0xeef2f7); st.box(gx + d / 2, gy - .4, Pt.z + k, Math.abs(d), .03, .03, 0xeef2f7); }
    for (let h = .5; h < gy - .3; h += .6) st.box(gx + d, h, Pt.z, .03, .03, gw * 2, 0xeef2f7);
    W.addBox(Math.min(gx + d, gx + d + sd * .2) - .05, Pt.z - gw, Math.max(gx + d, gx + d + sd * .2) + .05, Pt.z + gw, false, gy); }
  /* Banden rundherum (mit Lücke für den Eingang an der Nordseite) – bunte Werbetafeln */
  const BCOL = [0xe8453c, 0x3f8cff, 0xffd23f, 0x4cd07d, 0xa66bff, 0xff8a1f];
  const board = (xa, za, xb, zb) => { st.box((xa + xb) / 2, 0, (za + zb) / 2, xb - xa, 1.05, zb - za, BCOL[(Math.abs(xa * 3 + za) | 0) % 6]); W.addBox(xa, za, xb, zb, false, 1.1); };
  const bx0 = Pt.x - HX - .5, bx1 = Pt.x + HX + .5, bz0 = Pt.z - HZ - .5, bz1 = Pt.z + HZ + .5, gate0 = Pt.x + 14, gate1 = Pt.x + 19.5;
  for (let a = bx0; a < bx1; a += 6.2) { const b = Math.min(a + 6.2, bx1); board(a, bz1 - .1, b, bz1 + .35); if (b <= gate0 || a >= gate1) board(a, bz0 - .35, b, bz0 + .1); }
  for (const sd of [-1, 1]) { const ex = sd > 0 ? bx1 : bx0; for (const [za, zb] of [[bz0, Pt.z - Pt.GW - .3], [Pt.z + Pt.GW + .3, bz1]]) board(ex - .2, za, ex + .35, zb); }
  /* Tribüne an der Südseite + Flutlicht + Bank der Auswechselspieler */
  for (let r = 0; r < 4; r++) { st.box(Pt.x, r * .7, Pt.z + HZ + 4.2 + r * 1.3, 30, .7, 1.3, [0xcfd6e2, 0xb7c0d0][r & 1]); } W.addBox(Pt.x - 15, Pt.z + HZ + 3.5, Pt.x + 15, Pt.z + HZ + 9.4, false, 2.8);
  for (let k = 0; k < 12; k++) { const cx2 = Pt.x - 13 + k * 2.4, r = k % 4; st.box(cx2, .7 + r * .7, Pt.z + HZ + 4.5 + r * 1.3, .5, .5, .3, BCOL[(k * 5) % 6]); }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = Pt.x + sx * (HX + 3.5), z = Pt.z + sz * (HZ + 2.5); st.cyl(x, 0, z, .14, .2, 9, 0x555a66, 6); lamp.box(x, 9, z, 1.6, .5, .6, 0xfff7d0); W.addCircle(x, z, .3, false, 9); }
  { const bx = Pt.x - 8, bz = Pt.z - HZ - 2.6; st.box(bx, .4, bz, 4, .12, .8, 0xc8803c); st.box(bx, .6, bz - .4, 4, .6, .12, 0xc8803c); st.box(bx - 1.8, 0, bz, .12, .4, .6, 0x555a66); st.box(bx + 1.8, 0, bz, .12, .4, .6, 0x555a66); }
  /* Bäume am Rand, Laternen am Eingang */
  for (let i = 0; i < 50; i++) { const a = rn() * TAU, d = F.R - 5 - rn() * 6, x = F.x + Math.sin(a) * d, z = F.z + Math.cos(a) * d; if (Math.hypot(x - E.x, z - E.z) < 12) continue; if (x > x0 - 2 && x < x1 + 2 && z > z0 - 2 && z < z1 + 9) continue;
    const h = 2.2 + rn() * 1.2; st.cyl(x, 0, z, .22, .32, h, 0x6b4a2a, 6); st.sph(x, h + 1.1, z, 1.5 + rn() * .5, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .8, x = E.x + Math.sin(a) * 8.4, z = E.z + Math.cos(a) * 8.4; st.cyl(x, 0, z, .08, .1, 3.4, 0x444a5a, 6); lamp.sph(x, 3.6, z, .3, 0xfff3b0, 1); }
};

BI.createFussball = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = {}, F = BI.FUSSBALL, Pt = F.pitch, HX = Pt.HX, HZ = Pt.HZ, GW = Pt.GW, GH = Pt.GH, GD = Pt.GD, RB = .3;
  const S = () => (save.fussball || (save.fussball = { goals: 0, paid: 0, played: 0 }));
  const B = { x: Pt.x, y: RB, z: Pt.z, vx: 0, vy: 0, vz: 0, owner: null, rest: 0, lock: 0, sent: 0 }, score = [0, 0], keep = [{ b: 0 }, { b: 0 }];
  let cd = 0, lastBoard = '', near = false;
  /* Ball: weißer Körper mit schwarzen Flecken, rollt entsprechend der Geschwindigkeit */
  const ball = new THREE.Group(), inner = new THREE.Group(); ball.add(inner);
  { const b = new BI.Batch(); b.sph(0, 0, 0, RB, 0xffffff, 1, 1, 1, 1); for (const [x, y, z] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [.7, .7, .7], [-.7, -.7, -.7]]) { const l = Math.hypot(x, y, z); b.sph(x / l * RB, y / l * RB, z / l * RB, .11, 0x222831, 1); } inner.add(b.mesh(BI.mat())); }
  scene.add(ball); ball.position.set(B.x, B.y, B.z);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.32, 10), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
  /* Anzeigetafel + Schilder */
  const board = (() => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const tex = new THREE.CanvasTexture(cv), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(10, 2.5, 1); sp.position.set(Pt.x, 12.5, Pt.z - HZ - 3); scene.add(sp); return { cv, tex, sp }; })();
  const paint = () => { const k = score.join(':'); if (k === lastBoard) return; lastBoard = k; const c = board.cv.getContext('2d'); c.clearRect(0, 0, 512, 128); c.fillStyle = 'rgba(20,30,50,.85)'; c.fillRect(8, 8, 496, 112); c.strokeStyle = '#ffd23f'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 112); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 74px Fredoka, system-ui, sans-serif'; c.fillStyle = '#6bb8ff'; c.fillText('🔵 ' + score[0], 140, 66); c.fillStyle = '#fff'; c.fillText(':', 256, 62); c.fillStyle = '#ff7a7a'; c.fillText(score[1] + ' 🔴', 372, 66); board.tex.needsUpdate = true; };
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#0b4a1e'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffffff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  sign('⚽ Fußball-Arena', F.entry.x, 6.5, F.entry.z, 11); sign('E / Knopf = Schuss · Anlaufen = Dribbeln', Pt.x, 6.2, Pt.z + HZ + 1.4, 12); paint();
  /* Torwarte */
  const gk = [0, 1].map(i => { const c = BI.makeChar({ shirt: i ? 0xff5a5a : 0x3f8cff, pants: 0x222222, hair: 0x4a3320, skin: 0xf3c9a0, hat: 'none', scale: 1.02 }); c.group.position.set(Pt.x + (i ? 1 : -1) * (HX - 1.4), 0, Pt.z); c.group.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; scene.add(c.group); return c; });
  const me = () => (G.me ? G.me() : 'me'), send = (extra) => { const n = G.net && G.net(); if (!n || !n.connected()) return; n.send(Object.assign({ t: 'fb', x: +B.x.toFixed(2), y: +B.y.toFixed(2), z: +B.z.toFixed(2), vx: +B.vx.toFixed(2), vy: +B.vy.toFixed(2), vz: +B.vz.toFixed(2), s: score }, extra || {})); };
  const here = () => Math.hypot(P.x - Pt.x, P.z - Pt.z) < HX + 20;
  const kick = (dx, dz, sp, vy) => { const l = Math.hypot(dx, dz) || 1; B.vx = dx / l * sp; B.vz = dz / l * sp; B.vy = vy; B.owner = me(); B.rest = 0; cd = .22; A.kick && A.kick(); send(); };
  const celebrate = (side) => { const gx = Pt.x + (side ? 1 : -1) * HX; fx.burst(gx, 2, Pt.z, 30, [BI.C.gold, BI.C.white, BI.C.pink, BI.C.blue], 6, 1.4, 28, 5); A.star && A.star(); say('⚽ TOOOR für ' + (side ? '🔵 Blau' : '🔴 Rot') + '!  ' + score[0] + ' : ' + score[1], 3200); };
  const goal = (side, byMe) => { /* side 1 = Ost-Tor (zählt für Blau), 0 = West-Tor (zählt für Rot) */ score[side ? 0 : 1]++; B.lock = 2.4; paint(); celebrate(side);
    if (byMe) { const s = S(); s.goals++; while (s.goals - s.paid * 5 >= 5) { s.paid++; G.addStars(1); say('⭐ 5 Tore geschafft! +1 ⭐', 2600); } persist(); } send({ g: side ? 1 : 0 }); };
  const reset = () => { B.x = Pt.x; B.y = RB; B.z = Pt.z; B.vx = B.vy = B.vz = 0; B.lock = 0; B.owner = null; B.rest = 0; send({ r: 1 }); };
  function step(dt) {
    cd -= dt; const mine = B.owner === me() || !B.owner;
    B.vy -= 20 * dt; B.y += B.vy * dt; if (B.y < RB) { B.y = RB; if (B.vy < -1.3) B.vy = -B.vy * .55; else B.vy = 0; }
    const fr = Math.pow(B.y > RB + .05 ? .98 : .42, dt); B.vx *= fr; B.vz *= fr; B.x += B.vx * dt; B.z += B.vz * dt;
    const a = B.x - Pt.x, b = B.z - Pt.z, inWin = Math.abs(b) < GW && B.y < GH;
    if (Math.abs(a) > HX) {
      if (inWin) { if (!B.lock && mine && Math.abs(a) > HX + .15) goal(a > 0 ? 1 : 0, B.owner === me()); const lim = HX + GD - RB; if (Math.abs(a) > lim) { B.x = Pt.x + Math.sign(a) * lim; B.vx *= -.25; } if (Math.abs(b) > GW - RB) { B.z = Pt.z + Math.sign(b) * (GW - RB); B.vz *= -.3; } }
      else { B.x = Pt.x + Math.sign(a) * HX; B.vx *= -.7; if (B.y > GH) B.vy = Math.min(B.vy, 0); }
    }
    if (Math.abs(b) > HZ && !(Math.abs(a) > HX)) { B.z = Pt.z + Math.sign(b) * HZ; B.vz *= -.7; }
    /* Torwarte: folgen dem Ball auf der Torlinie und halten ihn ab */
    for (let i = 0; i < 2; i++) { const sd = i ? 1 : -1, g = keep[i], gx = Pt.x + sd * (HX - 1.4), toward = Math.abs(B.x - gx) < 17 ? B.z - Pt.z : 0; g.b += BI.clamp(BI.clamp(toward, -2.6, 2.6) - g.b, -2 * dt, 2 * dt);
      const dx = B.x - gx, dz = B.z - (Pt.z + g.b); if (Math.hypot(dx, dz) < .85 && B.y < 2.3 && !B.lock) { const l = Math.hypot(dx, dz) || 1, sp = Math.max(6, Math.hypot(B.vx, B.vz) * .8); B.vx = dx / l * sp - sd * 2; B.vz = dz / l * sp; B.vy = Math.max(B.vy, 2.5); B.x = gx + dx / l * .9; if (mine) { B.owner = me(); send(); } } }
    if (B.lock > 0) { B.lock -= dt; if (B.lock <= 0 && mine) reset(); else if (B.lock <= 0) B.lock = 0; }
  }
  K.update = function (dt, t) {
    if (!here()) { near = false; return; } near = true; dt = Math.min(dt, .05);
    /* Spieler berührt den Ball: Dribbeln (laufend) */
    if (!P.veh && P.y < 1.2 && cd <= 0 && !B.lock) { const dx = B.x - P.x, dz = B.z - P.z, d = Math.hypot(dx, dz); if (d < 1.15) kick(d < .05 ? Math.sin(P.h) : dx, d < .05 ? Math.cos(P.h) : dz, Math.max(4.5, (P.speed || 0) * 1.35 + 2), 1.3); }
    step(dt);
    if (B.owner === me()) { const moving = Math.hypot(B.vx, B.vz) > .25 || B.y > RB + .1; B.rest = moving ? 0 : B.rest + dt; B.sent += dt; if (moving && B.sent > .12) { B.sent = 0; send(); } else if (!moving && B.rest > 1.2) { B.owner = null; send(); } }
    ball.position.set(B.x, B.y, B.z); shadow.position.set(B.x, .06, B.z); shadow.scale.setScalar(1 - Math.min(.6, (B.y - RB) / 5));
    const sp = Math.hypot(B.vx, B.vz); if (sp > .05) { inner.rotation.x += B.vz * dt / RB; inner.rotation.z -= B.vx * dt / RB; }
    for (let i = 0; i < 2; i++) { const c = gk[i], gx = Pt.x + (i ? 1 : -1) * (HX - 1.4); c.group.position.set(gx, 0, Pt.z + keep[i].b); if (c.legL) { const w = Math.sin(t * 9) * Math.min(.6, Math.abs(keep[i].b - (c._lb || 0)) * 30); c.legL.rotation.x = w; c.legR.rotation.x = -w; } c._lb = keep[i].b; }
    paint();
  };
  K.near = function () { if (P.veh || P.y > 1.5 || !near) return null; if (Math.hypot(P.x - B.x, P.z - B.z) < 3.4 && !B.lock) return { k: 'fkick' }; return null; };
  K.act = function (n) { if (!n || n.k !== 'fkick') return; kick(Math.sin(P.h), Math.cos(P.h), 17, 3.6); S().played = 1; persist(); };
  K.onNet = function (d) {
    if (d.s && d.s.length === 2) { score[0] = d.s[0] | 0; score[1] = d.s[1] | 0; paint(); }
    if (d.r) { B.x = Pt.x; B.y = RB; B.z = Pt.z; B.vx = B.vy = B.vz = 0; B.lock = 0; B.owner = d.id || null; return; }
    if (typeof d.x === 'number' && typeof d.z === 'number') { B.x = d.x; B.y = Math.max(RB, +d.y || RB); B.z = d.z; B.vx = +d.vx || 0; B.vy = +d.vy || 0; B.vz = +d.vz || 0; B.owner = d.id || null; B.rest = 0; }
    if (d.g != null) { B.lock = 2.4; celebrate(d.g ? 1 : 0); }
  };
  K.share = function (id) { const n = G.net && G.net(); if (n && n.connected()) n.sendTo(id, { t: 'fb', x: B.x, y: B.y, z: B.z, vx: B.vx, vy: B.vy, vz: B.vz, s: score }); };
  K.state = () => ({ ball: B, score, keep });
  K.people = function (folk) {
    const E = F.entry, mk = (u, v, look, name, lines) => { const x = E.x + u, z = E.z + v, c = BI.makeChar(look), h = Math.atan2(Pt.x - x, Pt.z - z); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    mk(-4, -4.5, { shirt: 0xffd23f, pants: 0x1f3d8f, hair: 0x4a3320, skin: 0xf3c9a0, hat: 'cap', style: 'short', scale: .82 }, 'Kapitän Jannis', ['Hallo! Ich bin Jannis, der Kapitän hier. ⚽', 'Lauf einfach in den Ball, dann dribbelst du. Mit dem Knopf schießt du richtig fest!', 'Das Tor am Ende zählt: Ost = 🔵 Blau, West = 🔴 Rot. Torwarte gibt es auch!', 'Bring deine Freunde mit – dann spielt ihr zusammen mit EINEM Ball! 🤝', 'Alle 5 Tore gibt es einen ⭐ für dich.']);
    mk(5, -6, { shirt: 0xe8453c, pants: 0xffffff, hair: 0x222222, skin: 0x8a5a33, hat: 'none', style: 'curly', scale: 1.0 }, 'Trainerin Lena', ['Tipp: Schieß auf die Ecken, da kommt der Torwart nicht hin!', 'Wer den Ball zuletzt berührt hat, darf ihn „führen“ – so bleibt er bei allen gleich.']);
  };
  K.log = () => { const s = S(); return { title: '⚽ Fußball-Arena', count: s.goals + ' Tore', rows: [
    { ok: !!s.played, icon: '👟', text: 'Einmal richtig schießen (Knopf am Ball)', dest: 'fussball' },
    { ok: s.goals >= 5, icon: '⚽', text: '5 Tore schießen: ' + Math.min(5, s.goals) + ' von 5 (dann gibt es einen ⭐)', dest: 'fussball' },
    { ok: s.goals >= 25, icon: '🏆', text: '25 Tore schießen: ' + Math.min(25, s.goals) + ' von 25', dest: 'fussball' }] }; };
  return K;
};

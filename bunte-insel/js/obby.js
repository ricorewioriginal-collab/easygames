'use strict';
/* Bunte Insel – Himmels-Parcours („Obby“): ein Startpunkt am Boden bringt dich zu schwebenden Plattformen hoch am Himmel.
   Trittsteine, schmaler Balken, Drehbalken zum Drüberspringen, Treppe, Zickzack. Fällst du, geht es zum letzten Checkpoint.
   Ziel = Sterne, Bestzeit-Liste (Top 3, gespeichert). Hoch oben stoßen Bäume/Häuser nicht (Höhe > 12), daher überall frei. */
BI.createObby = function (G) {
  const { scene, W, A, fx, P, save, say } = G, K = { run: null }, TAU = Math.PI * 2, H = 14;
  /* ---------- Startpunkt am Boden: erster freier Platz aus einer Liste ---------- */
  const cands = [[-40, 32], [-36, 42], [38, 36], [44, 30], [30, -40], [-30, -42], [60, 30], [-60, -30], [70, 70], [-70, 70], [20, 84], [-20, 84], [90, -30], [-90, 30]];
  let pad = null; for (const c of cands) if (!W.blockedAt(c[0], c[1], 3) && W.free(c[0], c[1], 2.8)) { pad = { x: c[0], z: c[1] }; break; }
  if (!pad) { for (let r = 30; r < 150 && !pad; r += 6) for (let a = 0; a < 12 && !pad; a++) { const x = Math.sin(a * .52) * r, z = Math.cos(a * .52) * r; if (!W.blockedAt(x, z, 3) && W.free(x, z, 2.8)) pad = { x, z }; } }
  if (!pad) pad = { x: 0, z: 60 };
  K.pad = pad;
  const OX = pad.x - 3, OZ = pad.z; /* Parcours-Ursprung: Start-Plattform liegt direkt über dem Startpunkt */
  const plats = [], cps = [];
  const plat = (u, v, w, d, y, col, cp) => { const p = { x0: OX + u - w / 2, x1: OX + u + w / 2, z0: OZ + v - d / 2, z1: OZ + v + d / 2, y, col, cx: OX + u, cz: OZ + v }; plats.push(p); if (cp) cps.push({ x: p.cx, y, z: p.cz }); return p; };
  const COLS = [0x4da3ff, 0xff8fc8, 0x4cd07d, 0xffd23f, 0xb36bff, 0xff8a1f, 0x2dc4c4];
  plat(3, 0, 6, 6, H, 0x4cd07d, true);
  for (let i = 0; i < 5; i++) plat(9 + i * 4.6, 0, 2.4, 2.4, H, COLS[i % COLS.length]);
  plat(33, 0, 6, 6, H, 0x4cd07d, true);
  plat(43.5, 0, 15, 1.4, H, 0xffd23f);
  const sw = plat(58, 0, 12, 12, H, 0xff8a1f); K.sweep = { x: sw.cx, z: sw.cz, y: H, len: 4.6, a: 0 };
  plat(70, 0, 6, 6, H, 0x4cd07d, true);
  for (let i = 0; i < 5; i++) plat(77 + i * 4.5, 0, 3, 3, H + .9 * (i + 1), COLS[(i + 2) % COLS.length]);
  const YZ = H + 4.5; for (let i = 0; i < 4; i++) plat(99.5 + i * 4.6, i % 2 ? -3 : 3, 2.6, 2.6, YZ, COLS[(i + 4) % COLS.length]);
  plat(119, 0, 6, 6, YZ, 0x4cd07d, true);
  const fin = plat(130, 0, 9, 9, YZ, 0xffd23f); K.fin = { x: fin.cx, z: fin.cz, y: YZ };
  /* ---------- Aussehen (ein Mesh) ---------- */
  { const b = new BI.Batch();
    for (const p of plats) {
      const w = p.x1 - p.x0, d = p.z1 - p.z0, cx = p.cx, cz = p.cz;
      b.box(cx, p.y - .7, cz, w, .7, d, p.col); b.box(cx, p.y - .08, cz, w - .3, .08, d - .3, 0xffffff);
      b.sph(cx, p.y - 1.0, cz, Math.max(w, d) * .38, 0xffffff, 1, 1.2, .55, 1.2);
    }
    for (const c of cps) { b.box(c.x + 2.2, c.y, c.z - 2.2, .12, 2.2, .12, 0xdddddd); b.box(c.x + 2.2 + .5, c.y + 1.7, c.z - 2.2, 1.0, .6, .06, 0xe0382b); }
    /* Ziel-Torbogen */
    for (const s of [-1, 1]) b.box(K.fin.x + 2.6, K.fin.y, K.fin.z + s * 3.4, .5, 4.2, .5, 0xffffff); b.box(K.fin.x + 2.6, K.fin.y + 4.2, K.fin.z, .5, .6, 7.4, 0xe0382b); for (let i = 0; i < 6; i++) b.box(K.fin.x + 2.6, K.fin.y + 4.2, K.fin.z - 3 + i * 1.2, .52, .62, .6, i % 2 ? 0x16335e : 0xffffff);
    K.mesh = b.mesh(BI.mat()); K.mesh.frustumCulled = false; scene.add(K.mesh);
    /* Startpunkt am Boden: Kreis + Fähnchen */
    const g = new BI.Batch(); g.cyl(pad.x, .02, pad.z, 2.2, 2.2, .12, 0x4cd07d, 18); g.cyl(pad.x, .12, pad.z, 1.6, 1.6, .05, 0xffffff, 18); g.cyl(pad.x, .17, pad.z, 1.1, 1.1, .05, 0xffd23f, 18); g.box(pad.x + 1.8, 0, pad.z, .1, 2.6, .1, 0xdddddd); g.box(pad.x + 1.8, 1.9, pad.z - .5, .08, .7, 1.0, 0xe0382b);
    K.padMesh = g.mesh(BI.mat()); scene.add(K.padMesh); }
  /* Drehbalken */
  const bar = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, .35, .35, .9, 0x555a66, 8); b.box(0, .35, 0, K.sweep.len * 2, .4, .4, 0xe0382b); for (let i = -2; i <= 2; i++) b.box(i * 1.7, .35, 0, .5, .42, .42, i % 2 ? 0xffffff : 0xe0382b); const g = new THREE.Group(); g.add(b.mesh(BI.mat())); g.position.set(K.sweep.x, H, K.sweep.z); scene.add(g); return g; })();
  /* ---------- Boden der Plattformen (für main.js: Gehen/Springen) ---------- */
  K.floorAt = function (x, z, y) {
    let best = -1e9; for (const p of plats) if (x > p.x0 && x < p.x1 && z > p.z0 && z < p.z1 && p.y <= y + .55 && p.y > best) best = p.y; return best;
  };
  /* ---------- Anzeige ---------- */
  const hud = document.createElement('div'); hud.className = 'chip'; hud.hidden = true; hud.style.cssText = 'position:absolute;left:50%;top:max(66px,calc(env(safe-area-inset-top) + 56px));transform:translateX(-50%);z-index:6;font-weight:800;font-size:16px;pointer-events:none;padding:6px 14px;border-radius:16px'; (document.getElementById('hud') || document.body).appendChild(hud);
  const top = () => (save.obby && save.obby.top) || [];
  K.best = () => top()[0] || 0;
  K.near = function () {
    if (P.veh) return null; if (K.run) return { k: 'quit' };
    if (Math.hypot(P.x - pad.x, P.z - pad.z) < 2.6 && P.y < 1) return { k: 'start' }; return null;
  };
  K.busy = () => false;
  K.act = function (n) { if (!n) return; if (n.k === 'start') start(); else if (n.k === 'quit') stop('Parcours abgebrochen – bis gleich! 👋', false); };
  function place(c, y) { P.x = c.x; P.z = c.z; P.y = y; P.vy = 0; G.char().group.position.set(P.x, P.y, P.z); }
  function start() {
    if (K.run) return; K.run = { t: 0, cp: 0, falls: 0, started: false }; const c = cps[0]; fx.burst(P.x, 1, P.z, 24, [BI.C.white, BI.C.blue, BI.C.gold], 6, 1.2, 30, -2); A.whoosh && A.whoosh(); place(c, c.y + .02); P.h = Math.PI / 2;
    fx.burst(c.x, c.y + 1, c.z, 24, [BI.C.white, BI.C.blue, BI.C.gold], 6, 1.2, 30, -2); say('🏁 Los geht’s! Spring von Plattform zu Plattform – fällst du, geht’s zum Checkpoint 🚩', 3600);
    if (G.cam) G.cam.yaw = -Math.PI / 2;
  }
  function stop(msg, done) {
    const r = K.run; if (!r) return; K.run = null; hud.hidden = true; fx.burst(P.x, P.y + 1, P.z, 18, [BI.C.white, BI.C.blue], 5, 1, 28, -2); place({ x: pad.x + 3.4, z: pad.z + 1 }, W.groundY(pad.x + 3.4, pad.z + 1)); if (msg) say(msg, done ? 4200 : 2200);
  }
  K.stop = () => stop('', false);
  function finish() {
    const r = K.run, t = r.t; const o = save.obby || (save.obby = { top: [], runs: 0 }); o.runs++; const prev = o.top[0] || 0; const isBest = !prev || t < prev;
    o.top = o.top.concat([+t.toFixed(1)]).sort((a, b) => a - b).slice(0, 3); G.persist && G.persist();
    A.fanfare(); fx.burst(K.fin.x, K.fin.y + 2, K.fin.z, 70, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green, BI.C.orange], 11, 1.8, 28, 7);
    G.addStars(6 + (isBest ? 3 : 0)); G.earn && G.earn('obby');
    stop('🏆 Geschafft in ' + t.toFixed(1) + ' s! ' + (isBest ? 'Neue Bestzeit! +9 ⭐' : '+6 ⭐') + ' · Bestenliste: ' + o.top.map((v, i) => (i + 1) + '. ' + v.toFixed(1) + ' s').join('  '), true);
  }
  K.update = function (dt, t) {
    K.sweep.a += dt * 1.5; bar.rotation.y = K.sweep.a; bar.visible = true;
    const r = K.run; if (!r) return;
    if (P.veh) { stop('', false); return; }
    r.t += dt; const cp = cps[r.cp];
    hud.hidden = false; hud.textContent = '⏱ ' + r.t.toFixed(1) + ' s · 🚩 ' + (r.cp + 1) + '/' + cps.length + (K.best() ? ' · 🏅 ' + K.best().toFixed(1) : '');
    // Checkpoints einsammeln
    for (let i = r.cp + 1; i < cps.length; i++) { const c = cps[i]; if (Math.abs(P.x - c.x) < 2.8 && Math.abs(P.z - c.z) < 2.8 && Math.abs(P.y - c.y) < 1) { r.cp = i; A.ding && A.ding(); say('🚩 Checkpoint ' + (i + 1) + '!', 1400); fx.burst(c.x, c.y + 1, c.z, 14, [BI.C.red, BI.C.white, BI.C.gold], 4, 1, 26, 3); } }
    // Drehbalken
    const s = K.sweep; if (P.y < s.y + .85 && P.y > s.y - .3 && Math.hypot(P.x - s.x, P.z - s.z) < s.len + .6) {
      const dx = P.x - s.x, dz = P.z - s.z, ux = Math.cos(s.a), uz = -Math.sin(s.a), along = dx * ux + dz * uz, lat = dx * uz - dz * ux;
      if (Math.abs(along) < s.len && Math.abs(lat) < .75 && P.y < s.y + .72) { hit('💥 Boing! Der Balken hat dich erwischt'); return; }
    }
    // Ziel
    if (Math.abs(P.x - K.fin.x) < 4 && Math.abs(P.z - K.fin.z) < 4 && Math.abs(P.y - K.fin.y) < 1) { finish(); return; }
    // Gefallen?
    if (P.y < H - 3.5) hit('😮 Runtergefallen! Zurück zum Checkpoint');
  };
  function hit(msg) {
    const r = K.run; if (!r) return; r.falls++; const c = cps[r.cp]; A.bonk && A.bonk(); fx.burst(P.x, P.y + 1, P.z, 12, [BI.C.dust, BI.C.white], 4, .8, 26, 4);
    place(c, c.y + .02); say(msg, 1800);
  }
  return K;
};

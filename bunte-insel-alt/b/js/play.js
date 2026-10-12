'use strict';
/* Bunte Insel – Spielplatz zum Benutzen: Schaukel, Rutsche, Wippe, Sandkasten (im Park) und alles, was man selbst baut
   (Schaukel, Rutsche, Sandkasten, Hängematte, Sonnenliege, Brunnen). Die Trampoline federn automatisch (siehe main.js).
   Währenddessen „klebt“ die Figur am Spielgerät; der Aktions-Knopf wird zu „Absteigen“ (oder Springen-Taste). */
BI.createPlay = function (G) {
  const { scene, W, A, fx, P } = G, K = {}, TAU = Math.PI * 2, CELL = 4;
  const say = G.say, ch = () => G.char();
  const SW = { x: -53, y: 3.2, z: 56, len: 2.5 }, SEE = { x: -58, y: .95, z: 61 }, SAND = { x0: -68.5, z0: 58, x1: -63.5, z1: 62 };
  const SLIDE = { x: -64, path: [[-64, 3.3, 51.6], [-64, 3.1, 52.8], [-64, 2.2, 54.4], [-64, 1.25, 56], [-64, .3, 57.6], [-64, .15, 58.7]], near: [-64, 49.6] };
  K.ride = null;
  /* ---------- Wippe (Brett als eigenes Objekt, damit es kippen kann) ---------- */
  const seesaw = (() => {
    const g = new THREE.Group(), b = new BI.Batch(); b.box(0, 0, 0, .55, .14, 4.6, 0xff8fc8); b.box(0, .05, -2.0, .5, .35, .5, 0x7a5ce0); b.box(0, .05, 2.0, .5, .35, .5, 0x7a5ce0); b.box(0, .2, -1.55, .5, .06, .06, 0x333); b.box(0, .2, 1.55, .5, .06, .06, 0x333);
    g.add(b.mesh(BI.mat())); g.position.set(SEE.x, SEE.y, SEE.z); scene.add(g); return g;
  })();
  /* ---------- Sandburgen ---------- */
  const castles = []; let castleI = 0;
  { const b = new BI.Batch(); b.cyl(0, 0, 0, .6, .75, .5, 0xe9cf86, 8); b.cyl(0, .5, 0, .35, .45, .4, 0xe9cf86, 8); b.cone(0, .9, 0, .3, .5, 0xff5a5a, 8); b.box(.55, 0, 0, .12, .26, .12, 0xe9cf86);
    K.castleGeo = b.mesh(BI.mat()).geometry; }
  function castle(x, z) {
    let m = castles[castleI % 4]; if (!m) { m = new THREE.Mesh(K.castleGeo, BI.mat()); scene.add(m); castles[castleI % 4] = m; } castleI++;
    m.position.set(x, .38, z); m.rotation.y = Math.random() * TAU; m.scale.setScalar(.01); m.userData.grow = 0;
  }
  /* ---------- Suche: was ist in der Nähe? ---------- */
  const rotPt = (x, z, ry) => [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
  const loc = (it, x, z) => { const [cx, cz] = [it.gx * CELL, it.gz * CELL], p = rotPt(x, z, it.r * Math.PI / 2); return [cx + p[0], cz + p[1]]; };
  const d2 = (x, z) => Math.hypot(P.x - x, P.z - z);
  K.near = function () {
    if (P.veh || P.y > 1 || K.ride) return null;
    if (d2(SW.x, SW.z + 1.4) < 2.4) return { k: 'swing' };
    if (d2(SLIDE.near[0], SLIDE.near[1]) < 2.2) return { k: 'slide', m: 1 };
    if (d2(SEE.x, SEE.z + 3) < 2.2 || d2(SEE.x, SEE.z - 3) < 2.2) return { k: 'seesaw', z: d2(SEE.x, SEE.z + 3) < d2(SEE.x, SEE.z - 3) ? 1 : -1 };
    { const dx = Math.max(SAND.x0 - P.x, 0, P.x - SAND.x1), dz = Math.max(SAND.z0 - P.z, 0, P.z - SAND.z1); if (Math.hypot(dx, dz) < 1.6) return { k: 'sand', x: (SAND.x0 + SAND.x1) / 2 + (Math.random() - .5) * 3, z: (SAND.z0 + SAND.z1) / 2 + (Math.random() - .5) * 2 }; }
    for (const it of G.items()) {
      if (it.o) continue; /* nur eigene Bauten (Freunde-Bauten bleiben Deko) */
      if (it.t === 'swingset') { for (const sx of [-.5, .5]) { const q = loc(it, sx, .6); if (d2(q[0], q[1]) < 1.6) return { k: 'swing', it, sx }; } }
      else if (it.t === 'slide') { const q = loc(it, 0, .1); if (d2(q[0], q[1]) < 1.9) return { k: 'slide', it }; }
      else if (it.t === 'sandbox') { const q = loc(it, 0, 0); if (d2(q[0], q[1]) < 2.7) return { k: 'sand', x: q[0] + (Math.random() - .5) * 1.6, z: q[1] + (Math.random() - .5) * 1.6 }; }
      else if (it.t === 'hammock') { const q = loc(it, 0, 0); if (d2(q[0], q[1]) < 1.9) return { k: 'hammock', it }; }
      else if (it.t === 'lounger') { const q = loc(it, 0, 0); if (d2(q[0], q[1]) < 1.9) return { k: 'lounger', it }; }
      else if (it.t === 'fountain') { const q = loc(it, 0, 0); if (d2(q[0], q[1]) < 3.2) return { k: 'wish', it }; }
    }
    return null;
  };
  K.busy = () => !!K.ride;
  K.stop = function () {
    const r = K.ride; if (!r) return; K.ride = null; const g = ch().group, c = ch();
    if (W.swing) W.swing.manual = false;
    seesaw.rotation.x = 0; g.rotation.set(0, P.h, 0); c.armL.rotation.set(0, 0, 0); c.armR.rotation.set(0, 0, 0); c.legL.rotation.x = c.legR.rotation.x = 0;
    if (r.exit) { const q = W.resolve(r.exit[0], r.exit[1], .5, {}); P.x = q.x; P.z = q.z; }
    P.y = W.groundY(P.x, P.z); P.vy = 0; g.position.set(P.x, P.y, P.z);
  };
  const cool = {}; const ready = (k, ms) => { const n = performance.now(); if (n - (cool[k] == null ? -1e9 : cool[k]) < ms) return false; cool[k] = n; return true; };
  K.act = function (n) {
    if (!n) return; if (n.k === 'stop') { K.stop(); return; }
    const R = (o) => { K.ride = Object.assign({ t: 0 }, o); A.pop && A.pop(); G.earn('play'); };
    if (n.k === 'swing') {
      if (n.it) { const q = loc(n.it, n.sx, 0), ry = n.it.r * Math.PI / 2; R({ kind: 'swing', it: n.it, x: q[0], z: q[1], ry, exit: loc(n.it, n.sx, 1.9) }); } else R({ kind: 'swing', exit: [SW.x, SW.z + 2.4] });
      if (W.swing && !n.it) W.swing.manual = true; say('🪢 Schaukeln! Mit 🚪 / Springen wieder absteigen', 2400);
    } else if (n.k === 'seesaw') { R({ kind: 'seesaw', zs: n.z, exit: [SEE.x + 1.6, SEE.z + n.z * 2.6] }); say('⚖️ Wippe! Auf und ab …', 2000); }
    else if (n.k === 'slide') {
      let path = SLIDE.path;
      if (n.it) { const loc3 = (u, y, v) => { const q = loc(n.it, u, v); return [q[0], y, q[1]]; }; path = [loc3(0, 2.6, -1.2), loc3(0, 2.15, -.5), loc3(0, 1.25, .9), loc3(0, .5, 2.3), loc3(0, .2, 3.3)]; }
      R({ kind: 'slide', path, dur: 2.6, exit: [path[path.length - 1][0], path[path.length - 1][2]] }); A.whoosh && A.whoosh(); say('🛝 Wiiiii!', 1400);
    } else if (n.k === 'sand') { R({ kind: 'sand', x: n.x, z: n.z, dur: 3.2, h: Math.atan2(n.x - P.x, n.z - P.z) }); say('🏖️ Wir bauen eine Sandburg …', 1800); }
    else if (n.k === 'hammock' || n.k === 'lounger') {
      const q = loc(n.it, 0, 0), ry = n.it.r * Math.PI / 2; R({ kind: n.k, x: q[0], z: q[1], ry, y: n.k === 'hammock' ? .75 : .6, exit: loc(n.it, 0, n.k === 'hammock' ? 1.6 : 1.7) });
      say(n.k === 'hammock' ? '🛌 Ahhh, schön schaukeln …' : '☀️ Sonnenbaden – ganz entspannt', 2200);
    } else if (n.k === 'wish') {
      if (!ready('wish', 15000)) { say('⛲ Dein Wunsch ist schon unterwegs – gleich wieder!', 2000); return; }
      const q = loc(n.it, 0, 0); for (let i = 0; i < 3; i++) fx.emit(P.x, 1.6, P.z, (q[0] - P.x) * 1.4 + (Math.random() - .5), 5, (q[1] - P.z) * 1.4 + (Math.random() - .5), 1, 22, 1, .85, .25, 9, 1);
      setTimeout(() => { fx.burst(q[0], 1.6, q[1], 22, [BI.C.gold, BI.C.water, BI.C.white], 5, 1.2, 26, 6); A.coins && A.coins(); G.addStars(1); say('⛲ Münze geworfen – dein Wunsch geht in Erfüllung! +1 ⭐', 2600); }, 650);
    }
  };
  const catmull = (pts, u) => { const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), t = f - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
  K.update = function (dt, t) {
    for (const m of castles) { if (m && m.userData.grow < 1) { m.userData.grow = Math.min(1, m.userData.grow + dt * 1.2); m.scale.setScalar(Math.max(.01, m.userData.grow)); } }
    const r = K.ride; if (!r) { if (Math.abs(seesaw.rotation.x) > .002) seesaw.rotation.x *= .9; else seesaw.rotation.x = 0; return; }
    r.t += dt; const g = ch().group, c = ch();
    if (r.kind === 'swing') {
      const amp = Math.min(.85, .22 + r.t * .16), a = amp * Math.sin(r.t * 1.98);
      if (!r.it) {
        W.swing.rotation.x = a; const sy = SW.y - SW.len * Math.cos(a) - .06, sz = SW.z - SW.len * Math.sin(a);
        P.x = SW.x; P.z = SW.z; P.y = sy; g.position.set(SW.x, sy + .06 - .46, sz); g.rotation.set(0, 0, 0);
      } else { const o = rotPt(0, -1.3 * Math.sin(a), r.ry), y = 1.3 - 1.3 * Math.cos(a); P.x = r.x + o[0]; P.z = r.z + o[1]; P.y = y; g.position.set(P.x, .85 + y - .46, P.z); g.rotation.set(0, r.ry, 0); }
      c.sit(); c.armL.rotation.set(-1.5, 0, .25); c.armR.rotation.set(-1.5, 0, -.25); c.legL.rotation.x = c.legR.rotation.x = -1.35 + Math.sin(r.t * 1.98 + 1.6) * .5 * amp;
      if (r.t > 1 && Math.abs(Math.sin(r.t * 1.98)) > .97 && !r.cl) { r.cl = 1; A.whoosh && A.whoosh(); } else if (Math.abs(Math.sin(r.t * 1.98)) < .5) r.cl = 0;
      if (r.t > 6 && !r.star) { r.star = 1; G.addStars(1); say('🪢 Hoch hinaus! +1 ⭐', 1800); A.star && A.star(); }
    } else if (r.kind === 'seesaw') {
      const a = .34 * Math.sin(r.t * 2.4) * r.zs; seesaw.rotation.x = a; const sy = SEE.y + .1 * Math.cos(a) - r.zs * 1.9 * Math.sin(a) * 1, sz = SEE.z + r.zs * 1.9 * Math.cos(a);
      P.x = SEE.x; P.z = sz; P.y = sy; g.position.set(SEE.x, sy + .08 - .46, sz); g.rotation.set(0, r.zs > 0 ? Math.PI : 0, 0); c.sit(); c.armL.rotation.set(-.6, 0, .2); c.armR.rotation.set(-.6, 0, -.2);
      if (Math.abs(Math.sin(r.t * 2.4)) > .985 && !r.cl) { r.cl = 1; A.bump && A.bump(); fx.burst(SEE.x, .3, SEE.z - r.zs * 1.9, 4, [BI.C.dust, BI.C.white], 2, .5, 24, 6); } else if (Math.abs(Math.sin(r.t * 2.4)) < .6) r.cl = 0;
      if (r.t > 8 && !r.star) { r.star = 1; G.addStars(1); say('⚖️ Super gewippt! +1 ⭐', 1800); A.star && A.star(); }
    } else if (r.kind === 'slide') {
      const u = Math.min(1, r.t / r.dur), e = u * u * .4 + u * .6, p = catmull(r.path, e), q = catmull(r.path, Math.min(1, e + .04));
      P.x = p[0]; P.y = p[1]; P.z = p[2]; P.h = Math.atan2(q[0] - p[0], q[2] - p[2]); g.position.set(P.x, P.y, P.z); g.rotation.set(-.35, P.h, 0); c.pose(0, 0, false); c.armL.rotation.set(-2.6, 0, .4); c.armR.rotation.set(-2.6, 0, -.4);
      if (Math.random() < dt * 20) fx.emit(P.x, P.y + .2, P.z, (Math.random() - .5), 1, (Math.random() - .5), .5, 20, 1, .9, .4, 5, .9);
      if (u >= 1) { A.bump && A.bump(); say('🛝 Nochmal? Einfach wieder auf 🛝 drücken!', 1800); fx.burst(P.x, .3, P.z, 10, [BI.C.gold, BI.C.white], 3, .7, 26, 6); const ex = [P.x, P.z]; r.exit = [ex[0], ex[1]]; K.stop(); }
    } else if (r.kind === 'sand') {
      const u = Math.min(1, r.t / r.dur); P.h = r.h; g.position.set(P.x, P.y, P.z); g.rotation.set(.35, r.h, 0); c.pose(r.t * 9, 0, false); c.armL.rotation.set(-1.2 + Math.sin(r.t * 10) * .6, 0, .2); c.armR.rotation.set(-1.2 - Math.sin(r.t * 10) * .6, 0, -.2);
      if (Math.random() < dt * 22) fx.emit(r.x, .55, r.z, (Math.random() - .5) * 2, 2.2, (Math.random() - .5) * 2, .7, 22, .93, .82, .52, 8, 1);
      if (u >= 1) { castle(r.x, r.z); A.pop && A.pop(); fx.burst(r.x, .8, r.z, 16, [BI.C.gold, [.93, .82, .52], BI.C.white], 4, .9, 26, 7); if (ready('sand', 20000)) { G.addStars(1); say('🏰 Eine Sandburg! +1 ⭐', 2000); } else say('🏰 Eine Sandburg!', 1600); K.stop(); }
    } else { /* Hängematte / Sonnenliege */
      const sway = r.kind === 'hammock' ? Math.sin(r.t * 1.4) * .12 : 0; P.x = r.x; P.z = r.z; P.y = r.y; g.position.set(r.x, r.y - .3, r.z); g.rotation.set(-.55, r.ry + (r.kind === 'hammock' ? Math.PI / 2 : 0), sway); c.sit(); c.armL.rotation.set(-.5, 0, .5); c.armR.rotation.set(-.5, 0, -.5);
      if (Math.random() < dt * .5) fx.emit(r.x, 1.8, r.z, 0, .8, 0, 1.8, 30, .6, .8, 1, 0, .8);
      if (r.t > 10 && !r.star) { r.star = 1; G.addStars(1); say('😌 Gut erholt! +1 ⭐', 1800); A.star && A.star(); }
    }
  };
  /* Trampolin im Park: federt (wie die gebauten) – Standort für main.js */
  K.tramps = [{ x: -49.5, z: 62, r: 1.6 }];
  K.trampAt = (x, z) => K.tramps.some(q => Math.hypot(x - q.x, z - q.z) < q.r);
  return K;
};

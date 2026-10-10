'use strict';
/* Bunte Insel – Freibad: Wasser (Schwimmen/Planschen), 2 Wasserrutschen, Sprungturm, Eis-Kiosk, Umkleiden, Bademeister Herr Fischer. */
BI.createPool = function (G) {
  const { scene, W, A, fx, P, save, persist, say, addStars } = G, F = W.spots.pool, K = { ride: null }, TAU = BI.TAU;
  /* ---------- Wasser (leicht transparent, plätschert) ---------- */
  const tx = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(150,215,255,.8)'; c.lineWidth = 5; for (let i = 0; i < 6; i++) { c.beginPath(); for (let x = 0; x <= 128; x += 8) c.lineTo(x, 12 + i * 21 + Math.sin(x / 128 * TAU * 2 + i) * 6); c.stroke(); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const waters = W.spots.poolWater.map(r => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), new THREE.MeshBasicMaterial({ color: r.c, map: tx.clone(), transparent: true, opacity: .8, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set((r.x0 + r.x1) / 2, .12, (r.z0 + r.z1) / 2);
    m.material.map.needsUpdate = true; m.material.map.repeat.set((r.x1 - r.x0) / 6, (r.z1 - r.z0) / 6); scene.add(m); return m;
  });
  /* 0 = trocken, 1 = Planschbecken (flach), 2 = großes Becken (schwimmen) */
  K.inWater = (x, z) => { const m = F.main, k = F.kids; if (x > m.x0 && x < m.x1 && z > m.z0 && z < m.z1) return 2; if (x > k.x0 && x < k.x1 && z > k.z0 && z < k.z1) return 1; return 0; };
  K.onDeck = (x, z) => x > F.x0 && x < F.x1 && z > F.z0 && z < F.z1;
  /* Bademeister */
  const guard = BI.makeChar({ shirt: 0xe0382b, pants: 0xffffff, hair: 0x6b4423, skin: 0xe0a979, hat: 'cap', name: 'Herr Fischer' }); guard.group.position.set(F.lifeguard.x, 0, F.lifeguard.z); guard.group.rotation.y = -1.57; scene.add(guard.group);
  const near = (p, r) => Math.hypot(P.x - p.x, P.z - p.z) < r;
  K.near = function () {
    if (P.veh || P.y > 1 || K.ride) return null;
    for (const s of F.slides) if (near(s, 2.3)) return { k: 'slide', s };
    if (near(F.board, 2.3)) return { k: 'dive' }; if (near(F.kiosk, 2.4)) return { k: 'ice' };
    for (const c of F.cabins) if (near(c, 1.8)) return { k: 'cabin' };
    return null;
  };
  K.busy = () => !!K.ride;
  /* ---------- Rutsche & Sprung als kleine Filmfahrten ---------- */
  const catmull = (pts, u) => { const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), t = f - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'slide') { K.ride = { kind: 'slide', t: 0, dur: 3.2, path: n.s.path.map(p => [p[0], p[1] + .15, p[2]]), up: 0 }; A.whoosh && A.whoosh(); say('🛝 Wiiiii!', 1400); G.earn('slide'); }
    else if (n.k === 'dive') { K.ride = { kind: 'dive', t: 0, dur: 9 }; say('🤿 Achtung – Kopfsprung!', 1600); G.earn('swim'); }
    else if (n.k === 'ice') { const now = performance.now(); if (now - (K.iceT || 0) < 25000) { say('🍦 Du hattest gerade erst ein Eis – gleich wieder!', 2200); return; } K.iceT = now; addStars(1); A.buy && A.buy(); say('🍦 Lecker Eis vom Kiosk! +1 ⭐', 2600); fx.burst(P.x, 2, P.z, 12, [BI.C.pink, BI.C.white, BI.C.gold], 3, 1, 26, 4); }
    else if (n.k === 'cabin') G.openWard();
  };
  K.update = function (dt, t) {
    for (const w of waters) { const m = w.material.map; m.offset.x += dt * .04; m.offset.y += dt * .025; }
    guard.pose(t * 1.1, 0, near(F.lifeguard, 7));
    // Willkommen + Pfeifen beim Rennen am Beckenrand
    const on = !P.veh && K.onDeck(P.x, P.z); if (on !== K.was) { K.was = on; if (on) say('🏊 Willkommen im Freibad! Rutschen 🛝, Sprungturm 🤿, Eis 🍦', 4200); }
    K.whCd = Math.max(0, (K.whCd || 0) - dt);
    if (on && P.running && !K.inWater(P.x, P.z) && K.whCd <= 0 && Math.hypot(P.x - F.lifeguard.x, P.z - F.lifeguard.z) < 26) { K.whCd = 9; A.whistle && A.whistle(); say('Herr Fischer: „Pfiiiff! Nicht rennen am Beckenrand!“', 3000); }
    const sw = K.inWater(P.x, P.z); if (!P.veh && sw !== K.sw) { if (sw) { A.splash(); fx.burst(P.x, .4, P.z, 14, [BI.C.water, BI.C.white], 3, .8, 24, 6); if (sw === 2) G.earn('swim'); } else if (K.sw) { A.splash(); } K.sw = sw; }
    const r = K.ride; if (!r) return; r.t += dt; const u = Math.min(1, r.t / r.dur), g = G.char().group;
    if (r.kind === 'slide') {
      const e = u * u * .35 + u * .65, p = catmull(r.path, e); P.x = p[0]; P.y = p[1]; P.z = p[2]; const q = catmull(r.path, Math.min(1, e + .04)); P.h = Math.atan2(q[0] - p[0], q[2] - p[2]);
      g.position.set(P.x, P.y, P.z); g.rotation.set(-.5, P.h, 0); G.char().pose(0, 0, false); G.char().armL.rotation.set(-2.6, 0, .4); G.char().armR.rotation.set(-2.6, 0, -.4); if (Math.random() < dt * 25) fx.emit(P.x, P.y + .3, P.z, (Math.random() - .5), 1.5, (Math.random() - .5), .6, 22, .6, .85, 1, 6, .9);
      if (u >= 1) endRide(true);
    } else {
      const b = F.board, j = b.jump, tx0 = j.x - 4.4, tz0 = j.z;
      if (r.t < .6) { const k = r.t / .6; P.x = BI.lerp(b.x, tx0, k); P.z = BI.lerp(b.z, tz0, k); P.y = BI.lerp(0, j.y, k); P.h = Math.PI; g.position.set(P.x, P.y, P.z); g.rotation.set(0, Math.PI, 0); G.char().pose(r.t * 12, .6, false); }
      else if (r.t < 1.3) { const k = (r.t - .6) / .7; P.x = BI.lerp(tx0, j.x, k); P.z = tz0; P.y = j.y; g.position.set(P.x, P.y, P.z); g.rotation.set(0, Math.PI / 2, 0); G.char().pose(r.t * 8, .5, false); }
      else if (r.t < 1.6) { P.x = j.x; P.z = j.z; P.y = j.y; g.position.set(P.x, P.y, P.z); g.rotation.set(.1, Math.PI / 2, 0); G.char().pose(0, 0, false); G.char().armL.rotation.set(-2.8, 0, .3); G.char().armR.rotation.set(-2.8, 0, -.3); }
      else { const k = Math.min(1, (r.t - 1.6) / 1.1); P.x = BI.lerp(j.x, b.land.x, k); P.z = j.z; P.y = Math.max(.15, j.y + 1.9 * Math.sin(k * Math.PI) - (j.y - .1) * k * k); g.position.set(P.x, P.y, P.z); g.rotation.set(-k * TAU, Math.PI / 2, 0); G.char().pose(0, 0, false); G.char().armL.rotation.set(-2.8, 0, .3); G.char().armR.rotation.set(-2.8, 0, -.3); if (k >= 1) endRide(false); }
    }
  };
  function endRide(slide) { const p = P; K.ride = null; p.y = 0; p.vy = 0; if (slide) { p.x += 0; } A.splash(); A.bigpop && A.bigpop(); fx.burst(p.x, .5, p.z, 30, [BI.C.water, BI.C.white, BI.C.blue], 6, 1.2, 30, 8); G.char().group.rotation.set(0, p.h, 0); G.char().armL.rotation.set(0, 0, 0); G.char().armR.rotation.set(0, 0, 0); say('💦 Platsch! Das war toll!', 1800); }
  K.waters = waters;
  return K;
};

'use strict';
/* Bunte Insel – Spielautomaten: in jeder Welt steht ein Automat mit dem Highlight-Spiel der Welt (jede Welt eine andere Spielart: Heli-Flug, Taxi-Rennen, Dosenwerfen, Rhythmus-Tanz, Jump 'n' Run – siehe minis2.js und jump.js).
   Davorstellen → „Spielen“ startet das Level (allein; mit Freunden über das 🎮-Spiele-Menü). Statisch im Welt-Mesh, zur Laufzeit nur ein Schild pro Automat. */
BI.ARCADES = [
  { kind: 'heli_insel', x: 9, z: 36, yaw: Math.PI, body: 0x2fae5a, top: 0xffd23f },
  { kind: 'taxi_stadt', x: 8.5, z: -258, yaw: -Math.PI / 2, body: 0x3a4a6a, top: 0x4da3ff },
  { kind: 'cans_park', x: 241, z: 29, yaw: Math.PI, body: 0x7b3fa8, top: 0xffd23f },
  { kind: 'dance_regenbogen', x: -262, z: 29.5, yaw: Math.PI * .5, body: 0xff8fc8, top: 'rainbow' },
  { kind: 'crane_dampfer', x: -276, z: -128, yaw: Math.PI, body: 0x555a66, top: 0xdddddd },
  { kind: 'jump_bucht', x: -80, z: 276.5, yaw: Math.PI, body: 0xff7a1a, top: 0x2d6be0 }
];
BI.buildArcades = function (c) {
  const { W, st, lamp } = c, RB = BI.RAINBOW_COL; W.spots.arcades = [];
  for (const a of BI.ARCADES) {
    const L = (lx, lz) => [a.x + lx * Math.cos(a.yaw) + lz * Math.sin(a.yaw), a.z - lx * Math.sin(a.yaw) + lz * Math.cos(a.yaw)], B = (lx, y, lz, w, h, d, col, rx = 0) => { const [x, z] = L(lx, lz); st.box(x, y, z, w, h, d, col, a.yaw, rx); };
    B(0, 0, 0, 1.7, 2.3, 1.3, a.body); B(0, 0, 0, 1.76, .35, 1.36, 0x23262d);
    if (a.top === 'rainbow') for (let k = 0; k < 6; k++) B(-.75 + k * .3, 2.3, 0, .3, .75, 1.4, RB[k]); else B(0, 2.3, 0, 1.9, .75, 1.4, a.top);
    B(0, 1.15, .66, 1.3, .95, .08, 0x14305f); B(0, 1.22, .7, 1.1, .75, .05, 0x8fe8ff); B(0, .85, .8, 1.5, .14, .6, 0x2a2f3a, -.25);
    const [jx, jz] = L(-.4, .9); st.cyl(jx, .98, jz, .05, .05, .3, 0xdddddd, 6); lamp.sph(jx, 1.4, jz, .12, 0xff3b3b, 1);
    [[.15, 0xffe14a], [.45, 0x4da3ff]].forEach(([bx, col]) => { const [x, z] = L(bx, .98); lamp.sph(x, 1.02, z, .08, col, 1); });
    const [tx, tz] = L(0, 0); lamp.sph(tx, 3.2, tz, .2, 0xffe14a, 1);
    const [fx, fz] = L(0, 2.0); W.addCircle(a.x, a.z, 1.15, false, 3); W.spots.arcades.push({ kind: a.kind, x: a.x, z: a.z, fx, fz });
  }
};
BI.createArcade = function (G) {
  const { scene, W, P } = G, K = {};
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#16335e'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffe27a'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  for (const a of W.spots.arcades || []) { const d = G.info(a.kind) || {}; sign('🕹️ ' + (d.name || 'Spiel'), a.x, 4.4, a.z, 5.4); }
  K.near = function () { if (P.veh || P.y > 1.5) return null; for (const a of W.spots.arcades || []) if (Math.hypot(P.x - a.fx, P.z - a.fz) < 2.4 || Math.hypot(P.x - a.x, P.z - a.z) < 2.6) return { k: 'arcade', kind: a.kind }; return null; };
  K.act = function (n) { if (n && n.k === 'arcade') G.start(n.kind); };
  return K;
};

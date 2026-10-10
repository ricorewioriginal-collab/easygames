'use strict';
/* Bunte Insel – Schießbude für Kinder: Spielzeug-Blaster (Schaumstoffpfeile, Wasser, Saugnapf-Bogen) und NUR Attrappen als Ziele
   (Zielscheiben, Holzenten, Pappgeister, Dosen, Zielballons). Die Bahn ist eingezäunt, hinten steht eine Fangwand, Gezielt wird nur in die Bahn. */
BI.createRange = function (G) {
  const { scene, camera, fx, W, A } = G, S = W.spots.range, TAU = BI.TAU, X = S.x, WALLZ = -99.4;
  const R = { running: false, finished: false, score: 0, ammo: 0, time: 0, weapon: null, shots: 0, hits: 0, result: null, onEvent: null, targets: [] };
  const WEAPONS = {
    foam: { key: 'foam', icon: '🟠', name: 'Schaumstoff-Blaster', ammo: 12, time: 60, cd: .38, mult: 1, speed: 36, scale: 1 },
    water: { key: 'water', icon: '💦', name: 'Wasserpistole', ammo: 60, time: 30, cd: .12, mult: 1, speed: 44, scale: 3 },
    bow: { key: 'bow', icon: '🏹', name: 'Saugnapf-Bogen', ammo: 8, time: 60, cd: .9, mult: 2, speed: 30, scale: 1 }
  };
  R.WEAPONS = WEAPONS; const mat = BI.mat();
  const mesh = fn => { const b = new BI.Batch(); fn(b); return b.mesh(mat); };
  const T = R.targets, add = o => { o.up = true; o.t = 0; o.base = o.grp.position.clone(); scene.add(o.grp); T.push(o); return o; };

  /* ---------- Attrappen ---------- */
  function boardGroup(r) {
    const g = new THREE.Group();
    g.add(mesh(b => { [[1, 0xffffff], [.8, 0xe0382b], [.58, 0xffffff], [.36, 0xe0382b], [.15, 0xffd23f]].forEach((q, k) => b.cyl(0, -.04, k * .012, r * q[0], r * q[0], .08, q[1], 28, Math.PI / 2)); b.box(0, -2.4, -.12, .16, 2.4 - r, .16, 0x8a5a33); b.box(0, -2.4, -.12, .8, .1, .5, 0x6b4a2a); }));
    return g;
  }
  function duckGroup() {
    const g = new THREE.Group();
    g.add(mesh(b => { b.box(0, -.3, 0, 1.0, .6, .08, 0xffe14a); b.box(.36, .1, 0, .42, .42, .08, 0xffe14a); b.box(.7, .1, 0, .26, .12, .08, 0xff8a1f); b.box(.42, .24, .05, .08, .08, .02, 0x111111); b.box(-.45, -.1, 0, .3, .3, .08, 0xffe14a, 0, 0, .5); b.box(0, -.3, .05, .5, .12, .02, 0x4da3ff); b.box(0, .5, 0, .06, .55, .06, 0x6b4a2a); }));
    return g;
  }
  function ghostGroup() {
    const g = new THREE.Group();
    g.add(mesh(b => { b.box(0, .2, 0, 1.1, 1.3, .08, 0xf4f4ff); for (let k = 0; k < 4; k++) b.box(-.4 + k * .27, .05, 0, .25, .3, .08, 0xf4f4ff, 0, 0, k % 2 ? .3 : -.3); b.sph(-.22, 1.0, .06, .12, 0x1c1c24, 0, 1, 1.3, .3); b.sph(.22, 1.0, .06, .12, 0x1c1c24, 0, 1, 1.3, .3); b.box(0, .72, .05, .3, .1, .02, 0xe0382b); b.sph(-.45, .8, .06, .09, 0xffb0c8, 0, 1, 1, .3); b.sph(.45, .8, .06, .09, 0xffb0c8, 0, 1, 1, .3); b.box(0, -.9, -.12, .16, .9, .16, 0x8a5a33); }));
    return g;
  }
  const canGeo = (() => { const b = new BI.Batch(); b.cyl(0, -.15, 0, .15, .15, .3, 0xc9ced6, 12); b.cyl(0, -.15, 0, .155, .155, .1, 0xe0382b, 12); b.cyl(0, .05, 0, .155, .155, .06, 0x4da3ff, 12); return b.mesh(mat).geometry; })();
  const COLS = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d, 0xb36bff, 0xff8fc8];

  // Reihe 3: Zielscheiben
  [[0, 2.3, 1.7, 5], [-5.5, 1.9, 1.05, 3], [5.5, 1.9, 1.05, 3]].forEach(q => { const g = boardGroup(q[2]); g.position.set(X + q[0], q[1], -93); add({ kind: 'board', grp: g, x: X + q[0], y: q[1], z: -93, r: q[2], pts: q[3] }); });
  // Reihe 1: Holzenten auf der Schiene
  [0, 1].forEach(i => { const g = duckGroup(); g.position.set(X, 2.0, -77); add({ kind: 'duck', grp: g, x: X, y: 2.0, z: -77, r: .62, pts: 2, ph: i * 3.1, sp: .55 + i * .15 }); });
  // Dosen-Pyramide auf einem Tisch
  { const tx = X - 6.4, tz = -75.5, table = mesh(b => { b.box(tx, 0, tz, 1.8, 1.0, .8, 0xc8803c); b.box(tx, 1.0, tz, 1.9, .08, .9, 0x8a5a33); }); scene.add(table);
    [[-.4, 1.2], [0, 1.2], [.4, 1.2], [-.2, 1.5], [.2, 1.5], [0, 1.8]].forEach((q, i) => { const g = new THREE.Mesh(canGeo, mat); g.position.set(tx + q[0], q[1] + .02, tz); add({ kind: 'can', grp: g, x: tx + q[0], y: q[1] + .02, z: tz, r: .21, pts: 1, vx: 0, vy: 0, vz: 0, fly: false }); }); }
  // Reihe 2: Pappgeister (schwingen) und Zielballons
  [-3.6, 3.6].forEach((dx, i) => { const g = ghostGroup(); g.position.set(X + dx, .95, -84); add({ kind: 'ghost', grp: g, x: X + dx, y: 1.55, z: -84, r: .62, pts: 3, ph: i * 2, fold: 0 }); });
  [-6.2, .2, 6.2].forEach((dx, i) => { const g = new THREE.Mesh(new THREE.SphereGeometry(.48, 12, 10), new THREE.MeshPhongMaterial({ color: COLS[i * 2], shininess: 90 })); g.scale.y = 1.2; g.position.set(X + dx, 3.2, -84); add({ kind: 'balloon', grp: g, x: X + dx, y: 3.2, z: -84, r: .55, pts: 2, ph: i * 1.7 }); });

  /* ---------- Spielzeug-Blaster (für die Hand, Lauf zeigt nach +z) ---------- */
  R.weaponMesh = function (key) {
    const g = new THREE.Group();
    if (key === 'foam') g.add(mesh(b => { b.box(0, -.08, -.1, .11, .14, .42, 0xff8a1f); b.cyl(0, -.07, .1, .075, .075, .34, 0x4da3ff, 10, Math.PI / 2); b.box(0, -.2, -.2, .09, .2, .11, 0x23262d, 0, .25); b.box(0, .03, -.05, .08, .08, .26, 0xffd23f); b.cyl(0, -.07, .27, .08, .08, .04, 0xffffff, 10, Math.PI / 2); }));
    else if (key === 'water') g.add(mesh(b => { b.box(0, -.07, -.05, .09, .13, .4, 0x4da3ff); b.sph(0, .08, -.12, .11, 0xff5ab0, 1); b.cyl(0, -.05, .22, .035, .035, .22, 0xffffff, 8, Math.PI / 2); b.box(0, -.2, -.14, .08, .2, .1, 0x2d6be0, 0, .25); }));
    else g.add(mesh(b => { for (let k = 0; k < 5; k++) { const a = (k - 2) * .38; b.box(0, Math.sin(a) * .5 - .0, Math.cos(a) * .12 - .12, .05, .22, .05, 0x8a5a33, 0, a * .9); } b.box(0, 0, .0, .02, .86, .02, 0xffffff); b.box(0, -.03, -.05, .08, .16, .08, 0xe0382b); }));
    if (key === 'bow') g.userData.muz = new THREE.Vector3(0, 0, .3); else g.userData.muz = new THREE.Vector3(0, -.06, .48);
    return g;
  };

  /* ---------- Geschosse, Treffer, Schweben von Punkten ---------- */
  const dartGeo = (() => { const b = new BI.Batch(); b.cyl(0, -.12, 0, .035, .035, .24, 0xff8a1f, 8, Math.PI / 2); b.cyl(0, -.03, .16, .05, .05, .06, 0xffd23f, 8, Math.PI / 2); return b.mesh(mat).geometry; })();
  const arrowGeo = (() => { const b = new BI.Batch(); b.cyl(0, -.01, 0, .012, .012, .7, 0x8a5a33, 6, Math.PI / 2); b.cyl(0, -.03, .38, .05, .05, .04, 0xffffff, 10, Math.PI / 2); return b.mesh(mat).geometry; })();
  const projs = [], stuck = [], floats = [], ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmpV = new THREE.Vector3();
  const pool = [];
  function dartMesh(key) { const m = new THREE.Mesh(key === 'bow' ? arrowGeo : dartGeo, mat); m.frustumCulled = false; scene.add(m); return m; }
  const spriteCache = {};
  function floatText(txt, pos, color) {
    let tx = spriteCache[txt + color]; if (!tx) { const cv = document.createElement('canvas'); cv.width = 160; cv.height = 80; const c = cv.getContext('2d'); c.font = 'bold 56px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 9; c.strokeStyle = '#16335e'; c.strokeText(txt, 80, 42); c.fillStyle = color; c.fillText(txt, 80, 42); tx = spriteCache[txt + color] = new THREE.CanvasTexture(cv); }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false })); sp.scale.set(1.8, .9, 1); sp.position.copy(pos); scene.add(sp); floats.push({ sp, t: 0 });
  }
  const say = (k, d) => { if (R.onEvent) R.onEvent(k, d); };

  function hitTarget(g, ratio, w, ip) {
    let pts = g.pts;
    if (g.kind === 'board') pts = ratio < .25 ? 5 : ratio < .52 ? 3 : 1;
    pts *= w.mult; R.score += pts; R.hits++;
    floatText('+' + pts, tmpV.set(ip.x, ip.y + .7, ip.z + .6), g.kind === 'board' && pts >= 5 * w.mult ? '#ffd23f' : '#ffffff');
    const col = [BI.C.gold, BI.C.white, BI.C.pink, BI.C.blue];
    if (g.kind === 'board') { A.ding(); fx.burst(ip.x, ip.y, ip.z + .3, 6, col, 2, .6, 22, 4); }
    else if (g.kind === 'duck') { A.quack(); g.up = false; g.t = 2.4; fx.burst(ip.x, ip.y, ip.z + .3, 8, [BI.C.gold, BI.C.white], 3, .7, 24, 6); }
    else if (g.kind === 'ghost') { A.pop(); g.up = false; g.t = 2.8; fx.burst(ip.x, ip.y, ip.z + .3, 10, [BI.C.white, BI.C.purple], 3, .8, 26, 4); }
    else if (g.kind === 'can') { A.tin(); g.up = false; g.fly = true; g.t = 3; g.vx = (Math.random() - .5) * 3; g.vy = 4 + Math.random() * 2; g.vz = -2 - Math.random() * 2; }
    else if (g.kind === 'balloon') { A.pop(); g.up = false; g.t = 3; g.grp.visible = false; fx.burst(g.x, g.y, g.z, 18, [BI.C.red, BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green], 5, 1, 30, 6); }
    say('hit', { pts, kind: g.kind });
  }

  R.start = function (key) {
    const w = WEAPONS[key] || WEAPONS.foam; R.weapon = w; R.score = 0; R.ammo = w.ammo; R.time = w.time; R.shots = 0; R.hits = 0; R.running = true; R.finished = false; R.out = 0; R.result = null; R.cd = 0;
    for (const g of T) { g.up = true; g.t = 0; g.grp.visible = true; g.grp.position.copy(g.base); g.grp.rotation.set(0, 0, 0); g.x = g.base.x; g.y = g.base.y; g.fold = 0; g.fly = false; }
    say('start', { weapon: w });
  };
  R.stop = function () { R.running = false; R.finished = false; for (const p of projs) { if (p.mesh) p.mesh.visible = false; } projs.length = 0; for (const s of stuck) s.m.visible = false; stuck.length = 0; };
  /* nx, ny = Fadenkreuz im Bildschirm (-1..1); getroffen wird nur in der Bahn (Fangwand/Boden) */
  R.fire = function (nx, ny, muzzle) {
    if (!R.running || R.cd > 0 || R.ammo <= 0) return false; const w = R.weapon; R.ammo--; R.shots++; R.cd = w.cd;
    ndc.set(BI.clamp(nx, -.95, .95), BI.clamp(ny, -.95, .95)); ray.setFromCamera(ndc, camera); const o = ray.ray.origin, d = ray.ray.direction; if (d.z > -.02) d.z = -.02, d.normalize();
    let best = null, bt = 1e9, bx = 0, by = 0, bd = 0;
    for (const g of T) { if (!g.up) continue; const t = (g.z - o.z) / d.z; if (t <= 0) continue; const px = o.x + d.x * t, py = o.y + d.y * t, dist = Math.hypot(px - g.x, py - g.y); if (dist <= g.r * 1.2 && t < bt) { best = g; bt = t; bx = px; by = py; bd = dist / g.r; } }
    let ip;
    if (best) ip = new THREE.Vector3(bx, by, best.z);
    else { const tw = (WALLZ - o.z) / d.z, tg = d.y < -1e-4 ? (.05 - o.y) / d.y : 1e9, t = Math.min(tw, tg); ip = new THREE.Vector3(BI.clamp(o.x + d.x * t, X - 7.8, X + 7.8), Math.max(.05, o.y + d.y * t), o.z + d.z * t); }
    const from = (muzzle || camera.position).clone(), dist = from.distanceTo(ip), p = { w, from, to: ip, t: 0, dur: Math.max(.12, dist / w.speed), target: best, ratio: bd, mesh: null };
    if (w.key !== 'water') { p.mesh = pool.pop() || dartMesh(w.key); p.mesh.geometry = w.key === 'bow' ? arrowGeo : dartGeo; p.mesh.visible = true; }
    projs.push(p); if (w.key === 'foam') A.pew(); else if (w.key === 'water') A.squirt(); else A.thwack(); return true;
  };
  function finish() {
    R.running = false; R.finished = true; const w = R.weapon, rate = R.score / w.scale; let stars = rate >= 26 ? 3 : rate >= 16 ? 2 : rate >= 8 ? 1 : 0; const acc = R.shots ? R.hits / R.shots : 0;
    if (w.key !== 'water' && R.shots >= 6 && acc >= .8) stars++; R.result = { score: R.score, stars, acc, weapon: w.key };
    say('end', R.result);
  }

  R.update = function (dt, t) {
    R.cd = Math.max(0, (R.cd || 0) - dt);
    if (R.running) { R.time -= dt; if (R.time <= 0) { R.time = 0; finish(); } else if (R.ammo <= 0 && !projs.length) { R.out = (R.out || 0) + dt; if (R.out > .6) { R.out = 0; finish(); } } }
    for (const g of T) {
      if (g.kind === 'duck') { g.x = X + Math.sin(t * g.sp + g.ph) * 6.6; g.y = 2.0 + Math.sin(t * 3 + g.ph) * .05; g.grp.position.set(g.x, g.y, g.z); if (!g.up) { g.t -= dt; g.grp.rotation.z = BI.damp(g.grp.rotation.z, Math.PI, 10, dt); if (g.t <= 0) g.up = true; } else g.grp.rotation.z = BI.damp(g.grp.rotation.z, 0, 8, dt); }
      else if (g.kind === 'ghost') { const sw = Math.sin(t * 1.3 + g.ph) * .14; g.fold = BI.damp(g.fold, g.up ? 0 : 1.45, 8, dt); g.grp.rotation.set(-g.fold, 0, g.up ? sw : 0); if (!g.up) { g.t -= dt; if (g.t <= 0) g.up = true; } g.x = g.base.x + Math.sin(t * 1.3 + g.ph) * .3; g.grp.position.x = g.x; }
      else if (g.kind === 'can') { if (g.fly) { g.vy -= 12 * dt; g.grp.position.x += g.vx * dt; g.grp.position.y += g.vy * dt; g.grp.position.z += g.vz * dt; g.grp.rotation.z += 6 * dt; g.t -= dt; if (g.grp.position.y < .15) { g.grp.position.y = .15; g.vy = 0; g.vx *= .5; g.vz *= .5; } if (g.t <= 0) { g.fly = false; g.up = true; g.grp.position.copy(g.base); g.grp.rotation.set(0, 0, 0); } } }
      else if (g.kind === 'balloon') { if (!g.up) { g.t -= dt; if (g.t <= 0) { g.up = true; g.grp.visible = true; } } g.y = g.base.y + Math.sin(t * 1.1 + g.ph) * .7; g.x = g.base.x + Math.sin(t * .7 + g.ph) * .5; g.grp.position.set(g.x, g.y, g.z); }
    }
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i]; p.t += dt; const k = Math.min(1, p.t / p.dur);
      const px = BI.lerp(p.from.x, p.to.x, k), pz = BI.lerp(p.from.z, p.to.z, k), py = BI.lerp(p.from.y, p.to.y, k) + (p.w.key === 'bow' ? 0 : Math.sin(k * Math.PI) * .25);
      if (p.mesh) { p.mesh.position.set(px, py, pz); p.mesh.lookAt(p.to); } else fx.emit(px, py, pz, (Math.random() - .5), (Math.random() - .5), 0, .35, 18, .5, .8, 1, 0, .9);
      if (k >= 1) {
        projs.splice(i, 1);
        if (p.target && p.target.up) hitTarget(p.target, p.ratio, p.w, p.to);
        else if (p.target) { /* Ziel schon umgefallen */ }
        else { say('miss', {}); floatText('Daneben', tmpV.set(p.to.x, p.to.y + .6, p.to.z + .6), '#cfd8ff'); fx.burst(p.to.x, p.to.y, p.to.z + .1, 4, [BI.C.dust, BI.C.white], 1.5, .5, 18, 3); }
        if (p.w.key === 'water') { fx.burst(p.to.x, p.to.y, p.to.z + .1, 8, [BI.C.water, BI.C.white], 3, .6, 20, 6); A.splash(); }
        if (p.mesh) { if (!p.target && p.w.key !== 'water') { stuck.push({ m: p.mesh, t: 6 }); } else if (p.w.key !== 'water') { p.mesh.visible = false; pool.push(p.mesh); } }
      }
    }
    for (let i = stuck.length - 1; i >= 0; i--) { const s = stuck[i]; s.t -= dt; if (s.t <= 0) { s.m.visible = false; pool.push(s.m); stuck.splice(i, 1); } }
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; f.sp.position.y += dt * 1.1; f.sp.material.opacity = Math.max(0, 1 - f.t / 1.3); if (f.t > 1.3) { scene.remove(f.sp); f.sp.material.dispose(); floats.splice(i, 1); } }
    if (!R.running && !R.finished) for (const g of T) if (g.kind === 'ghost' || g.kind === 'duck') { /* Attrappen laufen weiter als Kulisse */ }
  };
  /* Bildschirmposition (-1..1) einer Attrappe – zum Zielen-Hilfe und für Tests */
  R.ndcOf = function (g) { tmpV.set(g.x, g.y, g.z).project(camera); return { x: tmpV.x, y: tmpV.y }; };
  return R;
};

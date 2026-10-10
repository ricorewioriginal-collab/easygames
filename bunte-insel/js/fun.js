'use strict';
/* Bunte Insel – Spaß-Aktionen: Kaugummi werfen (Kleckse bleiben!), Tanzen (alle machen mit), Ball, Luftballons, Feuerwerk.
   G = Schnittstelle zum Spiel: { scene, fx, W, A, P, vehicles, npcs, animals, say(), addStars() } */
BI.createFun = function (G) {
  const { scene, fx, W, A } = G, TAU = BI.TAU, F = { dancing: false, style: 0 };
  const COL = [0xff6fb5, 0x6bd67e, 0x4da3ff, 0xffd23f, 0xff9a3a, 0xb36bff], RGB = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
  const origin = () => { const P = G.P, v = P.veh; return v ? { x: v.x, y: (v.y || 0) + (v.isTrain ? 3 : 1.0), z: v.z, h: v.h, v: v.v || 0 } : { x: P.x, y: P.y, z: P.z, h: P.h, v: 0 }; };

  /* ---------- Kaugummi ---------- */
  const shotMat = new THREE.MeshLambertMaterial({ color: 0xff6fb5, emissive: 0x551133 }), shotGeo = new THREE.IcosahedronGeometry(.2, 1), shots = [];
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(shotGeo, new THREE.MeshLambertMaterial({ color: 0xff6fb5, emissive: 0x551133 })); m.visible = false; scene.add(m); shots.push({ m, on: false, vx: 0, vy: 0, vz: 0, c: 0 }); }
  const NB = 180, blobs = new THREE.InstancedMesh(new THREE.SphereGeometry(.24, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }), NB);
  blobs.frustumCulled = false; blobs.count = 0; scene.add(blobs); let nb = 0; const bm = new THREE.Matrix4(), bq = new THREE.Quaternion(), bp = new THREE.Vector3(), bs = new THREE.Vector3(), bc = new THREE.Color();
  function blob(x, y, z, ci, flat) {
    const i = nb % NB; nb++; blobs.count = Math.min(nb, NB);
    bp.set(x, Math.max(y, .06), z); const k = .8 + Math.random() * .7; bs.set(k * 1.25, flat ? .22 : .7 * k, k * 1.25);
    bm.compose(bp, bq.setFromEuler(new THREE.Euler(0, Math.random() * 6, 0)), bs); blobs.setMatrixAt(i, bm); blobs.setColorAt(i, bc.setHex(COL[ci % COL.length]));
    blobs.instanceMatrix.needsUpdate = true; blobs.instanceColor.needsUpdate = true;
  }
  F.gum = function () {
    const o = origin(), sh = shots.find(s => !s.on); if (!sh) return;
    const sx = Math.sin(o.h), sz = Math.cos(o.h), sp = 16 + Math.max(0, o.v);
    sh.on = true; sh.m.visible = true; sh.c = (Math.random() * COL.length) | 0; sh.m.position.set(o.x + sx * .9, o.y + 1.3, o.z + sz * .9);
    sh.vx = sx * sp; sh.vz = sz * sp; sh.vy = 4.2; sh.m.material.color.setHex(COL[sh.c]); A.pop();
  };
  function hitNpc(n) {
    A.splat(); fx.burst(n.x, 1.7, n.z, 10, [RGB(0xff6fb5), BI.C.white], 3, .8, 26, 9);
    n.hop = .7; n.wave = 1.6; if (!n.gumMesh) { const g = new THREE.Mesh(new THREE.IcosahedronGeometry(.2, 1), new THREE.MeshLambertMaterial({ color: 0xff6fb5, emissive: 0x551133 })); g.position.set(0, 1.78, .05); g.scale.set(1.3, .9, 1.3); n.c.group.add(g); n.gumMesh = g; }
    n.gumT = 9; if ((n.gumCool || 0) <= 0) { n.gumCool = 20; G.addStars(1); G.say('🍬 Treffer! Der Kaugummi klebt!', 1800); }
  }
  function updateShots(dt) {
    for (const s of shots) {
      if (!s.on) continue; const m = s.m; s.vy -= 14 * dt; const ox = m.position.x, oy = m.position.y, oz = m.position.z;
      m.position.x += s.vx * dt; m.position.y += s.vy * dt; m.position.z += s.vz * dt; const x = m.position.x, y = m.position.y, z = m.position.z;
      let hit = false, hx = x, hy = y, hz = z, flat = false;
      if (y <= .1) { hit = true; hy = .06; flat = true; }
      else {
        for (const n of G.npcs) if (Math.abs(n.x - x) < .6 && Math.abs(n.z - z) < .6 && y < 2.1) { hitNpc(n); hit = true; hx = ox; hy = oy; hz = oz; break; }
        if (!hit) for (const a of G.animals) if (Math.abs(a.x - x) < .9 && Math.abs(a.z - z) < .9 && y < 1.8) { a.hop = .6; (a.k === 'cow' ? A.moo : A.baa)(); hit = true; hx = ox; hy = oy; hz = oz; break; }
        if (!hit) for (const v of G.vehicles) if (v !== G.P.veh && Math.hypot(v.x - x, v.z - z) < v.r + .5 && y < (v.y || 0) + 2.8) { hit = true; hx = ox; hy = oy; hz = oz; break; }
        if (!hit) for (const b of W.boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && y < b.h) { hit = true; hx = ox; hy = oy; hz = oz; break; }
        if (!hit) for (const c of W.circles) if (y < c.h && Math.hypot(x - c.x, z - c.z) < c.r) { hit = true; hx = ox; hy = oy; hz = oz; break; }
      }
      if (hit) { s.on = false; m.visible = false; blob(hx, hy, hz, s.c, flat); if (flat) { A.splat(); fx.burst(hx, .2, hz, 6, [RGB(COL[s.c % COL.length])], 2.5, .5, 22, 9); } }
    }
    for (const n of G.npcs) {
      if (n.gumCool > 0) n.gumCool -= dt;
      if (n.gumT > 0) { n.gumT -= dt; if (n.gumT <= 0 && n.gumMesh) { n.c.group.remove(n.gumMesh); n.gumMesh = null; } }
    }
  }

  /* ---------- Bälle ---------- */
  const balls = [], ballGeo = (() => { const b = new BI.Batch(); b.sph(0, 0, 0, .45, 0xffffff, 1); for (const [x, y, z] of [[.4, 0, 0], [-.4, 0, 0], [0, .4, 0], [0, -.4, 0], [0, 0, .4], [0, 0, -.4]]) b.sph(x, y, z, .17, 0x23262d, 0); return b.mesh(BI.mat()).geometry; })();
  F.balls = balls;
  F.ball = function () {
    const o = origin(); if (balls.length >= 3) { const old = balls.shift(); scene.remove(old.m); }
    const m = new THREE.Mesh(ballGeo, BI.mat()), b = { m, x: o.x + Math.sin(o.h) * 2.4, y: o.y + 2, z: o.z + Math.cos(o.h) * 2.4, vx: 0, vy: 0, vz: 0, cd: 0 };
    const q = W.resolve(b.x, b.z, .45, {}); b.x = q.x; b.z = q.z; scene.add(m); balls.push(b); A.pop();
  };
  const _p = {};
  function updateBalls(dt) {
    const P = G.P;
    for (const b of balls) {
      if (b.held) { b.m.position.set(b.x, b.y, b.z); continue; }
      b.cd -= dt; b.vy -= 20 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      if (b.y < .45) { b.y = .45; if (b.vy < -1.8) { b.vy = -b.vy * .6; } else b.vy = 0; }
      const f = Math.pow(b.y <= .46 ? .3 : .85, dt); b.vx *= f; b.vz *= f;
      W.resolve(b.x, b.z, .45, _p); if (_p.hit) { const nx = _p.x - b.x, nz = _p.z - b.z, l = Math.hypot(nx, nz) || 1, vn = (b.vx * nx + b.vz * nz) / l; if (vn < 0) { b.vx -= 1.6 * vn * nx / l; b.vz -= 1.6 * vn * nz / l; } b.x = _p.x; b.z = _p.z; }
      if (b.cd <= 0) {
        if (!P.veh) { const dx = b.x - P.x, dz = b.z - P.z, d = Math.hypot(dx, dz); if (d < 1.1 && b.y < 1.3 && P.y < 1) { const sp = 6 + (P.speed || 0) * 1.2; b.vx = dx / (d || 1) * sp; b.vz = dz / (d || 1) * sp; b.vy = 3; b.cd = .25; A.kick(); } }
        for (const v of G.vehicles) { if (Math.abs(v.v) < 1 || (v.y || 0) > 2) continue; const dx = b.x - v.x, dz = b.z - v.z, d = Math.hypot(dx, dz); if (d < v.r + .7) { const sp = Math.abs(v.v) * 1.25 + 3; b.vx = dx / (d || 1) * sp; b.vz = dz / (d || 1) * sp; b.vy = 3.5; b.cd = .25; A.kick(); break; } }
      }
      b.m.position.set(b.x, b.y, b.z); b.m.rotation.x += b.vz * dt * 2; b.m.rotation.z -= b.vx * dt * 2;
    }
  };

  /* ---------- Luftballons ---------- */
  const NBL = 48, bl = [], balloons = new THREE.InstancedMesh(new THREE.SphereGeometry(.55, 10, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }), NBL);
  balloons.frustumCulled = false; scene.add(balloons); for (let i = 0; i < NBL; i++) { bl.push({ on: false, x: 0, y: 0, z: 0, vy: 0, ph: 0 }); balloons.setColorAt(i, bc.setHex(COL[i % COL.length])); }
  balloons.instanceColor.needsUpdate = true; let nbl = 0;
  /* freie Pappnase: steigt auf – wer sie fängt, bekommt einen Stern */
  const paps = []; for (let i = 0; i < 3; i++) { const q = G.makePappnase(); q.group.visible = false; scene.add(q.group); paps.push({ q, on: false, x: 0, y: 0, z: 0, vy: 0, caught: false, ph: i * 3 }); }
  function spawnPap(o) { const a = paps.find(c => !c.on) || paps[0]; a.on = true; a.caught = false; a.q.group.visible = true; a.x = o.x + Math.sin(o.h) * 2.0 + (Math.random() - .5) * .8; a.z = o.z + Math.cos(o.h) * 2.0 + (Math.random() - .5) * .8; a.y = .8; a.vy = 1.0; }
  function updatePaps(dt, t) {
    const P = G.P, px = P.veh ? P.veh.x : P.x, py = (P.veh ? (P.veh.y || 0) : P.y) + 1.2, pz = P.veh ? P.veh.z : P.z;
    for (const a of paps) {
      if (!a.on) continue; a.y += a.vy * dt; a.x += Math.sin(t * 1.2 + a.ph) * .6 * dt; const g = a.q.group; g.position.set(a.x, a.y, a.z);
      g.rotation.y = Math.atan2(G.camera.position.x - a.x, G.camera.position.z - a.z); g.rotation.z = Math.sin(t * 2 + a.ph) * .12;
      if (!a.caught && Math.hypot(a.x - px, a.z - pz) < 3.2 && Math.abs(a.y + .6 - py) < 3) { a.caught = true; a.vy = 6; A.giggle(); G.addStars(1); G.say('🎈 Pappnase gefangen! 😂 +1 ⭐', 2400); fx.burst(a.x, a.y + .6, a.z, 14, [BI.C.pink, BI.C.gold, BI.C.white], 4, 1, 28, -1); }
      if (a.y > 70) { a.on = false; g.visible = false; }
    }
  }
  F.balloons = function () {
    const o = origin(); for (let i = 0; i < 8; i++) { const b = bl[nbl++ % NBL], a = Math.random() * TAU, r = 1.5 + Math.random() * 3; b.on = true; b.x = o.x + Math.sin(a) * r; b.z = o.z + Math.cos(a) * r; b.y = o.y + .6 + Math.random(); b.vy = 2 + Math.random() * 1.6; b.ph = Math.random() * 6; }
    spawnPap(o); A.whoosh(); G.say('🎈 Ballons! Fang Pappnase!', 1800);
  };
  const bdm = new THREE.Matrix4(), bdp = new THREE.Vector3(), bds = new THREE.Vector3(1, 1.25, 1), bdq = new THREE.Quaternion();
  function updateBalloons(dt, t) {
    let any = false;
    for (let i = 0; i < NBL; i++) {
      const b = bl[i]; if (b.on) { b.y += b.vy * dt; b.x += Math.sin(t * .9 + b.ph) * .5 * dt; if (b.y > 75) b.on = false; any = true; }
      if (!b.on) { bds.setScalar(0); } else bds.set(1, 1.25, 1);
      bdp.set(b.x, b.y, b.z); bdm.compose(bdp, bdq, bds); balloons.setMatrixAt(i, bdm);
    }
    balloons.visible = any; if (any) balloons.instanceMatrix.needsUpdate = true;
  }

  /* ---------- Feuerwerk ---------- */
  const rockets = [];
  F.fireworks = function () {
    const o = origin(); A.whoosh();
    for (let i = 0; i < 4; i++) { const a = Math.random() * TAU, r = 7 + Math.random() * 8; rockets.push({ x: o.x + Math.sin(a) * r, z: o.z + Math.cos(a) * r, y: 1, vy: 22 + Math.random() * 6, ty: 26 + Math.random() * 12, delay: i * .45, c: [RGB(COL[(Math.random() * COL.length) | 0]), RGB(COL[(Math.random() * COL.length) | 0]), BI.C.white] }); }
    G.say('🎆 Feuerwerk!', 1500);
  };
  function updateRockets(dt) {
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; if ((r.delay -= dt) > 0) continue;
      r.y += r.vy * dt; fx.emit(r.x, r.y, r.z, (Math.random() - .5) * .8, -2, (Math.random() - .5) * .8, .5, 22, 1, .85, .4, 0, .9);
      if (r.y >= r.ty) {
        A.boom();
        for (let k = 0; k < 64; k++) { const a = Math.random() * TAU, e = Math.acos(2 * Math.random() - 1), sp = 7 + Math.random() * 3, c = r.c[k % 3]; fx.emit(r.x, r.y, r.z, Math.sin(e) * Math.cos(a) * sp, Math.cos(e) * sp, Math.sin(e) * Math.sin(a) * sp, 1.6, 40, c[0], c[1], c[2], 5, 1); }
        rockets.splice(i, 1);
      }
    }
  }

  /* ---------- Tanzen ---------- */
  let danceT = 0, partyT = 0, partyCool = 0, styleT = 0;
  F.setDance = function (on) { if (F.dancing === on) return; F.dancing = on; danceT = 0; partyT = 0; if (on) { F.style = (Math.random() * 3) | 0; G.say('🕺 Tanzparty! Komm, Dorf!', 1800); } };
  function updateDance(dt, t) {
    if (!F.dancing) return; const P = G.P; danceT += dt; styleT += dt; if (styleT > 4) { styleT = 0; F.style++; }
    A.dance(dt);
    const list = G.npcs.filter(n => Math.hypot(n.x - P.x, n.z - P.z) < 60).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z));
    list.forEach((n, i) => { const a = i / list.length * TAU + t * .35; n.tx = P.x + Math.sin(a) * 3.2; n.tz = P.z + Math.cos(a) * 3.2; n.wait = 0; n.dancer = 1.2; n.spd = 4.2; n.style = (F.style + i) % 3; });
    if (Math.random() < dt * 2) fx.burst(P.x, 2.6, P.z, 3, [BI.C.pink, BI.C.gold, BI.C.blue, BI.C.green], 2.5, 1.1, 30, -1);
    const close = list.filter(n => Math.hypot(n.x - P.x, n.z - P.z) < 4.5).length;
    if (close >= 4) { partyT += dt; if (partyT > 5 && partyCool <= 0) { partyCool = 60; A.fanfare(); G.addStars(3); G.say('🎉 Mega-Party! +3 ⭐', 2600); fx.burst(P.x, 3, P.z, 50, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green, BI.C.orange], 10, 1.8, 28, 9); } } else partyT = Math.max(0, partyT - dt);
  }

  /* ---------- Bäume hauen (Blätter, Äpfel, Sterne – der Baum wackelt und gibt nach 8 Treffern auf) ---------- */
  const apples = [], appleGeo = (() => { const b = new BI.Batch(); b.sph(0, 0, 0, .22, 0xe83a3a, 1); b.cyl(0, .18, 0, .02, .02, .14, 0x6b4a2a, 4); return b.mesh(BI.mat()).geometry; })();
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(appleGeo, BI.mat()); m.visible = false; scene.add(m); apples.push({ m, on: false, x: 0, y: 0, z: 0, vy: 0, t: 0 }); }
  function apple(T) { const a = apples.find(q => !q.on) || apples[0]; a.on = true; a.m.visible = true; a.x = T.x + (Math.random() - .5) * 2.4; a.z = T.z + (Math.random() - .5) * 2.4; a.y = (T.top || 3.5) - .6; a.vy = 0; a.t = 40; }
  const userTrees = () => (G.userTrees ? G.userTrees() : []);
  /* nächster Baum in Reichweite (Welt-Bäume und selbst gebaute) */
  F.nearTree = function () {
    const P = G.P; if (P.veh) return null; let best = null, bd = 2.9;
    for (const T of G.W.trees) { const d = Math.hypot(T.x - P.x, T.z - P.z); if (d < bd) { bd = d; best = T; } }
    for (const T of userTrees()) { const d = Math.hypot(T.x - P.x, T.z - P.z); if (d < bd) { bd = d; best = T; } }
    return best;
  };
  const WORDS = ['BONK!', 'PUFF!', 'AUA!', 'BUMM!', 'HUIII!', 'WUMMS!'];
  F.hitTree = function (T, fx0, fz0) {
    const dx = T.x - fx0, dz = T.z - fz0, l = Math.hypot(dx, dz) || 1; T.wx = dx / l; T.wz = dz / l; T.wob = 1; A.bonk(); G.say(WORDS[(Math.random() * WORDS.length) | 0], 700);
    fx.burst(T.x - T.wx * .5, 1.3, T.z - T.wz * .5, 6, [BI.C.dust, BI.C.white], 2.5, .5, 26, 6);
    for (let i = 0; i < 12; i++) fx.emit(T.x + (Math.random() - .5) * 2.2, (T.top || 3.6) + Math.random(), T.z + (Math.random() - .5) * 2.2, (Math.random() - .5) * 1.5, .5, (Math.random() - .5) * 1.5, 2.4, 24, .3 + Math.random() * .3, .75, .3, 1.5, .95);
    if (T.cd > 0) return; T.hp--; if (Math.random() < .35) apple(T);
    if (T.hp <= 0) { T.cd = 25; T.hp = 8; for (let i = 0; i < 4; i++) apple(T); A.fanfare(); G.addStars(3); G.say('🏆 Der Baum gibt auf! +3 ⭐', 2800); fx.burst(T.x, 3, T.z, 40, [BI.C.gold, BI.C.pink, BI.C.green, BI.C.white], 8, 1.6, 26, 9); }
  };
  function updateApples(dt) {
    const P = G.P, px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    for (const a of apples) {
      if (!a.on) continue; a.t -= dt; if (a.t <= 0) { a.on = false; a.m.visible = false; continue; }
      a.vy -= 14 * dt; a.y += a.vy * dt; if (a.y < .22) { a.y = .22; a.vy = a.vy < -2 ? -a.vy * .35 : 0; }
      a.m.position.set(a.x, a.y, a.z); a.m.rotation.y += dt;
      if (Math.hypot(a.x - px, a.z - pz) < 1.5 && a.y < 1.6) { a.on = false; a.m.visible = false; A.star(); G.addStars(1); G.say('🍎 Apfel! +1 ⭐', 1200); fx.burst(a.x, .6, a.z, 8, [BI.C.red, BI.C.gold, BI.C.white], 4, .7, 24, 8); }
    }
    for (const T of userTrees()) if (T.cd > 0) T.cd -= dt;
  }

  /* ---------- Seifenblasen: normale zum Plattmachen und XXL (Riesenblase trägt Jannis nach oben) ---------- */
  const NBU = 140, bub = [], TINT = [0xffffff, 0xcfeaff, 0xffd6f0, 0xd9ffe8, 0xfff3c4];
  const bubMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: .32, shininess: 140, specular: 0xffffff, emissive: 0x1c2a44, depthWrite: false });
  const bubMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), bubMat, NBU); bubMesh.frustumCulled = false; scene.add(bubMesh);
  for (let i = 0; i < NBU; i++) { bub.push({ on: false, x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0, r: .2, t: 0, ph: Math.random() * 6, big: false }); bubMesh.setColorAt(i, bc.setHex(TINT[i % TINT.length])); bubMesh.setMatrixAt(i, bdm.compose(bdp.set(0, -50, 0), bdq, bds.set(0, 0, 0))); }
  bubMesh.instanceColor.needsUpdate = true; let pops = 0;
  const popFx = (b, big) => { fx.burst(b.x, b.y, b.z, big ? 26 : 5, [RGB(COL[(Math.random() * COL.length) | 0]), BI.C.white, BI.C.blue], big ? 6 : 1.6, big ? 1 : .5, big ? 30 : 16 + b.r * 40, 3); };
  function spawnBubble(o, r, big) {
    const b = bub.find(q => !q.on); if (!b) return; const sx = Math.sin(o.h), sz = Math.cos(o.h), sp = big ? 1.2 + Math.random() * 1.2 : 1.2 + Math.random() * 2.8, a = (Math.random() - .5) * .9;
    b.on = true; b.big = !!big; b.r = r; b.x = o.x + sx * (big ? 3.5 : .9) + (Math.random() - .5) * .3; b.y = (big ? r + .3 : 1.15 + Math.random() * .3) + (o.y || 0); b.z = o.z + sz * (big ? 3.5 : .9) + (Math.random() - .5) * .3;
    b.vx = Math.sin(o.h + a) * sp; b.vz = Math.cos(o.h + a) * sp; b.vy = big ? .5 : .2 + Math.random() * .8; b.t = big ? 14 : 6 + Math.random() * 5;
  }
  F.bubbles = function () { const o = origin(); for (let i = 0; i < 16; i++) spawnBubble(o, .12 + Math.random() * .26, false); A.blow(); if (!G.P.veh) G.P.wave = .8; };
  /* XXL: Riesenblase um Jannis herum – schwebt hoch, trägt ihn ein Stück und platzt sanft */
  const giant = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), new THREE.MeshPhongMaterial({ color: 0xcfeaff, transparent: true, opacity: .26, shininess: 160, specular: 0xffffff, emissive: 0x1c2a44, depthWrite: false })); giant.visible = false; scene.add(giant);
  F.ride = null;
  function endRide(p) { if (!F.ride) return; F.ride = null; giant.visible = false; const P = G.P; fx.burst(P.x, P.y + 1, P.z, 40, [RGB(0xcfeaff), BI.C.white, BI.C.pink, BI.C.blue], 7, 1.2, 30, 3); A.bigpop(); P.softFall = 2.2; }
  F.xxl = function () {
    const P = G.P; if (F.ride) { endRide(); return; }
    if (P.veh) { G.say('🔮 Zum Schweben erst aussteigen', 1600); return; }
    F.setDance(false); F.ride = { t: 8, r: .25 }; giant.visible = true; A.inflate(); G.say('🔮 Riesen-Blase! Schwebe mit dem Joystick – nochmal drücken = platzen', 3000);
    const o = origin(); for (let i = 0; i < 2; i++) spawnBubble(o, 1 + Math.random() * .7, true);
  };
  const _bm = new THREE.Matrix4(), _bp = new THREE.Vector3(), _bs = new THREE.Vector3(), _bq = new THREE.Quaternion();
  function updateBubbles(dt, t) {
    const P = G.P, px = P.veh ? P.veh.x : P.x, py = (P.veh ? (P.veh.y || 0) : P.y) + 1, pz = P.veh ? P.veh.z : P.z;
    for (let i = 0; i < NBU; i++) {
      const b = bub[i];
      if (b.on) {
        b.t -= dt; b.vx = BI.damp(b.vx, Math.sin(t * .35 + b.ph) * .5, .8, dt); b.vz = BI.damp(b.vz, Math.cos(t * .3 + b.ph) * .5, .8, dt);
        b.x += b.vx * dt; b.z += b.vz * dt; b.y += (b.vy + Math.sin(t * 1.4 + b.ph) * .25) * dt; if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * .4 + .2; } if (b.y > 40) b.t = 0;
        const d = Math.hypot(b.x - px, b.y - py, b.z - pz);
        if (b.t <= 0) { b.on = false; popFx(b, b.big); if (b.big) A.bigpop(); else if (Math.random() < .4) A.bubblePop(); }
        else if (!F.ride && d < (b.big ? b.r * .55 : b.r + .55)) { b.on = false; popFx(b, b.big); if (b.big) { A.bigpop(); G.addStars(1); G.say('🫧 PLATSCH! Riesenblase! +1 ⭐', 1800); } else { A.bubblePop(); if (++pops % 25 === 0) { G.addStars(1); A.star(); G.say('🫧 Blasen-Meister! +1 ⭐', 2000); } } }
      }
      if (b.on) { const w = 1 + Math.sin(t * 6 + b.ph) * .035; bubMesh.setMatrixAt(i, _bm.compose(_bp.set(b.x, b.y, b.z), _bq, _bs.set(b.r * w, b.r / w, b.r * w))); } else bubMesh.setMatrixAt(i, _bm.compose(_bp.set(0, -50, 0), _bq, _bs.set(0, 0, 0)));
    }
    bubMesh.instanceMatrix.needsUpdate = true;
    const R = F.ride; if (R) {
      R.t -= dt; R.r = Math.min(2.1, R.r + dt * 1.8); P.wave = Math.max(P.wave || 0, .3);
      const w = Math.sin(t * 5) * .05; giant.position.set(P.x, P.y + 1.05, P.z); giant.scale.set(R.r * (1 + w), R.r * (1 - w), R.r * (1 + w)); if (R.t <= 0 || P.veh) endRide();
    }
  }
  /* ---------- Piratenkanone: Kugel fliegt aufs Meer und platscht ---------- */
  const balls2 = [];
  F.cannon = function (c, delay) { balls2.push({ c, delay: delay || 0, on: false, x: c.x, y: c.y, z: c.z, vx: 0, vy: 0, vz: 0 }); };
  function updateCannons(dt) {
    for (let i = balls2.length - 1; i >= 0; i--) {
      const q = balls2[i];
      if (!q.on) { q.delay -= dt; if (q.delay > 0) continue; q.on = true; A.cannon(); fx.burst(q.c.x, q.c.y, q.c.z, 14, [BI.C.white, BI.C.dust, BI.C.orange], 4, 1.3, 70, 0); q.vx = 26 + Math.random() * 6; q.vy = 6; q.vz = (Math.random() - .5) * 6; continue; }
      q.vy -= 14 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; fx.emit(q.x, q.y, q.z, 0, 0, 0, .5, 28, .25, .25, .28, 0, .7);
      if (q.y < -.2) { fx.burst(q.x, 0, q.z, 24, [BI.C.water, BI.C.white], 7, 1, 40, 12); A.splash(); balls2.splice(i, 1); }
    }
  }

  F.update = function (dt, t) {
    if (partyCool > 0) partyCool -= dt;
    updateShots(dt); updateBalls(dt); updateBalloons(dt, t); updateRockets(dt); updateDance(dt, t); updateApples(dt); updateBubbles(dt, t); updatePaps(dt, t); updateCannons(dt); G.W.updateTrees(dt, t);
    for (const n of G.npcs) if (n.dancer > 0) { n.dancer -= dt; if (n.dancer <= 0) n.spd = n.spd0; }
  };
  F.trampAt = null; // wird vom Bau-Modul gesetzt
  return F;
};

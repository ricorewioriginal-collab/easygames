/* R04 Mikrofon-Kurier (3D): Mit dem Studio-Scooter durch den Lager-Parcours flitzen, Mikrofone und Kabeltrommeln
   einsammeln und an der Station gleicher Farbe abgeben. Logik in Bodenkoordinaten (x 0..36, z 0..20), 3D nur Darstellung. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const W = 36, D = 20, PR = 0.55;
  const CAM = { x: 18, y: 30, z: 24, tx: 18, ty: 0, tz: 9.2, fov: 42 };
  const COLS = ['#ff4d6d', '#6ef0ff', '#ffb02e'], CNAME = ['Rot', 'Blau', 'Gelb'];
  const STATIONS = [{ x: 2.6, z: 10 }, { x: 33.4, z: 3.2 }, { x: 33.4, z: 16.8 }];
  const CFG = [
    { time: 80, need: 5, cap: 2, crates: 6, vmax: 7.5 },
    { time: 70, need: 6, cap: 1, crates: 8, vmax: 7.5 },
    { time: 70, need: 8, cap: 1, crates: 11, vmax: 8 }
  ];
  // Kamera-Mathematik ohne THREE (für Zeiger ↔ Boden)
  const K = (function () {
    const f = [CAM.tx - CAM.x, CAM.ty - CAM.y, CAM.tz - CAM.z], l = Math.hypot(f[0], f[1], f[2]); f[0] /= l; f[1] /= l; f[2] /= l;
    const rl = Math.hypot(f[2], f[0]), r = [-f[2] / rl, 0, f[0] / rl], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    return { f, r, u, th: Math.tan(CAM.fov * Math.PI / 360), as: 16 / 9 };
  })();
  function toGround(sx, sy) {
    const nx = sx / 480 - 1, ny = 1 - sy / 270, d = [0, 1, 2].map(i => K.f[i] + K.r[i] * nx * K.th * K.as + K.u[i] * ny * K.th);
    const t = d[1] < -1e-4 ? -CAM.y / d[1] : 200; return { x: CAM.x + d[0] * t, z: CAM.z + d[2] * t };
  }
  function toScreen(x, y, z) {
    const d = [x - CAM.x, y - CAM.y, z - CAM.z], dot = v => d[0] * v[0] + d[1] * v[1] + d[2] * v[2], dz = dot(K.f);
    return { x: (dot(K.r) / (dz * K.th * K.as) + 1) * 480, y: (1 - dot(K.u) / (dz * K.th)) * 270 };
  }
  const blockedAt = (st, x, z, m) => x < m || z < m || x > W - m || z > D - m || st.crates.some(c => Math.abs(x - c.x) < c.hw + m && Math.abs(z - c.z) < c.hd + m);
  function grid(st) { const g = []; for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) g.push(blockedAt(st, i + 0.5, j + 0.5, 0.75) ? 1 : 0); return g; }
  function bfs(g, from, to) {
    const prev = new Int16Array(W * D).fill(-1), q = [from]; prev[from] = from;
    for (let h = 0; h < q.length; h++) {
      const c = q[h]; if (c === to) break; const ci = c % W, cj = (c / W) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const i = ci + di, j = cj + dj, n = j * W + i; if (i >= 0 && j >= 0 && i < W && j < D && !g[n] && prev[n] < 0) { prev[n] = c; q.push(n); } }
    }
    if (prev[to] < 0) return null; const path = [to]; while (path[0] !== from) path.unshift(prev[path[0]]); return path;
  }
  function flood(g, from) {
    const seen = new Uint8Array(W * D), q = [from]; seen[from] = 1;
    for (let h = 0; h < q.length; h++) { const c = q[h], ci = c % W, cj = (c / W) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const i = ci + di, j = cj + dj, n = j * W + i; if (i >= 0 && j >= 0 && i < W && j < D && !g[n] && !seen[n]) { seen[n] = 1; q.push(n); } } }
    return q.length;
  }
  const cellOf = (x, z) => PT.clamp(Math.floor(z), 0, D - 1) * W + PT.clamp(Math.floor(x), 0, W - 1);
  function freeSpot(st, away) {
    for (let k = 0; k < 400; k++) {
      const x = PT.randInt(st, 2, W - 3) + 0.5, z = PT.randInt(st, 1, D - 2) + 0.5;
      if (st.g[cellOf(x, z)] || STATIONS.some(s => Math.hypot(s.x - x, s.z - z) < 3.5) || away.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) continue;
      return { x, z };
    }
    return { x: 18.5, z: 10.5 };
  }
  function spawnItem(st) { const p = freeSpot(st, [{ x: st.p.x, z: st.p.z, r: 5 }].concat(st.items.map(i => ({ x: i.x, z: i.z, r: 3 })))); st.items.push({ x: p.x, z: p.z, col: PT.randInt(st, 0, 2), kind: PT.randInt(st, 0, 1) }); }
  MG.define({
    id: 'R04', group: 'roadtrip', name: 'Mikrofon-Kurier', icon: '🛴',
    short: 'Flitz mit dem Scooter durchs Lager und bring Mikros und Kabel zur richtigen Studio-Station.',
    rules: [
      'Fahr über ein Mikrofon oder eine Kabeltrommel, um sie aufzuladen.',
      'Gib sie an der Station mit der gleichen Farbe ab.',
      'Kisten blockieren, Kabelsalat bremst, gelbe Rampen geben Schwung.',
      'Genug Lieferungen vor Ablauf der Zeit = gewonnen, sonst verloren.'
    ],
    controls: { key: '↑ Gas, ↓ Bremse/zurück, ←/→ lenken', touch: 'Finger halten: Scooter fährt dorthin', pad: 'Stick/Steuerkreuz' },
    touch: ['left', 'right', 'up', 'down'],
    render: '3d',
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      const st = { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, done: 0, crates: [], patches: [], ramps: [], items: [], carry: [],
        p: { x: 18, z: 10, h: -Math.PI / 2, v: 0, boost: 0, jump: 0 }, keys: { up: false, down: false, left: false, right: false }, ptr: null, bumpCool: 0, msg: '' };
      for (let k = 0, tries = 0; k < c.crates && tries < 300; tries++) {
        const cr = { x: PT.randInt(st, 6, W - 6) + 0.5, z: PT.randInt(st, 2, D - 3) + 0.5, hw: PT.randInt(st, 2, 5) * 0.35, hd: PT.randInt(st, 2, 5) * 0.35 };
        if (Math.hypot(cr.x - 18, cr.z - 10) < 3 || STATIONS.some(s => Math.hypot(s.x - cr.x, s.z - cr.z) < 5)) continue;
        st.crates.push(cr); const g = grid(st), free = g.reduce((a, v) => a + (v ? 0 : 1), 0);
        if (g[cellOf(18, 10)] || flood(g, cellOf(18, 10)) < free) st.crates.pop(); else k++;
      }
      st.g = grid(st);
      for (let k = 0; k < 3; k++) { const p = freeSpot(st, [{ x: 18, z: 10, r: 3 }]); st.patches.push({ x: p.x, z: p.z, r: 1.4 }); }
      for (let k = 0; k < 2; k++) { const p = freeSpot(st, [{ x: 18, z: 10, r: 3 }].concat(st.patches.map(q => ({ x: q.x, z: q.z, r: 3 })))); st.ramps.push({ x: p.x, z: p.z }); }
      for (let k = 0; k < 3; k++) spawnItem(st);
      return st;
    },
    input(st, a) {
      if (a.type === 'key' && st.keys[a.key] !== undefined) st.keys[a.key] = !!a.down;
      if (a.type === 'pointer') st.ptr = a.phase === 'up' ? null : toGround(a.x, a.y);
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, p = st.p, k = st.keys; st.t += dt; st.bumpCool -= dt;
      let thr = (k.up ? 1 : 0) - (k.down ? 1 : 0), turn = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      if (st.ptr) {
        const dx = st.ptr.x - p.x, dz = st.ptr.z - p.z, dist = Math.hypot(dx, dz);
        let da = Math.atan2(dz, dx) - p.h; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        turn = PT.clamp(da * 4, -1, 1); thr = dist > 0.4 ? (Math.abs(da) < 1.1 ? 1 : 0) : 0;
        if (dist < 1.5 && p.v > dist * 4) thr = -1;
      }
      p.h += turn * 3.4 * dt;
      const slow = st.patches.some(q => Math.hypot(q.x - p.x, q.z - p.z) < q.r);
      const vmax = (slow ? 0.45 : 1) * (p.boost > 0 ? 1.5 : 1) * c.vmax;
      if (thr > 0) p.v += 14 * dt; else if (thr < 0) p.v -= (p.v > 0 ? 20 : 8) * dt; else p.v -= Math.sign(p.v) * Math.min(Math.abs(p.v), 8 * dt);
      p.v = PT.clamp(p.v, -3, vmax);
      p.boost -= dt; p.jump = Math.max(0, p.jump - dt);
      if (st.ramps.some(r => Math.abs(r.x - p.x) < 1 && Math.abs(r.z - p.z) < 0.8) && p.boost <= 0) { p.boost = 0.9; p.jump = 0.6; p.v = Math.max(p.v, c.vmax); MG.fx(st, 'whoosh'); }
      p.x += Math.cos(p.h) * p.v * dt; p.z += Math.sin(p.h) * p.v * dt;
      let bump = false;
      if (p.x < PR) { p.x = PR; bump = true; } if (p.x > W - PR) { p.x = W - PR; bump = true; }
      if (p.z < PR) { p.z = PR; bump = true; } if (p.z > D - PR) { p.z = D - PR; bump = true; }
      for (const cr of st.crates) {
        const qx = PT.clamp(p.x, cr.x - cr.hw, cr.x + cr.hw), qz = PT.clamp(p.z, cr.z - cr.hd, cr.z + cr.hd), dx = p.x - qx, dz = p.z - qz, dd = Math.hypot(dx, dz);
        if (dd < PR) { if (dd > 1e-6) { p.x = qx + dx / dd * PR; p.z = qz + dz / dd * PR; } else p.x = cr.x + (p.x < cr.x ? -1 : 1) * (cr.hw + PR); bump = true; }
      }
      if (bump) { p.v *= 0.6; if (st.bumpCool <= 0 && Math.abs(p.v) > 2) { st.bumpCool = 0.5; MG.fx(st, 'pop'); } }
      for (let i = st.items.length - 1; i >= 0; i--) {
        const it = st.items[i];
        if (st.carry.length < c.cap && Math.hypot(it.x - p.x, it.z - p.z) < 1.0) { st.carry.push(it); st.items.splice(i, 1); MG.fx(st, 'click'); spawnItem(st); st.msg = (it.kind ? 'Kabeltrommel' : 'Mikrofon') + ' für Station ' + CNAME[it.col] + '!'; }
      }
      STATIONS.forEach((s, si) => {
        if (Math.hypot(s.x - p.x, s.z - p.z) > 2) return;
        const keep = st.carry.filter(it => it.col !== si), n = st.carry.length - keep.length;
        if (n) { st.done += n; st.carry = keep; MG.fx(st, 'coin'); st.fx.push({ recipe: { parts: [{ wave: 'triangle', f: 520, f2: 1040, t: 0, d: 0.2, v: 0.4 }] } }); st.msg = 'Geliefert! Noch ' + Math.max(0, c.need - st.done) + '.'; }
      });
      if (st.done >= c.need) MG.finish(st, true);
      else if (st.t >= c.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg;
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 50 * (1 - st.t / c.time) * 1.4, 50, 100)), detail: 'Alle ' + c.need + ' Lieferungen nach ' + st.t.toFixed(1) + ' s im Studio.' };
      return { won: false, score: Math.round(PT.clamp(45 * st.done / c.need, 0, 49)), detail: 'Nur ' + st.done + ' von ' + c.need + ' Lieferungen vor Feierabend.' };
    },
    bot(st, goal) {
      if (goal === 'lose') return st.ptr ? [{ type: 'pointer', phase: 'up', x: 0, y: 0 }] : [];
      const p = st.p; let tgt;
      if (st.carry.length && (st.carry.length >= st.cfg.cap || !st.items.length)) tgt = STATIONS[st.carry[0].col];
      else { let best = 1e9; st.items.forEach(it => { const dd = Math.hypot(it.x - p.x, it.z - p.z); if (dd < best) { best = dd; tgt = it; } }); }
      const path = bfs(st.g, cellOf(p.x, p.z), cellOf(tgt.x, tgt.z));
      let aim = { x: tgt.x, z: tgt.z };
      if (path && path.length > 1) {
        const pt = n => ({ x: n % W + 0.5, z: ((n / W) | 0) + 0.5 }), clear = q => { const L = Math.hypot(q.x - p.x, q.z - p.z); for (let s = 0; s <= L; s += 0.2) if (blockedAt(st, p.x + (q.x - p.x) * s / L, p.z + (q.z - p.z) * s / L, 0.62)) return false; return true; };
        aim = pt(path[1]);
        for (let i = path.length - 1; i > 1; i--) { const q = i === path.length - 1 ? { x: tgt.x, z: tgt.z } : pt(path[i]); if (clear(q)) { aim = q; break; } }
      }
      const s = toScreen(aim.x, 0, aim.z);
      return [{ type: 'pointer', phase: st.ptr ? 'move' : 'down', x: s.x, y: s.y }];
    },
    setup3d(three, st) {
      const T = three.THREE, scene = three.scene, cam = three.camera, h = { T, scene, objs: [] };
      const add = o => { scene.add(o); h.objs.push(o); return o; };
      const lam = c => new T.MeshLambertMaterial({ color: c });
      cam.fov = CAM.fov; cam.position.set(CAM.x, CAM.y, CAM.z); cam.lookAt(CAM.tx, CAM.ty, CAM.tz); cam.updateProjectionMatrix();
      scene.background = new T.Color('#0d1124');
      add(new T.HemisphereLight(0xffffff, 0x334466, 0.85));
      const dl = add(new T.DirectionalLight(0xffffff, 0.55)); dl.position.set(10, 30, 15);
      const ground = add(new T.Mesh(new T.PlaneGeometry(W, D), lam('#2a3350'))); ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, D / 2);
      const m4 = new T.Object3D();
      const inst = (geo, mat, list, fn) => { const m = add(new T.InstancedMesh(geo, mat, Math.max(1, list.length))); m.count = list.length; list.forEach((it, i) => { fn(it, m4); m4.updateMatrix(); m.setMatrixAt(i, m4.matrix); }); m.instanceMatrix.needsUpdate = true; return m; };
      const walls = [{ x: W / 2, z: -0.25, sx: W + 1, sz: 0.5 }, { x: W / 2, z: D + 0.25, sx: W + 1, sz: 0.5 }, { x: -0.25, z: D / 2, sx: 0.5, sz: D }, { x: W + 0.25, z: D / 2, sx: 0.5, sz: D }];
      inst(new T.BoxGeometry(1, 1, 1), lam('#4a5590'), walls, (w, o) => { o.position.set(w.x, 0.4, w.z); o.scale.set(w.sx, 0.8, w.sz); o.rotation.set(0, 0, 0); });
      inst(new T.BoxGeometry(1, 1, 1), lam('#b07a3a'), st.crates, (c, o) => { o.position.set(c.x, 0.6, c.z); o.scale.set(c.hw * 2, 1.2, c.hd * 2); });
      inst(new T.CylinderGeometry(1, 1, 0.06, 16), lam('#1b1b1b'), st.patches, (c, o) => { o.position.set(c.x, 0.03, c.z); o.scale.set(c.r, 1, c.r); });
      inst(new T.BoxGeometry(2, 0.3, 1.6), lam('#ffd23a'), st.ramps, (c, o) => { o.position.set(c.x, 0.15, c.z); o.scale.set(1, 1, 1); });
      const sm = inst(new T.CylinderGeometry(2, 2, 0.08, 24), lam('#ffffff'), STATIONS, (s, o) => { o.position.set(s.x, 0.04, s.z); });
      const pm = inst(new T.BoxGeometry(0.7, 2.6, 0.7), lam('#ffffff'), STATIONS, (s, o) => { o.position.set(s.x + (s.x < 18 ? -1.3 : 1.3), 1.3, s.z); });
      STATIONS.forEach((s, i) => { sm.setColorAt(i, new T.Color(COLS[i])); pm.setColorAt(i, new T.Color(COLS[i])); });
      sm.instanceColor.needsUpdate = true; pm.instanceColor.needsUpdate = true;
      h.mic = add(new T.InstancedMesh(new T.CylinderGeometry(0.22, 0.32, 0.9, 10), lam('#ffffff'), 8));
      h.drum = add(new T.InstancedMesh(new T.CylinderGeometry(0.45, 0.45, 0.35, 14), lam('#ffffff'), 8));
      h.player = add(new T.Group());
      const body = new T.Mesh(new T.BoxGeometry(1.3, 0.35, 0.6), lam('#ff9f1c')); body.position.y = 0.35;
      const pole = new T.Mesh(new T.BoxGeometry(0.15, 1.1, 0.15), lam('#cfd6ff')); pole.position.set(0.55, 0.9, 0);
      const head = new T.Mesh(new T.SphereGeometry(0.32, 12, 10), lam('#ffe0b8')); head.position.set(0, 1.4, 0);
      h.player.add(body, pole, head);
      h.col = new T.Color('#ffffff'); for (let i = 0; i < 8; i++) { h.mic.setColorAt(i, h.col); h.drum.setColorAt(i, h.col); }
      h.m4 = m4; h.t = 0;
      return h;
    },
    draw3d(h, st, dt) {
      h.t += dt || 0;
      const p = st.p, m4 = h.m4;
      h.player.position.set(p.x, Math.sin(Math.min(1, p.jump / 0.6) * Math.PI) * 0.8, p.z); h.player.rotation.y = -p.h;
      let nm = 0, nd = 0;
      const put = (it, x, y, z) => {
        const m = it.kind ? h.drum : h.mic, i = it.kind ? nd++ : nm++; if (i >= 8) return;
        m4.position.set(x, y, z); m4.rotation.set(0, h.t * 2, 0); m4.scale.set(1, 1, 1); m4.updateMatrix(); m.setMatrixAt(i, m4.matrix); m.setColorAt(i, h.col.set(COLS[it.col]));
      };
      st.items.forEach(it => put(it, it.x, 0.55 + Math.sin(h.t * 3 + it.x) * 0.12, it.z));
      st.carry.forEach((it, i) => put(it, p.x, 2.1 + i * 0.8 + h.player.position.y, p.z));
      [[h.mic, nm], [h.drum, nd]].forEach(([m, n]) => { m.count = Math.min(8, n); m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    },
    dispose3d(h) {
      h.objs.forEach(o => { h.scene.remove(o); o.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); }); });
      h.scene.background = null; h.objs.length = 0;
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = 'rgba(16,20,42,.78)'; g.fillRect(0, 0, 960, 58);
      g.font = '700 22px system-ui'; g.textAlign = 'left'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#fff';
      g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 18, 37);
      g.fillStyle = '#4be08a'; g.fillText('Geliefert: ' + st.done + ' / ' + c.need, 130, 37);
      g.fillStyle = '#fff'; g.fillText('Ladung:', 350, 37);
      for (let i = 0; i < c.cap; i++) { const it = st.carry[i]; g.fillStyle = it ? COLS[it.col] : '#2a3050'; g.fillRect(445 + i * 40, 16, 32, 30); if (it) { g.fillStyle = '#10142a'; g.font = '20px system-ui'; g.fillText(it.kind ? '🧵' : '🎤', 449 + i * 40, 39); g.font = '700 22px system-ui'; } }
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff'; g.font = '600 18px system-ui'; g.fillText(st.msg || 'Gegenstand holen → Station gleicher Farbe', 942, 37);
      g.textAlign = 'center'; g.font = '700 18px system-ui';
      STATIONS.forEach((s, i) => { const q = toScreen(s.x, 3, s.z); g.fillStyle = COLS[i]; g.fillText('Station ' + CNAME[i], PT.clamp(q.x, 80, 880), Math.max(80, q.y)); });
      if (st.carry.length) { const s = STATIONS[st.carry[0].col], q = toScreen(s.x, 0, s.z), pp = toScreen(st.p.x, 0, st.p.z); g.strokeStyle = COLS[st.carry[0].col]; g.lineWidth = 2; if (g.setLineDash) g.setLineDash([6, 8]); g.beginPath(); g.moveTo(pp.x, pp.y); g.lineTo(q.x, q.y); g.stroke(); if (g.setLineDash) g.setLineDash([]); }
      if (st.ptr) { const q = toScreen(st.ptr.x, 0, st.ptr.z); g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, 14, 0, 7); g.stroke(); }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);

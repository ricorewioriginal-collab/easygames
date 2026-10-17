/* Y01 Mikrofonfangen (3D): Mikros regnen in die Arena, hüpfen und rollen. Mit dem Fangkorb einsammeln,
   Goldmikros bringen extra, Feedback-Bomben lähmen kurz. Reihum gespielt: höchste Punktzahl gewinnt. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const W = 20, D = 12, G = 20, CR = 1.25, CY = 2.2;
  const CAM = { x: 10, y: 13, z: 19, tx: 10, ty: 0, tz: 5.2, fov: 45 };
  const CFG = [
    { time: 45, need: 12, miss: 8, every: 1.1, bomb: 0.1, roll: 1.5, life: 1.8, speed: 9 },
    { time: 45, need: 16, miss: 6, every: 0.9, bomb: 0.15, roll: 2.5, life: 1.6, speed: 9.5 },
    { time: 45, need: 20, miss: 5, every: 0.75, bomb: 0.2, roll: 3.5, life: 1.4, speed: 10 }
  ];
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
  function spawn(st) {
    const c = st.cfg, r = PT.rand(st), a = PT.rand(st) * Math.PI * 2, sp = PT.rand(st) * c.roll;
    st.objs.push({ x: 1.5 + PT.rand(st) * (W - 3), y: 9, z: 1.5 + PT.rand(st) * (D - 3), vx: Math.cos(a) * sp, vy: PT.rand(st) * 3, vz: Math.sin(a) * sp * 0.7, type: r < c.bomb ? 2 : r < c.bomb + 0.1 ? 1 : 0, ground: 0 });
  }
  const fallTime = o => { const h = o.y - CY; if (h <= 0) return 0; return (o.vy + Math.sqrt(o.vy * o.vy + 2 * G * h)) / G; };
  MG.define({
    id: 'Y01', group: 'party', name: 'Mikrofonfangen', icon: '🧺',
    short: 'Fang die herabregnenden Mikros mit dem Korb – aber Finger weg von Feedback-Bomben!',
    rules: [
      'Mikros fallen in die Arena, springen auf und rollen weiter. Fang sie mit dem Korb.',
      'Mikro = 1 Punkt, Goldmikro = 3 Punkte. Rote Feedback-Bombe = −2 und kurz gelähmt.',
      'Bleibt ein Mikro zu lange liegen, geht es kaputt. Zu viele kaputte Mikros = verloren.',
      'Erreiche die Zielpunktzahl vor Ablauf der Zeit. Mehrere Spieler: reihum, die meisten Punkte gewinnen.'
    ],
    controls: { key: 'Pfeile/WASD bewegen den Korb', touch: 'Finger halten: Korb läuft dorthin', pad: 'Stick/Steuerkreuz' },
    touch: ['left', 'right', 'up', 'down'],
    multi: { local: true, max: 4, mode: 'turns' },
    render: '3d',
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      return { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, pts: 0, caught: 0, miss: 0, stun: 0, next: 0.6,
        player: ((o.players || [])[o.turn | 0] || {}).name || '', p: { x: W / 2, z: D / 2 }, keys: { up: false, down: false, left: false, right: false }, ptr: null, objs: [], pops: [] };
    },
    input(st, a) {
      if (a.type === 'key' && st.keys[a.key] !== undefined) st.keys[a.key] = !!a.down;
      if (a.type === 'pointer') st.ptr = a.phase === 'up' ? null : toGround(a.x, a.y);
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, p = st.p, k = st.keys; st.t += dt; st.stun -= dt;
      st.next -= dt; if (st.next <= 0) { spawn(st); st.next = c.every * (0.7 + PT.rand(st) * 0.6); }
      if (st.stun <= 0) {
        let mx = (k.right ? 1 : 0) - (k.left ? 1 : 0), mz = (k.down ? 1 : 0) - (k.up ? 1 : 0), sp = c.speed;
        if (st.ptr) { mx = st.ptr.x - p.x; mz = st.ptr.z - p.z; sp = Math.min(c.speed, Math.hypot(mx, mz) * 8); }
        const l = Math.hypot(mx, mz); if (l > 1e-3) { p.x += mx / l * sp * dt; p.z += mz / l * sp * dt; }
        p.x = PT.clamp(p.x, 0.8, W - 0.8); p.z = PT.clamp(p.z, 0.8, D - 0.8);
      }
      for (let i = st.objs.length - 1; i >= 0; i--) {
        const o = st.objs[i];
        o.vy -= G * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
        if (o.y < 0.35) { o.y = 0.35; o.vy = Math.abs(o.vy) > 2 ? -o.vy * 0.55 : 0; if (o.vy) MG.fx(st, 'tick'); }
        if (o.x < 0.4 || o.x > W - 0.4) { o.vx = -o.vx * 0.8; o.x = PT.clamp(o.x, 0.4, W - 0.4); }
        if (o.z < 0.4 || o.z > D - 0.4) { o.vz = -o.vz * 0.8; o.z = PT.clamp(o.z, 0.4, D - 0.4); }
        if (o.y < 0.6) { o.ground += dt; o.vx *= 1 - 0.7 * dt; o.vz *= 1 - 0.7 * dt; }
        if (o.y < CY && Math.hypot(o.x - p.x, o.z - p.z) < CR) {
          st.objs.splice(i, 1);
          if (o.type === 2) { st.pts = Math.max(0, st.pts - 2); st.stun = 0.9; MG.fx(st, 'buzz'); st.pops.push({ x: o.x, z: o.z, s: '−2 Feedback!', t: st.t }); }
          else { const v = o.type ? 3 : 1; st.pts += v; st.caught++; MG.fx(st, o.type ? 'coin' : 'pop'); st.pops.push({ x: o.x, z: o.z, s: '+' + v, t: st.t }); }
          continue;
        }
        if (o.ground > c.life) { st.objs.splice(i, 1); if (o.type !== 2) { st.miss++; MG.fx(st, 'bad'); st.pops.push({ x: o.x, z: o.z, s: 'kaputt', t: st.t }); } }
      }
      if (st.pops.length > 6) st.pops.shift();
      if (st.pts >= c.need) MG.finish(st, true);
      else if (st.miss > c.miss || st.t >= c.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, who = st.player ? st.player + ': ' : '';
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 35 * (1 - st.t / c.time) + 15 * (1 - st.miss / (c.miss + 1)), 50, 100)), detail: who + st.pts + ' Punkte nach ' + st.t.toFixed(1) + ' s, ' + st.miss + ' Mikros kaputt.' };
      return { won: false, score: Math.round(PT.clamp(45 * st.pts / c.need, 0, 49)), detail: who + st.pts + ' von ' + c.need + ' Punkten' + (st.miss > c.miss ? ' – zu viele kaputte Mikros.' : ' – die Zeit war um.') };
    },
    bot(st, goal) {
      const p = st.p, c = st.cfg; let aim;
      if (goal === 'lose') aim = { x: 0.8, z: 0.8 };
      else {
        let best = 1e9;
        st.objs.forEach(o => {
          if (o.type === 2) return;
          const tf = fallTime(o), x = PT.clamp(o.x + o.vx * tf, 0.8, W - 0.8), z = PT.clamp(o.z + o.vz * tf, 0.8, D - 0.8);
          const reach = Math.max(0, Math.hypot(x - p.x, z - p.z) - CR * 0.6) / c.speed, left = tf + (o.y < 0.6 ? c.life - o.ground : c.life * 0.8);
          const cost = Math.max(reach, tf) - (o.type ? 0.4 : 0);
          if (reach < left && cost < best) { best = cost; aim = { x: o.y < CY ? o.x : x, z: o.y < CY ? o.z : z }; }
        });
        aim = aim || { x: W / 2, z: D / 2 };
        st.objs.forEach(o => { // Bomben ausweichen
          if (o.type !== 2 || o.y > 4) return;
          const dx = p.x - o.x, dz = p.z - o.z, dd = Math.hypot(dx, dz);
          if (dd < CR + 1.2) { aim = { x: p.x + dx / (dd + 1e-3) * 3, z: p.z + dz / (dd + 1e-3) * 3 }; }
        });
      }
      const s = toScreen(aim.x, 0, aim.z);
      return [{ type: 'pointer', phase: st.ptr ? 'move' : 'down', x: s.x, y: s.y }];
    },
    setup3d(three, st) {
      const T = three.THREE, scene = three.scene, cam = three.camera, h = { T, scene, objs: [] };
      const add = o => { scene.add(o); h.objs.push(o); return o; }, lam = c => new T.MeshLambertMaterial({ color: c });
      cam.fov = CAM.fov; cam.position.set(CAM.x, CAM.y, CAM.z); cam.lookAt(CAM.tx, CAM.ty, CAM.tz); cam.updateProjectionMatrix();
      scene.background = new T.Color('#140f2a');
      add(new T.HemisphereLight(0xffffff, 0x442255, 0.85));
      const dl = add(new T.DirectionalLight(0xffeedd, 0.6)); dl.position.set(-5, 20, 10);
      const fl = add(new T.Mesh(new T.PlaneGeometry(W, D), lam('#3a2f5e'))); fl.rotation.x = -Math.PI / 2; fl.position.set(W / 2, 0, D / 2);
      const m4 = new T.Object3D(), walls = add(new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), lam('#ff4d9d'), 4));
      [[W / 2, -0.2, W + 0.8, 0.4], [W / 2, D + 0.2, W + 0.8, 0.4], [-0.2, D / 2, 0.4, D], [W + 0.2, D / 2, 0.4, D]].forEach((w, i) => { m4.position.set(w[0], 0.3, w[1]); m4.scale.set(w[2], 0.6, w[3]); m4.updateMatrix(); walls.setMatrixAt(i, m4.matrix); });
      h.head = add(new T.InstancedMesh(new T.SphereGeometry(0.32, 10, 8), lam('#ffffff'), 30));
      h.grip = add(new T.InstancedMesh(new T.CylinderGeometry(0.1, 0.14, 0.7, 8), lam('#333344'), 30));
      h.blob = add(new T.InstancedMesh(new T.CircleGeometry(0.4, 14), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }), 30));
      h.basket = add(new T.Mesh(new T.CylinderGeometry(1.2, 0.8, 0.8, 18, 1, true), new T.MeshLambertMaterial({ color: '#ffb02e', side: T.DoubleSide })));
      h.ring = add(new T.Mesh(new T.TorusGeometry(1.2, 0.08, 6, 24), lam('#6ef0ff'))); h.ring.rotation.x = Math.PI / 2;
      h.col = new T.Color('#ffffff'); for (let i = 0; i < 30; i++) h.head.setColorAt(i, h.col);
      h.m4 = m4; h.t = 0;
      return h;
    },
    draw3d(h, st, dt) {
      h.t += dt || 0;
      const m4 = h.m4, n = Math.min(30, st.objs.length), COL = ['#d8dcef', '#ffd23a', '#ff3355'];
      for (let i = 0; i < n; i++) {
        const o = st.objs[i];
        m4.rotation.set(0, 0, 0); m4.scale.set(1, 1, 1);
        m4.position.set(o.x, o.y + 0.3, o.z); m4.updateMatrix(); h.head.setMatrixAt(i, m4.matrix); h.head.setColorAt(i, h.col.set(COL[o.type]));
        m4.position.set(o.x, o.y - 0.1, o.z); m4.rotation.set(0.4, h.t * 3 + i, 0.3); m4.updateMatrix(); h.grip.setMatrixAt(i, m4.matrix);
        const sc = PT.clamp(1.4 - o.y / 10, 0.4, 1.4); m4.rotation.set(-Math.PI / 2, 0, 0); m4.scale.set(sc, sc, sc); m4.position.set(o.x, 0.02, o.z); m4.updateMatrix(); h.blob.setMatrixAt(i, m4.matrix);
      }
      [h.head, h.grip, h.blob].forEach(m => { m.count = n; m.instanceMatrix.needsUpdate = true; });
      if (h.head.instanceColor) h.head.instanceColor.needsUpdate = true;
      const stun = st.stun > 0, wob = stun ? Math.sin(h.t * 40) * 0.15 : 0;
      h.basket.position.set(st.p.x + wob, 0.45, st.p.z); h.ring.position.set(st.p.x + wob, 0.85, st.p.z);
      h.basket.material.color.set(stun ? '#ff4d6d' : '#ffb02e');
    },
    dispose3d(h) {
      h.objs.forEach(o => { h.scene.remove(o); if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      h.scene.background = null; h.objs.length = 0;
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = 'rgba(16,20,42,.78)'; g.fillRect(0, 0, 960, 56);
      g.font = '700 22px system-ui'; g.textAlign = 'left'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#fff';
      g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 18, 36);
      g.fillStyle = '#4be08a'; g.fillText('Punkte: ' + st.pts + ' / ' + c.need, 130, 36);
      g.fillStyle = st.miss >= c.miss ? '#ff4d6d' : '#ffc84a'; g.fillText('Kaputt: ' + st.miss + ' / ' + c.miss, 360, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff'; g.fillText(st.player ? '🎤 ' + st.player + ' ist dran' : 'Gold = 3 · Rot meiden!', 942, 36);
      g.textAlign = 'center';
      st.pops.forEach(q => { const age = st.t - q.t; if (age > 1) return; const s = toScreen(q.x, 2 + age * 2, q.z); g.globalAlpha = 1 - age; g.fillStyle = q.s[0] === '+' ? '#4be08a' : '#ff4d6d'; g.font = '700 26px system-ui'; g.fillText(q.s, s.x, s.y); });
      g.globalAlpha = 1;
      if (st.stun > 0) { g.fillStyle = '#ff4d6d'; g.font = '700 28px system-ui'; g.fillText('Bzzzt! Feedback!', 480, 100); }
      if (st.ptr) { const s = toScreen(st.ptr.x, 0, st.ptr.z); g.strokeStyle = '#ffb02e'; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, 14, 0, 7); g.stroke(); }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);

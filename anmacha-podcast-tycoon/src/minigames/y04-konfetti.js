/* Y04 Konfetti-Chaos (3D): In der Partyhalle tauchen Podeste auf, die eine Konfettifarbe verlangen. Kanone drehen,
   Weite einstellen, Farbe wählen, feuern – bevor das Zeitfenster schließt. Profi: Wind verweht die Ladung. */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const CAM = { x: 0, y: 11, z: 28, tx: 0, ty: 0, tz: 10, fov: 50 };
  const CX = 0, CZ = 19, FLY = 0.75, COOL = 0.55, NP = 480;
  const COLS = ['#ff4d6d', '#ffd23a', '#4d8dff', '#4be08a'], CNAME = ['Rot', 'Gelb', 'Blau', 'Grün'];
  const CFG = [
    { time: 55, need: 8, errs: 5, every: 2.6, life: 8, r: 2.0, move: 0, wind: 0 },
    { time: 55, need: 10, errs: 4, every: 2.2, life: 6.5, r: 1.6, move: 1.2, wind: 0 },
    { time: 55, need: 12, errs: 3, every: 2.0, life: 5.5, r: 1.35, move: 1.4, wind: 2.6 }
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
  const aimPt = st => ({ x: CX + Math.sin(st.yaw) * st.dist, z: CZ - Math.cos(st.yaw) * st.dist });
  const reach = (x, z) => Math.abs(Math.atan2(x - CX, CZ - z)) < 0.72 && Math.hypot(x - CX, z - CZ) > 5 && Math.hypot(x - CX, z - CZ) < 17;
  function spawn(st) {
    const c = st.cfg;
    for (let k = 0; k < 60; k++) {
      const x = PT.randInt(st, -90, 90) / 10, z = PT.randInt(st, 25, 135) / 10;
      if (!reach(x, z) || st.tg.some(t => Math.hypot(t.x - x, t.z - z) < 5.5)) continue;
      st.tg.push({ id: ++st.nid, x, z, col: PT.randInt(st, 0, 3), r: c.r, left: c.life, vx: c.move ? (PT.rand(st) < 0.5 ? -1 : 1) * c.move * (0.6 + PT.rand(st) * 0.4) : 0 });
      MG.fx(st, 'pop'); return;
    }
  }
  function fire(st) {
    if (st.cool > 0 || st.status !== 'playing') return;
    const a = aimPt(st);
    st.shots.push({ x0: CX, z0: CZ, x1: a.x + st.wind * FLY, z1: a.z, col: st.col, t: 0 });
    st.cool = COOL; MG.fx(st, 'whoosh');
    st.fx.push({ recipe: { parts: [{ wave: 'noise', f: 800, t: 0, d: 0.15, v: 0.5, filter: { type: 'lowpass', f: 900, q: 1 } }, { wave: 'sine', f: 180, f2: 60, t: 0, d: 0.15, v: 0.5 }] } });
  }
  MG.define({
    id: 'Y04', group: 'party', name: 'Konfetti-Chaos', icon: '🎊',
    short: 'Schieß Konfetti in der richtigen Farbe auf die Party-Podeste, bevor ihr Zeitfenster schließt.',
    rules: [
      'Jedes Podest verlangt eine Farbe. Wähle die Farbe, ziele mit der Kanone und feuere.',
      'Richtige Farbe = Treffer. Falsche Farbe oder ein Podest, das unbeschossen verschwindet, ist eine Panne.',
      'Standard: Podeste fahren hin und her. Profi: Wind verweht das Konfetti – vorhalten!',
      'Genug Treffer vor Ablauf der Zeit = gewonnen. Zu viele Pannen = verloren.'
    ],
    goal: d => 'Triff ' + CFG[d].need + ' Podeste mit Konfetti in ihrer Farbe – in ' + CFG[d].time + ' s, höchstens ' + CFG[d].errs + ' Pannen.',
    how: [
      'Auf dem Boden tauchen farbige Podeste auf. Über jedem steht, welche Farbe es will, und ein Zeitbalken.',
      'Wähle unten die passende Farbe (Rot, Gelb, Blau, Grün).',
      'Dann tippe auf das Podest: Die Kanone zielt dorthin und schießt.',
      'Falsche Farbe oder ein Podest, das leer ausgeht, ist eine Panne.' + ' Profi: Wind (oben rechts) verweht das Konfetti – etwas vorhalten.'
    ],
    tip: { key: '1–4 Farbe wählen, ←/→ ↑/↓ zielen, Leertaste feuern', touch: 'Erst unten die Farbe wählen, dann das Podest antippen', y: 300 },
    controls: { key: '←/→ drehen, ↑/↓ Weite, 1–4 Farbe (Q wechselt), Leertaste feuern', touch: 'Farbe unten antippen, dann Podest antippen = zielen und feuern', mouse: 'Farbe unten anklicken, dann Podest anklicken = zielen und feuern', pad: 'Steuerkreuz zielen, B Farbe, A feuern' },
    touch: ['left', 'right', 'up', 'down', 'a', 'b'],
    multi: { local: true, max: 4, mode: 'turns' },
    render: '3d',
    init(o) {
      const d = o.difficulty | 0, c = CFG[d];
      return { status: 'playing', seed: (o.seed >>> 0) || 1, fx: [], diff: d, cfg: c, t: 0, hits: 0, errs: 0, col: 0, yaw: 0, dist: 10, cool: 0, wind: 0, windT: 0,
        player: (o.players || []).length > 1 ? ((o.players[o.turn | 0] || {}).name || '') : '', hold: { left: 0, right: 0, up: 0, down: 0 }, tg: [], shots: [], bursts: [], nid: 0, bid: 0, next: 0.8, msg: '' };
    },
    input(st, a) {
      if (st.status !== 'playing') return;
      if (a.type === 'key') {
        if (st.hold[a.key] !== undefined) st.hold[a.key] = a.down ? 1 : 0;
        else if (a.down && a.key === 'a') fire(st);
        else if (a.down && a.key === 'b') { st.col = (st.col + 1) % 4; MG.fx(st, 'click'); }
        else if (a.down && /^[1-4]$/.test(a.key)) { st.col = +a.key - 1; MG.fx(st, 'click'); }
      }
      if (a.type === 'pointer' && a.phase === 'down') {
        if (a.y >= 486 && a.x >= 300 && a.x < 660) { st.col = Math.floor((a.x - 300) / 90); MG.fx(st, 'click'); return; }
        const p = toGround(a.x, a.y);
        st.yaw = PT.clamp(Math.atan2(p.x - CX, CZ - p.z), -1, 1); st.dist = PT.clamp(Math.hypot(p.x - CX, p.z - CZ), 3, 19);
        fire(st);
      }
    },
    update(st, dt) {
      if (st.status !== 'playing') return;
      const c = st.cfg, h = st.hold; st.t += dt; st.cool -= dt;
      st.yaw = PT.clamp(st.yaw + (h.right - h.left) * 0.9 * dt, -1, 1); st.dist = PT.clamp(st.dist + (h.up - h.down) * 7 * dt, 3, 19);
      if (c.wind) { st.windT -= dt; if (st.windT <= 0) { st.wind = PT.round((PT.rand(st) * 2 - 1) * c.wind, 1); st.windT = 7 + PT.rand(st) * 3; } }
      st.next -= dt; if (st.next <= 0) { if (st.tg.length < 3) spawn(st); st.next = c.every * (0.8 + PT.rand(st) * 0.4); }
      for (let i = st.tg.length - 1; i >= 0; i--) {
        const t = st.tg[i]; t.left -= dt; t.x += t.vx * dt;
        if (t.vx && !reach(t.x, t.z)) { t.vx = -t.vx; t.x += t.vx * dt * 2; }
        if (t.left <= 0) { st.tg.splice(i, 1); st.errs++; st.msg = 'Podest ' + CNAME[t.col] + ' ging leer aus!'; MG.fx(st, 'bad'); }
      }
      for (let i = st.shots.length - 1; i >= 0; i--) {
        const s = st.shots[i]; s.t += dt; if (s.t < FLY) continue;
        st.shots.splice(i, 1);
        st.bursts.push({ id: ++st.bid, x: s.x1, z: s.z1, col: s.col }); if (st.bursts.length > 6) st.bursts.shift();
        const t = st.tg.find(q => Math.hypot(q.x - s.x1, q.z - s.z1) <= q.r);
        if (!t) { st.msg = 'Daneben – Konfetti auf dem Hallenboden.'; MG.fx(st, 'tick'); }
        else if (t.col === s.col) { st.hits++; st.tg.splice(st.tg.indexOf(t), 1); st.msg = 'Treffer! ' + CNAME[t.col] + ' jubelt.'; MG.fx(st, 'coin'); st.fx.push({ recipe: { parts: [{ wave: 'noise', f: 4000, t: 0, d: 0.35, v: 0.3, filter: { type: 'highpass', f: 3000, q: 1 } }] } }); }
        else { st.errs++; st.msg = 'Falsche Farbe! ' + CNAME[t.col] + ' wollte kein ' + CNAME[s.col] + '.'; MG.fx(st, 'buzz'); }
      }
      if (st.hits >= c.need) MG.finish(st, true);
      else if (st.errs > c.errs || st.t >= c.time) MG.finish(st, false);
    },
    result(st) {
      const c = st.cfg, who = st.player ? st.player + ': ' : '';
      if (st.status === 'won') return { won: true, score: Math.round(PT.clamp(50 + 35 * (1 - st.t / c.time) + 15 * (1 - st.errs / (c.errs + 1)), 50, 100)), detail: who + st.hits + ' Treffer in ' + st.t.toFixed(1) + ' s, ' + st.errs + ' Pannen.' };
      return { won: false, score: Math.round(PT.clamp(45 * st.hits / c.need, 0, 49)), detail: who + 'nur ' + st.hits + ' von ' + c.need + ' Treffern' + (st.errs > c.errs ? ' – zu viele Pannen (' + st.errs + ', erlaubt ' + c.errs + ').' : ' – die Zeit war um.') };
    },
    bot(st, goal) {
      if (goal === 'lose') return [];
      const busy = t => st.shots.some(s => { const px = t.x + t.vx * (FLY - s.t); return Math.hypot(px - s.x1, t.z - s.z1) < t.r; });
      const t = st.tg.filter(q => !busy(q) && q.left > FLY + 0.1).sort((a, b) => a.left - b.left)[0];
      if (!t) return [];
      if (st.col !== t.col) return [{ type: 'key', key: String(t.col + 1), down: true }];
      if (st.cool > 0) return [];
      let px = t.x, vx = t.vx; for (let k = 0; k < 45; k++) { px += vx / 60; if (vx && !reach(px, t.z)) { vx = -vx; px += vx / 30; } }
      const s = toScreen(px - st.wind * FLY, 0, t.z);
      return [{ type: 'pointer', phase: 'down', x: s.x, y: s.y }, { type: 'pointer', phase: 'up', x: s.x, y: s.y }];
    },
    setup3d(three, st) {
      const T = three.THREE, scene = three.scene, cam = three.camera, h = { T, scene, objs: [], rnd: PT.rng(st.seed ^ 0x5eed) };
      const add = o => { scene.add(o); h.objs.push(o); return o; }, lam = c => new T.MeshLambertMaterial({ color: c });
      cam.fov = CAM.fov; cam.position.set(CAM.x, CAM.y, CAM.z); cam.lookAt(CAM.tx, CAM.ty, CAM.tz); cam.updateProjectionMatrix();
      scene.background = new T.Color('#120d26');
      add(new T.HemisphereLight(0xffffff, 0x3a2050, 0.85));
      const dl = add(new T.DirectionalLight(0xffffff, 0.55)); dl.position.set(6, 20, 20);
      const fl = add(new T.Mesh(new T.PlaneGeometry(30, 26), lam('#2d2550'))); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, 11);
      const wall = add(new T.Mesh(new T.PlaneGeometry(30, 10), lam('#3d2a66'))); wall.position.set(0, 5, -2);
      h.cannon = add(new T.Group()); h.cannon.position.set(CX, 0, CZ);
      const base = new T.Mesh(new T.CylinderGeometry(0.9, 1.1, 0.6, 16), lam('#4a5590')); base.position.y = 0.3;
      h.barrel = new T.Mesh(new T.CylinderGeometry(0.35, 0.45, 2.2, 12), lam('#ffffff')); h.barrel.position.set(0, 1.2, -0.6); h.barrel.rotation.x = -0.8;
      h.cannon.add(base, h.barrel);
      h.marker = add(new T.Mesh(new T.RingGeometry(0.5, 0.75, 24), new T.MeshBasicMaterial({ color: 0xffb02e, side: T.DoubleSide }))); h.marker.rotation.x = -Math.PI / 2;
      h.pod = add(new T.InstancedMesh(new T.CylinderGeometry(1, 1, 0.5, 20), lam('#ffffff'), 4));
      h.shot = add(new T.InstancedMesh(new T.SphereGeometry(0.35, 10, 8), lam('#ffffff'), 8));
      const geo = new T.BufferGeometry(); h.pos = new Float32Array(NP * 3); h.colA = new Float32Array(NP * 3); h.vel = new Float32Array(NP * 3); h.life = new Float32Array(NP);
      for (let i = 0; i < NP; i++) h.pos[i * 3 + 1] = -50;
      geo.setAttribute('position', new T.BufferAttribute(h.pos, 3)); geo.setAttribute('color', new T.BufferAttribute(h.colA, 3));
      h.pts = add(new T.Points(geo, new T.PointsMaterial({ size: 0.28, vertexColors: true })));
      h.col = new T.Color('#ffffff'); for (let i = 0; i < 8; i++) { h.shot.setColorAt(i, h.col); if (i < 4) h.pod.setColorAt(i, h.col); }
      h.m4 = new T.Object3D(); h.lastB = st.bid; h.pi = 0;
      return h;
    },
    draw3d(h, st, dt) {
      dt = Math.min(dt || 0, 0.05);
      const m4 = h.m4, a = aimPt(st);
      h.cannon.rotation.y = -st.yaw; h.barrel.material.color.set(COLS[st.col]);
      h.marker.position.set(a.x, 0.03, a.z); h.marker.visible = st.status === 'playing';
      st.tg.forEach((t, i) => { if (i > 3) return; m4.position.set(t.x, 0.25, t.z); m4.rotation.set(0, 0, 0); m4.scale.set(t.r, 1, t.r); m4.updateMatrix(); h.pod.setMatrixAt(i, m4.matrix); h.pod.setColorAt(i, h.col.set(COLS[t.col])); });
      h.pod.count = Math.min(4, st.tg.length); h.pod.instanceMatrix.needsUpdate = true; if (h.pod.instanceColor) h.pod.instanceColor.needsUpdate = true;
      st.shots.forEach((s, i) => { if (i > 7) return; const q = s.t / FLY; m4.position.set(PT.lerp(s.x0, s.x1, q), 1.5 + Math.sin(q * Math.PI) * 5 * (1 - q * 0.3), PT.lerp(s.z0, s.z1, q)); m4.scale.set(1, 1, 1); m4.updateMatrix(); h.shot.setMatrixAt(i, m4.matrix); h.shot.setColorAt(i, h.col.set(COLS[s.col])); });
      h.shot.count = Math.min(8, st.shots.length); h.shot.instanceMatrix.needsUpdate = true; if (h.shot.instanceColor) h.shot.instanceColor.needsUpdate = true;
      st.bursts.forEach(b => {
        if (b.id <= h.lastB) return; h.lastB = b.id; h.col.set(COLS[b.col]);
        for (let k = 0; k < 90; k++) {
          const i = h.pi = (h.pi + 1) % NP, r = h.rnd, ang = r() * Math.PI * 2, sp = 1 + r() * 4;
          h.pos[i * 3] = b.x; h.pos[i * 3 + 1] = 0.6; h.pos[i * 3 + 2] = b.z;
          h.vel[i * 3] = Math.cos(ang) * sp; h.vel[i * 3 + 1] = 4 + r() * 6; h.vel[i * 3 + 2] = Math.sin(ang) * sp; h.life[i] = 2 + r();
          const w = 0.75 + r() * 0.25; h.colA[i * 3] = h.col.r * w; h.colA[i * 3 + 1] = h.col.g * w; h.colA[i * 3 + 2] = h.col.b * w;
        }
        h.pts.geometry.attributes.color.needsUpdate = true;
      });
      for (let i = 0; i < NP; i++) {
        if (h.life[i] <= 0) continue;
        h.life[i] -= dt; const j = i * 3;
        h.vel[j + 1] -= 6 * dt; h.vel[j] *= 1 - 1.5 * dt; h.vel[j + 2] *= 1 - 1.5 * dt; if (h.vel[j + 1] < -1.5) h.vel[j + 1] = -1.5;
        h.pos[j] += (h.vel[j] + st.wind * 0.5) * dt; h.pos[j + 1] = Math.max(0.03, h.pos[j + 1] + h.vel[j + 1] * dt); h.pos[j + 2] += h.vel[j + 2] * dt;
        if (h.life[i] <= 0) h.pos[j + 1] = -50;
      }
      h.pts.geometry.attributes.position.needsUpdate = true;
    },
    dispose3d(h) {
      h.objs.forEach(o => { h.scene.remove(o); o.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); }); });
      h.scene.background = null; h.objs.length = 0;
    },
    draw2d(g, st) {
      const c = st.cfg;
      g.fillStyle = 'rgba(16,20,42,.8)'; g.fillRect(0, 0, 960, 56);
      g.font = '700 22px system-ui'; g.textAlign = 'left'; g.fillStyle = c.time - st.t < 10 ? '#ff4d6d' : '#fff';
      g.fillText('⏱ ' + Math.ceil(Math.max(0, c.time - st.t)) + ' s', 18, 36);
      g.fillStyle = '#4be08a'; g.fillText('Treffer: ' + st.hits + ' von ' + c.need, 130, 36);
      g.fillStyle = st.errs >= c.errs ? '#ff4d6d' : '#ffc84a'; g.fillText('Pannen: ' + st.errs + ' von max. ' + c.errs, 340, 36);
      g.textAlign = 'right'; g.fillStyle = '#cfd6ff';
      g.fillText(c.wind ? 'Wind ' + (st.wind < 0 ? '◀ ' : '▶ ') + Math.abs(st.wind).toFixed(1) : (st.player ? '🎊 ' + st.player : 'Farbe wählen → Podest antippen'), 900, 36);
      g.textAlign = 'center'; g.font = '700 18px system-ui';
      st.tg.forEach(t => {
        const s = toScreen(t.x, 1.4, t.z), w = 70;
        g.fillStyle = '#10142acc'; g.fillRect(s.x - w / 2 - 4, s.y - 36, w + 8, 34);
        g.fillStyle = COLS[t.col]; g.fillText(CNAME[t.col] + (t.col === st.col ? ' ✓' : ''), s.x, s.y - 20);
        g.fillStyle = '#2a3050'; g.fillRect(s.x - w / 2, s.y - 12, w, 6); g.fillStyle = t.left < 2 ? '#ff4d6d' : '#4be08a'; g.fillRect(s.x - w / 2, s.y - 12, w * PT.clamp(t.left / c.life, 0, 1), 6);
      });
      g.font = '600 18px system-ui'; g.fillStyle = '#fff'; g.fillText(st.msg, 480, 82);
      g.fillStyle = '#ffffff'; g.textAlign = 'right'; g.fillText('Farbe:', 294, 518); g.textAlign = 'center';
      for (let i = 0; i < 4; i++) {
        const x = 300 + i * 90; g.fillStyle = COLS[i]; g.fillRect(x + 6, 492, 78, 40);
        g.fillStyle = '#10142a'; g.font = '700 18px system-ui'; g.fillText((i + 1) + ' ' + CNAME[i], x + 45, 518);
        if (i === st.col) { g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(x + 2, 488, 86, 48); }
      }
      if (st.cool > 0) { g.fillStyle = '#ffb02e'; g.fillRect(300, 482, 360 * (1 - st.cool / COOL), 4); }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);

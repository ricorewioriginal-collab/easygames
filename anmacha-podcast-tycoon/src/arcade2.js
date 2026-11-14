/* AnMaCha – Der Podcast: Arcade, Teil 2 – fünf weitere 3D-Minispiele nach bekannten Spiel-Genres.
   - Mikro-Bowling (Bowling), Funkhaus-Korbjagd (Basketball-Automat), Gisela-Grand-Prix (Kart-Rennen),
     Sendemast-Stapler (Stapel-Turm), Elfmeter-Duell (Elfmeterschießen).
   Jedes Spiel steht im Arcade-Menü UND an einem Ort in der Welt (Station 'arc:<id>', siehe worlds.js).
   Ein Bedienkonzept: Tippen / Leertaste / Ⓐ für Timing, Kart lenkt mit Stick, Pfeilen oder linker/rechter Bildschirmhälfte. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data;
  const AR = AMC.Arcade; if (!AR || !AR.IMPL) return;
  const K = AR.kit, M = K.M;
  let T = null;
  const go = r => I.hit('jump') || I.hit('ok') || I.hit('act') || r.tap;
  const tapWord = () => I.device === 'touch' ? 'Tippen' : I.device === 'pad' ? AMC.glyph('a') : 'Leertaste';
  const osc = (t, sp) => (Math.sin(t * sp) + 1) / 2;   // 0…1 hin und her
  function hall(r, top, bot, floor, size) {
    T = root.THREE;
    r.sc.background = K.skyTex(top, bot); r.sc.fog = new T.Fog(new T.Color(bot), 30, 90);
    const f = W.box(size || 80, 0.2, size || 80, M(floor || 0x2a2d38, { r: 0.9 }), 0, -0.1, size ? 0 : -20, r.g, false); f.receiveShadow = true;
  }
  function bar(g, x, y, z) {   // senkrechter Kraftbalken mit grüner Zone
    const b = new T.Group(); b.position.set(x, y, z); g.add(b);
    W.box(0.34, 2.04, 0.08, M(0x14161f), 0, 1, 0, b, false);
    const zone = W.box(0.36, 0.3, 0.09, M(0x6cff8a, { e: 0x2a8a3a, ei: 0.6 }), 0, 1, 0.01, b, false);
    const fill = W.box(0.26, 2, 0.1, M(0xff8a1e, { e: 0xff8a1e, ei: 0.8 }), 0, 0, 0.02, b, false); fill.geometry.translate(0, 1, 0);
    b.userData = { zone, fill }; return b;
  }
  const setBar = (b, v, z0, z1) => { b.userData.fill.scale.y = Math.max(0.02, v); if (z0 != null) { b.userData.zone.scale.y = (z1 - z0) * 2 / 0.3; b.userData.zone.position.y = (z0 + z1); } };

  // ------------------------------------------------------------------ 1) Mikro-Bowling
  const BOWL = {
    title: '🎳 Mikro-Bowling', tapDown: true,
    help: () => tapWord() + ': 1× Richtung festlegen, 2× Kraft festlegen · 6 Würfe',
    intro: () => tapWord() + ' = Richtung festlegen',
    build(r) {
      hall(r, '#1a1030', '#5a2a6a', 0x1a1424);
      const g = r.g;
      const wood = W.canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#c89a5a'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(80,40,10,.18)'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 1, h); c.fillStyle = '#d8342c'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(12 + i * 10, 40); c.lineTo(17 + i * 10, 30); c.lineTo(22 + i * 10, 40); c.fill(); } }, [1, 4]);
      const lane = new T.Mesh(new T.BoxGeometry(2.4, 0.1, 24), new T.MeshStandardMaterial({ map: wood, roughness: 0.35, metalness: 0.05 })); lane.position.set(0, 0.05, -10); g.add(lane);
      [-1, 1].forEach(s => { W.box(0.4, 0.06, 24, M(0x111318), s * 1.4, 0.03, -10, g, false); W.box(0.12, 0.5, 24, M(0x3a2a5a), s * 1.66, 0.25, -10, g, false); });
      for (let i = 0; i < 6; i++) [-1, 1].forEach(s => { const l = W.box(0.14, 0.6, 0.6, M(0xff3da8, { e: 0xff3da8, ei: 1.2 }), s * 4, 2.4, -2 - i * 4, g, false); l.castShadow = false; });
      W.box(6, 3, 0.3, M(0x14101e), 0, 1.5, -22.4, g, false); K.logoBoard(g, 0, 1.8, -22.2);
      r.ball = new T.Mesh(new T.SphereGeometry(0.22, 20, 14), M(0xff8a1e, { r: 0.15, m: 0.3 })); g.add(r.ball);
      const pinG = new T.LatheGeometry([[0, 0], [0.07, 0], [0.09, 0.12], [0.06, 0.3], [0.045, 0.36], [0.07, 0.46], [0.05, 0.54], [0, 0.56]].map(p => new T.Vector2(p[0], p[1])), 12);
      r.pinM = M(0xf4f1ea, { r: 0.3 }); r.pins = [];
      for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) { const m = new T.Mesh(pinG, r.pinM); g.add(m); W.box(0.13, 0.04, 0.13, M(0xd8342c), 0, 0.33, 0, m, false); r.pins.push({ m, x0: (i - row / 2) * 0.42, z0: -18 - row * 0.4 }); }
      r.arrow = new T.Mesh(new T.ConeGeometry(0.16, 0.5, 10), M(0x3dd6ff, { e: 0x3dd6ff, ei: 1 })); r.arrow.rotation.x = -Math.PI / 2; g.add(r.arrow);
      r.bar = bar(g, 1.9, 0.2, -0.5);
      r.fig = K.addFig(r.host, g); if (r.fig) { r.fig.root.rotation.y = Math.PI; r.fig.play('idle'); }
      r.mate = K.addFig(r.other, g); if (r.mate) { r.mate.root.position.set(-2.4, 0, 1.2); r.mate.root.rotation.y = 2.6; r.mate.play('yes'); }
      r.throwN = 0; r.frames = []; BOWL.reset(r);
    },
    reset(r) {
      r.st = 'aim'; r.aim = 0; r.pow = 0; r.bx = 0; r.bz = 0; r.wait = 0; r.ph = Math.random() * 6;
      r.pins.forEach(p => { p.down = false; p.vx = p.vz = 0; p.x = p.x0; p.z = p.z0; p.m.position.set(p.x, 0.1, p.z); p.m.rotation.set(0, 0, 0); p.m.visible = true; });
      r.ball.position.set(0, 0.32, 0); r.ball.visible = true; r.arrow.visible = true; r.bar.visible = false;
    },
    score: r => U.fmt(r.score) + ' · Wurf ' + Math.min(6, r.throwN + 1) + '/6',
    update(r, dt) {
      const tap = go(r);
      if (r.phase === 'ready') { r.phase = 'play'; }
      if (r.phase !== 'play') return;
      if (r.st === 'aim') { r.aim = Math.sin((r.t + r.ph) * 2.2) * 0.95; r.arrow.position.set(r.aim, 0.25, -1.4); r.ball.position.x = 0; if (tap) { r.st = 'pow'; r.bar.visible = true; AMC.Audio.sfx('move'); } }
      else if (r.st === 'pow') { r.pow = osc(r.t, 3.4); setBar(r.bar, r.pow, 0.72, 1); if (tap) { r.st = 'roll'; r.arrow.visible = false; r.bar.visible = false; r.vz = 7 + r.pow * 9; r.hook = (Math.random() - 0.5) * 0.25 * (1.1 - r.pow); AMC.Audio.sfx('whoosh'); if (r.fig) r.fig.play('knock', { restart: true, fade: 0.05 }); } }
      else if (r.st === 'roll') {
        r.bz -= r.vz * dt; const k = -r.bz / 18; r.bx = r.aim * k + r.hook * k * k * 4; r.ball.position.set(r.bx, 0.32, r.bz); r.ball.rotation.x -= r.vz * dt * 4;
        if (Math.abs(r.bx) > 1.25) { r.bx = Math.sign(r.bx) * 1.42; r.ball.position.x = r.bx; r.ball.position.y = 0.18; }   // Rinne
        const inGutter = Math.abs(r.bx) > 1.3;
        if (!inGutter) r.pins.forEach(p => { if (!p.down && Math.abs(p.z - r.bz) < 0.3 && Math.abs(p.x - r.bx) < 0.36) BOWL.hit(r, p, (p.x - r.bx) * 6, -r.vz * 0.6); });
        if (r.bz < -21) { r.ball.visible = false; r.st = 'settle'; r.wait = 1.1; }
      } else if (r.st === 'settle') {
        if ((r.wait -= dt) <= 0) {
          const n = r.pins.filter(p => p.down).length, strike = n === 10; r.throwN++;
          r.score += n * 10 + (strike ? 50 : n >= 8 ? 15 : 0);
          AMC.Audio.sfx(strike ? 'win' : n >= 7 ? 'applause' : n ? 'ok' : 'miss');
          r.say(strike ? '🎳 STRIKE! Alle zehn Mikros liegen!' : n ? '🎳 ' + n + ' Pins umgeräumt!' : '🫣 Rinne … ' + D.HOSTS[r.other].name + ' schaut weg.');
          if (strike) W.particles.burst(0, 1, -18.6, 0xffd23f, 60, { speed: 7 });
          if (r.mate) r.mate.play(n >= 7 ? 'arms' : 'yes', { restart: true });
          if (r.throwN >= 6) { r.phase = 'win'; setTimeout(() => r.finish(), 1500); } else BOWL.reset(r);
        }
      }
      // fallende Pins
      r.pins.forEach(p => {
        if (!p.down) return; p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= 1 - dt * 2; p.vz *= 1 - dt * 2;
        p.m.position.set(p.x, 0.1, p.z); p.m.rotation.x = U.damp(p.m.rotation.x, -Math.PI / 2 * Math.sign(p.vz || -1), 10, dt); p.m.rotation.z = U.damp(p.m.rotation.z, p.side, 10, dt);
        if (Math.abs(p.x) > 1.6 || p.z < -22) p.m.visible = false;
        r.pins.forEach(q => { if (!q.down && Math.hypot(q.x - p.x, q.z - p.z) < 0.34 && Math.hypot(p.vx, p.vz) > 1.2) BOWL.hit(r, q, (q.x - p.x) * 5 + p.vx * 0.4, p.vz * 0.7); });
      });
      const cam = W.camera, follow = r.st === 'roll' || r.st === 'settle' ? Math.max(-12, r.bz * 0.6) : 0;
      cam.position.set(0, 2.4, K.camDist(4.2) + follow); cam.lookAt(0, 0.4, -14 + follow * 0.3);
    },
    hit(r, p, vx, vz) { p.down = true; p.vx = vx; p.vz = vz; p.side = U.clamp(vx * 0.5, -1.5, 1.5); AMC.Audio.sfx('dash'); W.particles.burst(p.x, 0.4, p.z, 0xffffff, 5, { speed: 2 }); },
    fan: s => Math.round(s / 3)
  };

  // ------------------------------------------------------------------ 2) Funkhaus-Korbjagd
  const HOOP = {
    title: '🏀 Funkhaus-Korbjagd', tapDown: true,
    help: () => tapWord() + ', wenn der Balken in der grünen Zone ist · 45 Sekunden',
    intro: () => tapWord() + ' = werfen',
    build(r) {
      hall(r, '#0f2a4a', '#3a7ab0', 0x3a2a20);
      const g = r.g;
      const court = W.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c87a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, 0, 90, 0, Math.PI); c.stroke(); c.strokeRect(w / 2 - 40, 0, 80, 110); });
      const cm = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ map: court, roughness: 0.5 })); cm.rotation.x = -Math.PI / 2; cm.position.set(0, 0.01, -3); g.add(cm);
      r.hoop = new T.Group(); g.add(r.hoop); r.hoop.position.set(0, 0, -6.5);
      W.box(1.8, 1.1, 0.06, M(0xffffff, { r: 0.4 }), 0, 3.5, -0.35, r.hoop, false); W.box(0.6, 0.45, 0.07, M(0xd8342c), 0, 3.3, -0.31, r.hoop, false);
      const ring = new T.Mesh(new T.TorusGeometry(0.3, 0.03, 8, 24), M(0xff5a1a, { m: 0.5, r: 0.3 })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 3.05, 0); r.hoop.add(ring);
      const net = new T.Mesh(new T.CylinderGeometry(0.3, 0.2, 0.45, 12, 1, true), new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true })); net.position.set(0, 2.8, 0); r.hoop.add(net);
      W.box(0.12, 3.5, 0.12, M(0x555a66), 0, 1.75, -0.6, r.hoop, false);
      K.logoBoard(g, -5, 3, -9, 0.3); K.logoBoard(g, 5, 3, -9, -0.3);
      r.ball = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), M(0xff7a1a, { r: 0.6 })); g.add(r.ball);
      r.bar = bar(g, 1.1, 0.3, 0.6);
      r.fig = K.addFig(r.host, g); if (r.fig) { r.fig.root.position.set(0, 0, 1.2); r.fig.root.rotation.y = Math.PI; r.fig.play('idle'); }
      r.mate = K.addFig(r.other, g); if (r.mate) { r.mate.root.position.set(-3, 0, -2); r.mate.root.rotation.y = 1.2; r.mate.play('yes'); }
      r.time = 45; r.combo = 1; r.shots = []; r.made = 0; HOOP.newBall(r);
    },
    newBall(r) { r.ball.position.set(0.3, 1.6, 0.9); r.ball.visible = true; r.fly = null; r.zw = Math.max(0.05, 0.12 - r.made * 0.004); r.zc = 0.55 + (Math.random() - 0.5) * 0.3; },
    score: r => U.fmt(r.score) + ' · ⏱ ' + Math.ceil(Math.max(0, r.time)) + ' s' + (r.combo > 1 ? ' · x' + r.combo : ''),
    update(r, dt) {
      const tap = go(r);
      if (r.phase === 'ready') { setBar(r.bar, osc(r.t, 2), r.zc - r.zw, r.zc + r.zw); if (tap) r.phase = 'play'; else return; }
      if (r.phase !== 'play') return;
      r.time -= dt;
      const hx = r.made >= 8 ? Math.sin(r.t * (0.8 + r.made * 0.03)) * 2.2 : 0; r.hoop.position.x = hx;
      if (!r.fly) {
        const v = osc(r.t, 2.6 + r.made * 0.06); setBar(r.bar, v, r.zc - r.zw, r.zc + r.zw);
        if (tap) {
          const ok = Math.abs(v - r.zc) <= r.zw, d = (v - r.zc) * 3;
          r.fly = { t: 0, dur: 0.75, x0: 0.3, y0: 1.6, z0: 0.9, x1: hx, y1: 3.05, z1: -6.5 + (ok ? 0 : d), ok: ok && true, perfect: Math.abs(v - r.zc) < r.zw * 0.35 };
          AMC.Audio.sfx('jump'); if (r.fig) r.fig.play('jump', { restart: true, fade: 0.05 });
        }
      } else {
        const f = r.fly; f.t += dt; const k = Math.min(1, f.t / f.dur);
        r.ball.position.set(f.x0 + (f.x1 - f.x0) * k, f.y0 + (f.y1 - f.y0) * k + Math.sin(k * Math.PI) * 2.2, f.z0 + (f.z1 - f.z0) * k); r.ball.rotation.x += dt * 10;
        if (k >= 1 && !f.done) {
          f.done = true;
          const inHoop = f.ok && Math.abs(r.hoop.position.x - f.x1) < 0.32;
          if (inHoop) { r.made++; const pts = (f.perfect ? 3 : 2) * r.combo; r.score += pts * 10; r.combo = Math.min(5, r.combo + 1); AMC.Audio.sfx(f.perfect ? 'perfect' : 'collect'); W.particles.burst(r.hoop.position.x, 2.9, -6.5, f.perfect ? 0xffd23f : 0xff8a1e, 26, { speed: 4 }); if (r.made % 5 === 0) r.say('🔥 ' + r.made + ' Körbe! ' + D.HOSTS[r.other].name + ': „On fire!“'); }
          else { r.combo = 1; AMC.Audio.sfx('miss'); if (r.mate) r.mate.play('arms', { restart: true }); }
          setTimeout(() => R0(r) && HOOP.newBall(r), 280);
        }
      }
      if (r.time <= 0) { r.phase = 'win'; r.say('⏱ Zeit! ' + r.made + ' Körbe.'); AMC.Audio.sfx('win'); setTimeout(() => r.finish(), 1400); }
      const cam = W.camera; cam.position.set(0.6, 2.6, K.camDist(4.6)); cam.lookAt(0, 2.4, -6);
    },
    fan: s => Math.round(s / 5)
  };
  const R0 = r => AR.state() === r;

  // ------------------------------------------------------------------ 3) Gisela-Grand-Prix (Kart)
  const A = 34, B = 20, WID = 8, LAPS = 3;
  const track = t => ({ x: Math.cos(t) * A, z: Math.sin(t) * B });
  const angOf = (x, z) => Math.atan2(z / B, x / A);
  function kartMesh(col, g) {
    const k = new T.Group();
    W.box(1.2, 0.35, 2.0, M(col, { r: 0.35, m: 0.3 }), 0, 0.42, 0, k);
    W.box(1.0, 0.12, 0.5, M(0x15171c), 0, 0.68, -0.85, k, false);
    W.box(1.3, 0.08, 0.3, M(col, { r: 0.35 }), 0, 0.8, -1.0, k, false);
    [[-0.62, 0.65], [0.62, 0.65], [-0.62, -0.65], [0.62, -0.65]].forEach(([x, z]) => { const w = W.cyl(0.26, 0.26, 0.24, M(0x16171a, { r: 0.85 }), x, 0.26, z, k, 12); w.rotation.z = Math.PI / 2; });
    g.add(k); return k;
  }
  const KART = {
    title: '🏎️ Gisela-Grand-Prix', steer: true,
    help: () => I.device === 'touch' ? 'Linke / rechte Bildschirmhälfte halten = lenken · Gas geht automatisch' : I.device === 'pad' ? 'Stick lenken · ' + AMC.glyph('b') + ' bremsen' : '◀ ▶ / A D lenken · ▼ bremsen',
    intro: () => tapWord() + ' = Start (3 Runden)',
    build(r) {
      hall(r, '#3a8be0', '#cfeeff', 0x3d6b35, 160);
      const g = r.g;
      // Strecke: Ring aus Asphalt mit Randsteinen
      const sh = new T.Shape(), hole = new T.Path(), N = 64;
      for (let i = 0; i <= N; i++) { const t = i / N * Math.PI * 2; const ox = Math.cos(t) * (A + WID / 2), oz = Math.sin(t) * (B + WID / 2); i ? sh.lineTo(ox, oz) : sh.moveTo(ox, oz); }
      for (let i = 0; i <= N; i++) { const t = -i / N * Math.PI * 2; const ix = Math.cos(t) * (A - WID / 2), iz = Math.sin(t) * (B - WID / 2); i ? hole.lineTo(ix, iz) : hole.moveTo(ix, iz); }
      sh.holes.push(hole);
      const rg = new T.ShapeGeometry(sh); rg.rotateX(Math.PI / 2); rg.scale(1, -1, 1); const road = new T.Mesh(rg, M(0x5a5f6a, { r: 0.8, side: T.DoubleSide })); road.position.y = 0.02; g.add(road);
      for (let i = 0; i < N; i++) { const t = i / N * Math.PI * 2; [WID / 2 + 0.3, -WID / 2 - 0.3].forEach(o => { const nx = Math.cos(t) / A, nz = Math.sin(t) / B, l = Math.hypot(nx, nz), p = track(t); W.box(0.6, 0.18, 0.6, M(i % 2 ? 0xd8342c : 0xffffff), p.x + nx / l * o, 0.09, p.z + nz / l * o, g, false); }); }
      // Start-Ziel, Boost-Felder, Tribüne
      const p0 = track(0); for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) W.box(WID / 8, 0.04, 0.6, M((i + j) % 2 ? 0x111111 : 0xffffff), p0.x - WID / 2 + WID / 16 + i * WID / 8, 0.04, p0.z - 0.3 + j * 0.6, g, false);
      r.pads = [Math.PI * 0.5, Math.PI * 1.0, Math.PI * 1.5].map(t => { const p = track(t), m = W.box(2.4, 0.05, 2.4, M(0x3dd6ff, { e: 0x3dd6ff, ei: 1.2 }), p.x, 0.05, p.z, g, false); return { t, x: p.x, z: p.z, m }; });
      W.box(30, 4, 3, M(0x5a6b8a), 0, 2, -B - 11, g, false); K.logoBoard(g, 0, 4, -B - 9.4);
      for (let i = 0; i < 14; i++) K.building(g, 6, 8 + (i % 4) * 4, 6).position.set(-48 + i * 7.4, 0, B + 22);
      // Karts: Spieler (Gisela-Farben) und drei Gegner
      r.karts = [{ me: true, col: 0x3aa7a0, name: D.HOSTS[r.host].name }, { col: 0xd8342c, name: 'Ralf Rauschmann', sk: 0.97 }, { col: 0xffd23f, name: 'Conny Glitzer', sk: 0.93 }, { col: 0xa46bff, name: D.HOSTS[r.other].name, sk: 0.9 }].map((k, i) => {
        const m = kartMesh(k.col, g), t0 = -0.06 - (i >> 1) * 0.07, lane = (i % 2 ? -1 : 1) * 1.5, p = track(t0);
        const o = Object.assign(k, { m, x: p.x + lane, z: p.z, h: 0, v: 0, t: t0, lap: -1, lane, boost: 0, done: false });
        if (!k.me) { const hd = new T.Mesh(new T.SphereGeometry(0.26, 12, 10), M(0xf4f4f4, { r: 0.25, m: 0.2 })); hd.position.set(0, 1.0, 0.1); m.add(hd); W.box(0.36, 0.12, 0.1, M(0x15171c, { r: 0.1, m: 0.5 }), 0, 1.02, 0.34, m, false); W.box(0.62, 0.3, 0.5, M(k.col), 0, 0.8, 0.15, m, false); }
        return o;
      });
      r.me = r.karts[0];
      r.fig = K.addFig(r.host, r.me.m); if (r.fig) { r.fig.root.position.set(0, 0.2, 0.2); r.fig.root.scale.setScalar(0.8); r.fig.play('crouch', { fade: 0 }); }
      r.karts.forEach(k => { k.h = Math.atan2(-Math.sin(k.t) * A, Math.cos(k.t) * B); });
      r.count = -1; r.time = 0;
    },
    score: r => r.phase === 'play' && r.count <= 0 ? 'Runde ' + U.clamp(r.me.lap + 1, 1, LAPS) + '/' + LAPS + ' · Platz ' + KART.place(r) + '/4' : U.fmt(r.score),
    hud: r => r.count > 0 ? String(Math.ceil(r.count)) : r.count > -0.8 && r.phase === 'play' ? 'LOS!' : r.phase === 'ready' ? KART.intro() : '',
    prog: k => k.lap * Math.PI * 2 + ((k.t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
    place: r => 1 + r.karts.filter(k => k !== r.me && (k.done && !r.me.done ? true : KART.prog(k) > KART.prog(r.me))).length,
    update(r, dt) {
      if (r.phase === 'ready') { if (go(r) || I.hit('left') || I.hit('right')) { r.phase = 'play'; r.count = 3; r.keepMsg = true; AMC.Audio.sfx('ok'); } }
      else if (r.phase === 'play') {
        if (r.count > 0) { const c0 = Math.ceil(r.count); r.count -= dt; if (Math.ceil(r.count) !== c0) AMC.Audio.sfx(r.count <= 0 ? 'horn' : 'move'); }
        else { r.count -= dt; r.time += dt; }
        const racing = r.count <= 0;
        r.karts.forEach(k => {
          if (racing && !k.done) {
            if (k.me) {
              const st = U.clamp(-(I.move.x || 0) - r.hold, -1, 1);
              const brake = (I.move.y || 0) > 0.5;
              k.h += st * dt * 2.1 * Math.min(1, k.v / 6);
              const off = KART.off(k), vmax = (k.boost > 0 ? 30 : 21) * (off ? 0.45 : 1);
              k.v = U.damp(k.v, brake ? 4 : vmax, brake ? 3 : 1.3, dt);
              if (off && Math.random() < dt * 10) W.particles.burst(k.x, 0.3, k.z, 0x6a8a4a, 2, { speed: 2 });
            } else {
              const ahead = track(k.t + 0.16), lx = Math.cos(k.t + 0.16) / A, lz = Math.sin(k.t + 0.16) / B, ll = Math.hypot(lx, lz);
              const tx = ahead.x + lx / ll * k.lane, tz = ahead.z + lz / ll * k.lane, want = Math.atan2(tx - k.x, tz - k.z);
              k.h += U.angDiff(k.h, want) * Math.min(1, dt * 4);
              const gap = KART.prog(r.me) - KART.prog(k), rubber = U.clamp(gap * 1.5, -2, 3);
              k.v = U.damp(k.v, (20.5 + rubber) * k.sk * (k.boost > 0 ? 1.35 : 1), 1.2, dt);
            }
            k.x += Math.sin(k.h) * k.v * dt; k.z += Math.cos(k.h) * k.v * dt;
            if (k.boost > 0) k.boost -= dt;
            r.pads.forEach(p => { if (Math.hypot(p.x - k.x, p.z - k.z) < 1.6 && k.boost <= 0) { k.boost = 1.1; if (k.me) { AMC.Audio.sfx('dash'); W.particles.burst(k.x, 0.6, k.z, 0x3dd6ff, 20, { speed: 5 }); } } });
            const na = angOf(k.x, k.z), prev = ((k.t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), cur = ((na % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (prev > Math.PI * 1.5 && cur < Math.PI * 0.5) { k.lap++; if (k.me && k.lap < LAPS) { AMC.Audio.sfx('collect'); r.say('🏁 Runde ' + (k.lap + 1) + '/' + LAPS + '!'); } }
            else if (prev < Math.PI * 0.5 && cur > Math.PI * 1.5) k.lap--;
            k.t = cur;
            if (k.lap >= LAPS) { k.done = true; k.place = r.karts.filter(o => o.done).length; if (k.me) KART.end(r); }
          } else if (k.done) { k.v = U.damp(k.v, 0, 1.5, dt); k.x += Math.sin(k.h) * k.v * dt; k.z += Math.cos(k.h) * k.v * dt; }
          k.m.position.set(k.x, 0, k.z); k.m.rotation.y = k.h; k.m.rotation.z = U.damp(k.m.rotation.z, 0, 6, dt);
        });
        // Rempeln
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const a = r.karts[i], b = r.karts[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d < 1.6 && d > 0.01) { const push = (1.6 - d) / 2; a.x -= dx / d * push; a.z -= dz / d * push; b.x += dx / d * push; b.z += dz / d * push; if ((a.me || b.me) && Math.random() < 0.2) AMC.Audio.sfx('dash'); } }
      }
      const k = r.me, cam = W.camera, back = K.camDist(6.5);
      const cx = k.x - Math.sin(k.h) * back, cz = k.z - Math.cos(k.h) * back;
      if (!r.cp) r.cp = new T.Vector3(cx, 3, cz); r.cp.lerp(new T.Vector3(cx, 3, cz), Math.min(1, dt * 5));
      cam.position.copy(r.cp); cam.lookAt(k.x + Math.sin(k.h) * 4, 0.8, k.z + Math.cos(k.h) * 4);
    },
    off: k => { const t = angOf(k.x, k.z), p = track(t); return Math.hypot(k.x - p.x, k.z - p.z) > WID / 2 + 0.2; },
    end(r) {
      const pl = r.me.place; r.score = [0, 1200, 800, 500, 300][pl] + Math.max(0, Math.round(600 - r.time * 6));
      r.phase = 'win'; r.keepMsg = false; AMC.Audio.sfx(pl === 1 ? 'win' : 'applause');
      r.say(pl === 1 ? '🏆 Platz 1! Gisela wäre stolz.' : '🏁 Platz ' + pl + ' – ' + U.pick(['Rauschmann hat geschummelt!', 'Nächstes Mal!', 'Fast!']));
      W.particles.burst(r.me.x, 2, r.me.z, 0xffd23f, 60, { speed: 7 });
      setTimeout(() => r.finish(), 2000);
    },
    fan: s => Math.round(s / 10)
  };

  // ------------------------------------------------------------------ 4) Sendemast-Stapler (Stapel-Turm)
  const STACK = {
    title: '🧱 Sendemast-Stapler', tapDown: true,
    help: () => tapWord() + ' = Block fallen lassen · genau treffen = PERFEKT',
    build(r) {
      hall(r, '#140f2a', '#ff7a5a', 0x1a1d28);
      const g = r.g;
      r.H = 0.45; r.blocks = []; r.falls = [];
      const base = W.box(3, 3, 3, M(0x2a2d38), 0, -1.5 + r.H, 0, g, false); base.userData = { w: 3, d: 3, x: 0, z: 0 };
      r.top = { w: 3, d: 3, x: 0, z: 0, y: r.H }; r.n = 0; r.perfectN = 0;
      for (let i = 0; i < 12; i++) K.building(g, 5, 10 + (i % 5) * 5, 5).position.set(Math.cos(i / 12 * 6.28) * 24, 0, Math.sin(i / 12 * 6.28) * 24 - 4);
      r.fig = K.addFig(r.host, g); if (r.fig) { r.fig.root.scale.setScalar(0.55); r.fig.root.position.set(0.9, r.H, 0.9); r.fig.play('idle'); }
      r.mate = K.addFig(r.other, g); if (r.mate) { r.mate.root.position.set(-3, 0, 3); r.mate.root.rotation.y = 0.8; r.mate.play('yes'); }
      STACK.spawn(r);
    },
    color: n => new T.Color().setHSL((0.08 + n * 0.035) % 1, 0.75, 0.55).getHex(),
    spawn(r) {
      const ax = r.n % 2 ? 'z' : 'x', t = r.top, m = W.box(t.w, r.H, t.d, M(STACK.color(r.n), { r: 0.4 }), 0, 0, 0, r.g, false);
      r.cur = { m, ax, w: t.w, d: t.d, x: ax === 'x' ? -4 : t.x, z: ax === 'z' ? -4 : t.z, y: t.y + r.H / 2, dir: 1, sp: Math.min(7.5, 3 + r.n * 0.16) };
    },
    score: r => U.fmt(r.n) + ' Etagen',
    update(r, dt) {
      const tap = go(r);
      if (r.phase === 'ready') { if (tap) r.phase = 'play'; return STACK.cam(r, dt); }
      const c = r.cur;
      if (r.phase === 'play' && c) {
        c[c.ax] += c.dir * c.sp * dt; if (Math.abs(c[c.ax] - r.top[c.ax]) > 5) c.dir *= -1;
        c.m.position.set(c.x, c.y, c.z);
        if (tap) STACK.drop(r);
      }
      r.falls = r.falls.filter(f => { f.vy -= 20 * dt; f.m.position.y += f.vy * dt; f.m.rotation.x += f.rx * dt; f.m.rotation.z += f.rz * dt; if (f.m.position.y < -20) { r.g.remove(f.m); return false; } return true; });
      STACK.cam(r, dt);
    },
    cam(r, dt) {
      const cam = W.camera, ty = r.top.y + 1.2, d = K.camDist(9);
      r.cy = U.damp(r.cy || ty, ty, 3, dt); cam.position.set(d * 0.75, r.cy + 5, d * 0.75); cam.lookAt(0, r.cy - 0.5, 0);
    },
    drop(r) {
      const c = r.cur, t = r.top, ax = c.ax, size = ax === 'x' ? 'w' : 'd', off = c[ax] - t[ax];
      let keep = t[size] - Math.abs(off);
      if (keep <= 0.05) {   // daneben: Turm fertig
        r.falls.push({ m: c.m, vy: 0, rx: 2, rz: 1 }); r.cur = null; r.phase = 'over'; AMC.Audio.sfx('lose');
        if (r.fig) r.fig.play('down', { once: true }); r.say('💥 ' + r.n + ' Etagen! ' + D.HOSTS[r.other].name + ': „Der Mast wackelt …“'); setTimeout(() => r.finish(), 1600); return;
      }
      const perfect = Math.abs(off) < 0.1;
      if (perfect) { keep = t[size]; c[ax] = t[ax]; r.perfectN++; AMC.Audio.sfx('perfect'); W.particles.burst(c.x, c.y, c.z, 0xffffff, 24, { speed: 4 }); if (r.perfectN % 3 === 0 && t[size] < 3) { keep = Math.min(3, keep + 0.25); } }
      else {
        r.perfectN = 0; AMC.Audio.sfx('collect');
        const cut = t[size] - keep, cx = ax === 'x' ? c.x + Math.sign(off) * (keep / 2 + cut / 2) : c.x, cz = ax === 'z' ? c.z + Math.sign(off) * (keep / 2 + cut / 2) : c.z;
        const fm = W.box(ax === 'x' ? cut : c.w, r.H, ax === 'z' ? cut : c.d, c.m.material, cx, c.y, cz, r.g, false); r.falls.push({ m: fm, vy: 0, rx: ax === 'z' ? 1.5 * Math.sign(off) : 0, rz: ax === 'x' ? -1.5 * Math.sign(off) : 0 });
      }
      const mid = perfect ? t[ax] : t[ax] + off / 2;
      r.g.remove(c.m);
      const nw = ax === 'x' ? keep : c.w, nd = ax === 'z' ? keep : c.d, nx = ax === 'x' ? mid : c.x, nz = ax === 'z' ? mid : c.z;
      W.box(nw, r.H, nd, c.m.material, nx, c.y, nz, r.g, false);
      r.top = { w: nw, d: nd, x: nx, z: nz, y: t.y + r.H }; r.n++; r.score = r.n * 10 + (perfect ? 5 : 0) + r.score % 10 * 0;
      if (r.fig) { r.fig.root.position.set(nx, r.top.y, nz); r.fig.play(perfect ? 'arms' : 'jump', { restart: true, fade: 0.05 }); }
      if (r.n % 10 === 0) { AMC.Audio.sfx('cheer'); r.say('📡 ' + r.n + ' Etagen! Der Sendemast wächst!'); }
      STACK.spawn(r);
    },
    fan: s => Math.round(s / 2)
  };

  // ------------------------------------------------------------------ 5) Elfmeter-Duell
  const GOAL = {
    title: '⚽ Elfmeter-Duell', tapDown: true,
    help: () => tapWord() + ': 1× Ecke wählen, 2× Höhe wählen · 6 Schüsse',
    intro: () => tapWord() + ' = Ecke wählen',
    build(r) {
      hall(r, '#2a6ac0', '#bfe4ff', 0x3d7a35);
      const g = r.g;
      const grass = W.canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#3d8a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#358032'; c.fillRect(0, 0, w, h / 2); }, [1, 12]);
      const gm = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ map: grass, roughness: 0.9 })); gm.rotation.x = -Math.PI / 2; gm.position.set(0, 0.01, -8); g.add(gm);
      const post = M(0xffffff, { r: 0.3 }); [-3.66, 3.66].forEach(x => W.cyl(0.07, 0.07, 2.44, post, x, 1.22, -11, g, 8)); const cb = W.cyl(0.07, 0.07, 7.4, post, 0, 2.44, -11, g, 8); cb.rotation.z = Math.PI / 2;
      const net = new T.Mesh(new T.PlaneGeometry(7.3, 2.44, 14, 5), new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })); net.position.set(0, 1.22, -12.2); g.add(net);
      W.box(7.6, 0.03, 0.12, M(0xffffff), 0, 0.02, -11, g, false); W.box(0.4, 0.03, 0.4, M(0xffffff), 0, 0.02, 0, g, false);
      for (let i = 0; i < 3; i++) { W.box(26, 1.6, 2, M([0x5a6b8a, 0x4a5a7a, 0x3a4a6a][i]), 0, 0.8 + i * 1.6, -17 - i * 2, g, false); }
      K.logoBoard(g, -8, 2, -15, 0.2); K.logoBoard(g, 8, 2, -15, -0.2);
      r.ball = new T.Mesh(new T.SphereGeometry(0.17, 16, 12), M(0xffffff, { r: 0.5 })); g.add(r.ball);
      r.mark = new T.Mesh(new T.RingGeometry(0.22, 0.32, 24), new T.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, side: T.DoubleSide })); g.add(r.mark);
      r.fig = K.addFig(r.host, g); if (r.fig) { r.fig.root.position.set(-0.5, 0, 1); r.fig.root.rotation.y = Math.PI + 0.3; r.fig.play('idle'); }
      r.mate = K.addFig(r.other, g); if (r.mate) { r.mate.root.position.set(0, 0, -10.6); r.mate.root.rotation.y = 0; r.mate.play('idle'); }
      r.shot = 0; r.goals = 0; GOAL.reset(r);
    },
    reset(r) { r.st = 'x'; r.ax = 0; r.ay = 1; r.fly = null; r.ball.position.set(0, 0.17, 0); r.mark.visible = true; r.kx = 0; if (r.mate) { r.mate.root.position.set(0, 0, -10.6); r.mate.root.rotation.z = 0; r.mate.play('idle', { fade: 0.2 }); } },
    score: r => r.goals + ' Tore · Schuss ' + Math.min(6, r.shot + 1) + '/6',
    update(r, dt) {
      const tap = go(r);
      if (r.phase === 'ready') { r.phase = 'play'; }
      if (r.phase !== 'play') return;
      const sp = 1.6 + r.shot * 0.15;
      if (r.st === 'x') { r.ax = Math.sin(r.t * sp) * 4.1; r.mark.position.set(r.ax, 1.2, -10.95); if (tap) { r.st = 'y'; AMC.Audio.sfx('move'); r.t0 = r.t; } }
      else if (r.st === 'y') { r.ay = 0.15 + osc(r.t - r.t0 - 0.5, sp * 1.3) * 2.6; r.mark.position.set(r.ax, r.ay, -10.95); if (tap) { r.st = 'shoot'; r.mark.visible = false; GOAL.kick(r); } }
      else if (r.st === 'shoot') {
        const f = r.fly; f.t += dt; const k = Math.min(1, f.t / 0.55);
        r.ball.position.set(r.ax * k, 0.17 + (r.ay - 0.17) * k + Math.sin(k * Math.PI) * 0.4, -11 * k); r.ball.rotation.x -= dt * 20;
        if (r.mate) { r.kx = U.damp(r.kx, f.dive, 7, dt); r.mate.root.position.x = r.kx; r.mate.root.rotation.z = -U.clamp(r.kx * 0.35, -1.2, 1.2); }
        if (k >= 1 && !f.done) {
          f.done = true; r.shot++;
          const outside = Math.abs(r.ax) > 3.55 || r.ay > 2.38, reach = Math.abs(r.kx - r.ax) < (r.ay > 1.7 ? 0.9 : 1.3) && r.ay < 2.3;
          if (outside) { AMC.Audio.sfx('miss'); r.say('😬 Daneben! ' + D.HOSTS[r.other].name + ' grinst.'); }
          else if (reach) { AMC.Audio.sfx('miss'); r.say('🧤 Gehalten! ' + D.HOSTS[r.other].name + ': „Nicht mit mir!“'); if (r.mate) r.mate.play('arms', { restart: true }); }
          else { r.goals++; const corner = Math.abs(r.ax) > 2.6 && r.ay > 1.6; r.score += 100 + (corner ? 60 : 0); AMC.Audio.sfx(corner ? 'win' : 'applause'); W.particles.burst(r.ax, r.ay, -11.6, 0xffd23f, corner ? 50 : 26, { speed: 6 }); r.say(corner ? '🎯 Genau in den Winkel!' : '⚽ TOR!'); if (r.fig) r.fig.play('dance', { restart: true }); }
          setTimeout(() => { if (!R0(r)) return; if (r.shot >= 6) { r.phase = 'win'; r.finish(); } else GOAL.reset(r); }, 1300);
        }
      }
      const cam = W.camera; cam.position.set(0, 1.8, K.camDist(4)); cam.lookAt(0, 1.1, -11);
    },
    kick(r) {
      AMC.Audio.sfx('whoosh'); if (r.fig) r.fig.play('knock', { restart: true, fade: 0.05 });
      const guess = Math.random() < 0.35 + r.shot * 0.06 ? r.ax : (Math.random() - 0.5) * 6;   // Torwart ahnt die Ecke immer öfter
      r.fly = { t: 0, dive: U.clamp(guess, -3.2, 3.2) }; if (r.mate) r.mate.play('jump', { restart: true, fade: 0.05 });
    },
    fan: s => Math.round(s / 8)
  };

  Object.assign(AR.IMPL, { bowl: BOWL, hoop: HOOP, kart: KART, stack: STACK, goal: GOAL });
  AR.GAMES.push(
    { id: 'bowl', icon: '🎳', name: 'Mikro-Bowling', sub: 'Bowling mit Mikrofon-Pins · auch auf der Festival-Insel', world: 'arc:bowl' },
    { id: 'hoop', icon: '🏀', name: 'Funkhaus-Korbjagd', sub: 'Basketball-Automat: 45 Sekunden Körbe werfen · auch im Medienhafen', world: 'arc:hoop' },
    { id: 'kart', icon: '🏎️', name: 'Gisela-Grand-Prix', sub: 'Kart-Rennen gegen Rauschmann · auch in Wellenburg', world: 'arc:kart' },
    { id: 'stack', icon: '🧱', name: 'Sendemast-Stapler', sub: 'Stapel-Turm: Blöcke genau aufeinander · auch am Funkturm-Berg', world: 'arc:stack' },
    { id: 'goal', icon: '⚽', name: 'Elfmeter-Duell', sub: 'Elfmeterschießen gegen ' + 'den Kollegen im Tor · auch im RicoReWi-Universum', world: 'arc:goal' }
  );
})(typeof window !== 'undefined' ? window : globalThis);

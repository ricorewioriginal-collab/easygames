/* AnMaCha – Der Podcast: Arcade – drei 3D-Minispiele mit Andrew und Marco als Spielfiguren.
   - Funkwellen-Flug: Hüpfen (tippen / Leertaste / Ⓐ) zwischen Funkmasten hindurch.
   - Kabelsalat-Parkour: Jump & Run bis zu Gisela – laufen, springen, Kabeltrommeln ausweichen, goldene Mikros sammeln.
   - Funkhaus-Sprint: Endlos-Lauf auf drei Spuren – wischen oder ◀ ▶ wechseln, ▲ springen, ▼ rutschen.
   Ein Bedienkonzept für alle Geräte: Wischen/Tippen am Handy, Pfeile/WASD + Leertaste, Controller-Stick/Steuerkreuz + Ⓐ. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const AR = AMC.Arcade = {};
  let T, R = null;

  AR.GAMES = [
    { id: 'flap', icon: '📡', name: 'Funkwellen-Flug', sub: 'Hüpf zwischen den Funkmasten hindurch – jeder Mast ein Punkt' },
    { id: 'jump', icon: '🧗', name: 'Kabelsalat-Parkour', sub: 'Jump & Run durch die Stadt bis zu Gisela' },
    { id: 'run', icon: '🏃', name: 'Funkhaus-Sprint', sub: 'Endlos-Lauf auf drei Spuren: ausweichen, springen, rutschen' }
  ];
  const LINES = {
    start: { andrew: ['Feelgood-Modus an! Los geht’s!', 'Ich bin bereit. Glaube ich.'], marco: ['Ruhig bleiben, Marco. Wie bei Gisela: vorsichtig, aber bestimmt.', 'Na dann. Für die Hörer!'] },
    crash: { andrew: ['Autsch! Das schneiden wir raus.', 'Das war Absicht. Für den Content.'], marco: ['Ich hab das Kabel nicht gesehen! Ehrlich!', 'Das kommt NICHT in die Folge.'] },
    rico: ['RicoReWi: „Hab ich gefilmt. Geht gleich viral.“', 'RicoReWi: „Ich bau euch dafür ein Tool. Morgen. Vielleicht.“', 'RicoReWi: „Story-Post ist raus! #AnMaCha #Fail“']
  };

  const M = (c, o) => W.mat(c, o || { r: 0.7 });
  const best = id => (Save.data.best['arc_' + id] || 0);

  // ------------------------------------------------------------------ Gemeinsame Bausteine
  function skyTex(top, bot) { return W.canvasTex(4, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); }); }
  let winMats = null;
  function buildingMats() {
    if (winMats) return winMats;
    const tex = W.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#1a1c28'; c.fillRect(0, 0, w, h); for (let y = 6; y < h - 6; y += 12) for (let x = 6; x < w - 6; x += 14) { const r = Math.random(); c.fillStyle = r < 0.45 ? '#ffd86a' : r < 0.6 ? '#7fd8ff' : '#2a2d3c'; c.fillRect(x, y, 8, 7); } });
    winMats = [0x8a8fb0, 0xd0a080, 0x9ac0d0, 0xc090c0].map(c => new T.MeshStandardMaterial({ map: tex, color: c, roughness: 0.8, emissive: 0x222233, emissiveMap: tex, emissiveIntensity: 0.9 }));
    return winMats;
  }
  function building(g, w, h, d) { const m = new T.Mesh(new T.BoxGeometry(w, h, d), U.pick(buildingMats())); m.position.y = h / 2; g.add(m); return m; }
  let micGeo = null;
  function goldMic(g, x, y, z) {
    if (!micGeo) micGeo = { head: new T.SphereGeometry(0.22, 12, 10), body: new T.CylinderGeometry(0.07, 0.05, 0.42, 8) };
    const m = new T.Group(), gold = M(0xffc23a, { r: 0.3, m: 0.6, e: 0xff9a1a, ei: 0.45 });
    const h = new T.Mesh(micGeo.head, gold); h.position.y = 0.22; m.add(h); const b = new T.Mesh(micGeo.body, gold); m.add(b);
    m.position.set(x, y, z); g.add(m); return m;
  }
  let logoTex = null;
  function logoBoard(g, x, y, z, ry) {
    if (!logoTex) { logoTex = new T.TextureLoader().load(AMC.UI.podLogo); logoTex.encoding = T.sRGBEncoding; }
    const b = new T.Group();
    W.box(3.2, 3.2, 0.2, M(0x14161f), 0, 0, -0.12, b);
    const p = new T.Mesh(new T.PlaneGeometry(3, 3), new T.MeshBasicMaterial({ map: logoTex })); b.add(p);
    W.box(0.18, y, 0.18, M(0x555a66), 0, -y / 2 - 1.5, -0.12, b);
    b.position.set(x, y + 1.5, z); b.rotation.y = ry || 0; g.add(b); return b;
  }
  function addFig(id, g) { const f = W.hosts[id]; if (!f) return null; if (f.root.parent) f.root.parent.remove(f.root); g.add(f.root); f.root.visible = true; f.root.rotation.set(0, 0, 0); f.root.rotation.order = 'YXZ'; if (f.talk) f.talk(false); return f; }
  // Kameraabstand: im Hochformat weiter weg, damit genug Strecke zu sehen ist
  const camDist = base => { const a = W.camera.aspect || 1; return a < 1 ? base * Math.min(1.9, 1 / a * 0.8) : base; };

  // ------------------------------------------------------------------ Spiel 1: Funkwellen-Flug (Flappy)
  const FLAP = {
    title: '📡 Funkwellen-Flug',
    help: () => I.device === 'touch' ? 'Tippen = hüpfen' : I.device === 'pad' ? AMC.glyph('a') + ' hüpfen' : 'Leertaste / Klick = hüpfen',
    build(r) {
      const g = r.g;
      r.sc.background = skyTex('#1b1f4a', '#ff9358'); r.sc.fog = new T.Fog(0x8a5a70, 30, 75);
      r.p = { x: 0, y: 4, vy: 0 };
      r.obs = []; r.lastX = 8;
      const stripe = W.canvasTex(16, 64, (c, w, h) => { c.fillStyle = '#e8e8ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#d8342c'; c.fillRect(0, 0, w, h / 2); }, [1, 7]);
      r.mastMat = new T.MeshStandardMaterial({ map: stripe, roughness: 0.6 });
      r.mastGeo = new T.CylinderGeometry(0.42, 0.55, 14, 14);
      r.capGeo = new T.TorusGeometry(0.62, 0.12, 8, 20);
      // Boden und Häuser im Hintergrund (werden weitergeschoben)
      r.tiles = []; for (let i = 0; i < 6; i++) { const t = W.box(20, 12, 8, M(0x2a2d38), i * 20 - 20, -6, 0, g, false); W.box(20, 0.02, 0.3, M(0xffd23f, { e: 0xffd23f, ei: 0.3 }), 0, 6.01, 2.2, t, false); r.tiles.push(t); }
      r.city = []; for (let i = 0; i < 16; i++) { const b = building(g, 4 + Math.random() * 3, 6 + Math.random() * 14, 4); b.position.set(i * 6 - 20, b.position.y, -14 - Math.random() * 8); r.city.push(b); }
      r.boards = [logoBoard(g, 26, 5.5, -9), logoBoard(g, 86, 6, -10)];
      r.fig = addFig(r.host, g); if (r.fig) { r.fig.root.rotation.y = Math.PI / 2; r.fig.play('jump', { fade: 0 }); }
      r.mate = addFig(r.other, g); if (r.mate) { r.mate.root.position.set(-1.6, 0, -1.2); r.mate.root.rotation.y = 0.5; r.mate.play('yes'); }
      while (r.lastX < 60) FLAP.spawn(r);
    },
    spawn(r) {
      const gap = Math.max(3.3, 4.4 - r.score * 0.04), gy = 2.6 + Math.random() * 4.2, x = r.lastX += 7.4;
      const o = { x, gy, gap, passed: false, g: new T.Group() };
      const lo = new T.Mesh(r.mastGeo, r.mastMat); lo.position.y = gy - gap / 2 - 7; o.g.add(lo);
      const hi = new T.Mesh(r.mastGeo, r.mastMat); hi.position.y = gy + gap / 2 + 7; o.g.add(hi);
      [gy - gap / 2, gy + gap / 2].forEach(y => { const c = new T.Mesh(r.capGeo, M(0xff8a1e, { e: 0xff8a1e, ei: 0.8 })); c.rotation.x = Math.PI / 2; c.position.y = y; o.g.add(c); });
      const lamp = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), M(0xff2a2a, { e: 0xff2a2a, ei: 1.5 })); lamp.position.y = gy - gap / 2 + 0.2; o.g.add(lamp); o.lamp = lamp;
      o.mic = goldMic(o.g, 0, gy - 0.2, 0);
      o.g.position.x = x; r.g.add(o.g); r.obs.push(o);
    },
    input(r) { return I.hit('jump') || I.hit('ok') || I.hit('act') || r.tap; },
    update(r, dt) {
      const p = r.p, go = FLAP.input(r);
      if (r.phase === 'ready') { p.y = 4 + Math.sin(r.t * 3) * 0.3; if (go) { r.phase = 'play'; p.vy = 8; AMC.Audio.sfx('jump'); } }
      else if (r.phase === 'play') {
        const sp = Math.min(7.2, 4.6 + r.score * 0.08);
        p.x += sp * dt; p.vy -= 24 * dt; p.y += p.vy * dt;
        if (go) { p.vy = 8.2; AMC.Audio.sfx('jump'); if (r.fig) r.fig.play('jump', { restart: true, fade: 0.05 }); W.particles.burst(p.x - 0.3, p.y + 0.4, 0, 0x3dd6ff, 6, { speed: 2 }); }
        if (p.y > 10.5) { p.y = 10.5; p.vy = Math.min(0, p.vy); }
        let hit = p.y <= 0;
        for (const o of r.obs) {
          if (Math.abs(o.x - p.x) < 0.9 && (p.y + 0.15 < o.gy - o.gap / 2 || p.y + 1.6 > o.gy + o.gap / 2)) hit = true;
          if (!o.passed && p.x > o.x) { o.passed = true; r.score++; AMC.Audio.sfx('collect'); o.mic.visible = false; W.particles.burst(o.x, o.gy, 0, 0xffd23f, 14, { speed: 4 }); if (r.score % 10 === 0) { AMC.Audio.sfx('cheer'); r.say('🎉 ' + r.score + ' Masten! ' + U.pick(LINES.rico)); } }
        }
        if (hit) { p.y = Math.max(0, p.y); r.crash(); }
      } else { p.vy -= 24 * dt; p.y = Math.max(0, p.y + p.vy * dt); }
      // Aufräumen und Nachschub
      r.obs = r.obs.filter(o => { if (o.x < p.x - 16) { r.g.remove(o.g); return false; } return true; });
      while (r.lastX < p.x + 60) FLAP.spawn(r);
      r.obs.forEach(o => { o.mic.rotation.y += dt * 3; o.lamp.visible = (r.t * 2 | 0) % 2 === 0; });
      r.tiles.forEach(t => { if (t.position.x < p.x - 40) t.position.x += 120; });
      r.city.forEach(b => { if (b.position.x < p.x - 30) b.position.x += 96; });
      r.boards.forEach(b => { if (b.position.x < p.x - 30) b.position.x += 120; });
      const f = r.fig; if (f) { f.root.position.set(p.x, p.y, 0); f.root.rotation.x = r.phase === 'over' ? 0 : U.clamp(-p.vy * 0.05, -0.5, 0.6); }
      const d = camDist(9.5), cam = W.camera;
      cam.position.set(p.x + 2.6, 5, d); cam.lookAt(p.x + 2.6, 4.8, 0);
    },
    fan: s => s * 4
  };

  // ------------------------------------------------------------------ Spiel 2: Kabelsalat-Parkour (Jump & Run)
  const JUMP = {
    title: '🧗 Kabelsalat-Parkour',
    help: () => I.device === 'touch' ? 'Stick laufen · Ⓐ springen' : I.device === 'pad' ? 'Stick laufen · ' + AMC.glyph('a') + ' springen' : 'A/D oder ◀ ▶ laufen · Leertaste springen · Shift rennen',
    build(r) {
      const g = r.g;
      r.sc.background = skyTex('#3a8be0', '#c8ecff'); r.sc.fog = new T.Fog(0xb0d8f0, 30, 80);
      r.lives = 3; r.notes = 0; r.inv = 0; r.check = 0;
      r.p = { x: 0, y: 0, vx: 0, vy: 0, ground: true, coyote: 0, buf: 0, face: 1 };
      // Strecke: Boden-Stücke mit Lücken, schwebende Plattformen, Kabeltrommeln, goldene Mikros
      const plats = r.plats = [], drums = r.drums = [], mics = r.mics = [], checks = r.checks = [0];
      let x = -6; const end = 150;
      plats.push({ x0: -6, x1: 14, y: 0 }); x = 14;
      let rnd = 1; const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
      while (x < end) {
        const kind = rand();
        if (kind < 0.4) {   // Lücke mit Bogen aus Mikros
          const gap = 2.2 + rand() * 1.6; for (let i = 1; i < 4; i++) mics.push({ x: x + gap * i / 4, y: 1.6 + Math.sin(i / 4 * Math.PI) * 1.4 });
          x += gap; const len = 6 + rand() * 8; plats.push({ x0: x, x1: x + len, y: 0 }); if (len > 9) drums.push({ x: x + len / 2, a: x + 1.2, b: x + len - 1.2, v: 2 + rand() * 1.2 }); x += len;
        } else if (kind < 0.75) {   // Graben mit schwebender Plattform
          const gap = 5 + rand() * 2.5, py = 1.8 + rand() * 1.3, pw = 2.6 + rand() * 1.4, px = x + gap / 2 - pw / 2;
          plats.push({ x0: px, x1: px + pw, y: py, float: true }); mics.push({ x: px + pw / 2, y: py + 1.3 });
          x += gap; const len = 5 + rand() * 6; plats.push({ x0: x, x1: x + len, y: 0 }); x += len;
        } else {   // Treppe aus Kisten
          const len = 9 + rand() * 4; plats.push({ x0: x, x1: x + len, y: 0 });
          plats.push({ x0: x + 2, x1: x + 4, y: 1.5, float: true }); plats.push({ x0: x + 5, x1: x + 7, y: 3, float: true }); mics.push({ x: x + 6, y: 4.3 }); mics.push({ x: x + 3, y: 2.8 });
          x += len;
        }
        if (x - checks[checks.length - 1] > 45) checks.push(plats[plats.length - 1].x0 + 1);
      }
      plats.push({ x0: x, x1: x + 16, y: 0 }); r.goal = x + 8;
      // Bauen
      const groundM = M(0x4a7a3a), dirt = M(0x6b4a30), boxM = M(0xc8903a), edge = M(0xff8a1e, { e: 0xff8a1e, ei: 0.3 });
      plats.forEach(p => {
        const w = p.x1 - p.x0;
        if (p.float) { W.box(w, 0.5, 2, boxM, (p.x0 + p.x1) / 2, p.y - 0.25, 0, g, false); W.box(w, 0.06, 2.02, edge, (p.x0 + p.x1) / 2, p.y + 0.01, 0, g, false); }
        else { W.box(w, 0.4, 4, groundM, (p.x0 + p.x1) / 2, -0.2, 0, g, false); W.box(w, 16, 4, dirt, (p.x0 + p.x1) / 2, -8.4, 0, g, false); }
      });
      drums.forEach(d => { d.g = new T.Group(); const c = W.cyl(0.6, 0.6, 0.7, M(0x8a5a30), 0, 0, 0, d.g, 16); c.rotation.x = Math.PI / 2; const k = new T.Mesh(new T.TorusGeometry(0.42, 0.1, 6, 16), M(0x111111)); d.g.add(k); const k2 = new T.Mesh(new T.TorusGeometry(0.3, 0.07, 6, 16), M(0xff8a1e)); d.g.add(k2); d.g.position.set(d.x, 0.6, 0); g.add(d.g); });
      mics.forEach(m => { m.g = goldMic(g, m.x, m.y, 0); });
      checks.slice(1).forEach(cx => { W.box(0.1, 2.4, 0.1, M(0xdddddd), cx, 1.2, -0.8, g); const fl = new T.Mesh(new T.PlaneGeometry(0.9, 0.55), new T.MeshBasicMaterial({ color: 0xff8a1e, side: T.DoubleSide })); fl.position.set(cx + 0.45, 2.1, -0.8); g.add(fl); });
      // Ziel: Gisela und der Partner
      if (AMC.StudioEdit && AMC.StudioEdit.camper) { const c = AMC.StudioEdit.camper(1.1); c.position.set(r.goal + 3.5, 1.1, -1.6); c.rotation.y = -Math.PI / 2; g.add(c); }
      const banner = new T.Mesh(new T.PlaneGeometry(3.4, 0.8), new T.MeshBasicMaterial({ map: W.textTex(['ZIEL'], { w: 256, h: 64, size: 44 }) })); banner.position.set(r.goal, 3.4, -0.9); g.add(banner);
      W.box(0.15, 3.4, 0.15, M(0xdddddd), r.goal - 1.6, 1.7, -0.9, g); W.box(0.15, 3.4, 0.15, M(0xdddddd), r.goal + 1.6, 1.7, -0.9, g);
      for (let i = 0; i < 26; i++) { const b = building(g, 5 + Math.random() * 3, 7 + Math.random() * 12, 4); b.position.set(-10 + i * 7, b.position.y - 6, -16 - Math.random() * 6); }
      logoBoard(g, 40, 3, -8); logoBoard(g, 110, 3.5, -8);
      r.fig = addFig(r.host, g); if (r.fig) r.fig.root.rotation.y = Math.PI / 2;
      r.mate = addFig(r.other, g); if (r.mate) { r.mate.root.position.set(r.goal + 2, 0, 0.6); r.mate.root.rotation.y = -1.2; r.mate.play('dance'); }
      r.phase = 'play';
    },
    update(r, dt) {
      const p = r.p, f = r.fig;
      if (r.phase === 'play') {
        const want = I.move.x * (I.sprint ? 8.2 : 5.8);
        p.vx = U.damp(p.vx, want, p.ground ? 14 : 6, dt); if (Math.abs(want) > 0.3) p.face = Math.sign(want);
        p.coyote = p.ground ? 0.12 : p.coyote - dt; p.buf = (I.hit('jump') || I.hit('ok') || r.tap) ? 0.14 : p.buf - dt;
        if (p.buf > 0 && p.coyote > 0) { p.vy = 10.6; p.ground = false; p.coyote = 0; p.buf = 0; p.cut = false; AMC.Audio.sfx('jump'); if (f) f.play('jump', { restart: true, fade: 0.05 }); }
        if (!I.jumpHeld && p.vy > 3 && !p.cut) { p.vy *= 0.55; p.cut = true; }
        p.vy -= 28 * dt; const py0 = p.y; p.x += p.vx * dt; p.y += p.vy * dt; p.x = Math.max(-5.5, p.x);
        const wasGround = p.ground; p.ground = false;
        if (p.vy <= 0) for (const s of r.plats) if (p.x > s.x0 - 0.25 && p.x < s.x1 + 0.25 && py0 >= s.y - 0.05 && p.y <= s.y) { p.y = s.y; p.vy = 0; p.ground = true; break; }
        if (p.ground && !wasGround) AMC.Audio.sfx('land');
        // Mikros
        r.mics.forEach(m => { if (m.g.visible && Math.abs(m.x - p.x) < 0.7 && m.y > p.y - 0.2 && m.y < p.y + 1.9) { m.g.visible = false; r.notes++; r.score += 10; AMC.Audio.sfx('collect'); W.particles.burst(m.x, m.y, 0, 0xffd23f, 10, { speed: 3 }); } });
        // Kabeltrommeln
        if (r.inv > 0) r.inv -= dt;
        r.drums.forEach(d => {
          d.x += d.v * dt; if (d.x > d.b || d.x < d.a) { d.v = -d.v; d.x = U.clamp(d.x, d.a, d.b); }
          d.g.position.x = d.x; d.g.rotation.z -= d.v * dt / 0.6;
          if (d.out || Math.abs(d.x - p.x) > 0.85 || p.y > 1.25) return;
          if (p.vy < 0 && p.y > 0.7) { p.vy = 9; d.out = true; d.g.visible = false; r.score += 25; AMC.Audio.sfx('zap'); W.particles.burst(d.x, 0.8, 0, 0xff8a1e, 18, { speed: 4 }); r.say('💥 Kabeltrommel ausgerollt! +25'); }
          else if (r.inv <= 0) JUMP.hurt(r, Math.sign(p.x - d.x) || -1);
        });
        // Checkpoints, Absturz, Ziel
        r.checks.forEach((c, i) => { if (p.x > c && i > r.check) { r.check = i; AMC.Audio.sfx('star'); r.say('🚩 Zwischenstand gesichert!'); } });
        if (p.y < -6) { JUMP.hurt(r, 0, true); }
        if (p.x > r.goal) { r.phase = 'win'; r.score += 300 + Math.max(0, Math.round(900 - r.t * 6)) + r.lives * 100; AMC.Audio.sfx('win'); W.particles.burst(r.goal, 3, 0, 0xffd23f, 50, { speed: 7 }); if (f) f.play('dance'); r.say('🏁 Geschafft! ' + D.HOSTS[r.other].name + ': „Gisela ist stolz auf dich!“'); setTimeout(() => r.finish(), 1800); }
        if (f) { const a = !p.ground ? 'jump' : Math.abs(p.vx) < 0.4 ? 'idle' : Math.abs(p.vx) < 6.4 ? 'jog' : 'sprint'; if (p.ground && f.curName !== a) f.play(a, { fade: 0.15 }); f.root.rotation.y = p.face > 0 ? Math.PI / 2 : -Math.PI / 2; f.root.visible = r.inv > 0 ? (r.t * 12 | 0) % 2 === 0 : true; }
      }
      r.mics.forEach(m => { m.g.rotation.y += dt * 3; });
      if (f) f.root.position.set(p.x, p.y, 0);
      const d = camDist(8.5), cam = W.camera, cy = Math.max(0, p.y) * 0.5;
      r.camX = r.camX == null ? p.x : U.damp(r.camX, p.x + p.face * 1.5, 4, dt);
      cam.position.set(r.camX, cy + 3.4, d); cam.lookAt(r.camX, cy + 1.8, 0);
    },
    hurt(r, dir, fell) {
      r.lives--; r.inv = 1.6; AMC.Audio.sfx('hit'); r.say((fell ? '🕳️ ' : '🤕 ') + U.pick(LINES.crash[r.host]));
      if (r.lives <= 0) { r.crash(); return; }
      const p = r.p;
      if (fell) { const cx = r.checks[r.check]; const s = r.plats.find(q => !q.float && q.x1 > cx) || r.plats[0]; p.x = Math.max(cx, s.x0 + 0.8); p.y = s.y + 2; p.vx = 0; p.vy = 0; }
      else { p.vx = dir * 7; p.vy = 6; p.ground = false; }
    },
    fan: s => Math.round(s / 8)
  };

  // ------------------------------------------------------------------ Spiel 3: Funkhaus-Sprint (Endlos-Läufer)
  const LANES = [-2.2, 0, 2.2];
  const RUN = {
    title: '🏃 Funkhaus-Sprint',
    help: () => I.device === 'touch' ? 'Wischen: ◀ ▶ Spur · ▲ springen · ▼ rutschen' : I.device === 'pad' ? 'Stick/Steuerkreuz: Spur, ▲ springen, ▼ rutschen' : '◀ ▶ / A D Spur · ▲ / Leertaste springen · ▼ / S rutschen',
    build(r) {
      const g = r.g;
      r.sc.background = skyTex('#0d1030', '#5a2a6a'); r.sc.fog = new T.Fog(0x2a1840, 25, 70);
      r.p = { lane: 1, x: 0, y: 0, vy: 0, z: 0, slide: 0 }; r.speed = 10; r.notes = 0; r.dist = 0;
      r.obs = []; r.nextZ = -24;
      const roadTex = W.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#2a2c36'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23f'; c.fillRect(19, 10, 3, 50); c.fillRect(42, 10, 3, 50); c.fillStyle = '#fff'; c.fillRect(0, 0, 2, h); c.fillRect(w - 2, 0, 2, h); });
      const roadM = new T.MeshStandardMaterial({ map: roadTex, roughness: 0.85 });
      r.tiles = []; for (let i = 0; i < 8; i++) { const t = new T.Mesh(new T.PlaneGeometry(7.4, 12), roadM); t.rotation.x = -Math.PI / 2; t.position.set(0, 0, -i * 12 + 12); g.add(t); r.tiles.push(t); [-1, 1].forEach(k => W.box(0.4, 12, 0.3, M(0x555a66), k * 3.9, 0, 0.15, t, false)); }
      r.side = []; for (let i = 0; i < 18; i++) { [-1, 1].forEach(s => { const b = building(g, 5, 6 + Math.random() * 14, 7); b.position.set(s * (7 + Math.random() * 2), b.position.y, -i * 8 + 8); r.side.push(b); }); }
      r.lamps = []; for (let i = 0; i < 8; i++) { const l = new T.Group(); W.box(0.12, 4, 0.12, M(0x444a55), 0, 2, 0, l, false); const bulb = new T.Mesh(new T.SphereGeometry(0.22, 8, 6), M(0xfff0c0, { e: 0xffd86a, ei: 1.4 })); bulb.position.set(0.5 * (i % 2 ? -1 : 1), 4, 0); l.add(bulb); l.position.set(i % 2 ? 4.3 : -4.3, 0, -i * 10); g.add(l); r.lamps.push(l); }
      r.boards = [logoBoard(g, -5.2, 4, -40, 0.5), logoBoard(g, 5.2, 4, -95, -0.5)];
      r.fig = addFig(r.host, g); if (r.fig) { r.fig.root.rotation.y = Math.PI; r.fig.play('idle', { fade: 0 }); }
      r.mate = addFig(r.other, g); if (r.mate) { r.mate.root.position.set(2.8, 0, -1); r.mate.root.rotation.y = -2.4; r.mate.play('yes'); }
      r.matStripe = M(0xff8a1e, { e: 0xff5a1a, ei: 0.5 });
      while (r.nextZ > -90) RUN.spawn(r);
    },
    spawn(r) {
      const z = r.nextZ, g = r.g, free = Math.floor(Math.random() * 3);
      const n = Math.random() < 0.45 ? 2 : 1, lanes = [0, 1, 2].filter(l => l !== free).sort(() => Math.random() - 0.5).slice(0, n);
      lanes.forEach(l => {
        const k = U.pick(['low', 'low', 'high', 'block']), o = { lane: l, z, kind: k, g: new T.Group() };
        if (k === 'low') { o.d = 0.6; W.box(1.9, 0.12, 0.12, r.matStripe, 0, 0.85, 0, o.g, false); W.box(1.9, 0.12, 0.12, M(0xeeeeee), 0, 0.55, 0, o.g, false); [-0.85, 0.85].forEach(x => W.box(0.1, 0.9, 0.5, M(0x555a66), x, 0.45, 0, o.g, false)); }
        else if (k === 'high') { o.d = 0.6; const t = W.textTex(['ON AIR'], { w: 256, h: 96, size: 54, bg: '#d8342c', fg: '#fff', accent: '#ffd23f' }); const b = new T.Mesh(new T.BoxGeometry(2, 0.9, 0.12), [M(0xb02a24), M(0xb02a24), M(0xb02a24), M(0xb02a24), new T.MeshBasicMaterial({ map: t }), new T.MeshBasicMaterial({ map: t })]); b.position.y = 1.75; o.g.add(b); [-0.95, 0.95].forEach(x => W.box(0.08, 2.4, 0.08, M(0x555a66), x, 1.2, 0, o.g, false)); }
        else { o.d = 3.6; W.box(2, 2.3, 3.6, M(0xf2efe6), 0, 1.35, 0, o.g, false); W.box(2.02, 0.3, 3.62, M(0xff8a1e), 0, 1.2, 0, o.g, false); W.cyl(0.08, 0.08, 1.2, M(0x888888), 0, 3.1, 0.8, o.g); const dish = new T.Mesh(new T.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), M(0xdddddd)); dish.position.set(0, 3.6, 0.8); dish.rotation.x = -0.8; o.g.add(dish); [-0.8, 0.8].forEach(x => [-1.2, 1.2].forEach(zz => { const w = W.cyl(0.35, 0.35, 0.25, M(0x111111), x * 1.05, 0.35, zz, o.g, 12); w.rotation.z = Math.PI / 2; })); }
        o.g.position.set(LANES[l], 0, z); g.add(o.g); r.obs.push(o);
      });
      // Goldene Mikros auf der freien Spur (manchmal im Sprungbogen)
      const arc = Math.random() < 0.3;
      for (let i = 0; i < 5; i++) { const m = { lane: free, z: z + 4 - i * 2, y: arc ? 1 + Math.sin(i / 4 * Math.PI) * 1.4 : 0.9, coin: true }; m.g = goldMic(g, LANES[free], m.y, m.z); r.obs.push(m); }
      r.nextZ -= Math.max(11, 17 - r.speed * 0.2);
    },
    update(r, dt) {
      const p = r.p, f = r.fig;
      const sw = r.swipe; r.swipe = null;
      const L = I.hit('left') || sw === 'left', Rt = I.hit('right') || sw === 'right', J = I.hit('jump') || I.hit('up') || sw === 'up' || r.tap, S = I.hit('down') || I.hit('dodge') || sw === 'down';
      if (r.phase === 'ready') {
        if (L || Rt || J || S || I.hit('ok')) { r.phase = 'play'; if (f) f.play('sprint'); if (r.mate) r.mate.play('arms'); AMC.Audio.sfx('whoosh'); }
      } else if (r.phase === 'play') {
        r.speed = Math.min(22, r.speed + dt * 0.22);
        p.z -= r.speed * dt; r.dist += r.speed * dt;
        if (L && p.lane > 0) { p.lane--; AMC.Audio.sfx('move'); } if (Rt && p.lane < 2) { p.lane++; AMC.Audio.sfx('move'); }
        if (J && p.y <= 0.01) { p.vy = 9.4; p.slide = 0; AMC.Audio.sfx('jump'); if (f) f.play('jump', { restart: true, fade: 0.05 }); }
        if (S) { if (p.y > 0.01) p.vy = -14; p.slide = 0.75; AMC.Audio.sfx('dash'); if (f) f.play('slide', { restart: true, fade: 0.05 }); }
        p.vy -= 26 * dt; p.y = Math.max(0, p.y + p.vy * dt);
        if (p.slide > 0) { p.slide -= dt; if (p.slide <= 0 && f) f.play('sprint', { fade: 0.1 }); }
        else if (p.y === 0 && f && f.curName === 'jump') f.play('sprint', { fade: 0.1 });
        if (f) f.speed(f.curName === 'sprint' ? 0.8 + r.speed / 30 : 1);
        for (const o of r.obs) {
          if (o.lane !== p.lane && !(o.coin && Math.abs(LANES[o.lane] - p.x) < 0.6)) continue;
          const dz = Math.abs(o.z - p.z);
          if (o.coin) { if (o.g.visible && dz < 0.7 && Math.abs(o.y - (p.y + 0.9)) < 1.0) { o.g.visible = false; r.notes++; AMC.Audio.sfx('collect'); } continue; }
          if (o.hit || dz > o.d / 2 + 0.3 || Math.abs(LANES[o.lane] - p.x) > 1.1) continue;
          const bad = o.kind === 'block' || (o.kind === 'low' && p.y < 0.95) || (o.kind === 'high' && !(p.slide > 0));
          if (bad) { o.hit = true; r.crash(); break; }
        }
        r.score = Math.round(r.dist) + r.notes * 10;
      }
      p.x = U.damp(p.x, LANES[p.lane], 14, dt);
      // Welt nachschieben
      r.obs = r.obs.filter(o => { if (o.z > p.z + 10) { r.g.remove(o.g); return false; } return true; });
      while (r.nextZ > p.z - 90) RUN.spawn(r);
      r.obs.forEach(o => { if (o.coin) o.g.rotation.y += dt * 4; });
      r.tiles.forEach(t => { if (t.position.z > p.z + 18) t.position.z -= 96; });
      r.side.forEach(b => { if (b.position.z > p.z + 14) b.position.z -= 144; });
      r.lamps.forEach(l => { if (l.position.z > p.z + 10) l.position.z -= 80; });
      r.boards.forEach(b => { if (b.position.z > p.z + 10) b.position.z -= 110; });
      if (f) f.root.position.set(p.x, p.y, p.z);
      const cam = W.camera, back = W.camera.aspect < 1 ? 7.5 : 6.2;
      cam.position.set(p.x * 0.6, 3.7 + p.y * 0.3, p.z + back); cam.lookAt(p.x * 0.5, 1.2, p.z - 6);
    },
    fan: s => Math.round(s / 15)
  };
  const IMPL = { flap: FLAP, jump: JUMP, run: RUN };
  // Erweiterungen (arcade2.js) hängen sich hier an
  AR.IMPL = IMPL; AR.kit = { M, addFig, camDist, skyTex, logoBoard, goldMic, building, best };

  // ------------------------------------------------------------------ Rahmen: Start, Oberfläche, Ende
  AR.start = function (id, host, onClose) {
    T = root.THREE; AR.close(true);
    const G = IMPL[id], other = host === 'andrew' ? 'marco' : 'andrew';
    const sc = new T.Scene(), g = new T.Group(); sc.add(g);
    sc.add(new T.HemisphereLight(0xfff1e0, 0x404058, 1.0));
    const sun = new T.DirectionalLight(0xffffff, 1.1); sun.position.set(5, 12, 8); sc.add(sun);
    R = { id, G, host, other, sc, g, onClose, phase: 'ready', score: 0, t: 0, tap: false, swipe: null, hold: 0 };
    R.say = say; R.crash = crash; R.finish = finish;
    G.build(R);
    W.particles.attach(sc);
    // Oberfläche
    const el = U.el('div', 'arc-ui'); el.id = 'arcUi';
    el.innerHTML = '<div class="arc-touch" id="arcTouch"></div><div class="arc-top glass"><b>' + G.title + '</b><span id="arcScore">0</span><small id="arcBest">Rekord ' + U.fmt(best(id)) + '</small>' +
      '<button type="button" class="btn small" id="arcPause" aria-label="Pause">⏸</button><button type="button" class="btn small" id="arcBack">🚪</button></div>' +
      '<div class="arc-msg glass" id="arcMsg"></div><div class="arc-help" id="arcHelp"></div><div class="hm-say glass" id="arcSay" hidden></div>';
    U.$('ui').appendChild(el);
    el.querySelector('#arcBack').onclick = () => AR.close();
    el.querySelector('#arcPause').onclick = () => AMC.Game.pause && AMC.Game.pause();
    const tz = el.querySelector('#arcTouch'); let st = null;
    if (id === 'jump') tz.hidden = true;
    tz.addEventListener('pointerdown', e => { e.preventDefault(); st = { x: e.clientX, y: e.clientY, done: false }; if (R && (id === 'flap' || G.tapDown)) R.tap = true; if (R && G.steer) R.hold = e.clientX < root.innerWidth / 2 ? -1 : 1; });
    tz.addEventListener('pointermove', e => { if (!st || st.done || !R) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (Math.hypot(dx, dy) > 28) { st.done = true; R.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); } });
    tz.addEventListener('pointerup', () => { if (st && !st.done && R && id === 'run') R.tap = true; st = null; if (R) R.hold = 0; });
    tz.addEventListener('pointercancel', () => { st = null; if (R) R.hold = 0; });
    msg(G.intro ? G.intro() : id === 'jump' ? 'Lauf bis zu Gisela!' : (I.device === 'touch' ? 'Tippen' : I.device === 'pad' ? AMC.glyph('a') : 'Leertaste') + ' zum Start');
    if (id === 'jump') setTimeout(() => msg(''), 1800);
    U.$('arcHelp').innerHTML = G.help();
    setTimeout(() => say('🎙️ ' + D.HOSTS[host].name + ': „' + U.pick(LINES.start[host]) + '“'), 300);
  };
  function msg(t) { const m = U.$('arcMsg'); if (!m) return; m.hidden = !t; m.innerHTML = t; }
  function say(text, ms) {
    const b = U.$('arcSay'); if (!b) return; b.hidden = false; b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(say.t); say.t = setTimeout(() => { if (b) b.hidden = true; }, ms || 3000);
  }
  function crash() {
    if (!R || R.phase === 'over') return;
    R.phase = 'over'; AMC.Audio.sfx('lose'); R.p.vy = Math.max(R.p.vy || 0, 4);
    if (R.fig) R.fig.play('down', { once: true, fade: 0.1 });
    if (R.mate) R.mate.play('arms');
    const pos = R.fig ? R.fig.root.position : { x: 0, y: 0, z: 0 };
    W.particles.burst(pos.x, pos.y + 1, pos.z, 0xff5a5a, 24, { speed: 5 });
    say('💥 ' + U.pick(LINES.crash[R.host]));
    const r = R; setTimeout(() => { if (R === r) finish(); }, 1600);
  }
  function finish() {
    if (!R || R.done) return; R.done = true;
    const id = R.id, sc = R.score, old = best(id), rec = sc > old;
    if (rec) Save.data.best['arc_' + id] = sc;
    const fan = Save.earn(Math.min(300, R.G.fan(sc)));
    Save.data.stats = Save.data.stats || {}; Save.data.stats.arcade = (Save.data.stats.arcade || 0) + 1; Save.save();
    if (AMC.Home) AMC.Home.tire([R.host], 0.25);
    const won = R.phase === 'win';
    const s = AMC.UI.open('<div class="panel glass small arc-end"><h2>' + (won ? '🏁 Geschafft!' : rec ? '🏆 Neuer Rekord!' : '🎮 Runde vorbei') + '</h2>' +
      '<p class="arc-big">' + U.fmt(sc) + ' Punkte</p><p class="hint">Rekord ' + U.fmt(Math.max(sc, old)) + (R.notes != null ? ' · 🎙️ ' + R.notes + ' goldene Mikros' : '') + ' · +' + fan + ' 🎟️ Fan-Punkte</p>' +
      '<p class="hint">' + U.esc(U.pick(LINES.rico)) + '</p>' +
      '<button class="btn primary" data-nav data-first id="aAgain">↻ Nochmal</button><button class="btn" data-nav id="aOther">🕹️ Anderes Spiel</button><button class="btn" data-nav id="aBack">🏠 Hauptmenü</button></div>', { back: () => AR.close() });
    const b = n => s.el.querySelector('#' + n);
    b('aAgain').onclick = () => { AMC.UI.close(s); AR.close(false, 'again'); };
    b('aOther').onclick = () => { AMC.UI.close(s); AR.close(false, 'arcade'); };
    b('aBack').onclick = () => { AMC.UI.close(s); AR.close(); };
  }

  // ------------------------------------------------------------------ Schleife
  AR.update = function (dt) {
    if (!R) return;
    R.t += dt;
    R.G.update(R, dt);
    R.tap = false;
    if (R.phase === 'play' && R.id !== 'jump' && R.t > 0.2 && !R.keepMsg) msg('');
    if (R.G.hud) { const h = R.G.hud(R); if (h !== R.hudTxt) { R.hudTxt = h; msg(h); } }
    if (R.fig) R.fig.update(dt); if (R.mate) R.mate.update(dt);
    W.particles.update(dt);
    const sEl = U.$('arcScore'); if (sEl) { const v = R.G.score ? R.G.score(R) : U.fmt(R.score); if (sEl.textContent !== v) sEl.textContent = v; }
    if (R.id === 'jump') { const h = U.$('arcHelp'); if (h && R.t > 6 && !h.hidden) h.hidden = true; const lv = '❤️'.repeat(Math.max(0, R.lives)) + ' · 🎙️ ' + R.notes; if (sEl && R.phase === 'play') sEl.textContent = U.fmt(R.score) + ' · ' + lv; }
  };
  AR.render = function () { if (R) W.renderer.render(R.sc, W.camera); };
  AR.active = () => !!R;
  AR.state = () => R;
  /** silent: ohne Rückruf; next: 'again' | 'arcade' | undefined (Hauptmenü) */
  AR.close = function (silent, next) {
    if (!R) return;
    const r = R; R = null;
    const ui = U.$('arcUi'); if (ui) ui.remove();
    [r.fig, r.mate].forEach(f => { if (f) { if (f.root.parent === r.g) r.g.remove(f.root); f.root.rotation.set(0, 0, 0); f.root.rotation.order = 'XYZ'; f.root.visible = true; f.speed(1); } });
    r.sc.traverse(o => { if (o.geometry && !o.isSkinnedMesh) o.geometry.dispose(); });
    micGeo = null;
    if (!silent && r.onClose) r.onClose(next, r.id);
  };
})(typeof window !== 'undefined' ? window : globalThis);

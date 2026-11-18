/* Funkrenner – Bühne: Renderer, Kamera, Held, Abbild des Spielkerns (Läufer) und der Noten (Beat-Modus), Partikel. */
(function (root) {
  'use strict';
  const NOTE_COL = [0xff2e88, 0xffd84a, 0x19f0ff, 0x7aff5a];
  const BEAT_X = [-2.7, -0.9, 0.9, 2.7];

  function create(opt) {
    const THREE = root.THREE, canvas = opt.canvas, base = opt.base || '';
    const low = !!opt.low;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, 0.1, 600);
    const V = { THREE, renderer, scene, camera, low, mode: 'menu', hero: null, heroId: null, W: null, worldId: null, G: null, t: 0, shake: 0, objs: new Map(), pickObjs: new Map(), gate: null, loading: 0, menuShift: 0, menuSpin: 0, pulse: 0, beat: null };
    const W = V.W = root.FRWorld.create(THREE, scene, { base, low });

    /* ---------- Held-Schatten, Schild, Rakete ---------- */
    const stage = new THREE.Group(); scene.add(stage); V.stage = stage;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: W.halo, color: 0x000000, transparent: true, opacity: .55, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .04; scene.add(shadow);
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(1.35, 20, 14), new THREE.MeshBasicMaterial({ color: 0x19f0ff, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending })); bubble.visible = false; scene.add(bubble);
    const flame = W.glow(0xff8a2a, 2.6, 0, 0, 0, scene, .9); flame.visible = false;

    /* ---------- Partikel ---------- */
    const NP = 260, pp = new Float32Array(NP * 3), pc = new Float32Array(NP * 3), pv = new Float32Array(NP * 3), pl = new Float32Array(NP);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .5, map: W.halo, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); pts.frustumCulled = false; scene.add(pts);
    let pi = 0;
    V.emit = (x, y, z, col, n, sp, up) => {
      const c = new THREE.Color(col);
      for (let k = 0; k < n; k++) {
        const i = pi++ % NP; pp[i * 3] = x; pp[i * 3 + 1] = y; pp[i * 3 + 2] = z;
        const a = Math.random() * 6.283, s = (.3 + Math.random()) * (sp || 4);
        pv[i * 3] = Math.cos(a) * s; pv[i * 3 + 1] = (Math.random() * .8 + (up || .3)) * (sp || 4) * .6; pv[i * 3 + 2] = Math.sin(a) * s;
        pc[i * 3] = c.r; pc[i * 3 + 1] = c.g; pc[i * 3 + 2] = c.b; pl[i] = .5 + Math.random() * .5;
      }
    };
    const updP = dt => {
      for (let i = 0; i < NP; i++) {
        if (pl[i] <= 0) { pp[i * 3 + 1] = -99; continue; }
        pl[i] -= dt; pv[i * 3 + 1] -= 9 * dt; pp[i * 3] += pv[i * 3] * dt; pp[i * 3 + 1] += pv[i * 3 + 1] * dt; pp[i * 3 + 2] += pv[i * 3 + 2] * dt;
        const f = Math.max(0, Math.min(1, pl[i] * 2)); pc[i * 3] *= .98 * (f > .2 ? 1 : f * 5 / 5);
      }
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    };

    /* ---------- Welt und Held wechseln ---------- */
    V.setWorld = async (id, variant, onp) => {
      const th = root.FRThemes[id]; V.loading++;
      try { await W.load(th.models.concat(['coin']), onp); } finally { V.loading--; }
      V.worldId = id; V.variant = variant || 0;
      clearRun(); W.setTheme(th, variant || 0);
      scene.add(W.sky, W.disc, W.stars);
      V.setMode(V.mode);
    };
    V.setHero = async id => {
      if (V.heroId === id && V.hero) return V.hero;
      V.loading++;
      try {
        const H = await root.FRHero.load(THREE, base, id);
        if (V.hero) V.hero.dispose();
        V.hero = H; V.heroId = id; stage.add(H.root); H.play(V.mode === 'menu' ? 'idle' : 'run');
        return H;
      } finally { V.loading--; }
    };

    /* ---------- Läufer (Spielkern) ---------- */
    function clearRun() {
      for (const [, o] of V.objs) o.g.parent && o.g.parent.remove(o.g); V.objs.clear();
      for (const [, o] of V.pickObjs) o.g.parent && o.g.parent.remove(o.g); V.pickObjs.clear();
      if (V.gate) { V.gate.parent && V.gate.parent.remove(V.gate); V.gate = null; }
      beatClear();
    }
    V.runStart = G => {
      clearRun(); V.G = G; V.mode = 'run'; V.hitT = 0; V.animT = 0; V.lastAnim = ''; V.dieT = 0;
      if (V.hero) { V.hero.root.rotation.set(0, Math.PI, 0); V.hero.model.rotation.set(0, 0, 0); V.hero.play('run', { speed: 1 }); }
    };
    V.fx = e => {
      const G = V.G, H = V.hero, px = G ? G.x : 0;
      if (e.t === 'coin') V.emit(e.x, e.y, -.2, 0xffd84a, 6, 3, .6);
      else if (e.t === 'jump') { H && H.play('jump', { once: true, fade: .08 }); V.animT = .55; V.emit(px, .1, .3, 0xffffff, 5, 2.5, .1); }
      else if (e.t === 'slide') { V.emit(px, .1, .3, 0xd8c8a8, 8, 3, .2); }
      else if (e.t === 'land') { V.emit(px, .1, .2, 0xffffff, 4, 2, .1); V.animT = 0; }
      else if (e.t === 'hit') { V.shake = .45; V.hitT = .55; H && H.play('hit', { once: true, fade: .05 }); V.emit(px, 1, -.2, 0xff4d6a, 22, 6, .5); }
      else if (e.t === 'shieldBreak') { V.shake = .3; V.emit(px, 1, -.2, 0x19f0ff, 26, 7, .5); }
      else if (e.t === 'power') { V.emit(px, 1.2, -.2, { magnet: 0xff4d6a, shield: 0x19f0ff, dbl: 0xffd84a, turbo: 0xff8a2a, heart: 0xff2e88 }[e.k], 24, 5, .8); }
      else if (e.t === 'dead') { H && H.play('die', { once: true, hold: true, fade: .08 }); V.dieT = 1; V.shake = .6; }
      else if (e.t === 'win') { H && H.play('cheer', { fade: .2 }); V.winT = 1; for (let i = 0; i < 6; i++) V.emit((Math.random() - .5) * 8, 4 + Math.random() * 3, -6 - Math.random() * 6, [0xff2e88, 0xffd84a, 0x19f0ff, 0x7aff5a][i % 4], 14, 7, 1); }
      else if (e.t === 'turboEnd') { H && H.play('run'); }
    };
    function objFor(map, id, make) { let o = map.get(id); if (!o) { o = { g: make() }; map.set(id, o); W.trackG.parent.add(o.g); } return o; }
    V.runSync = (G, dt) => {
      const H = V.hero;
      // Hindernisse
      const seen = new Set();
      for (const o of G.obs) {
        seen.add(o.id); const m = objFor(V.objs, o.id, () => W.obstacle(o));
        m.g.position.set(o.x, 0, o.z);
        if (o._spin) { if (o._spin.userData.axisZ) o._spin.rotation.z -= dt * 4 * Math.sign(o.vx || 1); else o._spin.rotation.x -= dt * 5; if (o.kind === 'roller') o._spin.rotation.y += dt; }
      }
      for (const [id, m] of V.objs) if (!seen.has(id)) { m.g.parent && m.g.parent.remove(m.g); V.objs.delete(id); }
      const seenP = new Set();
      for (const c of G.pick) {
        seenP.add(c.id); const m = objFor(V.pickObjs, c.id, () => c.type === 'coin' ? W.coin() : W.power(c.type));
        m.g.position.set(c.x, c.y + (c.type === 'coin' ? 0 : Math.sin(V.t * 3 + c.id) * .15), c.z);
        if (c.type === 'coin') m.g.rotation.y = V.t * 3 + c.id;
      }
      for (const [id, m] of V.pickObjs) if (!seenP.has(id)) { m.g.parent && m.g.parent.remove(m.g); V.pickObjs.delete(id); }
      // Ziel
      if (G.finishRel != null && G.finishRel < 140) { if (!V.gate) { V.gate = W.finish(); scene.add(V.gate); } V.gate.position.z = -G.finishRel; }
      // Strecke
      W.scroll(G.speed * dt * (G.over ? 0 : 1));
      // Held
      if (H) {
        const r = H.root, tilt = (G.x - (G.lane - 1) * 2.4);
        r.position.set(G.x, G.y, 0); r.rotation.z = -tilt * .09; r.rotation.y = Math.PI;
        const sliding = G.slideT > 0 && G.y === 0;
        H.model.rotation.x += ((sliding ? -1.25 : G.turbo > 0 ? .55 : 0) - H.model.rotation.x) * Math.min(1, dt * 16);
        H.model.position.y += ((sliding ? .28 : 0) - H.model.position.y) * Math.min(1, dt * 16);
        if (G.over && !G.won) { r.visible = true; }
        else r.visible = !(G.inv > 0 && Math.floor(V.t * 14) % 2 && G.turbo <= 0 && G.inv < 1.7);
        if (V.hitT > 0) V.hitT -= dt;
        if (!G.over && V.hitT <= 0 && V.animT <= 0 && H.cur !== H.acts.Running_A && !(G.y > 0)) H.play('run', { fade: .15 });
        if (V.animT > 0) { V.animT -= dt; if (V.animT <= 0 && G.y === 0 && !G.over) H.play('run', { fade: .15 }); }
        H.update(dt);
        shadow.position.set(G.x, .05, 0); const sc = 1 / (1 + G.y * .5); shadow.scale.set(sc, sc, 1); shadow.visible = G.turbo <= 0 || true;
        bubble.visible = !!G.shield; bubble.position.set(G.x, G.y + 1, 0); bubble.scale.setScalar(1 + Math.sin(V.t * 5) * .03);
        flame.visible = G.turbo > 0; flame.position.set(G.x, G.y + .4, .6); flame.scale.setScalar(2.2 + Math.sin(V.t * 40) * .5);
      }
      // Kamera
      const asp = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight), port = asp < .85;
      const cy = port ? 6.0 : 4.9, cz = port ? 9.8 : 7.6, fov = port ? 66 : 58;
      if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      const sh = V.shake > 0 ? V.shake : 0; V.shake = Math.max(0, V.shake - dt * 1.6);
      const tx = G.x * .55 + (sh ? (Math.random() - .5) * sh * .6 : 0), ty = cy + G.y * .25 + (sh ? (Math.random() - .5) * sh * .5 : 0);
      camera.position.x += (tx - camera.position.x) * Math.min(1, dt * 8); camera.position.y += (ty - camera.position.y) * Math.min(1, dt * 8); camera.position.z = cz + (G.turbo > 0 ? 1.2 : 0) + G.speed * .04;
      camera.lookAt(G.x * .3, 1.4 + G.y * .3, -9);
    };

    /* ---------- Menü ---------- */
    V.setMode = m => {
      V.mode = m; const H = V.hero;
      if (m === 'menu') {
        clearRun(); bubble.visible = flame.visible = false; shadow.scale.set(1, 1, 1);
        if (H) { H.root.visible = true; H.model.rotation.set(0, 0, 0); H.model.position.y = 0; H.root.rotation.set(0, 0, 0); H.play('idle', { fade: .2 }); }
      }
    };
    V.menuSync = dt => {
      const H = V.hero, asp = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight), port = asp < .85;
      W.scroll(dt * 3);
      V.menuSpin += dt * .0; const lookX = V.menuShift * (port ? 0 : 1);
      if (H) { H.root.position.set(lookX, 0, 0); H.root.rotation.y += ((V.menuSpin) - H.root.rotation.y) * Math.min(1, dt * 6); H.update(dt); shadow.position.set(lookX, .04, 0); shadow.scale.set(1.3, 1.3, 1); }
      bubble.visible = flame.visible = false;
      const fov = port ? 52 : 40; if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      camera.position.set(Math.sin(V.t * .25) * .5, port ? 2.0 : 1.7, port ? 6.6 : 5.4); camera.lookAt(port ? 0 : lookX * .4, port ? 1.05 : 1.2, 0);
    };

    /* ---------- Beat-Modus: 4-Spur-Autobahn ---------- */
    const beat = { notes: [], pool: [], hitG: null, rec: [], flash: [0, 0, 0, 0], lane: 1.5, x: 0, hop: 0 };
    const gemGeo = new THREE.CylinderGeometry(.62, .62, .22, 20), ringGeo = new THREE.TorusGeometry(.7, .07, 8, 28);
    function beatClear() {
      for (const m of beat.pool) m.parent && m.parent.remove(m); beat.pool = [];
      if (beat.hitG) { beat.hitG.parent && beat.hitG.parent.remove(beat.hitG); beat.hitG = null; }
    }
    V.beatStart = song => {
      clearRun(); V.mode = 'beat'; V.beat = song; beat.flash = [0, 0, 0, 0]; beat.lane = 1.5; beat.x = 0; beat.hop = 0;
      const g = new THREE.Group(); beat.hitG = g; scene.add(g);
      const lane = (i, w) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w || 1.7, 220), new THREE.MeshBasicMaterial({ color: NOTE_COL[i], transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(BEAT_X[i], .06, -105); g.add(m); };
      beat.rec = [];
      for (let i = 0; i < 4; i++) {
        lane(i);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: NOTE_COL[i], transparent: true, opacity: .95 })); ring.rotation.x = -Math.PI / 2; ring.position.set(BEAT_X[i], .1, 0); g.add(ring);
        const halo = W.glow(NOTE_COL[i], 3.2, BEAT_X[i], .4, 0, g, 0); beat.rec.push({ ring, halo });
      }
      for (let i = 0; i <= 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.06, 220), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); m.rotation.x = -Math.PI / 2; m.position.set(-3.6 + i * 1.8, .07, -105); g.add(m); }
      for (const n of song.notes) n.mesh = null;
      if (V.hero) { V.hero.root.visible = true; V.hero.model.rotation.set(0, 0, 0); V.hero.model.position.y = 0; V.hero.play('run', { fade: .1 }); }
      bubble.visible = flame.visible = false;
    };
    const acquire = lane => {
      let m = beat.pool.find(q => !q.userData.used && q.userData.lane === lane);
      if (!m) { m = new THREE.Group(); const d = new THREE.Mesh(gemGeo, new THREE.MeshStandardMaterial({ color: NOTE_COL[lane], emissive: NOTE_COL[lane], emissiveIntensity: .9, roughness: .3 })); m.add(d); const rg = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff })); rg.rotation.x = Math.PI / 2; rg.scale.setScalar(.9); m.add(rg); W.glow(NOTE_COL[lane], 2.6, 0, .2, 0, m, .7); m.userData.lane = lane; scene.add(m); beat.pool.push(m); }
      m.userData.used = true; m.visible = true; return m;
    };
    V.beatHit = (q, lane) => {
      beat.flash[lane] = 1; beat.lane = lane; beat.hop = q > 0 ? 1 : 0;
      if (q > 0) V.emit(BEAT_X[lane], .5, 0, NOTE_COL[lane], q === 2 ? 16 : 8, 4, .8);
      if (q === 0 && V.hero) { V.hero.play('hit', { once: true, fade: .05 }); V.hitT = .45; V.shake = .15; }
    };
    V.beatPress = lane => { beat.flash[lane] = Math.max(beat.flash[lane], .5); beat.lane = lane; };
    V.beatSync = (dt, t, S) => {
      const song = V.beat, H = V.hero; if (!song) return;
      const beatLen = song.beat, ph = (((t - song.countIn) / beatLen) % 1 + 1) % 1; V.pulse = Math.exp(-ph * 5);
      const approach = song.tr.approach, spd = 52 / approach;
      for (const n of song.notes) {
        const d = n.t - t; if (d > approach + .15) break;
        if (n.judged) { if (n.mesh) { n.mesh.visible = false; n.mesh.userData.used = false; n.mesh = null; } continue; }
        if (d < -.35) { if (n.mesh) { n.mesh.visible = false; n.mesh.userData.used = false; n.mesh = null; } continue; }
        if (!n.mesh) n.mesh = acquire(n.lane);
        n.mesh.position.set(BEAT_X[n.lane], .35, -d * spd); n.mesh.scale.setScalar(1 + (d < .15 ? .1 : 0));
      }
      for (let i = 0; i < 4; i++) { beat.flash[i] = Math.max(0, beat.flash[i] - dt * 5); const r = beat.rec[i]; if (r) { r.halo.material.opacity = beat.flash[i] * .95; r.ring.scale.setScalar(1 + beat.flash[i] * .25 + V.pulse * .05); } }
      W.scroll(11 * dt);
      if (H) {
        const tx = beat.lane === 1.5 ? 0 : BEAT_X[beat.lane]; beat.x += (tx - beat.x) * Math.min(1, dt * 12); beat.hop = Math.max(0, beat.hop - dt * 4);
        H.root.position.set(beat.x, Math.sin(beat.hop * Math.PI) * .5, 1.6); H.root.rotation.set(0, Math.PI, -(tx - beat.x) * .12);
        if (V.hitT > 0) V.hitT -= dt; else if (H.cur !== H.acts.Running_A && !S.over) H.play('run', { fade: .15 });
        H.update(dt); shadow.position.set(beat.x, .05, 1.6); shadow.scale.set(1, 1, 1);
      }
      const asp = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight), port = asp < .85;
      const fov = (port ? 70 : 56) + V.pulse * 1.2; if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
      const sh = V.shake > 0 ? V.shake : 0; V.shake = Math.max(0, V.shake - dt * 1.6);
      camera.position.set(Math.sin(V.t * .5) * .25 + (sh ? (Math.random() - .5) * sh : 0), port ? 8.4 : 6.8, port ? 10.4 : 8.6); camera.lookAt(0, .8, -9);
    };
    V.beatEnd = win => { if (V.hero) V.hero.play(win ? 'cheer' : 'die', { once: !win, hold: !win, fade: .1 }); };

    /* ---------- Rendern ---------- */
    V.resize = () => {
      const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    V.frame = dt => {
      dt = Math.min(dt, .05); V.t += dt;
      W.update(dt, V.t, V.mode === 'beat' ? V.pulse : 0);
      if (V.mode === 'menu') V.menuSync(dt);
      updP(dt);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', V.resize); V.resize();
    return V;
  }
  root.FRView = { create, NOTE_COL, BEAT_X };
})(window);

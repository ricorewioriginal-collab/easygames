/* Prüfung: Das Höhlenlabyrinth – im Dunkeln mit der Taschenlampe durch die Höhle laufen und die Sterne finden.
   Sterne sieht man nur im Lichtkegel. Die Batterie wird schwächer (Ersatzbatterien liegen herum), und wer
   schlafende Fledermäuse anleuchtet, hat gleich einen ganzen Schwarm im Gesicht – dann lieber kurz das Licht aus. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const CS = 2.6, WT = 0.5, HT = 2.1;

  UL.Trials.reg('hoehle', {
    orbit: true, relMove: true, noPointer: true, atmo: 'cave',
    env: () => ({ none: true }),
    setup(ctx) {
      const sc = ctx.scene, rng = ctx.rng, studio = ctx.theme === 'studio';
      sc.background = R.lin(0x010101); sc.fog = new T.Fog(R.lin(0x010101), 4, 15);
      ctx.amb = new T.AmbientLight(0xffffff, 0.06); sc.add(ctx.amb);
      const W = ctx.short ? 5 : 6, H = ctx.short ? 4 : 5;
      ctx.W = W; ctx.H = H; ctx.cells = UL.Trials.maze(W, H, rng);
      const ox = -W * CS / 2, oz = -H * CS / 2; ctx.ox = ox; ctx.oz = oz;
      // Felsboden und -wände (Rauschen-Textur, Wände als Instanzen mit etwas Unregelmäßigkeit)
      const tex = (a, b, rep) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = a; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 1400; i++) { g.fillStyle = Math.random() < 0.5 ? b : '#000'; g.globalAlpha = Math.random() * 0.3; const s = 1 + Math.random() * 5; g.fillRect(Math.random() * 128, Math.random() * 128, s, s * 0.7); } const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); return t; };
      const rockM = new T.MeshLambertMaterial({ map: tex(studio ? '#45424e' : '#5e5448', studio ? '#6a6672' : '#8a7a66', 1) });
      const floor = new T.Mesh(new T.PlaneGeometry(W * CS + 2, H * CS + 6), new T.MeshLambertMaterial({ map: tex(studio ? '#2e2c36' : '#3e362c', '#5a5040', 8) })); floor.rotation.x = -Math.PI / 2; floor.position.z = -2; floor.receiveShadow = true; sc.add(floor);
      ctx.walls = [];
      const addW = (x, z, w, d) => ctx.walls.push({ x, z, w, d });
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const c = ctx.cells[y * W + x], cx = ox + x * CS + CS / 2, cz = oz + y * CS + CS / 2;
        if (c.n && !(x === 0 && y === 0)) addW(cx, cz - CS / 2, CS + WT, WT);
        if (c.w) addW(cx - CS / 2, cz, WT, CS + WT);
        if (y === H - 1 && c.s) addW(cx, cz + CS / 2, CS + WT, WT);
        if (x === W - 1 && c.e) addW(cx + CS / 2, cz, WT, CS + WT);
      }
      const im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), rockM, ctx.walls.length), M = new T.Matrix4(), Q = new T.Quaternion();
      ctx.walls.forEach((w, i) => { Q.setFromAxisAngle(new T.Vector3(0, 1, 0), rng.range(-0.06, 0.06)); M.compose(new T.Vector3(w.x, HT / 2, w.z), Q, new T.Vector3(w.w, HT * rng.range(0.92, 1.1), w.d)); im.setMatrixAt(i, M); });
      im.receiveShadow = true; sc.add(im);
      // Felsbrocken an den Wandecken (wirkt wie Höhle statt Mauer)
      const bo = new T.InstancedMesh(new T.DodecahedronGeometry(0.5, 0), rockM, (W + 1) * (H + 1));
      for (let y = 0, i = 0; y <= H; y++) for (let x = 0; x <= W; x++, i++) { Q.setFromAxisAngle(new T.Vector3(0, 1, 0), rng.range(0, 6)); const s = rng.range(0.8, 1.2); M.compose(new T.Vector3(ox + x * CS, HT * 0.45, oz + y * CS), Q, new T.Vector3(s, HT * 1.05, s)); bo.setMatrixAt(i, M); }
      sc.add(bo);
      // Tropfsteine
      const stM = R.mat(studio ? 0x6a6672 : 0x8a7a66);
      for (let i = 0; i < W * H; i++) { const s = new T.Mesh(new T.ConeGeometry(rng.range(0.08, 0.18), rng.range(0.4, 1.1), 6), stM); s.position.set(ox + rng.int(0, W - 1) * CS + CS / 2 + rng.range(-0.9, 0.9), 0, oz + rng.int(0, H - 1) * CS + CS / 2 + rng.range(-0.9, 0.9)); s.position.y = s.geometry.parameters.height / 2; sc.add(s); }
      // Sterne: nur im Licht zu sehen (keine Leuchtwirkung), bevorzugt in Sackgassen
      const dead = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = ctx.cells[y * W + x]; if (['n', 's', 'e', 'w'].filter(d => !c[d]).length === 1 && x + y > 0) dead.push([x, y]); }
      const spots = rng.shuffle(dead); const all = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x + y > 1) all.push([x, y]);
      for (const c of rng.shuffle(all)) { if (spots.length >= ctx.max + 3) break; if (!spots.some(s => s[0] === c[0] && s[1] === c[1])) spots.push(c); }
      const goldM = new T.MeshLambertMaterial({ color: R.lin(0xffc830), emissive: R.lin(0x110800) });
      const cellPos = ([x, y]) => [ox + x * CS + CS / 2, oz + y * CS + CS / 2];
      ctx.starObjs = spots.slice(0, ctx.max).map(c => { const s = R.star(0.34); s.material = goldM; s.children.forEach(k => k.visible = false); const [x, z] = cellPos(c); s.position.set(x, 0.9, z); s.userData.cell = c; sc.add(s); return s; });
      // Ersatzbatterien
      ctx.batts = spots.slice(ctx.max, ctx.max + 3).map(c => { const g = new T.Group(); const b = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.3, 10), new T.MeshLambertMaterial({ color: R.lin(0x30c050), emissive: R.lin(0x0a3a10) })); b.rotation.z = Math.PI / 2; b.position.y = 0.12; g.add(b); const [x, z] = cellPos(c); g.position.set(x + 0.5, 0, z); g.userData.cell = c; sc.add(g); return g; });
      // Fledermäuse an der Decke (rote Augen leuchten schwach im Dunkeln)
      ctx.bats = [];
      const eyeM = new T.SpriteMaterial({ color: 0xff3020, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending });
      const nB = Math.round((ctx.short ? 4 : 6) * ctx.k);
      for (const c of rng.shuffle(all).slice(0, nB)) {
        const a = new A.Animal('bat', 0.45), [x, z] = cellPos(c); a.root.position.set(x + rng.range(-0.6, 0.6), HT - 0.3, z + rng.range(-0.6, 0.6)); a.root.rotation.x = Math.PI; sc.add(a.root);
        const e = new T.Sprite(eyeM); e.scale.set(0.22, 0.1, 1); e.position.copy(a.root.position).add(new T.Vector3(0, -0.15, 0)); sc.add(e);
        ctx.bats.push({ a, e, home: a.root.position.clone(), wake: 0, fly: 0, ph: rng.range(0, 6), gone: false });
      }
      // Taschenlampe (Lichtkegel in Blickrichtung) und schwaches Eigenlicht
      ctx.lamp = new T.SpotLight(R.lin(0xfff0d0), 3.6, 14, 0.55, 0.45, 1); sc.add(ctx.lamp, ctx.lamp.target);
      ctx.glow = new T.PointLight(R.lin(0xffe0a0), 0.45, 4); sc.add(ctx.glow);
      ctx.on = true; ctx.batt = 1; ctx.panic = 0;
      // Eingang
      const [ex, ez] = cellPos([0, 0]);
      ctx.player.root.position.set(ex, 0, ez - CS * 0.9); ctx.player.root.rotation.y = 0;
      ctx.hostPos.set(ex - 1.6, 0, oz - 3.2); ctx.hostRy = 0.4;
      const hl = new T.PointLight(0xffffff, 1.1, 7); hl.position.set(ex - 1, 3, oz - 3.5); sc.add(hl);
      ctx.intro = { pos: new T.Vector3(ex + 1.5, 2.2, oz - 6), look: new T.Vector3(ex, 0.8, oz) };
      ctx.cam.position.set(ex, 2.4, oz - 6.5); ctx.cam.lookAt(ex, 0.8, oz);
    },
    collide(ctx, p) {
      const r = 0.34;
      for (const w of ctx.walls) {
        const dx = p.x - w.x, dz = p.z - w.z, hx = w.w / 2 + r, hz = w.d / 2 + r;
        if (Math.abs(dx) < hx && Math.abs(dz) < hz) { const px = hx - Math.abs(dx), pz = hz - Math.abs(dz); if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
      }
      p.x = UL.clamp(p.x, ctx.ox + 0.35, ctx.ox + ctx.W * CS - 0.35); p.z = UL.clamp(p.z, ctx.oz - 3, ctx.oz + ctx.H * CS - 0.35);
      if (p.z < ctx.oz + 0.2) p.x = UL.clamp(p.x, ctx.ox + 0.35, ctx.ox + CS - 0.35);
    },
    update(dt, ctx) {
      const I = ctx.inp, f = ctx.player, p = f.root.position;
      if (I.alt) { ctx.on = !ctx.on; UL.Audio.sfx('tick'); }
      if (ctx.panic > 0) ctx.panic -= dt;
      const mag = Math.min(1, Math.hypot(I.mx, I.my)), sp = (ctx.panic > 0 ? 1.1 : 2.6) * mag;
      if (mag > 0.12) { p.x += I.mx / Math.max(mag, 0.001) * sp * dt; p.z += I.my / Math.max(mag, 0.001) * sp * dt; f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(I.mx, I.my), 10, dt); }
      this.collide(ctx, p); p.y = 0;
      if (!f.one) f.move(mag > 0.12 ? sp : 0);
      if (mag > 0.3 && Math.random() < dt * 2.5) UL.Audio.sfx('step');
      // Batterie
      if (ctx.on) ctx.batt = Math.max(0, ctx.batt - dt / (ctx.short ? 34 : 46) * ctx.k);
      const lit = ctx.on ? (ctx.batt > 0.15 ? 1 : 0.25 + Math.random() * 0.25 * (ctx.batt > 0 ? 1 : 0)) : 0;
      const ry = f.root.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry);
      ctx.lamp.intensity = 3.6 * lit * (0.6 + ctx.batt * 0.4); ctx.lamp.position.set(p.x + fx * 0.3, 1.3, p.z + fz * 0.3); ctx.lamp.target.position.set(p.x + fx * 5, 0, p.z + fz * 5);
      ctx.glow.position.set(p.x, 1.6, p.z); ctx.glow.intensity = ctx.on ? 0.45 : 0.15;
      for (const b of ctx.batts) { if (!b.visible) continue; b.rotation.y += dt * 2; if (Math.hypot(b.position.x - p.x, b.position.z - p.z) < 0.7) { b.visible = false; ctx.batt = Math.min(1, ctx.batt + 0.45); UL.Audio.sfx('ok'); UI_toast('Ersatzbatterie!'); } }
      // Fledermäuse: im Lichtkegel aufwachen, Schwarm fliegt dem Spieler ins Gesicht
      for (const b of ctx.bats) {
        if (b.gone) continue; b.a.update(dt);
        const dx = b.home.x - p.x, dz = b.home.z - p.z, d = Math.hypot(dx, dz);
        const inCone = lit > 0.5 && d < 4.2 && (dx * fx + dz * fz) / (d || 1) > 0.82;
        if (!b.fly) {
          b.wake = UL.clamp(b.wake + (inCone ? dt * 1.6 : -dt * 0.8), 0, 1);
          b.e.material.opacity = 0.35 + b.wake * 0.6; b.a.root.position.y = b.home.y + Math.sin(ctx.t * 20) * b.wake * 0.03;
          if (b.wake >= 1) { b.fly = 2.2; UL.Audio.sfx('whoosh'); UL.Audio.sfx('hiss'); }
        } else {
          b.fly -= dt; b.ph += dt * 6; b.e.visible = false; b.a.root.rotation.x = 0;
          b.a.root.position.lerp(new T.Vector3(p.x + Math.sin(b.ph) * 0.6, 1.5 + Math.sin(b.ph * 2) * 0.2, p.z + Math.cos(b.ph) * 0.6), 1 - Math.exp(-5 * dt));
          if (b.fly < 1.6 && !b.hit) { b.hit = true; ctx.bad('Fledermäuse im Gesicht!', 'scream'); ctx.panic = 1.6; f.play('block'); ctx.time = Math.max(1, ctx.time - 3); }
          if (b.fly <= 0) { b.gone = true; ctx.scene.remove(b.a.root); ctx.scene.remove(b.e); }
        }
      }
      // Sterne einsammeln (nur wenn man sie im Licht sieht oder direkt davor steht)
      for (const s of ctx.starObjs) { if (!s.visible) continue; s.rotation.y += dt * 2; if (Math.hypot(s.position.x - p.x, s.position.z - p.z) < 0.75) { s.visible = false; ctx.addStar(s.position.clone()); f.play('cheer', { speed: 1.4 }); } }
      const low = ctx.batt < 0.2;
      ctx.meters = [{ label: '🔋 Batterie', v: ctx.batt, danger: low, color: low ? '#e04030' : '#5ad05a' }];
      ctx.extraHud = `<span class="chip ${ctx.on ? '' : 'warn'}">🔦 ${ctx.on ? 'Licht an' : 'Licht aus'}</span>${ctx.bats.some(b => !b.fly && !b.gone && b.wake > 0.3) ? '<span class="chip warn">🦇 Sie wachen auf!</span>' : ''}`;
      ctx.overlay(ctx.t < 6 ? `<div class="lbl">🔦 ${UL.In.glyph('alt')} = Licht an/aus · rote Augen = Fledermäuse, nicht anleuchten!</div>` : '');
      // Kamera: schräg von hinten-oben (Wände verdecken so nicht)
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(p.x - fx * 1.2, port ? 7.6 : 7.5, p.z - fz * 1.2 + (port ? 2.6 : 2.8)), 1 - Math.exp(-4 * dt)); ctx.cam.lookAt(p.x + fx * 0.8, 0, p.z + fz * 0.8);
    },
    bot(dt, ctx, I) {
      const p = ctx.player.root.position, W = ctx.W, H = ctx.H;
      const cell = (x, z) => [UL.clamp(Math.floor((x - ctx.ox) / CS), 0, W - 1), UL.clamp(Math.floor((z - ctx.oz) / CS), 0, H - 1)];
      const [cx, cy] = cell(p.x, p.z);
      // Licht aus, wenn eine Fledermaus im Kegel aufwacht
      const waking = ctx.bats.some(b => !b.fly && !b.gone && b.wake > 0.4);
      if (waking && ctx.on) I.alt = true;
      else if (!ctx.on && !ctx.bats.some(b => !b.fly && !b.gone && b.wake > 0.05)) I.alt = true;
      const goals = ctx.starObjs.filter(s => s.visible).concat(ctx.batt < 0.3 ? ctx.batts.filter(b => b.visible) : []);
      const targets = new Set(goals.map(s => s.userData.cell.join(','))); if (!targets.size) return;
      if (p.z < ctx.oz + 0.3) { I.mx = (ctx.ox + CS / 2 - p.x); I.my = 1; return; }
      const prev = new Map([[cx + ',' + cy, null]]), q = [[cx, cy]]; let goal = null;
      while (q.length) { const [x, y] = q.shift(); if (targets.has(x + ',' + y)) { goal = [x, y]; break; } const c = ctx.cells[y * W + x];
        for (const [d, a, b] of [['n', x, y - 1], ['s', x, y + 1], ['e', x + 1, y], ['w', x - 1, y]]) { if (c[d] || a < 0 || b < 0 || a >= W || b >= H) continue; const k = a + ',' + b; if (!prev.has(k)) { prev.set(k, [x, y]); q.push([a, b]); } } }
      if (!goal) return;
      let st = goal; while (prev.get(st.join(',')) && prev.get(st.join(',')).join(',') !== cx + ',' + cy) st = prev.get(st.join(','));
      let tx = ctx.ox + st[0] * CS + CS / 2, tz = ctx.oz + st[1] * CS + CS / 2;
      if (st[0] === goal[0] && st[1] === goal[1]) { const g = goals.find(s => s.userData.cell.join(',') === goal.join(',')); if (g) { tx = g.position.x; tz = g.position.z; } }
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz) || 1; I.mx = dx / d; I.my = dz / d;
    }
  });
  function UI_toast(t) { UL.UI.toast(t, '🔋', 1400); }
})();

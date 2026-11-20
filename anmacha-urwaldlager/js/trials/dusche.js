/* Prüfung: Die Ekel-Dusche – unter Rohren Sterne fangen, Schleim, Fischresten und Krabbeltieren ausweichen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const N = 4, SP = 1.5;   // Rohr-Raster N×N, Abstand

  UL.Trials.reg('dusche', {
    orbit: true, relMove: true,
    env: (theme) => theme === 'studio' ? {} : { tod: 'day', radius: 14, clear: [{ x: 0, z: 0, r: 6 }], seed: 66 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio', half = (N - 1) * SP / 2;
      // Plattform mit Abfluss-Rinne, Gerüst mit Rohren
      const plat = new T.Mesh(new T.BoxGeometry(N * SP + 0.8, 0.3, N * SP + 0.8), R.mat(studio ? 0xdfe6ee : 0x8a6a42)); plat.position.y = 0.15; plat.receiveShadow = true; sc.add(plat);
      const tc = document.createElement('canvas'); tc.width = tc.height = 64; const tx = tc.getContext('2d'); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { tx.fillStyle = studio ? ((i + j) % 2 ? '#2a8cff' : '#e8f4ff') : ((i + j) % 2 ? '#8a6a42' : '#a8865a'); tx.fillRect(i * 8, j * 8, 8, 8); } const tt = new T.CanvasTexture(tc); tt.magFilter = T.NearestFilter; tt.encoding = T.sRGBEncoding;
      const tiles = new T.Mesh(new T.PlaneGeometry(N * SP + 0.6, N * SP + 0.6), new T.MeshLambertMaterial({ map: tt })); tiles.rotation.x = -Math.PI / 2; tiles.position.y = 0.33; tiles.receiveShadow = true; sc.add(tiles);
      const frame = R.mat(studio ? 0x8a8f99 : 0x5a3a1e);
      for (const x of [-1, 1]) for (const z of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(0.2, 4.6, 0.2), frame); p.position.set(x * (half + 0.7), 2.3, z * (half + 0.7)); p.castShadow = true; sc.add(p); }
      ctx.pipes = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = -half + i * SP, z = -half + j * SP;
        const pipe = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.5, 10), R.mat(studio ? 0xc0c8d0 : 0x6b8a5a)); pipe.position.set(x, 4.25, z); sc.add(pipe);
        const mouth = new T.Mesh(new T.CylinderGeometry(0.2, 0.17, 0.1, 10), new T.MeshLambertMaterial({ color: R.lin(0x444444), emissive: 0x000000 })); mouth.position.set(x, 3.97, z); sc.add(mouth);
        ctx.pipes.push({ x, z, pipe, mouth, warn: 0, item: null });
      }
      for (let j = 0; j < N; j++) { const beam = new T.Mesh(new T.BoxGeometry(N * SP + 1.6, 0.14, 0.14), frame); beam.position.set(0, 4.55, -half + j * SP); sc.add(beam); }
      for (const s of [-1, 1]) { const beam = new T.Mesh(new T.BoxGeometry(0.16, 0.16, N * SP + 1.6), frame); beam.position.set(s * (half + 0.7), 4.6, 0); sc.add(beam); }
      // Fallende Dinge
      ctx.items = [];
      ctx.spawnT = 1; ctx.starsLeft = ctx.max + Math.round(6 / ctx.k); ctx.slime = 0; ctx.duck = 0;
      ctx.px = 0; ctx.pz = 0;
      ctx.player.root.position.set(0, 0.3, 0);
      ctx.hostPos.set(-half - 2.6, 0, -half + 0.5); ctx.hostRy = 1.2;
      ctx.intro = { pos: new T.Vector3(4, 4, 8), look: new T.Vector3(0, 1.5, 0) };
      ctx.goo = document.createElement('div'); ctx.goo.className = 'tint'; document.getElementById('ui').prepend(ctx.goo);
      UL.Trials.sign(ctx, 0, -half - 2.2, 0);
      ctx.cam.position.set(0, 7.5, 7.2); ctx.cam.lookAt(0, 0.8, 0.4);
    },
    spawn(ctx) {
      const free = ctx.pipes.filter(p => !p.warn && !p.item); if (!free.length) return;
      const p = ctx.rng.pick(free);
      let kind = 'slime';
      const r = ctx.rng.next();
      if (ctx.starsLeft > 0 && r < 0.42) kind = 'star'; else if (r < 0.62) kind = 'fish'; else if (r < 0.8) kind = 'bugs';
      if (kind === 'star') ctx.starsLeft--;
      p.warn = kind === 'star' ? 0.9 : 0.75 / Math.max(0.8, ctx.k * 0.9); p.kind = kind;
      p.mouth.material.emissive = R.lin(kind === 'star' ? 0xffc000 : kind === 'slime' ? 0x40ff40 : kind === 'fish' ? 0x80a0ff : 0xff6030);
    },
    drop(ctx, p) {
      let o;
      if (p.kind === 'star') { o = R.star(0.42); }
      else if (p.kind === 'slime') { o = new T.Mesh(new T.SphereGeometry(0.3, 10, 8), new T.MeshLambertMaterial({ color: R.lin(0x6fdc3a), transparent: true, opacity: 0.85 })); }
      else if (p.kind === 'fish') { o = A.sized('fish', 0.5, 'xz'); }
      else { o = new T.Group(); for (let i = 0; i < 6; i++) { const b = new T.Mesh(new T.SphereGeometry(0.06, 6, 4), R.mat(0x2a1a0a)); b.scale.set(1, 0.5, 1.6); b.position.set((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4); o.add(b); } }
      o.position.set(p.x, 3.9, p.z); ctx.scene.add(o);
      ctx.items.push({ o, kind: p.kind, vy: 0, x: p.x, z: p.z });
      p.mouth.material.emissive = R.lin(0x000000);
      UL.Audio.sfx(p.kind === 'star' ? 'pick' : 'slime');
    },
    // Pfützen auf dem Boden, die langsam verblassen
    splat(ctx, x, z, col) {
      ctx.splats = ctx.splats || [];
      const m = new T.Mesh(new T.CircleGeometry(UL.rand(0.3, 0.55), 12), new T.MeshLambertMaterial({ color: R.lin(col), transparent: true, opacity: 0.85, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x + UL.rand(-0.15, 0.15), 0.335 + ctx.splats.length * 0.0005, z + UL.rand(-0.15, 0.15)); m.scale.set(1, UL.rand(0.6, 1), 1); ctx.scene.add(m);
      ctx.splats.push({ m, t: 8 }); if (ctx.splats.length > 30) { const o = ctx.splats.shift(); ctx.scene.remove(o.m); }
    },
    update(dt, ctx) {
      if (ctx.splats) for (const sp of ctx.splats) { sp.t -= dt; sp.m.material.opacity = UL.clamp(sp.t / 4, 0, 0.85); }
      const I = ctx.inp, fig = ctx.player, half = (N - 1) * SP / 2 + 0.4;
      // Taktung steigt mit der Zeit
      const prog = 1 - ctx.time / ctx.timeMax;
      ctx.spawnT -= dt; if (ctx.spawnT <= 0) { ctx.spawnT = UL.lerp(1.15, 0.5, prog) / ctx.k; this.spawn(ctx); if (prog > 0.5 && Math.random() < 0.4) this.spawn(ctx); }
      for (const p of ctx.pipes) { if (p.warn > 0) { p.warn -= dt; p.pipe.position.y = 4.25 + Math.sin(ctx.t * 50) * 0.02; if (p.warn <= 0) { p.warn = 0; p.pipe.position.y = 4.25; this.drop(ctx, p); } } }
      // Spielfigur
      ctx.duck = I.altD ? Math.min(1, ctx.duck + dt * 6) : Math.max(0, ctx.duck - dt * 6);
      const sp = (ctx.slime > 0 ? 1.6 : 3.4) * (1 - ctx.duck * 0.7);
      if (ctx.slime > 0) ctx.slime -= dt;
      ctx.px = UL.clamp(ctx.px + I.mx * sp * dt, -half, half); ctx.pz = UL.clamp(ctx.pz + I.my * sp * dt, -half, half);
      fig.root.position.set(ctx.px, 0.3, ctx.pz);
      if (Math.abs(I.mx) + Math.abs(I.my) > 0.1) fig.root.rotation.y = UL.angDamp(fig.root.rotation.y, Math.atan2(I.mx, I.my), 10, dt);
      fig.root.scale.y = 1 - ctx.duck * 0.35;
      if (!fig.one) fig.move((Math.abs(I.mx) + Math.abs(I.my)) * sp);
      // Fallende Dinge
      for (let i = ctx.items.length - 1; i >= 0; i--) {
        const it = ctx.items[i]; it.vy -= 14 * dt; it.o.position.y += it.vy * dt; it.o.rotation.y += dt * 4;
        const hit = Math.hypot(it.x - ctx.px, it.z - ctx.pz) < 0.62 && it.o.position.y < 2.0 - ctx.duck * 0.6 && it.o.position.y > 0.4;
        if (hit) {
          if (it.kind === 'star') { if (ctx.duck < 0.5) { ctx.addStar(it.o.position); fig.play('cheer', { speed: 1.5 }); } }
          else if (ctx.duck < 0.5) { ctx.slime = 2; ctx.bad(it.kind === 'slime' ? 'Schleim-Treffer!' : it.kind === 'fish' ? 'Fischreste – igitt!' : 'Krabbeltiere im Nacken!', it.kind === 'bugs' ? 'scream' : 'yuck'); ctx.stage.parts.burst(ctx.px, 1.8, ctx.pz, 20, 2, 2, it.kind === 'slime' ? [0x6fdc3a, 0x9aff6a] : [0x8a6a4a, 0x3a2a1a]); fig.play('hit'); }
          else { UL.Audio.sfx('splash'); }
          ctx.scene.remove(it.o); ctx.items.splice(i, 1); continue;
        }
        if (it.o.position.y < 0.35) { if (it.kind !== 'star') { ctx.stage.parts.burst(it.x, 0.4, it.z, 10, 1.5, 1.5, it.kind === 'slime' ? [0x6fdc3a] : [0x6a5a3a]); this.splat(ctx, it.x, it.z, it.kind === 'slime' ? 0x6fdc3a : it.kind === 'fish' ? 0x9a8a6a : 0x3a2a1a); } ctx.scene.remove(it.o); ctx.items.splice(i, 1); }
      }
      ctx.goo.style.background = ctx.slime > 0 ? `radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(90,220,50,${(ctx.slime * 0.18).toFixed(2)}))` : 'transparent';
      if (ctx.starsLeft <= 0 && !ctx.items.some(x => x.kind === 'star') && !ctx.pipes.some(p => p.warn && p.kind === 'star')) ctx.end('leer');
      ctx.meters = [];
      ctx.extraHud = `<span class="chip">🚿 noch ${ctx.starsLeft + ctx.items.filter(x => x.kind === 'star').length + ctx.pipes.filter(p => p.warn && p.kind === 'star').length} Sterne in den Rohren</span>`;
      // Kamera: im Hochformat steiler
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(ctx.px * 0.3, port ? 9.5 : 7.5, port ? 6 : 7.2), 1 - Math.exp(-3 * dt)); ctx.cam.lookAt(ctx.px * 0.3, 0.8, 0.4);
    },
    finish(ctx) { if (ctx.goo) ctx.goo.remove(); ctx.player.root.scale.y = 1; },
    bot(dt, ctx, I) {
      // zum Rohr, aus dem bald ein Stern kommt; Schleim-Rohre meiden
      let target = null;
      for (const it of ctx.items) if (it.kind === 'star') target = it;
      if (!target) { let best = 9; for (const p of ctx.pipes) if (p.warn && p.kind === 'star' && p.warn < best) { best = p.warn; target = p; } }
      let tx = target ? target.x : 0, tz = target ? target.z : 0;
      for (const it of ctx.items) if (it.kind !== 'star' && Math.hypot(it.x - ctx.px, it.z - ctx.pz) < 0.9 && it.o.position.y < 3) { tx = ctx.px + (ctx.px - it.x) * 2; tz = ctx.pz + (ctx.pz - it.z) * 2; }
      const dx = tx - ctx.px, dz = tz - ctx.pz; if (Math.hypot(dx, dz) > 0.1) { I.mx = UL.clamp(dx * 3, -1, 1); I.my = UL.clamp(dz * 3, -1, 1); }
    }
  });
})();

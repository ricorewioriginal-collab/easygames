/* Prüfung: Die Lianen-Rutsche – drei Fahrten an der Seilrutsche, lenken, Beine anziehen, bremsen; Äste und Wespennester meiden */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const RUNS = 3, ARM = 2.0, BRAKE = 9;

  const dims = studio => studio ? { L: 38, y0: 9, y1: 5.6 } : { L: 64, y0: 17, y1: 10 };

  UL.Trials.reg('seilbahn', {
    orbit: true,
    env: (theme) => theme === 'studio' ? { radius: 20 } : { tod: 'day', radius: 30, seed: 99, density: 0.7 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio', D = ctx.D = dims(studio);
      const zA = -D.L / 2, zB = D.L / 2;
      ctx.cy = z => D.y0 + (D.y1 - D.y0) * (z - zA) / D.L;   // Seilhöhe an Stelle z
      // Seil
      const len = Math.hypot(D.L + 6, D.y1 - D.y0);
      const cable = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, len, 6), R.mat(0x3a3a3a)); cable.rotation.x = Math.PI / 2 + Math.atan2(D.y0 - D.y1, D.L); cable.position.set(0, (D.y0 + D.y1) / 2, 0); sc.add(cable);
      // Start- und Zielplattform
      const wood = R.mat(studio ? 0x2a2833 : 0x8a5a32), post = R.mat(studio ? 0x8a8f99 : 0x5a3a1e);
      for (const [z, y, d] of [[zA - 2.2, D.y0 - ARM - 0.25, -1], [zB + 2.4, D.y1 - ARM - 0.25, 1]]) {
        const pl = new T.Mesh(new T.BoxGeometry(5, 0.3, 4.4), wood); pl.position.set(0, y, z); pl.receiveShadow = true; pl.castShadow = true; sc.add(pl);
        const top = ctx.cy(z) + 1.2;
        for (const x of [-2.2, 2.2]) for (const zz of [-1.9, 1.9]) { const p = new T.Mesh(new T.BoxGeometry(0.22, top, 0.22), post); p.position.set(x, top / 2, z + zz); p.castShadow = true; sc.add(p); }
        const beam = new T.Mesh(new T.BoxGeometry(4.8, 0.25, 0.25), post); beam.position.set(0, top, z - d * 1.9); sc.add(beam);
        if (!studio) { const rail = new T.Mesh(new T.BoxGeometry(5, 0.08, 0.08), R.mat(0xd9c08a)); rail.position.set(0, y + 1, z + d * 2.1); sc.add(rail); }
        if (d > 0) { const pad = new T.Mesh(new T.BoxGeometry(3, 2.2, 0.6), R.mat(0xd8402e)); pad.position.set(0, y + 1.25, z + 1.9); sc.add(pad); }
      }
      // Bäume (Dschungel) bzw. Traversen und Polster (Studio) entlang der Strecke
      if (!studio) {
        const list = []; for (let z = zA - 4; z < zB + 6; z += 5.5) for (const s of [-1, 1]) list.push({ x: s * ctx.rng.range(6, 9.5), z: z + ctx.rng.range(-1.5, 1.5), y: 0, ry: ctx.rng.next() * 6 });
        sc.add(A.instanced('ancient_tree_1', list.filter((_, i) => i % 3 === 0), 15, { shadow: true }));
        sc.add(A.instanced('palm2', list.filter((_, i) => i % 3 === 1), 15, { shadow: true }));
        sc.add(A.instanced('tree_palm', list.filter((_, i) => i % 3 === 2), 13, { shadow: true }));
      } else {
        const net = new T.Mesh(new T.BoxGeometry(7, 0.8, D.L + 4), R.mat(0x3a7aff)); net.position.y = 0.4; sc.add(net);
      }
      // Hänge-Gruppe: Drehpunkt an den Händen
      ctx.trolley = new T.Mesh(new T.BoxGeometry(0.3, 0.22, 0.5), R.mat(0xffc000)); sc.add(ctx.trolley);
      ctx.hang = new T.Group(); sc.add(ctx.hang); ctx.hang.add(ctx.player.root); ctx.player.root.position.set(0, -ARM, 0); ctx.player.root.rotation.set(0, 0, 0);
      ctx.items = null; ctx.run = 0; ctx.wait = 0;
      ctx.hostPos.set(-1.4, D.y0 - ARM - 0.1, zA - 3); ctx.hostRy = 0.9;
      ctx.intro = { pos: new T.Vector3(7, D.y0 + 2, zA - 9), look: new T.Vector3(0, D.y0 - 2, zA + 4) };
      UL.Trials.sign(ctx, 0, zA - 4.6, 0).position.y = D.y0 + 0.9;
      this.reset(ctx);
      ctx.cam.position.set(4, D.y0, zA - 6); ctx.cam.lookAt(0, D.y0 - 2, zA);
    },
    start(ctx) { ctx.player.play('raise', { hold: true }); },
    // neue Fahrt: Strecke neu bestücken
    reset(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio', D = ctx.D, zA = -D.L / 2;
      if (ctx.items) { sc.remove(ctx.items); ctx.items.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
      const g = ctx.items = new T.Group(); sc.add(g);
      ctx.obs = []; ctx.starObjs = [];
      const n = Math.round((studio ? 5 : 8) * (0.75 + ctx.k * 0.25)), span = D.L - 14;
      const kinds = ['low', 'side', 'nest'];
      const leaf = R.mat(studio ? 0xff4fa0 : 0x3f8a2a), bark = R.mat(studio ? 0xffd23a : 0x6a4424);
      for (let i = 0; i < n; i++) {
        const z = zA + 7 + (i + 0.5) * span / n + ctx.rng.range(-0.8, 0.8), kind = i === 0 ? 'low' : ctx.rng.pick(kinds), cy = ctx.cy(z);
        const o = { kind, z };
        if (kind === 'low') {
          const b = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, 6, 8), bark); b.rotation.z = Math.PI / 2; b.position.set(0, cy - 1.9, z); g.add(b);
          if (!studio) for (const x of [-1.6, 0.4, 1.9]) { const l = new T.Mesh(new T.IcosahedronGeometry(0.45, 0), leaf); l.position.set(x, cy - 1.75, z); l.scale.y = 0.6; g.add(l); }
        } else if (kind === 'side') {
          o.s = ctx.rng.chance(0.5) ? 1 : -1;
          const b = new T.Mesh(new T.CylinderGeometry(0.14, 0.24, 3.4, 8), bark); b.rotation.z = Math.PI / 2; b.position.set(o.s * 1.9, cy - 1.2, z); g.add(b);
          const l = new T.Mesh(new T.IcosahedronGeometry(0.75, 0), leaf); l.position.set(o.s * 0.85, cy - 1.15, z); l.scale.set(1.0, 0.9, 0.8); g.add(l);
        } else {
          o.x = ctx.rng.pick([-1.1, 0, 1.1]);
          const str = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 1.1, 4), R.mat(0x3a2a1a)); str.position.set(o.x, cy - 0.55, z); g.add(str);
          const nest = new T.Mesh(new T.SphereGeometry(0.38, 10, 8), R.mat(studio ? 0xffd23a : 0xa08050)); nest.scale.y = 1.35; nest.position.set(o.x, cy - 1.3, z); g.add(nest);
          for (const yy of [-0.2, 0.05, 0.3]) { const r = new T.Mesh(new T.TorusGeometry(0.36 - Math.abs(yy) * 0.4, 0.035, 4, 14), R.mat(0x2a1a0a)); r.rotation.x = Math.PI / 2; r.position.set(o.x, cy - 1.3 + yy, z); g.add(r); }
          o.nest = nest;
        }
        ctx.obs.push(o);
      }
      // Sterne zwischen den Hindernissen
      const ns = 5;
      for (let i = 0; i < ns; i++) {
        const z = zA + 9 + (i + 0.5) * (span - 4) / ns + ctx.rng.range(-1, 1);
        if (ctx.obs.some(o => Math.abs(o.z - z) < 1.6)) continue;
        const s = R.star(0.42); s.position.set(ctx.rng.pick([-1.2, 0, 1.2]), ctx.cy(z) - 1.25, z); g.add(s); ctx.starObjs.push(s);
      }
      ctx.z = zA - 0.6; ctx.v = 0; ctx.x = 0; ctx.vx = 0; ctx.legs = 0; ctx.stun = 0; ctx.landed = false;
      this.place(ctx);
    },
    place(ctx) {
      const cy = ctx.cy(ctx.z);
      ctx.trolley.position.set(0, cy - 0.05, ctx.z);
      ctx.hang.position.set(0, cy - 0.15, ctx.z);
      ctx.hang.rotation.set(-ctx.legs * 0.95 + Math.min(0.25, ctx.v * 0.02), 0, -ctx.x / 2.4, 'XZY');
    },
    update(dt, ctx) {
      const I = ctx.inp, D = ctx.D, zB = D.L / 2;
      if (ctx.wait > 0) {   // Pause zwischen den Fahrten
        ctx.wait -= dt;
        if (ctx.wait <= 0) { if (ctx.run >= RUNS) { ctx.end('ende'); return; } this.reset(ctx); UL.UI.banner(`🐒 Fahrt ${ctx.run + 1} von ${RUNS}`, 'Los geht’s!', 1300); UL.Audio.sfx('whoosh'); }
        this.cam(ctx, dt); return;
      }
      // Tempo: rollt von selbst, ○/B bremst
      const vmax = (ctx.theme === 'studio' ? 6.2 : 7.4) * (0.85 + ctx.k * 0.15);
      const brake = I.okD;
      if (brake) ctx.v = Math.max(1.2, ctx.v - BRAKE * dt);
      else ctx.v = Math.min(vmax, ctx.v + 3.2 * dt);
      if (ctx.stun > 0) { ctx.stun -= dt; ctx.v = Math.min(ctx.v, 3); }
      ctx.z += ctx.v * dt;
      // Lenken (Schwung zur Seite) und Beine anziehen
      const ax = ctx.stun > 0 ? 0 : I.mx * 12;
      ctx.vx += (ax - ctx.x * 2.2) * dt; ctx.vx *= Math.pow(0.08, dt); ctx.x = UL.clamp(ctx.x + ctx.vx * dt, -1.6, 1.6);
      ctx.legs = UL.damp(ctx.legs, I.altD ? 1 : 0, 10, dt);
      this.place(ctx);
      // Treffer prüfen
      const cy = ctx.cy(ctx.z), feet = 2.0 * Math.cos(ctx.legs * 0.95);
      if (ctx.stun <= 0) for (const o of ctx.obs) {
        if (Math.abs(o.z - ctx.z) > 0.45) continue;
        let hit = '';
        if (o.kind === 'low' && feet > 1.62) hit = 'Ast an den Beinen! Beine anziehen!';
        else if (o.kind === 'side' && ctx.x * o.s > 0.05) hit = 'Volle Kanne in den Ast!';
        else if (o.kind === 'nest' && Math.abs(ctx.x - o.x) < 0.72) { hit = 'Wespennest! Autsch!'; ctx.stage.parts.burst(o.x, cy - 1.3, o.z, 26, 2.5, 1, [0xffd23a, 0x2a1a0a]); o.nest.visible = false; }
        if (hit) { ctx.stun = 0.7; ctx.bad(hit, o.kind === 'nest' ? 'scream' : 'ugh'); ctx.player.play('hit'); ctx.vx += (Math.random() - 0.5) * 6; break; }
      }
      // Sterne greifen
      const body = new T.Vector3(ctx.x * 0.9, cy - 1.25, ctx.z);
      for (const s of ctx.starObjs) { if (!s.visible) continue; s.rotation.y += dt * 2; if (s.position.distanceTo(body) < 1.0) { s.visible = false; ctx.addStar(s.position); } }
      // Landung
      const left = zB + 0.6 - ctx.z;
      if (left <= 0 && !ctx.landed) {
        ctx.landed = true; ctx.run++;
        if (ctx.v <= 3.6) { UL.UI.toast('Saubere Landung! Bonus-Stern', '🎯', 1500); ctx.addStar(new T.Vector3(0, ctx.cy(zB) - 1, zB)); ctx.player.play('cheer'); }
        else { ctx.bad('Zu schnell! Rums ins Polster.'); ctx.player.play('hit'); R.shake = 0.8; }
        ctx.v = 0; ctx.wait = 1.8;
      }
      // Anzeige
      const warnB = left < 12 && left > 0;
      ctx.meters = [{ label: '💨 Tempo', v: ctx.v / vmax, danger: warnB && ctx.v > 3.6, color: '#5ad1ff' }];
      ctx.extraHud = `<span class="chip">🐒 Fahrt ${Math.min(ctx.run + 1, RUNS)}/${RUNS}</span>${warnB ? `<span class="chip ${ctx.v > 3.6 ? 'warn' : ''}">🛑 Bremsen! ${UL.In.glyph('ok')}</span>` : ''}`;
      if (!ctx.player.one) ctx.player.play('raise', { hold: true });
      this.cam(ctx, dt);
    },
    cam(ctx, dt) {
      const p = ctx.hang.position, port = UL.portrait();
      const want = new T.Vector3(ctx.x * 0.5 + 0.9, p.y - (port ? 0.2 : 0.6), ctx.z - (port ? 5.2 : 4.2));
      ctx.cam.position.lerp(want, 1 - Math.exp(-6 * dt)); ctx.cam.lookAt(ctx.x * 0.3, p.y - 1.5, ctx.z + 5);
    },
    finish(ctx) { const f = ctx.player.root; ctx.scene.attach(f); f.rotation.set(0, Math.PI, 0); f.scale.setScalar(1); f.position.set(0.6, ctx.D.y1 - ARM - 0.1, ctx.D.L / 2 + 2.2); ctx.player.release(); },
    bot(dt, ctx, I) {
      if (ctx.wait > 0) return;
      const zB = ctx.D.L / 2, left = zB + 0.6 - ctx.z;
      if (left < ctx.v * ctx.v / (2 * BRAKE) + 1.2 && ctx.v > 3) I.okD = true;
      let tx = null;
      for (const o of ctx.obs) {
        const d = o.z - ctx.z; if (d < -0.3 || d > 6) continue;
        if (o.kind === 'low' && d < 2.2) I.altD = true;
        if (tx === null && o.kind === 'side') tx = -o.s * 1.3;
        if (tx === null && o.kind === 'nest' && o.nest.visible) tx = o.x > 0 ? -1.3 : o.x < 0 ? 1.3 : (ctx.x >= 0 ? 1.3 : -1.3);
      }
      if (tx === null) { let bd = 1e9; for (const s of ctx.starObjs) if (s.visible) { const d = s.position.z - ctx.z; if (d > 0 && d < bd) { bd = d; tx = s.position.x / 0.9; } } }
      if (tx !== null) I.mx = UL.clamp((tx - ctx.x) * 2 - ctx.vx * 0.6, -1, 1);
    }
  });
})();

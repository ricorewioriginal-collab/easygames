/* Prüfung: Der Wackelsteg – über die Schlucht balancieren, Windböen ausgleichen, über Lücken springen, Sterne an den Seilen greifen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const LEN = 34, H = 6;   // Länge und Höhe des Stegs

  UL.Trials.reg('steg', {
    env: (theme) => theme === 'studio' ? { radius: 20 } : { tod: 'day', radius: 22, ring: true, clear: [{ x: 0, z: 0, r: 4 }], seed: 55, y: -3, density: 0.6 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      const z0 = -LEN / 2;
      // Schlucht: Klippen an beiden Enden, unten Fluss (Dschungel) bzw. Schaumstoff-Becken (Studio)
      if (!studio) {
        const rock = R.mat(0x6a5a48);
        for (const s of [-1, 1]) { const c = new T.Mesh(new T.BoxGeometry(40, H + 4, 10), rock); c.position.set(0, (H - 4) / 2, s * (LEN / 2 + 5)); c.receiveShadow = true; sc.add(c); const top = new T.Mesh(new T.BoxGeometry(40, 0.2, 10), R.mat(0x4f9a3a)); top.position.set(0, H + 0.02, s * (LEN / 2 + 5)); sc.add(top); }
        for (const s of [-1, 1]) { const w = new T.Mesh(new T.BoxGeometry(8, H + 4, LEN + 20), rock); w.position.set(s * 14, (H - 4) / 2, 0); sc.add(w); const top = new T.Mesh(new T.BoxGeometry(8, 0.2, LEN + 20), R.mat(0x4f9a3a)); top.position.set(s * 14, H + 0.02, 0); sc.add(top); }
        const river = R.water(30, LEN + 10, 0x2a8a9a, 0.95); river.position.y = -2.5; ctx.stage.add(river);
        sc.add(A.instanced('palm2', [{ x: -8, z: -LEN / 2 - 3, y: H }, { x: 9, z: -LEN / 2 - 6, y: H }, { x: -9, z: LEN / 2 + 4, y: H }, { x: 7, z: LEN / 2 + 3, y: H }, { x: -12, z: -6, y: H }, { x: 12, z: 4, y: H }, { x: 13, z: -10, y: H }, { x: -13, z: 9, y: H }], 9, { shadow: true }));
      } else {
        const pit = new T.Mesh(new T.BoxGeometry(14, 1, LEN), R.mat(0x3a7aff)); pit.position.set(0, -0.4, 0); sc.add(pit);
        const foam = new T.Group(); for (let i = 0; i < 120; i++) { const b = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.6), R.mat([0xffcf3a, 0x3ad0ff, 0xff4fa0, 0x7cff6a][i % 4])); b.position.set((Math.random() - 0.5) * 13, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * (LEN - 1)); b.rotation.set(Math.random(), Math.random(), 0); foam.add(b); } sc.add(foam);
        for (const s of [-1, 1]) { const tw = new T.Mesh(new T.BoxGeometry(5, H, 4), R.mat(0x2a2833)); tw.position.set(0, H / 2, s * (LEN / 2 + 2)); sc.add(tw); const st = new T.Mesh(new T.BoxGeometry(0.4, H, 0.4), R.mat(0x8a8f99)); }
      }
      // Planken (einige fehlen = Lücken)
      ctx.planks = []; ctx.gaps = [];
      const n = Math.round(LEN / 0.5), pg = new T.BoxGeometry(1.1, 0.08, 0.42), pm = R.mat(studio ? 0xb0b8c4 : 0x9a6a3a), warn = R.mat(0xd8402e);
      const gapEvery = Math.max(7, Math.round(12 / ctx.k));
      for (let i = 0; i < n; i++) {
        const z = z0 + i * 0.5 + 0.25;
        const isGap = i > 6 && i < n - 4 && i % gapEvery === 0;
        if (isGap) { ctx.gaps.push(z); continue; }
        const near = ctx.gaps.length && Math.abs(ctx.gaps[ctx.gaps.length - 1] - z) < 0.6 || (i + 1) % gapEvery === 0 && i > 5 && i < n - 5;
        const p = new T.Mesh(pg, near ? warn : pm); p.position.set(0, H, z); p.castShadow = p.receiveShadow = true; sc.add(p); ctx.planks.push(p);
      }
      // Seile
      const rope = R.mat(0xd9c08a);
      for (const sx of [-0.6, 0.6]) for (const hy of [0.05, 1.0]) { const r = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, LEN, 5), rope); r.rotation.x = Math.PI / 2; r.position.set(sx, H + hy, 0); sc.add(r); }
      for (let z = z0; z <= LEN / 2; z += 2.5) for (const sx of [-0.6, 0.6]) { const v = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1, 4), rope); v.position.set(sx, H + 0.5, z); sc.add(v); }
      // Sterne an Seilen links/rechts
      ctx.starObjs = [];
      for (let i = 0; i < ctx.max; i++) {
        const z = z0 + 4 + (i + 0.5) * (LEN - 7) / ctx.max, side = i % 2 ? 1 : -1;
        const s = R.star(0.4); s.position.set(side * 1.05, H + 1.2, z); s.userData.side = side; sc.add(s); ctx.starObjs.push(s);
        const line = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 1.2, 4), rope); line.position.set(side * 1.05, H + 1.8, z); sc.add(line);
      }
      ctx.z = z0 + 1; ctx.lean = 0; ctx.leanV = 0; ctx.wind = 0; ctx.windT = 2; ctx.jump = 0; ctx.fall = 0; ctx.check = ctx.z; ctx.reach = 0;
      ctx.player.root.position.set(0, H, ctx.z);
      ctx.hostPos.set(-2.2, H, z0 - 1.5); ctx.hostRy = 0.6;
      if (!studio) { const deck = new T.Mesh(new T.BoxGeometry(8, 0.3, 4), R.mat(0x8a5a32)); deck.position.set(0, H - 0.15, z0 - 2); sc.add(deck); const deck2 = deck.clone(); deck2.position.z = LEN / 2 + 2; sc.add(deck2); }
      ctx.intro = { pos: new T.Vector3(6, H + 4, z0 - 4), look: new T.Vector3(0, H, 0) };
      ctx.cam.position.set(0, H + 2.5, z0 - 4); ctx.cam.lookAt(0, H, 0);
      ctx.windArrow = document.createElement('div'); ctx.windArrow.className = 'tint'; document.getElementById('ui').prepend(ctx.windArrow);
    },
    start(ctx) { ctx.player.root.rotation.y = 0; },
    update(dt, ctx) {
      const I = ctx.inp, fig = ctx.player;
      if (ctx.fall > 0) {   // ins Netz/Becken gefallen → zurück zum letzten Halt
        ctx.fall -= dt; fig.root.position.y -= dt * 9; fig.root.rotation.z += dt * 3;
        if (ctx.fall <= 0) { ctx.z = ctx.check; ctx.lean = 0; ctx.leanV = 0; fig.root.rotation.z = 0; fig.release(); }
        Tcam(ctx, dt); return;
      }
      // Wind: Böen von links/rechts, angekündigt durch Blätter-Pfeil
      ctx.windT -= dt; if (ctx.windT <= 0) { ctx.windT = UL.lerp(2.5, 1.2, (ctx.k - 0.75) / 0.55) + Math.random() * 2; ctx.wind = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.8) * ctx.k; }
      ctx.wind *= Math.pow(0.6, dt);
      // Balance: Schwanken + Wind, ausgleichen mit links/rechts
      ctx.leanV += (ctx.wind * 1.4 + ctx.lean * 1.6 + (Math.random() - 0.5) * 0.8) * dt;
      ctx.leanV += I.mx * 3.6 * dt;
      ctx.leanV *= Math.pow(0.4, dt);
      ctx.lean += ctx.leanV * dt;
      // Vorwärts
      const fwd = Math.max(0, -I.my), sp = 1.9 * (1 - Math.min(0.7, Math.abs(ctx.lean) * 0.6));
      ctx.z += fwd * sp * dt;
      ctx.lean += fwd * (Math.random() - 0.5) * 0.25 * dt;
      // Springen
      if (I.alt && ctx.jump <= 0) { ctx.jump = 0.7; fig.play('jump'); UL.Audio.sfx('jump'); }
      if (ctx.jump > 0) { ctx.jump -= dt; ctx.z += 1.2 * dt; }
      const jy = ctx.jump > 0 ? Math.sin((0.7 - ctx.jump) / 0.7 * Math.PI) * 0.6 : 0;
      // Lücke ohne Sprung → Absturz
      if (ctx.jump <= 0) for (const gz of ctx.gaps) if (Math.abs(ctx.z - gz) < 0.18) { this.fall(ctx, 'Lücke übersehen!'); return; }
      if (Math.abs(ctx.lean) > 1) { this.fall(ctx, 'Abgestürzt!'); return; }
      // Halt merken (alle paar Meter)
      if (ctx.z - ctx.check > 5 && Math.abs(ctx.lean) < 0.4 && ctx.jump <= 0) ctx.check = ctx.z;
      // Sterne greifen (zur Seite lehnen hilft)
      if (I.ok && ctx.reach <= 0) { ctx.reach = 0.5; fig.play('pickup', { speed: 1.6 }); }
      if (ctx.reach > 0) {
        ctx.reach -= dt;
        for (const s of ctx.starObjs) if (s.visible && Math.abs(s.position.z - ctx.z) < 0.9) { s.visible = false; ctx.addStar(s.position); ctx.leanV += s.userData.side * 0.6; }
      }
      for (const s of ctx.starObjs) if (s.visible) { s.rotation.y += dt * 1.6; s.position.y = H + 1.2 + Math.sin(ctx.t * 2 + s.position.z) * 0.08; }
      if (ctx.z >= LEN / 2 - 0.5) { ctx.end('ziel'); }
      // Figur
      fig.root.position.set(ctx.lean * 0.25, H + jy, ctx.z);
      fig.root.rotation.z = -ctx.lean * 0.5; fig.root.rotation.y = 0;
      if (ctx.jump <= 0 && !fig.one) fig.move(fwd * sp);
      ctx.windArrow.style.background = Math.abs(ctx.wind) > 0.4 ? `linear-gradient(${ctx.wind > 0 ? 90 : 270}deg, rgba(255,255,255,.18), transparent 30%)` : 'transparent';
      ctx.meters = [{ label: '⚖️ Gleichgewicht', v: 1 - Math.abs(ctx.lean), danger: Math.abs(ctx.lean) > 0.65 }, { label: '🏁 Strecke', v: (ctx.z + LEN / 2) / LEN, color: '#5ad1ff' }];
      ctx.extraHud = Math.abs(ctx.wind) > 0.4 ? `<span class="chip warn">💨 Wind von ${ctx.wind > 0 ? 'links' : 'rechts'}!</span>` : '';
      Tcam(ctx, dt);
    },
    fall(ctx, txt) { ctx.fall = 1.4; ctx.bad(txt + ' Zurück zum letzten Halt.', 'scream'); ctx.player.play('faint', { hold: true }); UL.Audio.sfx('whoosh'); },
    finish(ctx) { if (ctx.windArrow) ctx.windArrow.remove(); const f = ctx.player.root; f.rotation.z = 0; f.rotation.y = Math.PI; f.position.set(-0.8, H, -LEN / 2 - 1.2); ctx.player.release(); },
    bot(dt, ctx, I) {
      I.mx = UL.clamp(-ctx.lean * 2.2 - ctx.leanV * 1.2 - ctx.wind * 0.5, -1, 1);
      if (Math.abs(ctx.lean) < 0.45) I.my = -1;
      for (const gz of ctx.gaps) if (gz - ctx.z > 0.25 && gz - ctx.z < 0.75) I.alt = true;
      for (const s of ctx.starObjs) if (s.visible && Math.abs(s.position.z - ctx.z) < 0.5) I.ok = true;
    }
  });
  function Tcam(ctx, dt) {
    const p = ctx.player.root.position;
    const want = new T.Vector3(p.x * 0.4 + 0.8, H + 2.4, p.z - 4.2);
    ctx.cam.position.lerp(want, 1 - Math.exp(-5 * dt)); ctx.cam.lookAt(p.x * 0.5, H + 0.9, p.z + 3);
  }
})();

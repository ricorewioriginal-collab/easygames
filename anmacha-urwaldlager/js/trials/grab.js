/* Prüfung: Das Madengrab – in einer Kiste unter der Erde liegen, Maden und Kakerlaken rieseln herein; Schrauben am Deckel aufdrehen, hinter jeder steckt ein Stern */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const LW = 0.85, LL = 2.3, DY = -0.2, TURNS = 2.2;   // halbe Breite/Länge der Kiste, Deckelhöhe, Umdrehungen je Schraube

  UL.Trials.reg('grab', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'evening', radius: 14, clear: [{ x: 0, z: 0, r: 5 }], seed: 77 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Grube mit Holzkiste, Plexiglas-Deckel, Erdhaufen
      const dirt = R.mat(studio ? 0x2a2833 : 0x4a3420), wood = R.mat(studio ? 0x8a8f99 : 0x6a4626);
      const pit = new T.Mesh(new T.BoxGeometry(LW * 2 + 0.4, 0.05, LL * 2 + 0.4), R.mat(0x1a120a)); pit.position.y = DY - 1.0; sc.add(pit);
      for (const [x, z, w, d] of [[0, -LL - 0.1, LW * 2 + 0.4, 0.2], [0, LL + 0.1, LW * 2 + 0.4, 0.2], [-LW - 0.1, 0, 0.2, LL * 2 + 0.4], [LW + 0.1, 0, 0.2, LL * 2 + 0.4]]) { const s = new T.Mesh(new T.BoxGeometry(w, 1.0, d), wood); s.position.set(x, DY - 0.5, z); sc.add(s); }
      const lid = new T.Mesh(new T.PlaneGeometry(LW * 2, LL * 2), new T.MeshLambertMaterial({ color: 0xcfefff, transparent: true, opacity: 0.1, depthWrite: false })); lid.rotation.x = -Math.PI / 2; lid.position.y = DY + 0.01; sc.add(lid);
      for (let i = 0; i < 10; i++) { const m = new T.Mesh(new T.SphereGeometry(UL.rand(0.5, 1.1), 8, 6), dirt); m.scale.y = 0.4; const a = i / 10 * Math.PI * 2; m.position.set(Math.cos(a) * 2.4 * (1 + (i % 2) * 0.3), 0, Math.sin(a) * 3.2); sc.add(m); }
      const ground = new T.Mesh(new T.RingGeometry(1, 5, 24), dirt); ground.rotation.x = -Math.PI / 2; ground.scale.set(1.1, 1.6, 1); ground.position.y = 0.005; sc.add(ground);
      // Trichter/Rohre, aus denen Tiere kommen
      ctx.chutes = [[-1, -1.3], [1, 0.1], [-1, 1.4]].map(([sd, z]) => { const c = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.9, 8), R.mat(0x3a7a3a)); c.position.set(sd * (LW + 0.35), DY + 0.3, z); c.rotation.z = sd * 0.7; sc.add(c); return { x: sd * (LW - 0.12), z }; });
      const inner = new T.PointLight(R.lin(0xffe6b0), 0.9, 4); inner.position.set(0, DY - 0.3, 0.3); sc.add(inner);
      // Promi liegt in der Kiste
      const fig = ctx.player; fig.root.position.set(0, DY - 0.92, 0.25); fig.root.rotation.set(-Math.PI / 2, 0, 0);
      // Schrauben rund um den Deckel (von innen)
      ctx.bolts = [];
      const nb = ctx.max;
      for (let i = 0; i < nb; i++) {
        const side = i % 2 ? 1 : -1, z = -LL + 0.45 + Math.floor(i / 2) * ((LL * 2 - 0.9) / Math.max(1, Math.ceil(nb / 2) - 1));
        const g = new T.Group(); g.position.set(side * (LW - 0.16), DY - 0.06, z); sc.add(g);
        const plate = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.02, 12), R.mat(0x9a9aa0)); g.add(plate);
        const head = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.08, 6), R.mat(0xc0c0c8)); head.position.y = -0.05; g.add(head);
        const slot = new T.Mesh(new T.BoxGeometry(0.1, 0.015, 0.02), R.mat(0x222222)); slot.position.y = -0.095; head.add(slot);
        const star = R.star(0.12); star.position.set(-side * 0.18, -0.06, 0); star.rotation.x = Math.PI / 2; g.add(star);
        const num = R.sign([String(i + 1)], 0.16, 0.16, { bg: '#ffd23a', fg: '#1a1a1a', w: 64, h: 64, font: '900 44px system-ui' }); num.rotation.x = -Math.PI / 2; num.position.set(side * 0.2, 0.02, 0); g.add(num);
        ctx.bolts.push({ g, head, star, num, turn: 0, done: false });
      }
      // Gekrabbel
      ctx.bugs = UL.Trials.bugs(sc, 70, 0x24120a);
      ctx.bugs.list.forEach(b => { b.on = false; b.s = 0.0001; b.y = -9; });
      const wg = new T.SphereGeometry(0.5, 6, 4); wg.scale(0.3, 0.3, 1.7);
      ctx.wm = new T.InstancedMesh(wg, new T.MeshLambertMaterial({ color: R.lin(0xe0c080) }), 260); sc.add(ctx.wm);
      ctx.wl = []; for (let i = 0; i < 260; i++) ctx.wl.push({ on: false, x: 0, y: -9, z: 0, r: 0, ph: Math.random() * 6 });
      ctx.cur = 0; ctx.panic = 0.1; ctx.prevA = null; ctx.stun = 0; ctx.loadT = 2.5; ctx.fill = 0;
      ctx.hostPos.set(-2.4, 0, -2.8); ctx.hostRy = 0.7;
      ctx.intro = { pos: new T.Vector3(2.5, 3.5, 3.5), look: new T.Vector3(0, DY - 0.6, 0) };
      UL.Trials.sign(ctx, 0, -4.2, 0);
      ctx.cam.position.set(0, 2.6, 2.6); ctx.cam.lookAt(0, DY - 0.6, 0);
    },
    start(ctx) { this.load(ctx); },
    load(ctx) {
      const c = UL.pick(ctx.chutes), prog = 1 - ctx.time / ctx.timeMax;
      let nb = 6 + Math.round(prog * 8), nw = 26 + Math.round(prog * 30);
      for (const b of ctx.bugs.list) { if (!nb) break; if (b.on) continue; b.on = true; b.x = c.x + UL.rand(-0.1, 0.1); b.z = c.z + UL.rand(-0.1, 0.1); b.y = DY - 0.05; b.vy = 0; b.s = UL.rand(0.05, 0.075); b.r = Math.random() * 6; b.sp = UL.rand(0.15, 0.35); nb--; }
      for (const w of ctx.wl) { if (!nw) break; if (w.on) continue; w.on = true; w.x = c.x + UL.rand(-0.15, 0.15); w.z = c.z + UL.rand(-0.15, 0.15); w.y = DY - 0.05; w.vy = 0; w.r = Math.random() * 6; nw--; }
      ctx.stage.parts.burst(c.x, DY - 0.05, c.z, 24, 0.5, -0.5, [0xe0c080, 0x24120a, 0x3a2412]);
      UL.Audio.sfx('slime'); UL.Trials.crawl(6, ['maggot', 'maggot', 'roach', 'spider'], 3);
      ctx.panic = Math.min(1, ctx.panic + 0.1);
      if (ctx.t > 1) ctx.bad(UL.pick(['Maden im Gesicht!', 'Die krabbeln überall!', 'Nachschub kommt!']), UL.pick(['scream', 'yuck']));
    },
    update(dt, ctx) {
      const I = ctx.inp, prog = 1 - ctx.time / ctx.timeMax, t = ctx.t;
      ctx.loadT -= dt; if (ctx.loadT <= 0) { ctx.loadT = UL.lerp(7, 3.8, prog) / ctx.k; this.load(ctx); }
      // Tiere fallen und krabbeln in der Kiste
      const bottom = DY - 0.95;
      let nw = 0;
      for (const w of ctx.wl) if (w.on) nw++;
      ctx.fill = Math.min(0.5, nw * 0.0019);
      ctx.bugs.list.forEach(b => {
        if (!b.on) return;
        if (b.vy !== undefined) { b.vy -= 6 * dt; b.y += b.vy * dt; if (b.y <= bottom + ctx.fill) { b.y = bottom + ctx.fill; b.vy = undefined; } return; }
        b.r += (Math.random() - 0.5) * 5 * dt; b.x += Math.sin(b.r) * b.sp * dt; b.z += Math.cos(b.r) * b.sp * dt;
        if (Math.abs(b.x) > LW - 0.05) { b.x = Math.sign(b.x) * (LW - 0.05); b.r += Math.PI; } if (Math.abs(b.z) > LL - 0.05) { b.z = Math.sign(b.z) * (LL - 0.05); b.r += Math.PI; }
        b.y = bottom + ctx.fill + 0.05 + (Math.abs(b.x) < 0.35 && b.z > -1.6 ? 0.3 : 0);
      });
      ctx.bugs.sync();
      const M = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), V = new T.Vector3(), P = new T.Vector3();
      ctx.wl.forEach((w, i) => {
        if (w.on) {
          if (w.vy !== undefined) { w.vy -= 6 * dt; w.y += w.vy * dt; const fy = bottom + Math.random() * ctx.fill + (Math.abs(w.x) < 0.35 && w.z > -1.6 ? 0.28 : 0); if (w.y <= fy) { w.y = fy; w.vy = undefined; } }
          else { w.r += Math.sin(t * 2 + w.ph) * dt * 2; w.x = UL.clamp(w.x + Math.sin(w.r) * 0.03 * dt, -LW + 0.04, LW - 0.04); w.z = UL.clamp(w.z + Math.cos(w.r) * 0.03 * dt, -LL + 0.04, LL - 0.04); }
        }
        E.set(Math.sin(t * 6 + w.ph) * 0.4, w.r, 0); Q.setFromEuler(E); V.setScalar(w.on ? 0.045 : 0.0001); P.set(w.x, w.y, w.z); M.compose(P, Q, V); ctx.wm.setMatrixAt(i, M);
      });
      ctx.wm.instanceMatrix.needsUpdate = true;
      // Panik
      const calm = I.altD && ctx.stun <= 0;
      ctx.panic += (0.012 + nw * 0.00009 + ctx.bugs.list.filter(b => b.on).length * 0.0004) * ctx.k * dt;
      if (calm) ctx.panic -= 0.32 * dt;
      ctx.panic = UL.clamp(ctx.panic, 0, 1);
      if (Math.random() < dt * (0.2 + ctx.panic * 0.8)) UL.Trials.crawl(1, ['maggot', 'roach'], 1.5);
      if (ctx.panic >= 1 && ctx.stun <= 0) { ctx.stun = 2; ctx.panic = 0.5; R.shake = 1; ctx.bad('PANIK im Grab!', 'scream'); const b = ctx.bolts[ctx.cur]; if (b) b.turn = Math.max(0, b.turn - 0.6); }
      if (ctx.stun > 0) ctx.stun -= dt;
      ctx.player.root.rotation.z = ctx.stun > 0 ? Math.sin(t * 25) * 0.08 : 0;
      // Schraube aufdrehen: Stick im Kreis drehen (oder Aktion tippen)
      const b = ctx.bolts[ctx.cur];
      if (b && ctx.stun <= 0 && !calm) {
        const m = Math.hypot(I.mx, I.my);
        if (m > 0.55) { const a = Math.atan2(I.my, I.mx); if (ctx.prevA !== null) { let d = a - ctx.prevA; d = Math.atan2(Math.sin(d), Math.cos(d)); b.turn += Math.abs(d) / (Math.PI * 2) * (ctx.fill > 0.3 ? 0.8 : 1); } ctx.prevA = a; } else ctx.prevA = null;
        if (I.ok) b.turn += 0.07;
        b.head.rotation.y = b.turn * Math.PI * 2; b.head.position.y = -0.05 - b.turn / TURNS * 0.12;
        if (Math.random() < dt * 4 && m > 0.55) UL.Audio.sfx('tick');
        if (b.turn >= TURNS) { b.done = true; b.head.visible = false; b.star.visible = false; b.num.visible = false; ctx.addStar(b.g.position.clone()); ctx.player.play('cheer', { speed: 1.4 }); ctx.cur++; ctx.prevA = null; }
      } else ctx.prevA = null;
      ctx.bolts.forEach((x, i) => { if (!x.done) x.num.scale.setScalar(i === ctx.cur ? 1.25 + Math.sin(t * 8) * 0.12 : 0.8); });
      if (ctx.cur >= ctx.bolts.length) { ctx.end('alle'); return; }
      ctx.meters = [{ label: '😱 Panik', v: ctx.panic, danger: ctx.panic > 0.75, color: ctx.panic > 0.75 ? '#ff4a4a' : '#ffb03a' }, { label: '🔩 Schraube ' + (ctx.cur + 1), v: b ? b.turn / TURNS : 0, color: '#ffd23a' }];
      ctx.extraHud = `<span class="chip">🐛 ${nw} Maden</span>`;
      ctx.overlay(`<div class="lbl">${ctx.stun > 0 ? '😱 PANIK …' : calm ? '😮‍💨 Augen zu, ruhig atmen …' : '🔄 Stick im Kreis drehen (oder Aktion tippen): Schraube ' + (ctx.cur + 1) + ' aufdrehen'}</div>`);
      // Kamera: von oben durch den Deckel, leicht schwankend
      const port = UL.portrait();
      ctx.cam.position.set(Math.sin(t * 0.3) * 0.15, port ? 4.6 : 3.3, port ? 1.2 : 1.6); ctx.cam.lookAt(0, DY - 0.8, b ? b.g.position.z * 0.25 : 0);
    },
    finish(ctx) { ctx.player.root.rotation.set(0, 0, 0); ctx.player.root.position.set(0.9, 0, 1.4); },
    bot(dt, ctx, I) {
      if (ctx.panic > 0.8) { I.altD = true; return; }
      const a = ctx.t * 7; I.mx = Math.cos(a); I.my = Math.sin(a);
    }
  });
})();

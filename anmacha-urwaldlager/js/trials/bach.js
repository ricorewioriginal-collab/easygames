/* Prüfung: Der Sternen-Bach – durchs Wasser waten, Schaumstoff-Sterne ins Netz bringen, riesigen rollenden Bällen ausweichen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const HW = 3.2, ZT = -10, ZB = 7.5, NET = 6.2;   // halbe Breite, oberes/unteres Ende, Netz-Linie

  UL.Trials.reg('bach', {
    orbit: true, relMove: true,
    env: (theme) => theme === 'studio' ? { radius: 17 } : { tod: 'day', radius: 18, clear: [{ x: 0, z: -8, r: 6 }, { x: 0, z: -2, r: 6 }, { x: 0, z: 4, r: 6 }, { x: 0, z: 9, r: 5 }], seed: 91 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio', L = ZB - ZT + 4;
      // Bachbett, Ufer, Wasser
      const bed = new T.Mesh(new T.PlaneGeometry(HW * 2 + 0.4, L), R.mat(studio ? 0x2a5a7a : 0x6a5a3a)); bed.rotation.x = -Math.PI / 2; bed.position.set(0, -0.15, (ZT + ZB) / 2); sc.add(bed);
      for (const s of [-1, 1]) {
        const bank = new T.Mesh(new T.BoxGeometry(1.2, 1.2, L), R.mat(studio ? 0xdfe6ee : 0x5a4a2e)); bank.position.set(s * (HW + 0.6), 0.1, (ZT + ZB) / 2); bank.receiveShadow = true; sc.add(bank);
        if (!studio) for (let i = 0; i < 9; i++) { const r = A.sized(i % 2 ? 'rock_medium_1' : 'rock_big_2', 0.7 + (i % 3) * 0.35); r.position.set(s * (HW + 0.9 + (i % 2) * 0.6), 0.6, ZT + i * L / 9); r.rotation.y = i; sc.add(r); }
        else for (let i = 0; i < 6; i++) { const l = new T.Mesh(new T.BoxGeometry(0.12, 0.12, 2), new T.MeshBasicMaterial({ color: R.lin(i % 2 ? 0x2a8cff : 0xff3a8c) })); l.position.set(s * (HW + 0.05), 0.42, ZT + 1 + i * 3); sc.add(l); }
      }
      const water = R.water(HW * 2 + 0.3, L, studio ? 0x2aa8c8 : 0x4a8a7a, 0.8); water.position.set(0, 0.3, (ZT + ZB) / 2); ctx.stage.add(water);
      // Rampe oben, aus der die Bälle kommen
      const ramp = new T.Mesh(new T.BoxGeometry(HW * 2 + 1.2, 1.6, 2.6), R.mat(studio ? 0x8a8f99 : 0x5a3a1e)); ramp.position.set(0, 0.6, ZT - 2.2); ramp.rotation.x = -0.35; sc.add(ramp);
      const gate = new T.Mesh(new T.BoxGeometry(HW * 2 + 1.6, 0.25, 0.25), R.mat(0xd8342a)); gate.position.set(0, 2.6, ZT - 1); sc.add(gate);
      for (const s of [-1, 1]) { const p = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 2.8, 8), R.mat(0xf2f2f2)); p.position.set(s * (HW + 0.8), 1.3, ZT - 1); sc.add(p); }
      // Ballvorrat am Rand der Rampe (Kulisse)
      const bc = [0xdedad0, 0x8ad0e0, 0xdedad0, 0x9a9a8a];
      for (let i = 0; i < 12; i++) { const b = new T.Mesh(new T.SphereGeometry(0.6, 14, 10), R.mat(bc[i % 4])); b.position.set(-HW + (i % 6) * 1.25, 1.6 + Math.floor(i / 6) * 0.9, ZT - 3.4 - Math.floor(i / 6) * 0.6); sc.add(b); }
      // Netz unten (Ziel)
      const net = new T.Mesh(new T.PlaneGeometry(HW * 2, 1.2, 12, 4), new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })); net.position.set(0, 0.6, NET + 0.9); sc.add(net);
      const line = new T.Mesh(new T.PlaneGeometry(HW * 2, 0.15), new T.MeshBasicMaterial({ color: R.lin(0xffd23a) })); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.33, NET); sc.add(line);
      ctx.basket = A.sized('crate', 0.8); ctx.basket.position.set(HW + 1.3, 0.7, NET + 0.6); sc.add(ctx.basket);
      // Wassersprenger an den Ufern
      ctx.spr = [-1, 1].flatMap(s => [ZT + 3, ZT + 9, ZT + 14].map(z => ({ x: s * (HW + 0.7), z })));
      ctx.spr.forEach(p => { const m = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 1.2, 6), R.mat(0x6a6a6a)); m.position.set(p.x, 0.6, p.z); sc.add(m); });
      // Sterne im Wasser verteilt
      ctx.starObjs = [];
      const n = ctx.max + 3;
      for (let i = 0; i < n; i++) { const s = R.star(0.36); s.position.set(ctx.rng.range(-HW + 0.6, HW - 0.6), 0.55, ctx.rng.range(ZT + 1, NET - 3)); s.rotation.x = -Math.PI / 2 + 0.3; sc.add(s); ctx.starObjs.push(s); }
      ctx.balls = []; ctx.ballT = 2.2; ctx.carry = null; ctx.stun = 0; ctx.dash = 0; ctx.dashCD = 0;
      ctx.pos = new T.Vector3(0, 0, NET + 0.4); ctx.vel = new T.Vector3();
      ctx.player.root.position.copy(ctx.pos); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(HW + 2.4, 0.4, NET + 1.6); ctx.hostRy = -2.2;
      ctx.intro = { pos: new T.Vector3(5, 6, NET + 7), look: new T.Vector3(0, 0, ZT + 3) };
      UL.Trials.sign(ctx, -HW - 2.4, NET + 0.8, 0.9);
      ctx.cam.position.set(0, 6, NET + 7); ctx.cam.lookAt(0, 0, 0);
    },
    start(ctx) { ctx.player.set('walk'); },
    spawnBall(ctx) {
      const r = UL.rand(0.75, 1.1) * (ctx.k > 1.1 ? 1.08 : 1), sp = UL.rand(3.6, 5.2) * (0.85 + ctx.k * 0.2) * (1 + (1 - ctx.time / ctx.timeMax) * 0.35);
      const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), R.mat(UL.pick([0xdedad0, 0x8ad0e0, 0xe8e4da, 0x9aa88a])));
      m.castShadow = true;
      // mal gezielt auf den Spieler, mal zufällig
      const x = UL.clamp(Math.random() < 0.45 ? ctx.pos.x + UL.rand(-0.6, 0.6) : UL.rand(-HW + r, HW - r), -HW + r, HW - r);
      m.position.set(x, r + 1.2, ZT - 1.5); ctx.scene.add(m);
      ctx.balls.push({ m, r, vz: sp, vx: UL.rand(-0.5, 0.5), vy: 0 });
      UL.Audio.sfx('drum');
    },
    update(dt, ctx) {
      const I = ctx.inp, fig = ctx.player, p = ctx.pos;
      // Bälle
      ctx.ballT -= dt;
      if (ctx.ballT <= 0) { const prog = 1 - ctx.time / ctx.timeMax; ctx.ballT = UL.lerp(1.9, 0.9, prog) / ctx.k; this.spawnBall(ctx); if (prog > 0.55 && Math.random() < 0.35) this.spawnBall(ctx); }
      for (let i = ctx.balls.length - 1; i >= 0; i--) {
        const b = ctx.balls[i], m = b.m;
        b.vy -= 14 * dt; m.position.y += b.vy * dt; if (m.position.y < b.r - 0.1) { m.position.y = b.r - 0.1; if (b.vy < -3) { ctx.stage.parts.burst(m.position.x, 0.4, m.position.z, 10, 2, 2, [0xcfefff, 0xffffff]); } b.vy = Math.abs(b.vy) * 0.3; }
        m.position.z += b.vz * dt; m.position.x += b.vx * dt;
        if (Math.abs(m.position.x) > HW - b.r) { b.vx = -b.vx; m.position.x = Math.sign(m.position.x) * (HW - b.r); }
        m.rotation.x += b.vz / b.r * dt;
        if (Math.random() < dt * 8) ctx.stage.parts.burst(m.position.x, 0.35, m.position.z + b.r * 0.6, 2, 1, 1.5, [0xdff6ff]);
        // Treffer
        const dx = m.position.x - p.x, dz = m.position.z - p.z;
        if (ctx.stun <= 0 && ctx.dash <= 0 && Math.hypot(dx, dz) < b.r + 0.35 && m.position.y < b.r + 0.6) {
          ctx.stun = 1.3; ctx.vel.set(-dx * 3, 0, 5); fig.play('hit');
          ctx.stage.parts.burst(p.x, 0.6, p.z, 30, 3, 3, [0xcfefff, 0xffffff, 0x9adfff]); UL.Audio.sfx('splash');
          if (ctx.carry) { const s = ctx.carry; ctx.carry = null; s.position.set(UL.clamp(p.x + UL.rand(-1, 1), -HW + 0.5, HW - 0.5), 0.55, Math.max(ZT + 1, p.z - UL.rand(2, 4))); s.rotation.set(-Math.PI / 2 + 0.3, 0, 0); ctx.bad('Ball-Treffer – Stern weg!', 'scream'); }
          else ctx.bad('Volltreffer!', 'ugh');
        }
        if (m.position.z > ZB + 3) { ctx.scene.remove(m); ctx.balls.splice(i, 1); }
      }
      // Spieler: Waten (langsam im Wasser), Hechtsprung
      if (ctx.dashCD > 0) ctx.dashCD -= dt;
      if (ctx.stun > 0) { ctx.stun -= dt; p.addScaledVector(ctx.vel, dt); ctx.vel.multiplyScalar(Math.pow(0.05, dt)); }
      else {
        const sp = ctx.carry ? 2.3 : 2.7;
        const want = new T.Vector3(I.mx, 0, I.my); if (want.length() > 1) want.normalize();
        if (ctx.dash > 0) { ctx.dash -= dt; p.addScaledVector(ctx.vel, dt); }
        else {
          p.x += want.x * sp * dt; p.z += want.z * sp * dt;
          if (I.ok && ctx.dashCD <= 0) { const d = want.length() > 0.2 ? want.clone().normalize() : new T.Vector3(p.x > 0 ? -1 : 1, 0, 0); ctx.vel.copy(d.multiplyScalar(7)); ctx.dash = 0.32; ctx.dashCD = 0.9; fig.play('jump', { speed: 1.6 }); UL.Audio.sfx('splash'); ctx.stage.parts.burst(p.x, 0.3, p.z, 16, 2.5, 2.5, [0xdff6ff, 0xffffff]); }
          if (want.length() > 0.1) fig.root.rotation.y = UL.angDamp(fig.root.rotation.y, Math.atan2(want.x, want.z), 10, dt);
        }
        if (!fig.one) fig.move(want.length() * sp);
      }
      p.x = UL.clamp(p.x, -HW + 0.35, HW - 0.35); p.z = UL.clamp(p.z, ZT + 0.5, ZB);
      fig.root.position.set(p.x, -0.12 + (ctx.dash > 0 ? 0.25 : 0), p.z);
      // Sterne aufheben (einer zur Zeit) und ins Netz bringen
      if (!ctx.carry) {
        for (const s of ctx.starObjs) if (s.visible && s !== ctx.carry && s.position.z < NET - 0.3 && Math.hypot(s.position.x - p.x, s.position.z - p.z) < 0.75) { ctx.carry = s; UL.Audio.sfx('pick'); fig.play('pickup', { speed: 1.8 }); break; }
      }
      if (ctx.carry) {
        ctx.carry.position.set(p.x, 1.45, p.z); ctx.carry.rotation.set(0, ctx.t * 2, 0);
        if (p.z > NET) { const s = ctx.carry; ctx.carry = null; s.visible = false; ctx.addStar(new T.Vector3(p.x, 1.2, p.z)); fig.play('cheer', { speed: 1.4 }); }
      }
      for (const s of ctx.starObjs) if (s.visible && s !== ctx.carry) s.position.y = 0.5 + Math.sin(ctx.t * 2 + s.position.x * 3) * 0.04;
      // Wassersprenger
      for (const sp of ctx.spr) if (Math.random() < dt * 6) ctx.stage.parts.burst(sp.x, 1.2, sp.z, 4, 2.2, 3, [0xdff6ff, 0xffffff]);
      const left = ctx.starObjs.filter(s => s.visible).length;
      if (left + ctx.stars < ctx.max && !ctx.carry) ctx.end('leer');
      ctx.extraHud = `<span class="chip">${ctx.carry ? '⭐ Stern in der Hand – ab zum Netz!' : '🌊 Sterne im Bach: ' + left}</span>`;
      // Kamera hinter dem Spieler, Blick bachaufwärts
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(p.x * 0.5, port ? 5.2 : 3.4, p.z + (port ? 8 : 6.2)), 1 - Math.exp(-4 * dt));
      ctx.cam.lookAt(p.x * 0.6, 0.6, p.z - 5);
    },
    finish(ctx) { ctx.player.root.position.y = 0; },
    bot(dt, ctx, I) {
      const p = ctx.pos;
      let tx, tz;
      if (ctx.carry) { tx = p.x; tz = NET + 0.6; }
      else { let best = null, bd = 99; for (const s of ctx.starObjs) if (s.visible) { const d = Math.hypot(s.position.x - p.x, s.position.z - p.z); if (d < bd) { bd = d; best = s; } } if (best) { tx = best.position.x; tz = best.position.z; } else { tx = 0; tz = NET; } }
      let mx = tx - p.x, mz = tz - p.z; const l = Math.hypot(mx, mz) || 1; mx /= l; mz /= l;
      // ausweichen
      for (const b of ctx.balls) { const dz = p.z - b.m.position.z, dx = p.x - b.m.position.x; if (dz > -0.5 && dz < 3.2 && Math.abs(dx) < b.r + 0.6) { mx = dx >= 0 ? (p.x < HW - 0.8 ? 1 : -1) : (p.x > -HW + 0.8 ? -1 : 1); mz = 0; if (dz < 1.6) I.ok = true; } }
      I.mx = mx; I.my = mz;
    }
  });
})();

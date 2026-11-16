/* Prüfung: Das Schlammbecken – tauchen, Sterne vom Grund holen, Luft einteilen, Aalen ausweichen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const RAD = 8, DEPTH = 4.2, WY = 0;   // Becken: Radius, Tiefe, Wasserhöhe

  UL.Trials.reg('tauchen', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'day', radius: 16, clear: [{ x: 0, z: 0, r: 11 }], water: { x: 0, z: 0, r: RAD }, seed: 44 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Becken: Boden und Wand, darüber Wasser; im Studio ein Glas-Tank auf der Bühne
      const pit = new T.Group(); sc.add(pit);
      const floorM = R.mat(studio ? 0x2a4a5a : 0x4a3a22), wallM = new T.MeshLambertMaterial({ color: R.lin(studio ? 0x3a6a7a : 0x5a4628), side: T.DoubleSide });
      const fl = new T.Mesh(new T.CircleGeometry(RAD, 40), floorM); fl.rotation.x = -Math.PI / 2; fl.position.y = WY - DEPTH; fl.receiveShadow = true; pit.add(fl);
      const wall = new T.Mesh(new T.CylinderGeometry(RAD, RAD, DEPTH + 0.6, 40, 1, true), wallM); wall.position.y = WY - DEPTH / 2 + 0.3; pit.add(wall);
      if (studio) {
        const rim = new T.Mesh(new T.TorusGeometry(RAD, 0.18, 8, 48), R.mat(0xc0c8d0)); rim.rotation.x = Math.PI / 2; rim.position.y = WY + 0.6; pit.add(rim);
        const glass = new T.Mesh(new T.CylinderGeometry(RAD + 0.05, RAD + 0.05, 1.6, 40, 1, true), new T.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.18, side: T.DoubleSide })); glass.position.y = WY - 0.2; pit.add(glass);
        // Bühne als Ring um den Tank anheben
        const deck = new T.Mesh(new T.RingGeometry(RAD + 0.2, RAD + 3.5, 40), R.mat(0x2a2833)); deck.rotation.x = -Math.PI / 2; deck.position.y = WY + 0.6; pit.add(deck);
      } else {
        for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, r = A.sized(i % 3 ? 'rock_medium_1' : 'rock_big_2', 0.8 + (i % 4) * 0.3); r.position.set(Math.cos(a) * (RAD + 0.5), WY - 0.4, Math.sin(a) * (RAD + 0.5)); r.rotation.y = a; sc.add(r); }
        const lil = A.instanced('waterlily_pink_group', Array.from({ length: 6 }, (_, i) => ({ x: Math.cos(i * 1.1) * (RAD - 1.5), y: WY + 0.02, z: Math.sin(i * 1.1) * (RAD - 1.5), ry: i })), 0.25); sc.add(lil);
      }
      // Grund: Felsen, Wasserpflanzen, alte Kisten
      for (let i = 0; i < 14; i++) { const a = ctx.rng.next() * 6.28, r = ctx.rng.range(1, RAD - 1); const p = A.sized(ctx.rng.pick(['rock_big_1', 'rock_medium_2', 'garden_plant_1', 'grass_green_group', 'kd_barrel_large', 'kd_crates_stacked']), ctx.rng.range(0.5, 1.4)); p.position.set(Math.cos(a) * r, WY - DEPTH, Math.sin(a) * r); p.rotation.y = a; sc.add(p); }
      const water = R.water(RAD * 2, RAD * 2, studio ? 0x2a8aa8 : 0x5a7a3a, 0.82); water.geometry = new T.CircleGeometry(RAD, 40, 0, Math.PI * 2); water.material.side = T.DoubleSide; water.position.y = WY; ctx.stage.add(water);
      // Sterne am Grund
      ctx.starObjs = [];
      for (let i = 0; i < ctx.max; i++) {
        const a = i / ctx.max * Math.PI * 2 + ctx.rng.range(-0.3, 0.3), r = ctx.rng.range(2, RAD - 1.2);
        const s = R.star(0.45); s.position.set(Math.cos(a) * r, WY - DEPTH + 0.5 + ctx.rng.range(0, 1.4), Math.sin(a) * r); sc.add(s); ctx.starObjs.push(s);
      }
      // Aale (Fische, die Kreise ziehen)
      ctx.eels = [];
      const ne = Math.round(3 * ctx.k + (ctx.short ? 1 : 0));
      for (let i = 0; i < ne; i++) {
        const f = A.sized('fish', 0.9, 'xz'); sc.add(f);
        ctx.eels.push({ o: f, r: ctx.rng.range(2, RAD - 1.5), y: WY - ctx.rng.range(1, DEPTH - 0.5), a: ctx.rng.next() * 6.28, sp: ctx.rng.range(0.25, 0.45) * ctx.k * (i % 2 ? 1 : -1) });
      }
      ctx.pos = new T.Vector3(0, WY, -RAD + 1.5); ctx.vel = new T.Vector3(); ctx.yaw = 0; ctx.air = 1; ctx.stun = 0;
      ctx.player.root.position.copy(ctx.pos);
      ctx.hostPos.set(-RAD - 2, studio ? WY + 0.6 : 0.2, -RAD + 2.5); ctx.hostRy = 0.8;
      ctx.intro = { pos: new T.Vector3(0, 6, RAD + 4), look: new T.Vector3(0, -1, 0) };
      ctx.fogAbove = sc.fog ? { c: sc.fog.color.clone(), n: sc.fog.near, f: sc.fog.far } : null;
      ctx.murk = R.lin(studio ? 0x1f5a6a : 0x3a4a22);
      UL.Trials.sign(ctx, 0, -RAD - 2.2, 0);
      ctx.cam.position.set(0, 3, -RAD - 3); ctx.cam.lookAt(0, 0, 0);
    },
    start(ctx) { ctx.player.set('walk'); },
    update(dt, ctx) {
      const I = ctx.inp, p = ctx.pos, v = ctx.vel, sc = ctx.scene;
      // Touch: Stick links/rechts dreht (wie im Tunnel) – der rechte Daumen bleibt frei für Tauchen/Auftauchen
      const tank = !UL.bot && UL.In.device === 'touch';
      ctx.yaw -= I.lx * 1.2 + (tank ? I.mx * 1.9 * dt : 0);
      const under = p.y < WY - 0.35;
      // Bewegung relativ zur Kamera
      if (ctx.stun > 0) ctx.stun -= dt;
      else {
        const f = new T.Vector3(Math.sin(ctx.yaw), 0, Math.cos(ctx.yaw)), r = new T.Vector3(f.z, 0, -f.x);
        const acc = 5.5;
        v.addScaledVector(f, -I.my * acc * dt).addScaledVector(r, (tank ? 0 : -I.mx) * acc * dt);
        if (I.okD) v.y -= 6 * dt;
        if (I.altD) v.y += 7 * dt;
      }
      v.y += (under ? 1.1 : 0) * dt;   // Auftrieb
      v.multiplyScalar(Math.pow(0.25, dt));
      p.addScaledVector(v, dt);
      if (p.y > WY) { p.y = WY; v.y = Math.min(0, v.y); }
      if (p.y < WY - DEPTH + 0.35) { p.y = WY - DEPTH + 0.35; v.y = Math.max(0, v.y); }
      const d = Math.hypot(p.x, p.z); if (d > RAD - 0.6) { p.x *= (RAD - 0.6) / d; p.z *= (RAD - 0.6) / d; }
      // Luft
      if (under) { ctx.air -= dt / (16 / ctx.k); if (ctx.air <= 0) { ctx.air = 0; v.y = 6; ctx.stun = 1.5; ctx.bad('Luft! Schnell nach oben!'); } }
      else ctx.air = Math.min(1, ctx.air + dt * 0.45);
      // Figur: waagerecht schwimmen, an der Oberfläche aufrecht
      const fig = ctx.player.root; fig.position.copy(p).add(new T.Vector3(0, under ? -0.4 : -1.25, 0));
      const hv = Math.hypot(v.x, v.z); if (hv > 0.2) fig.rotation.y = UL.angDamp(fig.rotation.y, Math.atan2(v.x, v.z), 6, dt);
      fig.rotation.x = UL.damp(fig.rotation.x, under ? 1.25 : 0.3, 5, dt);
      ctx.player.move(under ? 1.2 + hv * 0.3 : hv > 0.3 ? 1.4 : 0);
      // Sterne einsammeln
      for (const s of ctx.starObjs) { if (!s.visible) continue; s.rotation.y += dt * 1.5; if (s.position.distanceTo(p) < 0.9) { s.visible = false; ctx.addStar(s.position); } }
      // Aale
      for (const e of ctx.eels) {
        e.a += e.sp * dt; e.o.position.set(Math.cos(e.a) * e.r, e.y + Math.sin(ctx.t * 2 + e.r) * 0.3, Math.sin(e.a) * e.r);
        e.o.rotation.y = -e.a + (e.sp > 0 ? 0 : Math.PI);
        if (ctx.stun <= 0 && e.o.position.distanceTo(p) < 0.8) { ctx.stun = 1; v.add(p.clone().sub(e.o.position).setLength(4)); ctx.bad('Ein Aal! Zurückgeschubst.'); }
      }
      // Kamera hinter dem Schwimmer
      const cd = 4.2, ch = under ? 0.8 : 1.6;
      const want = new T.Vector3(p.x - Math.sin(ctx.yaw) * cd, p.y + ch - (under ? 0 : 0), p.z - Math.cos(ctx.yaw) * cd);
      const wd = Math.hypot(want.x, want.z); if (wd > RAD - 0.5) { want.x *= (RAD - 0.5) / wd; want.z *= (RAD - 0.5) / wd; }
      want.y = Math.max(want.y, WY - DEPTH + 0.6);
      ctx.cam.position.lerp(want, 1 - Math.exp(-5 * dt)); ctx.cam.lookAt(p.x, p.y - (under ? 0.2 : 0.6), p.z);
      // trübes Wasser, wenn die Kamera untertaucht
      const camUnder = ctx.cam.position.y < WY;
      if (sc.fog && ctx.fogAbove) {
        if (camUnder) { sc.fog.color.copy(ctx.murk); sc.fog.near = 0.5; sc.fog.far = 9 / Math.max(0.8, ctx.k); }
        else { sc.fog.color.copy(ctx.fogAbove.c); sc.fog.near = ctx.fogAbove.n; sc.fog.far = ctx.fogAbove.f; }
      }
      ctx.meters = [{ label: '🫧 Luft', v: ctx.air, danger: ctx.air < 0.3, color: ctx.air < 0.3 ? '' : '#5ad1ff' }];
    },
    finish(ctx) { const f = ctx.player.root; f.rotation.x = 0; f.position.set(-RAD + 1, ctx.theme === 'studio' ? 0.6 : 0, -RAD + 1); f.rotation.y = 0.8; if (ctx.scene.fog && ctx.fogAbove) { ctx.scene.fog.color.copy(ctx.fogAbove.c); ctx.scene.fog.near = ctx.fogAbove.n; ctx.scene.fog.far = ctx.fogAbove.f; } },
    bot(dt, ctx, I) {
      const p = ctx.pos;
      if (ctx.air < 0.28 || ctx.surf) { ctx.surf = ctx.air < 0.95; I.altD = true; return; }
      let best = null, bd = 1e9; for (const s of ctx.starObjs) if (s.visible) { const d = s.position.distanceTo(p); if (d < bd) { bd = d; best = s; } }
      if (!best) return;
      const dx = best.position.x - p.x, dz = best.position.z - p.z, dy = best.position.y - p.y;
      // Kamera-Gieren auf das Ziel drehen und vorwärts
      const want = Math.atan2(dx, dz); let da = ((want - ctx.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      I.lx = -UL.clamp(da, -0.1, 0.1);
      if (Math.abs(da) < 0.8) I.my = -1;
      if (dy < -0.3) I.okD = true; else if (dy > 0.3) I.altD = true;
    }
  });
})();

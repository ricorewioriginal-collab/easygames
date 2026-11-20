/* Prüfung: Die Schlangengrube – selbst durch die Grube schleichen, Körbe öffnen und die Sterne holen.
   Wer rennt, weckt die (ungiftigen) Schlangen: Sie richten sich auf, zischen und schnappen zu. Schleichen hält sie ruhig. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R;
  const RAD = 6.2, SEG = 12;   // Grubenradius, Glieder je Schlange

  UL.Trials.reg('schlangen', {
    orbit: true, relMove: true,
    env: (theme) => theme === 'studio' ? { radius: 15 } : { tod: 'day', radius: 16, clear: [{ x: 0, z: 0, r: 8 }], seed: 37 },
    setup(ctx) {
      const sc = ctx.scene, rng = ctx.rng, studio = ctx.theme === 'studio';
      // Grube: Erdboden, Lehmwand ringsum, Holzrand
      const floor = new T.Mesh(new T.CircleGeometry(RAD + 0.4, 40), R.mat(studio ? 0x5a4a3a : 0x6a5032)); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.02; floor.receiveShadow = true; sc.add(floor);
      const wall = new T.Mesh(new T.CylinderGeometry(RAD + 0.4, RAD + 0.4, 1.6, 40, 1, true), new T.MeshLambertMaterial({ color: R.lin(studio ? 0x4a4652 : 0x5a3e22), side: T.BackSide })); wall.position.y = 0.8; sc.add(wall);
      const rim = new T.Mesh(new T.TorusGeometry(RAD + 0.5, 0.16, 6, 48), R.mat(studio ? 0xc8a040 : 0x7a5230)); rim.rotation.x = Math.PI / 2; rim.position.y = 1.6; sc.add(rim);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, p = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, 2.2, 6), R.mat(0x5a3a1e)); p.position.set(Math.cos(a) * (RAD + 0.55), 1.1, Math.sin(a) * (RAD + 0.55)); sc.add(p); }
      // Steine und Äste als Deko (nicht begehbar)
      ctx.solid = [];
      for (let i = 0; i < 6; i++) { const a = rng.range(0, 6.28), d = rng.range(2, RAD - 1), x = Math.cos(a) * d, z = Math.sin(a) * d; const s = new T.Mesh(new T.DodecahedronGeometry(rng.range(0.35, 0.55)), R.mat(0x7a756c)); s.position.set(x, 0.2, z); s.scale.y = 0.6; s.castShadow = true; sc.add(s); ctx.solid.push({ x, z, r: 0.55 }); }
      // Körbe: hinter manchen liegt ein Stern, in manchen eine Schlange
      ctx.baskets = [];
      const nB = ctx.max + 3, weave = R.mat(studio ? 0xd8b060 : 0xb08850), lidM = R.mat(studio ? 0xc09848 : 0x9a7440);
      for (let i = 0; i < nB; i++) {
        const a = i / nB * Math.PI * 2 + rng.range(-0.15, 0.15), d = i % 2 ? rng.range(2.4, 3.6) : rng.range(4.2, RAD - 0.7), x = Math.cos(a) * d, z = Math.sin(a) * d;
        const g = new T.Group(); g.position.set(x, 0, z);
        const b = new T.Mesh(new T.CylinderGeometry(0.34, 0.26, 0.5, 12), weave); b.position.y = 0.25; b.castShadow = true; g.add(b);
        const lid = new T.Mesh(new T.CylinderGeometry(0.37, 0.37, 0.08, 12), lidM); lid.position.y = 0.54; g.add(lid);
        sc.add(g); ctx.baskets.push({ g, lid, x, z, open: 0, done: false, star: false });
      }
      rng.shuffle(ctx.baskets).slice(0, ctx.max).forEach(b => b.star = true);
      // Schlangen: Glieder als Instanzen (eine Zeichnung für alle), Kopf mit Augen
      const nS = Math.round((ctx.short ? 5 : 7) * ctx.k);
      const segG = new T.SphereGeometry(0.13, 8, 6); segG.scale(1, 0.7, 1.4);
      ctx.segIM = new T.InstancedMesh(segG, new T.MeshLambertMaterial({ color: 0xffffff }), nS * SEG); sc.add(ctx.segIM);
      const COLS = [0x3a6a2a, 0x8a6a2a, 0x2a4a3a, 0x6a4a2a, 0x4a7a3a], cl = new T.Color();
      ctx.snakes = [];
      for (let i = 0; i < nS; i++) {
        const a = rng.range(0, 6.28), d = rng.range(1.5, RAD - 1), col = COLS[i % COLS.length];
        const head = new T.Group(); const hm = new T.Mesh(new T.SphereGeometry(0.15, 10, 8), R.mat(col)); hm.scale.set(1, 0.7, 1.4); head.add(hm);
        for (const s of [-1, 1]) { const e = new T.Mesh(new T.SphereGeometry(0.03, 6, 4), new T.MeshBasicMaterial({ color: 0xffe040 })); e.position.set(s * 0.08, 0.05, 0.12); head.add(e); }
        const tongue = new T.Mesh(new T.BoxGeometry(0.02, 0.01, 0.16), new T.MeshBasicMaterial({ color: 0xd02030 })); tongue.position.set(0, -0.02, 0.24); head.add(tongue);
        sc.add(head);
        const sn = { head, tongue, x: Math.cos(a) * d, z: Math.sin(a) * d, dir: rng.range(0, 6.28), alert: 0, strike: 0, cool: 0, ph: rng.range(0, 6), trail: [] };
        for (let k = 0; k < SEG; k++) { sn.trail.push({ x: sn.x, z: sn.z }); cl.set(k % 3 === 1 ? 0xb8a050 : col).convertSRGBToLinear(); ctx.segIM.setColorAt(i * SEG + k, cl); }
        ctx.snakes.push(sn);
      }
      ctx.segIM.instanceColor.needsUpdate = true;
      ctx.M = new T.Matrix4(); ctx.Q = new T.Quaternion(); ctx.V = new T.Vector3(); ctx.S = new T.Vector3(1, 1, 1);
      ctx.player.root.position.set(0, 0.02, RAD - 1); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(0, 1.6, RAD + 2.2); ctx.hostRy = Math.PI;
      ctx.intro = { pos: new T.Vector3(0, 9, 9), look: new T.Vector3(0, 0, 0) };
      UL.Trials.sign(ctx, -4, RAD + 2.6, 0);
      ctx.cam.position.set(0, 6, RAD + 4); ctx.cam.lookAt(0, 0.5, 0);
      ctx.stun = 0; ctx.noise = 0;
    },
    push(ctx, p) {
      for (const s of ctx.solid) { const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz); if (d < s.r + 0.3 && d > 0.001) { p.x = s.x + dx / d * (s.r + 0.3); p.z = s.z + dz / d * (s.r + 0.3); } }
      for (const b of ctx.baskets) { const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz); if (d < 0.65 && d > 0.001) { p.x = b.x + dx / d * 0.65; p.z = b.z + dz / d * 0.65; } }
      const d = Math.hypot(p.x, p.z); if (d > RAD - 0.3) { p.x *= (RAD - 0.3) / d; p.z *= (RAD - 0.3) / d; }
    },
    update(dt, ctx) {
      const I = ctx.inp, f = ctx.player, p = f.root.position;
      // Spieler: schleichen (Knopf halten) ist leise, normales Gehen macht Lärm
      const mag = Math.min(1, Math.hypot(I.mx, I.my)), sneak = I.altD;
      const sp = ctx.stun > 0 ? 0 : (sneak ? 1.25 : 3.1) * mag;
      if (ctx.stun > 0) ctx.stun -= dt;
      if (sp > 0.05) { const np = { x: p.x + I.mx / Math.max(mag, 0.001) * sp * dt, z: p.z + I.my / Math.max(mag, 0.001) * sp * dt }; this.push(ctx, np); p.x = np.x; p.z = np.z; f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(I.mx, I.my), 12, dt); }
      p.y = 0.02; if (!f.one) f.move(sp);
      ctx.noise = UL.damp(ctx.noise, sneak ? sp * 0.15 : sp, 6, dt);
      // Körbe: davorstellen und Knopf drücken
      let near = null, nd = 1.25;
      for (const b of ctx.baskets) { if (b.done) continue; const d = Math.hypot(b.x - p.x, b.z - p.z); if (d < nd) { nd = d; near = b; } }
      if (near && I.ok && ctx.stun <= 0) {
        near.done = true; f.play('pickup'); UL.Audio.sfx('pick');
        near.lid.position.set(0.3, 0.3, 0); near.lid.rotation.z = 1.2;
        if (near.star) { const s = R.star(0.32); s.position.set(near.x, 1.0, near.z); ctx.scene.add(s); UL.after(0.7, () => ctx.scene.remove(s)); ctx.addStar(s.position.clone()); }
        else { ctx.bad('Eine Schlange im Korb!', 'scream'); ctx.stun = 0.8; f.play('hit'); for (const sn of ctx.snakes) if (Math.hypot(sn.x - p.x, sn.z - p.z) < 3.5) sn.alert = Math.max(sn.alert, 0.8); }
      }
      // Schlangen: schlängeln umher, werden bei Lärm wach, richten sich auf und schnappen zu
      let i = 0; const M = ctx.M, Q = ctx.Q, V = ctx.V, S = ctx.S;
      for (const sn of ctx.snakes) {
        const dx = p.x - sn.x, dz = p.z - sn.z, dist = Math.hypot(dx, dz);
        const hear = dist < 3.2 ? ctx.noise * (3.2 - dist) * 0.32 : 0;
        sn.alert = UL.clamp(sn.alert + (hear - 0.22) * dt, 0, 1.2);
        sn.cool -= dt;
        let spd = 0.45;
        if (sn.strike > 0) { sn.strike -= dt; spd = 3.6; sn.dir = Math.atan2(dx, dz); if (dist < 0.55 && ctx.stun <= 0) { ctx.bad(UL.pick(['Gebissen! (Zum Glück ungiftig)', 'Die Schlange schnappt zu!', 'Autsch – Zähne!']), 'scream'); ctx.stun = 1.1; f.play('hit'); ctx.time = Math.max(1, ctx.time - 4); sn.strike = 0; sn.alert = 0.2; sn.cool = 3; } }
        else if (sn.alert > 0.75 && dist < 2.3 && sn.cool <= 0) { sn.strike = 0.6; UL.Audio.sfx('hiss'); }
        else if (sn.alert > 0.45) { spd = 0.1; sn.dir = UL.angDamp(sn.dir, Math.atan2(dx, dz), 3, dt); }
        else { sn.dir += Math.sin(ctx.t * 0.7 + sn.ph) * dt * 1.4; }
        sn.x += Math.sin(sn.dir) * spd * dt; sn.z += Math.cos(sn.dir) * spd * dt;
        const r = Math.hypot(sn.x, sn.z); if (r > RAD - 0.5) { sn.dir = Math.atan2(-sn.x, -sn.z) + UL.rand(-0.5, 0.5); sn.x *= (RAD - 0.5) / r; sn.z *= (RAD - 0.5) / r; }
        // Körper folgt dem Kopf (Schlängellinie)
        const tr = sn.trail; tr[0].x = sn.x; tr[0].z = sn.z;
        for (let k = 1; k < SEG; k++) { const a = tr[k - 1], b = tr[k], ddx = b.x - a.x, ddz = b.z - a.z, dd = Math.hypot(ddx, ddz) || 1; b.x = a.x + ddx / dd * 0.14; b.z = a.z + ddz / dd * 0.14; }
        const rise = UL.clamp((sn.alert - 0.35) * 1.4, 0, 0.55) + (sn.strike > 0 ? 0.1 : 0);
        for (let k = 0; k < SEG; k++) {
          const t = tr[k], wig = Math.sin(ctx.t * 6 - k * 0.8 + sn.ph) * 0.06 * (1 - rise), up = k < 4 ? rise * (4 - k) / 4 : 0;
          V.set(t.x + Math.cos(sn.dir) * wig, 0.08 + up, t.z - Math.sin(sn.dir) * wig); Q.setFromAxisAngle(UL.Y || (UL.Y = new T.Vector3(0, 1, 0)), sn.dir); S.setScalar(1 - k / SEG * 0.55);
          M.compose(V, Q, S); ctx.segIM.setMatrixAt(i * SEG + k, M);
        }
        sn.head.position.set(sn.x + Math.sin(sn.dir) * 0.12, 0.12 + rise * 1.05, sn.z + Math.cos(sn.dir) * 0.12); sn.head.rotation.y = sn.dir;
        sn.tongue.visible = (ctx.t * 3 + sn.ph) % 1 < 0.3 || sn.alert > 0.6;
        i++;
      }
      ctx.segIM.instanceMatrix.needsUpdate = true;
      const wake = Math.max(...ctx.snakes.map(s => Math.hypot(s.x - p.x, s.z - p.z) < 3 ? s.alert : 0), 0);
      ctx.meters = [{ label: '🐍 Unruhe', v: wake, danger: wake > 0.6, color: wake > 0.6 ? '#e04030' : '#7ac05a' }];
      ctx.extraHud = `<span class="chip">${sneak ? '🤫 Schleichen' : '🚶 Gehen'}</span><span class="chip">🧺 ${ctx.baskets.filter(b => !b.done).length} Körbe zu</span>`;
      ctx.overlay(near && ctx.stun <= 0 ? `<div class="lbl">🧺 Korb öffnen: ${UL.In.glyph('ok')}</div>` : ctx.t < 6 ? `<div class="lbl">🤫 ${UL.In.glyph('alt')} halten = schleichen, dann bleiben die Schlangen ruhig</div>` : '');
      if (!ctx.baskets.some(b => !b.done && b.star)) ctx.end('alle');
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(p.x * 0.8, port ? 6.2 : 5.6, p.z + (port ? 5.4 : 5.2)), 1 - Math.exp(-4 * dt)); ctx.cam.lookAt(p.x, 0.5, p.z - 0.8);
    },
    bot(dt, ctx, I) {
      const p = ctx.player.root.position; let best = null, bd = 1e9;
      for (const b of ctx.baskets) { if (b.done) continue; const d = Math.hypot(b.x - p.x, b.z - p.z) + (b.star ? 0 : 3); if (d < bd) { bd = d; best = b; } }
      if (!best) return;
      const dx = best.x - p.x, dz = best.z - p.z, d = Math.hypot(dx, dz) || 1;
      if (d > 0.9) { I.mx = dx / d; I.my = dz / d; } else I.ok = (ctx.t * 4 | 0) % 2 === 0;
      I.altD = ctx.snakes.some(s => Math.hypot(s.x - p.x, s.z - p.z) < 2 && s.alert > 0.15);
      if (ctx.solid.some(s => Math.hypot(p.x + dx / d * 0.7 - s.x, p.z + dz / d * 0.7 - s.z) < s.r + 0.3)) { I.mx = -dz / d; I.my = dx / d; }
    }
  });
})();

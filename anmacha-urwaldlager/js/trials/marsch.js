/* Gruppenprüfung beim Einzug: Dschungel-Marsch bzw. Landeplatz-Suche – alle Camper suchen gemeinsam die Sterne im Dschungel,
   die eigene Figur läuft frei (Kamera frei drehbar), die Mit-Camper suchen selbstständig mit; jeder Stern zählt fürs ganze Camp. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const RAD = 12.5;   // begehbarer Bereich

  UL.Trials.reg('marsch', {
    orbit: true, relMove: true,
    env: (theme) => theme === 'studio' ? { radius: 16 } : { tod: 'day', radius: 18, clear: [{ x: 0, z: 0, r: 14 }], seed: 91 },
    setup(ctx) {
      const sc = ctx.scene, rng = ctx.rng, studio = ctx.theme === 'studio';
      const env = ctx.stage.env;
      ctx.h = (x, z) => studio || !env || !env.height ? 0 : env.height(x, z);
      // Hindernisse: Baumstämme und Felsen (man läuft drumherum), Schlammlöcher bremsen
      ctx.solid = []; ctx.mud = [];
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2 + rng.range(-0.2, 0.2), d = rng.range(4, 10.5), x = Math.cos(a) * d, z = Math.sin(a) * d;
        if (Math.hypot(x, z - 10) < 3) continue;
        if (i % 3 === 0) { const l = R.log(2.2, 0.28); l.position.set(x, ctx.h(x, z) + 0.25, z); l.rotation.y = a; sc.add(l); ctx.solid.push({ x, z, r: 0.9 }); }
        else { const r = A.sized(i % 2 ? 'rock_medium_1' : 'rock_tall', i % 2 ? 1.0 : 1.8); r.position.set(x, ctx.h(x, z), z); r.rotation.y = a; sc.add(r); ctx.solid.push({ x, z, r: i % 2 ? 0.7 : 0.9 }); }
      }
      for (let i = 0; i < 4; i++) {
        const a = rng.range(0, Math.PI * 2), d = rng.range(3, 9), x = Math.cos(a) * d, z = Math.sin(a) * d;
        const m = new T.Mesh(new T.CircleGeometry(1.2, 20), R.mat(0x4a3018)); m.rotation.x = -Math.PI / 2; m.position.set(x, ctx.h(x, z) + 0.03, z); sc.add(m); ctx.mud.push({ x, z, r: 1.2 });
      }
      // Sterne: verstreut, manche auf Felsen und Stämmen – leuchten und sind von Weitem zu sehen
      ctx.starObjs = [];
      for (let i = 0; i < ctx.max; i++) {
        let x = 0, z = 0;
        for (let k = 0; k < 20; k++) { const a = rng.range(0, Math.PI * 2), d = rng.range(2.5, RAD - 1); x = Math.cos(a) * d; z = Math.sin(a) * d; if (Math.hypot(x, z - 10) > 2.5 && !ctx.starObjs.some(s => Math.hypot(s.position.x - x, s.position.z - z) < 2)) break; }
        const s = R.star(0.32); s.position.set(x, ctx.h(x, z) + 0.9, z); sc.add(s); ctx.starObjs.push(s);
      }
      // Hubschrauber am Landeplatz (wenn man eingeflogen wurde)
      if (ctx.opt.heli) {
        const g = new T.Group(), body = R.mat(0x2a5a3a);
        const b = new T.Mesh(new T.SphereGeometry(1.1, 16, 12), body); b.scale.set(1, 0.8, 1.5); b.position.y = 1.1; g.add(b);
        const tail = new T.Mesh(new T.CylinderGeometry(0.12, 0.25, 3, 8), body); tail.rotation.x = Math.PI / 2; tail.position.set(0, 1.3, 2.6); g.add(tail);
        const win = new T.Mesh(new T.SphereGeometry(0.75, 12, 8), new T.MeshLambertMaterial({ color: 0x9adfff, transparent: true, opacity: 0.7 })); win.position.set(0, 1.35, -0.8); win.scale.set(1, 0.7, 0.8); g.add(win);
        for (const x of [-0.7, 0.7]) { const sk = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 2.4), R.mat(0x333333)); sk.position.set(x, 0.1, 0); g.add(sk); }
        ctx.rotor = new T.Mesh(new T.BoxGeometry(5.2, 0.04, 0.22), R.mat(0x222222)); ctx.rotor.position.y = 2.15; g.add(ctx.rotor);
        g.position.set(4.5, ctx.h(4.5, 11), 11); g.rotation.y = 0.4; sc.add(g); ctx.solid.push({ x: 4.5, z: 11, r: 1.6 });
      }
      // Lagertor als Ziel (dahinter liegt das Camp)
      const gate = new T.Group();
      for (const x of [-1.6, 1.6]) { const p = new T.Mesh(new T.CylinderGeometry(0.14, 0.16, 3.2, 8), R.mat(0x5a3a1e)); p.position.set(x, 1.6, 0); gate.add(p); }
      const sg = R.sign(['ZUM LAGER'], 3.6, 0.6, { bg: studio ? '#141824' : '#5a3a1e', w: 512, h: 90, font: '900 56px system-ui' }); sg.position.y = 3.1; gate.add(sg);
      gate.position.set(0, ctx.h(0, -RAD), -RAD); sc.add(gate);
      // Mit-Camper als Team: suchen selbst nach Sternen
      ctx.team = (ctx.opt.team || []).slice(0, 5).map((c, i) => {
        const f = UL.makeFig(c.look); const x = (i - 2) * 1.1, z = 11.5; f.root.position.set(x, ctx.h(x, z), z); f.root.rotation.y = Math.PI; sc.add(f.root); ctx.stage.figs.push(f);
        UL.Tags.set('m:' + i, v => v.copy(f.root.position).add(new T.Vector3(0, f.height + 0.35, 0)), UL.esc(c.name.split(' ')[0]), 'tag');
        return { f, name: c.name.split(' ')[0], sp: 1.3 + (c.t ? c.t.fleiss * 0.8 : 0.5), target: null, think: rng.range(0.5, 2.5), found: 0 };
      });
      ctx.player.root.position.set(0, ctx.h(0, 10), 10); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(-3, 0, 12.5); ctx.hostRy = 2.6;
      ctx.intro = { pos: new T.Vector3(0, 9, 18), look: new T.Vector3(0, 0, 0) };
      ctx.cam.position.set(0, 4, 15); ctx.cam.lookAt(0, 1, 8);
      ctx.vy = 0; ctx.y = 0; ctx.mine = 0;
    },
    push(ctx, p, r = 0.35) {
      for (const s of ctx.solid) { const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz), m = s.r + r; if (d < m && d > 0.001) { p.x = s.x + dx / d * m; p.z = s.z + dz / d * m; } }
      const d = Math.hypot(p.x, p.z); if (d > RAD) { p.x *= RAD / d; p.z *= RAD / d; }
    },
    take(ctx, s, who) {
      s.visible = false; ctx.addStar(s.position.clone());
      if (who) { who.found++; UL.Tags.bubble('t' + who.name, v => v.copy(who.f.root.position).add(new T.Vector3(0, 2.4, 0)), UL.pick(['Hab einen!', 'Stern! Für uns alle!', 'Hier, gefunden!', 'Juhu!']), 1.8); who.f.play('cheer'); }
      else ctx.mine++;
    },
    update(dt, ctx) {
      const I = ctx.inp, f = ctx.player, p = f.root.position;
      if (ctx.rotor) ctx.rotor.rotation.y += dt * (ctx.t < 4 ? 14 : 3);
      // Spieler: frei laufen, Schlamm bremst, Sprung über Stämme
      const inMud = ctx.mud.some(m => Math.hypot(p.x - m.x, p.z - m.z) < m.r);
      const mag = Math.min(1, Math.hypot(I.mx, I.my)), sp = (I.altD ? 4.6 : 3.0) * (inMud ? 0.45 : 1);
      if (mag > 0.15) {
        const np = { x: p.x + I.mx / Math.max(mag, 1) * sp * mag * dt, z: p.z + I.my / Math.max(mag, 1) * sp * mag * dt };
        if (ctx.y < 0.3) this.push(ctx, np); else { const d = Math.hypot(np.x, np.z); if (d > RAD) { np.x *= RAD / d; np.z *= RAD / d; } }
        p.x = np.x; p.z = np.z; f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(I.mx, I.my), 12, dt);
      }
      if (I.ok && ctx.y <= 0) { ctx.vy = 5; UL.Audio.sfx('whoosh'); f.play('jump'); }
      ctx.vy -= 14 * dt; ctx.y = Math.max(0, ctx.y + ctx.vy * dt); if (ctx.y <= 0) ctx.vy = 0;
      p.y = ctx.h(p.x, p.z) + ctx.y;
      if (!f.one) f.move(mag > 0.15 ? sp * mag : 0);
      if (inMud && mag > 0.15 && Math.random() < dt * 2) ctx.stage.parts.burst(p.x, p.y + 0.1, p.z, 4, 0.4, 1, [0x4a3018, 0x6a4a2a]);
      // Sterne einsammeln
      for (const s of ctx.starObjs) {
        if (!s.visible) continue;
        s.rotation.y += dt * 2; s.position.y = ctx.h(s.position.x, s.position.z) + 0.9 + Math.sin(ctx.t * 3 + s.position.x) * 0.1;
        if (Math.hypot(s.position.x - p.x, s.position.z - p.z) < 0.85 && Math.abs(s.position.y - (p.y + 0.9)) < 1.2) this.take(ctx, s, null);
      }
      // Team sucht mit
      for (const m of ctx.team) {
        const q = m.f.root.position;
        if (!m.target || !m.target.visible) { m.think -= dt; if (m.think <= 0) { m.think = UL.rand(1, 3); let best = null, bd = 1e9; for (const s of ctx.starObjs) { if (!s.visible || ctx.team.some(o => o !== m && o.target === s)) continue; const d = Math.hypot(s.position.x - q.x, s.position.z - q.z) + UL.rand(0, 4); if (d < bd) { bd = d; best = s; } } m.target = best; } m.f.move(0); continue; }
        const dx = m.target.position.x - q.x, dz = m.target.position.z - q.z, d = Math.hypot(dx, dz);
        if (d < 0.7) { this.take(ctx, m.target, m); m.target = null; m.think = UL.rand(1, 2.5); continue; }
        const mud = ctx.mud.some(mm => Math.hypot(q.x - mm.x, q.z - mm.z) < mm.r) ? 0.45 : 1;
        const np = { x: q.x + dx / d * m.sp * mud * dt, z: q.z + dz / d * m.sp * mud * dt }; this.push(ctx, np);
        q.x = np.x; q.z = np.z; q.y = ctx.h(q.x, q.z); m.f.root.rotation.y = UL.angDamp(m.f.root.rotation.y, Math.atan2(dx, dz), 8, dt); m.f.move(m.sp);
      }
      ctx.extraHud = `<span class="chip">👥 Gruppenprüfung</span><span class="chip">🙋 ${ctx.mine} von dir</span>${inMud ? '<span class="chip warn">🟤 Schlamm!</span>' : ''}`;
      ctx.overlay(ctx.t < 5 ? '<div class="lbl">🔎 Sucht gemeinsam alle Sterne – jeder zählt fürs Camp!</div>' : '');
      // Kamera folgt von hinten (frei drehbar über den Kamera-Stick)
      const port = UL.portrait();
      const want = new T.Vector3(p.x * 0.85, p.y + (port ? 5.5 : 4.2), p.z + (port ? 7.5 : 6.2));
      ctx.cam.position.lerp(want, 1 - Math.exp(-4 * dt)); ctx.cam.lookAt(p.x, p.y + 0.8, p.z - 1.5);
    },
    finish(ctx) { ctx.team.forEach((m, i) => UL.Tags.del('m:' + i)); },
    bot(dt, ctx, I) {
      const p = ctx.player.root.position; let best = null, bd = 1e9;
      for (const s of ctx.starObjs) { if (!s.visible) continue; const d = Math.hypot(s.position.x - p.x, s.position.z - p.z); if (d < bd) { bd = d; best = s; } }
      if (!best) return;
      const dx = best.position.x - p.x, dz = best.position.z - p.z, d = Math.hypot(dx, dz) || 1;
      I.mx = dx / d; I.my = dz / d; I.altD = true;
      const blocked = ctx.solid.some(s => Math.hypot(p.x + dx / d * 0.8 - s.x, p.z + dz / d * 0.8 - s.z) < s.r + 0.3);
      if (blocked) { I.mx = -dz / d; I.my = dx / d; }
    }
  });
})();

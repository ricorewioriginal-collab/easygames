/* Prüfung: Das Floßrennen – auf dem selbst gebauten Floß den Dschungelfluss hinunter, gegen zwei Mit-Camper.
   Lenken mit dem Stick, Paddeln mit dem Knopf (im Takt drücken = schneller). Sterne hängen an Bojen, Felsen und
   Treibholz bremsen. Wer als Erster durchs Ziel fährt, bekommt zwei Bonussterne, als Zweiter einen. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const LEN = 170, HALF = 4.2;
  const cx = z => Math.sin(z * 0.035) * 5 + Math.sin(z * 0.09) * 1.4;   // Flusslauf

  function raft(look, sc, stage) {
    const g = new T.Group();
    for (let i = 0; i < 5; i++) { const l = R.log(2.4, 0.17); l.rotation.y = Math.PI / 2; l.position.x = (i - 2) * 0.33; g.add(l); }
    for (const z of [-0.8, 0.8]) { const b = new T.Mesh(new T.BoxGeometry(1.8, 0.06, 0.12), R.mat(0x8a6a3a)); b.position.set(0, 0.36, z); g.add(b); }
    const pad = new T.Group(); const st = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.6, 6), R.mat(0x6a4a2a)); st.rotation.z = 0.5; pad.add(st);
    const bl = new T.Mesh(new T.BoxGeometry(0.22, 0.04, 0.4), R.mat(0x8a6a3a)); bl.position.set(-0.36, -0.68, 0); bl.rotation.z = 0.5; pad.add(bl); pad.position.set(0.7, 0.9, 0); g.add(pad);
    const f = UL.makeFig(look); f.root.position.y = 0.34; g.add(f.root); stage.figs.push(f);
    sc.add(g); return { g, f, pad };
  }

  UL.Trials.reg('floss', {
    env: () => ({ none: true }), atmo: 'river',
    setup(ctx) {
      const sc = ctx.scene, rng = ctx.rng, studio = ctx.theme === 'studio';
      sc.add(R.sky(0x3f8fe0, 0xbfe6ff, 0x7fb070, null, 'sky-day')); sc.fog = new T.Fog(R.lin(0xa9d6c8), 25, 80);
      ctx.L = UL.Env.lights(sc, { shadowSize: 18, sunI: 1.1, hemiI: 0.8 });
      // Wasser und Ufer (Uferband folgt dem Flusslauf und verdeckt das Wasser daneben)
      const w = R.water(40, LEN + 60, studio ? 0x2a6aa3 : 0x3a8a7a, 0.95); w.position.set(0, 0, -LEN / 2 + 10); sc.add(w); ctx.stage.updaters.push(w.userData.update);
      const bankM = R.mat(studio ? 0x3a3848 : 0x4f9a3a), mudM = R.mat(0x8a6a44);
      for (const s of [-1, 1]) {
        const pos = [], pos2 = [];
        for (let z = 20; z >= -LEN - 30; z -= 2) { const x = cx(z) + s * HALF; pos.push(x + s * 0.8, 0.3, z, x + s * 40, 0.6, z); pos2.push(x - s * 0.2, 0.02, z, x + s * 0.9, 0.32, z); }
        for (const [arr, m] of [[pos, bankM], [pos2, mudM]]) {
          const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(arr, 3)); const idx = [];
          for (let i = 0; i < arr.length / 6 - 1; i++) { const a = i * 2; s > 0 ? idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) : idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
          g.setIndex(idx); g.computeVertexNormals(); const mesh = new T.Mesh(g, m); mesh.receiveShadow = true; sc.add(mesh);
        }
      }
      // Palmen und Büsche am Ufer
      const palms = [], bush = [];
      for (let z = 10; z > -LEN - 20; z -= 3.2) for (const s of [-1, 1]) { const x = cx(z) + s * (HALF + rng.range(1.5, 7)); (rng.next() < 0.55 ? palms : bush).push({ x, y: 0.4, z: z + rng.range(-1, 1), ry: rng.range(0, 6), s: rng.range(0.7, 1.1) }); }
      sc.add(A.instanced('tree_palm', palms, 4.6, { shadow: false })); sc.add(A.instanced('bush_large', bush, 1.4));
      // Felsen und Treibholz, Sterne an Bojen
      ctx.rocks = [];
      for (let z = -18; z > -LEN + 10; z -= rng.range(7, 11)) {
        const x = cx(z) + rng.range(-HALF + 1, HALF - 1), r = rng.range(0.55, 0.85), log = rng.next() < 0.3;
        const m = log ? R.log(2, 0.2) : new T.Mesh(new T.DodecahedronGeometry(r), R.mat(0x7a756c));
        if (log) { m.position.set(x, -0.08, z); m.rotation.y = rng.range(-0.6, 0.6); } else { m.position.set(x, 0.05, z); m.scale.y = 0.7; m.castShadow = true; }
        sc.add(m); ctx.rocks.push({ x, z, r: log ? 1.0 : r + 0.25, m, log });
      }
      ctx.buoys = [];
      const nb = ctx.max - 2;
      for (let i = 0; i < nb; i++) {
        const z = -14 - (i + 0.5) * (LEN - 30) / nb; let x = cx(z) + rng.range(-HALF + 1.2, HALF - 1.2);
        for (const r of ctx.rocks) if (Math.abs(r.z - z) < 2.5 && Math.abs(r.x - x) < 1.6) x = cx(z) + (r.x > cx(z) ? -2 : 2);
        const g = new T.Group(); const b = new T.Mesh(new T.SphereGeometry(0.28, 10, 8), R.mat(0xe03a2a)); b.scale.y = 0.6; g.add(b);
        const s = R.star(0.34); s.position.y = 0.9; g.add(s); g.position.set(x, 0.1, z); sc.add(g); ctx.buoys.push({ g, s, x, z, got: false });
      }
      // Ziel: Tor über den Fluss
      const fz = -LEN, fx = cx(fz);
      for (const s of [-1, 1]) { const p = new T.Mesh(new T.CylinderGeometry(0.15, 0.18, 5, 8), R.mat(0x5a3a1e)); p.position.set(fx + s * (HALF + 0.5), 2.5, fz); sc.add(p); }
      const ban = R.sign(['🏁 ZIEL'], HALF * 2 + 1, 1, { bg: '#c8372d', w: 512, h: 64, font: '900 48px system-ui' }); ban.position.set(fx, 4.6, fz); sc.add(ban);
      // Spieler und zwei Gegner
      ctx.me = raft(ctx.look, sc, ctx.stage); ctx.player.root.visible = false; ctx.myFig = ctx.me.f;
      const cast = UL.D.CAST.filter(c => c.look !== ctx.look), rivals = (ctx.opt.team && ctx.opt.team.length ? ctx.opt.team : rng.shuffle(cast)).slice(0, 2);
      ctx.rivals = rivals.map((c, i) => { const r = raft(c.look, sc, ctx.stage); const o = { r, name: (c.name || '').split(' ')[0] || 'Camper', x: cx(0) + (i ? 2.7 : -2.7), z: i ? 0.5 : 3.5, v: 0, top: rng.range(3.5, 4.1) / Math.max(0.8, 1.3 - ctx.k * 0.3), done: 0, wob: rng.range(0, 6) }; UL.Tags.set('fl:' + i, v => v.copy(o.r.g.position).add(new T.Vector3(0, 2.4, 0)), UL.esc(o.name), 'tag'); return o; });
      ctx.x = cx(0); ctx.z = 2; ctx.v = 0; ctx.vx = 0; ctx.stroke = 0; ctx.place = 0; ctx.bump = 0; ctx.beat = 0;
      ctx.hostPos.set(cx(8) - HALF - 2, 0.5, 8); ctx.hostRy = 1.8;
      ctx.intro = { pos: new T.Vector3(cx(0) + 6, 6, 14), look: new T.Vector3(cx(-20), 0, -20) };
      UL.Trials.sign(ctx, cx(6) + HALF + 2.5, 6, -1.2);
      ctx.cam.position.set(ctx.x, 4, 9); ctx.cam.lookAt(ctx.x, 0.5, 0);
      this.place(ctx, ctx.me, ctx.x, ctx.z, 0);
      ctx.rivals.forEach(o => this.place(ctx, o.r, o.x, o.z, 0));
    },
    place(ctx, r, x, z, wob) { r.g.position.set(x, 0.05 + Math.sin(ctx.t * 2.4 + x) * 0.04, z); r.g.rotation.set(Math.sin(ctx.t * 1.7 + z) * 0.03, Math.PI + wob, Math.sin(ctx.t * 2.1 + x) * 0.03); },
    start(ctx) { ctx.me.f.set('idle'); },
    update(dt, ctx) {
      const I = ctx.inp, cur = 1.4;
      // Paddeln: jeder Schlag schiebt, im Takt (alle 0,35–0,8 s) gibt es mehr Schub
      ctx.beat += dt; ctx.stroke = Math.max(0, ctx.stroke - dt * 3);
      if (I.ok && ctx.bump <= 0) { const good = ctx.beat > 0.33 && ctx.beat < 0.85; ctx.v = Math.min(7, ctx.v + (good ? 1.25 : 0.6)); ctx.beat = 0; ctx.stroke = 1; UL.Audio.sfx('splash'); ctx.me.f.play('use', { speed: 1.6 }); if (good) ctx.combo = (ctx.combo || 0) + 1; else ctx.combo = 0; }
      if (ctx.beat > 1.2) ctx.combo = 0;
      ctx.v = Math.max(cur, ctx.v - dt * 0.9 * (ctx.v - cur) * 0.5 - dt * 0.2);
      if (ctx.bump > 0) { ctx.bump -= dt; ctx.v = Math.min(ctx.v, 0.8); }
      ctx.vx = UL.damp(ctx.vx, I.mx * 2.8, 4, dt);
      if (ctx.z > -LEN - 4) { ctx.z -= ctx.v * dt; ctx.x += ctx.vx * dt; }
      const c = cx(ctx.z); if (Math.abs(ctx.x - c) > HALF - 0.9) { ctx.x = c + Math.sign(ctx.x - c) * (HALF - 0.9); if (ctx.v > 3 && ctx.bump <= 0) { ctx.v *= 0.6; UL.Audio.sfx('chop'); } }
      // Felsen
      for (const r of ctx.rocks) { const dx = ctx.x - r.x, dz = ctx.z - r.z, d = Math.hypot(dx, dz); if (d < r.r + 0.75 && ctx.bump <= 0) { ctx.bump = 0.9; ctx.x += Math.sign(dx || 1) * 0.6; ctx.bad(r.log ? 'Treibholz gerammt!' : 'Rums – Felsen!', 'ugh'); ctx.me.f.play('hit'); ctx.stage.parts.burst(ctx.x, 0.4, ctx.z, 16, 2, 2, [0xffffff, 0xbfe6ff]); } }
      // Bojen
      for (const b of ctx.buoys) { b.s.rotation.y += dt * 2; b.g.position.y = 0.1 + Math.sin(ctx.t * 2 + b.z) * 0.06; if (!b.got && Math.abs(b.z - ctx.z) < 0.9 && Math.abs(b.x - ctx.x) < 1.1) { b.got = true; b.s.visible = false; ctx.addStar(new T.Vector3(b.x, 1, b.z)); } }
      this.place(ctx, ctx.me, ctx.x, ctx.z, -ctx.vx * 0.12); ctx.player.root.position.set(ctx.x, 0.4, ctx.z);
      ctx.me.pad.rotation.x = Math.sin(ctx.stroke * Math.PI) * 0.9; ctx.me.pad.position.x = ctx.stroke > 0 ? (ctx.t * 2 % 2 < 1 ? 0.7 : -0.7) : 0.7;
      if (Math.random() < dt * ctx.v * 1.5) ctx.stage.parts.burst(ctx.x + UL.rand(-0.9, 0.9), 0.15, ctx.z + 1.3, 3, 0.6, 0.8, [0xffffff, 0xdff4ff]);
      // Gegner: paddeln gleichmäßig, weichen Felsen aus
      for (const o of ctx.rivals) {
        if (o.done) { o.v = Math.max(0, o.v - dt * 2); }
        else { o.v = UL.damp(o.v, o.top, 0.8, dt); let want = cx(o.z - 4); for (const r of ctx.rocks) if (r.z < o.z && r.z > o.z - 7 && Math.abs(r.x - o.x) < 1.8) want = r.x + (r.x > cx(r.z) ? -2.2 : 2.2); o.x = UL.damp(o.x, UL.clamp(want, cx(o.z) - HALF + 1, cx(o.z) + HALF - 1), 1.2, dt); }
        o.z -= o.v * dt; if (!o.done && o.z <= -LEN) { o.done = 1; if (!ctx.place) { ctx.rivalFirst = (ctx.rivalFirst || 0) + 1; UL.Audio.sfx('boo'); UI_t(`${o.name} ist im Ziel!`); } }
        if (Math.hypot(o.x - ctx.x, o.z - ctx.z) < 1.5) { const s = Math.sign(ctx.x - o.x || 1); ctx.x += s * dt * 2; o.x -= s * dt * 2; }
        this.place(ctx, o.r, o.x, o.z, 0); if (!o.r.f.one && Math.random() < dt * 1.5) o.r.f.play('use', { speed: 1.4 });
      }
      // Ziel
      if (!ctx.place && ctx.z <= -LEN) {
        ctx.place = 1 + (ctx.rivalFirst || 0); UL.Audio.sfx('fanfare');
        const bonus = ctx.place === 1 ? 2 : ctx.place === 2 ? 1 : 0;
        UL.Trials.shout(ctx.place + '. PLATZ!', 'gold'); ctx.me.f.play('cheer');
        for (let i = 0; i < bonus; i++) UL.after(0.4 + i * 0.4, () => ctx.addStar(new T.Vector3(ctx.x, 1.5, ctx.z)));
        UL.after(2.2, () => ctx.end('ziel'));
      }
      const prog = UL.clamp(-ctx.z / LEN, 0, 1), ahead = ctx.rivals.filter(o => o.z < ctx.z).length;
      ctx.meters = [{ label: '🏁 Strecke', v: prog, color: '#3ad0ff' }, { label: '🚣 Tempo', v: (ctx.v - cur) / (7 - cur), color: ctx.combo > 2 ? '#ffd23a' : '#7ac05a' }];
      ctx.extraHud = `<span class="chip">🏅 Platz ${ctx.place || ahead + 1} / 3</span>${ctx.combo > 2 ? '<span class="chip">🥁 Im Takt!</span>' : ''}`;
      ctx.overlay(ctx.t < 6 ? `<div class="lbl">🚣 ${UL.In.glyph('ok')} im Takt drücken = paddeln · Stick = lenken</div>` : '');
      // Kamera hinter dem Floß
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(ctx.x * 0.6 + cx(ctx.z) * 0.4, port ? 6.5 : 4.4, ctx.z + (port ? 9 : 7)), 1 - Math.exp(-4 * dt)); { const lz = ctx.z - (port ? 2.5 : 6); ctx.cam.lookAt(cx(lz), 0.4, lz); }
      ctx.L.follow(ctx.x, ctx.z);
    },
    finish(ctx) { ctx.rivals.forEach((o, i) => UL.Tags.del('fl:' + i)); ctx.player.root.visible = true; },
    bot(dt, ctx, I) {
      if (ctx.beat > 0.45) I.ok = true;
      let want = cx(ctx.z - 3); const b = ctx.buoys.find(b => !b.got && b.z < ctx.z && b.z > ctx.z - 12); if (b) want = b.x;
      for (const r of ctx.rocks) if (r.z < ctx.z && r.z > ctx.z - 6 && Math.abs(r.x - ctx.x) < r.r + 1.2) want = r.x + (ctx.x > r.x ? 2 : -2);
      I.mx = UL.clamp((want - ctx.x) * 1.5, -1, 1);
    }
  });
  function UI_t(t) { UL.UI.toast(t, '🚣', 1600); }
})();

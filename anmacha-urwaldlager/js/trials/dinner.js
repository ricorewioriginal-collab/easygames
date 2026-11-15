/* Prüfung: Das Urwald-Dinner – erfundene Ekel-Gänge: im Takt kauen, Würgen ausbalancieren, schlucken */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R;

  // Gericht aus einfachen Formen
  function dish(kind, rng) {
    const g = new T.Group();
    const plate = new T.Mesh(new T.CylinderGeometry(0.26, 0.2, 0.03, 24), R.mat(0xf4f1ea)); g.add(plate);
    const add = (geo, c, x, y, z, s = 1) => { const m = new T.Mesh(geo, R.mat(c)); m.position.set(x, y, z); m.scale.setScalar(s); m.castShadow = true; g.add(m); return m; };
    if (kind === '🪱' || kind === '🐌') {   // Würmer / Schnecken
      for (let i = 0; i < 9; i++) { const pts = []; const a = rng.next() * 6, r = rng.range(0, 0.12); for (let k = 0; k < 5; k++) pts.push(new T.Vector3(Math.cos(a) * r + Math.sin(k + i) * 0.03 + k * 0.025 - 0.05, 0.03 + Math.sin(k * 1.7) * 0.01, Math.sin(a) * r + Math.cos(k * 1.3 + i) * 0.03)); add(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, 0.009, 5), kind === '🐌' ? 0x9a7a4a : 0xe8b0a0, 0, 0, 0); }
      if (kind === '🐌') for (let i = 0; i < 4; i++) add(new T.SphereGeometry(0.03, 8, 6), 0x8a5a2a, rng.range(-0.1, 0.1), 0.04, rng.range(-0.1, 0.1));
    } else if (kind === '🪳' || kind === '🦗' || kind === '🕷️') {
      for (let i = 0; i < 10; i++) { const b = add(new T.SphereGeometry(0.03, 8, 6), kind === '🦗' ? 0x5a7a2a : 0x3a2210, rng.range(-0.13, 0.13), 0.035, rng.range(-0.13, 0.13)); b.scale.set(1, 0.45, 1.6); b.rotation.y = rng.next() * 6; }
      if (kind === '🕷️') for (let i = 0; i < 16; i++) { const l = add(new T.CylinderGeometry(0.004, 0.004, 0.09, 4), 0x1a1208, rng.range(-0.12, 0.12), 0.04, rng.range(-0.12, 0.12)); l.rotation.set(rng.next() * 3, rng.next() * 3, rng.next() * 3); }
      add(new T.CylinderGeometry(0.16, 0.16, 0.02, 18), 0xc8a050, 0, 0.018, 0);   // Krokant / Soße
    } else if (kind === '👁️') {
      const glass = new T.Mesh(new T.CylinderGeometry(0.09, 0.07, 0.24, 16, 1, true), new T.MeshLambertMaterial({ color: 0xddeeff, transparent: true, opacity: 0.35, side: T.DoubleSide })); glass.position.y = 0.13; g.add(glass);
      add(new T.CylinderGeometry(0.085, 0.068, 0.18, 16), 0xc84a3a, 0, 0.1, 0);
      for (let i = 0; i < 4; i++) { const e = add(new T.SphereGeometry(0.03, 10, 8), 0xffffff, rng.range(-0.04, 0.04), 0.2, rng.range(-0.04, 0.04)); const p = add(new T.SphereGeometry(0.012, 6, 4), 0x111111, e.position.x, e.position.y + 0.022, e.position.z + 0.01); }
    } else if (kind === '🟢') {
      const s = add(new T.SphereGeometry(0.13, 16, 10), 0x6fdc3a, 0, 0.05, 0); s.scale.y = 0.55; s.material = new T.MeshLambertMaterial({ color: R.lin(0x6fdc3a), emissive: R.lin(0x1a4a0a) });
      for (let i = 0; i < 5; i++) add(new T.SphereGeometry(0.02, 6, 4), 0xfff2a0, rng.range(-0.07, 0.07), 0.11, rng.range(-0.07, 0.07));
    } else {   // Smoothie
      const glass = new T.Mesh(new T.CylinderGeometry(0.08, 0.065, 0.28, 16, 1, true), new T.MeshLambertMaterial({ color: 0xddeeff, transparent: true, opacity: 0.35, side: T.DoubleSide })); glass.position.y = 0.15; g.add(glass);
      add(new T.CylinderGeometry(0.075, 0.062, 0.24, 16), 0xb0a040, 0, 0.13, 0);
      const straw = add(new T.CylinderGeometry(0.006, 0.006, 0.3, 6), 0xff4fa0, 0.03, 0.27, 0); straw.rotation.z = 0.3;
    }
    return g;
  }

  UL.Trials.reg('dinner', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'evening', radius: 12, clear: [{ x: 0, z: 0, r: 5 }], seed: 33 },
    setup(ctx) {
      const sc = ctx.scene;
      // gedeckter Tisch mit Tischtuch, Kerzen; Moderatoren sitzen gegenüber
      const table = new T.Mesh(new T.BoxGeometry(2.6, 0.08, 1.4), R.mat(0x6b4426)); table.position.set(0, 0.85, 0); table.castShadow = table.receiveShadow = true; sc.add(table);
      const cloth = new T.Mesh(new T.BoxGeometry(2.62, 0.02, 1.0), R.mat(ctx.theme === 'studio' ? 0x2a2a44 : 0xf2eedd)); cloth.position.set(0, 0.9, 0); cloth.receiveShadow = true; sc.add(cloth);
      for (const x of [-1.2, 1.2]) for (const z of [-0.6, 0.6]) { const l = new T.Mesh(new T.BoxGeometry(0.08, 0.85, 0.08), R.mat(0x5a3a1e)); l.position.set(x, 0.42, z); sc.add(l); }
      if (UL.A.has('kd_candle_triple')) for (const x of [-0.9, 0.9]) { const c = UL.A.sized('kd_candle_triple', 0.3); c.position.set(x, 0.91, -0.3); sc.add(c); const f = R.fire(0.06); f.position.set(x, 1.2, -0.3); ctx.stage.add(f); }
      const cloche = new T.Mesh(new T.SphereGeometry(0.28, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ color: R.lin(0xd8dde4), emissive: R.lin(0x202428) })); cloche.position.set(0, 0.92, 0.2); cloche.castShadow = true; sc.add(cloche); ctx.cloche = cloche;
      const n = ctx.max;
      ctx.menu = ctx.rng.shuffle(UL.D.DISHES).slice(0, n);
      ctx.course = -1; ctx.phase = 'serve'; ctx.pt = 0; ctx.chews = 0; ctx.need = 0; ctx.bal = 0; ctx.balV = 0; ctx.swallow = 0; ctx.mk = 0; ctx.mkDir = 1; ctx.fails = 0; ctx.gag = 0;
      ctx.hostPos.set(0, 0, -1.25); ctx.hostRy = 0;
      ctx.player.root.position.set(0, 0, 1.25); ctx.player.root.rotation.y = Math.PI;
      ctx.intro = { pos: new T.Vector3(1.6, 1.8, 2.4), look: new T.Vector3(0, 1, 0) };
      // Stühle
      for (const z of [-1.25, 1.25]) { const s = UL.A.sized('kd_stool', 0.55); s.position.set(0, 0, z); sc.add(s); }
      ctx.tint = document.createElement('div'); ctx.tint.className = 'tint'; document.getElementById('ui').prepend(ctx.tint);
      ctx.cam.position.set(1.6, 1.8, 2.4); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { ctx.player.root.visible = false; this.next(ctx); },
    next(ctx) {
      ctx.course++;
      if (ctx.course >= ctx.menu.length) { ctx.end('alle'); return; }
      const [name, icon, lvl] = ctx.menu[ctx.course];
      if (ctx.plate) ctx.scene.remove(ctx.plate);
      ctx.plate = dish(icon, ctx.rng); ctx.plate.position.set(0, 0.92, 0.2); ctx.scene.add(ctx.plate); ctx.plate.visible = false;
      ctx.phase = 'serve'; ctx.pt = 0; ctx.chews = 0; ctx.need = Math.round((2 + lvl) * (ctx.short ? 0.8 : 1)); ctx.bal = 0; ctx.balV = 0; ctx.swallow = 0; ctx.lvl = lvl;
      ctx.zone = UL.clamp(0.32 - lvl * 0.04 - (ctx.k - 1) * 0.08, 0.14, 0.34); ctx.zoneX = 0.5;
      ctx.extraHud = `<span class="chip">🍽️ Gang ${ctx.course + 1}/${ctx.menu.length}: ${UL.esc(name)} ${icon}</span>`;
      ctx.cloche.position.y = 0.92; ctx.cloche.visible = true;
      UL.after(0.2, () => UL.UI.toast(['Lotte', 'Mats'][ctx.course % 2] + ': „Guten Appetit – ' + name + '!“', icon, 1800));
    },
    update(dt, ctx) {
      const I = ctx.inp; ctx.pt += dt;
      // Kamera: Ego-Sicht am Tisch, leichtes Schwanken beim Würgen
      const sway = ctx.gag * 0.06;
      ctx.cam.position.set(Math.sin(ctx.t * 7) * sway, 1.45 + Math.sin(ctx.t * 5) * sway * 0.5, 1.15);
      ctx.cam.lookAt(0, 0.95, -0.05);
      if (ctx.phase === 'serve') {
        ctx.cloche.position.y = 0.92 + Math.min(1, ctx.pt / 0.8) * 0.6;
        if (ctx.pt > 0.3) ctx.plate.visible = true;
        if (ctx.pt > 1.0) { ctx.cloche.visible = false; ctx.phase = 'chew'; ctx.pt = 0; }
      } else if (ctx.phase === 'chew' || ctx.phase === 'swallow') {
        // Takt-Marker pendelt; Zone springt nach jedem Bissen
        const sp = (0.9 + ctx.lvl * 0.25) * ctx.k;
        ctx.mk += ctx.mkDir * sp * dt; if (ctx.mk > 1) { ctx.mk = 1; ctx.mkDir = -1; } if (ctx.mk < 0) { ctx.mk = 0; ctx.mkDir = 1; }
        // Würgen: Zufallskräfte, ausgleichen mit dem Stick
        ctx.balV += (Math.random() - 0.5) * 3.2 * ctx.k * (0.6 + ctx.lvl * 0.3) * dt + Math.sign(ctx.bal) * 0.5 * ctx.k * dt;
        ctx.balV += I.mx * 2.6 * dt; ctx.balV *= Math.pow(0.35, dt);
        ctx.bal = UL.clamp(ctx.bal + ctx.balV * dt * 1.6, -1, 1);
        ctx.gag = UL.clamp(Math.abs(ctx.bal) * 1.1 - 0.2, 0, 1);
        if (Math.abs(ctx.bal) >= 1) { this.fail(ctx); return; }
        if (ctx.phase === 'chew' && I.ok) {
          if (Math.abs(ctx.mk - ctx.zoneX) < ctx.zone / 2) { ctx.chews++; UL.Audio.sfx('eat'); ctx.zoneX = 0.15 + Math.random() * 0.7; if (ctx.chews >= ctx.need) { ctx.phase = 'swallow'; ctx.pt = 0; } }
          else { ctx.balV += (Math.random() < 0.5 ? -1 : 1) * 1.4; UL.Audio.sfx('bad'); R.shake = 0.3; }
        }
        if (ctx.phase === 'swallow') {
          if (I.altD) { ctx.swallow += dt / 1.1; if (ctx.swallow >= 1) { UL.Audio.sfx('gulp'); ctx.addStar(new T.Vector3(0, 1.1, 0.2)); ctx.plate.visible = false; ctx.phase = 'pause'; ctx.pt = 0; } }
          else ctx.swallow = Math.max(0, ctx.swallow - dt * 0.6);
        }
      } else if (ctx.phase === 'pause') { if (ctx.pt > 0.9) this.next(ctx); return; }
      // Overlay
      const chewing = ctx.phase === 'chew';
      ctx.overlay(ctx.phase === 'serve' ? '' : `<div class="lbl">${chewing ? 'Kauen im Takt! ' + UL.In.glyph('ok') : 'Runterschlucken: ' + UL.In.glyph('alt') + ' halten'} ${UL.In.device === 'touch' ? '' : ''}</div>
        ${chewing ? `<div class="rhythm"><div class="zone" style="left:${(ctx.zoneX - ctx.zone / 2) * 100}%;width:${ctx.zone * 100}%"></div><div class="mk" style="left:${ctx.mk * 100}%"></div></div>` : `<div class="rhythm"><div class="zone" style="left:0;width:${ctx.swallow * 100}%;background:#ffcf3a"></div></div>`}
        <div class="bal"><div class="mk" style="left:${(ctx.bal * 0.5 + 0.5) * 100}%"></div></div>
        <div class="dots">${Array.from({ length: ctx.need }, (_, i) => `<i class="${i < ctx.chews ? 'on' : ''}"></i>`).join('')}</div>`);
      ctx.tint.style.background = `rgba(90,200,40,${(ctx.gag * 0.28).toFixed(2)})`;
      ctx.meters = [{ label: '🤮 Würg-Meter (ausgleichen!)', v: Math.abs(ctx.bal), danger: Math.abs(ctx.bal) > 0.7 }];
    },
    fail(ctx) {
      ctx.bad('Ausgespuckt! Kein Stern für diesen Gang.', 'yuck'); UL.Audio.sfx('slime');
      ctx.stage.parts.burst(0, 1.2, 0.6, 30, 1.5, 2, [0x6fdc3a, 0xc8a050, 0x9a7a4a]);
      ctx.phase = 'pause'; ctx.pt = 0; ctx.plate.visible = false; ctx.bal = 0; ctx.balV = 0; ctx.gag = 0; ctx.fails++;
    },
    finish(ctx) { if (ctx.tint) ctx.tint.remove(); ctx.player.root.visible = true; ctx.player.root.rotation.y = 0; ctx.player.root.position.set(0.9, 0, 1.6); ctx.player.play(ctx.stars >= ctx.max / 2 ? 'cheer' : 'hit'); },
    bot(dt, ctx, I) {
      I.mx = UL.clamp(-ctx.bal * 3 - ctx.balV * 0.8, -1, 1);
      if (ctx.phase === 'chew') { const nx = ctx.mk + ctx.mkDir * (0.9 + ctx.lvl * 0.25) * ctx.k * dt; if (Math.abs(nx - ctx.zoneX) < ctx.zone / 2 * 0.5) I.ok = true; }
      if (ctx.phase === 'swallow') I.altD = true;
    }
  });
})();

/* Prüfung: Das Urwald-Dinner – erfundene Ekel-Gänge: Happen selbst mit der Gabel aufspießen, kauen, Würgen ausgleichen, Drinks leeren (direkt gesteuert, ohne Takt-Balken) */
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
      g.userData.liquid = add(new T.CylinderGeometry(0.085, 0.068, 0.18, 16), 0xc84a3a, 0, 0.1, 0); g.userData.liquid.userData = { h: 0.18, y: 0.1 };
      for (let i = 0; i < 4; i++) { const e = add(new T.SphereGeometry(0.03, 10, 8), 0xffffff, rng.range(-0.04, 0.04), 0.2, rng.range(-0.04, 0.04)); const p = add(new T.SphereGeometry(0.012, 6, 4), 0x111111, e.position.x, e.position.y + 0.022, e.position.z + 0.01); }
    } else if (kind === '🟢') {
      const s = add(new T.SphereGeometry(0.13, 16, 10), 0x6fdc3a, 0, 0.05, 0); s.scale.y = 0.55; s.material = new T.MeshLambertMaterial({ color: R.lin(0x6fdc3a), emissive: R.lin(0x1a4a0a) });
      for (let i = 0; i < 5; i++) add(new T.SphereGeometry(0.02, 6, 4), 0xfff2a0, rng.range(-0.07, 0.07), 0.11, rng.range(-0.07, 0.07));
    } else {   // Smoothie
      const glass = new T.Mesh(new T.CylinderGeometry(0.08, 0.065, 0.28, 16, 1, true), new T.MeshLambertMaterial({ color: 0xddeeff, transparent: true, opacity: 0.35, side: T.DoubleSide })); glass.position.y = 0.15; g.add(glass);
      g.userData.liquid = add(new T.CylinderGeometry(0.075, 0.062, 0.24, 16), 0xb0a040, 0, 0.13, 0); g.userData.liquid.userData = { h: 0.24, y: 0.13 };
      const straw = add(new T.CylinderGeometry(0.006, 0.006, 0.3, 6), 0xff4fa0, 0.03, 0.27, 0); straw.rotation.z = 0.3;
    }
    return g;
  }

  // Ein Happen, der auf dem Teller zappelt (wird mit der Gabel aufgespießt)
  const BITE = { '🪱': [0xd88a8a, [1, 0.8, 3.2]], '🐌': [0x8a5a2a, [1.2, 1, 1.2]], '🪳': [0x3a2210, [1, 0.45, 1.6]], '🦗': [0x5a7a2a, [0.9, 0.5, 1.8]], '🕷️': [0x1e140e, [1.1, 0.6, 1.1]], '🟢': [0x6fdc3a, [1.3, 0.6, 1.3]] };
  function bite(kind) {
    const [c, sc] = BITE[kind] || BITE['🪳'], g = new T.Group();
    const b = new T.Mesh(new T.SphereGeometry(0.022, 10, 6), R.mat(c)); b.scale.set(sc[0], sc[1], sc[2]); b.castShadow = true; g.add(b);
    if (kind === '🐌') { const sh = new T.Mesh(new T.SphereGeometry(0.02, 8, 6), R.mat(0xc8a070)); sh.position.set(0, 0.018, -0.006); g.add(sh); }
    if (kind === '🕷️' || kind === '🪳' || kind === '🦗') for (let i = 0; i < 6; i++) { const l = new T.Mesh(new T.CylinderGeometry(0.0025, 0.0025, 0.04, 4), R.mat(0x140c08)); l.rotation.z = Math.PI / 2; l.rotation.y = (i % 3 - 1) * 0.5; l.position.set(i < 3 ? 0.02 : -0.02, 0, (i % 3 - 1) * 0.014); g.add(l); }
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
      // Gabel, die man selbst über den Teller führt
      const fork = ctx.fork = new T.Group(), steel = R.mat(0xd0d4da), inner = new T.Group(); inner.rotation.x = 0.85; fork.rotation.y = 0.55; fork.add(inner);
      const hd = new T.Mesh(new T.CylinderGeometry(0.007, 0.009, 0.2, 8), steel); hd.position.y = 0.15; inner.add(hd);
      const nk = new T.Mesh(new T.BoxGeometry(0.04, 0.012, 0.006), steel); nk.position.y = 0.05; inner.add(nk);
      for (let i = 0; i < 4; i++) { const tn = new T.Mesh(new T.CylinderGeometry(0.0028, 0.002, 0.05, 4), steel); tn.position.set(-0.015 + i * 0.01, 0.022, 0); inner.add(tn); }
      fork.traverse(o => { if (o.isMesh) o.castShadow = true; }); fork.visible = false; sc.add(fork);
      ctx.fp = new T.Vector2(0, 0.12); ctx.bites = [];
      ctx.cam.position.set(1.6, 1.8, 2.4); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { ctx.player.root.visible = false; this.next(ctx); },
    next(ctx) {
      ctx.course++;
      (ctx.bites || []).forEach(b => ctx.scene.remove(b.m)); ctx.bites = [];
      if (ctx.course >= ctx.menu.length) { ctx.end('alle'); return; }
      const [name, icon, lvl] = ctx.menu[ctx.course];
      if (ctx.plate) ctx.scene.remove(ctx.plate);
      ctx.plate = dish(icon, ctx.rng); ctx.plate.position.set(0, 0.92, 0.2); ctx.scene.add(ctx.plate); ctx.plate.visible = false;
      ctx.drink = icon === '👁️' || icon === '🍈';
      ctx.phase = 'serve'; ctx.pt = 0; ctx.chews = 0; ctx.need = Math.round((2 + lvl) * (ctx.short ? 0.8 : 1)); ctx.eaten = 0; ctx.bal = 0; ctx.balV = 0; ctx.lvl = lvl; ctx.level = 1; ctx.stab = 0; ctx.held = null;
      // Happen liegen sichtbar auf dem Teller und krabbeln/zappeln – man spießt sie selbst mit der Gabel auf
      if (!ctx.drink) for (let i = 0; i < ctx.need; i++) { const a = ctx.rng.next() * 6.28, r = ctx.rng.range(0.03, 0.15); const m = bite(icon); m.visible = false; ctx.scene.add(m); ctx.bites.push({ m, x: Math.cos(a) * r, z: Math.sin(a) * r, a: ctx.rng.next() * 6.28, sp: (0.025 + lvl * 0.01) * ctx.k, run: 0, ph: ctx.rng.next() * 6 }); }
      ctx.fp.set(0, 0.12);
      ctx.hudBase = ctx.extraHud = `<span class="chip">🍽️ Gang ${ctx.course + 1}/${ctx.menu.length}: ${UL.esc(name)} ${icon}</span>`;
      ctx.cloche.position.y = 0.92; ctx.cloche.visible = true;
      UL.after(0.2, () => UL.UI.toast(['Lotte', 'Mats'][ctx.course % 2] + ': „Guten Appetit – ' + name + '!“', icon, 1800));
    },
    update(dt, ctx) {
      const I = ctx.inp, G = UL.In.glyph; ctx.pt += dt;
      const PY = 0.935, PZ = 0.2;
      if (ctx.phase === 'serve') {
        ctx.cloche.position.y = 0.92 + Math.min(1, ctx.pt / 0.8) * 0.6;
        if (ctx.pt > 0.3) { ctx.plate.visible = true; ctx.bites.forEach(b => b.m.visible = true); }
        if (ctx.pt > 1.0) { ctx.cloche.visible = false; ctx.phase = ctx.drink ? 'drink' : 'aim'; ctx.pt = 0; ctx.fork.visible = !ctx.drink; }
      } else if (ctx.phase === 'pause') { if (ctx.pt > 0.9) this.next(ctx); }
      // Würgen: wirkt beim Kauen und Trinken, Stick links/rechts gleicht aus (sichtbar als Schwanken und Grünstich)
      const eating = ctx.phase === 'chew' || ctx.phase === 'drink';
      if (eating) {
        const drinking = ctx.phase === 'drink' && (I.altD || I.okD);
        ctx.balV += (Math.random() - 0.5) * 2.4 * ctx.k * (0.6 + ctx.lvl * 0.25) * (drinking || ctx.phase === 'chew' ? 1 : 0.4) * dt + Math.sign(ctx.bal) * 0.32 * ctx.k * dt;
        ctx.balV += I.mx * 3.2 * dt; ctx.balV *= Math.pow(0.35, dt);
        ctx.bal = UL.clamp(ctx.bal + ctx.balV * dt * 1.6, -1, 1);
        if (Math.abs(ctx.bal) >= 1) { this.fail(ctx); return; }
      } else { ctx.bal *= Math.pow(0.2, dt); ctx.balV = 0; }
      ctx.gag = UL.clamp(Math.abs(ctx.bal) * 1.1 - 0.2, 0, 1);
      // Bewohner des Tellers zappeln herum, flüchten nach einem Fehlstich
      for (const b of ctx.bites) {
        if (b.held) continue;
        b.run = Math.max(0, b.run - dt); b.a += (Math.random() - 0.5) * 4 * dt;
        const sp = b.sp * (b.run > 0 ? 4 : 1); b.x += Math.cos(b.a) * sp * dt; b.z += Math.sin(b.a) * sp * dt;
        const r = Math.hypot(b.x, b.z); if (r > 0.17) { b.x *= 0.17 / r; b.z *= 0.17 / r; b.a += Math.PI; }
        b.m.position.set(b.x, PY + 0.03 + Math.abs(Math.sin(ctx.t * 9 + b.ph)) * 0.008, PZ + b.z); b.m.rotation.y = -b.a + Math.PI / 2;
      }
      // Gabel selbst führen und zustechen
      const F = ctx.fork; let near = null;
      if (ctx.phase === 'aim') {
        ctx.fp.x = UL.clamp(ctx.fp.x + I.mx * 0.42 * dt, -0.2, 0.2); ctx.fp.y = UL.clamp(ctx.fp.y + I.my * 0.42 * dt, -0.2, 0.2);
        let nd = 0.045; for (const b of ctx.bites) { const d = Math.hypot(b.x - ctx.fp.x, b.z - ctx.fp.y); if (d < nd) { nd = d; near = b; } }
        if (I.ok && ctx.stab <= 0) ctx.stab = 0.32;
        if (ctx.stab > 0) {
          const was = ctx.stab; ctx.stab -= dt;
          if (was > 0.16 && ctx.stab <= 0.16) {
            if (near) { near.held = true; ctx.held = near; UL.Audio.sfx('crunch'); ctx.player.play('use'); }
            else { UL.Audio.sfx('tick'); ctx.bites.forEach(b => { if (Math.hypot(b.x - ctx.fp.x, b.z - ctx.fp.y) < 0.12) { b.run = 0.8; b.a = Math.atan2(b.z - ctx.fp.y, b.x - ctx.fp.x); } }); if (Math.random() < 0.4) UL.Trials.shout(UL.pick(['Daneben!', 'Halt still, du!', 'Das zappelt!']), 'green'); }
          }
          if (ctx.stab <= 0 && ctx.held) { ctx.phase = 'lift'; ctx.pt = 0; }
        }
        const dip = ctx.stab > 0 ? Math.sin((1 - ctx.stab / 0.32) * Math.PI) : 0;
        F.position.set(ctx.fp.x, PY + 0.13 - dip * 0.12, PZ + ctx.fp.y);
      } else if (ctx.phase === 'lift') {
        const k = UL.smooth(Math.min(1, ctx.pt / 0.55));
        F.position.set(UL.lerp(ctx.fp.x, 0, k), UL.lerp(PY + 0.1, 1.36, k), UL.lerp(PZ + ctx.fp.y, 0.98, k));
        if (ctx.pt > 0.55) { ctx.held.m.visible = false; F.visible = false; ctx.phase = 'chew'; ctx.pt = 0; ctx.chews = 0; UL.Audio.sfx('eat'); }
      } else if (ctx.phase === 'chew') {
        // Kauen: jeder Druck ein Biss – ganz ohne Takt-Balken
        if (I.ok) { ctx.chews++; ctx.bob = 1; UL.Audio.sfx(ctx.chews % 2 ? 'crunch' : 'eat'); ctx.balV += (Math.random() < 0.5 ? -1 : 1) * 0.25 * ctx.k; if (ctx.chews >= 3) { UL.Audio.sfx('gulp'); ctx.eaten++; ctx.bites.splice(ctx.bites.indexOf(ctx.held), 1); ctx.scene.remove(ctx.held.m); ctx.held = null; if (ctx.eaten >= ctx.need) this.win(ctx); else { ctx.phase = 'aim'; F.visible = true; ctx.pt = 0; } } }
      } else if (ctx.phase === 'drink') {
        // Trinken: halten, bis das Glas leer ist – das Glas leert sich sichtbar
        if (I.altD || I.okD) { ctx.level -= dt / (2.4 + ctx.lvl * 0.5); if (Math.random() < dt * 3) UL.Audio.sfx('gulp'); }
        const liq = ctx.plate.userData.liquid; if (liq) { const H = liq.userData.h, Y = liq.userData.y, s = Math.max(0.02, ctx.level); liq.scale.y = s; liq.position.y = Y - H / 2 + H * s / 2; }
        if (ctx.level <= 0) this.win(ctx);
      }
      ctx.bites.forEach(b => { if (!b.held) b.m.scale.setScalar(b === near ? 1.35 + Math.sin(ctx.t * 14) * 0.1 : 1); });
      // Kamera: Ego-Sicht am Tisch; Würgen lässt das Bild kippen, Kauen wippt
      ctx.bob = Math.max(0, (ctx.bob || 0) - dt * 6);
      const sway = ctx.gag * 0.06, drinkTilt = ctx.phase === 'drink' && (I.altD || I.okD) ? 0.08 : 0;
      ctx.cam.position.set(Math.sin(ctx.t * 7) * sway + ctx.bal * 0.05, 1.45 + Math.sin(ctx.t * 5) * sway * 0.5 - ctx.bob * 0.03 - drinkTilt * 0.6, 1.15 - drinkTilt * 1.4);
      ctx.cam.lookAt(0, 0.95 - ctx.bob * 0.02, -0.05); ctx.cam.rotateZ(ctx.bal * 0.38);
      // Hinweis statt Balken
      const face = ctx.gag > 0.7 ? '🤮' : ctx.gag > 0.4 ? '🤢' : ctx.gag > 0.15 ? '😬' : '🙂';
      const lbl = ctx.phase === 'aim' ? `🍴 Gabel führen und aufspießen: ${G('ok')}` : ctx.phase === 'chew' ? `😖 Kauen: ${G('ok')} drücken (${ctx.chews}/3) · Würgen mit dem Stick ausgleichen` : ctx.phase === 'drink' ? `🥤 Trinken: ${G('alt')} oder ${G('ok')} halten · Würgen mit dem Stick ausgleichen` : '';
      ctx.overlay(lbl ? `<div class="lbl">${lbl}</div>${ctx.drink ? '' : `<div class="dots">${Array.from({ length: ctx.need }, (_, i) => `<i class="${i < ctx.eaten ? 'on' : ''}"></i>`).join('')}</div>`}` : '');
      ctx.tint.style.background = `rgba(90,200,40,${(ctx.gag * 0.28).toFixed(2)})`;
      ctx.meters = [];
      ctx.extraHud = ctx.hudBase + `<span class="chip gag ${ctx.gag > 0.6 ? 'warn' : ''}">${face}</span>`;
    },
    win(ctx) { ctx.addStar(new T.Vector3(0, 1.1, 0.2)); ctx.plate.visible = false; ctx.fork.visible = false; ctx.phase = 'pause'; ctx.pt = 0; },
    fail(ctx) {
      ctx.bad('Ausgespuckt! Kein Stern für diesen Gang.', 'yuck'); UL.Audio.sfx('slime');
      ctx.stage.parts.burst(0, 1.2, 0.6, 30, 1.5, 2, [0x6fdc3a, 0xc8a050, 0x9a7a4a]);
      ctx.phase = 'pause'; ctx.pt = 0; ctx.plate.visible = false; ctx.fork.visible = false; ctx.bites.forEach(b => b.m.visible = false); ctx.held = null; ctx.bal = 0; ctx.balV = 0; ctx.gag = 0; ctx.fails++;
    },
    finish(ctx) { if (ctx.tint) ctx.tint.remove(); ctx.player.root.visible = true; ctx.player.root.rotation.y = 0; ctx.player.root.position.set(0.9, 0, 1.6); ctx.player.play(ctx.stars >= ctx.max / 2 ? 'cheer' : 'hit'); },
    bot(dt, ctx, I) {
      if (ctx.phase === 'aim') {
        let t = null, nd = 9; for (const b of ctx.bites) { const d = Math.hypot(b.x - ctx.fp.x, b.z - ctx.fp.y); if (d < nd) { nd = d; t = b; } }
        if (t) { I.mx = UL.clamp((t.x - ctx.fp.x) * 25, -1, 1); I.my = UL.clamp((t.z - ctx.fp.y) * 25, -1, 1); if (nd < 0.025 && ctx.stab <= 0) I.ok = true; }
        return;
      }
      I.mx = UL.clamp(-ctx.bal * 3 - ctx.balV * 0.8, -1, 1);
      if (ctx.phase === 'chew') { ctx._bt = (ctx._bt || 0) - dt; if (ctx._bt <= 0) { ctx._bt = 0.25; I.ok = true; } }
      if (ctx.phase === 'drink') I.altD = Math.abs(ctx.bal) < 0.6;
    }
  });
})();

/* Prüfung: Die Blindfahrt – mit verbundenen Augen Auto fahren, der Beifahrer sagt an, wohin; an den Stationen Sterne greifen, durch Schlamm- und Ekel-Duschen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const F = 13;   // halbe Feldgröße

  function jeep(studio) {
    const g = new T.Group(), red = R.mat(0xd8342a), dark = R.mat(0x222222), seat = R.mat(0x6a4a2a);
    const body = new T.Mesh(new T.BoxGeometry(1.7, 0.55, 3.0), red); body.position.y = 0.6; body.castShadow = true; g.add(body);
    const hood = new T.Mesh(new T.BoxGeometry(1.6, 0.25, 0.9), red); hood.position.set(0, 0.95, 1.0); g.add(hood);
    for (const [x, z] of [[-0.85, 1], [0.85, 1], [-0.85, -1], [0.85, -1]]) { const w = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.3, 14), dark); w.rotation.z = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); }
    for (const x of [-0.45, 0.45]) { const s = new T.Mesh(new T.BoxGeometry(0.6, 0.12, 0.6), seat); s.position.set(x, 0.92, -0.1); g.add(s); const b = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.12), seat); b.position.set(x, 1.2, -0.42); g.add(b); }
    const bench = new T.Mesh(new T.BoxGeometry(1.4, 0.12, 0.5), seat); bench.position.set(0, 0.92, -1.05); g.add(bench);
    const roll = new T.Mesh(new T.TorusGeometry(0.85, 0.05, 6, 16, Math.PI), R.mat(0xeeeeee)); roll.position.set(0, 1.0, -0.6); g.add(roll);
    const wheel = new T.Mesh(new T.TorusGeometry(0.2, 0.03, 6, 16), dark); wheel.position.set(-0.45, 1.25, 0.32); wheel.rotation.x = -0.9; g.add(wheel); g.userData.wheel = wheel;
    const ws = new T.Mesh(new T.BoxGeometry(1.6, 0.5, 0.05), new T.MeshLambertMaterial({ color: 0xaaddff, transparent: true, opacity: 0.35 })); ws.position.set(0, 1.25, 0.5); g.add(ws);
    if (studio) { const st = new T.Mesh(new T.BoxGeometry(1.72, 0.08, 3.02), R.mat(0xffd23a)); st.position.y = 0.7; g.add(st); }
    return g;
  }

  const CALL = { L: '⬅ LINKS!', LL: '⬅⬅ SCHARF LINKS!', R: 'RECHTS! ➡', RR: 'SCHARF RECHTS! ➡➡', G: '⬆ GERADEAUS!', S: '✋ LANGSAM!', X: '🛑 STOPP! Greif zu!', B: '⬇ ZURÜCK!', W: '⚠️ ACHTUNG, FASS!' };

  UL.Trials.reg('blind', {
    noCrawl: false,
    env: (theme) => theme === 'studio' ? { radius: 18 } : { tod: 'day', radius: 20, clear: [{ x: 0, z: 0, r: F + 1 }], seed: 23 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Parcours: Matschfeld mit Zaun, Fässer als Hindernisse, Stationen mit Sternen, Schlamm-Duschen
      const field = new T.Mesh(new T.PlaneGeometry(F * 2, F * 2), R.mat(studio ? 0x2a2833 : 0x7a5a36)); field.rotation.x = -Math.PI / 2; field.position.y = 0.01; field.receiveShadow = true; sc.add(field);
      for (let i = 0; i < 26; i++) { const m = new T.Mesh(new T.CircleGeometry(UL.rand(0.8, 2), 12), R.mat(studio ? 0x3a3846 : 0x5a3e22)); m.rotation.x = -Math.PI / 2; m.position.set(UL.rand(-F, F), 0.02, UL.rand(-F, F)); sc.add(m); }
      if (!studio) for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const f = A.sized('fence', 1); f.position.set(Math.cos(a) * (F + 0.4), 0, Math.sin(a) * (F + 0.4)); f.rotation.y = -a + Math.PI / 2; f.scale.x = 3.2; sc.add(f); }
      else { const ring = new T.Mesh(new T.TorusGeometry(F + 0.3, 0.12, 6, 48), new T.MeshBasicMaterial({ color: R.lin(0xff3a8c) })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.15; sc.add(ring); }
      // Stationen (Stern an einem Pfosten), Reihenfolge zufällig
      ctx.stations = [];
      const n = ctx.max;
      for (let i = 0; i < n; i++) {
        let x, z, ok = false, tries = 0;
        while (!ok && tries++ < 60) { const a = ctx.rng.next() * Math.PI * 2, r = ctx.rng.range(4, F - 2); x = Math.cos(a) * r; z = Math.sin(a) * r; ok = ctx.stations.every(s => Math.hypot(s.x - x, s.z - z) > 5); }
        const g = new T.Group(); g.position.set(x, 0, z); sc.add(g);
        const post = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 2.6, 6), R.mat(0xf2f2f2)); post.position.y = 1.3; g.add(post);
        for (let k = 0; k < 4; k++) { const band = new T.Mesh(new T.CylinderGeometry(0.085, 0.085, 0.3, 6), R.mat(0xd8342a)); band.position.y = 0.3 + k * 0.6; g.add(band); }
        const arm = new T.Mesh(new T.BoxGeometry(1.4, 0.08, 0.08), R.mat(0xf2f2f2)); arm.position.set(0.7, 2.5, 0); g.add(arm);
        const star = R.star(0.4); star.position.set(1.3, 2.0, 0); g.add(star);
        ctx.stations.push({ x, z, g, star, done: false });
      }
      // Fässer
      ctx.barrels = [];
      for (let i = 0; i < 16; i++) {
        let x, z, ok = false, tries = 0;
        while (!ok && tries++ < 60) { x = ctx.rng.range(-F + 1.5, F - 1.5); z = ctx.rng.range(-F + 1.5, F - 1.5); ok = Math.hypot(x, z) > 3.5 && ctx.stations.every(s => Math.hypot(s.x - x, s.z - z) > 2.6) && ctx.barrels.every(b => Math.hypot(b.x - x, b.z - z) > 2); }
        const b = A.sized('barrel', 0.9); b.position.set(x, 0, z); sc.add(b); ctx.barrels.push({ x, z, o: b });
      }
      // Schlamm- und Ekel-Duschen (Tor mit Kübel)
      ctx.showers = [];
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2 + 0.4, r = ctx.rng.range(5, 9), x = Math.cos(a) * r, z = Math.sin(a) * r;
        const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ctx.rng.next() * 3; sc.add(g);
        for (const s of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(0.18, 3.2, 0.18), R.mat(s < 0 ? 0xd8342a : 0xf2f2f2)); p.position.set(s * 1.5, 1.6, 0); g.add(p); }
        const top = new T.Mesh(new T.BoxGeometry(3.3, 0.25, 0.25), R.mat(0x5a3a1e)); top.position.y = 3.2; g.add(top);
        const bucket = new T.Mesh(new T.CylinderGeometry(0.5, 0.4, 0.6, 10), R.mat(0x3a7a3a)); bucket.position.y = 2.8; g.add(bucket);
        ctx.showers.push({ x, z, g, cd: 0, kind: i % 2 ? 'bugs' : 'mud' });
      }
      // Auto, Fahrer (Spieler) und Beifahrer
      ctx.car = jeep(studio); sc.add(ctx.car);
      ctx.pos = new T.Vector3(0, 0, 0); ctx.yaw = 0; ctx.v = 0;
      ctx.player.root.position.set(-0.45, 0.85, -0.1); ctx.player.root.scale.setScalar(0.9); ctx.car.add(ctx.player.root);
      const buddyLook = (ctx.opt.buddyLook) || (UL.D.CAST[1] && UL.D.CAST[1].look) || UL.D.DOC.look;
      ctx.co = UL.makeFig(buddyLook, 1.6); ctx.co.root.position.set(0.45, 0.85, -0.1); ctx.co.root.scale.setScalar(0.9); ctx.car.add(ctx.co.root); ctx.stage.figs.push(ctx.co);
      ctx.cur = 0; ctx.call = ''; ctx.callT = 0; ctx.mud = 0; ctx.grab = 0; ctx.hitCD = 0; ctx.wrongT = 0;
      ctx.hostPos.set(-4, 0, -3.5); ctx.hostRy = 0.8;
      ctx.intro = { pos: new T.Vector3(8, 7, 10), look: new T.Vector3(0, 0, 0) };
      UL.Trials.sign(ctx, -6.5, -3, 0.8);
      ctx.blind = document.createElement('div'); ctx.blind.className = 'tint blindfold'; document.getElementById('ui').prepend(ctx.blind);
      ctx.cam.position.set(0, 4, -7); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { ctx.player.set('sit'); ctx.co.set('sit'); ctx.blind.classList.add('on'); UL.Audio.sfx('gasp'); },
    say(ctx, key) {
      if (ctx.call === key && ctx.callT > 0) return;
      const fresh = ctx.call !== key; ctx.call = key; ctx.callT = 0.5;
      if (fresh) { UL.Audio.sfx('tick'); if (ctx.co && Math.random() < 0.4) ctx.co.play('interact', { speed: 1.5 }); }
      if (fresh && (key === 'X' || key === 'W') && UL.Voice && UL.Voice.say) UL.Voice.say(CALL[key].replace(/[^A-Za-zÄÖÜäöüß ,!]/g, '').trim(), 'mats');
    },
    update(dt, ctx) {
      const I = ctx.inp, p = ctx.pos, car = ctx.car;
      const st = ctx.stations[ctx.cur];
      // Fahren: Stick hoch = Gas, runter = rückwärts, links/rechts lenken, Aktion = bremsen und greifen
      const gas = -I.my, steer = I.mx;
      const vmax = 4.6, acc = 3.2;
      if (I.okD) ctx.v = UL.damp(ctx.v, 0, 8, dt);
      else if (Math.abs(gas) > 0.15) ctx.v = UL.clamp(ctx.v + gas * acc * dt, -2, vmax * (ctx.mud > 0 ? 0.6 : 1));
      else ctx.v = UL.damp(ctx.v, 0, 1.5, dt);
      ctx.yaw -= steer * 1.7 * dt * UL.clamp(ctx.v / 2, -1, 1);
      p.x += Math.sin(ctx.yaw) * ctx.v * dt; p.z += Math.cos(ctx.yaw) * ctx.v * dt;
      // Zaun
      const rr = Math.hypot(p.x, p.z); if (rr > F - 1) { p.x *= (F - 1) / rr; p.z *= (F - 1) / rr; if (Math.abs(ctx.v) > 1.5 && ctx.hitCD <= 0) { ctx.hitCD = 1; ctx.v = -ctx.v * 0.3; ctx.bad('Ab in den Zaun!', 'ugh'); } }
      // Fässer
      if (ctx.hitCD > 0) ctx.hitCD -= dt;
      for (const b of ctx.barrels) { const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz); if (d < 1.3) { p.x = b.x + dx / d * 1.3; p.z = b.z + dz / d * 1.3; if (ctx.hitCD <= 0 && Math.abs(ctx.v) > 1) { ctx.hitCD = 1.2; ctx.v *= -0.3; R.shake = 0.6; UL.Audio.sfx('bad'); ctx.bad('RUMMS – Fass gerammt!', 'scream'); b.o.rotation.z = 0.3; } } }
      car.position.set(p.x, 0, p.z); car.rotation.y = ctx.yaw; car.rotation.z = Math.sin(ctx.t * 13) * 0.012 * Math.abs(ctx.v);
      car.userData.wheel.rotation.z = -steer * 1.2;
      if (Math.abs(ctx.v) > 1 && Math.random() < dt * 10) ctx.stage.parts.burst(p.x - Math.sin(ctx.yaw) * 1.5, 0.2, p.z - Math.cos(ctx.yaw) * 1.5, 3, 1, 1.5, ctx.theme === 'studio' ? [0x8a8a9a] : [0x6a4a2a, 0x8a6a3a]);
      // Schlamm-/Ekel-Duschen
      if (ctx.mud > 0) ctx.mud -= dt;
      for (const s of ctx.showers) {
        if (s.cd > 0) { s.cd -= dt; continue; }
        if (Math.hypot(p.x - s.x, p.z - s.z) < 1.6) {
          s.cd = 6; ctx.mud = 3.5;
          ctx.stage.parts.burst(p.x, 3, p.z, 50, 2, -1, s.kind === 'mud' ? [0x5a3a1a, 0x7a5a2a, 0x3a2a12] : [0x2a1a0a, 0xefe0b8, 0x3a6a2a]);
          if (s.kind === 'bugs') { UL.Trials.crawl(10, ['roach', 'maggot', 'spider', 'beetle'], 4); ctx.bad('Kakerlaken-Regen!', 'scream'); }
          else { ctx.bad('Schlamm-Dusche!', 'yuck'); UL.Audio.sfx('slime'); }
        }
      }
      // Station: anhalten und greifen
      if (st) {
        const sx = st.x + Math.cos(st.g.rotation.y) * 1.3, sz = st.z;
        const dx = sx - p.x, dz = sz - p.z, dist = Math.hypot(dx, dz);
        if (dist < 2.0 && Math.abs(ctx.v) < 1.2 && (I.ok || I.okD)) {
          ctx.grab += dt * (I.okD ? 1 : 3);
          if (ctx.grab > 0.5) { st.done = true; st.star.visible = false; ctx.addStar(new T.Vector3(sx, 2, sz)); ctx.co.play('cheer'); ctx.cur++; ctx.grab = 0; UL.Audio.sfx('yay'); }
        } else ctx.grab = Math.max(0, ctx.grab - dt);
        // Ansage des Beifahrers
        ctx.callT -= dt; ctx.wrongT -= dt;
        let key;
        const ang = Math.atan2(dx, dz) - ctx.yaw; let a = Math.atan2(Math.sin(ang), Math.cos(ang));
        // Hindernis direkt voraus?
        let warn = false;
        for (const b of ctx.barrels) { const bx = b.x - p.x, bz = b.z - p.z, bd = Math.hypot(bx, bz); if (bd < 3.2 && ctx.v > 0.8) { const ba = Math.atan2(Math.sin(Math.atan2(bx, bz) - ctx.yaw), Math.cos(Math.atan2(bx, bz) - ctx.yaw)); if (Math.abs(ba) < 0.35 && bd < dist) warn = true; } }
        if (dist < 2.0) key = Math.abs(ctx.v) < 1.2 ? 'X' : 'S';
        else if (warn) key = 'W';
        else if (Math.abs(a) > 2.4 && dist < 4) key = 'B';
        else if (a > 0.9) key = 'LL'; else if (a > 0.22) key = 'L'; else if (a < -0.9) key = 'RR'; else if (a < -0.22) key = 'R';
        else key = dist < 5 ? 'S' : 'G';
        // Beifahrer verhaspelt sich ab und zu (sofort korrigiert)
        if (ctx.wrongT <= 0 && Math.random() < dt * 0.06 && (key === 'L' || key === 'R')) { ctx.wrongT = 0.7; ctx.wrongKey = key === 'L' ? 'R' : 'L'; }
        if (ctx.wrongT > 0) { key = ctx.wrongT > 0.25 ? ctx.wrongKey : key; }
        this.say(ctx, key);
        const txt = CALL[key] + (ctx.wrongT > 0 && ctx.wrongT <= 0.25 ? ' – nee, andersrum!' : '');
        ctx.overlay(`<div class="callout ${key === 'X' ? 'go' : key === 'W' || key === 'B' ? 'warn' : ''}">🗣️ ${txt}</div>${dist < 2 && Math.abs(ctx.v) < 1.2 ? `<div class="lbl">Aktion halten: Stern greifen <span class="bar"><i style="width:${Math.round(ctx.grab / 0.5 * 100)}%"></i></span></div>` : ''}`);
      } else ctx.end('alle');
      ctx.blind.style.opacity = ctx.mud > 0 ? 1 : 0.94;
      ctx.blind.classList.toggle('mud', ctx.mud > 0);
      ctx.extraHud = `<span class="chip">🚙 Station ${Math.min(ctx.cur + 1, ctx.stations.length)}/${ctx.stations.length}</span>`;
      // Kamera: hinter dem Auto
      const back = UL.portrait() ? 8 : 6.5, ch = UL.portrait() ? 5 : 3.8;
      ctx.cam.position.lerp(new T.Vector3(p.x - Math.sin(ctx.yaw) * back, ch, p.z - Math.cos(ctx.yaw) * back), 1 - Math.exp(-3 * dt));
      ctx.cam.lookAt(p.x + Math.sin(ctx.yaw) * 2, 1, p.z + Math.cos(ctx.yaw) * 2);
    },
    finish(ctx) { if (ctx.blind) ctx.blind.remove(); },
    bot(dt, ctx, I) {
      // folgt den Ansagen wie ein Mensch
      const k = ctx.call;
      I.my = k === 'G' ? -1 : k === 'S' ? (ctx.v > 1.6 ? 0 : -0.5) : k === 'X' ? 0 : k === 'B' ? 1 : k === 'W' ? 0.3 : -0.55;
      I.mx = k === 'L' ? -0.6 : k === 'LL' ? -1 : k === 'R' ? 0.6 : k === 'RR' ? 1 : k === 'W' ? 1 : 0;
      if (k === 'X' || (k === 'S' && ctx.v > 1.6)) I.okD = true;
    }
  });
})();

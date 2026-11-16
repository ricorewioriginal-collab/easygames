/* Prüfung: Der Wissens-Tank – im Glastank liegend Fragen beantworten; falsch = Schleim läuft nach, drei Fehler = Tank voll */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const QT = 15;   // Sekunden pro Frage

  UL.Trials.reg('quiz', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'evening', radius: 12, clear: [{ x: 0, z: 0, r: 5 }], seed: 77 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Glastank auf Gestell
      const tank = ctx.tank = new T.Group(); tank.position.set(0, 0.8, 0); sc.add(tank);
      const frame = R.mat(studio ? 0xc0c8d0 : 0x5a3a1e);
      for (const x of [-1.15, 1.15]) for (const z of [-0.5, 0.5]) { const l = new T.Mesh(new T.BoxGeometry(0.1, 0.8, 0.1), frame); l.position.set(x, -0.4, z); sc.add(l); l.position.y = 0.4; }
      const base = new T.Mesh(new T.BoxGeometry(2.4, 0.1, 1.1), frame); base.position.y = -0.02; tank.add(base);
      const glass = new T.Mesh(new T.BoxGeometry(2.3, 0.95, 1.0), new T.MeshLambertMaterial({ color: 0xcfefff, transparent: true, opacity: 0.22, depthWrite: false })); glass.position.y = 0.5; tank.add(glass);
      const edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2.3, 0.95, 1.0)), new T.LineBasicMaterial({ color: studio ? 0xffffff : 0xd9c08a })); edges.position.y = 0.5; tank.add(edges);
      // Schleim-Füllung
      ctx.slime = new T.Mesh(new T.BoxGeometry(2.24, 1, 0.94), new T.MeshLambertMaterial({ color: R.lin(0x6fdc3a), transparent: true, opacity: 0.7, depthWrite: false }));
      ctx.slime.position.y = 0.05; ctx.slime.scale.y = 0.001; tank.add(ctx.slime);
      // Rohre über dem Tank
      for (const x of [-0.7, 0, 0.7]) { const pp = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 1.4, 8), R.mat(0x8a8f99)); pp.position.set(x, 1.9, 0); sc.add(pp); }
      const bar = new T.Mesh(new T.BoxGeometry(2.0, 0.1, 0.1), R.mat(0x8a8f99)); bar.position.set(0, 2.6, 0); sc.add(bar);
      // Spieler liegt im Tank
      ctx.player.root.position.set(-0.85, 0.92, 0); ctx.player.root.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); ctx.player.root.scale.setScalar(0.92);
      ctx.player.root.rotation.order = 'YXZ'; ctx.player.root.rotation.set(Math.PI / 2 * 0, Math.PI / 2, 0); ctx.player.root.rotation.x = 0;
      ctx.lie = new T.Group(); ctx.lie.position.set(-0.95, 0.95, 0); sc.add(ctx.lie); ctx.lie.add(ctx.player.root); ctx.player.root.position.set(0, 0, 0); ctx.player.root.rotation.set(-Math.PI / 2, 0, 0); ctx.lie.rotation.y = -Math.PI / 2;
      ctx.hidden = []; ctx.player.root.traverse(o => { if (o.userData.gear === 'head' && o.visible) { o.visible = false; ctx.hidden.push(o); } });
      // Krabbeltiere, die mit dem Schleim kommen
      ctx.bugs = UL.Trials.bugs(sc, 40, 0x2a1a0a); ctx.bugs.list.forEach(b => { b.s = 0; }); ctx.bugs.sync(); ctx.bugN = 0;
      ctx.qs = ctx.rng.shuffle(UL.D.QUIZ).slice(0, ctx.max + 2);
      ctx.qi = -1; ctx.wrong = 0; ctx.fill = 0; ctx.fillTo = 0; ctx.sel = 0; ctx.qt = QT; ctx.lock = 0; ctx.prevX = 0; ctx.prevY = 0;
      ctx.hostPos.set(-2.6, 0, -0.9); ctx.hostRy = 0.8;
      ctx.intro = { pos: new T.Vector3(2.5, 2, 3), look: new T.Vector3(0, 1, 0) };
      UL.Trials.sign(ctx, 0, -3, 0);
      ctx.cam.position.set(2.4, 2.2, 3.2); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { this.next(ctx); },
    next(ctx) {
      ctx.qi++;
      if (ctx.qi >= ctx.qs.length || ctx.stars >= ctx.max) { ctx.end(ctx.stars >= ctx.max ? 'alle' : 'ende'); return; }
      const [q, ans] = ctx.qs[ctx.qi];
      ctx.order = ctx.rng.shuffle([0, 1, 2, 3]); ctx.right = ctx.order.indexOf(0); ctx.sel = 0; ctx.qt = QT / Math.max(0.85, ctx.k); ctx.lock = 0; ctx.answered = -1;
      this.draw(ctx);
      const who = ctx.qi % 2 ? 'mats' : 'lotte';
      UL.Voice.say(q, who);
    },
    draw(ctx) {
      const [q, ans] = ctx.qs[ctx.qi];
      // Gleiche Frage, noch offen: nur Zeit und Auswahl auffrischen – die Knöpfe bleiben stehen, damit kein Tipper verloren geht
      if (ctx.ui && ctx._drawn === ctx.qi && ctx.answered < 0) {
        const sm = ctx.ui.querySelector('.q small'); if (sm) sm.textContent = `⏱ ${Math.ceil(ctx.qt)} s · Fehler ${ctx.wrong}/3`;
        ctx.ui.querySelectorAll('button').forEach(b => b.classList.toggle('sel', +b.dataset.i === ctx.sel));
        return;
      }
      ctx._drawn = ctx.answered < 0 ? ctx.qi : -1;
      const el = ctx.overlay(`<div class="qa"><div class="q">Frage ${ctx.qi + 1}: ${UL.esc(q)}<br><small style="font-weight:600;opacity:.8">⏱ ${Math.ceil(ctx.qt)} s · Fehler ${ctx.wrong}/3</small></div>${ctx.order.map((o, i) => `<button data-i="${i}" class="${i === ctx.sel ? 'sel' : ''} ${ctx.answered >= 0 ? (i === ctx.right ? 'right' : i === ctx.answered ? 'wrong' : '') : ''}">${'ABCD'[i]}: ${UL.esc(ans[o])}</button>`).join('')}</div>`);
      el.querySelectorAll('button').forEach(b => b.onpointerdown = b.onclick = (e) => { if (e) e.preventDefault(); if (ctx.answered < 0 && ctx.running) { ctx.sel = +b.dataset.i; this.answer(ctx, ctx.sel); } });
    },
    answer(ctx, i) {
      ctx.answered = i; ctx.lock = 1.5;
      if (i === ctx.right) { ctx.addStar(new T.Vector3(0, 1.6, 0)); UL.UI.toast('Richtig!', '✅', 1200); }
      else { ctx.wrong++; ctx.fillTo = ctx.wrong / 3; ctx.bad(i < 0 ? 'Zeit abgelaufen!' : 'Falsch! Schleim marsch!', 'scream'); UL.Audio.sfx('slime'); ctx.pour = 1.2; ctx.bugN = Math.min(40, ctx.bugN + 13); }
      this.draw(ctx);
    },
    update(dt, ctx) {
      const I = ctx.inp;
      // Kamera: leicht schwebend um den Tank
      const a = 0.5 + Math.sin(ctx.t * 0.2) * 0.25;
      ctx.cam.position.set(Math.sin(a) * 2.9, 2.6, Math.cos(a) * 2.9); ctx.cam.lookAt(0, 0.95, 0);
      // Schleim steigt
      ctx.fill = UL.damp(ctx.fill, ctx.fillTo, 2, dt);
      ctx.slime.scale.y = Math.max(0.001, ctx.fill * 0.9); ctx.slime.position.y = 0.05 + ctx.fill * 0.45;
      if (ctx.pour > 0) { ctx.pour -= dt; if (Math.random() < 0.6) ctx.stage.parts.burst(UL.rand(-0.7, 0.7), 1.2, 0, 4, 0.3, -1, [0x6fdc3a, 0x9aff6a]); }
      ctx.bugs.list.forEach((b, i) => { if (i < ctx.bugN) { b.s = UL.damp(b.s, 0.06, 3, dt); b.r += (Math.random() - 0.5) * 5 * dt; b.x = UL.clamp((b.x || 0) + Math.sin(b.r) * 0.2 * dt, -1.05, 1.05); b.z = UL.clamp((b.z || 0) + Math.cos(b.r) * 0.2 * dt, -0.42, 0.42); b.y = 0.86 + ctx.fill * 0.85; } });
      ctx.bugs.sync();
      if (ctx.lock > 0) { ctx.lock -= dt; if (ctx.lock <= 0) { if (ctx.wrong >= 3) { ctx.end('voll'); return; } this.next(ctx); } return; }
      // Antwort wählen: Stick/Steuerkreuz/WASD
      const ex = Math.abs(I.mx) > 0.6 ? Math.sign(I.mx) : 0, ey = Math.abs(I.my) > 0.6 ? Math.sign(I.my) : 0;
      let ch = false;
      if (ex && ex !== ctx.prevX) { ctx.sel = (ctx.sel % 2 === 0 ? ctx.sel + 1 : ctx.sel - 1); ch = true; }
      if (ey && ey !== ctx.prevY) { ctx.sel = (ctx.sel + 2) % 4; ch = true; }
      ctx.prevX = ex; ctx.prevY = ey;
      if (ch) { UL.Audio.sfx('tick'); this.draw(ctx); }
      if (I.ok) { this.answer(ctx, ctx.sel); return; }
      ctx.qt -= dt; if (ctx.qt <= 0) { this.answer(ctx, -1); return; }
      if (((ctx.qt * 4) | 0) !== ctx._lastQt) { ctx._lastQt = (ctx.qt * 4) | 0; if (Math.ceil(ctx.qt) !== ctx._sec) { ctx._sec = Math.ceil(ctx.qt); this.draw(ctx); } }
      ctx.meters = [{ label: '🟢 Tank-Füllung', v: ctx.fill, danger: ctx.wrong >= 2 }];
    },
    finish(ctx) { ctx.hidden.forEach(o => { o.visible = true; }); ctx.scene.attach(ctx.player.root); ctx.player.root.scale.setScalar(1); ctx.player.root.rotation.set(0, 0, 0); ctx.player.root.position.set(1.6, 0, 0.9); ctx.player.play(ctx.stars >= ctx.max / 2 ? 'cheer' : 'hit'); },
    bot(dt, ctx, I) {
      // Testpilot kennt die Antwort meistens
      if (ctx.lock > 0 || ctx.answered >= 0) return;
      if (!ctx._bt) ctx._bt = 0.5; ctx._bt -= dt;
      if (ctx._bt <= 0) { ctx._bt = 0.5; ctx.sel = ctx.rng.chance(ctx.ai ? 0.35 + (ctx.ai.skill ?? 0.6) * 0.5 : 0.9) ? ctx.right : (ctx.right + 1) % 4; I.ok = true; }
    }
  });
})();

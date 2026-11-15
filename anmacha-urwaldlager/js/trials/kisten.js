/* Prüfung: Die fiesen Kisten – Hand in Kisten voller (virtueller) Krabbeltiere, Stern greifen, Ekel-Meter */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const IN = { w: 0.62, d: 0.5, h: 0.42 };   // Innenmaße einer Kiste
  const KINDS = ['kaefer', 'krabben', 'frosch', 'schleim', 'bienen', 'kaefer', 'krabben', 'mix'];
  const NAME = { kaefer: 'Kakerlaken', krabben: 'Krabben', frosch: 'Frösche', schleim: 'Schleim & Würmer', bienen: 'Brummer', mix: 'Alles zusammen' };

  function crate(mat, darkMat) {
    const g = new T.Group();
    const t = 0.04;
    const add = (w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m || mat); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); };
    add(IN.w + t * 2, t, IN.d + t * 2, 0, -t / 2, 0, darkMat);
    add(IN.w + t * 2, IN.h, t, 0, IN.h / 2, -IN.d / 2 - t / 2);
    add(IN.w + t * 2, IN.h, t, 0, IN.h / 2, IN.d / 2 + t / 2);
    add(t, IN.h, IN.d, -IN.w / 2 - t / 2, IN.h / 2, 0);
    add(t, IN.h, IN.d, IN.w / 2 + t / 2, IN.h / 2, 0);
    // Stroh am Boden
    const straw = new T.Mesh(new T.PlaneGeometry(IN.w, IN.d), R.mat(0xc9a04a)); straw.rotation.x = -Math.PI / 2; straw.position.y = 0.005; g.add(straw);
    return g;
  }

  UL.Trials.reg('kisten', {
    env: (theme) => theme === 'studio' ? {} : { tod: 'day', radius: 14, clear: [{ x: 0, z: 0, r: 6 }], seed: 21 },
    setup(ctx) {
      const sc = ctx.scene, n = ctx.max;
      ctx.boxes = [];
      const wood = R.mat(ctx.theme === 'studio' ? 0x2b2f3a : 0x8a5a32), dark = R.mat(ctx.theme === 'studio' ? 0x1a1d26 : 0x5a3a1e);
      // langer Tisch
      const tw = n * 0.85 + 0.6;
      const table = new T.Mesh(new T.BoxGeometry(tw, 0.08, 1.0), dark); table.position.set(0, 0.9, 0); table.castShadow = table.receiveShadow = true; sc.add(table);
      for (const x of [-tw / 2 + 0.1, tw / 2 - 0.1]) for (const z of [-0.4, 0.4]) { const l = new T.Mesh(new T.BoxGeometry(0.08, 0.9, 0.08), dark); l.position.set(x, 0.45, z); sc.add(l); }
      for (let i = 0; i < n; i++) {
        const c = crate(wood, dark); const x = (i - (n - 1) / 2) * 0.85; c.position.set(x, 0.94, 0); sc.add(c);
        const num = R.sign([String(i + 1)], 0.24, 0.24, { w: 64, h: 64, bg: '#ffcf3a', fg: '#000', accent: '#1b1300', font: '900 44px system-ui' }); num.position.set(x, 1.12, IN.d / 2 + 0.05); sc.add(num);
        const kind = KINDS[i % KINDS.length];
        const box = { i, x, y: 0.94, kind, group: c, star: null, crit: [], done: false };
        // Stern irgendwo im Stroh
        const st = R.star(0.16); st.rotation.x = -Math.PI / 2 + 0.3; st.position.set(x + ctx.rng.range(-0.2, 0.2), 0.94 + 0.04, ctx.rng.range(-0.15, 0.15)); sc.add(st); box.star = st;
        // Bewohner
        const cnt = Math.round((kind === 'mix' ? 14 : 10) * ctx.k * (ctx.short ? 1.1 : 1));
        if (kind === 'krabben' || kind === 'frosch' || kind === 'mix') {
          const m = kind === 'mix' ? 4 : 5;
          for (let k = 0; k < m; k++) { const a = new A.Animal(kind === 'frosch' || (kind === 'mix' && k % 2) ? 'frog' : 'crab', 0.13); a.root.position.set(x + ctx.rng.range(-0.22, 0.22), 0.95, ctx.rng.range(-0.16, 0.16)); a.root.rotation.y = ctx.rng.range(0, 6); sc.add(a.root); box.crit.push({ o: a.root, a, vx: 0, vz: 0, r: 0.07, t: ctx.rng.next() * 3 }); }
        }
        if (kind === 'bienen') {
          for (let k = 0; k < 4; k++) { const a = new A.Animal('bee', 0.1); a.root.position.set(x, 1.1, 0); sc.add(a.root); box.crit.push({ o: a.root, a, fly: true, ph: ctx.rng.next() * 6, r: 0.07 }); }
        }
        if (kind === 'schleim' || kind === 'mix') {
          const sl = new T.Mesh(new T.PlaneGeometry(IN.w, IN.d), new T.MeshLambertMaterial({ color: R.lin(0x6fdc3a), transparent: true, opacity: 0.78 })); sl.rotation.x = -Math.PI / 2; sl.position.set(x, 0.94 + 0.07, 0); sc.add(sl); box.slime = sl;
        }
        box.bugCount = kind === 'kaefer' || kind === 'mix' || kind === 'schleim' ? cnt : Math.round(cnt * 0.3);
        ctx.boxes.push(box);
      }
      // Krabbeltiere als Instanzen (Kakerlaken / Würmer)
      const total = ctx.boxes.reduce((s, b) => s + b.bugCount, 0);
      ctx.bugs = UL.Trials.bugs(sc, total, 0x3a2210);
      let bi = 0;
      ctx.boxes.forEach(b => { b.bugs = []; for (let k = 0; k < b.bugCount; k++) { const q = ctx.bugs.list[bi++]; q.box = b; q.x = b.x + ctx.rng.range(-0.25, 0.25); q.z = ctx.rng.range(-0.2, 0.2); q.y = b.y + 0.02; q.s = b.kind === 'schleim' ? 0.05 : 0.055; q.r = ctx.rng.range(0, 6); q.sp = ctx.rng.range(0.08, 0.2) * ctx.k; b.bugs.push(q); } });
      ctx.bugs.sync();
      // Hand (Handschuh aus einfachen Formen)
      const hand = ctx.hand = new T.Group(), skin = R.mat(0xf0c8a8);
      const palm = new T.Mesh(new T.BoxGeometry(0.1, 0.035, 0.11), skin); hand.add(palm);
      for (let f = 0; f < 4; f++) { const fi = new T.Mesh(new T.CylinderGeometry(0.011, 0.012, 0.07, 6), skin); fi.rotation.x = Math.PI / 2; fi.position.set(-0.036 + f * 0.024, 0, -0.085); hand.add(fi); }
      const th = new T.Mesh(new T.CylinderGeometry(0.012, 0.013, 0.06, 6), skin); th.rotation.z = Math.PI / 2.5; th.position.set(0.06, 0, -0.01); hand.add(th);
      const arm = new T.Mesh(new T.CylinderGeometry(0.035, 0.04, 0.5, 8), R.mat(ctx.look.shirt || 0xc8372d)); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0.02, 0.3); hand.add(arm);
      hand.traverse(o => { if (o.isMesh) o.castShadow = true; });
      hand.visible = false; sc.add(hand);
      ctx.player.root.position.set(0, 0, 1.6); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(-tw / 2 - 1.6, 0, 1.0); ctx.hostRy = 0.9;
      ctx.intro = { pos: new T.Vector3(0, 2.4, 3.6), look: new T.Vector3(0, 1, 0) };
      ctx.cur = 0; ctx.ekel = 0; ctx.stun = 0; ctx.grab = 0;
      ctx.hp = new T.Vector2(0, 0.18);   // Handposition in der Kiste (x, z)
      UL.Trials.sign(ctx, 0, -1.6, 0);
      ctx.cam.position.set(0, 2.4, 3.6); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { this.enter(ctx, 0); },
    enter(ctx, i) {
      while (i < ctx.boxes.length && ctx.boxes[i].done) i++;
      if (i >= ctx.boxes.length) { ctx.end('alle'); return; }
      ctx.cur = i; ctx.hp.set(0, 0.18); ctx.hand.visible = true;
      const b = ctx.boxes[i];
      ctx.player.root.visible = false;
      ctx.extraHud = `<span class="chip">📦 Kiste ${i + 1}: ${NAME[b.kind]}</span>`;
      UL.UI.toast('Kiste ' + (i + 1) + ': ' + NAME[b.kind], '📦', 1400);
    },
    update(dt, ctx) {
      const b = ctx.boxes[ctx.cur], I = ctx.inp; if (!b) return;
      // Kamera über der Kiste
      const cp = new T.Vector3(b.x, 1.72, 0.5); ctx.cam.position.lerp(cp, 1 - Math.exp(-6 * dt)); ctx.cam.lookAt(b.x, b.y, 0.02);
      // Bewohner bewegen (alle Kisten, damit es wuselt)
      for (const bx of ctx.boxes) {
        for (const q of bx.bugs) {
          q.r += (Math.random() - 0.5) * 6 * dt; q.x += Math.sin(q.r) * q.sp * dt; q.z += Math.cos(q.r) * q.sp * dt;
          const lx = q.x - bx.x; if (Math.abs(lx) > IN.w / 2 - 0.04) { q.x = bx.x + Math.sign(lx) * (IN.w / 2 - 0.04); q.r = -q.r; }
          if (Math.abs(q.z) > IN.d / 2 - 0.04) { q.z = Math.sign(q.z) * (IN.d / 2 - 0.04); q.r = Math.PI - q.r; }
        }
        for (const c of bx.crit) {
          c.a.update(dt);
          if (c.fly) { c.ph += dt * 2; c.o.position.set(bx.x + Math.sin(c.ph * 1.3) * 0.22, bx.y + 0.15 + Math.sin(c.ph * 3) * 0.05, Math.cos(c.ph) * 0.17); c.o.rotation.y = c.ph * 1.3 + Math.PI / 2; continue; }
          c.t -= dt; if (c.t <= 0) { c.t = 0.6 + Math.random() * 1.5; const a = Math.random() * 6.28, s = 0.08 * ctx.k; c.vx = Math.sin(a) * s; c.vz = Math.cos(a) * s; c.o.rotation.y = a; }
          c.o.position.x = UL.clamp(c.o.position.x + c.vx * dt, bx.x - IN.w / 2 + 0.07, bx.x + IN.w / 2 - 0.07); c.o.position.z = UL.clamp(c.o.position.z + c.vz * dt, -IN.d / 2 + 0.07, IN.d / 2 - 0.07);
        }
      }
      ctx.bugs.sync();
      if (b.slime) b.slime.position.y = b.y + 0.07 + Math.sin(ctx.t * 2) * 0.004;
      // Hand führen
      if (ctx.stun > 0) { ctx.stun -= dt; ctx.hand.position.set(b.x + ctx.hp.x, b.y + 0.5 + ctx.stun * 0.2, ctx.hp.y); }
      else {
        const sp = 0.42 * (b.slime ? 0.65 : 1);
        ctx.hp.x = UL.clamp(ctx.hp.x + I.mx * sp * dt, -IN.w / 2 + 0.06, IN.w / 2 - 0.06);
        ctx.hp.y = UL.clamp(ctx.hp.y + I.my * sp * dt, -IN.d / 2 + 0.06, IN.d / 2 - 0.06);
        if (I.ok && ctx.grab <= 0) ctx.grab = 0.45;
        let low = 0.12;
        if (ctx.grab > 0) { ctx.grab -= dt; low = 0.03 + Math.abs(ctx.grab - 0.22) * 0.4; }
        ctx.hand.position.set(b.x + ctx.hp.x, b.y + low, ctx.hp.y);
        ctx.hand.rotation.set(0, 0, Math.sin(ctx.t * 9) * 0.05);
        // Berührungen → Ekel
        const hx = b.x + ctx.hp.x, hz = ctx.hp.y; let touch = 0;
        for (const q of b.bugs) if ((q.x - hx) ** 2 + (q.z - hz) ** 2 < 0.06 * 0.06) { touch++; q.r += Math.PI; }
        for (const c of b.crit) if (!c.fly && (c.o.position.x - hx) ** 2 + (c.o.position.z - hz) ** 2 < 0.09 * 0.09) touch += 2;
        for (const c of b.crit) if (c.fly && Math.abs(c.o.position.y - (b.y + low)) < 0.08 && (c.o.position.x - hx) ** 2 + (c.o.position.z - hz) ** 2 < 0.08 * 0.08) touch += 3;
        if (b.slime) touch += (Math.abs(I.mx) + Math.abs(I.my)) * 0.3;
        ctx.ekel = UL.clamp(ctx.ekel + touch * dt * 0.55 * ctx.k - dt * 0.12, 0, 1);
        if (touch > 0.3 && ctx.t - (ctx._yk || 0) > 2.2 && Math.random() < dt * 1.5) { ctx._yk = ctx.t; UL.Audio.sfx(Math.random() < 0.5 ? 'yuck' : 'gasp'); if (Math.random() < 0.5) UL.Trials.shout(UL.pick(['Iiih, es krabbelt!', 'Bäh, glibberig!', 'Das bewegt sich!']), 'green'); }
        if (touch > 0.9 && Math.random() < dt * 3) UL.Audio.sfx('crunch');
        if (ctx.ekel >= 1) { ctx.ekel = 0.45; ctx.stun = 2.2; ctx.grab = 0; ctx.bad('Iiiih! Hand zurückgezogen!', 'yuck'); }
        // Stern greifen
        if (ctx.grab > 0.15 && ctx.grab < 0.32 && !b.done) {
          const s = b.star.position; if ((s.x - hx) ** 2 + (s.z - hz) ** 2 < 0.075 * 0.075) {
            b.done = true; ctx.addStar(s); b.star.visible = false; 
            ctx.hand.visible = false; UL.after(0.7, () => { if (ctx.running) this.enter(ctx, ctx.cur + 1); });
            ctx.cur = -1; return;
          }
        }
      }
      if (I.alt) { b.skipped = true; const nx = ctx.boxes.findIndex((x, i) => i > ctx.cur && !x.done); if (nx >= 0) this.enter(ctx, nx); else { const first = ctx.boxes.findIndex(x => !x.done && x !== b); if (first >= 0) this.enter(ctx, first); } }
      ctx.meters = [{ label: '🤢 Ekel', v: ctx.ekel, danger: ctx.ekel > 0.7 }];
      // Stern leuchtet leicht, wenn die Hand nah ist
      const d = Math.hypot(b.star.position.x - (b.x + ctx.hp.x), b.star.position.z - ctx.hp.y);
      b.star.scale.setScalar(0.16 * (1 + Math.max(0, 0.2 - d) * 1.5 + Math.sin(ctx.t * 6) * 0.03));
    },
    finish(ctx) { ctx.hand.visible = false; ctx.player.root.visible = true; ctx.player.root.position.set(0, 0, 1.4); ctx.player.root.rotation.y = 0; ctx.player.play(ctx.stars >= ctx.max / 2 ? 'cheer' : 'hit'); },
    bot(dt, ctx, I) {
      const b = ctx.boxes[ctx.cur]; if (!b || ctx.stun > 0) return;
      const tx = b.star.position.x - b.x - ctx.hp.x, tz = b.star.position.z - ctx.hp.y, d = Math.hypot(tx, tz);
      if (d > 0.03) { I.mx = UL.clamp(tx * 12, -1, 1); I.my = UL.clamp(tz * 12, -1, 1); } else if (ctx.grab <= 0) I.ok = true;
    }
  });
})();

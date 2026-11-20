/* Prüfung: Die fiesen Kisten – selbst am Kistentisch entlanglaufen, an einer Kiste die Hand hineinstecken, zwischen Krabbeltieren den Stern greifen */
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
    const straw = new T.Mesh(new T.PlaneGeometry(IN.w, IN.d), R.mat(0x8a6a36)); straw.rotation.x = -Math.PI / 2; straw.position.y = 0.005; g.add(straw);
    return g;
  }

  // Realistische Hand: Handfläche, vier Finger mit zwei Gliedern und Nägeln, Daumen, Handgelenk, Ärmel mit Bündchen; Finger krümmen sich beim Greifen
  function makeHand(sleeveCol) {
    const g = new T.Group(), skin = new T.MeshLambertMaterial({ color: R.lin(0xe0a98c) }), skinD = new T.MeshLambertMaterial({ color: R.lin(0xd29a7d) }), nail = new T.MeshLambertMaterial({ color: R.lin(0xf3d2c6) });
    const hand = new T.Group(); hand.rotation.x = -0.22; g.add(hand);
    const palm = new T.Mesh(new T.SphereGeometry(0.05, 16, 10), skin); palm.scale.set(0.92, 0.36, 1.08); palm.position.z = -0.005; hand.add(palm);
    const back = new T.Mesh(new T.SphereGeometry(0.046, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), skinD); back.scale.set(0.95, 0.3, 1.05); back.position.set(0, 0.004, -0.005); hand.add(back);
    const seg = (len, r0, r1, m) => { const c = new T.Mesh(new T.CylinderGeometry(r1, r0, len, 10), m || skin); c.rotation.x = Math.PI / 2; c.position.z = -len / 2; return c; };
    const fingers = [];
    const L = [0.056, 0.066, 0.062, 0.048], X = [0.031, 0.0105, -0.0105, -0.03], W = [0.0088, 0.0094, 0.0092, 0.0082];
    for (let i = 0; i < 4; i++) {
      const pr = new T.Group(); pr.position.set(X[i], 0, -0.052 + Math.abs(X[i]) * 0.18); hand.add(pr);
      const l1 = L[i] * 0.56, l2 = L[i] * 0.44, w = W[i];
      pr.add(new T.Mesh(new T.SphereGeometry(w * 1.08, 10, 8), skin)); pr.add(seg(l1, w * 1.05, w * 0.95));
      const di = new T.Group(); di.position.z = -l1; pr.add(di);
      di.add(new T.Mesh(new T.SphereGeometry(w * 0.96, 10, 8), skin)); di.add(seg(l2, w * 0.95, w * 0.82));
      const tip = new T.Mesh(new T.SphereGeometry(w * 0.84, 10, 8), skin); tip.position.z = -l2; di.add(tip);
      const nl = new T.Mesh(new T.SphereGeometry(w * 0.7, 8, 6), nail); nl.scale.set(1, 0.32, 1.25); nl.position.set(0, w * 0.62, -l2 + w * 0.3); di.add(nl);
      pr.rotation.y = (X[i]) * 1.2; fingers.push({ pr, di });
    }
    // Daumen (rechte Hand, Handfläche nach unten: Daumen links)
    const th = new T.Group(); th.position.set(-0.042, -0.004, -0.008); th.rotation.set(-0.1, 0.75, 0.35); hand.add(th);
    th.add(new T.Mesh(new T.SphereGeometry(0.0115, 10, 8), skin)); th.add(seg(0.03, 0.0118, 0.0105));
    const td = new T.Group(); td.position.z = -0.03; th.add(td); td.add(new T.Mesh(new T.SphereGeometry(0.0105, 10, 8), skin)); td.add(seg(0.026, 0.0104, 0.0092));
    const tt = new T.Mesh(new T.SphereGeometry(0.0094, 10, 8), skin); tt.position.z = -0.026; td.add(tt);
    // Handgelenk, Unterarm im Ärmel – schräg nach oben zur Kamera, damit der Arm über die Kistenwand ragt
    const arm = new T.Group(); arm.position.set(0, 0.004, 0.045); arm.rotation.x = -0.9; g.add(arm);
    const wr = new T.Mesh(new T.CylinderGeometry(0.026, 0.029, 0.09, 12), skin); wr.rotation.x = Math.PI / 2; wr.position.z = 0.04; arm.add(wr);
    const cuff = new T.Mesh(new T.TorusGeometry(0.036, 0.008, 8, 18), new T.MeshLambertMaterial({ color: R.lin(0xe8dcb4) })); cuff.position.z = 0.085; arm.add(cuff);
    const sl = new T.Mesh(new T.CylinderGeometry(0.037, 0.045, 0.5, 14), new T.MeshLambertMaterial({ color: R.lin(sleeveCol) })); sl.rotation.x = Math.PI / 2; sl.position.z = 0.34; arm.add(sl);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    // c = 0 locker, 1 zugegriffen
    g.userData.curl = (c) => { fingers.forEach((f, i) => { f.pr.rotation.x = -0.18 - c * 1.05 - i * 0.02; f.di.rotation.x = -0.22 - c * 1.15; }); th.rotation.y = 0.75 - c * 0.55; td.rotation.y = -c * 0.5; };
    g.userData.curl(0);
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
        const box = { i, x, y: 0.94, kind, group: c, num, star: null, crit: [], done: false };
        // Stern irgendwo im Stroh
        const st = R.star(0.16); st.rotation.x = -Math.PI / 2 + 0.3; st.position.set(x + ctx.rng.range(-0.2, 0.2), 0.94 + 0.1, ctx.rng.range(-0.15, 0.12)); sc.add(st); box.star = st;
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
      // Hand: realistisch geformt, Ärmel in Camp-Khaki
      const hand = ctx.hand = makeHand(0x8a7a52);
      hand.visible = false; sc.add(hand);
      // Tippen/Klicken in die Kiste: Hand fährt dorthin und greift zu (Handy, Maus); der Stick bleibt zusätzlich
      ctx.ray = new T.Raycaster(); ctx.tap = null;
      ctx._pd = (e) => {
        if (ctx.mode !== 'box' || !ctx.running || UL.paused || (e.target && e.target.closest && e.target.closest('button, .panel, #cap, #cmd'))) return;
        const b = ctx.boxes[ctx.cur]; if (!b) return;
        const el = R.renderer.domElement.getBoundingClientRect(), v = new T.Vector2((e.clientX - el.left) / el.width * 2 - 1, -(e.clientY - el.top) / el.height * 2 + 1);
        ctx.ray.setFromCamera(v, ctx.cam); const pl = new T.Plane(new T.Vector3(0, 1, 0), -(b.y + 0.05)), hit = new T.Vector3();
        if (!ctx.ray.ray.intersectPlane(pl, hit)) return;
        const lx = hit.x - b.x, lz = hit.z; if (Math.abs(lx) > IN.w / 2 + 0.08 || Math.abs(lz) > IN.d / 2 + 0.08) return;
        ctx.tap = new T.Vector2(UL.clamp(lx, -IN.w / 2 + 0.06, IN.w / 2 - 0.06), UL.clamp(lz, -IN.d / 2 + 0.06, IN.d / 2 - 0.06));
      };
      addEventListener('pointerdown', ctx._pd);
      ctx.player.root.position.set(0, 0, 1.6); ctx.player.root.rotation.y = Math.PI;
      ctx.hostPos.set(-tw / 2 - 1.6, 0, 1.0); ctx.hostRy = 0.9;
      ctx.intro = { pos: new T.Vector3(0, 2.4, 3.6), look: new T.Vector3(0, 1, 0) };
      ctx.cur = 0; ctx.ekel = 0; ctx.stun = 0; ctx.grab = 0;
      ctx.hp = new T.Vector2(0, 0.18);   // Handposition in der Kiste (x, z)
      UL.Trials.sign(ctx, 0, -1.6, 0);
      ctx.cam.position.set(0, 2.4, 3.6); ctx.cam.lookAt(0, 1, 0);
    },
    start(ctx) { this.leave(ctx); },
    // Laufen: Figur selbst vor dem Tisch bewegen, an einer Kiste mit Aktion hineingreifen
    leave(ctx) {
      ctx.mode = 'walk'; ctx.cur = -1; ctx.hand.visible = false; ctx.player.root.visible = true; ctx.tap = null;
      ctx.boxes.forEach(b => { if (b.num) b.num.visible = true; b.star.renderOrder = 0; b.star.traverse(o => { if (o.isSprite) o.scale.setScalar(2.4); else if (o.material && o.material.depthTest === false) { o.material.depthTest = true; o.material.transparent = false; } }); });
      UL.UI.hint({ move: 'Laufen', ok: 'Hand in die Kiste', okT: 'Greifen', select: 'Halten: Abbruch' });
      const n = ctx.boxes.filter(b => b.done).length;
      ctx.extraHud = `<span class="chip">📦 ${n}/${ctx.boxes.length} Kisten geschafft</span>`;
    },
    walk(dt, ctx) {
      const I = ctx.inp, f = ctx.player, p = f.root.position, tw = ctx.boxes.length * 0.85;
      const m = Math.min(1, Math.hypot(I.mx, I.my));
      if (m > 0.15) {
        p.x = UL.clamp(p.x + I.mx * 2.2 * dt, -tw / 2, tw / 2); p.z = UL.clamp(p.z + I.my * 2.2 * dt, 0.75, 2.6);
        f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(I.mx, I.my), 10, dt);
      } else f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.PI, 4, dt);
      f.move(m > 0.15 ? 2.2 * m : 0);
      let near = null; for (const b of ctx.boxes) if (!b.done && Math.abs(b.x - p.x) < 0.42 && p.z < 1.5) near = b;
      ctx.boxes.forEach(b => { if (b.num) b.num.scale.setScalar(b === near ? 1.3 + Math.sin(ctx.t * 8) * 0.1 : 1); });
      const G = UL.In.glyph;
      ctx.overlay(near ? `<div class="lbl">📦 Kiste ${near.i + 1}: ${NAME[near.kind]} – ${G('ok')} Hand hineinstecken</div>` : '<div class="lbl">🚶 Lauf zu einer Kiste am Tisch</div>');
      if (near && I.ok) { f.root.rotation.y = Math.PI; f.play('use'); this.enter(ctx, near.i); }
      const port = UL.portrait();
      ctx.cam.position.lerp(new T.Vector3(p.x * 0.85, port ? 2.9 : 2.3, p.z + (port ? 3.4 : 2.6)), 1 - Math.exp(-5 * dt)); ctx.cam.lookAt(p.x * 0.9, 1.0, p.z - 1.2);
      ctx.meters = [{ label: '🤢 Ekel', v: ctx.ekel, danger: ctx.ekel > 0.7 }];
      ctx.ekel = Math.max(0, ctx.ekel - dt * 0.12);
    },
    enter(ctx, i) {
      while (i < ctx.boxes.length && ctx.boxes[i].done) i++;
      if (i >= ctx.boxes.length) { ctx.end('alle'); return; }
      ctx.mode = 'box'; ctx.cur = i; ctx.hp.set(0, 0.18); ctx.hand.visible = true; ctx.tap = null;
      const touch = UL.In.device === 'touch';
      ctx.overlay(`<div class="lbl">${touch ? '👆 Tipp auf den Stern – die Hand greift dort zu' : `✋ Hand führen, ${UL.In.glyph('ok')} greifen · ${UL.In.glyph('alt')} raus`}</div>`);
      UL.UI.hint({ move: 'Hand führen', ok: 'Greifen', alt: 'Raus aus der Kiste', altT: 'Raus', select: 'Halten: Abbruch' });
      const b = ctx.boxes[i];
      // Stern immer sichtbar: über Schleim und Tieren, leuchtend
      b.star.traverse(o => { if (o.isSprite) { o.scale.setScalar(1.4); return; } if (o.material) { o.material = o.material.clone(); o.material.depthTest = false; o.material.transparent = true; } }); b.star.renderOrder = 10;
      if (b.num) b.num.visible = false;
      ctx.player.root.visible = false;
      ctx.extraHud = `<span class="chip">📦 Kiste ${i + 1}: ${NAME[b.kind]}</span>`;
      UL.UI.toast('Kiste ' + (i + 1) + ': ' + NAME[b.kind], '📦', 1400);
    },
    update(dt, ctx) {
      if (ctx.mode !== 'box') { this.walk(dt, ctx); return; }
      const b = ctx.boxes[ctx.cur], I = ctx.inp; if (!b) return;
      // Kamera über der Kiste
      // Kamera fast senkrecht über der Kiste, Abstand passend zum Bildformat (hochkant ganze Kiste sichtbar, Vorderwand verdeckt nichts)
      const cam = ctx.cam, vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * cam.aspect), dist = Math.max((IN.w + 0.12) / 2 / Math.tan(hf), (IN.d + 0.12) / 2 / Math.tan(vf)) * 1.04;
      const cp = new T.Vector3(b.x, b.y + dist, 0.2); cam.position.lerp(cp, 1 - Math.exp(-6 * dt)); cam.lookAt(b.x, b.y, -0.03);
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
        if (Math.hypot(I.mx, I.my) > 0.15) ctx.tap = null;
        if (ctx.tap) {   // zum Tipp-Punkt fahren, dort zugreifen
          const dx = ctx.tap.x - ctx.hp.x, dz = ctx.tap.y - ctx.hp.y, d = Math.hypot(dx, dz), st = sp * 1.5 * dt;
          if (d > st) { I.mx = dx / d * 1.5; I.my = dz / d * 1.5; } else { ctx.hp.copy(ctx.tap); I.mx = I.my = 0; ctx.tap = null; if (ctx.grab <= 0) ctx.grab = 0.45; }
        }
        ctx.hp.x = UL.clamp(ctx.hp.x + I.mx * sp * dt, -IN.w / 2 + 0.06, IN.w / 2 - 0.06);
        ctx.hp.y = UL.clamp(ctx.hp.y + I.my * sp * dt, -IN.d / 2 + 0.06, IN.d / 2 - 0.06);
        if (I.ok && ctx.grab <= 0) ctx.grab = 0.45;
        ctx.hand.userData.curl(ctx.grab > 0 ? Math.sin(UL.clamp((0.45 - ctx.grab) / 0.45, 0, 1) * Math.PI) : 0.08 + Math.sin(ctx.t * 5) * 0.04);
        let low = 0.12;
        if (ctx.grab > 0) { ctx.grab -= dt; low = 0.03 + Math.abs(ctx.grab - 0.22) * 0.4; }
        ctx.hand.position.set(b.x + ctx.hp.x, b.y + low, ctx.hp.y);
        ctx.hand.rotation.set(0, 0, Math.sin(ctx.t * 7) * 0.035);
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
            ctx.hand.visible = false; UL.after(0.7, () => { if (ctx.running) { if (ctx.boxes.every(x => x.done)) ctx.end('alle'); else this.leave(ctx); } });
            ctx.cur = -1; return;
          }
        }
      }
      if (I.alt) { this.leave(ctx); return; }
      ctx.meters = [{ label: '🤢 Ekel', v: ctx.ekel, danger: ctx.ekel > 0.7 }];
      // Stern leuchtet leicht, wenn die Hand nah ist
      const d = Math.hypot(b.star.position.x - (b.x + ctx.hp.x), b.star.position.z - ctx.hp.y);
      b.star.scale.setScalar(0.16 * (1 + Math.max(0, 0.2 - d) * 1.5 + Math.sin(ctx.t * 6) * 0.03));
    },
    finish(ctx) { removeEventListener('pointerdown', ctx._pd); ctx.hand.visible = false; ctx.player.root.visible = true; ctx.player.root.position.set(0, 0, 1.4); ctx.player.root.rotation.y = 0; ctx.player.play(ctx.stars >= ctx.max / 2 ? 'cheer' : 'hit'); },
    bot(dt, ctx, I) {
      if (ctx.mode !== 'box') { const t = ctx.boxes.find(x => !x.done), p = ctx.player.root.position; if (!t) return; const dx = t.x - p.x, dz = 1.0 - p.z; if (Math.abs(dx) > 0.2 || Math.abs(dz) > 0.3) { I.mx = UL.clamp(dx * 4, -1, 1); I.my = UL.clamp(dz * 4, -1, 1); } else I.ok = true; return; }
      const b = ctx.boxes[ctx.cur]; if (!b || ctx.stun > 0) return;
      const tx = b.star.position.x - b.x - ctx.hp.x, tz = b.star.position.z - ctx.hp.y, d = Math.hypot(tx, tz);
      if (d > 0.03) { I.mx = UL.clamp(tx * 12, -1, 1); I.my = UL.clamp(tz * 12, -1, 1); } else if (ctx.grab <= 0) I.ok = true;
    }
  });
})();

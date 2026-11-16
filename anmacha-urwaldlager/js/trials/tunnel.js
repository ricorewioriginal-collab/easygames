/* Prüfung: Der Krabbeltunnel – mit Stirnlampe durch ein enges Tunnelsystem kriechen, Sterne aus den Sackgassen holen */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const CS = 2.2, WT = 0.3, HT = 1.15;   // Zellgröße, Wanddicke, Tunnelhöhe

  function maze(w, h, rng) {
    const cells = []; for (let i = 0; i < w * h; i++) cells.push({ n: true, s: true, e: true, w: true, v: false });
    const st = [[0, 0]]; cells[0].v = true;
    while (st.length) {
      const [x, y] = st[st.length - 1];
      const nb = [[x, y - 1, 'n', 's'], [x, y + 1, 's', 'n'], [x + 1, y, 'e', 'w'], [x - 1, y, 'w', 'e']].filter(([a, b]) => a >= 0 && b >= 0 && a < w && b < h && !cells[b * w + a].v);
      if (!nb.length) { st.pop(); continue; }
      const [a, b, d, o] = rng.pick(nb); cells[y * w + x][d] = false; cells[b * w + a][o] = false; cells[b * w + a].v = true; st.push([a, b]);
    }
    // ein paar Querverbindungen, damit es nicht zu verwinkelt ist
    for (let i = 0; i < Math.round(w * h * 0.08); i++) { const x = rng.int(0, w - 2), y = rng.int(0, h - 1); cells[y * w + x].e = false; cells[y * w + x + 1].w = false; }
    return cells;
  }

  UL.Trials.reg('tunnel', {
    env: () => ({ none: true }),
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      sc.background = R.lin(0x020302); sc.fog = new T.Fog(R.lin(0x020302), 1, 11);
      sc.add(new T.AmbientLight(0xffffff, 0.07));
      const W = ctx.short ? 5 : 7, Hh = ctx.short ? 4 : 5;
      ctx.W = W; ctx.H = Hh; ctx.cells = maze(W, Hh, ctx.rng);
      const ox = -W * CS / 2, oz = -Hh * CS / 2; ctx.ox = ox; ctx.oz = oz;
      // Erd-/Bretter-Textur mit Wurzeln, Steinen und Schleimspuren
      const tex = (base, dark, lite, slime) => {
        const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
        g.fillStyle = base; g.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? dark : lite; g.globalAlpha = Math.random() * 0.35; g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 2); }
        g.globalAlpha = 0.5; g.strokeStyle = dark; g.lineWidth = 2;
        for (let i = 0; i < 6; i++) { g.beginPath(); let x = Math.random() * 128, y = 0; g.moveTo(x, y); while (y < 128) { x += (Math.random() - 0.5) * 14; y += 10; g.lineTo(x, y); } g.stroke(); }
        g.globalAlpha = 0.55; g.fillStyle = slime; for (let i = 0; i < 5; i++) { const x = Math.random() * 128, h = 20 + Math.random() * 60; g.fillRect(x, 0, 3 + Math.random() * 4, h); g.beginPath(); g.arc(x + 3, h, 4, 0, 7); g.fill(); }
        g.globalAlpha = 1; const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; return t;
      };
      const wallT = studio ? tex('#4a4652', '#24222a', '#6a6672', '#6fdc3a') : tex('#6a5236', '#3a2a18', '#8a6a44', '#7aa23a');
      const floorT = studio ? tex('#2e2c36', '#18171e', '#45424e', '#5aa02a') : tex('#4e3c26', '#2a1e10', '#6a5232', '#5a7a2a'); floorT.repeat.set(6, 5);
      const wallM = new T.MeshLambertMaterial({ map: wallT }), floorM = new T.MeshLambertMaterial({ map: floorT });
      const floor = new T.Mesh(new T.PlaneGeometry(W * CS + 1, Hh * CS + 1), floorM); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0); floor.receiveShadow = true; sc.add(floor);
      const ceil = new T.Mesh(new T.PlaneGeometry(W * CS + 1, Hh * CS + 1), R.mat(studio ? 0x1a1a22 : 0x3a2a18)); ceil.rotation.x = Math.PI / 2; ceil.position.y = HT; sc.add(ceil);
      // Wände sammeln (Kollision + Instanzen)
      ctx.walls = [];
      const addW = (x, z, w, d) => ctx.walls.push({ x, z, w, d });
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const c = ctx.cells[y * W + x], cx = ox + x * CS + CS / 2, cz = oz + y * CS + CS / 2;
        if (c.n) addW(cx, cz - CS / 2, CS + WT, WT);
        if (c.w) addW(cx - CS / 2, cz, WT, CS + WT);
        if (y === Hh - 1 && c.s) addW(cx, cz + CS / 2, CS + WT, WT);
        if (x === W - 1 && c.e) addW(cx + CS / 2, cz, WT, CS + WT);
      }
      const im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), wallM, ctx.walls.length), M = new T.Matrix4();
      ctx.walls.forEach((w, i) => { M.compose(new T.Vector3(w.x, HT / 2, w.z), new T.Quaternion(), new T.Vector3(w.w, HT, w.d)); im.setMatrixAt(i, M); });
      im.receiveShadow = true; sc.add(im);
      // Wurzeln/Stützbalken für Atmosphäre
      for (let i = 0; i < W * Hh / 2; i++) { const b = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, HT, 5), R.mat(studio ? 0x8a8f99 : 0x6b4426)); b.position.set(ox + ctx.rng.int(0, W) * CS, HT / 2, oz + ctx.rng.int(0, Hh) * CS); sc.add(b); }
      // Hängende Wurzeln, Spinnweben, Schleimtropfen an der Decke
      const rootM = R.mat(studio ? 0x6a6a72 : 0x5a3a1e), webM = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, wireframe: true, side: T.DoubleSide });
      const slimeM = new T.MeshLambertMaterial({ color: R.lin(0x7adc3a), emissive: R.lin(0x1a4a0a) });
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const cx = ox + x * CS + CS / 2, cz = oz + y * CS + CS / 2;
        for (let k = 0; k < 3; k++) { const l = ctx.rng.range(0.15, 0.5), r = new T.Mesh(new T.CylinderGeometry(0.012, 0.025, l, 4), rootM); r.position.set(cx + ctx.rng.range(-0.8, 0.8), HT - l / 2, cz + ctx.rng.range(-0.8, 0.8)); r.rotation.z = ctx.rng.range(-0.4, 0.4); sc.add(r); }
        if (ctx.rng.next() < 0.5) { const w = new T.Mesh(new T.CircleGeometry(0.4, 8, 0, Math.PI / 2), webM); w.position.set(cx + (ctx.rng.next() < 0.5 ? -1 : 1) * (CS / 2 - 0.16), HT - 0.05, cz + (ctx.rng.next() < 0.5 ? -1 : 1) * (CS / 2 - 0.16)); w.rotation.set(Math.PI / 2, 0, ctx.rng.int(0, 3) * Math.PI / 2); sc.add(w); }
        if (ctx.rng.next() < 0.6) { const d = new T.Mesh(new T.SphereGeometry(0.04, 6, 4), slimeM); d.scale.y = 1.8; d.position.set(cx + ctx.rng.range(-0.7, 0.7), HT - 0.04, cz + ctx.rng.range(-0.7, 0.7)); sc.add(d); }
      }
      // Sackgassen → Sterne
      const dead = [];
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const c = ctx.cells[y * W + x]; const open = ['n', 's', 'e', 'w'].filter(d => !c[d]).length; if (open === 1 && (x + y) > 1) dead.push([x, y]); }
      const spots = ctx.rng.shuffle(dead);
      while (spots.length < ctx.max) spots.push([ctx.rng.int(1, W - 1), ctx.rng.int(1, Hh - 1)]);
      ctx.starObjs = spots.slice(0, ctx.max).map(([x, y]) => { const s = R.star(0.32); s.material = new T.MeshBasicMaterial({ color: R.lin(0xffd23a) }); s.position.set(ox + x * CS + CS / 2, 0.45, oz + y * CS + CS / 2); s.userData.cell = [x, y]; sc.add(s); return s; });
      // Gekrabbel: Käfer am Boden und an den Wänden, Fledermäuse, Krabben
      const nb = Math.round(110 * ctx.k);
      ctx.bugs = UL.Trials.bugs(sc, nb, 0x2a1a0a);
      ctx.bugs.list.forEach(b => { b.x = ox + ctx.rng.range(0.3, W * CS - 0.3); b.z = oz + ctx.rng.range(0.3, Hh * CS - 0.3); b.y = 0.03; b.s = 0.07; b.r = ctx.rng.next() * 6; b.sp = ctx.rng.range(0.2, 0.5); });
      ctx.bugs.sync();
      ctx.crit = [];
      for (let i = 0; i < Math.round(5 * ctx.k); i++) { const bat = new A.Animal(i % 2 ? 'bat' : 'crab', i % 2 ? 0.4 : 0.3); const x = ctx.rng.int(0, W - 1), y = ctx.rng.int(0, Hh - 1); bat.root.position.set(ox + x * CS + CS / 2, i % 2 ? 0.8 : 0, oz + y * CS + CS / 2); sc.add(bat.root); ctx.crit.push({ a: bat, fly: i % 2 === 1, ph: ctx.rng.next() * 6, home: bat.root.position.clone() }); }
      // Stirnlampe
      const lamp = ctx.lamp = new T.SpotLight(R.lin(0xfff2d0), 2.2, 12, 0.62, 0.45, 1.2); sc.add(lamp, lamp.target);
      const glow = new T.PointLight(R.lin(0xffe0a0), 0.35, 3); sc.add(glow); ctx.glow = glow;
      ctx.pos = new T.Vector3(ox + CS / 2, 0.55, oz + CS / 2); ctx.yaw = Math.PI; ctx.ekel = 0; ctx.panic = 0; ctx.pitch = 0;
      // Eingang mit Moderatoren (draußen am Tunnelanfang, Licht von oben)
      ctx.hostPos.set(ox + CS / 2 - 1.1, 0, oz - 2.6); ctx.hostRy = 0.3;
      const hl = new T.PointLight(0xffffff, 1.2, 8); hl.position.set(ox + CS / 2, 3, oz - 2); sc.add(hl);
      const pad = new T.Mesh(new T.PlaneGeometry(6, 4), R.mat(studio ? 0x2a2833 : 0x4f9a3a)); pad.rotation.x = -Math.PI / 2; pad.position.set(ox + CS / 2, 0.01, oz - 2.5); sc.add(pad);
      ctx.player.root.position.set(ox + CS / 2 + 0.6, 0, oz - 1.8); ctx.player.root.rotation.y = Math.PI;
      ctx.intro = { pos: new T.Vector3(ox + CS / 2 + 2, 2, oz - 5.5), look: new T.Vector3(ox + CS / 2, 0.5, oz) };
      ctx.cam.position.set(ox + CS / 2, 2, oz - 6); ctx.cam.lookAt(ox + CS / 2, 0.5, oz);
    },
    start(ctx) { ctx.player.root.visible = false; },
    collide(ctx, p) {
      const r = 0.32;
      for (const w of ctx.walls) {
        const dx = p.x - w.x, dz = p.z - w.z, hx = w.w / 2 + r, hz = w.d / 2 + r;
        if (Math.abs(dx) < hx && Math.abs(dz) < hz) { const px = hx - Math.abs(dx), pz = hz - Math.abs(dz); if (px < pz) p.x += Math.sign(dx) * px; else p.z += Math.sign(dz) * pz; }
      }
      p.x = UL.clamp(p.x, ctx.ox + 0.35, ctx.ox + ctx.W * CS - 0.35); p.z = UL.clamp(p.z, ctx.oz + 0.35, ctx.oz + ctx.H * CS - 0.35);
    },
    update(dt, ctx) {
      const I = ctx.inp, p = ctx.pos;
      const slow = ctx.panic > 0 ? 0.35 : 1;
      if (ctx.panic > 0) ctx.panic -= dt;
      ctx.yaw -= I.mx * 2.1 * dt + I.lx;
      ctx.pitch = UL.clamp(ctx.pitch - I.ly * 0.8, -0.5, 0.4);
      const f = new T.Vector3(Math.sin(ctx.yaw), 0, Math.cos(ctx.yaw));
      p.addScaledVector(f, -I.my * 1.7 * slow * dt);
      this.collide(ctx, p);
      const bob = Math.sin(ctx.t * 9) * 0.03 * Math.abs(I.my);
      ctx.cam.position.set(p.x, p.y + bob + (ctx.panic > 0 ? (Math.random() - 0.5) * 0.04 : 0), p.z);
      const look = p.clone().add(new T.Vector3(f.x, Math.sin(ctx.pitch) - 0.05, f.z));
      ctx.cam.lookAt(look);
      ctx.lamp.position.copy(ctx.cam.position).add(new T.Vector3(0, 0.08, 0)); ctx.lamp.target.position.copy(p).add(f.clone().multiplyScalar(3)).add(new T.Vector3(0, Math.sin(ctx.pitch) * 3 - 0.2, 0));
      ctx.glow.position.copy(ctx.cam.position);
      if (Math.abs(I.my) > 0.2 && Math.random() < dt * 3) UL.Audio.sfx('step');
      // Käfer krabbeln, Berührung → Ekel
      let touch = 0;
      for (const b of ctx.bugs.list) {
        b.r += (Math.random() - 0.5) * 4 * dt; b.x += Math.sin(b.r) * b.sp * dt; b.z += Math.cos(b.r) * b.sp * dt;
        b.x = UL.clamp(b.x, ctx.ox + 0.2, ctx.ox + ctx.W * CS - 0.2); b.z = UL.clamp(b.z, ctx.oz + 0.2, ctx.oz + ctx.H * CS - 0.2);
        if ((b.x - p.x) ** 2 + (b.z - p.z) ** 2 < 0.16) touch++;
      }
      ctx.bugs.sync();
      for (const c of ctx.crit) {
        c.a.update(dt);
        if (c.fly) { c.ph += dt; c.a.root.position.set(c.home.x + Math.sin(c.ph * 1.6) * 0.7, 0.75 + Math.sin(c.ph * 4) * 0.08, c.home.z + Math.cos(c.ph * 1.1) * 0.7); c.a.root.rotation.y = c.ph * 1.6; }
        if (c.a.root.position.distanceTo(p) < 0.6) touch += 4;
      }
      ctx.ekel = UL.clamp(ctx.ekel + touch * dt * 0.12 * ctx.k - dt * 0.06, 0, 1);
      if (touch && Math.random() < dt * (1 + touch * 0.5)) { UL.Trials.crawl(1, ['roach', 'spider', 'beetle'], 1.4); if (Math.random() < 0.3) UL.Audio.sfx('yuck'); }
      if (ctx.ekel >= 1 && ctx.panic <= 0) { ctx.panic = 2.5; ctx.ekel = 0.5; ctx.bad('Panik! Kurz durchatmen …', 'scream'); }
      // Sterne
      for (const s of ctx.starObjs) { if (!s.visible) continue; s.rotation.y += dt * 2; s.position.y = 0.45 + Math.sin(ctx.t * 3 + s.position.x) * 0.05; const d = s.position.distanceTo(p); if (d < 0.75 && (I.ok || d < 0.5)) { s.visible = false; ctx.addStar(s.position); } }
      ctx.meters = [{ label: '🪲 Ekel', v: ctx.ekel, danger: ctx.ekel > 0.7 }];
      // Kompass: Richtung zum nächsten Stern (Geräusch)
      let best = null, bd = 1e9; for (const s of ctx.starObjs) if (s.visible) { const d = s.position.distanceTo(p); if (d < bd) { bd = d; best = s; } }
      if (best) { const a = Math.atan2(best.position.x - p.x, best.position.z - p.z) - ctx.yaw; const deg = ((-a * 180 / Math.PI) % 360 + 540) % 360 - 180; ctx.extraHud = `<span class="chip">🔔 nächster Stern <b style="display:inline-block;transform:rotate(${deg.toFixed(0)}deg)">⬆</b> ${bd.toFixed(0)} m</span>`; }
    },
    finish(ctx) { ctx.player.root.visible = true; },
    bot(dt, ctx, I) {
      // Weg über die Zellen (Breitensuche) zum nächsten Stern
      const p = ctx.pos, W = ctx.W, H = ctx.H;
      const cell = (x, z) => [UL.clamp(Math.floor((x - ctx.ox) / CS), 0, W - 1), UL.clamp(Math.floor((z - ctx.oz) / CS), 0, H - 1)];
      const [cx, cy] = cell(p.x, p.z);
      const targets = new Set(ctx.starObjs.filter(s => s.visible).map(s => s.userData.cell.join(',')));
      if (!targets.size) return;
      const prev = new Map([[cx + ',' + cy, null]]), q = [[cx, cy]]; let goal = null;
      while (q.length) { const [x, y] = q.shift(); if (targets.has(x + ',' + y)) { goal = [x, y]; break; } const c = ctx.cells[y * W + x];
        for (const [d, a, b] of [['n', x, y - 1], ['s', x, y + 1], ['e', x + 1, y], ['w', x - 1, y]]) { if (c[d] || a < 0 || b < 0 || a >= W || b >= H) continue; const k = a + ',' + b; if (!prev.has(k)) { prev.set(k, [x, y]); q.push([a, b]); } } }
      if (!goal) return;
      let step = goal; while (prev.get(step.join(',')) && prev.get(step.join(',')).join(',') !== cx + ',' + cy) step = prev.get(step.join(','));
      const tx = ctx.ox + step[0] * CS + CS / 2, tz = ctx.oz + step[1] * CS + CS / 2;
      const want = Math.atan2(tx - p.x, tz - p.z); const da = ((want - ctx.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      I.mx = -UL.clamp(da * 3, -1, 1); if (Math.abs(da) < 0.5) I.my = -1;
    }
  });
})();

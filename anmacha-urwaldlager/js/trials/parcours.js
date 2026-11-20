/* Prüfung: Der Schlamm-Parcours – Rundkurs mit Baumstämmen (springen), Balken (ducken), Schlamm, Sandsack-Pendeln und Kisten-Sperren */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, A = UL.A;
  const RC = 12.5, W = 2.0, Y0 = 0.25, C = Math.PI * 2 * RC;   // Kurs-Radius, halbe Breite, Höhe, Umfang
  const LANES = [-1.3, 0, 1.3];

  // Punkt auf dem Kurs: s = Strecke, lat = seitlich (positiv = außen)
  const P = (s, lat = 0, y = Y0, v = new T.Vector3()) => { const a = s / RC; return v.set(Math.sin(a) * (RC + lat), y, Math.cos(a) * (RC + lat)); };
  const yawAt = s => { const a = s / RC; return Math.atan2(Math.cos(a), -Math.sin(a)); };

  UL.Trials.reg('parcours', {
    orbit: true,
    env: (theme) => theme === 'studio' ? { radius: RC + W + 4 } : { tod: 'day', radius: RC + 7, clear: [{ x: 0, z: 0, r: RC + W + 2, k: 0.4 }], seed: 88, density: 0.8 },
    setup(ctx) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      // Kursbett: Ring mit Seitenwänden
      const top = new T.Mesh(new T.RingGeometry(RC - W - 0.3, RC + W + 0.3, 120, 1), R.mat(studio ? 0x2a5aa8 : 0x6a4a2a)); top.rotation.x = -Math.PI / 2; top.position.y = Y0; top.receiveShadow = true; sc.add(top);
      const lineM = new T.MeshBasicMaterial({ color: R.lin(studio ? 0x7fe8ff : 0xe8d8a0) });
      for (const r of [RC - 0.65, RC + 0.65]) { const l = new T.Mesh(new T.RingGeometry(r - 0.03, r + 0.03, 120, 1), lineM); l.rotation.x = -Math.PI / 2; l.position.y = Y0 + 0.01; sc.add(l); }
      for (const r of [RC - W - 0.3, RC + W + 0.3]) { const w = new T.Mesh(new T.CylinderGeometry(r, r, Y0 + 0.2, 120, 1, true), new T.MeshLambertMaterial({ color: R.lin(studio ? 0xffd23a : 0x5a3a1e), side: T.DoubleSide })); w.position.y = (Y0 + 0.2) / 2 - 0.1; sc.add(w); }
      // Pfosten am Rand
      const posts = []; for (let i = 0; i < 48; i++) for (const lat of [-W - 0.3, W + 0.3]) { const p = P(i / 48 * C, lat, 0); posts.push(p.clone()); }
      const pg = new T.CylinderGeometry(0.06, 0.07, 0.9, 6); pg.translate(0, 0.45, 0);
      const pm = new T.InstancedMesh(pg, R.mat(studio ? 0xffffff : 0x8a6a42), posts.length); const M = new T.Matrix4();
      posts.forEach((p, i) => { M.makeTranslation(p.x, Y0, p.z); pm.setMatrixAt(i, M); }); sc.add(pm);
      // Start/Ziel-Tor
      const gate = new T.Group(); gate.position.copy(P(0, 0, 0)); gate.rotation.y = yawAt(0); sc.add(gate);
      for (const x of [-W - 0.5, W + 0.5]) { const p = new T.Mesh(new T.BoxGeometry(0.25, 3.6, 0.25), R.mat(studio ? 0xc0c8d0 : 0x5a3a1e)); p.position.set(x, 1.8, 0); gate.add(p); }
      const ban = R.sign(['START · ZIEL'], 4.6, 0.7, { bg: studio ? '#141824' : '#2f6a2a', w: 640, h: 100, font: '900 60px system-ui' }); ban.position.set(0, 3.3, 0); ban.material.side = T.DoubleSide; gate.add(ban);
      const chk = new T.Mesh(new T.PlaneGeometry(2 * W + 0.6, 0.4), new T.MeshBasicMaterial({ map: checker() })); chk.rotation.x = -Math.PI / 2; chk.position.y = Y0 + 0.015; gate.add(chk);
      // Hindernisse
      const kinds = ['log', 'beam', 'crates', 'mud', 'sack', 'log', 'crates', 'beam', 'sack', 'mud', 'log', 'beam'];
      const order = kinds.slice(0, 2).concat(ctx.rng.shuffle(kinds.slice(2)));
      ctx.obs = [];
      const n = order.length, gap = (C - 10) / n;
      for (let i = 0; i < n; i++) ctx.obs.push(this.build(ctx, order[i], 7 + i * gap));
      // Sterne: Lücken zwischen Hindernissen, über Stämmen, unter Balken, in freien Spuren
      const cand = [];
      const laps = ctx.short ? 1 : 2;
      for (let lap = 0; lap < laps; lap++) {
        ctx.obs.forEach((o, i) => {
          const mid = o.s + gap / 2;
          if (o.kind === 'log') cand.push({ s: o.s, lat: ctx.rng.pick(LANES), y: 1.55, lap });
          else if (o.kind === 'beam') cand.push({ s: o.s, lat: ctx.rng.pick(LANES), y: 0.55, lap });
          else if (o.kind === 'crates') cand.push({ s: o.s, lat: LANES[o.free], y: 0.9, lap });
          else if (o.kind === 'mud') cand.push({ s: o.s + 1, lat: ctx.rng.pick(LANES), y: 0.9, lap });
          if (mid < C - 3) cand.push({ s: mid, lat: ctx.rng.pick(LANES), y: 0.9, lap });
        });
      }
      const pick = ctx.rng.shuffle(cand).slice(0, ctx.max + 3 + (laps - 1) * 2);
      ctx.starObjs = pick.map(c => { const s = R.star(0.4); P(c.s, c.lat, Y0 + c.y, s.position); s.userData = c; s.visible = c.lap === 0; sc.add(s); return s; });
      ctx.mudObs = ctx.obs.filter(o => o.kind === 'mud');
      ctx.s = -1.5; ctx.lat = 0; ctx.y = 0; ctx.vy = 0; ctx.duck = 0; ctx.stun = 0; ctx.sp = 0; ctx.lap = 0; ctx.laps = laps; ctx.inMud = 0;
      this.place(ctx, 0);
      ctx.hostPos.set(-0.2, 0, 0); ctx.hostRy = 0.2;
      if (!studio) { const pod = new T.Mesh(new T.CylinderGeometry(2.2, 2.4, 0.3, 20), R.mat(0x8a5a32)); pod.position.y = 0.1; sc.add(pod); }
      ctx.intro = { pos: new T.Vector3(10, 9, RC + 10), look: new T.Vector3(0, 0, RC * 0.5) };
      UL.Trials.sign(ctx, -3.2, -1.2, 0.3);
      ctx.cam.position.set(-4, 3, RC + 2); ctx.cam.lookAt(0, 1, RC);
    },
    build(ctx, kind, s) {
      const sc = ctx.scene, studio = ctx.theme === 'studio';
      const g = new T.Group(); g.position.copy(P(s, 0, Y0)); g.rotation.y = yawAt(s); sc.add(g);
      const o = { kind, s, g };
      const wood = R.mat(studio ? 0xff4fa0 : 0x7a4a24), post = R.mat(studio ? 0xc0c8d0 : 0x5a3a1e);
      if (kind === 'log') {
        const l = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 2 * W + 0.4, 12), wood); l.rotation.z = Math.PI / 2; l.position.y = 0.22; l.castShadow = true; g.add(l);
        if (!studio) for (const x of [-W, W]) { const st = A.sized('stump', 0.45); st.position.set(x, 0, 0); g.add(st); }
      } else if (kind === 'beam') {
        for (const x of [-W - 0.2, W + 0.2]) { const p = new T.Mesh(new T.BoxGeometry(0.16, 1.4, 0.16), post); p.position.set(x, 0.7, 0); g.add(p); }
        const b = new T.Mesh(new T.BoxGeometry(2 * W + 0.6, 0.2, 0.22), studio ? R.mat(0xffd23a) : wood); b.position.y = 1.2; b.castShadow = true; g.add(b);
        const stripe = R.mat(0xd8402e); for (let x = -W; x <= W; x += 0.8) { const q = new T.Mesh(new T.BoxGeometry(0.3, 0.21, 0.23), stripe); q.position.set(x, 1.2, 0); g.add(q); }
      } else if (kind === 'crates') {
        o.free = ctx.rng.int(0, 2);
        LANES.forEach((lat, i) => {
          if (i === o.free) return;
          const c = A.has('kd_crates_stacked') && !studio ? A.sized('kd_crates_stacked', 1.25) : new T.Mesh(new T.BoxGeometry(1.1, 1.1, 1.1), R.mat([0x3ad0ff, 0xff8a3a, 0x7cff6a][i]));
          if (c.isMesh) c.position.y = 0.55; c.position.x = -lat; c.castShadow = true; g.add(c);
        });
      } else if (kind === 'mud') {
        const k = ctx.rng.int(0, 1);
        o.from = k ? -W : -W * 0.35; o.to = k ? W * 0.35 : W;
        const m = new T.Mesh(new T.CircleGeometry(1, 20), new T.MeshLambertMaterial({ color: R.lin(studio ? 0x6fdc3a : 0x3e2a14) })); m.rotation.x = -Math.PI / 2; m.scale.set((o.to - o.from) / 2, 1.6, 1); m.position.set(-(o.from + o.to) / 2, 0.02, 0); g.add(m);
      } else if (kind === 'sack') {
        for (const x of [-W - 0.3, W + 0.3]) { const p = new T.Mesh(new T.BoxGeometry(0.18, 3.4, 0.18), post); p.position.set(x, 1.7, 0); g.add(p); }
        const bar = new T.Mesh(new T.BoxGeometry(2 * W + 0.8, 0.16, 0.16), post); bar.position.y = 3.35; g.add(bar);
        const piv = new T.Group(); piv.position.y = 3.3; g.add(piv);
        const rope = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 2, 4), R.mat(0xd9c08a)); rope.position.y = -1; piv.add(rope);
        const bag = new T.Mesh(new T.CylinderGeometry(0.32, 0.36, 0.9, 10), R.mat(studio ? 0xd8402e : 0xb79a6a)); bag.position.y = -2.3; bag.castShadow = true; piv.add(bag);
        o.piv = piv; o.ph = ctx.rng.next() * 6.28; o.w = 1.5 + ctx.k * 0.4; o.lat = 0;
      }
      return o;
    },
    place(ctx, dt) {
      const fig = ctx.player.root, ss = ((ctx.s % C) + C) % C;
      P(ss, ctx.lat, Y0 + ctx.y, fig.position);
      fig.rotation.y = yawAt(ss);
      fig.scale.y = 1 - ctx.duck * 0.45;
    },
    update(dt, ctx) {
      const I = ctx.inp, fig = ctx.player;
      // Pendel bewegen
      for (const o of ctx.obs) if (o.kind === 'sack') { const a = Math.sin(ctx.t * o.w + o.ph) * 0.62; o.piv.rotation.z = a; o.lat = -2.3 * Math.sin(a); }
      // Laufen: automatisch vorwärts, Stick vor/zurück = schneller/langsamer, links/rechts = Spur
      const ss = ((ctx.s % C) + C) % C;
      ctx.inMud = ctx.mudObs.some(o => Math.abs(ss - o.s) < 1.6 && ctx.lat > o.from - 0.2 && ctx.lat < o.to + 0.2 && ctx.y < 0.1);
      let want = UL.clamp(4.0 - I.my * 1.8, 2.0, 5.8) * (ctx.inMud ? 0.42 : 1) * (ctx.duck > 0.5 ? 0.85 : 1);
      if (ctx.stun > 0) { ctx.stun -= dt; want = 0; }
      ctx.sp = UL.damp(ctx.sp, want, ctx.stun > 0 ? 12 : 4, dt);
      ctx.s += ctx.sp * dt;
      if (ctx.stun <= 0) ctx.lat = UL.clamp(ctx.lat + I.mx * 4.2 * dt, -W + 0.35, W - 0.35);
      // Springen und Ducken
      const ground = ctx.y <= 0 && ctx.vy <= 0;
      if (I.ok && ground && ctx.stun <= 0) { ctx.vy = 5.2; fig.play('jump', { speed: 1.4 }); UL.Audio.sfx('jump'); }
      ctx.vy -= 14 * dt; ctx.y = Math.max(0, ctx.y + ctx.vy * dt); if (ctx.y === 0 && ctx.vy < 0) ctx.vy = 0;
      ctx.duck = UL.damp(ctx.duck, I.altD && ctx.y < 0.2 ? 1 : 0, 14, dt);
      if (ctx.inMud && Math.random() < 0.3) { const p = fig.root.position; ctx.stage.parts.burst(p.x, Y0 + 0.2, p.z, 3, 1.2, 1.5, studio(ctx) ? [0x6fdc3a] : [0x3e2a14, 0x5a3a1e]); }
      // Kollisionen
      if (ctx.stun <= 0) for (const o of ctx.obs) {
        const ds = ss - o.s; if (Math.abs(ds) > 0.5) continue;
        let hit = '';
        if (o.kind === 'log' && Math.abs(ds) < 0.32 && ctx.y < 0.42) hit = 'Über den Stamm springen!';
        else if (o.kind === 'beam' && Math.abs(ds) < 0.26 && ctx.duck < 0.55) hit = 'Bonk! Unter dem Balken ducken!';
        else if (o.kind === 'crates' && Math.abs(ds) < 0.45 && Math.abs(ctx.lat - LANES[o.free]) > 0.62) hit = 'Kisten im Weg – Spur wechseln!';
        else if (o.kind === 'sack' && Math.abs(ds) < 0.4 && Math.abs(ctx.lat - o.lat) < 0.62 && ctx.duck < 0.55) hit = 'Vom Sandsack erwischt!';
        if (hit) { ctx.stun = 0.8; ctx.s -= 0.9; ctx.sp = 0; ctx.bad(hit, 'ugh'); fig.play('hit'); break; }
      }
      // Runden
      if (ctx.s >= C * (ctx.lap + 1)) {
        ctx.lap++;
        if (ctx.lap >= ctx.laps) { ctx.end('ziel'); }
        else { UL.UI.banner('🏁 Letzte Runde!', '', 1400); UL.Audio.sfx('gong'); ctx.starObjs.forEach(s => { if (s.userData.lap === ctx.lap) s.visible = true; else if (s.userData.lap < ctx.lap) s.visible = false; }); }
      }
      // Sterne
      const body = new T.Vector3().copy(fig.root.position); body.y += ctx.duck > 0.5 ? 0.45 : 0.9;
      for (const s of ctx.starObjs) { if (!s.visible) continue; s.rotation.y += dt * 2; if (s.userData.lap === ctx.lap && s.position.distanceTo(body) < 0.8) { s.visible = false; ctx.addStar(s.position); } }
      this.place(ctx, dt);
      if (!fig.one && ground) fig.move(ctx.sp * (ctx.duck > 0.5 ? 0.6 : 1));
      ctx.meters = [{ label: '🏁 Strecke', v: UL.clamp(ctx.s / (C * ctx.laps), 0, 1), color: '#5ad1ff' }];
      ctx.extraHud = `<span class="chip">🔁 Runde ${Math.min(ctx.lap + 1, ctx.laps)}/${ctx.laps}</span>${ctx.inMud ? '<span class="chip warn">🟤 Schlamm!</span>' : ''}`;
      // Kamera hinter der Figur
      const port = UL.portrait(), cd = port ? 5.6 : 4.6, ch = port ? 3.4 : 2.6;
      const camP = P(ss - cd, ctx.lat * 0.6 + 0.3, Y0 + ch), look = P(ss + 3, ctx.lat * 0.5, Y0 + 0.9);
      ctx.cam.position.lerp(camP, 1 - Math.exp(-6 * dt)); ctx.cam.lookAt(look);
    },
    finish(ctx) { const f = ctx.player.root; f.scale.y = 1; P(-1, 0, Y0, f.position); f.rotation.y = yawAt(0) + Math.PI; },
    bot(dt, ctx, I) {
      const ss = ((ctx.s % C) + C) % C;
      I.my = -1;
      let tl = null;
      // Hindernis voraus?
      for (const o of ctx.obs) {
        const d = o.s - ss; if (d < -0.3 || d > 3.2) continue;
        if (o.kind === 'log' && d > 0.35 && d < 0.95) I.ok = true;
        if (o.kind === 'beam' && d < 1.2) I.altD = true;
        if (o.kind === 'crates') tl = LANES[o.free];
        if (o.kind === 'mud' && tl === null) tl = (o.from + o.to) / 2 > 0 ? -1.4 : 1.4;
        if (o.kind === 'sack' && d < 1.6) { if (Math.abs(ctx.lat - o.lat) < 1.2) I.altD = true; }
      }
      if (tl === null) { let best = 1e9; for (const s of ctx.starObjs) if (s.visible && s.userData.lap === ctx.lap) { const d = s.userData.s - ss; if (d > -0.2 && d < best) { best = d; tl = s.userData.lat; } } }
      if (tl !== null) I.mx = UL.clamp((tl - ctx.lat) * 3, -1, 1);
    }
  });
  const studio = ctx => ctx.theme === 'studio';
  function checker() { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d'); for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(i * 4, j * 4, 4, 4); } const t = new T.CanvasTexture(c); t.magFilter = T.NearestFilter; return t; }
})();

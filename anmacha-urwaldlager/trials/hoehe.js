/* Prüfung: Der Höhenparcours (3D, Third-Person) – Pfähle, schmale Balken, Schwingplattformen, Netz, rollende Stämme, Windböen, Checkpoints mit Sicherungsseil, Sterne auf Nebenwegen */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp;
  const GRAV = 24, VJ = 8.6, SPD = 4.6, COY = .12, BUF = .15, LOOK = .004, TOL = .1;
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

  T.def({
    id: 'hoehe', name: 'Der Höhenparcours', kind: 'Mut', stat: 'mut', e: '🧗', mode: '3d', lock: false, fov: 62, far: 260,
    desc: 'Hoch über dem Blätterdach: Pfähle, schmale Balken, schwingende Plattformen, ein Netz und rollende Stämme. Windböen schubsen dich, das Sicherungsseil fängt dich auf (kostet Zeit). Die Sterne warten auf kniffligen Nebenwegen, der letzte oben auf dem Ziel-Turm.',
    how: { pc: '<b>WASD</b> laufen · <b>Leertaste</b> springen (länger halten = höher) · <b>Maus ziehen</b>: Kamera drehen · der dunkle Schattenpunkt zeigt, wo du landest', touch: 'Joystick = laufen · <b>Springen</b> (länger halten = höher) · rechts wischen = Kamera drehen · Schattenpunkt zeigt die Landestelle' },
    controls: { joy: true, look: true, buttons: [{ id: 'jump', label: 'Springen', big: true }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short;
      const R = E.rand(3 + Math.floor(Math.random() * 99999));
      const limit = short ? 52 : 108 - d * 20, nStar = Math.max(1, ctx.max - 1);
      const nodes = [], dyn = [], plan = [], cps = [], cpPlan = [], stars = [], SP = [], M = E.mtx;
      const bark = ['#6b4a2e', '#5e4128', '#74512f'];
      // ---- Bausteine
      const ext = n => n.k === 'pad' ? n.r : n.hd;
      function pad(x, y, z, r, o) {
        const n = Object.assign({ k: 'pad', x, y, z, r, hw: r, hd: r }, o || {}); nodes.push(n);
        SP.push({ g: E.geo.cyl, m: M(x, y - 13.05, z, 0, 0, 0, r, 26, r), c: bark[nodes.length % 3], jit: .25 }, { g: E.geo.cyl, m: M(x, y - .04, z, 0, 0, 0, r * 1.03, .09, r * 1.03), c: n.br != null ? '#d8b070' : '#b08a58' });
        return n;
      }
      function box(x, y, z, hw, hd, vis, o) {
        const n = Object.assign({ k: 'box', x, y, z, hw, hd, r: Math.min(hw, hd), vis, cx: x }, o || {}); nodes.push(n); if (vis === 'dyn') return n;
        if (vis === 'beam') { SP.push({ g: E.geo.box, m: M(x, y - .12, z, 0, 0, 0, hw * 2, .24, hd * 2), c: '#8a5e34', jit: .25 }); for (const s of [-1, 1]) SP.push({ g: E.geo.cylLo, m: M(x, y - 13.2, z + s * (hd - .2), 0, 0, 0, .16, 26, .16), c: bark[1] }); }
        else if (vis === 'net') {
          for (const s of [-1, 1]) SP.push({ g: E.geo.box, m: M(x + s * hw, y + .02, z, 0, 0, 0, .06, .06, hd * 2), c: '#c8a46a' });
          for (let i = 1; i < 7; i++) SP.push({ g: E.geo.box, m: M(x - hw + i * hw * 2 / 7, y - .03, z, 0, 0, 0, .025, .025, hd * 2), c: '#e0d0a8' });
          for (let j = 0; j <= Math.round(hd * 2 / .4); j++) SP.push({ g: E.geo.box, m: M(x, y - .03, z - hd + j * .4, 0, 0, 0, hw * 2, .025, .025), c: '#e0d0a8' });
        } else {
          SP.push({ g: E.geo.box, m: M(x, y - .16, z, 0, 0, 0, hw * 2, .3, hd * 2), c: vis === 'goal' ? '#a0703c' : '#9a6e40', jit: .2 });
          for (let i = 0, nP = Math.max(2, Math.round(hw * 2 / .45)); i < nP; i++) SP.push({ g: E.geo.box, m: M(x - hw + (i + .5) * hw * 2 / nP, y - .005, z, 0, 0, 0, hw * 2 / nP - .04, .02, hd * 2 - .06), c: i % 2 ? '#b8885a' : '#a87a4c' });
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) SP.push({ g: E.geo.cylLo, m: M(x + sx * (hw - .2), y - 13.3, z + sz * (hd - .2), 0, 0, 0, .2, 26, .2), c: bark[(sx + sz + 2) % 3], jit: .2 });
        }
        return n;
      }
      const flagMats = [];
      function checkpoint(x, y, z, hw) {
        const n = box(x, y, z, hw, hw, 'plat', { cp: cps.length }); cps.push(n);
        SP.push({ g: E.geo.cylLo, m: M(x + hw - .25, y + 1.1, z + hw - .25, 0, 0, 0, .04, 2.2, .04), c: '#e8e0d0' });
        const fm = new THREE.MeshLambertMaterial({ color: cps.length === 1 ? 0x37d6a0 : 0xff6b4a, side: THREE.DoubleSide }); flagMats.push(fm);
        const fl = new THREE.Mesh(E.geo.plane, fm); fl.scale.set(.7, .45, 1); fl.position.set(x + hw - .25 - .36, y + 1.95, z + hw - .25); S.add(fl); n.flag = fl;
        return n;
      }
      function swing(x0, y, z, hw, L, amp, w, ph) {
        const pivY = y + L, g = new THREE.Group(); g.position.set(x0, pivY, z); S.add(g);
        const parts = [{ g: E.geo.box, m: M(0, -.15, 0, 0, 0, 0, hw * 2, .3, hw * 2), c: '#a0743e', jit: .2 }, { g: E.geo.box, m: M(0, .0, 0, 0, 0, 0, hw * 2 - .1, .03, hw * 2 - .1), c: '#c09060' }];
        const plat = new THREE.Mesh(E.merge(parts), E.vcMat); g.add(plat);
        const rp = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) rp.push({ g: E.geo.cylLo, m: M(sx * (hw - .08) * .5, -L / 2, sz * (hw - .08), 0, 0, sx * -.08, .025, L, .025), c: '#d8c49a' });
        const ropes = new THREE.Mesh(E.merge(rp), E.vcMat); g.add(ropes);
        SP.push({ g: E.geo.cylLo, m: M(x0, pivY + .1, z, 0, 0, Math.PI / 2, .18, 11, .18), c: bark[0] });
        for (const s of [-1, 1]) SP.push({ g: E.geo.cyl, m: M(x0 + s * 5.4, pivY - 12, z, 0, 0, 0, .35, 25, .35), c: bark[2], jit: .2 }, { g: E.geo.ico, m: M(x0 + s * 5.4, pivY + 1.2, z, 0, R() * 3, 0, 1.8, 1.4, 1.8), c: '#2f7d3a', jit: .3 });
        const n = box(x0, y, z, hw, hw, 'dyn', { dynamic: true }); n.pred = t => { const th = amp * Math.sin(t * w + ph); return [x0 + L * Math.sin(th), pivY - L * Math.cos(th), z, th]; };
        n.upd = t => { const p = n.pred(t); n.x = p[0]; n.y = p[1]; g.rotation.z = p[3]; plat.position.y = -L; plat.rotation.z = -p[3]; };
        n.upd(0); dyn.push(n); return n;
      }
      function rlog(x0, y, z, r, hd, A, w, ph) {
        const g = new THREE.Group(); S.add(g); const lm = new THREE.Mesh(E.geo.cyl, E.mat('#7a5232')); lm.rotation.x = Math.PI / 2; lm.scale.set(r, hd * 2, r); g.add(lm);
        const ring = new THREE.Mesh(E.geo.box, E.mat('#4a3018')); ring.scale.set(r * 2.05, .12, .12); ring.position.z = 0; g.add(ring); const ring2 = ring.clone(); ring2.rotation.z = Math.PI / 2; g.add(ring2);
        for (const s of [-1, 1]) SP.push({ g: E.geo.box, m: M(x0, y - r * 2 - .05, z + s * (hd - .3), 0, 0, 0, A * 2 + 3.4, .05, .05), c: '#555555' }, { g: E.geo.cylLo, m: M(x0 + s * (A + 1.7), y - 13, z, 0, 0, 0, .25, 26, .25), c: bark[1] });
        const n = box(x0, y, z, r * .8, hd, 'dyn', { dynamic: true }); n.pred = t => [x0 + A * Math.sin(t * w + ph), y, z];
        n.upd = t => { const p = n.pred(t); n.x = p[0]; g.position.set(p[0], y - r, z); g.rotation.z = -(p[0] - x0) / r; };
        n.upd(0); dyn.push(n); return n;
      }
      const wpt = (n, ox, oz, br) => plan.push({ n, ox: ox || 0, oz: oz || 0, br });
      const gap = () => (1.3 + R() * .5) * (.9 + d * .25);
      // ---- Strecke bauen
      let last = checkpoint(0, 0, 0, 1.6); cpPlan.push(plan.length); wpt(last);
      const zStart = 0;
      function posts(n) { for (let i = 0; i < n; i++) { const r = Math.max(.36, .5 - d * .1), z = last.z + ext(last) + gap() + r, x = clamp(last.x + (R() - .5) * 1.4, -2.2, 2.2), y = clamp(last.y + (R() - .35) * .7, -.3, 2.2); last = pad(x, y, z, r); wpt(last); } }
      function cpNext(g) { const hw = 1.3, z = last.z + ext(last) + (g == null ? 1.2 : g) + hw; last = checkpoint(clamp(last.cx != null ? last.cx : last.x, -1.5, 1.5), last.y + (R() - .5) * .3, z, hw); cpPlan.push(plan.length); wpt(last); return last; }
      function branch(cp, k) {
        const side = k % 2 ? 1 : -1, nP = short ? 2 : 3, rr = Math.max(.32, .42 - d * .08), list = [];
        let px = cp.x + side * cp.hw, py = cp.y, pz = cp.z;
        for (let i = 0; i < nP; i++) { const gg = (1.15 + R() * .3) * (.9 + d * .25); px += side * (gg + rr * (i ? 2 : 1)); py += .25 + R() * .25; const z = pz + (R() - .5) * .7; const p = pad(px, py, z, rr, { br: k }); list.push(p); px = p.x; }
        const tip = list[list.length - 1], st = T.make.starMesh(); st.position.set(tip.x, tip.y + 1.05, tip.z); S.add(st); const gl = glow(0xffd24a, 1.3); gl.position.copy(st.position); S.add(gl);
        stars.push({ m: st, g: gl, x: tip.x, y: tip.y + 1.05, z: tip.z, got: false, br: k });
        list.forEach(p => wpt(p, 0, 0, k)); for (let i = list.length - 2; i >= 0; i--) wpt(list[i], 0, 0, k); wpt(cp);
        // Schild „Nebenweg“
        SP.push({ g: E.geo.box, m: M(cp.x + side * (cp.hw - .15), cp.y + .45, cp.z - cp.hw + .3, 0, 0, 0, .08, .9, .08), c: '#e8e0d0' }, { g: E.geo.box, m: M(cp.x + side * (cp.hw - .35), cp.y + .85, cp.z - cp.hw + .3, 0, 0, 0, .5, .22, .04), c: '#ffcf4a' });
      }
      function glow(col, s) { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .7 })); g.scale.setScalar(s); return g; }
      let windZ = null, windX = 0;
      function beams() { const cp = last, hw = Math.max(.19, .25 - d * .06), b1 = box(clamp(cp.x + (R() - .5) * 1.4, cp.x - cp.hw + .4, cp.x + cp.hw - .4), cp.y, cp.z + cp.hw + 3, hw, 3, 'beam'); wpt(b1, 0, -2.6); wpt(b1, 0, 2.6); last = b1; const side = R() < .5 ? -1 : 1; last = pad(b1.x + side * .9, b1.y + .2, b1.z + 3 + 1 + .45, .45); wpt(last); const b2 = box(last.x - side * .3, last.y, last.z + .45 + .95 + 2.5, hw, 2.5, 'beam'); wpt(b2, 0, -2.1); wpt(b2, 0, 2.1); last = b2; }
      function swings(n) { const x0 = last.cx != null ? last.cx : last.x; for (let i = 0; i < n; i++) { const hw = .75, z = last.z + ext(last) + 1.5 + d * .3 + hw; last = swing(x0, last.y, z, hw, 5, .3 + d * .12, 1.5 + d * .45, i * 2.1 + R()); wpt(last); } }
      function netAndLogs(n) { const cp = last, net = box(cp.x, cp.y - .05, cp.z + cp.hw + 3.2, 1.05, 3.2, 'net', { net: true }); wpt(net, 0, -2.6); wpt(net, 0, 2.7); last = net; for (let i = 0; i < n; i++) { const hd = 1.5, z = last.z + ext(last) + 1.15 + d * .25 + hd; last = rlog(cp.x, last.y, z, .5, hd, 1.2 + d * .5, .9 + d * .45 + i * .1, i * 2.3 + R()); wpt(last, 0, -hd + .55); wpt(last, 0, hd - .55); } }
      function windy() { const cp = last, z0 = cp.z + cp.hw, hw = .3; const b1 = box(cp.x, cp.y, z0 + 2.5, hw, 2.5, 'beam'); wpt(b1, 0, -2.1); wpt(b1, 0, 2.1); last = pad(b1.x, b1.y + .1, b1.z + 2.5 + 1 + .45, .48); wpt(last); const b2 = box(last.x, last.y, last.z + .48 + 1 + 2.5, hw, 2.5, 'beam'); wpt(b2, 0, -2.1); wpt(b2, 0, 2.1); last = b2; windZ = [z0, last.z + 2.5 + .6]; windX = cp.x; }
      function goal() { for (let i = 0; i < (short ? 2 : 3); i++) { const r = .48, z = last.z + ext(last) + 1.25 + r; last = pad(last.x + (i % 2 ? .6 : -.6), last.y + .75, z, r); wpt(last); } const g = box(last.x, last.y + .7, last.z + last.r + 1.3 + 1.8, 1.8, 1.8, 'goal'); wpt(g); last = g; }
      const sections = short ? [() => posts(3), () => swings(2)] : [() => posts(5), () => beams(), () => swings(3), () => netAndLogs(3), () => windy()];
      sections.forEach((f, i) => { f(); const cp = cpNext(); if (i < nStar) branch(cp, i); });
      goal(); const goalN = last;
      // weitere Sterne (falls mehr als Checkpoints) auf Pfählen des Hauptwegs
      for (let k = stars.length; k < nStar; k++) { const c = nodes.filter(n => n.k === 'pad' && n.br == null && !stars.some(s => s.n === n)); const n = c[Math.floor(R() * c.length)]; if (!n) break; const st = T.make.starMesh(); st.position.set(n.x, n.y + 1.05, n.z); S.add(st); const gl = glow(0xffd24a, 1.3); gl.position.copy(st.position); S.add(gl); stars.push({ m: st, g: gl, x: n.x, y: n.y + 1.05, z: n.z, got: false, n }); }
      const fStar = T.make.starMesh(); fStar.scale.setScalar(1.7); fStar.position.set(goalN.x, goalN.y + 1.3, goalN.z); S.add(fStar); const fGlow = glow(0xfff0a0, 3); fGlow.position.copy(fStar.position); S.add(fGlow);
      // Ziel-Torbogen
      SP.push({ g: E.geo.box, m: M(goalN.x - 1.6, goalN.y + 1.4, goalN.z + 1.4, 0, 0, 0, .16, 2.8, .16), c: '#c8a464' }, { g: E.geo.box, m: M(goalN.x + 1.6, goalN.y + 1.4, goalN.z + 1.4, 0, 0, 0, .16, 2.8, .16), c: '#c8a464' });
      const banner = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ map: E.canvasTex('hoeheZiel', 256, 64, (c, w, h) => { c.fillStyle = '#ff5fa2'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★ ZIEL ★', w / 2, h / 2 + 2); }), side: THREE.DoubleSide })); banner.scale.set(3.3, .8, 1); banner.position.set(goalN.x, goalN.y + 2.6, goalN.z + 1.4); banner.rotation.y = Math.PI; S.add(banner);
      const goalZ = goalN.z;
      // ---- Umgebung: Himmel, Blätterdach, Riesenbäume, Wolken
      S.background = new THREE.Color(0x9fd6ea); S.fog = new THREE.Fog(0xb8e2e8, 30, 150);
      ctx.lights({ sky: 0xeaf8ff, ground: 0x3a5a2a, hemi: .85, dir: .75, sun: 0xfff0d0 });
      const env = [];
      for (let i = 0; i < 170; i++) { const x = (R() - .5) * 90, z = -30 + R() * (goalZ + 70), s = 4 + R() * 5; env.push({ g: E.geo.ico, m: M(x, -22 + R() * 4, z, R(), R() * 3, 0, s, s * .6, s), c: ['#2f7d3a', '#3c8f45', '#25663a', '#4a9a3a'][i % 4], jit: .3 }); }
      for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, x = side * (13 + R() * 20), z = -20 + R() * (goalZ + 40), h = 14 + R() * 10; env.push({ g: E.geo.cylLo, m: M(x, -22 + h / 2, z, 0, 0, 0, .7, h, .7), c: '#5a3d22' }, { g: E.geo.ico, m: M(x, -22 + h + 1.5, z, 0, R() * 3, 0, 4 + R() * 3, 2.5 + R(), 4 + R() * 3), c: ['#2f7d3a', '#3c8f45', '#25663a'][i % 3], jit: .3 }); }
      for (let i = 0; i < 14; i++) { const x = (R() - .5) * 160, z = goalZ * .5 + (R() - .3) * 160, y = 14 + R() * 18; for (let k = 0; k < 3; k++) env.push({ g: E.geo.ico, m: M(x + k * 3 - 3, y + (k === 1 ? 1 : 0), z, 0, 0, 0, 3 + R() * 2, 1.6 + R(), 2.5), c: '#ffffff' }); }
      S.add(new THREE.Mesh(E.merge(env), E.vcMat));
      S.add(new THREE.Mesh(E.merge(SP), E.vcMat));
      const mist = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ color: 0xe0f2ee, transparent: true, opacity: .35, depthWrite: false })); mist.rotation.x = -Math.PI / 2; mist.scale.set(200, goalZ + 200, 1); mist.position.set(0, -12, goalZ / 2); S.add(mist);
      const sunG = glow(0xfff4c0, 40); sunG.position.set(-60, 55, goalZ + 90); sunG.material.fog = false; S.add(sunG);
      // Wind-Streifen
      const NW = 36, streaks = new THREE.InstancedMesh(E.geo.box, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false }), NW), sp = []; S.add(streaks); const dm = new THREE.Object3D();
      for (let i = 0; i < NW; i++) sp.push({ x: (R() - .5) * 16, y: R() * 3, z: R() });
      // ---- Spielfigur, Schattenpunkt, Sicherungsseil
      const F = ctx.figure(Object.assign({}, ctx.who), { blob: false }); S.add(F.group);
      const harness = new THREE.Mesh(E.geo.box, E.mat('#ffb000')); harness.scale.set(.42, .07, .3); harness.position.y = .98; F.group.add(harness);
      const shadow = new THREE.Mesh(E.geo.circle, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 2; S.add(shadow);
      const rope = new THREE.Mesh(E.geo.cylLo, E.mat('#ffcf4a')); rope.scale.set(.025, 40, .025); rope.visible = false; S.add(rope);

      // ---- Zustand
      const sp0 = cps[0];
      let x = sp0.x, y = sp0.y, z = sp0.z - .5, vx = 0, vy = 0, vz = 0, ground = sp0, lastGround = sp0, coy = 0, buf = 0, cut = true, face = 0, tt = 0, got = 0, falls = 0, fallT = 0, fx0 = 0, fy0 = 0, fz0 = 0, cpI = 0, finished = false;
      let camYaw = 0, camPitch = .36, camDist = 5.6, camD = 5.6, gust = 0, gustT = 2, gustOn = 0, maxZ = 0, airT = 0, landT = 0;
      const inside = (n, px, pz, m) => n.k === 'pad' ? Math.hypot(px - n.x, pz - n.z) <= n.r + m : Math.abs(px - n.x) <= n.hw + m && Math.abs(pz - n.z) <= n.hd + m;
      const solid = (px, py, pz) => nodes.some(n => !n.dynamic && inside(n, px, pz, .18) && py < n.y + .15 && py > n.y - (n.k === 'pad' ? 30 : .45));
      const surfaceBelow = (px, py, pz) => { let best = null; nodes.forEach(n => { if (n.y <= py + .05 && inside(n, px, pz, 0) && (!best || n.y > best.y)) best = n; }); return best; };
      function updDyn(t) { dyn.forEach(n => { const ox = n.x, oy = n.y, oz = n.z; n.upd(t); n.dx = n.x - ox; n.dy = n.y - oy; n.dz = n.z - oz; }); }
      function place(dt) {
        F.group.position.set(x, y, z); F.group.rotation.y = face;
        const sb = surfaceBelow(x, y, z); if (sb && fallT <= 0) { shadow.visible = true; const h = y - sb.y; shadow.position.set(x, sb.y + .03, z); shadow.scale.setScalar(clamp(.34 - h * .025, .14, .34)); shadow.material.opacity = clamp(.55 - h * .03, .2, .55); } else shadow.visible = false;
        // Kamera: Orbit + Clipping vermeiden
        const hx = x, hy = y + 1.25, hz = z, cp = Math.cos(camPitch), dx = -Math.sin(camYaw) * cp, dy = Math.sin(camPitch), dz = -Math.cos(camYaw) * cp;
        const cd = camDist * (cam.aspect < 1 ? 1.45 : 1); let free = cd; for (let k = 1; k <= 12; k++) { const s = cd * k / 12; if (solid(hx + dx * s, hy + dy * s, hz + dz * s)) { free = Math.max(.8, s - .5); break; } }
        camD += (free - camD) * Math.min(1, dt * (free < camD ? 14 : 3));
        cam.position.set(hx + dx * camD, hy + dy * camD, hz + dz * camD); cam.lookAt(hx, hy + .1, hz);
      }
      function animStuff(dt) {
        stars.forEach(s => { s.m.rotation.y += dt * 2; }); fStar.rotation.y += dt * 1.5; fGlow.material.opacity = .55 + Math.sin(tt * 3) * .2;
        // Wind-Streifen
        let wi = 0; const show = windZ && gustOn > 0 && Math.abs(gust) > .5;
        if (windZ) for (let i = 0; i < NW; i++) { const s = sp[i]; if (show) { s.x += Math.sign(gust) * dt * 16; if (s.x > 9) s.x -= 18; if (s.x < -9) s.x += 18; } dm.position.set(windX + s.x, y - .5 + s.y, windZ[0] + s.z * (windZ[1] - windZ[0])); dm.scale.set(show ? 1.4 : 0, .03, .03); dm.rotation.set(0, 0, 0); dm.updateMatrix(); streaks.setMatrixAt(wi++, dm.matrix); }
        streaks.count = wi; streaks.instanceMatrix.needsUpdate = true;
      }
      function respawn() { const c = cps[cpI]; x = c.x; z = c.z; y = c.y; vx = vy = vz = 0; ground = c; lastGround = c; rope.visible = false; botReset(); }
      function doFall() { falls++; fallT = 1.5; fx0 = x; fy0 = y; fz0 = z; tt += 3; ctx.S.bad(); ctx.hud.toast('😱 Abgestürzt! Das Sicherungsseil zieht dich hoch (+3 s)', 'bad'); }
      updDyn(0); place(0);
      ctx.hud.hint(nStar > 0 ? 'Gelbe Schilder = Nebenweg mit Stern' : '');
      const api = {
        idle(dt) { F.anim(dt, 'idle'); animStuff(dt); place(dt); },
        update(dt) {
          tt += dt; const look = I.consumeLook(); camYaw -= look.dx * LOOK; camPitch = clamp(camPitch + look.dy * LOOK * .7, .05, 1.15);
          updDyn(tt); animStuff(dt);
          if (finished) { F.anim(dt, 'cheer'); place(dt); return; }
          const left = Math.max(0, limit - tt); ctx.hud.time(left, left / limit); if (left <= 0) { finished = true; ctx.finish(got, 'time'); return; }
          // Rettung am Seil
          if (fallT > 0) {
            fallT -= dt; const c = cps[cpI], p = 1 - fallT / 1.5, e = p * p * (3 - 2 * p); x = fx0 + (c.x - fx0) * e; z = fz0 + (c.z - fz0) * e; y = fy0 + (c.y - fy0) * e + Math.sin(p * Math.PI) * 4;
            rope.visible = true; rope.position.set(x, y + 21, z); F.anim(dt, 'scared'); I.pressed('jump');
            if (fallT <= 0) { respawn(); ctx.hud.toast('Zurück am Checkpoint – weiter!'); }
            place(dt); return;
          }
          // Wind
          const inWind = windZ && z > windZ[0] - .5 && z < windZ[1];
          gustT -= dt; if (gustT <= 0) { if (gustOn > 0) { gustOn = 0; gustT = 1.6 + Math.random() * 1.6 - d * .5; } else { gustOn = 1; gustT = 1.1 + Math.random() * .8 + d * .5; gust = (Math.random() < .5 ? -1 : 1) * (3.2 + d * 3.6); if (inWind) ctx.hud.toast(gust > 0 ? '💨 Böe von rechts!' : '💨 Böe von links!'); } }
          const wa = inWind && gustOn > 0 ? gust : 0;
          // Laufen (kamerarelativ)
          const mv = I.move, f0 = Math.sin(camYaw), f1 = Math.cos(camYaw), r0 = -Math.cos(camYaw), r1 = Math.sin(camYaw);
          let wx = f0 * mv.y + r0 * mv.x, wz = f1 * mv.y + r1 * mv.x; const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
          const onNet = ground && ground.net, top = SPD * (onNet ? .62 : 1), acc = ground ? 32 : 12;
          let ex = wx * top - vx, ez = wz * top - vz; const el = Math.hypot(ex, ez), am = acc * dt; if (el > am) { ex *= am / el; ez *= am / el; } vx += ex; vz += ez;
          if (ground) x += wa * .3 * dt; else vx += wa * dt;
          // Springen: Koyote-Zeit & Sprungpuffer, kurz tippen = kleiner Sprung
          if (I.pressed('jump')) buf = BUF; else buf = Math.max(0, buf - dt);
          coy = ground ? COY : Math.max(0, coy - dt);
          if (buf > 0 && coy > 0) { vy = VJ * (onNet ? 1.12 : 1); ground = null; coy = 0; buf = 0; cut = false; ctx.S.click(); }
          if (!cut && !I.down('jump') && vy > 2.5) { vy *= .55; cut = true; }
          if (!ground) vy -= GRAV * dt;
          const py = y; x += vx * dt; z += vz * dt; y += vy * dt;
          if (ground) {
            if (ground.dynamic) { x += ground.dx; z += ground.dz; }
            if (!inside(ground, x, z, TOL)) { lastGround = ground; ground = null; vy = Math.min(vy, 0); }
            else { y = ground.y + (ground.net ? Math.sin(tt * 9) * .03 * Math.min(1, Math.hypot(vx, vz)) : 0); vy = 0; }
          }
          if (!ground && vy <= 0) { for (const n of nodes) { if (!inside(n, x, z, TOL)) continue; const tol = n.dynamic ? .3 : .08; if (py >= n.y - tol && y <= n.y + .02) { ground = n; lastGround = n; y = n.y; vy = 0; if (airT > .25) { ctx.S.thud(); landT = .18; } break; } } }
          airT = ground ? 0 : airT + dt; landT = Math.max(0, landT - dt);
          if (y < -7) { doFall(); return; }
          if (ground && ground.cp != null && ground.cp > cpI) { cpI = ground.cp; ground.flag.material.color.setHex(0x37d6a0); ctx.hud.toast('🚩 Checkpoint!', 'good'); ctx.S.pad(0); }
          maxZ = Math.max(maxZ, z);
          // Sterne
          stars.forEach(s => { if (s.got || Math.hypot(s.x - x, s.y - (y + .9), s.z - z) > .95) return; s.got = true; s.m.visible = false; s.g.visible = false; got++; ctx.hud.stars(got); ctx.hud.toast('★ Stern am Nebenweg!', 'good'); });
          if (Math.hypot(fStar.position.x - x, fStar.position.y - (y + .9), fStar.position.z - z) < 1.1) { finished = true; got++; fStar.visible = false; ctx.hud.stars(got); ctx.hud.toast('🏁 Ziel-Turm erreicht!', 'good'); ctx.finish(got, 'done'); return; }
          // Figur
          const hs = Math.hypot(vx, vz); if (hs > .3) face = E.angLerp(face, Math.atan2(vx, vz), Math.min(1, dt * 12));
          const pose = !ground ? (vy > 0 ? 'cheer' : airT > .6 ? 'scared' : 'run') : landT > 0 ? 'crouch' : hs > 3.4 ? 'run' : hs > .4 ? 'walk' : (inWind ? 'scared' : 'idle');
          F.anim(dt, pose, hs); if (inWind && ground) F.group.rotation.z = -wa * .02; else F.group.rotation.z = 0;
          place(dt);
          ctx.hud.meter('pos', clamp((maxZ - zStart) / (goalZ - zStart), 0, 1), 'Strecke', '#37d6e8');
          ctx.hud.meter('wind', inWind ? Math.min(1, Math.abs(wa) / 7) : null, wa > 0 ? 'Wind →' : wa < 0 ? '← Wind' : 'Wind', '#ffcf4a');
        },
        debug: () => ({ x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2), ground: ground ? nodes.indexOf(ground) : -1, got, falls, cpI, bk, plan: plan.length, t: +tt.toFixed(1) }),
        details: () => ({ stuerze: falls }),
        bot: botStep
      };
      // ---- Testpilot: folgt dem Wegplan, springt an der Kante, steuert in der Luft zur Landestelle, wartet auf bewegliche Teile
      let bk = 0, botJumpT = 0, waitT = 0;
      function botReset() { bk = cpPlan[cpI] || 0; }
      const gapB = (a, b) => { if (a.dynamic || b.dynamic) return 9; if (a.k === 'pad' && b.k === 'pad') return Math.max(0, Math.hypot(a.x - b.x, a.z - b.z) - a.r - b.r); return Math.hypot(Math.max(0, Math.abs(a.x - b.x) - a.hw - b.hw), Math.max(0, Math.abs(a.z - b.z) - a.hd - b.hd)); };
      function landPt(w, t) { const n = w.n, c = n.pred ? n.pred(t) : [n.x, n.y, n.z]; return [c[0] + w.ox, c[1], c[2] + w.oz]; }
      function toMove(wx, wz) { const f0 = Math.sin(camYaw), f1 = Math.cos(camYaw), r0 = -Math.cos(camYaw), r1 = Math.sin(camYaw); return { x: clamp(wx * r0 + wz * r1, -1, 1), y: clamp(wx * f0 + wz * f1, -1, 1) }; }
      function botStep(dt) {
        const o = { move: { x: 0, y: 0 }, hold: {}, press: [], look: { dx: 0, dy: 0 } };
        if (fallT > 0 || finished) return o;
        const left = limit - tt, onBranch = ground && ground.br != null;
        for (let g = 0; g < 8; g++) {
          const w = plan[bk]; if (!w) break;
          if (w.br != null && !onBranch && (stars.find(s => s.br === w.br) || {}).got) { bk++; continue; }
          if (w.br != null && !onBranch && ground && ground.cp != null && left - ((goalZ - z) / 2.2 + 6) < 15) { bk++; continue; }
          if (ground === w.n) { const p = landPt(w, tt); if ((w.ox === 0 && w.oz === 0) || Math.hypot(p[0] - x, p[2] - z) < .45) { bk++; continue; } }
          break;
        }
        const w = plan[bk]; if (!w) return o;
        const tn = w.n, cur = ground || lastGround; let wx = 0, wz = 0;
        if (!ground) { // Luft: Landestelle anpeilen
          const p0 = landPt(w, tt), dy = y - p0[1], disc = vy * vy + 2 * GRAV * Math.max(-1, dy); const tl = disc > 0 ? Math.max(.08, (vy + Math.sqrt(disc)) / GRAV) : .3;
          const p = landPt(w, tt + tl), ax = p[0], az = p[2];
          let dvx = (ax - x) / tl, dvz = (az - z) / tl; const m = Math.hypot(dvx, dvz); if (m > SPD) { dvx *= SPD / m; dvz *= SPD / m; } wx = dvx / SPD; wz = dvz / SPD;
          if (vy > 0) o.hold.jump = true;
        } else {
          const walk = cur === tn || (gapB(cur, tn) < .05 && Math.abs(cur.y - tn.y) < .35);
          if (walk) { const p = landPt(w, tt), dx = p[0] - x, dz = p[2] - z, dl = Math.hypot(dx, dz) || 1; wx = dx / dl * Math.min(1, dl * 1.5); wz = dz / dl * Math.min(1, dl * 1.5); if (cur.vis === 'beam') wx += (cur.x - x) * 3; }
          else {
            const p = landPt(w, tt + .62), dy = p[1] - y, dx = p[0] - x, dz = p[2] - z, dl = Math.hypot(dx, dz), hs = Math.hypot(vx, vz), reach = (hs > 3 ? 3.15 : 2.6) - Math.max(0, dy) * .5 + (tn.k === 'pad' ? tn.r * .4 : .3);
            if ((dl <= reach || !tn.dynamic) && dy < 1.35) { wx = dx / (dl || 1); wz = dz / (dl || 1); const nx = x + vx * .06 + wx * .05, nz = z + vz * .06 + wz * .05; if (!inside(cur, nx, nz, -.04) || dl < .9) o.press.push('jump'); waitT = 0; }
            else { // an der Kante auf den richtigen Moment warten
              const now = landPt(w, tt); let ex, ez; if (cur.k === 'pad') { const a = Math.atan2(now[0] - cur.x, now[2] - cur.z), rr = Math.max(0, cur.r - .3); ex = cur.x + Math.sin(a) * rr; ez = cur.z + Math.cos(a) * rr; } else { ex = clamp(now[0], cur.x - cur.hw + .3, cur.x + cur.hw - .3); ez = clamp(now[2], cur.z - cur.hd + .3, cur.z + cur.hd - .3); }
              const qx = ex - x, qz = ez - z, ql = Math.hypot(qx, qz); if (ql > .12) { wx = qx / ql * Math.min(1, ql * 2); wz = qz / ql * Math.min(1, ql * 2); } waitT += dt;
            }
          }
          if (windZ && z > windZ[0] - .5 && z < windZ[1] && gustOn > 0) wx -= gust * .3 / SPD;
        }
        o.move = toMove(wx, wz);
        // Kamera sanft hinter die Laufrichtung drehen
        const p = landPt(w, tt), want = Math.hypot(p[0] - x, p[2] - z) > 1.5 ? Math.atan2(p[0] - x, p[2] - z) : camYaw, dy2 = wrap(want - camYaw); o.look.dx = clamp(-dy2 / LOOK * dt * 1.2, -20, 20);
        return o;
      }
      return api;
    }
  });
})();

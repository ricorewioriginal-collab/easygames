/* Prüfung: Der Schlamm-Parcours (3D) – Hindernislauf: Baumstämme, Schwingbalken, Schlammgruben, rollende Fässer/Kokosnüsse, Wippe über dem Graben, Kletterwand; Etappen-Bestzeiten + Fahnen */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp, lerp = E.lerp;
  const W2 = 3.3; // halbe Streckenbreite
  T.def({
    id: 'parcours', name: 'Der Schlamm-Parcours', kind: 'Geschick', stat: 'mut', e: '🏃', mode: '3d', lock: false,
    desc: 'Hindernislauf durch den Dschungel: Stämme überspringen, unter Balken ducken, Schlamm und Fässern ausweichen, über die Wippe, die Wand hoch. Jede Etappe unter der <b>Ziel-Zeit</b> = Stern (jede Fahne −1,5 s), der letzte Stern im Ziel.',
    how: { pc: 'Läuft von selbst · <b>W</b>/<b>Shift</b> = Sprint, <b>S</b> = bremsen · <b>A/D</b> seitlich · <b>Leertaste</b> springen · <b>C</b> halten: ducken · an der Wand <b>E</b> halten: klettern', touch: 'Läuft von selbst · Joystick: hoch = Sprint, runter = bremsen, seitlich lenken · <b>Springen</b> · <b>Ducken</b> halten · an der Wand <b>Klettern</b> halten' },
    controls: { joy: true, look: false, buttons: [{ id: 'jump', label: 'Springen', big: true }, { id: 'crouch', label: 'Ducken', big: true }, { id: 'act', label: 'Klettern' }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short;
      const R = E.rand(5 + Math.floor(Math.random() * 99999));
      const nStage = Math.max(1, ctx.max - 1), obsPer = short ? 4 : 4 + (d > .6 ? 1 : 0);
      const VBASE = 5.2, VMAX = 7.6, VMIN = 2.6, climbT = .9 + d * .6, parSpeed = 6.3 + d * 1.6, times = [];
      S.background = new THREE.Color(0xa6d4b0); S.fog = new THREE.Fog(0xa6d4b0, 26, 80);
      ctx.lights({ sky: 0xf0fff0, ground: 0x4a3a20, hemi: .9, dir: .8 });
      // ---- Streckenplan
      const types = ['log', 'beam', 'mud', 'barrels', 'seesaw', 'wall'], seq = [];
      while (seq.length < nStage * obsPer) { const sh = types.slice(); for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [sh[i], sh[j]] = [sh[j], sh[i]]; } for (const t of sh) if (seq[seq.length - 1] !== t) seq.push(t); }
      const LEN = { log: .8, beam: 5.4, mud: 5, barrels: 14, seesaw: 6.5, wall: .5 };
      const obs = [], flags = [], stages = []; let z = 0, qi = 0;
      for (let s = 0; s < nStage; s++) {
        const st = { z0: z, obs: [], flags: [], got: 0, par: 0 }; z += s ? 7 : 9;
        for (let k = 0; k < obsPer; k++) {
          const type = seq[qi++], gap = (k ? 7.5 + R() * 3 - d * 1.8 : 0) + (type === 'barrels' ? 3 : 0);
          if (k && gap > 6.2) st.gaps = (st.gaps || []).concat([[z, z + gap]]);
          z += gap; const o = { type, zs: z, ze: z + LEN[type], i: obs.length };
          if (type === 'log') { o.z = z + .4; o.h = R() < .3 && d > .4 ? .75 : .5; }
          if (type === 'beam') { o.z = z + 2.7; o.A = .85 + R() * .15; o.w = 2 + d * .7 + R() * .3; o.ph = R() * 6; }
          if (type === 'mud') { o.len = 4 + R() * 2; o.ze = z + o.len; o.full = R() < .35; if (!o.full) { const side = R() < .5 ? -1 : 1; o.free = side; o.x0 = side < 0 ? -W2 + 2.1 : -W2 - .2; o.x1 = side < 0 ? W2 + .2 : W2 - 2.1; } else { o.x0 = -W2 - .2; o.x1 = W2 + .2; } }
          if (type === 'barrels') { o.spawnT = 0; o.rate = 1.35 - d * .45; }
          if (type === 'seesaw') { o.cx = (R() * 2 - 1) * 2.1; o.c = z + 3.25; o.tilt = .17; o.drift = R() * 6; }
          if (type === 'wall') { o.z = z + .25; o.c = 0; o.done = false; }
          obs.push(o); st.obs.push(o); z = o.ze;
        }
        z += 7; st.z1 = z;
        // Fahnen in Lücken
        const gaps = (st.gaps || []).slice(); if (!gaps.length) gaps.push([st.z1 - 6, st.z1 - 2]);
        for (let f = 0; f < 2; f++) { const g = gaps[(f * 2 + Math.floor(R() * 2)) % gaps.length], fz = (g[0] + g[1]) / 2 + (f ? 1 : -1) * Math.min(1.2, (g[1] - g[0]) / 2 - 2.6); const fl = { z: fz, x: (R() * 2 - 1) * 2.5, high: f === 1, got: false, st: s }; flags.push(fl); st.flags.push(fl); }
        // Ziel-Zeit
        let par = (st.z1 - st.z0) / parSpeed + (s ? 0 : .9) + .8 - d * .8;
        for (const o of st.obs) par += o.type === 'log' ? .15 : o.type === 'beam' ? .35 : o.type === 'mud' ? (o.full ? o.len * (1 / (VMAX * .42) - 1 / VMAX) : .35) : o.type === 'barrels' ? .5 : o.type === 'seesaw' ? .45 : climbT + .55;
        st.par = par; stages.push(st);
      }
      const L = z, limit = stages.reduce((a, s) => a + s.par, 0) * 1.55 + 8;
      // ---- Statische Welt (verschmolzen)
      const P = [], M = E.mtx;
      const ditches = obs.filter(o => o.type === 'seesaw');
      let gz = -14; for (const o of ditches.concat([{ zs: L + 30, ze: L + 30 }])) { const len = o.zs - gz; if (len > 0) P.push({ g: E.geo.box, m: M(0, -.25, gz + len / 2, 0, 0, 0, W2 * 2 + .6, .5, len), c: '#7a5a38' }); gz = o.ze; }
      for (const o of ditches) { P.push({ g: E.geo.box, m: M(0, -1.3, (o.zs + o.ze) / 2, 0, 0, 0, W2 * 2 + .6, .3, o.ze - o.zs), c: '#3a2a18' }); for (const s of [-1, 1]) P.push({ g: E.geo.box, m: M(s * (W2 + .6), .05, (o.zs + o.ze) / 2, 0, 0, 0, .6, .4, o.ze - o.zs + .3), c: '#5a4a2a' }); P.push({ g: E.geo.box, m: M(o.cx, -.55, o.c, 0, 0, 0, .3, .6, .3), c: '#5a3d22' }); }
      for (const s of [-1, 1]) P.push({ g: E.geo.box, m: M(s * (W2 + 9), -.3, L / 2, 0, 0, 0, 17, .5, L + 60), c: '#4f8a38' }); // Rasen
      for (const s of [-1, 1]) for (let zz = -10; zz < L + 20; zz += 2.2) P.push({ g: E.geo.cylLo, m: M(s * (W2 + .35), .25, zz, 0, 0, 0, .09, .7, .09), c: '#8a6a3a' });
      for (const s of [-1, 1]) P.push({ g: E.geo.box, m: M(s * (W2 + .35), .5, L / 2 - 5, 0, 0, 0, .05, .05, L + 30), c: '#c8a26a' });
      // Bäume, Büsche
      for (let i = 0; i < Math.ceil((L + 50) / 1.4); i++) { const s = i % 2 ? 1 : -1, zz = -14 + i * 1.4 + R() * 1.5, x = s * (W2 + 2.5 + R() * 9), h = 4 + R() * 6; P.push({ g: E.geo.cylLo, m: M(x, h / 2, zz, 0, 0, 0, .22 + R() * .15, h, .22 + R() * .15), c: '#5a3d22' }, { g: E.geo.ico, m: M(x, h + .6, zz, 0, R() * 3, 0, 1.6 + R() * 1.2, 1.2 + R(), 1.6 + R() * 1.2), c: ['#2f7d3a', '#3c8f45', '#25663a', '#4a9a3a'][i % 4], jit: .25 }); if (R() < .6) P.push({ g: E.geo.ico, m: M(s * (W2 + 1.2 + R() * 1.5), .3, zz + R(), 0, R() * 3, 0, .7 + R() * .5, .5 + R() * .3, .7 + R() * .5), c: '#3d7a2e', jit: .3 }); }
      // Hindernisse (statischer Teil)
      for (const o of obs) {
        if (o.type === 'log') { P.push({ g: E.geo.cyl, m: M(0, o.h * .5, o.z, 0, 0, Math.PI / 2, o.h * .5, W2 * 2 + .4, o.h * .5), c: '#6b4426', jit: .15 }); for (const s of [-1, 1]) P.push({ g: E.geo.cyl, m: M(s * (W2 + .21), o.h * .5, o.z, 0, 0, Math.PI / 2, o.h * .42, .02, o.h * .42), c: '#c89a62' }); }
        if (o.type === 'beam') { for (const s of [-1, 1]) P.push({ g: E.geo.cylLo, m: M(s * (W2 + .5), 2.4, o.z, 0, 0, 0, .14, 4.9, .14), c: '#5a3d22' }); P.push({ g: E.geo.box, m: M(0, 4.75, o.z, 0, 0, 0, W2 * 2 + 1.3, .25, .25), c: '#5a3d22' }); }
        if (o.type === 'mud') { P.push({ g: E.geo.box, m: M((o.x0 + o.x1) / 2, .015, (o.zs + o.ze) / 2, 0, 0, 0, o.x1 - o.x0, .05, o.len), c: '#4a3420', jit: .25 }); }
        if (o.type === 'barrels') { for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) P.push({ g: E.geo.cyl, m: M(sd * (W2 + 1.4 + (k % 3) * .2), .45 + Math.floor(k / 3) * .9, o.zs + (k % 3) * 1.0 - 1, 0, 0, 0, .42, .9, .42), c: k % 2 ? '#a0522d' : '#8b4513' }); for (const sd of [-1, 1]) P.push({ g: E.geo.box, m: M(sd * (W2 + 1.6), 1.6, o.zs + 1.2, 0, 0, 0, .1, 1.2, 1.6), c: '#ffcf4a' }); }
        if (o.type === 'wall') { P.push({ g: E.geo.box, m: M(0, 1.2, o.z, 0, 0, 0, W2 * 2 + .4, 2.4, .4), c: '#8a6038', jit: .2 }); for (let k = 0; k < 14; k++) P.push({ g: E.geo.box, m: M(-3 + (k % 7) * 1, .45 + Math.floor(k / 7) * .9 + (k % 2) * .25, o.z - .23, 0, 0, k, .16, .12, .1), c: ['#ff5fa2', '#ffcf4a', '#37d6e8'][k % 3] }); for (let k = 0; k < 8; k++) P.push({ g: E.geo.cone, m: M(-3.15 + k * .9, 2.55, o.z, 0, 0, 0, .14, .3, .14), c: '#7a5030' }); }
      }
      // Etappen-Tore
      const gateTex = E.canvasTex('parcoursZiel', 256, 64, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#111' : '#fff'; c.fillRect(i * 16, j * 16, 16, 16); } c.fillStyle = 'rgba(255,207,74,.92)'; c.fillRect(64, 8, 128, 48); c.fillStyle = '#2a1700'; c.font = '900 36px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ZIEL', 128, 34); });
      const banners = [];
      stages.forEach((st, i) => { const last = i === stages.length - 1; for (const s of [-1, 1]) P.push({ g: E.geo.cylLo, m: M(s * (W2 + .6), 1.7, st.z1, 0, 0, 0, .18, 3.4, .18), c: last ? '#ffcf4a' : '#c8a26a' }); if (!last) P.push({ g: E.geo.box, m: M(0, 3.35, st.z1, 0, 0, 0, W2 * 2 + 1.6, .4, .12), c: ['#ff5fa2', '#37d6e8', '#9dff5c', '#ffcf4a'][i % 4] }); else { const b = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ map: gateTex, side: THREE.DoubleSide })); b.scale.set(W2 * 2 + 1.4, 1.1, 1); b.position.set(0, 3.2, st.z1); b.rotation.y = Math.PI; S.add(b); banners.push(b); } });
      P.push({ g: E.geo.box, m: M(0, .01, 0, 0, 0, 0, W2 * 2, .03, .25), c: '#ffffff' });
      S.add(new THREE.Mesh(E.merge(P), E.vcMat));
      // ---- Dynamische Teile
      const beamGeo = E.merge([{ g: E.geo.box, m: M(0, -3.25, 0, 0, 0, 0, W2 * 2 + .6, .32, .32), c: '#7a4e2a', jit: .15 }, { g: E.geo.box, m: M(0, -3.25, .17, 0, 0, 0, W2 * 2 + .62, .1, .02), c: '#ffcf4a' }, ...[-2.6, 2.6].map(x => ({ g: E.geo.cylLo, m: M(x, -1.55, 0, 0, 0, 0, .03, 3.2, .03), c: '#3c6b2a' }))]);
      obs.filter(o => o.type === 'beam').forEach(o => { o.mesh = new THREE.Mesh(beamGeo, E.vcMat); o.mesh.position.set(0, 4.7, o.z); S.add(o.mesh); });
      const plankGeo = E.merge([{ g: E.geo.box, m: M(0, 0, 0, 0, 0, 0, 1.2, .14, 6.8), c: '#9a6a3a', jit: .2 }, { g: E.geo.box, m: M(0, .08, -2, 0, 0, 0, 1.22, .03, .12), c: '#ffcf4a' }, { g: E.geo.box, m: M(0, .08, 2, 0, 0, 0, 1.22, .03, .12), c: '#ffcf4a' }]);
      const waterMat = new THREE.MeshLambertMaterial({ color: 0x4a6a3a, transparent: true, opacity: .9 });
      ditches.forEach(o => { o.mesh = new THREE.Mesh(plankGeo, E.vcMat); o.mesh.position.set(o.cx, .05, o.c); S.add(o.mesh); const w = new THREE.Mesh(E.geo.plane, waterMat); w.rotation.x = -Math.PI / 2; w.scale.set(W2 * 2 + .6, o.ze - o.zs, 1); w.position.set(0, -.6, o.c); S.add(w); });
      const muds = obs.filter(o => o.type === 'mud'), mudB = new THREE.InstancedMesh(E.geo.sph, E.mat('#5a4028'), Math.max(1, muds.length * 4)); mudB.count = muds.length * 4; S.add(mudB);
      const mudBs = []; muds.forEach(o => { for (let k = 0; k < 4; k++) mudBs.push({ x: lerp(o.x0 + .3, o.x1 - .3, R()), z: lerp(o.zs + .4, o.ze - .4, R()), ph: R() * 6 }); });
      // Fahnen
      const flagG = E.merge([{ g: E.geo.cylLo, m: M(0, .75, 0, 0, 0, 0, .04, 1.5, .04), c: '#ddd' }, { g: E.geo.box, m: M(.28, 1.3, 0, 0, 0, 0, .52, .34, .03), c: '#ff3a6a' }, { g: E.geo.sph, m: M(0, 1.52, 0, 0, 0, 0, .06), c: '#ffcf4a' }]);
      const flagH = E.merge([{ g: E.geo.cylLo, m: M(0, 1.6, 0, 0, 0, 0, .025, 3.2, .025), c: '#3c6b2a' }, { g: E.geo.box, m: M(.22, -.05, 0, 0, 0, 0, .44, .32, .03), c: '#37d6e8' }, { g: E.geo.sph, m: M(0, .15, 0, 0, 0, 0, .07), c: '#ffcf4a' }]);
      const flagMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x221100 });
      flags.forEach(f => { f.mesh = new THREE.Mesh(f.high ? flagH : flagG, flagMat); f.mesh.position.set(f.x, f.high ? 2.05 : 0, f.z); S.add(f.mesh); });
      // Rollende Fässer und Kokosnüsse
      const RMAX = 14, rollers = []; const bGeo = new THREE.CylinderGeometry(.42, .42, .9, 10); bGeo.rotateZ(Math.PI / 2);
      const barIM = new THREE.InstancedMesh(bGeo, E.mat('#9a5a2a'), RMAX), cocIM = new THREE.InstancedMesh(E.geo.ico, E.mat('#5a3a1a'), RMAX); barIM.count = 0; cocIM.count = 0; S.add(barIM, cocIM);
      const dm = new THREE.Object3D();
      // ---- Spielfigur
      const F = ctx.figure(Object.assign({}, ctx.who)); S.add(F.group);
      let pz = -1.2, px = 0, py = 0, vy = 0, v = 0, air = false, crouch = false, stagT = 0, invul = 0, time = 0, finished = false, si = 0, stageStart = 0, starsN = 0, fails = 0, climb = null, onPlank = null, fallT = 0, hintS = '', lastLbl = '';
      const camT = new THREE.Vector3(), lookT = new THREE.Vector3(), lookC = new THREE.Vector3(0, 1, 8);
      function groundY(x, zz) { for (const o of ditches) if (zz > o.zs && zz < o.ze) return onPlankAt(o, x, zz) ? plankY(o, zz) : -1.2; return 0; }
      function onPlankAt(o, x, zz) { return Math.abs(x - o.cx) < .6 + .18 && zz > o.c - 3.4 && zz < o.c + 3.4; }
      function plankY(o, zz) { return .12 + (zz - o.c) * Math.sin(o.tilt); }
      function placeCam(dt) {
        const asp = cam.aspect || 1.6, back = asp < 1 ? Math.min(11, 6 / Math.sqrt(asp)) : 6.2, up = asp < 1 ? 3.6 + (back - 6) * .35 : 3.2;
        camT.set(px * .55, Math.max(py, 0) * .5 + up, pz - back); lookT.set(px * .7, 1 + Math.max(py, 0) * .3, pz + 6);
        const k = dt ? Math.min(1, dt * 6) : 1; cam.position.lerp(camT, k); lookC.lerp(lookT, k); cam.lookAt(lookC);
      }
      function setHint(s) { if (s !== hintS) { hintS = s; ctx.hud.hint(s); } }
      function stumble(msg, back) { if (invul > 0) return; fails++; invul = 1; stagT = back ? 1 : .75; v = back ? -2.5 : 1.2; ctx.S.thud(); ctx.hud.toast(msg, 'bad'); }
      placeCam(0); F.anim(0, 'idle'); F.group.position.set(px, 0, pz);
      function updObs(dt) {
        for (const o of obs) {
          if (o.type === 'beam') { o.th = o.A * Math.sin(time * o.w + o.ph); o.mesh.rotation.x = -o.th; o.bz = o.z + 3.25 * Math.sin(o.th); o.by = 4.7 - 3.25 * Math.cos(o.th) - .16; }
          if (o.type === 'seesaw') { const want = onPlank === o && pz > o.c ? -.17 : onPlank === o ? .17 - clamp((pz - o.c + 2) / 2, 0, 1) * .1 : (pz > o.ze ? -.17 : .17); o.tilt = lerp(o.tilt, want, Math.min(1, dt * 5)); o.mesh.rotation.x = -o.tilt; o.mesh.position.y = .12; }
        }
        let k = 0; for (const b of mudBs) { const s = Math.max(0, Math.sin(time * 2 + b.ph)) * .22; dm.position.set(b.x, .03, b.z); dm.rotation.set(0, 0, 0); dm.scale.set(s, s * .7, s); dm.updateMatrix(); mudB.setMatrixAt(k++, dm.matrix); } mudB.instanceMatrix.needsUpdate = true;
        flags.forEach(f => { if (!f.got) f.mesh.rotation.y = Math.sin(time * 3 + f.z) * .35; });
      }
      function updRollers(dt) {
        for (const o of obs) if (o.type === 'barrels') { if (pz > o.zs - 12 && pz < o.ze - 5) { o.spawnT -= dt; if (o.spawnT <= 0 && rollers.length < RMAX) { o.spawnT = o.rate * (.7 + R() * .6); const coc = R() < .35; rollers.push({ coc, x: (R() * 2 - 1) * (W2 - .5), z: Math.max(o.ze + 4, pz + 26), r: coc ? .24 : .42, sp: (coc ? 6 : 4.2) + d * 2 + R(), rot: 0, y: 0, vy: 0, o }); } } }
        let nb = 0, nc = 0;
        for (let i = rollers.length - 1; i >= 0; i--) { const b = rollers[i]; b.z -= b.sp * dt; b.rot += b.sp * dt / b.r; if (b.coc) { b.vy -= 20 * dt; b.y += b.vy * dt; if (b.y < 0) { b.y = 0; b.vy = 3 + R() * 2; } } if (b.z < b.o.zs - 3 || b.dead) { rollers.splice(i, 1); continue; }
          dm.position.set(b.x, b.r + b.y, b.z); dm.rotation.set(-b.rot, 0, 0); dm.scale.setScalar(b.coc ? b.r : 1); dm.updateMatrix(); if (b.coc) cocIM.setMatrixAt(nc++, dm.matrix); else barIM.setMatrixAt(nb++, dm.matrix); }
        barIM.count = nb; cocIM.count = nc; barIM.instanceMatrix.needsUpdate = true; cocIM.instanceMatrix.needsUpdate = true;
      }
      ctx.hud.hint('Ziel-Zeit schlagen – Fahnen sammeln!');
      const api = {
        idle(dt) { time += dt; updObs(dt); updRollers(dt); F.anim(dt, finished ? (starsN >= ctx.max * .6 ? 'cheer' : 'sad') : 'idle'); placeCam(dt); },
        update(dt) {
          time += dt; updObs(dt); updRollers(dt); I.consumeLook();
          if (finished) { F.anim(dt, 'cheer'); placeCam(dt); return; }
          const left = Math.max(0, limit - ctx.t); ctx.hud.time(left, left / limit);
          if (left <= 0) { finished = true; ctx.finish(starsN, 'time'); return; }
          const mv = I.move; invul = Math.max(0, invul - dt);
          // Sturz in den Graben
          if (fallT > 0) { fallT -= dt; py -= 6 * dt; F.anim(dt, 'scared'); F.group.position.set(px, Math.max(py, -1.6), pz); if (fallT <= 0) { const o = onPlank; pz = o.zs - 1.6; px = o.cx; py = 0; v = 0; onPlank = null; ctx.hud.toast('Zurück vor den Graben!'); } placeCam(dt); return; }
          // Klettern
          if (climb) {
            const o = climb, hold = I.down('act');
            if (hold) o.c += dt / climbT; else o.c = Math.max(0, o.c - dt * .6);
            py = o.c * 2.35; ctx.hud.meter('climb', o.c, 'Klettern', '#ffcf4a');
            F.anim(dt, hold ? 'work' : 'idle'); F.armL.rotation.x = -2.6 + Math.sin(time * 9) * (hold ? .4 : 0); F.armR.rotation.x = -2.6 - Math.sin(time * 9) * (hold ? .4 : 0);
            if (o.c >= 1) { o.done = true; climb = null; pz = o.z + .45; py = 2.45; vy = 1.5; air = true; v = 3.2; ctx.S.click(); ctx.hud.meter('climb', null); }
            F.group.position.set(px, py, pz); placeCam(dt); stageCheck(); return;
          }
          // Tempo
          const inMud = !air && muds.find(o => pz > o.zs && pz < o.ze && px > o.x0 && px < o.x1);
          let vt = VBASE + (mv.y > 0 ? mv.y * (VMAX - VBASE) : mv.y * (VBASE - VMIN)); if (I.down('run')) vt = VMAX;
          crouch = I.down('crouch') && !air; if (crouch) vt *= .85; if (inMud) vt *= .42; if (stagT > 0) { stagT -= dt; vt = Math.min(vt, 1.5); }
          v = lerp(v, vt, Math.min(1, dt * (vt > v ? 2.6 : 7)));
          const oz = pz; pz += v * dt; px = clamp(px - mv.x * 4.4 * dt * (inMud ? .6 : 1), -W2 + .3, W2 - .3);
          // Wippe: Querdrift
          if (onPlank && !air) px += Math.sin(time * 2.4 + onPlank.drift) * (.5 + d * .9) * dt;
          // Springen
          const gy = groundY(px, pz);
          const jp = I.pressed('jump'); if (!air && jp && stagT <= 0) { air = true; vy = inMud ? 4.4 : 6.3; ctx.S.click(); }
          if (air) { vy -= 18 * dt; py += vy * dt; if (py <= gy && vy < 0) { if (gy > -.5) { py = gy; air = false; vy = 0; } } }
          else { if (gy < -.5) { air = true; vy = 0; } else py = gy; }
          // Graben / Wippe
          onPlank = null; for (const o of ditches) if (pz > o.zs && pz < o.ze) { if (onPlankAt(o, px, pz) && py >= plankY(o, pz) - .25) onPlank = o; else if (py < -.35) { fails++; fallT = 1.1; onPlank = o; ctx.S.splash(); ctx.hud.toast('🌊 Platsch! In den Graben.', 'bad'); placeCam(dt); return; } }
          // Hindernisse
          const top = py + (crouch ? 1.0 : 1.75);
          for (const o of obs) {
            if (o.type === 'log' && Math.abs(pz - o.z) < .42 && py < o.h + .05 && oz <= o.z + .42) { stumble('🪵 Gestolpert!'); }
            if (o.type === 'beam' && Math.abs(pz - o.bz) < .42 && o.by < top && py < o.by + .3) { stumble('💥 Balken an den Kopf! Ducken!', true); pz -= .4; }
            if (o.type === 'wall' && !o.done && pz > o.z - .45 && oz <= o.z) { pz = o.z - .45; climb = o; o.c = clamp(py / 2.35, 0, .45); v = 0; air = false; vy = 0; if (o.c > .05) ctx.hud.toast('Anlauf-Sprung! Halber Weg geschafft.', 'good'); }
          }
          for (const b of rollers) { if (b.dead) continue; if (Math.abs(b.x - px) < b.r + .3 && Math.abs(b.z - pz) < b.r + .25 && py < b.y + b.r * 2 - .05) { b.dead = true; stumble(b.coc ? '🥥 Kokosnuss erwischt!' : '🛢 Vom Fass umgehauen!'); } }
          // Fahnen
          for (const f of flags) { if (f.got || Math.abs(f.z - pz) > .7 || Math.abs(f.x - px) > .8) continue; if (f.high && py < .4) continue; f.got = true; f.mesh.visible = false; stages[f.st].got++; ctx.S.pad(stages[f.st].got); ctx.hud.toast('🚩 Fahne! −1,5 s', 'good'); }
          // Pose
          const pose = stagT > 0 ? 'scared' : air ? 'run' : crouch ? 'crouch' : v > 4.6 ? 'run' : v > .3 ? 'walk' : 'idle';
          F.anim(dt, pose, v); if (air && pose === 'run') { F.legL.rotation.x = -.9; F.legR.rotation.x = .5; }
          F.group.position.set(px, py, pz); F.group.rotation.y = lerp(F.group.rotation.y, -mv.x * .35, Math.min(1, dt * 8));
          placeCam(dt); stageCheck();
          // Hinweise
          let h = ''; const nx = obs.find(o => o.ze > pz - .2 && o.zs - pz < 9);
          if (nx) h = nx.type === 'log' ? '🪵 Stamm – springen!' : nx.type === 'beam' ? '⚠ Schwingbalken – ducken!' : nx.type === 'mud' ? (nx.full ? '🟤 Schlamm – durchkämpfen!' : '🟤 Schlamm – außen herum!') : nx.type === 'barrels' ? '🛢 Fässer – ausweichen oder springen!' : nx.type === 'seesaw' ? '⚖ Wippe – genau auf das Brett!' : (ctx.touch ? '🧗 Wand – „Klettern“ halten!' : '🧗 Wand – E halten!');
          setHint(h || 'Fahnen sammeln: −1,5 s pro Fahne');
        },
        debug: () => ({ pz: +pz.toFixed(1), px: +px.toFixed(1), py: +py.toFixed(2), v: +v.toFixed(1), si, starsN, fails, L: +L.toFixed(0), limit: +limit.toFixed(0), pars: stages.map(s => +s.par.toFixed(1)), times, flags: flags.filter(f => f.got).length + '/' + flags.length }),
        details: () => ({ fehler: fails, fahnen: flags.filter(f => f.got).length }),
        bot: botPilot
      };
      function stageCheck() {
        const st = stages[si]; if (!st) return;
        const el = ctx.t - stageStart - st.got * 1.5, lbl = 'Etappe ' + (si + 1) + '/' + nStage + ' · ' + Math.max(0, el).toFixed(1) + ' / ' + st.par.toFixed(1) + ' s';
        ctx.hud.meter('stage', clamp(el / st.par, 0, 1), lbl, el > st.par ? '#ff6b4a' : el > st.par * .8 ? '#ffcf4a' : '#9dff5c');
        if (pz >= st.z1) {
          const ok = el <= st.par; if (ok) { starsN++; ctx.hud.toast('★ Etappe ' + (si + 1) + ': ' + el.toFixed(1) + ' s – Bestzeit!', 'good'); } else ctx.hud.toast('Etappe ' + (si + 1) + ': ' + el.toFixed(1) + ' s – Ziel war ' + st.par.toFixed(1) + ' s', 'bad');
          times.push(+el.toFixed(1)); si++; stageStart = ctx.t;
          if (si >= nStage) { starsN++; finished = true; ctx.hud.stars(starsN); ctx.hud.meter('stage', null); ctx.finish(starsN, 'done'); return; }
          ctx.hud.stars(starsN);
        }
      }
      // ---- Testpilot: Lenkt, springt, duckt, klettert mit echten Eingaben
      function botPilot() {
        const hold = {}, press = []; let tx = 0, prio = false, my = 1, pz0 = 1e9;
        if (climb) { hold.act = true; return { move: { x: 0, y: 1 }, hold }; }
        const ahead = obs.filter(o => o.ze > pz - 1 && o.zs - pz < 16);
        for (const o of ahead) {
          const dz = (o.z != null ? o.z : o.zs) - pz;
          if (o.type === 'log' && dz > .55 && dz < 1.3 + v * .05 && !air) press.push('jump');
          if (o.type === 'beam' && Math.abs(o.z - pz) < 3.6) hold.crouch = true;
          if (o.type === 'wall' && dz > .9 && dz < 1.5 && !air) press.push('jump');
          if (o.type === 'mud' && !o.full && o.zs - pz < 9 && !prio) { pz0 = o.zs; tx = o.free < 0 ? -W2 + .95 : W2 - .95; prio = true; }
          if (o.type === 'seesaw' && o.zs - pz < 12 && !prio) { pz0 = o.zs; tx = o.cx; prio = 'plank'; }
          if (o.type === 'barrels' && pz > o.zs - 12 && pz < o.ze + 1 && !prio) {
            let best = px, bd = 1e9; for (let x = -W2 + .5; x <= W2 - .5; x += .35) { let dng = Math.abs(x - px) * .25; for (const b of rollers) { const bz = b.z - pz; if (b.dead || bz < -.5 || bz > 10) continue; const tHit = bz / (b.sp + v), bxd = Math.abs(b.x - x); if (bxd < b.r + .55) dng += 6 / (tHit + .2); } if (dng < bd) { bd = dng; best = x; } } tx = best; prio = true; pz0 = pz;
            for (const b of rollers) { const bz = b.z - pz; if (!b.dead && bz > .2 && bz < .5 + (b.sp + v) * .14 && Math.abs(b.x - px) < b.r + .3 && !air) press.push('jump'); }
          }
        }
        { const f = flags.find(f => !f.got && f.z - pz > -.3 && f.z - pz < 13 && f.z < pz0 - 2 - Math.abs(f.x - px) * .8); if (f) { tx = f.x; if (f.high && !air && f.z - pz > 1.7 && f.z - pz < 2.5) press.push('jump'); } }
        const k = prio === 'plank' ? 3.5 : 2.2; return { move: { x: clamp((px - tx) * k, -1, 1), y: my }, hold, press };
      }
      return api;
    }
  });
})();

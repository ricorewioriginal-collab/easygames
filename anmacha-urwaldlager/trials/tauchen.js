/* Prüfung: Die Schlammlagune (3D) – Tauch-Suchspiel: Funde am Grund (offen, unter Steinen, in Kisten, in Höhlen), Luftvorrat, Gummi-Aale & Blutegel-Puppen, Abliefern am Floß */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp, lerp = E.lerp;
  const TAU = Math.PI * 2;
  T.def({
    id: 'tauchen', name: 'Die Schlammlagune', kind: 'Mut', stat: 'mut', e: '🤿', mode: '3d', lock: false,
    desc: 'Hol Muscheln und Amulette vom Grund der trüben Lagune – offen, unter Steinen, in Kisten und Höhlen. Ein Fund zählt erst auf dem <b>Floß</b> (Netz fasst zwei). Blasen verraten Verstecke. Luft leer = Notauftauchen, Netz weg. Aale und Egel sind aus Gummi.',
    how: { pc: '<b>WASD</b> schwimmen · Maus ziehen: drehen · <b>Leertaste</b> halten: auftauchen · <b>C</b> oder <b>Shift</b> halten: abtauchen · <b>E</b>: Kiste öffnen / Stein heben (halten)', touch: 'Joystick: schwimmen · rechts wischen: drehen · <b>Auf ▲</b> / <b>Ab ▼</b> halten · <b>Heben</b>: Kiste öffnen / Stein heben (halten)' },
    controls: { joy: true, look: true, buttons: [{ id: 'jump', label: 'Auf ▲', big: true }, { id: 'crouch', label: 'Ab ▼', big: true }, { id: 'act', label: 'Heben' }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short, n = ctx.max;
      const R = E.rand(11 + Math.floor(Math.random() * 99999));
      const limit = short ? 64 - d * 10 : 155 - d * 25, airMax = 23 - d * 7, vH = 3, vV = 2.2, RIM = 26.5, CAP = 2;
      // ---- Gelände: Schlammbecken
      const hF = (x, z) => { const r = Math.hypot(x, z), t = clamp((r - 22) / 7.5, 0, 1), s = t * t * (3 - 2 * t); return lerp(-9.6 + (E.noise2(x * .11 + 5, z * .11) - .5) * 3 + Math.sin(x * .4) * .15, 1.6, s); };
      const UNDER = new THREE.Color(0x1f3d2a), ABOVE = new THREE.Color(0x8fb38a), fogFar = 14.5 - d * 5;
      S.background = UNDER.clone(); S.fog = new THREE.Fog(UNDER.getHex(), .5, fogFar);
      const L = ctx.lights({ sky: 0xd8ffd0, ground: 0x2b3a1a, hemi: .95, dir: .55 }); L.sun.position.set(3, 20, 6);
      const fg = new THREE.PlaneGeometry(72, 72, 52, 52); fg.rotateX(-Math.PI / 2);
      { const p = fg.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = hF(x, z); p.setY(i, y); const k = E.noise2(x * .5, z * .5); if (y > -.2) c.set(k > .5 ? '#4f7a32' : '#5d6b2c'); else c.setRGB(.24 + k * .12, .22 + k * .1, .12 + k * .04); col.set([c.r, c.g, c.b], i * 3); }
        fg.setAttribute('color', new THREE.BufferAttribute(col, 3)); fg.computeVertexNormals(); }
      S.add(new THREE.Mesh(fg, E.vcMat));
      // Wasseroberfläche
      const water = new THREE.Mesh(new THREE.PlaneGeometry(76, 76), new THREE.MeshBasicMaterial({ color: 0x6a9a58, transparent: true, opacity: .62, side: THREE.DoubleSide, depthWrite: false }));
      water.rotation.x = -Math.PI / 2; water.position.y = .02; S.add(water);
      // Ufer: Bäume, Schilf (verschmolzen)
      const bank = [];
      for (let i = 0; i < 46; i++) { const a = i / 46 * TAU + R() * .1, r = 30.5 + R() * 4, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 4 + R() * 5; bank.push({ g: E.geo.cylLo, m: E.mtx(x, h / 2, z, 0, 0, 0, .25, h, .25), c: '#5a3d22' }, { g: E.geo.ico, m: E.mtx(x, h + .8, z, 0, R() * 3, 0, 1.8 + R(), 1.4 + R(), 1.8 + R()), c: ['#2f7d3a', '#3c8f45', '#25663a'][i % 3], jit: .25 }); }
      for (let i = 0; i < 70; i++) { const a = R() * TAU, r = 27 + R() * 3, x = Math.cos(a) * r, z = Math.sin(a) * r; bank.push({ g: E.geo.cone, m: E.mtx(x, .6, z, (R() - .5) * .3, 0, (R() - .5) * .3, .06, 1.8, .06), c: '#7a9a3a' }); }
      S.add(new THREE.Mesh(E.merge(bank), E.vcMat));
      // Floß in der Mitte
      const raft = new THREE.Group(), rp = [];
      for (let i = -3; i <= 3; i++) rp.push({ g: E.geo.cylLo, m: E.mtx(i * .36, 0, 0, Math.PI / 2, 0, 0, .18, 2.6, .18), c: i % 2 ? '#8a5a32' : '#7a4e2a' });
      rp.push({ g: E.geo.cylLo, m: E.mtx(0, .16, .9, 0, 0, Math.PI / 2, .07, 2.6, .07), c: '#5a3d22' }, { g: E.geo.cylLo, m: E.mtx(0, .16, -.9, 0, 0, Math.PI / 2, .07, 2.6, .07), c: '#5a3d22' });
      rp.push({ g: E.geo.cylLo, m: E.mtx(.9, 1.2, .8, 0, 0, 0, .04, 2.2, .04), c: '#c8a26a' }, { g: E.geo.box, m: E.mtx(1.25, 2, .8, 0, 0, 0, .7, .45, .03), c: '#ff5fa2' });
      rp.push({ g: E.geo.cyl, m: E.mtx(-.6, .4, -.3, 0, 0, 0, .45, .5, .45), c: '#c8a464' }, { g: E.geo.torus, m: E.mtx(-.6, .65, -.3, Math.PI / 2, 0, 0, .45, .45, .45), c: '#a8844a' });
      raft.add(new THREE.Mesh(E.merge(rp), E.vcMat)); S.add(raft);
      // ---- Felsen/Kollision
      const solids = []; // {x,y,z,r}
      const rocks = [], deco = [];
      const addRock = (x, y, z, r, col, sy) => { deco.push({ g: E.geo.dodec, m: E.mtx(x, y, z, R() * 3, R() * 3, R() * 3, r * 1.08, r * (sy || 1), r * 1.08), c: col || '#5f6455', jit: .3 }); solids.push({ x, y, z, r }); };
      // ---- Funde verteilen
      const types = short ? ['open', 'stone', 'chest', 'cave'] : ['open', 'stone', 'chest', 'cave', 'stone', 'open', 'chest', 'cave'];
      const kinds = types.slice(0, n); for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
      const finds = [], a0 = R() * TAU;
      const shellGeo = E.merge([{ g: E.geo.sph, m: E.mtx(0, 0, 0, 0, 0, 0, .28, .09, .24), c: '#ffc6d0' }, ...[-2, -1, 0, 1, 2].map(k => ({ g: E.geo.box, m: E.mtx(k * .09, .07, -.02, 0, k * .3, 0, .03, .03, .38), c: '#f59ab0' })), { g: E.geo.box, m: E.mtx(0, .02, -.22, 0, 0, 0, .14, .06, .08), c: '#e88aa0' }]);
      const amuGeo = E.merge([{ g: E.geo.torus, m: E.mtx(0, 0, 0, 0, 0, 0, .26, .26, .4), c: '#ffd24a' }, { g: E.geo.sph, m: E.mtx(0, 0, 0, 0, 0, 0, .12, .12, .07), c: '#e0303a' }, { g: E.geo.torus, m: E.mtx(0, .32, 0, 0, Math.PI / 2, 0, .08, .08, .1), c: '#ffd24a' }]);
      const findMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x332200 });
      const glowMat = new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
      for (let i = 0; i < n; i++) {
        let a = a0 + i / n * TAU + (R() - .5) * .5, dist = short ? 7 + R() * 5 : 9 + R() * 12; if (kinds[i] === 'cave') dist = Math.min(dist, 19);
        const x = Math.sin(a) * dist, z = Math.cos(a) * dist, fy = hF(x, z);
        const f = { i, kind: kinds[i], x, y: fy + .3, z, hx: x, hz: z, home: fy + .3, st: 'hidden', open: kinds[i] === 'open' || kinds[i] === 'cave', lift: 0, carried: false, done: false };
        f.mesh = new THREE.Mesh(i % 2 ? amuGeo : shellGeo, findMat); f.mesh.position.set(x, f.y, z); S.add(f.mesh);
        f.glow = new THREE.Sprite(glowMat.clone()); f.glow.scale.setScalar(1.3); f.glow.position.copy(f.mesh.position); S.add(f.glow);
        if (f.kind === 'stone') {
          f.rock = new THREE.Mesh(E.geo.dodec, E.mat('#6b6e5c', { flatShading: true })); f.rock.scale.set(1.05, .75, 1.05); f.rock.position.set(x, fy + .55, z); S.add(f.rock);
          f.solid = { x, y: fy + .5, z, r: .85 }; solids.push(f.solid); f.mesh.visible = false; f.glow.visible = false;
          f.rockTo = { x: x + Math.cos(a) * 1.6, z: z - Math.sin(a) * 1.6 };
        } else if (f.kind === 'chest') {
          const body = E.merge([{ g: E.geo.box, m: E.mtx(0, .3, 0, 0, 0, 0, 1.1, .6, .75), c: '#6b4426', jit: .2 }, { g: E.geo.box, m: E.mtx(0, .3, .38, 0, 0, 0, 1.12, .1, .02), c: '#b08a3a' }, { g: E.geo.box, m: E.mtx(0, .3, -.38, 0, 0, 0, 1.12, .1, .02), c: '#b08a3a' }]);
          f.chest = new THREE.Mesh(body, E.vcMat); f.chest.position.set(x, fy - .05, z); f.chest.rotation.set(.08, a, .05); S.add(f.chest);
          f.lid = new THREE.Group(); f.lid.position.set(0, .6, -.37); f.chest.add(f.lid);
          const lm = new THREE.Mesh(E.merge([{ g: E.geo.box, m: E.mtx(0, .08, .37, 0, 0, 0, 1.12, .16, .77), c: '#7a5030' }, { g: E.geo.box, m: E.mtx(0, .1, .76, 0, 0, 0, .14, .16, .04), c: '#d8b040' }]), E.vcMat); f.lid.add(lm);
          f.solid = { x, y: fy + .3, z, r: .6 }; solids.push(f.solid); f.mesh.visible = false; f.glow.visible = false; f.y = fy + .45; f.mesh.position.y = f.y;
        } else if (f.kind === 'cave') {
          const open = Math.atan2(-x, -z); f.open = true; f.mouth = { x: x + Math.sin(open) * 4.4, z: z + Math.cos(open) * 4.4 };
          for (let k = 0; k < 7; k++) { const an = open + 1.05 + k / 6 * (TAU - 2.1), rx = x + Math.sin(an) * 2.4, rz = z + Math.cos(an) * 2.4; addRock(rx, hF(rx, rz) + 1.0, rz, 1.35, '#585c4c'); }
          deco.push({ g: E.geo.dodec, m: E.mtx(x, fy + 3.3, z, .2, open, .1, 3.1, 1.25, 3.1), c: '#4f5446', jit: .3 }); solids.push({ x, y: fy + 3.75, z, r: 2.1 });
          for (const s of [-1, 1]) { const an = open + s * .95, rx = x + Math.sin(an) * 2.6, rz = z + Math.cos(an) * 2.6; addRock(rx, hF(rx, rz) + 1.6, rz, 1.05, '#62665a'); }
        } else { // offen zwischen Pflanzen
          f.mesh.rotation.set(.3, R() * 3, .2);
        }
        finds.push(f);
      }
      // Deko-Felsen und versunkene Kisten (verschmolzen) – nicht zu nah an Funden
      const near = (x, z, r) => finds.some(f => Math.hypot(f.x - x, f.z - z) < r) || Math.hypot(x, z) < 3;
      for (let i = 0; i < 34; i++) { const a = R() * TAU, r = 3 + R() * 21, x = Math.sin(a) * r, z = Math.cos(a) * r; if (near(x, z, 4.2)) continue; const s = .5 + R() * 1.1; addRock(x, hF(x, z) + s * .3, z, s, R() < .5 ? '#5f6455' : '#6e6a52', .7); }
      for (let i = 0; i < 9; i++) { const a = R() * TAU, r = 4 + R() * 19, x = Math.sin(a) * r, z = Math.cos(a) * r; if (near(x, z, 3.5)) continue; const y = hF(x, z); deco.push({ g: E.geo.box, m: E.mtx(x, y + .3, z, (R() - .5) * .5, R() * 3, (R() - .5) * .6, 1, .7, .8), c: '#5a4630', jit: .3 }, { g: E.geo.box, m: E.mtx(x, y + .66, z, (R() - .5) * .5, R() * 3, (R() - .5) * .6, 1.02, .05, .82), c: '#7a6a3a' }); solids.push({ x, y: y + .3, z, r: .6 }); }
      // Bootswrack als Landmarke
      { const a = R() * TAU, x = Math.sin(a) * 14, z = Math.cos(a) * 14; if (!near(x, z, 5)) { const y = hF(x, z); deco.push({ g: E.geo.box, m: E.mtx(x, y + .5, z, .2, a, .35, 1.8, .9, 4.4), c: '#4a3a26', jit: .3 }, { g: E.geo.cylLo, m: E.mtx(x, y + 2.2, z + .5, .3, a, .4, .09, 3.4, .09), c: '#5a4630' }); solids.push({ x, y: y + .6, z, r: 1.2 }, { x: x + Math.sin(a) * 1.6, y: y + .6, z: z + Math.cos(a) * 1.6, r: 1 }, { x: x - Math.sin(a) * 1.6, y: y + .6, z: z - Math.cos(a) * 1.6, r: 1 }); } }
      S.add(new THREE.Mesh(E.merge(deco), E.vcMat));
      // Wasserpflanzen (instanziert, wiegen sich)
      const plants = []; const plGeo = new THREE.ConeGeometry(.16, 1, 4); plGeo.translate(0, .5, 0);
      for (let i = 0; i < 120; i++) { let x, z; if (i < finds.length * 6) { const f = finds[i % finds.length]; if (f.kind !== 'open') continue; const a = R() * TAU, r = .6 + R() * 1.1; x = f.x + Math.sin(a) * r; z = f.z + Math.cos(a) * r; } else { const a = R() * TAU, r = 1 + R() * 24; x = Math.sin(a) * r; z = Math.cos(a) * r; } plants.push({ x, z, y: hF(x, z) - .05, h: 1.2 + R() * 2.6, ph: R() * 6 }); }
      const plantIM = new THREE.InstancedMesh(plGeo, new THREE.MeshLambertMaterial({ color: 0x4e8a3a }), plants.length); S.add(plantIM);
      plants.forEach((p, i) => plantIM.setColorAt(i, new THREE.Color().setHSL(.24 + R() * .1, .5, .25 + R() * .15)));
      const dm = new THREE.Object3D();
      function updPlants(t) { for (let i = 0; i < plants.length; i++) { const p = plants[i]; dm.position.set(p.x, p.y, p.z); dm.rotation.set(Math.sin(t * 1.1 + p.ph) * .18, 0, Math.cos(t * .9 + p.ph) * .18); dm.scale.set(1, p.h, 1); dm.updateMatrix(); plantIM.setMatrixAt(i, dm.matrix); } plantIM.instanceMatrix.needsUpdate = true; }
      // Lichtstrahlen von oben
      const rayGeo = new THREE.ConeGeometry(1, 1, 10, 1, true); rayGeo.translate(0, -.5, 0);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xe8ffc0, transparent: true, opacity: .045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const rays = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(rayGeo, rayMat); const a = R() * TAU, r = R() * 20; m.position.set(Math.sin(a) * r, .0, Math.cos(a) * r); m.scale.set(1 + R() * 1.2, 11, 1 + R() * 1.2); m.userData.ph = R() * 6; m.rotation.z = .12; S.add(m); rays.push(m); }
      // Blasen (Funde verraten sich) + Spielerblasen
      const BPF = 5, nb = n * BPF + 8, bPos = new Float32Array(nb * 3), bub = [];
      for (let i = 0; i < nb; i++) bub.push({ f: i < n * BPF ? finds[Math.floor(i / BPF)] : null, y: -R() * 8, ox: (R() - .5) * .3, oz: (R() - .5) * .3, sp: .8 + R() * .7, ph: R() * 6 });
      const bGeo = new THREE.BufferGeometry(); bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      const bubbles = new THREE.Points(bGeo, new THREE.PointsMaterial({ map: E.glowTex(), color: 0xd8fff0, size: .22, transparent: true, depthWrite: false, opacity: .85 })); bubbles.frustumCulled = false; S.add(bubbles);
      // ---- Gummi-Aale (instanziert) und Blutegel-Puppen
      const SEG = 9, nEel = short ? 2 + Math.round(d * 1.5) : 2 + Math.round(d * 3), eels = [];
      for (let i = 0; i < nEel; i++) { const f = finds[(i * 2 + 1) % n], a = R() * TAU; const cx = f.x + Math.sin(a) * 1.5, cz = f.z + Math.cos(a) * 1.5; eels.push({ cx, cz, rx: 2.6 + R() * 2.2, rz: 2.6 + R() * 2.2, y0: hF(cx, cz) + 1.3 + R() * 1.6, w: (.45 + d * .35 + R() * .15) * (R() < .5 ? -1 : 1), th: R() * TAU, seg: [] }); }
      const eelIM = new THREE.InstancedMesh(E.geo.sph, new THREE.MeshLambertMaterial({ color: 0xffffff }), nEel * SEG); S.add(eelIM);
      const eCol = new THREE.Color(); for (let i = 0; i < nEel; i++) for (let j = 0; j < SEG; j++) { eCol.set(j === 0 ? '#c8ff3a' : j % 2 ? '#7a3cff' : '#c8ff3a'); eelIM.setColorAt(i * SEG + j, eCol); eels[i].seg.push(new THREE.Vector3()); }
      const nLeech = short ? 1 + Math.round(d) : 2 + Math.round(d * 2), leeches = [];
      for (let i = 0; i < nLeech; i++) { const f = finds[(i * 2) % n], a = R() * TAU, x = f.x + Math.sin(a) * 3, z = f.z + Math.cos(a) * 3; leeches.push({ hx: x, hz: z, hy: hF(x, z) + .5, p: new THREE.Vector3(x, hF(x, z) + .5, z), ph: R() * 6 }); }
      const leechIM = new THREE.InstancedMesh(E.geo.sph, new THREE.MeshLambertMaterial({ color: 0x5a1020, emissive: 0x200008 }), Math.max(1, nLeech)); leechIM.count = nLeech; S.add(leechIM);
      function updEels(dt, t) {
        for (let i = 0; i < nEel; i++) { const e = eels[i]; e.th += e.w * dt; const rr = (e.rx + e.rz) / 2;
          for (let j = 0; j < SEG; j++) { const th = e.th - Math.sign(e.w) * j * .36 / rr, wig = Math.sin(t * 7 - j * .9) * .14; const x = e.cx + Math.cos(th) * (e.rx + wig), z = e.cz + Math.sin(th) * (e.rz + wig), y = e.y0 + Math.sin(th * 2) * .6; e.seg[j].set(x, y, z);
            const s = j === 0 ? .2 : .17 * (1 - j / SEG * .55); dm.position.set(x, y, z); dm.rotation.set(0, 0, 0); dm.scale.set(s, s, s * (j === 0 ? 1.3 : 1)); dm.updateMatrix(); eelIM.setMatrixAt(i * SEG + j, dm.matrix); } }
        eelIM.instanceMatrix.needsUpdate = true;
      }
      // ---- Spielfigur
      const F = ctx.figure(Object.assign({}, ctx.who), { blob: false }); F.group.rotation.order = 'YXZ'; S.add(F.group);
      const P = new THREE.Vector3(0, -.3, 6), V = new THREE.Vector3(), tmp = new THREE.Vector3(), camT = new THREE.Vector3();
      let yaw = 0, pitch = .5, heading = 0, air = 1, time = 0, pen = 0, carried = [], delivered = 0, finished = false, rescue = false, scare = 0, invul = 0, hits = 0, rescues = 0, lowWarn = false, hintS = '', lastSurf = true, splashT = 0;
      // ---- Hilfen
      function collide() {
        for (const s of solids) { tmp.set(P.x - s.x, P.y - s.y, P.z - s.z); const dd = tmp.length(), m = s.r + .42; if (dd < m && dd > 1e-4) { tmp.multiplyScalar((m - dd) / dd); P.add(tmp); } }
        const fy = hF(P.x, P.z) + .42; if (P.y < fy) P.y = fy; if (P.y > -.25) P.y = -.25;
        const r = Math.hypot(P.x, P.z); if (r > RIM) { P.x *= RIM / r; P.z *= RIM / r; }
        if (P.y > -1.1) { const rr = Math.hypot(P.x - raft.position.x, P.z - raft.position.z); if (rr < 1.7) { P.x = raft.position.x + (P.x - raft.position.x) / (rr || 1) * 1.7; P.z = raft.position.z + (P.z - raft.position.z) / (rr || 1) * 1.7; } }
      }
      function placeCam(dt) {
        const cp = Math.cos(pitch), fx = Math.sin(yaw), fz = Math.cos(yaw);
        // Kamera nicht in Felsen: Strahl Spieler→Kamera gegen Kollisionskugeln
        const ox = P.x, oy = P.y + .5, oz = P.z, dx = -fx * cp, dy = Math.sin(pitch), dz = -fz * cp; let dist = 4.4;
        for (const s of solids) { const lx = s.x - ox, ly = s.y - oy, lz = s.z - oz, tc = lx * dx + ly * dy + lz * dz; if (tc < 0) continue; const d2 = lx * lx + ly * ly + lz * lz - tc * tc, rr = (s.r + .35) * (s.r + .35); if (d2 > rr) continue; const th = tc - Math.sqrt(rr - d2); if (th < dist) dist = Math.max(1.2, th); }
        camT.set(ox + dx * dist, oy + dy * dist, oz + dz * dist);
        const fl = hF(camT.x, camT.z) + .35; if (camT.y < fl) camT.y = fl; if (Math.abs(camT.y) < .14) camT.y = camT.y < 0 ? -.14 : .14;
        const k = dt ? Math.min(1, dt * 8) : 1; cam.position.lerp(camT, k); if (Math.abs(cam.position.y) < .12) cam.position.y = cam.position.y < 0 ? -.12 : .12;
        cam.lookAt(P.x + fx * 1.2, P.y + .3, P.z + fz * 1.2);
        const under = cam.position.y < 0;
        if (under !== lastSurf) { lastSurf = under; S.background.copy(under ? UNDER : ABOVE); S.fog.color.copy(under ? UNDER : ABOVE); S.fog.near = under ? .5 : 14; S.fog.far = under ? fogFar : 70; rays.forEach(r => { r.visible = under; }); bubbles.visible = true; }
      }
      function placeFig(dt, pose) {
        F.group.position.set(P.x, P.y - .92, P.z); // Hüfte = Körpermitte
        const hs = Math.hypot(V.x, V.z); if (hs > .3) heading = E.angLerp(heading, Math.atan2(V.x, V.z), Math.min(1, dt * 6));
        F.group.rotation.y = heading; F.group.rotation.x = lerp(F.group.rotation.x, pose === 'swim' ? clamp(-V.y * .15, -.35, .35) : 0, Math.min(1, dt * 5));
        F.anim(dt, pose, hs);
      }
      function nearFind(kind, r) { let best = null, bd = r; for (const f of finds) { if (f.done || f.carried || f.kind !== kind || f.open) continue; const dd = Math.hypot(f.x - P.x, f.y - P.y, f.z - P.z); if (dd < bd) { bd = dd; best = f; } } return best; }
      function setHint(s) { if (s !== hintS) { hintS = s; ctx.hud.hint(s); } }
      updPlants(0); updEels(0, 0); placeCam(0); placeFig(0, 'swim');
      ctx.hud.stars(0);
      const act = ctx.touch ? '„Heben“' : 'E';
      const api = {
        idle(dt) { time += dt; updPlants(time); updEels(dt, time); raft.position.y = Math.sin(time * 1.3) * .05; F.anim(dt, finished ? (delivered >= n ? 'cheer' : 'swim') : 'swim'); placeCam(dt); },
        update(dt) {
          time += dt; const mv = I.move, look = I.consumeLook();
          yaw -= look.dx * .0045; pitch = clamp(pitch + look.dy * .004, -.75, 1.1);
          updPlants(time); updEels(dt, time); raft.position.y = Math.sin(time * 1.3) * .05; raft.rotation.z = Math.sin(time * .9) * .03;
          rays.forEach(r => { r.rotation.x = Math.sin(time * .3 + r.userData.ph) * .08; });
          if (finished) { placeFig(dt, 'cheer'); placeCam(dt); return; }
          const used = ctx.t + pen, left = Math.max(0, limit - used); ctx.hud.time(left, left / limit);
          if (left <= 0) { finished = true; ctx.finish(delivered, 'time'); return; }
          const surf = P.y > -.75;
          // Luft
          if (surf) air = Math.min(1, air + dt * .55); else air -= dt / airMax;
          if (air < .25 && !surf && !lowWarn) { lowWarn = true; ctx.hud.toast('⚠ Luft wird knapp – auftauchen!', 'bad'); ctx.S.click(); }
          if (air > .4) lowWarn = false;
          if (air <= 0 && !rescue) {
            rescue = true; rescues++; air = 0; pen += 5; ctx.S.bad();
            const lost = carried.length; carried.forEach(f => { f.carried = false; f.x = f.hx; f.z = f.hz; f.y = f.home + (f.kind === 'chest' ? .15 : 0); f.mesh.visible = true; f.glow.visible = true; f.mesh.position.set(f.x, f.y, f.z); }); carried = [];
            ctx.hud.toast('😵 Keine Luft! Notauftauchen' + (lost ? ' – ' + lost + ' Fund' + (lost > 1 ? 'e' : '') + ' verloren' : '') + ' · +5 s', 'bad');
          }
          // Bewegung
          let pose = 'swim';
          if (rescue) { V.set(0, 4.5, 0); P.addScaledVector(V, dt); collide(); pose = 'scared'; if (P.y >= -.3) { rescue = false; air = .35; } }
          else {
            const fx = Math.sin(yaw), fz = Math.cos(yaw), sl = scare > 0 ? .3 : 1;
            const wx = (fx * mv.y - fz * mv.x) * vH * sl, wz = (fz * mv.y + fx * mv.x) * vH * sl;
            let wy = 0; if (I.down('jump')) wy = vV; else if (I.down('crouch') || I.down('run')) wy = -vV; else if (surf && Math.hypot(mv.x, mv.y) < .1) wy = .3;
            const k = Math.min(1, dt * 3.2); V.x = lerp(V.x, wx, k); V.z = lerp(V.z, wz, k); V.y = lerp(V.y, wy * sl, Math.min(1, dt * 4));
            P.addScaledVector(V, dt); collide();
            if (scare > 0) { scare -= dt; pose = 'scared'; }
          }
          invul = Math.max(0, invul - dt);
          // Gummi-Tiere
          for (let i = 0; i < nLeech; i++) {
            const l = leeches[i], dx = P.x - l.p.x, dy = P.y - l.p.y, dz = P.z - l.p.z, dd = Math.hypot(dx, dy, dz), hd = Math.hypot(l.hx - l.p.x, l.hy - l.p.y, l.hz - l.p.z);
            const sp = .75 + d * .6; if (dd < 4.5 && hd < 7 && !rescue) l.p.addScaledVector(tmp.set(dx, dy, dz).normalize(), sp * dt); else if (hd > .1) l.p.addScaledVector(tmp.set(l.hx - l.p.x, l.hy - l.p.y, l.hz - l.p.z).normalize(), .6 * dt);
            l.ph += dt * 4; const s = 1 + Math.sin(l.ph) * .2; dm.position.copy(l.p); dm.lookAt(P); dm.scale.set(.16 * s, .16 / s, .42 * s); dm.updateMatrix(); leechIM.setMatrixAt(i, dm.matrix);
            if (dd < .62 && invul <= 0 && !rescue) hit('🪱 Eine Blutegel-Puppe! Iiih!', tmp.set(dx, dy, dz));
          }
          leechIM.instanceMatrix.needsUpdate = true;
          if (invul <= 0 && !rescue) for (const e of eels) { for (let j = 0; j < SEG; j += 2) { const s = e.seg[j]; if (Math.abs(s.x - P.x) < .7 && Math.abs(s.y - P.y) < .7 && Math.abs(s.z - P.z) < .7 && s.distanceTo(P) < .6) { hit('🐍 Gummi-Aal! Schreck!', tmp.set(P.x - s.x, P.y - s.y, P.z - s.z)); break; } } if (invul > 0) break; }
          // Interaktion
          let near = null, actLbl = 'Heben', ah = ''; const actP = I.pressed('act');
          const st = nearFind('stone', 2.3), ch = nearFind('chest', 2.2);
          if (st && !rescue) { near = st; ah = act + ' halten: Stein anheben'; if (I.down('act')) { st.lift += dt / (.7 + d * .4); ctx.hud.meter('lift', st.lift, 'Stein heben', '#ffcf4a'); if (st.lift >= 1) { st.open = true; st.mesh.visible = true; st.glow.visible = true; st.solid.x = st.rockTo.x; st.solid.z = st.rockTo.z; ctx.S.thud(); ctx.hud.toast('Stein weg – da glänzt was!', 'good'); ctx.hud.meter('lift', null); } } else { st.lift = Math.max(0, st.lift - dt); ctx.hud.meter('lift', st.lift > 0 ? st.lift : null, 'Stein heben', '#ffcf4a'); } }
          else ctx.hud.meter('lift', null);
          if (ch && !rescue) { near = ch; actLbl = 'Öffnen'; ah = act + ': Kiste öffnen'; if (actP) { ch.open = true; ch.mesh.visible = true; ch.glow.visible = true; ctx.S.click(); ctx.hud.toast('Knarz! Die Kiste ist offen.', 'good'); } }
          I.setButton('act', actLbl, true);
          // Aufsammeln
          for (const f of finds) {
            if (f.kind === 'stone' && f.rock) { const t = f.open ? 1 : f.lift * .25; f.rock.position.set(lerp(f.hx, f.rockTo.x, t), f.home + .25 + Math.sin(t * Math.PI) * 1.2 + (f.open ? .1 : f.lift * .25), lerp(f.hz, f.rockTo.z, t)); f.rock.rotation.set(t * 1.6, 0, t * .8); }
            if (f.lid) f.lid.rotation.x = lerp(f.lid.rotation.x, f.open ? -1.9 : 0, Math.min(1, dt * 4));
            if (f.done || f.carried) continue;
            f.mesh.rotation.y += dt * 1.5; const gl = f.glow.material; gl.opacity = (.55 + Math.sin(time * 4 + f.i) * .3) * clamp(1 - cam.position.distanceTo(f.mesh.position) / 17, 0, 1);
            if (f.open && !rescue && Math.hypot(f.x - P.x, f.y - P.y, f.z - P.z) < 1.25) { if (carried.length >= CAP) { if (!f._full || time - f._full > 3) { f._full = time; ctx.hud.toast('🕸 Netz voll (2)! Erst zum Floß.', 'bad'); } continue; } f.carried = true; carried.push(f); f.mesh.visible = false; f.glow.visible = false; ctx.S.pad(carried.length); ctx.hud.toast((f.i % 2 ? '📿 Amulett' : '🐚 Muschel') + ' im Netz! Ab zum Floß.', 'good'); }
          }
          // Abliefern am Floß
          if (carried.length && surf && Math.hypot(P.x - raft.position.x, P.z - raft.position.z) < 3.1) {
            delivered += carried.length; carried.forEach(f => { f.done = true; f.carried = false; }); ctx.S.splash(); ctx.hud.toast('★ ' + carried.length + ' Fund' + (carried.length > 1 ? 'e' : '') + ' aufs Floß!', 'good'); carried = []; ctx.hud.stars(delivered);
            if (delivered >= n) { finished = true; ctx.finish(delivered, 'done'); placeFig(dt, 'cheer'); return; }
          }
          if (surf !== api._surf) { api._surf = surf; if (time > 1 && splashT <= 0) { ctx.S.splash(); splashT = 1; } } splashT -= dt;
          // Blasen
          for (let i = 0; i < nb; i++) { const b = bub[i]; b.y += b.sp * dt; let bx, by, bz; if (b.f) { const f = b.f; if (f.done || f.carried || (f.kind === 'chest' && !f.open && b.y > 1.2 && b.ph > 3)) { bx = 0; by = -50; bz = 0; } else { const top = -f.y; if (b.y > top) b.y = 0; bx = f.x + b.ox + Math.sin(time * 2 + b.ph + b.y) * .12; by = f.y + .1 + b.y; bz = f.z + b.oz; } } else { if (surf || b.y > 2.5) b.y = 0; bx = P.x + Math.sin(heading) * .5 + b.ox; by = P.y + .3 + b.y; bz = P.z + Math.cos(heading) * .5 + b.oz; if (surf) by = -50; } bPos[i * 3] = bx; bPos[i * 3 + 1] = by; bPos[i * 3 + 2] = bz; }
          bGeo.attributes.position.needsUpdate = true;
          placeFig(dt, pose); placeCam(dt);
          // HUD
          ctx.hud.meter('air', air, air < .25 ? '⚠ Luft' : '🫧 Luft', air < .25 ? '#ff6b4a' : air < .5 ? '#ffcf4a' : '#5ad1ff');
          ctx.hud.meter('depth', clamp(-P.y / 10, 0, 1), 'Tiefe ' + Math.max(0, -P.y).toFixed(1) + ' m', '#37d6e8');
          setHint(rescue ? 'Nach oben treiben …' : ah ? ah : carried.length ? '🕸 Im Netz: ' + carried.length + ' – zurück zum Floß (Oberfläche)!' : surf && air < .95 ? 'Luft holen … dann abtauchen. Blasen verraten Funde!' : 'Folge den Blasen – Funde liegen am Grund.');
        },
        debug: () => ({ P: [+P.x.toFixed(1), +P.y.toFixed(1), +P.z.toFixed(1)], cam: [+cam.position.x.toFixed(1), +cam.position.y.toFixed(1), +cam.position.z.toFixed(1)], yaw: +yaw.toFixed(2), pitch: +pitch.toFixed(2), air: +air.toFixed(2), delivered, carried: carried.length, hits, rescues, pen, finds: finds.map(f => ({ k: f.kind, open: f.open, done: f.done, c: f.carried })) }),
        details: () => ({ schreck: hits, notauftauchen: rescues }),
        bot: botPilot
      };
      api._surf = true;
      function hit(msg, away) { hits++; invul = 2.2; scare = .8; pen += 3; air = Math.max(.02, air - .06); away.normalize(); V.copy(away).multiplyScalar(3.5); ctx.S.bad(); ctx.hud.toast(msg + ' +3 s', 'bad'); }
      // ---- Testpilot: echte Eingaben (Joystick relativ zur Kamera, Auf/Ab halten, Kamera drehen)
      let bStuck = 0, bLast = new THREE.Vector3(), bUp = 0, bWant = null;
      function botPilot(dt) {
        if (rescue || finished) return {};
        const surf = P.y > -.75, airSec = air * airMax;
        let tx, ty, tz, actHold = false, press = [];
        const rest = finds.filter(f => !f.done && !f.carried);
        let next = null, nd = 1e9; for (const f of rest) { const dd = Math.hypot(f.x - P.x, f.z - P.z) + Math.abs(f.y - P.y) * .5; if (dd < nd) { nd = dd; next = f; } }
        const backNeed = (-P.y) / vV + Math.hypot(P.x, P.z) / vH * .3 + 3.5;
        let goRaft = carried.length && (!next || carried.length >= CAP || (next && airSec < (Math.hypot(next.x - P.x, next.z - P.z) / vH + (next.y - P.y < 0 ? (P.y - next.y) / vV : 0)) * 2 + 7));
        if (goRaft) { tx = raft.position.x; tz = raft.position.z; ty = -.3; }
        else if (next) {
          tx = next.x; tz = next.z; ty = next.y + .2;
          if (next.kind === 'cave') { const dm2 = Math.hypot(next.mouth.x - P.x, next.mouth.z - P.z), dc = Math.hypot(next.x - P.x, next.z - P.z); if (dc > 2.2 && dm2 > .9 && Math.hypot(next.mouth.x - next.x, next.mouth.z - next.z) < dc + .5) { tx = next.mouth.x; tz = next.mouth.z; ty = hF(tx, tz) + .8; } else ty = next.y + .25; }
          else if (!next.open) { const ds = Math.hypot(next.x - P.x, next.z - P.z); ty = next.y + (next.kind === 'stone' ? 1.3 : 1.2); if (ds < 1.6) { tx = P.x; tz = P.z; } if (ds < 2) { actHold = next.kind === 'stone'; if (next.kind === 'chest' && Math.random() < .3) press.push('act'); } }
          const hd = Math.hypot(tx - P.x, tz - P.z); if (hd > 4) ty = Math.max(ty, Math.min(-1.2, ty + 2.2));
          // vor dem Abtauchen genug Luft?
          if (surf && air < .93) ty = -.3;
        } else { tx = P.x; tz = P.z; ty = -.3; }
        if (!surf && airSec < backNeed) { ty = -.2; if (!carried.length && next) { tx = P.x; tz = P.z; } }
        // Aale meiden
        let ax = 0, az = 0, ay = 0; for (const e of eels) for (let j = 0; j < SEG; j += 3) { const s = e.seg[j], dx = P.x - s.x, dy = P.y - s.y, dz = P.z - s.z, dd = Math.hypot(dx, dy, dz); if (dd < 2.4) { const w = (2.4 - dd) / dd; ax += dx * w; ay += dy * w; az += dz * w; } }
        for (const l of leeches) { const dx = P.x - l.p.x, dy = P.y - l.p.y, dz = P.z - l.p.z, dd = Math.hypot(dx, dy, dz); if (dd < 1.8) { const w = (1.8 - dd) / dd; ax += dx * w; ay += dy * w; az += dz * w; } }
        let dx = tx - P.x, dz = tz - P.z; const hd = Math.hypot(dx, dz); if (hd > 1) { dx /= hd; dz /= hd; } dx += ax * .8; dz += az * .8; const m = Math.hypot(dx, dz); if (m > 1) { dx /= m; dz /= m; }
        // festgefahren? kurz aufsteigen
        bStuck += dt; if (bStuck > 1.2) { if (P.distanceTo(bLast) < .6 && hd > 1) bUp = .9; bLast.copy(P); bStuck = 0; } if (bUp > 0) { bUp -= dt; ty = P.y + 3; }
        const fx = Math.sin(yaw), fz = Math.cos(yaw); const my = dx * fx + dz * fz, mx = -dx * fz + dz * fx;
        const vy = ty + ay * .5 - P.y; const hold = { act: actHold }; if (vy > .25) hold.jump = true; else if (vy < -.25) hold.crouch = true;
        let lk = 0; if (hd > 1.5) { const want = Math.atan2(dx, dz); let da = ((want - yaw + Math.PI) % TAU + TAU) % TAU - Math.PI; lk = -clamp(da * 4, -1, 1) * 260 * dt; }
        const pd = (.5 - pitch) * 400 * dt;
        return { move: { x: clamp(mx, -1, 1), y: clamp(my, -1, 1) }, hold, press, look: { dx: lk, dy: pd } };
      }
      return api;
    }
  });
})();

/* Prüfung: Der Krabbeltunnel (3D, Ego) – verzweigtes Kriech-Labyrinth aus Holz und Erde, Taschenlampe, virtuelle Krabbeltiere, Ekel-Meter, Ducken & Pusten */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp;
  const C = 2.6, W = 1.36, HC = 1.08, PR = .3, DX = [1, 0, -1, 0], DZ = [0, 1, 0, -1], BIT = [1, 2, 4, 8], LOOK = .0032;
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const _q = new THREE.Quaternion(), _z = new THREE.Vector3(0, 0, 1), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _mid = new THREE.Vector3(), _sc = new THREE.Vector3();
  // dünner Stab zwischen zwei Punkten (für Beine, Fühler)
  function stick(P, x1, y1, z1, x2, y2, z2, th, c) { _a.set(x1, y1, z1); _b.set(x2, y2, z2); _mid.addVectors(_a, _b).multiplyScalar(.5); _b.sub(_a); const len = _b.length(); _b.normalize(); _q.setFromUnitVectors(_z, _b); _sc.set(th, th, len); P.push({ g: E.geo.box, m: new THREE.Matrix4().compose(_mid, _q, _sc), c }); }
  // Krabbeltiere: je zwei Bewegungs-Bilder (Beine abwechselnd)
  function spiderGeo(f) {
    const P = [], M = E.mtx;
    P.push({ g: E.geo.sph, m: M(0, .1, -.08, 0, 0, 0, .11, .085, .13), c: '#2b211c', jit: .3 }, { g: E.geo.sph, m: M(0, .08, .07, 0, 0, 0, .07, .055, .07), c: '#3a2c24' }, { g: E.geo.sph, m: M(0, .17, -.09, 0, 0, 0, .05, .03, .06), c: '#8a3a1a' });
    [-.025, .025].forEach(x => P.push({ g: E.geo.sphLo, m: M(x, .1, .13, 0, 0, 0, .014), c: '#ff4a3a' }));
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const th = -.9 + i * .6 + (((i + (s > 0 ? 1 : 0) + f) % 2) ? .25 : -.25), dx = s * Math.cos(th), dz = Math.sin(th), bx = s * .04, bz = .05 - i * .03;
      stick(P, bx, .08, bz, bx + dx * .13, .17, bz + dz * .13, .02, '#241a15'); stick(P, bx + dx * .13, .17, bz + dz * .13, bx + dx * .27, 0, bz + dz * .27, .016, '#241a15');
    }
    return E.merge(P);
  }
  function roachGeo(f) {
    const P = [], M = E.mtx;
    P.push({ g: E.geo.sph, m: M(0, .05, 0, 0, 0, 0, .075, .035, .13), c: '#6b3a18', jit: .2 }, { g: E.geo.sph, m: M(0, .045, .13, 0, 0, 0, .04, .03, .035), c: '#3a2010' }, { g: E.geo.box, m: M(0, .082, -.02, 0, 0, 0, .006, .006, .2), c: '#2a1608' });
    for (const s of [-1, 1]) stick(P, s * .015, .05, .16, s * (.08 + f * .02), .09, .33, .008, '#3a2010');
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const th = -.6 + i * .6 + (((i + (s > 0 ? 1 : 0) + f) % 2) ? .3 : -.3), dx = s * Math.cos(th), dz = Math.sin(th), bx = s * .05, bz = .06 - i * .06;
      stick(P, bx, .04, bz, bx + dx * .08, .07, bz + dz * .08, .014, '#2a1608'); stick(P, bx + dx * .08, .07, bz + dz * .08, bx + dx * .15, 0, bz + dz * .15, .012, '#2a1608');
    }
    return E.merge(P);
  }
  function wormGeo(f) {
    const P = [], M = E.mtx;
    for (let i = 0; i < 8; i++) { const z = -.2 + i * .057, x = Math.sin(i * 1.0 + f * Math.PI) * .04; P.push({ g: E.geo.sph, m: M(x, .035, z, 0, 0, 0, .042, .04, .045), c: i === 7 ? '#a85a58' : i % 2 ? '#d48a86' : '#c27470' }); }
    return E.merge(P);
  }
  const wallRoll = (h, nx, nz) => -Math.sign(Math.cos(h) * nx - Math.sin(h) * nz) * Math.PI / 2;
  function arrowParts(P, x, z, dir, col, y) { // flacher Kreidepfeil auf dem Boden
    const a = Math.atan2(DX[dir], DZ[dir]), M = E.mtx, ca = Math.cos(a), sa = Math.sin(a), at = (u, v) => [x + sa * v + ca * u, z + ca * v - sa * u];
    let p = at(0, -.05); P.push({ g: E.geo.box, m: M(p[0], y, p[1], 0, a, 0, .07, .012, .42), c: col });
    for (const s of [-1, 1]) { p = at(s * .08, .12); P.push({ g: E.geo.box, m: M(p[0], y, p[1], 0, a + s * .75, 0, .07, .012, .24), c: col }); }
  }

  T.def({
    id: 'tunnel', name: 'Der Krabbeltunnel', kind: 'Ekel', stat: 'ekel', e: '🪲', mode: '3d', lock: true, fov: 72, far: 40,
    desc: 'Kriech durch ein enges, verzweigtes Tunnel-Labyrinth aus Holz und Erde. Spinnen, Kakerlaken und Würmer (virtuell, versprochen!) krabbeln über Boden, Wände und Decke. Sammle die Sterne in den Seitengängen und kriech zum Ausgang – der letzte Stern. Zu viel Gewimmel füllt das Ekel-Meter, dann gibt’s Panik.',
    how: { pc: '<b>WASD</b> kriechen · <b>Maus</b> umsehen · <b>C/Strg</b> halten = flach machen (unter Deckentieren durch) · <b>E</b> pusten (verscheucht Tiere) · Leuchtpfeile: <b>weiß</b> = Ausgang, <b>gelb</b> = Stern', touch: 'Joystick links = kriechen · rechts wischen = umsehen · <b>Ducken</b> halten = flach machen · <b>Pusten</b> verscheucht Tiere · weiße Pfeile = Ausgang, gelbe = Stern' },
    controls: { joy: true, look: true, buttons: [{ id: 'act', label: 'Pusten 💨', big: true }, { id: 'crouch', label: 'Ducken' }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short, who = ctx.who || {};
      const R = E.rand(11 + Math.floor(Math.random() * 99999));
      const NX = short ? 4 : 6, NZ = short ? 4 : 6, N = NX * NZ, limit = short ? 52 : 128 - d * 26, nStar = Math.max(1, ctx.max - 1);
      const id = (x, z) => z * NX + x, cxz = c => [c % NX, (c / NX) | 0], cen = c => [((c % NX) + .5) * C, (((c / NX) | 0) + .5) * C];
      // ---- Labyrinth (Tiefensuche + ein paar Schleifen)
      const open = new Array(N).fill(0), seen = new Array(N).fill(false), stack = [0]; seen[0] = true;
      while (stack.length) {
        const c = stack[stack.length - 1], [x, z] = cxz(c), opts = [];
        for (let k = 0; k < 4; k++) { const nx = x + DX[k], nz = z + DZ[k]; if (nx >= 0 && nz >= 0 && nx < NX && nz < NZ && !seen[id(nx, nz)]) opts.push(k); }
        if (!opts.length) { stack.pop(); continue; }
        const k = opts[Math.floor(R() * opts.length)], n = id(x + DX[k], z + DZ[k]); open[c] |= BIT[k]; open[n] |= BIT[(k + 2) % 4]; seen[n] = true; stack.push(n);
      }
      for (let i = 0, loops = short ? 1 : 3; i < 40 && loops > 0; i++) { const c = Math.floor(R() * N), k = Math.floor(R() * 4), [x, z] = cxz(c), nx = x + DX[k], nz = z + DZ[k]; if (nx < 0 || nz < 0 || nx >= NX || nz >= NZ || (open[c] & BIT[k]) || c === 0) continue; const n = id(nx, nz); if (popc(open[c]) < 2 || popc(open[n]) < 2) continue; open[c] |= BIT[k]; open[n] |= BIT[(k + 2) % 4]; loops--; }
      function popc(m) { return (m & 1) + (m >> 1 & 1) + (m >> 2 & 1) + (m >> 3 & 1); }
      function bfs(from) { const dist = new Array(N).fill(-1), prev = new Array(N).fill(-1), q = [from]; dist[from] = 0; for (let h = 0; h < q.length; h++) { const c = q[h], [x, z] = cxz(c); for (let k = 0; k < 4; k++) if (open[c] & BIT[k]) { const n = id(x + DX[k], z + DZ[k]); if (dist[n] < 0) { dist[n] = dist[c] + 1; prev[n] = c; q.push(n); } } } return { dist, prev }; }
      const pathTo = (b, to) => { const p = []; for (let c = to; c >= 0; c = b.prev[c]) p.unshift(c); return p; };
      const dirTo = (a, b) => { const [ax, az] = cxz(a), [bx, bz] = cxz(b); for (let k = 0; k < 4; k++) if (ax + DX[k] === bx && az + DZ[k] === bz) return k; return 0; };
      const b0 = bfs(0); let exitC = 0; for (let c = 0; c < N; c++) if (popc(open[c]) < 4 && b0.dist[c] > b0.dist[exitC]) exitC = c;
      const main = pathTo(b0, exitC), onMain = new Set(main);
      let exitDir = 0; { const back = dirTo(exitC, main[main.length - 2]); let best = -1; for (let k = 0; k < 4; k++) if (!(open[exitC] & BIT[k])) { const sc = k === (back + 2) % 4 ? 2 : 1; if (sc > best) { best = sc; exitDir = k; } } }
      // Sterne: Sackgassen nahe am Hauptweg, über die Strecke verteilt
      const mb = (() => { const dist = new Array(N).fill(-1), att = new Array(N).fill(-1), q = []; main.forEach((c, i) => { dist[c] = 0; att[c] = i; q.push(c); }); for (let h = 0; h < q.length; h++) { const c = q[h], [x, z] = cxz(c); for (let k = 0; k < 4; k++) if (open[c] & BIT[k]) { const n = id(x + DX[k], z + DZ[k]); if (dist[n] < 0) { dist[n] = dist[c] + 1; att[n] = att[c]; q.push(n); } } } return { dist, att }; })();
      let cand = []; for (let c = 1; c < N; c++) if (c !== exitC && !onMain.has(c)) cand.push(c);
      cand.sort((a, b) => ((popc(open[a]) === 1 ? 0 : 3) + Math.min(mb.dist[a], 4)) - ((popc(open[b]) === 1 ? 0 : 3) + Math.min(mb.dist[b], 4)));
      const starCells = [];
      for (const c of cand) { if (starCells.length >= nStar) break; if (starCells.some(s => Math.abs(mb.att[s] - mb.att[c]) < 2 && mb.dist[c] > 0)) continue; starCells.push(c); }
      for (const c of cand) { if (starCells.length >= nStar) break; if (!starCells.includes(c)) starCells.push(c); }
      for (let i = 2; starCells.length < nStar && i < main.length - 1; i += 2) starCells.push(main[i]);
      // Gewimmel-Zonen auf dem Hauptweg
      const swarmCells = []; const nSw = short ? 1 : 2; for (let i = 0; i < nSw; i++) { const c = main[clamp(Math.round(main.length * (i + 1) / (nSw + 1)), 2, main.length - 2)]; if (c !== exitC && !swarmCells.includes(c)) swarmCells.push(c); }

      // ---- Atmosphäre & Licht (eine Halbkugel + Taschenlampe)
      S.background = new THREE.Color(0x050302); S.fog = new THREE.Fog(0x050302, 1.5, 11);
      S.add(new THREE.HemisphereLight(0x7a6650, 0x1a1009, .24));
      const lamp = new THREE.SpotLight(0xffeec4, 1.7, 12, .6, .55, 1.6); lamp.position.set(.16, -.12, 0); cam.add(lamp); lamp.target.position.set(.05, -.25, -3); cam.add(lamp.target);
      cam.rotation.order = 'YXZ'; S.add(cam);
      const mat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 6, specular: 0x151008 });
      // ---- Tunnelbau (alles in eine Geometrie)
      const P = [], M = E.mtx, earth = ['#4b3423', '#553b27', '#433021'], wood = ['#6e4a2a', '#7a5532', '#5e3f22'], a = (C - W) / 2;
      const wallPlate = (x, z, alongX, len, c) => { P.push({ g: E.geo.box, m: M(x, HC / 2, z, 0, 0, 0, alongX ? len : .08, HC, alongX ? .08 : len), c: earth[c % 3], jit: .35 }); };
      const planks = (x, z, alongX, len, inX, inZ, c) => { for (const y of [.28, .78]) P.push({ g: E.geo.box, m: M(x + inX * .05, y + (c % 2) * .05, z + inZ * .05, 0, 0, 0, alongX ? len * .96 : .04, .16, alongX ? .04 : len * .96), c: wood[(c + y * 10 | 0) % 3], jit: .25 }); };
      for (let c = 0; c < N; c++) {
        const [x, z] = cen(c), o = open[c];
        P.push({ g: E.geo.box, m: M(x, -.05, z, 0, 0, 0, W, .1, W), c: earth[c % 3], jit: .3 }, { g: E.geo.box, m: M(x, HC + .05, z, 0, 0, 0, W, .1, W), c: wood[c % 3], jit: .3 });
        for (let k = 0; k < 4; k++) {
          if (o & BIT[k]) {
            const ax = x + DX[k] * (W / 2 + a / 2), az = z + DZ[k] * (W / 2 + a / 2), alongX = DX[k] !== 0;
            P.push({ g: E.geo.box, m: M(ax, -.05, az, 0, 0, 0, alongX ? a + .02 : W, .1, alongX ? W : a + .02), c: earth[(c + k) % 3], jit: .3 }, { g: E.geo.box, m: M(ax, HC + .05, az, 0, 0, 0, alongX ? a + .02 : W, .1, alongX ? W : a + .02), c: wood[(c + k) % 3], jit: .3 });
            for (const s of [-1, 1]) { const wx = alongX ? ax : x + s * W / 2, wz = alongX ? z + s * W / 2 : az; wallPlate(wx, wz, alongX, a + .02, c + k); }
            if (k < 2) { // Holzrahmen an der Zellgrenze
              const fx = x + DX[k] * C / 2, fz = z + DZ[k] * C / 2;
              for (const s of [-1, 1]) P.push({ g: E.geo.box, m: M(fx + (alongX ? 0 : s * (W / 2 - .06)), HC / 2, fz + (alongX ? s * (W / 2 - .06) : 0), 0, 0, 0, .13, HC, .13), c: '#5a3a1e', jit: .2 });
              P.push({ g: E.geo.box, m: M(fx, HC - .06, fz, 0, 0, 0, alongX ? .14 : W, .13, alongX ? W : .14), c: '#64421f', jit: .2 });
            }
          } else {
            const wx = x + DX[k] * W / 2, wz = z + DZ[k] * W / 2, alongX = DX[k] === 0; wallPlate(wx, wz, alongX, W + .08, c + k); planks(wx, wz, alongX, W, -DX[k], -DZ[k], c + k);
          }
        }
        // Wurzeln, Steine
        for (let i = 0; i < 2; i++) if (R() < .6) P.push({ g: E.geo.cone, m: M(x + (R() - .5) * W * .8, HC - .12, z + (R() - .5) * W * .8, Math.PI, 0, (R() - .5) * .4, .03, .25 + R() * .2, .03), c: '#3a2614' });
        for (let k = 0; k < 4; k++) if (!(o & BIT[k]) && R() < .55) P.push({ g: E.geo.dodec, m: M(x + DX[k] * W / 2 + (DX[k] ? 0 : (R() - .5) * W * .7), .15 + R() * .7, z + DZ[k] * W / 2 + (DZ[k] ? 0 : (R() - .5) * W * .7), R(), R(), R(), .1 + R() * .08), c: R() < .5 ? '#5d5a52' : '#3a2614', jit: .3 });
        if (R() < .5) P.push({ g: E.geo.dodec, m: M(x + (R() - .5) * W * .7, .02, z + (R() - .5) * W * .7, R(), R(), R(), .08 + R() * .06), c: '#5d5a52', jit: .3 });
      }
      // Ausgang: Lichtöffnung in der Endwand
      const [exX, exZ] = cen(exitC);
      for (const s of [-1, 1]) { const alongX = DX[exitDir] === 0; P.push({ g: E.geo.box, m: M(exX + DX[exitDir] * (W / 2 - .06) + (alongX ? s * W * .42 : 0), HC / 2, exZ + DZ[exitDir] * (W / 2 - .06) + (alongX ? 0 : s * W * .42), 0, 0, 0, .14, HC, .14), c: '#8a6a3a' }); }
      const tun = new THREE.Mesh(E.merge(P), mat); S.add(tun);
      const exitPlane = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ color: 0xfff1c4, fog: false })); exitPlane.position.set(exX + DX[exitDir] * (W / 2 - .1), HC * .48, exZ + DZ[exitDir] * (W / 2 - .1)); exitPlane.rotation.y = Math.atan2(-DX[exitDir], -DZ[exitDir]); exitPlane.scale.set(W * .7, HC * .8, 1); S.add(exitPlane);
      const sign = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ map: E.canvasTex('tunnelExit', 128, 48, (c, w, h) => { c.fillStyle = '#3a2410'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe9a8'; c.font = '900 26px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('AUSGANG', w / 2, h / 2 + 1); }), transparent: false }));
      sign.position.copy(exitPlane.position); sign.position.y = HC - .12; sign.position.x -= DX[exitDir] * .03; sign.position.z -= DZ[exitDir] * .03; sign.rotation.y = exitPlane.rotation.y; sign.scale.set(.6, .22, 1); S.add(sign);
      // ---- Leuchtkreide-Pfeile: weiß = Ausgang, gelb = Stern
      const AP = [], arrowKey = new Set();
      const addArrow = (c, k, col) => { const key = c + ':' + k; if (arrowKey.has(key)) return; arrowKey.add(key); const [x, z] = cen(c); arrowParts(AP, x + DX[k] * .42, z + DZ[k] * .42, k, col, .012); };
      main.forEach((c, i) => { if (i < main.length - 1 && (popc(open[c]) >= 3 || i === 0 || i % 2 === 0)) addArrow(c, dirTo(c, main[i + 1]), '#e8e2cf'); });
      starCells.forEach(sc => { if (onMain.has(sc)) return; const att = main[mb.att[sc]], p = pathTo(bfs(att), sc); p.forEach((c, i) => { if (i < p.length - 1 && (popc(open[c]) >= 3 || i === 0)) addArrow(c, dirTo(c, p[i + 1]), '#ffc928'); }); });
      if (AP.length) S.add(new THREE.Mesh(E.merge(AP), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .62, depthWrite: false })));
      // ---- Sterne & Ausgangsstern
      const glowMat = col => new THREE.SpriteMaterial({ map: E.glowTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const stars = starCells.map(c => {
        const [x, z] = cen(c), o = open[c]; let ox = 0, oz = 0; if (popc(o) === 1) { const k = [0, 1, 2, 3].find(k => o & BIT[k]); ox = -DX[k] * .38; oz = -DZ[k] * .38; }
        const m = T.make.starMesh(); m.scale.setScalar(.7); m.position.set(x + ox, .5, z + oz); S.add(m); const g = new THREE.Sprite(glowMat(0xffc928)); g.scale.setScalar(.9); g.position.copy(m.position); S.add(g); return { c, m, g, x: x + ox, z: z + oz, got: false };
      });
      const exitStar = T.make.starMesh(); const exPos = [exX + DX[exitDir] * (W / 2 - .38), exZ + DZ[exitDir] * (W / 2 - .38)]; exitStar.position.set(exPos[0], .55, exPos[1]); exitStar.scale.setScalar(.85); S.add(exitStar);
      const exitGlow = new THREE.Sprite(glowMat(0xfff0b0)); exitGlow.scale.setScalar(1.6); exitGlow.position.set(exX + DX[exitDir] * (W / 2 - .2), .6, exZ + DZ[exitDir] * (W / 2 - .2)); S.add(exitGlow);
      // ---- Krabbeltiere
      const geos = { spider: [spiderGeo(0), spiderGeo(1)], roach: [roachGeo(0), roachGeo(1)], worm: [wormGeo(0), wormGeo(1)] };
      const cmat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 40, specular: 0x332211 });
      const crit = [], nCrit = Math.round((short ? 7 : 13) + d * (short ? 6 : 12)), startB = bfs(0);
      let pCell = 0, pDist = bfs(0).dist;
      for (let i = 0; i < nCrit; i++) {
        let c = 0; for (let t = 0; t < 30 && (startB.dist[c] < 2 || c === exitC); t++) c = Math.floor(R() * N);
        const r = R(), kind = r < .4 ? 'spider' : r < .75 ? 'roach' : 'worm', r2 = R(), surf = kind === 'worm' ? (r2 < .55 ? 0 : 1) : r2 < .42 ? 0 : r2 < .78 ? 1 : 2;
        const m = new THREE.Mesh(geos[kind][0], cmat); m.rotation.order = 'YXZ'; m.scale.setScalar(kind === 'spider' ? 1.45 : kind === 'roach' ? 1.4 : 1.5); S.add(m);
        const [x, z] = cen(c); crit.push({ m, kind, surf, side: R() < .5 ? -1 : 1, lat: (R() - .5) * .6, a: c, b: c, u: 1, prev: -1, sp: (.45 + R() * .45) * (.75 + d * .6), x, y: 0, z, ox: 0, oz: 0, h: R() * 6, flee: 0, cool: 0, fr: R(), f: 0 });
      }
      // Gewimmel: viele kleine Kakerlaken je Zone (InstancedMesh)
      const swarms = swarmCells.map(c => {
        const n = Math.round(26 + d * 26), im = new THREE.InstancedMesh(geos.roach[0], cmat, n); S.add(im);
        const closed = [0, 1, 2, 3].filter(k => !(open[c] & BIT[k])), parts = [];
        for (let i = 0; i < n; i++) { const k = closed[Math.floor(R() * closed.length)], r = R(); parts.push({ s: r < .45 || k == null ? 0 : r < .7 ? 1 : 2, k, p: R() * 6, q: R() * 6, f1: .4 + R() * .7, f2: .3 + R() * .6, sc: .6 + R() * .4 }); }
        const [x, z] = cen(c); return { c, x, z, im, parts, scat: 0 };
      });
      const dm = new THREE.Object3D(); dm.rotation.order = 'YXZ';
      // Puste-Wölkchen
      const puffs = []; for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xd8f0ff, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; S.add(s); puffs.push({ s, t: 0, vx: 0, vz: 0 }); }
      // ---- Hände & Taschenlampe (Ego-Sicht)
      const skin = who.skin || '#e8b98f', sleeve = who.top || '#2a9d8f';
      const handGeo = (lampOn) => { const Q = []; Q.push({ g: E.geo.box, m: M(0, 0, 0, 0, 0, 0, .085, .035, .1), c: skin }, { g: E.geo.cyl, m: M(0, -.005, .11, Math.PI / 2, 0, 0, .05, .14, .04), c: sleeve }); for (let i = 0; i < 4; i++) Q.push({ g: E.geo.box, m: M(-.03 + i * .02, -.006, -.07, .2, 0, 0, .016, .018, .055), c: skin }); Q.push({ g: E.geo.box, m: M(-.05, -.003, -.02, 0, -.6, 0, .018, .018, .05), c: skin }); if (lampOn) { Q.push({ g: E.geo.cyl, m: M(.01, .03, -.04, Math.PI / 2, 0, 0, .022, .16, .022), c: '#2b3a44' }, { g: E.geo.cyl, m: M(.01, .03, -.125, Math.PI / 2, 0, 0, .028, .02, .028), c: '#fff6c8' }); } return E.merge(Q); };
      const hmat = new THREE.MeshLambertMaterial({ vertexColors: true, depthTest: false, depthWrite: false });
      const handL = new THREE.Mesh(handGeo(false), hmat), handR = new THREE.Mesh(handGeo(true), hmat); handL.renderOrder = handR.renderOrder = 999; handL.scale.setScalar(.72); handR.scale.setScalar(.72); handL.frustumCulled = handR.frustumCulled = false;
      cam.add(handL); cam.add(handR);
      // ---- Minikarte & Ekel-Schleier (DOM)
      const box = document.getElementById('trial') || document.body;
      const mm = document.createElement('canvas'), MS = 13; mm.width = NX * MS + 8; mm.height = NZ * MS + 8; mm.style.cssText = 'position:fixed;right:calc(8px + env(safe-area-inset-right,0px));top:calc(98px + env(safe-area-inset-top,0px));border-radius:10px;background:rgba(10,6,3,.6);border:1px solid rgba(255,220,160,.25);pointer-events:none;z-index:1'; box.appendChild(mm);
      const veil = document.createElement('div'); veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(90,160,40,.7) 100%)'; box.appendChild(veil);
      const hudEl = document.getElementById('thud'), placeMap = () => { if (hudEl) mm.style.top = Math.round(hudEl.getBoundingClientRect().bottom + 6) + 'px'; };
      const mc = mm.getContext('2d'), known = new Array(N).fill(false);

      // ---- Zustand
      let [px, pz] = cen(0); { const k = dirTo(0, main[1] == null ? 0 : main[1]); var yaw = Math.atan2(-DX[k], -DZ[k]); }
      let pitch = -.05, tt = 0, got = 0, ekel = 0, panic = 0, blowCd = 0, contacts = 0, panics = 0, ph = 0, crouchK = 0, finished = false, jolt = 0, mmT = 0, swarmT = 0, hintT = 0, moved = 0;
      const blowMax = 3.2 + d * 1.2;
      const fwd = () => [-Math.sin(yaw), -Math.cos(yaw)];
      function walkable(x, z) {
        const cx = Math.floor(x / C), cz = Math.floor(z / C); if (cx < 0 || cz < 0 || cx >= NX || cz >= NZ) return false;
        const o = open[id(cx, cz)], lx = x - (cx + .5) * C, lz = z - (cz + .5) * C, h = W / 2 - PR;
        if (Math.abs(lx) <= h && Math.abs(lz) <= h) return true;
        if (Math.abs(lz) <= h && ((lx > 0 && o & 1) || (lx < 0 && o & 4))) return true;
        if (Math.abs(lx) <= h && ((lz > 0 && o & 2) || (lz < 0 && o & 8))) return true;
        return false;
      }
      const cellOf = (x, z) => id(clamp(Math.floor(x / C), 0, NX - 1), clamp(Math.floor(z / C), 0, NZ - 1));
      function critStep(cr, dt) {
        cr.flee = Math.max(0, cr.flee - dt); cr.cool = Math.max(0, cr.cool - dt);
        cr.u += cr.sp * (cr.flee > 0 ? 2.6 : 1) * dt / C;
        if (cr.u >= 1) {
          cr.u = 0; cr.prev = cr.a; cr.a = cr.b; const [x, z] = cxz(cr.a), nb = [];
          for (let k = 0; k < 4; k++) if (open[cr.a] & BIT[k]) { const n = id(x + DX[k], z + DZ[k]); if (n !== 0 && n !== exitC) nb.push(n); }
          let choice = nb.filter(n => n !== cr.prev); if (!choice.length) choice = nb.length ? nb : [cr.a];
          const near = pDist[cr.a] >= 0 && pDist[cr.a] <= 4;
          if (cr.flee > 0) { choice.sort((p, q) => pDist[q] - pDist[p]); cr.b = choice[0]; }
          else if (near && R() < .55 + d * .3) { choice.sort((p, q) => pDist[p] - pDist[q]); cr.b = choice[0]; }
          else cr.b = choice[Math.floor(R() * choice.length)];
        }
        const [ax, az] = cen(cr.a), [bx, bz] = cen(cr.b); let hx = bx - ax, hz = bz - az; const hl = Math.hypot(hx, hz);
        if (hl > 0) { hx /= hl; hz /= hl; cr.h = E.angLerp(cr.h, Math.atan2(hx, hz), Math.min(1, dt * 8)); }
        const ca = Math.cos(cr.h), sa = Math.sin(cr.h), lat = cr.surf === 2 ? cr.side * (W / 2 - .04) : cr.lat;
        const tx = ca * lat, tz = -sa * lat; cr.ox += (tx - cr.ox) * Math.min(1, dt * 5); cr.oz += (tz - cr.oz) * Math.min(1, dt * 5);
        cr.x = ax + (bx - ax) * cr.u + cr.ox; cr.z = az + (bz - az) * cr.u + cr.oz; cr.y = cr.surf === 0 ? .01 : cr.surf === 1 ? HC - .01 : .5 + Math.sin(cr.fr * 9) * .12;
        cr.m.position.set(cr.x, cr.y, cr.z); cr.m.rotation.set(0, cr.h, cr.surf === 1 ? Math.PI : cr.surf === 2 ? cr.side * Math.PI / 2 : 0);
        cr.fr += dt * cr.sp * (cr.flee > 0 ? 2.6 : 1) * 9; const f = (cr.fr | 0) % 2; if (f !== cr.f) { cr.f = f; cr.m.geometry = geos[cr.kind][f]; }
      }
      function swarmStep(sw, dt, t) {
        sw.scat = Math.max(0, sw.scat - dt); const spread = sw.scat > 0 ? 1.25 : 1;
        sw.parts.forEach((p, i) => {
          const u = Math.sin(t * p.f1 + p.p), v = Math.cos(t * p.f2 + p.q); let x, y, z, rx = 0, rz = 0, h = Math.atan2(Math.cos(t * p.f1 + p.p) * p.f1, -Math.sin(t * p.f2 + p.q) * p.f2);
          if (p.s === 2) { // Wand (nur geschlossene Seiten)
            const along = clamp(u * .9 * spread, -W / 2 + .06, W / 2 - .06), nx = -DX[p.k], nz = -DZ[p.k];
            x = sw.x + DX[p.k] * (W / 2 - .03) + (DX[p.k] === 0 ? along : 0); z = sw.z + DZ[p.k] * (W / 2 - .03) + (DZ[p.k] === 0 ? along : 0); y = .55 + v * .4;
            const up = Math.cos(t * p.f1 + p.p) > 0 ? 1 : -1; h = DX[p.k] === 0 ? up * Math.PI / 2 : (up > 0 ? 0 : Math.PI); rz = wallRoll(h, nx, nz);
          } else { const r = sw.scat > 0 ? .62 : .55; x = sw.x + u * r * spread; z = sw.z + v * r * spread; y = p.s === 0 ? .01 : HC - .01; rz = p.s === 1 ? Math.PI : 0; }
          dm.position.set(x, y, z); dm.rotation.set(0, h, rz); dm.scale.setScalar(p.sc); dm.updateMatrix(); sw.im.setMatrixAt(i, dm.matrix);
        });
        sw.im.instanceMatrix.needsUpdate = true;
      }
      function animate(dt) {
        crit.forEach(c => critStep(c, dt)); swarms.forEach(s => swarmStep(s, dt, tt + ctx.t));
        const spin = dt * 2; stars.forEach(s => { s.m.rotation.y += spin; s.m.position.y = .5 + Math.sin((tt + s.c) * 2) * .05; }); exitStar.rotation.y += spin;
        exitGlow.material.opacity = .7 + Math.sin(tt * 3) * .2;
        puffs.forEach(p => { if (p.t <= 0) { p.s.visible = false; return; } p.t -= dt; p.s.position.x += p.vx * dt; p.s.position.z += p.vz * dt; p.s.material.opacity = clamp(p.t, 0, .6) * .35; p.s.scale.setScalar(.15 + (1 - p.t) * .7); p.s.visible = p.t > 0; });
      }
      function placeCam(dt) {
        crouchK += ((I.down('crouch') ? 1 : 0) - crouchK) * Math.min(1, dt * 10);
        const eye = .56 - crouchK * .27 + Math.sin(ph * 2) * .025 * Math.min(1, moved * 3), sh = panic > 0 ? .05 : jolt * .1;
        cam.position.set(px + (Math.random() - .5) * sh, eye + (Math.random() - .5) * sh, pz + (Math.random() - .5) * sh);
        cam.rotation.set(pitch - jolt * .25, yaw + (panic > 0 ? Math.sin(tt * 30) * .04 : 0), Math.sin(ph) * .02 * Math.min(1, moved * 3));
        const k = Math.min(1, moved * 3), s1 = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
        const hx = clamp(cam.aspect / 1.5, .6, 1); handL.position.set(-.16 * hx, -.22 - crouchK * .03 + Math.max(0, Math.cos(ph)) * .03 * k, -.42 + s1 * .05 * k); handL.rotation.set(-.25, .2, .15);
        handR.position.set(.15 * hx, -.2 - crouchK * .03 + Math.max(0, Math.cos(ph + Math.PI)) * .03 * k, -.4 + s2 * .05 * k); handR.rotation.set(-.1, -.12, -.12);
      }
      function drawMap() {
        const pc = cellOf(px, pz); known[pc] = true; const [x0, z0] = cxz(pc); for (let k = 0; k < 4; k++) if (open[pc] & BIT[k]) known[id(x0 + DX[k], z0 + DZ[k])] = true;
        mc.clearRect(0, 0, mm.width, mm.height); const o = 4;
        for (let c = 0; c < N; c++) {
          if (!known[c]) continue; const [x, z] = cxz(c), X = o + x * MS, Z = o + z * MS; mc.fillStyle = '#8a6a44'; mc.fillRect(X + 3, Z + 3, MS - 6, MS - 6);
          if (open[c] & 1) mc.fillRect(X + MS - 3, Z + 3, 3, MS - 6); if (open[c] & 4) mc.fillRect(X, Z + 3, 3, MS - 6); if (open[c] & 2) mc.fillRect(X + 3, Z + MS - 3, MS - 6, 3); if (open[c] & 8) mc.fillRect(X + 3, Z, MS - 6, 3);
          if (swarmCells.includes(c)) { mc.fillStyle = '#9dff5c'; mc.fillRect(X + 5, Z + 5, MS - 10, MS - 10); }
        }
        stars.forEach(s => { if (!s.got && known[s.c]) { const [x, z] = cxz(s.c); mc.fillStyle = '#ffc928'; mc.beginPath(); mc.arc(o + x * MS + MS / 2, o + z * MS + MS / 2, 3, 0, 7); mc.fill(); } });
        if (known[exitC]) { const [x, z] = cxz(exitC); mc.fillStyle = '#fff1c4'; mc.fillRect(o + x * MS + 3, o + z * MS + 3, MS - 6, MS - 6); }
        const X = o + px / C * MS, Z = o + pz / C * MS, f = fwd(); mc.fillStyle = '#ff6b4a'; mc.beginPath(); mc.moveTo(X + f[0] * 6, Z + f[1] * 6); mc.lineTo(X - f[1] * 3.5 - f[0] * 2, Z + f[0] * 3.5 - f[1] * 2); mc.lineTo(X + f[1] * 3.5 - f[0] * 2, Z - f[0] * 3.5 - f[1] * 2); mc.fill();
      }
      function blow() {
        if (blowCd > 0) return; blowCd = blowMax; ctx.S.splash(); const f = fwd(); let n = 0;
        crit.forEach(c => { const dx = c.x - px, dz = c.z - pz, dl = Math.hypot(dx, dz); if (dl < 3.4 && (dx * f[0] + dz * f[1]) / (dl || 1) > .35) { c.flee = 3.5; n++; const ca = cellOf(c.x, c.z); if (pDist[c.b] < pDist[c.a] || c.b === pCell) { const t = c.a; c.a = c.b; c.b = t; c.u = 1 - c.u; } if (c.a !== ca && c.b !== ca) { c.a = ca; c.b = ca; c.u = 1; } } });
        swarms.forEach(s => { const dx = s.x - px, dz = s.z - pz, dl = Math.hypot(dx, dz); if (dl < 3.6 && ((dx * f[0] + dz * f[1]) / (dl || 1) > .3 || dl < 1)) { s.scat = 4.5; n++; } });
        puffs.forEach((p, i) => { p.t = 1; p.s.visible = true; p.s.position.set(px + f[0] * .3, cam.position.y - .05 + (i % 3 - 1) * .06, pz + f[1] * .3); const sp = 2.2 + i * .35, sd = (i - 2.5) * .12; p.vx = (f[0] * Math.cos(sd) - f[1] * Math.sin(sd)) * sp; p.vz = (f[1] * Math.cos(sd) + f[0] * Math.sin(sd)) * sp; });
        if (n) ctx.hud.toast('💨 Husch, husch!', 'good');
      }
      function addEkel(v, msg) { ekel = Math.min(1, ekel + v); if (msg) { ctx.hud.toast(msg, 'bad'); ctx.S.gag(); } if (ekel >= 1 && panic <= 0) { panic = 2.4; panics++; tt += 4; ekel = .999; ctx.hud.toast('😱 PANIK! Kurz durchatmen …', 'bad'); ctx.S.bad(); } }
      animate(0); placeCam(0); drawMap(); placeMap();
      ctx.hud.hint('Leuchtpfeile: weiß = Ausgang, gelb = Stern');
      ctx.hud.meter('ekel', 0, 'Ekel', '#9dff5c'); ctx.hud.meter('puste', 1, 'Puste', '#37d6e8');
      const api = {
        idle(dt) { animate(dt); placeCam(dt); },
        update(dt) {
          tt += dt; const look = I.consumeLook();
          if (finished) { animate(dt); placeCam(dt); return; }
          const left = Math.max(0, limit - tt); ctx.hud.time(left, left / limit); if (left <= 0) { finished = true; ctx.finish(got, 'time'); return; }
          // Blick
          yaw -= look.dx * LOOK; pitch = clamp(pitch - look.dy * LOOK * .8, -.65, .55);
          if (panic > 0) { panic -= dt; yaw += Math.sin(tt * 13) * dt * 1.2; if (panic <= 0) { ekel = .45; ctx.hud.toast('Puh … weiter geht’s.'); } }
          // Kriechen
          const mv = I.move, crouch = I.down('crouch'), sp = (crouch ? 1.05 : 1.75) * (panic > 0 ? .35 : 1), f = fwd(), rx = Math.cos(yaw), rz = -Math.sin(yaw);
          let vx = (f[0] * mv.y + rx * mv.x * .8) * sp, vz = (f[1] * mv.y + rz * mv.x * .8) * sp;
          if (panic > 0) { vx += (Math.random() - .5) * 1.5; vz += (Math.random() - .5) * 1.5; }
          const ox = px, oz = pz; if (walkable(px + vx * dt, pz)) px += vx * dt; if (walkable(px, pz + vz * dt)) pz += vz * dt;
          const dist = Math.hypot(px - ox, pz - oz); moved += ((dist > .001 ? 1 : 0) - moved) * Math.min(1, dt * 6); ph += dist * 4.2;
          if (dist > .001 && Math.floor((ph - dist * 4.2) / Math.PI) !== Math.floor(ph / Math.PI) && Math.random() < .5) ctx.S.pad(1);
          const pc = cellOf(px, pz); if (pc !== pCell) { pCell = pc; pDist = bfs(pc).dist; }
          // Pusten
          blowCd = Math.max(0, blowCd - dt); if (I.pressed('act')) blow();
          // Tiere
          animate(dt);
          crit.forEach(c => {
            if (c.flee > 0 || c.cool > 0) return; const dl = Math.hypot(c.x - px, c.z - pz); if (dl > .5) return;
            if (c.surf === 1 && crouch) return; if (c.surf === 2 && dl > .42) return;
            c.cool = 2; c.flee = 2.5; contacts++; jolt = 1;
            const msg = c.kind === 'spider' ? (c.surf === 1 ? 'Iiih! Spinne im Haar! 🕷' : 'Iiih! Spinne an der Hand! 🕷') : c.kind === 'roach' ? 'Bäh! Kakerlake! 🪳' : 'Glitsch! Ein Wurm! 🪱';
            addEkel(.2 + d * .12, msg);
          });
          jolt = Math.max(0, jolt - dt * 3);
          let inSwarm = false; swarms.forEach(s => { if (s.scat <= 0 && Math.abs(px - s.x) < C * .5 && Math.abs(pz - s.z) < C * .5) inSwarm = true; });
          if (inSwarm) { addEkel(dt * (.16 + d * .14)); swarmT += dt; if (swarmT > .9) { swarmT = 0; ctx.S.pad(2); } if (hintT <= 0) { hintT = 4; ctx.hud.toast('🪳 Gewimmel! Pusten oder schnell durch!', 'bad'); } }
          else if (panic <= 0) ekel = Math.max(0, ekel - dt * .045);
          hintT = Math.max(0, hintT - dt);
          // Sterne & Ausgang
          stars.forEach(s => { if (s.got || Math.hypot(s.x - px, s.z - pz) > .6) return; s.got = true; s.m.visible = false; s.g.visible = false; got++; ctx.hud.stars(got); ctx.hud.toast('★ Stern aus der Nische!', 'good'); });
          if (Math.hypot(exPos[0] - px, exPos[1] - pz) < .65) { finished = true; got++; exitStar.visible = false; ctx.hud.stars(got); ctx.hud.toast('☀ Frische Luft!', 'good'); ctx.finish(got, 'done'); return; }
          placeCam(dt);
          mmT -= dt; if (mmT <= 0) { mmT = .15; drawMap(); placeMap(); }
          veil.style.opacity = (ekel * .38 + (panic > 0 ? .3 : 0)).toFixed(2);
          ctx.hud.meter('ekel', ekel, panic > 0 ? '😱 PANIK' : ekel > .7 ? '⚠ Ekel' : 'Ekel', ekel > .7 ? '#ff6b4a' : ekel > .4 ? '#ffcf4a' : '#9dff5c');
          ctx.hud.meter('puste', 1 - blowCd / blowMax, blowCd > 0 ? 'Puste …' : 'Puste bereit', blowCd > 0 ? '#5a8fa0' : '#37d6e8');
          I.setButton && I.setButton('act', blowCd > 0 ? '💨 ' + Math.ceil(blowCd) : 'Pusten 💨');
        },
        dispose() { mm.remove(); veil.remove(); },
        debug: () => ({ cell: pCell, px: +px.toFixed(2), pz: +pz.toFixed(2), got, ekel: +ekel.toFixed(2), contacts, panics, t: +tt.toFixed(1), main: main.length, exitC, stars: stars.map(s => s.c + (s.got ? '✓' : '')) }),
        details: () => ({ kontakte: contacts, panik: panics }),
        bot(dt) { // Testpilot: BFS über das Zellgitter, dreht per Maus, kriecht vorwärts, duckt sich, pustet
          const cur = cellOf(px, pz), bf = bfs(cur), left = limit - tt, cps = C / 1.45;
          const toExit = c => bfs(c).dist[exitC];
          let goal = exitC, gx = exPos[0], gz = exPos[1], best = 1e9;
          stars.forEach(s => { if (s.got) return; const dd = bf.dist[s.c], cost = (dd + toExit(s.c)) * cps + 6; if (cost < left - 4 && dd < best) { best = dd; goal = s.c; gx = s.x; gz = s.z; } });
          const path = pathTo(bf, goal); let tx = gx, tz = gz;
          if (path.length > 1) {
            const nx = path[1], k = dirTo(cur, nx), [cx0, cz0] = cen(cur), offL = DX[k] !== 0 ? pz - cz0 : px - cx0, offA = DX[k] !== 0 ? (px - cx0) * DX[k] : (pz - cz0) * DZ[k];
            if (Math.abs(offL) > .22 && offA < .1) { tx = cx0 + (DX[k] !== 0 ? 0 : 0); tz = cz0; [tx, tz] = DX[k] !== 0 ? [px + DX[k] * .3, cz0] : [cx0, pz + DZ[k] * .3]; }
            else { const nn = cen(nx); tx = nn[0]; tz = nn[1]; if (path.length > 2 && dirTo(nx, path[2]) === k) { const n2 = cen(path[2]); tx = n2[0]; tz = n2[1]; } }
          }
          const dx = tx - px, dz = tz - pz, dl = Math.hypot(dx, dz) || 1, want = Math.atan2(-dx, -dz), diff = wrap(want - yaw);
          const f = fwd(), rx = Math.cos(yaw), rz = -Math.sin(yaw), ux = dx / dl, uz = dz / dl;
          let my = ux * f[0] + uz * f[1], mx = ux * rx + uz * rz; if (Math.abs(diff) > 1.2) { my *= .2; mx *= .2; }
          const out = { move: { x: clamp(mx * 1.6, -1, 1), y: clamp(my * 1.4, -1, 1) }, look: { dx: clamp(-diff / LOOK * Math.min(1, dt * 7), -60, 60), dy: (-.05 - pitch) / LOOK * .1 }, hold: {}, press: [] };
          let duck = false, threat = false;
          crit.forEach(c => { if (c.flee > 0) return; const ex = c.x - px, ez = c.z - pz, el = Math.hypot(ex, ez); if (el > 2.6) return; const ahead = (ex * f[0] + ez * f[1]) / (el || 1); if (c.surf === 1 && el < 1.5) duck = true; else if (c.surf !== 1 && ahead > .4 && el < 2.4) threat = true; if (c.surf !== 1 && el < .9) threat = true; });
          swarms.forEach(s => { if (s.scat > 0) return; const el = Math.hypot(s.x - px, s.z - pz); if (el < 3.2) threat = true; });
          if (duck) out.hold.crouch = true; if (threat && blowCd <= 0) out.press.push('act');
          return out;
        }
      };
      return api;
    }
  });
})();

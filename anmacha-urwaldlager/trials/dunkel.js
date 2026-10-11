/* Prüfung: Die Dunkelkammer (3D, Ego) – stockdunkle Hütte mit mehreren Räumen, Taschenlampe mit Batterie, Geräusche mit Richtung, Behälter ertasten, Schreck-Requisiten */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp;
  const RS = 5.2, WT = .2, WH = 2.5, DW = 1.25, PR = .3, EYE = 1.55, LOOK = .0032, G = .35;
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const KINDS = { kiste: { w: .8, d: .6, h: .6 }, korb: { w: .7, d: .7, h: .55 }, topf: { w: .6, d: .6, h: .7 }, loch: { w: .55, d: .1, h: .45 } };
  const PROPS = [
    { n: 'snake', t: '🐍 Gummischlange! (nur Gummi …)' }, { n: 'bat', t: '🦇 Plüsch-Fledermaus! Flatter-Schreck!' }, { n: 'spider', t: '🕷 Gummispinne mit Wackelbeinen!' }, { n: 'hand', t: '🖐 Glibberhand aus Gelee! Iiih!' }
  ];
  function propGeo(n) {
    const P = [], M = E.mtx;
    if (n === 'snake') { for (let i = 0; i < 9; i++) { const a = i * .7; P.push({ g: E.geo.sph, m: M(Math.sin(a) * .12, i * .05, Math.cos(a) * .12 - i * .01, 0, 0, 0, .055, .05, .055), c: i % 2 ? '#3f9a3a' : '#e0c030' }); } P.push({ g: E.geo.sph, m: M(Math.sin(6.3) * .12, .47, .12, 0, 0, 0, .075, .055, .09), c: '#3f9a3a' }, { g: E.geo.box, m: M(Math.sin(6.3) * .12, .46, .23, 0, 0, 0, .012, .006, .08), c: '#d02a2a' }); }
    else if (n === 'bat') { P.push({ g: E.geo.sph, m: M(0, 0, 0, 0, 0, 0, .1, .12, .09), c: '#2a2030' }, { g: E.geo.sph, m: M(0, .14, 0, 0, 0, 0, .07), c: '#2a2030' }); for (const s of [-1, 1]) { P.push({ g: E.geo.box, m: M(s * .24, .04, 0, 0, 0, s * .35, .3, .02, .18), c: '#3d2c48' }, { g: E.geo.cone, m: M(s * .04, .22, 0, 0, 0, 0, .025, .07, .025), c: '#2a2030' }, { g: E.geo.sphLo, m: M(s * .028, .15, .06, 0, 0, 0, .015), c: '#ffdd44' }); } }
    else if (n === 'spider') { P.push({ g: E.geo.sph, m: M(0, .08, -.05, 0, 0, 0, .12, .09, .14), c: '#1e1a18' }, { g: E.geo.sph, m: M(0, .07, .1, 0, 0, 0, .07), c: '#2e2620' }); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) P.push({ g: E.geo.box, m: M(s * .17, .04, .08 - i * .07, 0, (i - 1.5) * .3 * s, s * -.5, .25, .02, .02), c: '#151210' }); }
    else { P.push({ g: E.geo.box, m: M(0, 0, 0, 0, 0, 0, .16, .05, .18), c: '#7ce060' }); for (let i = 0; i < 4; i++) P.push({ g: E.geo.box, m: M(-.06 + i * .04, 0, .14, .2, 0, 0, .03, .03, .12), c: '#8af070' }); P.push({ g: E.geo.box, m: M(-.1, 0, .03, 0, -.7, 0, .03, .03, .1), c: '#8af070' }); }
    return E.merge(P);
  }

  T.def({
    id: 'dunkel', name: 'Die Dunkelkammer', kind: 'Mut', stat: 'mut', e: '🔦', mode: '3d', lock: true, fov: 70, far: 40,
    desc: 'Eine stockdunkle Hütte voller Kisten, Körbe, Töpfe und Löcher in den Wänden. Irgendwo stecken goldene Amulette – greif hinein und ertaste sie! Deine Taschenlampe hat nur wenig Batterie. Hör genau hin: Amulette klimpern, Schreck-Requisiten rasseln. Alles nur Gummi und Plüsch – ehrlich.',
    how: { pc: '<b>WASD</b> gehen · <b>Maus</b> umsehen · <b>E</b> halten = hineingreifen (vor einem Behälter) · <b>Q</b> oder <b>E</b> tippen = Lampe an/aus · <b>Shift</b> schneller · Kopfhörer helfen!', touch: 'Joystick = gehen · rechts wischen = umsehen · <b>Greifen</b> halten vor einem Behälter · <b>Lampe</b> = an/aus · Kopfhörer helfen!' },
    controls: { joy: true, look: true, buttons: [{ id: 'act', label: 'Greifen ✋', big: true }, { id: 'alt', label: 'Lampe 🔦' }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short, who = ctx.who || {};
      const R = E.rand(5 + Math.floor(Math.random() * 99999));
      const RX = short ? 2 : 3, RZ = 2, NR = RX * RZ, HX = RX * RS, HZ = RZ * RS, limit = short ? 44 : 90 - d * 16, nAm = ctx.max;
      // ---- Räume & Türen (Spannbaum + evtl. Schleife)
      const door = {}, dkey = (a, b) => Math.min(a, b) + '-' + Math.max(a, b), rxz = r => [r % RX, (r / RX) | 0];
      { const seen = [true], st = [0]; while (st.length) { const r = st[st.length - 1], [x, z] = rxz(r), nb = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nx = x + a, nz = z + b; if (nx >= 0 && nz >= 0 && nx < RX && nz < RZ && !seen[nz * RX + nx]) nb.push(nz * RX + nx); }); if (!nb.length) { st.pop(); continue; } const n = nb[Math.floor(R() * nb.length)]; seen[n] = true; door[dkey(r, n)] = true; st.push(n); } }
      if (!short) for (let i = 0; i < 6; i++) { const r = Math.floor(R() * NR), [x, z] = rxz(r); if (x + 1 < RX && !door[dkey(r, r + 1)]) { door[dkey(r, r + 1)] = true; break; } }
      // Wände als Boxen (Kollision) + Türöffnungen
      const boxes = [], walls = [];
      const addWall = (x0, z0, x1, z1) => { const b = { x0: Math.min(x0, x1) - (x0 === x1 ? WT / 2 : 0), x1: Math.max(x0, x1) + (x0 === x1 ? WT / 2 : 0), z0: Math.min(z0, z1) - (z0 === z1 ? WT / 2 : 0), z1: Math.max(z0, z1) + (z0 === z1 ? WT / 2 : 0) }; boxes.push(b); walls.push(b); };
      const doors = [];
      for (let i = 0; i <= RX; i++) for (let j = 0; j < RZ; j++) { const x = i * RS, za = j * RS, zb = za + RS; if (i > 0 && i < RX && door[dkey(j * RX + i - 1, j * RX + i)]) { const m = za + RS / 2; addWall(x, za, x, m - DW / 2); addWall(x, m + DW / 2, x, zb); doors.push({ x, z: m, ax: false }); } else addWall(x, za, x, zb); }
      for (let j = 0; j <= RZ; j++) for (let i = 0; i < RX; i++) { const z = j * RS, xa = i * RS, xb = xa + RS; if (j > 0 && j < RZ && door[dkey((j - 1) * RX + i, j * RX + i)]) { const m = xa + RS / 2; addWall(xa, z, m - DW / 2, z); addWall(m + DW / 2, z, xb, z); doors.push({ x: m, z, ax: true }); } else addWall(xa, z, xb, z); }
      // ---- Behälter an den Wänden
      const cont = [];
      for (let r = 0; r < NR; r++) {
        const [rx, rz] = rxz(r), cx = (rx + .5) * RS, cz = (rz + .5) * RS, slots = [];
        for (let k = 0; k < 4; k++) { const nx = [-1, 1, 0, 0][k], nz = [0, 0, -1, 1][k]; // Normale zeigt in den Raum, Wand liegt gegenüber
          const wx = cx - nx * (RS / 2 - WT / 2), wz = cz - nz * (RS / 2 - WT / 2), hasDoor = doors.some(o => Math.abs(o.x - (cx - nx * RS / 2)) < .01 && Math.abs(o.z - (cz - nz * RS / 2)) < .01);
          for (const u of [-1.55, 0, 1.55]) { if (hasDoor && Math.abs(u) < 1.2) continue; slots.push({ wx: wx + (nx === 0 ? u : 0), wz: wz + (nz === 0 ? u : 0), nx, nz }); }
        }
        for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
        const n = r === 0 ? 3 : short ? 4 : 4 + (R() < .5 ? 1 : 0);
        for (let i = 0; i < Math.min(n, slots.length); i++) {
          const s = slots[i], rr = R(), kind = rr < .38 ? 'kiste' : rr < .66 ? 'korb' : rr < .84 ? 'loch' : 'topf', K = KINDS[kind];
          const off = kind === 'loch' ? 0 : K.d / 2 + WT / 2 + .02, x = s.wx + s.nx * off, z = s.wz + s.nz * off;
          const c = { i: cont.length, kind, x, z, nx: s.nx, nz: s.nz, room: r, item: 'leer', open: false, yaw: Math.atan2(s.nx, s.nz), y: kind === 'loch' ? 1.05 : K.h };
          if (kind !== 'loch') { const hw = (s.nx === 0 ? K.w : K.d) / 2, hd = (s.nx === 0 ? K.d : K.w) / 2; c.box = { x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd }; boxes.push(c.box); }
          cont.push(c);
        }
      }
      // Inhalte verteilen
      const order = cont.map(c => c.i).sort(() => R() - .5), far = cont.filter(c => c.room !== 0).map(c => c.i).sort(() => R() - .5);
      const take = (pref) => { const k = pref.find(i => cont[i].item === 'leer'); if (k == null) return null; return cont[k]; };
      for (let i = 0; i < nAm; i++) { const c = take(i < nAm - 1 ? far : order) || take(order); if (c) c.item = 'amulett'; }
      const nScare = Math.round((short ? 2 : 4) + d * (short ? 2 : 4)); for (let i = 0; i < nScare; i++) { const c = take(order); if (c) { c.item = 'schreck'; c.prop = PROPS[i % PROPS.length]; } }
      for (let i = 0; i < (short ? 1 : 2); i++) { const c = take(order); if (c) c.item = 'batterie'; }
      cont.forEach(c => { c.next = 1 + R() * 2; });
      // Batterien auf dem Boden
      const floorBat = []; for (let i = 0, nb = short ? 2 : 3; i < 40 && floorBat.length < nb; i++) { const r = 1 + Math.floor(R() * (NR - 1)), [rx, rz] = rxz(r), x = (rx + .5) * RS + (R() - .5) * 2.6, z = (rz + .5) * RS + (R() - .5) * 2.6; if (cont.some(c => Math.hypot(c.x - x, c.z - z) < 1.3) || floorBat.some(b => Math.hypot(b.x - x, b.z - z) < 3)) continue; floorBat.push({ x, z, got: false }); }
      // Pfeiler als Hindernis in manchen Räumen
      for (let r = 1; r < NR; r++) if (R() < .6) { const [rx, rz] = rxz(r), x = (rx + .5) * RS + (R() - .5) * 1.2, z = (rz + .5) * RS + (R() - .5) * 1.2; if (floorBat.some(b => Math.hypot(b.x - x, b.z - z) < 1)) continue; const b = { x0: x - .17, x1: x + .17, z0: z - .17, z1: z + .17, pillar: true }; boxes.push(b); walls.push(b); }

      // ---- Szene
      S.background = new THREE.Color(0x020203); S.fog = new THREE.Fog(0x020203, 2, 14);
      const hemi = new THREE.HemisphereLight(0x5a6a8a, 0x1a1410, .11); S.add(hemi);
      const lamp = new THREE.SpotLight(0xfff2cf, 1.8, 14, .52, .5, 1.5); lamp.position.set(.18, -.2, 0); cam.add(lamp); lamp.target.position.set(.06, -.3, -3); cam.add(lamp.target);
      cam.rotation.order = 'YXZ'; S.add(cam);
      const mat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 5, specular: 0x111111 });
      const P = [], M = E.mtx, woods = ['#5e4128', '#6b4a2e', '#543923', '#73512f'];
      for (let r = 0; r < NR; r++) { const [rx, rz] = rxz(r), x0 = rx * RS, z0 = rz * RS;
        for (let k = 0; k < 9; k++) P.push({ g: E.geo.box, m: M(x0 + (k + .5) * RS / 9, -.05, z0 + RS / 2, 0, 0, 0, RS / 9 - .02, .1, RS), c: woods[(k + r) % 4], jit: .25 });
        P.push({ g: E.geo.box, m: M(x0 + RS / 2, WH + .05, z0 + RS / 2, 0, 0, 0, RS, .1, RS), c: '#3a2a1a', jit: .2 });
        for (let k = 0; k < 3; k++) P.push({ g: E.geo.box, m: M(x0 + RS / 2, WH - .12, z0 + (k + .5) * RS / 3, 0, 0, 0, RS, .18, .18), c: '#4a3420' });
      }
      walls.forEach((b, wi) => { const w = b.x1 - b.x0, dd = b.z1 - b.z0, cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
        if (b.pillar) { P.push({ g: E.geo.box, m: M(cx, WH / 2, cz, 0, 0, 0, w, WH, dd), c: '#4e3620', jit: .3 }); return; }
        P.push({ g: E.geo.box, m: M(cx, WH / 2, cz, 0, 0, 0, w, WH, dd), c: woods[wi % 4], jit: .3 });
        const along = w > dd, L = along ? w : dd, n = Math.floor(L / .45);
        for (let k = 1; k < n; k++) { const t = -L / 2 + k * L / n; P.push({ g: E.geo.box, m: M(cx + (along ? t : 0), WH / 2, cz + (along ? 0 : t), 0, 0, 0, along ? .035 : w + .02, WH, along ? dd + .02 : .035), c: '#2e2014' }); }
        P.push({ g: E.geo.box, m: M(cx, .9, cz, 0, 0, 0, along ? w : w + .05, .1, along ? dd + .05 : dd), c: '#4a3420' });
      });
      doors.forEach(o => { for (const s of [-1, 1]) P.push({ g: E.geo.box, m: M(o.x + (o.ax ? s * DW / 2 : 0), WH / 2, o.z + (o.ax ? 0 : s * DW / 2), 0, 0, 0, .16, WH, .16), c: '#3e2a16' }); P.push({ g: E.geo.box, m: M(o.x, 2.05, o.z, 0, 0, 0, o.ax ? DW + .2 : .26, .16, o.ax ? .26 : DW + .2), c: '#3e2a16' }); P.push({ g: E.geo.box, m: M(o.x, 2.3, o.z, 0, 0, 0, o.ax ? DW + .2 : WT, .4, o.ax ? WT : DW + .2), c: '#5e4128' }); });
      // Behälter-Modelle
      cont.forEach(c => { const K = KINDS[c.kind], along = c.nx === 0, sx = along ? K.w : K.d, sz = along ? K.d : K.w;
        if (c.kind === 'kiste') { P.push({ g: E.geo.box, m: M(c.x, K.h / 2, c.z, 0, 0, 0, sx, K.h, sz), c: '#8a6436', jit: .3 }); for (const y of [.1, K.h - .1]) P.push({ g: E.geo.box, m: M(c.x, y, c.z, 0, 0, 0, sx + .02, .07, sz + .02), c: '#5c3e1e' }); P.push({ g: E.geo.box, m: M(c.x + c.nx * .1, K.h + .03, c.z + c.nz * .1, 0, 0, 0, along ? sx : sx * .6, .05, along ? sz * .6 : sz), c: '#6e4e2a' }); }
        else if (c.kind === 'korb') { P.push({ g: E.geo.cyl, m: M(c.x, K.h / 2, c.z, 0, 0, 0, K.w / 2, K.h, K.w / 2), c: '#a8834a', jit: .4 }); P.push({ g: E.geo.torus, m: M(c.x, K.h, c.z, Math.PI / 2, 0, 0, K.w / 2, K.w / 2, .6), c: '#7a5a2c' }); P.push({ g: E.geo.cyl, m: M(c.x, K.h - .03, c.z, 0, 0, 0, K.w / 2 - .04, .02, K.w / 2 - .04), c: '#141008' }); }
        else if (c.kind === 'topf') { P.push({ g: E.geo.sph, m: M(c.x, .32, c.z, 0, 0, 0, .3, .34, .3), c: '#8a4a2a', jit: .2 }, { g: E.geo.cyl, m: M(c.x, .64, c.z, 0, 0, 0, .17, .12, .17), c: '#7a3e22' }, { g: E.geo.cyl, m: M(c.x, .7, c.z, 0, 0, 0, .14, .01, .14), c: '#0e0a06' }); }
        else { const fx = c.x + c.nx * .02, fz = c.z + c.nz * .02; P.push({ g: E.geo.box, m: M(fx, 1.05, fz, 0, 0, 0, along ? K.w : .03, K.h, along ? .03 : K.w), c: '#070504' }); for (const s of [-1, 1]) { P.push({ g: E.geo.box, m: M(fx + (along ? s * K.w / 2 : c.nx * .02), 1.05, fz + (along ? c.nz * .02 : s * K.w / 2), 0, 0, 0, .08, K.h + .1, .08), c: '#3a2614' }); P.push({ g: E.geo.box, m: M(fx + c.nx * .02, 1.05 + s * K.h / 2, fz + c.nz * .02, 0, 0, 0, along ? K.w + .1 : .08, .08, along ? .08 : K.w + .1), c: '#3a2614' }); } }
      });
      // Deko: Regale, Kräuterbündel, Seile
      for (let r = 0; r < NR; r++) { const [rx, rz] = rxz(r); for (let i = 0; i < 3; i++) { const x = (rx + .2 + R() * .6) * RS, z = (rz + .2 + R() * .6) * RS; P.push({ g: E.geo.cylLo, m: M(x, WH - .45, z, 0, 0, 0, .01, .7, .01), c: '#8a7a5a' }, { g: E.geo.cone, m: M(x, WH - .85, z, Math.PI, 0, 0, .1, .3, .1), c: ['#4a5a2a', '#6a4a2a', '#5a2a2a'][i] }); } }
      S.add(new THREE.Mesh(E.merge(P), mat));
      // Leuchtband (Phosphor) an Behältern & Türen: sichtbar ohne Licht
      const frameGeo = (() => { const Q = []; Q.push({ g: E.geo.box, m: M(0, .5, 0, 0, 0, 0, 1, .04, .02), c: '#fff' }, { g: E.geo.box, m: M(0, -.5, 0, 0, 0, 0, 1, .04, .02), c: '#fff' }, { g: E.geo.box, m: M(.5, 0, 0, 0, 0, 0, .04, 1, .02), c: '#fff' }, { g: E.geo.box, m: M(-.5, 0, 0, 0, 0, 0, .04, 1, .02), c: '#fff' }); return E.merge(Q); })();
      const tape = new THREE.InstancedMesh(frameGeo, new THREE.MeshBasicMaterial({ color: 0x2f8a6a, fog: false, transparent: true, opacity: .55 }), cont.length); const dm = new THREE.Object3D();
      const tapeAt = (c, on) => { const K = KINDS[c.kind]; dm.position.set(c.x + c.nx * ((c.kind === 'loch' ? 0 : K.d / 2) + .03), c.kind === 'loch' ? 1.05 : K.h * .55, c.z + c.nz * ((c.kind === 'loch' ? 0 : K.d / 2) + .03)); dm.rotation.set(0, c.yaw, 0); const s = on ? 1 : 0; dm.scale.set(K.w * .9 * s, (c.kind === 'loch' ? K.h + .1 : K.h * .7) * s, s); dm.updateMatrix(); tape.setMatrixAt(c.i, dm.matrix); tape.instanceMatrix.needsUpdate = true; };
      cont.forEach(c => tapeAt(c, true)); S.add(tape);
      const DP = []; doors.forEach(o => { for (const s of [-1, 1]) DP.push({ g: E.geo.box, m: M(o.x + (o.ax ? s * (DW / 2 - .09) : 0), 1, o.z + (o.ax ? 0 : s * (DW / 2 - .09)), 0, 0, 0, o.ax ? .03 : .2, 2, o.ax ? .2 : .03), c: '#3a6aa0' }); DP.push({ g: E.geo.box, m: M(o.x, 1.96, o.z, 0, 0, 0, o.ax ? DW - .1 : .2, .03, o.ax ? .2 : DW - .1), c: '#3a6aa0' }); });
      // Mondlicht durch Ritzen in den Außenwänden
      for (let i = 0; i < (short ? 5 : 8); i++) { const side = Math.floor(R() * 4), t = .1 + R() * .8; const x = side < 2 ? (side ? HX - .11 : .11) : t * HX, z = side < 2 ? t * HZ : (side === 2 ? .11 : HZ - .11); DP.push({ g: E.geo.box, m: M(x, 1.2 + R() * .6, z, 0, 0, 0, side < 2 ? .02 : .025, .8 + R() * .8, side < 2 ? .025 : .02), c: '#7fa4d8' }); }
      S.add(new THREE.Mesh(E.merge(DP), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .5, fog: false })));
      // Amulett-Glanz (nur im Lampenlicht sichtbar)
      const amGeo = (() => { const Q = []; Q.push({ g: E.geo.torus, m: M(0, 0, 0, 0, 0, 0, .09, .09, .09), c: '#ffd24a' }, { g: E.geo.sph, m: M(0, 0, 0, 0, 0, 0, .06, .06, .025), c: '#ff9a2a' }, { g: E.geo.box, m: M(0, .12, 0, 0, 0, 0, .015, .08, .015), c: '#c8a040' }); return E.merge(Q); })();
      const amMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0xffeeaa });
      cont.forEach(c => { if (c.item !== 'amulett') return; const m = new THREE.Mesh(amGeo, amMat); const top = c.kind === 'loch'; m.position.set(c.x + c.nx * (top ? .12 : .05), top ? 1.0 : c.y + .04, c.z + c.nz * (top ? .12 : .05)); m.rotation.set(top ? 0 : -1.2, c.yaw, 0); S.add(m); c.am = m; });
      // Batterien
      const batGeo = (() => { const Q = [{ g: E.geo.cyl, m: M(0, .09, 0, 0, 0, 0, .05, .18, .05), c: '#2a2a2a' }, { g: E.geo.cyl, m: M(0, .13, 0, 0, 0, 0, .052, .09, .052), c: '#4ad04a' }, { g: E.geo.cyl, m: M(0, .19, 0, 0, 0, 0, .02, .02, .02), c: '#d0d0d0' }]; return E.merge(Q); })();
      const glowMat = col => new THREE.SpriteMaterial({ map: E.glowTex(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 });
      floorBat.forEach(b => { b.m = new THREE.Mesh(batGeo, E.vcMat); b.m.position.set(b.x, 0, b.z); b.m.rotation.z = Math.PI / 2; b.m.position.y = .05; S.add(b.m); b.g = new THREE.Sprite(glowMat(0x4aff6a)); b.g.scale.setScalar(.5); b.g.position.set(b.x, .1, b.z); S.add(b.g); });
      // Schreck-Requisiten (springen aus dem Behälter)
      const propGeos = {}; PROPS.forEach(p => { propGeos[p.n] = propGeo(p.n); });
      const pmat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x111111 });
      const pops = [];
      // Hände & Lampe
      const skin = who.skin || '#e8b98f', sleeve = who.top || '#2a9d8f';
      const handGeo = withLamp => { const Q = [{ g: E.geo.box, m: M(0, 0, 0, 0, 0, 0, .085, .035, .1), c: skin }, { g: E.geo.cyl, m: M(0, -.005, .12, Math.PI / 2, 0, 0, .05, .16, .045), c: sleeve }]; for (let i = 0; i < 4; i++) Q.push({ g: E.geo.box, m: M(-.03 + i * .02, -.006, -.07, .2, 0, 0, .016, .018, .055), c: skin }); Q.push({ g: E.geo.box, m: M(-.05, -.003, -.02, 0, -.6, 0, .018, .018, .05), c: skin }); if (withLamp) Q.push({ g: E.geo.cyl, m: M(.01, .03, -.04, Math.PI / 2, 0, 0, .022, .17, .022), c: '#3a3f46' }, { g: E.geo.cyl, m: M(.01, .03, -.13, Math.PI / 2, 0, 0, .03, .03, .03), c: '#3a3f46' }); return E.merge(Q); };
      const hmat = new THREE.MeshBasicMaterial({ vertexColors: true, color: 0x8a7f74, depthTest: false, depthWrite: false });
      const handL = new THREE.Mesh(handGeo(false), hmat), handR = new THREE.Mesh(handGeo(true), hmat); [handL, handR].forEach(h => { h.renderOrder = 999; h.frustumCulled = false; h.scale.setScalar(.72); cam.add(h); });
      const lens = new THREE.Mesh(E.geo.circle, new THREE.MeshBasicMaterial({ color: 0xfff6c8, depthTest: false, depthWrite: false })); lens.renderOrder = 1000; lens.scale.setScalar(.026); lens.position.set(.01, .03, -.147); handR.add(lens);
      // DOM: Schreck-Schleier
      const box = document.getElementById('trial') || document.body;
      const veil = document.createElement('div'); veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 40%,rgba(120,20,60,.75) 100%)'; box.appendChild(veil);

      // ---- Klänge mit Richtung & Entfernung (eigener Audio-Kontext)
      let ac = null, master = null; const sndOn = () => !window.USnd || !window.USnd.isOn || window.USnd.isOn();
      function audio() { if (ac === false) return null; if (!ac) { try { const A = window.AudioContext || window.webkitAudioContext; if (!A) { ac = false; return null; } ac = new A(); master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination); } catch (e) { ac = false; return null; } } if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; }
      function out(vol, pan, t) { const c = ac, g = c.createGain(); g.gain.value = vol; if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(master); } else g.connect(master); return g; }
      function ping(f, dur, type, vol, pan, when, f2) { const c = audio(); if (!c || !sndOn() || vol < .005) return; const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(out(1, pan)); o.start(t); o.stop(t + dur + .05); }
      let nbuf = null;
      function rattle(vol, pan, n) { const c = audio(); if (!c || !sndOn() || vol < .005) return; if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate * .06 | 0, c.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 2); } for (let i = 0; i < n; i++) { const s = c.createBufferSource(), f = c.createBiquadFilter(), t = c.currentTime + i * .055; s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 900; f.Q.value = 2; s.connect(f); f.connect(out(vol * (1 - i / (n + 2)), pan)); s.start(t); } }
      const jingle = (vol, pan) => { [1568, 2093, 1760].forEach((f, i) => ping(f + Math.random() * 40, .22, 'triangle', vol * .5, pan, i * .09)); };
      const creak = (vol, pan) => ping(140 + Math.random() * 60, .5, 'sawtooth', vol * .06, pan, 0, 90);

      // ---- Zustand
      let px = RS * .5, pz = RS * .5 + 1.2, yaw = Math.PI, pitch = -.08, tt = 0, got = 0, bat = 1, lampOn = true, scare = 0, panic = 0, shake = 0, grab = 0, target = null, finished = false, ph = 0, moved = 0, actHeld = 0, opened = 0, frights = 0, creakT = 3, flick = 0, reach = 0, lowWarn = false;
      { const best = cont.filter(c => c.room === 0)[0]; if (best) yaw = Math.atan2(-(best.x - px), -(best.z - pz)); }
      const grabT = .85 + d * .45, drain = .028 + d * .016;
      const fwd = () => [-Math.sin(yaw), -Math.cos(yaw)];
      function collide() { for (let it = 0; it < 2; it++) boxes.forEach(b => { const cx = clamp(px, b.x0, b.x1), cz = clamp(pz, b.z0, b.z1), dx = px - cx, dz = pz - cz, dl = Math.hypot(dx, dz); if (dl < PR) { if (dl < 1e-5) { px += PR; return; } px = cx + dx / dl * PR; pz = cz + dz / dl * PR; } }); px = clamp(px, PR, HX - PR); pz = clamp(pz, PR, HZ - PR); }
      function findTarget() { const f = fwd(); let best = null, bd = 9; cont.forEach(c => { if (c.open) return; const K = KINDS[c.kind], dx = c.x - px, dz = c.z - pz, dl = Math.hypot(dx, dz), lim = (c.kind === 'loch' ? .1 : K.d / 2) + 1.05; if (dl > lim) return; const ang = Math.acos(clamp((dx * f[0] + dz * f[1]) / (dl || 1), -1, 1)); if (ang > .85) return; if (dl < bd) { bd = dl; best = c; } }); return best; }
      function setLamp(on, quiet) { if (on && bat <= 0) { ctx.hud.toast('🔋 Batterie leer!', 'bad'); on = false; } if (lampOn === on) return; lampOn = on; if (!quiet) ctx.S.click(); }
      function openC(c) {
        c.open = true; opened++; tapeAt(c, false); grab = 0;
        if (c.item === 'amulett') { got++; ctx.hud.stars(got); ctx.hud.toast('★ Goldenes Amulett ertastet!', 'good'); if (c.am) c.am.visible = false; jingle(.5, 0); }
        else if (c.item === 'schreck') { frights++; scare = Math.min(1, scare + .3 + d * .14); shake = 1; ctx.S.bad(); ctx.hud.toast(c.prop.t, 'bad'); const m = new THREE.Mesh(propGeos[c.prop.n], pmat); m.position.set(c.x, c.y, c.z); S.add(m); pops.push({ m, t: 0, x: c.x, z: c.z, y0: c.y, vx: (px - c.x) * 1.2, vz: (pz - c.z) * 1.2, n: c.prop.n });
          if (scare >= 1 && panic <= 0) { panic = 2.2; tt += 4; setLamp(false, true); ctx.hud.toast('😱 Schreckstarre! Lampe fallen gelassen …', 'bad'); scare = .999; } }
        else if (c.item === 'batterie') { bat = Math.min(1, bat + .45); ctx.hud.toast('🔋 Ersatzbatterie!', 'good'); ctx.S.swallow(); }
        else { ctx.hud.toast(['Nur Stroh …', 'Leer. Bloß Staub.', 'Eine alte Socke. Weiter!', 'Nichts als Spinnweben.'][c.i % 4]); ctx.S.thud(); }
      }
      function animate(dt) {
        pops.forEach(p => { p.t += dt; const k = Math.min(1, p.t / .45); p.m.position.set(p.x + p.vx * .35 * k, p.y0 + Math.sin(Math.min(1, p.t / .6) * Math.PI) * .9 + (p.t > .6 ? -Math.min(p.y0, (p.t - .6) * 3) : 0), p.z + p.vz * .35 * k); p.m.rotation.y += dt * (p.t < .8 ? 9 : 0); if (p.n === 'bat') p.m.position.y += Math.sin(p.t * 20) * .02; });
        floorBat.forEach(b => { if (!b.got) b.g.material.opacity = .35 + Math.sin(tt * 3 + b.x) * .2; });
        cont.forEach(c => { if (c.am) c.am.rotation.y = c.yaw + Math.sin(tt * 2 + c.i) * .4; });
      }
      function placeCam(dt) {
        const sh = shake * .06 + (panic > 0 ? .05 : 0), eye = EYE + Math.sin(ph * 2) * .03 * moved;
        cam.position.set(px + (Math.random() - .5) * sh, eye + (Math.random() - .5) * sh, pz + (Math.random() - .5) * sh);
        cam.rotation.set(pitch + (Math.random() - .5) * sh, yaw + (Math.random() - .5) * sh, Math.sin(ph) * .012 * moved);
        reach += ((grab > 0 ? 1 : 0) - reach) * Math.min(1, dt * 8);
        const hx = clamp(cam.aspect / 1.5, .6, 1); handL.position.set(-.17 * hx + reach * .1 * hx, -.23 + reach * .05, -.4 - reach * .18 + Math.sin(ph) * .02 * moved); handL.rotation.set(-.2 - reach * .5, .2, .15 + Math.sin(tt * 30) * .05 * reach);
        handR.position.set(.16 * hx, -.2 + Math.sin(ph + 1) * .012 * moved, -.38); handR.rotation.set(-.08 + (lampOn ? 0 : .35), -.1, -.1);
        const on = lampOn && !(flick > 0 && Math.random() < .5);
        lamp.intensity = on ? 1.8 * (bat < .15 ? .55 + Math.random() * .3 : 1) : 0; lens.material.color.setHex(on ? 0xfff6c8 : 0x30302a);
      }
      animate(0); placeCam(0);
      ctx.hud.hint('Hör hin: Klimpern = Amulett · Rasseln = Schreck!');
      const api = {
        idle(dt) { animate(dt); placeCam(dt); },
        update(dt) {
          tt += dt; const look = I.consumeLook();
          if (finished) { animate(dt); placeCam(dt); return; }
          const left = Math.max(0, limit - tt); ctx.hud.time(left, left / limit); if (left <= 0) { finished = true; ctx.finish(got, 'time'); return; }
          yaw -= look.dx * LOOK; pitch = clamp(pitch - look.dy * LOOK * .8, -1, .8);
          if (panic > 0) { panic -= dt; yaw += Math.sin(tt * 11) * dt * 1.4; if (panic <= 0) { scare = .5; ctx.hud.toast('Tief durchatmen … weiter!'); } }
          shake = Math.max(0, shake - dt * 1.6); flick = Math.max(0, flick - dt);
          // Gehen
          const mv = I.move, sp = (I.down('run') ? 3.2 : 2.3) * (panic > 0 ? .4 : 1) * (grab > 0 ? .25 : 1), f = fwd(), rx = Math.cos(yaw), rz = -Math.sin(yaw), ox = px, oz = pz;
          px += (f[0] * mv.y + rx * mv.x * .85) * sp * dt; pz += (f[1] * mv.y + rz * mv.x * .85) * sp * dt;
          if (panic > 0) { px -= f[0] * dt * .8; pz -= f[1] * dt * .8; }
          collide(); const dist = Math.hypot(px - ox, pz - oz); moved += ((dist > .001 ? 1 : 0) - moved) * Math.min(1, dt * 6); ph += dist * 3.2;
          // Lampe
          if (I.pressed('alt')) setLamp(!lampOn);
          if (lampOn) { bat = Math.max(0, bat - drain * dt); if (bat <= 0) { setLamp(false, true); flick = 0; ctx.hud.toast('🔋 Batterie leer – such Nachschub!', 'bad'); } if (bat < .15 && !lowWarn) { lowWarn = true; ctx.hud.toast('🔋 Batterie schwach!', 'bad'); } }
          if (bat > .2) lowWarn = false;
          floorBat.forEach(b => { if (b.got || Math.hypot(b.x - px, b.z - pz) > .55) return; b.got = true; b.m.visible = false; b.g.visible = false; bat = Math.min(1, bat + .4); ctx.hud.toast('🔋 Batterie gefunden!', 'good'); ctx.S.swallow(); });
          // Greifen: E halten vor einem Behälter, sonst E tippen = Lampe
          target = findTarget(); const act = I.down('act'), tap = I.pressed('act');
          if (act) actHeld += dt; else { if (actHeld > 0 && actHeld < .25 && !target) setLamp(!lampOn); actHeld = 0; }
          if (target && act && panic <= 0) { grab += dt; if (grab >= grabT) openC(target); else if (Math.random() < dt * 3) ctx.S.pad(3); }
          else grab = Math.max(0, grab - dt * 2.5);
          // Geräusche
          cont.forEach(c => { if (c.open || (c.item !== 'amulett' && c.item !== 'schreck')) return; c.next -= dt; if (c.next > 0) return;
            const dx = c.x - px, dz = c.z - pz, dl = Math.hypot(dx, dz), vol = Math.pow(clamp(1 - dl / 8, 0, 1), 1.8), pan = (dx * rx + dz * rz) / (dl || 1);
            if (c.item === 'amulett') { c.next = 2.4 + Math.random() * 1.6; jingle(vol * .35, pan); c.heard = dl < 3.2 || c.heard; }
            else { c.next = 2.2 + Math.random() * 1.8; rattle(vol * .5, pan, 6); c.heard = dl < 3.2 || c.heard; } });
          creakT -= dt; if (creakT <= 0) { creakT = 4 + Math.random() * 6; creak(.6, Math.random() * 2 - 1); }
          animate(dt); placeCam(dt);
          veil.style.opacity = Math.min(1, scare * .4 + shake * .5 + (panic > 0 ? .3 : 0)).toFixed(2);
          ctx.hud.meter('bat', bat, lampOn ? '🔦 Batterie' : '🔦 aus', bat < .2 ? '#ff6b4a' : '#ffcf4a');
          ctx.hud.meter('schreck', scare, panic > 0 ? '😱 Starre' : 'Schreck', scare > .7 ? '#ff4fa0' : '#b07cff');
          ctx.hud.meter('grab', target ? grab / grabT : null, '✋ Greifen', '#9dff5c');
          ctx.hud.hint(target ? (act ? 'Taste … taste … ' : (I.touch ? 'Greifen halten!' : 'E halten zum Hineingreifen')) : 'Hör hin: Klimpern = Amulett · Rasseln = Schreck!');
          if (got >= nAm) { finished = true; ctx.hud.toast('Alle Amulette! Mutig!', 'good'); ctx.finish(got, 'done'); }
        },
        dispose() { veil.remove(); if (ac) try { ac.close(); } catch (e) { } },
        debug: () => ({ px: +px.toFixed(2), pz: +pz.toFixed(2), got, bat: +bat.toFixed(2), lampOn, scare: +scare.toFixed(2), opened, frights, n: cont.length, t: +tt.toFixed(1) }),
        details: () => ({ geoeffnet: opened, schreck: frights }),
        bot: makeBot()
      };
      // ---- Testpilot: hört Klimpern/Rasseln (wie ein Mensch), BFS auf eigenem Gitter, greift echte Eingaben
      function makeBot() {
        const GX = Math.ceil(HX / G), GZ = Math.ceil(HZ / G), blocked = new Uint8Array(GX * GZ);
        for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) { const x = (i + .5) * G, z = (j + .5) * G; blocked[j * GX + i] = (x < PR || z < PR || x > HX - PR || z > HZ - PR || boxes.some(b => x > b.x0 - PR - .04 && x < b.x1 + PR + .04 && z > b.z0 - PR - .04 && z < b.z1 + PR + .04)) ? 1 : 0; }
        const gi = (x, z) => clamp(Math.floor(z / G), 0, GZ - 1) * GX + clamp(Math.floor(x / G), 0, GX - 1);
        const free = (x, z) => !blocked[gi(x, z)];
        function nearestFree(x, z) { const s = gi(x, z); if (!blocked[s]) return s; let best = s, bd = 1e9; for (let k = 0; k < blocked.length; k++) if (!blocked[k]) { const dx = (k % GX + .5) * G - x, dz = ((k / GX | 0) + .5) * G - z, dd = dx * dx + dz * dz; if (dd < bd) { bd = dd; best = k; } } return best; }
        function path(x0, z0, x1, z1) { const s = nearestFree(x0, z0), g = nearestFree(x1, z1), prev = new Int32Array(GX * GZ).fill(-2), q = [s]; prev[s] = -1; for (let h = 0; h < q.length; h++) { const c = q[h]; if (c === g) break; const i = c % GX, j = c / GX | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const ni = i + a, nj = j + b; if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue; const n = nj * GX + ni; if (blocked[n] || prev[n] !== -2) continue; if (a && b && (blocked[j * GX + ni] || blocked[nj * GX + i])) continue; prev[n] = c; q.push(n); } } const out = []; for (let c = g; c >= 0; c = prev[c]) out.unshift([(c % GX + .5) * G, ((c / GX | 0) + .5) * G]); return out; }
        const clear = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / .12); for (let k = 1; k <= n; k++) if (!free(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n)) return false; return true; };
        let goal = null, route = null, replan = 0, stuck = 0, lx = 0, lz = 0, goalT = 0;
        const reachPt = c => { const K = KINDS[c.kind], o = (c.kind === 'loch' ? 0 : K.d / 2) + .62; return [c.x + c.nx * o, c.z + c.nz * o]; };
        return function (dt) {
          const left = limit - tt; replan -= dt;
          if (!goal || goal.open || (goal.got) || replan <= 0) {
            replan = 1.2; let best = null, bs = 1e9;
            cont.forEach(c => { if (c.open || c.skip) return; if (c.heard && c.item === 'schreck') return; const [rx2, rz2] = reachPt(c), dl = Math.hypot(rx2 - px, rz2 - pz) + (c.heard && c.item === 'amulett' ? -6 : 0); if (dl < bs) { bs = dl; best = c; } });
            floorBat.forEach(b => { if (b.got) return; const dl = Math.hypot(b.x - px, b.z - pz) - (bat < .35 ? 8 : 0); if (dl < bs) { bs = dl; best = b; } });
            if (best !== goal) { goal = best; route = null; goalT = 0; }
          }
          const o = { move: { x: 0, y: 0 }, look: { dx: 0, dy: (-.08 - pitch) / LOOK * .1 }, hold: {}, press: [] };
          if (!goal) return o;
          const isC = goal.kind != null, [gx, gz] = isC ? reachPt(goal) : [goal.x, goal.z];
          if (!route || replan === 1.2) route = path(px, pz, gx, gz);
          while (route.length > 1 && (Math.hypot(route[0][0] - px, route[0][1] - pz) < .3 || clear(px, pz, route[1][0], route[1][1]))) route.shift();
          let tx = route.length ? route[0][0] : gx, tz = route.length ? route[0][1] : gz; if (route.length <= 1 && clear(px, pz, gx, gz)) { tx = gx; tz = gz; }
          const dg = Math.hypot(gx - px, gz - pz), near = isC && (target === goal || dg < .45);
          goalT += dt; if (goalT > 9) { if (isC) goal.skip = true; else goal.got = true; goal = null; goalT = 0; return o; }
          let fx = tx, fz = tz; if (near) { fx = goal.x; fz = goal.z; }
          const dx = fx - px, dz = fz - pz, want = Math.atan2(-dx, -dz), diff = wrap(want - yaw);
          o.look.dx = clamp(-diff / LOOK * Math.min(1, dt * 8), -80, 80);
          if (near) { if (target === goal) o.hold.act = true; else if (Math.abs(diff) < .3) o.move.y = .4; }
          else { const f = fwd(), rx = Math.cos(yaw), rz = -Math.sin(yaw), dl = Math.hypot(tx - px, tz - pz) || 1, ux = (tx - px) / dl, uz = (tz - pz) / dl; const k = Math.abs(diff) > 1.3 ? .25 : 1, sl = dg < 1 ? .55 : 1; o.move.y = clamp((ux * f[0] + uz * f[1]) * 1.5, -1, 1) * k * sl; o.move.x = clamp((ux * rx + uz * rz) * 1.5, -1, 1) * k * sl; }
          // klemmt? kurz zurück und neu planen
          const mvd = Math.hypot(px - lx, pz - lz); lx = px; lz = pz; if (mvd < dt * .2 && !near) { stuck += dt; if (stuck > 1.2) { stuck = 0; replan = 0; route = null; o.move.y = -1; } } else stuck = 0;
          // Lampe: an zum Gehen, aus wenn knapp
          const wantLamp = bat > .12 && (left > 8);
          if (wantLamp !== lampOn && panic <= 0 && !(lampOn === false && bat <= 0)) o.press.push('alt');
          return o;
        };
      }
      return api;
    }
  });
})();

/* Prüfung: Die Schatzsuche (3D) – Erkundung eines Dschungelgebiets mit Landmarken, rätselhafte Hinweiskarten, Kompass, Skizzenkarte, Graben (falsches Graben kostet Zeit) */
(function () {
  'use strict';
  const T = UTrials, E = UE, THREE = E.THREE, clamp = E.clamp, lerp = E.lerp;
  const TAU = Math.PI * 2;
  const DIRS = [{ n: 'Norden', x: 0, z: -1 }, { n: 'Osten', x: 1, z: 0 }, { n: 'Süden', x: 0, z: 1 }, { n: 'Westen', x: -1, z: 0 }];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  T.def({
    id: 'schatz', name: 'Die Schatzsuche', kind: 'Kopf', stat: 'kopf', e: '🗺️', mode: '3d', lock: false,
    desc: 'Im Dschungel sind Truhen vergraben. Jeder Hinweis beschreibt ein Versteck anhand der Landmarken (Wasserfall, Brücke, Totempfahl, hohler Baum …). 1 Schritt = 1 Meter; Kompass und Karte helfen. Falsch graben kostet Zeit!',
    how: { pc: '<b>WASD</b> gehen · <b>Shift</b> rennen · Maus ziehen: umsehen · <b>E</b> halten: graben · <b>M</b>/<b>Tab</b>: Karte', touch: 'Joystick: gehen (ganz raus = rennen) · rechts wischen: umsehen · <b>Graben</b> halten · <b>Karte</b> auf/zu' },
    controls: { joy: true, look: true, buttons: [{ id: 'act', label: 'Graben', big: true }, { id: 'map', label: 'Karte' }] },
    create(ctx) {
      const S = ctx.scene, cam = ctx.camera, I = ctx.I, d = ctx.diff, short = ctx.short;
      const seed = 3 + Math.floor(Math.random() * 99999), R = E.rand(seed);
      const HW = short ? 27 : 40, nChest = short ? 2 : Math.min(ctx.max, 4), TOL = 2.3, digT = 1.0 + d * .4, pen0 = short ? 3 : 5;
      const limit = short ? 62 - d * 8 : 172 - d * 30;
      S.background = new THREE.Color(0x9cc79a); S.fog = new THREE.Fog(0x9cc79a, 16, 58);
      ctx.lights({ sky: 0xf2fff0, ground: 0x3a4a22, hemi: .9, dir: .75 });
      // ---- Bach (Nord → Süd), Wasserfall im Norden
      const sx0 = (R() * 2 - 1) * HW * .3, sph = R() * 6, sx = z => sx0 + 6 * Math.sin(z * .075 + sph), sdx = z => 6 * .075 * Math.cos(z * .075 + sph);
      const zStream = -HW + 6.5, streamDist = (x, z) => z < zStream - 1 ? 99 : Math.abs(x - sx(z)) / Math.sqrt(1 + sdx(z) * sdx(z));
      const LM = {}; const anchors = [];
      const addLM = (id, x, z, o) => { LM[id] = Object.assign({ id, x, z }, o); anchors.push(LM[id]); return LM[id]; };
      const wx = sx(-HW + 4);
      addLM('wasserfall', wx, -HW + 7.6, { ic: '🌊', nm: 'Wasserfall', kz: 'Wasserfall', vom: 'vom Wasserfall', zum: 'zum Wasserfall', dat: 'dem Wasserfall', poet: 'Wo das Wasser von den Steinen fällt' });
      const zb = lerp(-HW * .15, HW * .4, R()); addLM('bruecke', sx(zb), zb, { ic: '🌉', nm: 'Brücke', kz: 'Brücke', vom: 'von der Brücke', zum: 'zur Brücke', dat: 'der Brücke' });
      const start = { z: HW - 6 }; start.x = clamp(sx(start.z) + (sx(start.z) > 0 ? -8 : 8), -HW + 4, HW - 4);
      const defs = [
        ['totem', { ic: '🗿', nm: 'Totempfahl', kz: 'Totempfahl', vom: 'vom Totempfahl', zum: 'zum Totempfahl', dat: 'dem Totempfahl' }],
        ['hohl', { ic: '🌳', nm: 'hohler Baum', kz: 'Loch im hohlen Baum', vom: 'vom Loch im hohlen Baum', zum: 'zum hohlen Baum', dat: 'dem hohlen Baum' }],
        ['riese', { ic: '🪵', nm: 'umgestürzter Riese', kz: 'Wurzeln des Riesen', vom: 'von den Wurzeln des umgestürzten Riesen', zum: 'zu den Wurzeln des umgestürzten Riesen', dat: 'den Wurzeln des umgestürzten Riesen' }],
        ['kreis', { ic: '🪨', nm: 'Steinkreis', kz: 'Mitte Steinkreis', vom: 'von der Mitte des Steinkreises', zum: 'zur Mitte des Steinkreises', dat: 'der Mitte des Steinkreises' }],
        ['band', { ic: '🎀', nm: 'Baum mit rotem Band', kz: 'Rotes Band', vom: 'vom Baum mit dem roten Band', zum: 'zum Baum mit dem roten Band', dat: 'dem Baum mit dem roten Band' }]
      ];
      const inB = (x, z, m) => Math.abs(x) < HW - m && z < HW - m && z > -HW + m + 6;
      let minD = short ? 11 : 15;
      for (const [id, o] of defs) {
        let ok = false;
        for (let t = 0; t < 600 && !ok; t++) {
          if (t && t % 150 === 0) minD *= .85;
          const x = (R() * 2 - 1) * (HW - 7), z = (R() * 2 - 1) * (HW - 7); if (!inB(x, z, 6)) continue;
          if (streamDist(x, z) < 7 || Math.hypot(x - start.x, z - start.z) < 9) continue;
          if (anchors.some(a => Math.hypot(a.x - x, a.z - z) < minD)) continue;
          if (id === 'riese') { const a = R() * TAU, dx = Math.sin(a), dz = Math.cos(a); let bad = false; for (let s = 0; s <= 17; s += 1.5) { const px = x + dx * s, pz = z + dz * s; if (!inB(px, pz, 4) || streamDist(px, pz) < 4 || anchors.some(q => Math.hypot(q.x - px, q.z - pz) < 7) || Math.hypot(px - start.x, pz - start.z) < 6) bad = true; } if (bad) continue; o.dx = dx; o.dz = dz; o.tip = { x: x + dx * 16.5, z: z + dz * 16.5 }; }
          if (id === 'hohl') { const a = R() * TAU; o.hx = Math.sin(a); o.hz = Math.cos(a); o.cx = x; o.cz = z; addLM(id, x + o.hx * 2.2, z + o.hz * 2.2, o); ok = true; break; }
          addLM(id, x, z, o); ok = true;
        }
      }
      if (LM.riese) anchors.push({ id: 'krone', x: LM.riese.tip.x, z: LM.riese.tip.z, nm: 'Kronenspitze', kz: 'Krone des Riesen', vom: 'von der Kronenspitze des Riesen', hidden: true });
      // ---- Feste Hindernisse (Kollision: Kreise)
      const solids = [];
      const sol = (x, z, r) => solids.push({ x, z, r });
      // ---- Hinweise erzeugen (eindeutig lösbar, geprüft)
      const pick = a => a[Math.floor(R() * a.length)];
      const ids = Object.keys(LM);
      function okT(x, z, list) {
        if (!inB(x, z, 4) || streamDist(x, z) < 3 || Math.hypot(x - start.x, z - start.z) < 6) return false;
        if (LM.bruecke && Math.hypot(x - LM.bruecke.x, z - LM.bruecke.z) < 4.5) return false;
        if (anchors.some(a => Math.hypot(a.x - x, a.z - z) < 3)) return false;
        if (LM.hohl && Math.hypot(LM.hohl.cx - x, LM.hohl.cz - z) < 4) return false;
        if (LM.kreis && Math.hypot(LM.kreis.x - x, LM.kreis.z - z) < 6) return false;
        if (LM.riese) { const r = LM.riese; for (let s = -1; s <= 17; s += 1) if (Math.hypot(r.x + r.dx * s - x, r.z + r.dz * s - z) < 3) return false; }
        return !list.some(c => Math.hypot(c.x - x, c.z - z) < 8);
      }
      const TPL = {
        A() { const L = LM[pick(ids)], D = pick(DIRS), n = 4 + Math.floor(R() * 5); return { x: L.x + D.x * n, z: L.z + D.z * n, refs: [L.id], text: `${cap(L.vom)} ${n} Schritte nach ${D.n}.` }; },
        B() { const a = LM[pick(ids)], b = LM[pick(ids)]; if (a === b) return null; const dd = Math.hypot(b.x - a.x, b.z - a.z); if (dd < 10) return null; const n = 3 + Math.floor(R() * Math.min(6, dd - 6)); const ux = (b.x - a.x) / dd, uz = (b.z - a.z) / dd; const head = a.poet ? a.poet + ', zähl' : 'Geh ' + a.vom; return { x: a.x + ux * n, z: a.z + uz * n, refs: [a.id, b.id], text: `${head} ${n} Schritte geradewegs ${b.zum} – dort graben!` }; },
        C() { const a = LM[pick(ids)], b = LM[pick(ids)]; if (a === b) return null; const dd = Math.hypot(b.x - a.x, b.z - a.z); if (dd < 11 || dd > 34) return null; return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, refs: [a.id, b.id], text: `Genau in der Mitte zwischen ${a.dat} und ${b.dat}.` }; },
        E() { const r = LM.riese; if (!r) return null; const n = 3 + Math.floor(R() * 4); return { x: r.tip.x + r.dx * n, z: r.tip.z + r.dz * n, refs: ['riese'], text: `Der umgestürzte Riese zeigt mit seiner Krone den Weg: von der Kronenspitze noch ${n} Schritte weiter.` }; },
        G() { const h = LM.hohl; if (!h) return null; const n = 4 + Math.floor(R() * 4); return { x: h.x + h.hx * n, z: h.z + h.hz * n, refs: ['hohl'], text: `Schau aus dem Loch im hohlen Baum hinaus: ${n} Schritte geradeaus.` }; },
        W() { const a = LM.wasserfall, b = LM[pick(['band', 'totem', 'kreis', 'hohl'])]; if (!b) return null; const dd = Math.hypot(b.x - a.x, b.z - a.z), n = 3 + Math.floor(R() * Math.min(5, dd - 6)); if (dd < 9) return null; return { x: a.x + (b.x - a.x) / dd * n, z: a.z + (b.z - a.z) / dd * n, refs: ['wasserfall', b.id], text: `${a.poet}, zähl ${n} Schritte ${b.zum}.` }; }
      };
      const order = short ? ['A', 'B'] : ['A', 'G', 'W', 'C', 'E', 'B'].sort(() => R() - .5);
      if (!short) { order.splice(order.indexOf('A'), 1); order.unshift('A'); }
      const clues = [];
      for (let k = 0; k < nChest; k++) {
        let c = null;
        for (let t = 0; t < 400 && !c; t++) { const key = t < 120 ? order[(k + Math.floor(t / 60)) % order.length] : pick(['A', 'B', 'C']); const r = TPL[key](); if (r && okT(r.x, r.z, clues)) { c = r; c.key = key; } }
        if (!c) { const L = LM.totem || LM.bruecke; c = { x: L.x + 4, z: L.z, refs: [L.id], text: `${cap(L.vom)} 4 Schritte nach Osten.`, key: 'A' }; }
        clues.push(c);
      }
      // ---- Welt bauen
      const P = [], M = E.mtx;
      const gG = new THREE.PlaneGeometry(HW * 2 + 50, HW * 2 + 50, 50, 50); gG.rotateX(-Math.PI / 2);
      { const p = gG.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), k = E.noise2(x * .12, z * .12), k2 = E.noise2(x * .5 + 9, z * .5); c.setRGB(.25 + k * .12 + k2 * .05, .42 + k * .14, .16 + k2 * .05); if (streamDist(x, z) < 2.4) c.setRGB(.35, .3, .2); col.set([c.r, c.g, c.b], i * 3); } gG.setAttribute('color', new THREE.BufferAttribute(col, 3)); gG.computeVertexNormals(); }
      S.add(new THREE.Mesh(gG, E.vcMat));
      // Klippe + Wasserfall
      P.push({ g: E.geo.box, m: M(0, 4, -HW - 3, 0, 0, 0, HW * 2 + 50, 9, 7), c: '#6b6a58', jit: .25 });
      for (let i = 0; i < 26; i++) { const x = -HW - 20 + i * (HW * 2 + 40) / 25; P.push({ g: E.geo.dodec, m: M(x + R() * 2, 7 + R() * 3, -HW - 1 + R(), R() * 3, R() * 3, 0, 2.5 + R() * 2, 2 + R() * 2, 2.5), c: R() < .5 ? '#5f6455' : '#727060', jit: .3 }, { g: E.geo.ico, m: M(x, 10.5 + R() * 2, -HW - 3, 0, R() * 3, 0, 3, 2, 3), c: '#2f7d3a', jit: .25 }); }
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI + Math.PI, rx = wx + Math.cos(a) * 3.8, rz = -HW + 4 + Math.sin(a) * -3.6; P.push({ g: E.geo.dodec, m: M(rx, .2, rz, R(), R(), R(), .7 + R() * .4, .5, .7), c: '#6e6d5c' }); }
      const pool = new THREE.Mesh(E.geo.circle, new THREE.MeshLambertMaterial({ color: 0x3f8fa8, transparent: true, opacity: .85 })); pool.rotation.x = -Math.PI / 2; pool.scale.set(3.6, 3.4, 1); pool.position.set(wx, .05, -HW + 4); S.add(pool);
      const fallTex = new THREE.CanvasTexture((() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#9fd8ee'; c.fillRect(0, 0, 64, 128); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${.3 + Math.random() * .5})`; c.fillRect(Math.random() * 64, Math.random() * 128, 2 + Math.random() * 4, 10 + Math.random() * 30); } return cv; })());
      fallTex.wrapS = fallTex.wrapT = THREE.RepeatWrapping; fallTex.repeat.set(1, 2);
      const fall = new THREE.Mesh(E.geo.plane, new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: .9 })); fall.scale.set(3.4, 8.5, 1); fall.position.set(wx, 4.2, -HW + .6); S.add(fall);
      const foam = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xffffff, transparent: true, opacity: .8, depthWrite: false })); foam.scale.set(5, 2.2, 1); foam.position.set(wx, .6, -HW + 1.4); S.add(foam);
      sol(wx, -HW + 3.5, 2.6);
      // Bach als Band
      const stTex = new THREE.CanvasTexture((() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#3f8fa8'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(220,250,255,.35)'; c.fillRect(Math.random() * 64, Math.random() * 64, 2, 8 + Math.random() * 10); } return cv; })());
      stTex.wrapS = stTex.wrapT = THREE.RepeatWrapping;
      { const zs = [], pos = [], uv = [], idx = []; for (let z = -HW + 5; z <= HW + 22; z += 1) zs.push(z); zs.forEach((z, i) => { const c = sx(z), w = 1.35; pos.push(c - w, .06, z, c + w, .06, z); uv.push(0, i * .25, 1, i * .25); if (i) { const a = i * 2 - 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); S.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: stTex, transparent: true, opacity: .9 })));
        for (let z = -HW + 7; z < HW + 20; z += 1.7) for (const s of [-1, 1]) if (R() < .7) P.push({ g: E.geo.dodec, m: M(sx(z) + s * (1.5 + R() * .4), .05, z + R(), R() * 3, R() * 3, 0, .3 + R() * .3, .2, .3 + R() * .3), c: '#7a7866' }); }
      // Brücke
      if (LM.bruecke) { const b = LM.bruecke, th = Math.atan(sdx(b.z)); const BP = [{ g: E.geo.box, m: M(0, .42, 0, 0, 0, 0, 6.2, .18, 1.9), c: '#8a5e34', jit: .2 }]; for (let i = -3; i <= 3; i++) for (const s of [-1, 1]) BP.push({ g: E.geo.cylLo, m: M(i * .98, .8, s * .9, 0, 0, 0, .06, .8, .06), c: '#6b4426' }); for (const s of [-1, 1]) BP.push({ g: E.geo.box, m: M(0, 1.15, s * .9, 0, 0, 0, 6.2, .08, .08), c: '#c8a26a' }); for (const s of [-1, 1]) BP.push({ g: E.geo.box, m: M(s * 3.4, .2, 0, 0, 0, s * .25, 1, .12, 1.9), c: '#7a5030' });
        const g = E.merge(BP); const m = new THREE.Mesh(g, E.vcMat); m.position.set(b.x, 0, b.z); m.rotation.y = th; S.add(m); b.th = th; b.ax = Math.cos(th); b.az = -Math.sin(th); }
      // Totempfahl
      if (LM.totem) { const t = LM.totem, cols = ['#d9432f', '#f2b630', '#2bb3a3', '#7a4fd0', '#ef7d2a']; for (let i = 0; i < 5; i++) { const y = .6 + i * 1.12, c = cols[i]; P.push({ g: E.geo.box, m: M(t.x, y, t.z, 0, i * .2, 0, 1, 1.08, 1), c }, { g: E.geo.box, m: M(t.x - .22, y + .15, t.z + .5, 0, 0, 0, .22, .2, .06), c: '#ffffff' }, { g: E.geo.box, m: M(t.x + .22, y + .15, t.z + .5, 0, 0, 0, .22, .2, .06), c: '#ffffff' }, { g: E.geo.box, m: M(t.x, y - .25, t.z + .52, 0, 0, 0, .5, .12, .08), c: '#111111' }, { g: E.geo.cone, m: M(t.x, y - .02, t.z + .62, Math.PI / 2, 0, 0, .14, .3, .14), c: E.shade(c, -.3) }); } P.push({ g: E.geo.box, m: M(t.x, 5.6, t.z, 0, 0, 0, 3.6, .3, .6), c: '#f2b630' }, { g: E.geo.box, m: M(t.x, 6, t.z, 0, 0, 0, .3, .8, .3), c: '#d9432f' }); sol(t.x, t.z, .85); }
      // Hohler Baum
      if (LM.hohl) { const h = LM.hohl, a = Math.atan2(h.hx, h.hz); P.push({ g: E.geo.cyl, m: M(h.cx, 3.5, h.cz, 0, 0, 0, 1.75, 7, 1.75), c: '#5a3d22', jit: .3 }, { g: E.geo.ico, m: M(h.cx, 8.3, h.cz, 0, 0, 0, 4.6, 3.2, 4.6), c: '#2d6f34', jit: .25 }, { g: E.geo.ico, m: M(h.cx + 1.5, 9.6, h.cz - 1, 0, 1, 0, 2.8, 2.2, 2.8), c: '#3c8f45', jit: .25 }); for (let i = 0; i < 6; i++) { const ra = a + 1 + i / 6 * (TAU - 2); P.push({ g: E.geo.cone, m: M(h.cx + Math.sin(ra) * 1.7, .4, h.cz + Math.cos(ra) * 1.7, 0, ra, Math.PI / 2.4, .45, 1.6, .45), c: '#4a3220' }); } P.push({ g: E.geo.box, m: M(h.cx + h.hx * 1.58, 1.05, h.cz + h.hz * 1.58, 0, a, 0, 1.15, 1.9, .3), c: '#120c06' }, { g: E.geo.torus, m: M(h.cx + h.hx * 1.62, 1.1, h.cz + h.hz * 1.62, 0, a, 0, .7, 1.05, .9), c: '#3a2614' }); sol(h.cx, h.cz, 1.95); }
      // Umgestürzter Riese
      if (LM.riese) { const r = LM.riese, ay = Math.atan2(r.dx, r.dz); P.push({ g: E.geo.cyl, m: M(r.x + r.dx * 8, .95, r.z + r.dz * 8, Math.PI / 2, ay, 0, .95, 16, .95), c: '#6b4a2c', jit: .25 }, { g: E.geo.cyl, m: M(r.x - r.dx * .2, 1.4, r.z - r.dz * .2, Math.PI / 2, ay, 0, 2.2, .5, 2.2), c: '#4a3220', jit: .3 }); for (let i = 0; i < 9; i++) { const q = i / 9 * TAU; P.push({ g: E.geo.cone, m: M(r.x - r.dx * .4 + Math.cos(q) * r.dz * 1.6, 1.4 + Math.sin(q) * 1.6, r.z - r.dz * .4 - Math.cos(q) * r.dx * 1.6, Math.sin(q) * .9, ay + Math.PI, Math.cos(q) * .9, .25, 1.6, .25), c: '#3a2614' }); }
        for (let i = 0; i < 6; i++) { const s = 13 + i * .6, side = i % 2 ? 1 : -1; P.push({ g: E.geo.cylLo, m: M(r.x + r.dx * s + r.dz * side * .9, 1.4, r.z + r.dz * s - r.dx * side * .9, 0, ay, side * 1, .12, 2.6, .12), c: '#6b4a2c' }); } P.push({ g: E.geo.ico, m: M(r.tip.x - r.dx * 1.5, 1.5, r.tip.z - r.dz * 1.5, 0, 0, 0, 2.2, 1.4, 2.2), c: '#8a7a3a', jit: .3 });
        for (let s = 0; s <= 15; s += 1.5) sol(r.x + r.dx * s, r.z + r.dz * s, 1.15); sol(r.x, r.z, 1.7); }
      // Steinkreis
      if (LM.kreis) { const k = LM.kreis; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, x = k.x + Math.sin(a) * 4, z = k.z + Math.cos(a) * 4, h = 1.5 + R() * .9; P.push({ g: E.geo.box, m: M(x, h / 2, z, (R() - .5) * .1, a, (R() - .5) * .1, .8, h, .5), c: '#8a8a80', jit: .25 }); sol(x, z, .55); } P.push({ g: E.geo.cyl, m: M(k.x, .12, k.z, 0, 0, 0, .9, .24, .9), c: '#9a9a8a' }); }
      // Baum mit rotem Band
      let ribbon = null;
      if (LM.band) { const b = LM.band; P.push({ g: E.geo.cyl, m: M(b.x, 3.5, b.z, 0, 0, 0, .45, 7, .45), c: '#6a4428', jit: .25 }, { g: E.geo.ico, m: M(b.x, 7.6, b.z, 0, 1, 0, 3, 2.4, 3), c: '#3c8f45', jit: .25 }, { g: E.geo.torus, m: M(b.x, 1.7, b.z, Math.PI / 2, 0, 0, .5, .5, 1.6), c: '#e01e2e' }, { g: E.geo.torus, m: M(b.x, 2.1, b.z, Math.PI / 2, 0, 0, .49, .49, 1.6), c: '#e01e2e' });
        ribbon = new THREE.Mesh(E.merge([{ g: E.geo.box, m: M(.25, -.45, 0, 0, 0, .2, .14, .9, .02), c: '#e01e2e' }, { g: E.geo.box, m: M(-.05, -.5, 0, 0, 0, -.15, .14, 1, .02), c: '#ff3a4a' }]), E.vcMat); ribbon.position.set(b.x, 1.9, b.z + .5); S.add(ribbon); sol(b.x, b.z, .6); }
      // Bäume, Lichtungen
      const clear = []; for (let i = 0; i < 4; i++) clear.push({ x: (R() * 2 - 1) * HW * .7, z: (R() * 2 - 1) * HW * .7, r: 5 + R() * 3 });
      const treeOk = (x, z) => streamDist(x, z) > 3.4 && Math.hypot(x - start.x, z - start.z) > 5 && !anchors.some(a => Math.hypot(a.x - x, a.z - z) < 5.5) && !clues.some(c => Math.hypot(c.x - x, c.z - z) < 3.5) && !solids.some(s => Math.hypot(s.x - x, s.z - z) < s.r + 2.2) && !clear.some(c => Math.hypot(c.x - x, c.z - z) < c.r) && z > -HW + 5 && (!LM.kreis || Math.hypot(LM.kreis.x - x, LM.kreis.z - z) > 6.5) && (!LM.hohl || Math.hypot(LM.hohl.cx - x, LM.hohl.cz - z) > 5);
      const nTree = Math.round((HW * 2) * (HW * 2) / 24); let placed = 0;
      for (let i = 0; i < nTree * 2 && placed < nTree; i++) {
        const x = (R() * 2 - 1) * (HW - 1), z = (R() * 2 - 1) * (HW - 1); if (!treeOk(x, z)) continue; placed++;
        const h = 4 + R() * 5, tr = .2 + R() * .2, palm = R() < .25;
        if (palm) { P.push({ g: E.geo.cylLo, m: M(x, h / 2, z, (R() - .5) * .2, 0, (R() - .5) * .2, tr * .8, h, tr * .8), c: '#8a6a3a' }); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + R(); P.push({ g: E.geo.box, m: M(x + Math.sin(a) * 1, h - .1, z + Math.cos(a) * 1, .4, a, 0, .5, .06, 2.4), c: '#3f9a3a' }); } }
        else { P.push({ g: E.geo.cylLo, m: M(x, h / 2, z, 0, 0, 0, tr, h, tr), c: '#5a3d22' }, { g: E.geo.ico, m: M(x, h + .6, z, 0, R() * 3, 0, 1.6 + R() * 1.3, 1.3 + R(), 1.6 + R() * 1.3), c: ['#2f7d3a', '#3c8f45', '#25663a', '#4a9a3a'][i % 4], jit: .25 }); }
        sol(x, z, tr + .35);
      }
      for (let i = 0; i < 70; i++) { const a = R() * TAU, rr = HW + 1 + R() * 6, x = clamp(Math.sin(a) * rr * 1.2, -HW - 6, HW + 6), z = clamp(Math.cos(a) * rr * 1.2, -HW + 1, HW + 6), h = 6 + R() * 5; P.push({ g: E.geo.cylLo, m: M(x, h / 2, z, 0, 0, 0, .4, h, .4), c: '#4a3220' }, { g: E.geo.ico, m: M(x, h + 1, z, 0, R() * 3, 0, 3, 2.4, 3), c: '#25663a', jit: .25 }); }
      for (let i = 0; i < (short ? 90 : 180); i++) { const x = (R() * 2 - 1) * HW, z = (R() * 2 - 1) * HW; if (streamDist(x, z) < 2 || clues.some(c => Math.hypot(c.x - x, c.z - z) < 2.5) || z < -HW + 3) continue; if (R() < .5) P.push({ g: E.geo.ico, m: M(x, .25, z, 0, R() * 3, 0, .6 + R() * .6, .45 + R() * .3, .6 + R() * .6), c: '#3d7a2e', jit: .3 }); else for (let k = 0; k < 4; k++) P.push({ g: E.geo.cone, m: M(x + (R() - .5) * .5, .35, z + (R() - .5) * .5, (R() - .5) * .8, 0, (R() - .5) * .8, .08, .9, .08), c: '#5aa040' }); }
      S.add(new THREE.Mesh(E.merge(P), E.vcMat));
      // Truhen, Grablöcher
      const chestG = E.merge([{ g: E.geo.box, m: M(0, .3, 0, 0, 0, 0, 1, .6, .7), c: '#7a4a24', jit: .2 }, { g: E.geo.box, m: M(0, .3, .36, 0, 0, 0, 1.02, .12, .02), c: '#ffcf4a' }, { g: E.geo.box, m: M(0, .3, -.36, 0, 0, 0, 1.02, .12, .02), c: '#ffcf4a' }, { g: E.geo.box, m: M(0, .62, 0, 0, 0, 0, .3, .3, .3), c: '#ffe27a' }, { g: E.geo.sph, m: M(-.2, .7, .1, 0, 0, 0, .14), c: '#ffd24a' }, { g: E.geo.sph, m: M(.2, .7, -.1, 0, 0, 0, .12), c: '#ffd24a' }]);
      const chestMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x2a1a00 });
      clues.forEach(c => { c.mesh = new THREE.Mesh(chestG, chestMat); c.mesh.visible = false; c.mesh.position.set(c.x, -.8, c.z); S.add(c.mesh); });
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: E.glowTex(), color: 0xffe080, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(3); glow.visible = false; S.add(glow);
      const HMAX = 30, holes = [], holeIM = new THREE.InstancedMesh(E.geo.sph, E.mat('#4a3018'), HMAX); holeIM.count = 0; S.add(holeIM);
      const dm = new THREE.Object3D();
      // ---- Kompass & Karte (eigene DOM-Elemente, werden in dispose entfernt)
      const host = document.getElementById('trial') || document.body;
      const ui = document.createElement('div'); ui.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1';
      const comp = document.createElement('canvas'); comp.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);border-radius:12px;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.4)';
      const mapCv = document.createElement('canvas'); mapCv.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;border-radius:14px;box-shadow:0 6px 30px rgba(0,0,0,.6);display:none';
      ui.appendChild(mapCv); ui.appendChild(comp); host.appendChild(ui);
      const cc = comp.getContext('2d'), mc = mapCv.getContext('2d'); let cw = 240, ch = 34, ms = 300, dpr = 1, mapBg = null, mapOpen = false;
      function layout() {
        const W = E.W, H = E.H; dpr = Math.min(2, window.devicePixelRatio || 1);
        cw = Math.round(clamp(W * .42, 190, 320)); ch = 34; comp.width = cw * dpr; comp.height = ch * dpr; comp.style.width = cw + 'px'; comp.style.height = ch + 'px';
        comp.style.bottom = (ctx.touch && W < H ? 132 : ctx.touch ? 12 : 14) + 'px';
        if (ctx.touch && W > H) { comp.style.left = '50%'; comp.style.transform = 'translateX(-62%)'; } else { comp.style.left = '50%'; comp.style.transform = 'translateX(-50%)'; }
        const top0 = W < H ? 170 : H < 500 ? 108 : 124; ms = Math.round(Math.max(180, Math.min(W * .94, H - top0 - 10 - (W < H ? 150 : 0), 560))); mapCv.width = ms * dpr; mapCv.height = ms * dpr; mapCv.style.width = ms + 'px'; mapCv.style.height = ms + 'px'; mapCv.style.top = top0 + 'px'; mapCv.style.transform = 'translateX(-50%)';
        mapBg = null;
      }
      const mp = (x, z) => [(x + HW) / (2 * HW) * ms, (z + HW) / (2 * HW) * ms];
      function drawMapBg() {
        const cv = document.createElement('canvas'); cv.width = ms * dpr; cv.height = ms * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr);
        c.fillStyle = '#e8d6a8'; c.fillRect(0, 0, ms, ms); const r2 = E.rand(seed + 7);
        for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(80,110,50,${.08 + r2() * .12})`; const x = r2() * ms, y = r2() * ms; c.beginPath(); c.arc(x, y, 2 + r2() * 5, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(90,80,60,.55)'; c.fillRect(0, 0, ms, ms * 1.6 / (2 * HW));
        c.strokeStyle = '#3f8fc8'; c.lineWidth = Math.max(3, ms / 90); c.lineCap = 'round'; c.beginPath(); for (let z = -HW + 4; z <= HW; z += 1) { const [x, y] = mp(sx(z), z); z === -HW + 4 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
        const fs = Math.max(16, ms / 18), ls = Math.max(10, ms / 42);
        c.textAlign = 'center'; c.textBaseline = 'middle';
        for (const a of anchors) { if (a.hidden) continue; const [x, y] = mp(a.x, a.z); c.font = `${fs}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.fillText(a.ic, x, y); c.font = `800 ${ls}px Inter,sans-serif`; c.fillStyle = '#3a2410'; const tw = c.measureText(a.nm).width / 2 + 3; c.fillText(a.nm, clamp(x, tw, ms - tw), y + fs * .8); }
        if (LM.riese) { const r = LM.riese, [x0, y0] = mp(r.x, r.z), [x1, y1] = mp(r.tip.x, r.tip.z); c.strokeStyle = 'rgba(100,70,40,.8)'; c.lineWidth = Math.max(3, ms / 70); c.setLineDash([]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.fillStyle = '#3a2410'; c.font = `700 ${ls * .9}px Inter,sans-serif`; c.fillText('Krone', x1, y1 - ls); }
        if (LM.hohl) { const h = LM.hohl, [x0, y0] = mp(h.x, h.z), [x1, y1] = mp(h.x + h.hx * 4, h.z + h.hz * 4); c.strokeStyle = 'rgba(40,30,20,.7)'; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); }
        // Windrose
        const wr = Math.max(16, ms / 14), wx0 = ms - wr - 8, wy0 = wr + 10; c.fillStyle = '#3a2410'; c.beginPath(); c.moveTo(wx0, wy0 - wr); c.lineTo(wx0 + wr * .3, wy0); c.lineTo(wx0, wy0 + wr * .4); c.lineTo(wx0 - wr * .3, wy0); c.closePath(); c.fill(); c.font = `900 ${ls * 1.2}px Inter,sans-serif`; c.fillText('N', wx0, wy0 + wr * .9);
        c.strokeStyle = '#6a4a20'; c.lineWidth = 4; c.strokeRect(2, 2, ms - 4, ms - 4);
        c.font = `800 ${ls}px Inter,sans-serif`; c.fillStyle = '#3a2410'; c.textAlign = 'left'; c.fillText('Skizze · 1 Schritt = 1 m', 10, ls + 6);
        mapBg = cv;
      }
      function drawMap() {
        if (!mapBg) drawMapBg(); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, mapCv.width, mapCv.height); mc.drawImage(mapBg, 0, 0); mc.setTransform(dpr, 0, 0, dpr, 0, 0);
        mc.strokeStyle = '#a01818'; mc.lineWidth = 2; for (const h of holes) { const [x, y] = mp(h.x, h.z); mc.beginPath(); mc.moveTo(x - 4, y - 4); mc.lineTo(x + 4, y + 4); mc.moveTo(x + 4, y - 4); mc.lineTo(x - 4, y + 4); mc.stroke(); }
        for (const c of clues) if (c.found) { const [x, y] = mp(c.x, c.z); mc.fillStyle = '#ffcf4a'; mc.beginPath(); mc.arc(x, y, 6, 0, TAU); mc.fill(); mc.strokeStyle = '#6a4a00'; mc.stroke(); }
        const [x, y] = mp(Px, Pz), a = Math.atan2(Math.sin(heading), Math.cos(heading)); mc.save(); mc.translate(x, y); mc.rotate(-a + Math.PI); mc.fillStyle = '#e0302a'; mc.strokeStyle = '#fff'; mc.lineWidth = 2; mc.beginPath(); mc.moveTo(0, 10); mc.lineTo(6, -6); mc.lineTo(0, -2); mc.lineTo(-6, -6); mc.closePath(); mc.fill(); mc.stroke(); mc.restore();
      }
      function drawCompass() {
        const c = cc; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cw, ch); c.fillStyle = 'rgba(8,26,16,.78)'; c.beginPath(); c.roundRect ? c.roundRect(0, 0, cw, ch, 12) : c.rect(0, 0, cw, ch); c.fill();
        const camB = Math.PI - yaw, toX = rel => cw / 2 + rel / (Math.PI / 2) * (cw / 2 - 10);
        const wrap = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = 0; i < 16; i++) { const b = i / 16 * TAU, rel = wrap(b - camB); if (Math.abs(rel) > Math.PI / 2) continue; const x = toX(rel); if (i % 4 === 0) { c.font = '900 15px Inter,sans-serif'; c.fillStyle = i === 0 ? '#ff6b4a' : '#ffffff'; c.fillText(['N', 'O', 'S', 'W'][i / 4], x, ch / 2 + 1); } else if (i % 2 === 0) { c.font = '800 10px Inter,sans-serif'; c.fillStyle = '#a9c9b4'; c.fillText(['NO', 'SO', 'SW', 'NW'][(i - 2) / 4], x, ch / 2 + 1); } else { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x - .5, ch - 8, 1, 5); } }
        const cl = clues[ci]; if (cl && !cl.found) for (const id of cl.refs) { const L = LM[id]; if (!L) continue; const rel = wrap(Math.atan2(L.x - Px, -(L.z - Pz)) - camB); const x = toX(clamp(rel, -Math.PI / 2, Math.PI / 2)); c.font = '16px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.globalAlpha = Math.abs(rel) > Math.PI / 2 ? .45 : 1; c.fillStyle = '#ffcf4a'; c.fillRect(x - 11, 1, 22, 3); c.fillText(L.ic, x, ch / 2 + 1); c.globalAlpha = 1; }
        c.fillStyle = '#ffcf4a'; c.beginPath(); c.moveTo(cw / 2 - 5, ch); c.lineTo(cw / 2 + 5, ch); c.lineTo(cw / 2, ch - 6); c.fill();
      }
      layout(); ctx.onResize(layout);
      // ---- Spielfigur
      const F = ctx.figure(Object.assign({}, ctx.who)); S.add(F.group);
      let Px = start.x, Pz = start.z, Py = 0, vx = 0, vz = 0, heading = Math.PI, yaw = Math.PI, pitch = .42, time = 0, pen = 0, ci = 0, found = 0, starsN = 0, finished = false, dig = 0, wrong = 0, nextT = 0, hintS = '', compT = 0, mapT = 0;
      const camT = new THREE.Vector3(), lookT = new THREE.Vector3();
      const starsAt = k => Math.round(k * ctx.max / nChest);
      function onBridge(x, z) { const b = LM.bruecke; if (!b) return false; const dx = x - b.x, dz = z - b.z, along = dx * b.ax + dz * b.az, perp = -dx * b.az + dz * b.ax; return Math.abs(along) < 3.5 && Math.abs(perp) < 1; }
      function inWater(x, z) { return (streamDist(x, z) < 1.35 && !onBridge(x, z)) || Math.hypot(x - wx, (z - (-HW + 4)) * 1.06) < 3.5; }
      function placeCam(dt) {
        const cp = Math.cos(pitch), fx = Math.sin(yaw), fz = Math.cos(yaw); let dist = 5.6;
        // Kamera nicht hinter Stämmen/Felsen verstecken (2D-Strahl gegen Kreise)
        const rx = -fx, rz = -fz, hor = cp * dist; for (const s of solids) { const lx = s.x - Px, lz = s.z - Pz, tc = lx * rx + lz * rz; if (tc < 0 || tc > hor + s.r) continue; const d2 = lx * lx + lz * lz - tc * tc, rr = (s.r + .3) * (s.r + .3); if (d2 > rr) continue; const th = tc - Math.sqrt(rr - d2); if (th < cp * dist) dist = Math.max(1.6, th / cp); }
        camT.set(Px - fx * cp * dist, Py + 1.3 + Math.sin(pitch) * dist, Pz - fz * cp * dist); lookT.set(Px + fx * 2, Py + 1.2, Pz + fz * 2);
        const k = dt ? Math.min(1, dt * 8) : 1; cam.position.lerp(camT, k); cam.lookAt(lookT);
      }
      function setHint(s) { if (s !== hintS) { hintS = s; ctx.hud.hint(s); } }
      function clueHint() { const c = clues[ci]; return c ? '📜 Hinweis ' + (ci + 1) + '/' + nChest + ': ' + c.text : ''; }
      placeCam(0); F.group.position.set(Px, 0, Pz); F.group.rotation.y = heading; F.anim(0, 'idle'); drawCompass();
      setHint(clueHint());
      const api = {
        idle(dt) { time += dt; fallTex.offset.y += dt * 1.6; stTex.offset.y -= dt * .5; if (ribbon) ribbon.rotation.x = Math.sin(time * 4) * .3; F.anim(dt, finished ? 'cheer' : 'idle'); clues.forEach(c => { if (c.found) c.mesh.position.y = lerp(c.mesh.position.y, 0, Math.min(1, dt * 3)); }); placeCam(dt); },
        update(dt) {
          time += dt; fallTex.offset.y += dt * 1.6; stTex.offset.y -= dt * .5; if (ribbon) ribbon.rotation.x = Math.sin(time * 4) * .3 + Math.sin(time * 9) * .08;
          const look = I.consumeLook(); yaw -= look.dx * .0045; pitch = clamp(pitch + look.dy * .003, .12, 1.1);
          clues.forEach(c => { if (c.found) { c.mesh.position.y = lerp(c.mesh.position.y, 0, Math.min(1, dt * 3)); c.mesh.rotation.y += dt * .6; } });
          if (glow.visible) glow.material.opacity = Math.max(0, glow.material.opacity - dt * .4);
          if (I.pressed('map')) { mapOpen = !mapOpen; mapCv.style.display = mapOpen ? 'block' : 'none'; comp.style.display = mapOpen ? 'none' : 'block'; ctx.S.click(); }
          if (finished) { F.anim(dt, 'cheer'); placeCam(dt); return; }
          const used = ctx.t + pen, left = Math.max(0, limit - used); ctx.hud.time(left, left / limit);
          if (left <= 0) { end(starsN, 'time'); return; }
          if (nextT > 0) { nextT -= dt; if (nextT <= 0) { ci++; if (ci >= nChest) { end(ctx.max, 'done'); return; } setHint(clueHint()); ctx.hud.toast('📜 Neuer Hinweis!', 'good'); } }
          // Graben
          const digging = I.down('act') && nextT <= 0; let pose = 'idle';
          if (digging) {
            const water = inWater(Px, Pz) || onBridge(Px, Pz);
            if (water) { if (dig === 0) { ctx.hud.toast('Hier ist nur Wasser!', 'bad'); dig = -1; } }
            else if (dig >= 0) {
              dig += dt / digT; pose = 'work'; ctx.hud.meter('dig', dig, '⛏ Graben …', '#ffcf4a');
              if (dig >= 1) {
                dig = -1; const c = clues[ci], dd = Math.hypot(c.x - Px, c.z - Pz);
                if (holes.length < HMAX) { holes.push({ x: Px, z: Pz }); dm.position.set(Px, .02, Pz); dm.rotation.set(0, R() * 3, 0); dm.scale.set(.55, .18, .55); dm.updateMatrix(); holeIM.setMatrixAt(holes.length - 1, dm.matrix); holeIM.count = holes.length; holeIM.instanceMatrix.needsUpdate = true; }
                if (dd < TOL) { c.found = true; found++; c.mesh.visible = true; c.mesh.position.set(c.x, -.8, c.z); glow.position.set(c.x, 1, c.z); glow.visible = true; glow.material.opacity = 1; starsN = starsAt(found); ctx.hud.stars(starsN); ctx.S.reveal(); ctx.hud.toast('💰 Truhe gefunden!', 'good'); nextT = 1.4; setHint('💰 Schatz! Gleich kommt der nächste Hinweis …'); }
                else { wrong++; pen += pen0; ctx.S.bad(); ctx.hud.toast((dd > 13 ? '🥶 Kalt! ' : dd > 6 ? '🙂 Warm … ' : '🔥 Heiß! ') + 'Nur Gummiwürmer. +' + pen0 + ' s', 'bad'); }
                ctx.hud.meter('dig', null);
              }
            }
          } else { if (dig !== 0) ctx.hud.meter('dig', null); dig = 0; }
          // Bewegung (relativ zur Kamera)
          const mv = I.move, fx = Math.sin(yaw), fz = Math.cos(yaw), run = I.down('run') || I.joyFull;
          let sp = digging && dig >= 0 ? 0 : (run ? 6.2 : 4.1); const wet = inWater(Px, Pz); if (wet) sp *= .5;
          const wx2 = (fx * mv.y - fz * mv.x) * sp, wz2 = (fz * mv.y + fx * mv.x) * sp, k = Math.min(1, dt * 10);
          vx = lerp(vx, wx2, k); vz = lerp(vz, wz2, k); Px += vx * dt; Pz += vz * dt;
          for (const s of solids) { const dx = Px - s.x, dz = Pz - s.z, dd = Math.hypot(dx, dz), m = s.r + .35; if (dd < m && dd > 1e-4) { Px = s.x + dx / dd * m; Pz = s.z + dz / dd * m; } }
          Px = clamp(Px, -HW + 1, HW - 1); Pz = clamp(Pz, -HW + 1.5, HW - 1);
          const hs = Math.hypot(vx, vz); if (hs > .3) heading = E.angLerp(heading, Math.atan2(vx, vz), Math.min(1, dt * 10));
          Py = lerp(Py, onBridge(Px, Pz) ? .5 : wet ? -.25 : 0, Math.min(1, dt * 10));
          if (pose !== 'work') pose = hs > 4.8 ? 'run' : hs > .4 ? 'walk' : 'idle';
          F.group.position.set(Px, Py, Pz); F.group.rotation.y = heading; F.anim(dt, pose, hs);
          placeCam(dt);
          // Schrittzähler: Abstand zur nächsten Landmarke
          let na = null, nd = 1e9; for (const a of anchors) { const dd = Math.hypot(a.x - Px, a.z - Pz); if (dd < nd) { nd = dd; na = a; } }
          if (na && nd < 16) ctx.hud.meter('steps', 1 - nd / 16, '📍 ' + na.kz + ': ' + Math.round(nd) + ' Schritt' + (Math.round(nd) === 1 ? '' : 'e'), '#37d6e8'); else ctx.hud.meter('steps', null);
          compT -= dt; if (compT <= 0) { compT = 1 / 30; drawCompass(); }
          if (mapOpen) { mapT -= dt; if (mapT <= 0) { mapT = 1 / 15; drawMap(); } }
        },
        debug: () => ({ P: [+Px.toFixed(1), +Pz.toFixed(1)], ci, found, wrong, pen, HW, clues: clues.map(c => ({ k: c.key, x: +c.x.toFixed(1), z: +c.z.toFixed(1), t: c.text, f: !!c.found })), lm: Object.keys(LM), map: mapOpen }),
        details: () => ({ fehlgrabungen: wrong }),
        dispose() { ui.remove(); fallTex.dispose(); stTex.dispose(); },
        bot: botPilot
      };
      function end(st, why) { finished = true; mapOpen = false; mapCv.style.display = 'none'; comp.style.display = 'block'; ctx.hud.meter('dig', null); ctx.finish(st, why); }
      // ---- Testpilot: läuft mit Joystick/Kamera zum Versteck (liest Zielposition), öffnet kurz die Karte, gräbt
      let bLast = { x: Px, z: Pz }, bT = 0, bDet = 0, bN = 0, bSide = 1, bClue = -1, bClueT = 0;
      function botPilot(dt) {
        const press = [], hold = {}; const c = clues[ci];
        if (!c || c.found || nextT > 0) return { move: { x: 0, y: 0 }, press: mapOpen ? ['map'] : [] };
        if (bClue !== ci) { bClue = ci; bClueT = 0; } bClueT += dt;
        if (bClueT < .1 && !mapOpen) press.push('map'); if (bClueT > 1.3 && mapOpen) press.push('map');
        let dx = c.x - Px, dz = c.z - Pz; const dd = Math.hypot(dx, dz);
        if (dd < .8) { hold.act = true; return { move: { x: 0, y: 0 }, hold, press }; }
        dx /= dd; dz /= dd;
        let ax = 0, az = 0; for (const s of solids) { const ox = Px - s.x, oz = Pz - s.z, od = Math.hypot(ox, oz) - s.r; if (od < 1.6 && od > -1) { const w = (1.6 - od) / 1.6; ax += ox / (od + s.r) * w * 1.4; az += oz / (od + s.r) * w * 1.4; } }
        if (dd > 2) { dx += ax; dz += az; }
        bT += dt; if (bT > 1) { if (Math.hypot(Px - bLast.x, Pz - bLast.z) < .8 && dd > 1.5) { bN++; if (bN % 3 === 0) bSide = -bSide; bDet = 1.2 + Math.min(4, bN) * .6; } else if (bDet <= 0) bN = 0; bLast = { x: Px, z: Pz }; bT = 0; }
        if (bDet > 0) { bDet -= dt; const tx = -dz * bSide, tz = dx * bSide; dx = tx + dx * .2; dz = tz + dz * .2; }
        const m = Math.hypot(dx, dz) || 1; dx /= m; dz /= m;
        const fx = Math.sin(yaw), fz = Math.cos(yaw), my = dx * fx + dz * fz, mx = -dx * fz + dz * fx;
        const want = Math.atan2(dx, dz); const da = ((want - yaw + Math.PI) % TAU + TAU) % TAU - Math.PI;
        if (dd > 5) hold.run = true; const slow = dd < 2.5 ? .6 : 1;
        return { move: { x: clamp(mx, -1, 1) * slow, y: clamp(my, -1, 1) * slow }, hold, press, look: { dx: -clamp(da * 3, -1, 1) * 300 * dt, dy: 0 } };
      }
      return api;
    }
  });
})();

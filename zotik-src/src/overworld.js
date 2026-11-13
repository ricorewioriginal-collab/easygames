/* Weltkarte (wie die Oberwelt klassischer JRPGs): ein Kontinent, über den Wegpfade von Welt zu Welt führen.
   Jede Welt steht als Wahrzeichen-Insel am Weg und lässt sich betreten; ringsum liegt das Meer.
   Auch zu den Märchen-Inseln führt ein Pfad über eine Landzunge; an den Stegen ruft man die Nautilux und setzt Kurs auf jede erreichte Welt. */
import { ISLE } from './minis.js';

/* Lage der Welten auf der Karte (Einheiten wie in den Welten: ~6 Schritte je Sekunde) */
export const OWN = { 1: [0, 150], 13: [-34, 178], 2: [-48, 100], 14: [-92, 124], 3: [0, 52], 4: [58, 12], 5: [22, -44], 6: [-42, -82], 7: [8, -132], 8: [66, -166], 9: [22, -216], 10: [-40, -244], 11: [-8, -294] };
const ROUTE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], SIDE = [[1, 13], [2, 14]];
/* Märchen-Inseln draußen im Meer, je neben ihrem Kapitel (link) */
const MWOFF = { 21: [-70, 18], 22: [-72, -14], 24: [-74, 6], 26: [76, -6], 23: [78, 10], 27: [-80, 0], 25: [78, -10], 28: [-76, 8] };
export const OW_WL = -.35;

export function createOverworld(C) {
  const { T, M, mk, G, glow, scene, MINI, TX } = C;
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const nz = (x, z) => Math.sin(x * .045 + Math.sin(z * .031) * 1.7) * Math.cos(z * .041 - x * .013) + .5 * Math.sin(x * .11 + z * .09);
  const segs = []; const addSeg = (a, b) => segs.push([OWN[a], OWN[b], a, b]);
  for (let i = 0; i < ROUTE.length - 1; i++) addSeg(ROUTE[i], ROUTE[i + 1]); for (const [a, b] of SIDE) addSeg(a, b);
  const dSeg = (x, z, [p, q]) => { const vx = q[0] - p[0], vz = q[1] - p[1], L = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((x - p[0]) * vx + (z - p[1]) * vz) / L)); return Math.hypot(x - p[0] - vx * t, z - p[1] - vz * t); };
  const dPath = (x, z) => { let d = 1e9; for (const s of segs) d = Math.min(d, dSeg(x, z, s)); return d; };
  const nearest = (x, z) => { let best = 1, bd = 1e9; for (const k in OWN) { const d = Math.hypot(x - OWN[k][0], z - OWN[k][1]); if (d < bd) { bd = d; best = +k; } } return [best, bd]; };
  /* Höhe: Land entlang der Wegpfade (wellige Küste), Buchten, außen tiefes Meer */
  const H = (x, z) => { const d = dPath(x, z), w = 30 + nz(x, z) * 9, bay = Math.max(0, Math.sin(x * .07) * Math.cos(z * .05)) * 10;
    const land = sm(w + 8, w - 6 - bay, d); const hill = .8 + nz(x * 1.3, z * 1.3) * .7 + sm(18, 44, d) * (1.4 + nz(z, x) * 1.6);
    return -4 + land * (4 + hill); };
  const water = (x, z) => H(x, z) < OW_WL + .05;

  function build(o) {
    const g = new T.Group(); scene.add(g);
    /* Märchen-Inseln: Lage neben ihrem Kapitel, dazu ein Wegpfad (Landzunge) von dort aus */
    const ISL = [];
    for (const k in MWOFF) { const n = +k, w = o.mw(n); if (!w) continue; const b = OWN[w.link] || OWN[1], [ox, oz] = MWOFF[k], p = [b[0] + ox, b[1] + oz + 26]; ISL.push([n, p]); if (!segs.some(s => s[3] === n)) segs.push([b, p, w.link, n]); }
    /* Gelände mit Farbe je Region (Gras der nächsten Welt), Sand an der Küste, Pfade */
    const W = 380, D = 600, cx = 0, cz = -70, nx = 150, nzs = 236, geo = new T.PlaneGeometry(W, D, nx, nzs); geo.rotateX(-Math.PI / 2); geo.translate(cx, 0, cz);
    const P = geo.attributes.position, col = new Float32Array(P.count * 3), c = new T.Color(), c2 = new T.Color(), sand = new T.Color(0xe6d49a), path = new T.Color(0xb8945a), deep = new T.Color(0x2a5a6a);
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), h = H(x, z); P.setY(i, h);
      let wsum = 0; c.setRGB(0, 0, 0); for (const k in OWN) { const d = Math.hypot(x - OWN[k][0], z - OWN[k][1]), w = 1 / Math.pow(d + 12, 3); c2.setHex((ISLE[k] || ISLE[1]).g); c.r += c2.r * w; c.g += c2.g * w; c.b += c2.b * w; wsum += w; } c.multiplyScalar(1 / wsum);
      c.lerp(c2.setHex(0x4a8a3a), .25); const n = nz(x * 3, z * 3) * .08; c.offsetHSL(0, 0, n);
      if (h < .6) c.lerp(sand, sm(.6, .15, h)); if (h < OW_WL - .2) c.lerp(deep, sm(OW_WL - .2, -3, h));
      const dp = dPath(x, z); if (dp < 2.6 && h > .3) c.lerp(path, sm(2.6, 1.2, dp) * .85);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const terr = new T.Mesh(geo, TX ? TX.tri('grass', 0xffffff, { vc: 1, s: .22, gain: 2.1, n: .8, r: .95 }) : new T.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); terr.receiveShadow = true; scene.add(terr);
    /* Meer */
    const wcv = document.createElement('canvas'); wcv.width = wcv.height = 256; { const x = wcv.getContext('2d'); x.fillStyle = '#2a7ab8'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${190 + Math.random() * 60 | 0},${225 + Math.random() * 30 | 0},255,${.12 + Math.random() * .3})`; x.lineWidth = 1 + Math.random() * 2; const a = Math.random() * 256, b = Math.random() * 256, w = 10 + Math.random() * 26; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + w / 2, b - 4, a + w, b); x.stroke(); } }
    const wtex = new T.CanvasTexture(wcv); wtex.wrapS = wtex.wrapT = T.RepeatWrapping; wtex.repeat.set(70, 90);
    const sea = new T.Mesh(new T.PlaneGeometry(1400, 1800), new T.MeshStandardMaterial({ map: wtex, color: 0xffffff, roughness: .3, metalness: .1, transparent: true, opacity: .9 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, OW_WL, cz); g.add(sea);
    /* Wälder (zwei Instanz-Gruppen, ein Zeichenaufruf je Gruppe) */
    const TR = []; for (let i = 0; i < 900 && TR.length < 420; i++) { const x = cx + (Math.random() - .5) * W, z = cz + (Math.random() - .5) * D, h = H(x, z); if (h < 1 || dPath(x, z) < 5 || nearest(x, z)[1] < 16) continue; TR.push([x, h, z, .8 + Math.random() * .8]); }
    const trunk = new T.InstancedMesh(G.cyl0, M(0x5a3e26), TR.length), crown = new T.InstancedMesh(G.ico || G.sph, M(0xffffff, { r: .9 }), TR.length), q = new T.Object3D();
    const setTree = (i, on) => { const [x, h, z, s0] = TR[i], s = on ? s0 : 1e-4; q.position.set(x, h + 1.1 * s, z); q.rotation.set(0, 0, 0); q.scale.set(.25 * s, 2.2 * s, .25 * s); q.updateMatrix(); trunk.setMatrixAt(i, q.matrix);
      q.position.set(x, h + 2.9 * s, z); q.rotation.y = i; q.scale.set(1.5 * s, 1.7 * s, 1.5 * s); q.updateMatrix(); crown.setMatrixAt(i, q.matrix); };
    /* Kampfbühne freiräumen: Bäume im Umkreis ausblenden (danach zurück) */
    const clearTrees = (x, z, r) => { const L = []; TR.forEach((t, i) => { if (Math.hypot(t[0] - x, t[2] - z) < r) { setTree(i, false); L.push(i); } }); trunk.instanceMatrix.needsUpdate = crown.instanceMatrix.needsUpdate = true;
      return () => { for (const i of L) setTree(i, true); trunk.instanceMatrix.needsUpdate = crown.instanceMatrix.needsUpdate = true; }; };
    TR.forEach(([x, h, z, s], i) => { setTree(i, true);
      const [k] = nearest(x, z); c.setHex((ISLE[k] || ISLE[1]).lf).offsetHSL(0, 0, (Math.random() - .5) * .1); crown.setColorAt(i, c); });
    for (const m of [trunk, crown]) { m.castShadow = true; m.frustumCulled = false; g.add(m); }
    /* Welten als Wahrzeichen-Inseln am Weg, Märchen-Inseln im Meer */
    const marks = [], sealC = [];
    for (const k in OWN) { const n = +k, [x, z] = OWN[k], isl = MINI.island(n); isl.scale.setScalar(6.5); isl.position.set(x, H(x, z) - .4, z); g.add(isl);
      const open = o.open(n); if (!open) { const dome = mk(G.sph, M(0x6a3aaa, { e: 0x5a2aaa, ei: 1.2, t: .35 }), x, H(x, z), z, 14, 10, 14, false); g.add(dome); sealC.push([x, z, 13]); }
      g.add(glow((ISLE[n] || ISLE[1]).c, 12, x, H(x, z) + 9, z, .35)); marks.push({ n, x, z, open }); }
    for (const [n, [x, z]] of ISL) { const isl = MINI.island(n), open = o.open(n); isl.scale.setScalar(8); isl.position.set(x, Math.max(OW_WL + .2, H(x, z) - .4), z); g.add(isl);
      if (!open) { g.add(mk(G.sph, M(0x6a3aaa, { e: 0x5a2aaa, ei: 1.2, t: .35 }), x, H(x, z), z, 15, 11, 15, false)); sealC.push([x, z, 14]); }
      g.add(glow((ISLE[n] || ISLE[1]).c, 14, x, H(x, z) + 10, z, .4)); marks.push({ n, x, z, open, mw: 1 }); }
    /* Stege: an der Küste nahe jeder Welt, dort steigt man in die Nautilux */
    const docks = [];
    for (const mk0 of marks) { const bx = mk0.x, bz = mk0.z; let best = null;
      for (let a = 0; a < 6.283; a += .2) for (let r = 16; r < 60; r += 2) { const x = bx + Math.cos(a) * r, z = bz + Math.sin(a) * r; if (water(x, z)) { if (!best || r < best[2]) best = [x, z, r, a]; break; } }
      if (!best || docks.some(d => Math.hypot(d.x - best[0], d.z - best[1]) < 26)) continue; const [wx, wz, , a] = best, lx = wx - Math.cos(a) * 3, lz = wz - Math.sin(a) * 3, d = new T.Group(); d.position.set(lx, Math.max(OW_WL + .25, H(lx, lz)), lz); d.rotation.y = -a + Math.PI / 2;
      const wd = M(0x7a5232, { r: .9 }); d.add(mk(G.box, wd, 0, .1, 3, 2.2, .2, 8)); for (const s of [-1, 1]) for (const zz of [0, 3, 6]) d.add(mk(G.cyl0, M(0x4a3020), s * 1, -.6, zz, .14, 1.6, .14));
      d.add(mk(G.cyl0, M(0x4a3020), .9, .8, 6.6, .1, 1.6, .1)); d.add(glow(0x8ad0ff, 2.4, .9, 1.7, 6.6, .7)); g.add(d); docks.push({ x: wx, z: wz, lx, lz, n: mk0.n }); }
    const blk = (x, z) => x < cx - W / 2 + 6 || x > cx + W / 2 - 6 || z < cz - D / 2 + 6 || z > cz + D / 2 - 6 || water(x, z) || sealC.some(([sx, sz, r]) => Math.hypot(x - sx, z - sz) < r);
    let t0 = 0; const anim = t => { wtex.offset.x = Math.sin(t * .05) * .3; wtex.offset.y = t * .006; t0 = t; };
    /* kleine Karte fürs Menü/Minikarte */
    const mbg = (() => { const cv = document.createElement('canvas'); cv.width = 260; cv.height = 310; const x = cv.getContext('2d'); x.fillStyle = '#1e5a8a'; x.fillRect(0, 0, 260, 310);
      for (let j = 0; j < 310; j += 2) for (let i = 0; i < 260; i += 2) { const wx = (i - 130) * W / 260 + cx, wz = (j - 155) * D / 310 + cz, h = H(wx, wz); if (h > OW_WL) { x.fillStyle = h < .6 ? '#d8c890' : dPath(wx, wz) < 3 ? '#b8945a' : '#4a8a4a'; x.fillRect(i, j, 2, 2); } }
      for (const m of marks) { x.fillStyle = '#' + ((ISLE[m.n] || ISLE[1]).c).toString(16).padStart(6, '0'); x.beginPath(); x.arc((m.x - cx) * 260 / W + 130, (m.z - cz) * 310 / D + 155, m.mw ? 3 : 4, 0, 7); x.fill(); } cv.ow = [cx - W / 2, cz - D / 2, W, D]; return cv; })();
    return { g, terr, H, water, blocked: blk, marks, docks, anim, mbg, nearest, dPath, clearTrees };
  }
  return { build, H, water, OWN, MWOFF };
}

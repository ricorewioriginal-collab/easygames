/* Fahrzeuge für Pride City aus Sketchfab-Modellen (CC BY 4.0) bauen: je Auto eine GLB in public/assets/cars/ mit
   Karosserie (nach Material zusammengefasst) und vier Rädern „wheel_*“, vorne = +Z, Boden y = 0, Mitte zwischen den Achsen.
   Dazu vereinfachte Fassungen: „<id>_lo.glb“ (Verkehr am Handy, nah) und „<id>_far.glb“ (Verkehr in der Ferne). Texturen 512/256/128 px (WebP).
   Quellen (siehe public/CREDITS.md):
     traffic.glb      „Generic passenger car pack“ von Comrade1280
     police.glb       „Fairheaven LT '80 Cop Cruiser“ von Daniel Zhabotinsky
     police-sport.glb „Saba V12 '95 Interceptor“ von Daniel Zhabotinsky
   Aufruf: node scripts/cars.mjs <ordner mit den Quell-GLBs>
   (Quell-GLBs z. B. aus https://github.com/Amir4ikLIVE/sunset-run/tree/main/models, dort mit denselben Credits) */
import { NodeIO, Document, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, join, clearNodeTransform, weld, simplify, textureCompress, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = process.argv[2];
if (!SRC) { console.error('Aufruf: node scripts/cars.mjs <ordner mit traffic.glb, police.glb, police-sport.glb>'); process.exit(1); }
const OUT = new URL('../public/assets/cars/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

/* id → Quelle, Karosserie-Knoten (bei Paketen), Länge in m, Umfärben (Farbton, Sättigung, Helligkeit ×), front 'a' = Vorderseite umdrehen, simp = auch die volle Fassung vereinfachen */
const CARS = [
  { id: 'sedan', src: 'traffic', body: 'Sedan Body', len: 4.7 },
  { id: 'taxi', src: 'traffic', body: 'Sedan Body', len: 4.7, paint: [48, .92, 1.3] },
  { id: 'hatchback', src: 'traffic', body: 'Hatchback Body', len: 4.1 },
  { id: 'stationwagon', src: 'traffic', body: 'Wagon Body', len: 4.8 },
  { id: 'compact', src: 'traffic', body: 'Compact Body', len: 4.0, front: 'a' },
  { id: 'coupe', src: 'traffic', body: 'Coupe Body', len: 4.5 },
  { id: 'minivan', src: 'traffic', body: 'minivan body', len: 4.9 },
  { id: 'delivery', src: 'traffic', body: 'minivan body', len: 4.9, paint: [40, .04, 2.6] },
  { id: 'pickup', src: 'traffic', body: 'Pickup Body', len: 5.2 },
  { id: 'sport', src: 'traffic', body: 'Sport body', len: 4.5 },
  { id: 'suv', src: 'traffic', body: 'SUV Body', len: 4.9 },
  { id: 'offroad', src: 'traffic', body: 'Offroad Body', len: 4.3 },
  { id: 'police', src: 'police', len: 4.9, simp: .5, front: 'a' },
  { id: 'interceptor', src: 'police-sport', len: 4.6, simp: .45, front: 'a' },
];
const FLIP = new Set((process.env.FLIP || '').split(',').filter(Boolean));

const isWheel = (n) => /wheel/i.test(n) && !/steer/i.test(n);
const mul = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };
const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const S = (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
const RY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
/** Mittelpunkt der Mesh-Knoten unter einem Knoten (Welt) */
function boxOf(nodes) { const doc = new Document(); void doc; let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const n of nodes) { const b = getBounds(n); for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], b.min[i]); mx[i] = Math.max(mx[i], b.max[i]); } } return { min: mn, max: mx, c: mn.map((v, i) => (v + mx[i]) / 2) }; }
const meshNodes = (n) => { const out = []; n.traverse((c) => { if (c.getMesh()) out.push(c); }); return out; };

/* Farbton der Lackierung drehen (kräftigster häufiger Farbton → Wunsch) bzw. entsättigen/aufhellen */
async function repaint(tex, [hue, sat, bri]) {
  const img = sharp(Buffer.from(tex.getImage())); const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255]; };
  const hist = new Float32Array(36);
  for (let k = 0; k < data.length; k += 4) { const [h, s, v] = hsv(data[k], data[k + 1], data[k + 2]); if (s > .3 && v > .15) hist[Math.floor(h / 10) % 36]++; }
  let top = 0; for (let i = 1; i < 36; i++) if (hist[i] > hist[top]) top = i;
  const h0 = top * 10 + 5;
  for (let k = 0; k < data.length; k += 4) {
    const [h, s, v] = hsv(data[k], data[k + 1], data[k + 2]); let d = Math.abs(h - h0); if (d > 180) d = 360 - d;
    if (s > .25 && d < 30) {
      const nh = (hue + h - h0 + 360) % 360, ns = sat, nv = Math.min(1, v * bri), c = nv * ns, x = c * (1 - Math.abs(((nh / 60) % 2) - 1)), m = nv - c;
      const [r, g, b] = nh < 60 ? [c, x, 0] : nh < 120 ? [x, c, 0] : nh < 180 ? [0, c, x] : nh < 240 ? [0, x, c] : nh < 300 ? [x, 0, c] : [c, 0, x];
      data[k] = (r + m) * 255; data[k + 1] = (g + m) * 255; data[k + 2] = (b + m) * 255;
    }
  }
  tex.setImage(new Uint8Array(await sharp(data, { raw: info }).png().toBuffer())).setMimeType('image/png');
}

async function build(c, lo) {
  const doc = await io.read(`${SRC}/${c.src}.glb`), root = doc.getRoot(), scene = root.getDefaultScene();
  // Innenraum, Lenkrad und Kleinkram sieht man in der Stadt nicht: weg
  const all = meshNodes(scene).filter((n) => !/interior|steering|copstuff|badge|numberplate|caliper/i.test(n.getName()));
  /** Rad-Gruppe eines Mesh-Knotens: oberster Vorfahr mit „wheel“ im Namen (ein Rad kann aus mehreren Meshes bestehen) */
  const wheelOf = (n) => { let w = null; for (let q = n; q; q = q.getParentNode()) if (isWheel(q.getName())) w = q; return w; };
  const groups = new Map(); for (const n of all) { const w = wheelOf(n); if (w) { if (!groups.has(w)) groups.set(w, []); groups.get(w).push(n); } }
  let keep = all.filter((n) => !wheelOf(n)), wheelG = [...groups.values()];
  if (c.body) {
    let bodyN = null; scene.traverse((n) => { if (n.getName() === c.body) bodyN = n; });
    if (!bodyN) throw new Error(c.id + ': ' + c.body + ' fehlt');
    const bc = boxOf(meshNodes(bodyN)).c;
    wheelG = wheelG.map((g) => { const b = boxOf(g).c; return { g, d: Math.hypot(b[0] - bc[0], b[2] - bc[2]) }; }).sort((a, b) => a.d - b.d).slice(0, 4).map((w) => w.g);
    keep = meshNodes(bodyN);
  }
  if (wheelG.length !== 4) throw new Error(c.id + ': ' + wheelG.length + ' Räder gefunden');
  const wheelNo = new Map(); wheelG.forEach((g, i) => g.forEach((n) => wheelNo.set(n, i)));
  keep = [...keep, ...wheelG.flat()];
  // Ausrichtung aus den Radmitten: Längsachse = Richtung zwischen den Achsen
  const wc = wheelG.map((g) => boxOf(g).c);
  const ctr = [0, 1, 2].map((i) => wc.reduce((s, p) => s + p[i], 0) / 4);
  const pairs = []; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push([Math.hypot(wc[i][0] - wc[j][0], wc[i][2] - wc[j][2]), i, j]);
  pairs.sort((a, b) => a[0] - b[0]);
  // zwei kürzeste Paare = Achsen; deren Mitten verbinden
  const [[, a1, a2], [, b1, b2]] = pairs, A = [(wc[a1][0] + wc[a2][0]) / 2, (wc[a1][2] + wc[a2][2]) / 2], B = [(wc[b1][0] + wc[b2][0]) / 2, (wc[b1][2] + wc[b2][2]) / 2];
  // Vorderachse: liegt näher am Bug. Bug = Seite, auf der die Karosserie weiter über die Achse hinausragt? Nicht verlässlich → FLIP-Liste
  let yaw = Math.atan2(B[0] - A[0], B[1] - A[1]);
  if (c.front === 'a' || FLIP.has(c.id)) yaw += Math.PI;
  const body = boxOf(keep), size = Math.hypot(B[0] - A[0], B[1] - A[1]);
  void size;
  // Länge der Karosserie in Fahrtrichtung messen (nach Drehung)
  const rot = RY(-yaw);
  const pre = mul(rot, T(-ctr[0], -body.min[1], -ctr[2]));
  // neue Szene: jeder Knoten direkt unter der Wurzel mit fertiger Weltmatrix
  const out = doc.createNode('car');
  const fresh = [];
  for (const n of keep) {
    const m = doc.createNode(wheelNo.has(n) ? 'wheel' + wheelNo.get(n) : 'body').setMesh(n.getMesh()).setMatrix(mul(pre, n.getWorldMatrix()));
    out.addChild(m); fresh.push(m);
  }
  for (const n of scene.listChildren()) scene.removeChild(n);
  scene.addChild(out);
  for (const n of root.listNodes()) if (n !== out && !fresh.includes(n)) n.dispose();
  // Länge auf Zielmaß, Boden auf y = 0
  let bb = boxOf(fresh); const k = c.len / (bb.max[2] - bb.min[2]);
  for (const n of fresh) n.setMatrix(mul(mul(S(k), T(0, -bb.min[1], 0)), n.getMatrix()));
  await doc.transform(prune(), dedup());
  // Transformationen einbacken (geteilte Meshes vorher entkoppeln)
  const seen = new Set();
  for (const n of fresh) { let me = n.getMesh(); if (seen.has(me)) n.setMesh(me = me.clone()); seen.add(me); }
  for (const n of fresh) clearNodeTransform(n);
  // Karosserie: alle Nicht-Rad-Knoten unter einen Knoten „body“ → nach Material zusammenfassen
  const bodyNode = doc.createNode('body'), bodyMesh = doc.createMesh('body');
  const wheelsOut = new Map();
  for (const n of root.listNodes()) {
    if (!n.getMesh() || n === bodyNode) continue;
    const w = /^wheel(\d)$/.exec(n.getName());
    if (w) { if (!wheelsOut.has(w[1])) { const wn = doc.createNode('wheel'), wm = doc.createMesh('wheel'); wn.setMesh(wm); out.addChild(wn); wheelsOut.set(w[1], wn); } for (const p of n.getMesh().listPrimitives()) wheelsOut.get(w[1]).getMesh().addPrimitive(p); n.dispose(); continue; }
    for (const p of n.getMesh().listPrimitives()) bodyMesh.addPrimitive(p);
    n.dispose();
  }
  bodyNode.setMesh(bodyMesh); out.addChild(bodyNode);
  // Räder benennen (vorne/hinten, links/rechts)
  for (const n of wheelsOut.values()) { const b = boxOf([n]).c; n.setName('wheel_' + (b[2] > 0 ? 'f' : 'r') + (b[0] > 0 ? 'l' : 'r')); n.getMesh().setName(n.getName()); }
  await doc.transform(join({ keepNamed: true }), weld(), prune());
  const ratio = lo > .2 ? lo : !lo ? c.simp : 0; if (ratio) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: lo ? .01 : .004 }), prune());
  // Ferne Fassung: grob vereinfachen, ohne Rücksicht auf Textur-Nähte (aus der Ferne sieht man keine Risse)
  if (lo && lo <= .2) for (const me of root.listMeshes()) for (const p of me.listPrimitives()) {
    const idx = p.getIndices(), pos = p.getAttribute('POSITION'); if (!idx || !pos || pos.getNormalized()) continue;
    const want = Math.max(24, Math.floor(idx.getCount() * lo / 3) * 3);
    const [out] = MeshoptSimplifier.simplifySloppy(new Uint32Array(idx.getArray()), new Float32Array(pos.getArray()), 3, null, want, 1);
    if (out.length >= 3) p.setIndices(idx.clone().setArray(out));
  }
  // Material-Namen: Lack trägt „lack“ (für paintCar)
  if (c.paint) for (const t of root.listTextures()) { const users = t.listParents().filter((p) => p.propertyType === 'Material'); if (users.some((m) => /body|bodymat/i.test(m.getName()))) await repaint(t, c.paint); }
  for (const m of root.listMaterials()) { const ext = m.getExtension('KHR_materials_specular'); if (ext) m.setExtension('KHR_materials_specular', null); }
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: lo ? (lo > .2 ? [256, 256] : [128, 128]) : [512, 512], quality: 82 }), prune(), dedup(), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeTexcoord: 12 }));
  bb = boxOf(meshNodes(out));
  const suf = !lo ? '' : lo > .2 ? '_lo' : '_far', file = OUT + c.id + suf + '.glb';
  await io.write(file, doc);
  let tris = 0; for (const me of root.listMeshes()) for (const p of me.listPrimitives()) tris += (p.getIndices()?.getCount() ?? 0) / 3;
  console.log(c.id + suf, 'Dreiecke', tris, 'Maße', bb.min.map((v, i) => (bb.max[i] - v).toFixed(2)).join(' × '), 'Teile', root.listMeshes().map((me) => me.getName() + ':' + me.listPrimitives().length).join(' '));
}

const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
for (const c of CARS) if (!only || only.includes(c.id)) { await build(c, 0); await build(c, .35); if (c.body) await build(c, .18); }

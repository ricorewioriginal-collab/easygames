/* Bereitet ausgewählte Sketchfab-Modelle (alle CC BY 4.0, Credits in zotik-src/public/models/LIZENZ.md) für Zotik auf
   → zotik-src/public/models/sf/sf.glb: je Teil ein Knoten "p:<name>", Fuß im Ursprung, Texturen ≤ 512 px, nur Farbtextur (Cel-Shading braucht keine Normal-/ORM-Karten),
   halbtransparentes Laub als Alpha-Maske, Geometrie quantisiert, die Eiche vereinfacht.
   Aufruf: GT=/pfad/node_modules SRC=/pfad/mit/den/glb-Dateien node tools/make-zotik-sketchfab.mjs
   (SRC enthält eiche.bin, tanne.bin, palme.bin, busch.bin, felsen.bin, stumpf.bin, blumen.bin – Download über die Sketchfab-API mit eigenem Token) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, mergeDocuments, unpartition, weld, simplify, getBounds } = req('@gltf-transform/functions');
const { MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models/sf');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
/* Datei → Teile: null = ganzes Modell, sonst Quell-Knotenname → Teilname */
const PICK = {
  eiche: { parts: null, simplify: .5 }, tanne: { parts: null }, palme: { parts: null }, busch: { parts: null }, stumpf: { parts: null },
  felsen: { parts: Object.fromEntries(Array.from({ length: 11 }, (_, i) => ['SM_Rocks_' + String(i + 1).padStart(2, '0'), 'fels' + (i + 1)])) },
  blumen: { parts: { 'Orange Flower': 'blume1', 'Yellow Flower Patch': 'blume2', 'Dandelion Patch': 'blume3', 'Yellow Flowers': 'blume4' } }
};
async function prep(file, o) {
  const d = await io.read(path.join(SRC, file + '.bin')), root = d.getRoot(), sc = root.listScenes()[0];
  if (o.simplify) { await MeshoptSimplifier.ready; await d.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: o.simplify, error: .01 })); }
  const jobs = [];
  if (!o.parts) jobs.push([file, sc.listChildren()]);
  else { const all = root.listNodes(); for (const [src, name] of Object.entries(o.parts)) { const n = all.find(q => q.getName() === src); if (!n) throw new Error(file + ': Knoten fehlt ' + src); jobs.push([name, [n]]); } }
  const wrappers = [];
  for (const [name, nodes] of jobs) {
    const w = d.createNode('p:' + name), off = d.createNode(name + '_off'); w.addChild(off);
    for (const n of nodes) { const m = n.getWorldMatrix(); const p = n.getParentNode(); if (p) p.removeChild(n); else sc.removeChild(n); n.setMatrix(m); off.addChild(n); }
    wrappers.push([w, off]);
  }
  for (const c of sc.listChildren()) { sc.removeChild(c); }
  for (const [w, off] of wrappers) { sc.addChild(w); const b = getBounds(w); off.setTranslation([-(b.min[0] + b.max[0]) / 2, -b.min[1], -(b.min[2] + b.max[2]) / 2]); }
  for (const m of root.listMaterials()) {
    if (m.getAlphaMode() === 'BLEND') m.setAlphaMode('MASK').setAlphaCutoff(.5);
    m.setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
  }
  for (const e of root.listExtensionsUsed()) e.dispose();
  await d.transform(prune());
  return d;
}
let W = null;
for (const [file, o] of Object.entries(PICK)) { const d = await prep(file, o); if (!W) W = d; else mergeDocuments(W, d); }
const s0 = W.getRoot().listScenes()[0];
for (const s of W.getRoot().listScenes().slice(1)) { for (const c of s.listChildren()) { s.removeChild(c); s0.addChild(c); } s.dispose(); }
W.getRoot().setDefaultScene(s0);
for (const t of W.getRoot().listTextures()) {
  const img = sharp(Buffer.from(t.getImage())), meta = await img.metadata(), alpha = meta.hasAlpha && (await img.stats()).channels[3].min < 250;
  const r = img.resize(512, 512, { fit: 'inside', withoutEnlargement: true });
  if (alpha) t.setImage(new Uint8Array(await r.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer())).setMimeType('image/png').setURI('');
  else t.setImage(new Uint8Array(await r.removeAlpha().jpeg({ quality: 84 }).toBuffer())).setMimeType('image/jpeg').setURI('');
}
await W.transform(unpartition(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(path.join(OUT, 'sf.glb'), W);
console.log('sf.glb', (fs.statSync(path.join(OUT, 'sf.glb')).size / 1024).toFixed(0) + ' KB', s0.listChildren().map(c => c.getName()).join(' '));

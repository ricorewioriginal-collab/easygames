/* Poly-Haven-Modelle (CC0) fürs Urwaldlager → anmacha-urwaldlager/models/ph.glb (je Modell ein Knoten "p:ph_<name>")
   Lädt die 1k-glTF-Fassungen über api.polyhaven.com, behält nur die Grundfarbe (Lambert im Spiel, keine Normal-/ORM-Karten),
   verkleinert Texturen auf WebP (Pflanzen mit Alpha), fasst Teile zusammen und reduziert die Polygone fürs Handy.
   Aufruf: GT=/pfad/node_modules node tools/make-urwaldlager-polyhaven.mjs   (braucht @gltf-transform/* 4, meshoptimizer, sharp, curl) */
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO, Document } = req('@gltf-transform/core');
const { ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const { prune, dedup, weld, join, flatten, simplify, quantize, mergeDocuments, unpartition } = req('@gltf-transform/functions');
const { MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
await MeshoptSimplifier.ready;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'anmacha-urwaldlager/models/ph.glb');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-'));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const get = (url, file) => { fs.mkdirSync(path.dirname(file), { recursive: true }); execFileSync('curl', ['-sfL', '-o', file, url]); return file; };
const api = id => JSON.parse(execFileSync('curl', ['-sf', 'https://api.polyhaven.com/files/' + id]).toString());

// Name im Spiel, Poly-Haven-Id, Ziel-Dreiecke, Texturgröße
const LIST = [
  ['fern', 'fern_02', 1200, 512],
  ['anthurium', 'anthurium_botany_01', 1200, 512],
  ['calathea', 'calathea_orbifolia_01', 1500, 512],
  ['sorrel', 'shrub_sorrel_01', 1000, 512],
  ['weed', 'weed_plant_02', 1500, 512],
  ['shrub', 'shrub_03', 1500, 512],
  ['rock', 'rock_09', 800, 512],
  ['bucket', 'wooden_bucket_01', 1000, 256],
  ['crate', 'wooden_crate_02', 800, 256]
];

const out = new Document(); out.createBuffer();
const outScene = out.createScene('ph');
for (const [name, id, tris, px] of LIST) {
  const f = api(id), g = f.gltf['1k'].gltf, dir = path.join(TMP, id);
  const file = get(g.url, path.join(dir, id + '.gltf'));
  for (const [k, v] of Object.entries(g.include)) get(v.url, path.join(dir, k));
  const doc = await io.read(file);
  const mask = doc.getRoot().listMaterials().some(m => m.getAlphaMode() === 'MASK');
  // Grundfarbe: bei Pflanzen die PNG-Fassung (mit Alpha), sonst JPEG
  const src = mask ? get(f.Diffuse['1k'].png.url, path.join(dir, 'diff.png')) : path.join(dir, Object.keys(g.include).find(k => /_diff_/.test(k)));
  const img = await sharp(src).resize(px, px).webp({ quality: 78, alphaQuality: 80 }).toBuffer();
  for (const m of doc.getRoot().listMaterials()) {
    const t = m.getBaseColorTexture();
    m.setNormalTexture(null).setOcclusionTexture(null).setMetallicRoughnessTexture(null).setMetallicFactor(0).setRoughnessFactor(1);
    if (t) t.setImage(img).setMimeType('image/webp').setURI(name + '.webp');
  }
  await doc.transform(flatten(), join({ keepNamed: false }), weld(), dedup(), prune());
  const count = () => doc.getRoot().listMeshes().reduce((a, me) => a + me.listPrimitives().reduce((b, p) => b + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);
  const before = count();
  if (before > tris) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: tris / before, error: 0.08, lockBorder: false }));
  for (const p of doc.getRoot().listMeshes().flatMap(me => me.listPrimitives())) { p.setAttribute('TANGENT', null); p.setAttribute('TEXCOORD_1', null); }
  await doc.transform(prune());
  console.log(name, Math.round(before), '→', Math.round(count()), 'Dreiecke');
  // in ein Dokument übernehmen, unter einem Knoten p:ph_<name>
  const node = doc.createNode('p:ph_' + name);
  for (const n of doc.getRoot().listScenes()[0].listChildren()) node.addChild(n);
  doc.getRoot().listScenes()[0].addChild(node);
  mergeDocuments(out, doc);
}
const scenes = out.getRoot().listScenes();
for (const s of scenes) if (s !== outScene) { for (const n of s.listChildren()) outScene.addChild(n); s.dispose(); }
out.getRoot().setDefaultScene(outScene);
await out.transform(unpartition(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(OUT, out);
console.log(OUT, (fs.statSync(OUT).size / 1024).toFixed(0), 'KB');
fs.rmSync(TMP, { recursive: true, force: true });

/* Bereitet freie 3D-Modelle (CC0) für Kraterkommando auf → kraterkommando/models/
   - Figuren: Quaternius „Ultimate Monsters“ (CC0, Quelle im Repo: taschi/assets/models), nur benötigte Bewegungen, ausgedünnt, quantisiert
   - props.glb: Kenney-Modelle (CC0, Quelle im Repo: anmacha-quest-rpg/models), Farbtextur in Vertexfarben eingebrannt
     (keine Bilddatei, Farbe je Karte im Spiel tönbar), je Teil ein Knoten "p:<name>"
   Aufruf: GT=/pfad/node_modules node tools/make-kraterkommando-assets.mjs   (braucht @gltf-transform/core|extensions|functions@4 und pngjs) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO, Document } = req('@gltf-transform/core');
const { KHRMeshQuantization, KHRTextureTransform } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, resample, weld, mergeDocuments, unpartition, flatten, join } = req('@gltf-transform/functions');
const { PNG } = req('pngjs');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'kraterkommando/models');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRTextureTransform]);

/* Figuren: Team ROT und Team BLAU */
const FIG = ['cat', 'ninja', 'chicken', 'pigeon', 'orc', 'alien', 'yeti', 'wizard'];
const KEEP = { Idle: 'idle', Walk: 'walk', Jump: 'jump', Death: 'death', HitRecieve: 'hit', Dance: 'dance', Bite_Front: 'throw', Yes: 'yes', No: 'no' };
for (const id of FIG) {
  const doc = await io.read(path.join(ROOT, 'taschi/assets/models', id + '.glb'));
  for (const a of doc.getRoot().listAnimations()) {
    const k = KEEP[a.getName().split('|').pop()];
    if (k) a.setName(k); else a.dispose();
  }
  // Positionen bleiben float: quantisierte Positionen verschieben bei Skin-Netzen die Hüllbox (Größe im Spiel wäre falsch)
  await doc.transform(resample({ tolerance: 2e-3 }), dedup(), prune(), quantize({ pattern: /^(NORMAL|TEXCOORD|JOINTS|WEIGHTS)/, quantizeNormal: 8 }));
  await io.write(path.join(OUT, id + '.glb'), doc);
}

/* Requisiten: Farbtextur → Vertexfarben */
const PROPS = { tree: 'town/tree.glb', pine: 'town/tree-high.glb', round: 'town/tree-high-round.glb', crooked: 'town/tree-crooked.glb', rock: 'town/rock-large.glb',
  rocks: 'forest/rocks-high.glb', barrel: 'dungeon/barrel.glb', chest: 'dungeon/chest.glb', pinefall: 'grave/pine-fall-crooked.glb' };
const out = new Document(); out.createBuffer(); const scene = out.createScene('props');
for (const [name, rel] of Object.entries(PROPS)) {
  const file = path.join(ROOT, 'anmacha-quest-rpg/models', rel);
  const doc = await io.read(file), root = doc.getRoot();
  for (const a of root.listAnimations()) a.dispose();
  const png = PNG.sync.read(fs.readFileSync(path.join(path.dirname(file), 'Textures/colormap.png')));
  const px = (u, v) => { const x = Math.min(png.width - 1, Math.max(0, Math.floor((u - Math.floor(u)) * png.width))), y = Math.min(png.height - 1, Math.max(0, Math.floor((v - Math.floor(v)) * png.height))), i = (y * png.width + x) * 4; return [png.data[i] / 255, png.data[i + 1] / 255, png.data[i + 2] / 255]; };
  const lin = c => c;   // Farben bleiben sRGB: das Spiel rendert ohne Farbraum-Umrechnung (wie das Gelände)
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const uv = prim.getAttribute('TEXCOORD_0'), mat = prim.getMaterial();
    const f = mat ? mat.getBaseColorFactor() : [1, 1, 1, 1];
    const n = prim.getAttribute('POSITION').getCount(), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const c = uv && mat && mat.getBaseColorTexture() ? px(...uv.getElement(i, [])) : [1, 1, 1];
      for (let k = 0; k < 3; k++) col[i * 3 + k] = lin(c[k]) * f[k];
    }
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(root.listBuffers()[0]));
    if (uv) prim.setAttribute('TEXCOORD_0', null);
    const m = doc.createMaterial('prop').setBaseColorFactor([1, 1, 1, 1]).setRoughnessFactor(1).setMetallicFactor(0);
    prim.setMaterial(m);
  }
  for (const t of root.listTextures()) t.dispose();
  for (const e of doc.getRoot().listExtensionsUsed()) e.dispose();
  await doc.transform(flatten(), dedup(), prune());
  const holder = doc.createNode('p:' + name);
  for (const n of root.getDefaultScene().listChildren()) { root.getDefaultScene().removeChild(n); holder.addChild(n); }
  root.getDefaultScene().addChild(holder);
  const map = mergeDocuments(out, doc);
  for (const s of doc.getRoot().listScenes()) for (const n of map.get(s).listChildren()) scene.addChild(n);
}
for (const s of out.getRoot().listScenes()) if (s !== scene) s.dispose();
out.getRoot().setDefaultScene(scene);
await out.transform(dedup(), weld(), join(), unpartition(), prune(), quantize({ quantizePosition: 12, quantizeNormal: 8, quantizeColor: 8 }));
await io.write(path.join(OUT, 'props.glb'), out);
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.glb')) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + ' KB');

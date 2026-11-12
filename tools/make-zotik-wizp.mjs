/* Bereitet das „Lowpoly Stylized Fantasy Environment Pack“ von Wizp (itch.io, CC0 – nur nicht weiterverkaufen) für Zotik auf
   → zotik-src/public/models/wz/wz.glb: Auswahl an Bäumen je Klimazone, Felsen und Friedhofsteilen, je Teil ein Knoten "p:<name>" im Ursprung.
   Aufruf: GT=/pfad/node_modules SRC=/pfad/mit/den/entpackten/teilpaketen node tools/make-zotik-wizp.mjs   (TreesPack/, RocksPack/, CementeryPack/ mit je einer .glb) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, mergeDocuments, unpartition } = req('@gltf-transform/functions');
const sharp = req('sharp');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models/wz');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const PICK = {
  TreesPack: ['birch1', 'birch3', 'birch5', 'pine1', 'pine2', 'pine3', 'garden_tree_green', 'garden_tree_pink', 'garden_tree_yellow', 'ancient_tree_1.001', 'ancient_tree_pink_1', 'ancient_tree_winter_1.001',
    'ancient_tree_yellow_1', 'cactus1', 'cactus2', 'cactus3', 'coconut1', 'coconut2', 'palm2', 'creepy_tree1', 'creepy_tree2', 'garden_plant_1', 'garden_plant_winter', 'branch_winter_1.001', 'grass_green_group',
    'grass_purple_group', 'waterlily_pink_group', 'root_2.001'],
  RocksPack: ['rock_big_1', 'rock_big_2', 'rock_big_3', 'rock_medium_1', 'rock_medium_2', 'rock_medium_3', 'rock_big_B_dark_2', 'rock_big_B_gray_1'],
  CementeryPack: ['tomb_1', 'tomb_2', 'tomb_3', 'tomb_statue', 'coffin', 'prop_tomb_1', 'prop_tomb_2', 'prop_tomb_3', 'metal_fence', 'lamp.001', 'bones_group', 'column_1', 'arch.001']
};
let W = null;
for (const [pack, names] of Object.entries(PICK)) {
  const src = await io.read(path.join(SRC, pack, fs.readdirSync(path.join(SRC, pack)).find(f => f.endsWith('.glb'))));
  const sc = src.getRoot().listScenes()[0], keep = new Set(names);
  for (const n of sc.listChildren()) if (!keep.has(n.getName())) { sc.removeChild(n); n.dispose(); }
  for (const n of sc.listChildren()) { const w = src.createNode('p:' + n.getName().replace(/\.\d+$/, '')); sc.removeChild(n); n.setTranslation([0, 0, 0]); w.addChild(n); sc.addChild(w); }
  await src.transform(prune());
  if (!W) W = src; else { mergeDocuments(W, src); }
}
const s0 = W.getRoot().listScenes()[0];
for (const s of W.getRoot().listScenes().slice(1)) { for (const c of s.listChildren()) { s.removeChild(c); s0.addChild(c); } s.dispose(); }
for (const t of W.getRoot().listTextures()) t.setImage(new Uint8Array(await sharp(Buffer.from(t.getImage())).resize(256, 256, { kernel: 'nearest' }).png({ palette: true }).toBuffer())).setMimeType('image/png');
await W.transform(unpartition(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(path.join(OUT, 'wz.glb'), W);
console.log('wz.glb', (fs.statSync(path.join(OUT, 'wz.glb')).size / 1024).toFixed(0) + ' KB', s0.listChildren().map(c => c.getName()).join(' '));

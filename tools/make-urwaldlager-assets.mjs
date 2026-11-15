/* Bereitet die freien 3D-Modelle für Urwaldlager auf → anmacha-urwaldlager/models/
   Quellen (alle frei, siehe anmacha-urwaldlager/models/LIZENZ.md):
   - KayKit Adventurers 1.0 (Kay Lousberg, CC0) aus zeitsprung/figuren: 5 Figuren + gemeinsame Bewegungen (anim.glb)
   - Kenney Nature/Food Kit und Quaternius-Tiere (CC0) aus dem npm-Paket @netforge/asset-library-files 0.2.0
   - Wizp Lowpoly Stylized Fantasy Environment (CC0) aus zotik/models/wz/wz.glb
   - KayKit Dungeon Pack (CC0) aus zotik/models/kk/props.glb, KayKit Furniture Bits (CC0) aus anmacha-podcast-tycoon/models/kaykit
   Ergebnis: figuren/<id>.glb, figuren/anim.glb, set.glb (je Teil ein Knoten "p:<name>"), tiere/<id>.glb
   Aufruf: GT=/pfad/node_modules NF=/pfad/@netforge/asset-library-files/library node tools/make-urwaldlager-assets.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const { prune, dedup, mergeDocuments, unpartition, quantize, resample } = req('@gltf-transform/functions');
const { MeshoptDecoder } = req('meshoptimizer');
await MeshoptDecoder.ready;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'anmacha-urwaldlager/models');
const NF = process.env.NF;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const noMeshopt = d => { for (const e of d.getRoot().listExtensionsUsed()) if (/meshopt/.test(e.extensionName)) e.dispose(); };
const Q = quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 });
for (const d of ['figuren', 'tiere']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

/* Figuren: Waffen raus (Becher und offenes Buch bleiben als Requisiten), keine Meshopt-Kompression (three r128 ohne Decoder) */
const WEAPON = /sword|shield|axe|knife|crossbow|throwable|wand|staff|^spellbook$/i;
for (const id of ['knight', 'mage', 'rogue', 'rogue_hooded', 'barbarian']) {
  const doc = await io.read(path.join(ROOT, 'zeitsprung/figuren', id + '.glb'));
  for (const n of doc.getRoot().listNodes()) if (n.getMesh() && WEAPON.test(n.getName())) n.dispose();
  noMeshopt(doc);
  await doc.transform(prune(), dedup());
  await io.write(path.join(OUT, 'figuren', id + '.glb'), doc);
}
{ const doc = await io.read(path.join(ROOT, 'zeitsprung/figuren/anim.glb')); noMeshopt(doc);
  await doc.transform(resample({ tolerance: 1e-3 }), prune({ keepLeaves: true }), dedup());
  await io.write(path.join(OUT, 'figuren/anim.glb'), doc); }

/* Tiere mit Bewegungen (Quaternius, CC0) */
for (const id of ['crab', 'frog', 'bat', 'bee']) {
  const doc = await io.read(path.join(NF, 'lowpoly', id + '.glb')); noMeshopt(doc);
  await doc.transform(prune(), dedup());
  await io.write(path.join(OUT, 'tiere', id + '.glb'), doc);
}

/* Kulisse: alles in eine Datei, je Teil ein Knoten p:<name> */
const P = new (req('@gltf-transform/core').Document)();
P.createBuffer(); const SC = P.createScene('set');
async function add(file, name, pick) {
  const src = await io.read(file); noMeshopt(src);
  for (const a of src.getRoot().listAnimations()) a.dispose();
  const s0 = src.getRoot().listScenes()[0];
  if (pick) { let hit = false; for (const c of s0.listChildren()) { if (c.getName() === pick) { hit = true; c.setTranslation([0, 0, 0]); } else c.dispose(); } if (!hit) throw new Error('fehlt ' + pick + ' in ' + file); }
  await src.transform(prune());
  const kids = src.getRoot().listScenes()[0].listChildren();
  const map = mergeDocuments(P, src);
  const wrap = P.createNode('p:' + name); SC.addChild(wrap);
  for (const k of kids) { const c = map.get(k); for (const s of P.getRoot().listScenes()) if (s !== SC) s.removeChild(c); wrap.addChild(c); }
}
const KEN = ['tree_palm', 'tree_fat', 'tree_dark', 'bush', 'bush_large', 'log', 'stump', 'rock_large', 'rock_small', 'rock_tall', 'campfire', 'tent', 'flower_red', 'mushroom_red',
  'fence', 'crate', 'barrel', 'barrels', 'chest', 'banana', 'apple', 'watermelon', 'carrot', 'fish', 'pumpkin', 'coin', 'target', 'column', 'column_broken', 'obelisk'];
for (const n of KEN) await add(path.join(NF, 'lowpoly', n + '.glb'), n);
const WZ = ['palm2', 'coconut1', 'coconut2', 'ancient_tree_1', 'garden_plant_1', 'grass_green_group', 'root_2', 'waterlily_pink_group', 'rock_big_1', 'rock_big_2', 'rock_medium_1', 'rock_medium_2', 'birch1', 'garden_tree_green'];
for (const n of WZ) await add(path.join(ROOT, 'zotik/models/wz/wz.glb'), n, 'p:' + n);
const KD = ['barrel_large', 'crates_stacked', 'box_stacked', 'chest', 'chest_gold', 'torch_mounted', 'table_medium_decorated_A', 'stool', 'bed_floor', 'trunk_large_A', 'bottle_A_green', 'candle_triple', 'banner_patternA_red'];
for (const n of KD) await add(path.join(ROOT, 'zotik/models/kk/props.glb'), 'kd_' + n, 'p:' + n);
const KF = ['kf_couch_pillows', 'kf_armchair', 'kf_lamp_standing', 'kf_table_low', 'kf_chair_stool', 'kf_table_medium', 'kk_bench', 'kk_streetlight'];
for (const n of KF) await add(path.join(ROOT, 'anmacha-podcast-tycoon/models/kaykit', n + '.glb'), n);
for (const s of P.getRoot().listScenes()) if (s !== SC) s.dispose();
P.getRoot().setDefaultScene(SC);
await P.transform(unpartition(), dedup(), prune(), Q);
await io.write(path.join(OUT, 'set.glb'), P);
const walk = d => fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else console.log(path.relative(OUT, p), (fs.statSync(p).size / 1024).toFixed(0) + ' KB'); });
walk(OUT);

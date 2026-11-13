/* Burgen, Türme, Mauern, Berge und Bäume für AERU aus dem „KayKit Medieval Hexagon Pack 1.0“ von Kay Lousberg (CC0) → aeru/models/castle.glb
   Je Teil ein Knoten "p:<name>" im Ursprung (ein gemeinsamer Textur-Atlas). Quelle: git clone https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0
   Aufruf: GT=/pfad/node_modules SRC=/pfad/KayKit-Medieval-Hexagon-Pack-1.0 node tools/make-aeru-castle.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, dedup, quantize, textureCompress, mergeDocuments, unpartition } = req('@gltf-transform/functions');
const sharp = req('sharp');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), A = path.join(process.env.SRC, 'addons/kaykit_medieval_hexagon_pack/Assets/gltf');
const PARTS = {
  castle_blue: 'buildings/blue/building_castle_blue', castle_red: 'buildings/red/building_castle_red',
  towerA_blue: 'buildings/blue/building_tower_A_blue', towerB_blue: 'buildings/blue/building_tower_B_blue', towerA_red: 'buildings/red/building_tower_A_red', towerB_red: 'buildings/red/building_tower_B_red',
  church_blue: 'buildings/blue/building_church_blue', well_blue: 'buildings/blue/building_well_blue', windmill_red: 'buildings/red/building_windmill_red',
  wall: 'buildings/neutral/wall_straight', wall_gate: 'buildings/neutral/wall_straight_gate', wall_corner: 'buildings/neutral/wall_corner_A_outside', bridge: 'buildings/neutral/building_bridge_A',
  mountain_A: 'decoration/nature/mountain_A_grass_trees', mountain_B: 'decoration/nature/mountain_B_grass', mountain_C: 'decoration/nature/mountain_C_grass',
  hill_A: 'decoration/nature/hill_single_A', hill_B: 'decoration/nature/hill_single_B', rock_A: 'decoration/nature/rock_single_A', rock_C: 'decoration/nature/rock_single_C',
  tree_A: 'decoration/nature/tree_single_A', tree_B: 'decoration/nature/tree_single_B', trees_A: 'decoration/nature/trees_A_medium', trees_B: 'decoration/nature/trees_B_medium',
  cloud_big: 'decoration/nature/cloud_big', cloud_small: 'decoration/nature/cloud_small', lily: 'decoration/nature/waterlily_A', waterplant: 'decoration/nature/waterplant_A',
  barrel: 'decoration/props/barrel', crate: 'decoration/props/crate_A_small', flag_blue: 'decoration/props/flag_blue', flag_red: 'decoration/props/flag_red', tent: 'decoration/props/tent'
};
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const out = await io.read(path.join(A, PARTS.castle_blue + '.gltf'));
const scene = out.getRoot().listScenes()[0];
const wrap = (doc, name) => { const sc = doc.getRoot().listScenes()[0], g = doc.createNode('p:' + name); for (const c of sc.listChildren()) { sc.removeChild(c); g.addChild(c); } sc.addChild(g); };
wrap(out, 'castle_blue');
for (const [name, file] of Object.entries(PARTS)) {
  if (name === 'castle_blue') continue;
  const doc = await io.read(path.join(A, file + '.gltf')); wrap(doc, name);
  const map = mergeDocuments(out, doc), sc2 = map.get(doc.getRoot().listScenes()[0]);
  for (const c of sc2.listChildren()) { sc2.removeChild(c); scene.addChild(c); } sc2.dispose();
}
await out.transform(unpartition(), dedup(), prune(), quantize(), textureCompress({ encoder: sharp, targetFormat: 'png', resize: [512, 512] }));
const names = scene.listChildren().map(n => n.getName()); const miss = Object.keys(PARTS).filter(n => !names.includes('p:' + n)); if (miss.length) throw new Error('fehlt: ' + miss);
await io.write(path.join(ROOT, 'aeru/models/castle.glb'), out);
console.log('castle.glb', Math.round(fs.statSync(path.join(ROOT, 'aeru/models/castle.glb')).size / 1024) + ' KB', names.length + ' Teile');

/* AnMaCha Kartensammlung 3D – Kartenstube aus KayKit-Teilen (Kay Lousberg, CC0, www.kaylousberg.com)
   Nimmt aus zotik/models/kk/props.glb (KayKit Dungeon Pack, bereits aufbereitet) nur die Teile für den Raum um den Spieltisch
   → anmacha-kartensammlung/models/room.glb (eine Textur, je Teil ein Knoten "p:<name>").
   Die Figuren (KayKit Adventurers/Skeletons) und anim.glb werden unverändert aus zotik/models/kk/ kopiert.
   Aufruf: GT=/pfad/node_modules node tools/make-kartensammlung-kaykit.mjs */
import { createRequire } from 'module';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, dedup } = req('@gltf-transform/functions');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const KEEP = new Set(['barrel_large', 'barrel_small_stack', 'crates_stacked', 'chest_gold', 'coin_stack_small', 'candle_triple', 'candle_lit', 'shelves',
  'shelf_small_candles', 'chair', 'stool', 'banner_patternA_red', 'banner_patternB_blue', 'banner_thin_yellow', 'torch_mounted', 'pillar_decorated', 'table_small_decorated_A']);
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const doc = await io.read(path.join(ROOT, 'zotik/models/kk/props.glb'));
const scene = doc.getRoot().listScenes()[0];
for (const n of scene.listChildren()) { const nm = n.getName().replace(/^p:/, ''); if (!KEEP.has(nm)) { n.dispose(); } }
await doc.transform(prune(), dedup());
await io.write(path.join(ROOT, 'anmacha-kartensammlung/models/room.glb'), doc);
console.log('room.glb geschrieben:', scene.listChildren().map(n => n.getName()).join(', '));

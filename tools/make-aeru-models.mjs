/* Freie 3D-Modelle für AERU aus bereits im Repository liegenden CC0-Paketen → aeru/models/
   - scenery.glb: Bäume, Felsen und Gras aus Wizps „Lowpoly Stylized Fantasy Environment Pack“ (CC0), Auswahl aus zotik/models/wz/wz.glb,
     je Teil ein Knoten "p:<name>" im Ursprung, Textur-Atlas auf 512 px verkleinert.
   - Gegner aus Quaternius' „Ultimate Monsters Bundle“ (CC0) aus taschi/assets/models/, Bewegungen unverändert (ohne Quantisierung: Skelett-Netze bleiben in r128 verlässlich).
   Aufruf: GT=/pfad/node_modules node tools/make-aeru-models.mjs   (braucht @gltf-transform/core, /extensions, /functions, meshoptimizer und sharp) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, quantize, dequantize, dedup, textureCompress, weld, simplify } = req('@gltf-transform/functions');
const { MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), OUT = path.join(ROOT, 'aeru/models');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);

const SCENERY = ['garden_tree_green', 'garden_tree_pink', 'garden_tree_yellow', 'ancient_tree_pink_1', 'ancient_tree_yellow_1',
  'rock_big_1', 'rock_big_2', 'grass_green_group', 'grass_purple_group',
  'pine1', 'pine2', 'birch1', 'birch3', 'creepy_tree1', 'rock_big_3', 'rock_medium_1', 'column_1', 'arch', 'lamp'];
{
  const doc = await io.read(path.join(ROOT, 'zotik/models/wz/wz.glb')), sc = doc.getRoot().listScenes()[0], keep = new Set(SCENERY.map(n => 'p:' + n));
  for (const n of sc.listChildren()) if (!keep.has(n.getName())) { sc.removeChild(n); n.dispose(); }
  const missing = SCENERY.filter(n => !sc.listChildren().some(c => c.getName() === 'p:' + n)); if (missing.length) throw new Error('fehlt: ' + missing);
  await MeshoptSimplifier.ready;   // Handy-tauglich: Dreiecke etwa halbieren (Umriss bleibt), danach wieder quantisieren
  await doc.transform(prune(), dedup(), dequantize(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: .5, error: .004 }), quantize(), textureCompress({ encoder: sharp, resize: [512, 512] }));
  await io.write(path.join(OUT, 'scenery.glb'), doc);
}
const MONSTERS = { armabee: 'armabee', hywirl: 'hywirl', ghost: 'ghost', glub: 'glub', goleling: 'goleling' };
for (const [out, src] of Object.entries(MONSTERS)) {
  const doc = await io.read(path.join(ROOT, 'taschi/assets/models', src + '.glb'));
  await doc.transform(prune(), dedup());
  await io.write(path.join(OUT, out + '.glb'), doc);
}
for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' KB');

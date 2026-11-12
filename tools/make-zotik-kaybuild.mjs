/* Bereitet Gebäude für Zotik auf → zotik-src/public/models/kb/kb.glb (je Teil ein Knoten "p_<name>" (three entfernt Doppelpunkte aus Gruppennamen) im Ursprung)
   - KayKit „Medieval Builder Pack“ (Kay Lousberg, CC0): Burg, Wachturm, Häuser, Mühlen, Markt … als Landschaftsgebäude
   - KayKit „Dungeon Pack“ (CC0): Wände, Bögen, Böden, Säulen für begehbare Burgen und Türme
   Aufruf: GT=/pfad/node_modules MB=/pfad/Medieval-Builder/Models/objects/gltf DG=/pfad/zum/entpackten/Dungeon-Pack node tools/make-zotik-kaybuild.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, mergeDocuments, unpartition } = req('@gltf-transform/functions');
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models/kb');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const find = (root, re) => { const out = []; const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (re.test(p)) out.push(p); } }; walk(root); return out; };
const MB = ['castle', 'watchtower', 'house', 'market', 'mill', 'watermill', 'well', 'barracks', 'lumbermill', 'archeryrange', 'wall_gate', 'wall_straight', 'bridge', 'mine', 'farm_plot'];
const DG = ['wall', 'wall_arched', 'wall_window_closed', 'wall_archedwindow_gated', 'wall_doorway', 'wall_corner', 'wall_pillar', 'floor_tile_large', 'floor_tile_small_decorated', 'floor_wood_large', 'pillar_decorated', 'stairs', 'banner_patternA_red', 'banner_shield_green', 'torch_mounted', 'column'];
const files = [...MB.map(n => [n, find(process.env.MB, new RegExp('[/\\\\]' + n + '\\.gltf(\\.glb)?$'))[0]]), ...DG.map(n => [n, find(process.env.DG, new RegExp('[/\\\\]gltf[/\\\\]' + n + '\\.gltf$', 'i'))[0]])];
let W = null;
for (const [n, f] of files) {
  if (!f) throw new Error('fehlt: ' + n);
  const src = await io.read(f), sc = src.getRoot().listScenes()[0], w = src.createNode('p_' + n);
  for (const c of sc.listChildren()) { sc.removeChild(c); w.addChild(c); } sc.addChild(w);
  if (!W) W = src; else mergeDocuments(W, src);
}
const s0 = W.getRoot().listScenes()[0];
for (const s of W.getRoot().listScenes().slice(1)) { for (const c of s.listChildren()) { s.removeChild(c); s0.addChild(c); } s.dispose(); }
await W.transform(unpartition(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(path.join(OUT, 'kb.glb'), W);
console.log('kb.glb', (fs.statSync(path.join(OUT, 'kb.glb')).size / 1024).toFixed(0) + ' KB', s0.listChildren().length + ' Teile');

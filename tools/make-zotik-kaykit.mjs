/* Bereitet die KayKit-Pakete von Kay Lousberg (CC0, www.kaylousberg.com) für Zotik auf → zotik-src/public/models/kk/
   - Figuren (Skelette, Abenteurer) einzeln, Geometrie quantisiert
   - anim.glb: nur Knochen und Bewegungen (beide Rig_Medium-Dateien, ohne Mannequin-Netze, ausgedünnt)
   - props.glb: Auswahl aus Dungeon-Pack, Fantasy Weapons Bits und Ausrüstung der Figuren, je Teil ein Knoten "p:<name>"
   Aufruf: GT=/pfad/node_modules SRC=/pfad/mit/den/entpackten/paketen node tools/make-zotik-kaykit.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, resample, mergeDocuments, unpartition } = req('@gltf-transform/functions');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models/kk');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const find = (re) => { const out = []; const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (re.test(p)) out.push(p); } }; walk(SRC); return out; };
const one = (dir, name) => { const f = find(new RegExp(dir + '.*[/\\\\]' + name.replace(/\./g, '\\.') + '$', 'i')); if (!f.length) throw new Error('fehlt: ' + dir + ' ' + name); return f[0]; };

/* Figuren */
const CH = { sk_w: ['Skeletons', 'Skeleton_Warrior.glb'], sk_m: ['Skeletons', 'Skeleton_Mage.glb'], sk_r: ['Skeletons', 'Skeleton_Rogue.glb'], sk_n: ['Skeletons', 'Skeleton_Minion.glb'],
  ad_kn: ['Adventurers', 'Knight.glb'], ad_ba: ['Adventurers', 'Barbarian.glb'], ad_ma: ['Adventurers', 'Mage.glb'], ad_ra: ['Adventurers', 'Ranger.glb'], ad_ro: ['Adventurers', 'Rogue.glb'], ad_rh: ['Adventurers', 'Rogue_Hooded.glb'] };
for (const [id, [dir, f]] of Object.entries(CH)) {
  const doc = await io.read(one(dir + '.*[/\\\\]Characters?[/\\\\]gltf', f));
  for (const a of doc.getRoot().listAnimations()) a.dispose();
  await doc.transform(dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
  await io.write(path.join(OUT, id + '.glb'), doc);
}

/* Bewegungen: Netze weg, nur gebrauchte Clips, ausgedünnt */
const KEEP = new Set(['Idle_A', 'Walking_A', 'Running_A', 'Hit_A', 'Death_A', 'Spawn_Ground', 'Interact', 'Throw', 'Use_Item']);
const strip = async f => { const d = await io.read(f), r = d.getRoot();
  for (const n of r.listNodes()) { n.setMesh(null); n.setSkin(null); }
  for (const a of r.listAnimations()) if (!KEEP.has(a.getName())) a.dispose();
  return d; };
const A = await strip(one('Skeletons.*Animations[/\\\\]gltf', 'Rig_Medium_General.glb'));
mergeDocuments(A, await strip(one('Skeletons.*Animations[/\\\\]gltf', 'Rig_Medium_MovementBasic.glb')));
await A.transform(resample({ tolerance: 1e-3 }), prune({ keepLeaves: true }), dedup(), unpartition());
await io.write(path.join(OUT, 'anim.glb'), A);

/* Requisiten */
const PROPS = {
  Dungeon: ['barrel_large', 'barrel_small_stack', 'box_large', 'box_stacked', 'crates_stacked', 'chest', 'chest_gold', 'coin_stack_small',
    'candle_triple', 'candle_lit', 'shelf_small_candles', 'shelves', 'table_medium_decorated_A', 'table_small_decorated_A', 'chair', 'stool',
    'banner_patternA_red', 'banner_patternB_blue', 'banner_shield_green', 'banner_thin_yellow', 'banner_triple_white', 'torch_mounted', 'sword_shield', 'sword_shield_broken',
    'trunk_large_A', 'trunk_medium_B', 'rubble_large', 'rubble_half', 'pillar_decorated', 'column', 'bottle_A_green', 'keyring_hanging', 'bed_floor', 'key'],
  FantasyWeaponsBits: ['sword_A', 'sword_B', 'sword_C', 'sword_D', 'sword_E', 'axe_A', 'hammer_A', 'hammer_B', 'staff_A', 'staff_B', 'bow_A_withString', 'dagger_A', 'shield_A', 'shield_B', 'shield_C'],
  Adventurers: ['sword_1handed', 'shield_badge_color', 'axe_2handed', 'staff', 'spellbook_open', 'bow_withString', 'quiver', 'dagger', 'crossbow_1handed', 'shield_round_color'],
  Skeletons: ['Skeleton_Blade', 'Skeleton_Axe', 'Skeleton_Staff', 'Skeleton_Shield_Small_A', 'Skeleton_Shield_Large_A', 'Skeleton_Crossbow']
};
const P = await io.read(one('Dungeon.*Assets[/\\\\]gltf', 'barrel_large.gltf'));
P.getRoot().listScenes()[0].listChildren()[0].setName('p:barrel_large');
for (const [dir, list] of Object.entries(PROPS)) for (const n of list) {
  if (dir === 'Dungeon' && n === 'barrel_large') continue;
  const src = await io.read(one(dir + '.*[/\\\\]assets?[/\\\\]gltf', n + '.gltf'));
  const kids = src.getRoot().listScenes()[0].listChildren();
  const map = mergeDocuments(P, src), sc0 = P.getRoot().listScenes()[0];
  const wrap = P.createNode('p:' + n); sc0.addChild(wrap);
  for (const k of kids) { const c = map.get(k); for (const s of P.getRoot().listScenes()) s.removeChild(c); wrap.addChild(c); }
}
for (const s of P.getRoot().listScenes().slice(1)) s.dispose();
await P.transform(unpartition(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(path.join(OUT, 'props.glb'), P);
for (const f of fs.readdirSync(OUT)) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB');

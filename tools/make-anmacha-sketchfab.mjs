/* Ersetzt die Low-Poly-Modelle von „AnMaCha – Der Podcast“ durch Sketchfab-Modelle (alle CC BY 4.0, Liste in
   anmacha-podcast-tycoon/models/sf/LIZENZ.md) → anmacha-podcast-tycoon/models/sf/<paket>.glb.
   Je Spielmodell ein Knoten "sf_<name>" (gleiche Namen wie vorher, z. B. sf_kk_building_a), Front zeigt nach +Z, Fuß im Ursprung.
   Fürs Handy (Redmi Note 14 Pro): Dreiecke je Teil begrenzt (meshoptimizer), nur Farbtextur (WebP, ≤ 512 px), Geometrie quantisiert,
   gleiche Texturen eines Pakets werden geteilt (ein Material = ein Zeichenaufruf für viele Häuser).
   Aufruf: GT=/pfad/node_modules SRC=/pfad/zu/den/downloads node tools/make-anmacha-sketchfab.mjs
   Fehlende Quellen lädt das Skript mit SKETCHFAB_TOKEN=<eigener Token> selbst über die Download-API (Datei SRC/<quelle>.glb). */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO, Document } = req('@gltf-transform/core');
const { ALL_EXTENSIONS, EXTTextureWebP } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, mergeDocuments, unpartition, weld, simplify, getBounds } = req('@gltf-transform/functions');
const { MeshoptSimplifier } = req('meshoptimizer');
const sharp = req('sharp');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../anmacha-podcast-tycoon/models/sf');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).setLogger({ debug() {}, info() {}, warn() {}, error: console.error });

/* Quellen: Name → Sketchfab-UID (Titel/Autor stehen in LIZENZ.md) */
const SOURCES = {
  downtown: '7378e7fb9c914c39880d9913a6f4e1d6', brownstone: 'b15e6344acd844eabc823e1cc8332574', industrial: 'e0b0d0342be24e6c923319991a2a4d3d',
  sedan: 'd604871eee5b4181bb298163b0b675b7', taxi: '9e8f92a215784f3d8aaaaeab1bef54c4', van: '09d718c9cf72401b8534d265a06a803f',
  police_car: '61766c1e6e1e4b2b803c174f33433a74', delivery_van: 'a350a422d200485ea57778dc42139edc', suv: 'fbf1767c4c3a450caa59c6431af79263',
  hatchback_sports: 'b92072c8cd9d4ee6b3c0be45de48223c', kk_car_hatchback: '25c6874d173a4f6ca63e150bbd505686', kk_car_police: '13de926717214b8a94eaf90b0f0067d6',
  kk_car_sedan: 'f30b644b59b54e809355009dce463d47', kk_car_stationwagon: 'ff4cf29564094dc7bd18a8c18e988dc4', kk_car_taxi: '72d91f4bce814818b3cd1f2de60f8ef2',
  ambulance: '2856dd3c61f940909dced9a5c0379484', firetruck: '27a6b95f768d415282e2f5de48ba6d99', garbage_truck: 'abc7705b46bd4e9fa7a245ea15f9d89a',
  p_bench: '2ee2bc87756d4bf0932d83ab860ddb8f', p_dumpster: '989ea7f01b924859b3484ee27103e8d9', p_hydrant: 'd012d05e8bca49928a2944e043d93fb7',
  p_streetlamp: '6881aa1e84b047d79860fa9297e05e22', p_traffic: 'ab3efdd259a54d4aba5f878eacbe3f20', p_tlight2: '19a176596eb94d5e832cd12083a1cd4c', p_trashcan: '3836ff67877248c2a820e6a969984aac',
  p_trashbags: 'cd134204748b4e28a9e3494638cc595f', p_boxes: '8986ba512f704ac5b253286a0d1ad8bb', p_crates: '5ae3c72285474862a89d69c2f2ad2246',
  p_dish: '929f056abe02416da19d7b1aa805d235', p_bonfire: '6f61e3ee52594ba0a416b2eb30d40efe', p_tent: 'fa46028e8d3849399ba5271df07ed99c',
  p_ship: '109bfddb57d94cedb424ddcb42757e88', p_fountain: 'dd7909ffc4a84a45b3111030c51e43c6', p_bigrock: '38090ffb26b345c185c615b51fb1beb6',
  n_elm: 'f36443d3e59946bfa38b3f5cb90ea5fa', n_birch: 'aa842dffd9654d33b8b91170ce83c172', n_oak: '6468dd4d3eb240ef902b9057d9913606',
  n_pine: 'd45218a3fab349e5b1de040f29e7b6f9', n_beech: '0983d8933531491f9be71c669e8a907b', n_palm: '26e787f2ff2e4c0fb004c3b0210805a3',
  n_juniper: 'e74c7156984542c2a4cdf6ce8a0c8e96', n_fern: '38531afd86434987b1a0bf5968fe001f', n_verbena: '02aa97bd5a934b0fbfa5a87835d23ca0',
  n_smallbush: 'f6ed4c70fc024ac88e8e6a19991695af',
  m_bedroom: 'c30a07d2f8bc4f0a843f1629c5ef78c4', m_table: '98496560fbf243ea8a930e199ffc6a62', m_lamp: '95ac80faf06540fb84ab980e47ba31ca',
  m_closet: '98c60e0c585b4e0fa1c80f2aa3b22c35', m_shelf2: '955ddcb946854f618413aa50a17c58b3', m_bedside: 'b25de0eb97c64a00a538f09fc7072f67',
  m_stool: '303375efae124c58ac997bb95c57c243', m_book: '1f97b5f8e2b34bf6b1de64d6d48d6e96', m_armchair: 'fcce92a09de84456a071ea6117b57cbc',
  m_sofa: '03550a3529c24611a12aa158747374e0', m_carpets: '58b855b5e2f34e42b9670e252c40c68a', m_bookcase: 'd0618ac16b2a4a87b9b6c7d5e6765626',
  m_frame1: 'b54984abe2394345a81621719bf8bf1a', m_frame2: '772e7ca1bdc64a2ea537c2d191ab8918', m_persian: 'fe13eecfc9b8405dab1fe76c5dd28a4c',
  m_longtable: 'ed94c79ad6b349d99c74f37399d0eda7', m_woodtable: '31ab9f9ad2fa425aa75e8bb76cad8fc1', m_singlebed: '81ada0e24e1647d8a0d6d0708a696f84',
  m_chair1: '3f95ffdc194047ada2d9391828a5d234', m_chair2: '30861044fa0d4d0b858cdc9eaa843af4', m_chair3: '317a6957b142458d853c19d1107eddd7'
};
/* Pakete: Spielmodell → { src, nodes (Knotennamen, sonst ganzes Modell), drop (Knoten weglassen, „Name*“ = alle mit diesem Anfang), dropMat (Teilnetze mit diesem Material weglassen), crop (Dreiecke im Kasten [min,max] der Quelle),
   yaw (Grad, damit die Front nach +Z zeigt), tris (Obergrenze) }. Paket-Optionen: tex (max. Texturgröße), mask (Halbtransparenz als Maske). */
const car = (src, o) => Object.assign({ src, yaw: -90, tris: 5000 }, o);
const PACKS = {
  stadt: { tex: 512, parts: {
    kk_building_a: { src: 'brownstone', nodes: ['Brownstone_Commercial_1'] }, kk_building_b: { src: 'brownstone', nodes: ['Brownstone_Commercial_1_C'] },
    kk_building_c: { src: 'brownstone', nodes: ['Brownstone_FlatFacade_1'] }, kk_building_d: { src: 'brownstone', nodes: ['Brownstone_FlatFacade_2'] },
    kk_building_e: { src: 'brownstone', nodes: ['Brownstone_FlatFacade_5'] }, kk_building_f: { src: 'brownstone', nodes: ['Brownstone_FlatFacade_12'] },
    kk_building_g: { src: 'brownstone', nodes: ['Brownstone_Lowrise_1_B'] }, kk_building_h: { src: 'brownstone', nodes: ['Brownstone_ClassicComplex_2'] },
    building_a: { src: 'downtown', nodes: ['Downtown_ClassicOffice_1'] }, building_b: { src: 'downtown', nodes: ['Downtown_ModernOffice_2'] },
    building_c: { src: 'downtown', nodes: ['Downtown_Mall_1'] }, building_d: { src: 'downtown', nodes: ['Downtown_PublicBuilding_1'] },
    building_e: { src: 'downtown', nodes: ['Downtown_BrownstoneOffice_1'] }, building_f: { src: 'downtown', nodes: ['Downtown_Residential_2'] },
    building_g: { src: 'downtown', nodes: ['Downtown_Residential_4'] }, building_h: { src: 'downtown', nodes: ['Downtown_Residential_3'] },
    skyscraper_a: { src: 'downtown', nodes: ['Downtown_ModernOffice_4'] }, skyscraper_b: { src: 'downtown', nodes: ['Downtown_ModernOffice_5'] },
    skyscraper_c: { src: 'downtown', nodes: ['Downtown_ArtDeco_1'] }, kk_watertower: { src: 'industrial', nodes: ['Industrial_Watertower_1'] }
  } },
  autos: { tex: 512, parts: {
    sedan: car('sedan'), taxi: car('taxi'), van: car('van'), police_car: car('police_car'), delivery_van: car('delivery_van', { yaw: 90 }), suv: car('suv'),
    hatchback_sports: car('hatchback_sports'), kk_car_hatchback: car('kk_car_hatchback'), kk_car_police: car('kk_car_police'), kk_car_sedan: car('kk_car_sedan'),
    kk_car_stationwagon: car('kk_car_stationwagon'), kk_car_taxi: car('kk_car_taxi'), ambulance: car('ambulance'),
    firetruck: car('firetruck', { yaw: 0, tris: 7000 }), garbage_truck: car('garbage_truck', { yaw: 0, tris: 6000, err: 0.2, dropMat: ['Outline'] })
  } },
  strasse: { tex: 512, parts: {
    kk_bench: { src: 'p_bench', tris: 2500 }, kk_dumpster: { src: 'p_dumpster', nodes: ['4Y'], tris: 2500 }, kk_firehydrant: { src: 'p_hydrant', tris: 1500 },
    kk_streetlight: { src: 'p_streetlamp', tris: 2500 },
    kk_trafficlight_a: { src: 'p_tlight2', tris: 1500 }, kk_trafficlight_b: { src: 'p_tlight2', tris: 1500 }, kk_trafficlight_c: { src: 'p_traffic', drop: ['Pedestrian*'], yaw: -90, tris: 2500 },
    kk_trash_a: { src: 'p_trashbags', drop: ['Plane.003'], tris: 2500 }, kk_trash_b: { src: 'p_trashcan', nodes: ['group'], tris: 1500 },
    kk_box_a: { src: 'p_boxes', nodes: ['290x290x290_1'] }, kk_box_b: { src: 'p_boxes', nodes: ['290x290x400_2', '290x170x190_2'] },
    crate: { src: 'p_crates', nodes: ['Crate', 'Crate.001'] }, barrels: { src: 'p_crates', nodes: ['Barrel', 'Barrel.002'], tris: 1200 },
    satellite_dish: { src: 'p_dish', tris: 2000 }, campfire: { src: 'p_bonfire', tris: 2000 }, tent: { src: 'p_tent', tris: 3000 },
    cargo_ship: { src: 'p_ship', yaw: -90, tris: 6000 }, 'fountain-round': { src: 'p_fountain', tris: 5000 }, 'rock-large': { src: 'p_bigrock', tris: 1200 }
  } },
  natur: { tex: 512, mask: true, parts: {
    tree: { src: 'n_elm', tris: 2500 }, 'tree-high-round': { src: 'n_birch', tris: 2500 }, tree_oak: { src: 'n_oak', tris: 2800 },
    tree_pine: { src: 'n_pine', tris: 2500 }, tree_autumn: { src: 'n_beech', tris: 3500 }, tree_palm: { src: 'n_palm', tris: 2500 },
    kk_bush: { src: 'n_juniper', tris: 1500 }, bush: { src: 'n_fern', tris: 800 }, bush_large: { src: 'n_smallbush', tris: 800 },
    flower_red: { src: 'n_verbena', crop: [[-9, -9, -0.7], [9, 9, 0.6]], tris: 600 }
  } },
  moebel: { tex: 512, parts: {
    kf_armchair: { src: 'm_armchair', nodes: ['ARMCHAIR'], tris: 2500 }, kf_armchair_pillows: { src: 'm_armchair', nodes: ['ARMCHAIR'], tris: 2500 },
    kf_table_low: { src: 'm_armchair', nodes: ['COFFEETABLE'], tris: 1500 }, kf_lamp_standing: { src: 'm_armchair', nodes: ['FLOORLAMP'], tris: 1500 },
    kf_couch: { src: 'm_sofa', yaw: 90, tris: 3000 }, kf_couch_pillows: { src: 'm_sofa', yaw: 90, tris: 3000 },
    kf_bed_double_a: { src: 'm_bedroom', nodes: ['SM_Bed_01'], crop: [[-9, -1, -9], [0.15, 9, 9]], tris: 4000 }, kf_bed_single_a: { src: 'm_singlebed', tris: 2500 },
    kf_book_set: { src: 'm_book', tris: 600 }, kf_cabinet_medium_decorated: { src: 'm_closet', tris: 1800 }, kf_cabinet_small: { src: 'm_bedside', tris: 900 },
    kf_chair_a: { src: 'm_chair2', tris: 1500 }, kf_chair_a_wood: { src: 'm_chair1', tris: 1500 }, kf_chair_b: { src: 'm_chair3', yaw: -90, tris: 2000 },
    kf_chair_stool: { src: 'm_stool', tris: 1200 }, kf_lamp_table: { src: 'm_lamp', tris: 1500 },
    kf_pictureframe_large_a: { src: 'm_frame1', yaw: -90, tris: 800 }, kf_pictureframe_medium: { src: 'm_frame2', yaw: -90, tris: 800 },
    kf_pillow_a: { src: 'm_carpets', nodes: ['Coussin'], tris: 600 },
    kf_rug_oval_a: { src: 'm_persian' }, kf_rug_rectangle_a: { src: 'm_persian', yaw: 90 },
    kf_rug_rectangle_stripes_a: { src: 'm_carpets', nodes: ['Tapis'], yaw: 90, tris: 600 },
    kf_shelf_a_big: { src: 'm_shelf2', tris: 1500 }, kf_shelf_b_large_decorated: { src: 'm_bookcase', nodes: ['Victorian Bookcase Tall'], tris: 3000 },
    kf_table_medium: { src: 'm_woodtable', yaw: 90, tris: 1500 }, kf_table_medium_long: { src: 'm_longtable', tris: 1500 }, kf_table_small: { src: 'm_table', tris: 800 }
  } }
};

async function source(name) {
  const f = path.join(SRC, name + '.glb');
  if (!fs.existsSync(f)) {
    const tok = process.env.SKETCHFAB_TOKEN; if (!tok) throw new Error('Quelle fehlt: ' + f + ' (SKETCHFAB_TOKEN setzen)');
    const r = await fetch('https://api.sketchfab.com/v3/models/' + SOURCES[name] + '/download', { headers: { Authorization: 'Token ' + tok } }).then(r => r.json());
    if (!r.glb) throw new Error(name + ': kein GLB-Download');
    fs.writeFileSync(f, Buffer.from(await (await fetch(r.glb.url)).arrayBuffer()));
  }
  return fs.readFileSync(f);
}
const triCount = d => d.getRoot().listMeshes().reduce((t, m) => t + m.listPrimitives().reduce((s, p) => s + (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3, 0), 0);
const mul = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]];

/* Dreiecke außerhalb des Kastens entfernen (Kasten in Weltkoordinaten der Quelle, Mittelpunkt je Dreieck zählt) */
function cropNode(doc, node, box) {
  node.traverse(n => {
    const mesh = n.getMesh(); if (!mesh) return; const M = n.getWorldMatrix();
    for (const p of mesh.listPrimitives()) {
      const pos = p.getAttribute('POSITION'), idx = p.getIndices(), cnt = idx ? idx.getCount() : pos.getCount(), keep = [];
      for (let t = 0; t < cnt; t += 3) {
        const ids = [0, 1, 2].map(k => idx ? idx.getScalar(t + k) : t + k), c = [0, 0, 0];
        ids.forEach(i => { const w = mul(M, pos.getElement(i, [])); c[0] += w[0] / 3; c[1] += w[1] / 3; c[2] += w[2] / 3; });
        if (c.every((v, k) => v >= box[0][k] && v <= box[1][k])) keep.push(...ids);
      }
      if (!keep.length) { p.dispose(); continue; }
      const acc = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(keep));
      p.setIndices(acc);
    }
  });
}

async function part(name, o, packOpt) {
  const d = await io.readBinary(new Uint8Array(await source(o.src))), root = d.getRoot(), sc = root.getDefaultScene() || root.listScenes()[0];
  for (const s of root.listScenes()) if (s !== sc) s.dispose();
  const all = root.listNodes();
  let picks;
  if (o.nodes) picks = o.nodes.map(nm => { const n = all.find(q => q.getName() === nm); if (!n) throw new Error(name + ': Knoten fehlt ' + nm); return n; });
  else picks = sc.listChildren();
  if (o.drop) for (const n of all) if (o.drop.some(nm => nm.endsWith('*') ? n.getName().startsWith(nm.slice(0, -1)) : n.getName() === nm)) n.dispose();
  const w = d.createNode('sf_' + name), off = d.createNode(name + '_off'), rot = d.createNode(name + '_rot'); w.addChild(rot); rot.addChild(off);
  for (const n of picks) { const m = n.getWorldMatrix(); const p = n.getParentNode(); if (p) p.removeChild(n); else sc.removeChild(n); n.setMatrix(m); off.addChild(n); }
  for (const c of sc.listChildren()) sc.removeChild(c);
  sc.addChild(w);
  if (o.crop) cropNode(d, off, o.crop);
  if (o.dropMat) for (const m of root.listMeshes()) for (const p of m.listPrimitives()) if (p.getMaterial() && o.dropMat.includes(p.getMaterial().getName())) p.dispose();
  // Animationen, Kameras, Lichter und Skins braucht das Spiel nicht
  root.listAnimations().forEach(a => a.dispose()); root.listSkins().forEach(s => s.dispose()); root.listCameras().forEach(c => c.dispose());
  await d.transform(prune());
  const t0 = triCount(d), target = o.tris || 3000;
  if (t0 > target) { await MeshoptSimplifier.ready; await d.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: target / t0, error: o.err || 0.05, lockBorder: false })); }
  // Drehen (Front nach +Z), dann Fuß in den Ursprung
  const a = (o.yaw || 0) * Math.PI / 180; rot.setRotation([0, Math.sin(a / 2), 0, Math.cos(a / 2)]);
  const b2 = getBounds(w); w.setTranslation([-(b2.min[0] + b2.max[0]) / 2, -b2.min[1], -(b2.min[2] + b2.max[2]) / 2]);
  // Handy: nur Farbtextur; Metall aus (ohne ORM-Karte wäre alles verchromt)
  for (const m of root.listMaterials()) {
    // Specular/Glossiness-Materialien (ältere Exporte): Diffus-Textur wird Farbtextur
    const sg = m.getExtension('KHR_materials_pbrSpecularGlossiness');
    if (sg) { if (sg.getDiffuseTexture() && !m.getBaseColorTexture()) m.setBaseColorTexture(sg.getDiffuseTexture()); m.setBaseColorFactor(sg.getDiffuseFactor()); }
    m.setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null).setEmissiveFactor([0, 0, 0]);
    m.setMetallicFactor(0).setRoughnessFactor(0.85);
    if (packOpt.mask && m.getAlphaMode() === 'BLEND') m.setAlphaMode('MASK').setAlphaCutoff(0.5);
  }
  for (const e of root.listExtensionsUsed()) if (!/KHR_texture_transform|KHR_materials_emissive_strength/.test(e.extensionName)) e.dispose();
  await d.transform(prune());
  // Knoten-Transformationen bleiben: Spiel backt die Welt-Matrix in die Geometrie (world.js bake)
  const t1 = triCount(d); console.log('  ' + name.padEnd(28) + String(t0).padStart(6) + ' → ' + String(t1).padStart(5) + ' Dreiecke');
  return d;
}

for (const [pack, P] of Object.entries(PACKS)) {
  if (process.env.ONLY && !process.env.ONLY.split(',').includes(pack)) continue;
  console.log(pack);
  let W = null;
  for (const [name, o] of Object.entries(P.parts)) { const d = await part(name, o, P); if (!W) W = d; else mergeDocuments(W, d); }
  const s0 = W.getRoot().listScenes()[0];
  for (const s of W.getRoot().listScenes().slice(1)) { for (const c of s.listChildren()) { s.removeChild(c); s0.addChild(c); } s.dispose(); }
  W.getRoot().setDefaultScene(s0);
  await W.transform(dedup());
  W.createExtension(EXTTextureWebP).setRequired(true);
  for (const t of W.getRoot().listTextures()) {
    const img = sharp(Buffer.from(t.getImage())), meta = await img.metadata(), alpha = meta.hasAlpha && (await img.stats()).channels.at(-1).min < 250;
    let r = img.resize(P.tex, P.tex, { fit: 'inside', withoutEnlargement: true }); if (!alpha) r = r.removeAlpha();
    t.setImage(new Uint8Array(await r.webp({ quality: 78, alphaQuality: 90, effort: 6 }).toBuffer())).setMimeType('image/webp').setURI('');
  }
  await W.transform(dedup(), unpartition(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
  const f = path.join(OUT, pack + '.glb'); await io.write(f, W);
  console.log(pack + '.glb', (fs.statSync(f).size / 1024).toFixed(0) + ' KB, ' + triCount(W) + ' Dreiecke, ' + W.getRoot().listTextures().length + ' Texturen');
}

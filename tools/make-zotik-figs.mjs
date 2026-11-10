/* Baut die Anime-Figuren für Zotik (zotik-src/public/models/*.glb) aus den VRoid-Beispielmodellen mit CC0-Lizenz
   (VRoid-Projekt / pixiv: Base_Female, Base_Male, HairSample_Female, HairSample_Male – Lizenz im Modell: CC0).
   - Gesichtsausdrücke (Morph-Ziele), Normal-/Matcap-/Schattentexturen und Vorschaubild entfallen
   - Texturen verkleinert; Haare, Kleidung und Iris werden hell-grau, damit Zotik sie je Figur einfärben kann
   - Teilstücke gleichen Materials zusammengelegt (wenige Zeichenaufrufe), Katzenohren von HairSample_Female entfernt, Geometrie quantisiert
   Aufruf: GT=/pfad/node_modules SRC=/pfad/mit/vrm-ordnern node tools/make-zotik-figs.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization, KHRTextureTransform } = req('@gltf-transform/extensions');
const { prune, quantize, dedup } = req('@gltf-transform/functions');
const sharp = req('sharp');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models');
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRTextureTransform])   // ohne KHR_materials_unlit: Zotik zeichnet die Figuren selbst mit Cel-Shading (braucht Normalen);
const FILES = { f1: 'base_female/Base_Female.vrm', m1: 'base_male/Base_Male.vrm', f2: 'hairsample_female/HairSample_Female.vrm', m2: 'hairsample_male/HairSample_Male.vrm' };

async function tex(t, size, gray, alpha) {
  let s = sharp(Buffer.from(t.getImage())).resize(size, size, { fit: 'fill' });
  // hell-grau mit Zeichnung: Farbe kommt später aus dem Material (zwei Durchgänge, weil sharp normalise() sonst nach linear() anwendet)
  if (gray) s = sharp(await s.modulate({ saturation: 0 }).normalise().png().toBuffer()).linear(.55, 112);
  const out = alpha ? await s.png({ palette: true, quality: 85, effort: 9 }).toBuffer() : await s.flatten({ background: '#808080' }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  t.setImage(new Uint8Array(out)).setMimeType(alpha ? 'image/png' : 'image/jpeg').setURI(t.getName() + (alpha ? '.png' : '.jpg'));
}

for (const [key, file] of Object.entries(FILES)) {
  const doc = await io.read(path.join(SRC, file)), root = doc.getRoot(), done = new Set();
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) {
    for (const tg of p.listTargets()) { p.removeTarget(tg); tg.dispose(); }
    if (/HAIR_02/.test(p.getMaterial()?.getName() || '')) { mesh.removePrimitive(p); p.dispose(); continue; }
    if (key === 'f2' && /Hair/.test(mesh.getName())) {   // Katzenohren: kleine Haarteile ganz oben auf dem Kopf
      const pos = p.getAttribute('POSITION'), ix = p.getIndices().getArray(); let hi = -1e9; for (const i of ix) hi = Math.max(hi, pos.getElement(i, [])[1]);
      if (hi > 1.66) { mesh.removePrimitive(p); p.dispose(); }
    }
  }
  for (const m of root.listMaterials()) {
    const n = m.getName(), alpha = m.getAlphaMode() !== 'OPAQUE';
    m.setNormalTexture(null).setEmissiveTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setMetallicFactor(0).setRoughnessFactor(.9);
    const t = m.getBaseColorTexture(); if (!t || done.has(t)) continue; done.add(t);
    const hair = /HAIR/.test(n), cloth = /CLOTH/.test(n), iris = /EyeIris/.test(n), skin = /SKIN/.test(n), face = /FACE|EYE/.test(n);
    await tex(t, skin ? 512 : hair || cloth ? 512 : face ? 256 : 256, hair || cloth || iris, alpha);
  }
  for (const s of root.listScenes()) s.listChildren().forEach(c => { if (/secondary/i.test(c.getName())) c.dispose(); });
  // Teilstücke gleichen Materials zusammenlegen: alle Teile eines VRoid-Meshes nutzen dieselben Eckpunkte, also genügt es, die Indizes aneinanderzuhängen
  for (const mesh of root.listMeshes()) {
    const by = new Map(); for (const p of mesh.listPrimitives()) { const k = p.getMaterial(); if (!by.has(k)) by.set(k, []); by.get(k).push(p); }
    for (const list of by.values()) {
      if (list.length < 2) continue; const a0 = list[0].getAttribute('POSITION');
      if (!list.every(p => p.getAttribute('POSITION') === a0 && p.getIndices())) continue;
      const parts = list.map(p => p.getIndices().getArray()), n = parts.reduce((s, x) => s + x.length, 0), out = new Uint32Array(n); let o = 0;
      for (const x of parts) { out.set(x, o); o += x.length; }
      list[0].setIndices(doc.createAccessor().setType('SCALAR').setArray(out).setBuffer(list[0].getIndices().getBuffer()));
      for (const p of list.slice(1)) { mesh.removePrimitive(p); p.dispose(); }
    }
  }
  await doc.transform(prune({ keepAttributes: true }), dedup(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8 }));
  fs.mkdirSync(OUT, { recursive: true });
  await io.write(path.join(OUT, key + '.glb'), doc);
  console.log(key, (fs.statSync(path.join(OUT, key + '.glb')).size / 1024 | 0) + ' KB');
}

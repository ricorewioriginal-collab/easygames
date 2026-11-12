/* Bereitet „Bestiary – Dungeon Monsters Kit“ (Standard/frei) von Quaternius für Zotik auf → zotik-src/public/models/qb/
   Lizenz: Quaternius Asset License – Nutzung in Spielen erlaubt, die Modelle selbst dürfen nicht als Asset-Paket weitergegeben werden.
   - Normal- und ORM-Texturen entfallen (Zotik zeichnet mit Cel-Shading), Grundfarbe 512 px JPEG, Leuchten 256 px
   - Farbvarianten (BaseColor_2/_3) als eigene JPEGs, Geometrie quantisiert
   Aufruf: GT=/pfad/node_modules SRC=/pfad/zum/entpackten/paket node tools/make-zotik-bestiary.mjs */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization, KHRMaterialsEmissiveStrength } = req('@gltf-transform/extensions');
const { prune, quantize, dedup } = req('@gltf-transform/functions');
const sharp = req('sharp');
const SRC = process.env.SRC, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../zotik-src/public/models/qb');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRMaterialsEmissiveStrength]);
const jpg = (buf, s) => sharp(buf).resize(s, s).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
for (const name of ['Imp', 'Puglin']) {
  const doc = await io.read(path.join(SRC, 'Exports/GLB (Godot-Unreal)', name + '.glb'));
  for (const m of doc.getRoot().listMaterials()) {
    const n = m.getNormalTexture(), o = m.getMetallicRoughnessTexture(); m.setNormalTexture(null); m.setMetallicRoughnessTexture(null);
    for (const t of [n, o]) if (t && !t.listParents().some(p => p.propertyType === 'Material')) t.dispose();
    const b = m.getBaseColorTexture(); if (b) b.setImage(new Uint8Array(await jpg(Buffer.from(b.getImage()), 512))).setMimeType('image/jpeg').setURI(name + '.jpg');
    const e = m.getEmissiveTexture(); if (e) e.setImage(new Uint8Array(await sharp(Buffer.from(e.getImage())).resize(256, 256).png({ palette: true }).toBuffer())).setMimeType('image/png');
    m.setMetallicFactor(0).setRoughnessFactor(.8);
  }
  for (const a of doc.getRoot().listAnimations()) a.dispose();
  await doc.transform(dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
  await io.write(path.join(OUT, name.toLowerCase() + '.glb'), doc);
  for (const v of [2, 3]) { const f = path.join(SRC, 'Textures', `T_${name}_BaseColor_${v}.png`); if (fs.existsSync(f)) fs.writeFileSync(path.join(OUT, `${name.toLowerCase()}_${v}.jpg`), await jpg(fs.readFileSync(f), 512)); }
}
for (const f of fs.readdirSync(OUT)) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB');

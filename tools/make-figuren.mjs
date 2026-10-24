/* Baut die gemeinsamen easygames-Figuren (Ordner figuren/) aus den CC0-Paketen von Quaternius:
   - Universal Base Characters [Standard] (Superhero_Male_FullBody.gltf, Superhero_Female_FullBody.gltf + Texturen)
   - Universal Animation Library 1 + 2 [Standard] ab v2.0 (UAL1_Standard.glb, UAL2_Standard.glb – gleiche Knochennamen wie die Figuren)
   Ergebnis: figuren/mann.glb, figuren/frau.glb (Körper, ohne Animation) und figuren/anim.glb (nur Skelett + ausgewählte Bewegungen).
   Texturen werden verkleinert (JPEG), Geometrie quantisiert, Animationen auf 15 Bilder/s reduziert und als Int16 gespeichert.
   Aufruf: GT=/pfad/node_modules SRC=/pfad/ubc UAL=/pfad/ual node tools/make-figuren.mjs
   (GT: Ordner mit @gltf-transform/core, @gltf-transform/functions, @gltf-transform/extensions und sharp) */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const req = createRequire(path.join(process.env.GT || './node_modules', 'x.js'));
const { NodeIO } = req('@gltf-transform/core');
const { KHRMeshQuantization, ALL_EXTENSIONS } = req('@gltf-transform/extensions');
const { prune, quantize, dedup, resample } = req('@gltf-transform/functions');
const sharp = req('sharp');
const SRC = process.env.SRC, UAL = process.env.UAL, OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../figuren');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

// Bewegungen, die die Spiele brauchen (Name in der Bibliothek → kurzer Name)
const CLIPS = {
  Idle_Loop: 'idle', Walk_Loop: 'walk', Jog_Fwd_Loop: 'jog', Sprint_Loop: 'sprint', Jump_Start: 'jumpStart', Jump_Loop: 'jump', Jump_Land: 'land',
  NinjaJump_Start: 'ninjaStart', NinjaJump_Idle_Loop: 'ninja', NinjaJump_Land: 'ninjaLand', ClimbUp_1m_RM: 'climb', Swim_Idle_Loop: 'swim',
  Hit_Knockback: 'knock', Dance_Loop: 'dance', Yes: 'yes', Idle_FoldArms_Loop: 'arms', Crouch_Idle_Loop: 'crouch', Roll: 'roll', Slide_Loop: 'slide',
  Push_Loop: 'push', Punch_Jab: 'punch', Death01: 'down'
};
const FPS = 15;

async function tex(t, size, q) {
  if (!t) return;
  const out = await sharp(Buffer.from(t.getImage())).resize(size, size, { fit: 'fill' }).flatten({ background: '#808080' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
  t.setImage(new Uint8Array(out)).setMimeType('image/jpeg').setURI(t.getName() + '.jpg');
}

async function body(file, out) {
  const doc = await io.read(path.join(SRC, file));
  for (const m of doc.getRoot().listMaterials()) {
    const n = m.getName(), body = /Superhero/.test(n), eyes = /Eye/.test(n);
    await tex(m.getBaseColorTexture(), body ? 1024 : eyes ? 128 : 256, body ? 84 : 80);
    if (body) await tex(m.getNormalTexture(), 512, 86); else m.setNormalTexture(null);
    m.setMetallicRoughnessTexture(null).setMetallicFactor(0).setRoughnessFactor(body ? 0.62 : eyes ? 0.25 : 0.85);
    m.setDoubleSided(!body);
  }
  // nur benötigte Attribute behalten
  for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives())
    for (const s of p.listSemantics()) if (!/^(POSITION|NORMAL|TEXCOORD_0|JOINTS_0|WEIGHTS_0)$/.test(s)) p.setAttribute(s, null);
  await doc.transform(dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8 }));
  doc.createExtension(KHRMeshQuantization).setRequired(true);
  await io.write(path.join(OUT, out), doc);
}

// Int16-normierte Quaternionen (glTF-Kern erlaubt das für rotation-Kanäle)
function shortRot(doc, acc) {
  const a = acc.getArray(), s = new Int16Array(a.length);
  for (let i = 0; i < a.length; i++) s[i] = Math.round(Math.max(-1, Math.min(1, a[i])) * 32767);
  acc.setArray(s).setNormalized(true);
}

async function anims() {
  const d1 = await io.read(path.join(UAL, 'UAL1_Standard.glb')), d2 = await io.read(path.join(UAL, 'UAL2_Standard.glb'));
  const r1 = d1.getRoot(), byName = new Map(r1.listNodes().map(n => [n.getName(), n])), buf = r1.listBuffers()[0];
  // Clips aus der zweiten Bibliothek übernehmen (Kanäle per Knochenname zuordnen)
  for (const a2 of d2.getRoot().listAnimations()) {
    if (!CLIPS[a2.getName()] || r1.listAnimations().some(a => a.getName() === a2.getName())) continue;
    const a = d1.createAnimation(a2.getName());
    for (const c of a2.listChannels()) {
      const tn = byName.get(c.getTargetNode() && c.getTargetNode().getName()); if (!tn) continue;
      const s2 = c.getSampler(), cp = x => d1.createAccessor().setType(x.getType()).setArray(x.getArray().slice()).setBuffer(buf);
      const s = d1.createAnimationSampler().setInput(cp(s2.getInput())).setOutput(cp(s2.getOutput())).setInterpolation(s2.getInterpolation());
      a.addSampler(s).addChannel(d1.createAnimationChannel().setTargetNode(tn).setTargetPath(c.getTargetPath()).setSampler(s));
    }
  }
  for (const a of r1.listAnimations()) {
    const k = CLIPS[a.getName()]; if (!k) { a.dispose(); continue; }
    a.setName(k);
    for (const c of a.listChannels()) {
      const p = c.getTargetPath(), n = c.getTargetNode().getName();
      // Skalierung nie, Verschiebung nur für Becken/Wurzel
      if (p === 'scale' || p === 'weights' || (p === 'translation' && !/^(pelvis|root)$/.test(n))) { const s = c.getSampler(); c.dispose(); s.dispose(); continue; }
      // auf FPS ausdünnen
      const s = c.getSampler(), inp = s.getInput().getArray(), out = s.getOutput().getArray(), w = s.getOutput().getElementSize();
      const ti = [], to = []; let last = -1;
      for (let i = 0; i < inp.length; i++) { if (i === inp.length - 1 || inp[i] - last >= 1 / FPS - 1e-4) { ti.push(inp[i]); for (let j = 0; j < w; j++) to.push(out[i * w + j]); last = inp[i]; } }
      s.setInput(d1.createAccessor().setType('SCALAR').setArray(new Float32Array(ti)).setBuffer(buf));
      s.setOutput(d1.createAccessor().setType(s.getOutput().getType()).setArray(new Float32Array(to)).setBuffer(buf));
    }
  }
  for (const m of r1.listMeshes()) m.dispose();
  for (const n of r1.listNodes()) if (n.getSkin()) n.setSkin(null);
  for (const s of r1.listSkins()) s.dispose();
  await d1.transform(resample({ tolerance: 2e-4 }), prune({ keepLeaves: true }), dedup());
  const done = new Set();   // dedup teilt Accessoren – jeden nur einmal umwandeln
  for (const a of r1.listAnimations()) for (const c of a.listChannels()) { const o = c.getSampler().getOutput(); if (c.getTargetPath() === 'rotation' && !done.has(o)) { done.add(o); shortRot(d1, o); } }
  const keep = new Set(); for (const a of r1.listAnimations()) for (const s of a.listSamplers()) { keep.add(s.getInput()); keep.add(s.getOutput()); }
  for (const x of r1.listAccessors()) if (!keep.has(x)) x.dispose();
  await io.write(path.join(OUT, 'anim.glb'), d1);
  return r1.listAnimations().map(a => a.getName());
}

fs.mkdirSync(OUT, { recursive: true });
await body('Superhero_Male_FullBody.gltf', 'mann.glb');
await body('Superhero_Female_FullBody.gltf', 'frau.glb');
const names = await anims();
for (const f of ['mann.glb', 'frau.glb', 'anim.glb']) console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + ' KB');
console.log('Bewegungen:', names.join(', '));

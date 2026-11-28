/* Sonderfahrzeuge für Pride City aus Sketchfab-Modellen (CC BY 4.0, Credits in public/CREDITS.md):
   je Fahrzeug eine GLB in public/assets/rides/<id>.glb, vorne = +Z, Boden y = 0, Mitte in x/z.
   Karosserie nach Material zusammengefasst („body“), Räder/Rotoren als eigene Knoten „wheel_*“ (Ursprung = Radmitte),
   damit das Spiel sie drehen kann. Geriggte Modelle werden in der Ruhepose eingebacken.
   Aufruf: node scripts/rides.mjs <ordner mit den Quell-GLBs>  (ONLY=bus,boat für einzelne)
   braucht: npm i --no-save sharp @gltf-transform/functions @gltf-transform/extensions
   Quellen (Datei im Ordner → Sketchfab):
     bus.glb        „City Bus - rigged | РоАЗ-5236“ von Yo.Ri
     firetruck.glb  „Firetruck“ von OzerGokmen
     boat.glb       „Riva aquarama lamborghini“ von Anton Kovalev
     escooter.glb   „OKAI ES600 e-scooter“ von Photogrammetry_Guest0
     hoverbike.glb  „Hover bike - "The Rocket"“ von TuppsM
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, join, weld, simplify, textureCompress, quantize, transformMesh } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = process.argv[2];
if (!SRC) { console.error('Aufruf: node scripts/rides.mjs <ordner mit den Quell-GLBs>'); process.exit(1); }
const OUT = new URL('../public/assets/rides/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

/* id, Quelle, Länge in m (entlang der Fahrtrichtung), yaw = Drehung in Grad, damit vorne +Z ist,
   drop = Knoten/Materialien weglassen, wheels = Rad-Knoten, simp = Anteil der Dreiecke, tex = Texturgröße */
const RIDES = [
  { id: 'bus', src: 'bus', len: 12, yaw: 180, drop: /shadow|interior|intdoors/i, wheels: /^wheel_/i, tex: 1024 },
  { id: 'firetruck', src: 'firetruck', len: 9, yaw: 0, drop: /shadow/i, wheels: null, simp: .35, tex: 256 },
  { id: 'boat', src: 'boat', len: 8.2, yaw: -90, glass: /^Glass_Low$/, tex: 1024 },
  { id: 'escooter', src: 'escooter', len: 1.15, yaw: -90, simp: .45, tex: 512 },
  { id: 'hoverbike', src: 'hoverbike', len: 3.6, yaw: -90, drop: /camera/i, simp: .45, tex: 1024 },
];
const ENV = (k) => (process.env[k] || '').split(',').filter(Boolean);
const only = ENV('ONLY');
const YAW = Object.fromEntries(ENV('YAW').map((s) => s.split('=')).map(([k, v]) => [k, +v]));

const mul = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };
const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const S = (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
const RY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
const xf = (m, x, y, z, w = 1) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w];

/** Geriggtes Mesh in der Ruhepose einbacken (Positionen und Normalen), Skin entfernen */
function bakeSkin(node) {
  const skin = node.getSkin(), joints = skin.listJoints(), ibm = skin.getInverseBindMatrices();
  const jm = joints.map((j, i) => mul(j.getWorldMatrix(), ibm ? Array.from(ibm.getElement(i, [])) : T(0, 0, 0)));
  const mesh = node.getMesh().clone(); node.setMesh(mesh);
  for (const p of mesh.listPrimitives()) {
    const J = p.getAttribute('JOINTS_0'), W = p.getAttribute('WEIGHTS_0'), P = p.getAttribute('POSITION').clone(), N = p.getAttribute('NORMAL')?.clone();
    if (!J || !W) continue;
    const j = [], w = [], v = [], n = [];
    for (let i = 0; i < P.getCount(); i++) {
      J.getElement(i, j); W.getElement(i, w); P.getElement(i, v); if (N) N.getElement(i, n);
      const pos = [0, 0, 0], nor = [0, 0, 0];
      for (let k = 0; k < 4; k++) { if (!w[k]) continue; const a = xf(jm[j[k]], v[0], v[1], v[2]); pos[0] += a[0] * w[k]; pos[1] += a[1] * w[k]; pos[2] += a[2] * w[k]; if (N) { const b = xf(jm[j[k]], n[0], n[1], n[2], 0); nor[0] += b[0] * w[k]; nor[1] += b[1] * w[k]; nor[2] += b[2] * w[k]; } }
      P.setElement(i, pos); if (N) { const l = Math.hypot(...nor) || 1; N.setElement(i, nor.map((q) => q / l)); }
    }
    p.setAttribute('POSITION', P); if (N) p.setAttribute('NORMAL', N);
    for (const s of p.listSemantics()) if (/^(JOINTS|WEIGHTS)_/.test(s)) p.setAttribute(s, null);
  }
  node.setSkin(null);
}

async function build(c) {
  const doc = await io.read(`${SRC}/${c.src}.glb`), root = doc.getRoot(), scene = root.getDefaultScene();
  // Animation: Pose zum Zeitpunkt pose (Sekunden, Standard 0) übernehmen, dann weg
  for (const a of root.listAnimations()) {
    for (const ch of a.listChannels()) {
      const smp = ch.getSampler(), inp = smp.getInput(), outp = smp.getOutput(), n = ch.getTargetNode(), path = ch.getTargetPath();
      if (!n || !inp || !outp || path === 'weights') continue;
      let i = 0; const t = c.pose || 0; while (i < inp.getCount() - 1 && inp.getScalar(i + 1) <= t) i++;
      const k = smp.getInterpolation() === 'CUBICSPLINE' ? 3 : 1, v = outp.getElement(i * k + (k === 3 ? 1 : 0), []);
      if (path === 'translation') n.setTranslation(v); else if (path === 'rotation') n.setRotation(v); else if (path === 'scale') n.setScale(v);
    }
    a.dispose();
  }
  const named = (n) => { const out = []; for (let q = n; q; q = q.getParentNode()) out.push(q.getName()); return out; };
  const nodes = []; scene.traverse((n) => { if (n.getMesh()) nodes.push(n); });
  const keep = nodes.filter((n) => !(c.drop && (named(n).some((s) => c.drop.test(s)) || n.getMesh().listPrimitives().some((p) => c.drop.test(p.getMaterial()?.getName() || '')))));
  // Weltmatrix einbacken; geriggte Meshes über ihre Knochen
  const yaw = ((YAW[c.id] ?? c.yaw) * Math.PI) / 180;
  const flat = [];
  for (const n of keep) {
    const wheel = c.wheels && named(n).find((s) => c.wheels.test(s));
    let m;
    if (n.getSkin()) { bakeSkin(n); m = T(0, 0, 0); } else { m = n.getWorldMatrix(); n.setMesh(n.getMesh().clone()); }
    transformMesh(n.getMesh(), mul(RY(yaw), m));
    if (c.glass && named(n).some((q) => c.glass.test(q))) n.getMesh().setName('glass');
    flat.push({ mesh: n.getMesh(), wheel, glass: n.getMesh().getName() === 'glass' });
  }
  // neue Szene
  for (const n of scene.listChildren()) scene.removeChild(n);
  for (const n of root.listNodes()) n.dispose();
  for (const s of root.listSkins()) s.dispose();
  const out = doc.createNode(c.id); scene.addChild(out);
  const tmp = flat.map((f) => { const n = doc.createNode('t').setMesh(f.mesh); out.addChild(n); return n; });
  const bb = getBounds(out), k = c.len / (bb.max[2] - bb.min[2]);
  const norm = mul(S(k), T(-(bb.min[0] + bb.max[0]) / 2, -bb.min[1], -(bb.min[2] + bb.max[2]) / 2));
  const body = doc.createMesh('body'), wheels = new Map();
  flat.forEach((f, i) => {
    transformMesh(f.mesh, norm); tmp[i].dispose();
    if (f.wheel) { if (!wheels.has(f.wheel)) wheels.set(f.wheel, doc.createMesh('w')); for (const p of f.mesh.listPrimitives()) wheels.get(f.wheel).addPrimitive(p); }
    else for (const p of f.mesh.listPrimitives()) { if (f.glass) { const gl = doc.createMaterial('glass').setBaseColorFactor([.55, .65, .7, .35]).setAlphaMode('BLEND').setRoughnessFactor(.05).setMetallicFactor(0); p.setMaterial(gl); } body.addPrimitive(p); }
  });
  out.addChild(doc.createNode('body').setMesh(body));
  for (const [name, me] of wheels) {
    const n = doc.createNode('w').setMesh(me); out.addChild(n);
    const b = getBounds(n), ctr = b.min.map((v, i) => (v + b.max[i]) / 2);
    transformMesh(me, T(-ctr[0], -ctr[1], -ctr[2])); n.setTranslation(ctr);
    const nm = 'wheel_' + (ctr[2] > 0 ? 'f' : 'r') + (ctr[0] > 0 ? 'l' : 'r') + '_' + name.replace(/\W+/g, '').toLowerCase();
    n.setName(nm); me.setName(nm); void name;
  }
  await doc.transform(prune(), dedup(), join({ keepNamed: true }), weld(), prune());
  if (c.simp) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: c.simp, error: .002 }), prune());
  // Material aufräumen (FBX-Umwandlung bei Sketchfab): dunkle Farbfaktoren vor Texturen, Selbstleuchten mit Grundtextur,
  // Transmission und Ganz-Transparenz (nur Glas bleibt durchsichtig), Metall ohne Metall-Textur
  for (const m of root.listMaterials()) {
    for (const e of ['KHR_materials_specular', 'KHR_materials_ior', 'KHR_materials_transmission', 'KHR_materials_emissive_strength']) m.setExtension(e, null);
    const tex = m.getBaseColorTexture(), f = m.getBaseColorFactor();
    if (tex && Math.max(f[0], f[1], f[2]) < .35) m.setBaseColorFactor([1, 1, 1, f[3]]);
    if (m.getEmissiveTexture() && (m.getEmissiveTexture() === tex || !c.emissive)) { m.setEmissiveTexture(null); m.setEmissiveFactor([0, 0, 0]); }
    if (!m.getMetallicRoughnessTexture() && m.getMetallicFactor() > .5 && !/chrom|metal|mirror|ayna/i.test(m.getName())) m.setMetallicFactor(.1);
    const glass = /glass|transp|cam1|window/i.test(m.getName());
    if (m.getAlphaMode() === 'BLEND' && !glass) m.setAlphaMode('OPAQUE');
    if (glass) { m.setAlphaMode('BLEND'); m.setDoubleSided(false); }
  }
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [c.tex, c.tex], quality: 82 }), prune(), dedup(), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeTexcoord: 12 }));
  await io.write(OUT + c.id + '.glb', doc);
  let tris = 0; for (const me of root.listMeshes()) for (const p of me.listPrimitives()) tris += (p.getIndices()?.getCount() ?? 0) / 3;
  const b2 = getBounds(scene);
  console.log(c.id, 'Dreiecke', tris, 'Maße', b2.min.map((v, i) => (b2.max[i] - v).toFixed(2)).join(' × '), 'Teile', root.listMeshes().map((me) => me.getName()).join(' '));
}

for (const c of RIDES) if (!only.length || only.includes(c.id)) await build(c);

/* Luftfahrzeuge für Pride City: public/assets/air/plane.glb (Wasserflugzeug „Möwe“) und heli.glb („Libelle“).
   Vorne = +Z, drehende Teile als eigene Knoten: „prop“ (Propeller, dreht um Z), „rotor“ (Y) und „tail“ (X) mit Drehpunkt im Ursprung.
   Quellen (siehe public/CREDITS.md):
     c208b.glb        Cessna-Caravan-ähnliches Flugzeug, zuujis-cc0/free-game-assets-aircraft (CC0)
     little-bird.js   „MH-6 Little Bird“ von AnirudhRao (CC BY 4.0), vereinfachte Geometrie aus jdubba1/warbird (dist/assets)
   Aufruf: node scripts/air.mjs <ordner mit c208b.glb und little-bird.js>
   little-bird.js wird nur als Text gelesen (JSON nach „export default“), nicht ausgeführt. */
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, weld, simplify, quantize, normals, join } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { mkdirSync, readFileSync } from 'node:fs';

const SRC = process.argv[2];
if (!SRC) { console.error('Aufruf: node scripts/air.mjs <ordner mit c208b.glb und little-bird.js>'); process.exit(1); }
const OUT = new URL('../public/assets/air/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

const PINK = [1, .08, .38, 1];
/** Punkte um 180° drehen (vorne -Z → +Z) und skalieren, Normalen mitdrehen */
function turn(prim, s, off = [0, 0, 0]) {
  const p = prim.getAttribute('POSITION'), n = prim.getAttribute('NORMAL'), v = [0, 0, 0];
  for (let i = 0; i < p.getCount(); i++) { p.getElement(i, v); p.setElement(i, [-(v[0] - off[0]) * s, (v[1] - off[1]) * s, -(v[2] - off[2]) * s]); }
  if (n) for (let i = 0; i < n.getCount(); i++) { n.getElement(i, v); n.setElement(i, [-v[0], v[1], -v[2]]); }
}
async function finish(doc, file, ratio) {
  await doc.transform(dedup(), join({ keepNamed: true }), weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error: .002, lockBorder: false }), normals({ overwrite: false }), prune(), quantize());
  let tris = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) tris += (p.getIndices() ?? p.getAttribute("POSITION")).getCount() / 3;
  await io.write(OUT + file, doc);
  console.log(file, tris, 'Dreiecke');
}

/* ---- Wasserflugzeug: Fahrwerk und Frachtbehälter weg (Schwimmer baut das Spiel), Rot → Pink ---- */
{
  const doc = await io.read(SRC + '/c208b.glb'), root = doc.getRoot(), sc = root.listScenes()[0], S = .62;
  for (const n of sc.listChildren()) if (/^(gear|cargo_pod)$/.test(n.getName())) { n.getMesh()?.dispose(); n.dispose(); }
  for (const m of root.listMaterials()) if (m.getName() === '#a8432d') m.setBaseColorFactor(PINK);
  for (const m of root.listMaterials()) { m.setMetallicFactor(m.getName() === '#233747' ? .3 : .1); m.setRoughnessFactor(m.getName() === '#233747' ? .08 : .35); }
  const body = doc.createNode('body'); sc.addChild(body);
  for (const n of [...sc.listChildren()]) {
    if (n === body) continue;
    const t = n.getTranslation();
    for (const p of n.getMesh().listPrimitives()) turn(p, S);
    if (n.getName() === 'propeller') { n.setName('prop'); n.setTranslation([-t[0] * S, t[1] * S, -t[2] * S]); continue; }
    n.setTranslation([0, 0, 0]).setName(''); sc.removeChild(n); body.addChild(n);
  }
  await finish(doc, 'plane.glb', 1);
}

/* ---- Hubschrauber: Teile nach Farbe, Rumpf pink ---- */
{
  const txt = readFileSync(SRC + '/little-bird.js', 'utf8');
  const src = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  const S = .8, doc = new Document(), buf = doc.createBuffer(), sc = doc.createScene('heli');
  const mat = {
    body: doc.createMaterial('lack').setBaseColorFactor(PINK).setMetallicFactor(.3).setRoughnessFactor(.3),
    ink: doc.createMaterial('dunkel').setBaseColorFactor([.03, .03, .035, 1]).setMetallicFactor(.4).setRoughnessFactor(.5),
    accent: doc.createMaterial('akzent').setBaseColorFactor([1, .75, .1, 1]).setMetallicFactor(.2).setRoughnessFactor(.4),
    glass: doc.createMaterial('glas').setBaseColorFactor([.05, .09, .12, 1]).setMetallicFactor(.4).setRoughnessFactor(.05),
  };
  const nodes = { body: doc.createNode('body') };
  for (const [k, p] of Object.entries(src.pivots)) nodes[k] = doc.createNode(k).setTranslation([-p[0] * S, p[1] * S, -p[2] * S]);
  for (const n of Object.values(nodes)) sc.addChild(n);
  for (const m of src.meshes) {
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(m.positions)).setBuffer(buf))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(m.indices)).setBuffer(buf))
      .setMaterial(mat[m.color] || mat.ink);
    turn(prim, S);
    nodes[m.parent].addChild(doc.createNode().setMesh(doc.createMesh().addPrimitive(prim)));
  }
  await finish(doc, 'heli.glb', .22);
}

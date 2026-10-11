// Reproduzierbarer Benchmark: Chunk-Erzeugung und Meshing mit festem Seed (läuft in Node, ohne Browser).
// Aufruf: node tools/bench.mjs [seed] [radius] [generator 1/2]
import { World } from '../src/world.js';
import { buildMesh } from '../src/mesher.js';

const seed = Number(process.argv[2] ?? 12345), R = Number(process.argv[3] ?? 6), gen = Number(process.argv[4] ?? 2);
const runs = 3, res = [];
for (let r = 0; r < runs; r++) {
  const w = new World(seed, new Map(), gen);
  const t0 = performance.now();
  for (let z = -R - 1; z <= R + 1; z++) for (let x = -R - 1; x <= R + 1; x++) w.ensure(x, z);
  const t1 = performance.now();
  let quads = 0, n = 0;
  for (let z = -R; z <= R; z++) for (let x = -R; x <= R; x++) {
    const m = buildMesh(w, w.getChunk(x, z)); n++;
    for (const k of ['opaque', 'trans', 'logo']) if (m[k]) quads += m[k].pos.length / 12;
  }
  const t2 = performance.now();
  res.push({ gen: (t1 - t0) / ((2 * R + 3) ** 2), mesh: (t2 - t1) / n, quads: quads / n });
}
const avg = k => (res.slice(1).reduce((s, r) => s + r[k], 0) / (runs - 1)).toFixed(2);
console.log(`Generator ${gen}, Seed ${seed}, Radius ${R}: Erzeugung ${avg('gen')} ms/Chunk, Meshing ${avg('mesh')} ms/Chunk, ${avg('quads')} Flächen/Chunk (Node ${process.version})`);

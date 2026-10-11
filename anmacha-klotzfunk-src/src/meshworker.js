// Web Worker: baut Chunk-Meshes abseits des Hauptthreads. Eingabe und Ergebnis werden übertragen, nicht kopiert.
import { meshFrom } from './mesher.js';

self.onmessage = e => {
  const { key, ver, nb, hms, maxY } = e.data;
  const r = meshFrom(nb, hms, maxY), tr = [];
  for (const k of ['opaque', 'trans', 'logo']) if (r[k]) tr.push(r[k].pos.buffer, r[k].uv.buffer, r[k].col.buffer, r[k].idx.buffer);
  self.postMessage({ key, ver, r }, tr);
};

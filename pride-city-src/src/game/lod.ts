/* Detailstufen (LOD) für die Rocketbox-Figuren. Eine Figur hat rund 8.000 Dreiecke und macht drei Viertel aller
   Dreiecke im Bild aus, obwohl die meisten weit weg nur ein paar Dutzend Pixel hoch sind. Hier wird jedes Figuren-Mesh
   einmal je Modell vereinfacht (meshoptimizer, Kanten und Nähte bleiben erhalten) und die vereinfachten Dreiecke hinten
   an denselben Indexpuffer gehängt. Eine Figur wählt ihre Stufe dann nur über Start und Länge ihres Teilstücks
   (SubMesh): gleiche Vertices, gleiche Knochen-Gewichte, gleiches Material, kein zweites Mesh und kein Umschalt-Ruck. */
import { MeshoptSimplifier } from 'meshoptimizer/simplifier';
import type { Mesh } from '../engine/bjs';

/** Anteil der Dreiecke je Stufe (Stufe 0 = voll) und erlaubte Abweichung (relativ zur Figurengröße) */
const LEVELS: Array<[number, number]> = [[.3, .012], [.1, .04]];
type Geo = NonNullable<Mesh['geometry']> & { _pcFull?: number };
export interface Lod { ranges: Array<[number, number]> }
const done = new WeakMap<object, Promise<Lod | null>>();

/** Vereinfachte Stufen für das Mesh (einmal je Geometrie, alle Figuren desselben Modells teilen sie) */
export function lodFor(m: Mesh): Promise<Lod | null> {
  const g = m.geometry as Geo | null; if (!g) return Promise.resolve(null);
  let p = done.get(g);
  if (!p) { p = build(g).catch(() => null); done.set(g, p); }
  return p;
}

async function build(g: Geo): Promise<Lod | null> {
  await MeshoptSimplifier.ready;
  // nur Meshes mit einem einzigen Teilstück über alle Dreiecke (die Rocketbox-Figuren: Körper, Kopf, Strähnen)
  if (g.meshes.some((m) => m.subMeshes?.length !== 1 || (m as Mesh).morphTargetManager)) return null;
  const idx = g.getIndices(), pos = g.getVerticesData('position');
  if (!idx || !pos || idx.length < 1500 || g._pcFull) return null;
  const src = idx instanceof Uint32Array ? idx : Uint32Array.from(idx as ArrayLike<number>);
  const p32 = pos instanceof Float32Array ? pos : Float32Array.from(pos as ArrayLike<number>);
  const full = src.length, parts: Uint32Array[] = [src], ranges: Array<[number, number]> = [[0, full]];
  let off = full, prev = src;
  for (const [ratio, err] of LEVELS) {
    const target = Math.max(3, Math.floor(full * ratio / 3) * 3);
    const [out] = MeshoptSimplifier.simplify(prev, p32, 3, target, err);
    if (out.length < 3 || out.length >= prev.length * .9) { ranges.push(ranges[ranges.length - 1]); continue; }
    parts.push(out); ranges.push([off, out.length]); off += out.length; prev = out;
  }
  if (parts.length === 1) return null;
  // Vertices umsortieren: zuerst die der gröbsten Stufe, dann die der mittleren, dann der Rest. So greift jede Stufe nur
  // auf einen engen Bereich [0, n) zu – viele Handy-GPUs (Mali) rechnen sonst jeden Vertex zwischen kleinstem und größtem
  // Index durch, und die gesparten Dreiecke würden in der Knochen-Rechnung nichts bringen.
  const nv = g.getTotalVertices(), remap = new Int32Array(nv).fill(-1);
  let next = 0;
  for (let k = parts.length - 1; k >= 0; k--) { const p = parts[k]; for (let i = 0; i < p.length; i++) if (remap[p[i]] < 0) remap[p[i]] = next++; }
  for (let v = 0; v < nv; v++) if (remap[v] < 0) remap[v] = next++;
  // erst alles prüfen und umrechnen, dann in einem Zug setzen (nie eine halb umsortierte Figur)
  const set: Array<[string, Float32Array, number]> = [];
  for (const kind of g.getVerticesDataKinds()) {
    const vb = g.getVertexBuffer(kind), d = g.getVerticesData(kind, true, true) as Float32Array | null;
    if (!vb || !d) return null;
    const st = vb.getSize(); if (d.length < nv * st) return null;
    const out = new Float32Array(d.length);
    for (let v = 0; v < nv; v++) { const a = v * st, b = remap[v] * st; for (let c = 0; c < st; c++) out[b + c] = d[a + c]; }
    set.push([kind, out, st]);
  }
  for (const [kind, out, st] of set) g.setVerticesData(kind, out, false, st);
  const all = new Uint32Array(off); let o = 0;
  for (const p of parts) { for (let i = 0; i < p.length; i++) all[o + i] = remap[p[i]]; o += p.length; }
  g._pcFull = full;
  g.setIndices(all, nv, false);
  // setIndices legt für jedes Mesh ein Teilstück über ALLE Indizes an: wieder auf die volle Figur stellen
  for (const m of g.meshes) { const s = m.subMeshes?.[0]; if (s) { s.indexStart = 0; s.indexCount = full; } }
  return { ranges };
}

/** Indizes der vollen Figur (ohne angehängte LOD-Stufen), z. B. zum Bemalen der Textur */
export function fullIndices(m: Mesh): ArrayLike<number> | null {
  const i = m.getIndices(), n = (m.geometry as Geo | null)?._pcFull;
  if (!i || !n || n >= i.length) return i;
  return (i as Uint32Array).subarray ? (i as Uint32Array).subarray(0, n) : Array.prototype.slice.call(i, 0, n);
}

/** Stufe je Abstand: am Handy etwas früher, am PC (große Bildschirme) später */
const FAR = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 1 : 1.6;
export const LOD_DIST = [13 * FAR, 30 * FAR];
/** ab hier wird eine Figur gar nicht mehr gezeichnet und nicht mehr animiert */
export const HIDE_DIST = 75 * FAR;

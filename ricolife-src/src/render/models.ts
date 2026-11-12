// Echte 3D-Modelle (Kenney Nature Kit und Car Kit, CC0 – siehe docs/ASSETS.md), vorgebacken mit tools/bake-models.mjs
// in public/models/kenney.bin. Laden ist optional: Fehlt die Datei (offline beim allerersten Start, alter Cache), bleiben die
// prozeduralen Modelle. Kein GLTFLoader nötig – die Datei enthält schon fertige, quantisierte Dreiecke.
import * as THREE from 'three';
import type { Raw } from './geo-builder';

/** Material-Art je Vertex (siehe tools/bake-models.mjs) */
export const enum MTag {
  Color = 0,
  Leaf = 1,
  Grass = 2,
  Petal = 3,
  Bark = 4,
  WoodInner = 5,
  Stone = 6,
}

export interface Model {
  name: string;
  /** Vertices indiziert: Position (Boden-Mitte bei 0), Normale, Farbe (linear) */
  p: Float32Array;
  n: Float32Array;
  c: Float32Array;
  t: Uint8Array;
  i: Uint16Array;
  size: [number, number, number];
}

const models = new Map<string, Model>();
let loading: Promise<boolean> | null = null;

export const MODEL_URL = './models/kenney.bin';

/** Binärdatei lesen (auch in Tests, dort aus dem Dateisystem) */
export function parseModels(buf: ArrayBuffer): Map<string, Model> {
  const out = new Map<string, Model>();
  const dv = new DataView(buf);
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'RLM1') throw new Error('Modelldatei ungültig');
  const jl = dv.getUint32(4, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))) as { models: Record<string, { vc: number; ic: number; min: number[]; max: number[]; p: number; n: number; c: number; t: number; i: number }> };
  const base = 8 + jl + ((4 - ((8 + jl) % 4)) % 4);
  for (const [name, m] of Object.entries(meta.models)) {
    const qp = new Int16Array(buf, base + m.p, m.vc * 3);
    const qn = new Int8Array(buf, base + m.n, m.vc * 3);
    const qc = new Uint8Array(buf, base + m.c, m.vc * 3);
    const span = [0, 1, 2].map((k) => m.max[k]! - m.min[k]!);
    const cx = (m.min[0]! + m.max[0]!) / 2, cz = (m.min[2]! + m.max[2]!) / 2;
    const p = new Float32Array(m.vc * 3), n = new Float32Array(m.vc * 3), c = new Float32Array(m.vc * 3);
    for (let k = 0; k < m.vc * 3; k += 3) {
      for (let a = 0; a < 3; a++) {
        p[k + a] = ((qp[k + a]! + 32768) / 65535) * span[a]! + m.min[a]!;
        n[k + a] = qn[k + a]! / 127;
        c[k + a] = qc[k + a]! / 255;
      }
      p[k] -= cx;
      p[k + 1] -= m.min[1]!;
      p[k + 2] -= cz;
    }
    out.set(name, { name, p, n, c, t: new Uint8Array(buf, base + m.t, m.vc).slice(), i: new Uint16Array(buf, base + m.i, m.ic).slice(), size: span as [number, number, number] });
  }
  return out;
}

/** Modelle einmal laden (höchstens timeoutMs warten). true = echte Modelle stehen bereit. */
export function loadModels(timeoutMs = 5000): Promise<boolean> {
  if (models.size) return Promise.resolve(true);
  if (typeof fetch === 'undefined') return Promise.resolve(false);
  loading ??= (async () => {
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const t = setTimeout(() => ctl?.abort(), timeoutMs);
      const r = await fetch(MODEL_URL, ctl ? { signal: ctl.signal } : undefined);
      clearTimeout(t);
      if (!r.ok) throw new Error(String(r.status));
      for (const [k, v] of parseModels(await r.arrayBuffer())) models.set(k, v);
      return true;
    } catch {
      loading = null; // später erneut versuchen
      return false;
    }
  })();
  return loading;
}

/** Für Tests: Modelle direkt setzen */
export function setModels(m: Map<string, Model>): void {
  models.clear();
  for (const [k, v] of m) models.set(k, v);
}

export function hasModels(): boolean {
  return models.size > 0;
}
export function model(name: string): Model | undefined {
  return models.get(name);
}

export interface RawOpts {
  /** Zielhöhe (gleichmäßig skaliert) */
  height?: number;
  /** Ziel-Länge in z (für Autos) */
  length?: number;
  /** nur Vertices mit diesen Material-Arten */
  tags?: MTag[];
  /** Farbe je Material-Art; ohne Angabe: Farbe aus dem Modell */
  color?: (tag: number, r: number, g: number, b: number, ny: number) => [number, number, number];
  /** Versatz nach dem Skalieren */
  off?: [number, number, number];
  /** Drehung um y (Bogenmaß) */
  rot?: number;
}

/** Nicht indizierte Rohgeometrie eines Modells (für GeoBuf.appendRaw) */
export function modelRaw(name: string, o: RawOpts = {}): Raw | null {
  const m = models.get(name);
  if (!m) return null;
  const s = o.height ? o.height / m.size[1] : o.length ? o.length / m.size[2] : 1;
  const keep = o.tags ? new Set<number>(o.tags) : null;
  let tris = 0;
  for (let k = 0; k < m.i.length; k += 3) if (!keep || keep.has(m.t[m.i[k]!]!)) tris++;
  const p = new Float32Array(tris * 9), n = new Float32Array(tris * 9), c = new Float32Array(tris * 9);
  const cs = Math.cos(o.rot ?? 0), sn = Math.sin(o.rot ?? 0);
  const [ox, oy, oz] = o.off ?? [0, 0, 0];
  let w = 0;
  for (let k = 0; k < m.i.length; k += 3) {
    if (keep && !keep.has(m.t[m.i[k]!]!)) continue;
    for (let j = 0; j < 3; j++) {
      const v = m.i[k + j]! * 3, tag = m.t[m.i[k + j]!]!;
      const x = m.p[v]! * s, z = m.p[v + 2]! * s;
      p[w] = x * cs + z * sn + ox;
      p[w + 1] = m.p[v + 1]! * s + oy;
      p[w + 2] = -x * sn + z * cs + oz;
      const nx = m.n[v]!, nz = m.n[v + 2]!;
      n[w] = nx * cs + nz * sn;
      n[w + 1] = m.n[v + 1]!;
      n[w + 2] = -nx * sn + nz * cs;
      const col = o.color ? o.color(tag, m.c[v]!, m.c[v + 1]!, m.c[v + 2]!, m.n[v + 1]!) : [m.c[v]!, m.c[v + 1]!, m.c[v + 2]!];
      c[w] = col[0];
      c[w + 1] = col[1];
      c[w + 2] = col[2];
      w += 3;
    }
  }
  return { p, n, c, v: tris * 3 };
}

/** Raw zu mehreren zusammenfügen */
export function joinRaw(list: (Raw | null)[]): Raw {
  const ok = list.filter((r): r is Raw => !!r);
  const v = ok.reduce((a, r) => a + r.v, 0);
  const p = new Float32Array(v * 3), n = new Float32Array(v * 3), c = new Float32Array(v * 3);
  let o = 0;
  for (const r of ok) {
    p.set(r.p.subarray(0, r.v * 3), o);
    n.set(r.n.subarray(0, r.v * 3), o);
    c.set(r.c.subarray(0, r.v * 3), o);
    o += r.v * 3;
  }
  return { p, n, c, v };
}

/** Indizierte BufferGeometry eines Modells (für einzelne bewegte Meshes wie Autos) */
const geoCache = new Map<string, THREE.BufferGeometry>();
export function modelGeometry(name: string, length?: number): THREE.BufferGeometry | null {
  const key = `${name}|${length ?? 0}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const m = models.get(name);
  if (!m) return null;
  const s = length ? length / m.size[2] : 1;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.p.map((x) => x * s), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(m.n, 3));
  g.setAttribute('color', new THREE.BufferAttribute(m.c, 3));
  g.setIndex(new THREE.BufferAttribute(m.i, 1));
  g.computeBoundingSphere();
  geoCache.set(key, g);
  return g;
}

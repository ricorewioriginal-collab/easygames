// Wachsender Geometriepuffer für zusammengeführte (gemergte) Meshes: nicht indizierte Dreiecke mit Position, Normale, Farbe.
// Wird beim Neuaufbau von Lots/Stadt benutzt (nicht pro Frame). Farben sind lineare RGB-Werte (THREE.Color nach setStyle).
import * as THREE from 'three';

/** Rohdaten einer Geometrie (nicht indiziert), v = Anzahl Vertices */
export interface Raw {
  p: Float32Array;
  n: Float32Array;
  c: Float32Array;
  v: number;
}

export const EMPTY_RAW: Raw = { p: new Float32Array(0), n: new Float32Array(0), c: new Float32Array(0), v: 0 };

export class GeoBuf {
  p: Float32Array;
  n: Float32Array;
  c: Float32Array;
  v = 0;
  /** Farbe für die nächsten Primitive */
  r = 1;
  g = 1;
  b = 1;
  /** Abdunklung unten (Fake-AO) für box(): Faktor für Vertices an der Unterkante der Seitenflächen */
  ao = 1;

  constructor(capVerts = 4096) {
    this.p = new Float32Array(capVerts * 3);
    this.n = new Float32Array(capVerts * 3);
    this.c = new Float32Array(capVerts * 3);
  }

  clear(): void {
    this.v = 0;
  }

  reserve(add: number): void {
    const need = (this.v + add) * 3;
    if (need <= this.p.length) return;
    let cap = this.p.length * 2;
    while (cap < need) cap *= 2;
    const grow = (a: Float32Array): Float32Array => {
      const b = new Float32Array(cap);
      b.set(a.subarray(0, this.v * 3));
      return b;
    };
    this.p = grow(this.p);
    this.n = grow(this.n);
    this.c = grow(this.c);
  }

  color(r: number, g: number, b: number): this {
    this.r = r;
    this.g = g;
    this.b = b;
    return this;
  }
  colorC(c: THREE.Color, mul = 1): this {
    this.r = c.r * mul;
    this.g = c.g * mul;
    this.b = c.b * mul;
    return this;
  }

  /** einzelner Vertex (vorher reserve aufrufen) */
  vtx(x: number, y: number, z: number, nx: number, ny: number, nz: number, r: number, g: number, b: number): void {
    const i = this.v * 3;
    this.p[i] = x;
    this.p[i + 1] = y;
    this.p[i + 2] = z;
    this.n[i] = nx;
    this.n[i + 1] = ny;
    this.n[i + 2] = nz;
    this.c[i] = r;
    this.c[i + 1] = g;
    this.c[i + 2] = b;
    this.v++;
  }

  /** Viereck a-b-c-d (gegen den Uhrzeigersinn von der Vorderseite gesehen) mit flacher Normale; mulBottom dunkelt a,b ab */
  quad(
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    cx: number, cy: number, cz: number,
    dx: number, dy: number, dz: number,
    mulAB = 1,
  ): void {
    this.reserve(6);
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const wx = dx - ax, wy = dy - ay, wz = dz - az;
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    const r = this.r, g = this.g, b = this.b;
    const r2 = r * mulAB, g2 = g * mulAB, b2 = b * mulAB;
    this.vtx(ax, ay, az, nx, ny, nz, r2, g2, b2);
    this.vtx(bx, by, bz, nx, ny, nz, r2, g2, b2);
    this.vtx(cx, cy, cz, nx, ny, nz, r, g, b);
    this.vtx(ax, ay, az, nx, ny, nz, r2, g2, b2);
    this.vtx(cx, cy, cz, nx, ny, nz, r, g, b);
    this.vtx(dx, dy, dz, nx, ny, nz, r, g, b);
  }

  tri(ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number): void {
    this.reserve(3);
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const wx = cx - ax, wy = cy - ay, wz = cz - az;
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    this.vtx(ax, ay, az, nx, ny, nz, this.r, this.g, this.b);
    this.vtx(bx, by, bz, nx, ny, nz, this.r, this.g, this.b);
    this.vtx(cx, cy, cz, nx, ny, nz, this.r, this.g, this.b);
  }

  /** achsparalleler Quader. Optional eigene Farben für Ober-/Unterseite und Seiten (-x,+x,-z,+z) als THREE.Color.
   *  skipBottom: Unterseite weglassen (steht auf dem Boden). */
  box(
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
    o?: { top?: THREE.Color; nx?: THREE.Color | null; px?: THREE.Color | null; nz?: THREE.Color | null; pz?: THREE.Color | null; skipBottom?: boolean; skipTop?: boolean },
  ): void {
    const r = this.r, g = this.g, b = this.b, ao = this.ao;
    const set = (c?: THREE.Color | null): void => {
      if (c) this.color(c.r, c.g, c.b);
      else this.color(r, g, b);
    };
    // Seiten (Unterkante zuerst → AO)
    // null = Seite weglassen
    if (o?.pz !== null) { set(o?.pz); this.quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1, ao); }
    if (o?.nz !== null) { set(o?.nz); this.quad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0, ao); }
    if (o?.px !== null) { set(o?.px); this.quad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1, ao); }
    if (o?.nx !== null) { set(o?.nx); this.quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0, ao); }
    if (!o?.skipTop) {
      set(o?.top);
      this.quad(x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0);
    }
    if (!o?.skipBottom) {
      set(undefined);
      this.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1);
    }
    this.color(r, g, b);
  }

  /** Rohdaten anhängen, um die y-Achse gedreht (cos/sin wie Three.js rotation.y) und verschoben, Farbe multipliziert */
  appendRaw(raw: Raw, cos: number, sin: number, tx: number, ty: number, tz: number, mr = 1, mg = 1, mb = 1, scale = 1): void {
    if (!raw.v) return;
    this.reserve(raw.v);
    const P = this.p, N = this.n, C = this.c, sp = raw.p, sn = raw.n, sc = raw.c;
    let o = this.v * 3;
    for (let i = 0; i < raw.v * 3; i += 3, o += 3) {
      const x = sp[i]! * scale, y = sp[i + 1]! * scale, z = sp[i + 2]! * scale;
      P[o] = x * cos + z * sin + tx;
      P[o + 1] = y + ty;
      P[o + 2] = -x * sin + z * cos + tz;
      const nx = sn[i]!, nz = sn[i + 2]!;
      N[o] = nx * cos + nz * sin;
      N[o + 1] = sn[i + 1]!;
      N[o + 2] = -nx * sin + nz * cos;
      C[o] = sc[i]! * mr;
      C[o + 1] = sc[i + 1]! * mg;
      C[o + 2] = sc[i + 2]! * mb;
    }
    this.v += raw.v;
  }

  /** Kopie der aktuellen Daten als Raw (für Caches) */
  toRaw(): Raw {
    const n = this.v * 3;
    return { p: this.p.slice(0, n), n: this.n.slice(0, n), c: this.c.slice(0, n), v: this.v };
  }

  /** neue BufferGeometry (Normale Int8, Farbe Uint8 → spart GPU-Speicher) aus dem Bereich [from, to) der Vertices */
  toGeometry(from = 0, to = this.v): THREE.BufferGeometry {
    return rawToGeometry(this.p, this.n, this.c, from, to);
  }
}

export function rawToGeometry(p: Float32Array, n: Float32Array, c: Float32Array, from: number, to: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const cnt = Math.max(0, to - from);
  const pos = p.slice(from * 3, to * 3);
  const nrm = new Int8Array(cnt * 3);
  const col = new Uint8Array(cnt * 3);
  for (let i = 0, j = from * 3; i < cnt * 3; i++, j++) {
    const nv = n[j]!;
    nrm[i] = Math.max(-127, Math.min(127, Math.round(nv * 127)));
    const cv = c[j]!;
    col[i] = cv <= 0 ? 0 : cv >= 1 ? 255 : Math.round(cv * 255);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3, true));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3, true));
  if (cnt) g.computeBoundingSphere();
  else g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0);
  return g;
}

const _c = new THREE.Color();
/** Hex-Farbe → lineares RGB (gecacht) */
const colCache = new Map<string, THREE.Color>();
export function col(hex: string): THREE.Color {
  let c = colCache.get(hex);
  if (!c) {
    c = new THREE.Color();
    try {
      c.setStyle(hex);
    } catch {
      c.setRGB(1, 0, 1);
    }
    colCache.set(hex, c);
  }
  return c;
}
/** Hilfsfunktion: Mischfarbe (neues Objekt, nicht pro Frame verwenden) */
export function mixCol(a: string, b: string, t: number): THREE.Color {
  return _c.copy(col(a)).lerp(col(b), t).clone();
}

/** deterministisches Rauschen 0..1 aus zwei Ganzzahlen */
export function hash2(x: number, z: number): number {
  let h = (x * 374761393 + z * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

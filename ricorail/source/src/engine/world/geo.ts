// Geometrie-Sammler: Dreiecke direkt in Arrays schreiben (ein Mesh je Material und Chunk, kein Merge-Umweg).
import * as THREE from 'three';

export type RGB = [number, number, number];
export type V3 = [number, number, number];

const _c = new THREE.Color();
/** sRGB-Hex → lineare Farbe (Vertexfarben sind linear) */
export function rgb(hex: number): RGB { _c.setHex(hex); return [_c.r, _c.g, _c.b]; }
export function rgbStr(s: string, fb: RGB): RGB { try { _c.set(s); return [_c.r, _c.g, _c.b]; } catch { return fb; } }
export function mix(a: RGB, b: RGB, t: number): RGB { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
export function scale(a: RGB, k: number): RGB { return [a[0] * k, a[1] * k, a[2] * k]; }

export class GeoBuf {
  // wachsende typisierte Puffer (keine JS-Zahlenarrays → wenig Müll)
  private P = new Float32Array(3 * 256); private N = new Float32Array(3 * 256); private Cc = new Uint8Array(3 * 256);
  private U: Float32Array | null; private I = new Uint32Array(384);
  private nv = 0; private ni = 0;
  /** Ursprung des Chunks: alle Punkte werden relativ dazu gespeichert (float32-Genauigkeit) */
  ox = 0; oz = 0;
  constructor(withUv = false) { this.U = withUv ? new Float32Array(2 * 256) : null; }
  get verts() { return this.nv; }
  get tris() { return this.ni / 3; }

  private growV() {
    const cap = this.P.length / 3 * 2;
    const g = <T extends Float32Array | Uint8Array>(a: T, k: number): T => { const b = new (a.constructor as { new(n: number): T })(cap * k); b.set(a); return b; };
    this.P = g(this.P, 3); this.N = g(this.N, 3); this.Cc = g(this.Cc, 3); if (this.U) this.U = g(this.U, 2); if (this.G) this.G = g(this.G, 1);
  }

  /** Punkt in Weltkoordinaten (x,z absolut) */
  v(x: number, y: number, z: number, nx: number, ny: number, nz: number, col: RGB, u = 0, w = 0): number {
    const k = this.nv;
    if (k * 3 + 3 > this.P.length) this.growV();
    const o = k * 3;
    this.P[o] = x - this.ox; this.P[o + 1] = y; this.P[o + 2] = z - this.oz;
    this.N[o] = nx; this.N[o + 1] = ny; this.N[o + 2] = nz;
    this.Cc[o] = c8(col[0]); this.Cc[o + 1] = c8(col[1]); this.Cc[o + 2] = c8(col[2]);
    if (this.U) { this.U[k * 2] = u; this.U[k * 2 + 1] = w; }
    this.nv = k + 1;
    return k;
  }
  tri(a: number, b: number, c: number) {
    if (this.ni + 3 > this.I.length) { const n = new Uint32Array(this.I.length * 2); n.set(this.I); this.I = n; }
    this.I[this.ni++] = a; this.I[this.ni++] = b; this.I[this.ni++] = c;
  }

  /** Viereck a-b-c-d (Umlaufsinn egal): Normale wird zur Richtung out gedreht. uv optional je Ecke. */
  quad(a: V3, b: V3, c: V3, d: V3, col: RGB, ox: number, oy: number, oz: number, uvs?: number[]) {
    const ex = c[0] - a[0], ey = c[1] - a[1], ez = c[2] - a[2];
    const fx = d[0] - b[0], fy = d[1] - b[1], fz = d[2] - b[2];
    let nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const flip = nx * ox + ny * oy + nz * oz < 0;
    if (flip) { nx = -nx; ny = -ny; nz = -nz; }
    const u = uvs ?? Z8;
    const i0 = this.v(a[0], a[1], a[2], nx, ny, nz, col, u[0], u[1]);
    const i1 = this.v(b[0], b[1], b[2], nx, ny, nz, col, u[2], u[3]);
    const i2 = this.v(c[0], c[1], c[2], nx, ny, nz, col, u[4], u[5]);
    const i3 = this.v(d[0], d[1], d[2], nx, ny, nz, col, u[6], u[7]);
    if (flip) { this.tri(i0, i2, i1); this.tri(i0, i3, i2); } else { this.tri(i0, i1, i2); this.tri(i0, i2, i3); }
  }
  /** Dreieck mit Ausrichtung */
  tri3(a: V3, b: V3, c: V3, col: RGB, ox: number, oy: number, oz: number) {
    const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2], fx = c[0] - a[0], fy = c[1] - a[1], fz = c[2] - a[2];
    let nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const flip = nx * ox + ny * oy + nz * oz < 0;
    if (flip) { nx = -nx; ny = -ny; nz = -nz; }
    const i0 = this.v(a[0], a[1], a[2], nx, ny, nz, col), i1 = this.v(b[0], b[1], b[2], nx, ny, nz, col), i2 = this.v(c[0], c[1], c[2], nx, ny, nz, col);
    if (flip) this.tri(i0, i2, i1); else this.tri(i0, i1, i2);
  }

  /** Quader: Bodenmitte (x,y,z), Längsrichtung (dx,dz), Länge L, Breite W, Höhe H. Ohne Boden. */
  box(x: number, y: number, z: number, dx: number, dz: number, L: number, W: number, H: number, col: RGB, top: RGB = col) {
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const sx = -dz, sz = dx, hl = L / 2, hw = W / 2;
    const P = (a: number, b: number, h: number): V3 => [x + dx * a + sx * b, y + h, z + dz * a + sz * b];
    const p0 = P(-hl, -hw, 0), p1 = P(hl, -hw, 0), p2 = P(hl, hw, 0), p3 = P(-hl, hw, 0);
    const q0 = P(-hl, -hw, H), q1 = P(hl, -hw, H), q2 = P(hl, hw, H), q3 = P(-hl, hw, H);
    this.quad(q0, q1, q2, q3, top, 0, 1, 0);
    this.quad(p0, p1, q1, q0, col, -sx, 0, -sz);
    this.quad(p2, p3, q3, q2, col, sx, 0, sz);
    this.quad(p1, p2, q2, q1, col, dx, 0, dz);
    this.quad(p3, p0, q0, q3, col, -dx, 0, -dz);
  }

  /** Prisma/Kegel/Zylinder: Bodenmitte, Radien unten/oben, Höhe, Seiten. Deckel oben wenn r1>0. */
  prism(x: number, y: number, z: number, r0: number, r1: number, h: number, sides: number, col: RGB, capCol: RGB | null = col, rot = 0) {
    for (let k = 0; k < sides; k++) {
      const a0 = rot + (k / sides) * Math.PI * 2, a1 = rot + ((k + 1) / sides) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const am = (a0 + a1) / 2;
      const ox = Math.cos(am), oz = Math.sin(am);
      if (r1 > 0) this.quad([x + c0 * r0, y, z + s0 * r0], [x + c1 * r0, y, z + s1 * r0], [x + c1 * r1, y + h, z + s1 * r1], [x + c0 * r1, y + h, z + s0 * r1], col, ox, (r0 - r1) / h, oz);
      else this.tri3([x + c0 * r0, y, z + s0 * r0], [x + c1 * r0, y, z + s1 * r0], [x, y + h, z], col, ox, r0 / h, oz);
      if (r1 > 0 && capCol) this.tri3([x + c0 * r1, y + h, z + s0 * r1], [x + c1 * r1, y + h, z + s1 * r1], [x, y + h, z], capCol, 0, 1, 0);
    }
  }

  /** Satteldach über Rechteck (Mitte x,z auf Höhe y, Längsrichtung dx,dz) */
  roof(x: number, y: number, z: number, dx: number, dz: number, L: number, W: number, h: number, col: RGB, gable: RGB) {
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const sx = -dz, sz = dx, hl = L / 2, hw = W / 2;
    const P = (a: number, b: number, hh: number): V3 => [x + dx * a + sx * b, y + hh, z + dz * a + sz * b];
    const r0 = P(-hl, 0, h), r1 = P(hl, 0, h);
    this.quad(P(-hl, -hw, 0), P(hl, -hw, 0), r1, r0, col, -sx, 1, -sz);
    this.quad(P(hl, hw, 0), P(-hl, hw, 0), r0, r1, col, sx, 1, sz);
    this.tri3(P(hl, -hw, 0), P(hl, hw, 0), r1, gable, dx, 0, dz);
    this.tri3(P(-hl, hw, 0), P(-hl, -hw, 0), r0, gable, -dx, 0, -dz);
  }

  /** Anderen Puffer anhängen; markiert dessen Punkte als selbstleuchtend (Attribut glow) */
  appendGlow(o: GeoBuf) {
    // Attribut immer anlegen: fehlende Attribute lesen sonst einen beliebigen globalen Vorgabewert
    if (!this.G) this.G = new Uint8Array(this.P.length / 3);
    if (!o.nv) return;
    const base = this.nv;
    while ((base + o.nv) * 3 > this.P.length) this.growV();
    if (this.G.length < this.P.length / 3) { const g = new Uint8Array(this.P.length / 3); g.set(this.G); this.G = g; }
    this.P.set(o.P.subarray(0, o.nv * 3), base * 3); this.N.set(o.N.subarray(0, o.nv * 3), base * 3); this.Cc.set(o.Cc.subarray(0, o.nv * 3), base * 3);
    this.G.fill(255, base, base + o.nv);
    this.nv += o.nv;
    for (let k = 0; k < o.ni; k += 3) this.tri(o.I[k] + base, o.I[k + 1] + base, o.I[k + 2] + base);
  }
  private G: Uint8Array | null = null;

  toGeometry(): THREE.BufferGeometry | null {
    if (!this.ni) return null;
    const g = new THREE.BufferGeometry(), nv = this.nv;
    g.setAttribute('position', new THREE.BufferAttribute(this.P.slice(0, nv * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.N.slice(0, nv * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.Cc.slice(0, nv * 3), 3, true));
    if (this.U) g.setAttribute('uv', new THREE.BufferAttribute(this.U.slice(0, nv * 2), 2));
    if (this.G) g.setAttribute('glow', new THREE.BufferAttribute(this.G.slice(0, nv), 1, true));
    const idx = nv > 65535 ? this.I.slice(0, this.ni) : Uint16Array.from(this.I.subarray(0, this.ni));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    return g;
  }
}
const c8 = (v: number) => (v <= 0 ? 0 : v >= 1 ? 255 : (v * 255 + 0.5) | 0);
const Z8 = [0, 0, 0, 0, 0, 0, 0, 0];

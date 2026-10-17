// Prozedurale Low-Poly-Haustiere (Hund, Katze) als ein SkinnedMesh mit kleinem Skelett.
// Konvention wie bei Menschen: Pfoten bei lokal y = 0, Blick nach +z; der Aufrufer setzt position/rotation.y.
// 'sleep' liegt eingerollt auf lokal y = 0 (für Körbchen object.y = slot.y).
import * as THREE from 'three';
import { GeoBuilder, PI, clamp, hash01, makeBones, makeSkinned, mix, osc, pulse, shade, smooth01 } from './anim';

export type PetAnim = 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'eat' | 'play' | 'beg' | 'pet';

/** Fellfarben (Index = PetSeed.fur). [Grundfarbe, Abzeichen (Brust/Schnauze/Pfoten)] */
export const FUR_COLORS: readonly { name: string; base: string; mark: string }[] = [
  { name: 'Karamell', base: '#c8894a', mark: '#f1dfc2' },
  { name: 'Schokobraun', base: '#5a3a26', mark: '#c99a6e' },
  { name: 'Creme', base: '#e9dcc3', mark: '#fbf6ec' },
  { name: 'Grau getigert', base: '#8a8a8e', mark: '#d9d6d0' },
  { name: 'Schwarz', base: '#2a2624', mark: '#f2efe8' },
  { name: 'Rotblond', base: '#d9893e', mark: '#f6e2c4' },
  { name: 'Weiß', base: '#f3f0ea', mark: '#e6c9b0' },
  { name: 'Silber', base: '#b9bcc2', mark: '#5b5e66' },
];

const P = {
  root: 0, body: 1, chest: 2, neck: 3, head: 4, earL: 5, earR: 6, tail1: 7, tail2: 8, tail3: 9,
  legFL: 10, lowFL: 11, legFR: 12, lowFR: 13, legBL: 14, lowBL: 15, legBR: 16, lowBR: 17, eyes: 18,
} as const;
const NBP = 19;
const EXT = 1; // Wurzel-Verschiebung y

interface PetDims {
  k: number; bodyY: number; rearZ: number; frontZ: number; legX: number; kneeY: number; headY: number; headZ: number; neckY: number; neckZ: number;
  bodyR: number; headR: number; legR: number; tailLen: number; cat: boolean;
}

function petDims(kind: 'dog' | 'cat'): PetDims {
  if (kind === 'cat')
    return { k: 0.62, bodyY: 0.19, rearZ: -0.12, frontZ: 0.1, legX: 0.045, kneeY: 0.095, headY: 0.31, headZ: 0.19, neckY: 0.23, neckZ: 0.15, bodyR: 0.075, headR: 0.078, legR: 0.022, tailLen: 0.065, cat: true };
  return { k: 1, bodyY: 0.3, rearZ: -0.17, frontZ: 0.14, legX: 0.08, kneeY: 0.15, headY: 0.5, headZ: 0.29, neckY: 0.38, neckZ: 0.22, bodyR: 0.125, headR: 0.125, legR: 0.038, tailLen: 0.075, cat: false };
}

function buildPet(fur: number, d: PetDims): THREE.BufferGeometry {
  const g = new GeoBuilder();
  const f = FUR_COLORS[((fur | 0) % FUR_COLORS.length + FUR_COLORS.length) % FUR_COLORS.length]!;
  const c = f.base, m = f.mark;
  const dark = shade(c, 0.75);
  const cat = d.cat;
  const R = d.bodyR;
  // Rumpf: hinten (body) + vorne (chest)
  g.sph(P.body, c, R * 0.95, R * 0.95, R * 1.5, 0, d.bodyY, d.rearZ + R * 0.5, 9, 7);
  g.sph(P.chest, c, R, R * 1.05, R * 1.45, 0, d.bodyY + R * 0.08, d.frontZ - R * 0.35, 9, 7);
  g.sph(P.chest, m, R * 0.65, R * 0.75, R * 0.5, 0, d.bodyY - R * 0.25, d.frontZ + R * 0.55, 7, 5);
  g.sph(P.body, m, R * 0.6, R * 0.4, R * 1.1, 0, d.bodyY - R * 0.6, d.rearZ + R * 0.6, 7, 4);
  // Hals
  g.limb(P.neck, c, R * 0.55, R * 0.6, 0, d.headY - 0.02, d.headZ - 0.02, 0, d.neckY - R * 0.3, d.neckZ - R * 0.2, 7);
  if (!cat) g.ring(P.neck, '#c44536', R * 0.58, R * 0.1, 0, d.neckY + R * 0.15, d.neckZ + R * 0.12, PI / 2 + 0.6, 0, 0, 1, 1, 10);
  else g.ring(P.neck, '#33658a', R * 0.62, R * 0.1, 0, d.neckY + R * 0.3, d.neckZ + R * 0.2, PI / 2 + 0.6, 0, 0, 1, 1, 10);
  // Kopf
  const H = d.headR;
  g.sph(P.head, c, H * (cat ? 1.08 : 1), H * 0.95, H, 0, d.headY, d.headZ, 10, 7);
  if (cat) {
    g.sph(P.head, m, H * 0.55, H * 0.4, H * 0.4, 0, d.headY - H * 0.35, d.headZ + H * 0.7, 7, 4);
    g.sph(P.head, '#d77a8a', H * 0.12, H * 0.09, H * 0.08, 0, d.headY - H * 0.12, d.headZ + H * 1.02, 5, 3);
    // Schnurrhaare
    for (const sg of [1, -1]) for (const dy of [0, 0.12]) g.box(P.head, '#f4f1ea', H * 0.7, H * 0.025, H * 0.025, sg * H * 0.55, d.headY - H * (0.3 + dy), d.headZ + H * 0.8, 0, -sg * 0.3, sg * (dy ? -0.15 : 0.1));
  } else {
    g.sph(P.head, m, H * 0.5, H * 0.45, H * 0.7, 0, d.headY - H * 0.3, d.headZ + H * 0.85, 8, 5);
    g.sph(P.head, '#1d1a18', H * 0.18, H * 0.14, H * 0.12, 0, d.headY - H * 0.12, d.headZ + H * 1.5, 6, 4);
    g.box(P.head, '#e07a86', H * 0.3, H * 0.05, H * 0.35, 0, d.headY - H * 0.62, d.headZ + H * 1.05, 0.25, 0, 0);
  }
  // Augen (Augen-Bone → Blinzeln)
  const eyeC = cat ? '#8bbf3a' : '#2b1d14';
  for (const sg of [1, -1]) {
    const ex = sg * H * 0.42, ey = d.headY + H * 0.12, ez = d.headZ + H * 0.82;
    g.sph(P.eyes, eyeC, H * (cat ? 0.2 : 0.16), H * (cat ? 0.22 : 0.17), H * 0.1, ex, ey, ez, 6, 4);
    if (cat) g.sph(P.eyes, '#111111', H * 0.06, H * 0.17, H * 0.05, ex, ey, ez + H * 0.07, 4, 3);
    g.sph(P.eyes, '#ffffff', H * 0.05, H * 0.05, H * 0.03, ex + H * 0.06, ey + H * 0.07, ez + H * 0.1, 4, 3);
  }
  // Ohren
  for (const [bone, sg] of [[P.earL, 1], [P.earR, -1]] as const) {
    const ex = sg * H * 0.58, ey = d.headY + H * 0.7, ez = d.headZ - H * 0.1;
    if (cat) {
      g.cyl(bone, c, 0.001, H * 0.32, H * 0.55, ex, ey + H * 0.2, ez, 0, 0, -sg * 0.25, 4, 0.55);
      g.cyl(bone, '#e8a2ad', 0.001, H * 0.2, H * 0.38, ex, ey + H * 0.16, ez + H * 0.06, 0, 0, -sg * 0.25, 4, 0.3);
    } else {
      g.sph(bone, dark, H * 0.22, H * 0.55, H * 0.4, ex + sg * H * 0.25, ey - H * 0.45, ez, 6, 4, 0, 0, sg * 0.35);
    }
  }
  // Schwanz (3 Glieder, zeigt nach hinten oben)
  const tl = d.tailLen * (cat ? 1.6 : 1);
  const t0z = d.rearZ - R * 0.9, t0y = d.bodyY + R * 0.5;
  const tr = cat ? R * 0.2 : R * 0.26;
  for (let i = 0; i < 3; i++) {
    const bone = P.tail1 + i;
    const y0 = t0y + i * tl * 0.55, z0 = t0z - i * tl * 0.83;
    g.limb(bone, i === 2 && !cat ? m : c, tr * (1 - i * 0.18), tr * (0.85 - i * 0.18), 0, y0, z0, 0, y0 + tl * 0.55, z0 - tl * 0.83, 6);
    g.sph(bone, i === 2 && !cat ? m : c, tr * (1 - i * 0.18), tr * (1 - i * 0.18), tr * (1 - i * 0.18), 0, y0, z0, 5, 4);
  }
  // Beine
  const legs: [number, number, number, number][] = [
    [P.legFL, P.lowFL, 1, d.frontZ], [P.legFR, P.lowFR, -1, d.frontZ], [P.legBL, P.lowBL, 1, d.rearZ], [P.legBR, P.lowBR, -1, d.rearZ],
  ];
  for (const [up, low, sg, z] of legs) {
    const x = sg * d.legX;
    const back = z === d.rearZ;
    const topY = d.bodyY - (back ? 0 : 0.0);
    g.limb(up, c, d.legR * (back ? 1.6 : 1.3), d.legR * 1.05, x, topY, z, x, d.kneeY, z, 6);
    g.limb(low, c, d.legR * 1.05, d.legR * 0.9, x, d.kneeY, z, x, d.legR * 0.8, z, 6);
    g.sph(low, m, d.legR * 1.25, d.legR * 0.9, d.legR * 1.6, x, d.legR * 0.8, z + d.legR * 0.6, 5, 4);
  }
  return g.build(true);
}

export class PetModel {
  readonly object: THREE.Object3D;
  readonly kind: 'dog' | 'cat';
  private mesh: THREE.SkinnedMesh;
  private bones: THREE.Bone[];
  private d: PetDims;
  private readonly cur = new Float32Array(NBP * 3 + EXT);
  private readonly from = new Float32Array(NBP * 3 + EXT);
  private readonly tgt = new Float32Array(NBP * 3 + EXT);
  private last: PetAnim | null = null;
  private blendT = 1;
  private clock = 0;
  private nextBlink = 2;
  private blinkT = -1;
  private readonly seed = Math.random() * 100;

  constructor(kind: 'dog' | 'cat', fur: number) {
    this.kind = kind;
    this.object = new THREE.Group();
    this.object.name = 'pet';
    const d = (this.d = petDims(kind));
    const geo = buildPet(fur, d);
    const H = d.headR;
    const defs = [
      { p: -1, x: 0, y: 0, z: 0 },
      { p: 0, x: 0, y: d.bodyY, z: d.rearZ },
      { p: 1, x: 0, y: d.bodyY, z: (d.rearZ + d.frontZ) * 0.5 },
      { p: 2, x: 0, y: d.neckY, z: d.neckZ - d.bodyR * 0.3 },
      { p: 3, x: 0, y: d.headY - H * 0.5, z: d.headZ - H * 0.2 },
      { p: 4, x: H * 0.58, y: d.headY + H * 0.7, z: d.headZ - H * 0.1 },
      { p: 4, x: -H * 0.58, y: d.headY + H * 0.7, z: d.headZ - H * 0.1 },
      { p: 1, x: 0, y: d.bodyY + d.bodyR * 0.5, z: d.rearZ - d.bodyR * 0.9 },
      { p: 7, x: 0, y: d.bodyY + d.bodyR * 0.5 + d.tailLen * (d.cat ? 1.6 : 1) * 0.55, z: d.rearZ - d.bodyR * 0.9 - d.tailLen * (d.cat ? 1.6 : 1) * 0.83 },
      { p: 8, x: 0, y: d.bodyY + d.bodyR * 0.5 + d.tailLen * (d.cat ? 1.6 : 1) * 1.1, z: d.rearZ - d.bodyR * 0.9 - d.tailLen * (d.cat ? 1.6 : 1) * 1.66 },
      { p: 2, x: d.legX, y: d.bodyY, z: d.frontZ },
      { p: 10, x: d.legX, y: d.kneeY, z: d.frontZ },
      { p: 2, x: -d.legX, y: d.bodyY, z: d.frontZ },
      { p: 12, x: -d.legX, y: d.kneeY, z: d.frontZ },
      { p: 1, x: d.legX, y: d.bodyY, z: d.rearZ },
      { p: 14, x: d.legX, y: d.kneeY, z: d.rearZ },
      { p: 1, x: -d.legX, y: d.bodyY, z: d.rearZ },
      { p: 16, x: -d.legX, y: d.kneeY, z: d.rearZ },
      { p: 4, x: 0, y: d.headY + H * 0.12, z: d.headZ + H * 0.82 },
    ];
    this.bones = makeBones(defs);
    const { mesh } = makeSkinned(geo, this.bones, d.bodyY, d.cat ? 0.45 : 0.7);
    this.mesh = mesh;
    this.object.add(mesh);
    this.nextBlink = 1 + hash01(this.seed) * 3;
  }

  /** Anzahl Dreiecke (Diagnose) */
  get triangles(): number {
    const i = this.mesh.geometry.getIndex();
    return i ? i.count / 3 : 0;
  }

  private s(i: number, x: number, y: number, z: number): void { const r = this.tgt; r[i * 3] = x; r[i * 3 + 1] = y; r[i * 3 + 2] = z; }
  private a(i: number, x: number, y = 0, z = 0): void { const r = this.tgt; r[i * 3] = r[i * 3]! + x; r[i * 3 + 1] = r[i * 3 + 1]! + y; r[i * 3 + 2] = r[i * 3 + 2]! + z; }

  private tt = 0;
  private wag(f: number, amp: number): void {
    const cat = this.d.cat, tt = this.tt;
    this.s(P.tail1, cat ? -0.55 : -0.1, amp * osc(tt, f), 0);
    this.s(P.tail2, cat ? 0.7 : 0.15, amp * 0.8 * osc(tt, f, 0.15), 0);
    this.s(P.tail3, cat ? 0.6 : 0.1, amp * 0.6 * osc(tt, f, 0.3), 0);
  }
  private breathe(): void { this.a(P.chest, 0.02 * osc(this.tt, 0.4)); }
  private sit(): void {
    const d = this.d;
    const lift = d.cat ? 0.75 : 0.7;
    this.s(P.body, -lift, 0, 0);
    this.s(P.chest, -0.1, 0, 0);
    this.s(P.legFL, lift + 0.1, 0, 0); this.s(P.legFR, lift + 0.1, 0, 0);
    this.s(P.legBL, lift - 1.6, 0, 0.05); this.s(P.lowBL, 2.2, 0, 0);
    this.s(P.legBR, lift - 1.6, 0, -0.05); this.s(P.lowBR, 2.2, 0, 0);
    this.s(P.neck, 0.45, 0, 0); this.s(P.head, 0.25, 0, 0);
    this.tgt[NBP * 3] = -(d.bodyY - d.bodyR * 0.85);
  }

  update(anim: PetAnim, t: number, dt: number): void {
    const step = Number.isFinite(dt) ? clamp(dt, 0, 0.25) : 0;
    const tt = Number.isFinite(t) ? Math.max(0, t) : 0;
    this.clock += step;
    if (anim !== this.last) {
      if (this.last !== null) { this.from.set(this.cur); this.blendT = 0; }
      this.last = anim;
    }
    const d = this.d, cat = d.cat;
    const T = this.tgt;
    T.fill(0);
    let eyes = 1;
    this.tt = tt;
    switch (anim) {
      case 'walk':
      case 'run': {
        const run = anim === 'run';
        const f = (run ? 2.6 : 1.7) * (cat ? 1.2 : 1);
        const ph = tt * f * PI * 2;
        const A = run ? 0.7 : 0.38;
        if (run) {
          const sF = Math.sin(ph), sB = Math.sin(ph + 0.6 * PI);
          this.s(P.legFL, -A * sF, 0, 0); this.s(P.legFR, -A * Math.sin(ph + 0.25), 0, 0);
          this.s(P.legBL, -A * sB, 0, 0); this.s(P.legBR, -A * Math.sin(ph + 0.6 * PI + 0.25), 0, 0);
          this.s(P.lowFL, -0.6 * Math.max(0, -sF), 0, 0); this.s(P.lowFR, -0.6 * Math.max(0, -Math.sin(ph + 0.25)), 0, 0);
          this.s(P.lowBL, 0.8 * Math.max(0, sB), 0, 0); this.s(P.lowBR, 0.8 * Math.max(0, Math.sin(ph + 0.6 * PI + 0.25)), 0, 0);
          this.s(P.body, 0.12 * Math.sin(ph + 0.3 * PI), 0, 0);
          T[NBP * 3] = 0.03 * Math.abs(Math.sin(ph));
          this.wag(1.5, 0.25);
          this.s(P.earL, -0.4, 0, 0); this.s(P.earR, -0.4, 0, 0);
        } else {
          const s1 = Math.sin(ph), s2 = Math.sin(ph + PI);
          this.s(P.legFL, -A * s1, 0, 0); this.s(P.legBR, -A * s1, 0, 0);
          this.s(P.legFR, -A * s2, 0, 0); this.s(P.legBL, -A * s2, 0, 0);
          this.s(P.lowFL, -0.5 * Math.max(0, Math.cos(ph)), 0, 0); this.s(P.lowFR, -0.5 * Math.max(0, -Math.cos(ph)), 0, 0);
          this.s(P.lowBL, 0.5 * Math.max(0, -Math.cos(ph)), 0, 0); this.s(P.lowBR, 0.5 * Math.max(0, Math.cos(ph)), 0, 0);
          this.s(P.chest, 0, 0.06 * s1, 0.03 * s1);
          T[NBP * 3] = 0.006 * Math.cos(ph * 2);
          this.wag(cat ? 0.5 : 2.2, cat ? 0.15 : 0.45);
        }
        this.s(P.head, 0.05 * Math.sin(ph * 2), 0, 0);
        break;
      }
      case 'sit':
        this.sit(); this.breathe(); this.wag(cat ? 0.25 : 0.8, cat ? 0.2 : 0.3);
        this.a(P.head, 0, 0.4 * osc(tt, 0.06), 0.05 * osc(tt, 0.1));
        break;
      case 'sleep': {
        // eingerollt auf dem Bauch: Beine untergeschlagen, Kopf zur Seite auf den Schwanz gelegt
        T[NBP * 3] = -(d.bodyY - d.bodyR * 0.92);
        this.s(P.legFL, -1.5, 0, 0.15); this.s(P.lowFL, 0.2, 0, 0); this.s(P.legFR, -1.4, 0, -0.1); this.s(P.lowFR, 0.1, 0, 0);
        this.s(P.legBL, -1.35, 0, 0.25); this.s(P.lowBL, 2.6, 0, 0); this.s(P.legBR, -1.35, 0, -0.25); this.s(P.lowBR, 2.6, 0, 0);
        this.s(P.body, 0, 0.3, 0.12); this.s(P.chest, 0, 0.4, 0.05);
        this.s(P.neck, 0.55, 0.75, 0); this.s(P.head, 0.35, 0.45, 0.35);
        this.s(P.tail1, -0.9, -0.9, 0); this.s(P.tail2, 0, -0.9, 0); this.s(P.tail3, 0, -0.8, 0);
        this.a(P.chest, 0.03 * osc(tt, 0.25));
        this.a(P.earL, 0.1 * pulse(tt, 0.13)); this.a(P.earR, 0.1 * pulse(tt, 0.11, 0.3));
        eyes = 0;
        break;
      }
      case 'eat': {
        this.s(P.neck, 1.05, 0, 0); this.s(P.head, 0.55 + 0.1 * pulse(tt, 1.5), 0, 0);
        this.s(P.chest, 0.15, 0, 0);
        this.s(P.legFL, -0.15, 0, 0.08); this.s(P.legFR, -0.15, 0, -0.08);
        this.wag(cat ? 0.3 : 2.0, cat ? 0.1 : 0.4);
        break;
      }
      case 'play': {
        const b = Math.abs(Math.sin(tt * 2.4 * PI));
        this.s(P.body, -0.1, 0, 0);
        this.s(P.chest, 0.4, 0, 0);
        this.s(P.legFL, -0.9, 0, 0.1); this.s(P.legFR, -0.9, 0, -0.1);
        this.s(P.lowFL, -0.3, 0, 0); this.s(P.lowFR, -0.3, 0, 0);
        this.s(P.legBL, 0.1, 0, 0); this.s(P.legBR, 0.1, 0, 0);
        this.s(P.neck, -0.6, 0, 0); this.s(P.head, -0.2, 0.3 * osc(tt, 0.6), 0.25 * osc(tt, 0.6));
        T[NBP * 3] = 0.06 * b - 0.03;
        this.wag(cat ? 1.0 : 3.5, cat ? 0.35 : 0.6);
        break;
      }
      case 'beg': {
        this.sit();
        if (!cat) {
          this.s(P.body, -1.25, 0, 0);
          this.s(P.legFL, -0.2, 0, 0.1); this.s(P.legFR, -0.2, 0, -0.1);
          this.s(P.lowFL, -1.4 + 0.2 * osc(tt, 1.5), 0, 0); this.s(P.lowFR, -1.4 + 0.2 * osc(tt, 1.5, 0.5), 0, 0);
          this.s(P.legBL, 1.25 - 1.6, 0, 0.1); this.s(P.legBR, 1.25 - 1.6, 0, -0.1);
          this.s(P.neck, 0.8, 0, 0); this.s(P.head, 0.35, 0, 0.2 * osc(tt, 0.4));
          T[NBP * 3] = -(d.bodyY - d.bodyR * 0.6);
        } else {
          this.s(P.legFL, 0.75 - 1.4, 0, 0.1); this.s(P.lowFL, -1.0 + 0.3 * osc(tt, 1.2), 0, 0);
          this.a(P.head, -0.15, 0, 0.2);
        }
        this.wag(cat ? 0.6 : 3, cat ? 0.25 : 0.5);
        break;
      }
      case 'pet': {
        this.sit();
        this.a(P.neck, -0.25); this.a(P.head, -0.3, 0, 0.3 * osc(tt, 0.3));
        this.s(P.earL, 0.3, 0, -0.2); this.s(P.earR, 0.3, 0, 0.2);
        this.wag(cat ? 0.4 : 3.5, cat ? 0.25 : 0.6);
        if (cat) eyes = 0.15;
        break;
      }
      default: { // idle
        this.breathe();
        const look = smooth01((osc(tt, 0.05) - 0.5) * 4) - smooth01((-osc(tt, 0.05) - 0.5) * 4);
        this.s(P.neck, 0.1, 0.3 * look, 0); this.s(P.head, 0.05 * osc(tt, 0.15), 0.3 * look, 0.1 * osc(tt, 0.08));
        this.s(P.earL, 0.15 * pulse(tt, 0.3), 0, 0); this.s(P.earR, 0.15 * pulse(tt, 0.27, 0.4), 0, 0);
        this.wag(cat ? 0.35 : 1.2, cat ? 0.25 : 0.35);
        break;
      }
    }
    // Überblendung
    if (this.blendT < 1) {
      this.blendT = Math.min(1, this.blendT + step / 0.25);
      const w = smooth01(this.blendT);
      for (let i = 0; i < T.length; i++) this.cur[i] = this.from[i]! + (T[i]! - this.from[i]!) * w;
    } else this.cur.set(T);
    const r = this.cur, bones = this.bones;
    for (let i = 0; i < NBP; i++) if (i !== P.eyes) bones[i]!.rotation.set(r[i * 3]!, r[i * 3 + 1]!, r[i * 3 + 2]!);
    bones[P.root]!.position.y = r[NBP * 3]!;
    // Blinzeln
    if (this.clock >= this.nextBlink) { this.blinkT = 0; this.nextBlink = this.clock + 2.5 + hash01(this.clock + this.seed) * 4; }
    let blink = 1;
    if (this.blinkT >= 0) {
      this.blinkT += step;
      blink = Math.abs(this.blinkT / 0.08 - 1);
      if (this.blinkT > 0.16) { this.blinkT = -1; blink = 1; }
    }
    bones[P.eyes]!.scale.set(1, Math.max(0.08, eyes * Math.min(1, blink)), 1);
  }

  dispose(): void {
    this.object.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.skeleton.dispose();
  }
}

/** Mischt zwei Fellfarben (z. B. für Welpen) – kleine Hilfe für die UI */
export function furSwatch(fur: number): string {
  const f = FUR_COLORS[((fur | 0) % FUR_COLORS.length + FUR_COLORS.length) % FUR_COLORS.length]!;
  return '#' + mix(f.base, f.mark, 0.15).getHexString();
}

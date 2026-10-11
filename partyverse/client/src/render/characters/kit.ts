import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CharacterDef } from '@shared/characters';
import { toon } from '../materials';

/** Gemeinsame Bausteine der Figurenmodelle: Geometrie-Cache, Materialien, Gesicht, Typen. */

// ---------------------------------------------------------------------------------------------
// Geometrie-Cache (geteilte Geometrien werden von disposeTree nicht freigegeben)
// ---------------------------------------------------------------------------------------------
const cache = new Map<string, THREE.BufferGeometry>();
export function cachedGeo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = cache.get(key) as T | undefined;
  if (!g) {
    g = make();
    g.userData.shared = true;
    cache.set(key, g);
  }
  return g;
}

export const G = {
  sph: (r: number, w = 18, h = 12) => cachedGeo(`s${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h)),
  box: (w: number, h: number, d: number) =>
    cachedGeo(`b${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d)),
  rbox: (w: number, h: number, d: number, r = 0.08, seg = 3) =>
    cachedGeo(`r${w}|${h}|${d}|${r}|${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r)),
  cyl: (rt: number, rb: number, h: number, seg = 14) =>
    cachedGeo(`c${rt}|${rb}|${h}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)),
  cone: (r: number, h: number, seg = 12) =>
    cachedGeo(`n${r}|${h}|${seg}`, () => new THREE.ConeGeometry(r, h, seg)),
  tor: (r: number, t: number, rs = 8, ts = 24) =>
    cachedGeo(`t${r}|${t}|${rs}|${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts)),
  cap: (r: number, len: number, seg = 5) =>
    cachedGeo(`p${r}|${len}|${seg}`, () => new THREE.CapsuleGeometry(r, len, seg, 10)),
  disc: (r: number, seg = 20) => cachedGeo(`d${r}|${seg}`, () => new THREE.CircleGeometry(r, seg)),
  octa: (r: number) => cachedGeo(`o${r}`, () => new THREE.OctahedronGeometry(r, 0)),
};

/** Flache Blitzform (+z-Seite sichtbar) */
export function boltGeo(): THREE.BufferGeometry {
  return cachedGeo('bolt', () => {
    const s = new THREE.Shape();
    s.moveTo(0.1, 0.5);
    s.lineTo(-0.16, 0.0);
    s.lineTo(-0.02, 0.0);
    s.lineTo(-0.1, -0.5);
    s.lineTo(0.16, 0.04);
    s.lineTo(0.02, 0.04);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false });
  });
}

/** Fünfzackiger Stern, flach */
export function starGeo(): THREE.BufferGeometry {
  return cachedGeo('star', () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.5 : 0.22;
      const a = Math.PI / 2 + (i / 10) * Math.PI * 2;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
    g.translate(0, 0, -0.06);
    return g;
  });
}

/** Spiralschneckenhaus (planare logarithmische Spirale mit wachsendem Röhrenradius), Farbbänder per Vertexfarbe */
export function shellGeo(colA: number, colB: number): THREE.BufferGeometry {
  return cachedGeo(`shell${colA}|${colB}`, () => {
    const turns = 2.7;
    const N = 72;
    const M = 12;
    const k = 0.17;
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    const ca = new THREE.Color(colA);
    const cb = new THREE.Color(colB);
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * turns * Math.PI * 2;
      const R = 0.1 * Math.exp(k * th);
      const rho = 0.42 * R;
      const cx = R * Math.cos(th);
      const cy = R * Math.sin(th);
      // Tangente
      const tx = k * Math.cos(th) - Math.sin(th);
      const ty = k * Math.sin(th) + Math.cos(th);
      const tl = Math.hypot(tx, ty);
      const nx = -ty / tl;
      const ny = tx / tl;
      const band = Math.floor((th / Math.PI) * 2.2) % 2 === 0;
      const c = band ? ca : cb;
      for (let j = 0; j <= M; j++) {
        const ph = (j / M) * Math.PI * 2;
        const cp = Math.cos(ph);
        const sp = Math.sin(ph);
        pos.push(cx + rho * cp * nx, cy + rho * cp * ny, rho * sp * 1.05);
        col.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < N; i++)
      for (let j = 0; j < M; j++) {
        const a = i * (M + 1) + j;
        const b = a + M + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.computeBoundingBox();
    const bb = g.boundingBox as THREE.Box3;
    const c = bb.getCenter(new THREE.Vector3());
    const size = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
    g.translate(-c.x, -c.y, -c.z);
    g.scale(1 / size, 1 / size, 1 / size);
    return g;
  });
}

// ---------------------------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------------------------
export type Gait = 'hop' | 'stomp' | 'glide' | 'sprint' | 'waddle' | 'slither' | 'skip' | 'float';
export type IdleKind = 'bounce' | 'heavy' | 'float' | 'jitter' | 'sniff' | 'sway' | 'hover';

/** Persönlichkeit einer Figur in Zahlen (steuert die gemeinsamen Animationsfunktionen) */
export interface Style {
  gait: Gait;
  idle: IdleKind;
  /** Schritte pro Sekunde beim Gehen (Zyklen/s) */
  walkF: number;
  runMul: number;
  /** Sprunghöhe in Modelleinheiten (vor Skalierung) */
  jumpH: number;
  /** Squash-&-Stretch-Stärke (0 = starr) */
  squash: number;
  /** Armschwung */
  arms: number;
  /** Tanzen: Wippen, Hüftschwung, Drehung */
  dance: { bounce: number; sway: number; spin: number; speed: number };
}

export interface ExtraCtx {
  t: number;
  dt: number;
  /** Aktuelle (gemischte) Pose */
  pose: Record<string, number>;
  /** Nachschwing-Feder: positiv, wenn der Körper nach oben beschleunigt (hängende Teile hinken nach) */
  j: number;
  /** Seitliche Feder (Drehung/Seitenbewegung) */
  jl: number;
}

export interface Parts {
  /** Alles Modellierte (wird passend skaliert); Kind der Pose-Gruppe */
  model: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group | null;
  armR: THREE.Group | null;
  legL: THREE.Group | null;
  legR: THREE.Group | null;
  face: Face;
  hatAnchor: THREE.Group;
  hatScale: number;
  /** Teile, die bei aufgesetztem Hut ausgeblendet werden (z. B. Hexenhut) */
  hatHide?: THREE.Object3D[];
  /** Höhe des Kopfes (für Blickrichtung) */
  headY: number;
  /** Schattenradius (Modelleinheiten) */
  shadow: number;
  /** Zielhöhe der Figur */
  height: number;
  /** Boden-Anhebung: ob die Figur auf y = 0 gesetzt wird (false = schwebend) */
  ground: boolean;
  style: Style;
  extra(c: ExtraCtx): void;
}

export interface Env {
  def: CharacterDef;
  /** Farbe als Toon- (oder Lambert-)Material, zwischengespeichert */
  m(color: THREE.ColorRepresentation): THREE.Material;
  /** Selbstleuchtend (eigene Instanz, wird mit der Figur freigegeben) */
  glow(color: THREE.ColorRepresentation, opacity?: number): THREE.Material;
  /** Halbtransparentes, leuchtendes Toon-Material (eigene Instanz) */
  glass(
    color: THREE.ColorRepresentation,
    opacity: number,
    emissive: THREE.ColorRepresentation,
    intensity?: number,
  ): THREE.Material;
  /** Material mit Vertexfarben (eigene Instanz) */
  vertex(): THREE.Material;
}

const lambertCache = new Map<string, THREE.Material>();
export function makeEnv(def: CharacterDef, useToon: boolean): Env {
  const gradient = (toon('#ffffff') as THREE.MeshToonMaterial).gradientMap;
  return {
    def,
    m: (c) => {
      if (useToon) return toon(c as string | number);
      const key = new THREE.Color(c).getHexString();
      let m = lambertCache.get(key);
      if (!m) {
        m = new THREE.MeshLambertMaterial({ color: c });
        m.userData.shared = true;
        lambertCache.set(key, m);
      }
      return m;
    },
    glow: (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o }),
    glass: (c, o, e, i = 0.7) =>
      useToon
        ? new THREE.MeshToonMaterial({
            color: c,
            gradientMap: gradient,
            transparent: true,
            opacity: o,
            emissive: e,
            emissiveIntensity: i,
            depthWrite: false,
          })
        : new THREE.MeshLambertMaterial({
            color: c,
            transparent: true,
            opacity: o,
            emissive: e,
            emissiveIntensity: i,
            depthWrite: false,
          }),
    vertex: () =>
      useToon
        ? new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradient, vertexColors: true })
        : new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }),
  };
}

export const mixColor = (a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, t: number): number =>
  new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
export const lighten = (a: THREE.ColorRepresentation, t: number): number => mixColor(a, 0xffffff, t);
export const darken = (a: THREE.ColorRepresentation, t: number): number => mixColor(a, 0x000000, t);

// ---------------------------------------------------------------------------------------------
// Zusammenbau-Helfer
// ---------------------------------------------------------------------------------------------
export function mk(
  parent: THREE.Object3D | null,
  g: THREE.BufferGeometry,
  m: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  sx = 1,
  sy = sx,
  sz = sx,
): THREE.Mesh {
  const me = new THREE.Mesh(g, m);
  me.position.set(x, y, z);
  me.scale.set(sx, sy, sz);
  parent?.add(me);
  return me;
}
export function grp(parent: THREE.Object3D | null, x = 0, y = 0, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent?.add(g);
  return g;
}

// ---------------------------------------------------------------------------------------------
// Gesicht
// ---------------------------------------------------------------------------------------------
export interface EyeEntry {
  g: THREE.Group;
  pupil: THREE.Mesh | null;
  bx: number;
  by: number;
  /** Ruhelage der Pupille (x) */
  px: number;
  r: number;
}

export class Face {
  eyes: EyeEntry[] = [];
  mouth: THREE.Mesh | null = null;
  private mouthBase = new THREE.Vector3(1, 1, 1);
  private mouthMin = 0.35;
  /** Gliedert den Mund ein (Skalierung in y öffnet ihn) */
  setMouth(m: THREE.Mesh, minOpen = 0.35): void {
    this.mouth = m;
    this.mouthBase.copy(m.scale);
    this.mouthMin = minOpen;
  }
  set(blink: number, open: number, lx: number, ly: number, eyeScale: number): void {
    for (const e of this.eyes) {
      e.g.scale.set(eyeScale, Math.max(0.06, eyeScale * (1 - blink * 0.94)), eyeScale);
      if (e.pupil) {
        e.pupil.position.x = e.px + lx * e.r * 0.3;
        e.pupil.position.y = e.by + ly * e.r * 0.3;
      } else {
        e.g.position.x = e.bx + lx * e.r * 0.25;
        e.g.position.y = e.by + ly * e.r * 0.25;
      }
    }
    if (this.mouth) this.mouth.scale.y = this.mouthBase.y * (this.mouthMin + Math.max(0, open) * 2.4);
  }
}

export interface EyeOpts {
  /** Augapfel-Farbe (null: nur Pupille/Punkt) */
  white?: THREE.ColorRepresentation;
  pupil?: THREE.ColorRepresentation;
  /** Pupillenradius relativ zum Auge */
  pr?: number;
  /** Versatz der Pupille (relativ) */
  px?: number;
  py?: number;
  /** Neigung des Auges um z und y */
  rz?: number;
  ry?: number;
  /** Abplattung in z */
  flat?: number;
  /** Höhe/Breite */
  aspect?: number;
}

export function makeEye(
  env: Env,
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  r: number,
  o: EyeOpts = {},
): EyeEntry {
  const g = grp(parent, x, y, z);
  g.rotation.set(0, o.ry ?? 0, o.rz ?? 0);
  const flat = o.flat ?? 0.5;
  const asp = o.aspect ?? 1.1;
  const dark = '#241b3a';
  mk(g, G.sph(r, 14, 10), env.m(o.white ?? dark), 0, 0, 0, 1, asp, flat);
  let pupil: THREE.Mesh | null = null;
  if (o.white !== undefined || o.pupil !== undefined) {
    const pr = o.pr ?? 0.55;
    pupil = mk(
      g,
      G.sph(r * pr, 12, 8),
      env.m(o.pupil ?? dark),
      (o.px ?? 0) * r,
      (o.py ?? 0) * r,
      r * flat * 0.78,
      1,
      asp * 1.05,
      0.55,
    );
  }
  return { g, pupil, bx: x, by: pupil ? (o.py ?? 0) * r : y, px: (o.px ?? 0) * r, r };
}

/** Zwei Augen symmetrisch auf einer Kugelfläche (Normale zeigt nach außen) */
export function eyePair(
  env: Env,
  face: Face,
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  r: number,
  o: EyeOpts = {},
): void {
  const yaw = Math.atan2(x, Math.max(0.2, z)) * 0.8;
  for (const s of [1, -1]) {
    const e = makeEye(env, parent, x * s, y, z, r, { ...o, ry: yaw * s, rz: (o.rz ?? 0) * s });
    face.eyes.push(e);
  }
}

export function makeMouth(
  env: Env,
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  color: THREE.ColorRepresentation = '#3a1830',
): THREE.Mesh {
  return mk(parent, G.sph(1, 12, 8), env.m(color), x, y, z, w, h, w * 0.4);
}

/** Zielhöhe herstellen: skaliert das Modell einheitlich; optional auf y = 0 absetzen */
export function fitModel(model: THREE.Group, height: number, ground: boolean): number {
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model, true);
  const h = box.max.y - box.min.y;
  const k = height / Math.max(0.01, h);
  model.scale.setScalar(k);
  model.position.y = ground ? -box.min.y * k : 0;
  return k;
}

/** Leuchtendes Auge/Punkt ohne Pupille (z. B. Golem, Würfelgeist) */
export function makeGlowEye(
  parent: THREE.Object3D,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  r: number,
  sx = 1,
  sy = 1,
): EyeEntry {
  const g = grp(parent, x, y, z);
  mk(g, G.sph(r, 12, 8), mat, 0, 0, 0, sx, sy, 0.5);
  return { g, pupil: null, bx: x, by: y, px: 0, r };
}

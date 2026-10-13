// Bauteile der Welt: Wände, Böden, Rampen, Bäume, Felsen, Kisten … alles achsenparallele Quader (Rampen schräg).

export const enum Kind {
  Block = 0,
  Ramp = 1,
  Tree = 2,
  Rock = 3,
  Crate = 4,
  Fence = 5,
  Car = 6,
  Door = 7,
  Chest = 8,
  Pad = 9,
  Glass = 10,
  BWall = 11,
  BFloor = 12,
  BRamp = 13,
  BRoof = 14,
  Bush = 15,
  AmmoBox = 16,
  Prop = 17,
  Crystal = 18,
}

export const enum Mat {
  Wood = 0,
  Stone = 1,
  Metal = 2,
  None = 3,
}

export const MAT_NAMES = ['Holz', 'Stein', 'Metall'] as const;

export interface Piece {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  z: number;
  hx: number;
  hy: number;
  hz: number;
  /** Rampe: steigt Richtung 0 = +x, 1 = +z, 2 = -x, 3 = -z. */
  dir: number;
  mat: Mat;
  /** Darstellungsvariante (Farbe/Modell). */
  style: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  /** Tür offen / Kiste geöffnet. */
  state: number;
  /** Gebäude-ID (-1 = keins). */
  group: number;
  /** Erbauer-Team bei gebauten Teilen (-1 = Welt). */
  team: number;
  destructible: boolean;
}

export const isBuilt = (k: Kind): boolean => k >= Kind.BWall && k <= Kind.BRoof;
export const isRampLike = (k: Kind): boolean => k === Kind.Ramp || k === Kind.BRamp || k === Kind.BRoof;

/** Blockiert Bewegung und Schüsse? */
export function isSolid(p: Piece): boolean {
  if (!p.alive) return false;
  switch (p.kind) {
    case Kind.Pad:
    case Kind.Bush:
      return false;
    case Kind.Door:
      return p.state === 0;
    default:
      return true;
  }
}

/** Blockiert nur Schüsse (Büsche nicht, Glas ja). */
export const blocksShots = (p: Piece): boolean => isSolid(p);

export function harvestMat(p: Piece): Mat {
  switch (p.kind) {
    case Kind.Tree:
    case Kind.Crate:
    case Kind.Fence:
    case Kind.Door:
      return Mat.Wood;
    case Kind.Rock:
    case Kind.Crystal:
      return Mat.Stone;
    case Kind.Car:
      return Mat.Metal;
    case Kind.Bush:
    case Kind.Pad:
    case Kind.Chest:
    case Kind.AmmoBox:
      return Mat.None;
    default:
      return p.mat;
  }
}

export function defaultHp(kind: Kind, mat: Mat): number {
  switch (kind) {
    case Kind.Tree:
      return 260;
    case Kind.Rock:
      return 420;
    case Kind.Crystal:
      return 360;
    case Kind.Car:
      return 560;
    case Kind.Crate:
      return 80;
    case Kind.Fence:
      return 70;
    case Kind.Door:
      return 130;
    case Kind.Glass:
      return 40;
    case Kind.Chest:
    case Kind.AmmoBox:
      return 9999;
    case Kind.Prop:
      return 120;
    case Kind.Bush:
      return 40;
    case Kind.BWall:
    case Kind.BFloor:
    case Kind.BRamp:
    case Kind.BRoof:
      return mat === Mat.Wood ? 150 : mat === Mat.Stone ? 280 : 420;
    default:
      return mat === Mat.Wood ? 220 : mat === Mat.Stone ? 360 : 520;
  }
}

/** Oberflächenhöhe einer Rampe an (x,z). */
export function rampHeight(p: Piece, x: number, z: number): number {
  let t: number;
  switch (p.dir) {
    case 0:
      t = (x - (p.x - p.hx)) / (2 * p.hx);
      break;
    case 1:
      t = (z - (p.z - p.hz)) / (2 * p.hz);
      break;
    case 2:
      t = ((p.x + p.hx) - x) / (2 * p.hx);
      break;
    default:
      t = ((p.z + p.hz) - z) / (2 * p.hz);
      break;
  }
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return p.y - p.hy + t * 2 * p.hy;
}

export function makePiece(
  kind: Kind,
  x: number,
  y: number,
  z: number,
  hx: number,
  hy: number,
  hz: number,
  opts: Partial<Pick<Piece, 'dir' | 'mat' | 'style' | 'group' | 'team' | 'destructible' | 'hp'>> = {},
): Piece {
  const mat = opts.mat ?? Mat.Wood;
  const hp = opts.hp ?? defaultHp(kind, mat);
  return {
    id: -1,
    kind,
    x,
    y,
    z,
    hx,
    hy,
    hz,
    dir: opts.dir ?? 0,
    mat,
    style: opts.style ?? 0,
    hp,
    maxHp: hp,
    alive: true,
    state: 0,
    group: opts.group ?? -1,
    team: opts.team ?? -1,
    destructible: opts.destructible ?? true,
  };
}

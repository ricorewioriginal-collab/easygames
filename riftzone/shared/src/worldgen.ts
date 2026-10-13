// Baut die feste Inselwelt: Gebäude der Orte, Brücken, Natur, Requisiten, Beute- und Fahrzeugpunkte.
// Vollständig deterministisch – Server und alle Clients erzeugen identische Bauteil-IDs.
import { MAP_SIZE, WATER_LEVEL } from './constants';
import { LAKES, POIS, RIVER, ROADS, type Line, type Poi } from './mapdef';
import { Rng, distToPolyline } from './math';
import { Kind, Mat, makePiece, type Piece } from './pieces';
import { Biome, forestDensity, islandDist, type Terrain } from './terrain';
import type { World } from './world';

export interface LootSpot {
  x: number;
  y: number;
  z: number;
  /** 0 = normal, 1 = gut, 2 = selten */
  tier: number;
}

export interface VehicleSpawn {
  x: number;
  z: number;
  yaw: number;
}

export type DecorKind = 'blades' | 'antenna' | 'crane' | 'beacon' | 'fountain' | 'umbrella' | 'dish' | 'sign' | 'lamp' | 'pipe';
export interface Decor {
  kind: DecorKind;
  x: number;
  y: number;
  z: number;
  rot: number;
  scale: number;
  color: number;
}

export interface WorldContent {
  loot: LootSpot[];
  vehicles: VehicleSpawn[];
  decor: Decor[];
  /** Absprungziele für Bots (Mitte von Gebäuden). */
  buildings: { x: number; z: number; poi: number }[];
}

// Farbstile für Wände (Index in eine Palette des Clients)
export const enum Style {
  Plaster = 0,
  Brick = 1,
  Timber = 2,
  Concrete = 3,
  MetalBlue = 4,
  MetalRed = 5,
  Adobe = 6,
  Glass = 7,
  Roof = 8,
  RoofDark = 9,
  Floor = 10,
  Neon = 11,
  Pier = 12,
  Container1 = 13,
  Container2 = 14,
  Container3 = 15,
  Hay = 16,
  Crystal = 17,
  Snowwall = 18,
  Lighthouse = 19,
  Barn = 20,
}

const T = 0.3; // Wandstärke
const FLOOR_H = 3.6;

class Builder {
  constructor(
    readonly out: Piece[],
    readonly ox: number,
    readonly oy: number,
    readonly oz: number,
    readonly rot: number,
    readonly group: number,
  ) {}

  private tx(lx: number, lz: number): [number, number] {
    switch (this.rot & 3) {
      case 0:
        return [this.ox + lx, this.oz + lz];
      case 1:
        return [this.ox - lz, this.oz + lx];
      case 2:
        return [this.ox - lx, this.oz - lz];
      default:
        return [this.ox + lz, this.oz - lx];
    }
  }

  world(lx: number, ly: number, lz: number): [number, number, number] {
    const [x, z] = this.tx(lx, lz);
    return [x, this.oy + ly, z];
  }

  /** Lokaler Quader (Mittelpunkt + halbe Ausdehnung). */
  box(
    kind: Kind,
    lx: number,
    ly: number,
    lz: number,
    hx: number,
    hy: number,
    hz: number,
    opts: Partial<Pick<Piece, 'dir' | 'mat' | 'style' | 'destructible'>> = {},
  ): Piece {
    const [x, z] = this.tx(lx, lz);
    const odd = (this.rot & 1) === 1;
    const p = makePiece(kind, x, this.oy + ly, z, odd ? hz : hx, hy, odd ? hx : hz, {
      ...opts,
      dir: opts.dir !== undefined ? (opts.dir + this.rot) & 3 : 0,
      group: this.group,
    });
    this.out.push(p);
    return p;
  }

  /** Quader über Ecken (lokal). */
  span(
    kind: Kind,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    opts: Partial<Pick<Piece, 'dir' | 'mat' | 'style' | 'destructible'>> = {},
  ): Piece | null {
    if (x1 - x0 < 0.05 || y1 - y0 < 0.05 || z1 - z0 < 0.05) return null;
    return this.box(kind, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2, opts);
  }
}

interface Opening {
  at: number; // Mitte entlang der Wand (0 … L)
  w: number;
  y0: number;
  y1: number;
  kind: 'door' | 'window' | 'gap';
}

/**
 * Wand entlang lokaler x-Achse (axis='x', bei z = c) oder z-Achse (axis='z', bei x = c), von a0 bis a1.
 */
function wall(
  b: Builder,
  axis: 'x' | 'z',
  c: number,
  a0: number,
  a1: number,
  y0: number,
  h: number,
  openings: Opening[],
  mat: Mat,
  style: number,
): void {
  const seg = (s0: number, s1: number, yy0: number, yy1: number, kind = Kind.Block, st = style, m = mat): void => {
    if (s1 - s0 < 0.05 || yy1 - yy0 < 0.05) return;
    if (axis === 'x') b.span(kind, a0 + s0, y0 + yy0, c - T / 2, a0 + s1, y0 + yy1, c + T / 2, { mat: m, style: st });
    else b.span(kind, c - T / 2, y0 + yy0, a0 + s0, c + T / 2, y0 + yy1, a0 + s1, { mat: m, style: st });
  };
  const L = a1 - a0;
  const ops = [...openings].sort((p, q) => p.at - q.at);
  let s = 0;
  for (const o of ops) {
    const o0 = Math.max(0, o.at - o.w / 2),
      o1 = Math.min(L, o.at + o.w / 2);
    seg(s, o0, 0, h);
    seg(o0, o1, 0, o.y0);
    seg(o0, o1, o.y1, h);
    if (o.kind === 'window') seg(o0, o1, o.y0, o.y1, Kind.Glass, Style.Glass, Mat.None);
    if (o.kind === 'door') {
      if (axis === 'x') b.span(Kind.Door, a0 + o0 + 0.05, y0 + o.y0, c - 0.08, a0 + o1 - 0.05, y0 + o.y1 - 0.05, c + 0.08, { mat: Mat.Wood, style: 0 });
      else b.span(Kind.Door, c - 0.08, y0 + o.y0, a0 + o0 + 0.05, c + 0.08, y0 + o.y1 - 0.05, a0 + o1 - 0.05, { mat: Mat.Wood, style: 0 });
    }
    s = o1;
  }
  seg(s, L, 0, h);
}

interface HouseOpts {
  w: number;
  d: number;
  floors: number;
  mat: Mat;
  style: number;
  roof: 'flat' | 'pitched' | 'none';
  roofStyle?: number;
  windows?: boolean;
  doors?: number; // 1 = vorne, 2 = vorne und hinten
  chest?: boolean;
  loot?: number; // Beutepunkte je Stockwerk
  tier?: number;
  stairs?: boolean;
  floorH?: number;
}

/** Ein Haus mit Fundament, Stockwerken, Treppenrampen, Fenstern, Türen und Dach. Ursprung = Mitte, Front = -z. */
function house(b: Builder, o: HouseOpts, ctx: GenCtx): void {
  const { w, d, floors, mat, style } = o;
  const fh = o.floorH ?? FLOOR_H;
  const hw = w / 2,
    hd = d / 2;
  // Fundament (unzerstörbar, deckt Hanglagen ab)
  b.span(Kind.Block, -hw, -2.2, -hd, hw, 0.2, hd, { mat: Mat.Stone, style: Style.Concrete, destructible: false });
  const stairW = 1.5;
  const stairL = Math.min(d - 1.2, fh * 1.6);
  for (let f = 0; f < floors; f++) {
    const y0 = 0.2 + f * fh;
    const win = o.windows !== false;
    const front: Opening[] = [];
    const back: Opening[] = [];
    const left: Opening[] = [];
    const right: Opening[] = [];
    if (f === 0) {
      front.push({ at: w / 2, w: 1.4, y0: 0, y1: 2.5, kind: 'door' });
      if ((o.doors ?? 1) > 1) back.push({ at: w * 0.3, w: 1.4, y0: 0, y1: 2.5, kind: 'door' });
    }
    if (win) {
      if (w >= 7) {
        if (f > 0 || w >= 9) front.push({ at: w * 0.2, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
        front.push({ at: w * 0.82, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
      }
      if (f > 0) front.push({ at: w / 2, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
      back.push({ at: w * 0.7, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
      left.push({ at: d / 2, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
      right.push({ at: d * 0.35, w: 1.3, y0: 1.0, y1: 2.3, kind: 'window' });
    }
    wall(b, 'x', -hd + T / 2, -hw, hw, y0, fh, front, mat, style);
    wall(b, 'x', hd - T / 2, -hw, hw, y0, fh, back, mat, style);
    wall(b, 'z', -hw + T / 2, -hd + T, hd - T, y0, fh, left, mat, style);
    wall(b, 'z', hw - T / 2, -hd + T, hd - T, y0, fh, right, mat, style);
    // Treppe zum nächsten Stockwerk entlang der rechten Wand (Richtung +z)
    const hasUpper = f < floors - 1 || (o.stairs === true && o.roof === 'flat');
    const sx0 = hw - T - stairW,
      sx1 = hw - T;
    const sz0 = hd - T - 0.2 - stairL,
      sz1 = hd - T - 0.2;
    if (hasUpper) {
      b.span(Kind.Ramp, sx0, y0, sz0, sx1, y0 + fh, sz1, { dir: 1, mat: Mat.Wood, style: Style.Floor });
    }
    // Decke / nächster Boden mit Treppenloch
    const ytop = y0 + fh;
    if (f < floors - 1) {
      b.span(Kind.Block, -hw + T, ytop - 0.2, -hd + T, sx0, ytop, hd - T, { mat, style: Style.Floor });
      b.span(Kind.Block, sx0, ytop - 0.2, -hd + T, sx1, ytop, sz0, { mat, style: Style.Floor });
    }
    // Beute
    const n = (o.loot ?? 1) + (w * d > 80 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const lx = -hw + 1.2 + ctx.rng.next() * (w - 4.2),
        lz = -hd + 1.2 + ctx.rng.next() * (d - 2.4);
      const [x, y, z] = b.world(lx, y0 + 0.05, lz);
      ctx.content.loot.push({ x, y, z, tier: o.tier ?? 0 });
    }
    if (o.chest !== false && f === floors - 1 && ctx.rng.chance(0.85)) {
      b.span(Kind.Chest, -hw + T + 0.2, y0, hd - T - 0.85, -hw + T + 1.1, y0 + 0.65, hd - T - 0.25, { mat: Mat.Wood, style: 0 });
    }
  }
  const top = 0.2 + floors * fh;
  const rs = o.roofStyle ?? Style.Roof;
  if (o.roof === 'flat') {
    if (o.stairs === true) {
      // Dach mit Aufgang über der Treppe und Brüstung
      const sx0 = hw - T - stairW,
        sz0 = hd - T - 0.2 - stairL;
      b.span(Kind.Block, -hw - 0.3, top - 0.2, -hd - 0.3, sx0, top + 0.15, hd + 0.3, { mat, style: rs });
      b.span(Kind.Block, sx0, top - 0.2, -hd - 0.3, hw + 0.3, top + 0.15, sz0, { mat, style: rs });
      b.span(Kind.Block, sx0, top - 0.2, hd - T, hw + 0.3, top + 0.15, hd + 0.3, { mat, style: rs });
      b.span(Kind.Block, hw - T, top - 0.2, sz0, hw + 0.3, top + 0.15, hd - T, { mat, style: rs });
      b.span(Kind.Block, -hw - 0.3, top + 0.15, -hd - 0.3, hw + 0.3, top + 1.05, -hd + 0.0, { mat, style });
      b.span(Kind.Block, -hw - 0.3, top + 0.15, -hd, -hw, top + 1.05, hd + 0.3, { mat, style });
    } else {
      b.span(Kind.Block, -hw - 0.3, top - 0.2, -hd - 0.3, hw + 0.3, top + 0.15, hd + 0.3, { mat, style: rs });
    }
  } else if (o.roof === 'pitched') {
    const rh = Math.min(3.2, w * 0.32);
    // Zwei Rampen bis zum First (entlang x)
    b.span(Kind.Ramp, -hw - 0.5, top, -hd - 0.4, 0, top + rh, hd + 0.4, { dir: 0, mat, style: rs });
    b.span(Kind.Ramp, 0, top, -hd - 0.4, hw + 0.5, top + rh, hd + 0.4, { dir: 2, mat, style: rs });
    // Abgestufter Giebel vorne und hinten
    for (const zz of [-hd + T / 2, hd - T / 2]) {
      for (let k = 0; k < 3; k++) {
        const fr = 1 - (k + 0.5) / 3;
        b.span(Kind.Block, -hw * fr, top + (k * rh) / 3, zz - T / 2, hw * fr, top + ((k + 1) * rh) / 3, zz + T / 2, { mat, style });
      }
    }
    // Dachboden-Boden (Decke des obersten Stockwerks)
    b.span(Kind.Block, -hw + T, top - 0.2, -hd + T, hw - T, top, hd - T, { mat, style: Style.Floor });
  }
  const [cx, , cz] = b.world(0, 0, 0);
  ctx.content.buildings.push({ x: cx, z: cz, poi: ctx.poi });
}

interface GenCtx {
  rng: Rng;
  out: Piece[];
  content: WorldContent;
  terrain: Terrain;
  group: number;
  poi: number;
}

/** Höhe der niedrigsten Ecke für Gebäude auf leichtem Hang. */
function baseY(ctx: GenCtx, x: number, z: number, w: number, d: number): number {
  const t = ctx.terrain;
  const r = Math.max(w, d) / 2;
  return Math.max(t.height(x, z), (t.height(x - r, z - r) + t.height(x + r, z - r) + t.height(x - r, z + r) + t.height(x + r, z + r)) / 4);
}

function placeHouse(ctx: GenCtx, x: number, z: number, rot: number, o: HouseOpts): void {
  const y = baseY(ctx, x, z, o.w, o.d);
  const b = new Builder(ctx.out, x, y, z, rot, ctx.group++);
  house(b, o, ctx);
}

function decor(ctx: GenCtx, kind: DecorKind, x: number, y: number, z: number, rot = 0, scale = 1, color = 0xffffff): void {
  ctx.content.decor.push({ kind, x, y, z, rot, scale, color });
}

// ---------------- Orte ----------------

function genHarbor(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Lagerhallen (Metall)
  placeHouse(ctx, x - 40, z + 30, 0, { w: 18, d: 12, floors: 1, mat: Mat.Metal, style: Style.MetalBlue, roof: 'flat', floorH: 6, loot: 3, tier: 1, windows: false, doors: 2 });
  placeHouse(ctx, x - 12, z + 34, 0, { w: 16, d: 12, floors: 1, mat: Mat.Metal, style: Style.MetalRed, roof: 'flat', floorH: 6, loot: 3, tier: 1, windows: false, doors: 2 });
  placeHouse(ctx, x + 30, z + 30, 0, { w: 14, d: 10, floors: 2, mat: Mat.Stone, style: Style.Brick, roof: 'flat', loot: 2, stairs: true });
  // Häuserzeile
  const row = [
    [-50, -18, 2],
    [-34, -18, 2],
    [-18, -20, 3],
    [2, -18, 2],
    [20, -20, 2],
    [38, -18, 2],
  ] as const;
  row.forEach(([dx, dz, fl], i) => {
    placeHouse(ctx, x + dx, z + dz, 0, { w: 10, d: 9, floors: fl, mat: i % 2 ? Mat.Stone : Mat.Wood, style: i % 2 ? Style.Brick : Style.Plaster, roof: i % 3 === 0 ? 'pitched' : 'flat', loot: 2 });
  });
  placeHouse(ctx, x - 26, z - 52, 2, { w: 9, d: 8, floors: 2, mat: Mat.Wood, style: Style.Timber, roof: 'pitched' });
  placeHouse(ctx, x + 14, z - 54, 2, { w: 12, d: 10, floors: 1, mat: Mat.Stone, style: Style.Plaster, roof: 'flat', loot: 2 });
  placeHouse(ctx, x + 50, z - 46, 1, { w: 9, d: 9, floors: 2, mat: Mat.Wood, style: Style.Plaster, roof: 'pitched' });
  // Container
  const cs = [Style.Container1, Style.Container2, Style.Container3];
  for (let i = 0; i < 9; i++) {
    const cx = x - 60 + (i % 3) * 3.2,
      cz = z + 58 + Math.floor(i / 3) * 7;
    const y = ctx.terrain.height(cx, cz);
    const b = new Builder(ctx.out, cx, y, cz, 0, ctx.group++);
    b.box(Kind.Block, 0, 1.3, 0, 1.25, 1.3, 3, { mat: Mat.Metal, style: cs[i % 3]! });
    if (i % 2 === 0) b.box(Kind.Block, 0, 3.9, 0, 1.25, 1.3, 3, { mat: Mat.Metal, style: cs[(i + 1) % 3]! });
    ctx.content.loot.push({ x: cx + 1.8, y: y + 0.05, z: cz, tier: 0 });
  }
  // Stege ins Wasser (nach Süden)
  for (const [px, len] of [
    [x - 20, 46],
    [x + 20, 38],
    [x + 55, 30],
  ] as const) {
    const b = new Builder(ctx.out, px, WATER_LEVEL + 1.6, z + 70, 0, ctx.group++);
    b.span(Kind.Block, -2.5, -0.25, 0, 2.5, 0.0, len, { mat: Mat.Wood, style: Style.Pier });
    for (let k = 0; k <= len; k += 8) {
      b.span(Kind.Block, -2.6, -6, k - 0.2, -2.2, -0.25, k + 0.2, { mat: Mat.Wood, style: Style.Pier });
      b.span(Kind.Block, 2.2, -6, k - 0.2, 2.6, -0.25, k + 0.2, { mat: Mat.Wood, style: Style.Pier });
    }
    ctx.content.loot.push({ x: px, y: WATER_LEVEL + 1.65, z: z + 70 + len - 3, tier: 1 });
    b.span(Kind.Crate, -1.8, 0, len - 6, -0.6, 1.2, len - 4.8, { mat: Mat.Wood, style: 0 });
  }
  decor(ctx, 'crane', x - 50, ctx.terrain.height(x - 50, z + 70), z + 72, 0, 1, 0xffa31a);
  for (let i = 0; i < 6; i++) decor(ctx, 'lamp', x - 50 + i * 20, ctx.terrain.height(x - 50 + i * 20, z), z, 0, 1, 0xffe0a0);
}

function genCity(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  const towers = [
    [-55, -50, 5, Style.Concrete],
    [-20, -55, 4, Style.Neon],
    [20, -50, 6, Style.Glass],
    [55, -48, 4, Style.Concrete],
    [-60, 0, 3, Style.Brick],
    [60, 5, 5, Style.Neon],
    [-50, 50, 4, Style.Concrete],
    [-10, 55, 3, Style.Brick],
    [30, 52, 5, Style.Glass],
    [65, 55, 3, Style.Concrete],
  ] as const;
  for (const [dx, dz, fl, st] of towers) {
    const glassy = st === Style.Glass;
    placeHouse(ctx, x + dx, z + dz, dz < 0 ? 0 : 2, {
      w: 12,
      d: 12,
      floors: fl,
      mat: Mat.Stone,
      style: st,
      roof: 'flat',
      roofStyle: Style.RoofDark,
      loot: 2,
      tier: fl >= 5 ? 2 : 1,
      stairs: true,
      windows: !glassy || true,
    });
  }
  // Läden an der Hauptstraße
  for (let i = 0; i < 4; i++) {
    placeHouse(ctx, x - 28 + i * 18, z + 22, 2, { w: 12, d: 9, floors: 1, mat: Mat.Stone, style: i % 2 ? Style.Plaster : Style.Brick, roof: 'flat', roofStyle: Style.RoofDark, loot: 2, doors: 2 });
  }
  // Platz mit Brunnen
  const fy = ctx.terrain.height(x, z - 10);
  const b = new Builder(ctx.out, x, fy, z - 10, 0, ctx.group++);
  b.span(Kind.Block, -4, 0, -4, 4, 0.8, 4, { mat: Mat.Stone, style: Style.Concrete, destructible: false });
  decor(ctx, 'fountain', x, fy + 0.8, z - 10, 0, 1, 0x3ff2ff);
  for (let i = 0; i < 8; i++) decor(ctx, 'lamp', x - 70 + i * 20, ctx.terrain.height(x - 70 + i * 20, z - 22), z - 22, 0, 1, 0xff4fd8);
  decor(ctx, 'sign', x + 20, ctx.terrain.height(x + 20, z - 50) + 22.5, z - 50, 0, 2, 0xff2fd0);
  // Parkplatz mit Autos
  for (let i = 0; i < 5; i++) car(ctx, x + 70 + (i % 2) * 5, z - 15 + i * 6, 1.5708, i);
}

function genMill(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Windmühle: Steinturm mit Rampen im Inneren
  const y = baseY(ctx, x + 30, z - 40, 8, 8);
  const b = new Builder(ctx.out, x + 30, y, z - 40, 0, ctx.group++);
  house(b, { w: 8, d: 8, floors: 3, mat: Mat.Stone, style: Style.Plaster, roof: 'flat', roofStyle: Style.RoofDark, loot: 1, tier: 1, stairs: true }, ctx);
  decor(ctx, 'blades', x + 30, y + 11.5, z - 44.5, 0, 1, 0xf2e3c6);
  const houses = [
    [-40, -30, 0],
    [-20, -45, 0],
    [-45, 10, 1],
    [-15, 30, 2],
    [15, 45, 2],
    [50, 20, 3],
    [40, 55, 2],
  ] as const;
  houses.forEach(([dx, dz, r], i) =>
    placeHouse(ctx, x + dx, z + dz, r, { w: 8, d: 8, floors: i % 3 === 0 ? 2 : 1, mat: Mat.Wood, style: Style.Timber, roof: 'pitched', roofStyle: i % 2 ? Style.Roof : Style.RoofDark, loot: 1 }),
  );
  // Brunnen
  const wy = ctx.terrain.height(x, z);
  const wb = new Builder(ctx.out, x, wy, z, 0, ctx.group++);
  wb.span(Kind.Block, -1.2, 0, -1.2, 1.2, 0.9, 1.2, { mat: Mat.Stone, style: Style.Brick });
  ctx.content.loot.push({ x: x + 2, y: wy + 0.05, z, tier: 1 });
}

function genForest(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  const cabins = [
    [70, -30, 3],
    [55, 40, 2],
    [-10, 75, 1],
    [-60, 60, 0],
    [20, -75, 0],
    [-70, -50, 1],
  ] as const;
  cabins.forEach(([dx, dz, r], i) =>
    placeHouse(ctx, x + dx, z + dz, r, { w: 7, d: 6, floors: 1, mat: Mat.Wood, style: Style.Timber, roof: 'pitched', roofStyle: Style.RoofDark, loot: 2, tier: i === 0 ? 1 : 0 }),
  );
  // Aussichtsturm aus Holz mit Rampen im Zickzack
  const tx = x + 80,
    tz = z + 10;
  const ty = ctx.terrain.height(tx, tz);
  const b = new Builder(ctx.out, tx, ty, tz, 0, ctx.group++);
  for (const [cx, cz] of [
    [-2.5, -2.5],
    [2.5, -2.5],
    [-2.5, 2.5],
    [2.5, 2.5],
  ] as const)
    b.span(Kind.Block, cx - 0.2, -1, cz - 0.2, cx + 0.2, 14, cz + 0.2, { mat: Mat.Wood, style: Style.Timber });
  b.span(Kind.Ramp, -2.7, 0, -2.7, -0.9, 4.6, 2.7, { dir: 1, mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Block, -2.7, 4.4, -2.7, 2.7, 4.6, -1.2, { mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Ramp, 0.9, 4.6, -2.7, 2.7, 9.2, 2.7, { dir: 3, mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Block, -2.7, 9.0, 1.2, 2.7, 9.2, 2.7, { mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Ramp, -2.7, 9.2, -2.7, -0.9, 13.8, 2.7, { dir: 3, mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Block, -3, 13.8, -3, 3, 14.1, 3, { mat: Mat.Wood, style: Style.Floor });
  b.span(Kind.Block, -3, 14.1, -3, 3, 15.0, -2.8, { mat: Mat.Wood, style: Style.Timber });
  b.span(Kind.Block, -3, 14.1, 2.8, 3, 15.0, 3, { mat: Mat.Wood, style: Style.Timber });
  b.span(Kind.Block, 2.8, 14.1, -3, 3, 15.0, 3, { mat: Mat.Wood, style: Style.Timber });
  ctx.content.loot.push({ x: tx, y: ty + 14.15, z: tz, tier: 2 });
  // Zeltlager
  for (let i = 0; i < 3; i++) {
    const cx = x - 20 + i * 9,
      cz = z - 20;
    ctx.content.loot.push({ x: cx, y: ctx.terrain.height(cx, cz) + 0.05, z: cz, tier: 0 });
    const tb = new Builder(ctx.out, cx, ctx.terrain.height(cx, cz), cz, i, ctx.group++);
    tb.span(Kind.Crate, -0.5, 0, -0.5, 0.5, 0.8, 0.5, { mat: Mat.Wood });
  }
}

function genCrater(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Forschungsstation: drei Module und eine Halle
  placeHouse(ctx, x, z, 0, { w: 16, d: 14, floors: 2, mat: Mat.Metal, style: Style.MetalBlue, roof: 'flat', roofStyle: Style.RoofDark, loot: 3, tier: 2, stairs: true, doors: 2 });
  placeHouse(ctx, x - 32, z + 18, 1, { w: 10, d: 8, floors: 1, mat: Mat.Metal, style: Style.MetalBlue, roof: 'flat', loot: 2, tier: 1 });
  placeHouse(ctx, x + 32, z + 16, 3, { w: 10, d: 8, floors: 1, mat: Mat.Metal, style: Style.MetalBlue, roof: 'flat', loot: 2, tier: 1 });
  placeHouse(ctx, x + 4, z - 36, 2, { w: 12, d: 8, floors: 1, mat: Mat.Metal, style: Style.MetalRed, roof: 'flat', loot: 2, tier: 1 });
  decor(ctx, 'dish', x - 8, ctx.terrain.height(x - 8, z) + 8, z - 3, 0, 1.2, 0xdde6ff);
  decor(ctx, 'beacon', x, ctx.terrain.height(x, z) + 8.2, z + 4, 0, 1, 0xb64bff);
  // Riftkristalle
  const rng = new Rng(4242);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rng.range(-0.1, 0.1);
    const r = rng.range(40, 66);
    const cx = x + Math.cos(a) * r,
      cz = z + Math.sin(a) * r;
    const y = ctx.terrain.height(cx, cz);
    const h = rng.range(2.5, 6.5);
    const b = new Builder(ctx.out, cx, y, cz, 0, ctx.group++);
    b.span(Kind.Crystal, -0.7, -0.5, -0.7, 0.7, h, 0.7, { mat: Mat.Stone, style: Style.Crystal });
    if (i % 3 === 0) ctx.content.loot.push({ x: cx + 1.5, y: y + 0.05, z: cz, tier: 1 });
  }
  // Sprungpads am Kraterrand
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const cx = x + Math.cos(a) * 52,
      cz = z + Math.sin(a) * 52;
    pad(ctx, cx, cz);
  }
}

function genFarm(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Große Scheune
  const y = baseY(ctx, x + 25, z - 10, 14, 20);
  const b = new Builder(ctx.out, x + 25, y, z - 10, 1, ctx.group++);
  house(b, { w: 20, d: 14, floors: 1, floorH: 6.5, mat: Mat.Wood, style: Style.Barn, roof: 'pitched', roofStyle: Style.RoofDark, loot: 4, tier: 1, windows: false, doors: 2 }, ctx);
  // Heuballen in der Scheune
  for (let i = 0; i < 4; i++) {
    const [hx, hy, hz] = b.world(-6 + i * 3.2, 0.2, 3);
    const hb = new Builder(ctx.out, hx, hy, hz, 0, ctx.group++);
    hb.span(Kind.Crate, -1.2, 0, -0.8, 1.2, 1.6, 0.8, { mat: Mat.Wood, style: Style.Hay });
  }
  placeHouse(ctx, x - 25, z - 15, 0, { w: 11, d: 9, floors: 2, mat: Mat.Wood, style: Style.Plaster, roof: 'pitched', loot: 2 });
  placeHouse(ctx, x - 30, z + 30, 1, { w: 8, d: 6, floors: 1, mat: Mat.Wood, style: Style.Timber, roof: 'pitched', loot: 1 });
  // Silo
  const sx = x + 5,
    sz = z + 28;
  const sy = ctx.terrain.height(sx, sz);
  const sb = new Builder(ctx.out, sx, sy, sz, 0, ctx.group++);
  sb.span(Kind.Block, -2.5, -1, -2.5, 2.5, 14, 2.5, { mat: Mat.Metal, style: Style.MetalRed });
  // Felder mit Zäunen
  for (const [fx, fz, fw, fd] of [
    [x - 70, z - 70, 50, 40],
    [x + 20, z + 50, 60, 35],
    [x + 55, z - 70, 35, 45],
  ] as const) {
    fence(ctx, fx, fz, fx + fw, fz);
    fence(ctx, fx, fz + fd, fx + fw, fz + fd);
    fence(ctx, fx, fz, fx, fz + fd);
    fence(ctx, fx + fw, fz, fx + fw, fz + fd - 6);
  }
  car(ctx, x - 5, z - 30, 0.3, 7);
}

function genDam(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Staumauer quer zum Fluss (Fluss läuft hier von NW nach SO) – längliche Mauer mit begehbarer Krone
  const y = WATER_LEVEL - 3;
  // Fluss hier etwa Richtung (1,0.75): Mauer quer dazu
  for (let i = -6; i <= 6; i++) {
    const cx = x + i * 4 * 0.6,
      cz = z - i * 4 * 0.8;
    const cy = Math.max(ctx.terrain.height(cx, cz), y);
    const bb = new Builder(ctx.out, cx, 0, cz, 0, ctx.group++);
    bb.span(Kind.Block, -2.4, cy - 2, -2.4, 2.4, WATER_LEVEL + 9, 2.4, { mat: Mat.Stone, style: Style.Concrete, destructible: false });
  }
  placeHouse(ctx, x + 30, z + 25, 3, { w: 16, d: 10, floors: 2, mat: Mat.Metal, style: Style.Concrete, roof: 'flat', roofStyle: Style.RoofDark, loot: 3, tier: 1, stairs: true });
  placeHouse(ctx, x - 30, z - 28, 1, { w: 8, d: 7, floors: 1, mat: Mat.Stone, style: Style.Concrete, roof: 'flat', loot: 1 });
  for (let i = 0; i < 3; i++) decor(ctx, 'pipe', x + 18 + i * 4, ctx.terrain.height(x + 18 + i * 4, z + 10) + 1, z + 10, 0.6, 1, 0x8fa3b8);
}

function genMine(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  placeHouse(ctx, x - 25, z - 20, 0, { w: 14, d: 10, floors: 1, floorH: 5, mat: Mat.Metal, style: Style.MetalRed, roof: 'flat', loot: 3, tier: 1, windows: false, doors: 2 });
  placeHouse(ctx, x + 20, z - 25, 1, { w: 9, d: 8, floors: 2, mat: Mat.Wood, style: Style.Timber, roof: 'flat', loot: 2, stairs: true });
  placeHouse(ctx, x + 10, z + 30, 2, { w: 10, d: 8, floors: 1, mat: Mat.Metal, style: Style.MetalBlue, roof: 'flat', loot: 2 });
  // Förderturm
  const fx = x - 5,
    fz = z + 5;
  const fy = ctx.terrain.height(fx, fz);
  const fb = new Builder(ctx.out, fx, fy, fz, 0, ctx.group++);
  for (const [cx, cz] of [
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2],
  ] as const)
    fb.span(Kind.Block, cx - 0.25, -1, cz - 0.25, cx + 0.25, 18, cz + 0.25, { mat: Mat.Metal, style: Style.MetalRed });
  fb.span(Kind.Block, -2.6, 18, -2.6, 2.6, 18.4, 2.6, { mat: Mat.Metal, style: Style.MetalRed });
  fb.span(Kind.Ramp, -2.2, 0, -2.2, -0.6, 6, 2.2, { dir: 1, mat: Mat.Metal, style: Style.Floor });
  fb.span(Kind.Block, -2.2, 5.8, 0.6, 2.2, 6.0, 2.2, { mat: Mat.Metal, style: Style.Floor });
  fb.span(Kind.Ramp, 0.6, 6, -2.2, 2.2, 12, 2.2, { dir: 3, mat: Mat.Metal, style: Style.Floor });
  fb.span(Kind.Block, -2.2, 11.8, -2.2, 2.2, 12.0, -0.6, { mat: Mat.Metal, style: Style.Floor });
  fb.span(Kind.Ramp, -2.2, 12, -2.2, -0.6, 18, 2.2, { dir: 1, mat: Mat.Metal, style: Style.Floor });
  ctx.content.loot.push({ x: fx, y: fy + 18.45, z: fz, tier: 2 });
  // Loren und Erzhaufen
  const rng = new Rng(77);
  for (let i = 0; i < 14; i++) {
    const cx = x + rng.range(-60, 60),
      cz = z + rng.range(-55, 55);
    rock(ctx, cx, cz, rng.range(1.2, 3), 1);
  }
  for (let i = 0; i < 4; i++) {
    const cx = x - 40 + i * 6,
      cz = z + 12;
    const cy = ctx.terrain.height(cx, cz);
    const b = new Builder(ctx.out, cx, cy, cz, 0, ctx.group++);
    b.span(Kind.Prop, -1, 0, -0.7, 1, 1.2, 0.7, { mat: Mat.Metal, style: Style.MetalRed });
  }
}

function genCanyon(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  const spots = [
    [-30, -20, 0, 2],
    [0, -30, 0, 1],
    [30, -18, 3, 2],
    [-28, 22, 1, 1],
    [25, 26, 2, 1],
  ] as const;
  spots.forEach(([dx, dz, r, fl], i) =>
    placeHouse(ctx, x + dx, z + dz, r, { w: 9, d: 8, floors: fl, mat: Mat.Stone, style: Style.Adobe, roof: 'flat', roofStyle: Style.Adobe, loot: 2, tier: i === 0 ? 1 : 0, stairs: fl > 1 }),
  );
  // Wasserturm
  const wx = x + 2,
    wz = z + 4;
  const wy = ctx.terrain.height(wx, wz);
  const b = new Builder(ctx.out, wx, wy, wz, 0, ctx.group++);
  for (const [cx, cz] of [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6],
  ] as const)
    b.span(Kind.Block, cx - 0.2, -1, cz - 0.2, cx + 0.2, 9, cz + 0.2, { mat: Mat.Wood, style: Style.Timber });
  b.span(Kind.Block, -2.4, 9, -2.4, 2.4, 13, 2.4, { mat: Mat.Wood, style: Style.Timber });
  // Kakteen
  const rng = new Rng(99);
  for (let i = 0; i < 40; i++) {
    const cx = x + rng.range(-220, 220),
      cz = z + rng.range(-160, 160);
    if (Math.hypot(cx - x, cz - z) < 50) continue;
    const cy = ctx.terrain.height(cx, cz);
    if (cy < WATER_LEVEL + 1) continue;
    const cb = new Builder(ctx.out, cx, cy, cz, 0, ctx.group++);
    cb.span(Kind.Bush, -0.3, 0, -0.3, 0.3, rng.range(1.6, 3), 0.3, { mat: Mat.Wood, style: 1 });
  }
}

function genMotel(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  // Motel: langes Gebäude mit mehreren Zimmern
  for (let i = 0; i < 4; i++) {
    placeHouse(ctx, x - 18 + i * 7, z - 14, 0, { w: 7, d: 8, floors: 1, mat: Mat.Stone, style: Style.Plaster, roof: 'flat', roofStyle: Style.Roof, loot: 1, chest: i === 2 });
  }
  // Tankstelle: Dach auf Stützen
  const tx = x + 10,
    tz = z + 14;
  const ty = ctx.terrain.height(tx, tz);
  const b = new Builder(ctx.out, tx, ty, tz, 0, ctx.group++);
  for (const [cx, cz] of [
    [-6, -4],
    [6, -4],
    [-6, 4],
    [6, 4],
  ] as const)
    b.span(Kind.Block, cx - 0.3, -0.5, cz - 0.3, cx + 0.3, 5, cz + 0.3, { mat: Mat.Metal, style: Style.MetalRed });
  b.span(Kind.Block, -7, 5, -5, 7, 5.6, 5, { mat: Mat.Metal, style: Style.MetalRed });
  b.span(Kind.Prop, -2.5, 0, -0.6, -1.5, 1.6, 0.6, { mat: Mat.Metal, style: Style.MetalBlue });
  b.span(Kind.Prop, 1.5, 0, -0.6, 2.5, 1.6, 0.6, { mat: Mat.Metal, style: Style.MetalBlue });
  ctx.content.loot.push({ x: tx, y: ty + 0.05, z: tz, tier: 0 });
  placeHouse(ctx, x - 22, z + 16, 1, { w: 10, d: 8, floors: 1, mat: Mat.Stone, style: Style.Brick, roof: 'flat', loot: 2 });
  decor(ctx, 'sign', x + 22, ty + 7, z + 6, 0, 1.2, 0xffcc33);
  car(ctx, x + 6, z + 2, 0, 3);
}

function genRadio(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  const y = ctx.terrain.height(x, z);
  const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
  for (const [cx, cz] of [
    [-1.5, -1.5],
    [1.5, -1.5],
    [-1.5, 1.5],
    [1.5, 1.5],
  ] as const)
    b.span(Kind.Block, cx - 0.2, -1, cz - 0.2, cx + 0.2, 26, cz + 0.2, { mat: Mat.Metal, style: Style.MetalRed });
  for (let k = 0; k < 4; k++) {
    const y0 = k * 6;
    b.span(Kind.Ramp, -1.4, y0, -1.4, 0, y0 + 6, 1.4, { dir: k % 2 ? 3 : 1, mat: Mat.Metal, style: Style.Floor });
    b.span(Kind.Block, -1.6, y0 + 5.8, k % 2 ? -1.6 : 0.4, 1.6, y0 + 6, k % 2 ? -0.4 : 1.6, { mat: Mat.Metal, style: Style.Floor });
  }
  b.span(Kind.Block, -2.4, 24, -2.4, 2.4, 24.3, 2.4, { mat: Mat.Metal, style: Style.Floor });
  ctx.content.loot.push({ x, y: y + 24.35, z, tier: 2 });
  decor(ctx, 'antenna', x, y + 26, z, 0, 1, 0xff3344);
  placeHouse(ctx, x + 12, z + 8, 3, { w: 7, d: 6, floors: 1, mat: Mat.Metal, style: Style.Concrete, roof: 'flat', loot: 2 });
}

function genResort(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  for (let i = 0; i < 4; i++) {
    const hx = x - 15 + i * 12,
      hz = z - 18 + (i % 2) * 8;
    const hy = Math.max(ctx.terrain.height(hx, hz), WATER_LEVEL + 0.5) + 1.2;
    const b = new Builder(ctx.out, hx, hy, hz, 1, ctx.group++);
    for (const [cx, cz] of [
      [-2.4, -2],
      [2.4, -2],
      [-2.4, 2],
      [2.4, 2],
    ] as const)
      b.span(Kind.Block, cx - 0.15, -4, cz - 0.15, cx + 0.15, 0, cz + 0.15, { mat: Mat.Wood, style: Style.Pier });
    b.span(Kind.Ramp, -0.8, -1.4, -5.4, 0.8, 0.2, -2.6, { dir: 1, mat: Mat.Wood, style: Style.Pier });
    house(b, { w: 6, d: 5, floors: 1, mat: Mat.Wood, style: i % 2 ? Style.Plaster : Style.Timber, roof: 'pitched', roofStyle: Style.Roof, loot: 1, tier: 0 }, ctx);
  }
  for (let i = 0; i < 6; i++) {
    const ux = x + 10 + i * 6,
      uz = z + 22;
    decor(ctx, 'umbrella', ux, ctx.terrain.height(ux, uz), uz, 0, 1, [0xff6b6b, 0x3ff2ff, 0xffd23f][i % 3]!);
  }
}

function genLighthouse(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  const y = baseY(ctx, x, z, 7, 7);
  const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
  house(b, { w: 7, d: 7, floors: 5, floorH: 4, mat: Mat.Stone, style: Style.Lighthouse, roof: 'flat', roofStyle: Style.RoofDark, loot: 1, tier: 1, stairs: true, windows: true }, ctx);
  decor(ctx, 'beacon', x, y + 21, z, 0, 1.4, 0xfff2a6);
  placeHouse(ctx, x + 16, z + 12, 3, { w: 8, d: 7, floors: 1, mat: Mat.Wood, style: Style.Plaster, roof: 'pitched', loot: 2 });
}

function genPeak(ctx: GenCtx, p: Poi): void {
  const { x, z } = p;
  placeHouse(ctx, x, z, 0, { w: 12, d: 9, floors: 2, mat: Mat.Metal, style: Style.Snowwall, roof: 'flat', roofStyle: Style.RoofDark, loot: 3, tier: 2, stairs: true });
  decor(ctx, 'antenna', x + 10, ctx.terrain.height(x + 10, z) + 12, z + 2, 0, 0.6, 0xff3344);
  decor(ctx, 'dish', x - 10, ctx.terrain.height(x - 10, z - 4) + 3, z - 4, 1, 1, 0xdde6ff);
}

// ---------------- Kleinteile ----------------

function car(ctx: GenCtx, x: number, z: number, yaw: number, variant: number): void {
  const y = ctx.terrain.height(x, z);
  const rot = Math.round(yaw / (Math.PI / 2)) & 3;
  const b = new Builder(ctx.out, x, y, z, rot, ctx.group++);
  b.span(Kind.Car, -1, 0, -2.2, 1, 1.5, 2.2, { mat: Mat.Metal, style: variant % 6 });
}

function rock(ctx: GenCtx, x: number, z: number, s: number, style: number): void {
  const y = ctx.terrain.height(x, z);
  const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
  b.span(Kind.Rock, -s, -s * 0.4, -s * 0.85, s, s * 1.1, s * 0.85, { mat: Mat.Stone, style });
}

function tree(ctx: GenCtx, x: number, z: number, h: number, style: number): void {
  const y = ctx.terrain.height(x, z);
  const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
  b.span(Kind.Tree, -0.35, -0.5, -0.35, 0.35, h, 0.35, { mat: Mat.Wood, style });
}

function pad(ctx: GenCtx, x: number, z: number): void {
  const y = ctx.terrain.height(x, z);
  const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
  b.span(Kind.Pad, -1.3, -0.1, -1.3, 1.3, 0.35, 1.3, { mat: Mat.Metal, style: 0, destructible: false });
}

function fence(ctx: GenCtx, x0: number, z0: number, x1: number, z1: number): void {
  const L = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(L / 4));
  for (let i = 0; i < n; i++) {
    const a = i / n,
      c = (i + 1) / n;
    const ax = x0 + (x1 - x0) * a,
      az = z0 + (z1 - z0) * a,
      bx = x0 + (x1 - x0) * c,
      bz = z0 + (z1 - z0) * c;
    const mx = (ax + bx) / 2,
      mz = (az + bz) / 2;
    const y = ctx.terrain.height(mx, mz);
    if (y < WATER_LEVEL) continue;
    const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
    const b = new Builder(ctx.out, mx, y, mz, alongX ? 0 : 1, ctx.group++);
    b.span(Kind.Fence, -2, -0.3, -0.06, 2, 1.1, 0.06, { mat: Mat.Wood, style: 0 });
  }
}

/** Brücken über Fluss und Seen dort, wo Straßen das Wasser kreuzen. */
function bridges(ctx: GenCtx): void {
  const t = ctx.terrain;
  for (const road of ROADS) {
    for (let i = 0; i < road.length - 1; i++) {
      const [ax, az] = road[i]!;
      const [bx, bz] = road[i + 1]!;
      const L = Math.hypot(bx - ax, bz - az);
      const steps = Math.ceil(L / 2);
      let inWater = false,
        start = 0;
      for (let k = 0; k <= steps; k++) {
        const s = k / steps;
        const x = ax + (bx - ax) * s,
          z = az + (bz - az) * s;
        const wet = t.height(x, z) < WATER_LEVEL + 0.6;
        if (wet && !inWater) {
          inWater = true;
          start = Math.max(0, s - 6 / L);
        } else if (!wet && inWater) {
          inWater = false;
          bridge(ctx, ax, az, bx, bz, start, Math.min(1, s + 6 / L));
        }
      }
    }
  }
}

function bridge(ctx: GenCtx, ax: number, az: number, bx: number, bz: number, s0: number, s1: number): void {
  const L = Math.hypot(bx - ax, bz - az);
  const dx = (bx - ax) / L,
    dz = (bz - az) / L;
  const len = (s1 - s0) * L;
  const n = Math.ceil(len / 4);
  const x0 = ax + (bx - ax) * s0,
    z0 = az + (bz - az) * s0;
  const deck = Math.max(ctx.terrain.height(x0, z0), ctx.terrain.height(ax + (bx - ax) * s1, az + (bz - az) * s1), WATER_LEVEL + 1.6);
  for (let k = 0; k < n; k++) {
    const cx = x0 + dx * (k + 0.5) * 4,
      cz = z0 + dz * (k + 0.5) * 4;
    const b = new Builder(ctx.out, cx, deck, cz, 0, ctx.group++);
    b.span(Kind.Block, -3, -0.4, -3, 3, 0.05, 3, { mat: Mat.Stone, style: Style.Concrete, destructible: false });
  }
}

function nature(ctx: GenCtx): void {
  const t = ctx.terrain;
  const rng = new Rng(9001);
  const step = 9;
  const near = (x: number, z: number): boolean => {
    for (const p of POIS) if (p.kind !== 'forest' && Math.hypot(x - p.x, z - p.z) < p.r * 0.9) return true;
    for (const r of ROADS) if (distToPolyline(x, z, r) < 7) return true;
    for (const l of LAKES) if (Math.hypot(x - l.x, z - l.z) < l.r + 3) return true;
    if (distToPolyline(x, z, RIVER as Line) < 12) return true;
    return false;
  };
  const glim = POIS[4]!;
  for (let gz = 20; gz < MAP_SIZE - 20; gz += step) {
    for (let gx = 20; gx < MAP_SIZE - 20; gx += step) {
      const x = gx + rng.range(-3.5, 3.5),
        z = gz + rng.range(-3.5, 3.5);
      if (islandDist(x, z) > 0.86) continue;
      const h = t.height(x, z);
      if (h < WATER_LEVEL + 0.8) continue;
      const n = t.normal(x, z, { x: 0, y: 1, z: 0 });
      const slope = 1 - n.y;
      const biome = t.biome(x, z, h, Math.sqrt(Math.max(0, 1 - n.y * n.y)));
      if (biome === Biome.Road || biome === Biome.Town || biome === Biome.Crater) continue;
      if (near(x, z)) {
        // Im Glimmerwald stehen trotzdem Bäume zwischen den Hütten
        if (Math.hypot(x - glim.x, z - glim.z) > glim.r * 1.1) continue;
        let blocked = false;
        for (const b of ctx.content.buildings) if (Math.hypot(b.x - x, b.z - z) < 11) blocked = true;
        if (blocked) continue;
      }
      const fd = forestDensity(x, z);
      const r = rng.next();
      if (biome === Biome.Snow) {
        if (r < 0.12) tree(ctx, x, z, rng.range(6, 9), 3);
        else if (r < 0.2) rock(ctx, x, z, rng.range(1.2, 2.6), 2);
      } else if (biome === Biome.Desert) {
        if (r < 0.05) rock(ctx, x, z, rng.range(1.5, 3.5), 3);
      } else if (biome === Biome.Beach) {
        if (r < 0.05) tree(ctx, x, z, rng.range(6, 8), 4); // Palme
      } else if (biome === Biome.Rock || slope > 0.35) {
        if (r < 0.1) rock(ctx, x, z, rng.range(1.5, 3.2), 0);
      } else {
        const p = 0.035 + fd * 0.5;
        if (r < p) tree(ctx, x, z, rng.range(7, 12) * (0.8 + fd * 0.4), fd > 0.55 ? 1 : rng.chance(0.5) ? 0 : 2);
        else if (r < p + 0.02) rock(ctx, x, z, rng.range(0.8, 2.2), 0);
        else if (r < p + 0.05) {
          const b = new Builder(ctx.out, x, h, z, 0, ctx.group++);
          b.span(Kind.Bush, -0.9, 0, -0.9, 0.9, 1.2, 0.9, { mat: Mat.Wood, style: 0 });
        }
      }
    }
  }
}

/** Einzelgehöfte und Kisten entlang der Straßen. */
function countryside(ctx: GenCtx): void {
  const spots = [
    [600, 650, 1],
    [470, 860, 0],
    [930, 900, 2],
    [1000, 680, 3],
    [680, 1080, 0],
    [1260, 520, 1],
    [430, 450, 2],
    [960, 300, 0],
    [1290, 880, 3],
    [250, 560, 1],
    [880, 1120, 0],
    [1050, 400, 2],
  ] as const;
  spots.forEach(([x, z, r], i) =>
    placeHouse(ctx, x, z, r, { w: 9, d: 8, floors: i % 3 === 1 ? 2 : 1, mat: i % 2 ? Mat.Stone : Mat.Wood, style: i % 2 ? Style.Plaster : Style.Timber, roof: 'pitched', roofStyle: i % 2 ? Style.Roof : Style.RoofDark, loot: 2 }),
  );
  // Autowracks und Kisten am Straßenrand, Munitionskisten
  const rng = new Rng(555);
  ROADS.forEach((road, ri) => {
    for (let i = 0; i < road.length - 1; i++) {
      const [ax, az] = road[i]!;
      const [bx, bz] = road[i + 1]!;
      if (rng.chance(0.55)) {
        const s = rng.range(0.2, 0.8);
        const nx = -(bz - az),
          nz = bx - ax;
        const nl = Math.hypot(nx, nz) || 1;
        const off = rng.chance(0.5) ? 5 : -5;
        const x = ax + (bx - ax) * s + (nx / nl) * off,
          z = az + (bz - az) * s + (nz / nl) * off;
        if (ctx.terrain.height(x, z) > WATER_LEVEL + 0.5) car(ctx, x, z, Math.atan2(bx - ax, bz - az), ri + i);
      }
      if (rng.chance(0.4)) {
        const s = rng.range(0.1, 0.9);
        const x = ax + (bx - ax) * s + 7,
          z = az + (bz - az) * s + 3;
        const y = ctx.terrain.height(x, z);
        if (y > WATER_LEVEL + 0.5) {
          const b = new Builder(ctx.out, x, y, z, 0, ctx.group++);
          b.span(Kind.AmmoBox, -0.6, 0, -0.35, 0.6, 0.55, 0.35, { mat: Mat.Metal, style: 0 });
        }
      }
    }
  });
}

function vehicles(ctx: GenCtx): void {
  const pts: [number, number, number][] = [];
  ROADS.forEach((road) => {
    for (let i = 0; i < road.length - 1; i += 2) {
      const [ax, az] = road[i]!;
      const [bx, bz] = road[i + 1]!;
      const x = (ax + bx) / 2,
        z = (az + bz) / 2;
      if (ctx.terrain.height(x, z) < WATER_LEVEL + 0.8) continue;
      pts.push([x, z, Math.atan2(bx - ax, bz - az)]);
    }
  });
  for (const [x, z, yaw] of pts) ctx.content.vehicles.push({ x, z, yaw });
}

function groundLoot(ctx: GenCtx): void {
  // Verstreute Beute in der Natur (wenig)
  const rng = new Rng(3131);
  for (let i = 0; i < 220; i++) {
    const x = rng.range(150, MAP_SIZE - 150),
      z = rng.range(150, MAP_SIZE - 150);
    if (islandDist(x, z) > 0.82) continue;
    const y = ctx.terrain.height(x, z);
    if (y < WATER_LEVEL + 0.5) continue;
    ctx.content.loot.push({ x, y: y + 0.05, z, tier: 0 });
  }
}

/** Erzeugt alle Bauteile in die Welt und liefert Zusatzdaten. */
export function generateWorld(world: World): WorldContent {
  const content: WorldContent = { loot: [], vehicles: [], decor: [], buildings: [] };
  const ctx: GenCtx = { rng: new Rng(1234), out: [], content, terrain: world.terrain, group: 0, poi: -1 };
  const gens: Record<string, (c: GenCtx, p: Poi) => void> = {
    harbor: genHarbor,
    city: genCity,
    mill: genMill,
    forest: genForest,
    crater: genCrater,
    farm: genFarm,
    dam: genDam,
    mine: genMine,
    canyon: genCanyon,
    motel: genMotel,
    radio: genRadio,
    resort: genResort,
    lighthouse: genLighthouse,
    peak: genPeak,
  };
  for (const p of POIS) {
    ctx.poi = p.id;
    gens[p.kind]?.(ctx, p);
  }
  ctx.poi = -1;
  countryside(ctx);
  bridges(ctx);
  vehicles(ctx);
  nature(ctx);
  groundLoot(ctx);
  // Sprungpads an markanten Stellen außerhalb des Kraters
  pad(ctx, 1150, 470);
  pad(ctx, 372, 1060);
  pad(ctx, 700, 1180);
  for (const p of ctx.out) world.add(p);
  world.staticCount = world.pieces.length;
  world.dirty.clear();
  // Beutepunkte ohne Wasser
  content.loot = content.loot.filter((l) => l.y > WATER_LEVEL - 0.2);
  return content;
}

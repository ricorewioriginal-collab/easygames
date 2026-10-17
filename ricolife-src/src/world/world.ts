// Weltzustand: Gelände, Wände, Böden, Objekte und daraus abgeleitete Navigationsdaten. Reine Logik (ohne Three.js), testbar in Node.
import type { ObjectDef } from '../data/types';
import { LOTS, type LotDef } from '../data/lots';
import { getDef } from './defs';

export const MAP_W = 160;
export const MAP_H = 100;
export const LEVELS = 2;
export const LEVEL_H = 3;
export const WALL_H = 2.8;

export const enum Ter {
  Grass = 0,
  Road = 1,
  Walk = 2,
  Water = 3,
  Sand = 4,
  Plaza = 5,
  Wood = 6,
  Lot = 7,
}

export type Rot = 0 | 1 | 2 | 3;
export interface Wall {
  k: 0 | 1 | 2; // 0 Wand, 1 Zaun, 2 halbe Wand/Geländer
  a: number; // Farbe/Tapete Seite A (Norden bzw. Westen)
  b: number; // Seite B
}

export interface ObjState {
  broken?: boolean;
  dirty?: boolean;
  servings?: number;
  recipe?: string;
  quality?: number;
  crop?: string;
  growth?: number; // 0..1
  water?: number; // 0..1
  on?: boolean;
  filled?: number; // Napf
  owner?: string;
  progress?: number; // Bild/Buch in Arbeit
  until?: number; // Ablaufzeit (z. B. Teller verschwindet)
}

export interface ObjInst {
  id: string;
  def: string;
  x: number;
  z: number;
  l: number;
  r: Rot;
  ca?: number;
  cb?: number;
  lot: string;
  /** Öffnungen (Tür/Fenster): Kantenrichtung 0 = waagerecht (entlang x), 1 = senkrecht (entlang z) */
  dir?: 0 | 1;
  st?: ObjState;
}

export const cellKey = (l: number, x: number, z: number): number => (l * MAP_H + z) * MAP_W + x;
export const edgeKey = (l: number, x: number, z: number, dir: 0 | 1): number => cellKey(l, x, z) * 2 + dir;
export const inMap = (x: number, z: number): boolean => x >= 0 && z >= 0 && x < MAP_W && z < MAP_H;
export const N_CELLS = MAP_W * MAP_H * LEVELS;

export const dimsOf = (def: ObjectDef, r: Rot): [number, number] => (r % 2 === 0 ? [def.w, def.d] : [def.d, def.w]);

/** lokale Objektkoordinate → Weltversatz (wie Three.js rotation.y = r·90°) */
export function rotLocal(lx: number, lz: number, r: Rot): [number, number] {
  switch (r) {
    case 0:
      return [lx, lz];
    case 1:
      return [lz, -lx];
    case 2:
      return [-lx, -lz];
    default:
      return [-lz, lx];
  }
}

export interface PlaceCheck {
  ok: boolean;
  reason?: string;
}

/** Navigations-Flags je Zelle */
export const F_BLOCK = 1;
export const F_FLOOR = 2;
export const F_WALL_N = 4;
export const F_WALL_W = 8;
export const F_STAIR = 16;
export const F_PRIVATE = 32;

export class World {
  terrain = new Uint8Array(MAP_W * MAP_H);
  /** Lot-Index+1 je Bodenzelle (0 = öffentlich) */
  lotMap = new Uint8Array(MAP_W * MAP_H);
  walls = new Map<number, Wall>();
  floors = new Map<number, number>();
  objs = new Map<string, ObjInst>();
  occ = new Map<number, string>();
  surf = new Map<number, string>();
  wallObj = new Map<number, string>();
  openings = new Map<number, string>();
  flags = new Uint8Array(N_CELLS);
  /** Treppen: Zelle → Ziel-Zellen (beide Richtungen) */
  links = new Map<number, number[]>();
  /** Änderungszähler je Lot (für das Neuaufbauen der Darstellung) */
  lotVersion = new Map<string, number>();
  /** von Spielern veränderte Lots (nur diese werden gespeichert) */
  modified = new Set<string>();
  /** Haushalts-ID → Lot, das als privat gilt, wird außerhalb gesetzt */
  privateLots = new Set<string>();
  /** fest blockierte Bodenzellen (Bäume, Bänke, Fassaden) */
  staticBlock = new Set<number>();
  private idN = 0;

  constructor() {
    LOTS.forEach((lot, i) => {
      for (let z = lot.z; z < lot.z + lot.d; z++) for (let x = lot.x; x < lot.x + lot.w; x++) if (inMap(x, z)) this.lotMap[z * MAP_W + x] = i + 1;
    });
  }

  newId(p = 'o'): string {
    return `${p}${(++this.idN).toString(36)}`;
  }
  /** IDs nach dem Laden fortsetzen */
  bumpIds(): void {
    for (const id of this.objs.keys()) {
      const n = parseInt(id.slice(1), 36);
      if (Number.isFinite(n) && n > this.idN) this.idN = n;
    }
  }

  lotAt(x: number, z: number): LotDef | undefined {
    if (!inMap(Math.floor(x), Math.floor(z))) return undefined;
    const i = this.lotMap[Math.floor(z) * MAP_W + Math.floor(x)]!;
    return i ? LOTS[i - 1] : undefined;
  }
  touch(lot: string, byPlayer = false): void {
    this.lotVersion.set(lot, (this.lotVersion.get(lot) ?? 0) + 1);
    if (byPlayer) this.modified.add(lot);
  }

  // ---------- Wände ----------
  getWall(l: number, x: number, z: number, dir: 0 | 1): Wall | undefined {
    return this.walls.get(edgeKey(l, x, z, dir));
  }
  /** Zellen beiderseits einer Kante */
  static edgeCells(x: number, z: number, dir: 0 | 1): [[number, number], [number, number]] {
    return dir === 0 ? [[x, z - 1], [x, z]] : [[x - 1, z], [x, z]];
  }

  canWall(l: number, x: number, z: number, dir: 0 | 1, lot?: LotDef): PlaceCheck {
    const [a, b] = World.edgeCells(x, z, dir);
    if (lot) {
      const inside = (c: [number, number]): boolean => c[0] >= lot.x && c[0] < lot.x + lot.w && c[1] >= lot.z && c[1] < lot.z + lot.d;
      // Kante muss innerhalb oder auf dem Rand des Grundstücks liegen
      if (!inside(a) && !inside(b)) return { ok: false, reason: 'Außerhalb des Grundstücks' };
      if (!inside(a) || !inside(b)) return { ok: false, reason: 'Wände dürfen nicht auf der Grundstücksgrenze stehen' };
    }
    if (this.walls.has(edgeKey(l, x, z, dir))) return { ok: false, reason: 'Hier steht schon eine Wand' };
    const oa = this.occ.get(cellKey(l, a[0], a[1]));
    const ob = this.occ.get(cellKey(l, b[0], b[1]));
    if (oa && oa === ob) return { ok: false, reason: 'Ein Möbelstück steht im Weg' };
    if (l > 0) {
      const sup = this.floors.has(cellKey(l, a[0], a[1])) || this.floors.has(cellKey(l, b[0], b[1])) || this.walls.has(edgeKey(l - 1, x, z, dir));
      if (!sup) return { ok: false, reason: 'Obere Wände brauchen Boden oder eine Wand darunter' };
    }
    return { ok: true };
  }

  addWall(l: number, x: number, z: number, dir: 0 | 1, w: Wall): void {
    this.walls.set(edgeKey(l, x, z, dir), w);
  }
  removeWall(l: number, x: number, z: number, dir: 0 | 1): ObjInst[] {
    const k = edgeKey(l, x, z, dir);
    this.walls.delete(k);
    // Öffnungen und Wandobjekte an dieser Kante entfernen (werden zurückgegeben, damit Rückerstattung/Undo möglich ist)
    const removed: ObjInst[] = [];
    const op = this.openings.get(k);
    if (op) {
      const o = this.objs.get(op);
      if (o) {
        removed.push(o);
        this.removeObj(o.id);
      }
    }
    for (const side of [0, 1]) {
      const wo = this.wallObj.get(k * 2 + side);
      const o = wo ? this.objs.get(wo) : undefined;
      if (o) {
        removed.push(o);
        this.removeObj(o.id);
      }
    }
    return removed;
  }

  // ---------- Böden ----------
  canFloor(l: number, x: number, z: number): PlaceCheck {
    if (l === 0) return { ok: true };
    if (this.floors.has(cellKey(0, x, z)) || this.cellHasWallBelow(x, z)) return { ok: true };
    // Balkon: an einen vorhandenen Boden im Obergeschoss anschließen
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) if (this.floors.has(cellKey(1, x + dx, z + dz)) && this.floors.has(cellKey(0, x + dx, z + dz))) return { ok: true };
    return { ok: false, reason: 'Kein Halt: darunter fehlt Boden oder eine Wand' };
  }
  private cellHasWallBelow(x: number, z: number): boolean {
    return this.walls.has(edgeKey(0, x, z, 0)) || this.walls.has(edgeKey(0, x, z + 1, 0)) || this.walls.has(edgeKey(0, x, z, 1)) || this.walls.has(edgeKey(0, x + 1, z, 1));
  }

  // ---------- Objekte ----------
  cellsOf(o: { def: string; x: number; z: number; r: Rot }): [number, number][] {
    const def = getDef(o.def);
    const [w, d] = dimsOf(def, o.r);
    const out: [number, number][] = [];
    for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) out.push([o.x + i, o.z + j]);
    return out;
  }
  centerOf(o: ObjInst): [number, number] {
    const def = getDef(o.def);
    if (def.mount === 'opening') {
      return o.dir === 0 ? [o.x + def.w / 2, o.z] : [o.x, o.z + def.w / 2];
    }
    const [w, d] = dimsOf(def, o.r);
    return [o.x + w / 2, o.z + d / 2];
  }
  /** Weltposition und Blickrichtung (Radiant, 0 = +z) eines Interaktionsplatzes */
  slotWorld(o: ObjInst, i: number): { x: number; z: number; yaw: number; y: number; kind: string } | null {
    const def = getDef(o.def);
    const s = def.slots?.[i];
    if (!s) return null;
    const [cx, cz] = this.centerOf(o);
    const [dx, dz] = rotLocal(s.x, s.z, o.r);
    return { x: cx + dx, z: cz + dz, yaw: (o.r * 90 + s.rot) * (Math.PI / 180), y: s.y ?? 0, kind: s.kind };
  }

  canPlace(defId: string, x: number, z: number, l: number, r: Rot, lot?: LotDef, ignore?: string): PlaceCheck {
    const def = getDef(defId);
    if (def.mount === 'opening') return { ok: false, reason: 'Türen und Fenster an eine Wand setzen' };
    const [w, d] = dimsOf(def, r);
    const own = new Set<number>();
    for (let j = 0; j < d; j++)
      for (let i = 0; i < w; i++) {
        const cx = x + i,
          cz = z + j;
        if (!inMap(cx, cz)) return { ok: false, reason: 'Außerhalb der Karte' };
        if (lot && (cx < lot.x || cz < lot.z || cx >= lot.x + lot.w || cz >= lot.z + lot.d)) return { ok: false, reason: 'Außerhalb des Grundstücks' };
        const k = cellKey(l, cx, cz);
        own.add(k);
        if (l === 0 && this.terrain[cz * MAP_W + cx] === Ter.Water && !def.func?.includes('pool')) return { ok: false, reason: 'Nicht auf dem Wasser' };
        if (l > 0 && !this.floors.has(k)) return { ok: false, reason: 'Hier ist kein Boden' };
        if (this.flags[k]! & F_STAIR && !def.func?.includes('stairs')) return { ok: false, reason: 'Treppe im Weg' };
        if (def.mount === 'surface') {
          const base = this.occ.get(k);
          const bd = base ? getDef(this.objs.get(base)!.def) : undefined;
          if (!bd || !(bd.func?.some((f) => f === 'counter' || f === 'table' || f === 'desk'))) return { ok: false, reason: 'Braucht eine Theke oder einen Tisch' };
          const s = this.surf.get(k);
          if (s && s !== ignore) return { ok: false, reason: 'Die Fläche ist belegt' };
        } else if (def.mount !== 'wall') {
          const ob = this.occ.get(k);
          if (ob && ob !== ignore) return { ok: false, reason: 'Platz belegt' };
        }
      }
    // keine Wand quer durch das Objekt
    for (let j = 0; j < d; j++)
      for (let i = 0; i < w; i++) {
        if (i > 0 && this.walls.has(edgeKey(l, x + i, z + j, 1))) return { ok: false, reason: 'Eine Wand verläuft durch das Objekt' };
        if (j > 0 && this.walls.has(edgeKey(l, x + i, z + j, 0))) return { ok: false, reason: 'Eine Wand verläuft durch das Objekt' };
      }
    if (def.mount === 'wall') {
      // Wandobjekt: jede Zelle braucht eine Wand an der Rückseite
      const side = this.backSide(r);
      for (const [cx, cz] of this.cellsOf({ def: defId, x, z, r })) {
        const edge = this.backEdge(cx, cz, r);
        const ek = edgeKey(l, edge[0], edge[1], edge[2]);
        const wall = this.walls.get(ek);
        if (!wall || wall.k !== 0) return { ok: false, reason: 'Braucht eine Wand dahinter' };
        if (this.openings.has(ek)) return { ok: false, reason: 'Dort ist eine Tür oder ein Fenster' };
        const ex = this.wallObj.get(ek * 2 + side);
        if (ex && ex !== ignore) return { ok: false, reason: 'An dieser Wand hängt schon etwas' };
      }
      return { ok: true };
    }
    if (def.func?.includes('stairs')) {
      if (l + 1 >= LEVELS) return { ok: false, reason: 'Höher geht es nicht' };
      const ends = this.stairEnds({ def: defId, x, z, l, r });
      if (!this.floors.has(cellKey(l + 1, ends.top[0], ends.top[1]))) return { ok: false, reason: 'Oben fehlt Boden zum Aussteigen' };
      if (this.occ.get(cellKey(l, ends.bottom[0], ends.bottom[1]))) return { ok: false, reason: 'Unten ist der Zugang blockiert' };
    }
    // Zugang: mindestens ein Platz erreichbar
    if (def.slots?.length && !def.func?.includes('stairs')) {
      const fake: ObjInst = { id: ignore ?? '_', def: defId, x, z, l, r, lot: lot?.id ?? '' };
      let anyOk = false;
      for (let i = 0; i < def.slots.length; i++) if (this.slotFree(fake, i, own)) anyOk = true;
      if (!anyOk) return { ok: false, reason: 'Kein Zugang – davor ist es blockiert' };
    }
    // andere Objekte nicht vollständig zustellen
    for (const o of this.objs.values()) {
      if (o.id === ignore || o.l !== l) continue;
      const od = getDef(o.def);
      if (!od.slots?.length || od.mount === 'opening' || od.func?.includes('stairs')) continue;
      const [cx, cz] = this.centerOf(o);
      if (Math.abs(cx - x) > 6 || Math.abs(cz - z) > 6) continue;
      let before = false,
        after = false;
      for (let i = 0; i < od.slots.length; i++) {
        if (this.slotFree(o, i)) before = true;
        if (this.slotFree(o, i, own)) after = true;
      }
      if (before && !after) return { ok: false, reason: `Versperrt den Zugang zu: ${od.name}` };
    }
    // Türen freihalten
    for (const k of own) {
      const l2 = Math.floor(k / (MAP_W * MAP_H));
      const rest = k - l2 * MAP_W * MAP_H;
      const cz = Math.floor(rest / MAP_W),
        cx = rest % MAP_W;
      for (const [ex, ez, dir] of [
        [cx, cz, 0],
        [cx, cz + 1, 0],
        [cx, cz, 1],
        [cx + 1, cz, 1],
      ] as [number, number, 0 | 1][]) {
        const op = this.openings.get(edgeKey(l2, ex, ez, dir));
        if (op && getDef(this.objs.get(op)!.def).func?.includes('door') && def.h > 0.05) return { ok: false, reason: 'Steht vor einer Tür' };
      }
    }
    return { ok: true };
  }

  /** Ist der Interaktionsplatz frei? extra = zusätzlich belegte Zellen (Platzierungsvorschau) */
  slotFree(o: ObjInst, i: number, extra?: Set<number>): boolean {
    const s = this.slotWorld(o, i);
    if (!s) return false;
    const def = getDef(o.def);
    const slot = def.slots![i]!;
    if (slot.kind === 'sleep') return true;
    // Sitz in der Grundfläche: Zugang über eine Nachbarzelle (vorn, sonst seitlich/hinten – z. B. Stuhl am Tisch)
    if (slot.kind === 'sit') return this.seatAccess(o, extra) !== null;
    const cx = Math.floor(s.x),
      cz = Math.floor(s.z);
    // Platz in der eigenen Grundfläche (Dusche, Laufband, Angelsteg, Tanzfläche): eine freie Nachbarzelle genügt
    if (this.cellsOf(o).some(([x, z]) => x === cx && z === cz)) {
      const own = new Set(this.cellsOf(o).map(([x, z]) => cellKey(o.l, x, z)));
      return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => {
        const nx = cx + dx!,
          nz = cz + dz!;
        return !own.has(cellKey(o.l, nx, nz)) && this.cellWalkable(o.l, nx, nz, o.id, extra) && !this.wallBetween(o.l, cx, cz, nx, nz);
      });
    }
    if (!this.cellWalkable(o.l, cx, cz, o.id, extra)) return false;
    // keine Wand zwischen Platz und Objekt
    const [ocx, ocz] = this.centerOf(o);
    const ox = Math.floor(ocx + (s.x - ocx) * 0.4),
      oz = Math.floor(ocz + (s.z - ocz) * 0.4);
    return !this.wallBetween(o.l, cx, cz, ox, oz);
  }

  /** Zugangszelle (Zellmitte) eines Sitzobjekts: vor dem Objekt, sonst links/rechts, sonst dahinter; null = zugestellt.
   *  Stühle schauen zum Tisch – ihre Vorderzelle ist dann belegt, Zugang erfolgt von der Seite oder von hinten. */
  seatAccess(o: ObjInst, extra?: Set<number>): [number, number] | null {
    const def = getDef(o.def);
    const [cx, cz] = this.centerOf(o);
    const hw = def.w / 2,
      hd = def.d / 2;
    for (const [lx, lz, ix, iz] of [
      [0, hd + 0.5, 0, hd - 0.5],
      [hw + 0.5, 0, hw - 0.5, 0],
      [-hw - 0.5, 0, -hw + 0.5, 0],
      [0, -hd - 0.5, 0, -hd + 0.5],
    ] as const) {
      const [dx, dz] = rotLocal(lx, lz, o.r);
      const tx = Math.floor(cx + dx),
        tz = Math.floor(cz + dz);
      if (!this.cellWalkable(o.l, tx, tz, o.id, extra)) continue;
      const [ex, ez] = rotLocal(ix, iz, o.r);
      if (this.wallBetween(o.l, tx, tz, Math.floor(cx + ex), Math.floor(cz + ez))) continue;
      return [tx + 0.5, tz + 0.5];
    }
    return null;
  }

  cellWalkable(l: number, x: number, z: number, ignoreObj?: string, extra?: Set<number>): boolean {
    if (!inMap(x, z)) return false;
    const k = cellKey(l, x, z);
    if (extra?.has(k)) return false;
    if (l === 0 && this.terrain[z * MAP_W + x] === Ter.Water) return false;
    if (l > 0 && !this.floors.has(k)) return false;
    if (this.flags[k]! & F_STAIR) return false;
    const ob = this.occ.get(k);
    if (ob && ob !== ignoreObj && getDef(this.objs.get(ob)!.def).h > 0.05) return false;
    return true;
  }

  /** Wand zwischen zwei benachbarten Zellen (auch diagonal geprüft) */
  wallBetween(l: number, ax: number, az: number, bx: number, bz: number): boolean {
    if (ax === bx && az === bz) return false;
    const dx = bx - ax,
      dz = bz - az;
    if (Math.abs(dx) > 1 || Math.abs(dz) > 1) return false;
    const blockE = (x: number, z: number, dir: 0 | 1): boolean => {
      const k = edgeKey(l, x, z, dir);
      if (!this.walls.has(k)) return false;
      const op = this.openings.get(k);
      return !(op && getDef(this.objs.get(op)!.def).func?.includes('door'));
    };
    if (dz === 0) return blockE(Math.max(ax, bx), az, 1);
    if (dx === 0) return blockE(ax, Math.max(az, bz), 0);
    // diagonal: beide Wege über die Ecke müssen frei sein
    return blockE(Math.max(ax, bx), az, 1) || blockE(ax, Math.max(az, bz), 0) || blockE(Math.max(ax, bx), bz, 1) || blockE(bx, Math.max(az, bz), 0);
  }

  backEdge(x: number, z: number, r: Rot): [number, number, 0 | 1] {
    // Rückseite eines 1×1-Wandobjekts
    switch (r) {
      case 0:
        return [x, z, 0]; // Rückseite Norden
      case 1:
        return [x, z, 1]; // Vorderseite Osten → Rückseite Westen
      case 2:
        return [x, z + 1, 0];
      default:
        return [x + 1, z, 1];
    }
  }
  backSide(r: Rot): 0 | 1 {
    // Seite B = Süden/Osten der Kante
    return r === 0 || r === 1 ? 1 : 0;
  }

  stairEnds(o: { def: string; x: number; z: number; l: number; r: Rot }): { bottom: [number, number]; top: [number, number] } {
    const def = getDef(o.def);
    const [w, d] = dimsOf(def, o.r);
    const cx = o.x + w / 2,
      cz = o.z + d / 2;
    const [fx, fz] = rotLocal(0, def.d / 2 + 0.5, o.r);
    const [bx, bz] = rotLocal(0, -def.d / 2 - 0.5, o.r);
    return { bottom: [Math.floor(cx + fx), Math.floor(cz + fz)], top: [Math.floor(cx + bx), Math.floor(cz + bz)] };
  }

  canOpening(defId: string, x: number, z: number, l: number, dir: 0 | 1, ignore?: string): PlaceCheck {
    const def = getDef(defId);
    const isDoor = def.func?.includes('door');
    for (let i = 0; i < def.w; i++) {
      const ex = dir === 0 ? x + i : x,
        ez = dir === 0 ? z : z + i;
      const k = edgeKey(l, ex, ez, dir);
      const w = this.walls.get(k);
      if (!w) return { ok: false, reason: 'Braucht eine Wand' };
      if (!isDoor && w.k !== 0) return { ok: false, reason: 'Fenster nur in festen Wänden' };
      const ex2 = this.openings.get(k);
      if (ex2 && ex2 !== ignore) return { ok: false, reason: 'Hier ist schon eine Öffnung' };
      if (this.wallObj.get(k * 2) || this.wallObj.get(k * 2 + 1)) return { ok: false, reason: 'Ein Wandobjekt hängt hier' };
      if (isDoor) {
        const [a, b] = World.edgeCells(ex, ez, dir);
        for (const c of [a, b]) {
          if (!inMap(c[0], c[1])) return { ok: false, reason: 'Tür führt ins Nichts' };
          if (l > 0 && !this.floors.has(cellKey(l, c[0], c[1]))) return { ok: false, reason: 'Tür führt ins Nichts' };
          const ob = this.occ.get(cellKey(l, c[0], c[1]));
          if (ob && getDef(this.objs.get(ob)!.def).h > 0.05) return { ok: false, reason: 'Ein Möbelstück versperrt die Tür' };
        }
      }
    }
    return { ok: true };
  }

  addObj(o: ObjInst): ObjInst {
    const def = getDef(o.def);
    this.objs.set(o.id, o);
    if (def.mount === 'opening') {
      for (let i = 0; i < def.w; i++) {
        const ex = o.dir === 0 ? o.x + i : o.x,
          ez = o.dir === 0 ? o.z : o.z + i;
        this.openings.set(edgeKey(o.l, ex, ez, o.dir ?? 0), o.id);
      }
    } else if (def.mount === 'wall') {
      for (const [cx, cz] of this.cellsOf(o)) {
        const e = this.backEdge(cx, cz, o.r);
        this.wallObj.set(edgeKey(o.l, e[0], e[1], e[2]) * 2 + this.backSide(o.r), o.id);
      }
    } else {
      for (const [x, z] of this.cellsOf(o)) (def.mount === 'surface' ? this.surf : this.occ).set(cellKey(o.l, x, z), o.id);
    }
    return o;
  }

  removeObj(id: string): ObjInst | undefined {
    const o = this.objs.get(id);
    if (!o) return undefined;
    const def = getDef(o.def);
    this.objs.delete(id);
    const clear = (m: Map<number, string>): void => {
      for (const [k, v] of m) if (v === id) m.delete(k);
    };
    if (def.mount === 'opening') clear(this.openings);
    else if (def.mount === 'wall') clear(this.wallObj);
    else {
      clear(def.mount === 'surface' ? this.surf : this.occ);
      // Dinge auf der Fläche fallen mit weg
      if (def.mount !== 'surface') for (const [x, z] of this.cellsOf(o)) {
        const s = this.surf.get(cellKey(o.l, x, z));
        if (s) this.removeObj(s);
      }
    }
    return o;
  }

  objsOnLot(lot: string): ObjInst[] {
    const out: ObjInst[] = [];
    for (const o of this.objs.values()) if (o.lot === lot) out.push(o);
    return out;
  }

  // ---------- Navigation ----------
  rebuildFlags(region?: { x: number; z: number; w: number; d: number }): void {
    const x0 = region ? Math.max(0, region.x - 1) : 0,
      z0 = region ? Math.max(0, region.z - 1) : 0;
    const x1 = region ? Math.min(MAP_W, region.x + region.w + 1) : MAP_W,
      z1 = region ? Math.min(MAP_H, region.z + region.d + 1) : MAP_H;
    for (let l = 0; l < LEVELS; l++)
      for (let z = z0; z < z1; z++)
        for (let x = x0; x < x1; x++) {
          const k = cellKey(l, x, z);
          let f = 0;
          const t = this.terrain[z * MAP_W + x]!;
          const hasFloor = this.floors.has(k);
          if (hasFloor) f |= F_FLOOR;
          if (l === 0 && (t === Ter.Water || this.staticBlock.has(k))) f |= F_BLOCK;
          if (l > 0 && !hasFloor) f |= F_BLOCK;
          const ob = this.occ.get(k);
          if (ob) {
            const od = getDef(this.objs.get(ob)!.def);
            if (od.func?.includes('stairs')) f |= F_STAIR | F_BLOCK;
            else if (od.h > 0.05) f |= F_BLOCK;
          }
          const wn = this.walls.has(edgeKey(l, x, z, 0)),
            ww = this.walls.has(edgeKey(l, x, z, 1));
          const dn = this.isDoorEdge(edgeKey(l, x, z, 0)),
            dw = this.isDoorEdge(edgeKey(l, x, z, 1));
          if (wn && !dn) f |= F_WALL_N;
          if (ww && !dw) f |= F_WALL_W;
          const lot = this.lotAt(x, z);
          if (lot && lot.kind === 'home' && this.privateLots.has(lot.id) && hasFloor) f |= F_PRIVATE;
          this.flags[k] = f;
        }
    // Treppenzellen im Obergeschoss sind offen (Treppenauge)
    for (const o of this.objs.values()) {
      const d = getDef(o.def);
      if (!d.func?.includes('stairs') || o.l + 1 >= LEVELS) continue;
      for (const [x, z] of this.cellsOf(o)) this.flags[cellKey(o.l + 1, x, z)] = (this.flags[cellKey(o.l + 1, x, z)]! | F_BLOCK) & ~F_FLOOR;
    }
    this.rebuildLinks();
  }
  private isDoorEdge(k: number): boolean {
    const op = this.openings.get(k);
    return !!op && !!getDef(this.objs.get(op)!.def).func?.includes('door');
  }
  rebuildLinks(): void {
    this.links.clear();
    for (const o of this.objs.values()) {
      const d = getDef(o.def);
      if (!d.func?.includes('stairs') || o.l + 1 >= LEVELS) continue;
      const e = this.stairEnds(o);
      const a = cellKey(o.l, e.bottom[0], e.bottom[1]),
        b = cellKey(o.l + 1, e.top[0], e.top[1]);
      (this.links.get(a) ?? this.links.set(a, []).get(a)!).push(b);
      (this.links.get(b) ?? this.links.set(b, []).get(b)!).push(a);
    }
  }

  /** Wert aller Gebäudeteile und Objekte eines Lots */
  lotValue(lotId: string): number {
    const lot = LOTS.find((l) => l.id === lotId);
    if (!lot) return 0;
    let v = lot.land;
    for (const o of this.objs.values()) if (o.lot === lotId) v += getDef(o.def).price;
    for (const [k] of this.walls) {
      const c = Math.floor(k / 2);
      const l = Math.floor(c / (MAP_W * MAP_H));
      const rest = c - l * MAP_W * MAP_H;
      const z = Math.floor(rest / MAP_W),
        x = rest % MAP_W;
      if (x >= lot.x && x <= lot.x + lot.w && z >= lot.z && z <= lot.z + lot.d) v += 70;
    }
    for (const [k] of this.floors) {
      const l = Math.floor(k / (MAP_W * MAP_H));
      const rest = k - l * MAP_W * MAP_H;
      const z = Math.floor(rest / MAP_W),
        x = rest % MAP_W;
      if (x >= lot.x && x < lot.x + lot.w && z >= lot.z && z < lot.z + lot.d) v += 10;
    }
    return v;
  }

  /** Löscht alles auf einem Lot (für Neuaufbau aus Vorlage oder Laden) */
  clearLot(lot: LotDef): void {
    for (const o of [...this.objs.values()]) if (o.lot === lot.id) this.removeObj(o.id);
    const inLot = (x: number, z: number): boolean => x >= lot.x && x <= lot.x + lot.w && z >= lot.z && z <= lot.z + lot.d;
    for (const k of [...this.walls.keys()]) {
      const c = Math.floor(k / 2);
      const l = Math.floor(c / (MAP_W * MAP_H));
      const rest = c - l * MAP_W * MAP_H;
      if (inLot(rest % MAP_W, Math.floor(rest / MAP_W))) this.walls.delete(k);
    }
    for (const k of [...this.floors.keys()]) {
      const l = Math.floor(k / (MAP_W * MAP_H));
      const rest = k - l * MAP_W * MAP_H;
      const x = rest % MAP_W,
        z = Math.floor(rest / MAP_W);
      if (x >= lot.x && x < lot.x + lot.w && z >= lot.z && z < lot.z + lot.d) this.floors.delete(k);
    }
  }
}

/** Wandkanten eines Lots (für Speichern/Zählen) */
export function decodeEdge(k: number): { l: number; x: number; z: number; dir: 0 | 1 } {
  const dir = (k % 2) as 0 | 1;
  const c = Math.floor(k / 2);
  const l = Math.floor(c / (MAP_W * MAP_H));
  const rest = c - l * MAP_W * MAP_H;
  return { l, x: rest % MAP_W, z: Math.floor(rest / MAP_W), dir };
}
export function decodeCell(k: number): { l: number; x: number; z: number } {
  const l = Math.floor(k / (MAP_W * MAP_H));
  const rest = k - l * MAP_W * MAP_H;
  return { l, x: rest % MAP_W, z: Math.floor(rest / MAP_W) };
}

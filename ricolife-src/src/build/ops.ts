// Bau-/Kaufmodus: reine Logik (ohne DOM/Three.js, in Node testbar).
// Jede Änderung wird als Plan geprüft (für Vorschau und Hinweiszeile) und dann als Befehl ausgeführt.
// Befehle speichern die Differenz des Grundstücks (Wände, Böden, Objekte) und den gebuchten Betrag – Rückgängig/Wiederholen
// stellen Welt und Haushaltskonto exakt wieder her, ohne unbeteiligte Objektzustände (Beete, Schmutz …) zurückzusetzen.
import { lotById, type LotDef } from '../data/lots';
import type { Game } from '../sim/game';
import { lotData } from '../sim/save';
import { getDef } from '../world/defs';
import { buildTerrain, lotEntrance } from '../world/map';
import { applyTemplate, templateFits } from '../world/templates';
import { cellKey, dimsOf, edgeKey, LEVELS, World, type ObjInst, type Rot, type Wall } from '../world/world';
import type { Command } from './history';

/** Preise je Bauteil (Wand nach Art: Wand, Zaun, halbe Wand) */
export const WALL_COST: Record<0 | 1 | 2, number> = { 0: 70, 1: 40, 2: 50 };
export const FLOOR_COST = 10;
export const PAINT_COST = 5;
/** Rückkaufquote für Möbel */
export const RESALE = 0.85;
/** Standardfarben neuer Wände (WALL_PAINTS-Index): innen Weiß, außen heller Putz */
export const WALL_IN = 0;
export const WALL_OUT = 13;
const MAX_LINE = 64;

export interface Ctx {
  g: Game;
  hh: string | null;
  lot: LotDef | null;
}
export interface PEdge {
  x: number;
  z: number;
  dir: 0 | 1;
  ok: boolean;
}
export interface Plan {
  ok: boolean;
  reason?: string;
  /** Kosten (>0) bzw. Erlös (<0) ohne Kreativmodus */
  cost: number;
  n: number;
  kind: 'Bau' | 'Kauf' | 'Verkauf';
  label: string;
  /** Vorschau: betroffene Kanten bzw. Zellen */
  edges?: PEdge[];
  cells?: { x: number; z: number; ok: boolean }[];
  apply?: () => void;
  emit?: () => void;
}
export type Result = { ok: true; cmd: BuildCmd } | { ok: false; reason: string };

const fail = (reason: string, label = ''): Plan => ({ ok: false, reason, cost: 0, n: 0, kind: 'Bau', label });
const inLot = (lot: LotDef, x: number, z: number): boolean => x >= lot.x && z >= lot.z && x < lot.x + lot.w && z < lot.z + lot.d;
export const money = (n: number): string => `${Math.round(n).toLocaleString('de-DE')} RT`;

/** Text für das Zeiger-Etikett: „Wand · 4 m · 280 RT“ bzw. „⛔ Grund“. cost = tatsächliche Kosten (effCost) */
export function planTip(plan: Plan, cost: number, name?: string, measure?: string): string {
  if (!plan.ok) return `⛔ ${plan.reason ?? 'Nicht möglich'}`;
  const parts = [name || plan.label];
  if (measure) parts.push(measure);
  if (cost > 0) parts.push(money(cost));
  else if (cost < 0) parts.push(`+${money(-cost)}`);
  return parts.join(' · ');
}

function base(ctx: Ctx): string | null {
  if (!ctx.hh || !ctx.g.hhs.has(ctx.hh)) return 'Kein aktiver Haushalt';
  if (!ctx.lot) return 'Dein Haushalt hat kein Grundstück';
  if (ctx.g.role === 'guest') return 'Als Gast kannst du hier nicht bauen';
  return null;
}
/** tatsächlich gebuchter Betrag (Kreativmodus = kostenlos) */
export function effCost(g: Game, cost: number): number {
  return g.settings.creative ? 0 : cost;
}

// ---------- Differenzen ----------
interface Snap {
  walls: Map<number, Wall>;
  floors: Map<number, number>;
  objs: Map<string, ObjInst>;
}
export interface Diff {
  walls: [number, Wall | null, Wall | null][];
  floors: [number, number | null, number | null][];
  objs: [string, ObjInst | null, ObjInst | null][];
}
function snap(g: Game, lot: LotDef): Snap {
  const d = lotData(g, lot.id)!;
  return { walls: new Map(d.walls.map(([k, w]) => [k, { ...w }])), floors: new Map(d.floors), objs: new Map(d.objs.map((o) => [o.id, o])) };
}
const sameWall = (a: Wall, b: Wall): boolean => a.k === b.k && a.a === b.a && a.b === b.b;
const sameObj = (a: ObjInst, b: ObjInst): boolean => a.def === b.def && a.x === b.x && a.z === b.z && a.l === b.l && a.r === b.r && a.ca === b.ca && a.cb === b.cb && a.dir === b.dir && a.lot === b.lot;
function makeDiff(a: Snap, b: Snap): Diff {
  const d: Diff = { walls: [], floors: [], objs: [] };
  for (const [k, w] of a.walls) {
    const n = b.walls.get(k);
    if (!n || !sameWall(w, n)) d.walls.push([k, w, n ?? null]);
  }
  for (const [k, w] of b.walls) if (!a.walls.has(k)) d.walls.push([k, null, w]);
  for (const [k, f] of a.floors) {
    const n = b.floors.get(k);
    if (n !== f) d.floors.push([k, f, n ?? null]);
  }
  for (const [k, f] of b.floors) if (!a.floors.has(k)) d.floors.push([k, null, f]);
  for (const [id, o] of a.objs) {
    const n = b.objs.get(id);
    if (!n || !sameObj(o, n)) d.objs.push([id, o, n ?? null]);
  }
  for (const [id, o] of b.objs) if (!a.objs.has(id)) d.objs.push([id, null, o]);
  return d;
}
export const diffEmpty = (d: Diff): boolean => !d.walls.length && !d.floors.length && !d.objs.length;

/** Differenz anwenden: fwd = Zustand „nachher“, sonst „vorher“ */
function applyDiff(g: Game, lot: LotDef, d: Diff, fwd: boolean): void {
  const w = g.world;
  const present = w.objsOnLot(lot.id);
  const inDiff = new Set(d.objs.map((x) => x[0]));
  const keepSt = new Map<string, ObjInst['st']>();
  for (const [id] of d.objs) {
    const cur = w.objs.get(id);
    if (cur) {
      keepSt.set(id, cur.st);
      w.removeObj(id);
    }
  }
  for (const [k, a, b] of d.walls) {
    const t = fwd ? b : a;
    if (t) w.walls.set(k, { ...t });
    else w.walls.delete(k);
  }
  for (const [k, a, b] of d.floors) {
    const t = fwd ? b : a;
    if (t !== null) w.floors.set(k, t);
    else w.floors.delete(k);
  }
  for (const [id, a, b] of d.objs) {
    const t = fwd ? b : a;
    if (t) w.addObj({ ...t, st: keepSt.get(id) ?? (t.st ? { ...t.st } : {}) });
  }
  // beiläufig mitentfernte Dinge (z. B. Teller auf einem Tisch) wiederherstellen
  for (const o of present) if (!inDiff.has(o.id) && !w.objs.has(o.id)) w.addObj(o);
}

/** nach jeder Änderung: Darstellung, Navigation, Reservierungen, Figuren */
function finish(g: Game, lot: LotDef, d: Diff | null, fwd: boolean): void {
  const w = g.world;
  w.touch(lot.id, true);
  w.rebuildFlags(lot);
  for (const k of [...g.reserved.keys()]) {
    const i = k.lastIndexOf(':');
    if (!w.objs.has(i > 0 ? k.slice(0, i) : k)) g.reserved.delete(k);
  }
  rescue(g, lot, d, fwd);
  g.bus.emit('worldChanged', { lot: lot.id });
}

/** Figuren, die nach der Änderung in einem Möbelstück oder über dem Nichts stehen, an den Grundstückszugang setzen */
function rescue(g: Game, lot: LotDef, d: Diff | null, fwd: boolean): void {
  const w = g.world;
  const blocked = new Set<number>();
  if (d)
    for (const [, a, b] of d.objs) {
      const t = fwd ? b : a;
      if (!t) continue;
      const def = getDef(t.def);
      if (def.mount === 'opening' || def.mount === 'wall' || def.mount === 'surface' || def.h <= 0.05) continue;
      for (const [x, z] of w.cellsOf(t)) blocked.add(cellKey(t.l, x, z));
    }
  const [ex, ez] = lotEntrance(lot.id);
  const fix = (s: { x: number; z: number; l: number; rt: { path: unknown; pathI: number } }): void => {
    const cx = Math.floor(s.x),
      cz = Math.floor(s.z);
    if (!inLot(lot, cx, cz)) return;
    const k = cellKey(s.l, cx, cz);
    const bad = (s.l > 0 && !w.floors.has(k)) || blocked.has(k) || (!d && !w.cellWalkable(s.l, cx, cz));
    if (!bad) return;
    s.x = ex;
    s.z = ez;
    s.l = 0;
    s.rt.path = null;
    s.rt.pathI = 0;
  };
  for (const s of g.sims.values()) fix(s);
  for (const p of g.pets.values()) fix(p);
}

// ---------- Befehle ----------
export class BuildCmd implements Command {
  constructor(
    readonly g: Game,
    readonly hh: string,
    readonly lot: LotDef,
    readonly label: string,
    readonly kind: Plan['kind'],
    /** tatsächlich gebuchter Betrag (>0 bezahlt, <0 erstattet) */
    readonly cost: number,
    readonly diff: Diff,
    private emit?: () => void,
  ) {}
  undo(): true | string {
    const { g, hh } = this;
    if (this.cost > 0) g.money(hh, this.cost, `Rückgängig: ${this.label}`);
    else if (this.cost < 0 && !g.money(hh, this.cost, `Rückgängig: ${this.label}`)) return 'Nicht genug Geld zum Rückgängigmachen';
    applyDiff(g, this.lot, this.diff, false);
    finish(g, this.lot, this.diff, false);
    return true;
  }
  redo(): true | string {
    const { g, hh } = this;
    if (this.cost > 0 && !g.money(hh, -this.cost, `${this.kind}: ${this.label}`)) return `Nicht genug Geld (${money(this.cost)})`;
    if (this.cost < 0) g.money(hh, -this.cost, `Verkauf: ${this.label}`);
    applyDiff(g, this.lot, this.diff, true);
    finish(g, this.lot, this.diff, true);
    this.emit?.();
    return true;
  }
}

/** Plan ausführen: Geld prüfen, Welt ändern, buchen, Ereignisse senden */
export function execute(ctx: Ctx, plan: Plan): Result {
  const b = base(ctx);
  if (b) return { ok: false, reason: b };
  if (!plan.ok || !plan.apply) return { ok: false, reason: plan.reason ?? 'Nicht möglich' };
  const g = ctx.g,
    hh = ctx.hh!,
    lot = ctx.lot!;
  const cost = effCost(g, plan.cost);
  if (cost > 0 && !g.canAfford(hh, cost)) return { ok: false, reason: `Nicht genug Geld (${money(cost)})` };
  const before = snap(g, lot);
  plan.apply();
  const diff = makeDiff(before, snap(g, lot));
  if (cost > 0 && !g.money(hh, -cost, `${plan.kind}: ${plan.label}`)) {
    applyDiff(g, lot, diff, false);
    finish(g, lot, diff, false);
    return { ok: false, reason: `Nicht genug Geld (${money(cost)})` };
  }
  if (cost < 0) g.money(hh, -cost, `Verkauf: ${plan.label}`);
  finish(g, lot, diff, true);
  plan.emit?.();
  return { ok: true, cmd: new BuildCmd(g, hh, lot, plan.label, plan.kind, cost, diff, plan.emit) };
}

// ---------- Kanten ----------
/** gerade Kantenlinie zwischen zwei Rasterpunkten (dominante Achse) */
export function lineEdges(vx0: number, vz0: number, vx1: number, vz1: number): { x: number; z: number; dir: 0 | 1 }[] {
  const out: { x: number; z: number; dir: 0 | 1 }[] = [];
  if (Math.abs(vx1 - vx0) >= Math.abs(vz1 - vz0)) {
    const a = Math.min(vx0, vx1),
      b = Math.min(Math.max(vx0, vx1), a + MAX_LINE);
    for (let x = a; x < b; x++) out.push({ x, z: vz0, dir: 0 });
  } else {
    const a = Math.min(vz0, vz1),
      b = Math.min(Math.max(vz0, vz1), a + MAX_LINE);
    for (let z = a; z < b; z++) out.push({ x: vx0, z, dir: 1 });
  }
  return out;
}
/** liegt die Kante auf dem Grundstück (mindestens eine Nachbarzelle innen)? */
function edgeOnLot(lot: LotDef, x: number, z: number, dir: 0 | 1): boolean {
  const [a, b] = World.edgeCells(x, z, dir);
  return inLot(lot, a[0], a[1]) || inLot(lot, b[0], b[1]);
}

const WALL_NAMES = ['Wand', 'Zaun', 'Halbwand'];

export function planWalls(ctx: Ctx, l: number, edges: { x: number; z: number; dir: 0 | 1 }[], k: 0 | 1 | 2): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const w = ctx.g.world,
    lot = ctx.lot!;
  if (!edges.length) return fail('Ziehen, um Wände zu bauen');
  const out: PEdge[] = [];
  let reason: string | undefined;
  for (const e of edges) {
    if (w.walls.has(edgeKey(l, e.x, e.z, e.dir))) continue;
    const c = w.canWall(l, e.x, e.z, e.dir, lot);
    if (!c.ok) reason ??= c.reason;
    out.push({ ...e, ok: c.ok });
  }
  if (!out.length) return { ...fail('Hier stehen schon Wände'), edges: out };
  const n = out.length;
  const label = `${n}× ${WALL_NAMES[k]}`;
  return {
    ok: !reason,
    reason,
    cost: n * WALL_COST[k],
    n,
    kind: 'Bau',
    label,
    edges: out,
    apply: () => {
      for (const e of out) w.addWall(l, e.x, e.z, e.dir, { k, a: k === 0 ? WALL_IN : WALL_OUT, b: k === 0 ? WALL_IN : WALL_OUT });
    },
    emit: () => ctx.g.bus.emit('build', { hh: ctx.hh!, kind: 'wall', n }),
  };
}

/** Raum: Rechteck aus Zellen (inklusive) → Boden + umlaufende Wände (Innenseite in Farbe paint) */
export function planRoom(ctx: Ctx, l: number, x0: number, z0: number, x1: number, z1: number, floor: number, paint: number): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const w = ctx.g.world,
    lot = ctx.lot!;
  const ax = Math.min(x0, x1),
    bx = Math.max(x0, x1),
    az = Math.min(z0, z1),
    bz = Math.max(z0, z1);
  if (bx - ax > 30 || bz - az > 30) return fail('Der Raum ist zu groß');
  const cells: { x: number; z: number; ok: boolean }[] = [];
  let reason: string | undefined;
  let nf = 0;
  for (let z = az; z <= bz; z++)
    for (let x = ax; x <= bx; x++) {
      let ok = inLot(lot, x, z);
      if (!ok) reason ??= 'Außerhalb des Grundstücks';
      else {
        const c = w.canFloor(l, x, z);
        if (!c.ok) {
          ok = false;
          reason ??= c.reason;
        }
      }
      if (w.floors.get(cellKey(l, x, z)) !== floor) nf++;
      cells.push({ x, z, ok });
    }
  // Umlauf: Innenseite (B bei oberer/linker Kante, A bei unterer/rechter Kante)
  const ring: { x: number; z: number; dir: 0 | 1; inB: boolean }[] = [];
  for (let x = ax; x <= bx; x++) ring.push({ x, z: az, dir: 0, inB: true }, { x, z: bz + 1, dir: 0, inB: false });
  for (let z = az; z <= bz; z++) ring.push({ x: ax, z, dir: 1, inB: true }, { x: bx + 1, z, dir: 1, inB: false });
  // geplante Böden kurz eintragen, damit Obergeschoss-Wände Halt finden (synchron, ohne Darstellung)
  const tmp: number[] = [];
  if (l > 0)
    for (const c of cells) {
      const k = cellKey(l, c.x, c.z);
      if (!w.floors.has(k)) {
        w.floors.set(k, floor);
        tmp.push(k);
      }
    }
  const edges: PEdge[] = [];
  const newRing: typeof ring = [];
  for (const e of ring) {
    if (w.walls.has(edgeKey(l, e.x, e.z, e.dir))) continue;
    const c = w.canWall(l, e.x, e.z, e.dir, lot);
    if (!c.ok) reason ??= c.reason;
    edges.push({ x: e.x, z: e.z, dir: e.dir, ok: c.ok });
    newRing.push(e);
  }
  for (const k of tmp) w.floors.delete(k);
  const nw = newRing.length;
  if (!nf && !nw) return { ...fail('Der Raum ist schon fertig'), edges, cells };
  return {
    ok: !reason,
    reason,
    cost: nf * FLOOR_COST + nw * WALL_COST[0],
    n: nw + nf,
    kind: 'Bau',
    label: `Raum ${bx - ax + 1}×${bz - az + 1}`,
    edges,
    cells,
    apply: () => {
      for (const c of cells) w.floors.set(cellKey(l, c.x, c.z), floor);
      for (const e of newRing) w.addWall(l, e.x, e.z, e.dir, { k: 0, a: e.inB ? WALL_OUT : paint, b: e.inB ? paint : WALL_OUT });
    },
    emit: () => {
      if (nw) ctx.g.bus.emit('build', { hh: ctx.hh!, kind: 'wall', n: nw });
      if (nf) ctx.g.bus.emit('build', { hh: ctx.hh!, kind: 'floor', n: nf });
    },
  };
}

/** Bodenbelag in einem Rechteck; floor = -1 entfernt den Boden */
export function planFloor(ctx: Ctx, l: number, x0: number, z0: number, x1: number, z1: number, floor: number): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const w = ctx.g.world,
    lot = ctx.lot!;
  const ax = Math.min(x0, x1),
    bx = Math.max(x0, x1),
    az = Math.min(z0, z1),
    bz = Math.max(z0, z1);
  if (bx - ax > 40 || bz - az > 40) return fail('Die Fläche ist zu groß');
  const cells: { x: number; z: number; ok: boolean }[] = [];
  const todo: number[] = [];
  let reason: string | undefined;
  for (let z = az; z <= bz; z++)
    for (let x = ax; x <= bx; x++) {
      const k = cellKey(l, x, z);
      const cur = w.floors.get(k);
      let ok = inLot(lot, x, z);
      if (!ok) reason ??= 'Außerhalb des Grundstücks';
      else if (floor < 0) {
        if (cur === undefined) continue;
        if (l > 0 && (w.occ.has(k) || w.surf.has(k))) {
          ok = false;
          reason ??= 'Erst die Möbel darauf entfernen';
        }
      } else {
        if (cur === floor) continue;
        if (cur === undefined) {
          const c = w.canFloor(l, x, z);
          if (!c.ok) {
            ok = false;
            reason ??= c.reason;
          }
        }
      }
      cells.push({ x, z, ok });
      if (ok) todo.push(k);
    }
  if (!cells.length) return fail(floor < 0 ? 'Hier ist kein Boden' : 'Hier liegt schon dieser Belag');
  const n = cells.length;
  return {
    ok: !reason,
    reason,
    cost: floor < 0 ? -n * FLOOR_COST : n * FLOOR_COST,
    n,
    kind: floor < 0 ? 'Verkauf' : 'Bau',
    label: floor < 0 ? `${n}× Boden entfernt` : `${n}× Boden`,
    cells,
    apply: () => {
      for (const k of todo) {
        if (floor < 0) w.floors.delete(k);
        else w.floors.set(k, floor);
      }
    },
    emit: () => ctx.g.bus.emit('build', { hh: ctx.hh!, kind: floor < 0 ? 'delete' : 'floor', n }),
  };
}

/** Wandseiten streichen: side 0 = Seite A (Norden/Westen), 1 = Seite B */
export function planPaint(ctx: Ctx, l: number, edges: { x: number; z: number; dir: 0 | 1 }[], side: 0 | 1, paint: number): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const w = ctx.g.world,
    lot = ctx.lot!;
  const out: PEdge[] = [];
  let reason: string | undefined;
  for (const e of edges) {
    const wall = w.walls.get(edgeKey(l, e.x, e.z, e.dir));
    if (!wall) continue;
    const ok = edgeOnLot(lot, e.x, e.z, e.dir);
    if (!ok) reason ??= 'Außerhalb des Grundstücks';
    if ((side ? wall.b : wall.a) === paint) continue;
    out.push({ ...e, ok });
  }
  if (!out.length) return fail(edges.length ? 'Nichts zu streichen – tippe neben eine Wand' : 'Tippe neben eine Wand');
  const n = out.length;
  return {
    ok: !reason,
    reason,
    cost: n * PAINT_COST,
    n,
    kind: 'Bau',
    label: `${n}× Wand gestrichen`,
    edges: out,
    apply: () => {
      for (const e of out) {
        const k = edgeKey(l, e.x, e.z, e.dir);
        const wall = w.walls.get(k)!;
        w.walls.set(k, side ? { ...wall, b: paint } : { ...wall, a: paint });
      }
    },
    emit: () => ctx.g.bus.emit('build', { hh: ctx.hh!, kind: 'paint', n }),
  };
}

/** Rückkaufwert eines Objekts (inkl. Dingen auf seiner Fläche) */
export function resale(g: Game, o: ObjInst): number {
  let v = Math.round(getDef(o.def).price * RESALE);
  const def = getDef(o.def);
  if (def.mount !== 'surface' && def.mount !== 'wall' && def.mount !== 'opening')
    for (const [x, z] of g.world.cellsOf(o)) {
      const s = g.world.surf.get(cellKey(o.l, x, z));
      const so = s ? g.world.objs.get(s) : undefined;
      if (so && so.id !== o.id) v += Math.round(getDef(so.def).price * RESALE);
    }
  return v;
}

export function planDeleteWalls(ctx: Ctx, l: number, edges: { x: number; z: number; dir: 0 | 1 }[]): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const w = ctx.g.world,
    lot = ctx.lot!;
  const out: PEdge[] = [];
  let reason: string | undefined;
  let refund = 0;
  const attached = new Set<string>();
  for (const e of edges) {
    const k = edgeKey(l, e.x, e.z, e.dir);
    const wall = w.walls.get(k);
    if (!wall) continue;
    const ok = edgeOnLot(lot, e.x, e.z, e.dir);
    if (!ok) reason ??= 'Außerhalb des Grundstücks';
    out.push({ ...e, ok });
    refund += WALL_COST[wall.k];
    for (const id of [w.openings.get(k), w.wallObj.get(k * 2), w.wallObj.get(k * 2 + 1)]) if (id) attached.add(id);
  }
  for (const id of attached) {
    const o = w.objs.get(id);
    if (o) refund += Math.round(getDef(o.def).price * RESALE);
  }
  if (!out.length) return fail('Hier ist keine Wand');
  const n = out.length;
  return {
    ok: !reason,
    reason,
    cost: -refund,
    n,
    kind: 'Verkauf',
    label: `${n}× Wand abgerissen`,
    edges: out,
    apply: () => {
      for (const e of out) w.removeWall(l, e.x, e.z, e.dir);
    },
    emit: () => ctx.g.bus.emit('build', { hh: ctx.hh!, kind: 'delete', n }),
  };
}

function simOn(g: Game, l: number, cells: [number, number][]): boolean {
  const hit = (s: { x: number; z: number; l: number }): boolean => s.l === l && cells.some(([x, z]) => Math.floor(s.x) === x && Math.floor(s.z) === z);
  for (const s of g.sims.values()) if (!s.away && hit(s)) return true;
  for (const p of g.pets.values()) if (hit(p)) return true;
  return false;
}

/** Bodenobjekt, Wandobjekt, Flächenobjekt oder Treppe kaufen und aufstellen */
export function planPlace(ctx: Ctx, defId: string, x: number, z: number, l: number, r: Rot, ca = 0, cb = 0): Plan {
  const def = getDef(defId);
  const b = base(ctx);
  if (b) return fail(b, def.name);
  if (def.mount === 'opening') return fail('Türen und Fenster an eine Wand setzen', def.name);
  if (l >= LEVELS) return fail('Höher geht es nicht', def.name);
  const g = ctx.g,
    lot = ctx.lot!;
  const c = g.world.canPlace(defId, x, z, l, r, lot);
  let reason = c.ok ? undefined : c.reason;
  if (!reason && def.mount !== 'wall' && def.mount !== 'surface' && def.h > 0.05 && simOn(g, l, g.world.cellsOf({ def: defId, x, z, r }))) reason = 'Dort steht gerade jemand';
  const stairs = !!def.func?.includes('stairs');
  return {
    ok: !reason,
    reason,
    cost: def.price,
    n: 1,
    kind: 'Kauf',
    label: def.name,
    apply: () => {
      g.world.addObj({ id: g.world.newId(), def: defId, x, z, l, r, ca: ca || undefined, cb: cb || undefined, lot: lot.id, st: {} });
    },
    emit: () => {
      g.bus.emit('buy', { hh: ctx.hh!, def: defId, cat: def.cat, price: effCost(g, def.price) });
      if (stairs) g.bus.emit('build', { hh: ctx.hh!, kind: 'stairs', n: 1 });
    },
  };
}

/** Tür/Fenster in eine Wandkante setzen (x/z = erste Kante, dir = Kantenrichtung, r 0/2 = Vorderseite) */
export function planOpening(ctx: Ctx, defId: string, x: number, z: number, l: number, dir: 0 | 1, r: Rot, ca = 0, cb = 0): Plan {
  const def = getDef(defId);
  const b = base(ctx);
  if (b) return fail(b, def.name);
  if (def.mount !== 'opening') return fail('Kein Tür- oder Fensterelement', def.name);
  const g = ctx.g,
    lot = ctx.lot!;
  let reason: string | undefined;
  for (let i = 0; i < def.w; i++) if (!edgeOnLot(lot, dir === 0 ? x + i : x, dir === 0 ? z : z + i, dir)) reason ??= 'Außerhalb des Grundstücks';
  if (!reason) {
    const c = g.world.canOpening(defId, x, z, l, dir);
    if (!c.ok) reason = c.reason;
  }
  const door = !!def.func?.includes('door');
  return {
    ok: !reason,
    reason,
    cost: def.price,
    n: 1,
    kind: 'Kauf',
    label: def.name,
    apply: () => {
      g.world.addObj({ id: g.world.newId(), def: defId, x, z, l, r: (r >= 2 ? 2 : 0) as Rot, dir, ca: ca || undefined, cb: cb || undefined, lot: lot.id, st: {} });
    },
    emit: () => {
      g.bus.emit('buy', { hh: ctx.hh!, def: defId, cat: def.cat, price: effCost(g, def.price) });
      g.bus.emit('build', { hh: ctx.hh!, kind: door ? 'door' : 'window', n: 1 });
    },
  };
}

function ownCheck(ctx: Ctx, id: string): { o: ObjInst } | { reason: string } {
  const o = ctx.g.world.objs.get(id);
  if (!o) return { reason: 'Objekt nicht gefunden' };
  if (o.lot !== ctx.lot!.id) return { reason: 'Gehört nicht zu deinem Grundstück' };
  return { o };
}

/** vorhandenes Objekt versetzen/drehen (kostenlos) */
export function planMove(ctx: Ctx, id: string, x: number, z: number, l: number, r: Rot, dir?: 0 | 1): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const oc = ownCheck(ctx, id);
  if ('reason' in oc) return fail(oc.reason);
  const o = oc.o;
  const g = ctx.g,
    lot = ctx.lot!,
    w = g.world;
  const def = getDef(o.def);
  let reason: string | undefined;
  if (def.mount === 'opening') {
    const d = dir ?? o.dir ?? 0;
    for (let i = 0; i < def.w; i++) if (!edgeOnLot(lot, d === 0 ? x + i : x, d === 0 ? z : z + i, d)) reason ??= 'Außerhalb des Grundstücks';
    if (!reason) {
      const c = w.canOpening(o.def, x, z, l, d, id);
      if (!c.ok) reason = c.reason;
    }
  } else {
    if (def.mount !== 'surface' && def.mount !== 'wall')
      for (const [cx, cz] of w.cellsOf(o)) {
        const s = w.surf.get(cellKey(o.l, cx, cz));
        if (s && s !== id) reason ??= 'Erst die Dinge darauf wegräumen';
      }
    if (!reason) {
      const c = w.canPlace(o.def, x, z, l, r, lot, id);
      if (!c.ok) reason = c.reason;
    }
    if (!reason && def.mount !== 'wall' && def.mount !== 'surface' && def.h > 0.05 && (o.x !== x || o.z !== z || o.r !== r || o.l !== l)) {
      const own = new Set(w.cellsOf(o).map(([a, c]) => cellKey(o.l, a, c)));
      const nc = w.cellsOf({ def: o.def, x, z, r }).filter(([a, c]) => !own.has(cellKey(l, a, c)));
      if (nc.length && simOn(g, l, nc)) reason = 'Dort steht gerade jemand';
    }
  }
  if (!reason && o.x === x && o.z === z && o.l === l && o.r === r && (def.mount !== 'opening' || (dir ?? o.dir) === o.dir)) reason = 'Unverändert';
  return {
    ok: !reason,
    reason,
    cost: 0,
    n: 1,
    kind: 'Bau',
    label: `${def.name} versetzt`,
    apply: () => {
      w.removeObj(id);
      w.addObj({ ...o, x, z, l, r: def.mount === 'opening' ? ((r >= 2 ? 2 : 0) as Rot) : r, dir: def.mount === 'opening' ? (dir ?? o.dir) : o.dir });
    },
  };
}

/** Objekt verkaufen (85 % Rückkauf, Dinge auf der Fläche mit) */
export function planSell(ctx: Ctx, id: string): Plan {
  const b = base(ctx);
  if (b) return fail(b);
  const oc = ownCheck(ctx, id);
  if ('reason' in oc) return fail(oc.reason);
  const o = oc.o;
  const def = getDef(o.def);
  if (def.func?.includes('mailbox') && ctx.g.objsWith(o.lot, 'mailbox').length <= 1) return fail('Der Briefkasten muss bleiben', def.name);
  const v = resale(ctx.g, o);
  return {
    ok: true,
    cost: -v,
    n: 1,
    kind: 'Verkauf',
    label: def.name,
    apply: () => ctx.g.removeObject(id),
  };
}

// ---------- Fertighäuser ----------
const valueCache = new Map<string, number>();
/** Gebäudewert (ohne Land) einer Vorlage auf diesem Grundstück – in einer Schattenwelt berechnet */
export function templateValue(lotId: string, templateId: string): number {
  const key = `${lotId}|${templateId}`;
  const hit = valueCache.get(key);
  if (hit !== undefined) return hit;
  const L = lotById(lotId);
  if (!L) return 0;
  const w = new World();
  buildTerrain(w);
  applyTemplate(w, lotId, templateId);
  const v = w.lotValue(lotId) - L.land;
  valueCache.set(key, v);
  return v;
}
/** Kosten eines Fertighauses: Neuwert minus 85 % Rückkauf der jetzigen Bebauung */
export function templateCost(g: Game, lot: LotDef, templateId: string): number {
  const cur = g.world.lotValue(lot.id) - lot.land;
  return templateValue(lot.id, templateId) - Math.round(cur * RESALE);
}

export function planTemplate(ctx: Ctx, templateId: string, name: string): Plan {
  const b = base(ctx);
  if (b) return fail(b, name);
  const lot = ctx.lot!;
  if (!templateFits(templateId, lot.id)) return fail('Passt nicht auf dieses Grundstück', name);
  const g = ctx.g;
  return {
    ok: true,
    cost: templateCost(g, lot, templateId),
    n: 1,
    kind: 'Bau',
    label: `Fertighaus ${name}`,
    apply: () => {
      applyTemplate(g.world, lot.id, templateId);
    },
  };
}

// ---------- Hilfen für die Eingabe ----------
/** nächstgelegene Kante einer Zelle zum Punkt (px, pz) */
export function nearestEdge(px: number, pz: number): { x: number; z: number; dir: 0 | 1; dist: number } {
  const cx = Math.floor(px),
    cz = Math.floor(pz);
  const fx = px - cx,
    fz = pz - cz;
  let best = { x: cx, z: cz, dir: 0 as 0 | 1, dist: fz };
  if (1 - fz < best.dist) best = { x: cx, z: cz + 1, dir: 0, dist: 1 - fz };
  if (fx < best.dist) best = { x: cx, z: cz, dir: 1, dist: fx };
  if (1 - fx < best.dist) best = { x: cx + 1, z: cz, dir: 1, dist: 1 - fx };
  return best;
}
/** nächste vorhandene Wandkante (bis maxDist), mit Seite, auf der der Punkt liegt */
export function nearestWall(w: World, l: number, px: number, pz: number, maxDist = 0.75): { x: number; z: number; dir: 0 | 1; side: 0 | 1 } | null {
  let best: { x: number; z: number; dir: 0 | 1; side: 0 | 1 } | null = null;
  let bd = maxDist;
  const cx = Math.floor(px),
    cz = Math.floor(pz);
  for (let dz = -1; dz <= 2; dz++)
    for (let dx = -1; dx <= 2; dx++) {
      const x = cx + dx,
        z = cz + dz;
      // waagerechte Kante (x..x+1, z)
      if (w.walls.has(edgeKey(l, x, z, 0))) {
        const d = Math.hypot(Math.max(x - px, 0, px - x - 1), pz - z);
        if (d < bd) {
          bd = d;
          best = { x, z, dir: 0, side: pz < z ? 0 : 1 };
        }
      }
      if (w.walls.has(edgeKey(l, x, z, 1))) {
        const d = Math.hypot(px - x, Math.max(z - pz, 0, pz - z - 1));
        if (d < bd) {
          bd = d;
          best = { x, z, dir: 1, side: px < x ? 0 : 1 };
        }
      }
    }
  return best;
}
/** Wandobjekt automatisch zur nächsten Wand drehen */
export function wallFacing(w: World, l: number, px: number, pz: number): Rot | null {
  const cx = Math.floor(px),
    cz = Math.floor(pz);
  const fx = px - cx,
    fz = pz - cz;
  const opts: [number, Rot, boolean][] = [
    [fz, 0, w.walls.get(edgeKey(l, cx, cz, 0))?.k === 0],
    [fx, 1, w.walls.get(edgeKey(l, cx, cz, 1))?.k === 0],
    [1 - fz, 2, w.walls.get(edgeKey(l, cx, cz + 1, 0))?.k === 0],
    [1 - fx, 3, w.walls.get(edgeKey(l, cx + 1, cz, 1))?.k === 0],
  ];
  let best: Rot | null = null,
    bd = 9;
  for (const [d, r, has] of opts)
    if (has && d < bd) {
      bd = d;
      best = r;
    }
  return best;
}
/** linke obere Zelle eines Objekts, dessen Mitte unter dem Punkt liegen soll */
export function cellFor(defId: string, r: Rot, px: number, pz: number): [number, number] {
  const [w, d] = dimsOf(getDef(defId), r);
  return [Math.round(px - w / 2), Math.round(pz - d / 2)];
}

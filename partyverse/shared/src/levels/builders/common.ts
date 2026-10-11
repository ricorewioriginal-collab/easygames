import type { Rng } from '../../rng';
import type { EdgeStyle, LayoutIsland } from '../types';

export type V3 = [number, number, number];

/** Welche Kantenstile ein Layout für welche Rolle benutzt */
export interface Styles {
  /** normale Laufwege */
  main: EdgeStyle;
  /** Brücken / Verbindungen zwischen Bereichen */
  link: EdgeStyle;
  /** Auf- und Abstiege */
  climb: EdgeStyle;
  /** Abkürzungen (und Standardstil für faltbare Wege) */
  short: EdgeStyle;
}

export interface BuildCtx {
  rng: Rng;
  st: Styles;
}

export interface DNode {
  pos: V3;
  island?: number;
}

export interface DEdge {
  from: number;
  to: number;
  style: EdgeStyle;
  arc?: number;
  folds?: number[];
}

/** Standard-Feldabstand */
export const STEP = 3.4;

/** Radius eines Rings, auf dem n Felder mit Abstand `step` liegen */
export const ringRadius = (n: number, step = STEP): number => (n * step) / (2 * Math.PI);

export const polar = (cx: number, cz: number, r: number, a: number, y = 0): V3 => [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export const dist3 = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const dist2 = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[2] - b[2]);

/** Veränderbarer Entwurf eines Bretts: Felder (nur Position), Kanten und Inseln. */
export class Draft {
  nodes: DNode[] = [];
  edges: DEdge[] = [];
  islands: LayoutIsland[] = [];
  start = 0;
  private keys = new Set<string>();

  add(pos: V3, island?: number): number {
    this.nodes.push(island === undefined ? { pos } : { pos, island });
    return this.nodes.length - 1;
  }

  has(a: number, b: number): boolean {
    return this.keys.has(`${a}>${b}`);
  }

  link(a: number, b: number, style: EdgeStyle, arc?: number, folds?: number[]): boolean {
    if (a === b || this.has(a, b)) return false;
    this.keys.add(`${a}>${b}`);
    const e: DEdge = { from: a, to: b, style };
    if (arc !== undefined) e.arc = arc;
    if (folds) e.folds = folds;
    this.edges.push(e);
    return true;
  }

  chain(ids: number[], style: EdgeStyle, arc?: number): void {
    for (let i = 0; i + 1 < ids.length; i++) this.link(ids[i] as number, ids[i + 1] as number, style, arc);
  }

  loop(ids: number[], style: EdgeStyle, arc?: number): void {
    this.chain(ids, style, arc);
    if (ids.length > 2) this.link(ids[ids.length - 1] as number, ids[0] as number, style, arc);
  }

  both(a: number, b: number, style: EdgeStyle, arc?: number): void {
    this.link(a, b, style, arc);
    this.link(b, a, style, arc);
  }

  addIsland(center: V3, radius: number, spin?: number): number {
    const isl: LayoutIsland = { center, radius };
    if (spin !== undefined) isl.spin = spin;
    this.islands.push(isl);
    return this.islands.length - 1;
  }

  /** Legt eine Insel um eine Gruppe von Feldern und ordnet die Felder ihr zu */
  groupIsland(ids: number[], margin = 2.2, spin?: number): number {
    const ps = ids.map((i) => (this.nodes[i] as DNode).pos);
    const cx = ps.reduce((s, p) => s + p[0], 0) / ps.length;
    const cy = ps.reduce((s, p) => s + p[1], 0) / ps.length;
    const cz = ps.reduce((s, p) => s + p[2], 0) / ps.length;
    const r = Math.max(...ps.map((p) => Math.hypot(p[0] - cx, p[2] - cz))) + margin;
    const idx = this.addIsland([round1(cx), round1(cy), round1(cz)], round1(r), spin);
    for (const i of ids) (this.nodes[i] as DNode).island = idx;
    return idx;
  }

  /** Teilt die Feldfolge in Stücke und macht aus jedem eine Insel */
  chunkIslands(ids: number[], size: number, margin = 2.2): void {
    for (let i = 0; i < ids.length; i += size) {
      let part = ids.slice(i, i + size);
      if (ids.length - (i + size) > 0 && ids.length - (i + size) < Math.ceil(size / 2)) part = ids.slice(i);
      this.groupIsland(part, margin);
      if (part.length > size) break;
    }
  }
}

export const round1 = (v: number): number => Math.round(v * 10) / 10;

/** Wie viele Felder haben Grad-1-Ausgang usw. – Hilfen für die Kantenprüfung in der Draufsicht */
interface HasPos {
  pos: V3;
}
interface HasEnds {
  from: number;
  to: number;
}

function segCross(a: V3, b: V3, c: V3, d: V3): { t: number; u: number } | null {
  const rx = b[0] - a[0],
    rz = b[2] - a[2],
    sx = d[0] - c[0],
    sz = d[2] - c[2];
  const den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-9) return null;
  const qx = c[0] - a[0],
    qz = c[2] - a[2];
  const t = (qx * sz - qz * sx) / den;
  const u = (qx * rz - qz * rx) / den;
  if (t <= 0.02 || t >= 0.98 || u <= 0.02 || u >= 0.98) return null;
  return { t, u };
}

/** Kreuzen sich zwei Kanten in der Draufsicht (und liegen auf gleicher Höhe)? */
export function edgesClash(nodes: HasPos[], a: number, b: number, c: number, d: number): boolean {
  if (a === c || a === d || b === c || b === d) return false;
  const pa = (nodes[a] as HasPos).pos,
    pb = (nodes[b] as HasPos).pos,
    pc = (nodes[c] as HasPos).pos,
    pd = (nodes[d] as HasPos).pos;
  const x = segCross(pa, pb, pc, pd);
  if (!x) return false;
  return Math.abs(lerp(pa[1], pb[1], x.t) - lerp(pc[1], pd[1], x.u)) < 2.6;
}

function pointSegDist(p: V3, a: V3, b: V3): number {
  const vx = b[0] - a[0],
    vy = b[1] - a[1],
    vz = b[2] - a[2];
  const l2 = vx * vx + vy * vy + vz * vz;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy + (p[2] - a[2]) * vz) / l2));
  return Math.hypot(p[0] - (a[0] + vx * t), p[1] - (a[1] + vy * t), p[2] - (a[2] + vz * t));
}

/** Läuft die Kante a→b dicht an einem fremden Feld vorbei? */
export function nodeNearEdge(nodes: HasPos[], a: number, b: number, minDist = 1.8): boolean {
  const pa = (nodes[a] as HasPos).pos,
    pb = (nodes[b] as HasPos).pos;
  for (let k = 0; k < nodes.length; k++) {
    if (k === a || k === b) continue;
    if (pointSegDist((nodes[k] as HasPos).pos, pa, pb) < minDist) return true;
  }
  return false;
}

/** Paare sich kreuzender Kanten (Indizes in `edges`) in der Draufsicht bei gleicher Höhe */
export function topViewCrossings(nodes: HasPos[], edges: HasEnds[]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const e = edges[i] as HasEnds,
        f = edges[j] as HasEnds;
      if (edgesClash(nodes, e.from, e.to, f.from, f.to)) out.push([i, j]);
    }
  return out;
}

/** Gleichmäßig nach Bogenlänge verteilte Punkte auf einem Linienzug */
export function resample(pts: V3[], count: number, closed: boolean): V3[] {
  const P: V3[] = closed ? [...pts, pts[0] as V3] : pts;
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push((cum[i - 1] as number) + dist3(P[i - 1] as V3, P[i] as V3));
  const total = cum[cum.length - 1] as number;
  const m = closed ? count : count - 1;
  const out: V3[] = [];
  let seg = 1;
  for (let k = 0; k < count; k++) {
    const target = (total * k) / m;
    while (seg < P.length - 1 && (cum[seg] as number) < target) seg++;
    const c0 = cum[seg - 1] as number,
      c1 = cum[seg] as number;
    const t = c1 === c0 ? 0 : (target - c0) / (c1 - c0);
    out.push(lerp3(P[seg - 1] as V3, P[seg] as V3, Math.max(0, Math.min(1, t))));
  }
  return out;
}

/** Länge eines Linienzugs */
export function polyLength(pts: V3[], closed: boolean): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist3(pts[i - 1] as V3, pts[i] as V3);
  if (closed && pts.length > 1) s += dist3(pts[pts.length - 1] as V3, pts[0] as V3);
  return s;
}

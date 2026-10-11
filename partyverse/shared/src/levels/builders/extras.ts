import type { Rng } from '../../rng';
import type { EdgeStyle } from '../types';
import { Draft, dist3, edgesClash, nodeNearEdge } from './common';

export interface ExtraOpts {
  count: number;
  style: EdgeStyle;
  /** Wenn gesetzt: Kanten werden faltbar (Faltungsphasen insgesamt) */
  phases?: number;
  /** Faltbare Brücken verschieben sich: Partner-Kante vom gleichen Startfeld in der nächsten Phase */
  shift?: boolean;
  minHop?: number;
  minLen?: number;
  maxLen?: number;
}

/** Kürzeste Schrittzahl über dauerhafte Kanten (ohne Faltung) */
function coreHops(d: Draft, from: number): number[] {
  const adj: number[][] = d.nodes.map(() => []);
  for (const e of d.edges) if (!e.folds) (adj[e.from] as number[]).push(e.to);
  const dist = d.nodes.map(() => Infinity);
  dist[from] = 0;
  const q = [from];
  for (let i = 0; i < q.length; i++) {
    const n = q[i] as number;
    for (const m of adj[n] as number[])
      if (dist[m] === Infinity) {
        dist[m] = (dist[n] as number) + 1;
        q.push(m);
      }
  }
  return dist;
}

function clashes(d: Draft, a: number, b: number): boolean {
  if (nodeNearEdge(d.nodes, a, b)) return true;
  for (const e of d.edges) if (edgesClash(d.nodes, a, b, e.from, e.to, 3.6)) return true;
  return false;
}

function foldSet(phases: number, k: number): number[] {
  if (phases <= 2) return [k % phases];
  if (k % 4 === 3) return [k % 3, (k + 1) % 3].sort((x, y) => x - y);
  return [k % 3];
}

/**
 * Fügt Abkürzungen (oder faltbare Wege) hinzu. Kanten werden zufällig, aber deterministisch gewählt:
 * gerichtet nach vorn (Abkürzung über mind. `minHop` Schritte), ohne Kreuzung in der Draufsicht.
 */
export function addExtraEdges(d: Draft, rng: Rng, o: ExtraOpts): number {
  const n = d.nodes.length;
  const outD = new Array<number>(n).fill(0);
  const inD = new Array<number>(n).fill(0);
  for (const e of d.edges) {
    outD[e.from]++;
    inD[e.to]++;
  }
  const hopCache = new Map<number, number[]>();
  const hopsFrom = (a: number): number[] => {
    let h = hopCache.get(a);
    if (!h) {
      h = coreHops(d, a);
      hopCache.set(a, h);
    }
    return h;
  };
  const add = (a: number, b: number, folds?: number[]): void => {
    d.link(a, b, o.style, undefined, folds);
    outD[a]++;
    inD[b]++;
    if (!folds) hopCache.clear();
  };
  const stages = [
    { hop: o.minHop ?? 5, min: o.minLen ?? 4.2, max: o.maxLen ?? 12.5 },
    { hop: Math.max(3, (o.minHop ?? 5) - 2), min: 3.6, max: 14 },
    { hop: 3, min: 3.2, max: 15.5 },
  ];
  let added = 0;
  const maxHop = Math.floor(n * 0.55);
  for (let attempts = 0; added < o.count && attempts < 4500; attempts++) {
    const st = stages[Math.min(2, Math.floor(attempts / 1500))] as (typeof stages)[number];
    const a = rng.int(n),
      b = rng.int(n);
    if (a === b || d.has(a, b) || d.has(b, a)) continue;
    const len = dist3(
      (d.nodes[a] as (typeof d.nodes)[number]).pos,
      (d.nodes[b] as (typeof d.nodes)[number]).pos,
    );
    if (len < st.min || len > st.max) continue;
    if ((outD[a] as number) >= (o.phases ? 3 : 2) || (inD[b] as number) >= (o.phases ? 3 : 2)) continue;
    const hop = hopsFrom(a)[b] as number;
    if (hop < st.hop || hop > maxHop) continue;
    if (clashes(d, a, b)) continue;
    const folds = o.phases ? foldSet(o.phases, added) : undefined;
    add(a, b, folds);
    added++;
    if (o.shift && o.phases && added < o.count) {
      // verschobene Brücke: gleiches Startfeld, Nachbar des Ziels, nächste Phase
      const phase = (folds as number[])[0] as number;
      const nbs = d.edges.filter((e) => e.from === b && !e.folds).map((e) => e.to);
      for (const b2 of nbs) {
        if (b2 === a || d.has(a, b2) || clashes(d, a, b2)) continue;
        const l2 = dist3(
          (d.nodes[a] as (typeof d.nodes)[number]).pos,
          (d.nodes[b2] as (typeof d.nodes)[number]).pos,
        );
        if (l2 > 15.5) continue;
        add(a, b2, [(phase + 1) % o.phases]);
        added++;
        break;
      }
    }
  }
  return added;
}

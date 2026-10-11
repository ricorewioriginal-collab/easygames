import type { Layout, LayoutEdge } from './types';

export const foldPhaseOfRound = (layout: Layout, round: number): number =>
  layout.foldPhases <= 1 ? 0 : (((round - 1) % layout.foldPhases) + layout.foldPhases) % layout.foldPhases;

export const edgeActive = (e: LayoutEdge, phase: number): boolean => !e.folds || e.folds.includes(phase);

/** Ausgehende Kanten eines Feldes, die in der Faltungsphase begehbar sind */
export function outgoing(layout: Layout, node: number, phase: number): LayoutEdge[] {
  return layout.edges.filter((e) => e.from === node && edgeActive(e, phase));
}

/** Index: Für jedes Feld alle ausgehenden Kanten (unabhängig von der Phase) */
export function adjacency(layout: Layout): LayoutEdge[][] {
  const adj: LayoutEdge[][] = layout.nodes.map(() => []);
  for (const e of layout.edges) adj[e.from]?.push(e);
  return adj;
}

/** Alle ab `from` erreichbaren Felder (nur Kanten, die `pred` erlaubt) */
export function reachable(layout: Layout, from: number, pred: (e: LayoutEdge) => boolean): Set<number> {
  const adj = adjacency(layout);
  const seen = new Set<number>([from]);
  const stack = [from];
  while (stack.length) {
    const n = stack.pop() as number;
    for (const e of adj[n] ?? []) if (pred(e) && !seen.has(e.to)) {
        seen.add(e.to);
        stack.push(e.to);
      }
  }
  return seen;
}

/** Felder, von denen aus `target` erreichbar ist (umgekehrte Suche) */
export function canReach(layout: Layout, target: number, pred: (e: LayoutEdge) => boolean): Set<number> {
  const rev: LayoutEdge[][] = layout.nodes.map(() => []);
  for (const e of layout.edges) if (pred(e)) rev[e.to]?.push(e);
  const seen = new Set<number>([target]);
  const stack = [target];
  while (stack.length) {
    const n = stack.pop() as number;
    for (const e of rev[n] ?? []) if (!seen.has(e.from)) {
        seen.add(e.from);
        stack.push(e.from);
      }
  }
  return seen;
}

/** Kürzeste Schrittzahl (Kanten) von `from` zu allen Feldern in einer Faltungsphase */
export function distancesFrom(layout: Layout, from: number, phase: number): number[] {
  const adj = adjacency(layout);
  const d = layout.nodes.map(() => Infinity);
  d[from] = 0;
  const q = [from];
  for (let i = 0; i < q.length; i++) {
    const n = q[i] as number;
    for (const e of adj[n] ?? []) if (edgeActive(e, phase) && d[e.to] === Infinity) {
        d[e.to] = (d[n] as number) + 1;
        q.push(e.to);
      }
  }
  return d;
}

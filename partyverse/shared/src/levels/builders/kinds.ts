import type { Rng } from '../../rng';
import type { NodeKind } from '../types';
import { Draft, dist3 } from './common';

export interface Mix {
  /** Anzahl Portal-PAARE */
  portals: number;
  gates: number;
  shops: number;
  chaos: number;
  items: number;
  events: number;
  /** Anteil Dornenfelder (0 … 0.3) */
  thorn: number;
}

export interface KindResult {
  kinds: NodeKind[];
  portal: (number | undefined)[];
  altar: number[];
}

/** Ungerichtete Abstände zwischen allen Feldern (alle Kanten, auch faltbare) */
function allDistances(d: Draft): number[][] {
  const n = d.nodes.length;
  const adj: number[][] = d.nodes.map(() => []);
  for (const e of d.edges) {
    (adj[e.from] as number[]).push(e.to);
    (adj[e.to] as number[]).push(e.from);
  }
  return d.nodes.map((_, s) => {
    const dist = new Array<number>(n).fill(Infinity);
    dist[s] = 0;
    const q = [s];
    for (let i = 0; i < q.length; i++) {
      const x = q[i] as number;
      for (const m of adj[x] as number[])
        if (dist[m] === Infinity) {
          dist[m] = (dist[x] as number) + 1;
          q.push(m);
        }
    }
    return dist;
  });
}

/** Verteilt Feldarten, Portal-Paare und Altar-Orte nach Regeln (Läden gestreut, nicht am Start usw.) */
export function assignKinds(d: Draft, rng: Rng, mix: Mix): KindResult {
  const n = d.nodes.length;
  const D = allDistances(d);
  const row = (i: number) => D[i] as number[];
  const kinds: (NodeKind | null)[] = new Array<NodeKind | null>(n).fill(null);
  const portal: (number | undefined)[] = new Array<number | undefined>(n).fill(undefined);
  kinds[d.start] = 'start';
  const special: number[] = [d.start];
  const minTo = (i: number, list: number[]) =>
    list.length ? Math.min(...list.map((j) => row(i)[j] as number)) : 99;
  const freeNodes = () => kinds.map((k, i) => (k === null ? i : -1)).filter((i) => i >= 0);

  const outCore = (i: number) => d.edges.filter((e) => e.from === i && !e.folds).length;
  const inCore = (i: number) => d.edges.filter((e) => e.to === i && !e.folds).length;
  const styleCount = new Map<string, number>();
  for (const e of d.edges) styleCount.set(e.style, (styleCount.get(e.style) ?? 0) + 1);
  const common = [...styleCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const gateScore = (i: number) => {
    let s = 0;
    if (outCore(i) === 1 && inCore(i) === 1) s += 3;
    if (d.edges.some((e) => (e.from === i || e.to === i) && e.style !== common)) s += 2;
    return s;
  };

  function place(
    kind: NodeKind,
    count: number,
    minStart: number,
    sameGap: number,
    otherGap: number,
    score?: (i: number) => number,
  ): number[] {
    const same: number[] = [];
    for (let c = 0; c < count; c++) {
      let ms = minStart,
        sg = sameGap,
        og = otherGap;
      let cand: number[] = [];
      for (let relax = 0; relax < 6 && cand.length === 0; relax++) {
        cand = freeNodes().filter(
          (i) => row(d.start)[i]! >= ms && minTo(i, same) >= sg && minTo(i, special) >= og,
        );
        if (cand.length === 0) {
          if (relax % 2 === 0) sg = Math.max(1, sg - 1);
          else {
            og = Math.max(1, og - 1);
            ms = Math.max(1, ms - 1);
          }
        }
      }
      if (cand.length === 0) break;
      let best = cand[0] as number,
        bestScore = -Infinity;
      for (const i of cand) {
        const s = Math.min(minTo(i, same), 8) + (score ? score(i) : 0) + rng.next() * 2;
        if (s > bestScore) {
          bestScore = s;
          best = i;
        }
      }
      kinds[best] = kind;
      special.push(best);
      same.push(best);
    }
    return same;
  }

  place('shop', mix.shops, 3, 4, 2);
  place('gate', mix.gates, 3, 4, 2, gateScore);

  // Portal-Paare: weit voneinander entfernt (Weg und Luftlinie)
  const portals: number[] = [];
  for (let p = 0; p < mix.portals; p++) {
    const [a] = place('portal', 1, 2, 3, 2).slice(0);
    if (a === undefined) break;
    portals.push(a);
    const minPair = Math.max(4, Math.floor(n / 5));
    let cand: number[] = [];
    for (let relax = 0; relax < 4 && cand.length === 0; relax++) {
      cand = freeNodes().filter(
        (i) =>
          row(a)[i]! >= minPair - relax &&
          dist3((d.nodes[a] as (typeof d.nodes)[number]).pos, (d.nodes[i] as (typeof d.nodes)[number]).pos) >=
            9 - relax * 2 &&
          row(d.start)[i]! >= 2 &&
          minTo(i, special) >= (relax < 3 ? 2 : 1) &&
          minTo(i, portals) >= 3,
      );
    }
    if (cand.length === 0) {
      kinds[a] = null;
      special.pop();
      portals.pop();
      break;
    }
    let best = cand[0] as number,
      bestScore = -Infinity;
    for (const i of cand) {
      const s =
        dist3((d.nodes[a] as (typeof d.nodes)[number]).pos, (d.nodes[i] as (typeof d.nodes)[number]).pos) *
          0.3 +
        minTo(i, portals) +
        rng.next() * 3;
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    }
    kinds[best] = 'portal';
    special.push(best);
    portals.push(best);
    portal[a] = best;
    portal[best] = a;
  }

  place('chaos', mix.chaos, 2, 3, 1);

  // Rest: Items, Ereignisse, Dornen, Glimmer
  const free = rng.shuffle(freeNodes());
  const thorns = Math.min(Math.round(mix.thorn * n), Math.floor(n * 0.28));
  // Glimmer sollen mindestens ~36 % aller Felder stellen: bei Platzmangel zuerst Dornen, dann Items/Ereignisse kürzen
  const room = Math.max(2, free.length - Math.ceil(n * 0.36) + kinds.filter((k) => k === 'glimmer').length);
  let nItem = Math.max(1, mix.items),
    nEvent = Math.max(1, mix.events),
    nThorn = thorns;
  while (nItem + nEvent + nThorn > room && (nThorn > 0 || nItem > 1 || nEvent > 1)) {
    if (nThorn > 0) nThorn--;
    else if (nItem >= nEvent && nItem > 1) nItem--;
    else if (nEvent > 1) nEvent--;
    else break;
  }
  const pool: NodeKind[] = [];
  for (let i = 0; i < nItem; i++) pool.push('item');
  for (let i = 0; i < nEvent; i++) pool.push('event');
  for (let i = 0; i < nThorn; i++) pool.push('thorn');
  while (pool.length < free.length) pool.push('glimmer');
  const assigned = pool.slice(0, free.length);
  free.forEach((i, k) => (kinds[i] = assigned[k] as NodeKind));
  // Nachbarn mit gleicher Art entzerren
  const nbrs: number[][] = d.nodes.map(() => []);
  for (const e of d.edges) {
    (nbrs[e.from] as number[]).push(e.to);
    (nbrs[e.to] as number[]).push(e.from);
  }
  const same = (i: number, k: NodeKind) => (nbrs[i] as number[]).some((j) => kinds[j] === k);
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const i of free) {
      const k = kinds[i] as NodeKind;
      if (k === 'glimmer' || !same(i, k)) continue;
      const target = free.find(
        (j) => kinds[j] === 'glimmer' && !same(j, k) && !(nbrs[j] as number[]).includes(i),
      );
      if (target !== undefined) {
        kinds[target] = k;
        kinds[i] = 'glimmer';
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Altar-Orte: gestreut, nicht am Start
  const want = Math.max(5, Math.min(8, Math.round(n / 9)));
  const okKinds = new Set<NodeKind>(['glimmer', 'event', 'item', 'chaos']);
  const allIdx = kinds.map((_, i) => i);
  let pool2 = allIdx.filter((i) => okKinds.has(kinds[i] as NodeKind) && row(d.start)[i]! >= 3);
  if (pool2.length < want)
    pool2 = allIdx.filter(
      (i) => kinds[i] !== 'start' && kinds[i] !== 'portal' && kinds[i] !== 'gate' && kinds[i] !== null,
    );
  const altar: number[] = [];
  while (altar.length < want && altar.length < pool2.length) {
    let best = -1,
      bestScore = -Infinity;
    for (const i of pool2) {
      if (altar.includes(i)) continue;
      const s = (altar.length ? Math.min(minTo(i, altar), 9) : row(d.start)[i]!) + rng.next() * 1.5;
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    }
    if (best < 0) break;
    altar.push(best);
  }
  return { kinds: kinds.map((k) => k ?? 'glimmer'), portal, altar: altar.sort((x, y) => x - y) };
}

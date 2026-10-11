import { BuildCtx, Draft, V3, polar, ringRadius } from './common';

export interface ChainParams {
  /** Felder je Ring (in der Reihe mittlere Ringe: gerade Zahl; im Dreieck: Vielfaches von 6) */
  rings: number[];
  arrangement: 'line' | 'triangle';
  /** Höhenlage je Ring */
  dy?: number[];
  wave?: number;
  /** Ring, auf dem das Startfeld liegt */
  startRing?: number;
}

/** Bauplan "chain-loops": Rundkurse, die sich in einzelnen Kreuzungsfeldern berühren (Kettenglieder / Kleeblatt). */
export function buildChainLoops(ctx: BuildCtx, p: ChainParams): Draft {
  const d = new Draft();
  const K = p.rings.length;
  const dy = p.dy ?? p.rings.map(() => 0);
  const wave = p.wave ?? 0;
  const R = p.rings.map((n) => Math.max(5, ringRadius(n)));
  const ids: number[][] = p.rings.map((n) => new Array<number>(n).fill(-1));
  const centers: V3[] = [];
  const sigma = (k: number) => (p.arrangement === 'triangle' ? 1 : k % 2 === 0 ? 1 : -1);
  if (p.arrangement === 'line') {
    let cx = 0;
    for (let k = 0; k < K; k++) {
      if (k > 0) cx += (R[k - 1] as number) + (R[k] as number);
      centers.push([cx, dy[k] as number, 0]);
    }
  } else {
    const r = R[0] as number;
    centers.push([0, dy[0] as number, 0], [2 * r, dy[1] as number, 0], [r, dy[2] as number, 1.732 * r]);
  }
  const ang = (k: number, j: number) => sigma(k) * ((2 * Math.PI * j) / (p.rings[k] as number));
  // Kreuzungsfelder: Paare (Ring, Index) ↔ (Ring, Index)
  const joins: [number, number, number, number][] = [];
  if (p.arrangement === 'line') {
    for (let k = 0; k + 1 < K; k++) joins.push([k, 0, k + 1, (p.rings[k + 1] as number) / 2]);
  } else {
    const m = p.rings[0] as number;
    joins.push([0, 0, 1, m / 2], [0, m / 6, 2, (2 * m) / 3], [1, m / 3, 2, (5 * m) / 6]);
  }
  const shared = new Map<string, number>();
  for (const [k1, j1, k2, j2] of joins) {
    const c = centers[k1] as V3,
      c2 = centers[k2] as V3;
    const a = ang(k1, j1);
    const pos = polar(c[0], c[2], R[k1] as number, a, (c[1] + c2[1]) / 2);
    const nid = d.add(pos);
    shared.set(`${k1}:${j1}`, nid);
    shared.set(`${k2}:${j2}`, nid);
  }
  for (let k = 0; k < K; k++) {
    const c = centers[k] as V3;
    const n = p.rings[k] as number;
    for (let j = 0; j < n; j++) {
      const s = shared.get(`${k}:${j}`);
      if (s !== undefined) (ids[k] as number[])[j] = s;
      else {
        const a = ang(k, j);
        (ids[k] as number[])[j] = d.add(polar(c[0], c[2], R[k] as number, a, c[1] + wave * Math.sin(3 * a)));
      }
    }
    d.loop(ids[k] as number[], k % 2 === 0 ? ctx.st.main : ctx.st.link);
  }
  const sr = p.startRing ?? 0;
  const sn = p.rings[sr] as number;
  let sj = Math.floor(sn / 2);
  while (shared.has(`${sr}:${sj}`)) sj++;
  d.start = (ids[sr] as number[])[sj % sn] as number;
  const used = new Set<number>();
  for (let k = 0; k < K; k++) {
    const own = (ids[k] as number[]).filter((i) => !used.has(i));
    own.forEach((i) => used.add(i));
    d.groupIsland(own, 2.2);
  }
  return d;
}

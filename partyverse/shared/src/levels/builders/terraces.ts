import { BuildCtx, Draft, STEP } from './common';

export interface TerraceParams {
  /** Felder je Seite für jede Terrasse, von innen nach außen (je +2) */
  sides: number[];
  /** Höhe je Stufe (innen am höchsten) */
  yStep?: number;
  /** Treppenpaare je Terrassenpaar (2 oder 4) */
  stairs?: number;
}

/** Bauplan "terraces": quadratische Terrassen übereinander, durch Treppen verbunden (Stufenpyramide). */
export function buildTerraces(ctx: BuildCtx, p: TerraceParams): Draft {
  const d = new Draft();
  const K = p.sides.length;
  const ys = p.yStep ?? 3;
  const rings: number[][] = [];
  const halves: number[] = [];
  for (let k = 0; k < K; k++) {
    const n = p.sides[k] as number;
    const h = (n * STEP) / 2;
    halves.push(h);
    const y = (K - 1 - k) * ys;
    const ids: number[] = [];
    for (let u = 0; u < 4 * n; u++) {
      const q = Math.floor(u / n),
        i = u % n;
      const t = i * STEP;
      const pos: [number, number, number] =
        q === 0 ? [-h + t, y, -h] : q === 1 ? [h, y, -h + t] : q === 2 ? [h - t, y, h] : [-h, y, h - t];
      ids.push(d.add(pos));
    }
    d.loop(ids, ctx.st.main);
    rings.push(ids);
  }
  const mid = (k: number, side: number) =>
    (rings[k] as number[])[side * (p.sides[k] as number) + Math.floor((p.sides[k] as number) / 2)] as number;
  const stairs = p.stairs ?? 2;
  for (let k = 0; k + 1 < K; k++) {
    const s1 = k % 2,
      s2 = (k % 2) + 2;
    // außen (k+1) -> innen (k): hinauf; innen -> außen: hinab
    d.link(mid(k + 1, s1), mid(k, s1), ctx.st.climb);
    d.link(mid(k, s2), mid(k + 1, s2), ctx.st.climb);
    if (stairs >= 4) {
      const s3 = (k + 1) % 2,
        s4 = ((k + 1) % 2) + 2;
      d.link(mid(k + 1, s3), mid(k, s3), ctx.st.climb);
      d.link(mid(k, s4), mid(k + 1, s4), ctx.st.climb);
    }
  }
  d.start = (rings[K - 1] as number[])[0] as number;
  rings.forEach((ids, k) => {
    const isl = d.addIsland([0, (K - 1 - k) * ys - 0.7, 0], (halves[k] as number) * 1.3 + 1.2);
    for (const i of ids) (d.nodes[i] as { island?: number }).island = isl;
  });
  return d;
}

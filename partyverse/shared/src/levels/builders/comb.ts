import { BuildCtx, Draft, STEP } from './common';

export interface CombParams {
  /** Felder je Reihe (gerade, mind. 6) */
  m: number;
  /** Zinnenhöhen oben (Felder je Seite), Spalte 2q; 0 = keine */
  top: number[];
  /** Zinnenhöhen unten */
  bottom: number[];
  /** Abstand der Reihen */
  depth?: number;
  /** Höhenanstieg der Zinnenspitzen */
  lift?: number;
}

/** Bauplan "comb": Hauptreihe mit Zinken (Π-förmige Umwege) oben und unten, Rückreihe darunter. */
export function buildComb(ctx: BuildCtx, p: CombParams): Draft {
  const d = new Draft();
  const m = p.m;
  const D = p.depth ?? 6.8;
  const x = (i: number) => (i - (m - 1) / 2) * STEP;
  const lift = p.lift ?? 1;
  const S: number[] = [],
    Rw: number[] = [];
  for (let i = 0; i < m; i++) S.push(d.add([x(i), 0, 0]));
  for (let i = 0; i < m; i++) Rw.push(d.add([x(i), 0, D]));
  const capR = d.add([x(m - 1) + 3.2, 0, D / 2]);
  const capL = d.add([x(0) - 3.2, 0, D / 2]);
  d.chain(S, ctx.st.main);
  d.link(S[m - 1] as number, capR, ctx.st.main);
  d.link(capR, Rw[m - 1] as number, ctx.st.main);
  d.chain([...Rw].reverse(), ctx.st.main);
  d.link(Rw[0] as number, capL, ctx.st.main);
  d.link(capL, S[0] as number, ctx.st.main);
  d.start = S[0] as number;
  const teeth: number[][] = [];
  const tooth = (row: number[], j: number, h: number, sign: number, reverse: boolean) => {
    const base = row[j] as number,
      next = row[j + 1] as number;
    const bp = (d.nodes[base] as { pos: number[] }).pos;
    const a: number[] = [],
      b: number[] = [];
    for (let k = 1; k <= h; k++) {
      const y = (lift * k) / h;
      a.push(d.add([x(j), y, (bp[2] as number) + sign * STEP * k]));
      b.push(d.add([x(j + 1), y, (bp[2] as number) + sign * STEP * k]));
    }
    if (!reverse) d.chain([base, ...a, ...[...b].reverse(), next], ctx.st.link);
    else d.chain([next, ...b, ...[...a].reverse(), base], ctx.st.link);
    // Spitze verbinden: a_h -> b_h bzw. b_h -> a_h wird durch chain bereits erledigt
    teeth.push([...a, ...b]);
  };
  p.top.forEach((h, q) => {
    const j = 2 * q;
    if (h > 0 && j + 1 < m) tooth(S, j, h, -1, false);
  });
  p.bottom.forEach((h, q) => {
    const j = 2 * q;
    if (h > 0 && j + 1 < m) tooth(Rw, j, h, 1, true);
  });
  // Inseln: Reihenstücke (beide Reihen) zu je 3 Spalten, Zinken eigene Inseln
  for (let c = 0; c < m; c += 3) {
    let hi = Math.min(m, c + 3);
    if (m - hi < 2) hi = m;
    const ids = [...S.slice(c, hi), ...Rw.slice(c, hi)];
    if (c === 0) ids.push(capL);
    if (hi === m) ids.push(capR);
    d.groupIsland(ids, 1.8);
    if (hi === m) break;
  }
  for (const t of teeth) d.groupIsland(t, 1.8);
  return d;
}

import { BuildCtx, Draft, polar, ringRadius } from './common';

export interface OrbitsParams {
  /** Felder je Bahn, von innen nach außen */
  rings: number[];
  /** Verbindungen zwischen benachbarten Bahnen (Anzahl je Paar, mind. 2) */
  links: number[];
  /** Höhenstufe je Bahn (positiv: außen höher) */
  yStep?: number;
  /** Bahn, auf der das Startfeld liegt */
  startRing?: number;
  /** Höhenwelle der Bahnen */
  wave?: number;
}

/** Bauplan "orbits": konzentrische Bahnen mit wechselnder Laufrichtung, verbunden durch Querwege. */
export function buildOrbits(ctx: BuildCtx, p: OrbitsParams): Draft {
  const d = new Draft();
  const K = p.rings.length;
  const radii: number[] = [];
  p.rings.forEach((n, k) =>
    radii.push(Math.max(k === 0 ? 4.8 : (radii[k - 1] as number) + 4.8, ringRadius(n))),
  );
  const ids: number[][] = [];
  const angOf = (k: number, j: number) =>
    (k % 2 === 0 ? 1 : -1) * ((2 * Math.PI * j) / (p.rings[k] as number)) + k * 0.4;
  for (let k = 0; k < K; k++) {
    const row: number[] = [];
    const n = p.rings[k] as number;
    for (let j = 0; j < n; j++)
      row.push(
        d.add(
          polar(
            0,
            0,
            radii[k] as number,
            angOf(k, j),
            k * (p.yStep ?? 0) + (p.wave ?? 0) * Math.sin(3 * angOf(k, j)),
          ),
        ),
      );
    d.loop(row, ctx.st.main);
    ids.push(row);
  }
  const near = (k: number, a: number) => {
    let best = 0,
      bd = Infinity;
    const n = p.rings[k] as number;
    for (let j = 0; j < n; j++) {
      const dd = Math.abs(Math.atan2(Math.sin(angOf(k, j) - a), Math.cos(angOf(k, j) - a)));
      if (dd < bd) {
        bd = dd;
        best = j;
      }
    }
    return (ids[k] as number[])[best] as number;
  };
  for (let k = 0; k + 1 < K; k++) {
    const q = Math.max(2, p.links[k] ?? 2);
    for (let t = 0; t < q; t++) {
      const a = (2 * Math.PI * (t + 0.5)) / q + k * 0.9;
      const inner = near(k, a),
        outer = near(k + 1, a);
      if ((t + k) % 2 === 0) d.link(inner, outer, ctx.st.link);
      else d.link(outer, inner, ctx.st.link);
    }
  }
  const sr = p.startRing ?? K - 1;
  d.start = (ids[sr] as number[])[0] as number;
  for (let k = 0; k < K; k++) {
    const isl = d.addIsland([0, k * (p.yStep ?? 0) - 0.7, 0], (radii[k] as number) + 1.8);
    for (const i of ids[k] as number[]) (d.nodes[i] as { island?: number }).island = isl;
  }
  return d;
}

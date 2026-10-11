import { BuildCtx, Draft, V3, polyLength, resample } from './common';

export interface TrefoilParams {
  n: number;
  /** Höhenfaktor (Überführungen) */
  height?: number;
  /** Zusätzlich das Knotenmuster verdrehen (Phase) */
  phase?: number;
}

/** Bauplan "trefoil-knot": ein einziger Rundkurs in Kleeblattknoten-Form; die Wege kreuzen sich auf verschiedenen Höhen. */
export function buildTrefoil(ctx: BuildCtx, p: TrefoilParams): Draft {
  const d = new Draft();
  const hk = p.height ?? 0.55;
  const raw = (S: number): V3[] => {
    const pts: V3[] = [];
    for (let i = 0; i < 720; i++) {
      const t = (2 * Math.PI * i) / 720 + (p.phase ?? 0);
      pts.push([S * (Math.sin(t) + 2 * Math.sin(2 * t)), -S * hk * Math.sin(3 * t) * 1.6, S * (Math.cos(t) - 2 * Math.cos(2 * t))]);
    }
    return pts;
  };
  const L1 = polyLength(raw(1), true);
  const S = (p.n * 3.5) / L1;
  const pts = resample(raw(S), p.n, true);
  const ids = pts.map((q) => d.add(q));
  d.loop(ids, ctx.st.main);
  d.start = ids[0] as number;
  const third = Math.floor(p.n / 3);
  d.groupIsland(ids.slice(0, third), 2.6);
  d.groupIsland(ids.slice(third, 2 * third), 2.6);
  d.groupIsland(ids.slice(2 * third), 2.6);
  return d;
}

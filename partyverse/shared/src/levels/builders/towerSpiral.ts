import { BuildCtx, Draft, V3, polar, ringRadius } from './common';

export interface TowerParams {
  perTurn: number;
  turns: number;
  /** Höhengewinn je Windung */
  rise: number;
  dir?: 1 | -1;
}

/** Bauplan "tower-spiral": Wendeltreppe (innen) nach oben, außen führt eine zweite Schraube wieder hinab. */
export function buildTowerSpiral(ctx: BuildCtx, p: TowerParams): Draft {
  const d = new Draft();
  const dir = p.dir ?? 1;
  const R1 = Math.max(5.2, ringRadius(p.perTurn));
  const R2 = R1 + 5.6;
  // halbe Zusatzwindung, damit der Abstieg etwa eine halbe Runde lang wird
  const U = p.perTurn * p.turns + Math.round(p.perTurn / 2) + 1;
  const up: number[] = [];
  for (let i = 0; i < U; i++) {
    const a = dir * ((2 * Math.PI * i) / p.perTurn);
    up.push(d.add(polar(0, 0, R1, a, (i * p.rise) / p.perTurn)));
  }
  d.chain(up, ctx.st.climb);
  d.start = up[0] as number;
  const yTop = ((U - 1) * p.rise) / p.perTurn;
  const aTop = (2 * Math.PI * (U - 1)) / p.perTurn;
  const minAng = (3.4 * 5) / R2;
  const target = 2 * Math.PI * Math.ceil((aTop + minAng) / (2 * Math.PI));
  const total = target - aTop;
  const D = Math.max(4, Math.round((total * R2) / 3.7) - 1);
  const down: number[] = [];
  for (let j = 1; j <= D; j++) {
    const t = j / (D + 1);
    const pos: V3 = polar(0, 0, R2, dir * (aTop + total * t), yTop * (1 - t));
    down.push(d.add(pos));
  }
  d.chain([up[U - 1] as number, ...down, up[0] as number], ctx.st.link);
  for (let t = 0; t < p.turns; t++) d.groupIsland(up.slice(t * p.perTurn, (t + 1) * p.perTurn), 2.4);
  d.groupIsland([...up.slice(p.turns * p.perTurn), ...down], 2.2);
  return d;
}

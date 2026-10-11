import { BuildCtx, Draft, STEP, V3 } from './common';

export interface SpiralParams {
  rOut: number;
  rIn?: number;
  pitch?: number;
  /** Höhe des Zentrums über dem Rand (Berg) */
  rise?: number;
  /** Spiralrichtung */
  dir?: 1 | -1;
  /** Höhenwelle entlang der Spirale */
  wave?: number;
}

/** Bauplan "spiral": Weg schraubt sich nach innen; zurück führt eine hohe Brücke vom Zentrum nach außen. */
export function buildSpiral(ctx: BuildCtx, p: SpiralParams): Draft {
  const d = new Draft();
  const rIn = p.rIn ?? 4.6;
  const pitch = p.pitch ?? 5.8;
  const dir = p.dir ?? 1;
  const rise = p.rise ?? 0;
  const ySurf = (r: number) => rise * (1 - r / p.rOut);
  const ids: number[] = [];
  let th = 0,
    r = p.rOut;
  while (r >= rIn && ids.length < 70) {
    const y = ySurf(r) + (p.wave ?? 0) * Math.sin(ids.length * 0.7);
    ids.push(d.add([r * Math.cos(dir * th), y, r * Math.sin(dir * th)]));
    const dth = STEP / r;
    th += dth;
    r -= (pitch * dth) / (2 * Math.PI);
  }
  d.chain(ids, ctx.st.main);
  d.start = ids[0] as number;
  const center = d.add([0, ySurf(0) + 0.4, 0]);
  d.link(ids[ids.length - 1] as number, center, ctx.st.climb);
  // Rückweg: hohe Brücke entlang der Startachse
  const lane: number[] = [];
  const cnt = Math.max(2, Math.round((p.rOut - 3) / STEP));
  for (let i = 1; i <= cnt; i++) {
    const rr = (i * (p.rOut - 2.2)) / cnt;
    const pos: V3 = [rr, ySurf(rr) + 4.6, 0];
    lane.push(d.add(pos));
  }
  d.chain([center, ...lane, ids[0] as number], ctx.st.link);
  // Inseln: Stücke der Spirale
  const per = 9;
  for (let i = 0; i < ids.length; i += per) {
    const part = ids.slice(i, i + per);
    if (part.length < 3 && i > 0) {
      // zu kurzes Reststück bei der vorherigen Insel lassen
      break;
    }
    d.groupIsland(part, 2);
  }
  const lastIsl = ids
    .map((i) => (d.nodes[i] as { island?: number }).island)
    .filter((x) => x !== undefined)
    .pop();
  for (const i of ids)
    if ((d.nodes[i] as { island?: number }).island === undefined)
      (d.nodes[i] as { island?: number }).island = lastIsl;
  const ci = d.addIsland([0, ySurf(0) - 0.4, 0], 3.4);
  (d.nodes[center] as { island?: number }).island = ci;
  return d;
}

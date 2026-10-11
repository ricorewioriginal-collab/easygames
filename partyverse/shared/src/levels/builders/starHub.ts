import { BuildCtx, Draft, STEP, V3 } from './common';

export interface StarParams {
  /** Länge (Felder je Seite) jedes Blütenblatts */
  petals: number[];
  /** Höhenanstieg zur Spitze je Blatt (kann negativ sein) */
  lift?: number[];
  /** Startwinkel */
  rot?: number;
}

/** Bauplan "star-hub": Nabe (Start) mit Schleifen-Blütenblättern, jedes führt hinaus und zurück zur Nabe. */
export function buildStarHub(ctx: BuildCtx, p: StarParams): Draft {
  const d = new Draft();
  const k = p.petals.length;
  const hub = d.add([0, 0, 0]);
  d.start = hub;
  const c = Math.max(0.27, 0.55 * Math.sin(Math.PI / k));
  const hubIsland = d.addIsland([0, -0.5, 0], 4.2);
  (d.nodes[hub] as { island?: number }).island = hubIsland;
  for (let j = 0; j < k; j++) {
    const L = p.petals[j] as number;
    const al = (p.rot ?? 0.4) + (2 * Math.PI * j) / k;
    const ux = Math.cos(al),
      uz = Math.sin(al),
      vx = -uz,
      vz = ux;
    const lift = p.lift?.[j] ?? 0;
    const T = (L + 1) * STEP;
    const at = (t: number, side: number): V3 => {
      const w = Math.min(2.8, c * t) * side;
      return [ux * t + vx * w, (lift * t) / T, uz * t + vz * w];
    };
    const outs: number[] = [],
      rets: number[] = [];
    for (let i = 1; i <= L; i++) outs.push(d.add(at(i * STEP, 1)));
    const tip = d.add(at(T, 0));
    for (let i = L; i >= 1; i--) rets.push(d.add(at(i * STEP, -1)));
    d.chain([hub, ...outs, tip, ...rets, hub], j % 2 === 0 ? ctx.st.main : ctx.st.link);
    d.groupIsland([...outs, tip, ...rets], 2.2);
  }
  return d;
}

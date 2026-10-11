import { BuildCtx, Draft, V3, lerp3, polar, ringRadius } from './common';

export interface TwinParams {
  na: number;
  nb: number;
  /** Felder auf der oberen / unteren Brücke */
  bridges: [number, number];
  /** Höhenunterschied der zweiten Schleife */
  dy: number;
  /** Bogenwinkel (rad) der Brückenansätze */
  phi?: number;
  wave?: number;
}

/** Bauplan "twin-loops": zwei Rundkurse, verbunden durch zwei Brücken (hin und zurück). */
export function buildTwinLoops(ctx: BuildCtx, p: TwinParams): Draft {
  const d = new Draft();
  const Ra = Math.max(5.5, ringRadius(p.na)),
    Rb = Math.max(5.5, ringRadius(p.nb));
  const phi = p.phi ?? Math.PI / 5;
  const maxB = Math.max(p.bridges[0], p.bridges[1]);
  const D = (Ra + Rb) * Math.cos(phi) + (maxB + 1) * 3.6;
  const cA = -D / 2,
    cB = D / 2;
  const wave = p.wave ?? 0;
  const mk = (n: number, cx: number, R: number, y0: number, a0: number, w: number) => {
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (2 * Math.PI * i) / n;
      ids.push(d.add(polar(cx, 0, R, a, y0 + w * Math.sin(2 * a))));
    }
    d.loop(ids, ctx.st.main);
    return ids;
  };
  const A = mk(p.na, cA, Ra, 0, Math.PI, wave);
  const B = mk(p.nb, cB, Rb, p.dy, Math.PI, -wave);
  const near = (ids: number[], n: number, a: number) => {
    // Feld, dessen Winkel (Start bei π) am nächsten an `a` liegt
    let best = 0,
      bd = Infinity;
    for (let i = 0; i < n; i++) {
      const ai = Math.PI + (2 * Math.PI * i) / n;
      const dd = Math.abs(Math.atan2(Math.sin(ai - a), Math.cos(ai - a)));
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    }
    return ids[best] as number;
  };
  const a1 = near(A, p.na, -phi),
    b1 = near(B, p.nb, Math.PI + phi),
    b2 = near(B, p.nb, Math.PI - phi),
    a2 = near(A, p.na, phi);
  const bridge = (from: number, to: number, cnt: number, lift: number) => {
    const pf = (d.nodes[from] as { pos: V3 }).pos,
      pt = (d.nodes[to] as { pos: V3 }).pos;
    const mids: number[] = [];
    for (let m = 1; m <= cnt; m++) {
      const t = m / (cnt + 1);
      const q = lerp3(pf, pt, t);
      q[1] += lift * Math.sin(Math.PI * t);
      mids.push(d.add(q));
    }
    d.chain([from, ...mids, to], ctx.st.link);
    return mids;
  };
  const m1 = bridge(a1, b1, p.bridges[0], 1.4);
  const m2 = bridge(b2, a2, p.bridges[1], 1.4);
  d.start = A[0] as number;
  d.groupIsland(A, 2.4);
  d.groupIsland(B, 2.4);
  [...m1, ...m2].forEach((i) => ((d.nodes[i] as { island?: number }).island = undefined));
  return d;
}

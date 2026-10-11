import { BuildCtx, Draft, STEP, V3, polar, ringRadius } from './common';

export interface RingParams {
  n: number;
  /** Höhenwelle des Rings (Amplitude) */
  wave?: number;
  waves?: number;
  /** Anzahl Umgehungen im Inneren des Rings */
  detours: number;
  /** Felder je Umgehung */
  detourLen?: number;
  /** übersprungene Ringschritte je Umgehung */
  span?: number;
  /** 'one' = eine Plattform, 'sectors' = Kristallsplitter */
  islands?: 'one' | 'sectors';
  sectors?: number;
  step?: number;
}

/** Bauplan "ring": Rundkurs mit innen liegenden Umgehungen (Abkürzungen oder Alternativen). */
export function buildRing(ctx: BuildCtx, p: RingParams): Draft {
  const d = new Draft();
  const R = Math.max(7, ringRadius(p.n, p.step ?? STEP));
  const wave = p.wave ?? 0;
  const ang = (i: number) => (2 * Math.PI * i) / p.n;
  const yAt = (a: number) => wave * Math.sin((p.waves ?? 2) * a);
  const ids: number[] = [];
  for (let i = 0; i < p.n; i++) ids.push(d.add(polar(0, 0, R, ang(i), yAt(ang(i)))));
  d.loop(ids, ctx.st.main);
  d.start = ids[0] as number;
  const len = p.detourLen ?? 2;
  const span = p.span ?? len + 1;
  const slot = Math.floor(p.n / Math.max(1, p.detours));
  for (let j = 0; j < p.detours; j++) {
    const i0 = (j * slot + Math.floor((slot - span) / 2) + 2) % p.n;
    const i1 = (i0 + span) % p.n;
    const a0 = ang(i0);
    const da = (2 * Math.PI * span) / p.n;
    const inner = R - 3.9;
    const mids: number[] = [];
    for (let m = 1; m <= len; m++) {
      const t = m / (len + 1);
      const a = a0 + da * t;
      const pos: V3 = polar(0, 0, inner, a, yAt(a) + 0.6);
      mids.push(d.add(pos));
    }
    d.chain([ids[i0] as number, ...mids, ids[i1] as number], ctx.st.link);
  }
  if (p.islands === 'sectors') {
    const s = p.sectors ?? 4;
    const per = Math.ceil(p.n / s);
    for (let k = 0; k < s; k++) d.groupIsland(ids.slice(k * per, (k + 1) * per), 2);
    // Umgehungsfelder gehören zur nächsten Insel
    d.nodes.forEach((nd, i) => {
      if (i >= p.n) {
        const a = Math.atan2(nd.pos[2], nd.pos[0]);
        const idx = Math.round((((a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)) * p.n) % p.n;
        nd.island = (d.nodes[idx] as { island?: number }).island;
      }
    });
  } else {
    d.addIsland([0, -0.6, 0], R + 2.6);
    d.nodes.forEach((nd) => (nd.island = 0));
  }
  return d;
}

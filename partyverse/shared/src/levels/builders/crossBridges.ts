import { BuildCtx, Draft, V3, lerp3, polar, ringRadius } from './common';

export interface CrossParams {
  /** Felder des Außenrings (gerade) */
  n: number;
  /** Zahl der Überführungen quer durch die Mitte */
  chords: number;
  /** Höhenabstand zwischen den Überführungen */
  levelGap?: number;
  /** Winkelversatz der Überführungen (in Ringfeldern) */
  skew?: number;
  wave?: number;
}

/** Bauplan "cross-bridges": Rundkurs mit Brücken quer über die Mitte, die sich in verschiedenen Höhen kreuzen. */
export function buildCrossBridges(ctx: BuildCtx, p: CrossParams): Draft {
  const d = new Draft();
  const n = p.n;
  const R = Math.max(8, ringRadius(n));
  const wave = p.wave ?? 0;
  const ring: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    ring.push(d.add(polar(0, 0, R, a, wave * Math.sin(3 * a))));
  }
  d.loop(ring, ctx.st.main);
  d.start = ring[0] as number;
  const gap = p.levelGap ?? 4.4;
  const half = n / 2;
  for (let j = 0; j < p.chords; j++) {
    const s = Math.floor((j * n) / (2 * p.chords)) % n;
    const e = (s + half + (p.skew ?? 0)) % n;
    const ps = (d.nodes[ring[s] as number] as { pos: V3 }).pos,
      pe = (d.nodes[ring[e] as number] as { pos: V3 }).pos;
    const len = Math.hypot(ps[0] - pe[0], ps[2] - pe[2]);
    const m = Math.max(3, Math.round(len / 3.7) - 1);
    const level = gap * (j + 1);
    const mids: number[] = [];
    for (let i = 1; i <= m; i++) {
      const t = i / (m + 1);
      const q = lerp3(ps, pe, t);
      q[1] = level * Math.sin(Math.PI * t);
      mids.push(d.add(q));
    }
    const ids =
      j % 2 === 0
        ? [ring[s] as number, ...mids, ring[e] as number]
        : [ring[e] as number, ...[...mids].reverse(), ring[s] as number];
    d.chain(ids, ctx.st.link);
  }
  d.addIsland([0, -0.6, 0], R + 2.6);
  for (let i = 0; i < n; i++) (d.nodes[i] as { island?: number }).island = 0;
  return d;
}

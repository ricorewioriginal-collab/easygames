import { BuildCtx, Draft, V3, resample } from './common';

export interface BraidParams {
  /** Je Raute: Felder der oberen und der unteren Route */
  cells: [number, number][];
  /** halbe Breite der Rauten */
  w?: number;
  /** Tiefe des Rückwegs */
  depth?: number;
  /** Höhenversatz der oberen Routen */
  lift?: number;
}

/** Bauplan "braid": Kette aus Rauten (Routenwahl) auf der einen Seite, Rückweg im Bogen auf der anderen. */
export function buildBraid(ctx: BuildCtx, p: BraidParams): Draft {
  const d = new Draft();
  const w = p.w ?? 3.6;
  const lift = p.lift ?? 0.8;
  const hubs: number[] = [];
  let x = 0;
  const xs: number[] = [0];
  for (const [a, b] of p.cells) {
    x += (Math.max(a, b) + 1) * 3.5;
    xs.push(x);
  }
  const total = x;
  hubs.push(d.add([-total / 2, 0, 0]));
  p.cells.forEach(([a, b], i) => {
    const x0 = (xs[i] as number) - total / 2,
      x1 = (xs[i + 1] as number) - total / 2;
    const route = (cnt: number, side: number, y: number) => {
      const ids: number[] = [];
      for (let j = 1; j <= cnt; j++) {
        const t = j / (cnt + 1);
        ids.push(d.add([x0 + (x1 - x0) * t, y * Math.sin(Math.PI * t), side * w * Math.sin(Math.PI * t)]));
      }
      return ids;
    };
    const up = route(a, -1, lift),
      lo = route(b, 1, 0);
    const next = d.add([x1, 0, 0]);
    hubs.push(next);
    const h0 = hubs[i] as number;
    d.chain([h0, ...up, next], ctx.st.main);
    d.chain([h0, ...lo, next], i % 2 === 0 ? ctx.st.link : ctx.st.main);
    d.groupIsland([h0, ...up, ...lo], 2);
  });
  d.start = hubs[0] as number;
  const last = hubs[hubs.length - 1] as number;
  // Rückweg: flacher Halbbogen unterhalb
  const ax = total / 2;
  const depth = p.depth ?? w + 5.5;
  const dense: V3[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = (Math.PI * i) / 120;
    dense.push([ax * Math.cos(t), 0, depth * Math.sin(t)]);
  }
  let arcLen = 0;
  for (let i = 1; i < dense.length; i++) arcLen += Math.hypot((dense[i][0] as number) - (dense[i - 1][0] as number), (dense[i][2] as number) - (dense[i - 1][2] as number));
  const cnt = Math.max(4, Math.round(arcLen / 3.6) - 1);
  const pts = resample(dense, cnt + 2, false).slice(1, -1);
  const ret = pts.map((q, i) => d.add([q[0], 0.4 * Math.sin((Math.PI * (i + 1)) / (cnt + 1)), q[2]]));
  d.chain([last, ...ret, d.start], ctx.st.link);
  d.groupIsland(ret, 2);
  return d;
}

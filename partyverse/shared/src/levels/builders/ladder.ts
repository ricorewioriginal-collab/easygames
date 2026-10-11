import { BuildCtx, Draft, STEP } from './common';

export interface LadderParams {
  /** Spalten (Felder je Spur) */
  m: number;
  /** halbe Breite zwischen den Spuren */
  w: number;
  /** Zahl der Sprossen (Querverbindungen) */
  rungs: number;
  /** Höhenwelle (gegenläufig auf beiden Spuren) */
  wave?: number;
  /** Steigung entlang der Leiter */
  slope?: number;
  /** Spalten je Inselstück */
  chunk?: number;
}

/** Bauplan "ladder": Hin- und Rückspur mit Sprossen als Querverbindungen. */
export function buildLadder(ctx: BuildCtx, p: LadderParams): Draft {
  const d = new Draft();
  const { m, w } = p;
  const wave = p.wave ?? 0;
  const slope = p.slope ?? 0;
  const x = (i: number) => (i - (m - 1) / 2) * STEP;
  const top: number[] = [],
    bot: number[] = [];
  for (let i = 0; i < m; i++) {
    const a = (2 * Math.PI * 1.5 * i) / m;
    top.push(d.add([x(i), wave * Math.sin(a) + slope * (i - m / 2) * 0.2, -w]));
  }
  for (let i = 0; i < m; i++) {
    const a = (2 * Math.PI * 1.5 * i) / m;
    bot.push(d.add([x(i), -wave * Math.sin(a) + slope * (i - m / 2) * 0.2, w]));
  }
  const capR = d.add([
    x(m - 1) + STEP * 0.95,
    ((d.nodes[top[m - 1] as number] as { pos: number[] }).pos[1] as number) * 0.5,
    0,
  ]);
  const capL = d.add([
    x(0) - STEP * 0.95,
    ((d.nodes[top[0] as number] as { pos: number[] }).pos[1] as number) * 0.5,
    0,
  ]);
  d.chain(top, ctx.st.main);
  d.link(top[m - 1] as number, capR, ctx.st.main);
  d.link(capR, bot[m - 1] as number, ctx.st.main);
  d.chain([...bot].reverse(), ctx.st.main);
  d.link(bot[0] as number, capL, ctx.st.main);
  d.link(capL, top[0] as number, ctx.st.main);
  d.start = top[0] as number;
  for (let j = 0; j < p.rungs; j++) {
    const col = Math.max(1, Math.min(m - 2, Math.round(((j + 1) * m) / (p.rungs + 1))));
    if (j % 2 === 0) d.link(top[col] as number, bot[col] as number, ctx.st.link);
    else d.link(bot[col] as number, top[col] as number, ctx.st.link);
  }
  const ch = p.chunk ?? 4;
  for (let c = 0; c < m; c += ch) {
    let hi = Math.min(m, c + ch);
    if (m - hi < Math.ceil(ch / 2)) hi = m;
    const ids = [...top.slice(c, hi), ...bot.slice(c, hi)];
    if (c === 0) ids.push(capL);
    if (hi === m) ids.push(capR);
    d.groupIsland(ids, 1.8);
    if (hi === m) break;
  }
  return d;
}

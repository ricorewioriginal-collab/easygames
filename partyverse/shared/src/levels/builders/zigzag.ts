import { BuildCtx, Draft, STEP } from './common';

export interface ZigzagParams {
  rows: number;
  cols: number;
  /** Anzahl senkrechter Querverbindungen zwischen Reihen */
  rungs: number;
  /** Höhenstufe je Reihe */
  terrace?: number;
  wave?: number;
}

/** Bauplan "zigzag": Schlangenpfad durch Reihen (Serpentine), Rückweg als Randpfad; Querverbindungen als Abkürzungen. */
export function buildZigzag(ctx: BuildCtx, p: ZigzagParams): Draft {
  const d = new Draft();
  const R = p.rows % 2 === 0 ? p.rows : p.rows + 1;
  const C = p.cols;
  const sr = 3.6;
  const terr = p.terrace ?? 0;
  const wave = p.wave ?? 0;
  const X = (c: number) => (c - (C - 1) / 2) * STEP;
  const Z = (r: number) => (r - (R - 1) / 2) * sr;
  const Y = (r: number, c: number) => terr * r + wave * Math.sin(c * 0.9 + r * 1.3);
  const grid: number[][] = [];
  for (let r = 0; r < R; r++) {
    const row: number[] = [];
    for (let c = 0; c < C; c++) row.push(d.add([X(c), Y(r, c), Z(r)]));
    grid.push(row);
  }
  d.start = (grid[0] as number[])[0] as number;
  for (let r = 0; r < R; r++) {
    const row = grid[r] as number[];
    const ordered = r % 2 === 0 ? row : [...row].reverse();
    d.chain(ordered, ctx.st.main);
    if (r + 1 < R) {
      const endCol = r % 2 === 0 ? C - 1 : 0;
      d.link((grid[r] as number[])[endCol] as number, (grid[r + 1] as number[])[endCol] as number, ctx.st.main);
    }
  }
  // Rückweg am linken Rand, von der letzten Reihe zum Start
  const ret: number[] = [];
  for (let r = R - 1; r >= 0; r--) ret.push(d.add([X(0) - STEP, Y(r, 0), Z(r)]));
  d.chain([(grid[R - 1] as number[])[0] as number, ...ret, (grid[0] as number[])[0] as number], ctx.st.link);
  // Querverbindungen
  const used = new Set<string>();
  for (let j = 0; j < p.rungs; j++) {
    const r = Math.min(R - 2, Math.floor(((j + 0.5) * (R - 1)) / p.rungs));
    const c = 1 + ((j * 3 + 1) % Math.max(1, C - 2));
    const key = `${r}:${c}`;
    if (used.has(key)) continue;
    used.add(key);
    const a = (grid[r] as number[])[c] as number,
      b = (grid[r + 1] as number[])[c] as number;
    if (j % 2 === 0) d.link(a, b, ctx.st.climb);
    else d.link(b, a, ctx.st.climb);
  }
  for (let r = 0; r < R; r += 2) {
    const ids = [...(grid[r] as number[]), ...(grid[r + 1] as number[])];
    for (let c = 0; c < C; c += 3) {
      const hi = C - (c + 3) < 2 ? C : c + 3;
      const part = [...(grid[r] as number[]).slice(c, hi), ...(grid[r + 1] as number[]).slice(c, hi)];
      if (c === 0) part.push(ret[R - 1 - r] as number, ret[R - 2 - r] as number);
      d.groupIsland(part, 1.9);
      if (hi === C) break;
    }
    void ids;
  }
  return d;
}

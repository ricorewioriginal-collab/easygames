import { BuildCtx, Draft, V3 } from './common';

export interface RibbonParams {
  /** Felder je Spur */
  n: number;
  /** Seitenverhältnis der Ellipse */
  ratio?: number;
  /** Breite des Bandes */
  w?: number;
  /** 1 = halbe Verdrehung (Möbius), 0 = glatt */
  twist?: 0 | 1;
  wave?: number;
  /** Spurwechsel-Positionen (Zahl) */
  switches: number;
  /** Felder je Inselstück */
  chunk?: number;
}

/** Bauplan "ribbon": zweispuriges Band (Doppelbahn) mit Spurwechseln, optional zur Möbius-Schleife verdreht. */
export function buildRibbon(ctx: BuildCtx, p: RibbonParams): Draft {
  const d = new Draft();
  const n = p.n;
  const ratio = p.ratio ?? 1.5;
  const w = p.w ?? 3.6;
  const twist = p.twist ?? 0;
  const lane = n * 3.5;
  const a = lane / (2 * Math.PI * Math.sqrt((1 + 1 / (ratio * ratio)) / 2));
  const b = a / ratio;
  const A: number[] = [],
    B: number[] = [];
  for (let i = 0; i < n; i++) {
    const phi = (2 * Math.PI * i) / n;
    const cx = a * Math.cos(phi),
      cz = b * Math.sin(phi);
    // Außennormale der Ellipse
    let nx = Math.cos(phi) / a,
      nz = Math.sin(phi) / b;
    const nl = Math.hypot(nx, nz);
    nx /= nl;
    nz /= nl;
    const tw = (twist * phi) / 2;
    const base = (p.wave ?? 0) * Math.sin(2 * phi);
    const off = (s: number): V3 => [
      cx + s * (w / 2) * Math.cos(tw) * nx,
      base + s * (w / 2) * Math.sin(tw),
      cz + s * (w / 2) * Math.cos(tw) * nz,
    ];
    A.push(d.add(off(1)));
    B.push(d.add(off(-1)));
  }
  d.chain(A, ctx.st.main);
  d.chain(B, ctx.st.main);
  if (twist) {
    d.link(A[n - 1] as number, B[0] as number, ctx.st.main);
    d.link(B[n - 1] as number, A[0] as number, ctx.st.main);
  } else {
    d.link(A[n - 1] as number, A[0] as number, ctx.st.main);
    d.link(B[n - 1] as number, B[0] as number, ctx.st.main);
  }
  d.start = A[0] as number;
  const s = p.switches;
  for (let j = 0; j < s; j++) {
    const i = Math.max(1, Math.min(n - 3, Math.round(((j + 0.5) * n) / s)));
    if (j % 2 === 0) d.link(A[i] as number, B[i + 1] as number, ctx.st.link);
    else d.link(B[i] as number, A[i + 1] as number, ctx.st.link);
  }
  const ch = p.chunk ?? 4;
  for (let c = 0; c < n; c += ch) {
    let hi = Math.min(n, c + ch);
    if (n - hi < Math.ceil(ch / 2)) hi = n;
    d.groupIsland([...A.slice(c, hi), ...B.slice(c, hi)], 1.8);
    if (hi === n) break;
  }
  return d;
}

import { BuildCtx, Draft } from './common';

export interface LatticeParams {
  cols: number;
  rows: number;
  /** Einbahnstraßen: 'both' = Reihen und Spalten, 'rows' = nur Reihen, 'cols' = nur Spalten */
  streets: 'both' | 'rows' | 'cols';
  /** Hügelhöhe */
  hill?: number;
  /** zusätzliche Welle */
  wave?: number;
  gridStep?: number;
}

/** Bauplan "lattice": Stadtraster mit Einbahnstraßen; Randring im Uhrzeigersinn, Innenstraßen wechseln die Richtung. */
export function buildLattice(ctx: BuildCtx, p: LatticeParams): Draft {
  const d = new Draft();
  const { cols: N, rows: M } = p;
  const s = p.gridStep ?? 3.7;
  const hill = p.hill ?? 0;
  const id = (r: number, c: number) => r * N + c;
  for (let r = 0; r < M; r++)
    for (let c = 0; c < N; c++) {
      const u = (c / (N - 1)) * Math.PI,
        v = (r / (M - 1)) * Math.PI;
      const y = hill * Math.sin(u) * Math.sin(v) + (p.wave ?? 0) * Math.sin(c * 1.1 + r * 0.8);
      d.add([(c - (N - 1) / 2) * s, y, (r - (M - 1) / 2) * s]);
    }
  d.start = id(0, 0);
  const style = (a: number, b: number, dflt: 'main' | 'link') => {
    const dy = Math.abs(
      (d.nodes[a] as { pos: number[] }).pos[1]! - (d.nodes[b] as { pos: number[] }).pos[1]!,
    );
    return dy >= 1.3 ? ctx.st.climb : dflt === 'main' ? ctx.st.main : ctx.st.link;
  };
  const L = (a: number, b: number, dflt: 'main' | 'link') => d.link(a, b, style(a, b, dflt));
  for (let c = 0; c < N - 1; c++) L(id(0, c), id(0, c + 1), 'main');
  for (let r = 0; r < M - 1; r++) L(id(r, N - 1), id(r + 1, N - 1), 'main');
  for (let c = N - 1; c > 0; c--) L(id(M - 1, c), id(M - 1, c - 1), 'main');
  for (let r = M - 1; r > 0; r--) L(id(r, 0), id(r - 1, 0), 'main');
  if (p.streets !== 'cols')
    for (let r = 1; r < M - 1; r++) {
      if (r % 2 === 1) for (let c = 0; c < N - 1; c++) L(id(r, c), id(r, c + 1), 'link');
      else for (let c = N - 1; c > 0; c--) L(id(r, c), id(r, c - 1), 'link');
    }
  if (p.streets !== 'rows')
    for (let c = 1; c < N - 1; c++) {
      if (c % 2 === 1) for (let r = 0; r < M - 1; r++) L(id(r, c), id(r + 1, c), 'link');
      else for (let r = M - 1; r > 0; r--) L(id(r, c), id(r - 1, c), 'link');
    }
  // Inseln: Blöcke von bis zu 3×3 Feldern
  const bw = Math.max(1, Math.round(N / 3)),
    bh = Math.max(1, Math.round(M / 3));
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      const r0 = Math.round((by * M) / bh),
        r1 = Math.round(((by + 1) * M) / bh);
      const c0 = Math.round((bx * N) / bw),
        c1 = Math.round(((bx + 1) * N) / bw);
      const ids: number[] = [];
      for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) ids.push(id(r, c));
      d.groupIsland(ids, 2);
    }
  return d;
}

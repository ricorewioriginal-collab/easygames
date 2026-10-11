import { BuildCtx, Draft, V3, lerp3, polar, ringRadius } from './common';

export interface ArchipelagoParams {
  /** Felder jeder Inselrunde (je mind. 4) */
  sizes: number[];
  /** Lücke zwischen den Inseln */
  gap?: number;
  /** Zwischenfelder auf den Brücken (0 oder 1) */
  bridgeNodes?: 0 | 1;
  /** Zentrale Insel: Größe und Anzahl Stege (Hin- und Rückstege abwechselnd) */
  hub?: { size: number; spokes: number };
  /** Höhenstreuung der Inseln */
  spread?: number;
  /** Anzahl Brücken, die auch rückwärts begehbar sind */
  back?: number;
}

/** Bauplan "archipelago": Inseln mit kleinen Rundkursen, durch Brücken im Kreis verbunden, optional mit Zentralinsel. */
export function buildArchipelago(ctx: BuildCtx, p: ArchipelagoParams): Draft {
  const d = new Draft();
  const k = p.sizes.length;
  const rs = p.sizes.map((m) => Math.max(2.6, ringRadius(m)));
  const avg = rs.reduce((a, b) => a + b, 0) / k;
  const gap = (p.gap ?? 7) + (p.bridgeNodes ? 3.4 : 0) + (p.hub ? 2 : 0);
  let Rm = (2 * avg + gap) / (2 * Math.sin(Math.PI / k));
  if (p.hub) Rm = Math.max(Rm, avg + Math.max(2.6, ringRadius(p.hub.size)) + 7);
  const spread = p.spread ?? 3;
  const centers: V3[] = [];
  for (let i = 0; i < k; i++) {
    const psi = (2 * Math.PI * i) / k - Math.PI / 2;
    const y = i === 0 ? 0 : spread * Math.sin(i * 2.1 + 0.5) + (i % 2 ? 0.6 : -0.6);
    centers.push(polar(0, 0, Rm, psi, y));
  }
  const rings: number[][] = [];
  const outPort: number[] = [],
    inPort: number[] = [];
  for (let i = 0; i < k; i++) {
    const c = centers[i] as V3;
    const nxt = centers[(i + 1) % k] as V3,
      prv = centers[(i + k - 1) % k] as V3;
    const dirOut = Math.atan2(nxt[2] - c[2], nxt[0] - c[0]);
    const dirIn = Math.atan2(prv[2] - c[2], prv[0] - c[0]);
    const m = p.sizes[i] as number;
    const ids: number[] = [];
    for (let j = 0; j < m; j++)
      ids.push(d.add(polar(c[0], c[2], rs[i] as number, dirOut + (2 * Math.PI * j) / m, c[1])));
    d.loop(ids, ctx.st.main);
    rings.push(ids);
    outPort.push(ids[0] as number);
    let best = 0,
      bd = Infinity;
    for (let j = 0; j < m; j++) {
      const a = dirOut + (2 * Math.PI * j) / m;
      const dd = Math.abs(Math.atan2(Math.sin(a - dirIn), Math.cos(a - dirIn)));
      if (dd < bd) {
        bd = dd;
        best = j;
      }
    }
    inPort.push(ids[best] as number);
    d.groupIsland(ids, 2.2);
  }
  d.start = (rings[0] as number[])[Math.floor((p.sizes[0] as number) / 2)] as number;
  const bridgePaths: number[][] = [];
  const bridge = (a: number, b: number) => {
    if (p.bridgeNodes) {
      const pa = (d.nodes[a] as { pos: V3 }).pos,
        pb = (d.nodes[b] as { pos: V3 }).pos;
      const mid = lerp3(pa, pb, 0.5);
      mid[1] += 1.2;
      const mi = d.add(mid);
      d.chain([a, mi, b], ctx.st.link);
      bridgePaths.push([a, mi, b]);
    } else {
      d.link(a, b, ctx.st.link);
      bridgePaths.push([a, b]);
    }
  };
  for (let i = 0; i < k; i++) bridge(outPort[i] as number, inPort[(i + 1) % k] as number);
  // Zweiwege-Brücken: einzelne Brücken lassen sich auch rückwärts überqueren
  for (let q = 0; q < (p.back ?? 0); q++) {
    const i = Math.floor(((q + 0.5) * k) / (p.back as number)) % k;
    d.chain([...(bridgePaths[i] as number[])].reverse(), ctx.st.link);
  }
  if (p.hub) {
    const hm = p.hub.size;
    const rh = Math.max(2.6, ringRadius(hm));
    const hubIds: number[] = [];
    for (let j = 0; j < hm; j++) hubIds.push(d.add(polar(0, 0, rh, -(2 * Math.PI * j) / hm, 1.2)));
    d.loop(hubIds, ctx.st.main);
    d.groupIsland(hubIds, 2.2);
    const nearest = (ids: number[], target: V3) => {
      let best = ids[0] as number,
        bd = Infinity;
      for (const id of ids) {
        const q = (d.nodes[id] as { pos: V3 }).pos;
        const dd = Math.hypot(q[0] - target[0], q[2] - target[2]);
        if (dd < bd) {
          bd = dd;
          best = id;
        }
      }
      return best;
    };
    for (let s = 0; s < p.hub.spokes; s++) {
      const i = Math.floor((s * k) / p.hub.spokes + (k > 3 ? 0.5 : 0)) % k;
      const isl = rings[i] as number[];
      const c = centers[i] as V3;
      const a = nearest(isl, [0, 0, 0]);
      const h = nearest(hubIds, c);
      if (s % 2 === 0) d.link(a, h, ctx.st.climb);
      else d.link(h, nearest(isl, [0, 0, 0]), ctx.st.climb);
    }
  }
  return d;
}

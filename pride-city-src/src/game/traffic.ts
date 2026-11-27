/* Straßennetz von Rainbow City: Kreuzungen auf dem 30-m-Raster (Innenstadt x −60…60, Hochstadt x 90…210, z −60…60),
   verbunden über die Regenbogenbrücke (z = 0). Grundlage für den Verkehr (Abbiegen an Kreuzungen) und die GPS-Route. */

export interface RNode { x: number; z: number; nb: number[] }
/** Rechtsverkehr: Fahrspur 3 m neben der Mittellinie */
export const LANE = 3;
/** Fahrspur endet so weit vor der Kreuzungsmitte (dort beginnt der Abbiegebogen) */
export const STOP = 6;

const ZS = [-60, -30, 0, 30, 60];
const DOWN = [-60, -30, 0, 30, 60], UP = [90, 120, 150, 180, 210];

export const NODES: RNode[] = [];
const at = new Map<string, number>();
const key = (x: number, z: number) => x + ',' + z;
for (const xs of [DOWN, UP]) for (const x of xs) for (const z of ZS) { at.set(key(x, z), NODES.length); NODES.push({ x, z, nb: [] }); }
const link = (a: number | undefined, b: number | undefined) => { if (a === undefined || b === undefined) return; NODES[a].nb.push(b); NODES[b].nb.push(a); };
for (const xs of [DOWN, UP]) {
  for (const z of ZS) for (let i = 1; i < xs.length; i++) link(at.get(key(xs[i - 1], z)), at.get(key(xs[i], z)));
  for (const x of xs) for (let i = 1; i < ZS.length; i++) link(at.get(key(x, ZS[i - 1])), at.get(key(x, ZS[i])));
}
link(at.get(key(60, 0)), at.get(key(90, 0)));   // Regenbogenbrücke

/** Fahrspur von Kreuzung a nach b: Anfang und Ende (Rechtsverkehr, vor den Kreuzungen gekürzt) */
export function lane(a: number, b: number): [number, number, number, number] {
  const A = NODES[a], B = NODES[b], len = Math.hypot(B.x - A.x, B.z - A.z), dx = (B.x - A.x) / len, dz = (B.z - A.z) / len;
  const ox = -dz * LANE, oz = dx * LANE;
  return [A.x + dx * STOP + ox, A.z + dz * STOP + oz, B.x - dx * STOP + ox, B.z - dz * STOP + oz];
}

/** Nächste Kreuzung zu einem Punkt */
export function nearestNode(x: number, z: number) {
  let best = 0, bd = Infinity;
  NODES.forEach((n, i) => { const d = (n.x - x) ** 2 + (n.z - z) ** 2; if (d < bd) { bd = d; best = i; } });
  return best;
}

/** Nächste Kante (Straßenstück) zu einem Punkt: Kreuzungen a, b und Lage u (0–1) */
export function nearestEdge(x: number, z: number) {
  let ba = 0, bb = 0, bu = 0, bd = Infinity;
  NODES.forEach((A, a) => A.nb.forEach((b) => {
    if (b < a) return;
    const B = NODES[b], ex = B.x - A.x, ez = B.z - A.z, l2 = ex * ex + ez * ez;
    const u = Math.max(0, Math.min(1, ((x - A.x) * ex + (z - A.z) * ez) / l2)), px = A.x + ex * u, pz = A.z + ez * u, d = (x - px) ** 2 + (z - pz) ** 2;
    if (d < bd) { bd = d; ba = a; bb = b; bu = u; }
  }));
  return { a: ba, b: bb, u: bu, d: Math.sqrt(bd) };
}

/** Kürzester Weg über die Straßen (Dijkstra, 50 Kreuzungen): Liste von Punkten vom Start zum Ziel */
export function route(fx: number, fz: number, tx: number, tz: number): Array<[number, number]> {
  const s = nearestEdge(fx, fz), e = nearestEdge(tx, tz);
  const pt = (i: number): [number, number] => [NODES[i].x, NODES[i].z];
  const proj = (q: typeof s): [number, number] => { const A = NODES[q.a], B = NODES[q.b]; return [A.x + (B.x - A.x) * q.u, A.z + (B.z - A.z) * q.u]; };
  const sp = proj(s), ep = proj(e);
  if ((s.a === e.a && s.b === e.b) || Math.hypot(tx - fx, tz - fz) < 12) return [[fx, fz], sp, ep, [tx, tz]];
  const n = NODES.length, dist = new Array<number>(n).fill(Infinity), prev = new Array<number>(n).fill(-1), done = new Array<boolean>(n).fill(false);
  const d0 = (i: number) => Math.hypot(NODES[i].x - sp[0], NODES[i].z - sp[1]);
  dist[s.a] = d0(s.a); dist[s.b] = d0(s.b);
  for (;;) {
    let u = -1; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break; done[u] = true;
    for (const v of NODES[u].nb) { const w = dist[u] + Math.hypot(NODES[v].x - NODES[u].x, NODES[v].z - NODES[u].z); if (w < dist[v]) { dist[v] = w; prev[v] = u; } }
  }
  const end = (i: number) => dist[i] + Math.hypot(NODES[i].x - ep[0], NODES[i].z - ep[1]);
  let last = end(e.a) <= end(e.b) ? e.a : e.b;
  if (dist[last] === Infinity) return [[fx, fz], [tx, tz]];
  const chain: number[] = []; for (let i = last; i >= 0; i = prev[i]) chain.unshift(i);
  return [[fx, fz], sp, ...chain.map(pt), ep, [tx, tz]];
}

/** Liegt der Punkt im Straßennetz (Stadt und Hochstadt)? Ziele draußen (Inseln, Kai) bekommen den Weg bis zum Rand. */
export function onGrid(x: number, z: number) { return x > -66 && x < 216 && Math.abs(z) < 66; }

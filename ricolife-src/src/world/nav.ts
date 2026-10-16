// A*-Wegesuche auf dem Kachelraster mit zwei Stockwerken, Wänden, Türen und Treppen.
import { cellKey, F_BLOCK, F_PRIVATE, F_WALL_N, F_WALL_W, MAP_H, MAP_W, N_CELLS, type World } from './world';

export interface PathPoint {
  x: number;
  z: number;
  l: number;
  /** Treppenstufe: Übergang zwischen Stockwerken */
  stair?: boolean;
}

const PLANE = MAP_W * MAP_H;
const gScore = new Float32Array(N_CELLS);
const came = new Int32Array(N_CELLS);
const stamp = new Uint32Array(N_CELLS);
const closed = new Uint32Array(N_CELLS);
let curStamp = 0;

// Binärer Heap über (f, Zelle)
let heapF = new Float32Array(4096);
let heapC = new Int32Array(4096);
let heapN = 0;
function push(f: number, c: number): void {
  if (heapN >= heapF.length) {
    const nf = new Float32Array(heapF.length * 2);
    nf.set(heapF);
    heapF = nf;
    const nc = new Int32Array(heapC.length * 2);
    nc.set(heapC);
    heapC = nc;
  }
  let i = heapN++;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heapF[p]! <= f) break;
    heapF[i] = heapF[p]!;
    heapC[i] = heapC[p]!;
    i = p;
  }
  heapF[i] = f;
  heapC[i] = c;
}
function pop(): number {
  const top = heapC[0]!;
  const lf = heapF[--heapN]!,
    lc = heapC[heapN]!;
  let i = 0;
  for (;;) {
    let c = i * 2 + 1;
    if (c >= heapN) break;
    if (c + 1 < heapN && heapF[c + 1]! < heapF[c]!) c++;
    if (heapF[c]! >= lf) break;
    heapF[i] = heapF[c]!;
    heapC[i] = heapC[c]!;
    i = c;
  }
  heapF[i] = lf;
  heapC[i] = lc;
  return top;
}

const DIRS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

/** Kann man von Zelle a direkt zur Nachbarzelle (dx,dz) gehen? (Wände, Ecken) */
export function stepOk(w: World, l: number, x: number, z: number, dx: number, dz: number): boolean {
  const f = w.flags;
  const base = l * PLANE;
  const nx = x + dx,
    nz = z + dz;
  if (nx < 0 || nz < 0 || nx >= MAP_W || nz >= MAP_H) return false;
  if (f[base + nz * MAP_W + nx]! & F_BLOCK) return false;
  const wallE = (cx: number, cz: number, n: boolean): boolean => (f[base + cz * MAP_W + cx]! & (n ? F_WALL_N : F_WALL_W)) !== 0;
  if (dz === 0) return !wallE(Math.max(x, nx), z, false);
  if (dx === 0) return !wallE(x, Math.max(z, nz), true);
  // diagonal: keine Ecke schneiden
  if (f[base + z * MAP_W + nx]! & F_BLOCK || f[base + nz * MAP_W + x]! & F_BLOCK) return false;
  if (wallE(Math.max(x, nx), z, false) || wallE(x, Math.max(z, nz), true)) return false;
  if (wallE(Math.max(x, nx), nz, false) || wallE(nx, Math.max(z, nz), true)) return false;
  return true;
}

export interface FindOpts {
  /** Zellen privater Lots kosten mehr (Abkürzungen durch fremde Häuser meiden) – erlaubtes Lot ausgenommen */
  allowLot?: string;
  maxNodes?: number;
}

/**
 * Sucht einen Weg von (sx,sz,sl) zu einer der Zielzellen. Gibt Punkte (Zellmitten) zurück oder null, wenn unerreichbar.
 * Die Startzelle darf blockiert sein (Figur steht z. B. noch am Bett).
 */
export function findPath(w: World, sx: number, sz: number, sl: number, goals: { x: number; z: number; l: number }[], opts: FindOpts = {}): PathPoint[] | null {
  if (!goals.length) return null;
  const sxi = Math.floor(sx),
    szi = Math.floor(sz);
  if (sxi < 0 || szi < 0 || sxi >= MAP_W || szi >= MAP_H) return null;
  const goalSet = new Set<number>();
  for (const g of goals) {
    const gx = Math.floor(g.x),
      gz = Math.floor(g.z);
    if (gx >= 0 && gz >= 0 && gx < MAP_W && gz < MAP_H) goalSet.add(cellKey(g.l, gx, gz));
  }
  if (!goalSet.size) return null;
  const start = cellKey(sl, sxi, szi);
  if (goalSet.has(start)) return [{ x: sx, z: sz, l: sl }];
  curStamp++;
  if (curStamp >= 0xffffffff) {
    stamp.fill(0);
    closed.fill(0);
    curStamp = 1;
  }
  heapN = 0;
  // Heuristik zum nächsten Ziel (Oktil + Stockwerkwechsel)
  const gl = goals.map((g) => [Math.floor(g.x), Math.floor(g.z), g.l] as const);
  const h = (x: number, z: number, l: number): number => {
    let best = 1e9;
    for (const [gx, gz, gll] of gl) {
      const dx = Math.abs(gx - x),
        dz = Math.abs(gz - z);
      const v = Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz) + (gll !== l ? 4 : 0);
      if (v < best) best = v;
    }
    return best;
  };
  stamp[start] = curStamp;
  gScore[start] = 0;
  came[start] = -1;
  push(h(sxi, szi, sl), start);
  const maxNodes = opts.maxNodes ?? 40000;
  let expanded = 0;
  const allow = opts.allowLot;
  while (heapN > 0) {
    const cur = pop();
    if (closed[cur] === curStamp) continue;
    closed[cur] = curStamp;
    if (goalSet.has(cur)) return rebuild(w, cur);
    if (++expanded > maxNodes) return null;
    const l = Math.floor(cur / PLANE);
    const rest = cur - l * PLANE;
    const z = Math.floor(rest / MAP_W),
      x = rest - z * MAP_W;
    const g0 = gScore[cur]!;
    for (const [dx, dz, cost] of DIRS) {
      if (!stepOk(w, l, x, z, dx, dz)) continue;
      const n = cur + dz * MAP_W + dx;
      if (closed[n] === curStamp) continue;
      let c = cost;
      if (w.flags[n]! & F_PRIVATE) {
        const lot = w.lotAt(x + dx, z + dz);
        if (!lot || lot.id !== allow) c *= 4;
      }
      const ng = g0 + c;
      if (stamp[n] !== curStamp || ng < gScore[n]!) {
        stamp[n] = curStamp;
        gScore[n] = ng;
        came[n] = cur;
        push(ng + h(x + dx, z + dz, l), n);
      }
    }
    const links = w.links.get(cur);
    if (links)
      for (const n of links) {
        if (closed[n] === curStamp) continue;
        const ng = g0 + 4;
        if (stamp[n] !== curStamp || ng < gScore[n]!) {
          const nl = Math.floor(n / PLANE);
          const nr = n - nl * PLANE;
          stamp[n] = curStamp;
          gScore[n] = ng;
          came[n] = cur;
          push(ng + h(nr % MAP_W, Math.floor(nr / MAP_W), nl), n);
        }
      }
  }
  return null;
}

function rebuild(w: World, end: number): PathPoint[] {
  const cells: number[] = [];
  for (let c = end; c !== -1; c = came[c]!) cells.push(c);
  cells.reverse();
  const pts: PathPoint[] = cells.map((c) => {
    const l = Math.floor(c / PLANE);
    const rest = c - l * PLANE;
    return { x: (rest % MAP_W) + 0.5, z: Math.floor(rest / MAP_W) + 0.5, l };
  });
  for (let i = 1; i < pts.length; i++) if (pts[i]!.l !== pts[i - 1]!.l) pts[i]!.stair = true;
  return smooth(w, pts);
}

/** Wegpunkte ausdünnen, solange die gerade Linie frei bleibt (gleiches Stockwerk) */
function smooth(w: World, pts: PathPoint[]): PathPoint[] {
  if (pts.length <= 2) return pts;
  const out: PathPoint[] = [pts[0]!];
  let anchor = 0;
  for (let i = 2; i < pts.length; i++) {
    const a = pts[anchor]!,
      b = pts[i]!;
    if (b.stair || pts[i - 1]!.stair || a.l !== b.l || !lineFree(w, a, b)) {
      out.push(pts[i - 1]!);
      anchor = i - 1;
    }
  }
  out.push(pts[pts.length - 1]!);
  return out;
}

/** Gerade Linie zwischen zwei Zellmitten frei? (Abtastung in kleinen Schritten über die Zellübergänge) */
export function lineFree(w: World, a: PathPoint, b: PathPoint): boolean {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 3);
  let px = Math.floor(a.x),
    pz = Math.floor(a.z);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // etwas Breite: zwei parallele Linien prüfen
    for (const off of [-0.28, 0.28]) {
      const nxv = -(b.z - a.z),
        nzv = b.x - a.x;
      const len = Math.hypot(nxv, nzv) || 1;
      const x = Math.floor(a.x + (b.x - a.x) * t + (nxv / len) * off);
      const z = Math.floor(a.z + (b.z - a.z) * t + (nzv / len) * off);
      if (x < 0 || z < 0 || x >= MAP_W || z >= MAP_H) return false;
      if (w.flags[cellKey(a.l, x, z)]! & F_BLOCK) return false;
    }
    const x = Math.floor(a.x + (b.x - a.x) * t),
      z = Math.floor(a.z + (b.z - a.z) * t);
    if (x !== px || z !== pz) {
      if (Math.abs(x - px) > 1 || Math.abs(z - pz) > 1 || !stepOk(w, a.l, px, pz, x - px, z - pz)) return false;
      px = x;
      pz = z;
    }
  }
  return true;
}

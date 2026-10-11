import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Falt-Labyrinth: Das Raster "faltet" sich im Takt zwischen Phase A und Phase B.
 * Manche Wandstücke gibt es nur in einer der beiden Phasen. Für jede Phase ist das Labyrinth für sich lösbar
 * (aufspannender Baum), über die Zeit ergibt sich also immer ein Weg.
 *
 * Wandcodes: 0 = offen, 1 = immer Wand, 2 = Wand nur in Phase A, 3 = Wand nur in Phase B.
 */
export interface Maze {
  n: number;
  /** Senkrechte Linien x=i (i = 0..n) in Zeile j: vw[j*(n+1)+i] */
  vw: number[];
  /** Waagerechte Linien y=j (j = 0..n) in Spalte i: hw[j*n+i] */
  hw: number[];
  start: { x: number; y: number };
  goal: { x: number; y: number };
  check: { x: number; y: number };
}

export interface FaltState {
  seed: number;
  tick: number;
  maze: Maze;
  mazeIndex: number;
  /** 0 = Phase A, 1 = Phase B */
  phase: 0 | 1;
  phaseTick: number;
  mazeTick: number;
  /** Position in Zellkoordinaten (Zelle (i,j) umfasst [i,i+1] x [j,j+1], j wächst nach oben) */
  x: number;
  y: number;
  mazes: number;
  timeBonus: number;
  checkPts: number;
  checkHit: boolean;
  folds: number;
  checkCount: number;
  lastBonus: number;
  bumps: number;
}

export const DURATION_TICKS = 1800;
export const PHASE_TICKS = 210;
export const WARN_TICKS = 45;
export const SPEED = 3.4; // Zellen pro Sekunde
export const RADIUS = 0.23;
export const HALF_WALL = 0.07;
export const MAZE_POINTS = 100;
export const CHECK_POINTS = 15;
const PAR_SECONDS = 16;

export const mazeSize = (index: number): number => 7 + Math.min(2, index);
export const deriveSeed = (seed: number, index: number): number => (Math.imul(seed ^ 0x5bd1e995, 0x9e3779b1) + Math.imul(index + 1, 0x85ebca6b)) >>> 0;

export const isWall = (code: number, phase: number): boolean => code === 1 || (code === 2 && phase === 0) || (code === 3 && phase === 1);

interface Edge {
  a: number;
  b: number;
  line: 'v' | 'h';
  idx: number;
}

function allEdges(n: number): Edge[] {
  const e: Edge[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      if (i + 1 < n) e.push({ a: j * n + i, b: j * n + i + 1, line: 'v', idx: j * (n + 1) + i + 1 });
      if (j + 1 < n) e.push({ a: j * n + i, b: (j + 1) * n + i, line: 'h', idx: (j + 1) * n + i });
    }
  }
  return e;
}

class UnionFind {
  private p: number[];
  constructor(n: number) {
    this.p = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    let r = x;
    while (this.p[r] !== r) r = this.p[r]!;
    let c = x;
    while (this.p[c] !== r) {
      const nx = this.p[c]!;
      this.p[c] = r;
      c = nx;
    }
    return r;
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.p[ra] = rb;
    return true;
  }
}

/** Erzeugt ein Labyrinth (zwei aufspannende Bäume = zwei Phasen, die sich teilweise überlappen). */
export function makeMaze(seed: number, n: number): Maze {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = new Rng(seed + attempt * 7919);
    const edges = allEdges(n);
    const edgeOf = new Map<string, number>();
    edges.forEach((e, k) => edgeOf.set(`${e.a},${e.b}`, k));
    const keyOf = (a: number, b: number): number => edgeOf.get(a < b ? `${a},${b}` : `${b},${a}`) as number;
    // Phase A: zufälliger Tiefensuche-Baum
    const inA = new Set<number>();
    const seen = new Set<number>([0]);
    const stack = [0];
    while (stack.length) {
      const c = stack[stack.length - 1]!;
      const ci = c % n;
      const cj = Math.floor(c / n);
      const nb: number[] = [];
      if (ci > 0) nb.push(c - 1);
      if (ci < n - 1) nb.push(c + 1);
      if (cj > 0) nb.push(c - n);
      if (cj < n - 1) nb.push(c + n);
      const free = nb.filter((x) => !seen.has(x));
      if (!free.length) {
        stack.pop();
        continue;
      }
      const nx = r.pick(free);
      seen.add(nx);
      inA.add(keyOf(c, nx));
      stack.push(nx);
    }
    // Phase B: ein Teil von A bleibt (gemeinsame Gänge), der Rest wird neu verbunden
    const inB = new Set<number>();
    const uf = new UnionFind(n * n);
    for (const k of r.shuffle([...inA])) {
      if (r.chance(0.68)) {
        const e = edges[k]!;
        uf.union(e.a, e.b);
        inB.add(k);
      }
    }
    for (const k of r.shuffle(edges.map((_, i) => i))) {
      const e = edges[k]!;
      if (uf.union(e.a, e.b)) inB.add(k);
    }
    let diff = 0;
    for (const k of inA) if (!inB.has(k)) diff++;
    if (diff < Math.floor(n * 0.9) && attempt < 19) continue;
    const vw = new Array<number>(n * (n + 1)).fill(1);
    const hw = new Array<number>((n + 1) * n).fill(1);
    edges.forEach((e, k) => {
      const a = inA.has(k);
      const b = inB.has(k);
      let code = 1;
      if (a && b) code = 0;
      else if (a) code = 3; // Gang in A, Wand in B
      else if (b) code = 2; // Gang in B, Wand in A
      else if (r.chance(0.07)) code = 0; // zusätzliche Abkürzung
      if (e.line === 'v') vw[e.idx] = code;
      else hw[e.idx] = code;
    });
    const flip = r.chance(0.5);
    const start = flip ? { x: 0, y: n - 1 } : { x: 0, y: 0 };
    const goal = flip ? { x: n - 1, y: 0 } : { x: n - 1, y: n - 1 };
    const m: Maze = { n, vw, hw, start, goal, check: { x: 0, y: 0 } };
    // Checkpunkt: Mitte des Weges durch Phase A
    const path = pathCells(m, 0, start.y * n + start.x, goal.y * n + goal.x);
    const mid = path[Math.floor(path.length / 2)] ?? 0;
    m.check = { x: mid % n, y: Math.floor(mid / n) };
    return m;
  }
  throw new Error('unreachable');
}

/** Ist der Übergang von Zelle c in Richtung dir (0=+x, 1=-x, 2=+y, 3=-y) in dieser Phase offen? */
export function canMove(m: Maze, phase: number, c: number, dir: number): boolean {
  const n = m.n;
  const i = c % n;
  const j = Math.floor(c / n);
  if (dir === 0) return i < n - 1 && !isWall(m.vw[j * (n + 1) + i + 1]!, phase);
  if (dir === 1) return i > 0 && !isWall(m.vw[j * (n + 1) + i]!, phase);
  if (dir === 2) return j < n - 1 && !isWall(m.hw[(j + 1) * n + i]!, phase);
  return j > 0 && !isWall(m.hw[j * n + i]!, phase);
}
const DX = [1, -1, 0, 0];
const DY = [0, 0, 1, -1];
export const neighbour = (m: Maze, c: number, dir: number): number => c + DX[dir]! + DY[dir]! * m.n;

/** Kürzeste Entfernungen (in Zellen) von einer Zelle aus in einer festen Phase; -1 = unerreichbar */
export function distances(m: Maze, phase: number, from: number): number[] {
  const d = new Array<number>(m.n * m.n).fill(-1);
  d[from] = 0;
  const q = [from];
  for (let h = 0; h < q.length; h++) {
    const c = q[h]!;
    for (let dir = 0; dir < 4; dir++) {
      if (!canMove(m, phase, c, dir)) continue;
      const nx = neighbour(m, c, dir);
      if (d[nx] === -1) {
        d[nx] = d[c]! + 1;
        q.push(nx);
      }
    }
  }
  return d;
}

export function pathCells(m: Maze, phase: number, from: number, to: number): number[] {
  const prev = new Array<number>(m.n * m.n).fill(-1);
  const seen = new Array<boolean>(m.n * m.n).fill(false);
  seen[from] = true;
  const q = [from];
  for (let h = 0; h < q.length && !seen[to]; h++) {
    const c = q[h]!;
    for (let dir = 0; dir < 4; dir++) {
      if (!canMove(m, phase, c, dir)) continue;
      const nx = neighbour(m, c, dir);
      if (!seen[nx]) {
        seen[nx] = true;
        prev[nx] = c;
        q.push(nx);
      }
    }
  }
  if (!seen[to]) return [];
  const out = [to];
  while (out[0] !== from) out.unshift(prev[out[0]!]!);
  return out;
}

export const STEP_TICKS = Math.round(60 / SPEED);
const phaseAfter = (phase: number, phaseTick: number, t: number): number => (phase + Math.floor((phaseTick + t) / PHASE_TICKS)) & 1;

/**
 * Zeit-erweiterte Suche: kürzeste Anzahl Zellschritte (inkl. Warten) bis zum Ziel, wenn sich das Labyrinth
 * im Takt faltet. Liefert auch die erste Bewegung (Zielzelle des ersten Schritts, kann die eigene Zelle sein).
 */
export function timePlan(m: Maze, phase: number, phaseTick: number, from: number, maxSteps = 70): { steps: number; next: number } | null {
  const goal = m.goal.y * m.n + m.goal.x;
  if (from === goal) return { steps: 0, next: from };
  let cur = new Array<number>(m.n * m.n).fill(-1);
  for (let k = 0; k < maxSteps; k++) {
    const t0 = k * STEP_TICKS;
    const p0 = phaseAfter(phase, phaseTick, t0);
    const p1 = phaseAfter(phase, phaseTick, t0 + STEP_TICKS + 8);
    const nxt = new Array<number>(m.n * m.n).fill(-1);
    const sources: number[] = [];
    if (k === 0) sources.push(from);
    else for (let c = 0; c < cur.length; c++) if (cur[c]! >= 0) sources.push(c);
    // Zuerst Bewegungen, dann Warten – damit gleich schnelle Pläne ohne Warten bevorzugt werden
    for (const c of sources) {
      for (let dir = 0; dir < 4; dir++) {
        if (!canMove(m, p0, c, dir) || !canMove(m, p1, c, dir)) continue;
        const nx = neighbour(m, c, dir);
        if (nxt[nx] === -1) nxt[nx] = k === 0 ? nx : cur[c]!;
      }
    }
    for (const c of sources) if (nxt[c] === -1) nxt[c] = k === 0 ? c : cur[c]!;
    cur = nxt;
    if (cur[goal]! >= 0) return { steps: k + 1, next: cur[goal]! };
  }
  return null;
}

function newMaze(seed: number, index: number): Maze {
  return makeMaze(deriveSeed(seed, index), mazeSize(index));
}

/** Schiebt den Kreis aus Wänden heraus (Wand = Rechteck mit halber Dicke HALF_WALL) */
function resolve(s: FaltState): void {
  const m = s.maze;
  const n = m.n;
  for (let iter = 0; iter < 3; iter++) {
    const ci = Math.floor(s.x);
    const cj = Math.floor(s.y);
    const rects: number[] = [];
    for (let j = cj - 1; j <= cj + 1; j++) {
      for (let i = ci - 1; i <= ci + 2; i++) {
        if (i >= 0 && i <= n && j >= 0 && j < n && isWall(m.vw[j * (n + 1) + i]!, s.phase)) rects.push(i - HALF_WALL, j - HALF_WALL, i + HALF_WALL, j + 1 + HALF_WALL);
      }
    }
    for (let j = cj - 1; j <= cj + 2; j++) {
      for (let i = ci - 1; i <= ci + 1; i++) {
        if (j >= 0 && j <= n && i >= 0 && i < n && isWall(m.hw[j * n + i]!, s.phase)) rects.push(i - HALF_WALL, j - HALF_WALL, i + 1 + HALF_WALL, j + HALF_WALL);
      }
    }
    let moved = false;
    for (let k = 0; k < rects.length; k += 4) {
      const x0 = rects[k]!;
      const y0 = rects[k + 1]!;
      const x1 = rects[k + 2]!;
      const y1 = rects[k + 3]!;
      const qx = clamp(s.x, x0, x1);
      const qy = clamp(s.y, y0, y1);
      const dx = s.x - qx;
      const dy = s.y - qy;
      const d = Math.hypot(dx, dy);
      if (d < RADIUS) {
        moved = true;
        if (d > 1e-6) {
          s.x += (dx / d) * (RADIUS - d);
          s.y += (dy / d) * (RADIUS - d);
        } else {
          // Mittelpunkt liegt im Rechteck: auf der kürzesten Seite hinausschieben
          const l = s.x - x0;
          const rr = x1 - s.x;
          const b = s.y - y0;
          const t = y1 - s.y;
          const mn = Math.min(l, rr, b, t);
          if (mn === l) s.x = x0 - RADIUS;
          else if (mn === rr) s.x = x1 + RADIUS;
          else if (mn === b) s.y = y0 - RADIUS;
          else s.y = y1 + RADIUS;
        }
      }
    }
    if (!moved) break;
  }
  s.x = clamp(s.x, RADIUS, n - RADIUS);
  s.y = clamp(s.y, RADIUS, n - RADIUS);
}

const memo = new WeakMap<Maze, Map<number, number>>();

export const game: MiniGame<FaltState> = {
  id: 'faltlabyrinth',
  name: 'Falt-Labyrinth',
  tagline: 'Das Labyrinth faltet sich – Wände kommen und gehen!',
  instructions: [
    'Laufe vom grünen Start zum goldenen Ziel. Jedes geschaffte Labyrinth bringt 100 Punkte.',
    'Alle paar Sekunden faltet sich das Labyrinth: Manche Wände gibt es nur in Phase A (blau), andere nur in Phase B (orange).',
    'Wenn die Falte naht, leuchten die betroffenen Wände auf. Warte im sicheren Gang oder nutze den Wechsel zu deinem Vorteil.',
    'Der Checkpunkt in der Mitte und schnelle Zeiten geben Bonuspunkte. Danach folgt gleich das nächste Labyrinth.',
  ],
  controls: { desktop: 'WASD oder Pfeile = laufen', touch: 'Stick = laufen' },
  category: 'puzzle',
  duration: 30,
  touch: { stick: true, a: false, b: false },
  init(seed) {
    const maze = newMaze(seed, 0);
    return {
      seed,
      tick: 0,
      maze,
      mazeIndex: 0,
      phase: 0,
      phaseTick: 0,
      mazeTick: 0,
      x: maze.start.x + 0.5,
      y: maze.start.y + 0.5,
      mazes: 0,
      timeBonus: 0,
      checkPts: 0,
      checkHit: false,
      folds: 0,
      checkCount: 0,
      lastBonus: 0,
      bumps: 0,
    };
  },
  step(s, input) {
    if (s.tick >= DURATION_TICKS) return;
    s.tick++;
    s.mazeTick++;
    s.phaseTick++;
    if (s.phaseTick >= PHASE_TICKS) {
      s.phaseTick = 0;
      s.phase = s.phase === 0 ? 1 : 0;
      s.folds++;
    }
    let ix = clamp(Number.isFinite(input.x) ? input.x : 0, -1, 1);
    let iy = clamp(Number.isFinite(input.y) ? input.y : 0, -1, 1);
    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    s.x += (ix * SPEED) / 60;
    s.y += (iy * SPEED) / 60;
    resolve(s);
    const m = s.maze;
    if (!s.checkHit && Math.hypot(s.x - (m.check.x + 0.5), s.y - (m.check.y + 0.5)) < 0.4) {
      s.checkHit = true;
      s.checkPts += CHECK_POINTS;
      s.checkCount++;
    }
    if (Math.hypot(s.x - (m.goal.x + 0.5), s.y - (m.goal.y + 0.5)) < 0.32) {
      const sec = s.mazeTick / 60;
      s.lastBonus = clamp(Math.round((PAR_SECONDS - sec) * 3), 0, 45);
      s.timeBonus += s.lastBonus;
      s.mazes++;
      s.mazeIndex++;
      s.maze = newMaze(s.seed, s.mazeIndex);
      s.phase = 0;
      s.phaseTick = 0;
      s.mazeTick = 0;
      s.checkHit = false;
      s.x = s.maze.start.x + 0.5;
      s.y = s.maze.start.y + 0.5;
    }
  },
  done: (s) => s.tick >= DURATION_TICKS,
  score: (s) => s.mazes * MAZE_POINTS + s.timeBonus + s.checkPts,
  bot(s, skill, rng): InputFrame {
    // Kurze Unentschlossenheit der schwächeren Spieler
    if (rng.next() < (1 - skill) * 0.3) return { ...NEUTRAL_INPUT };
    const m = s.maze;
    const n = m.n;
    const ci = clamp(Math.floor(s.x), 0, n - 1);
    const cj = clamp(Math.floor(s.y), 0, n - 1);
    const c = cj * n + ci;
    let next = c;
    if (skill > 0.35) {
      // Plan über die Zeit (mit Zwischenspeicher je Labyrinth, Phase, Zelle und Zeitfenster)
      let cache = memo.get(m);
      if (!cache) {
        cache = new Map();
        memo.set(m, cache);
      }
      const key = (c * 2 + s.phase) * 64 + Math.floor(s.phaseTick / 4);
      let v = cache.get(key);
      if (v === undefined) {
        const p = timePlan(m, s.phase, s.phaseTick, c);
        v = p ? p.next : -1;
        cache.set(key, v);
      }
      next = v;
    }
    if (next < 0 || skill <= 0.35) {
      // Einfache Wegsuche nur für die aktuelle Phase
      const d = distances(m, s.phase, m.goal.y * n + m.goal.x);
      let bestD = d[c]!;
      next = c;
      for (let dir = 0; dir < 4; dir++) {
        if (!canMove(m, s.phase, c, dir)) continue;
        const nx = neighbour(m, c, dir);
        if (d[nx]! >= 0 && d[nx]! < bestD) {
          bestD = d[nx]!;
          next = nx;
        }
      }
    }
    const tx = (next % n) + 0.5;
    const ty = Math.floor(next / n) + 0.5;
    const cx = ci + 0.5;
    const cy = cj + 0.5;
    const gain = lerp(0.7, 1, skill);
    const horiz = next % n !== ci;
    const vert = Math.floor(next / n) !== cj;
    let ox = 0;
    let oy = 0;
    if (horiz) {
      if (Math.abs(s.y - cy) > 0.1) oy = clamp((cy - s.y) * 8, -1, 1);
      else ox = Math.sign(tx - s.x);
    } else if (vert) {
      if (Math.abs(s.x - cx) > 0.1) ox = clamp((cx - s.x) * 8, -1, 1);
      else oy = Math.sign(ty - s.y);
    } else {
      ox = clamp((cx - s.x) * 8, -1, 1);
      oy = clamp((cy - s.y) * 8, -1, 1);
    }
    return { ...NEUTRAL_INPUT, x: ox * gain, y: oy * gain };
  },
  hud: (s) => {
    const left = PHASE_TICKS - s.phaseTick;
    return {
      left: `${s.mazes} Labyrinthe`,
      right: `${Math.max(0, Math.ceil((DURATION_TICKS - s.tick) / 60))} s`,
      hint: left <= WARN_TICKS ? 'Faltung!' : `Phase ${s.phase === 0 ? 'A' : 'B'} · Faltung in ${Math.ceil(left / 60)} s`,
    };
  },
};

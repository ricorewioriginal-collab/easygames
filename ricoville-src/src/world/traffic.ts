// Bewegung auf dem Straßengraphen: Autos fahren rechts, Fußgänger auf dem Gehweg.
// Reine Logik (keine Three.js-Abhängigkeit), damit Sackgassen/Kreuzungen testbar sind.

export interface Walker {
  x: number;
  y: number;
  px: number;
  py: number;
  nx: number;
  ny: number;
  t: number;
  speed: number;
  side: number;
}

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function neighbors(roads: Set<string>, x: number, y: number): [number, number][] {
  const out: [number, number][] = [];
  for (const [dx, dy] of DIRS) if (roads.has(`${x + dx},${y + dy}`)) out.push([x + dx, y + dy]);
  return out;
}

/** Wählt das nächste Feld: nie zurück, außer in der Sackgasse (dann wenden statt einfrieren). */
export function nextTile(roads: Set<string>, w: Walker, rnd: () => number): [number, number] {
  const n = neighbors(roads, w.nx, w.ny);
  const forward = n.filter(([x, y]) => !(x === w.x && y === w.y));
  const opts = forward.length ? forward : n;
  if (!opts.length) return [w.nx, w.ny];
  return opts[Math.floor(rnd() * opts.length)]!;
}

/** Schreitet voran; gibt false zurück, wenn der Walker vom Netz entfernt wurde (Straße abgerissen). */
export function step(roads: Set<string>, w: Walker, dt: number, rnd: () => number): boolean {
  if (!roads.has(`${w.nx},${w.ny}`) || !roads.has(`${w.x},${w.y}`)) return false;
  w.t += dt * w.speed;
  let guard = 0;
  while (w.t >= 1 && guard++ < 4) {
    w.t -= 1;
    const [nx, ny] = nextTile(roads, w, rnd);
    w.px = w.x;
    w.py = w.y;
    w.x = w.nx;
    w.y = w.ny;
    w.nx = nx;
    w.ny = ny;
  }
  return true;
}

/** Weltposition (Feldmitte + seitlicher Versatz in Fahrtrichtung rechts). */
export function position(w: Walker): { x: number; z: number; angle: number } {
  const dx = w.nx - w.x;
  const dy = w.ny - w.y;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * w.side;
  const oz = (dx / len) * w.side;
  return {
    x: w.x + 0.5 + dx * w.t + ox,
    z: w.y + 0.5 + dy * w.t + oz,
    angle: Math.atan2(-dy, dx),
  };
}

export function spawn(roads: string[], rnd: () => number, speed: number, side: number): Walker | null {
  if (!roads.length) return null;
  const set = new Set(roads);
  for (let i = 0; i < 8; i++) {
    const k = roads[Math.floor(rnd() * roads.length)]!;
    const [x, y] = k.split(',').map(Number) as [number, number];
    const n = neighbors(set, x, y);
    if (!n.length) continue;
    const [nx, ny] = n[Math.floor(rnd() * n.length)]!;
    return { x, y, px: x, py: y, nx, ny, t: rnd(), speed, side };
  }
  return null;
}

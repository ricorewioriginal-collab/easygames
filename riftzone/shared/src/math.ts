// Kleine, deterministische Mathe-Helfer. Werden von Client, Worker und Server identisch genutzt.

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number): number => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const TAU = Math.PI * 2;

/** Winkel in den Bereich (-PI, PI] bringen. */
export function wrapAngle(a: number): number {
  a = a % TAU;
  if (a > Math.PI) a -= TAU;
  else if (a <= -Math.PI) a += TAU;
  return a;
}

export function angleDiff(a: number, b: number): number {
  return wrapAngle(b - a);
}

export function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDiff(a, b) * t;
}

export const dist2 = (ax: number, az: number, bx: number, bz: number): number => {
  const dx = ax - bx,
    dz = az - bz;
  return dx * dx + dz * dz;
};
export const dist = (ax: number, az: number, bx: number, bz: number): number => Math.sqrt(dist2(ax, az, bx, bz));
export const dist3 = (ax: number, ay: number, az: number, bx: number, by: number, bz: number): number => {
  const dx = ax - bx,
    dy = ay - by,
    dz = az - bz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/** Mulberry32 – schneller, reproduzierbarer Zufall. */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 0x9e3779b9;
  }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number): number {
    return a + Math.floor(this.next() * (b - a + 1));
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  /** Gewichtete Auswahl: Gewichte >= 0. */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    let sum = 0;
    for (const w of weights) sum += w;
    let r = this.next() * sum;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return items[i]!;
    }
    return items[items.length - 1]!;
  }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = t;
    }
    return arr;
  }
  get state(): number {
    return this.s;
  }
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---- Rauschen (Value-Noise mit glatter Interpolation) ----

function hash2(ix: number, iz: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function valueNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x),
    iz = Math.floor(z);
  const fx = x - ix,
    fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx),
    uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz, seed),
    b = hash2(ix + 1, iz, seed),
    c = hash2(ix, iz + 1, seed),
    d = hash2(ix + 1, iz + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uz) * 2 - 1;
}

export function fbm(x: number, z: number, seed: number, octaves = 4, lac = 2, gain = 0.5): number {
  let amp = 1,
    freq = 1,
    sum = 0,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, z * freq, seed + o * 101);
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm;
}

/** Abstand eines Punkts zu einem Polygonzug (2D) und Parameter entlang des Zugs. */
export function distToPolyline(px: number, pz: number, pts: readonly (readonly [number, number])[]): number {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i]!;
    const [bx, bz] = pts[i + 1]!;
    const dx = bx - ax,
      dz = bz - az;
    const l2 = dx * dx + dz * dz || 1;
    const t = clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1);
    const d = dist2(px, pz, ax + dx * t, az + dz * t);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** Kleiner, deterministischer Zufallsgenerator (mulberry32). Der Zustand ist eine einzige Zahl und lässt sich speichern. */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  get state(): number {
    return this.s;
  }
  set state(v: number) {
    this.s = v >>> 0;
  }
  /** Gleichverteilt in [0, 1) */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** Ganzzahl in [0, n) */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
  /** Ganzzahl in [a, b] (beide inklusive) */
  range(a: number, b: number): number {
    return a + this.int(b - a + 1);
  }
  float(a: number, b: number): number {
    return a + this.next() * (b - a);
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: leeres Array');
    return arr[this.int(arr.length)] as T;
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      const t = a[i] as T;
      a[i] = a[j] as T;
      a[j] = t;
    }
    return a;
  }
  /** Näherungsweise normalverteilt (Mittelwert 0, Streuung 1) */
  gaussian(): number {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 1.7320508;
  }
  /** Abgeleiteter, unabhängiger Generator (für Teilsysteme) */
  fork(salt: number): Rng {
    return new Rng((this.s ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0);
  }
}

/** Zufälliger Startwert (Browser und Node) */
export function randomSeed(): number {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (c?.getRandomValues) return c.getRandomValues(new Uint32Array(1))[0] as number;
  return (Math.random() * 4294967296) >>> 0;
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

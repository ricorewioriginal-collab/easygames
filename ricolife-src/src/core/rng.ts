// Deterministischer Zufall (mulberry32) – für reproduzierbare Tests und gleiche Welt bei gleichem Seed.
export class Rng {
  private s: number;
  constructor(seed = 1) {
    this.s = seed >>> 0 || 1;
  }
  get state(): number {
    return this.s;
  }
  set state(v: number) {
    this.s = v >>> 0 || 1;
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
    return Math.floor(this.range(a, b + 1));
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }
  weighted<T>(arr: readonly T[], w: (x: T) => number): T | undefined {
    let sum = 0;
    for (const x of arr) sum += Math.max(0, w(x));
    if (sum <= 0) return undefined;
    let r = this.next() * sum;
    for (const x of arr) {
      r -= Math.max(0, w(x));
      if (r <= 0) return x;
    }
    return arr[arr.length - 1];
  }
}

/** Einfacher String-Hash (FNV-1a) für stabile Ableitungen aus IDs */
export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

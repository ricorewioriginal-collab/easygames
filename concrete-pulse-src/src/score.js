// Combo-Wertung: Summe der Trickpunkte × Anzahl Tricks. Wiederholte Tricks in einer Combo zählen weniger.
const DECAY = [1, 0.75, 0.5, 0.3, 0.15, 0.1];
export class Combo {
  constructor() { this.reset(); }
  reset() { this.list = []; this.counts = {}; this.sum = 0; }
  get active() { return this.list.length > 0; }
  get mult() { return this.list.length; }
  get value() { return Math.round(this.sum) * Math.max(1, this.mult); }
  add(name, pts, key) {
    const k = key || name, n = this.counts[k] || 0; this.counts[k] = n + 1;
    const f = DECAY[Math.min(n, DECAY.length - 1)];
    const e = { name, pts: pts * f, f };
    this.list.push(e); this.sum += e.pts; return e;
  }
  live(e, d) { const v = d * e.f; e.pts += v; this.sum += v; }
  rename(e, name) { e.name = name; }
  bonus(e, pts) { const v = pts * e.f; e.pts += v; this.sum += v; }
  text(max = 6) {
    const L = this.list, s = L.slice(-max).map(e => e.name).join(' + ');
    return (L.length > max ? '… + ' : '') + s;
  }
}

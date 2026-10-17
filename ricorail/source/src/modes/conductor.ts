// Schaffner-Modus: Fahrgäste auf Sitzplätzen, ihre Fahrkarten, Kontrolle und Wertung.
// Reine Spiellogik ohne 3D (testbar); die Darstellung baut engine/interior.ts.

export interface Seat { x: number; z: number; /** Blickrichtung entlang des Wagens */ face: 1 | -1 }
export interface CarInfo { idx: number; len: number; cab: boolean; first: boolean; seats: Seat[] }
export interface Ticket { kind: string; from: string; to: string; cls: 1 | 2; date: string }
export interface Rider {
  id: number; car: number; seat: number; look: number;
  /** Halt (Index im Fahrplan), an dem der Fahrgast aussteigt */
  off: number;
  ticket: Ticket | null; ok: boolean; why: string; checked: boolean;
}
export interface StopInfo { name: string; pass: boolean }
export interface Verdict { correct: boolean; pts: number; msg: string }

/** Gangbereich eines Wagens (lokale x-Koordinate, +x = Fahrzeugspitze; dort liegt ggf. der Führerstand) */
export function walkRange(len: number, cab: boolean): [number, number] {
  return [-len / 2 + 1.2, len / 2 - (cab ? 4.2 : 1.2)];
}

/** Sitzreihen 2+2 mit Mittelgang; die Hälften blicken zur Wagenmitte */
export function seatLayout(len: number, cab: boolean): Seat[] {
  const [a, b] = walkRange(len, cab);
  const out: Seat[] = [];
  const pitch = 1.9;
  const n = Math.max(1, Math.floor((b - a - 1.6) / pitch) + 1);
  const x0 = (a + b) / 2 - ((n - 1) * pitch) / 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * pitch, face: 1 | -1 = x < (a + b) / 2 ? 1 : -1;
    for (const z of [-1.05, -0.58, 0.58, 1.05]) out.push({ x, z, face });
  }
  return out;
}

const KINDS = ['Einzelfahrkarte', 'Einzelfahrkarte', 'Tageskarte', 'Monatskarte'];
const pad = (n: number) => String(n).padStart(2, '0');
export const dateStr = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

/** kleiner, reproduzierbarer Zufall */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export class Conductor {
  riders: Rider[] = [];
  /** steigt bei jeder Änderung der Fahrgäste (3D neu aufbauen) */
  version = 0;
  stats = { checked: 0, right: 0, caught: 0, pts: 0 };
  readonly today: string;
  private yesterday: string;
  private rnd: () => number;
  private nextId = 1;
  private at = 0;

  constructor(readonly cars: CarInfo[], readonly stops: StopInfo[], now = new Date(), seed = 1) {
    this.rnd = rng(seed);
    this.today = dateStr(now);
    this.yesterday = dateStr(new Date(now.getTime() - 86400000));
  }

  private pick<T>(a: T[]): T { return a[Math.floor(this.rnd() * a.length) % a.length]; }
  /** Halte mit Fahrgastwechsel ab Index i (Durchfahrten zählen nicht) */
  private stopIdx(from: number, to: number): number[] { const r: number[] = []; for (let i = Math.max(0, from); i <= to && i < this.stops.length; i++) if (!this.stops[i].pass) r.push(i); return r; }

  /** Besetzung herstellen; at = Index des zuletzt erreichten Halts, occ = Auslastung 0..1 */
  fill(at: number, occ: number) {
    this.at = at;
    const ahead = this.stopIdx(at + 1, this.stops.length - 1);
    if (!ahead.length) return;
    const o = Math.max(0.2, Math.min(0.85, occ));
    for (const car of this.cars) {
      const taken = new Set(this.riders.filter((r) => r.car === car.idx).map((r) => r.seat));
      const want = Math.max(3, Math.round(car.seats.length * o));
      const free = car.seats.map((_, i) => i).filter((i) => !taken.has(i));
      while (taken.size < Math.min(want, car.seats.length) && free.length) {
        const k = free.splice(Math.floor(this.rnd() * free.length) % free.length, 1)[0];
        taken.add(k);
        this.riders.push(this.makeRider(car, k, at, ahead));
      }
    }
    this.version++;
  }

  private makeRider(car: CarInfo, seat: number, at: number, ahead: number[]): Rider {
    const off = this.pick(ahead);
    const before = this.stopIdx(0, at);
    const from = before.length ? this.pick(before) : at;
    const name = (i: number) => this.stops[i]?.name ?? '?';
    const r: Rider = { id: this.nextId++, car: car.idx, seat, look: Math.floor(this.rnd() * 1e6), off, ticket: null, ok: true, why: '', checked: false };
    const t: Ticket = { kind: this.pick(KINDS), from: name(from), to: name(this.pick(ahead.filter((i) => i >= off))), cls: car.first || this.rnd() < 0.15 ? 1 : 2, date: this.today };
    r.ticket = t;
    // gut ein Viertel der Fahrgäste hat ein Problem mit der Fahrkarte
    if (this.rnd() < 0.28) {
      const passed = this.stopIdx(from + 1, at);
      const opts: string[] = ['none', 'date'];
      if (car.first) opts.push('class', 'class');
      if (passed.length && t.kind === 'Einzelfahrkarte') opts.push('route', 'route');
      const p = this.pick(opts);
      r.ok = false;
      if (p === 'none') { r.ticket = null; r.why = 'Der Fahrgast hat keine Fahrkarte.'; }
      else if (p === 'date') { t.date = this.yesterday; t.kind = t.kind === 'Monatskarte' ? 'Tageskarte' : t.kind; r.why = `Die Fahrkarte galt nur am ${this.yesterday}.`; }
      else if (p === 'class') { t.cls = 2; r.why = 'Fahrkarte 2. Klasse, der Fahrgast sitzt aber in der 1. Klasse.'; }
      else { t.to = name(this.pick(passed)); r.why = `Die Fahrkarte gilt nur bis ${t.to} – weiter darf der Fahrgast damit nicht fahren.`; }
    }
    return r;
  }

  /** Halt erreicht: Fahrgäste mit diesem Ziel steigen aus, neue steigen ein */
  arrive(at: number, occ: number) {
    if (at <= this.at) return;
    const before = this.riders.length;
    this.riders = this.riders.filter((r) => r.off > at);
    if (this.riders.length !== before) this.version++;
    this.fill(at, occ);
  }

  /** nächster noch nicht kontrollierter Fahrgast in Reichweite */
  near(car: number, x: number, reach = 1.3): Rider | null {
    let best: Rider | null = null, bd = reach;
    const info = this.cars.find((c) => c.idx === car); if (!info) return null;
    for (const r of this.riders) {
      if (r.car !== car || r.checked) continue;
      const d = Math.abs(info.seats[r.seat].x - x);
      if (d <= bd) { bd = d; best = r; }
    }
    return best;
  }

  /** Entscheidung des Schaffners: gültig (true) oder nicht (false) */
  judge(r: Rider, valid: boolean): Verdict {
    if (r.checked) return { correct: true, pts: 0, msg: '' };
    r.checked = true; this.version++;
    const s = this.stats; s.checked++;
    let v: Verdict;
    if (valid && r.ok) v = { correct: true, pts: 10, msg: 'Richtig – Fahrkarte gültig. Gute Fahrt!' };
    else if (!valid && !r.ok) { s.caught++; v = { correct: true, pts: 25, msg: `Gut aufgepasst! ${r.why} Fahrpreis nacherhoben.` }; }
    else if (!valid) v = { correct: false, pts: -20, msg: 'Die Fahrkarte war gültig – der Fahrgast beschwert sich.' };
    else v = { correct: false, pts: -15, msg: `Übersehen: ${r.why}` };
    if (v.correct) s.right++;
    s.pts += v.pts;
    return v;
  }

  left(): number { return this.riders.filter((r) => !r.checked).length; }
}

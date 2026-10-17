// Laufzeit-Gleisgraph: Geometrie-Abfragen, Weichenlogik, Bewegung entlang des Graphen, Wegsuche.
import type { Dir, NetworkDef, NodeDef, SignalDef, SwitchDef, TrackDef, TrackPos } from './schema';

export interface PointInfo { x: number; y: number; z: number; /** Richtung (Einheitsvektor) in Gleisrichtung a→b */ dx: number; dy: number; dz: number }

export class Track {
  readonly id: string;
  readonly def: TrackDef;
  readonly px: Float64Array; readonly py: Float64Array; readonly pz: Float64Array;
  /** kumulierte Bogenlänge je Stützpunkt */
  readonly cs: Float64Array;
  /** Krümmung (1/R, vorzeichenbehaftet: + = Linksbogen in a→b) je Stützpunkt */
  readonly k: Float64Array;
  readonly len: number;
  constructor(def: TrackDef) {
    this.id = def.id; this.def = def;
    const n = Math.floor(def.pts.length / 3);
    if (n < 2) throw new Error(`Gleis ${def.id}: mindestens zwei Punkte nötig`);
    this.px = new Float64Array(n); this.py = new Float64Array(n); this.pz = new Float64Array(n);
    this.cs = new Float64Array(n); this.k = new Float64Array(n);
    for (let i = 0; i < n; i++) { this.px[i] = def.pts[i * 3]; this.py[i] = def.pts[i * 3 + 1]; this.pz[i] = def.pts[i * 3 + 2]; }
    for (let i = 1; i < n; i++) {
      const dx = this.px[i] - this.px[i - 1], dy = this.py[i] - this.py[i - 1], dz = this.pz[i] - this.pz[i - 1];
      this.cs[i] = this.cs[i - 1] + Math.max(1e-6, Math.hypot(dx, dy, dz));
    }
    this.len = this.cs[n - 1];
    for (let i = 1; i < n - 1; i++) {
      const ax = this.px[i] - this.px[i - 1], az = this.pz[i] - this.pz[i - 1];
      const bx = this.px[i + 1] - this.px[i], bz = this.pz[i + 1] - this.pz[i];
      const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz), lc = Math.hypot(this.px[i + 1] - this.px[i - 1], this.pz[i + 1] - this.pz[i - 1]);
      const cross = ax * bz - az * bx; // x=Ost, z=Süd: cross<0 = Linksbogen aus Fahrersicht
      const denom = la * lb * lc;
      this.k[i] = denom > 1e-9 ? (-2 * cross) / denom : 0;
    }
  }
  /** Segmentindex i mit cs[i] <= s < cs[i+1] */
  seg(s: number): number {
    const cs = this.cs; let lo = 0, hi = cs.length - 2;
    if (s <= 0) return 0; if (s >= this.len) return hi;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (cs[m] <= s) lo = m; else hi = m - 1; }
    return lo;
  }
  point(s: number, out?: PointInfo): PointInfo {
    const o = out ?? { x: 0, y: 0, z: 0, dx: 1, dy: 0, dz: 0 };
    const i = this.seg(s), l = this.cs[i + 1] - this.cs[i];
    const f = Math.min(1, Math.max(0, (s - this.cs[i]) / l));
    const dx = this.px[i + 1] - this.px[i], dy = this.py[i + 1] - this.py[i], dz = this.pz[i + 1] - this.pz[i];
    o.x = this.px[i] + dx * f; o.y = this.py[i] + dy * f; o.z = this.pz[i] + dz * f;
    o.dx = dx / l; o.dy = dy / l; o.dz = dz / l;
    return o;
  }
  /** Steigung (dy/ds) in Richtung a→b */
  grade(s: number): number { const i = this.seg(s); return (this.py[i + 1] - this.py[i]) / (this.cs[i + 1] - this.cs[i]); }
  /** Bogenradius in m (Infinity = gerade) */
  radius(s: number): number {
    const i = this.seg(s), f = (s - this.cs[i]) / (this.cs[i + 1] - this.cs[i]);
    const k = Math.abs(this.k[i] * (1 - f) + this.k[i + 1] * f);
    return k < 1e-6 ? Infinity : 1 / k;
  }
}

export interface Signal { def: SignalDef; id: string; track: string; dir: Dir; s: number }
export interface Step { t: string; d: Dir }
export interface MoveResult { pos: TrackPos; /** nicht zurückgelegter Rest (Gleisende/Prellbock) */ rest: number; entered: Step[]; blocked: 'buffer' | 'switch' | null }

type End = `${string}|${'a' | 'b'}`;
const endKey = (t: string, e: 'a' | 'b'): End => `${t}|${e}`;

export class Network {
  readonly def: NetworkDef;
  readonly tracks = new Map<string, Track>();
  readonly switches = new Map<string, SwitchDef & { state: number }>();
  readonly switchAt = new Map<string, SwitchDef & { state: number }>();
  readonly signals = new Map<string, Signal>();
  /** Signale je Gleis */
  readonly signalsOn = new Map<string, Signal[]>();
  /** Gleisenden je Knoten */
  readonly ends = new Map<string, End[]>();
  readonly nodeDefs = new Map<string, NodeDef>();
  /** Weichen, deren Zustand nicht geändert werden darf (gesperrt durch Fahrstraße o. ä.) – vom Stellwerk verwaltet */
  lockCheck: ((sw: string) => string | null) | null = null;
  /** Gestörte Weichen (lassen sich nicht umstellen) */
  readonly failed = new Set<string>();
  version = 0;

  constructor(def: NetworkDef) {
    this.def = def;
    for (const n of def.nodes) this.nodeDefs.set(n.id, n);
    const nodes = this.nodeDefs;
    for (const td of def.tracks) {
      if (!nodes.has(td.a) || !nodes.has(td.b)) throw new Error(`Gleis ${td.id}: Knoten fehlt`);
      if (this.tracks.has(td.id)) throw new Error(`Gleis ${td.id} doppelt`);
      this.tracks.set(td.id, new Track(td));
      this.pushEnd(td.a, endKey(td.id, 'a')); this.pushEnd(td.b, endKey(td.id, 'b'));
    }
    for (const sd of def.switches) {
      const sw = { ...sd, legs: [...sd.legs], state: sd.state ?? 0 };
      this.switches.set(sd.id, sw); this.switchAt.set(sd.node, sw);
    }
    for (const sd of def.signals) {
      const tr = this.tracks.get(sd.track); if (!tr) throw new Error(`Signal ${sd.id}: Gleis ${sd.track} fehlt`);
      const off = Math.min(sd.off ?? 12, tr.len * 0.5);
      const sig: Signal = { def: sd, id: sd.id, track: sd.track, dir: sd.dir, s: sd.dir > 0 ? tr.len - off : off };
      this.signals.set(sd.id, sig);
      const arr = this.signalsOn.get(sd.track) ?? []; arr.push(sig); this.signalsOn.set(sd.track, arr);
    }
  }
  private pushEnd(n: string, e: End) { const a = this.ends.get(n) ?? []; a.push(e); this.ends.set(n, a); }

  track(id: string): Track { const t = this.tracks.get(id); if (!t) throw new Error(`Gleis ${id} unbekannt`); return t; }
  nodeOf(t: string, d: Dir): string { const td = this.track(t).def; return d > 0 ? td.b : td.a; }

  /** Verbindung beim Verlassen von Gleis t in Richtung d. null = Prellbock/Gleisende. 'switch' = gegen die Weiche (stumpf, falsche Lage). */
  next(t: string, d: Dir, ignoreSwitch = false): Step | null | 'wrong' {
    const node = this.nodeOf(t, d);
    const ends = this.ends.get(node) ?? [];
    const sw = this.switchAt.get(node);
    const toStep = (e: End): Step => { const [tid, ee] = e.split('|') as [string, 'a' | 'b']; return { t: tid, d: ee === 'a' ? 1 : -1 }; };
    if (sw) {
      if (t === sw.trunk) { const leg = sw.legs[sw.state]; return leg ? { t: leg, d: this.track(leg).def.a === node ? 1 : -1 } : null; }
      const li = sw.legs.indexOf(t);
      if (li >= 0) {
        if (li !== sw.state && !ignoreSwitch) return 'wrong';
        return { t: sw.trunk, d: this.track(sw.trunk).def.a === node ? 1 : -1 };
      }
    }
    const def = this.nodeDefs.get(node);
    if (def?.pairs) {
      for (const [p, q] of def.pairs) {
        if (p === t) return { t: q, d: this.track(q).def.a === node ? 1 : -1 };
        if (q === t) return { t: p, d: this.track(p).def.a === node ? 1 : -1 };
      }
    }
    const self = endKey(t, d > 0 ? 'b' : 'a');
    const others = ends.filter((e) => e !== self);
    if (others.length === 1) return toStep(others[0]);
    return null;
  }

  /** Alle möglichen Fortsetzungen (für Fahrstraßen/Wegsuche) mit nötiger Weichenstellung */
  options(t: string, d: Dir): { step: Step; sw?: string; state?: number }[] {
    const node = this.nodeOf(t, d);
    const sw = this.switchAt.get(node);
    if (sw) {
      if (t === sw.trunk) return sw.legs.map((leg, i) => ({ step: { t: leg, d: this.track(leg).def.a === node ? 1 : -1 }, sw: sw.id, state: i }));
      const li = sw.legs.indexOf(t);
      if (li >= 0) return [{ step: { t: sw.trunk, d: this.track(sw.trunk).def.a === node ? 1 : -1 }, sw: sw.id, state: li }];
    }
    const n = this.next(t, d, true);
    return n && n !== 'wrong' ? [{ step: n }] : [];
  }

  setSwitch(id: string, state: number): string | null {
    const sw = this.switches.get(id); if (!sw) return 'Weiche unbekannt';
    if (state < 0 || state >= sw.legs.length) return 'Ungültige Lage';
    if (sw.state === state) return null;
    if (this.failed.has(id)) return 'Weichenstörung – Weiche lässt sich nicht umstellen';
    const lock = this.lockCheck?.(id); if (lock) return lock;
    sw.state = state; this.version++;
    return null;
  }

  pos(p: TrackPos, out?: PointInfo): PointInfo {
    const o = this.track(p.t).point(p.s, out);
    if (p.d < 0) { o.dx = -o.dx; o.dy = -o.dy; o.dz = -o.dz; }
    return o;
  }
  /** Steigung in Fahrtrichtung */
  gradeAt(p: TrackPos): number { return this.track(p.t).grade(p.s) * p.d; }

  /** Bewegt eine Position um dist (>=0) in Fahrtrichtung. Bleibt am Prellbock oder vor falsch liegender Weiche nicht stehen: Rest wird gemeldet. */
  move(p: TrackPos, dist: number, trailThrough = true): MoveResult {
    let t = p.t, s = p.s, d = p.d; let rest = dist; const entered: Step[] = [];
    for (let guard = 0; guard < 10000; guard++) {
      const tr = this.track(t);
      const room = d > 0 ? tr.len - s : s;
      if (rest <= room) { s += rest * d; return { pos: { t, s, d }, rest: 0, entered, blocked: null }; }
      rest -= room; s = d > 0 ? tr.len : 0;
      const n = this.next(t, d, trailThrough);
      if (n === null) return { pos: { t, s, d }, rest, entered, blocked: 'buffer' };
      if (n === 'wrong') return { pos: { t, s, d }, rest, entered, blocked: 'switch' };
      t = n.t; d = n.d; s = d > 0 ? 0 : this.track(t).len;
      entered.push({ t, d });
    }
    throw new Error('move: Endlosschleife im Gleisgraph');
  }

  /** Wegsuche (Dijkstra über Gleise) – liefert Gleisfolge mit Richtungen, beginnend mit dem Startgleis */
  route(from: TrackPos, toTrack: string, opts: { allowReverse?: boolean } = {}): Step[] | null {
    type Q = { key: string; cost: number; step: Step };
    const dist = new Map<string, number>(); const prev = new Map<string, string | null>();
    const k = (s: Step) => `${s.t}|${s.d}`;
    const start: Step = { t: from.t, d: from.d };
    const q: Q[] = [{ key: k(start), cost: 0, step: start }]; dist.set(k(start), 0); prev.set(k(start), null);
    if (opts.allowReverse) { const r: Step = { t: from.t, d: (from.d * -1) as Dir }; q.push({ key: k(r), cost: 50, step: r }); dist.set(k(r), 50); prev.set(k(r), null); }
    while (q.length) {
      let bi = 0; for (let i = 1; i < q.length; i++) if (q[i].cost < q[bi].cost) bi = i;
      const cur = q.splice(bi, 1)[0];
      if (cur.cost > (dist.get(cur.key) ?? Infinity)) continue;
      if (cur.step.t === toTrack) {
        const path: Step[] = []; let key: string | null = cur.key;
        while (key) { const [t, d] = key.split('|'); path.unshift({ t, d: Number(d) as Dir }); key = prev.get(key) ?? null; }
        return path;
      }
      for (const o of this.options(cur.step.t, cur.step.d)) {
        const td = this.track(o.step.t);
        const nk = k(o.step), c = cur.cost + td.len * (td.def.pref && td.def.pref !== o.step.d ? 4 : 1) + (o.state ? 150 : 0);
        if (c < (dist.get(nk) ?? Infinity)) { dist.set(nk, c); prev.set(nk, cur.key); q.push({ key: nk, cost: c, step: o.step }); }
      }
    }
    return null;
  }

  /** Gewichtete Kosten einer Gleisfolge (Falschfahrbetrieb ×4, abzweigende Weichen +150 m) */
  pathCost(path: Step[]): number {
    let c = 0;
    for (const st of path) { const td = this.track(st.t).def; c += this.track(st.t).len * (td.pref && td.pref !== st.d ? 4 : 1); }
    for (const x of this.switchSettings(path)) if (x.state > 0) c += 150;
    return c;
  }

  /** Nötige Weichenlagen entlang einer Gleisfolge */
  switchSettings(path: Step[]): { sw: string; state: number }[] {
    const out: { sw: string; state: number }[] = [];
    for (let i = 0; i + 1 < path.length; i++) {
      const o = this.options(path[i].t, path[i].d).find((x) => x.step.t === path[i + 1].t);
      if (o?.sw !== undefined && o.state !== undefined) out.push({ sw: o.sw, state: o.state });
    }
    return out;
  }

  /** Ende des Gleises in Fahrtrichtung führt auf einen Prellbock? */
  isBuffer(t: string, d: Dir): boolean { return this.next(t, d, true) === null; }

  /** Kilometrierung (Anzeige) */
  km(p: { t: string; s: number }): number | null {
    const td = this.track(p.t).def; if (td.km0 === undefined) return null;
    return td.km0 + (td.kmRev ? -1 : 1) * p.s / 1000;
  }
  /** Gesamtlänge aller Gleise in km */
  totalKm(): number { let l = 0; for (const t of this.tracks.values()) l += t.len; return l / 1000; }

  bounds() {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const n of this.def.nodes) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); z0 = Math.min(z0, n.z); z1 = Math.max(z1, n.z); }
    for (const t of this.tracks.values()) for (let i = 0; i < t.px.length; i++) { x0 = Math.min(x0, t.px[i]); x1 = Math.max(x1, t.px[i]); z0 = Math.min(z0, t.pz[i]); z1 = Math.max(z1, t.pz[i]); }
    return { x0, x1, z0, z1 };
  }
}

/** Gleise (mit Richtung) hinter einer Position – für die Zugspur beim Aufgleisen */
export function walkBack(net: Network, head: TrackPos, length: number): { trail: Step[]; ok: boolean } {
  const trail: Step[] = [{ t: head.t, d: head.d }];
  let remain = length - (head.d > 0 ? head.s : net.track(head.t).len - head.s);
  let t = head.t, d = (head.d * -1) as Dir;
  while (remain > 0) {
    const n = net.next(t, d, true);
    if (!n || n === 'wrong') return { trail, ok: false };
    t = n.t; d = n.d;
    trail.push({ t, d: (d * -1) as Dir });
    remain -= net.track(t).len;
  }
  return { trail, ok: true };
}

// Stellwerkslogik: Gleisfreimeldung, Fahrstraßen (Bildung, Konfliktprüfung, Verschluss, Teilauflösung), Signalbegriffe.
import type { Dir } from './schema';
import type { Network, Signal, Step } from './network';

export interface RouteDef {
  id: string;
  from: string;        // Startsignal
  to: string | null;   // Zielsignal (null = Stumpfgleis/Prellbock)
  steps: Step[];       // Gleise der Fahrstraße (ohne Startgleis)
  sw: { sw: string; state: number }[];
  vmax: number;        // Signalisierte Geschwindigkeit (Abzweig) km/h
  len: number;
}

export interface SetRoute { def: RouteDef; train: string | null; /** noch nicht freigefahrene Gleise */ remaining: Set<string>; entered: boolean; t: number }

export type Aspect = 'stop' | 'go' | 'slow' | 'caution';
export interface SignalState { aspect: Aspect; speed: number | null; route: SetRoute | null; /** nächstes Hauptsignal zeigt Halt */ expectStop: boolean; nextSpeed: number | null }

/** Liefert alle möglichen Fahrstraßen ab Signal (bis zum nächsten gleichgerichteten Hauptsignal oder Prellbock) */
export function buildRoutes(net: Network): RouteDef[] {
  const out: RouteDef[] = [];
  const sigByTrackDir = new Map<string, Signal>();
  for (const s of net.signals.values()) sigByTrackDir.set(`${s.track}|${s.dir}`, s);
  for (const sig of net.signals.values()) {
    const start: Step = { t: sig.track, d: sig.dir };
    const walk = (cur: Step, steps: Step[], sws: { sw: string; state: number }[], depth: number) => {
      if (depth > 40) return;
      const opts = net.options(cur.t, cur.d);
      if (!opts.length) {
        if (steps.length) out.push(mk(sig, null, steps, sws));
        return;
      }
      for (const o of opts) {
        if (steps.some((s) => s.t === o.step.t) || o.step.t === sig.track) continue;
        const ns = [...steps, o.step];
        const nsw = o.sw !== undefined ? [...sws, { sw: o.sw, state: o.state! }] : sws;
        const end = sigByTrackDir.get(`${o.step.t}|${o.step.d}`);
        if (end) out.push(mk(sig, end.id, ns, nsw));
        else walk(o.step, ns, nsw, depth + 1);
      }
    };
    const mk = (s: Signal, to: string | null, steps: Step[], sw: { sw: string; state: number }[]): RouteDef => {
      let vmax = 999;
      for (const x of sw) {
        const d = net.switches.get(x.sw)!;
        if (x.state > 0) vmax = Math.min(vmax, d.vDiv ?? 60);
      }
      const len = steps.reduce((a, st) => a + net.track(st.t).len, 0);
      return { id: `${s.id}>${to ?? 'end:' + steps[steps.length - 1].t}`, from: s.id, to, steps, sw, vmax: vmax === 999 ? 0 : vmax, len };
    };
    walk(start, [], [], 0);
  }
  return out;
}

export class Interlocking {
  readonly net: Network;
  readonly routes: RouteDef[];
  readonly routesFrom = new Map<string, RouteDef[]>();
  readonly set = new Map<string, SetRoute>(); // key = Startsignal
  /** Gleis → Zug-IDs (Gleisfreimeldung) */
  occ = new Map<string, Set<string>>();
  /** Gleis → Fahrstraße (Verschluss) */
  locked = new Map<string, SetRoute>();
  /** Gleise mit Fahrtrichtung, die von einer Fahrstraße reserviert sind (für Eingleisigkeit) */
  readonly signalState = new Map<string, SignalState>();
  /** Aufgelöste Fahrstraßen-Protokolle */
  log: string[] = [];
  /** Hilfsauflösung läuft: Startsignal → Restzeit s */
  pendingCancel = new Map<string, number>();
  time = 0;
  /** Fahrtrichtung eines Zuges auf einem Gleis (vom Betrieb gesetzt) */
  trainDir: ((train: string, track: string) => Dir | null) | null = null;
  readonly groupTracks = new Map<string, string[]>();

  constructor(net: Network) {
    this.net = net;
    this.routes = buildRoutes(net);
    for (const r of this.routes) { const a = this.routesFrom.get(r.from) ?? []; a.push(r); this.routesFrom.set(r.from, a); }
    for (const t of net.tracks.values()) if (t.def.single) { const a = this.groupTracks.get(t.def.single) ?? []; a.push(t.id); this.groupTracks.set(t.def.single, a); }
    for (const s of net.signals.values()) this.signalState.set(s.id, { aspect: 'stop', speed: null, route: null, expectStop: true, nextSpeed: null });
    net.lockCheck = (sw) => {
      const d = net.switches.get(sw)!;
      const l = this.swLock(sw);
      if (l) return `Weiche ${sw} ist durch Fahrstraße ${l.def.from} verschlossen`;
      for (const t of [d.trunk, ...d.legs]) if (this.fouls(t, d.node)) return `Weiche ${sw} ist besetzt`;
      return null;
    };
  }

  isFree(t: string, except?: string): boolean { const o = this.occ.get(t); if (!o || o.size === 0) return true; return except !== undefined && o.size === 1 && o.has(except); }

  /** Gleisfreimeldung aus Zugpositionen */
  updateOccupancy(spans: Map<string, { t: string; s0?: number; s1?: number }[]>) {
    const occ = new Map<string, Set<string>>();
    const sp2 = new Map<string, { train: string; s0: number; s1: number }[]>();
    for (const [id, sp] of spans) for (const s of sp) {
      const set = occ.get(s.t) ?? new Set(); set.add(id); occ.set(s.t, set);
      const a = sp2.get(s.t) ?? []; a.push({ train: id, s0: s.s0 ?? 0, s1: s.s1 ?? 1e9 }); sp2.set(s.t, a);
    }
    this.occ = occ; this.occSpans = sp2;
  }
  /** Fahrstraße, die die Weiche noch verschließt (Teilauflösung: frei, sobald der Zug die Weiche verlassen hat) */
  swLock(sw: string): SetRoute | null {
    const node = this.net.switches.get(sw)!.node;
    for (const sr of this.set.values()) {
      if (!sr.def.sw.some((x) => x.sw === sw)) continue;
      const st = sr.def.steps;
      const i = st.findIndex((x) => this.net.nodeOf(x.t, x.d) === node);
      if (i < 0) {
        // Weiche direkt hinter dem Startsignal: verschlossen, bis der Zug das Signalgleis verlassen hat
        const sigT = this.net.signals.get(sr.def.from)!.track;
        if (!sr.entered || (sr.train && this.occ.get(sigT)?.has(sr.train))) return sr;
        continue;
      }
      for (let k = 0; k <= i; k++) if (sr.remaining.has(st[k].t)) return sr;
    }
    return null;
  }
  occSpans = new Map<string, { train: string; s0: number; s1: number }[]>();
  /** Fahrzeug steht im Grenzbereich (15 m) der Weiche am Knoten node */
  fouls(t: string, node: string, except?: string): boolean {
    const tr = this.net.track(t);
    const atA = tr.def.a === node;
    return (this.occSpans.get(t) ?? []).some((o) => o.train !== except && (atA ? o.s0 < 15 : o.s1 > tr.len - 15));
  }

  /** Prüft, ob eine Fahrstraße eingestellt werden kann. Liefert Grund oder null. */
  check(r: RouteDef, train: string | null = null): string | null {
    if (this.set.has(r.from)) return `Am Signal ${r.from} ist bereits eine Fahrstraße eingestellt`;
    for (const st of r.steps) {
      if (this.locked.has(st.t)) return `Gleis ${st.t} ist bereits in Fahrstraße ${this.locked.get(st.t)!.def.from}`;
      if (!this.isFree(st.t)) return `Gleis ${st.t} ist besetzt`;
    }
    for (const x of r.sw) {
      if (this.net.failed.has(x.sw) && this.net.switches.get(x.sw)!.state !== x.state) return `Weiche ${x.sw} gestört`;
      const d = this.net.switches.get(x.sw)!;
      const lk = this.swLock(x.sw);
      if (lk && lk.def.sw.some((y) => y.sw === x.sw && y.state !== x.state)) return `Weiche ${x.sw} in anderer Lage verschlossen`;
      for (const t of [d.trunk, ...d.legs]) {
        if (!r.steps.some((s) => s.t === t) && d.state !== x.state && this.fouls(t, d.node, train ?? undefined)) return `Weiche ${x.sw}: Nachbargleis besetzt`;
      }
    }
    // Eingleisige Abschnitte: Gegenrichtung gesperrt, solange belegt/reserviert
    const groups = new Map<string, Dir>();
    for (const st of r.steps) { const g = this.net.track(st.t).def.single; if (g) groups.set(g, st.d); }
    if (groups.size) {
      for (const sr of this.set.values()) for (const st of sr.def.steps) {
        const g = this.net.track(st.t).def.single;
        if (g && groups.has(g) && sr.remaining.has(st.t)) {
          const dirMine = groups.get(g)!, td = this.net.track(st.t);
          const myDirOnThat = r.steps.find((s) => this.net.track(s.t).def.single === g)!;
          // Richtungsvergleich über Knotenfolge: gleiche Richtung, wenn beide Gleise gleich orientiert befahren werden
          if (sameGroupDir(this.net, myDirOnThat.t, dirMine, st.t, st.d) === false) return `Eingleisiger Abschnitt ${g} in Gegenrichtung belegt (${td.id})`;
        }
      }
      // belegte Gleise der Gruppe: Zug in Gegenrichtung?
      for (const [g, dMine] of groups) {
        const mine = r.steps.find((s) => this.net.track(s.t).def.single === g)!;
        for (const t of this.groupTracks.get(g) ?? []) {
          for (const tid of this.occ.get(t) ?? []) {
            if (tid === train) continue;
            const od = this.trainDir?.(tid, t);
            if (od !== undefined && od !== null && !sameGroupDir(this.net, mine.t, dMine, t, od)) return `Eingleisiger Abschnitt ${g}: Gegenzug ${tid}`;
          }
        }
      }
    }
    return null;
  }

  /** Stellt eine Fahrstraße ein (Weichen umstellen, verschließen) */
  setRoute(r: RouteDef, train: string | null = null): string | null {
    const why = this.check(r, train); if (why) return why;
    for (const x of r.sw) {
      const d = this.net.switches.get(x.sw)!;
      if (d.state !== x.state) {
        if (this.net.failed.has(x.sw)) return `Weiche ${x.sw} gestört`;
        d.state = x.state; this.net.version++;
      }
    }
    const sr: SetRoute = { def: r, train, remaining: new Set(r.steps.map((s) => s.t)), entered: false, t: this.time };
    this.set.set(r.from, sr);
    for (const st of r.steps) this.locked.set(st.t, sr);
    this.log.push(`${fmt(this.time)} Fahrstraße ${r.from} → ${r.to ?? 'Stumpfgleis'} eingestellt`);
    return null;
  }

  /** Fahrstraße zurücknehmen. Ist ein Zug im Annäherungsbereich, erst nach Verzögerung (Hilfsauflösung). */
  cancel(from: string, approaching: boolean): string {
    const sr = this.set.get(from); if (!sr) return 'Keine Fahrstraße eingestellt';
    if (sr.entered) return 'Fahrstraße bereits befahren – löst sich hinter dem Zug selbst auf';
    if (approaching) { this.pendingCancel.set(from, 60); this.closeSignal(from); return 'Zug im Annäherungsbereich: Signal auf Halt, Auflösung in 60 s (Hilfsauflösung)'; }
    this.release(sr); return 'Fahrstraße aufgelöst';
  }
  private closeSignal(from: string) { const st = this.signalState.get(from); if (st) { st.aspect = 'stop'; } }

  release(sr: SetRoute) {
    for (const t of sr.remaining) if (this.locked.get(t) === sr) this.locked.delete(t);
    sr.remaining.clear();
    this.set.delete(sr.def.from);
    this.pendingCancel.delete(sr.def.from);
    this.log.push(`${fmt(this.time)} Fahrstraße ${sr.def.from} aufgelöst`);
  }

  /** Teilauflösung: Gleise, die der Zug (mit Schluss) verlassen hat, werden frei */
  step(dt: number) {
    this.time += dt;
    for (const [from, rest] of this.pendingCancel) {
      const r = rest - dt;
      if (r <= 0) { const sr = this.set.get(from); if (sr) this.release(sr); else this.pendingCancel.delete(from); }
      else this.pendingCancel.set(from, r);
    }
    for (const sr of [...this.set.values()]) {
      let any = false;
      for (const st of sr.def.steps) if (!this.isFree(st.t)) { any = true; if (!sr.entered) { sr.entered = true; } }
      if (sr.entered) {
        // ein Gleis wird frei, sobald es nicht mehr besetzt ist und alle vorherigen ebenfalls frei sind
        for (const st of sr.def.steps) {
          if (!sr.remaining.has(st.t)) continue;
          if (this.isFree(st.t)) { sr.remaining.delete(st.t); if (this.locked.get(st.t) === sr) this.locked.delete(st.t); }
          else break;
        }
        if (sr.remaining.size === 0) { this.set.delete(sr.def.from); this.log.push(`${fmt(this.time)} Fahrstraße ${sr.def.from} freigefahren`); }
        else if (sr.remaining.size === 1) {
          // Zug steht vollständig im Zielgleis (Signalgleis und vorige Gleise frei): Startsignal wieder frei für die nächste Fahrstraße
          const last = sr.def.steps[sr.def.steps.length - 1].t, here = this.occ.get(last);
          const sigOcc = this.occ.get(this.net.signals.get(sr.def.from)!.track);
          if (sr.remaining.has(last) && here && [...here].some((id) => (!sr.train || id === sr.train) && !sigOcc?.has(id))) {
            sr.remaining.clear(); if (this.locked.get(last) === sr) this.locked.delete(last);
            this.set.delete(sr.def.from); this.log.push(`${fmt(this.time)} Fahrstraße ${sr.def.from} freigefahren`);
          }
        }
        else if (!any && sr.remaining.size === sr.def.steps.length) { /* noch nicht eingefahren */ }
      }
    }
    this.updateSignals();
  }

  /** gestörte Signale (zeigen immer Halt, Vorbeifahrt nur mit Ersatzsignal) */
  readonly failedSignals = new Set<string>();
  /** Signale, die zuletzt nicht Halt zeigten */
  private lit = new Set<string>();
  updateSignals() {
    // nur Signale mit eingestellter Fahrstraße oder zuletzt Fahrt zeigend prüfen (Leistung)
    for (const id of this.lit) if (!this.set.has(id)) { const st = this.signalState.get(id)!; st.aspect = 'stop'; st.speed = null; st.route = null; st.expectStop = true; st.nextSpeed = null; }
    this.lit.clear();
    for (const [id, sr] of this.set) {
      const st = this.signalState.get(id)!;
      st.route = sr;
      let ok = !sr.entered && !this.pendingCancel.has(id);
      if (ok) {
        for (const s of sr.def.steps) if (!this.isFree(s.t)) { ok = false; break; }
        for (const x of sr.def.sw) if (this.net.switches.get(x.sw)!.state !== x.state) ok = false;
      }
      if (this.failedSignals.has(id)) ok = false;
      st.aspect = ok ? (sr.def.vmax > 0 ? 'slow' : 'go') : 'stop';
      st.speed = ok && sr.def.vmax > 0 ? sr.def.vmax : null;
      this.lit.add(id);
    }
    // Vorsignalisierung: zeigt das nächste Hauptsignal Halt?
    for (const id of this.lit) {
      const st = this.signalState.get(id)!;
      if (st.aspect === 'stop' || !st.route) { st.expectStop = true; st.nextSpeed = null; continue; }
      const nxt = st.route.def.to ? this.signalState.get(st.route.def.to) : null;
      st.expectStop = !nxt || nxt.aspect === 'stop';
      st.nextSpeed = nxt?.speed ?? null;
      if (st.aspect === 'go' && st.expectStop) st.aspect = 'caution';
    }
  }

  /** Signal am Gleisende in Fahrtrichtung (falls vorhanden) */
  signalFacing(t: string, d: Dir): Signal | undefined { return this.net.signalsOn.get(t)?.find((s) => s.dir === d); }

  /** Fahrstraßen ab einem Signal zu einem Zielgleis */
  findRoute(from: string, toTrack: string): RouteDef | undefined {
    return this.routesFrom.get(from)?.find((r) => r.steps.some((s) => s.t === toTrack));
  }

  /** Erkennt gegenseitiges Warten (Verklemmung) über ein Warte-Graph */
  static deadlocks(waits: Map<string, string | null>): string[][] {
    const cycles: string[][] = []; const seen = new Set<string>();
    for (const start of waits.keys()) {
      if (seen.has(start)) continue;
      const path: string[] = []; const idx = new Map<string, number>(); let cur: string | null | undefined = start;
      while (cur && !idx.has(cur) && !seen.has(cur)) { idx.set(cur, path.length); path.push(cur); cur = waits.get(cur); }
      if (cur && idx.has(cur)) cycles.push(path.slice(idx.get(cur)!));
      path.forEach((p) => seen.add(p));
    }
    return cycles;
  }
}

/** Gleiche Fahrtrichtung zweier Gleise innerhalb einer eingleisigen Gruppe (über Knotenverbindung ermittelt) */
function sameGroupDir(net: Network, t1: string, d1: Dir, t2: string, d2: Dir): boolean {
  if (t1 === t2) return d1 === d2;
  // Laufe von t1 in Richtung d1 bis t2 gefunden wird
  let cur = { t: t1, d: d1 };
  for (let i = 0; i < 60; i++) {
    const n = net.next(cur.t, cur.d, true); if (!n || n === 'wrong') break;
    if (n.t === t2) return n.d === d2;
    if (net.track(n.t).def.single !== net.track(t1).def.single) break;
    cur = n;
  }
  cur = { t: t1, d: (d1 * -1) as Dir };
  for (let i = 0; i < 60; i++) {
    const n = net.next(cur.t, cur.d, true); if (!n || n === 'wrong') break;
    if (n.t === t2) return n.d !== d2;
    if (net.track(n.t).def.single !== net.track(t1).def.single) break;
    cur = n;
  }
  return true;
}

export function fmt(t: number): string {
  const s = Math.floor(t) % 86400; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
}

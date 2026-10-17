// Betriebssimulation: Züge, Stellwerk, KI-Fahrdienstleiter, KI-Triebfahrzeugführer, Fahrplan, Bahnübergänge, Zugbeeinflussung.
import { Network, type Step } from '../railway/network';
import { Interlocking, fmt, type RouteDef } from '../railway/interlocking';
import type { Dir, NetworkDef, PlatformDef, StationDef, TrackPos } from '../railway/schema';
import { Train, makeVehicles, type TrainEvent } from '../trains/train';
import { FORM } from '../trains/stock';
import { TICK, type Rail } from '../physics/dynamics';
import { lookahead, permitted, trackLimit, type Target } from './lookahead';

export type Assist = 'easy' | 'standard' | 'expert';
export type WeatherKind = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
export interface Weather { kind: WeatherKind; season: 'spring' | 'summer' | 'autumn' | 'winter'; wind: number }

export interface ServiceStop { st: string; plat?: string; arr?: number; dep?: number; dwell?: number; pass?: boolean }
export interface Service {
  id: string; nr: string; kind: 'HGZ' | 'IC' | 'RE' | 'RB' | 'S' | 'GZ' | 'Lz' | 'DPF' | 'NC' | 'BB' | 'STR' | 'Rangier';
  form: string; vehicles?: string[]; loads?: number[]; prio: number;
  stops: ServiceStop[];
  spawn: number;
  /** Startposition (sonst Bahnsteig der ersten Station) */
  start?: TrackPos;
  /** Endet auf diesem Gleis (sonst letzte Station) */
  endTrack?: string;
  /** Zug bleibt nach Fahrtende stehen (sonst wird er abgestellt/entfernt) */
  keep?: boolean;
  player?: boolean;
}

export interface Plan {
  svc: Service | null;
  stopIdx: number;
  path: Step[];
  state: 'run' | 'dwell' | 'done' | 'hold';
  dwellUntil: number;
  delay: number;
  arrived: { st: string; arr: number; dep?: number; delay: number; ok: boolean }[];
  holdFor?: string;
  dest?: string;   // Zielgleis (freie Fahrt)
  shunt?: boolean;
  lastSignal?: string;
  waitSince?: number;
}

export interface WorldEvent extends TrainEvent { train?: string; t: number }

export const RAIL_FROM_WEATHER = (w: Weather): Rail => {
  if (w.kind === 'snow') return w.season === 'winter' ? 'snow' : 'wet';
  if (w.kind === 'rain' || w.kind === 'storm') return w.season === 'autumn' ? 'leaves' : 'wet';
  if (w.season === 'autumn' && w.kind === 'fog') return 'leaves';
  if (w.season === 'winter' && w.kind === 'fog') return 'ice';
  return 'dry';
};

export class World {
  readonly net: Network;
  readonly il: Interlocking;
  readonly trains = new Map<string, Train>();
  readonly plans = new Map<string, Plan>();
  readonly stations = new Map<string, StationDef>();
  /** Gleis → Bahnsteige */
  readonly platformsOn = new Map<string, { st: StationDef; p: PlatformDef }[]>();
  time: number;
  weather: Weather = { kind: 'clear', season: 'summer', wind: 0 };
  rail: Rail = 'dry';
  assist: Assist = 'standard';
  /** automatischer Fahrdienstleiter */
  autoDispatch = true;
  pending: Service[] = [];
  player: string | null = null;
  events: WorldEvent[] = [];
  crossings = new Map<string, { closed: number; failed: boolean }>();
  /** Zugbeeinflussung des Spielerzuges */
  pzb = { mode: 'off' as 'off' | 'on', ack: 0, monitor: 0, m500: false, need: 0, restrictive: 0 };
  spans = new Map<string, { t: string; s0: number; s1: number }[]>();
  occupiedOn = new Map<string, { train: string; s0: number; s1: number }[]>();
  /** Gesamtwertung (Strafen) */
  score = { spad: 0, overspeed: 0, collisions: 0, buffers: 0, doors: 0, comfort: 100, trailed: 0 };
  collided = false;
  private acc = 0;
  private nextId = 1;
  speedMul = 1;
  /** Stellwerk hat sich geändert: KI-Vorausschau sofort neu berechnen */
  dirtyAI = false;
  /** Signale, die der Spieler im Stellwerk selbst stellt */
  readonly manual = new Set<string>();
  deadlock: string[][] = [];

  constructor(def: NetworkDef, startTime = 8 * 3600) {
    this.net = new Network(def);
    this.il = new Interlocking(this.net);
    this.time = startTime;
    this.il.time = startTime;
    for (const st of def.stations) {
      this.stations.set(st.id, st);
      for (const p of st.platforms) { const a = this.platformsOn.get(p.track) ?? []; a.push({ st, p }); this.platformsOn.set(p.track, a); }
    }
    for (const c of def.crossings) this.crossings.set(c.id, { closed: 0, failed: false });
    this.il.trainDir = (tid, track) => {
      const tr = this.trains.get(tid); if (!tr) return null;
      const st = tr.trail.find((x) => x.t === track); return st ? st.d : null;
    };
  }

  setWeather(w: Weather) { this.weather = w; this.rail = RAIL_FROM_WEATHER(w); }

  emit(e: Omit<WorldEvent, 't'>) { this.events.push({ ...e, t: this.time }); if (this.events.length > 400) this.events.splice(0, 100); }

  /** Zug auf das Gleis setzen */
  addTrain(opts: { id?: string; name: string; form?: string; vehicles?: string[]; flipped?: number[]; loads?: number[]; pos: TrackPos; ai: boolean; cold?: boolean }): Train {
    const f = opts.form ? FORM.get(opts.form) : undefined;
    const ids = opts.vehicles ?? f?.vehicles; if (!ids) throw new Error('Keine Zuggarnitur');
    const veh = makeVehicles(ids, opts.flipped ?? f?.flipped, opts.loads ?? f?.loads);
    const id = opts.id ?? `T${this.nextId++}`;
    const t = new Train(id, opts.name, veh, opts.pos, this.net);
    t.ai = opts.ai;
    if (opts.cold) t.coldStart(); else t.prepare();
    this.trains.set(id, t);
    this.refreshOccupancy();
    return t;
  }

  removeTrain(id: string) {
    this.trains.delete(id); this.plans.delete(id);
    for (const sr of [...this.il.set.values()]) if (sr.train === id && !sr.entered) this.il.release(sr);
    this.refreshOccupancy();
  }

  refreshOccupancy() {
    this.spans.clear(); this.occupiedOn.clear();
    for (const t of this.trains.values()) {
      const sp = t.span(this.net); this.spans.set(t.id, sp);
      for (const s of sp) { const a = this.occupiedOn.get(s.t) ?? []; a.push({ train: t.id, s0: s.s0, s1: s.s1 }); this.occupiedOn.set(s.t, a); }
    }
    this.il.updateOccupancy(this.spans);
  }

  // ---------------------------------------------------------------- Fahrplan
  /** Bahnsteig für Station wählen: bevorzugt geplanter, sonst freier passender (Bahnsteigwechsel) */
  choosePlatform(train: Train, stId: string, pref?: string): { track: string; p: PlatformDef } | null {
    const st = this.stations.get(stId); if (!st || !st.platforms.length) return null;
    const from = train.head;
    const cands = st.platforms.map((p) => {
      const path = this.net.route(from, p.track);
      const free = this.il.isFree(p.track, train.id) && !this.il.locked.has(p.track) || this.il.locked.get(p.track)?.train === train.id;
      const claimed = [...this.plans.entries()].some(([tid, pl]) => tid !== train.id && pl.path.length && pl.path[pl.path.length - 1].t === p.track && pl.state !== 'done');
      const len = (p.s1 - p.s0);
      // Bahnsteig nur über das Gegengleis erreichbar: lieber warten (Gegenverkehr auf zweigleisiger Strecke → Verklemmung)
      // (kurze Verbindungsstücke an Abzweigen zählen nicht)
      let wrongLen = 0;
      path?.forEach((st, i) => { const tr = this.net.track(st.t), pr = tr.def.pref; if (i > 0 && pr !== undefined && pr !== st.d) wrongLen += tr.len; });
      const wrong = wrongLen > 150;
      const score = (path ? this.net.pathCost(path) : 1e9) + (p.track === pref ? -5000 : 0) + (free ? 0 : 8000) + (claimed ? 6000 : 0) + (len < train.length ? 3000 : 0) + (wrong ? 50000 : 0);
      return { p, path, score };
    }).filter((c) => c.path).sort((a, b) => a.score - b.score);
    return cands.length ? { track: cands[0].p.track, p: cands[0].p } : null;
  }

  planNext(train: Train) {
    const plan = this.plans.get(train.id); if (!plan) return;
    const svc = plan.svc;
    if (svc) {
      while (plan.stopIdx < svc.stops.length) {
        const stop = svc.stops[plan.stopIdx];
        const c = this.choosePlatform(train, stop.st, stop.plat);
        if (c) {
          const path = this.net.route(train.head, c.track);
          if (path) { plan.path = path; plan.state = 'run'; return; }
        }
        plan.stopIdx++;
      }
      if (svc.endTrack) { const p = this.net.route(train.head, svc.endTrack); if (p) { plan.path = p; plan.state = 'run'; return; } }
      plan.path = []; plan.state = 'done';
    } else if (plan.dest) {
      const p = this.net.route(train.head, plan.dest); plan.path = p ?? []; plan.state = p ? 'run' : 'done';
    }
  }

  /** Zug mit Fahrplan einsetzen */
  spawnService(svc: Service): Train | null {
    let pos = svc.start;
    const first = svc.stops[0];
    if (!pos) {
      const st = this.stations.get(first.st); if (!st) return null;
      // Bahnsteig und Richtung mit dem günstigsten Weg zur nächsten Station (Regelgleis bevorzugt)
      const nxt = svc.stops[1] ? this.stations.get(svc.stops[1].st) : null;
      let p: PlatformDef | undefined, d: Dir = 1, best = Infinity;
      for (const c of st.platforms) {
        if (first.plat && c.track !== first.plat) continue;
        const busy = this.il.isFree(c.track) && !this.il.locked.has(c.track) ? 0 : 1e7;
        for (const dd of [1, -1] as const) {
          let cost = 1e8;
          if (nxt) for (const q of nxt.platforms) { const r = this.net.route({ t: c.track, s: (c.s0 + c.s1) / 2, d: dd }, q.track); if (r) cost = Math.min(cost, this.net.pathCost(r)); }
          else if (this.net.next(c.track, dd, true)) cost = 0;
          // Richtungsgleis nicht gegen die Regelrichtung belegen (dort fehlt das Ausfahrsignal)
          const pr = this.net.track(c.track).def.pref; if (pr !== undefined && pr !== dd) cost += 2e7;
          if (cost + busy < best) { best = cost + busy; p = c; d = dd; }
        }
      }
      // nur Gegenrichtungsgleise frei: später erneut versuchen (Hintergrundverkehr)
      if (best >= 2e7 && !svc.player) return null;
      p ??= st.platforms[0];
      if (!p) return null;
      const f = FORM.get(svc.form); const len = (svc.vehicles ?? f?.vehicles ?? []).length * 25;
      const s = d > 0 ? Math.min(p.s1 - 8, p.s0 + len + 5) : Math.max(p.s0 + 8, p.s1 - len - 5);
      let sp = Math.max(1, Math.min(this.net.track(p.track).len - 1, s));
      // nicht hinter einem Signal der Fahrtrichtung aufstellen
      for (const sig of this.net.signalsOn.get(p.track) ?? []) if (sig.dir === d) {
        if (d > 0 && sp > sig.s - 6 && sig.s > p.s0) sp = Math.max(1, sig.s - 6);
        if (d < 0 && sp < sig.s + 6 && sig.s < p.s1) sp = Math.min(this.net.track(p.track).len - 1, sig.s + 6);
      }
      pos = { t: p.track, s: sp, d };
    }
    if (!this.il.isFree(pos.t)) return null;
    const t = this.addTrain({ name: `${svc.kind} ${svc.nr}`, form: svc.form, vehicles: svc.vehicles, loads: svc.loads, pos, ai: !svc.player });
    t.meta.svc = svc.id; t.meta.kind = svc.kind; t.meta.prio = svc.prio;
    const plan: Plan = { svc, stopIdx: 0, path: [], state: 'dwell', dwellUntil: Math.max(this.time + 20, first.dep ?? this.time + 30), delay: 0, arrived: [] };
    this.plans.set(t.id, plan);
    plan.arrived.push({ st: first.st, arr: this.time, delay: 0, ok: true });
    plan.stopIdx = 1;
    if (svc.stops.length < 2 && !svc.endTrack) plan.state = 'done';
    else { this.planNext(t); if (plan.state === 'run') plan.state = 'dwell'; } // Weg schon vor der Abfahrt kennen (Fahrstraße rechtzeitig)
    return t;
  }

  /** Haltepunkt an einem Bahnsteig: Spitze vor dem Bahnsteigende */
  /** Haltepunkt der Zugspitze: Gleis, Position, Fahrtrichtung und (falls Bahnsteig) Bahnsteigseite */
  stopTarget(train: Train, plan: Plan): { t: string; s: number; d: 1 | -1; side: 'L' | 'R' | null } | null {
    if (!plan.path.length) return null;
    const last = plan.path[plan.path.length - 1];
    const ends = this.platformsOn.get(last.t);
    const svc = plan.svc;
    const stop = svc && plan.stopIdx < svc.stops.length ? svc.stops[plan.stopIdx] : null;
    const pl = stop ? ends?.find((x) => x.st.id === stop.st) : null;
    const tr = this.net.track(last.t);
    if (!pl) return { t: last.t, s: last.d > 0 ? tr.len - 15 : 15, d: last.d, side: null };
    // Zugmitte etwa in Bahnsteigmitte (dort stehen Dach und Empfangsgebäude), Spitze nie über das Bahnsteigende hinaus
    const { s0, s1 } = pl.p, L = train.length, mid = (s0 + s1) / 2;
    const marg = Math.min(10, Math.max(3, (s1 - s0 - L) / 2));
    const s = last.d > 0 ? Math.min(s1 - marg, Math.max(mid + L / 2, s0 + L + 2)) : Math.max(s0 + marg, Math.min(mid - L / 2, s1 - L - 2));
    return { t: last.t, s, d: last.d, side: pl.p.side };
  }

  stopPoint(train: Train, plan: Plan): { d: number } | null {
    const tg = this.stopTarget(train, plan); if (!tg) return null;
    const target = tg.s;
    // Distanz entlang Pfad
    let d = 0;
    const hi = plan.path.findIndex((s) => s.t === train.head.t && s.d === train.head.d);
    if (hi < 0) return null;
    for (let i = hi; i < plan.path.length; i++) {
      const st = plan.path[i], L = this.net.track(st.t).len;
      const from = i === hi ? train.head.s : st.d > 0 ? 0 : L;
      if (i === plan.path.length - 1) { d += st.d > 0 ? target - from : from - target; break; }
      d += st.d > 0 ? L - from : from;
    }
    return { d };
  }

  // ---------------------------------------------------------------- Dispatcher
  private dispatch() {
    const reqs: { train: Train; route: RouteDef; dist: number; prio: number }[] = [];
    for (const train of this.trains.values()) {
      if (train.isCut) continue;
      const plan = this.plans.get(train.id);
      const isPlayer = train.id === this.player;
      if (!this.autoDispatch && !isPlayer && !train.ai) continue;
      if (!this.autoDispatch && train.ai) { /* Spieler disponiert */ continue; }
      // nächstes Signal in Fahrtrichtung
      const la = lookahead(this.net, this.il, train.head, 4500, { self: train.id });
      const sigT = la.targets.find((x) => x.kind === 'signal');
      if (!sigT || !sigT.ref) continue;
      const sig = this.net.signals.get(sigT.ref)!;
      if (this.il.set.has(sig.id)) continue;
      if (this.manual.has(sig.id)) continue;
      // Fahrstraße stellen, bevor der Zug nach seiner Planverzögerung (inkl. Bremsansprechzeit) bremsen müsste
      const brake = Math.max(600, (train.v * train.v) / (2 * this.planDecel(train) * 0.6) + Math.abs(train.v) * 8 + 400);
      if (sigT.d > brake && Math.abs(train.v) > 0.5) continue;
      if (plan?.state === 'dwell' && this.time < plan.dwellUntil - 45) continue;
      if (plan?.state === 'hold') continue;
      // Fahrplanzug ohne berechneten Weg (z. B. vor der Abfahrt): erst planen, nicht nach Weichenlage stellen
      if (plan?.svc && !plan.path.length) continue;
      if (plan?.holdFor && this.trains.has(plan.holdFor)) continue;
      const routes = this.il.routesFrom.get(sig.id) ?? [];
      let route: RouteDef | undefined;
      if (plan && plan.path.length) {
        const idx = plan.path.findIndex((s) => s.t === sig.track && s.d === sig.dir);
        if (idx >= 0) {
          const rest = plan.path.slice(idx + 1);
          route = routes.find((r) => r.steps.every((s, i) => i >= rest.length ? false : rest[i].t === s.t && rest[i].d === s.d))
            ?? routes.find((r) => rest.length > 0 && r.steps.length > rest.length && rest.every((s, i) => r.steps[i].t === s.t));
          // Planweg belegt: Ausweichgleis suchen (z. B. Kreuzung im anderen Bahnhofsgleis)
          if (route && train.ai && this.il.check(route, train.id)) { const alt = this.altRoute(train, plan, idx, routes, route); if (alt) route = alt; }
        }
      } else if (isPlayer || (plan && plan.state === 'done' && !train.ai)) {
        // Spieler ohne Fahrplan: Fahrstraße nach aktueller Weichenlage (Weichen selbst stellen)
        route = routes.find((r) => r.sw.every((x) => this.net.switches.get(x.sw)!.state === x.state && !this.net.failed.has(x.sw)))
          ?? routes.find((r) => r.sw.every((x) => x.state === 0)) ?? routes[0];
      }
      if (!route) continue;
      if (!this.capacityOk(train, route)) continue;
      reqs.push({ train, route, dist: sigT.d, prio: (train.meta.prio as number ?? 5) + (plan?.delay ?? 0) / 300 });
    }
    reqs.sort((a, b) => b.prio - a.prio || a.dist - b.dist);
    // Kapazität vor dem Stellen erneut prüfen (zwei Gegenzüge im selben Takt)
    for (const r of reqs) if (this.capacityOk(r.train, r.route) && !this.il.setRoute(r.route, r.train.id)) this.dirtyAI = true;
  }

  /** Alternative Fahrstraße ab Signal, die wieder auf den Plan führt (Plan wird angepasst) */
  private altRoute(train: Train, plan: Plan, idx: number, routes: RouteDef[], blocked: RouteDef): RouteDef | undefined {
    const final = plan.path[plan.path.length - 1];
    const svc = plan.svc, stop = svc && plan.stopIdx < svc.stops.length ? svc.stops[plan.stopIdx] : null;
    const ends = new Set<string>([final.t]);
    if (stop) for (const p of this.stations.get(stop.st)?.platforms ?? []) if ((this.platformsOn.get(final.t) ?? []).some((x) => x.st.id === stop.st)) ends.add(p.track);
    let best: { r: RouteDef; path: Step[]; cost: number } | undefined;
    // Umweg höchstens wenig länger als der Planweg (keine Ringfahrt über das halbe Netz)
    const maxCost = this.net.pathCost(plan.path.slice(idx + 1)) + 1500;
    for (const r of routes) {
      if (r === blocked || this.il.check(r, train.id)) continue;
      const last = r.steps[r.steps.length - 1];
      let tail: Step[] = [];
      if (!ends.has(last.t)) {
        const L = this.net.track(last.t).len;
        const p = this.net.route({ t: last.t, s: last.d > 0 ? L - 1 : 1, d: last.d }, final.t);
        if (!p) continue;
        tail = p.slice(1);
      }
      const rest = [...r.steps, ...tail];
      let wrongLen = 0;
      for (const st of rest) { const tr = this.net.track(st.t), pr = tr.def.pref; if (pr !== undefined && pr !== st.d) wrongLen += tr.len; }
      if (wrongLen > 150) continue;
      const cost = this.net.pathCost(rest);
      if (cost > maxCost) continue;
      if (!best || cost < best.cost) best = { r, path: [...plan.path.slice(0, idx + 1), ...rest], cost };
    }
    if (!best) return undefined;
    plan.path = best.path;
    return best.r;
  }

  /** Zug steht in einem eingleisigen Streckenabschnitt oder hat eine Fahrstraße hinein (kann nicht mehr warten) */
  private committed(id: string): boolean {
    const line = (t: string) => { const g = this.net.track(t).def.single; return !!g && !g.includes(':st'); };
    // Zugspitze zählt (ein Zugschluss, der aus dem Bahnhofsgleis ins Streckengleis ragt, bindet nicht)
    const tr = this.trains.get(id); if (tr && line(tr.head.t)) return true;
    // nur Fahrstraßen, die noch vor dem Zug liegen (die befahrene Einfahrstraße bindet nicht mehr)
    for (const sr of this.il.set.values()) if (sr.train === id && sr.def.steps.some((x) => line(x.t) && x.t !== tr?.head.t && this.aheadOn(id, x.t))) return true;
    return false;
  }

  /** Liegt das Gleis noch vor dem Zug auf seinem Planweg? (bereits befahrene Teile zählen nicht) */
  private aheadOn(id: string, track: string): boolean {
    const pl = this.plans.get(id), tr = this.trains.get(id);
    if (!pl || !tr || pl.state === 'done') return false;
    const hi = pl.path.findIndex((s) => s.t === tr.head.t);
    for (let i = Math.max(0, hi); i < pl.path.length; i++) if (pl.path[i].t === track) return true;
    return false;
  }

  /** Eingleisige Strecke: nur einfahren, wenn am Ende ein Gleis frei ist (Kreuzungsplanung gegen Verklemmung) */
  private capacityOk(train: Train, r: RouteDef): boolean {
    const g = r.steps.map((s) => this.net.track(s.t).def.single).find((x) => x);
    if (!g) return true;
    // Einfahrt in einen Kreuzungsbahnhof: zugesagte Gegenzüge brauchen dort noch ein Gleis
    const last = r.steps[r.steps.length - 1].t, lg = this.net.track(last).def.single;
    if (lg && lg.includes(':st') && !this.stationOk(train, last, r.steps[r.steps.length - 1].d)) return false;
    // Läuft die Fahrstraße in einen eingleisigen Abschnitt hinein, muss der nächste Kreuzungsbahnhof Platz haben
    const plan = this.plans.get(train.id); if (!plan) return true;
    const idx = plan.path.findIndex((s) => s.t === r.steps[r.steps.length - 1].t);
    for (let i = Math.max(0, idx); i < plan.path.length; i++) {
      const step = plan.path[i], t = this.net.track(step.t), sg = t.def.single;
      if (sg === g) continue;
      if (sg && !sg.includes(':st')) {
        // anschließender Streckenabschnitt (nur Haltepunkt dazwischen, keine Kreuzung möglich): kein Gegenzug darin
        for (const tid of this.il.occ.get(t.id) ?? []) { if (tid === train.id) continue; const od = this.il.trainDir?.(tid, t.id); if (od !== null && od !== undefined && od !== step.d) return false; }
        const lk = this.il.locked.get(t.id);
        if (lk && lk.train !== train.id && lk.def.steps.some((x) => x.t === t.id && x.d !== step.d)) return false;
        continue;
      }
      // erstes Gleis außerhalb = Kreuzungsbahnhof
      return this.stationOk(train, t.id, step.d);
    }
    return true;
  }

  /** Kreuzungsbahnhof am Gleis: nach Abzug der unwiderruflich zufahrenden Züge bleibt ein Gleis frei */
  private stationOk(train: Train, track: string, d: Dir): boolean {
    const sTracks = new Set<string>([track]);
    for (const { st } of this.platformsOn.get(track) ?? []) for (const q of st.platforms) sTracks.add(q.track);
    // bereits im Bahnhof: Platz ist vorhanden
    if ((this.spans.get(train.id) ?? []).some((sp) => sTracks.has(sp.t))) return true;
    let free = 0;
    for (const x of sTracks) { const lk = this.il.locked.get(x); if (this.il.isFree(x, train.id) && (!lk || lk.train === train.id)) free++; }
    // selbst schon im Abschnitt: Warten hilft nicht, ein freies Gleis genügt
    if (this.committed(train.id)) return free >= 1;
    let incoming = 0;
    for (const o of this.trains.values()) {
      if (o.id === train.id || o.isCut) continue;
      if ((this.spans.get(o.id) ?? []).some((sp) => sTracks.has(sp.t))) continue;
      if (![...sTracks].some((x) => this.aheadOn(o.id, x))) continue;
      // hat bereits eine Fahrstraße in ein Bahnhofsgleis (zählt dort nicht als frei)
      if ([...sTracks].some((x) => this.il.locked.get(x)?.train === o.id)) continue;
      if (this.committed(o.id)) incoming++;
    }
    if (free - incoming < 1) return false;
    // letztes Gleis belegen: nicht, wenn dort schon ein Zug in dieselbe Richtung wartet (sonst keine Kreuzung mehr möglich)
    if (free - incoming === 1 && !this.net.isBuffer(track, d)) {
      const exit = this.net.nodeOf(track, d);
      for (const o of this.trains.values()) {
        if (o.id === train.id || o.isCut || !sTracks.has(o.head.t)) continue;
        if (this.net.nodeOf(o.head.t, o.head.d) === exit) return false;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------- KI-Fahrer
  /** Ziele für den KI-Fahrer: Signale, Grenzen, Fahrzeuge, Halteplatz, Planabweichung */
  private aiTargets(train: Train, plan: Plan | undefined, decel: number): Target[] {
    const la = lookahead(this.net, this.il, train.head, Math.max(1500, (train.v * train.v) / (2 * decel) + 500), { occupiedBy: (t) => this.occupiedOn.get(t) ?? [], self: train.id, pass: train.meta.zs1 as string | undefined });
    const sp = plan ? this.stopPoint(train, plan) : null;
    const targets: Target[] = la.targets.slice();
    // gestörte Bahnübergänge: höchstens 20 km/h ab 50 m davor
    if ([...this.crossings.values()].some((c) => c.failed)) {
      let acc = 0;
      la.path.forEach((st, i) => {
        const L = this.net.track(st.t).len, from = i === 0 ? train.head.s : st.d > 0 ? 0 : L;
        for (const cr of this.net.def.crossings) if (cr.track === st.t && this.crossings.get(cr.id)?.failed) {
          const d = st.d > 0 ? cr.s - from : from - cr.s;
          if (d > -5) targets.push({ d: Math.max(0, acc + d - 50), v: 20 / 3.6, kind: 'limit', ref: cr.id });
        }
        acc += st.d > 0 ? L - from : from;
      });
    }
    // Halteplatz: genauer anfahren als Signale (Sicherheitsabstand 8 m gilt dort nicht, 1 m Rest)
    if (sp) targets.push({ d: Math.max(0, sp.d) + 7, v: 0, kind: 'stop' });
    // Fahrweg weicht vom Plan ab (Weiche falsch): vor der Abweichung halten
    if (plan && plan.path.length) {
      const hi = plan.path.findIndex((x) => x.t === train.head.t && x.d === train.head.d);
      if (hi >= 0) {
        let acc = 0;
        for (let i = 0; i < la.path.length; i++) {
          const st = la.path[i], L = this.net.track(st.t).len;
          if (hi + i >= plan.path.length) break;
          if (plan.path[hi + i].t !== st.t) { targets.push({ d: Math.max(0, acc - 20), v: 0, kind: 'switch' }); break; }
          acc += i === 0 ? (st.d > 0 ? L - train.head.s : train.head.s) : L;
        }
      }
    }
    return targets;
  }

  private drive(train: Train, plan: Plan | undefined, dt: number) {
    const c = train.ctl;
    if (train.isCut) { c.throttle = 0; return; }
    if (plan?.state === 'dwell' || plan?.state === 'done' || plan?.state === 'hold') {
      c.throttle = 0; c.brake = Math.abs(train.v) < 0.05 && Math.abs(this.net.gradeAt(train.head)) < 0.02 ? 0.6 : 1; c.dyn = 0;
      return;
    }
    const decel = this.planDecel(train);
    let vLimit = this.limitUnder(train);
    // Vorausschau nur alle 0,2 s neu berechnen (Leistung); dazwischen um den gefahrenen Weg verschieben
    const cache = train.meta.la as { odo: number; n: number; targets: Target[] } | undefined;
    let base: Target[];
    if (!cache || cache.n <= 0 || this.dirtyAI) {
      base = this.aiTargets(train, plan, decel);
      train.meta.la = { odo: train.odo, n: 10, targets: base };
    } else { cache.n--; base = cache.targets; }
    const moved = train.odo - (train.meta.la as { odo: number }).odo;
    const targets = base.map((t) => ({ ...t, d: t.d - moved }));
    // Ansprechzeit der Bremse: Ziele um den in dieser Zeit gefahrenen Weg näher rechnen
    const lag = train.consist.every((v) => v.type.ep) ? 1.5 : train.length > 150 ? 6 : 3;
    const lagD = Math.abs(train.v) * lag;
    for (const tg of targets) tg.d = Math.max(0, tg.d - lagD);
    const lim = permitted(targets, decel, 8, train.length, vLimit / 3.6) ;
    // erforderliche Verzögerung zum restriktivsten Ziel
    let areq = 0;
    for (const tg of targets) {
      if (tg.kind === 'limit' && tg.d <= 0.01) continue;
      const dd = tg.d - (tg.v === 0 ? 8 : 0);
      if (train.v > tg.v) areq = Math.max(areq, dd > 0.5 ? (train.v * train.v - tg.v * tg.v) / (2 * dd) : 9);
    }
    vLimit = Math.min(vLimit / 3.6, lim, train.vmax / 3.6);
    const v = train.v;
    const want = vLimit - 0.4;
    const nearStop = targets.some((t) => t.v === 0 && t.d < 12);
    c.reverser = 1; c.cutoff = 0.5;
    if (nearStop && v < 0.6) { c.throttle = 0; c.brake = Math.abs(this.net.gradeAt(train.head)) < 0.02 ? 0.7 : 1; c.dyn = 0; return; }
    // Zielbremsung mit Hysterese (ein-/ausschalten bei 70 % / 45 % der Planverzögerung), sonst ruckt der Zug im Takt
    const zb = v > 0.5 && (areq > decel * 0.7 || (!!train.meta.zb && areq > decel * 0.45));
    train.meta.zb = zb;
    if (zb) {
      // Steigung bremst schon allein genug (Steilstrecke bergauf): Zugkraft dosiert zurücknehmen statt bremsen
      const gdec = 9.81 * this.net.gradeAt(train.head);
      if (gdec > areq * 1.05 && areq < decel * 1.3) {
        c.brake = Math.max(0, c.brake - dt * 2); c.dyn = c.brake;
        c.throttle = Math.min(1, Math.max(0, c.throttle + (-train.acc - areq) * dt * 1.5));
        return;
      }
      // Zielbremsung: Bremsstufe nach erforderlicher Verzögerung nachregeln
      c.throttle = 0;
      const cur = -train.acc;
      c.brake = Math.min(1, Math.max(0.15, c.brake + (areq * 1.1 - cur) * dt * 2, areq > decel * 1.3 ? 1 : 0));
      c.dyn = c.brake; c.sand = train.slide;
      if (areq < decel * 1.3) this.comfortLimit(train, dt);
      return;
    }
    const err = want - v;
    // Bremse und E-Bremse stets stetig lösen (kein Sprung der Bremskraft)
    // nach Schleudern 2 s nicht wieder aufschalten, Sand 4 s halten (verhindert Takt-Pendeln an der Haftgrenze)
    if (train.slip) train.meta.slipT = this.time;
    const slipAgo = this.time - ((train.meta.slipT as number | undefined) ?? -99);
    // Anfahren in der Steigung: Zugkraft schon beim Lösen aufbauen (kein Zurückrollen)
    const uphillStart = Math.abs(v) < 0.5 && this.net.gradeAt(train.head) > 0.02;
    if (err > 0.8) { c.brake = Math.max(0, c.brake - dt * 0.8); c.dyn = c.brake; if ((c.brake < 0.05 || uphillStart) && slipAgo > 2 && train.acc < 0.8) c.throttle = Math.min(1, c.throttle + dt * 0.5); }
    else if (err < -0.6) { c.throttle = 0; const need = Math.min(1, (-err) / 4 + 0.15); c.brake = Math.min(1, Math.max(c.brake, Math.min(need, c.brake + dt * 1.5))); c.dyn = c.brake; }
    else { c.throttle = Math.max(0, c.throttle - dt * 0.6); c.brake = Math.max(0, c.brake - dt * 0.5); c.dyn = c.brake; }
    if (train.slip) c.throttle = Math.max(0, c.throttle - dt * 0.8);
    c.sand = slipAgo < 4 || train.slide;
    this.comfortLimit(train, dt);
  }

  /** Fahrgastkomfort: Beschleunigung/Verzögerung des KI-Zuges auf etwa 1 m/s² begrenzen (leichte Triebwagen, Steilstrecken) */
  private comfortLimit(train: Train, dt: number) {
    const c = train.ctl, a = train.acc;
    if (a > 1.0) { if (c.throttle > 0) c.throttle = Math.max(0, c.throttle - dt * (a - 0.9) * 4); else { c.brake = Math.min(1, c.brake + dt); c.dyn = c.brake; } }
    else if (a < -1.1 && train.v > 0.5) { if (c.brake > 0.2) { c.brake = Math.max(0, c.brake - dt * 2); c.dyn = c.brake; } else { c.brake = 0; c.dyn = 0; c.throttle = Math.min(1, c.throttle + dt * (-a - 1.0) * 4); } }
  }

  /** Planbremsverzögerung (konservativ) */
  planDecel(train: Train): number {
    const freight = train.consist.some((v) => v.type.cls === 12 && v.type.traction === 'none');
    const base = freight ? 0.32 : train.consist.every((v) => v.type.ep) ? 0.75 : 0.55;
    const railF = this.rail === 'dry' ? 1 : this.rail === 'wet' ? 0.85 : 0.65;
    return base * railF;
  }

  /** Strengste Geschwindigkeitsbeschränkung unter dem Zug (km/h) */
  limitUnder(train: Train): number {
    let v = train.vmax;
    for (const s of this.spans.get(train.id) ?? []) {
      v = Math.min(v, trackLimit(this.net, s.t));
      for (const sp of this.net.def.speeds) if (sp.track === s.t && sp.s0 < s.s1 && sp.s1 > s.s0) v = Math.min(v, sp.vmax);
    }
    // Bahnübergang gestört
    for (const cr of this.net.def.crossings) if (this.crossings.get(cr.id)?.failed) {
      for (const s of this.spans.get(train.id) ?? []) if (s.t === cr.track && cr.s >= s.s0 - 50 && cr.s <= s.s1 + 50) v = Math.min(v, 20);
    }
    if (this.plans.get(train.id)?.shunt) v = Math.min(v, 25);
    if ((train.meta.zs1Limit as number ?? 0) > this.time) v = Math.min(v, 40);
    return v;
  }

  // ---------------------------------------------------------------- Fahrplanfortschritt
  private progress(train: Train) {
    const plan = this.plans.get(train.id); if (!plan) return;
    const svc = plan.svc;
    if (plan.state === 'run') {
      if (Math.abs(train.v) > 0.05) { plan.waitSince = undefined; return; }
      plan.waitSince ??= this.time;
      const last = plan.path[plan.path.length - 1];
      if (!last || train.head.t !== last.t) {
        // KI-Zug steht vor rotem Signal ohne Plan → neu planen nach 30 s
        if (train.ai && this.time - plan.waitSince > 30 && plan.path.findIndex((s) => s.t === train.head.t) < 0) this.planNext(train);
        return;
      }
      const stop = svc && plan.stopIdx < svc.stops.length ? svc.stops[plan.stopIdx] : null;
      if (stop) {
        const pl = this.platformsOn.get(train.head.t)?.find((x) => x.st.id === stop.st);
        const sp = this.stopPoint(train, plan);
        // Spieler: Halt zählt auch, wenn der Zug irgendwo vollständig am Bahnsteig steht
        if (pl && sp && (Math.abs(sp.d) < 25 + (train.ai ? 0 : 15) || (!train.ai && this.trainOnPlatform(train, pl.p)))) {
          const ok = this.trainOnPlatform(train, pl.p);
          const delay = stop.arr !== undefined ? this.time - stop.arr : 0;
          plan.delay = Math.max(0, delay);
          plan.arrived.push({ st: stop.st, arr: this.time, delay, ok });
          if (!ok && !train.ai) this.emit({ type: 'platform', msg: 'Zug steht nicht vollständig am Bahnsteig', sev: 'warn', train: train.id });
          const dwell = stop.dwell ?? (svc?.kind === 'GZ' ? 0 : 30);
          plan.dwellUntil = Math.max(this.time + dwell, stop.dep ?? 0);
          plan.state = 'dwell';
          if (train.ai && train.hasDoors && dwell > 0) { const side = pl.p.side; train.ctl.releaseL = side === 'L' ? !train.consist[0].flipped : false; train.ctl.releaseR = !train.ctl.releaseL; train.ctl.openL = train.ctl.openR = true; }
          if (!train.ai) this.emit({ type: 'arrive', msg: `${pl.st.name} erreicht${delay > 60 ? ` (+${Math.round(delay / 60)} min)` : ''}`, sev: 'info', train: train.id, data: { st: stop.st, delay } });
          plan.stopIdx++;
        }
      } else if (svc?.endTrack && train.head.t === svc.endTrack) { plan.state = 'done'; }
    }
    if (plan.state === 'dwell' && this.time >= plan.dwellUntil) {
      if (train.ai) {
        if (train.hasDoors && train.doorsOpen) { train.ctl.openL = train.ctl.openR = false; return; }
        if (train.doorsOpen) return;
        train.ctl.releaseL = train.ctl.releaseR = false;
      }
      const last = plan.arrived[plan.arrived.length - 1]; if (last) last.dep = this.time;
      if (svc && plan.stopIdx >= svc.stops.length && !svc.endTrack) { plan.state = 'done'; return; }
      this.planNext(train);
    }
  }

  trainOnPlatform(train: Train, p: PlatformDef): boolean {
    const sp = this.spans.get(train.id) ?? [];
    const onP = sp.filter((s) => s.t === p.track).reduce((a, s) => a + Math.max(0, Math.min(s.s1, p.s1) - Math.max(s.s0, p.s0)), 0);
    return onP >= Math.min(train.length, p.s1 - p.s0) - 6;
  }

  // ---------------------------------------------------------------- Zugbeeinflussung (Spielmodell)
  private safety(train: Train, dt: number) {
    if (this.assist === 'easy') {
      // Zwangsbremsung (z. B. nach Signalüberfahrt) im Stillstand wieder lösen – sonst bliebe der Zug für immer stehen
      if (train.forcedBrake && Math.abs(train.v) < 0.05 && train.forcedBrake !== '!Sifa') { train.forcedBrake = null; this.emit({ type: 'release', msg: 'Zwangsbremsung beendet – weiterfahren', sev: 'info', train: train.id }); }
      // Bremsassistent: hält vor Halt zeigenden Signalen, Prellböcken und Fahrzeugen automatisch an.
      // Vorsichtige Bremskurve (Luftbremse braucht Zeit), 20 m Sicherheitsabstand
      const decel = this.planDecel(train) * 1.25, sDecel = this.planDecel(train) * 0.8;
      const la = lookahead(this.net, this.il, train.head, 2500, { occupiedBy: (t) => this.occupiedOn.get(t) ?? [], self: train.id, pass: train.meta.zs1 as string | undefined });
      const lim0 = permitted(la.targets.filter((t) => t.v === 0), sDecel, 20, train.length, 999);
      if (lim0 < 0.3) { train.ctl.throttle = 0; train.ctl.brake = Math.max(train.ctl.brake, 0.6); } // vor rotem Signal gar nicht erst anfahren
      // Haltassistent: hält auch am nächsten Bahnsteig (Haltepunkt etwa 2 m vor dem Ziel)
      const plan = this.plans.get(train.id);
      // nur wenn der geplante Weg wirklich am Bahnsteig endet – sonst würde der Assistent am Ende des bisher gestellten Weges anhalten
      const sp = plan?.state === 'run' && this.stopTarget(train, plan)?.side ? this.stopPoint(train, plan) : null;
      const stopLim = sp && sp.d > -5 && plan!.svc ? permitted([{ d: sp.d + 4, v: 0, kind: 'stop' }], decel, 12, train.length, 999) : 999;
      const lim = Math.min(lim0, stopLim);
      train.meta.assistBrake = train.v > lim + 0.5;
      if (sp && train.v > Math.sqrt(2 * decel * Math.max(0, sp.d + 4)) + 1) train.meta.assistStopT = (train.meta.assistStopT as number ?? 0) + dt; // > 2 s = Assistent hat den Halt gebremst
      if (train.v > lim + 0.5) { train.ctl.throttle = 0; train.ctl.brake = Math.max(train.ctl.brake, Math.min(1, (train.v - lim) / 3 + 0.3)); }
      const vl = this.limitUnder(train);
      if (train.kmh > vl + 2) { train.ctl.throttle = 0; train.ctl.brake = Math.max(train.ctl.brake, 0.4); }
      return;
    }
    // Geschwindigkeitsüberwachung
    const vl = this.limitUnder(train);
    if (train.kmh > vl + 10) {
      train.meta.overT = (train.meta.overT as number ?? 0) + dt;
      if ((train.meta.overT as number) > 4 && !train.forcedBrake) { train.forcedBrake = 'Geschwindigkeitsüberschreitung'; this.score.overspeed++; this.emit({ type: 'overspeed', msg: `Zwangsbremsung: ${Math.round(train.kmh)} km/h bei erlaubten ${vl} km/h`, sev: 'error', train: train.id }); }
    } else train.meta.overT = 0;
    if (train.forcedBrake && Math.abs(train.v) < 0.05 && train.forcedBrake !== '!Sifa') { train.forcedBrake = null; this.emit({ type: 'release', msg: 'Zwangsbremsung beendet – Bremse lösen und weiterfahren', sev: 'info', train: train.id }); }
    if (this.assist !== 'expert') return;
    // PZB-Spielmodell: 1000 Hz bei Warnung, 500 Hz 250 m vor Halt, Restriktivmodus
    const la = lookahead(this.net, this.il, train.head, 1300, {});
    const sigs = la.targets.filter((x) => x.kind === 'signal');
    const z = this.pzb;
    const near = sigs[0];
    if (near && near.sig?.aspect === 'stop' && near.d < 1000 && near.d > 950 && z.need === 0 && !z.monitor) {
      z.need = 4; this.emit({ type: 'pzb1000', msg: 'PZB 1000 Hz: Wachsam-Taste (V) drücken!', sev: 'warn', train: train.id });
    }
    if (z.need > 0) { z.need -= dt; if (z.need <= 0) { train.forcedBrake = '!PZB'; z.need = 0; this.emit({ type: 'pzb_brake', msg: 'PZB-Zwangsbremsung: nicht quittiert', sev: 'error', train: train.id }); } }
    if (z.monitor > 0) {
      z.monitor += dt;
      if (z.monitor > 23 && train.kmh > 85) { train.forcedBrake = '!PZB'; this.emit({ type: 'pzb_brake', msg: 'PZB-Zwangsbremsung: 85 km/h nach 23 s überschritten', sev: 'error', train: train.id }); z.monitor = 0; }
      if (near && near.sig?.aspect === 'stop' && near.d < 250 && train.kmh > 65) { train.forcedBrake = '!PZB'; this.emit({ type: 'pzb_brake', msg: 'PZB 500 Hz: zu schnell vor Halt zeigendem Signal', sev: 'error', train: train.id }); z.monitor = 0; }
      if (!near || near.sig?.aspect !== 'stop' || z.monitor > 600) z.monitor = 0;
    }
  }

  pzbAck() { if (this.pzb.need > 0) { this.pzb.need = 0; this.pzb.monitor = 0.01; this.emit({ type: 'pzb_ack', msg: 'PZB quittiert – Geschwindigkeit überwacht', sev: 'info' }); } }

  // ---------------------------------------------------------------- Signalvorbeifahrt
  private passSignals(train: Train, before: TrackPos) {
    // prüft, ob die Spitze ein Signal passiert hat
    const after = train.head;
    const check = (t: string, s0: number, s1: number, d: Dir) => {
      for (const sig of this.net.signalsOn.get(t) ?? []) {
        if (sig.dir !== d) continue;
        const passed = d > 0 ? sig.s > s0 && sig.s <= s1 : sig.s < s0 && sig.s >= s1;
        if (!passed) continue;
        const st = this.il.signalState.get(sig.id)!;
        const plan = this.plans.get(train.id);
        if (plan) plan.lastSignal = sig.id;
        const shuntOk = plan?.shunt && (sig.def.kind === 'shunt' || this.net.track(sig.track).def.yard);
        if (st.aspect === 'stop' && train.meta.zs1 === sig.id) { train.meta.zs1 = undefined; train.meta.zs1Limit = this.time + 120; continue; }
        if (st.aspect === 'stop' && !shuntOk) {
          this.score.spad++;
          train.forcedBrake = '!SPAD'; train.ctl.emergency = true;
          this.emit({ type: 'spad', msg: `Signal ${sig.def.name ?? sig.id} bei Halt überfahren! Zwangsbremsung`, sev: 'error', train: train.id, data: sig.id });
        }
      }
    };
    if (before.t === after.t) check(after.t, before.s, after.s, after.d);
    else {
      const tb = this.net.track(before.t);
      check(before.t, before.s, before.d > 0 ? tb.len + 0.01 : -0.01, before.d);
      for (const st of train.trail) { if (st.t === before.t) break; const L = this.net.track(st.t).len; check(st.t, st.d > 0 ? -0.01 : L + 0.01, st.t === after.t ? after.s : st.d > 0 ? L : 0, st.d); }
    }
  }

  // ---------------------------------------------------------------- Kollisionen & Kuppeln
  private collisions() {
    const list = [...this.trains.values()];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const sa = this.spans.get(a.id)!, sb = this.spans.get(b.id)!;
      let overlap = false;
      for (const x of sa) for (const y of sb) if (x.t === y.t && x.s0 < y.s1 - 0.05 && y.s0 < x.s1 - 0.05) overlap = true;
      if (!overlap) continue;
      const rel = Math.abs(a.v) + Math.abs(b.v);
      const couplable = (a.isCut || b.isCut || a.meta.couple || b.meta.couple) && rel < 2.0;
      if (couplable) { this.couple(a, b); return; }
      // Trennen (ohne Kontakt) – Züge zurücksetzen und Kollision melden
      if (!this.collided) {
        this.collided = true; this.score.collisions++;
        a.v = 0; b.v = 0; a.ctl.emergency = true; b.ctl.emergency = true;
        this.emit({ type: 'collision', msg: `Zusammenstoß zwischen ${a.name} und ${b.name} (${Math.round(rel * 3.6)} km/h)!`, sev: 'error', train: a.id, data: b.id });
      }
    }
  }

  /** Kuppelt zwei sich berührende Züge zu einem */
  couple(a: Train, b: Train) {
    // Welcher Teil ist vorn? b berührt a: entweder an der Spitze oder am Schluss von a
    const net = this.net;
    const aHead = a.head, aTail = a.tail(net);
    const sb = this.spans.get(b.id)!;
    const touchesHead = sb.some((s) => s.t === aHead.t && aHead.s >= s.s0 - 1 && aHead.s <= s.s1 + 1);
    const keep = a.isCut && !b.isCut ? b : a, other = keep === a ? b : a;
    // Orientierung: other an keep anhängen
    const kHead = keep.head; const kTail = keep.tail(net);
    const oSpan = this.spans.get(other.id)!;
    const atHead = oSpan.some((s) => s.t === kHead.t && kHead.s >= s.s0 - 1.5 && kHead.s <= s.s1 + 1.5);
    void touchesHead; void aTail; void kTail;
    // other so drehen, dass er in dieselbe Richtung zeigt
    const oHead = other.head;
    const sameDir = (() => { const kt = keep.trail.find((s) => s.t === oHead.t); return kt ? kt.d === oHead.d : true; })();
    if (!sameDir) other.flip(net);
    if (atHead) {
      // other liegt vor keep: neue Spitze = other.head
      keep.consist = [...other.consist, ...keep.consist];
      keep.head = { ...other.head };
      keep.trail = [...other.trail.filter((s) => !keep.trail.some((k) => k.t === s.t)), ...keep.trail];
    } else {
      keep.consist = [...keep.consist, ...other.consist];
      keep.trail = [...keep.trail, ...other.trail.filter((s) => !keep.trail.some((k) => k.t === s.t))];
    }
    keep.recalc(); keep.v = 0; other.v = 0;
    keep.meta.couple = false;
    this.trains.delete(other.id); this.plans.delete(other.id);
    if (this.player === other.id) this.player = keep.id;
    this.refreshOccupancy();
    this.emit({ type: 'coupled', msg: `Gekuppelt: ${keep.consist.length} Fahrzeuge (${Math.round(keep.mass)} t)`, sev: 'info', train: keep.id });
  }

  /** Trennt einen Zug hinter Fahrzeug index (0-basiert) – hinterer Teil bleibt als Wagengruppe stehen */
  uncouple(train: Train, index: number): Train | null {
    if (index < 0 || index >= train.consist.length - 1) return null;
    if (Math.abs(train.v) > 0.1) { this.emit({ type: 'uncouple_fail', msg: 'Entkuppeln nur im Stillstand', sev: 'warn', train: train.id }); return null; }
    const rear = train.consist.slice(index + 1);
    const frontLen = train.consist.slice(0, index + 1).reduce((a, v) => a + v.type.len, 0) + 0.8 * index;
    const rearHead = train.posBehind(this.net, frontLen + 0.8);
    train.consist = train.consist.slice(0, index + 1); train.recalc();
    const id = `C${this.nextId++}`;
    const cut = new Train(id, `Wagengruppe ${id}`, rear, rearHead, this.net);
    cut.ai = true; cut.ctl.reverser = 0; cut.ctl.throttle = 0;
    // Bremse der abgekuppelten Wagen: Luft entweicht → Bremse liegt an (Schnellbremsung durch geöffnete Hauptluftleitung)
    cut.brake.pipe = 0; cut.brake.cyl = 1; cut.ctl.brake = 1;
    if (this.assist === 'easy') rear.forEach((v) => (v.handbrake = true));
    cut.meta.cut = true;
    this.trains.set(id, cut);
    this.refreshOccupancy();
    this.emit({ type: 'uncoupled', msg: `Abgekuppelt: ${rear.length} Fahrzeuge bleiben stehen${this.assist === 'easy' ? ' (Handbremse automatisch angezogen)' : ' – Handbremse anziehen!'}`, sev: 'info', train: train.id });
    return cut;
  }

  // ---------------------------------------------------------------- Bahnübergänge
  private updateCrossings() {
    for (const cr of this.net.def.crossings) {
      const st = this.crossings.get(cr.id)!;
      let near = false;
      for (const t of this.trains.values()) {
        if (Math.abs(t.v) < 0.1 && !this.spans.get(t.id)?.some((s) => s.t === cr.track && cr.s >= s.s0 - 5 && cr.s <= s.s1 + 5)) continue;
        const la = lookahead(this.net, null, t.head, Math.max(400, Math.abs(t.v) * 40), { ignoreSignals: true });
        // Distanz zur Kreuzung entlang Pfad
        let acc = 0;
        for (const p of la.path) {
          const L = this.net.track(p.t).len;
          const from = p.t === t.head.t ? t.head.s : p.d > 0 ? 0 : L;
          if (p.t === cr.track) { const d = p.d > 0 ? cr.s - from : from - cr.s; if (d >= -5) { if (acc + d < Math.max(400, Math.abs(t.v) * 40)) near = true; break; } }
          acc += p.d > 0 ? L - from : from;
        }
        if (this.spans.get(t.id)?.some((s) => s.t === cr.track && cr.s >= s.s0 - 5 && cr.s <= s.s1 + 5)) near = true;
      }
      st.closed = near ? Math.min(1, st.closed + 1 / 6) : Math.max(0, st.closed - 1 / 5);
    }
  }

  // ---------------------------------------------------------------- Takt
  /** Noch nicht simulierte Zeit seit dem letzten Takt (s) – für flüssige Darstellung zwischen den Takten */
  get pendingTime() { return this.acc; }

  /** Echtzeit-Fortschritt (dt in s Wanduhr) – führt feste Takte aus */
  update(dtReal: number) {
    this.acc += Math.min(dtReal, 0.25) * this.speedMul;
    let n = 0;
    while (this.acc >= TICK && n < 60) { this.tick(); this.acc -= TICK; n++; }
    if (n >= 60) this.acc = 0;
  }

  tick() {
    const dt = TICK;
    this.time += dt;
    // Einsatz geplanter Züge
    if (this.pending.length) {
      for (const svc of [...this.pending]) if (this.time >= svc.spawn) {
        const t = this.spawnService(svc);
        if (t) { this.pending.splice(this.pending.indexOf(svc), 1); if (svc.player) this.player = t.id; }
        else svc.spawn = this.time + 30;
      }
    }
    this.refreshOccupancy();
    this.il.step(dt);
    if (Math.floor(this.time * 2) !== Math.floor((this.time - dt) * 2)) this.dispatch();
    for (const train of this.trains.values()) {
      const plan = this.plans.get(train.id);
      if (train.ai) this.drive(train, plan, dt);
      else if (train.id === this.player) this.safety(train, dt);
      const before = { ...train.head };
      train.step(this.net, { rail: this.rail, assist: train.ai ? 'easy' : this.assist }, dt);
      if (before.t !== train.head.t || before.s !== train.head.s) this.passSignals(train, before);
      for (const e of train.events.splice(0)) {
        if (e.type === 'buffer') this.score.buffers++;
        if (e.type === 'trailed') this.score.trailed++;
        if (e.type === 'doors_moving') this.score.doors++;
        if (!train.ai || e.sev === 'error') this.emit({ ...e, train: train.id });
      }
      this.progress(train);
      if (train.ai && train.id !== this.player && plan?.state === 'done' && !plan.svc?.keep && plan.svc && Math.abs(train.v) < 0.05 && this.time > plan.dwellUntil + 60) this.removeTrain(train.id);
    }
    this.dirtyAI = false;
    this.refreshOccupancy();
    this.collisions();
    if (Math.floor(this.time) !== Math.floor(this.time - dt)) {
      this.updateCrossings();
      if (Math.floor(this.time) % 5 === 0) this.detectDeadlock();
    }
  }

  private detectDeadlock() {
    const waits = new Map<string, string | null>();
    for (const t of this.trains.values()) {
      if (!t.ai || Math.abs(t.v) > 0.05) continue;
      const plan = this.plans.get(t.id); if (!plan || plan.state !== 'run') continue;
      const la = lookahead(this.net, this.il, t.head, 3000, {});
      const sig = la.targets.find((x) => x.kind === 'signal');
      if (!sig?.ref) continue;
      const idx = plan.path.findIndex((s) => s.t === this.net.signals.get(sig.ref!)!.track);
      const nextT = plan.path[idx + 1]?.t;
      const blocker = nextT ? this.occupiedOn.get(nextT)?.[0]?.train ?? this.il.locked.get(nextT)?.train ?? null : null;
      waits.set(t.id, blocker && blocker !== t.id ? blocker : null);
    }
    this.deadlock = Interlocking.deadlocks(waits);
    if (this.deadlock.length && !this.events.some((e) => e.type === 'deadlock' && this.time - e.t < 120)) {
      this.emit({ type: 'deadlock', msg: `Verklemmung erkannt: ${this.deadlock.map((c) => c.map((id) => this.trains.get(id)?.name ?? id).join(' ↔ ')).join('; ')} – Fahrstraße zurücknehmen oder Zug umleiten`, sev: 'error' });
    }
  }

  clock(): string { return fmt(this.time); }
}

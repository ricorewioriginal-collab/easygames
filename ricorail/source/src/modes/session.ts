// Spielsitzung: Welt, Spielerzug, Szenarioziele, Störungen, Güterladen, Fahrgäste und Wertung.
import type { CargoType, IndustryDef, NetworkDef, TrackPos } from '../railway/schema';
import { World, type Assist, type Plan, type Service, type Weather } from '../operations/world';
import type { Train } from '../trains/train';
import { LINES, nextDeparture, timetable } from '../data/services';
import { lookahead } from '../operations/lookahead';
import { FORM } from '../trains/stock';

export type Goal =
  | { t: 'timetable'; maxLate: number }
  | { t: 'reach'; st?: string; track?: string; stop?: boolean }
  | { t: 'deliver'; cargo: CargoType; n: number; from: string; to: string }
  | { t: 'load'; cargo: CargoType; n: number; at: string }
  | { t: 'couple'; n: number }
  | { t: 'park'; at: string; n: number }
  | { t: 'box'; trains: number; maxLate: number }
  | { t: 'nospad' }
  | { t: 'nooverspeed' }
  | { t: 'comfort'; min: number }
  | { t: 'energy'; maxKWh: number }
  | { t: 'timeLimit'; s: number }
  | { t: 'precise'; maxDist: number }
  | { t: 'doors' };

export type Fault =
  | { t: 'signal'; after: number }
  | { t: 'switch'; after: number }
  | { t: 'crossing'; after: number }
  | { t: 'slow'; after: number; vmax: number; len: number }
  | { t: 'door'; stopIdx: number }
  | { t: 'panto'; after: number }
  | { t: 'obstacle'; after: number }
  | { t: 'adhesion' };

export type PlayerSpec =
  | { kind: 'service'; line: string; back?: boolean; dep: number; from?: string; to?: string; form?: string }
  | { kind: 'free'; form?: string; vehicles?: string[]; loads?: number[]; at: { st?: string; plat?: number; industry?: string; track?: string; s?: number; d?: 1 | -1; out?: boolean }; dest?: { st?: string; industry?: string }; cold?: boolean; shunt?: boolean; cut?: { vehicles: string[]; loads?: number[]; industry?: string; gap?: number } }
  | { kind: 'box' }
  | { kind: 'none' };

export interface Scenario {
  id: string;
  cat: 'pax' | 'freight' | 'shunt' | 'box' | 'weather' | 'fantasy';
  title: string; route: string; desc: string;
  time: number; weather: Weather; difficulty: 1 | 2 | 3;
  player: PlayerSpec;
  traffic: number;
  goals: Goal[];
  faults?: Fault[];
  /** Karriere: benötigter Rang; exam = Prüfungsfahrt */
  rank?: number; exam?: boolean; xp?: number;
  assist?: Assist;
  /** Stellwerk: Bereich (Stationen) für die Ansicht */
  boxArea?: string[];
}

export interface GoalState { goal: Goal; text: string; done: boolean; failed: boolean; value?: string }
export interface Result { ok: boolean; score: number; stars: 0 | 1 | 2 | 3; items: { label: string; value: string; pts: number }[]; reason?: string; xp: number }

export interface SessionOpts {
  def: NetworkDef; routeId: string; time: number; weather: Weather; assist: Assist;
  traffic: number; player: PlayerSpec; scenario?: Scenario; autoDispatch?: boolean;
}

const fmtMin = (s: number) => `${s < 0 ? '−' : '+'}${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, '0')}`;

export class Session {
  readonly world: World;
  readonly opts: SessionOpts;
  readonly sc: Scenario | null;
  player: Train | null = null;
  goals: GoalState[] = [];
  /** Meldungen für die Oberfläche (Zeit, Text, Schwere) */
  messages: { t: number; msg: string; sev: 'info' | 'warn' | 'error' }[] = [];
  /** Hindernisse (Störung „Baum auf dem Gleis“) */
  obstacles: { track: string; s: number; cleared: boolean; x: number; y: number; z: number }[] = [];
  finished: Result | null = null;
  pax = { onboard: 0, total: 0, revenue: 0 };
  delivered = 0; loaded = 0; coupledN = 0;
  /** bereits gezählte beladene Wagen (Be- und Entladen im Wechsel zählt nicht mehrfach) */
  private loadedV = new Set<object>();
  stopErrors: number[] = [];
  /** Haltepunkte: jeder Halt des Spielers wird bewertet (Genauigkeit + Pünktlichkeit) */
  stopPts = 0;
  stopCount = 0;
  praise: { t: number; text: string; pts: number; top: boolean } | null = null;
  /** Türen öffnet/schließt das Spiel (einfache Bedienung) */
  autoDoors = false;
  doorsMissed = 0;
  private t0: number;
  private faultsDone = new Set<number>();
  private doorFault: { active: boolean; isolated: boolean } = { active: false, isolated: false };
  private lastEv = 0;
  private zs1Req: { sig: string; at: number } | null = null;
  private loading: { kind: 'load' | 'unload'; until: number; ind: IndustryDef } | null = null;
  private feederT = 0;
  private boxLate = 0;
  /** Stellwerk: Züge im Bereich (Verspätung beim Eintritt, Ankünfte beim Verlassen) */
  private boxSeen = new Map<string, { base: number; left?: number; arr0?: number }>();
  private boxPassed = 0;
  private boxTracks: Set<string> | null = null;
  private lastArrived = 0;
  private stopDoorOpened = false;

  constructor(opts: SessionOpts) {
    this.opts = opts; this.sc = opts.scenario ?? null;
    const w = new World(opts.def, opts.time);
    this.world = w;
    w.setWeather(opts.weather);
    w.assist = opts.assist;
    if (opts.autoDispatch === false) w.autoDispatch = false;
    if (this.sc?.faults?.some((f) => f.t === 'adhesion')) w.rail = opts.weather.season === 'winter' ? 'ice' : 'leaves';
    this.t0 = opts.time;
    // Hintergrundverkehr
    if (opts.traffic > 0) {
      const svc = timetable(w.net, opts.routeId, opts.time - 3600, opts.time + 4 * 3600, opts.traffic);
      w.pending.push(...svc);
    }
    if (opts.player.kind === 'box') for (const id of boxSignals(w, this.sc?.boxArea ?? [])) w.manual.add(id);
    for (const g of this.sc?.goals ?? []) this.goals.push({ goal: g, text: goalText(g, w), done: false, failed: false });
  }

  /** Vorlauf ohne Spieler: Züge, die vor Spielbeginn abgefahren sind, an ihre Position bringen. Liefert Fortschritt 0..1 über onStep. */
  async prerun(seconds: number, onStep?: (f: number) => void) {
    const w = this.world;
    // Vorlauf endet genau zur Szenariozeit
    const end = w.time;
    w.time -= seconds; w.il.time = w.time;
    const start = w.time;
    // Züge, deren Abfahrt schon vor dem Vorlauf lag, nicht nachträglich alle zugleich einsetzen (Pulk an den Startbahnhöfen)
    w.pending = w.pending.filter((x) => x.player || x.spawn >= start - 60);
    // Stellwerksbereich des Spielers im Vorlauf automatisch stellen (sonst stauen sich Züge schon vor Spielbeginn)
    const manual = [...w.manual]; w.manual.clear();
    let n = 0;
    while (w.time < end) {
      w.tick();
      if (++n % 3000 === 0) { onStep?.((w.time - start) / seconds); await new Promise((r) => setTimeout(r, 0)); }
    }
    for (const id of manual) w.manual.add(id);
    w.events.length = 0;
  }

  /** Spielerzug einsetzen */
  spawnPlayer(): Train | null {
    const w = this.world, p = this.opts.player;
    if (p.kind === 'service') {
      const line = (LINES[this.opts.routeId] ?? []).find((l) => l.id === p.line);
      if (!line) throw new Error(`Linie ${p.line} fehlt`);
      // Teilstrecke: Abfahrt am Einstiegsbahnhof ≥ gewünschte Zeit
      const probe = nextDeparture(w.net, line, !!p.back, p.dep);
      const i0 = p.from ? Math.max(0, probe.stops.findIndex((x) => x.st === p.from)) : 0;
      const delta = (probe.stops[i0].dep ?? probe.stops[0].dep ?? 0) - (probe.stops[0].dep ?? 0);
      const full = nextDeparture(w.net, line, !!p.back, p.dep - delta);
      const i1 = p.to ? full.stops.findIndex((x) => x.st === p.to) : full.stops.length - 1;
      const stops = full.stops.slice(i0, (i1 < 0 ? full.stops.length - 1 : i1) + 1).map((x, k, a) => ({ ...x, arr: k === 0 ? undefined : x.arr, dep: k === a.length - 1 ? undefined : x.dep }));
      // Dieselbe Fahrt nicht zusätzlich als Hintergrundverkehr fahren lassen (doppelter Zug im selben Fahrplanplatz)
      const same = (x: Service) => x.id.startsWith(line.id + (p.back ? 'b' : 'a')) && Math.abs((x.stops[0].dep ?? 0) - (full.stops[0].dep ?? 0)) < 90;
      w.pending = w.pending.filter((x) => !same(x));
      for (const [id, pl] of [...w.plans]) if (pl.svc && !pl.svc.player && same(pl.svc)) w.removeTrain(id);
      const svc: Service = { ...full, stops, form: p.form ?? full.form, player: true };
      svc.spawn = w.time; svc.id = 'player';
      // erste Abfahrt nicht vor Spielbeginn + 60 s
      const shift = Math.max(0, w.time + 90 - (svc.stops[0].dep ?? w.time));
      for (const st of svc.stops) { if (st.arr !== undefined) st.arr += shift; if (st.dep !== undefined) st.dep += shift; }
      // Belegung am Startbahnsteig freimachen (KI-Züge dort entfernen)
      const t = this.spawnService(svc);
      if (!t) return null;
      this.player = t; w.player = t.id; t.ai = false;
      this.lastArrived = w.plans.get(t.id)?.arrived.length ?? 0; // Startbahnhof zählt nicht als Ankunft
      return t;
    }
    if (p.kind === 'free') {
      const pos = this.resolveAt(p.at);
      if (!pos) throw new Error('Startposition nicht gefunden');
      this.clearAround(pos.t);
      const t = w.addTrain({ id: 'P1', name: 'Ihr Zug', form: p.form, vehicles: p.vehicles, loads: p.loads, pos, ai: false, cold: p.cold });
      w.player = t.id; this.player = t;
      const plan: Plan = { svc: null, stopIdx: 0, path: [], state: 'run', dwellUntil: 0, delay: 0, arrived: [], shunt: p.shunt };
      w.plans.set(t.id, plan);
      if (p.dest) { const d = this.resolveDest(p.dest); if (d) { plan.dest = d; w.planNext(t); } }
      if (p.cold && w.assist !== 'easy') t.coldStart(); else t.prepare();
      // Wagengruppe (zum Ankuppeln) bereitstellen
      if (p.cut) {
        const cpos = p.cut.industry ? this.resolveAt({ industry: p.cut.industry }) : null;
        const head = cpos ?? t.posBehind(w.net, -(p.cut.gap ?? 60));
        const cut = w.addTrain({ name: 'Wagengruppe', vehicles: p.cut.vehicles, loads: p.cut.loads, pos: head, ai: true });
        cut.ctl.reverser = 0; cut.brake.cyl = 1; cut.brake.pipe = 0; cut.ctl.brake = 1; cut.meta.cut = true;
      }
      return t;
    }
    return null;
  }

  private spawnService(svc: Service): Train | null {
    const w = this.world;
    const st = w.stations.get(svc.stops[0].st);
    for (const p of st?.platforms ?? []) this.clearAround(p.track, true);
    return w.spawnService(svc);
  }

  /** Entfernt KI-Züge, die einen Startplatz blockieren */
  private clearAround(track: string, onlyIfAll = false) {
    const w = this.world;
    for (const o of w.occupiedOn.get(track) ?? []) {
      const t = w.trains.get(o.train);
      if (t && t.ai && !t.meta.cut && t.id !== this.player?.id) { if (!onlyIfAll || true) w.removeTrain(t.id); }
    }
    // noch nicht befahrene Fahrstraßen anderer Züge in dieses Gleis zurücknehmen (sonst Einfahrt auf den Spielerzug)
    for (const sr of [...w.il.set.values()]) if (!sr.entered && sr.def.steps.some((x) => x.t === track)) w.il.release(sr);
    w.refreshOccupancy();
  }

  industry(name: string): IndustryDef | undefined { return this.world.net.def.industries.find((i) => i.name === name || i.id === name); }

  resolveAt(at: { st?: string; plat?: number; industry?: string; track?: string; s?: number; d?: 1 | -1; out?: boolean }): TrackPos | null {
    const net = this.world.net;
    if (at.industry) {
      const ind = this.industry(at.industry); if (!ind) return null;
      const tr = net.track(ind.track);
      // Gleisende Richtung Prellbock = Fahrtrichtung, Spitze am vorderen Ende der Ladestelle
      const buf: 1 | -1 = net.isBuffer(ind.track, 1) ? 1 : -1;
      // out: Spitze zur Ausfahrt (Zug steht mit den Wagen an der Ladestelle und kann ohne Wenden abfahren)
      const d = (at.out ? -buf : buf) as 1 | -1;
      if (at.out) return { t: ind.track, s: buf > 0 ? Math.max(8, ind.s0) : Math.min(tr.len - 8, ind.s1), d };
      return { t: ind.track, s: d > 0 ? Math.min(tr.len - 8, ind.s1) : Math.max(8, ind.s0), d };
    }
    if (at.track) return { t: at.track, s: at.s ?? net.track(at.track).len / 2, d: at.d ?? 1 };
    if (at.st) {
      const st = this.world.stations.get(at.st); if (!st) return null;
      const d = at.d ?? 1;
      // ohne feste Bahnsteignummer: Gleis passend zur Fahrtrichtung (kein Start im Gegengleis), möglichst frei
      const cands = at.plat !== undefined ? [st.platforms[at.plat]].filter((x) => x) : st.platforms;
      const score = (q: (typeof st.platforms)[number]) => { const pr = net.track(q.track).def.pref; return (pr !== undefined && pr !== d ? 1000 : 0) + (this.world.il.isFree(q.track) ? 0 : 100); };
      const p = [...cands].sort((a, b) => score(a) - score(b))[0]; if (!p) return null;
      let s = d > 0 ? p.s1 - 10 : p.s0 + 10;
      // nicht hinter einem Signal der Fahrtrichtung aufstellen
      for (const sig of net.signalsOn.get(p.track) ?? []) if (sig.dir === d) {
        if (d > 0 && s > sig.s - 6) s = Math.max(1, sig.s - 6);
        if (d < 0 && s < sig.s + 6) s = Math.min(net.track(p.track).len - 1, sig.s + 6);
      }
      return { t: p.track, s, d };
    }
    return null;
  }

  resolveDest(dest: { st?: string; industry?: string }): string | undefined {
    if (dest.industry) return this.industry(dest.industry)?.track;
    if (dest.st) {
      // Bahnsteiggleis mit dem günstigsten Weg (Regelgleis statt Gegengleis)
      const net = this.world.net, from = this.player?.head, pl = this.world.stations.get(dest.st)?.platforms ?? [];
      let best = pl[0]?.track, bc = Infinity;
      if (from) for (const q of pl) { const r = net.route(from, q.track); if (r && net.pathCost(r) < bc) { bc = net.pathCost(r); best = q.track; } }
      return best;
    }
    return undefined;
  }

  // ------------------------------------------------------------ Spieleraktionen
  private rateStop(err: number, delay: number, assisted: boolean, name: string) {
    const [grade, base] = err <= 2 ? ['Perfekter Halt!', 100] : err <= 5 ? ['Sehr guter Halt', 75] : err <= 10 ? ['Guter Halt', 50] : err <= 25 ? ['Halt in Ordnung', 25] : ['Am Bahnsteig', 10];
    const prec = assisted ? Math.round(base / 2) : base;
    const punct = delay <= 60 ? 50 : delay <= 180 ? 20 : 0;
    const pts = prec + punct;
    this.stopPts += pts; this.stopCount++;
    const text = `${assisted ? 'Haltassistent hat gebremst' : grade} · ${err.toFixed(1)} m${punct === 50 ? ' · pünktlich' : ''} · +${pts}`;
    this.praise = { t: this.world.time, text, pts, top: !assisted && err <= 5 && punct === 50 };
    this.say(`${name}: ${text} Punkte`, 'info');
  }

  say(msg: string, sev: 'info' | 'warn' | 'error' = 'info') { this.messages.push({ t: this.world.time, msg, sev }); if (this.messages.length > 60) this.messages.shift(); }

  /** Ersatzsignal (Zs 1) beim Fahrdienstleiter anfordern */
  requestZs1(): string {
    const t = this.player; if (!t) return '';
    const w = this.world;
    const la = lookahead(w.net, w.il, t.head, 400, {});
    const sig = la.targets.find((x) => x.kind === 'signal' && x.v === 0);
    if (!sig?.ref) return 'Kein Halt zeigendes Signal in der Nähe.';
    if (Math.abs(t.v) > 0.1) return 'Erst anhalten, dann Ersatzsignal anfordern.';
    if (sig.d > 250) return 'Näher an das Signal heranfahren (unter 250 m).';
    if (!w.il.failedSignals.has(sig.ref)) return 'Das Signal ist nicht gestört – bitte auf Fahrt warten.';
    this.zs1Req = { sig: sig.ref, at: w.time + 20 };
    return 'Fahrdienstleiter: „Verstanden, ich prüfe den Fahrweg." (ca. 20 s)';
  }

  isolateDoor(): string {
    if (!this.doorFault.active) return 'Keine Türstörung.';
    if (Math.abs(this.player?.v ?? 0) > 0.1) return 'Nur im Stillstand möglich.';
    this.doorFault.isolated = true; this.doorFault.active = false;
    return 'Tür abgesperrt und gesichert – Weiterfahrt möglich.';
  }

  /** Laden/Entladen an einer Ladestelle */
  cargo(kind: 'load' | 'unload'): string {
    const t = this.player; if (!t) return '';
    if (Math.abs(t.v) > 0.05) return 'Zum Laden anhalten.';
    const w = this.world;
    if (this.loading) return `${this.loading.ind.name}: ${this.loading.kind === 'load' ? 'Beladen' : 'Entladen'} läuft bereits …`;
    const sp = w.spans.get(t.id) ?? [];
    const ind = w.net.def.industries.find((i) => sp.some((s) => s.t === i.track && s.s1 > i.s0 && s.s0 < i.s1));
    if (!ind) return 'Keine Ladestelle unter dem Zug.';
    if (kind === 'load' && ind.action === 'unload') return `${ind.name}: hier wird nur entladen.`;
    if (kind === 'unload' && ind.action === 'load') return `${ind.name}: hier wird nur beladen.`;
    const n = this.wagonsAt(t, ind, kind).length;
    if (!n) return kind === 'load' ? `Keine passenden leeren Wagen an ${ind.name} (Ladegut: ${ind.cargo.map(cargoName).join(', ')}).` : `Keine passenden beladenen Wagen an ${ind.name}.`;
    this.loading = { kind, until: w.time + 25 + n * 4, ind };
    return `${ind.name}: ${kind === 'load' ? 'Beladen' : 'Entladen'} von ${n} Wagen läuft …`;
  }

  /** Wagen des Zuges, deren Mitte an der Ladestelle steht und zum Ladegut passt */
  private wagonsAt(t: Train, ind: IndustryDef, kind: 'load' | 'unload') {
    const w = this.world, offs = t.vehicleOffsets();
    return t.consist.filter((v, i) => {
      if (!v.type.payload || !v.type.cargo) return false;
      const p = t.posBehind(w.net, offs[i]);
      if (p.t !== ind.track || p.s < ind.s0 - 2 || p.s > ind.s1 + 2) return false;
      if (kind === 'load') return v.load < 1 && v.type.cargo.some((c) => ind.cargo.includes(c));
      return v.load > 0 && !!v.cargo && ind.cargo.includes(v.cargo);
    });
  }

  toggleCouple(): string {
    const t = this.player; if (!t) return '';
    t.meta.couple = !t.meta.couple;
    return t.meta.couple ? 'Kupplung bereit: langsam (unter 7 km/h) an die Wagen heranfahren.' : 'Kuppeln abgebrochen.';
  }

  uncouple(after: number): string {
    const t = this.player; if (!t) return '';
    const c = this.world.uncouple(t, after);
    return c ? `Abgekuppelt hinter Fahrzeug ${after + 1}.` : 'Entkuppeln nicht möglich (Stillstand? Fahrzeug gewählt?)';
  }

  /** Freie Welt: einen KI-Zug übernehmen */
  takeOver(id: string): boolean {
    const w = this.world, t = w.trains.get(id);
    if (!t || t.isCut) return false;
    if (this.player && this.player.id !== id) { this.player.ai = true; const pl = w.plans.get(this.player.id); if (pl && !pl.svc) { pl.state = 'done'; } }
    t.ai = false; w.player = t.id; this.player = t;
    t.ctl.reverser = 1;
    return true;
  }

  // ------------------------------------------------------------ Takt
  update(dt: number) {
    const w = this.world;
    w.update(dt);
    this.events();
    this.faults();
    this.ops();
    if (!this.finished) this.checkGoals();
  }

  private events() {
    const w = this.world;
    for (let i = this.lastEv; i < w.events.length; i++) {
      const e = w.events[i];
      if (!e.train || e.train === this.player?.id || e.sev === 'error') this.say(e.msg, e.sev);
    }
    this.lastEv = w.events.length;
    if (w.events.length > 300) { w.events.splice(0, 200); this.lastEv = w.events.length; }
  }

  private faults() {
    const w = this.world, t = this.player;
    const el = w.time - this.t0;
    (this.sc?.faults ?? []).forEach((f, i) => {
      if (this.faultsDone.has(i)) return;
      if ('after' in f && el < f.after) return;
      if (f.t === 'door') return; // ausgelöst bei Ankunft
      this.faultsDone.add(i);
      if (!t && f.t !== 'switch' && f.t !== 'signal') return;
      const la = t ? lookahead(w.net, null, t.head, 6000, { ignoreSignals: true }) : null;
      if (f.t === 'signal') {
        // nächstes Hauptsignal vor dem Spieler (oder im Stellwerksbereich irgendein Einfahrsignal)
        const sigs = t ? [...w.net.signals.values()].filter((s) => s.def.kind === 'main' && la!.path.some((p) => p.t === s.track && p.d === s.dir)) : [...w.net.signals.values()].filter((s) => s.def.name?.endsWith('A'));
        const cand = t ? sigs.find((s) => distAlong(w, t, s.track, s.s) > 1200) : sigs[0];
        if (cand) { w.il.failedSignals.add(cand.id); this.say(`Störung: Signal ${cand.def.name ?? cand.id} gestört. Davor anhalten und Ersatzsignal anfordern (Taste Z).`, 'warn'); }
      } else if (f.t === 'switch') {
        const sws = [...w.net.switches.values()].filter((s) => !t || la!.path.some((p) => p.t === s.trunk || s.legs.includes(p.t)));
        const sw = sws[Math.min(sws.length - 1, 2)];
        if (sw) { w.net.failed.add(sw.id); this.say(`Störung: Weiche ${sw.id} lässt sich nicht umstellen.`, 'warn'); }
      } else if (f.t === 'crossing') {
        const cr = w.net.def.crossings.find((c) => la!.path.some((p) => p.t === c.track));
        if (cr) { w.crossings.get(cr.id)!.failed = true; this.say('Störung: Bahnübergang technisch gestört – höchstens 20 km/h, Achtungssignal geben (Horn).', 'warn'); }
      } else if (f.t === 'slow') {
        const p = la!.path[Math.min(la!.path.length - 1, 3)];
        if (p) { const L = w.net.track(p.t).len; const s0 = Math.max(0, L / 2 - f.len / 2); w.net.def.speeds.push({ id: `La${i}`, track: p.t, s0, s1: Math.min(L, s0 + f.len), vmax: f.vmax, kind: 'works' }); this.say(`Langsamfahrstelle (Baustelle) voraus: ${f.vmax} km/h.`, 'warn'); }
      } else if (f.t === 'panto') {
        if (t && t.traction === 'electric') { t.ctl.panto = false; t.ctl.mainSwitch = false; this.say('Störung: Stromabnehmer gesenkt (Fahrdrahtschwankung). Stromabnehmer heben (P) und Hauptschalter einlegen (H).', 'warn'); }
      } else if (f.t === 'obstacle' && t) {
        // Baum 1,5–2 km voraus
        let acc = 0;
        for (const p of la!.path) {
          const L = w.net.track(p.t).len, from = p.t === t.head.t ? t.head.s : p.d > 0 ? 0 : L;
          const seg = p.d > 0 ? L - from : from;
          if (acc + seg > 1800) { const s = from + (1800 - acc) * p.d; const pt = w.net.track(p.t).point(s); this.obstacles.push({ track: p.t, s, cleared: false, x: pt.x, y: pt.y, z: pt.z }); break; }
          acc += seg;
        }
        this.say('Meldung: Sturm – Bäume auf der Strecke möglich. Auf Sicht fahren!', 'warn');
      }
    });
    // Ersatzsignal erteilen
    if (this.zs1Req && w.time >= this.zs1Req.at && t) {
      const sig = this.zs1Req.sig; this.zs1Req = null;
      t.meta.zs1 = sig;
      // Fahrweg sichern: passende Fahrstraße einstellen (Signal bleibt gestört)
      const plan = w.plans.get(t.id);
      const routes = w.il.routesFrom.get(sig) ?? [];
      const r = plan?.path.length ? routes.find((x) => x.steps.every((s) => plan.path.some((p) => p.t === s.t))) : routes.find((x) => x.sw.every((y) => w.net.switches.get(y.sw)!.state === y.state));
      if (r) w.il.setRoute(r, t.id);
      this.say('Ersatzsignal Zs 1: am gestörten Signal vorbei, höchstens 40 km/h bis zum nächsten Signal.', 'info');
    }
    // KI-Züge vor gestörten Signalen: Ersatzsignal nach 45 s
    if (w.il.failedSignals.size) for (const tr of w.trains.values()) {
      if (!tr.ai || Math.abs(tr.v) > 0.05) continue;
      const plan = w.plans.get(tr.id); if (!plan || plan.state !== 'run') continue;
      plan.waitSince ??= w.time;
      if (w.time - plan.waitSince < 45) continue;
      const la = lookahead(w.net, w.il, tr.head, 300, {});
      const s = la.targets.find((x) => x.kind === 'signal' && x.v === 0 && w.il.failedSignals.has(x.ref!));
      if (s && tr.meta.zs1 !== s.ref) {
        tr.meta.zs1 = s.ref;
        const idx = plan.path.findIndex((p) => p.t === w.net.signals.get(s.ref!)!.track);
        const rest = plan.path.slice(idx + 1);
        const r = (w.il.routesFrom.get(s.ref!) ?? []).find((x) => x.steps.every((st, i) => rest[i]?.t === st.t));
        if (r) w.il.setRoute(r, tr.id);
      }
    }
    // Türstörung
    if (this.doorFault.active && t) { t.doorR = Math.max(t.doorR, 0.35); }
    // Hindernis
    for (const o of this.obstacles) {
      if (o.cleared || !t) continue;
      const d = distAlong(w, t, o.track, o.s);
      if (d < 0 && d > -t.length) {
        o.cleared = true;
        if (Math.abs(t.kmh) > 5) { this.fail(`Zusammenstoß mit einem Baum bei ${Math.round(t.kmh)} km/h.`); w.score.collisions++; }
      } else if (d >= 0 && d < 250 && Math.abs(t.v) < 0.05) {
        o.cleared = true; this.say('Strecke geräumt: Der Baum wurde von der Feuerwehr entfernt. Weiterfahrt auf Sicht.', 'info');
      }
    }
  }

  /** Fahrgastwechsel, Ladevorgänge, Ankunftsauswertung */
  private ops() {
    const w = this.world, t = this.player; if (!t) return;
    const plan = w.plans.get(t.id);
    // Ladevorgang
    if (this.loading && w.time >= this.loading.until) {
      const { kind, ind } = this.loading; this.loading = null;
      if (Math.abs(t.v) > 0.05) { this.say('Ladevorgang abgebrochen – Zug ist angefahren!', 'error'); return; }
      const wag = this.wagonsAt(t, ind, kind);
      for (const v of wag) {
        if (kind === 'load') { v.cargo = ind.cargo.find((c) => v.type.cargo!.includes(c)) ?? null; v.load = v.type.payload ?? 0; v.dest = ind.id; if (!this.loadedV.has(v)) { this.loadedV.add(v); this.loaded++; } }
        else {
          for (const g of this.goals) if (g.goal.t === 'deliver' && v.cargo === g.goal.cargo && (this.industry(g.goal.to)?.id === ind.id) && (!v.dest || this.industry(g.goal.from)?.id === v.dest)) this.delivered++;
          v.load = 0; v.cargo = null; v.dest = undefined;
        }
      }
      this.say(`${ind.name}: ${wag.length} Wagen ${kind === 'load' ? 'beladen' : 'entladen'} (Zuggewicht ${Math.round(t.mass)} t).`, 'info');
    }
    // Ankunft am Bahnsteig
    if (plan && plan.arrived.length > this.lastArrived) {
      const a = plan.arrived[plan.arrived.length - 1];
      this.lastArrived = plan.arrived.length;
      const st = w.stations.get(a.st);
      // Haltgenauigkeit
      const sp = w.stopPoint(t, { ...plan, stopIdx: plan.stopIdx - 1 });
      if (sp) this.stopErrors.push(Math.abs(sp.d));
      if (sp && !t.ai && plan.arrived.length > 1) this.rateStop(Math.abs(sp.d), a.delay, (t.meta.assistStopT as number ?? 0) > 2, st?.name ?? '');
      t.meta.assistStopT = 0;
      this.stopDoorOpened = false;
      if (st && t.hasDoors && plan.arrived.length > 1) {
        const out = Math.round(this.pax.onboard * (0.15 + Math.random() * 0.3));
        const inn = Math.min(t.seats * 1.6 - (this.pax.onboard - out), Math.round((st.pax ?? 200) / 60 * (2 + Math.random() * 6)));
        this.pax.onboard = Math.max(0, this.pax.onboard - out + inn); this.pax.total += inn; this.pax.revenue += inn * 4.5;
        this.say(`${st.name}: ${out} Fahrgäste aus, ${Math.max(0, inn)} ein.${t.ai || this.autoDoors ? '' : ' Türen freigeben (T), nach dem Fahrgastwechsel schließen.'}`, 'info');
      }
      // Türstörung an diesem Halt
      (this.sc?.faults ?? []).forEach((f, i) => {
        if (f.t === 'door' && !this.faultsDone.has(i) && plan.arrived.length - 1 >= f.stopIdx) { this.faultsDone.add(i); this.doorFault.active = true; this.say('Störung: Tür 3 rechts schließt nicht. Tür absperren (Taste I), dann weiterfahren.', 'warn'); }
      });
    }
    if (plan?.state === 'dwell' && t.doorsOpen) this.stopDoorOpened = true;
    if (plan?.state === 'run' && plan.arrived.length > 1 && !this.stopDoorOpened && t.hasDoors && plan.arrived[plan.arrived.length - 1].dep && !t.meta[`door${plan.arrived.length}`]) {
      t.meta[`door${plan.arrived.length}`] = true; this.doorsMissed++;
      this.say('Am letzten Halt wurden die Türen nicht geöffnet.', 'warn');
    }
    if (plan) this.pax.onboard = Math.max(this.pax.onboard, plan.arrived.length === 1 && t.hasDoors ? Math.round(t.seats * 0.4) : this.pax.onboard);
    // Feeder für Stellwerk: Statistik der fertigen Züge
    this.feederT += 1;
  }

  fail(reason: string) {
    if (this.finished) return;
    this.finished = this.evaluate(false, reason);
  }

  // ------------------------------------------------------------ Ziele
  private checkGoals() {
    const w = this.world, t = this.player;
    const plan = t ? w.plans.get(t.id) : undefined;
    let all = this.goals.length > 0;
    for (const g of this.goals) {
      const G = g.goal;
      switch (G.t) {
        case 'timetable': {
          const svc = plan?.svc; if (!svc) { all = false; break; }
          const late = plan!.arrived.slice(1).reduce((a, x) => Math.max(a, x.delay), 0);
          g.value = `${plan!.arrived.length}/${svc.stops.length} Halte, max. Verspätung ${fmtMin(late)}`;
          g.done = plan!.arrived.length >= svc.stops.length && Math.abs(t!.v) < 0.05;
          if (g.done && late > G.maxLate) { g.failed = true; }
          break;
        }
        case 'reach': {
          const tr = G.track ?? (G.st ? w.stations.get(G.st)?.platforms.map((p) => p.track) : undefined);
          const tracks = Array.isArray(tr) ? tr : tr ? [tr] : [];
          const on = !!t && (w.spans.get(t.id) ?? []).some((s) => tracks.includes(s.t));
          g.done = on && (!G.stop || Math.abs(t!.v) < 0.05);
          break;
        }
        case 'deliver': g.value = `${this.delivered}/${G.n}`; g.done = this.delivered >= G.n; break;
        case 'load': g.value = `${this.loaded}/${G.n}`; g.done = this.loaded >= G.n; break;
        case 'couple': { const n = t ? t.consist.length : 0; g.value = `${n}/${G.n} Fahrzeuge`; g.done = n >= G.n; break; }
        case 'park': {
          const ind = this.industry(G.at);
          const cutHere = [...w.trains.values()].filter((x) => x.isCut && (w.spans.get(x.id) ?? []).some((s) => s.t === (ind?.track ?? G.at)));
          const n = cutHere.reduce((a, x) => a + x.consist.length, 0);
          const hb = cutHere.every((x) => x.consist.some((v) => v.handbrake) || w.assist === 'easy');
          g.value = `${n}/${G.n} Wagen abgestellt${!hb ? ' (Handbremse fehlt)' : ''}`;
          g.done = n >= G.n && hb && !!t && !(w.spans.get(t.id) ?? []).some((s) => s.t === (ind?.track ?? G.at));
          break;
        }
        case 'box': {
          this.boxTrack();
          const fin = this.boxPassed;
          g.value = `${fin}/${G.trains} Züge, max. Verspätung ${fmtMin(this.boxLate)}`;
          g.done = fin >= G.trains;
          if (this.boxLate > G.maxLate) g.failed = true;
          if (w.deadlock.length && w.time - this.t0 > 120) { const dl = w.events.filter((e) => e.type === 'deadlock').length; if (dl >= 3) { g.failed = true; } }
          break;
        }
        case 'nospad': g.failed = w.score.spad > 0; g.done = !g.failed; g.value = `${w.score.spad}`; break;
        case 'nooverspeed': g.failed = w.score.overspeed > 0; g.done = !g.failed; g.value = `${w.score.overspeed}`; break;
        case 'comfort': g.value = `${Math.round(t?.comfort ?? 0)} %`; g.done = (t?.comfort ?? 0) >= G.min; break;
        case 'energy': g.value = `${(t?.energyKWh ?? 0).toFixed(0)} kWh`; g.done = (t?.energyKWh ?? 0) <= G.maxKWh; break;
        case 'timeLimit': g.value = fmtMin(G.s - (w.time - this.t0)); g.failed = w.time - this.t0 > G.s; g.done = !g.failed; break;
        case 'precise': { const m = this.stopErrors.length ? Math.max(...this.stopErrors) : 0; g.value = `${m.toFixed(1)} m`; g.done = m <= G.maxDist; break; }
        case 'doors': g.value = `${this.doorsMissed} vergessen`; g.done = this.doorsMissed === 0; break;
      }
      if (g.failed && (G.t === 'nospad' || G.t === 'timeLimit' || G.t === 'box')) { this.fail(`Ziel nicht erfüllt: ${g.text}`); return; }
    }
    // Abschluss: Hauptziele (nicht Begleitziele) erfüllt
    const main = this.goals.filter((g) => ['timetable', 'reach', 'deliver', 'load', 'couple', 'park', 'box'].includes(g.goal.t));
    const bad = this.goals.find((g) => g.failed);
    if (bad) { this.fail(`Ziel nicht erfüllt: ${bad.text}`); return; }
    if (main.length && main.every((g) => g.done) && all) {
      const miss = this.goals.find((g) => !g.done);
      this.finished = miss ? this.evaluate(false, `Ziel nicht erfüllt: ${miss.text}`) : this.evaluate(true);
    }
    if (w.score.collisions > 0 && !this.finished) this.fail('Zusammenstoß.');
  }


  /** Stellwerk-Ziel: nur Züge, die durch die Bereichsbahnhöfe fahren; Verspätung, die dort entsteht (bis zum nächsten Halt danach) */
  private boxTrack() {
    const w = this.world;
    if (!this.boxTracks) { this.boxTracks = new Set(); for (const id of this.sc?.boxArea ?? []) for (const p of w.stations.get(id)?.platforms ?? []) this.boxTracks.add(p.track); }
    const live = (id: string) => {
      const p = w.plans.get(id); if (!p) return 0;
      const st = p.svc && p.state === 'run' && p.stopIdx < p.svc.stops.length ? p.svc.stops[p.stopIdx] : null;
      return Math.max(p.delay, st?.arr !== undefined ? w.time - st.arr : 0);
    };
    for (const [id, t] of w.trains) {
      if (t.isCut || !w.plans.get(id)?.svc) continue;
      const inside = (w.spans.get(id) ?? []).some((sp) => this.boxTracks!.has(sp.t));
      let e = this.boxSeen.get(id);
      if (!e) { if (!inside) continue; e = { base: live(id) }; this.boxSeen.set(id, e); }
      if (e.left === undefined) {
        this.boxLate = Math.max(this.boxLate, live(id) - e.base);
        if (!inside) { e.left = w.time; e.arr0 = w.plans.get(id)!.arrived.length; this.boxPassed++; }
      } else if (e.arr0 !== undefined) {
        // bis zum nächsten Halt nach dem Bereich weiter messen (Wartezeit vor Ausfahrsignalen zählt mit)
        const p = w.plans.get(id)!;
        if (p.arrived.length > e.arr0) { this.boxLate = Math.max(this.boxLate, p.delay - e.base); e.arr0 = undefined; }
      }
    }
  }

  /** Wertung */
  evaluate(ok: boolean, reason?: string): Result {
    const w = this.world, t = this.player;
    const items: Result['items'] = [];
    let score = ok ? 1000 : 0;
    const add = (label: string, value: string, pts: number) => { items.push({ label, value, pts }); score += pts; };
    const plan = t ? w.plans.get(t.id) : undefined;
    if (plan?.svc) {
      const late = plan.arrived.slice(1).reduce((a, x) => a + Math.max(0, x.delay - 60), 0);
      add('Pünktlichkeit', `${Math.round(late / 60)} min Verspätung gesamt`, -Math.min(400, Math.round(late / 60) * 25));
    }
    if (this.stopErrors.length) { const m = this.stopErrors.reduce((a, b) => a + b, 0) / this.stopErrors.length; add('Haltgenauigkeit', `Ø ${m.toFixed(1)} m`, Math.round(Math.max(-150, 100 - m * 10))); }
    if (t?.hasDoors) add('Fahrgastkomfort', `${Math.round(t.comfort)} %`, Math.round((t.comfort - 80) * 3));
    if (w.score.overspeed) add('Geschwindigkeitsüberschreitungen', String(w.score.overspeed), -100 * w.score.overspeed);
    if (w.score.spad) add('Signal überfahren', String(w.score.spad), -500 * w.score.spad);
    if (w.score.buffers) add('Prellbock-Aufprall', String(w.score.buffers), -150 * w.score.buffers);
    if (w.score.trailed) add('Weiche aufgefahren', String(w.score.trailed), -200 * w.score.trailed);
    if (this.doorsMissed) add('Türen nicht geöffnet', String(this.doorsMissed), -50 * this.doorsMissed);
    if (this.pax.total) add('Fahrgäste befördert', String(this.pax.total), Math.min(150, Math.round(this.pax.total / 5)));
    if (this.stopCount) add('Haltepunkte', `${this.stopPts} aus ${this.stopCount} Halten`, 0);
    if (t) add('Energie', `${t.energyKWh.toFixed(0)} kWh`, 0);
    score = Math.max(0, Math.round(score));
    const stars: Result['stars'] = !ok ? 0 : score >= 1100 ? 3 : score >= 850 ? 2 : 1;
    const xp = ok ? Math.round((this.sc?.xp ?? 100) * (0.5 + stars / 4)) : 0;
    return { ok, score, stars, items, reason, xp };
  }
}

/** Hauptsignale im Stellwerksbereich (bis 1,6 km um die Bahnsteige der Bereichsstationen) */
export function boxSignals(w: World, area: string[]): string[] {
  const pts: { x: number; z: number }[] = [];
  for (const id of area) for (const p of w.stations.get(id)?.platforms ?? []) { const tr = w.net.track(p.track); const q = tr.point((p.s0 + p.s1) / 2); pts.push({ x: q.x, z: q.z }); }
  const out: string[] = [];
  for (const s of w.net.signals.values()) {
    if (s.def.kind === 'block' && !area.length) continue;
    const q = w.net.track(s.track).point(s.s);
    if (pts.some((p) => Math.hypot(p.x - q.x, p.z - q.z) < 1600)) out.push(s.id);
  }
  return out;
}

function distAlong(w: World, t: Train, track: string, s: number): number {
  const la = lookahead(w.net, null, t.head, 6000, { ignoreSignals: true });
  let acc = 0;
  for (const p of la.path) {
    const L = w.net.track(p.t).len, from = p.t === t.head.t ? t.head.s : p.d > 0 ? 0 : L;
    if (p.t === track) { const d = p.d > 0 ? s - from : from - s; if (d >= -t.length - 5) return acc + d; }
    acc += p.d > 0 ? L - from : from;
  }
  // hinter dem Zug?
  for (const sp of w.spans.get(t.id) ?? []) if (sp.t === track && s >= sp.s0 && s <= sp.s1) return -1;
  return 1e9;
}

export const CARGO_NAMES: Record<CargoType, string> = { container: 'Container', bulk: 'Schüttgut', oil: 'Mineralöl', cars: 'Autos', wood: 'Holz', goods: 'Stückgut', stone: 'Schotter/Kies' };
export const cargoName = (c: CargoType) => CARGO_NAMES[c];

export function goalText(g: Goal, w: World): string {
  const st = (id?: string) => (id && w.stations.get(id)?.name) || id || '';
  switch (g.t) {
    case 'timetable': return `Fahrplan einhalten (alle Halte, höchstens ${Math.round(g.maxLate / 60)} min Verspätung)`;
    case 'reach': return `${g.stop ? 'Halten in' : 'Erreichen:'} ${g.st ? st(g.st) : g.track}`;
    case 'deliver': return `${g.n} Wagen ${cargoName(g.cargo)} von „${g.from}" nach „${g.to}" bringen und entladen`;
    case 'load': return `${g.n} Wagen ${cargoName(g.cargo)} an „${g.at}" beladen`;
    case 'couple': return `Zug auf ${g.n} Fahrzeuge zusammenstellen (kuppeln)`;
    case 'park': return `${g.n} Wagen an „${g.at}" abstellen, Handbremse anziehen, Lok abziehen`;
    case 'box': return `${g.trains} Züge durch den Bereich leiten, höchstens ${Math.round(g.maxLate / 60)} min Verspätung, keine Verklemmung`;
    case 'nospad': return 'Kein Signal bei Halt überfahren';
    case 'nooverspeed': return 'Keine Zwangsbremsung wegen Geschwindigkeit';
    case 'comfort': return `Fahrgastkomfort mindestens ${g.min} %`;
    case 'energy': return `Energieverbrauch höchstens ${g.maxKWh} kWh`;
    case 'timeLimit': return `Zeitlimit ${Math.round(g.s / 60)} min`;
    case 'precise': return `Halt höchstens ${g.maxDist} m neben dem Haltepunkt`;
    case 'doors': return 'An jedem Halt die Türen öffnen';
  }
}

/** Formation eines Szenarios (für Ladebildschirm/Auswahl) */
export function playerForm(p: PlayerSpec, routeId: string): string | undefined {
  if (p.kind === 'service') return (LINES[routeId] ?? []).find((l) => l.id === p.line)?.form;
  if (p.kind === 'free') return p.form ?? (p.vehicles ? undefined : undefined);
  return undefined;
}
export { FORM };

import { Bot } from '@shared/ai/bot';
import {
  clampInput,
  NEUTRAL_CAR_INPUT,
  TICK_DT,
  type CarInput,
  type SimEvent,
  type SimState,
  type TeamId,
} from '@shared/sim/types';
import {
  Sim,
  cloneState,
  createSimState,
  decodeSnapshot,
  encodeSnapshot,
  interpolateStates,
} from '@shared/sim';
import {
  parseToGuest,
  parseToHost,
  type Difficulty,
  type StartMessage,
  type StartPlayer,
  type ToGuest,
} from '@shared/net/p2p';
import type { Link } from '../net/p2pLink';
import type { HostPlan } from '../net/p2pRoom';

/** Eine laufende Partie aus Sicht der Oberfläche – lokal (Bots/Splitscreen/Training), als Gastgeber oder als Gast */
export interface MatchSession {
  readonly kind: 'local' | 'host' | 'guest';
  readonly players: StartPlayer[];
  readonly arena: string;
  /** Fahrzeuge dieses Geräts (1 oder 2; Index = Eingabe-Nummer) */
  readonly localCars: number[];
  readonly training: boolean;
  /** true, wenn andere Menschen mitspielen (Pause hält nichts an) */
  readonly shared: boolean;
  /** Zustand zum Zeichnen */
  readonly state: SimState;
  /** Rechnet `dt` Sekunden weiter. `inputs[i]` gehört zu localCars[i]. Gibt die Ereignisse seit dem letzten Aufruf zurück. */
  advance(dt: number, inputs: ReadonlyArray<CarInput>): SimEvent[];
  /** Training: Ball/Autos auf Anstoß zurücksetzen */
  reset(): void;
  onNotice(cb: (text: string, kind: 'info' | 'error') => void): () => void;
  /** Verbindung beendet (Gast: Gastgeber weg) */
  onClosed(cb: () => void): () => void;
  /** Geschätzte Laufzeit zum Gastgeber in ms (nur Gast) */
  readonly pingMs: number;
  dispose(): void;
}

export interface LocalPlan {
  players: StartPlayer[];
  seed: number;
  matchSeconds: number;
  arena: string;
  nitro: boolean;
  training?: boolean;
  /** Welche Fahrzeuge von Menschen an diesem Gerät gesteuert werden */
  localCars: number[];
}

const MAX_STEPS_PER_FRAME = 5;

function simFrom(plan: {
  players: StartPlayer[];
  seed: number;
  matchSeconds: number;
  nitro: boolean;
  training?: boolean;
}): Sim {
  return new Sim({
    cars: plan.players.map((p) => ({ team: p.team })),
    matchSeconds: plan.matchSeconds,
    seed: plan.seed,
    pads: plan.nitro,
    training: plan.training === true,
  });
}

/**
 * Glättet die Darstellung zwischen zwei Physik-Schritten (60 Hz). Ohne das ruckelt das Bild, sobald Bildrate und
 * Physikrate nicht exakt zusammenpassen (z. B. 90/120-Hz-Handys oder schwankende Bildraten): mal 0, mal 2 Schritte pro Bild.
 */
export class RenderInterp {
  private readonly prev: SimState;
  private readonly out: SimState;
  private has = false;
  constructor(template: SimState) {
    this.prev = cloneState(template);
    this.out = cloneState(template);
  }
  /** Zustand VOR dem letzten Schritt eines Bildes merken */
  keep(s: SimState): void {
    interpolateStates(s, s, 0, this.prev);
    this.has = true;
  }
  /** Zwischenzustand für den Bruchteil k (0 … 1) des nächsten Schritts */
  view(cur: SimState, k: number): SimState {
    if (!this.has || this.prev.cars.length !== cur.cars.length) return cur;
    interpolateStates(this.prev, cur, Math.max(0, Math.min(1, k)), this.out);
    // Große Sprünge (Anstoß, Respawn, Netz-Korrektur) nicht verschmieren
    const far = (a: number[], b: number[]): boolean =>
      Math.abs((a[0] as number) - (b[0] as number)) +
        Math.abs((a[1] as number) - (b[1] as number)) +
        Math.abs((a[2] as number) - (b[2] as number)) >
      4;
    if (far(this.prev.ball.pos, cur.ball.pos))
      for (let i = 0; i < 3; i++) this.out.ball.pos[i] = cur.ball.pos[i] as number;
    cur.cars.forEach((c, i) => {
      const p = this.prev.cars[i];
      const o = this.out.cars[i];
      if (!p || !o || !far(p.pos, c.pos)) return;
      for (let j = 0; j < 3; j++) o.pos[j] = c.pos[j] as number;
      for (let j = 0; j < 4; j++) o.quat[j] = c.quat[j] as number;
    });
    return this.out;
  }
}

/** Partie auf diesem Gerät: Bots steuern die übrigen Autos */
export class LocalMatch implements MatchSession {
  readonly kind: 'local' | 'host' = 'local';
  readonly players: StartPlayer[];
  readonly arena: string;
  readonly localCars: number[];
  readonly training: boolean;
  shared = false;
  readonly pingMs = 0;
  protected readonly sim: Sim;
  protected bots = new Map<number, Bot>();
  protected acc = 0;
  protected noticeCbs: Array<(t: string, k: 'info' | 'error') => void> = [];
  protected closeCbs: Array<() => void> = [];

  constructor(plan: LocalPlan) {
    this.players = plan.players;
    this.arena = plan.arena;
    this.localCars = plan.localCars;
    this.training = plan.training === true;
    this.sim = simFrom(plan);
    plan.players.forEach((p, i) => {
      if (!plan.localCars.includes(i) && p.kind === 'bot')
        this.bots.set(i, new Bot(p.difficulty, plan.seed + i * 7919));
    });
    this.sim.resetKickoff();
    this.interp = new RenderInterp(this.sim.state);
  }
  protected interp: RenderInterp;

  get state(): SimState {
    return this.interp.view(this.sim.state, this.acc / TICK_DT);
  }

  protected collect(inputs: ReadonlyArray<CarInput>, overrides?: ReadonlyMap<number, CarInput>): CarInput[] {
    const all: CarInput[] = new Array(this.players.length);
    for (let i = 0; i < all.length; i++) all[i] = { ...NEUTRAL_CAR_INPUT };
    this.localCars.forEach((c, k) => {
      if (inputs[k]) all[c] = inputs[k] as CarInput;
    });
    overrides?.forEach((inp, c) => (all[c] = inp));
    for (const [c, bot] of this.bots) all[c] = bot.act(this.sim.state, c);
    return all;
  }

  protected tickEvents(events: SimEvent[]): void {
    void events;
  }

  advance(dt: number, inputs: ReadonlyArray<CarInput>): SimEvent[] {
    this.acc = Math.min(this.acc + dt, TICK_DT * MAX_STEPS_PER_FRAME);
    const out: SimEvent[] = [];
    while (this.acc >= TICK_DT) {
      this.acc -= TICK_DT;
      if (this.acc < TICK_DT) this.interp.keep(this.sim.state);
      const ev = this.sim.step(this.collect(inputs, this.remoteInputs()));
      if (ev.length) {
        out.push(...ev);
        this.tickEvents(ev);
      }
      this.afterTick();
    }
    return out;
  }

  protected remoteInputs(): ReadonlyMap<number, CarInput> | undefined {
    return undefined;
  }
  protected afterTick(): void {
    /* für den Gastgeber: Zustandsbilder senden */
  }

  reset(): void {
    this.sim.resetKickoff();
  }
  onNotice(cb: (t: string, k: 'info' | 'error') => void): () => void {
    this.noticeCbs.push(cb);
    return () => (this.noticeCbs = this.noticeCbs.filter((c) => c !== cb));
  }
  onClosed(cb: () => void): () => void {
    this.closeCbs.push(cb);
    return () => (this.closeCbs = this.closeCbs.filter((c) => c !== cb));
  }
  dispose(): void {
    this.noticeCbs = [];
    this.closeCbs = [];
  }
}

/** Zeitgeber für den Gastgeber (Millisekunden) */
export const NET_TIMING = { snapshotEvery: 2, deadAfter: 20_000 };

/** Partie, die der Gastgeber für Gäste mitrechnet: Gäste-Eingaben kommen über Datenkanäle, Zustandsbilder gehen hinaus */
export class HostMatch extends LocalMatch {
  override readonly kind = 'host' as const;
  private guests = new Map<number, { link: Link; input: CarInput; lastSeen: number; seq: number }>();
  private pendingEvents: SimEvent[] = [];
  private tickNo = 0;
  private dog: ReturnType<typeof setInterval>;

  constructor(plan: HostPlan) {
    super({
      players: plan.players,
      seed: plan.seed,
      matchSeconds: plan.matchSeconds,
      arena: plan.arena,
      nitro: plan.nitro,
      localCars: [plan.hostCar],
    });
    this.shared = true;
    for (const [carId, link] of plan.guests) {
      this.guests.set(carId, { link, input: { ...NEUTRAL_CAR_INPUT }, lastSeen: Date.now(), seq: -1 });
      link.onMessage((raw) => this.fromGuest(carId, raw));
      link.onFast((d) => this.fromGuestFast(carId, d));
      link.onClose(() => this.guestGone(carId));
      const start: StartMessage = {
        seed: plan.seed,
        matchSeconds: plan.matchSeconds,
        arena: plan.arena,
        nitro: plan.nitro,
        you: carId,
        players: plan.players,
      };
      link.send({ t: 'start', msg: start } satisfies ToGuest);
    }
    this.dog = setInterval(() => {
      const now = Date.now();
      for (const [id, g] of [...this.guests]) if (now - g.lastSeen > NET_TIMING.deadAfter) this.guestGone(id);
    }, 1000);
  }

  private fromGuestFast(id: number, d: string | ArrayBuffer): void {
    if (typeof d !== 'string') return;
    let raw: unknown;
    try {
      raw = JSON.parse(d);
    } catch {
      return;
    }
    this.fromGuest(id, raw);
  }

  private fromGuest(id: number, raw: unknown): void {
    const g = this.guests.get(id);
    if (!g) return;
    g.lastSeen = Date.now();
    const m = parseToHost(raw);
    if (!m) return;
    if (m.t === 'input') {
      if (m.seq > g.seq || m.seq < g.seq - 1000) {
        g.seq = m.seq;
        g.input = m.i;
      }
    } else if (m.t === 'ping') g.link.send({ t: 'pong', n: m.n } satisfies ToGuest);
  }

  private guestGone(id: number): void {
    const g = this.guests.get(id);
    if (!g) return;
    this.guests.delete(id);
    const p = this.players[id];
    if (!p) return;
    this.bots.set(id, new Bot('normal', this.state.tick + id));
    const text = `${p.name} hat die Verbindung verloren – ein Bot übernimmt.`;
    for (const o of this.guests.values()) o.link.send({ t: 'notice', text } satisfies ToGuest);
    for (const c of this.noticeCbs) c(text, 'info');
  }

  protected override remoteInputs(): ReadonlyMap<number, CarInput> {
    const m = new Map<number, CarInput>();
    for (const [id, g] of this.guests) m.set(id, g.input);
    return m;
  }

  protected override tickEvents(events: SimEvent[]): void {
    this.pendingEvents.push(...events);
  }

  protected override afterTick(): void {
    this.tickNo++;
    if (this.tickNo % NET_TIMING.snapshotEvery !== 0) return;
    const bytes = encodeSnapshot(this.sim.state);
    for (const [id, g] of this.guests) {
      const packet = new Uint8Array(bytes.length + 5);
      packet[0] = 1;
      new DataView(packet.buffer).setUint32(1, g.seq >>> 0, true);
      packet.set(bytes, 5);
      g.link.sendFast(packet);
      if (this.pendingEvents.length)
        g.link.send({ t: 'events', tick: this.sim.state.tick, events: this.pendingEvents } satisfies ToGuest);
      void id;
    }
    this.pendingEvents = [];
  }

  override dispose(): void {
    clearInterval(this.dog);
    for (const g of this.guests.values()) g.link.close();
    this.guests.clear();
    super.dispose();
  }
}

interface Pending {
  seq: number;
  input: CarInput;
}

/**
 * Gast: rechnet die Partie selbst mit (Vorhersage) und gleicht sie mit den Zustandsbildern des Gastgebers ab.
 * Eigene, noch nicht bestätigte Eingaben werden nach jedem Zustandsbild erneut abgespielt (Rollback). Dadurch reagiert das eigene Auto sofort.
 */
export class GuestMatch implements MatchSession {
  readonly kind = 'guest' as const;
  readonly players: StartPlayer[];
  readonly arena: string;
  readonly localCars: number[];
  readonly training = false;
  readonly shared = true;
  private sim: Sim;
  private acc = 0;
  private seq = 0;
  private pending: Pending[] = [];
  private lastSnapTick = -1;
  private tmp: SimState;
  private events: SimEvent[] = [];
  private noticeCbs: Array<(t: string, k: 'info' | 'error') => void> = [];
  private closeCbs: Array<() => void> = [];
  private lastSeen = Date.now();
  private ping: ReturnType<typeof setInterval>;
  pingMs = 0;
  private closed = false;
  private pingSent = new Map<number, number>();
  private pingN = 0;

  constructor(
    private readonly link: Link,
    start: StartMessage,
  ) {
    this.players = start.players;
    this.arena = start.arena;
    this.localCars = [start.you];
    this.sim = simFrom({
      players: start.players,
      seed: start.seed,
      matchSeconds: start.matchSeconds,
      nitro: start.nitro,
    });
    this.sim.resetKickoff();
    this.tmp = createSimState({
      cars: start.players.map((p) => ({ team: p.team })),
      seed: start.seed,
      matchSeconds: start.matchSeconds,
      pads: start.nitro,
    });
    link.onFast((d) => this.onSnapshot(d));
    link.onMessage((raw) => this.fromHost(raw));
    link.onClose(() => this.lost());
    this.ping = setInterval(() => {
      const n = ++this.pingN;
      this.pingSent.set(n, performance.now());
      link.send({ t: 'ping', n });
      if (Date.now() - this.lastSeen > NET_TIMING.deadAfter) this.lost();
    }, 1000);
  }

  private interp: RenderInterp | null = null;
  get state(): SimState {
    this.interp ??= new RenderInterp(this.sim.state);
    return this.interp.view(this.sim.state, this.acc / TICK_DT);
  }

  private lost(): void {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.ping);
    for (const c of this.closeCbs) c();
  }

  private fromHost(raw: unknown): void {
    this.lastSeen = Date.now();
    const m = parseToGuest(raw);
    if (!m) return;
    switch (m.t) {
      case 'events': {
        const me = this.localCars[0];
        // Eigene Sprünge/Pads/Berührungen kommen schon aus der Vorhersage (sofort), vom Gastgeber nur den Rest
        for (const e of m.events)
          if (!('car' in e && e.car === me && (e.t === 'jump' || e.t === 'pad' || e.t === 'touch')))
            this.events.push(e);
        break;
      }
      case 'pong': {
        const t0 = this.pingSent.get(m.n);
        if (t0 !== undefined) {
          const rtt = performance.now() - t0;
          this.pingMs = this.pingMs === 0 ? rtt : this.pingMs * 0.8 + rtt * 0.2;
          this.pingSent.delete(m.n);
        }
        break;
      }
      case 'notice':
        this.noticeCbs.forEach((c) => c(m.text, 'info'));
        break;
      case 'error':
        this.noticeCbs.forEach((c) => c(m.message, 'error'));
        break;
      case 'kick':
        this.noticeCbs.forEach((c) => c(m.reason || 'Du wurdest aus dem Raum entfernt.', 'error'));
        this.lost();
        break;
      default:
        break;
    }
  }

  private onSnapshot(d: string | ArrayBuffer): void {
    this.lastSeen = Date.now();
    if (typeof d === 'string' || d.byteLength < 8) return;
    const bytes = new Uint8Array(d);
    if (bytes[0] !== 1) return;
    const ack = new DataView(d).getUint32(1, true);
    if (!decodeSnapshot(bytes.subarray(5), this.tmp)) return;
    if (this.tmp.tick <= this.lastSnapTick) return;
    this.lastSnapTick = this.tmp.tick;
    // Bestätigte Eingaben verwerfen, Rest erneut abspielen
    this.pending = this.pending.filter((p) => p.seq > ack);
    const me = this.localCars[0] as number;
    const base = cloneState(this.tmp);
    const prev = this.sim.state;
    this.sim.loadState(base);
    const held: CarInput[] = base.cars.map((c) => ({ ...c.input }));
    for (const p of this.pending) {
      const all = held.map((h, i) => (i === me ? p.input : h));
      this.sim.step(all);
    }
    this.smooth(prev);
  }

  /** Verschleift kleine Korrekturen sichtbar (Autos/Ball), große springen sofort */
  private smooth(prev: SimState): void {
    const s = this.sim.state;
    const mix = (a: number[], b: number[], k: number): void => {
      for (let i = 0; i < a.length; i++) a[i] = (b[i] as number) + ((a[i] as number) - (b[i] as number)) * k;
    };
    const near = (a: number[], b: number[]): boolean =>
      Math.hypot(
        (a[0] as number) - (b[0] as number),
        (a[1] as number) - (b[1] as number),
        (a[2] as number) - (b[2] as number),
      ) < 3;
    s.cars.forEach((c, i) => {
      const p = prev.cars[i];
      if (p && near(c.pos, p.pos) && c.demolished <= 0 && p.demolished <= 0) mix(c.pos, p.pos, 0.35);
    });
    if (near(s.ball.pos, prev.ball.pos)) mix(s.ball.pos, prev.ball.pos, 0.35);
  }

  advance(dt: number, inputs: ReadonlyArray<CarInput>): SimEvent[] {
    this.acc = Math.min(this.acc + dt, TICK_DT * MAX_STEPS_PER_FRAME);
    const me = this.localCars[0] as number;
    const out: SimEvent[] = this.events;
    this.events = [];
    while (this.acc >= TICK_DT) {
      this.acc -= TICK_DT;
      const input = clampInput(inputs[0]);
      const seq = ++this.seq;
      this.pending.push({ seq, input });
      if (this.pending.length > 240) this.pending.shift();
      this.link.sendFast(JSON.stringify({ t: 'input', seq, i: input }));
      const all = this.sim.state.cars.map((c, i) => (i === me ? input : c.input));
      if (this.acc < TICK_DT) {
        this.interp ??= new RenderInterp(this.sim.state);
        this.interp.keep(this.sim.state);
      }
      for (const e of this.sim.step(all))
        if ('car' in e && e.car === me && (e.t === 'jump' || e.t === 'pad' || e.t === 'touch')) out.push(e);
    }
    return out;
  }

  reset(): void {
    /* nur Training */
  }
  onNotice(cb: (t: string, k: 'info' | 'error') => void): () => void {
    this.noticeCbs.push(cb);
    return () => (this.noticeCbs = this.noticeCbs.filter((c) => c !== cb));
  }
  onClosed(cb: () => void): () => void {
    this.closeCbs.push(cb);
    return () => (this.closeCbs = this.closeCbs.filter((c) => c !== cb));
  }
  dispose(): void {
    clearInterval(this.ping);
    this.closed = true;
    this.noticeCbs = [];
    this.closeCbs = [];
    this.link.close();
  }
}

export type { Difficulty, TeamId };

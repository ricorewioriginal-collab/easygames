import { MAX_SLOTS, P2P_VERSION, cleanLook, cleanName, parseToGuest, parseToHost, type Difficulty, type Look, type P2PLobby, type P2PSlot, type StartMessage, type StartPlayer, type ToGuest } from '@shared/net/p2p';
import type { TeamId } from '@shared/sim/types';
import type { Link } from './p2pLink';

export const P2P_TIMING = { pingEvery: 4000, deadAfter: 20_000 };
const BOT_NAMES = ['Blitz', 'Drift', 'Kolben', 'Nitro', 'Rotor', 'Funke'];

export type LobbyView = P2PLobby & { meId: string };

interface Seat {
  slot: P2PSlot;
  link: Link | null;
  lastSeen: number;
}

/** Alles, was der Spielstart braucht (die Sitzungsklassen in game/ bauen daraus die laufende Partie) */
export interface HostPlan {
  seed: number;
  matchSeconds: number;
  arena: string;
  nitro: boolean;
  players: StartPlayer[];
  /** Fahrzeug-ID des Gastgebers */
  hostCar: number;
  /** Datenkanäle der Gäste nach Fahrzeug-ID */
  guests: Map<number, Link>;
}

/** Lobby des Gastgebers: sammelt Mitspieler über Datenkanäle, verwaltet Bots und Teams und startet die Partie */
export class P2PHostRoom {
  private seats: Seat[] = [];
  private counter = 1;
  teamSize: 1 | 2 | 3 = 2;
  minutes = 3;
  arena = 'neon';
  nitro = true;
  private lobbyCbs: Array<(v: LobbyView) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private dog: ReturnType<typeof setInterval>;
  readonly hostId = 'p1';
  started = false;

  constructor(host: { name: string; look: Look }) {
    this.seats.push({ slot: { id: this.hostId, name: cleanName(host.name) || 'Gastgeber', team: 0, kind: 'human', difficulty: 'normal', look: host.look, ready: true, connected: true, host: true }, link: null, lastSeen: Date.now() });
    this.dog = setInterval(() => {
      const now = Date.now();
      for (const s of [...this.seats]) if (s.link && now - s.lastSeen > P2P_TIMING.deadAfter) this.drop(s, 'Verbindung verloren');
    }, 2000);
  }

  get freeSeats(): number {
    return MAX_SLOTS - this.seats.length;
  }
  get humanGuests(): number {
    return this.seats.filter((s) => s.link).length;
  }

  onLobby(cb: (v: LobbyView) => void): () => void {
    this.lobbyCbs.push(cb);
    return () => (this.lobbyCbs = this.lobbyCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }

  private lobby(): P2PLobby {
    return { teamSize: this.teamSize, minutes: this.minutes, arena: this.arena, slots: this.seats.map((s) => ({ ...s.slot })) };
  }
  view(): LobbyView {
    return { ...this.lobby(), meId: this.hostId };
  }
  private changed(): void {
    const v = this.view();
    for (const c of this.lobbyCbs) c(v);
    const m: ToGuest = { t: 'lobby', lobby: this.lobby() };
    for (const s of this.seats) s.link?.send(m);
  }
  private notice(text: string): void {
    for (const c of this.msgCbs) c('notice', text);
  }

  private teamCount(team: TeamId): number {
    return this.seats.filter((s) => s.slot.team === team).length;
  }
  private smallerTeam(): TeamId {
    return this.teamCount(0) <= this.teamCount(1) ? 0 : 1;
  }

  /** Ein neuer Datenkanal ist offen: Auf das „hello" des Gastes warten, dann Platz vergeben */
  adopt(link: Link): void {
    let seat: Seat | null = null;
    const timer = setTimeout(() => {
      if (!seat) link.close();
    }, 8000);
    link.onMessage((raw) => {
      const m = parseToHost(raw);
      if (!m) return;
      if (!seat) {
        if (m.t !== 'hello') return;
        clearTimeout(timer);
        if (this.seats.length >= MAX_SLOTS || this.started) {
          link.send({ t: 'kick', reason: this.started ? 'Das Spiel läuft schon.' : 'Der Raum ist voll.' } satisfies ToGuest);
          link.close();
          return;
        }
        seat = { slot: { id: 'p' + ++this.counter, name: m.name, team: this.smallerTeam(), kind: 'human', difficulty: 'normal', look: m.look, ready: false, connected: true, host: false }, link, lastSeen: Date.now() };
        this.seats.push(seat);
        link.send({ t: 'welcome', you: seat.slot.id } satisfies ToGuest);
        this.notice(`${m.name} ist beigetreten.`);
        this.changed();
        return;
      }
      seat.lastSeen = Date.now();
      switch (m.t) {
        case 'ping':
          link.send({ t: 'pong', n: m.n } satisfies ToGuest);
          break;
        case 'ready':
          seat.slot.ready = m.ready;
          this.changed();
          break;
        case 'profile':
          if (m.name) seat.slot.name = m.name;
          if (m.look) seat.slot.look = m.look;
          this.changed();
          break;
        case 'team':
          this.setTeam(seat.slot.id, m.team);
          break;
        default:
          break;
      }
    });
    link.onClose(() => {
      if (seat && this.seats.includes(seat) && !this.started) this.drop(seat, 'Verbindung verloren');
    });
  }

  private drop(seat: Seat, why: string): void {
    this.seats = this.seats.filter((s) => s !== seat);
    seat.link?.close();
    this.notice(`${seat.slot.name}: ${why}`);
    this.changed();
  }

  // ------------------------------------------------------------------ Host-Aktionen
  setProfile(p: { name?: string; look?: Look }): void {
    const me = this.seats[0] as Seat;
    if (p.name) me.slot.name = cleanName(p.name) || me.slot.name;
    if (p.look) me.slot.look = cleanLook(p.look);
    this.changed();
  }
  setConfig(c: { teamSize?: 1 | 2 | 3; minutes?: number; arena?: string; nitro?: boolean }): void {
    if (c.teamSize) this.teamSize = c.teamSize;
    if (c.minutes !== undefined && Number.isInteger(c.minutes) && c.minutes >= 1 && c.minutes <= 10) this.minutes = c.minutes;
    if (c.arena && /^[a-z]{2,10}$/.test(c.arena)) this.arena = c.arena;
    if (c.nitro !== undefined) this.nitro = c.nitro;
    this.changed();
  }
  setTeam(id: string, team: TeamId): void {
    const s = this.seats.find((x) => x.slot.id === id);
    if (!s || s.slot.team === team || this.teamCount(team) >= 3) return;
    s.slot.team = team;
    this.changed();
  }
  addBot(team: TeamId, difficulty: Difficulty): void {
    if (this.seats.length >= MAX_SLOTS || this.teamCount(team) >= 3) return;
    const n = this.seats.filter((s) => s.slot.kind === 'bot').length;
    this.seats.push({ slot: { id: 'p' + ++this.counter, name: BOT_NAMES[n % BOT_NAMES.length] as string, team, kind: 'bot', difficulty, look: { body: ['pfeil', 'brocken', 'libelle', 'kaefer'][n % 4] as string, decal: 'streifen', accent: '' }, ready: true, connected: true, host: false }, link: null, lastSeen: Date.now() });
    this.changed();
  }
  remove(id: string): void {
    const s = this.seats.find((x) => x.slot.id === id);
    if (!s || s.slot.host) return;
    s.link?.send({ t: 'kick', reason: 'Der Gastgeber hat dich aus dem Raum entfernt.' } satisfies ToGuest);
    this.drop(s, 'entfernt');
  }

  canStart(): string | null {
    if (this.seats.some((s) => !s.slot.ready)) return 'notReady';
    return null;
  }

  /** Füllt mit Bots auf (jedes Team bis zur eingestellten Größe, mindestens 1 Spieler je Team) und liefert den Spielplan */
  start(difficulty: Difficulty = 'normal'): HostPlan {
    const err = this.canStart();
    if (err) throw new Error(err);
    for (const team of [0, 1] as TeamId[]) while (this.teamCount(team) < this.teamSize) this.addBot(team, difficulty);
    this.started = true;
    clearInterval(this.dog);
    const ordered = [...this.seats].sort((a, b) => a.slot.team - b.slot.team);
    const players: StartPlayer[] = ordered.map((s, i) => ({ carId: i, name: s.slot.name, team: s.slot.team, kind: s.slot.kind, difficulty: s.slot.difficulty, look: s.slot.look }));
    const guests = new Map<number, Link>();
    ordered.forEach((s, i) => {
      if (s.link) guests.set(i, s.link);
    });
    return { seed: (Math.random() * 2 ** 32) >>> 0, matchSeconds: this.minutes * 60, arena: this.arena, nitro: this.nitro, players, hostCar: ordered.findIndex((s) => s.slot.host), guests };
  }

  close(): void {
    clearInterval(this.dog);
    if (!this.started) for (const s of this.seats) s.link?.close();
    this.lobbyCbs = [];
    this.msgCbs = [];
  }
}

/** Lobby eines Gastes */
export class P2PGuestRoom {
  private lobbyCbs: Array<(v: LobbyView) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private startCbs: Array<(m: StartMessage, link: Link) => void> = [];
  private closeCbs: Array<() => void> = [];
  private meId = '';
  private last: LobbyView | null = null;
  private ping: ReturnType<typeof setInterval>;
  private lastSeen = Date.now();
  private started = false;

  constructor(
    readonly link: Link,
    profile: { name: string; look: Look },
  ) {
    link.onMessage((raw) => this.fromHost(raw));
    link.onClose(() => this.closed());
    link.send({ t: 'hello', v: P2P_VERSION, name: profile.name, look: profile.look });
    let n = 0;
    this.ping = setInterval(() => {
      if (this.started) return;
      link.send({ t: 'ping', n: ++n });
      if (Date.now() - this.lastSeen > P2P_TIMING.deadAfter) this.closed();
    }, P2P_TIMING.pingEvery);
  }

  onLobby(cb: (v: LobbyView) => void): () => void {
    this.lobbyCbs.push(cb);
    if (this.last) cb(this.last);
    return () => (this.lobbyCbs = this.lobbyCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }
  /** Spielstart: Die Sitzungsklasse übernimmt den Link (und damit alle weiteren Nachrichten) */
  onStart(cb: (m: StartMessage, link: Link) => void): () => void {
    this.startCbs.push(cb);
    return () => (this.startCbs = this.startCbs.filter((c) => c !== cb));
  }
  onClosed(cb: () => void): () => void {
    this.closeCbs.push(cb);
    return () => (this.closeCbs = this.closeCbs.filter((c) => c !== cb));
  }

  private closed(): void {
    clearInterval(this.ping);
    if (this.started) return;
    for (const c of this.closeCbs) c();
  }

  private fromHost(raw: unknown): void {
    this.lastSeen = Date.now();
    if (this.started) return;
    const m = parseToGuest(raw);
    if (!m) return;
    switch (m.t) {
      case 'welcome':
        this.meId = m.you;
        break;
      case 'lobby':
        this.last = { ...m.lobby, meId: this.meId };
        for (const c of this.lobbyCbs) c(this.last);
        break;
      case 'start':
        this.started = true;
        clearInterval(this.ping);
        for (const c of this.startCbs) c(m.msg, this.link);
        break;
      case 'error':
        this.msgCbs.forEach((c) => c('error', m.message));
        break;
      case 'notice':
        this.msgCbs.forEach((c) => c('notice', m.text));
        break;
      case 'kick':
        this.msgCbs.forEach((c) => c('error', m.reason || 'Du wurdest aus dem Raum entfernt.'));
        this.link.close();
        break;
      default:
        break;
    }
  }

  setReady(ready: boolean): void {
    this.link.send({ t: 'ready', ready });
  }
  setProfile(p: { name?: string; look?: Look }): void {
    this.link.send({ t: 'profile', ...p });
  }
  setTeam(team: TeamId): void {
    this.link.send({ t: 'team', team });
  }
  leave(): void {
    clearInterval(this.ping);
    this.link.close();
  }
}

import { CHARACTER_IDS, type CharacterId } from '@shared/characters';
import type { Difficulty, GameConfig, PlayerSetup } from '@shared/core/types';
import { MAX_PLAYERS, MIN_PLAYERS } from '@shared/core/types';
import { getLayout } from '@shared/levels';
import {
  P2P_VERSION,
  parseToGuest,
  parseToHost,
  type P2PLobby,
  type P2PSlot,
  type ToGuest,
} from '@shared/net/p2p';
import { cleanName } from '@shared/net/protocol';
import type { LobbyView } from './online';
import type { Link } from './p2pLink';
import { GuestSession, HostSession, P2P_TIMING } from './p2pSession';

const BOT_NAMES = ['Funki', 'Glimmo', 'Zeitfuchs', 'Raumkater'];

interface Seat {
  slot: P2PSlot;
  link: Link | null;
  lastSeen: number;
}

/** Lobby des Gastgebers: sammelt Mitspieler über Datenkanäle, verwaltet Bots und startet die Partie */
export class P2PHostRoom {
  private seats: Seat[] = [];
  private counter = 1;
  layoutId = 'prismara-01';
  rounds = 10;
  private lobbyCbs: Array<(v: LobbyView) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private dog: ReturnType<typeof setInterval>;
  session: HostSession | null = null;
  readonly hostId = 'p1';

  constructor(host: { name: string; character: CharacterId }, layoutId?: string, rounds?: number) {
    if (layoutId) this.layoutId = layoutId;
    if (rounds) this.rounds = rounds;
    this.seats.push({
      slot: {
        id: this.hostId,
        name: cleanName(host.name) || 'Gastgeber',
        character: host.character,
        kind: 'human',
        difficulty: 'normal',
        ready: true,
        connected: true,
        host: true,
      },
      link: null,
      lastSeen: Date.now(),
    });
    this.dog = setInterval(() => {
      const now = Date.now();
      for (const s of [...this.seats])
        if (s.link && !s.slot.host && now - s.lastSeen > P2P_TIMING.deadAfter)
          this.drop(s, 'Verbindung verloren');
    }, 2000);
  }

  get players(): number {
    return this.seats.length;
  }
  get freeSeats(): number {
    return MAX_PLAYERS - this.seats.length;
  }

  onLobby(cb: (v: LobbyView) => void): () => void {
    this.lobbyCbs.push(cb);
    return () => (this.lobbyCbs = this.lobbyCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }

  view(): LobbyView {
    return {
      phase: 'lobby',
      code: '',
      layoutId: this.layoutId,
      rounds: this.rounds,
      slots: this.seats.map((s) => ({ ...s.slot })),
      meId: this.hostId,
    };
  }
  private lobby(): P2PLobby {
    return {
      phase: 'lobby',
      layoutId: this.layoutId,
      rounds: this.rounds,
      slots: this.seats.map((s) => ({ ...s.slot })),
    };
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

  private freeCharacter(want?: CharacterId): CharacterId {
    const used = new Set(this.seats.map((s) => s.slot.character));
    if (want && !used.has(want)) return want;
    return (CHARACTER_IDS.find((c) => !used.has(c)) ?? 'pip') as CharacterId;
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
        if (this.seats.length >= MAX_PLAYERS) {
          link.send({ t: 'kick', reason: 'Der Raum ist voll.' } satisfies ToGuest);
          link.close();
          return;
        }
        seat = {
          slot: {
            id: 'p' + ++this.counter,
            name: m.name,
            character: this.freeCharacter(m.character),
            kind: 'human',
            difficulty: 'normal',
            ready: false,
            connected: true,
            host: false,
          },
          link,
          lastSeen: Date.now(),
        };
        this.seats.push(seat);
        link.send({ t: 'welcome', you: seat.slot.id } satisfies ToGuest);
        this.notice(`${m.name} ist beigetreten.`);
        this.changed();
        return;
      }
      seat.lastSeen = Date.now();
      if (m.t === 'ping') link.send({ t: 'pong', n: m.n } satisfies ToGuest);
      else if (m.t === 'ready') {
        seat.slot.ready = m.ready;
        this.changed();
      } else if (m.t === 'profile') {
        if (m.name) seat.slot.name = m.name;
        if (m.character && !this.seats.some((s) => s !== seat && s.slot.character === m.character))
          seat.slot.character = m.character;
        this.changed();
      }
    });
    link.onClose(() => {
      if (seat && this.seats.includes(seat) && !this.session) this.drop(seat, 'Verbindung verloren');
    });
  }

  private drop(seat: Seat, why: string): void {
    this.seats = this.seats.filter((s) => s !== seat);
    seat.link?.close();
    this.notice(`${seat.slot.name}: ${why}`);
    this.changed();
  }

  // ------------------------------------------------------------------ Host-Aktionen
  setProfile(p: { name?: string; character?: CharacterId }): void {
    const me = this.seats[0] as Seat;
    if (p.name) me.slot.name = cleanName(p.name) || me.slot.name;
    if (p.character && !this.seats.some((s) => s !== me && s.slot.character === p.character))
      me.slot.character = p.character;
    this.changed();
  }
  setConfig(c: { layoutId?: string; rounds?: number }): void {
    if (c.layoutId) {
      try {
        getLayout(c.layoutId);
        this.layoutId = c.layoutId;
      } catch {
        /* unbekannt: ignorieren */
      }
    }
    if (c.rounds !== undefined && Number.isInteger(c.rounds) && c.rounds >= 1 && c.rounds <= 30)
      this.rounds = c.rounds;
    this.changed();
  }
  addBot(difficulty: Difficulty): void {
    if (this.seats.length >= MAX_PLAYERS) return;
    const n = this.seats.filter((s) => s.slot.kind === 'bot').length;
    this.seats.push({
      slot: {
        id: 'p' + ++this.counter,
        name: BOT_NAMES[n % BOT_NAMES.length] as string,
        character: this.freeCharacter(),
        kind: 'bot',
        difficulty,
        ready: true,
        connected: true,
        host: false,
      },
      link: null,
      lastSeen: Date.now(),
    });
    this.changed();
  }
  remove(id: string): void {
    const s = this.seats.find((x) => x.slot.id === id);
    if (!s || s.slot.host) return;
    if (s.link)
      s.link.send({ t: 'kick', reason: 'Der Gastgeber hat dich aus dem Raum entfernt.' } satisfies ToGuest);
    this.drop(s, 'entfernt');
  }

  canStart(): string | null {
    if (this.seats.length < MIN_PLAYERS) return 'Es braucht mindestens 2 Spieler (Mensch oder Bot).';
    if (this.seats.some((s) => !s.slot.ready)) return 'Es sind noch nicht alle bereit.';
    return null;
  }

  start(): HostSession {
    const err = this.canStart();
    if (err) throw new Error(err);
    const players: PlayerSetup[] = this.seats.map((s) => ({
      id: s.slot.id,
      name: s.slot.name,
      character: s.slot.character,
      kind: s.slot.kind,
      ...(s.slot.kind === 'bot' ? { difficulty: s.slot.difficulty } : {}),
    }));
    const config: GameConfig = { layoutId: this.layoutId, rounds: this.rounds, players };
    const links = new Map<string, Link>();
    for (const s of this.seats) if (s.link) links.set(s.slot.id, s.link);
    clearInterval(this.dog);
    this.session = new HostSession(config, this.hostId, links);
    this.session.start();
    return this.session;
  }

  close(): void {
    clearInterval(this.dog);
    if (!this.session) for (const s of this.seats) s.link?.close();
    this.lobbyCbs = [];
    this.msgCbs = [];
  }
}

/** Lobby eines Gastes: zeigt, was der Gastgeber meldet, und wartet auf den Spielstart */
export class P2PGuestRoom {
  private lobbyCbs: Array<(v: LobbyView) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private startCbs: Array<(s: GuestSession) => void> = [];
  private closeCbs: Array<() => void> = [];
  private meId = '';
  private last: LobbyView | null = null;
  session: GuestSession | null = null;
  private pending: unknown[] = [];
  private ping: ReturnType<typeof setInterval>;
  private lastSeen = Date.now();

  constructor(
    private readonly link: Link,
    profile: { name: string; character: CharacterId },
  ) {
    link.onMessage((raw) => this.fromHost(raw));
    link.onClose(() => this.closed());
    link.send({ t: 'hello', v: P2P_VERSION, name: profile.name, character: profile.character });
    let n = 0;
    this.ping = setInterval(() => {
      if (this.session) return;
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
  onStart(cb: (s: GuestSession) => void): () => void {
    this.startCbs.push(cb);
    return () => (this.startCbs = this.startCbs.filter((c) => c !== cb));
  }
  onClosed(cb: () => void): () => void {
    this.closeCbs.push(cb);
    return () => (this.closeCbs = this.closeCbs.filter((c) => c !== cb));
  }

  private closed(): void {
    clearInterval(this.ping);
    if (this.session) return; // die Sitzung meldet das selbst
    for (const c of this.closeCbs) c();
  }

  private fromHost(raw: unknown): void {
    this.lastSeen = Date.now();
    if (this.session) return void this.session.fromHost(raw);
    const m = parseToGuest(raw);
    if (!m) return;
    switch (m.t) {
      case 'welcome':
        this.meId = m.you;
        break;
      case 'lobby':
        this.last = {
          phase: m.lobby.phase,
          code: '',
          layoutId: m.lobby.layoutId,
          rounds: m.lobby.rounds,
          slots: m.lobby.slots,
          meId: this.meId,
        };
        for (const c of this.lobbyCbs) c(this.last);
        break;
      case 'start': {
        clearInterval(this.ping);
        this.session = new GuestSession(this.link, m.msg);
        for (const c of this.startCbs) c(this.session);
        break;
      }
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
    void this.pending;
  }

  setReady(ready: boolean): void {
    this.link.send({ t: 'ready', ready });
  }
  setProfile(p: { name?: string; character?: CharacterId }): void {
    this.link.send({ t: 'profile', ...p });
  }
  leave(): void {
    clearInterval(this.ping);
    this.link.close();
  }
}

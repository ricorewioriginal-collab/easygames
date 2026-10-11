import { GameCore } from '@shared/core/core';
import type { Action, GameConfig, GameEvent, GameState, PlayerSetup } from '@shared/core/types';
import { getMiniGame } from '@shared/minigames/registry';
import { parseToGuest, parseToHost, type ToGuest } from '@shared/net/p2p';
import type { GameStartMessage, GameUpdateMessage } from '@shared/net/protocol';
import type { Link } from './p2pLink';
import { LocalSession, type GameSession } from './session';

/** Wartezeiten, nach denen für einen Gast entschieden wird (Millisekunden) */
export const P2P_TIMING = {
  turn: 90_000,
  introGrace: 60_000,
  playGrace: 10_000,
  pingEvery: 4000,
  deadAfter: 20_000,
};

/**
 * Gastgeber-Sitzung: führt den Spielkern aus (wie lokal), nimmt Aktionen der Gäste entgegen und schickt jede Änderung an alle.
 * Gäste, deren Verbindung abbricht, werden durch einen Bot ersetzt.
 */
export class HostSession extends LocalSession {
  private guests = new Map<string, { link: Link; lastSeen: number }>();
  private seq = 0;
  private verSince = Date.now();
  private lastVer = -1;
  private dog: ReturnType<typeof setInterval> | null = null;

  constructor(config: GameConfig, hostId: string, guestLinks: Map<string, Link>, seed?: number) {
    super(config, seed);
    this.localIds.length = 0;
    this.localIds.push(hostId);
    this.shared = true;
    this.canRestart = false;
    for (const [id, link] of guestLinks) {
      this.guests.set(id, { link, lastSeen: Date.now() });
      link.onMessage((m) => this.fromGuest(id, m));
      link.onClose(() => this.guestGone(id));
    }
    for (const [id, g] of this.guests) {
      const start: GameStartMessage = {
        layoutId: config.layoutId,
        rounds: config.rounds,
        you: id,
        players: config.players.map((p) => ({
          id: p.id,
          name: p.name,
          character: p.character,
          kind: p.kind,
          difficulty: p.difficulty ?? 'normal',
        })),
      };
      g.link.send({ t: 'start', msg: start } satisfies ToGuest);
      this.sendTo(id, {
        seq: this.seq,
        state: this.core.state,
        events: [...this.core.initialEvents],
        full: true,
      });
    }
    this.dog = setInterval(() => this.watch(), 1000);
  }

  private sendTo(id: string, msg: GameUpdateMessage): void {
    this.guests.get(id)?.link.send({ t: 'update', msg } satisfies ToGuest);
  }

  protected override emit(events: GameEvent[]): void {
    this.seq++;
    for (const id of this.guests.keys())
      this.sendTo(id, { seq: this.seq, state: this.core.state, events, full: false });
    super.emit(events);
  }

  private notice(text: string): void {
    for (const g of this.guests.values()) g.link.send({ t: 'notice', text } satisfies ToGuest);
    for (const c of this.msgCbs) c('notice', text);
  }

  private fromGuest(id: string, raw: unknown): void {
    const g = this.guests.get(id);
    if (!g || this.disposed) return;
    g.lastSeen = Date.now();
    const m = parseToHost(raw);
    if (!m) return void g.link.send({ t: 'error', message: 'Ungültige Nachricht.' } satisfies ToGuest);
    if (m.t === 'ping') return void g.link.send({ t: 'pong', n: m.n } satisfies ToGuest);
    if (m.t !== 'act') return;
    const res = this.core.apply(id, m.action);
    if (!res.ok)
      return void g.link.send({ t: 'error', message: res.error ?? 'Aktion nicht möglich' } satisfies ToGuest);
    this.emit(res.events);
  }

  /** Gast ist weg: Bot übernimmt (wie beim Server-Modus) */
  private guestGone(id: string): void {
    if (this.disposed || !this.guests.has(id)) return;
    this.guests.delete(id);
    const p = this.core.state.players[id];
    if (!p || p.kind === 'bot') return;
    p.kind = 'bot';
    p.difficulty = 'easy';
    p.connected = true;
    this.core.state.version++;
    this.notice(`${p.name} hat die Verbindung verloren – ein Bot übernimmt.`);
    const m = this.core.state.minigame;
    const res =
      this.core.state.phase === 'minigame' && m?.stage === 'play' && m.results[id] === null
        ? this.core.forceResults()
        : null;
    if (res?.ok) this.emit(res.events);
    else this.emit([]);
  }

  /** Überwacht Verbindungen und träge Gäste */
  private watch(): void {
    if (this.disposed) return;
    const now = Date.now();
    for (const [id, g] of [...this.guests]) if (now - g.lastSeen > P2P_TIMING.deadAfter) this.guestGone(id);
    const s = this.core.state;
    if (s.phase === 'ended') return;
    if (s.version !== this.lastVer) {
      this.lastVer = s.version;
      this.verSince = now;
      return;
    }
    const waiting = this.core.pendingActors().filter((id) => this.guests.has(id));
    const hostWaiting = this.core.pendingActors().some((id) => this.localIds.includes(id));
    if (!waiting.length || hostWaiting) return;
    const m = s.minigame;
    const limit =
      s.phase === 'minigame' && m
        ? m.stage === 'intro'
          ? P2P_TIMING.introGrace
          : getMiniGame(m.gameId).duration * 1000 + P2P_TIMING.playGrace
        : P2P_TIMING.turn;
    if (now - this.verSince < limit) return;
    this.verSince = now;
    if (s.phase === 'minigame' && m) {
      const res = m.stage === 'intro' ? this.core.forceReady() : this.core.forceResults();
      if (res.ok) this.emit(res.events);
      return;
    }
    const who = waiting[0] as string;
    const a = this.core.fallbackAction(who);
    if (a) {
      const res = this.core.apply(who, a);
      if (res.ok) this.emit(res.events);
    }
  }

  override dispose(): void {
    if (this.dog) clearInterval(this.dog);
    for (const g of this.guests.values()) g.link.close();
    this.guests.clear();
    super.dispose();
  }
}

/** Gast-Sitzung: zeigt den Zustand des Gastgebers und schickt nur Absichten */
export class GuestSession implements GameSession {
  readonly kind = 'online' as const;
  readonly shared = true;
  readonly core: GameCore;
  readonly players: PlayerSetup[];
  readonly layoutId: string;
  readonly rounds: number;
  readonly localIds: string[];
  readonly initialEvents: GameEvent[] = [];
  private updateCbs: Array<(e: GameEvent[], f: boolean) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private connCbs: Array<(s: 'ok' | 'lost' | 'closed') => void> = [];
  private lastSeq = -1;
  private lastPong = Date.now();
  private ping: ReturnType<typeof setInterval>;
  private closed = false;

  constructor(
    private readonly link: Link,
    start: GameStartMessage,
  ) {
    this.players = start.players;
    this.layoutId = start.layoutId;
    this.rounds = start.rounds;
    this.localIds = [start.you];
    this.core = new GameCore({ layoutId: start.layoutId, rounds: start.rounds, players: start.players }, 1);
    link.onMessage((raw) => this.fromHost(raw));
    link.onClose(() => this.lost());
    let n = 0;
    this.ping = setInterval(() => {
      link.send({ t: 'ping', n: ++n });
      if (Date.now() - this.lastPong > P2P_TIMING.deadAfter) this.lost();
    }, P2P_TIMING.pingEvery);
  }

  get state(): GameState {
    return this.core.state;
  }

  private lost(): void {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.ping);
    for (const c of this.connCbs) c('closed');
  }

  /** Nachrichten, die vor dem Anlegen der Sitzung eintrafen, werden hier nachgereicht */
  fromHost(raw: unknown): void {
    this.lastPong = Date.now();
    const m = parseToGuest(raw);
    if (!m) return;
    switch (m.t) {
      case 'update':
        if (m.msg.seq < this.lastSeq && !m.msg.full) return;
        this.lastSeq = m.msg.seq;
        this.core.state = m.msg.state;
        for (const c of this.updateCbs) c(m.msg.events, m.msg.full);
        break;
      case 'error':
        for (const c of this.msgCbs) c('error', m.message);
        break;
      case 'notice':
        for (const c of this.msgCbs) c('notice', m.text);
        break;
      case 'kick':
        for (const c of this.msgCbs) c('error', m.reason || 'Du wurdest aus dem Raum entfernt.');
        this.lost();
        break;
      default:
        break;
    }
  }

  onUpdate(cb: (e: GameEvent[], f: boolean) => void): () => void {
    this.updateCbs.push(cb);
    return () => (this.updateCbs = this.updateCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }
  onConnection(cb: (s: 'ok' | 'lost' | 'closed') => void): () => void {
    this.connCbs.push(cb);
    return () => (this.connCbs = this.connCbs.filter((c) => c !== cb));
  }

  act(playerId: string, action: Action): string | null {
    if (!this.localIds.includes(playerId)) return 'Das ist nicht dein Spieler.';
    const err = this.core.validate(playerId, action);
    if (err) {
      this.msgCbs.forEach((c) => c('error', err));
      return err;
    }
    this.link.send({ t: 'act', action });
    return null;
  }

  setBusy(): void {
    /* Der Gastgeber taktet das Spiel */
  }

  dispose(): void {
    clearInterval(this.ping);
    this.closed = true;
    this.updateCbs = [];
    this.msgCbs = [];
    this.connCbs = [];
    this.link.close();
  }
}

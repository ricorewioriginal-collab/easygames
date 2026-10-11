import { Client, Room } from 'colyseus.js';
import { GameCore } from '@shared/core/core';
import type { Action, GameEvent, GameState, PlayerSetup } from '@shared/core/types';
import type { CharacterId } from '@shared/characters';
import {
  ROOM_NAME,
  isRoomCode,
  type ClientMessage,
  type ErrorMessage,
  type GameStartMessage,
  type GameUpdateMessage,
  type NoticeMessage,
} from '@shared/net/protocol';
import type { GameSession } from './session';

const TOKEN_KEY = 'partyverse.reconnect';

/** Schlanke Sicht auf den Lobby-Zustand (aus dem automatisch synchronisierten Colyseus-Schema) */
export interface LobbySlot {
  id: string;
  name: string;
  character: CharacterId;
  kind: 'human' | 'bot';
  difficulty: 'easy' | 'normal' | 'hard';
  ready: boolean;
  connected: boolean;
  host: boolean;
}
export interface LobbyView {
  phase: 'lobby' | 'playing' | 'ended';
  code: string;
  layoutId: string;
  rounds: number;
  slots: LobbySlot[];
  /** Meine Spieler-ID (nach dem Beitritt bekannt: Slot mit meiner Sitzungs-ID wird über 'you' erst bei Spielstart gemeldet – in der Lobby über Profilabgleich) */
  meId: string;
}
export interface PublicRoom {
  code: string;
  name: string;
  players: number;
  max: number;
  layoutId: string;
  rounds: number;
}

export class OnlineError extends Error {}

/** Verbindung zu einem Colyseus-Server (nur wenn in den Optionen eine Server-Adresse eingetragen ist) */
export class OnlineClient {
  private client: Client;
  room: Room<any> | null = null;
  private lobbyCbs: Array<(v: LobbyView) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private connCbs: Array<(s: 'ok' | 'lost' | 'closed') => void> = [];
  private startCbs: Array<(s: OnlineSession) => void> = [];
  session: OnlineSession | null = null;
  private meId = '';
  private pendingStart: GameStartMessage | null = null;
  private pendingUpdates: GameUpdateMessage[] = [];
  private lastSeq = -1;

  constructor(readonly url: string) {
    this.client = new Client(url);
  }

  onLobby(cb: (v: LobbyView) => void): () => void {
    this.lobbyCbs.push(cb);
    return () => (this.lobbyCbs = this.lobbyCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }
  onConnection(cb: (s: 'ok' | 'lost' | 'closed') => void): () => void {
    this.connCbs.push(cb);
    return () => (this.connCbs = this.connCbs.filter((c) => c !== cb));
  }
  onStart(cb: (s: OnlineSession) => void): () => void {
    this.startCbs.push(cb);
    return () => (this.startCbs = this.startCbs.filter((c) => c !== cb));
  }

  /** Öffentliche Räume (kann fehlschlagen, wenn der Server nicht erreichbar ist) */
  async listPublic(): Promise<PublicRoom[]> {
    try {
      const rooms = await this.client.getAvailableRooms(ROOM_NAME);
      return rooms
        .filter((r) => r.metadata?.public === true && r.metadata?.phase === 'lobby')
        .map((r) => ({
          code: String(r.roomId),
          name: String(r.metadata?.name ?? r.roomId),
          players: Number(r.metadata?.players ?? r.clients),
          max: Number(r.metadata?.max ?? 4),
          layoutId: String(r.metadata?.layoutId ?? ''),
          rounds: Number(r.metadata?.rounds ?? 0),
        }));
    } catch (e) {
      throw new OnlineError(OnlineClient.explain(e));
    }
  }

  async create(opts: { name: string; character: CharacterId; public: boolean }): Promise<void> {
    try {
      this.attach(await this.client.create<any>(ROOM_NAME, opts));
    } catch (e) {
      throw new OnlineError(OnlineClient.explain(e));
    }
  }

  async join(code: string, opts: { name: string; character: CharacterId }): Promise<void> {
    const c = code.trim().toUpperCase();
    if (!isRoomCode(c)) throw new OnlineError('Der Raumcode besteht aus 4 Zeichen (Buchstaben und Ziffern).');
    try {
      this.attach(await this.client.joinById<any>(c, opts));
    } catch (e) {
      throw new OnlineError(OnlineClient.explain(e));
    }
  }

  /** Versucht nach einem Verbindungsabbruch (z. B. Seite neu geladen) zurückzukehren */
  async tryReconnect(): Promise<boolean> {
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      /* gesperrt */
    }
    if (!token) return false;
    try {
      this.attach(await this.client.reconnect<any>(token));
      return true;
    } catch {
      this.forgetToken();
      return false;
    }
  }

  private forgetToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignorieren */
    }
  }

  static explain(e: unknown): string {
    const m = e instanceof Error ? e.message : String(e);
    if (/not found|locked|invalid room|no rooms/i.test(m))
      return 'Diesen Raum gibt es nicht (mehr). Prüfe den Code.';
    if (/voll|full/i.test(m)) return 'Der Raum ist voll.';
    if (/läuft bereits|already/i.test(m)) return 'Das Spiel in diesem Raum läuft bereits.';
    if (/fetch|network|ECONN|Failed|timeout|WebSocket|connect/i.test(m))
      return 'Der Server ist nicht erreichbar. Prüfe die Server-Adresse in den Optionen und deine Verbindung.';
    return m || 'Unbekannter Fehler bei der Verbindung.';
  }

  private attach(room: Room<any>): void {
    this.room = room;
    try {
      sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);
    } catch {
      /* ignorieren */
    }
    room.onMessage('start', (m: GameStartMessage) => {
      this.meId = m.you;
      this.lastSeq = -1;
      if (this.session) {
        // Wiederverbindung: Sitzung bleibt, bekommt gleich ein volles Update
        this.session.rebind(room, m);
      } else {
        this.pendingStart = m;
        this.session = new OnlineSession(this, room, m);
        this.flushUpdates();
        for (const c of this.startCbs) c(this.session);
      }
    });
    room.onMessage('update', (m: GameUpdateMessage) => {
      if (m.seq < this.lastSeq && !m.full) return;
      this.lastSeq = m.seq;
      if (this.session) this.session.receive(m);
      else this.pendingUpdates.push(m);
    });
    room.onMessage('error', (m: ErrorMessage) => this.msgCbs.forEach((c) => c('error', m.message)));
    room.onMessage('notice', (m: NoticeMessage) => this.msgCbs.forEach((c) => c('notice', m.text)));
    room.onStateChange(() => this.emitLobby());
    room.onLeave((code) => {
      const normal = code === 1000;
      this.connCbs.forEach((c) => c(normal ? 'closed' : 'lost'));
      if (normal) this.forgetToken();
    });
    room.onError((_c, msg) => this.msgCbs.forEach((c) => c('error', msg ?? 'Verbindungsfehler')));
    this.emitLobby();
    this.connCbs.forEach((c) => c('ok'));
  }

  private flushUpdates(): void {
    const s = this.session;
    if (!s) return;
    for (const u of this.pendingUpdates) s.receive(u);
    this.pendingUpdates = [];
    void this.pendingStart;
  }

  lobby(): LobbyView | null {
    const st = this.room?.state as
      | { phase: string; code: string; layoutId: string; rounds: number; slots: Map<string, any> }
      | undefined;
    if (!st) return null;
    const slots: LobbySlot[] = [];
    st.slots.forEach((s: any) =>
      slots.push({
        id: s.id,
        name: s.name,
        character: s.character,
        kind: s.kind,
        difficulty: s.difficulty,
        ready: s.ready,
        connected: s.connected,
        host: s.host,
      }),
    );
    return {
      phase: st.phase as LobbyView['phase'],
      code: st.code,
      layoutId: st.layoutId,
      rounds: st.rounds,
      slots,
      meId: this.meId,
    };
  }
  private emitLobby(): void {
    const v = this.lobby();
    if (v) for (const c of this.lobbyCbs) c(v);
  }

  send(m: ClientMessage): void {
    this.room?.send('msg', m);
  }

  leave(): void {
    this.forgetToken();
    try {
      void this.room?.leave(true);
    } catch {
      /* ignorieren */
    }
    this.room = null;
    this.session?.dispose();
    this.session = null;
  }
}

/** Online-Partie: hält den letzten geprüften Serverzustand und leitet Aktionen an den Server weiter */
export class OnlineSession implements GameSession {
  readonly kind = 'online' as const;
  core: GameCore;
  players: PlayerSetup[];
  layoutId: string;
  rounds: number;
  localIds: string[];
  initialEvents: GameEvent[] = [];
  private updateCbs: Array<(e: GameEvent[], f: boolean) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private connCbs: Array<(s: 'ok' | 'lost' | 'closed') => void> = [];
  private offs: Array<() => void> = [];

  constructor(
    net: OnlineClient,
    private room: Room<any>,
    start: GameStartMessage,
  ) {
    this.players = start.players;
    this.layoutId = start.layoutId;
    this.rounds = start.rounds;
    this.localIds = [start.you];
    this.core = new GameCore({ layoutId: start.layoutId, rounds: start.rounds, players: start.players }, 1);
    this.offs.push(
      net.onMessage((k, t) => this.msgCbs.forEach((c) => c(k, t))),
      net.onConnection((s) => this.connCbs.forEach((c) => c(s))),
    );
  }

  get state(): GameState {
    return this.core.state;
  }

  rebind(room: Room<any>, start: GameStartMessage): void {
    this.room = room;
    this.localIds = [start.you];
  }

  receive(m: GameUpdateMessage): void {
    this.core.state = m.state;
    for (const c of this.updateCbs) c(m.events, m.full);
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
    // Vorab prüfen spart Server-Fehler; der Server entscheidet trotzdem endgültig
    const err = this.core.validate(playerId, action);
    if (err) {
      this.msgCbs.forEach((c) => c('error', err));
      return err;
    }
    this.room.send('msg', { type: 'game:action', action } satisfies ClientMessage);
    return null;
  }

  setBusy(): void {
    /* Der Server taktet selbst */
  }

  dispose(): void {
    this.offs.forEach((o) => o());
    this.updateCbs = [];
    this.msgCbs = [];
  }
}

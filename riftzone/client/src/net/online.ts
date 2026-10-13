// Online-Verbindung zum eigenen RIFTZONE-Server: Lobby, Gruppen, Matchmaking, private Matches, Wiederverbindung.
import { PROTOCOL_VERSION } from '../../../shared/src/constants';
import type { Cosmetics } from '../../../shared/src/types';
import { load, remove, save } from '../core/storage';
import type { Transport } from './transport';

export interface PartyMember {
  id: string;
  name: string;
  ready: boolean;
  leader: boolean;
  level: number;
  cos?: Cosmetics;
}

export interface PrivateLobby {
  code: string;
  host: string;
  members: PartyMember[];
  cfg: { teamSize: number; build: boolean; maxPlayers: number; fillBots: boolean; botSkill: number; zoneScale: number };
}

export interface LeaderEntry {
  name: string;
  wins: number;
  kills: number;
  matches: number;
  level: number;
}

export type LobbyMsg =
  | { t: 'welcome'; id: string; reconnect: string | null; online: number }
  | { t: 'queue'; count: number; needed: number; wait: number; mode: string }
  | { t: 'queueLeft' }
  | { t: 'party'; code: string; members: PartyMember[]; mode: string } | { t: 'partyLeft' }
  | { t: 'private'; lobby: PrivateLobby }
  | { t: 'privateLeft' }
  | { t: 'matchFound'; matchId: string }
  | { t: 'error'; msg: string }
  | { t: 'presence'; list: { id: string; online: boolean; inMatch: boolean; name: string }[] }
  | { t: 'invited'; from: string; name: string; code: string }
  | { t: 'lb'; entries: LeaderEntry[] }
  | { t: 'stats'; online: number; matches: number };

/** Normalisiert eine Server-Adresse zu einer ws(s)-URL */
export function serverWsUrl(input: string): string {
  let u = input.trim();
  if (!u) return '';
  if (!/^wss?:\/\//i.test(u)) {
    if (/^https?:\/\//i.test(u)) u = u.replace(/^http/i, 'ws');
    else u = (location.protocol === 'https:' ? 'wss://' : 'ws://') + u;
  }
  if (!/\/ws\/?$/.test(u)) u = u.replace(/\/?$/, '/ws');
  return u;
}

export function serverHttpUrl(input: string): string {
  return serverWsUrl(input).replace(/^ws/i, 'http').replace(/\/ws$/, '');
}

export class OnlineClient {
  ws: WebSocket | null = null;
  connected = false;
  myId = '';
  onLobby: ((m: LobbyMsg) => void) | null = null;
  onStatus: ((s: 'connecting' | 'open' | 'closed', reason?: string) => void) | null = null;
  /** Aktive Match-Verbindung (Spielnachrichten gehen dorthin) */
  matchTransport: OnlineTransport | null = null;
  private url = '';
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;
  private hello: { name: string; cos: Cosmetics; profileId: string; level: number } | null = null;
  /** Nachrichten, die vor dem Start-Paket eintrafen */
  private early: (string | ArrayBuffer)[] = [];

  connect(url: string, hello: { name: string; cos: Cosmetics; profileId: string; level: number }): void {
    this.url = serverWsUrl(url);
    this.hello = hello;
    this.closedByUser = false;
    this.open();
  }

  private open(): void {
    if (!this.url) return;
    this.onStatus?.('connecting');
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (e) {
      this.onStatus?.('closed', 'Ungültige Server-Adresse');
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.onopen = () => {
      this.connected = true;
      this.retry = 0;
      const rec = load<{ matchId: string; t: number } | null>('reconnect', null);
      ws.send(
        JSON.stringify({
          t: 'hello',
          v: PROTOCOL_VERSION,
          id: this.hello!.profileId,
          name: this.hello!.name,
          cos: this.hello!.cos,
          level: this.hello!.level,
          reconnect: rec && Date.now() - rec.t < 30 * 60 * 1000 ? rec.matchId : null,
        }),
      );
      this.onStatus?.('open');
    };
    ws.onmessage = (ev) => {
      const d = ev.data as string | ArrayBuffer;
      if (typeof d === 'string') {
        let m: { t: string };
        try {
          m = JSON.parse(d);
        } catch {
          return;
        }
        if (m.t === 'start' || m.t === 'sync' || m.t === 'results') {
          if (m.t === 'start') save('reconnect', { matchId: (m as unknown as { matchId: string }).matchId, t: Date.now() });
          if (m.t === 'results') remove('reconnect');
          if (this.matchTransport) this.matchTransport.deliver(d);
          else this.early.push(d);
          return;
        }
        if (m.t === 'welcome') this.myId = (m as unknown as { id: string }).id;
        this.onLobby?.(m as LobbyMsg);
      } else if (this.matchTransport) this.matchTransport.deliver(d);
    };
    ws.onclose = (ev) => {
      this.connected = false;
      this.ws = null;
      const reason = ev.reason || (ev.code === 1006 ? 'Server nicht erreichbar' : 'Verbindung getrennt');
      this.onStatus?.('closed', reason);
      this.matchTransport?.lost(reason);
      if (!this.closedByUser && this.retry < 6) {
        const wait = Math.min(8000, 800 * 2 ** this.retry++);
        this.retryTimer = setTimeout(() => this.open(), wait);
      }
    };
    ws.onerror = () => {
      /* onclose folgt */
    };
  }

  send(msg: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  sendBinary(b: ArrayBuffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(b);
  }

  /** Transport für ein gefundenes Match erzeugen (übernimmt früh eingetroffene Pakete). */
  startMatch(): OnlineTransport {
    const t = new OnlineTransport(this);
    this.matchTransport = t;
    const early = this.early;
    this.early = [];
    setTimeout(() => early.forEach((d) => t.deliver(d)), 0);
    return t;
  }

  endMatch(): void {
    this.matchTransport = null;
    this.early = [];
  }

  disconnect(): void {
    this.closedByUser = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.ws?.close(1000, 'Benutzer');
    this.ws = null;
    this.connected = false;
  }
}

export class OnlineTransport implements Transport {
  readonly online = true;
  onMessage: ((data: ArrayBuffer | string) => void) | null = null;
  onClose: ((reason: string) => void) | null = null;
  private queue: (ArrayBuffer | string)[] = [];
  private lostTimer: ReturnType<typeof setTimeout> | null = null;
  constructor(private readonly client: OnlineClient) {}
  deliver(d: ArrayBuffer | string): void {
    if (this.lostTimer && typeof d !== 'string') {
      clearTimeout(this.lostTimer);
      this.lostTimer = null;
    }
    if (this.onMessage) {
      if (this.queue.length) {
        const q = this.queue;
        this.queue = [];
        q.forEach((x) => this.onMessage!(x));
      }
      this.onMessage(d);
    } else this.queue.push(d);
  }
  /** Verbindung weg – der Client versucht neu zu verbinden; nach 20 s geben wir auf */
  lost(reason: string): void {
    if (this.lostTimer) return;
    this.lostTimer = setTimeout(() => this.onClose?.(`${reason} – Wiederverbindung fehlgeschlagen`), 20000);
  }
  send(data: ArrayBuffer): void {
    this.client.sendBinary(data);
  }
  leave(): void {
    this.client.send({ t: 'leaveMatch' });
    remove('reconnect');
    this.client.endMatch();
  }
}

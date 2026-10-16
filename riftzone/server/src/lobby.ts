// Lobby-Logik des Servers: Verbindungen, Gruppen, Warteschlangen, private Lobbys, Matches, Wiederverbindung,
// Anwesenheit von Freunden. Unabhängig vom WebSocket-Paket (Socket-Schnittstelle), damit sie testbar ist.
import { PROTOCOL_VERSION, TICK_RATE } from '../../shared/src/constants';
import { MatchRoom, type Human, type RoomClient } from '../../shared/src/room';
import { defaultConfig, defaultCosmetics, type Cosmetics, type MatchConfig, type PlacementResult, type TeamSize } from '../../shared/src/types';

/** Was die Lobby von der Server-Konfiguration braucht (ServerConfig erfüllt das; der Gastgeber im Browser übergibt ein festes Objekt). */
export interface LobbyConfig {
  publicSize: number;
  queueWait: number;
  maxMatches: number;
  snapshotEvery: number;
  botSkill: number;
  minHumans: number;
}

/** Ranglisten-Speicher (StatsStore auf dem Server; im Browser-Gastgeber keiner) */
export interface LobbyStats {
  totalMatches: number;
  matchPlayed(): void;
  record(id: string, name: string, level: number, r: PlacementResult): void;
  top(n: number): { name: string; wins: number; kills: number; matches: number; level: number }[];
}

export interface Socket {
  send(data: string | ArrayBuffer): void;
  close(code?: number, reason?: string): void;
  /** gepufferte Bytes (Überlastschutz) */
  buffered(): number;
}

interface Party {
  code: string;
  members: Conn[];
  leader: Conn;
  ready: Set<string>;
}

interface Priv {
  code: string;
  host: Conn;
  members: Conn[];
  cfg: { teamSize: TeamSize; build: boolean; maxPlayers: number; fillBots: boolean; botSkill: number; zoneScale: number };
}

interface QueueGroup {
  conns: Conn[];
  since: number;
  party: string;
}

export class Conn {
  id = '';
  name = 'Spieler';
  cos: Cosmetics = defaultCosmetics();
  level = 1;
  hello = false;
  party: Party | null = null;
  priv: Priv | null = null;
  queue: string | null = null;
  room: MatchRoom | null = null;
  client: RoomClient | null = null;
  watch: string[] = [];
  msgs = 0;
  msgT = Date.now();
  constructor(readonly sock: Socket) {}
  send(o: Record<string, unknown>): void {
    this.sock.send(JSON.stringify(o));
  }
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const cleanName = (s: unknown): string =>
  String(s ?? '')
    .replace(/[^\p{L}\p{N} _.-]/gu, '')
    .trim()
    .slice(0, 16) || 'Spieler';
const cleanCos = (c: unknown): Cosmetics => {
  const d = defaultCosmetics();
  if (!c || typeof c !== 'object') return d;
  const o = c as Record<string, unknown>;
  const lim: Record<keyof Cosmetics, number> = { outfit: 12, hat: 8, back: 6, glider: 6, pickaxe: 4, skin: 6, wrap: 1, victory: 4 };
  for (const k of Object.keys(lim) as (keyof Cosmetics)[]) {
    const v = Number(o[k]);
    d[k] = Number.isInteger(v) && v >= 0 && v < lim[k] ? v : d[k];
  }
  return d;
};

export class Lobby {
  readonly conns = new Map<string, Conn>();
  private readonly parties = new Map<string, Party>();
  private readonly privs = new Map<string, Priv>();
  private readonly queues = new Map<string, QueueGroup[]>();
  readonly rooms = new Set<MatchRoom>();
  /** Spieler-ID → laufendes Match (für Wiederverbindung) */
  private readonly playerRoom = new Map<string, MatchRoom>();
  private nextRoom = 1;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private secTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly cfg: LobbyConfig,
    private readonly stats: LobbyStats | null,
  ) {}

  start(): void {
    // Gemeinsamer Takt für alle Matches (mit Ausgleich bei Verzögerung)
    const step = 1000 / TICK_RATE;
    let last = performance.now(),
      acc = 0;
    this.tickTimer = setInterval(() => {
      const now = performance.now();
      acc += Math.min(500, now - last);
      last = now;
      let n = 0;
      while (acc >= step && n < 5) {
        for (const r of this.rooms) r.step();
        acc -= step;
        n++;
      }
      if (n === 5) acc = 0;
    }, step / 2);
    this.secTimer = setInterval(() => this.everySecond(), 1000);
  }

  stop(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.secTimer) clearInterval(this.secTimer);
  }

  // ---------- Verbindungen ----------

  connect(sock: Socket): Conn {
    return new Conn(sock);
  }

  disconnect(c: Conn): void {
    this.leaveQueue(c);
    this.leaveParty(c, false);
    this.leavePriv(c);
    if (c.room && c.client) c.room.detach(c.client.playerId);
    c.room = null;
    if (c.id && this.conns.get(c.id) === c) this.conns.delete(c.id);
    this.pushPresence(c.id);
  }

  onText(c: Conn, raw: string): void {
    // Ratenbegrenzung
    const now = Date.now();
    if (now - c.msgT > 1000) {
      c.msgT = now;
      c.msgs = 0;
    }
    if (++c.msgs > 30) return;
    if (raw.length > 4096) return;
    let m: Record<string, unknown>;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (typeof m !== 'object' || !m || typeof m.t !== 'string') return;
    if (m.t === 'hello') return this.hello(c, m);
    if (!c.hello) return;
    switch (m.t) {
      case 'queue':
        return this.queue(c, m.teamSize === 2 || m.teamSize === 4 ? m.teamSize : 1, m.build !== false);
      case 'cancel':
        return this.cancelQueue(c);
      case 'party.create':
        return this.createParty(c);
      case 'party.join':
        return this.joinParty(c, String(m.code ?? '').toUpperCase());
      case 'party.leave':
        return this.leaveParty(c, true);
      case 'party.ready':
        if (c.party) {
          if (m.ready) c.party.ready.add(c.id);
          else c.party.ready.delete(c.id);
          this.pushParty(c.party);
        }
        return;
      case 'private.create':
        return this.createPriv(c, m.cfg as Record<string, unknown>, m.code);
      case 'private.join':
        return this.joinPriv(c, String(m.code ?? '').toUpperCase());
      case 'private.leave':
        return this.leavePriv(c);
      case 'private.start':
        return this.startPriv(c);
      case 'leaveMatch':
        if (c.room && c.client) {
          c.room.leave(c.client.playerId);
          this.playerRoom.delete(c.id);
        }
        c.room = null;
        c.client = null;
        return;
      case 'friends':
        c.watch = Array.isArray(m.ids) ? (m.ids as unknown[]).map(String).filter((s) => /^[0-9a-f]{8,24}$/.test(s)).slice(0, 100) : [];
        return this.sendPresence(c);
      case 'invite': {
        const to = this.findConn(String(m.to ?? ''));
        if (to && c.party) to.send({ t: 'invited', from: c.id, name: c.name, code: c.party.code });
        return;
      }
      case 'lb':
        c.send({ t: 'lb', entries: this.leaderboard() });
        return;
      default:
        return;
    }
  }

  onBinary(c: Conn, data: ArrayBuffer): void {
    if (c.room && c.client) c.room.onBinary(c.client.playerId, data);
  }

  private hello(c: Conn, m: Record<string, unknown>): void {
    if (m.v !== PROTOCOL_VERSION) {
      c.send({ t: 'error', msg: 'Veraltete Spielversion – bitte die Seite neu laden.' });
      c.sock.close(4000, 'Version');
      return;
    }
    const id = String(m.id ?? '');
    if (!/^[0-9a-f]{24}$/.test(id)) {
      c.sock.close(4001, 'Ungültige ID');
      return;
    }
    // Nur eine Sitzung pro Spieler
    const old = this.conns.get(id);
    if (old && old !== c) {
      old.send({ t: 'error', msg: 'Du hast dich an einem anderen Gerät angemeldet.' });
      this.disconnect(old);
      old.sock.close(4002, 'Neue Sitzung');
    }
    c.id = id;
    c.name = cleanName(m.name);
    c.cos = cleanCos(m.cos);
    c.level = Math.max(1, Math.min(50, Number(m.level) | 0));
    c.hello = true;
    this.conns.set(id, c);
    // Wiederverbindung zu laufendem Match
    const room = this.playerRoom.get(id);
    let reconnect: string | null = null;
    if (room && this.rooms.has(room) && !room.ended) {
      const p = room.playerFor(id);
      if (p) {
        reconnect = room.id;
        c.send({ t: 'welcome', id, reconnect, online: this.conns.size });
        this.attach(c, room);
        c.send({ t: 'matchFound', matchId: room.id });
        this.pushPresence(id);
        return;
      }
    }
    c.send({ t: 'welcome', id, reconnect, online: this.conns.size });
    this.pushPresence(id);
  }

  private findConn(prefix: string): Conn | undefined {
    if (!prefix) return undefined;
    const exact = this.conns.get(prefix);
    if (exact) return exact;
    for (const [id, c] of this.conns) if (id.startsWith(prefix)) return c;
    return undefined;
  }

  // ---------- Gruppen ----------

  private code(taken: (c: string) => boolean): string {
    for (;;) {
      let s = '';
      for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      if (!taken(s)) return s;
    }
  }

  private createParty(c: Conn): void {
    if (c.party) return this.pushParty(c.party);
    this.leaveQueue(c);
    const p: Party = { code: this.code((s) => this.parties.has(s)), members: [c], leader: c, ready: new Set() };
    this.parties.set(p.code, p);
    c.party = p;
    this.pushParty(p);
  }

  private joinParty(c: Conn, code: string): void {
    const p = this.parties.get(code);
    if (!p) return c.send({ t: 'error', msg: `Gruppe ${code} nicht gefunden.` });
    if (p.members.includes(c)) return this.pushParty(p);
    if (p.members.length >= 4) return c.send({ t: 'error', msg: 'Die Gruppe ist voll (max. 4).' });
    this.leaveParty(c, true);
    this.leaveQueue(c);
    this.cancelGroupQueue(p);
    p.members.push(c);
    c.party = p;
    this.pushParty(p);
  }

  private leaveParty(c: Conn, notify: boolean): void {
    const p = c.party;
    if (!p) return;
    this.cancelGroupQueue(p);
    p.members = p.members.filter((m) => m !== c);
    p.ready.delete(c.id);
    c.party = null;
    if (notify) c.send({ t: 'partyLeft' });
    if (!p.members.length) {
      this.parties.delete(p.code);
      return;
    }
    if (p.leader === c) p.leader = p.members[0]!;
    this.pushParty(p);
  }

  private pushParty(p: Party): void {
    const members = p.members.map((m) => ({ id: m.id, name: m.name, ready: p.ready.has(m.id), leader: m === p.leader, level: m.level, cos: m.cos }));
    for (const m of p.members) m.send({ t: 'party', code: p.code, members, mode: '' });
  }

  // ---------- Warteschlange (öffentliche Matches) ----------

  private queue(c: Conn, teamSize: TeamSize, build: boolean): void {
    const key = `${teamSize}:${build ? 1 : 0}`;
    const group = c.party ? c.party.members : [c];
    if (c.party) {
      if (c.party.leader !== c) return c.send({ t: 'error', msg: 'Nur die Gruppenleitung startet die Suche.' });
      const notReady = c.party.members.filter((m) => m !== c && !c.party!.ready.has(m.id));
      if (notReady.length) return c.send({ t: 'error', msg: `Noch nicht bereit: ${notReady.map((m) => m.name).join(', ')}` });
      if (group.length > teamSize) return c.send({ t: 'error', msg: `Die Gruppe ist größer als ${teamSize === 1 ? 'Solo' : teamSize === 2 ? 'Duo' : 'Squad'} erlaubt.` });
    }
    for (const m of group) {
      this.leaveQueue(m);
      if (m.room) return c.send({ t: 'error', msg: `${m.name} ist noch in einem Match.` });
    }
    const list = this.queues.get(key) ?? [];
    list.push({ conns: group, since: Date.now(), party: c.party?.code ?? c.id });
    this.queues.set(key, list);
    for (const m of group) m.queue = key;
    this.pushQueue(key);
  }

  private cancelQueue(c: Conn): void {
    if (c.party) this.cancelGroupQueue(c.party);
    else this.leaveQueue(c);
  }

  private cancelGroupQueue(p: Party): void {
    for (const m of p.members) this.leaveQueue(m);
  }

  private leaveQueue(c: Conn): void {
    if (!c.queue) return;
    const key = c.queue;
    const list = this.queues.get(key) ?? [];
    const g = list.find((x) => x.conns.includes(c));
    if (g) {
      list.splice(list.indexOf(g), 1);
      for (const m of g.conns) {
        m.queue = null;
        m.send({ t: 'queueLeft' });
      }
    }
    c.queue = null;
    this.pushQueue(key);
  }

  private pushQueue(key: string): void {
    const list = this.queues.get(key) ?? [];
    const count = list.reduce((s, g) => s + g.conns.length, 0);
    const oldest = list.length ? Math.min(...list.map((g) => g.since)) : Date.now();
    const wait = Math.max(0, this.cfg.queueWait - (Date.now() - oldest) / 1000);
    for (const g of list) for (const m of g.conns) m.send({ t: 'queue', count, needed: this.cfg.minHumans, wait, mode: key });
  }

  private everySecond(): void {
    // Warteschlangen abarbeiten
    for (const [key, list] of this.queues) {
      if (!list.length) continue;
      const count = list.reduce((s, g) => s + g.conns.length, 0);
      const oldest = Math.min(...list.map((g) => g.since));
      const waited = (Date.now() - oldest) / 1000;
      const full = count >= this.cfg.publicSize;
      if ((count >= this.cfg.minHumans && waited >= this.cfg.queueWait) || full) {
        if (this.rooms.size >= this.cfg.maxMatches) {
          for (const g of list) for (const m of g.conns) m.send({ t: 'error', msg: 'Server ausgelastet – bitte gleich nochmal versuchen.' });
          continue;
        }
        const [ts, b] = key.split(':');
        const groups: QueueGroup[] = [];
        let n = 0;
        while (list.length && n + list[0]!.conns.length <= this.cfg.publicSize) {
          const g = list.shift()!;
          groups.push(g);
          n += g.conns.length;
        }
        for (const g of groups) for (const m of g.conns) m.queue = null;
        this.createRoom(
          defaultConfig({ seed: (Math.random() * 0xffffffff) >>> 0, teamSize: Number(ts) as TeamSize, build: b === '1', maxPlayers: this.cfg.publicSize, fillBots: true, botSkill: this.cfg.botSkill, timeOfDay: [10, 14, 17, 19.5, 21.5][Math.floor(Math.random() * 5)]!, weather: Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2, label: 'Öffentlich' }),
          groups.map((g) => ({ conns: g.conns, party: g.party })),
        );
      } else this.pushQueue(key);
    }
    // Beendete Matches aufräumen
    for (const r of this.rooms) {
      if (r.ended && r.match.time - r.endedAt > 45) this.closeRoom(r);
      else if (!r.ended && r.match.players.every((p) => p.bot || !p.connected) && r.match.time > 60) {
        // Niemand mehr verbunden → Match beenden, um Rechenzeit zu sparen
        this.closeRoom(r);
      }
    }
    // Anwesenheit regelmäßig aktualisieren
    if (Math.floor(Date.now() / 1000) % 15 === 0) for (const c of this.conns.values()) if (c.watch.length) this.sendPresence(c);
  }

  // ---------- Private Lobbys ----------

  /** want: gewünschter Code (z. B. der Raumcode beim Spiel ohne Server), sonst ein zufälliger */
  private createPriv(c: Conn, cfg: Record<string, unknown> | undefined, want?: unknown): void {
    this.leavePriv(c);
    this.leaveQueue(c);
    const o = cfg ?? {};
    const teamSize = (o.teamSize === 2 || o.teamSize === 4 ? o.teamSize : 1) as TeamSize;
    const p: Priv = {
      code: typeof want === 'string' && /^[A-Z2-9]{5}$/.test(want) && !this.privs.has(want) && !this.parties.has(want) ? want : this.code((s) => this.privs.has(s) || this.parties.has(s)),
      host: c,
      members: [c],
      cfg: {
        teamSize,
        build: o.build !== false,
        maxPlayers: Math.max(2, Math.min(100, Number(o.maxPlayers) || 50)),
        fillBots: o.fillBots !== false,
        botSkill: Math.max(0, Math.min(2, Number(o.botSkill) | 0)),
        zoneScale: Math.max(0.3, Math.min(1.5, Number(o.zoneScale) || 1)),
      },
    };
    this.privs.set(p.code, p);
    c.priv = p;
    this.pushPriv(p);
  }

  private joinPriv(c: Conn, code: string): void {
    const p = this.privs.get(code);
    if (!p) return c.send({ t: 'error', msg: `Lobby ${code} nicht gefunden.` });
    if (p.members.includes(c)) return this.pushPriv(p);
    if (p.members.length >= Math.min(100, p.cfg.maxPlayers)) return c.send({ t: 'error', msg: 'Die Lobby ist voll.' });
    this.leavePriv(c);
    this.leaveQueue(c);
    p.members.push(c);
    c.priv = p;
    this.pushPriv(p);
  }

  private leavePriv(c: Conn): void {
    const p = c.priv;
    if (!p) return;
    p.members = p.members.filter((m) => m !== c);
    c.priv = null;
    c.send({ t: 'privateLeft' });
    if (!p.members.length) {
      this.privs.delete(p.code);
      return;
    }
    if (p.host === c) p.host = p.members[0]!;
    this.pushPriv(p);
  }

  private pushPriv(p: Priv): void {
    const lobby = { code: p.code, host: p.host.id, members: p.members.map((m) => ({ id: m.id, name: m.name, ready: true, leader: m === p.host, level: m.level })), cfg: p.cfg };
    for (const m of p.members) m.send({ t: 'private', lobby });
  }

  private startPriv(c: Conn): void {
    const p = c.priv;
    if (!p || p.host !== c) return;
    if (this.rooms.size >= this.cfg.maxMatches) return c.send({ t: 'error', msg: 'Server ausgelastet – bitte gleich nochmal versuchen.' });
    this.privs.delete(p.code);
    const members = p.members;
    for (const m of members) m.priv = null;
    const max = Math.max(members.length, p.cfg.fillBots ? p.cfg.maxPlayers : members.length);
    this.createRoom(
      defaultConfig({ seed: (Math.random() * 0xffffffff) >>> 0, teamSize: p.cfg.teamSize, build: p.cfg.build, maxPlayers: Math.min(100, max), fillBots: p.cfg.fillBots, botSkill: p.cfg.botSkill, zoneScale: p.cfg.zoneScale, label: `Privat ${p.code}` }),
      // Gruppen bleiben zusammen, sonst jeder für sich (in Teams der Reihe nach aufgefüllt)
      members.map((m) => ({ conns: [m], party: m.party?.code ?? `p${p.code}-${Math.floor(members.indexOf(m) / p.cfg.teamSize)}` })),
    );
  }

  // ---------- Matches ----------

  private createRoom(cfg: MatchConfig, groups: { conns: Conn[]; party: string }[]): MatchRoom {
    const humans: Human[] = [];
    for (const g of groups) for (const c of g.conns) humans.push({ key: c.id, name: c.name, cos: c.cos, party: g.party });
    const id = `m${this.nextRoom++}-${Date.now().toString(36)}`;
    const room = new MatchRoom(id, cfg, humans, this.cfg.snapshotEvery);
    this.rooms.add(room);
    room.onEnd = (results) => {
      this.stats?.matchPlayed();
      for (const r of results) {
        if (r.bot) continue;
        const key = [...room.keys.entries()].find(([, pid]) => pid === r.id)?.[0];
        if (!key) continue;
        const c = this.conns.get(key);
        this.stats?.record(key, c?.name ?? r.name, c?.level ?? 1, r);
      }
    };
    for (const g of groups)
      for (const c of g.conns) {
        this.playerRoom.set(c.id, room);
        c.send({ t: 'matchFound', matchId: id });
        this.attach(c, room);
        this.pushPresence(c.id);
      }
    console.log(`[match] ${id} gestartet: ${humans.length} Menschen, ${room.match.players.length} Teilnehmer, ${cfg.teamSize}er-Teams, ${cfg.build ? 'mit' : 'ohne'} Bauen`);
    return room;
  }

  private attach(c: Conn, room: MatchRoom): void {
    const client: RoomClient = {
      send: (d) => {
        // Überlastschutz: bei vollem Puffer Zustandspakete auslassen (das nächste ersetzt sie)
        if (typeof d !== 'string' && c.sock.buffered() > 512 * 1024) return;
        c.sock.send(d);
      },
      playerId: 0,
      spectate: 0,
      connected: true,
      rate: 0,
      rateT: 0,
    };
    c.room = room;
    c.client = client;
    room.attach(c.id, client, true);
  }

  private closeRoom(r: MatchRoom): void {
    this.rooms.delete(r);
    for (const [pid, room] of this.playerRoom) if (room === r) this.playerRoom.delete(pid);
    for (const c of this.conns.values()) if (c.room === r) {
      c.room = null;
      c.client = null;
      this.pushPresence(c.id);
    }
    console.log(`[match] ${r.id} geschlossen`);
  }

  // ---------- Freunde ----------

  private presenceOf(id: string): { id: string; online: boolean; inMatch: boolean; name: string } {
    let c = this.conns.get(id);
    if (!c) for (const [k, v] of this.conns) if (k.startsWith(id)) c = v;
    return { id, online: !!c, inMatch: !!c?.room, name: c?.name ?? '' };
  }

  private sendPresence(c: Conn): void {
    c.send({ t: 'presence', list: c.watch.map((id) => this.presenceOf(id)) });
  }

  private pushPresence(id: string): void {
    if (!id) return;
    for (const c of this.conns.values()) if (c.watch.some((w) => id.startsWith(w))) this.sendPresence(c);
  }

  leaderboard(): { name: string; wins: number; kills: number; matches: number; level: number }[] {
    return (this.stats?.top(50) ?? []).map((e) => ({ name: e.name, wins: e.wins, kills: e.kills, matches: e.matches, level: e.level }));
  }

  status(): { online: number; matches: number; inMatch: number; queued: number; totalMatches: number } {
    let inMatch = 0,
      queued = 0;
    for (const c of this.conns.values()) {
      if (c.room) inMatch++;
      if (c.queue) queued++;
    }
    return { online: this.conns.size, matches: this.rooms.size, inMatch, queued, totalMatches: this.stats?.totalMatches ?? 0 };
  }
}

// Ein laufendes Match mit angeschlossenen Empfängern. Wird vom Offline-Worker und vom Server genutzt.
import { botThink } from './bot';
import { DT } from './constants';
import { Match, type MatchEvent, type Player } from './match';
import { Msg, decodeInputs, encodeFrame, makeSync, type StartInfo } from './protocol';
import { Phase, type Cosmetics, type MatchConfig, type PlacementResult } from './types';
import { World } from './world';
import { generateWorld } from './worldgen';
import { getTerrain } from './terrain';
import { BinReader } from './protocol';

export interface RoomClient {
  /** Sendet Binär- oder Textdaten an den Empfänger. */
  send(data: ArrayBuffer | string): void;
  playerId: number;
  /** Zuschauer-Ziel (eigene ID = keins) */
  spectate: number;
  connected: boolean;
  /** Eingaben in der letzten Sekunde (Ratenbegrenzung) */
  rate: number;
  rateT: number;
}

export interface Human {
  key: string;
  name: string;
  cos: Cosmetics;
  /** Gruppe: Spieler mit gleicher Gruppe kommen ins selbe Team */
  party: string;
}

const BOT_NAMES = [
  'Nova', 'Funke', 'Kiesel', 'Orbit', 'Lumen', 'Pixel', 'Brise', 'Quarz', 'Echo', 'Komet', 'Wirbel', 'Flint', 'Zirkon', 'Mika', 'Juna',
  'Ronja', 'Tilo', 'Kaja', 'Lasse', 'Nele', 'Ole', 'Pia', 'Rasmus', 'Sina', 'Timo', 'Vera', 'Yuri', 'Zora', 'Bento', 'Cleo', 'Dante',
  'Elli', 'Fynn', 'Greta', 'Hugo', 'Ida', 'Jaro', 'Kian', 'Lotta', 'Malte', 'Nika', 'Oskar', 'Paula', 'Quinn', 'Rieke', 'Sami', 'Theo',
];

export class MatchRoom {
  readonly match: Match;
  readonly clients = new Map<number, RoomClient>();
  /** Schlüssel (Konto/Token) → Spieler-ID */
  readonly keys = new Map<string, number>();
  readonly id: string;
  readonly snapshotEvery: number;
  private pending: MatchEvent[] = [];
  private ticksSinceFrame = 0;
  ended = false;
  endedAt = 0;
  results: PlacementResult[] = [];
  onEnd: ((r: PlacementResult[], m: Match) => void) | null = null;

  constructor(id: string, cfg: MatchConfig, humans: Human[], snapshotEvery = 1) {
    this.id = id;
    this.snapshotEvery = snapshotEvery;
    const world = new World(getTerrain());
    const content = generateWorld(world);
    this.match = new Match(cfg, world, content);
    this.match.botThink = botThink;
    // Teams bilden: Gruppen zusammen, dann auffüllen
    const ts = cfg.teamSize;
    const groups = new Map<string, Human[]>();
    for (const h of humans) {
      const g = groups.get(h.party) ?? [];
      g.push(h);
      groups.set(h.party, g);
    }
    let team = 0;
    const teamFill: { team: number; size: number }[] = [];
    for (const g of groups.values()) {
      for (let i = 0; i < g.length; i += ts) {
        const chunk = g.slice(i, i + ts);
        for (const h of chunk) {
          const p = this.match.addPlayer(h.name, team, false, h.cos);
          this.keys.set(h.key, p.id);
        }
        teamFill.push({ team, size: chunk.length });
        team++;
      }
    }
    if (cfg.fillBots) {
      let n = 0;
      const rngName = (i: number): string => BOT_NAMES[i % BOT_NAMES.length]! + (i >= BOT_NAMES.length ? String(Math.floor(i / BOT_NAMES.length) + 1) : '');
      const nameOff = cfg.seed % BOT_NAMES.length;
      // angefangene Teams mit Bots auffüllen
      for (const t of teamFill) {
        for (let k = t.size; k < ts && this.match.players.length < cfg.maxPlayers; k++) {
          this.match.addPlayer(rngName(nameOff + n++), t.team, true, botCos(cfg.seed + n));
        }
      }
      while (this.match.players.length < cfg.maxPlayers) {
        for (let k = 0; k < ts && this.match.players.length < cfg.maxPlayers; k++) {
          this.match.addPlayer(rngName(nameOff + n++), team, true, botCos(cfg.seed + n));
        }
        team++;
      }
    }
    this.match.start();
  }

  playerFor(key: string): Player | undefined {
    const id = this.keys.get(key);
    return id === undefined ? undefined : this.match.byId.get(id);
  }

  /** Empfänger anmelden (auch Wiederverbindung). Sendet Start- und Synchronisationsdaten. */
  attach(key: string, client: RoomClient, online: boolean): boolean {
    const p = this.playerFor(key);
    if (!p) return false;
    client.playerId = p.id;
    client.spectate = p.id;
    client.connected = true;
    this.clients.set(p.id, client);
    p.connected = true;
    if (!p.alive && this.match.phase !== Phase.Ended) {
      // ausgeschieden → Zuschauer
    } else if (p.bot) {
      p.bot = false;
    }
    const start: StartInfo & { t: 'start' } = {
      t: 'start',
      selfId: p.id,
      team: p.team,
      config: this.match.cfg,
      roster: this.match.roster(),
      online,
      matchId: this.id,
    };
    client.send(JSON.stringify(start));
    client.send(JSON.stringify({ t: 'sync', ...makeSync(this.match) }));
    if (this.ended) client.send(JSON.stringify({ t: 'results', results: this.results, winnerTeam: this.match.winnerTeam }));
    return true;
  }

  /** Verbindung weg: Figur wird von der KI weitergespielt, bis der Spieler zurückkommt. */
  detach(playerId: number): void {
    const c = this.clients.get(playerId);
    if (c) c.connected = false;
    this.clients.delete(playerId);
    const p = this.match.byId.get(playerId);
    if (p) {
      p.connected = false;
      if (p.alive) {
        p.bot = true;
        p.queue.length = 0;
      }
    }
  }

  /** Spieler verlässt endgültig */
  leave(playerId: number): void {
    this.detach(playerId);
    this.match.leave(playerId);
  }

  onBinary(playerId: number, buf: ArrayBuffer): void {
    const c = this.clients.get(playerId);
    if (!c) return;
    const type = new Uint8Array(buf, 0, 1)[0];
    if (type === Msg.Input) {
      // Ratenbegrenzung: höchstens ~70 Pakete pro Sekunde
      c.rate++;
      if (c.rate > 70) return;
      const inputs = decodeInputs(buf);
      if (!inputs) return;
      const p = this.match.byId.get(playerId);
      if (!p || p.bot) return;
      for (const inp of inputs) {
        // Sequenzen dürfen nicht weit in die Zukunft springen
        if (inp.seq > p.lastSeq + 200 && p.lastSeq > 0) continue;
        this.match.pushInput(playerId, inp);
      }
    } else if (type === Msg.Spectate) {
      const r = new BinReader(buf);
      r.u8();
      const t = r.u16();
      const p = this.match.byId.get(t);
      if (p) c.spectate = t;
    }
  }

  /** Einen Simulationsschritt ausführen und Daten verschicken. */
  step(): void {
    const m = this.match;
    m.step();
    for (const e of m.events) this.pending.push(e);
    this.ticksSinceFrame++;
    for (const c of this.clients.values()) {
      c.rateT += DT;
      if (c.rateT >= 1) {
        c.rateT = 0;
        c.rate = 0;
      }
    }
    const endNow = m.phase === Phase.Ended && !this.ended;
    if (this.ticksSinceFrame >= this.snapshotEvery || endNow) {
      this.ticksSinceFrame = 0;
      const events = this.pending;
      this.pending = [];
      for (const c of this.clients.values()) {
        if (!c.connected) continue;
        const p = m.byId.get(c.playerId) ?? null;
        let focus = p;
        if (p && !p.alive) {
          // Zuschauen: gewünschtes Ziel, sonst Teamkamerad, sonst wer noch lebt
          let t = m.byId.get(c.spectate);
          if (!t || !t.alive) t = m.players.find((q) => q.alive && q.team === p.team) ?? m.players.find((q) => q.alive);
          if (t) {
            focus = t;
            c.spectate = t.id;
          }
        }
        c.send(encodeFrame(m, { viewer: p, focus, ack: p ? p.lastSeq : 0, events }));
      }
    }
    if (endNow) {
      this.ended = true;
      this.endedAt = m.time;
      this.results = m.results;
      const msg = JSON.stringify({ t: 'results', results: m.results, winnerTeam: m.winnerTeam });
      for (const c of this.clients.values()) if (c.connected) c.send(msg);
      this.onEnd?.(m.results, m);
    }
  }
}

function botCos(seed: number): Cosmetics {
  const h = (seed * 2654435761) >>> 0;
  return {
    outfit: h % 12,
    hat: (h >>> 4) % 8,
    back: (h >>> 8) % 6,
    glider: (h >>> 12) % 6,
    pickaxe: (h >>> 16) % 4,
    skin: (h >>> 20) % 6,
    wrap: 0,
    victory: 0,
  };
}

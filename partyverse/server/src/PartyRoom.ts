import { Client, Room, ServerError, matchMaker } from 'colyseus';
import { CHARACTER_IDS, CharacterId, isCharacterId } from '@shared/characters';
import { GameCore, validateConfig } from '@shared/core/core';
import { decide } from '@shared/core/ai';
import type { ApplyResult, Difficulty, GameConfig, PlayerSetup } from '@shared/core/types';
import { MAX_PLAYERS, MIN_PLAYERS } from '@shared/core/types';
import { LAYOUTS, getLayout } from '@shared/levels';
import { getMiniGame } from '@shared/minigames/registry';
import {
  GameStartMessage,
  GameUpdateMessage,
  ClientMessage,
  cleanName,
  makeRoomCode,
  parseClientMessage,
  ErrorMessage,
} from '@shared/net/protocol';
import { Rng, randomSeed } from '@shared/rng';
import { LobbyState, SlotState } from './schema';
import { DEFAULT_TIMING, Timing } from './timing';

const BOT_NAMES = ['Funki', 'Glimmo', 'Zeitfuchs', 'Raumkater', 'Portalo', 'Kringel'];

interface Bucket {
  tokens: number;
  last: number;
  strikes: number;
}

/**
 * Ein Online-Spielraum. Der Server ist die einzige Instanz, die Spielregeln, Würfel und Minispiel-Ergebnisse
 * entscheidet (GameCore). Clients senden nur Absichten (Aktionen) und bekommen den geprüften Zustand zurück.
 */
export class PartyRoom extends Room<LobbyState> {
  /** Global einstellbar (Tests, Serverkonfiguration) */
  static timing: Timing = { ...DEFAULT_TIMING };
  override maxClients = MAX_PLAYERS;

  private core: GameCore | null = null;
  private seq = 0;
  private playerOf = new Map<string, string>(); // sessionId → Spieler-ID
  private buckets = new Map<string, Bucket>();
  private timerGen = 0;
  private counter = 0;
  private rng = new Rng(randomSeed());

  override async onCreate(options: { name?: unknown; public?: unknown }): Promise<void> {
    // Kurzer, merkbarer Raumcode als Raum-ID (eindeutig prüfen)
    for (let i = 0; i < 40; i++) {
      const code = makeRoomCode(() => this.rng.next());
      if (!matchMaker.getRoomById(code)) {
        this.roomId = code;
        break;
      }
    }
    this.setState(new LobbyState());
    this.state.code = this.roomId;
    const pub = options?.public === true;
    if (!pub) this.setPrivate(true);
    this.updateMetadata(cleanName(options?.name) || 'Gast', pub);
    this.onMessage('msg', (client, raw) => this.onClientMessage(client, raw));
    this.autoDispose = true;
  }

  private hostName = 'Gast';
  private isPublic = false;
  private updateMetadata(hostName?: string, pub?: boolean): void {
    if (hostName) this.hostName = hostName;
    if (pub !== undefined) this.isPublic = pub;
    void this.setMetadata({
      name: `${this.hostName}s Raum`,
      code: this.roomId,
      public: this.isPublic,
      phase: this.state.phase,
      players: this.state.slots.size,
      max: MAX_PLAYERS,
      layoutId: this.state.layoutId,
      rounds: this.state.rounds,
    });
  }

  override onAuth(_client: Client, _options: unknown): boolean {
    if (this.state.phase !== 'lobby') throw new ServerError(4002, 'Das Spiel in diesem Raum läuft bereits.');
    if (this.state.slots.size >= MAX_PLAYERS) throw new ServerError(4001, 'Der Raum ist voll.');
    return true;
  }

  override onJoin(client: Client, options: { name?: unknown; character?: unknown }): void {
    const id = 'p' + ++this.counter;
    const slot = new SlotState();
    slot.id = id;
    slot.name = cleanName(options?.name) || 'Gast ' + this.counter;
    slot.character = this.freeCharacter(isCharacterId(options?.character) ? options.character : undefined);
    slot.kind = 'human';
    slot.connected = true;
    slot.host = ![...this.state.slots.values()].some((s) => s.host && s.kind === 'human');
    this.state.slots.set(id, slot);
    this.playerOf.set(client.sessionId, id);
    this.updateMetadata();
  }

  private freeCharacter(want?: CharacterId): CharacterId {
    const used = new Set([...this.state.slots.values()].map((s) => s.character));
    if (want && !used.has(want)) return want;
    return (CHARACTER_IDS.find((c) => !used.has(c)) ?? 'pip') as CharacterId;
  }

  override async onLeave(client: Client, consented: boolean): Promise<void> {
    const id = this.playerOf.get(client.sessionId);
    if (!id) return;
    const slot = this.state.slots.get(id);
    if (!slot) return;
    if (this.state.phase === 'lobby') {
      this.state.slots.delete(id);
      this.playerOf.delete(client.sessionId);
      this.ensureHost();
      this.updateMetadata();
      if (![...this.state.slots.values()].some((s) => s.kind === 'human')) void this.disconnect();
      return;
    }
    // Während des Spiels: kurze Chance zur Wiederverbindung, danach übernimmt ein Bot
    slot.connected = false;
    this.core?.setConnected(id, false);
    this.broadcastNotice(`${slot.name} hat die Verbindung verloren …`);
    this.commit({ ok: true, events: [] });
    this.afterUpdate();
    if (!consented && this.state.phase === 'playing') {
      try {
        const back = await this.allowReconnection(client, PartyRoom.timing.reconnectSeconds);
        slot.connected = true;
        this.core?.setConnected(id, true);
        this.broadcastNotice(`${slot.name} ist wieder da.`);
        this.sendStart(back, id);
        this.sendFull(back);
        this.commit({ ok: true, events: [] });
        this.afterUpdate();
        return;
      } catch {
        /* Zeit abgelaufen */
      }
    }
    this.playerOf.delete(client.sessionId);
    this.convertToBot(id);
  }

  private convertToBot(id: string): void {
    const slot = this.state.slots.get(id);
    if (!slot) return;
    slot.kind = 'bot';
    slot.difficulty = 'easy';
    slot.connected = true;
    if (this.core && this.core.state.players[id]) {
      const p = this.core.player(id);
      p.kind = 'bot';
      p.difficulty = 'easy';
      p.connected = true;
      this.core.state.version++;
    }
    this.broadcastNotice(`${slot.name} wird von einem Bot vertreten.`);
    const humansLeft = [...this.state.slots.values()].some((s) => s.kind === 'human');
    if (!humansLeft) {
      void this.disconnect();
      return;
    }
    this.ensureHost();
    if (this.core) {
      // Bots können das offene Minispiel nicht selbst abgeben → Ergebnis ergänzen
      this.commit(
        this.core.state.phase === 'minigame' && this.core.state.minigame?.stage === 'play'
          ? this.core.forceResults()
          : { ok: true, events: [] },
      );
      this.afterUpdate();
    }
  }

  private ensureHost(): void {
    const slots = [...this.state.slots.values()];
    if (slots.some((s) => s.host && s.kind === 'human')) return;
    slots.forEach((s) => (s.host = false));
    const h = slots.find((s) => s.kind === 'human');
    if (h) h.host = true;
  }

  // ------------------------------------------------------------------ Nachrichten
  private bucket(id: string): Bucket {
    let b = this.buckets.get(id);
    if (!b) this.buckets.set(id, (b = { tokens: 30, last: Date.now(), strikes: 0 }));
    return b;
  }

  private sendError(client: Client, code: ErrorMessage['code'], message: string): void {
    client.send('error', { code, message } satisfies ErrorMessage);
  }

  private onClientMessage(client: Client, raw: unknown): void {
    // Ratenbegrenzung: höchstens ~15 Nachrichten pro Sekunde im Mittel
    const b = this.bucket(client.sessionId);
    const now = Date.now();
    b.tokens = Math.min(30, b.tokens + ((now - b.last) / 1000) * 15);
    b.last = now;
    if (b.tokens < 1) {
      if (++b.strikes > 60) client.leave(1008, 'Zu viele Nachrichten');
      else this.sendError(client, 'rate', 'Bitte langsamer.');
      return;
    }
    b.tokens--;
    const msg = parseClientMessage(raw);
    if (!msg) return this.sendError(client, 'invalid', 'Ungültige Nachricht.');
    const id = this.playerOf.get(client.sessionId);
    const slot = id ? this.state.slots.get(id) : undefined;
    if (!id || !slot) return this.sendError(client, 'forbidden', 'Du bist in diesem Raum nicht angemeldet.');
    try {
      this.handle(client, id, slot, msg);
    } catch (e) {
      this.sendError(client, 'state', 'Fehler: ' + (e as Error).message);
    }
  }

  private handle(client: Client, id: string, slot: SlotState, msg: ClientMessage): void {
    const lobby = this.state.phase === 'lobby';
    switch (msg.type) {
      case 'lobby:profile':
        if (!lobby) return this.sendError(client, 'started', 'Das Spiel läuft schon.');
        if (msg.name) slot.name = msg.name;
        if (msg.character && msg.character !== slot.character) {
          if ([...this.state.slots.values()].some((s) => s !== slot && s.character === msg.character))
            return this.sendError(client, 'invalid', 'Diese Figur ist schon vergeben.');
          slot.character = msg.character;
        }
        return;
      case 'lobby:ready':
        if (!lobby) return;
        slot.ready = msg.ready;
        return;
      case 'lobby:config':
        if (!lobby) return;
        if (!slot.host) return this.sendError(client, 'forbidden', 'Nur der Host kann das ändern.');
        if (msg.layoutId !== undefined) {
          if (!LAYOUTS.some((l) => l.id === msg.layoutId))
            return this.sendError(client, 'invalid', 'Unbekanntes Brett.');
          this.state.layoutId = msg.layoutId;
          const rec = getLayout(msg.layoutId).recommendedRounds;
          if (msg.rounds === undefined) this.state.rounds = rec;
        }
        if (msg.rounds !== undefined) this.state.rounds = msg.rounds;
        this.updateMetadata();
        return;
      case 'lobby:addBot': {
        if (!lobby) return;
        if (!slot.host) return this.sendError(client, 'forbidden', 'Nur der Host kann Bots hinzufügen.');
        if (this.state.slots.size >= MAX_PLAYERS)
          return this.sendError(client, 'full', 'Alle Plätze sind belegt.');
        const bid = 'b' + ++this.counter;
        const b = new SlotState();
        b.id = bid;
        b.kind = 'bot';
        b.difficulty = msg.difficulty;
        b.name = BOT_NAMES[this.counter % BOT_NAMES.length] as string;
        b.character = this.freeCharacter();
        b.ready = true;
        this.state.slots.set(bid, b);
        this.updateMetadata();
        return;
      }
      case 'lobby:removeBot': {
        if (!lobby) return;
        if (!slot.host) return this.sendError(client, 'forbidden', 'Nur der Host kann Bots entfernen.');
        const t = this.state.slots.get(msg.playerId);
        if (t && t.kind === 'bot') this.state.slots.delete(msg.playerId);
        this.updateMetadata();
        return;
      }
      case 'lobby:start':
        if (!lobby) return;
        if (!slot.host) return this.sendError(client, 'forbidden', 'Nur der Host kann das Spiel starten.');
        return this.startGame(client);
      case 'game:sync':
        return this.core ? this.sendFull(client) : undefined;
      case 'game:action': {
        if (!this.core || this.state.phase !== 'playing')
          return this.sendError(client, 'state', 'Es läuft kein Spiel.');
        const res = this.core.apply(id, msg.action);
        if (!res.ok) return this.sendError(client, 'invalid', res.error ?? 'Aktion nicht erlaubt.');
        this.commit(res);
        this.afterUpdate();
      }
    }
  }

  // ------------------------------------------------------------------ Spielstart und Updates
  private startGame(host: Client): void {
    const slots = [...this.state.slots.values()];
    if (slots.length < MIN_PLAYERS)
      return this.sendError(host, 'invalid', `Mindestens ${MIN_PLAYERS} Spieler nötig (Bots zählen mit).`);
    if (slots.some((s) => s.kind === 'human' && !s.host && !s.ready))
      return this.sendError(host, 'invalid', 'Nicht alle Spieler sind bereit.');
    const players: PlayerSetup[] = slots.map((s) => ({
      id: s.id,
      name: s.name,
      character: s.character as CharacterId,
      kind: s.kind as 'human' | 'bot',
      difficulty: s.difficulty as Difficulty,
    }));
    const config: GameConfig = { layoutId: this.state.layoutId, rounds: this.state.rounds, players };
    const err = validateConfig(config);
    if (err) return this.sendError(host, 'invalid', err);
    this.core = new GameCore(config, randomSeed());
    this.state.phase = 'playing';
    void this.lock();
    this.updateMetadata();
    for (const c of this.clients) {
      const pid = this.playerOf.get(c.sessionId);
      if (pid) this.sendStart(c, pid);
    }
    this.seq++;
    this.broadcast('update', {
      seq: this.seq,
      state: this.core.state,
      events: this.core.initialEvents,
      full: true,
    } satisfies GameUpdateMessage);
    this.afterUpdate();
  }

  private sendStart(client: Client, you: string): void {
    if (!this.core) return;
    const msg: GameStartMessage = {
      layoutId: this.core.config.layoutId,
      rounds: this.core.config.rounds,
      you,
      players: this.core.config.players.map((p) => ({
        id: p.id,
        name: p.name,
        character: p.character,
        kind: (this.core?.state.players[p.id]?.kind ?? p.kind) as 'human' | 'bot',
        difficulty: p.difficulty ?? 'normal',
      })),
    };
    client.send('start', msg);
  }

  private sendFull(client: Client): void {
    if (!this.core) return;
    client.send('update', {
      seq: this.seq,
      state: this.core.state,
      events: [],
      full: true,
    } satisfies GameUpdateMessage);
  }

  private commit(res: ApplyResult): void {
    if (!res.ok || !this.core) return;
    this.seq++;
    this.broadcast('update', {
      seq: this.seq,
      state: this.core.state,
      events: res.events,
      full: false,
    } satisfies GameUpdateMessage);
  }

  private broadcastNotice(text: string): void {
    this.broadcast('notice', { text });
  }

  /** Plant die nächsten automatischen Schritte (Bots, Zeitlimits, Getrennte) */
  private afterUpdate(): void {
    const core = this.core;
    if (!core) return;
    this.timerGen++;
    const gen = this.timerGen;
    const T = PartyRoom.timing;
    const s = core.state;
    if (s.phase === 'ended') {
      this.state.phase = 'ended';
      this.updateMetadata();
      this.clock.setTimeout(() => void this.disconnect(), T.endedLinger);
      return;
    }
    const later = (ms: number, fn: () => void): void => {
      this.clock.setTimeout(() => {
        if (gen !== this.timerGen || !this.core) return;
        fn();
      }, ms);
    };
    const act = (id: string): void => {
      const c = this.core as GameCore;
      const p = c.state.players[id];
      if (!p) return;
      let a = p.kind === 'bot' ? decide(c, id, this.rng) : null;
      if (!a) a = c.fallbackAction(id);
      if (!a) return;
      const res = c.apply(id, a);
      if (res.ok) {
        this.commit(res);
        this.afterUpdate();
      }
    };
    if (s.phase === 'minigame' && s.minigame) {
      const m = s.minigame;
      if (m.stage === 'intro')
        later(T.introTimeout, () => (this.commit((this.core as GameCore).forceReady()), this.afterUpdate()));
      else {
        const g = getMiniGame(m.gameId);
        later(
          g.duration * 1000 + T.playGrace,
          () => (this.commit((this.core as GameCore).forceResults()), this.afterUpdate()),
        );
      }
      // Getrennte Spieler: sofort automatisch bestätigen/ergänzen
      const gone = core.pendingActors().filter((id) => !core.player(id).connected);
      if (gone.length)
        later(
          T.afkTimeout,
          () => (
            this.commit(
              m.stage === 'intro'
                ? (this.core as GameCore).forceReady()
                : (this.core as GameCore).forceResults(),
            ),
            this.afterUpdate()
          ),
        );
      return;
    }
    const actors = core.pendingActors();
    for (const id of actors) {
      const p = core.player(id);
      if (p.kind === 'bot') later(this.rng.range(T.botDelayMin, T.botDelayMax), () => act(id));
      else if (!p.connected) later(T.afkTimeout, () => act(id));
      else later(T.turnTimeout, () => act(id));
    }
  }
}

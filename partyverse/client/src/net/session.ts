import { GameCore } from '@shared/core/core';
import { decide } from '@shared/core/ai';
import type { Action, GameConfig, GameEvent, GameState, PlayerSetup } from '@shared/core/types';
import { Rng, randomSeed } from '@shared/rng';

/** Eine laufende Partie aus Sicht des Clients – lokal (Hot-Seat/Bots) oder online. Die Oberfläche kennt nur diese Schnittstelle. */
export interface GameSession {
  readonly kind: 'local' | 'online';
  readonly players: PlayerSetup[];
  readonly layoutId: string;
  readonly rounds: number;
  /** Spieler dieses Geräts (online genau einer, lokal alle Menschen) */
  readonly localIds: string[];
  /** Spielkern (lokal echt, online ein Spiegel, der immer den letzten Serverstand hält) – nur lesen! */
  readonly core: GameCore;
  readonly state: GameState;
  /** Hört auf Zustandsänderungen. `full` = komplette Neusynchronisierung (keine Animationen nachholen) */
  onUpdate(cb: (events: GameEvent[], full: boolean) => void): () => void;
  /** Fehlermeldungen/Hinweise (z. B. „Spieler hat Verbindung verloren") */
  onMessage(cb: (kind: 'error' | 'notice', text: string) => void): () => void;
  /** Verbindungsstatus (online) */
  onConnection(cb: (state: 'ok' | 'lost' | 'closed') => void): () => void;
  /** Schickt eine Aktion; lokal sofort geprüft (Rückgabe = Fehlertext oder null) */
  act(playerId: string, action: Action): string | null;
  /** Spielstart-Ereignisse (Reihenfolge, 1. Runde) */
  readonly initialEvents: GameEvent[];
  /** Bremse für Bots/Timer (z. B. während Animationen) – der Controller ruft das mit true, solange er animiert */
  setBusy(busy: boolean): void;
  dispose(): void;
}

/** Wartezeit der Bots in ms – wirkt „nachdenklich", aber nie zu lang */
export function botDelay(rng: Rng, phase: string): number {
  return phase === 'decision' ? rng.range(900, 1700) : rng.range(700, 1500);
}

export class LocalSession implements GameSession {
  readonly kind = 'local' as const;
  readonly core: GameCore;
  readonly localIds: string[];
  readonly initialEvents: GameEvent[];
  private updateCbs: Array<(e: GameEvent[], f: boolean) => void> = [];
  private msgCbs: Array<(k: 'error' | 'notice', t: string) => void> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private busy = false;
  private rng = new Rng(randomSeed());
  private disposed = false;

  constructor(
    readonly config: GameConfig,
    seed: number = randomSeed(),
  ) {
    this.core = new GameCore(config, seed);
    this.initialEvents = [...this.core.initialEvents];
    this.localIds = config.players.filter((p) => p.kind === 'human').map((p) => p.id);
  }

  get players(): PlayerSetup[] {
    return this.config.players;
  }
  get layoutId(): string {
    return this.config.layoutId;
  }
  get rounds(): number {
    return this.config.rounds;
  }
  get state(): GameState {
    return this.core.state;
  }

  onUpdate(cb: (e: GameEvent[], f: boolean) => void): () => void {
    this.updateCbs.push(cb);
    return () => (this.updateCbs = this.updateCbs.filter((c) => c !== cb));
  }
  onMessage(cb: (k: 'error' | 'notice', t: string) => void): () => void {
    this.msgCbs.push(cb);
    return () => (this.msgCbs = this.msgCbs.filter((c) => c !== cb));
  }
  onConnection(): () => void {
    return () => undefined;
  }

  act(playerId: string, action: Action): string | null {
    const res = this.core.apply(playerId, action);
    if (!res.ok) {
      const msg = res.error ?? 'Aktion nicht möglich';
      for (const c of this.msgCbs) c('error', msg);
      return msg;
    }
    this.emit(res.events);
    return null;
  }

  private emit(events: GameEvent[]): void {
    for (const c of this.updateCbs) c(events, false);
    this.schedule();
  }

  setBusy(busy: boolean): void {
    this.busy = busy;
    if (!busy) this.schedule();
  }

  /** Plant den nächsten Bot-Zug bzw. beendet Minispiele, die kein Mensch mehr spielen muss */
  schedule(): void {
    if (this.timer || this.disposed || this.busy) return;
    const s = this.core.state;
    if (s.phase === 'ended') return;
    if (s.phase === 'minigame' && s.minigame) {
      const pend = this.core.pendingActors();
      if (pend.length === 0) {
        this.timer = setTimeout(() => {
          this.timer = null;
          const res = s.minigame?.stage === 'intro' ? this.core.forceReady() : this.core.forceResults();
          if (res.ok) this.emit(res.events);
        }, 400);
      }
      return;
    }
    const actors = this.core.pendingActors();
    const bot = actors.find((id) => this.core.player(id).kind === 'bot');
    if (!bot) return;
    this.timer = setTimeout(
      () => {
        this.timer = null;
        if (this.disposed) return;
        if (this.busy) return this.schedule();
        const a = decide(this.core, bot, this.rng) ?? this.core.fallbackAction(bot);
        if (a) this.act(bot, a);
      },
      botDelay(this.rng, s.phase),
    );
  }

  start(): void {
    this.schedule();
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    this.updateCbs = [];
    this.msgCbs = [];
  }
}

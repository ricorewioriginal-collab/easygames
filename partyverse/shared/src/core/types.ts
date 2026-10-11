import type { CharacterId } from '../characters';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type PlayerKind = 'human' | 'bot';

export interface PlayerSetup {
  id: string;
  name: string;
  character: CharacterId;
  kind: PlayerKind;
  /** Nur für Bots */
  difficulty?: Difficulty;
}

export interface GameConfig {
  layoutId: string;
  rounds: number;
  players: PlayerSetup[];
  /** Start-Münzen (Glimmer) */
  startCoins?: number;
}

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const ALTAR_COST = 20;
export const MAX_ITEMS = 3;
export const GATE_TOLL = 3;
export const START_COINS = 10;

export type ItemId =
  | 'zwillingswuerfel'
  | 'praezisionswuerfel'
  | 'schluesselfragment'
  | 'phasenmantel'
  | 'tauschkristall'
  | 'taschenspiegel'
  | 'schutzschild'
  | 'frostuhr';

export type EventId =
  | 'glueck'
  | 'dornen'
  | 'schatz'
  | 'dieb'
  | 'spende'
  | 'umverteilung'
  | 'faltung'
  | 'rueckenwind'
  | 'gegenwind'
  | 'ausgleich'
  | 'portalblitz'
  | 'altarruf';

export interface PlayerState {
  id: string;
  name: string;
  character: CharacterId;
  kind: PlayerKind;
  difficulty: Difficulty;
  /** Feld-ID */
  position: number;
  coins: number;
  shards: number;
  items: ItemId[];
  /** Würfel dieser Runde: 'two' = Zwillingswürfel, 'best' = Präzisionswürfel */
  diceMode: 'one' | 'two' | 'best';
  /** Phasenmantel aktiv (bis Zugende) */
  mantle: boolean;
  /** Schutzschild bereit (wird bei Angriff verbraucht) */
  shield: boolean;
  /** Nächster Wurf halbiert (Frostuhr) */
  frozen: boolean;
  /** Bonus/Malus auf den nächsten Wurf (Rückenwind/Gegenwind) */
  rollBonus: number;
  stats: { minigameWins: number; events: number; coinsEarned: number; steps: number; steals: number };
  connected: boolean;
}

export type Pending =
  | { kind: 'branch'; player: string; options: number[]; remaining: number }
  | {
      kind: 'gate';
      player: string;
      node: number;
      toll: number;
      canPay: boolean;
      hasKey: boolean;
      remaining: number;
    }
  | { kind: 'altar'; player: string; cost: number; remaining: number }
  | { kind: 'shop'; player: string; offers: ItemId[] };

export type MinigameMode = 'ffa' | 'team';

export interface MinigameRun {
  gameId: string;
  seed: number;
  mode: MinigameMode;
  /** Teams (nur bei mode 'team'): Spieler-IDs */
  teams: string[][];
  /** Wer muss noch bestätigen (Anleitung gelesen) bzw. ein Ergebnis abgeben */
  ready: Record<string, boolean>;
  results: Record<string, { score: number; source: 'human' | 'bot' | 'auto' } | null>;
  stage: 'intro' | 'play';
}

export type Phase = 'turn' | 'decision' | 'minigame' | 'ended';

export interface FinaleBonus {
  id: 'minigame' | 'coins' | 'events';
  players: string[];
}

export interface GameState {
  phase: Phase;
  round: number;
  rounds: number;
  /** Faltungsphase der aktuellen Runde */
  foldPhase: number;
  /** Zusätzliche Phasenverschiebung durch das Ereignis „Faltung" */
  foldShift: number;
  /** Spielerreihenfolge (IDs) */
  order: string[];
  /** Index in order des aktiven Spielers */
  turnIndex: number;
  /** Aktiver Spieler (Zug) */
  current: string;
  players: Record<string, PlayerState>;
  /** Chrono-Altar: Feld-ID */
  altar: number;
  pending: Pending | null;
  /** Aktueller Wurf (für Anzeige) */
  lastDice: { player: string; dice: number[]; total: number } | null;
  minigame: MinigameRun | null;
  recentMinigames: string[];
  layoutId: string;
  /** Wurde in diesem Zug schon gewürfelt? */
  rolled: boolean;
  finale: { bonuses: FinaleBonus[]; ranking: string[] } | null;
  /** Fortlaufende Nummer jeder Zustandsänderung (für Synchronisierung) */
  version: number;
}

export type Action =
  | { type: 'useItem'; item: ItemId; target?: string }
  | { type: 'roll' }
  | { type: 'chooseBranch'; node: number }
  | { type: 'gate'; choice: 'pay' | 'key' | 'back' }
  | { type: 'altar'; buy: boolean }
  | { type: 'shopBuy'; index: number }
  | { type: 'shopLeave' }
  | { type: 'minigameReady' }
  | { type: 'minigameSubmit'; log: number[] };

export type GameEvent =
  | { t: 'order'; order: string[]; rolls: Record<string, number> }
  | { t: 'round'; round: number; foldPhase: number }
  | { t: 'turn'; player: string }
  | { t: 'itemUsed'; player: string; item: ItemId; target?: string }
  | { t: 'dice'; player: string; dice: number[]; total: number; bonus: number }
  | { t: 'step'; player: string; from: number; to: number; remaining: number }
  | { t: 'pass'; player: string; other: string; node: number }
  | { t: 'land'; player: string; node: number; kind: string }
  | { t: 'coins'; player: string; delta: number; reason: string }
  | { t: 'shard'; player: string }
  | { t: 'itemGot'; player: string; item: ItemId; from: 'field' | 'shop' | 'event' }
  | { t: 'teleport'; player: string; from: number; to: number; reason: string }
  | { t: 'swap'; a: string; b: string; reason: string }
  | { t: 'steal'; from: string; to: string; amount: number; reason: string }
  | { t: 'blocked'; player: string; reason: string }
  | { t: 'event'; player: string; id: EventId; arg?: string }
  | { t: 'fold'; phase: number; reason: 'round' | 'event' }
  | { t: 'altarMoved'; node: number }
  | { t: 'minigameStart'; gameId: string; mode: MinigameMode; teams: string[][] }
  | { t: 'minigameResult'; player: string; score: number }
  | { t: 'minigameDone'; ranking: string[]; rewards: Record<string, number>; winners: string[] }
  | { t: 'finale'; bonuses: FinaleBonus[]; ranking: string[] }
  | { t: 'turnEnd'; player: string };

export interface ApplyResult {
  ok: boolean;
  error?: string;
  events: GameEvent[];
}

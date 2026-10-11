import { isCharacterId, CharacterId } from '../characters';
import type { Action, Difficulty, GameEvent, GameState } from '../core/types';
import { isItemId } from '../core/items';

/** Name des Colyseus-Raumtyps */
export const ROOM_NAME = 'partyverse';
export const PROTOCOL_VERSION = 1;
export const MAX_NAME = 14;
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Nachrichten Client → Server */
export type ClientMessage =
  | { type: 'lobby:profile'; name?: string; character?: CharacterId }
  | { type: 'lobby:ready'; ready: boolean }
  | { type: 'lobby:config'; layoutId?: string; rounds?: number }
  | { type: 'lobby:addBot'; difficulty: Difficulty }
  | { type: 'lobby:removeBot'; playerId: string }
  | { type: 'lobby:start' }
  | { type: 'game:action'; action: Action }
  | { type: 'game:sync' };

/** Nachrichten Server → Client (außer dem automatisch synchronisierten Lobby-Schema) */
export interface GameUpdateMessage {
  /** Fortlaufende Nummer; Clients ignorieren ältere Updates */
  seq: number;
  state: GameState;
  events: GameEvent[];
  /** true: komplette Neusynchronisierung (Beitritt, Wiederverbindung) */
  full: boolean;
}
export interface ErrorMessage {
  code: 'invalid' | 'forbidden' | 'rate' | 'state' | 'full' | 'started';
  message: string;
}
export interface NoticeMessage {
  text: string;
}
export interface GameStartMessage {
  layoutId: string;
  rounds: number;
  /** Mein Spieler (Spieler-ID im Spielkern) */
  you: string;
  players: Array<{
    id: string;
    name: string;
    character: CharacterId;
    kind: 'human' | 'bot';
    difficulty: Difficulty;
  }>;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Bereinigt einen Anzeigenamen (Steuerzeichen entfernen, kürzen). Gibt '' zurück, wenn nichts übrig bleibt. */
export function cleanName(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>&"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME);
}

/** Prüft und normalisiert eine Client-Nachricht. Gibt null zurück, wenn sie ungültig ist. */
export function parseClientMessage(raw: unknown): ClientMessage | null {
  if (!isObj(raw) || typeof raw.type !== 'string') return null;
  switch (raw.type) {
    case 'lobby:profile': {
      const m: ClientMessage = { type: 'lobby:profile' };
      if (raw.name !== undefined) {
        const n = cleanName(raw.name);
        if (!n) return null;
        m.name = n;
      }
      if (raw.character !== undefined) {
        if (!isCharacterId(raw.character)) return null;
        m.character = raw.character;
      }
      return m;
    }
    case 'lobby:ready':
      return typeof raw.ready === 'boolean' ? { type: 'lobby:ready', ready: raw.ready } : null;
    case 'lobby:config': {
      const m: ClientMessage = { type: 'lobby:config' };
      if (raw.layoutId !== undefined) {
        if (typeof raw.layoutId !== 'string' || !/^[a-z-]+-\d{2}$/.test(raw.layoutId)) return null;
        m.layoutId = raw.layoutId;
      }
      if (raw.rounds !== undefined) {
        if (
          typeof raw.rounds !== 'number' ||
          !Number.isInteger(raw.rounds) ||
          raw.rounds < 1 ||
          raw.rounds > 30
        )
          return null;
        m.rounds = raw.rounds;
      }
      return m;
    }
    case 'lobby:addBot':
      return raw.difficulty === 'easy' || raw.difficulty === 'normal' || raw.difficulty === 'hard'
        ? { type: 'lobby:addBot', difficulty: raw.difficulty }
        : null;
    case 'lobby:removeBot':
      return typeof raw.playerId === 'string' && raw.playerId.length <= 64
        ? { type: 'lobby:removeBot', playerId: raw.playerId }
        : null;
    case 'lobby:start':
      return { type: 'lobby:start' };
    case 'game:sync':
      return { type: 'game:sync' };
    case 'game:action': {
      const a = parseAction(raw.action);
      return a ? { type: 'game:action', action: a } : null;
    }
    default:
      return null;
  }
}

/** Form-Prüfung einer Spielaktion (die inhaltliche Prüfung macht GameCore.validate) */
export function parseAction(raw: unknown): Action | null {
  if (!isObj(raw) || typeof raw.type !== 'string') return null;
  switch (raw.type) {
    case 'roll':
    case 'shopLeave':
    case 'minigameReady':
      return { type: raw.type };
    case 'useItem': {
      if (!isItemId(raw.item)) return null;
      if (raw.target !== undefined && (typeof raw.target !== 'string' || raw.target.length > 64)) return null;
      return {
        type: 'useItem',
        item: raw.item,
        ...(raw.target !== undefined ? { target: raw.target as string } : {}),
      };
    }
    case 'chooseBranch':
      return typeof raw.node === 'number' && Number.isInteger(raw.node) && raw.node >= 0 && raw.node < 1000
        ? { type: 'chooseBranch', node: raw.node }
        : null;
    case 'gate':
      return raw.choice === 'pay' || raw.choice === 'key' || raw.choice === 'back'
        ? { type: 'gate', choice: raw.choice }
        : null;
    case 'altar':
      return typeof raw.buy === 'boolean' ? { type: 'altar', buy: raw.buy } : null;
    case 'shopBuy':
      return typeof raw.index === 'number' && Number.isInteger(raw.index) && raw.index >= 0 && raw.index < 10
        ? { type: 'shopBuy', index: raw.index }
        : null;
    case 'minigameSubmit':
      return Array.isArray(raw.log) &&
        raw.log.length <= 36000 &&
        raw.log.every((n) => typeof n === 'number' && Number.isFinite(n))
        ? { type: 'minigameSubmit', log: raw.log as number[] }
        : null;
    default:
      return null;
  }
}

/** Erzeugt einen Raumcode (4 Zeichen ohne verwechselbare Zeichen) */
export function makeRoomCode(rand: () => number): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return s;
}
export const isRoomCode = (v: unknown): v is string => typeof v === 'string' && /^[A-HJ-NP-Z2-9]{4}$/.test(v);

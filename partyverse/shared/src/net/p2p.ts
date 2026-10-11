import { isCharacterId, type CharacterId } from '../characters';
import type { Action, Difficulty } from '../core/types';
import { cleanName, parseAction, type GameStartMessage, type GameUpdateMessage } from './protocol';

/** Nachrichten für den Online-Modus ohne Server (WebRTC-Datenkanal): Der Gastgeber führt den Spielkern aus, Gäste senden nur Absichten. */
export const P2P_VERSION = 1;

export interface P2PSlot {
  id: string;
  name: string;
  character: CharacterId;
  kind: 'human' | 'bot';
  difficulty: Difficulty;
  ready: boolean;
  connected: boolean;
  host: boolean;
}
export interface P2PLobby {
  phase: 'lobby' | 'playing' | 'ended';
  layoutId: string;
  rounds: number;
  slots: P2PSlot[];
}

/** Gast → Gastgeber */
export type ToHost =
  | { t: 'hello'; v: number; name: string; character: CharacterId }
  | { t: 'profile'; name?: string; character?: CharacterId }
  | { t: 'ready'; ready: boolean }
  | { t: 'act'; action: Action }
  | { t: 'ping'; n: number };

/** Gastgeber → Gast */
export type ToGuest =
  | { t: 'welcome'; you: string }
  | { t: 'lobby'; lobby: P2PLobby }
  | { t: 'start'; msg: GameStartMessage }
  | { t: 'update'; msg: GameUpdateMessage }
  | { t: 'error'; message: string }
  | { t: 'notice'; text: string }
  | { t: 'pong'; n: number }
  | { t: 'kick'; reason: string };

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Prüft eine Nachricht eines Gastes (nicht vertrauenswürdig!) */
export function parseToHost(raw: unknown): ToHost | null {
  if (!isObj(raw) || typeof raw.t !== 'string') return null;
  switch (raw.t) {
    case 'hello': {
      const name = cleanName(raw.name);
      if (!name || !isCharacterId(raw.character) || raw.v !== P2P_VERSION) return null;
      return { t: 'hello', v: P2P_VERSION, name, character: raw.character };
    }
    case 'profile': {
      const m: ToHost = { t: 'profile' };
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
    case 'ready':
      return typeof raw.ready === 'boolean' ? { t: 'ready', ready: raw.ready } : null;
    case 'act': {
      const a = parseAction(raw.action);
      return a ? { t: 'act', action: a } : null;
    }
    case 'ping':
      return typeof raw.n === 'number' && Number.isFinite(raw.n) ? { t: 'ping', n: raw.n } : null;
    default:
      return null;
  }
}

/** Formprüfung einer Nachricht des Gastgebers (grob: der Gastgeber ist Teil der Runde, aber Müll soll nichts zerstören) */
export function parseToGuest(raw: unknown): ToGuest | null {
  if (!isObj(raw) || typeof raw.t !== 'string') return null;
  switch (raw.t) {
    case 'welcome':
      return typeof raw.you === 'string' && raw.you.length < 64 ? { t: 'welcome', you: raw.you } : null;
    case 'lobby': {
      const l = raw.lobby;
      if (
        !isObj(l) ||
        !Array.isArray(l.slots) ||
        l.slots.length > 4 ||
        typeof l.layoutId !== 'string' ||
        typeof l.rounds !== 'number'
      )
        return null;
      const slots: P2PSlot[] = [];
      for (const s of l.slots) {
        if (!isObj(s) || typeof s.id !== 'string' || !isCharacterId(s.character)) return null;
        slots.push({
          id: s.id.slice(0, 32),
          name: cleanName(s.name) || '?',
          character: s.character,
          kind: s.kind === 'bot' ? 'bot' : 'human',
          difficulty: s.difficulty === 'easy' || s.difficulty === 'hard' ? s.difficulty : 'normal',
          ready: s.ready === true,
          connected: s.connected !== false,
          host: s.host === true,
        });
      }
      const phase = l.phase === 'playing' || l.phase === 'ended' ? l.phase : 'lobby';
      return {
        t: 'lobby',
        lobby: {
          phase,
          layoutId: l.layoutId.slice(0, 40),
          rounds: Math.max(1, Math.min(30, Math.round(l.rounds))),
          slots,
        },
      };
    }
    case 'start':
      return isObj(raw.msg) &&
        typeof raw.msg.layoutId === 'string' &&
        Array.isArray(raw.msg.players) &&
        typeof raw.msg.you === 'string'
        ? { t: 'start', msg: raw.msg as unknown as GameStartMessage }
        : null;
    case 'update':
      return isObj(raw.msg) &&
        isObj(raw.msg.state) &&
        Array.isArray(raw.msg.events) &&
        typeof raw.msg.seq === 'number'
        ? { t: 'update', msg: raw.msg as unknown as GameUpdateMessage }
        : null;
    case 'error':
      return typeof raw.message === 'string' ? { t: 'error', message: raw.message.slice(0, 200) } : null;
    case 'notice':
      return typeof raw.text === 'string' ? { t: 'notice', text: raw.text.slice(0, 200) } : null;
    case 'pong':
      return typeof raw.n === 'number' ? { t: 'pong', n: raw.n } : null;
    case 'kick':
      return { t: 'kick', reason: typeof raw.reason === 'string' ? raw.reason.slice(0, 200) : '' };
    default:
      return null;
  }
}

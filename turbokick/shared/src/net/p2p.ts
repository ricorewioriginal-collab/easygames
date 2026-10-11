import { clampInput, type CarInput, type SimEvent, type TeamId } from '../sim/types';

/** Nachrichten für den Online-Modus ohne Server (WebRTC-Datenkanäle). Der Gastgeber führt die Simulation aus, Gäste senden nur Eingaben. */
export const P2P_VERSION = 1;
export const MAX_NAME = 14;
export const MAX_SLOTS = 6;

export interface Look {
  body: string;
  decal: string;
  accent: string;
}
export type Difficulty = 'easy' | 'normal' | 'hard' | 'pro';

export interface P2PSlot {
  id: string;
  name: string;
  team: TeamId;
  kind: 'human' | 'bot';
  difficulty: Difficulty;
  look: Look;
  ready: boolean;
  connected: boolean;
  host: boolean;
}
export interface P2PLobby {
  teamSize: 1 | 2 | 3;
  minutes: number;
  arena: string;
  slots: P2PSlot[];
}

export interface StartPlayer {
  carId: number;
  name: string;
  team: TeamId;
  kind: 'human' | 'bot';
  difficulty: Difficulty;
  look: Look;
}
export interface StartMessage {
  seed: number;
  matchSeconds: number;
  arena: string;
  nitro: boolean;
  /** Fahrzeug dieses Gastes */
  you: number;
  players: StartPlayer[];
}

/** Gast → Gastgeber */
export type ToHost =
  | { t: 'hello'; v: number; name: string; look: Look }
  | { t: 'profile'; name?: string; look?: Look }
  | { t: 'team'; team: TeamId }
  | { t: 'ready'; ready: boolean }
  | { t: 'input'; seq: number; i: CarInput }
  | { t: 'ping'; n: number };

/** Gastgeber → Gast (Zustandsbilder laufen als Binärdaten über den schnellen Kanal) */
export type ToGuest =
  | { t: 'welcome'; you: string }
  | { t: 'lobby'; lobby: P2PLobby }
  | { t: 'start'; msg: StartMessage }
  | { t: 'events'; tick: number; events: SimEvent[] }
  | { t: 'error'; message: string }
  | { t: 'notice'; text: string }
  | { t: 'pong'; n: number }
  | { t: 'kick'; reason: string };

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// eslint-disable-next-line no-control-regex
const CTRL = new RegExp('[\\u0000-\\u001f\\u007f<>&"]', 'g');
export const cleanName = (v: unknown): string =>
  typeof v === 'string' ? v.replace(CTRL, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME) : '';
const token = (v: unknown, d: string): string =>
  typeof v === 'string' && /^[a-z0-9_-]{1,20}$/.test(v) ? v : d;

export function cleanLook(v: unknown): Look {
  const o = isObj(v) ? v : {};
  return {
    body: token(o.body, 'flitzer'),
    decal: token(o.decal, 'keins'),
    accent: typeof o.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.accent) ? o.accent : '',
  };
}

const isTeam = (v: unknown): v is TeamId => v === 0 || v === 1;

/** Prüft eine Nachricht eines Gastes (nicht vertrauenswürdig!) */
export function parseToHost(raw: unknown): ToHost | null {
  if (!isObj(raw) || typeof raw.t !== 'string') return null;
  switch (raw.t) {
    case 'hello': {
      const name = cleanName(raw.name);
      if (!name || raw.v !== P2P_VERSION) return null;
      return { t: 'hello', v: P2P_VERSION, name, look: cleanLook(raw.look) };
    }
    case 'profile': {
      const m: ToHost = { t: 'profile' };
      if (raw.name !== undefined) {
        const n = cleanName(raw.name);
        if (!n) return null;
        m.name = n;
      }
      if (raw.look !== undefined) m.look = cleanLook(raw.look);
      return m;
    }
    case 'team':
      return isTeam(raw.team) ? { t: 'team', team: raw.team } : null;
    case 'ready':
      return typeof raw.ready === 'boolean' ? { t: 'ready', ready: raw.ready } : null;
    case 'input':
      return typeof raw.seq === 'number' && Number.isFinite(raw.seq)
        ? { t: 'input', seq: raw.seq, i: clampInput(raw.i) }
        : null;
    case 'ping':
      return typeof raw.n === 'number' && Number.isFinite(raw.n) ? { t: 'ping', n: raw.n } : null;
    default:
      return null;
  }
}

const EVENT_TYPES = new Set([
  'countdown',
  'kickoff',
  'touch',
  'jump',
  'pad',
  'wall',
  'goal',
  'demo',
  'respawn',
  'overtime',
  'end',
]);

/** Formprüfung einer Nachricht des Gastgebers (Müll soll nichts zerstören) */
export function parseToGuest(raw: unknown): ToGuest | null {
  if (!isObj(raw) || typeof raw.t !== 'string') return null;
  switch (raw.t) {
    case 'welcome':
      return typeof raw.you === 'string' && raw.you.length < 64 ? { t: 'welcome', you: raw.you } : null;
    case 'lobby': {
      const l = raw.lobby;
      if (!isObj(l) || !Array.isArray(l.slots) || l.slots.length > MAX_SLOTS) return null;
      const slots: P2PSlot[] = [];
      for (const s of l.slots) {
        if (!isObj(s) || typeof s.id !== 'string' || !isTeam(s.team)) return null;
        slots.push({
          id: s.id.slice(0, 32),
          name: cleanName(s.name) || '?',
          team: s.team,
          kind: s.kind === 'bot' ? 'bot' : 'human',
          difficulty:
            s.difficulty === 'easy' || s.difficulty === 'hard' || s.difficulty === 'pro'
              ? s.difficulty
              : 'normal',
          look: cleanLook(s.look),
          ready: s.ready === true,
          connected: s.connected !== false,
          host: s.host === true,
        });
      }
      const ts = l.teamSize === 1 || l.teamSize === 3 ? l.teamSize : 2;
      return {
        t: 'lobby',
        lobby: {
          teamSize: ts,
          minutes: typeof l.minutes === 'number' ? Math.max(1, Math.min(10, Math.round(l.minutes))) : 3,
          arena: token(l.arena, 'neon'),
          slots,
        },
      };
    }
    case 'start': {
      const m = raw.msg;
      if (
        !isObj(m) ||
        !Array.isArray(m.players) ||
        m.players.length < 2 ||
        m.players.length > MAX_SLOTS ||
        typeof m.you !== 'number' ||
        typeof m.seed !== 'number'
      )
        return null;
      const players: StartPlayer[] = [];
      for (const p of m.players) {
        if (!isObj(p) || typeof p.carId !== 'number' || !isTeam(p.team)) return null;
        players.push({
          carId: p.carId,
          name: cleanName(p.name) || '?',
          team: p.team,
          kind: p.kind === 'bot' ? 'bot' : 'human',
          difficulty:
            p.difficulty === 'easy' || p.difficulty === 'hard' || p.difficulty === 'pro'
              ? p.difficulty
              : 'normal',
          look: cleanLook(p.look),
        });
      }
      const secs =
        typeof m.matchSeconds === 'number' && Number.isFinite(m.matchSeconds)
          ? Math.max(30, Math.min(900, m.matchSeconds))
          : 180;
      return {
        t: 'start',
        msg: {
          seed: m.seed >>> 0,
          matchSeconds: secs,
          arena: token(m.arena, 'neon'),
          nitro: m.nitro !== false,
          you: m.you,
          players,
        },
      };
    }
    case 'events': {
      if (typeof raw.tick !== 'number' || !Array.isArray(raw.events) || raw.events.length > 64) return null;
      const events = raw.events.filter(
        (e): e is SimEvent => isObj(e) && typeof e.t === 'string' && EVENT_TYPES.has(e.t),
      );
      return { t: 'events', tick: raw.tick, events };
    }
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

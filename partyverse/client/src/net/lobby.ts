import type { CharacterId } from '@shared/characters';

/** Ein Platz in der Lobby */
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
/** Lobby-Zustand, wie ihn die Lobby-Ansicht zeigt */
export interface LobbyView {
  phase: 'lobby' | 'playing' | 'ended';
  /** Raumcode (5 Zeichen), leer für Gäste */
  code: string;
  layoutId: string;
  rounds: number;
  slots: LobbySlot[];
  /** Meine Spieler-ID */
  meId: string;
}

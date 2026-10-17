// Schnittstelle zwischen Oberfläche und App (vermeidet Zirkelimporte).
import type { Game } from '../sim/game';
import type { MenuItem, Target } from '../sim/menu';

export type Mode = 'live' | 'buy' | 'build';

export interface AppApi {
  readonly g: Game;
  readonly mode: Mode;
  /** Mehrspieler: Gast steuert nur die eigene Figur, darf nicht bauen */
  readonly isGuest: boolean;
  readonly isHost: boolean;
  setMode(m: Mode): void;
  select(simId: string): void;
  focusOn(x: number, z: number, snap?: boolean): void;
  setSpeed(i: number): void;
  command(simId: string, tg: Target, it: MenuItem): void;
  cancel(simId: string, uid: number): void;
  openPauseMenu(): void;
  openPhone(app?: string): void;
  openMap(): void;
  openSimInfo(simId: string, tab?: string): void;
  openSettings(): void;
  openHelp(): void;
  openMultiplayer(): void;
  saveNow(manual?: boolean): void;
  toMainMenu(): void;
  /** Kamera: Stockwerk anzeigen (0/1) und Wandmodus */
  setLevel(l: number): void;
  setWallMode(m: 'up' | 'cut' | 'down'): void;
  readonly level: number;
  readonly wallMode: 'up' | 'cut' | 'down';
  sfx(name: string): void;
}

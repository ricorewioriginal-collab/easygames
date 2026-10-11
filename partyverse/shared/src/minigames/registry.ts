import type { MiniGame } from './types';
import { game as g0 } from './games/blitzfunke';
import { game as g1 } from './games/wolkenhuepfer';
import { game as g2 } from './games/kristallsammler';
import { game as g3 } from './games/echomuster';
import { game as g4 } from './games/takttreffer';
import { game as g5 } from './games/ausweichorbit';
import { game as g6 } from './games/balancierbrett';
import { game as g7 } from './games/zielschuss';
import { game as g8 } from './games/hindernisdash';
import { game as g9 } from './games/stapelturm';
import { game as g10 } from './games/farbwechsel';
import { game as g11 } from './games/muenzregen';
import { game as g12 } from './games/seilsprung';
import { game as g13 } from './games/faltlabyrinth';
import { game as g14 } from './games/schleuderflug';
import { game as g15 } from './games/eisrutsche';
import { game as g16 } from './games/pendelpunkt';
import { game as g17 } from './games/tippkraft';
import { game as g18 } from './games/raketenflug';
import { game as g19 } from './games/gravifaenger';
import { game as g20 } from './games/spuernase';
import { game as g21 } from './games/bruecke';

/** Alle Minispiele in fester Reihenfolge */
export const MINIGAMES: readonly MiniGame[] = [g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14, g15, g16, g17, g18, g19, g20, g21];
export const MINIGAME_IDS: readonly string[] = MINIGAMES.map((g) => g.id);
export function getMiniGame(id: string): MiniGame {
  const g = MINIGAMES.find((m) => m.id === id);
  if (!g) throw new Error('Unbekanntes Minispiel: ' + id);
  return g;
}

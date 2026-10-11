import type { ColorMode, Settings } from './save';
import type { TeamId } from '@shared/sim/types';

/** Teamfarben („Funken“ orange, „Frost“ blau). Für Farbsehschwächen kräftigerer Helligkeitsunterschied; zusätzlich tragen die Teams unterschiedliche Symbole. */
const TEAM: Record<ColorMode, [string, string]> = {
  standard: ['#ff7a1a', '#19c8ff'],
  protanopia: ['#ffb000', '#3d8bff'],
  deuteranopia: ['#ffb000', '#3d8bff'],
  tritanopia: ['#ff5a3c', '#00d2b4'],
};
export const TEAM_NAMES = ['Funken', 'Frost'] as const;
export const TEAM_SYMBOL = ['▲', '◆'] as const;
let mode: ColorMode = 'standard';
export const teamColor = (t: TeamId): string => TEAM[mode][t];
export const teamColorHex = (t: TeamId): number => parseInt(teamColor(t).slice(1), 16);

/** Wendet Anzeige-Einstellungen auf die Seite an */
export function applyTheme(s: Settings): void {
  mode = s.colorMode;
  const r = document.documentElement;
  r.classList.toggle('hc', s.highContrast);
  r.classList.toggle('big', s.largeText);
  r.classList.toggle('calm', s.reducedMotion);
  r.style.setProperty('--fire', TEAM[mode][0]);
  r.style.setProperty('--ice', TEAM[mode][1]);
}

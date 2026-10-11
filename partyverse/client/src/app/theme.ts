import type { ColorMode, Settings } from './save';

/** Spielerfarben; für Farbsehschwächen gibt es Paletten mit stärkerem Helligkeits-/Blau-Gelb-Kontrast. Zusätzlich hat jeder Spieler ein eigenes Symbol. */
export const PLAYER_SYMBOLS = ['▲', '●', '■', '◆'] as const;
const PALETTES: Record<ColorMode, [string, string, string, string]> = {
  standard: ['#ff4d6d', '#35d0ff', '#ffd23f', '#6bff8f'],
  protanopia: ['#e69f00', '#56b4e9', '#f0e442', '#ffffff'],
  deuteranopia: ['#e69f00', '#56b4e9', '#f0e442', '#ffffff'],
  tritanopia: ['#ff4d6d', '#2de2c6', '#ffffff', '#ffa94d'],
};
let mode: ColorMode = 'standard';
export const playerColor = (i: number): string => PALETTES[mode][((i % 4) + 4) % 4];
export const playerColorHex = (i: number): number => parseInt(playerColor(i).slice(1), 16);

/** Wendet Anzeige-Einstellungen auf die Seite an (CSS-Klassen/Variablen) */
export function applyTheme(s: Settings): void {
  mode = s.colorMode;
  const r = document.documentElement;
  r.classList.toggle('hc', s.highContrast);
  r.classList.toggle('big', s.largeText);
  r.classList.toggle('calm', s.reducedMotion);
  PALETTES[mode].forEach((c, i) => r.style.setProperty(`--p${i + 1}`, c));
}

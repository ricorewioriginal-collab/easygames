// Jahreszeiten nach Kalender – gemeinsam für Regeln (Saison-Events) und Darstellung.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
export const SEASON_LABEL: Record<Season, string> = { spring: '🌸 Frühling', summer: '☀️ Sommer', autumn: '🍂 Herbst', winter: '❄️ Winter' };

/** Jahreszeit nach Kalendermonat (Nordhalbkugel, meteorologisch). */
export function seasonOf(d: Date): Season {
  const m = d.getMonth();
  return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
}

/** Eindeutige Nummer einer Saison in einem Jahr (Dezember zählt zum Winter des Folgejahres). */
export function seasonKey(d: Date): number {
  const y = d.getFullYear() + (d.getMonth() === 11 ? 1 : 0);
  return y * 4 + SEASONS.indexOf(seasonOf(d));
}

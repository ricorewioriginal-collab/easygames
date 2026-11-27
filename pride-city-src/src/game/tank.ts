/* Tank des eigenen Wagens: leert sich langsam beim Fahren (eine Füllung reicht für mehrere Kilometer). Leer rollt der Wagen
   nur noch im Schritttempo zur Garage Schraubenschlüssel (Volltanken) – oder ein Reservekanister aus dem Späti hilft.
   Geliehene Autos sind immer voll. Spielstand: flags.tank (0–100). */
import type { SaveData } from '../engine/Save';

export const TANK = {
  /** Meter pro Prozent: 100 % reichen für 4 km */
  m: 40,
  /** Kanister aus dem Späti */
  can: 35,
  /** Schritttempo bei leerem Tank (m/s) */
  crawl: 4,
  price: (s: SaveData) => Math.max(5, Math.ceil((100 - tankOf(s)) * .4)),
};
export const tankOf = (s: SaveData) => (typeof s.flags.tank === 'number' ? Math.max(0, Math.round(s.flags.tank)) : 100);
/** Strecke abziehen; liefert true, wenn der Tank dabei unter 15 % oder auf 0 fällt (für den Hinweis) */
export function burn(s: SaveData, meters: number): 'low' | 'empty' | null {
  const before = typeof s.flags.tank === 'number' ? s.flags.tank : 100, after = Math.max(0, before - meters / TANK.m);
  s.flags.tank = after;
  if (before > 0 && after <= 0) return 'empty';
  if (before >= 15 && after < 15) return 'low';
  return null;
}

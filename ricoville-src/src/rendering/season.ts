// Jahreszeit und Wetter – nur Darstellung, beeinflusst keine Spielregeln und nichts im Spielstand.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'clear' | 'rain' | 'snow';

export const SEASON_LABEL: Record<Season, string> = { spring: '🌸 Frühling', summer: '☀️ Sommer', autumn: '🍂 Herbst', winter: '❄️ Winter' };

/** Jahreszeit nach Kalendermonat (Nordhalbkugel, meteorologisch). */
export function seasonOf(d: Date): Season {
  const m = d.getMonth();
  return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
}

/** Länge eines Wetterabschnitts. Alle Geräte sehen zur selben Zeit dasselbe Wetter. */
export const WEATHER_SLOT = 6 * 60 * 1000;
const CHANCE: Record<Season, number> = { spring: 0.3, summer: 0.15, autumn: 0.35, winter: 0.45 };

/** Wetter zum Zeitpunkt (ms). Meist klar; Regen oder im Winter Schnee je nach Jahreszeit. */
export function weatherAt(ms: number, season: Season): Weather {
  let x = Math.floor(ms / WEATHER_SLOT) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x ^= x >>> 16;
  const r = (x >>> 0) / 4294967296;
  if (r >= CHANCE[season]) return 'clear';
  return season === 'winter' ? 'snow' : 'rain';
}

/** Helligkeit im Tagesverlauf (0 Nacht … 1 Tag) für eine Spielzeit in Sekunden; ein Tag dauert `period` Sekunden. */
export function daylight(t: number, period = 480): number {
  const v = 0.5 + 0.9 * Math.sin(((t / period) % 1) * Math.PI * 2);
  return Math.max(0, Math.min(1, v));
}

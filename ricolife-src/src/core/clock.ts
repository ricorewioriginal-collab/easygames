import type { Season } from '../data/types';

export const MIN_PER_DAY = 1440;
export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
export const SEASON_NAMES: Record<Season, string> = { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' };
/** Spielgeschwindigkeiten: Spielminuten je Echtsekunde */
export const SPEEDS = [0, 1, 3, 10];

/** Spielzeit in Minuten seit Spielbeginn (Tag 0 = Montag, Frühling, 0:00). */
export class Clock {
  min = 8 * 60;
  speed = 1; // Index in SPEEDS
  seasonDays = 7;

  get day(): number {
    return Math.floor(this.min / MIN_PER_DAY);
  }
  get minOfDay(): number {
    return this.min - this.day * MIN_PER_DAY;
  }
  get hour(): number {
    return this.minOfDay / 60;
  }
  get weekday(): number {
    return this.day % 7;
  }
  get season(): Season {
    return SEASONS[Math.floor(this.day / this.seasonDays) % 4]!;
  }
  get dayOfSeason(): number {
    return this.day % this.seasonDays;
  }
  get year(): number {
    return Math.floor(this.day / (this.seasonDays * 4)) + 1;
  }
  get paused(): boolean {
    return this.speed === 0;
  }
  timeStr(): string {
    const m = Math.floor(this.minOfDay);
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  dateStr(): string {
    return `${WEEKDAYS[this.weekday]}, ${this.dayOfSeason + 1}. ${SEASON_NAMES[this.season]} · Jahr ${this.year}`;
  }
  /** Minuten bis zur nächsten angegebenen Uhrzeit (Stunde 0..24) */
  until(hour: number): number {
    let d = hour * 60 - this.minOfDay;
    if (d < 0) d += MIN_PER_DAY;
    return d;
  }
}

export const fmtTime = (minOfDay: number): string => {
  const m = ((Math.floor(minOfDay) % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

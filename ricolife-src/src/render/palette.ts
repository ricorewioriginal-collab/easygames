// Farbpaletten für Wände (Wall.a / Wall.b) und Böden (world.floors-Wert).
// Quelle der Wahrheit sind WALL_PAINTS / FLOOR_TYPES aus world/templates; hier kommt nur das Muster für die Darstellung dazu.
import { FLOOR_TYPES, WALL_PAINTS } from '../world/templates';

export interface WallStyle {
  name: string;
  c: string;
}
export const WALL_STYLES: WallStyle[] = WALL_PAINTS.map((p) => ({ name: p.name, c: p.color }));

export type FloorPattern = 'planks' | 'tiles' | 'checker' | 'plain' | 'stone' | 'carpet';
export interface FloorStyle {
  name: string;
  c: string;
  c2?: string;
  pat: FloorPattern;
}
/** Muster je FLOOR_TYPES-Index (0 = kein Belag → schlichter Estrich) */
const PATTERNS: FloorPattern[] = ['plain', 'planks', 'tiles', 'carpet', 'stone', 'planks', 'plain', 'tiles', 'checker', 'plain', 'planks', 'stone', 'checker', 'plain', 'planks'];
const SECOND: Record<number, string> = { 8: '#cfcac0', 12: '#3a3d42' };
export const FLOOR_STYLES: FloorStyle[] = FLOOR_TYPES.map((f, i) => ({
  name: f.name,
  c: i === 0 ? '#b9b4aa' : f.color,
  c2: SECOND[i],
  pat: PATTERNS[i] ?? 'plain',
}));

const safe = (i: number, n: number): number => (Number.isFinite(i) ? ((Math.floor(i) % n) + n) % n : 0);
export const wallStyle = (i: number): WallStyle => WALL_STYLES[safe(i, WALL_STYLES.length)] ?? { name: '?', c: '#eeeeee' };
export const floorStyle = (i: number): FloorStyle => FLOOR_STYLES[safe(i, FLOOR_STYLES.length)] ?? { name: '?', c: '#b9b4aa', pat: 'plain' };

/** Dachfarben je Bezirk */
export const ROOF_COLORS: Record<string, string[]> = {
  sonnenhain: ['#b5523b', '#a8483a', '#c0623f', '#8e4a3c'],
  altstadt: ['#7a4436', '#5d5f66', '#8a4b38', '#6b4a3e'],
  hafen: ['#4f5d6b', '#5b6670', '#3f4a55', '#6b5a50'],
};

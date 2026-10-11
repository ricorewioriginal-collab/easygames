/** Hilfen für Oberflächen */
export const normalizeColor = (v: string): string => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : '');

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
export function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}

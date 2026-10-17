export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const dist = (ax: number, az: number, bx: number, bz: number): number => Math.hypot(ax - bx, az - bz);
export const fmtMoney = (n: number): string => `${Math.round(n).toLocaleString('de-DE')} RT`;
/** Winkel auf -PI..PI normieren */
export const wrapAngle = (a: number): number => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};
let uidN = 0;
export const uid = (p: string): string => `${p}${Date.now().toString(36)}${(uidN++).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
/** Spielertext für die Anzeige entschärfen (wir setzen Texte nur über textContent, das hier ist für Namen/Validierung) */
export const cleanName = (s: string, max = 24): string =>
  s.replace(/[<>"'`\\{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

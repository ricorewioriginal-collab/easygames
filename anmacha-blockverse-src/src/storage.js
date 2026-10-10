// Lokales Speichern (localStorage) – 3 Weltplätze.
export const SLOTS = 3;
const W = i => 'blockverse.world.' + i, M = i => 'blockverse.meta.' + i;

export function readMeta(i) {
  try { const s = localStorage.getItem(M(i)); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
export function readWorld(i) {
  try { const s = localStorage.getItem(W(i)); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
// gibt true bei Erfolg zurück
export function writeWorld(i, save) {
  try {
    localStorage.setItem(W(i), JSON.stringify(save));
    localStorage.setItem(M(i), JSON.stringify({ name: save.name, mode: save.mode, seed: save.seed, savedAt: save.savedAt }));
    return true;
  } catch (e) { return false; }
}
export function deleteWorld(i) {
  try { localStorage.removeItem(W(i)); localStorage.removeItem(M(i)); } catch (e) { /* ignorieren */ }
}

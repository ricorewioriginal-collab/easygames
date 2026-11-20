// Spielstand (localStorage, von cloud/anmacha-cloud.js mit Präfix „concrete-pulse_“ gesichert).
const KEY = 'concrete-pulse_save';
const DEF = { v: 1, skater: 0, board: -1, best: 0, runs: 0, parks: {}, settings: { quality: '', music: 0.55, sfx: 0.8, easy: false, autoPush: false, cam: 'normal', track: -1 } };
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 1) return Object.assign({}, DEF, s, { settings: Object.assign({}, DEF.settings, s.settings) }); } catch (e) {}
  return JSON.parse(JSON.stringify(DEF));
}
export const save = load();
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
// Ein anderer Tab / die Cloud hat den Stand geändert
addEventListener('storage', e => { if (e.key === KEY && e.newValue) try { Object.assign(save, JSON.parse(e.newValue)); } catch (_) {} });

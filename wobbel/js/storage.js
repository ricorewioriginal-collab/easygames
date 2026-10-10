/* Fortschritt & Einstellungen (localStorage, mit Absicherung falls blockiert). */
const KEY = 'wobbelSave1';
const defaults = () => ({ levels: {}, settings: { sound: true, music: true, dpad: null, rotate: 0 } });
let data = defaults();
try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && typeof raw === 'object') { data = Object.assign(defaults(), raw); data.settings = Object.assign(defaults().settings, raw.settings || {}); } } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
export const Save = {
  get settings() { return data.settings; },
  setSetting(k, v) { data.settings[k] = v; persist(); },
  level(i) { return data.levels[i] || null; },
  /** Ergebnis speichern; gibt {newBest, stars} zurück */
  complete(i, moves, pushes, stars) { const old = data.levels[i]; const best = !old || moves < old.moves; data.levels[i] = { moves: best ? moves : old.moves, pushes: best ? pushes : old.pushes, stars: Math.max(stars, old ? old.stars : 0), plays: (old ? old.plays : 0) + 1 }; persist(); return { newBest: best, stars: data.levels[i].stars }; },
  // Freigeschaltet: Level 0 immer, danach jeweils nach Abschluss des vorherigen (oder per ?unlock=1)
  unlockedUpTo(total) { if (/[?&]unlock=1/.test(location.search)) return total - 1; let n = 0; while (n < total - 1 && data.levels[n]) n++; return n; },
  totalStars() { return Object.values(data.levels).reduce((a, l) => a + l.stars, 0); },
  reset() { data = defaults(); persist(); }
};

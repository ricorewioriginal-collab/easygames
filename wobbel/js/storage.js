/* Fortschritt & Einstellungen (localStorage, mit Absicherung falls blockiert). */
const KEY = 'wobbelSave1';
const defaults = () => ({ levels: {}, coins: 0, owned: [], look: { color: '#ff6fb0', hat: '' }, bonus: {}, stats: {}, ach: {}, daily: { last: '', done: '', streak: 0 }, settings: { sound: true, music: true, dpad: null, rotate: 0 } });
let data = defaults();
try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && typeof raw === 'object') { data = Object.assign(defaults(), raw); data.look = Object.assign(defaults().look, raw.look || {}); data.owned = Array.isArray(raw.owned) ? raw.owned : []; data.coins = Math.max(0, +raw.coins || 0); data.bonus = raw.bonus && typeof raw.bonus === 'object' ? raw.bonus : {}; data.stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {}; data.ach = raw.ach && typeof raw.ach === 'object' ? raw.ach : {}; data.daily = Object.assign(defaults().daily, raw.daily || {}); data.settings = Object.assign(defaults().settings, raw.settings || {}); } } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
export const Save = {
  get settings() { return data.settings; },
  setSetting(k, v) { data.settings[k] = v; persist(); },
  level(i) { return data.levels[i] || null; },
  /** Ergebnis speichern; gibt {newBest, stars} zurück */
  complete(i, moves, pushes, stars, time) { const old = data.levels[i]; const best = !old || moves < old.moves; const bt = old && old.time ? Math.min(old.time, time || old.time) : (time || 0); data.levels[i] = { moves: best ? moves : old.moves, pushes: best ? pushes : old.pushes, stars: Math.max(stars, old ? old.stars : 0), plays: (old ? old.plays : 0) + 1, time: bt }; const newTime = !!time && (!old || !old.time || time < old.time); persist(); return { newBest: best, newTime, stars: data.levels[i].stars }; },
  // Freigeschaltet: Level 0 immer, danach jeweils nach Abschluss des vorherigen (oder per ?unlock=1)
  unlockedUpTo(total) { if (/[?&]unlock=1/.test(location.search)) return total - 1; let n = 0; while (n < total - 1 && data.levels[n]) n++; return n; },
  totalStars() { return Object.values(data.levels).reduce((a, l) => a + l.stars, 0); },
  // Muscheln (Währung), gekaufte Dinge, Aussehen, Bonusspiel-Rekorde
  get coins() { return data.coins; },
  addCoins(n) { data.coins = Math.max(0, data.coins + Math.round(n)); persist(); return data.coins; },
  owns(id) { return data.owned.includes(id); },
  own(id) { if (!data.owned.includes(id)) { data.owned.push(id); persist(); } },
  get look() { return data.look; },
  setLook(k, v) { data.look[k] = v; persist(); },
  bonus(id) { return data.bonus[id] || { best: 0, plays: 0 }; },
  bonusPlayed(id, score) { const o = data.bonus[id] || { best: 0, plays: 0 }; data.bonus[id] = { best: Math.max(o.best, score), plays: o.plays + 1 }; persist(); return data.bonus[id]; },
  // Level überspringen (ohne Sterne); zählt als „freigeschaltet"
  skip(i) { if (!data.levels[i]) { data.levels[i] = { moves: 99999, pushes: 0, stars: 0, plays: 0, skipped: true }; persist(); } },
  // Zähler, Erfolge, Tageslevel
  stat(k) { return data.stats[k] || 0; },
  addStat(k, n) { data.stats[k] = (data.stats[k] || 0) + (n == null ? 1 : n); persist(); },
  maxStat(k, v) { if (v > (data.stats[k] || 0)) { data.stats[k] = v; persist(); } },
  achieved(id) { return !!data.ach[id]; },
  unlock(id) { if (!data.ach[id]) { data.ach[id] = Date.now(); persist(); return true; } return false; },
  get daily() { return data.daily; },
  setDaily(o) { Object.assign(data.daily, o); persist(); },
  allLevels() { return data.levels; },
  reset() { data = defaults(); persist(); }
};

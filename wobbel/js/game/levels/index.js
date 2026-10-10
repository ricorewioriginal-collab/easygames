/* Alle Level in Reihenfolge. Nur Level, die der Löser als lösbar bestätigt hat (Eintrag in par.js), kommen ins Spiel.
   Die Welten-Dateien liegen als world1.js … world6.js daneben; par.js erzeugt `npm run par` (tests/build-par.js). */
const mods = await Promise.all([1, 2, 3, 4, 5, 6].map(n => import(`./world${n}.js`).then(m => m.default).catch(() => [])));
const PAR = await import('./par.js').then(m => m.default).catch(() => null);
export const ALL_LEVELS = []; mods.forEach((list, w) => list.forEach((def, i) => ALL_LEVELS.push(Object.assign({}, def, { world: w, key: `${w + 1}-${i + 1}`, indexInWorld: i }))));
const LEVELS = [], cnt = {};
ALL_LEVELS.forEach(def => { if (PAR && !PAR[def.key]) return; const n = cnt[def.world] = (cnt[def.world] || 0) + 1; LEVELS.push(Object.assign({}, def, { index: LEVELS.length, indexInWorld: n - 1, par: PAR ? PAR[def.key] : 0 })); });
export default LEVELS;

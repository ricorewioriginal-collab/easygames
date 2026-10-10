/* Alle Level in Reihenfolge (5 Welten à 11 Level). Die Welten-Dateien liegen als world1.js … world5.js daneben. */
const mods = await Promise.all([1, 2, 3, 4, 5].map(n => import(`./world${n}.js`).then(m => m.default).catch(() => [])));
const LEVELS = []; mods.forEach((list, w) => list.forEach((def, i) => LEVELS.push(Object.assign({}, def, { world: w, indexInWorld: i, index: LEVELS.length }))));
export default LEVELS;
export const WORLD_RANGES = (() => { const r = []; let s = 0; mods.forEach(l => { r.push([s, s + l.length - 1]); s += l.length; }); return r; })();

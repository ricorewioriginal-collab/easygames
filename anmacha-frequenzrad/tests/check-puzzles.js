/* Prüft alle Rätsel: Format, Tafel-Layout, Duplikate, Kategorien (node tests/check-puzzles.js) */
import PUZ from '../puzzles.js';
import { layout } from '../engine.js';
const errs = [], seen = new Set(), cats = {};
PUZ.forEach((p, i) => { const id = `#${i + 1} „${p.t}"`; cats[p.cat] = (cats[p.cat] || 0) + 1;
  if (!/^[A-ZÄÖÜ]+(?:[ -][A-ZÄÖÜ]+)*[!?.]?$/.test(p.t)) errs.push(`${id}: ungültige Zeichen`); if (!layout(p.t)) errs.push(`${id}: passt nicht auf die Tafel`); if (seen.has(p.t)) errs.push(`${id}: doppelt`); seen.add(p.t);
  if (new Set(p.t.replace(/[^A-ZÄÖÜ]/g, '')).size < 6) errs.push(`${id}: zu wenige verschiedene Buchstaben`); });
console.log(`${PUZ.length} Rätsel in ${Object.keys(cats).length} Kategorien:`, Object.entries(cats).map(([k, v]) => `${k} ${v}`).join(', ')); console.log(errs.length ? errs.slice(0, 30).join('\n') + `\n${errs.length} Probleme` : 'Alle Rätsel sind in Ordnung'); process.exit(errs.length ? 1 : 0);

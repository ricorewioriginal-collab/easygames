/* Berechnet Par + Lösung nur für die angegebene Welt (z. B. 6) und ergänzt par.js / solutions.json, ohne alle Level neu zu rechnen.
   node tests/tools/add-par.mjs 6   (bei geänderten Leveln einer Welt: vorhandene Einträge dieser Welt werden ersetzt) */
import fs from 'fs';
import { ALL_LEVELS } from '../../js/game/levels/index.js';
import PAR from '../../js/game/levels/par.js';
import { parseLevel } from '../../js/game/engine.js';
import { solve, replay, pathString } from '../../js/game/solver.js';
const worlds = process.argv.slice(2).map(Number); if (!worlds.length) { console.error('Welt angeben, z. B. 6'); process.exit(1); }
const solFile = new URL('../solutions.json', import.meta.url), sols = JSON.parse(fs.readFileSync(solFile)), par = { ...PAR };
for (const k of Object.keys(par)) if (worlds.includes(+k.split('-')[0])) { delete par[k]; delete sols[k]; }
for (const def of ALL_LEVELS.filter(d => worlds.includes(d.world + 1))) {
  const L = parseLevel(def), r = solve(L, { maxStates: 1500000, maxMs: 60000 });
  if (r.solvable === true && replay(L, r.path)) { par[def.key] = r.moves; sols[def.key] = pathString(r.path); console.log(`${def.key} ${def.name}: OK ${r.moves}`); } else console.log(`${def.key} ${def.name}: NICHT verifiziert`);
}
const ordered = Object.fromEntries(Object.entries(par).sort((a, b) => { const [aw, ai] = a[0].split('-').map(Number), [bw, bi] = b[0].split('-').map(Number); return aw - bw || ai - bi; }));
fs.writeFileSync(new URL('../../js/game/levels/par.js', import.meta.url), `/* Automatisch erzeugt (npm run par / tests/tools/add-par.mjs): kürzeste Lösung in Zügen je verifiziertem Level. Nur diese Level kommen ins Spiel. */\nexport default ${JSON.stringify(ordered)};\n`);
fs.writeFileSync(solFile, JSON.stringify(Object.fromEntries(Object.keys(ordered).map(k => [k, sols[k]]))));

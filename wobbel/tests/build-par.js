/* Berechnet für jedes Level die kürzeste Lösung (Par) und schreibt js/game/levels/par.js + tests/solutions.json */
import { ALL_LEVELS as LEVELS } from '../js/game/levels/index.js';
import { parseLevel } from '../js/game/engine.js';
import { solve, replay, pathString } from '../js/game/solver.js';
import fs from 'fs';
const par = {}, sols = {}, skipped = []; let ok = 0;
LEVELS.forEach(def => {
  const L = parseLevel(def), r = solve(L, { maxStates: +(process.env.MAX_STATES || 1500000), maxMs: +(process.env.MAX_MS || 40000) });
  if (r.solvable === true && replay(L, r.path)) { par[def.key] = r.moves; sols[def.key] = pathString(r.path); ok++; console.log(`Level ${def.key} ${def.name}: OK (${r.moves} Züge)`); }
  else { skipped.push(def.key); console.log(`Level ${def.key} ${def.name}: NICHT verifiziert (${r.solvable === null ? r.reason : 'unlösbar'})`); }
});
fs.writeFileSync(new URL('../js/game/levels/par.js', import.meta.url), `/* Automatisch erzeugt (npm run par): kürzeste Lösung in Zügen je verifiziertem Level. Nur diese Level kommen ins Spiel. */\nexport default ${JSON.stringify(par)};\n`);
fs.writeFileSync(new URL('./solutions.json', import.meta.url), JSON.stringify(sols));
console.log(`\n${ok}/${LEVELS.length} Level verifiziert und freigegeben. Nicht freigegeben: ${skipped.join(', ') || '–'}`);

/* Berechnet für jedes Level die kürzeste Lösung (Par) und schreibt js/game/levels/par.js + tests/solutions.json */
import LEVELS from '../js/game/levels/index.js';
import { parseLevel } from '../js/game/engine.js';
import { solve, replay, pathString } from '../js/game/solver.js';
import fs from 'fs';
const par = [], sols = []; let bad = 0;
LEVELS.forEach((def, i) => { const L = parseLevel(def), r = solve(L, { maxStates: +(process.env.MAX_STATES || 3000000) }); if (r.solvable !== true || !replay(L, r.path)) { console.log(`#${i + 1} ${def.name}: NICHT GELÖST`); bad++; par.push(0); sols.push(''); return; } par.push(r.moves); sols.push(pathString(r.path)); });
fs.writeFileSync(new URL('../js/game/levels/par.js', import.meta.url), `/* Automatisch erzeugt (npm run par): kürzeste Lösung in Zügen je Level. */\nexport default ${JSON.stringify(par)};\n`);
fs.writeFileSync(new URL('./solutions.json', import.meta.url), JSON.stringify(sols));
console.log(`${LEVELS.length - bad}/${LEVELS.length} Level gelöst, Par geschrieben.`); process.exit(bad ? 1 : 0);

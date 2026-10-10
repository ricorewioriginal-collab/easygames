/* Erzeugt community/levels.json aus handgebauten Karten (prüft jede mit dem Löser und kodiert sie als Teilen-Code). node tests/tools/make-community.mjs */
import fs from 'fs';
import { parseLevel } from '../../js/game/engine.js';
import { solve } from '../../js/game/solver.js';
import { validate, encode } from '../../js/editor/codec.js';
const L = [
  { id: 'start-1', name: 'Kleine Runde', author: 'Wobbel-Team', world: 0, map: ['#########', '#   #   #', '# @ $ . #', '#   #   #', '#########'] },
  { id: 'start-2', name: 'Die Brücke', author: 'Wobbel-Team', world: 1, map: ['###########', '#@  $ ~ . #', '#   $     #', '#         #', '###########'] },
  { id: 'start-3', name: 'Rutschpartie', author: 'Wobbel-Team', world: 3, map: ['###########', '#@ $iii . #', '#  ##  ## #', '# $ iii . #', '###########'] },
  { id: 'start-4', name: 'Schlüsselwechsel', author: 'Wobbel-Team', world: 4, map: ['###########', '#@  k#  . #', '#  $ D $  #', '#    # .  #', '###########'] },
  { id: 'start-5', name: 'Tor mit Pfeil', author: 'Wobbel-Team', world: 5, map: ['###########', '#@  #  .  #', '# $ >  $  #', '#   #  .  #', '###########'] }
];
const out = [], report = [];
for (const e of L) { const v = validate(e.map); if (v.errors.length) { report.push(`${e.name}: ${v.errors.join('; ')}`); continue; } const r = solve(parseLevel({ map: e.map }), { maxMs: 20000 }); report.push(`${e.name}: ${r.solvable === true ? 'lösbar in ' + r.moves : 'NICHT lösbar'}`); if (r.solvable === true) out.push({ id: e.id, name: e.name, author: e.author, code: encode({ name: e.name, world: e.world, map: e.map }) }); }
console.log(report.join('\n')); if (process.argv.includes('--write')) { fs.mkdirSync(new URL('../../community/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('../../community/levels.json', import.meta.url), JSON.stringify(out, null, 2) + '\n'); console.log(out.length + ' Level geschrieben'); }

/* Tests für Editor-Kodierung und Prüfung (node tests/editor-tests.js) */
import { validate, encode, decode } from '../js/editor/codec.js';
import { parseLevel } from '../js/game/engine.js';
import { solve } from '../js/game/solver.js';
import LEVELS from '../js/game/levels/index.js';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('✗', m); } else console.log('✓', m); };
const good = ['#####', '#@$.#', '#####'];
ok(validate(good).errors.length === 0, 'gültiges Mini-Level wird akzeptiert');
ok(validate(['#####', '# $.#', '#####']).errors.some(e => /Wobbel fehlt/.test(e)), 'fehlender Wobbel wird gemeldet');
ok(validate(['#####', '#@@.#', '#####']).errors.some(e => /nur einen/.test(e)), 'zwei Wobbel werden gemeldet');
ok(validate(['#####', '#@  #', '#####']).errors.some(e => /Zielfeld/.test(e)), 'fehlendes Ziel wird gemeldet');
ok(validate(['#####', '#@$ #', '#####', '  .  ']).errors.length > 0, 'Ziel außerhalb / ungültig wird gemeldet');
ok(validate(['  @$.', '     ', '     ']).errors.some(e => /außerhalb/.test(e)), 'Wobbel im Meer wird gemeldet');
const code = encode({ name: 'Mein Test', world: 2, map: good }), back = decode(code);
ok(code.startsWith('WOBBEL1-') && back.name === 'Mein Test' && back.world === 2 && back.map.join('/') === good.join('/'), 'Code lässt sich verlustfrei lesen');
ok(decode('https://x.de/wobbel/?code=' + code.slice(8)).map.length === 3, 'Link mit ?code= wird erkannt');
let thrown = false; try { decode('Quatsch!!'); } catch (e) { thrown = true; } ok(thrown, 'Ungültiger Code wirft Fehler');
let allOk = true; for (const l of LEVELS) { const c = decode(encode(l)); if (c.map.join('/') !== l.map.join('/')) allOk = false; if (validate(l.map).errors.length) { allOk = false; console.log('  Fehler in', l.key, validate(l.map).errors); } }
ok(allOk, `alle ${LEVELS.length} Spiel-Level bestehen Kodierung + Prüfung`);
console.log(fails ? `\n${fails} Tests fehlgeschlagen` : '\nAlle Editor-Tests bestanden'); process.exit(fails ? 1 : 0);

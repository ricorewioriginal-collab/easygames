/* Hilfswerkzeug für Welt 5: handgezeichnete Insel-Vorlagen (Wände, Türen, Eis, Wasser, Kleckse) werden zufällig mit
   Wobbel, Kisten, Zielen und Schlüsseln bestückt; der Löser (Breitensuche) bestätigt Lösbarkeit und ermittelt die Züge.
   Behalten wird die Variante, deren Lösung wirklich Türen öffnet und der Ziel-Zugzahl am nächsten kommt.
   Aufruf: node --max-old-space-size=4096 tests/tools/gen-world5.js  >  /tmp/w5.json */
import { parseLevel, createState, step, T } from '../../js/game/engine.js';
import { solve } from '../../js/game/solver.js';
const rnd = n => Math.floor(Math.random() * n);
// Vorlagen: ' ' Boden, '#' Wand, 'D' Tür, '~' Wasser, 'i' Eis, '1' '2' '3' Kleckse. Parameter: crates, doors-Schlüssel automatisch.
const TEMPLATES = [
  { name: 'Torhaus', crates: 2, targets: 2, goal: 22, rows: ['###########', '#     #   #', '#     D   #', '#     #   #', '#     #   #', '###########'] },
  { name: 'Wächterpfad', crates: 2, targets: 2, goal: 30, rows: ['#############', '#   #   #   #', '#   D   D   #', '#   #   #   #', '#############'] },
  { name: 'Burggraben', crates: 3, targets: 2, goal: 38, rows: ['############', '#    #     #', '#    D  ~~ #', '#    #     #', '#    #     #', '#          #', '############'] },
  { name: 'Eisportal', crates: 2, targets: 2, goal: 46, rows: ['#############', '#     #  iii#', '#     D  iii#', '#     #   ii#', '#     #     #', '#############'] },
  { name: 'Farbtor', crates: 3, targets: 2, goal: 54, rows: ['#############', '#  1  #     #', '#     D  2  #', '#  #  #     #', '#  #  #  #  #', '#############'] },
  { name: 'Turmstiege', crates: 3, targets: 2, goal: 62, rows: ['###########', '#   #     #', '#   D     #', '# # #  #  #', '#   #  #  #', '#   D     #', '#   #     #', '###########'] },
  { name: 'Zauberbibliothek', crates: 3, targets: 3, goal: 72, rows: ['#############', '#  #  #  #  #', '#  D  D  D  #', '#  #  #  #  #', '#     ~     #', '#############'] },
  { name: 'Das Zauberschloss', crates: 4, targets: 3, goal: 90, rows: ['##############', '#   #  #     #', '#   D  D  i  #', '#   #  #  ii #', '# 1 #  #  ~  #', '#   D  #     #', '#   #  #     #', '##############'] }
];
const wanted = process.argv[2] ? process.argv.slice(2).map(Number) : TEMPLATES.map((_, i) => i), out = [];
for (const ti of wanted) {
  const tpl = TEMPLATES[ti], grid = tpl.rows.map(r => r.split('')), free = []; grid.forEach((r, y) => r.forEach((c, x) => { if (c === ' ') free.push([x, y]); }));
  const doors = grid.flat().filter(c => c === 'D').length; let best = null, tries = 0; const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    tries++; const g = grid.map(r => r.slice()), used = new Set(), place = ch => { for (let k = 0; k < 40; k++) { const [x, y] = free[rnd(free.length)], id = x + ',' + y; if (!used.has(id)) { used.add(id); g[y][x] = ch; return true; } } return false; };
    let ok = place('@'); for (let k = 0; k < tpl.crates; k++) ok = place('$') && ok; for (let k = 0; k < tpl.targets; k++) ok = place('.') && ok; for (let k = 0; k < doors; k++) ok = place('k') && ok; if (!ok) continue;
    const rows = g.map(r => r.join('')), L = parseLevel({ map: rows }); if (L.crates.length < L.targets.length) continue;
    const r = solve(L, { maxStates: 250000, maxMs: 4000 }); if (r.solvable !== true) continue;
    const s = createState(L); for (const d of r.path) step(L, s, d); const opened = s.open.reduce((a, b) => a + b, 0); if (opened < Math.min(doors, 1)) continue;
    const score = Math.abs(r.moves - tpl.goal) - opened * 2; if (!best || score < best.score) { best = { score, rows, moves: r.moves, pushes: r.pushes, opened, states: r.states }; }
    if (best.score <= 1) break;
  }
  console.error(`Vorlage ${ti} ${tpl.name}: ${tries} Versuche → ${best ? best.moves + ' Züge, ' + best.opened + ' Türen' : 'nichts gefunden'}`);
  if (best) out.push({ name: tpl.name, rows: best.rows, moves: best.moves, pushes: best.pushes, doors: best.opened });
}
console.log(JSON.stringify(out, null, 1));

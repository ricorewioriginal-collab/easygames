/* Prüft Level: Aufbau, Spielbarkeit und – per Breitensuche – Lösbarkeit. Aufruf:
     node --max-old-space-size=4096 tests/check-levels.js            (alle Level)
     node --max-old-space-size=4096 tests/check-levels.js datei.js   (nur Level aus einer Datei, default export = Array)  */
import { parseLevel, createState, isSolved, T } from '../js/game/engine.js';
import { solve, replay, pathString } from '../js/game/solver.js';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const arg = process.argv[2], maxStates = +(process.env.MAX_STATES || 2500000);
let list;
if (arg) list = (await import(pathToFileURL(path.resolve(arg)).href)).default;
else { const { default: all } = await import('../js/game/levels/index.js'); list = all; }
let bad = 0; const t00 = Date.now(); const out = [];
list.forEach((def, idx) => {
  const label = `#${idx + 1} ${def.name || ''}`.padEnd(34), errs = [], rows = def.map;
  if (!Array.isArray(rows) || !rows.length) { console.log(label, 'FEHLER: map fehlt'); bad++; return; }
  const w = rows[0].length; rows.forEach((r, y) => { if (r.length !== w) errs.push(`Zeile ${y + 1} hat Länge ${r.length} statt ${w}`); });
  const L = parseLevel(def), s = createState(L), cr = L.crates.length, tg = L.targets.length, wat = Array.from(L.terrain).filter(t => t === T.WATER).length;
  const players = rows.join('').split('@').length - 1; if (players !== 1) errs.push(`${players} Spieler statt 1`);
  if (!tg) errs.push('kein Zielfeld'); if (cr < tg) errs.push(`weniger Kisten (${cr}) als Ziele (${tg})`);
  if (isSolved(L, s)) errs.push('schon im Startzustand gelöst');
  if (L.terrain[L.start] === T.VOID) errs.push('Spieler außerhalb der Wände');
  // Wände dicht? Spieler darf nicht ins Meer laufen können (Start liegt nicht im Meer) und alle Objekte müssen innen liegen
  for (const [i] of L.crates) if (L.terrain[i] === T.VOID) errs.push('Kiste außerhalb der Wände'); for (const i of L.targets) if (L.terrain[i] === T.VOID) errs.push('Ziel außerhalb');
  let res = null, t0 = Date.now(); if (!errs.length) { res = solve(L, { maxStates }); }
  const ms = Date.now() - t0;
  if (errs.length) { console.log(label, 'FEHLER:', errs.join('; ')); bad++; return; }
  if (res.solvable === true) { const ok = replay(L, res.path); if (!ok) { console.log(label, 'FEHLER: Lösung lässt sich nicht nachspielen'); bad++; return; } console.log(label, `OK  ${String(res.moves).padStart(4)} Züge ${String(res.pushes).padStart(3)} Schübe  ${String(res.states).padStart(8)} Zustände ${String(ms).padStart(6)} ms  ${L.w}x${L.h} Kisten ${cr}/${tg} Wasser ${wat}`); out.push({ name: def.name, moves: res.moves, pushes: res.pushes, states: res.states, path: pathString(res.path) }); }
  else if (res.solvable === null) { console.log(label, `ZU GROSS (>${maxStates} Zustände) – Level vereinfachen`); bad++; }
  else { console.log(label, `UNLÖSBAR (${res.states} Zustände durchsucht)`); bad++; }
});
console.log(`\n${list.length - bad}/${list.length} Level in Ordnung (${((Date.now() - t00) / 1000).toFixed(1)} s)`);
if (process.env.WRITE_PAR) fs.writeFileSync(process.env.WRITE_PAR, JSON.stringify(out));
process.exit(bad ? 1 : 0);

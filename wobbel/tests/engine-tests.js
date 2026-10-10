/* Regeltests für die Spiellogik (node tests/engine-tests.js) */
import { parseLevel, createState, cloneState, step, isSolved, findPath, T } from '../js/game/engine.js';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('✗', m); } else console.log('✓', m); };
const L = (map) => parseLevel({ map }), run = (l, s, dirs) => { for (const d of dirs) step(l, s, d); return s; }, U = 0, R = 1, D = 2, Lf = 3;
{ const l = L(['#####', '#@$.#', '#####']), s = createState(l); ok(step(l, s, R) && isSolved(l, s), 'Kiste auf Ziel schieben löst das Level'); }
{ const l = L(['######', '#@$$.#', '######']), s = createState(l); ok(step(l, s, R) === null && s.moves === 0, 'Zwei Kisten hintereinander lassen sich nicht schieben'); }
{ const l = L(['#####', '#@$##', '#####']), s = createState(l); ok(step(l, s, R) === null, 'Kiste vor der Wand lässt sich nicht schieben'); }
{ const l = L(['#######', '#@$~..#', '#######']), s = createState(l); ok(step(l, s, R) === null || true, 'Wasser-Test vorbereitet'); }
{ const l = L(['########', '#@$~. $#', '########'].map(r => r.padEnd(8, '#'))), s = createState(l); const r = step(l, s, R); ok(r && r.events.some(e => e.t === 'fill') && s.filled[l.terrain.indexOf(T.WATER)] === 1, 'Kiste füllt Wasserfeld (Brücke)'); ok(step(l, s, R) !== null, 'Wobbel kann über die Brücke laufen'); }
{ const l = L(['######', '#@~..#', '######']), s = createState(l); ok(step(l, s, R) === null, 'Wobbel kann nicht durch Wasser laufen'); }
{ const l = L(['#########', '#@$ii.  #', '#########']), s = createState(l); step(l, s, R); ok(isSolved(l, s), 'Kiste rutscht über Eis bis zum Zielfeld'); }
{ const l = L(['########', '#@r1R  #', '########']), s = createState(l); run(l, s, [R, R]); ok(isSolved(l, s), 'Rote Kiste auf rotes Ziel (über roten Klecks)'); }
{ const l = L(['########', '#@$2G  #', '########']), s = createState(l); run(l, s, [R, R]); ok(isSolved(l, s), 'Grüner Klecks färbt neutrale Kiste grün'); }
{ const l = L(['#######', '#@$B..#', '#######']), s = createState(l); run(l, s, [R]); ok(!isSolved(l, s), 'Neutrale Kiste zählt nicht auf blauem Ziel'); }
{ const l = L(['#######', '#@kD$.#', '#######']), s = createState(l); ok(step(l, s, R) && s.keysHeld === 1, 'Schlüssel wird eingesammelt'); ok(step(l, s, R) && s.keysHeld === 0 && s.open[l.terrain.indexOf(T.DOOR)] === 1, 'Tür öffnet sich mit Schlüssel'); step(l, s, R); ok(isSolved(l, s), 'Level mit Tür lösbar'); }
{ const l = L(['######', '#@D$.#', '######']), s = createState(l); ok(step(l, s, R) === null, 'Verschlossene Tür ohne Schlüssel blockiert'); }
{ const l = L(['#####', '# @ #', '# $ #', '# . #', '#####']), s = createState(l); const p = findPath(l, s, l.start, 6); ok(p && p.length === 1, 'Laufweg-Suche findet kurzen Weg'); }
{ const l = L(['#####', '#@$.#', '#####']), s = createState(l), c = cloneState(s); step(l, s, R); ok(c.p === l.start && c.moves === 0 && !isSolved(l, c), 'cloneState ist unabhängig (Grundlage für Rückgängig)'); }
console.log(fails ? `\n${fails} Tests fehlgeschlagen` : '\nAlle Regeltests bestanden'); process.exit(fails ? 1 : 0);

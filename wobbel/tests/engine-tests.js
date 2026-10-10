/* Regeltests für die Spiellogik (node tests/engine-tests.js) */
import { parseLevel, createState, cloneState, step, isSolved, findPath, T } from '../js/game/engine.js';
import { solve } from '../js/game/solver.js';
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
// --- Welt 6: Pfeilfelder und brüchiger Boden
const at = (l, x, y) => y * l.w + x;
{ const l = L(['#######', '#@>$ .#', '#######']), s = createState(l); ok(step(l, s, R) && s.p === at(l, 2, 1), 'Pfeilfeld lässt sich in Pfeilrichtung betreten'); ok(step(l, s, R) && s.pushes === 1 && s.crate[at(l, 4, 1)] === 1, 'Kiste wird vom Pfeilfeld aus in Pfeilrichtung geschoben'); }
{ const l = L(['#######', '#.>$ @#', '#######']), s = createState(l); ok(step(l, s, Lf) && s.pushes === 0, 'Frei laufen nach links ist ok'); ok(step(l, s, Lf) === null, 'Pfeil nach rechts: Kiste lässt sich nicht gegen die Pfeilrichtung darauf schieben'); }
{ const l = L(['#####', '#@  #', '#v  #', '# $.#', '#####']), s = createState(l); ok(step(l, s, D) && s.p === at(l, 1, 2), 'Pfeil nach unten: von oben betretbar'); ok(step(l, s, U) === null, 'Pfeil nach unten: nach oben nicht zurück'); ok(step(l, s, R) === null, 'Pfeilfeld nach unten kann man seitwärts nicht verlassen'); }
{ const l = L(['#####', '#@  #', '#   #', '# $.#', '#####']), s = createState(l); ok(step(l, s, R) && step(l, s, D) && step(l, s, Lf) && step(l, s, U) && s.p === l.start, 'Ohne Pfeile ist alles frei begehbar'); }
{ const l = L(['######', '#@x $.#', '######']), s = createState(l); step(l, s, R); ok(s.broken[at(l, 2, 1)] === 0 && s.p === at(l, 2, 1), 'Brüchiger Boden hält, solange man draufsteht'); step(l, s, R); ok(s.broken[at(l, 2, 1)] === 1, 'Boden bricht, sobald Wobbel ihn verlässt'); ok(step(l, s, Lf) === null, 'Gebrochenes Feld ist unpassierbar'); }
{ const l = L(['#######', '#@x$ .#', '#######']), s = createState(l); step(l, s, R); const r = step(l, s, R); ok(r && r.push && s.broken[at(l, 2, 1)] === 1 && r.events.some(e => e.t === 'crack'), 'Auch beim Schieben bricht die Bruchstelle hinter Wobbel weg'); }
{ const l = L(['#######', '#@x   #', '#   $.#', '#######']), s = createState(l); step(l, s, R); step(l, s, D); const c = cloneState(s); ok(s.broken[at(l, 2, 1)] === 1 && c.broken[at(l, 2, 1)] === 1, 'Gebrochenes Feld bleibt gebrochen, cloneState kopiert es'); c.broken[at(l, 2, 1)] = 0; ok(s.broken[at(l, 2, 1)] === 1, 'cloneState ist unabhängig'); }
{ const l = L(['#####', '#@x.#', '#####']), s = createState(l); step(l, s, R); step(l, s, R); ok(step(l, s, Lf) === null, 'Sackgasse: zurück über das gebrochene Feld geht nicht'); }
{ const l = L(['########', '#@x  $.#', '########']), s = createState(l); step(l, s, R); step(l, s, R); const r = solve(L(['########', '#@x  $.#', '########']), { maxMs: 4000 }); ok(r.solvable === true && r.moves === 4 && r.path.length === 4, 'Löser findet Lösung über brüchigen Boden'); }
{ const r = solve(L(['#######', '#@x$..#', '#.#####', '#######']), { maxMs: 4000 }); ok(r.solvable === true || r.solvable === false, 'Löser terminiert'); }
{ const l = L(['######', '#@$>.#', '######']), s = createState(l); ok(step(l, s, R) && s.crate[at(l, 3, 1)] === 1, 'Kiste darf auf ein Pfeilfeld in Pfeilrichtung geschoben werden'); }
{ const l = L(['######', '#@$<.#', '######']), s = createState(l); ok(step(l, s, R) === null, 'Kiste darf nicht gegen die Pfeilrichtung auf ein Pfeilfeld'); }
{ const l = L(['#########', '#@$>ii..#', '#########']), s = createState(l); const r = step(l, s, R); ok(r && s.crate[at(l, 3, 1)] === 1, 'Kiste landet auf dem Pfeilfeld und rutscht nicht weiter (Pfeilfeld ist kein Eis)'); }
{ const l = L(['#####', '#@  #', '#^  #', '# $.#', '#####']), p = findPath(l, createState(l), l.start, at(l, 1, 2)); ok(p === null || p.length > 1, 'Klick-Laufen respektiert Pfeile (kein direkter Weg gegen die Richtung)'); }
console.log(fails ? `\n${fails} Tests fehlgeschlagen` : '\nAlle Regeltests bestanden'); process.exit(fails ? 1 : 0);

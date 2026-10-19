#!/usr/bin/env node
/* ColorPop Universe – prüft alle 300 Level und 30 Rätsel und schreibt eine maschinenlesbare Auswertung (tools/level-report.json).
 *   node colorpop-universe/tools/validate-levels.js         (Exit-Code 1 bei Fehlern)
 * Je Level: Schema, Generator-Version, deterministisches Brett (zweimal erzeugt = gleich), Startbrett hat Züge, Ziele nicht schon erfüllt,
 * Zertifikat (Lösungsweg) wird mit der echten Engine nachgespielt: jeder Zug legal, Ziel erreicht, 3 Sterne, ohne Booster/Rückgängig.
 * Bretter müssen sich unterscheiden (keine zwei gleichen Startbretter). */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve(__dirname, '..');
const CPU = require(path.join(dir, 'src/core/rng.js'));
['core/board', 'core/rules', 'core/levelgen', 'core/bots', 'core/levels', 'data/worlds', 'data/levels', 'data/puzzles'].forEach(f => require(path.join(dir, 'src', f + '.js')));
const B = CPU.board;

function validate(opts) {
  opts = opts || {};
  const certs = JSON.parse(fs.readFileSync(path.join(dir, 'tools/level-certs.json'), 'utf8'));
  const L = CPU.LEVELS, report = { generated: new Date().toISOString().slice(0, 10), generator: CPU.GEN_VERSION, levels: [], puzzles: [], errors: [] };
  const err = m => report.errors.push(m);
  if (L.length !== 300) err('Anzahl Level ' + L.length + ' statt 300');
  const keys = new Map();
  L.forEach((d, i) => {
    if (d.id !== i + 1) err('Lücke/Reihenfolge bei Index ' + i + ' (id ' + d.id + ')');
    if (d.world !== Math.floor(i / 25) + 1) err('Level ' + d.id + ': falsche Welt ' + d.world);
    CPU.levels.check(d).forEach(err);
    const b1 = CPU.gen.boardFor(d), b2 = CPU.gen.boardFor(d), k = B.key(b1) + (b1.marks ? Array.from(b1.marks).join('') : '');
    const deterministic = k === B.key(b2) + (b2.marks ? Array.from(b2.marks).join('') : '');
    if (!deterministic) err('Level ' + d.id + ': Brett nicht deterministisch');
    if (keys.has(k)) err('Level ' + d.id + ': gleiches Startbrett wie Level ' + keys.get(k)); keys.set(k, d.id);
    const g = CPU.levels.game(d);
    const startMoves = g.legal().length;
    if (!startMoves) err('Level ' + d.id + ': Startbrett ohne Zug');
    if (g.goalsMet()) err('Level ' + d.id + ': Ziel schon zu Beginn erfüllt');
    const c = certs.levels[d.id], entry = { id: d.id, world: d.world, size: g.board.w + 'x' + g.board.h, colors: d.colors, goals: d.goals.map(x => x.t), moves: d.moves || null,
      mechanics: CPU.levels.mechanics(d), method: c && c.method, schema: true, deterministic, solvableWithoutBoosters: false, goalReachable: false, threeStars: false, certMoves: 0, certScore: 0 };
    if (!c) { err('Level ' + d.id + ': kein Zertifikat'); report.levels.push(entry); return; }
    let legal = true;
    for (const idx of c.path) { if (!g.move(idx)) { legal = false; break; } }
    if (!legal) err('Level ' + d.id + ': Zertifikat enthält illegalen Zug (Engine geändert?)');
    const res = g.finish('cert');
    entry.certMoves = c.path.length; entry.certScore = res.score;
    entry.goalReachable = legal && res.won; entry.threeStars = legal && res.stars === 3;
    entry.solvableWithoutBoosters = legal && res.won && res.stats.boosters === 0 && res.stats.undos === 0;
    if (!entry.goalReachable) err('Level ' + d.id + ': Zertifikat erreicht das Ziel nicht');
    if (!entry.threeStars) err('Level ' + d.id + ': Zertifikat erreicht keine 3 Sterne (' + res.score + ' < ' + d.stars[1] + ')');
    if (d.moves && c.path.length > d.moves) err('Level ' + d.id + ': Zertifikat braucht mehr Züge als erlaubt');
    report.levels.push(entry);
  });
  for (let w = 1; w <= 12; w++) { const n = L.filter(l => l.world === w).length; if (n !== 25) err('Welt ' + w + ': ' + n + ' statt 25 Level'); }
  // Rätsel
  (CPU.PUZZLES || []).forEach((p, i) => {
    const c = certs.puzzles[p.id], g = new CPU.Game({ board: B.fromRows(p.grid), colors: p.colors });
    if (p.id !== i + 1) err('Rätsel-Reihenfolge ' + i);
    let ok = !!c;
    if (c) for (const idx of c.path) if (!g.move(idx)) { ok = false; break; }
    const e = { id: p.id, size: p.grid[0].length + 'x' + p.grid.length, min: p.min, method: 'exact', cleared: ok && g.cleared, minMatches: ok && c.path.length === p.min };
    if (!e.cleared) err('Rätsel ' + p.id + ': Zertifikat leert das Brett nicht');
    if (!e.minMatches) err('Rätsel ' + p.id + ': Zuganzahl stimmt nicht');
    report.puzzles.push(e);
  });
  if ((CPU.PUZZLES || []).length !== 30) err('Puzzle-Labor: ' + (CPU.PUZZLES || []).length + ' statt 30 Rätsel');
  report.summary = { levels: report.levels.length, valid: report.levels.filter(l => l.goalReachable && l.threeStars && l.solvableWithoutBoosters && l.deterministic).length, puzzles: report.puzzles.filter(p => p.cleared && p.minMatches).length, errors: report.errors.length };
  if (opts.write !== false) fs.writeFileSync(path.join(dir, 'tools/level-report.json'), JSON.stringify(report, null, 1));
  return report;
}
module.exports = validate;
if (require.main === module) {
  const r = validate();
  r.errors.slice(0, 40).forEach(e => console.error('FEHLER: ' + e));
  console.log(`Level geprüft: ${r.summary.valid}/${r.summary.levels} gültig (Ziel erreichbar, 3 Sterne, ohne Booster, deterministisch) · Rätsel: ${r.summary.puzzles}/30 · Fehler: ${r.summary.errors}`);
  process.exit(r.errors.length ? 1 : 0);
}

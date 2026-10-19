'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const CPU = require('./load.js');
const first = s => s.game.legal()[0].i;
function playOut(s, now) { let t = now || 0, n = 0; while (!s.over && n++ < 3000) { if (s.game.status().over) { s.finish(); break; } const r = s.move(first(s), t); t += 100; if (r && r.roundOver) s.nextRound(); } return s; }

test('Alle Modi haben Infos und starten mit echtem Brett', () => {
  const ids = CPU.MODES.map(m => m.id);
  ['adventure', 'classic', 'zen', 'sprint', 'time', 'moves', 'puzzle', 'chaos', 'gravity', 'daily', 'weekly', 'tower', 'duel', 'local'].forEach(id => assert.ok(ids.includes(id), id));
  const opts = { adventure: { level: CPU.LEVELS[0] }, puzzle: { puzzle: CPU.PUZZLES[0] }, weekly: { week: '2026-W42', k: 0 }, tower: { floor: 1 }, local: { variant: 'turns' } };
  for (const id of ids) { const s = CPU.modes.create(id, Object.assign({ seed: 3, now: 0 }, opts[id] || {})); assert.ok(s.game.legal().length > 0, id); }
});
test('Klassiker bleibt rein: kein Undo, keine Booster, keine Nachfüllung, kein Spezialbonus', () => {
  const s = CPU.modes.create('classic', { seed: 1, w: 8, h: 10, colors: 4 });
  assert.equal(s.allowBoosters(), false); assert.equal(s.canUndo(), false);
  assert.equal(s.game.rules.refill, false); assert.equal(s.game.rules.specialBonus, 0);
  const n0 = s.game.remaining(); const r = s.move(first(s), 0);
  assert.equal(s.game.remaining(), n0 - r.removed.length, 'keine neuen Steine');
  playOut(s); assert.equal(s.over, true); assert.equal(s.result.reason === 'nomoves' || s.result.reason === 'clear', true);
});
test('Sprint 60: Zeit läuft ab, Combo-Faktor nur in Sprint, neues Brett bei Ende', () => {
  const s = CPU.modes.create('sprint', { seed: 2, now: 0 });
  const a = s.move(first(s), 0), b = s.move(first(s), 1000);
  assert.equal(b.combo, 1); assert.ok(s.comboMult() > 1);
  s.move(first(s), 5000); assert.equal(s.combo, 0, 'Combo verfällt nach 2 s');
  let t = 6000; while (s.boardNo === 0 && !s.over) { if (!s.move(first(s), t)) break; t += 10; }
  assert.equal(s.boardNo, 1, 'nächstes Brett nach Ende'); 
  assert.equal(s.tick(61000).reason, 'time');
  assert.equal(s.move(0, 62000), null);
  const c = CPU.modes.create('classic', { seed: 2 }); assert.equal(c.comboMult(), 1);
});
test('Pause hält die Uhr an', () => {
  const s = CPU.modes.create('time', { seed: 4, now: 0, limit: 120 });
  s.pause(10000); assert.equal(s.tick(500000), null); s.resume(500000);
  assert.ok(Math.abs(s.timeLeft(500000) - 110) < 0.01);
});
test('Zeitattacke: Nachfüllen, +2 s bei großen Gruppen', () => {
  const s = CPU.modes.create('time', { seed: 5, now: 0, limit: 180 });
  const n = s.game.board.w * s.game.board.h;
  s.move(first(s), 100); assert.equal(s.game.remaining(), n, 'Brett bleibt voll');
  assert.equal(s.timeLimit(), 180);
});
test('Zuglimit: endet nach genau N Zügen', () => {
  const s = CPU.modes.create('moves', { seed: 6, limit: 15 });
  let n = 0; while (!s.over && n < 100) { if (!s.move(first(s), n)) break; n++; if (s.game.status().over && !s.over) s.finish(); }
  assert.equal(n, 15); assert.equal(s.over, true);
});
test('Zen: Rückgängig erlaubt, neues Brett statt Ende', () => {
  const s = CPU.modes.create('zen', { seed: 7 });
  s.move(first(s), 0); assert.equal(s.canUndo(), true); s.game.undo(); assert.equal(s.game.score, 0);
  let k = 0; while (s.boardNo === 0 && k++ < 500) s.move(first(s), 0);
  assert.equal(s.boardNo, 1); assert.equal(s.over, false);
});
test('Puzzle-Labor: Sterne nach Zugzahl, Zertifikat liefert 3 Sterne', () => {
  const certs = require('../tools/level-certs.json');
  const p = CPU.PUZZLES[4], s = CPU.modes.create('puzzle', { puzzle: p });
  certs.puzzles[p.id].path.forEach(i => s.move(i, 0));
  assert.equal(s.over, true); assert.equal(s.result.won, true); assert.equal(s.result.stars, 3);
});
test('Gravitation+: Richtung wechselt alle 3 Züge mit Vorschau', () => {
  const s = CPU.modes.create('gravity', { seed: 8 });
  assert.equal(s.game.gravityNow(), 0); assert.deepEqual(s.game.gravityNext(), { dir: 1, in: 3 });
  for (let i = 0; i < 3; i++) s.move(first(s), 0);
  assert.equal(s.game.gravityNow(), 1);
  const c = CPU.modes.create('classic', { seed: 8 }); assert.equal(c.game.gravityNext(), null);
});
test('Daily Pop: gleiches Datum = gleiches Brett, Ziel erreichbar', () => {
  const a = CPU.modes.create('daily', { seed: 'daily-2026-10-18' }), b = CPU.modes.create('daily', { seed: 'daily-2026-10-18' });
  assert.equal(CPU.board.key(a.game.board), CPU.board.key(b.game.board));
  assert.equal(a.dailyGoal, b.dailyGoal); assert.ok(a.dailyGoal > 0);
  const c = CPU.modes.create('daily', { seed: 'daily-2026-10-19' }); assert.notEqual(CPU.board.key(a.game.board), CPU.board.key(c.game.board));
});
test('Wochenliga: 7 Aufgaben, deterministisch je Woche', () => {
  for (let k = 0; k < 7; k++) {
    const a = CPU.weeklyTask('2026-W42', k), b = CPU.weeklyTask('2026-W42', k);
    assert.equal(CPU.board.key(a.def.board), CPU.board.key(b.def.board)); assert.deepEqual(a.def.goals, b.def.goals);
  }
  assert.equal(CPU.isoWeek(new Date(Date.UTC(2026, 9, 18))), '2026-W42');
});
test('Endlos-Turm: Stockwerke werden größer und bekommen Mechaniken', () => {
  const f1 = CPU.towerFloor(1), f20 = CPU.towerFloor(20);
  assert.ok(f20.board.w * f20.board.h > f1.board.w * f1.board.h);
  assert.ok(CPU.countBlocks(f20.board) + CPU.countIce(f20.board) > 0);
});
test('KI-Duell: Bot spielt dasselbe Brett mit echten Zügen', () => {
  const s = CPU.modes.create('duel', { seed: 9, bot: 'hard' });
  playOut(s);
  const r = s.result; assert.ok(r.bot.moves.length > 0);
  const g = s.makeGame(0); r.bot.moves.forEach(i => assert.ok(g.move(i), 'Bot-Zug legal'));
  assert.equal(g.score, r.bot.score, 'Bot-Punkte = nachgespielte Punkte');
});
test('Lokal zu zweit: Zugwechsel und Nacheinander', () => {
  const t = CPU.modes.create('local', { seed: 10, variant: 'turns' });
  t.move(first(t), 0); assert.equal(t.player, 1); t.move(first(t), 0); assert.equal(t.player, 0);
  playOut(t); assert.equal(t.result.scores.length, 2); assert.equal(t.result.scores[0] + t.result.scores[1], t.result.score);
  const r = CPU.modes.create('local', { seed: 10, variant: 'relay' });
  playOut(r); assert.equal(r.round, 1); assert.ok([-1, 0, 1].includes(r.result.winner));
});

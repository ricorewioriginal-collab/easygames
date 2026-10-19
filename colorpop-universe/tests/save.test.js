'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const CPU = require('./load.js');
require('../src/data/achievements.js'); require('../src/data/skins.js'); require('../src/storage/save.js');
function mem(quota) {
  const m = new Map();
  return { m, getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => { if (quota && v.length > quota) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } m.set(k, String(v)); }, removeItem: k => m.delete(k) };
}
const winL1 = { mode: 'adventure', level: CPU.LEVELS[0], res: { won: true, stars: 2, score: 1000, stats: { removed: 20, sizes: { 3: 2, 12: 1 }, maxGroup: 12, items: [0, 0, 0, 0], boosters: 0 } } };

test('Neuer Spielstand: sofort spielbar, eigenes Präfix', () => {
  const ls = mem(), s = new CPU.Store(ls);
  assert.equal(s.p.unlocked, 1); assert.equal(s.p.v, 1);
  s.save();
  assert.ok([...ls.m.keys()].every(k => k.startsWith('colorpop-universe-v1')), 'keine fremden Schlüssel');
});
test('Reload: Fortschritt bleibt erhalten, Wiederholen dupliziert keine Belohnung', () => {
  const ls = mem(), s = new CPU.Store(ls);
  s.ensureDay('2026-10-18', '2026-W42');
  const a = s.recordRound(winL1);
  assert.equal(a.newStars, 2); assert.ok(a.funken >= 2);
  const s2 = new CPU.Store(ls);
  assert.equal(s2.p.levels[1].stars, 2); assert.equal(s2.p.unlocked, 2);
  const f = s2.p.funken; s2.ensureDay('2026-10-18', '2026-W42'); const b = s2.recordRound(winL1);
  assert.equal(b.newStars, 0); assert.equal(s2.p.funken, f + b.funken); assert.equal(b.funken - b.ach.length * 2 - b.tasks.reduce((x, t) => x + t.reward, 0), 0, 'keine Sterne-Funken für bekannte Sterne');
  assert.ok(s2.p.ach.first && s2.p.ach.big12 && s2.p.ach.lv1, 'Erfolge freigeschaltet');
});
test('Korrupte Daten werden gesichert, Spiel startet trotzdem', () => {
  const ls = mem(); ls.setItem('colorpop-universe-v1.p1', '{kaputt'); ls.setItem('colorpop-universe-v1.meta', 'null');
  const s = new CPU.Store(ls);
  assert.equal(s.p.unlocked, 1); assert.equal(ls.getItem('colorpop-universe-v1.p1.broken'), '{kaputt');
});
test('Migration: alter Stand ohne Version und mit falschen Typen', () => {
  const p = CPU.migrate({ name: 'Alt', levels: { 1: { stars: 9, best: 100 }, 999: {}, x: 1 }, funken: 'viel', unlocked: 5 });
  assert.equal(p.v, 1); assert.equal(p.levels[1].stars, 3); assert.equal(p.levels[999], undefined); assert.equal(p.funken, 5); assert.equal(p.unlocked, 5);
  assert.ok(p.records.classic && p.boosters.hammer === 2);
});
test('Speicherplatz voll: Fehler gemeldet, kein Absturz', () => {
  const s = new CPU.Store(mem(10));
  assert.equal(s.save(), false); assert.equal(s.lastError, 'quota');
});
test('Ohne localStorage (privater Modus) spielbar', () => {
  const s = new CPU.Store(null); assert.equal(s.p.unlocked, 1); assert.equal(s.save(), true);
});
test('Export/Import mit Prüfschema und Sicherung', () => {
  const ls = mem(), s = new CPU.Store(ls); s.recordRound(winL1);
  const json = s.exportJSON();
  const t = new CPU.Store(mem());
  assert.equal(t.importJSON('nix').ok, false);
  assert.equal(t.importJSON(JSON.stringify({ format: 'anderes-spiel', v: 1, profile: {} })).ok, false);
  assert.equal(t.importJSON(JSON.stringify({ format: 'colorpop-universe-save', v: 1, profile: { levels: { 1: 5 }, stats: {}, records: {} } })).ok, false);
  assert.equal(t.importJSON(json).ok, true); assert.equal(t.p.levels[1].stars, 2);
  assert.equal(t.restoreBackup(), true); assert.equal(t.p.levels[1], undefined, 'Sicherung des vorherigen Stands');
});
test('Profile: getrennte Spielstände', () => {
  const ls = mem(), s = new CPU.Store(ls); s.recordRound(winL1);
  s.switchTo('p2'); assert.equal(s.p.levels[1], undefined); s.rename('Mia');
  s.switchTo('p1'); assert.equal(s.p.levels[1].stars, 2);
  assert.deepEqual(s.profiles().filter(x => x.exists).map(x => x.name), ['Spieler 1', 'Mia']);
});
test('Booster kaufen nur mit Funken', () => {
  const s = new CPU.Store(mem()); s.p.funken = 3;
  assert.equal(s.buyBooster('mini'), false); assert.equal(s.buyBooster('hammer'), true); assert.equal(s.p.funken, 0);
  assert.equal(s.useBooster('hammer'), true); assert.equal(s.p.boosters.hammer, 2);
});
test('Daily-Serie und Tagesaufgaben', () => {
  const s = new CPU.Store(mem());
  ['2026-10-16', '2026-10-17', '2026-10-18'].forEach(d => { s.ensureDay(d, '2026-W42'); s.recordRound({ mode: 'daily', day: d, res: { score: 100, stats: {} } }); });
  assert.equal(s.p.dailyStreak, 3);
  const t = s.tasks(); assert.equal(t.day.length, 3); assert.equal(t.week.length, 3);
  assert.deepEqual(s.tasks().day.map(x => x.id), t.day.map(x => x.id), 'Aufgaben deterministisch');
});
test('Erfolge (40+) und Designs (30+) sind echt definiert', () => {
  assert.ok(CPU.ACHIEVEMENTS.length >= 40); assert.equal(new Set(CPU.ACHIEVEMENTS.map(a => a.id)).size, CPU.ACHIEVEMENTS.length);
  const p = CPU.defProfile(); CPU.ACHIEVEMENTS.forEach(a => assert.equal(a.check(p), false, a.id + ' nicht sofort erfüllt'));
  const n = CPU.SKINS.stone.length + CPU.SKINS.pop.length + CPU.SKINS.bg.length; assert.ok(n >= 30);
  assert.ok(CPU.SKINS.stone.some(x => !CPU.skinUnlocked(x, p)) && CPU.SKINS.stone.some(x => CPU.skinUnlocked(x, p)));
});

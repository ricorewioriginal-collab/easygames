// Spielstand: node --test funkblasen/tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../save.js');

test('G: Speichern, Laden, Reparieren', () => {
  const mem = S.memoryStorage();
  const a = S.create(mem);
  assert.equal(a.data.unlocked, 1); assert.equal(a.hasProgress(), false);
  const w = a.recordWin(1, 900, 3); a.persist();
  assert.equal(w.first, true); assert.equal(w.coins, 20 + 30); assert.equal(a.data.unlocked, 2);
  // Neu laden: gleicher Stand
  const b = S.create(mem); assert.equal(b.data.stars[1], 3); assert.equal(b.data.coins, 50); assert.equal(b.data.best[1], 900);
  // Wiederholen bringt keine Münzen doppelt
  const again = b.recordWin(1, 500, 3); assert.equal(again.coins, 0); assert.equal(b.data.best[1], 900);
  // Erfolge nur einmal
  b.data.stats.pops = 3; const f1 = b.checkAch(), f2 = b.checkAch();
  assert.ok(f1.some(x => x.id === 'dreier')); assert.equal(f2.length, 0);
  assert.ok(S.ACH.length >= 20);
});

test('G2: kaputte und manipulierte Daten', () => {
  const mem = S.memoryStorage(); mem.setItem(S.KEY, '{kaputt');
  const a = S.create(mem); assert.equal(a.broken, true); assert.equal(a.data.unlocked, 1);
  assert.equal(mem.getItem('funkblasen-defekt-sicherung'), '{kaputt', 'Sicherung des alten Standes');
  const v = S.validate({ unlocked: 9999, stars: { 3: 7, 999: 3, x: 2, 10: 2 }, coins: -5, ach: { erfunden: 1, dreier: 5 }, opts: { music: 4, line: 'quer' }, cos: { owned: ['std', 'hack'], cannon: 'hack' } });
  assert.equal(v.unlocked, 150); assert.equal(v.stars[3], 3); assert.equal(v.stars[999], undefined); assert.equal(v.coins, 0);
  assert.equal(v.ach.erfunden, undefined); assert.ok(v.ach.dreier);
  assert.equal(v.opts.music, 1); assert.equal(v.opts.line, 'lang');
  assert.equal(S.validate({ stars: { 20: 1 } }).unlocked, 21, 'Freischaltung aus Sternen repariert');
  assert.deepEqual(S.validate(null), S.defaults());
});

test('G3: Münzen nur für Optik, Kauf und Ausrüsten geprüft', () => {
  const a = S.create(S.memoryStorage());
  assert.equal(a.buy('perle', 120), false, 'zu wenig Münzen');
  a.data.coins = 200; assert.equal(a.buy('perle', 120), true); assert.equal(a.data.coins, 80);
  assert.equal(a.buy('perle', 120), true); assert.equal(a.data.coins, 80, 'kein Doppelkauf');
  assert.equal(a.equip('finish', 'perle'), true); assert.equal(a.equip('finish', 'galaxie'), false);
  assert.equal(a.equip('rakete', 'perle'), false);
  const d = a.recordDaily('2026-10-17', 1000, true), d2 = a.recordDaily('2026-10-17', 1200, true);
  assert.equal(d.coins, 40); assert.equal(d2.coins, 0); assert.equal(a.data.daily['2026-10-17'].best, 1200);
});

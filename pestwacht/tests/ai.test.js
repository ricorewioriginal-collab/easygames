/* Computer-Fraktionen: Wachstum nur mit echten Rohstoffen, Krieg untereinander, Reaktion auf den Spieler, Bündnistreue. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, D = PW.Diplo;

function run(S, sec) { for (let t = 0; t < sec; t += PW.TICK) G.tick(S, PW.TICK); }
const bldSum = f => Object.values(f.bld).reduce((a, b) => a + b, 0);

// Ein gemeinsamer 4-Stunden-Lauf für die Langzeit-Prüfungen
const S = G.newGame({ mode: 'free', seed: 'bots', bots: 8 });
const start = {}, bld0 = {};
S.factions.forEach(f => { start[f.id] = Object.assign({}, f.res); bld0[f.id] = bldSum(f); });
let warsSeen = 0, botWars = new Set();
for (let i = 0; i < 4 * 3600 / PW.TICK; i++) {
  G.tick(S, PW.TICK);
  if (i % 120 === 0) S.factions.forEach(f => D.warsOf(S, f.id).forEach(o => { if (o !== 'P') { botWars.add([f.id, o].sort().join('|')); warsSeen++; } }));
}

test('8 Fraktionen mit eigener Persönlichkeit', () => {
  assert.equal(S.factions.length, 8);
  S.factions.forEach(f => assert.ok(PW.ARCHETYPES[f.arch], f.id + ' hat einen Archetyp'));
});

test('Bots wachsen, aber nie aus dem Nichts (Rohstoffbuch: Bestand ≤ Start + erzeugt − ausgegeben)', () => {
  S.factions.filter(f => f.alive).forEach(f => {
    assert.ok(bldSum(f) > bld0[f.id], f.id + ' hat gebaut');
    PW.RES.forEach(k => {
      const max = (start[f.id][k] || 0) + (f.ledger.made[k] || 0) - (f.ledger.spent[k] || 0);
      assert.ok((f.res[k] || 0) <= max + 1, f.id + ' ' + k + ': ' + Math.round(f.res[k]) + ' > ' + Math.round(max));
    });
  });
});

test('Bots führen Kriege gegeneinander und erobern Gebiet', () => {
  assert.ok(botWars.size >= 1, 'mindestens ein Krieg zwischen Bots');
  const tiles = S.factions.map(f => PW.World.tilesOf(S, f.id).length);
  assert.ok(tiles.some(n => n > 7), 'mindestens eine Fraktion hat sich ausgedehnt: ' + tiles.join(','));
});

test('Diplomatie reagiert auf den Spieler: Geschenk hebt, Angriff senkt die Beziehung', () => {
  const T = G.newGame({ mode: 'free', seed: 'diplo', bots: 3 });
  const f = T.factions[0], r = D.rel(T, 'P', f.id), rel0 = r.rel;
  T.res.coin = 1000; assert.equal(D.gift(T, f.id, 300).ok !== false, true);
  assert.ok(r.rel > rel0, 'Geschenk verbessert die Beziehung');
  const before = r.rel; D.declareWar(T, 'P', f.id, 'Test');
  assert.ok(r.rel < before && r.war, 'Kriegserklärung verschlechtert die Beziehung');
  const ev = D.evaluate(T, 'P', f.id, 'peace');
  assert.ok(Array.isArray(ev.reasons) && ev.reasons.length > 0, 'Antwort ist begründet');
});

test('Bündnistreue: Ein Pakt-Partner mit Vertrauen tritt dem Krieg bei', () => {
  const T = G.newGame({ mode: 'free', seed: 'pakt', bots: 4 });
  const [a, b, c] = T.factions;
  D.sign(T, b.id, c.id, 'ally'); D.rel(T, b.id, c.id).trust = 80;
  D.declareWar(T, a.id, b.id, 'Test');
  assert.ok(D.atWar(T, c.id, a.id), c.id + ' hilft ' + b.id);
});

test('Spielstand der Bots bleibt nach 4 Stunden gültig (keine NaN)', () => {
  S.factions.forEach(f => {
    PW.RES.forEach(k => assert.ok(Number.isFinite(f.res[k] || 0), f.id + ' ' + k));
    Object.keys(f.troops).forEach(k => assert.ok(Number.isFinite(f.troops[k]) && f.troops[k] >= 0, f.id + ' ' + k));
  });
  assert.ok(warsSeen >= 0);
});

// Oma-Rennen – Tests der Strecken und Rennen mit der Kart-Simulation: node --test oma-rennen/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const D = require('../js/data.js'); global.KARTS = D.KARTS;
const Track = require('../../anmacha-kart/track.js'), Sim = require('../../anmacha-kart/sim.js');

test('Daten: 8 Omas mit Werten, 6 Strecken, 3 Cups, Items für alle Simulations-Gegenstände', () => {
  assert.equal(D.OMAS.length, 8); assert.equal(D.KARTS.length, 8);
  for (const o of D.OMAS) for (const k of ['mv', 'ma', 'mt', 'mr', 'md', 'mw']) assert.ok(o[k] > 0.4 && o[k] < 1.6, o.id + ' ' + k);
  assert.equal(D.TRACKS.length, 6); D.CUPS.forEach(c => c.tracks.forEach(t => assert.ok(D.TRACKS[t])));
  for (const it of ['boost', 'banana', 'rock', 'mine', 'rocket', 'shield', 'flash', 'fog']) assert.ok(D.ITEMS[it] && D.ITEMS[it].icon);
});

test('Strecken: keine Überschneidung, genug Abstand, fahrbare Kurven', () => {
  for (const t of D.TRACKS) {
    const tr = Track.build(t), c = Track.check(tr);
    assert.ok(c.minGap >= 55, t.id + ' Abstand ' + c.minGap); assert.ok(c.minRadius >= 12, t.id + ' Radius ' + c.minRadius); assert.ok(c.len > 1500 && c.len < 2600, t.id + ' Länge ' + c.len);
  }
});

test('Rennen mit 8 Computer-Omas auf jeder Strecke: alle kommen ins Ziel, Items fliegen', () => {
  for (const t of D.TRACKS) {
    const tr = Track.build(t), S = Sim.create({ track: tr, laps: 2, racers: D.OMAS.map((o, i) => ({ name: o.name, kart: i, human: false, skill: 1 })), items: true, shuffle: true });
    let used = 0, hits = 0;
    for (let i = 0; i < 60 * 260 && S.karts.some(k => !k.finished); i++) { Sim.step(S, 1 / 60, []); for (const e of S.events) { if (e.t === 'use') used++; if (e.t === 'hit') hits++; } }
    assert.ok(S.karts.every(k => k.finished), t.id + ': alle im Ziel');
    assert.ok(used > 3, t.id + ': Items benutzt (' + used + ')');
    const res = Sim.results(S); assert.equal(res.length, 8);
  }
});

test('Menschliche Oma fährt mit Gas und Lenkung über die Ziellinie', () => {
  const tr = Track.build(D.TRACKS[0]), S = Sim.create({ track: tr, laps: 1, racers: [{ name: 'Du', kart: 0, human: true, assist: .8 }, { name: 'Bot', kart: 1, human: false, skill: 0 }], items: false });
  for (let i = 0; i < 60 * 160 && !S.karts[0].finished; i++) Sim.step(S, 1 / 60, [{ s: 0, g: 1, b: 0, d: false, i: false }]);
  assert.ok(S.karts[0].finished, 'mit Lenkhilfe ins Ziel');
});

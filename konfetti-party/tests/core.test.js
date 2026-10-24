// Konfetti-Party – Tests des Spielkerns: node --test konfetti-party/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const D = require('../js/data.js'), KP = require('../js/core.js');
const empty = (G) => { G.grid.fill(0); for (let r = 0; r < G.H; r++) for (let c = 0; c < G.W; c++) if (r === 0 || c === 0 || r === G.H - 1 || c === G.W - 1) G.grid[r * G.W + c] = 1; };
const run = (G, sec, inp) => { for (let i = 0; i < sec * 60; i++) KP.step(G, 1 / 60, inp || []); };

test('Arenen: gleich breite Zeilen, 4 Startplätze mit freiem Platz daneben', () => {
  for (const A of D.ARENAS) {
    assert.ok(A.map.every(r => r.length === A.map[0].length), A.id);
    for (const s of '1234') { const r = A.map.findIndex(l => l.includes(s)), c = A.map[r].indexOf(s); const fr = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([x, z]) => A.map[r + z][c + x] === ' ').length; assert.ok(fr >= 2, A.id + ' Start ' + s); }
  }
});

test('Knallbonbon: Strahl zerstört Karton, Säule stoppt, Spieler im Strahl ist raus', () => {
  const G = KP.newMatch(0, [{ name: 'a' }, { name: 'b' }], { seed: 1 }); empty(G);
  const a = G.players[0], b = G.players[1]; a.x = 3.5; a.z = 1.5; b.x = 5.5; b.z = 1.5; G.grid[1 * G.W + 1] = 2;
  run(G, .1, [{ act: true }]); assert.equal(G.bombs.length, 1);
  run(G, .6, [{ mx: 0, mz: 0 }]); a.x = 3.5; a.z = 3.5; // weg vom Bonbon (2 Felder nach unten, hinter Säule? nein: freie Arena)
  a.x = 6.5; a.z = 3.5;
  run(G, 2.2, []);
  assert.equal(G.grid[1 * G.W + 1], 0, 'Karton zerstört'); assert.ok(!b.alive, 'Gegner im Strahl raus'); assert.ok(a.alive, 'außerhalb sicher');
  const G2 = KP.newMatch(0, [{ name: 'a' }, { name: 'b' }], { seed: 1 }); const p = G2.players[0], q = G2.players[1]; // Säule bei (2,2) schützt
  p.x = 1.5; p.z = 2.5; q.x = 3.5; q.z = 2.5; G2.grid.fill(0, 0, 0); for (let i = 0; i < G2.grid.length; i++) if (G2.grid[i] === 2) G2.grid[i] = 0;
  run(G2, .1, [{ act: true }]); p.x = 1.5; p.z = 4.5; run(G2, 2.6, []); assert.ok(q.alive, 'Säule hält den Strahl auf');
});

test('Kettenreaktion und Kick', () => {
  const G = KP.newMatch(0, [{ name: 'a' }, { name: 'b' }], { seed: 2 }); empty(G);
  const a = G.players[0], b = G.players[1]; b.x = 13.5; b.z = 11.5; a.x = 3.5; a.z = 3.5;
  run(G, .05, [{ act: true }]); a.x = 5.5; a.z = 3.5; a.cap = 2; run(G, .05, [{ act: false }]); run(G, .05, [{ act: true }]);
  assert.equal(G.bombs.length, 2); a.x = 9.5; a.z = 9.5; G.bombs[1].t = 99;
  run(G, 3.3, []); assert.equal(G.bombs.length, 0, 'zweites Bonbon mitgerissen');
  a.kick = true; a.x = 3.5; a.z = 5.5; run(G, .05, [{ act: true }]); a.x = 2.6; a.z = 5.5; run(G, .05, [{ act: false }]); G.bombs[0].pass.clear(); G.bombs[0].t = 99;
  run(G, .6, [{ mx: 1, mz: 0 }]); assert.ok(G.bombs[0].c > 4, 'gekicktes Bonbon rutscht (Feld ' + G.bombs[0].c + ')');
});

test('Extras: einsammeln erhöht Bonbons und Reichweite', () => {
  const G = KP.newMatch(0, [{ name: 'a' }], { seed: 3 }); empty(G); const a = G.players[0]; a.x = 3.5; a.z = 3.5;
  G.items[3 * G.W + 4] = KP.PKEYS.indexOf('bomb'); G.items[3 * G.W + 5] = KP.PKEYS.indexOf('fire');
  run(G, 1, [{ mx: 1 }]); assert.equal(a.cap, 2); assert.equal(a.range, 3);
});

test('Vier Computer-Gäste spielen jede Arena bis zum Sieger', () => {
  D.ARENAS.forEach((A, ai) => {
    const G = KP.newMatch(ai, [0, 1, 2, 3].map(i => ({ name: 'B' + i, bot: true, skill: 1 })), { seed: 11 + ai, wins: 2 });
    let n = 0, out = 0, place = 0; while (!G.over && n < 60 * 60 * 15) { KP.step(G, 1 / 60, []); n++; for (const e of G.events) { if (e.e === 'out') out++; if (e.e === 'place') place++; } if (G.roundOver && !G.over) KP.newRound(G); }
    assert.ok(G.over, A.id + ' Match beendet'); assert.ok(place > 20 && out > 3, A.id + ' gespielt: ' + place + ' Bonbons, ' + out + ' raus');
  });
});

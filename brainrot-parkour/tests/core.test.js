// Brainrot Parkour – Tests des Spielkerns: node --test brainrot-parkour/tests/core.test.js
const test = require('node:test'), assert = require('node:assert'), C = require('../js/core.js');
const run = (W, P, sec, inp, D) => { for (let i = 0; i < sec * 60; i++) { C.worldStep(W, 1 / 60); C.step(W, P, typeof inp === 'function' ? inp() : inp, 1 / 60, D); } };

test('Physik: Stehen, Sprunghöhe, Doppelsprung nur bei Bambini', () => {
  const W = C._mini('gaps', 'normale', 1), P = C.newPlayer(W); run(W, P, .3, { mx: 0, mz: 0 }); assert.ok(P.ground, 'steht'); let top = 0;
  run(W, P, 1, () => { top = Math.max(top, P.y); return { mx: 0, mz: 0, jump: true }; }); assert.ok(top > 1.8 && top < 2.3, 'Sprunghöhe ' + top);
  const peaks = {}; for (const diff of ['bambini', 'normale']) { const W2 = C._mini('gaps', diff, 1), Q = C.newPlayer(W2), D = C.DIFF[diff]; run(W2, Q, .3, { mx: 0, mz: 0 }, D); let k = 0, peak = 0; run(W2, Q, 1.2, () => { k++; peak = Math.max(peak, Q.y); return { mx: 0, mz: 0, jump: k < 10 || (k > 30 && k < 40) }; }, D); peaks[diff] = peak; }
  assert.ok(peaks.bambini > peaks.normale + .5, 'Doppelsprung nur bei Bambini ' + JSON.stringify(peaks));
});

test('Jede Obby-Strecke ist machbar (Computer-Läufer schafft alle Welten und Stufen)', () => {
  for (const diff of ['bambini', 'normale', 'esperto']) for (let w = 0; w < 3; w++) {
    const W = C.obby(w, diff, { seed: 1 }), D = C.DIFF[diff], P = C.newPlayer(W), r = C.rng(1); let t = 0;
    while (!P.done && t < 400) { C.worldStep(W, 1 / 60); C.step(W, P, C.botInput(W, P, 2, r), 1 / 60, D); t += 1 / 60; }
    assert.ok(P.done, `${diff} Welt ${w}: nicht im Ziel (cp ${P.cp}, Tode ${P.deaths})`);
    assert.ok(W.coins > 0 && W.cps.length >= 5, 'Münzen und Checkpoints');
  }
});

test('Soße tötet, Checkpoint rettet, Sprungpolster schleudert hoch', () => {
  const W = C._mini('lava', 'normale', 2), P = C.newPlayer(W), kill = W.objs.find(o => o.kind === 'kill'); P.x = kill.x; P.z = kill.z; P.y = kill.y + 2; run(W, P, .5, { mx: 0, mz: 0 }); assert.ok(P.deaths === 1, 'Soße = Sturz'); run(W, P, 1.2, { mx: 0, mz: 0 }); assert.ok(Math.abs(P.z - W.cps[0].z) < .5, 'zurück am Checkpoint');
  const W2 = C._mini('bounce', 'normale', 1), Q = C.newPlayer(W2), pad = W2.objs.find(o => o.kind === 'bounce'); Q.x = pad.x; Q.z = pad.z; Q.y = pad.y + 1; let top = 0; run(W2, Q, 1.5, () => { top = Math.max(top, Q.y); return { mx: 0, mz: 0, jump: true }; }); assert.ok(top > 4.5, 'Polster ' + top.toFixed(1));
});

test('Pavimento Lava: drei Etagen, Fliesen bröckeln, Computer überleben eine Weile', () => {
  const W = C.lavaFloor(10, 3); W.tileTime = 1.15; assert.strictEqual(W.objs.filter(o => o.kind === 'tile').length, 300);
  const r = C.rng(4), P = C.newPlayer(W); P.y = .05; let t = 0; while (t < 30 && !P.deaths) { t += 1 / 60; C.worldStep(W, 1 / 60); C.lavaTick(W, 1 / 60, r, .8); C.step(W, P, C.lavaBot(W, P, r), 1 / 60); }
  assert.ok(t >= 20, 'überlebt ' + t.toFixed(1) + ' s'); assert.ok(W.objs.some(o => o.kind === 'tile' && o.state > 0), 'Fliesen bröckeln');
});

test('Torre Infinita baut beim Klettern weiter', () => {
  const W = C.tower(5, 'normale'), n0 = W.objs.length; W.extend(120); assert.ok(W.objs.length > n0 + 20); const P = C.newPlayer(W), r = C.rng(2); run(W, P, 15, () => C.botInput(W, P, 2, r)); assert.ok(P.y > 8, 'klettert ' + P.y.toFixed(1));
});

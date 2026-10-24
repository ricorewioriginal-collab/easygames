// Funk-Billard 3D – Logik-Tests.  node --test funk-billard/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const FB = require('../js/core.js');
const settle = G => { for (let k = 0; k < 6000 && G.phase === 'roll'; k++) FB.step(G, 1 / 60); };
function setup(list, o) { const G = FB.newGame(o); G.balls = [{ n: 0, x: list[0][0], z: list[0][1], vx: 0, vz: 0, in: false }].concat(list.slice(1).map(([x, z, n]) => ({ n, x, z, vx: 0, vz: 0, in: false }))); G.balls.push(...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].filter(n => !G.balls.some(b => b.n === n)).map(n => ({ n, x: 0, z: 0, vx: 0, vz: 0, in: true }))); return G; }

test('Aufbau: 16 Kugeln, keine Überlappung, 8 in der Mitte, hinten eine Volle und eine Halbe', () => {
  for (const seed of [1, 2, 3]) {
    const bs = FB.rack(seed); assert.strictEqual(bs.length, 16); assert.strictEqual(new Set(bs.map(b => b.n)).size, 16);
    for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) assert.ok(Math.hypot(bs[i].x - bs[j].x, bs[i].z - bs[j].z) >= FB.D - 1e-9);
    const rack = bs.slice(1); const eight = bs.find(b => b.n === 8); assert.ok(Math.abs(eight.z) < 1e-6);
    const corners = [rack[10].n, rack[14].n].map(FB.group).sort(); assert.deepStrictEqual(corners, ['solid', 'stripe']);
  }
});

test('Physik: Stoß bewegt, Reibung bremst bis Stillstand, Banden halten Kugeln auf dem Tisch, Impuls bei geradem Stoß übertragen', () => {
  const G = setup([[-.5, 0], [0, 0, 1]], { free: true }); FB.shoot(G, 1, 0, .12, 0); settle(G);
  const c = G.balls[0], b = G.balls[1]; assert.ok(b.x > .1, 'Objektkugel rollt'); assert.ok(c.x < b.x, 'Weiße bleibt dahinter');
  assert.ok(G.balls.every(x => x.in || (Math.abs(x.x) <= FB.HX && Math.abs(x.z) <= FB.HZ)));
  const H = setup([[0, 0]], { free: true }); FB.shoot(H, .3, 1, 1, 0); settle(H); assert.strictEqual(H.phase, 'aim'); assert.ok(!H.balls[0].vx && !H.balls[0].vz);
});

test('Einlochen: gerader Stoß in die Ecktasche, Weiße in der Tasche = Foul mit Ball in der Hand', () => {
  const G = setup([[.6, .25], [.8, .35, 3]]); G.breakShot = false; const pk = FB.POCKETS[5];
  const b = G.balls[1], ux = pk[0] - b.x, uz = pk[1] - b.z, l = Math.hypot(ux, uz), gx = b.x - ux / l * FB.D, gz = b.z - uz / l * FB.D;
  FB.shoot(G, gx - G.balls[0].x, gz - G.balls[0].z, .45, 0); settle(G);
  assert.ok(G.balls[1].in, 'Kugel 3 versenkt'); assert.strictEqual(G.groups[0], 'solid'); assert.strictEqual(G.turn, 0, 'weiter am Zug');
  const H = setup([[FB.HX - .2, FB.HZ - .2], [-.5, 0, 9]]); H.breakShot = false; FB.shoot(H, 1, 1, .5, 0); settle(H);
  assert.ok(H.inHand && H.turn === 1, 'Foul → Gegner mit Ball in der Hand'); assert.ok(!H.balls[0].in, 'Weiße zurückgelegt');
  assert.ok(FB.place(H, 0, 0)); assert.deepStrictEqual([H.balls[0].x, H.balls[0].z], [0, 0]);
});

test('Fouls: nichts getroffen, falsche Gruppe zuerst; die 8 zu früh = verloren, zuletzt = gewonnen', () => {
  let G = setup([[-.6, 0], [.6, .4, 2]]); G.breakShot = false; FB.shoot(G, 0, 1, .2, 0); settle(G);
  assert.ok(G.inHand && G.turn === 1, 'nichts getroffen');
  G = setup([[-.3, 0], [.3, 0, 12], [.5, .3, 2]]); G.breakShot = false; G.groups = ['solid', 'stripe']; FB.shoot(G, 1, 0, .5, 0); settle(G);
  assert.strictEqual(G.turn, 1); assert.ok(/Falsche/.test(G.msg));
  G = setup([[.6, .25], [.8, .35, 8], [-.5, .3, 2]]); G.breakShot = false; G.groups = ['solid', 'stripe'];
  let b = G.balls[1], pk = FB.POCKETS[5], ux = pk[0] - b.x, uz = pk[1] - b.z, l = Math.hypot(ux, uz);
  FB.shoot(G, b.x - ux / l * FB.D - .6, b.z - uz / l * FB.D - .25, .45, 0); settle(G); assert.ok(G.over && G.winner === 1, 'zu früh = verloren');
  G = setup([[.6, .25], [.8, .35, 8]]); G.breakShot = false; G.groups = ['solid', 'stripe'];
  b = G.balls[1]; FB.shoot(G, b.x - ux / l * FB.D - .6, b.z - uz / l * FB.D - .25, .45, 0); settle(G); assert.ok(G.over && G.winner === 0, 'als letzte = gewonnen');
});

test('Vorschau: erster Kontakt und Richtung der Objektkugel', () => {
  const G = setup([[-.5, 0], [0, 0, 5]]); const a = FB.aimInfo(G, 1, 0);
  assert.strictEqual(a.hit.n, 5); assert.ok(Math.abs(a.gx - (-FB.D)) < 1e-6); assert.ok(Math.abs(a.ox - 1) < 1e-6);
});

test('Computer-Gegner: findet Stöße, spielt ganze Partien ohne Fehler zu Ende', () => {
  let rs = 5; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  let wins = [0, 0], shots = 0;
  for (let g = 0; g < 4; g++) {
    const G = FB.newGame({ seed: g + 1 });
    for (let k = 0; k < 300 && !G.over; k++) { const s = FB.ai(G, 2, rnd); assert.ok(FB.shoot(G, s.dx, s.dz, s.power, s.spin)); settle(G); shots++; for (const b of G.balls) assert.ok(Number.isFinite(b.x) && Number.isFinite(b.z)); }
    assert.ok(G.over, 'Partie ' + g + ' beendet'); wins[G.winner]++;
  }
  assert.ok(shots < 4 * 120, 'Profi-KI braucht nicht ewig (' + shots + ' Stöße)');
});

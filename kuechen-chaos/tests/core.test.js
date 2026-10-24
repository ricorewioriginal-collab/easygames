// Küchen-Chaos – Tests des Spielkerns: node --test kuechen-chaos/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const D = require('../js/data.js'), KC = require('../js/core.js');
const run = (li, n, sec, seed) => { const G = KC.newGame(li, Array.from({ length: n }, (_, i) => ({ name: 'B' + i, bot: true })), { seed: seed || 4, time: sec }); while (!G.over) KC.step(G, 1 / 60, []); return G; };

test('Küchen: gleich breite Zeilen, jede Station vom Boden aus erreichbar, Zutaten für jedes Gericht vorhanden', () => {
  for (const L of D.LEVELS) {
    assert.ok(L.map.every(r => r.length === L.map[0].length), L.id);
    const G = KC.newGame(D.LEVELS.indexOf(L), [{ name: 'a' }, { name: 'b' }]);
    G.tiles.forEach(t => { if (t.kind === 'floor' || t.kind === 'counter') return; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([x, z]) => { const q = G.tiles[(t.r + z) * G.W + t.c + x]; return q && t.c + x >= 0 && t.c + x < G.W && q.kind === 'floor'; }); assert.ok(nb, L.id + ' ' + t.ch + '@' + t.c + ',' + t.r); });
    for (const r of L.menu) for (const p of D.RECIPES[r].parts) { const x = p === 'bun' ? 'bun' : p.startsWith('soup:') ? p.slice(5) : p.split(':')[0]; assert.ok(L.map.join('').includes(D.ING[x].crate), L.id + ' braucht Kiste für ' + x); }
  }
});

test('Schneiden, Kochen, Anrichten und Servieren von Hand', () => {
  const G = KC.newGame(1, [{ name: 'a' }]), ch = G.chefs[0], idx = k => G.tiles.findIndex(t => t.ch === k);
  KC.interact(G, ch, idx('M')); assert.equal(ch.held.ing, 'meat');
  const b = idx('X'); KC.interact(G, ch, b); assert.equal(G.tiles[b].it.ing, 'meat');
  G.tiles[b].it.st = 'c'; KC.interact(G, ch, b); const p = idx('P'); KC.interact(G, ch, p); assert.deepEqual(G.tiles[p].it.parts, ['meat']);
  for (let i = 0; i < 60 * 7; i++) KC.step(G, 1 / 60, []); assert.equal(KC.contentKey(G.tiles[p].it), 'meat:k');
  KC.interact(G, ch, idx('Q')); assert.equal(ch.held.t, 'plate'); KC.interact(G, ch, p); assert.deepEqual(ch.held.parts, ['meat:k']);
  ch.held.parts.push('bun'); G.orders = [{ id: 1, r: 'burger', t: 50, max: 80 }]; KC.interact(G, ch, idx('A')); assert.equal(G.served, 1); assert.ok(G.score > 30);
});

test('Angebranntes fängt Feuer, Computer-Köche löschen es', () => {
  const G = KC.newGame(1, [{ name: 'a', bot: true }, { name: 'b', bot: true }], { seed: 3 }), st = G.tiles[G.idx.stove[0]];
  st.it.parts = ['meat']; st.it.cook = 1; st.it.over = .99; let fire = 0;
  for (let i = 0; i < 60 * 40; i++) { KC.step(G, 1 / 60, []); fire += G.events.filter(e => e.e === 'fire').length; }
  assert.ok(fire >= 1, 'Feuer'); assert.equal(G.tiles.filter(t => t.fire > 0).length, 0, 'gelöscht');
});

test('Zwei Computer-Köche schaffen in jeder Küche Bestellungen', () => {
  D.LEVELS.forEach((L, li) => { const G = run(li, 2, 120); assert.ok(G.served >= 3, L.id + ' serviert ' + G.served); });
});

test('Vier Köche und ein Koch allein', () => {
  const G4 = run(3, 4, 100); assert.ok(G4.served >= 3, 'vier: ' + G4.served);
  const G1 = run(0, 1, 100); assert.ok(G1.served >= 3, 'allein: ' + G1.served);
});

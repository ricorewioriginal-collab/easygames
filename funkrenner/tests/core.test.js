/* node funkrenner/tests/core.test.js – Spielkern: Level, Spawner, Bot muss jedes Level schaffen */
const FR = require('../js/core.js'); const assert = require('assert'); let n = 0;
const t = (name, f) => { f(); n++; console.log('ok', name); };
function run(L, opt) { const G = FR.create(Object.assign({ level: L }, opt || {})); for (let i = 0; i < 60 * 600 && !G.over; i++) { FR.bot(G); FR.step(G, 1 / 60); G.ev.length = 0; } return G; }
t('3 Welten mit 5 Leveln', () => { assert.equal(FR.WORLDS.length, 3); FR.WORLDS.forEach(w => assert.equal(w.levels.length, 5)); });
t('Level werden länger und schneller', () => { const a = FR.levelDef('jungle', 0), b = FR.levelDef('jungle', 4); assert(b.len > a.len && b.v0 > a.v0); });
t('deterministisch', () => { const a = run(FR.levelDef('studio', 2)), b = run(FR.levelDef('studio', 2)); assert.equal(Math.floor(a.score), Math.floor(b.score)); assert.equal(a.coins, b.coins); });
FR.WORLDS.forEach(w => [0, 1, 2, 3, 4].forEach(i => t(`Bot schafft ${w.id} Level ${i + 1}`, () => {
  const G = run(FR.levelDef(w.id, i)); const r = FR.result(G);
  assert(G.won, `nicht geschafft: dist ${G.dist | 0}/${G.L.len}, Leben ${G.lives}`); assert(r.stars >= 1); assert(G.coinsSpawned > 20);
})));
t('Endlos läuft lange', () => { const G = FR.create({ level: FR.endlessDef('fantasy', 5) }); for (let i = 0; i < 60 * 120 && !G.over; i++) { FR.bot(G); FR.step(G, 1 / 60); } assert(G.dist > 1200 && !G.won); });
t('Treffer kostet Leben, Schild fängt ab', () => {
  const G = FR.create({ level: FR.levelDef('jungle', 0) }); G.shield = 0; G.obs.push({ id: 99, kind: 'block', lane: 1, x: 0, z: -0.2, hw: .95, hd: .6, y0: 0, y1: 2.6 }); FR.step(G, 1 / 60); assert.equal(G.lives, 2);
  const H = FR.create({ level: FR.levelDef('jungle', 0), hero: { shield: 1 } }); H.obs.push({ id: 99, kind: 'block', lane: 1, x: 0, z: -0.2, hw: .95, hd: .6, y0: 0, y1: 2.6 }); FR.step(H, 1 / 60); assert.equal(H.lives, 3); assert.equal(H.shield, 0);
});
t('Springen über niedrig, Rutschen unter hoch', () => {
  const G = FR.create({ level: FR.levelDef('jungle', 1) }); G.obs.push({ id: 1, kind: 'low', x: 0, z: -3, hw: 1, hd: .5, y0: 0, y1: .95 }); FR.jump(G);
  for (let i = 0; i < 40; i++) FR.step(G, 1 / 60); assert.equal(G.lives, 3);
  const H = FR.create({ level: FR.levelDef('jungle', 1) }); H.obs.push({ id: 1, kind: 'high', x: 0, z: -3, hw: 1, hd: .3, y0: 1.2, y1: 2.6 }); FR.slide(H);
  for (let i = 0; i < 40; i++) FR.step(H, 1 / 60); assert.equal(H.lives, 3);
});
t('Münzen und Magnet', () => { const G = FR.create({ level: FR.levelDef('jungle', 0) }); G.pick.push({ id: 5, type: 'coin', x: 0, y: .9, z: -.3, r: .5 }); FR.step(G, 1 / 60); assert.equal(G.coins, 1); });
console.log(n, 'Tests bestanden');

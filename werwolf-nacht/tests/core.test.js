// Werwolf-Nacht – Kern-Tests: node --test werwolf-nacht/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const WW = require('../js/core.js');
const bots = n => Array.from({ length: n }, (_, i) => ({ name: 'B' + i, bot: true }));
// komplettes Spiel nur mit Computer-Spielern
function play(n, seed) {
  const G = WW.newGame(bots(n), { seed });
  for (let round = 0; round < 30 && !G.over; round++) {
    const r = WW.resolveNight(G); if (r.hunter >= 0) WW.hunterShot(G, r.hunter); if (G.over) break;
    WW.dayTalk(G); const v = WW.resolveVote(G, WW.botVotes(G)); if (v.hunter >= 0) WW.hunterShot(G, v.hunter); if (G.over) break;
    WW.nextNight(G);
  }
  return G;
}

test('Rollen je Spielerzahl', () => {
  for (let n = 5; n <= 12; n++) {
    const r = WW.deal(n); assert.equal(r.length, n);
    assert.equal(r.filter(x => x === 'wolf').length, n <= 6 ? 1 : n <= 9 ? 2 : 3); assert.equal(r.filter(x => x === 'seer').length, 1);
    assert.equal(r.includes('witch'), n >= 6); assert.equal(r.includes('hunter'), n >= 7); assert.equal(r.includes('guard'), n >= 8);
  }
  const G = WW.newGame(bots(8), { seed: 3, force: { 0: 'seer' } }); assert.equal(G.p[0].role, 'seer');
  const H = WW.newGame(bots(8), { seed: 3, force: { 0: 'wolf' } }); assert.equal(H.p[0].role, 'wolf');
});

test('Nacht: Werwolf-Opfer stirbt, Leibwächter und Hexe retten, Gift tötet', () => {
  const G = WW.newGame(bots(8), { seed: 5 }), id = r => G.p.find(p => p.role === r).id;
  const wolves = G.p.filter(p => p.role === 'wolf'), victim = G.p.find(p => p.role === 'villager').id;
  G.p.forEach(p => { p.bot = false; });
  wolves.forEach(w => WW.act(G, 'wolf', w.id, victim));
  WW.act(G, 'guard', id('guard'), id('seer')); WW.act(G, 'seer', id('seer'), wolves[0].id);
  assert.equal(G.seen[id('seer')][wolves[0].id], true, 'Seherin erkennt den Werwolf');
  WW.act(G, 'witch', id('witch'), -1, {});
  let r = WW.resolveNight(G); assert.deepEqual(r.died, [victim]); assert.equal(G.p[victim].alive, false);
  WW.nextNight(G); const v2 = G.p.find(p => p.role === 'villager' && p.alive).id;
  wolves.forEach(w => WW.act(G, 'wolf', w.id, v2)); WW.act(G, 'guard', id('guard'), v2); WW.act(G, 'witch', id('witch'), -1, {});
  r = WW.resolveNight(G); assert.equal(r.saved, 'guard'); assert.ok(G.p[v2].alive);
  assert.equal(WW.act(G, 'guard', id('guard'), v2), false, 'nicht zweimal hintereinander');
  WW.nextNight(G); assert.equal(WW.targets(G, 'guard', id('guard')).includes(v2), false);
  wolves.forEach(w => WW.act(G, 'wolf', w.id, v2)); WW.act(G, 'guard', id('guard'), id('witch'));
  WW.act(G, 'witch', id('witch'), -1, { heal: true, kill: wolves[0].id });
  r = WW.resolveNight(G); assert.equal(r.saved, 'witch'); assert.deepEqual(r.died, [wolves[0].id]); assert.equal(G.potions.heal + G.potions.kill, 0);
});

test('Abstimmung: Mehrheit stirbt, Gleichstand rettet, Jäger schießt, Sieg erkannt', () => {
  const G = WW.newGame(bots(7), { seed: 9 }); G.phase = 'vote';
  const a = G.p[0].id, b = G.p[1].id;
  let r = WW.resolveVote(G, { 0: b, 1: a, 2: a, 3: b }); assert.equal(r.out, -1, 'Gleichstand');
  r = WW.resolveVote(G, { 0: b, 1: a, 2: b, 3: b }); assert.equal(r.out, b); assert.equal(G.p[b].alive, false);
  const h = G.p.find(p => p.role === 'hunter' && p.alive); const t = WW.hunterShot(G, h.id, G.p.find(p => p.alive && p.id !== h.id).id); assert.ok(t >= 0);
  const W = WW.newGame(bots(5), { seed: 2 }); W.p.filter(p => p.role !== 'wolf').slice(0, 3).forEach(p => { p.alive = false; }); assert.equal(WW.winner(W), 'wolf');
  const V = WW.newGame(bots(5), { seed: 2 }); V.p.filter(p => p.role === 'wolf').forEach(p => { p.alive = false; }); assert.equal(WW.winner(V), 'village');
});

test('Seherin packt aus und das Dorf glaubt ihr', () => {
  const G = WW.newGame(bots(8), { seed: 11 }), seer = G.p.find(p => p.role === 'seer'), wolf = G.p.find(p => p.role === 'wolf');
  WW.act(G, 'seer', seer.id, wolf.id); G.night.done['seer' + seer.id] = true;
  G.p.forEach(p => { if (p.role === 'wolf') G.night.wolfVotes[p.id] = G.p.find(q => q.role === 'villager').id; });
  WW.resolveNight(G); let talk = []; for (let k = 0; k < 6 && !talk.some(t => t.kind === 'claim' && t.pid === seer.id); k++) talk = WW.dayTalk(G);
  assert.ok(talk.some(t => t.kind === 'claim' && t.pid === seer.id && t.target === wolf.id), 'Seherin klagt den Werwolf an');
  const v = WW.botVotes(G); const forWolf = Object.values(v).filter(t => t === wolf.id).length;
  assert.ok(forWolf >= 3, 'Mehrheit stimmt gegen den Werwolf (' + forWolf + ')');
});

test('Hunderte Bot-Spiele enden; beide Seiten gewinnen manchmal', () => {
  const wins = { village: 0, wolf: 0 }; let rounds = 0;
  for (let s = 1; s <= 600; s++) { const G = play(5 + s % 8, s * 31); assert.ok(G.over, 'Spiel ' + s + ' endet'); wins[G.over]++; rounds += G.day; }
  const share = wins.village / 600; console.log('Dorf-Siege', Math.round(share * 100) + ' %', 'Ø Nächte', (rounds / 600).toFixed(1));
  assert.ok(share > .3 && share < .8, 'ausgewogen: ' + share);
});

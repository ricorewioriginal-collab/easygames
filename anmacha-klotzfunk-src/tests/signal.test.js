// Etappe 4: Funknetz (Schalter, Leitung, Sender, Relais, Empfänger, Maschinen) und die Story „Das große Rauschen“.
import test from 'node:test';
import assert from 'node:assert/strict';
import { solve, sigKey, RADIO_RANGE, MAX_NODES, ON_ID } from '../src/signal.js';
import { B } from '../src/blocks.js';
import { I, known } from '../src/items.js';
import { World } from '../src/world.js';
import { RAUSCHEN, QUESTS, CHAPTERS, campaignOf } from '../src/quests.js';
import { RECIPES } from '../src/crafting.js';
import { T_DROHNE, T_HOEHLE } from '../src/mobs.js';

const net = list => new Map(list.map(([x, y, z, t]) => [sigKey(x, y, z), [x, y, z, t]]));

test('Schalter, Sender, Relais, Empfänger: Kette und Reichweite', () => {
  const nodes = net([[0, 10, 0, B.SWITCH_ON], [1, 10, 0, B.SENDER], [21, 10, 0, B.RELAY], [41, 10, 0, B.RECEIVER], [42, 10, 0, B.SIGLAMP], [1, 11, 0, B.RECEIVER]]);
  const r = solve(nodes);
  assert.ok(r.on.has(sigKey(41, 10, 0)), 'Empfänger über das Relais erreicht');
  assert.ok(r.on.has(sigKey(42, 10, 0)), 'Lampe neben dem Empfänger an');
  assert.equal(r.receivers, 2); assert.equal(r.machines, 1); assert.equal(r.senders, 1);
  assert.equal(r.reach, 40, 'Entfernung zum Sender');
  // ausgeschaltet: nichts an
  nodes.set(sigKey(0, 10, 0), [0, 10, 0, B.SWITCH]);
  assert.equal(solve(nodes).on.size, 0);
  // ohne Relais zu weit
  const far = solve(net([[0, 10, 0, B.SWITCH_ON], [1, 10, 0, B.SENDER], [1 + RADIO_RANGE + 1, 10, 0, B.RECEIVER]]));
  assert.equal(far.receivers, 0);
});

test('Leitungen tragen das Signal, Empfänger speisen weiter', () => {
  const list = [[0, 5, 0, B.SWITCH_ON]];
  for (let x = 1; x <= 10; x++) list.push([x, 5, 0, B.WIRE]);
  list.push([11, 5, 0, B.GATE], [10, 6, 0, B.SENDER], [30, 6, 0, B.RECEIVER], [30, 5, 0, B.WIRE], [30, 4, 0, B.SIGLAMP_ON], [5, 7, 0, B.SIGLAMP]);
  const r = solve(net(list));
  assert.ok(r.on.has(sigKey(11, 5, 0)), 'Tor am Ende der Leitung');
  assert.ok(r.on.has(sigKey(30, 6, 0)) && r.on.has(sigKey(30, 4, 0)), 'Empfänger → Leitung → Lampe');
  assert.ok(!r.on.has(sigKey(5, 7, 0)), 'Lampe ohne Berührung bleibt aus');
  assert.equal(ON_ID[B.GATE], B.GATE_OPEN);
});

test('Rechenlimit: riesige Netze brechen ab, statt zu hängen', () => {
  const list = [[0, 1, 0, B.SWITCH_ON]];
  for (let i = 1; i < MAX_NODES + 50; i++) list.push([i, 1, 0, B.WIRE]);
  const t0 = Date.now(), r = solve(net(list));
  assert.ok(r.capped); assert.ok(Date.now() - t0 < 500);
});

test('Welt merkt sich Signalblöcke, auch nach Entladen', () => {
  const w = new World(12345, null, 3);
  w.ensure(0, 0);
  const y = 60;
  w.setBlock(2, y, 2, B.SWITCH_ON); w.setBlock(3, y, 2, B.SENDER);
  assert.equal(w.sig.size, 2); assert.ok(w.sigDirty);
  w.setBlock(3, y, 2, B.AIR);
  assert.equal(w.sig.size, 1);
  const w2 = new World(12345, w.edits, 3);
  w2.ensure(0, 0);
  assert.deepEqual([...w2.sig.values()], [[2, y, 2, B.SWITCH_ON]]);
});

test('Story „Das große Rauschen“: 6 Kapitel, lösbare Aufträge', () => {
  assert.equal(RAUSCHEN.length, 25);
  assert.deepEqual([...new Set(RAUSCHEN.map(q => q.c))], [1, 2, 3, 4, 5, 6]);
  for (let c = 1; c <= 6; c++) assert.ok(CHAPTERS[c].t && CHAPTERS[c].d);
  const craftable = new Set(RECIPES.map(r => r.give[0]));
  for (const q of RAUSCHEN) {
    assert.ok(q.t && q.d && q.n > 0, q.t);
    for (const id of Object.keys(q.r)) assert.ok(known(Number(id)), q.t + ': Belohnung');
    if (q.k === 'craft' || (q.k === 'place' && q.a.length === 1)) for (const id of q.a) assert.ok(craftable.has(id) || id === B.RAINBOW || id === B.LAMP, q.t + ': herstellbar ' + id);
    if (q.k === 'kill') for (const t of q.a) assert.ok([T_DROHNE, T_HOEHLE].includes(t));
  }
  assert.equal(campaignOf({ i: 0 }), QUESTS, 'alte Story-Spielstände behalten ihre Aufträge');
  assert.equal(campaignOf({ c: 'rauschen' }), RAUSCHEN);
  assert.ok(craftable.has(I.COPPER_HELMET) && craftable.has(B.SENDER) && craftable.has(B.RECEIVER));
});

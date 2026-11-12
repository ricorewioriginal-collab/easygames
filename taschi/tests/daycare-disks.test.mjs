// Pension & Zucht, Attacken-Disks
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp } from '../src/logic/monster.js';
import { SPECIES } from '../src/data/species.js';
import { MOVES } from '../src/data/moves.js';
import { ITEMS, DISKS, shopStock, sellPrice } from '../src/data/items.js';
import { baseForm } from '../src/data/trainers.js';
import * as D from '../src/logic/daycare.js';
import * as Items from '../src/logic/items.js';
import { newSave, validate } from '../src/logic/save.js';

const fresh = () => { const s = newSave({ name: 'T' }); s.coins = 5000; return s; };

test('Pension: abgeben, EP beim Laufen, Gebühr beim Abholen', () => {
  const rng = createRng('dc'), s = fresh();
  s.team = [makeMonster('glutzahn', 10, rng), makeMonster('fellino', 8, rng), makeMonster('blitzi', 8, rng)];
  assert.ok(D.deposit(s, s.team, 1).ok);
  assert.equal(s.team.length, 2);
  const e = s.daycare.mons[0], lv = e.m.lv;
  D.walk(s, 2000, rng);
  assert.ok(e.m.lv > lv, 'kein Level-Aufstieg');
  assert.ok(e.m.moves.length <= 4);
  const coins = s.coins, cost = D.fee(e);
  const r = D.withdraw(s, 0);
  assert.ok(r.ok && s.coins === coins - cost && s.team.length === 3 && e.m.hp === maxHp(e.m));
  s.team = [s.team[0]];
  assert.ok(!D.deposit(s, s.team, 0).ok, 'letztes Taschi darf nicht weg');
});

test('Zucht: Ei nur bei gemeinsamem Typ, Junges ist Grundform mit Erbattacken', () => {
  const rng = createRng('egg'), s = fresh();
  const glut = makeMonster('glutzahn', 30, rng), other = makeMonster('glutzahn', 30, rng), plant = makeMonster('samenling', 20, rng);
  assert.ok(D.compatibility(glut, other) > D.compatibility(glut, plant));
  assert.equal(D.compatibility(makeMonster('samenling', 5, rng), makeMonster('glutzahn', 5, rng)), 0);
  s.team = [glut, other, makeMonster('blitzi', 5, rng)];
  D.deposit(s, s.team, 0); D.deposit(s, s.team, 0);
  let tries = 0; while (!s.daycare.egg && tries++ < 50) D.walk(s, D.EGG_CHECK_STEPS, rng);
  assert.ok(s.daycare.egg, 'kein Ei gelegt');
  assert.ok(D.collectEgg(s, rng).ok && s.eggs.length === 1 && !s.daycare.egg);
  const egg = s.eggs[0];
  assert.equal(egg.id, baseForm('glutzahn'));
  // Spielstand behält Pension und Ei
  const back = validate(JSON.parse(JSON.stringify(s)));
  assert.equal(back.daycare.mons.length, 2); assert.equal(back.eggs.length, 1); assert.equal(back.eggs[0].id, egg.id);
  // schlüpfen
  const out = D.walk(s, egg.total, rng);
  assert.equal(out.hatched.length, 1);
  const before = s.team.length;
  const baby = D.hatch(s, egg, rng);
  assert.equal(baby.lv, 1); assert.equal(baby.id, egg.id); assert.equal(s.team.length, before + 1); assert.equal(s.eggs.length, 0);
  for (const mv of egg.eggMoves) assert.ok(baby.moves.some(x => x.id === mv));
  assert.ok(baby.moves.length >= 1 && baby.moves.length <= 4);
});

test('Disks: im Laden, nicht verkaufbar, Typ-Regel, werden nicht verbraucht', () => {
  assert.ok(DISKS.length >= 20);
  for (const [mv] of DISKS) { assert.ok(MOVES[mv], mv); assert.equal(sellPrice('disk_' + mv), 0); }
  assert.ok(shopStock(16).filter(id => ITEMS[id].category === 'disk').length === DISKS.length);
  assert.ok(!shopStock(0).includes('disk_gigastoss'));
  const rng = createRng('disk'), m = makeMonster('glutzahn', 10, rng), bag = { disk_flammenrad: 1, disk_flutstrahl: 1, disk_hieb: 1 };
  m.moves = m.moves.filter(x => x.id !== 'flammenrad');
  const r = Items.useFromBag(bag, 'disk_flammenrad', m);
  assert.ok(r.ok && r.teach === 'flammenrad' && bag.disk_flammenrad === 1, 'Disk darf nicht verbraucht werden');
  assert.ok(!Items.useFromBag(bag, 'disk_flutstrahl', m).ok, 'Feuer-Taschi lernt keine Wasser-Disk');
  assert.ok(Items.diskCompatible('disk_hieb', makeMonster('samenling', 5, rng)), 'Normal-Disk für alle');
});

import { TRAINERS, trainerHeld, rematchTrainer } from '../src/data/trainers.js';
import { chooseAction } from '../src/logic/ai.js';
import { createBattle } from '../src/logic/battle.js';
import { rematchReady, markRematch, dayKey } from '../src/logic/daily.js';

test('Trainer: starke Gegner tragen Gegenstände, Revanche wächst mit', () => {
  const leaders = Object.values(TRAINERS).filter(t => t.kind === 'leader');
  const late = leaders.find(t => t.region === 12), early = leaders.find(t => t.region === 0);
  const held = trainerHeld(late, 12);
  assert.ok(held[held.length - 1], 'Ass ohne Gegenstand');
  assert.ok(held.filter(Boolean).every(id => ITEMS[id]?.category === 'held'));
  assert.ok(trainerHeld(early, 0).every(x => !x), 'erste Arena ohne Gegenstände');
  assert.deepEqual(trainerHeld(late, 12), held, 'deterministisch');
  const route = Object.values(TRAINERS).find(t => t.kind === 'route' && t.region === 1);
  const rt = rematchTrainer(route, 40);
  assert.equal(rt.kind, 'rematch'); assert.equal(rt.id, route.id);
  assert.ok(Math.max(...rt.team.map(x => x.lv)) >= 39 && rt.team.length >= 3 && rt.ai > route.ai);
  for (const x of rt.team) assert.ok(SPECIES[x.id]);
  const s = { badges: 3, trainers: { [route.id]: true }, rematch: {} };
  assert.ok(rematchReady(s, route.id));
  markRematch(s, route.id);
  assert.ok(!rematchReady(s, route.id) && rematchReady(s, route.id, '2099-01-01'));
  assert.match(dayKey(new Date(2026, 0, 5)), /^2026-01-05$/);
});

test('KI: heilt Status mit Heilkraut und schont Fokusband-Ziele nicht als sicheren K.o.', () => {
  const rng = createRng('ai');
  const me = makeMonster('blitzi', 20, rng), foe = makeMonster('glutzahn', 20, rng);
  foe.status = 'schlaf';
  const b = createBattle({ rng, kind: 'trainer', player: { team: [me], bag: {} }, foe: { team: [foe], ai: 3, trainer: true, items: { heilkraut: 1 } } });
  let healed = false;
  for (let k = 0; k < 10 && !healed; k++) healed = chooseAction(b, 1, 0, createRng('h' + k)).item === 'heilkraut';
  assert.ok(healed, 'KI nutzt kein Heilkraut');
});

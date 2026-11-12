// Fliegen, Raids, Zufallstausch-Plätze und Stimmen
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp, statOf } from '../src/logic/monster.js';
import { SPECIES } from '../src/data/species.js';
import * as Ride from '../src/logic/ride.js';
import * as Raid from '../src/logic/raid.js';
import { createBattle, runTurn } from '../src/logic/battle.js';
import { newSave } from '../src/logic/save.js';
import { voiceFor } from '../src/core/voice.js';

test('Fliegen: ab 5 Siegeln mit einem Flug-Taschi', () => {
  const rng = createRng('fly'), s = newSave({ name: 'T' });
  s.team.push(makeMonster('glutdrach', 30, rng));
  assert.equal(Ride.flyMount(s), null);
  s.badges = 5;
  assert.equal(Ride.flyMount(s)?.id, 'glutdrach');
  assert.ok(!Ride.flyable('blitzi'));
  assert.match(Ride.flyHint({ badges: 2 }), /fünften/);
});

test('Raid: täglich fester Riese, vielfache KP, Endform', () => {
  const s = newSave({ name: 'T' }); s.badges = 4;
  const a = Raid.raidOf(s, 2, '2026-11-12'), b = Raid.raidOf(s, 2, '2026-11-12'), c = Raid.raidOf(s, 2, '2026-11-13');
  assert.deepEqual(a, b);
  assert.ok(SPECIES[a.id] && !SPECIES[a.id].evo, 'Endstufe');
  assert.equal(a.stars, 3);
  assert.notEqual(a.key, c.key);
  const boss = Raid.makeBoss(a, createRng('x'));
  assert.equal(boss.hp, maxHp(boss));
  assert.ok(boss.hp >= statOf(boss, 'hp') * 3.9);
  assert.equal(Raid.raidDone(s, a), false); Raid.markRaid(s, a); assert.equal(Raid.raidDone(s, a), true);
});

test('Raid-Kampf: Helfer handelt selbst, Riese zweimal pro Runde', () => {
  const rng = createRng('raid'), s = newSave({ name: 'T' }); s.badges = 2;
  const raid = Raid.raidOf(s, 0, '2026-11-12');
  const lead = makeMonster('glutzahn', 25, rng), help = Raid.makeHelper(raid, { team: [lead] }, rng), boss = Raid.makeBoss(raid, rng);
  assert.ok(help.m.ally);
  const b = createBattle({ rng, kind: 'wild', format: 'double', canCatch: false, player: { team: [lead, help.m] }, foe: { team: [boss], ai: 2 } });
  assert.deepEqual(b.sides[0].active, [0, 1]);
  const ev = runTurn(b, [{ slot: 0, type: 'move', move: lead.moves[0].id, target: 0 }]);
  const users = ev.filter(e => e.t === 'move').map(e => e.uid);
  assert.ok(users.includes(help.m.uid), 'Helfer greift an');
  assert.ok(users.filter(u => u === boss.uid).length >= 1);
});

test('Stimmen: jede Figur klingt anders, Werte im gültigen Bereich', () => {
  const a = voiceFor('Professor Ulme'), b = voiceFor('Pia'), n = voiceFor('');
  assert.notDeepEqual(a, b);
  for (const v of [a, b, n]) { assert.ok(v.pitch >= 0.5 && v.pitch <= 1.8); assert.ok(v.rate >= 0.8 && v.rate <= 1.2); }
});

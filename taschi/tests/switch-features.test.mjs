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

test('Stimmprofile: Besetzung, Geschlecht aus Titel, gleiche Figur = gleiche Stimme', async () => {
  const { profileFor, sortVoices } = await import('../src/core/voice.js');
  assert.equal(profileFor('Kommandantin Varga').key, profileFor('Varga').key);
  assert.equal(profileFor('Kommandantin Varga').sex, 'f');
  assert.equal(profileFor('Professor Ulme').sex, 'm');
  assert.equal(profileFor('Wanderin Oda').sex, 'f');
  assert.equal(profileFor('Pilzsammler Gustav').sex, 'm');
  assert.equal(profileFor('Arena-Schüler Valentin').sex, 'm');
  assert.equal(profileFor('Geschwister Lina & Leo').age, 'kid');
  assert.equal(profileFor('Forschungscomputer').tone, 'robot');
  assert.equal(profileFor('Rio', { sex: 'm' }).sex, 'm');
  const cast = ['Professor Ulme', 'Rivale Rian', 'Brix', 'Kommandantin Varga', 'Selma', 'Kett', 'Wirtin Ilse', 'Pia', 'Arenaleitung Perla', 'Arenaleitung Fels-Fiete'];
  const sig = new Set(cast.map(w => { const p = profileFor(w); return [p.pitch.toFixed(2), p.rate.toFixed(2), p.wave].join(); }));
  assert.equal(sig.size, cast.length, 'jede Hauptfigur klingt anders');
  for (const w of cast) { const p = profileFor(w); assert.ok(p.hz >= 70 && p.hz <= 420); }
  const v = sortVoices([{ name: 'Anna', lang: 'de-DE' }, { name: 'Microsoft Conrad Online (Natural)', lang: 'de-DE' }, { name: 'Alex', lang: 'en-US' }]);
  assert.equal(v.all.length, 2); assert.equal(v.f[0].name, 'Anna'); assert.equal(v.m.length, 1);
});

test('Taschi-Rufe: jede Art hat einen eigenen Ruf, gleiche Art klingt gleich', async () => {
  const { cryFor } = await import('../src/core/cries.js');
  const { SPECIES } = await import('../src/data/species.js');
  const ids = Object.keys(SPECIES);
  const sig = (c) => c.wave + c.syl.map(s => [Math.round(s.f), Math.round(s.formant), s.dur.toFixed(3), s.shape].join(':')).join('|');
  const all = ids.map(id => sig(cryFor(id, SPECIES[id])));
  assert.equal(new Set(all).size, ids.length, 'keine zwei Arten klingen gleich');
  assert.equal(sig(cryFor(ids[0], SPECIES[ids[0]])), all[0]);
  for (const id of ids) for (const s of cryFor(id, SPECIES[id]).syl) { assert.ok(s.f >= 60 && s.f <= 1600, id); assert.ok(s.dur > 0.03 && s.dur < 0.6, id); }
});

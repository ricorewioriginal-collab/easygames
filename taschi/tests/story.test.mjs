// Story-Konsistenz: Namen, Reihenfolge, Verweise und Anrede der Spielfigur.
import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS } from '../src/data/regions.js';
import { SPECIES_IDS } from '../src/data/species.js';
import { RIVAL_STAGES } from '../src/data/trainers.js';
import { RIVAL, GUILD_SCENES, PROFESSORS, playerText } from '../src/data/story.js';
import { AMBUSHES, ARRIVALS, JUNA } from '../src/data/adventure.js';
import { newSave } from '../src/logic/save.js';
import { mainObjective } from '../src/logic/progress.js';

const last = (n) => n.split(/\s+/).at(-1);

test('Leitungen, Champions und Professoren tragen eindeutige Namen', () => {
  const seen = new Map();
  for (const r of REGIONS) for (const [who, role] of [[r.gym.leader, 'gym'], [r.champion.name, 'champ'], [r.professor.title, 'prof']]) {
    const k = /vom|der/.test(who) ? who.split(/\s+/)[0] : last(who);
    // Aurelia kehrt bewusst als Großmeisterin zurück (Sternenau → Himmelskrone)
    if (k === 'Aurelia') continue;
    assert.ok(!seen.has(k), `Name „${k}“ doppelt: ${seen.get(k)} und ${r.name}/${role}`);
    seen.set(k, r.name + '/' + role);
  }
  assert.ok(!seen.has(RIVAL.name), 'Rivale teilt den Namen mit ' + seen.get(RIVAL.name));
});

test('Champions verweisen auf die nächste Region', () => {
  for (const r of REGIONS.slice(0, -1)) assert.ok(r.champion.defeat.includes(REGIONS[r.id + 1].name), r.name + ': ' + r.champion.defeat);
  for (const r of REGIONS) assert.ok(!/im Süden/.test(r.champion.defeat), 'Nordtor führt weiter: ' + r.champion.defeat);
});

test('Jede Region hat Gildenlager oder Hinterhalt, Texte für alle Regionen', () => {
  for (const r of REGIONS) assert.ok((r.guild !== undefined) !== !!AMBUSHES[r.id], r.name);
  assert.equal(JUNA.notes.length, REGIONS.length);
  assert.equal(ARRIVALS.length, REGIONS.length);
  assert.equal(PROFESSORS.length, REGIONS.length);
  assert.equal(RIVAL.stages.length, RIVAL_STAGES.length);
  assert.equal(GUILD_SCENES.length, 8);
});

test('Postgame-Ziel nennt die echte Zahl der Arten', () => {
  const s = newSave({ name: 'T' });
  Object.assign(s.flags, { metUlme: true, starterChosen: true, firstBattle: true, firstQuest: true, summitDone: true });
  s.badges = 16; s.league = 5; s.bag.brixcode = 1; REGIONS.forEach(r => { s.champions[r.id] = true; });
  for (const id of ['tiefenlied', 'sturmkron', 'mondhueter', 'auraflamme']) s.dex[id] = 2;
  assert.ok(mainObjective(s).text.includes('/' + SPECIES_IDS.length + ')'), mainObjective(s).text);
});

test('Anrede passt sich der Spielfigur an', () => {
  assert.equal(playerText('Du bist der neue Sternenmeister.', 'w'), 'Du bist die neue Sternenmeisterin.');
  assert.equal(playerText('Sternenmeisterin Lyra', 'w'), 'Sternenmeisterin Lyra');
  assert.equal(playerText('Der Sternenmeister kauft bei mir!', 'w'), 'Die Sternenmeisterin kauft bei mir!');
  assert.equal(playerText('Du bist der neue Sternenmeister.', 'm'), 'Du bist der neue Sternenmeister.');
  assert.equal(playerText('Du bist der neue Sternenmeister.', 'd'), 'Du bist der neue Sternenmeister.');
});

test('Sternengipfel lädt ohne wilde Taschis (kein Absturz in regionPool)', async () => {
  const { regionPool } = await import('../src/logic/encounters.js');
  assert.deepEqual(regionPool(16, 'grass'), []);
});

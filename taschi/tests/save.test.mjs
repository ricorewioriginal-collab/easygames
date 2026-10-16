import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, migrateV1, serialize, deserialize, newSave, keys, importJSON, exportJSON, validate } from '../src/logic/save.js';
import { maxHp } from '../src/logic/monster.js';
import { simulate } from './simulate.mjs';
import * as P from '../src/logic/progress.js';

class MemStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}

// A representative version-1 save as written by legacy/game-v1.js
const V1 = {
  team: [{ id: 'glutdrach', lv: 21, xp: 40, hp: 50, pp: { glut: 7, hieb: 3 } }, { id: 'form_2_0', lv: 12, xp: 0, hp: 0, pp: {} }],
  box: [{ id: 'quappi', lv: 6, xp: 0, hp: 20 }],
  badges: 5, balls: 12, potions: 4, coins: 777, dex: { glutzahn: 2, glutdrach: 2, form_2_0: 2, quappi: 2, felsling: 1 },
  x: 10, z: -20, wins: 33, metProfessor: true, guild: { 0: true, 1: true }, trainers: { 0: 1, 3: 1 }, champions: { 0: true, 1: true, 2: true, 3: true },
  puzzles: { 0: true, 1: true, 2: true, 3: true, 4: true }, chests: { 0: true }, quests: { Moosbach: true }, crystals: { 'Flüsterhöhle:1': true }, league: 0
};

test('version-1 saves migrate without losing progress', () => {
  const s = migrateV1(structuredClone(V1));
  assert.ok(s);
  assert.equal(s.version, 2);
  assert.equal(s.team.length, 2);
  assert.equal(s.team[0].id, 'glutdrach');
  assert.equal(s.team[0].lv, 21);
  assert.equal(s.team[1].hp, 0, 'fainted stays fainted');
  assert.ok(s.team[0].hp > 0 && s.team[0].hp <= maxHp(s.team[0]));
  assert.equal(s.box.length, 1);
  assert.equal(s.badges, 5);
  assert.equal(s.coins, 777);
  assert.equal(s.bag.taschiball, 12);
  assert.equal(s.bag.trank, 4);
  assert.equal(s.dex.felsling, 1);
  assert.equal(s.dex.glutdrach, 2);
  assert.ok(s.champions[3]);
  assert.ok(s.puzzles['region:4']);
  assert.ok(s.chests['region:0']);
  assert.equal(s.guild[0], 'done');
  assert.equal(s.guild[2], 'done', 'v1 guild site 1 (Glutland) maps to v2 site 2');
  assert.ok(s.trainers.route_0_0, 'legacy trainer Jule');
  assert.ok(s.quests.q0_mira.done, 'village quest Moosbach');
  assert.ok(s.flags.introDone && s.flags.starterChosen);
  assert.equal(s.location.map, 'region:4');
  assert.equal(s.stats.wins, 33);
  assert.ok(s.found['crystal:Flüsterhöhle:1']);
});

test('store: loads v2, falls back to backup on corruption, then to legacy', () => {
  const st = new MemStorage();
  const store = createStore(st);
  // only legacy v1 present (old slot1 key without suffix)
  st.setItem(keys.legacyRoot, JSON.stringify(V1));
  let r = store.load(1);
  assert.equal(r.source, 'legacy');
  assert.equal(r.save.badges, 5);
  assert.ok(st.getItem(keys.legacyRoot), 'legacy data is never deleted');
  // write v2 + backup, then corrupt the main save
  r.save.coins = 1234;
  store.write(1, r.save);
  store.backup(1, r.save);
  assert.equal(store.load(1).source, 'v2');
  st.setItem(keys.v2(1), st.getItem(keys.v2(1)).replace('1234', '9999'));
  r = store.load(1);
  assert.equal(r.source, 'backup');
  assert.equal(r.save.coins, 1234);
  assert.ok(r.warnings.length);
  st.setItem(keys.v2(1), '{broken');
  st.setItem(keys.backup(1), 'nope');
  r = store.load(1);
  assert.equal(r.source, 'legacy');
  assert.equal(store.load(2).source, 'none');
  assert.ok(keys.v2(1).startsWith('easygames.taschi.eight-lights.v1'), 'cloud prefix kept');
});

test('serialize/deserialize roundtrip with checksum, export/import', () => {
  const s = newSave({ name: 'Mila' });
  const text = serialize(s);
  const back = deserialize(text);
  assert.equal(back.save.player.name, 'Mila');
  const exported = exportJSON(back.save);
  assert.equal(importJSON(exported).player.name, 'Mila');
  const v1export = JSON.stringify({ format: 'taschi-save', version: 1, state: V1 });
  assert.equal(importJSON(v1export).badges, 5);
  assert.throws(() => importJSON('{"hello":1}'));
  assert.equal(validate({ format: 'other' }), null);
});

test('simulated playthrough reaches the end of the game', () => {
  const { save, stats } = simulate('ci', 'samenling');
  assert.equal(save.badges, 16);
  assert.equal(Object.keys(save.champions).length, 16);
  assert.equal(save.league, 5);
  assert.ok(save.flags.summitDone);
  assert.ok(P.postgame(save));
  assert.equal(stats.puzzles, 16);
  assert.ok(stats.quests >= 16, 'quests completed: ' + stats.quests);
  assert.ok(stats.wild + stats.trainer < 600, 'battle count reasonable');
  assert.match(stats.objective, /Postgame/);
});

test('player gender survives saving and invalid values are dropped', () => {
  const s = newSave({ name: 'Kim', gender: 'd', look: { top: 'trainer', hat: 'trainercap' } });
  assert.equal(validate(JSON.parse(JSON.stringify(s))).player.gender, 'd');
  assert.equal(validate({ ...s, player: { ...s.player, gender: 'x' } }).player.gender, undefined);
  assert.equal(newSave().player.gender, undefined);
});

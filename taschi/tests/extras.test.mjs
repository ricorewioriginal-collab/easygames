// Camp, Tagesereignisse (Glücksrad, Massenausbruch, Revanche) und Kampfturm
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster } from '../src/logic/monster.js';
import { SPECIES } from '../src/data/species.js';
import { ITEMS } from '../src/data/items.js';
import * as Camp from '../src/logic/camp.js';
import * as Daily from '../src/logic/daily.js';
import * as Tower from '../src/logic/tower.js';
import { newSave, validate } from '../src/logic/save.js';

const fresh = () => { const s = newSave({ name: 'T' }); s.coins = 1000; return s; };

test('Camp: Freundschaft steigt, Tageslimit, Keks wird verbraucht', () => {
  const rng = createRng('camp'), s = fresh(), m = makeMonster('glutzahn', 10, rng);
  m.friendship = 210; s.team = [m];
  assert.ok(!Camp.campAction(s, m, 'feed', 'd1').ok, 'ohne Keks');
  s.bag.taschikeks = 1;
  const r = Camp.campAction(s, m, 'feed', 'd1');
  assert.ok(r.ok && r.reached && m.friendship === 222 && !s.bag.taschikeks);
  let n = 0; while (Camp.campAction(s, m, 'play', 'd1').ok) n++;
  assert.equal(Camp.campLeft(s, m, 'd1'), 0);
  assert.equal(m.friendship, 210 + Camp.CAMP_DAILY);
  assert.ok(n > 0 && Camp.campAction(s, m, 'pet', 'd2').ok, 'neuer Tag');
  assert.match(Camp.friendshipLabel(m.friendship), /Beste/);
});

test('Glücksrad: einmal pro Tag, Gewinn landet im Spielstand', () => {
  const s = fresh(), rng = createRng('wheel');
  assert.equal(Daily.WHEEL.reduce((a, x) => a + x.w, 0), 100);
  for (const p of Daily.WHEEL) for (const id of Object.keys(p.items || {})) assert.ok(ITEMS[id], id);
  const coins = s.coins, items = Object.values(s.bag).reduce((a, b) => a + b, 0);
  const r = Daily.spinWheel(s, rng, 'd1');
  assert.ok(r && (s.coins > coins || Object.values(s.bag).reduce((a, b) => a + b, 0) > items));
  assert.equal(Daily.spinWheel(s, rng, 'd1'), null);
  assert.ok(Daily.spinWheel(s, rng, 'd2'));
  assert.equal(validate(JSON.parse(JSON.stringify(s))).daily.wheel, 'd2');
});

test('Massenausbruch: fest pro Tag, nur besuchte Regionen', () => {
  const s = fresh();
  assert.equal(Daily.outbreak(s, 'd1'), null, 'erst nach der ersten Aufgabe');
  s.flags.firstQuest = true; s.visited = { 0: true, 1: true, 2: true };
  const a = Daily.outbreak(s, '2026-11-12'), b = Daily.outbreak(s, '2026-11-12');
  assert.deepEqual(a, b);
  assert.ok([0, 1, 2].includes(a.region) && SPECIES[a.id]);
});

test('Revanche: einmal pro Tag ab dem zweiten Siegel', () => {
  const s = fresh(); s.trainers.t1 = true;
  assert.ok(!Daily.rematchReady(s, 't1', 'd1'));
  s.badges = 2;
  assert.ok(Daily.rematchReady(s, 't1', 'd1'));
  Daily.markRematch(s, 't1', 'd1');
  assert.ok(!Daily.rematchReady(s, 't1', 'd1') && Daily.rematchReady(s, 't1', 'd2'));
});

test('Kampfturm: Kopien auf Lv 50, Gegner fest, TP und Shop', () => {
  const rng = createRng('tower'), s = fresh();
  s.team = [makeMonster('glutzahn', 20, rng), makeMonster('fellino', 30, rng), makeMonster('blitzi', 60, rng)];
  const before = JSON.stringify(s.team);
  const copies = s.team.map(Tower.towerCopy);
  assert.ok(copies.every(c => c.lv === Tower.TOWER_LEVEL && c.uid.startsWith('tw_') && c.hp > 0));
  assert.equal(JSON.stringify(s.team), before, 'Original verändert');
  assert.ok(!Tower.towerOpen(s)); s.badges = 8; assert.ok(Tower.towerOpen(s));
  assert.ok(!Tower.startRun(s, s.team.slice(0, 2)).ok);
  assert.ok(Tower.startRun(s, s.team).ok);
  const o1 = Tower.opponent(s.tower.run), o2 = Tower.opponent(s.tower.run);
  assert.deepEqual(o1, o2);
  assert.equal(new Set(o1.team.map(x => x.id)).size, 3);
  assert.equal(Tower.buildFoe(o1, rng).length, 3);
  let tp = 0;
  for (let i = 0; i < 7; i++) tp += Tower.recordWin(s);
  assert.equal(tp, 7 + 3, 'Etagenboss gibt Bonus');
  assert.ok(Tower.opponent({ ...s.tower.run, streak: 6 }).boss);
  assert.equal(s.tower.best, 7);
  for (const e of Tower.TOWER_SHOP) assert.ok(ITEMS[e.item], e.item);
  assert.ok(Tower.buy(s, Tower.TOWER_SHOP[0]).ok && s.tower.tp === 10 - Tower.TOWER_SHOP[0].tp);
  assert.equal(Tower.endRun(s), 7);
  assert.equal(s.tower.run, null);
  assert.equal(validate(JSON.parse(JSON.stringify(s))).tower.best, 7);
});

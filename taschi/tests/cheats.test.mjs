// Cheats: alle Schalter wirken und lassen sich genau wieder zurücknehmen
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster, maxHp, MAX_LEVEL } from '../src/logic/monster.js';
import { SPECIES, SPECIES_IDS } from '../src/data/species.js';
import { newSave, validate } from '../src/logic/save.js';
import { createBattle, runTurn, catchChance } from '../src/logic/battle.js';
import * as Cheats from '../src/logic/cheats.js';
import * as Items from '../src/logic/items.js';
import * as Ride from '../src/logic/ride.js';

const start = () => { const rng = createRng('cheat'), s = newSave({ name: 'C' }); s.team = [makeMonster(SPECIES_IDS[0], 8, rng)]; s.dex[SPECIES_IDS[0]] = 2; s.dex[SPECIES_IDS[5]] = 1; return { rng, s }; };

test('Alle Taschis: an und wieder aus stellt Dex und Lager her', () => {
  const { rng, s } = start();
  const before = JSON.stringify({ dex: s.dex, box: s.box, team: s.team });
  Cheats.set(s, 'allmons', true, rng);
  assert.ok(SPECIES_IDS.every(id => s.dex[id] === 2));
  assert.equal(s.box.length, SPECIES_IDS.length - 1);
  const kept = s.box[3]; s.box.splice(3, 1); s.team.push(kept);   // Spieler nimmt eins ins Team
  Cheats.set(s, 'allmons', false);
  assert.equal(JSON.stringify({ dex: s.dex, box: s.box, team: s.team }), before);
  assert.ok(!Cheats.isOn(s, 'allmons'));
});

test('Maximale Entwicklung und Items lassen sich zurücknehmen', () => {
  const { rng, s } = start();
  const m = s.team[0], snap = JSON.stringify(m), coins = s.coins, bag = { ...s.bag };
  Cheats.set(s, 'maxevo', true, rng);
  assert.equal(m.lv, MAX_LEVEL); assert.ok(!SPECIES[m.id].evo?.to); assert.equal(m.hp, maxHp(m));
  Cheats.set(s, 'items', true);
  assert.equal(s.bag.vitaltrank, Cheats.ITEM_COUNT); assert.ok(!s.bag.angel, 'keine Schlüssel-Items');
  s.bag.trank -= 10;                                               // Spieler verbraucht welche
  const back = validate(JSON.parse(JSON.stringify(s)));            // übersteht Speichern/Laden
  Cheats.allOff(back);
  assert.equal(JSON.stringify(back.team[0]), snap);
  assert.equal(JSON.stringify(back.dex), JSON.stringify(start().s.dex), 'Dex wie vorher');
  assert.equal(back.coins, coins);
  assert.equal(back.bag.taschiball, bag.taschiball);
  assert.ok(!back.bag.trank, 'verbrauchte Heiltropfen werden nicht zurückgezaubert');
  assert.ok(!Cheats.anyOn(back));
});

test('Kampf-Cheats: unbesiegbar, Sofort-K.O., AP, Fangen, EP', () => {
  const { rng, s } = start();
  for (const id of ['god', 'ohko', 'pp', 'catch', 'xp']) Cheats.set(s, id, true);
  const foe = makeMonster(SPECIES_IDS[30], 40, rng);
  const b = createBattle({ rng, kind: 'wild', cheat: Cheats.battleFlags(s), player: { team: s.team, bag: s.bag }, foe: { team: [foe] } });
  assert.equal(catchChance(b, foe, 'taschiball'), 1);
  const mine = s.team[0], hp = mine.hp, pp = mine.moves.map(x => x.pp);
  const atk = mine.moves.find(x => x.id && x.pp > 0);
  for (let i = 0; i < 5 && b.phase !== 'end'; i++) runTurn(b, [{ type: 'move', move: atk.id, target: 0 }]);
  assert.equal(mine.hp, maxHp(mine), 'kein Schaden (volle KP, auch nach Levelaufstieg)'); assert.ok(mine.lv > 8, 'EP ×10'); void hp;
  assert.deepEqual(mine.moves.slice(0, pp.length).map(x => x.pp), pp, 'keine AP verbraucht');
  const pvp = createBattle({ rng, kind: 'trainer', pvp: true, cheat: Cheats.battleFlags(s), player: { team: s.team }, foe: { team: [foe] } });
  assert.equal(pvp.cheat, null, 'nie online');
  Cheats.allOff(s);
  assert.equal(Cheats.battleFlags(s), null);
});

test('Welt-Cheats: Gratis-Laden, Fliegen, gegenseitiges Ausschalten', () => {
  const { s } = start();
  s.coins = 0;
  assert.ok(!Items.buy(s, 'sternball', 1).ok);
  Cheats.set(s, 'free', true);
  assert.ok(Items.buy(s, 'sternball', 5).ok); assert.equal(s.coins, 0);
  assert.equal(Ride.flyMount(s), null);
  Cheats.set(s, 'fly', true); assert.equal(Ride.flyMount(s), s.team[0]);
  Cheats.set(s, 'giant', true); Cheats.set(s, 'mini', true);
  assert.ok(Cheats.isOn(s, 'mini') && !Cheats.isOn(s, 'giant'));
  Cheats.allOff(s); assert.equal(Ride.flyMount(s), null);
});

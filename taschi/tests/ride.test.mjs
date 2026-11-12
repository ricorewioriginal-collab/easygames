// Reiten & Surfen
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { makeMonster } from '../src/logic/monster.js';
import { SPECIES_IDS } from '../src/data/species.js';
import { DEFAULT_KEYS, PAD_LAYOUTS, ACTIONS, migratePad } from '../src/core/input.js';
import * as Ride from '../src/logic/ride.js';
import { newSave } from '../src/logic/save.js';

test('Reiten: Siegel, Größe und Begleiter entscheiden', () => {
  const rng = createRng('ride'), s = newSave({ name: 'T' });
  const small = makeMonster('glutzahn', 10, rng), big = makeMonster('glutdrach', 30, rng), tank = makeMonster('panzerlon', 30, rng);
  s.team = [small, big, tank];
  assert.ok(!Ride.rideable('glutzahn') && Ride.rideable('glutdrach'));
  assert.equal(Ride.rideMount(s), null, 'ohne Siegel');
  assert.match(Ride.rideHint(s), /Siegel/);
  s.badges = 1;
  assert.equal(Ride.rideMount(s), big);
  s.companion = tank.uid;
  assert.equal(Ride.rideMount(s), tank, 'Begleiter hat Vorrang');
  tank.hp = 0;
  assert.equal(Ride.rideMount(s), big, 'nur kampffähige');
  assert.ok(SPECIES_IDS.filter(Ride.rideable).length >= 30, 'genug Reit-Taschis');
});

test('Surfen: Wasser-Taschi ab dem dritten Siegel', () => {
  const rng = createRng('surf'), s = newSave({ name: 'T' });
  s.team = [makeMonster('glutdrach', 30, rng), makeMonster('panzerlon', 30, rng)];
  s.badges = 2;
  assert.equal(Ride.surfMount(s), null);
  s.badges = 3;
  assert.equal(Ride.surfMount(s).id, 'panzerlon');
  assert.ok(SPECIES_IDS.filter(Ride.surfable).length >= 15);
});

test('Reiten hat eine Taste auf jedem Gerät', () => {
  assert.ok(ACTIONS.includes('ride') && DEFAULT_KEYS.ride.length);
  for (const l of Object.values(PAD_LAYOUTS)) assert.equal(l.ride, 11);
  // alte Standardbelegung ohne „ride“ gilt nicht als eigene Belegung
  const old = { ...PAD_LAYOUTS.xbox }; delete old.ride;
  assert.equal(migratePad({ pad: old }).padLayout, 'switch');
});

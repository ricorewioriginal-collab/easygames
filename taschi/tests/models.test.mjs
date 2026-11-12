// Taschis aus 3D-Modellen (Quaternius, CC0)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { SPECIES, SPECIES_IDS } from '../src/data/species.js';
import { evolutionChain } from '../src/logic/monster.js';
import { regionPool } from '../src/logic/encounters.js';

const models = SPECIES_IDS.filter(id => SPECIES[id].look.plan === 'model');

test('jede Modell-Art hat ihre Datei und eine Entwicklung', () => {
  assert.equal(models.length, 57);
  for (const id of models) {
    const f = new URL('../assets/models/' + SPECIES[id].look.model + '.glb', import.meta.url);
    assert.ok(existsSync(f) && statSync(f).size > 10000, id + ' Modell');
    assert.ok(evolutionChain(id).length >= 2, id + ' ohne Entwicklung');
  }
  assert.ok(existsSync(new URL('../assets/models/LICENSE.txt', import.meta.url)), 'Lizenzhinweis');
  // gleiche Modelle für Entwicklungen nur mit eigener Farbe
  for (const id of models) { const e = SPECIES[id].evo?.to; if (e && SPECIES[e].look.model === SPECIES[id].look.model) assert.ok(SPECIES[e].look.tint, e); }
});

test('Modell-Arten leben in der Wildnis', () => {
  const wild = new Set();
  for (let r = 0; r < 16; r++) for (const h of ['grass', 'water', 'cave', 'flowers', 'night']) for (const [id] of regionPool(r, h)) wild.add(id);
  const bases = models.filter(id => !SPECIES_IDS.some(k => SPECIES[k].evo?.to === id));
  const found = bases.filter(id => wild.has(id));
  assert.ok(found.length >= bases.length * 0.8, found.length + ' von ' + bases.length + ' Grundformen wild');
});

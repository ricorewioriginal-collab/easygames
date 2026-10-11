// Rezepte: Prüfen, Verbrauch, Vorratsgrenzen, Fehlermeldungen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RECIPES, checkRecipe, craft, craftable, recipeMatches, MAX_STACK } from '../src/crafting.js';
import { B, BLOCKS } from '../src/blocks.js';
import { I, known } from '../src/items.js';

const R = id => RECIPES.find(r => r.id === id);

test('Rezepte sind eindeutig und gültig', () => {
  const ids = new Set();
  for (const r of RECIPES) {
    assert.ok(!ids.has(r.id), 'doppelt: ' + r.id); ids.add(r.id);
    assert.ok(known(r.give[0]) && r.give[1] > 0);
    for (const [t, n] of r.need) assert.ok(known(t) && n > 0 && t !== r.give[0]);
    assert.ok(!r.st || ['werkbank', 'ofen'].includes(r.st));
  }
});

test('Herstellen verbraucht genau die Zutaten', () => {
  const inv = { [B.WOOD]: 3 };
  assert.equal(craft(inv, R('planks')).ok, true);
  assert.deepEqual(inv, { [B.WOOD]: 2, [B.PLANKS]: 4 });
  const inv2 = { [B.GLASS]: 2, [B.WOOD]: 1 };
  craft(inv2, R('lamp'));
  assert.deepEqual(inv2, { [B.GLASS]: 0, [B.WOOD]: 0, [B.LAMP]: 2 });
});

test('Fehlende Zutaten: nichts wird verändert, Meldung nennt die Lücke', () => {
  const inv = { [B.GLASS]: 1, [B.WOOD]: 5 };
  const res = craft(inv, R('lamp'));
  assert.equal(res.ok, false);
  assert.match(res.msg, /1× Glas/);
  assert.deepEqual(inv, { [B.GLASS]: 1, [B.WOOD]: 5 });
});

test('Vorratsgrenze: kein Überlauf, keine verlorenen Zutaten', () => {
  const inv = { [B.WOOD]: 10, [B.PLANKS]: MAX_STACK - 3 };
  const res = craft(inv, R('planks'));
  assert.equal(res.ok, false);
  assert.match(res.msg, /Vorrat voll/);
  assert.equal(inv[B.WOOD], 10);
  assert.equal(checkRecipe(inv, R('planks')).full, true);
});

test('Anzahl herstellbar berücksichtigt Zutaten und Grenze', () => {
  assert.equal(craftable({ [B.SAND]: 9 }, R('glass')), 4);
  assert.equal(craftable({ [B.WOOD]: 100, [B.PLANKS]: MAX_STACK - 8 }, R('planks')), 2);
  assert.equal(craftable({}, R('glass')), 0);
});

test('Wiederholtes Herstellen bucht nie doppelt', () => {
  const inv = { [B.SAND]: 5 };
  let ok = 0;
  for (let i = 0; i < 10; i++) if (craft(inv, R('glass')).ok) ok++;
  assert.equal(ok, 2);
  assert.deepEqual(inv, { [B.SAND]: 1, [B.GLASS]: 2 });
});

test('Suche findet Ergebnis und Zutaten', () => {
  assert.ok(recipeMatches(R('lamp'), 'leucht'));
  assert.ok(recipeMatches(R('lamp'), 'GLAS'));
  assert.ok(!recipeMatches(R('lamp'), 'marmor'));
  assert.ok(RECIPES.filter(r => recipeMatches(r, 'kohle')).length >= 2);
});

test('Stationen: Rezept nur mit Werkbank/Ofen in der Nähe', () => {
  const inv = { [B.PLANKS]: 10, [I.STICK]: 4 }, pick = RECIPES.find(r => r.give[0] === I.WOOD_PICK);
  const res = craft(inv, pick, MAX_STACK, new Set());
  assert.equal(res.ok, false);
  assert.match(res.msg, /Werkbank/);
  assert.equal(inv[B.PLANKS], 10, 'nichts verbraucht');
  assert.equal(craftable(inv, pick, MAX_STACK, new Set()), 0);
  assert.equal(craft(inv, pick, MAX_STACK, new Set(['werkbank'])).ok, true);
  assert.deepEqual([inv[B.PLANKS], inv[I.STICK], inv[I.WOOD_PICK]], [7, 2, 1]);
  // ohne Stations-Angabe (z. B. alte Aufrufe) wird nicht geprüft
  assert.equal(checkRecipe({ [B.COPPER]: 1, [B.COAL]: 1 }, R('ingotCopper')).ok, true);
  assert.match(craft({ [B.IRON]: 1, [B.COAL]: 1 }, R('ingotIron'), MAX_STACK, new Set(['werkbank'])).msg, /einen Schmelzofen/);
});

test('Werkzeugkette ist vollständig: Holz bis Eisen herstellbar', () => {
  for (const key of ['WOOD', 'STONE', 'COPPER', 'IRON']) for (const k of ['PICK', 'AXE', 'SHOVEL'])
    assert.ok(RECIPES.some(r => r.give[0] === I[key + '_' + k] && r.st === 'werkbank'), key + '_' + k);
  assert.ok(R('sticks') && !R('sticks').st && R('workbench') && !R('workbench').st, 'Stöcke und Werkbank aus der Hand');
});

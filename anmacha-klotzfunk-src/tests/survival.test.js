// Überleben: Werkzeuge/Abbauzeit, Gesundheit, Hunger, Luft, Fallschaden.
import test from 'node:test';
import assert from 'node:assert/strict';
import { B, BLOCKS } from '../src/blocks.js';
import { I, ITEMS, ITEM_LIST, ITEM0, mineTime, canHarvest, toolFits, nameOf, isItem } from '../src/items.js';
import { Vitals, fallDamage, MAX_HP, MAX_FOOD, MAX_AIR } from '../src/survival.js';
import { Player } from '../src/physics.js';

test('Item-Register: eigener Id-Bereich, eindeutige Namen', () => {
  const names = new Set();
  for (const id of ITEM_LIST) {
    assert.ok(id >= ITEM0 && isItem(id) && ITEMS[id].id === id);
    assert.ok(!names.has(ITEMS[id].name), 'doppelt: ' + ITEMS[id].name); names.add(ITEMS[id].name);
  }
  assert.ok(BLOCKS.length < ITEM0);
  assert.equal(nameOf(I.IRON_PICK), 'Eisenspitzhacke');
  assert.equal(nameOf(B.STONE), 'Stein');
});

test('Abbauzeit: passendes Werkzeug ist schneller, höhere Stufe noch schneller', () => {
  const hand = mineTime(B.STONE, 0), wood = mineTime(B.STONE, I.WOOD_PICK), iron = mineTime(B.STONE, I.IRON_PICK);
  assert.ok(hand > wood && wood > iron, `${hand} > ${wood} > ${iron}`);
  assert.equal(mineTime(B.STONE, I.IRON_AXE), hand, 'falsches Werkzeug hilft nicht');
  assert.ok(mineTime(B.LEAVES, 0) >= 0.12 && mineTime(B.LEAVES, 0) < 0.3);
  assert.ok(toolFits(B.WOOD, I.STONE_AXE) && !toolFits(B.WOOD, I.STONE_PICK));
});

test('Erze brauchen die passende Spitzhacke', () => {
  assert.equal(canHarvest(B.COAL, 0), false);
  assert.equal(canHarvest(B.COAL, I.WOOD_AXE), false);
  assert.equal(canHarvest(B.COAL, I.WOOD_PICK), true);
  assert.equal(canHarvest(B.IRON, I.WOOD_PICK), false);
  assert.equal(canHarvest(B.IRON, I.STONE_PICK), true);
  assert.equal(canHarvest(B.STONE, 0), true, 'Stein geht weiter mit der Hand');
});

test('Fallschaden: bis 4 Blöcke nichts, danach steigend', () => {
  const v = h => Math.sqrt(2 * 28 * h); // Aufprall nach freiem Fall aus h Blöcken
  assert.equal(fallDamage(v(3)), 0);
  assert.equal(fallDamage(v(4)), 0);
  assert.ok(fallDamage(v(6)) >= 1);
  assert.ok(fallDamage(v(20)) > fallDamage(v(8)));
  assert.ok(fallDamage(55) < MAX_HP, 'Höchstgeschwindigkeit ist nicht automatisch tödlich');
});

test('Physik meldet den Aufprall, Feder und Wasser nicht', () => {
  const world = top => { const g = (x, y, z) => (y <= 10 ? (y === 10 ? top : B.STONE) : B.AIR); return { getBlock: g, isSolid: (x, y, z) => g(x, y, z) !== B.AIR }; };
  const drop = (w, h) => {
    const p = new Player(); p.x = 0.5; p.z = 0.5; p.y = 11 + h;
    for (let i = 0; i < 240 && !p.impact; i++) p.update(w, 1 / 60, { f: 0, r: 0, jump: false }, 0);
    return p.impact;
  };
  const imp = drop(world(B.STONE), 10);
  assert.ok(Math.abs(imp - Math.sqrt(2 * 28 * 10)) < 1.2, 'Aufprall ' + imp);
  assert.equal(drop(world(B.FEDER), 10), 0);
});

test('Hunger sinkt mit der Zeit, Rennen kostet mehr', () => {
  const a = new Vitals(), b = new Vitals();
  for (let i = 0; i < 600; i++) { a.tick(0.1, { moving: false }); b.tick(0.1, { moving: true, sprint: true }); }
  assert.ok(a.food < MAX_FOOD && b.food < a.food, `${a.food} / ${b.food}`);
  assert.equal(a.hp, MAX_HP);
});

test('Erholung bei vollem Magen, Hunger zehrt nur bis ½ Herz', () => {
  const v = new Vitals({ hp: 10, food: 20 });
  for (let i = 0; i < 100; i++) v.tick(0.1, {});
  assert.ok(v.hp > 10);
  const s = new Vitals({ hp: 4, food: 0 });
  for (let i = 0; i < 2000; i++) s.tick(0.1, {});
  assert.equal(s.hp, 1);
  assert.equal(s.dead, false);
});

test('Ertrinken: erst Luft, dann Schaden; an der Luft füllt sie sich wieder', () => {
  const v = new Vitals();
  for (let i = 0; i < 90; i++) v.tick(0.1, { eyeWater: true });
  assert.equal(v.hp, MAX_HP, 'nach 9 s noch kein Schaden');
  for (let i = 0; i < 40; i++) v.tick(0.1, { eyeWater: true });
  assert.ok(v.hp < MAX_HP);
  for (let i = 0; i < 40; i++) v.tick(0.1, {});
  assert.equal(v.air, MAX_AIR);
});

test('Essen: satt = kein Verbrauch, Spielstand-Werte werden geprüft', () => {
  const v = new Vitals({ food: 18 });
  assert.equal(v.eat(4), true); assert.equal(v.food, 20);
  assert.equal(v.eat(4), false);
  const bad = new Vitals({ hp: 'x', food: -5, air: 99 });
  assert.deepEqual([bad.hp, bad.food, bad.air], [MAX_HP, 0, MAX_AIR]);
  assert.equal(new Vitals({ hp: 0 }).hp, MAX_HP, 'nie tot laden');
  assert.equal(new Vitals().hurt(25, 'Sturz'), true);
});

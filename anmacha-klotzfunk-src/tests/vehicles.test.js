import test from 'node:test';
import assert from 'node:assert/strict';
import { B } from '../src/blocks.js';
import { I, vehicleOf } from '../src/items.js';
import { RECIPES } from '../src/crafting.js';
import { Vehicles, MAX_VEH } from '../src/vehicles.js';

// kleine Testwelt: Map statt Chunks, alles außerhalb ist Luft, y < 0 fest
function flatWorld() {
  const m = new Map(), k = (x, y, z) => x + ',' + y + ',' + z;
  return {
    m, set(x, y, z, t) { m.set(k(x, y, z), t); },
    getBlock(x, y, z) { return y < 0 ? B.STONE : m.get(k(x, y, z)) || B.AIR; },
    isSolid(x, y, z) { const t = this.getBlock(x, y, z); return t !== B.AIR && t !== B.WATER && t !== B.RAIL; }
  };
}
const run = (vs, sec, v, inp) => { for (let i = 0; i < sec * 60; i++) vs.update(1 / 60, v, inp); };

test('Fahrzeug-Gegenstände und Rezepte', () => {
  assert.equal(vehicleOf(I.BOAT), 'boot');
  assert.equal(vehicleOf(I.MINECART), 'lore');
  assert.equal(vehicleOf(I.APPLE), null);
  for (const id of [I.BOAT, I.MINECART, B.RAIL]) assert.ok(RECIPES.some(r => r.give[0] === id && r.st === 'werkbank'));
});

test('Boot schwimmt, fährt, lenkt und stoppt an der Wand', () => {
  const w = flatWorld();
  for (let x = -20; x <= 20; x++) for (let z = -20; z <= 20; z++) { w.set(x, 0, z, B.STONE); w.set(x, 1, z, B.WATER); w.set(x, 2, z, B.WATER); }
  for (let z = -20; z <= 20; z++) for (let y = 1; y <= 4; y++) w.set(15, y, z, B.STONE); // Ufermauer bei x = 15
  const vs = new Vehicles(w), v = vs.add('boot', 0.5, 3, 0.5, 0);
  run(vs, 2, null, null);
  assert.ok(Math.abs(v.y - (3 - 0.12 - 0.3)) < 0.1, 'liegt auf der Wasseroberfläche: ' + v.y);
  run(vs, 2, v, { f: 1, r: 0 });
  assert.ok(v.z < -6, 'fährt geradeaus (−Z): ' + v.z);
  const yaw0 = v.yaw;
  run(vs, 0.5, v, { f: 0, r: 1 });
  assert.ok(v.yaw < yaw0, 'rechts lenken dreht');
  v.yaw = -Math.PI / 2; v.x = 10; v.z = 0; // Richtung +X auf die Mauer zu
  run(vs, 4, v, { f: 1, r: 0 });
  assert.ok(v.x + v.K.half <= 15 + 1e-6, 'nicht durch die Mauer: ' + v.x);
  const x = v.x; run(vs, 3, null, null);
  assert.ok(Math.abs(v.x - x) < 0.5, 'treibt ohne Fahrer aus');
});

test('Boot an Land ist langsam', () => {
  const w = flatWorld();
  for (let x = -10; x <= 10; x++) for (let z = -30; z <= 10; z++) w.set(x, 0, z, B.GRASS);
  const vs = new Vehicles(w), v = vs.add('boot', 0.5, 1.5, 0.5, 0);
  run(vs, 3, v, { f: 1, r: 0 });
  assert.ok(Math.abs(v.y - 1) < 0.05, 'liegt auf dem Boden');
  assert.ok(v.z > -4.5, 'kommt an Land kaum voran: ' + v.z);
});

test('Lore folgt Schienen: gerade, Kurve, Steigung, Ende', () => {
  const w = flatWorld();
  for (let x = -5; x <= 30; x++) for (let z = -5; z <= 30; z++) w.set(x, 0, z, B.STONE);
  for (let x = 0; x <= 10; x++) w.set(x, 1, 0, B.RAIL);       // gerade nach +X
  for (let z = 1; z <= 6; z++) w.set(10, 1, z, B.RAIL);       // Kurve nach +Z
  w.set(10, 1, 7, B.STONE); w.set(10, 2, 7, B.RAIL);           // eine Stufe hoch
  for (let z = 8; z <= 12; z++) { w.set(10, 1, z, B.STONE); w.set(10, 2, z, B.RAIL); }
  const vs = new Vehicles(w);
  assert.equal(vs.add('lore', 5, 3, 5, 0), null, 'ohne Schiene keine Lore');
  const v = vs.add('lore', 0.5, 1, 0.5, -Math.PI / 2); // Blick +X
  assert.ok(v && v.rail);
  run(vs, 8, v, { f: 1, r: 0, look: [1, 0] });
  assert.equal(v.rail.x, 10);
  assert.equal(v.rail.z, 12, 'bis zum Ende gefahren, auch über die Stufe');
  assert.equal(v.rail.y, 2);
  assert.equal(v.speed, 0, 'hält am Ende an');
  // zurück: in Gegenrichtung schauen und anschieben
  run(vs, 2, v, { f: 1, r: 0, look: [0, -1] });
  assert.ok(v.rail.z < 12, 'fährt zurück');
});

test('Lore entgleist, wenn die Schiene fehlt; Speichern und Laden', () => {
  const w = flatWorld();
  for (let x = 0; x <= 5; x++) { w.set(x, 0, 0, B.STONE); w.set(x, 1, 0, B.RAIL); }
  const vs = new Vehicles(w), v = vs.add('lore', 2.5, 1, 0.5, -Math.PI / 2);
  w.set(2, 1, 0, B.AIR);
  run(vs, 1, null, null);
  assert.equal(v.rail, null);
  assert.ok(Math.abs(v.y - 1) < 0.05, 'liegt auf dem Boden');
  vs.add('boot', 9, 9, 9, 1);
  const data = JSON.parse(JSON.stringify(vs.serialize()));
  const back = new Vehicles(w, [...data, ['ufo', 1, 2, 3, 0], ['boot', 'x', 1, 1, 0], null]);
  assert.equal(back.list.length, 2, 'ungültige Einträge werden ignoriert');
  assert.equal(back.list[1].kind, 'boot');
});

test('Höchstzahl, Treffer-Strahl, Aussteigen', () => {
  const w = flatWorld();
  const vs = new Vehicles(w);
  for (let i = 0; i < MAX_VEH + 5; i++) vs.add('boot', i * 3, 1, 0, 0);
  assert.equal(vs.list.length, MAX_VEH);
  const hit = vs.raycast(0, 1.3, 5, 0, 0, -1, 6);
  assert.ok(hit && hit.veh === vs.list[0]);
  assert.equal(vs.raycast(0, 5, 5, 0, 0, -1, 6), null);
  const spot = vs.exitSpot(vs.list[0], () => false);
  assert.ok(spot[1] > vs.list[0].y);
});

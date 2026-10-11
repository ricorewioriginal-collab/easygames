// Tiere: feste Erstbesiedlung, Physik, Treffer, Aktivbereich und Speicherung je Chunk.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/world.js';
import { B } from '../src/blocks.js';
import { Mobs, Mob, MOB_TYPES, rayBox, rollDrops, ACTIVE_R } from '../src/mobs.js';

function loaded(seed, r = ACTIVE_R + 1) {
  const w = new World(seed, new Map(), 2);
  for (let z = -r; z <= r; z++) for (let x = -r; x <= r; x++) w.ensure(x, z);
  return w;
}
const seeded = s => () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;

test('Erstbesiedlung ist fest: gleicher Startwert, gleiche Tiere', () => {
  const a = new Mobs(loaded(12345), 12345, null), b = new Mobs(loaded(12345), 12345, null);
  a.refresh(8, 8); b.refresh(8, 8);
  assert.ok(a.list.length > 0, 'es gibt Tiere');
  assert.deepEqual(a.list.map(m => m.record()), b.list.map(m => m.record()));
  for (const m of a.list) {
    const below = a.world.getBlock(Math.floor(m.x), Math.floor(m.y) - 1, Math.floor(m.z));
    assert.ok([B.GRASS, B.FLOWERS, B.SNOW, B.MYCEL].includes(below), 'steht auf Wiese/Schnee');
  }
});

test('Tiere fallen nicht durch den Boden und bleiben in der Nähe', () => {
  const w = loaded(12345), mobs = new Mobs(w, 12345, null);
  mobs.rnd = seeded(7); mobs.refresh(8, 8);
  const start = mobs.list.map(m => [m.x, m.z]);
  for (let i = 0; i < 60 * 30; i++) mobs.update(1 / 60, 8, 8);
  assert.ok(mobs.list.length > 0);
  for (const m of mobs.list) {
    assert.ok(!m.collides(w, m.x, m.y, m.z), 'steckt nicht im Block');
    assert.ok(m.y > 0 && m.y < 96);
  }
  const moved = mobs.list.some((m, i) => start[i] && Math.hypot(m.x - start[i][0], m.z - start[i][1]) > 0.5);
  assert.ok(moved, 'Tiere bewegen sich');
});

test('Speichern und Laden: erlegte Tiere kommen nicht wieder', () => {
  const w = loaded(12345), mobs = new Mobs(w, 12345, null);
  mobs.refresh(8, 8);
  const n = mobs.list.length, victim = mobs.list[0];
  assert.equal(victim.hit(99, victim.x + 1, victim.z), true);
  mobs.remove(victim, false);
  const saved = JSON.parse(JSON.stringify(mobs.serialize()));
  const again = new Mobs(loaded(12345), 12345, saved);
  again.refresh(8, 8);
  assert.equal(again.list.length, n - 1);
});

test('Aktivbereich: entfernte Tiere werden abgelegt und später wieder geweckt', () => {
  const w = loaded(12345, 12), mobs = new Mobs(w, 12345, null);
  mobs.refresh(8, 8);
  const n = mobs.list.length;
  mobs.refresh(8 + 16 * 10, 8); // weit weg
  assert.ok(mobs.list.every(m => Math.abs(m.x - (8 + 160)) < 16 * (ACTIVE_R + 1.5)), 'nur Tiere in der Nähe aktiv');
  mobs.refresh(8, 8);
  const back = mobs.list.filter(m => Math.abs(m.x - 8) < 16 * (ACTIVE_R + 1)).length;
  assert.equal(back, n);
});

test('Nicht geladener Bereich: Tier friert ein', () => {
  const w = new World(1, new Map(), 2), m = new Mob(0, 100.5, 40, 100.5);
  m.update(w, 0.1, () => 0.5, 0, 0);
  assert.deepEqual([m.x, m.y, m.z], [100.5, 40, 100.5]);
});

test('Treffer-Strahl und Beute', () => {
  assert.ok(Math.abs(rayBox(0, 0.5, 0, 0, 0, -1, -0.5, 0, -3.5, 0.5, 1, -2.5) - 2.5) < 1e-9);
  assert.equal(rayBox(0, 0.5, 0, 0, 0, 1, -0.5, 0, -3.5, 0.5, 1, -2.5), Infinity);
  for (let t = 0; t < MOB_TYPES.length; t++) for (const [id, n] of rollDrops(t, () => 0.99)) assert.ok(n >= 1 && id > 0);
  assert.deepEqual(rollDrops(1, () => 0).map(d => d[1]), [1, 1]);
});

test('Ungültige Einträge im Spielstand werden verworfen', () => {
  const mobs = new Mobs(loaded(5), 5, { abc: [[0, 1, 2, 3, 3]], 2147516416: [[9, 0, 0, 0, 1], [0, 'x', 0, 0, 1], [1, 5, 40, 5, 3]] });
  assert.equal(mobs.store.size, 1);
  assert.equal([...mobs.store.values()][0].length, 1);
});

test('Gegner: verfolgen nur mit freier Sicht und greifen in Reichweite an', async () => {
  const { lineOfSight } = await import('../src/mobs.js');
  const g = (x, y, z) => (y <= 10 ? B.STONE : x === 5 && y <= 14 ? B.STONE : B.AIR);
  const w = { getBlock: g, isSolid: (x, y, z) => g(x, y, z) !== B.AIR, isLoaded: () => true };
  assert.equal(lineOfSight(w, 0.5, 12.5, 0.5, 9.5, 12.5, 0.5), false, 'Wand verdeckt');
  assert.equal(lineOfSight(w, 0.5, 12.5, 0.5, 4.2, 12.5, 0.5), true);
  // hinter der Wand: bleibt unbeteiligt
  const hidden = new Mob(3, 9.5, 11, 0.5);
  for (let i = 0; i < 120; i++) hidden.update(w, 1 / 60, () => 0.99, 0.5, 0.5, 11);
  assert.equal(hidden.sees, false);
  // freie Sicht: läuft heran und greift an
  const m = new Mob(3, 4.0, 11, 8.5);
  let hits = 0;
  for (let i = 0; i < 60 * 8; i++) { m.update(w, 1 / 60, () => 0.5, 2.5, 3.5, 11); if (m.attack) { hits++; m.attack = false; } }
  assert.ok(m.sees);
  assert.ok(Math.hypot(m.x - 2.5, m.z - 3.5) < 1.6, 'ist herangekommen');
  assert.ok(hits >= 3 && hits <= 8, 'greift etwa einmal je Sekunde an: ' + hits);
});

test('Gegner erscheinen nur nachts oder tief unten und werden nicht gespeichert', () => {
  const w = loaded(12345), mobs = new Mobs(w, 12345, null);
  mobs.rnd = seeded(3);
  let day = 0, night = 0;
  for (let i = 0; i < 30; i++) { if (mobs.spawnHostile(8, 40, 8, false)) day++; }
  for (let i = 0; i < 30; i++) { if (mobs.spawnHostile(8, 40, 8, true)) night++; }
  assert.equal(day, 0, 'tagsüber an der Oberfläche keine');
  assert.ok(night > 0 && mobs.hostileCount() <= 4, 'nachts höchstens 4');
  const saved = mobs.serialize();
  assert.ok(Object.values(saved).every(a => a.every(r => !MOB_TYPES[r[0]].hostile)));
  // Tagesanbruch: Gegner an der Oberfläche verschwinden
  mobs.update(1.1, 8, 8, { py: 40, night: false, hostiles: true });
  assert.equal(mobs.hostileCount(), 0);
});

test('Erstbesiedlung bringt nur Tiere, nie Gegner oder Dorfbewohner', async () => {
  const { ANIMALS } = await import('../src/mobs.js');
  const w = loaded(12345, 6), mobs = new Mobs(w, 12345, null);
  let n = 0;
  for (let z = -6; z <= 6; z++) for (let x = -6; x <= 6; x++) for (const r of mobs.spawnRecords(x, z) || []) { n++; assert.ok(r[0] < ANIMALS); }
  assert.ok(n > 0);
});

test('Dorfbewohner: Tagesablauf, nicht angreifbar, nicht gespeichert', async () => {
  const { npcPhase, T_NPC } = await import('../src/mobs.js');
  const { nearestVillage } = await import('../src/structures.js');
  assert.equal(npcPhase(0.1), 'work'); assert.equal(npcPhase(0.25), 'plaza'); assert.equal(npcPhase(0.7), 'home');
  const v = nearestVillage(12345), w = new World(12345, null, 3);
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) w.ensure((v.x >> 4) + dx, (v.z >> 4) + dz);
  const mobs = new Mobs(w, 12345, null);
  mobs.findVillages = () => [v]; mobs.rnd = seeded(5);
  mobs.update(0.01, v.x, v.z, { py: v.y + 1, time: 0.1 });
  const npcs = mobs.list.filter(m => m.npc);
  assert.equal(npcs.length, v.houses.length, 'ein Bewohner je Haus');
  assert.equal(npcs[0].type, T_NPC);
  assert.equal(npcs[0].hit(99, v.x, v.z), false); assert.equal(npcs[0].hp, MOB_TYPES[T_NPC].hp);
  // abends nach Hause: alle erreichen ihr Haus (notfalls über Wegpunkte)
  for (let i = 0; i < 60 * 40; i++) mobs.update(1 / 60, v.x, v.z, { py: v.y + 1, time: 0.6 });
  for (const m of npcs) assert.ok(Math.hypot(m.x - m.home.x, m.z - m.home.z) < 2.6, `${m.name} ist zu Hause`);
  assert.ok(Object.values(mobs.serialize()).every(a => a.every(r => r[0] !== T_NPC)));
  // weit weg: Bewohner verschwinden, beim Zurückkommen wieder da
  mobs.refresh(v.x + 300, v.z);
  assert.equal(mobs.list.filter(m => m.npc).length, 0);
  mobs.refresh(v.x, v.z);
  assert.equal(mobs.list.filter(m => m.npc).length, v.houses.length);
});

test('Drohne schwebt und feuert aus Abstand, Höhlenwesen nur in Höhlen', async () => {
  const { T_DROHNE, T_HOEHLE } = await import('../src/mobs.js');
  const g = (x, y, z) => (y <= 10 ? B.STONE : B.AIR);
  const w = { getBlock: g, isSolid: (x, y, z) => g(x, y, z) !== B.AIR, isLoaded: () => true };
  const d = new Mob(T_DROHNE, 10.5, 16, 0.5);
  let shots = 0;
  for (let i = 0; i < 60 * 6; i++) { d.update(w, 1 / 60, () => 0.5, 0.5, 0.5, 11); if (d.attack) { shots++; d.attack = false; } }
  assert.ok(d.y > 12, 'fällt nicht herunter');
  assert.ok(shots >= 2 && shots <= 4, 'Störimpuls etwa alle 2 s: ' + shots);
  const ww = loaded(12345), mobs = new Mobs(ww, 12345, null);
  mobs.rnd = seeded(9);
  for (let i = 0; i < 40; i++) mobs.spawnHostile(8, 40, 8, true);
  assert.ok(mobs.list.every(m => m.type !== T_HOEHLE), 'an der Oberfläche keine Höhlenwesen');
});

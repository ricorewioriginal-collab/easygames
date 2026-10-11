// Speichern: alte Spielstände, kompakte Änderungen, Sicherung, voller Speicher, Export/Import.
import test from 'node:test';
import assert from 'node:assert/strict';

class MemStorage {
  constructor(limit = Infinity) { this.m = new Map(); this.limit = limit; }
  get size() { let n = 0; for (const [k, v] of this.m) n += k.length + v.length; return n; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) {
    const old = this.m.get(k);
    const next = this.size - (old ? k.length + old.length : 0) + k.length + String(v).length;
    if (next > this.limit) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
    this.m.set(k, String(v));
  }
  removeItem(k) { this.m.delete(k); }
}
globalThis.localStorage = new MemStorage();
const S = await import('../src/storage.js');
const { World } = await import('../src/world.js');
const { B } = await import('../src/blocks.js');

const v1Save = () => ({ v: 1, name: 'Alt', seed: 4711, mode: 'survival', time: 0.3, savedAt: 1, px: 1, py: 40, pz: 2, yaw: 0, pitch: 0,
  hotbar: [1, 2, 3, 4, 5, 6, 7, 8, 9], sel: 0, inv: { 2: 20 }, wp: null, story: null, edits: { [String((32768) * 65536 + 32768)]: [5, 7, 300, 36] } });

test('Format 1 (Version 1.0) wird gelesen', () => {
  const e = S.decodeEdits(v1Save().edits);
  const m = e.get(32768 * 65536 + 32768);
  assert.equal(m.get(5), 7); assert.equal(m.get(300), 36);
  assert.ok(S.validSave(v1Save()));
});

test('Kompaktes Format: Hin- und Rückweg verlustfrei, kleiner als Format 1', () => {
  const edits = new Map();
  for (let k = 0; k < 20; k++) { const m = new Map(); for (let i = 0; i < 500; i++) m.set((i * 49 + k) % 24576, (i % 57) + 1); edits.set(1000 + k, m); }
  const enc = S.encodeEdits(edits), dec = S.decodeEdits(JSON.parse(JSON.stringify(enc)));
  assert.equal(dec.size, edits.size);
  for (const [k, m] of edits) assert.deepEqual([...dec.get(k)].sort((a, b) => a[0] - b[0]), [...m].sort((a, b) => a[0] - b[0]));
  const v1 = {}; for (const [k, m] of edits) { const a = []; for (const [i, t] of m) a.push(i, t); v1[k] = a; }
  assert.ok(JSON.stringify(enc).length < JSON.stringify(v1).length * 0.7);
});

test('Gespeicherte Welt lädt mit denselben Änderungen', () => {
  const w = new World(4711, new Map(), 2);
  w.ensure(0, 0); w.setBlock(3, 70, 4, B.MARBLE); w.setBlock(0, 1, 0, B.AIR);
  const dec = S.decodeEdits(JSON.parse(JSON.stringify(S.encodeEdits(w.edits))));
  const w2 = new World(4711, dec, 2);
  w2.ensure(0, 0);
  assert.equal(w2.getBlock(3, 70, 4), B.MARBLE); assert.equal(w2.getBlock(0, 1, 0), B.AIR);
});

test('Schreiben, Lesen, Menüinfo und Sicherung', () => {
  globalThis.localStorage = new MemStorage();
  const s = v1Save();
  assert.ok(S.writeWorld(0, s));
  assert.equal(S.readWorld(0).name, 'Alt');
  assert.deepEqual(S.readMeta(0).gen, 1);
  assert.equal(S.hasBackup(0), false, 'erste Speicherung braucht keine Sicherung');
  s.name = 'Neu'; assert.ok(S.writeWorld(0, s));
  assert.equal(S.readBackup(0).name, 'Alt', 'vorheriger Stand ist gesichert');
  s.name = 'Neuer'; assert.ok(S.writeWorld(0, s));
  assert.equal(S.readBackup(0).name, 'Alt', 'Sicherung wird nicht bei jedem Speichern überschrieben');
  assert.ok(S.restoreBackup(0));
  assert.equal(S.readWorld(0).name, 'Alt'); assert.equal(S.readBackup(0).name, 'Neuer');
  assert.equal(S.readMeta(0).name, 'Alt');
  S.deleteWorld(0);
  assert.equal(S.readWorld(0), null); assert.equal(S.hasBackup(0), false);
});

test('Voller Speicher: alter Stand bleibt erhalten, Sicherungen weichen dem Hauptstand', () => {
  const st = new MemStorage(3000); globalThis.localStorage = st;
  const s = v1Save();
  assert.ok(S.writeWorld(1, s));
  const big = { ...s, name: 'Riesig', pad: 'x'.repeat(5000) };
  assert.equal(S.writeWorld(1, big), false);
  assert.equal(S.readWorld(1).name, 'Alt', 'misslungenes Speichern zerstört nichts');
  // Sicherung von Platz 2 belegt Platz; sie wird geopfert, damit Platz 1 speichern kann
  st.setItem('klotzfunk-bak.world.2', JSON.stringify({ ...s, pad: 'y'.repeat(1200) }));
  const mid = { ...s, name: 'Mittel', pad: 'z'.repeat(1300) }; // passt nur ohne die fremde Sicherung
  assert.ok(S.writeWorld(1, mid));
  assert.equal(S.readWorld(1).name, 'Mittel');
  assert.equal(st.getItem('klotzfunk-bak.world.2'), null);
});

test('Beschädigter Spielstand wird nicht als gültig gelesen', () => {
  globalThis.localStorage = new MemStorage();
  localStorage.setItem('klotzfunk.world.0', '{"name":"kaputt", "seed": ');
  assert.equal(S.readWorld(0), null);
  localStorage.setItem('klotzfunk.world.0', JSON.stringify({ name: 'x', seed: 'abc', mode: 'survival' }));
  assert.equal(S.readWorld(0), null);
});

test('Export und Import', () => {
  globalThis.localStorage = new MemStorage();
  const s = v1Save();
  const back = S.importText(S.exportText(s));
  assert.deepEqual(back, s);
  assert.deepEqual(S.importText(JSON.stringify(s)), s, 'nackter Spielstand geht auch');
  assert.equal(S.importText('{"format":"klotzfunk-world","save":{"name":"x"}}'), null);
  assert.equal(S.importText('kein json'), null);
  assert.equal(S.freeSlot(), 0);
  S.writeWorld(0, s); assert.equal(S.freeSlot(), 1);
});

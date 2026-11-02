'use strict';
// node --test funk-survivor/tests/*.test.js
const test = require('node:test'), assert = require('node:assert');
const FS = require('../js/core.js');

// Einfacher Bot: läuft von Gegnern weg, weicht aus, wählt zufällige Verbesserungen
function bot(W, seedMul) {
  const P = W.P; let ax = 0, az = 0;
  for (const e of W.en) { const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz); if (d < 7 && d > 0) { ax += dx / d / (d * .5 + .5); az += dz / d / (d * .5 + .5); } }
  for (const b of W.eb) { const dx = P.x - b.x, dz = P.z - b.z, d = Math.hypot(dx, dz); if (d < 4 && d > 0) { ax += dx / d * 2; az += dz / d * 2; } }
  const d0 = Math.hypot(P.x, P.z); if (d0 > 40) { ax -= P.x / d0 * 2; az -= P.z / d0 * 2; }
  let g = null, bd = 1e9; for (const q of W.gems) { const d = Math.hypot(q.x - P.x, q.z - P.z); if (d < bd) { bd = d; g = q; } }
  if (g && bd < 9) { ax += (g.x - P.x) / bd * .6; az += (g.z - P.z) / bd * .6; }
  return { mx: ax, mz: az, dash: Math.hypot(ax, az) > 2.2 };
}
function play(opts, maxT) {
  const W = FS.create(opts); let guard = 0;
  while (W.state !== 'dead' && W.t < maxT && guard++ < 200000) {
    if (W.state === 'won') FS.continueRun(W);
    if (W.choice) { FS.choose(W, (W.R() * W.choice.length) | 0); continue; }
    FS.step(W, 1 / 30, bot(W)); FS.drain(W);
  }
  return W;
}

test('Welt wird erzeugt, Held und Startwaffe stimmen', () => {
  const W = FS.create({ seed: 1, hero: 'mia' });
  assert.equal(W.weapons[0].id, 'welle'); assert.ok(W.P.maxHp > 0 && W.P.hp === W.P.maxHp); assert.equal(W.state, 'play');
});
test('Gleicher Startwert ergibt gleichen Ablauf (Tagesrunde)', () => {
  const a = play({ seed: 77, hero: 'rico' }, 60), b = play({ seed: 77, hero: 'rico' }, 60);
  assert.equal(a.kills, b.kills); assert.equal(a.lv, b.lv); assert.equal(a.en.length, b.en.length);
});
test('Jeder Held spielt 3 Minuten ohne Fehler, Zahlen bleiben sauber', () => {
  for (const h of FS.HEROES) {
    const W = play({ seed: 5, hero: h.id, diff: 'normal' }, 180);
    for (const k of ['x', 'z', 'hp']) assert.ok(Number.isFinite(W.P[k]), h.id + ' ' + k);
    assert.ok(W.kills > 20, h.id + ' tötet etwas');
    assert.ok(W.en.length <= 330, 'Gegnerzahl begrenzt');
    for (const e of W.en) assert.ok(Number.isFinite(e.x) && Number.isFinite(e.z) && Number.isFinite(e.hp));
  }
});
test('Level-Aufstieg bietet 3–4 verschiedene Optionen und wendet sie an', () => {
  const W = FS.create({ seed: 3, hero: 'rico' }); W.xp = W.need; FS.step(W, .016, {});
  // Erfahrung wird beim Einsammeln vergeben: direkt prüfen
  const W2 = FS.create({ seed: 3 }); W2.gems.push({ x: 0, z: 0, v: 500, mag: true, vx: 0, vz: 0, ph: 0 }); FS.step(W2, .02, {});
  assert.ok(W2.choice && W2.choice.length >= 3, 'Auswahl offen'); const ids = new Set(W2.choice.map(c => c.kind + c.id)); assert.equal(ids.size, W2.choice.length);
  const t0 = W2.t; FS.step(W2, .02, {}); assert.equal(W2.t, t0, 'Spiel steht während der Auswahl');
  const before = W2.weapons.length + Object.keys(W2.passives).length; FS.choose(W2, 0);
  assert.ok(W2.lv > 1);
  if (!W2.choice) assert.ok(W2.weapons.length + Object.keys(W2.passives).length >= before);
});
test('Neu würfeln verbraucht einen Versuch', () => {
  const W = FS.create({ seed: 4, meta: { reroll: 1 } }); W.gems.push({ x: 0, z: 0, v: 50, mag: true, vx: 0, vz: 0, ph: 0 }); FS.step(W, .02, {});
  assert.equal(W.rerolls, 2); assert.ok(FS.reroll(W)); assert.equal(W.rerolls, 1);
});
test('Waffen: alle sechs treffen Gegner', () => {
  for (const id of Object.keys(FS.WEAPONS)) {
    const W = FS.create({ seed: 9, hero: 'rico' }); W.weapons = [{ id, lv: 3, cd: 0, ang: 0 }];
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; FS.spawnEnemy(W, 'rausch', Math.cos(a) * 4, Math.sin(a) * 4).spawn = 0; }
    const hp0 = W.en.reduce((s, e) => s + e.hp, 0);
    for (let i = 0; i < 150; i++) { FS.step(W, 1 / 30, {}); FS.drain(W); if (W.state !== 'play') break; if (W.choice) FS.choose(W, 0); }
    const hp1 = W.en.reduce((s, e) => s + e.hp, 0);
    assert.ok(W.kills > 0 || hp1 < hp0, id + ' richtet Schaden an');
  }
});
test('Spielende: Bewertung und Belohnung', () => {
  const W = play({ seed: 11, hero: 'rico', diff: 'hart' }, 400);
  if (W.state !== 'dead') FS.abort(W);
  const s = FS.summary(W); assert.ok(s.score > 0 && s.reward >= 0 && s.time > 0);
});
test('Boss erscheint nach 3 Minuten und hat Lebensleiste', () => {
  const W = FS.create({ seed: 2 }); W.P.hp = W.P.maxHp = 1e9; let seen = null;
  for (let i = 0; i < 30 * 185; i++) { W.P.hp = W.P.maxHp = 1e9; FS.step(W, 1 / 30, {}); for (const e of FS.drain(W)) if (e.k === 'boss') seen = e; if (W.choice) FS.choose(W, 0); }
  assert.ok(seen && seen.type === 'boss1'); assert.ok(W.boss && W.boss.hp > 0);
});
test('Finaler Boss besiegt = Sieg, Zugabe geht weiter', () => {
  const W = FS.create({ seed: 8, hero: 'rico' }); W.P.hp = W.P.maxHp = 1e9; W.bossIdx = 2; W.t = 500; W.bossT = 0;
  FS.step(W, .02, {}); assert.ok(W.boss && W.boss.final);
  FS.hurt(W, W.boss, 1e9, 0, 0, 0, { raw: true }); FS.step(W, .02, {});
  assert.equal(W.won, true); assert.equal(W.state, 'won'); FS.continueRun(W); assert.equal(W.state, 'play');
});
test('Wiederbelebung (Notstrom) rettet einmal', () => {
  const W = FS.create({ seed: 6, meta: { revive: 1 } }); W.P.hp = 1;
  FS.spawnEnemy(W, 'brumm', 0, 0.2).spawn = 0; for (let i = 0; i < 60 && W.state === 'play'; i++) FS.step(W, 1 / 30, {});
  assert.equal(W.revived, true); assert.equal(W.state, 'play'); assert.ok(W.P.hp > 10);
});
test('Verbesserungen verändern die Werte', () => {
  const A = FS.create({ seed: 1 }), B = FS.create({ seed: 1, meta: { hp: 5, dmg: 5, spd: 5 } });
  assert.ok(B.s.maxHp > A.s.maxHp && B.s.dmg > A.s.dmg && B.s.speed > A.s.speed);
});
test('Tagesstrecke: Schlüssel und Startwert', () => {
  const d = new Date(2026, 10, 2); assert.equal(FS.dailySeed(d), 20261102); assert.equal(FS.dailyKey(d), '2026-11-02');
});

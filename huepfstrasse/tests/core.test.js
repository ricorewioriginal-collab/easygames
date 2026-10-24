// Hüpfstraße – Logik-Tests.  node --test huepfstrasse/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const H = require('../js/core.js');
const run = (W, sec) => { for (let k = 0; k < sec * 60; k++) H.step(W, 1 / 60); };
const land = W => { for (let k = 0; k < 30 && W.P.hop; k++) H.step(W, 1 / 60); };
function setRow(W, z, o) { const R = H.row(W, z); Object.assign(R, { trees: new Set(), coins: new Set(), items: [], pads: null, train: null, speed: 0, dir: 1 }, o); return R; }

test('Welt ist pro Seed gleich (Tagesstrecke), Start ist sicher, 13 Figuren mit Rico gratis', () => {
  const a = H.newWorld(42), b = H.newWorld(42), c = H.newWorld(43);
  const sig = W => { const r = []; for (let z = 0; z < 25; z++) { const R = H.row(W, z); r.push(R.type + [...R.trees].join(',') + (R.pads ? [...R.pads].join(',') : '')); } return r.join('|'); };
  assert.strictEqual(sig(a), sig(b)); assert.notStrictEqual(sig(a), sig(c));
  for (let z = 0; z <= 3; z++) { const R = H.row(a, z); assert.strictEqual(R.type, 'grass'); assert.ok(!R.trees.has(0)); }
  assert.strictEqual(H.FIGURES.length, 13); assert.strictEqual(new Set(H.FIGURES.map(f => f.id)).size, 13); assert.strictEqual(H.FIGURES[0].id, 'rico'); assert.strictEqual(H.FIGURES[0].price, 0);
  assert.strictEqual(H.daily(new Date(2026, 9, 24)).seed, H.daily(new Date(2026, 9, 24)).seed);
});

test('Erzeugte Strecke: Wiesen nie zu, aufeinanderfolgende Wiesen haben gemeinsame freie Spalten, alle Arten kommen vor', () => {
  for (const seed of [1, 2, 3, 77, 999]) {
    const W = H.newWorld(seed), kinds = new Set();
    for (let z = 4; z < 400; z++) {
      const R = H.row(W, z), P = H.row(W, z - 1); kinds.add(R.type + (R.pads ? '-pads' : ''));
      if (R.type === 'grass') { assert.ok(R.trees.size <= 4, 'max 4 Bäume'); if (P.type === 'grass') { let s = 0; for (let x = -4; x <= 4; x++) if (!R.trees.has(x) && !P.trees.has(x)) s++; assert.ok(s >= 1, 'gemeinsame Lücke z=' + z); } if (P.pads) assert.ok([...P.pads].some(x => !R.trees.has(x)), 'Seerose führt auf freie Wiese'); }
      if (R.pads) { assert.ok(R.pads.size >= 2); if (P.pads) assert.ok([...R.pads].some(x => P.pads.has(x)), 'Seerosen verbunden'); if (P.type === 'grass') assert.ok([...R.pads].some(x => !P.trees.has(x)), 'Seerose von Wiese erreichbar'); }
      if (R.type === 'road' || (R.type === 'river' && !R.pads)) assert.ok(R.items.length >= 2 && R.speed > 0);
    }
    for (const k of ['grass', 'road', 'river', 'rail']) assert.ok(kinds.has(k), seed + ': ' + k);
  }
});

test('Hüpfen, Bäume blockieren, Rand blockiert, Punkte = weiteste Reihe, Münzen', () => {
  const W = H.newWorld(5); setRow(W, 1, { type: 'grass' }); setRow(W, 2, { type: 'grass', trees: new Set([0]) }); H.row(W, 1).coins.add(0);
  assert.ok(H.hop(W, 'up')); land(W); assert.strictEqual(W.P.z, 1); assert.strictEqual(W.score, 1); assert.strictEqual(W.coins, 1);
  assert.strictEqual(H.hop(W, 'up'), false, 'Baum blockiert'); assert.ok(W.ev.some(e => e.k === 'bump'));
  W.P.x = 4; assert.strictEqual(H.hop(W, 'right'), false, 'Rand blockiert');
  assert.ok(H.hop(W, 'down')); land(W); assert.strictEqual(W.score, 1, 'zurück zählt nicht');
});

test('Auto überfährt; Wasser ohne Stamm = platsch; Stamm trägt mit und am Rand ist Schluss', () => {
  let W = H.newWorld(5); setRow(W, 1, { type: 'road', speed: 3, dir: 1, items: [{ x: -1.2, len: 1.2, kind: 'car' }] });
  H.hop(W, 'up'); run(W, .5); assert.ok(W.P.dead && W.P.dead.how === 'car');
  W = H.newWorld(5); setRow(W, 1, { type: 'river', speed: 1, dir: 1, items: [{ x: 6, len: 2.6, kind: 'log' }] });
  H.hop(W, 'up'); land(W); assert.strictEqual(W.P.dead && W.P.dead.how, 'water');
  W = H.newWorld(5); setRow(W, 1, { type: 'river', speed: 2, dir: 1, items: [{ x: 0, len: 2.6, kind: 'log' }] });
  H.hop(W, 'up'); land(W); assert.ok(!W.P.dead && W.P.log); const x0 = W.P.x; run(W, .5); assert.ok(W.P.x > x0 + .7, 'Stamm trägt');
  run(W, 3); assert.strictEqual(W.P.dead && W.P.dead.how, 'drift');
  W = H.newWorld(5); setRow(W, 1, { type: 'river', pads: new Set([0]) }); H.hop(W, 'up'); land(W); assert.ok(!W.P.dead, 'Seerose trägt');
});

test('Zug: erst Warnung, dann Zug; wer auf dem Gleis steht, wird erwischt', () => {
  const W = H.newWorld(5); const R = setRow(W, 1, { type: 'rail' }); R.train = { x: -99, active: false, wait: 2, warn: 0, period: 5, speed: 26, len: 9, dir: 1, rs: 1 };
  H.hop(W, 'up'); land(W); const ev = [];
  for (let k = 0; k < 200 && !W.P.dead; k++) { H.step(W, 1 / 60); ev.push(...W.ev); W.ev.length = 0; }
  const iw = ev.findIndex(e => e.k === 'warn'), it = ev.findIndex(e => e.k === 'train');
  assert.ok(iw >= 0 && it > iw, 'Warnung vor Zug'); assert.strictEqual(W.P.dead && W.P.dead.how, 'train');
});

test('Kamera schiebt nach – wer stehen bleibt, den holt die Drohne; danach Spielende', () => {
  const W = H.newWorld(9); H.hop(W, 'up'); land(W); H.hop(W, 'down'); land(W);
  run(W, 30); assert.strictEqual(W.P.dead && W.P.dead.how, 'drone'); assert.ok(W.over);
});

function bot(W) {
  const safe = (x, z, look) => { const R = H.row(W, z); if (Math.abs(x) > 4.2) return false; if (R.type === 'grass') return Math.abs(x) <= 4 && !R.trees.has(Math.round(x));
    if (R.type === 'road') return R.items.every(i => Math.abs(H.ringDist(i.x + R.dir * R.speed * look, x)) > i.len / 2 + .9 + R.speed * .12);
    if (R.type === 'rail') return !R.train.active && R.train.wait > 1.6;
    if (R.pads) return R.pads.has(Math.round(x)); return R.items.some(i => Math.abs(H.ringDist(i.x + R.dir * R.speed * .13, x)) < i.len / 2 - .25); };
  const P = W.P, R0 = H.row(W, P.z), N = H.row(W, P.z + 1), here = safe(P.x, P.z, .2);
  const fx = N.type === 'river' && !N.pads ? P.x : Math.round(P.x);
  if (safe(fx, P.z + 1, .15)) return H.hop(W, 'up');
  if (R0.type === 'river' && !R0.pads) { if (Math.abs(P.x) > 2.6) { if (safe(P.x + (P.x > 0 ? -1 : 1), P.z, .13)) return H.hop(W, P.x > 0 ? 'left' : 'right'); if (safe(P.x, P.z - 1, .15)) return H.hop(W, 'down'); } return; }
  if (!here) { for (const d of ['down', 'left', 'right']) { const dx = d === 'left' ? -1 : d === 'right' ? 1 : 0, dz = d === 'down' ? -1 : 0; if (safe(P.x + dx, P.z + dz, .15)) return H.hop(W, d); } return; }
  if (R0.type !== 'river' || R0.pads) {
    let best = null; for (let x = -4; x <= 4; x++) { if (N.type === 'grass' && N.trees.has(x)) continue; if (N.pads && !N.pads.has(x)) continue; if (R0.pads && !R0.pads.has(x)) continue; if (R0.type === 'grass' && R0.trees.has(x)) continue; if (best === null || Math.abs(x - P.x) < Math.abs(best - P.x)) best = x; }
    if (best !== null && best !== P.x && (N.type === 'grass' || N.pads)) { const dx = best > P.x ? 1 : -1; if (safe(P.x + dx, P.z, .2)) return H.hop(W, dx > 0 ? 'right' : 'left'); }
  }
}

test('Bot mit Vorsicht kommt auf mehreren Welten weit (Strecke ist spielbar)', () => {
  let total = 0;
  for (const seed of [11, 12, 13, 14, 15, 16, 17, 18]) {
    const W = H.newWorld(seed);
    for (let k = 0; k < 60 * 180 && !W.P.dead; k++) { if (!W.P.hop && k % 3 === 0) bot(W); H.step(W, 1 / 60); W.ev.length = 0; }
    total += W.score;
  }
  assert.ok(total / 8 >= 25, 'durchschnittlich mindestens 25 Reihen (' + (total / 8).toFixed(1) + ')');
});

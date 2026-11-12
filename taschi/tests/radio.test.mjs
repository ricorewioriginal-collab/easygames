// Abenteurer-Radio: Senderliste, laut.fm-Zeitformat, Titeltext
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATIONS, stationBy, parseLautTime, songText, MAX_GAIN } from '../src/core/radio.js';

test('13 Sender mit Spielname, echtem Namen und laut.fm-Stream', () => {
  assert.equal(STATIONS.length, 13);
  assert.equal(new Set(STATIONS.map(s => s.slug)).size, 13);
  for (const s of STATIONS) { assert.ok(s.title && s.name && s.title !== s.name); assert.equal(s.url, 'https://stream.laut.fm/' + s.slug); }
  assert.equal(stationBy('ricorewi').name, 'RicoReWi Radio');
  assert.equal(stationBy('gibtsnicht'), null);
  assert.ok(MAX_GAIN <= 0.6, 'Radio bleibt leiser als Dialoge');
});

test('laut.fm-Zeit und Titeltext', () => {
  assert.equal(parseLautTime('2026-11-12 18:03:21 +0100'), Date.parse('2026-11-12T17:03:21Z'));
  assert.ok(Number.isNaN(parseLautTime('')));
  assert.equal(songText({ title: 'Lied', artist: { name: 'Band' } }), 'Band – Lied');
  assert.equal(songText({ title: 'Nur Titel' }), 'Nur Titel');
  assert.equal(songText(null), '');
});

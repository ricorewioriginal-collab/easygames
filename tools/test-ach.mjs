#!/usr/bin/env node
// Prüft die Rechenlogik der spielübergreifenden Erfolge (cloud/anmacha-ach.js) ohne Browser.  Aufruf: node tools/test-ach.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const A = createRequire(import.meta.url)('../cloud/anmacha-ach.js');
let n = 0; const ok = t => console.log('PASS ' + t), g = (id, o) => Object.assign({ id, multi: false, played: false, vals: [] }, o);

// Serien
assert.equal(A.streak([]), 0); assert.equal(A.streak([20260101]), 1);
assert.equal(A.streak([20260101, 20260102, 20260103, 20260105]), 3);
assert.equal(A.streak([20251231, 20260101]), 2, 'Jahreswechsel');
assert.equal(A.streak([20260228, 20260301]), 2, 'Monatswechsel (kein Schaltjahr)');
assert.equal(A.streak([20260101, 20260101, 20260102]), 2, 'doppelte Tage zählen einmal');
ok('Serien: Lücken, Jahres-/Monatswechsel, Doppelte');

// Zusammenführen: früheste Zeit gewinnt, Tage vereinigt, Müll wird ignoriert
const m = A.merge({ u: { 'explore:1': 500, 'daily:1': 9 }, g: { a: 5 }, d: [20260102, 20260101], f: { owl: 7 } }, { u: { 'explore:1': 300, 'x:1': 'kaputt' }, g: { b: 6 }, d: [20260103, 5, 'x'], f: {} });
assert.deepEqual(m.u, { 'explore:1': 300, 'daily:1': 9 }); assert.deepEqual(m.g, { a: 5, b: 6 }); assert.deepEqual(m.d, [20260101, 20260102, 20260103]); assert.deepEqual(m.f, { owl: 7 });
assert.deepEqual(A.merge(null, undefined), { u: {}, gu: {}, g: {}, d: [], f: {}, m: 0, v: {} });
assert(A.sameState(m, A.merge(m, {})) && !A.sameState(m, {}));
const m2 = A.merge({ gu: { 'a:x': 50 }, m: 4, v: { a: { stars: 5, time: 90 } } }, { gu: { 'a:x': 20, 'a:y': 9 }, m: 7, v: { a: { stars: 3, time: 60 }, b: { wins: -2 } } });
assert.deepEqual(m2.gu, { 'a:x': 20, 'a:y': 9 }); assert.equal(m2.m, 7); assert.deepEqual(m2.v, { a: { stars: 5, time: 60 } }, 'Zeiten: kleinster, sonst größter Wert; ungültige fallen weg');
ok('Zusammenführen: früheste Zeit, Vereinigung, ungültige Werte, Spiel-Erfolge, Bestwerte');

// Kennzahlen
const games = [g('a', { played: true, multi: true, vals: [{ id: 'stars', v: 12.9 }, { id: 'time', v: 40 }] }), g('b', { vals: [{ id: 'wins', v: 3 }] }), g('c', {}), g('d', { played: true })];
const s = A.statsOf({ games, state: { g: { c: 1 }, d: [20260101, 20260102], f: { early: 1 } }, cloud: true, board: false });
assert.deepEqual([s.played, s.multi, s.bests, s.stars, s.wins, s.times, s.total], [4, 1, 2, 12, 3, 1, 4], 'Spiele zählen über Spielstand, Wert oder Spur');
assert.deepEqual([s.days, s.streak, s.pct, s.owl, s.early, s.weekend, s.cloud, s.board], [2, 2, 100, 0, 1, 0, 1, 0]);
ok('Kennzahlen: gespielt über Spielstand/Wert/Spur, Sterne, Siege, Zeiten, Tage, Flaggen');
{
  const gs = [g('wobbel', { played: true }), g('snake', { played: true }), g('unbekannt', { played: true }), g('quiz', {})];
  const s2 = A.statsOf({ games: gs, state: { d: [20260101, 20260111], m: 4, gu: { 'wobbel:a': 1, 'taschi:b': 2 }, v: { quiz: { stars: 3 } } }, own: { wobbel: { total: 2, done: 2 }, markthalle: { total: 5, done: 1 } }, today: 20260201 });
  assert.equal(s2.genres, 3, 'Kategorien: nur bekannte Spiele, Profilwert zählt'); assert.equal(s2.marathon, 4); assert.equal(s2.age, 31);
  assert.equal(s2.played, 4, 'Wert aus dem Profil zählt als gespielt'); assert.equal(s2.stars, 3);
  assert.equal(s2.ownach, 2 + 1 + 1, 'Spielstand + Profil (taschi) je Spiel die größere Zahl'); assert.equal(s2.allgame, 1);
  ok('Kennzahlen: Kategorien, Alter, Marathon, Spiel-Erfolge, Profilwerte');
}

// Bewertung: Stufen, Fortschritt, neue Freischaltungen (einmalig), Punkte und Rang
let r = A.evaluate({ games: [], state: {} }, 1000);
assert.equal(r.fresh.length, 0); assert.equal(r.rank.name, 'Neuling'); assert.equal(r.done, 0);
const many = Array.from({ length: 12 }, (_, i) => g('g' + i, { played: true, vals: [{ id: 'hi', v: 5 }] }));
r = A.evaluate({ games: many, state: { d: [20260101, 20260102, 20260103] }, cloud: true }, 2000);
const ex = r.items.find(i => i.id === 'explore'), rec = r.items.find(i => i.id === 'records'), st = r.items.find(i => i.id === 'streak');
assert.equal(ex.level, 3); assert.equal(ex.next, 20); assert.equal(ex.pct, Math.round(100 * (12 - 10) / (20 - 10)));
assert.equal(rec.level, 3); assert.equal(st.level, 1);
assert(r.fresh.some(f => f.key === 'explore:3') && r.fresh.some(f => f.key === 'cloud:1'));
assert.equal(r.state.u['explore:1'], 2000);
const r2 = A.evaluate({ games: many, state: r.state, cloud: true }, 9999);
assert.equal(r2.fresh.length, 0, 'zweiter Durchlauf: keine neuen Freischaltungen'); assert.equal(r2.state.u['explore:1'], 2000, 'Zeitpunkt bleibt');
assert(r.rank.pts > 0 && r.rank.index >= 1, 'Rang steigt: ' + JSON.stringify(r.rank));
ok('Bewertung: Stufen, Fortschritt, einmalige Freischaltung, Punkte/Rang');

// Alles freigeschaltet: Rang Legende und Maximalpunkte stimmen mit den Definitionen überein
const ids = [].concat(...Object.values(A.GENRES)), own = {}; ids.slice(0, 6).forEach(i => { own[i] = { total: 4, done: 4 }; }); own[ids[6]] = { total: 100, done: 100 };
const allStats = { games: ids.map(i => g(i, { played: true, multi: true, vals: [{ id: 'stars', v: 10000 }, { id: 'wins', v: 300 }, { id: 'time', v: 5 }] })), own, today: 20270101, state: { d: Array.from({ length: 120 }, (_, i) => { const t = new Date(Date.UTC(2026, 0, 1 + i)); return t.getUTCFullYear() * 10000 + (t.getUTCMonth() + 1) * 100 + t.getUTCDate(); }), m: 12, f: { owl: 1, early: 1, weekend: 1, app: 1, tv: 1, pad: 1 } }, cloud: true, board: true };
const full = A.evaluate(allStats, 1);
assert.equal(full.done, full.total, 'alle Stufen erreichbar (' + full.done + '/' + full.total + ')');
const max = A.DEFS.reduce((t, d) => t + d.thr.reduce((x, _, i) => x + A.PTS[i], 0), 0);
assert.equal(full.rank.pts, max); assert.equal(full.rank.name, A.RANKS[A.RANKS.length - 1][1], 'Maximalpunkte ergeben den höchsten Rang (' + max + ')');
assert.equal(full.items.every(i => i.pct === 100 && i.next === null), true);
ok('Vollausbau: alle ' + full.total + ' Stufen erreichbar, höchster Rang');

// Definitionen: Schwellen steigend, Namen je Stufe, Punkte für jede Stufe
assert.equal(A.GENRE_OF['ricolife'], 'sim'); assert.equal(Object.keys(A.GENRES).length, 7); assert.equal(ids.length, new Set(ids).size, 'Spiel nur in einer Kategorie');
assert.equal(A.RANKS[0][0], 0); assert(A.RANKS.every((r, i) => i === 0 || r[0] > A.RANKS[i - 1][0]), 'Ranggrenzen steigen');
A.DEFS.forEach(d => { assert.equal(d.names.length, d.thr.length, d.id); assert(d.thr.every((t, i) => i === 0 || t > d.thr[i - 1]), d.id + ' steigend'); assert(d.thr.length <= A.PTS.length, d.id + ' Punkte'); assert(d.desc.includes('{n}') || d.thr.length === 1, d.id + ' Text'); });
assert.equal(new Set(A.DEFS.map(d => d.id)).size, A.DEFS.length);
ok('Definitionen: eindeutige IDs, steigende Schwellen, Namen und Punkte je Stufe');

// Abgleich mit dem Profil: Cloud-Stand wird vereinigt und nur bei Änderung zurückgeschrieben
{
  const puts = [];
  const B = (remote) => ({ getUserDoc: async () => remote, putUserDoc: async (name, o) => { puts.push([name, o]); } });
  const remote = { u: { 'explore:1': 100 }, gu: { 'a:b': 3 }, g: { z: 1 }, d: [20260101], f: {}, m: 2, v: { a: { stars: 2 } } };
  const merged = await A.sync(B(remote));
  assert.deepEqual(merged.g, { z: 1 }); assert.equal(puts.length, 0, 'Cloud kennt schon alles -> kein Schreiben');
  const none = await A.sync(B(null));
  assert.equal(puts.length, 1); assert.equal(puts[0][0], 'ach', 'noch nichts in der Cloud -> anlegen');
  const failing = await A.sync({ getUserDoc: async () => ({ u: { 'a:1': 1 } }), putUserDoc: async () => { throw new Error('save'); } });
  assert.deepEqual(failing.u, { 'a:1': 1 }, 'Schreibfehler verliert nichts');
  ok('Abgleich: vereinigt, schreibt nur bei Änderung, überlebt Schreibfehler');
}

#!/usr/bin/env node
// Prüft die reinen Bausteine in cloud/anmacha-engage.js (Statistik-Auswertung, Spiel des Tages, Anfragen) ohne Browser.  Aufruf: node tools/test-engage.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const E = createRequire(import.meta.url)('../cloud/anmacha-engage.js');
const ok = t => console.log('PASS ' + t);
const FS = 'https://firestore.googleapis.com/v1/projects/p1/databases/(default)/documents/';

assert.equal(E.dayNum(new Date(2026, 9, 17)), 20261017); assert.equal(E.dayIndex(20261018) - E.dayIndex(20261017), 1); assert.equal(E.dayIndex(20270101) - E.dayIndex(20261231), 1);
assert.equal(E.cleanGame('Snake 3D!/../x'), 'snake3dx'); ok('Tagesnummer, Tagesabstand über Jahreswechsel, Spielkennung bereinigt');

const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(g => ({ cloud: { game: g } }));
const d1 = E.dailyPick(list, 20261017), d2 = E.dailyPick(list.slice().reverse(), 20261017);
assert.equal(d1.cloud.game, d2.cloud.game, 'Reihenfolge der Liste ist egal (für alle gleich)');
const seen = new Set(); for (let d = 20261001; d < 20261031; d++) seen.add(E.dailyPick(list, d).cloud.game); assert(seen.size >= 5, 'wechselt über die Tage: ' + [...seen]);
assert.equal(E.dailyPick(list, 20261017, g => g.cloud.game === 'c').cloud.game, 'c'); assert.equal(E.dailyPick([], 1), null); assert.equal(E.dailyPick(list, 1, () => false), null);
ok('Spiel des Tages: für alle gleich, wechselt täglich, Filter, leere Liste');

const c = E.statCommit(FS, 'u1', 'snake', 20261017, 12, { s: 2, t: 100, a: 0 }), f = c.writes[0].update.fields;
assert.equal(c.writes[0].update.name, 'projects/p1/databases/(default)/documents/stats/snake_20261017_u1'); assert.deepEqual([f.s.integerValue, f.t.integerValue, f.a.integerValue], ['3', '112', '1'], 'kurze Sitzung zählt als Abbruch');
const big = E.statCommit(FS, 'u1', 'snake', 20261017, 999999).writes[0].update.fields; assert.equal(big.t.integerValue, '3600', 'Dauer wird begrenzt'); assert.equal(E.statCommit(FS, 'u1', 'x', 1, 1).writes[0].update.fields.t.integerValue, '5', 'mindestens 5 s');
ok('Statistik-Schreibvorgang: Kennung mit uid, Zähler addiert, Dauer 5–3600 s, Abbruch unter 20 s');

const rows = [['snake_1_u1', { g: 'snake', s: 3, t: 600, a: 1 }], ['snake_2_u1', { g: 'snake', s: 1, t: 30, a: 0 }], ['snake_1_u2', { g: 'snake', s: 2, t: 120, a: 1 }], ['wobbel_1_u1', { g: 'wobbel', s: 1, t: 60, a: 0 }]].map(([id, f]) => ({ id, f }));
const agg = E.aggregate(rows); assert.deepEqual(agg.map(a => a.g), ['snake', 'wobbel']); const sn = agg[0];
assert.deepEqual([sn.s, sn.t, sn.a, sn.players, sn.days, sn.avg, sn.abort], [6, 750, 2, 2, 3, 125, 33]); assert.deepEqual(E.aggregate([]), []);
ok('Auswertung: Summen, Spieler (aus der Kennung), Ø Dauer, Abbruchquote, Sortierung');

const p = E.profileBody(FS, 'u1', { n: 'Rico', e: '🦊', r: 'Profi', p: 12.7, a: 3, g: 'x'.repeat(500) }).writes[0].update.fields; assert.equal(p.g.stringValue.length, 200); assert.equal(p.p.integerValue, '13');
const inv = E.inviteBody(FS, 'u1', 'Rico', 'u2', 'Snake 3D').writes; assert.equal(inv.length, 2); assert(/invites\/u2\/i\/[a-z0-9]{20}$/.test(inv[0].update.name)); assert.equal(inv[0].update.fields.g.stringValue, 'snake3d'); assert(/invite_last\/u1$/.test(inv[1].update.name));
assert.equal(E.EMOJIS.length, new Set(E.EMOJIS).size); ok('Profil und Einladung: Längen begrenzt, Flutschutz-Dokument, Spielkennung bereinigt, Emoji-Liste eindeutig');

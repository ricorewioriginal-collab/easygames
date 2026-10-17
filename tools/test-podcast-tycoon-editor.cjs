#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: prüft das Schnitteditor-Modell (PT.EditorModel) ohne Browser.
// Bot-Wertungen je Stufe/Format/Seed, Rückgängig/Wiederholen, Determinismus, ungültige Schritte.
//   node tools/test-podcast-tycoon-editor.cjs
'use strict';
const path = require('path');
const dir = path.join(__dirname, '..', 'anmacha-podcast-tycoon', 'src');
global.PT = {};
require(path.join(dir, 'core/util.js'));
try { require(path.join(dir, 'data/rubrics.js')); } catch (e) { /* Rubriken optional */ }
require(path.join(dir, 'ui/editor.js'));
const M = global.PT.EditorModel;
let fails = 0, passes = 0;
const ok = (c, msg) => { if (c) passes++; else { fails++; console.error('FAIL ' + msg); } };
const state = m => JSON.stringify({ c: m.clips, n: m.nextId });
const run = (m, ops) => ops.forEach(op => M.apply(m, op));

ok(typeof M.create === 'function' && typeof M.apply === 'function' && typeof M.score === 'function' && typeof M.bot === 'function', 'Schnittstelle vollständig');
ok(global.PT.Editor && typeof global.PT.Editor.open === 'function', 'PT.Editor.open definiert');

const SEEDS = [7, 99991, 4242, 123456789, 31337];
const FORMATS = ['kurz', 'normal', 'lang'];
const SEGS = [['wenig', 'tec'], ['serious15'], ['tv', 'musik', 'feelgood', 'tec', 'wenig'], ['tec', 'tec', 'feelgood']];
let n = 0;
for (const seed of SEEDS) for (const format of FORMATS) for (let diff = 0; diff <= 2; diff++) {
  const segments = SEGS[n++ % SEGS.length], guest = (seed + diff) % 2 === 0;
  const opts = { seed, difficulty: diff, format, segments, guest, hosts: ['Marco', 'Andrew'] };
  const tag = `[seed ${seed} ${format} d${diff} ${segments.length} Rubr.${guest ? ' Gast' : ''}]`;
  const m0 = M.create(opts);
  // Aufbau
  ok(m0.tracks.length === (guest ? 5 : 4), tag + ' Spurenzahl');
  ok(m0.problems.length >= 5, tag + ' genug Aufgaben (' + m0.problems.length + ')');
  ok(m0.clips.every(c => c.start >= 0 && c.start + c.len <= m0.T), tag + ' Clips liegen in der Zeitleiste');
  const s0 = M.score(m0);
  ok(typeof s0.detail === 'string' && s0.detail.length > 5 && Array.isArray(s0.checks), tag + ' Ergebnisformat');
  ok(s0.checks.filter(c => !c.penalty).reduce((a, c) => a + c.pts, 0) === 100, tag + ' Aufgabenpunkte ergeben 100');
  ok(s0.checks.filter(c => !c.penalty).every(c => !c.ok), tag + ' anfangs keine Aufgabe erledigt');
  // Determinismus
  const m1 = M.create(opts);
  ok(JSON.stringify(m1) === JSON.stringify(m0), tag + ' gleicher Seed = gleiche Folge');
  ok(JSON.stringify(M.create(Object.assign({}, opts, { seed: seed + 1 })).problems.map(p => p.src)) !== JSON.stringify(m0.problems.map(p => p.src)) ||
     JSON.stringify(M.create(Object.assign({}, opts, { seed: seed + 1 })).clips) !== JSON.stringify(m0.clips), tag + ' anderer Seed = andere Folge');
  // Bots
  const score = skill => { const m = M.create(opts); const ops = M.bot(m, skill); run(m, ops); return { s: M.score(m), ops }; };
  const b1 = score(1), b0 = score(0), bh = score(0.5);
  ok(b1.s.score >= 85, tag + ' Bot 1 ≥ 85 (ist ' + b1.s.score + ': ' + b1.s.checks.filter(c => !c.ok).map(c => c.label).join('; ') + ')');
  ok(b0.s.score <= 30 && b0.ops.length === 0, tag + ' Bot 0 ≤ 30 (ist ' + b0.s.score + ')');
  ok(bh.s.score > b0.s.score && bh.s.score < b1.s.score && bh.s.score > 30 && bh.s.score < 85, tag + ' Bot 0,5 dazwischen (ist ' + bh.s.score + ')');
  ok(JSON.stringify(M.bot(M.create(opts), 1)) === JSON.stringify(b1.ops), tag + ' Bot deterministisch');
  // Rückgängig / Wiederholen
  const m = M.create(opts), start = state(m), steps = [];
  for (const op of b1.ops) { steps.push(state(m)); M.apply(m, op); }
  const fin = state(m);
  for (let i = b1.ops.length - 1; i >= 0; i--) { M.apply(m, { t: 'undo' }); if (state(m) !== steps[i]) { ok(false, tag + ' Undo-Schritt ' + i); break; } }
  ok(state(m) === start, tag + ' Undo stellt Anfang her');
  ok(!M.apply(m, { t: 'undo' }).ok, tag + ' Undo am Anfang meldet nichts');
  for (let i = 0; i < b1.ops.length; i++) M.apply(m, { t: 'redo' });
  ok(state(m) === fin, tag + ' Redo stellt Ende her');
  ok(M.score(m).score === b1.s.score, tag + ' gleiche Wertung nach Redo');
  // ungültige Schritte ändern nichts
  const bad = [null, 5, {}, { t: 'nix' }, { t: 'cut' }, { t: 'cut', track: 'marco', from: NaN, to: 3 }, { t: 'cut', track: 'zzz', from: 1, to: 3 },
    { t: 'move', clip: 'x' }, { t: 'move', clip: m.clips[0].id, dt: Infinity }, { t: 'fade', clip: m.clips[0].id, side: 'oben', len: 1 },
    { t: 'gain', clip: m.clips[0].id, db: 'laut' }, { t: 'place', kind: 'jingle', at: 0 }, { t: 'place', kind: 'intro' },
    { t: 'split', track: 'marco', at: -50 }, { t: 'delete', clip: null }, { t: 'swap', a: 0, b: 0 }, { t: 'swap', a: 99, b: 1 },
    { t: '__proto__' }, { t: 'constructor' }, { t: 'toString' }];
  const before = state(m), hl = m.hist.length;
  let threw = false;
  for (const op of bad) { try { const r = M.apply(m, op); if (r.ok) ok(false, tag + ' ungültiger Schritt akzeptiert ' + JSON.stringify(op)); } catch (e) { threw = true; } }
  ok(!threw, tag + ' ungültige Schritte werfen keinen Fehler');
  ok(state(m) === before && m.hist.length === hl, tag + ' ungültige Schritte ändern nichts');
  ok(!M.apply(null, { t: 'undo' }).ok, tag + ' apply(null) sicher');
  // Zufällige Schritte: nichts darf brechen, Wertung bleibt im Bereich
  const mr = M.create(opts), rs = { seed: seed ^ 0xabc };
  let err = false;
  for (let i = 0; i < 120; i++) {
    const c = global.PT.pick(rs, mr.clips), tr = global.PT.pick(rs, mr.tracks).id, t = global.PT.rand(rs) * mr.T;
    const op = global.PT.pick(rs, [
      { t: 'cut', track: tr, from: t, to: t + global.PT.rand(rs) * 4 }, { t: 'split', track: tr, at: t }, { t: 'move', clip: c && c.id, dt: global.PT.rand(rs) * 10 - 5, ripple: global.PT.rand(rs) < 0.5 },
      { t: 'fade', clip: c && c.id, side: 'in', len: 3 }, { t: 'noise', clip: c && c.id }, { t: 'gain', clip: c && c.id, db: 4 }, { t: 'delete', clip: c && c.id },
      { t: 'place', kind: 'outro', at: t }, { t: 'undo' }, { t: 'redo' }, { t: 'swap', a: 0, b: mr.segs.length - 1 }]);
    try { M.apply(mr, op); const s = M.score(mr); if (!(s.score >= 0 && s.score <= 100)) err = true; } catch (e) { err = true; console.error(e); }
  }
  ok(!err && mr.clips.every(c => c.len > 0 && c.start >= 0 && c.start + c.len <= mr.T + 0.01), tag + ' Zufallsschritte robust');
  // Zu viel schneiden kostet Punkte
  const mc = M.create(opts); run(mc, M.bot(mc, 1));
  const sp = mc.clips.find(c => c.kind === 'speech'); M.apply(mc, { t: 'delete', clip: sp.id });
  ok(M.score(mc).score < b1.s.score, tag + ' Löschen guter Aufnahme kostet Punkte');
}
console.log((fails ? 'FEHLER' : 'OK') + ': ' + passes + ' Prüfungen bestanden, ' + fails + ' fehlgeschlagen');
process.exit(fails ? 1 : 0);

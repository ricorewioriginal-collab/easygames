#!/usr/bin/env node
// AnMaCha Podcast Tycoon 3D: prüft alle 24 Minispiele ohne Browser.
// Je Spiel und Schwierigkeit: Bot-Sieg und Bot-Niederlage (READY → PLAYING → WIN/LOSE), Ergebnisformat, Zeichnen ohne Fehler.
//   node tools/test-podcast-tycoon-minigames.cjs [ID …]
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'anmacha-podcast-tycoon', 'src');
global.PT = {};
const load = f => { require(path.join(dir, f)); };
load('core/util.js');
fs.readdirSync(path.join(dir, 'data')).filter(f => f.endsWith('.js')).sort().forEach(f => load('data/' + f));
load('minigames/registry.js');
fs.readdirSync(path.join(dir, 'minigames')).filter(f => /^[a-z]\d\d-.*\.js$/.test(f)).sort().forEach(f => load('minigames/' + f));
const MG = global.PT.MG;
const EXPECT = ['P01', 'P02', 'P03', 'P04', 'T01', 'T02', 'T03', 'T04', 'Q01', 'Q02', 'Q03', 'Q04', 'R01', 'R02', 'R03', 'R04', 'Y01', 'Y02', 'Y03', 'Y04', 'F01', 'F02', 'F03', 'F04'];
const only = process.argv.slice(2);
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.error('FAIL ' + m); } };

// Zeichen-Attrappe: jede Methode/Eigenschaft eines CanvasRenderingContext2D
function fakeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'measureText') return s => ({ width: String(s).length * 9 });
      if (/^create(Linear|Radial|Conic)Gradient$|^createPattern$/.test(k)) return () => grad;
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}

const ids = MG.list().map(d => d.id);
if (!only.length) {
  EXPECT.forEach(id => ok(ids.includes(id), 'Minispiel ' + id + ' fehlt'));
  ok(ids.length === 24, '24 Minispiele erwartet, gefunden ' + ids.length);
}
for (const d of MG.list()) {
  if (only.length && !only.includes(d.id)) continue;
  ok(Array.isArray(d.rules) && d.rules.length >= 2, d.id + ': Regeln fehlen');
  ok(d.controls && d.controls.key && d.controls.touch && d.controls.pad, d.id + ': Steuerung (key/touch/pad) unvollständig');
  // Verständlichkeit: Ziel je Stufe, 2–4 Schritte, Einblendung beim Start
  for (let diff = 0; diff < 3; diff++) { const gl = typeof d.goal === 'function' ? d.goal(diff) : d.goal; ok(typeof gl === 'string' && gl.length > 10 && /\d/.test(gl), d.id + ': Ziel (goal) für Stufe ' + diff + ' fehlt oder ohne Zahl'); }
  ok(Array.isArray(d.how) && d.how.length >= 2 && d.how.length <= 4, d.id + ': „So geht’s“ (how) braucht 2–4 Schritte');
  ok(d.tip && (typeof d.tip === 'string' || (d.tip.key && d.tip.touch)), d.id + ': Einblendung (tip) fehlt');
  ok(d.render === '2d' ? typeof d.draw2d === 'function' : typeof d.setup3d === 'function' && typeof d.draw3d === 'function', d.id + ': Darstellung fehlt');
  for (let diff = 0; diff < 3; diff++) {
    for (const seed of [7, 99991]) {
      for (const goal of ['win', 'lose']) {
        let r;
        try { r = MG.simulate(d.id, { difficulty: diff, seed, players: [{ name: 'A' }, { name: 'B' }] }, goal, 900); }
        catch (e) { ok(false, `${d.id} d${diff} s${seed} ${goal}: Ausnahme ${e.stack}`); continue; }
        const st = r.state, res = r.result;
        ok(st.status === (goal === 'win' ? 'won' : 'lost'), `${d.id} d${diff} s${seed} ${goal}: Status ${st.status} nach ${r.steps} Schritten`);
        ok(res && typeof res.won === 'boolean' && res.won === (goal === 'win'), `${d.id} d${diff} ${goal}: result.won falsch`);
        ok(res && Number.isInteger(res.score) && res.score >= 0 && res.score <= 100, `${d.id} d${diff} ${goal}: score ${res && res.score} nicht 0..100`);
        ok(res && typeof res.detail === 'string' && res.detail.length > 3, `${d.id}: detail fehlt`);
        if (goal === 'win') ok(res.score >= 50, `${d.id} d${diff}: Sieg mit score < 50 (${res.score})`);
        else ok(res.score < 50, `${d.id} d${diff}: Niederlage mit score >= 50 (${res.score})`);
        if (typeof d.draw2d === 'function') { try { d.draw2d(fakeCtx(), st); } catch (e) { ok(false, d.id + ': draw2d wirft ' + e.message); } }
      }
    }
    // Determinismus: gleicher Seed, gleiches Ergebnis
    const a = MG.simulate(d.id, { difficulty: diff, seed: 4242 }, 'win', 900), b = MG.simulate(d.id, { difficulty: diff, seed: 4242 }, 'win', 900);
    ok(a.result.score === b.result.score && a.steps === b.steps, d.id + ': nicht deterministisch');
  }
  // Frischer Zustand zeichnet sich ebenfalls (READY-Bild)
  if (typeof d.draw2d === 'function') { try { d.draw2d(fakeCtx(), d.init({ difficulty: 1, seed: 5, players: [{ name: 'A' }] })); } catch (e) { ok(false, d.id + ': draw2d (Start) wirft ' + e.message); } }
}
console.log(`${fails ? 'FEHLER' : 'OK'}: ${passes} Prüfungen bestanden, ${fails} fehlgeschlagen`);
process.exit(fails ? 1 : 0);

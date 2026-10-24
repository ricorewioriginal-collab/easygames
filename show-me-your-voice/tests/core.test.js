// SHOW ME YOUR VOICE – Logik-Tests.  node --test show-me-your-voice/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const S = require('../js/core.js'), D = S.D;

function raw(acc, extra) {
  const n = 60, p = Math.round(n * acc * 0.7), g = Math.round(n * acc * 0.25), o = Math.round(n * acc * 0.05);
  return Object.assign({ rhythm: { n, p, g, o, m: n - p - g - o, maxCombo: Math.round(n * acc * acc * 0.8) }, pitch: { q: acc * 0.95 },
    show: { hit: Math.round(2 * acc), total: 2 }, rhythmShare: 0.6, approach: 'gefuehl', action: 'publikum' }, extra || {});
}
function playRound(se, prof, acc) {
  const id = S.startRound(se);
  const oc = S.analyze(raw(acc), prof.attrs, se.lastPerf); oc.style = 'pop'; oc.approach = 'gefuehl'; oc.action = 'publikum';
  return S.resolveRound(se, prof, oc, id);
}
function season(acc, seed) {
  const prof = S.newProfile('Test'), se = S.newSeason(seed, 'normal'), log = [];
  while (se.status === 'backstage') log.push(playRound(se, prof, acc));
  return { prof, se, log };
}

test('Daten: 12 Kandidaten inkl. Spieler, 3 Juroren mit Gewichten = 1, mindestens 10 Sprüche je Juror', () => {
  assert.strictEqual(D.CANDIDATES.length + 1, 12);
  D.JURY.forEach(j => {
    assert.ok(Math.abs(Object.values(j.w).reduce((a, b) => a + b, 0) - 1) < 1e-9, j.id);
    const n = ['top', 'yes', 'close', 'no'].reduce((a, k) => a + j.lines[k].length, 0);
    assert.ok(n >= 10, j.id + ' hat nur ' + n + ' Sprüche');
  });
  assert.ok(D.ROUNDS.length >= 4 && D.ROUNDS[D.ROUNDS.length - 1].final);
  D.CANDIDATES.forEach(c => { assert.ok(D.CANDIDATES.some(x => x.id === c.rival)); assert.ok(D.CANDIDATES.some(x => x.id === c.friend)); });
});

test('Bewertung: bessere Leistung ergibt mehr Punkte, Risiko lohnt sich nur bei guter Trefferquote', () => {
  const a = S.analyze(raw(0.5), null, null), b = S.analyze(raw(0.9), null, null);
  assert.ok(b.perf > a.perf + 20);
  const goodRisk = S.analyze(raw(0.9, { approach: 'risiko' }), null, null), goodNorm = S.analyze(raw(0.9), null, null);
  const badRisk = S.analyze(raw(0.5, { approach: 'risiko' }), null, null), badNorm = S.analyze(raw(0.5), null, null);
  assert.ok(goodRisk.perf > goodNorm.perf); assert.ok(badRisk.perf < badNorm.perf);
  S.CK.forEach(k => { assert.ok(b.crit[k] >= 0 && b.crit[k] <= 100, k); });
});

test('Training hilft, entscheidet aber nicht: Fähigkeiten zählen höchstens 15 %', () => {
  const lo = S.analyze(raw(0.6), { timing: 0, stimme: 0, ausdruck: 0, praesenz: 0 }, null);
  const hi = S.analyze(raw(0.6), { timing: 100, stimme: 100, ausdruck: 100, praesenz: 100 }, null);
  assert.ok(hi.crit.timing > lo.crit.timing);
  assert.ok(hi.crit.timing - lo.crit.timing <= 15.01);
  const p = S.newProfile('x'); let total = 0;
  for (let i = 0; i < 40; i++) total += S.applyTraining(p, 'timing', 1);
  assert.ok(p.attrs.timing <= 100 && p.attrs.timing >= 90, 'Timing ' + p.attrs.timing);
  assert.strictEqual(S.applyTraining(p, 'timing', 0), 0);
});

test('Jury entscheidet nachvollziehbar: gleiche Eingaben, gleiches Urteil; Tagesform höchstens ±3', () => {
  const oc = S.analyze(raw(0.8), null, null);
  const j1 = S.judge(oc.crit, 'pop', 42, 0, 'p'), j2 = S.judge(oc.crit, 'pop', 42, 0, 'p');
  assert.deepStrictEqual(j1, j2);
  j1.forEach(v => { assert.ok(Math.abs(v.mood) <= 3); assert.strictEqual(v.yes, v.score >= D.JURY.find(j => j.id === v.id).need); });
  const txt = S.comment('marc', j1[0], oc.crit, 'Kim', 1);
  assert.ok(txt.length > 10 && !/\{/.test(txt));
});

test('Ergebnis wird nur einmal verarbeitet', () => {
  const prof = S.newProfile('A'), se = S.newSeason(7, 'normal');
  const id = S.startRound(se), oc = S.analyze(raw(0.9), prof.attrs, null); oc.style = 'pop';
  assert.strictEqual(S.resolveRound(se, prof, oc, id + 1), null, 'falsche Kennung');
  assert.ok(S.resolveRound(se, prof, oc, id));
  assert.strictEqual(S.resolveRound(se, prof, oc, id), null, 'zweites Mal');
  assert.strictEqual(se.results.length, 1);
});

test('Gute Leistung gewinnt die Staffel, schwache scheidet im Casting aus', () => {
  for (let s = 1; s <= 25; s++) {
    const good = season(0.97, s * 101);
    assert.strictEqual(good.se.status, 'done'); assert.strictEqual(good.se.place, 1);
    assert.ok(good.prof.ach.includes('sieger') && good.prof.ach.includes('talent'));
    const bad = season(0.35, s * 101);
    assert.strictEqual(bad.se.status, 'out'); assert.strictEqual(bad.se.round, 0);
  }
});

test('Staffelablauf: Top-X-Größen, Battle mit Community-Rettung, Finale mit 3 Plätzen', () => {
  const { se, log } = season(0.97, 99);
  const by = id => log.find(r => r.id === id);
  assert.ok(by('recall').advanced.length <= 8);
  assert.strictEqual(by('motto').advanced.length, 6);
  const b = by('battle');
  assert.strictEqual(b.battle.pairs.length, 3); assert.strictEqual(b.advanced.length, 4);
  assert.ok(b.battle.pairs.every(pr => pr.votes.length === 3));
  const losers = b.battle.pairs.map(pr => (pr.winner === pr.a ? pr.b : pr.a));
  assert.ok(losers.includes(b.battle.saved));
  const lv = b.entries.filter(e => losers.includes(e.id)).sort((x, y) => y.votes - x.votes || y.perf - x.perf)[0];
  assert.strictEqual(lv.id, b.battle.saved, 'gerettet wird, wer die meisten Votes hat');
  assert.strictEqual(by('halbfinale').advanced.length, 3);
  assert.strictEqual(by('finale').entries.length, 3);
  assert.strictEqual(se.status, 'done');
});

test('Rangfolge: Gesamt, dann Performance, dann Jury, dann Startnummer', () => {
  const r = S.rank([{ id: 'a', total: 70, perf: 60, juryAvg: 50, startNo: 3 }, { id: 'b', total: 70, perf: 65, juryAvg: 40, startNo: 4 },
    { id: 'c', total: 70, perf: 65, juryAvg: 40, startNo: 1 }, { id: 'd', total: 71, perf: 10, juryAvg: 10, startNo: 9 }]);
  assert.deepStrictEqual(r.map(x => x.id), ['d', 'c', 'b', 'a']);
});

test('Votes: Fans bringen mehr Stimmen; Gesamtformel stimmt', () => {
  const se = S.newSeason(5, 'normal'); se.round = 1; se.field = se.order.slice(0, 10); if (!se.field.includes('p')) se.field[0] = 'p';
  const p1 = S.newProfile('A'), p2 = S.newProfile('B'); p2.fans = 95;
  const r1 = (pr) => { const s = JSON.parse(JSON.stringify(se)); const id = S.startRound(s); const oc = S.analyze(raw(0.8), pr.attrs, null); oc.style = 'pop'; return S.resolveRound(s, pr, oc, id); };
  const a = r1(p1).entries.find(e => e.id === 'p'), b = r1(p2).entries.find(e => e.id === 'p');
  assert.ok(b.votes > a.votes);
  const w = D.ROUNDS[1].w;
  assert.ok(Math.abs(a.total - (w.perf * a.perf + w.jury * a.juryAvg + w.votes * a.votes)) < 0.11);
});

test('Goldenes Ticket: genau 1 Ja und mindestens 55 Punkte, einmal pro Staffel', () => {
  let found = 0;
  for (let s = 1; s < 400 && !found; s++) {
    for (const acc of [0.62, 0.66, 0.7]) {
      const prof = S.newProfile('G'), se = S.newSeason(s, 'normal'), r = playRound(se, prof, acc);
      const me = r.entries.find(e => e.id === 'p');
      if (r.golden) { found++; assert.strictEqual(me.yes, 1); assert.ok(me.perf >= 55); assert.ok(r.advanced.includes('p')); assert.ok(se.golden); break; }
      if (me.yes === 1 && me.perf >= 55) assert.fail('Ticket hätte vergeben werden müssen');
    }
  }
  assert.ok(found, 'kein Goldenes Ticket gefunden');
});

test('Community-Aktion: einmal pro Runde, Livestream kostet ein Training', () => {
  const se = S.newSeason(3, 'normal'), p = S.newProfile('C');
  assert.ok(S.applyCommunity(se, p, 'live')); assert.strictEqual(p.fans, 33); assert.strictEqual(se.trainLeft, 1);
  assert.ok(!S.applyCommunity(se, p, 'video'));
});

test('Speicherstand: kaputte Daten werden repariert, laufender Auftritt wird zurückgesetzt', () => {
  assert.strictEqual(S.repair(null).profile, null);
  assert.strictEqual(S.repair({ v: 99 }).profile, null);
  const p = S.newProfile('<b>X</b>'); assert.ok(!/[<>]/.test(p.name));
  const se = S.newSeason(1, 'normal'); S.startRound(se);
  const fixed = S.repair(JSON.parse(JSON.stringify({ v: 1, profile: Object.assign(p, { attrs: { timing: 'x', stimme: 500 } }), season: se, settings: { music: 0.3 } })));
  assert.strictEqual(fixed.season.status, 'backstage'); assert.strictEqual(fixed.profile.attrs.timing, 40); assert.strictEqual(fixed.profile.attrs.stimme, 100);
  assert.strictEqual(fixed.settings.music, 0.3); assert.strictEqual(fixed.settings.sfx, S.DEF_SETTINGS.sfx);
  assert.strictEqual(S.repair({ v: 1, profile: p, season: { field: 'kaputt' } }).season, null);
});

test('Bonus-Punkte: Sterne erhöhen den Multiplikator, höchstens +100 %', () => {
  const base = [{ type: 'rhythm', p: 10, g: 0, o: 0, maxCombo: 10 }, { type: 'pitch', q: 0.5 }, { type: 'cues', points: 500 }];
  const s0 = S.bonusScore(base), s5 = S.bonusScore(base.map((x, i) => Object.assign({}, x, { stars: i === 0 ? 5 : 0 })));
  const s50 = S.bonusScore(base.map(x => Object.assign({}, x, { stars: 50 })));
  assert.strictEqual(s0, 1000 + 150 + 2000 + 500); assert.strictEqual(s5, Math.round(s0 * 1.5)); assert.strictEqual(s50, s0 * 2);
});

test('Zugabe: ab 70 % wechselt genau eine Nein-Stimme (die knappste) zu Ja', () => {
  const mk = () => [{ id: 'marc', score: 50, yes: false, tier: 'no' }, { id: 'lena', score: 58, yes: true, tier: 'yes' }, { id: 'david', score: 54, yes: false, tier: 'no' }];
  const a = mk(); assert.ok(!S.encoreFlip(a, 0.5)); assert.strictEqual(a.filter(j => j.yes).length, 1);
  const b = mk(); assert.ok(S.encoreFlip(b, 0.8)); assert.strictEqual(b.filter(j => j.yes).length, 2);
});

test('Sympathie verschiebt Jury-Punkte, höchstens ±4', () => {
  const oc = S.analyze(raw(0.7), null, null);
  const base = S.judge(oc.crit, 'pop', 9, 0, 'p'), up = S.judge(oc.crit, 'pop', 9, 0, 'p', { lena: 9 });
  const l0 = base.find(v => v.id === 'lena'), l1 = up.find(v => v.id === 'lena');
  assert.strictEqual(l1.sy, 4); assert.ok(Math.abs(l1.score - l0.score - 4) < 0.11);
  assert.deepStrictEqual(S.mergeSymp({ lena: 1 }, null, { lena: 2, marc: -1 }), { lena: 3, marc: -1 });
});

test('Backstage-Ereignis: nicht im Casting, einmal pro Runde, Effekt gilt nur für den nächsten Auftritt', () => {
  const se = S.newSeason(11, 'normal'), p = S.newProfile('E');
  assert.strictEqual(S.rollEvent(se), null, 'im Casting kein Ereignis');
  se.round = 1;
  const ev = S.rollEvent(se); assert.ok(ev);
  const k = ev.a.findIndex(a => a.symp || a.crit); const r = S.applyEvent(se, p, k < 0 ? 0 : k);
  assert.ok(r); assert.strictEqual(S.rollEvent(se), null, 'nur einmal pro Runde');
  assert.strictEqual(S.applyEvent(se, p, 0), null);
  const id = S.startRound(se); const oc = S.analyze(raw(0.8), p.attrs, null, se.mods); oc.style = 'pop';
  S.resolveRound(se, p, oc, id); assert.strictEqual(se.mods, null, 'Effekt verbraucht');
});

test('Wechselnde Jury: Casting mit Stammjury, danach 3 verschiedene mit mindestens einer Stammperson; feste Jury bleibt', () => {
  const pool = D.JURY.map(j => j.id), seen = new Set();
  assert.ok(pool.length >= 8);
  for (let seed = 1; seed < 60; seed++) {
    const se = S.newSeason(seed, 'normal', 'wechsel');
    assert.deepStrictEqual(S.panelOf(se, 0), D.MAIN_JURY);
    for (let r = 1; r < D.ROUNDS.length; r++) {
      const p = S.panelOf(se, r);
      assert.strictEqual(new Set(p).size, 3); assert.ok(p.some(id => D.MAIN_JURY.includes(id)));
      assert.ok(p.every(id => pool.includes(id))); assert.deepStrictEqual(p, S.panelOf(se, r));
      p.forEach(id => seen.add(id));
    }
    assert.deepStrictEqual(S.panelOf(S.newSeason(seed, 'normal', 'fest'), 3), D.MAIN_JURY);
  }
  assert.strictEqual(seen.size, pool.length, 'alle Juroren kommen vor');
  const { log } = season(0.97, 7);
  log.forEach(r => r.entries.forEach(e => assert.deepStrictEqual(e.jury.map(v => v.id), r.panel)));
});

test('Online-Show: Casting lässt mindestens zwei weiter, dann Recall, Live-Show 60 %, Finale verteilt Plätze; Votes zählen', () => {
  const mk = (n, f) => Array.from({ length: n }, (_, i) => { const oc = S.analyze(raw(f(i)), null, null); return { id: 'g' + i, name: 'G' + i, perf: oc.perf, crit: oc.crit, style: 'pop', votesN: 0 }; });
  const weak = S.onlineResolve({ def: S.onlineDef(0, 5), round: 0, seed: 3, entries: mk(5, () => 0.2) });
  assert.strictEqual(weak.advanced.length, 2); assert.strictEqual(weak.rescued.length, 2);
  const strong = S.onlineResolve({ def: S.onlineDef(0, 5), round: 0, seed: 3, entries: mk(5, () => 0.95) });
  assert.strictEqual(strong.advanced.length, 5);
  assert.strictEqual(S.onlineDef(1, 6).id, 'recall'); assert.strictEqual(S.onlineDef(1, 2).id, 'recall');
  assert.strictEqual(S.onlineDef(2, 6).id, 'live'); assert.strictEqual(S.onlineDef(2, 3).id, 'finale');
  const live = S.onlineResolve({ def: S.onlineDef(2, 6), round: 2, seed: 3, panel: S.panelOf(S.newSeason(3), 1), entries: mk(6, i => 0.5 + i * 0.08) });
  assert.strictEqual(live.advanced.length, 4); assert.strictEqual(live.entries[0].id, 'g5');
  // Gleiche Leistung: die Person mit Publikumsstimmen liegt vorn
  const same = mk(3, () => 0.7).map(e => Object.assign(e, { perf: 70 })); same[2].votesN = 4; same[0].votesN = 1;
  const fin = S.onlineResolve({ def: S.onlineDef(2, 3), round: 2, seed: 9, entries: same });
  assert.ok(fin.final); assert.strictEqual(fin.advanced.length, 3);
  const g2 = fin.entries.find(e => e.id === 'g2'), g1 = fin.entries.find(e => e.id === 'g1');
  assert.strictEqual(g2.votes, 100); assert.strictEqual(g1.votes, 0); assert.ok(g2.total > g1.total);
  const miss = S.onlineResolve({ def: S.onlineDef(0, 3), round: 0, seed: 1, entries: mk(3, () => 0.95).map((e, i) => (i === 0 ? { id: e.id, name: e.name, missing: true } : e)) });
  assert.ok(!miss.advanced.includes('g0'));
});

test('Freies Vorsingen: saubere Töne schlagen schiefes Rutschen, Stille bringt nichts', () => {
  const R = S.rng(5), melody = [60, 62, 64, 65, 67, 69, 67, 64, 62, 72, 71, 67];
  const clean = [], wobbly = [], silent = [];
  for (let i = 0; i < 600; i++) {      // 30 s bei 20 Bildern pro Sekunde
    const n = Math.floor(i / 20), gap = i % 20 >= 17;
    const l = 0.03 + 0.05 * Math.abs(Math.sin(i / 60));
    clean.push(gap ? { m: null, l: 0.002 } : { m: melody[n % melody.length] + 0.33 + 0.08 * Math.sin(i), l });
    wobbly.push(gap ? { m: null, l: 0.002 } : { m: melody[n % melody.length] + (R() - 0.5) * 1.2 + (n % 2 ? 0.45 : 0), l: 0.04 });
    silent.push({ m: null, l: 0.001 });
  }
  const a = S.singScore(clean, null, 0.05), b = S.singScore(wobbly, null, 0.05), c = S.singScore(silent, null, 0.05);
  assert.ok(a.sing.inton >= 85, 'Tonart verschoben, aber sauber: ' + a.sing.inton);
  assert.ok(a.sing.stab > b.sing.stab && a.sing.inton > b.sing.inton);
  assert.ok(a.perf > b.perf + 10, a.perf + ' vs ' + b.perf);
  assert.strictEqual(a.sing.semis >= 7, true); assert.ok(a.sing.notes >= 20);
  assert.strictEqual(c.perf, 0); assert.strictEqual(c.sing.voiced, 0);
  S.CK.forEach(k => assert.ok(a.crit[k] >= 0 && a.crit[k] <= 100));
  assert.strictEqual(S.singScore(null).perf, 0);
  const fc = S.freeCasting(null, Object.assign({}, a, { style: 'pop' }), 1);
  assert.strictEqual(fc.jury.length, 3);
});

test('Genre-Challenges: Sterne nach Jury, Genre-Ziel und Punkten; Speicherstand wird bereinigt', () => {
  const res = { perf: 82, sing: { inton: 80, stab: 60, range: 40, dyn: 20, presence: 90 } };
  assert.strictEqual(S.singStars('ballade', res, { pass: true }), 3);
  assert.strictEqual(S.singStars('soul', res, { pass: true }), 1);
  assert.strictEqual(S.singStars('ballade', Object.assign({}, res, { perf: 70 }), { pass: true }), 2);
  assert.strictEqual(S.singStars('ballade', res, { pass: false }), 0);
  const r = S.repair({ v: 1, singCh: { pop: { best: 140, stars: 9 }, rock: 'x', evil: { best: 50, stars: 2 } } });
  assert.deepStrictEqual(r.singCh, { pop: { best: 100, stars: 3 } });
  assert.deepStrictEqual(S.freshSave().singCh, {});
});

test('Freies Vorsingen: Rutschen durch eine Oktave zählt nicht als saubere Intonation', () => {
  const slide = S.singScore(Array.from({ length: 600 }, (_, i) => ({ m: 60 + i * 0.02, l: 0.05 })), null, 0.05);
  assert.ok(slide.sing.inton < 60, 'Intonation ' + slide.sing.inton);
  assert.ok(slide.sing.stab < 75, 'Stabilität ' + slide.sing.stab);
  const fc = S.freeCasting(null, Object.assign({}, slide, { style: 'ballade' }), 1);
  assert.ok(S.singStars('ballade', slide, fc) < 2);
});

test('Echt vorsingen in der Karriere: Entwicklung, Backstage-Ereignis und Rundenauswertung', () => {
  const mel = [57, 60, 62, 64, 67, 64, 62, 60];
  const fr = Array.from({ length: 1200 }, (_, i) => ({ m: i % 20 > 17 ? null : mel[Math.floor(i / 20) % mel.length] + 0.1, l: 0.05 + 0.03 * Math.sin(i / 15) }));
  const res = S.singCareer(S.singScore(fr, null, 0.05), 50, { crit: { praesenz: -5 } });
  assert.ok(res.crit.entwicklung > 60, 'Entwicklung ' + res.crit.entwicklung);
  const base = S.singScore(fr, null, 0.05);
  assert.ok(Math.abs(res.crit.praesenz - Math.max(0, base.crit.praesenz - 5)) < 0.11);
  const big = S.singCareer(S.singScore(fr, null, 0.05), null, null, 'gross'), calm = S.singCareer(S.singScore(fr, null, 0.05), null, null, 'fokus');
  assert.ok(big.crit.praesenz > calm.crit.praesenz && big.crit.mut > calm.crit.mut && calm.crit.timing > big.crit.timing, 'Bühnen-Aktion wirkt');
  const p = S.newProfile('Testi', {}), s = S.newSeason(12345, 'normal', 'fest');
  const id = S.startRound(s);
  const out = S.resolveRound(s, p, Object.assign(res, { style: 'pop', action: 'publikum', symp: null, votesBonus: 0 }), id);
  assert.ok(out && out.entries.find(e => e.id === 'p').perf === res.perf);
});

test('Live-Wertung: saubere gehaltene Töne geben Perfekt und Combo, schiefe Töne nicht', () => {
  const run = (wob) => {
    const L = S.liveScorer(30, 0.05), evs = [];
    for (let i = 0; i < 600; i++) {
      const k = Math.floor(i / 20), m = i % 20 > 16 ? null : [57, 60, 62, 64][k % 4] + 0.15 + (wob ? (k % 2 ? 0.45 : -0.1) + 0.3 * Math.sin(i) : 0);
      const r = L.push(m); if (r.ev) evs.push(r.ev.t);
    }
    return Object.assign(L.end(), { evs });
  };
  const clean = run(false), bad = run(true);
  assert.ok(clean.evs.filter(t => t === 'perfekt').length > 20, clean.evs.join());
  assert.ok(clean.best >= 10 && clean.total > bad.total && clean.total <= 10000, clean.total + ' / ' + bad.total);
  assert.ok(bad.evs.filter(t => t === 'perfekt').length < clean.evs.filter(t => t === 'perfekt').length);
  const edge = S.liveScorer(30, 0.05); let pf = 0;
  for (let i = 0; i < 600; i++) { const r = edge.push(i % 20 > 16 ? null : 60.5 + (i % 2 ? 0.005 : -0.005)); if (r.ev && r.ev.t === 'perfekt') pf++; }
  assert.ok(pf > 20 && edge.end().best > 10, 'Ton genau zwischen zwei Halbtönen bleibt ein gehaltener Ton: ' + pf);
  assert.strictEqual(S.singTitle(95), '🌟 Superstar'); assert.strictEqual(S.singTitle(10), '🚿 Duschsänger');
});

test('Song des Tages, Belohnungen und Speicherstand', () => {
  assert.match(S.dailyDay(new Date('2026-10-24T23:30:00Z')), /^20261025$/);   // deutsche Zeit
  const a = S.dailySong('20261024'), b = S.dailySong('20261024');
  assert.deepStrictEqual(a, b); assert.ok(a.vid && a.title);
  const sv = S.repair({ v: 1, singCh: { pop: { best: 90, stars: 3 }, rock: { best: 80, stars: 2 } }, daily: { d20261023: 5, d20261024: 700.4 }, rew: { mic: 'feuer', stage: 'x' }, singBest: 5e6 });
  assert.deepStrictEqual(sv.daily, { d20261024: 700 }); assert.strictEqual(sv.singBest, 10000);
  assert.deepStrictEqual(sv.rew, { mic: 'feuer', stage: 'chairs' });
  assert.strictEqual(S.starSum(sv), 5);
  const r = id => S.D.REWARDS.find(x => x.id === id);
  assert.ok(S.unlocked(sv, r('feuer')) && !S.unlocked(sv, r('diamant')) && S.unlocked(sv, r('gold')));
});

test('Tagesrangliste: Wert steigt mit jedem Tag, Punkte bleiben ablesbar', () => {
  const a = S.dailyCode('20261024', 744), b = S.dailyCode('20261025', 10), c = S.dailyCode('20261024', 9999);
  assert.ok(b > c && c > a);
  assert.strictEqual(a % 1e5, 744);
  assert.ok(S.dailyCode('20991231', 10000) <= 1e12);   // Grenze der Firestore-Regel
  assert.strictEqual(S.repair({ v: 1, dailyBoard: a }).dailyBoard, a);
  assert.strictEqual(S.repair({ v: 1, dailyBoard: 'x' }).dailyBoard, 0);
});

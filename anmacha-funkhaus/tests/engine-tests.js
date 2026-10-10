/* Tests für die Funkhaus-Regeln (node tests/engine-tests.js) */
import { newGame, resolveDay, resolveTask, nominate, vote, finalVote, playSeason, alive, nomCandidates, finalRanking, compat, aiPlan, heart, stars, SLOTS, DAYS, TRAIT_LIST } from '../engine.js';
import { CAST } from '../content.js';
let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const pickCast = (seed, n) => { const idx = CAST.map((_, i) => i).sort((a, b) => ((a * 7919 + seed * 104729) % 97) - ((b * 7919 + seed * 104729) % 97)).slice(0, n); return idx.map(i => CAST[i]); };
const mk = (seed, n = 8, humans = []) => newGame({ cast: pickCast(seed, n), humans, seed });

// Grundzustand
{ const G = mk(1); ok(G.res.length === 8 && G.res.every(r => r.alive && r.pop > 30 && r.pop < 70), 'Start: 8 Bewohner mit Beliebtheit 30–70'); ok(G.res.every(r => r.sym[r.i] === 0 && r.sym.every(v => v >= -60 && v <= 60)), 'Start: Beziehungen im Rahmen, zu sich selbst neutral'); ok(compat(['ehrlich', 'herzlich'], ['ehrlich', 'herzlich']) > compat(['intrigant', 'eitel'], ['ehrlich', 'ruhig']), 'Verträglichkeit: Gleichgesinnte passen besser'); }
// Determinismus
{ const a = playSeason(mk(5)), b = playSeason(mk(5)), c = playSeason(mk(6)); ok(JSON.stringify(finalRanking(a)) === JSON.stringify(finalRanking(b)) && a.log.length === b.log.length, 'Gleicher Startwert → gleiche Staffel'); ok(JSON.stringify(finalRanking(a)) !== JSON.stringify(finalRanking(c)) || a.log.length !== c.log.length, 'Anderer Startwert → andere Staffel'); }
// Ein Tag
{ const G = mk(2), ev = resolveDay(G, {}); ok(ev.filter(e => e.t === 'act').length === 8 * SLOTS, `Ein Tag: ${8 * SLOTS} Aktionen (8 Bewohner × ${SLOTS})`); ok(G.day === 1 && G.phase === 'day', 'Tageszähler läuft'); ok(ev.filter(e => e.t === 'act').every(e => e.room && e.a !== e.tgt && (e.tgt >= 0) === (['talk', 'cook', 'alliance', 'tease', 'secret', 'rumor'].includes(e.act))), 'Aktionen: Raum gesetzt, Ziel nur bei Paar-Aktionen, nie man selbst'); }
// Mensch plant
{ const G = mk(3, 8, [0]); const plan = { 0: [{ a: 'show', t: -1 }, { a: 'talk', t: 3 }, { a: 'relax', t: -1 }] }; const ev = resolveDay(G, plan).filter(e => e.a === 0 && e.t === 'act'); ok(ev.length === 3 && ev[0].act === 'show' && ev[1].act === 'talk' && ev[1].tgt === 3, 'Menschlicher Plan wird 1:1 umgesetzt'); }
// Wirkungen
{ const G = mk(4); const A = G.res[0], B = G.res[1]; A.mood = 80; B.sym[0] = 20; let n = 0; for (let k = 0; k < 40; k++) { const g = mk(4 + k); g.res[1].sym[0] = 30; const before = g.res[1].sym[0]; g.rnd = () => 0.01; const e = resolveDay(g, { 0: [{ a: 'talk', t: 1 }, { a: 'talk', t: 1 }, { a: 'talk', t: 1 }] }); if (g.res[1].sym[0] > before) n++; } ok(n >= 35, 'Plaudern mit Glück steigert die Sympathie'); }
{ const g = mk(9); g.res[1].sym[0] = 30; g.res[0].sym[1] = 30; g.rnd = () => 0.01; resolveDay(g, { 0: [{ a: 'alliance', t: 1 }, { a: 'relax', t: -1 }, { a: 'relax', t: -1 }] }); ok(g.allies.some(a => a.includes(0) && a.includes(1)), 'Allianz bildet sich bei genug Sympathie'); const g2 = mk(9); g2.res[1].sym[0] = -30; g2.rnd = () => 0.01; resolveDay(g2, { 0: [{ a: 'alliance', t: 1 }, { a: 'relax', t: -1 }, { a: 'relax', t: -1 }] }); ok(!g2.allies.some(a => a.includes(0) && a.includes(1)), 'Keine Allianz mit jemandem, der einen nicht mag'); }
{ const g = mk(11); const p0 = g.res[1].pop; g.rnd = () => 0.9; for (const r of g.res) { r.traits = ['ruhig', 'ehrlich']; } g.res[0].traits = ['intrigant', 'chaot']; g.rnd = () => 0.9; resolveDay(g, { 0: [{ a: 'rumor', t: 1 }, { a: 'relax', t: -1 }, { a: 'relax', t: -1 }] }); ok(g.res[1].pop <= p0 + 1, 'Gerücht schadet der Beliebtheit (oder fliegt auf)'); }
// Wochenaufgabe, Nominierung, Hörervotum
{ const G = mk(7); for (let d = 0; d < DAYS; d++) resolveDay(G, {}); ok(G.phase === 'task', 'Nach 3 Tagen kommt die Wochenaufgabe'); const t = resolveTask(G, {}); ok(G.res[t.winner].immune && G.res.filter(r => r.immune).length === 1, 'Aufgabensieger ist als Einziger immun'); ok(G.phase === 'nom', 'Danach Nominierung');
  const nm = nominate(G, {}); ok(nm.nominees.length >= 2 && nm.nominees.length <= 3 && !nm.nominees.includes(t.winner), 'Zwei bis drei Nominierte, nie der Immune'); ok(Object.entries(nm.votes).every(([i, v]) => v.length === 2 && !v.includes(+i) && !v.includes(t.winner)), 'Jeder nominiert zwei andere (nicht sich, nicht den Immunen)');
  const v = vote(G); ok(v.pct.reduce((a, b) => a + b, 0) === 100 && v.ids.includes(v.leaver), 'Hörervotum: Prozente ergeben 100, Verlierer war nominiert'); ok(alive(G).length === 7 && G.week === 2 && G.day === 0 && G.phase === 'day', 'Ein Bewohner zieht aus, nächste Woche beginnt'); }
// Menschen müssen gültig nominieren
{ const G = mk(8, 8, [0]); for (let d = 0; d < DAYS; d++) resolveDay(G, {}); resolveTask(G, { 0: 50 }); const cand = nomCandidates(G, 0); const nm = nominate(G, { 0: [cand[0], cand[1]] }); ok(nm.votes[0][0] === cand[0] && nm.votes[0][1] === cand[1], 'Menschliche Nominierung wird übernommen'); const G2 = mk(8, 8, [0]); for (let d = 0; d < DAYS; d++) resolveDay(G2, {}); resolveTask(G2, {}); const nm2 = nominate(G2, { 0: [0, 99] }); ok(nm2.votes[0].length === 2 && !nm2.votes[0].includes(0), 'Ungültige Nominierung wird durch gültige ersetzt'); }
// Volle Staffeln
const wins = {}, tw = {}; let bad = 0, weeks = 0, N = 160;
for (let s = 1; s <= N; s++) { const size = s % 2 ? 8 : 6, G = playSeason(mk(s * 13, size)); const rk = finalRanking(G); if (G.phase !== 'end' || rk.length !== size || new Set(rk).size !== size || G.winner !== rk[0]) bad++; if (G.res.some(r => !isFinite(r.pop) || !isFinite(r.mood) || r.sym.some(x => !isFinite(x)))) bad++; weeks += G.week; const w = G.res[G.winner]; w.traits.forEach(t => { tw[t] = (tw[t] || 0) + 1; }); wins[w.n] = (wins[w.n] || 0) + 1; }
ok(bad === 0, `${N} komplette Staffeln (6 und 8 Bewohner): alle enden mit gültiger Rangliste, keine ungültigen Werte`);
ok(weeks / N > 3.5 && weeks / N < 8, `Durchschnittliche Länge ${(weeks / N).toFixed(1)} Wochen`);
const share = TRAIT_LIST.map(t => (tw[t] || 0) / N / 2); ok(Math.max(...share) < 0.4 && TRAIT_LIST.every(t => (tw[t] || 0) > 0), 'Balance: jede Eigenschaft gewinnt mal, keine dominiert (' + TRAIT_LIST.map(t => t.slice(0, 4) + ' ' + Math.round(((tw[t] || 0) / N / 2) * 100) + '%').join(' ') + ')');
ok(Object.values(wins).every(v => v / N < 0.25), 'Kein einzelner Bewohner gewinnt über 25 % der Staffeln');
// Hilfsfunktionen
ok(heart(50) === 4 && heart(-50) === 0 && heart(0) === 2 && stars(100) === 5 && stars(0) === 1, 'Anzeige-Hilfen (Herzen, Sterne)');
{ const G = mk(21); const p = aiPlan(G, 0); ok(p.length === SLOTS && p.every(x => (x.t >= 0) === ['talk', 'cook', 'alliance', 'tease', 'secret', 'rumor'].includes(x.a)), 'KI plant drei gültige Aktionen'); }
console.log(fails ? '\n' + fails + ' Tests fehlgeschlagen' : '\nAlle Funkhaus-Tests bestanden'); process.exit(fails ? 1 : 0);

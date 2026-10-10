/* Tests für Wertung und Spielablauf (node tests/engine-tests.js) */
import { bidScore, dialScore, hiloScore, hiloTruth, cartScore, buildRound, publicSpec, Show, KINDS, CART_ITEMS, sum } from '../engine.js';
import PROD from '../products.js';
 let fails = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };
const seed = n => { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
// Gebotsduell
ok(JSON.stringify(bidScore([50, 80, 99], 100)) === '[0,0,3]', 'Bieten: am nächsten dran ohne drüber gewinnt');
ok(JSON.stringify(bidScore([50, 120, 99], 100)) === '[0,0,3]', 'Bieten: Gebote über dem Preis zählen nicht');
ok(JSON.stringify(bidScore([100, 80], 100)) === '[3,0]', 'Bieten: Preis genau getroffen');
ok(JSON.stringify(bidScore([120, 150, 110], 100)) === '[0,0,1]', 'Bieten: alle drüber → der Nächste bekommt 1 Trostpunkt');
ok(JSON.stringify(bidScore([90, 90, 50], 100)) === '[3,3,0]', 'Bieten: Gleichstand teilt sich den Sieg');
ok(JSON.stringify(bidScore([null, 70], 100)) === '[0,3]' && JSON.stringify(bidScore([null, null], 100)) === '[0,0]', 'Bieten: fehlende Gebote');
ok(JSON.stringify(bidScore([90, 120], 100, 5, 2)) === '[5,0]' && JSON.stringify(bidScore([130, 120], 100, 5, 2)) === '[0,2]', 'Finale: 5 Punkte / 2 Trostpunkte');
// Skala
ok(dialScore(100, 100) === 5 && dialScore(103, 100) === 4 && dialScore(92, 100) === 3 && dialScore(85, 100) === 2 && dialScore(70, 100) === 1 && dialScore(40, 100) === 0 && dialScore(NaN, 100) === 0, 'Skala: Punkte nach Abweichung (2/5/10/20/35 %)');
// Höher/Tiefer
{ const it = [{ p: 10 }, { p: 20 }, { p: 5 }, { p: 9 }]; ok(JSON.stringify(hiloTruth(it)) === '[true,false,true]', 'Teurer/billiger: Wahrheit'); ok(hiloScore([true, false, true], it) === 4 && hiloScore([true, false, false], it) === 2 && hiloScore([false, true, false], it) === 0 && hiloScore(null, it) === 0, 'Teurer/billiger: 1 Punkt je richtig, +1 bei alles richtig'); }
// Einkaufswagen
ok(cartScore(40, 40) === 5 && cartScore(39.6, 40) === 5 && cartScore(38.5, 40) === 3 && cartScore(36, 40) === 2 && cartScore(35.9, 40) === 2 && cartScore(33, 40) === 1 && cartScore(30, 40) === 0 && cartScore(40.01, 40) === 0 && cartScore(0, 40) === 0, 'Einkaufswagen: Punkte nach Abstand, drüber = 0');
// Runden bauen
for (const k of KINDS) { const r = buildRound(k, PROD, seed(7)); ok(r.items.length >= 1 && r.kind === k, `Runde „${k}" lässt sich bauen`); }
{ const r = buildRound('dial', PROD, seed(3)); ok(r.min < r.price && r.price < r.max && r.step > 0, `Skala enthält den Preis (${r.min}–${r.max}, Preis ${r.price})`); }
{ const r = buildRound('hilo', PROD, seed(5)); ok(r.items.length === 4 && new Set(r.items.map(i => i.n)).size === 4, 'Teurer/billiger: 4 verschiedene Produkte'); }
for (let n = 1; n <= 30; n++) { const r = buildRound('cart', PROD, seed(n)); const t = sum(r.items.filter((x, i) => r.solution[i])); if (r.items.length !== CART_ITEMS || Math.abs(t - r.target) > 0.001 || cartScore(t, r.target) !== 5) { ok(false, `Einkaufswagen Seed ${n} nicht lösbar`); break; } if (n === 30) ok(true, 'Einkaufswagen: Ziel ist immer genau erreichbar (30 Zufallsrunden)'); }
{ const r = buildRound('final', PROD, seed(2)); ok(r.items.length === 3 && Math.abs(r.price - sum(r.items)) < 0.001, 'Finale: Gesamtpreis = Summe der drei Produkte'); }
{ for (const k of [...KINDS, 'final']) { const sp = publicSpec(buildRound(k, PROD, seed(11))); ok(sp.price === undefined && sp.solution === undefined, `Öffentliche Daten „${k}" verraten keinen Preis/Lösung`); } const h = publicSpec(buildRound('hilo', PROD, seed(4))); ok(h.items[0].p > 0 && h.items.slice(1).every(i => i.p === undefined), 'Teurer/billiger: nur der erste Preis ist sichtbar'); const c = publicSpec(buildRound('cart', PROD, seed(4))); ok(c.items.every(i => i.p > 0), 'Einkaufswagen: alle Preise sichtbar'); }
// Ablauf
{ const sh = new Show({ players: [{ name: 'A' }, { name: 'B' }], length: 4 }, PROD, seed(9)); ok(sh.total === 5 && sh.plan[4] === 'final' && sh.plan.slice(0, 4).join() === 'bid,dial,hilo,cart', 'Show: 4 Spiele + Finale');
  const r = sh.startRound(); ok(r.kind === 'bid' && r.index === 0 && sh.phase === 'collect', 'Erste Runde: Gebotsduell'); ok(sh.submit(0, '12,50') && sh.answers[0] === 12.5, 'Gebot mit Komma wird gelesen'); ok(!sh.submit(0, 5) && sh.answers[0] === 12.5, 'Zweite Abgabe wird ignoriert'); ok(!sh.submit(1, 'abc') && !sh.submit(5, 3), 'Ungültige Abgabe/Spieler wird abgelehnt'); ok(sh.humansPending().join() === '1', 'Noch offen: Spieler 2');
  sh.submit(1, 3); const res = sh.resolve(); ok(res.type === 'result' && res.points.length === 2 && sh.phase === 'reveal' && res.reveal.price > 0, 'Auflösen liefert Punkte und Preis'); ok(sh.resolve() === null, 'Doppeltes Auflösen wird ignoriert'); const n = sh.next(); ok(n.type === 'round' && n.kind === 'dial', 'Nächste Runde: Frequenz-Skala'); }
{ const sh = new Show({ players: [{ name: 'A' }, { name: 'B', cpu: true }], length: 4, diff: 'hard' }, PROD, seed(21)); let ev = sh.startRound(), steps = 0, end = null; while (!end && steps++ < 30) { const k = sh.spec.kind; if (k === 'hilo') sh.submit(0, [true, true, true]); else if (k === 'cart') sh.submit(0, [0, 1]); else if (k === 'dial') sh.submit(0, sh.spec.min); else sh.submit(0, 10); const r = sh.resolve(); ok(r && r.points.length === 2 && r.points.every(p => p >= 0), `Runde ${steps} (${k}) aufgelöst`); const nx = sh.next(); if (nx.type === 'end') end = nx; } ok(end && end.winners.length >= 1 && end.totals.length === 2, 'Show endet mit Gewinner(n)'); }
{ const sh = new Show({ players: [{ name: 'A', cpu: true }, { name: 'B', cpu: true }, { name: 'C', cpu: true }], length: 8, diff: 'normal' }, PROD, seed(33)); sh.startRound(); let n = 0, done = false; while (n++ < 20 && !done) { const r = sh.resolve(); if (!r || r.points.some(p => p < 0 || !isFinite(p))) { ok(false, 'Computer-Runde fehlerhaft'); break; } done = sh.next().type === 'end'; } ok(done && sh.players.some(p => p.total > 0), 'Computer-gegen-Computer: alle 9 Runden laufen durch'); }
{ const sh = new Show({ players: [{ name: 'A' }], length: 4 }, PROD, seed(5)); const used = new Set(); let ev = sh.startRound(); for (let i = 0; i < 5; i++) { sh.spec.items.forEach(it => { if (used.has(it.n)) ok(false, 'Produkt wiederholt: ' + it.n); used.add(it.n); }); sh.submit(0, 1); sh.resolve(); ev = sh.next(); } ok(true, 'Keine Produkt-Wiederholung innerhalb einer Show'); }
{ // CPU-Qualität: schwerer = näher dran
  const err = diff => { let t = 0; for (let i = 0; i < 300; i++) { const sh = new Show({ players: [{ name: 'c', cpu: true }], diff }, PROD, seed(i + 1)); sh.index = -1; sh.startRound(); t += Math.abs(sh.cpuAnswer() - sh.spec.price) / sh.spec.price; } return t / 300; }; const e = err('easy'), h = err('hard'); ok(h < e, `Computer-Stufen: schwer (${(h * 100).toFixed(0)} % Abweichung) besser als leicht (${(e * 100).toFixed(0)} %)`); }
// Daten
ok(PROD.length >= 200 && new Set(PROD.map(p => p.n.toLowerCase())).size === PROD.length && PROD.every(p => p.p > 0 && p.n && p.e), `${PROD.length} Produkte geladen`);
console.log(fails ? `\n${fails} Fehler` : '\nAlle Preisradar-Tests bestanden'); process.exit(fails ? 1 : 0);

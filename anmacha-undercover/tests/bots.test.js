// Bot-Runden: je Modus N Partien mit festen Seeds (nur Bots). Prüft: Runde endet, Ergebnis gültig, keine Fehler,
// Gewinner gehören zum Siegerteam, Wortspiel verrät das Wort erst im Ergebnis. Aufruf: node tests/bots.test.js [N]
const AMU = require('./_load.js');
const N = +process.argv[2] || 100;
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; if (fails < 20) console.error('FEHLER:', m); } };
const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const MAPS = AMU.MAPS.map(m => m.id);
const t0 = Date.now(), stat = {};
for (const mode of ['jagd', 'detektiv', 'chaos', 'jagen', 'rollen']) {
  const M = AMU.modeById(mode); stat[mode] = {};
  for (let i = 0; i < N; i++) {
    const n = M.min + (i % (M.max - M.min + 1));
    const settings = AMU.cleanSettings({ mode, map: MAPS[i % MAPS.length], players: n, diff: i % 3 }, null);
    const players = names.slice(0, n).map((x, k) => ({ id: 'b' + k, name: x, bot: true }));
    let sim, err = null;
    try {
      sim = AMU.Sim.create({ seed: 1000 + i, mode, settings, players });
      let steps = 0; const max = 20 * 60 * 25;   // höchstens 25 Spielminuten
      while (sim.phase !== 'end' && steps < max) { sim.step(50); steps++; }
    } catch (e) { err = e; }
    ok(!err, mode + ' #' + i + ' wirft: ' + (err && err.stack));
    if (err) continue;
    ok(!sim.brainErr, mode + ' #' + i + ' Bot-Fehler: ' + (sim.brainErr && sim.brainErr.stack));
    ok(sim.phase === 'end' && sim.result, mode + ' #' + i + ' endet nicht (Phase ' + sim.phase + ')');
    if (!sim.result) continue;
    const r = sim.result;
    stat[mode][r.winner] = (stat[mode][r.winner] || 0) + 1;
    ok(typeof r.reason === 'string' && r.reason.length > 3, mode + ' Grund fehlt');
    ok(Array.isArray(r.winners) && r.winners.length > 0, mode + ' #' + i + ' keine Gewinner');
    r.winners.forEach(id => { const p = r.players.find(q => q.id === id); ok(p && (r.winner === 'neutral' || p.team === r.winner), mode + ' Gewinner im falschen Team'); });
    ok(r.players.length === n, mode + ' Spielerzahl');
  }
}
for (let i = 0; i < N; i++) {
  const n = 3 + (i % 10);
  const settings = AMU.cleanSettings({ mode: 'wort', players: n, wordVariant: i % 2 ? 'alternativ' : 'kategorie', impostors: n >= 9 ? 2 : 1, clueMode: ['beide', 'karten', 'frei'][i % 3] }, null);
  const players = names.slice(0, n).map((x, k) => ({ id: 'b' + k, name: x, bot: true }));
  let g, err = null, leak = false;
  try {
    g = AMU.WordGame.create({ seed: 5000 + i, settings, players });
    let steps = 0;
    while (g.phase !== 'end' && steps < 20 * 60 * 20) {
      g.step(50); steps++;
      if (steps % 40 === 0) players.forEach(p => { const v = g.viewFor(p.id), js = JSON.stringify(Object.assign({}, v, { me: null })); if (js.includes('"' + g.secret.word + '"') && !v.result) leak = true; });
    }
  } catch (e) { err = e; }
  ok(!err, 'wort #' + i + ' wirft: ' + (err && err.stack));
  if (err) continue;
  ok(!leak, 'wort #' + i + ': Wort steht in der öffentlichen Sicht');
  ok(g.phase === 'end' && g.result, 'wort #' + i + ' endet nicht');
  if (g.result) { stat.wort = stat.wort || {}; stat.wort[g.result.winner] = (stat.wort[g.result.winner] || 0) + 1; ok(g.result.winners.length > 0, 'wort Gewinner'); }
}
console.log('Siege je Modus:', JSON.stringify(stat));
console.log((fails ? 'FEHLER: ' + fails + ' von ' : 'OK: ') + checks + ' Prüfungen (' + N + ' Partien je Modus, ' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(fails ? 1 : 0);

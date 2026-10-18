// Simulierter Spieler („Bot-Karriere“) für Tests: spielt mit festem Zufall und künstlicher Uhr so, wie ein Mensch spielen würde.
'use strict';
const load = require('./load.cjs');
module.exports = function career(seed, o) {
  o = o || {};
  const SW = load();
  let t = Date.UTC(2026, 0, 5, 9);
  const g = SW.newGame(null, { rng: SW.rng.seeded('c:' + seed), now: () => t, silent: true });
  const r = SW.rng.seeded('p:' + seed), s = g.s;
  s.tutorial = { done: true, step: 99, queue: [] };
  const maxIsland = o.islands || 30, maxSpins = o.maxSpins || 400000;
  let spins = 0, guard = 0;
  const err = [];
  const check = (cond, msg) => { if (!cond && err.length < 20) err.push(msg); };
  const allQuests = () => SW.QUESTS.every(q => s.quests.done[q.id]);
  let endSpins = 0;
  while (!((s.ended || s.island > maxIsland || s.ngp > 0) && (!o.quests || allQuests())) && spins < maxSpins && guard++ < 5e6) {
    if (s.ended) { endSpins++; if (r.next() < 0.02) g.visit(r.range(1, 29)); if (o.quests && endSpins > 3000) g.newGamePlus(); }   // wie ein Mensch: weiter mit Neues Spiel+
    g.tick();
    if (!s.daily.bonus) g.claimDaily();
    // offene Aktion abschließen
    if (s.pending) {
      const before = s.coins;
      if (s.pending.kind === 'attack') {
        const tg = g.attackTargets(); check(tg.length > 0, 'keine Angriffsziele');
        const tid = tg[r.int(tg.length)].id, bot = s.bots[tid], built = bot.stages.map((x, i) => (x > 0 ? i : -1)).filter(i => i >= 0);
        const res = g.attack(tid, built.length ? built[r.int(built.length)] : 0); check(res.ok, 'Angriff: ' + JSON.stringify(res));
      } else {
        const tg = g.raidTargets(); check(tg.length > 0, 'keine Raubziele');
        const st = g.raidStart(tg[0].id); check(st.ok, 'Raubstart ' + JSON.stringify(st));
        const spots = r.shuffle([0, 1, 2, 3, 4, 5]); for (let k = 0; k < 3; k++) { const d = g.raidDig(spots[k]); check(d.ok, 'Graben ' + JSON.stringify(d)); }
      }
      check(!s.pending, 'Aktion bleibt offen'); check(s.coins >= before, 'Münzen gesunken');
      continue;
    }
    // bauen/reparieren, solange es geht
    let did = true;
    while (did) {
      did = false;
      for (let b = 0; b < 5; b++) if (s.damaged[b] && g.repair(b).ok) did = true;
      let best = -1, bc = Infinity;
      for (let b = 0; b < 5; b++) { if (s.damaged[b] || s.stages[b] >= 5) continue; const c = g.buildCost(b); if (c < bc) { bc = c; best = b; } }
      if (best >= 0 && s.coins >= bc) { const res = g.build(best, s.material >= 3); if (res.ok) did = true; }
    }
    if (g.islandComplete()) { const rw = g.completeIsland(); check(!rw.error, 'Inselabschluss'); if (s.island > 1 && r.next() < 0.5) g.visit(r.range(1, s.island - 1)); continue; }
    for (const k of Object.keys(s.chests)) while (s.chests[k] > 0) g.openChest(k);
    for (const a of g.activeQuests()) if (a.ready) g.claimQuest(a.q.id);
    for (let i = 0; i < 3; i++) { g.claimGoal(false, i); g.claimGoal(true, i); }
    for (const tr of g.botTrades()) if (r.next() < 0.3) g.acceptBotTrade(tr.key);
    for (const id of Object.keys(s.comps)) { const c = g.trainCost(id); if (c && s.relics >= c.relics + 50 && r.next() < 0.5) g.train(id, false); }
    if (g.mgPlaysLeft() > 0 && r.next() < 0.05) { const ids = Object.keys(SW.MINIGAMES || { lichtpfad: 1, kristallsuche: 1, wolkengleiter: 1, runenmemory: 1, funkelpuzzle: 1, reparaturwerk: 1, portalsprung: 1, schatzkarte: 1 }); if (g.mgBegin()) g.mgResult(ids[r.int(ids.length)], { win: r.next() < 0.7, stars: r.range(1, 3) }); }
    if (s.relics > 300) { if (s.shields < g.maxShields()) g.buy('shield'); }
    // drehen (Multiplikator wie ein vorsichtiger Mensch)
    const ms = g.mults(); let m = 1; for (const x of ms) if (s.energy >= x * 8) m = x;
    if (s.energy < m) { t += Math.max(1000, g.nextSpinIn()); continue; }
    const out = g.spin(m); check(!out.error, 'Spin ' + JSON.stringify(out)); spins++;
    check(Number.isFinite(s.coins) && s.coins >= 0, 'Münzen ungültig');
    t += 4000;
  }
  return { g, s, spins, endSpins, err, days: (t - Date.UTC(2026, 0, 5, 9)) / 864e5, SW };
};

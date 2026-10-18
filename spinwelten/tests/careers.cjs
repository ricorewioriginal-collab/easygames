// 1000 simulierte Spielerkarrieren (Dauer: einige Minuten). Start: node spinwelten/tests/careers.cjs [Anzahl]
'use strict';
const career = require('./sim.cjs');
const N = +(process.argv[2] || 1000);
const spins = [], days = [], bad = [];
let questsAll = 0;
for (let i = 0; i < N; i++) {
  const r = career('m' + i, { quests: true, maxSpins: 40000 });
  if (r.err.length || !(r.s.ended || r.s.ngp > 0) || !Number.isSafeInteger(r.s.coins)) bad.push({ i, err: r.err.slice(0, 2) });
  if (r.SW.QUESTS.every(q => r.s.quests.done[q.id])) questsAll++;
  spins.push(r.spins); days.push(r.days);
}
const q = (a, p) => a.slice().sort((x, y) => x - y)[Math.floor((a.length - 1) * p)];
console.log(JSON.stringify({ careers: N, failed: bad.length, allQuests: questsAll, spins: { min: q(spins, 0), median: q(spins, 0.5), max: q(spins, 1) }, days: { min: +q(days, 0).toFixed(1), median: +q(days, 0.5).toFixed(1), max: +q(days, 1).toFixed(1) }, bad: bad.slice(0, 5) }));
process.exit(bad.length ? 1 : 0);

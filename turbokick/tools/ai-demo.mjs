// Bot-Partien simulieren und Statistik ausgeben.  Start: npx tsx tools/ai-demo.mjs [stufeA] [stufeB] [teamgröße] [sekunden] [spiele]
// Beispiel: npx tsx tools/ai-demo.mjs hard easy 1 90 6      (Stufe A = Team 0, Stufe B = Team 1; "idle" = untätiger Gegner)
import { Sim } from '../shared/src/sim/index.ts';
import { Bot, BOT_LEVELS } from '../shared/src/ai/bot.ts';

// Zum Abstimmen: BOT_TUNE='{"hard":{"delay":0.3}}' überschreibt Stufenwerte
if (process.env.BOT_TUNE) for (const [k, v] of Object.entries(JSON.parse(process.env.BOT_TUNE))) Object.assign(BOT_LEVELS[k], v);

const [la = 'pro', lb = 'idle', size = '1', secs = '120', games = '2'] = process.argv.slice(2);
const n = Number(size);
let totA = 0;
let totB = 0;
let actMs = 0;
let actN = 0;
for (let g = 0; g < Number(games); g++) {
  // gerade Spiele: A = Team 0, ungerade: Seitenwechsel
  const swap = g % 2 === 1;
  const teams = [];
  for (let i = 0; i < n; i++) teams.push(0);
  for (let i = 0; i < n; i++) teams.push(1);
  const sim = new Sim({ cars: teams.map((team) => ({ team })), seed: 100 + g, matchSeconds: Number(secs) });
  const bots = teams.map((team, i) => {
    const lvl = (team === 0) !== swap ? la : lb;
    return lvl === 'idle' ? null : new Bot(lvl, 1000 * g + i);
  });
  const goals = [];
  for (let t = 0; t < Number(secs) * 60 + 600 && sim.state.phase !== 'ended'; t++) {
    const t0 = performance.now();
    const inputs = bots.map((b, i) => (b ? b.act(sim.state, i) : undefined));
    actMs += performance.now() - t0;
    actN += bots.filter(Boolean).length;
    for (const e of sim.step(inputs)) if (e.t === 'goal') goals.push(`${(t / 60).toFixed(0)}s:${e.team}`);
  }
  const [s0, s1] = sim.state.score;
  const a = swap ? s1 : s0;
  const b = swap ? s0 : s1;
  totA += a;
  totB += b;
  console.log(`Spiel ${g} (A=Team ${swap ? 1 : 0}): ${a}:${b}  Tore [${goals.join(' ')}]`);
}
console.log(`${la} ${totA} : ${totB} ${lb}   act()=${((actMs / actN) * 1000).toFixed(1)} µs`);

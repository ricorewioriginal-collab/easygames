// Simuliert eine Partie 3v3 mit zufälligen Eingaben und gibt ASCII-Karte + Werte aus.  Start: npx tsx tools/sim-demo.mjs
import { Sim } from '../shared/src/sim/index.ts';
import { Rng } from '../shared/src/rng.ts';

const cars = [0, 0, 0, 1, 1, 1].map((team) => ({ team }));
const sim = new Sim({ cars, seed: 7, matchSeconds: 60 });
const rng = new Rng(1);
const t0 = performance.now();
let ticks = 0;
while (sim.state.phase !== 'ended' && ticks < 60 * 90) {
  const ev = sim.step(cars.map(() => ({ throttle: rng.float(-0.3, 1), steer: rng.float(-1, 1), boost: rng.chance(0.5), jump: rng.chance(0.03), pitch: rng.float(-1, 1) })));
  for (const e of ev) if (e.t === 'goal' || e.t === 'demo' || e.t === 'end' || e.t === 'overtime') console.log((ticks / 60).toFixed(1) + 's', JSON.stringify(e));
  ticks++;
}
const s = sim.state;
const W = 41, H = 51;
const grid = Array.from({ length: H }, () => Array(W).fill('.'));
const put = (x, z, ch) => { const gx = Math.round(x / 2) + 20, gz = Math.round(z) + 25; if (gx >= 0 && gx < W && gz >= 0 && gz < H) grid[gz][gx] = ch; };
for (const p of s.pads) put(p.pos[0], p.pos[2] / 2, p.big ? 'O' : 'o');
for (const c of s.cars) put(c.pos[0], c.pos[2] / 2, c.team === 0 ? 'F' : 'E');
put(s.ball.pos[0], s.ball.pos[2] / 2, '@');
console.log(grid.map((r) => r.join('')).join('\n'));
console.log({ phase: s.phase, score: s.score, winner: s.winner, ticks, hash: sim.hash(), msPerTick: ((performance.now() - t0) / ticks).toFixed(3) });

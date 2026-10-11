import { it } from 'vitest';
import { Rng } from '../rng';
import { Sim, createSimState, cloneState } from './sim';
import { decodeSnapshot, encodeSnapshot } from './snapshot';
import { skipCountdown } from './testkit';
const config = { cars: [0, 0, 0, 1, 1, 1].map((team) => ({ team: team as 0 | 1 })), seed: 21 };
const rnd = (rng: Rng) => ({ throttle: rng.float(-1, 1), steer: rng.float(-1, 1), pitch: rng.float(-1, 1), yaw: rng.float(-1, 1), jump: rng.chance(0.06), boost: rng.chance(0.5), handbrake: rng.chance(0.05) });
it('dbg', () => {
  for (const warm of [400, 900, 1500, 2000, 2500]) {
    const host = new Sim(config); skipCountdown(host); const r0 = new Rng(5); for (let i = 0; i < warm; i++) host.step(config.cars.map(() => rnd(r0)));
    const tmp = createSimState(config); decodeSnapshot(encodeSnapshot(host.state), tmp); if (process.env.EXACT) { const e = cloneState(host.state); const f = process.env.EXACT!; tmp.cars.forEach((c, k) => { const h = e.cars[k]!; if (f.includes('p')) c.pos = h.pos; if (f.includes('v')) c.vel = h.vel; if (f.includes('q')) c.quat = h.quat; if (f.includes('w')) c.angVel = h.angVel; if (f.includes('b')) c.boost = h.boost; if (f.includes('t')) { c.jumpTimer = h.jumpTimer; c.dodgeTimer = h.dodgeTimer; c.demolished = h.demolished; } if (f.includes('i')) c.input = h.input; }); }
    const client = new Sim(config); client.loadState(tmp);
    const rng = new Rng(warm); const out: string[] = [];
    for (let i = 0; i < 120; i++) { const inp = config.cars.map(() => rnd(rng)); host.step(inp); client.step(inp);
      if (i % 20 === 19) { let w = 0, wi = -1; host.state.cars.forEach((c, k) => { for (let j = 0; j < 3; j++) { const d = Math.abs(c.pos[j]! - client.state.cars[k]!.pos[j]!); if (d > w) { w = d; wi = k; } } }); const bd = Math.abs(host.state.ball.pos[0]! - client.state.ball.pos[0]!); out.push(`${i + 1}:${w.toFixed(3)}(c${wi},ph ${host.state.phase},ball ${bd.toFixed(3)})`); } }
    console.log(warm, out.join(' '));
  }
});

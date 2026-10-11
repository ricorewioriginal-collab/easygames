import { it } from 'vitest';
import { Rng } from '../../rng';
import { game } from './gravifaenger';
it('trace', () => {
  const rng = new Rng(77);
  const s = game.init(1000, { playerIndex: 0, players: 4 });
  console.log('planets', JSON.stringify(s.planets.map(p=>[p.x.toFixed(1),p.y.toFixed(1),p.r.toFixed(1)])));
  let n = 0;
  while (!game.done(s)) {
    const inp = game.bot(s, 0.95, rng);
    game.step(s, inp);
    if (n++ % 20 === 0) console.log('TR', (s.tick/60).toFixed(1), 'pos', s.x.toFixed(1), s.y.toFixed(1), 'v', s.vx.toFixed(1), s.vy.toFixed(1), 'ang', s.ang.toFixed(2), 'th', inp.a, 'fuel', s.fuel.toFixed(2), 'orbs', s.collected, 'tgt', s.orbs.map(o=>`${o.x.toFixed(0)},${o.y.toFixed(0)}`).join(' '));
  }
});

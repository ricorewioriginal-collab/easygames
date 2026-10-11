import { it } from 'vitest';
import { Rng } from '../../rng';
import { game } from './gravifaenger';
it('stat', () => {
  for (const sk of [0.1, 0.5, 0.95]) {
    let a = 0, b = 0, c = 0, f = 0;
    for (let i = 0; i < 10; i++) {
      const rng = new Rng(77 + i);
      const s = game.init(1000 + i, { playerIndex: 0, players: 4 });
      while (!game.done(s)) game.step(s, game.bot(s, sk, rng));
      a += s.collected; b += s.crashes; c += s.bumps; f += s.fuel;
    }
    console.log('grav', sk, 'orbs', a / 10, 'crashes', b / 10, 'bumps', c / 10, 'fuel', f / 10);
  }
});

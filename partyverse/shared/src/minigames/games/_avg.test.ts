import { it } from 'vitest';
import { MINIGAMES } from '../registry';
import { runBot, simulate } from '../simulate';
it('avg', () => {
  const ids = (process.env.GID ?? '').split(',');
  for (const g of MINIGAMES.filter((m) => ids.includes(m.id))) {
    const o = { playerIndex: 0, players: 4 };
    const row: string[] = [];
    for (const sk of [0.1, 0.4, 0.7, 0.95]) {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(g, 1000 + i, o, sk, 77 + i).score;
      row.push(`${sk}:${(sum / 12).toFixed(1)}`);
    }
    let idle = 0;
    for (let i = 0; i < 12; i++) idle += simulate(g, 1000 + i, o, []).score;
    console.log(g.id, row.join(' '), 'idle', (idle / 12).toFixed(1));
  }
});
it('stats', () => {
  const ids = (process.env.GID ?? '').split(',');
  for (const g of MINIGAMES.filter((m) => ids.includes(m.id))) {
    for (const sk of [0.1, 0.95]) {
      const r = runBot(g, 1003, { playerIndex: 0, players: 4 }, sk, 80);
      const s = g.init(1003, { playerIndex: 0, players: 4 });
      const rr = simulate(g, 1003, { playerIndex: 0, players: 4 }, r.log);
      void s; void rr;
    }
  }
});

import { it } from 'vitest';
import { MINIGAMES } from '../registry';
import { runBot } from '../simulate';
it('tune', () => {
  for (const id of ['echomuster','takttreffer','pendelpunkt','spuernase','tippkraft']) {
    const g = MINIGAMES.find((m) => m.id === id)!;
    const out: string[] = [];
    for (const sk of [0.1, 0.3, 0.5, 0.7, 0.95]) {
      let sum = 0;
      for (let i = 0; i < 20; i++) sum += runBot(g, 100 + i, { playerIndex: 0, players: 4 }, sk, 9 + i).score;
      out.push(`${sk}:${Math.round(sum / 20)}`);
    }
    console.log(id, out.join('  '));
  }
});

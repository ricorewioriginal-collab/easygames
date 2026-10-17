import { describe, it, expect } from 'vitest';
import { sampleNet } from './helpers/sample';
import { World } from '../src/operations/world';

describe('Betrieb', () => {
  it('KI-Zug fährt Fahrplan Alpha → Omega mit Halten, ohne Rotfahrt', () => {
    const w = new World(sampleNet(), 8 * 3600);
    const ids = ['M_0', 'M_1', 'M_2', 'M_3'];
    w.pending.push({ id: 's1', nr: '101', kind: 'RE', form: 'dosto_re', prio: 5, spawn: 8 * 3600, stops: ids.map((id) => ({ st: id, dwell: 30 })) });
    let plan: any = null, train: any = null;
    for (let i = 0; i < 50 * 60 * 40 && !(w.trains.size === 0 && w.pending.length === 0); i++) {
      w.tick();
      if (!train && w.trains.size) { train = [...w.trains.values()][0]; plan = w.plans.get(train.id); }
    }
    expect(plan?.arrived.map((a: any) => a.st)).toEqual(ids);
    expect(w.score.spad).toBe(0);
    expect(w.score.collisions).toBe(0);
  });
});

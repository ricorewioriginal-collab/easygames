import { NetBuilder } from '../../src/railway/builder';

export function sampleNet() {
  const b = new NetBuilder('test', 'Testnetz', 'custom', { terrain: 'plain' });
  const main = b.line({
    id: 'M', name: 'Hauptbahn', double: true, vmax: 160, elec: true,
    ctrl: [[0, 0, 50], [6000, 500, 55], [12000, 0, 60], [18000, -800, 52]],
    stations: [{ name: 'Alpha', at: 0 }, { name: 'Beta', at: 1, pt: 4, yard: { n: 3, len: 250, side: 'R', name: 'Güterbf', industries: [{ name: 'Hafen', cargo: ['container'], action: 'unload', track: 0 }] } }, { name: 'Gamma', at: 2, junction: { side: 'R', at: 'exit', name: 'Delta' } }, { name: 'Omega', at: 3 }],
  });
  const j = main.stations[2].junction!;
  b.line({ id: 'B', name: 'Nebenbahn', double: false, vmax: 100, elec: false, from: { g1: j.g1 }, entrySignal: 'Abzw',
    ctrl: [[j.pos[0], j.pos[2], j.pos[1]], [j.pos[0] + j.dir[0] * 4000, j.pos[2] + j.dir[1] * 4000 + 1500, 70], [j.pos[0] + j.dir[0] * 9000, j.pos[2] + j.dir[1] * 9000 + 2500, 90]],
    stations: [{ name: 'Junction', at: 0, halt: true }, { name: 'Dorf', at: 1 }, { name: 'Endstation', at: 2 }] });
  return b.done();
}


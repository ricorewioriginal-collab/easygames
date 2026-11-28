import { describe, it, expect } from 'vitest';
import { areaAt, AreaWatch } from '../src/game/area';

describe('Ortsschilder', () => {
  it('erkennt Viertel', () => {
    expect(areaAt(-15, 18).id).toBe('plaza');
    expect(areaAt(150, 20).id).toBe('hochstadt');
    expect(areaAt(-80, 0).id).toBe('hafen');
    expect(areaAt(75, 0).id).toBe('bruecke');
  });
  it('meldet Wechsel erst nach kurzer Zeit, beim Start nicht', () => {
    const w = new AreaWatch();
    expect(w.update(2, areaAt(-15, 18))).toBeNull();
    expect(w.update(.5, areaAt(150, 20))).toBeNull();
    expect(w.update(1.2, areaAt(150, 20))?.name).toBe('Hochstadt');
  });
});

import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { showCalls, showResult, SHOW_CALLS, FM_WISSEN } from '../src/game/pridefm';
import { STATIONS } from '../src/engine/Radio';

describe('Pride FM und Autoradio', () => {
  it('Autoradio: nur die 13 eigenen Sender, eigene Stream-Adresse und Aus', () => {
    expect(STATIONS.filter((s) => s.slug).length).toBe(13);
    expect(STATIONS.map((s) => s.id).filter((id) => !STATIONS.find((s) => s.id === id)!.slug)).toEqual(['eigen', 'off']);
    expect(FM_WISSEN.length).toBeGreaterThanOrEqual(8);
  });
  it('Sendung: drei verschiedene Anrufe am Tag, jede Frage hat eine beste Antwort', () => {
    const s = defaults(); s.day = 3;
    expect(new Set(showCalls(s)).size).toBe(3);
    for (const c of SHOW_CALLS) expect(c.a.filter((a) => a[1] === 2).length).toBe(1);
    expect(showResult(6).money).toBeGreaterThan(showResult(0).money);
  });
});

import { describe, it, expect } from 'vitest';
import { STATIONS, stationOf } from '../src/engine/Radio';

describe('Autoradio', () => {
  it('hat die 13 echten Sender, vier Stadt-Sender und „aus“', () => {
    expect(STATIONS.filter((s) => s.slug).length).toBe(13);
    expect(STATIONS.filter((s) => s.song).length).toBe(5);
    expect(new Set(STATIONS.map((s) => s.id)).size).toBe(STATIONS.length);
    expect(STATIONS[STATIONS.length - 1].id).toBe('off');
  });
  it('liest alte Speicherstände (Senderplatz als Zahl)', () => {
    expect(stationOf(1).id).toBe('neon');
    expect(stationOf(4).id).toBe('off');
    expect(stationOf('rock').slug).toBe('rockradio24');
    expect(stationOf(undefined).id).toBe('ricorewi');
  });
});

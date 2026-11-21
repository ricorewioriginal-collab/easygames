import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { wagenOf, wagenKey, score, place, mottoText, MOTTOS, MAX_SCORE } from '../src/game/festwagen';

describe('CSD-Festwagen', () => {
  it('ohne Bau kein Wagen, Entwurf wird gespeichert und geprüft', () => {
    const s = defaults();
    expect(wagenOf(s)).toBeNull();
    s.flags.wagen = wagenKey({ flag: 'trans', farbe: 'gold', motto: 2, deko: 'kugel', sound: 'unbekannt' });
    expect(wagenOf(s)).toEqual({ flag: 'trans', farbe: 'gold', motto: 2, deko: 'kugel', sound: 'box' });
  });
  it('Jury-Punkte und Platz, Krone gibt Bonus und eigenes Motto', () => {
    const s = defaults(), w = { flag: 'rainbow', farbe: 'pink', motto: 0, deko: 'kugel', sound: 'techno' };
    expect(score(s, w)).toBe(9); expect(place(score(s, w))).toBe(2);
    s.flags.dragKrone = true; s.flags.drag = 'Rica Royale';
    expect(score(s, w)).toBe(11); expect(place(11)).toBe(1); expect(score(s, w)).toBeLessThanOrEqual(MAX_SCORE);
    expect(mottoText(s, { ...w, motto: MOTTOS.length })).toBe('KÖNIGIN RICA ROYALE');
    expect(place(4)).toBe(3);
  });
});

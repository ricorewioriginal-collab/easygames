import { describe, it, expect } from 'vitest';
import { quick, outfitLine, STORIES, memOf, remember, greet, nextPart, heardPart, finish, phaseAt, storyOf } from '../src/game/leben';

const save = () => ({ day: 1, money: 100, rep: 0, name: 'Kim', flags: {} as Record<string, string | number | boolean> }) as never as import('../src/engine/Save').SaveData;

describe('Leben der Straßenleute', () => {
  it('jede Geschichte hat vier Teile und zwei Enden', () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(16);
    for (const st of STORIES) { expect(st.parts).toHaveLength(4); expect(st.end).toHaveLength(2); }
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
  });
  it('ein Teil pro Tag, am Ende Belohnung', () => {
    const s = save(), k = 'street:3:Male_Adult_02';
    expect(nextPart(s, k)?.i).toBe(0);
    heardPart(s, k); expect(nextPart(s, k)).toBeNull();   // heute schon erzählt
    for (let d = 2; d <= 4; d++) { s.day = d; expect(nextPart(s, k)?.i).toBe(d - 1); heardPart(s, k); }
    s.day = 5; expect(nextPart(s, k)).toBeNull();
    const e = storyOf(k).end[0]; finish(s, k, e);
    expect(memOf(s, k).done).toBe(e.label);
    expect(s.money).toBe(100 + (e.money || 0));
  });
  it('Gedächtnis: fast überfahren macht sauer, Gespräche freundlich', () => {
    const s = save(), k = 'street:1:x';
    remember(s, k, 'near');
    const m = memOf(s, k); expect(m.mood).toBeLessThan(0);
    expect(greet(m, { hour: 12, rain: false, wanted: 0, name: 'Kim' }, 1)).toMatch(/fahr|Bleifuß|Seite/);
    for (let d = 1; d <= 6; d++) { s.day = d; remember(s, k, 'talk'); }
    expect(greet(memOf(s, k), { hour: 12, rain: false, wanted: 0, name: 'Kim' }, 0)).toContain('Kim');
  });
  it('Tagesablauf', () => {
    expect(phaseAt(12.5, 1)).toBe('mittag');
    expect(phaseAt(8, 0)).toBe('weg');
    expect(phaseAt(22, 0)).toBe('abend');
    expect(['schlaf', 'abend']).toContain(phaseAt(3, 1));
  });
  it('schnelle Gesten ändern die Stimmung', () => {
    const s = save(), k = 'street:2:y';
    expect(quick(s, k, 'stress', 0).mood).toBe(-3);
    expect(quick(s, k, 'gruss', 0).text).toMatch(/Hm|hallo/i);
    expect(quick(s, k, 'ruhe', 0).mood).toBeGreaterThanOrEqual(0);
    expect(quick(s, k, 'lob', 1).mood).toBeGreaterThan(0);
  });
  it('Outfit-Kommentare', () => {
    expect(outfitLine('swim', false, false, 1)).toMatch(/Strand|Bade|Hafen/);
    expect(outfitLine('shirtless', false, true, 1)).toMatch(/Regen|Wetter/);
  });
});

import { known as knownList, moodWord } from '../src/game/leben';
describe('Bekanntenliste', () => {
  it('merkt sich Namen und Reihenfolge', () => {
    const s = save();
    remember(s, 'street:1:a', 'talk', 'Kalle');
    remember(s, 'street:2:b', 'talk', 'Mia');
    remember(s, 'street:1:a', 'talk');
    const l = knownList(s);
    expect(l.map((x) => x.name)).toEqual(['Kalle', 'Mia']);
    expect(l[0].m.met).toBe(2);
    expect(moodWord(5)).toContain('sehr');
  });
});

import { FIG_STORIES, figKey } from '../src/game/leben';
describe('Geschichten der festen Figuren', () => {
  it('jede hat vier Teile und zwei Enden, storyOf findet sie', () => {
    for (const [id, st] of Object.entries(FIG_STORIES)) {
      expect(st.parts.length).toBe(4); expect(st.end.length).toBe(2);
      expect(storyOf(figKey(id))).toBe(st);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { STORIES, memOf, remember, greet, nextPart, heardPart, finish, phaseAt, storyOf } from '../src/game/leben';

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
});

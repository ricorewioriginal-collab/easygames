import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { segment, cityNews, FmTalk, showCalls, showResult, SHOW_CALLS, FM_WISSEN } from '../src/game/pridefm';

describe('Pride FM', () => {
  it('Beiträge wechseln sich ab: Moderation, Anruf, Nachrichten, Wissen', () => {
    const s = defaults(), kinds = new Set<string>();
    for (let n = 0; n < 10; n++) segment(s, n).forEach((x) => kinds.add(x.who.split(' ')[0]));
    expect(kinds.has('📞')).toBe(true); expect(kinds.has('📚')).toBe(true);
    expect(FM_WISSEN.length).toBeGreaterThanOrEqual(8);
  });
  it('Gruß kommt einmal auf Sendung, Nachrichten folgen dem Spielstand', () => {
    const s = defaults(); s.name = 'Rico'; s.flags.radioGruss = 'Hallo Welt';
    expect(segment(s, 7)[0].text).toContain('Hallo Welt'); expect(s.flags.radioGruss).toBeUndefined();
    expect(cityNews(s)).toEqual([]);
    s.flags.dragKrone = true; s.flags.drag = 'Rica Royale';
    expect(cityNews(s)[0]).toContain('Rica Royale');
  });
  it('Untertitel laufen der Reihe nach', () => {
    const s = defaults(), t = new FmTalk();
    expect(t.tick(1, s)).toBe(false); expect(t.tick(6, s)).toBe(true); expect(t.cur?.text).toBeTruthy();
  });
  it('Sendung: drei verschiedene Anrufe am Tag, jede Frage hat eine beste Antwort', () => {
    const s = defaults(); s.day = 3;
    expect(new Set(showCalls(s)).size).toBe(3);
    for (const c of SHOW_CALLS) expect(c.a.filter((a) => a[1] === 2).length).toBe(1);
    expect(showResult(6).money).toBeGreaterThan(showResult(0).money);
  });
});

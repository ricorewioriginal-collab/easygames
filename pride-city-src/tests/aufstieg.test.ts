import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { BUSINESSES, buy } from '../src/game/empire';
import { ranking, myRank, rivalWorth, RIVALS, worth } from '../src/game/mogul';
import { quality, postShot, followers, BRIEFS, takeBrief, type ShotCtx } from '../src/game/gram';
import { muskel, train, setTattoo, setPiercing, setBeard, figOf, MUS_START } from '../src/game/figur';
import { BEATS } from '../src/game/aufstieg';

const shot = (o: Partial<ShotCtx> = {}): ShotCtx => ({ spot: 'plaza', spotName: 'Plaza', hour: 19, day: 3, people: 3, me: true, selfie: false, filter: 'gold',
  bare: false, mus: .2, tattoos: 0, parade: false, rainbow: false, rain: false, x: 0, z: 0, ...o });

describe('Aufstieg: Imperium', () => {
  it('Kranhaus ist bis zum Ende von Akt IV gesperrt', () => {
    const s = defaults(); s.money = 99999; s.rep = 99;
    const k = BUSINESSES.find((b) => b.id === 'kranhaus')!;
    expect(buy(s, k)).toBeTruthy();
    s.flags.flutEnd = 1;
    expect(buy(s, k)).toBeNull();
  });
  it('Ranking sortiert, Kral fällt nach Akt IV heraus', () => {
    const s = defaults();
    const r = ranking(s);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].worth).toBeGreaterThanOrEqual(r[i].worth);
    const kral = RIVALS.find((x) => /kral/i.test(x.id))!;
    expect(rivalWorth(s, kral)).toBeGreaterThan(0);
    s.flags.flutEnd = 1; expect(rivalWorth(s, kral)).toBe(0);
    s.money = 10_000_000; expect(myRank(s)).toBe(1); expect(worth(s)).toBeGreaterThan(0);
  });
});

describe('Aufstieg: Glitzergram', () => {
  it('goldene Stunde und Leute im Bild geben mehr Likes, Posten bringt Follower', () => {
    const s = defaults();
    expect(quality(s, shot())).toBeGreaterThan(quality(s, shot({ hour: 13, people: 0, spot: null, me: false })));
    const r = postShot(s, shot(), 'data:', 'Hallo', .5);
    expect(r.likes).toBeGreaterThan(0);
    expect(followers(s)).toBeGreaterThan(0);
  });
  it('Aufträge brauchen genug Follower', () => {
    const s = defaults(); const b = [...BRIEFS].sort((a, c) => c.need - a.need)[0];
    expect(takeBrief(s, b.id)).toBeTruthy();
    s.flags.fol = b.need; expect(takeBrief(s, b.id)).toBeNull();
  });
});

describe('Aufstieg: Figur', () => {
  it('Training baut auf, höchstens zwei Einheiten am Tag, Pause baut ab', () => {
    const s = defaults(); s.money = 500;
    expect(muskel(s)).toBe(MUS_START);
    expect(train(s, 'kraft')).toBeGreaterThan(0);
    expect(train(s, 'kraft')).toBeGreaterThan(0);
    expect(train(s, 'kraft')).toBe(0);
    const m = muskel(s); expect(m).toBeGreaterThan(MUS_START);
    s.day += 8; expect(muskel(s)).toBeLessThan(m);
  });
  it('Tattoos, Piercings und Bart landen in der Figur', () => {
    const s = defaults(); s.money = 2000;
    expect(setTattoo(s, 'herz', true)).toBeNull();
    expect(setPiercing(s, 'nase', true)).toBeNull();
    expect(setBeard(s, 'voll', 'pink')).toBeNull();
    const f = figOf(s);
    expect(f.tat).toContain('herz'); expect(f.pier).toContain('nase'); expect(f.beard).toBe('voll:pink');
    expect(setTattoo(s, 'herz', false)).toBeNull(); expect(figOf(s).tat).not.toContain('herz');
  });
});

describe('Aufstieg: Geschichte', () => {
  it('jeder Anruf hat eine eindeutige Id und Text', () => {
    const s = defaults(); s.name = 'Kim'; s.flags.fol = 20000; s.chapter = 6;
    expect(new Set(BEATS.map((b) => b.id)).size).toBe(BEATS.length);
    for (const b of BEATS) expect(b.lines(s).length).toBeGreaterThan(0);
  });
});

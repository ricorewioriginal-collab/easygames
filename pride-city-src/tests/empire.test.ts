import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { BUSINESSES, buy, collect, income, owns, nextFare } from '../src/game/empire';
import { walkable } from '../src/game/World';
import { GIGS } from '../src/game/gigs';

describe('Imperium', () => {
  it('kaufen braucht Geld und Ruf, Einnahmen kommen einmal je Tag', () => {
    const s = defaults(); s.money = 1000; s.rep = 0;
    const spaeti = BUSINESSES[0], prisma = BUSINESSES.find((b) => b.id === 'prisma')!;
    expect(buy(s, prisma)).toMatch(/Ruf/);
    expect(buy(s, spaeti)).toBeNull();
    expect(owns(s, 'spaeti')).toBe(true);
    expect(s.money).toBe(1000 - spaeti.price);
    expect(buy(s, spaeti)).toMatch(/schon/);
    expect(collect(s)).toBe(0); // am Kauftag noch nichts
    s.day += 2;
    expect(collect(s)).toBe(2 * income(s));
    expect(collect(s)).toBe(0);
  });
  it('Taxi-Fahrten haben Abholung, Ziel und steigenden Lohn', () => {
    const a = nextFare(0, .1), b = nextFare(4, .1);
    expect(a.steps).toHaveLength(2);
    expect(b.pay).toBeGreaterThan(a.pay);
    for (let i = 0; i < 10; i++) for (const st of nextFare(0, i / 10).steps) expect(walkable(st.x, st.z)).toBe(true);
  });
  it('alle Auftragsstationen liegen auf begehbarem Boden', () => {
    for (const g of GIGS) for (const st of g.steps) expect(walkable(st.x, st.z), `${g.id}: ${st.label}`).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { lineup, weekKey, claim, doneThisWeek, isOpen, daysLeft, EVENTS, crowns } from '../src/game/live';
import { skyAt, seasonOf, xmasOf, silvesterOf, useSeason, season, isXmas, forecast } from '../src/game/weather';
import { TOURS, tourGig, cargoGig, schnupperGig, tourOpen } from '../src/game/luft';
import { CAR_DEFS } from '../src/game/vehicles';

describe('Jahreszeiten und Wetter', () => {
  it('Jahreszeit folgt dem Kalender, Festtage stimmen', () => {
    expect(seasonOf(new Date(2026, 10, 22))).toBe('herbst');
    expect(seasonOf(new Date(2026, 11, 24))).toBe('winter');
    expect(seasonOf(new Date(2026, 6, 1))).toBe('sommer');
    expect(xmasOf(new Date(2026, 11, 24))).toBe(true);
    expect(xmasOf(new Date(2026, 11, 28))).toBe(false);
    expect(silvesterOf(new Date(2026, 11, 31))).toBe(true);
    expect(silvesterOf(new Date(2027, 0, 1))).toBe(true);
  });
  it('Schnee nur im Winter, Weihnachten schneit es abends, Silvesternacht klar', () => {
    useSeason('sommer');
    for (let d = 2; d < 200; d++) for (let t = 0; t < 1; t += .25) expect(skyAt(d, t + .01)).not.toBe('schnee');
    useSeason('winter'); let snow = 0;
    for (let d = 2; d < 200; d++) if (skyAt(d, .3) === 'schnee') snow++;
    expect(snow).toBeGreaterThan(30);
    useSeason('xmas'); expect(isXmas()).toBe(true); expect(season()).toBe('winter');
    expect(skyAt(10, .6)).toBe('schnee'); expect(skyAt(10, .9)).toBe('schnee');
    useSeason('silvester'); expect(skyAt(10, .9)).toBe('klar');
    expect(forecast(3, .1)).toHaveLength(4);
    useSeason('auto');
  });
});

describe('Live-Events der Woche', () => {
  it('jede Woche eine Party, ein Konzert und ein Bootsrennen, für alle gleich', () => {
    const wk = weekKey(new Date(2026, 10, 22));
    expect(wk).toBe(202647);
    const l = lineup(wk);
    expect(l.map((e) => e.kind)).toEqual(['party', 'konzert', 'boot']);
    expect(lineup(wk).map((e) => e.id)).toEqual(l.map((e) => e.id));
    const seen = new Set<string>(); for (let w = 202601; w <= 202652; w++) lineup(w).forEach((e) => seen.add(e.id));
    expect(seen.size).toBeGreaterThan(EVENTS.length - 3);
    expect(daysLeft(new Date(2026, 10, 23))).toBe(7);   // Montag
    expect(daysLeft(new Date(2026, 10, 22))).toBe(1);   // Sonntag
  });
  it('Zeitfenster und Wochenpass', () => {
    const s = defaults(); s.time = (22 - 6) / 24;
    expect(isOpen(s, 'party')).toBe(true); expect(isOpen(s, 'boot')).toBe(false);
    s.time = (1 - 6 + 24) / 24; expect(isOpen(s, 'party')).toBe(true);
    const [p, k, b] = lineup(); const m0 = s.money;
    expect(claim(s, p)).toBe(false); expect(doneThisWeek(s, 'party')).toBe(true);
    expect(claim(s, k)).toBe(false);
    expect(claim(s, b)).toBe(true); expect(s.money).toBe(m0 + 300); expect(crowns(s)).toBe(1);
    expect(claim(s, b)).toBe(false); expect(crowns(s)).toBe(1);
  });
  it('Bootsrennen haben Bojen und Medaillenzeiten', () => {
    for (const e of EVENTS.filter((x) => x.kind === 'boot')) { expect(e.cps!().length).toBeGreaterThan(4); expect(e.medal![0]).toBeLessThan(e.medal![2]); }
  });
});

describe('Flugschule', () => {
  it('Möwe und Libelle fliegen', () => {
    const air = CAR_DEFS.filter((c) => c.air);
    expect(air.map((c) => c.id).sort()).toEqual(['flieger', 'heli']);
    for (const c of air) expect(c.fly).toBe(true);
  });
  it('Rundflüge, Schnupperflug und Lieferflüge enden mit einer Landung', () => {
    const s = defaults();
    for (const t of TOURS) { const g = tourGig(s, t); expect(g.steps.at(-1)!.low).toBe(true); expect(g.steps.slice(0, -1).every((x) => x.y! > 5 && x.air)).toBe(true); }
    expect(tourGig({ ...s, settings: { ...s.settings, adult: true } }, TOURS[1]).steps.length).toBe(tourGig(s, TOURS[1]).steps.length + 1);
    const g = schnupperGig(s); g.after!(); expect(s.flags.luftSchein).toBeTruthy();
    const c = cargoGig(s, .3); expect(c.steps[0].low).toBe(true); expect(c.pay).toBeGreaterThan(50);
    s.time = (12 - 6) / 24; expect(tourOpen(s, TOURS[2])).toBe(false); s.time = (18 - 6) / 24; expect(tourOpen(s, TOURS[2])).toBe(true);
  });
});

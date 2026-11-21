import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { walkable } from '../src/game/World';
import { CAR_DEFS, SHOP, RACES, GARAGE, buyCar, buyTune, buyPaint, myCar, tuneLevel, stats, medalFor, finishRace, raceGig, nextParcel, carDef, TUNE_COST, PAINT_COST } from '../src/game/vehicles';

describe('Fuhrpark, Garage und Rennen', () => {
  it('hat eindeutige Wagen, käufliche Modelle und sinnvolle Fahrwerte', () => {
    expect(new Set(CAR_DEFS.map((c) => c.id)).size).toBe(CAR_DEFS.length);
    expect(SHOP.length).toBe(8);
    for (const c of CAR_DEFS) { expect(c.turbo).toBeGreaterThan(c.max); expect(c.acc).toBeGreaterThan(5); }
    expect(carDef('gibtsnicht').id).toBe('hatch');
    expect(stats(carDef('renn'), 3).turbo).toBeCloseTo(36 * 1.21);
  });
  it('Garage: kaufen, wechseln, lackieren, tunen', () => {
    const s = defaults(); s.money = 2000;
    expect(myCar(s)).toBe(null);
    expect(buyTune(s)).toContain('eigenen Wagen'); expect(buyPaint(s, 0)).toContain('eigenen Wagen');
    expect(buyCar(s, carDef('renn'))).toContain('fehlen');
    expect(buyCar(s, carDef('hatch'))).toContain('nicht zu kaufen');
    expect(buyCar(s, carDef('bulli'))).toBe(null); expect(s.money).toBe(1400); expect(myCar(s)!.id).toBe('bulli');
    expect(buyCar(s, carDef('bulli'))).toContain('schon');
    expect(buyPaint(s, 222)).toBe(null); expect(s.flags.carHue).toBe(222); expect(s.money).toBe(1400 - PAINT_COST);
    expect(buyTune(s)).toBe(null); expect(tuneLevel(s)).toBe(1); expect(s.money).toBe(1400 - PAINT_COST - TUNE_COST[0]);
    s.money = 5000; buyTune(s); buyTune(s); expect(tuneLevel(s)).toBe(3); expect(buyTune(s)).toContain('Mehr Turbo');
  });
  it('Rennen: Tore liegen auf der Straße, Medaillen und Preisgeld stimmen', () => {
    for (const r of RACES) { expect(walkable(r.start[0], r.start[1]), r.id).toBe(true); for (const [x, z] of r.cps) expect(walkable(x, z), `${r.id} ${x},${z}`).toBe(true); expect(r.medal[0]).toBeLessThan(r.medal[1]); }
    const r = RACES[0], s = defaults(); s.money = 0;
    expect(medalFor(r, r.medal[0])).toBe(0); expect(medalFor(r, r.medal[2] + 1)).toBe(-1);
    const a = finishRace(s, r, r.medal[1]); expect(a.medal).toBe(1); expect(s.money).toBe(r.prize[1]); expect(a.record).toBe(true);
    const b = finishRace(s, r, r.medal[1] + 5); expect(b.pay).toBe(15); expect(b.record).toBe(false);
    const c = finishRace(s, r, r.medal[0] - 1); expect(c.medal).toBe(0); expect(c.pay).toBe(r.prize[0]);
    let sec = -1, fail = 0; const g = raceGig(r, (x) => { sec = x; }, () => { fail++; });
    expect(g.steps.length).toBe(r.cps.length); expect(g.time).toBe(r.medal[2]); g.after!(20); expect(sec).toBe(r.medal[2] - 20); g.failed!(); expect(fail).toBe(1);
  });
  it('Paketdienst: Depot an der Garage, Ladefläche bringt mehr', () => {
    expect(walkable(GARAGE.x, GARAGE.z)).toBe(true);
    for (let i = 0; i < 13; i++) { const g = nextParcel(0, i / 13 + .01, false); for (const st of g.steps) expect(walkable(st.x, st.z), st.label).toBe(true); }
    expect(nextParcel(0, .3, true).pay).toBeGreaterThan(nextParcel(0, .3, false).pay);
    expect(nextParcel(3, .3, false).rep).toBe(1);
  });
});

describe('Weitere Fahrzeuge (Roller, Bus, Boot)', () => {
  it('sind als eigene Fahrzeuge da, nicht käuflich und mit Autosteuerung', () => {
    for (const id of ['roller', 'pridebus', 'boot']) { const c = carDef(id); expect(c.id).toBe(id); expect(c.ride).toBeTruthy(); expect(c.price).toBe(0); expect(c.turbo).toBeGreaterThan(c.max); }
    expect(walkable(-98.4, 30)).toBe(false);   // Boot liegt im Wasser am Kai
    expect(walkable(-95.5, 30)).toBe(true);    // vom Kai aus erreichbar
  });
});

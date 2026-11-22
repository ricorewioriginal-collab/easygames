import { describe, it, expect } from 'vitest';
import { Save } from '../src/engine/Save';
import { berufOf, BERUFE, BERUFE_18, KARRIEREN, karrieren, annehmen, meinBeruf, stand, bonus, drehStufe } from '../src/game/beruf';
import { finish, JOBS } from '../src/game/jobs';
import { drehResult, SZENEN } from '../src/game/dreh';

const fresh = () => { const sv = new Save(); sv.newGame(); return sv.data; };

describe('Berufe', () => {
  it('gleiche Person hat immer denselben Beruf, Uniform verrät ihn', () => {
    expect(berufOf('street:3:Male_Adult_02', 'Male_Adult_02', false)).toEqual(berufOf('street:3:Male_Adult_02', 'Male_Adult_02', false));
    expect(berufOf('x', 'Police_Female_01', true).name).toBe('Polizist*in');
    expect(berufOf('x', 'Male_Child_01', true).name).toBe('Schüler*in');
  });
  it('Berufe ab 18 nur mit 18+', () => {
    const keys = Array.from({ length: 300 }, (_, i) => 'k' + i);
    expect(keys.some((k) => BERUFE_18.includes(berufOf(k, 'Male_Adult_01', false)))).toBe(false);
    expect(keys.some((k) => BERUFE_18.includes(berufOf(k, 'Male_Adult_01', true)))).toBe(true);
    expect(keys.filter((k) => BERUFE.includes(berufOf(k, 'Male_Adult_01', false))).length).toBe(300);
  });
});

describe('Jobbörse', () => {
  it('führt alle Schichtjobs und vorhandene Laufbahnen, Darsteller*in nur mit 18+', () => {
    const s = fresh();
    for (const j of JOBS) expect(KARRIEREN.some((k) => k.id === j.id)).toBe(true);
    expect(karrieren(s).some((k) => k.id === 'dreh')).toBe(false);
    s.settings.adult = true;
    expect(karrieren(s).some((k) => k.id === 'dreh')).toBe(true);
    for (const k of karrieren(s)) expect(k.poi || k.app).toBeTruthy();
  });
  it('Hauptberuf annehmen, wechseln, kündigen; +20 % Lohn', () => {
    const s = fresh();
    expect(meinBeruf(s)).toBeNull();
    annehmen(s, 'shop'); expect(meinBeruf(s)!.id).toBe('shop'); expect(bonus(s, 'shop')).toBe(1.2);
    s.needs.energy = 100; const m0 = s.money; const a = finish(s, JOBS[0], 6).pay; expect(s.money - m0).toBe(a);
    const s2 = fresh(); s2.needs = { ...s.needs }; const b = finish(s2, JOBS[0], 6).pay;
    expect(a).toBeGreaterThan(b);
    expect(annehmen(s, 'drag')!.id).toBe('shop');
    annehmen(s, null); expect(meinBeruf(s)).toBeNull();
    expect(stand(s, KARRIEREN.find((k) => k.id === 'drag')!)).toBe('noch kein Battle');
  });
});

describe('Darsteller*in', () => {
  it('Fans, Szenen und Stufe steigen, Gage wächst mit', () => {
    const s = fresh();
    const r1 = drehResult(s, 6, .9);
    expect(r1.stars).toBeGreaterThanOrEqual(4);
    expect(Number(s.flags.drehN)).toBe(1);
    for (let i = 0; i < 30; i++) drehResult(s, 6, .9);
    expect(drehStufe(s)).toBeGreaterThanOrEqual(3);
    expect(drehResult(s, 6, .9).gage).toBeGreaterThan(r1.gage);
    expect(SZENEN.length).toBeGreaterThanOrEqual(4);
  });
});

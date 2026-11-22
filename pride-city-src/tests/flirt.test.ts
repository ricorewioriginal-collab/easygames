import { describe, it, expect } from 'vitest';
import { defaults as fresh } from '../src/engine/Save';
import { guestCast, stranger, flirtTry, nightAnswer, nightReview, flirted, PICKUP, REVIEW } from '../src/game/flirt';
import { exposure, stiTick, testAndTreat, setRoll, symptoms, untreated, stiState } from '../src/game/sti';

describe('Mit allen reden', () => {
  it('Gäste sind je Raum verschieden und ohne Doppelte', () => {
    const a = guestCast('res_jonas|', 3, { adult: false, party: false }), b = guestCast('bad|', 3, { adult: false, party: false, swim: true });
    expect(new Set(a.map((g) => g.rb)).size).toBe(3);
    expect(a.map((g) => g.rb).join()).not.toBe(b.map((g) => g.rb).join());
    expect(b.every((g) => g.outfit === 'swim')).toBe(true);
    expect(guestCast('club|club', 6, { adult: false, party: true }).some((g) => g.outfit === 'harness')).toBe(false);
  });
  it('Namen sind fest je Person', () => {
    expect(stranger('x', 'Female_Adult_03').name).toBe(stranger('x', 'Female_Adult_03').name);
    expect(stranger('x', 'Male_Adult_03', 'Rocco').name).toBe('Rocco');
  });
  it('ohne geglückten Flirt gibt es kein Ja; Bewertung 1–5 mit Text', () => {
    const s = fresh(); s.settings.adult = true;
    expect(nightAnswer(s, 'p').yes).toBe(false);
    let ok = false; for (let i = 0; i < PICKUP.length && !ok; i++) ok = flirtTry(s, 'p', i);
    if (ok) expect(flirted(s, 'p')).toBe(true);
    const r = nightReview(s, 'p');
    expect(r.stars).toBeGreaterThanOrEqual(1); expect(r.stars).toBeLessThanOrEqual(5);
    expect(REVIEW[r.stars]).toContain(r.text);
  });
});

describe('STI', () => {
  it('mit Kondom kein Risiko, ohne Ansteckung, Symptome, Test, Heilung', () => {
    const s = fresh(); s.settings.adult = true;
    setRoll(() => 0);
    expect(exposure(s, false).caught).toEqual([]);
    const x = exposure(s, true);
    expect(x.caught.length).toBe(3); expect(x.hiv).toBe(true);
    s.day += 5; stiTick(s);
    expect(untreated(s).length).toBe(3);
    const t = testAndTreat(s);
    expect(t.found.length).toBe(3);
    s.day += 3; const h = stiTick(s);
    expect(h.healed.length).toBe(3); expect(Object.keys(stiState(s))).toEqual([]);
    expect(symptoms(s)).toEqual([]);
    setRoll(Math.random);
  });
  it('PEP innerhalb von 72 Stunden verhindert HIV', () => {
    const s = fresh(); s.settings.adult = true; setRoll(() => 0);
    exposure(s, true); s.day += 1;
    const t = testAndTreat(s);
    expect(t.pep).toBe(true); expect(t.hivNew).toBe(false); expect(s.flags.hiv).toBeUndefined();
    setRoll(Math.random);
  });
  it('PrEP schützt vor HIV, nicht vor anderen STI', () => {
    const s = fresh(); s.settings.adult = true; s.health.prep = true; setRoll(() => 0);
    const x = exposure(s, true); expect(x.hiv).toBe(false); expect(x.caught.length).toBe(3);
    setRoll(Math.random);
  });
});

describe('STI realistisch', () => {
  it('Risiko je Kontakt niedrig: unter 10 % ohne Kondom, frisch getestet deutlich weniger', async () => {
    const { STIS, PARTNER_STATUS } = await import('../src/game/sti');
    const any = 1 - STIS.reduce((p, d) => p * (1 - d.risk), 1);
    expect(any).toBeLessThan(.1);
    const fresh = PARTNER_STATUS.find((p) => p.id === 'frisch')!;
    expect(1 - STIS.reduce((p, d) => p * (1 - d.risk * fresh.f), 1)).toBeLessThan(.025);
  });
  it('PrEP-Partner*in ohne HIV-Risiko: kein PEP-Fenster', () => {
    const s = fresh(); s.settings.adult = true; setRoll(() => .5);
    const prep = { id: 'prep' as const, label: '', f: .6, hiv: 0 };
    const x = exposure(s, true, { partners: [{ status: prep }] });
    expect(x.hiv).toBe(false); expect(s.flags.pepBy).toBeUndefined(); expect(x.caught).toEqual([]);
    setRoll(Math.random);
  });
  it('in 100 ungeschützten Nächten nicht jedes Mal krank', () => {
    const s = fresh(); s.settings.adult = true; let n = 0;
    for (let i = 0; i < 100; i++) { s.flags.sti = '{}'; if (exposure(s, true).caught.length) n++; }
    expect(n).toBeLessThan(25);
  });
});

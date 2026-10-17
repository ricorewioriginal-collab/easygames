// Figurenerstellung: reine Helfer (Zufallsperson, Haushaltsprüfung) ohne DOM/WebGL.
import { describe, expect, it } from 'vitest';
import { AGE_STAGES, type AgeStage } from '../src/data/types';
import { TRAITS } from '../src/data/traits';
import type { CustomMember, NewGameOpts } from '../src/sim/setup';
import { randomMember, validateHousehold } from '../src/ui/cas';

type HH = NonNullable<NewGameOpts['custom']>;
const hh = (members: CustomMember[], extra: Partial<HH> = {}): HH => ({ name: 'Familie Test', members, ...extra });
const mem = (seed: number, age: AgeStage, o: Partial<CustomMember> = {}): CustomMember => ({ ...randomMember(seed, age), last: 'Test', ...o });

describe('randomMember', () => {
  it('erzeugt gültige Personen für jede Altersstufe', () => {
    for (const age of AGE_STAGES)
      for (let s = 1; s <= 25; s++) {
        const m = randomMember(s * 7919, age);
        expect(m.age).toBe(age);
        expect(m.first.trim().length).toBeGreaterThan(0);
        expect(m.last.trim().length).toBeGreaterThan(0);
        expect(['sie', 'er', 'they']).toContain(m.pronoun);
        expect(m.traits.length).toBeLessThanOrEqual(3);
        expect((m.hobbies ?? []).length).toBeLessThanOrEqual(3);
        expect(m.look.outfits.everyday).toBeDefined();
        // allein (mit einer erwachsenen Begleitung, falls nötig) ist der Haushalt gültig
        const members = age === 'youngadult' || age === 'adult' || age === 'senior' ? [m] : [randomMember(s, 'adult'), m];
        expect(validateHousehold(hh(members))).toBeNull();
      }
  });
  it('ist deterministisch und ohne Alter meist erwachsen', () => {
    expect(randomMember(42)).toEqual(randomMember(42));
    for (let s = 1; s < 30; s++) expect(['youngadult', 'adult', 'senior']).toContain(randomMember(s).age);
  });
});

describe('validateHousehold', () => {
  const family = (): CustomMember[] => [mem(1, 'adult'), mem(2, 'adult'), mem(3, 'child'), mem(4, 'baby')];

  it('akzeptiert eine normale Familie mit Haustier', () => {
    expect(validateHousehold(hh(family(), { pets: [{ name: 'Bello', kind: 'dog', fur: 0 }] }))).toBeNull();
  });
  it('lehnt leere Namen ab', () => {
    expect(validateHousehold(hh([mem(1, 'adult', { first: '  ' })]))).toMatch(/Vornamen/);
    expect(validateHousehold(hh([mem(1, 'adult', { last: '' })]))).toMatch(/Nachnamen/);
    expect(validateHousehold(hh([mem(1, 'adult')], { name: ' ' }))).toMatch(/Namen/);
    expect(validateHousehold(hh([mem(1, 'adult', { first: 'x'.repeat(21) })]))).toMatch(/20 Zeichen/);
  });
  it('lehnt leere und zu große Haushalte ab', () => {
    expect(validateHousehold(hh([]))).not.toBeNull();
    const nine = Array.from({ length: 9 }, (_, i) => mem(i + 1, 'adult'));
    expect(validateHousehold(hh(nine))).toMatch(/höchstens 8/);
    expect(validateHousehold(hh(nine.slice(0, 8)))).toBeNull();
  });
  it('verlangt Erwachsene', () => {
    expect(validateHousehold(hh([mem(1, 'teen')]))).toMatch(/erwachsene/);
    expect(validateHousehold(hh([mem(1, 'teen'), mem(2, 'child')]))).not.toBeNull();
    expect(validateHousehold(hh([mem(1, 'baby')]))).toMatch(/Babys/);
    expect(validateHousehold(hh([mem(1, 'teen'), mem(2, 'baby')]))).not.toBeNull();
    expect(validateHousehold(hh([mem(1, 'adult')]), 2)).toMatch(/2 Erwachsene/);
    expect(validateHousehold(hh([mem(1, 'adult'), mem(2, 'senior')]), 2)).toBeNull();
    expect(validateHousehold(hh([mem(1, 'teen')]), 0)).not.toBeNull();
  });
  it('prüft Eigenschaften und Hobbys', () => {
    expect(validateHousehold(hh([mem(1, 'adult', { traits: ['kind', 'funny', 'geek', 'musical'] })]))).toMatch(/höchstens 3 Eigenschaften/);
    expect(validateHousehold(hh([mem(1, 'adult', { traits: ['neat', 'messy'] })]))).toMatch(/schließen sich aus/);
    expect(validateHousehold(hh([mem(1, 'adult', { traits: ['kind', 'kind'] })]))).toMatch(/doppelt/);
    expect(validateHousehold(hh([mem(1, 'adult', { hobbies: ['cooking', 'music', 'logic', 'fishing'] })]))).toMatch(/Hobbys/);
    // alle in den Daten hinterlegten Gegensätze werden erkannt
    for (const t of TRAITS) for (const c of t.conflicts ?? []) expect(validateHousehold(hh([mem(1, 'adult', { traits: [t.id, c] })]))).not.toBeNull();
  });
  it('prüft Haustiere und Berufe', () => {
    const pets = Array.from({ length: 4 }, (_, i) => ({ name: `Tier${i}`, kind: 'cat' as const, fur: 1 }));
    expect(validateHousehold(hh([mem(1, 'adult')], { pets }))).toMatch(/Haustiere/);
    expect(validateHousehold(hh([mem(1, 'adult')], { pets: [{ name: '', kind: 'dog', fur: 0 }] }))).toMatch(/Haustier/);
    expect(validateHousehold(hh([mem(1, 'adult')], { pets: [{ name: 'Rex', kind: 'dog', fur: 99 }] }))).toMatch(/Fellfarbe/);
    expect(validateHousehold(hh([mem(1, 'adult', { career: 'gastro' }), mem(2, 'teen', { career: 'nebenjob' })]))).toBeNull();
    expect(validateHousehold(hh([mem(1, 'adult'), mem(2, 'teen', { career: 'gastro' })]))).toMatch(/zu jung/);
  });
});

import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { DILDOS, EXTRAS, buyToy, buyCondoms, condomLabel, dildoSizes, dildoNow, dildoStats, ownsToy } from '../src/game/toys';

describe('Sextoys (18+)', () => {
  it('Dildo kaufen schaltet die Größe frei und wählt sie', () => {
    const s = defaults(); s.money = 500;
    expect(dildoSizes(s).map((d) => d.size)).toEqual(['M']);
    expect(buyToy(s, DILDOS[3])).toBeNull();
    expect(ownsToy(s, 'dildo_xl')).toBe(true);
    expect(dildoNow(s).size).toBe('XL');
    expect(dildoSizes(s).map((d) => d.size)).toEqual(['M', 'XL']);
    expect(s.money).toBe(500 - DILDOS[3].price);
  });
  it('größer = mehr Reichweite und Wucht', () => {
    const [sm, , , xl] = DILDOS.map(dildoStats);
    expect(xl.reach).toBeGreaterThan(sm.reach); expect(xl.push).toBeGreaterThan(sm.push); expect(xl.hits).toBe(1);
  });
  it('ohne Geld kein Kauf, Fleshlight und Penisring im Sortiment', () => {
    const s = defaults(); s.money = 5;
    expect(buyToy(s, EXTRAS[0])).toMatch(/fehlen/);
    expect(EXTRAS.map((t) => t.id)).toEqual(['fleshlight', 'cockring']);
  });
  it('Kondome merken die Größe', () => {
    const s = defaults(); s.money = 10;
    expect(condomLabel(s)).toBe('Kondom');
    expect(buyCondoms(s, 'XL')).toBeNull();
    expect(s.inv.condom).toBe(3); expect(condomLabel(s)).toBe('Kondom XL');
  });
});

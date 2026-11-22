import { describe, it, expect } from 'vitest';
import { CLIENTS, STOCK, PARTS, rate, showPay, finishShow, readPimp, writePimp, buyPart, spent, clientFor } from '../src/game/tuning';
import { LIFE_EVENTS } from '../src/game/citylife';

const save = () => ({ money: 1000, rep: 0, flags: {} as Record<string, string | number | boolean> }) as never as import('../src/engine/Save').SaveData;

describe('Tuning und Show „Aufgemotzt!“', () => {
  it('Wunsch getroffen gibt Ausraster, Abneigung bremst', () => {
    const jacky = CLIENTS.find((c) => c.id === 'jacky')!;
    const glam = { ...STOCK, paint: 'pink', rim: 'gold', neon: 'pink', extra: 'krone' };
    expect(rate(jacky, glam).level).toBe('wow');
    expect(rate(jacky, { ...STOCK, rim: 'sport', extra: 'fluegel' }).level).toBe('meh');
    expect(spent(glam)).toBeLessThanOrEqual(jacky.budget);
  });
  it('Günther mag keine Hüpf-Hydraulik', () => {
    const g = CLIENTS.find((c) => c.id === 'guenther')!;
    expect(rate(g, { ...STOCK, hyd: 'huepf' }).miss).toBeGreaterThan(0);
  });
  it('jede Kundschaft kann im Budget einen Ausraster schaffen', () => {
    for (const c of CLIENTS) {
      const p = { ...STOCK };
      for (const k of Object.keys(PARTS) as Array<keyof typeof PARTS>) {
        const best = PARTS[k].filter((q) => q.tag && c.likes.includes(q.tag) && !(c.id === 'guenther' && k === 'hyd')).sort((a, b) => a.cost - b.cost)[0];
        if (best && spent({ ...p, [k]: best.id }) <= c.budget) p[k] = best.id;
      }
      expect(rate(c, p).level, c.id).toBe('wow');
    }
  });
  it('Folge zählt hoch und zahlt', () => {
    const s = save(), c = clientFor(s), m = s.money;
    const r = finishShow(s, c, { ...STOCK, neon: 'regenbogen' });
    expect(s.money).toBe(m + r.pay); expect(s.flags.showEp).toBe(1); expect(clientFor(s).id).not.toBe(c.id);
    expect(showPay(c, STOCK).pay).toBeGreaterThan(0);
  });
  it('eigener Wagen: Teile kaufen und speichern', () => {
    const s = save();
    expect(buyPart(s, 'neon', 'pink')).toBeNull();
    expect(buyPart(s, 'paint', 'lila')).toBeNull();
    expect(readPimp(s).neon).toBe('pink'); expect(s.flags.carHue).toBe(275);
    expect(buyPart(s, 'neon', 'pink')).toMatch(/schon/);
    s.money = 0; expect(buyPart(s, 'hyd', 'twerk')).toMatch(/fehlen/);
    writePimp(s, STOCK); expect(readPimp(s)).toEqual(STOCK);
  });
  it('Anfeindungen sind als Nebenaufgaben dabei, mit Rangelei', () => {
    const hate = LIFE_EVENTS.filter((e) => ['poebel', 'parole', 'verfolgt'].includes(e.id));
    expect(hate).toHaveLength(3);
    for (const e of hate) { expect(e.when).toBe('night'); expect(e.choices.some((c) => c.out.fight && c.out.fight <= e.cast.length)).toBe(true); }
  });
});

import { describe, it, expect } from 'vitest';
import * as Ty from '../src/modes/tycoon';
import { Network } from '../src/railway/network';
import { routeNet } from '../src/data/routes';
import { FORM } from '../src/trains/stock';

const net = new Network(routeNet('f1'));
const info = (key: string) => Ty.lineInfo(net, Ty.findLine(key)!);

describe('Bahngesellschaft', () => {
  it('Kaufen, Zuweisen, Tage simulieren', () => {
    const c = Ty.newCompany('Test');
    expect(Ty.buyTrain(c, 'dmu1')).toBe('');
    expect(c.money).toBe(Ty.START_MONEY - Ty.formPrice(FORM.get('dmu1')!));
    expect(Ty.assign(c, c.trains[0].id, 'f1:f1-rb')).toBe('');
    expect(Ty.assign(c, c.trains[0].id, 'd1:d1-re')).toMatch(/nicht erworben/);
    const before = c.money;
    for (let i = 0; i < 5; i++) { const l = Ty.simulateDay(c, info); expect(l.revenue).toBeGreaterThan(0); expect(Number.isFinite(l.cost)).toBe(true); }
    expect(c.day).toBe(6);
    expect(c.money).not.toBe(before);
    expect(info('f1:f1-rb').km).toBeGreaterThan(2);
  });
  it('Regeln: Traktion und Wagenart', () => {
    const ic = FORM.get('ic')!, cont = FORM.get('cont_e')!, dmu = FORM.get('dmu1')!;
    expect(Ty.canServe(ic, 'f1', Ty.findLine('f1:f1-mb')!)).toMatch(/elektrifiziert/);
    expect(Ty.canServe(dmu, 'f1', Ty.findLine('f1:f1-gz')!)).toMatch(/Güterwagen/);
    expect(Ty.canServe(cont, 'f1', Ty.findLine('f1:f1-rb')!)).toMatch(/Sitzplätze/);
  });
  it('Laden prüft Daten und deterministisch', () => {
    expect(Ty.loadCompany({ v: 2 })).toBeNull();
    const a = Ty.newCompany('X'), b = Ty.newCompany('X');
    for (const c of [a, b]) { Ty.buyTrain(c, 'dmu1'); Ty.assign(c, c.trains[0].id, 'f1:f1-rb'); Ty.simulateDay(c, info); }
    expect(a.money).toBe(b.money);
    expect(Ty.loadCompany(JSON.parse(JSON.stringify(a)))!.money).toBe(a.money);
    expect(Ty.sellTrain(a, a.trains[0].id)).toBeGreaterThan(0);
  });
});

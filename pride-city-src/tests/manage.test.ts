import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { BUSINESSES, buy, collect, income } from '../src/game/empire';
import { daily, hire, upgrade, workIn, hostEvent, fixIssue, dayTick, popOf, issueOf, staffOf, upOf, UP_MAX, STAFF, eventReady } from '../src/game/manage';

const start = () => { const s = defaults(); s.money = 50000; s.rep = 50; const b = BUSINESSES.find((x) => x.id === 'cafe')!; buy(s, b); return { s, b }; };

describe('Geschäft führen', () => {
  it('ohne Eingriff bleibt der Grundertrag', () => {
    const { s, b } = start();
    expect(daily(s, b).net).toBe(b.daily);
    expect(income(s)).toBe(b.daily);
  });
  it('jede Personalstufe lohnt sich trotz Lohn', () => {
    const { s, b } = start(); let last = daily(s, b).net;
    for (let l = 1; l < STAFF.length; l++) { expect(hire(s, b, l)).toBeNull(); expect(staffOf(s, b.id)).toBe(l); const n = daily(s, b).net; expect(n).toBeGreaterThan(last); last = n; }
    expect(hire(s, b, 3)).toMatch(/schon/);
  });
  it('Ausbauten steigern den Umsatz bis Stufe 3', () => {
    const { s, b } = start(); const before = daily(s, b).gross;
    for (let i = 0; i < UP_MAX; i++) expect(upgrade(s, b, 'deko')).toBeNull();
    expect(upOf(s, b.id, 'deko')).toBe(UP_MAX);
    expect(upgrade(s, b, 'deko')).toMatch(/Mehr geht nicht/);
    expect(daily(s, b).gross).toBeGreaterThan(before);
    s.money = 0; expect(upgrade(s, b, 'werbung')).toMatch(/fehlen/);
  });
  it('Mitarbeiten und Veranstaltungen heben die Beliebtheit, die Kasse kommt am nächsten Morgen', () => {
    const { s, b } = start();
    expect(workIn(s, b)).toBeNull(); expect(workIn(s, b)).toMatch(/schon/);
    expect(popOf(s, b.id)).toBe(72);
    expect(hostEvent(s, b)).toBeNull();
    expect(eventReady(s, b.id)).toBe(3);
    expect(hostEvent(s, b)).toMatch(/Pause/);
    const t = dayTick(s, b, .9);
    expect(t.pay).toBeGreaterThan(b.daily * 4);
    expect(t.notes.length).toBe(1);
    expect(dayTick(s, b, .9).pay).toBeLessThan(b.daily * 2);
  });
  it('Probleme halbieren den Umsatz, bis sie gelöst sind', () => {
    const { s, b } = start();
    expect(issueOf(s, b.id)).toBeNull();
    dayTick(s, b, .01); expect(issueOf(s, b.id)).toBeNull();   // Schonfrist nach dem Kauf
    s.day += 5; const full = daily(s, b).gross;
    dayTick(s, b, .01); expect(issueOf(s, b.id)).not.toBeNull();
    expect(daily(s, b).gross).toBeLessThan(full * .6);
    expect(fixIssue(s, b)).toBeNull(); expect(fixIssue(s, b)).toMatch(/rund/);
    dayTick(s, b, .01); hire(s, b, 3); const t = dayTick(s, b, .5);
    expect(issueOf(s, b.id)).toBeNull(); expect(t.notes.join()).toMatch(/Geschäftsführung/);
  });
  it('die Auszahlung rechnet jeden Tag einzeln ab', () => {
    const { s, b } = start(); hire(s, b, 1);
    const per = daily(s, b).net, m = s.money; s.day += 2;
    expect(collect(s)).toBe(per * 2);
    expect(s.money).toBe(m + per * 2);
  });
});

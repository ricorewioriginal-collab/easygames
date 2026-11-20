import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { PROFILES, dateRec } from '../src/game/social';
import { closeness, addCloseness, levelOf, LEVELS, GIFTS, LOVES, giveGift, OUTINGS, outingWhy, doOuting, chatOf, chatOpen, replyChat, CHATS, together, jealousy, bondTick, partners } from '../src/game/bond';

const kai = PROFILES[0];
const start = (st = 1) => { const s = defaults(); s.money = 1000; dateRec(s, kai.id).st = st; return s; };

describe('Beziehungen vertiefen', () => {
  it('Nähe steigt in Stufen und meldet jede Stufe nur einmal', () => {
    const s = start();
    expect(levelOf(0)).toBe(0); expect(levelOf(95)).toBe(LEVELS.length - 1);
    expect(addCloseness(s, kai.id, 10)).toBeNull();
    expect(addCloseness(s, kai.id, 12)).toMatch(/Vertraut/);
    addCloseness(s, kai.id, -10);
    expect(addCloseness(s, kai.id, 10)).toBeNull();
    const rep = s.rep; addCloseness(s, kai.id, 60);
    expect(closeness(s, kai.id)).toBe(82); expect(s.rep).toBeGreaterThan(rep);
    addCloseness(s, kai.id, 500); expect(closeness(s, kai.id)).toBe(100);
  });
  it('Lieblingsgeschenke zählen mehr, einmal am Tag', () => {
    const s = start();
    for (const ids of Object.values(LOVES)) for (const id of ids) expect(GIFTS.some((g) => g.id === id)).toBe(true);
    const love = GIFTS.find((g) => g.id === LOVES[kai.id][0])!, other = GIFTS.find((g) => !LOVES[kai.id].includes(g.id))!;
    expect(giveGift(s, kai, love).text).toMatch(/strahlt/);
    expect(closeness(s, kai.id)).toBe(12);
    expect(giveGift(s, kai, other).why).toMatch(/heute/);
    s.day++; giveGift(s, kai, other); expect(closeness(s, kai.id)).toBe(17);
    s.day++; giveGift(s, kai, other); expect(closeness(s, kai.id)).toBe(19);   // dasselbe noch einmal: kaum Wirkung
    s.money = 0; s.day++; expect(giveGift(s, kai, love).why).toMatch(/fehlen/);
  });
  it('Unternehmungen hängen an Stufe, Tageszeit, Wagen und Geld', () => {
    const s = start(1), park = OUTINGS[0], hotel = OUTINGS.find((o) => o.id === 'hotel')!, strand = OUTINGS.find((o) => o.id === 'strand')!, fahrt = OUTINGS.find((o) => o.id === 'fahrt')!;
    expect(outingWhy(s, kai.id, park, false, false)).toBeNull();
    expect(outingWhy(s, kai.id, hotel, false, false)).toMatch(/Zusammen/);
    expect(outingWhy(s, kai.id, strand, false, false)).toMatch(/18 Uhr/);
    expect(outingWhy(s, kai.id, strand, true, false)).toBeNull();
    expect(outingWhy(s, kai.id, fahrt, false, false)).toMatch(/Wagen/);
    doOuting(s, kai.id, park);
    expect(closeness(s, kai.id)).toBe(park.bond);
    expect(outingWhy(s, kai.id, park, false, false)).toMatch(/Heute/);
  });
  it('Nachrichten: eine am Tag, gute Antworten bringen Nähe', () => {
    const s = start();
    for (const c of CHATS) { expect(c.replies.length).toBe(3); expect(Math.max(...c.replies.map((r) => r[1]))).toBeGreaterThan(2); }
    expect(chatOpen(s, kai.id)).toBe(true);
    const best = chatOf(s, kai.id).replies.findIndex((r) => r[1] >= 3);
    expect(replyChat(s, kai.id, best).answer.length).toBeGreaterThan(3);
    expect(closeness(s, kai.id)).toBeGreaterThan(2);
    expect(chatOpen(s, kai.id)).toBe(false);
    s.day++; expect(chatOpen(s, kai.id)).toBe(true);
  });
  it('gemeinsame Zeit bringt höchstens 8 Punkte am Tag', () => {
    const s = start();
    for (let i = 0; i < 20; i++) together(s, kai.id);
    expect(closeness(s, kai.id)).toBe(8);
    s.day++; together(s, kai.id); expect(closeness(s, kai.id)).toBe(9);
  });
  it('wer sich nicht meldet, verliert Nähe; exklusiv und doch verliebt verletzt', () => {
    const s = start(3); addCloseness(s, kai.id, 50); dateRec(s, kai.id).last = s.day;
    bondTick(s); s.day += 4; bondTick(s); expect(closeness(s, kai.id)).toBe(50);
    s.day += 1; expect(bondTick(s).join()).toMatch(/vermisst/); expect(closeness(s, kai.id)).toBe(47);
    expect(partners(s).map((p) => p.id)).toEqual([kai.id]);
    const luca = PROFILES[1]; dateRec(s, luca.id).st = 2;
    expect(jealousy(s, luca.id)).toBeNull();          // nichts abgesprochen
    s.flags.relModel = 'offen'; expect(jealousy(s, luca.id)).toBeNull();
    s.flags.relModel = 'mono'; expect(jealousy(s, luca.id)).toMatch(/verletzt/);
    expect(closeness(s, kai.id)).toBe(32);
  });
});

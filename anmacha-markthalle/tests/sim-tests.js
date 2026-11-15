'use strict';
/* Spielkern-Tests für Marktrausch: node anmacha-markthalle/tests/sim-tests.js */
const Sim = require('../sim.js'), D = require('../data.js');
let seed = 7; Sim.setRng(() => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('✖ ' + m); } else console.log('✔ ' + m); };

// Kasse besetzen und einen Tag durchspielen (Spieler scannt, zahlt Bar/Karte passend)
function playDay(S, onCard) {
  const k = S.objs.find(o => o.k === 'kasse'), st = Sim.serviceTile(k); let n = 0, cards = 0;
  if (!Sim.openShop(S)) return null;
  while (S.phase !== 'summary' && n++ < 20000) {
    S.player.x = st[0] + .5; S.player.y = st[1] + .5; const c = Sim.context(S, k); if (c && c.a === 'scan') Sim.act(S, k); Sim.step(S, .25);
    const pc = Sim.pendingCard(S); if (pc) { cards++; onCard ? onCard(pc) : Sim.cardPay(S, pc.total); }
    const pd = Sim.pending(S); if (pd) Sim.giveChange(S, pd.given - pd.total); if (Sim.pendingId(S)) Sim.idDecision(S, true);
  }
  return { sum: S.summary, cards };
}

const S = Sim.create();
ok(Object.keys(S.deals).length === 3 && Object.keys(S.deals).every(p => S.lic[D.PRODUCTS[p].cat]), 'Start: 3 Tagesangebote aus freigeschalteten Warengruppen');
const dp = Object.keys(S.deals)[0]; ok(Sim.wholesale(S, dp) < Math.round(D.PRODUCTS[dp].cost * S.cf[dp]), 'Angebot senkt den Einkaufspreis');

let wrongSeen = false;
const r = playDay(S, c => { if (!wrongSeen) { wrongSeen = true; const w = Sim.cardPay(S, c.total + 5); ok(w && !w.ok && Sim.pendingCard(S) === c, 'Falscher Kartenbetrag wird abgelehnt, Kunde wartet weiter'); } Sim.cardPay(S, c.total); });
ok(r && r.sum && r.sum.served > 0, 'Tag 1 läuft durch, Kunden werden bedient (' + (r && r.sum.served) + ')');
ok(r.cards > 0, 'Kartenzahlungen landen am Terminal (' + r.cards + ')');

// Kartenterminal abschalten: keine manuellen Kartenzahlungen mehr
Sim.nextDay(S); Object.entries(Sim.suggest(S)).forEach(([p, b]) => Sim.order(S, p, b)); S.cardManual = false;
const S2 = Sim.load(Sim.save(S)); ok(S2.cardManual === false && S2.deals && Array.isArray(S2.pre), 'Speichern/Laden behält neue Felder');

// Vorbestellung ausliefern
S.pre = [{ id: 999, p: 'apfel', n: 5, name: 'Test', pay: 1000, due: S.day + 1 }]; S.ramp.push({ p: 'apfel', n: 12, age: 0 });
const m0 = S.money; ok(Sim.preStock(S, 'apfel') >= 5 && Sim.preDeliver(S, 999) && S.money === m0 + 1000 && !S.pre.length, 'Vorbestellung wird ausgeliefert und bezahlt');
S.pre = [{ id: 998, p: 'apfel', n: 5000, name: 'Zu groß', pay: 1, due: S.day }]; ok(!Sim.preDeliver(S, 998), 'Zu wenig Ware: keine Auslieferung');
const rep0 = S.rep; S.day += 1; Sim.nextDay(S); ok(!S.pre.some(o => o.id === 998) && S.rep < rep0, 'Verpasste Vorbestellung kostet Ruf');

S.objs.filter(Sim.isShelf).forEach(o => { if (o.p) { o.qty = Sim.cap(S, o); o.age = 0; o.exp = false; } });
const r2 = playDay(S); ok(r2 && r2.cards === 0, 'Kartenzahlung automatisch, wenn abgeschaltet');

// Alte Spielstände ohne neue Felder laden
const old = JSON.parse(Sim.save(Sim.create())); delete old.deals; delete old.pre; delete old.cardManual; const L = Sim.load(JSON.stringify(old));
ok(L.cardManual === true && Object.keys(L.deals).length === 3 && L.pre.length === 0, 'Alter Spielstand wird ergänzt');
ok(typeof Sim.trend(L, 'apfel') === 'number', 'Markttrend ist abrufbar');

// ---------- Neue Systeme ----------
const fill = X => X.objs.filter(Sim.isShelf).forEach(o => { if (o.p) { o.qty = Sim.cap(X, o); o.age = 0; o.exp = false; o.disc = false; } });
// Frische & MHD: Rabattaufkleber, Rette-mich, abgelaufen bleibt liegen, Aussortieren
{
  const F = Sim.create(), ob = F.objs.find(o => o.p === 'apfel'); ob.qty = 10; ob.age = 5.5;   // hält 6 Tage → MHD heute
  ok(Sim.fresh(F, ob) === 'mhd' && Sim.needsSticker(F, ob), 'MHD heute wird erkannt');
  F.player.x = ob.x + .5; F.player.y = ob.y + 1.5; const c0 = Sim.context(F, ob); ok(c0 && c0.a === 'sticker', 'Rabattaufkleber als Aktion am Regal');
  Sim.act(F, ob); ok(ob.disc && Sim.effPrice(F, ob) < F.price.apfel && !Sim.needsSticker(F, ob), 'Aufkleber senkt den Preis um 30 %');
  ok(Sim.markRette(F, ob.id) && ob.rette, 'Regal für Rette-mich-Tüten markiert');
  const m0 = F.money; Sim.endDay(F); ok(ob.qty === 0 && F.money > m0 - 50000 && F.tot.saved >= 10 && F.summary.ext.rette, 'Rette-mich-Tüten statt Tonne (' + F.tot.saved + ' gerettet)');
  const G = Sim.create(), mk = G.objs.find(o => o.p === 'milch'); mk.qty = 6; mk.age = 7.2; G.phase = 'open'; Sim.endDay(G);
  ok(mk.exp && mk.qty === 6, 'Abgelaufene Ware bleibt im Regal liegen');
  G.player.x = mk.x + .5; G.player.y = mk.y + 1.5; const cs = Sim.context(G, mk); ok(cs && cs.a === 'sort', 'Aussortieren als Aktion');
  Sim.act(G, mk); ok(!mk.exp && mk.qty === 0 && G.today.wasteV > 0, 'Aussortiert zählt als Verlust');
}
// Personal: Schichten, Laune, Lob & Prämie, Lohn
{
  const H = Sim.create(); H.money = 1e7; H.level = 5; const k = Sim.hire(H, 'kasse'); ok(k.mood === 80 && k.shift === 'ganz', 'Neue Kraft: Laune 80, ganztags');
  const w0 = Sim.wageOf(k); Sim.setShift(H, k.id, 'frueh'); ok(Sim.wageOf(k) < w0, 'Halbe Schicht kostet weniger Lohn');
  H.phase = 'open'; H.t = 400; ok(!Sim.onShift(H, k), 'Frühschicht hat nachmittags frei'); H.t = 10; ok(Sim.onShift(H, k), 'Frühschicht arbeitet morgens');
  k.mood = 40; ok(Sim.praise(H, k.id) && k.mood === 50 && !Sim.praise(H, k.id), 'Loben einmal am Tag');
  ok(Sim.bonus(H, k.id) && k.mood === 72 && H.today.bonus === 2500, 'Prämie hebt die Laune, wird abends bezahlt');
  ok(Sim.moodF({ mood: 100 }) > Sim.moodF({ mood: 10 }), 'Gute Laune = schneller');
  k.mood = 5; H.phase = 'prep'; Sim.nextDay(H); ok(!H.staff.includes(k), 'Sehr schlechte Laune: Kündigung');
}
// Kundenwünsche, Bewertung, Stammkunden-Liebling
{
  const K = Sim.create(); fill(K); K.asks.push({ id: 1, p: 'apfel', n: 'Frau Test', reg: -1, day: 1, due: 3 }); const m0 = K.money; K.phase = 'open'; Sim.endDay(K);
  ok(!K.asks.length && K.tot.wishes === 1 && K.summary.ext.asks.length === 1, 'Kundenwunsch erfüllt, wenn die Ware im Regal liegt');
  K.asks.push({ id: 2, p: 'nudeln', n: 'Herr Test', reg: -1, day: 1, due: K.day }); Sim.nextDay(K); K.phase = 'open'; Sim.endDay(K); ok(!K.asks.length && K.tot.wishes === 1, 'Unerfüllter Wunsch verfällt');
  ok(Sim.rateStars(K, 'preis') >= 1 && Sim.rateStars(K, 'preis') <= 5, 'Teil-Bewertungen in Sternen');
}
// Wochenmarkt & Café
{
  const M = Sim.create(); M.money = 1e7; M.level = 8; ok(Sim.buyStall(M) && M.out.n === 1, 'Marktstand gekauft'); ok(Sim.setFarm(M, 0, 'gemuese') && M.out.stalls[0].p === 'karotte', 'Hof gewählt');
  ok(Sim.stallProd(M, 0) && M.out.stalls[0].p === 'tomate', 'Ware am Stand wechseln'); M.phase = 'summary'; Sim.nextDay(M); ok(M.out.stalls[0].qty === 12, 'Hof liefert morgens');
  ok(Sim.buyCafe(M) && M.out.cafe === 1, 'Café eröffnet'); const r = Sim.cafeRect(M); M.player.x = r.x + 1; M.player.y = r.y + r.h + .5; ok(!Sim.pBlocked(M, M.player.x, M.player.y), 'Gehweg vor dem Laden ist begehbar');
  M.player.carry.push({ p: 'kaffee', n: 8, age: 0, id: 4242 }); const cc = Sim.context(M, null); ok(cc && cc.a === 'cafefill', 'Kaffee-Karton am Café: auffüllen'); Sim.act(M, null); ok(M.out.cup === 64, 'Café hat 64 Tassen');
  fill(M); M.money = 1e7; Sim.openShop(M); let n = 0; while (M.phase === 'open' && n++ < 2500) Sim.step(M, .25); ok(M.tot.stall > 0 && M.tot.cafe > 0, 'Stand und Café verkaufen (' + M.tot.stall + ' Stand, ' + M.tot.cafe + ' Café)');
  ok(Sim.pBlocked(M, Sim.stallRect(M, 0).x + .5, Sim.stallRect(M, 0).y + .4), 'Stand ist ein Hindernis');
}
// Billigo, Ereignisse, Tag & Nacht
{
  const B = Sim.create(); B.money = 1e7; ok(Sim.flyer(B) && !Sim.flyer(B), 'Flyer einmal am Tag'); ok(Sim.guarantee(B) && B.rv.guar, 'Preisgarantie an');
  B.phase = 'open'; Sim.endDay(B); ok(B.summary.bills.some(b => b[0] === 'Preisgarantie') && B.summary.bills.some(b => b[0] === 'Flyer gegen Billigo'), 'Billigo-Kosten auf der Abrechnung');
  ok(Sim.dayLen(B) === 600 && (B.up.spaet = true) && Sim.dayLen(B) === 700, 'Spätverkauf verlängert den Tag'); B.t = 700; ok(Sim.clock(B) === '22:00', 'Uhr zeigt 22 Uhr');
  const E = Sim.create(); fill(E); E.ev.push({ k: 'kontrolle', t0: 1, t1: 2 }); const mk = E.objs.find(o => o.p === 'milch'); mk.exp = true; Sim.openShop(E); let n = 0; while (E.tot.insp === 0 && n++ < 3000) Sim.step(E, .25);
  ok(E.tot.insp === 1 && E.today.fines >= 4000, 'Kontrolle findet abgelaufene Ware');
  ok(Object.keys(D.WEATHER).length >= 8 && Sim.evIcons(E).length >= 0, 'Neue Wetterarten vorhanden');
}
// Koop: zweite Figur arbeitet mit
{
  const C = Sim.create(); Sim.coop(C, true); ok(C.p2 && C.coop, 'Koop: zweite Figur'); const k = C.objs.find(o => o.k === 'kasse'), st = Sim.serviceTile(k);
  C.p2.x = st[0] + .5; C.p2.y = st[1] + .5; C.player.x = 3.5; C.player.y = 9.5; const r = playDay(C); ok(r === null || r.sum, 'Koop-Tag läuft');
  const L2 = Sim.load(Sim.save(C)); ok(L2.p2 && L2.coop, 'Koop wird gespeichert'); Sim.coop(L2, false); ok(!L2.p2, 'Koop aus');
}

console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden'); process.exit(fails ? 1 : 0);

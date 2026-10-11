'use strict';
/* Spielkern-Tests für AnMaCha Markthalle 24: node anmacha-markthalle/tests/sim-tests.js */
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

const r2 = playDay(S); ok(r2 && r2.cards === 0, 'Kartenzahlung automatisch, wenn abgeschaltet');

// Alte Spielstände ohne neue Felder laden
const old = JSON.parse(Sim.save(Sim.create())); delete old.deals; delete old.pre; delete old.cardManual; const L = Sim.load(JSON.stringify(old));
ok(L.cardManual === true && Object.keys(L.deals).length === 3 && L.pre.length === 0, 'Alter Spielstand wird ergänzt');
ok(typeof Sim.trend(L, 'apfel') === 'number', 'Markttrend ist abrufbar');

console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden'); process.exit(fails ? 1 : 0);

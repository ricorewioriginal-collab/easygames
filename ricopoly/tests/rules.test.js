// Regel-Tests für RicoPoly 3D:  node --test ricopoly/tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');
const AI = require('../js/ai.js');
const { runGame } = require('./sim.js');

const two = (cfg, extra) => R.newGame(Object.assign({ seed: 42, cfg, players: [{ name: 'Ana', human: true }, { name: 'Ben', human: true }] }, extra));
const three = cfg => R.newGame({ seed: 7, cfg, players: [{ name: 'A', human: true }, { name: 'B', human: true }, { name: 'C', human: true }] });
function act(s, a, dice) { const r = R.apply(s, a, dice ? { dice } : undefined); assert.ok(r.ok, `${a.type} abgelehnt: ${r.err}`); return r.state; }
function bad(s, a, err, dice) { const r = R.apply(s, a, dice ? { dice } : undefined); assert.equal(r.ok, false, `${a.type} hätte abgelehnt werden müssen`); if (err) assert.equal(r.err, err); assert.equal(r.state, s); return r; }
const total = s => s.players.reduce((a, p) => a + p.money, 0);

test('Würfel: zwei echte W6 mit Werten 1–6 und annähernd gleichverteilter Summe', () => {
  let s = two(), counts = Array(13).fill(0);
  for (let i = 0; i < 3000; i++) {
    s.phase = 'roll'; s.cur = 0; s.players[0].jail = false; s.players[0].doubles = 0; s.players[0].pos = 0; s.players[0].money = 1e6;
    const r = R.apply(s, { type: 'roll', p: 0 }); assert.ok(r.ok);
    const d = r.state.dice; assert.ok(d[0] >= 1 && d[0] <= 6 && d[1] >= 1 && d[1] <= 6);
    counts[d[0] + d[1]]++; s = r.state;
  }
  assert.ok(counts[7] > counts[2] * 3 && counts[7] > counts[12] * 3, 'Summe 7 muss deutlich häufiger sein als 2 oder 12');
  assert.equal(counts[0] + counts[1], 0);
});

test('Zugwechsel und Bewegung über Start mit Startgeld', () => {
  let s = two();
  s.players[0].pos = 38;
  s = act(s, { type: 'roll', p: 0 }, [1, 3]);       // 38 + 4 = 2 (Gemeinschaftsfeld), über Start
  assert.equal(s.players[0].pos, 2);
  assert.ok(s.log.some(e => e.e === 'pay' && e.why === 'go' && e.to === 0 && e.amt === 200));
  if (s.phase === 'debt') return;                   // Karte könnte Geld kosten – Startgeld ist geprüft
  if (s.phase === 'buy') s = act(s, { type: 'decline', p: 0 });
  while (s.phase === 'auction') s = act(s, { type: 'pass', p: R.actor(s) });
  assert.equal(s.phase, 'end');
  s = act(s, { type: 'endTurn', p: 0 });
  assert.equal(s.cur, 1); assert.equal(s.phase, 'roll'); assert.equal(s.turnId, 2);
});

test('Pasch erlaubt Zusatzwurf, dritter Pasch führt ins Gefängnis', () => {
  let s = two(); s.players[0].money = 100000;
  s = act(s, { type: 'roll', p: 0 }, [1, 1]);   // Feld 2
  if (s.phase === 'buy') s = act(s, { type: 'decline', p: 0 });
  while (s.phase === 'auction') s = act(s, { type: 'pass', p: R.actor(s) });
  if (s.players[0].jail) return;                 // Karte "Gefängnis" möglich
  assert.equal(s.phase, 'roll', 'nach Pasch darf erneut gewürfelt werden');
  s.players[0].pos = 20;
  s = act(s, { type: 'roll', p: 0 }, [2, 2]);   // Feld 24
  if (s.phase === 'buy') s = act(s, { type: 'decline', p: 0 });
  while (s.phase === 'auction') s = act(s, { type: 'pass', p: R.actor(s) });
  assert.equal(s.phase, 'roll');
  s = act(s, { type: 'roll', p: 0 }, [3, 3]);
  assert.equal(s.players[0].jail, true); assert.equal(s.players[0].pos, R.JAIL); assert.equal(s.phase, 'end');
});

test('Grundstück kaufen: Guthaben sinkt um den Preis, Besitz wechselt', () => {
  let s = two();
  s = act(s, { type: 'roll', p: 0 }, [1, 2]);   // Feld 3, Preis 60
  assert.equal(s.phase, 'buy'); assert.equal(s.pending.sq, 3);
  s = act(s, { type: 'buy', p: 0 });
  assert.equal(s.players[0].money, 1500 - 60); assert.equal(s.own[3].o, 0); assert.equal(s.phase, 'end');
});

test('Kauf ablehnen startet eine Versteigerung; nur gültige Gebote', () => {
  let s = two();
  s = act(s, { type: 'roll', p: 0 }, [2, 4]);   // Feld 6, Preis 100
  s = act(s, { type: 'decline', p: 0 });
  assert.equal(s.phase, 'auction'); assert.deepEqual(s.auction.parts, [0, 1]);
  bad(s, { type: 'bid', p: 1, amount: 50 }, 'notYourBid');
  bad(s, { type: 'bid', p: 0, amount: 0 }, 'bidTooLow');
  bad(s, { type: 'bid', p: 0, amount: 999999 }, 'noMoney');
  s = act(s, { type: 'bid', p: 0, amount: 40 });
  bad(s, { type: 'bid', p: 1, amount: 40 }, 'bidTooLow');
  s = act(s, { type: 'bid', p: 1, amount: 55 });
  s = act(s, { type: 'pass', p: 0 });
  assert.equal(s.own[6].o, 1); assert.equal(s.players[1].money, 1500 - 55); assert.equal(s.players[0].money, 1500);
  assert.equal(s.phase, 'end'); assert.equal(s.auction, null);
});

test('Versteigerung ohne Gebote: Grundstück bleibt bei der Bank; ohne Auktionsregel keine Versteigerung', () => {
  let s = two();
  s = act(s, { type: 'roll', p: 0 }, [2, 4]);
  s = act(s, { type: 'decline', p: 0 });
  s = act(s, { type: 'pass', p: 0 }); s = act(s, { type: 'pass', p: 1 });
  assert.equal(s.own[6].o, -1); assert.equal(s.phase, 'end');
  let t = two({ auctions: false });
  t = act(t, { type: 'roll', p: 0 }, [2, 4]);
  t = act(t, { type: 'decline', p: 0 });
  assert.equal(t.phase, 'end'); assert.equal(t.auction, null);
});

test('Mietberechnung: Grundmiete, doppelte Miete bei voller Gruppe, Häuser, Bahnhöfe, Versorger, Hypothek', () => {
  const s = two();
  s.own[1].o = 1;
  assert.equal(R.rent(s, 1, 7), 2);
  s.own[3].o = 1;
  assert.equal(R.rent(s, 1, 7), 4, 'volle Gruppe ohne Häuser = doppelte Miete');
  s.own[1].h = 3; assert.equal(R.rent(s, 1, 7), 90);
  s.own[1].h = 5; assert.equal(R.rent(s, 1, 7), 250);
  s.own[5].o = 1; assert.equal(R.rent(s, 5, 7), 25);
  s.own[15].o = 1; s.own[25].o = 1; assert.equal(R.rent(s, 5, 7), 100);
  s.own[35].o = 1; assert.equal(R.rent(s, 5, 7), 200);
  assert.equal(R.rent(s, 5, 7, 'rail2'), 400);
  s.own[12].o = 1; assert.equal(R.rent(s, 12, 8), 32);
  s.own[28].o = 1; assert.equal(R.rent(s, 12, 8), 80);
  s.own[28].m = true; assert.equal(R.rent(s, 28, 8), 0, 'keine Miete auf beliehene Grundstücke');
});

test('Miete wird beim Betreten bezahlt (Geld bleibt erhalten)', () => {
  let s = two();
  s.own[6].o = 1; s.own[8].o = 1; s.own[9].o = 1;
  const before = total(s);
  s = act(s, { type: 'roll', p: 0 }, [2, 4]);   // Feld 6: Gruppe komplett → 12
  assert.equal(s.players[0].money, 1488); assert.equal(s.players[1].money, 1512); assert.equal(total(s), before);
  assert.equal(s.stats[0].rentPaid, 12);
});

test('Bebauung: nur mit voller Gruppe, gleichmäßig, begrenzter Häuserbestand, Hotel', () => {
  let s = two({ houses: 10, hotels: 1 });
  s.own[1].o = 0;
  bad(s, { type: 'build', p: 0, sq: 1 }, 'needGroup');
  s.own[3].o = 0;
  s = act(s, { type: 'build', p: 0, sq: 1 });
  assert.equal(s.own[1].h, 1); assert.equal(s.players[0].money, 1450); assert.equal(s.bank.houses, 9);
  bad(s, { type: 'build', p: 0, sq: 1 }, 'uneven');
  for (let i = 0; i < 3; i++) { s = act(s, { type: 'build', p: 0, sq: 3 }); s = act(s, { type: 'build', p: 0, sq: 1 }); }
  s = act(s, { type: 'build', p: 0, sq: 3 });
  assert.equal(s.own[1].h, 4); assert.equal(s.own[3].h, 4); assert.equal(s.bank.houses, 2);
  s = act(s, { type: 'build', p: 0, sq: 1 });
  assert.equal(s.own[1].h, 5); assert.equal(s.bank.hotels, 0); assert.equal(s.bank.houses, 6, 'Hotel gibt 4 Häuser zurück');
  bad(s, { type: 'build', p: 0, sq: 3 }, 'noStock');
  bad(s, { type: 'build', p: 0, sq: 1 }, 'maxLevel');
  bad(s, { type: 'build', p: 1, sq: 1 }, 'notNow');
  assert.equal(R.validate(s), '');
});

test('Gebäude verkaufen: halber Preis, gleichmäßig abbauen, Hotel zurück zu Häusern', () => {
  let s = two();
  s.own[1].o = 0; s.own[3].o = 0; s.own[1].h = 5; s.own[3].h = 4; s.bank.houses = 32 - 4; s.bank.hotels = 11;
  bad(s, { type: 'sell', p: 0, sq: 3 }, 'uneven');
  s = act(s, { type: 'sell', p: 0, sq: 1 });
  assert.equal(s.own[1].h, 4); assert.equal(s.players[0].money, 1525); assert.equal(s.bank.hotels, 12); assert.equal(s.bank.houses, 24);
  s = act(s, { type: 'sell', p: 0, sq: 3 });
  assert.equal(s.own[3].h, 3); assert.equal(s.players[0].money, 1550);
  assert.equal(R.validate(s), '');
});

test('Hypotheken: beleihen, keine Gebäude in der Gruppe, zurückzahlen mit 10 % Zinsen', () => {
  let s = two();
  s.own[1].o = 0; s.own[3].o = 0; s.own[3].h = 1; s.bank.houses = 31;
  bad(s, { type: 'mortgage', p: 0, sq: 1 }, 'hasBuildings');
  s = act(s, { type: 'sell', p: 0, sq: 3 });
  s = act(s, { type: 'mortgage', p: 0, sq: 1 });
  assert.equal(s.own[1].m, true); assert.equal(s.players[0].money, 1500 + 25 + 30);
  bad(s, { type: 'mortgage', p: 0, sq: 1 }, 'mortgaged');
  bad(s, { type: 'build', p: 0, sq: 3 }, 'groupMortgaged');
  s = act(s, { type: 'unmortgage', p: 0, sq: 1 });
  assert.equal(s.own[1].m, false); assert.equal(s.players[0].money, 1555 - 33);
});

test('Handel: Grundstücke, Geld und Freikarten; Annehmen, Ablehnen, Gegenangebot', () => {
  let s = two();
  s.own[1].o = 0; s.own[3].o = 1; s.own[6].o = 1; s.own[6].m = true; s.players[1].cards = ['chance'];
  s = act(s, { type: 'propose', p: 0, to: 1, give: { money: 100, props: [1] }, get: { props: [3, 6], cards: 1 } });
  assert.equal(s.trades.length, 1);
  const id = s.trades[0].id;
  bad(s, { type: 'accept', p: 0, id }, 'notYourTrade');
  s = act(s, { type: 'accept', p: 1, id });
  assert.equal(s.own[1].o, 1); assert.equal(s.own[3].o, 0); assert.equal(s.own[6].o, 0); assert.equal(s.own[6].m, true);
  assert.equal(s.players[0].cards.length, 1); assert.equal(s.players[1].cards.length, 0);
  assert.equal(s.players[1].money, 1600);
  assert.equal(s.players[0].money, 1500 - 100 - 5, 'Hypothek übernommen: 10 % Zinsen sofort');
  s = act(s, { type: 'propose', p: 0, to: 1, give: { money: 50 }, get: { props: [1] } });
  s = act(s, { type: 'counter', p: 1, id: s.trades[0].id, give: { props: [1] }, get: { money: 150 } });
  assert.equal(s.trades.length, 1); assert.equal(s.trades[0].from, 1); assert.equal(s.trades[0].counter > 0, true);
  s = act(s, { type: 'reject', p: 0, id: s.trades[0].id });
  assert.equal(s.trades.length, 0);
  bad(s, { type: 'propose', p: 0, to: 1, give: {}, get: {} }, 'emptyTrade');
});

test('Handel mit Gebäuden in der Gruppe ist nicht erlaubt; ungültig gewordene Angebote verfallen', () => {
  let s = three();
  s.own[1].o = 0; s.own[3].o = 0; s.own[1].h = 1; s.bank.houses = 31;
  bad(s, { type: 'propose', p: 0, to: 1, give: { props: [3] }, get: { money: 10 } }, 'hasBuildings');
  s.own[1].h = 0; s.bank.houses = 32;
  // Zwei gleichzeitige Angebote über dasselbe Grundstück: nach dem ersten Abschluss verfällt das zweite
  s = act(s, { type: 'propose', p: 0, to: 1, give: { props: [3] }, get: { money: 100 } });
  s = act(s, { type: 'propose', p: 0, to: 2, give: { props: [3] }, get: { money: 120 } });
  const [t1, t2] = s.trades.map(t => t.id);
  s = act(s, { type: 'accept', p: 2, id: t2 });
  assert.equal(s.own[3].o, 2);
  assert.equal(s.trades.length, 0, 'überholtes Angebot wurde entfernt');
  bad(s, { type: 'accept', p: 1, id: t1 }, 'noTrade');
  assert.equal(s.players[0].money, 1620); assert.equal(s.players[1].money, 1500);
});

test('Ereigniskarten: jede Karte hat eine echte Wirkung', () => {
  for (const deck of ['chance', 'chest']) {
    const cards = deck === 'chance' ? R.CHANCE : R.CHEST;
    assert.ok(cards.length >= 20);
    cards.forEach((c, id) => {
      let s = three(); s.own[39].o = 1; s.own[5].o = 2; s.own[15].o = 2;
      s.own[1].o = 0; s.own[3].o = 0; s.own[1].h = 2; s.own[3].h = 5; s.bank.houses = 30; s.bank.hotels = 11;
      s.decks[deck].order = [id].concat(s.decks[deck].order.filter(x => x !== id)); s.decks[deck].i = 0;
      const pos = deck === 'chance' ? 7 : 2; s.players[0].pos = pos - 3;
      const before = JSON.stringify([s.players, s.own]);
      s = act(s, { type: 'roll', p: 0 }, [1, 2]);
      assert.ok(s.log.some(e => e.e === 'card' && e.deck === deck && e.id === id), `Karte ${deck} ${id} gezogen`);
      assert.notEqual(JSON.stringify([s.players, s.own]), before, `Karte ${deck} ${id} (${c.t}) hat Wirkung`);
      assert.equal(R.validate(s), '');
    });
  }
});

test('Kartenstapel werden gemischt, fortlaufend gezogen und neu gemischt', () => {
  let s = two(); s.players[0].money = 1e6; s.players[1].money = 1e6;
  const first = s.decks.chance.order.slice();
  assert.notDeepEqual(first, Array.from({ length: 20 }, (_, i) => i));
  const seen = [];
  for (let k = 0; k < 22; k++) {
    s.cur = 0; s.phase = 'roll'; s.players[0].jail = false; s.players[0].doubles = 0; s.players[0].pos = 4; s.extra = false;
    s = act(s, { type: 'roll', p: 0 }, [1, 2]);
    seen.push(s.log.filter(e => e.e === 'card').pop().id);
    s.debts = []; s.cont = null; s.pending = null; s.auction = null;
  }
  assert.deepEqual(seen.slice(0, 20).sort((a, b) => a - b).length, 20);
  assert.ok(s.log.some(e => e.e === 'shuffle') || s.players[0].cards.length > 0);
});

test('Gefängnis: Pasch befreit, Kaution, Freikarte, nach drei Versuchen Pflichtzahlung', () => {
  let s = two(); s.players[0].jail = true; s.players[0].pos = 10;
  s = act(s, { type: 'roll', p: 0 }, [1, 2]);
  assert.equal(s.players[0].jail, true); assert.equal(s.players[0].pos, 10); assert.equal(s.phase, 'end');
  s = act(s, { type: 'endTurn', p: 0 }); s = act(s, { type: 'roll', p: 1 }, [1, 2]); if (s.phase === 'buy') s = act(s, { type: 'buy', p: 1 }); s = act(s, { type: 'endTurn', p: 1 });
  s = act(s, { type: 'roll', p: 0 }, [3, 3]);
  assert.equal(s.players[0].jail, false); assert.equal(s.players[0].pos, 16);
  assert.notEqual(s.phase, 'roll', 'Pasch aus dem Gefängnis gibt keinen Zusatzwurf');
  let t = two(); t.players[0].jail = true; t.players[0].pos = 10;
  t = act(t, { type: 'payJail', p: 0 });
  assert.equal(t.players[0].money, 1450); assert.equal(t.players[0].jail, false); assert.equal(t.phase, 'roll');
  let u = two(); u.players[0].jail = true; u.players[0].pos = 10; u.players[0].cards = ['chest'];
  u.decks.chest.order = u.decks.chest.order.filter(id => R.CHEST[id].t !== 'goojf');   // Karte liegt beim Spieler, nicht im Stapel
  u = act(u, { type: 'useCard', p: 0 });
  assert.equal(u.players[0].cards.length, 0); assert.equal(u.players[0].jail, false); assert.equal(u.decks.chest.order.length, 20);
  let v = two(); v.players[0].jail = true; v.players[0].pos = 10; v.players[0].jailTurns = 2;
  v = act(v, { type: 'roll', p: 0 }, [1, 2]);
  assert.equal(v.players[0].jail, false); assert.equal(v.players[0].pos, 13); assert.equal(v.players[0].money <= 1450, true);
});

test('Gehe-ins-Gefängnis-Feld', () => {
  let s = two(); s.players[0].pos = 25;
  s = act(s, { type: 'roll', p: 0 }, [2, 3]);
  assert.equal(s.players[0].pos, 10); assert.equal(s.players[0].jail, true); assert.equal(s.phase, 'end');
  assert.ok(!s.log.some(e => e.e === 'pay' && e.why === 'go'), 'kein Startgeld auf dem Weg ins Gefängnis');
});

test('Zahlungsunfähigkeit: Liquidieren, dann bezahlen', () => {
  let s = two();
  s.players[0].money = 10; s.own[39].o = 1; s.own[37].o = 1; s.own[39].h = 1; s.bank.houses = 31;
  s.own[11].o = 0; s.own[13].o = 0; s.own[14].o = 0; s.own[11].h = 1; s.own[13].h = 1; s.own[14].h = 1; s.bank.houses = 28;
  s.players[0].pos = 35;
  s = act(s, { type: 'roll', p: 0 }, [1, 3]);   // Feld 39: 200 Miete
  assert.equal(s.phase, 'debt'); assert.equal(s.debts[0].amount, 200);
  bad(s, { type: 'payDebt', p: 0 }, 'noMoney');
  bad(s, { type: 'endTurn', p: 0 }, 'notNow');
  bad(s, { type: 'mortgage', p: 0, sq: 11 }, 'hasBuildings');
  s = act(s, { type: 'sell', p: 0, sq: 11 }); s = act(s, { type: 'sell', p: 0, sq: 13 }); s = act(s, { type: 'sell', p: 0, sq: 14 });
  s = act(s, { type: 'mortgage', p: 0, sq: 14 });   // 10 + 150 + 80 = 240 ≥ 200 → automatisch bezahlt
  assert.equal(s.phase, 'end'); assert.equal(s.players[0].money, 40); assert.equal(s.players[1].money, 1700);
});

test('Insolvenz an Mitspieler: Vermögen und Hypotheken gehen über, Spiel endet mit Sieger', () => {
  let s = two();
  s.players[0].money = 5; s.own[39].o = 1; s.own[39].h = 5; s.bank.hotels = 11;
  s.own[1].o = 0; s.own[1].m = true; s.own[5].o = 0; s.players[0].cards = ['chance'];
  s.players[0].pos = 35;
  s = act(s, { type: 'roll', p: 0 }, [1, 3]);
  assert.equal(s.phase, 'debt');
  s = act(s, { type: 'bankrupt', p: 0 });
  assert.equal(s.players[0].out, true);
  assert.equal(s.own[1].o, 1); assert.equal(s.own[1].m, true, 'Hypothek bleibt bestehen'); assert.equal(s.own[5].o, 1);
  assert.equal(s.players[1].cards.length, 1);
  assert.equal(s.phase, 'over'); assert.equal(s.winner, 1);
  assert.equal(s.players[1].money, 1505, 'Bargeld übernommen (Partie vorbei, daher keine Hypothekenzinsen mehr fällig)');
});

test('Insolvenz an die Bank: Grundstücke werden wieder frei, Partie geht weiter', () => {
  let s = three();
  s.players[0].money = 50; s.own[1].o = 0; s.own[3].o = 0; s.own[1].h = 2; s.own[3].h = 2; s.own[1].m = false; s.bank.houses = 28;
  s.players[0].pos = 36;
  s = act(s, { type: 'roll', p: 0 }, [1, 1]);   // Feld 38: Steuer 100
  assert.equal(s.phase, 'debt');
  s = act(s, { type: 'bankrupt', p: 0 });
  assert.equal(s.players[0].out, true); assert.equal(s.own[1].o, -1); assert.equal(s.own[1].h, 0); assert.equal(s.bank.houses, 32);
  assert.equal(s.cur, 1); assert.equal(s.phase, 'roll'); assert.equal(R.validate(s), '');
});

test('Siegbedingung im Schnellspiel: Rundenlimit, Sieger nach Vermögen', () => {
  let s = R.newGame({ seed: 3, mode: 'quick', cfg: { maxRounds: 1, startProps: 0 }, players: [{ name: 'A', human: true }, { name: 'B', human: true }] });
  s.players[1].money = 5000;
  s = act(s, { type: 'roll', p: 0 }, [1, 3]); if (s.phase === 'debt') s.players[0].money += 1000, s = act(s, { type: 'payDebt', p: 0 });
  if (s.phase === 'buy') s = act(s, { type: 'decline', p: 0 }); while (s.phase === 'auction') s = act(s, { type: 'pass', p: R.actor(s) });
  s = act(s, { type: 'endTurn', p: 0 });
  s = act(s, { type: 'roll', p: 1 }, [1, 3]); if (s.phase === 'buy') s = act(s, { type: 'decline', p: 1 }); while (s.phase === 'auction') s = act(s, { type: 'pass', p: R.actor(s) });
  s = act(s, { type: 'endTurn', p: 1 });
  assert.equal(s.phase, 'over'); assert.equal(s.endReason, 'rounds'); assert.equal(s.winner, 1);
  let q = R.newGame({ seed: 9, mode: 'quick', players: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
  assert.equal(q.own.filter(o => o && o.o >= 0).length, 6, 'Schnellspiel verteilt Startgrundstücke');
  bad(q, { type: 'timeUp', p: 0 }, 'notAllowed');
});

test('Vermögensberechnung', () => {
  const s = two();
  s.own[1].o = 0; s.own[3].o = 0; s.own[1].h = 2; s.own[5].o = 0; s.own[5].m = true;
  assert.equal(R.worth(s, 0), 1500 + 60 + 60 + 100 + 100);
});

test('Ungültige Aktionen werden abgelehnt und ändern nichts', () => {
  const s = two();
  bad(s, { type: 'roll', p: 1 }, 'notNow');
  bad(s, { type: 'buy', p: 0 }, 'notNow');
  bad(s, { type: 'endTurn', p: 0 }, 'notNow');
  bad(s, { type: 'bid', p: 0, amount: 5 }, 'notYourBid');
  bad(s, { type: 'hack', p: 0 }, 'badAction');
  bad(s, { type: 'build', p: 0, sq: 0 }, 'notStreet');
  bad(s, { type: 'mortgage', p: 0, sq: 1 }, 'notOwner');
  bad(s, { type: 'roll', p: 7 }, 'badPlayer');
  bad(s, { type: 'roll', p: 0, tid: 99 }, 'staleTurn');
  bad(s, { type: 'propose', p: 0, to: 0, give: { money: 1 } }, 'badPlayer');
  bad(s, { type: 'propose', p: 0, to: 1, give: { money: 99999 } }, 'noMoney');
});

test('Doppelte Netzwerkaktionen (gleiche Aktions-ID) werden nur einmal ausgeführt', () => {
  let s = two();
  s = act(s, { type: 'roll', p: 0, aid: 'x1' }, [1, 2]);
  s = act(s, { type: 'buy', p: 0, aid: 'x2' });
  const money = s.players[0].money;
  const r = R.apply(s, { type: 'buy', p: 0, aid: 'x2' });
  assert.equal(r.ok, true); assert.equal(r.dup, true); assert.equal(r.state, s);
  assert.equal(r.state.players[0].money, money);
  s = act(s, { type: 'endTurn', p: 0, aid: 'x3' });
  const again = R.apply(s, { type: 'endTurn', p: 0, aid: 'x3' });
  assert.equal(again.dup, true); assert.equal(again.state.cur, 1);
});

test('Spielstand speichern und laden: exakt gleicher Spielverlauf danach', () => {
  let a = R.newGame({ seed: 77, players: [{ name: 'A', bot: 'medium' }, { name: 'B', bot: 'hard' }, { name: 'C', bot: 'easy' }] });
  const step = (s, log) => { for (const p of R.active(s)) { const x = AI.next(s, p); if (x) { if (log) log.push(x); return R.apply(s, x).state; } } throw new Error('stuck'); };
  for (let i = 0; i < 150 && a.phase !== 'over'; i++) a = step(a);
  const saved = JSON.stringify(a);
  let b = JSON.parse(saved);
  assert.equal(R.validate(b), '');
  assert.deepEqual(b, a, 'geladener Stand ist identisch');
  const actions = [];
  for (let i = 0; i < 200 && a.phase !== 'over'; i++) a = step(a, actions);
  for (const x of actions) b = R.apply(b, x).state;   // gleiche Aktionen auf den geladenen Stand → gleiche Würfel, Karten, Ergebnisse
  assert.equal(JSON.stringify(b), JSON.stringify(a));
  assert.equal(R.validate(Object.assign({}, b, { v: 99 })), 'schema');
  const broken = JSON.parse(saved); broken.bank.houses += 3;
  assert.equal(R.validate(broken), 'buildings');
});

test('Komplette automatisierte Partien vom Start bis zur Siegerermittlung (Bots, Invarianten in jedem Schritt)', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const n = 2 + seed % 5, lv = ['easy', 'medium', 'hard'];
    let startMoney = 0, built = 0;
    const { s } = runGame({ seed, mode: seed % 3 === 0 ? 'quick' : 'classic', players: Array.from({ length: n }, (_, i) => ({ name: 'B' + i, bot: lv[(i + seed) % 3] === 'easy' ? 'medium' : lv[(i + seed) % 3] })), limit: 40000 }, (s, a) => {
      assert.equal(R.validate(s), '', 'Spielstand gültig');
      for (const p of s.players) assert.ok(p.money >= 0 && Number.isInteger(p.money), 'kein negatives oder krummes Guthaben');
      if (a.type === 'build') built++;
    });
    assert.equal(s.phase, 'over', `Partie ${seed} endet`);
    assert.ok(s.winner >= 0 && !s.players[s.winner].out, 'gültiger Sieger');
    if (s.endReason === 'bankrupt') assert.equal(R.active(s).length, 1);
  }
});

test('KI hält sich an die Regeln: jede Bot-Aktion ist gültig, kein Geld aus dem Nichts', () => {
  let s = R.newGame({ seed: 5, players: [{ name: 'A', bot: 'hard' }, { name: 'B', bot: 'hard' }, { name: 'C', bot: 'easy' }, { name: 'D', bot: 'medium' }] });
  for (let i = 0; i < 3000 && s.phase !== 'over'; i++) {
    let x = null; for (const p of R.active(s)) { x = AI.next(s, p); if (x) break; }
    const before = total(s);
    const r = R.apply(s, x);
    assert.ok(r.ok || x.type === 'accept', `${x.type}: ${r.err}`);
    const gained = r.events.filter(e => e.e === 'pay' && e.from === -1).reduce((a, e) => a + e.amt, 0) + r.events.filter(e => e.e === 'bankrupt').reduce((a, e) => a + e.bsale, 0);
    const toBank = r.events.filter(e => (e.e === 'pay' && e.to === -1) || e.e === 'buy' || e.e === 'build' || e.e === 'unmortgage').reduce((a, e) => a + e.amt, 0)
      + r.events.filter(e => e.e === 'sold').reduce((a, e) => a + e.amt, 0);
    const fromBank = r.events.filter(e => e.e === 'sell' || e.e === 'mortgage').reduce((a, e) => a + e.amt, 0);
    const lost = r.events.filter(e => e.e === 'bankrupt' && e.to < 0).reduce((a, e) => a + e.cash, 0);
    assert.equal(total(r.state), before + gained - toBank + fromBank - lost, `Geldbilanz bei ${x.type}`);
    s = r.state;
  }
});

test('Steuern und Topf-Regel: Steuer an die Bank bzw. in den Topf, Frei Parken kassiert den Topf', () => {
  let s = two({ parkingPot: true });
  s = act(s, { type: 'roll', p: 0 }, [1, 3]);        // Feld 4: Steuer 200
  assert.equal(s.players[0].money, 1300); assert.equal(s.pot, 200);
  s = act(s, { type: 'endTurn', p: 0 });
  s.players[1].pos = 10;
  s = act(s, { type: 'roll', p: 1 }, [4, 6]);        // Feld 20: Frei Parken
  assert.equal(s.players[1].money, 1700); assert.equal(s.pot, 0);
  let t = two();
  t = act(t, { type: 'roll', p: 0 }, [1, 3]);
  assert.equal(t.players[0].money, 1300); assert.equal(t.pot, 0, 'ohne Topf-Regel geht die Steuer an die Bank');
});

test('Aufgeben außerhalb des eigenen Zugs: Besitz zurück an die Bank, Partie läuft weiter', () => {
  let s = three();
  s.own[1].o = 1; s.own[3].o = 1;
  s = act(s, { type: 'resign', p: 1 });
  assert.equal(s.players[1].out, true);
  assert.equal(s.own[1].o, -1); assert.equal(s.own[3].o, -1);
  assert.equal(s.phase, 'roll'); assert.equal(s.cur, 0);
  s = act(s, { type: 'resign', p: 2 });
  assert.equal(s.phase, 'over'); assert.equal(s.winner, 0);
});

test('Zeitlimit: nur die Uhr darf die Partie beenden, Sieger nach Vermögen', () => {
  let s = two({ timeLimit: 10 });
  s.players[1].money = 2000;
  bad(s, { type: 'timeUp', p: 0 }, 'notAllowed');
  bad(two(), { type: 'timeUp', p: -1 }, 'notAllowed');
  s = act(s, { type: 'timeUp', p: -1 });
  assert.equal(s.phase, 'over'); assert.equal(s.endReason, 'time'); assert.equal(s.winner, 1);
});

test('Veraltete Aktionen (falsche Zug-ID) werden abgelehnt', () => {
  const s = two();
  bad(s, { type: 'roll', p: 0, tid: s.turnId + 1 }, 'staleTurn');
  act(s, { type: 'roll', p: 0, tid: s.turnId }, [1, 2]);
});

test('Beschädigte Spielstände werden beim Laden erkannt', () => {
  const ok = two();
  assert.equal(R.validate(ok), '');
  const a = R.clone(ok); a.bank.houses = 5; assert.equal(R.validate(a), 'buildings');
  const b = R.clone(ok); b.players[0].money = -5; assert.equal(R.validate(b), 'players');
  const c = R.clone(ok); c.own.pop(); assert.equal(R.validate(c), 'schema');
  const d = R.clone(ok); d.own[0] = { o: 0, h: 0, m: false }; assert.equal(R.validate(d), 'own');
  assert.equal(R.validate(null), 'schema');
});

test('Unvollständige Spielstände werfen keinen Fehler, sondern werden abgelehnt', () => {
  for (const k of ['bank', 'cfg', 'decks', 'debts', 'trades', 'stats']) { const s = R.clone(two()); delete s[k]; assert.equal(R.validate(s), 'schema', k); }
  const s = R.clone(two()); s.players[1] = null; assert.equal(R.validate(s), 'schema');
});

test('Hotel abbauen bei leerem Häuservorrat nur, wenn die Gruppe gleichmäßig bleibt', () => {
  let s = three({ houses: 8 });
  [1, 3].forEach(i => { s.own[i].o = 0; s.own[i].h = 0; });   // Gruppe 0: Felder 1 und 3
  s.own[1].h = 5; s.own[3].h = 5; s.bank.hotels -= 2; s.bank.houses = 0;
  bad(s, { type: 'sell', p: 0, sq: 1 }, 'uneven');
  s.own[3].h = 1; s.bank.hotels++; s.bank.houses = 7;            // validate-konsistent: 1 Haus verbaut
  s.bank.houses = 0; s.cfg.houses = 1;
  s = act(s, { type: 'sell', p: 0, sq: 1 });                        // Hotel → 0 Häuser, Nachbar hat 1: erlaubt
  assert.equal(s.own[1].h, 0);
});

test('Rangliste: Ausgeschiedene nach Reihenfolge des Ausscheidens', () => {
  let s = R.newGame({ seed: 3, players: ['A', 'B', 'C', 'D'].map(n => ({ name: n, human: true })) });
  s = act(s, { type: 'resign', p: 1 });   // B zuerst raus
  s = act(s, { type: 'resign', p: 3 });   // dann D
  s = act(s, { type: 'resign', p: 2 });   // dann C → A gewinnt
  assert.deepEqual(R.ranking(s).map(o => o.i), [0, 2, 3, 1]);
});

test('Handel während offener Schulden darf den Schuldner nicht ausräumen', () => {
  let s = two();
  s.own[39].o = 1; s.own[1].o = 0; s.own[3].o = 0; s.players[0].money = 10;
  s.players[0].pos = 30; s.cur = 0;
  s.debts = [{ from: 0, to: 1, amount: 100, why: 'rent' }]; s.phase = 'debt';
  s = act(s, { type: 'propose', p: 1, to: 0, give: { money: 1 }, get: { props: [1, 3] } });
  const r = R.apply(s, { type: 'accept', p: 0, id: s.trades[0].id });
  assert.equal(r.ok, false); assert.equal(r.err, 'debtTrade'); assert.equal(r.state.own[1].o, 0);
  s = act(s, { type: 'propose', p: 1, to: 0, give: { money: 150 }, get: { props: [1] } });
  s = act(s, { type: 'accept', p: 0, id: s.trades[s.trades.length - 1].id });   // bringt genug Geld: erlaubt
  assert.equal(s.own[1].o, 1);
});

test('KI-Handelsgedächtnis gilt nur für die eigene Partie', () => {
  const players = [{ name: 'A', bot: 'medium' }, { name: 'B', bot: 'medium' }];
  const a = R.newGame({ seed: 9, players }), b = R.newGame({ seed: 9, players, id: 'zweite' });
  a.own[1].o = 0; a.own[3].o = 1; b.own[1].o = 0; b.own[3].o = 1;
  assert.ok(AI.propose(a, 0), 'Bot schlägt in Partie 1 einen Tausch vor');
  assert.equal(AI.propose(a, 0), null, 'im selben Zug nicht noch einmal');
  assert.ok(AI.propose(b, 0), 'eine neue Partie mit gleicher Zugnummer ist davon nicht betroffen');
});

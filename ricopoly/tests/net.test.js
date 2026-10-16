// Online-Logik des Gastgebers ohne Netzwerk:  node --test ricopoly/tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');
const AI = require('../js/ai.js');
const N = require('../js/net.js');

function setup(opt) {
  let clock = 1000;
  const inbox = {};
  const host = new N.HostCore({ code: 'ABC234', now: () => clock, send: (cid, m) => (inbox[cid] = inbox[cid] || []).push(m) });
  host.addHost({ name: 'Host', char: 'king', token: 'host-token-123' });
  host.receive('c1', { t: 'hello', v: N.VERSION, name: 'Lea', char: 'elf', token: 'tok-lea-000001' });
  host.receive('c2', { t: 'hello', v: N.VERSION, name: 'Max<script>', char: 'robot', token: 'tok-max-000002' });
  host.receive('c1', { t: 'ready', v: true }); host.receive('c2', { t: 'ready', v: true });
  if (opt && opt.cfg) host.configure({ cfg: opt.cfg });
  return { host, inbox, tick: ms => { clock += ms; }, last: cid => (inbox[cid] || []).filter(m => m.t === 'state').pop() };
}

test('Lobby: Beitritt, Bereit-Status, Namen werden bereinigt, Start nur wenn alle bereit', () => {
  const { host, inbox } = setup();
  assert.equal(host.seats.length, 3);
  assert.equal(host.seats[2].name, 'Maxscript');
  assert.ok(inbox.c1.some(m => m.t === 'welcome' && m.seat === 1));
  host.receive('c2', { t: 'ready', v: false });
  assert.equal(host.canStart(), false);
  host.receive('c2', { t: 'ready', v: true });
  assert.equal(host.start(5), true);
  assert.equal(host.state.players.length, 3);
  host.receive('c3', { t: 'hello', v: N.VERSION, name: 'Spät', token: 'tok-late-00003' });
  assert.ok(inbox.c3.some(m => m.t === 'reject' && m.reason === 'started'));
});

test('Mitspieler erhalten den Spielstand ohne Zufallszustand', () => {
  const { host, last } = setup(); host.start(77);
  const s = last('c1').s;
  assert.equal(s.rng, 0); assert.notEqual(host.state.rng, 0);
  assert.equal(s.players[1].name, 'Lea');
});

test('Unberechtigte Aktionen: niemand kann für einen anderen Platz handeln', () => {
  const { host, inbox } = setup(); host.start(1);
  const before = JSON.stringify(host.state);
  host.receive('c1', { t: 'act', a: { type: 'roll', p: 0, aid: 'x' } });   // Lea gibt sich als Gastgeber aus
  assert.equal(JSON.stringify(host.state), before, 'Zustand unverändert');
  assert.ok(inbox.c1.some(m => m.t === 'err' && m.err === 'notNow'));
  host.receive('c1', { t: 'act', a: { type: 'giveMoney', p: 1, amount: 1e6 } });
  assert.ok(inbox.c1.some(m => m.t === 'err' && m.err === 'badAction'));
  host.receive('cX', { t: 'act', a: { type: 'roll' } });                     // unbekannte Verbindung
  assert.equal(JSON.stringify(host.state), before);
});

test('Doppelte Netzwerkaktionen werden nur einmal ausgeführt', () => {
  const { host } = setup(); host.start(3);
  host.act(0, { type: 'roll', aid: 'h-1', tid: host.state.turnId }, 'host');
  const s1 = JSON.stringify(host.state);
  host.act(0, { type: 'roll', aid: 'h-1', tid: 1 }, 'host');
  assert.equal(JSON.stringify(host.state), s1);
});

test('Mehrere gleichzeitig eintreffende Angebote bleiben konsistent', () => {
  const { host } = setup(); host.start(9);
  host.state.own[1].o = 0; host.state.own[3].o = 2;
  host.receive('c1', { t: 'act', a: { type: 'propose', to: 0, give: { money: 100 }, get: { props: [1] }, aid: 'a1' } });
  host.receive('c2', { t: 'act', a: { type: 'propose', to: 0, give: { money: 150, props: [3] }, get: { props: [1] }, aid: 'b1' } });
  assert.equal(host.state.trades.length, 2);
  const [t1, t2] = host.state.trades;
  host.act(0, { type: 'accept', id: t2.id, aid: 'h-acc' }, 'host');
  assert.equal(host.state.own[1].o, 2);
  assert.equal(host.state.trades.length, 0, 'zweites Angebot verfällt, Grundstück ist weg');
  const r = host.act(0, { type: 'accept', id: t1.id, aid: 'h-acc2' }, 'host');
  assert.equal(r.ok, false);
  const money = host.state.players.map(p => p.money);
  assert.deepEqual(money, [1650, 1500, 1350]);
});

test('Unterbrochene Online-Partie: Abbruch, Vertretung nach Zeitlimit, Wiederbeitritt mit Schlüssel', () => {
  const { host, inbox, tick, last } = setup(); host.configure({ afk: 20 }); host.start(11);
  // Gastgeber beendet seinen Zug
  let guard = 0;
  while (host.state.cur === 0 && guard++ < 50) { const a = AI.next(host.state, 0) || { type: 'endTurn' }; host.act(0, Object.assign(a, { aid: 'h' + guard }), 'host'); }
  assert.equal(host.state.cur, 1);
  host.disconnect('c1');
  assert.equal(host.seats[1].online, false);
  assert.equal(host.tick(), null, 'vor Ablauf der Wartezeit passiert nichts');
  tick(21000);
  const r = host.tick();
  assert.ok(r && r.ok, 'abwesender Spieler wird nach Regeln vertreten');
  // Wiederbeitritt mit falschem Schlüssel scheitert, mit richtigem klappt er
  host.receive('c9', { t: 'hello', v: N.VERSION, name: 'Fake', token: 'falscher-schluessel' });
  assert.ok(inbox.c9.some(m => m.t === 'reject'));
  host.receive('c1b', { t: 'hello', v: N.VERSION, name: 'Lea', token: 'tok-lea-000001' });
  assert.ok(inbox.c1b.some(m => m.t === 'welcome' && m.seat === 1));
  assert.equal(host.seats[1].online, true);
  assert.deepEqual(last('c1b').s.players.map(p => p.money), host.state.players.map(p => p.money), 'gleiche Daten wie beim Gastgeber');
});

test('Online-Integration: komplette Partie über den Gastgeber, alle sehen denselben Endstand', () => {
  const { host, last, tick } = setup({ cfg: { maxRounds: 25 } });
  host.configure({ mode: 'quick', cfg: { maxRounds: 25 }, bots: [{ name: 'Bot', level: 'hard', char: 'robot' }] });
  host.start(21);
  const cids = ['host', 'c1', 'c2'];
  let n = 0;
  while (host.state.phase !== 'over' && n++ < 20000) {
    const s = host.state; let acted = false; tick(80);
    for (let seat = 0; seat < 3 && !acted; seat++) {
      const a = AI.next(s, seat);
      if (a) { a.aid = 'p' + seat + ':' + n; a.tid = s.turnId; if (seat === 0) host.act(0, a, 'host'); else host.receive(cids[seat], { t: 'act', a }); acted = true; }
    }
    if (!acted) host.tick();
  }
  assert.equal(host.state.phase, 'over');
  assert.ok(host.state.winner >= 0);
  for (const c of ['c1', 'c2']) {
    const s = last(c).s;
    assert.equal(s.phase, 'over'); assert.equal(s.winner, host.state.winner);
    assert.deepEqual(s.players.map(p => p.money), host.state.players.map(p => p.money));
    assert.deepEqual(s.own, host.state.own);
  }
});

test('Rate-Limit: Flut von Nachrichten wird verworfen', () => {
  const { host } = setup(); host.start(2);
  const before = host.state.seq;
  for (let i = 0; i < 100; i++) host.receive('c2', { t: 'act', a: { type: 'roll', aid: 'f' + i } });
  assert.equal(host.state.seq, before);
});

test('Lobby: Verlässt ein Gast den Raum, erfahren die nachrückenden ihren neuen Platz', () => {
  const sent = [];
  const core = new N.HostCore({ code: 'ABC123', send: (cid, m) => sent.push([cid, m]), onChange: () => {} });
  core.addHost({ name: 'Host', token: 'hosttoken1' });
  core.receive('c1', { t: 'hello', v: N.VERSION, name: 'Eins', token: 'token-eins-1' });
  core.receive('c2', { t: 'hello', v: N.VERSION, name: 'Zwei', token: 'token-zwei-2' });
  sent.length = 0;
  core.disconnect('c1');
  const w = sent.filter(([cid, m]) => cid === 'c2' && m.t === 'welcome');
  assert.equal(w.length, 1); assert.equal(w[0][1].seat, 1);
  assert.equal(core.seats[1].name, 'Zwei');
});

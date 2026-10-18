'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

test('Teams: nur Namen aus der Liste, max. 20 Mitglieder, Rollen, verlassen', async () => {
  const names = (await s.call('GET', '/v1/teams/names')).json.result.names;
  assert.equal(names.length, 40); assert.equal(new Set(names).size, 40);
  const lead = await s.player('t-lead', 'Leni');
  assert.equal((await lead.act('/v1/teams/create', { name: 'Meine Freitext-Gang' })).json.error, 'bad_team_name');
  const c = await lead.act('/v1/teams/create', { name: names[3] });
  assert.equal(c.status, 200, c.text);
  const id = c.json.result.team.id;
  assert.equal(c.json.state.team, id);
  assert.equal((await lead.act('/v1/teams/create', { name: names[4] })).json.error, 'already_in_team');
  const members = [lead];
  for (let i = 1; i < 20; i++) {
    const p = await s.player('t-m' + i, 'Mitglied ' + i);
    const r = await p.act('/v1/teams/join', { team: id });
    assert.equal(r.status, 200, r.text);
    members.push(p);
  }
  const extra = await s.player('t-extra', 'Extra');
  const full = await extra.act('/v1/teams/join', { team: id });
  assert.equal(full.status, 409); assert.equal(full.json.error, 'team_full');
  const open = (await extra.call('GET', '/v1/teams?open=1')).json.result.teams;
  assert.ok(!open.some(t => t.id === id));
  const mine = (await lead.call('GET', '/v1/teams/mine')).json.result.team;
  assert.equal(mine.count, 20);
  assert.equal(mine.members.filter(m => m.role === 'leader').length, 1);
  assert.ok(!JSON.stringify(mine).includes('t-lead'));
  // Teamziel: Ausbauschritte dieser Woche
  await lead.patch({ coins: 1e6, createdAgoMs: 1 });
  await lead.act('/v1/build', { b: 0 }); await lead.act('/v1/build', { b: 1 });
  const m2 = (await members[1].call('GET', '/v1/teams/mine')).json.result.team;
  assert.equal(m2.progress, 2); assert.equal(m2.goal, 25 * 20);
  // Leiter verlässt → Nachfolger
  assert.equal((await lead.act('/v1/teams/leave')).status, 200);
  const m3 = (await members[1].call('GET', '/v1/teams/mine')).json.result.team;
  assert.equal(m3.count, 19);
  assert.equal(m3.members.find(m => m.role === 'leader').pid, (await members[1].me()).pid);
  assert.equal((await extra.act('/v1/teams/join', { team: id })).status, 200);
  assert.equal((await lead.act('/v1/teams/leave')).json.error, 'not_in_team');
  assert.equal((await lead.act('/v1/teams/join', { team: 'zzzzzzzzzz' })).status, 404);
});

test('Teams: Geschenk 3 Spins, max. 5 pro Tag je Sender, max. 1 je Empfänger', async () => {
  const names = (await s.call('GET', '/v1/teams/names')).json.result.names;
  const g = await s.player('g-send', 'Geber');
  const id = (await g.act('/v1/teams/create', { name: names[0] })).json.result.team.id;
  const rs = [];
  for (let i = 0; i < 7; i++) { const p = await s.player('g-r' + i, 'Empf ' + i); await p.act('/v1/teams/join', { team: id }); rs.push(p); }
  const outsider = await s.player('g-out', 'Draußen');
  assert.equal((await g.act('/v1/teams/gift', { to: (await outsider.me()).pid })).json.error, 'not_team_member');
  assert.equal((await g.act('/v1/teams/gift', { to: (await g.me()).pid })).status, 400);
  const e0 = (await rs[0].me()).energy;
  const r = await g.act('/v1/teams/gift', { to: (await rs[0].me()).pid });
  assert.equal(r.status, 200, r.text); assert.equal(r.json.result.sent, 3);
  assert.equal((await rs[0].me()).energy, e0 + 3);
  assert.equal((await g.act('/v1/teams/gift', { to: (await rs[0].me()).pid })).json.error, 'gift_limit_recipient');
  for (let i = 1; i < 5; i++) assert.equal((await g.act('/v1/teams/gift', { to: (await rs[i].me()).pid })).status, 200);
  const lim = await g.act('/v1/teams/gift', { to: (await rs[5].me()).pid });
  assert.equal(lim.status, 429); assert.equal(lim.json.error, 'gift_limit');
  s.now.add(864e5);   // nächster Tag
  assert.equal((await g.act('/v1/teams/gift', { to: (await rs[5].me()).pid })).status, 200);
  assert.equal((await g.act('/v1/teams/gift', { to: (await rs[0].me()).pid })).status, 200);
});

test('Tausch: Empfänger bestätigt → atomarer Tausch', async () => {
  const a = await s.player('tr-a', 'Anna'), b = await s.player('tr-b', 'Ben');
  await a.patch({ cards: { w01c1: 2 } }); await b.patch({ cards: { w01c2: 1 } });
  const bp = (await b.me()).pid;
  assert.equal((await a.act('/v1/trades/offer', { to: bp, give: 'w31c1', want: 'w01c2' })).json.error, 'bad_card');
  assert.equal((await a.act('/v1/trades/offer', { to: bp, give: 'w01c9', want: 'w01c2' })).json.error, 'bad_card');
  assert.equal((await a.act('/v1/trades/offer', { to: bp, give: 'w02c1', want: 'w01c2' })).json.error, 'card_missing');
  const o = await a.act('/v1/trades/offer', { to: bp, give: 'w01c1', want: 'w01c2' });
  assert.equal(o.status, 200, o.text);
  const id = o.json.result.trade.id;
  assert.equal((await b.call('GET', '/v1/trades')).json.result.incoming[0].id, id);
  assert.equal((await a.act('/v1/trades/accept', { trade: id })).json.error, 'not_recipient');
  const acc = await b.act('/v1/trades/accept', { trade: id });
  assert.equal(acc.status, 200, acc.text);
  assert.deepEqual((await a.me()).cards, { w01c1: 1, w01c2: 1 });
  assert.deepEqual((await b.me()).cards, { w01c1: 1 });
  assert.equal((await b.act('/v1/trades/accept', { trade: id })).status, 404);
});

test('Tausch: Karte weg → Fehler, nichts passiert; max. 5 offen; Ablauf 48 h; Abbruch', async () => {
  const a = await s.player('tr-c', 'Carla'), b = await s.player('tr-d', 'Dora');
  await a.patch({ cards: { w03c3: 1 } }); await b.patch({ cards: { w03c4: 1 } });
  const bp = (await b.me()).pid;
  const id = (await a.act('/v1/trades/offer', { to: bp, give: 'w03c3', want: 'w03c4' })).json.result.trade.id;
  await a.patch({ cards: {} });   // A hat die Karte inzwischen nicht mehr
  const r = await b.act('/v1/trades/accept', { trade: id });
  assert.equal(r.status, 409); assert.equal(r.json.error, 'card_missing');
  assert.deepEqual((await b.me()).cards, { w03c4: 1 });
  assert.deepEqual((await a.me()).cards, {});
  // max. 5 offene
  await a.patch({ cards: { w03c3: 1 } });
  for (let i = 0; i < 4; i++) assert.equal((await a.act('/v1/trades/offer', { to: bp, give: 'w03c3', want: 'w03c' + (5 + (i % 3)) })).status, 200);
  const six = await a.act('/v1/trades/offer', { to: bp, give: 'w03c3', want: 'w03c8' });
  assert.equal(six.status, 429); assert.equal(six.json.error, 'too_many_offers');
  // Abbruch durch Empfänger
  assert.equal((await b.act('/v1/trades/cancel', { trade: id })).status, 200);
  assert.equal((await a.call('GET', '/v1/trades')).json.result.outgoing.length, 4);
  // Ablauf
  s.now.add(48 * 36e5 + 1);
  assert.equal((await a.call('GET', '/v1/trades')).json.result.outgoing.length, 0);
  assert.equal((await a.act('/v1/trades/offer', { to: bp, give: 'w03c3', want: 'w03c8' })).status, 200);
});

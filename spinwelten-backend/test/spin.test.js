'use strict';
const H = require('./helpers');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

let s;
before(async () => { s = await H.start(); });
after(async () => { await s.stop(); });

const CARD = /^w(0[1-9]|[12][0-9]|30)c[1-8]$/;

test('2000 Spins über die Logik-Schicht: Energie nie negativ, Münzen exakt gebucht', async () => {
  const tok = () => H.token('spinner', { name: 'Spinner', nowMs: s.now() });
  let r = await s.direct('POST', '/v1/account/init', {}, tok());
  let st = r.json.state, ok = 0, noEnergy = 0, cards = 0;
  for (let i = 0; i < 2000; i++) {
    r = await s.direct('POST', '/v1/spin', { nonce: 'logic' + i + 'xx', mult: 1 }, tok());
    if (r.status === 409) {
      assert.equal(r.json.error, 'not_enough_energy'); assert.equal(st.energy, 0); noEnergy++;
      s.now.add(180e3 * 3);   // Energie regeneriert (Server-Uhr)
      st = (await s.direct('GET', '/v1/me', undefined, tok())).json.state;
      assert.equal(st.energy, 3);
      continue;
    }
    assert.equal(r.status, 200, r.text);
    const res = r.json.result, ns = r.json.state;
    assert.ok(ns.energy >= 0 && Number.isInteger(ns.energy));
    assert.ok(Number.isSafeInteger(ns.coins) && ns.coins >= 0);
    assert.equal(ns.coins - st.coins, res.coins + (res.shieldOverflowCoins || 0) + (res.actionCoins || 0));
    assert.equal(ns.energy, st.energy - 1 + res.reward.spins);
    assert.ok(ns.shields <= 3);
    assert.equal(res.ids.length, 3);
    const ev = s.E.evaluate(res.ids);
    assert.equal(ev.rule, res.rule);
    if (res.cards) { assert.equal(res.cards.length, 2); res.cards.forEach(c => assert.match(c, CARD)); cards += 2; }
    if (res.reward.shield && st.shields === 3) assert.equal(res.shieldOverflowCoins, 10 * s.E.base(1, 0));
    if (res.reward.action && st.pending) assert.ok(res.actionCoins > 0, 'zweite Aktion wird zu Münzen');
    if (res.pending) assert.equal(ns.pending.kind, res.pending);
    st = ns; ok++;
  }
  assert.ok(ok > 1000); assert.ok(noEnergy > 0);
  assert.equal(Object.values(st.cards).reduce((a, b) => a + b, 0), cards);
  assert.equal(st.stats.spins, ok);
});

test('mindestens 200 Spins über HTTP + Idempotenz', async () => {
  const p = await s.player('http-spinner', 'Hanna');
  await p.patch({ energy: 1000 });
  let st = await p.me();
  for (let i = 0; i < 220; i++) {
    const r = await p.act('/v1/spin', { mult: 1 });
    assert.equal(r.status, 200, r.text);
    assert.ok(r.json.state.energy >= 0);
    assert.equal(r.json.state.energy, st.energy - 1 + r.json.result.reward.spins);
    st = r.json.state;
  }
  // gleiche nonce zweimal → identische Antwort, nur einmal gebucht
  const body = { nonce: 'same-nonce-123', mult: 1 };
  const a = await p.call('POST', '/v1/spin', body);
  const b = await p.call('POST', '/v1/spin', body);
  assert.equal(a.status, 200); assert.equal(a.text, b.text);
  assert.equal(b.headers.get('x-idempotent-replay'), '1');
  const after1 = await p.me();
  assert.equal(after1.stats.spins, st.stats.spins + 1);
  // parallel mit derselben nonce
  const par = await Promise.all(Array.from({ length: 10 }, () => p.call('POST', '/v1/spin', { nonce: 'parallel-nonce-1', mult: 1 })));
  assert.ok(par.every(x => x.text === par[0].text));
  assert.equal((await p.me()).stats.spins, after1.stats.spins + 1);
  // gleiche nonce für andere Aktion → 409
  const c = await p.call('POST', '/v1/build', { nonce: 'same-nonce-123', b: 0 });
  assert.equal(c.status, 409); assert.equal(c.json.error, 'nonce_reused');
});

test('mult nicht freigeschaltet / ungültig → 400, Energie zu klein → 409', async () => {
  const p = await s.player('mult-test', 'Mia');
  for (const mult of [2, 50, 7, 0, -1, 1.5, '1', null]) {
    const r = await p.act('/v1/spin', { mult });
    assert.equal(r.status, 400, String(mult));
  }
  assert.equal((await p.act('/v1/spin', { mult: 2 })).json.error, 'mult_locked');
  await p.patch({ islandsDone: 3, island: 4, energy: 4 });
  assert.equal((await p.act('/v1/spin', { mult: 5 })).json.error, 'not_enough_energy');
  const ok = await p.act('/v1/spin', { mult: 3 });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.state.energy, 1 + ok.json.result.reward.spins);
  assert.equal((await p.me()).energy, ok.json.state.energy);
});

test('fehlende/ungültige nonce → 400', async () => {
  const p = await s.player('nonce-test', 'Nico');
  for (const nonce of [undefined, 'kurz', 'x'.repeat(65), 'mit leerzeichen 1', 12345678]) {
    const r = await p.call('POST', '/v1/spin', { nonce, mult: 1 });
    assert.equal(r.status, 400); assert.equal(r.json.error, 'bad_nonce');
  }
});

test('Energie regeneriert nur nach Server-Uhr (1 je 180 s, max. 50)', async () => {
  const p = await s.player('regen', 'Rita');
  await p.patch({ energy: 0 });
  s.now.add(179e3); assert.equal((await p.me()).energy, 0);
  s.now.add(1e3); assert.equal((await p.me()).energy, 1);
  s.now.add(180e3 * 100); assert.equal((await p.me()).energy, 50);
});

test('Verfallene Aktion (10 min) wird in Münzen umgewandelt', async () => {
  const p = await s.player('expire', 'Emil');
  await p.patch({ pending: { kind: 'raid', mult: 1 } });
  const c0 = (await p.me()).coins;
  s.now.add(10 * 60e3 + 1);
  const st = await p.me();
  assert.equal(st.pending, null);
  assert.equal(st.coins, c0 + s.E.base(1, 0) * s.E.RAID.avg);
});

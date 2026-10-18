/* Kartentausch: Angebot (je 1 Karte) → Empfänger bestätigt → atomarer Tausch, wenn beide die Karten noch besitzen.
 * Max. 5 offene Angebote je Nutzer, Ablauf 48 h. */
'use strict';
const { fail, PID_RE, CARD_RE, ID_RE, HOUR } = require('./util');

const MAX_OPEN = 5, TTL = 48 * HOUR;

module.exports = function trades(ctx) {
  const pub = uid => { const a = ctx.store.data.accounts[uid]; return { pid: ctx.pid(uid), name: a ? a.name : '?' }; };
  const view = tr => ({ id: tr.id, from: pub(tr.from), to: pub(tr.to), give: tr.give, want: tr.want, created: tr.created, expiresAt: tr.exp });
  const openOf = (uid, now) => Object.values(ctx.store.data.trades).filter(tr => tr.from === uid && tr.exp > now).length;

  function offer({ t, me, input, now }) {
    if (typeof input.to !== 'string' || !PID_RE.test(input.to)) fail(400, 'bad_target');
    if (typeof input.give !== 'string' || !CARD_RE.test(input.give) || typeof input.want !== 'string' || !CARD_RE.test(input.want)) fail(400, 'bad_card');
    if (input.give === input.want) fail(400, 'same_card');
    const to = ctx.uidOfPid(input.to);
    if (!to) fail(404, 'target_not_found');
    if (to === me.uid) fail(400, 'bad_target');
    if (!(me.cards[input.give] > 0)) fail(409, 'card_missing');
    if (openOf(me.uid, now) >= MAX_OPEN) fail(429, 'too_many_offers');
    const id = ctx.SW.rng.uid(12);
    const tr = t.put('trades', id, { id, from: me.uid, to, give: input.give, want: input.want, created: now, exp: now + TTL });
    return { trade: view(tr) };
  }

  function getTrade(t, input, now) {
    if (typeof input.trade !== 'string' || !ID_RE.test(input.trade)) fail(400, 'bad_trade');
    const tr = t.get('trades', input.trade);
    if (!tr) fail(404, 'trade_not_found');
    if (tr.exp <= now) { t.del('trades', tr.id); fail(410, 'trade_expired'); }
    return tr;
  }

  function accept({ t, me, input, now }) {
    const tr = getTrade(t, input, now);
    if (tr.to !== me.uid) fail(403, 'not_recipient');
    const from = t.get('accounts', tr.from);
    if (!from) fail(404, 'target_not_found');
    // Beide müssen ihre Karte JETZT noch besitzen – sonst passiert nichts (Angebot bleibt bestehen)
    if (!(from.cards[tr.give] > 0) || !(me.cards[tr.want] > 0)) fail(409, 'card_missing');
    const take = (acc, id) => { acc.cards[id] -= 1; if (acc.cards[id] <= 0) delete acc.cards[id]; };
    const put = (acc, id) => { acc.cards[id] = Math.min(999, (acc.cards[id] || 0) + 1); };
    take(from, tr.give); put(me, tr.give);
    take(me, tr.want); put(from, tr.want);
    from.stats.trades += 1; me.stats.trades += 1;
    t.del('trades', tr.id);
    return { traded: true, got: tr.give, gave: tr.want };
  }

  function cancel({ t, me, input, now }) {
    const tr = getTrade(t, input, now);
    if (tr.from !== me.uid && tr.to !== me.uid) fail(403, 'not_party');
    t.del('trades', tr.id);
    return { cancelled: true };
  }

  function list({ me, now }) {
    const all = Object.values(ctx.store.data.trades).filter(tr => tr.exp > now);
    return {
      incoming: all.filter(tr => tr.to === me.uid).map(view),
      outgoing: all.filter(tr => tr.from === me.uid).map(view),
      maxOpen: MAX_OPEN
    };
  }

  return { offer, accept, cancel, list, MAX_OPEN, TTL };
};

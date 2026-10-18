/* Öffentliche Raumliste für P2P-Schnellspiel. Der Raum selbst läuft per WebRTC (cloud/fire-peer.js) zwischen den Geräten;
 * der Server kennt nur Code, Modus und Belegung. Nur im Speicher, TTL 90 s, max. 1 Raum je uid, max. 200 gesamt. */
'use strict';
const { fail, isInt } = require('./util');

const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/, MODES = ['race', 'duel', 'coop'], TTL = 90e3, MAX_ROOMS = 200;

module.exports = function rooms(ctx) {
  const byUid = new Map();   // uid → { code, mode, players, max, created, at }

  function sweep(now) { for (const [u, r] of byUid) if (now - r.at > TTL) byUid.delete(u); }
  const pub = (r, now) => ({ code: r.code, mode: r.mode, players: r.players, max: r.max, age: Math.floor((now - r.created) / 1000) });

  function publish({ user, body, now }) {
    sweep(now);
    const { code, mode, players, max } = body;
    if (typeof code !== 'string' || !CODE_RE.test(code)) fail(400, 'bad_code');
    if (!MODES.includes(mode)) fail(400, 'bad_mode');
    if (!isInt(max, 2, 8) || !isInt(players, 1, 8) || players > max) fail(400, 'bad_players');
    for (const [u, r] of byUid) if (u !== user.uid && r.code === code) fail(409, 'code_taken');
    const old = byUid.get(user.uid);
    if (!old && byUid.size >= MAX_ROOMS) fail(503, 'rooms_full');
    const created = old && old.code === code ? old.created : now;
    byUid.set(user.uid, { code, mode, players, max, created, at: now });
    return { ok: true, result: { room: pub(byUid.get(user.uid), now), ttlSec: TTL / 1000 } };
  }

  function unpublish({ user }) {
    const had = byUid.delete(user.uid);
    return { ok: true, result: { removed: had } };
  }

  function list({ now }) {
    sweep(now);
    const rooms = [...byUid.values()].sort((a, b) => b.at - a.at).map(r => pub(r, now));
    return { ok: true, result: { rooms } };
  }

  function quick({ query, now }) {
    sweep(now);
    const mode = query.get('mode');
    if (mode != null && mode !== '' && !MODES.includes(mode)) fail(400, 'bad_mode');
    const free = [...byUid.values()].filter(r => r.players < r.max && (!mode || r.mode === mode)).sort((a, b) => b.at - a.at);
    return { ok: true, result: { room: free.length ? pub(free[0], now) : null } };
  }

  return { publish, unpublish, list, quick, remove: uid => byUid.delete(uid), size: () => byUid.size, TTL, MAX_ROOMS };
};

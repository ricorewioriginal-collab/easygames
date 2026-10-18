/* Globale Ranglisten aus Server-Konten (also nur verifizierte Konten). Ergebnis 30 s zwischengespeichert. */
'use strict';
const { fail } = require('./util');

const TOP = 50, CACHE_MS = 30e3;

module.exports = function leaderboards(ctx) {
  const cache = {};
  const score = {
    islands: a => a.islandsDone * 1000 + a.stages.reduce((x, y) => x + y, 0),
    coins: a => a.lifetimeCoins
  };
  function sorted(kind, now) {
    const c = cache[kind];
    if (c && now - c.at < CACHE_MS) return c;
    const rows = Object.values(ctx.store.data.accounts).map(a => ({ uid: a.uid, name: a.name, value: score[kind](a), created: a.created }));
    rows.sort((a, b) => b.value - a.value || a.created - b.created);
    const rank = new Map(rows.map((r, i) => [r.uid, i + 1]));
    return (cache[kind] = { at: now, rows, rank });
  }
  function leaderboard({ user, query, now }) {
    const kind = query.get('kind') || 'islands';
    if (!score[kind]) fail(400, 'bad_kind');
    const s = sorted(kind, now);
    const own = user && !user.anonymous ? s.rank.get(user.uid) : undefined;
    return { ok: true, result: {
      kind, total: s.rows.length,
      top: s.rows.slice(0, TOP).map((r, i) => ({ rank: i + 1, name: r.name, value: r.value })),
      me: own ? { rank: own, value: s.rows[own - 1].value } : null
    } };
  }
  return { leaderboard, invalidate: () => { for (const k in cache) delete cache[k]; } };
};

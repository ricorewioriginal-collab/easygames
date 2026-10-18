/* Spinwelten 3D – Sammelkarten, Truhen, Relikt-Laden, Duplikat-Tausch und faire Bot-Händler.
 * Karten kommen nur aus Alben bereits erreichter Inseln (in Neues Spiel+ aus allen). Ziehung: erst Seltenheit nach den
 * veröffentlichten Truhen-Wahrscheinlichkeiten (SW.CHESTS.odds), dann gleichverteilt eine Karte dieser Seltenheit. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const cardsOf = w => (SW.CARDS || []).filter(c => c.w === w);
  P.cardPoolMax = function () { return this.s.ngp > 0 ? 30 : Math.min(30, this.s.island); };
  P.uniqueCards = function () { let n = 0; for (const k in this.s.cards) if (this.s.cards[k] > 0) n++; return n; };
  P.drawCard = function (rng, odds) {
    const max = this.cardPoolMax();
    const pool = (SW.CARDS || []).filter(c => c.w <= max);
    let r = rng.weighted([0, 1, 2, 3], i => odds[i]);
    let cand = pool.filter(c => c.r === r);
    while (!cand.length && r > 0) { r--; cand = pool.filter(c => c.r === r); }
    return cand.length ? rng.pick(cand) : null;
  };
  P.addCard = function (c) {
    const s = this.s, had = (s.cards[c.id] || 0) > 0;
    s.cards[c.id] = (s.cards[c.id] || 0) + 1;
    if (!had) { this.stat('cards'); this.eventAction('new_card', 1); }
    const alb = this.checkAlbum(c.w);
    return { card: c, isNew: !had, album: alb };
  };
  P.albumProgress = function (w) { const cs = cardsOf(w); return { have: cs.filter(c => (this.s.cards[c.id] || 0) > 0).length, total: cs.length }; };
  P.checkAlbum = function (w) {
    const s = this.s; if (s.albumsDone[w]) return null;
    const p = this.albumProgress(w); if (!p.total || p.have < p.total) return null;
    s.albumsDone[w] = true;
    const rew = { spins: 20 + w, coins: this.base() * 80, relics: 25 };
    s.energy += rew.spins; this.addCoins(rew.coins, 'album'); this.addRelics(rew.relics);
    this.stat('albums'); this.emit('album', { w, rew });
    return rew;
  };
  P.openChest = function (type) {
    const s = this.s, C = SW.CHESTS[type]; if (!C) return { error: 'bad' };
    if (!(s.chests[type] > 0)) return { error: 'none' };
    s.chests[type] -= 1;
    let n = C.cards; if (this.rng.next() < this.bonus().cards) n += 1;
    const got = [];
    for (let i = 0; i < n; i++) { const c = this.drawCard(this.rng, C.odds); if (c) got.push(this.addCard(c)); }
    this.stat('chests'); this.eventAction('chest', 1);
    this.log({ k: 'chest', type, n: got.length });
    const out = { ok: true, type, cards: got };
    this.emit('chest', out);
    return out;
  };
  P.buy = function (itemId) {
    const s = this.s, it = (SW.SHOP || []).find(x => x.id === itemId); if (!it) return { error: 'bad' };
    const dk = SW.Clock.dayKey(this.now());
    if (it.daily) { const used = (s.shopDay[dk + ':' + it.id] || 0); if (used >= it.daily) return { error: 'daily' }; }
    if (it.kind === 'shield' && s.shields >= this.maxShields()) return { error: 'full' };
    if (s.relics < it.price) return { error: 'relics' };
    s.relics -= it.price;
    if (it.daily) { for (const k in s.shopDay) if (k.slice(0, 10) !== dk) delete s.shopDay[k]; s.shopDay[dk + ':' + it.id] = (s.shopDay[dk + ':' + it.id] || 0) + 1; }
    if (it.kind === 'chest') s.chests[it.arg] = (s.chests[it.arg] || 0) + 1;
    else if (it.kind === 'snack') s.snacks += it.arg;
    else if (it.kind === 'shield') s.shields += 1;
    return { ok: true, item: it };
  };
  // Duplikate gegen Relikte eintauschen (je Seltenheit)
  P.dupCount = function (r) { let n = 0; for (const c of SW.CARDS || []) if (c.r === r && (this.s.cards[c.id] || 0) > 1) n += this.s.cards[c.id] - 1; return n; };
  P.exchangeDups = function (r) {
    let n = 0; const s = this.s;
    for (const c of SW.CARDS || []) if (c.r === r && (s.cards[c.id] || 0) > 1) { n += s.cards[c.id] - 1; s.cards[c.id] = 1; }
    if (!n) return { error: 'none' };
    const rel = this.addRelics(n * SW.RARITY[r].dupRelics);
    return { ok: true, n, relics: rel };
  };
  // Bot-Händler: täglich drei Angebote "eine deiner Doppelten gegen eine fehlende Karte gleicher Seltenheit" (1:1, fair)
  P.botTrades = function () {
    const s = this.s, dk = SW.Clock.dayKey(this.now()), rng = SW.rng.seeded('trade:' + s.id + ':' + dk);
    const max = this.cardPoolMax(), out = [];
    const dups = (SW.CARDS || []).filter(c => (s.cards[c.id] || 0) > 1);
    const missing = (SW.CARDS || []).filter(c => c.w <= max && !(s.cards[c.id] > 0));
    const traders = rng.shuffle(SW.BOTS.slice()).slice(0, 3);
    traders.forEach((t, i) => {
      const key = dk + ':' + i;
      const r = rng.pick([0, 0, 0, 1, 1, 2]);
      const want = rng.shuffle(dups.filter(c => c.r === r)).slice(0, 1)[0];
      const give = rng.shuffle(missing.filter(c => c.r === r)).slice(0, 1)[0];
      // Fehlt keine Karte dieser Seltenheit mehr, zahlt der Händler Relikte (so bleiben Tausch-Aufgaben immer schaffbar)
      const relics = !give && want ? SW.RARITY[r].dupRelics * 3 : 0;
      out.push({ key, bot: t.id, botName: t.name, r, want: want || null, give: give || null, relics, done: !!s.tradeDone[key] });
    });
    return out;
  };
  P.acceptBotTrade = function (key) {
    const s = this.s, o = this.botTrades().find(x => x.key === key);
    if (!o || o.done || !o.want || !(o.give || o.relics)) return { error: 'bad' };
    if (!((s.cards[o.want.id] || 0) > 1)) return { error: 'gone' };
    s.cards[o.want.id] -= 1;
    s.tradeDone[key] = 1;
    const dk = key.slice(0, 10); for (const k in s.tradeDone) if (k.slice(0, 10) !== dk) delete s.tradeDone[k];
    const res = o.give ? this.addCard(o.give) : { relics: this.addRelics(o.relics) };
    this.stat('trades'); this.eventAction('trade', 1);
    return { ok: true, got: res };
  };
})(globalThis.SW = globalThis.SW || {});

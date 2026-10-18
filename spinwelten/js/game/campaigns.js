/* Spinwelten 3D – Fortschritt: Story-Aufgaben, Erfolge, Events, Tages-/Wochenziele, Minispiel- und Online-Belohnungen.
 * Aufgaben: immer bis zu drei offene Aufgaben (in Story-Reihenfolge, nur aus erreichten Kapiteln). Fortschritt zählt ab
 * dem Moment, in dem eine Aufgabe sichtbar wird (Startwert gespeichert); Ziele wie "Inseln" zählen absolut. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  const QSTAT = { spin: 'spins', build: 'builds', island: 'islands', album: 'albums', cards: 'cards', raid: 'raids', attack: 'attacks', shield: 'blocks',
    repair: 'repairs', minigame: 'mg_wins', visit: 'visits', companion: 'companions', train: 'trains', chest: 'chests', event: 'event_points',
    trade: 'trades', mult: 'max_mult', jackpot: 'jackpots', bigwin: 'bigwins', revenge: 'revenges' };
  const ABS = { island: 1, album: 1, cards: 1, companion: 1, mult: 1 };
  P.qStat = function (q) {
    if (q.type === 'minigame' && q.arg) return 'mg_' + q.arg;
    if (q.type === 'visit' && q.arg) return 'visit_' + q.arg;
    return QSTAT[q.type] || q.type;
  };
  // Reparieren zählt auch abgewehrte Stürme mit – wer immer Schutzorbs hat, bleibt sonst bei dieser Aufgabe hängen
  P.qRaw = function (q) { const st = this.s.stats; return q.type === 'repair' ? (st.repairs || 0) + (st.blocks || 0) : (st[this.qStat(q)] || 0); };
  P.qValue = function (q) {
    const st = this.s.stats, k = this.qStat(q);
    if (q.type === 'companion') return Object.keys(this.s.comps).length - 1;
    if (q.type === 'cards') return this.uniqueCards();
    if (q.type === 'album') return Object.keys(this.s.albumsDone).length;
    if (ABS[q.type]) return st[k] || 0;
    return this.qRaw(q) - (this.s.quests.base[q.id] || 0);
  };
  P.activeQuests = function () {
    const s = this.s, ch = this.s.ngp > 0 ? 5 : this.chapter(), out = [];
    for (const q of SW.QUESTS || []) {
      if (s.quests.done[q.id]) continue;
      if (q.ch > ch) break;
      if (!(q.id in s.quests.base)) s.quests.base[q.id] = this.qRaw(q);
      const v = Math.max(0, this.qValue(q));
      out.push({ q, v: Math.min(v, q.n), ready: v >= q.n });
      if (out.length >= 3) break;
    }
    return out;
  };
  P.claimQuest = function (id) {
    const s = this.s, a = this.activeQuests().find(x => x.q.id === id);
    if (!a || !a.ready) return { error: 'notready' };
    s.quests.done[id] = this.now();
    const rw = this.giveReward(a.q.reward || {});
    this.stat('quests');
    const ch = a.q.ch, last = !(SW.QUESTS || []).some(q => q.ch === ch && !s.quests.done[q.id]);
    this.emit('quest', { q: a.q, rw, chapterDone: last ? ch : -1 });
    return { ok: true, rw, chapterDone: last ? ch : -1 };
  };
  // Belohnung geben (coins in Basis-Vielfachen)
  P.giveReward = function (r) {
    const s = this.s, out = {};
    if (r.coins) out.coins = this.addCoins(this.base() * r.coins, 'reward');
    if (r.spins) { s.energy += r.spins; out.spins = r.spins; }
    if (r.relics) out.relics = this.addRelics(r.relics);
    if (r.chest) { s.chests[r.chest] = (s.chests[r.chest] || 0) + 1; out.chest = r.chest; }
    if (r.snacks) { s.snacks += r.snacks; out.snacks = r.snacks; }
    return out;
  };
  // Erfolge
  P.checkAch = function (k) {
    const s = this.s;
    for (const a of SW.ACHIEVEMENTS || []) {
      if (s.ach[a.id] || (k && a.stat !== k)) continue;
      const v = a.stat === 'cards' ? this.uniqueCards() : a.stat === 'albums' ? Object.keys(s.albumsDone).length : (s.stats[a.stat] || 0);
      if (v >= a.n) { s.ach[a.id] = this.now(); this.addRelics(5); this.emit('achievement', a); }
    }
  };
  P.afterStat = function (k) {
    if (this._inStat) return;            // keine Rekursion (z. B. Erfolg -> Relikte -> Event -> Zähler)
    this._inStat = true;
    try { this.checkAch(k); this.checkCompanions(); } finally { this._inStat = false; }
  };
  // Events
  P.eventCheck = function (now) {
    const s = this.s, cur = SW.Clock.eventAt(now);
    if (s.ev.id !== cur.def.id || s.ev.start !== cur.start) { s.ev = { id: cur.def.id, start: cur.start, pts: 0, claimed: [] }; this.emit('eventNew', cur); }
    return cur;
  };
  P.eventAction = function (act, n) {
    if (!SW.EVENTS) return 0;
    const s = this.s, cur = this.eventCheck(this.now());
    const per = cur.def.pts[act]; if (!per) return 0;
    const pts = Math.round(per * (n || 1) * (1 + this.bonus().event));
    s.ev.pts += pts;
    this.stat('event_points', pts);
    // Schwellen automatisch gutschreiben (kein Verpassen)
    SW.EVENT_TIERS.forEach((t, i) => {
      if (s.ev.pts >= t.at && !s.ev.claimed.includes(i)) { s.ev.claimed.push(i); const rw = this.giveReward(t.reward); this.emit('eventTier', { i, rw }); }
    });
    return pts;
  };
  // Tages-/Wochenziele (deterministisch aus Datum)
  P.dailyGoals = function () {
    const s = this.s, r = SW.rng.seeded('d:' + s.daily.day);
    return r.shuffle(SW.DAILY_GOALS.slice()).slice(0, 3).map((g, i) => ({ g, i, v: Math.min(g.n, s.daily.prog[g.stat] || 0), done: !!(s.daily.claimed && s.daily.claimed[i]) }));
  };
  P.weeklyGoals = function () {
    const s = this.s, r = SW.rng.seeded('w:' + s.weekly.wk);
    return r.shuffle(SW.WEEKLY_GOALS.slice()).slice(0, 3).map((g, i) => ({ g, i, v: Math.min(g.n, s.weekly.prog[g.stat] || 0), done: !!s.weekly.claimed[i] }));
  };
  P.claimGoal = function (weekly, i) {
    const list = weekly ? this.weeklyGoals() : this.dailyGoals(), g = list[i];
    if (!g || g.done || g.v < g.g.n) return { error: 'notready' };
    const box = weekly ? this.s.weekly : this.s.daily; box.claimed = box.claimed || {}; box.claimed[i] = 1;
    return { ok: true, rw: this.giveReward(weekly ? { spins: 40, chest: 'gold' } : { spins: 10, relics: 8 }) };
  };
  // Minispiel-Ergebnis. Gratis: 3 Runden pro Tag, danach Tickets (aus Portalfunken).
  P.mgPlaysLeft = function () { const d = this.s.daily; return Math.max(0, 3 - (d.mg || 0)) + this.s.tickets; };
  P.mgBegin = function () {
    const d = this.s.daily;
    if ((d.mg || 0) < 3) { d.mg = (d.mg || 0) + 1; return 'free'; }
    if (this.s.tickets > 0) { this.s.tickets -= 1; return 'ticket'; }
    return '';
  };
  P.mgResult = function (id, res) {
    this.stat('minigames');
    if (!res || !res.win) return { ok: true, win: false };
    const stars = Math.max(1, Math.min(3, res.stars || 1));
    const rw = { coins: this.addCoins(this.base() * 12 * stars, 'minigame'), relics: this.addRelics(4 * stars) };
    this.stat('mg_wins'); this.stat('mg_' + id); this.eventAction('mg_win', 1);
    this.compXp(this.s.active, 10);
    return { ok: true, win: true, stars, rw };
  };
  // Atlas-Besuch einer anderen Insel
  P.visit = function (w) {
    if (w === this.s.island) return;
    this.stat('visits'); this.stat('visit_' + w);
  };
  // Online-Runde abgeschlossen (idempotent je Raum-Sitzung, damit Wiederverbinden nichts doppelt gibt)
  P.onlineResult = function (sessionId, place, players) {
    const s = this.s; if (!sessionId || s.onlineDone[sessionId]) return null;
    s.onlineDone[sessionId] = this.now();
    const keys = Object.keys(s.onlineDone); if (keys.length > 60) keys.sort((a, b) => s.onlineDone[a] - s.onlineDone[b]).slice(0, keys.length - 60).forEach(k => delete s.onlineDone[k]);
    const win = place === 1 && players > 1;
    this.stat('online_games'); if (win) this.stat('online_wins');
    this.eventAction('online', 1);
    return this.giveReward(win ? { spins: 12, relics: 10 } : { spins: 6, relics: 4 });
  };
})(globalThis.SW = globalThis.SW || {});

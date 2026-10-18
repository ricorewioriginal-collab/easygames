/* Spinwelten 3D – Computer-Rivalen mit eigenem, gespeichertem Fortschritt.
 * Bots "spielen" in Echtzeit weiter (max. 48 h Nachholzeit): drehen (Münzen nach dem echten Erwartungswert der Maschine),
 * bauen nach den echten Baukosten, schützen sich, sammeln Karten – und greifen den Spieler gelegentlich an
 * (begrenzt: Anfängerschutz, Abklingzeiten, Tageslimit, nie im Modus "Friedlicher Entdecker").
 * Bots haben keinen Zugriff auf echte Spieler; alles bleibt im lokalen Spielstand. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  const H = 3600000;
  P.ensureBots = function () {
    const s = this.s; if (!SW.BOTS) return;
    const r = SW.rng.seeded('bots:' + s.id);
    for (const d of SW.BOTS) {
      if (s.bots[d.id]) continue;
      const isl = 1 + r.int(3);
      const st = [0, 0, 0, 0, 0].map(() => r.int(3));
      s.bots[d.id] = { island: isl, stages: st, damaged: [false, false, false, false, false], shields: r.int(2), coins: E().base(isl) * (20 + r.int(40)),
        cards: r.int(6), done: isl - 1, lastHit: 0, grudge: 0, prio: '' };
    }
  };
  P.botLevel = function () { return (SW.BOT_LEVELS || {})[this.s.botLevel] || { speed: 1, actPerHour: 3, attackShare: 0.8 }; };
  // Ein Bot-Zug (h = simulierte Stunden dieses Zugs). Bewusst unvollkommen: Prioritäten wechseln, Fehler passieren.
  P.botStep = function (id, h, rng, allowPlayer) {
    const d = SW.BOTS.find(x => x.id === id), b = this.s.bots[id]; if (!d || !b) return null;
    const L = this.botLevel(), w = d.w;
    // Einkommen: Spins pro Stunde wie ein Spieler im Modus Klassisch (≈20/h) × Stärke
    const spins = 18 * L.speed * h * (0.7 + rng.next() * 0.6);
    b.coins = E().clampInt(b.coins + spins * E().expectation().totalCoins * E().base(b.island));
    // Priorität wählen (gewichtet, gelegentlich zufällig = "Fehler")
    const opts = [['build', w.build], ['protect', w.protect * (b.shields < 2 ? 1 : 0.2)], ['collect', w.collect], ['attack', w.attack * L.attackShare], ['raid', w.raid * L.attackShare], ['save', w.save * 0.5]];
    let pick = rng.next() < d.mistakes ? rng.pick(opts)[0] : rng.weighted(opts, o => o[1])[0];
    b.prio = pick;
    let ev = null;
    if (pick === 'build' || (pick === 'save' && b.coins > E().base(b.island) * 400)) {
      // so lange bauen, wie Geld da ist (höchstens 6 Schritte pro Zug)
      for (let k = 0; k < 6; k++) {
        const i = b.damaged.findIndex(x => x);
        if (i >= 0) { const rc = E().repairCost(b.island, i, Math.max(1, b.stages[i]), 'classic', 0); if (b.coins < rc) break; b.coins -= rc; b.damaged[i] = false; continue; }
        let best = -1, cost = Infinity;
        for (let j = 0; j < 5; j++) if (b.stages[j] < 5) { const c = E().buildCost(b.island, j, b.stages[j], 'classic', 0); if (c < cost) { cost = c; best = j; } }
        if (best < 0) {
          if (b.island < 30) { b.island += 1; b.done += 1; b.stages = [0, 0, 0, 0, 0]; b.damaged = [false, false, false, false, false]; continue; }
          break;
        }
        if (b.coins < cost) break;
        b.coins -= cost; b.stages[best] += 1;
      }
    } else if (pick === 'protect') { if (rng.next() < 0.6) b.shields = Math.min(3, b.shields + 1); }
    else if (pick === 'collect') { b.cards = Math.min(240, b.cards + 1 + rng.int(2)); }
    else if ((pick === 'attack' || pick === 'raid') && allowPlayer) {
      ev = pick === 'attack' ? this.botAttacksPlayer(id, rng) : this.botRaidsPlayer(id, rng);
    }
    return ev;
  };
  // Darf ein Bot den Spieler gerade angreifen?
  P.playerAttackable = function (now) {
    const s = this.s;
    if (s.peaceful) return false;
    if (!s.tutorial.done) return false;
    if (now - s.created < 20 * 60000) return false;                // Anfängerschutz 20 min
    const recent = s.history.filter(x => x.bot && x.by && now - x.t < 8 * H).length;
    return recent < 3;                                              // höchstens 3 Bot-Aktionen in 8 h
  };
  P.botAttacksPlayer = function (id, rng) {
    const s = this.s, d = SW.BOTS.find(x => x.id === id), b = s.bots[id], now = this.now();
    if (now - (b.lastHit || 0) < 3 * H) return null;
    const built = [0, 1, 2, 3, 4].filter(i => s.stages[i] > 0);
    if (!built.length) return null;
    b.lastHit = now;
    const tgt = rng.pick(built);
    const g = this.bonus().guard;
    if (s.shields > 0 || (g > 0 && rng.next() < g)) {
      const usedShield = s.shields > 0; if (usedShield) s.shields -= 1;
      this.stat('blocks'); this.eventAction('block', 1);
      const e = { kind: 'attack', by: id, bot: true, w: s.island, b: tgt, blocked: true, guard: !usedShield };
      this.hist(e); return e;
    }
    const res = this.damageOwn(tgt);
    const e = { kind: 'attack', by: id, bot: true, w: s.island, b: tgt, blocked: false, res };
    this.hist(e); return e;
  };
  P.botRaidsPlayer = function (id, rng) {
    const s = this.s, b = s.bots[id], now = this.now();
    if (now - (b.lastHit || 0) < 3 * H) return null;
    if (s.coins <= 0) return null;
    b.lastHit = now;
    const loot = E().clampInt(Math.min(s.coins * 0.08, this.base() * 40) * (0.5 + rng.next() * 0.5));
    if (!loot) return null;
    this.spend(loot); b.coins = E().clampInt(b.coins + loot);
    const e = { kind: 'raid', by: id, bot: true, coins: loot };
    this.hist(e); return e;
  };
  // Echtzeit-Nachholung: aufgerufen aus tick()
  P.botTick = function (now) {
    const s = this.s; if (!SW.BOTS) return;
    if (now < s.botT) { s.botT = now; return; }
    const dt = Math.min(48 * H, now - s.botT), L = this.botLevel();
    const stepH = 1 / L.actPerHour;
    let steps = Math.floor(dt / (stepH * H));
    if (steps <= 0) return;
    steps = Math.min(steps, 200);
    const rng = SW.rng.seeded('bt:' + s.id + ':' + s.botT);
    let allow = this.playerAttackable(now);
    const evs = [];
    for (let k = 0; k < steps; k++) {
      for (const d of SW.BOTS) {
        // Nur ein Bruchteil der Bots ist pro Schritt aktiv
        if (rng.next() > 0.35) continue;
        const ev = this.botStep(d.id, stepH, rng, allow && rng.next() < 0.12 + (s.bots[d.id].grudge > 0 ? 0.2 : 0));
        if (ev) { evs.push(ev); if (s.bots[d.id].grudge > 0) s.bots[d.id].grudge--; allow = this.playerAttackable(now); }
      }
    }
    s.botT += steps * stepH * H;
    if (evs.length) this.emit('botEvents', evs);
  };
  // Öffentliche Sicht auf einen Bot (für Ziel-Auswahl, Atlas, Rangliste "Computer")
  P.botView = function (id) {
    const d = SW.BOTS.find(x => x.id === id), b = this.s.bots[id];
    return d && b ? { id, name: d.name, look: d.look, bio: d.bio, island: b.island, stages: b.stages.slice(), damaged: b.damaged.slice(), done: b.done, cards: b.cards, coins: b.coins, prio: b.prio, bot: true } : null;
  };
  P.botRanking = function () {
    const list = SW.BOTS.map(d => this.botView(d.id));
    list.push({ id: 'me', name: this.s.name || 'Du', island: this.s.island, done: this.s.islandsDone, stages: this.s.stages, me: true });
    const score = x => x.done * 1000 + x.stages.reduce((a, y) => a + y, 0) * 10;
    return list.sort((a, b) => score(b) - score(a));
  };
})(globalThis.SW = globalThis.SW || {});

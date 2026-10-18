// Spinwelten 3D – Spielregeln ohne Browser: Runenmaschine, Bauen, Sturm, Expedition, Karten, Begleiter, Aufgaben, Events, Speicher, Online-Protokoll.
// Start: node --test spinwelten/tests/*.test.cjs
'use strict';
const test = require('node:test'), assert = require('node:assert');
const path = require('path');
const load = require('./load.cjs');
const career = require('./sim.cjs');

function game(seed, patch) {
  const SW = load();
  let t = Date.UTC(2026, 0, 5, 9);
  const g = SW.newGame(null, { rng: SW.rng.seeded(seed || 'x'), now: () => t, silent: true });
  g.s.tutorial = { done: true, step: 99, queue: [] };
  if (patch) Object.assign(g.s, patch);
  return { SW, g, s: g.s, adv: ms => { t += ms; }, now: () => t };
}

test('100.000 Spins: nur gültige Ergebnisse, Auszahlung passt zur Erwartung, Buchung stimmt', () => {
  const { SW, g, s } = game('spins100k');
  const E = SW.ECON, ids = new Set(E.IDS), ex = E.expectation(), base = g.base();
  let coinsTotal = 0, coinsBase = 0, attacks = 0, raids = 0, n = 100000, spinCoins = 0;
  g.on('coins', e => { if (e.why === 'spin') spinCoins += e.n; });
  for (let i = 0; i < n; i++) {
    s.energy = 1000; s.pending = null;
    const before = s.coins;
    const out = g.spin(1);
    assert.ok(!out.error, 'Spin abgelehnt: ' + out.error);
    assert.strictEqual(out.ids.length, 3);
    out.ids.forEach(id => assert.ok(ids.has(id), 'unbekanntes Symbol ' + id));
    const ev = E.evaluate(out.ids);
    assert.strictEqual(ev.rule, out.rule);
    // Münzen: genau die Spin-Belohnung (+ ggf. Überlauf beim vollen Schild oder Ferdi/Begleiter-Boni)
    assert.ok(s.coins - before >= out.reward.coins, 'Münzbuchung');
    coinsBase += out.reward.coins / base;
    if (out.reward.action === 'attack') attacks++;
    if (out.reward.action === 'raid') raids++;
    assert.ok(Number.isSafeInteger(s.coins) && s.coins >= 0);
    coinsTotal += out.reward.coins;
  }
  assert.strictEqual(spinCoins, coinsTotal, 'Spin-Münzen genau einmal gebucht');
  const mean = coinsBase / n;
  assert.ok(Math.abs(mean - ex.coins) / ex.coins < 0.03, `Münzen/Spin ${mean.toFixed(3)} statt ${ex.coins.toFixed(3)}`);
  assert.ok(Math.abs(attacks / n - ex.attack) < 0.005, 'Sturmquote');
  assert.ok(Math.abs(raids / n - ex.raid) < 0.005, 'Expeditionsquote');
});

test('Multiplikator: nur freigeschaltete Stufen, Energie und Belohnung skalieren', () => {
  const { g, s } = game('mult');
  assert.strictEqual(g.mults()[0], 1);
  assert.strictEqual(g.canSpin(50), 'mult');
  const top = g.mults()[g.mults().length - 1];
  s.energy = top - 1; assert.strictEqual(g.canSpin(top), 'energy');
  s.islandsDone = 30; s.energy = 500;
  for (const m of g.mults()) {
    const e0 = s.energy; s.pending = null; const out = g.spin(m);
    assert.ok(!out.error); assert.strictEqual(e0 - s.energy + (out.reward.spins || 0), m, 'Energie für ×' + m);
  }
  s.pending = { kind: 'attack', m: 1, id: 'p' }; assert.strictEqual(g.spin(1).error, 'pending');
});

test('Bot-Karrieren: keine Sackgassen, Fortschritt plausibel, alle 60 Aufgaben schaffbar', () => {
  const N = +(process.env.SW_CAREERS || 40);
  const spins = [], days = [];
  for (let i = 0; i < N; i++) {
    const r = career('k' + i, { quests: true, maxSpins: 40000 });
    assert.deepStrictEqual(r.err, [], 'Karriere ' + i);
    assert.ok(r.s.ended || r.s.ngp > 0, 'Karriere ' + i + ' nicht durchgespielt');
    const miss = r.SW.QUESTS.filter(q => !r.s.quests.done[q.id]).map(q => q.id);
    assert.deepStrictEqual(miss, [], 'offene Aufgaben in Karriere ' + i);
    assert.ok(Number.isSafeInteger(r.s.coins) && r.s.coins >= 0);
    spins.push(r.spins); days.push(r.days);
  }
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  // Nicht zu schnell, nicht endlos: 30 Inseln brauchen tausende Spins und mehrere Tage Dauerspiel
  assert.ok(avg(spins) > 2500 && avg(spins) < 20000, 'Spins je Karriere ' + avg(spins));
  assert.ok(avg(days) > 2 && avg(days) < 60, 'Tage je Karriere ' + avg(days));
});

test('30 Welten, 150 Bauwerke: jede Stufe kostet, ändert den Zustand und kein Doppelbau', () => {
  const { SW, g, s } = game('build');
  assert.strictEqual(SW.WORLDS.length, 30);
  let prevTotal = 0;
  for (let w = 1; w <= 30; w++) {
    const wd = SW.WORLDS[w - 1]; assert.strictEqual(wd.buildings.length, 5);
    s.island = w; s.stages = [0, 0, 0, 0, 0]; s.damaged = [false, false, false, false, false]; s.coins = 0;
    let total = 0;
    for (let b = 0; b < 5; b++) for (let st = 0; st < 5; st++) {
      const c = g.buildCost(b); assert.ok(c > 0, `Kosten ${w}/${b}/${st}`);
      assert.strictEqual(g.build(b).error, 'coins');
      s.coins = c; const r = g.build(b); assert.ok(r.ok); assert.strictEqual(s.stages[b], st + 1); assert.strictEqual(s.coins, 0);
      total += c;
    }
    assert.strictEqual(g.build(0).error, 'max');
    assert.ok(g.islandComplete());
    assert.ok(total > prevTotal, 'Insel ' + w + ' muss teurer sein'); prevTotal = total;
  }
});

test('Sturm: Schutzorb blockt genau einmal, dann Schaden, dann Stufe zurück; ohne offenen Sturm nichts', () => {
  const { SW, g, s } = game('storm');
  const id = SW.BOTS[0].id, bot = s.bots[id];
  bot.stages = [3, 0, 0, 0, 0]; bot.damaged = [false, false, false, false, false]; bot.shields = 1;
  assert.strictEqual(g.attack(id, 0).error, 'nopending');
  const go = () => { s.pending = { kind: 'attack', m: 1, id: SW.rng.uid(8) }; return g.attack(id, 0); };
  assert.strictEqual(go().res, 'blocked'); assert.strictEqual(bot.shields, 0); assert.strictEqual(s.pending, null);
  assert.strictEqual(go().res, 'damaged'); assert.strictEqual(bot.damaged[0], true);
  assert.strictEqual(go().res, 'downgraded'); assert.strictEqual(bot.stages[0], 2);
  s.pending = { kind: 'attack', m: 1, id: 'z' }; assert.strictEqual(g.attack(id, 2).error, 'empty');
  // eigener Schaden und Reparatur
  s.stages = [2, 0, 0, 0, 0]; assert.strictEqual(g.damageOwn(0), 'damaged'); assert.strictEqual(g.build(0).error, 'damaged');
  s.coins = 0; assert.strictEqual(g.repair(0).error, 'coins'); s.coins = g.repairCostOf(0); assert.ok(g.repair(0).ok); assert.strictEqual(s.coins, 0); assert.strictEqual(s.damaged[0], false);
});

test('Expedition: alle Fundstellen erreichbar, Beute korrekt, keine Doppelbuchung, übersteht Neuladen', () => {
  const { SW, g, s } = game('raid');
  const E = SW.ECON, seen = new Set();
  for (let k = 0; k < 60; k++) {
    s.pending = { kind: 'raid', m: 1, id: 'r' + k };
    const tg = g.raidTargets()[0]; const bot = s.bots[tg.id]; bot.coins = 1e9;
    assert.ok(g.raidStart(tg.id).ok);
    assert.strictEqual(g.raidStart('nope').error, 'started');
    const c0 = s.coins, b0 = bot.coins;
    const first = g.raidDig(k % 6); assert.ok(first.ok); seen.add(first.kind);
    assert.strictEqual(g.raidDig(k % 6).error, 'bad', 'gleiche Stelle zweimal');
    // Neuladen mitten in der Expedition: Anordnung bleibt
    const saved = JSON.parse(JSON.stringify(s)); Object.assign(s, saved);
    const r2 = g.raidDig((k + 1) % 6), r3 = g.raidDig((k + 2) % 6);
    assert.ok(r3.done); assert.strictEqual(g.raidDig((k + 3) % 6).error, 'nopending');
    const got = first.coins + r2.coins + r3.coins;
    assert.strictEqual(s.coins - c0, got); assert.strictEqual(b0 - s.bots[tg.id].coins, got);
    assert.ok(got <= E.raidLootCap(b0, s.island, 1, 0));
  }
  assert.deepStrictEqual([...seen].sort(), ['big', 'empty', 'mid', 'relic']);
});

test('Karten: 240 einzigartig, Truhen geben Karten, Dubletten tauschen verbraucht nur Dubletten', () => {
  const { SW, g, s } = game('cards');
  assert.strictEqual(new Set(SW.CARDS.map(c => c.id)).size, 240);
  s.island = 30;
  for (const k of Object.keys(SW.CHESTS)) { s.chests[k] = 40; for (let i = 0; i < 40; i++) assert.ok(g.openChest(k).ok); assert.strictEqual(g.openChest(k).error, 'none'); }
  assert.ok(g.uniqueCards() > 100);
  for (let r = 0; r < SW.RARITY.length; r++) {
    const dup = g.dupCount(r), uniq = g.uniqueCards(), res = g.exchangeDups(r);
    if (res && res.ok) { assert.strictEqual(g.uniqueCards(), uniq, 'Tausch darf keine Einzelkarte nehmen'); assert.ok(g.dupCount(r) < dup); }
  }
  for (const c of SW.CARDS) assert.ok((s.cards[c.id] || 0) >= 0);
});

test('Begleiter: alle 12 freischaltbar und ihre Wirkung kommt an', () => {
  const { SW, g, s } = game('comp');
  for (const d of SW.COMPANIONS) if (d.unlock) s.stats[d.unlock.stat] = d.unlock.n;
  g.checkCompanions();
  assert.strictEqual(Object.keys(s.comps).length, 12);
  for (const d of SW.COMPANIONS) {
    assert.ok(g.setActive(d.id)); s.comps[d.id].lvl = 5;
    const b = g.bonus(); assert.ok(b[d.effect] > 0, d.id + ' wirkt nicht: ' + d.effect);
  }
  // Rabatt kommt tatsächlich beim Bauen an
  s.comps.mokka.lvl = 10; g.setActive('kivi'); const full = g.buildCost(0); g.setActive('mokka'); assert.ok(g.buildCost(0) < full);
  // Training
  s.relics = 1e6; s.coins = 1e12; s.comps.glim.lvl = 1; s.comps.glim.xp = 0;
  for (let i = 0; i < 200; i++) g.train('glim', false);
  assert.strictEqual(s.comps.glim.lvl, SW.COMP_MAX_LVL); assert.strictEqual(g.train('glim', false).error, 'max');
});

test('Events: 12 verschiedene, lückenlos hintereinander, Punkte und Schwellen einmalig', () => {
  const { SW, g, s, adv, now } = game('ev');
  assert.ok(SW.EVENTS.length >= 12); assert.strictEqual(new Set(SW.EVENTS.map(e => e.id)).size, SW.EVENTS.length);
  const seen = new Set(); let t = SW.EVENT_EPOCH + 1;
  for (let i = 0; i < SW.EVENTS.length * 2; i++) { const e = SW.Clock.eventAt(t), n = SW.Clock.eventAt(e.end); assert.strictEqual(n.start, e.end); seen.add(e.def.id); t = e.end + 1; }
  assert.strictEqual(seen.size, SW.EVENTS.length);
  const cur = g.eventCheck(now()); const act = Object.keys(cur.def.pts)[0];
  const before = s.energy; for (let i = 0; i < 3000; i++) g.eventAction(act, 1);
  assert.strictEqual(new Set(s.ev.claimed).size, s.ev.claimed.length, 'Schwelle doppelt'); assert.ok(s.energy >= before);
  adv(SW.EVENT_DAYS * 864e5); g.eventCheck(now()); assert.strictEqual(s.ev.pts, 0, 'neues Event startet bei 0');
});

test('Tagesbonus nur einmal am Tag, zurückgestellte Uhr bringt nichts', () => {
  const { g, adv } = game('daily');
  g.tick(); assert.ok(g.claimDaily()); assert.strictEqual(g.claimDaily(), null);
  adv(-3 * 864e5); g.tick(); assert.strictEqual(g.claimDaily(), null);
  adv(4 * 864e5); g.tick(); assert.ok(g.claimDaily());
});

test('Spielstand: Export/Import, Migration, kaputte Daten, keine ungültigen Zahlen', () => {
  const { SW, g, s } = game('save');
  s.coins = 12345; s.stages = [2, 1, 0, 0, 0];
  const back = SW.Save.importJSON(SW.Save.exportJSON(s));
  assert.strictEqual(back.coins, 12345); assert.deepStrictEqual(back.stages, [2, 1, 0, 0, 0]);
  assert.throws(() => SW.Save.importJSON('{kaputt'), e => e.code === 'json');
  assert.throws(() => SW.Save.importJSON(JSON.stringify({ game: 'anderes', state: {} })), e => e.code === 'format');
  assert.throws(() => SW.Save.importJSON(JSON.stringify({ game: 'spinwelten', state: Object.assign({}, s, { v: 999 }) })), e => e.code === 'newer');
  const old = JSON.parse(JSON.stringify(s)); old.v = 1; delete old.helper; delete old.snacks;
  const mig = SW.Save.importJSON(JSON.stringify({ game: 'spinwelten', state: old }));
  assert.strictEqual(mig.helper, ''); assert.strictEqual(mig.snacks, 0);
  const bad = JSON.parse(JSON.stringify(s)); bad.coins = -5; bad.energy = NaN; bad.stages = [9, -1, 'x', 0, 0]; bad.relics = Infinity;
  const fixed = SW.Save.importJSON(JSON.stringify({ game: 'spinwelten', state: bad }));
  assert.strictEqual(fixed.coins, 0); assert.ok(Number.isFinite(fixed.energy)); assert.deepStrictEqual(fixed.stages, [5, 0, 0, 0, 0]); assert.ok(Number.isFinite(fixed.relics));
  // Neues Spiel nach Inselabschluss belohnt nur einmal
  s.stages = [5, 5, 5, 5, 5]; s.damaged = [false, false, false, false, false]; s.island = 30;
  assert.ok(!g.completeIsland().error); assert.ok(s.ended);
  assert.ok(g.completeIsland().error, 'Finale darf nicht doppelt belohnen');
  assert.ok(g.newGamePlus()); assert.strictEqual(s.island, 1); assert.strictEqual(s.ngp, 1); assert.ok(g.base() > 50 * 7);
});

test('Online-Protokoll: Gastgeber prüft Folgenummer, Doppelte, Prüfsumme, Wiederherstellung, Bots', () => {
  const SW = load(); require(path.join(__dirname, '..', 'js', 'net', 'protocol.js'));
  const R = SW.Room; let t = 1e12;
  for (let i = 0; i < 200; i++) assert.ok(R.validCode(R.makeCode(SW.rng.seeded('c' + i))));
  assert.ok(!R.validCode('ABC1O'));
  for (const mode of Object.keys(R.MODES)) {
    const h = new R.Host({ mode, hostId: 'host', hostName: 'Rico', rng: SW.rng.seeded('h' + mode), now: () => t });
    assert.ok(h.join('gast', 'Lena').ok); assert.strictEqual(h.join('gast', 'Lena').rejoin, true);
    const gst = new R.Guest('gast');
    assert.ok(h.start(true).ok); assert.strictEqual(h.st.players.length, 4); assert.ok(h.st.players.filter(p => p.bot).length === 2);
    let rounds = 0;
    while (h.st.phase === 'play' && rounds < 50) {
      const kind = mode === 'duel' ? 'dig' : 'spin';
      const m = gst.nextAction(kind, { i: 2 });
      const r1 = h.action('gast', m); assert.ok(r1.ok, JSON.stringify(r1));
      const r2 = h.action('gast', m); assert.ok(r2.dup, 'gleiche Aktion zweimal');
      assert.strictEqual(h.action('gast', Object.assign({}, m, { aid: 'neueid123' })).error, 'seq', 'alte Folgenummer');
      h.action('host', { aid: 'host' + rounds + 'aaaa', seq: rounds + 1, kind, data: { i: 0 } });
      h.tick();
      assert.strictEqual(gst.receive(h.snapshot()), 'ok');
      const snap = h.snapshot(); snap.st.players[0].score += 1; assert.strictEqual(gst.receive(snap), 'checksum');
      t += 3000; h.pump(); rounds++;
    }
    assert.strictEqual(h.st.phase, 'end', mode + ' endet nicht');
    assert.ok(h.st.result && h.st.result.places.length === 4);
    // Wiederherstellung nach Neuladen
    const h2 = R.Host.restore(h.serialize(), { now: () => t });
    assert.deepStrictEqual(h2.st.result, h.st.result); assert.ok(h2.st.v > h.st.v);
    assert.strictEqual(gst.receive({ v: 0, sum: R.checksum(h.st), st: h.st }), 'old');
  }
  // Belohnung pro Raum-Sitzung nur einmal
  const { g } = game('online');
  assert.ok(g.onlineResult('sess1', 1, 4)); assert.strictEqual(g.onlineResult('sess1', 1, 4), null);
});

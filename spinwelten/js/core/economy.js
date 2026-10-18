/* Spinwelten 3D – Wirtschaft: Formeln und Tabellen (rein rechnerisch, ohne Zustand, in Node testbar).
 * Grundidee (nachvollziehbar): Eine Insel soll im Modus "Klassisch" mit Multiplikator x1 etwa
 *   spinsTarget(w) Spins kosten (Insel 1 = 35 fürs Tutorial, dann 90 + 9·(w−1): Insel 2 ≈ 99, Insel 30 ≈ 351).
 * Die Baukosten werden daraus mit dem EXAKT berechneten Münz-Erwartungswert eines Spins abgeleitet,
 * sodass eine Änderung der Walzengewichte die Kosten automatisch mitzieht (keine Sackgassen). */
(function (SW) {
  'use strict';
  const R = SW.REELS;
  const MAX_COINS = 9e14;      // weit unter Number.MAX_SAFE_INTEGER (9,007e15) – kein Überlauf, keine Exponentenanzeige
  const PROFILES = {
    relaxed:   { id: 'relaxed',   energyMax: 200, regenSec: 20,  costMul: 0.8, dailySpins: 60, attackCooldownMin: 0 },
    classic:   { id: 'classic',   energyMax: 50,  regenSec: 180, costMul: 1.0, dailySpins: 25, attackCooldownMin: 0 },
    challenge: { id: 'challenge', energyMax: 40,  regenSec: 240, costMul: 1.3, dailySpins: 15, attackCooldownMin: 0 }
  };
  const STAGE_W = [0.6, 0.8, 1.0, 1.2, 1.4];   // Anteil je Ausbaustufe (Summe 5)
  const BUILD_W = [0.8, 0.9, 1.0, 1.1, 1.2];   // je Bauwerk 1…5 (Summe 5)
  const clampInt = n => (Number.isFinite(n) ? Math.max(0, Math.min(MAX_COINS, Math.round(n))) : 0);

  const IDS = R.SYMBOLS.map(x => x.id), TOTAL_W = R.OUTCOMES.reduce((a, o) => a + o.w, 0);
  // Ein Spin: Zeile der Ergebnistabelle ziehen, dann die drei sichtbaren Symbole festlegen (alles vor der Animation)
  function roll(rng) {
    const o = rng.weighted(R.OUTCOMES, x => x.w);
    let ids;
    if (o.type === 'three') ids = [o.sym, o.sym, o.sym];
    else if (o.type === 'two') {
      const others = IDS.filter(x => x !== o.sym), odd = others[rng.int(others.length)], pos = rng.int(3);
      ids = [o.sym, o.sym, o.sym]; ids[pos] = odd;
    } else {
      const pool = IDS.slice(); rng.shuffle(pool); ids = pool.slice(0, 3);
    }
    return { outcome: o.type + (o.sym ? ':' + o.sym : ''), ids };
  }
  // Auswertung dreier Symbol-IDs -> { rule: 'three'|'two'|'none', sym, pay }
  function evaluate(ids) {
    const [a, b, c] = ids;
    if (a === b && b === c) return { rule: 'three', sym: a, pay: R.PAY[a].three || {} };
    let pair = null;
    if (a === b || a === c) pair = a; else if (b === c) pair = b;
    if (pair) {
      const two = Object.assign({}, R.PAY[pair].two || {});
      // Drittes Symbol zählt zusätzlich mit seinem Einzelwert (z. B. 2× Sturm + Sonne)
      const odd = pair === a ? (a === b ? c : b) : a;
      const one = R.PAY[odd] && R.PAY[odd].one;
      if (one && one.coins) two.coins = (two.coins || 0) + one.coins;
      return { rule: 'two', sym: pair, pay: two };
    }
    let coins = 0;
    for (const id of ids) { const one = R.PAY[id].one; if (one && one.coins) coins += one.coins; }
    return { rule: 'none', sym: null, pay: coins ? { coins } : {} };
  }

  // Exakter Erwartungswert über die Ergebnistabelle (Münzen in Basis-Einheiten, plus Häufigkeit der Aktionen)
  let EXP = null;
  function expectation() {
    if (EXP) return EXP;
    const e = { coins: 0, attack: 0, raid: 0, shield: 0, spins: 0, chest: 0, relics: 0, event: 0, material: 0, jackpot: 0, xp: 0, ticket: 0 };
    const addEv = (p, ev) => {
      e.coins += p * (ev.coins || 0); e.spins += p * (ev.spins || 0); e.relics += p * (ev.relics || 0);
      e.event += p * (ev.event || 0); e.material += p * (ev.material || 0); e.xp += p * (ev.xp || 0); e.ticket += p * (ev.ticket || 0);
      if (ev.action === 'attack') e.attack += p; if (ev.action === 'raid') e.raid += p;
      if (ev.shield) e.shield += p; if (ev.chest) e.chest += p; if (ev.jackpot) e.jackpot += p;
    };
    for (const o of R.OUTCOMES) {
      const p = o.w / TOTAL_W;
      if (o.type === 'three') addEv(p, evaluate([o.sym, o.sym, o.sym]).pay);
      else if (o.type === 'two') { const others = IDS.filter(x => x !== o.sym); for (const x of others) addEv(p / others.length, evaluate([o.sym, o.sym, x]).pay); }
      else { // drei verschiedene: über alle geordneten Tripel gleichverteilt
        const tr = []; for (const x of IDS) for (const y of IDS) for (const z of IDS) if (x !== y && y !== z && x !== z) tr.push([x, y, z]);
        for (const t of tr) addEv(p / tr.length, evaluate(t).pay);
      }
    }
    e.actionCoins = e.attack * ATTACK.avg + e.raid * RAID.avg;
    e.totalCoins = e.coins + e.actionCoins;
    EXP = e; return e;
  }
  const ATTACK = { hit: 40, blocked: 25, avg: 32 };   // Basis-Vielfache
  const RAID = { avg: 70 };

  // Basis-Münzwert einer Insel (w = 1…30), ngp = Neues-Spiel-Plus-Stufe (×8 je Stufe)
  function base(w, ngp) { return Math.round(50 * Math.pow(1.25, Math.max(0, w - 1)) * Math.pow(8, ngp || 0)); }
  function spinsTarget(w) { return w <= 1 ? 35 : 90 + 9 * (w - 1); }   // Insel 1 kurz (Tutorial), danach 99 … 351
  // Gesamtpreis einer Insel in Münzen
  function islandTotal(w, profile, ngp) {
    const pr = PROFILES[profile] || PROFILES.classic;
    return expectation().totalCoins * base(w, ngp) * spinsTarget(w) * pr.costMul;
  }
  // Kosten, um Bauwerk b (0…4) von Stufe s auf s+1 zu bringen (s = 0…4)
  function buildCost(w, b, s, profile, ngp, discount) {
    const per = islandTotal(w, profile, ngp) / 25;
    const c = per * BUILD_W[b] * STAGE_W[s] * (1 - Math.min(0.3, discount || 0));
    return clampInt(Math.max(10, Math.round(c / 10) * 10));
  }
  function repairCost(w, b, s, profile, ngp) { return clampInt(Math.round(buildCost(w, b, Math.max(0, s - 1), profile, ngp) * 0.35 / 10) * 10); }
  // Belohnung eines Spins (ohne Seiteneffekte). bonus = Begleiter-/Event-Boni
  function spinReward(ev, w, m, ngp, bonus) {
    bonus = bonus || {};
    const b = base(w, ngp), p = ev.pay, r = { coins: 0, xp: 0, material: 0, spins: 0, shield: 0, relics: 0, event: 0, ticket: 0, chest: null, action: null, jackpot: false };
    let coinMul = 1;
    if (ev.sym === 'star' || (ev.rule === 'none')) coinMul += bonus.crystal || 0;
    r.coins = clampInt((p.coins || 0) * b * m * coinMul * (1 + (bonus.coins || 0)));
    r.xp = Math.round((p.xp || 0) * m);
    r.material = (p.material || 0) * Math.min(m, 10);
    r.spins = Math.round((p.spins || 0) * m);
    r.shield = p.shield || 0;
    r.relics = Math.round((p.relics || 0) * m * (1 + (bonus.relics || 0)));
    r.event = Math.round((p.event || 0) * m * (1 + (bonus.event || 0)));
    r.ticket = p.ticket || 0;
    r.chest = p.chest || null;
    r.action = p.action || null;
    r.jackpot = !!p.jackpot;
    return r;
  }
  function attackReward(w, m, blocked, ngp, bonus) {
    return clampInt(base(w, ngp) * m * (blocked ? ATTACK.blocked : ATTACK.hit) * (1 + ((bonus && bonus.storm) || 0)));
  }
  // Raub: 6 Fundstellen, Werte als Basis-Vielfache; Summe gedeckelt durch Vorrat des Ziels
  const RAID_SPOTS = [
    { kind: 'big', coins: 55 }, { kind: 'big', coins: 45 }, { kind: 'mid', coins: 25 },
    { kind: 'mid', coins: 20 }, { kind: 'relic', coins: 8, relics: 15 }, { kind: 'empty', coins: 0 }
  ];
  function raidLootCap(targetCoins, w, m, ngp) { return clampInt(Math.min(targetCoins * 0.2, base(w, ngp) * m * 200)); }

  function multsFor(islandsDone) { return R.MULTS.filter(x => islandsDone >= x.island).map(x => x.m); }
  function add(a, b) { return clampInt((a || 0) + (b || 0)); }
  function sub(a, b) { const v = (a || 0) - (b || 0); return v < 0 ? null : clampInt(v); }   // null = nicht genug

  SW.ECON = { PROFILES, STAGE_W, BUILD_W, MAX_COINS, IDS, TOTAL_W, roll, evaluate, expectation, base, spinsTarget, islandTotal, buildCost, repairCost,
    spinReward, attackReward, ATTACK, RAID, RAID_SPOTS, raidLootCap, multsFor, clampInt, add, sub };
})(globalThis.SW = globalThis.SW || {});

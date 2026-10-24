/* Pestwacht · Diplomatie (Verträge, Krieg, Frieden, Bündnisse, erklärbare Entscheidungen) und Eroberungsregeln. Ohne DOM.
 * Alle Partner sind Computerfraktionen; der Spieler ist 'P'. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const D = PW.Diplo = {};
  const Wd = () => PW.World, A = () => PW.AI, M = () => PW.March;

  D.KINDS = { trade: 'Handelsvertrag', nap: 'Nichtangriffspakt', def: 'Verteidigungspakt', ally: 'Bündnis', peace: 'Frieden', aid: 'Hilfe anfordern', attack: 'Gemeinsamer Angriff', cede: 'Frieden gegen Region' };
  D.key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  D.rel = function (S, a, b) {
    const k = D.key(a, b);
    return S.rel[k] || (S.rel[k] = { rel: 0, trust: 40, war: false, nap: 0, trade: false, def: false, ally: false, truce: 0 });
  };
  D.atWar = function (S, a, b) {
    if (a === b) return false;
    if (a === 'mon' || b === 'mon' || a === 'bandit' || b === 'bandit') return true;
    return !!D.rel(S, a, b).war;
  };
  D.parties = S => ['P'].concat(S.factions.filter(f => f.alive).map(f => f.id));
  D.warsOf = (S, id) => D.parties(S).filter(o => o !== id && D.rel(S, id, o).war);
  D.alliesOf = (S, id) => D.parties(S).filter(o => o !== id && D.rel(S, id, o).ally);
  D.name = (S, id) => M().ownerName(S, id);
  D.status = function (S, a, b) {
    const r = D.rel(S, a, b), f = A().get(S, a === 'P' ? b : a);
    if (r.war) return 'Krieg';
    if (f && f.vassalOf && (f.vassalOf === (a === 'P' ? 'P' : a) || f.vassalOf === b)) return 'Vasall';
    if (r.ally) return 'Bündnis';
    if (r.def) return 'Verteidigungspakt';
    if (r.nap > S.time) return 'Nichtangriffspakt';
    if (r.truce > S.time) return 'Waffenstillstand';
    return r.rel > 30 ? 'Freundlich' : r.rel < -30 ? 'Feindselig' : 'Neutral';
  };

  function mem(S, a, b, type, w) {
    const f = A().get(S, b); if (!f) return;
    f.mem.push({ t: Math.floor(S.time), who: a, type, w });
    if (f.mem.length > 30) f.mem.splice(0, f.mem.length - 30);
  }
  D.memScore = function (S, f, who) {
    let s = 0; f.mem.forEach(m => { if (m.who === who) s += m.w * Math.max(0.1, 1 - (S.time - m.t) / 2400); }); return s;
  };
  D.event = function (S, a, b, type, amount) {
    if (!a || !b || a === b || a === 'mon' || b === 'mon' || a === 'bandit' || b === 'bandit') return;
    const r = D.rel(S, a, b);
    const E = { angriff: [-12, -8, -3], kampf: [-4, -2, -1], hilfe: [12, 10, 3], handel: [2, 1, 0.5], geschenk: [0, 0, 0], bruch: [-30, -40, -4], abgelehnt: [-2, 0, -0.5], vertrag: [6, 5, 1] }[type];
    if (!E) return;
    let dr = E[0], dt = E[1];
    if (type === 'geschenk') { dr = Math.min(20, amount / 25); dt = Math.min(10, amount / 50); }
    r.rel = PW.clamp(r.rel + dr, -100, 100); r.trust = PW.clamp(r.trust + dt, 0, 100);
    mem(S, a, b, type, E[2] || dr / 5); mem(S, b, a, type, E[2] || dr / 5);
  };

  D.declareWar = function (S, a, b, why) {
    const r = D.rel(S, a, b); if (r.war) return false;
    const broke = r.ally || r.def || r.nap > S.time;
    r.war = true; r.ally = false; r.def = false; r.nap = 0; r.trade = false; r.truce = 0;
    if (broke) {
      D.event(S, a, b, 'bruch');
      D.parties(S).forEach(o => { if (o !== a && o !== b) { const x = D.rel(S, a, o); x.trust = Math.max(0, x.trust - 8); } });   // Vertragsbruch spricht sich herum
    } else D.event(S, a, b, 'angriff');
    PW.log(S, '⚔️ ' + D.name(S, a) + ' erklärt ' + D.name(S, b) + ' den Krieg' + (why ? ' (' + why + ')' : '') + (broke ? ' – ein Vertragsbruch!' : ''), a === 'P' || b === 'P' ? 'warn' : 'diplo');
    // Verteidigungspakte von b
    D.alliesOrPact(S, b).forEach(o => {
      if (o === a || D.rel(S, o, a).war) return;
      const t = D.rel(S, o, b).trust;
      if (o === 'P') { PW.log(S, '📜 Dein Pakt mit ' + D.name(S, b) + ': ' + D.name(S, a) + ' greift deinen Partner an. Du kannst in der Diplomatie den Krieg erklären.', 'diplo'); return; }
      if (t >= 45) { D.rel(S, o, a).war = true; D.rel(S, o, a).truce = 0; PW.log(S, '🛡️ ' + D.name(S, o) + ' hält den Pakt und tritt gegen ' + D.name(S, a) + ' in den Krieg ein', a === 'P' ? 'warn' : 'diplo'); }
      else PW.log(S, '💬 ' + D.name(S, o) + ' lässt ' + D.name(S, b) + ' im Stich (zu wenig Vertrauen)', 'diplo');
    });
    const fa = A().get(S, a); if (fa) fa.st.wars = (fa.st.wars || 0) + 1;
    return true;
  };
  D.alliesOrPact = (S, id) => D.parties(S).filter(o => o !== id && (D.rel(S, id, o).ally || D.rel(S, id, o).def));
  D.makePeace = function (S, a, b, why) {
    const r = D.rel(S, a, b); if (!r.war) return false;
    r.war = false; r.truce = S.time + 600;
    [a, b].forEach(x => { const f = A().get(S, x); if (f) f.weary = Math.max(0, f.weary - 30); });
    if (a === 'P' || b === 'P') PW.stat(S, 'peaces');
    // Märsche gegeneinander kehren um
    S.marches.forEach(m => { if ((m.owner === a && S.world.tiles[m.target].own === b) || (m.owner === b && S.world.tiles[m.target].own === a)) if (m.state === 'go' && (m.mission === 'attack' || m.mission === 'occupy')) M().goHome(S, m); });
    PW.log(S, '🕊️ Frieden zwischen ' + D.name(S, a) + ' und ' + D.name(S, b) + (why ? ' (' + why + ')' : ''), 'diplo');
    return true;
  };
  D.sign = function (S, a, b, kind) {
    const r = D.rel(S, a, b);
    if (kind === 'trade') r.trade = true;
    else if (kind === 'nap') r.nap = S.time + 1500;
    else if (kind === 'def') r.def = true;
    else if (kind === 'ally') { r.ally = true; r.def = true; r.trade = true; if (a === 'P' || b === 'P') PW.stat(S, 'alliances'); }
    else if (kind === 'peace') return D.makePeace(S, a, b);
    D.event(S, a, b, 'vertrag');
    PW.log(S, '📜 ' + D.KINDS[kind] + ': ' + D.name(S, a) + ' und ' + D.name(S, b), 'diplo');
    return true;
  };
  D.cancel = function (S, a, b, kind) {
    const r = D.rel(S, a, b);
    if (kind === 'ally') { if (!r.ally) return false; r.ally = false; r.def = false; }
    else if (kind === 'def') { if (!r.def) return false; r.def = false; }
    else if (kind === 'trade') { if (!r.trade) return false; r.trade = false; }
    else if (kind === 'nap') { if (!(r.nap > S.time)) return false; r.nap = 0; D.event(S, a, b, 'bruch'); }
    D.event(S, a, b, 'abgelehnt');
    PW.log(S, '✂️ ' + D.KINDS[kind] + ' aufgelöst: ' + D.name(S, a) + ' / ' + D.name(S, b), 'diplo');
    return true;
  };

  // ---------- Erklärbare Bewertung eines Vorschlags aus Sicht der Fraktion `to` ----------
  function powerOf(S, id) { if (id === 'P') return PW.Battle.power(S.troops, null, PW.Heroes.list(S).map(h => PW.Heroes.stats(S, h)), S._mods) + PW.City.gateMax(S) * 0.2; const f = A().get(S, id); return f ? A().totalPower(S, f) : 0; }
  D.powerOf = powerOf;
  function border(S, a, b) {
    let n = 0; Wd().tilesOf(S, a).forEach(i => { if (Wd().neighbors(S.world, i).some(x => S.world.tiles[x].own === b)) n++; }); return n;
  }
  D.evaluate = function (S, from, to, kind, extra) {
    const f = A().get(S, to); if (!f || !f.alive) return { ok: false, score: -99, reasons: [['Fraktion existiert nicht mehr', -99]] };
    const w = PW.ARCHETYPES[f.arch].w, r = D.rel(S, from, to), reasons = [];
    const add = (t, v) => { v = Math.round(v * 10) / 10; if (v) reasons.push([t, v]); return v; };
    let s = 0;
    s += add('Beziehung', r.rel / 12);
    s += add('Vertrauen', (r.trust - 40) / 12);
    s += add('Erinnerung an frühere Taten', D.memScore(S, f, from) / 3);
    const pf = powerOf(S, from), pt = A().totalPower(S, f), ratio = pf / Math.max(1, pt);
    const shared = D.warsOf(S, to).filter(x => D.warsOf(S, from).includes(x)).length;
    if (shared) s += add('Gemeinsame Feinde', 2 * shared);
    const thr = { trade: 0.5, nap: 1.5, def: 3, ally: 4, peace: 1.2, aid: 2.5, attack: 3, cede: 1 }[kind] || 2;
    switch (kind) {
      case 'trade': s += add('Handelsinteresse (' + PW.ARCHETYPES[f.arch].name + ')', (w.trade - 1) * 3); if (r.war) s += add('Krieg', -20); break;
      case 'nap': s += add('Friedliebend', (w.dipl - w.aggr) * 1.5); s += add('Machtverhältnis', ratio > 1.3 ? 1.5 : ratio < 0.6 ? -1 : 0); if (w.aggr > 1.3) s += add('Eroberungsdrang', -1.5); break;
      case 'def': case 'ally':
        s += add('Bündnisbereitschaft', (w.dipl - 1) * 2.5 + (w.def - 1));
        s += add('Stärke des Partners', PW.clamp(ratio - 0.6, -1.5, 2));
        if (border(S, from, to) > 2 && w.expand > 1.2) s += add('Grenzstreit', -2);
        if (r.war) s += add('Krieg', -30);
        if (from === 'P' && PW.City.lv(S, 'diplomatie') < (kind === 'ally' ? 2 : 1)) s += add('Deine Diplomatiehalle ist zu klein', -30);
        break;
      case 'peace': case 'cede':
        if (!r.war) return { ok: false, score: 0, reasons: [['Kein Krieg', 0]] };
        s += add('Kriegsmüdigkeit', f.weary / 12);
        s += add('Kriegslage', ratio > 1 ? (ratio - 1) * 3 : -(1 / Math.max(0.1, ratio) - 1) * 1.5);
        s += add('Kampfeslust', (1 - w.aggr) * 2);
        if (kind === 'cede') s += add('Gebiet abtreten', -2);
        break;
      case 'aid': {
        if (!r.ally) return { ok: false, score: -9, reasons: [['Kein Bündnis', -9]] };
        const dist = Wd().dist(S.world, f.cap, M().capOf(S, from));
        s += add('Entfernung', -dist / 5);
        if (A().threats(S, f).length) s += add('Eigene Lage bedroht', -4);
        s += add('Truppenstärke', A().power(f) > 400 ? 1 : -1);
        s += add('Bündnistreue', w.honor);
        break;
      }
      case 'attack': {
        if (!r.ally) return { ok: false, score: -9, reasons: [['Kein Bündnis', -9]] };
        const tgt = extra && extra.target; const own = tgt != null ? S.world.tiles[tgt].own : null;
        if (!own || own === to) return { ok: false, score: -9, reasons: [['Ungültiges Ziel', -9]] };
        if (D.rel(S, to, own).ally) return { ok: false, score: -9, reasons: [['Verbündet mit dem Ziel', -9]] };
        s += add('Kriegslust', (w.aggr - 0.8) * 2);
        s += add('Entfernung zum Ziel', -Wd().dist(S.world, f.cap, tgt) / 4);
        s += add('Beziehung zum Ziel', -D.rel(S, to, own).rel / 20);
        if (A().threats(S, f).length) s += add('Eigene Lage bedroht', -4);
        break;
      }
    }
    return { ok: s >= thr, score: Math.round(s * 10) / 10, need: thr, reasons };
  };

  // Spieler (oder Bot) macht einen Vorschlag. Ergebnis mit Begründung.
  D.propose = function (S, from, to, kind, extra) {
    if (to === 'P') {
      if (S.offers.some(o => o.from === from && o.kind === kind)) return { ok: false };
      S.offers.push({ id: ++S.marchUid, from, kind, until: S.time + 150, extra: extra || null });
      PW.log(S, '✉️ ' + D.name(S, from) + ' bietet dir an: ' + D.KINDS[kind], 'diplo', { offer: 1 });
      return { ok: true, pending: true };
    }
    const ev = D.evaluate(S, from, to, kind, extra);
    if (ev.ok) {
      if (kind === 'aid') { const f = A().get(S, to), units = A().pickArmy(f, A().power(f) * 0.35, 0.45); if (!units) { ev.ok = false; ev.reasons.push(['Keine Truppen frei', -9]); } else { const a = M().create(S, { owner: to, units, target: M().capOf(S, from), mission: 'aid', info: { ally: from } }); if (a) { PW.UNIT_IDS.forEach(k => { f.troops[k] -= units[k] || 0; }); PW.log(S, '🤝 ' + f.name + ' schickt Hilfe', 'diplo'); } } }
      else if (kind === 'attack') {
        const f = A().get(S, to), tgt = extra.target, own = S.world.tiles[tgt].own;
        if (!D.atWar(S, to, own)) D.declareWar(S, to, own, 'auf Bitte von ' + D.name(S, from));
        const units = A().pickArmy(f, A().power(f) * 0.6, 0.3);
        if (units) { const a = M().create(S, { owner: to, units, target: tgt, mission: 'attack' }); if (a) PW.UNIT_IDS.forEach(k => { f.troops[k] -= units[k] || 0; }); }
        PW.log(S, '⚔️ ' + f.name + ' greift auf deine Bitte ' + Wd().regionName(S, tgt) + ' an', 'diplo');
      } else if (kind === 'cede') {
        const t = extra && extra.tile;
        if (t != null && S.world.tiles[t].own === to && t !== A().get(S, to).cap) { PW.Conquest.transfer(S, t, from, 'abgetreten'); }
        D.makePeace(S, from, to, 'mit Gebietsabtretung');
      } else D.sign(S, from, to, kind);
    } else D.event(S, from, to, 'abgelehnt');
    if (from === 'P') PW.log(S, (ev.ok ? '✅ ' : '❌ ') + D.name(S, to) + (ev.ok ? ' nimmt an: ' : ' lehnt ab: ') + D.KINDS[kind], 'diplo');
    return ev;
  };
  D.answerOffer = function (S, id, yes) {
    const k = S.offers.findIndex(o => o.id === id); if (k < 0) return false;
    const o = S.offers.splice(k, 1)[0];
    if (yes) { if (o.kind === 'peace') D.makePeace(S, o.from, 'P'); else D.sign(S, o.from, 'P', o.kind); }
    else { D.event(S, 'P', o.from, 'abgelehnt'); PW.log(S, 'Du lehnst ab: ' + D.KINDS[o.kind] + ' von ' + D.name(S, o.from), 'diplo'); }
    return true;
  };
  D.gift = function (S, to, coins) {
    coins = Math.floor(coins); if (coins <= 0 || S.res.coin < coins) return { ok: false, why: 'Zu wenig Münzen' };
    const f = A().get(S, to); if (!f || !f.alive) return { ok: false, why: 'Unbekannt' };
    S.res.coin -= coins; f.res.coin = (f.res.coin || 0) + coins; f.ledger.made.coin = (f.ledger.made.coin || 0) + coins;
    D.event(S, 'P', to, 'geschenk', coins);
    PW.log(S, '🎁 Geschenk an ' + f.name + ': ' + coins + ' Münzen', 'diplo');
    return { ok: true };
  };
  D.callAllies = function (S, id, attackMarch) {
    if (attackMarch._called) return; attackMarch._called = 1;
    D.alliesOrPact(S, id).forEach(o => {
      if (o === 'P' || D.atWar(S, o, attackMarch.owner)) return;
      if (D.rel(S, o, id).trust >= 50 && !D.rel(S, o, attackMarch.owner).ally) D.declareWar(S, o, attackMarch.owner, 'Beistand für ' + D.name(S, id));
    });
  };

  // ---------- Diplomatie-KI einer Fraktion ----------
  D.think = function (S, f) {
    const w = PW.ARCHETYPES[f.arch].w, diff = PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal, wars = D.warsOf(S, f.id);
    f.weary = PW.clamp(f.weary + (wars.length ? 2 * wars.length : -3), 0, 100);
    if (f.vassalOf) { // Vasall: Aufstand, wenn der Herr schwach geworden ist
      const lord = f.vassalOf, lp = powerOf(S, lord), mp = A().totalPower(S, f);
      if (mp > lp * 1.2 && D.rel(S, f.id, lord).rel < 0) { f.vassalOf = null; D.rel(S, f.id, lord).ally = false; D.declareWar(S, f.id, lord, 'Aufstand gegen den Lehnsherrn'); }
      return;
    }
    const others = D.parties(S).filter(o => o !== f.id && !(A().get(S, o) && A().get(S, o).vassalOf === f.id));
    let acted = false;
    // Frieden suchen
    wars.forEach(o => {
      if (acted) return;
      const ratio = A().totalPower(S, f) / Math.max(1, powerOf(S, o));
      if (f.weary > 45 || ratio < 0.55) {
        acted = true;
        if (o === 'P') D.propose(S, f.id, 'P', 'peace');
        else { const ev = D.evaluate(S, f.id, o, 'peace'); if (ev.ok) D.makePeace(S, f.id, o, 'Kriegsmüdigkeit'); }
      }
    });
    if (acted) return;
    // Krieg erklären
    if (wars.length < 2 && f.weary < 25) {
      let best = null;
      others.forEach(o => {
        const r = D.rel(S, f.id, o); if (r.war || r.ally || r.truce > S.time) return;
        const dist = Wd().dist(S.world, f.cap, M().capOf(S, o)); if (dist > 10) return;
        const ratio = A().totalPower(S, f) / Math.max(1, powerOf(S, o));
        let u = w.aggr * Math.min(2.5, ratio) * 0.9 - r.rel / 35 - (r.nap > S.time || r.def ? w.honor * 1.6 : 0) - wars.length * 0.8 - dist / 12;
        if (w.opp && D.warsOf(S, o).length) u += 0.9;                    // Opportunist: nutzt Schwäche
        if (border(S, f.id, o) > 0 && w.expand > 1.2) u += 0.4;
        if (o === 'P') { u *= diff.aggrPlayer; if (S.time < 900) u -= 2; }   // Schonfrist zu Spielbeginn
        u *= 1 + (PW.rand(S) - 0.5) * diff.noise;
        if (!best || u > best.u) best = { o, u };
      });
      if (best && best.u > 1.25) { D.declareWar(S, f.id, best.o, best.u > 2 ? 'Machtanspruch' : 'Grenzstreit'); return; }
    }
    // Verträge anbieten (höchstens einer je Überlegung)
    if (PW.rand(S) < 0.5 * w.dipl) {
      const o = PW.pick(S, others); if (!o) return;
      const r = D.rel(S, f.id, o); if (r.war) return;
      const kind = !r.trade && r.rel > 15 ? 'trade' : !(r.nap > S.time) && r.rel > 30 ? 'nap' : !r.ally && r.rel > 55 && r.trust > 55 ? 'ally' : null;
      if (!kind) return;
      if (o === 'P') { D.propose(S, f.id, 'P', kind); return; }
      const ev = D.evaluate(S, f.id, o, kind); if (ev.ok) D.sign(S, f.id, o, kind);
    }
    // Bündnisse zerbrechen bei Streit
    D.alliesOf(S, f.id).forEach(o => { if (o !== 'P' && D.rel(S, f.id, o).rel < -15) D.cancel(S, f.id, o, 'ally'); });
  };
  // Langsames Annähern der Beziehungen (alle 30 s)
  D.drift = function (S) {
    Object.keys(S.rel).forEach(k => {
      const r = S.rel[k], [a, b] = k.split('|');
      let d = -r.rel * 0.01;
      if (r.trade) d += 0.6; if (r.ally) d += 0.8; if (r.war) d -= 1;
      if (r.nap && r.nap < S.time) r.nap = 0;
      const fa = A().get(S, a), fb = A().get(S, b);
      if ((fa && !fa.alive) || (fb && !fb.alive)) return;
      if (fa && fb && D.warsOf(S, a).some(x => D.warsOf(S, b).includes(x))) d += 0.4;
      r.rel = PW.clamp(r.rel + d, -100, 100);
      r.trust = PW.clamp(r.trust + (r.war ? -0.3 : 0.15), 0, 100);
    });
    S.offers = S.offers.filter(o => o.until > S.time);
  };
  // Bündnisblöcke (zusammenhängende Bündnisse); Änderungen werden gemeldet
  D.blocs = function (S) {
    const ids = D.parties(S), seen = new Set(), out = [];
    ids.forEach(id => {
      if (seen.has(id)) return;
      const comp = [], st = [id]; seen.add(id);
      while (st.length) { const x = st.pop(); comp.push(x); D.alliesOf(S, x).forEach(y => { if (!seen.has(y)) { seen.add(y); st.push(y); } }); }
      if (comp.length > 1) out.push(comp.sort());
    });
    return out;
  };
  D.trackBlocs = function (S) {
    const now = D.blocs(S).map(b => b.join('+')), before = S.blocs || [];
    now.forEach(b => { if (!before.includes(b)) { const old = before.filter(x => x.split('+').some(m => b.split('+').includes(m))); PW.log(S, (old.length > 1 ? '🔗 Bündnisse verschmelzen: ' : '🤝 Bündnisblock: ') + b.split('+').map(x => D.name(S, x)).join(', '), 'diplo'); } });
    before.forEach(b => { if (!now.includes(b) && !now.some(x => x.split('+').length >= b.split('+').length && b.split('+').every(m => x.split('+').includes(m)))) PW.log(S, '💔 Bündnisblock zerbrochen: ' + b.split('+').map(x => D.name(S, x)).join(', '), 'diplo'); });
    S.blocs = now;
  };

  // ---------- Eroberung ----------
  const C2 = PW.Conquest = {};
  C2.transfer = function (S, tile, to, why) {
    const t = S.world.tiles[tile], from = t.own; t.own = to;
    const s = Wd().siteAt(S, tile); if (s) s.owner = to;
    if (to === 'P') { S.stats.maxTiles = Math.max(S.stats.maxTiles || 0, Wd().tilesOf(S, 'P').length); Wd().reveal(S, tile, 1); }
    return from;
  };
  C2.capture = function (S, a, tile, d) {
    const t = S.world.tiles[tile], s = Wd().siteAt(S, tile), prev = t.own;
    let txt = '';
    if (a.owner === 'P' && s && s.story) S.storyFlags[s.story] = 1;
    // verschollener Held in einer Ruine: auch, wenn ein Bot sie vorher geräumt hat
    const heroHere = a.owner === 'P' && s && s.type === 'ruin' && s.hero && !S.heroes[s.hero] ? s.hero : null;
    if (heroHere) { PW.Heroes.unlock(S, heroHere, 'in einer Ruine gefunden'); s.hero = null; }
    // neutrale Orte säubern
    if (s && s.gar && !s.cleared && !prev) {
      s.cleared = true;
      const rew = {};
      if (s.type === 'ruin') { rew.coin = 80 + 40 * s.lvl; rew.iron = 30 * s.lvl; rew.know = 30 * s.lvl; txt = 'Ruine geplündert'; }
      else if (s.type === 'lair' || s.type === 'boss') {
        Wd().within(S.world, tile, 2).forEach(i => { S.world.tiles[i].pl = Math.max(0, S.world.tiles[i].pl - 0.3); });
        rew.herb = 60; rew.know = 50 * s.lvl; rew.coin = 60;
        txt = s.type === 'boss' ? 'Weltboss besiegt – die Region atmet auf' : 'Seuchennest ausgeräuchert';
        if (a.owner === 'P') { PW.stat(S, 'lairs'); if (s.type === 'boss') PW.stat(S, 'bosses'); }
      } else { rew.coin = 30 * s.lvl; txt = 'Plünderer vertrieben'; }
      if (a.owner === 'P') {
        a.gain = Object.assign(a.gain || {}, rew);
      } else { const f = A().get(S, a.owner); if (f) for (const k in rew) { f.res[k] = (f.res[k] || 0) + rew[k]; f.ledger.made[k] = (f.ledger.made[k] || 0) + rew[k]; } }
      s.gar = null;
      if (a.mission !== 'occupy' || s.type === 'boss') return txt;
    }
    if (prev && prev !== a.owner && M().capOf(S, prev) === tile) return C2.takeCapital(S, a, tile, prev);
    if (prev === a.owner) return txt;
    C2.transfer(S, tile, a.owner);
    // Besatzung bleibt zurück
    const gar = {}; let n = 0;
    PW.UNIT_IDS.forEach(k => { const g = Math.floor((a.units[k] || 0) * 0.3); if (g) { gar[k] = g; a.units[k] -= g; n += g; } });
    if (!n && a.units.spear) { gar.spear = 1; a.units.spear--; }
    t.gar = { units: gar };
    if (a.owner === 'P') PW.stat(S, 'occupied');
    else { const f = A().get(S, a.owner); if (f) f.st.won++; }
    if (prev) { const pf = A().get(S, prev); if (pf) pf.st.lost++; }
    return (txt ? txt + ' · ' : '') + (prev ? 'Region erobert von ' + D.name(S, prev) : 'Region besetzt') + ': ' + Wd().regionName(S, tile);
  };
  C2.takeCapital = function (S, a, tile, prev) {
    if (prev === 'P') return C2.plunderPlayer(S, a.owner);
    const f = A().get(S, prev); if (!f) return '';
    const s = Wd().siteAt(S, tile);
    C2.transfer(S, tile, a.owner);
    if (s) { s.owner = a.owner; s.fallen = f.id; }
    const gar = {}; PW.UNIT_IDS.forEach(k => { const g = Math.floor((a.units[k] || 0) * 0.4); if (g) { gar[k] = g; a.units[k] -= g; } });
    S.world.tiles[tile].gar = { units: gar };
    if (a.owner === 'P') PW.stat(S, 'capitals');
    // neue Hauptstadt oder Zerfall
    const rest = A().tiles(S, f).sort((x, y) => A().value(S, y) - A().value(S, x));
    if (!rest.length) return C2.collapse(S, f, a.owner);
    f.cap = rest[0];
    PW.UNIT_IDS.forEach(k => { f.troops[k] = Math.floor((f.troops[k] || 0) * 0.5); });
    Object.keys(f.bld).forEach(k => { if (k !== 'hq') f.bld[k] = Math.floor(f.bld[k] * 0.6); });
    f.bld.hq = Math.max(1, (f.bld.hq || 1) - 1);
    for (const k in f.res) { const loot = Math.floor(f.res[k] * 0.4); f.res[k] -= loot; if (a.owner === 'P') { a.gain = a.gain || {}; a.gain[k] = (a.gain[k] || 0) + loot; } else { const g = A().get(S, a.owner); if (g) { g.res[k] = (g.res[k] || 0) + loot; } } }
    const lord = a.owner === 'P' ? 'P' : a.owner, lf = A().get(S, lord), aggressive = !lf || PW.ARCHETYPES[lf.arch].w.aggr >= 1;
    if (aggressive) C2.vassalize(S, f, lord, 'nach dem Fall der Hauptstadt');
    else { D.makePeace(S, lord, f.id, 'nach dem Fall der Hauptstadt'); }
    return 'Hauptstadt von ' + f.name + ' gefallen! Neuer Sitz: ' + Wd().regionName(S, f.cap);
  };
  C2.vassalize = function (S, f, lord, why) {
    f.vassalOf = lord;
    const r = D.rel(S, f.id, lord); r.war = false; r.ally = true; r.def = true; r.trade = true; r.truce = S.time + 900;
    D.warsOf(S, f.id).forEach(o => { if (D.rel(S, lord, o).war === false) D.makePeace(S, f.id, o, 'als Vasall'); });
    PW.log(S, '👑 ' + f.name + ' wird Vasall von ' + D.name(S, lord) + (why ? ' (' + why + ')' : '') + ' und zahlt Tribut', lord === 'P' ? 'gut' : 'diplo');
  };
  C2.collapse = function (S, f, by) {
    f.alive = false; f.troops = {}; f.vassalOf = null;
    S.marches.slice().forEach(m => { if (m.owner === f.id) M().disband(S, m); });
    S.stationed = S.stationed.filter(x => x.owner !== f.id);
    Object.keys(S.rel).forEach(k => { if (k.split('|').includes(f.id)) { const r = S.rel[k]; r.war = false; r.ally = false; r.def = false; r.trade = false; } });
    PW.log(S, '🏚️ ' + f.name + ' ist zerfallen – ' + D.name(S, by) + ' hat die letzte Bastion genommen', by === 'P' ? 'gut' : 'warn');
    return f.name + ' ist zerfallen';
  };
  // Bot nimmt die Zuflucht des Spielers ein: Plünderung, Schaden, erzwungener Waffenstillstand (kein Spielende)
  C2.plunderPlayer = function (S, by) {
    const f = A().get(S, by), loot = {};
    PW.RES.forEach(k => { if (k === 'know') return; const n = Math.floor(S.res[k] * 0.3); if (n > 0) { S.res[k] -= n; loot[k] = n; if (f) { f.res[k] = (f.res[k] || 0) + n; f.ledger.made[k] = (f.ledger.made[k] || 0) + n; } } });
    S.city.b.forEach(b => { if (b.lv > 0) b.hp = Math.max(1, Math.round(b.hp * 0.7)); });
    S.city.gate = 0;
    D.makePeace(S, by, 'P', 'erzwungen nach der Plünderung');
    PW.stat(S, 'plundered');
    PW.log(S, '🔥 ' + D.name(S, by) + ' hat die Zuflucht geplündert! Verloren: ' + PW.costText(loot) + '. Gebäude beschädigt – repariere sie im Stadtmenü.', 'warn');
    return 'Zuflucht geplündert';
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);

/* Pestwacht · Fachfenster: Freies Spiel einrichten, Bauen, Gebäudeinfo, Zuflucht/Wirtschaft/Markt, Gesundheit, Militär, Helden,
 * Forschung, Weltkarte & Expeditionen, Diplomatie, Aufgaben/Erfolge, Chronik, Kampfberichte und die beobachtete Schlacht. */
(function (root) {
  'use strict';
  const PW = root.PW, U = PW.UI, P = U.P, A = U.A, CH = U.CH, esc = U.esc, fmt = U.fmt, T = U.T, btn = U.btn, cost = U.cost, bar = U.bar;
  const C = PW.City, E = PW.Econ, H = PW.Heroes, M = PW.March, D = PW.Diplo;
  const S_ = () => U.S;
  const tabs = (list, cur, act) => '<div class="tabs">' + list.map(([id, l]) => btn(act, l, { cls: cur === id ? 'on' : '', d: { t: id } })).join('') + '</div>';
  const setTab = id => d => { const e = U.find(id); if (e) { e.tab = d.t; U.draw(e); } };
  const kv = rows => '<div class="kv">' + rows.filter(Boolean).map(([k, v]) => '<b>' + k + '</b><span>' + v + '</span>').join('') + '</div>';
  const perMin = v => (v >= 0 ? '+' : '') + (Math.abs(v) < 10 ? (Math.round(v * 10) / 10).toString().replace('.', ',') : Math.round(v)) + '/min';

  // ================= Freies Spiel einrichten =================
  U.setupCfg = null;
  P.setup = function () {
    const c = U.setupCfg || (U.setupCfg = PW.Game.defaultCfg());
    const sel = (k, label, opts) => '<label class="f">' + label + '<select data-ch="setup" data-k="' + k + '">' + opts.map(([v, l]) => '<option value="' + v + '"' + (String(c[k]) === String(v) ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>';
    U.modal('setup', '🗺️ Freies Spiel', () => ({ body: '<div class="grid">' +
      '<label class="f">Name deiner Zuflucht<input type="text" maxlength="28" value="' + esc(c.playerName) + '" data-ch="setup" data-k="playerName" data-key="pn"></label>' +
      '<label class="f">Startwert der Welt (gleich = gleiche Karte)<input type="text" maxlength="20" value="' + esc(c.seed) + '" data-ch="setup" data-k="seed" data-key="sd"></label>' +
      sel('size', 'Kartengröße', [['klein', 'Klein (16×12)'], ['mittel', 'Mittel (22×16)'], ['gross', 'Groß (28×20)']]) +
      sel('bots', 'Computerfraktionen', [2, 3, 4, 5, 6, 7, 8].map(n => [n, n + ' Fraktionen'])) +
      sel('biome', 'Landschaft', [['ausgewogen', 'Ausgewogen'], ['waldig', 'Waldreich'], ['bergig', 'Bergig'], ['sumpfig', 'Sumpfig (mehr Seuche)']]) +
      sel('start', 'Startvorräte', [['karg', 'Karg'], ['normal', 'Normal'], ['reich', 'Reich']]) +
      sel('diff', 'Schwierigkeit der Computergegner', Object.keys(PW.DIFFICULTY).map(k => [k, PW.DIFFICULTY[k].name])) +
      sel('disasters', 'Ereignisse & Katastrophen', [['selten', 'Selten'], ['normal', 'Normal'], ['haeufig', 'Häufig']]) +
      sel('victory', 'Siegbedingung', Object.keys(PW.Game.VICTORY).map(k => [k, PW.Game.VICTORY[k]])) +
      '</div><div class="col" style="margin-top:8px">' +
      '<label class="check"><input type="checkbox" data-ch="setup" data-k="waves" ' + (c.waves !== false ? 'checked' : '') + '> Seuchenwellen greifen die Zuflucht an</label>' +
      '<label class="check"><input type="checkbox" data-ch="setup" data-k="seasons" ' + (c.seasons !== false ? 'checked' : '') + '> Jahreszeitliche Feste (aus dem Gerätekalender)</label></div>' +
      '<p class="small muted">Schwierigkeit: Höhere Stufen denken schneller, schätzen dich genauer ein und schicken stärkere Wellen. Die Fraktionen nutzen immer dieselben Regeln und Kosten wie du – sie schummeln nicht.</p>',
      foot: btn('close', 'Abbrechen', { d: { id: 'setup' } }) + btn('seedrnd', '🎲 Neuer Startwert') + btn('freego', '▶ Spiel starten', { cls: 'primary' }) }), { live: false });
  };
  CH.setup = (v, el) => { const c = U.setupCfg, k = el.dataset.k; c[k] = el.type === 'checkbox' ? el.checked : k === 'bots' ? +v : v; };
  A.seedrnd = () => { U.setupCfg.seed = String(Math.floor(Math.random() * 1e9)); U.redrawId('setup'); };
  A.freego = () => {
    const go = () => { const c = Object.assign({}, U.setupCfg, { mode: 'free' }); c.playerName = (c.playerName || '').trim() || 'Deine Zuflucht'; c.seed = (String(c.seed).trim() || String(Date.now() % 1e9)); U.closeModal(); U.slot = 'auto'; U.start(PW.Game.newGame(c)); U.save(true); };
    if (PW.Save.index().auto) U.confirm('Neues Spiel', 'Der automatische Spielstand wird überschrieben. Sichere ihn vorher unter „Spielstände“, wenn du ihn behalten willst.', 'Neu beginnen', go); else go();
  };

  // ================= Bauen =================
  P.build = function (cat, hl) {
    U.modal('build', '🔨 Bauen', ent => {
      const S = S_(), cur = ent.tab || cat || 'versorgung', hq = C.hqLv(S);
      let b = tabs(PW.BLD_CATS.map(c => [c.id, c.icon + ' ' + c.name]), cur, 'btab');
      b += '<p class="small muted">Bautrupps: ' + C.busy(S) + '/' + C.builders(S) + ' beschäftigt · Ratshaus Stufe ' + hq + '</p><div class="grid">';
      PW.BUILDINGS.filter(d => d.cat === cur).forEach(d => {
        const why = d.id === 'hq' || d.id === 'mauer' ? (C.count(S, d.id) ? 'Bereits vorhanden – antippen und verbessern' : null) : C.canBuild(S, d.id), n = C.count(S, d.id), lim = C.limit(d.id, hq);
        const prod = d.prod ? Object.keys(d.prod).map(k => PW.RES_INFO[k].icon + '+' + d.prod[k]).join(' ') + '/min' : '';
        b += '<div class="card' + (why ? ' locked' : '') + (hl === d.id ? ' sel hint-pulse' : '') + '"><h3><span class="ico">' + d.icon + '</span>' + esc(d.name) + '</h3><div class="small muted">' + esc(d.desc) + '</div>' +
          '<div class="row small">' + cost(PW.costOf(d.id, 1)) + '<span class="chip">⏱ ' + T(C.buildTime(S, d.id, 1)) + '</span>' + (d.w ? '<span class="chip">▦ ' + d.w + '×' + d.h + '</span>' : '') + (lim < 99 ? '<span class="chip">' + n + '/' + lim + '</span>' : '') + (prod ? '<span class="chip">' + prod + '</span>' : '') + (PW.workersOf(d.id, 1) ? '<span class="chip">👷 ' + PW.workersOf(d.id, 1) + '</span>' : '') + '</div>' +
          U.why(why) + (d.w && !(d.id === 'hq') ? btn('bpick', 'Platzieren', { cls: 'small' + (why ? '' : ' primary'), dis: why, d: { t: d.id } }) : '') + '</div>';
      });
      return b + '</div>';
    });
  };
  A.btab = setTab('build');
  A.bpick = d => U.startPlace(d.t);

  // ================= Gebäude (Seitenfenster) =================
  P.bldSide = function (uid) {
    const S = S_(), b = C.get(S, uid); if (!b) return null;
    const d = PW.BLD[b.t], mx = C.maxHp(b), work = PW.workersOf(b.t, b.lv || 1);
    const title = d.icon + ' ' + esc(d.name) + (b.lv ? ' <span class="chip">Stufe ' + b.lv + '/' + d.max + '</span>' : '');
    let h = '<div class="small muted">' + esc(d.desc) + '</div>';
    if (b.st !== 'ok') h += '<div>' + (b.st === 'bau' ? '🏗️ Im Bau' : b.st === 'upg' ? '⬆️ Wird verbessert auf Stufe ' + (b.lv + 1) : '🔧 Wird repariert') + ' · noch ' + T(b.rem) + '</div>' + bar(b.tot ? 1 - b.rem / b.tot : 0, 'good') + btn('bcancel', '✕ Abbrechen (volle Rückerstattung)', { cls: 'small', d: { uid } });
    const rows = [];
    if (b.lv > 0) {
      rows.push(['Zustand', Math.round(b.hp) + ' / ' + Math.round(mx) + (b.hp < mx * 0.5 ? ' ⚠️' : '')]);
      if (work) rows.push(['Arbeitskräfte', (b.staff || 0) + ' / ' + work + (b.pause ? ' (pausiert)' : (b.staff || 0) < work ? ' ⚠️ zu wenige' : '')]);
      if (d.prod) { const mult = PW.prodMult(b.lv) * (work ? (b.staff || 0) / work : 1) * (C.touchesRoad(S, b) ? 1.1 : 1); rows.push(['Ertrag', Object.keys(d.prod).map(k => PW.RES_INFO[k].icon + ' ' + perMin(d.prod[k] * mult * (1 + ((S._mods || {})['prod.' + k] || 0)))).join(' ')]); }
      if (d.use) rows.push(['Verbrauch', Object.keys(d.use).map(k => PW.RES_INFO[k].icon + ' ' + perMin(-d.use[k] * PW.prodMult(b.lv))).join(' ')]);
      if (d.prod || d.beds) rows.push(['Weg-Anschluss', C.touchesRoad(S, b) ? '✅ +10 %' : '— (Pflasterweg anlegen)']);
      if (d.house) rows.push(['Wohnraum', d.house * b.lv]);
      if (d.beds) rows.push(['Betten', Math.round(d.beds * (1 + 0.5 * (b.lv - 1)))]);
      if (d.quar) rows.push(['Quarantäneplätze', Math.round(d.quar * (1 + 0.5 * (b.lv - 1)))]);
      if (d.store) rows.push(['Lager', '+' + fmt(d.store * b.lv)]);
      if (d.troopCap) rows.push(['Truppengrenze', '+' + d.troopCap * b.lv]);
      if (d.tower) { const st = PW.Waves.towerStats(S, b); rows.push(['Turm', 'Reichweite ' + st.range.toFixed(1) + ' · Schaden ' + Math.round(st.dmg) + ' · alle ' + st.rate + ' s']); }
      if (b.t === 'mauer') rows.push(['Tor', Math.round(S.city.gate) + ' / ' + C.gateMax(S)]);
      if (b.down > 0) rows.push(['Umzug', 'arbeitet wieder in ' + T(b.down)]);
    }
    h += kv(rows);
    // Verbessern
    if (b.st === 'ok' && b.lv < d.max) {
      const why = C.upgradeWhy(S, b);
      h += '<hr class="sep"><div class="small"><b>Stufe ' + (b.lv + 1) + ':</b> ' + cost(PW.costOf(b.t, b.lv + 1)) + ' <span class="chip">⏱ ' + T(C.buildTime(S, b.t, b.lv + 1)) + '</span></div>' + U.why(why);
    }
    const acts = [];
    if (b.st === 'ok' && b.lv < d.max) acts.push(btn('bupg', '⬆️ Verbessern', { cls: 'primary small', dis: C.upgradeWhy(S, b), d: { uid } }));
    if (b.st === 'ok' && b.lv > 0 && C.repairCost(S, b)) acts.push(btn('brep', '🔧 Reparieren ' + PW.costText(C.repairCost(S, b)), { cls: 'small', d: { uid } }));
    if (b.t === 'mauer' && PW.Waves.repairGateCost(S)) acts.push(btn('gaterep', '🚪 Tor reparieren ' + PW.costText(PW.Waves.repairGateCost(S)), { cls: 'small' }));
    if (b.st === 'ok' && b.w && b.t !== 'hq') acts.push(btn('bmove', '↔ Versetzen', { cls: 'small', d: { uid } }));
    if (work && b.lv) acts.push(btn('bpause', b.pause ? '▶ Fortsetzen' : '⏸ Pausieren', { cls: 'small', d: { uid } }));
    if (b.st === 'ok' && b.t !== 'hq' && b.t !== 'mauer') acts.push(btn('bdemo', '🗑 Abreißen', { cls: 'small danger', d: { uid } }));
    // Gebäudefunktionen
    const fn = { markt: ['market', '🏪 Markt öffnen'], akademie: ['research', '📜 Forschung'], kaserne: ['recruit', '🛡️ Ausbilden'], schiessplatz: ['recruit', '🎯 Ausbilden'], stall: ['recruit', '🐎 Ausbilden'], heldengilde: ['heroes', '⚔️ Helden'], schmiede: ['forge', '🔨 Schmieden'],
      heilstube: ['health', '🩹 Gesundheit'], lazarett: ['health', '🏥 Gesundheit'], quarantaene: ['health', '🚧 Gesundheit'], diplomatie: ['diplo', '🕊️ Diplomatie'], handel: ['world', '🐪 Karawane (Weltkarte)'], kommando: ['world', '🚩 Weltkarte'], kundschafter: ['world', '🔭 Weltkarte'], hq: ['overview', '📊 Übersicht'], mauer: ['waves', '⚔️ Verteidigung'] }[b.t];
    if (fn && b.lv > 0) acts.unshift(btn('bfn', fn[1], { cls: 'small', d: { f: fn[0] } }));
    h += '<div class="row">' + acts.join('') + '</div>';
    return { title, body: h };
  };
  A.bupg = d => { const r = C.upgrade(S_(), +d.uid); if (!r.ok) { U.toast(r.why, 'warn'); U.sfx('fehler'); } else U.sfx('bau'); };
  A.brep = d => { const r = C.repair(S_(), +d.uid); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('bau'); };
  A.gaterep = () => { const r = PW.Waves.repairGate(S_()); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('bau'); };
  A.bmove = d => { const b = C.get(S_(), +d.uid); if (b) U.startPlace(b.t, b.id); };
  A.bpause = d => { C.togglePause(S_(), +d.uid); PW.Game.refresh(S_()); };
  A.bcancel = d => { const r = C.cancel(S_(), +d.uid); if (r.removed) U.sel = null; };
  P.demolishAsk = uid => { const S = S_(), b = C.get(S, uid); if (!b) return; U.confirm('Abreißen', PW.BLD[b.t].name + ' abreißen? Du erhältst 50 % der Baukosten zurück.', 'Abreißen', () => { const r = C.demolish(S, uid); if (!r.ok) U.toast(r.why, 'warn'); else { U.sel = null; U.sfx('bau'); PW.Game.refresh(S); U.side(); } }, true); };
  A.bdemo = d => P.demolishAsk(+d.uid);
  A.bfn = d => {
    const f = d.f;
    if (f === 'market') P.overview('markt'); else if (f === 'research') P.research(); else if (f === 'recruit') P.military('truppen'); else if (f === 'heroes') P.heroes(); else if (f === 'forge') P.heroes(null, 'schmiede');
    else if (f === 'health') P.health(); else if (f === 'diplo') P.diplo(); else if (f === 'world') U.setMode('world'); else if (f === 'overview') P.overview(); else if (f === 'waves') P.military('wellen');
  };

  // ================= Zuflucht: Übersicht, Wirtschaft, Arbeit, Markt =================
  P.overview = function (tab) {
    U.modal('overview', '📊 Zuflucht', ent => {
      const S = S_(), t = ent.tab || tab || 'zuflucht', d = S._d, p = S.pop, tot = E.popTotal(p);
      let b = tabs([['zuflucht', 'Überblick'], ['wirtschaft', 'Rohstoffe'], ['arbeit', 'Arbeit'], ['markt', 'Markt']], t, 'otab');
      if (t === 'zuflucht') {
        b += '<div class="grid" style="margin-top:8px"><div class="card"><h3>👪 Bewohner</h3>' + kv([['Gesamt', tot + ' / Wohnraum ' + d.house], ['Gesund & arbeitsfähig', E.workforce(p)], ['Krank', p.i + p.q + p.t], ['Soldaten', E.troopCount(S)], ['Verstorben', p.dead], ['Geflohen', p.fled]]) + '</div>' +
          '<div class="card"><h3>😊 Zufriedenheit ' + Math.round(p.sat) + '</h3>' + bar(p.sat / 100, 'good') + '<div class="small muted">Ziel: ' + p.target + '. Steigt mit Nahrung, Wasser, Wohnraum, Hygiene, Markt, Deko, Laternen und Sicherheit; sinkt mit Krankheit, Trauer, Hunger und Angriffen. Unter 25 fliehen Bewohner, über 55 kommen neue.</div></div>' +
          '<div class="card"><h3>🏛️ Verwaltung</h3>' + kv([['Ratshaus', 'Stufe ' + C.hqLv(S)], ['Lagergrenze', fmt(d.store)], ['Regionen', Wd().tilesOf(S, 'P').length], ['Verwaltungskosten', S._regionUpkeep ? '🪙 ' + perMin(-S._regionUpkeep) : '—'], ['Hygiene', Math.round((S._hyg != null ? S._hyg : d.hyg) * 100) + ' %'], ['Sicherheit', Math.round(S._safety || 0)]]) + '</div>' +
          '<div class="card"><h3>📅 Lage</h3>' + kv([['Tag', PW.dayNo(S)], ['Spielzeit', T(S.time)], ['Jahreszeit', S.season ? esc(PW.SEASONS.find(x => x.id === S.season).name + ' (' + PW.SEASONS.find(x => x.id === S.season).desc + ')') : '—'], ['Ereignisse', S.events.active.map(e => PW.EVENT[e.id].icon + ' ' + PW.EVENT[e.id].name + ' (' + T(e.until - S.time) + ')').join(', ') || '—'], ['Siegziel', S.mode === 'campaign' ? 'Kampagne' : esc(PW.Game.VICTORY[S.cfg.victory])]]) + '</div></div>';
      } else if (t === 'wirtschaft') {
        const mins = 1, made = S._made || {}, used = S._used || {};
        b += '<table class="t" style="margin-top:8px"><tr><th>Rohstoff</th><th class="num">Bestand</th><th class="num">Lager</th><th class="num">Netto</th><th class="num">Regionen</th></tr>' + PW.RES.map(k => '<tr><td>' + PW.RES_INFO[k].icon + ' ' + PW.RES_INFO[k].name + '</td><td class="num">' + fmt(S.res[k]) + '</td><td class="num">' + (S._caps[k] === Infinity ? '∞' : fmt(S._caps[k])) + '</td><td class="num ' + ((S._rate[k] || 0) < -0.4 ? 'bad' : (S._rate[k] || 0) > 0.4 ? 'good' : '') + '">' + perMin(S._rate[k] || 0) + '</td><td class="num">' + ((S._regionIncome || {})[k] ? '+' + Math.round(S._regionIncome[k]) : '') + '</td></tr>').join('') + '</table>' +
          '<p class="small muted">Bewohner verbrauchen je Minute ' + PW.BAL.eatFood + ' Nahrung und ' + PW.BAL.drinkWater + ' Wasser, Truppen kosten Nahrung und Münzen. Steuern hängen von Bewohnerzahl und Zufriedenheit ab.</p>';
      } else if (t === 'arbeit') {
        const w = S._work || { free: 0, need: 0, total: 0 };
        b += '<p style="margin-top:8px">👷 Arbeitskräfte: <b>' + w.total + '</b> · benötigt ' + w.need + ' · frei ' + Math.max(0, w.free) + '</p><p class="small muted">Gesunde verteilen sich automatisch: Wasser, Medizin und Nahrung zuerst. Pausiere Gebäude, um Kräfte umzulenken.</p><table class="t"><tr><th>Gebäude</th><th class="num">Besetzt</th><th></th></tr>' +
          S.city.b.filter(x => x.lv > 0 && PW.workersOf(x.t, x.lv)).map(x => '<tr><td>' + PW.BLD[x.t].icon + ' ' + esc(PW.BLD[x.t].name) + ' ' + x.lv + '</td><td class="num ' + ((x.staff || 0) < PW.workersOf(x.t, x.lv) ? 'warn' : '') + '">' + (x.staff || 0) + '/' + PW.workersOf(x.t, x.lv) + '</td><td class="num">' + btn('bpause', x.pause ? '▶' : '⏸', { cls: 'small', d: { uid: x.id } }) + '</td></tr>').join('') + '</table>';
      } else {
        if (!C.lv(S, 'markt')) b += '<p style="margin-top:8px">Baue einen <b>Marktplatz</b> (Ratshaus Stufe 2), um Waren gegen Münzen zu tauschen.</p>';
        else {
          b += '<p class="small muted" style="margin-top:8px">Kurse verbessern sich mit der Stufe des Marktes. 🪙 ' + fmt(S.res.coin) + '</p><table class="t"><tr><th>Ware</th><th class="num">Kauf (10)</th><th class="num">Verkauf (10)</th><th></th></tr>' +
            Object.keys(E.PRICE).map(k => '<tr><td>' + PW.RES_INFO[k].icon + ' ' + PW.RES_INFO[k].name + ' <span class="muted small">(' + fmt(S.res[k]) + ')</span></td><td class="num">' + (k === 'know' ? '—' : Math.ceil(E.marketRate(S, k, true) * 10)) + '</td><td class="num">' + Math.floor(E.marketRate(S, k, false) * 10) + '</td><td class="num">' +
              (k !== 'know' ? btn('trade', '+10', { cls: 'small', d: { k, n: 10, b: 1 } }) + btn('trade', '+50', { cls: 'small', d: { k, n: 50, b: 1 } }) : '') + btn('trade', '−10', { cls: 'small', d: { k, n: 10, b: 0 } }) + btn('trade', '−50', { cls: 'small', d: { k, n: 50, b: 0 } }) + '</td></tr>').join('') + '</table>';
        }
      }
      return b;
    });
  };
  A.otab = setTab('overview');
  A.trade = d => { const r = E.trade(S_(), d.k, +d.n, d.b === '1'); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('klick'); U.redrawId('overview'); };
  const Wd = () => PW.World;

  // ================= Gesundheit =================
  P.health = function () {
    U.modal('health', '🩹 Gesundheit', () => {
      const S = S_(), p = S.pop, d = S._d, tot = E.popTotal(p) || 1, medUse = p.t * PW.BAL.medPerPatient;
      const seg = (n, c, l) => n > 0 ? '<i title="' + l + ': ' + n + '" style="display:inline-block;height:100%;width:' + (n / tot * 100) + '%;background:' + c + '"></i>' : '';
      let b = '<div class="bar" style="height:16px;display:flex">' + seg(p.h, '#86c96f', 'Gesund') + seg(p.r, '#e0c050', 'Gefährdet') + seg(p.i, '#9cc552', 'Infiziert') + seg(p.q, '#d8b030', 'In Quarantäne') + seg(p.t, '#79b4e8', 'In Behandlung') + seg(p.rec, '#c8c0f0', 'Genesen (immun)') + '</div>';
      b += '<div class="grid" style="margin-top:10px"><div class="card"><h3>🧍 Zustand</h3>' + kv([['💚 Gesund', p.h], ['⚠️ Gefährdet', p.r], ['🤒 Infiziert (ansteckend)', p.i], ['🚧 In Quarantäne', p.q + ' / ' + d.quar], ['🛏 In Behandlung', p.t + ' / ' + d.beds], ['✨ Genesen (immun)', p.rec], ['🕯️ Verstorben', p.dead]]) + '</div>' +
        '<div class="card"><h3>⚕️ Versorgung</h3>' + kv([['Heilrate', Math.round((S._cureRate || 0) * 100) + ' %/min'], ['🧪 Arznei', fmt(S.res.med) + ' (' + perMin(-medUse) + ')'], ['🌿 Heilkräuter', fmt(S.res.herb)], ['🧼 Hygiene', Math.round((S._hyg != null ? S._hyg : d.hyg) * 100) + ' %'], ['☣️ Seuche im Umland', Math.round((S._regionPlague || 0) * 100) + ' %'], ['Geheilt insgesamt', Math.floor(S.stats.cured || 0)]]) + '</div></div>';
      const tips = [];
      if (p.i > 0 && d.quar <= p.q) tips.push('Infizierte stecken andere an – baue eine Quarantänestation.');
      if (p.q + p.i > 0 && d.beds <= p.t) tips.push('Alle Betten sind belegt – baue oder verbessere Heilstuben.');
      if (p.t > 0 && S.res.med < medUse * 3) tips.push('Die Arznei wird knapp – Kräutergarten und Alchemielabor ausbauen.');
      if ((S._hyg || d.hyg) < 0.4) tips.push('Schlechte Hygiene – Brunnen bauen, Forschung „Seife & Hygiene“, Überfüllung vermeiden.');
      if ((S._regionPlague || 0) > 0.2) tips.push('Das Umland ist verseucht – schicke Expeditionen „Region heilen“ oder zerstöre Seuchennester.');
      b += tips.length ? '<div class="card" style="margin-top:10px"><h3>💡 Ratschläge</h3>' + tips.map(t => '<div class="small">• ' + t + '</div>').join('') + '</div>' : '<p class="small good" style="margin-top:10px">Die Lage ist unter Kontrolle.</p>';
      const w = PW.UNIT_IDS.filter(k => S.wounded[k] > 0);
      if (w.length) b += '<p class="small">🩸 Verwundete Soldaten: ' + w.map(k => S.wounded[k] + ' ' + PW.UNITS[k].name).join(', ') + ' (genesen mit der Zeit, schneller mit Pestlazarett)</p>';
      return b;
    });
  };

  // ================= Militär: Truppen, Wellen, Expeditionen, Berichte =================
  U.recN = {};
  P.military = function (tab) {
    U.modal('military', '🛡️ Militär', ent => {
      const S = S_(), t = ent.tab || tab || 'truppen';
      let b = tabs([['truppen', 'Truppen'], ['wellen', 'Verteidigung'], ['expeditionen', 'Expeditionen (' + S.marches.filter(a => a.owner === 'P').length + ')'], ['berichte', 'Kampfberichte']], t, 'mtab');
      if (t === 'truppen') {
        b += '<p class="small muted" style="margin-top:8px">Truppen ' + E.troopCount(S) + ' / ' + E.troopCap(S) + ' · Soldaten kommen aus den gesunden Bewohnern (' + S.pop.h + ') · Unterhalt: 🍞 ' + PW.BAL.troopUpkeepFood + ' und 🪙 ' + PW.BAL.troopUpkeepCoin + ' je Soldat und Minute</p>';
        if (S.recruit.length) b += '<div class="card"><h3>⏳ In Ausbildung</h3>' + S.recruit.map(r => '<div class="small">' + PW.UNITS[r.type].icon + ' ' + r.n + ' ' + PW.UNITS[r.type].name + ' · ' + T(r.rem) + '</div>' + bar(1 - r.rem / r.tot, 'good')).join('') + '</div>';
        b += '<div class="grid" style="margin-top:8px">' + PW.UNIT_IDS.map(k => {
          const u = PW.UNITS[k], n = U.recN[k] || 5, why = E.recruitWhy(S, k, n);
          const locked = why && /nötig/.test(why);
          return '<div class="card' + (locked ? ' locked' : '') + '"><h3><span class="ico">' + u.icon + '</span>' + u.name + ' <span class="chip">' + (S.troops[k] || 0) + (S.wounded[k] ? ' +' + S.wounded[k] + '🩸' : '') + '</span></h3><div class="small muted">' + esc(u.desc) + '</div>' +
            '<div class="small">❤ ' + u.hp + ' · ⚔ ' + u.atk + ' · 🛡 ' + u.def + ' · Reichweite ' + u.range + '</div>' +
            (locked ? U.why(why) : '<div class="row">' + btn('rn', '−', { cls: 'small round', d: { k, v: -5 } }) + '<b style="min-width:30px;text-align:center">' + n + '</b>' + btn('rn', '+', { cls: 'small round', d: { k, v: 5 } }) + '<span class="small">' + cost(u.cost, n) + ' ⏱ ' + T(E.recruitTime(S, k, n)) + '</span></div>' + U.why(why) +
              '<div class="row">' + btn('recruit', 'Ausbilden', { cls: 'small primary', dis: why, d: { k, n } }) + ((S.troops[k] || 0) > 0 ? btn('dismiss', 'Entlassen (5)', { cls: 'small ghost', d: { k } }) : '') + '</div>') + '</div>';
        }).join('') + '</div>';
      } else if (t === 'wellen') {
        const w = S.waves, gm = C.gateMax(S), g = PW.Waves.garrison(S);
        b += '<div class="grid" style="margin-top:8px"><div class="card"><h3>🏰 Verteidigung</h3>' + kv([['Tor', Math.round(S.city.gate) + ' / ' + gm], ['Turmschaden', PW.Waves.towerDps(S) + '/s (' + S._d.towers.length + ' Türme)'], ['Garnison', PW.UNIT_IDS.filter(k => g[k]).map(k => g[k] + ' ' + PW.UNITS[k].icon).join(' ') || '—'], ['Kampfkraft am Tor', Math.round(PW.Waves.garrisonDps(S)) + '/s'], ['Abgewehrt', (S.stats.waves || 0) + ' Wellen'], ['Bosse besiegt', S.stats.bosses || 0]]) +
          (PW.Waves.repairGateCost(S) ? btn('gaterep', '🚪 Tor reparieren ' + PW.costText(PW.Waves.repairGateCost(S)), { cls: 'small' }) : '') + '</div>' +
          '<div class="card"><h3>⏳ Nächste Welle</h3>' + (S.cfg.waves === false ? '<p class="muted">Wellen sind ausgeschaltet.</p>' : w.active ? '<p>Welle ' + w.active.n + ' läuft!</p>' : (S.campaign && S.campaign.noWaves) ? '<p class="muted">In dieser Mission greift niemand an.</p>' :
            kv([['Welle', w.n + 1 + ((w.n + 1) % PW.WAVES.bossEvery === 0 ? ' 💀 mit Boss' : '')], ['In', T(w.next - S.time)], ['Warnzeit', T(PW.Waves.warnTime(S))]]) + btn('early', 'Jetzt rufen (+25 % Beute)', { cls: 'small' })) + '</div></div>' +
          '<p class="small muted">Wachtürme zielen auf den vordersten Feind, Ballisten auf den stärksten, Feuerbecken auf die dichteste Gruppe, Räuchertürme verlangsamen alle in Reichweite. Monster laufen auf festen Pfaden zum Tor (rot markiert, sobald eine Welle angekündigt ist).</p>';
        if (w.last) b += '<p class="small">Letzte Welle ' + w.last.n + ': ' + (w.last.won ? '🏆 abgewehrt' : '🔥 verloren') + '</p>';
      } else if (t === 'expeditionen') {
        const mine = S.marches.filter(a => a.owner === 'P');
        b += '<p class="small muted" style="margin-top:8px">Gleichzeitig möglich: ' + M.maxMarches(S) + ' Expedition(en)' + (C.lv(S, 'handel') ? ' und ' + C.lv(S, 'handel') + ' Karawane(n)' : '') + '. Neue Expeditionen startest du auf der Weltkarte.</p>' + btn('nav', '🗺️ Zur Weltkarte', { cls: 'small', d: { id: 'karte' } });
        b += mine.length ? '<table class="t" style="margin-top:8px">' + mine.map(a => '<tr><td>' + M.MISSIONS[a.mission].icon + ' ' + M.MISSIONS[a.mission].name + '<div class="small muted">' + esc(Wd().regionName(S, a.target)) + ' · ' + (a.state === 'back' ? 'auf dem Rückweg' : a.state === 'work' || a.work > 0 ? 'bei der Arbeit' : 'unterwegs') + '</div></td><td class="small">' + PW.UNIT_IDS.filter(k => a.units[k]).map(k => a.units[k] + PW.UNITS[k].icon).join(' ') + ' ' + a.heroes.map(h => '⭐' + esc(PW.HERO[h].name.split(' ')[0])).join(' ') + '</td><td class="num">' + T(M.eta(S, a) + (a.work > 0 && a.work < 1e8 ? a.work : 0)) + '</td><td class="num">' + (a.state !== 'back' ? btn('recall', 'Zurück', { cls: 'small', d: { id: a.id } }) : '') + btn('mfocus', '👁', { cls: 'small', d: { id: a.id } }) + '</td></tr>').join('') + '</table>' : '<p class="muted">Keine Expeditionen unterwegs.</p>';
      } else b += reportsHtml(S);
      return b;
    });
  };
  A.mtab = setTab('military');
  A.rn = d => { U.recN[d.k] = PW.clamp((U.recN[d.k] || 5) + +d.v, 1, 100); U.redrawId('military'); };
  A.recruit = d => { const r = E.recruit(S_(), d.k, +d.n); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('marsch'); U.redrawId('military'); };
  A.dismiss = d => { E.dismiss(S_(), d.k, 5); U.redrawId('military'); };
  A.recall = d => { M.recall(S_(), +d.id); U.redrawId('military'); };
  A.mfocus = d => { const S = S_(), a = S.marches.find(x => x.id === +d.id); if (!a) return; U.closeModal(); U.setMode('world'); PW.R.focusTile(S, M.curTile(a), 18); };
  function reportsHtml(S) {
    if (!S.reports.length) return '<p class="muted" style="margin-top:8px">Noch keine Kämpfe.</p>';
    return '<div class="col" style="margin-top:8px">' + S.reports.slice(0, 25).map(r => '<div class="card"><div class="row"><b class="grow">' + esc(r.kind) + ' · ' + esc(Wd().regionName(S, r.tile)) + '</b><span class="small muted">Tag ' + (Math.floor(r.t / PW.DAY) + 1) + '</span></div><div class="small">' + esc(M.ownerName(S, r.att)) + ' (−' + r.lost[0] + ') gegen ' + esc(M.ownerName(S, r.def)) + ' (−' + r.lost[1] + ') · Sieg: <b class="' + (r.win === 'P' ? 'good' : (r.att === 'P' || r.def === 'P') ? 'bad' : '') + '">' + esc(M.ownerName(S, r.win)) + '</b> · ' + r.dur + ' s' + (r.extra ? '<br>' + esc(r.extra) : '') + '</div></div>').join('') + '</div>';
  }
  P.reports = () => P.military('berichte');
  P.log = function () {
    U.modal('log', '📜 Chronik', ent => {
      const S = S_(), f = ent.tab || 'alle';
      const kinds = { alle: null, eigene: ['bau', 'forschung', 'militaer', 'held', 'gut', 'warn', 'kampf', 'erfolg', 'story', 'event', 'handel', 'info'], welt: ['welt', 'diplo'] };
      const list = S.log.slice().reverse().filter(e => !kinds[f] || kinds[f].indexOf(e.k) >= 0).slice(0, 150);
      return tabs([['alle', 'Alles'], ['eigene', 'Zuflucht'], ['welt', 'Welt & Diplomatie']], f, 'ltab') + '<div class="col" style="margin-top:8px;gap:3px">' + list.map(e => '<div class="small"><span class="muted">Tag ' + (Math.floor(e.t / PW.DAY) + 1) + ' ' + String(Math.floor((e.t % PW.DAY) / PW.DAY * 24)).padStart(2, '0') + ' Uhr</span> · ' + esc(e.txt) + '</div>').join('') + '</div>';
    });
  };
  A.ltab = setTab('log');

  // ================= Helden =================
  P.heroes = function (id, tab) {
    U.modal('heroes', '⭐ Helden', ent => {
      const S = S_(), t = ent.tab || tab || 'helden';
      let b = tabs([['helden', 'Helden (' + Object.keys(S.heroes).length + '/12)'], ['schmiede', 'Schmiede & Ausrüstung']], t, 'htab2');
      if (t === 'helden') {
        const cur = ent.hid || id || Object.keys(S.heroes)[0];
        b += '<div class="row" style="margin:8px 0">' + PW.HEROES.map(d => { const own = !!S.heroes[d.id]; return '<button class="btn small' + (cur === d.id ? ' on' : '') + '" data-act="hsel" data-id="' + d.id + '" style="border-color:' + PW.RARITY[d.rar].col + ';' + (own ? '' : 'opacity:.55') + '">' + esc(d.name.split(' ')[0]) + (own && S.heroes[d.id].sp ? ' •' : '') + '</button>'; }).join('') + '</div>';
        const d = PW.HERO[cur]; if (!d) return b;
        const h = S.heroes[cur], st = h ? H.stats(S, cur) : null, R = PW.RARITY[d.rar];
        b += '<div class="card"><div class="fac"><div class="portrait" style="background:' + d.col + '">' + esc(d.name.charAt(0)) + '</div><div class="grow"><h3>' + esc(d.name) + '</h3><div class="small"><span style="color:' + R.col + '">' + R.name + '</span> · ' + PW.CLASSES[d.cls] + (h ? ' · Stufe ' + h.lv + '/' + H.cap(h) + ' ' + '★'.repeat(h.star) : '') + '</div></div></div>' +
          '<div class="small muted">' + esc(d.story) + '</div><div class="small">👍 ' + esc(d.pro) + ' · 👎 ' + esc(d.con) + '</div>' +
          '<div class="small"><b>Passiv – ' + esc(d.passive.name) + ':</b> ' + esc(d.passive.desc) + '</div><div class="small"><b>Fähigkeit – ' + esc(d.skill.name) + ':</b> ' + esc(d.skill.desc) + ' (Schlacht: lädt mit der Zeit und schneller durch Treffer, voll nach höchstens ' + Math.ceil(d.skill.cd / 0.6) + ' s)</div>';
        if (!h) {
          const why = H.recruitWhy(S, cur);
          b += '<hr class="sep">' + (d.unlock === 'gilde' ? '<div class="small">Anwerben in der Heldengilde (Stufe ' + d.guild + '): ' + cost(d.price) + '</div>' + U.why(why) + btn('hrec', 'Anwerben', { cls: 'small primary', dis: why, d: { id: cur } }) : '<div class="small muted">🔒 ' + (S.mode === 'campaign' ? 'Schließt sich dir im Lauf der Kampagne an.' : 'Verschollen – vielleicht in einer Ruine auf der Weltkarte zu finden.') + '</div>');
        } else {
          b += '<hr class="sep">' + kv([['❤ Leben', st.hp], ['⚔ Angriff', st.atk], ['🛡 Verteidigung', st.def], ['Ort', h.where === 'stadt' ? (h.inj > 0 ? '🩸 verletzt (' + T(h.inj) + ')' : '🏰 in der Zuflucht') : '🗺️ auf Expedition']]) +
            '<div class="small">Erfahrung ' + Math.floor(h.xp) + ' / ' + PW.xpFor(h.lv) + '</div>' + bar(h.xp / PW.xpFor(h.lv), 'good') +
            '<div class="small" style="margin-top:6px"><b>Talente</b> (Punkte: ' + h.sp + ')</div>' + Object.keys(PW.TALENTS).map(k => '<div class="row small"><span class="grow">' + PW.TALENTS[k].name + ' ' + h.tal[k] + '/' + PW.TALENTS[k].max + ' <span class="muted">' + PW.TALENTS[k].desc + '</span></span>' + btn('htal', '+', { cls: 'small round', dis: h.sp < 1 || h.tal[k] >= PW.TALENTS[k].max ? 'Kein Punkt' : null, d: { id: cur, k } }) + '</div>').join('') +
            '<div class="small" style="margin-top:6px"><b>Ausrüstung</b></div>' + ['waffe', 'ruestung', 'talisman'].map(slot => { const uid = h.eq[slot], it = uid && S.items.find(x => x.uid === uid), free = S.items.filter(x => PW.ITEM[x.id].slot === slot && !Object.keys(S.heroes).some(o => Object.values(S.heroes[o].eq).indexOf(x.uid) >= 0));
              return '<div class="row small"><span style="width:80px">' + { waffe: '🗡 Waffe', ruestung: '🛡 Rüstung', talisman: '📿 Talisman' }[slot] + '</span><span class="grow">' + (it ? esc(PW.ITEM[it.id].name) : '—') + '</span>' + (it ? btn('hunq', 'Ablegen', { cls: 'small', d: { id: cur, s: slot } }) : '') + free.slice(0, 3).map(x => btn('hequ', esc(PW.ITEM[x.id].name), { cls: 'small', d: { id: cur, u: x.uid } })).join('') + '</div>'; }).join('');
          const pw = h.star < 2 ? (h.lv < H.cap(h) ? 'Erst Stufe ' + H.cap(h) + ' erreichen' : C.lv(S, 'heldengilde') < 2 + h.star * 2 ? 'Heldengilde Stufe ' + (2 + h.star * 2) + ' nötig' : !PW.canPay(S.res, H.promoteCost(h)) ? 'Zu wenig Rohstoffe' : null) : 'Höchste Aufwertung';
          b += '<div class="small" style="margin-top:6px"><b>Aufwerten</b> (höhere Stufengrenze, +15 % Werte): ' + (h.star < 2 ? cost(H.promoteCost(h)) : '★★') + '</div>' + btn('hpro', '🌟 Aufwerten', { cls: 'small', dis: pw, d: { id: cur } });
        }
        b += '</div>';
      } else {
        const sm = C.lv(S, 'schmiede');
        b += '<p class="small muted" style="margin-top:8px">' + (sm ? 'Schmiede Stufe ' + sm + '. Geschmiedete Stücke legst du im Heldenfenster an.' : 'Baue eine <b>Schmiede</b> (Ratshaus Stufe 2), um Ausrüstung herzustellen.') + '</p><div class="grid">' + PW.ITEMS.map(it => { const why = H.craftWhy(S, it.id), have = S.items.filter(x => x.id === it.id).length;
          return '<div class="card' + (sm < it.smith ? ' locked' : '') + '"><h3>' + { waffe: '🗡', ruestung: '🛡', talisman: '📿' }[it.slot] + ' ' + esc(it.name) + (have ? ' <span class="chip">×' + have + '</span>' : '') + '</h3><div class="small">' + [it.atk ? '⚔ +' + it.atk : '', it.def ? '🛡 +' + it.def : '', it.hp ? '❤ +' + it.hp : ''].filter(Boolean).join(' · ') + '</div><div class="small">' + cost(it.cost) + '</div>' + U.why(why) + btn('craft', 'Schmieden', { cls: 'small', dis: why, d: { id: it.id } }) + '</div>'; }).join('') + '</div>';
      }
      return b;
    });
  };
  A.htab2 = setTab('heroes');
  A.hsel = d => { const e = U.find('heroes'); e.hid = d.id; U.draw(e); };
  A.hrec = d => { const r = H.recruit(S_(), d.id); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('erfolg'); PW.Game.refresh(S_()); U.redrawId('heroes'); };
  A.htal = d => { H.talent(S_(), d.id, d.k); U.redrawId('heroes'); };
  A.hequ = d => { H.equip(S_(), d.id, +d.u); U.redrawId('heroes'); };
  A.hunq = d => { H.unequip(S_(), d.id, d.s); U.redrawId('heroes'); };
  A.hpro = d => { const r = H.promote(S_(), d.id); if (!r.ok) U.toast(r.why, 'warn'); U.redrawId('heroes'); };
  A.craft = d => { const r = H.craft(S_(), d.id); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('bau'); U.redrawId('heroes'); };

  // ================= Forschung =================
  P.research = function () {
    U.modal('research', '📜 Forschung', () => {
      const S = S_(), c = S.research.cur, ak = C.lv(S, 'akademie');
      let b = '<p class="small muted">📜 Wissen: ' + fmt(S.res.know) + ' (' + perMin(S._rate.know || 0) + ') · Akademie Stufe ' + ak + ' – Stufe 2 der Bäume braucht eine Akademie, Stufe 3 Akademie 3, Stufe 4 Akademie 5.</p>';
      if (c) b += '<div class="card"><div class="row"><b class="grow">⏳ ' + esc(PW.TECH[c.id].name) + ' · ' + T(c.rem) + '</b>' + btn('rcancel', 'Abbrechen', { cls: 'small' }) + '</div>' + bar(1 - c.rem / c.tot, 'good') + '</div>';
      b += '<div class="trees" style="margin-top:8px">' + PW.TREES.map(tr => '<div class="col"><h3>' + tr.icon + ' ' + tr.name + '</h3>' + PW.TECHS.filter(t => t.tree === tr.id).sort((a, b2) => a.tier - b2.tier).map(t => {
        const done = S.research.done[t.id], cur = c && c.id === t.id, why = done || cur ? null : E.researchWhy(S, t.id);
        return '<div class="tech' + (done ? ' done' : cur ? ' cur' : why ? ' lock' : '') + '"><div class="row"><b class="grow">' + (done ? '✅ ' : '') + esc(t.name) + '</b><span class="chip">Stufe ' + t.tier + '</span></div><div class="small">' + esc(t.desc) + '</div>' + (t.req ? '<div class="small muted">Benötigt: ' + t.req.map(r => PW.TECH[r].name).join(', ') + '</div>' : '') +
          (done ? '' : '<div class="small">' + cost(t.cost) + ' ⏱ ' + T(E.researchTime(S, t.id)) + '</div>' + (cur ? '' : U.why(why) + btn('rstart', 'Erforschen', { cls: 'small' + (why ? '' : ' primary'), dis: why, d: { id: t.id } }))) + '</div>';
      }).join('') + '</div>').join('') + '</div>';
      return b;
    });
  };
  A.rstart = d => { const r = E.startResearch(S_(), d.id); if (!r.ok) U.toast(r.why, 'warn'); else U.sfx('klick'); U.redrawId('research'); };
  A.rcancel = () => { E.cancelResearch(S_()); U.redrawId('research'); };

  // ================= Weltkarte: Feld-Info und Expedition =================
  function estPower(S, d) {
    if (!d) return 0;
    let p = PW.Battle.power(d.units || null, d.mon || null, d.heroes || null, d.mods || {});
    if (d.boss) p += PW.Battle.power(null, { [d.boss]: 1 }, null) * 1.5;
    if (d.siege && d.capital) p += d.siege.wall * 0.25 + d.siege.towers * 8;
    return p;
  }
  P.estPower = estPower;
  P.tileSide = function (i) {
    const S = S_(), t = S.world.tiles[i]; if (!t) return null;
    const ex = Wd().explored(S, i), s = Wd().siteAt(S, i), title = ex ? esc(Wd().regionName(S, i)) : '🌫️ Unerforscht';
    if (!ex) return { title, body: '<p class="small muted">Dieses Gebiet liegt im Nebel. Schicke Kundschafter, um es aufzudecken.</p><div class="row">' + btn('exp', '🔭 Erkunden', { cls: 'small primary', d: { m: 'scout' } }) + '</div>' };
    const own = t.own, ownN = own ? M.ownerName(S, own) : 'niemand';
    const rows = [['Gelände', PW.BIOMES[t.b].name + (t.riv ? ' · Fluss' : '') + (t.road ? ' · Straße' : '')], ['Besitzer', own ? '<span style="color:' + (own === 'P' ? '#e0aa45' : PW.FAC[own] ? PW.FAC[own].col : '#aaa') + '">■</span> ' + esc(ownN) + (own && own !== 'P' ? ' (' + D.status(S, 'P', own) + ')' : '') : 'frei'], ['Seuche', Math.round(t.pl * 100) + ' %'], ['Entfernung', Wd().dist(S.world, i, S.world.caps[0]) + ' Felder']];
    if (s) rows.push(['Ort', PW.SITES[s.type].icon + ' ' + esc(s.name || PW.SITES[s.type].name) + (s.cleared ? ' (befreit)' : '')]);
    if (s && s.type === 'village') rows.push(['Hilfesuchende', s.patients || 0]);
    if (s && PW.SITES[s.type].prod) rows.push(['Ertrag', PW.costText(PW.SITES[s.type].prod) + '/min (wenn besetzt: 60 %)']);
    const bp = PW.BIOMES[t.b].prod; if (own === 'P') rows.push(['Regionsertrag', PW.costText(Object.fromEntries(Object.entries(bp).map(([k, v]) => [k, v * 0.5]))) + '/min']);
    const d = i === S.world.caps[0] ? null : M.defenders(S, i), pw = estPower(S, d);
    if (d && pw > 0) rows.push(['Verteidiger', '≈ ' + fmt(pw) + ' Stärke' + (d.boss ? ' · 💀 ' + esc(PW.BOSSES[d.boss].name) : '') + (d.mon ? ' (Seuchenwesen)' : '')]);
    const foreign = S.marches.filter(a => a.owner !== 'P' && M.curTile(a) === i);
    if (foreign.length) rows.push(['Unterwegs', foreign.map(a => esc(M.ownerName(S, a.owner)) + ' ' + M.MISSIONS[a.mission].icon).join(', ')]);
    let body = kv(rows);
    if (s && s.story) body += '<p class="small warn">✴️ Missionsziel</p>';
    if (i === S.world.caps[0]) body += '<p class="small">Deine Zuflucht.</p>' + btn('nav', '🏰 Zur Zuflucht', { cls: 'small', d: { id: 'karte' } });
    else {
      const ms = [];
      ms.push(['scout', '🔭 Erkunden']);
      if (s && s.type.indexOf('res_') === 0 && (!s.gar || s.cleared) && (!own || own === 'P')) ms.push(['gather', '🧺 Sammeln']);
      if (s && s.type === 'village' && s.patients > 0) ms.push(['rescue', '🩹 Kranke retten']);
      if (t.pl > 0.1) ms.push(['heal', '🌿 Region heilen']);
      if (!own) ms.push(['occupy', '🚩 ' + (d && pw > 0 ? 'Befreien & besetzen' : 'Besetzen')]);
      if (own && own !== 'P') ms.push(['attack', '⚔️ Angreifen']);
      if (own === 'P') ms.push(['defend', '🛡️ Verstärken']);
      if (s && (s.type === 'trade' || (s.type === 'capital' && own && own !== 'P'))) ms.push(['trade', '🐪 Handeln']);
      body += '<div class="row">' + ms.map(([m, l]) => btn('exp', l, { cls: 'small' + (m === 'attack' || m === 'occupy' ? ' primary' : ''), d: { m } })).join('') + '</div>';
      if (own && own !== 'P') body += btn('diplofac', '🕊️ ' + esc(ownN) + ' – Diplomatie', { cls: 'small ghost', d: { f: own } });
    }
    return { title, body };
  };
  A.diplofac = d => P.diplo(d.f);
  A.exp = d => P.expedition(U.tile, d.m);
  U.exp = null;
  P.expedition = function (tile, mission) {
    const S = S_();
    U.exp = { tile, mission, units: {}, heroes: [], formation: 'ausgewogen', cargo: {} };
    if (mission === 'scout') { U.exp.units = { rider: Math.min(2, S.troops.rider || 0) }; if (!U.exp.units.rider) U.exp.units = { spear: Math.min(2, S.troops.spear || 0) }; }
    if (mission === 'trade') { const k = ['wood', 'stone', 'food', 'cloth', 'herb'].sort((a, b) => S.res[b] - S.res[a])[0]; U.exp.cargo = { [k]: Math.min(100, Math.floor(S.res[k])) }; }
    const path = Wd().path(S.world, S.world.caps[0], tile); U.plan = path;
    U.modal('exp', M.MISSIONS[mission].icon + ' ' + M.MISSIONS[mission].name + ' → ' + esc(Wd().regionName(S, tile)), () => {
      const x = U.exp, mine = PW.Battle.power(x.units, null, x.heroes.map(h => H.stats(S, h)), S._mods), d = M.defenders(S, tile), theirs = (mission === 'attack' || mission === 'occupy') ? estPower(S, d) : 0;
      const why = M.playerWhy(S, Object.assign({ target: tile }, x)), spd = M.speedOf(S, 'P', x.units, x.heroes, mission), eta = path ? Wd().pathCost(S.world, path) * PW.BAL.marchCost / spd : 0;
      let b = '';
      if (mission !== 'trade') {
        b += '<h3>Truppen</h3><div class="col">' + PW.UNIT_IDS.filter(k => S.troops[k] > 0).map(k => '<label class="f">' + PW.UNITS[k].icon + ' ' + PW.UNITS[k].name + ': <b>' + (x.units[k] || 0) + '</b> / ' + S.troops[k] + '<input type="range" min="0" max="' + S.troops[k] + '" value="' + (x.units[k] || 0) + '" data-ch="expu" data-k="' + k + '" data-key="u' + k + '"></label>').join('') + (PW.UNIT_IDS.some(k => S.troops[k] > 0) ? '' : '<p class="muted small">Keine Truppen in der Zuflucht.</p>') + '</div>' +
          '<div class="row">' + btn('expall', 'Alle', { cls: 'small' }) + btn('expnone', 'Keine', { cls: 'small' }) + '</div>';
        b += '<h3 style="margin-top:8px">Helden (max. 2)</h3><div class="row">' + H.list(S).map(h => { const av = H.available(S, h), on = x.heroes.indexOf(h) >= 0; return '<button class="btn small' + (on ? ' on' : '') + '" data-act="exph" data-h="' + h + '" ' + (av ? '' : 'disabled title="nicht verfügbar"') + '>' + (on ? '✔ ' : '') + esc(PW.HERO[h].name.split(' ')[0]) + '</button>'; }).join('') + '</div>';
        b += '<h3 style="margin-top:8px">Formation</h3><div class="row">' + Object.keys(PW.Battle.FORMATIONS).map(f => '<button class="btn small' + (x.formation === f ? ' on' : '') + '" data-act="expf" data-f="' + f + '">' + PW.Battle.FORMATIONS[f] + '</button>').join('') + '</div><p class="small muted">Angriff: +15 % Schaden, −10 % Abwehr · Verteidigung: +20 % Abwehr, langsamer.</p>';
      } else {
        b += '<h3>Waren (Karawane)</h3><p class="small muted">Die Gegenseite zahlt je nach Bedarf und Beziehung in Münzen. Unterwegs drohen Überfälle nahe Seuchennestern und Feinden.</p><div class="col">' + ['wood', 'stone', 'iron', 'food', 'water', 'herb', 'med', 'cloth'].map(k => '<label class="f">' + PW.RES_INFO[k].icon + ' ' + PW.RES_INFO[k].name + ': <b>' + (x.cargo[k] || 0) + '</b><input type="range" min="0" max="' + Math.min(300, Math.floor(S.res[k])) + '" step="10" value="' + (x.cargo[k] || 0) + '" data-ch="expc" data-k="' + k + '" data-key="c' + k + '"></label>').join('') + '</div>';
      }
      b += '<hr class="sep">' + kv([['Weg', path ? (path.length - 1) + ' Felder · ⏱ ≈ ' + T(eta) + ' hin' : '❌ kein Weg'], (mission === 'attack' || mission === 'occupy') ? ['Stärke', '<b>' + fmt(mine) + '</b> gegen ≈ <b>' + fmt(theirs) + '</b> ' + (theirs ? (mine > theirs * 1.4 ? '<span class="good">(überlegen)</span>' : mine > theirs * 0.9 ? '<span class="warn">(ausgeglichen)</span>' : '<span class="bad">(unterlegen)</span>') : '<span class="good">(unbewacht)</span>')] : null,
        mission === 'attack' && S.world.tiles[tile].own && !D.atWar(S, 'P', S.world.tiles[tile].own) ? ['Hinweis', '<span class="warn">Du bist nicht im Krieg mit ' + esc(M.ownerName(S, S.world.tiles[tile].own)) + '. Erkläre ihn in der Diplomatie.</span>'] : null]);
      return { body: b + U.why(why), foot: btn('close', 'Abbrechen', { d: { id: 'exp' } }) + btn('expgo', 'Aufbrechen', { cls: 'primary', dis: why || (!path ? 'Kein Weg' : null) }) };
    }, { live: false, onClose: () => { U.plan = null; } });
  };
  CH.expu = (v, el) => { U.exp.units[el.dataset.k] = +v; U.redrawId('exp'); };
  CH.expc = (v, el) => { U.exp.cargo[el.dataset.k] = +v; U.redrawId('exp'); };
  A.expall = () => { const S = S_(); PW.UNIT_IDS.forEach(k => { if (S.troops[k]) U.exp.units[k] = S.troops[k]; }); U.redrawId('exp'); };
  A.expnone = () => { U.exp.units = {}; U.redrawId('exp'); };
  A.exph = d => { const x = U.exp, k = x.heroes.indexOf(d.h); if (k >= 0) x.heroes.splice(k, 1); else if (x.heroes.length < 2) x.heroes.push(d.h); U.redrawId('exp'); };
  A.expf = d => { U.exp.formation = d.f; U.redrawId('exp'); };
  A.expgo = () => {
    const S = S_(), x = U.exp, o = { target: x.tile, mission: x.mission, units: {}, heroes: x.heroes.slice(), formation: x.formation };
    PW.UNIT_IDS.forEach(k => { if (x.units[k] > 0) o.units[k] = x.units[k]; });
    if (x.mission === 'trade') { o.cargo = {}; for (const k in x.cargo) if (x.cargo[k] > 0) o.cargo[k] = x.cargo[k]; }
    const r = M.send(S, o);
    if (!r.ok) { U.toast(r.why, 'warn'); U.sfx('fehler'); return; }
    U.sfx('marsch'); U.closeModal('exp'); U.plan = null;
  };

  // ================= Diplomatie =================
  P.diplo = function (fid) {
    U.modal('diplo', '🕊️ Diplomatie', ent => {
      const S = S_(), alive = S.factions.filter(f => f.alive), cur = ent.fid || fid || (alive[0] && alive[0].id);
      let b = '';
      if (S.offers.length) b += '<div class="card"><h3>✉️ Angebote an dich</h3>' + S.offers.map(o => '<div class="row"><span class="grow">' + esc(M.ownerName(S, o.from)) + ': <b>' + D.KINDS[o.kind] + '</b> <span class="small muted">(' + T(o.until - S.time) + ')</span></span>' + btn('offer', 'Annehmen', { cls: 'small primary', d: { id: o.id, y: 1 } }) + btn('offer', 'Ablehnen', { cls: 'small', d: { id: o.id, y: 0 } }) + '</div>').join('') + '</div>';
      b += '<div class="row" style="margin:8px 0">' + S.factions.map(f => '<button class="btn small' + (cur === f.id ? ' on' : '') + '" data-act="dsel" data-f="' + f.id + '" style="border-color:' + f.col + (f.alive ? '' : ';opacity:.4') + '">' + PW.FAC[f.id].emblem + ' ' + esc(f.name.replace(/^(Haus|Bund der|Orden vom|Kollegium von|Die|Freie Mark|Rat der) /, '')) + '</button>').join('') + '</div>';
      const f = S.factions.find(x => x.id === cur);
      if (f) {
        const F = PW.FAC[f.id], r = D.rel(S, 'P', f.id), st = D.status(S, 'P', f.id), pw = PW.AI.totalPower(S, f), mine = D.powerOf(S, 'P'), ins = (PW.DIFFICULTY[S.cfg.diff] || {}).insight || 0.8;
        const seen = Wd().explored(S, f.cap);
        b += '<div class="card"><div class="fac"><div class="emblem" style="background:' + f.col + '">' + F.emblem + '</div><div class="grow"><h3>' + esc(f.name) + '</h3><div class="small muted">' + esc(F.leader) + ' · ' + PW.ARCHETYPES[f.arch].name + (f.alive ? '' : ' · ⚰️ zerfallen') + (f.vassalOf ? ' · Vasall von ' + esc(M.ownerName(S, f.vassalOf)) : '') + '</div></div><span class="chip">' + st + '</span></div>';
        if (f.alive) {
          b += '<div class="small">Beziehung ' + Math.round(r.rel) + '</div><div class="relbar"><i style="left:' + (50 + r.rel / 2) + '%"></i></div><div class="small">Vertrauen ' + Math.round(r.trust) + '</div>' + bar(r.trust / 100, 'good') +
            kv([['Stärke', seen ? '≈ ' + fmt(Math.round(pw / 50) * 50) + ' (du: ' + fmt(mine) + ')' : 'unbekannt (Hauptstadt nicht erkundet)'], ['Regionen', Wd().tilesOf(S, f.id).length], ['Ziel', esc(f.goal || '—')], ['Kriege', D.warsOf(S, f.id).map(o => esc(M.ownerName(S, o))).join(', ') || '—'], ['Verbündete', D.alliesOf(S, f.id).map(o => esc(M.ownerName(S, o))).join(', ') || '—'], ['Verträge', [r.trade ? 'Handel' : '', r.nap > S.time ? 'Nichtangriff (' + T(r.nap - S.time) + ')' : '', r.def ? 'Verteidigungspakt' : '', r.ally ? 'Bündnis' : '', r.truce > S.time ? 'Waffenstillstand (' + T(r.truce - S.time) + ')' : ''].filter(Boolean).join(', ') || '—']]);
          // Vorschläge mit Einschätzung
          const kinds = r.war ? ['peace', 'cede'] : ['trade', 'nap', 'def', 'ally'].filter(k => !(k === 'trade' && r.trade) && !(k === 'def' && r.def) && !(k === 'ally' && r.ally) && !(k === 'nap' && r.nap > S.time));
          if (r.ally) kinds.push('aid', 'attack');
          const pk = ent.kind && kinds.indexOf(ent.kind) >= 0 ? ent.kind : kinds[0];
          if (kinds.length) {
            const extra = pk === 'attack' ? { target: U.tile } : pk === 'cede' ? { tile: cedeTile(S, f) } : null, ev = D.evaluate(S, 'P', f.id, pk, extra);
            b += '<hr class="sep"><div class="row">' + kinds.map(k => btn('dkind', D.KINDS[k], { cls: 'small' + (k === pk ? ' on' : ''), d: { k } })).join('') + '</div>' +
              '<div class="small" style="margin-top:6px"><b>Einschätzung:</b> ' + (ev.ok ? '<span class="good">wird wahrscheinlich angenommen</span>' : '<span class="bad">wird wahrscheinlich abgelehnt</span>') + ' (Wert ' + ev.score + ', nötig ' + (ev.need != null ? ev.need : '—') + ')</div><ul class="reasons" style="padding-left:0;list-style:none;margin:4px 0">' + ev.reasons.map(([t, v]) => '<li><span>' + esc(t) + '</span><b class="' + (v > 0 ? 'good' : 'bad') + '">' + (v > 0 ? '+' : '') + v + '</b></li>').join('') + '</ul>' +
              (pk === 'attack' ? '<p class="small muted">Ziel: das auf der Weltkarte gewählte Feld (' + (U.tile >= 0 ? esc(Wd().regionName(S, U.tile)) : 'keins') + ').</p>' : '') + (pk === 'cede' && extra.tile == null ? '<p class="small muted">Keine abtretbare Region an deiner Grenze.</p>' : '') +
              btn('dprop', 'Vorschlagen: ' + D.KINDS[pk], { cls: 'small primary', d: { k: pk } });
          }
          b += '<hr class="sep"><div class="row">' + btn('dgift', '🎁 Geschenk 100 🪙', { cls: 'small', dis: S.res.coin < 100 ? 'Zu wenig Münzen' : null, d: { n: 100 } }) + btn('dgift', '🎁 500 🪙', { cls: 'small', dis: S.res.coin < 500 ? 'Zu wenig Münzen' : null, d: { n: 500 } }) +
            (r.war ? '' : btn('dwar', '⚔️ Krieg erklären', { cls: 'small danger', dis: r.truce > S.time ? 'Waffenstillstand bis ' + T(r.truce - S.time) : null })) + (r.ally ? btn('dcancel', 'Bündnis lösen', { cls: 'small ghost', d: { k: 'ally' } }) : r.def ? btn('dcancel', 'Pakt lösen', { cls: 'small ghost', d: { k: 'def' } }) : '') + btn('dfocus', '🗺️ Zeigen', { cls: 'small ghost' }) + '</div>';
          // Erinnerungen
          const mem = f.mem.filter(m => m.who === 'P').slice(-5).reverse();
          if (mem.length) b += '<div class="small muted" style="margin-top:6px">Erinnert sich: ' + mem.map(m => ({ angriff: 'Angriff', kampf: 'Kampf', hilfe: 'Hilfe', handel: 'Handel', geschenk: 'Geschenk', bruch: 'Vertragsbruch', abgelehnt: 'Ablehnung', vertrag: 'Vertrag' })[m.type] || m.type).join(', ') + '</div>';
        }
        b += '</div>';
      }
      // Weltlage: Blöcke und Kriege zwischen Fraktionen
      const wars = []; D.parties(S).forEach((a, i, all) => all.slice(i + 1).forEach(c => { if (D.rel(S, a, c).war) wars.push(esc(M.ownerName(S, a)) + ' ⚔ ' + esc(M.ownerName(S, c))); }));
      const blocs = D.blocs(S);
      b += '<div class="card" style="margin-top:8px"><h3>🌍 Weltlage</h3><div class="small"><b>Kriege:</b> ' + (wars.join(' · ') || 'keine') + '</div><div class="small"><b>Bündnisblöcke:</b> ' + (blocs.length ? blocs.map(bl => bl.map(x => esc(M.ownerName(S, x))).join(' + ')).join(' · ') : 'keine') + '</div>' +
        (C.lv(S, 'diplomatie') ? '' : '<div class="small warn">Ohne Diplomatiehalle sind Verteidigungspakte und Bündnisse kaum möglich.</div>') + '</div>';
      return b;
    });
  };
  function cedeTile(S, f) {
    const mine = new Set(Wd().tilesOf(S, 'P'));
    const c = Wd().tilesOf(S, f.id).filter(i => i !== f.cap && Wd().neighbors(S.world, i).some(n => mine.has(n)));
    return c.length ? c[0] : null;
  }
  A.dsel = d => { const e = U.find('diplo'); e.fid = d.f; e.kind = null; U.draw(e); };
  A.dkind = d => { const e = U.find('diplo'); e.kind = d.k; U.draw(e); };
  const curFac = () => { const e = U.find('diplo'); const S = S_(); return e && (e.fid || (S.factions.find(f => f.alive) || {}).id); };
  A.dprop = d => {
    const S = S_(), f = curFac(); if (!f) return;
    const fa = S.factions.find(x => x.id === f);
    const extra = d.k === 'attack' ? { target: U.tile } : d.k === 'cede' ? { tile: cedeTile(S, fa) } : null;
    if (d.k === 'attack' && !(U.tile >= 0)) { U.toast('Wähle zuerst auf der Weltkarte ein Ziel-Feld', 'warn'); return; }
    const r = D.propose(S, 'P', f, d.k, extra);
    U.sfx(r.ok ? 'erfolg' : 'fehler'); U.redrawId('diplo');
  };
  A.offer = d => { D.answerOffer(S_(), +d.id, d.y === '1'); U.redrawId('diplo'); };
  A.dgift = d => { const r = D.gift(S_(), curFac(), +d.n); if (!r.ok) U.toast(r.why, 'warn'); U.redrawId('diplo'); };
  A.dwar = () => { const S = S_(), f = curFac(); U.confirm('Krieg erklären', 'Willst du ' + M.ownerName(S, f) + ' wirklich den Krieg erklären? Verbündete und Paktpartner der Gegenseite können eingreifen; gebrochene Verträge kosten Vertrauen bei allen.', 'Krieg erklären', () => { D.declareWar(S, 'P', f, 'deine Entscheidung'); U.redrawId('diplo'); }, true); };
  A.dcancel = d => { D.cancel(S_(), 'P', curFac(), d.k); U.redrawId('diplo'); };
  A.dfocus = () => { const S = S_(), f = S.factions.find(x => x.id === curFac()); if (!f) return; U.closeModal(); U.setMode('world'); PW.R.focusTile(S, f.cap, 20); U.tile = f.cap; U.side(); };

  // ================= Aufgaben, Erfolge, Kampagne, Statistik =================
  P.quests = function (tab) {
    U.modal('quests', '🎯 Aufgaben & Erfolge', ent => {
      const S = S_(), t = ent.tab || tab || 'aufgaben';
      PW.Game.quests(S, new Date());
      let b = tabs([['aufgaben', 'Aufgaben'], ['erfolge', 'Erfolge'], ['kampagne', 'Kampagne'], ['statistik', 'Statistik']], t, 'qtab');
      const qrow = q => { const p = PW.Game.questProgress(S, q), done = p >= q.n; return '<div class="card"><div class="row"><b class="grow">' + esc(q.name) + '</b>' + (q.claimed ? '<span class="chip good">✔ abgeholt</span>' : btn('qclaim', 'Abholen', { cls: 'small' + (done ? ' primary' : ''), dis: done ? null : 'Noch nicht erfüllt', d: { id: q.id, w: S.quests.wlist.indexOf(q) >= 0 ? 1 : 0 } })) + '</div>' + bar(p / q.n, 'good') + '<div class="small">' + Math.max(0, p) + '/' + q.n + ' · Belohnung ' + cost(q.reward, 1, {}) + '</div></div>'; };
      if (t === 'aufgaben') b += '<h3 style="margin-top:8px">📅 Heute</h3><div class="col">' + S.quests.list.map(qrow).join('') + '</div><h3 style="margin-top:8px">🗓️ Diese Woche</h3><div class="col">' + S.quests.wlist.map(qrow).join('') + '</div><p class="small muted">Neue Aufgaben gibt es jeden Tag und jede Woche nach dem Kalender deines Geräts – ohne Server.</p>';
      else if (t === 'erfolge') b += '<p class="small muted" style="margin-top:8px">' + Object.keys(S.ach).length + ' / ' + PW.ACH.length + ' freigeschaltet (erscheinen auch auf der easygames-Erfolgsseite)</p><div class="grid">' + PW.ACH.map(a => '<div class="card' + (S.ach[a.id] ? ' sel' : ' locked') + '"><h3><span class="ico">' + a.icon + '</span>' + esc(a.title) + '</h3><div class="small">' + esc(a.desc) + '</div>' + (S.ach[a.id] ? '' : '<div class="small muted">' + Math.min(a.n, Math.floor(S.stats[a.stat] || 0)) + '/' + a.n + '</div>') + '</div>').join('') + '</div>';
      else if (t === 'kampagne') {
        if (!S.campaign) b += '<p style="margin-top:8px">Dies ist ein freies Spiel. Die Kampagne startest du im Hauptmenü.</p>';
        else { const all = PW.Campaign.all(); b += PW.Campaign.CHAPTERS.map(ch => '<div class="card" style="margin-top:8px"><h3>Kapitel ' + ch.id + ': ' + esc(ch.name) + ' <span class="small muted">' + esc(ch.env) + '</span></h3>' + ch.missions.map(m => { const k = all.findIndex(x => x.id === m.id), st = k < S.campaign.idx ? '✅' : k === S.campaign.idx && !S.campaign.finished ? '▶️' : '🔒'; return '<div class="small">' + st + ' ' + esc(m.name) + ' <span class="muted">· ' + esc(m.type) + '</span></div>'; }).join('') + '</div>').join(''); }
      } else {
        const st = S.stats;
        b += '<div style="margin-top:8px">' + kv([['Spielzeit', T(S.time)], ['Bauaufträge', st.built || 0], ['Geheilt', Math.floor(st.cured || 0)], ['Angesteckt', Math.floor(st.infected || 0)], ['Verstorben', S.pop.dead], ['Aufgenommen', Math.floor((st.arrived || 0) + (st.rescued || 0))], ['Wellen abgewehrt / verloren', (st.waves || 0) + ' / ' + (st.wavesLost || 0)], ['Schlachten gewonnen / verloren', (st.battlesWon || 0) + ' / ' + (st.battlesLost || 0)], ['Expeditionen', st.expeditions || 0], ['Karawanen', st.trades || 0], ['Forschungen', st.researched || 0], ['Meiste Regionen', st.maxTiles || 0], ['Meiste Bewohner', st.maxPop || 0]]) + '</div>';
        b += '<h3 style="margin-top:10px">Fraktionen</h3><table class="t"><tr><th>Fraktion</th><th class="num">Regionen</th><th class="num">Ratshaus</th><th class="num">Siege</th></tr>' + S.factions.map(f => '<tr><td><span style="color:' + f.col + '">■</span> ' + esc(f.name) + (f.alive ? '' : ' ⚰️') + '</td><td class="num">' + Wd().tilesOf(S, f.id).length + '</td><td class="num">' + (Wd().explored(S, f.cap) ? f.bld.hq : '?') + '</td><td class="num">' + (f.st.won || 0) + '</td></tr>').join('') + '</table>';
      }
      return b;
    });
  };
  A.qtab = setTab('quests');
  A.qclaim = d => { const S = S_(), q = (d.w === '1' ? S.quests.wlist : S.quests.list).find(x => x.id === d.id); if (q && PW.Game.claimQuest(S, q)) U.sfx('erfolg'); U.redrawId('quests'); };

  // ================= Beobachtete Schlacht =================
  P.watchBattle = function (a, bt, d) {
    const S = S_();
    if (U.battle) { PW.Battle.run(bt); M.resolveAssault(S, a, bt, d); a.work = 0; return; }   // zweite Schlacht gleichzeitig: sofort auswerten
    U.battle = { a, bt, d, prev: U.mode, speed: 1, acc: 0, done: false, wasPaused: S.paused };
    S.paused = true;
    U.ui.bview = bt; U.ui.battleMine = 0; U.ui.battleFocus = -1;
    U.closeModal(null, true);
    U.mode = 'battle'; PW.R.setMode('battle'); PW.R.rigs.battle.tx = 4; PW.R.rigs.battle.tz = 0;
    U.sfx('schwert');
    U.side._t = 0; P.battleSide();
  };
  P.battleStep = function (dt) {
    const B = U.battle; if (!B || B.done) return;
    B.acc += dt * B.speed;
    while (B.acc >= 0.2 && !B.bt.done) { B.acc -= 0.2; PW.Battle.step(B.bt, 0.2); }
    if (B.bt.done) { B.done = true; P.endBattle(); }
  };
  P.battleSide = function () {
    const B = U.battle, el = U.$('#side'); if (!B) return;
    const b = B.bt, row = (q, i) => '<div class="squad' + (q.n <= 0 ? ' dead' : '') + (b.focus[0] === i ? ' foc' : '') + '" data-act="bfoc" data-i="' + i + '"><b>' + esc(q.name) + '</b> ' + (q.kind === 'hero' ? '' : q.n + '/' + q.n0) + U.bar(q.hp / Math.max(1, q.maxHp), 'hp') + '</div>';
    const p0 = PW.Battle.sidePower(b, 0), p1 = PW.Battle.sidePower(b, 1);
    let h = '<div class="row small"><span class="grow">⏱ ' + Math.floor(b.t) + ' s · ' + esc(b.terrain) + (b.wallMax ? ' · 🧱 ' + Math.round(b.wall) + '/' + b.wallMax : '') + '</span>' + [1, 2, 4].map(s => btn('bspd', s + '×', { cls: 'small' + (B.speed === s ? ' on' : ''), d: { s } })).join('') + '</div>' +
      '<div class="small">Kräfteverhältnis</div><div class="bar good"><i style="width:' + Math.round(p0 / Math.max(1, p0 + p1) * 100) + '%"></i></div>' +
      '<div class="squads"><div><div class="small good">' + esc(b.names[0]) + '</div>' + b.sq.map((q, i) => q.s === 0 ? row(q, i) : '').join('') + '</div><div><div class="small bad">' + esc(b.names[1]) + '</div>' + b.sq.map((q, i) => q.s === 1 ? row(q, i) : '').join('') + '</div></div>' +
      '<div class="small muted">Tippe einen feindlichen Trupp an, um alle Angriffe auf ihn zu richten.</div>' +
      '<div class="row">' + b.sq.map((q, i) => q.s === 0 && q.kind === 'hero' && q.skill ? btn('bskill', (q.skill.t > 0 ? '⚡' + Math.round(PW.Battle.energy(q) * 100) + '% ' : '✨ ') + esc(PW.HERO[q.heroId] ? PW.HERO[q.heroId].skill.name : 'Fähigkeit'), { cls: 'small', dis: PW.Battle.canSkill(b, i) ? null : 'Noch nicht bereit', d: { i } }) : '').join('') + '</div>' +
      '<div class="row"><label class="check small"><input type="checkbox" data-ch="bauto" ' + (b.auto[0] ? 'checked' : '') + '> Automatisch kämpfen</label></div>' +
      '<div class="row">' + btn('bretreat', '🏳️ Rückzug', { cls: 'small danger' }) + btn('bskip', '⏭ Sofort auswerten', { cls: 'small' }) + '</div>';
    el.hidden = false; el.querySelector('h3').innerHTML = '⚔️ ' + esc(B.d.capital ? 'Belagerung' : 'Gefecht') + ' · ' + esc(Wd().regionName(S_(), B.a.target)); const body = el.querySelector('.body'); if (body._h !== h && !U.pressed) { body.innerHTML = h; body._h = h; }
  };
  A.bspd = d => { U.battle.speed = +d.s; };
  A.bfoc = d => { const b = U.battle.bt, i = +d.i; if (b.sq[i] && b.sq[i].s === 1) { b.focus[0] = b.focus[0] === i ? -1 : i; U.ui.battleFocus = b.focus[0]; } };
  A.bskill = d => { if (PW.Battle.skill(U.battle.bt, +d.i)) U.sfx('schwert'); };
  CH.bauto = (v, el) => { U.battle.bt.auto[0] = el.checked; };
  A.bretreat = () => { PW.Battle.retreat(U.battle.bt, 0); };
  A.bskip = () => { const b = U.battle.bt; let g = 0; while (!b.done && g++ < 2000) PW.Battle.step(b, 0.2); };
  P.battleTap = function (cx, cy) { const i = PW.R.pickSquad(cx, cy); if (i >= 0) A.bfoc({ i }); };
  P.endBattle = function (silent) {
    const B = U.battle; if (!B) return;
    const S = S_();
    if (!B.bt.done) { let g = 0; while (!B.bt.done && g++ < 2000) PW.Battle.step(B.bt, 0.2); }
    B.a.work = 0;
    const r = M.resolveAssault(S, B.a, B.bt, B.d);
    U.battle = null; U.ui.bview = null; S.paused = B.wasPaused;
    U.mode = B.prev === 'battle' ? 'world' : B.prev; PW.R.setMode(U.mode); U.side._t = 0; U.side();
    if (silent) return;
    const won = r.won, s0 = r.r.sides[0], s1 = r.r.sides[1], lost = o => PW.UNIT_IDS.filter(k => (o.lost[k] || 0) + (o.wounded[k] || 0) > 0).map(k => ((o.lost[k] || 0) + (o.wounded[k] || 0)) + ' ' + PW.UNITS[k].icon).join(' ') || '—';
    U.sfx(won ? 'sieg' : 'niederlage');
    U.modal('bres', won ? '🏆 Sieg!' : r.r.fled === 0 ? '🏳️ Rückzug' : '💀 Niederlage', () => '<p>' + esc(r.rep ? r.rep.extra || '' : '') + '</p>' + kv([['Dauer', r.r.t + ' s'], ['Eigene Verluste', lost(s0)], ['Gegnerische Verluste', lost(s1) + (Object.keys(s1.mon || {}).length ? ' (Seuchenwesen)' : '')], ['Erfahrung', '+' + s0.xp]]) + '<p class="small muted">Überlebende kehren mit Verwundeten heim.</p>', { size: 'narrow' });
  };
  // Seitenfenster im Schlachtmodus
  const side0 = U.side;
  U.side = function () { if (U.mode === 'battle') { U.side._t = performance.now(); P.battleSide(); return; } side0(); };

  // ================= Lazarett =================
  P.ward = function () {
    U.modal('ward', '🩺 Lazarett', ent => {
      const S = S_(), WD = PW.Ward, W = WD.state(S), t = ent.tab || 'patienten', cap = WD.cap(S);
      let b = tabs([['patienten', 'Patienten (' + W.list.length + '/' + cap + ')'], ['garten', 'Kräuterbeete'], ['personal', 'Personal']], t, 'wtab');
      if (!cap) return { body: b + '<p class="muted" style="margin-top:8px">Baue eine <b>Heilstube</b>, um Kranke einzeln zu pflegen. Je höher Heilstube und Lazarett, desto mehr Patienten passen hinein.</p>' + btn('nav', '🔨 Bauen', { d: { id: 'bauen' } }) };
      if (t === 'patienten') {
        if (!W.list.length) b += '<p class="muted" style="margin-top:8px">Gerade wartet niemand. Neue Kranke kommen, solange in der Zuflucht jemand krank ist (' + WD.sickN(S) + ').</p>';
        b += '<div class="grid" style="margin-top:8px">' + W.list.map(c => {
          const sy = WD.SYM[c.sym], cu = WD.cureOf(c), known = c.st !== 'wartet';
          let act = '';
          if (c.st === 'wartet') act = btn('wexam', '🔍 Untersuchen', { cls: 'primary', d: { id: c.id } });
          else if (c.st === 'untersucht') { const why = WD.why(S, c, 'treat'); act = '<div class="small">' + cu.icon + ' ' + esc(cu.name) + ': ' + cost(cu.cost) + '</div>' + btn('wtreat', 'Behandeln', { cls: 'primary', dis: why, d: { id: c.id } }); }
          else if (c.st === 'behandlung') act = '<div class="small">' + cu.icon + ' ' + esc(cu.name) + ' wirkt … ' + Math.ceil(c.t) + ' s</div>' + bar(1 - c.t / (c.tot || 1), 'good');
          else act = btn('wout', '💚 Entlassen · ' + PW.costText(WD.reward(S, c)), { cls: 'primary', d: { id: c.id } });
          return '<div class="card' + (c.vip != null ? ' sel' : '') + '"><h3><span class="ico">' + (c.vip != null ? '🎩' : known ? sy.icon : '❓') + '</span>' + esc(c.name) + '</h3>' +
            '<div class="small muted">' + esc(c.job) + ' · ' + '🔥'.repeat(c.sev) + (known ? ' · ' + esc(sy.name) : ' · ' + esc(sy.hint)) + '</div>' +
            '<div class="small">Lebenskraft</div>' + bar(c.hp / 100, c.hp < 35 ? 'hp' : 'good') + act + '</div>';
        }).join('') + '</div><p class="small muted" style="margin-top:8px">Untersuchen zeigt die Krankheit und das passende Mittel. Wartende verlieren Lebenskraft – schwere Fälle (🔥🔥🔥) schneller. Gäste mit 🎩 zahlen besonders gut.</p>';
      } else if (t === 'garten') {
        const n = WD.bedCount(S);
        if (!n) b += '<p class="muted" style="margin-top:8px">Baue einen <b>Kräutergarten</b>. Jede Stufe gibt ein weiteres Beet (höchstens 6).</p>';
        else {
          b += '<div class="grid" style="margin-top:8px">';
          for (let i = 0; i < n; i++) {
            const bd = W.beds[i] || { st: 'leer' };
            if (bd.st === 'leer') b += '<div class="card"><h3><span class="ico">🟫</span>Beet ' + (i + 1) + '</h3>' + Object.keys(WD.SEEDS).map(k => { const sd = WD.SEEDS[k]; return btn('wplant', sd.icon + ' ' + sd.name + ' · ' + T(sd.time), { cls: 'small', dis: PW.canPay(S.res, sd.cost) ? null : 'Es fehlt: ' + PW.costText(PW.missing(S.res, sd.cost)), d: { i, k }, title: 'Kosten ' + PW.costText(sd.cost) + ' → Ernte ' + PW.costText(sd.yield) }); }).join('') + '</div>';
            else if (bd.st === 'waechst') b += '<div class="card"><h3><span class="ico">🌱</span>' + esc(WD.SEEDS[bd.seed].name) + '</h3><div class="small">reif in ' + T(bd.t) + '</div>' + bar(1 - bd.t / bd.tot, 'good') + '</div>';
            else b += '<div class="card sel"><h3><span class="ico">' + WD.SEEDS[bd.seed].icon + '</span>' + esc(WD.SEEDS[bd.seed].name) + ' ist reif</h3>' + btn('wharv', '🧺 Ernten · ' + PW.costText(WD.SEEDS[bd.seed].yield), { cls: 'primary', d: { i } }) + '</div>';
          }
          b += '</div>';
        }
      } else {
        b += '<div class="grid" style="margin-top:8px">' + Object.keys(WD.STAFF).map(k => {
          const st = WD.STAFF[k], mx = WD.staffMax(S, k), c = WD.hireCost(S, k), has = W.staff[k];
          const dis = mx <= 0 ? 'Heilstube Stufe ' + st.lv + ' nötig' : has >= mx ? 'Mehr mit höherer Heilstube' : PW.canPay(S.res, c) ? null : 'Zu wenig Münzen';
          return '<div class="card"><h3><span class="ico">' + st.icon + '</span>' + st.name + ' · ' + has + '/' + Math.max(0, mx) + '</h3><div class="small">' + esc(st.desc) + '</div>' + btn('whire', 'Einstellen · ' + PW.costText(c), { cls: 'small', dis, d: { k } }) + '</div>';
        }).join('') + '</div>';
      }
      return { body: b };
    }, { live: true });
  };
  A.wtab = setTab('ward');
  const wdo = (ok, s) => { if (ok) { U.sfx(s || 'klick'); U.redrawId('ward'); U.hud(true); U.buildNav(); } else U.sfx('fehler'); };
  A.wexam = d => wdo(PW.Ward.exam(S_(), +d.id));
  A.wtreat = d => wdo(PW.Ward.treat(S_(), +d.id), 'bau');
  A.wout = d => wdo(PW.Ward.discharge(S_(), +d.id), 'erfolg');
  A.wplant = d => wdo(PW.Ward.plant(S_(), +d.i, d.k));
  A.wharv = d => wdo(PW.Ward.harvest(S_(), +d.i), 'fertig');
  A.whire = d => wdo(PW.Ward.hire(S_(), d.k), 'glocke');
  U.ui = U;   // Render-Zustand liegt direkt am UI-Objekt

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);

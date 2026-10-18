/* Spinwelten 3D – Fenster: Sammlung, Begleiter, Aufgabenbuch, Erfolge, Verlauf, Minispiele, Einstellungen, Anleitung, Profil. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en), tx = o => SW.tx(o), F = n => SW.fmt(n);
  const UI = () => SW.UI, A = () => SW.App, G = () => SW.App.g;
  const h = (...a) => SW.UI.h(...a), btn = (...a) => SW.UI.btn(...a);
  const P = {};
  function item(icon, title, sub, right, cls) {
    const ic = typeof icon === 'string' && icon.startsWith('data:') ? h('img', { cls: 'av', src: icon, alt: '' }) : h('div', { cls: 'av', style: 'display:grid;place-items:center;font-size:26px' }, icon);
    return h('div', { cls: 'item ' + (cls || '') }, [ic, h('div', { cls: 'tx' }, [h('b', null, title), sub ? (typeof sub === 'string' ? h('small', null, sub) : sub) : null]), right || null]);
  }
  function err(code) {
    const M = { coins: L('Nicht genug Münzen.', 'Not enough coins.'), relics: L('Nicht genug Relikte.', 'Not enough relics.'), snacks: L('Keine Leckerli übrig.', 'No treats left.'), none: L('Nichts vorhanden.', 'Nothing there.'),
      daily: L('Heute schon gekauft.', 'Already bought today.'), full: L('Schon voll.', 'Already full.'), max: L('Höchste Stufe erreicht.', 'Maximum level reached.'), done: L('Heute schon erledigt.', 'Already done today.'), locked: L('Noch nicht freigeschaltet.', 'Not unlocked yet.'), notready: L('Noch nicht erfüllt.', 'Not completed yet.'), gone: L('Angebot nicht mehr gültig.', 'Offer no longer valid.') };
    UI().toast(M[code] || L('Geht gerade nicht.', 'Not possible right now.')); if (SW.Audio) SW.Audio.sfx('error');
  }
  function done(res, okText) { A().after(); if (res && res.error) { err(res.error); return false; } if (okText) UI().toast(okText); UI().rerender(); return true; }

  // ---------- Sammlung ----------
  function cardEl(c, n, onClick) {
    const have = n > 0, b = h('button', { cls: 'card' + (have ? '' : ' lock'), type: 'button', style: 'border-color:' + SW.RARITY[c.r].col, 'aria-label': have ? tx(c.name) : L('Unbekannte Karte', 'Unknown card') },
      [h('img', { src: SW.Symbols.cardUrl(c, 160), alt: '', loading: 'lazy' }), n > 1 ? h('span', { cls: 'n' }, '×' + n) : null, h('span', { cls: 'cap' }, have ? tx(c.name) : '???')]);
    b.addEventListener('click', () => onClick && onClick(c, n)); return b;
  }
  function showCard(c, n) {
    const node = h('div', null, [h('img', { src: SW.Symbols.cardUrl(c, 320), alt: '', style: 'width:200px;border-radius:14px;border:3px solid ' + SW.RARITY[c.r].col }),
      h('p', null, h('b', { style: 'color:' + SW.RARITY[c.r].col }, tx(SW.RARITY[c.r].name))), h('p', null, n > 0 ? tx(c.flavor) : L('Diese Karte hast du noch nicht gefunden.', 'You have not found this card yet.')),
      n > 1 ? h('p', { cls: 'note' }, L('Doppelt: ', 'Duplicates: ') + (n - 1)) : null]);
    UI().dialog({ title: n > 0 ? tx(c.name) : '???', node });
  }
  function albums(body, ctx) {
    const g = G(), s = g.s, max = g.cardPoolMax();
    body.appendChild(h('p', { cls: 'note' }, L(`Karten: ${g.uniqueCards()} / 240 · Alben komplett: ${Object.keys(s.albumsDone).length} / 30. Neue Alben öffnen sich mit jeder erreichten Insel.`, `Cards: ${g.uniqueCards()} / 240 · Albums complete: ${Object.keys(s.albumsDone).length} / 30. New albums open with each island you reach.`)));
    const grid = h('div', { cls: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(140px,1fr))' });
    SW.WORLDS.forEach(w => {
      const pr = g.albumProgress(w.n), open = w.n <= max;
      const b = h('button', { cls: 'alb' + (open ? '' : ' lock') + (s.albumsDone[w.n] ? ' done' : ''), type: 'button' }, [h('b', null, (s.albumsDone[w.n] ? '★ ' : '') + tx(w.album || w.name)), h('small', { cls: 'note' }, w.n + '. ' + tx(w.name)), UI().prog(pr.have, pr.total), h('small', null, pr.have + ' / ' + pr.total)]);
      b.addEventListener('click', () => { if (!open) { UI().toast(L('Erreiche zuerst Insel ', 'Reach island ') + w.n); return; } ctx.album = w.n; albumDetail(body, w, ctx); });
      grid.appendChild(b);
    });
    body.appendChild(grid);
  }
  function albumDetail(body, w, ctx) {
    const g = G(); body.innerHTML = '';
    body.appendChild(h('div', { cls: 'row' }, [btn('← ' + L('Alben', 'Albums'), () => ctx.rerender(), 'small'), h('b', null, tx(w.album || w.name))]));
    const pr = g.albumProgress(w.n); body.appendChild(h('p', { cls: 'note' }, L('Belohnung für das volle Album: Spins, Relikte und eine Truhe.', 'Full album reward: spins, relics and a chest.') + ' ' + pr.have + '/' + pr.total));
    const grid = h('div', { cls: 'grid' });
    SW.CARDS.filter(c => c.w === w.n).forEach(c => grid.appendChild(cardEl(c, g.s.cards[c.id] || 0, showCard)));
    body.appendChild(grid);
  }
  function chests(body) {
    const g = G(), s = g.s;
    body.appendChild(h('p', { cls: 'note' }, L('Truhen bekommst du im Spiel (Reliktrunen, Inseln, Alben, Ziele). Sie kosten nie echtes Geld. Die Chancen stehen offen dabei.', 'You earn chests in the game (relic runes, islands, albums, goals). They never cost real money. The odds are shown openly.')));
    const list = h('div', { cls: 'list' });
    for (const k of Object.keys(SW.CHESTS)) {
      const C = SW.CHESTS[k], n = s.chests[k] || 0;
      const odds = C.odds.map((o, i) => tx(SW.RARITY[i].name) + ' ' + o + ' %').join(' · ');
      list.appendChild(item('🎁', tx(C.name) + ' ×' + n, L(C.cards + ' Karten · ', C.cards + ' cards · ') + odds, btn(L('Öffnen', 'Open'), () => A().openChest(k), n ? 'gold small' : 'small', { disabled: !n })));
    }
    body.appendChild(list);
  }
  function shop(body) {
    const g = G(), s = g.s;
    body.appendChild(h('p', { cls: 'note' }, L(`Tausche Relikte (🔷 ${F(s.relics)}) gegen Truhen und Hilfen. Relikte gibt es nur im Spiel – es gibt keine Käufe mit echtem Geld.`, `Trade relics (🔷 ${F(s.relics)}) for chests and helpers. Relics only come from playing – there are no real-money purchases.`)));
    const list = h('div', { cls: 'list' });
    for (const it of SW.SHOP) {
      const name = it.kind === 'chest' ? tx(SW.CHESTS[it.arg].name) : it.kind === 'snack' ? L('3 Leckerli', '3 treats') : L('Schutzorb (1 pro Tag)', 'Shield orb (1 per day)');
      list.appendChild(item(it.kind === 'chest' ? '🎁' : it.kind === 'snack' ? '🍪' : '🛡️', name, '🔷 ' + it.price, btn(L('Tauschen', 'Trade'), () => { const r = g.buy(it.id); if (done(r, L('Getauscht!', 'Traded!')) && it.kind === 'chest') A().openChest(it.arg); }, 'small', { disabled: s.relics < it.price })));
    }
    body.appendChild(list);
    body.appendChild(h('div', { cls: 'sec' }, L('Doppelte Karten', 'Duplicate cards')));
    const l2 = h('div', { cls: 'list' });
    SW.RARITY.forEach((r, i) => { const n = g.dupCount(i); l2.appendChild(item('🃏', tx(r.name) + ': ' + n, L('je Karte 🔷 ', 'per card 🔷 ') + r.dupRelics, btn(L('Eintauschen', 'Exchange'), () => { const x = g.exchangeDups(i); if (done(x)) UI().toast('+🔷 ' + x.relics); }, 'small', { disabled: !n }))); });
    body.appendChild(l2);
  }
  function trade(body) {
    const g = G();
    body.appendChild(h('p', { cls: 'note' }, L('Händler (Computer-Spieler, als 🤖 markiert) bieten dir Tausch gegen deine doppelten Karten an. Online-Tausch mit echten Spielern geht nur mit Spinwelten-Server.', 'Traders (computer players, marked 🤖) offer swaps for your duplicate cards. Online trading with real players requires a Spinwelten server.')));
    const offers = g.botTrades(), list = h('div', { cls: 'list' });
    if (!offers.length) list.appendChild(h('p', { cls: 'note' }, L('Gerade keine Angebote. Sammle doppelte Karten – morgen gibt es neue Händler.', 'No offers right now. Collect duplicates – new traders arrive tomorrow.')));
    offers.forEach(o => {
      const bot = SW.BOTS.find(b => b.id === o.bot) || { name: '?' };
      const sub = h('small', null, [L('Will: ', 'Wants: ') + (o.want ? tx(o.want.name) : '–') + ' · ' + L('Gibt: ', 'Gives: ') + (o.give ? tx(o.give.name) : o.relics ? '🔷 ' + o.relics : '–')]);
      list.appendChild(item(SW.Symbols.avatar(bot.look, 64), bot.name + ' 🤖', sub, btn(o.done ? '✓' : L('Tauschen', 'Swap'), () => { const r = g.acceptBotTrade(o.key); if (done(r, L('Tausch erledigt!', 'Swap done!'))) A().save(); }, 'small', { disabled: !!o.done || !o.want || !(o.give || o.relics) })));
    });
    body.appendChild(list);
  }
  P.collection = tab => UI().sheet(L('Sammlung', 'Collection'), [
    { id: 'albums', label: L('Alben', 'Albums'), render: albums },
    { id: 'chests', label: L('Truhen', 'Chests'), render: chests },
    { id: 'shop', label: L('Reliktladen', 'Relic shop'), render: shop },
    { id: 'trade', label: L('Tausch', 'Trade'), render: trade }], tab);

  // ---------- Begleiter ----------
  function unlockText(d) {
    if (!d.unlock) return L('Von Anfang an dabei', 'With you from the start');
    const names = { islands: ['Inseln abschließen', 'complete islands'], raids: ['Schatzexpeditionen', 'treasure expeditions'], blocks: ['Stürme abwehren', 'block storms'], attacks: ['Sturmangriffe', 'storm attacks'], builds: ['Ausbaustufen', 'upgrade stages'], cards: ['verschiedene Karten', 'different cards'], spins: ['Spins', 'spins'], chests: ['Truhen öffnen', 'open chests'], event_points: ['Eventpunkte', 'event points'] };
    const nm = names[d.unlock.stat] || [d.unlock.stat, d.unlock.stat];
    const v = d.unlock.stat === 'cards' ? G().uniqueCards() : (G().s.stats[d.unlock.stat] || 0);
    return L('Freischalten: ', 'Unlock: ') + d.unlock.n + ' ' + L(nm[0], nm[1]) + ' (' + Math.min(v, d.unlock.n) + '/' + d.unlock.n + ')';
  }
  function compPanel(body, ctx) {
    const g = G(), s = g.s, sel = ctx.sel || s.active;
    const top = h('div', { cls: 'row', style: 'justify-content:center' });
    const d = SW.COMPANIONS.find(c => c.id === sel), c = s.comps[sel];
    A().showStage('comp', d, c ? c.lvl : 1);
    const info = h('div', { cls: 'list' });
    if (c) {
      const need = g.xpNeed(sel), cost = g.trainCost(sel), today = SW.Clock.dayKey(g.now());
      info.appendChild(item('⭐', tx(d.name) + ' · ' + L('Stufe ', 'Level ') + c.lvl + '/' + SW.COMP_MAX_LVL, h('div', null, [h('small', null, tx(d.skill)), UI().prog(c.xp, need), h('small', null, 'XP ' + c.xp + '/' + need)])));
      const row = h('div', { cls: 'row' }, [
        btn(s.active === sel ? L('Aktiv ✓', 'Active ✓') : L('Aktiv setzen', 'Set active'), () => done(g.setActive(sel)), s.active === sel ? 'jade small' : 'small'),
        btn(s.helper === sel ? L('Helfer ✓', 'Helper ✓') : L('Als Helfer', 'As helper'), () => done(g.setHelper(sel)), s.helper === sel ? 'jade small' : 'small', { disabled: s.active === sel }),
        btn(L('Trainieren', 'Train') + ` (🔷${cost.relics} 🪙${F(cost.coins)})`, () => { const r = g.train(sel, false); if (done(r)) { SW.Audio.sfx('level'); if (r.up) UI().toast(L('Stufe aufgestiegen!', 'Level up!')); } }, 'small', { disabled: c.lvl >= SW.COMP_MAX_LVL }),
        btn(L('Mit Leckerli 🍪 ', 'With treat 🍪 ') + s.snacks, () => { const r = g.train(sel, true); if (done(r) && r.up) UI().toast(L('Stufe aufgestiegen!', 'Level up!')); }, 'small', { disabled: !s.snacks || c.lvl >= SW.COMP_MAX_LVL }),
        btn(c.care === today ? L('Gepflegt ✓', 'Cared ✓') : L('Pflegen', 'Care'), () => done(g.care(sel), L('Glücklich! +XP', 'Happy! +XP')), 'small', { disabled: c.care === today })]);
      info.appendChild(row);
      info.appendChild(h('p', { cls: 'note' }, L('Aktiv = volle Wirkung, Helfer = halbe Wirkung. Pflegen geht einmal am Tag.', 'Active = full effect, helper = half effect. Care works once a day.')));
    } else info.appendChild(item('🔒', tx(d.name), unlockText(d)));
    body.appendChild(top); body.appendChild(info);
    body.appendChild(h('div', { cls: 'sec' }, L('Alle Begleiter', 'All companions')));
    const grid = h('div', { cls: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(120px,1fr))' });
    SW.COMPANIONS.forEach(cd => {
      const cc = s.comps[cd.id], b = h('button', { cls: 'alb' + (cc ? '' : ' lock') + (cd.id === sel ? ' done' : ''), type: 'button' }, [h('b', null, tx(cd.name) + (s.active === cd.id ? ' ★' : s.helper === cd.id ? ' ☆' : '')), h('small', { cls: 'note' }, cc ? L('Stufe ', 'Level ') + cc.lvl : unlockText(cd))]);
      b.addEventListener('click', () => { ctx.sel = cd.id; compPanel(clear(body), ctx); }); grid.appendChild(b);
    });
    body.appendChild(grid);
  }
  function clear(b) { b.innerHTML = ''; return b; }
  P.companions = () => UI().sheet(L('Begleiter', 'Companions'), [{ id: 'c', label: '', render: (b, ctx) => compPanel(b, ctx) }], 'c', () => A().hideStage());

  // ---------- Aufgabenbuch ----------
  function quests(body) {
    const g = G(), aq = g.activeQuests(), ch = SW.CHAPTERS[g.ngp > 0 ? 5 : g.chapter()];
    body.appendChild(h('p', { cls: 'note' }, L('Kapitel ', 'Chapter ') + (g.chapter() + 1) + ': ' + tx(ch.name) + ' · ' + L('erledigt ', 'done ') + Object.keys(g.s.quests.done).length + '/60'));
    const list = h('div', { cls: 'list' });
    if (!aq.length) list.appendChild(h('p', null, L('Alle Aufgaben dieses Kapitels sind erledigt. Weiter zur nächsten Insel!', 'All quests of this chapter are done. On to the next island!')));
    aq.forEach(a => list.appendChild(item('📜', tx(a.q.title), h('div', null, [h('small', null, a.q.giver + ': ' + tx(a.q.text)), UI().prog(a.v, a.q.n), h('small', null, a.v + '/' + a.q.n + ' · ' + UI().rwText(rwPreview(a.q.reward)))]),
      btn(a.ready ? L('Abholen', 'Claim') : '…', () => { const r = g.claimQuest(a.q.id); if (done(r)) { SW.Audio.sfx('win'); UI().reward(L('Aufgabe erfüllt!', 'Quest complete!'), UI().rwText(r.rw)); if (r.chapterDone >= 0 && SW.CHAPTERS[r.chapterDone]) UI().dialog({ title: tx(SW.CHAPTERS[r.chapterDone].name), text: tx(SW.CHAPTERS[r.chapterDone].finale) }); } }, a.ready ? 'gold small' : 'small', { disabled: !a.ready }))));
    body.appendChild(list);
  }
  function rwPreview(r) { const b = G().base(); return { coins: r.coins ? r.coins * b : 0, spins: r.spins, relics: r.relics, chest: r.chest, snacks: r.snacks }; }
  function goals(body, weekly) {
    const g = G(), list = h('div', { cls: 'list' }), arr = weekly ? g.weeklyGoals() : g.dailyGoals();
    const end = weekly ? SW.Clock.nextWeek ? SW.Clock.nextWeek(g.now()) : 0 : 0; void end;
    body.appendChild(h('p', { cls: 'note' }, weekly ? L('Wochenziele: je 40 Spins und eine Goldtruhe.', 'Weekly goals: 40 spins and a gold chest each.') : L('Tagesziele: je 10 Spins und 8 Relikte. Neue Ziele um Mitternacht.', 'Daily goals: 10 spins and 8 relics each. New goals at midnight.')));
    arr.forEach(x => list.appendChild(item(weekly ? '🗓️' : '☀️', tx(x.g.name), h('div', null, [UI().prog(x.v, x.g.n), h('small', null, x.v + '/' + x.g.n)]),
      btn(x.done ? '✓' : L('Abholen', 'Claim'), () => { const r = g.claimGoal(weekly, x.i); if (done(r)) UI().reward('🎉', UI().rwText(r.rw)); }, !x.done && x.v >= x.g.n ? 'gold small' : 'small', { disabled: x.done || x.v < x.g.n }))));
    if (!weekly) {
      const d = g.s.daily; list.appendChild(item('🎁', L('Täglicher Gratis-Bonus', 'Daily free bonus'), L(g.prof.dailySpins + ' Spins + Münzen, einmal pro Kalendertag', g.prof.dailySpins + ' spins + coins, once per calendar day'),
        btn(d.bonus ? '✓' : L('Abholen', 'Claim'), () => { const r = g.claimDaily(); if (r) { A().after(); UI().reward('+' + r.spins + ' ⚡', '🪙 ' + F(r.coins)); UI().rerender(); } }, d.bonus ? 'small' : 'gold small', { disabled: d.bonus })));
    }
    body.appendChild(list);
  }
  function eventTab(body) {
    const g = G(), cur = SW.Clock.eventAt(g.now()), e = cur.def, s = g.s, left = cur.end - g.now();
    body.appendChild(item(e.icon, tx(e.name), tx(e.desc) + ' · ' + L('endet in ', 'ends in ') + SW.Clock.fmtDur(left, SW.lang)));
    body.appendChild(h('p', { cls: 'note' }, L('Punkte: ', 'Points: ') + F(s.ev.pts) + L(' · Belohnungen kommen automatisch, sobald eine Stufe erreicht ist.', ' · Rewards arrive automatically when a tier is reached.')));
    const pts = Object.keys(e.pts).map(k => k.replace('sym_', '✦ ') + ' +' + e.pts[k]).join(' · ');
    body.appendChild(h('p', { cls: 'note' }, L('Punktequellen: ', 'Point sources: ') + pts));
    const list = h('div', { cls: 'list' });
    SW.EVENT_TIERS.forEach((t, i) => list.appendChild(item(s.ev.claimed.includes(i) ? '✅' : '🎯', t.at + L(' Punkte', ' points'), UI().rwText(rwPreview(t.reward)), null, s.ev.claimed.includes(i) ? 'done' : '')));
    body.appendChild(list);
    body.appendChild(h('div', { cls: 'sec' }, L('Kalender', 'Calendar')));
    const cal = h('div', { cls: 'list' });
    for (let k = 1; k <= 3; k++) { const n = SW.Clock.eventAt(cur.end + 1 + (k - 1) * SW.EVENT_DAYS * SW.Clock.D); cal.appendChild(item(n.def.icon, tx(n.def.name), L('ab ', 'from ') + new Date(n.start).toLocaleDateString(SW.lang === 'en' ? 'en-GB' : 'de-DE'))); }
    body.appendChild(cal);
  }
  P.quests = tab => UI().sheet(L('Aufgabenbuch', 'Quest book'), [
    { id: 'q', label: L('Story', 'Story'), render: quests },
    { id: 'd', label: L('Täglich', 'Daily'), render: b => goals(b, false) },
    { id: 'w', label: L('Woche', 'Week'), render: b => goals(b, true) },
    { id: 'e', label: 'Event', render: eventTab }], tab);

  // ---------- Erfolge ----------
  P.achievements = () => UI().sheet(L('Erfolge', 'Achievements'), [{ id: 'a', label: '', render: body => {
    const g = G(), s = g.s, n = Object.keys(s.ach).length;
    body.appendChild(h('p', { cls: 'note' }, n + ' / ' + SW.ACHIEVEMENTS.length + L(' freigeschaltet · je 5 Relikte', ' unlocked · 5 relics each')));
    const list = h('div', { cls: 'list' });
    SW.ACHIEVEMENTS.slice().sort((a, b) => (!!s.ach[b.id]) - (!!s.ach[a.id])).forEach(a => {
      const v = a.stat === 'cards' ? g.uniqueCards() : a.stat === 'albums' ? Object.keys(s.albumsDone).length : (s.stats[a.stat] || 0);
      list.appendChild(item(a.icon, tx(a.name), h('div', null, [h('small', null, tx(a.desc)), s.ach[a.id] ? null : UI().prog(v, a.n)]), s.ach[a.id] ? h('span', null, '✅') : h('small', null, F(Math.min(v, a.n)) + '/' + F(a.n)), s.ach[a.id] ? '' : 'done'));
    });
    body.appendChild(list);
  } }], 'a');

  // ---------- Verlauf ----------
  function histTab(body) {
    const g = G(), s = g.s;
    body.appendChild(h('p', { cls: 'note' }, s.peaceful ? L('Friedlicher Modus ist an: Niemand greift dich an.', 'Peaceful mode is on: nobody attacks you.') : L('Wer dich angreift, steht hier. Beim nächsten Sturm stehen Rache-Ziele ganz oben.', 'Whoever attacks you is listed here. On your next storm, revenge targets come first.')));
    const list = h('div', { cls: 'list' });
    if (!s.history.length) list.appendChild(h('p', { cls: 'note' }, L('Noch nichts passiert.', 'Nothing happened yet.')));
    s.history.forEach(e => {
      const bot = SW.BOTS.find(b => b.id === e.by), who = bot ? bot.name + ' 🤖' : '?';
      const what = e.kind === 'attack' ? (e.blocked ? L('Sturm abgewehrt 🛡️', 'Storm blocked 🛡️') : L('Sturm: ', 'Storm: ') + tx(SW.WORLDS[(e.w || s.island) - 1].buildings[e.b] ? SW.WORLDS[(e.w || s.island) - 1].buildings[e.b].name : '') + (e.res === 'downgraded' ? L(' (−1 Stufe)', ' (−1 stage)') : L(' beschädigt', ' damaged'))) : L('Schatzsuche: −🪙 ', 'Treasure hunt: −🪙 ') + F(e.coins || 0);
      list.appendChild(item(bot ? SW.Symbols.avatar(bot.look, 64) : '❔', who, what + ' · ' + new Date(e.t).toLocaleString(SW.lang === 'en' ? 'en-GB' : 'de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), e.revenged ? h('span', { cls: 'chip' }, L('Gerächt', 'Avenged')) : (e.by ? h('span', { cls: 'chip rev' }, L('Rache offen', 'Revenge open')) : null)));
    });
    body.appendChild(list);
  }
  function logTab(body) {
    const g = G(), list = h('div', { cls: 'list' });
    body.appendChild(h('p', { cls: 'note' }, L('Die letzten 100 Aktionen. Im Tutorial vorbereitete Ergebnisse sind mit „Tutorial“ markiert.', 'The last 100 actions. Results prepared by the tutorial are marked “tutorial”.')));
    g.s.log.slice(0, 100).forEach(e => {
      let t = '';
      if (e.k === 'spin') t = e.ids.map(i => SW.REELS.SYMBOLS.find(x => x.id === i).glyph).join(' ') + '  ×' + e.m + '  🪙 ' + F(e.c) + (e.a ? ' · ' + (e.a === 'attack' ? '⚡' : '🧭') : '') + (e.sc ? ' · ' + L('Tutorial', 'tutorial') : '');
      else if (e.k === 'build') t = L('Gebaut: ', 'Built: ') + (e.b + 1) + ' → ' + e.st + ' · −🪙 ' + F(e.c);
      else if (e.k === 'attack') t = L('Sturm auf ', 'Storm on ') + e.to + ' · ' + e.res + ' · 🪙 ' + F(e.c);
      else if (e.k === 'raid') t = L('Expedition bei ', 'Expedition at ') + e.to + ' · 🪙 ' + F(e.c);
      else if (e.k === 'island') t = L('Insel abgeschlossen: ', 'Island completed: ') + e.w;
      else t = e.k;
      list.appendChild(h('div', { cls: 'item' }, [h('small', { style: 'color:var(--mute);min-width:44px' }, new Date(e.t).toLocaleTimeString(SW.lang === 'en' ? 'en-GB' : 'de-DE', { hour: '2-digit', minute: '2-digit' })), h('span', null, t)]));
    });
    body.appendChild(list);
  }
  function rankTab(body) {
    const g = G(), list = h('div', { cls: 'list' });
    body.appendChild(h('p', { cls: 'note' }, L('Computer-Spieler sind mit 🤖 markiert. Weltweite Ranglisten gibt es mit Spinwelten-Server (🌐 Online).', 'Computer players are marked 🤖. Worldwide leaderboards are available with a Spinwelten server (🌐 Online).')));
    g.botRanking().forEach((x, i) => list.appendChild(item(x.me ? '⭐' : SW.Symbols.avatar(x.look, 64), (i + 1) + '. ' + (x.me ? L('Du', 'You') : x.name + ' 🤖'), L('Insel ', 'Island ') + x.island + ' · ' + L('fertig: ', 'done: ') + x.done, null, x.me ? '' : '')));
    body.appendChild(list);
  }
  P.history = tab => UI().sheet(L('Verlauf', 'History'), [
    { id: 'h', label: L('Angriffe', 'Attacks'), render: histTab },
    { id: 'l', label: L('Protokoll', 'Log'), render: logTab },
    { id: 'r', label: L('Rangliste', 'Ranking'), render: rankTab }], tab);

  // ---------- Minispiele ----------
  P.minigames = () => UI().sheet(L('Minispiele', 'Minigames'), [{ id: 'm', label: '', render: body => {
    const g = G(), left = g.mgPlaysLeft();
    body.appendChild(h('p', { cls: 'note' }, L(`Heute frei: ${Math.max(0, 3 - (g.s.daily.mg || 0))} · Tickets: ${g.s.tickets}. Tickets gibt es aus Portalrunen. Jede Insel stellt ein Minispiel vor.`, `Free today: ${Math.max(0, 3 - (g.s.daily.mg || 0))} · Tickets: ${g.s.tickets}. Tickets come from portal runes. Each island features one minigame.`)));
    const list = h('div', { cls: 'list' });
    SW.MINIGAMES.forEach(m => {
      const star = g.s.stats['mg_' + m.id] || 0;
      list.appendChild(item(m.icon, tx(m.name) + (star ? ' · ' + L('gewonnen ', 'won ') + star + '×' : ''), tx(m.desc), btn(L('Spielen', 'Play'), () => { UI().closeSheet(true); A().startMinigame(m.id); }, left ? 'jade small' : 'small', { disabled: !left })));
    });
    body.appendChild(list);
  } }], 'm');

  // ---------- Einstellungen ----------
  function setRow(label, sub, ctrl) { return h('label', { cls: 'set' }, [h('span', null, [label, sub ? h('small', null, sub) : null]), ctrl]); }
  function sel(val, opts, fn) { const s = h('select'); opts.forEach(([v, t]) => { const o = h('option', { value: v }, t); if (String(v) === String(val)) o.selected = true; s.appendChild(o); }); s.addEventListener('change', () => fn(s.value)); return s; }
  function chk(val, fn) { const c = h('input', { type: 'checkbox' }); c.checked = !!val; c.addEventListener('change', () => fn(c.checked)); return c; }
  function rng(val, fn) { const r = h('input', { type: 'range', min: 0, max: 1, step: 0.1, value: val }); r.addEventListener('input', () => fn(+r.value)); return r; }
  function setGeneral(body, ctx) {
    const a = A(), st = a.set;
    body.appendChild(setRow(L('Sprache', 'Language'), null, sel(SW.lang, [['de', 'Deutsch'], ['en', 'English']], v => { a.setSetting('lang', v); SW.setLang(v); a.rebuildUI(); P.settings('g'); })));
    body.appendChild(setRow(L('Soundeffekte', 'Sound effects'), null, rng(st.sfx, v => a.setSetting('sfx', v))));
    body.appendChild(setRow(L('Musik', 'Music'), null, rng(st.music, v => a.setSetting('music', v))));
    body.appendChild(setRow(L('Vibration', 'Haptics'), L('nur wenn das Gerät es kann', 'only if the device supports it'), chk(st.haptics, v => a.setSetting('haptics', v))));
    body.appendChild(setRow(L('Animationstempo', 'Animation speed'), null, sel(st.speed, [[0.75, L('Gemütlich', 'Relaxed')], [1, L('Normal', 'Normal')], [1.6, L('Schnell', 'Fast')], [2.5, L('Turbo', 'Turbo')]], v => a.setSetting('speed', +v))));
    body.appendChild(setRow(L('Walzen überspringen', 'Skip reel animation'), L('Ergebnis sofort zeigen', 'Show result immediately'), chk(st.skip, v => a.setSetting('skip', v))));
    body.appendChild(setRow(L('Bewegung reduzieren', 'Reduce motion'), L('weniger Kamerafahrten und Effekte', 'fewer camera moves and effects'), chk(st.reducedMotion, v => a.setSetting('reducedMotion', v))));
    body.appendChild(setRow(L('Auto-Drehen: höchstens', 'Auto-spin: at most'), null, sel(st.autoSpinMax || 0, [[0, L('bis Energie leer', 'until energy runs out')], [10, '10'], [25, '25'], [50, '50'], [100, '100']], v => a.setSetting('autoSpinMax', +v))));
    body.appendChild(setRow(L('Vollbild', 'Fullscreen'), null, btn(L('Umschalten', 'Toggle'), () => a.fullscreen(), 'small')));
    body.appendChild(setRow(L('Vollbild beim Start', 'Fullscreen on start'), L('Handy und Tablet', 'phones and tablets'), chk(st.autoFull !== false, v => a.setSetting('autoFull', v))));
    void ctx;
  }
  function setGraphics(body) {
    const a = A(), st = a.set, r = a.r;
    body.appendChild(setRow(L('Grafikqualität', 'Graphics quality'), L('Aktuell: ', 'Current: ') + ({ low: L('Niedrig', 'Low'), medium: L('Mittel', 'Medium'), high: L('Hoch', 'High') })[r.level] + ' · ' + L('Auflösung ', 'resolution ') + Math.round(r.scale * 100) + ' %',
      sel(st.quality, [['auto', 'Auto'], ['low', L('Niedrig', 'Low')], ['medium', L('Mittel', 'Medium')], ['high', L('Hoch', 'High')]], v => { a.setSetting('quality', v); a.applyQuality(); UI().rerender(); })));
    body.appendChild(h('p', { cls: 'note' }, L('Auto wählt nach Gerät und senkt die Qualität, wenn es ruckelt. Die Auflösung passt sich automatisch an, damit das Spiel flüssig bleibt. Im Hintergrund pausiert die Grafik.', 'Auto picks by device and lowers quality if it stutters. Resolution adapts automatically to keep the game smooth. Graphics pause in the background.')));
    const i = r.info(); body.appendChild(h('p', { cls: 'note' }, `Draw calls ${i.calls} · ${L('Dreiecke', 'triangles')} ${F(i.tris)} · ${L('Texturen', 'textures')} ${i.tex}`));
  }
  function setControls(body, ctx) {
    const I = SW.Input, a = A();
    body.appendChild(h('p', { cls: 'note' }, L('Tippe auf eine Taste und drücke dann die neue Taste (Esc bricht ab). Controller: Knopf drücken.', 'Tap a key, then press the new key (Esc cancels). Controller: press a button.')));
    const tbl = h('div', { cls: 'list' });
    I.ACTIONS.forEach(act => {
      const nm = I.NAMES[act], keys = (I.keys[act] || []).map(I.keyLabel).join(' / '), pads = (I.pad[act] || []).map(I.padLabel).join(' / ');
      tbl.appendChild(h('div', { cls: 'item' }, [h('div', { cls: 'tx' }, [h('b', null, L(nm[0], nm[1]))]),
        btn('⌨ ' + (keys || '–'), async () => { UI().toast(L('Neue Taste drücken …', 'Press new key …')); const c = await I.captureNext('key'); if (c) { I.setKey(act, c); a.saveControls(); } ctx.rerender(); }, 'small'),
        btn('🎮 ' + (pads || '–'), async () => { UI().toast(L('Controller-Knopf drücken …', 'Press controller button …')); const c = await I.captureNext('pad'); if (c !== null && c !== undefined) { I.setPad(act, c); a.saveControls(); } ctx.rerender(); }, 'small')]));
    });
    body.appendChild(tbl);
    body.appendChild(setRow(L('Stick-Totzone', 'Stick dead zone'), null, sel(a.set.deadzone, [[0.15, '15 %'], [0.25, '25 %'], [0.35, '35 %']], v => { a.setSetting('deadzone', +v); I.deadzone = +v; })));
    body.appendChild(setRow(L('Kamera Y umkehren', 'Invert camera Y'), null, chk(a.set.invertY, v => { a.setSetting('invertY', v); I.invertY = v; })));
    body.appendChild(h('div', { cls: 'row' }, [btn(L('Standard wiederherstellen', 'Restore defaults'), () => { I.reset(); a.saveControls(); ctx.rerender(); }, 'small')]));
    body.appendChild(h('p', { cls: 'note' }, (I.hasPad ? '🎮 ' + L('Controller verbunden.', 'Controller connected.') : L('Kein Controller erkannt (drücke einen Knopf).', 'No controller detected (press a button).')) + ' ' + L('Maus: ziehen = drehen, Rad = zoomen. Touch: wischen = drehen, zwei Finger = zoomen.', 'Mouse: drag = rotate, wheel = zoom. Touch: swipe = rotate, two fingers = zoom.')));
  }
  function setGame(body, ctx) {
    const a = A(), g = G(), s = g.s;
    body.appendChild(setRow(L('Spielstil', 'Play style'), L('Entspannt: mehr Energie, günstiger. Herausfordernd: knapper.', 'Relaxed: more energy, cheaper. Challenge: tighter.'), sel(s.profile, [['relaxed', L('Entspannt', 'Relaxed')], ['classic', L('Klassisch', 'Classic')], ['challenge', L('Herausfordernd', 'Challenge')]], v => { s.profile = v; a.after(); })));
    body.appendChild(setRow(L('Friedlicher Modus', 'Peaceful mode'), L('Niemand greift dich an; Sturmrunen geben stattdessen Münzen.', 'Nobody attacks you; storm runes give coins instead.'), chk(s.peaceful, v => { s.peaceful = v; a.after(); })));
    body.appendChild(setRow(L('Stärke der Computer-Spieler', 'Computer player strength'), null, sel(s.botLevel, [['easy', L('Leicht', 'Easy')], ['normal', L('Normal', 'Normal')], ['hard', L('Stark', 'Strong')]], v => { s.botLevel = v; a.after(); })));
    body.appendChild(setRow(L('Tutorial', 'Tutorial'), null, btn(L('Neu starten', 'Restart'), () => { UI().closeSheet(true); a.restartTutorial(); }, 'small')));
    void ctx;
  }
  function setSave(body, ctx) {
    const a = A();
    body.appendChild(h('p', { cls: 'note' }, L('Das Spiel speichert automatisch. Zusätzlich gibt es zwei Sicherungsplätze. Mit ☁ (oben im easygames-Fenster) folgt dein Stand dir per Google-Konto auf jedes Gerät.', 'The game saves automatically. There are also two backup slots. With ☁ (easygames cloud) your progress follows you to every device via your Google account.')));
    const list = h('div', { cls: 'list' });
    [1, 2].forEach(n => {
      const inf = SW.Save.slotInfo(n);
      list.appendChild(item('💾', L('Platz ', 'Slot ') + n, inf ? L('Insel ', 'Island ') + inf.island + ' · ' + new Date(inf.saved).toLocaleString(SW.lang === 'en' ? 'en-GB' : 'de-DE') : L('leer', 'empty'),
        h('div', { cls: 'row' }, [btn(L('Sichern', 'Save'), () => { a.save(); SW.Save.saveSlot(n, G().s); UI().toast(L('Gesichert', 'Saved')); ctx.rerender(); }, 'small'),
          btn(L('Laden', 'Load'), () => UI().dialog({ title: L('Platz laden?', 'Load slot?'), text: L('Der aktuelle Stand wird ersetzt (vorher automatisch als Sicherung abgelegt).', 'The current progress will be replaced (backed up automatically first).'), buttons: [{ label: L('Laden', 'Load'), cls: 'gold', fn: () => { const st = SW.Save.loadSlot(n); if (st) a.loadState(st); } }, { label: L('Abbrechen', 'Cancel') }] }), 'small', { disabled: !inf })])));
    });
    body.appendChild(list);
    body.appendChild(h('div', { cls: 'sec' }, L('Datei', 'File')));
    const file = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
    file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; f.text().then(t => { try { a.loadState(SW.Save.importJSON(t)); UI().toast(L('Importiert', 'Imported')); } catch (e) { UI().toast(L('Datei ungültig: ', 'Invalid file: ') + (e.code || e.message)); } file.value = ''; }); });
    body.appendChild(h('div', { cls: 'row' }, [btn(L('Exportieren', 'Export'), () => a.exportSave(), 'small'), btn(L('Importieren', 'Import'), () => file.click(), 'small'), file,
      btn(L('Alles löschen', 'Delete everything'), () => UI().dialog({ title: L('Wirklich alles löschen?', 'Really delete everything?'), text: L('Der Spielstand auf diesem Gerät wird gelöscht. Sicherungsplätze bleiben.', 'Progress on this device will be deleted. Backup slots remain.'), buttons: [{ label: L('Löschen', 'Delete'), cls: 'coral', fn: () => { SW.Save.wipe(); location.reload(); } }, { label: L('Abbrechen', 'Cancel') }] }), 'coral small')]));
  }
  function setServer(body, ctx) {
    const a = A(), api = SW.OnlineAPI;
    body.appendChild(h('p', { cls: 'note' }, L('Private Räume (Code/QR) funktionieren ohne eigenen Server. Für öffentliche Räume, weltweite Ranglisten und Angriffe auf echte Spieler braucht es einen Spinwelten-Server (siehe README). Nur https-Adressen.', 'Private rooms (code/QR) work without your own server. Public rooms, worldwide leaderboards and attacks on real players need a Spinwelten server (see README). https only.')));
    const inp = h('input', { type: 'url', placeholder: 'https://…', value: a.set.apiBase || '' });
    body.appendChild(setRow(L('Server-Adresse', 'Server address'), null, inp));
    const out = h('p', { cls: 'note' });
    body.appendChild(h('div', { cls: 'row' }, [btn(L('Speichern', 'Save'), () => { const v = api.normalizeBase(inp.value); if (inp.value.trim() && !v) { out.textContent = L('Ungültige Adresse (nur https://).', 'Invalid address (https:// only).'); return; } a.setSetting('apiBase', v); out.textContent = v ? L('Gespeichert. Prüfe Verbindung …', 'Saved. Checking connection …') : L('Server entfernt – Online-Konto aus.', 'Server removed – online account off.'); if (v) api.status().then(s => { out.textContent = L('Status: ', 'Status: ') + s.state; }); }, 'small'), out]));
    void ctx;
  }
  P.settings = tab => UI().sheet(L('Einstellungen', 'Settings'), [
    { id: 'g', label: L('Allgemein', 'General'), render: setGeneral },
    { id: 'x', label: L('Grafik', 'Graphics'), render: setGraphics },
    { id: 'c', label: L('Steuerung', 'Controls'), render: setControls },
    { id: 's', label: L('Spiel', 'Game'), render: setGame },
    { id: 'v', label: L('Spielstand', 'Save'), render: setSave },
    { id: 'n', label: L('Server', 'Server'), render: setServer }], tab);

  // ---------- Anleitung ----------
  P.guide = () => UI().sheet(L('Anleitung', 'How to play'), [{ id: 'h', label: '', render: body => {
    const sec = (t, ps) => { body.appendChild(h('div', { cls: 'sec' }, t)); ps.forEach(p => body.appendChild(h('p', null, p))); };
    sec(L('Ziel', 'Goal'), [L('Baue die 30 Wunderinseln des Himmelsarchipels wieder auf. Jede Insel hat fünf Bauwerke mit fünf Stufen. Ist alles gebaut und nichts beschädigt, reist du zur nächsten Insel.', 'Rebuild the 30 wonder isles of the sky archipelago. Each island has five buildings with five stages. Once everything is built and nothing is damaged, you travel to the next island.')]);
    sec(L('Runenmaschine', 'Rune Machine'), [L('Ein Spin kostet Energie (⚡) mal Einsatz (Multiplikator). Energie lädt sich mit der Zeit auf. „Drehen“ gedrückt halten startet das Auto-Drehen, erneutes Tippen stoppt es. Das Ergebnis steht fest, bevor die Walzen drehen.', 'A spin costs energy (⚡) times the bet (multiplier). Energy recharges over time. Hold “Spin” to start auto-spin, tap again to stop. The result is fixed before the reels turn.'),
      SW.REELS.SYMBOLS.map(s => s.glyph + ' ' + tx(s.name)).join(' · '),
      L('3× Sonne/Stern/Wunder = Münzen · 3× Sturm = Sturmangriff · 3× Kompass = Schatzexpedition · 3× Schutzorb = Schild · 3× Schleife = Spins · Relikt = Truhe · Portal = Eventpunkte und Minispiel-Tickets.', '3× sun/star/wonder = coins · 3× storm = storm attack · 3× compass = treasure expedition · 3× shield orb = shield · 3× loop = spins · relic = chest · portal = event points and minigame tickets.'),
      L('Es gibt keine Einsätze mit echtem Geld, nichts zum Auszahlen und keine Käufe. Alle Chancen stehen im Spiel (Truhen) und im README.', 'There are no real-money stakes, nothing to cash out and no purchases. All odds are shown in the game (chests) and in the README.')]);
    sec(L('Sturmangriff und Schatzexpedition', 'Storm attack and treasure expedition'), [L('Beim Sturm wählst du eine Insel eines Computer-Spielers und ein Bauwerk. Ein Schutzorb wehrt einen Sturm ab. Bei der Expedition gräbst du an drei von sechs Stellen.', 'For a storm, choose a computer player’s island and a building. A shield orb blocks one storm. On an expedition you dig three of six spots.'),
      L('Computer-Spieler greifen dich auch an – höchstens dreimal in acht Stunden und nie in den ersten 20 Minuten. Im friedlichen Modus gar nicht.', 'Computer players attack you too – at most three times in eight hours and never in the first 20 minutes. Not at all in peaceful mode.')]);
    sec(L('Sammeln', 'Collecting'), [L('240 Karten in 30 Alben, 12 Begleiter mit Fähigkeiten, 66 Erfolge, 60 Story-Aufgaben, 8 Minispiele und ein Event alle drei Tage.', '240 cards in 30 albums, 12 companions with skills, 66 achievements, 60 story quests, 8 minigames and an event every three days.')]);
    sec(L('Steuerung', 'Controls'), [L('Touch: Knöpfe tippen, wischen dreht die Insel. PC: Leertaste/Enter drehen und bestätigen, WASD/Pfeile Kamera, E interagieren, Tab Ansichten, M Atlas, I Sammlung, Q Aufgaben, P/Esc Pause, F Vollbild, +/− Multiplikator. Controller: A drehen/bestätigen, B zurück, X Auto-Drehen, Y Ansicht, LB/RB Reiter, LT/RT Multiplikator, Start Pause.', 'Touch: tap buttons, swipe rotates the island. PC: Space/Enter spin and confirm, WASD/arrows camera, E interact, Tab views, M atlas, I collection, Q quests, P/Esc pause, F fullscreen, +/− multiplier. Controller: A spin/confirm, B back, X auto-spin, Y view, LB/RB tabs, LT/RT multiplier, Start pause.')]);
    sec('🌐 Online', [L('Private Räume für 2–8 Spieler: Raum erstellen, Code oder QR-Code teilen – Mitspieler treten per Link von überall bei. Freie Plätze füllen Computer-Spieler.', 'Private rooms for 2–8 players: create a room, share the code or QR code – friends join via link from anywhere. Computer players fill free seats.')]);
  } }], 'h');

  // ---------- Profil ----------
  P.profile = () => UI().sheet(L('Profil', 'Profile'), [{ id: 'p', label: '', render: (body, ctx) => {
    const g = G(), s = g.s, a = A();
    const inp = h('input', { type: 'text', maxlength: 16, value: s.name || '' }); inp.addEventListener('change', () => { s.name = inp.value.replace(/[<>]/g, '').trim().slice(0, 16); a.after(); });
    body.appendChild(setRow(L('Name', 'Name'), L('für Online-Räume', 'for online rooms'), inp));
    const kv = h('div', { cls: 'kv' });
    const row = (k, v) => { kv.appendChild(h('span', null, k)); kv.appendChild(h('b', null, String(v))); };
    row(L('Insel', 'Island'), s.island + ' / 30' + (s.ngp ? ' · NG+' + s.ngp : '')); row(L('Inseln abgeschlossen', 'Islands completed'), s.islandsDone); row('Spins', F(s.stats.spins || 0));
    row(L('Münzen verdient', 'Coins earned'), F(s.stats.coins_earned || 0)); row(L('Stürme', 'Storms'), s.stats.attacks || 0); row(L('Expeditionen', 'Expeditions'), s.stats.raids || 0);
    row(L('Karten', 'Cards'), g.uniqueCards() + ' / 240'); row(L('Begleiter', 'Companions'), Object.keys(s.comps).length + ' / 12'); row(L('Erfolge', 'Achievements'), Object.keys(s.ach).length + ' / ' + SW.ACHIEVEMENTS.length);
    row(L('Online-Runden', 'Online rounds'), s.stats.online_games || 0);
    body.appendChild(kv);
    body.appendChild(h('div', { cls: 'sec' }, L('Google-Spielstand', 'Google save')));
    const box = document.getElementById('cloudBox');
    if (box && window.AnMaChaCloud) { body.appendChild(h('p', { cls: 'note' }, L('Melde dich mit Google an – dann wird dein Stand automatisch gesichert und auf anderen Geräten geladen.', 'Sign in with Google – your progress is then backed up automatically and loaded on other devices.'))); body.appendChild(box); }
    else body.appendChild(h('p', { cls: 'note' }, L('Die easygames-Cloud ist hier nicht verfügbar. Der Stand bleibt auf diesem Gerät (Export in den Einstellungen).', 'The easygames cloud is not available here. Progress stays on this device (export in settings).')));
    if (s.ended) body.appendChild(h('div', { cls: 'row', style: 'margin-top:12px' }, [btn(L('Neues Spiel+ starten', 'Start New Game+'), () => { UI().closeSheet(true); a.newGamePlus(); }, 'gold')]));
    void ctx;
  } }], 'p');
  SW.Panels = P;
})(globalThis.SW = globalThis.SW || {});

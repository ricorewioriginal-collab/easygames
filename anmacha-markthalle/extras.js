'use strict';
/* Fenster für die neuen Spielsysteme von Marktrausch: Frische & MHD, Kunden & Bewertung, Wochenmarkt & Café, Billigo & Viertel,
   dazu Laune & Schichten im Personal-Fenster und Koop in den Optionen. Nur Knöpfe mit data-a – nav.js steuert sie mit Controller/TV,
   Maus und Touch klicken sie direkt. game.js bindet alles ein (window.MarktExtras). */
window.MarktExtras = (() => {
  const TITLES = { frisch: '🌿 Frische & MHD', kunden: '🙋 Kunden & Bewertung', draussen: '🧺 Wochenmarkt & Café', viertel: '⚔️ Billigo & Viertel' };
  const CMDS = [['frisch', '🌿', 'Frische & MHD', 'Rabatt, Rette-mich, Aussortieren'], ['kunden', '🙋', 'Kunden', 'Wünsche, Stammkunden, Sterne'], ['draussen', '🧺', 'Markt & Café', 'Höfe, Stände und Café vor dem Laden'], ['viertel', '⚔️', 'Billigo & Viertel', 'Konkurrenz, Ereignisse, Wetter, Tageszeit']];
  const FL = { ok: ['✅', 'frisch', 'good'], bald: ['⏳', 'MHD morgen', 'warn'], mhd: ['⏰', 'MHD heute', 'warn'], exp: ['🤢', 'abgelaufen', 'bad'] };
  const RATE = [['preis', '💶 Preise'], ['auswahl', '🛒 Auswahl'], ['frische', '🥬 Frische'], ['sauber', '🧽 Sauberkeit'], ['service', '⏱️ Service & Kasse']];
  const WX = { sonne: 'Viele Leute draußen – Marktstände und Café laufen gut.', heiss: 'Kühlware, Eis und Getränke sind gefragt. Ohne Klimaanlage leiden Kunden und Personal.', wolke: 'Ganz normaler Tag.', regen: 'Weniger Kundschaft, Schirme gefragt, nasse Füße machen Pfützen am Eingang.', kalt: 'Tee, Kaffee und Eiskratzer gehen gut, draußen ist wenig los.', gewitter: 'Kaum jemand draußen, Pfützen am Eingang, manchmal fällt der Strom aus.', nebel: 'Etwas weniger Kundschaft, Tee und Suppe gehen gut.', schnee: 'Weniger Kundschaft, Eiskratzer und Heißgetränke gefragt, Pfützen am Eingang.' };
  const star = v => { const n = Math.round(v); return '★'.repeat(n) + '☆'.repeat(5 - n); };
  const bar = (f, col) => `<div class="bar"><i style="width:${Math.round(Math.max(0, Math.min(1, f)) * 100)}%${col ? ';background:' + col : ''}"></i></div>`;
  const tm = (G, t) => { const m = Math.floor(8 * 60 + t * 1.2); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  function frisch(G) {
    const { S, Sim, D, fmt, esc } = G, P = D.PRODUCTS, ord = { exp: 0, mhd: 1, bald: 2, ok: 3 };
    const sh = S.objs.filter(o => Sim.isShelf(o) && Sim.fresh(S, o)).sort((a, b) => ord[Sim.fresh(S, a)] - ord[Sim.fresh(S, b)]);
    let h = `<p class="h">Frische Ware hält nur ein paar Tage. Kurz vor dem MHD klebst du am Regal einen <b>🏷️ Rabattaufkleber</b> (−30 %, Aktionstaste) – Sparfüchse und Studenten greifen zu. Oder du markierst das Regal für <b>🥡 Rette-mich-Tüten</b>: abends für 35 % verkauft statt weggeworfen. <b>Abgelaufene Ware</b> bleibt liegen, bis du sie aussortierst: Kunden ekeln sich, und die Lebensmittelkontrolle verteilt Bußgelder. Regalauffüller sortieren selbst aus.</p>`;
    h += `<div class="grid"><div class="glass it"><b>🥡 Gerettet: ${S.tot.saved} Artikel</b><small>${S.up.rette ? '✔ Rette-mich-App aktiv: Alles mit MHD heute geht abends automatisch weg.' : 'Mit der Rette-mich-App (Ausbau) läuft das jeden Abend von selbst.'}</small></div></div>`;
    if (!sh.length) return h + '<p class="h">Gerade liegt keine frische Ware in den Regalen.</p>';
    return h + '<div class="grid">' + sh.map(o => {
      const p = P[o.p], f = Sim.fresh(S, o), L = FL[f], left = Math.max(0, p.life - o.age);
      const btn = f === 'mhd' || f === 'bald' ? `<button class="btn sm ${o.disc ? 'go' : ''}" data-a="xdisc" data-v="${o.id}">🏷️ ${o.disc ? 'Rabatt an' : 'Rabatt −30 %'}</button><button class="btn sm ${o.rette ? 'go' : ''}" data-a="xrette" data-v="${o.id}">🥡 ${o.rette ? 'Tüte abends' : 'Rette mich'}</button>` : f === 'exp' ? '<small class="bad">Hingehen und mit der Aktionstaste aussortieren (der Wegweiser zeigt das Regal).</small>' : `<button class="btn sm ${o.disc ? 'go' : ''}" data-a="xdisc" data-v="${o.id}">🏷️ ${o.disc ? 'Rabatt an' : 'Rabatt −30 %'}</button>`;
      return `<div class="glass it${f === 'exp' ? ' deal' : ''}"><div style="display:flex;gap:8px;align-items:center"><span class="e">${p.e}</span><b>${esc(p.name)}</b></div><small>${o.qty} Stück · Ø ${o.age.toFixed(1)} von ${p.life} Tagen · <span class="${L[2]}">${L[0]} ${L[1]}</span>${f === 'ok' ? ' (noch ' + left.toFixed(1) + ' Tage)' : ''} · ${fmt(Sim.effPrice(S, o))}</small><div class="row">${btn}</div></div>`;
    }).join('') + '</div>';
  }

  function kunden(G) {
    const { S, Sim, D, fmt, esc } = G, P = D.PRODUCTS, off = Sim.offered(S);
    let h = `<h3 style="margin-top:0">⭐ Bewertung ${Sim.stars(S).toFixed(1)} von 5</h3><div class="glass it"><small>So bewerten dich die Kunden nach jedem Einkauf – jeder Bereich zählt für den Ruf.</small><div class="tw"><table class="tbl">${RATE.map(([k, n]) => { const v = Sim.rateStars(S, k); return `<tr><td>${n}</td><td style="color:var(--y);letter-spacing:1px">${star(v)}</td><td>${v.toFixed(1)}</td></tr>`; }).join('')}</table></div></div>`;
    h += '<h3>🙋 Kundenwünsche</h3>' + (S.asks.length ? '<div class="grid">' + S.asks.map(a => { const p = P[a.p], have = off[a.p] > 0, lic = S.lic[p.cat]; return `<div class="glass it${have ? ' deal' : ''}"><div style="display:flex;gap:8px;align-items:center"><span class="e">${p.e}</span><b>${esc(p.name)}</b></div><small>${esc(a.n)}${a.reg >= 0 ? ' ❤️' : ''} fragt danach · ${a.due > S.day ? 'bis Tag ' + a.due : '<span class="warn">nur noch heute!</span>'}<br>${have ? '<span class="good">✔ liegt im Regal – wird abends abgeholt</span>' : lic ? 'Bestellen und ins Regal räumen.' : '🔒 Lizenz „' + esc(D.CATS[p.cat].name) + '“ nötig (' + fmt(D.CATS[p.cat].cost) + ')'}</small><div class="row">${!lic ? `<button class="btn sm go" data-a="lic" data-v="${p.cat}" ${S.level < D.CATS[p.cat].lvl || S.money < D.CATS[p.cat].cost ? 'disabled' : ''}>Lizenz kaufen</button>` : have ? '' : `<button class="btn sm" data-a="cadd" data-p="${a.p}" data-n="1">+1 Karton in den Warenkorb</button>`}</div></div>`; }).join('') + '</div>' : '<p class="h">Gerade keine. Fehlt Ware im Regal, fragen Kunden manchmal nach – erfüllst du den Wunsch rechtzeitig, kaufen sie gleich mehrere Stück und werden Stammkunden.</p>');
    const regs = S.regs.map((r, i) => Object.assign({ i }, r)).sort((a, b) => b.loy - a.loy).slice(0, 12);
    h += `<h3>❤️ Stammkunden (${S.regs.length})</h3>` + (regs.length ? '<div class="tw"><table class="tbl"><tr><th>Name</th><th>Treue</th><th>Lieblingsware</th></tr>' + regs.map(r => `<tr><td>${(D.TYPES[r.t] || D.TYPES.fam).e} ${esc(r.n)}</td><td style="min-width:90px">${bar(r.loy / 100, '#ff6b9a')}</td><td>${r.fav && P[r.fav] ? P[r.fav].e + ' ' + esc(P[r.fav].name) + (off[r.fav] ? '' : ' <span class="warn">fehlt!</span>') : '–'}</td></tr>`).join('') + '</table></div><p class="h">Stammkunden kaufen ihre Lieblingsware jedes Mal mit. Ist sie da, steigt die Treue. Die Treuekarte (Ausbau) holt sie öfter in den Laden.</p>' : '<p class="h">Glückliche Kunden werden zu Stammkunden.</p>');
    return h + '<div class="row"><button class="btn sm" data-a="xopen" data-v="stat">📊 Online-Bewertungen & Laufwege</button></div>';
  }

  function draussen(G) {
    const { S, Sim, D, fmt, esc } = G, P = D.PRODUCTS, o = S.out;
    let h = `<p class="h">Vor dem Laden auf dem Gehweg (durch die Eingangstür raus): Marktstände mit Ware von regionalen Höfen und ein Café. Die Höfe liefern jeden Morgen ${D.STALL_DELIV} Stück (Einkauf +15 %, keine Lizenz nötig). Passanten kaufen im Vorbeigehen – bei Sonne viel, bei Regen wenig. Passende Kartons kannst du auch selbst am Stand auslegen (Aktionstaste).</p><h3>🧺 Marktstände (${o.n}/${D.STALLS.length})</h3><div class="grid">`;
    for (let i = 0; i < D.STALLS.length; i++) {
      const t = D.STALLS[i];
      if (i > o.n) break;
      if (i === o.n) { h += `<div class="glass it"><b>🧺 Marktstand ${i + 1}</b><small>Holzstand mit Markise vor dem Schaufenster.${S.level < t.lvl ? '<br>Ab Stufe ' + t.lvl : ''}</small><div class="row"><button class="btn sm go" data-a="xstall" ${S.level < t.lvl || S.money < t.price ? 'disabled' : ''}>Aufstellen · ${fmt(t.price)}</button></div></div>`; break; }
      const st = o.stalls[i], f = D.FARMS.find(x => x.id === st.farm), p = st.p ? P[st.p] : null;
      h += `<div class="glass it"><b>🧺 Stand ${i + 1}${f ? ' · ' + f.e + ' ' + esc(f.n) : ' · noch kein Hof'}</b>`;
      if (p) h += `<small>${p.e} ${esc(p.name)} · ${st.qty}/${D.STALL_CAP}${p.life ? ' · Ø ' + st.age.toFixed(1) + ' von ' + p.life + ' Tagen' : ''} · heute ${st.sold || 0} verkauft<br>Markt ${fmt(Sim.ref(S, st.p))} · Hof-Einkauf ${fmt(Math.round(p.cost * 1.15))}</small><div class="pr"><button class="btn sm" data-a="xsp" data-v="${i}" data-n="-10">−10</button><button class="btn sm" data-a="xsp" data-v="${i}" data-n="-5">−5</button><b class="v">${fmt(st.price)}</b><button class="btn sm" data-a="xsp" data-v="${i}" data-n="5">+5</button><button class="btn sm" data-a="xsp" data-v="${i}" data-n="10">+10</button></div>`;
      h += `<div class="row">${D.FARMS.map(x => `<button class="btn sm ${x.id === st.farm ? 'go' : ''}" data-a="xfarm" data-v="${i}" data-p="${x.id}" ${S.level < x.lvl ? 'disabled' : ''} title="${esc(x.n)}">${x.e}${S.level < x.lvl ? ' ab ' + x.lvl : ''}</button>`).join('')}${f && f.p.length > 1 ? `<button class="btn sm" data-a="xprod" data-v="${i}">🔁 Andere Ware</button>` : ''}</div></div>`;
    }
    h += '</div>';
    const L = D.CAFE[o.cafe], nx = D.CAFE[o.cafe + 1];
    h += `<h3>☕ Café</h3><div class="grid"><div class="glass it"><b>${o.cafe ? '☕ ' + L.n : '☕ Noch kein Café'}</b><small>${o.cafe ? `Vorrat: <b>${o.cup}</b> Tassen · <b>${o.cake}</b> Stück Kuchen · Plätze ${L.seats}<br>Etwa ${Math.round(L.p * 100)} % der Kunden kehren nach dem Einkauf ein (Tasse ${fmt(D.CUP)}, Kuchen ${fmt(D.CAKE)}). Trag Kartons mit Kaffee, Kuchen, Torte, Croissants, Muffins, Donuts oder Waffeln zur Theke. Eine Bäckerin backt jeden Morgen Kuchen nach.` : 'Ein Café vor dem Laden: Kunden trinken nach dem Einkauf einen Kaffee, Passanten kehren ein.'}</small><div class="row">${nx ? `<button class="btn sm go" data-a="xcafe" ${S.level < nx.lvl || S.money < nx.price ? 'disabled' : ''}>${o.cafe ? 'Ausbauen: ' : ''}${nx.n} · ${fmt(nx.price)}${S.level < nx.lvl ? ' (ab Stufe ' + nx.lvl + ')' : ''}</button>` : '<span class="good">größtes Café ✔</span>'}</div></div>`;
    h += `<div class="glass it"><b>📈 Heute draußen</b><small>Marktstände ${fmt(S.today.stall || 0)} · Café ${fmt(S.today.cafe || 0)}<br>Gesamt: ${S.tot.stall} Artikel am Stand, ${S.tot.cafe} Tassen & Stücke im Café<br>Wetter draußen: ${D.WEATHER[S.weather].e} ×${Sim.wxOut(S).toFixed(2)}</small></div></div>`;
    return h;
  }

  function viertel(G) {
    const { S, Sim, D, fmt } = G, rv = S.rv, A = rv.k && D.RIVAL[rv.k];
    let h = `<h3 style="margin-top:0">⚔️ Billigo</h3><div class="grid"><div class="glass it"><b>Marktanteil im Viertel: ${Math.round(rv.share * 100)} %</b>${bar(rv.share, rv.share >= .5 ? '#43e08a' : '#ff6b7a')}<small>Dein Ruf ⭐ ${Sim.stars(S).toFixed(1)} gegen Billigo ⭐ ${(rv.rep / 20).toFixed(1)} · deine Preise ${Math.round(Sim.priceIdx(S) * 100)} % vom Markt<br>Mehr Anteil = mehr Kundschaft. Ruf, faire Preise, Online-Hype und Treue gewinnen das Viertel.</small></div>`;
    h += `<div class="glass it"><b>🏆 Wochenduell</b><small>Jeden Sonntagabend: Hast du mindestens 50 % Marktanteil, gewinnst du die Woche (+100 €).<br>Diese Woche ${rv.wk} Kunden · gewonnen bisher: ${rv.wins}×</small></div>`;
    h += `<div class="glass it"><b>${A ? A.e + ' ' + A.n : '😴 Billigo ist gerade ruhig'}</b><small>${A ? (rv.k === 'kopie' && rv.p ? 'Billigo verkauft ' + D.PRODUCTS[rv.p].name + ' 15 % billiger.' : A.d) + ' Noch bis Tag ' + rv.until + '.' : 'Billigo plant schon die nächste Aktion …'}</small></div></div>`;
    h += `<h3>Gegenmaßnahmen</h3><div class="grid"><div class="glass it"><b>📰 Flyer verteilen</b><small>Heute +10 % Kundschaft, +3 % Marktanteil. 150 € (abends).</small><div class="row"><button class="btn sm go" data-a="xfly" ${rv.fly === S.day ? 'disabled' : ''}>${rv.fly === S.day ? '✔ heute verteilt' : 'Verteilen'}</button></div></div><div class="glass it"><b>🤝 Preisgarantie</b><small>Kein Kunde geht mehr wegen Billigo-Preisen. 25 € pro Tag.</small><div class="row"><button class="btn sm ${rv.guar ? 'go' : ''}" data-a="xguar">${rv.guar ? '✔ An – beenden' : 'Einschalten'}</button></div></div><div class="glass it"><b>🏷️ Preise anpassen</b><small>Unter „Preise“ setzt „Billigo unterbieten“ alles knapp darunter.</small><div class="row"><button class="btn sm" data-a="xopen" data-v="preise">🏷️ Zu den Preisen</button></div></div></div>`;
    // Ereignisse des Tages: angekündigte immer, Überraschungen erst, wenn sie passieren
    const vis = S.ev.filter(e => D.EVENTS[e.k] && (['hitze', 'ansturm', 'bruecke', 'rivalsale', 'streik', 'wetter', 'ausflug'].includes(e.k) || e.done || S.t >= e.t0));
    h += '<h3>📅 Heute im Viertel</h3>' + (vis.length ? '<div class="grid">' + vis.map(e => { const E = D.EVENTS[e.k], on = S.t >= e.t0 && S.t <= e.t1, past = S.t > e.t1 && e.t1 > 0; let d = E.d; if (e.k === 'wetter' && S.wx2) d = `Ab etwa ${tm(G, S.wx2.t)} Uhr: ${D.WEATHER[S.wx2.to].e} ${D.WEATHER[S.wx2.to].name}.`; if (e.k === 'rivalsale' && S.rivalSale) d = `Billigo senkt heute ${D.CATS[S.rivalSale].e} ${D.CATS[S.rivalSale].name} um 18 %.`; return `<div class="glass it"><b>${E.e} ${E.n}</b><small>${d}<br>${on ? '<span class="warn">läuft gerade</span>' : past || e.done ? 'vorbei' : 'ab ca. ' + tm(G, e.t0) + ' Uhr'}</small></div>`; }).join('') + '</div>' : '<p class="h">Ein ruhiger Tag – bisher nichts Besonderes.</p>');
    const W = D.WEATHER[S.weather], F = D.WEATHER[S.forecast];
    h += `<h3>🌤️ Wetter & Tageszeit</h3><div class="grid"><div class="glass it"><b>Heute ${W.e} ${W.name}</b><small>${WX[S.weather] || ''}</small></div><div class="glass it"><b>Morgen ${F.e} ${F.name}</b><small>${WX[S.forecast] || ''}</small></div><div class="glass it"><b>🕗 Tag & Nacht</b><small>Morgens kommen Senioren, mittags Familien und Studenten, nach Feierabend Berufstätige. ${S.up.spaet ? '🌙 Spätverkauf bis 22 Uhr: Nachtschwärmer kaufen Snacks und Getränke – nachts sind aber mehr Diebe unterwegs.' : 'Mit dem Spätverkauf (Ausbau) bleibt der Laden bis 22 Uhr offen.'}</small></div></div>`;
    return h;
  }

  function staffCard(G, s) {
    const { S, Sim, D } = G; if (s.k === 'robo') return '';
    const m = Math.round(s.mood == null ? 80 : s.mood), e = m >= 75 ? '😊' : m >= 50 ? '🙂' : m >= 30 ? '😕' : '😩', sh = D.SHIFTS[s.shift] || D.SHIFTS.ganz;
    return `<small>${e} Laune ${m} %${s.off ? ' · 💤 hat gerade frei' : ''} · Tempo ${Math.round(Sim.moodF(s) * 100)} %</small>${bar(m / 100, m >= 50 ? '#43e08a' : m >= 30 ? '#ffd24a' : '#ff6b7a')}<div class="row">${Object.keys(D.SHIFTS).map(k => `<button class="btn sm ${s.shift === k ? 'go' : ''}" data-a="xshift" data-v="${s.id}" data-p="${k}" title="${D.SHIFTS[k].n}">${D.SHIFTS[k].e} ${D.SHIFTS[k].n.split(' ')[0]}</button>`).join('')}</div><div class="row"><button class="btn sm" data-a="xpraise" data-v="${s.id}" ${s.praised === S.day ? 'disabled' : ''}>👏 Loben</button><button class="btn sm" data-a="xbonus" data-v="${s.id}" ${s.bonusD === S.day ? 'disabled' : ''}>💶 Prämie 25 €</button></div>`;
  }
  const staffIntro = '<p class="h"><b>Laune</b>: Gute Laune macht schneller, schlechte langsamer – unter 12 % kündigen Leute. Ganztags schlaucht mehr als eine halbe <b>Schicht</b> (Früh- oder Spätschicht kostet 60 % Lohn). Loben (einmal am Tag), Prämien, Schulungen und der Pausenraum heben die Stimmung.</p>';

  function menuCard(G) {
    const { S } = G, on = !!S.coop;
    return `<div class="glass it" style="grid-column:1/-1"><b>👥 Koop zu zweit</b><small>Zwei Leute schmeißen den Laden gemeinsam – geteilter Bildschirm, gemeinsame Kasse. <b>Spieler 2</b> nimmt den zweiten Controller (spielt Spieler 1 mit Tastatur, Maus oder Touch, reicht ein Controller) oder die Tastatur: <b>↑ ↓</b> laufen, <b>← →</b> drehen, <b>Enter</b> Aktion, <b>Strg rechts</b> Karton abstellen, <b>Shift rechts</b> rennen.</small><div class="row"><button class="btn sm ${on ? 'go' : ''}" data-a="xcoop">${on ? '✔ An – ausschalten' : 'Koop starten'}</button></div></div>`;
  }

  function click(G, a, v, p, b) {
    const { S, Sim } = G;
    if (a === 'xdisc') { const o = Sim.obj(S, +v); if (!o) return false; o.disc = !o.disc; return true; }
    if (a === 'xrette') return Sim.markRette(S, +v);
    if (a === 'xstall') return Sim.buyStall(S);
    if (a === 'xfarm') return Sim.setFarm(S, +v, p);
    if (a === 'xprod') return Sim.stallProd(S, +v);
    if (a === 'xsp') return Sim.stallPrice(S, +v, +b.dataset.n);
    if (a === 'xcafe') return Sim.buyCafe(S);
    if (a === 'xfly') return Sim.flyer(S);
    if (a === 'xguar') return Sim.guarantee(S);
    if (a === 'xpraise') return Sim.praise(S, +v);
    if (a === 'xbonus') return Sim.bonus(S, +v);
    if (a === 'xshift') return Sim.setShift(S, +v, p);
    if (a === 'xcoop') { G.setCoop(!S.coop); return true; }
    if (a === 'xopen') { G.openPanel(v); return null; }
    return undefined;
  }
  // Zusatzzeilen für den Tagesabschluss
  function summary(G, m) {
    const { D, fmt, esc } = G, x = m.ext || {}, out = [];
    if (x.rette) out.push(`🥡 ${x.rette[0]} Artikel als Rette-mich-Tüte gerettet (+${fmt(x.rette[1])})`);
    if (x.exp) out.push(`<span class="bad">🤢 In ${x.exp} Regal${x.exp > 1 ? 'en' : ''} ist heute Nacht Ware abgelaufen – morgen aussortieren!</span>`);
    (x.asks || []).forEach(t => out.push('🙋 ' + esc(t)));
    if (x.stall) out.push(`🧺 Marktstände: ${fmt(x.stall)}`); if (x.cafe) out.push(`☕ Café: ${fmt(x.cafe)}`);
    if (x.duel) out.push(x.duel.win ? `🏆 Wochenduell gegen Billigo gewonnen (${Math.round(x.duel.share * 100)} % Marktanteil, +100 €)!` : `<span class="bad">⚔️ Wochenduell verloren – Billigo hat ${Math.round((1 - x.duel.share) * 100)} % Marktanteil.</span>`);
    return out.length ? `<p class="h">${out.join('<br>')}</p>` : '';
  }
  return { TITLES, CMDS, render: (id, G) => ({ frisch, kunden, draussen, viertel })[id](G), staffCard, staffIntro, menuCard, click, summary };
})();

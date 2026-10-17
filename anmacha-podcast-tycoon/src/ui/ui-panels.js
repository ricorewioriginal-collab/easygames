/* Fenster im Spiel: Team, Finanzen & Sponsoren, Journal (Missionen/Erfolge), Folgen-Archiv, Karte & Schnellreise,
   Pause, Speichern/Laden, Optionen (Grafik, Ton, Text, Kontrast, Bewegung, Tipps, FPS, Tasten), Steuerung. */
(function (root) {
  'use strict';
  const PT = root.PT, UI = PT.UI, S = PT.Sim, D = PT.DATA, esc = PT.esc;
  const G = () => PT.G;
  const SHIFTS = { frueh: 'Früh (6–15)', voll: 'Tag (8–18)', spaet: 'Spät (13–23)' };

  // ── Team ─────────────────────────────────────────────────
  UI.team = function () {
    const st = G().st;
    const pnl = UI.panel('Team', '', { wide: true, icon: '👥' });
    function render() {
      S.assignStations(st);
      const H = st.hosts;
      pnl.set('<h3>Hosts</h3><div class="pt-cards">' + ['marco', 'andrew'].map(h => '<div class="pt-card">' + UI.avatar(h, 56) + '<div><b>' + (h === 'marco' ? 'Marco' : 'Andrew') + '</b><small>Energie ' + UI.bar(H[h].energy) + ' Kreativität ' + UI.bar(H[h].creativity) + ' Laune ' + UI.bar(H[h].mood) + '</small><small>' + D.rubrics.map(r => r.icon + PT.round(st.hostSkill[h][r.id], 1)).join(' ') + '</small></div></div>').join('') + '</div>' +
        '<h3>Euer Team (' + st.staff.length + ')</h3>' + (st.staff.length ? '<div class="pt-cards">' + st.staff.map(s => '<div class="pt-card">' + (s.npc ? UI.avatar(s.id, 48) : '<span class="pt-ico">' + D.roles[s.role].icon + '</span>') + '<div><b>' + esc(s.name) + '</b> <small>' + D.roles[s.role].icon + ' ' + esc(D.roles[s.role].name) + ' · Stufe ' + s.skill + ' · ' + PT.money(s.salary) + '/Tag</small><small>Laune ' + UI.bar(s.mood) + (s.training ? ' · 🎓 in Schulung' : '') + (s.station ? ' · Arbeitsplatz ✓' : ' · <span class="warn">kein Arbeitsplatz (' + D.roles[s.role].station.map(x => D.objectById[x].name).join(' / ') + ')</span>') + '</small>' +
          '<div class="pt-row"><select data-shift="' + s.id + '">' + Object.keys(SHIFTS).map(k => '<option value="' + k + '"' + (s.shift === k ? ' selected' : '') + '>' + SHIFTS[k] + '</option>').join('') + '</select><button data-act="train" data-id="' + s.id + '"' + (s.training || s.skill >= 10 ? ' disabled' : '') + '>🎓 Schulung ' + PT.money(D.rules.trainingCost + s.skill * 40) + '</button><button data-act="fire" data-id="' + s.id + '">Entlassen</button></div></div></div>').join('') + '</div>' : '<p class="pt-hint">Noch niemand eingestellt.</p>') +
        '<h3>Bewerbungen</h3>' + (!st.unlocks.hire && st.mode === 'career' ? '<p class="pt-hint">Einstellen wird in der Mission „Hilfe in der Medienstraße“ freigeschaltet.</p>' : '') +
        '<div class="pt-cards">' + st.applicants.map(a => '<div class="pt-card">' + (a.npc ? UI.avatar(a.id, 48) : '<span class="pt-ico">' + D.roles[a.role].icon + '</span>') + '<div><b>' + esc(a.name) + '</b> <small>' + esc(D.roles[a.role].name) + ' · Stufe ' + a.skill + ' · ' + PT.money(a.salary) + '/Tag · ' + esc(a.trait) + '</small><small>' + esc(D.roles[a.role].desc) + '</small><div class="pt-row"><button data-act="hire" data-id="' + a.id + '"' + (!st.unlocks.hire && st.mode === 'career' ? ' disabled' : '') + '>Einstellen (Prämie ' + PT.money(a.salary * 2) + ')</button></div></div></div>').join('') + '</div>');
      pnl.body.querySelectorAll('[data-shift]').forEach(sel => { sel.onchange = () => { S.setShift(st, sel.dataset.shift, sel.value); }; });
    }
    UI.bind(pnl.root, {
      hire: b => { const r = S.hire(st, b.dataset.id); if (!r.ok) UI.toast(r.err, 'bad'); else { PT.Audio.fx('good'); G().afterAction(); } render(); },
      fire: b => { const s = st.staff.find(x => x.id === b.dataset.id); UI.confirm('Entlassen?', s.name + ' bekommt eine Abfindung von ' + PT.money(s.salary * 2) + '.', 'Entlassen').then(y => { if (y) { S.fire(st, s.id); G().afterAction(); } render(); }); },
      train: b => { const r = S.train(st, b.dataset.id); UI.toast(r.ok ? 'Ab in die Schulung! Morgen eine Stufe besser.' : r.err, r.ok ? 'good' : 'bad'); G().afterAction(); render(); }
    });
    render();
  };

  // ── Finanzen & Sponsoren ─────────────────────────────────
  UI.finance = function () {
    const st = G().st;
    const pnl = UI.panel('Finanzen & Sponsoren', '', { wide: true, icon: '💶' });
    const IN = { listen: 'Hörer-Erlöse', tail: 'Nachhören', sponsor: 'Sponsoren', merch: 'Merch', events: 'Events & Verkäufe', jobs: 'Nebenjobs', missions: 'Missionen' };
    const OUT = { rent: 'Miete', salary: 'Gehälter', upkeep: 'Unterhalt', repair: 'Reparaturen', build: 'Bauen', staff: 'Personal', production: 'Produktion', travel: 'Reisen' };
    function render() {
      const b = S.balanceToday(st), L = st.today, q = S.repairQuote(st), studio = S.studio(st);
      const rows = (o, names) => Object.keys(names).filter(k => o[k]).map(k => '<li><span>' + names[k] + '</span><b>' + PT.money(o[k]) + '</b></li>').join('') || '<li class="dim">–</li>';
      const sp = st.sponsors.active, spd = sp && D.sponsors.find(x => x.id === sp.id);
      pnl.set('<div class="pt-cols"><div><h3>Heute (Tag ' + st.time.day + ')</h3><p>Kontostand <b>' + UI.money(st.money) + '</b></p><div class="pt-cols2"><div><h4>Einnahmen</h4><ul class="pt-ledger">' + rows(L.inc, IN) + '</ul></div><div><h4>Ausgaben</h4><ul class="pt-ledger">' + rows(L.exp, OUT) + '</ul></div></div>' +
        '<p class="pt-hint">Fixkosten heute Nacht: ' + PT.money(b.fixed) + ' (Miete, Gehälter, Unterhalt ' + PT.money(Math.round(studio.upkeep)) + ') · Nachhören morgen ca. +' + PT.money(b.tail) + '</p>' +
        '<h3>Verlauf</h3><canvas class="pt-chart" width="560" height="160"></canvas>' +
        '<h3>Technik & Gebäude</h3><p>Zuverlässigkeit ' + UI.bar(st.reliab) + ' ' + Math.round(st.reliab) + ' % · Zustand ' + UI.bar(st.condition) + ' ' + Math.round(st.condition) + ' %</p><div class="pt-row">' +
        '<button data-act="repair"' + (st.reliab >= 100 ? ' disabled' : '') + '>🔧 Komplett reparieren (' + PT.money(q.cost) + ')</button>' + (q.free ? '<button data-act="repairfree" class="pri">🆓 Gratis-Grundreparatur</button>' : '') + '<button data-act="renovate"' + (st.condition >= 100 ? ' disabled' : '') + '>🏚️ Renovieren (' + PT.money(Math.round((100 - st.condition) * D.rules.conditionCostPerPoint)) + ')</button></div>' +
        (!st.lots.campus.owned ? '<h3>Campus-Grundstück</h3><p class="pt-hint">' + (st.mode !== 'career' || st.flags['lot:campus'] ? 'Großes Grundstück im Mediencampus für ' + PT.money(S.lotPrice('campus')) + ' Kaution, Miete ' + PT.money(D.rules.rent.campus) + '/Tag.' : 'Wird nach der Medienpreis-Nominierung (Kapitel 5) frei.') + '</p>' + (st.mode !== 'career' || st.flags['lot:campus'] ? '<button data-act="buylot">🏫 Campus pachten</button>' : '') : '') + '</div>' +
        '<div><h3>Sponsoren</h3>' + (!st.unlocks.sponsors && st.mode === 'career' ? '<p class="pt-hint">Sponsoren melden sich ab dem Ende von Kapitel 1.</p>' : '') +
        (sp ? '<div class="pt-card"><span class="pt-ico">' + spd.icon + '</span><div><b>' + esc(spd.name) + '</b><small>' + esc(spd.desc) + '</small><small>Noch ' + sp.left + ' Folgen · erfüllt ' + sp.done + ' · verfehlt ' + sp.missed + ' · ' + PT.money(spd.perEpisode) + ' je Folge, Bonus ' + PT.money(spd.bonus) + '</small></div></div>' : '<p>Kein laufender Vertrag.</p>') +
        '<h4>Angebote</h4>' + (st.sponsors.offers.length ? st.sponsors.offers.map(id => { const s = D.sponsors.find(x => x.id === id); return '<div class="pt-card"><span class="pt-ico">' + s.icon + '</span><div><b>' + esc(s.name) + '</b><small>' + esc(s.desc) + '</small><small>' + s.episodes + ' Folgen · ' + PT.money(s.perEpisode) + ' je Folge · Bonus ' + PT.money(s.bonus) + (s.malus ? ' · Vertragsstrafe ' + PT.money(s.malus) : '') + '</small><div class="pt-row"><button data-act="sponsor" data-id="' + s.id + '"' + (sp ? ' disabled' : '') + '>Unterschreiben</button></div></div></div>'; }).join('') : '<p class="pt-hint">Neue Angebote kommen alle paar Tage – mehr Fans locken größere Partner.</p>') +
        '<p class="pt-hint">Alle Sponsoren sind fiktiv. Werbung wird in der Folge ehrlich als solche genannt.</p></div></div>');
      chart(pnl.body.querySelector('.pt-chart'));
    }
    function chart(cv) {
      const g = cv.getContext('2d'), Ls = st.ledger.slice(-14), w = cv.width, h = cv.height; g.clearRect(0, 0, w, h);
      if (!Ls.length) { g.fillStyle = '#8fa3bd'; g.font = '16px system-ui'; g.fillText('Noch keine abgeschlossenen Tage.', 12, 30); return; }
      const sum = o => Object.values(o).reduce((a, b) => a + b, 0), vals = Ls.map(L => ({ i: sum(L.inc), o: sum(L.exp), m: L.money }));
      const mx = Math.max(1, ...vals.map(v => Math.max(v.i, v.o))), bw = w / 14;
      vals.forEach((v, k) => { g.fillStyle = '#4be08a'; g.fillRect(k * bw + 4, h - 20 - v.i / mx * (h - 40), bw / 2 - 4, v.i / mx * (h - 40)); g.fillStyle = '#ff4d6d'; g.fillRect(k * bw + bw / 2, h - 20 - v.o / mx * (h - 40), bw / 2 - 4, v.o / mx * (h - 40)); g.fillStyle = '#8fa3bd'; g.font = '11px system-ui'; g.fillText('T' + Ls[k].day, k * bw + 4, h - 5); });
      const mm = Math.max(1, ...vals.map(v => Math.abs(v.m))); g.strokeStyle = '#ffb02e'; g.lineWidth = 2; g.beginPath(); vals.forEach((v, k) => { const y = h / 2 - v.m / mm * (h / 2 - 22); if (k) g.lineTo(k * bw + bw / 2, y); else g.moveTo(k * bw + bw / 2, y); }); g.stroke();
    }
    UI.bind(pnl.root, {
      repair: () => { const r = S.repair(st, true); UI.toast(r.ok ? 'Alles repariert!' : r.err, r.ok ? 'good' : 'bad'); G().afterAction(); render(); },
      repairfree: () => { const r = S.repair(st, false); UI.toast(r.ok ? 'Grundreparatur erledigt.' : r.err, r.ok ? 'good' : 'bad'); G().afterAction(); render(); },
      renovate: () => { const r = S.renovate(st); UI.toast(r.ok ? 'Frisch renoviert!' : r.err, r.ok ? 'good' : 'bad'); G().afterAction(); render(); },
      sponsor: b => { const r = S.sponsorAccept(st, b.dataset.id); UI.toast(r.ok ? 'Vertrag unterschrieben!' : r.err, r.ok ? 'good' : 'bad'); G().afterAction(); render(); },
      buylot: () => { const r = S.buyLot(st, 'campus'); if (r.ok) { G().world && G().world.load(st); PT.Audio.fx('cash'); } else UI.toast(r.err, 'bad'); G().afterAction(); render(); }
    });
    render();
  };

  // ── Journal ──────────────────────────────────────────────
  UI.journal = function () {
    const st = G().st, pnl = UI.panel('Journal', '', { wide: true, icon: '📓' });
    let tab = 'mission';
    function where(id) { const n = D.npcs.find(x => x.id === id) || D.hosts.find(x => x.id === id); const m = D.missions.concat(D.sideMissions).find(x => x.actor === id); return n ? n.name : id; }
    function render() {
      let h = '<div class="pt-tabs">' + [['mission', '🎯 Missionen'], ['side', '📌 Nebenmissionen'], ['ach', '🏅 Erfolge'], ['story', '📖 Geschichte']].map(([k, n]) => '<button data-act="tab" data-t="' + k + '" class="' + (tab === k ? 'sel' : '') + '">' + n + '</button>').join('') + '</div>';
      if (tab === 'mission') {
        if (st.mode === 'challenge') { const c = S.challengeStatus(st); h += '<h3>' + c.c.icon + ' ' + esc(c.c.name) + '</h3><p>' + esc(c.c.desc) + '</p><p>Noch ' + c.daysLeft + ' Tage</p><ul class="pt-obj">' + c.items.map(i => '<li class="' + (i.have >= i.need ? 'done' : '') + '">' + esc(i.label) + ': ' + PT.fmt(i.have) + ' / ' + PT.fmt(i.need) + '</li>').join('') + '</ul>'; }
        else if (st.mode === 'creative') h += '<p>Kreativmodus: unbegrenztes Geld, alles freigeschaltet. Baue das Studio deiner Träume!</p>';
        const m = S.currentMission(st);
        if (m) {
          const ch = D.chapters[m.ch - 1];
          h += '<p class="pt-hint">Kapitel ' + m.ch + ': ' + esc(ch.title) + ' · Mission ' + (st.missions.done.length + 1) + ' von 60</p><h3>' + esc(m.title) + '</h3>';
          if (st.missions.curState === 'offer') h += '<p>👉 Sprich mit <b>' + esc(where(m.actor)) + '</b> (' + esc(D.districts.find(d => d.id === m.loc).name) + '), um die Mission zu starten.</p>';
          else h += '<ul class="pt-obj">' + S.missionProgress(st, m, st.missions.prog).map(p => '<li class="' + (p.done ? 'done' : '') + '">' + esc(p.label) + (p.need > 1 ? ' (' + PT.fmt(Math.min(p.have, p.need)) + ' / ' + PT.fmt(p.need) + ')' : '') + '</li>').join('') + '</ul>';
          const r = m.rew || {}; h += '<p class="pt-hint">Belohnung: ' + [r.money ? PT.money(r.money) : '', r.fans ? r.fans + ' Fans' : '', r.rep ? 'Ruf +' + r.rep : '', (r.unlock || []).length ? 'Freischaltung!' : ''].filter(Boolean).join(' · ') + '</p>';
        } else if (st.endless) {
          h += '<h3>♾️ Endlosmodus – Woche ' + st.endless.week + '</h3><ul class="pt-obj">' + st.endless.goals.map(g => '<li class="' + (g.done ? 'done' : '') + '">' + esc(g.label) + ' (+' + PT.money(g.rew) + ')</li>').join('') + '</ul>';
        }
        h += '<h4>Erledigt (' + st.missions.done.length + ')</h4><ul class="pt-mini">' + st.missions.done.slice(-8).reverse().map(id => '<li>✓ ' + esc(D.missions.find(x => x.id === id).title) + '</li>').join('') + '</ul>';
      } else if (tab === 'side') {
        const act = Object.keys(st.missions.side).filter(id => st.missions.side[id].state === 'active'), done = Object.keys(st.missions.side).filter(id => st.missions.side[id].state === 'done');
        h += '<h3>Aktiv</h3>' + (act.length ? act.map(id => { const sm = D.sideMissions.find(x => x.id === id); return '<div class="pt-card"><div><b>' + esc(sm.title) + '</b><ul class="pt-obj">' + S.missionProgress(st, sm, st.missions.side[id].prog).map(p => '<li class="' + (p.done ? 'done' : '') + '">' + esc(p.label) + (p.need > 1 ? ' (' + Math.min(p.have, p.need) + '/' + p.need + ')' : '') + '</li>').join('') + '</ul></div></div>'; }).join('') : '<p class="pt-hint">Keine.</p>') +
          '<h3>Verfügbar</h3><ul class="pt-mini">' + D.sideMissions.filter(sm => S.sideAvailable(st, sm)).map(sm => '<li>📌 ' + esc(sm.title) + ' – bei ' + esc(where(sm.actor)) + '</li>').join('') + '</ul><p class="pt-hint">Erledigt: ' + done.length + ' von ' + D.sideMissions.length + '</p>';
      } else if (tab === 'ach') {
        h += '<div class="pt-achs">' + D.achievements.map(a => '<div class="pt-ach ' + (st.ach[a.id] ? 'ok' : '') + '"><span>' + a.icon + '</span><b>' + esc(a.title) + '</b><small>' + esc(a.desc) + (st.ach[a.id] ? ' ✓ Tag ' + st.ach[a.id] : '') + '</small></div>').join('') + '</div>';
      } else {
        h += D.chapters.filter(c => c.n <= (st.chapter || 1)).map(c => '<h3>Kapitel ' + c.n + ': ' + esc(c.title) + '</h3><p>' + esc(c.intro) + '</p>').join('') +
          '<p class="pt-hint">Euer Stil bisher: 🌀 Chaos ' + PT.round(st.story.chaos, 1) + ' · 💛 Publikum ' + PT.round(st.story.publikum, 1) + ' · 🏆 Legende ' + PT.round(st.story.legende, 1) + '</p>' + (st.story.ending ? '<p>Ende: <b>' + D.endings[st.story.ending].icon + ' ' + esc(D.endings[st.story.ending].title) + '</b></p>' : '');
      }
      pnl.set(h);
    }
    UI.bind(pnl.root, { tab: b => { tab = b.dataset.t; render(); } });
    render();
  };

  // ── Archiv ───────────────────────────────────────────────
  UI.archive = function () {
    const st = G().st, pnl = UI.panel('Folgen-Archiv (' + st.episodes.length + ')', '', { wide: true, icon: '🗄️' });
    let open = null;
    function render() {
      if (!st.episodes.length) { pnl.set('<p>Noch keine Folgen. Ab ins Studio!</p>'); return; }
      if (open) {
        const e = st.episodes.find(x => x.id === open), r = D.rubrics.find(x => x.id === e.rubric);
        pnl.set('<button data-act="back">◀ Zurück</button><div class="pt-rep-head"><canvas width="160" height="160"></canvas><div><h3>' + esc(e.title) + '</h3><p>' + UI.stars(e.stars) + ' · ' + e.q + ' %</p><p>' + r.icon + ' ' + esc(r.name) + (e.guest ? ' · Gast: ' + esc(D.guests.find(g => g.id === e.guest).name) : '') + (e.video ? ' · 🎥 Video' : '') + '</p><p>Tag ' + e.day + ' · ' + PT.fmt(e.total) + ' Hörer gesamt · ' + PT.money(e.revenue + (e.merch || 0) + (e.sponsor || 0)) + ' Einnahmen</p></div></div><ul class="pt-comments">' + e.comments.map(c => '<li>💬 ' + esc(c) + '</li>').join('') + '</ul>' + (e.editDetail ? '<p class="pt-hint">Schnitt: ' + esc(e.editDetail) + '</p>' : ''));
        UI.drawCover(pnl.body.querySelector('canvas'), { cover: e.cover, title: e.title, icon: e.icon, accent: e.accent }); return;
      }
      pnl.set('<div class="pt-eps">' + st.episodes.slice().reverse().map(e => '<button data-act="ep" data-id="' + e.id + '" class="pt-ep"><canvas width="72" height="72" data-ep="' + e.id + '"></canvas><b>' + esc(e.title) + '</b><small>' + UI.stars(e.stars) + ' ' + e.q + ' % · ' + PT.fmt(e.total) + ' Hörer · Tag ' + e.day + '</small></button>').join('') + '</div>');
      pnl.body.querySelectorAll('canvas[data-ep]').forEach(cv => { const e = st.episodes.find(x => x.id === cv.dataset.ep); UI.drawCover(cv, { cover: e.cover, title: '', icon: e.icon, accent: e.accent }); });
    }
    UI.bind(pnl.root, { ep: b => { open = b.dataset.id; render(); }, back: () => { open = null; render(); } });
    render();
  };

  // ── Karte & Schnellreise ─────────────────────────────────
  UI.map = function () {
    const g = G(), st = g.st, pnl = UI.panel('Stadtplan & Schnellreise', '<canvas class="pt-bigmap" width="540" height="540"></canvas><div class="pt-travel"></div>', { wide: true, icon: '🗺️' });
    const m = S.currentMission(st), target = m && st.missions.curState === 'active' ? m.loc : m ? m.actor : null;
    const cv = pnl.body.querySelector('canvas'); if (g.world) g.world.minimap(cv.getContext('2d'), cv.width, cv.height, { target, big: true });
    pnl.body.querySelector('.pt-travel').innerHTML = D.districts.map(d => '<button data-act="go" data-id="' + d.id + '"' + (st.unlocks.districts[d.id] ? '' : ' disabled') + '>' + (d.icon || '📍') + ' ' + esc(d.name) + (st.unlocks.districts[d.id] ? '' : ' 🔒') + (m && m.loc === d.id ? ' 🎯' : '') + '</button>').join('');
    UI.bind(pnl.root, { go: b => { pnl.close(); g.travel(b.dataset.id); } });
  };

  // ── Speichern & Laden ────────────────────────────────────
  UI.slots = function (mode) {
    const g = G(), repo = g.repo, list = repo.list();
    const slots = mode === 'save' ? ['slot1', 'slot2', 'slot3'] : repo.SLOTS;
    return new Promise(resolve => {
      const pnl = UI.panel(mode === 'save' ? 'Speichern' : 'Laden', '<div class="pt-list">' + slots.map(s => { const e = list.find(x => x.slot === s); return '<button class="pt-opt" data-act="slot" data-s="' + s + '"' + (mode === 'load' && !e ? ' disabled' : '') + '><b>' + esc(repo.SLOT_NAMES[s]) + '</b><small>' + (e ? 'Tag ' + e.meta.day + ' · Kapitel ' + e.meta.chapter + ' · ' + PT.money(e.meta.money) + ' · ' + PT.fmt(e.meta.fans) + ' Fans · ' + e.meta.episodes + ' Folgen · ' + new Date(e.at).toLocaleString('de-DE') : 'leer') + '</small></button>' + (e && mode === 'load' && s !== 'auto' ? '<button class="pt-del" data-act="del" data-s="' + s + '">🗑️ löschen</button>' : ''); }).join('') + '</div>' +
        (mode === 'save' ? '<p class="pt-hint">Das Spiel speichert außerdem automatisch. Mit Google-Anmeldung (Cloud) werden Spielstände geräteübergreifend gesichert.</p>' : ''), { icon: mode === 'save' ? '💾' : '📂', onClose: v => resolve(v || null) });
      UI.bind(pnl.root, {
        slot: b => pnl.close(b.dataset.s),
        del: b => { UI.confirm('Spielstand löschen?', repo.SLOT_NAMES[b.dataset.s] + ' wird endgültig gelöscht.', 'Löschen').then(y => { if (y) { repo.remove(b.dataset.s); pnl.close(); UI.slots(mode).then(resolve); } }); }
      });
    });
  };

  // ── Pause ────────────────────────────────────────────────
  UI.pause = function () {
    const g = G();
    const pnl = UI.panel('Pause', '<div class="pt-list"><button class="pt-opt" data-act="go" data-primary><b>▶ Weiter</b></button><button class="pt-opt" data-act="save"><b>💾 Speichern</b></button><button class="pt-opt" data-act="load"><b>📂 Laden</b></button><button class="pt-opt" data-act="party"><b>🎉 Party-Runde</b><small>Minispiele lokal mit Freunden</small></button><button class="pt-opt" data-act="opts"><b>⚙️ Optionen</b></button><button class="pt-opt" data-act="help"><b>🎮 Steuerung & Hilfe</b></button><button class="pt-opt" data-act="menu"><b>🏠 Hauptmenü</b><small>speichert automatisch</small></button></div>', { icon: '⏸' });
    UI.bind(pnl.root, {
      go: () => pnl.close(),
      save: () => UI.slots('save').then(s => { if (!s) return; const r = g.repo.save(s, g.st); UI.toast(r.ok ? 'Gespeichert: ' + g.repo.SLOT_NAMES[s] : r.err, r.ok ? 'good' : 'bad'); if (r.ok) g.slot = s; }),
      load: () => UI.slots('load').then(s => { if (!s) return; pnl.close(); g.loadSlot(s); }),
      party: () => { pnl.close(); UI.party(); },
      opts: () => UI.options(),
      help: () => UI.help(),
      menu: () => { pnl.close(); g.toMenu(); }
    });
  };

  // ── Optionen ─────────────────────────────────────────────
  const ACTIONS = { interact: 'Sprechen / Benutzen', build: 'Baumodus', prod: 'Produktion', team: 'Team', finance: 'Finanzen', journal: 'Journal', archive: 'Archiv', map: 'Karte', run: 'Rennen (halten)', pause: 'Pause' };
  UI.DEFAULT_KEYS = { interact: 'KeyE', build: 'KeyB', prod: 'KeyP', team: 'KeyT', finance: 'KeyF', journal: 'KeyJ', archive: 'KeyO', map: 'KeyM', run: 'ShiftLeft', pause: 'Escape' };
  UI.DEFAULT_SETTINGS = { quality: 'auto', master: 0.8, music: 0.45, fx: 0.8, voice: 0.6, textSize: 1, contrast: false, reducedMotion: false, tips: true, fps: false, timeSpeed: 1, keys: Object.assign({}, UI.DEFAULT_KEYS), lang: 'de', latency: 0 };
  UI.applySettings = function (s) {
    UI.settings = s;
    document.documentElement.style.setProperty('--fs', String(s.textSize || 1));
    document.body.classList.toggle('hc', !!s.contrast); document.body.classList.toggle('rm', !!s.reducedMotion);
    ['master', 'music', 'fx', 'voice'].forEach(k => PT.Audio.setVolume(k, s[k]));
    const g = G(); if (g && g.world) g.world.setQuality(g.qualityFor(s.quality));
  };
  UI.options = function () {
    const g = G(), s = UI.settings;
    const pnl = UI.panel('Optionen', '', { wide: true, icon: '⚙️', onClose: () => g.repo.saveSettings(UI.settings) });
    function render() {
      const sl = (k, n) => '<label class="pt-range"><span>' + n + '</span><input type="range" min="0" max="1" step="0.05" data-k="' + k + '" value="' + s[k] + '"></label>';
      const seg = (k, opts) => '<div class="pt-seg">' + opts.map(([v, n]) => '<button data-act="set" data-k="' + k + '" data-v="' + v + '" class="' + (String(s[k]) === String(v) ? 'sel' : '') + '">' + n + '</button>').join('') + '</div>';
      const tog = (k, n) => '<label class="pt-check"><input type="checkbox" data-t="' + k + '"' + (s[k] ? ' checked' : '') + '> ' + n + '</label>';
      pnl.set('<div class="pt-cols"><div><h3>Grafik</h3>' + seg('quality', [['auto', 'Automatisch'], ['low', 'Niedrig'], ['mid', 'Mittel'], ['high', 'Hoch']]) + tog('fps', 'Bilder pro Sekunde anzeigen') +
        '<h3>Ton</h3>' + sl('master', 'Gesamt') + sl('music', 'Musik') + sl('fx', 'Effekte') + sl('voice', 'Stimmen') +
        '<h3>Spiel</h3><p>Tempo der Spielzeit</p>' + seg('timeSpeed', [[0.5, 'Gemütlich'], [1, 'Normal'], [2, 'Schnell']]) + tog('tips', 'Tipps anzeigen') +
        '<h3>Sprache</h3>' + seg('lang', [['de', 'Deutsch']]) + '<p class="pt-hint">Weitere Sprachen sind vorbereitet.</p></div>' +
        '<div><h3>Lesbarkeit & Barrierefreiheit</h3><p>Textgröße</p>' + seg('textSize', [[1, 'Normal'], [1.15, 'Groß'], [1.3, 'Sehr groß']]) + tog('contrast', 'Hoher Kontrast') + tog('reducedMotion', 'Weniger Bewegung (keine Kamerafahrten, Text sofort)') +
        '<h3>Tastenbelegung</h3><div class="pt-keys">' + Object.keys(ACTIONS).map(a => '<button data-act="key" data-a="' + a + '"><span>' + ACTIONS[a] + '</span><b>' + esc(keyName(s.keys[a])) + '</b></button>').join('') + '</div><button data-act="keyreset">Standard wiederherstellen</button></div></div>');
      pnl.body.querySelectorAll('input[type=range]').forEach(i => { i.oninput = () => { s[i.dataset.k] = +i.value; UI.applySettings(s); }; i.onchange = () => PT.Audio.fx('beep'); });
      pnl.body.querySelectorAll('input[data-t]').forEach(i => { i.onchange = () => { s[i.dataset.t] = i.checked; UI.applySettings(s); }; });
    }
    UI.bind(pnl.root, {
      set: b => { const v = b.dataset.v; s[b.dataset.k] = isNaN(+v) ? v : +v; UI.applySettings(s); render(); },
      key: b => {
        b.querySelector('b').textContent = 'Taste drücken …';
        const f = e => { e.preventDefault(); e.stopPropagation(); removeEventListener('keydown', f, true); if (e.code !== 'Escape' || b.dataset.a === 'pause') { Object.keys(s.keys).forEach(a => { if (s.keys[a] === e.code) s.keys[a] = ''; }); s.keys[b.dataset.a] = e.code; } render(); };
        addEventListener('keydown', f, true);
      },
      keyreset: () => { s.keys = Object.assign({}, UI.DEFAULT_KEYS); render(); }
    });
    render();
  };
  function keyName(code) { if (!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace('ShiftLeft', 'Umschalt').replace('Escape', 'Esc').replace('Space', 'Leertaste').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('ArrowLeft', '←').replace('ArrowRight', '→'); }
  UI.keyName = keyName;

  UI.help = function () {
    const k = UI.settings.keys;
    UI.panel('Steuerung & Hilfe', '<div class="pt-cols"><div><h3>⌨️ Tastatur & Maus</h3><ul class="pt-mini"><li>Laufen: W A S D oder Pfeiltasten, ' + keyName(k.run) + ' halten = rennen</li><li>' + keyName(k.interact) + ': sprechen, Nebenjob, Pult benutzen</li><li>' + keyName(k.build) + ': Baumodus · ' + keyName(k.prod) + ': Produktion · ' + keyName(k.team) + ': Team · ' + keyName(k.finance) + ': Finanzen</li><li>' + keyName(k.journal) + ': Journal · ' + keyName(k.archive) + ': Archiv · ' + keyName(k.map) + ': Karte · ' + keyName(k.pause) + ': Pause</li><li>Baumodus: Klick setzt, R dreht, Strg+Z/Y rückgängig/wiederholen, Mausrad zoomt, rechte Maustaste schiebt, Q/E drehen die Ansicht, 1–8 Werkzeuge</li></ul>' +
      '<h3>👆 Touch</h3><ul class="pt-mini"><li>Linker Daumen: Joystick zum Laufen</li><li>Rechts: Aktionsknopf (erscheint in der Nähe von Personen und Pulten)</li><li>Oben: Knöpfe für Bauen, Produktion, Team, Finanzen, Journal, Karte</li><li>Baumodus: ein Finger schiebt, zwei Finger zoomen, Tippen setzt</li></ul>' +
      '<h3>🎮 Controller</h3><ul class="pt-mini"><li>Linker Stick: laufen · A: bestätigen · B: zurück · Y: sprechen · Start: Produktion · Select: Karte</li></ul></div>' +
      '<div><h3>So läuft das Spiel</h3><ul class="pt-mini"><li>Folgen produzieren bringt Hörer, Geld, Fans und Ruf.</li><li>Qualität entsteht aus Planung, Recherche, Technik im Aufnahmeraum, Aufnahme, Schnitt und der Form von Marco und Andrew.</li><li>Räume brauchen Wände rundum, eine Tür und die richtigen Objekte – die Raum-Übersicht im Baumodus zeigt, was fehlt.</li><li>Jeden Abend werden Miete, Gehälter und Unterhalt fällig. Knapp bei Kasse? Kurzfolgen gehen immer, Nebenjobs in den Bezirken bringen schnell Geld, die Grundreparatur ist gratis.</li><li>Missionen stehen im Journal; die Karte zeigt das Ziel.</li></ul></div></div>', { wide: true, icon: '🎮' });
  };
})(typeof window !== 'undefined' ? window : globalThis);

'use strict';
/* Bunte Insel – Aufgaben-Log: alle Aufgaben und Hinweise an einem Ort, mit ✅ (fertig) und ⬜ (offen) und „👣 Weg“-Knopf.
   Das Log steckt im Inselreise-Fenster (story.js): 📋 links oder Tipp auf die Anzeige oben öffnet es. Gesammelt werden:
   ▶ Als Nächstes (alles, was gerade offen ist + Tipps), 📖 Inselreise, 🚜 Hof-Aufgaben, 🚨 Fellretter-Einsätze, 📦 Aufträge, 🎁 Tagesgeschenk.
   Reine Anzeige, kein eigener Spielstand – die Daten kommen aus den jeweiligen Systemen. */
BI.TASKLOG_DEST = { karussell: 'park', fussball: 'fussball', maerchen: 'maerchen', eisbude: 'park', parkeingang: 'park', staedte: 'city', staedte2: 'city', staedte3: 'city', spielzeug: 'shop', buehne: 'rainbow', plaza: 'rainbow', tierpark: 'zoo', camp: 'camp', bad: 'pool', hospital: 'hospital', spielplatz: 'playground', wald: 'forest', kino: 'cinema', steg: 'pier', bahnhof: 'station', bauernhof: 'hof', leuchtturm: 'lighthouse' };
BI.injectLogCss = function () {
  if (!document.getElementById('bi-log-css')) { const st = document.createElement('style'); st.id = 'bi-log-css';
    st.textContent = '.lgBar{height:12px;border-radius:8px;background:rgba(0,0,0,.14);overflow:hidden;margin:4px 0 6px}.lgBar i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#ffb23f,#4cd07d)}.lgW{margin:6px 0;padding:6px 8px;border-radius:12px;background:rgba(255,255,255,.55)}.lgW.lock{background:rgba(255,230,160,.6)}.lgW b{font-size:16px}.lgW .qtask{font-size:14px}.lgSec{margin:8px 0;border-radius:16px;background:rgba(255,255,255,.45);padding:2px 8px 6px}.lgSec>summary{cursor:pointer;font-weight:800;padding:8px 4px;font-size:17px;list-style:none}.lgSec>summary::-webkit-details-marker{display:none}.lgSec>summary::before{content:"▸ "}.lgSec[open]>summary::before{content:"▾ "}'
      + '.qtask.cur{background:rgba(255,226,122,.75);opacity:1}.lgTip{margin:5px 2px;font-weight:600;font-size:15px}.lgSub{font-weight:800;margin:8px 2px 2px;font-size:15px}.lgCh{margin:4px 0;opacity:.9}.lgDay{font-weight:700;margin:6px 2px}#farmBar{display:none!important}.qbarw,#questCount{display:none}.lgSec{background:rgba(255,255,255,.68);border:1px solid rgba(255,255,255,.82);padding:4px 12px 10px;margin:9px 0;box-shadow:0 5px 16px rgba(26,58,91,.08)}.lgSec>summary{font-size:clamp(15px,2.3vw,18px);line-height:1.28;padding:12px 2px;color:#173854}.qtask{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;margin:6px 0;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.82);font-size:clamp(14px,2vw,16px);line-height:1.35}.qtask span{min-width:0}.qtask .pill{padding:8px 12px;font-size:14px;white-space:nowrap}.qtask.ok{background:rgba(229,245,235,.86);color:#53677c}.qtask.cur{background:linear-gradient(100deg,#fff1b6,#fff8dc);box-shadow:inset 4px 0 #ffae32}.lgTip{padding:9px 12px;border-radius:12px;background:#eff6ff;font-size:14px;line-height:1.45;color:#38526b}.lgW{padding:10px 12px}.lgSub{margin-top:10px;font-size:16px}.lgCh{padding:4px 0;font-size:14px}@media(max-width:520px){.qtask{grid-template-columns:minmax(0,1fr);gap:5px}.qtask .pill{justify-self:start}.lgSec>summary{font-size:15px}}';
    document.head.appendChild(st); }
};
BI.renderTaskLog = function (box, D) {
  BI.injectLogCss();
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };
  const row = (ok, icon, text, dest, cur) => { const r = el('div', 'qtask' + (ok ? ' ok' : '') + (cur ? ' cur' : '')); r.appendChild(el('span', '', (ok ? '✅ ' : '⬜ ') + icon + ' ' + text)); if (!ok && dest && D.guide) { const b = el('button', 'pill', '👣 Weg'); b.onclick = () => D.guide(dest); r.appendChild(b); } return r; };
  const sec = (title, count, open, build) => { const d = document.createElement('details'); d.className = 'lgSec'; d.open = !!open; d.appendChild(el('summary', '', title + (count ? '  ·  ' + count : ''))); build(d); box.appendChild(d); };
  const E = D.einsatz, cs = E && E.state && E.state.cur ? E.missions.find(m => m.id === E.state.cur.id) : null;
  /* ===== ▶ Als Nächstes ===== */
  const next = []; if (cs) { const i = E.state.cur.step; if (i >= cs.steps.length) next.push(['🚨', 'Einsatz „' + cs.title + '“: Bericht an der Einsatz-Tafel in der Fellretter-Bucht', 'pups']); else next.push([cs.steps[i].icon, 'Einsatz „' + cs.title + '“: ' + cs.steps[i].text, BI.TASKLOG_DEST[cs.steps[i].at]]); }
  if (D.mission) next.push([D.mission.icon, 'Auftrag: ' + D.mission.title + (D.mission.n ? ' (Schritt ' + D.mission.i + ' von ' + D.mission.n + ')' : ''), null]);
  if (D.tycoon && D.tycoon.next) next.push([D.tycoon.next.icon, 'Park: ' + D.tycoon.next.title + ' – ' + D.tycoon.next.text, 'park']);
  if (D.farm && D.farm.on) { const c = D.farm.items[D.farm.cur]; next.push(['🚜', 'Hof: ' + c.icon + ' ' + c.title + ' ' + c.p + '/' + c.need + (c.p >= c.need ? ' – zu Bauer Heinz!' : ''), 'hof']); }
  { const c = D.story.chapters.find(q => q.cur); if (c) { const t = c.tasks.find(q => !q.ok); if (t) next.push([t.icon, 'Inselreise – ' + c.name + ': ' + t.text, t.dest]); } }
  /* Story-Modus: solange die Fellretter-Bucht gesperrt ist, nicht dorthin schicken */
  const pupsLock = !!(D.world && D.world.worlds.some(w => w.key === 'PUPS' && !w.open));
  sec('▶ Als Nächstes', next.length ? next.length + ' offen' : '', true, d => {
    if (next.length) next.forEach((n, i) => d.appendChild(row(false, n[0], n[1], n[2], i === 0))); else d.appendChild(el('p', 'help', pupsLock ? '🎉 Gerade ist nichts offen – schau bei Bauer Heinz auf dem Hof vorbei oder schaff Aufgaben für die nächste Welt (unten)!' : '🎉 Gerade ist nichts offen – schau bei der Einsatz-Tafel in der Fellretter-Bucht oder bei Bauer Heinz auf dem Hof vorbei!'));
    const tips = []; if (!cs) tips.push(pupsLock ? '💡 Einsätze gibt es an der Einsatz-Tafel in der Fellretter-Bucht – die Bucht öffnet sich, wenn du ihre 3 Aufgaben geschafft hast (siehe unten).' : '💡 Einsätze nimmst du nur an der Einsatz-Tafel in der Fellretter-Bucht an (🧭 → Fellretter-Bucht).'); if (D.farm && !D.farm.on) tips.push('💡 Bauer Heinz auf dem Bauernhof hat neue Aufgaben für dich.');
    tips.push('💡 Mit 🧭 „Wohin?“ kommst du schnell überall hin, und mit „👣 Weg“ zeigt dir die Insel den Weg.'); if (D.daily && !D.daily.today) tips.push('💡 Dein Tagesgeschenk wartet beim nächsten Start auf dich.'); tips.slice(0, 3).forEach(t => d.appendChild(el('div', 'lgTip', t))); });
  /* ===== 🗺️ Story: Welten freischalten ===== */
  if (D.world) { const Wd = D.world; sec('🗺️ Story: Welten freischalten', Wd.count + ' offen', true, d => {
      const b = el('div', 'lgBar'); const bi = document.createElement('i'); bi.style.width = Math.round(Wd.n / Wd.total * 100) + '%'; b.appendChild(bi); d.appendChild(b);
      d.appendChild(el('p', 'help', 'Jede Welt öffnet sich, wenn du ihre 3 Aufgaben (Sticker) geschafft hast. Gesperrte Welten erkennst du an der Glaswand mit Schloss.'));
      for (const w of Wd.worlds) { const c = el('div', 'lgW' + (w.open ? '' : ' lock')); c.appendChild(el('b', '', (w.open ? '🔓 ' : '🔒 ') + w.icon + ' ' + w.name + (w.open ? ' – offen' : ' – ' + w.p + ' von ' + w.of))); if (!w.open) { const b2 = el('div', 'lgBar'), i2 = document.createElement('i'); i2.style.width = Math.round(w.p / w.of * 100) + '%'; b2.appendChild(i2); c.appendChild(b2); for (const r of w.reqs) c.appendChild(row(r.ok, r.icon, r.text)); } d.appendChild(c); } }); }
  /* ===== 📖 Inselreise ===== */
  { const S = D.story, nDone = S.chapters.filter(c => c.done).length;
    sec((D.world ? '📖 Hauptquest: ' : '📖 ') + 'Die Inselreise', nDone + ' von ' + S.chapters.length + ' Kapiteln', !!S.chapters.find(c => c.cur), d => {
      if (D.world) { const b = el('div', 'lgBar'), bi = document.createElement('i'); bi.style.width = Math.round(nDone / S.chapters.length * 100) + '%'; b.appendChild(bi); d.appendChild(b); }
      for (const c of S.chapters) { if (c.cur) { d.appendChild(el('div', 'lgSub', c.icon + ' Kapitel ' + (S.chapters.indexOf(c) + 1) + ': ' + c.name + ' (jetzt)')); d.appendChild(el('p', 'help', '👩‍💼 ' + c.intro)); for (const t of c.tasks) d.appendChild(row(t.ok, t.icon, t.text, t.dest, false)); }
        else d.appendChild(el('div', 'lgCh', (c.done ? '✅ ' : '⬜ ') + c.icon + ' ' + c.name + (c.done ? '' : ' – ' + c.tasks.map(t => t.icon).join(' ')))); }
      if (S.finished) d.appendChild(el('p', 'help', '🏆 Inselheld! Alle Kapitel geschafft – die Insel gehört dir!')); }); }
  /* ===== 🚜 Hof-Aufgaben ===== */
  if (D.farm) { const F = D.farm, nOk = F.items.filter(q => q.ok).length; sec('🚜 Hof-Aufgaben', nOk + ' von ' + F.items.length + (F.rounds ? ' · Runde ' + (F.rounds + 1) : ''), F.on, d => { for (const q of F.items) d.appendChild(row(q.ok, q.icon, q.title + (q.cur && F.on ? ' ' + q.p + '/' + q.need : ' – ' + q.text), 'hof', q.cur && F.on)); }); }
  /* ===== 🎢 Park-Missionen ===== */
  if (D.tycoon) { const Y = D.tycoon; sec('🎢 Park-Missionen', Y.done.length + ' von ' + Y.missions.length + (Y.medal ? ' 👑' : ''), false, d => { for (const m of Y.missions) d.appendChild(row(Y.done.includes(m.id), m.icon, m.title + ' – ' + m.text, 'park', Y.next && Y.next.id === m.id)); }); }
  /* ===== 🚨 Fellretter-Einsätze ===== */
  if (E) { const n = E.state.done.length; sec('🚨 Fellretter-Einsätze', n + ' von ' + E.missions.length + (E.state.medal ? ' 🥇' : ''), !!cs, d => {
      for (const m of E.missions) { const ok = E.state.done.includes(m.id), act = cs && cs.id === m.id; d.appendChild(row(ok, m.icon, m.title + ' (' + m.pup + ')' + (act ? ' – läuft: Schritt ' + Math.min(E.state.cur.step + 1, m.steps.length + 1) + '/' + (m.steps.length + 1) : ''), null, act));
        if (act) { m.steps.forEach((s, i) => { const done = i < E.state.cur.step; d.appendChild(row(done, '  ' + s.icon, s.text, BI.TASKLOG_DEST[s.at], i === E.state.cur.step)); }); d.appendChild(row(false, '  🚨', 'Bericht an der Einsatz-Tafel (Fellretter-Bucht)', 'pups', E.state.cur.step >= m.steps.length)); } } }); }
  /* ===== 📦 Aufträge ===== */
  sec('📦 Aufträge mit Fahrzeugen', '', !!D.mission, d => { if (D.mission) d.appendChild(row(false, D.mission.icon, D.mission.title + (D.mission.n ? ' – Schritt ' + D.mission.i + ' von ' + D.mission.n : ''), null, true)); else d.appendChild(el('p', 'help', 'Steig in ein Fahrzeug – die Leute auf der Insel fragen dich, ob du einen Auftrag annehmen willst. Dann „Ja“ sagen!')); });
  for (const x of D.extras || []) sec(x.title, x.count, false, d => x.rows.forEach(r => d.appendChild(row(r.ok, r.icon, r.text, r.dest))));
  /* ===== 🎁 Tagesgeschenk ===== */
  if (D.daily) sec('🎁 Tagesgeschenk', '', false, d => d.appendChild(el('div', 'lgDay', (D.daily.today ? '✅ Heute schon abgeholt' : '⬜ Heute noch nicht abgeholt') + ' · ' + D.daily.streak + (D.daily.streak === 1 ? ' Tag' : ' Tage') + ' in Folge')));
};

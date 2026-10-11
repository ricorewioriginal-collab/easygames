/* Urwaldlager – Oberfläche: HUD, Hinweise, Karten/Dialoge, Buschtrommel-Übersicht, Menüs (Titel, neue Staffel,
   Einstellungen, Pause, Anleitung, Prüfungs-Arena), Ergebnis- und Endbildschirme. */
(function (root) {
  'use strict';
  const E = root.UE, I = root.UIn, D = root.JD, T = root.UTrials, Snd = root.USnd;
  const S = () => root.USeason, C = () => root.UCamp, W = () => root.UWorld;
  const UI = { hooks: {} };
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const pad2 = n => String(n).padStart(2, '0');
  const sgn = v => (v > 0 ? '+' : '') + v;
  const G = () => S() && S().G;

  // ---------- Einstellungen ----------
  const SET = 'ul_set';
  UI.set = { quality: 'auto', sens: 1, invertY: false, mouseLock: true, tz: 1, tips: true, speed: 'normal', last: null };
  try { Object.assign(UI.set, JSON.parse(localStorage.getItem(SET) || '{}')); } catch (e) { }
  UI.saveSet = () => { try { localStorage.setItem(SET, JSON.stringify(UI.set)); } catch (e) { } };
  UI.applySet = function () {
    I.sens = UI.set.sens; I.invertY = UI.set.invertY; I.mouseLock = UI.set.mouseLock; document.documentElement.style.setProperty('--tz', UI.set.tz);
    if (!UI.set.mouseLock) I.setLock(false);
  };

  // ---------- kleine Bausteine ----------
  UI.av = (c, mood, cls) => `<div class="avw${c && c.id === 'you' ? ' you' : ''} ${cls || ''}">${root.Avatar ? root.Avatar.svg(c.look || c, mood || 'n') : ''}</div>`;
  UI.hostAv = i => { const L = E.HOST_LOOKS[i] || E.HOST_LOOKS[0]; return `<div class="avw">${root.Avatar.svg(L, 'happy')}</div>`; };
  const chipsHtml = chips => chips && chips.length ? `<div class="chips">${chips.filter(c => c && c[1]).map(c => `<span class="dl ${c[1] > 0 ? 'up' : 'dn'}">${esc(c[0])} ${sgn(c[1])}</span>`).join('')}</div>` : '';
  const nm = c => c.id === 'you' ? 'Du' : C().nm(c);
  UI.isTouch = () => I.touch;
  const tLabel = (k, txt) => I.touch ? txt : `<kbd>${k}</kbd>${txt}`;

  // ---------- Toasts ----------
  UI.toast = function (text, cls) {
    const box = $('toasts'); if (!box) return; const el = document.createElement('div'); el.className = 'toast ' + (cls || ''); el.textContent = text; box.appendChild(el);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 3200 + Math.min(2500, text.length * 25));
  };
  let lastPing = 0, lastWhy = '';
  UI.audPing = function (tot, why) {
    const now = performance.now(); if (why === lastWhy && now - lastPing < 4000) return; lastPing = now; lastWhy = why;
    const n = { S: 'Sympathie', P: 'Leistung', E: 'Unterhaltung' }, parts = Object.keys(tot).filter(k => tot[k]).map(k => `${n[k]} ${sgn(Math.round(tot[k]))}`);
    if (parts.length) UI.toast(`📺 ${parts.join(' · ')} – ${why} (simuliertes Publikum)`, 'aud');
  };

  // ---------- Modale Karten (Warteschlange) ----------
  let modal = null, cur = null, queue = [], inCb = false;
  function modalEl() { if (!modal) { modal = document.createElement('div'); modal.id = 'modal'; modal.className = 'ovl'; modal.hidden = true; $('ui').appendChild(modal); modal.addEventListener('click', onModalClick); } return modal; }
  function onModalClick(e) {
    const b = e.target.closest('[data-m]'); if (!b || !cur) return; const o = cur; const id = o.ids ? o.ids[+b.dataset.m] : b.dataset.m;
    if (b.dataset.keep) { o.onBtn && o.onBtn(id, b); return; }
    Snd.click(); cur = null; modal.hidden = true; modal.innerHTML = ''; I.clearEdges();
    if (o.cb) { inCb = true; try { o.cb(id); } finally { inCb = false; } }
    showNext();
  }
  function showNext() {
    if (cur || !queue.length) return; cur = queue.shift(); const o = cur, m = modalEl();
    const btns = o.buttons || [{ id: 'ok', label: 'Weiter ▶', cls: 'go big' }]; o.ids = btns.map(b => b.id);
    m.innerHTML = `<div class="card pop ${o.cls || ''}">${o.title ? `<h2>${o.title}</h2>` : ''}${o.html || ''}<div class="${o.vertical ? 'opts' : 'row c'}">${btns.map((b, i) => `<button class="btn ${b.cls || ''}" data-m="${i}">${o.vertical && !I.touch ? `<kbd>${i + 1}</kbd> ` : ''}${b.label}</button>`).join('')}</div></div>`;
    m.hidden = false; I.setLock(false);
    if (o.bars) requestAnimationFrame(() => requestAnimationFrame(() => m.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; })));
    if (o.onShow) o.onShow(m);
    const card = m.querySelector('.card'); if (card) card.scrollTop = 0;
  }
  UI.card = function (o, cb) { const it = Object.assign({}, o, { cb }); if (inCb) queue.unshift(it); else queue.push(it); showNext(); };
  UI.announce = function (o) { UI.card({ title: o.title, html: o.html, buttons: [{ id: 'ok', label: o.short ? 'OK ▶' : 'Alles klar ▶', cls: 'go big' }] }); Snd.drum(); };
  UI.choice = function (o) { UI.card({ title: o.title, html: `<p class="bubble">${esc(o.text)}</p>`, vertical: true, buttons: o.options.map(x => ({ id: x.id, label: esc(x.label), cls: 'opt' })) }, id => o.onPick(id)); };
  UI.choiceResult = function (text, chips, cb) { UI.card({ html: `<p class="bubble">${esc(text)}</p>${chipsHtml(chips)}`, buttons: [{ id: 'ok', label: 'Weiter ▶', cls: 'go' }] }, () => { cb && cb(); }); };
  UI.modalOpen = () => !!cur || !!queue.length || menuOpen() || !$('mini').hidden || UI.dialogOpen();
  UI.blocking = () => UI.modalOpen() || !!fading;
  UI.closeAll = () => { queue = []; cur = null; if (modal) { modal.hidden = true; modal.innerHTML = ''; } UI.closeDialog(); };

  // ---------- Dialog mit Mitcampern ----------
  let dlgOpen = false, dlgPick = null, dlgOpts = [];
  UI.dialogOpen = () => dlgOpen;
  UI.dialog = function (o) {
    const el = $('dlg'), c = o.who || {}, r = c.id && c.id !== 'you' ? C().rel(c.id, 'you') : 0, mood = c.needs && c.needs.mood < 30 ? 'sad' : r >= 40 ? 'happy' : 'n';
    dlgOpts = o.options || []; dlgPick = o.onPick; dlgOpen = true; I.setLock(false);
    el.innerHTML = `${UI.av(c, mood)}<div class="dbox"><div class="dname">${esc(c.name || '')}<small>${esc(c.job || '')}${c.id ? ` · ${C().relIcon(r)} ${r > 0 ? '+' : ''}${Math.round(r)}` : ''}</small></div><div class="dtext">„${esc(o.text)}“</div>${chipsHtml(o.chips)}<div class="dopts">${dlgOpts.map((x, i) => `<button class="btn" data-d="${i}">${I.touch ? '' : `<kbd>${i + 1}</kbd> `}${esc(x.label)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>`).join('')}</div></div>`;
    el.hidden = false;
  };
  UI.closeDialog = () => { const el = $('dlg'); if (el) { el.hidden = true; el.innerHTML = ''; } dlgOpen = false; dlgPick = null; I.clearEdges(); };
  function dlgChoose(i) { const x = dlgOpts[i]; if (!x || !dlgPick) return; Snd.click(); dlgPick(x.id); }

  // Tastatur für Karten/Dialoge (vor der Spielsteuerung abgefangen)
  root.addEventListener('keydown', e => {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    const num = /^(Digit|Numpad)([1-9])$/.exec(e.code), k = e.code;
    if (cur && modal && !modal.hidden) {
      const btns = modal.querySelectorAll('[data-m]');
      if (num && cur.vertical) { const b = btns[+num[2] - 1]; if (b) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); } return; }
      if ((k === 'Enter' || k === 'Space' || k === 'KeyE') && !e.repeat && !cur.vertical) { const b = modal.querySelector('[data-m].go,[data-m].gold,[data-m].red') || btns[0]; if (b) { e.preventDefault(); e.stopImmediatePropagation(); b.click(); } }
      return;
    }
    if (dlgOpen) {
      if (num) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) dlgChoose(+num[2] - 1); return; }
      if (k === 'Escape' || k === 'KeyQ') { const i = dlgOpts.findIndex(x => x.id === 'bye'); if (i >= 0) { e.preventDefault(); e.stopImmediatePropagation(); dlgChoose(i); } }
    }
  }, true);
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-d]'); if (b && dlgOpen) dlgChoose(+b.dataset.d); });

  // ---------- Überblenden ----------
  let fading = false, fadeEl = null;
  UI.fade = function (cb) {
    if (!fadeEl) { fadeEl = document.createElement('div'); fadeEl.id = 'fade'; $('ui').appendChild(fadeEl); }
    fading = true; fadeEl.className = 'on'; const ms = E.speed > 1 ? 30 : 380;
    setTimeout(() => { try { cb && cb(); } catch (err) { console.error(err); } setTimeout(() => { fadeEl.className = ''; fading = false; }, ms / 2); }, ms);
  };

  // ---------- HUD ----------
  let hudOff = true, hudBuilt = false, hudT = 0, tutLine = '', lastTask = '';
  UI.buildHud = function () {
    const h = $('hud'); if (hudBuilt) return; hudBuilt = true;
    h.innerHTML = `<div class="chip" id="hudClock"><b id="hcT">08:00</b><small id="hcD"></small></div>
      <div id="hudNeeds"><div class="chip" title="Sattheit">🍗<div class="mini"><i id="hnH"></i></div></div><div class="chip" title="Energie">⚡<div class="mini"><i id="hnE"></i></div></div><div class="chip" title="Laune">😊<div class="mini"><i id="hnM"></i></div></div></div>
      <div class="chip" id="hudSup" title="Vorräte: Holz, Wasser, Feuer">🪵<b id="hsW">0</b> 💧<b id="hsA">0</b> 🔥<div class="mini"><i id="hsF"></i></div></div>
      <div class="hsp"></div><button class="chip hb" id="hbDrum" aria-label="Buschtrommel-Übersicht">🥁<span class="hk">Tab</span></button><button class="chip hb" id="hbPause" aria-label="Pause">❚❚</button>`;
    $('hbDrum').onclick = () => { Snd.click(); UI.drumPanel(); };
    $('hbPause').onclick = () => { Snd.click(); UI.pause(); };
  };
  UI.hudHidden = function (b) {
    hudOff = !!b; ['hud', 'minimap', 'hudTask', 'labels'].forEach(id => { const el = $(id); if (el) el.hidden = hudOff; });
    if (hudOff) { $('prompt').hidden = true; $('marker').hidden = true; $('tjoyHint').classList.remove('on'); }
  };
  UI.hudIsOff = () => hudOff;
  const setW = (el, v) => { const s = Math.round(Math.max(0, Math.min(100, v))) + '%'; if (el.style.width !== s) el.style.width = s; };
  const bad = (el, v) => el.classList.toggle('low', v < 25);
  UI.hud = function (dt, goal) {
    const g = G(); if (!g || hudOff) return; hudT -= dt; if (hudT > 0) return; hudT = .2;
    const h = S().hour(), hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60), y = g.you.needs;
    $('hcT').textContent = `${pad2(hh)}:${pad2(Math.floor(mm / 5) * 5)}`;
    const wIcon = { sun: S().isNight() ? '🌙' : '☀️', cloud: '☁️', rain: '🌧️', storm: '⛈️' }[S().weatherNow()] || '☀️';
    $('hcD').textContent = `Tag ${g.day}/${g.days} · ${S().alive().length} im Camp ${wIcon}${S().frozen ? ' ⏸' : ''}`;
    [['hnH', y.hunger], ['hnE', y.energy], ['hnM', y.mood]].forEach(([id, v]) => { const el = $(id); setW(el, v); bad(el, v); });
    $('hsW').textContent = g.camp.wood; $('hsA').textContent = g.camp.water; setW($('hsF'), g.camp.fuel * 100); bad($('hsF'), g.camp.fuel * 100);
    $('hsW').classList.toggle('lowt', g.camp.wood < 2); $('hsA').classList.toggle('lowt', g.camp.water < 2);
    // Aufgabe + Tutorial
    const task = (goal ? goal.txt : defaultTask()) + (tutLine && UI.set.tips ? `<small class="tut">💡 ${tutLine}</small>` : '');
    if (task !== lastTask) { $('hudTask').innerHTML = task; lastTask = task; }
  };
  function defaultTask() {
    const g = G(), h = S().hour(), cp = g.camp, t = g.today;
    if (cp.fuel < .2 && cp.wood > 0) return '🔥 Das Feuer geht aus – leg Holz nach!';
    if (cp.water < 2) return '💧 Das Wasserfass ist fast leer – hol Wasser aus der Lagune.';
    if (cp.wood < 2) return '🪵 Kaum noch Holz – sammle Äste im Dschungel.';
    if (h >= 16.5 && h < 19.2 && !cp.meal.ready && !t.dinnerDone) return '🍳 Zeit fürs Abendessen – koch am Feuer!';
    if (h >= 19.3 && h < 22.3 && !t.campfireDone) return '🔥 Setz dich zur Lagerfeuer-Runde ans Feuer.';
    if (g.you.needs.energy < 25) return '😴 Du bist erschöpft – ruh dich in der Hängematte oder im Bett aus.';
    if (g.you.needs.hunger < 25) return '🍌 Du hast Hunger – Früchte gibt es an den Büschen.';
    return '';
  }
  UI.prompt = function (nb) {
    const p = $('prompt'), lbl = nb && !hudOff ? nb.lbl : null;
    if (I.touch) { I.setButton('act', lbl || '', !!lbl); p.hidden = true; return; }
    if (!lbl) { if (!p.hidden) p.hidden = true; return; }
    const html = `<kbd>E</kbd>${esc(lbl)}`; if (p._h !== html) { p.innerHTML = html; p._h = html; } p.hidden = false;
  };
  UI.carry = function (k) { if (I.touch) I.setButton('alt', '🍌 Essen', k === 'food'); else if (k === 'food') UI.toast('🍌 [Q] essen – oder im Gespräch verschenken'); };
  UI.marker = function (goal) {
    const m = $('marker'), w = W(); if (!goal || hudOff || !w.player || Math.hypot(goal.x - w.player.x, goal.z - w.player.z) < 3.5) { if (!m.hidden) m.hidden = true; return; }
    const s = w.project(goal.x, w.heightAt(goal.x, goal.z) + 2.2, goal.z); let x = s.x, y = s.y; const pad = 40;
    if (!s.vis) { x = E.W - x; y = E.H - pad; }
    x = Math.max(pad, Math.min(E.W - pad, x)); y = Math.max(pad + 60, Math.min(E.H - pad, y));
    m.style.left = x.toFixed(0) + 'px'; m.style.top = y.toFixed(0) + 'px'; m.hidden = false;
  };

  // ---------- Tutorial ----------
  const TUT = [
    { id: 'move', pc: 'Laufen mit WASD, Maus ziehen (oder Klick ins Bild) zum Umsehen, Shift = rennen.', touch: 'Links ziehen = laufen, rechts wischen = umsehen. Joystick ganz außen = rennen.' },
    { id: 'pickwood', pc: 'Sammle einen Ast (gelbe Punkte auf der Karte) – [E] aufheben.', touch: 'Sammle einen Ast (gelbe Punkte auf der Karte) – große Taste zum Aufheben.' },
    { id: 'wood', pc: 'Bring den Ast zum Holzstapel neben dem Feuer.', touch: 'Bring den Ast zum Holzstapel neben dem Feuer.' },
    { id: 'drum', pc: 'Die Buschtrommel (🥁, Taste Tab) zeigt Tagesplan, Beziehungen und das simulierte Publikum.', touch: 'Tippe oben auf 🥁: Tagesplan, Beziehungen und simuliertes Publikum.' },
    { id: 'talk', pc: 'Sprich mit Mitcampern – Beziehungen entscheiden mit, wer bleiben darf.', touch: 'Geh zu Mitcampern und tippe „Reden“ – Beziehungen zählen!' },
    { id: 'bucket', pc: 'Nimm am Wasserfass einen Eimer und schöpf Wasser an der Lagune (Osten).', touch: 'Nimm am Wasserfass einen Eimer und schöpf Wasser an der Lagune (Osten).' },
    { id: 'water', pc: 'Gieß das Wasser ins Fass. Ohne Wasser kein Essen!', touch: 'Gieß das Wasser ins Fass. Ohne Wasser kein Essen!' }
  ];
  UI.tut = function (kind) {
    const g = G(); if (!g || !g.tut) return; if (kind && !g.tut.done.includes(kind)) g.tut.done.push(kind);
    if (kind === 'wood' && !g.tut.done.includes('pickwood')) g.tut.done.push('pickwood');
    const nx = TUT.find(t => !g.tut.done.includes(t.id)); tutLine = g.tut.on && nx ? (I.touch ? nx.touch : nx.pc) : '';
    if (!nx) g.tut.on = false; lastTask = '';
  };

  // ---------- Prüfungsergebnis ----------
  UI.trialResult = function (d, cb) {
    const r = d.res, g = G(), st = Array.from({ length: r.max }, (x, i) => `<i class="${i < r.stars ? 'on' : ''}">⭐</i>`).join('');
    let extra = '';
    if (d.partner) extra += `<p class="h">Deine Begleitung <b>${esc(nm(d.partner.c))}</b> holt <b>${d.partner.stars}/6 Sterne</b> <small>(simuliert aus Werten, Laune und Energie)</small>.</p>`;
    if (d.final && r.parts) extra += `<div class="facts">${r.parts.map((p, i) => `<span>Teil ${i + 1}</span><small>${esc(T.defs[p.id] ? T.defs[p.id].name : p.id)}</small><b>${p.stars}/${p.max} ★</b>`).join('')}</div>`;
    if (d.final && d.finalRes) extra += `<div class="sim">Die anderen Finalisten (simuliert): ${S().alive().filter(c => c.id !== 'you').map(c => `${esc(nm(c))} ${d.finalRes[c.id] ? d.finalRes[c.id].stars + '/' + d.finalRes[c.id].max : '–'} ★`).join(' · ')}</div>`;
    const t = g.today, ration = t.maxStars ? Math.round(t.stars / t.maxStars * 100) : 0;
    UI.card({ title: d.final ? '🏆 Finale überstanden!' : (r.reason === 'abort' ? '🔔 Abgebrochen' : '⭐ Prüfung geschafft'), html: `<div class="stars">${st}</div>
      <div class="host">${UI.hostAv(d.final ? 1 : 0)}<div class="bubble"><small class="h">${D.HOSTS[d.final ? 1 : 0].n}</small><br>${esc(d.line)}</div></div>${extra}
      ${chipsHtml(d.chips)}${!d.final ? `<p class="h">🍲 Die Sterne des Tages bestimmen, wie gut das Abendessen wird (${ration} %).</p>` : ''}<div class="sim">Publikumswerte sind simuliert – keine echten Zuschauer.</div>`, buttons: [{ id: 'ok', label: 'Zurück ins Camp ▶', cls: 'go big' }] }, cb);
  };

  // ---------- Neuer Tag ----------
  UI.dayCard = function () {
    const g = G(), s = S(), t = g.today, y = g.you.needs, lastOut = g.outOrder.length ? s.cast(g.outOrder[g.outOrder.length - 1]) : null;
    const wtxt = { sun: '☀️ Sonnig', cloud: '☁️ Bewölkt', rainpm: '🌧️ Nachmittags Regen', stormnight: '⛈️ Nachts Gewitter' }[t.weather] || '';
    UI.card({ title: s.isFinalDay() ? `🏆 Tag ${g.day}: Finaltag!` : `🌅 Tag ${g.day} von ${g.days}`, html: `<p>Noch <b>${s.alive().length}</b> im Camp${lastOut && lastOut.outDay === g.day - 1 ? ` – gestern ging <b>${esc(nm(lastOut))}</b>` : ''}. Wetter: ${wtxt}.</p>
      <div class="facts"><span>🍗 Sattheit</span><div class="bar"><i style="width:${Math.round(y.hunger)}%"></i></div><b>${Math.round(y.hunger)}</b><span>⚡ Energie</span><div class="bar"><i style="width:${Math.round(y.energy)}%"></i></div><b>${Math.round(y.energy)}</b><span>😊 Laune</span><div class="bar"><i style="width:${Math.round(y.mood)}%"></i></div><b>${Math.round(y.mood)}</b></div>
      <p class="h">${s.isFinalDay() ? 'Heute zählt alles: Finalprüfung um 10 Uhr, am Abend die Siegerverkündung.' : s.isElimDay() ? 'Heute Abend muss jemand gehen. Arbeite mit, sei nett – und unterhaltsam.' : 'Heute muss noch niemand gehen. Lerne dein Camp kennen!'}</p><p class="h">💾 Automatisch gespeichert.</p>`, buttons: [{ id: 'ok', label: 'Aufstehen ▶', cls: 'go big' }] });
  };

  // ---------- Buschtrommel-Übersicht ----------
  let drumTab = 'heute';
  UI.drumPanel = function (tab) {
    const g = G(); if (!g) return; if (tab) drumTab = tab; UI.tut('drum');
    const render = () => {
      const tabs = [['heute', '📅 Heute'], ['camp', '👥 Camp'], ['publikum', '📺 Publikum'], ['log', '📖 Tagebuch']];
      return `<div class="seg tabs">${tabs.map(t => `<button class="btn sm ${t[0] === drumTab ? 'on' : ''}" data-m="tab" data-tab="${t[0]}" data-keep="1">${t[1]}</button>`).join('')}</div><div class="tabc">${drumHtml(drumTab)}</div>`;
    };
    UI.card({ title: `🥁 Buschtrommel · Tag ${g.day}/${g.days}`, html: render(), cls: 'drum', buttons: [{ id: 'ok', label: 'Schließen', cls: 'go' }], bars: true,
      onBtn: (id, b) => { if (b.dataset.tab) { drumTab = b.dataset.tab; const card = modal.querySelector('.card'); card.querySelector('.seg.tabs').outerHTML; card.querySelector('.seg.tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.tab === drumTab)); card.querySelector('.tabc').innerHTML = drumHtml(drumTab); requestAnimationFrame(() => card.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; })); Snd.click(); } } });
  };
  function drumHtml(tab) {
    const g = G(), s = S(), c = C(), t = g.today;
    if (tab === 'heute') {
      const def = T.defs[t.trialId], who = t.nominees.map(id => id === 'you' ? '<b>Du</b>' : `<b>${esc(nm(s.cast(id)))}</b>`).join(' & ') || '<i>wird um 7:30 Uhr verkündet</i>';
      const trialTxt = t.trialId === 'finale' ? `🏆 Großes Finale (3 Teile: ${s.FINAL_PARTS.map(p => T.defs[p.id] ? T.defs[p.id].name : p.id).join(', ')})` : def ? `${def.e} ${esc(def.name)} <span class="kind ${def.kind}">${def.kind}</span>` : '';
      const res = t.trialDone ? ' ✅' : '', npc = t.npcResult ? ` · ${esc(nm(s.cast(t.npcResult.id)))}: ${t.npcResult.stars}/6 ★` : '';
      const plan = [['07:30', '🥁 Buschtrommel: Prüfungs-Ansage'], ['09:00', '🍚 Frühstück (braucht Wasser)'], ['10:00', '⭐ Prüfung am Tor (Süden)'], ['12:00 · 16:00', '💧 Trinkwasser aus dem Fass'], ['16:30–19:15', '🍳 Abendessen kochen (2 Wasser + Feuer)'], ['ab 19:30', '🔥 Lagerfeuer-Runde'], ['20:45', s.isElimDay() || s.isFinalDay() ? (s.isFinalDay() ? '🏆 Siegerverkündung' : '🎤 Abendrunde: jemand muss gehen') : '🎤 Heute keine Ausscheidung'], ['ab 21:30', '😴 Schlafen gehen']];
      const m = t.mission;
      return `<p>Prüfung: ${trialTxt}${res}<br>Antreten: ${who}${npc}</p>${m ? `<div class="card mission">📜 <b>Geheimauftrag:</b> ${esc(m.text)} ${m.done ? '✅' : m.failed ? '❌' : m.kind === 'invite' ? `(${m.ids.length}/${m.need})` : ''}</div>` : ''}
        <div class="facts plan">${plan.map(p => `<span>${p[0]}</span><small>${p[1]}</small><b></b>`).join('')}</div>
        <p class="h">Vorräte: 🪵 ${g.camp.wood} Holz · 💧 ${g.camp.water} Wasser · 🔥 Feuer ${Math.round(g.camp.fuel * 100)} %${g.camp.meal.ready ? ' · 🍲 Essen fertig' : ''}${g.camp.wet ? ' · 💦 Betten nass' : ''}</p>`;
    }
    if (tab === 'camp') {
      const list = g.cast.filter(x => x.id !== 'you').sort((a, b) => (a.out - b.out) || (c.rel(b.id, 'you') - c.rel(a.id, 'you')));
      const TR = { diva: 'Diva', kumpel: 'Kumpel', stratege: 'Stratege', clown: 'Spaßvogel', sensibel: 'Sensibel', tough: 'Harter Hund' };
      return `<p class="h">Deine Beziehungen (−100 bis +100). Freunde helfen dir, Rivalen lästern. ${g.cast.some(x => x.ally) ? '🛡️ = Bündnis' : ''}</p>${list.map(x => { const r = Math.round(c.rel(x.id, 'you')), n = c.byId[x.id]; const doing = x.out ? `raus an Tag ${x.outDay}` : n && n.away ? 'bei der Prüfung' : n && n.act ? ({ sleep: 'schläft', wood: 'sammelt Holz', water: 'holt Wasser', fire: 'schürt das Feuer', cook: 'kocht', chat: 'quatscht', argue: 'streitet', sit: 'sitzt', eat: 'isst', sun: 'sonnt sich', yoga: 'macht Yoga', diary: 'im Tagebuch', pond: 'an der Lagune', rest: 'ruht sich aus', forage: 'sucht Früchte', sad: 'ist traurig' }[n.act.type] || 'unterwegs') : 'unterwegs';
        return `<div class="vrow ${x.out ? 'out' : ''}">${UI.av(x, x.needs.mood < 30 ? 'sad' : r > 40 ? 'happy' : 'n')}<div><b>${esc(x.name)}</b> <small class="h">${TR[x.trait] || ''} · ${esc(doing)}${x.ally ? ' · 🛡️' : ''}</small><div class="bar ${r < 0 ? 'r' : ''}"><i data-w="${Math.abs(r)}"></i></div></div><div class="p">${c.relIcon(r)} ${r > 0 ? '+' : ''}${r}</div></div>`; }).join('')}`;
    }
    if (tab === 'publikum') {
      const y = g.you.aud, rank = s.alive().map(x => ({ x, f: s.favor(x.id) })).sort((a, b) => b.f - a.f), pos = rank.findIndex(r => r.x.id === 'you') + 1, L = (g.audLog.you || []).slice(-8).reverse();
      return `<div class="sim"><b>Simuliertes Publikum</b> – es gibt keine echten Zuschauer oder Stimmen. Die Gunst ergibt sich nachvollziehbar aus drei Werten: <b>Sympathie</b> (45 %: Mithelfen, Nettsein, Trösten), <b>Leistung</b> (25 %: Prüfungssterne) und <b>Unterhaltung</b> (30 %: Witze, Drama, mutige Aktionen). Bei der Abendrunde muss gehen, wer die geringste Gunst hat (mit etwas Zufall).</div>
        <div class="facts"><span>💚 Sympathie</span><div class="bar"><i data-w="${Math.round(y.S)}"></i></div><b>${Math.round(y.S)}</b><span>⭐ Leistung</span><div class="bar g"><i data-w="${Math.round(y.P)}"></i></div><b>${Math.round(y.P)}</b><span>🎭 Unterhaltung</span><div class="bar p"><i data-w="${Math.round(y.E)}"></i></div><b>${Math.round(y.E)}</b></div>
        <p>Deine Gunst: <b>${Math.round(s.favor('you'))}</b> – Platz <b>${pos}</b> von ${rank.length}${pos >= rank.length - 1 && rank.length > 2 && (s.isElimDay() || s.isFinalDay()) ? ' ⚠️ Gefahrenzone!' : ''}</p>
        <div class="facts">${rank.map((r, i) => `<span>${i + 1}. ${esc(nm(r.x))}</span><div class="bar ${i >= rank.length - 2 ? 'r' : ''}"><i data-w="${Math.round(r.f)}"></i></div><b>${Math.round(r.f)}</b>`).join('')}</div>
        ${L.length ? `<p class="h">Zuletzt:</p><div class="facts">${L.map(e => `<span>Tag ${e.d}</span><small>${esc(e.why)}</small><b>${['S', 'P', 'E'].filter(k => e[k]).map(k => k.replace('S', '💚').replace('P', '⭐').replace('E', '🎭') + sgn(Math.round(e[k]))).join(' ')}</b>`).join('')}</div>` : ''}`;
    }
    const L = g.log.slice(-30).reverse();
    return `<div class="logl">${L.map(e => `<div><small class="h">Tag ${e.d} · ${pad2(Math.floor(e.t / 60) % 24)}:${pad2(e.t % 60)}</small> ${esc(e.txt)}</div>`).join('') || '<p class="h">Noch nichts passiert.</p>'}</div>`;
  }

  // ---------- Endbildschirm ----------
  UI.endScreen = function (o) {
    const g = o.G, my = o.my, all = g.cast.slice().sort((a, b) => o.place[a.id] - o.place[b.id]);
    my === 1 ? Snd.win() : Snd.lose();
    const fr = (g.friends || []).filter(k => k.split('|').includes('you')).length, ally = g.cast.filter(c => c.ally).length;
    showMenu(`<div class="card cen">${my === 1 ? '<div class="crown">👑</div><h2>Du bist Urwald-Champion!</h2>' : `<h2>Platz ${my} von ${g.n}</h2>`}
      <p class="h">${my === 1 ? 'Das simulierte Publikum hat dich zur Königin bzw. zum König des Urwaldlagers gewählt!' : my <= 3 ? 'Bis ins Finale – starke Staffel!' : 'Das Urwaldlager hat dich geprägt. Nächstes Mal klappt’s!'}</p>
      <div class="grid">${all.map(c => `<div class="card cc ${c.id === 'you' ? '' : ''}">${UI.av(c, o.place[c.id] === 1 ? 'happy' : 'n')}<b>${o.place[c.id]}. ${esc(c.id === 'you' ? c.name + ' (Du)' : c.name)}</b><small>${c.stars} ★${c.outDay ? ` · raus Tag ${c.outDay}` : ''}</small></div>`).join('')}</div>
      <p class="h" style="margin-top:10px">⭐ ${g.you.stars} Sterne in ${g.you.trials} Prüfungen · 🤝 ${fr} dicke Freunde${ally ? ` · ${ally} Bündnis` : ''} · 📺 Gunst ${Math.round(S().favor('you'))} (simuliert)</p>
      <div class="row c" style="margin-top:12px"><button class="btn go big" data-a="setup">Neue Staffel ▶</button><button class="btn" data-a="title">Zum Titel</button></div></div>`);
  };

  // ---------- Menüs ----------
  const menuOpen = () => { const m = $('menu'); return m && !m.hidden; };
  UI.menuOpen = menuOpen;
  function holdCloud() { const cb = $('cloudBox'), h = $('cloudHold'); if (cb && h && cb.parentNode !== h) h.appendChild(cb); }
  function showMenu(html, onShow) {
    const m = $('menu'); holdCloud(); m.innerHTML = html; m.hidden = false; I.setLock(false); I.setLayout(null);
    const slot = m.querySelector('.cloudslot'), cb = $('cloudBox'); if (slot && cb) slot.appendChild(cb);
    if (onShow) onShow(m); const card = m.querySelector('.card'); if (card) card.scrollTop = 0;
  }
  UI.hideMenu = () => { holdCloud(); const m = $('menu'); m.hidden = true; m.innerHTML = ''; I.clearEdges(); };
  $('menu').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; Snd.unlock(); Snd.click(); act(b.dataset.a, b); });
  $('menu').addEventListener('input', e => { const t = e.target; if (t.dataset.s) setting(t.dataset.s, t.type === 'checkbox' ? t.checked : +t.value); if (t.id === 'suName') setup.name = t.value.slice(0, 16); });
  let back = null, inGame = false;
  UI.setInGame = v => { inGame = v; };
  function act(a, b) {
    const h = UI.hooks;
    if (a === 'title') return h.toTitle ? h.toTitle() : UI.title();
    if (a === 'continue') return h.continueGame();
    if (a === 'setup') return UI.setup();
    if (a === 'start') return startSetup();
    if (a === 'settings') { back = b.dataset.back || 'title'; return UI.settings(); }
    if (a === 'help') { back = b.dataset.back || 'title'; return UI.help(); }
    if (a === 'back') return back === 'pause' ? UI.pause() : back === 'arena' ? UI.arena() : UI.title();
    if (a === 'arena') return UI.arena();
    if (a === 'resume') return h.resume();
    if (a === 'save') { const ok = S().save(); b.textContent = ok ? '💾 Gespeichert ✓' : '⚠ Speichern nicht möglich'; return; }
    if (a === 'quitGame') return h.toTitle();
    if (a === 'giveup') { if (b.dataset.sure) { S().clearSave(); return h.toTitle(true); } b.dataset.sure = '1'; b.textContent = 'Wirklich? Stand wird gelöscht!'; return; }
    if (a === 'fs') { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }).catch(() => { }); } catch (e) { } return; }
    if (a === 'trial') return h.arenaTrial(b.dataset.id, arenaLv);
    if (a === 'alv') { arenaLv = +b.dataset.v; return UI.arena(); }
    if (a === 'snd') { Snd.toggle(); return UI.settings(); }
    if (a.startsWith('su:')) { const [, k, v] = a.split(':'); setupPick(k, v); return; }
    if (a.startsWith('set:')) { const [, k, v] = a.split(':'); setting(k, v); return UI.settings(); }
  }
  function setting(k, v) {
    const st = UI.set;
    if (k === 'quality') { st.quality = v; E.setQuality(v === 'auto' ? E.autoQuality() : v); if (W().npcShadows) W().npcShadows(E.q.shadows); }
    else if (k === 'fx' || k === 'amb') Snd.vol(k, v / 100);
    else if (k === 'sens') st.sens = v / 100;
    else if (k === 'invertY' || k === 'mouseLock' || k === 'tips') { st[k] = !!v; if (k === 'tips' && G()) { G().tut.on = st.tips && G().tut.done.length < TUT.length; UI.tut(); } }
    else if (k === 'tz') st.tz = +v;
    else if (k === 'speed') { st.speed = v; if (G()) G().settings.speed = v; }
    UI.saveSet(); UI.applySet();
  }
  UI.title = function () {
    inGame = false; const s = S(), info = s.hasSave() ? s.saveInfo() : null, b = s.best();
    showMenu(`<div class="card cen title"><div class="logo">URWALD<span>LAGER</span></div><div class="tagline">Die große Wildnis-Show · 3D</div>
      <p class="h">Lebe im Dschungelcamp: Holz sammeln, Wasser holen, kochen, Freundschaften schließen – und zwölf echte Prüfungen bestehen, bis das simulierte Publikum den Champion kürt.</p>
      <div class="col">${info ? `<button class="btn go big" data-a="continue">▶ Weiterspielen <small>Tag ${info.day}/${info.days} · ${esc(info.name)} · ${info.alive} im Camp</small></button>` : ''}
      <button class="btn ${info ? '' : 'go'} big" data-a="setup">🌴 Neue Staffel</button>
      <div class="row c"><button class="btn" data-a="arena">⭐ Prüfungs-Arena</button><button class="btn" data-a="help">📖 Anleitung</button><button class="btn" data-a="settings">⚙️ Einstellungen</button></div></div>
      ${b.plays ? `<p class="h">Bisher: ${b.plays} Staffel${b.plays > 1 ? 'n' : ''} · ${b.wins || 0} Sieg${b.wins === 1 ? '' : 'e'} · bester Platz ${b.best || '–'} · ${b.stars || 0} ★ gesamt</p>` : ''}
      <div class="cloudslot"></div><p class="h tiny">Alle Figuren, Namen und Sendungsinhalte sind frei erfunden. Zuschauerabstimmungen werden nur simuliert.</p></div>`);
  };
  // Neue Staffel
  const setup = Object.assign({ name: '', type: 0, look: { skin: D.SKINS[1], hair: D.HAIRS[1], hs: 'short', top: D.TOPS[1] }, len: 'normal', diff: 1, mode: 'taeglich', castIds: [] }, UI.set.last || {});
  function setupPick(k, v) {
    if (k === 'type') setup.type = +v; else if (k === 'len') { setup.len = v; setup.castIds = setup.castIds.slice(0, D.SEASONS[v].n - 1); } else if (k === 'diff') setup.diff = +v; else if (k === 'mode') setup.mode = v;
    else if (k === 'skin' || k === 'hair' || k === 'top') setup.look[k] = v; else if (k === 'hs') setup.look.hs = v;
    else if (k === 'cast') { const i = setup.castIds.indexOf(v), max = D.SEASONS[setup.len].n - 1; if (i >= 0) setup.castIds.splice(i, 1); else if (setup.castIds.length < max) setup.castIds.push(v); else { UI.toast(`Höchstens ${max} Mitcamper für diese Staffel-Länge`); return; } }
    else if (k === 'rnd') setup.castIds = [];
    const sc = $('menu').querySelector('.card').scrollTop; UI.setup(); $('menu').querySelector('.card').scrollTop = sc;
  }
  UI.setup = function () {
    const n = D.SEASONS[setup.len].n - 1, seg = (k, items, curV) => `<div class="seg">${items.map(([v, l]) => `<button class="btn sm ${String(curV) === String(v) ? 'on' : ''}" data-a="su:${k}:${v}">${l}</button>`).join('')}</div>`;
    const sw = (k, cols) => `<div class="row">${cols.map(c => `<button class="sw ${setup.look[k] === c ? 'on' : ''}" style="background:${c}" data-a="su:${k}:${c}" aria-label="Farbe"></button>`).join('')}</div>`;
    showMenu(`<div class="card setup"><h2>🌴 Neue Staffel</h2>
      <div class="two"><div><label class="h">Dein Name</label><input class="fld" id="suName" maxlength="16" value="${esc(setup.name)}" placeholder="z. B. Sam" autocomplete="off">
        <label class="h">Typ</label><div class="grid types">${D.TYPES.map((t, i) => `<button class="card tc ${setup.type === i ? 'on' : ''}" data-a="su:type:${i}"><b>${t.e} ${t.name}</b><small>${t.desc}</small></button>`).join('')}</div></div>
        <div class="look"><div class="avw you" style="width:110px;margin:0 auto">${root.Avatar.svg(setup.look, 'happy')}</div><label class="h">Haut</label>${sw('skin', D.SKINS)}<label class="h">Haare</label>${sw('hair', D.HAIRS)}${seg('hs', D.HSTYLES, setup.look.hs)}<label class="h">Shirt</label>${sw('top', D.TOPS)}</div></div>
      <label class="h">Staffel-Länge</label>${seg('len', Object.keys(D.SEASONS).map(k => [k, D.SEASONS[k].l]), setup.len)}
      <label class="h">Schwierigkeit der Prüfungen</label>${seg('diff', [[0, '🙂 Leicht'], [1, '😬 Normal'], [2, '🔥 Schwer']], setup.diff)}
      <label class="h">Prüfungs-Modus</label>${seg('mode', [['taeglich', '⭐ Täglich antreten (empfohlen)'], ['klassisch', '📺 Publikum nominiert']], setup.mode)}
      <p class="h tiny">${setup.mode === 'taeglich' ? 'Du spielst jeden Tag eine Prüfung selbst, das simulierte Publikum wählt deine Begleitung.' : 'Das simulierte Publikum nominiert, wen es leiden sehen will – manchmal dich, manchmal andere (deren Ergebnis wird simuliert).'}</p>
      <label class="h">Mitcamper (${setup.castIds.length}/${n} gewählt – Rest wird ausgelost)</label>
      <div class="grid castg">${D.CAST.map(c => `<button class="card cc ${setup.castIds.includes(c.id) ? 'on' : ''}" data-a="su:cast:${c.id}">${UI.av(c, 'n')}<b>${esc(c.name)}</b><small>${esc(c.job)}</small></button>`).join('')}</div>
      <div class="row c" style="margin-top:12px"><button class="btn" data-a="title">Zurück</button><button class="btn" data-a="su:rnd:1">🎲 Zufällige Besetzung</button><button class="btn go big" data-a="start">Ab in den Dschungel ▶</button></div></div>`);
  };
  function startSetup() {
    const name = (setup.name || '').trim() || 'Sam'; UI.set.last = JSON.parse(JSON.stringify(setup)); UI.saveSet();
    UI.hooks.newGame({ name, type: setup.type, look: Object.assign({}, setup.look), len: setup.len, diff: setup.diff, mode: setup.mode, speed: UI.set.speed, castIds: setup.castIds.slice(), seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) & 0xffffff });
  }
  UI.settings = function () {
    const st = UI.set, seg = (k, items, curV) => `<div class="seg">${items.map(([v, l]) => `<button class="btn sm ${String(curV) === String(v) ? 'on' : ''}" data-a="set:${k}:${v}">${l}</button>`).join('')}</div>`;
    const rng = (k, v, min, max) => `<input type="range" class="rng" data-s="${k}" min="${min}" max="${max}" value="${v}">`;
    const chk = (k, l) => `<label class="opt"><input type="checkbox" data-s="${k}" ${st[k] ? 'checked' : ''}> ${l}</label>`;
    showMenu(`<div class="card set"><h2>⚙️ Einstellungen</h2>
      <label class="h">Grafikqualität (aktuell: ${E.q.level}${st.quality === 'auto' ? ', automatisch' : ''})</label>${seg('quality', [['auto', 'Auto'], ['low', 'Niedrig'], ['mid', 'Mittel'], ['high', 'Hoch']], st.quality)}
      <p class="h tiny">Niedrig = für schwächere Handys. Die Auflösung passt sich zusätzlich automatisch an, wenn es ruckelt. Pflanzendichte ändert sich beim nächsten Start.</p>
      <label class="h">Ton</label><div class="row"><button class="btn sm ${Snd.isOn() ? 'on' : ''}" data-a="snd">${Snd.isOn() ? '🔊 An' : '🔇 Aus'}</button></div>
      <div class="facts"><span>Effekte</span>${rng('fx', Math.round(Snd.vol('fx') * 100), 0, 100)}<b></b><span>Dschungel-Ambiente</span>${rng('amb', Math.round(Snd.vol('amb') * 100), 0, 100)}<b></b><span>Kamera-Empfindlichkeit</span>${rng('sens', Math.round(st.sens * 100), 40, 200)}<b></b></div>
      ${chk('invertY', 'Kamera vertikal umkehren')}${chk('mouseLock', 'Maus im Spiel fangen (PC, Esc gibt sie frei)')}${chk('tips', 'Tipps und Hinweise anzeigen')}
      <label class="h">Touch-Tasten-Größe</label>${seg('tz', [[.85, 'Klein'], [1, 'Mittel'], [1.2, 'Groß'], [1.4, 'Sehr groß']], st.tz)}
      <label class="h">Spieltempo (Uhr im Camp)</label>${seg('speed', [['langsam', '🐢 Gemütlich'], ['normal', 'Normal'], ['schnell', '🐇 Schnell']], G() && inGame ? G().settings.speed : st.speed)}
      <p class="h tiny">Normal: ein Camp-Tag dauert etwa 12 Minuten. Bei Pflichtterminen (Prüfung, Abendrunde) wartet die Uhr auf dich.</p>
      ${document.fullscreenEnabled ? '<div class="row"><button class="btn" data-a="fs">⛶ Vollbild an/aus</button></div>' : ''}
      <div class="row c" style="margin-top:12px"><button class="btn go" data-a="back">Fertig</button></div></div>`);
  };
  UI.help = function () {
    showMenu(`<div class="card help"><h2>📖 Anleitung</h2>
      <h3>Steuerung</h3><div class="two"><div class="ctrl"><b>⌨️ PC</b><p><kbd>W A S D</kbd> laufen · <kbd>Shift</kbd> rennen · Maus: umsehen (Klick ins Bild fängt die Maus, <kbd>Esc</kbd> gibt sie frei) · Mausrad: Zoom<br><kbd>E</kbd> Aktion (Ast aufheben, reden, kochen …) · <kbd>Q</kbd> Frucht essen · <kbd>Tab</kbd> Buschtrommel-Übersicht · <kbd>P</kbd>/<kbd>Esc</kbd> Pause · <kbd>1–4</kbd> Antworten im Gespräch</p></div>
      <div class="ctrl"><b>📱 Smartphone</b><p>Links auf den Bildschirm drücken und ziehen = laufen (ganz außen = rennen) · rechts wischen = umsehen · große grüne Taste = Aktion, sie zeigt immer, was gerade geht · 🥁 oben = Übersicht · ❚❚ = Pause. Am besten im Querformat und Vollbild spielen.</p></div></div>
      <h3>Camp-Leben</h3><p>Hunger, Energie und Laune sinken mit der Zeit. Das Camp braucht <b>Holz</b> fürs Feuer (Äste im Dschungel sammeln, zum Stapel bringen, ins Feuer legen) und <b>Wasser</b> (Eimer am Fass nehmen, an der Lagune schöpfen, ins Fass gießen). Ohne Wasser kein Essen, ohne Feuer frieren alle nachts. Abends kochst du am Feuer – je mehr Prüfungssterne, desto besser die Zutaten. Schlafen geht ab 21:30 Uhr im Bett, Nickerchen tagsüber.</p>
      <p>Die Mitcamper haben eigene Persönlichkeiten und Tagesabläufe: Sie arbeiten, faulenzen, quatschen, streiten und schließen Freundschaften. Rede mit ihnen, hilf, tröste, lästere (riskant!) oder schmiede Bündnisse.</p>
      <h3>Staffelablauf</h3><p>Jeden Morgen verkündet die Buschtrommel die Prüfung des Tages (10 Uhr am Tor im Süden). Ab Tag 2 muss abends jemand gehen. Am letzten Tag spielen die drei Finalisten das große dreiteilige Finale, danach wird der Champion gekürt. Zwischendurch gibt es Überraschungen: freche Affen, Unwetter, Streit, Geheimaufträge …</p>
      <h3>Das Publikum ist simuliert</h3><p>Es gibt keine echten Zuschauer und keine echten Stimmen. Die simulierte Gunst setzt sich aus Sympathie (45 %), Leistung (25 %) und Unterhaltung (30 %) zusammen – in der Buschtrommel-Übersicht siehst du jederzeit, warum sich etwas verändert hat.</p>
      <h3>Prüfungen</h3><p>Zwölf verschiedene Prüfungen mit eigener Steuerung (siehe Einführung vor jeder Prüfung) plus Finale. Alle Tiere sind virtuell oder Requisiten. Mit „🔔 Raus“ kannst du jederzeit abbrechen – „Urwald, ich will raus!“. In der Prüfungs-Arena übst du jede Prüfung ohne Staffel.</p>
      <div class="row c"><button class="btn go" data-a="back">Zurück</button></div></div>`);
  };
  let arenaLv = 1;
  UI.arena = function () {
    const best = (S().best().trials) || {}, ids = S().TRIAL_IDS.filter(id => T.defs[id]);
    showMenu(`<div class="card"><h2>⭐ Prüfungs-Arena</h2><p class="h">Übe jede Prüfung einzeln. Bestwerte werden gespeichert.</p>
      <div class="seg">${[[0, '🙂 Leicht'], [1, '😬 Normal'], [2, '🔥 Schwer']].map(([v, l]) => `<button class="btn sm ${arenaLv === v ? 'on' : ''}" data-a="alv" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="grid arena">${ids.map(id => { const d = T.defs[id], b = best[id]; return `<button class="card tc" data-a="trial" data-id="${id}"><b>${d.e} ${esc(d.name)}</b><span class="kind ${d.kind}">${d.kind}</span><small>${esc((d.desc || '').slice(0, 90))}${(d.desc || '').length > 90 ? '…' : ''}</small><small>${b != null ? `Bestwert: ${'★'.repeat(b)}${'☆'.repeat(Math.max(0, 6 - b))}` : 'noch nicht gespielt'}</small></button>`; }).join('')}
        <button class="card tc" data-a="trial" data-id="finale"><b>🏆 Das große Finale</b><span class="kind Alles">3 Teile</span><small>${S().FINAL_PARTS.map(p => T.defs[p.id] ? T.defs[p.id].name : p.id).join(' → ')}</small><small>${best.finale != null ? `Bestwert: ${best.finale}/9 ★` : 'noch nicht gespielt'}</small></button></div>
      <div class="row c" style="margin-top:12px"><button class="btn go" data-a="title">Zurück</button></div></div>`);
  };
  UI.arenaResult = function (id, res, isBest) {
    showMenu(`<div class="card cen"><h2>${res.stars} / ${res.max} ★</h2><div class="stars">${Array.from({ length: res.max }, (x, i) => `<i class="${i < res.stars ? 'on' : ''}">⭐</i>`).join('')}</div><p>${isBest ? '🏅 Neuer Bestwert!' : res.reason === 'abort' ? 'Abgebrochen.' : 'Gut gemacht!'}</p>
      <div class="row c"><button class="btn go big" data-a="trial" data-id="${id}">Nochmal ▶</button><button class="btn" data-a="arena">Zur Arena</button></div></div>`);
  };
  UI.pause = function () {
    if (!inGame || G() && G().over) return; const s = S(), g = G();
    UI.hooks.onPause && UI.hooks.onPause();
    showMenu(`<div class="card cen"><h2>❚❚ Pause</h2><p class="h">Tag ${g.day}/${g.days} · ${s.alive().length} im Camp · Die Zeit steht still.</p>
      <div class="col"><button class="btn go big" data-a="resume">▶ Weiterspielen</button><div class="row c"><button class="btn" data-a="settings" data-back="pause">⚙️ Einstellungen</button><button class="btn" data-a="help" data-back="pause">📖 Anleitung</button><button class="btn" data-a="save">💾 Speichern</button></div>
      <div class="row c"><button class="btn" data-a="quitGame">🏠 Speichern & zum Titel</button><button class="btn red sm" data-a="giveup">Staffel aufgeben</button></div></div><div class="cloudslot"></div></div>`);
  };
  UI.webglError = () => showMenu('<div class="card cen"><h2>WebGL fehlt</h2><p>Dein Browser oder Gerät unterstützt kein WebGL – Urwaldlager braucht es für die 3D-Welt. Bitte aktiviere die Hardwarebeschleunigung oder nutze einen aktuellen Browser (Chrome, Firefox, Safari, Edge).</p></div>');
  // Spielbeginn: kurze Einführung
  UI.intro = function (g, done) {
    const others = g.cast.filter(c => c.id !== 'you');
    UI.card({ title: '🌴 Willkommen im Urwaldlager!', html: `<div class="host">${UI.hostAv(0)}<div class="bubble"><small class="h">Kiki Klack</small><br>Herzlich willkommen, ${esc(g.you.name)}! ${g.days} Tage Dschungel, ${others.length} Mitcamper, eine Lianenkrone. Hier gibt’s keinen Zimmerservice – Holz, Wasser und Essen müsst ihr selbst besorgen!</div></div>
      <div class="grid mini">${others.map(c => `<div class="cc">${UI.av(c, 'happy')}<b>${esc(c.name)}</b><small>${esc(c.job)}</small></div>`).join('')}</div>`, buttons: [{ id: 'ok', label: 'Weiter ▶', cls: 'go big' }] }, () => {
      UI.card({ title: '🎬 So läuft’s', html: `<div class="host">${UI.hostAv(1)}<div class="bubble"><small class="h">Boris Busch</small><br>Jeden Morgen verrät die Buschtrommel die Prüfung des Tages. Ab Tag 2 muss jeden Abend jemand gehen – entschieden vom <b>simulierten</b> Publikum: Hilf im Camp, sei nett zu den anderen und sorg für Unterhaltung!</div></div>
        <div class="ctrl">${I.touch ? '📱 Links ziehen = laufen, rechts wischen = umsehen, große grüne Taste = Aktion.' : '⌨️ WASD laufen, Maus umsehen (Klick ins Bild), E = Aktion, Tab = Übersicht, Esc = Pause.'}</div>`, buttons: [{ id: 'ok', label: 'Los geht’s! ▶', cls: 'go big' }] }, done);
    });
  };
  UI.init = function () { UI.applySet(); modalEl(); };
  root.UUI = UI;
})(window);

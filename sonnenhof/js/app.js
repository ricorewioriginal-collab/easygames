/* Sonnenhof – Oberfläche: Laden, Titel, Konsolen-Menü, Hof (Canvas + Werkzeugleiste), Markt, Bauen, Aufträge, Lager, Werkstätten,
 * Tagesbilanz, Level-Aufstieg, Erfolge. Speichern: sonnenhof-* (Cloud über anmacha-cloud), Hofwert als sonnenhof-highscore. */
(function () {
  'use strict';
  const C = SHCore, R = SHRender, $ = id => document.getElementById(id), PX = 'sonnenhof-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(PX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(PX + k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  const SET = Object.assign({ sound: true, hints: true }, LS.get('settings', {})), saveSet = () => LS.set('settings', SET);
  let G = C.repair(LS.get('save', null), Date.now()), cur = 'sLoad', tool = 'hand', seed = 'zwiebel', raf = 0, lastSave = 0, paused = false;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2200); }
  const TOOLS = [['hand', '✋', 'Hand', 'Ernten, Tiere versorgen, Gebäude öffnen – auf leeren Feldern macht sie automatisch den nächsten Schritt'], ['hacke', '⛏️', 'Hacke', 'Feld umgraben'], ['saat', '🌱', 'Saat', 'Säen'], ['wasser', '💧', 'Gießkanne', 'Gießen'], ['duenger', '🧪', 'Dünger', 'Doppelte Ernte, schneller']];
  const fmtMin = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' min' : s + ' s'; };
  const clock = g => { const h = R.hour(g), hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10; return String(hh % 24).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };

  /* ---------- Klänge (klein, Web Audio) ---------- */
  let AC = null; function beep(f, d, type, vol) { if (!SET.sound) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d); g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); } catch (e) { /* kein Ton */ } }
  const SND = { ok: () => beep(660, .08, 'triangle'), harvest: () => { beep(520, .1, 'triangle'); setTimeout(() => beep(780, .12, 'triangle'), 70); }, coin: () => { beep(988, .07, 'square', .04); setTimeout(() => beep(1318, .1, 'square', .04), 60); }, err: () => beep(180, .15, 'sawtooth', .04), water: () => beep(300, .12, 'sine', .05), lvl: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .16, 'triangle'), i * 110)) };

  /* ---------- Bildschirme, Fokus, Tastatur ---------- */
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; if (id === 'sGame') { R.resize(); loop(); } setTimeout(focusFirst, 0); }
  const ovOpen = () => !$('ov').hidden;
  function focusFirst() { if (coarse()) return; const root = ovOpen() ? $('ovBox') : $(cur); if (!root || (cur === 'sGame' && !ovOpen())) return; const el = root.querySelector('[data-focus]') || root.querySelector('.mi, .nav:not([disabled])'); if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  let ovEsc = null, ovKind = '';
  function overlay(html, binds, kind) { $('ovBox').innerHTML = html; $('ov').hidden = false; ovKind = kind || ''; $('ovBox').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { const f = binds[b.dataset.act] || (b.dataset.act === 'esc' ? ovEsc : null); if (f) f(b); }; }); ovEsc = binds.esc || closeOv; setTimeout(focusFirst, 0); }
  function closeOv() { $('ov').hidden = true; $('ovBox').innerHTML = ''; ovEsc = null; ovKind = ''; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); setTimeout(focusFirst, 0); }
  $('ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });
  function navMove(dx, dy) {
    const root = ovOpen() ? $('ovBox') : $(cur), els = Array.from(root.querySelectorAll('.nav, .mi')).filter(x => !x.disabled && x.offsetParent !== null); if (!els.length) return;
    const a = document.activeElement; if (!els.includes(a)) { els[0].focus(); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 2) continue; const d = along + Math.abs(x * dy + y * dx) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  const BACK = { sTitle: null, sMenu: () => scr('sTitle'), sHelp: () => menu(), sAch: () => menu(), sGame: () => pauseMenu() };
  addEventListener('keydown', e => {
    const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox' || t.tagName === 'TEXTAREA');
    if (e.code === 'Escape') { e.preventDefault(); if (ovOpen()) { if (ovEsc) ovEsc(); return; } if (typing) { t.blur(); return; } if (BACK[cur]) BACK[cur](); return; }
    if (typing) return;
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); menu(); return; }
    if (cur === 'sGame' && !ovOpen()) { if (gameKey(e)) { e.preventDefault(); return; } }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); navMove(d[0], d[1]); }
  });
  function gameKey(e) {
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[e.code];
    if (d) { const c = R.getCursor() || { x: C.FIELD.x0, y: C.FIELD.y0 }; const n = { x: C.clamp(c.x + d[0], 0, C.W - 1), y: C.clamp(c.y + d[1], 0, C.H - 1) }; R.setCursor(n); R.follow(n.x, n.y); hoverInfo(n); return true; }
    if (e.code === 'Enter' || e.code === 'NumpadEnter') { const c = R.getCursor(); if (c) act(c.x, c.y); else { R.setCursor({ x: C.FIELD.x0, y: C.FIELD.y0 }); } return true; }
    if (/^Digit[1-5]$/.test(e.code)) { setTool(TOOLS[+e.code.slice(5) - 1][0]); return true; }
    if (e.code === 'KeyQ' || e.code === 'KeyE') { const i = TOOLS.findIndex(x => x[0] === tool); setTool(TOOLS[(i + (e.code === 'KeyE' ? 1 : TOOLS.length - 1)) % TOOLS.length][0]); return true; }
    if (e.code === 'Space' || e.code === 'KeyX') { cycleSeed(); return true; }
    if (e.code === 'KeyM') { market(); return true; } if (e.code === 'KeyB') { build(); return true; } if (e.code === 'KeyO') { orders(); return true; } if (e.code === 'KeyI') { lager(); return true; }
    if (e.code === 'KeyP') { pauseMenu(); return true; }
    if (e.code === 'Equal' || e.code === 'NumpadAdd') { R.zoom(1.15, innerWidth / 2, innerHeight / 2); return true; } if (e.code === 'Minus' || e.code === 'NumpadSubtract') { R.zoom(1 / 1.15, innerWidth / 2, innerHeight / 2); return true; }
    return false;
  }

  /* ---------- Speichern ---------- */
  function save() { if (!G) return; lastSave = Date.now(); if (!LS.set('save', G)) toast('⚠️ Speichern nicht möglich'); const w = C.worth(G); if (w > (LS.get('highscore', 0) || 0)) LS.set('highscore', w); }
  addEventListener('visibilitychange', () => { if (document.hidden) save(); else if (G && cur === 'sGame') welcomeBack(); });
  addEventListener('pagehide', save);

  /* ---------- Menü ---------- */
  function menu() { stop(); if (G) save(); scr('sMenu'); const best = LS.get('highscore', 0) || 0;
    const items = [G && ['cont', '▶', 'Weiter spielen', `Zurück auf „${esc(G.name)}“: Level ${G.lv}, Tag ${G.day} (${C.SEASONS[C.season(G)].n}), ${G.coins} Münzen. Deine Pflanzen sind in der Zwischenzeit weitergewachsen.`, esc(G.name) + ' · Lv ' + G.lv],
      ['new', '🌱', G ? 'Neuer Hof' : 'Hof gründen', 'Starte mit einem kleinen Feld, ein paar Samen und 60 Münzen. Säen, gießen, ernten – und Schritt für Schritt wird ein großer Bauernhof daraus.'],
      ['help', '❓', 'So geht\'s', 'Felder, Tiere, Werkstätten, Markt und Aufträge – alles in Ruhe erklärt.'],
      ['ach', '🏆', 'Erfolge', (G ? G.ach.length : 0) + ' von ' + C.ACH.length + ' Erfolgen freigeschaltet.'],
      ['opts', '⚙️', 'Einstellungen', 'Klänge und Tipps ein- oder ausschalten.']].filter(Boolean);
    $('mList').innerHTML = items.map(([id, ic, t, d, sub]) => `<button class="mi${id === 'cont' || (!G && id === 'new') ? ' hero' : ''}" data-go="${id}" data-i="${esc(d)}" data-ic="${ic}"><i>${ic}</i><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</button>`).join('');
    const info = b => { $('mInfo').innerHTML = `<i>${b.dataset.ic}</i><b>${b.querySelector('b').textContent}</b><p>${b.dataset.i}</p>${best ? `<p class="best">🏆 Bester Hofwert: <b>${best.toLocaleString('de-DE')}</b></p>` : ''}`; };
    $('mList').querySelectorAll('.mi').forEach(b => { b.onfocus = b.onmouseenter = () => info(b); b.onclick = () => menuGo(b.dataset.go); }); info($('mList').firstElementChild);
  }
  function menuGo(g) { if (g === 'cont') startGame(); else if (g === 'new') newFarm(); else if (g === 'help') help(); else if (g === 'ach') achScreen(); else if (g === 'opts') opts(); }
  function newFarm() {
    const form = () => overlay(`<h2>🌱 Neuen Hof gründen</h2>${G ? '<p class="warn">⚠️ Dein bisheriger Hof wird dabei ersetzt.</p>' : ''}
      <label class="lab2">Name deines Hofs<input class="field nav" id="nfName" maxlength="24" value="Sonnenhof" data-focus></label><label class="lab2">Dein Name<input class="field nav" id="nfFarmer" maxlength="18" placeholder="z. B. Rico"></label>
      <div class="row end"><button class="btn nav" data-act="esc">Abbrechen</button><button class="btn gold nav" data-act="go">🌱 Los geht's</button></div>`, { esc: closeOv, go: () => { const n = $('nfName').value.trim() || 'Sonnenhof', f = $('nfFarmer').value.trim() || 'Bauer'; G = C.newGame({ name: n, farmer: f }); save(); closeOv(); startGame(true); } });
    form();
  }
  function help() { scr('sHelp'); $('helpBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>❓ So geht's</h2><span></span></header>
    <div class="helpGrid">
    <div><h3>🌱 Felder</h3><p>Tippe ein freies Feld an: erst wird umgegraben, dann gesät, dann gegossen – die <b>Hand</b> macht automatisch den nächsten Schritt. Mit den Werkzeugen <b>Hacke, Saat, Gießkanne</b> und <b>Dünger</b> kannst du auch über viele Felder wischen.</p><p>Jede Pflanze wächst in vier Stufen und braucht <b>für jede Stufe Wasser</b> (💧 = durstig). Regen gießt alles. Ist sie reif, glänzt die Frucht – antippen zum Ernten. Dünger 🧪 gibt die doppelte Ernte und wächst schneller.</p></div>
    <div><h3>🗓️ Zeit & Jahreszeiten</h3><p>Ein Hoftag dauert etwa 4 Minuten Spielzeit, eine Jahreszeit 7 Tage. Jede Pflanze hat Lieblingsjahreszeiten – da wächst sie am schnellsten; außerhalb wächst sie langsamer, bringt am Markt aber 25 % mehr. Pflanzen und Tiere arbeiten auch weiter, wenn du nicht spielst – nur gegossen werden will zwischendurch.</p></div>
    <div><h3>🐔 Tiere</h3><p>Ställe kaufst du im Bau-Menü 🔨. Tippe einen Stall an: fertige Eier, Milch, Wolle oder Trüffel werden eingesammelt und hungrige Tiere gefüttert (Weizen, Mais, Salat, Kartoffeln oder Kürbis aus dem Lager). Bienen brauchen kein Futter.</p></div>
    <div><h3>🛠️ Werkstätten</h3><p>Mühle, Einkochküche, Molkerei, Bäckerei, Spinnrad und Ölpresse machen aus Ernte und Tierprodukten wertvolle Waren wie Mehl, Marmelade, Käse, Kuchen oder Pullover. Jede Werkstatt hat zwei Plätze.</p></div>
    <div><h3>📋 Aufträge & Markt</h3><p>Am Auftragsbrett warten bis zu drei Bestellungen – sie bringen mehr Münzen und viel Erfahrung. Alles andere verkaufst du am Markt 🛒, wo es auch Saatgut und Dünger gibt.</p></div>
    <div><h3>⭐ Level</h3><p>Ernten, Liefern und Herstellen geben Erfahrung. Jedes Level schaltet neue Pflanzen, Tiere, Werkstätten oder Felder frei. Dein Hofwert ist dein Punktestand.</p></div>
    <div><h3>🎮 Steuerung</h3><p><b>Maus/Touch:</b> antippen, mit der Hand ziehen = Karte verschieben, Mausrad/zwei Finger = Zoom.<br><b>Tastatur:</b> Pfeile/WASD = Auswahlrahmen, Enter = benutzen, 1–5 oder Q/E = Werkzeug, Leertaste = Saat wechseln, M Markt, B Bauen, O Aufträge, I Lager, Esc Menü.<br><b>Controller:</b> Steuerkreuz bewegen, Ⓐ benutzen, LB/RB Werkzeug, Ⓧ Saat, Ⓨ Bauen, Select Markt, Start Menü.</p></div>
    </div>`; $('helpBox').querySelector('[data-back]').onclick = menu; }
  function achScreen() { scr('sAch'); const got = G ? G.ach : []; $('achBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>🏆 Erfolge</h2><span>${got.length}/${C.ACH.length}</span></header>
    <div class="achGrid">${C.ACH.map(([id, e, n, d]) => `<div class="ach${got.includes(id) ? ' on' : ''}"><i>${got.includes(id) ? e : '🔒'}</i><b>${n}</b><small>${d}</small></div>`).join('')}</div>`; $('achBox').querySelector('[data-back]').onclick = menu; }
  function opts() { overlay(`<h2>⚙️ Einstellungen</h2><label class="tg nav"><input type="checkbox" id="oSnd"${SET.sound ? ' checked' : ''}> 🔊 Klänge</label><label class="tg nav"><input type="checkbox" id="oHint"${SET.hints ? ' checked' : ''}> 💡 Tipps im Spiel</label>
    <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`, { esc: () => { SET.sound = $('oSnd').checked; SET.hints = $('oHint').checked; saveSet(); closeOv(); } }); }

  /* ---------- Spiel ---------- */
  function startGame(fresh) { if (!G) return newFarm(); scr('sGame'); R.reset(); R.fit(); buildToolbar(); hud(); if (!fresh) welcomeBack(); else overlay(`<div class="big">🌻</div><h2>Willkommen auf ${esc(G.name)}!</h2><p>Tippe ein Feld auf deinem Acker an – die Hand gräbt um, sät und gießt. Danach heißt es: warten, bis es reif ist, und ernten.</p><p>Die ersten Bestellungen hängen schon am 📋 Auftragsbrett.</p><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Los geht's!</button></div>`, {}); }
  function welcomeBack() { if (!G) return; const away = Date.now() - G.last; const before = { ripe: countRipe(), an: countAnimals(), cr: countCrafts() }; const ev = C.tick(G, Date.now(), false); handleEvents(ev, true);
    if (away > 60000) { const r = countRipe(), a = countAnimals(), c = countCrafts(), parts = []; if (r) parts.push(`🌾 ${r} Pflanzen reif`); if (a) parts.push(`🐔 ${a} Tierprodukte bereit`); if (c) parts.push(`🛠️ ${c} Waren fertig`); const thirsty = Object.values(G.tiles).filter(t => t.crop && !t.wet && !t.dead && C.stageOf(t) < 3).length; if (thirsty) parts.push(`💧 ${thirsty} Pflanzen durstig`);
      if (parts.length && (r > before.ripe || a > before.an || c > before.cr || thirsty)) overlay(`<div class="big">🌄</div><h2>Willkommen zurück!</h2><p>Du warst ${away > 3600000 ? Math.round(away / 3600000) + ' Std.' : Math.round(away / 60000) + ' Min.'} weg. Auf dem Hof ist einiges passiert:</p><ul class="list">${parts.map(p => '<li>' + p + '</li>').join('')}</ul><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Ab aufs Feld</button></div>`, {}); } }
  const countRipe = () => Object.values(G.tiles).filter(t => t.crop && !t.dead && C.stageOf(t) === 3).length;
  const countAnimals = () => Object.values(G.animals).reduce((a, x) => a + x.list.filter(y => y.ready).length, 0);
  const countCrafts = () => Object.values(G.shops).reduce((a, x) => a + x.jobs.filter(j => j.done).length, 0);
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  let lastHud = 0;
  function loop() { stop(); const f = () => { if (cur !== 'sGame') { raf = 0; return; } const now = Date.now(); if (G && !paused) { const ev = C.tick(G, now, !ovOpen() && !document.hidden); if (ev.length) handleEvents(ev); }
    R.draw(G, now); if (now - lastHud > 250) { lastHud = now; hud(); if (ovKind === 'shop' || ovKind === 'orders') refreshOv(); } if (now - lastSave > 5000) save(); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
  function handleEvents(ev, quiet) {
    ev.forEach(e => { if (e.k === 'day') { if (!quiet) daySummary(e); } else if (e.k === 'order' && !quiet) toast('📋 Neue Bestellung am Auftragsbrett'); });
    if (G.lvUp) { const n = G.lvUp; G.lvUp = 0; levelUp(n); } achToasts();
  }
  function achToasts() { if (G.newAch && G.newAch.length) { const a = G.newAch.shift(); toast('🏆 Erfolg: ' + a.e + ' ' + a.n, 3000); SND.lvl(); } }
  function hud() { if (!G) return; const s = C.season(G), W = C.WEATHER[G.weather], need = C.lvXp(G.lv);
    $('hCoins').textContent = G.coins.toLocaleString('de-DE'); $('hLv').textContent = G.lv; $('hXp').style.width = Math.min(100, G.xp / need * 100) + '%'; $('hXpT').textContent = G.xp + ' / ' + need + ' XP';
    $('hDay').textContent = C.SEASONS[s].e + ' ' + C.SEASONS[s].n + ' · Tag ' + (((G.day - 1) % C.SEASON_DAYS) + 1) + '/' + C.SEASON_DAYS; $('hTime').textContent = W.e + ' ' + clock(G);
    const ord = G.orders.filter(o => C.hasAll(G, o.items)).length; $('bOrd').dataset.badge = ord || ''; const sh = countCrafts() + countAnimals(); $('bBuild').dataset.badge = '';
    $('tSeed').textContent = C.CROPS[seed].e; $('tSeedN').textContent = G.seeds[seed] > 0 ? '×' + G.seeds[seed] : C.CROPS[seed].seed + '🪙'; $('tFert').textContent = '×' + G.fert;
    hint(); void sh; }
  function hint() { const el = $('hint'); if (!SET.hints || G.tut >= 9) { el.hidden = true; return; } let h = '';
    const tiles = Object.values(G.tiles); if (!tiles.length) h = '👆 Tippe ein Feld auf dem Acker an, um es umzugraben';
    else if (!tiles.some(t => t.crop) && !G.stats.harvest) h = '🌱 Tippe das umgegrabene Feld nochmal an, um zu säen';
    else if (tiles.some(t => t.crop && !t.wet && !t.dead && C.stageOf(t) < 3) && !G.stats.harvest) h = '💧 Durstige Pflanzen (💧) antippen zum Gießen';
    else if (!G.stats.harvest) h = '⏳ Jetzt wächst es – bei jeder neuen Stufe wieder gießen';
    else if (!G.stats.orders && G.orders.some(o => C.hasAll(G, o.items))) h = '📋 Eine Bestellung ist komplett – tippe aufs Auftragsbrett';
    else if (!G.stats.orders) h = '📋 Schau am Auftragsbrett, was die Kunden wollen';
    else if (!G.stats.sold && G.stats.orders < 3) h = '🛒 Übriges verkaufst du am Markt';
    else { G.tut = 9; } el.hidden = !h; el.textContent = h; }

  /* ---------- Werkzeuge ---------- */
  function buildToolbar() { $('tools').innerHTML = TOOLS.map(([id, ic, n], i) => `<button class="tool nav${id === tool ? ' on' : ''}" data-t="${id}" title="${n} (${i + 1})"><i${id === 'saat' ? ' id="tSeed"' : ''}>${ic}</i><span>${n}</span>${id === 'saat' ? '<em id="tSeedN"></em>' : id === 'duenger' ? '<em id="tFert"></em>' : ''}</button>`).join('');
    $('tools').querySelectorAll('.tool').forEach(b => { b.onclick = () => { if (b.dataset.t === 'saat' && tool === 'saat') seedPicker(); else setTool(b.dataset.t); }; }); }
  function setTool(t) { tool = t; $('tools').querySelectorAll('.tool').forEach(b => b.classList.toggle('on', b.dataset.t === t)); const T = TOOLS.find(x => x[0] === t); toast(T[1] + ' ' + T[2] + (t === 'saat' ? ': ' + C.CROPS[seed].n + ' (nochmal tippen = andere Saat)' : ''), 1300); }
  const seedsAvail = () => Object.keys(C.CROPS).filter(k => C.CROPS[k].lv <= G.lv);
  function cycleSeed() { const a = seedsAvail(), i = a.indexOf(seed); seed = a[(i + 1) % a.length]; if (tool !== 'saat') setTool('saat'); else toast('🌱 ' + C.CROPS[seed].e + ' ' + C.CROPS[seed].n, 1200); hud(); }
  function seedPicker() { const s = C.season(G); overlay(`<header class="hd"><span></span><h2>🌱 Saat wählen</h2><button class="btn sm nav" data-act="esc">✕</button></header><div class="grid">${Object.keys(C.CROPS).map(k => { const c = C.CROPS[k], lock = c.lv > G.lv;
      return `<button class="card nav${k === seed ? ' on' : ''}" data-act="${lock ? '' : 'pick'}" data-k="${k}"${lock ? ' disabled' : ''}><i>${lock ? '🔒' : c.e}</i><b>${c.n}</b><small>${lock ? 'ab Level ' + c.lv : (G.seeds[k] > 0 ? '🎒 ×' + G.seeds[k] : c.seed + ' 🪙') + ' · ' + c.min + ' min' + (c.regrow ? ' · trägt mehrmals' : '')}</small><small class="${c.s.includes(s) ? 'good' : 'dim'}">${c.s.map(x => C.SEASONS[x].e).join('')} ${c.s.includes(s) ? 'jetzt Saison' : 'langsamer'}</small></button>`; }).join('')}</div>`,
    { pick: b => { seed = b.dataset.k; closeOv(); setTool('saat'); hud(); } }); }

  /* ---------- Antippen auf dem Hof ---------- */
  function hoverInfo(c) { const p = C.placeAt(c.x, c.y), t = C.tile(G, c.x, c.y); let s = '';
    if (t && t.crop) { const cr = C.CROPS[t.crop], st = C.stageOf(t); s = cr.e + ' ' + cr.n + (t.dead ? ' – vom Blitz geknickt' : st === 3 ? ' – reif!' : ' – ' + Math.round(t.p / C.growMs(cr) * 100) + ' %' + (t.wet ? '' : ' · 💧 durstig')); }
    else if (p) s = placeName(p); $('tip').textContent = s; $('tip').hidden = !s; }
  const placeName = p => p === 'haus' ? '🏡 ' + G.name : p === 'markt' ? '🛒 Markt' : p === 'brett' ? '📋 Auftragsbrett' : p === 'teich' ? '🦆 Teich' : C.SHOPS[p] ? C.SHOPS[p].e + ' ' + C.SHOPS[p].n : C.ANIMALS[p] ? C.ANIMALS[p].e + ' ' + C.ANIMALS[p].n : '';
  function act(x, y, painting) {
    const p = C.placeAt(x, y); if (p) { if (!painting) openPlace(p); return; }
    if (!C.inField(x, y)) return; if (!C.canUse(G, x, y)) { if (!painting) { const e = C.EXPAND[G.expand + 1]; e ? confirmExpand() : 0; } return; }
    const t = C.tile(G, x, y), now = Date.now(); let r, k = tool;
    if (k === 'hand') { if (!t) k = 'hacke'; else if (t.crop && (t.dead || C.stageOf(t) === 3)) k = 'ernte'; else if (!t.crop) k = 'saat'; else if (!t.wet) k = 'wasser'; else { if (!painting) { hoverInfo({ x, y }); const cr = C.CROPS[t.crop]; toast(cr.e + ' ' + cr.n + ': ' + Math.round(t.p / C.growMs(cr) * 100) + ' % – wächst, ist gegossen', 1500); } return; } }
    if (k === 'hacke') { r = C.till(G, x, y); if (r.ok) { R.pop(x, y, '⛏️'); SND.ok(); } }
    else if (k === 'saat') { const c0 = G.coins; r = C.plant(G, x, y, seed); if (r.ok) { R.pop(x, y, c0 > G.coins ? '−' + (c0 - G.coins) + ' 🪙' : C.CROPS[seed].e, '#ffe08a'); SND.ok(); } }
    else if (k === 'wasser') { r = C.water(G, x, y); if (r.ok) { R.pop(x, y, '💧', '#9ad8ff'); SND.water(); } }
    else if (k === 'duenger') { r = C.fertilize(G, x, y); if (r.ok) { R.pop(x, y, '🧪', '#d8a8ff'); SND.ok(); } }
    else if (k === 'ernte') { r = C.harvest(G, x, y, now); if (r.ok && !r.cleared) { R.pop(x, y, '+' + r.n + ' ' + C.CROPS[r.item].e + '  +' + r.xp + ' XP', '#ffe9a8'); SND.harvest(); } else if (r.ok) R.pop(x, y, '🧹'); }
    if (r && r.err && !painting) { toast(r.err); SND.err(); }
    if (r && r.ok) handleEvents([]);
    hud();
  }
  function confirmExpand() { const e = C.EXPAND[G.expand + 1]; overlay(`<div class="big">🟫</div><h2>Neue Felder kaufen?</h2><p>${(e.lv || 1) > G.lv ? 'Gibt es ab Level ' + e.lv + '.' : 'Für ' + e.cost + ' Münzen wird dein Acker größer.'}</p><div class="row end"><button class="btn nav" data-act="esc">Nein</button><button class="btn gold nav" data-act="buy"${(e.lv || 1) > G.lv || G.coins < e.cost ? ' disabled' : ''} data-focus>Kaufen (${e.cost} 🪙)</button></div>`, { buy: () => { const r = C.expand(G); closeOv(); if (r.err) return toast(r.err); SND.coin(); toast('🟫 Neue Felder!'); handleEvents([]); save(); } }); }
  function openPlace(p) { if (p === 'markt') market(); else if (p === 'brett') orders(); else if (p === 'haus') lager(); else if (p === 'teich') { toast('🦆 Quak! Die Enten genießen den Tag.'); beep(440, .1, 'square', .03); } else if (C.SHOPS[p]) shop(p); else if (C.ANIMALS[p]) animal(p); }
  function animal(a) { const D = C.ANIMALS[a], A = G.animals[a]; if (!A || !A.list.length) return buyAnimalDlg(a);
    const r = C.tendAnimals(G, a), P = C.PLACES[a]; if (r.got) { R.pop(P.x + P.w / 2 - .5, P.y, '+' + r.got + ' ' + C.GOODS[r.item].e, '#ffe9a8'); SND.harvest(); }
    if (r.fed) R.pop(P.x + P.w / 2 - .5, P.y + .6, '🌾 gefüttert ×' + r.fed, '#c8ffb8');
    if (r.hungry && !r.got && !r.fed) { toast(D.e + ' hat Hunger: braucht ' + D.feed.map(k => C.CROPS[k].e + ' ' + C.CROPS[k].n).join(' oder ') + ' im Lager'); SND.err(); }
    else if (!r.got && !r.fed) { const left = A.list.filter(x => x.fed || !D.feed).map(x => D.min * C.MIN - x.t); toast(D.e + ' ' + D.n + ' ×' + A.list.length + ' – ' + (left.length ? 'fertig in ' + fmtMin(Math.min(...left)) : 'alle satt'), 1800); }
    handleEvents([]); hud(); }
  function buyAnimalDlg(a) { const D = C.ANIMALS[a], lock = D.lv > G.lv, cost = C.animalCost(G, a); overlay(`<div class="big">${D.e}</div><h2>${D.n}</h2><p>${lock ? '🔒 Gibt es ab Level ' + D.lv + '.' : `Liefert alle ${D.min} min ${C.GOODS[D.out].e} ${C.GOODS[D.out].n} (${C.GOODS[D.out].sell} 🪙). ${D.feed ? 'Frisst ' + D.feed.map(k => C.CROPS[k].n).join(', ') + '.' : 'Braucht kein Futter.'}`}</p>
    <div class="row end"><button class="btn nav" data-act="esc">Zurück</button><button class="btn gold nav" data-act="buy"${lock || G.coins < cost ? ' disabled' : ''} data-focus>Kaufen (${cost} 🪙)</button></div>`, { buy: () => { const r = C.buyAnimal(G, a); closeOv(); if (r.err) return toast(r.err); SND.coin(); toast(D.e + ' ist eingezogen! ' + (D.feed ? 'Füttere es durch Antippen.' : '')); handleEvents([]); save(); } }); }

  /* ---------- Markt ---------- */
  let mTab = 'sell';
  function market() { const inv = Object.keys(G.inv).filter(k => G.inv[k] > 0), s = C.season(G);
    const tabs = `<div class="tabs">${[['sell', '💰 Verkaufen'], ['seed', '🌱 Saatgut'], ['more', '🧪 Dünger']].map(([k, n]) => `<button class="chip nav${mTab === k ? ' on' : ''}" data-act="tab" data-k="${k}">${n}</button>`).join('')}</div>`;
    let body = '';
    if (mTab === 'sell') body = inv.length ? `<div class="rows">${inv.map(k => `<div class="rowi"><i>${C.goodsIcon(k)}</i><b>${C.goodsName(k)}</b><span class="dim">×${G.inv[k]}</span><span class="price">${C.priceOf(G, k)} 🪙${C.GOODS[k].crop && !C.CROPS[k].s.includes(s) ? ' <small class="good">+25 %</small>' : ''}</span><button class="btn sm nav" data-act="s1" data-k="${k}">1</button><button class="btn sm gold nav" data-act="sa" data-k="${k}">Alle (${C.priceOf(G, k) * G.inv[k]})</button></div>`).join('')}</div><p class="dim small">Tipp: Für Bestellungen gibt's mehr – schau erst ans Auftragsbrett. Tierfutter (Weizen, Mais) lieber behalten.</p>` : '<p class="empty">Dein Lager ist leer. Ernte etwas oder sammle Tierprodukte ein.</p>';
    else if (mTab === 'seed') body = `<div class="rows">${seedsAvail().map(k => { const c = C.CROPS[k]; return `<div class="rowi"><i>${c.e}</i><b>${c.n}</b><span class="dim">🎒 ×${G.seeds[k] || 0}</span><span class="price">${c.seed} 🪙</span><button class="btn sm nav" data-act="b1" data-k="${k}">+1</button><button class="btn sm gold nav" data-act="b5" data-k="${k}">+5 (${c.seed * 5})</button></div>`; }).join('')}</div><p class="dim small">Ohne Saat im Rucksack wird beim Säen automatisch eine gekauft.</p>`;
    else body = `<div class="rowi"><i>🧪</i><b>Dünger</b><span class="dim">×${G.fert}</span><span class="price">15 🪙</span><button class="btn sm nav" data-act="f1">+1</button><button class="btn sm gold nav" data-act="f5">+5 (75)</button></div><p class="dim small">Gedüngte Pflanzen wachsen 60 % schneller und bringen die doppelte Ernte.</p>`;
    overlay(`<header class="hd"><span class="coins">🪙 ${G.coins.toLocaleString('de-DE')}</span><h2>🛒 Markt</h2><button class="btn sm nav" data-act="esc">✕</button></header>${tabs}${body}`, {
      tab: b => { mTab = b.dataset.k; market(); }, s1: b => doSell(b.dataset.k, 1), sa: b => doSell(b.dataset.k, G.inv[b.dataset.k]),
      b1: b => doBuy(b.dataset.k, 1), b5: b => doBuy(b.dataset.k, 5), f1: () => { const r = C.buyFert(G, 1); r.err ? toast(r.err) : SND.coin(); market(); }, f5: () => { const r = C.buyFert(G, 5); r.err ? toast(r.err) : SND.coin(); market(); } }, 'market'); }
  function doSell(k, n) { const r = C.sell(G, k, n); if (r.err) toast(r.err); else { SND.coin(); toast('+' + r.coins + ' 🪙', 900); } handleEvents([]); hud(); market(); }
  function doBuy(k, n) { const r = C.buySeed(G, k, n); if (r.err) toast(r.err); else SND.coin(); hud(); market(); }

  /* ---------- Aufträge ---------- */
  function orders() { const now = Date.now(); overlay(ordersHtml(now), { esc: closeOv, dl: b => { const r = C.deliver(G, +b.dataset.id, Date.now()); if (r.err) { toast(r.err); SND.err(); } else { SND.coin(); toast('✅ Geliefert: +' + r.coins + ' 🪙  +' + r.xp + ' XP', 2200); handleEvents([]); save(); } hud(); orders(); },
    sk: b => { C.skipOrder(G, +b.dataset.id, Date.now()); orders(); } }, 'orders'); }
  function ordersHtml(now) { return `<header class="hd"><span class="coins">🪙 ${G.coins.toLocaleString('de-DE')}</span><h2>📋 Aufträge</h2><button class="btn sm nav" data-act="esc">✕</button></header>
    <div class="orders">${G.orders.map(o => { const ok = C.hasAll(G, o.items); return `<div class="order${ok ? ' ok' : ''}"><b>${esc(o.who)}</b><div class="need">${Object.keys(o.items).map(k => { const h = G.inv[k] || 0; return `<span class="${h >= o.items[k] ? 'good' : ''}">${C.goodsIcon(k)} ${h}/${o.items[k]} <small>${C.goodsName(k)}</small></span>`; }).join('')}</div>
      <p class="rew">🪙 ${o.coins} · ⭐ ${o.xp} XP</p><div class="row"><button class="btn sm nav" data-act="sk" data-id="${o.id}" title="Ablehnen – nach einer Minute kommt eine neue">🗑️</button><button class="btn sm gold nav" data-act="dl" data-id="${o.id}"${ok ? '' : ' disabled'}${ok ? ' data-focus' : ''}>🚚 Liefern</button></div></div>`; }).join('')}
    ${G.orders.length < 3 ? `<div class="order wait"><b>⏳ Neue Bestellung</b><p class="dim">in ${fmtMin((G.orderAt || now) - now)}</p></div>` : ''}</div>`; }
  let ovSig = '';
  function refreshOv() { const now = Date.now(); if (ovKind === 'orders') { const sig = G.orders.map(o => o.id).join(',') + '|' + Math.ceil(((G.orderAt || now) - now) / 1000); if (sig !== ovSig && G.orders.length < 3) { ovSig = sig; const f = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.act + (document.activeElement.dataset.id || '') : ''; orders(); restoreFocus(f); } }
    else if (ovKind === 'shop') { const box = $('ovBox'); box.querySelectorAll('[data-job]').forEach(el => { const [k, i] = el.dataset.job.split(':'), j = G.shops[k].jobs[+i]; if (!j) return; const f = j.done ? 1 : Math.min(1, (now - j.start) / Math.max(1, j.end - j.start)); el.querySelector('i').style.width = f * 100 + '%'; el.querySelector('span').textContent = j.done ? '✅ fertig' : fmtMin(j.end - now); });
      if (box.dataset.sig !== shopSig(box.dataset.shop)) { const f = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.act + (document.activeElement.dataset.i || '') : ''; shop(box.dataset.shop); restoreFocus(f); } } }
  function restoreFocus(sig) { if (!sig || coarse()) return; const el = Array.from($('ovBox').querySelectorAll('[data-act]')).find(b => b.dataset.act + (b.dataset.id || b.dataset.i || '') === sig && !b.disabled); if (el) el.focus({ preventScroll: true }); }

  /* ---------- Werkstätten ---------- */
  const shopSig = k => { const S = G.shops[k]; return S ? S.jobs.map(j => j.done).join('') + ':' + S.jobs.length : '-'; };
  function shop(k) { const D = C.SHOPS[k], S = G.shops[k];
    if (!S) { const lock = D.lv > G.lv; return overlay(`<div class="big">${D.e}</div><h2>${D.n}</h2><p>${lock ? '🔒 Gibt es ab Level ' + D.lv + '.' : 'Stellt her: ' + D.rec.map(r => C.goodsIcon(r.out) + ' ' + C.goodsName(r.out)).join(', ') + '.'}</p><div class="row end"><button class="btn nav" data-act="esc">Zurück</button><button class="btn gold nav" data-act="buy"${lock || G.coins < D.cost ? ' disabled' : ''} data-focus>Bauen (${D.cost} 🪙)</button></div>`, { buy: () => { const r = C.buyShop(G, k); closeOv(); if (r.err) return toast(r.err); SND.lvl(); toast(D.e + ' ' + D.n + ' gebaut!'); handleEvents([]); save(); } }); }
    const c = C.collectShop(G, k); if (c.got) { const P = C.PLACES[k]; R.pop(P.x + P.w / 2 - .5, P.y, '+' + c.got + ' 📦', '#ffe9a8'); SND.harvest(); handleEvents([]); }
    const now = Date.now(), busy = S.jobs.filter(j => !j.done).length;
    overlay(`<header class="hd"><span class="dim">Plätze ${busy}/${S.slots}</span><h2>${D.e} ${D.n}</h2><button class="btn sm nav" data-act="esc">✕</button></header>
      <div class="jobs">${S.jobs.map((j, i) => `<div class="job" data-job="${k}:${i}"><b>${C.goodsIcon(j.out)} ${C.goodsName(j.out)}</b><div class="pbar"><i style="width:${j.done ? 100 : Math.min(100, (now - j.start) / Math.max(1, j.end - j.start) * 100)}%"></i></div><span>${j.done ? '✅ fertig' : fmtMin(j.end - now)}</span></div>`).join('') || '<p class="dim">Nichts in Arbeit – wähle ein Rezept.</p>'}</div>
      <div class="rows">${D.rec.map((r, i) => { const ok = C.hasAll(G, r.in); return `<div class="rowi rec"><i>${C.goodsIcon(r.out)}</i><b>${C.goodsName(r.out)} <small class="dim">${C.GOODS[r.out].sell} 🪙 · ${r.min} min</small></b><span class="need">${Object.keys(r.in).map(x => `<span class="${(G.inv[x] || 0) >= r.in[x] ? 'good' : 'bad'}">${C.goodsIcon(x)} ${G.inv[x] || 0}/${r.in[x]}</span>`).join(' ')}</span><button class="btn sm gold nav" data-act="mk" data-i="${i}"${ok && busy < S.slots ? '' : ' disabled'}>Herstellen</button></div>`; }).join('')}</div>`,
      { mk: b => { const r = C.craft(G, k, +b.dataset.i, Date.now()); if (r.err) { toast(r.err); SND.err(); } else SND.ok(); hud(); shop(k); } }, 'shop');
    $('ovBox').dataset.shop = k; $('ovBox').dataset.sig = shopSig(k); }

  /* ---------- Bauen ---------- */
  function build() { const e = C.EXPAND[G.expand + 1];
    const row = (ic, n, d, cost, lock, act, k) => `<div class="rowi"><i>${ic}</i><b>${n}<small class="dim"> ${d}</small></b><span></span><span class="price">${lock ? '🔒 Lv ' + lock : cost + ' 🪙'}</span><button class="btn sm gold nav" data-act="${act}" data-k="${k || ''}"${lock || G.coins < cost ? ' disabled' : ''}>${act === 'ex' ? 'Kaufen' : act === 'an' ? 'Kaufen' : 'Bauen'}</button></div>`;
    overlay(`<header class="hd"><span class="coins">🪙 ${G.coins.toLocaleString('de-DE')}</span><h2>🔨 Bauen & Kaufen</h2><button class="btn sm nav" data-act="esc">✕</button></header>
      <h3>🟫 Felder</h3>${e ? row('🟫', 'Acker erweitern', 'mehr Beete', e.cost, (e.lv || 1) > G.lv ? e.lv : 0, 'ex') : '<p class="dim">Alle Felder gehören dir. 🎉</p>'}
      <h3>🐾 Tiere</h3><div class="rows">${Object.keys(C.ANIMALS).map(a => { const D = C.ANIMALS[a], n = (G.animals[a] || { list: [] }).list.length; return n >= D.max ? `<div class="rowi"><i>${D.e}</i><b>${D.n}<small class="dim"> ×${n} – Stall voll</small></b></div>` : row(D.e, D.n, '×' + n + ' · ' + C.GOODS[D.out].e + ' alle ' + D.min + ' min', C.animalCost(G, a), D.lv > G.lv ? D.lv : 0, 'an', a); }).join('')}</div>
      <h3>🛠️ Werkstätten</h3><div class="rows">${Object.keys(C.SHOPS).map(k => { const D = C.SHOPS[k]; return G.shops[k] ? `<div class="rowi"><i>${D.e}</i><b>${D.n}<small class="dim"> ✅ gebaut</small></b></div>` : row(D.e, D.n, D.rec.map(r => C.goodsIcon(r.out)).join(''), D.cost, D.lv > G.lv ? D.lv : 0, 'sh', k); }).join('')}</div>`,
      { ex: () => { const r = C.expand(G); r.err ? toast(r.err) : (SND.coin(), toast('🟫 Neue Felder!')); handleEvents([]); hud(); build(); },
        an: b => { const r = C.buyAnimal(G, b.dataset.k); r.err ? toast(r.err) : (SND.coin(), toast(C.ANIMALS[b.dataset.k].e + ' ist eingezogen!')); handleEvents([]); hud(); build(); },
        sh: b => { const r = C.buyShop(G, b.dataset.k); r.err ? toast(r.err) : (SND.lvl(), toast(C.SHOPS[b.dataset.k].e + ' gebaut!')); handleEvents([]); hud(); build(); } }, 'build'); }

  /* ---------- Lager & Hof ---------- */
  function lager() { const inv = Object.keys(G.inv).filter(k => G.inv[k] > 0), sd = Object.keys(G.seeds).filter(k => G.seeds[k] > 0);
    overlay(`<header class="hd"><span class="coins">🪙 ${G.coins.toLocaleString('de-DE')}</span><h2>🏡 ${esc(G.name)}</h2><button class="btn sm nav" data-act="esc">✕</button></header>
      <p class="dim">Bauer/Bäuerin <b>${esc(G.farmer)}</b> · Level ${G.lv} · Hofwert <b>${C.worth(G).toLocaleString('de-DE')}</b></p>
      <h3>📦 Lager</h3><div class="inv">${inv.map(k => `<span>${C.goodsIcon(k)}<b>${G.inv[k]}</b><small>${C.goodsName(k)}</small></span>`).join('') || '<p class="dim">leer</p>'}</div>
      <h3>🎒 Saat</h3><div class="inv">${sd.map(k => `<span>${C.CROPS[k].e}<b>${G.seeds[k]}</b><small>${C.CROPS[k].n}</small></span>`).join('') || '<p class="dim">keine – beim Säen wird automatisch gekauft</p>'}<span>🧪<b>${G.fert}</b><small>Dünger</small></span></div>
      <h3>📊 Statistik</h3><div class="stats"><span>🌾 Geerntet <b>${G.stats.harvest}</b></span><span>📋 Aufträge <b>${G.stats.orders}</b></span><span>🛠️ Hergestellt <b>${G.stats.crafted}</b></span><span>🥚 Tierprodukte <b>${G.stats.products}</b></span><span>💰 Verdient <b>${G.stats.earned.toLocaleString('de-DE')}</b></span><span>📅 Tage <b>${G.day}</b></span><span>🏆 Erfolge <b>${G.ach.length}/${C.ACH.length}</b></span></div>`, {}, 'lager'); }

  /* ---------- Tagesbilanz, Level, Pause ---------- */
  function daySummary(e) { save(); SND.lvl(); const ns = e.newSeason, s = C.SEASONS[e.nextSeason], W = C.WEATHER[e.weather];
    overlay(`<div class="big">${ns ? s.e : '🌙'}</div><h2>${ns ? s.n + ' beginnt!' : 'Tagesbilanz – Tag ' + e.day}</h2>
      <div class="stats big3"><span>🌾<b>${e.harvest}</b>geerntet</span><span>💰<b>${e.earned}</b>verdient</span><span>📋<b>${e.orders}</b>Aufträge</span></div>
      <p>Morgen: <b>${W.e} ${W.n}</b>${e.weather === 'regen' || e.weather === 'gewitter' ? ' – alle Beete sind gegossen.' : e.weather === 'schnee' ? ' – nur Wintergemüse wächst gut.' : ''}</p>${e.storm ? '<p class="warn">⚡ Ein Blitz hat eine Pflanze geknickt – antippen zum Aufräumen.</p>' : ''}
      ${ns ? `<p>Jetzt in der Saison: ${Object.keys(C.CROPS).filter(k => C.CROPS[k].s.includes(e.nextSeason) && C.CROPS[k].lv <= G.lv).map(k => C.CROPS[k].e).join(' ') || '–'}</p>` : ''}
      <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>☀️ Neuer Tag</button></div>`, {}); }
  function levelUp(n) { SND.lvl(); const u = []; for (let l = G.lv - n + 1; l <= G.lv; l++) u.push(...C.unlocks(l));
    overlay(`<div class="big">⭐</div><h2>Level ${G.lv}!</h2><p>Bonus: +${20 * G.lv} 🪙</p>${u.length ? `<p>Neu freigeschaltet:</p><div class="inv">${u.map(x => `<span>${x.split(' ')[0]}<small>${x.split(' ').slice(1).join(' ')}</small></span>`).join('')}</div>` : ''}<div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Super!</button></div>`, {}); }
  function pauseMenu() { if (ovOpen()) return; save(); overlay(`<h2>⏸️ Pause</h2><div class="col"><button class="btn gold nav" data-act="esc" data-focus>▶ Weiter</button><button class="btn nav" data-act="help">❓ So geht's</button><button class="btn nav" data-act="opt">⚙️ Einstellungen</button><button class="btn nav" data-act="menu">☰ Hauptmenü</button></div>`,
    { help: () => { closeOv(); help(); }, opt: () => { closeOv(); opts(); }, menu: () => { closeOv(); menu(); } }); }

  /* ---------- Zeiger: Tippen, Ziehen, Zoomen ---------- */
  const cv = $('cv'), ptr = new Map(); let drag = null, pinch = 0, painted = new Set();
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; return; }
    const r = cv.getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, paint: tool !== 'hand' }; painted = new Set(); if (drag.paint) { const t = R.toTile(e.clientX - r.left, e.clientY - r.top); if (C.inField(t.x, t.y)) { painted.add(t.x + ',' + t.y); R.setCursor(t); act(t.x, t.y, false); drag.did = true; } } });
  cv.addEventListener('pointermove', e => { if (!ptr.has(e.pointerId)) { if (e.pointerType === 'mouse' && !coarse()) { const r = cv.getBoundingClientRect(), t = R.toTile(e.clientX - r.left, e.clientY - r.top); R.setCursor(t); hoverInfo(t); } return; }
    ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); const r = cv.getBoundingClientRect();
    if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) R.zoom(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); pinch = d; return; }
    if (!drag) return; if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) drag.moved = true;
    if (drag.paint && drag.did) { const t = R.toTile(e.clientX - r.left, e.clientY - r.top), k = t.x + ',' + t.y; if (!painted.has(k) && C.inField(t.x, t.y)) { painted.add(k); R.setCursor(t); act(t.x, t.y, true); } }
    else if (drag.moved) { R.pan(e.clientX - drag.x, e.clientY - drag.y); } drag.x = e.clientX; drag.y = e.clientY; });
  const up = e => { const r = cv.getBoundingClientRect(); ptr.delete(e.pointerId); if (ptr.size < 2) pinch = 0; if (!drag) return; if (!drag.moved && !drag.did) { const t = R.toTile(e.clientX - r.left, e.clientY - r.top); R.setCursor(t); hoverInfo(t); act(t.x, t.y, false); } drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); drag = null; pinch = 0; });
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); R.zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  cv.addEventListener('contextmenu', e => e.preventDefault());

  /* ---------- Knöpfe ---------- */
  $('bMarket').onclick = market; $('bBuild').onclick = build; $('bOrd').onclick = orders; $('bInv').onclick = lager; $('bMenu').onclick = pauseMenu;
  $('bZin').onclick = () => R.zoom(1.2, innerWidth / 2, innerHeight / 2); $('bZout').onclick = () => R.zoom(1 / 1.2, innerWidth / 2, innerHeight / 2);
  $('bPress').onclick = menu;
  document.addEventListener('click', e => { const b = e.target.closest('[data-back]'); if (b && !b.onclick) menu(); });

  /* ---------- Start ---------- */
  R.init(cv);
  const tips = ['Die Hühner wachen auf …', 'Der Hahn kräht …', 'Die Sonne geht über den Feldern auf …', 'Die Gießkanne wird gefüllt …', 'Die Bienen summen …'];
  $('loadTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  let lp = 0; const lt = setInterval(() => { lp = Math.min(100, lp + 9 + Math.random() * 14); $('loadBar').style.width = lp + '%'; if (lp >= 100) { clearInterval(lt); setTimeout(() => { if (cur === 'sLoad') scr('sTitle'); }, 200); } }, 90);
  window.SHApp = { get game() { return G; }, set game(v) { G = v; }, start: startGame, menu, save, act, market, orders, build, lager, shop, setTool, scr: () => cur, tick: () => C.tick(G, Date.now(), true) };
})();

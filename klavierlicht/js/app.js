/* Klavierlicht – Oberfläche im Stil von Magic Piano / Piano Tiles: Laden, Titel, Konsolen-Menü (Spielmodi), Liederbuch mit
 * bunten Liedkarten (im Spiel + Online-Archiv), Medaillen-Auswahl (Leicht/Mittel/Schwer), Spiel als Kacheln oder Lichter,
 * Ergebnis mit Sternen und Kronen. Jedes Lied zeigt seine Rechte-Angabe. Speichern: klavierlicht-*, Gesamtpunkte als klavierlicht-highscore. */
(function () {
  'use strict';
  const C = KLCore, P = KLPiano, KM = KLMeta, $ = id => document.getElementById(id), PX = 'klavierlicht-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(PX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(PX + k, JSON.stringify(v)); } catch (e) { /* voll/privat */ } } };
  const SET = Object.assign({ level: 'normal', acc: 0.8, help: true, labels: true, rate: 0.75, wait: false, oct: 48, cal: 0, sort: 'std', mods: {}, hand: 'r', staff: true, soundAll: false, useHeart: false, useShield: false }, LS.get('settings', {})), saveSet = () => LS.set('settings', SET);
  const BEST = LS.get('best2', {});
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  // Online-Archiv: auf der Homepage relativ, in den Apps (ohne Archiv-Ordner) von der easygames-Homepage
  const PUB = (window.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/') + 'klavierlicht/archiv/';
  const ARCH = [new URL('archiv/', location.href).href, PUB].filter((v, i, a) => a.indexOf(v) === i);
  const LVL = Object.keys(C.LEVELS);
  let cur = 'sLoad', toastT = 0, archive = null, archBase = '', archTried = false, mode = 'klassisch', libCat = 'alle', libQ = '', song = null;
  function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2200); }

  /* ---------- Bildschirme, Fenster, Tastatur ---------- */
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const ovOpen = () => !$('ov').hidden;
  function focusFirst() { if (coarse() || cur === 'sGame' && !ovOpen()) return; const r = ovOpen() ? $('ovBox') : $(cur); const el = r && (r.querySelector('[data-focus]') || r.querySelector('.mi, .nav:not([disabled])')); if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  let ovEsc = null;
  function overlay(html, binds) { $('ovBox').innerHTML = html; $('ov').hidden = false; ovEsc = binds.esc || closeOv; $('ovBox').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { const f = binds[b.dataset.act] || (b.dataset.act === 'esc' ? ovEsc : null); if (f) f(b); }; }); setTimeout(focusFirst, 0); }
  function closeOv() { $('ov').hidden = true; $('ovBox').innerHTML = ''; ovEsc = null; setTimeout(focusFirst, 0); }
  function navMove(dx, dy) {
    const r = ovOpen() ? $('ovBox') : $(cur), els = Array.from(r.querySelectorAll('.nav, .mi')).filter(x => !x.disabled && x.offsetParent !== null); if (!els.length) return;
    const a = document.activeElement; if (!els.includes(a)) { els[0].focus(); return; }
    const q = a.getBoundingClientRect(), ax = q.left + q.width / 2, ay = q.top + q.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const b = e.getBoundingClientRect(), x = b.left + b.width / 2 - ax, y = b.top + b.height / 2 - ay, al = x * dx + y * dy; if (al <= 2) continue; const d = al + Math.abs(x * dy + y * dx) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
  }
  const BACK = { sMenu: () => scr('sTitle'), sLib: () => menu(), sSong: () => lib(), sHelp: () => menu(), sGame: () => pause() };
  addEventListener('keydown', e => {
    const t = e.target, typing = t && (t.tagName === 'INPUT' && t.type === 'search' || t.tagName === 'TEXTAREA');
    if (cur === 'sGame' && !ovOpen() && G.run) { if (gameKey(e, true)) { e.preventDefault(); return; } }
    if (e.code === 'Escape') { e.preventDefault(); if (ovOpen()) { if (ovEsc) ovEsc(); return; } if (typing) { t.blur(); return; } if (BACK[cur]) BACK[cur](); return; }
    if (typing) return;
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); P.init(); menu(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d && cur !== 'sGame') { e.preventDefault(); navMove(d[0], d[1]); }
  });
  addEventListener('keyup', e => { if (cur === 'sGame' && G.run) gameKey(e, false); });

  /* ---------- Menü: Spielmodi ---------- */
  const total = () => Object.values(BEST).reduce((a, b) => a + (b.score || 0), 0);
  const starsTotal = () => Object.values(BEST).reduce((a, b) => a + (b.stars || 0), 0);
  const crownsTotal = () => Object.values(BEST).reduce((a, b) => a + (b.crowns || 0), 0);
  function menu() { stopGame(); TOUR = null; if (NET.net && !ovOpen()) { NET.net.close(); NET.net = null; NET.role = ''; } scr('sMenu'); loadArchive(true);
    const md = KM.data, qs = KM.quests(), qd = qs.filter(q => q.done).length;
    $('mStats').innerHTML = `<span title="Sterne">⭐ ${starsTotal()}</span><span title="Kronen">👑 ${crownsTotal()}</span><span title="Diamanten">💎 ${md.gems}</span><span title="Punkte">🎵 ${total().toLocaleString('de-DE')}</span>`;
    const keys = ['klassisch', 'magie', 'lernen', 'frei', 'online', 'turnier', 'endlos', 'ueben', 'tag', 'hoeren'];
    $('mList').innerHTML = keys.map((k, i) => { const M = k === 'online' ? ONLINE_CARD : C.MODES[k]; return `<button class="mi m-${k}${i ? '' : ' hero'}" data-go="${k}"><i>${M.ic}</i><b>${M.n}</b><small>${M.d}</small></button>`; }).join('') +
      `<div class="mRow"><button class="mi sm" data-go="quests"><i>📋</i><b>Aufgaben <em class="badge">${qd}/3</em></b></button><button class="mi sm" data-go="shop"><i>💎</i><b>Shop</b></button><button class="mi sm" data-go="ach"><i>🏅</i><b>Erfolge</b></button><button class="mi sm" data-go="rank"><i>🏆</i><b>Ranglisten</b></button><button class="mi sm" data-go="help"><i>❓</i><b>So geht's</b></button><button class="mi sm" data-go="opts"><i>⚙️</i><b>Einstellungen</b></button></div>`;
    $('mList').querySelectorAll('.mi').forEach(b => { b.onclick = () => go(b.dataset.go); });
  }
  function go(g) {
    if (g === 'help') return help(); if (g === 'opts') return opts(); if (g === 'frei') return startFree();
    if (g === 'shop') return shop(); if (g === 'quests') return questsView(); if (g === 'ach') return achView(); if (g === 'rank') return rankView();
    if (g === 'online') return online(); if (g === 'turnier') { mode = g; return tourScreen(); }
    mode = g; libQ = ''; $('libSearch').value = ''; if (g === 'lernen') libCat = 'pfad'; else if (libCat === 'pfad') libCat = 'alle';
    if (g === 'tag') { const all = allSongs().filter(x => !x.gems); const s = all[C.dailyIndex(all.length)]; song = s; return pick(s, 'normal'); }
    lib();
  }

  /* ---------- Lieder: im Spiel + Archiv ---------- */
  const builtinList = () => KLSongs.list.map(s => ({ id: s.id, title: s.title, artist: s.artist, cat: s.cat, lic: s.lic, src: 'Klaviersatz: easygames (eigene Notensetzung)', builtin: true, notation: s }));
  // eigene Lieder (MIDI-Dateien, Aufnahmen): nur auf diesem Gerät, nicht im Cloud-Spielstand
  const OWN_KEY = 'kl-own';
  const ownList = () => { try { return JSON.parse(localStorage.getItem(OWN_KEY)) || []; } catch (e) { return []; } };
  const ownSave = l => { try { localStorage.setItem(OWN_KEY, JSON.stringify(l.slice(-12))); return true; } catch (e) { toast('Speicher voll – bitte ein eigenes Lied entfernen.'); return false; } };
  function addOwn(chart) { const l = ownList().filter(c => c.id !== chart.id); l.push(chart); return ownSave(l); }
  let builtCache = null;
  function allSongs() { if (!builtCache) builtCache = builtinList().map(s => Object.assign({ diff: C.difficulty(C.fromNotation(s.notation)), dur: C.duration(C.fromNotation(s.notation)) }, s));
    return builtCache.concat((archive || []).map(s => Object.assign({ online: true }, s))); }
  const ownSongs = () => ownList().map(c => ({ id: c.id, title: c.title, artist: c.artist, cat: 'eigen', lic: c.lic, src: c.src, own: true, chart: c, diff: C.difficulty(c), dur: C.duration(c) }));
  const skey = s => (s.own ? 'o:' : s.builtin ? 'b:' : 'a:') + s.id;
  const bkey = (s, lvl) => mode + ':' + lvl + ':' + skey(s);
  async function loadArchive(quiet) {
    if (archive || archTried && quiet) return;
    archTried = true;
    for (const b of ARCH) {
      try { const r = await fetch(b + 'index.json', { cache: 'no-cache' }); if (!r.ok) continue; const j = await r.json(); if (!Array.isArray(j.songs)) continue; archive = j.songs; archBase = b; break; } catch (e) { /* nächste Adresse */ }
    }
    if (cur === 'sLib') renderLib();
  }
  const CAT_ART = { eigen: ['📂', 'g-eigen'], kinder: ['🧸', 'g-kinder'], weihnacht: ['🎄', 'g-weihnacht'], volk: ['🌍', 'g-volk'], klassik: ['🎻', 'g-klassik'], choral: ['⛪', 'g-choral'] };
  const LVLN = d => d <= 1 ? ['LEICHT', 'easy'] : d === 2 ? ['MITTEL', 'mid'] : ['SCHWER', 'hard'];
  function lib() { scr('sLib'); renderLib(); if (!archive) loadArchive(false); }
  function renderLib() {
    const M = C.MODES[mode]; $('libTitle').innerHTML = `${M.ic} ${M.n}`;
    const own = ownSongs(), list0 = allSongs().concat(own), md = KM.data;
    const cats = Object.assign({ pfad: '🎓 Lernpfad', neu: '🆕 Neue Lieder', fav: '❤️ Meine', eigen: '📂 Eigene' }, KLSongs.CATS);
    const cats0 = mode === 'lernen' ? ['pfad', 'alle', 'neu', 'fav', 'eigen'] : ['alle', 'neu', 'fav', 'eigen'];
    $('libTabs').innerHTML = cats0.concat(Object.keys(KLSongs.CATS).filter(k => k !== 'alle' && list0.some(s => s.cat === k))).map(k => `<button class="chip nav${libCat === k ? ' on' : ''}" data-cat="${k}">${cats[k]}</button>`).join('');
    $('libTabs').querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { libCat = b.dataset.cat; renderLib(); });
    if (libCat === 'pfad') { if (mode === 'lernen') return renderPath(); libCat = 'alle'; }
    const q = libQ.trim().toLowerCase();
    let list = libCat === 'alle' ? list0 : libCat === 'neu' ? list0.filter(s => s.gems) : libCat === 'fav' ? list0.filter(s => md.fav.includes(skey(s))) : list0.filter(s => s.cat === libCat);
    if (q) list = list.filter(s => (s.title + ' ' + s.artist + ' ' + (s.lic || '')).toLowerCase().includes(q));
    const plays = s => md.plays[skey(s)] || 0;
    if (SET.sort === 'beliebt') list = list.slice().sort((a, b) => plays(b) - plays(a)); else if (SET.sort === 'az') list = list.slice().sort((a, b) => a.title.localeCompare(b.title, 'de'));
    else if (SET.sort === 'leicht') list = list.slice().sort((a, b) => (a.diff || 2) - (b.diff || 2)); else if (SET.sort === 'schwer') list = list.slice().sort((a, b) => (b.diff || 2) - (a.diff || 2));
    $('libCount').textContent = list.length + ' Lieder' + (archive ? '' : ' · 🌐 Archiv lädt …');
    const midiBtn = libCat === 'eigen' ? '<button class="card nav g-eigen addOwn" id="addMidi"><span class="art"><i>📂</i></span><span class="tx"><b>Eigene MIDI-Datei laden</b><small>Eine .mid-Datei von deinem Gerät wird zu Kacheln – sie bleibt nur hier auf dem Gerät.</small></span><span class="rt"><span class="play">＋ LADEN</span></span></button>' : '';
    $('libList').innerHTML = midiBtn + (list.length ? list.map(s => {
      const [art, g] = CAT_ART[s.cat] || ['🎵', 'g-volk'], [ln, lc] = LVLN(s.diff || 2), st = Math.max(0, ...LVL.map(l => (BEST[bkey(s, l)] || {}).stars || 0)), cr = Math.max(0, ...LVL.map(l => (BEST[bkey(s, l)] || {}).crowns || 0)), fl = LVL.some(l => (BEST[bkey(s, l)] || {}).crown);
      return `<button class="card nav ${g}" data-k="${esc(skey(s))}">
        <span class="art"><i>${art}</i><em class="lv ${lc}">${ln}</em></span>
        <span class="tx"><b>${s.gems ? '🆕 ' : ''}${md.fav.includes(skey(s)) ? '❤️ ' : ''}${esc(s.title)}</b><small>${esc(s.artist)}${s.dur ? ' · ' + C.fmt(s.dur) : ''}${s.online ? ' · 🌐' : ''}${plays(s) ? ' · ' + plays(s) + '× gespielt' : ''}</small><small class="lic">© ${esc(s.lic || '')}</small></span>
        <span class="rt"><span class="st">${fl ? '💯' : ''}${'👑'.repeat(cr)}${'★'.repeat(st)}<em>${'★'.repeat(3 - st)}</em></span><span class="play${locked(s) ? ' lock' : ''}">${locked(s) ? '🔒 💎 ' + s.gems : mode === 'hoeren' ? '▶ HÖREN' : mode === 'lernen' ? '▶ LERNEN' : '▶ PLAY'}</span></span></button>`; }).join('') : libCat === 'fav' ? '<p class="empty">Noch keine Lieblingslieder – tippe beim Lied auf ❤️.</p>' : libCat === 'eigen' ? '' : '<p class="empty">Nichts gefunden.</p>') +
      (archive ? '' : archTried ? '<p class="empty">📡 Das Online-Archiv ist gerade nicht erreichbar – die Lieder im Spiel gehen immer. <button class="btn sm nav" id="retry">🔄 Nochmal</button></p>' : '');
    $('libList').querySelectorAll('.card[data-k]').forEach(b => b.onclick = () => { song = list0.find(x => skey(x) === b.dataset.k); songScreen(); });
    const am = $('addMidi'); if (am) am.onclick = () => $('midiFile').click();
    const r = $('retry'); if (r) r.onclick = () => { archTried = false; loadArchive(false); renderLib(); };
  }
  $('libSearch').addEventListener('input', e => { libQ = e.target.value; renderLib(); });
  $('libSort').value = SET.sort; $('libSort').onchange = e => { SET.sort = e.target.value; saveSet(); renderLib(); };
  $('midiFile').onchange = async e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    try { if (f.size > 2e6) throw new Error('Datei zu groß (höchstens 2 MB)'); const c = KLMidi.toChart(KLMidi.parse(await f.arrayBuffer()), f.name.replace(/\.(mid|midi|kar)$/i, '').slice(0, 60));
      if (!addOwn(c)) return; toast('📂 „' + c.title + '“ ist jetzt spielbar'); libCat = 'eigen'; song = ownSongs().find(s => s.id === c.id); songScreen(); }
    catch (x) { toast('📂 Diese Datei geht nicht: ' + x.message, 3500); } };

  /* ---------- Lied: Medaillen (Leicht / Mittel / Schwer) ---------- */
  const locked = s => !!(s && s.gems && !KM.ownsSong(s.id));
  // neues Lied freischalten (oder kurz reinhören)
  function unlockView(s) {
    const have = KM.data.gems;
    overlay(`<h2>🆕 Neues Lied freischalten</h2><p><b>${esc(s.title)}</b><br><small class="dim">${esc(s.artist)}${s.dur ? ' · ' + C.fmt(s.dur) : ''}</small></p><p class="copy small">© ${esc(s.lic || '')}</p><p>Du hast 💎 ${have}</p>
      <div class="col"><button class="btn gold nav" data-act="buy"${have < s.gems ? ' disabled' : ' data-focus'}>🔓 Für 💎 ${s.gems} freischalten</button><button class="btn nav" data-act="hear"${have < s.gems ? ' data-focus' : ''}>🎧 20 Sekunden reinhören</button><button class="btn nav" data-act="esc">Zurück</button></div>${have < s.gems ? '<p class="dim small">Diamanten gibt es für Sterne, Kronen, Aufgaben und Erfolge.</p>' : ''}`,
      { buy: () => { if (!KM.buySong(s.id, s.gems)) return; closeOv(); toast('🔓 „' + s.title + '“ freigeschaltet!'); song = s; if (cur === 'sLib') renderLib(); songScreen(); },
        hear: async () => { closeOv(); const m0 = mode; mode = 'hoeren'; await pick(s, 'normal', true); mode = m0; G.len = Math.min(G.len, 20); G.preview = true; } });
  }
  function songScreen() {
    if (locked(song)) return unlockView(song);
    if (mode === 'hoeren') return pick(song, 'normal');
    scr('sSong'); const M = C.MODES[mode];
    $('sgTitle').textContent = song.title; $('sgArtist').textContent = song.artist;
    $('sgMedals').innerHTML = LVL.map(l => { const b = BEST[bkey(song, l)] || {}, s = b.stars || 0;
      return `<button class="medal nav m-${C.LEVELS[l].medal}" data-l="${l}"${l === SET.level ? ' data-focus' : ''}><span class="coin"><i>${s >= 1 ? '★' : '☆'}</i><i>${s >= 2 ? '★' : '☆'}</i><i>${s >= 3 ? '★' : '☆'}</i>${b.crown ? '<u>👑</u>' : ''}</span><b>${C.LEVELS[l].n}</b><small>${b.score ? b.score.toLocaleString('de-DE') + ' Punkte' : 'noch nicht gespielt'}</small></button>`; }).join('');
    $('sgMedals').querySelectorAll('.medal').forEach(b => b.onclick = () => { SET.level = b.dataset.l; saveSet(); pick(song, b.dataset.l); });
    $('sgInfo').innerHTML = `<p class="md">${M.ic} ${M.n}</p><p>${M.d}</p>${M.practice ? `<label class="lab2">Tempo <b id="rateV">${Math.round(SET.rate * 100)} %</b><input type="range" class="nav" id="rate" min="0.5" max="1" step="0.05" value="${SET.rate}"></label>` : ''}${M.learn ? `<label class="tg nav"><input type="checkbox" id="wait"${SET.wait ? ' checked' : ''}> ⏳ Warten, bis ich die richtige Taste spiele</label><div class="seg">${[['r', '✋ Rechte Hand'], ['l', '🤚 Linke Hand'], ['b', '🙌 Beide']].map(([k, n]) => `<button class="chip nav${SET.hand === k ? ' on' : ''}" data-hand="${k}">${n}</button>`).join('')}</div>` : ''}
      ${M.view === 'tiles' && !M.tour && !M.net ? `<div class="mods"><b>Herausforderungen</b> <small>+15 % Punkte je Stück</small><div>${MODS.map(([k, ic, n, d]) => `<button class="chip nav${SET.mods[k] ? ' on' : ''}" data-mod="${k}" title="${d}">${ic} ${n}</button>`).join('')}</div></div>` : ''}
      ${M.lives && !M.tour && !M.net ? `<div class="mods"><b>🧰 Hilfsmittel</b> <small>werden beim Start verbraucht</small><div><button class="chip nav${SET.useHeart ? ' on' : ''}" data-it="useHeart">❤️ Extra-Herz (${KM.data.items.heart})</button><button class="chip nav${SET.useShield ? ' on' : ''}" data-it="useShield">🛡️ Schild (${KM.data.items.shield})</button><span class="chip">🐢 Zeitlupe: ${KM.data.items.slow} – im Spiel antippen</span></div></div>` : ''}
      <div class="row"><button class="btn sm nav" id="sgFav">${KM.data.fav.includes(skey(song)) ? '❤️ Lieblingslied' : '🤍 Als Lieblingslied merken'}</button>${song.own ? '<button class="btn sm nav" id="sgDel">🗑 Entfernen</button>' : ''}</div>
      <div class="copy"><b>©</b> ${esc(song.lic || '')}<br><small>${esc(song.src || '')}</small></div>`;
    $('sgInfo').querySelectorAll('[data-it]').forEach(b => b.onclick = () => { const k = b.dataset.it; SET[k] = !SET[k]; b.classList.toggle('on', SET[k]); saveSet(); if (SET[k] && !KM.data.items[k === 'useHeart' ? 'heart' : 'shield']) toast('Keine mehr übrig – im 💎 Shop unter 🧰 Hilfsmittel.'); });
    $('sgInfo').querySelectorAll('[data-mod]').forEach(b => b.onclick = () => { const k = b.dataset.mod; SET.mods[k] = !SET.mods[k]; b.classList.toggle('on', SET.mods[k]); saveSet(); });
    $('sgFav').onclick = () => { const on = KM.fav(skey(song)); $('sgFav').textContent = on ? '❤️ Lieblingslied' : '🤍 Als Lieblingslied merken'; };
    const dl = $('sgDel'); if (dl) dl.onclick = () => { ownSave(ownList().filter(c => c.id !== song.id)); toast('🗑 Entfernt'); lib(); };
    $('sgInfo').querySelectorAll('[data-hand]').forEach(b => b.onclick = () => { SET.hand = b.dataset.hand; saveSet(); $('sgInfo').querySelectorAll('[data-hand]').forEach(x => x.classList.toggle('on', x === b)); });
    const w = $('wait'); if (w) w.onchange = () => { SET.wait = w.checked; saveSet(); };
    const r = $('rate'); if (r) r.oninput = () => { SET.rate = +r.value; $('rateV').textContent = Math.round(SET.rate * 100) + ' %'; saveSet(); };
  }
  $('sgBack').onclick = () => lib();
  const MODS = [['blind', '🙈', 'Blind', 'Kacheln verschwinden kurz vor der Linie'], ['mirror', '🪞', 'Spiegel', 'Bahnen gespiegelt'], ['chaos', '🌀', 'Chaos', 'Kacheln werden mal schneller, mal langsamer']];
  async function pick(s, level, preview) {
    if (locked(s) && !preview) return unlockView(s);
    song = s;
    if (C.MODES[mode] && C.MODES[mode].net) { if (NET.role === 'host' && isOn()) return netStartSong(s, level); toast('Erst verbinden: 🌐 Online & Duett im Menü.'); return menu(); }
    if (s.own) return start(s.chart, level);
    if (s.builtin) return start(C.fromNotation(s.notation), level);
    toast('🌐 Lied wird geladen …', 1500);
    try { const r = await fetch(archBase + encodeURIComponent(s.id) + '.json'); const c = await r.json(); if (!C.check(c)) throw new Error('Format'); start(c, level); }
    catch (e) { toast('📡 Lied konnte nicht geladen werden – bitte später nochmal.'); }
  }

  /* ---------- Spiel ---------- */
  const G = { run: false };
  const cv = $('cv'), cx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, raf = 0;
  function resize() { dpr = Math.min(coarse() ? 1.5 : 2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  addEventListener('resize', () => { if (cur === 'sGame') { resize(); if (G.keys) layoutKeys(); } });
  const KEYS = { 4: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], 5: ['KeyD', 'KeyF', 'Space', 'KeyJ', 'KeyK'], 6: ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL'] };
  const LABEL = c => c === 'Space' ? '␣' : c.replace('Key', '');
  const COLORS = ['#ff5fa2', '#ffb03a', '#ffe14d', '#5dffa0', '#4dd8ff', '#a78bff'];
  function start(chart, level) {
    if (!P.init()) { toast('Dein Browser kann keinen Ton erzeugen.'); return; }
    const M = C.MODES[mode]; if (M.view === 'keys') return startKeys(chart, level);
    const L0 = C.LEVELS[M.auto ? 'normal' : level];
    const tiles = M.view === 'tiles', lanes = tiles ? 4 : L0.lanes;
    const L = Object.assign({}, L0, { lanes, any: tiles ? false : L0.any, fall: tiles ? L0.fall * 0.95 : L0.fall });
    const rate = M.practice ? SET.rate : 1, ch = rate !== 1 ? C.withRate(chart, rate) : chart;
    const mods = tiles && !M.tour && !M.auto && !M.net ? Object.assign({}, SET.mods) : {}, nm = Object.values(mods).filter(Boolean).length;
    P.setTimbre(SET.soundAll ? KM.data.use.sound : 'klavier');
    G.preview = false;
    Object.assign(G, { battle: M.net && NET.kind === 'battle' && isOn(), duet: M.net && NET.kind === 'duett' && isOn(), chart, ch, level, M, L, tiles, rate, round: 1, lives: M.lives, ai: 0, st: C.newState(), auto: !!M.auto, run: true, paused: false, fx: [], held: {}, flash: {}, wrong: 0, msg: null, over: false, word: null, keys: false, free: false, learn: false, hold: {},
      mods, mult: 1 + 0.15 * nm, crowns: 0, st1: null, revives: 0, gold: 0, design: KM.SHOP.design[KM.data.use.design], lat: Math.max(0, Math.min(0.3, P.ctx.outputLatency || 0)) });
    buildNotes();
    // Hilfsmittel (nicht im Turnier und Battle): Extra-Herz, Schutzschild, Zeitlupe
    G.shield = 0; G.speed = 1; G.slowUntil = 0; G.items = M.lives && !M.tour && !G.battle;
    if (G.items && SET.useHeart && KM.useItem('heart')) G.lives++;
    if (G.items && SET.useShield && KM.useItem('shield')) G.shield = 1;
    slowBtn();
    for (const id in PLN) delete PLN[id];
    G.len = C.duration(ch) + 1.2; G.t0 = P.ctx.currentTime + (NET.delay != null ? NET.delay : 2.2); $('gOpp').textContent = '';
    scr('sGame'); resize(); bgKey = ''; $('gTitle').textContent = chart.title; $('gLic').textContent = '© ' + (chart.lic || song && song.lic || ''); $('gMode').textContent = M.ic + ' ' + M.n + (M.auto ? '' : ' · ' + C.LEVELS[level].n) + (rate !== 1 ? ' · ' + Math.round(rate * 100) + ' %' : '');
    document.body.dataset.view = G.tiles ? 'tiles' : 'lights'; document.body.dataset.kmode = '';
    const beat = 60 / (ch.bpm || 100); for (let i = 0; i < 4; i++) P.note(84, G.t0 - (4 - i) * beat, 0.08, i ? 0.22 : 0.32);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function stopGame() { G.run = false; cancelAnimationFrame(raf); P.stopAll(); }
  // Noten einer Runde: Melodie, Begleitung, Doppelkacheln (Mittel/Schwer), Wischkacheln, goldene Bonus-Kacheln, Spiegel
  function buildNotes() {
    const lv = G.auto ? 'normal' : G.level, N = G.L.lanes; G.notes = C.playable(G.ch, lv, N); G.ai = 0; G.hold = {};
    G.acc = C.accompaniment(G.ch).concat(C.melodyRest(G.ch, G.notes)).sort((a, b) => a[0] - b[0]);   // weggelassene Melodietöne klingen mit
    if (G.duet) {   // Duett: Gastgeber spielt die Melodie, Gast den Bass – die Stimme des anderen kommt als Ton über die Verbindung
      const ln = learnNotes(G.ch, lv === 'leicht' ? 'normal' : lv, 'b'); G.acc = ln.acc.filter(a => a[3] > 0);
      const mine = ln.notes.filter(n => n.hand === (NET.role === 'host' ? 'R' : 'L')); C.lanesFor(mine, N); G.notes = mine;
      if (!mine.length) toast('Dieses Lied hat keine eigene Bassstimme – wähle ein anderes.'); return;
    }
    if (G.auto || G.M.practice && !G.tiles) return;
    if (lv !== 'leicht' && !G.duet) C.doubles(G.ch, G.notes, G.acc, lv === 'profi' ? 8 : 16, N);
    let longs = 0, k = 0;
    for (const n of G.notes) {
      if (G.mods.mirror) n.lane = N - 1 - n.lane;
      if (G.tiles && lv !== 'leicht' && !n.twin && isLongT(n) && longs++ % 2) {   // jede zweite lange Kachel schlängelt sich in die Nachbarbahn
        const to = n.lane > 0 && (n.lane === N - 1 || k++ % 2) ? n.lane - 1 : n.lane + 1;
        if (!G.notes.some(o => o !== n && o.lane === to && o.t > n.t - 0.5 && o.t < n.t + n.d + 0.3)) n.slide = to;
      }
      if (G.tiles && !n.twin && n.slide == null && !isLongT(n) && (Math.round(n.t * 1000) % 23) === 7) n.gold = true;
    }
  }
  const isLongT = n => n.d * 0.8 / G.L.fall > 0.2;
  const now = () => P.ctx.currentTime - G.t0 - (G.lat || 0);
  const LATE = () => coarse() ? 0.2 : C.WIN.good;   // so spät zählt ein Treffer noch (Touch etwas großzügiger)
  function nextRound(f) {   // Endlos (10 %) und Kronen-Runden (15 %): gleiches Lied, schneller
    G.round++; G.rate = Math.min(2.2, G.rate * (f || 1.1)); G.ch = C.withRate(G.chart, G.rate);
    buildNotes(); G.len = C.duration(G.ch) + 1.2; G.t0 = P.ctx.currentTime + 1.6;
    G.msg = { t: performance.now(), txt: G.M.crowns ? (G.round === 2 ? '★★★ Geschafft! Jetzt schneller für die Krone 👑' : '👑 Krone ' + (G.round - 2) + '! Noch schneller …') + ' · Tempo ' + Math.round(G.rate * 100) + ' %' : 'Runde ' + G.round + ' · ' + Math.round(G.rate * 100) + ' %' };
  }
  function roundDone() {
    if (G.M.loop) return nextRound(1.1);
    if (G.M.crowns && !G.duet && !G.battle) { if (G.round === 1) G.st1 = Object.assign({}, G.st); else G.crowns = G.round - 1; if (G.round < 4) return nextRound(1.15); }
    finish();
  }
  function loseLife() {
    if (!G.M.lives) return;
    if (G.shield > 0) { G.shield--; G.msg = { t: performance.now(), txt: '🛡️ Schild hat dich gerettet!' }; return; }
    G.lives--; G.wrong = performance.now();
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { /* egal */ }
    if (G.lives <= 0) { G.over = true; if (G.revives < 2 && !G.battle) reviveOffer(); else { G.run = false; setTimeout(finish, 450); } }
  }
  // Wiederbeleben gegen Diamanten: 1,5 Sekunden zurück, volle Herzen
  const reviveCost = () => 10 * Math.pow(2, G.revives);
  // Pause ohne den Ton anzuhalten (suspend/resume kann die Audio-Uhr einfrieren): Uhr merken, geplante Töne stoppen, danach Zeitachse verschieben
  function slowBtn() { const b = $('bSlow'), n = KM.data.items.slow; b.hidden = !(G.items && !G.keys && (n > 0 || G.speed !== 1)); b.textContent = G.speed !== 1 ? '🐢 läuft' : '🐢 ' + n; b.disabled = G.speed !== 1; }
  $('bSlow').onclick = () => { if (!G.run || G.paused || G.speed !== 1 || !G.items || !KM.useItem('slow')) return; G.speed = 0.6; G.slowUntil = performance.now() + 8000; G.ai = Math.max(0, G.acc.findIndex(a => a[0] >= now())); P.stopAll(); G.msg = { t: performance.now(), txt: '🐢 Zeitlupe!' }; slowBtn(); };
  function pauseClock() { if (G.paused) return; G.paused = true; G.pAt = P.ctx.currentTime; P.stopAll(); }
  function resumeClock() {
    if (!G.paused) return; const d = Math.max(0, P.ctx.currentTime - G.pAt); G.t0 += d; G.lastC = P.ctx.currentTime;
    const t = G.keys ? G.lt : now(); if (G.acc) { G.ai = G.acc.findIndex(a => a[0] >= t - 0.02); if (G.ai < 0) G.ai = G.acc.length; }
    G.held = {}; for (const id in PLN) delete PLN[id]; G.paused = false;
  }
  function reviveOffer() {
    pauseClock(); const c = reviveCost(), have = KM.data.gems;
    overlay(`<div class="res"><div class="stars">💔</div><h2>Weiterspielen?</h2><p>Mit Diamanten machst du genau hier weiter – mit vollen Herzen.</p><p class="dim">Du hast 💎 ${have}</p>
      <div class="col"><button class="btn gold nav" data-act="yes"${have < c ? ' disabled' : ' data-focus'}>💎 ${c} – Weiterspielen</button><button class="btn nav" data-act="esc"${have < c ? ' data-focus' : ''}>Aufgeben</button></div>${have < c ? '<p class="dim small">Diamanten gibt es für Sterne, Kronen, goldene Kacheln, Aufgaben und Erfolge.</p>' : ''}</div>`,
      { esc: () => { closeOv(); G.paused = false; G.run = false; finish(); },
        yes: () => { if (!KM.spend(c)) return; closeOv(); resumeClock(); G.revives++; G.over = false; G.lives = G.M.lives; const back = 1.5, tn = now() - back; G.t0 += back;
          for (const n of G.notes) if (n.t > tn - 0.05) { if (n.hit === 'miss') n.hit = null; else if (n.hit) n.at = -99; }
          const nx = G.notes.find(n => n.hit === null); if (nx && nx.t - now() < 1.2) G.t0 += 1.2 - (nx.t - now());   // Schonzeit bis zur nächsten Kachel
          G.ai = G.acc.findIndex(a => a[0] >= now()); if (G.ai < 0) G.ai = G.acc.length; G.hold = {}; P.stopAll();
          G.msg = { t: performance.now(), txt: '💎 Weiter geht\'s!' }; } }); }
  function frame() {
    if (!G.run) return; raf = requestAnimationFrame(frame); if (G.paused) return;
    if (G.keys) { keysFrame(); return; }
    const c0 = P.ctx.currentTime, dtf = Math.min(0.1, c0 - (G.lastF || c0)); G.lastF = c0;
    if (G.speed !== 1) { G.t0 += dtf * (1 - G.speed); if (performance.now() > G.slowUntil) { G.speed = 1; slowBtn(); } }
    const t = now(), la = G.speed !== 1 ? 0.04 : 0.3;
    while (G.ai < G.acc.length && G.acc[G.ai][0] < t + la) { const [at, p, d, v] = G.acc[G.ai++]; if (v > 0 && at > t - 0.05) P.note(p, G.speed !== 1 ? c0 + Math.max(0, at - t) / G.speed : G.t0 + at, d / G.speed, v * SET.acc); }
    for (const n of G.notes) {
      if (n.hit !== null) continue;
      if (G.auto) { if (n.t < t + 0.25) { P.note(n.p, G.t0 + n.t, n.d, 0.75); n.hit = 'perfect'; n.at = n.t; C.scoreHit(G.st, 'perfect'); setTimeout(() => burst(n, 'perfect'), Math.max(0, (n.t - t) * 1000)); } continue; }
      if (n.t < t - LATE()) { n.hit = 'miss'; n.at = t; C.scoreHit(G.st, null); if (SET.help || !G.M.lives) P.note(n.p, G.t0 + n.t + 0.01, n.d, 0.16); netSend({ ty: 'miss' }); loseLife(); if (!G.run || G.paused) break; }
      if (n.t > t + 3) break;
    }
    for (const l in G.hold) if (t >= G.hold[l].n.t + G.hold[l].n.d) endHold(l, t);
    if (G.run) draw(t);
    if (G.run && !G.paused && t > G.len) roundDone();
    if (G.battle || G.duet) netTick(t);
  }
  // Zeitpunkt der Eingabe: Verzögerung bis zur Verarbeitung (Touch auf dem Handy oft 30–80 ms) wieder abziehen
  const evLag = e => { const d = e && e.timeStamp ? (performance.now() - e.timeStamp) / 1000 : 0; return d > 0 && d < 0.15 ? d : 0; };
  const TILE_EARLY = 0.5;   // Kacheln: so früh darf man die unterste Kachel antippen (wie bei Piano Tiles: Kachel tippen statt Linie treffen)
  // Kachel/Licht im Spielfeld (Kacheln: Unterkante und Höhe wie in drawTiles)
  const tileSpeed = () => H * 0.8 / G.L.fall;
  const isLong = n => G.tiles ? n.d * tileSpeed() > H * 0.2 : n.d > 0.35;
  function tileRect(n, t) { const sp = tileSpeed(), bottom = H * 0.8 - (n.t - t) * sp + 18, h = Math.max(H * 0.17, n.d * sp); return [bottom - h, bottom]; }
  // lange Kachel gedrückt halten: Ton klingt, Kachel füllt sich, Bonuspunkte nach gehaltener Zeit
  function endHold(lane, t) {
    const h = G.hold[lane]; if (!h) return; delete G.hold[lane];
    const f = Math.max(0, Math.min(1, ((t == null ? now() : t) - h.n.t) / h.n.d)); h.n.held = f; h.n.at = now();
    const bonus = Math.round(60 * f); G.st.score += bonus;
    if (f >= 0.97) { G.word = { k: 'perfect', t: performance.now() }; burst(h.n, 'perfect'); } else if (h.v) P.release(h.v);
  }
  function hitScore(kind) { const b = G.st.score; C.scoreHit(G.st, kind); if (kind && G.mult > 1) G.st.score += Math.round((G.st.score - b) * (G.mult - 1)); }
  // Wischkachel: Halten wandert mit dem Finger in die Nachbarbahn
  function slideTo(from, to) { const h = G.hold[from]; if (!h || h.n.slide !== to) return false; delete G.hold[from]; G.hold[to] = h; return true; }
  function laneHit(lane, e, slide) {
    if (!G.run || G.paused || G.auto) return;
    const t = now() - evLag(e) - (e && e.pointerType === 'touch' ? 0.02 : 0) - (SET.cal || 0); G.flash[lane] = performance.now();
    let best = null, bd = 9;
    if (G.tiles) {   // unterste offene Kachel der Bahn: zählt, wenn sie bald die Linie erreicht oder direkt angetippt wird
      const y = e && e.clientY != null ? e.clientY - cv.getBoundingClientRect().top : null;
      for (const n of G.notes) { if (n.hit !== null || n.lane !== lane || n.t <= t - LATE()) continue; const [tp, bt] = tileRect(n, t); if (slide ? n.t - t < 0.18 : n.t - t < TILE_EARLY || y != null && y >= tp - 24 && y <= bt + 40 && tp < H * 0.8) best = n; break; } }
    else for (const n of G.notes) { if (n.hit !== null) continue; if (n.t > t + C.WIN.good) break; const d = Math.abs(n.t - t); if ((G.L.any || n.lane === lane) && d < bd && n.t > t - LATE()) { bd = d; best = n; } }
    if (!best) {
      // Kachel-Modi: ins Leere getippt = Fehler (kommt in der Bahn bald eine Kachel, zählt es nicht)
      if (G.tiles && t > 0 && !slide) { const soon = G.notes.find(n => n.hit === null && n.lane === lane && n.t - t < 0.9); if (!soon) { G.fx.push({ wrongLane: lane, t: performance.now() }); P.note(40, 0, 0.15, 0.15); loseLife(); } }
      return;
    }
    const kind = C.judge(best.t - t) || (G.tiles || coarse() ? 'good' : null); best.hit = kind || 'miss'; best.at = t; hitScore(kind);
    if (kind && best.gold) { G.gold++; G.st.score += 150; G.msg = { t: performance.now(), txt: '💎 +1 Goldkachel!' }; }
    const v = P.note(best.p, 0, best.d, (kind === 'perfect' ? 0.85 : 0.7) * (best.twin ? 0.75 : 1)); burst(best, kind); netSend({ ty: 'hit', p: best.p, d: best.d, k: kind });
    if (kind && isLong(best) && (G.held[lane] || slide)) { endHold(lane); G.hold[lane] = { n: best, v, ptr: e && e.pointerId }; best.holding = true; }
  }
  function gameKey(e, down) {
    if (G.keys) return keysKey(e, down);
    if (e.repeat) return true;
    const keys = KEYS[G.L.lanes]; let lane = keys.indexOf(e.code);
    if (lane < 0 && (e.code === 'Enter' || e.code === 'NumpadEnter')) lane = Math.floor(G.L.lanes / 2);
    if (lane < 0) { const a = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 }[e.code]; if (a != null) lane = Math.round(a / 3 * (G.L.lanes - 1)); }
    if (lane < 0) { if (G.L.any && down && /^(Key|Digit|Space)/.test(e.code)) { laneHit(0); return true; } return false; }
    if (down) { G.held[lane] = true; if (!Object.keys(G.hold).some(l => slideTo(+l, lane))) laneHit(lane, e); } else { G.held[lane] = false; endHold(lane); }
    return true;
  }
  // Finger/Maus je Zeiger verfolgen: Halten (lange Kacheln) und Wischen über die Bahnen
  const PLN = {};
  const laneOf = e => { const r = cv.getBoundingClientRect(); return Math.max(0, Math.min(G.L.lanes - 1, Math.floor((e.clientX - r.left) / r.width * G.L.lanes))); };
  const heldBy = lane => Object.values(PLN).includes(lane);
  function ptrUp(e) { const l = PLN[e.pointerId]; if (l == null) return; delete PLN[e.pointerId]; if (!heldBy(l)) { G.held[l] = false; endHold(l); } }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); if (!G.run) return; if (G.keys) return kbDown(e); const lane = laneOf(e); PLN[e.pointerId] = lane; G.held[lane] = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } laneHit(lane, e); });
  cv.addEventListener('pointerup', e => { if (G.keys) return kbUp(e); ptrUp(e); });
  cv.addEventListener('pointercancel', e => { if (G.keys) return kbUp(e); ptrUp(e); });
  cv.addEventListener('pointermove', e => { if (G.keys) return kbMove(e); const o = PLN[e.pointerId]; if (o == null || !G.run) return; const l = laneOf(e); if (l === o) return;
    PLN[e.pointerId] = l; const sl = slideTo(o, l); if (!heldBy(o)) { G.held[o] = false; endHold(o); } G.held[l] = true; if (!sl) laneHit(l, e, true); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  const WORD = { perfect: ['PERFEKT', '#fff'], good: ['GUT', '#fff3b0'] };
  // Treffer-Effekt aus dem Shop: Funken, Sterne, Herzen, Noten, Schnee oder Feuerwerk
  function sparks(x, y, kind, col) { const F = KM.SHOP.fx[KM.data.use.fx] || KM.SHOP.fx.funken, n = (kind === 'perfect' ? 12 : 7) * (F.big ? 2 : 1) / (F.g ? 2 : 1);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 150) * (F.big ? 1.6 : 1); G.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, c: F.big ? COLORS[i % 6] : col, g: F.g, t: performance.now() }); } }
  function burst(n, kind) { const lw = W / G.L.lanes, y = H * (G.tiles ? 0.8 : 0.84); sparks((n.lane + 0.5) * lw, y, kind, G.tiles ? '#dff' : COLORS[n.lane]);
    G.word = { k: kind || 'miss', t: performance.now() }; }
  // Hintergrund: Farbverlauf Pink–Lila–Blau mit Lichtkreisen (Bokeh), einmal vorgezeichnet
  let bg = null, bgKey = '';
  function background() {
    const bgc = KM.SHOP.bg[KM.data.use.bg] || KM.SHOP.bg.bonbon, k = W + 'x' + H + (G.tiles ? 't' : 'l') + KM.data.use.bg; if (bgKey === k) return bg; bgKey = k;
    bg = document.createElement('canvas'); bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr); const g = bg.getContext('2d'); g.scale(dpr, dpr);
    const lg = g.createLinearGradient(0, 0, W, H); if (G.tiles) { lg.addColorStop(0, bgc.c[0]); lg.addColorStop(0.45, bgc.c[1]); lg.addColorStop(1, bgc.c[2]); } else { lg.addColorStop(0, '#2a0f5e'); lg.addColorStop(0.6, '#5b1f9e'); lg.addColorStop(1, '#c2368f'); }
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = (i * 137.5) % W, y = (i * 89.3) % H, r = 14 + (i * 7) % 46, rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(255,255,255,.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    return bg;
  }
  function draw(t) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(background(), 0, 0); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Hintergrund pulsiert im Takt, ab Combo 50 golden, ab 100 heller
    if (t > 0) { const bp = 60 / (G.ch.bpm || 100), ph = (t % bp) / bp, a = Math.pow(1 - ph, 3) * (0.08 + Math.min(0.1, G.st.combo / 800)); cx.fillStyle = G.st.combo >= 50 ? 'rgba(255,215,90,' + (a + 0.04) + ')' : 'rgba(255,255,255,' + a + ')'; cx.fillRect(0, 0, W, H); }
    if (G.tiles) drawTiles(t); else drawLights(t);
    const pn = performance.now();
    for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i], a = (pn - f.t) / 520; if (a >= 1) { G.fx.splice(i, 1); continue; }
      if (f.wrongLane != null) { const lw = W / G.L.lanes; cx.fillStyle = 'rgba(255,40,70,' + (0.55 * (1 - a)) + ')'; cx.fillRect(f.wrongLane * lw, 0, lw, H); continue; }
      const s = a * 0.52; cx.globalAlpha = 1 - a; cx.fillStyle = f.c; if (f.g) { cx.font = '700 18px system-ui'; cx.textAlign = 'center'; cx.fillText(f.g, f.x + f.vx * s, f.y + f.vy * s + 200 * s * s); } else { cx.beginPath(); cx.arc(f.x + f.vx * s, f.y + f.vy * s + 200 * s * s, 3.5, 0, 7); cx.fill(); } cx.globalAlpha = 1; }
    if (G.word) { const a = (pn - G.word.t) / 600; if (a < 1 && G.word.k !== 'miss') { const [w, c] = WORD[G.word.k]; cx.globalAlpha = 1 - a * a; cx.fillStyle = c; cx.font = '800 ' + Math.round(26 + 8 * (1 - a)) + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(80,0,120,.6)'; cx.shadowBlur = 12; cx.fillText(w, W / 2, H * 0.22); cx.shadowBlur = 0; cx.globalAlpha = 1; } }
    if (G.msg) { const a = (pn - G.msg.t) / 1800; if (a < 1) { cx.globalAlpha = 1 - a; cx.fillStyle = '#fff'; cx.font = '700 24px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(G.msg.txt, W / 2, H * 0.32); cx.globalAlpha = 1; } }
    if (G.wrong && pn - G.wrong < 300) { cx.strokeStyle = 'rgba(255,40,70,' + (1 - (pn - G.wrong) / 300) + ')'; cx.lineWidth = 10; cx.strokeRect(5, 5, W - 10, H - 10); }
    if (t < 0) { const n = Math.ceil(-t / (60 / (G.ch.bpm || 100))); if (n <= 4) { cx.fillStyle = '#fff'; cx.font = '800 72px Fredoka,system-ui'; cx.textAlign = 'center'; cx.shadowColor = 'rgba(80,0,120,.6)'; cx.shadowBlur = 16; cx.fillText(n, W / 2, H * 0.45); cx.shadowBlur = 0; } }
    $('gScore').textContent = G.st.score.toLocaleString('de-DE'); $('gCombo').textContent = G.st.combo > 4 ? '×' + G.st.combo : '';
    $('gProg').style.width = Math.max(0, Math.min(1, t / G.len)) * 100 + '%';
    const stp = G.st.perfect + G.st.good + G.st.miss ? C.stars(G.st) : 0; $('gStars').innerHTML = [1, 2, 3].map(i => `<i class="${stp >= i ? 'on' : ''}">★</i>`).join('');
    $('gLives').innerHTML = G.M.lives ? '❤'.repeat(Math.max(0, G.lives)) + '<em>' + '❤'.repeat(Math.max(0, G.M.lives - G.lives)) + '</em>' + (G.shield ? ' 🛡️' : '') : '';
    $('gRound').textContent = G.M.loop ? 'Runde ' + G.round : '';
  }
  // Kacheln (Piano-Tiles-Art): schwarz-blaue Kacheln, lange Töne als lange Kachel mit Linie und Kreis, kurze mit Raute
  const chaosF = t => G.mods && G.mods.chaos ? 1 + 0.32 * Math.sin(t * 1.7) : 1;
  const heldNote = n => Object.values(G.hold).some(h => h.n === n);
  function drawTiles(t) {
    const N = G.L.lanes, lw = W / N, hy = H * 0.8, speed = hy / G.L.fall * chaosF(t), pn = performance.now(), D = G.design || KM.SHOP.design.klassik;
    cx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 1; i < N; i++) cx.fillRect(Math.round(i * lw), 0, 1, H);
    cx.fillStyle = 'rgba(255,255,255,.75)'; cx.fillRect(0, hy - 1, W, 2);
    for (let i = 0; i < N; i++) { const fl = G.flash[i] ? Math.max(0, 1 - (pn - G.flash[i]) / 220) : 0; if (fl > 0 || G.held[i]) { cx.fillStyle = 'rgba(255,255,255,' + (Math.max(fl, G.held[i] ? 0.4 : 0) * 0.35) + ')'; cx.fillRect(i * lw, 0, lw, H); } }
    for (const n of G.notes) {
      const dt = n.t - t; if (dt > G.L.fall / chaosF(t) + 0.3) break;
      const bottom = hy - dt * speed + 18, h = Math.max(H * 0.17, n.d * speed), top = bottom - h, x = n.lane * lw + 1, w = lw - 2;
      if (top > H) continue;
      // Blind: Kacheln verschwinden im unteren Drittel
      const al = G.mods.blind && n.hit === null ? Math.max(0, Math.min(1, (H * 0.6 - bottom) / (H * 0.16))) : 1; if (al <= 0) continue; cx.globalAlpha = al;
      if (n.hit && n.hit !== 'miss') {
        if (heldNote(n)) {   // wird gehalten: Rest dunkel, gehaltener Teil leuchtet bis zur Linie (Wischkachel: obere Hälfte in der Zielbahn)
          const mid = n.slide != null ? bottom - h / 2 : -1e9, xa = n.slide != null && hy < mid ? n.slide * lw + 1 : x;
          const cut = Math.max(top, hy); if (cut > top) { if (n.slide != null) drawSlide(n, top, bottom, D, x, w, lw); else { cx.fillStyle = D.base; cx.fillRect(x, top, w, cut - top); } }
          const lg = Math.min(bottom, H) - cut; if (lg > 0) { cx.fillStyle = 'rgba(140,235,255,.85)'; cx.fillRect(n.slide != null && cut < mid ? n.slide * lw + 1 : x, cut, w, lg); }
          cx.fillStyle = '#fff'; cx.fillRect(xa, hy - 3, w, 6); cx.globalAlpha = 1; continue;
        }
        const a = Math.max(0, 1 - (t - n.at) / 0.35); if (a > 0) { cx.fillStyle = n.gold ? 'rgba(255,220,90,' + (0.7 * a) + ')' : 'rgba(200,245,255,' + (0.5 * a) + ')'; cx.fillRect(x, top, w, h); } cx.globalAlpha = 1; continue; }
      if (n.slide != null && n.hit === null) { drawSlide(n, top, bottom, D, x, w, lw); cx.globalAlpha = 1; continue; }
      // ohne Farbverlauf je Bild (spart Rechenzeit auf dem Handy): dunkle Kachel mit hellem Kopf
      const base = n.hit === 'miss' ? '#c21d4a' : n.gold ? '#7a4a00' : D.base, head = n.gold ? '#ffd23d' : D.rainbow ? COLORS[n.lane % 6] : D.head, mid = n.gold ? '#c88a00' : D.mid;
      if (n.hit === 'miss') { cx.fillStyle = base; cx.fillRect(x, top, w, h); } else { cx.fillStyle = base; cx.fillRect(x, top, w, h); cx.fillStyle = head; cx.fillRect(x, top, w, Math.min(h * 0.3, 40)); cx.fillStyle = mid; cx.fillRect(x, top + Math.min(h * 0.3, 40), w, Math.min(h * 0.25, 30)); }
      if ((D.sparkle || n.gold) && n.hit === null) { cx.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 4; k++) { const sx = x + ((k * 37 + n.lane * 13) % 100) / 100 * w, sy = top + ((k * 53 + 17) % 100) / 100 * h, r = 1 + ((pn / 160 + k) % 3) * 0.6; cx.fillRect(sx, sy, r, r); } }
      const cxm = x + w / 2;
      if (n.d * speed > H * 0.2) { cx.strokeStyle = D.mark; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(cxm, top + 14); cx.lineTo(cxm, bottom - 32); cx.stroke(); cx.beginPath(); cx.arc(cxm, bottom - 22, 9, 0, 7); cx.stroke(); }
      else { cx.save(); cx.translate(cxm, bottom - 26); cx.rotate(Math.PI / 4); cx.strokeStyle = n.gold ? '#fff' : D.mark; cx.lineWidth = 2; cx.strokeRect(-7, -7, 14, 14); cx.restore(); if (n.gold) { cx.fillStyle = '#fff'; cx.font = '700 14px system-ui'; cx.textAlign = 'center'; cx.fillText('💎', cxm, top + 22); } }
      if (n.twin && n.hit === null) { cx.fillStyle = D.mark; cx.fillRect(x, bottom - 4, w, 4); }
      cx.globalAlpha = 1;
    }
    if (!coarse() && SET.labels && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.8)'; cx.font = '600 15px Fredoka,system-ui'; cx.textAlign = 'center'; for (let i = 0; i < N; i++) cx.fillText(LABEL(KEYS[N][i]), (i + 0.5) * lw, H - 16); }
  }
  // Wischkachel: untere Hälfte in der Startbahn, obere Hälfte in der Nachbarbahn, schräger Übergang mit Pfeil
  function drawSlide(n, top, bottom, D, x, w, lw) {
    const mid = (top + bottom) / 2, x2 = n.slide * lw + 1, sk = Math.min(60, (bottom - top) * 0.2);
    cx.fillStyle = n.hit === 'miss' ? '#c21d4a' : D.base;
    cx.beginPath(); cx.moveTo(x, bottom); cx.lineTo(x + w, bottom); cx.lineTo(x + w, mid + sk / 2); cx.lineTo(x2 + w, mid - sk / 2); cx.lineTo(x2 + w, top); cx.lineTo(x2, top); cx.lineTo(x2, mid - sk / 2); cx.lineTo(x, mid + sk / 2); cx.closePath(); cx.fill();
    cx.fillStyle = D.head; cx.fillRect(x2, top, w, Math.min(30, (bottom - top) * 0.15));
    cx.strokeStyle = D.mark; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(x + w / 2, bottom - 24); cx.lineTo(x + w / 2, mid + sk / 2); cx.lineTo(x2 + w / 2, mid - sk / 2); cx.lineTo(x2 + w / 2, top + 16); cx.stroke();
    cx.beginPath(); cx.arc(x + w / 2, bottom - 22, 9, 0, 7); cx.stroke();
    const ax = x2 + w / 2, ay = mid - sk / 2 - 8, dir = n.slide > n.lane ? 1 : -1; cx.fillStyle = D.mark; cx.beginPath(); cx.moveTo(ax + dir * 10, ay); cx.lineTo(ax - dir * 6, ay - 8); cx.lineTo(ax - dir * 6, ay + 8); cx.fill();
  }
  // Lichter (Magic-Piano-Art)
  function drawLights(t) {
    const N = G.L.lanes, lw = W / N, hy = H * 0.84, fall = G.L.fall, pn = performance.now();
    for (let i = 0; i < N; i++) { cx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; cx.fillRect(i * lw, 0, lw, H);
      const fl = G.flash[i] ? Math.max(0, 1 - (pn - G.flash[i]) / 250) : 0; if (fl > 0 || G.held[i]) { const lg = cx.createLinearGradient(0, hy - 260, 0, hy); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, COLORS[i] + '66'); cx.globalAlpha = Math.max(fl, G.held[i] ? 0.5 : 0); cx.fillStyle = lg; cx.fillRect(i * lw, hy - 260, lw, 260); cx.globalAlpha = 1; } }
    for (let i = 0; i < N; i++) { const x = i * lw; cx.fillStyle = G.held[i] ? COLORS[i] : 'rgba(255,255,255,.12)'; cx.beginPath(); cx.roundRect(x + 6, hy - 4, lw - 12, H - hy - 8, 14); cx.fill();
      cx.strokeStyle = COLORS[i]; cx.lineWidth = 3; cx.beginPath(); cx.arc(x + lw / 2, hy, Math.min(34, lw * 0.32), 0, 7); cx.stroke();
      if (SET.labels && !coarse() && !G.auto && !G.L.any) { cx.fillStyle = 'rgba(255,255,255,.7)'; cx.font = '600 15px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(LABEL(KEYS[N][i]), x + lw / 2, hy + Math.min(56, (H - hy) / 2 + 6)); } }
    if (G.L.any && !G.auto) { cx.fillStyle = 'rgba(255,255,255,.6)'; cx.font = '600 14px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText('Irgendwo tippen – im Takt der Lichter', W / 2, H - 14); }
    const r = Math.min(30, lw * 0.3);
    for (const n of G.notes) {
      const dt = n.t - t; if (dt > fall + 0.2) break; if (n.hit && n.hit !== 'miss' && t - n.at > 0.12) continue; if (n.hit === 'miss' && dt < -0.5) continue;
      const x = (n.lane + 0.5) * lw, y = hy - dt / fall * hy, tail = Math.min(hy, n.d / fall * hy);
      if (n.d > 0.35 && n.hit === null) { cx.strokeStyle = COLORS[n.lane] + '55'; cx.lineWidth = r * 0.5; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x, y - tail); cx.stroke(); }
      cx.globalAlpha = n.hit === 'miss' ? 0.25 : 1; const rg = cx.createRadialGradient(x, y, 2, x, y, r * 1.6); rg.addColorStop(0, '#fff'); rg.addColorStop(0.35, COLORS[n.lane]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = rg; cx.beginPath(); cx.arc(x, y, r * 1.6, 0, 7); cx.fill(); cx.globalAlpha = 1;
    }
  }
  function pause() { if (!G.run || G.paused) return; if (G.free) G.paused = true; else pauseClock();
    if (G.free) return overlay(`<h2>⏸️ Pause</h2><p class="dim">🎼 Freies Klavier</p><div class="col"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter spielen</button><button class="btn nav" data-act="learn">🎓 Klavier lernen</button><button class="btn nav" data-act="menu">☰ Hauptmenü</button></div>`,
      { esc: resume, go: resume, learn: () => { closeOv(); stopGame(); go('lernen'); }, menu: () => { closeOv(); menu(); } });
    overlay(`<h2>⏸️ Pause</h2><p class="dim">${esc(G.chart.title)}</p><p class="copy small">© ${esc(G.chart.lic || '')}</p><div class="col"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter</button><button class="btn nav" data-act="again">🔄 Neu starten</button><button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn nav" data-act="menu">☰ Hauptmenü</button></div>`,
      { esc: resume, go: resume, again: () => { closeOv(); stopGame(); start(G.chart, G.level); }, lib: () => { closeOv(); stopGame(); lib(); }, menu: () => { closeOv(); menu(); } }); }
  function resume() { closeOv(); if (G.free) G.paused = false; else resumeClock(); }
  $('bPause').onclick = pause;
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.run && !G.paused) pause(); });
  // Meldungen aus Aufgaben/Erfolgen als Zeilen fürs Ergebnis
  const newsHtml = l => l.length ? '<div class="news">' + l.map(x => `<p>${x.icon} ${x.type === 'ach' ? 'Erfolg: ' : 'Aufgabe geschafft: '}<b>${esc(x.title)}</b>${x.gems ? ' · +' + x.gems + ' 💎' : ''}</p>`).join('') + '</div>' : '';
  function syncBoardFields() { const md = KM.data; md.stars = starsTotal(); md.crowns = crownsTotal(); KM.save(); }
  function finish() {
    G.run = false; cancelAnimationFrame(raf); setTimeout(() => P.stopAll(), 600);
    if (G.battle || G.duet) return netFinish();
    if (G.keys && G.lessonId) return lessonDone();
    if (G.preview) { G.preview = false; P.stopAll(); return unlockView(song); }
    const s = G.st, acc = Math.round(C.accuracy(s) * 100), lost = G.over && !G.M.loop && G.round === 1, st = lost ? 0 : C.stars(G.st1 || s), flaw = !lost && !G.auto && s.miss === 0 && s.good === 0 && s.perfect > 0, cr = G.crowns || 0;
    if (G.M.tour && TOUR) return tourNext(s.score, lost);
    let rec = false, news = [], gems = 0;
    if (!G.auto && song && !G.practiceSlice) {
      const k = bkey(song, G.level), b = BEST[k];
      if (!b || s.score > b.score) { rec = !!b && s.score > 0; BEST[k] = { score: s.score, stars: Math.max(st, b ? b.stars : 0), crown: flaw || !!(b && b.crown), crowns: Math.max(cr, b && b.crowns || 0) }; }
      else { b.stars = Math.max(b.stars, st); b.crown = b.crown || flaw; b.crowns = Math.max(b.crowns || 0, cr); }
      LS.set('best2', BEST); LS.set('highscore', total());
      gems = KM.addGems(st * 2 + cr * 5 + G.gold + (flaw ? 5 : 0));
      if (G.gold) news = news.concat(KM.report('gold', { n: G.gold }));
      news = news.concat(KM.report('song', { mode, level: G.level, stars: st, crowns: cr, perfect: s.perfect, combo: s.max, lost, flawless: flaw, round: G.round, key: skey(song), blind: G.mods && G.mods.blind, midi: !!song.own && /MIDI/.test(song.artist) }));
      syncBoardFields();
    }
    const head = G.auto ? '🎧' : lost ? '💔' : (flaw ? '💯' : '') + '👑'.repeat(cr) + '★'.repeat(st) + '<em>' + '★'.repeat(3 - st) + '</em>';
    const missBars = G.keys && G.learn ? weakSpots() : null;
    overlay(`<div class="res"><div class="stars">${head}</div><h2>${lost ? 'Leider daneben!' : esc(G.chart.title)}</h2><p class="dim">${esc(G.chart.title)} · ${esc(G.M.n)}${G.auto ? '' : ' · ' + C.LEVELS[G.level].n}${G.M.loop || G.M.crowns && G.round > 1 ? ' · Runde ' + G.round : ''}</p>
      ${G.auto ? '<p>Das war die Klavierfassung zum Zuhören. Jetzt selbst spielen?</p>' : `<div class="stats"><span><b>${s.score.toLocaleString('de-DE')}</b>Punkte</span><span><b>${acc} %</b>Genauigkeit</span><span><b>${s.max}</b>beste Combo</span></div>
      <p class="dim">Perfekt ${s.perfect} · Gut ${s.good} · Daneben ${s.miss}${G.gold ? ' · 💎 Goldkacheln ' + G.gold : ''}${G.mult > 1 ? ' · Herausforderungen ×' + G.mult.toFixed(2).replace('.', ',') : ''}</p>${cr ? `<p class="rec">${'👑'.repeat(cr)} ${cr} ${cr > 1 ? 'Kronen' : 'Krone'} im schnelleren Tempo!</p>` : ''}${rec ? '<p class="rec">🏆 Neuer Rekord!</p>' : ''}${flaw ? '<p class="rec">💯 Fehlerfrei!</p>' : ''}${gems ? `<p class="gems">+${gems} 💎</p>` : ''}${newsHtml(news)}`}
      <p class="copy small">© ${esc(G.chart.lic || '')}<br>${esc(G.chart.src || '')}</p>
      <div class="row center">${missBars ? '<button class="btn nav" data-act="weak">🔁 Fehlerstellen üben</button>' : ''}<button class="btn nav" data-act="lib">🎹 Liederbuch</button><button class="btn gold nav" data-act="again" data-focus>${G.auto ? '🎹 Selbst spielen' : '🔄 Nochmal'}</button></div></div>`,
      { esc: () => { closeOv(); lib(); }, lib: () => { closeOv(); lib(); }, weak: () => { closeOv(); practiceWeak(missBars); }, again: () => { closeOv(); if (G.auto) { mode = 'klassisch'; songScreen(); } else start(G.chart, G.level); } });
  }

  /* STUBS-ETAPPE */
  /* ---------- 🌐 Online: Battle und Duett mit zwei Geräten (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  const ONLINE_CARD = { ic: '🌐', n: 'Online & Duett', d: 'Battle oder Duett mit einem zweiten Gerät – Mitspieler treten per Link, Code oder QR von überall bei.' };
  const NET = { net: null, role: '', kind: '', off: 0, opp: null, oppEnd: null, partner: 0, ready: null };
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'klavierlicht-', N = { peer: null, conn: null, code: '' }, libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(sc); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = x => Array.from(String(x || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    // Einladungslink immer über die easygames-Homepage (Mehrspieler-Regel 1)
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const reg = (c, onOpen) => { c.on('open', () => { N.conn = c; if (onOpen) onOpen(); cb.open(); }); c.on('data', d => { if (d && typeof d === 'object') cb.msg(d); }); const gone = () => { if (N.conn === c) { N.conn = null; cb.leave(); } }; c.on('close', gone); c.on('error', gone); };
    N.host = async () => {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) { let code = ''; for (let i = 0; i < 4; i++) code += ALPHA[(Math.random() * ALPHA.length) | 0];
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false; p.on('open', () => { done = true; N.peer = p; N.code = code; res(true); }); p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { /* egal */ } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker'); }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => { if (N.conn && N.conn.open) { c.on('open', () => { try { c.send({ ty: 'full' }); c.close(); } catch (x) { /* egal */ } }); return; } reg(c); });
      N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { /* egal */ } }); return N.code;
    };
    N.join = async code => {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { /* egal */ } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker')); p.on('open', () => { N.peer = p; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (!done) { done = true; res(); } }); }); });
    };
    N.send = d => { if (N.conn && N.conn.open) try { N.conn.send(d); } catch (e) { /* egal */ } };
    N.close = () => { if (N.conn) try { N.conn.close(); } catch (e) { /* egal */ } N.conn = null; if (N.peer) try { N.peer.destroy(); } catch (e) { /* egal */ } N.peer = null; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Code gibt es nicht (mehr) – bitte nochmal prüfen.', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  const isOn = () => !!(NET.net && NET.net.conn && NET.net.conn.open);
  function netSend(d) { if ((G.battle || G.duet) && isOn()) NET.net.send(d); }
  function online() {
    overlay(`<h2>🌐 Online & Duett</h2><p>Spiel mit einem zweiten Gerät zusammen – Handy, Tablet oder PC, egal wo. <b>Mitspieler treten per Link, Code oder QR von überall bei.</b></p>
      <div class="col"><button class="btn gold nav" data-act="battle" data-focus>⚔️ Battle eröffnen – wer holt mehr Punkte?</button><button class="btn gold nav" data-act="duett">🤝 Duett eröffnen – Melodie und Bass zu zweit</button></div>
      <p class="dim">Schon einen Code bekommen?</p><div class="row"><input class="field nav" id="joinCode" maxlength="4" placeholder="Code" autocomplete="off" style="max-width:140px;text-transform:uppercase"><button class="btn nav" data-act="join">🔑 Beitreten</button></div>
      <div class="row end"><button class="btn nav" data-act="esc">Zurück</button></div>`,
      { battle: () => netHost('battle'), duett: () => netHost('duett'), join: () => netJoin($('joinCode').value) });
  }
  function lobby(html, binds) { overlay(`<h2>${NET.kind === 'duett' ? '🤝 Duett' : '⚔️ Battle'}</h2>${html}<div class="row end"><button class="btn nav" data-act="leave">Verlassen</button></div>`, Object.assign({ esc: netLeave, leave: netLeave }, binds || {})); }
  function netLeave() { if (NET.net) NET.net.close(); NET.net = null; NET.role = ''; G.battle = G.duet = false; closeOv(); menu(); }
  async function netHost(kind) {
    NET.kind = kind; NET.role = 'host'; if (NET.net) NET.net.close(); NET.net = mkNet({ msg: netMsg, open: netOpen, leave: netGone });
    lobby('<p>Raum wird eröffnet …</p>');
    try {
      const code = await NET.net.host(), link = NET.net.link();
      lobby(`<p>Mitspieler treten per Link, Code oder QR von überall bei:</p><div class="netBox"><div class="qr" id="qr">…</div><div><p class="dim">Code</p><p class="code">${code}</p><p class="dim small link">${esc(link)}</p><button class="btn sm nav" data-act="copy">🔗 Link kopieren</button></div></div><p id="netSt">⏳ Warte auf Mitspieler …</p>`,
        { copy: async () => { try { if (navigator.share && coarse()) await navigator.share({ title: 'Klavierlicht – spiel mit mir!', url: link }); else { await navigator.clipboard.writeText(link); toast('🔗 Link kopiert'); } } catch (e) { prompt('Link:', link); } } });
      NET.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(link); q.make(); const el = $('qr'); if (el) el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { const el = $('qr'); if (el) el.textContent = code; });
    } catch (e) { lobby(`<p>${netErr(e)}</p>`); }
  }
  async function netJoin(code) {
    NET.role = 'guest'; NET.kind = ''; if (NET.net) NET.net.close(); NET.net = mkNet({ msg: netMsg, open: netOpen, leave: netGone });
    overlay('<h2>🌐 Verbinde …</h2><p>Einen Moment.</p><div class="row end"><button class="btn nav" data-act="esc">Abbrechen</button></div>', { esc: netLeave });
    try { await NET.net.join(code); } catch (e) { overlay(`<h2>🌐 Beitreten</h2><p>${netErr(e)}</p><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>OK</button></div>`, { esc: () => { closeOv(); online(); } }); }
  }
  function netOpen() {
    // Uhren abgleichen (Gast fragt 5× nach der Zeit des Gastgebers, kürzeste Antwort zählt)
    if (NET.role === 'host') { NET.net.send({ ty: 'hello', kind: NET.kind }); hostPick(); }
    else { NET.best = 1e9; for (let i = 0; i < 5; i++) setTimeout(() => NET.net.send({ ty: 'ping', a: performance.now() }), i * 120); }
  }
  function hostPick() { lobby(`<p class="rec">✅ Verbunden!</p><p>${NET.kind === 'duett' ? 'Du spielst die <b>Melodie</b>, dein Mitspieler den <b>Bass</b>.' : 'Ihr spielt dasselbe Lied gleichzeitig – wer mehr Punkte holt, gewinnt.'} Wähle jetzt ein Lied.</p><div class="row end"><button class="btn gold nav" data-act="pick" data-focus>🎹 Lied auswählen</button></div>`, { pick: () => { closeOv(); mode = NET.kind; lib(); } }); }
  function netGone() { if (!NET.net) return; toast('🌐 Die Verbindung zum Mitspieler ist getrennt.', 3500); if (G.run && (G.battle || G.duet)) { G.battle = G.duet = false; } else if (ovOpen()) netLeave(); }
  function songRef(s) { return s.own ? { own: s.chart } : { id: s.id, b: !!s.builtin }; }
  async function songFromRef(r) {
    if (r.own) return { song: { id: r.own.id, title: r.own.title, artist: r.own.artist, lic: r.own.lic, own: true, chart: r.own }, chart: r.own };
    if (r.b) { const s = allSongs().find(x => x.builtin && x.id === r.id); return { song: s, chart: C.fromNotation(s.notation) }; }
    await loadArchive(false); const s = (archive || []).find(x => x.id === r.id); const c = await (await fetch(archBase + encodeURIComponent(r.id) + '.json')).json(); return { song: Object.assign({ online: true }, s), chart: c };
  }
  // Gastgeber hat Lied und Stufe gewählt → beide laden, dann gemeinsamer Start (Zeit des Gastgebers)
  function netStartSong(s, level) {
    NET.ready = { s, level }; NET.oppEnd = null; NET.opp = null; NET.net.send({ ty: 'song', ref: songRef(s), level, kind: NET.kind });
    lobby(`<p>🎹 ${esc(s.title)}</p><p id="netSt">⏳ Mitspieler lädt das Lied …</p>`);
  }
  async function netMsg(d) {
    const nowP = performance.now();
    if (d.ty === 'full') { toast('Dieser Raum ist schon voll.'); return netLeave(); }
    if (d.ty === 'ping') return NET.net.send({ ty: 'pong', a: d.a, b: performance.now() });
    if (d.ty === 'pong') { const rtt = nowP - d.a; if (rtt < NET.best) { NET.best = rtt; NET.off = d.b + rtt / 2 - nowP; } return; }
    if (d.ty === 'hello') { NET.kind = d.kind; return lobby(`<p class="rec">✅ Verbunden!</p><p>${d.kind === 'duett' ? 'Du spielst den <b>Bass</b>, dein Mitspieler die <b>Melodie</b>.' : 'Ihr spielt dasselbe Lied gleichzeitig – wer mehr Punkte holt, gewinnt.'}</p><p id="netSt">⏳ Der Gastgeber wählt ein Lied …</p>`); }
    if (d.ty === 'song') { NET.kind = d.kind; try { const r = await songFromRef(d.ref); NET.ready = { s: r.song, chart: r.chart, level: d.level }; NET.net.send({ ty: 'ready' }); lobby(`<p>🎹 ${esc(r.song.title)}</p><p>⏳ Gleich geht's los …</p>`); } catch (e) { toast('Lied konnte nicht geladen werden.'); NET.net.send({ ty: 'fail' }); } return; }
    if (d.ty === 'fail') { toast('Dein Mitspieler konnte das Lied nicht laden.'); return hostPick(); }
    if (d.ty === 'ready' && NET.role === 'host') { const at = performance.now() + 2600; NET.net.send({ ty: 'go', at }); return netGo(at); }
    if (d.ty === 'go') return netGo(d.at - NET.off);
    if (d.ty === 'sc') { NET.opp = d; return; }
    if (d.ty === 'hit' && G.duet && G.run) { P.note(d.p, 0, d.d, 0.75); NET.partnerHits = (NET.partnerHits || 0) + 1; return; }
    if (d.ty === 'end') { NET.oppEnd = d; if (!G.run && NET.waitEnd) netResult(); return; }
    if (d.ty === 'next') { closeOv(); return lobby('<p id="netSt">⏳ Der Gastgeber wählt das nächste Lied …</p>'); }
  }
  async function netGo(atLocal) {
    closeOv(); const r = NET.ready; mode = NET.kind; song = r.s;
    const chart = r.chart || (r.s.own ? r.s.chart : r.s.builtin ? C.fromNotation(r.s.notation) : await (await fetch(archBase + encodeURIComponent(r.s.id) + '.json')).json());
    NET.delay = Math.max(0.5, (atLocal - performance.now()) / 1000); start(chart, r.level); NET.delay = null;
  }
  function netTick(t) { const n = performance.now(); if (n - (NET.lastSc || 0) < 300) return; NET.lastSc = n; netSend({ ty: 'sc', s: G.st.score, c: G.st.combo, pr: Math.max(0, Math.min(1, t / G.len)) }); const o = NET.opp; $('gOpp').textContent = o ? (G.duet ? '🤝 Team ' + (G.st.score + o.s).toLocaleString('de-DE') : '⚔️ ' + o.s.toLocaleString('de-DE')) : ''; }
  function netFinish() { netSend({ ty: 'end', s: G.st.score, acc: C.accuracy(G.st), max: G.st.max }); NET.waitEnd = true; if (NET.oppEnd || !isOn()) return netResult(); overlay('<h2>⏳ Warte auf deinen Mitspieler …</h2>', { esc: () => {} }); setTimeout(() => { if (NET.waitEnd) netResult(); }, 8000); }
  function netResult() {
    NET.waitEnd = false; const me = G.st.score, o = NET.oppEnd, os = o ? o.s : null, duet = mode === 'duett', win = !duet && os != null && me > os;
    const news = KM.report('song', { mode, level: G.level, stars: C.stars(G.st), perfect: G.st.perfect, combo: G.st.max, key: song && skey(song), duet, win }); KM.addGems(duet ? 5 : win ? 8 : 3); syncBoardFields();
    const head = duet ? '🤝' : os == null ? '🎹' : win ? '🏆' : me === os ? '🤝' : '🥈';
    overlay(`<div class="res"><div class="stars">${head}</div><h2>${duet ? 'Duett gespielt!' : os == null ? 'Lied fertig' : win ? 'Gewonnen!' : me === os ? 'Unentschieden!' : 'Knapp verloren!'}</h2><p class="dim">${esc(G.chart.title)} · ${C.LEVELS[G.level].n}</p>
      <div class="stats"><span><b>${me.toLocaleString('de-DE')}</b>${duet ? (NET.role === 'host' ? 'Melodie' : 'Bass') : 'Du'}</span><span><b>${os == null ? '–' : os.toLocaleString('de-DE')}</b>${duet ? (NET.role === 'host' ? 'Bass' : 'Melodie') : 'Mitspieler'}</span>${duet && os != null ? `<span><b>${(me + os).toLocaleString('de-DE')}</b>Team</span>` : ''}</div>${newsHtml(news)}
      <p class="copy small">© ${esc(G.chart.lic || '')}</p><div class="row center"><button class="btn nav" data-act="leave">Verlassen</button>${NET.role === 'host' && isOn() ? '<button class="btn gold nav" data-act="next" data-focus>🎹 Nächstes Lied</button>' : ''}</div></div>`,
      { esc: () => {}, leave: netLeave, next: () => { closeOv(); NET.net.send({ ty: 'next' }); mode = NET.kind; lib(); } });
  }
  // Einladungslink ?join=CODE
  let pendingJoin = null; try { const m = /[?&]join=([A-Za-z0-9]{4})/.exec(location.search); if (m) pendingJoin = m[1]; } catch (e) { /* egal */ }
  // Fehlerstellen: zwei Takte mit den meisten Fehlern (verpasst zählt doppelt) → dreimal hintereinander, langsamer
  function weakSpots() {
    if (!G.learn || G.lessonId || G.practiceSlice) return null;
    const st = G.ch.step / 1000, off = (G.ch.off || 0) / 1000, cnt = {};
    for (const n of G.notes) if (n.hit === 'miss' || n.hit === 'good') { const b = Math.floor(Math.round((n.t - off) / st) / 32); cnt[b] = (cnt[b] || 0) + (n.hit === 'miss' ? 2 : 1); }
    let best = null, bv = 0; for (const b in cnt) if (cnt[b] > bv) { bv = cnt[b]; best = +b; }
    return best === null || bv < 2 ? null : { from: best * 32, to: best * 32 + 32 };
  }
  function practiceWeak(r) { const c = C.slice(G.chart, r.from, r.to, 3); c.title = G.chart.title + ' – Takt ' + (r.from / 16 + 1) + '–' + (r.to / 16) + ' (3×)'; startKeys(c, G.level, { rate: Math.min(SET.rate, 0.75), slice: true }); }
  /* ---------- Lernpfad ---------- */
  const lessonOpen = i => i === 0 || (KM.data.lessons[KLLessons.LESSONS[i - 1].id] || 0) >= 2;
  function renderPath() {
    const md = KM.data, L = KLLessons.LESSONS;
    $('libCount').textContent = Object.values(md.lessons).filter(v => v >= 2).length + '/' + L.length + ' Lektionen';
    $('libList').innerHTML = '<p class="dim pathHint">Schritt für Schritt vom ersten Ton bis zu beiden Händen. Eine Lektion ist bestanden ab ★★ – dann öffnet sich die nächste.</p>' + L.map((l, i) => { const s = md.lessons[l.id] || 0, open = lessonOpen(i);
      return `<button class="card nav g-lern${open ? '' : ' locked'}" data-les="${i}"${open ? '' : ' disabled'}><span class="art"><i>${open ? i + 1 : '🔒'}</i></span><span class="tx"><b>${esc(l.t)}</b><small>${esc(l.d)}</small></span><span class="rt"><span class="st">${'★'.repeat(s)}<em>${'★'.repeat(3 - s)}</em></span><span class="play">${open ? '▶ ÜBEN' : 'GESPERRT'}</span></span></button>`; }).join('');
    $('libList').querySelectorAll('[data-les]').forEach(b => b.onclick = () => lessonIntro(+b.dataset.les));
  }
  function lessonIntro(i) {
    const L = KLLessons.LESSONS[i];
    overlay(`<h2>🎓 Lektion ${i + 1}: ${esc(L.t)}</h2><p>${esc(L.d)}</p><p class="dim">Die Taste mit der grünen <b>1</b> ist immer die nächste. ${L.lh ? 'Gestrichelte Balken mit „L“ spielt die linke Hand.' : ''}</p>
      <label class="tg nav"><input type="checkbox" id="lWait"${SET.wait || i < 3 ? ' checked' : ''}> ⏳ Warten, bis ich die richtige Taste spiele</label>
      <div class="row end"><button class="btn nav" data-act="esc">Zurück</button><button class="btn gold nav" data-act="go" data-focus>▶ Los</button></div>`,
      { go: () => { SET.wait = $('lWait').checked; saveSet(); closeOv(); mode = 'lernen'; song = { id: 'lektion-' + L.id, title: L.t, artist: 'Lernpfad', lic: 'Übung: easygames · Melodien gemeinfrei', lesson: i }; startKeys(KLLessons.chart(L), 'normal', { lesson: L.id, rate: 1 }); } });
  }
  function lessonDone() {
    const s = G.st, st = C.stars(s), L = KLLessons.LESSONS, i = L.findIndex(l => l.id === G.lessonId), ok = st >= 2, prev = KM.data.lessons[G.lessonId] || 0;
    let news = [], gems = 0;
    if (ok) { gems = prev ? 0 : KM.addGems(st * 2 + 3); news = KM.report('lesson', { id: G.lessonId, stars: st, all: L.every(l => l.id === G.lessonId || (KM.data.lessons[l.id] || 0) >= 2) }); }
    const next = ok && i + 1 < L.length ? i + 1 : -1;
    overlay(`<div class="res"><div class="stars">${'★'.repeat(st)}<em>${'★'.repeat(3 - st)}</em></div><h2>${ok ? 'Lektion bestanden!' : 'Fast geschafft – nochmal?'}</h2><p class="dim">Lektion ${i + 1}: ${esc(L[i].t)} · ${Math.round(C.accuracy(s) * 100)} % richtig</p>
      ${ok ? '' : '<p>Für die nächste Lektion brauchst du ★★ (75 % richtig). Tipp: „Warten“ einschalten.</p>'}${gems ? `<p class="gems">+${gems} 💎</p>` : ''}${newsHtml(news)}
      <div class="row center"><button class="btn nav" data-act="path">🎓 Lernpfad</button><button class="btn nav" data-act="again"${next < 0 ? ' data-focus' : ''}>🔁 Nochmal</button>${next >= 0 ? '<button class="btn gold nav" data-act="next" data-focus>▶ Nächste Lektion</button>' : ''}</div></div>`,
      { esc: () => { closeOv(); libCat = 'pfad'; lib(); }, path: () => { closeOv(); libCat = 'pfad'; lib(); }, again: () => { closeOv(); lessonIntro(i); }, next: () => { closeOv(); lessonIntro(next); } });
  }
  /* ---------- Turnier der Woche: 5 Lieder hintereinander (Klassisch, Mittel), Summe zählt ---------- */
  let TOUR = null;
  function tourList() { const all = allSongs().filter(x => !x.gems); return KM.weekSongs(all.length).map(i => all[i]); }
  function tourScreen() {
    scr('sLib'); const M = C.MODES.turnier, w = KM.weekNo(), md = KM.data, best = md.week.id === w ? md.week.best : 0, list = tourList();
    $('libTitle').innerHTML = `${M.ic} ${M.n}`; $('libTabs').innerHTML = ''; $('libCount').textContent = 'Woche ' + w;
    $('libList').innerHTML = `<div class="tourBox"><p>${M.d}</p><p>Auf <b>Mittel</b>, je Lied drei Herzen. Dein Wochen-Bestwert: <b>${best.toLocaleString('de-DE')}</b> Punkte.</p>${archive ? '' : '<p class="dim">🌐 Das Online-Archiv lädt noch – sonst spielst du eine Auswahl aus den Liedern im Spiel.</p>'}
      <ol class="tourList">${list.map(s => `<li><b>${esc(s.title)}</b> <small>${esc(s.artist)}</small></li>`).join('')}</ol>
      <div class="row"><button class="btn gold nav" id="tourGo" data-focus>▶ Turnier starten</button><button class="btn nav" id="tourRank">🏆 Wochen-Rangliste</button></div>
      <p class="dim small">In die Rangliste kommen nur angemeldete Spieler (Google), die ihre Bestwerte freigegeben haben – nur mit Spitznamen.</p></div>`;
    $('tourGo').onclick = () => { TOUR = { list, i: 0, total: 0, week: w }; mode = 'turnier'; pick(list[0], 'normal'); };
    $('tourRank').onclick = rankView;
    if (!archive) loadArchive(false).then(() => { if (cur === 'sLib' && mode === 'turnier' && !TOUR) tourScreen(); });
  }
  function tourNext(score, lost) {
    TOUR.total += score; TOUR.i++;
    const done = lost || TOUR.i >= TOUR.list.length;
    if (!done) return overlay(`<div class="res"><div class="stars">🏆 ${TOUR.i}/5</div><h2>Lied geschafft!</h2><p>Zwischenstand: <b>${TOUR.total.toLocaleString('de-DE')}</b> Punkte</p><p class="dim">Als Nächstes: ${esc(TOUR.list[TOUR.i].title)}</p><div class="row center"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter</button></div></div>`,
      { esc: () => {}, go: () => { closeOv(); pick(TOUR.list[TOUR.i], 'normal'); } });
    const md = KM.data, prev = md.week.id === TOUR.week ? md.week.best : 0, news = KM.report('week', { week: TOUR.week, score: TOUR.total }), t = TOUR; TOUR = null;
    overlay(`<div class="res"><div class="stars">🏆</div><h2>${lost ? 'Turnier vorbei' : 'Turnier geschafft!'}</h2><p class="dim">${t.i}/5 Lieder · Woche ${t.week}</p><div class="stats"><span><b>${t.total.toLocaleString('de-DE')}</b>Punkte</span><span><b>${Math.max(prev, t.total).toLocaleString('de-DE')}</b>Wochen-Bestwert</span></div>
      ${t.total > prev ? '<p class="rec">🏆 Neuer Wochen-Bestwert!</p>' : ''}${newsHtml(news)}<p class="dim small">Angemeldet und freigegeben? Dann steht dein Bestwert in der Wochen-Rangliste.</p>
      <div class="row center"><button class="btn nav" data-act="rank">🏆 Rangliste</button><button class="btn gold nav" data-act="menu" data-focus>☰ Menü</button></div></div>`, { esc: () => { closeOv(); menu(); }, menu: () => { closeOv(); menu(); }, rank: () => { closeOv(); menu(); rankView(); } });
  }

  /* ---------- Shop, Aufgaben, Erfolge, Ranglisten ---------- */
  let shopTab = 'design';
  function shop() {
    const md = KM.data, T = { design: '🟦 Designs', bg: '🌅 Hintergründe', fx: '✨ Effekte', sound: '🎹 Klänge', item: '🧰 Hilfsmittel', song: '🆕 Neue Lieder' };
    if (shopTab === 'item' || shopTab === 'song') return shopSpecial(T);
    overlay(`<h2>💎 Shop <small class="dim">Du hast 💎 ${md.gems}</small></h2><div class="tabs">${Object.keys(T).map(k => `<button class="chip nav${shopTab === k ? ' on' : ''}" data-act="tab" data-t="${k}">${T[k]}</button>`).join('')}</div>
      <div class="shopGrid">${Object.entries(KM.SHOP[shopTab]).map(([id, it]) => { const own = md.own[shopTab].includes(id), use = md.use[shopTab] === id;
        return `<button class="shopIt nav${use ? ' on' : ''}" data-act="buy" data-id="${id}"${!own && md.gems < it.price ? ' disabled' : ''}>${shopTab === 'design' ? `<span class="sw" style="background:linear-gradient(${it.head} 0 30%,${it.mid} 30% 55%,${it.base} 55%)"></span>` : shopTab === 'bg' ? `<span class="sw" style="background:linear-gradient(135deg,${it.c.join(',')})"></span>` : `<span class="sw ic">${it.ic}</span>`}
          <b>${it.n}</b><small>${use ? '✓ Aktiv' : own ? 'Auswählen' : '💎 ' + it.price}</small></button>`; }).join('')}</div>
      ${shopTab === 'sound' ? `<label class="tg nav"><input type="checkbox" id="sAll"${SET.soundAll ? ' checked' : ''}> 🎹 Diesen Klang auch in allen Spielmodi verwenden (sonst nur im Freien Klavier)</label>` : ''}
      <p class="dim small">Diamanten gibt es für Sterne (2), Kronen (5), goldene Kacheln, fehlerfreie Lieder, Aufgaben und Erfolge.</p><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
      { esc: () => { closeOv(); if (cur === 'sMenu') menu(); }, tab: b => { shopTab = b.dataset.t; shop(); }, buy: b => { const id = b.dataset.id, it = KM.SHOP[shopTab][id], own = KM.data.own[shopTab].includes(id); if (KM.buy(shopTab, id)) { if (!own) toast('💎 ' + it.n + ' gekauft'); bgKey = ''; } shop(); } });
    const sa = $('sAll'); if (sa) sa.onchange = () => { SET.soundAll = sa.checked; saveSet(); };
  }
  // Shop: Hilfsmittel (Vorrat) und neue Lieder aus dem Online-Archiv
  function shopSpecial(T) {
    const md = KM.data, tabs = `<div class="tabs">${Object.keys(T).map(k => `<button class="chip nav${shopTab === k ? ' on' : ''}" data-act="tab" data-t="${k}">${T[k]}</button>`).join('')}</div>`;
    let body;
    if (shopTab === 'item') body = `<div class="shopGrid">${Object.entries(KM.SHOP.item).map(([id, it]) => `<button class="shopIt nav" data-act="item" data-id="${id}"${md.gems < it.price ? ' disabled' : ''}><span class="sw ic">${it.ic}</span><b>${it.n}</b><small>${esc(it.d)}</small><small>Vorrat: ${md.items[id]} · 💎 ${it.price}</small></button>`).join('')}</div><p class="dim small">Extra-Herz und Schild wählst du vor dem Lied unter 🧰 Hilfsmittel, die Zeitlupe tippst du im Spiel an. Nicht im Turnier und im Battle.</p>`;
    else { const neu = allSongs().filter(s => s.gems); body = !archive ? '<p class="dim">🌐 Das Online-Archiv lädt …</p>' : `<div class="songShop">${neu.map(s => { const own = KM.ownsSong(s.id); return `<button class="shopSong nav" data-act="song" data-id="${esc(s.id)}"${own ? ' disabled' : ''}><b>${esc(s.title)}</b><small>${esc(s.artist)} · ${C.fmt(s.dur || 0)}</small><em>${own ? '✓ freigeschaltet' : '💎 ' + s.gems}</em></button>`; }).join('')}</div><p class="dim small">Neue gemeinfreie Lieder, die es sonst nicht im Liederbuch gibt – einmal freischalten, für immer spielen.</p>`; if (!archive) loadArchive(false).then(() => { if (ovOpen() && shopTab === 'song') shop(); }); }
    overlay(`<h2>💎 Shop <small class="dim">Du hast 💎 ${md.gems}</small></h2>${tabs}${body}<div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
      { esc: () => { closeOv(); if (cur === 'sMenu') menu(); }, tab: b => { shopTab = b.dataset.t; shop(); },
        item: b => { if (KM.buyItem(b.dataset.id)) toast(KM.SHOP.item[b.dataset.id].ic + ' +1'); shop(); },
        song: b => { const s = allSongs().find(x => x.id === b.dataset.id); if (s) { closeOv(); unlockView(s); } } });
  }
  function questsView() {
    const qs = KM.quests();
    overlay(`<h2>📋 Aufgaben von heute</h2><div class="quests">${qs.map(q => `<div class="quest${q.done ? ' done' : ''}"><b>${q.done ? '✅' : '🎯'} ${esc(q.t)}</b><span class="qbar"><i style="width:${Math.round(q.p / q.goal * 100)}%"></i></span><small>${q.p}/${q.goal} · 💎 ${q.gems}</small></div>`).join('')}</div>
      <p class="dim small">Jeden Tag gibt es drei neue Aufgaben. Die Diamanten bekommst du automatisch, sobald eine Aufgabe geschafft ist.</p><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`, { esc: () => { closeOv(); if (cur === 'sMenu') menu(); } });
  }
  function achView() {
    const md = KM.data, n = Object.keys(md.ach).length;
    overlay(`<h2>🏅 Erfolge <small class="dim">${n}/${KM.ACH.length}</small></h2><div class="achGrid">${KM.ACH.map(a => `<div class="ach${md.ach[a.id] ? ' on' : ''}"><i>${a.icon}</i><b>${esc(a.title)}</b><small>${esc(a.desc)}${a.gems ? ' · 💎 ' + a.gems : ''}</small></div>`).join('')}</div>
      <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`, { esc: closeOv });
  }
  // Ranglisten: zentrale easygames-Seite (nur Angemeldete mit Freigabe erscheinen), eingebettet
  const PUBBASE = (window.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/');
  function rankView() {
    overlay(`<h2>🏆 Ranglisten</h2><p class="dim small">Nur für angemeldete Spieler (Google): Wer seine Bestwerte freigibt, erscheint mit Spitznamen – Gesamtpunkte, Sterne, Kronen, Endlos und Turnier der Woche.</p>
      <iframe class="rankFrame" src="${PUBBASE}ranglisten.html?embed=1&game=klavierlicht" title="Ranglisten" loading="lazy"></iframe><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`, { esc: closeOv });
  }
  // Kalibrieren: im Takt der Klicks tippen → Verzögerung von Gerät, Kopfhörer und Finger
  function calibrate() {
    P.init(); const bpm = 100, beat = 60 / bpm, t0 = P.ctx.currentTime + 1, taps = [], lat = P.ctx.outputLatency || 0;
    for (let i = 0; i < 12; i++) P.drum(i % 4 ? 'click' : 'accent', t0 + i * beat);
    overlay(`<h2>🎯 Verzögerung messen</h2><p>Tippe bei jedem Klick auf die Fläche (oder drücke die Leertaste) – 12 Klicks.</p><button class="calPad nav" id="calPad" data-focus>👆 Hier im Takt tippen</button><p class="dim" id="calOut">bisher: ${Math.round((SET.cal || 0) * 1000)} ms</p><div class="row end"><button class="btn nav" data-act="reset">Zurücksetzen</button><button class="btn gold nav" data-act="esc">Fertig</button></div>`,
      { esc: () => { closeOv(); opts(); }, reset: () => { SET.cal = 0; saveSet(); $('calOut').textContent = 'zurückgesetzt: 0 ms'; } });
    const tap = e => { const ct = P.ctx.currentTime - (e && e.timeStamp ? Math.max(0, (performance.now() - e.timeStamp) / 1000) : 0), i = Math.round((ct - t0) / beat); if (i < 2 || i > 11) return; taps.push(ct - (t0 + i * beat) - lat);
      $('calPad').classList.add('hit'); setTimeout(() => { const p = $('calPad'); if (p) p.classList.remove('hit'); }, 90);
      if (taps.length >= 6) { const m = taps.slice().sort((a, b) => a - b)[taps.length >> 1]; SET.cal = Math.max(-0.05, Math.min(0.25, m)); saveSet(); $('calOut').textContent = 'gemessen: ' + Math.round(SET.cal * 1000) + ' ms (' + taps.length + ' Treffer)'; } };
    $('calPad').onpointerdown = e => { e.preventDefault(); tap(e); }; $('calPad').onkeydown = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); tap(e); } };
  }

  /* ---------- Klaviertastatur: 🎓 Klavier lernen und 🎼 freies Klavier ---------- */
  const ORDER = ['#3dff8f', '#ffd23d', '#ff6fd0'];   // Reihenfolge: nächste, übernächste, dritte Taste
  const PCOL = ['#ff5f7e', '#ff8a3d', '#ffc23d', '#e9f24a', '#7cf25c', '#3de0a0', '#3dd6ff', '#4d9bff', '#7a6bff', '#b05cff', '#ff5cf0', '#ff5cae'];
  // Computertastatur wie in Musikprogrammen: untere Buchstabenreihe ab C, obere Reihe eine Oktave höher (schwarze Tasten dazwischen)
  const ROW1 = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'Comma', 'KeyL', 'Period', 'Semicolon', 'Slash'];
  const ROW2 = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
  const KDE = { KeyZ: 'Y', KeyY: 'Z', Semicolon: 'Ö', Slash: '-', Comma: ',', Period: '.', BracketLeft: 'Ü', Equal: '´', BracketRight: '+' };   // deutsche Tastatur, sonst echte Belegung
  let KLAB = {};
  try { navigator.keyboard.getLayoutMap().then(m => { const o = {}; m.forEach((v, k) => { o[k] = v.toUpperCase(); }); KLAB = o; }).catch(() => {}); } catch (e) { /* ältere Browser */ }
  const klab = c => KLAB[c] || KDE[c] || c.replace(/^(Key|Digit)/, '');
  const pc = p => ((p % 12) + 12) % 12, nm = p => C.keyName(p).replace(/-?\d+$/, '');
  const FALL = { leicht: 3, normal: 2.4, profi: 1.9 };
  function layoutKeys() {
    if (G.free) { const n = Math.max(8, Math.min(52, Math.round(W / (coarse() ? 40 : 46)))); let p = G.base, c = 0; G.lo = p; while (true) { if (!C.isBlack(p) && ++c >= n) break; p++; } G.hi = p; }
    G.lay = C.keyLayout(G.lo, G.hi, W); G.kmap = {}; G.lay.keys.forEach(k => { G.kmap[k.p] = k; });
    G.kbTop = Math.round(H - Math.min(300, Math.max(120, H * (G.free ? 0.42 : 0.3))));
    G.kbBase = G.lo - pc(G.lo);
    if (G.free) { $('kOct').textContent = C.keyName(G.lo) + ' – ' + C.keyName(G.hi); }
  }
  function keysReset(M) {
    Object.assign(G, { items: false, speed: 1, keys: true, M, tiles: false, auto: false, over: false, run: true, paused: false, down: {}, flashK: {}, wrongK: {}, lights: [], fx: [], sustained: [], pedal: false, sus: false, word: null, msg: null, st: C.newState(), ni: 0, waitAt: 0 });
    for (const id in PTR) delete PTR[id];
    scr('sGame'); $('bSlow').hidden = true; document.body.dataset.view = 'keys'; document.body.dataset.kmode = G.free ? 'free' : 'learn'; resize(); bgKey = '';
    $('kPed').classList.remove('on'); $('kStaff').classList.toggle('on', !!SET.staff);
  }
  function startFree() {
    if (!P.init()) { toast('Dein Browser kann keinen Ton erzeugen.'); return; }
    mode = 'frei'; G.free = true; G.learn = false; G.base = Math.max(24, Math.min(84, SET.oct || 48)); G.chart = { title: 'Freies Klavier', lic: 'Klang: easygames-Klavier (ohne Aufnahmen erzeugt)' }; G.notes = []; G.len = 1e9;
    keysReset(C.MODES.frei); layoutKeys(); P.setTimbre(KM.data.use.sound); G.rec = null; G.pb = null; G.freeN = 0; G.rhy = { style: 'aus', bpm: SET.rbpm || 100, auto: !!SET.rauto, next: 0, step: 0, recent: [] }; recBtn();
    $('gTitle').textContent = '🎼 Freies Klavier'; $('gMode').textContent = coarse() ? 'Tippen und wischen · mehrere Finger gleichzeitig' : 'Maus, Tastatur (Y…- und Q…Ü) oder MIDI-Keyboard · ←/→ Oktave · Leertaste Pedal'; $('gLic').textContent = '© ' + G.chart.lic;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  // Noten für „Klavier lernen“: rechte Hand = Melodie, linke Hand = Bass (Lektion: eigene Stimme, Lied: tiefster Begleitton je Einsatz)
  function learnNotes(ch, level, hand) {
    const st = ch.step / 1000, off = (ch.off || 0) / 1000, mk = h => ([s, p, d]) => ({ t: off + s * st, p, d: Math.max(st, d * st), lane: 0, hit: null, hand: h });
    const acc = C.accompaniment(ch); let rh, lh = [];
    if (ch.lesson) { rh = ch.mel.map(mk('R')); lh = (ch.lh || []).map(mk('L')); return { notes: rh.concat(lh).sort((a, b) => a.t - b.t || a.p - b.p), acc }; }
    rh = C.playable(ch, level, 4).map(n => Object.assign(n, { hand: 'R' }));
    C.melodyRest(ch, rh).forEach(e => acc.push(e)); acc.sort((a, b) => a[0] - b[0]);
    if (hand !== 'r') {
      const gap = { leicht: 0.95, normal: 0.45, profi: 0.2 }[level] || 0.45; let last = -9;   // Leicht: etwa ein Basston je Takt
      for (let i = 0; i < acc.length;) { const t0 = acc[i][0]; let lo = -1, j = i; for (; j < acc.length && acc[j][0] - t0 < 0.02; j++) if (acc[j][1] < 55 && (lo < 0 || acc[j][1] < acc[lo][1])) lo = j;   // nur Basslage, keine Akkordtöne
        if (lo >= 0 && t0 - last >= gap) { lh.push({ t: t0, p: acc[lo][1], d: acc[lo][2], lane: 0, hit: null, hand: 'L' }); acc[lo][3] = 0; last = t0; } i = j; }
      if (hand === 'l' && lh.length) { rh.forEach(n => acc.push([n.t, n.p, n.d, 0.5])); acc.sort((a, b) => a[0] - b[0]); rh = []; }
    }
    return { notes: rh.concat(lh).sort((a, b) => a.t - b.t || a.p - b.p), acc };
  }
  function startKeys(chart, level, opt) {
    if (!P.init()) { toast('Dein Browser kann keinen Ton erzeugen.'); return; }
    opt = opt || {}; P.setTimbre(SET.soundAll ? KM.data.use.sound : 'klavier');
    const M = C.MODES[mode], rate = opt.rate || SET.rate, ch = rate !== 1 ? C.withRate(chart, rate) : chart;
    G.free = false; G.learn = true; Object.assign(G, { chart, ch, level, rate, round: 1, lives: 0, L: C.LEVELS[level], fall: FALL[level] || 2.4, lessonId: opt.lesson || null, practiceSlice: !!opt.slice, hand: chart.lesson ? 'b' : SET.hand });
    keysReset(M);
    const ln = learnNotes(ch, level, G.hand); G.notes = ln.notes; G.acc = ln.acc; G.ai = 0;
    const both = G.notes.some(n => n.hand === 'L') && G.notes.some(n => n.hand === 'R');
    const r = C.keyRange(G.notes, both ? (W < 560 ? 36 : 48) : W < 560 ? 24 : W < 900 ? 31 : 40); G.lo = r.lo; G.hi = r.hi; layoutKeys();
    if (both && W < 560 && H > W) toast('💡 Tipp: Für beide Hände das Handy quer halten', 3000);
    G.len = C.duration(ch) + 1.2; G.lt = -2.4; G.lastC = P.ctx.currentTime;
    $('gTitle').textContent = chart.title; $('gLic').textContent = '© ' + (chart.lic || song && song.lic || '');
    $('gMode').textContent = (G.lessonId ? '🎓 Lernpfad' : M.ic + ' ' + M.n + ' · ' + C.LEVELS[level].n + ' · ' + { r: 'rechte Hand', l: 'linke Hand', b: 'beide Hände' }[G.hand]) + (rate !== 1 ? ' · ' + Math.round(rate * 100) + ' %' : '') + (SET.wait ? ' · wartet auf dich' : ' · live');
    const beat = 60 / (ch.bpm || 100), c0 = P.ctx.currentTime + 2.4; for (let i = 0; i < 4; i++) P.note(84, c0 - (4 - i) * beat, 0.08, i ? 0.22 : 0.32);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  const root = window;
  function keysFrame() {
    const c = P.ctx.currentTime, dt = Math.max(0, Math.min(0.1, c - (G.lastC || c))); G.lastC = c;
    if (G.learn) {
      while (G.ni < G.notes.length && G.notes[G.ni].hit !== null) G.ni++;
      const nx = G.notes[G.ni]; let t = G.lt + dt;
      if (SET.wait && nx && t >= nx.t) { t = nx.t; if (!G.waitAt) G.waitAt = performance.now(); }
      G.lt = t;
      const lim = SET.wait && nx ? Math.min(t + 0.12, nx.t - 0.001) : t + 0.12;
      while (G.ai < G.acc.length && G.acc[G.ai][0] < lim) { const [at, p, d, v] = G.acc[G.ai++]; if (at > t - 0.05) P.note(p, c + Math.max(0, at - t), d, v * SET.acc); }
      if (!SET.wait) for (let i = G.ni; i < G.notes.length; i++) { const n = G.notes[i]; if (n.t > t - C.WIN.good) break; if (n.hit === null) { n.hit = 'miss'; n.at = t; C.scoreHit(G.st, null); if (SET.help) P.note(n.p, 0, n.d, 0.16); } }
      if (t > G.len) { finish(); return; }
    }
    if (G.free) {
      if (G.rhy && G.rhy.style !== 'aus') rhythmTick();
      if (G.pb) { const pt = c - G.pb.t0; while (G.pb.i < G.pb.ev.length && G.pb.ev[G.pb.i][0] <= pt) { const [, p, d] = G.pb.ev[G.pb.i++], a = performance.now(); G.lights.push({ p, a, b: a + d * 1000 }); G.flashK[p] = a; } if (G.pb.i >= G.pb.ev.length) G.pb = null; }
    }
    drawKeys(G.learn ? G.lt : 0);
  }
  function keyDown(p, vel) {
    if (!G.run || G.paused || p == null) return;
    if (G.down[p]) P.release(G.down[p]);
    G.down[p] = P.note(p, 0, 6, vel || 0.75); G.flashK[p] = performance.now();
    if (G.free) { G.lights.push({ p, a: performance.now(), b: 0 }); freeNote(p, vel || 0.75); } else learnHit(p);
  }
  function keyUp(p) {
    const v = G.down[p]; if (!v) return; delete G.down[p];
    if (G.free && G.rec && G.rec.on[p]) { const r = G.rec.on[p]; r[2] = Math.max(0.05, P.ctx.currentTime - G.rec.t0 - r[0]); delete G.rec.on[p]; }
    if (G.pedal || G.sus) G.sustained.push(v); else P.release(v);
    for (let i = G.lights.length - 1; i >= 0; i--) if (G.lights[i].p === p && !G.lights[i].b) { G.lights[i].b = performance.now(); break; }
  }
  function sustainOff() { if (G.pedal || G.sus) return; G.sustained.forEach(v => P.release(v)); G.sustained = []; }
  function setPedal(on) { G.pedal = on; $('kPed').classList.toggle('on', on); if (!on) sustainOff(); }
  function learnHit(p) {
    const t = G.lt; let best = null, bd = 9;
    for (let i = G.ni; i < G.notes.length; i++) { const n = G.notes[i]; if (n.t > t + C.WIN.good + (SET.wait ? 0.25 : 0)) break; if (n.hit !== null || n.p !== p) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
    if (!best) { if (t > -0.5) G.wrongK[p] = performance.now(); return; }
    const kind = SET.wait ? (G.waitAt ? (performance.now() - G.waitAt < 250 ? 'perfect' : 'good') : C.judge(best.t - t) || 'good') : C.judge(best.t - t);
    best.hit = kind || 'miss'; best.at = t; C.scoreHit(G.st, kind); G.waitAt = 0;
    if (kind) { G.word = { k: kind, t: performance.now() }; const k = G.kmap[p]; if (k) sparks(k.x + k.w / 2, G.kbTop, kind, kind === 'perfect' ? '#fff' : '#ffe9a0'); }
  }
  /* ---------- Freies Klavier: Aufnehmen, Klangfarben, Rhythmus und Begleitautomatik ---------- */
  function freeNote(p, v) {
    if (G.rec) { const e = [P.ctx.currentTime - G.rec.t0, p, 0.3, v]; G.rec.ev.push(e); G.rec.on[p] = e; }
    G.rhy.recent.push([P.ctx.currentTime, p]); if (G.rhy.recent.length > 24) G.rhy.recent.shift();
    if (++G.freeN % 10 === 0) KM.report('freenotes', { n: 10 });
  }
  function recBtn() { const b = $('kRec'); b.classList.toggle('on', !!G.rec); b.textContent = G.rec ? '⏹ Stopp' : '⏺ Aufnahme'; }
  function recToggle() {
    if (!G.rec) { G.rec = { t0: P.ctx.currentTime, ev: [], on: {} }; recBtn(); toast('⏺ Aufnahme läuft – spiel los!'); return; }
    const r = G.rec; G.rec = null; recBtn(); const t0 = r.ev.length ? r.ev[0][0] : 0; const ev = r.ev.map(e => [e[0] - t0, e[1], e[2], e[3]]);
    if (!ev.length) { toast('Keine Töne aufgenommen.'); return; }
    G.lastRec = ev; KM.report('record'); recMenu(ev);
  }
  function recMenu(ev, shared) {
    pauseFree();
    overlay(`<h2>${shared ? '🎵 Eine Melodie für dich' : '⏺ Deine Aufnahme'}</h2><p class="dim">${ev.length} Töne · ${C.fmt(ev[ev.length - 1][0] + ev[ev.length - 1][2])}</p>
      <div class="col"><button class="btn gold nav" data-act="play" data-focus>▶ Anhören</button><button class="btn nav" data-act="song">🎹 Als Lied speichern (in allen Modi spielbar)</button>${shared ? '' : '<button class="btn nav" data-act="share">🔗 Link teilen</button>'}<button class="btn nav" data-act="esc">${shared ? 'Selbst spielen' : 'Verwerfen und weiterspielen'}</button></div>`,
      { esc: () => { closeOv(); G.paused = false; },
        play: () => { closeOv(); G.paused = false; playback(ev); },
        song: () => { const name = (prompt('Name für dein Lied:', shared ? 'Geteilte Melodie' : 'Meine Melodie') || '').trim().slice(0, 50) || 'Meine Melodie'; const c = KLMidi.toChartRec(ev, name, G.rhy.style !== 'aus' ? G.rhy.bpm : 100); c.artist = shared ? 'Geteilte Aufnahme' : 'Eigene Aufnahme'; c.lic = 'Eigene Aufnahme – nur auf diesem Gerät'; c.src = 'Im Freien Klavier aufgenommen';
          if (addOwn(c)) toast('🎹 „' + name + '“ steht jetzt im Liederbuch unter 📂 Eigene'); closeOv(); G.paused = false; },
        share: () => shareRec(ev) });
  }
  function pauseFree() { G.paused = true; Object.keys(G.down).forEach(p => keyUp(+p)); }
  function playback(ev) { G.pb = { t0: P.ctx.currentTime + 0.3, ev, i: 0 }; ev.forEach(([t, p, d, v]) => P.note(p, G.pb.t0 + t, d, v)); toast('▶ Wiedergabe …', 1500); }
  async function shareRec(ev) {
    const code = KLMidi.encode(ev), u0 = location.href.split('#')[0].split('?')[0] + '#rec=' + code, url = window.EasyGamesLink ? EasyGamesLink.share(u0) : u0;
    if (url.length > 12000) { toast('Die Aufnahme ist zu lang für einen Link – bitte kürzer aufnehmen.'); return; }
    try { if (navigator.share) { await navigator.share({ title: 'Klavierlicht – meine Melodie', text: '🎹 Hör dir meine Melodie an:', url }); return; } } catch (e) { /* abgebrochen */ }
    try { await navigator.clipboard.writeText(url); toast('🔗 Link kopiert – einfach verschicken!'); } catch (e) { prompt('Link zum Kopieren:', url); }
  }
  // geteilte Melodie öffnen (#rec=…)
  let pendingRec = null;
  try { const m = /[#&]rec=([A-Za-z0-9_-]+)/.exec(location.hash); if (m) pendingRec = KLMidi.decode(m[1]); } catch (e) { toast('🔗 Dieser Melodie-Link ist beschädigt.'); }
  function soundMenu() {
    pauseFree(); const md = KM.data;
    overlay(`<h2>🎨 Klang wählen</h2><div class="shopGrid">${Object.entries(KM.SHOP.sound).map(([id, it]) => { const own = md.own.sound.includes(id); return `<button class="shopIt nav${md.use.sound === id ? ' on' : ''}" data-act="pick" data-id="${id}"${!own && md.gems < it.price ? ' disabled' : ''}><span class="sw ic">${it.ic}</span><b>${it.n}</b><small>${md.use.sound === id ? '✓ Aktiv' : own ? 'Auswählen' : '💎 ' + it.price}</small></button>`; }).join('')}</div>
      <p class="dim small">Alle Klänge werden im Gerät erzeugt – ohne Aufnahmen. Weitere Klänge gibt es im 💎 Shop.</p><div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
      { esc: () => { closeOv(); G.paused = false; }, pick: b => { const id = b.dataset.id, own = KM.data.own.sound.includes(id); if (KM.buy('sound', id)) { P.setTimbre(id); P.note(60, 0, 0.6, 0.7); P.note(64, P.ctx.currentTime + 0.12, 0.6, 0.6); P.note(67, P.ctx.currentTime + 0.24, 0.8, 0.6); if (!own) toast('💎 ' + KM.SHOP.sound[id].n + ' gekauft'); } soundMenu(); } });
  }
  // Rhythmen: je Achtel (8 Schritte = 4/4, 6 = 3/4) Schlagzeug und Begleitung (b = Bass, c = Akkord)
  const RHY = {
    aus: { n: 'Aus' }, metronom: { n: 'Metronom', s: [['accent'], [], ['click'], [], ['click'], [], ['click'], []] },
    pop: { n: 'Pop', s: [['kick', 'hat', 'b'], ['hat'], ['snare', 'hat', 'c'], ['hat'], ['kick', 'hat', 'b'], ['hat', 'kick'], ['snare', 'hat', 'c'], ['hat']] },
    rock: { n: 'Rock', s: [['kick', 'hat', 'b', 'c'], ['hat'], ['snare', 'hat', 'c'], ['hat', 'kick'], ['kick', 'hat', 'b', 'c'], ['hat', 'kick'], ['snare', 'hat', 'c'], ['hat']] },
    walzer: { n: 'Walzer', s: [['kick', 'b'], [], ['hat', 'c'], [], ['hat', 'c'], []] },
    bossa: { n: 'Bossa Nova', s: [['kick', 'hat', 'b'], ['hat', 'c'], ['hat', 'click'], ['kick', 'hat', 'c'], ['kick', 'hat', 'b'], ['hat', 'click'], ['hat', 'c'], ['kick', 'hat']] },
    ballade: { n: 'Ballade', s: [['kick', 'b', 'c'], ['hat'], ['hat'], ['hat'], ['snare', 'hat', 'c'], ['hat'], ['hat'], ['hat']] }
  };
  function rhythmMenu() {
    pauseFree(); const R = G.rhy;
    overlay(`<h2>🥁 Rhythmus & Begleitung</h2><div class="tabs">${Object.entries(RHY).map(([k, r]) => `<button class="chip nav${R.style === k ? ' on' : ''}" data-act="st" data-k="${k}">${r.n}</button>`).join('')}</div>
      <label class="lab2">Tempo <b id="rbV">${R.bpm}</b> Schläge pro Minute<input type="range" class="nav" id="rb" min="50" max="180" step="2" value="${R.bpm}"></label>
      <label class="tg nav"><input type="checkbox" id="ra"${R.auto ? ' checked' : ''}> 🎸 Begleitautomatik: Bass und Akkorde passend zu den Tönen, die du spielst</label>
      <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
      { esc: () => { R.bpm = +$('rb').value; R.auto = $('ra').checked; SET.rbpm = R.bpm; SET.rauto = R.auto; saveSet(); closeOv(); G.paused = false; R.next = 0; $('kRhy').classList.toggle('on', R.style !== 'aus'); },
        st: b => { R.style = b.dataset.k; R.bpm = +$('rb').value; R.auto = $('ra').checked; rhythmMenu(); } });
    $('rb').oninput = () => { $('rbV').textContent = $('rb').value; };
  }
  // Akkord aus den zuletzt gespielten Tönen: tiefster Ton = Grundton, kleine Terz ohne große → Moll
  function curChord() {
    const c = P.ctx.currentTime, beat = 60 / G.rhy.bpm, ps = G.rhy.recent.filter(([t]) => c - t < beat * 2).map(x => x[1]).concat(Object.keys(G.down).map(Number));
    if (!ps.length) return G.rhy.last || null; const lo = Math.min(...ps), r = ((lo % 12) + 12) % 12, pcs = new Set(ps.map(p => ((p % 12) + 12) % 12));
    return (G.rhy.last = { r, m: pcs.has((r + 3) % 12) && !pcs.has((r + 4) % 12) });
  }
  function rhythmTick() {
    const R = G.rhy, st = RHY[R.style]; if (!st || !st.s) return; const c = P.ctx.currentTime, e8 = 30 / R.bpm;
    if (!R.next || R.next < c - 0.2) { R.next = c + 0.08; R.step = 0; }
    while (R.next < c + 0.15) {
      const parts = st.s[R.step % st.s.length], ch = R.auto ? curChord() : null;
      for (const k of parts) {
        if (k === 'b' || k === 'c') { if (!ch) continue; if (k === 'b') P.note(36 + ((ch.r + 4) % 12) - 4 + 12, R.next, e8 * 1.8, 0.45); else [0, ch.m ? 3 : 4, 7].forEach(i => P.note(55 + ((ch.r + i - 7 + 12) % 12), R.next, e8 * 1.2, 0.22)); }
        else P.drum(k, R.next, 0.8);
      }
      R.next += e8; R.step++;
    }
  }
  $('kRec').onclick = recToggle; $('kSnd').onclick = soundMenu; $('kRhy').onclick = rhythmMenu;
  function keysKey(e, down) {
    if (G.free && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) { if (down && !e.repeat) octave(e.code === 'ArrowRight' ? 1 : -1); return true; }
    if (e.code === 'Space') { if (!e.repeat) { G.sus = down; if (!down) sustainOff(); } return true; }
    let i = ROW1.indexOf(e.code), p = null; if (i >= 0) p = G.kbBase + i; else { i = ROW2.indexOf(e.code); if (i >= 0) p = G.kbBase + 12 + i; }
    if (p == null) return false; if (e.repeat) return true;
    if (down) keyDown(p); else keyUp(p); return true;
  }
  function octave(d) { G.base = Math.max(24, Math.min(84, G.base + 12 * d)); SET.oct = G.base; saveSet(); layoutKeys(); }
  const PTR = {};
  function kbAt(e) { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (y < G.kbTop - 6) return null; const ry = Math.min(1, Math.max(0, (y - G.kbTop) / (H - G.kbTop))); const p = C.keyAt(G.lay, x, ry); return p == null ? null : { p, vel: 0.5 + 0.45 * ry }; }
  function kbDown(e) { const h = kbAt(e); if (!h) return; PTR[e.pointerId] = h.p; keyDown(h.p, h.vel); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } }
  function kbMove(e) { const o = PTR[e.pointerId]; if (o == null) return; const h = kbAt(e); if (h && h.p !== o) { keyUp(o); PTR[e.pointerId] = h.p; keyDown(h.p, h.vel); } }
  function kbUp(e) { const o = PTR[e.pointerId]; if (o == null) return; delete PTR[e.pointerId]; keyUp(o); }
  // MIDI-Keyboard (Web MIDI, z. B. Chrome/Edge): Tasten, Anschlagstärke und Haltepedal
  let midiOn = false;
  function midiConnect() {
    if (midiOn) { toast('🔌 MIDI ist schon verbunden.'); return; }
    if (!navigator.requestMIDIAccess) { toast('Dieser Browser kann kein MIDI – am besten Chrome oder Edge.'); return; }
    navigator.requestMIDIAccess().then(acc => { midiOn = true; const bind = () => acc.inputs.forEach(i => { i.onmidimessage = onMidi; }); bind(); acc.onstatechange = bind; $('kMidi').classList.add('on'); toast(acc.inputs.size ? '🔌 MIDI-Keyboard verbunden' : '🔌 MIDI bereit – Keyboard anschließen'); }).catch(() => toast('MIDI wurde nicht erlaubt.'));
  }
  function onMidi(m) { if (cur !== 'sGame' || !G.keys) return; const d = m.data, ty = d[0] & 0xf0; if (ty === 0x90 && d[2] > 0) keyDown(d[1], 0.3 + 0.7 * d[2] / 127); else if (ty === 0x80 || ty === 0x90) keyUp(d[1]); else if (ty === 0xb0 && d[1] === 64) { G.sus = d[2] >= 64; if (!G.sus) sustainOff(); } }
  $('kStaff').onclick = () => { SET.staff = !SET.staff; saveSet(); $('kStaff').classList.toggle('on', SET.staff); }; $('kDn').onclick = () => octave(-1); $('kUp').onclick = () => octave(1); $('kPed').onclick = () => setPedal(!G.pedal); $('kMidi').onclick = midiConnect;
  function drawKeys(t) {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(background(), 0, 0); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pn = performance.now(), top = G.kbTop, kh = H - top, lay = G.lay, nxt = {};
    for (const k of lay.keys) if (!k.black && pc(k.p) === 0) { cx.fillStyle = 'rgba(255,255,255,.14)'; cx.fillRect(Math.round(k.x), 0, 1, top); }
    if (G.learn) {   // fallende Balken: Farbe = Reihenfolge (grün = jetzt, gelb = danach, pink = dritte)
      const sp = top / G.fall; let ord = 0;
      for (let i = Math.max(0, G.ni - 16); i < G.notes.length; i++) {
        const n = G.notes[i], dt = n.t - t; if (dt > G.fall + 0.2) break; if (n.hit && n.hit !== 'miss') continue;
        const k = G.kmap[n.p]; if (!k) continue; const yb = top - dt * sp, h = Math.max(12, n.d * sp - 3), y = yb - h; if (y > top) continue;
        let col = 'rgba(255,90,120,.4)'; if (n.hit === null) { col = ord < 3 ? ORDER[ord] : 'rgba(255,255,255,.5)'; if (ord < 3 && nxt[n.p] == null) nxt[n.p] = ord; ord++; }
        cx.fillStyle = col; cx.beginPath(); cx.roundRect(k.x + 2, y, k.w - 4, Math.min(h, top - y), 6); cx.fill();
        if (n.hand === 'L') { cx.strokeStyle = 'rgba(20,0,60,.75)'; cx.lineWidth = 2; cx.setLineDash([5, 4]); cx.stroke(); cx.setLineDash([]); }
        if (k.w > 14 && h > 16) { cx.fillStyle = 'rgba(30,0,60,.8)'; cx.font = '700 ' + Math.round(Math.min(14, k.w * 0.5)) + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText((n.hand === 'L' && k.w > 22 ? 'L ' : '') + nm(n.p), k.x + k.w / 2, Math.min(top, yb) - 6); }
      }
      cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillRect(0, top - 2, W, 2);
      if (SET.staff && root.KLStaff) {   // Notenzeile mit den nächsten Noten
        const nextN = []; for (let i = G.ni; i < G.notes.length && nextN.length < 3; i++) if (G.notes[i].hit === null) nextN.push(G.notes[i]);
        const sy = W < 560 ? 152 : 120, sh = Math.min(140, Math.max(90, top * 0.3)); if (top - sy > sh + 30) KLStaff.draw(cx, 8, sy, W - 16, sh, G.notes, t, G.fall * 1.7, n => { const k = nextN.indexOf(n); return k >= 0 ? ORDER[k] : null; }, Math.max(0, G.ni - 12));
      }
    } else {   // freies Spiel: Lichtstreifen steigen aus den Tasten auf
      for (let i = G.lights.length - 1; i >= 0; i--) { const L = G.lights[i], k = G.kmap[L.p], y0 = top - (pn - L.a) * 0.25, y1 = L.b && L.b < pn ? top - (pn - L.b) * 0.25 : top;
        if (y1 < 0 || !k) { G.lights.splice(i, 1); continue; } const ya = Math.max(0, y0), col = PCOL[pc(L.p)], g = cx.createLinearGradient(0, ya, 0, y1); g.addColorStop(0, col + '00'); g.addColorStop(1, col);
        cx.fillStyle = g; cx.beginPath(); cx.roundRect(k.x + 3, ya, k.w - 6, Math.max(2, y1 - ya), 6); cx.fill(); }
    }
    cx.fillStyle = '#12082a'; cx.fillRect(0, top - 1, W, kh + 1);
    const lab = SET.labels, keyLab = !coarse() && lab && lay.ww > 26, fs = Math.round(Math.min(14, lay.ww * 0.36));
    for (const black of [false, true]) for (const k of lay.keys) {
      if (k.black !== black) continue;
      const h = black ? kh * 0.62 : kh - 3, x = k.x + (black ? 0 : 1), w = k.w - (black ? 0 : 2), down = !!G.down[k.p], o = nxt[k.p];
      const fl = G.flashK[k.p] ? Math.max(0, 1 - (pn - G.flashK[k.p]) / 300) : 0, wr = G.wrongK[k.p] ? Math.max(0, 1 - (pn - G.wrongK[k.p]) / 350) : 0;
      let fill = black ? '#15151c' : '#fbfaff';
      if (o != null) fill = ORDER[o]; if (down) fill = G.free ? PCOL[pc(k.p)] : o === 0 ? '#9dffc6' : black ? '#5b5bd6' : '#c8ccff';
      cx.fillStyle = fill; cx.beginPath(); cx.roundRect(x, top, w, h, [0, 0, black ? 4 : 7, black ? 4 : 7]); cx.fill();
      if (!down && o == null) { const g = cx.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(0.15, 'rgba(0,0,0,0)'); g.addColorStop(1, black ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'); cx.fillStyle = g; cx.fill(); }
      if (fl > 0) { cx.fillStyle = 'rgba(255,255,255,' + 0.5 * fl + ')'; cx.fill(); }
      if (wr > 0) { cx.fillStyle = 'rgba(255,40,70,' + 0.6 * wr + ')'; cx.fill(); }
      if (o != null) { const r = Math.min(13, k.w * 0.38), yy = top + h - r - 8; cx.fillStyle = 'rgba(30,0,60,.85)'; cx.beginPath(); cx.arc(x + w / 2, yy, r, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.font = '800 ' + Math.round(r * 1.2) + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(o + 1, x + w / 2, yy + r * 0.42); }
      if (!black && lab && o == null) { cx.fillStyle = pc(k.p) === 0 ? '#5a2ca0' : 'rgba(60,40,100,.55)'; cx.font = '700 ' + fs + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(pc(k.p) === 0 ? C.keyName(k.p) : nm(k.p), x + w / 2, top + h - 10); }
      if (keyLab) { const i = k.p - G.kbBase, code = i >= 0 && i < ROW1.length ? ROW1[i] : i >= 12 && i - 12 < ROW2.length ? ROW2[i - 12] : null; if (code && (i < 12 || i - 12 >= ROW1.length - 12 || ROW1.length <= i)) { cx.fillStyle = black ? 'rgba(255,255,255,.6)' : 'rgba(60,40,100,.4)'; cx.font = '600 ' + Math.max(9, fs - 3) + 'px system-ui'; cx.textAlign = 'center'; cx.fillText(klab(code), x + w / 2, top + (black ? h - 8 : h * 0.55)); } }
    }
    for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i], a = (pn - f.t) / 520; if (a >= 1) { G.fx.splice(i, 1); continue; } const s = a * 0.52; cx.globalAlpha = 1 - a; cx.fillStyle = f.c; if (f.g) { cx.font = '700 18px system-ui'; cx.textAlign = 'center'; cx.fillText(f.g, f.x + f.vx * s, f.y + f.vy * s + 200 * s * s); } else { cx.beginPath(); cx.arc(f.x + f.vx * s, f.y + f.vy * s + 200 * s * s, 3.5, 0, 7); cx.fill(); } cx.globalAlpha = 1; }
    if (G.learn) {
      if (G.word) { const a = (pn - G.word.t) / 600; if (a < 1 && WORD[G.word.k]) { const [w, c] = WORD[G.word.k]; cx.globalAlpha = 1 - a * a; cx.fillStyle = c; cx.font = '800 ' + Math.round(24 + 8 * (1 - a)) + 'px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(w, W / 2, top * 0.55); cx.globalAlpha = 1; } }
      if (SET.wait && G.waitAt && pn - G.waitAt > 700) { cx.fillStyle = 'rgba(255,255,255,.9)'; cx.font = '700 18px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText('Spiel die grüne Taste ' + nm(G.notes[G.ni].p) + ' ▼', W / 2, top - 18); }
      if (t < 0) { const n = Math.ceil(-t / (60 / (G.ch.bpm || 100))); if (n <= 4) { cx.fillStyle = '#fff'; cx.font = '800 72px Fredoka,system-ui'; cx.textAlign = 'center'; cx.fillText(n, W / 2, top * 0.5); } }
      $('gScore').textContent = G.st.score.toLocaleString('de-DE'); $('gCombo').textContent = G.st.combo > 4 ? '×' + G.st.combo : '';
      $('gProg').style.width = Math.max(0, Math.min(1, t / G.len)) * 100 + '%';
      const stp = G.st.perfect + G.st.good + G.st.miss ? C.stars(G.st) : 0; $('gStars').innerHTML = [1, 2, 3].map(i => `<i class="${stp >= i ? 'on' : ''}">★</i>`).join('');
    }
    $('gLives').innerHTML = ''; $('gRound').textContent = '';
  }

  /* ---------- Hilfe, Einstellungen ---------- */
  function help() { scr('sHelp'); $('helpBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>❓ So geht's</h2><span></span></header><div class="helpGrid">
    <div><h3>🎹 Klassisch</h3><p>Schwarze Kacheln fallen auf vier Bahnen nach unten. Tippe jede Kachel, wenn sie die weiße Linie erreicht – dann erklingt der Ton, Bass und Begleitung spielen von selbst. Du kannst die Kachel auch schon antippen, wenn sie kurz vor der Linie ist. <b>Lange Kacheln</b> (mit Linie und Kreis) gedrückt halten, bis sie durch sind – das gibt Bonuspunkte. Mit dem Finger über die Bahnen <b>wischen</b> trifft die Kacheln, über die du fährst. Wer ins Leere tippt oder eine Kachel verpasst, verliert ein Herz. Nach drei Fehlern ist das Lied vorbei.</p></div>
    <div><h3>🎓 Klavier lernen</h3><p>Eine echte Klaviertastatur. Das Lied läuft, farbige Balken fallen auf die Tasten: <b style="color:#3dff8f">grün = jetzt</b>, <b style="color:#ffd23d">gelb = danach</b>, <b style="color:#ff6fd0">pink = dritte</b> – die Tasten leuchten mit Nummer 1, 2, 3 in der Reihenfolge. Spiel live mit. Mit „⏳ Warten“ hält das Lied an, bis du die richtige Taste spielst. Tempo 50–100 %.</p></div>
    <div><h3>🎼 Freies Klavier</h3><p>Spiel frei auf allen Tasten mit echten Tönen – mehrere Finger gleichzeitig, wischen, ◀ ▶ für die Oktave, 🦶 Pedal lässt Töne weiterklingen. Am PC: untere Buchstabenreihe (Y X C V …) und obere Reihe (Q W E R …), Leertaste = Pedal. 🔌 MIDI verbindet ein echtes Keyboard (Chrome/Edge).</p></div>
    <div><h3>✨ Magie</h3><p>Leuchtende Lichter wie bei Magic Piano – höhere Töne weiter rechts, tiefere links. Entspannt spielen, ohne Verlieren. Auf Leicht kannst du überall tippen, nur der Takt zählt.</p></div>
    <div><h3>♾️ Endlos · 🧘 Üben · 🏆 Tages-Challenge</h3><p><b>Endlos:</b> Das Lied wiederholt sich und wird jede Runde 10 % schneller. <b>Üben:</b> keine Herzen, Tempo 50–100 %. <b>Tages-Challenge:</b> jeden Tag ein anderes Lied auf Mittel.</p></div>
    <div><h3>🥉🥈🥇 Schwierigkeit</h3><p><b>Leicht</b> (Bronze): weniger Noten, langsamer. <b>Mittel</b> (Silber). <b>Schwer</b> (Gold): fast alle Noten, schneller.</p></div>
    <div><h3>⭐ Sterne und Kronen</h3><p>Perfekt = 100 Punkte, Gut = 60, lange Combos verdoppeln. Ab 50 % Genauigkeit ein Stern, ab 75 % zwei, ab 92 % drei. Ganz ohne Fehler gibt es die 👑 Krone.</p></div>
    <div><h3>© Lieder und Rechte</h3><p>Alle Melodien sind gemeinfrei: Volks-, Kinder- und Weihnachtslieder sowie Werke von Komponisten, die vor über 70 Jahren gestorben sind. Jedes Lied zeigt Komponist, Lebensdaten und Notenvorlage. Klaviersatz: easygames. Viele Lieder liegen im Online-Archiv und werden erst beim Spielen geladen.</p></div>
    <div><h3>🎮 Steuerung</h3><p><b>Touch/Maus:</b> auf die Bahn tippen. <b>Tastatur:</b> D F J K (4 Bahnen), D F Leertaste J K (5), S D F J K L (6), Esc = Pause. <b>Controller:</b> LB X Y RB (4 Bahnen), A = Mitte, LT/RT außen, B = Pause.</p></div>
    </div>`; $('helpBox').querySelector('[data-back]').onclick = menu; }
  function opts() { overlay(`<h2>⚙️ Einstellungen</h2>
    <label class="lab2">Lautstärke der Begleitung <input type="range" class="nav" id="oAcc" min="0" max="1.2" step="0.1" value="${SET.acc}"></label>
    <label class="tg nav"><input type="checkbox" id="oHelp"${SET.help ? ' checked' : ''}> 🎵 Verpasste Noten leise mitspielen (Lied bleibt hörbar)</label>
    <label class="tg nav"><input type="checkbox" id="oLab"${SET.labels ? ' checked' : ''}> ⌨️ Tasten und Notennamen anzeigen</label>
    <label class="tg nav"><input type="checkbox" id="oWait"${SET.wait ? ' checked' : ''}> ⏳ Klavier lernen: warten, bis ich die richtige Taste spiele</label>
    <div class="row"><button class="btn sm nav" data-act="cal">🎯 Verzögerung messen (${Math.round((SET.cal || 0) * 1000)} ms)</button><button class="btn sm nav" data-act="shop">💎 Designs & Hintergründe</button></div>
    <p class="dim small">Verzögerung messen hilft bei Bluetooth-Kopfhörern oder wenn Treffer zu spät gewertet werden. Dein Spielstand wird mit deinem Konto gesichert, wenn du angemeldet bist; eigene MIDI-Lieder und Aufnahmen bleiben nur auf diesem Gerät.</p>
    <div class="row end"><button class="btn gold nav" data-act="esc" data-focus>Fertig</button></div>`,
    { esc: () => { SET.acc = +$('oAcc').value; SET.help = $('oHelp').checked; SET.labels = $('oLab').checked; SET.wait = $('oWait').checked; saveSet(); closeOv(); },
      cal: () => { SET.acc = +$('oAcc').value; saveSet(); calibrate(); }, shop: () => { closeOv(); shop(); } }); }
  $('ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-back]'); if (b && !b.onclick) menu(); });
  $('bPress').onclick = () => { P.init(); if (pendingJoin) { const c = pendingJoin; pendingJoin = null; menu(); netJoin(c); return; } if (pendingRec) { const ev = pendingRec; pendingRec = null; startFree(); recMenu(ev, true); return; } menu(); };
  $('libBack').onclick = menu;

  /* ---------- Start ---------- */
  const tips = ['Die Tasten werden gestimmt …', 'Der Flügel wird poliert …', 'Die Lichter werden angezündet …', 'Noten werden sortiert …'];
  $('loadTip').textContent = tips[Math.floor(Math.random() * tips.length)];
  let lp = 0; const lt = setInterval(() => { lp = Math.min(100, lp + 10 + Math.random() * 14); $('loadBar').style.width = lp + '%'; if (lp >= 100) { clearInterval(lt); setTimeout(() => { if (cur === 'sLoad') scr('sTitle'); }, 200); } }, 90);
  window.KLApp = { get net() { return NET; }, start, startFree, keyDown, keyUp, lib, menu, go, songScreen, pick, get game() { return G; }, get song() { return song; }, allSongs, laneHit, scr: () => cur, setMode(m) { mode = m; }, archiveBases: ARCH, get archive() { return archive; } };
})();

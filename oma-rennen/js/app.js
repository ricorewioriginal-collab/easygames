/* Oma-Rennen – Ablauf: Laden, Titel, Konsolen-Menü, Oma-Wahl, Grand Prix / Einzelrennen / Zeitfahren / Zu zweit,
 * Rennen mit der Kart-Rush-Simulation (../anmacha-kart/sim.js), HUD, Ergebnis, Siegerehrung, Freischaltungen.
 * Online: Fernseher = Rennbild, Handys = Lenkräder über ../cloud/fire-peer.js (PeerJS-kompatibel); Links über die
 * easygames-Homepage (EasyGamesLink.share). Oma-Stimme: im Browser eine deutsche Frauenstimme, in der App die Android-Stimme. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'oma-rennen-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const D = OMA_DATA, { OMAS, TRACKS, CUPS, LEVELS, ITEMS, SAYS, POINTS } = D, V = window.OmaView, SND = window.OmaSound;
  const SET = Object.assign({ sound: true, music: true, voice: true, vib: true, assist: true, far: false, laps: 3, name: '', oma: [0, 3], track: 0, cup: 0, level: 1 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const ST = Object.assign({ races: 0, wins: 0, podiums: 0, pts: 0, cups: [0, 0, 0], best: {}, unl: [false, false, false, false] }, LS.get(P + 'stats', {}));
  const saveSt = () => { LS.set(P + 'stats', ST); if (ST.pts > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', ST.pts); };
  const UNL = ['Hol einen Podestplatz', 'Gewinne den Kaffee-Cup', 'Gewinne den Kuchen-Cup', 'Gewinne den Großen Rentenpokal'];
  const isUnl = i => OMAS[i].unlock == null || !!ST.unl[OMAS[i].unlock];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const fmt = t => { if (!(t >= 0) || t > 1e5) return '–'; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
  const itemIcon = it => it ? (ITEMS[it.replace('3', '')] || {}).icon || '🎁' : '';
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  const sfx = (n, a) => { if (SET.sound && SND.sfx[n]) SND.sfx[n](a); };
  const musicOn = n => SND.music(SET.music ? n : '');
  SND.setVol('mus', SET.music ? .45 : 0); SND.setVol('sfx', SET.sound ? .8 : 0);

  /* ---------- Oma-Stimme ---------- */
  const VOICE = (function () {
    const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null, APP = !!(window.RRWNative && window.RRWNative.ttsSpeak) || !!window.__rrwTtsOn;
    const FEMALE = /female|weiblich|\bfrau\b|anna|petra|helena|hedda|katja|amala|seraphina|marlene|vicki|sandy|shelley|grandma|louisa|elke|ingrid|gisela|tanja|ilse|katharina|maja|sabine|leni|hanna/i, MALE = /\b(stefan|conrad|killian|florian|markus|yannick|martin|grandpa|ralf|jonas|bernd|klaus|hans|male|männlich)\b/i;
    let voice = null, last = 0;
    function pickV() { if (!synth || APP || voice) return; const de = synth.getVoices().filter(v => /^de([-_]|$)/i.test(v.lang)); const w = de.filter(v => FEMALE.test(v.name) && !MALE.test(v.name)); voice = w.find(v => /natural|neural|online/i.test(v.name)) || w[0] || de.find(v => !MALE.test(v.name)) || de[0] || null; }
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', pickV);
    function say(text, force) {
      if (!synth || !SET.voice || !text) return; const now = performance.now(); if (!force && now - last < 3800) return; last = now; pickV();
      try { synth.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/[^\p{L}\p{N}\s.,!?'-]/gu, '')); u.lang = 'de-DE'; u.rate = APP ? 1.05 : 1.08; u.pitch = APP ? 1.25 : (voice && FEMALE.test(voice.name) ? 1.2 : 1.45); if (voice) u.voice = voice; synth.speak(u); } catch (e) { }
    }
    return { say, stop() { try { synth && synth.cancel(); } catch (e) { } } };
  })();

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sSelect: () => selBack(), sSetup: () => suBack(), sOmas: () => toMenu(), sHelp: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sPhone: () => { if (!$('pJoin').hidden) { netClose(); toMenu(); } }, sResult: () => { const b = $('reBtns').querySelector('.pri'); if (b) b.click(); }, sPodium: () => $('poMenu').click() };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero') || e.classList.contains('on')) || els[0]; if (el && !coarse() && (cur !== 'sRace' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('nav'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); sfx('nav'); if (best.onfocus) best.onfocus(); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); }
    if (cur === 'sRace') return pause();
    if (BACK[cur]) BACK[cur]();
  }
  function seg(el, opts, val, cb) {
    el.innerHTML = opts.map(o => `<button class="sg nav${o.v === val ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join('');
    el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v); });
  }

  /* ---------- Menü ---------- */
  function menuStat() { $('menuStat').innerHTML = `<span>⭐ ${ST.pts} Punkte</span><span>🏁 ${ST.wins}/${ST.races} Siege</span><span>${CUPS.map((c, i) => c.icon + (ST.cups[i] === 1 ? '🥇' : ST.cups[i] === 2 ? '🥈' : ST.cups[i] === 3 ? '🥉' : '·')).join(' ')}</span>`; }
  function toMenu() { endRaceView(); netClose(); closeAllOv(); menuStat(); scr('sMenu'); demo(); musicOn('menu'); }
  const closeAllOv = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => {
      sfx('ok'); const g = b.dataset.go;
      if (g === 'gp' || g === 'single' || g === 'time') { FLOW = { mode: g, n: 1, step: 0 }; openSelect(); }
      else if (g === 'duo') { FLOW = { mode: 'duo', n: 2, step: 0 }; openSelect(); }
      else if (g === 'host') openLobby();
      else if (g === 'join') phoneScreen('');
      else if (g === 'omas') { omasScreen(); scr('sOmas'); }
      else if (g === 'opts') openOv('ovOpts');
      else if (g === 'help') { helpScreen(); scr('sHelp'); }
    };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i;
  $('omasBack').onclick = () => toMenu(); $('helpBack').onclick = () => toMenu();
  function omasScreen() {
    $('omaList').innerHTML = OMAS.map((o, i) => { const u = isUnl(i); return `<div class="oc${u ? '' : ' lock'}"><b>${u ? '' : '🔒 '}${esc(o.name)}</b><small>${esc(o.tag)}</small>${statBars(o)}<em>${u ? '„' + esc(o.says) + '“' : esc(UNL[o.unlock])}</em></div>`; }).join('');
    $('recs').innerHTML = '<h3>⏱️ Bestzeiten</h3>' + TRACKS.map(t => `<div class="rc"><span>${esc(t.name)}</span><b>${fmt(ST.best[t.id])}</b></div>`).join('') + `<div class="rc"><span>Karriere-Punkte</span><b>${ST.pts}</b></div><div class="rc"><span>Podestplätze</span><b>${ST.podiums}</b></div>`;
  }
  function helpScreen() { $('itemList').innerHTML = Object.keys(ITEMS).map(k => `<div class="it"><i>${ITEMS[k].icon}</i><b>${esc(ITEMS[k].n)}</b><small>${esc(ITEMS[k].d)}</small></div>`).join(''); }
  const statBars = o => `<div class="bars">${[['Tempo', o.mv, .9, 1.12], ['Antritt', o.ma, .85, 1.22], ['Lenken', o.mt, .8, 1.2], ['Gewicht', o.mw, .75, 1.5], ['Gelände', o.mr, .45, .9]].map(([n, v, a, b]) => `<div class="br"><span>${n}</span><i style="--w:${Math.round(18 + 82 * clamp((v - a) / (b - a), 0, 1))}%"></i></div>`).join('')}</div>`;

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oVoice: 'voice', oAssist: 'assist', oVib: 'vib', oFar: 'far' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); SND.setVol('mus', SET.music ? .45 : 0); SND.setVol('sfx', SET.sound ? .8 : 0); if (id === 'oMusic') musicOn(R ? 'race' : 'menu'); if (id === 'oVoice' && !SET.voice) VOICE.stop(); }; }
  seg($('oLaps'), [2, 3, 5].map(v => ({ v, n: v + ' Runden' })), SET.laps, v => { SET.laps = v; saveSet(); });
  $('oName').value = SET.name; $('oName').onchange = () => { SET.name = $('oName').value.trim().slice(0, 14); saveSet(); };
  $('optX').onclick = () => closeOv('ovOpts');

  /* ---------- Oma-Auswahl ---------- */
  let FLOW = null, selI = 0;
  function openSelect() {
    const n = FLOW.n, s = FLOW.step; selI = SET.oma[s] != null && isUnl(SET.oma[s]) ? SET.oma[s] : 0;
    if (FLOW.taken && FLOW.taken.includes(selI)) selI = OMAS.findIndex((o, i) => isUnl(i) && !FLOW.taken.includes(i));
    $('selT').textContent = n > 1 ? `Spielerin ${s + 1}: Wähle deine Oma` + (s === 0 ? ' (WASD / Controller 1)' : ' (Pfeile / Controller 2)') : 'Wähle deine Oma';
    $('omaGrid').innerHTML = OMAS.map((o, i) => { const u = isUnl(i), t = FLOW.taken && FLOW.taken.includes(i); return `<button class="og nav${i === selI ? ' on' : ''}" data-i="${i}" ${u && !t ? '' : 'disabled'} style="--c:${o.walker};--d:${o.dress}"><i class="face" style="--h:${o.hair}">${o.bun === -1 ? '👴' : '👵'}</i><b>${u ? esc(o.name.replace(/^(Oma|Opa|Uroma) /, '')) : '🔒'}</b>${t ? '<small>vergeben</small>' : u ? '' : `<small>${esc(UNL[o.unlock])}</small>`}</button>`; }).join('');
    $('omaGrid').querySelectorAll('.og').forEach(b => { b.onfocus = () => { if (document.body.classList.contains('kbd')) selShow(+b.dataset.i); }; b.onclick = () => { if (+b.dataset.i === selI) return selGo(); selShow(+b.dataset.i); sfx('nav'); }; });
    scr('sSelect'); selShow(selI);
  }
  function selShow(i) {
    selI = i; const o = OMAS[i]; $('omaGrid').querySelectorAll('.og').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    $('pvName').textContent = o.name; $('pvTag').textContent = o.tag + ' – „' + o.says + '“'; $('pvStats').innerHTML = statBars(o);
    try { V.preview($('pv'), o); } catch (e) { }
  }
  function selGo() {
    sfx('ok'); SET.oma[FLOW.step] = selI; saveSet(); VOICE.say(OMAS[selI].says, true);
    if (FLOW.step + 1 < FLOW.n) { FLOW.taken = [selI]; FLOW.step++; openSelect(); return; }
    FLOW.omas = SET.oma.slice(0, FLOW.n); FLOW.taken = null; openSetup();
  }
  function selBack() { if (FLOW && FLOW.step > 0) { FLOW.step--; FLOW.taken = FLOW.step ? [SET.oma[0]] : null; openSelect(); } else toMenu(); }
  $('selGo').onclick = selGo; $('selBack').onclick = () => selBack();

  /* ---------- Rennen einstellen ---------- */
  function cards(el, list, val, cb) {
    el.innerHTML = list.map((x, i) => `<button class="cd nav${i === val ? ' on' : ''}" data-i="${i}" style="--a:${x.c1};--b:${x.c2}"><i>${x.icon}</i><b>${esc(x.n)}</b><small>${esc(x.d)}</small></button>`).join('');
    el.querySelectorAll('.cd').forEach(b => b.onclick = () => { el.querySelectorAll('.cd').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(+b.dataset.i); });
  }
  const trackCards = () => TRACKS.map(t => ({ icon: { markt: '⛪', park: '⛲', mall: '🛍️', strand: '🏖️', xmas: '🎄', grusel: '👻' }[t.theme], n: t.name, d: t.desc + (ST.best[t.id] ? ' · ⏱️ ' + fmt(ST.best[t.id]) : ''), c1: t.sky[0], c2: t.sky[2] }));
  const cupCards = () => CUPS.map((c, i) => ({ icon: c.icon, n: c.name, d: c.tracks.map(t => TRACKS[t].name).join(' · ') + (ST.cups[i] ? ' · ' + ['', '🥇', '🥈', '🥉'][ST.cups[i]] : ''), c1: ['#ffb060', '#ff7aa8', '#ffd24a'][i], c2: '#fff4dc' }));
  function openSetup() {
    const m = FLOW.mode, gp = m === 'gp';
    $('suT').textContent = { gp: '🏆 Grand Prix', single: '🏁 Einzelrennen', time: '⏱️ Zeitfahren', duo: '👵👵 Zu zweit' }[m];
    $('suWhatL').textContent = gp ? 'Cup' : 'Strecke';
    if (gp) cards($('suWhat'), cupCards(), SET.cup, v => { SET.cup = v; }); else cards($('suWhat'), trackCards(), SET.track, v => { SET.track = v; });
    $('suLvlBox').hidden = m === 'time'; seg($('suLvl'), LEVELS.map((l, i) => ({ v: i, n: l.n })), SET.level, v => { SET.level = v; $('suInfo').textContent = LEVELS[v].d; });
    $('suLapBox').hidden = gp; seg($('suLaps'), [2, 3, 5].map(v => ({ v, n: v })), SET.laps, v => { SET.laps = v; });
    $('suInfo').textContent = m === 'time' ? 'Allein auf der Strecke, ohne Gegenstände. Deine Bestzeit wird gespeichert.' : LEVELS[SET.level].d;
    scr('sSetup');
  }
  function suBack() { FLOW.step = FLOW.n - 1; FLOW.taken = FLOW.n > 1 ? [SET.oma[0]] : null; openSelect(); }
  $('suBack').onclick = () => suBack();
  $('suGo').onclick = () => {
    saveSet(); sfx('ok'); const m = FLOW.mode, src = FLOW.n > 1 ? ['kb0', 'kb1'] : ['solo'];
    const players = FLOW.omas.map((o, j) => ({ name: FLOW.n > 1 ? 'Spielerin ' + (j + 1) : (SET.name || OMAS[o].name), oma: o, src: src[j], pad: FLOW.n > 1 ? j : -1 }));
    if (m === 'gp') startGP(SET.cup, players, SET.level);
    else startRace({ mode: m, track: SET.track, laps: m === 'time' ? 3 : SET.laps, level: SET.level, players });
  };

  /* ---------- Eingaben ---------- */
  const keys = new Set();
  const KB = [{ l: ['KeyA'], r: ['KeyD'], g: ['KeyW'], b: ['KeyS'], d: ['ShiftLeft', 'KeyQ'], i: ['KeyE', 'Space'] },
    { l: ['ArrowLeft'], r: ['ArrowRight'], g: ['ArrowUp'], b: ['ArrowDown'], d: ['ShiftRight', 'KeyM', 'Slash'], i: ['Enter', 'NumpadEnter', 'Period', 'Numpad0'] }];
  const KB_SOLO = { l: [], r: [], g: [], b: [], d: ['KeyZ'], i: ['KeyX'] };
  const kbRead = sets => { const has = k => sets.some(s => s[k].some(c => keys.has(c))); return { s: (has('r') ? 1 : 0) - (has('l') ? 1 : 0), g: has('g') ? 1 : 0, b: has('b') ? 1 : 0, d: has('d'), i: has('i') }; };
  let PADS = [];
  function readPads() {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : []; } catch (e) { }
    PADS = list.map(gp => { const ax = gp.axes || [], bt = gp.buttons || [], v = k => bt[k] ? (bt[k].value || (bt[k].pressed ? 1 : 0)) : 0; let s = ax[0] || 0; s = Math.abs(s) < .14 ? 0 : Math.sign(s) * (Math.abs(s) - .14) / .86; if (v(14) > .5) s = -1; else if (v(15) > .5) s = 1; return { s, g: (v(0) > .5 || v(7) > .5 || v(12) > .5) ? 1 : 0, b: (v(6) > .5 || v(1) > .5 || v(13) > .5) ? 1 : 0, d: v(5) > .5 || v(2) > .5, i: v(4) > .5 || v(3) > .5, start: v(9) > .5 }; });
  }
  const TOUCH = { s: 0, g: 0, b: 0, d: 0, i: 0, used: false };
  OmaTouch.build($('tpad'), TOUCH);
  function inputFor(p) {
    if (p.src === 'net') { const n = p.net; if (!n) return { s: 0, g: 1, b: 0, d: false, i: false }; const use = n.itemQ > 0; if (use) n.itemQ--; return { s: n.in.s || 0, g: n.in.g ? 1 : 0, b: n.in.b ? 1 : 0, d: !!n.in.d, i: use, itemPress: use }; }
    const sets = p.src === 'kb0' ? [KB[0]] : p.src === 'kb1' ? [KB[1]] : KB.concat(KB_SOLO), k = kbRead(sets), out = { s: k.s, g: k.g, b: k.b, d: k.d, i: k.i };
    const pads = p.src === 'solo' ? PADS : PADS[p.pad] ? [PADS[p.pad]] : [];
    for (const q of pads) { out.s += q.s; out.g = out.g || q.g; out.b = out.b || q.b; out.d = out.d || q.d; out.i = out.i || q.i; }
    if (p.src === 'solo' && TOUCH.used) { out.s += TOUCH.s; out.g = out.g || TOUCH.g; out.b = out.b || TOUCH.b; out.d = out.d || !!TOUCH.d; out.i = out.i || !!TOUCH.i; }
    out.s = clamp(out.s, -1, 1); return out;
  }

  /* ---------- Grand Prix ---------- */
  let GP = null;
  function startGP(cup, players, level) {
    const used = players.map(p => p.oma), pool = OMAS.map((_, i) => i).filter(i => !used.includes(i));
    GP = { cup, i: 0, level, players, bots: pool.slice(0, 8 - players.length), pts: {} };
    OMAS.forEach((_, i) => { GP.pts[i] = 0; });
    gpRace();
  }
  function gpRace() { const c = CUPS[GP.cup]; startRace({ mode: 'gp', track: c.tracks[GP.i], laps: 3, level: GP.level, players: GP.players, bots: GP.bots, gpName: c.icon + ' ' + c.name + ' · Rennen ' + (GP.i + 1) + '/' + c.tracks.length }); }

  /* ---------- Rennen ---------- */
  let R = null, raceCfg = null;
  function startRace(cfg) {
    raceCfg = cfg; endRaceView(); stopDemo();
    const def = TRACKS[cfg.track], tr = Track.build(def), humans = cfg.players.slice(0, 4), lvl = LEVELS[cfg.level || 0];
    const used = humans.map(p => p.oma);
    let bots = cfg.mode === 'time' ? [] : (cfg.bots || OMAS.map((_, i) => i).filter(i => !used.includes(i))).slice(0, 8 - humans.length);
    for (let i = bots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bots[i], bots[j]] = [bots[j], bots[i]]; }
    if (cfg.mode === 'gp' && GP && GP.i > 0) bots.sort((a, b) => GP.pts[a] - GP.pts[b]);   // Führende starten hinten
    const racers = bots.map(o => ({ name: OMAS[o].name, kart: o, human: false, skill: lvl.skill, color: OMAS[o].bag }))
      .concat(humans.map(p => ({ name: p.name, kart: p.oma, human: true, assist: SET.assist ? (p.src === 'net' || (p.src === 'solo' && coarse()) ? .6 : .3) : 0, color: '#ff2d95' })));
    const S = Sim.create({ track: tr, laps: cfg.laps || 3, racers, items: cfg.mode !== 'time', shuffle: false });
    const hk = humans.map((_, j) => bots.length + j);
    const views = hk.slice(0, 4);
    R = { cfg, def, tr, S, hk, humans, views, acc: 0, end: 0, said: {}, lead: {}, msgs: hk.map(() => ({ t: 0 })), lastRank: hk.map(() => 9), fps: [], lowT: 0, paused: false, speed: A.speed };
    humans.forEach((p, j) => { if (p.net) p.net.k = hk[j]; });
    V.setTrack(def, tr); V.setupRace(S, views);
    buildHud(); scr('sRace'); document.body.classList.add('racing');
    $('hud').hidden = false; $('mini').hidden = false; $('bPause').hidden = false;
    $('tpad').hidden = !(humans.length === 1 && humans[0].src === 'solo' && coarse());
    if (!$('tpad').hidden) TOUCH.used = true; document.body.classList.toggle('tpad', !$('tpad').hidden);
    musicOn('race'); if (SET.sound) SND.engine(true);
    intro((cfg.gpName ? cfg.gpName + ' · ' : '') + def.name, def.desc);
    netRaceStart();
  }
  function endRaceView() { if (!R) return; R = null; SND.engine(false); $('hud').hidden = true; $('mini').hidden = true; $('cnt').hidden = true; $('intro').hidden = true; $('bPause').hidden = true; $('tpad').hidden = true; OmaTouch.reset(); document.body.classList.remove('racing', 'tpad'); closeAllOv(); }
  // HUD je Bildschirmteil
  function buildHud() {
    const n = R.views.length;
    $('hud').innerHTML = R.views.map((k, v) => `<div class="vp" id="vp${v}"><div class="pos" id="hp${v}"></div><div class="lap" id="hl${v}"></div><div class="slot" id="hi${v}"></div><div class="spd" id="hs${v}"></div><div class="msg" id="hm${v}"></div><div class="bub" id="hb${v}" hidden></div><div class="fog" id="hf${v}"></div>${n > 1 ? `<div class="who">${esc(R.humans[v].name)}</div>` : ''}</div>`).join('') + '<div class="tm" id="hTime"></div>';
    $('hud').className = 'n' + n; layoutHud(); miniPrep();
  }
  function layoutHud() {
    if (!R) return; const W = innerWidth, H = innerHeight, rs = V.rects(R.views.length, W, H);
    rs.forEach((r, v) => { const e = $('vp' + v); if (e) Object.assign(e.style, { left: r[0] + 'px', top: (H - r[1] - r[3]) + 'px', width: r[2] + 'px', height: r[3] + 'px' }); });
  }
  let miniBg = null, miniSc = 1, miniOx = 0, miniOz = 0;
  function miniPrep() {
    const c = $('mini'), s = Math.round(Math.min(150, Math.max(96, Math.min(innerWidth, innerHeight) * .22))), tr = R.tr; c.width = c.height = s;
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < tr.N; i++) { x0 = Math.min(x0, tr.P[i * 2]); x1 = Math.max(x1, tr.P[i * 2]); z0 = Math.min(z0, tr.P[i * 2 + 1]); z1 = Math.max(z1, tr.P[i * 2 + 1]); }
    miniSc = (s - 16) / Math.max(x1 - x0, z1 - z0); miniOx = (s - (x1 - x0) * miniSc) / 2 - x0 * miniSc; miniOz = (s - (z1 - z0) * miniSc) / 2 - z0 * miniSc;
    miniBg = document.createElement('canvas'); miniBg.width = miniBg.height = s; const g = miniBg.getContext('2d');
    g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 9; g.beginPath(); for (let i = 0; i <= tr.N; i++) { const j = i % tr.N; g[i ? 'lineTo' : 'moveTo'](tr.P[j * 2] * miniSc + miniOx, tr.P[j * 2 + 1] * miniSc + miniOz); } g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#ff2d95'; g.fillRect(tr.P[0] * miniSc + miniOx - 3, tr.P[1] * miniSc + miniOz - 3, 6, 6);
  }
  function miniDraw() {
    const c = $('mini'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(miniBg, 0, 0);
    R.S.karts.forEach(k => { const h = R.hk.indexOf(k.k), x = k.x * miniSc + miniOx, z = k.z * miniSc + miniOz; g.fillStyle = h >= 0 ? ['#ff2d95', '#00e5ff', '#ffd24a', '#7cff6a'][h] : OMAS[k.kart].walker; g.beginPath(); g.arc(x, z, h >= 0 ? 5 : 3.4, 0, 7); g.fill(); if (h >= 0) { g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke(); } });
  }
  let bannerT = 0;
  function banner(t, ms) { const c = $('cnt'); c.textContent = t; c.hidden = false; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); clearTimeout(bannerT); bannerT = setTimeout(() => { c.hidden = true; }, ms || 1200); }
  let introT = 0;
  function intro(t, d) { const e = $('intro'); e.innerHTML = '<b>' + esc(t) + '</b><small>' + esc(d || '') + '</small>'; e.hidden = false; clearTimeout(introT); introT = setTimeout(() => { e.hidden = true; }, 3000); }
  function hmsg(j, t, sec) { const v = R.views.indexOf(R.hk[j]); if (v < 0) return; const e = $('hm' + v); if (!e) return; e.textContent = t; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); R.msgs[j].t = sec || 1.4; }
  function bubble(j, line) { const v = R.views.indexOf(R.hk[j]); if (v < 0) return; const e = $('hb' + v); e.textContent = OMAS[R.S.karts[R.hk[j]].kart].name + ': „' + line + '“'; e.hidden = false; R.msgs[j].b = 2.6; VOICE.say(line); }
  function oSay(j, grp, p) { if (Math.random() < (p == null ? 1 : p)) bubble(j, pick(SAYS[grp])); }
  const CRE = { park: '🐦 TAUBEN-ANGRIFF!', strand: '🐦 MÖWEN!', grusel: '👻 BUUUH!' };
  function onEvent(e) {
    const S = R.S, j = e.k != null ? R.hk.indexOf(e.k) : -1;
    switch (e.t) {
      case 'go': banner('LOS!', 900); sfx('go'); R.humans.forEach((_, i) => R.views.length < 2 && oSay(i, 'boost', .5)); break;
      case 'box': if (j >= 0) sfx('box'); break;
      case 'got': if (j >= 0) { sfx('got'); const it = ITEMS[e.item.replace('3', '')]; hmsg(j, it.icon + ' ' + it.n + (e.item.endsWith('3') ? ' ×3' : ''), 1.4); } break;
      case 'use': if (j >= 0) { sfx(e.item === 'boost' ? 'boost' : e.item === 'flash' ? 'whistle' : 'use'); if (e.item !== 'boost') oSay(j, 'use', .35); else oSay(j, 'boost', .35); } break;
      case 'hit': if (j >= 0) { sfx(e.kind === 'banana' ? 'slip' : 'hit'); vib(120); hmsg(j, { banana: '🦷 AUF DEM GEBISS AUSGERUTSCHT!', rock: '👜 HANDTASCHE AN DEN KOPF!', rocket: '🍫 PRALINEN-TREFFER!', mine: '🧶 VERHEDDERT!', flash: '📢 PFIIIEP!', creature: CRE[R.def.theme] || 'AUTSCH!' }[e.kind] || 'AUTSCH!', 1.6); oSay(j, 'hit', .7); netEv(j, 'hit'); }
        else if (e.by != null && R.hk.includes(e.by)) { const a = R.hk.indexOf(e.by); hmsg(a, '🎯 TREFFER! ' + OMAS[S.karts[e.k].kart].name, 1.3); sfx('ok'); } break;
      case 'shieldHit': if (j >= 0) { sfx('shield'); hmsg(j, '☂️ ABGEWEHRT!', 1.2); } break;
      case 'miniturbo': if (j >= 0) { sfx('turbo', e.tier || 1); if ((e.tier || 0) >= 2) oSay(j, 'boost', .3); } break;
      case 'pad': if (j >= 0) sfx('boost'); break;
      case 'portal': if (j >= 0) { sfx('boost'); hmsg(j, R.def.theme === 'mall' ? '🛗 ROLLTREPPE – ABKÜRZUNG!' : '🌀 ABKÜRZUNG!', 1.3); } break;
      case 'creature': if (j >= 0) sfx('pigeon'); break;
      case 'wall': if (j >= 0 && e.v > 9) { sfx('wall'); vib(30); } break;
      case 'bump': if (j >= 0 || R.hk.includes(e.o)) sfx('wall'); break;
      case 'splat': case 'boom': case 'smash': { const near = R.views.some(ki => { const k = S.karts[ki]; return (k.x - e.x) ** 2 + (k.z - e.z) ** 2 < 3600; }); if (near) sfx('boom'); break; }
      case 'lap': if (j >= 0) { const k = S.karts[e.k]; if (k.lap === S.laps) { hmsg(j, '🔔 LETZTE RUNDE!', 2); sfx('lap'); } else { hmsg(j, 'Runde ' + k.lap + '/' + S.laps + ' · ' + fmt(e.time), 1.6); sfx('lap'); } } break;
      case 'finish': if (j >= 0) { const k = S.karts[e.k]; sfx(k.rank <= 3 ? 'fin' : 'lose'); hmsg(j, k.rank === 1 ? '🏆 SIEG!' : 'ZIEL! Platz ' + k.rank, 5); oSay(j, k.rank <= 3 ? 'win' : 'lose', 1); netEv(j, 'fin', k.rank); } break;
    }
  }
  function updateHud(dt) {
    const S = R.S;
    R.views.forEach((ki, v) => {
      const k = S.karts[ki], j = R.hk.indexOf(ki);
      $('hp' + v).innerHTML = `${k.rank}<small>/${S.karts.length}</small>`; $('hp' + v).className = 'pos r' + Math.min(4, k.rank);
      $('hl' + v).textContent = R.cfg.mode === 'time' ? 'Runde ' + clamp(k.lap, 1, S.laps) + '/' + S.laps : 'Runde ' + clamp(k.lap, 1, S.laps) + '/' + S.laps;
      const roll = k.itemT > 0 && k.itemPending; $('hi' + v).textContent = roll ? pick(Object.values(ITEMS)).icon : itemIcon(k.item) + (k.itemN > 1 ? '×' + k.itemN : ''); $('hi' + v).classList.toggle('roll', !!roll); $('hi' + v).hidden = !S.items;
      $('hs' + v).textContent = Math.round(Math.max(0, k.vf) * 3.1) + ' km/h' + (k.boostT > 0 ? ' 🚀' : '');
      $('hf' + v).style.opacity = k.blindT > 0 ? Math.min(.85, k.blindT / 2) : 0;
      const m = R.msgs[j]; if (m.t > 0) { m.t -= dt; if (m.t <= 0) $('hm' + v).textContent = ''; } if (m.b > 0) { m.b -= dt; if (m.b <= 0) $('hb' + v).hidden = true; }
      if (S.state === 'race' && !k.finished) { if (k.rank === 1 && R.lastRank[j] > 1 && S.t > 6) oSay(j, 'lead', .6); R.lastRank[j] = k.rank; }
    });
    if (!$('tpad').hidden) { const k = S.karts[R.views[0]], t = itemIcon(k.item) || '★'; if (R.tIt !== t) { R.tIt = t; $('tpad').querySelector('.tb-i i').textContent = t; } }
    const k0 = S.karts[R.views[0]]; $('hTime').textContent = S.state === 'grid' ? '' : fmt(R.cfg.mode === 'time' ? S.t : S.t);
    if (S.state === 'grid') { const c = Math.ceil(S.count); if (c !== R.lastC && c <= 3 && c >= 1) { R.lastC = c; banner(String(c), 800); sfx('count'); } }
    if (SET.sound) SND.engineSet(Math.max(0, k0.vf), k0.boostT > 0);
    miniDraw();
  }
  const snap = S => { for (const k of S.karts) { k.px = k.x; k.pz = k.z; k.pth = k.th; } };
  function raceFrame(dt) {
    const S = R.S; readPads();
    PADS.forEach((q, i) => { if (q.start && !(R.padStart || [])[i]) pause(); }); R.padStart = PADS.map(q => q.start);
    if (!R.paused) {
      R.acc += dt * R.speed; let n = 0; const cap = Math.max(5, Math.ceil(R.speed * 5));
      while (R.acc >= 1 / 60 && n++ < cap) { R.acc -= 1 / 60; snap(S); const inp = []; R.humans.forEach((p, j) => { inp[R.hk[j]] = inputFor(p); if (p.src === 'net') { const k = S.karts[R.hk[j]], gone = !p.net || p.net.gone; if (k.base == null) k.base = k.assist; k.assist = gone ? 1 : k.base; if (gone) inp[R.hk[j]] = { s: 0, g: 1, b: 0, d: false, i: false }; } }); Sim.step(S, 1 / 60, inp); S.events.forEach(onEvent); if (!R) return; }
      if (R.acc > 1 / 30) R.acc = 0;
      updateHud(dt); netPush(dt);
      if (S.state === 'done') { R.end += dt; if (R.end > 2.6) return finishRace(); }
    }
    V.render(S, dt, R.paused ? 1 : clamp(R.acc * 60, 0, 1), R.views, A.cam || (SET.far ? 'far' : 'near'));
    // Leistung: bei dauerhaft wenig Bildern pro Sekunde Auflösung senken
    R.fps.push(dt); if (R.fps.length > 90) { const avg = R.fps.reduce((a, b) => a + b, 0) / R.fps.length; R.fps.length = 0; if (avg > 1 / 38 && R.lowT < 3) { R.lowT++; V.lowerQuality(); } }
  }
  function pause() { if (!R || R.paused || R.end) return; R.paused = true; SND.engine(false); openOv('ovPause'); }
  function resume() { if (!R) return; closeOv('ovPause'); R.paused = false; if (SET.sound) SND.engine(true); }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume();
  $('paRe').onclick = () => { closeAllOv(); if (raceCfg) startRace(raceCfg); };
  $('paOpt').onclick = () => openOv('ovOpts');
  $('paQuit').onclick = () => { closeAllOv(); if (NETH.on) { endRaceView(); lobbyBack(); } else { GP = null; toMenu(); } };

  /* ---------- Ergebnis / Game Over ---------- */
  function finishRace() {
    const S = R.S, cfg = R.cfg, res = Sim.results(S), hk = R.hk, humans = R.humans, def = R.def;
    endRaceView(); musicOn('win');
    const me = res.find(r => r.k.k === hk[0]), pos = me ? me.pos : 8, local = !NETH.on || humans[0].src !== 'net';
    let sub = '', earned = 0, rec = false;
    if (cfg.mode === 'time') {
      const t = me.k.finT, best = ST.best[def.id]; rec = !best || t < best; if (rec) ST.best[def.id] = t;
      sub = (rec ? '🎉 NEUE BESTZEIT! ' : 'Bestzeit: ' + fmt(best) + ' · ') + 'Deine Zeit: ' + fmt(t) + (me.best ? ' · Schnellste Runde ' + fmt(me.best) : '');
    } else if (local) {
      earned = POINTS[pos - 1] * ((cfg.level || 0) + 1); ST.pts += earned; ST.races++; if (pos === 1) ST.wins++; if (pos <= 3) { ST.podiums++; if (!ST.unl[0]) { ST.unl[0] = true; unlockToast(0); } }
      sub = (pos === 1 ? '🏆 Sieg! ' : pos <= 3 ? '🥉 Podest! ' : '') + 'Platz ' + pos + ' · +' + earned + ' Karriere-Punkte (gesamt ' + ST.pts + ')';
    }
    if (cfg.mode === 'gp') res.forEach(r => { GP.pts[r.k.kart] += POINTS[r.pos - 1]; });
    saveSt();
    $('reT').textContent = cfg.mode === 'time' ? '⏱️ Zeitfahren' : pos === 1 && humans.length === 1 ? '🏆 SIEG!' : 'ZIELEINLAUF';
    $('reSub').textContent = (cfg.gpName ? cfg.gpName + ' · ' : '') + def.name + (sub ? ' — ' + sub : '');
    $('reTab').innerHTML = res.map(r => { const h = hk.indexOf(r.k.k); return `<div class="tr${h >= 0 ? ' me' : ''}"><b>${r.pos}.</b><span>${h >= 0 ? '★ ' : ''}${esc(h >= 0 ? humans[h].name + (humans[h].name !== OMAS[r.k.kart].name ? ' (' + OMAS[r.k.kart].name + ')' : '') : r.k.name)}</span><em>${r.finished ? fmt(r.time) : '~' + fmt(r.time)}</em>${cfg.mode === 'gp' ? `<i>+${POINTS[r.pos - 1]} · ${GP.pts[r.k.kart]}</i>` : ''}</div>`; }).join('');
    const btn = (id, t, pri) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`;
    const gpLast = cfg.mode === 'gp' && GP.i + 1 >= CUPS[GP.cup].tracks.length;
    $('reBtns').innerHTML = cfg.mode === 'gp' ? btn('reQuit', '✕ Aufhören') + btn('reNext', gpLast ? '🏆 Siegerehrung' : '▶ Nächstes Rennen', true)
      : NETH.on ? btn('reLobby', '← Zur Lobby') + btn('reAgain', '↻ Nochmal', true) : btn('reMenu', '☰ Menü') + btn('reAgain', '↻ Nochmal', true);
    const on = (id, f) => { const e = $(id); if (e) e.onclick = () => { sfx('ok'); f(); }; };
    on('reNext', () => { if (gpLast) podium(); else { GP.i++; gpRace(); } });
    on('reQuit', () => { GP = null; NETH.on ? lobbyBack() : toMenu(); });
    on('reAgain', () => startRace(raceCfg)); on('reMenu', () => toMenu()); on('reLobby', () => lobbyBack());
    scr('sResult'); netResults(res);
    if (cfg.mode !== 'time' && local) setTimeout(() => VOICE.say(pick(SAYS[pos <= 3 ? 'win' : 'lose']), true), 400);
  }
  function unlockToast(u) { const o = OMAS.find(x => x.unlock === u); if (o) setTimeout(() => toast('🔓 Neue Oma freigeschaltet: ' + o.name + '!', 4200), 900); }
  function podium() {
    const order = Object.keys(GP.pts).map(Number).filter(i => GP.bots.includes(i) || GP.players.some(p => p.oma === i)).sort((a, b) => GP.pts[b] - GP.pts[a]);
    const place = order.indexOf(GP.players[0].oma) + 1, local = GP.players[0].src !== 'net';
    $('poBox').innerHTML = [1, 0, 2].map(r => { const o = order[r]; if (o == null) return ''; const h = GP.players.findIndex(p => p.oma === o); return `<div class="pd p${r + 1}"><i>${OMAS[o].bun === -1 ? '👴' : '👵'}</i><b>${esc(h >= 0 ? GP.players[h].name : OMAS[o].name)}</b><small>${GP.pts[o]} Pkt.</small><div class="blk" style="--c:${OMAS[o].walker}">${r + 1}</div></div>`; }).join('');
    if (local && place >= 1 && place <= 3) { const old = ST.cups[GP.cup]; if (!old || place < old) ST.cups[GP.cup] = place; if (place === 1 && !ST.unl[GP.cup + 1]) { ST.unl[GP.cup + 1] = true; unlockToast(GP.cup + 1); } }
    saveSt();
    $('poT').textContent = place === 1 ? '🏆 ' + CUPS[GP.cup].name + ' gewonnen!' : '🏁 ' + CUPS[GP.cup].name + ' – Endstand';
    $('poSub').textContent = place === 1 ? 'Oma hat den Pokal! Jetzt gibt es Kaffee und Kuchen. ☕🍰' : place <= 3 ? 'Platz ' + place + ' – ab aufs Treppchen!' : 'Platz ' + place + ' – nächstes Mal klappt das mit dem Pokal.';
    $('poAgain').onclick = () => { const g = GP; startGP(g.cup, g.players, g.level); };
    $('poMenu').onclick = () => { GP = null; NETH.on ? lobbyBack() : toMenu(); };
    scr('sPodium'); sfx('fin'); netAll({ t: 'st', ph: 'res', msg: place === 1 ? 'Pokal gewonnen!' : 'Endstand' });
  }

  /* ---------- Menü-Hintergrund: Computer-Omas fahren Probe ---------- */
  let DEMO = null;
  function demo() {
    if (R) return; const ti = Math.floor(Math.random() * TRACKS.length), def = TRACKS[ti], tr = Track.build(def);
    const S = Sim.create({ track: tr, laps: 99, racers: OMAS.map((o, i) => ({ name: o.name, kart: i, human: false, skill: 1 })), items: true, shuffle: true, free: true });
    V.setTrack(def, tr); V.setupRace(S, []); DEMO = { S };
  }
  function stopDemo() { DEMO = null; }

  /* ---------- Hauptschleife ---------- */
  const A = { speed: 1 };
  let lastT = performance.now(), padPrev = [], padNavT = 0, padDir = null;
  function frame(now) {
    const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    try {
      if (R) { raceFrame(dt); if (R && R.paused) menuPad(dt); }
      else {
        if (DEMO && document.visibilityState === 'visible') { const S = DEMO.S; snap(S); Sim.step(S, 1 / 60, []); V.renderMenu(dt, S); }
        if (cur === 'sSelect') V.previewFrame(dt);
        menuPad(dt);
      }
      if (cur === 'sPhone') phoneTick(dt);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  function menuPad(dt) {
    readPads(); const q = PADS[0]; if (!q) return; document.body.classList.add('kbd');
    const now = PADS.map(p => p), pressed = (i, k) => now[i] && now[i][k] && !(padPrev[i] && padPrev[i][k]);
    let raw = null; try { raw = Array.from(navigator.getGamepads()).find(p => p && p.connected); } catch (e) { }
    const b = raw ? raw.buttons : [], ax = raw ? raw.axes : [], bp = k => !!(b[k] && b[k].pressed);
    let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0; if (bp(14)) x = -1; if (bp(15)) x = 1; if (bp(12)) z = -1; if (bp(13)) z = 1;
    const key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padNavT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padNavT = key !== padDir ? .35 : .14; }
    padDir = key; padNavT -= dt;
    const cur2 = { a: bp(0), b: bp(1), st: bp(9) };
    if (cur2.a && !menuPad.a) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
    if (cur2.b && !menuPad.b) back(); if (cur2.st && !menuPad.st) { if (cur === 'sTitle') pressStart(); else if (R && R.paused) resume(); }
    menuPad.a = cur2.a; menuPad.b = cur2.b; menuPad.st = cur2.st; padPrev = now; void pressed;
  }
  addEventListener('keydown', e => {
    keys.add(e.code); document.body.classList.add('kbd');
    if (R && !R.paused && /^(Arrow|Space)/.test(e.code)) e.preventDefault();
    if (e.code === 'Escape' || (e.code === 'KeyP' && R)) { e.preventDefault(); back(); return; }
    if (R && !overlays().length) return;
    if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.code)) { if (e.code === 'Enter' && cur === 'sPhone') phoneJoin(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  addEventListener('resize', () => { V.resize(innerWidth, innerHeight); layoutHud(); if (R) miniPrep(); });
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && R && !NETH.on) pause(); });
  function pressStart() { SND.ctx(); sfx('ok'); scr('sMenu'); menuStat(); musicOn('menu'); try { if (window.EasyGamesKit && EasyGamesKit.fullscreenOnInput && coarse()) EasyGamesKit.fullscreenOnInput(); } catch (e) { } }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; if (cur === 'sTitle' && e.target.id !== 'bPress' && !e.target.closest('#bPress')) pressStart(); });

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'omarenn-';
    const N = { role: '', code: '', peer: null, conns: new Map() }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    N.host = async function () {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null;
  function netClose() { if (NET) NET.close(); NET = null; NETH.on = false; NETH.seats = []; PH.on = false; }

  /* ---------- Fernseher / Gastgeber ---------- */
  const NETH = { on: false, seats: [], mode: 'single', pushT: 0 };   // seats: { peer, cid, name, oma, in, itemQ, gone, k }
  function openLobby() {
    netClose(); stopDemo(); NETH.on = true; NETH.seats = []; scr('sLobby'); lobbyUi();
    $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Raum wird eröffnet …';
    NET = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    NET.host().then(async code => {
      $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Handy: Kamera auf den QR-Code oder Code eingeben. Freie Plätze fahren Computer-Omas.';
      try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; }
    }).catch(e => { $('lobbyMsg').textContent = netErr(e); });
  }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbBack').onclick = () => { netClose(); toMenu(); };
  $('lbMe').checked = !!SET.lbMe; $('lbMe').onchange = () => { SET.lbMe = $('lbMe').checked; saveSet(); lobbyUi(); };
  function lobbyUi() {
    seg($('lbMode'), [{ v: 'single', n: '🏁 Einzelrennen' }, { v: 'gp', n: '🏆 Grand Prix' }], NETH.mode, v => { NETH.mode = v; lobbyUi(); });
    seg($('lbLvl'), LEVELS.map((l, i) => ({ v: i, n: l.n })), SET.level, v => { SET.level = v; saveSet(); });
    if (NETH.mode === 'gp') cards($('lbWhat'), cupCards(), SET.cup, v => { SET.cup = v; saveSet(); }); else cards($('lbWhat'), trackCards(), SET.track, v => { SET.track = v; saveSet(); });
    lobbyList();
  }
  function lobbyList() {
    const me = SET.lbMe ? [{ name: (SET.name || 'Ich') + ' (hier)', oma: SET.oma[0] }] : [], all = me.concat(NETH.seats.filter(s => !s.gone));
    $('lobbyList').innerHTML = [0, 1, 2, 3].map(i => { const s = all[i]; return s ? `<div class="seat on"><i>${OMAS[s.oma].bun === -1 ? '👴' : '👵'}</i><b>${esc(s.name)}</b><small>${esc(OMAS[s.oma].name)}</small></div>` : `<div class="seat"><i>🤖</i><b>Frei</b><small>Computer-Oma</small></div>`; }).join('');
    $('lbGo').disabled = !all.length;
    NET && NET.send({ t: 'lob', n: all.length, taken: all.map(s => s.oma) });
  }
  const freeOma = (want, skip) => { const taken = (SET.lbMe ? [SET.oma[0]] : []).concat(NETH.seats.filter(s => s !== skip && !s.gone).map(s => s.oma)); if (!taken.includes(want)) return want; const f = OMAS.findIndex((o, i) => !taken.includes(i)); return f < 0 ? want : f; };
  function hostMsg(id, m) {
    let s = NETH.seats.find(x => x.peer === id);
    if (m.t === 'hi') {
      const cid = String(m.cid || '').slice(0, 16), back = NETH.seats.find(x => x.cid && x.cid === cid);
      if (back) { back.peer = id; back.gone = false; back.in = {}; back.itemQ = 0; NET.sendTo(id, { t: 'wel', name: back.name, oma: back.oma, ph: R ? 'race' : 'lobby' }); lobbyList(); return; }
      if (R && R.humans.some(p => p.src === 'net')) return NET.sendTo(id, { t: 'full', msg: 'Das Rennen läuft schon – nach dem Rennen kannst du einsteigen.' });
      if (NETH.seats.filter(x => !x.gone).length + (SET.lbMe ? 1 : 0) >= 4) return NET.sendTo(id, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
      NETH.seats = NETH.seats.filter(x => !x.gone);
      s = { peer: id, cid, name: String(m.name || 'Oma').slice(0, 14), oma: 0, in: {}, itemQ: 0, gone: false }; s.oma = freeOma(clamp(m.oma | 0, 0, 7), s); NETH.seats.push(s);
      NET.sendTo(id, { t: 'wel', name: s.name, oma: s.oma, ph: 'lobby' }); toast('📱 ' + s.name + ' fährt mit!'); sfx('honk'); lobbyList(); return;
    }
    if (!s) return;
    if (m.t === 'in') { s.in = { s: clamp(+m.s || 0, -1, 1), g: m.g ? 1 : 0, b: m.b ? 1 : 0, d: !!m.d }; }
    else if (m.t === 'it') { if (s.itemQ < 2) s.itemQ++; }
    else if (m.t === 'oma' && !R) { s.oma = freeOma(clamp(m.oma | 0, 0, 7), s); NET.sendTo(id, { t: 'wel', name: s.name, oma: s.oma, ph: 'lobby' }); lobbyList(); }
    else if (m.t === 'go') { const b = cur === 'sLobby' ? $('lbGo') : cur === 'sResult' ? $('reBtns').querySelector('.pri') : cur === 'sPodium' ? $('poMenu') : null; if (b && !b.disabled) b.click(); }
  }
  function hostLeave(id) { const s = NETH.seats.find(x => x.peer === id); if (!s) return; s.gone = true; if (R) toast('📴 ' + s.name + ' ist weg – eine Computer-Oma fährt weiter'); else { NETH.seats = NETH.seats.filter(x => x !== s); lobbyList(); } }
  $('lbGo').onclick = () => {
    const ps = (SET.lbMe ? [{ name: SET.name || 'Ich', oma: SET.oma[0], src: 'solo', pad: -1 }] : []).concat(NETH.seats.filter(s => !s.gone).map(s => ({ name: s.name, oma: s.oma, src: 'net', net: s })));
    if (!ps.length) return; sfx('ok');
    if (NETH.mode === 'gp') startGP(SET.cup, ps, SET.level); else startRace({ mode: 'single', track: SET.track, laps: SET.laps, level: SET.level, players: ps });
  };
  function lobbyBack() { GP = null; endRaceView(); NETH.seats = NETH.seats.filter(s => !s.gone); scr('sLobby'); lobbyUi(); netAll({ t: 'st', ph: 'lobby' }); musicOn('menu'); }
  const netAll = m => { if (NET && NETH.on) NET.send(m); };
  function netRaceStart() { if (!NETH.on || !R) return; R.humans.forEach((p, j) => { if (p.net) NET.sendTo(p.net.peer, { t: 'st', ph: 'race', pos: R.S.karts[R.hk[j]].rank, n: R.S.karts.length, lap: 1, laps: R.S.laps, track: R.def.name }); }); }
  function netPush(dt) {
    if (!NETH.on || !R) return; NETH.pushT -= dt; if (NETH.pushT > 0) return; NETH.pushT = .15;
    R.humans.forEach((p, j) => { if (!p.net || p.net.gone) return; const k = R.S.karts[R.hk[j]]; NET.sendTo(p.net.peer, { t: 'st', ph: R.S.state === 'grid' ? 'grid' : 'race', pos: k.rank, n: R.S.karts.length, lap: clamp(k.lap, 1, R.S.laps), laps: R.S.laps, item: itemIcon(k.item) + (k.itemN > 1 ? '×' + k.itemN : ''), roll: k.itemT > 0 && !!k.itemPending, fin: k.finished }); });
  }
  function netEv(j, e, pos) { const p = R && R.humans[j]; if (p && p.net && NET) NET.sendTo(p.net.peer, { t: 'ev', e, pos }); }
  function netResults(res) { if (!NETH.on) return; NETH.seats.forEach(s => { const r = res.find(x => x.k.kart === s.oma && R === null); NET.sendTo(s.peer, { t: 'st', ph: 'res', pos: r ? r.pos : 0, msg: r ? 'Platz ' + r.pos : 'Ziel' }); }); }

  /* ---------- Handy als Lenkrad ---------- */
  const PH = { on: false, oma: 0, ph: '', st: { s: 0, g: 0, b: 0, d: 0, i: 0 }, sendT: 0, last: '', tilt: false, inv: false, tv: 0, cid: '', itemPrev: 0 };
  try { PH.cid = localStorage.getItem(P + 'cid') || ''; } catch (e) { } if (!/^[a-z0-9]{8,16}$/.test(PH.cid)) { PH.cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem(P + 'cid', PH.cid); } catch (e) { } }
  function phoneScreen(code) {
    netClose(); stopDemo(); PH.oma = SET.oma[0] || 0; $('pJoin').hidden = false; $('pCtl').hidden = true; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Den Code zeigt der Fernseher bei „🌐 Online & Handys“.';
    $('jOmas').innerHTML = OMAS.map((o, i) => `<button class="og nav${i === PH.oma ? ' on' : ''}" data-i="${i}" style="--c:${o.walker};--d:${o.dress}"><i class="face">${o.bun === -1 ? '👴' : '👵'}</i><b>${esc(o.name.replace(/^(Oma|Opa|Uroma) /, ''))}</b></button>`).join('');
    $('jOmas').querySelectorAll('.og').forEach(b => b.onclick = () => { PH.oma = +b.dataset.i; $('jOmas').querySelectorAll('.og').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); if (PH.on && NET) NET.send({ t: 'oma', oma: PH.oma }); });
    scr('sPhone');
  }
  async function phoneJoin() {
    const code = ($('jCode').value || '').trim(), name = ($('jName').value || '').trim().slice(0, 14) || OMAS[PH.oma].name;
    SET.name = $('jName').value.trim().slice(0, 14); SET.oma[0] = PH.oma; saveSet();
    $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; SND.ctx();
    NET = mkNet({ onMsg: phoneMsg, onLeave: () => { if (PH.on) { $('cStat').textContent = '📴 Verbindung weg – verbinde neu …'; setTimeout(() => { if (PH.on) phoneJoin(); }, 1500); } } });
    try { await NET.join(code); PH.on = true; PH.name = name; NET.send({ t: 'hi', name, oma: PH.oma, cid: PH.cid }); }
    catch (e) { $('jMsg').textContent = netErr(e); PH.on = false; }
    $('jGo').disabled = false;
  }
  $('jGo').onclick = () => phoneJoin(); $('jBack').onclick = () => { netClose(); toMenu(); };
  function phoneMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; PH.on = false; $('pJoin').hidden = false; $('pCtl').hidden = true; return; }
    if (m.t === 'wel') { PH.oma = m.oma; $('pJoin').hidden = true; $('pCtl').hidden = false; $('cName').textContent = (OMAS[m.oma].bun === -1 ? '👴 ' : '👵 ') + m.name + ' · ' + OMAS[m.oma].name; phoneSt({ ph: m.ph }); try { if (window.EasyGamesKit && EasyGamesKit.keepAwake) EasyGamesKit.keepAwake(); } catch (e) { } vib(40); return; }
    if (m.t === 'lob') { if (PH.ph === 'lobby' || !PH.ph) $('cStat').textContent = '✅ Dabei! ' + m.n + '/4 Spielerinnen – warte auf den Start …'; return; }
    if (m.t === 'st') return phoneSt(m);
    if (m.t === 'ev') { if (m.e === 'hit') { vib([60, 40, 90]); $('pCtl').classList.remove('hit'); void $('pCtl').offsetWidth; $('pCtl').classList.add('hit'); } else if (m.e === 'fin') { vib([80, 60, 80, 60, 200]); $('cStat').textContent = m.pos === 1 ? '🏆 SIEG!' : '🏁 Ziel – Platz ' + m.pos; } }
  }
  function phoneSt(m) {
    PH.ph = m.ph; const go = $('cGo');
    go.hidden = !(m.ph === 'lobby' || m.ph === 'res'); go.textContent = m.ph === 'lobby' ? '🏁 Rennen starten' : '▶ Weiter';
    $('pCtl').classList.toggle('racing', m.ph === 'race' || m.ph === 'grid');
    if (m.ph === 'race' || m.ph === 'grid') { $('cStat').textContent = m.fin ? '🏁 Im Ziel – Platz ' + m.pos : (m.ph === 'grid' ? '🚦 Gleich geht es los! ' : '') + 'Platz ' + m.pos + '/' + m.n + ' · Runde ' + m.lap + '/' + m.laps; $('cItem').textContent = m.roll ? '🎰' : (m.item || '–'); }
    else if (m.ph === 'res') $('cStat').textContent = (m.msg || 'Ziel') + ' – nochmal? Tippe „Weiter“.';
    else if (m.ph === 'lobby') $('cStat').textContent = '✅ Dabei! Warte auf den Start …';
  }
  OmaTouch.build($('cz'), PH.st);
  $('cGo').onclick = () => { if (NET) NET.send({ t: 'go' }); sfx('ok'); };
  // Kippen zum Lenken (Handy quer oder hochkant)
  function onTilt(e) { const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0, v = Math.abs(ang) === 90 ? (ang === 90 ? e.beta : -e.beta) : e.gamma; PH.tv = clamp((v || 0) / 25 * (PH.inv ? -1 : 1), -1, 1); if (Math.abs(PH.tv) < .06) PH.tv = 0; }
  $('cInv').onclick = () => { PH.inv = !PH.inv; $('cInv').classList.toggle('on', PH.inv); };
  $('cTilt').onclick = async () => {
    if (PH.tilt) { PH.tilt = false; removeEventListener('deviceorientation', onTilt); $('cTilt').classList.remove('on'); return; }
    try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return toast('Kippen nicht erlaubt'); } } catch (e) { }
    PH.tilt = true; addEventListener('deviceorientation', onTilt); $('cTilt').classList.add('on'); toast('📱 Kippen lenkt – Knöpfe gehen weiter');
  };
  function phoneTick(dt) {
    if (!PH.on || !NET) return; PH.sendT -= dt; readPads(); const st = PH.st, pa = PADS[0] || { s: 0 }; let s = clamp(st.s + pa.s, -1, 1); if (PH.tilt && !s) s = PH.tv;
    const it = st.i || pa.i ? 1 : 0; if (it && !PH.itemPrev) NET.send({ t: 'it' }); PH.itemPrev = it;
    const m = { t: 'in', s: Math.round(s * 50) / 50, g: st.g || pa.g ? 1 : 0, b: st.b || pa.b ? 1 : 0, d: st.d || pa.d ? 1 : 0 }, key = m.s + ',' + m.g + m.b + m.d;
    if (key !== PH.last || PH.sendT <= 0) { PH.last = key; PH.sendT = .25; NET.send(m); }
    const ci = $('cItem').textContent; if (PH.ci !== ci) { PH.ci = ci; const e = $('cz').querySelector('.tb-i i'); if (e) e.textContent = ci && ci !== '–' && ci !== '🎰' ? ci : '★'; }
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Rollatoren werden aufgepumpt …', 'Raketen werden betankt …', 'Gebisse werden geputzt …', 'Kaffee wird gekocht …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.2); await new Promise(r => setTimeout(r, 30));
    const q = new URLSearchParams(location.search), jc = q.get('join');
    try { V.init($('cv'), { low: coarse() && Math.min(screen.width, screen.height) < 500 }); V.resize(innerWidth, innerHeight); if (!jc) demo(); } catch (e) { console.error(e); toast('3D-Grafik wird nicht unterstützt'); }
    bar(.7); await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    requestAnimationFrame(frame);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    if (jc) { phoneScreen(jc.toUpperCase()); return; }
    const tv = (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv()) || q.has('tv');
    if (tv) { scr('sMenu'); menuStat(); openLobby(); return; }
    scr('sTitle');
  })();
  window.OmaApp = { A, SET, ST, get R() { return R; }, get GP() { return GP; }, NETH, PH, startRace, startGP, toMenu };
})();

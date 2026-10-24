/* Stadt Land Plus – Ablauf: Laden, Titel, Konsolen-Menü, Spiel einrichten (Stadt + Land + eigenes Thema), Runden mit
 * 3D-Buchstaben-Trommel, Schreiben mit Uhr und STOPP, Auswertung (automatisch, Abstimmung oder Moderator) mit Infos und
 * Globus, Punkte, Siegerehrung, Nachschlagen. Mehrspieler: Fernseher = Spielleitung, Handys schreiben und stimmen ab
 * (online über ../cloud/fire-peer.js, Links über EasyGamesLink.share). Gamepad: Bildschirmtastatur. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'stadt-land-plus-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const V = window.SLFView, S = window.SLFSound, CATS = SLF.CATS;
  const SET = Object.assign({ sound: true, music: true, vib: true, osk: false, name: '', third: 'fluss', extra: [], custom: '', rounds: 5, time: 90, stop: true, excl: ['Q', 'X', 'Y'], check: 'auto', typos: true, plaus: true, unknown: false, bots: 2, skill: 1, me: false, mod: '', modPlays: true }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const ST = Object.assign({ games: 0, wins: 0, best: 0, words: 0, answered: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => { LS.set(P + 'stats', ST); if (ST.best > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', ST.best); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const sfx = n => { if (SET.sound && S.sfx[n]) S.sfx[n](); };
  const music = (on, fast) => S.music(on && SET.music, fast);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmtNum = n => n >= 1000 ? (n / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' Mio.' : Math.round(n * 1000).toLocaleString('de-DE');
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  S.setVol('sfx', SET.sound ? .8 : 0);

  /* ---------- Datenbank nachladen ---------- */
  const loading = {};
  function loadFile(f) { if (loading[f]) return loading[f]; return loading[f] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'js/db/' + f + '.js'; s.onload = res; s.onerror = () => { delete loading[f]; rej(new Error(f)); }; document.head.appendChild(s); }); }
  const loadCats = cats => Promise.all([].concat(...cats.map(c => (CATS[c] || CATS.eigene).files)).filter((f, i, a) => a.indexOf(f) === i).map(loadFile));
  const catName = (id, G) => id === 'eigene' ? ((G && G.cfg.custom) || SET.custom || 'Eigene') : CATS[id].n;
  const catIcon = id => (CATS[id] || CATS.eigene).icon;

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sSetup: () => setupBack(), sLex: () => toMenu(), sHelp: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sPhone: () => { if (!$('pJoin').hidden) { netClose(); toMenu(); } }, sEnd: () => { const b = $('enBtns').querySelector('.pri'); if (b) b.click(); } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse()) return; const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !(cur === 'sGame' && document.activeElement && document.activeElement.tagName === 'INPUT')) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; if (id === 'ovInfo') V.globeOff(); setTimeout(focusFirst, 0); }
  const closeAllOv = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('nav'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); sfx('nav'); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); }
  }
  function back() { const ov = overlays().pop(); if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); } if (cur === 'sGame') return pause(); if (BACK[cur]) BACK[cur](); }
  function seg(el, opts, val, cb) {
    el.innerHTML = opts.map(o => `<button class="sg nav${o.v === val ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join('');
    el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v); });
  }

  /* ---------- Menü ---------- */
  function menuStat() { $('menuStat').innerHTML = `<span>🏆 ${ST.wins} Siege</span><span>⭐ Rekord ${ST.best}</span><span>✍️ ${ST.words} Wörter</span>`; }
  function toMenu() { endGame(); netClose(); closeAllOv(); menuStat(); scr('sMenu'); V.setMode('menu'); music(false); }
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'solo') openSetup('solo'); else if (g === 'host') openLobby(); else if (g === 'join') phoneScreen(''); else if (g === 'lex') lexScreen(); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') scr('sHelp'); };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i;
  $('helpBack').onclick = () => toMenu();

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oVib: 'vib', oOsk: 'osk' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.setVol('sfx', SET.sound ? .8 : 0); if (id === 'oMusic') music(!!GM); if (id === 'oOsk') oskShow(); }; }
  $('oName').value = SET.name; $('oName').onchange = () => { SET.name = $('oName').value.trim().slice(0, 14); saveSet(); };
  $('optX').onclick = () => closeOv('ovOpts');

  /* ---------- Spiel einrichten ---------- */
  let setupFor = 'solo';
  const THIRD = ['fluss', 'tier', 'beruf', 'vorname', 'pflanze', 'essen', 'sport', 'instrument', 'gegenstand', 'farbe', 'marke', 'auto', 'berg', 'koerper', 'eigene'];
  function openSetup(forWhat) {
    setupFor = forWhat; $('suT').textContent = forWhat === 'solo' ? '🧠 Solo einrichten' : '⚙️ Kategorien & Regeln';
    $('suBotsBox').hidden = $('suSkillBox').hidden = false;
    const drawThird = () => {
      $('suThird').innerHTML = THIRD.map(c => `<button class="ct nav${SET.third === c ? ' on' : ''}" data-c="${c}">${CATS[c].icon} ${esc(c === 'eigene' && SET.custom ? SET.custom : CATS[c].n)}</button>`).join('');
      $('suThird').querySelectorAll('.ct').forEach(b => b.onclick = () => { SET.third = b.dataset.c; SET.extra = SET.extra.filter(x => x !== SET.third); saveSet(); sfx('nav'); drawThird(); });
      $('thirdShow').textContent = catIcon(SET.third) + ' ' + catName(SET.third); $('suCustom').hidden = SET.third !== 'eigene' && !SET.extra.includes('eigene');
      $('suExtra').innerHTML = THIRD.filter(c => c !== SET.third).map(c => `<button class="ct nav${SET.extra.includes(c) ? ' on' : ''}" data-c="${c}">${CATS[c].icon} ${esc(c === 'eigene' && SET.custom ? SET.custom : CATS[c].n)}</button>`).join('');
      $('suExtra').querySelectorAll('.ct').forEach(b => b.onclick = () => { const c = b.dataset.c; if (SET.extra.includes(c)) SET.extra = SET.extra.filter(x => x !== c); else if (SET.extra.length < 3) SET.extra.push(c); else toast('Höchstens 6 Spalten'); saveSet(); sfx('nav'); drawThird(); });
    };
    drawThird();
    $('suCustom').value = SET.custom; $('suCustom').oninput = () => { SET.custom = $('suCustom').value.trim().slice(0, 24); saveSet(); $('thirdShow').textContent = catIcon(SET.third) + ' ' + catName(SET.third); };
    seg($('suRounds'), [3, 5, 8, 10].map(v => ({ v, n: v })), SET.rounds, v => { SET.rounds = v; saveSet(); });
    seg($('suTime'), [45, 60, 90, 120, 180].map(v => ({ v, n: v < 60 ? v + ' s' : (v / 60) + ' min' })), SET.time, v => { SET.time = v; saveSet(); });
    seg($('suBots'), [0, 1, 2, 3, 4, 5].map(v => ({ v, n: v ? v : 'keine' })), SET.bots, v => { SET.bots = v; saveSet(); });
    seg($('suSkill'), [{ v: 0, n: 'Leicht' }, { v: 1, n: 'Mittel' }, { v: 2, n: 'Profi' }], SET.skill, v => { SET.skill = v; saveSet(); });
    seg($('suCheck'), [{ v: 'auto', n: '🤖 Automatisch' }, { v: 'vote', n: '👍 Abstimmung' }, { v: 'mod', n: '🧑‍⚖️ Moderator' }], SET.check, v => { SET.check = v; saveSet(); });
    $('suExcl').innerHTML = SLF.ABC.map(l => `<button class="lt nav${SET.excl.includes(l) ? ' off' : ''}" data-l="${l}">${l}</button>`).join('');
    $('suExcl').querySelectorAll('.lt').forEach(b => b.onclick = () => { const l = b.dataset.l; if (SET.excl.includes(l)) SET.excl = SET.excl.filter(x => x !== l); else if (SET.excl.length < 20) SET.excl.push(l); b.classList.toggle('off', SET.excl.includes(l)); saveSet(); sfx('click'); });
    const CH = { suStop: 'stop', suTypos: 'typos', suPlaus: 'plaus', suUnknown: 'unknown' };
    for (const id in CH) { $(id).checked = !!SET[CH[id]]; $(id).onchange = () => { SET[CH[id]] = $(id).checked; saveSet(); }; }
    $('suGo').textContent = forWhat === 'solo' ? '▶ Los geht\'s' : '✔ Übernehmen';
    scr('sSetup');
  }
  function setupBack() { if (setupFor === 'host') { scr('sLobby'); lobbyUi(); } else toMenu(); }
  $('suBack').onclick = () => setupBack();
  $('suGo').onclick = () => { sfx('ok'); if (setupFor === 'host') { scr('sLobby'); lobbyUi(); return; } startSolo(); };
  const cfgNow = () => ({ cats: ['stadt', 'land', SET.third].concat(SET.extra.filter(c => c !== SET.third)).slice(0, 6), custom: SET.custom || 'Eigene', rounds: SET.rounds, time: SET.time, stop: SET.stop, excl: SET.excl.slice(), check: SET.check, typos: SET.typos, plaus: SET.plaus, unknown: SET.unknown });

  /* ---------- Spielleitung ---------- */
  let GM = null;
  const BOTN = ['Atlas-Anton', 'Lexi', 'Globus-Gabi', 'Quiz-Quentin', 'Wortwitz-Wanda'];
  function startSolo() {
    const players = [{ id: 'me', name: SET.name || 'Du', kind: 'me' }].concat(Array.from({ length: SET.bots }, (_, i) => ({ id: 'b' + i, name: BOTN[i], kind: 'bot', skill: SET.skill })));
    startGame(cfgNow(), players, { solo: true, mod: SET.check === 'mod' ? 'me' : '' });
  }
  async function startGame(cfg, players, o) {
    closeAllOv(); scr('sGame'); $('sheet').innerHTML = '<p class="hint big">📚 Datenbank wird geladen …</p>'; $('side').innerHTML = ''; $('gFoot').innerHTML = '';
    try { await loadCats(cfg.cats); } catch (e) { toast('Datenbank konnte nicht geladen werden'); return toMenu(); }
    cfg.cats.forEach(c => { if (c !== 'eigene') SLF.build(c); });
    GM = { cfg, players: players.map(p => Object.assign({ total: 0, plays: true }, p)), round: 0, used: [], hist: [], solo: !!o.solo, mod: o.mod || '', online: !!o.online, paused: false };
    document.body.classList.add('playing'); music(true); nextRound();
  }
  function endGame() { if (!GM) return; GM = null; document.body.classList.remove('playing'); V.setMode('menu'); music(false); $('osk').hidden = true; }
  const humansP = () => GM.players.filter(p => p.kind !== 'bot' && p.plays);
  const meP = () => GM && GM.players.find(p => p.kind === 'me' && p.plays);
  function nextRound() {
    const G = GM; G.round++; G.letter = SLF.pickLetter(G.used, G.cfg.excl); G.used.push(G.letter);
    G.ans = {}; G.players.forEach(p => { G.ans[p.id] = {}; }); G.done = {}; G.stopBy = null; G.stopT = 0; G.t = G.cfg.time; G.phase = 'roll'; G.rows = null;
    $('gLetter').textContent = '?'; $('gRound').textContent = 'Runde ' + G.round + ' von ' + G.cfg.rounds; $('gHint').textContent = 'Der Buchstabe wird ausgelost …';
    $('sheet').innerHTML = ''; $('side').innerHTML = ''; $('gFoot').innerHTML = ''; $('gClock').hidden = true; $('osk').hidden = true;
    document.body.classList.add('rolling'); V.rollTo(G.letter, 2.6, () => { sfx('letter'); setTimeout(() => { if (GM === G) startWrite(); }, 900); }); sfx('roll');
    netAll({ t: 'roll', round: G.round, rounds: G.cfg.rounds });
  }
  function startWrite() {
    const G = GM; G.phase = 'write'; document.body.classList.remove('rolling'); V.setMode('letter');
    $('gLetter').textContent = G.letter; $('gHint').textContent = G.cfg.stop ? 'Wer fertig ist, drückt STOPP!' : 'Schreib zu jeder Spalte ein Wort mit ' + G.letter; $('gClock').hidden = false;
    // Computer-Mitspieler planen ihre Antworten
    G.botPlan = []; G.players.filter(p => p.kind === 'bot').forEach(p => G.cfg.cats.forEach(c => { const w = SLF.botAnswer(c, G.letter, p.skill); if (w) G.botPlan.push({ pid: p.id, cat: c, w, at: G.cfg.time * (1 - (.25 + Math.random() * .6) * [1, .8, .6][p.skill]) }); }));
    drawWrite(); netAll({ t: 'write', letter: G.letter, cats: G.cfg.cats.map(c => ({ id: c, n: catName(c, G), icon: catIcon(c) })), time: G.cfg.time, stop: G.cfg.stop, round: G.round, rounds: G.cfg.rounds });
  }
  function drawWrite() {
    const G = GM, me = meP();
    if (me) {
      $('sheet').innerHTML = G.cfg.cats.map((c, i) => `<label class="row1"><span class="cl">${catIcon(c)} ${esc(catName(c, G))}</span><input class="field ans nav" data-c="${c}" data-i="${i}" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="${G.letter} …"></label>`).join('');
      $('sheet').querySelectorAll('.ans').forEach(inp => { inp.oninput = () => { G.ans.me[inp.dataset.c] = inp.value; sfx('type'); inp.classList.toggle('bad', !!inp.value.trim() && SLF.firstLetter(inp.value) !== G.letter); progress(); }; inp.onfocus = () => { A.field = inp; }; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); nextField(inp); } }; });
      setTimeout(() => { const f = $('sheet').querySelector('.ans'); if (f && !coarse()) { f.focus(); A.field = f; } }, 50);
    } else $('sheet').innerHTML = `<div class="tvLetter"><b>${G.letter}</b><span>${G.cfg.cats.map(c => catIcon(c) + ' ' + esc(catName(c, G))).join(' · ')}</span></div>`;
    $('gFoot').innerHTML = me ? `<button class="btn pri big nav" id="bStop">${G.cfg.stop ? '✋ STOPP!' : '✔ Fertig'}</button>` : '';
    if ($('bStop')) $('bStop').onclick = () => pressStop('me');
    progress(); oskShow();
  }
  function nextField(inp) { const all = Array.from($('sheet').querySelectorAll('.ans')), i = all.indexOf(inp); if (i >= 0 && i < all.length - 1) { all[i + 1].focus(); A.field = all[i + 1]; } else if (inp) inp.blur(); }
  const filled = pid => GM.cfg.cats.filter(c => (GM.ans[pid][c] || '').trim()).length;
  function progress() {
    const G = GM; if (!G || G.phase !== 'write') return;
    $('side').innerHTML = '<h3>Mitspieler</h3>' + G.players.filter(p => p.plays).map(p => `<div class="pp${G.done[p.id] ? ' done' : ''}"><b>${p.kind === 'bot' ? '🤖' : p.kind === 'net' ? '📱' : '🙂'} ${esc(p.name)}</b><span>${'●'.repeat(filled(p.id))}${'○'.repeat(G.cfg.cats.length - filled(p.id))}</span></div>`).join('');
  }
  function pressStop(pid) {
    const G = GM; if (!G || G.phase !== 'write') return;
    if (!G.cfg.stop) { G.done[pid] = true; progress(); if (humansP().every(p => G.done[p.id])) endWrite(); return; }
    if (G.stopBy) return; if (filled(pid) < G.cfg.cats.length) { if (pid === 'me') toast('Erst alle Spalten ausfüllen!'); else netTo(pid, { t: 'toast', m: 'Erst alle Spalten ausfüllen!' }); return; }
    G.stopBy = pid; G.t = Math.min(G.t, 10); const p = G.players.find(x => x.id === pid); sfx('stop'); vib([80, 40, 80]); bigTxt('✋ STOPP!\n' + p.name + ' ist fertig – noch 10 Sekunden', 2200); $('gHint').textContent = p.name + ' hat STOPP gerufen!';
    netAll({ t: 'stop', by: p.name, t: Math.ceil(G.t) }); if (A.music !== 'fast') { music(true, true); A.music = 'fast'; }
  }
  function writeTick(dt) {
    const G = GM; const t0 = G.t; G.t -= dt;
    for (const b of G.botPlan) if (!b.done && G.cfg.time - G.t >= G.cfg.time - b.at) { b.done = true; G.ans[b.pid][b.cat] = b.w; progress(); }
    // Profis rufen STOPP, wenn sie fertig sind
    if (G.cfg.stop && !G.stopBy && G.t < G.cfg.time * .55) G.players.filter(p => p.kind === 'bot' && p.skill === 2).forEach(p => { if (!G.stopBy && filled(p.id) === G.cfg.cats.length && Math.random() < dt * .08) pressStop(p.id); });
    if (Math.ceil(t0) !== Math.ceil(G.t) && G.t <= 10 && G.t > 0) sfx(G.t <= 5 ? 'hurry' : 'tick');
    const f = clamp(G.t / (G.stopBy ? 10 : G.cfg.time), 0, 1); $('gTime').textContent = Math.max(0, Math.ceil(G.t)); $('gArc').style.strokeDashoffset = (106.8 * (1 - f)).toFixed(1); $('gClock').classList.toggle('hurry', G.t <= 10);
    if (G.t <= 0) endWrite();
  }
  function endWrite() {
    const G = GM; G.phase = 'collect'; sfx('end'); $('osk').hidden = true; if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    netAll({ t: 'endw' }); A.music = ''; music(true);
    bigTxt('⏰ Stifte weg!', 1200); setTimeout(() => { if (GM === G) review(); }, G.online ? 1500 : 900);
  }
  /* ---------- Auswertung ---------- */
  function review() {
    const G = GM; G.phase = 'check'; V.setMode('menu');
    G.rows = {}; let id = 0; const cfg = G.cfg;
    for (const c of cfg.cats) G.rows[c] = G.players.filter(p => p.plays).map(p => { const text = (G.ans[p.id][c] || '').trim(), res = SLF.check(c, text, G.letter, { typos: cfg.typos }); const auto = res.ok === true || (res.ok === null && (res.how === 'zusammengesetzt' ? cfg.plaus : res.how === 'frei' ? true : cfg.unknown)); return { id: ++id, pid: p.id, cat: c, text, res, auto, valid: auto, votes: {} }; });
    const all = [].concat(...Object.values(G.rows)), unsure = all.filter(a => a.res.ok === null);
    // Computer stimmen ab
    G.players.filter(p => p.kind === 'bot' && p.plays).forEach(p => unsure.forEach(a => { if (a.pid !== p.id) a.votes[p.id] = Math.random() < (a.res.how === 'zusammengesetzt' ? .85 : a.res.how === 'frei' ? .8 : .35) ? 1 : -1; }));
    if (cfg.check === 'vote' && unsure.length) { G.voteT = 25; G.sub = 'vote'; }
    else if (cfg.check === 'mod' && G.mod) { G.sub = 'mod'; }
    else G.sub = '';
    drawReview(); netReview();
    if (!G.sub) setTimeout(() => { if (GM === G && G.phase === 'check') finishReview(); }, 400);
  }
  const voteResult = a => { const v = Object.values(a.votes); if (!v.length) return a.auto; const s = v.reduce((x, y) => x + y, 0); return s >= 0; };
  const chip = a => { const r = a.res; if (!a.text) return '<i class="ch e">–</i>'; if (a.mod != null) return a.valid ? '<i class="ch ok">✔</i>' : '<i class="ch no">✘</i>'; if (r.ok === true) return r.how === 'tippfehler' ? '<i class="ch ok">≈</i>' : '<i class="ch ok">✔</i>'; if (r.ok === false) return '<i class="ch no">✘</i>'; return '<i class="ch q">?</i>'; };
  function drawReview() {
    const G = GM, ps = G.players.filter(p => p.plays), me = meP(), modMe = G.sub === 'mod' && (G.mod === 'me' || G.mod === 'host'), voteMe = G.sub === 'vote' && me;
    $('gHint').textContent = G.sub === 'vote' ? '👍/👎 Unsichere Wörter: Stimmt ab!' : G.sub === 'mod' ? (modMe ? '🧑‍⚖️ Du bist Moderator: Tippe auf ✔/✘, um zu entscheiden' : '🧑‍⚖️ Der Moderator entscheidet …') : 'Auswertung';
    $('side').innerHTML = ''; $('gClock').hidden = G.sub !== 'vote';
    const head = `<tr><th></th>${ps.map(p => `<th>${p.kind === 'bot' ? '🤖' : p.kind === 'net' ? '📱' : '🙂'} ${esc(p.name)}</th>`).join('')}</tr>`;
    const rows = G.cfg.cats.map(c => `<tr><th>${catIcon(c)} ${esc(catName(c, G))}</th>${G.rows[c].map(a => { const q = a.res.ok === null && a.text, mine = a.pid === 'me'; const votes = Object.values(a.votes), up = votes.filter(v => v > 0).length, dn = votes.length - up;
      return `<td class="${a.valid ? 'v' : 'iv'}${q ? ' qq' : ''}"><button class="ans2 nav" data-id="${a.id}">${chip(a)}<b>${esc(a.text || '—')}</b>${a.pts != null ? `<em>${a.pts}</em>` : ''}</button>${a.res.note ? `<small>${esc(a.res.note)}</small>` : ''}${q && G.sub === 'vote' ? `<div class="vt">${voteMe && !mine ? `<button class="vb nav${a.votes.me > 0 ? ' on' : ''}" data-id="${a.id}" data-v="1">👍</button><button class="vb nav${a.votes.me < 0 ? ' on' : ''}" data-id="${a.id}" data-v="-1">👎</button>` : ''}<span>👍${up} 👎${dn}</span></div>` : ''}${modMe && a.text ? `<div class="vt"><button class="mb nav${a.valid ? ' on' : ''}" data-id="${a.id}" data-v="1">✔</button><button class="mb nav${!a.valid ? ' on' : ''}" data-id="${a.id}" data-v="0">✘</button></div>` : ''}</td>`; }).join('')}</tr>`).join('');
    const sums = G.rows[G.cfg.cats[0]][0].pts != null ? `<tr class="sum"><th>Runde</th>${ps.map(p => `<td><b>${roundPts(p.id)}</b></td>`).join('')}</tr><tr class="sum tot"><th>Gesamt</th>${ps.map(p => `<td><b>${p.total}</b></td>`).join('')}</tr>` : '';
    $('sheet').innerHTML = `<div class="tblWrap"><table class="rev">${head}${rows}${sums}</table></div>`;
    $('sheet').querySelectorAll('.ans2').forEach(b => b.onclick = () => showInfo(findA(+b.dataset.id)));
    $('sheet').querySelectorAll('.vb').forEach(b => b.onclick = () => { const a = findA(+b.dataset.id); a.votes.me = +b.dataset.v; sfx('vote'); drawReview(); netReview(); checkVotesDone(); });
    $('sheet').querySelectorAll('.mb').forEach(b => b.onclick = () => { modSet(+b.dataset.id, b.dataset.v === '1'); });
    $('gFoot').innerHTML = G.phase === 'score' ? `<button class="btn pri big nav" id="bNext">${G.round >= G.cfg.rounds ? '🏆 Zur Siegerehrung' : '▶ Nächste Runde'}</button>` : (modMe ? '<button class="btn pri big nav" id="bModOk">✔ Auswertung fertig</button>' : G.sub === 'vote' ? '<button class="btn nav" id="bVoteOk">⏩ Abstimmung beenden</button>' : '');
    if ($('bNext')) $('bNext').onclick = () => { sfx('ok'); afterScore(); };
    if ($('bModOk')) $('bModOk').onclick = () => finishReview();
    if ($('bVoteOk')) $('bVoteOk').onclick = () => finishReview();
    oskShow();
  }
  const findA = id => { for (const c in GM.rows) { const a = GM.rows[c].find(x => x.id === id); if (a) return a; } return null; };
  function modSet(id, ok) { const a = findA(id); if (!a || GM.phase !== 'check') return; a.mod = ok; a.valid = ok; sfx(ok ? 'good' : 'bad'); drawReview(); netReview(); }
  function checkVotesDone() { const G = GM; if (G.sub !== 'vote') return; const voters = humansP(); const unsure = [].concat(...Object.values(G.rows)).filter(a => a.res.ok === null && a.text); if (unsure.every(a => voters.every(p => p.id === a.pid || a.votes[p.id] != null))) finishReview(); }
  function reviewTick(dt) { const G = GM; if (G.sub !== 'vote') return; G.voteT -= dt; $('gTime').textContent = Math.max(0, Math.ceil(G.voteT)); $('gArc').style.strokeDashoffset = (106.8 * (1 - clamp(G.voteT / 25, 0, 1))).toFixed(1); if (G.voteT <= 0) finishReview(); }
  const roundPts = pid => GM.cfg.cats.reduce((s, c) => s + ((GM.rows[c].find(a => a.pid === pid) || {}).pts || 0), 0);
  function finishReview() {
    const G = GM; if (!G || G.phase !== 'check') return;
    for (const c of G.cfg.cats) { G.rows[c].forEach(a => { if (a.mod != null) a.valid = a.mod; else if (G.sub === 'vote' && a.res.ok === null && a.text) a.valid = voteResult(a); }); SLF.score(G.rows[c]); }
    G.players.forEach(p => { if (p.plays) p.total += roundPts(p.id); });
    const me = meP(); if (me) { const mine = [].concat(...Object.values(G.rows)).filter(a => a.pid === 'me'); ST.answered += mine.filter(a => a.text).length; ST.words += mine.filter(a => a.valid).length; saveSt(); }
    G.phase = 'score'; G.sub = ''; G.hist.push({ letter: G.letter, rows: G.rows }); sfx('score'); drawReview();
    $('gHint').textContent = 'Punkte: 20 allein · 10 einzigartig · 5 doppelt'; netScore();
  }
  function afterScore() { const G = GM; if (!G || G.phase !== 'score') return; if (G.round >= G.cfg.rounds) finish(); else nextRound(); }
  /* ---------- Siegerehrung (Game Over) ---------- */
  function finish() {
    const G = GM, order = G.players.filter(p => p.plays).slice().sort((a, b) => b.total - a.total), me = meP();
    ST.games++; if (me) { if (order[0] === me) ST.wins++; if (me.total > ST.best) ST.best = me.total; } saveSt();
    const all = [].concat(...G.hist.map(h => [].concat(...Object.values(h.rows)))), valid = all.filter(a => a.valid && a.text);
    const longest = valid.slice().sort((a, b) => b.text.length - a.text.length)[0], solo20 = valid.filter(a => a.pts === 20), best = order[0];
    $('enT').textContent = me && order[0] === me ? '🏆 Du gewinnst!' : '🏆 ' + best.name + ' gewinnt!';
    $('enPod').innerHTML = [1, 0, 2].map(k => { const p = order[k]; if (!p) return ''; return `<div class="pd p${k + 1}"><i>${k === 0 ? '👑' : k === 1 ? '🥈' : '🥉'}</i><b>${esc(p.name)}</b><small>${p.total} Punkte</small><div class="blk">${k + 1}</div></div>`; }).join('');
    $('enHl').innerHTML = (longest ? `<div>📏 Längstes Wort: <b>${esc(longest.text)}</b> (${esc(G.players.find(p => p.id === longest.pid).name)})</div>` : '') + `<div>💎 ${solo20.length}× allein gewusst (20 Punkte)</div><div>🔤 Buchstaben: ${G.used.join(' ')}</div>`;
    const btn = (id, t, pri) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`;
    $('enBtns').innerHTML = G.online ? btn('enLobby', '← Zur Lobby') + btn('enAgain', '↻ Nochmal', true) : btn('enMenu', '☰ Menü') + btn('enAgain', '↻ Nochmal', true);
    const online = G.online, cfg = G.cfg, players = G.players.map(p => ({ id: p.id, name: p.name, kind: p.kind, skill: p.skill, plays: p.plays, peer: p.peer })), mod = G.mod;
    endGame(); scr('sEnd'); sfx('win');
    $('enMenu') && ($('enMenu').onclick = () => toMenu()); $('enLobby') && ($('enLobby').onclick = () => lobbyBack());
    $('enAgain').onclick = () => { sfx('ok'); if (online) lobbyStart(); else startGame(cfg, players, { solo: true, mod }); };
    netAll({ t: 'end', order: order.map(p => ({ n: p.name, s: p.total })) });
  }
  function pause() { if (!GM || GM.paused) return; GM.paused = true; openOv('ovPause'); }
  function resume() { if (!GM) return; closeOv('ovPause'); GM.paused = false; }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume(); $('paOpt').onclick = () => openOv('ovOpts');
  $('paQuit').onclick = () => { closeAllOv(); const online = GM && GM.online; endGame(); if (online) lobbyBack(); else toMenu(); };
  let bigT = 0; function bigTxt(t, ms) { const e = $('big'); e.textContent = t; e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); clearTimeout(bigT); bigT = setTimeout(() => { e.hidden = true; }, ms || 1500); }

  /* ---------- Infos mit Globus ---------- */
  function infoHtml(res) {
    const e = res && res.info; if (!e) return `<h3>${esc(res && res.text || '')}</h3><p>${esc(res && res.note || 'Keine Infos in der Datenbank.')}</p>`;
    const C = SLF.country, flagN = cc => { const c = C(cc); return c ? c.flag + ' ' + esc(c.n) : esc(cc); };
    if (e.t === 'stadt') { const c = C(e.cc); return `<h3>🏙️ ${esc(e.n)}</h3><p class="sub">${c ? c.flag + ' Stadt in ' + esc(c.n) : ''}${e.bl ? ' · ' + esc(e.bl) : ''}</p><ul>${e.pop ? `<li>👥 ca. ${fmtNum(e.pop)} Einwohner</li>` : ''}${e.cap ? '<li>⭐ Hauptstadt</li>' : ''}${c && c.cap.includes(e.n) ? '<li>⭐ Hauptstadt von ' + esc(c.n) + '</li>' : ''}${e.lat != null ? `<li>📍 ${e.lat.toFixed(1)}° ${e.lat >= 0 ? 'N' : 'S'}, ${Math.abs(e.lon).toFixed(1)}° ${e.lon >= 0 ? 'O' : 'W'}</li>` : ''}${c ? `<li>🌍 ${esc(c.reg)}${c.sub ? ' · ' + esc(c.sub) : ''}</li>` : ''}</ul>`; }
    if (e.t === 'land') { const c = C(e.c); if (!c) return `<h3>🌍 ${esc(res.text)}</h3><p>${esc(e.note || '')}</p>`; return `<h3><span class="flag">${c.flag}</span> ${esc(c.n)}</h3><p class="sub">${esc(c.o)}${e.note ? ' · ' + esc(e.note) : ''}</p><ul><li>🏛️ Hauptstadt: ${esc(c.cap.join(', ') || '–')}</li><li>🌍 ${esc(c.reg)}${c.sub ? ' · ' + esc(c.sub) : ''}</li><li>📐 ${c.area.toLocaleString('de-DE')} km²${c.land ? ' · Binnenstaat' : ''}</li><li>🗣️ ${esc(c.lang.join(', ') || '–')}</li><li>💶 ${esc(c.cur.join(', ') || '–')}</li>${c.nb.length ? `<li>🤝 Nachbarn: ${c.nb.map(flagN).join(', ')}</li>` : ''}<li>${c.un ? '🇺🇳 UN-Mitglied' : c.ind ? 'Unabhängiger Staat' : 'Abhängiges Gebiet'}</li></ul>`; }
    if (e.t === 'fluss') return `<h3>🌊 ${esc(e.n)}</h3>${e.alt.length ? `<p class="sub">auch: ${esc(e.alt.join(', '))}</p>` : ''}<ul>${e.len ? `<li>📏 ca. ${e.len.toLocaleString('de-DE')} km lang</li>` : ''}<li>🗺️ ${e.ccs.map(flagN).join(', ')}</li><li>➡️ mündet in: ${esc(e.mouth || '–')}</li></ul>`;
    if (e.t === 'bundesland') return `<h3>🗺️ ${esc(e.n)}</h3><p>Deutsches Bundesland – kein eigener Staat. Ob es zählt, entscheidet eure Runde.</p>`;
    return `<h3>${catIcon(res.cat)} ${esc(e.n)}</h3><p class="sub">${esc(catName(res.cat))}</p><p>${res.how === 'zusammengesetzt' ? esc(res.note) : 'Steht in der Wortliste von Stadt Land Plus.'}</p>`;
  }
  function geoOf(res) { const e = res && res.info; if (!e) return null; if (e.t === 'stadt') { if (e.lat != null) return [e.lat, e.lon]; const c = SLF.country(e.cc); return c ? [c.lat, c.lon] : null; } if (e.t === 'land') { const c = SLF.country(e.c); return c ? [c.lat, c.lon] : null; } if (e.t === 'fluss') { const c = SLF.country(e.ccs[0]); return c ? [c.lat, c.lon] : null; } return null; }
  function showInfo(a) {
    if (!a) return; const res = a.res || a; const ps = GM && a.pid ? GM.players.find(p => p.id === a.pid) : null;
    $('infoTxt').innerHTML = (ps ? `<p class="who">${esc(ps.name)} schrieb: <b>„${esc(a.text)}“</b></p>` : '') + infoHtml(res) + (res.note && res.info ? `<p class="note">ℹ️ ${esc(res.note)}</p>` : '');
    const g = geoOf(res); $('globe').hidden = !g; openOv('ovInfo'); if (g) setTimeout(() => V.globe($('globe'), g[0], g[1]), 30);
  }
  $('infoX').onclick = () => closeOv('ovInfo');

  /* ---------- Nachschlagen ---------- */
  function lexScreen() {
    $('lxCat').innerHTML = Object.keys(CATS).filter(c => c !== 'eigene').map(c => `<option value="${c}">${CATS[c].icon} ${CATS[c].n}</option>`).join(''); $('lxCat').value = A.lexCat || 'stadt';
    scr('sLex'); lexRun();
  }
  let lexTimer = 0;
  async function lexRun() {
    const c = $('lxCat').value, q = $('lxQ').value.trim(); A.lexCat = c; $('lxRes').innerHTML = '<p class="hint">Lädt …</p>';
    try { await loadCats([c]); } catch (e) { $('lxRes').innerHTML = '<p class="hint">Datenbank nicht erreichbar.</p>'; return; }
    if (!q) { $('lxRes').innerHTML = `<p class="hint">Tippe ein Wort – die Datenbank prüft es wie im Spiel. ${c === 'stadt' ? '(' + Object.values(window.SLF_DB.staedte.orte).reduce((s, a) => s + a.length, 0).toLocaleString('de-DE') + ' Orte)' : ''}</p>`; return; }
    const res = SLF.check(c, q, null, { typos: true }), ix = SLF.build(c), k = SLF.norm(q), more = ix.keys.filter(x => x.startsWith(k) && x !== res.key).slice(0, 10).map(x => ix.map[x][0]);
    $('lxRes').innerHTML = `<div class="lxHit ${res.ok === true ? 'ok' : res.ok === false ? 'no' : 'q'}"><div class="lxV">${res.ok === true ? '✔ Gültig' : res.ok === false ? '✘ Nicht gültig' : '? Unsicher'}${res.note ? ' – ' + esc(res.note) : ''}</div><button class="btn small nav" id="lxInfo">ℹ️ Infos${geoOf(res) ? ' & Globus' : ''}</button></div>` + (more.length ? '<p class="lbl">Weitere Treffer</p><div class="lxMore">' + more.map((e, i) => `<button class="sg nav" data-i="${i}">${esc(e.n || (SLF.country(e.c) || {}).n || '')}</button>`).join('') + '</div>' : '');
    $('lxInfo').onclick = () => showInfo(res);
    $('lxRes').querySelectorAll('.lxMore .sg').forEach(b => b.onclick = () => { $('lxQ').value = b.textContent; lexRun(); });
  }
  $('lxQ').oninput = () => { clearTimeout(lexTimer); lexTimer = setTimeout(lexRun, 250); }; $('lxCat').onchange = () => lexRun(); $('lxBack').onclick = () => toMenu();

  /* ---------- Bildschirmtastatur (Gamepad / Fernseher) ---------- */
  const A = { dev: coarse() ? 'touch' : 'kb', field: null, music: '' };
  const OSK = ['QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNMß-.'];
  function oskShow() {
    const want = GM && GM.phase === 'write' && meP() && (A.dev === 'pad' || SET.osk);
    $('osk').hidden = !want; if (!want || $('osk').dataset.ok) return;
    $('osk').dataset.ok = 1; $('osk').innerHTML = OSK.map(r => '<div class="okr">' + r.split('').map(ch => `<button class="ok nav" data-k="${ch}">${ch}</button>`).join('') + '</div>').join('') + '<div class="okr"><button class="ok nav wide" data-k=" ">Leerzeichen</button><button class="ok nav" data-k="⌫">⌫</button><button class="ok nav" data-k="↵">Nächste ▶</button></div>';
    $('osk').querySelectorAll('.ok').forEach(b => b.onclick = () => oskKey(b.dataset.k));
  }
  function oskKey(k) {
    const inputs = Array.from($('sheet').querySelectorAll('.ans')); if (!inputs.length) return; let f = A.field && inputs.includes(A.field) ? A.field : inputs.find(i => !i.value) || inputs[0]; A.field = f;
    if (k === '⌫') f.value = f.value.slice(0, -1); else if (k === '↵') { const i = inputs.indexOf(f); A.field = inputs[(i + 1) % inputs.length]; } else f.value = (f.value + (f.value ? k.toLowerCase() : k)).slice(0, 40);
    inputs.forEach(i => i.classList.toggle('act', i === A.field)); f.dispatchEvent(new Event('input')); sfx('click');
  }

  /* ---------- Hauptschleife & Eingaben ---------- */
  let lastT = performance.now(), PADS = [], padPrev = {}, padNavT = 0, padDir = null;
  function readPads() { let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : []; } catch (e) { } PADS = list; return list[0]; }
  function frame(now) {
    const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    try {
      V.render(dt); V.globeFrame(dt);
      if (GM && !GM.paused) { if (GM.phase === 'write') writeTick(dt); else if (GM.phase === 'check') reviewTick(dt); }
      menuPad(dt); if (cur === 'sPhone') phoneTick(dt); if (H.on) netTick(dt);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  function menuPad(dt) {
    const gp = readPads(); if (!gp) return; const b = gp.buttons || [], ax = gp.axes || [], pr = k => !!(b[k] && (b[k].pressed || b[k].value > .5));
    const now = { a: pr(0), b: pr(1), x: pr(2), y: pr(3), st: pr(9), lb: pr(4), rb: pr(5) }, edge = k => now[k] && !padPrev[k];
    let x = Math.abs(ax[0] || 0) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1] || 0) > .5 ? Math.sign(ax[1]) : 0; if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1;
    if (x || z || Object.values(now).some(Boolean)) { if (A.dev !== 'pad') { A.dev = 'pad'; oskShow(); } document.body.classList.add('kbd'); }
    const key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padNavT <= 0)) { const [dx, dy] = key.split(',').map(Number); if (document.activeElement && document.activeElement.tagName === 'INPUT') document.activeElement.blur(); moveFocus(dx, dy); padNavT = key !== padDir ? .3 : .12; }
    padDir = key; padNavT -= dt;
    const writing = GM && GM.phase === 'write' && meP() && !overlays().length;
    if (edge('a')) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled && a.tagName !== 'INPUT') a.click(); else focusFirst(); } }
    if (edge('b')) { if (writing) oskKey('⌫'); else back(); }
    if (edge('x') && writing) oskKey(' ');
    if ((edge('y') || edge('rb')) && writing) oskKey('↵');
    if (edge('st')) { if (cur === 'sTitle') pressStart(); else if (writing) pressStop('me'); else if (GM && GM.phase === 'score') afterScore(); else if (cur === 'sGame') pause(); }
    padPrev = now;
  }
  addEventListener('keydown', e => {
    if (e.key !== 'Tab') A.dev = coarse() ? 'touch' : 'kb'; document.body.classList.add('kbd');
    if (e.code === 'Escape') { e.preventDefault(); back(); return; }
    if (e.target && e.target.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown'].includes(e.code)) { if (e.code === 'Enter' && cur === 'sPhone' && !$('pJoin').hidden) phoneJoin(); return; }
    if (e.target && e.target.tagName === 'SELECT') return;
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('pointerdown', e => { document.body.classList.remove('kbd'); if (e.pointerType === 'touch') A.dev = 'touch'; }, true);
  addEventListener('resize', () => V.resize(innerWidth, innerHeight));
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden – Bildschirmtastatur bereit'); $('pressTxt').textContent = 'Drücke A'; });
  function pressStart() { S.ctx(); sfx('ok'); scr('sMenu'); menuStat(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'stadtland-';
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
  const netErr = e => ({ nocode: 'Diese Runde gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null;
  const H = { on: false, seats: [], pushT: 0 };   // seats: { peer, cid, name, gone }
  function netClose() { if (NET) NET.close(); NET = null; H.on = false; H.seats = []; PH.on = false; }
  const netAll = m => { if (NET && H.on) NET.send(m); };
  const peerOf = pid => { const p = GM && GM.players.find(x => x.id === pid); return p && p.peer; };
  const netTo = (pid, m) => { const pe = peerOf(pid); if (pe && NET) NET.sendTo(pe, m); };

  /* ---------- Fernseher / Gastgeber ---------- */
  function openLobby() {
    netClose(); H.on = true; H.seats = []; scr('sLobby'); lobbyUi();
    $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Die Runde wird vorbereitet …';
    NET = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    NET.host().then(async code => {
      $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Handy: Kamera auf den QR-Code oder Code eingeben.';
      try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; }
    }).catch(e => { $('lobbyMsg').textContent = netErr(e); });
    loadCats(cfgNow().cats).catch(() => { });
  }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbBack').onclick = () => { netClose(); toMenu(); }; $('lbSetup').onclick = () => openSetup('host');
  $('lbMe').checked = !!SET.me; $('lbMe').onchange = () => { SET.me = $('lbMe').checked; saveSet(); lobbyUi(); };
  $('lbModPlays').checked = SET.modPlays; $('lbModPlays').onchange = () => { SET.modPlays = $('lbModPlays').checked; saveSet(); };
  const seatsOn = () => H.seats.filter(s => !s.gone);
  function lobbyUi() {
    const cf = cfgNow(), ss = seatsOn();
    $('lobbyList').innerHTML = (SET.me ? [{ name: (SET.name || 'Ich') + ' (hier)', icon: '🙂' }] : []).concat(ss.map(s => ({ name: s.name, icon: '📱' }))).map(s => `<div class="seat on"><i>${s.icon}</i><b>${esc(s.name)}</b></div>`).join('') + (SET.bots ? `<div class="seat bot"><i>🤖</i><b>${SET.bots} Computer</b></div>` : '') + `<div class="seat cfg"><i>📋</i><b>${cf.cats.map(catIcon).join(' ')}</b><small>${cf.rounds} Runden · ${cf.time} s · ${{ auto: 'automatisch', vote: 'Abstimmung', mod: 'Moderator' }[cf.check]}</small></div>`;
    const modOpts = [{ v: '', n: 'keiner' }, { v: 'host', n: 'dieser Bildschirm' }].concat(ss.map(s => ({ v: s.cid, n: '📱 ' + s.name })));
    if (!modOpts.some(o => o.v === SET.mod)) SET.mod = '';
    seg($('lbMod'), modOpts, SET.mod, v => { SET.mod = v; if (v) SET.check = 'mod'; saveSet(); lobbyUi(); });
    const n = ss.length + (SET.me ? 1 : 0); $('lbGo').disabled = n < 1 || n + SET.bots < 2;
    netAll({ t: 'lob', n });
  }
  function lobbyStart() {
    const ss = seatsOn(), cfg = cfgNow(); if (SET.mod) cfg.check = 'mod';
    const modSeat = ss.find(s => s.cid === SET.mod);
    const players = (SET.me ? [{ id: 'me', name: SET.name || 'Ich', kind: 'me', plays: SET.mod !== 'host' || SET.modPlays }] : []).concat(ss.map((s, i) => ({ id: 'n' + i, name: s.name, kind: 'net', peer: s.peer, cid: s.cid, plays: s !== modSeat || SET.modPlays }))).concat(Array.from({ length: SET.bots }, (_, i) => ({ id: 'b' + i, name: BOTN[i], kind: 'bot', skill: SET.skill })));
    if (players.filter(p => p.plays).length < 2) return toast('Mindestens zwei Mitspieler – nimm Computer dazu!');
    const mod = SET.mod === 'host' ? 'host' : modSeat ? players.find(p => p.cid === modSeat.cid).id : '';
    sfx('ok'); startGame(cfg, players, { online: true, mod });
  }
  $('lbGo').onclick = () => lobbyStart();
  function lobbyBack() { endGame(); H.seats = H.seats.filter(s => !s.gone); scr('sLobby'); lobbyUi(); netAll({ t: 'lobby' }); }
  function hostMsg(id, m) {
    let s = H.seats.find(x => x.peer === id);
    if (m.t === 'hi') {
      const cid = String(m.cid || '').slice(0, 16), back = H.seats.find(x => x.cid && x.cid === cid);
      if (back) { back.peer = id; back.gone = false; if (GM) { const p = GM.players.find(x => x.cid === cid); if (p) p.peer = id; } NET.sendTo(id, { t: 'wel', name: back.name }); if (GM) resend(id); else lobbyUi(); return; }
      if (GM) return NET.sendTo(id, { t: 'full', msg: 'Das Spiel läuft schon – bei der nächsten Partie bist du dabei.' });
      if (seatsOn().length >= 12) return NET.sendTo(id, { t: 'full', msg: 'Die Runde ist voll (12 Handys).' });
      s = { peer: id, cid, name: String(m.name || 'Gast').slice(0, 14) }; H.seats.push(s);
      NET.sendTo(id, { t: 'wel', name: s.name }); toast('📱 ' + s.name + ' spielt mit!'); sfx('ok'); lobbyUi(); return;
    }
    if (!s || !GM) { if (s && m.t === 'go' && cur === 'sLobby' && !$('lbGo').disabled) $('lbGo').click(); return; }
    const p = GM.players.find(x => x.cid === s.cid); if (!p) return;
    if (m.t === 'ans' && GM.phase !== 'check' && GM.phase !== 'score' && p.plays) { const a = {}; GM.cfg.cats.forEach(c => { a[c] = String((m.a || {})[c] || '').slice(0, 40); }); GM.ans[p.id] = a; progress(); }
    else if (m.t === 'stop') pressStop(p.id);
    else if (m.t === 'vote' && GM.phase === 'check' && GM.sub === 'vote') { const a = findA(m.id); if (a && a.pid !== p.id) { a.votes[p.id] = m.v > 0 ? 1 : -1; drawReview(); netReview(); checkVotesDone(); } }
    else if (m.t === 'mod' && GM.mod === p.id) { if (m.done) finishReview(); else modSet(m.id, !!m.v); }
    else if (m.t === 'go') { if (GM.phase === 'score') afterScore(); else if (cur === 'sEnd') $('enAgain').click(); }
  }
  function hostLeave(id) { const s = H.seats.find(x => x.peer === id); if (!s) return; s.gone = true; if (!GM) { H.seats = H.seats.filter(x => x !== s); lobbyUi(); } else toast('📴 ' + s.name + ' ist offline – Antworten bleiben gespeichert'); }
  function resend(peer) { const G = GM; if (!G) return; if (G.phase === 'write') NET.sendTo(peer, { t: 'write', letter: G.letter, cats: G.cfg.cats.map(c => ({ id: c, n: catName(c, G), icon: catIcon(c) })), time: Math.ceil(G.t), stop: G.cfg.stop, round: G.round, rounds: G.cfg.rounds }); else if (G.phase === 'check') netReview(); else if (G.phase === 'score') netScore(); }
  function netTick(dt) { if (!GM || GM.phase !== 'write') return; H.pushT -= dt; if (H.pushT > 0) return; H.pushT = 1; netAll({ t: 'time', t: Math.max(0, Math.ceil(GM.t)) }); }
  function netReview() {
    if (!H.on || !GM) return; const G = GM, items = [].concat(...Object.values(G.rows)).filter(a => a.text);
    G.players.filter(p => p.kind === 'net').forEach(p => {
      const isMod = G.sub === 'mod' && G.mod === p.id;
      const list = isMod ? items : G.sub === 'vote' ? items.filter(a => a.res.ok === null && a.pid !== p.id) : [];
      NET.sendTo(p.peer, { t: 'review', sub: G.sub, mod: isMod, letter: G.letter, items: list.map(a => ({ id: a.id, who: G.players.find(x => x.id === a.pid).name, cat: catIcon(a.cat) + ' ' + catName(a.cat, G), text: a.text, note: a.res.note || '', valid: a.valid, my: a.votes[p.id] || 0 })) });
    });
  }
  function netScore() {
    if (!H.on || !GM) return; const G = GM, order = G.players.filter(p => p.plays).slice().sort((a, b) => b.total - a.total);
    G.players.filter(p => p.kind === 'net').forEach(p => { const mine = G.cfg.cats.map(c => { const a = G.rows[c].find(x => x.pid === p.id); return a ? { cat: catIcon(c), text: a.text, pts: a.pts, valid: a.valid } : null; }).filter(Boolean); NET.sendTo(p.peer, { t: 'score', mine, round: p.plays ? roundPts(p.id) : 0, total: p.total, rank: order.indexOf(p) + 1, n: order.length, last: G.round >= G.cfg.rounds }); });
  }

  /* ---------- Handy ---------- */
  const PH = { on: false, ph: '', ans: {}, sendT: 0, dirty: false, cid: '' };
  try { PH.cid = localStorage.getItem(P + 'cid') || ''; } catch (e) { } if (!/^[a-z0-9]{8,16}$/.test(PH.cid)) { PH.cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem(P + 'cid', PH.cid); } catch (e) { } }
  function phoneScreen(code) { netClose(); $('pJoin').hidden = false; $('pPlay').hidden = true; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Den Code zeigt der Fernseher bei „🌐 Online & Handys“.'; scr('sPhone'); }
  async function phoneJoin() {
    const code = ($('jCode').value || '').trim(), name = ($('jName').value || '').trim().slice(0, 14) || 'Gast';
    SET.name = $('jName').value.trim().slice(0, 14); saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; S.ctx();
    NET = mkNet({ onMsg: phoneMsg, onLeave: () => { if (PH.on) { toast('📴 Verbindung weg – verbinde neu …'); setTimeout(() => { if (PH.on) phoneJoin(); }, 1500); } } });
    try { await NET.join(code); PH.on = true; PH.name = name; NET.send({ t: 'hi', name, cid: PH.cid }); } catch (e) { $('jMsg').textContent = netErr(e); PH.on = false; }
    $('jGo').disabled = false;
  }
  $('jGo').onclick = () => phoneJoin(); $('jBack').onclick = () => { netClose(); toMenu(); };
  const pb = html => { $('pBody').innerHTML = html; };
  function phoneMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; PH.on = false; $('pJoin').hidden = false; $('pPlay').hidden = true; return; }
    if (m.t === 'wel') { $('pJoin').hidden = true; $('pPlay').hidden = false; $('pName').textContent = '🙂 ' + m.name; PH.ph = 'lobby'; $('pLetter').textContent = ''; $('pTime').textContent = ''; pb('<p class="hint big">✅ Dabei! Warte auf den Start …</p><button class="btn pri" id="pGo">▶ Spiel starten</button>'); $('pGo').onclick = () => NET.send({ t: 'go' }); vib(40); try { if (window.EasyGamesKit && EasyGamesKit.keepAwake) EasyGamesKit.keepAwake(); } catch (e) { } return; }
    if (m.t === 'lob' && PH.ph === 'lobby') return;
    if (m.t === 'lobby') { PH.ph = 'lobby'; pb('<p class="hint big">Zurück in der Lobby – gleich geht es weiter …</p><button class="btn pri" id="pGo">▶ Spiel starten</button>'); $('pGo').onclick = () => NET.send({ t: 'go' }); return; }
    if (m.t === 'toast') return toast(m.m);
    if (m.t === 'roll') { PH.ph = 'roll'; $('pLetter').textContent = '?'; pb(`<p class="hint big">🎲 Runde ${m.round} von ${m.rounds}<br>Der Buchstabe wird ausgelost …</p>`); return; }
    if (m.t === 'write') { PH.ph = 'write'; PH.letter = m.letter; PH.cats = m.cats; PH.ans = {}; $('pLetter').textContent = m.letter; $('pTime').textContent = '⏱ ' + m.time; vib(60);
      pb(m.cats.map(c => `<label class="row1"><span class="cl">${c.icon} ${esc(c.n)}</span><input class="field pans" data-c="${c.id}" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="${m.letter} …"></label>`).join('') + `<button class="btn pri big" id="pStop">${m.stop ? '✋ STOPP!' : '✔ Fertig'}</button>`);
      $('pBody').querySelectorAll('.pans').forEach((inp, i, all) => { inp.oninput = () => { PH.ans[inp.dataset.c] = inp.value; PH.dirty = true; inp.classList.toggle('bad', !!inp.value.trim() && SLF.firstLetter(inp.value) !== PH.letter); }; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); if (all[i + 1]) all[i + 1].focus(); else inp.blur(); } }; });
      $('pStop').onclick = () => { phoneSend(); NET.send({ t: 'stop' }); vib(30); }; return; }
    if (m.t === 'time') { if (PH.ph === 'write') $('pTime').textContent = '⏱ ' + m.t; return; }
    if (m.t === 'stop') { if (PH.ph === 'write') { toast('✋ ' + m.by + ' hat STOPP gerufen – noch 10 Sekunden!', 3000); vib([80, 40, 80]); } return; }
    if (m.t === 'endw') { phoneSend(); PH.ph = 'wait'; $('pTime').textContent = ''; pb('<p class="hint big">⏰ Stifte weg! Die Auswertung läuft …</p>'); return; }
    if (m.t === 'review') {
      PH.ph = 'review';
      if (!m.items.length) { pb('<p class="hint big">🔎 Auswertung läuft – schau auf den Fernseher!</p>'); return; }
      pb(`<p class="hint">${m.mod ? '🧑‍⚖️ Du bist Moderator: Gilt das?' : '👍/👎 Stimmt ab: Gilt das?'}</p>` + m.items.map(it => `<div class="vitem"><div><small>${esc(it.cat)} · ${esc(it.who)}</small><b>${esc(it.text)}</b>${it.note ? `<small class="nt">${esc(it.note)}</small>` : ''}</div><div class="vbtns">${m.mod ? `<button class="vb${it.valid ? ' on' : ''}" data-id="${it.id}" data-v="1">✔</button><button class="vb${!it.valid ? ' on' : ''}" data-id="${it.id}" data-v="0">✘</button>` : `<button class="vb${it.my > 0 ? ' on' : ''}" data-id="${it.id}" data-v="1">👍</button><button class="vb${it.my < 0 ? ' on' : ''}" data-id="${it.id}" data-v="-1">👎</button>`}</div></div>`).join('') + (m.mod ? '<button class="btn pri big" id="pModOk">✔ Auswertung fertig</button>' : ''));
      $('pBody').querySelectorAll('.vb').forEach(b => b.onclick = () => { const v = +b.dataset.v; NET.send(m.mod ? { t: 'mod', id: +b.dataset.id, v } : { t: 'vote', id: +b.dataset.id, v }); b.parentNode.querySelectorAll('.vb').forEach(x => x.classList.toggle('on', x === b)); vib(15); });
      if ($('pModOk')) $('pModOk').onclick = () => NET.send({ t: 'mod', done: true });
      return; }
    if (m.t === 'score') { PH.ph = 'score'; pb(`<div class="pScore"><b>+${m.round}</b><span>Punkte diese Runde</span></div>` + m.mine.map(x => `<div class="mine ${x.valid ? 'v' : 'iv'}"><span>${x.cat}</span><b>${esc(x.text || '—')}</b><em>${x.pts || 0}</em></div>`).join('') + `<p class="hint big">Gesamt: ${m.total} · Platz ${m.rank} von ${m.n}</p><button class="btn pri big" id="pGo">${m.last ? '🏆 Siegerehrung' : '▶ Nächste Runde'}</button>`); $('pGo').onclick = () => NET.send({ t: 'go' }); return; }
    if (m.t === 'end') { PH.ph = 'end'; pb('<h3>🏆 Siegerehrung</h3>' + m.order.map((o, i) => `<div class="mine v"><span>${i + 1}.</span><b>${esc(o.n)}</b><em>${o.s}</em></div>`).join('') + '<button class="btn pri big" id="pGo">↻ Nochmal</button>'); $('pGo').onclick = () => NET.send({ t: 'go' }); sfx('win'); }
  }
  function phoneSend() { if (NET && PH.on) { NET.send({ t: 'ans', a: PH.ans }); PH.dirty = false; PH.sendT = .5; } }
  function phoneTick(dt) { if (!PH.on || PH.ph !== 'write') return; PH.sendT -= dt; if (PH.dirty && PH.sendT <= 0) phoneSend(); }

  /* ---------- Laden ---------- */
  const TIPS = ['Atlas wird aufgeschlagen …', 'Städte werden gezählt …', 'Flüsse werden vermessen …', 'Stifte werden gespitzt …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.2); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); V.resize(innerWidth, innerHeight); } catch (e) { console.error(e); }
    requestAnimationFrame(frame); bar(.6);
    await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { phoneScreen(jc.toUpperCase()); return; }
    const tv = (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv()) || q.has('tv');
    if (tv) { scr('sMenu'); menuStat(); openLobby(); return; }
    scr('sTitle');
    setTimeout(() => loadCats(['stadt', 'land', SET.third]).catch(() => { }), 1500); // im Hintergrund vorladen
  })();
  window.SLFApp = { get GM() { return GM; }, SET, ST, H, PH, A, startSolo, lobbyStart, endWrite, finishReview, afterScore, pressStop, showInfo, SLF };
})();

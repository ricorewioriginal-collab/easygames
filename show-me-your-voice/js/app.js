/* SHOW ME YOUR VOICE – Oberfläche und Ablauf: Menüs, Avatar, Backstage, Auftritt, Jury-Show, Ergebnisse, Training, Bonus, Archiv, Einstellungen. */
(function () {
  'use strict';
  const S = window.SMYV, D = S.D, A = window.SMYVAudio, AV = window.SMYVAvatar, ST = window.SMYVStage;
  const KEY = 'smyv-save';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (str, map) => String(str).replace(/\{(\w+)\}/g, (m, k) => (map && map[k] != null ? map[k] : m));
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const pct = v => Math.round(v * 100) + ' %';
  const nf = v => String(v).replace('.', ',');
  const cand = id => D.CANDIDATES.find(c => c.id === id);
  const jur = id => D.JURY.find(j => j.id === id);
  const ico = (i, cls) => `<span class="ico ${cls || ''}" style="background-position:${(i / 9 * 100).toFixed(3)}% 0" aria-hidden="true"></span>`;
  const meter = (v, max) => `<div class="meter"><i style="width:${Math.max(0, Math.min(100, v / (max || 100) * 100))}%"></i></div>`;

  let save = load(), cur = 'sTitle', stage = null, flow = null, timers = [];
  const backTo = {};
  const prep = { music: 'radio:ricorewi', style: 'pop', approach: 'gefuehl', action: 'publikum' };
  const sysReduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Speicher ----------
  function load() {
    let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) { /* kein Speicher */ }
    if (!raw) return S.freshSave();
    try { return S.repair(JSON.parse(raw)); }
    catch (e) { try { localStorage.setItem(KEY + '-defekt', raw); } catch (x) { /* egal */ } return S.freshSave(); }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { toast('⚠️ Spielstand konnte nicht gespeichert werden'); }
  }
  const reduced = () => !!save.settings.reduced || sysReduced;
  function applySettings() {
    const s = save.settings;
    A.setVolume({ music: +s.music, sfx: +s.sfx, mute: !!s.mute });
    document.body.classList.toggle('big', !!s.big);
    document.body.classList.toggle('cb', !!s.cb);
    document.body.classList.toggle('reduced', reduced());
  }

  // ---------- Hilfen ----------
  let toastT = 0, capT = 0;
  function toast(msg, ms) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2400); }
  function caption(msg) { if (!save.settings.captions) return; const c = $('#caption'); c.textContent = msg; c.hidden = false; clearTimeout(capT); capT = setTimeout(() => { c.hidden = true; }, 1600); }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function sfx(n, a, cap) { A.sfx(n, a); if (cap) caption(cap); }

  const BG = { sTitle: 'stage', sMenu: 'stage', sAvatar: 'backstage', sBack: 'backstage', sPrep: 'backstage', sResult: 'chairs', sOut: 'out', sWin: 'win',
    sCands: 'backstage', sProfile: 'backstage', sTrain: 'backstage', sBonus: 'arena', sArchive: 'arena', sSettings: 'stage', sHelp: 'stage', sCredits: 'stage' };
  function setBg(name, dim) { const el = $('#bg'); el.style.backgroundImage = 'url(img/bg-' + name + '.jpg)'; el.classList.toggle('dim', !!dim); }
  const RENDER = {};
  function go(id, arg) {
    clearTimers();
    document.querySelectorAll('.scr.on').forEach(s => s.classList.remove('on'));
    const el = document.getElementById(id); cur = id; el.classList.add('on'); el.scrollTop = 0;
    if (BG[id]) setBg(BG[id], !['sTitle', 'sOut', 'sWin'].includes(id));
    if (RENDER[id]) RENDER[id](arg);
    focusFirst(el);
  }
  function sub(id, arg) { backTo[id] = cur; go(id, arg); }
  function back() { go(backTo[cur] || 'sMenu'); }
  function focusFirst(root) {
    const f = root.querySelector('[data-focus]') || root.querySelector('.btn:not([disabled]), .opt');
    if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* alt */ }
  }

  // Overlay
  let ovEsc = null;
  function overlay(html, binds) {
    $('#ovBox').innerHTML = html; $('#ov').hidden = false;
    $('#ovBox').querySelectorAll('[data-act]').forEach(b => { b.onclick = () => { A.sfx('click'); const f = binds[b.dataset.act]; if (f) f(b); }; });
    ovEsc = binds.esc || closeOv; focusFirst($('#ovBox'));
  }
  function closeOv() { $('#ov').hidden = true; $('#ovBox').innerHTML = ''; ovEsc = null; const el = document.getElementById(cur); if (cur !== 'sStage') focusFirst(el); }
  function confirmBox(title, text, yes, onYes) {
    overlay(`<h3>${title}</h3><p>${text}</p><button class="btn red" data-act="y" type="button">${yes}</button><button class="btn" data-act="n" type="button">Abbrechen</button>`,
      { y: () => { closeOv(); onYes(); }, n: closeOv });
  }

  // ---------- Tastatur & Controller in Menüs ----------
  function navKeys(e, root) {
    const dirs = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }, d = dirs[e.code];
    if (!d || !root) return;
    const t = document.activeElement;
    if (t && t.tagName === 'INPUT' && (t.type === 'text' || (t.type === 'range' && d[0]))) return;
    const els = Array.from(root.querySelectorAll('button:not([disabled]), a[href], input, summary')).filter(x => x.offsetParent !== null && !x.closest('.pads'));
    if (!els.length) return;
    e.preventDefault();
    if (!t || !els.includes(t)) { els[0].focus(); return; }
    const r = t.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bs = 1e9;
    for (const x of els) {
      if (x === t) continue;
      const q = x.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
      const along = dx * d[0] + dy * d[1]; if (along <= 4) continue;
      const sc = along + (Math.abs(dx * d[1]) + Math.abs(dy * d[0])) * 2.5;
      if (sc < bs) { bs = sc; best = x; }
    }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); A.sfx('move'); }
  }
  addEventListener('keydown', e => {
    if (cur === 'sStage' && stage && !stage.paused) return;      // Bühne verarbeitet selbst
    if (!$('#ov').hidden) { if (e.code === 'Escape') { e.preventDefault(); if (ovEsc) ovEsc(); } else navKeys(e, $('#ovBox')); return; }
    if (cur === 'sTitle' && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyF')) { e.preventDefault(); start(); return; }
    if (e.code === 'Escape') { const b = document.querySelector('#' + cur + ' [data-back]'); if (b) { e.preventDefault(); b.click(); } return; }
    navKeys(e, document.getElementById(cur));
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-back]'); if (b) { A.sfx('click'); back(); return; }
    if (e.target.closest('.btn,.opt')) A.sfx('click');
  });
  addEventListener('gamepadconnected', () => toast('🎮 Controller verbunden – Ⓐ wählen, Ⓑ zurück, Start = Pause'));
  $('#ov').addEventListener('click', e => { if (e.target.id === 'ov' && ovEsc) ovEsc(); });

  // ---------- Titel & Menü ----------
  function start() { A.init(); applySettings(); go('sMenu'); }
  $('#bStart').onclick = start;
  $('#sTitle').addEventListener('pointerdown', e => { if (!e.target.closest('button')) start(); });

  RENDER.sMenu = () => {
    const s = save.season, p = save.profile, running = p && s && s.status === 'backstage';
    const it = [];
    if (running) it.push(['cont', 'gold wide', '▶ Karriere fortsetzen', esc(p.name) + ' · ' + D.ROUNDS[s.round].name]);
    it.push(['new', running ? 'violet' : 'gold wide', '🌟 Neue Karriere', 'Avatar, Casting, ganze Staffel']);
    it.push(['free', 'pink', '🎤 Freies Casting', 'Ein Auftritt vor der Jury']);
    it.push(['train', 'violet', '🏋️ Training', 'Drei Minispiele mit Sophie']);
    it.push(['bonus', 'blue', '❄️ Winterglanz-Gala', 'Bonus-Challenge · Rekord ' + (save.best || 0)]);
    it.push(['arch', 'blue', '📺 Show-Archiv', 'Alle Folgen auf YouTube']);
    it.push(['prof', '', '👤 Profil & Erfolge', p ? esc(p.name) + ' · Level ' + S.level(p.xp) : 'Noch kein Avatar']);
    it.push(['set', '', '⚙️ Einstellungen', 'Ton, Mikrofon, Barrierefreiheit']);
    it.push(['help', '', '🎮 Steuerung & Tutorial', 'So wird gespielt']);
    it.push(['cred', '', 'ℹ️ Credits', 'Über SHOW ME YOUR VOICE']);
    $('#menuList').innerHTML = it.map(([id, cls, t, s2]) => `<button class="btn ${cls}" data-m="${id}" type="button"><span>${t}<small>${s2}</small></span></button>`).join('');
  };
  $('#menuList').addEventListener('click', e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    const m = b.dataset.m, p = save.profile;
    if (m === 'cont') go('sBack');
    else if (m === 'new') {
      if (!p) return openAvatar('career');
      const running = save.season && save.season.status === 'backstage' && save.season.round > 0;
      overlay(`<h3>🌟 Neue Karriere</h3>${running ? '<p class="muted">Deine laufende Staffel wird dabei beendet.</p>' : ''}
        <button class="btn gold" data-act="season" type="button">Neue Staffel mit ${esc(p.name)}</button>
        <button class="btn" data-act="ava" type="button">Neuen Avatar erstellen</button>
        <button class="btn sm" data-act="x" type="button">Abbrechen</button>`,
      { season: () => { closeOv(); startSeason(); }, ava: () => { closeOv(); openAvatar('fresh'); }, x: closeOv });
    } else if (m === 'free') { if (!p) openAvatar('free'); else sub('sPrep', 'free'); }
    else if (m === 'train') sub('sTrain', 'practice');
    else if (m === 'bonus') sub('sBonus');
    else if (m === 'arch') sub('sArchive');
    else if (m === 'prof') { if (!p) openAvatar('prof'); else sub('sProfile'); }
    else if (m === 'set') sub('sSettings');
    else if (m === 'help') sub('sHelp');
    else if (m === 'cred') sub('sCredits');
  });

  // ---------- Avatar ----------
  const ROWS = [['skin', 'Hautton', 'sw'], ['hair', 'Frisur', 'step'], ['hairColor', 'Haarfarbe', 'sw'], ['beard', 'Bart', 'step'],
    ['outfit', 'Outfit', 'step'], ['outfitColor', 'Outfit-Farbe', 'sw'], ['acc', 'Accessoire', 'step'], ['piercing', 'Piercing', 'step']];
  const edit = { look: null, mode: 'career', expr: 'neutral' };
  function openAvatar(mode) {
    edit.mode = mode; edit.look = Object.assign({}, AV.DEF, mode === 'edit' && save.profile ? save.profile.look : {});
    backTo.sAvatar = mode === 'edit' ? 'sProfile' : 'sMenu';
    go('sAvatar');
    $('#avaName').value = mode === 'edit' || mode === 'free' || mode === 'prof' ? (save.profile ? save.profile.name : '') : '';
  }
  function drawAva() { $('#avaPrev').innerHTML = AV.svg(edit.look, edit.expr); }
  RENDER.sAvatar = () => {
    $('#avaRows').innerHTML = ROWS.map(([k, label, kind]) => {
      if (kind === 'sw') return `<div class="optRow"><span>${label}</span><div class="sw">${AV.OPT[k].map((c, i) => `<button type="button" data-k="${k}" data-v="${i}" style="background:${c}" aria-label="${label} ${i + 1}" aria-pressed="${edit.look[k] === i}"></button>`).join('')}</div></div>`;
      return `<div class="optRow"><span>${label}</span><div class="stepper"><button class="btn sm" type="button" data-k="${k}" data-d="-1" aria-label="${label} zurück">◀</button><b id="av_${k}">${AV.LABEL[k][edit.look[k]]}</b><button class="btn sm" type="button" data-k="${k}" data-d="1" aria-label="${label} weiter">▶</button></div></div>`;
    }).join('');
    edit.expr = 'happy'; drawAva();
  };
  $('#avaRows').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (b.dataset.v != null) {
      edit.look[k] = +b.dataset.v;
      b.parentNode.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    } else {
      const list = AV.OPT[k], i = (list.indexOf(edit.look[k]) + +b.dataset.d + list.length) % list.length;
      edit.look[k] = list[i]; $('#av_' + k).textContent = AV.LABEL[k][list[i]];
    }
    edit.expr = rnd(['happy', 'neutral', 'shock']); drawAva();
  });
  $('#avaRnd').onclick = () => {
    ROWS.forEach(([k, , kind]) => { const l = AV.OPT[k]; edit.look[k] = kind === 'sw' ? Math.floor(Math.random() * l.length) : rnd(l); });
    RENDER.sAvatar();
  };
  $('#avaOk').onclick = () => {
    const name = S.cleanName($('#avaName').value);
    if (edit.mode === 'edit' && save.profile) { save.profile.name = name; save.profile.look = Object.assign({}, edit.look); persist(); toast('✔ Avatar gespeichert'); go('sProfile'); return; }
    if (!save.profile || edit.mode === 'fresh' || edit.mode === 'career') { save.profile = S.newProfile(name, edit.look); save.season = null; }
    else { save.profile.name = name; save.profile.look = Object.assign({}, edit.look); }
    persist();
    if (edit.mode === 'free') { backTo.sPrep = 'sMenu'; go('sPrep', 'free'); }
    else if (edit.mode === 'prof') { backTo.sProfile = 'sMenu'; go('sProfile'); }
    else startSeason();
  };

  // ---------- Staffel ----------
  function startSeason() {
    save.season = S.newSeason((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, save.settings.difficulty);
    persist(); go('sBack', { welcome: true });
  }
  function hostLine(s, def, welcome) {
    const p = save.profile, m = D.MOTTOS[s.motto];
    if (welcome) return fill(rnd(D.HOST.welcome), { n: p.name });
    return fill(rnd(D.HOST.intro[def.id]), { n: p.name, x: def.topX || '', motto: m.name });
  }
  RENDER.sBack = arg => {
    const s = save.season, p = save.profile;
    if (!s || !p) { go('sMenu'); return; }
    if (s.status === 'out') { go('sOut'); return; }
    if (s.status === 'done') { go('sWin'); return; }
    const def = D.ROUNDS[s.round], last = s.results[s.results.length - 1];
    const tree = D.ROUNDS.map((r, i) => `<div class="node ${i < s.round ? 'done' : i === s.round ? 'cur' : 'lock'}"><i>${i < s.round ? '✅' : i === s.round ? r.icon : '🔒'}</i>${r.name}</div>`).join('');
    const tip = rnd(D.COACH.tips);
    $('#backBox').innerHTML = `
      <header class="bar"><button class="btn sm" type="button" data-b="menu">🏠 Menü</button><h2>Backstage · Staffel</h2><span class="tag gold">⭐ ${p.fans} Fans</span></header>
      <div class="tree" aria-label="Staffelverlauf">${tree}</div>
      <div class="panel host">${AV.svg(D.HOST.look, 'happy')}<div class="speech"><b>Rico:</b> ${esc(hostLine(s, def, arg && arg.welcome))}</div></div>
      <div class="panel">
        <p><b>${def.icon} Nächste Runde: ${def.name}</b> – ${esc(def.rule)}</p>
        <p class="muted">Noch im Rennen: ${s.field.length} Kandidaten${last ? ` · Letzte Runde: Platz ${last.rank} von ${last.of}, Performance ${nf(last.perf)}` : ''}${s.golden ? ' · Goldenes Ticket bereits vergeben' : ''}</p>
        <button class="btn gold xl" type="button" data-b="stage" data-focus style="width:100%">🎤 Auf die Bühne: ${def.name}</button>
      </div>
      <div class="grid3">
        <button class="btn violet" type="button" data-b="train" ${s.trainLeft < 1 ? 'disabled' : ''}>🏋️ Training (${s.trainLeft} übrig)</button>
        <button class="btn pink" type="button" data-b="comm" ${s.commLeft < 1 ? 'disabled' : ''}>📱 Community-Aktion (${s.commLeft}/1)</button>
        <button class="btn blue" type="button" data-b="cands">👥 Kandidaten</button>
        <button class="btn" type="button" data-b="prof">👤 Profil</button>
      </div>
      <div class="panel coach" style="margin-top:12px"><img src="${D.COACH.img}" alt="Sophie"><p><b>Sophie (Vocal-Coach):</b> ${esc(tip)}</p></div>`;
    if (S.rollEvent(s)) later(backEvent, 600);
  };
  // Backstage-Drama: einmal pro Runde ab dem Recall, eine Entscheidung ist Pflicht
  function backEvent() {
    const s = save.season, ev = S.rollEvent(s); if (!ev || cur !== 'sBack') return;
    const others = s.field.filter(id => id !== 'p'), nm = k => others.length ? cand(others[(s.round + k) % others.length]).name : 'Jemand';
    const txt = fill(ev.text, { rival: nm(0), friend: nm(1) });
    overlay(`<h3>${ev.icon} ${esc(ev.title)}</h3><p>${esc(txt)}</p><p class="muted">Backstage-Ereignis – du musst dich entscheiden.</p>` +
      ev.a.map((a, i) => `<button class="btn" type="button" data-act="c${i}" ${a.train < 0 && s.trainLeft < 1 ? 'disabled' : ''}>${esc(a.t)}<br><small>${esc(a.d)}</small></button>`).join(''),
    Object.assign({ esc: () => {} }, Object.fromEntries(ev.a.map((a, i) => ['c' + i, () => {
      if (S.applyEvent(s, save.profile, i)) { persist(); closeOv(); toast(ev.icon + ' ' + a.d, 3000); RENDER.sBack(); focusFirst($('#sBack')); }
    }]))));
    sfx('cue', 0, ev.icon + ' ' + ev.title);
  }
  $('#backBox').addEventListener('click', e => {
    const b = e.target.closest('[data-b]'); if (!b || b.disabled) return;
    const k = b.dataset.b;
    if (k === 'menu') go('sMenu');
    else if (k === 'stage') { backTo.sPrep = 'sBack'; go('sPrep', 'career'); }
    else if (k === 'train') sub('sTrain', 'career');
    else if (k === 'cands') sub('sCands');
    else if (k === 'prof') sub('sProfile');
    else if (k === 'comm') {
      const fr = cand(D.CANDIDATES[Math.floor(Math.random() * D.CANDIDATES.length)].id);
      overlay(`<h3>📱 Community-Aktion</h3><p class="muted">Eine Aktion pro Runde. Fans erhöhen deine Votes in jeder Runde.</p>` +
        D.COMMUNITY.map(c => `<button class="btn" type="button" data-act="${c.id}" ${c.train && save.season.trainLeft < 1 ? 'disabled' : ''}>${c.icon} ${c.name}<br><small>${esc(c.desc)}</small></button>`).join('') +
        '<button class="btn sm" type="button" data-act="x">Abbrechen</button>',
      Object.assign({ x: closeOv }, Object.fromEntries(D.COMMUNITY.map(c => [c.id, () => {
        if (S.applyCommunity(save.season, save.profile, c.id)) { persist(); closeOv(); sfx('applause', 1.5, '👏 Applaus'); toast(c.id === 'duett' ? `🎶 Duett mit ${fr.name}! +${c.fans} Fans, +3 Ausdruck` : `${c.icon} +${c.fans} Fans`); RENDER.sBack(); focusFirst($('#sBack')); }
      }]))));
    }
  });

  // ---------- Vorbereitung ----------
  let prepMode = 'career';
  const station = slug => D.STATIONS.find(x => x.slug === slug);
  function musicOf(sel) {   // { radio: slug|null, style, song }
    const m = String(sel.music || ''), st = m.startsWith('radio:') ? station(m.slice(6)) : null;
    if (st && save.settings.source === 'radio') return { radio: st.slug, style: st.style, name: st.name };
    const k = m.startsWith('own:') && D.STYLES[m.slice(4)] ? m.slice(4) : (D.STYLES[sel.style] ? sel.style : 'pop');
    return { radio: null, style: k, name: null };
  }
  RENDER.sPrep = mode => {
    prepMode = mode || prepMode;
    const career = prepMode === 'career', s = save.season, def = career ? D.ROUNDS[s.round] : D.ROUNDS[0];
    const motto = career && def.id === 'motto' ? D.MOTTOS[s.motto] : null;
    const songOf = k => motto ? motto.songs[k] : D.SONGS[k];
    const radioOn = save.settings.source === 'radio';
    if (!radioOn && String(prep.music).startsWith('radio:')) prep.music = 'own:' + prep.style;
    const opt = (group, k, title, desc) => `<button type="button" class="opt" data-g="${group}" data-v="${k}" aria-pressed="${prep[group] === k}"><b>${title}</b><small>${desc}</small></button>`;
    const partsTxt = def.parts.map(t => t === 'rhythm' ? '🥁 Rhythmus' : t === 'pitch' ? '🎤 Gesang' : t === 'group' ? '👥 Gruppe' : '⚔️ Rivale').join(' → ');
    let rivalTxt = '';
    if (career && def.battle) { const op = opponent(s); if (op) rivalTxt = `<p>⚔️ Dein Gegner: <b>${esc(op.name)}</b> (${D.STYLES[op.style].name}, stark in ${op.strong})</p>`; }
    if (career && def.id === 'recall') rivalTxt = `<p>👥 Deine Gruppe: <b>${groupOf(s).map(g => esc(g.name)).join(' und ')}</b></p>`;
    const music = (radioOn ? D.STATIONS.filter(x => x.style !== 'winter').map(st => opt('music', 'radio:' + st.slug, '📻 ' + st.name, `${st.desc} · Stil: ${D.STYLES[st.style].name}`)) : [])
      .concat(Object.keys(D.STYLES).map(k => opt('music', 'own:' + k, `🎹 ${D.STYLES[k].name}: „${songOf(k)}“`, `Eigener Song (offline) · ${D.STYLES[k].bpm} BPM · ${D.STYLES[k].desc}`)));
    $('#prepBox').innerHTML = `
      <header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>${career ? def.icon + ' ' + def.name : '🎤 Freies Casting'}</h2><span></span></header>
      ${motto ? `<div class="banner gold" style="font-size:1.1em">Motto: ${motto.name}</div>` : ''}
      <div class="panel"><p><b>Ablauf:</b> ${partsTxt}</p><p class="muted">${esc(career ? def.rule : 'Keine Wertung für die Staffel – perfekt zum Üben. Weiter mit 2 von 3 Jury-Ja.')}</p>${rivalTxt}</div>
      <h3>1 · Deine Musik</h3><div class="opts">${music.join('')}</div>
      <p class="hint" style="text-align:left">${radioOn ? '📻 <b>Quelle:</b> Live-Programm des gewählten RicoReWi-Senders über laut.fm. Die Noten entstehen aus den Beats des laufenden Songs, Interpret und Titel stehen im Auftritt oben. Alle Rechte an der Musik liegen bei den jeweiligen Urhebern. Ohne Verbindung spielt das Spiel eigene Beats.' : '🎹 Eigene Songs: Musik wird live im Browser erzeugt. Radio-Sender kannst du in den Einstellungen einschalten.'} Der Stil bestimmt, welche Jurorin oder welcher Juror einen Bonus gibt.</p>
      <h3>2 · Dein Ansatz</h3><div class="opts">${Object.keys(D.APPROACH).map(k => opt('approach', k, D.APPROACH[k].name, D.APPROACH[k].desc)).join('')}</div>
      <h3>3 · Bühnen-Aktion</h3><div class="opts">${Object.keys(D.ACTION).map(k => opt('action', k, D.ACTION[k].name, D.ACTION[k].desc)).join('')}</div>
      <p class="muted">${def.parts.includes('pitch') ? (save.settings.mic ? '🎙️ Mikrofon ist an: In Gesangsteilen hört das Spiel deine Tonhöhe (nur lokal).' : '🎤 Gesang mit Tasten/Touch. Mikrofon kannst du in den Einstellungen einschalten.') : ''}</p>
      <button class="btn gold xl" type="button" id="bGo" data-focus style="width:100%">${career && def.id !== 'casting' ? '🎙️ Zum Interview mit Rico' : '🚪 Zum Wartebereich'}</button>`;
  };
  $('#prepBox').addEventListener('click', e => {
    const o = e.target.closest('.opt');
    if (o) {
      prep[o.dataset.g] = o.dataset.v; o.parentNode.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed', String(x === o)));
      if (o.dataset.g === 'music') prep.style = musicOf(prep).style;
      return;
    }
    if (e.target.closest('#bGo')) { backTo.sTalk = 'sPrep'; go('sTalk', prepMode); }
  });
  function opponent(s) {
    const prev = (s.lastRank || []).filter(id => s.field.includes(id));
    s.field.forEach(id => { if (!prev.includes(id)) prev.push(id); });
    const i = prev.indexOf('p'); if (i < 0) return null;
    const j = prev.length - 1 - i; if (j === i) return null;
    return cand(prev[j]);
  }
  function groupOf(s) {   // Dreiergruppe im Recall: die zwei Startnummern nach dir
    const ids = s.order.filter(id => id !== 'p' && s.field.includes(id)), i = s.order.indexOf('p');
    const after = ids.filter(id => s.order.indexOf(id) > i).concat(ids.filter(id => s.order.indexOf(id) < i));
    return after.slice(0, 2).map(cand);
  }

  // ---------- Wartebereich & Gespräch ----------
  const talk = { mode: 'career', list: [], qi: 0, symp: {}, votes: 0, log: [] };
  RENDER.sTalk = mode => {
    talk.mode = mode || talk.mode; talk.qi = 0; talk.symp = {}; talk.votes = 0; talk.log = [];
    const s = save.season, career = talk.mode === 'career', def = career ? D.ROUNDS[s.round] : D.ROUNDS[0];
    talk.casting = def.id === 'casting';
    talk.list = talk.casting ? D.INTERVIEW : [D.HOST_Q[(s ? s.round : 0) % D.HOST_Q.length]];
    let wait = '';
    if (career && talk.casting) {
      const me = s.order.indexOf('p'), before = s.order.slice(0, me).map(cand);
      wait = `<div class="panel"><p><b>🚪 Wartebereich · Casting-Tag</b> – deine Startnummer: <span class="tag gold">#${me + 1}</span> von ${s.order.length}</p>
        ${before.length ? '<p class="muted">Schon vor der Jury:</p>' + before.map(c => { const a = S.aiPerf(s, c, 0), j = S.judge(a.crit, c.style, s.seed, 0, c.id), y = j.filter(x => x.yes).length; return `<span class="tag ${y >= 2 ? 'ok' : 'bad'}">${esc(c.name)} ${y >= 2 ? '✅' : '❌'} ${y}/3</span>`; }).join('') : '<p class="muted">Du bist als Erste/r dran!</p>'}</div>`;
    }
    $('#talkBox').innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>${talk.casting ? '🎤 Vor der Jury' : '🎙️ Interview'}</h2><span></span></header>
      ${wait}<div class="panel" id="talkQ"></div>`;
    talkStep();
  };
  function talkStep() {
    const box = $('#talkQ'), name = save.profile.name, done = talk.qi >= talk.list.length;
    const log = talk.log.map(l => `<p class="muted">${esc(l)}</p>`).join('');
    if (done) {
      const sy = Object.keys(talk.symp).filter(k => talk.symp[k]).map(k => `${jur(k).name} ${talk.symp[k] > 0 ? '+' : ''}${talk.symp[k]}`);
      box.innerHTML = `${log}<p><b>${talk.casting ? 'Die Jury nickt dir zu.' : 'Rico: „Viel Glück – die Bühne gehört dir!“'}</b></p>
        <p class="hint" style="text-align:left">Wirkung: ${sy.length ? 'Sympathie ' + sy.join(', ') : 'keine Sympathie-Änderung'}${talk.votes ? ' · +' + talk.votes + ' Votes' : ''}</p>
        <button class="btn gold xl" type="button" id="bStageGo" data-focus style="width:100%">🎬 Auf die Bühne!</button>`;
      $('#bStageGo').onclick = () => { if (talk.mode === 'career') startCareerRound(); else startFree(); };
      focusFirst(box); return;
    }
    const q = talk.list[talk.qi];
    box.innerHTML = `${log}<div class="host">${talk.casting ? `<img class="jimg" src="${jur(q.q.startsWith('Marc') ? 'marc' : q.q.startsWith('Lena') ? 'lena' : 'david').img}" alt="">` : AV.svg(D.HOST.look, 'happy')}<div class="speech">${esc(fill(q.q, { n: name }))}</div></div>
      <div class="opts" style="margin-top:10px">${q.a.map((a, i) => `<button type="button" class="opt" data-a="${i}"><b>${esc(fill(a[0], { n: name }))}</b></button>`).join('')}</div>`;
    focusFirst(box);
  }
  $('#talkBox').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const q = talk.list[talk.qi], a = q.a[+b.dataset.a];
    const fx = [];
    for (const k in a[1]) { talk.symp[k] = (talk.symp[k] || 0) + a[1][k]; fx.push(`${jur(k).name} ${a[1][k] > 0 ? 'lächelt (+' + a[1][k] + ')' : 'runzelt die Stirn (' + a[1][k] + ')'}`); }
    if (a[2]) { talk.votes += a[2]; fx.push('Publikum jubelt (+' + a[2] + ' Votes)'); }
    talk.log.push('Du: ' + fill(a[0], { n: save.profile.name }) + (fx.length ? ' → ' + fx.join(', ') : ''));
    talk.qi++; talkStep();
  });

  function buildParts(def, seed, song, round, mu) {
    const st = D.STYLES[mu.style] || D.STYLES.pop, ap = D.APPROACH[prep.approach], ac = D.ACTION[prep.action];
    const fast = !!ac.fast || !!(save.season && save.season.mods && save.season.mods.fast);
    let rc = 0;
    return def.parts.map((t, i) => {
      if (t === 'rhythm') { rc++; return { type: 'rhythm', len: def.len, bpm: st.bpm, style: mu.style, density: ap.density + (round || 0) * 0.04, seed: seed + i * 101, shows: rc === 1 ? ac.shows : Math.min(1, ac.shows), fastShows: fast, title: '„' + song + '“', sub: rc === 1 ? 'Triff die Noten im Takt' : 'Zweiter Teil – jetzt Gas geben!' }; }
      if (t === 'pitch') return { type: 'pitch', len: def.len, bpm: st.bpm, style: mu.style, seed: seed + i * 101, title: '🎤 Gesangsteil', sub: save.settings.mic ? 'Sing die Melodie mit' : 'Halte den Punkt auf der Linie' };
      return { type: 'rival', len: t === 'group' ? 6 : 4.5, group: t === 'group', title: '', sub: '' };
    });
  }
  function startCareerRound() {
    const s = save.season; if (!s || s.status !== 'backstage') { go('sBack'); return; }
    const def = D.ROUNDS[s.round], motto = def.id === 'motto' ? D.MOTTOS[s.motto] : null, mu = musicOf(prep);
    const song = mu.radio ? mu.name : motto ? motto.songs[mu.style] : D.SONGS[mu.style];
    let rival = null, group = null;
    if (def.battle) { const op = opponent(s); if (op) rival = { c: op, perf: S.aiPerf(s, op, s.round).perf }; }
    if (def.parts.includes('group')) group = groupOf(s).map(c => ({ c, perf: S.aiPerf(s, c, s.round).perf }));
    const playId = S.startRound(s); if (playId == null) return;
    persist();
    runStage({ mode: 'career', playId, sel: Object.assign({}, prep, { style: mu.style }), radio: mu.radio, talk: { symp: talk.symp, votes: talk.votes },
      parts: buildParts(def, S.hash(s.seed + ':perf:' + s.round), song, s.round, mu), juryStop: def.id === 'casting',
      title: def.icon + ' ' + def.name + (mu.radio ? '' : ' · „' + song + '“'), bg: def.bg, rival, group, mic: def.parts.includes('pitch'), ret: 'sBack' });
  }
  function startFree() {
    const def = D.ROUNDS[0], mu = musicOf(prep);
    runStage({ mode: 'free', sel: Object.assign({}, prep, { style: mu.style }), radio: mu.radio, talk: { symp: talk.symp, votes: 0 }, juryStop: true,
      parts: buildParts(def, (Date.now() & 0xffffff) >>> 0, mu.radio ? mu.name : D.SONGS[mu.style], 0, mu),
      title: '🎤 Freies Casting' + (mu.radio ? '' : ' · „' + D.SONGS[mu.style] + '“'), bg: 'stage', mic: false, ret: 'sPrep' });
  }

  // ---------- Bühne ----------
  function stopAll() { if (stage) { stage.stop(); stage = null; } A.micStop(); A.radioStop(); }
  async function runStage(cfg) {
    A.init(); applySettings();
    let mic = false, radio = false;
    cfg.parts.forEach(p => { if (p.type === 'rhythm') p.live = false; });
    if (cfg.radio && save.settings.source === 'radio' && cfg.parts.some(p => p.type === 'rhythm')) {
      const st = station(cfg.radio);
      overlay(`<h3>📻 Verbinde mit ${esc(st.name)} …</h3><p class="muted">Live-Stream über laut.fm</p>`, { esc: () => {} });
      try { await A.radioStart(cfg.radio, ST.TRAVEL[save.settings.speed] || 1.5, cfg.radioUrl); radio = true; }
      catch (e) { toast('📻 ' + st.name + ' ist gerade nicht erreichbar – du singst zu eigenen Beats.', 3500); }
      closeOv();
      cfg.parts.forEach(p => { if (p.type === 'rhythm') p.live = radio; });
    }
    if (cfg.mic && save.settings.mic) { try { await A.micStart(); mic = true; } catch (e) { toast('🎙️ Mikrofon nicht verfügbar – du singst mit Tasten/Touch.'); } }
    flow = cfg; go('sStage'); setBg(cfg.bg || 'stage', true);
    $('#stTitle').textContent = cfg.title;
    cfg.credit = '';
    if (radio) {
      const st = station(cfg.radio); cfg.credit = '📻 ' + st.name + ' (laut.fm)'; $('#stTitle').textContent = cfg.title + ' · ' + cfg.credit;
      A.radioSong(cfg.radio).then(sg => { if (sg && flow === cfg) { cfg.credit = '📻 Quelle: ' + st.name + ' auf laut.fm – ' + (sg.artist ? sg.artist + ' – ' : '') + sg.title; $('#stTitle').textContent = cfg.title + ' · ' + cfg.credit.replace('📻 Quelle: ', '📻 '); } });
    }
    $('#juryStrip').innerHTML = cfg.noJury ? '' : D.JURY.map(j => `<img src="${j.img}" alt="${j.name}" data-j="${j.id}">`).join('');
    $('#snow').hidden = !cfg.bonus || reduced();
    $('#rivalBox').hidden = true;
    const pads = $('#pads'); pads.className = 'pads' + (('ontouchstart' in window || navigator.maxTouchPoints > 0) ? '' : ' auto');
    stage = new ST.Stage({ canvas: $('#cv'), pads, parts: cfg.parts, settings: save.settings, mic, bonus: !!cfg.bonus, hints: cfg.hints, captions: caption, juryStop: !!cfg.juryStop,
      onPart: (i, p) => {
        pads.classList.toggle('pitch', p.type === 'pitch'); pads.classList.toggle('hide', p.type === 'rival');
        pads.querySelectorAll('.pad i').forEach((x, k) => { x.textContent = p.type === 'cues' ? ST.CUES[k][0] : ''; });
        const rb = $('#rivalBox'), who = p.group ? (cfg.group || []) : cfg.rival ? [cfg.rival] : [];
        if (p.type === 'rival' && who.length) {
          rb.innerHTML = `<p><b>${p.group ? '👥 Deine Gruppe singt' : '⚔️ Dein Gegner ist dran'}</b></p><div class="grid3">${who.map((w, k) => `<div>${AV.svg(w.c.look, 'happy')}<p><b>${esc(w.c.name)}</b></p><div class="meter" data-w="${k}"><i></i></div></div>`).join('')}</div><p class="muted" id="rvTxt"></p>`;
          rb.hidden = false; rb.dataset.n = who.length; sfx('applause', 1.5, '👏 Publikum jubelt');
        } else rb.hidden = true;
      },
      onRival: k => {
        const who = stage && stage.part && stage.part.group ? (cfg.group || []) : cfg.rival ? [cfg.rival] : [];
        who.forEach((w, i) => { const m = $('#rivalBox [data-w="' + i + '"] i'); if (m) m.style.width = (k * w.perf) + '%'; });
        if (k >= 1 && $('#rvTxt')) $('#rvTxt').textContent = 'Starker Part! Jetzt bist du wieder dran.';
      },
      onPause: auto => showPause(auto),
      onEvent: k => {
        if (k === 'stop') { toast('✋ David: „Stopp! Danke, das reicht uns.“', 3000); caption('✋ Die Jury bricht ab'); A.sfx('buzzer'); return; }
        const imgs = $('#juryStrip').querySelectorAll('img'); const cls = k === 'combo' ? 'nod' : k === 'show' ? 'wow' : 'frown';
        imgs.forEach((im, i) => { if (k !== 'miss' || i === 0) { im.classList.add(cls); setTimeout(() => im.classList.remove(cls), 700); } });
      },
      onDone: out => { stage = null; A.micStop(); A.radioStop(); finishStage(out); } });
  }
  $('#bPause').onclick = () => { if (stage) stage.pause(false); };
  function showPause(auto) {
    const career = flow && (flow.mode === 'career' || flow.mode === 'encore');
    overlay(`<h3>⏸ Pause</h3>${auto ? '<p class="muted">Automatisch angehalten.</p>' : ''}${flow && flow.credit ? `<p class="hint">${esc(flow.credit)}</p>` : ''}
      <button class="btn gold" type="button" data-act="go">▶ Weiter</button>
      ${career ? '<button class="btn red" type="button" data-act="end">Auftritt beenden (Rest zählt als verpasst)</button>'
    : '<button class="btn" type="button" data-act="re">↻ Neu starten</button><button class="btn red" type="button" data-act="quit">✖ Abbrechen</button>'}
      <p class="hint">Esc, P oder Start setzt fort</p>`,
    { go: resume, esc: resume,
      end: () => { closeOv(); if (stage) stage.abort(); },
      re: () => { closeOv(); stopAll(); runStage(flow); },
      quit: () => { closeOv(); stopAll(); go(flow.ret || 'sMenu'); } });
    function resume() { closeOv(); if (stage) stage.resume(); }
  }
  // Während der Pause: P/Start setzt ebenfalls fort
  addEventListener('keydown', e => { if (cur === 'sStage' && stage && stage.paused && e.code === 'KeyP' && !$('#ov').hidden) { e.preventDefault(); closeOv(); stage.resume(); } });

  // Zugabe a cappella: bei genau einem Ja im Casting
  function askEncore(f, out, oc) {
    const doubter = D.JURY.find(j => j.id === 'marc');
    overlay(`<h3>🎤 Die Jury berät …</h3><img class="jimg" src="${doubter.img}" alt="${doubter.name}" style="width:76px;height:120px">
      <p><b>${doubter.name}:</b> „Wir sind uns nicht einig. Sing uns noch etwas – a cappella, ganz ohne Musik!“</p>
      <p class="hint">Zugabe: Ab 70 % auf der Linie wechselt eine Nein-Stimme zu Ja.</p>
      <button class="btn gold" type="button" data-act="go">🎤 Zugabe singen</button><button class="btn" type="button" data-act="no">Nein danke</button>`,
    { go: () => { closeOv(); runStage({ mode: 'encore', parent: { f, out, oc }, noJury: false, bg: f.bg, mic: true, ret: f.ret, title: '🎤 Zugabe a cappella',
      parts: [{ type: 'pitch', len: 12, bpm: 84, style: 'ballade', acappella: true, seed: (Date.now() & 0xffff) >>> 0, title: '🎤 Zugabe a cappella', sub: 'Nur du und deine Stimme' }] }); },
    no: () => { closeOv(); oc.encore = 0; resolveAndShow(f, out, oc); }, esc: () => {} });
  }
  function buildOutcome(f, out, lastPerf) {
    const s = save.season, p = save.profile, mods = f.mode === 'career' && s ? s.mods : null;
    const oc = S.analyze({ rhythm: out.rhythm, pitch: out.pitch, show: out.show, rhythmShare: out.rhythmShare, approach: f.sel.approach, action: f.sel.action }, p.attrs, lastPerf, mods);
    oc.style = f.sel.style; oc.approach = f.sel.approach; oc.action = f.sel.action;
    oc.symp = S.mergeSymp(f.talk && f.talk.symp, mods && mods.symp); oc.votesBonus = f.talk ? f.talk.votes : 0;
    return oc;
  }
  function resolveAndShow(f, out, oc) {
    const s = save.season, p = save.profile;
    if (f.mode === 'free') {
      const fc = S.freeCasting(p, oc, f.seed || 1);
      p.xp += Math.round(oc.perf / 4); persist(); flow = null;
      showResult({ fc, oc, out, free: true, credit: f.credit }); return;
    }
    const res = S.resolveRound(s, p, oc, f.playId);
    flow = null;
    if (!res) { go('sBack'); return; }
    save.wins = p.stats.wins; persist();
    showResult({ res, oc, out, free: false, credit: f.credit });
  }
  function finishStage(out) {
    const f = flow; if (!f) return;
    if (f.mode === 'career' || f.mode === 'free') {
      const s = save.season, oc = buildOutcome(f, out, f.mode === 'career' ? s.lastPerf : null);
      f.seed = f.seed || (Date.now() >>> 0);
      const casting = f.mode === 'free' || D.ROUNDS[s.round].id === 'casting';
      if (casting) {
        const pre = f.mode === 'free' ? S.judge(oc.crit, oc.style, f.seed, 0, 'p', oc.symp) : S.judge(oc.crit, oc.style, s.seed, s.round, 'p', oc.symp);
        if (pre.filter(j => j.yes).length === 1) { askEncore(f, out, oc); return; }
      }
      resolveAndShow(f, out, oc);
    } else if (f.mode === 'encore') {
      const par = f.parent; par.oc.encore = out.pitch ? out.pitch.q : 0; flow = par.f;
      resolveAndShow(par.f, par.out, par.oc);
    } else if (f.mode === 'train') finishTraining(f, out);
    else if (f.mode === 'bonus') finishBonus(out);
    else if (f.mode === 'tutorial') {
      save.tutorial = true; persist(); flow = null;
      overlay('<h3>🎉 Tutorial geschafft!</h3><p>Du kennst jetzt Noten, Show-Momente und den Gesangsteil. Ab auf die Bühne!</p><button class="btn gold" type="button" data-act="ok">Weiter</button>',
        { ok: () => { closeOv(); go(f.ret || 'sHelp'); }, esc: () => { closeOv(); go(f.ret || 'sHelp'); } });
    }
  }

  // ---------- Ergebnis-Show ----------
  function perfHtml(oc, out, credit) {
    const r = out.rhythm, rows = S.CK.map(k => `<div class="crit"><span>${D.CRIT[k]}</span>${meter(oc.crit[k])}<b>${Math.round(oc.crit[k])}</b></div>`).join('');
    const st = [];
    if (r) st.push(`✨ Perfect ${r.p}`, `👍 Gut ${r.g}`, `👌 OK ${r.o}`, `❌ Verpasst ${r.m}`, `🔥 Max-Combo ${r.maxCombo}`);
    if (out.pitch) st.push(`🎤 Gesang ${pct(out.pitch.q)}`);
    if (out.show) st.push(`👏 Show-Momente ${out.show.hit}/${out.show.total}`);
    const mult = oc.mult !== 1 ? `<p class="muted center">Ansatz-Faktor ×${String(oc.mult).replace('.', ',')}</p>` : '';
    return `<h2 class="center">Deine Performance</h2><div class="center"><div class="big">${nf(oc.perf)}</div><p class="muted">von 100 Punkten</p>${credit ? `<p class="hint">${esc(credit)}</p>` : ''}</div>
      <div class="stats">${st.map(x => `<span>${x}</span>`).join('')}</div>${mult}
      <div class="panel">${rows}<p class="hint">Kriterien: 85 % dein Auftritt, 15 % deine Trainingswerte. Daraus bewertet jede Jurorin und jeder Juror mit eigener Gewichtung.</p></div>`;
  }
  function juryHtml(jury, crit, name, seed) {
    return `<h2 class="center">Die Jury entscheidet</h2><div class="jury">${jury.map((v, i) => {
      const j = jur(v.id), ws = Object.keys(j.w).map(k => D.CRIT[k] + ' ' + Math.round(j.w[k] * 100) + ' %').join(' · ');
      const why = [`Tagesform ${v.mood >= 0 ? '+' : ''}${String(v.mood).replace('.', ',')}`]; if (v.fav) why.push('Lieblingsstil +3');
      if (v.sy) why.push(`Sympathie ${v.sy > 0 ? '+' : ''}${v.sy}`); if (v.encore) why.push('🎤 Zugabe hat überzeugt');
      return `<div class="jcard ${v.yes ? 'yes' : 'no'}" id="jc${i}"><img class="jimg" src="${j.img}" alt="${j.name}">
        <div><b>${j.name}</b> <span class="muted">${j.role}</span></div>
        <div>${ico(v.tier === 'top' ? (v.id === 'lena' ? 3 : 2) : v.yes ? 0 : 1)} <span class="sc">${String(v.score).replace('.', ',')}</span> <span class="muted">/ ${j.need}</span></div>
        <p class="q">„${esc(S.comment(v.id, v, crit, name, seed))}“</p><div class="why">${ws}<br>${why.join(' · ')}</div></div>`;
    }).join('')}</div><p class="center" id="jsum"></p>`;
  }
  function revealJury(jury, done) {
    sfx('drumroll', 1.2, '🥁 Trommelwirbel');
    jury.forEach((v, i) => later(() => { const c = $('#jc' + i); if (c) c.classList.add('show'); A.sfx(v.yes ? 'yes' : 'no'); caption(jur(v.id).name + ': ' + (v.yes ? 'JA' : 'NEIN')); }, 1300 + i * 1100));
    later(done, 1300 + jury.length * 1100);
  }
  function showResult(ctx) {
    go('sResult');
    const box = $('#resBox'), p = save.profile, name = p.name;
    const steps = [];
    steps.push(() => perfHtml(ctx.oc, ctx.out, ctx.credit));
    if (ctx.free) {
      steps.push(() => juryHtml(ctx.fc.jury, ctx.oc.crit, name, 1));
      steps.push(() => `<div class="banner ${ctx.fc.pass ? 'win' : 'lose'}">${ctx.fc.pass ? '✅ ' + ctx.fc.yes + ' von 3 Ja – du wärst weiter!' : '❌ Nur ' + ctx.fc.yes + ' von 3 Ja – diesmal nicht.'}</div>
        <div class="panel host">${AV.svg(D.HOST.look, ctx.fc.pass ? 'happy' : 'neutral')}<div class="speech"><b>Rico:</b> ${ctx.fc.pass ? 'Stark! Bereit für die echte Staffel?' : 'Kopf hoch – üben, trainieren, nochmal!'}</div></div>`);
    } else {
      const res = ctx.res, me = res.entries.find(e => e.id === 'p'), def = D.ROUNDS[res.round];
      steps.push(() => juryHtml(me.jury, ctx.oc.crit, name, save.season.seed + res.round));
      if (def.id !== 'casting') steps.push(() => voteHtml(res, def));
      steps.push(() => decisionHtml(res, me, def));
    }
    let i = 0, busy = false;
    function show() {
      clearTimers();
      const last = i === steps.length - 1;
      box.innerHTML = steps[i]() + `<button class="btn gold xl" type="button" id="bNext" data-focus style="width:100%;margin-top:12px">${last ? nextLabel(ctx) : 'Weiter ▶'}</button>`;
      $('#bNext').onclick = next; focusFirst(box);
      if (box.querySelector('.jcard')) {
        busy = true; const jury = ctx.free ? ctx.fc.jury : ctx.res.entries.find(e => e.id === 'p').jury;
        revealJury(jury, () => { busy = false; const y = jury.filter(v => v.yes).length; $('#jsum').innerHTML = `<b>${y} von 3 Ja</b> · Jury-Schnitt ${String(Math.round(jury.reduce((a, v) => a + v.score, 0) / 3 * 10) / 10).replace('.', ',')}`; });
      }
      if (box.querySelector('.vbar')) {
        busy = true; sfx('drumroll', 1.4, '🥁 Die Votes werden ausgezählt');
        later(() => box.querySelectorAll('.vbar i').forEach(b => { b.style.width = b.dataset.w + '%'; }), 120);
        later(() => { const z = $('#zit'); if (z) { z.hidden = false; sfx('cue', 0, '🪑 Zitterbank'); } busy = false; }, reduced() ? 300 : 2200);
      }
      if (last && !ctx.free) celebrate(ctx.res);
      if (last && ctx.free) sfx(ctx.fc.pass ? 'yes' : 'no');
    }
    function next() {
      if (busy && box.querySelector('.vbar')) { clearTimers(); box.querySelectorAll('.vbar i').forEach(b => { b.style.width = b.dataset.w + '%'; }); const z = $('#zit'); if (z) z.hidden = false; busy = false; return; }
      if (busy) { clearTimers(); box.querySelectorAll('.jcard').forEach(c => c.classList.add('show')); busy = false; const jury = ctx.free ? ctx.fc.jury : ctx.res.entries.find(e => e.id === 'p').jury; $('#jsum').innerHTML = `<b>${jury.filter(v => v.yes).length} von 3 Ja</b>`; return; }
      if (i < steps.length - 1) { i++; show(); return; }
      if (ctx.free) { go('sPrep', 'free'); return; }
      (ctx.res.ach || []).forEach((id, k) => setTimeout(() => toast('🏅 Erfolg freigeschaltet: ' + D.ACHIEVEMENTS.find(a => a.id === id).name, 2600), k * 2700));
      const st = save.season.status; go(st === 'out' ? 'sOut' : st === 'done' ? 'sWin' : 'sBack');
    }
    show();
  }
  // Community-Voting: Balken nach Startnummer, danach die Zitterbank an der Grenze
  function voteHtml(res, def) {
    const lookOf = id => (id === 'p' ? save.profile.look : cand(id).look), nm = e => esc(e.name) + (e.id === 'p' ? ' (du)' : '');
    const max = Math.max(1, ...res.entries.map(e => e.share));
    const bars = res.entries.slice().sort((a, b) => a.startNo - b.startNo).map(e => `<div class="vbar ${e.id === 'p' ? 'me' : ''}"><span>${nm(e)}</span><i data-w="${Math.round(e.share / max * 100)}"></i><b>${nf(e.share)} %</b></div>`).join('');
    let zit = '';
    if (def.battle) zit = '<p>Die Jury hat in jedem Battle entschieden. Wer verloren hat, hofft jetzt auf die Votes: Nur der Verlierer mit den meisten Stimmen wird gerettet.</p>';
    else if (def.final) zit = '<p>Die letzten Drei stehen auf der Bühne. Rico hält den Umschlag mit dem Ergebnis in der Hand …</p>';
    else if (def.topX && res.entries.length > def.topX) {
      const pair = [res.entries[def.topX - 1], res.entries[def.topX]];
      zit = `<p>Rico bittet zwei Kandidaten nach vorne. Nur eine Person ist noch in den Top ${def.topX}.</p><div class="avs">${pair.map(e => `<div>${AV.svg(lookOf(e.id), 'shock')}<p><b>${nm(e)}</b></p></div>`).join('')}</div>`;
    }
    return `<h2 class="center">📱 Community-Voting</h2><p class="muted center">Anteil der Zuschauer-Stimmen in dieser Runde · ${Math.round((def.w || { votes: 0.2 }).votes * 100)} % der Gesamtwertung</p>
      <div class="panel votes">${bars}</div>${zit ? `<div class="panel zit" id="zit" hidden><h3 style="margin-top:0">🪑 Zitterbank</h3>${zit}</div>` : ''}`;
  }
  function nextLabel(ctx) {
    if (ctx.free) return '↻ Nochmal';
    const st = save.season.status; return st === 'out' ? 'Weiter' : st === 'done' ? '🏆 Zur Siegerehrung' : '▶ Zurück in den Backstage';
  }
  function celebrate(res) {
    const inNext = res.advanced.includes('p');
    if (res.golden) { sfx('golden', 0, '✨ Goldenes Ticket – Applaus'); confetti(); }
    else if (D.ROUNDS[res.round].final) { sfx('drumroll', 1.5, '🥁 Trommelwirbel'); later(() => { if (res.place === 1) { sfx('fanfare', 0, '🎺 Fanfare'); confetti(); } else sfx('applause', 2, '👏 Applaus'); }, 1600); }
    else if (inNext) { sfx('yes'); sfx('applause', 2, '👏 Applaus'); confetti(); }
    else sfx('buzzer', 0, '🔔 Ausgeschieden');
  }
  function rankTable(res, cut, wts) {
    const rows = res.entries.map((e, k) => `<tr class="${e.id === 'p' ? 'me' : ''} ${cut && k === cut - 1 ? 'cut' : ''} ${res.advanced.includes(e.id) ? '' : 'out'}"><td>${e.rank}</td><td>${esc(e.name)}${e.id === 'p' ? ' (du)' : ''}</td><td>${nf(e.perf)}</td><td>${nf(e.juryAvg)}</td><td>${nf(e.votes)} <small class="muted">(${nf(e.share)} %)</small></td><td><b>${nf(e.total)}</b></td></tr>`).join('');
    return `<div class="tableWrap"><table class="rank"><thead><tr><th>#</th><th>Name</th><th>Perf.</th><th>Jury</th><th>Votes</th><th>Gesamt</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="hint">Gesamt = Performance × ${wts.perf} + Jury-Schnitt × ${wts.jury} + Votes × ${wts.votes}. Votes: Anteil am Publikum, beste/r = 100. Gleichstand: höhere Performance, dann Jury, dann Startnummer.</p>`;
  }
  function decisionHtml(res, me, def) {
    const inNext = res.advanced.includes('p'), name = save.profile.name, wts = def.w || { perf: 0.5, jury: 0.3, votes: 0.2 };
    const rico = t => `<div class="panel host">${AV.svg(D.HOST.look, inNext ? 'happy' : 'sad')}<div class="speech"><b>Rico:</b> ${esc(t)}</div></div>`;
    if (def.id === 'casting') {
      const others = res.entries.filter(e => e.id !== 'p').map(e => `<span class="tag ${res.advanced.includes(e.id) ? 'ok' : 'bad'}">${esc(e.name)} ${e.yes}/3</span>`).join('');
      const head = res.golden ? `<div class="banner gold">✨ GOLDENES TICKET! ✨</div>${rico(fill(D.HOST.golden, { n: name }))}`
        : inNext ? `<div class="banner win">✅ ${me.yes} von 3 Ja – du bist im Recall!</div>${rico(fill(rnd(D.HOST.advance), { n: name }))}`
          : `<div class="banner lose">❌ ${me.yes} von 3 Ja – das reicht nicht.</div>${rico(fill(rnd(D.HOST.out), { n: name }))}`;
      return head + `<div class="panel"><p><b>Die anderen Castings:</b> ${res.advanced.length} von ${res.entries.length} sind weiter.</p>${others}
        <p class="hint">Regel: mindestens 2 Ja. Goldenes Ticket (einmal pro Staffel): Rico rettet bei genau 1 Ja und mindestens 55 Performance-Punkten.</p></div>`;
    }
    if (def.battle) {
      const b = res.battle, nm = id => id === 'p' ? name + ' (du)' : cand(id).name;
      const pairs = b.pairs.map(pr => `<div class="pair"><div class="${pr.winner === pr.a ? 'w' : ''}">${esc(nm(pr.a))}</div><div class="vs">${pr.votes.map(v => v === pr.a ? '◀' : '▶').join(' ')}</div><div class="${pr.winner === pr.b ? 'w' : ''}">${esc(nm(pr.b))}</div></div>`).join('');
      const mine = b.pairs.find(pr => pr.a === 'p' || pr.b === 'p');
      const opp = mine ? (mine.a === 'p' ? mine.b : mine.a) : null;
      const quotes = mine ? D.JURY.map((j, k) => `<p>„${esc(fill(j.lines.battle[k % 3], { x: nm(mine.votes[k]).replace(' (du)', '') }))}“ – <b>${j.name}</b></p>`).join('') : '';
      const saved = b.saved === 'p';
      const head = !inNext ? `<div class="banner lose">❌ Battle verloren – und zu wenige Votes.</div>${rico(fill(rnd(D.HOST.out), { n: name }))}`
        : saved ? `<div class="banner gold">💖 Von der Community gerettet!</div>${rico(fill(D.HOST.saved, { n: name }))}`
          : `<div class="banner win">⚔️ Battle gewonnen gegen ${esc(opp ? cand(opp).name : '')}!</div>${rico(fill(rnd(D.HOST.advance), { n: name }))}`;
      return head + `<div class="panel">${quotes}</div><div class="panel"><p><b>Alle Battles</b> (Pfeile = Stimme von Marc, Lena, David)</p><div class="pairs">${pairs}</div>
        <p class="hint">Gerettet mit den meisten Votes unter den Verlierern: <b>${esc(b.saved ? nm(b.saved) : '–')}</b></p></div>` + rankTable(res, 0, wts);
    }
    if (def.final) {
      const pl = res.place, txt = pl === 1 ? fill(D.HOST.winner, { n: name }) : `Platz ${pl} im großen Finale, ${name}! Was für eine Staffel.`;
      return `<div class="banner ${pl === 1 ? 'gold' : 'win'}">${pl === 1 ? '👑 DU HAST GEWONNEN!' : '🎉 Platz ' + pl + ' im Finale!'}</div>${rico(txt)}` + rankTable(res, 1, wts);
    }
    const x = def.topX;
    return (inNext ? `<div class="banner win">✅ Platz ${me.rank} – du bist in den Top ${x}!</div>${rico(fill(rnd(D.HOST.advance), { n: name }))}`
      : `<div class="banner lose">❌ Platz ${me.rank} – nur die Top ${x} kommen weiter.</div>${rico(fill(rnd(D.HOST.out), { n: name }))}`) + rankTable(res, x, wts);
  }

  // ---------- Ausgeschieden / Finale ----------
  function seasonPath(s) {
    return s.results.map(r => `<span class="tag ${r.advanced ? 'ok' : 'bad'}">${D.ROUNDS[r.round].name}: ${r.rank}/${r.of}${r.golden ? ' ✨' : ''}</span>`).join(' ');
  }
  RENDER.sOut = () => {
    const s = save.season, p = save.profile; if (!s || !p) { go('sMenu'); return; }
    const r = s.results[s.results.length - 1];
    $('#outBox').innerHTML = `<div class="panel" style="margin-top:8vh">${AV.svg(p.look, 'sad', '')}
      <h2 style="color:#ff6b6b;font-size:1.8em">DU BIST AUSGESCHIEDEN</h2>
      <p>Manchmal ist es nicht das Ende, sondern nur der Anfang.</p>
      <p class="muted">Ausgeschieden in: <b>${r ? D.ROUNDS[r.round].name : ''}</b>${r ? ` · Platz ${r.rank} von ${r.of} · Performance ${nf(r.perf)}` : ''}</p>
      <p>${seasonPath(s)}</p>
      <div class="grid3"><button class="btn gold" type="button" data-o="cast" data-focus>🎤 Neues Casting</button><button class="btn violet" type="button" data-o="train">🏋️ Üben</button>
      <button class="btn" type="button" data-o="menu">🏠 Hauptmenü</button><button class="btn red sm" type="button" data-o="reset">Karriere neu beginnen</button></div></div>`;
    $('#outBox .ava').style.cssText = 'width:120px;margin:0 auto';
  };
  $('#outBox').addEventListener('click', e => {
    const b = e.target.closest('[data-o]'); if (!b) return;
    const k = b.dataset.o;
    if (k === 'cast') startSeason(); else if (k === 'train') { backTo.sTrain = 'sOut'; go('sTrain', 'practice'); } else if (k === 'menu') go('sMenu');
    else confirmBox('Karriere neu beginnen?', 'Du erstellst einen neuen Avatar. Profil, Werte und Erfolge starten von vorn.', 'Ja, neu beginnen', () => openAvatar('fresh'));
  });
  RENDER.sWin = () => {
    const s = save.season, p = save.profile; if (!s || !p) { go('sMenu'); return; }
    const pl = s.place;
    $('#winBox').innerHTML = `<div class="panel" style="margin-top:6vh">${pl === 1 ? ico(9, 's64') : ico(8, 's64')}
      ${AV.svg(p.look, 'happy')}<h2 style="font-size:1.8em;color:var(--gold)">${pl === 1 ? 'SIEG! ' + esc(p.name) + ' gewinnt SHOW ME YOUR VOICE!' : 'Platz ' + pl + ' im Finale!'}</h2>
      <p>${pl === 1 ? 'Konfetti, Lichter, Gänsehaut – die Staffel gehört dir.' : 'Bis ins Finale – das schaffen nur die Besten. Nächstes Mal holst du die Krone!'}</p>
      <p>${seasonPath(s)}</p><p class="muted">Staffelsiege insgesamt: ${p.stats.wins}</p>
      <div class="grid3"><button class="btn gold" type="button" data-w="new" data-focus>🌟 Neue Staffel</button><button class="btn" type="button" data-w="prof">👤 Profil</button><button class="btn" type="button" data-w="menu">🏠 Hauptmenü</button></div></div>`;
    $('#winBox .ava').style.cssText = 'width:140px;margin:0 auto';
    if (pl === 1) { confetti(); A.sfx('fanfare'); }
  };
  $('#winBox').addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    if (b.dataset.w === 'new') startSeason(); else if (b.dataset.w === 'prof') { backTo.sProfile = 'sWin'; go('sProfile'); } else go('sMenu');
  });

  // ---------- Kandidaten ----------
  RENDER.sCands = () => {
    const s = save.season, p = save.profile;
    const status = id => {
      if (!s) return '';
      if (s.status === 'done' && s.field[0] === id) return '<span class="tag gold">👑 Sieg</span>';
      if (s.field.includes(id)) return '<span class="tag ok">Im Rennen</span>';
      const r = s.outAt && s.outAt[id]; return `<span class="tag bad">Raus: ${r != null ? D.ROUNDS[r].name : '–'}</span>`;
    };
    const me = p ? `<div class="card me">${AV.svg(p.look, 'happy')}<h4>${esc(p.name)} (du)</h4><p>${status('p')} <span class="tag">⭐ ${p.fans} Fans</span></p><p class="muted">Level ${S.level(p.xp)} · Bestleistung ${nf(p.stats.bestPerf)}</p></div>` : '';
    $('#candList').innerHTML = me + D.CANDIDATES.map(c => `<div class="card ${s && !s.field.includes(c.id) ? 'gone' : ''}">${AV.svg(c.look, 'neutral')}<h4>${esc(c.name)}</h4>
      <p>${status(c.id)} <span class="tag">${D.STYLES[c.style].name}</span> <span class="tag">⭐ ${c.fans}</span></p>
      <p class="muted">${esc(c.bio)}</p><p>💪 ${c.strong} · ⚠️ ${c.weak}</p>
      <p class="muted">⚔️ Rivale: ${esc(cand(c.rival).name)} · 🤝 ${esc(cand(c.friend).name)}${s && s.aiLast[c.id] != null ? ' · Letzte Perf. ' + nf(s.aiLast[c.id]) : ''}</p></div>`).join('');
  };

  // ---------- Profil ----------
  RENDER.sProfile = () => {
    const p = save.profile; if (!p) { go('sMenu'); return; }
    const lv = S.level(p.xp), base = 60 * (lv - 1) * (lv - 1), nxt = 60 * lv * lv;
    $('#profBox').innerHTML = `<div class="panel avaEdit" style="grid-template-columns:140px 1fr">${AV.svg(p.look, 'happy')}<div>
      <h2>${esc(p.name)}</h2><p>Level ${lv} · ${p.xp} XP</p>${meter(p.xp - base, nxt - base)}<p>⭐ ${p.fans} Fans</p>
      <button class="btn sm" type="button" id="bEdit">✏️ Avatar bearbeiten</button></div></div>
      <div class="panel"><h3 style="margin-top:0">Fähigkeiten</h3>${S.TRAINABLE.map(k => `<div class="crit"><span>${D.CRIT[k]}</span>${meter(p.attrs[k])}<b>${p.attrs[k]}</b></div>`).join('')}
      <p class="hint">Fähigkeiten zählen zu 15 % in die Bewertung – der Auftritt selbst entscheidet.</p></div>
      <div class="panel"><h3 style="margin-top:0">Statistik</h3><div class="stats"><span>Staffeln ${p.stats.seasons}</span><span>Siege ${p.stats.wins}</span><span>Finals ${p.stats.finals}</span><span>Castings bestanden ${p.stats.castings}</span><span>Auftritte ${p.stats.performances}</span><span>Bestleistung ${nf(p.stats.bestPerf)}</span><span>Gala-Rekord ${save.best}</span></div></div>
      <div class="panel"><h3 style="margin-top:0">Erfolge</h3><div class="ach">${D.ACHIEVEMENTS.map(a => `<div class="${p.ach.includes(a.id) ? '' : 'lock'}">${ico(a.icon, 's64')}<br><b>${a.name}</b><br><small class="muted">${a.desc}</small></div>`).join('')}</div></div>`;
    $('#bEdit').onclick = () => openAvatar('edit');
  };

  // ---------- Training ----------
  let trainMode = 'practice';
  RENDER.sTrain = mode => {
    trainMode = mode || trainMode;
    const s = save.season, p = save.profile;
    const career = trainMode === 'career' && s && s.status === 'backstage' && p;
    $('#trainBox').innerHTML = `<div class="panel coach"><img src="${D.COACH.img}" alt="Sophie"><p><b>Sophie:</b> ${career ? `Du hast noch <b>${s.trainLeft} von 2</b> Trainingseinheiten in dieser Runde. Jede gute Einheit steigert eine Fähigkeit.` : 'Übungsmodus: Hier lernst du die Steuerung ohne Druck. Fähigkeiten steigen nur beim Training in der Karriere (2× pro Runde).'}</p></div>
      <div class="grid3">${D.TRAINING.map(t => `<div class="card"><h4>${t.icon} ${t.name}</h4><p>${t.desc}</p>${p ? `<p>${D.CRIT[t.attr]}: <b>${p.attrs[t.attr]}</b></p>` : ''}
        <button class="btn ${career ? 'gold' : 'violet'}" type="button" data-t="${t.id}" style="width:100%" ${career && s.trainLeft < 1 ? 'disabled' : ''}>▶ ${career ? 'Trainieren' : 'Üben'}</button></div>`).join('')}</div>`;
  };
  $('#trainBox').addEventListener('click', e => {
    const b = e.target.closest('[data-t]'); if (!b || b.disabled) return;
    const t = D.TRAINING.find(x => x.id === b.dataset.t), seed = (Date.now() & 0xffffff) >>> 0;
    const part = t.id === 'rhythm' ? { type: 'rhythm', len: 20, bpm: 110, style: 'pop', density: 0.85, seed, shows: 0, title: t.icon + ' ' + t.name, sub: 'Triff so viele Beats wie möglich' }
      : t.id === 'cues' ? { type: 'cues', len: 22, bpm: 100, style: 'soul', seed, win: 1.15, title: t.icon + ' ' + t.name, sub: 'Drück die Taste zum Publikums-Signal' }
        : { type: 'pitch', len: 20, bpm: 96, style: 'ballade', seed, title: t.icon + ' ' + t.name, sub: 'Bleib auf der Linie' };
    const career = trainMode === 'career' && save.season && save.season.status === 'backstage' && save.season.trainLeft > 0;
    runStage({ mode: 'train', train: t, career, parts: [part], title: t.icon + ' ' + t.name, bg: 'backstage', mic: t.id === 'pitch', noJury: true, ret: 'sTrain' });
  });
  function finishTraining(f, out) {
    const r = out.parts[0];
    const q = r.type === 'rhythm' ? (r.n ? (r.p + 0.7 * r.g + 0.4 * r.o) / r.n : 0) : r.q || 0;
    let gain = 0, txt;
    const p = save.profile, s = save.season;
    if (f.career && p && s && s.status === 'backstage' && s.trainLeft > 0) {
      gain = S.applyTraining(p, f.train.attr, q); s.trainLeft--;
      if (f.train.id === 'pitch' && q >= 0.9 && !p.ach.includes('stimme')) { p.ach.push('stimme'); toast('🏅 Erfolg freigeschaltet: Starke Stimme'); }
      persist();
    }
    txt = q >= 0.85 ? 'Wow, das war bühnenreif!' : q >= 0.65 ? 'Gut gemacht – das sitzt immer besser.' : q >= 0.4 ? 'Da geht noch was. Konzentrier dich auf saubere Einsätze.' : 'Nicht schlimm – genau dafür trainieren wir!';
    sfx(q >= 0.65 ? 'yes' : 'no');
    flow = null;
    go('sTrain');
    overlay(`<h3>${f.train.icon} ${f.train.name}</h3><div class="big">${pct(q)}</div>
      <p>${f.career ? (gain > 0 ? `<b>${D.CRIT[f.train.attr]} +${gain}</b> (jetzt ${p.attrs[f.train.attr]})` : 'Diesmal kein Zuwachs – für einen Punkt brauchst du mehr Treffer.') : 'Übungsmodus – ohne Wertsteigerung.'}</p>
      <p class="muted"><b>Sophie:</b> ${txt}</p><button class="btn gold" type="button" data-act="ok">OK</button>`, { ok: closeOv });
  }

  // ---------- Bonus-Challenge: Winterglanz-Gala ----------
  const GALA = [[0, 'Schneeflocke'], [3000, 'Glitzerstimme'], [6000, 'Winterstar'], [9000, 'Gala-Legende']];
  const galaTitle = sc => GALA.filter(g => sc >= g[0]).pop()[1];
  let lastBonus = null;
  RENDER.sBonus = () => {
    const lb = lastBonus;
    $('#bonusBox').innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><span></span><span class="tag gold">Rekord ${save.best}</span></header>
      <div class="bonusHead"><h2>❄️ Winterglanz-Gala ❄️</h2><p>Die festliche Sonderausgabe – unabhängig von deiner Karriere.</p></div>
      ${lb ? `<div class="panel center"><p>Dein Ergebnis</p><div class="big">${lb.score}</div><p>⭐ ${lb.stars} Sterne · Titel: <b>${galaTitle(lb.score)}</b>${lb.record ? ' · <b>NEUER REKORD!</b>' : ''}</p>
        <div class="stats">${lb.parts.map(x => `<span>${x}</span>`).join('')}</div>${lb.credit ? `<p class="hint">${esc(lb.credit)}</p>` : ''}</div>` : ''}
      <div class="panel"><h3 style="margin-top:0">Drei wechselnde Aufgaben</h3>
        <p>🔔 <b>Glöckchen-Rhythmus</b> – 8 Perfect in Folge geben einen Stern.</p>
        <p>✨ <b>Sternen-Melodie</b> – je 3 perfekte Töne in Folge ein Stern.</p>
        <p>❄️ <b>Publikums-Funkeln</b> – 4 blitzschnelle Reaktionen in Folge ein Stern.</p>
        <p class="muted">Jury-Multiplikator: Jeder Stern bringt +10 % auf deine Gesamtpunkte (höchstens +100 %).</p>
        <button class="btn gold xl" type="button" id="bGala" data-focus style="width:100%">🎄 Gala starten</button></div>`;
    $('#bGala').onclick = () => {
      const seed = (Date.now() & 0xffffff) >>> 0;
      runStage({ mode: 'bonus', bonus: true, bg: 'arena', ret: 'sBonus', title: '❄️ Winterglanz-Gala', mic: true, radio: 'christmasradio24',
        parts: [{ type: 'rhythm', len: 24, bpm: 120, style: 'winter', density: 0.85, seed, shows: 1, title: '🔔 Glöckchen-Rhythmus', sub: 'Aufgabe 1 von 3' },
          { type: 'pitch', len: 18, bpm: 100, style: 'winter', seed: seed + 7, title: '✨ Sternen-Melodie', sub: 'Aufgabe 2 von 3' },
          { type: 'cues', len: 18, bpm: 120, style: 'winter', seed: seed + 13, win: 1.0, title: '❄️ Publikums-Funkeln', sub: 'Aufgabe 3 von 3' }] });
    };
  };
  function finishBonus(out) {
    const credit = flow && flow.credit; flow = null;
    const score = S.bonusScore(out.parts), record = score > (save.best || 0);
    if (record) save.best = score;
    persist();
    lastBonus = { score, stars: out.stars, record, parts: out.parts.map(x => x.type === 'rhythm' ? `🔔 ${x.p} Perfect · Combo ${x.maxCombo}` : x.type === 'pitch' ? `✨ ${pct(x.q)} auf der Linie` : `❄️ ${x.points} Funkel-Punkte`), credit };
    go('sBonus');
    if (record) { confetti(); sfx('fanfare', 0, '🎺 Neuer Rekord'); } else sfx('applause', 2, '👏 Applaus');
  }

  // ---------- Archiv ----------
  RENDER.sArchive = () => {
    $('#archList').innerHTML = D.ARCHIVE.map(a => `<details class="season" data-s="${a.id}"><summary>${a.title} <span class="muted" style="font-weight:500">· ${a.sub}</span></summary>
      ${a.winners.length ? `<p>🏆 ${a.winners.map((w, i) => `<span class="tag ${i ? '' : 'gold'}">${i + 1}. ${esc(w)}</span>`).join(' ')}</p>` : ''}${a.top4 ? `<p class="muted">${esc(a.top4)}</p>` : ''}
      ${a.playlist ? `<p><a href="https://www.youtube.com/playlist?list=${a.playlist}" target="_blank" rel="noopener">▶ Ganze Playlist auf YouTube</a></p>` : ''}<div class="eps"></div></details>`).join('');
  };
  $('#archList').addEventListener('toggle', e => {
    const d = e.target; if (!d.open || d.dataset.done) return; d.dataset.done = '1';
    const a = D.ARCHIVE.find(x => x.id === d.dataset.s);
    d.querySelector('.eps').innerHTML = a.eps.map(([t, v], i) => `<div class="ep"><img loading="lazy" src="https://i.ytimg.com/vi/${v}/mqdefault.jpg" alt=""><div><b>EP ${String(i + 1).padStart(2, '0')}</b> · ${esc(t)}
      <div class="row2"><button class="btn sm violet" type="button" data-v="${v}" data-t="${esc(t)}">▶ Hier ansehen</button><a class="btn sm" href="https://www.youtube.com/watch?v=${v}" target="_blank" rel="noopener">YouTube ↗</a></div></div></div>`).join('');
  }, true);
  $('#archList').addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const v = b.dataset.v;
    if (!/^[\w-]{11}$/.test(v)) return;
    overlay(`<h3>${esc(b.dataset.t)}</h3><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0" title="${esc(b.dataset.t)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      <p class="hint">Lädt nicht? <a href="https://www.youtube.com/watch?v=${v}" target="_blank" rel="noopener">Direkt auf YouTube öffnen</a></p><button class="btn" type="button" data-act="x">Schließen</button>`, { x: closeOv });
  });

  // ---------- Einstellungen ----------
  RENDER.sSettings = () => {
    const s = save.settings;
    const seg = (k, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="btn" type="button" data-s="${k}" data-v="${v}" aria-pressed="${String(s[k]) === String(v)}">${l}</button>`).join('')}</div>`;
    const tog = (k, on, off) => seg(k, [['true', on || 'An'], ['false', off || 'Aus']]);
    const row = (t, d, c) => `<div class="srow"><div><b>${t}</b><small>${d}</small></div>${c}</div>`;
    $('#setBox').innerHTML =
      row('🎵 Musik', 'Lautstärke der Beats', `<input type="range" min="0" max="1" step="0.05" value="${s.music}" data-r="music" aria-label="Musik">`) +
      row('🔊 Effekte', 'Jury, Applaus, Treffer', `<input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-r="sfx" aria-label="Effekte">`) +
      row('📻 Musikquelle', 'Radio: Noten entstehen live aus der Musik der RicoReWi-Sender auf laut.fm (Sender und Titel werden angezeigt). Eigene Beats: im Spiel erzeugt, ohne Internet.', seg('source', [['radio', '📻 Radio'], ['beats', '🥁 Eigene Beats']])) +
      row('🔇 Stumm', 'Alles aus – das Spiel läuft trotzdem', tog('mute')) +
      row('💬 Untertitel', 'Wichtige Töne als Text einblenden', tog('captions')) +
      row('🎙️ Mikrofon-Modus', 'Optional für Gesangsteile. Nur Tonhöhe, nur auf deinem Gerät, keine Aufnahme.', tog('mic')) +
      row('🎚️ Stimmlage', 'Für den Mikrofon-Modus', seg('range', [['tief', 'Tief'], ['mittel', 'Mittel'], ['hoch', 'Hoch']])) +
      row('⏩ Notentempo', 'Wie schnell die Noten fallen', seg('speed', [['langsam', 'Langsam'], ['normal', 'Normal'], ['schnell', 'Schnell']])) +
      row('⏱️ Audio-Versatz', `Gleicht Verzögerung von Bluetooth-Kopfhörern aus: <b id="offV">${s.offset} ms</b>`, `<input type="range" min="-150" max="250" step="10" value="${s.offset}" data-r="offset" aria-label="Audio-Versatz">`) +
      row('🎯 Schwierigkeit', 'Stärke der Konkurrenz (gilt ab der nächsten Staffel)', seg('difficulty', [['leicht', 'Leicht'], ['normal', 'Normal'], ['schwer', 'Schwer']])) +
      row('🌙 Weniger Bewegung', 'Keine Lichteffekte und Animationen', tog('reduced')) +
      row('🔠 Große Schrift', 'Alle Texte größer', tog('big')) +
      row('🎨 Farbenblind-Modus', 'Farbpalette für Rot-Grün-Schwäche (Symbole sind immer dabei)', tog('cb')) +
      `<div class="srow"><div><b>🗑️ Spielstand zurücksetzen</b><small>Profil, Staffel, Erfolge und Rekord löschen</small></div><button class="btn red" type="button" id="bReset">Zurücksetzen</button></div>`;
  };
  $('#setBox').addEventListener('input', e => {
    const r = e.target.dataset.r; if (!r) return;
    save.settings[r] = +e.target.value; if (r === 'offset') $('#offV').textContent = e.target.value + ' ms';
    applySettings(); persist();
  });
  $('#setBox').addEventListener('change', e => { if (e.target.dataset.r === 'sfx') A.sfx('hit', 72); });
  $('#setBox').addEventListener('click', e => {
    if (e.target.closest('#bReset')) {
      confirmBox('Spielstand löschen?', 'Profil, Staffel, Erfolge und Rekorde werden gelöscht. Das lässt sich nicht rückgängig machen.', 'Ja, alles löschen', () => {
        try { localStorage.removeItem(KEY); } catch (x) { /* egal */ }
        save = S.freshSave(); persist(); applySettings(); toast('Spielstand gelöscht'); go('sMenu');
      });
      return;
    }
    const b = e.target.closest('[data-s]'); if (!b) return;
    const k = b.dataset.s, raw = b.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : raw;
    if (k === 'mic' && v === true && !save.settings.mic) { micConsent(); return; }
    save.settings[k] = v; if (k === 'mic' && !v) A.micStop();
    applySettings(); persist(); RENDER.sSettings();
    const nb = $(`#setBox [data-s="${k}"][data-v="${raw}"]`); if (nb) nb.focus();
  });
  function micConsent() {
    overlay(`<h3>🎙️ Mikrofon-Modus</h3><p>In Gesangsteilen erkennt das Spiel die <b>Tonhöhe</b> deiner Stimme und bewegt damit den Mikro-Punkt.</p>
      <p class="muted">Ausgewertet wird nur Tonhöhe und Lautstärke, direkt auf deinem Gerät. Nichts wird aufgenommen, gespeichert oder gesendet. Das Mikrofon ist nur während der Gesangsteile an.</p>
      <button class="btn gold" type="button" data-act="ok">Mikrofon erlauben</button><button class="btn" type="button" data-act="no">Ohne Mikrofon spielen</button>`,
    { ok: async () => {
      A.init();
      try { await A.micStart(); A.micStop(); save.settings.mic = true; persist(); closeOv(); toast('🎙️ Mikrofon bereit – sing im Gesangsteil einfach mit!'); }
      catch (e) { save.settings.mic = false; persist(); closeOv(); toast('Mikrofon nicht erlaubt oder nicht vorhanden – du spielst mit Tasten/Touch.', 3500); }
      RENDER.sSettings();
    }, no: closeOv });
  }

  // ---------- Tutorial ----------
  $('#bTut').onclick = () => {
    runStage({ mode: 'tutorial', ret: 'sHelp', title: '🎓 Tutorial', bg: 'stage', mic: false,
      parts: [{ type: 'rhythm', len: 22, bpm: 96, style: 'pop', density: 0.5, seed: 4242, shows: 1, title: 'Tutorial: Rhythmus', sub: 'Ganz entspannt' },
        { type: 'pitch', len: 14, bpm: 90, style: 'ballade', seed: 99, title: 'Tutorial: Gesang', sub: 'Halte den Punkt auf der Linie' }],
      hints: [[{ t: 1.6, d: 4, text: 'Noten fallen – drück, wenn sie den Kreis unten berühren!' }, { t: 5.8, d: 4, text: 'Tastatur ← ↓ ↑ → / D F J K · Touch: große Tasten · Controller: Steuerkreuz' }, { t: 10, d: 2.4, text: 'Gleich kommt ein Show-Moment: drück die angezeigte Spur!' }, { t: 15.5, d: 5, text: 'Combo halten bringt Ausdruck – Fehlgriffe brechen sie.' }],
        [{ t: 1.4, d: 5, text: '↑/↓ halten oder ziehen: Bleib auf der blauen Linie.' }, { t: 7, d: 5, text: 'Je länger du auf der Linie bist, desto besser deine Stimme.' }]] });
  };

  // ---------- Konfetti ----------
  function confetti() {
    if (reduced()) return;
    const cv = $('#confetti'), c = cv.getContext('2d'), w = cv.width = innerWidth, h = cv.height = innerHeight;
    const cols = ['#ffc93c', '#ff4d8d', '#8a5cf6', '#3a86ff', '#22c55e', '#fff'];
    const ps = Array.from({ length: 110 }, () => ({ x: Math.random() * w, y: -20 - Math.random() * h * 0.5, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, s: 4 + Math.random() * 5, c: rnd(cols) }));
    const t0 = performance.now();
    (function f(t) {
      c.clearRect(0, 0, w, h);
      for (const p of ps) { p.x += p.vx; p.y += p.vy; p.r += 0.1; c.fillStyle = p.c; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); }
      if (t - t0 < 3200) requestAnimationFrame(f); else c.clearRect(0, 0, w, h);
    })(t0);
  }

  // ---------- Start ----------
  applySettings();
  window.SMYVApp = { state: () => ({ cur, save, stage: !!stage, flow: flow && flow.mode }), go, stageObj: () => stage };
})();

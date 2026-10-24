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
  // Bild eines Jurors: Foto (Stammjury) oder gezeichneter Avatar (Gastjuroren)
  const jimg = (j, cls) => j.img ? `<img class="${cls || 'jimg'}" src="${j.img}" alt="${esc(j.name)}">` : `<span class="${cls || 'jimg'} jav" role="img" aria-label="${esc(j.name)}">${AV.svg(j.look, 'neutral')}</span>`;
  const ico = (i, cls) => `<span class="ico ${cls || ''}" style="background-position:${(i / 9 * 100).toFixed(3)}% 0" aria-hidden="true"></span>`;
  const meter = (v, max) => `<div class="meter"><i style="width:${Math.max(0, Math.min(100, v / (max || 100) * 100))}%"></i></div>`;

  let save = load(), cur = 'sTitle', stage = null, flow = null, timers = [];
  const backTo = {};
  const prep = { music: 'radio:ricorewi', style: 'pop', approach: 'gefuehl', action: 'publikum', how: 'game' };
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
    sCands: 'backstage', sProfile: 'backstage', sTrain: 'backstage', sBonus: 'arena', sArchive: 'arena', sSettings: 'stage', sHelp: 'stage', sCredits: 'stage', sOnline: 'arena', sSing: 'chairs', sParty: 'stage' };
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
    it.push(['online', 'pink', '🌐 Online & Handys', 'Live-Show mit Freunden – jede Person auf dem eigenen Gerät']);
    it.push(['sing', 'pink', '🎙️ Freies Vorsingen', 'Dein Song, Karaoke, Challenges & Song des Tages']);
    it.push(['party', 'pink', '🎉 Karaoke-Abend', 'Mehrere Sänger, ein Gerät, eine Siegerehrung']);
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
    } else if (m === 'online') openOnline();
    else if (m === 'free') { if (!p) openAvatar('free'); else sub('sPrep', 'free'); }
    else if (m === 'sing') { sing.ctx = null; sing.party = null; if (!p) openAvatar('sing'); else sub('sSing'); }
    else if (m === 'party') sub('sParty');
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
    $('#avaName').value = mode === 'edit' || mode === 'free' || mode === 'prof' || mode === 'sing' ? (save.profile ? save.profile.name : '') : '';
  }
  function drawAva() { $('#avaPrev').innerHTML = AV.svg(edit.look, edit.expr); }
  RENDER.sAvatar = () => {
    $('#avaRows').innerHTML = ROWS.map(([k, label, kind]) => {
      if (kind === 'sw') return `<div class="optRow"><span>${label}</span><div class="sw">${AV.OPT[k].map((c, i) => { const rw = k === 'outfitColor' && colorReward(i), lock = rw && !S.unlocked(save, rw);
        return `<button type="button" data-k="${k}" data-v="${i}" style="background:${c}" aria-label="${label} ${i + 1}${rw ? ' · ' + rw.name + (lock ? ', gesperrt: ab ' + rw.need + ' Sternen' : '') : ''}" ${lock ? 'disabled class="lock" title="🔒 ab ' + rw.need + ' Sternen beim Vorsingen"' : ''} aria-pressed="${edit.look[k] === i}"></button>`; }).join('')}</div></div>`;
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
  const colorReward = i => D.REWARDS.find(r => r.type === 'color' && r.idx === i);
  $('#avaRnd').onclick = () => {
    ROWS.forEach(([k, , kind]) => { const l = AV.OPT[k]; edit.look[k] = kind === 'sw' ? Math.floor(Math.random() * l.length) : rnd(l); });
    if (colorReward(edit.look.outfitColor) && !S.unlocked(save, colorReward(edit.look.outfitColor))) edit.look.outfitColor = Math.floor(Math.random() * 7);
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
    else if (edit.mode === 'sing') { backTo.sSing = 'sMenu'; go('sSing'); }
    else if (edit.mode === 'online') { backTo.sOnline = 'sMenu'; go('sOnline'); if (ON.pend && !ON.st) onJoin(ON.pend); }
    else startSeason();
  };

  // ---------- Staffel ----------
  function startSeason() {
    save.season = S.newSeason((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, save.settings.difficulty, save.settings.jury);
    persist(); go('sBack', { welcome: true });
  }
  function hostLine(s, def, welcome) {
    const p = save.profile, m = D.MOTTOS[s.motto];
    if (welcome) return fill(rnd(D.HOST.welcome), { n: p.name });
    return fill(rnd(D.HOST.intro[def.id]), { n: p.name, x: def.topX || '', motto: m.name });
  }
  RENDER.sBack = arg => {
    airStop();
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
        <div class="panelRow"><span class="muted">⚖️ Jury:</span>${S.panelOf(s, s.round).map(jur).map(j => `<span class="pj">${jimg(j, 'js')}<small>${esc(j.name)}${j.guest ? ' <i>Gast</i>' : ''}</small></span>`).join('')}</div>
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
    airStop();   // zurück aus dem Wartebereich: Sender aus
    prepMode = mode || prepMode;
    const career = prepMode === 'career', s = save.season, def = career ? D.ROUNDS[s.round] : D.ROUNDS[0];
    const motto = career && def.id === 'motto' ? D.MOTTOS[s.motto] : null;
    const songOf = k => motto ? motto.songs[k] : D.SONGS[k];
    const radioOn = save.settings.source === 'radio';
    if (!radioOn && String(prep.music).startsWith('radio:')) prep.music = 'own:' + prep.style;
    const opt = (group, k, title, desc) => `<button type="button" class="opt" data-g="${group}" data-v="${k}" aria-pressed="${prep[group] === k}"><b>${title}</b><small>${desc}</small></button>`;
    const real = prep.how === 'sing';
    const partsTxt = real ? '🎙️ Echt vorsingen: Karaoke-Song oder a cappella ins Mikrofon' : def.parts.map(t => t === 'rhythm' ? '🥁 Rhythmus' : t === 'pitch' ? '🎤 Gesang' : t === 'group' ? '👥 Gruppe' : '⚔️ Rivale').join(' → ');
    let rivalTxt = '';
    if (career && def.battle) { const op = opponent(s); if (op) rivalTxt = `<p>⚔️ Dein Gegner: <b>${esc(op.name)}</b> (${D.STYLES[op.style].name}, stark in ${op.strong})</p>`; }
    if (career && def.id === 'recall') rivalTxt = `<p>👥 Deine Gruppe: <b>${groupOf(s).map(g => esc(g.name)).join(' und ')}</b></p>`;
    const music = (radioOn ? D.STATIONS.filter(x => x.style !== 'winter').map(st => opt('music', 'radio:' + st.slug, '📻 ' + st.name, `${st.desc} · Stil: ${D.STYLES[st.style].name}`)) : [])
      .concat(Object.keys(D.STYLES).map(k => opt('music', 'own:' + k, `🎹 ${D.STYLES[k].name}: „${songOf(k)}“`, `Eigener Song (offline) · ${D.STYLES[k].bpm} BPM · ${D.STYLES[k].desc}`)));
    $('#prepBox').innerHTML = `
      <header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>${career ? def.icon + ' ' + def.name : '🎤 Freies Casting'}</h2><span></span></header>
      ${motto ? `<div class="banner gold" style="font-size:1.1em">Motto: ${motto.name}</div>` : ''}
      <div class="panel"><p><b>Ablauf:</b> ${partsTxt}</p><p class="muted">${esc(career ? def.rule : 'Keine Wertung für die Staffel – perfekt zum Üben. Weiter mit 2 von 3 Jury-Ja.')}</p>${rivalTxt}</div>
      <h3>1 · Wie willst du auftreten?</h3><div class="opts">${opt('how', 'game', '🎮 Spiel (wie bisher)', 'Noten im Takt treffen – mit Tasten, Touch oder Mikrofon')}${opt('how', 'sing', '🎙️ Echt vorsingen', 'Du singst einen Karaoke-Song ins Mikrofon, die Jury bewertet deine echte Stimme')}</div>
      ${real ? `<p class="hint" style="text-align:left">🎙️ Den Song wählst du gleich vor deinem Auftritt: Karaoke mit Lyrics, a cappella oder dein eigener Song. Gewertet werden Intonation, Stabilität, Stimmumfang und Ausdruck. Am besten mit Kopfhörern.</p>
      <h3>2 · Bühnen-Aktion</h3><div class="opts">${Object.keys(D.ACTION).map(k => opt('action', k, D.ACTION[k].name, D.ACTION[k].desc)).join('')}</div>` : `
      <h3>2 · Deine Musik</h3><div class="opts">${music.join('')}</div>
      <p class="hint" style="text-align:left">${radioOn ? '📻 <b>Quelle:</b> Live-Programm des gewählten RicoReWi-Senders über laut.fm. Der Sender läuft live, die Noten entstehen aus den Beats des laufenden Songs (lässt der Stream keine Analyse zu, folgen sie dem Takt des Musikstils). Interpret und Titel stehen im Auftritt oben. Alle Rechte an der Musik liegen bei den jeweiligen Urhebern. Ohne Verbindung spielt das Spiel eigene Beats.' : '🎹 Eigene Songs: Musik wird live im Browser erzeugt. Radio-Sender kannst du in den Einstellungen einschalten.'} Der Stil bestimmt, welche Jurorin oder welcher Juror einen Bonus gibt.</p>
      <h3>3 · Dein Ansatz</h3><div class="opts">${Object.keys(D.APPROACH).map(k => opt('approach', k, D.APPROACH[k].name, D.APPROACH[k].desc)).join('')}</div>
      <h3>4 · Bühnen-Aktion</h3><div class="opts">${Object.keys(D.ACTION).map(k => opt('action', k, D.ACTION[k].name, D.ACTION[k].desc)).join('')}</div>
      <div class="panel">${save.settings.mic ? '<p>🎙️ <b>Mikrofon ist an:</b> Sing die Noten an, wenn sie den Ring erreichen, und triff in Gesangsteilen die Tonhöhe. Ausgewertet wird nur auf deinem Gerät.</p>' : '<p>🎙️ <b>Mit deiner Stimme spielen?</b> Mit Mikrofon triffst du die Noten, indem du sie ansingst, und im Gesangsteil zählt deine echte Tonhöhe.</p><button class="btn" type="button" id="bMic">🎙️ Mikrofon einschalten</button>'}</div>`}
      <button class="btn gold xl" type="button" id="bGo" data-focus style="width:100%">${career && def.id !== 'casting' ? '🎙️ Zum Interview mit Rico' : '🚪 Zum Wartebereich'}</button>`;
  };
  $('#prepBox').addEventListener('click', e => {
    const o = e.target.closest('.opt');
    if (o) {
      prep[o.dataset.g] = o.dataset.v; o.parentNode.querySelectorAll('.opt').forEach(x => x.setAttribute('aria-pressed', String(x === o)));
      if (o.dataset.g === 'music') prep.style = musicOf(prep).style;
      if (o.dataset.g === 'how') { RENDER.sPrep(prepMode); const nb = $(`#prepBox [data-g="how"][data-v="${o.dataset.v}"]`); if (nb) nb.focus(); }
      return;
    }
    if (e.target.closest('#bMic')) { micConsent(() => RENDER.sPrep(prepMode)); return; }
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
    const mu = musicOf(prep), withRadio = mu.radio && prep.how !== 'sing' && def.parts.includes('rhythm');
    $('#talkBox').innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>${talk.casting ? '🎤 Vor der Jury' : '🎙️ Interview'}</h2><span></span></header>
      ${withRadio ? `<div class="panel"><p id="airBox">📻 Verbinde mit ${esc(mu.name)} …</p></div>` : ''}${wait}<div class="panel" id="talkQ"></div>`;
    talkStep();
    if (withRadio) airStart(mu.radio).then(m => { if (!m) airShow('📻 ' + mu.name + ' ist gerade nicht erreichbar – auf der Bühne laufen eigene Beats.'); });
    else airStop();
  };
  // ---------- Radio im Wartebereich: Sender läuft schon, der Auftritt beginnt mit dem nächsten Song ----------
  const onAir = { slug: null, mode: null, poll: 0, song: null };
  let airTok = 0;   // jeder Verbindungsversuch bekommt eine Nummer; veraltete Versuche brechen ab
  function airStop() { airTok++; clearInterval(onAir.poll); onAir.poll = 0; onAir.slug = null; onAir.mode = null; onAir.song = null; A.radioStop(); }
  function airShow(txt) { const el = $('#airBox'); if (el) el.textContent = txt; }
  function songTxt(sg) { return sg ? (sg.artist ? sg.artist + ' – ' : '') + sg.title : ''; }
  async function airStart(slug) {
    if (onAir.slug === slug && A.radioActive()) return onAir.mode;
    airStop(); onAir.slug = slug;
    const tok = ++airTok, stale = () => tok !== airTok || onAir.slug !== slug;
    let mode = null;
    try { await A.radioStart(slug, ST.TRAVEL[save.settings.speed] || 1.5); mode = 'live'; }
    catch (e) { if (stale()) return null; try { await A.radioStart(slug, 0, null, true); mode = 'plain'; } catch (e2) { mode = null; } }
    if (stale()) { if (mode && !onAir.slug && !stage) A.radioStop(); return null; }   // inzwischen verlassen oder anderer Sender
    if (!mode) { onAir.slug = null; return null; }
    onAir.mode = mode; A.radioMute(false);
    const st = station(slug), upd = () => A.radioSong(slug).then(sg => { if (onAir.slug !== slug) return; if (sg) onAir.song = sg; airShow('📻 Läuft gerade auf ' + st.name + ': ' + (songTxt(onAir.song) || '…')); });
    airShow('📻 ' + st.name + ' läuft'); upd(); onAir.poll = setInterval(upd, 10000);
    return mode;
  }
  // Werbung oder Song schon halb vorbei? Dann auf den Songwechsel warten (mit „Sofort starten“).
  function waitForSong(start) {
    const s0 = onAir.song, st = station(onAir.slug);
    if (s0 && s0.type === 'song' && s0.start && Date.now() - s0.start < 15000) { start(); return; }
    let done = false, n = 0;
    const end = (go2) => { if (done) return; done = true; clearInterval(iv); closeOv(); if (go2) start(); };
    overlay(`<h3>📻 Gleich geht's los …</h3><p>Dein Auftritt beginnt mit dem <b>nächsten Song</b> auf ${esc(st ? st.name : 'dem Sender')}.</p><p class="muted" id="airWait">${esc(songTxt(s0))}</p>
      <button class="btn gold" type="button" data-act="now">▶ Sofort starten</button><button class="btn sm" type="button" data-act="x">Abbrechen</button>`,
    { now: () => end(true), x: () => end(false), esc: () => end(false) });
    const iv = setInterval(() => {
      n++; if (!onAir.mode) { end(true); return; }
      const left = s0 && s0.end ? Math.round((s0.end - Date.now()) / 1000) : null, el = $('#airWait');
      if (el) el.textContent = (s0 ? 'Läuft noch: ' + songTxt(s0) : 'Warte auf den Songwechsel') + (left != null && left > 0 ? ' · ca. ' + left + ' s' : '');
      if (n > 240) { end(true); return; }   // Notbremse nach 4 Minuten
      if (n % 3 === 0 || (left != null && left <= 0)) A.radioSong(onAir.slug).then(sg => { if (!done && sg && sg.type === 'song' && (!s0 || sg.title !== s0.title || sg.artist !== s0.artist)) { onAir.song = sg; sfx('cue', 0, '📻 Neuer Song'); end(true); } });
    }, 1000);
  }
  function talkStep() {
    const box = $('#talkQ'), name = save.profile.name, done = talk.qi >= talk.list.length;
    const log = talk.log.map(l => `<p class="muted">${esc(l)}</p>`).join('');
    if (done) {
      const sy = Object.keys(talk.symp).filter(k => talk.symp[k]).map(k => `${jur(k).name} ${talk.symp[k] > 0 ? '+' : ''}${talk.symp[k]}`);
      box.innerHTML = `${log}<p><b>${talk.casting ? 'Die Jury nickt dir zu.' : 'Rico: „Viel Glück – die Bühne gehört dir!“'}</b></p>
        <p class="hint" style="text-align:left">Wirkung: ${sy.length ? 'Sympathie ' + sy.join(', ') : 'keine Sympathie-Änderung'}${talk.votes ? ' · +' + talk.votes + ' Votes' : ''}</p>
        <button class="btn gold xl" type="button" id="bStageGo" data-focus style="width:100%">🎬 Auf die Bühne!</button>`;
      $('#bStageGo').onclick = () => { const go2 = () => { if (prep.how === 'sing') openSingRound(talk.mode); else if (talk.mode === 'career') startCareerRound(); else startFree(); }; if (onAir.mode) waitForSong(go2); else go2(); };
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
    runStage({ mode: 'career', playId, panel: S.panelOf(s, s.round), sel: Object.assign({}, prep, { style: mu.style }), radio: mu.radio, talk: { symp: talk.symp, votes: talk.votes },
      parts: buildParts(def, S.hash(s.seed + ':perf:' + s.round), song, s.round, mu), juryStop: def.id === 'casting',
      title: def.icon + ' ' + def.name + (mu.radio ? '' : ' · „' + song + '“'), bg: def.bg, rival, group, ret: 'sBack' });
  }
  function startFree() {
    const def = D.ROUNDS[0], mu = musicOf(prep);
    runStage({ mode: 'free', sel: Object.assign({}, prep, { style: mu.style }), radio: mu.radio, talk: { symp: talk.symp, votes: 0 }, juryStop: true,
      parts: buildParts(def, (Date.now() & 0xffffff) >>> 0, mu.radio ? mu.name : D.SONGS[mu.style], 0, mu),
      title: '🎤 Freies Casting' + (mu.radio ? '' : ' · „' + D.SONGS[mu.style] + '“'), bg: 'stage', ret: 'sPrep' });
  }

  // ---------- Bühne ----------
  function stopAll() { if (stage) { stage.stop(); stage = null; } A.micStop(); airStop(); }
  async function runStage(cfg) {
    A.init(); applySettings();
    let mic = false, radio = false;
    cfg.parts.forEach(p => { p.live = false; p.plain = false; });
    if (cfg.radio && save.settings.source === 'radio' && cfg.parts.some(p => p.type === 'rhythm')) {
      const st = station(cfg.radio);
      if (onAir.slug === cfg.radio && onAir.mode && A.radioActive()) { radio = onAir.mode; clearInterval(onAir.poll); }   // läuft schon seit dem Wartebereich
      else {
      overlay(`<h3>📻 Verbinde mit ${esc(st.name)} …</h3><p class="muted">Live-Stream über laut.fm</p>`, { esc: () => {} });
      // 1. Versuch: Stream mit Beat-Analyse (Noten aus der Musik). 2. Versuch: Sender nur abspielen, Noten im Takt des Musikstils.
      try { await A.radioStart(cfg.radio, ST.TRAVEL[save.settings.speed] || 1.5, cfg.radioUrl); radio = 'live'; }
      catch (e) {
        try { await A.radioStart(cfg.radio, 0, cfg.radioUrl, true); radio = 'plain'; }
        catch (e2) { toast('📻 ' + st.name + ' ist gerade nicht erreichbar – du singst zu eigenen Beats.', 3500); }
      }
      closeOv(); if (radio) { onAir.slug = cfg.radio; onAir.mode = radio; }
      }
      cfg.parts.forEach(p => { if (radio === 'live' && p.type === 'rhythm') p.live = true; if (radio === 'plain') p.plain = true; });
    }
    if (cfg.mic !== false && save.settings.mic && cfg.parts.some(p => p.type === 'pitch' || p.type === 'rhythm')) { try { await A.micStart(); mic = true; A.micStop(); } catch (e) { toast('🎙️ Mikrofon nicht verfügbar – du singst mit Tasten/Touch.'); } }
    cfg.micOn = mic;   // Mikrofon nur in Noten- und Gesangsteilen öffnen
    A.radioOnLost(() => { if (stage && flow === cfg) { stage.radioLost(); cfg.credit = ''; $('#stTitle').textContent = cfg.title; toast('📻 Radio-Verbindung verloren – weiter mit eigenen Beats.', 3500); } });
    flow = cfg; go('sStage'); setBg(cfg.bg || 'stage', true);
    $('#stTitle').textContent = cfg.title;
    cfg.credit = '';
    if (radio) {
      const st = station(cfg.radio); cfg.credit = '📻 ' + st.name + ' (laut.fm)'; $('#stTitle').textContent = cfg.title + ' · ' + cfg.credit;
      A.radioSong(cfg.radio).then(sg => { if (sg && flow === cfg) { cfg.credit = '📻 Quelle: ' + st.name + ' auf laut.fm – ' + (sg.artist ? sg.artist + ' – ' : '') + sg.title; $('#stTitle').textContent = cfg.title + ' · ' + cfg.credit.replace('📻 Quelle: ', '📻 '); } });
    }
    $('#juryStrip').innerHTML = cfg.noJury ? '' : (cfg.panel || D.MAIN_JURY).map(jur).map(j => jimg(j, 'js').replace(/^<(img|span) /, '<$1 data-j="' + j.id + '" ')).join('');
    $('#snow').hidden = !cfg.bonus || reduced();
    $('#rivalBox').hidden = true;
    const pads = $('#pads'); pads.className = 'pads' + (('ontouchstart' in window || navigator.maxTouchPoints > 0) ? '' : ' auto');
    stage = new ST.Stage({ canvas: $('#cv'), pads, parts: cfg.parts, settings: save.settings, mic, bonus: !!cfg.bonus, hints: cfg.hints, captions: caption, juryStop: !!cfg.juryStop,
      onPart: (i, p) => {
        if (mic && (p.type === 'pitch' || p.type === 'rhythm')) A.micStart().catch(() => {}); else A.micStop();
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
        const imgs = $('#juryStrip').querySelectorAll('[data-j]'); const cls = k === 'combo' ? 'nod' : k === 'show' ? 'wow' : 'frown';
        imgs.forEach((im, i) => { if (k !== 'miss' || i === 0) { im.classList.add(cls); setTimeout(() => im.classList.remove(cls), 700); } });
      },
      onDone: out => { stage = null; A.micStop(); airStop(); finishStage(out); } });
  }
  $('#bPause').onclick = () => { if (stage) stage.pause(false); };
  function showPause(auto) {
    A.micStop();   // in der Pause hört niemand zu
    const career = flow && (flow.mode === 'career' || flow.mode === 'encore' || flow.mode === 'online');
    overlay(`<h3>⏸ Pause</h3>${auto ? '<p class="muted">Automatisch angehalten.</p>' : ''}${flow && flow.credit ? `<p class="hint">${esc(flow.credit)}</p>` : ''}
      <button class="btn gold" type="button" data-act="go">▶ Weiter</button>
      ${career ? '<button class="btn red" type="button" data-act="end">Auftritt beenden (Rest zählt als verpasst)</button>'
    : '<button class="btn" type="button" data-act="re">↻ Neu starten</button><button class="btn red" type="button" data-act="quit">✖ Abbrechen</button>'}
      <p class="hint">Esc, P oder Start setzt fort</p>`,
    { go: resume, esc: resume,
      end: () => { closeOv(); if (stage) stage.abort(); },
      re: () => { closeOv(); stopAll(); runStage(flow); },
      quit: () => { closeOv(); stopAll(); go(flow.ret || 'sMenu'); } });
    function resume() { closeOv(); if (stage) { if (flow && flow.micOn && stage.part && (stage.part.type === 'pitch' || stage.part.type === 'rhythm')) A.micStart().catch(() => {}); stage.resume(); } }
  }
  // Während der Pause: P/Start setzt ebenfalls fort
  addEventListener('keydown', e => { if (cur === 'sStage' && stage && stage.paused && e.code === 'KeyP' && !$('#ov').hidden) { e.preventDefault(); const r = $('#ovBox [data-act="go"]'); if (r) r.click(); } });

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
  // Casting: Bei genau einem Ja bietet die Jury eine Zugabe an, sonst direkt zur Entscheidung.
  function decide(f, out, oc) {
    const s = save.season;
    f.seed = f.seed || (Date.now() >>> 0);
    if (f.mode === 'free' || D.ROUNDS[s.round].id === 'casting') {
      const pre = f.mode === 'free' ? S.judge(oc.crit, oc.style, f.seed, 0, 'p', oc.symp) : S.judge(oc.crit, oc.style, s.seed, s.round, 'p', oc.symp);
      if (pre.filter(j => j.yes).length === 1) { askEncore(f, out, oc); return; }
    }
    resolveAndShow(f, out, oc);
  }
  function finishStage(out) {
    const f = flow; if (!f) return;
    if (f.mode === 'career' || f.mode === 'free') {
      decide(f, out, buildOutcome(f, out, f.mode === 'career' ? save.season.lastPerf : null));
    } else if (f.mode === 'encore') {
      const par = f.parent; par.oc.encore = out.pitch ? out.pitch.q : 0; flow = par.f;
      resolveAndShow(par.f, par.out, par.oc);
    } else if (f.mode === 'online') onFinish(f, out);
    else if (f.mode === 'train') finishTraining(f, out);
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
    const sg = out.sing;
    if (sg) st.push(`🎯 Intonation ${Math.round(sg.inton)}`, `〰️ Stabilität ${Math.round(sg.stab)}`, `↕️ Umfang ${nf(sg.semis)} Halbtöne${sg.semis ? ` (${noteName(sg.low)}–${noteName(sg.high)})` : ''}`,
      `🎚️ Dynamik ${Math.round(sg.dyn)}`, `⏱️ ${nf(sg.voiced)} s gesungen`);
    const ext = sing.recBlob && /mp4/.test(sing.recBlob.type) ? 'm4a' : sing.recBlob && /ogg/.test(sing.recBlob.type) ? 'ogg' : 'webm';
    const canShare = !!(sing.recBlob && navigator.canShare && navigator.share);
    const rec = out.rec ? `<div class="panel"><p><b>🎧 Deine Aufnahme</b> <small class="muted">mit Studio-Hall · bleibt auf diesem Gerät, bis du sie speicherst oder teilst</small></p><audio controls preload="auto" src="${esc(out.rec)}" style="width:100%"></audio>
      <div class="row2"><a class="btn sm" href="${esc(out.rec)}" download="SHOW-ME-YOUR-VOICE-Auftritt.${ext}">⬇️ Speichern</a>${canShare ? '<button class="btn sm violet" type="button" id="recShare">📤 Teilen</button>' : ''}</div></div>` : '';
    if (out.rec) sing.shareTxt = `🎤 Mein Auftritt bei SHOW ME YOUR VOICE${out.song ? ' mit „' + out.song + '“' : ''}: ${out.title ? out.title + ', ' : ''}${nf(oc.perf)} von 100 Punkten. Trau dich auch!`;
    const live = sg && out.pts != null ? `<div class="banner gold singRate">${esc(out.title || '')} · 🎯 ${out.pts.toLocaleString('de-DE')} Punkte${out.combo ? ' · beste Combo ×' + out.combo : ''}${out.daily ? `<br><small>📅 Song des Tages: ${out.daily.rec ? '🏆 neuer Tagesrekord! ' : ''}heute bestes Ergebnis ${out.daily.best.toLocaleString('de-DE')} · <a href="../ranglisten.html?game=show-me-your-voice" target="_blank" rel="noopener">Rangliste</a></small>` : ''}${out.turned && out.turned.length ? '<br><small>🔴 Umgedreht: ' + out.turned.map(id => esc(jur(id).name)).join(', ') + '</small>' : ''}</div>` : '';
    const sgHint = sg ? '<p class="hint">Intonation zählt relativ zu deiner eigenen Tonart: Wie genau triffst du Halbtöne und hältst sie? Umfang = tiefe bis hohe Töne, Dynamik = laut und leise.</p>' : '';
    const mult = oc.mult !== 1 ? `<p class="muted center">Ansatz-Faktor ×${String(oc.mult).replace('.', ',')}</p>` : '';
    return `<h2 class="center">Deine Performance</h2><div class="center"><div class="big">${nf(oc.perf)}</div><p class="muted">von 100 Punkten</p>${credit ? `<p class="hint">${esc(credit)}</p>` : ''}</div>${live}
      <div class="stats">${st.map(x => `<span>${x}</span>`).join('')}</div>${mult}${sgHint}${rec}
      <div class="panel">${rows}<p class="hint">Kriterien: 85 % dein Auftritt, 15 % deine Trainingswerte. Daraus bewertet jede Jurorin und jeder Juror mit eigener Gewichtung.</p></div>`;
  }
  function juryHtml(jury, crit, name, seed) {
    return `<h2 class="center">Die Jury entscheidet</h2><div class="jury">${jury.map((v, i) => {
      const j = jur(v.id), ws = Object.keys(j.w).map(k => D.CRIT[k] + ' ' + Math.round(j.w[k] * 100) + ' %').join(' · ');
      const why = [`Tagesform ${v.mood >= 0 ? '+' : ''}${String(v.mood).replace('.', ',')}`]; if (v.fav) why.push('Lieblingsstil +3');
      if (v.sy) why.push(`Sympathie ${v.sy > 0 ? '+' : ''}${v.sy}`); if (v.encore) why.push('🎤 Zugabe hat überzeugt');
      return `<div class="jcard ${v.yes ? 'yes' : 'no'}" id="jc${i}">${jimg(j)}
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
  // Aufnahme teilen (Datei + Link zur easygames-Homepage)
  $('#resBox').addEventListener('click', async e => {
    if (!e.target.closest('#recShare') || !sing.recBlob) return;
    const b = sing.recBlob, ext = /mp4/.test(b.type) ? 'm4a' : /ogg/.test(b.type) ? 'ogg' : 'webm';
    const base = location.href.split('#')[0].split('?')[0], url = window.EasyGamesLink ? EasyGamesLink.share(base) : base;
    const file = new File([b], 'SHOW-ME-YOUR-VOICE-Auftritt.' + ext, { type: b.type || 'audio/webm' });
    const data = { title: 'SHOW ME YOUR VOICE', text: sing.shareTxt || '🎤 SHOW ME YOUR VOICE', url };
    try { if (navigator.canShare({ files: [file] })) data.files = [file]; await navigator.share(data); }
    catch (x) { if (x && x.name !== 'AbortError') toast('Teilen klappt hier nicht – speichere die Aufnahme und teile sie selbst.', 3500); }
  });
  function showResult(ctx) {
    go('sResult');
    const box = $('#resBox'), name = ctx.name || (save.profile ? save.profile.name : '');
    const steps = [];
    steps.push(() => perfHtml(ctx.oc, ctx.out, ctx.credit));
    if (ctx.free) {
      steps.push(() => juryHtml(ctx.fc.jury, ctx.oc.crit, name, 1));
      steps.push(() => `<div class="banner ${ctx.fc.pass ? 'win' : 'lose'}">${ctx.fc.pass ? '✅ ' + ctx.fc.yes + ' von 3 Ja – du wärst weiter!' : '❌ Nur ' + ctx.fc.yes + ' von 3 Ja – diesmal nicht.'}</div>
        <div class="panel host">${AV.svg(D.HOST.look, ctx.fc.pass ? 'happy' : 'neutral')}<div class="speech"><b>Rico:</b> ${ctx.fc.pass ? 'Stark! Bereit für die echte Staffel?' : 'Kopf hoch – üben, trainieren, nochmal!'}</div></div>`
        + (ctx.chal ? `<div class="panel"><p><b>${ctx.chal.g.icon} ${ctx.chal.g.name}-Challenge:</b> <span class="stars">${stars(ctx.chal.stars)}</span>${ctx.chal.up ? ' · neue Sterne!' : ''}${ctx.chal.rec ? ' · 🏆 neuer Rekord' : ''}</p>
          <p class="muted">Genre-Ziel „${ctx.chal.g.goal.t}“: ${Math.round(ctx.chal.val)} von ${ctx.chal.g.goal.min} ${ctx.chal.met ? '✅' : '❌'}</p><p class="hint">★ 2 von 3 Jury-Ja · ★★ dazu das Genre-Ziel · ★★★ dazu mindestens 80 Punkte</p></div>` : ''));
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
      if (ctx.free) { if (ctx.ret) go(ctx.ret); else go('sPrep', 'free'); return; }
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
      const quotes = mine ? (res.panel || D.MAIN_JURY).map(jur).map((j, k) => `<p>„${esc(fill(j.lines.battle[k % 3], { x: nm(mine.votes[k]).replace(' (du)', '') }))}“ – <b>${j.name}</b></p>`).join('') : '';
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
    runStage({ mode: 'train', train: t, career, parts: [part], title: t.icon + ' ' + t.name, bg: 'backstage', noJury: true, ret: 'sTrain' });
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

  // ---------- Freies Vorsingen: eigener Song oder Karaoke-Video, Auswertung der Stimme, Genre-Challenges ----------
  const NOTE = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'];
  const noteName = m => { const r = Math.round(m); return NOTE[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const genre = id => D.KARAOKE.find(g => g.id === id);
  const ytId = s => { s = String(s || '').trim(); const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/); return m ? m[1] : null; };
  const sing = { g: 'pop', song: 0, own: '', title: '', len: 60, run: null, recUrl: null, recBlob: null, ctx: null, party: null, daily: false };   // ctx: echtes Vorsingen in Karriere/Freiem Casting
  function openSingRound(mode) {
    const s = save.season, career = mode === 'career';
    if (career && (!s || s.status !== 'backstage')) { go('sBack'); return; }
    const def = career ? D.ROUNDS[s.round] : D.ROUNDS[0];
    sing.party = null;
    sing.ctx = { mode: career ? 'career' : 'free', sel: Object.assign({}, prep), talk: { symp: talk.symp, votes: career ? talk.votes : 0 },
      title: career ? def.icon + ' ' + def.name : '🎤 Freies Casting', bg: career ? def.bg : 'stage' };
    backTo.sSing = 'sPrep'; go('sSing');
  }
  function singPick() {
    const g = genre(sing.g), style = g ? g.style : 'pop';
    if (g && Number.isInteger(sing.song) && g.songs[sing.song]) { const [t, v, ch] = g.songs[sing.song]; return { vid: v, title: t, credit: `🎤 ${t} · Karaoke-Video: ${ch} (YouTube) · Rechte bei den Urhebern`, style }; }
    const t = sing.title.trim().slice(0, 80) || (sing.song === 'own' ? 'Eigener Song' : 'A cappella');
    if (sing.song === 'own') { const v = ytId(sing.own); return { vid: v, title: t, credit: `🎤 ${t}${v ? ' · Video: YouTube · Rechte bei den Urhebern' : ''}`, style }; }
    return { vid: null, title: t, credit: `🎤 ${t} · a cappella`, style };
  }
  RENDER.sSing = () => {
    singEnd();
    const g = genre(sing.g), ch = save.singCh || {};
    if (!g && Number.isInteger(sing.song)) sing.song = 'acap';
    if (g && Number.isInteger(sing.song) && !g.songs[sing.song]) sing.song = 0;
    const opt = (k, v, on, t, d) => `<button type="button" class="opt" data-${k}="${v}" aria-pressed="${on}"><b>${t}</b><small>${d}</small></button>`;
    const gs = D.KARAOKE.map(x => { const c = ch[x.id]; return opt('sg', x.id, sing.g === x.id, `${x.icon} ${x.name} <span class="stars">${stars(c ? c.stars : 0)}</span>`, `Ziel: ${x.goal.t}${c ? ' · Rekord ' + nf(c.best) : ''}`); })
      .concat(opt('sg', 'frei', !g, '🎤 Ohne Challenge', 'Freie Songwahl, nur die Jury zählt'));
    const ss = (g ? g.songs.map((x, i) => opt('ss', i, sing.song === i, '▶ ' + esc(x[0]), 'Karaoke mit Lyrics · ' + esc(x[2]))) : [])
      .concat(opt('ss', 'acap', sing.song === 'acap', '🎙️ A cappella', 'Ohne Musik, nur deine Stimme'), opt('ss', 'own', sing.song === 'own', '🔗 Eigener Song', 'YouTube-Link einfügen oder einfach ohne Video'));
    const own = sing.song === 'own' || sing.song === 'acap', pt = sing.party, plain = !sing.ctx && !pt;
    const day = S.dailyDay(), ds = S.dailySong(day), dBest = (save.daily || {})['d' + day];
    const st = S.starSum(save), rw = t => D.REWARDS.filter(r => r.type === t).map(r => { const ok = S.unlocked(save, r);
      return `<button type="button" class="opt${ok ? '' : ' lock'}" data-rw="${r.id}" aria-pressed="${save.rew[t] === r.id}" ${ok ? '' : 'disabled'}><b>${r.name}</b><small>${ok ? 'freigeschaltet' : '🔒 ab ' + r.need + ' ★'}</small></button>`; }).join('');
    setBg((D.REWARDS.find(r => r.id === save.rew.stage) || D.REWARDS[5]).bg, true);
    $('#singBox').innerHTML = `
      <header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>${pt ? '🎉 ' + esc(party.players[pt.i]) + ' ist dran' : sing.ctx ? esc(sing.ctx.title) : '🎙️ Freies Vorsingen'}</h2><span></span></header>
      ${plain ? `<div class="panel daily"><p><b>📅 Song des Tages:</b> ${esc(ds.title)}</p><p class="muted">Für alle gleich, 60 Sekunden. ${dBest ? 'Dein Rekord heute: <b>' + dBest.toLocaleString('de-DE') + '</b> Punkte' : 'Heute noch nicht gesungen'} · <a href="../ranglisten.html?game=show-me-your-voice" target="_blank" rel="noopener">🏆 Rangliste</a></p>
        <button class="btn gold" type="button" id="singDaily">🎤 Song des Tages singen</button></div>` : ''}
      <div class="panel"><p>${sing.ctx ? '<b>Jetzt zählt’s!</b> ' : ''}Wie im echten Casting: Du singst einen Song deiner Wahl ins Mikrofon. Das Spiel hört auf <b>Intonation, Stabilität, Stimmumfang und Ausdruck</b>, danach entscheidet die Jury.</p>
        <p class="muted">Ausgewertet wird nur auf deinem Gerät. Deine Aufnahme kannst du danach anhören; sie wird nicht gespeichert oder gesendet.</p></div>
      <h3>1 · ${plain ? 'Genre-Challenge' : 'Genre'}</h3><div class="opts">${gs.join('')}</div>
      <p class="hint" style="text-align:left">${!plain ? '' : '★ 2 von 3 Jury-Ja · ★★ dazu das Genre-Ziel · ★★★ dazu mindestens 80 Punkte. '}Der Stil bringt bei der passenden Jurorin oder dem passenden Juror einen Bonus.</p>
      <h3>2 · Dein Song${g ? ` <small class="muted">(${g.songs.length} Karaoke-Songs)</small>` : ''}</h3><div class="opts songs">${ss.join('')}</div>
      ${own ? `<div class="panel"><label class="field">Songtitel (optional)<input id="singTitle" type="text" maxlength="80" value="${esc(sing.title)}" placeholder="z. B. Adele – Hello"></label>
        ${sing.song === 'own' ? `<label class="field">YouTube-Link (optional)<input id="singLink" type="url" inputmode="url" value="${esc(sing.own)}" placeholder="https://youtu.be/…"></label>
        <button class="btn sm violet" type="button" id="singFind">🔍 Karaoke-Version auf YouTube suchen</button><p class="hint" style="text-align:left">Video suchen, Link kopieren und oben einfügen. Nicht jedes Video darf eingebettet werden – dann sagt dir das Spiel Bescheid.</p>` : ''}</div>` : ''}
      ${sing.ctx && sing.ctx.mode === 'online' ? `<p class="hint" style="text-align:left">⏱️ Online singen alle ${ONLINE_SING} Sekunden. Such dir schnell deinen Song aus – die Runde läuft schon.</p>` : `<h3>3 · Länge</h3><div class="seg">${[30, 60, 90].map(n => `<button class="btn" type="button" data-sl="${n}" aria-pressed="${sing.len === n}">${n} s</button>`).join('')}</div>`}
      <p class="hint" style="text-align:left">🎧 Am besten mit Kopfhörern singen, sonst hört das Mikrofon die Musik mit. Die Zeit läuft ab deinem ersten Ton.${g ? ' Karaoke-Videos kommen von YouTube; alle Rechte an der Musik liegen bei den Urhebern.' : ''}</p>
      <details class="panel rew"><summary><b>🎁 Mikro & Bühne</b> · deine Sterne: <span class="stars">${st}</span> von ${D.KARAOKE.length * 3} ★</summary>
        <p class="hint" style="text-align:left">Sterne holst du in den Genre-Challenges. Damit schaltest du Mikros (Farbe deiner Notenbalken), Bühnen und Outfit-Farben für deinen Avatar frei.</p>
        <div class="opts">${rw('mic')}</div><div class="opts">${rw('stage')}</div>
        <p class="hint" style="text-align:left">Outfit-Farben: ${D.REWARDS.filter(r => r.type === 'color').map(r => (S.unlocked(save, r) ? '✅ ' : '🔒 ') + r.name + ' (' + r.need + ' ★)').join(' · ')} – im Avatar-Editor.</p></details>
      <button class="btn gold xl" type="button" id="singGo" data-focus style="width:100%;margin-top:10px">🎤 Vorsingen starten</button>`;
  };
  $('#singBox').addEventListener('input', e => {
    if (e.target.id === 'singTitle') sing.title = e.target.value;
    else if (e.target.id === 'singLink') sing.own = e.target.value;
  });
  $('#singBox').addEventListener('click', e => {
    const b = e.target.closest('[data-sg],[data-ss],[data-sl]');
    if (b) {
      const k = b.dataset.sg != null ? 'sg' : b.dataset.ss != null ? 'ss' : 'sl', v = b.dataset[k];
      sing.daily = false;
      if (k === 'sg') { sing.g = v; if (v !== 'frei' && !Number.isInteger(sing.song)) sing.song = 0; }
      else if (k === 'ss') sing.song = v === 'acap' || v === 'own' ? v : +v;
      else sing.len = +v;
      RENDER.sSing(); const nb = $(`#singBox [data-${k}="${v}"]`); if (nb) nb.focus();
      return;
    }
    const r = e.target.closest('[data-rw]');
    if (r) { const x = D.REWARDS.find(y => y.id === r.dataset.rw); if (x && S.unlocked(save, x)) { save.rew[x.type] = x.id; persist(); RENDER.sSing(); const d = $('#singBox details.rew'); if (d) d.open = true; const nb = $(`#singBox [data-rw="${x.id}"]`); if (nb) nb.focus(); } return; }
    if (e.target.closest('#singDaily')) { const ds = S.dailySong(S.dailyDay()); sing.g = ds.g; sing.song = ds.i; sing.len = 60; sing.daily = true; singStart(); return; }
    if (e.target.closest('#singFind')) { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent((sing.title.trim() || 'Song') + ' karaoke lyrics'), '_blank', 'noopener'); return; }
    if (e.target.closest('#singGo')) singStart();
    else if (e.target.closest('#singStop')) singFinish();
    else if (e.target.closest('#singX')) RENDER.sSing();
  });
  function singEnd() {
    const run = sing.run; if (!run) return;
    sing.run = null; run.ended = true; cancelAnimationFrame(run.raf);
    removeEventListener('message', run.onMsg);
    if (run.rec && run.rec.state !== 'inactive') try { run.rec.stop(); } catch (e) { /* egal */ }
    A.micStop();
    if (run.playId != null && !run.done && save.season && save.season.status === 'playing') { S.cancelRound(save.season); persist(); }   // abgebrochen: Runde nicht verbraucht
    const f = $('#singVid'); if (f) f.src = 'about:blank';
  }
  const REC_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'];
  const GRADE = { perfekt: '✨ Perfekt!', super: '🔥 Super!', gut: '👍 Gut', daneben: '😬 Daneben' };
  async function singStart() {
    if (!save.profile && !sing.party) { openAvatar('sing'); return; }
    if (!save.settings.mic) { micConsent(() => { if (save.settings.mic) singStart(); else RENDER.sSing(); }); return; }
    const pk = singPick();
    if (sing.song === 'own' && sing.own.trim() && !pk.vid) { toast('Das ist kein YouTube-Link. Kopiere die Adresse des Videos (youtube.com/watch?v=… oder youtu.be/…).', 4000); return; }
    airStop(); A.init(); A.micStop();
    try { await A.micStart(true); } catch (e) { save.settings.mic = false; persist(); micConsent(() => RENDER.sSing()); return; }
    if (cur !== 'sSing' || sing.run) { if (!sing.run) A.micStop(); return; }
    if (sing.recUrl) { URL.revokeObjectURL(sing.recUrl); sing.recUrl = null; sing.recBlob = null; }
    const cx = sing.ctx, career = !!(cx && cx.mode === 'career'), s = save.season;
    const run = sing.run = { pk, frames: [], started: false, acc: 0, last: performance.now(), raf: 0, chunks: [], rec: null, len: sing.len, ended: false, view: [], playId: null, done: false,
      seed: (Date.now() >>> 0) || 1, live: S.liveScorer(sing.len, 0.05), turned: {}, pts: 0, party: sing.party,
      mic: (D.REWARDS.find(r => r.id === save.rew.mic) || D.REWARDS[0]).color };
    const ds = S.dailySong(S.dailyDay());
    run.daily = !cx && !sing.party && sing.daily && pk.vid === ds.vid && run.len === 60 ? S.dailyDay() : null;
    if (career) {
      run.playId = s && s.status === 'backstage' ? S.startRound(s) : null;
      if (run.playId == null) { sing.run = null; A.micStop(); go('sBack'); return; }
      persist();
    }
    // Blind Audition: dieselbe Jury, die am Ende entscheidet, dreht sich live um, sobald sie Ja sagen würde
    const isOnline = !!(cx && cx.mode === 'online');
    run.panel = career ? S.panelOf(s, s.round) : isOnline ? (cx.panel || D.MAIN_JURY).slice() : D.MAIN_JURY.slice();
    run.jseed = career ? s.seed : isOnline ? cx.seed : run.seed; run.jround = career ? s.round : isOnline ? cx.r : 0; run.jwho = isOnline ? ON.me : 'p';
    if (isOnline) run.len = ONLINE_SING;
    $('#singBox').innerHTML = `<header class="bar"><span></span><h2>${run.party ? '🎉 ' + esc(party.players[run.party.i]) + ': ' : run.daily ? '📅 ' : '🎙️ '}${esc(pk.title)}</h2><span></span></header>
      ${pk.vid ? `<div class="video"><iframe id="singVid" src="https://www.youtube-nocookie.com/embed/${pk.vid}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${save.settings.mute ? '&mute=1' : ''}" title="Karaoke-Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
        <p class="hint">${esc(pk.credit)} · <a href="https://www.youtube.com/watch?v=${pk.vid}" target="_blank" rel="noopener">YouTube ↗</a></p><p class="banner lose" id="singErr" hidden>Dieses Video darf hier nicht abgespielt werden. Brich ab und wähle einen anderen Song – oder sing einfach a cappella weiter.</p>` : `<p class="hint">${esc(pk.credit)}</p>`}
      <div class="chairs" aria-label="Blind Audition: Die Jury dreht sich um, wenn du überzeugst">${run.panel.map(jur).map(j => `<div class="chair" data-c="${j.id}"><span class="back">🪑</span>${jimg(j, 'js')}<small>${esc(j.name)}</small></div>`).join('')}</div>
      <div class="panel singLive"><div class="singTop"><b id="singNote">–</b><span id="singCents"></span><span class="singPts">🎯 <b id="singPts">0</b></span><span id="singTime">Sing los – die Zeit startet mit deinem ersten Ton</span></div>
        <div class="singStage"><canvas id="singCv" height="190" aria-label="Deine Töne als Notenbalken"></canvas><div class="singPop" id="singPop" aria-live="polite"></div></div><div class="meter"><i id="singLv"></i></div></div>
      <div class="row2"><button class="btn gold" id="singStop" type="button" data-focus>⏹ Fertig – zur Jury</button>${run.playId != null ? '' : '<button class="btn" id="singX" type="button">✖ Abbrechen</button>'}</div>`;
    focusFirst($('#singBox'));
    const vid = $('#singVid');
    run.onMsg = e => {   // YouTube meldet Fehler 101/150, wenn der Kanal das Einbetten verbietet
      if (!vid || e.source !== vid.contentWindow) return;
      let d = null; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
      if (d && d.event === 'onError') { const er = $('#singErr'); if (er) er.hidden = false; }
    };
    if (vid) { addEventListener('message', run.onMsg); vid.addEventListener('load', () => { try { const w = vid.contentWindow; w.postMessage(JSON.stringify({ event: 'listening', id: 'smyv', channel: 'widget' }), '*');
      w.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onError'], id: 'smyv', channel: 'widget' }), '*'); } catch (x) { /* egal */ } }); }
    try {
      const ms = A.micRecStream() || A.micStream();
      if (ms && window.MediaRecorder) {
        const mt = REC_TYPES.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
        run.rec = new MediaRecorder(ms, Object.assign({ audioBitsPerSecond: 128000 }, mt ? { mimeType: mt } : {}));
        run.rec.ondataavailable = e => { if (e.data && e.data.size) run.chunks.push(e.data); };
      }
    } catch (e) { run.rec = null; }
    const cv = $('#singCv'), c2 = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), pop = $('#singPop');
    cv.width = Math.max(300, cv.clientWidth * dpr); cv.height = 190 * dpr;
    const tm = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
    function draw() {   // Notenbahn wie bei SingStar: gehaltene Töne als Balken (gold = sauber), dünne Linie = deine echte Tonhöhe
      const w = cv.width, h = cv.height, vw = run.view, rs = vw.filter(v => v.r != null).slice(-60).map(v => v.r).sort((a, b) => a - b);
      const mid = rs.length ? rs[rs.length >> 1] : 62, lo = Math.round(mid) - 9, rows = 18, rh = h / rows, y = m => h - (m - lo + 0.5) * rh;
      c2.clearRect(0, 0, w, h); c2.font = (11 * dpr) + 'px sans-serif';
      for (let n = lo; n < lo + rows; n++) {
        c2.fillStyle = n % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,0)'; c2.fillRect(0, y(n) - rh / 2, w, rh);
        if (((n % 12) + 12) % 12 === 0) { c2.fillStyle = 'rgba(255,255,255,.55)'; c2.fillText(noteName(n), 4, y(n) + 4 * dpr); }
      }
      const step = w / 160, x0 = i => w - (vw.length - i) * step;
      for (let i = 0; i < vw.length;) {   // Balken: gleiche Halbton-Stufe am Stück
        const r = vw[i].r; if (r == null) { i++; continue; }
        let j = i, ok = 0; while (j < vw.length && vw[j].r != null && Math.round(vw[j].r * 2) === Math.round(r * 2)) { if (vw[j].ok) ok++; j++; }
        const good = ok / (j - i) >= 0.6, bx = x0(i), bw = Math.max(step, (j - i) * step - 2), by = y(r) - rh * 0.38, bh = rh * 0.76;
        const gc = run.mic === 'rainbow' ? `hsl(${Math.round((bx / w * 300 + performance.now() / 15) % 360)},90%,62%)` : run.mic;
        c2.fillStyle = good ? gc : '#60a5fa'; c2.shadowColor = good ? gc : 'transparent'; c2.shadowBlur = good ? 10 * dpr : 0;
        c2.beginPath(); if (c2.roundRect) c2.roundRect(bx, by, bw, bh, bh / 2); else c2.rect(bx, by, bw, bh); c2.fill(); c2.shadowBlur = 0;
        i = j;
      }
      c2.strokeStyle = 'rgba(255,255,255,.85)'; c2.lineWidth = 2 * dpr; c2.beginPath(); let pen = false;
      vw.forEach((v, i) => { if (v.m == null) { pen = false; return; } const px = x0(i) + step / 2, py = y(v.m); if (pen) c2.lineTo(px, py); else c2.moveTo(px, py); pen = true; });
      c2.stroke();
    }
    function showPop(ev) {
      pop.textContent = GRADE[ev.t] + (ev.combo >= 2 && ev.t !== 'daneben' ? ' · Combo ×' + ev.combo : '');
      pop.className = 'singPop ' + ev.t; void pop.offsetWidth; pop.classList.add('show');
    }
    // gleiche Jury-Rechnung wie die Endwertung (crit nach singCareer), damit Stühle und Urteil zusammenpassen
    const online = !!(cx && cx.mode === 'online'), jmods = career && s ? s.mods : null, jsymp = cx && cx.talk ? S.mergeSymp(cx.talk.symp, jmods && jmods.symp) : null;
    run.jury = crit => S.judge(crit, online ? cx.style : pk.style, run.jseed, run.jround, run.jwho, online ? null : jsymp, run.panel);
    function chairs() {   // jede Sekunde: Würde jemand aus der Jury jetzt Ja sagen? Dann dreht er/sie sich um – und bei Nein wieder weg.
      const part = S.singScore(run.frames, run.party || !save.profile ? null : save.profile.attrs, 0.05);
      if (part.sing.voiced < 8) return;
      if (cx && cx.sel) S.singCareer(part, career && s ? s.lastPerf : null, jmods, cx.sel.action);   // wie die Wertung am Ende
      run.jury(part.crit).forEach(v => {
        const el = $(`#singBox .chair[data-c="${v.id}"]`);
        if (run.turned[v.id] && !v.yes) { delete run.turned[v.id]; if (el) el.classList.remove('on'); toast('↩️ ' + jur(v.id).name + ' dreht sich wieder weg …', 2000); return; }
        if (run.turned[v.id] || !v.yes || v.score < jur(v.id).need + 1) return;
        run.turned[v.id] = true; if (el) el.classList.add('on');
        A.sfx('yes'); toast('🔴 ' + jur(v.id).name + ' hat sich umgedreht!', 2000);
      });
    }
    function frame(now) {
      if (run.ended) return;
      if (cur !== 'sSing' || sing.run !== run) { singEnd(); return; }
      run.acc += Math.min(0.25, (now - run.last) / 1000); run.last = now;
      if (run.acc >= 0.05) {
        const m = A.micPitch(), l = A.micLevel() || 0;
        if (!run.started && m != null) { run.started = true; if (run.rec) try { run.rec.start(1000); } catch (e) { run.rec = null; } }
        for (; run.acc >= 0.05; run.acc -= 0.05) {
          let lv = { r: null, ok: false };
          if (run.started) {
            run.frames.push({ m: m == null ? null : Math.round(m * 100) / 100, l: Math.round(l * 1e4) / 1e4 });
            lv = run.live.push(m); run.pts = lv.total; if (lv.ev) showPop(lv.ev);
            if (run.frames.length % 20 === 0) chairs();
          }
          run.view.push({ m, r: lv.r, ok: lv.ok }); if (run.view.length > 160) run.view.shift();
        }
        $('#singLv').style.width = Math.min(100, l / 0.15 * 100) + '%';
        const off = run.live.state.off, ct = m == null ? null : Math.round((m - off - Math.round(m - off)) * 100);
        $('#singNote').textContent = m == null ? '–' : noteName(m);
        $('#singCents').textContent = ct == null ? '' : (ct > 0 ? '+' : '') + ct + ' ct';
        $('#singCents').className = ct == null ? '' : Math.abs(ct) <= 20 ? 'ok' : 'off';
        $('#singPts').textContent = run.pts.toLocaleString('de-DE');
        const el = run.frames.length * 0.05;
        if (run.started) $('#singTime').textContent = tm(el) + ' / ' + tm(run.len);
        draw();
        if (el >= run.len) { singFinish(); return; }
      }
      run.raf = requestAnimationFrame(frame);
    }
    run.raf = requestAnimationFrame(frame);
  }
  // Am Ende zählen nur Stühle, deren Jury-Mitglied auch im Endurteil Ja sagt
  function finalTurned(run, crit) { return run.jury(crit).filter(v => v.yes && run.turned[v.id]).map(v => v.id); }
  function singFinish() {
    const run = sing.run; if (!run || run.ended) return;
    if (run.frames.filter(f => f.m != null).length < 40) { RENDER.sSing(); toast('🎙️ Ich habe kaum Gesang gehört. Sing etwas länger oder näher am Mikrofon.', 3500); return; }
    const rec = run.rec, chunks = run.chunks, cx = sing.ctx; run.rec = null; run.done = true;   // singEnd soll Aufnahme und Runde nicht verwerfen
    const fin = run.live.end();
    singEnd();
    let doneOnce = false;
    const done = () => {
      if (doneOnce) return; doneOnce = true;
      let url = null, blob = null;
      try { if (chunks.length) { blob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' }); url = URL.createObjectURL(blob); } } catch (e) { url = null; blob = null; }
      sing.recUrl = url; sing.recBlob = blob;
      const p = save.profile, g = genre(sing.g), res = S.singScore(run.frames, run.party || !p ? null : p.attrs, 0.05);
      const out = { sing: res.sing, rec: url, pts: fin.total, combo: fin.best, title: S.singTitle(res.perf), turned: Object.keys(run.turned), song: run.pk.title };
      if (run.party) {   // Karaoke-Abend: Punkte notieren, Jury-Urteil zeigen, dann zurück zur Rangliste
        const oc = Object.assign(res, { style: run.pk.style, symp: null }), fc = S.freeCasting(null, oc, run.seed), nm = party.players[run.party.i];
        out.turned = finalTurned(run, oc.crit);
        party.scores[run.party.i].push({ pts: fin.total, perf: res.perf, title: out.title, song: run.pk.title, yes: fc.yes }); party.turn++; sing.party = null;
        showResult({ fc, oc, out, free: true, ret: 'sParty', credit: run.pk.credit, name: nm }); return;
      }
      const before = S.starSum(save);
      save.singBest = Math.max(save.singBest || 0, fin.total);
      if (run.daily) { const k = 'd' + run.daily, old = (save.daily || {})[k] || 0; save.daily = { [k]: Math.max(old, fin.total) }; out.daily = { pts: fin.total, best: Math.max(old, fin.total), rec: fin.total > old }; }
      if (cx && cx.mode === 'online') {   // Online-Show: Ergebnis an den Gastgeber, weiter in der Show
        sing.ctx = null; ON.mine = { r: cx.r, crit: res.crit, perf: res.perf };
        p.xp += Math.round(res.perf / 4); persist();
        onSend({ t: 'perf', r: cx.r, perf: res.perf, crit: res.crit });
        go('sOnline'); toast(`${out.title} · 🎯 ${fin.total.toLocaleString('de-DE')} Punkte – gleich entscheidet die Jury!`, 3500); return;
      }
      if (cx) {   // echtes Vorsingen in Karriere oder Freiem Casting: weiter wie nach einem Bühnenauftritt
        const career = cx.mode === 'career', s = save.season, mods = career && s ? s.mods : null;
        const f = { mode: cx.mode, playId: run.playId, seed: run.seed, sel: Object.assign({}, cx.sel, { style: run.pk.style }), talk: cx.talk, credit: run.pk.credit, bg: cx.bg, ret: career ? 'sBack' : 'sPrep' };
        const oc = Object.assign(S.singCareer(res, career && s ? s.lastPerf : null, mods, cx.sel.action), { style: run.pk.style, approach: cx.sel.approach, action: cx.sel.action,
          symp: S.mergeSymp(cx.talk.symp, mods && mods.symp), votesBonus: cx.talk.votes });
        out.turned = finalTurned(run, oc.crit);
        sing.ctx = null; flow = f; decide(f, out, oc); return;
      }
      const oc = Object.assign(res, { style: run.pk.style, symp: null });
      const fc = S.freeCasting(p, oc, run.seed);
      out.turned = finalTurned(run, oc.crit);
      let chal = null;
      if (g) {
        const stn = S.singStars(g.id, res, fc), old = save.singCh[g.id] || { best: 0, stars: 0 };
        chal = { g, stars: stn, val: res.sing[g.goal.k], met: res.sing[g.goal.k] >= g.goal.min, rec: res.perf > old.best, up: stn > old.stars };
        save.singCh[g.id] = { best: Math.max(old.best, res.perf), stars: Math.max(old.stars, stn) };
      }
      p.xp += Math.round(res.perf / 4); persist();
      D.REWARDS.forEach((r, k) => { if (r.need > before && S.unlocked(save, r)) setTimeout(() => toast('🎁 Neu freigeschaltet: ' + r.name, 2600), 1200 + k * 300); });
      showResult({ fc, oc, out, free: true, ret: 'sSing', chal, credit: run.pk.credit });
    };
    if (rec && rec.state !== 'inactive') { rec.onstop = done; try { rec.stop(); } catch (e) { done(); } setTimeout(done, 1500); }
    else done();
  }

  // ---------- Karaoke-Abend: mehrere Sänger nacheinander an einem Gerät ----------
  const party = { players: ['', ''], rounds: 1, on: false, turn: 0, scores: [], cheered: false };
  const partyTotal = i => party.scores[i].reduce((a, x) => a + x.pts, 0);
  RENDER.sParty = () => {
    const n = party.players.length, total = n * party.rounds, box = $('#partyBox');
    if (!party.on) {
      box.innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Zurück</button><h2>🎉 Karaoke-Abend</h2><span></span></header>
        <div class="panel"><p>Ihr singt nacheinander am selben Gerät – jede Person sucht sich ihren Song aus. Die Jury urteilt nach jedem Auftritt, am Ende gibt es die <b>Siegerehrung</b> nach Live-Punkten.</p></div>
        <h3>Wer singt mit?</h3><div class="partyNames">${party.players.map((x, i) => `<div class="row2"><input class="pName" data-pi="${i}" type="text" maxlength="16" value="${esc(x)}" placeholder="Sänger ${i + 1}" aria-label="Name Sänger ${i + 1}">${n > 2 ? `<button class="btn sm" type="button" data-pdel="${i}" aria-label="Sänger ${i + 1} entfernen">✖</button>` : ''}</div>`).join('')}</div>
        ${n < 8 ? '<button class="btn sm violet" type="button" id="pAdd">＋ Sänger hinzufügen</button>' : ''}
        <h3>Runden</h3><div class="seg">${[1, 2, 3].map(r => `<button class="btn" type="button" data-pr="${r}" aria-pressed="${party.rounds === r}">${r}</button>`).join('')}</div>
        <h3>Länge je Auftritt</h3><div class="seg">${[30, 60, 90].map(x => `<button class="btn" type="button" data-pl="${x}" aria-pressed="${sing.len === x}">${x} s</button>`).join('')}</div>
        <p class="hint" style="text-align:left">🎧 Tipp: Fernseher oder Lautsprecher für das Karaoke-Video, das Handy als Mikrofon ganz nah am Mund.</p>
        <button class="btn gold xl" type="button" id="pStart" data-focus style="width:100%;margin-top:10px">🎉 Los geht's!</button>`;
      return;
    }
    const rank = party.players.map((x, i) => ({ i, name: x, pts: partyTotal(i), best: party.scores[i].slice().sort((a, b) => b.pts - a.pts)[0] })).sort((a, b) => b.pts - a.pts);
    const table = `<div class="panel">${rank.map((r, k) => `<div class="crit"><span>${k + 1}. ${esc(r.name)}</span><b>${r.pts.toLocaleString('de-DE')}</b></div>`).join('')}</div>`;
    if (party.turn < total) {
      const i = party.turn % n, rd = Math.floor(party.turn / n) + 1;
      box.innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Menü</button><h2>🎉 Karaoke-Abend</h2><span>Runde ${rd}/${party.rounds}</span></header>
        <div class="banner gold" style="font-size:1.3em">🎤 Jetzt dran: <b>${esc(party.players[i])}</b></div>
        <button class="btn gold xl" type="button" id="pSing" data-focus style="width:100%">🎶 Song wählen & singen</button>
        <h3>Zwischenstand</h3>${table}
        <div class="row2"><button class="btn sm" type="button" id="pSkip">⏭ ${esc(party.players[i])} aussetzen</button><button class="btn sm red" type="button" id="pEnd">🏁 Abend beenden</button></div>`;
      return;
    }
    const med = ['🥇', '🥈', '🥉'];
    box.innerHTML = `<header class="bar"><button class="btn sm" data-back type="button">← Menü</button><h2>🏆 Siegerehrung</h2><span></span></header>
      <div class="podium">${rank.slice(0, 3).map((r, k) => `<div class="pod p${k + 1}"><div class="medal">${med[k]}</div><b>${esc(r.name)}</b><small>${r.pts.toLocaleString('de-DE')} Punkte</small>${r.best ? `<small class="muted">${esc(r.best.title)}<br>„${esc(r.best.song)}“</small>` : ''}</div>`).join('')}</div>
      ${rank.length > 3 ? `<div class="panel">${rank.slice(3).map((r, k) => `<div class="crit"><span>${k + 4}. ${esc(r.name)}</span><b>${r.pts.toLocaleString('de-DE')}</b></div>`).join('')}</div>` : ''}
      <div class="panel host">${AV.svg(D.HOST.look, 'happy')}<div class="speech"><b>Rico:</b> ${rank[0] && rank[0].pts ? 'Applaus für ' + esc(rank[0].name) + ' – der Star des Abends!' : 'Was für ein Abend!'}</div></div>
      <div class="row2"><button class="btn gold" type="button" id="pAgain" data-focus>🔁 Nochmal mit allen</button><button class="btn" type="button" id="pNew">✏️ Neue Runde einrichten</button></div>`;
    if (!party.cheered) { party.cheered = true; sfx('applause', 2, '👏 Siegerehrung'); }
  };
  $('#partyBox').addEventListener('input', e => { const i = e.target.dataset.pi; if (i != null) party.players[+i] = e.target.value; });
  $('#partyBox').addEventListener('click', e => {
    const t = e.target, keep = sel => { RENDER.sParty(); const nb = $('#partyBox ' + sel); if (nb) nb.focus(); };
    if (t.closest('#pAdd')) { party.players.push(''); keep('[data-pi="' + (party.players.length - 1) + '"]'); }
    else if (t.closest('[data-pdel]')) { party.players.splice(+t.closest('[data-pdel]').dataset.pdel, 1); keep('#pAdd'); }
    else if (t.closest('[data-pr]')) { party.rounds = +t.closest('[data-pr]').dataset.pr; keep('[data-pr="' + party.rounds + '"]'); }
    else if (t.closest('[data-pl]')) { sing.len = +t.closest('[data-pl]').dataset.pl; keep('[data-pl="' + sing.len + '"]'); }
    else if (t.closest('#pStart')) {
      party.players = party.players.map((x, i) => S.cleanName(x || 'Sänger ' + (i + 1)) || 'Sänger ' + (i + 1));
      party.on = true; party.turn = 0; party.cheered = false; party.scores = party.players.map(() => []); RENDER.sParty(); focusFirst($('#partyBox'));
    } else if (t.closest('#pSing')) { sing.ctx = null; sing.daily = false; sing.party = { i: party.turn % party.players.length }; backTo.sSing = 'sParty'; go('sSing'); }
    else if (t.closest('#pSkip')) { party.turn++; RENDER.sParty(); focusFirst($('#partyBox')); }
    else if (t.closest('#pEnd')) { party.turn = party.players.length * party.rounds; RENDER.sParty(); focusFirst($('#partyBox')); }
    else if (t.closest('#pAgain')) { party.turn = 0; party.cheered = false; party.scores = party.players.map(() => []); RENDER.sParty(); focusFirst($('#partyBox')); }
    else if (t.closest('#pNew')) { party.on = false; RENDER.sParty(); focusFirst($('#partyBox')); }
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
      row('⚖️ Jury', 'Wechselnd: Ab dem Recall sitzen Gastjuroren mit eigenem Geschmack in der Jury. Gilt ab der nächsten Staffel.', seg('jury', [['wechsel', 'Wechselnd'], ['fest', 'Stammjury']])) +
      row('🔇 Stumm', 'Alles aus – das Spiel läuft trotzdem', tog('mute')) +
      row('💬 Untertitel', 'Wichtige Töne als Text einblenden', tog('captions')) +
      row('🎙️ Mikrofon-Modus', 'Mit der Stimme spielen: Noten ansingen und Tonhöhe treffen. Nur auf deinem Gerät, keine Aufnahme.', tog('mic')) +
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
  function micConsent(after) {
    overlay(`<h3>🎙️ Mikrofon-Modus</h3><p>Das Spiel hört deine Stimme: In Notenteilen trifft jeder angesungene Ton die Note am Ring, in Gesangsteilen bewegt deine <b>Tonhöhe</b> den Mikro-Punkt.</p>
      <p class="muted">Ausgewertet wird nur Tonhöhe und Lautstärke, direkt auf deinem Gerät. Nichts wird gespeichert oder gesendet; beim Freien Vorsingen kannst du deine Aufnahme direkt anhören, danach ist sie weg. Das Mikrofon ist nur während des Auftritts an. Kopfhörer helfen, damit die Musik nicht mitzählt.</p>
      <button class="btn gold" type="button" data-act="ok">Mikrofon erlauben</button><button class="btn" type="button" data-act="no">Ohne Mikrofon spielen</button>`,
    { ok: async () => {
      A.init();
      try { await A.micStart(); A.micStop(); save.settings.mic = true; persist(); closeOv(); toast('🎙️ Mikrofon bereit – sing die Noten einfach an!'); }
      catch (e) {
        save.settings.mic = false; persist(); closeOv();
        let framed = false; try { framed = window.top !== window.self; } catch (x) { framed = true; }
        if (e && e.name === 'NotFoundError') { toast('Kein Mikrofon gefunden – du spielst mit Tasten/Touch.', 4500); return; }
        if (framed) {   // eingebettet: die Seite drumherum kann das Mikrofon sperren – oder der Browser für diese Seite
          (after || RENDER.sSettings)();
          const fp = document.featurePolicy || document.permissionsPolicy;
          const pageBlocks = !(fp && fp.allowsFeature) || !fp.allowsFeature('microphone');
          overlay(`<h3>🎙️ Mikrofon gesperrt</h3>${pageBlocks
            ? '<p>Hier ist das Spiel in eine andere Seite eingebettet, die das Mikrofon nicht freigibt. Öffne das Spiel direkt, dann fragt dein Browser nach dem Mikrofon.</p>'
            : '<p>Dein Browser hat das Mikrofon für diese Seite gesperrt. Tippe oben in der Adresszeile auf das Schloss/Einstellungen-Symbol, erlaube das Mikrofon und versuch es noch einmal.</p>'}
            <p class="muted">Ist es dort auch gesperrt: In den Website-Einstellungen des Browsers das Mikrofon erlauben.</p>
            <button class="btn gold" type="button" data-act="open">↗ Spiel direkt öffnen</button><button class="btn" type="button" data-act="no">Mit Tasten/Touch weiter</button>`,
          { open: () => { closeOv(); window.open(location.href.split('#')[0], '_blank', 'noopener'); }, no: closeOv });
          return;
        }
        toast('Mikrofon nicht erlaubt oder nicht vorhanden – du spielst mit Tasten/Touch. Tipp: In den Website-Einstellungen des Browsers das Mikrofon erlauben.', 4500);
      }
      (after || RENDER.sSettings)();
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

  // ---------- 🌐 Online-Show: jede Person singt auf dem eigenen Gerät, der Gastgeber rechnet ----------
  // Verbindung über ../cloud/fire-peer.js (PeerJS-kompatibel, Firebase vermittelt nur). Einladungslinks über EasyGamesLink.share.
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'smyv-';
    const N = { role: '', code: '', peer: null, conns: new Map() }, libs = {};
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
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { /* weg */ } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { /* egal */ } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { /* weg */ } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { /* weg */ } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { /* weg */ } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { /* weg */ } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { /* weg */ } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diese Show gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  const cleanLook = l => { const o = {}; if (l && typeof l === 'object') for (const k of ['skin', 'hair', 'hairColor', 'outfit', 'outfitColor', 'acc', 'beard', 'piercing']) { const v = l[k]; if (typeof v === 'number' || (typeof v === 'string' && v.length < 24)) o[k] = v; } return o; };
  const STYLE_ROT = ['pop', 'soul', 'rock', 'ballade'];
  const ONLINE_SING = 60;   // Sekunden je Auftritt beim echten Vorsingen online
  // st = gemeinsamer Stand (vom Gastgeber verteilt), H = nur beim Gastgeber
  const ON = { net: null, me: '', st: null, played: -1, voted: -1, pend: '', H: null };
  function onReset() { if (ON.net) ON.net.close(); if (ON.H && ON.H.tick) clearInterval(ON.H.tick); ON.net = null; ON.me = ''; ON.st = null; ON.played = -1; ON.voted = -1; ON.H = null; }
  const amHost = () => !!ON.H;
  const onPlayer = id => (ON.st && ON.st.players.find(p => p.id === id)) || null;

  // --- Gastgeber ---
  function hostState() {
    const h = ON.H;
    return { code: ON.net ? ON.net.code : '', phase: h.phase, sing: !!h.sing, round: h.round, players: h.players, field: h.field, def: h.def, seed: h.seed, style: h.style, panel: h.panel,
      done: Object.keys(h.perf), voted: Object.keys(h.votes), res: h.res, deadline: h.deadline };
  }
  function hostSync() { const s = hostState(); ON.st = s; ON.net.send({ t: 'state', s }); onRender(); }
  async function onHost() {
    onReset(); const p = save.profile;
    ON.H = { phase: 'lobby', round: 0, players: [{ id: 'host', name: p.name, look: cleanLook(p.look), on: true }], field: [], def: null, seed: 0, style: 'pop', panel: null, perf: {}, votes: {}, res: null, deadline: 0 };
    ON.me = 'host';
    ON.net = mkNet({ onMsg: hostMsg, onLeave: id => { const pl = id !== 'host' && ON.H && ON.H.players.find(x => x.id === id); if (pl) { pl.on = false; hostSync(); hostCheck(); } } });
    ON.st = { phase: 'connecting', players: [] }; onRender();
    const net = ON.net;   // wer zwischendurch „Verlassen“ drückt, beendet diesen Versuch
    try { await net.host(); } catch (e) { if (ON.net === net) { onReset(); toast(netErr(e), 4000); onRender(); } return; }
    if (ON.net !== net) { net.close(); return; }
    ON.H.tick = setInterval(hostCheck, 1000);
    hostSync();
  }
  function hostMsg(from, d) {
    const h = ON.H; if (!h || from === 'host') return;   // „host“ ist der Gastgeber selbst, nie eine fremde Verbindung
    if (d.t === 'hi') {
      let pl = h.players.find(x => x.id === from);
      if (!pl && h.phase === 'lobby') h.players = h.players.filter(x => x.on);   // Plätze von Gegangenen in der Lobby frei machen
      if (!pl) { if (h.players.filter(x => x.on).length >= 8) { ON.net.sendTo(from, { t: 'full' }); return; } pl = { id: from }; h.players.push(pl); }
      pl.name = S.cleanName(d.name) || 'Gast'; pl.look = cleanLook(d.look); pl.on = true;
      ON.net.sendTo(from, { t: 'you', id: from }); hostSync();
      if (h.phase === 'lobby') sfx('cue', 0, '🙋 ' + pl.name + ' ist dabei');
    } else hostInput(from, d);
  }
  function hostInput(from, d) {
    const h = ON.H; if (!h) return;
    if (d.t === 'perf' && h.phase === 'perform' && d.r === h.round && h.field.includes(from) && !h.perf[from]) {
      const crit = {}; S.CK.forEach(k => { crit[k] = S.clamp(+(d.crit && d.crit[k]) || 0); });
      h.perf[from] = { perf: S.clamp(+d.perf || 0), crit }; hostSync(); hostCheck();
    } else if (d.t === 'vote' && h.phase === 'vote' && d.r === h.round && !h.votes[from] && h.field.includes(d.for) && d.for !== from && h.players.some(p => p.id === from && p.on)) {   // nur zugelassene Personen
      h.votes[from] = d.for; hostSync(); hostCheck();
    }
  }
  function hostStart(round) {
    const h = ON.H, on = h.players.filter(p => p.on);
    if (!round) h.field = on.map(p => p.id);
    if (h.field.length < 2) { toast('Mindestens zwei Personen müssen dabei sein.'); return; }
    h.round = round; h.def = S.onlineDef(round, h.field.length); h.seed = (Math.random() * 1e9) >>> 0;
    h.style = STYLE_ROT[(h.seed + round) % STYLE_ROT.length];
    h.panel = S.panelOf({ seed: h.seed, jury: save.settings.jury }, round);
    h.perf = {}; h.votes = {}; h.res = null; h.phase = 'perform';
    h.deadline = Date.now() + (h.sing ? ONLINE_SING + 100 : h.def.parts.length * h.def.len + 45) * 1000;   // echtes Vorsingen: Zeit für die Songwahl
    hostSync();
  }
  function hostCheck() {
    const h = ON.H; if (!h) return;
    const onIds = h.players.filter(p => p.on).map(p => p.id);
    if (h.phase === 'perform') {
      const open = h.field.filter(id => !h.perf[id] && onIds.includes(id));
      if (!open.length || Date.now() > h.deadline) { h.phase = 'vote'; h.deadline = Date.now() + 30000; hostSync(); }
    } else if (h.phase === 'vote') {
      const open = onIds.filter(id => !h.votes[id] && h.field.some(f => f !== id));
      if (!open.length || Date.now() > h.deadline) hostResolve();
    }
  }
  function hostResolve() {
    const h = ON.H, count = {};
    Object.values(h.votes).forEach(id => { count[id] = (count[id] || 0) + 1; });
    const entries = h.field.map(id => { const pl = h.players.find(p => p.id === id), r = h.perf[id];
      return r ? { id, name: pl.name, perf: r.perf, crit: r.crit, style: h.style, votesN: count[id] || 0 } : { id, name: pl.name, missing: true, votesN: count[id] || 0 }; });
    const r = S.onlineResolve({ def: h.def, round: h.round, seed: h.seed, panel: h.panel, entries });
    h.res = { round: r.round, final: r.final, advanced: r.advanced, rescued: r.rescued, out: r.out,
      entries: r.entries.map(e => ({ id: e.id, name: e.name, perf: e.perf, juryAvg: e.juryAvg, yes: e.yes, votesN: e.votesN, votes: e.votes, total: e.total, rank: e.rank, missing: e.missing,
        jury: e.jury.map(v => ({ id: v.id, score: v.score, yes: v.yes, tier: v.tier, mood: v.mood, fav: v.fav })) })) };
    h.field = h.field.filter(id => r.advanced.includes(id));
    h.phase = r.final ? 'final' : 'result'; hostSync();
  }

  // --- Gast ---
  async function onJoin(code) {
    onReset(); ON.net = mkNet({
      onMsg: (from, d) => {
        if (d.t === 'you') ON.me = d.id;
        else if (d.t === 'full') { toast('Die Show ist voll (höchstens 8).', 4000); onReset(); onRender(); }
        else if (d.t === 'state' && d.s) { ON.st = d.s; onRender(); }
      },
      onLeave: () => { const was = ON.st; onReset(); if (was) { if (stage && flow && flow.mode === 'online') { stopAll(); flow = null; } toast('📡 Die Verbindung zum Gastgeber ist weg – die Show ist beendet.', 4500); go('sOnline'); } } });
    ON.st = { phase: 'connecting', players: [] }; onRender();
    const net = ON.net;
    try { await net.join(code); } catch (e) { if (ON.net === net) { onReset(); toast(netErr(e), 4500); onRender(); } return; }
    if (ON.net !== net) { net.close(); return; }
    net.send({ t: 'hi', name: save.profile.name, look: cleanLook(save.profile.look) });
  }
  function onSend(d) { if (amHost()) hostInput('host', d); else if (ON.net) ON.net.send(d); }

  // --- Auftritt ---
  function onPerform(st) {
    if (st.sing) {   // echtes Vorsingen: jede Person wählt ihren Song und singt ins eigene Mikrofon
      ON.played = st.seed;
      const g = D.KARAOKE.find(x => x.style === st.style);
      if (g && sing.g !== g.id) { sing.g = g.id; sing.song = 0; }
      sing.party = null; sing.daily = false; sing.len = ONLINE_SING;
      sing.ctx = { mode: 'online', r: st.round, seed: st.seed, style: st.style, panel: st.panel, title: '🌐 ' + st.def.icon + ' ' + st.def.name };
      backTo.sSing = 'sOnline'; go('sSing'); return;
    }
    const sty = D.STYLES[st.style] || D.STYLES.pop, ap = D.APPROACH.gefuehl, ac = D.ACTION.publikum;
    const parts = st.def.parts.map((t, i) => t === 'rhythm'
      ? { type: 'rhythm', len: st.def.len, bpm: sty.bpm, style: st.style, density: ap.density + st.round * 0.04, seed: st.seed + i * 101, shows: i === 0 ? ac.shows : 1, title: '„' + D.SONGS[st.style] + '“', sub: st.def.name }
      : { type: 'pitch', len: st.def.len, bpm: sty.bpm, style: st.style, seed: st.seed + i * 101, title: '🎤 Gesangsteil', sub: st.def.name });
    ON.played = st.seed;   // jede Runde hat einen neuen Seed, auch nach „Neue Show“
    runStage({ mode: 'online', r: st.round, style: st.style, panel: st.panel, parts, bg: st.def.final ? 'arena' : 'stage', ret: 'sOnline',
      title: '🌐 ' + st.def.icon + ' ' + st.def.name + ' · „' + D.SONGS[st.style] + '“' });
  }
  function onFinish(f, out) {
    flow = null;
    const oc = S.analyze({ rhythm: out.rhythm, pitch: out.pitch, show: out.show, rhythmShare: out.rhythmShare, approach: 'gefuehl', action: 'publikum' }, save.profile.attrs, null);
    ON.mine = { r: f.r, crit: oc.crit, perf: oc.perf };
    save.profile.xp += Math.round(oc.perf / 4); persist();
    onSend({ t: 'perf', r: f.r, perf: oc.perf, crit: oc.crit });
    go('sOnline');
  }

  // --- Anzeige ---
  RENDER.sOnline = () => onRender();
  function onRender() {
    // Runde ist weitergezogen (z. B. Pause bis nach der Frist): alten Auftritt beenden, zurück zur Show
    if (stage && flow && flow.mode === 'online' && ON.st && (ON.st.phase !== 'perform' || ON.st.seed !== ON.played)) {
      stopAll(); flow = null; closeOv(); toast('⏱️ Die Zeit für den Auftritt ist um – weiter geht\'s in der Show.', 3500); go('sOnline'); return;
    }
    if (cur === 'sSing' && sing.ctx && sing.ctx.mode === 'online' && (!ON.st || ON.st.phase !== 'perform' || ON.st.seed !== sing.ctx.seed)) {
      singEnd(); sing.ctx = null; toast('⏱️ Die Zeit für den Auftritt ist um – weiter geht\'s in der Show.', 3500); go('sOnline'); return;
    }
    if (cur !== 'sOnline') {
      // Auftritt automatisch starten, sobald die Runde beginnt (auch aus einer anderen Ansicht der Show heraus)
      return;
    }
    const st = ON.st, box = $('#onBox'), me = ON.me, p = save.profile;
    const head = `<header class="bar"><button class="btn sm" type="button" data-o="leave">← ${st ? 'Verlassen' : 'Zurück'}</button><h2>🌐 Online-Show</h2><span class="tag">${st && st.code ? 'Code ' + esc(st.code) : ''}</span></header>`;
    const ava = (pl, ex) => `<div class="onP ${pl.on === false ? 'off' : ''}">${AV.svg(pl.look || {}, ex || 'happy')}<b>${esc(pl.name)}${pl.id === me ? ' (du)' : ''}</b></div>`;
    if (!st) {
      box.innerHTML = head + `<div class="panel"><p><b>Live-Show mit Freunden:</b> Jede Person singt auf dem eigenen Handy, Tablet oder PC. Die Jury bewertet alle, ihr stimmt gegenseitig ab, wer weiterkommt. 2 bis 8 Personen.</p>
        <p class="muted">Mitspieler treten per Link, QR-Code oder 4-stelligem Code bei – von überall, auch übers Internet.</p>
        <button class="btn gold xl" type="button" data-o="host" style="width:100%">🎬 Show eröffnen</button>
        <div class="row2" style="margin-top:12px"><input id="onCode" class="codeIn" maxlength="4" autocomplete="off" placeholder="CODE" aria-label="Code der Show" value="${esc(ON.pend)}"><button class="btn violet" type="button" data-o="join">🙋 Beitreten</button></div></div>`;
      focusFirst(box); return;
    }
    if (st.phase === 'connecting') { box.innerHTML = head + '<div class="panel center"><p>📡 Verbinde …</p></div>'; return; }
    const pls = st.players || [], inField = (st.field || []).includes(me), def = st.def;
    let body = '';
    if (st.phase === 'lobby') {
      body = `<div class="panel center"><p>Code: <b class="bigCode">${esc(st.code)}</b></p><div id="onQR" class="qr"></div>
        <p class="hint">Mitspieler öffnen den Link oder scannen den QR-Code – von überall, auch übers Internet.</p>
        ${amHost() ? '<button class="btn sm" type="button" data-o="copy">🔗 Einladungslink kopieren</button>' : ''}</div>
        <div class="panel"><p><b>Dabei (${pls.filter(x => x.on).length}/8):</b></p><div class="onPlayers">${pls.map(x => ava(x)).join('')}</div></div>` +
        `<div class="panel"><p><b>Auftrittsart:</b> ${st.sing ? '🎙️ Echt vorsingen – alle singen einen Karaoke-Song ins eigene Mikrofon, die Jury bewertet die echte Stimme.' : '🎮 Spiel – Noten im Takt treffen, Musik für alle gleich.'}</p>
          ${amHost() ? `<div class="seg"><button class="btn" type="button" data-o="mgame" aria-pressed="${!st.sing}">🎮 Spiel</button><button class="btn" type="button" data-o="msing" aria-pressed="${!!st.sing}">🎙️ Echt vorsingen</button></div>` : ''}</div>` +
        (amHost() ? `<button class="btn gold xl" type="button" data-o="start" style="width:100%" ${pls.filter(x => x.on).length < 2 ? 'disabled' : ''}>🎤 Show starten</button><p class="hint">Ablauf: Casting → Recall → Live-Shows → Finale.${st.sing ? ' Jede Person braucht ein Mikrofon (am besten mit Kopfhörern).' : ' Musik: eigene Beats, für alle gleich.'}</p>`
          : '<p class="center muted">Warte, bis der Gastgeber die Show startet …</p>');
    } else if (st.phase === 'perform') {
      const jury = (st.panel || D.MAIN_JURY).map(jur).map(j => `<span class="pj">${jimg(j, 'js')}<small>${esc(j.name)}</small></span>`).join('');
      body = `<div class="panel"><p><b>${def.icon} ${esc(def.name)}</b> · ${st.sing ? '🎙️ Echt vorsingen, ' + ONLINE_SING + ' Sekunden · Stil: ' + esc(D.STYLES[st.style].name) : 'Musik: „' + esc(D.SONGS[st.style]) + '“ (' + esc(D.STYLES[st.style].name) + ', eigene Beats)'}</p><div class="panelRow"><span class="muted">⚖️ Jury:</span>${jury}</div></div>
        <div class="panel"><div class="onPlayers">${st.field.map(id => { const x = onPlayer(id) || { name: '?', look: {} }; const ok = st.done.includes(id); return `<div class="onP ${ok ? '' : 'wait'}">${AV.svg(x.look, ok ? 'happy' : 'neutral')}<b>${esc(x.name)}</b><small>${ok ? '✅ fertig' : '🎤 singt …'}</small></div>`; }).join('')}</div></div>
        <p class="center muted">${inField ? (ON.played === st.seed ? (st.sing && !st.done.includes(me) ? '' : 'Super! Warte auf die anderen …') : '') : 'Du bist diesmal Publikum – gleich darfst du abstimmen.'}</p>
        ${inField && st.sing && ON.played === st.seed && !st.done.includes(me) ? '<button class="btn gold xl" type="button" data-o="sing" style="width:100%">🎙️ Zum Vorsingen</button>' : ''}`;
    } else if (st.phase === 'vote') {
      const can = st.field.filter(id => id !== me), done = ON.voted === st.seed || st.voted.includes(me);
      body = `<div class="panel"><h3 style="margin-top:0">📱 Publikums-Voting</h3><p>Wer hat dich am meisten überzeugt? ${def.w.votes ? 'Die Stimmen zählen ' + Math.round(def.w.votes * 100) + ' % der Wertung.' : 'Im Casting zählt nur die Jury – eure Stimmen gibt es trotzdem als Applaus.'}</p>
        ${done ? '<p class="center"><b>Danke für deine Stimme!</b> Warte auf die anderen …</p>' : `<div class="onPlayers">${can.map(id => { const x = onPlayer(id) || { name: '?', look: {} }; return `<button type="button" class="onP btnP" data-vote="${esc(id)}">${AV.svg(x.look, 'happy')}<b>${esc(x.name)}</b><small>Stimme geben</small></button>`; }).join('')}</div>`}</div>
        <p class="center muted">Abgestimmt: ${st.voted.length} von ${pls.filter(x => x.on).length}</p>`;
    } else if (st.phase === 'result' || st.phase === 'final') {
      const r = st.res, mine = r.entries.find(e => e.id === me), wts = def.w;
      const rows = r.entries.map(e => `<tr class="${e.id === me ? 'me' : ''} ${r.advanced.includes(e.id) && !r.final ? '' : r.final ? '' : 'out'}"><td>${e.rank}</td><td>${esc(e.name)}${r.rescued.includes(e.id) ? ' ✨' : ''}</td><td>${e.missing ? '–' : nf(e.perf)}</td><td>${nf(e.juryAvg)} <small class="muted">(${e.yes}/3)</small></td><td>${e.votesN}</td><td><b>${nf(e.total)}</b></td></tr>`).join('');
      let banner = '';
      if (r.final) { const w = r.entries[0]; banner = `<div class="banner gold">👑 ${esc(w.name)} gewinnt die Online-Show!</div>`; }
      else if (mine) banner = r.advanced.includes(me) ? `<div class="banner win">✅ Du bist weiter${r.rescued.includes(me) ? ' – mit Ricos Ticket ✨' : ''}!</div>` : '<div class="banner lose">❌ Für dich ist hier Schluss – ab jetzt bist du Publikum und stimmst mit ab.</div>';
      const myJury = mine && !mine.missing && ON.mine && ON.mine.r === r.round ? juryHtml(mine.jury, ON.mine.crit, p.name, st.seed).replace(/class="jcard /g, 'class="jcard show ') : '';
      body = banner + (r.final ? `<div class="onPlayers podium">${r.entries.slice(0, 3).map((e, i) => `<div class="onP">${AV.svg((onPlayer(e.id) || {}).look || {}, 'happy')}<b>${['🥇', '🥈', '🥉'][i]} ${esc(e.name)}</b></div>`).join('')}</div>` : '') + myJury +
        `<div class="tableWrap"><table class="rank"><thead><tr><th>#</th><th>Name</th><th>Perf.</th><th>Jury</th><th>Stimmen</th><th>Gesamt</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="hint">Gesamt = Performance × ${wts.perf} + Jury × ${wts.jury} + Publikum × ${wts.votes} (meiste Stimmen = 100). ${def.id === 'casting' ? 'Casting: weiter mit 2 von 3 Ja, mindestens zwei kommen weiter (✨ Ricos Ticket).' : r.final ? '' : 'Die besten 60 % kommen weiter.'}</p>` +
        (amHost() ? (r.final ? '<button class="btn gold xl" type="button" data-o="again" style="width:100%">↻ Neue Show mit allen</button>' : '<button class="btn gold xl" type="button" data-o="next" style="width:100%">▶ Nächste Runde</button>') : '<p class="center muted">Der Gastgeber startet die nächste Runde …</p>');
    }
    box.innerHTML = head + body;
    if (st.phase === 'lobby' && st.code && ON.net) ON.net.loadQR().then(() => { const el = $('#onQR'); if (!el) return; const q = qrcode(0, 'M'); q.addData(ON.net.link()); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { /* Code reicht */ });
    if ((st.phase === 'result' || st.phase === 'final') && st.res && ON.shown !== st.res.round + ':' + st.phase) {
      ON.shown = st.res.round + ':' + st.phase; const r = st.res;
      if (r.final) { confetti(); sfx('fanfare', 0, '🎺 Siegerehrung'); } else sfx(r.advanced.includes(me) ? 'yes' : 'applause', 1.5, r.advanced.includes(me) ? '✅ Weiter' : '👏 Applaus');
    }
  }
  // Runde beginnt → eigenen Auftritt starten (einmal pro Runde)
  const onTick = () => { const st = ON.st; if (st && st.phase === 'perform' && st.field.includes(ON.me) && ON.played !== st.seed && !stage && cur === 'sOnline') onPerform(st); };
  setInterval(onTick, 400);
  $('#onBox').addEventListener('click', e => {
    const v = e.target.closest('[data-vote]');
    if (v && ON.st && ON.st.phase === 'vote') { ON.voted = ON.st.seed; onSend({ t: 'vote', r: ON.st.round, for: v.dataset.vote }); sfx('click'); onRender(); return; }
    const b = e.target.closest('[data-o]'); if (!b || b.disabled) return;
    const k = b.dataset.o;
    if (k === 'leave') { if (ON.st) confirmBox('Show verlassen?', amHost() ? 'Die Show endet dann für alle.' : 'Du verlässt die Show.', 'Verlassen', () => { onReset(); go('sMenu'); }); else go('sMenu'); }
    else if (k === 'host') onHost();
    else if (k === 'join') { const c = $('#onCode').value; ON.pend = c; onJoin(c); }
    else if (k === 'copy') { const u = ON.net && ON.net.link(); if (u && navigator.clipboard) navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')).catch(() => toast(u, 5000)); else toast(u || '', 5000); }
    else if (k === 'start') hostStart(0);
    else if (k === 'mgame' || k === 'msing') { ON.H.sing = k === 'msing'; hostSync(); }
    else if (k === 'sing' && ON.st && ON.st.phase === 'perform') { ON.played = -1; onPerform(ON.st); }
    else if (k === 'next') hostStart(ON.H.round + 1);
    else if (k === 'again') { const h = ON.H; h.phase = 'lobby'; h.res = null; h.field = []; h.round = 0; hostSync(); }
  });
  $('#onBox').addEventListener('keydown', e => { if (e.target.id === 'onCode' && e.key === 'Enter') { e.preventDefault(); $('[data-o="join"]').click(); } });
  function openOnline() { if (!save.profile) { openAvatar('online'); return; } sub('sOnline'); if (ON.pend && !ON.st && ON.pend.length === 4) onJoin(ON.pend); }
  // Einladungslink ?join=CODE
  (function () { const m = /[?&]join=([A-Za-z0-9]{4})/.exec(location.search); if (m) ON.pend = m[1].toUpperCase(); })();

  // ---------- Start ----------
  applySettings();
  window.SMYVApp = { state: () => ({ cur, save, stage: !!stage, flow: flow && flow.mode }), go, stageObj: () => stage };
})();

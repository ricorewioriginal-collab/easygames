// Ich bin das Licht – Ablauf, Menüs, Steuerung (Tastatur, Touch, Controller über ../gamepad.js), Buchsong über YouTube
(function () {
  'use strict';
  const D = window.IBDL, W = window.IBDLWorld;
  const $ = id => document.getElementById(id);
  const KEY = 'ibdl-save';
  const LS = { get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } } };
  let S = D.fixSave(LS.get());
  const save = () => LS.set(S);
  const embedded = (() => { try { return top !== self; } catch (e) { return true; } })();
  const touch = matchMedia('(pointer: coarse)').matches;

  // ------------------------------------------------------------ Bildschirme
  let screen = 'sLoad', back = null;
  function go(id) {
    document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); screen = id;
    const f = $(id).querySelector('.nav, .chip'); if (f && !touch) setTimeout(() => f.focus({ preventScroll: true }), 30);
  }
  function toast(t, ms = 2200) { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => e.hidden = true, ms); }
  function setLight(v) { story.light = D.clampLight(v); W.light(story.light); $('lightFill').style.width = story.light + '%'; $('lightTxt').textContent = 'Licht ' + story.light + ' %'; }

  // ------------------------------------------------------------ Klang (Effekte und Beat ohne YouTube)
  let AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function blip(f, d = 0.08, type = 'sine', v = 0.12, when = 0) {
    if (!S.opt.sfx && !when) return; const a = ac(); if (!a) return; const t = (when || a.currentTime), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function noise(when, d, v, hp) { const a = ac(), n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * d, a.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; n.buffer = b; const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = a.createGain(); g.gain.setValueAtTime(v, when); g.gain.exponentialRampToValueAtTime(0.0001, when + d); n.connect(f).connect(g).connect(a.destination); n.start(when); }
  // einfacher Disco-Beat im Takt (Fallback, wenn YouTube nicht geladen werden soll oder offline)
  const beat = { on: false, t0: 0, next: 0, step: 0 };
  const CH = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 311]];
  function beatStart() { const a = ac(); if (!a) return false; beat.on = true; beat.t0 = a.currentTime + 0.1; beat.next = beat.t0; beat.step = 0; return true; }
  function beatPump() {
    if (!beat.on) return; const a = AC, spb = 60 / S.opt.bpm / 2;
    while (beat.next < a.currentTime + 0.2) {
      const t = beat.next, s = beat.step;
      if (s % 2 === 0) { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.22); }
      if (s % 4 === 2) noise(t, 0.12, 0.18, 1500);
      noise(t, 0.04, 0.05, 7000);
      if (s % 8 === 0) { const ch = CH[Math.floor(s / 16) % 4]; ch.forEach(f => blip(f, 60 / S.opt.bpm * 3.6, 'triangle', 0.035, t)); blip(ch[0] / 2, 0.3, 'sawtooth', 0.05, t); }
      beat.step++; beat.next += spb;
    }
  }
  function beatStop() { beat.on = false; }

  // ------------------------------------------------------------ YouTube (offizielles Video, erst nach Zustimmung)
  const yt = { api: null, player: null, ready: false, state: -1, t0: 0, lastSync: 0, failed: false };
  function ytLoad() {
    if (yt.api) return yt.api;
    yt.api = new Promise((res, rej) => {
      if (window.YT && window.YT.Player) return res(window.YT);
      const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(window.YT); };
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => rej(new Error('YouTube nicht erreichbar')); document.head.appendChild(s);
      setTimeout(() => rej(new Error('YouTube antwortet nicht')), 12000);
    }).catch(e => { yt.api = null; throw e; });
    return yt.api;
  }
  function ytPlayer() {
    if (yt.player) return Promise.resolve(yt.player);
    return ytLoad().then(YT => new Promise((res, rej) => {
      $('ytBox').hidden = false;
      yt.player = new YT.Player('ytPlayer', {
        host: 'https://www.youtube-nocookie.com', videoId: D.SONG.id, width: 356, height: 200,
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, origin: location.origin },
        events: {
          onReady: () => { yt.ready = true; res(yt.player); },
          onStateChange: e => { yt.state = e.data; if (e.data === 1) yt.t0 = performance.now() / 1000 - yt.player.getCurrentTime(); if (e.data === 0 && run) finishShow(); },
          onError: () => { yt.failed = true; rej(new Error('Video nicht abspielbar')); }
        }
      });
      setTimeout(() => { if (!yt.ready) rej(new Error('Video lädt nicht')); }, 15000);
    }));
  }
  function ytTime() {
    const p = yt.player; if (!p || yt.state !== 1) return null;
    const now = performance.now() / 1000;
    if (now - yt.lastSync > 0.5) { yt.lastSync = now; const real = p.getCurrentTime(), est = now - yt.t0; const d = real - est; if (Math.abs(d) > 0.25) yt.t0 -= d; else yt.t0 -= d * 0.2; }
    return now - yt.t0;
  }

  // ------------------------------------------------------------ Geschichte
  const story = { i: 0, li: 0, light: D.LIGHT_START, phase: 'lines', reply: null, wig: true };
  const SPEAK = { '': '', leon: 'Leon', luma: 'Lady Luma' };
  async function chapter(i) {
    story.i = i; story.li = 0; story.phase = 'lines'; const c = D.CHAPTERS[i];
    $('chapLbl').textContent = 'Kapitel ' + c.n + ' · ' + c.title;
    $('choices').innerHTML = ''; $('line').textContent = '…'; $('who').hidden = true;
    go('sStory');
    const cast = c.cast.map(id => id === 'luma' && !story.wig ? 'luma' : id);
    await W.scene(c.set, cast, { wig: story.wig });
    if (c.end) W.pose('luma', 'yes', { once: true });
    showLine();
  }
  function showLine() {
    const c = D.CHAPTERS[story.i], L = c.lines[story.li], who = L[0];
    $('who').hidden = !who; $('who').textContent = who ? (D.PEOPLE[who] && D.PEOPLE[who].name) || SPEAK[who] : '';
    $('line').textContent = L[1]; $('line').classList.toggle('narr', !who);
    $('nextHint').hidden = false; $('choices').innerHTML = '';
    if (who && who !== 'leon') W.pose(who, 'yes', { once: true, speed: 0.6 });
  }
  function advance() {
    if (screen !== 'sStory') return;
    const c = D.CHAPTERS[story.i];
    if (story.phase === 'lines') {
      if (story.li < c.lines.length - 1) { story.li++; showLine(); blip(660, 0.04, 'sine', 0.05); return; }
      if (c.choices) { story.phase = 'choice'; renderChoices(c); return; }
      if (c.studio) { openStudio(true); return; }
      if (c.show) { openSong(true); return; }
      if (c.end) { endStory(); return; }
    } else if (story.phase === 'reply') nextChapter();
  }
  function renderChoices(c) {
    $('nextHint').hidden = true; const box = $('choices'); box.innerHTML = '';
    c.choices.forEach((ch, k) => { const b = document.createElement('button'); b.className = 'chip nav'; b.innerHTML = ch.t; b.onclick = e => { e.stopPropagation(); choose(k); }; box.appendChild(b); });
    if (!touch) box.firstChild.focus();
  }
  async function choose(k) {
    const c = D.CHAPTERS[story.i], ch = c.choices[k]; if (story.phase !== 'choice') return;
    story.phase = 'reply'; setLight(story.light + ch.light); blip(523, 0.12, 'triangle', 0.1); blip(784, 0.2, 'triangle', 0.08, ac() ? AC.currentTime + 0.1 : 0);
    if (ch.unwig) { story.wig = false; await W.setLook(S.look, false); W.pose('luma', 'yes', { once: true }); W.confetti(160); }
    $('choices').innerHTML = ''; $('who').hidden = true; $('line').textContent = ch.r; $('line').classList.add('narr'); $('nextHint').hidden = false;
    if (ch.light >= 10) { W.pose('leon', 'yes', { once: true }); W.pose('luma', 'yes', { once: true }); }
  }
  function nextChapter() { if (story.i < D.CHAPTERS.length - 1) chapter(story.i + 1); else endStory(); }
  function startStory(fresh) {
    if (fresh || !S.story.resume) { story.wig = true; setLight(D.LIGHT_START); chapter(0); }
    else { story.wig = S.story.resume.wig !== false; setLight(S.story.resume.light); chapter(S.story.resume.i); }
  }
  function endStory() {
    const e = D.ending(story.light);
    S.story.done++; S.story.bestLight = Math.max(S.story.bestLight, story.light); if (!S.story.endings.includes(e.id)) S.story.endings.push(e.id); delete S.story.resume; save();
    $('endTitle').innerHTML = e.title; $('endText').textContent = e.text; $('endLight').textContent = '✨ Licht am Ende: ' + story.light + ' %';
    W.confetti(300); go('sEnd'); menuInfo();
  }
  function storySave() { if (screen === 'sStory' || screen === 'sStudio' || screen === 'sShow') { S.story.resume = { i: story.i, light: story.light, wig: story.wig }; save(); } }

  // ------------------------------------------------------------ Garderobe
  const ROWS = [['wig', 'Perücke'], ['wigColor', 'Haarfarbe'], ['dress', 'Outfit'], ['dressColor', 'Farbe'], ['jewel', 'Schmuck']];
  let studioRow = 0, inStory = false, look = null;
  async function openStudio(fromStory) {
    inStory = fromStory; look = D.normLook(S.look); studioRow = 0;
    go('sStudio'); renderRows();
    await W.scene('mirror', ['luma'], { view: 'studioCam' }); W.turn('luma', 0);
    W.setLook(look);
  }
  function renderRows() {
    const box = $('rows'); box.innerHTML = '';
    ROWS.forEach(([k, name], r) => {
      const e = D.pick(k, look[k]), row = document.createElement('div'); row.className = 'row' + (r === studioRow ? ' sel' : '');
      const sw = e.c ? `<i class="sw" style="background:${e.c}"></i>` : '';
      row.innerHTML = `<button class="rowBtn nav" aria-label="${name} zurück">◀</button><div class="lbl"><small>${name}</small><b>${sw}${e.name}</b></div><button class="rowBtn nav" aria-label="${name} weiter">▶</button>`;
      const [a, b] = row.querySelectorAll('button'); a.onclick = () => change(r, -1); b.onclick = () => change(r, 1);
      box.appendChild(row);
    });
    $('lookName').textContent = D.lookName(look);
  }
  let lookT = 0;
  function change(r, dir) {
    studioRow = r; look = D.cycle(look, ROWS[r][0], dir); renderRows(); blip(880, 0.05, 'sine', 0.06);
    clearTimeout(lookT); lookT = setTimeout(() => W.setLook(look), 120);
  }
  function studioDone() {
    S.look = look; save(); W.setLook(look); blip(1046, 0.25, 'triangle', 0.1);
    if (inStory) { setLight(story.light + 10); story.phase = 'reply'; go('sStory'); W.scene('mirror', ['luma']).then(() => { W.pose('luma', 'yes', { once: true }); }); $('who').hidden = false; $('who').textContent = 'Lady Luma'; $('line').textContent = 'Lady Luma ist geboren. Ihr Name kommt von lumen, das Licht.'; $('line').classList.remove('narr'); $('choices').innerHTML = ''; }
    else { go('sMenu'); menuScene(); }
  }

  // ------------------------------------------------------------ Bühne / Rhythmus
  let run = null, songMode = 'beat', diff = S.opt.diff;
  function openSong(fromStory) {
    inStory = fromStory; go('sSong');
    const seg = $('diffSeg'); seg.innerHTML = '';
    Object.keys(D.DIFF).forEach(k => { const b = document.createElement('button'); b.className = 'nav' + (k === diff ? ' on' : ''); b.textContent = D.DIFF[k].name; b.onclick = () => { diff = k; S.opt.diff = k; save(); openSongSeg(); }; seg.appendChild(b); });
    $('consent').hidden = S.opt.yt; $('bYT').textContent = S.opt.yt ? '▶ Buchsong spielen (YouTube)' : '▶ Mit YouTube spielen';
  }
  function openSongSeg() { [...$('diffSeg').children].forEach((b, i) => b.classList.toggle('on', Object.keys(D.DIFF)[i] === diff)); }
  async function startShow(mode) {
    songMode = mode; ac();
    go('sShow'); $('ytBox').hidden = mode !== 'yt';
    await W.scene('stage', ['luma', 'samira', 'mert', 'mia'], { wig: story.wig || !inStory });
    W.showOn(true); W.pose('luma', 'idle');
    const fall = D.DIFF[diff].fall;
    let len = 96;
    if (mode === 'yt') {
      $('count').hidden = false; $('count').textContent = '♪';
      try {
        const p = await ytPlayer(); p.seekTo(0, true); p.playVideo();
        const d = p.getDuration && p.getDuration(); len = d > 20 ? d : D.SONG.fallbackLen;
      } catch (e) { toast('YouTube ist gerade nicht erreichbar – es läuft der Beat im Browser.', 3500); songMode = mode = 'beat'; $('ytBox').hidden = true; }
    }
    if (mode === 'beat') { len = 96; beatStart(); }
    $('count').hidden = true;
    run = { show: D.newShow({ diff, bpm: S.opt.bpm, len, offset: 0, seed: 11 }), fall, len, paused: false, pausedAt: 0, applause: 0, lastDur: len };
    $('hScore').textContent = '0'; $('hCombo').textContent = 'Combo 0'; updApplause();
  }
  function songNow() {
    if (!run) return 0;
    if (songMode === 'yt') {
      const t = ytTime(); if (t != null) { run.last = t; const d = yt.player.getDuration && yt.player.getDuration(); if (d > 20 && Math.abs(d - run.lastDur) > 1) { run.lastDur = d; } return t - S.opt.offset; }
      return (run.last || 0) - S.opt.offset;
    }
    return AC ? AC.currentTime - beat.t0 - S.opt.offset : 0;
  }
  function hit(lane) {
    if (!run || run.paused) return; const t = songNow(); const j = D.press(run.show, lane, t);
    const pad = document.querySelector('.pad.p' + lane); if (pad) { pad.classList.add('on'); setTimeout(() => pad.classList.remove('on'), 90); }
    W.padHit(lane, j);
    if (j) { judge(j); if (S.opt.sfx && songMode === 'beat') blip([523, 587, 659, 784][lane] * (j === 'perfect' ? 2 : 1), 0.06, 'triangle', 0.07); }
    flush();
  }
  const JT = { perfect: 'Perfekt!', good: 'Gut!', brave: 'Mutig!', miss: 'Weiter, Luma!' };
  function judge(j) { const e = $('judge'); e.textContent = JT[j]; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }
  function flush() {
    const s = run.show;
    for (const ev of s.ev) {
      if (ev.k === 'miss') { judge('miss'); }
      if (ev.k === 'hit' && s.combo && s.combo % 10 === 0) { W.confetti(40 + s.combo); W.pose('luma', s.combo % 20 ? 'dance' : 'yes', s.combo % 20 ? {} : { once: true }); }
    }
    s.ev.length = 0;
    $('hScore').textContent = s.score.toLocaleString('de-DE'); $('hCombo').textContent = 'Combo ' + s.combo + (D.mult(s.combo) > 1 ? ' · x' + D.mult(s.combo) : '');
    updApplause();
  }
  function updApplause() { const a = run ? Math.round(D.accuracy(run.show) * 100) : 0; $('showFill').style.width = a + '%'; $('showTxt').textContent = 'Applaus ' + a + ' %'; W.light(inStory ? Math.min(100, story.light + a / 5) : 40 + a * 0.6); }
  function finishShow() {
    if (!run) return; const s = run.show; D.tick(s, 1e9);
    const acc = D.accuracy(s), st = D.stars(acc), best = S.best[diff] < s.score;
    if (best) S.best[diff] = s.score; S.stars[diff] = Math.max(S.stars[diff], st); save();
    stopSong(); W.showOn(false); W.pose('luma', 'yes', { once: true }); W.confetti(250);
    $('resTitle').textContent = st >= 2 ? 'Standing Ovations!' : st === 1 ? 'Applaus!' : 'Mutig war es!';
    $('resStars').textContent = '★'.repeat(st) + '☆'.repeat(3 - st);
    const c = s.counts;
    $('resGrid').innerHTML = `<span>Punkte</span><b>${s.score.toLocaleString('de-DE')}${best ? ' 🏆' : ''}</b><span>Perfekt / Gut / Mutig</span><b>${c.perfect} / ${c.good} / ${c.brave}</b><span>Verpasst</span><b>${c.miss}</b><span>Beste Combo</span><b>${s.maxCombo}</b><span>Genauigkeit</span><b>${Math.round(acc * 100)} %</b>` + (inStory ? `<span>Licht für Leon</span><b>+${D.showLight(s)}</b>` : '');
    if (inStory) setLight(story.light + D.showLight(s));
    $('bResNext').textContent = inStory ? 'Weiter in der Geschichte' : 'Zum Menü';
    run = null; go('sResult'); menuInfo();
  }
  function stopSong() { beatStop(); if (yt.player && yt.ready) try { yt.player.pauseVideo(); } catch (e) { } }
  function pause(on) {
    if (!run) return; run.paused = on;
    if (on) { if (songMode === 'yt' && yt.player) yt.player.pauseVideo(); else if (AC) AC.suspend(); go('sPause'); }
    else { go('sShow'); if (songMode === 'yt' && yt.player) yt.player.playVideo(); else if (AC) AC.resume(); }
  }

  // ------------------------------------------------------------ Menü
  function menuInfo() {
    try { const r = JSON.parse(localStorage.getItem('ibdl-read') || 'null'); if (r && r.s) $('mRead').textContent = 'Weiterlesen'; } catch (e) { }
    const r = S.story.resume; $('mStory').textContent = r ? 'Weiter: Kapitel ' + D.CHAPTERS[r.i].n + ' · ' + D.CHAPTERS[r.i].title : S.story.done ? 'Nochmal erleben · bestes Licht ' + S.story.bestLight + ' %' : 'Leons Weg in 12 Kapiteln';
    const b = Math.max(S.best.leicht, S.best.normal, S.best.schwer); $('mShow').textContent = b ? 'Rekord ' + b.toLocaleString('de-DE') : 'Buchsong spielen';
    $('menuLight').textContent = '✨ Bestes Licht ' + S.story.bestLight + ' %';
  }
  function menuScene() { W.scene('stage', ['luma', 'samira', 'mert', 'mia'], { wig: true }).then(() => { W.pose('luma', 'dance'); W.light(55); }); }
  function openRec() {
    const E = { licht: 'Ich bin das Licht', glanz: 'Glamour in den Adern', funke: 'Ein erster Funke' };
    $('recGrid').innerHTML = Object.keys(D.DIFF).map(k => `<span>Bühne ${D.DIFF[k].name}</span><b>${S.best[k].toLocaleString('de-DE')} ${'★'.repeat(S.stars[k])}</b>`).join('')
      + `<span>Geschichte erlebt</span><b>${S.story.done}×</b><span>Bestes Licht</span><b>${S.story.bestLight} %</b>`
      + Object.keys(E).map(k => `<span>Ende „${E[k]}“</span><b>${S.story.endings.includes(k) ? '✓' : '–'}</b>`).join('');
    go('sRec');
  }
  function openOpts() {
    $('oYT').checked = S.opt.yt; $('oSfx').checked = S.opt.sfx; $('oBpm').value = S.opt.bpm; $('oOff').value = S.opt.offset; $('oQ').value = S.opt.quality;
    $('oBpmV').textContent = S.opt.bpm; $('oOffV').textContent = (S.opt.offset >= 0 ? '+' : '') + Math.round(S.opt.offset * 1000) + ' ms'; go('sOpts');
  }
  $('oYT').onchange = e => { S.opt.yt = e.target.checked; save(); };
  $('oSfx').onchange = e => { S.opt.sfx = e.target.checked; save(); };
  $('oBpm').oninput = e => { S.opt.bpm = +e.target.value; $('oBpmV').textContent = S.opt.bpm; save(); };
  $('oOff').oninput = e => { S.opt.offset = +e.target.value; $('oOffV').textContent = (S.opt.offset >= 0 ? '+' : '') + Math.round(S.opt.offset * 1000) + ' ms'; save(); };
  $('oQ').onchange = e => { S.opt.quality = e.target.value; save(); toast('Gilt nach dem nächsten Start.'); };


  // ------------------------------------------------------------ Buch lesen (kompletter Roman aus book.json)
  const RK = 'ibdl-read';
  let book = null, rs = (() => { try { return JSON.parse(localStorage.getItem(RK) || 'null') || { s: 1, y: 0, f: 19 }; } catch (e) { return { s: 1, y: 0, f: 19 }; } })();
  const rSave = () => { try { localStorage.setItem(RK, JSON.stringify(rs)); } catch (e) { } };
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  async function openRead() {
    go('sRead'); $('page').style.setProperty('--rf', rs.f + 'px');
    if (!book) { $('page').innerHTML = '<p class="first">Das Buch wird geladen …</p>'; try { book = await (await fetch('book.json')).json(); } catch (e) { $('page').innerHTML = '<p class="first">Das Buch konnte nicht geladen werden. Bitte später nochmal versuchen.</p>'; return; } }
    renderToc(); readSec(rs.s, rs.y);
  }
  function renderToc() {
    $('toc').innerHTML = book.sections.map((x, i) => `<button class="nav${i === rs.s ? ' on' : ''}" data-i="${i}"><small>${esc(x.label)}</small>${esc(x.title)}</button>`).join('');
    $('toc').querySelectorAll('button').forEach(b => b.onclick = () => { $('toc').hidden = true; readSec(+b.dataset.i, 0); });
  }
  function readSec(i, y) {
    const n = book.sections.length; i = Math.max(0, Math.min(n - 1, i)); rs.s = i; const x = book.sections[i];
    let first = true;
    $('page').innerHTML = `<p class="lab">${esc(x.label)}</p><h2>${esc(x.title)}</h2>` + x.p.map(t => { if (t === '∗ ∗ ∗') return '<p class="sep">∗ ∗ ∗</p>'; const c = first ? ' class="first"' : ''; first = false; return `<p${c}>${esc(t)}</p>`; }).join('')
      + `<div class="endCh">${i < n - 1 ? '<button class="press nav" id="bNextIn">Weiter: ' + esc(book.sections[i + 1].title) + '</button>' : '— Ende —'}</div>`;
    const nb = $('bNextIn'); if (nb) nb.onclick = () => readSec(i + 1, 0);
    $('rLbl').textContent = x.label + ' · ' + x.title; $('rProg').textContent = (i + 1) + ' / ' + n;
    $('bPrevCh').disabled = i === 0; $('bNextCh').disabled = i === n - 1;
    requestAnimationFrame(() => { $('page').scrollTop = y || 0; if (!touch) $('page').focus({ preventScroll: true }); });
    rSave(); renderToc(); $('mRead').textContent = 'Weiterlesen: ' + x.title;
  }
  $('page').addEventListener('scroll', () => { rs.y = $('page').scrollTop; clearTimeout(rSave.t); rSave.t = setTimeout(rSave, 300); }, { passive: true });
  $('bToc').onclick = () => { $('toc').hidden = !$('toc').hidden; if (!$('toc').hidden) { const b = $('toc').querySelector('.on'); if (b) b.focus(); } };
  $('bReadBack').onclick = () => { $('toc').hidden = true; go('sMenu'); menuInfo(); };
  $('bPrevCh').onclick = () => readSec(rs.s - 1, 0);
  $('bNextCh').onclick = () => readSec(rs.s + 1, 0);
  $('bFontP').onclick = () => { rs.f = Math.min(30, rs.f + 2); $('page').style.setProperty('--rf', rs.f + 'px'); rSave(); };
  $('bFontM').onclick = () => { rs.f = Math.max(14, rs.f - 2); $('page').style.setProperty('--rf', rs.f + 'px'); rSave(); };

  // ------------------------------------------------------------ Knöpfe
  document.querySelectorAll('.tile').forEach(t => t.onclick = () => {
    const g = t.dataset.go; ac();
    if (g === 'story') startStory(false); else if (g === 'show') openSong(false); else if (g === 'studio') openStudio(false);
    else if (g === 'read') openRead(); else if (g === 'rec') openRec(); else if (g === 'opts') openOpts(); else if (g === 'help') go('sHelp');
  });
  document.querySelectorAll('.back2').forEach(b => b.onclick = () => go('sMenu'));
  $('bPress').onclick = () => { ac(); go('sMenu'); menuInfo(); };
  $('talk').onclick = () => advance();
  $('bStoryMenu').onclick = e => { e.stopPropagation(); storySave(); go('sMenu'); menuInfo(); menuScene(); };
  $('bStudioBack').onclick = () => { if (inStory) studioDone(); else { go('sMenu'); menuScene(); } };
  $('bStudioDone').onclick = () => studioDone();
  $('bYT').onclick = () => { S.opt.yt = true; save(); startShow('yt'); };
  $('bBeat').onclick = () => startShow('beat');
  $('bSongBack').onclick = () => { if (inStory) { go('sStory'); } else go('sMenu'); };
  $('bPause').onclick = () => pause(true);
  $('bResume').onclick = () => pause(false);
  $('bRestart').onclick = () => { stopSong(); run = null; go('sShow'); startShow(songMode); };
  $('bQuit').onclick = () => { stopSong(); run = null; W.showOn(false); if (inStory) storySave(); go('sMenu'); menuInfo(); menuScene(); };
  $('bResNext').onclick = () => { if (inStory) { story.phase = 'reply'; nextChapter(); } else { go('sMenu'); menuScene(); } };
  $('bResAgain').onclick = () => startShow(songMode);
  $('bEndMenu').onclick = () => { go('sMenu'); menuScene(); };
  $('bEndAgain').onclick = () => startStory(true);
  document.querySelectorAll('.pad').forEach(p => p.addEventListener('pointerdown', e => { e.preventDefault(); hit(+p.dataset.l); }));
  if (embedded) document.querySelectorAll('.back').forEach(a => a.hidden = true);

  // ------------------------------------------------------------ Tastatur (Controller kommt über gamepad.js als Tasten)
  const LANE = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
  addEventListener('keydown', e => {
    if (e.repeat) return; const k = e.code;
    if (screen === 'sShow' && run) {
      if (k in LANE) { e.preventDefault(); hit(LANE[k]); return; }
      if (k === 'Escape' || k === 'KeyP') { e.preventDefault(); pause(true); return; }
      return;
    }
    if (screen === 'sPause' && (k === 'Escape' || k === 'KeyP')) { e.preventDefault(); pause(false); return; }
    if (screen === 'sTitle' && (k === 'Enter' || k === 'Space')) { e.preventDefault(); $('bPress').click(); return; }
    if (screen === 'sStory') {
      if (story.phase === 'choice' && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); const bs = [...$('choices').children], i = bs.indexOf(document.activeElement); (bs[(i + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length] || bs[0]).focus(); return; }
      if (story.phase !== 'choice' && (k === 'Enter' || k === 'Space')) { e.preventDefault(); advance(); return; }
      if (k === 'Escape') { e.preventDefault(); $('bStoryMenu').click(); return; }
    }
    if (screen === 'sStudio') {
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); studioRow = (studioRow + (k === 'ArrowDown' ? 1 : -1) + ROWS.length) % ROWS.length; renderRows(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); change(studioRow, k === 'ArrowRight' ? 1 : -1); return; }
      if (k === 'Enter') { e.preventDefault(); studioDone(); return; }
      if (k === 'Escape') { e.preventDefault(); $('bStudioBack').click(); return; }
    }
    if (screen === 'sRead') {
      const pg = $('page'), tocOpen = !$('toc').hidden;
      if (!tocOpen && (k === 'ArrowDown' || k === 'ArrowUp')) { e.preventDefault(); pg.scrollBy({ top: (k === 'ArrowDown' ? 1 : -1) * pg.clientHeight * 0.4, behavior: 'smooth' }); return; }
      if (!tocOpen && (k === 'Space' || k === 'PageDown')) { e.preventDefault(); pg.scrollBy({ top: pg.clientHeight * 0.85, behavior: 'smooth' }); return; }
      if (!tocOpen && (k === 'ArrowRight' || k === 'ArrowLeft')) { e.preventDefault(); readSec(rs.s + (k === 'ArrowRight' ? 1 : -1), 0); return; }
      if (tocOpen && (k === 'ArrowDown' || k === 'ArrowUp')) { e.preventDefault(); const bs = [...$('toc').children], i = bs.indexOf(document.activeElement); (bs[(i + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length] || bs[0]).focus(); return; }
      if (k === 'Escape') { e.preventDefault(); if (tocOpen) $('toc').hidden = true; else $('bReadBack').click(); return; }
      if (k === 'KeyM' || k === 'KeyE' || k === 'KeyQ') { e.preventDefault(); $('bToc').click(); return; }
    }
    if (k === 'Escape' && ['sRec', 'sOpts', 'sHelp', 'sSong'].includes(screen)) { e.preventDefault(); screen === 'sSong' ? $('bSongBack').click() : go('sMenu'); }
  });
  $('menuKeys').textContent = touch ? 'Tippen zum Auswählen' : 'Pfeiltasten & Enter · Controller: Steuerkreuz & A';
  addEventListener('visibilitychange', () => { if (document.hidden && run && !run.paused) pause(true); if (document.hidden) storySave(); });
  addEventListener('pagehide', storySave);

  // ------------------------------------------------------------ Schleife
  function loop() {
    requestAnimationFrame(loop);
    if (run && !run.paused) {
      beatPump(); const t = songNow(); D.tick(run.show, t); if (run.show.ev.length) flush();
      W.showDraw(run.show.notes, t, run.fall);
      if (songMode === 'beat' && t > run.len + 1) finishShow();
      if (songMode === 'yt' && run && t > run.lastDur + 2) finishShow();
    }
    W.frame();
  }

  // ------------------------------------------------------------ Start
  (async function boot() {
    const tips = ['Die Glühbirnen am Spiegel gehen an …', 'Velvet bindet ihre Schnürsenkel …', 'Mert schiebt die Tür auf …', 'Samira dreht an ihrem Ohrring …'];
    let ti = 0; const tipT = setInterval(() => { $('loadTip').textContent = tips[++ti % tips.length]; }, 1600);
    const bar = $('loadBar'); bar.style.width = '15%';
    try {
      W.look = S.look;
      await W.init($('cv'), { quality: S.opt.quality }); bar.style.width = '55%';
      loop();
      await W.preload(['luma', 'samira', 'mert', 'mia']); bar.style.width = '85%';
      await W.scene('stage', ['luma', 'samira', 'mert', 'mia'], { wig: true }); W.pose('luma', 'dance'); W.light(55);
      bar.style.width = '100%';
      W.preload(['leon', 'vater', 'mutter', 'velvet', 'julian', 'tobi', 'nadine']).catch(() => { });
    } catch (e) {
      console.error(e); $('loadTip').textContent = '3D konnte nicht starten: ' + (e && e.message || e); clearInterval(tipT); return;
    }
    clearInterval(tipT); go('sTitle'); $('pressTxt').textContent = touch ? 'Tippen zum Starten' : 'Drücke Start';
    menuInfo();
    if (window.EasyGamesKit && EasyGamesKit.keepAwake) try { EasyGamesKit.keepAwake(); } catch (e) { }
  })();
  window.IBDLApp = { go, chapter, startShow, story, get run() { return run; }, hit, finishShow, startStory, openStudio };
})();

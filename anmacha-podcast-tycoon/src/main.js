/* AnMaCha – Der Podcast (Offizielles Spiel) – Start, Ladebildschirm, Hauptmenü, Spielmodi und Spielschleife. */
(function (root) {
  'use strict';
  const AMC = root.AMC;
  const U = AMC.U, D = AMC.Data, I = AMC.Input, UI = AMC.UI, W = AMC.World, Save = AMC.Save;
  const G = AMC.Game = { mode: 'boot', host: Save.data.host || 'andrew', paused: false };

  // ------------------------------------------------------------------ Laden
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); }); }
  function progress(f, label) { U.$('loadBar').style.width = Math.round(f * 100) + '%'; if (label) U.$('loadTxt').textContent = label + ' …'; }
  let tipI = Math.floor(Math.random() * D.TIPS.length);
  const tipTimer = setInterval(() => { const e = U.$('loadTip'); if (e) e.textContent = '💡 ' + D.TIPS[tipI++ % D.TIPS.length]; }, 2600);
  U.$('loadTip').textContent = '💡 ' + D.TIPS[tipI++ % D.TIPS.length];

  async function boot() {
    try {
      progress(0.02, '3D-Grafik');
      await loadScript('../vendor/three-r128.min.js');
      await Promise.all(['../vendor/three-r128-gltfloader.js', '../figuren/figuren.js'].map(loadScript));
      progress(0.08, '3D-Modelle');
      const cv = U.$('view'); I.bindCanvas(cv);
      await W.init(cv, (f, l) => progress(0.08 + f * 0.82, l));
      progress(0.93, 'Studio');
      ['andrew', 'marco'].forEach(id => { if (W.hosts[id]) UI.faces[id] = W.portrait(W.hosts[id]); });
      AMC.Studio.build();
      UI.buildTouch(); UI.initNowPlaying();
      AMC.Media.refresh();
      progress(1, 'Fertig');
      clearInterval(tipTimer);
      setTimeout(() => { U.$('loading').classList.add('done'); setTimeout(() => U.$('loading').remove(), 700); }, 250);
      toMenuScene(); title();
      requestAnimationFrame(frame);
    } catch (e) {
      console.error(e);
      U.$('loadTxt').innerHTML = '⚠️ Das Spiel konnte nicht starten (' + U.esc(e.message || e) + ').<br>Bitte Seite neu laden.';
    }
  }

  // ------------------------------------------------------------------ Szenen
  function toMenuScene() {
    stopAll(); G.mode = 'menu'; AMC.Studio.enter('menu'); AMC.Audio.music('menu'); UI.showTouch(false);
  }
  function stopAll() {
    if (AMC.Play.active) AMC.Play.stop();
    if (AMC.Show.active) AMC.Show.stop();
    if (AMC.Quiz.active) AMC.Quiz.stop();
    UI.closeAll(); G.paused = false;
  }

  // ------------------------------------------------------------------ Titel & Hauptmenü
  function title() {
    const s = UI.open('<div class="title"><div class="t-logo"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#111218" stroke="#ff8a1e" stroke-width="6"/><path d="M47 35 L88 60 L47 85Z" fill="#ff8a1e"/></svg>' +
      '<h1>AnMa<span>Cha</span></h1><h2>Der Podcast</h2><p class="t-off">Offizielles Spiel</p></div>' +
      '<p class="t-slogan">„' + D.SLOGAN + '“</p><button type="button" class="btn primary t-start" data-nav data-first id="tStart">' + startLabel() + '</button><p class="t-foot">mit Andrew &amp; Marco · Wir ♥ Medien</p></div>', { cls: 'title-screen', back: () => {} });
    let go = false; const start = () => { if (go) return; go = true; AMC.Audio.init(); AMC.Audio.sfx('jingle'); UI.close(s); mainMenu(); };
    s.el.querySelector('#tStart').onclick = start;
    s.el.addEventListener('pointerup', e => { if (e.pointerType === 'touch') start(); });
    AMC.onDevice = () => { const b = U.$('tStart'); if (b) b.innerHTML = startLabel(); };
  }
  const startLabel = () => I.device === 'pad' ? AMC.glyph('a') + ' Drücken zum Starten' : I.device === 'touch' ? 'Antippen zum Starten' : 'Enter / Klick zum Starten';

  function mainMenu() {
    const st = Save.data.story, chDone = st.done, stars = Object.values(st.stars).reduce((a, b) => a + b, 0);
    const s = UI.open(
      '<div class="menu-l"><div class="m-logo"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#111218" stroke="#ff8a1e" stroke-width="6"/><path d="M47 35 L88 60 L47 85Z" fill="#ff8a1e"/></svg><div><h1>AnMa<span>Cha</span> – Der Podcast</h1><p>Offizielles Spiel</p></div></div>' +
      '<nav class="m-list">' +
      mi('story', '▶', 'Story: Die Staffel', chDone >= D.CHAPTERS.length ? 'Alle 8 Kapitel geschafft · ⭐ ' + stars + '/24' : 'Kapitel ' + (chDone + 1) + ' von 8 · ⭐ ' + stars, true) +
      mi('live', '🎙️', 'Live-Show', 'Endlos-Aufnahme · Rekord ' + U.fmt(Save.data.best.live) + ' Hörer') +
      mi('jagd', '🏃', 'Themenjagd', '3 Minuten durch die Stadt · Rekord ' + U.fmt(Save.data.best.jagd)) +
      mi('quiz', '🧠', 'KI-Quizshow', '1 Spieler oder 2 Spieler: Andrew gegen Marco') +
      mi('free', '🏙️', 'Stadt erkunden', 'Frei spielen, Radio hören, Störsender jagen') +
      mi('radio', '📻', 'Radio & Podcast', 'Alle Folgen und die 13 AnMaCha-Sender') +
      '</nav><div class="m-row">' + mi('settings', '⚙️', 'Einstellungen') + mi('controls', '🎮', 'Steuerung') + mi('credits', 'ℹ️', 'Mitwirkende') + '</div></div>' +
      '<div class="menu-r"><button type="button" class="host-pick glass" data-nav id="mHost"></button><div class="m-hint" id="mHint"></div></div>',
      { cls: 'main-menu', back: () => {} });
    const el = s.el;
    function updHost() {
      const H = D.HOSTS[G.host];
      el.querySelector('#mHost').innerHTML = '<img src="' + UI.face(G.host) + '" alt=""><span><small>Du spielst</small><b>' + H.name + '</b><em>' + H.perk + '</em></span><span class="hp-sw">' + AMC.glyph('y') + ' wechseln</span>';
      el.querySelector('#mHint').innerHTML = AMC.glyph('dpad') + ' Auswählen · ' + AMC.glyph('ok') + ' Start · ' + AMC.glyph('select') + ' Radio · ' + AMC.glyph('lb') + ' Sender';
      ['andrew', 'marco'].forEach(id => { const f = W.hosts[id]; if (f) f.play(id === G.host ? 'yes' : 'idle', { fade: 0.3 }); });
    }
    const swapHost = () => { G.host = G.host === 'andrew' ? 'marco' : 'andrew'; Save.data.host = G.host; Save.save(); AMC.Audio.sfx('swap'); updHost(); };
    el.querySelector('#mHost').onclick = swapHost;
    s.o.onKey = () => { if (I.hit('swap')) { swapHost(); return true; } return false; };
    updHost();
    const go = { story: storyMenu, live: startLive, jagd: () => startCity('jagd'), quiz: quizMenu, free: () => startCity('free'), radio: () => UI.radio(), settings, controls, credits };
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go[b.dataset.go]());
    G.menu = s;
  }
  const mi = (go, icon, label, sub, first) => '<button type="button" class="m-item" data-nav data-go="' + go + '"' + (first ? ' data-first' : '') + '><span class="mi-ic">' + icon + '</span><span class="mi-t"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';

  // ------------------------------------------------------------------ Story
  function storyMenu() {
    const st = Save.data.story;
    const s = UI.open('<div class="panel glass wide"><header><h2>▶ Die Staffel</h2><button class="btn small" data-nav id="sBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="lead">Von der ersten Folge im Sommer 2020 bis LIVE auf dem Podfluencer Festival: Erlebt die Geschichte von AnMaCha – Der Podcast.</p><div class="ch-grid">' +
      D.CHAPTERS.map((c, i) => {
        const open = i <= st.done, stars = st.stars[c.id] || 0;
        return '<button type="button" class="ch-card' + (open ? '' : ' locked') + '" data-nav data-ch="' + i + '"' + (i === Math.min(st.done, 7) ? ' data-first' : '') + (open ? '' : ' disabled') + ' style="--i:' + i + '">' +
          '<span class="ch-n">' + (i + 1) + '</span><span class="ch-t"><small>' + c.when + ' · Folge ' + (c.ep < 10 ? '#0' : '#') + c.ep + '</small><b>' + c.title + '</b><em>' + objName(c) + '</em></span>' +
          '<span class="ch-s">' + (open ? '★★★'.split('').map((x, k) => '<i class="' + (k < stars ? 'on' : '') + '">★</i>').join('') : '🔒') + '</span></button>';
      }).join('') + '</div></div>', { back: () => UI.close(s) });
    s.el.querySelector('#sBack').onclick = () => UI.close(s);
    s.el.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { if (!b.disabled) { UI.closeAll(); playChapter(+b.dataset.ch); } });
  }
  const objName = c => ({ collect: '✨ Themen-Funken sammeln', guest: '⭐ Gäste ins Studio bringen', antenna: '📡 Sendemast reparieren', train: '🚉 Haltestellen-Rennen', party: '📼 Mixtapes finden', boss: '👾 Bosskampf: Das Funkloch' })[c.obj.type] + ' · 🎙️ Live-Aufnahme';

  function playChapter(i) {
    const ch = D.CHAPTERS[i];
    G.chapter = i;
    UI.dialog(ch.intro, () => startCity('story', ch));
  }

  function startCity(mode, ch) {
    stopAll(); G.mode = 'play';
    AMC.Studio.leave();
    AMC.Play.onEnd = res => cityEnd(mode, ch, res);
    AMC.Play.start({ mode, chapter: ch, host: G.host });
    UI.showTouch(true);
    AMC.Play.msg(mode === 'jagd' ? '🏃 Themenjagd! 3 Minuten – sammle alles!' : mode === 'free' ? '🏙️ Willkommen im Funkhaus-Viertel!' : '🎙️ ' + ch.title + ' – los geht\'s!', 2.6);
    if (!Save.data.seenIntro) { Save.data.seenIntro = true; Save.save(); setTimeout(() => UI.toast(I.device === 'touch' ? 'Links bewegen, rechts wischen = Kamera. ⤴ Springen, 📣 Welle, 💨 Ausweichen, ⇄ Wechsel' : I.device === 'pad' ? 'Linker Stick laufen, rechter Stick Kamera, A springen, X Welle, RT ausweichen, Y Andrew/Marco' : 'WASD laufen, Maus ziehen = Kamera, Leertaste springen, E Welle, C ausweichen, Q wechseln, Umschalt sprinten', 7000), 800); }
  }
  function cityEnd(mode, ch, res) {
    UI.showTouch(false);
    if (mode === 'free') return setTimeout(() => { toMenuScene(); mainMenu(); }, 300);
    if (mode === 'jagd') {
      const best = Save.data.best.jagd, rec = res.score > best; if (rec) { Save.data.best.jagd = res.score; Save.save(); }
      return setTimeout(() => results({ title: '🏃 Themenjagd vorbei!', stars: res.score > 9000 ? 3 : res.score > 6000 ? 2 : res.score > 3000 ? 1 : 0, lines: [['Punkte', U.fmt(res.score) + (rec ? ' 🏆 Neuer Rekord!' : '')], ['Themen-Funken', sumGot(res.got)], ['Störsender abgeschaltet', res.kills], ['Goldene Erinnerungen', res.gold]], again: () => startCity('jagd') }), 400);
    }
    if (!res.ok) return setTimeout(() => results({ title: '⏱ Sendeschluss!', fail: true, stars: 0, lines: [['Die Zeit ist abgelaufen.', ''], ['Tipp', U.pick(D.TIPS)]], again: () => playChapterDirect(G.chapter) }), 400);
    // Ab ins Studio
    transition('🎙️ Ab ins Studio!', () => startShow('story', ch, res));
  }
  function playChapterDirect(i) { startCity('story', D.CHAPTERS[i]); }
  G.playChapter = i => { UI.closeAll(); G.chapter = i; playChapterDirect(i); };
  const sumGot = got => D.RUBRIC_IDS.reduce((a, r) => a + (got[r] || 0), 0);

  function cardsFrom(res, ch) {
    const cards = [];
    D.RUBRIC_IDS.forEach(r => { const c = res.got[r] || 0, n = Math.min(3, Math.ceil(c / 2)); for (let k = 0; k < n; k++) cards.push({ rub: r, power: 1 + Math.min(1.6, c * 0.16), label: D.RUBRICS[r].name }); });
    for (let k = 0; k < Math.min(3, res.gold); k++) cards.push({ rub: U.pick(D.RUBRIC_IDS), power: 2.6, label: '🌟 Goldene Erinnerung' });
    if (ch && ch.obj.type === 'guest') for (let k = 0; k < 3; k++) cards.push({ rub: 'feel', power: 2.2, label: '⭐ Gast-Geschichte' });
    if (ch && ch.obj.type === 'party') cards.push({ rub: 'musik', power: 2.5, label: '📼 Mixtape 96' }, { rub: 'musik', power: 2.5, label: '📼 Mixtape 96' });
    if (ch && ch.obj.type === 'boss') cards.push({ rub: 'feel', power: 3, label: '🎪 Festival-Moment' }, { rub: 'tech', power: 2.6, label: '📡 Funkloch besiegt' });
    if (ch && ch.obj.type === 'antenna') cards.push({ rub: 'tech', power: 2.4, label: '📡 Sendemast-Story' });
    if (ch && ch.obj.type === 'train') cards.push({ rub: 'serious', power: 2.4, label: '🚉 Bahn-Erlebnis' });
    cards.push({ rub: 'life', power: 0.9, label: 'Wenig Interessantes aus unserem Leben' });
    return cards;
  }
  function startShow(mode, ch, res) {
    stopAll(); G.mode = 'show';
    const cards = mode === 'story' ? cardsFrom(res, ch) : [];
    AMC.Show.start({
      mode: mode === 'story' ? 'story' : 'arcade', rounds: ch ? ch.show.rounds : 99, goal: ch ? ch.show.goal : [300, 600, 900], cards, host: (res && res.host) || G.host,
      onEnd: r => showEnd(mode, ch, res, r)
    });
  }
  function showEnd(mode, ch, cityRes, r) {
    if (mode === 'arcade') {
      const rec = r.listeners > Save.data.best.live; if (rec) { Save.data.best.live = r.listeners; Save.save(); }
      return results({ title: '🎙️ Live-Show beendet', stars: r.listeners > 20000 ? 3 : r.listeners > 10000 ? 2 : r.listeners > 4000 ? 1 : 0, lines: [['Hörer', U.fmt(r.listeners) + (rec ? ' 🏆 Neuer Rekord!' : '')], ['Runden', r.rounds]], again: startLive });
    }
    const idx = D.CHAPTERS.indexOf(ch), st = Save.data.story;
    if (r.stars < 1) return results({ title: '📉 Zu wenig Hörer …', fail: true, stars: 0, lines: [['Hörer', U.fmt(r.listeners)], ['Ziel für ⭐', U.fmt(ch.show.goal[0] * 10)], ['Tipp', 'Nutze passende Karten und wechsle die Sprecher für Kombo-Bonus.']], again: () => startShow('story', ch, cityRes), againLabel: 'Aufnahme wiederholen' });
    st.stars[ch.id] = Math.max(st.stars[ch.id] || 0, r.stars); st.best[ch.id] = Math.max(st.best[ch.id] || 0, r.listeners);
    const first = st.done === idx; if (st.done <= idx) st.done = idx + 1; Save.save();
    toMenuScene();
    UI.dialog(ch.outro, () => {
      const epIdx = AMC.Media.episodes.findIndex(e => e.nr === (ch.ep < 10 ? '#0' : '#') + ch.ep);
      results({
        title: '✅ Kapitel ' + (idx + 1) + ' geschafft!', stars: r.stars,
        lines: [['Hörer', U.fmt(r.listeners)], ['Themen-Funken', sumGot(cityRes.got)], ['Störsender', cityRes.kills], ['Hörer gesprochen', cityRes.talks]].concat(first && idx === D.CHAPTERS.length - 1 ? [['🏆', 'Staffel abgeschlossen! Danke fürs Spielen.']] : []),
        next: idx < D.CHAPTERS.length - 1 ? () => playChapter(idx + 1) : null,
        again: () => playChapter(idx),
        episode: epIdx >= 0 ? epIdx : null
      });
    });
  }
  function transition(text, cb) {
    const t = U.el('div', 'transition', '<b>' + text + '</b>'); document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { cb(); t.classList.add('out'); setTimeout(() => t.remove(), 600); }, 900);
  }

  // ------------------------------------------------------------------ Ergebnis
  function results(o) {
    if (G.mode !== 'menu') toMenuScene();
    const s = UI.open('<div class="panel glass res' + (o.fail ? ' fail' : '') + '"><h2>' + o.title + '</h2>' +
      (o.fail ? '' : '<div class="stars">' + [0, 1, 2].map(k => '<i class="' + (k < o.stars ? 'on' : '') + '" style="--d:' + k * 0.25 + 's">★</i>').join('') + '</div>') +
      '<dl>' + o.lines.map(([a, b]) => '<dt>' + a + '</dt><dd>' + b + '</dd>').join('') + '</dl><div class="row wrap">' +
      (o.next ? '<button class="btn primary" data-nav data-first id="rNextCh">▶ Nächstes Kapitel</button>' : '') +
      (o.episode != null ? '<button class="btn" data-nav id="rEp">🎧 Echte Folge anhören</button>' : '') +
      (o.again ? '<button class="btn' + (o.next ? '' : ' primary') + '" data-nav' + (o.next ? '' : ' data-first') + ' id="rAgain">↻ ' + (o.againLabel || 'Nochmal') + '</button>' : '') +
      '<button class="btn" data-nav id="rMenu">🏠 Hauptmenü</button></div></div>', { back: () => { UI.close(s); mainMenu(); } });
    if (!o.fail) { AMC.Audio.sfx(o.stars ? 'win' : 'lose'); for (let k = 0; k < o.stars; k++) setTimeout(() => AMC.Audio.sfx('star'), 400 + k * 250); }
    else AMC.Audio.sfx('lose');
    const b = id => s.el.querySelector('#' + id);
    if (b('rNextCh')) b('rNextCh').onclick = () => { UI.close(s); o.next(); };
    if (b('rAgain')) b('rAgain').onclick = () => { UI.close(s); o.again(); };
    if (b('rEp')) b('rEp').onclick = () => { AMC.Media.playEpisode(o.episode); UI.radio(); };
    b('rMenu').onclick = () => { UI.close(s); mainMenu(); };
  }

  // ------------------------------------------------------------------ Weitere Modi
  function startLive() { UI.closeAll(); transition('🎙️ Live-Show', () => startShow('arcade', null, null)); }
  function quizMenu() {
    const pads = I.padCount();
    const s = UI.open('<div class="panel glass"><header><h2>🧠 Die verrückte KI-Quizshow</h2><button class="btn small" data-nav id="qBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="lead">Nach AnMaCha Spezial #2: Zehn Fragen zu Radio, Podcast, TV, Musik und Technik. Wer schneller richtig liegt, bekommt mehr Punkte.</p>' +
      '<div class="row wrap"><button class="btn primary big" data-nav data-first id="q1">👤 1 Spieler<small>gegen den KI-Kollegen</small></button><button class="btn big" data-nav id="q2">👥 2 Spieler<small>' + (pads > 1 ? '2 Controller erkannt' : 'Tastatur geteilt, 2 Controller oder Handy') + '</small></button></div>' +
      '<p class="hint">Rekord (1 Spieler): ' + U.fmt(Save.data.best.quiz) + ' Punkte</p></div>', { back: () => UI.close(s) });
    s.el.querySelector('#qBack').onclick = () => UI.close(s);
    const go = n => { UI.closeAll(); stopAll(); G.mode = 'quiz'; AMC.Quiz.start({ players: n, host: G.host, onEnd: r => quizEnd(r) }); };
    s.el.querySelector('#q1').onclick = () => go(1); s.el.querySelector('#q2').onclick = () => go(2);
  }
  function quizEnd(r) {
    const n = id => D.HOSTS[id].name;
    results({ title: r.win < 0 ? '🤝 Unentschieden!' : '🏆 ' + n(r.ids[r.win]) + ' gewinnt!', stars: r.two ? (r.win >= 0 ? 3 : 2) : r.win === 0 ? 3 : r.score[0] > 600 ? 1 : 0, lines: [[n(r.ids[0]), U.fmt(r.score[0])], [n(r.ids[1]), U.fmt(r.score[1])]], again: () => { stopAll(); G.mode = 'quiz'; AMC.Quiz.start({ players: r.two ? 2 : 1, host: G.host, onEnd: quizEnd }); } });
  }

  // ------------------------------------------------------------------ Einstellungen, Steuerung, Mitwirkende
  function settings() {
    const st = Save.data.settings;
    const rng = (id, label, v) => '<label class="set"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" value="' + v + '" data-nav id="' + id + '"></label>';
    const tog = (id, label, on) => '<button type="button" class="set tog' + (on ? ' on' : '') + '" data-nav id="' + id + '"><span>' + label + '</span><i>' + (on ? 'An' : 'Aus') + '</i></button>';
    const s = UI.open('<div class="panel glass"><header><h2>⚙️ Einstellungen</h2><button class="btn small" data-nav id="eBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      rng('sMus', '🎵 Spielmusik', st.music) + rng('sSfx', '🔊 Effekte', st.sfx) + rng('sRad', '📻 Radio & Podcast', st.radio) +
      '<label class="set"><span>🖥️ Grafik</span><select data-nav id="sQ"><option value="auto">Automatisch</option><option value="low">Niedrig (schnell)</option><option value="mid">Mittel</option><option value="high">Hoch</option></select></label>' +
      tog('sInv', '🎥 Kamera umkehren (oben/unten)', st.invert) + tog('sShake', '📳 Bildschirm wackeln', st.shake) + tog('sSub', '💬 Sprechblasen in der Aufnahme', st.subtitles !== false) +
      '<label class="set"><span>🎯 Kamera-Empfindlichkeit</span><input type="range" min="0.4" max="2" step="0.1" value="' + st.sens + '" data-nav id="sSens"></label>' +
      '<button type="button" class="btn danger" data-nav id="sReset">🗑️ Spielstand zurücksetzen</button></div>', { back: () => UI.close(s) });
    const el = s.el, $ = id => el.querySelector('#' + id);
    $('eBack').onclick = () => UI.close(s);
    $('sMus').oninput = e => { st.music = +e.target.value; AMC.Audio.apply(); Save.save(); };
    $('sSfx').oninput = e => { st.sfx = +e.target.value; AMC.Audio.apply(); AMC.Audio.sfx('ui'); Save.save(); };
    $('sRad').oninput = e => { AMC.Media.setVolume(e.target.value); Save.save(); };
    $('sSens').oninput = e => { st.sens = +e.target.value; Save.save(); };
    $('sQ').value = st.quality; $('sQ').onchange = e => { st.quality = e.target.value; Save.save(); UI.toast('🖥️ Grafik wird beim nächsten Start übernommen.'); };
    $('sQ').addEventListener('keydown', e => { if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') e.preventDefault(); });
    s.o.onKey = () => { const f = s.focus; if (f && f.id === 'sQ' && (I.hit('left') || I.hit('right') || I.hit('ok'))) { const o = ['auto', 'low', 'mid', 'high'], i = (o.indexOf(f.value) + (I.hit('left') ? 3 : 1)) % 4; f.value = o[i]; f.onchange({ target: f }); AMC.Audio.sfx('tick'); return true; } return false; };
    const t = (id, key) => $(id).onclick = () => { st[key] = !(key === 'subtitles' ? st[key] !== false : st[key]); $(id).classList.toggle('on', key === 'subtitles' ? st[key] !== false : st[key]); $(id).querySelector('i').textContent = $(id).classList.contains('on') ? 'An' : 'Aus'; Save.save(); };
    t('sInv', 'invert'); t('sShake', 'shake'); t('sSub', 'subtitles');
    $('sReset').onclick = () => UI.confirm('Wirklich den ganzen Spielstand löschen?', () => { Save.reset(); G.host = 'andrew'; UI.closeAll(); mainMenu(); UI.toast('Spielstand zurückgesetzt.'); });
  }
  function controls() {
    const rows = [
      ['Laufen', 'Linker Stick', 'W A S D / Pfeile', 'Joystick links'], ['Sprinten', 'RB / L3', 'Umschalt', 'Joystick ganz drücken'], ['Kamera', 'Rechter Stick', 'Maus ziehen / I J K L', 'Rechts wischen'],
      ['Springen (2× = Doppelsprung)', 'A', 'Leertaste', '⤴'], ['Schallwelle / Sprechen / Reparieren', 'X', 'E / Enter', '📣'], ['Ausweichen (kurz unverwundbar)', 'RT / B', 'C / Strg', '💨'],
      ['Andrew ↔ Marco', 'Y', 'Q / Tab', '⇄'], ['Radio: nächster Sender', 'LB', 'N', 'Titelanzeige antippen'], ['Radio an/aus', 'LT', 'M', '📻'], ['Radio & Podcast', 'Select', 'R', '📻'], ['Pause', 'Start', 'Esc / P', '⏸'],
      ['Aufnahme: Befehl wählen', 'Steuerkreuz', 'Pfeile', 'Antippen'], ['Aufnahme: Ausführen / Timing', 'A', 'Leertaste / Enter', 'Antippen']
    ];
    const s = UI.open('<div class="panel glass wide"><header><h2>🎮 Steuerung</h2><button class="btn small" data-nav data-first id="cBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="lead">Ein Bedienkonzept für alle Geräte: Controller (Xbox, PlayStation, Switch), Tastatur und Maus, Touch – und am TV mit Pfeiltasten und OK. Belegung ändern: Select + Start.</p>' +
      '<table class="ctl"><thead><tr><th></th><th>🎮 Controller</th><th>⌨️ Tastatur</th><th>📱 Touch</th></tr></thead><tbody>' + rows.map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>').join('') + '</tbody></table></div>', { back: () => UI.close(s) });
    s.el.querySelector('#cBack').onclick = () => UI.close(s);
  }
  function credits() {
    const s = UI.open('<div class="panel glass"><header><h2>ℹ️ Mitwirkende</h2><button class="btn small" data-nav data-first id="crBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p><b>AnMaCha – Der Podcast (Offizielles Spiel)</b><br>Mit Marco und Andrew. Story frei nach den Folgen, Rubriken und Neuigkeiten auf <a href="https://anmacha.de" target="_blank" rel="noopener" data-nav>anmacha.de</a>.</p>' +
      '<p><b>Podcast & Sender</b><br>Folgen direkt vom offiziellen Podcast-Feed (podcaster.de), Sender live über laut.fm – nichts davon ist im Spiel gespeichert. Die Sender laufen auch bei RicoReWi Radio.</p>' +
      '<p><b>3D & Ton (frei lizenziert)</b><br>Menschen und Bewegungen: Quaternius „Universal Base Characters“ und „Universal Animation Library“ (CC0) · Gebäude: Quaternius „Ultimate Textured Building Pack“ (CC0) · Bäume, Brunnen, Felsen: Kenney „Fantasy Town Kit“ (CC0) · Geräusche: Kenney (CC0) · Musik und Effekte: im Browser erzeugt · Three.js (MIT) · Schrift Fredoka (OFL).</p>' +
      '<p class="hint">Ein Spiel aus der easygames-Sammlung · Wir ♥ Medien</p></div>', { back: () => UI.close(s) });
    s.el.querySelector('#crBack').onclick = () => UI.close(s);
  }

  // ------------------------------------------------------------------ Pause
  function pause() {
    if (G.paused) return; G.paused = true; AMC.Audio.sfx('back');
    const canRestart = G.mode === 'play' && AMC.Play.state() && AMC.Play.state().mode !== 'free';
    const s = UI.open('<div class="panel glass small pause"><h2>⏸ Pause</h2>' +
      '<button class="btn primary" data-nav data-first id="pRes">▶ Weiter</button><button class="btn" data-nav id="pRad">📻 Radio & Podcast</button><button class="btn" data-nav id="pSet">⚙️ Einstellungen</button><button class="btn" data-nav id="pCtl">🎮 Steuerung</button>' +
      (canRestart ? '<button class="btn" data-nav id="pRe">↻ Neu starten</button>' : '') + '<button class="btn" data-nav id="pMenu">🏠 Hauptmenü</button><p class="hint">💡 ' + U.pick(D.TIPS) + '</p></div>', { back: resume, pauseCloses: true });
    function resume() { UI.close(s); G.paused = false; }
    const b = id => s.el.querySelector('#' + id);
    b('pRes').onclick = resume; b('pRad').onclick = () => UI.radio(); b('pSet').onclick = settings; b('pCtl').onclick = controls;
    if (b('pRe')) b('pRe').onclick = () => { const st = AMC.Play.state(); resume(); startCity(st.mode, st.ch); };
    b('pMenu').onclick = () => UI.confirm('Zurück ins Hauptmenü? Der Fortschritt in diesem Level geht verloren.', () => { toMenuScene(); mainMenu(); });
  }

  // ------------------------------------------------------------------ Spielschleife
  let last = performance.now(), slow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now; if (dt > 0.1) dt = 0.1;
    I.update(dt);
    const uiBusy = UI.update();
    if (!uiBusy) {
      if (I.hit('radioNext')) AMC.Media.cycle(1);
      if (I.hit('radioToggle')) AMC.Media.toggle();
      if (I.hit('radio')) UI.radio();
    }
    try {
      if (G.mode === 'play') {
        if (!uiBusy && !G.paused) { if (I.hit('pause')) pause(); else AMC.Play.update(dt); }
        else if (W.particles) W.particles.update(0);
        AMC.Play.render();
      } else if (G.mode === 'show') {
        if (!uiBusy && I.hit('pause') && AMC.Show.inMenuRoot()) pause();
        if (!G.paused && !uiBusy) AMC.Show.update(dt); else AMC.Studio.update(dt * 0.3);
        AMC.Show.render();
      } else if (G.mode === 'quiz') {
        if (!uiBusy && I.hit('pause')) pause();
        if (!G.paused && !uiBusy) AMC.Quiz.update(dt);
        AMC.Quiz.render();
      } else if (G.mode === 'menu') {
        AMC.Studio.update(dt, { led: { hype: 55 + Math.sin(now / 900) * 30, text: 'BEREIT', sub: AMC.Media.active() ? '♪ ' + AMC.Media.label().main.slice(0, 34) : 'Seid Ihr bereit?' } });
        AMC.Studio.render();
      }
    } catch (e) { if (!slow++) console.error(e); }
  }

  // ------------------------------------------------------------------ Stream-Overlay (OBS/TikTok): eigene Aktionen
  root.EasyGamesStream = {
    actions: [
      { id: 'jump', icon: '⤴', label: 'Springen', run: () => I.fire('jump') },
      { id: 'wave', icon: '📣', label: 'Schallwelle', run: () => I.fire('act') },
      { id: 'swap', icon: '⇄', label: 'Andrew ↔ Marco', run: () => I.fire('swap') },
      { id: 'radio', icon: '📻', label: 'Nächster Sender', run: () => AMC.Media.cycle(1) },
      { id: 'cheer', icon: '🎉', label: 'Applaus', run: () => { AMC.Audio.sfx('applause'); if (W.particles) W.particles.burst(0, 2.5, 0, 0xff8a1e, 40, { speed: 7 }); } }
    ]
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused && !UI.isOpen()) pause(); });

  boot();
})(typeof window !== 'undefined' ? window : globalThis);

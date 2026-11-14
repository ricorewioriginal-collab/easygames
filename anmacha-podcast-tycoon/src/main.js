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
      ['andrew', 'marco', 'rico'].forEach(id => { if (W.hosts[id]) UI.faces[id] = W.portrait(W.hosts[id]); });
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
    if (AMC.Home && AMC.Home.active()) AMC.Home.close(true); if (AMC.Arcade && AMC.Arcade.active()) AMC.Arcade.close(true); UI.closeAll(); G.paused = false; G.net = null; AMC.Play.netSend = null;
  }

  // ------------------------------------------------------------------ Titel & Hauptmenü
  function title() {
    const s = UI.open('<div class="title"><div class="t-logo"><img class="t-pod" src="' + UI.podLogo + '" alt="AnMaCha – Der Podcast mit Marco & Andrew · www.anmacha.de">' +
      '<p class="t-off">Offizielles Spiel</p></div>' +
      '<p class="t-slogan">„' + D.SLOGAN + '“</p><button type="button" class="btn primary t-start" data-nav data-first id="tStart">' + startLabel() + '</button><p class="t-foot">mit Andrew &amp; Marco · Wir ♥ Medien</p></div>', { cls: 'title-screen', back: () => {} });
    const koop = (/[?&]koop=([A-Za-z0-9]{5})/.exec(location.search) || [])[1];
    let go = false; const start = () => { if (go) return; go = true; AMC.Audio.init(); AMC.Audio.sfx('jingle'); UI.close(s); hub(); if (koop) AMC.Net.lobby(koop.toUpperCase()); };
    s.el.querySelector('#tStart').onclick = start;
    s.el.addEventListener('pointerup', e => { if (e.pointerType === 'touch') start(); });
    AMC.onDevice = () => { const b = U.$('tStart'); if (b) b.innerHTML = startLabel(); };
  }
  const startLabel = () => I.device === 'pad' ? AMC.glyph('a') + ' Drücken zum Starten' : I.device === 'touch' ? 'Antippen zum Starten' : 'Enter / Klick zum Starten';

  // Gesamtmenü: alle Funktionen, aufrufbar mitten in der Stadt (Pause, ☰ oder Empfang im Funkhaus)
  function mainMenu() {
    const inCity = G.mode === 'play' && !G.net && AMC.Play.state() && AMC.Play.state().mode === 'free';
    const st = Save.data.story, chDone = st.done, stars = Object.values(st.stars).reduce((a, b) => a + b, 0);
    const s = UI.open(
      '<div class="menu-l"><div class="m-logo"><img src="' + UI.podLogo + '" alt=""><div><h1>AnMa<span>Cha</span> – Der Podcast</h1><p>Offizielles Spiel</p></div></div>' +
      '<nav class="m-list">' + (inCity ? mi('resume', '🏙️', 'Weiter in der Stadt', Object.keys(Save.data.quests).length + '/' + D.QUESTS.length + ' Aufträge · Funkhaus, Senderhäuser, Läden und Häuser sind begehbar', true) : '') +
      mi('story', '▶', 'Story: Staffel 1–3', chDone >= D.CHAPTERS.length ? 'Alle ' + D.CHAPTERS.length + ' Kapitel geschafft · ⭐ ' + stars + '/' + D.CHAPTERS.length * 3 : 'Kapitel ' + (chDone + 1) + ' von ' + D.CHAPTERS.length + ' · ⭐ ' + stars, !inCity) +
      mi('live', '🎙️', 'Live-Show', 'Endlos-Aufnahme · Rekord ' + U.fmt(Save.data.best.live) + ' Hörer') +
      mi('jagd', '🏃', 'Themenjagd', '3 Minuten durch die Stadt · Rekord ' + U.fmt(Save.data.best.jagd)) +
      mi('race', '🏁', 'Funk-Rennen', '10 Tore auf Zeit · ' + (Save.data.best.race ? 'Bestzeit ' + Save.data.best.race.toFixed(1) + ' s' : 'noch keine Bestzeit')) +
      mi('quiz', '🧠', 'KI-Quizshow', '1 Spieler oder 2 Spieler: Andrew gegen Marco') +
      (inCity ? '' : mi('free', '🏙️', 'Stadt & Nebenaufträge', Object.keys(Save.data.quests).length + '/' + D.QUESTS.length + ' Aufträge erledigt · frei spielen, Radio hören')) +
      mi('koop', '🌐', 'Online-Koop', 'Zu zweit auf zwei Geräten: Andrew & Marco – per Link, Code oder QR') +
      mi('walk', '🚶', 'Studio betreten', 'Zu Fuß durchs Studio: Pult, Rico, Einrichten, Musikshop') +
      (AMC.Events ? mi('week', AMC.Events.week().icon, 'Woche ' + AMC.Events.week().n + ': ' + AMC.Events.week().name, AMC.Events.week().goal + ' ' + AMC.Events.week().have + '/' + AMC.Events.week().need + ' · 📼 ' + AMC.Events.tapes() + '/20 Kassetten') : '') +
      (AMC.Missions ? mi('missions', '📋', 'Auftragsbuch', (AMC.Missions.active() ? '▶ ' + AMC.Missions.active().t + ' · ' : '') + 'Story-Aufträge ' + AMC.Missions.progress().done + '/' + AMC.Missions.progress().of + ' · Tagesjobs') : '') +
      (AMC.Acts ? mi('acts', '📖', 'Story-Akte', AMC.Acts.state().done ? '🏆 Alle Akte geschafft' : AMC.Acts.state().title + ' · ' + U.fmt(AMC.Acts.state().have) + '/' + U.fmt(AMC.Acts.state().need)) : '') +
      (AMC.Guests ? mi('guests', '🎙️', 'Studiogäste', (AMC.Guests.today() ? 'Heute: ' + AMC.Guests.today().name : 'Noch kein Gast für heute') + ' · ' + AMC.Guests.list().filter(g => g.open).length + '/' + AMC.Guests.ROSTER.length + ' freigeschaltet') : '') +
      (AMC.Feed ? mi('app', '📱', 'AnMaCha-App', U.fmt(AMC.Feed.followers()) + ' Follower · Trend ' + AMC.Feed.trend().tag) : '') +
      mi('friends', '❤️', 'Freundebuch', (AMC.Social ? Object.keys((Save.data.social || {}).f || {}).length + ' Bekanntschaften · 💖 ' + AMC.Social.superfans() + ' Superfans' : '')) +
      mi('home', '🏠', 'Zuhause', 'Andrews Wohnung & Marcos Haus · ' + ['andrew', 'marco'].map(id => D.HOSTS[id].name + ' ' + Math.round(AMC.Home.mood(id) * 100) + ' % fit').join(' · ')) +
      mi('arcade', '🕹️', 'Arcade: 3D-Minispiele', AMC.Arcade.GAMES.map(g => g.name).join(' · ')) +
      mi('music', '🎹', 'Musikshop', (Save.data.songs || []).length + ' gekaufte Lieder · freie Klavierlicht-Melodien für Hörerwünsche') +
      mi('studio', '🛠️', 'Studio gestalten', 'Studio-Wert ' + AMC.StudioEdit.value() + ' · Möbel, Deko, Technik frei hinstellen – bringt Hörer-Bonus') +
      mi('shop', '🛍️', 'Fanshop', '🎟️ ' + U.fmt(Save.data.fan) + ' Fan-Punkte · Outfits & Studio-Upgrades') +
      mi('radio', '📻', 'Radio & Podcast', 'Alle Folgen und die 13 AnMaCha-Sender') +
      '</nav><div class="m-row">' + mi('settings', '⚙️', 'Einstellungen') + mi('controls', '🎮', 'Steuerung') + mi('credits', 'ℹ️', 'Mitwirkende') + '</div></div>' +
      '<div class="menu-r"><button type="button" class="host-pick glass" data-nav id="mHost"></button><div class="m-hint" id="mHint"></div></div>',
      { cls: 'main-menu' + (inCity ? ' in-city' : ''), back: () => resume() });
    const el = s.el;
    function resume() { if (!inCity) return; UI.close(s); G.menu = null; }
    function updHost() {
      const H = D.HOSTS[G.host];
      el.querySelector('#mHost').innerHTML = '<img src="' + UI.face(G.host) + '" alt=""><span><small>Du spielst</small><b>' + H.name + '</b><em>' + H.perk + '</em></span><span class="hp-sw">' + AMC.glyph('y') + ' wechseln</span>';
      el.querySelector('#mHint').innerHTML = AMC.glyph('dpad') + ' Auswählen · ' + AMC.glyph('ok') + ' Start · ' + AMC.glyph('select') + ' Radio · ' + AMC.glyph('lb') + ' Sender';
      ['andrew', 'marco', 'rico'].forEach(id => { const f = W.hosts[id]; if (f) f.play(id === G.host ? 'yes' : 'idle', { fade: 0.3 }); });
    }
    const swapHost = () => { if (inCity) { resume(); I.fire('swap'); return; } G.host = D.nextHost(G.host); Save.data.host = G.host; Save.save(); AMC.Audio.sfx('swap'); updHost(); };
    el.querySelector('#mHost').onclick = swapHost;
    s.o.onKey = () => { if (I.hit('swap')) { swapHost(); return true; } return false; };
    updHost();
    const go = { resume, arcade: arcadeMenu, walk: walkStudio, friends: () => AMC.Social.book(), guests: () => AMC.Guests.panel(), acts: () => AMC.Acts.panel(), missions: () => AMC.Missions.panel(), app: () => AMC.Feed.panel(), week: () => AMC.Events.panel(), home: homeMenu, music: () => AMC.Home.musicShop(), studio: studioEdit, story: storyMenu, live: startLive, jagd: () => startCity('jagd'), race: () => startCity('race'), quiz: quizMenu, free: () => startCity('free'), radio: () => UI.radio(), koop: () => AMC.Net.lobby(), shop, settings, controls, credits };
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go[b.dataset.go]());
    G.menu = s;
  }
  const mi = (go, icon, label, sub, first) => '<button type="button" class="m-item" data-nav data-go="' + go + '"' + (first ? ' data-first' : '') + '><span class="mi-ic">' + icon + '</span><span class="mi-t"><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';

  // ------------------------------------------------------------------ Sims-Teil: Zuhause und begehbares Studio
  const backToMenu = () => hub();
  // Zentrale: das Spiel läuft in der Stadt, at = Ort (Station), an dem man wieder herauskommt
  function hub(at) { UI.showTouch(false); startCity('free', null, at); }
  G.hub = hub;
  function homeMenu() {
    const card = id => { const n = AMC.Home.needs(id); return '<button type="button" class="st-item" data-nav data-h="' + id + '"><img class="hm-face" src="' + UI.face(id) + '" alt=""><span><b>' + AMC.Home.HOMES[id].name + '</b><small>⚡ ' + Math.round(n.energy) + ' · 🍔 ' + Math.round(n.hunger) + ' · 🎮 ' + Math.round(n.fun) + ' · 💡 ' + (n.ideas || []).length + '/3 Ideen</small></span></button>'; };
    const s = UI.open('<div class="panel glass"><header><h2>🏠 Zuhause</h2><button class="btn small" data-nav id="hmB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">Schlafen, essen, entspannen und Ideen sammeln. Wer fit ist, macht bessere Folgen.</p><div class="st-list">' + card('andrew') + card('marco') + '</div></div>', { back: () => UI.close(s) });
    s.el.querySelector('#hmB').onclick = () => UI.close(s);
    s.el.querySelectorAll('[data-h]').forEach(b => b.onclick = () => openHome(b.dataset.h));
  }
  function openHome(id) {
    UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true); AMC.Studio.leave(); AMC.Audio.music('menu');
    AMC.Home.open(id, () => hub('home:' + id));
  }
  // ------------------------------------------------------------------ Arcade: 3D-Minispiele mit Andrew und Marco
  function arcadeMenu() {
    const card = g => '<button type="button" class="st-item" data-nav data-a="' + g.id + '"><span class="st-ic">' + g.icon + '</span><span><b>' + g.name + '</b><small>' + g.sub + ' · Rekord ' + U.fmt(Save.data.best['arc_' + g.id] || 0) + '</small></span></button>';
    const s = UI.open('<div class="panel glass"><header><h2>🕹️ Arcade</h2><button class="btn small" data-nav id="arB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">Du spielst <b id="arHost">' + D.HOSTS[G.host].name + '</b> · <button type="button" class="btn small" data-nav id="arSw">' + AMC.glyph('y') + ' wechseln</button> · Punkte bringen Fan-Punkte</p><div class="st-list">' + AMC.Arcade.GAMES.map(card).join('') + '</div></div>', { back: () => UI.close(s) });
    const sw = () => { G.host = D.nextHost(G.host); Save.data.host = G.host; Save.save(); AMC.Audio.sfx('swap'); s.el.querySelector('#arHost').textContent = D.HOSTS[G.host].name; };
    s.el.querySelector('#arB').onclick = () => UI.close(s);
    s.el.querySelector('#arSw').onclick = sw;
    s.o.onKey = () => { if (I.hit('swap')) { sw(); return true; } return false; };
    s.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => startArcade(b.dataset.a));
  }
  /** from: Station in der Welt ('arc:<id>') – danach geht es dorthin zurück */
  function startArcade(id, from) {
    UI.closeAll(); stopAll(); G.mode = 'arcade'; AMC.Studio.leave(); AMC.Audio.music('party'); UI.showTouch(id === 'jump');
    AMC.Arcade.start(id, G.host, next => { UI.showTouch(false); if (next === 'again') startArcade(id, from); else if (from) { hub(from); if (next === 'arcade') arcadeMenu(); } else { backToMenu(); if (next === 'arcade') arcadeMenu(); } });
  }
  G.arcade = startArcade;
  function walkStudio() {
    UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true);
    const leave = then => { AMC.Home.close(true); UI.showTouch(false); then(); };
    AMC.Home.studio({ host: G.host, actions: {
      live: () => leave(startLive),
      edit: () => leave(studioEdit),
      arcade: () => leave(() => { backToMenu(); arcadeMenu(); }),
      city: () => leave(() => startCity('free'))
    } }, () => { UI.showTouch(false); backToMenu(); });
  }

  // ------------------------------------------------------------------ Studio gestalten
  function studioEdit() {
    UI.closeAll(); stopAll(); G.mode = 'edit'; UI.showTouch(false);
    AMC.StudioEdit.open(() => hub('edit'));
  }

  // ------------------------------------------------------------------ Story
  function storyMenu() {
    const st = Save.data.story;
    const s = UI.open('<div class="panel glass wide"><header><h2>▶ Die Staffel</h2><button class="btn small" data-nav id="sBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="lead">Staffel 1: von der ersten Folge im Sommer 2020 bis LIVE auf dem Podfluencer Festival. Staffel 2: Das Funkloch kehrt zurück – und streut alte Folgen in der Stadt.</p><div class="ch-grid">' +
      D.CHAPTERS.map((c, i) => {
        const head = i === 0 || (D.CHAPTERS[i - 1].season || 1) !== (c.season || 1) ? '<h3 class="ch-season">Staffel ' + (c.season || 1) + ({ 2: ' · Das Funkloch kehrt zurück', 3: ' · Auf Sendung – die AnMaCha-Radios' }[c.season] || ' · Die Geschichte von AnMaCha') + '</h3>' : '';
        const open = i <= st.done, stars = st.stars[c.id] || 0;
        return head + '<button type="button" class="ch-card' + (open ? '' : ' locked') + '" data-nav data-ch="' + i + '"' + (i === Math.min(st.done, D.CHAPTERS.length - 1) ? ' data-first' : '') + (open ? '' : ' disabled') + ' style="--i:' + i + '">' +
          '<span class="ch-n">' + (i + 1) + '</span><span class="ch-t"><small>' + c.when + ' · Folge ' + (c.ep < 10 ? '#0' : '#') + c.ep + '</small><b>' + c.title + '</b><em>' + objName(c) + '</em></span>' +
          '<span class="ch-s">' + (open ? '★★★'.split('').map((x, k) => '<i class="' + (k < stars ? 'on' : '') + '">★</i>').join('') : '🔒') + '</span></button>';
      }).join('') + '</div></div>', { back: () => UI.close(s) });
    s.el.querySelector('#sBack').onclick = () => UI.close(s);
    s.el.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { if (!b.disabled) { UI.closeAll(); playChapter(+b.dataset.ch); } });
  }
  const objName = c => ({ collect: '✨ Themen-Funken sammeln', guest: '⭐ Gäste ins Studio bringen', antenna: '📡 Sendemast reparieren', train: '🚉 Haltestellen-Rennen', party: '📼 Mixtapes finden', deliver: '🍟 Imbiss-Lieferdienst', cat: '🐈 Katzenjagd', hunt: '🤖 KI-Drohnen abschalten', boss: '👾 Bosskampf: ' + (c.obj.name || 'Das Funkloch') })[c.obj.type] + ' · 🎙️ Live-Aufnahme';

  function playChapter(i) {
    const ch = D.CHAPTERS[i];
    G.chapter = i;
    UI.dialog(ch.intro, () => startCity('story', ch));
  }

  function startCity(mode, ch, at) {
    stopAll(); G.mode = 'play';
    AMC.Studio.leave();
    AMC.Play.onEnd = res => cityEnd(mode, ch, res);
    // Menüpunkte als Orte in der Welt: Panels öffnen über der Stadt (Spiel pausiert), Szenenwechsel starten direkt
    AMC.Play.onAction = mode !== 'free' ? null : id => {
      const back = () => hub(id);
      if (id.startsWith('sender:') && AMC.Career) AMC.Career.mark('tour');
      if (id.startsWith('sender:')) { const sl = id.slice(7); UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true); AMC.Audio.music('menu'); AMC.Home.station(sl, G.host, back); return; }
      if (id.startsWith('room:')) { const k = +id.slice(5); UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true); AMC.Audio.music('menu'); AMC.Home.room(k, G.host, back); return; }
      if (id.startsWith('arc:')) { UI.closeAll(); return startArcade(id.slice(4), id); }
      if (id.startsWith('bus:')) return AMC.Transit.menu(id);
      if (id.startsWith('place:')) return AMC.District.open(id.slice(6));
      if (id.startsWith('world:')) return AMC.Worlds.open(id.slice(6));
      if (id.startsWith('ferry:')) return AMC.Worlds.ferry(id);
      if (id === 'camper') { UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true); AMC.Audio.music('menu'); AMC.Home.camper(G.host, back); return; }
      if (id.startsWith('home:')) { const h = id.slice(5); UI.closeAll(); stopAll(); G.mode = 'home'; UI.showTouch(true); AMC.Audio.music('menu'); AMC.Home.open(h, back); return; }
      ({ live: startLive, edit: studioEdit, story: storyMenu, quiz: quizMenu, radio: () => UI.radio(), shop: () => shop(), koop: () => AMC.Net.lobby(), music: () => AMC.Home.musicShop(), arcade: arcadeMenu, menu: mainMenu })[id]();
    };
    AMC.Play.start({ mode, chapter: ch, host: G.host });
    if (at === 'camper') { const S = AMC.Play.state(); if (S.gisela) { const h = S.cars && S.cars.find(c => c.gisela) ? S.cars.find(c => c.gisela).h : 0; S.pl.x = S.gisela.x + Math.cos(h) * 2.1 + Math.sin(h) * 1.6; S.pl.z = S.gisela.z - Math.sin(h) * 2.1 + Math.cos(h) * 1.6; W.cam.yaw = h + Math.PI; if (S.fo) { S.fo.x = S.pl.x + 1.2; S.fo.z = S.pl.z; } } }
    if (at) { const S = AMC.Play.state(), st = S.stations && S.stations.find(x => x.id === at); if (st) { S.pl.x = st.x; S.pl.z = st.z; if (S.fo) { S.fo.x = st.x + 1.2; S.fo.z = st.z + 1; } } }
    UI.showTouch(true);
    AMC.Play.msg(mode === 'jagd' ? '🏃 Themenjagd! 3 Minuten – sammle alles!' : mode === 'race' ? '🏁 Funk-Rennen! Lauf durch alle 10 Tore – die Uhr läuft!' : mode === 'free' ? '🏙️ Funkhaus-Viertel · ' + (I.device === 'touch' ? '⏸' : I.device === 'pad' ? 'Start' : 'Esc') + ' = Gesamtmenü' : '🎙️ ' + ch.title + ' – los geht\'s!', 2.6);
    if (!Save.data.seenIntro) { Save.data.seenIntro = true; Save.save(); setTimeout(() => UI.toast(I.device === 'touch' ? 'Links bewegen, rechts wischen = Kamera. ⤴ Springen, 📣 Welle, 💨 Ausweichen, ⇄ Wechsel' : I.device === 'pad' ? 'Linker Stick laufen, rechter Stick Kamera, A springen, X Welle, RT ausweichen, Y Andrew/Marco' : 'WASD laufen, Maus ziehen = Kamera, Leertaste springen, E Welle, C ausweichen, Q wechseln, Umschalt sprinten', 7000), 800); }
  }
  function cityEnd(mode, ch, res) {
    UI.showTouch(false);
    if (mode === 'free') return setTimeout(() => hub(), 300);
    if (mode === 'jagd') {
      const best = Save.data.best.jagd, rec = res.score > best; if (rec) { Save.data.best.jagd = res.score; Save.save(); }
      const fp = Save.earn(res.score / 40);
      return setTimeout(() => results({ title: '🏃 Themenjagd vorbei!', stars: res.score > 9000 ? 3 : res.score > 6000 ? 2 : res.score > 3000 ? 1 : 0, lines: [['Punkte', U.fmt(res.score) + (rec ? ' 🏆 Neuer Rekord!' : '')], ['Themen-Funken', sumGot(res.got)], ['Störsender abgeschaltet', res.kills], ['Goldene Erinnerungen', res.gold], fanLine(fp)], again: () => startCity('jagd') }), 400);
    }
    if (mode === 'race') {
      const t = res.time, best = Save.data.best.race, rec = !best || t < best; if (rec) { Save.data.best.race = Math.round(t * 10) / 10; Save.save(); }
      const stars = t <= 50 ? 3 : t <= 70 ? 2 : t <= 100 ? 1 : 0, fp = Save.earn(30 + stars * 40);
      return setTimeout(() => results({ title: '🏁 Ziel erreicht!', stars, lines: [['Zeit', t.toFixed(1) + ' s' + (rec ? ' 🏆 Neue Bestzeit!' : '')], ['Medaille', ['–', '🥉 Bronze (≤ 100 s)', '🥈 Silber (≤ 70 s)', '🥇 Gold (≤ 50 s)'][stars]], ['Themen-Funken', sumGot(res.got)], fanLine(fp)], again: () => startCity('race') }), 400);
    }
    if (!res.ok) return setTimeout(() => results({ title: '⏱ Sendeschluss!', fail: true, stars: 0, lines: [['Die Zeit ist abgelaufen.', ''], ['Tipp', U.pick(D.TIPS)]], again: () => playChapterDirect(G.chapter) }), 400);
    // Ab ins Studio
    transition('🎙️ Ab ins Studio!', () => startShow('story', ch, res));
  }
  // ------------------------------------------------------------------ Online-Koop
  G.startNet = function (mode, ch, seed, me, role) {
    stopAll(); G.mode = 'play'; G.net = role;
    AMC.Studio.leave();
    AMC.Play.onEnd = res => netEnd(mode, ch, res, role);
    AMC.Play.netSend = m => AMC.Net.send(m);
    AMC.Play.start({ mode, chapter: ch, host: me, seed, net: role });
    UI.showTouch(true);
    AMC.Play.msg('🌐 Koop: Du spielst ' + D.HOSTS[me].name + (mode === 'jagd' ? ' – Themenjagd zu zweit!' : mode === 'free' ? ' – die Stadt gehört euch!' : ' – ' + ch.title), 3, true);
  };
  function netEnd(mode, ch, res, role) {
    if (role === 'host') AMC.Net.send({ t: 'end', res: { ok: !!res.ok, score: res.score | 0, kills: res.kills | 0, gold: res.gold | 0, funken: sumGot(res.got) } });
    const funken = res.funken != null ? res.funken : sumGot(res.got || {});
    const fp = Save.earn(mode === 'story' ? (res.ok ? 150 : 20) : (res.score || 0) / (mode === 'jagd' ? 40 : 60));
    UI.showTouch(false);
    setTimeout(() => results({
      title: mode === 'story' ? (res.ok ? '✅ Koop-Kapitel geschafft!' : '⏱ Sendeschluss!') : mode === 'jagd' ? '🏃 Themenjagd zu zweit vorbei!' : '🏙️ Stadt zu zweit',
      fail: mode === 'story' && !res.ok, stars: mode === 'jagd' ? (res.score > 12000 ? 3 : res.score > 8000 ? 2 : res.score > 4000 ? 1 : 0) : res.ok ? 3 : 0,
      lines: [['Gemeinsame Punkte', U.fmt(res.score || 0)], ['Themen-Funken', funken], ['Störsender abgeschaltet', res.kills || 0], ['Goldene Erinnerungen', res.gold || 0], fanLine(fp)].concat(role === 'guest' ? [['🌐', 'Der Gastgeber wählt die nächste Runde.']] : []),
      again: role === 'host' && AMC.Net.active() ? () => { AMC.Net.send({ t: 'lobby' }); AMC.Net.lobby(); } : null, againLabel: 'Zur Koop-Lobby',
      onMenu: () => AMC.Net.close()
    }), 400);
  }
  G.netLost = () => { if (G.mode === 'play' && G.net) hub(); };
  G.netLobby = () => { UI.closeAll(); hub(); AMC.Net.lobby(); };

  function playChapterDirect(i) { startCity('story', D.CHAPTERS[i]); }
  G.playChapter = i => { UI.closeAll(); G.chapter = i; playChapterDirect(i); };
  const fanLine = n => ['🎟️ Fan-Punkte', '+' + U.fmt(n) + ' (jetzt ' + U.fmt(Save.data.fan) + ')'];
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
    if (ch && ch.obj.type === 'deliver') cards.push({ rub: 'feel', power: 2.4, label: '🍟 Imbiss-Geschichten' }, { rub: 'serious', power: 2.2, label: '🍽️ Mensakind oder Imbisskind?' });
    if (ch && ch.obj.type === 'cat') cards.push({ rub: 'tv', power: 2.5, label: '🐈 Das Gurken-Video' }, { rub: 'tech', power: 2.2, label: '🚗 Elektroauto-Talk' });
    if (ch && ch.obj.type === 'hunt') cards.push({ rub: 'tech', power: 2.8, label: '🤖 KI – Hör\' mir uff!' }, { rub: 'serious', power: 2.4, label: '🧠 Serious 15: Künstliche Intelligenz' });
    cards.push({ rub: 'life', power: 0.9, label: 'Wenig Interessantes aus unserem Leben' });
    return cards;
  }
  function startShow(mode, ch, res) {
    stopAll(); G.mode = 'show';
    const cards = mode === 'story' ? cardsFrom(res, ch) : AMC.Career ? AMC.Career.cards() : [];
    AMC.Show.start({
      mode: mode === 'story' ? 'story' : 'arcade', rounds: ch ? ch.show.rounds : 99, goal: ch ? ch.show.goal : [300, 600, 900], cards, host: ((res && res.host) || G.host) === 'rico' ? 'andrew' : ((res && res.host) || G.host),
      onEnd: r => showEnd(mode, ch, res, r)
    });
  }
  function showEnd(mode, ch, cityRes, r) {
    const ev = AMC.Career ? AMC.Career.episode(r) : null, evl = ev ? ev.lines : [];
    if (ev && ev.up) setTimeout(() => UI.toast(ev.rank.icon + ' Aufstieg: Ihr seid jetzt ' + ev.rank.name + '!', 4500), 1500);
    if (mode === 'arcade') {
      const rec = r.listeners > Save.data.best.live; if (rec) { Save.data.best.live = r.listeners; Save.save(); }
      const fp = Save.earn(r.listeners / 50);
      return results({ title: '🎙️ Live-Show beendet', stars: r.listeners > 20000 ? 3 : r.listeners > 10000 ? 2 : r.listeners > 4000 ? 1 : 0, lines: [['Hörer', U.fmt(r.listeners) + (rec ? ' 🏆 Neuer Rekord!' : '')], ['Runden', r.rounds], fanLine(fp)].concat(evl), again: startLive, againLabel: 'Noch eine Folge' });
    }
    const idx = D.CHAPTERS.indexOf(ch), st = Save.data.story;
    if (r.stars < 1) return results({ title: '📉 Zu wenig Hörer …', fail: true, stars: 0, lines: [['Hörer', U.fmt(r.listeners)], ['Ziel für ⭐', U.fmt(ch.show.goal[0] * 10)], ['Tipp', 'Nutze passende Karten und wechsle die Sprecher für Kombo-Bonus.']].concat(evl), again: () => startShow('story', ch, cityRes), againLabel: 'Aufnahme wiederholen' });
    st.stars[ch.id] = Math.max(st.stars[ch.id] || 0, r.stars); st.best[ch.id] = Math.max(st.best[ch.id] || 0, r.listeners);
    const first = st.done === idx; if (st.done <= idx) st.done = idx + 1; Save.save();
    const fp = Save.earn(first ? 150 + r.stars * 100 : r.stars * 40);
    const seasonEnd = idx === D.CHAPTERS.length - 1 || (D.CHAPTERS[idx + 1] && (D.CHAPTERS[idx + 1].season || 1) !== (ch.season || 1));
    toMenuScene();
    UI.dialog(ch.outro, () => {
      const epIdx = AMC.Media.episodes.findIndex(e => e.nr === (ch.ep < 10 ? '#0' : '#') + ch.ep);
      results({
        title: '✅ Kapitel ' + (idx + 1) + ' geschafft!', stars: r.stars,
        lines: [['Hörer', U.fmt(r.listeners)], ['Themen-Funken', sumGot(cityRes.got)], ['Störsender', cityRes.kills], ['Fans gesprochen', cityRes.talks], fanLine(fp)].concat(evl).concat(first && seasonEnd ? [['🏆', 'Staffel ' + (ch.season || 1) + ' abgeschlossen!' + (idx < D.CHAPTERS.length - 1 ? ' Staffel ' + ((ch.season || 1) + 1) + ' ist freigeschaltet.' : ' Danke fürs Spielen!')]] : []),
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
      '<button class="btn" data-nav id="rMenu">🏙️ Zur Stadt</button></div></div>', { back: () => { UI.close(s); hub(); } });
    if (!o.fail) { AMC.Audio.sfx(o.stars ? 'win' : 'lose'); for (let k = 0; k < o.stars; k++) setTimeout(() => AMC.Audio.sfx('star'), 400 + k * 250); }
    else AMC.Audio.sfx('lose');
    const b = id => s.el.querySelector('#' + id);
    if (b('rNextCh')) b('rNextCh').onclick = () => { UI.close(s); o.next(); };
    if (b('rAgain')) b('rAgain').onclick = () => { UI.close(s); o.again(); };
    if (b('rEp')) b('rEp').onclick = () => { AMC.Media.playEpisode(o.episode); UI.radio(); };
    b('rMenu').onclick = () => { if (o.onMenu) o.onMenu(); UI.close(s); hub(); };
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
    const fp = Save.earn(r.score[0] / 10);
    results({ fan: fp, title: r.win < 0 ? '🤝 Unentschieden!' : '🏆 ' + n(r.ids[r.win]) + ' gewinnt!', stars: r.two ? (r.win >= 0 ? 3 : 2) : r.win === 0 ? 3 : r.score[0] > 600 ? 1 : 0, lines: [[n(r.ids[0]), U.fmt(r.score[0])], [n(r.ids[1]), U.fmt(r.score[1])], fanLine(fp)], again: () => { stopAll(); G.mode = 'quiz'; AMC.Quiz.start({ players: r.two ? 2 : 1, host: G.host, onEnd: quizEnd }); } });
  }

  // ------------------------------------------------------------------ Fanshop: Outfits & Studio-Upgrades
  function shop(tab) {
    tab = tab || 'outfit';
    const who = G.host, H = D.HOSTS[who], cur = Save.data.outfit[who] || 'std';
    const card = (it, kind) => {
      const own = it.cost === 0 || Save.has(kind + ':' + it.id), on = kind === 'o' && cur === it.id, can = Save.data.fan >= it.cost;
      return '<button type="button" class="shop-it' + (own ? ' own' : '') + (on ? ' on' : '') + '" data-nav data-it="' + kind + ':' + it.id + '"><span class="si-ic">' + it.icon + '</span><span class="si-t"><b>' + it.name + '</b><small>' +
        (it.desc ? it.desc + ' · ' : '') + (on ? '✔ trägt ' + H.name : own ? (kind === 'o' ? 'Anziehen' : '✔ Im Studio') : '🎟️ ' + U.fmt(it.cost) + (can ? '' : ' · zu wenig Punkte')) + '</small></span></button>';
    };
    const s = UI.open('<div class="panel glass wide"><header><h2>🛍️ Fanshop</h2><span class="fan-pts">🎟️ ' + U.fmt(Save.data.fan) + '</span><button class="btn small" data-nav id="fBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<div class="r-tabs"><button class="tab' + (tab === 'outfit' ? ' on' : '') + '" data-nav id="tO"' + (tab === 'outfit' ? ' data-first' : '') + '>👕 Outfits für ' + H.name + '</button><button class="tab' + (tab === 'up' ? ' on' : '') + '" data-nav id="tU"' + (tab === 'up' ? ' data-first' : '') + '>🎙️ Studio-Upgrades</button></div>' +
      '<p class="hint">Fan-Punkte gibt es für Kapitel, Live-Show, Themenjagd, Quiz und Nebenaufträge. ' + AMC.glyph('y') + ' wechselt zwischen Andrew und Marco.</p>' +
      '<div class="shop-grid">' + (tab === 'outfit' ? D.OUTFITS.map(o => card(o, 'o')) : D.UPGRADES.map(u => card(u, 'u'))).join('') + '</div></div>', { back: () => UI.close(s) });
    const re = t => { UI.close(s); shop(t); };
    s.el.querySelector('#fBack').onclick = () => UI.close(s);
    s.el.querySelector('#tO').onclick = () => re('outfit'); s.el.querySelector('#tU').onclick = () => re('up');
    s.o.onKey = () => { if (I.hit('swap')) { G.host = D.nextHost(G.host); Save.data.host = G.host; Save.save(); AMC.Audio.sfx('swap'); re(tab); return true; } return false; };
    s.el.querySelectorAll('[data-it]').forEach(b => b.onclick = () => {
      const [kind, id] = b.dataset.it.split(':'), it = (kind === 'o' ? D.OUTFITS : D.UPGRADES).find(x => x.id === id), key = kind + ':' + id;
      const owned = it.cost === 0 || Save.has(key);
      const wear = () => { if (kind !== 'o') return; Save.data.outfit[who] = id; Save.save(); W.rebuildHost(who).then(f => { if (f) { UI.faces[who] = W.portrait(f); f.play('yes'); } }); };
      if (owned) { if (kind === 'o' && cur !== id) { wear(); AMC.Audio.sfx('swap'); UI.toast(it.icon + ' ' + H.name + ' trägt jetzt: ' + it.name); setTimeout(() => re(tab), 60); } return; }
      if (Save.data.fan < it.cost) { AMC.Audio.sfx('buzz'); UI.toast('🎟️ Dir fehlen noch ' + U.fmt(it.cost - Save.data.fan) + ' Fan-Punkte.'); return; }
      UI.confirm(it.icon + ' ' + it.name + ' für 🎟️ ' + U.fmt(it.cost) + ' kaufen?', () => {
        Save.data.fan -= it.cost; Save.data.owned.push(key); Save.save(); AMC.Audio.sfx('buy');
        if (kind === 'u') Save.data.owned.push(id);   // Upgrades wirken direkt (Save.has('mics') …)
        Save.save(); wear(); UI.toast('✔ ' + it.name + (kind === 'o' ? ' gekauft und angezogen!' : ' ist jetzt im Studio!')); setTimeout(() => re(tab), 60);
      });
    });
  }

  // ------------------------------------------------------------------ Einstellungen, Steuerung, Mitwirkende
  function settings() {
    const st = Save.data.settings;
    const rng = (id, label, v) => '<label class="set"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" value="' + v + '" data-nav id="' + id + '"></label>';
    const tog = (id, label, on) => '<button type="button" class="set tog' + (on ? ' on' : '') + '" data-nav id="' + id + '"><span>' + label + '</span><i>' + (on ? 'An' : 'Aus') + '</i></button>';
    const s = UI.open('<div class="panel glass"><header><h2>⚙️ Einstellungen</h2><button class="btn small" data-nav id="eBack">' + AMC.glyph('b') + ' Zurück</button></header>' +
      rng('sMus', '🎵 Spielmusik', st.music) + rng('sSfx', '🔊 Effekte', st.sfx) + rng('sRad', '📻 Radio & Podcast', st.radio) +
      '<label class="set"><span>🖥️ Grafik</span><select data-nav id="sQ"><option value="auto">Automatisch</option><option value="low">Niedrig (schnell)</option><option value="mid">Mittel</option><option value="high">Hoch</option></select></label>' +
      tog('sInv', '🎥 Kamera umkehren (oben/unten)', st.invert) + tog('sShake', '📳 Bildschirm wackeln', st.shake) + tog('sSub', '💬 Sprechblasen in der Aufnahme', st.subtitles !== false) + tog('sVoice', '🗣️ Stimmen in Zwischensequenzen', st.voice !== false) +
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
    const t = (id, key) => $(id).onclick = () => { const dflt = key === 'subtitles' || key === 'voice'; st[key] = !(dflt ? st[key] !== false : st[key]); $(id).classList.toggle('on', dflt ? st[key] !== false : st[key]); $(id).querySelector('i').textContent = $(id).classList.contains('on') ? 'An' : 'Aus'; Save.save(); };
    t('sInv', 'invert'); t('sShake', 'shake'); t('sSub', 'subtitles'); t('sVoice', 'voice');
    $('sReset').onclick = () => UI.confirm('Wirklich den ganzen Spielstand löschen?', () => { Save.reset(); G.host = 'andrew'; UI.closeAll(); hub(); UI.toast('Spielstand zurückgesetzt.'); });
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
      '<p><b>3D & Ton (frei lizenziert)</b><br>Menschen und Bewegungen: Quaternius „Universal Base Characters“ und „Universal Animation Library“ (CC0) · Gebäude: Quaternius „Ultimate Textured Building Pack“ (CC0) · Katze: Quaternius „Ultimate Monsters“ (CC0) · Bäume, Brunnen, Felsen: Kenney „Fantasy Town Kit“ (CC0) · Geräusche: Kenney (CC0) · Musikwünsche: gemeinfreie Melodien aus Klavierlicht · Musik und Effekte: im Browser erzeugt · Three.js (MIT) · Schrift Fredoka (OFL).</p>' +
      '<p class="hint">Ein Spiel aus der easygames-Sammlung · Wir ♥ Medien</p></div>', { back: () => UI.close(s) });
    s.el.querySelector('#crBack').onclick = () => UI.close(s);
  }

  // ------------------------------------------------------------------ Pause
  function pause() {
    if (G.paused) return;
    if (G.mode === 'play' && !G.net && AMC.Play.state() && AMC.Play.state().mode === 'free') { AMC.Audio.sfx('back'); return mainMenu(); }
    G.paused = true; AMC.Audio.sfx('back');
    const canRestart = G.mode === 'play' && !G.net && AMC.Play.state() && AMC.Play.state().mode !== 'free';
    const s = UI.open('<div class="panel glass small pause"><h2>⏸ Pause</h2>' +
      '<button class="btn primary" data-nav data-first id="pRes">▶ Weiter</button><button class="btn" data-nav id="pRad">📻 Radio & Podcast</button><button class="btn" data-nav id="pSet">⚙️ Einstellungen</button><button class="btn" data-nav id="pCtl">🎮 Steuerung</button>' +
      (canRestart ? '<button class="btn" data-nav id="pRe">↻ Neu starten</button>' : '') + '<button class="btn" data-nav id="pMenu">🏙️ Zur Stadt & Gesamtmenü</button><p class="hint">💡 ' + U.pick(D.TIPS) + '</p></div>', { back: resume, pauseCloses: true });
    function resume() { UI.close(s); G.paused = false; }
    const b = id => s.el.querySelector('#' + id);
    b('pRes').onclick = resume; b('pRad').onclick = () => UI.radio(); b('pSet').onclick = settings; b('pCtl').onclick = controls;
    if (b('pRe')) b('pRe').onclick = () => { const st = AMC.Play.state(); resume(); startCity(st.mode, st.ch); };
    b('pMenu').onclick = () => UI.confirm(G.net ? 'Koop-Spiel verlassen? Die Verbindung wird getrennt.' : 'Zurück in die Stadt? Der Fortschritt in diesem Level geht verloren.', () => { if (G.net) AMC.Net.close(); hub(); setTimeout(mainMenu, 400); });
  }

  G.pause = () => { if (!G.paused && /^(play|show|quiz|arcade)$/.test(G.mode)) pause(); };
  // ------------------------------------------------------------------ Spielschleife
  let last = performance.now(), slow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now; if (dt > 0.1) dt = 0.1;
    if (W.perf) W.perf(dt);
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
        else if (G.net) { const h = I.hit, mv = { x: I.move.x, y: I.move.y }, sp = I.sprint; I.hit = () => false; I.move.x = I.move.y = 0; I.sprint = false; try { AMC.Play.update(dt); } finally { I.hit = h; I.move.x = mv.x; I.move.y = mv.y; I.sprint = sp; } }
        else if (W.particles) W.particles.update(0);
        AMC.Play.render();
      } else if (G.mode === 'show') {
        if (!uiBusy && I.hit('pause') && !(AMC.Show.state() && AMC.Show.state().menu !== 'root' && AMC.Show.state().phase === 'menu')) pause();
        if (!G.paused && !uiBusy) AMC.Show.update(dt); else AMC.Studio.update(dt * 0.3);
        AMC.Show.render();
      } else if (G.mode === 'quiz') {
        if (!uiBusy && I.hit('pause')) pause();
        if (!G.paused && !uiBusy) AMC.Quiz.update(dt);
        AMC.Quiz.render();
      } else if (G.mode === 'arcade') {
        if (!uiBusy && I.hit('pause')) pause();
        if (!G.paused && !uiBusy) AMC.Arcade.update(dt);
        AMC.Arcade.render();
      } else if (G.mode === 'home') {
        if (!uiBusy) AMC.Home.update(dt);
        AMC.Home.render();
      } else if (G.mode === 'edit') {
        if (!uiBusy) AMC.StudioEdit.update(dt);
        AMC.Studio.update(dt); AMC.Studio.render();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused && !UI.isOpen() && !G.net) pause(); });

  boot();
})(typeof window !== 'undefined' ? window : globalThis);

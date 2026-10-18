/* AnMaCha UNDERCOVER 3D – Spielsteuerung: verbindet Menüs, Spielkern, Netz, 3D-Welt, Oberfläche, Eingabe und Ton.
   Solo und Online-Gastgeber nutzen dieselbe Gastgeber-Logik (AMU.Net.Host): Solo ist ein Raum ohne Verbindungen.
   Gäste bekommen nur ihre eigene, geschwärzte Sicht und schicken Eingaben/Aktionen (AMU.Net.Client). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const UI = () => AMU.UI;
  const esc = s => AMU.U.esc(s);
  const BAD = /\b(arschloch|wichser|hurensohn|fotze|missgeburt|spast|schlampe|nazi|fick\w*)\b/gi;
  const filter = t => String(t).replace(BAD, m => '*'.repeat(m.length)).replace(/https?:\/\/\S+/gi, '[Link]');

  let settings = null, input = null, touch = null, world = null, worldOk = null, hudEl = null;
  let G = null;            // laufende Partie
  let net = null;          // Online-Sitzung (AMU.Online)
  let lobbySt = null;      // Lobby-Zustand für die Anzeige
  let menuMode = true, typing = false, lastT = 0, raf = 0, camMode = 'follow', zoom = 1;

  // ---------------- Grundlagen ----------------
  function webgl() { if (worldOk == null) worldOk = !!(AMU.World && AMU.World.supported && AMU.World.supported() && root.THREE); return worldOk; }
  function lang() { return (AMU.Save.profile().lang) || 'de'; }
  function lastSettings() { return AMU.cleanSettings(settings.last || {}, null); }
  function saveLastSettings(s) { settings.last = s; AMU.Save.saveSettings(settings); }
  function profile() {
    const p = AMU.Save.profile();
    if (!p.look && AMU.COSMETICS) { p.look = AMU.COSMETICS.randomLook(AMU.RNG(Date.now() % 1e9)); AMU.Save.saveProfile(p); }
    if (!p.name) p.name = 'Funker' + (100 + (Date.now() % 900));
    return p;
  }
  function setMenuMode(on) {
    menuMode = on;
    if (input) input.setMode(on ? 'menu' : (typing ? 'text' : 'game'));
    if (touch) touch.show(!on && !!G && G.kind === 'sim');
    if (on && AMU.Audio) AMU.Audio.music(G ? null : 'menu');
  }
  function ensureWorld() {
    if (world || !webgl()) return world;
    try {
      const cv = document.getElementById('view');
      world = AMU.World.create(cv, { quality: settings.quality });
      world.resize(root.innerWidth, root.innerHeight);
      world.setZoom && world.setZoom(settings.zoom || 1);
      world.onContextLost && world.onContextLost(() => UI().toast('3D-Grafik kurz weg – wird neu aufgebaut …', 'warn'));
      world.onContextRestored && world.onContextRestored(() => { if (G && G.kind === 'sim' && G.view) world.loadMap(G.view.map); });
    } catch (e) { console.warn('3D nicht verfügbar', e); world = null; worldOk = false; }
    return world;
  }

  // ---------------- Eingabe ----------------
  function onAction(name, phase) {
    if (phase !== 'down') { if (name === 'sprint' && G) { /* Sprint ist ein Tippen */ } return; }
    if (AMU.Audio) AMU.Audio.unlock();
    if (name === 'back') {
      const m = UI().topModal(); if (m) { m.close(); return; }
      if (G && G.taskUI) { G.taskUI.close(); return; }
      const b = document.querySelector('.ui-screen [data-a="back"], .ui-screen [data-a="leave"]'); if (b) b.click();
      return;
    }
    if (!G) return;
    if (name === 'menu') return pauseMenu();
    if (UI().topModal()) return;
    const v = G.view; if (!v) return;
    if (G.kind === 'word' || v.phase === 'meeting') {
      if (name === 'chat' && G.ui && G.ui.focusChat) G.ui.focusChat();
      if (name === 'quick' && G.ui && G.ui.quickMenu) G.ui.quickMenu();
      return;
    }
    if (v.phase !== 'play' && v.phase !== 'intro') return;
    const ctx = G.ctx || {};
    const send = a => G.send(a).then(r => onRes(a, r));
    switch (name) {
      case 'use': if (ctx.use) send({ a: 'use', what: ctx.use.what }); else UI().toast('Hier gibt es nichts zu tun.', 'info', 1400); break;
      case 'report': if (ctx.report && !ctx.report.off) send(ctx.report.act); break;
      case 'special': if (ctx.special && ctx.special.act) send(ctx.special.act); break;
      case 'vent': if (ctx.vent) send({ a: 'vent' }); break;
      case 'sab': if (ctx.sab) AMU.HUD.sabMenu(v, a => send(a)); break;
      case 'ability': if (ctx.ability && ctx.ability.act) send(ctx.ability.act); break;
      case 'sprint': if (ctx.sprint) send({ a: 'sprint' }); break;
      case 'map': AMU.HUD.openMap(v); break;
      case 'tasks': G.hud && G.hud.toggleTasks(); break;
      case 'cam': camMode = camMode === 'follow' ? 'overview' : 'follow'; UI().toast(camMode === 'follow' ? '🎥 Kamera folgt dir' : '🎥 Übersicht', 'info', 1200); break;
      case 'zoomIn': setZoom(zoom + 0.1); break;
      case 'zoomOut': setZoom(zoom - 0.1); break;
    }
  }
  function setZoom(z) { zoom = Math.max(0.7, Math.min(1.6, Math.round(z * 10) / 10)); if (world && world.setZoom) world.setZoom(zoom); settings.zoom = zoom; AMU.Save.saveSettings(settings); }
  const WHY = { abklingzeit: 'Noch nicht bereit (Abklingzeit).', 'zu weit': 'Zu weit weg.', ziel: 'Kein gültiges Ziel.', 'keine Aufgabe hier': 'Hier ist keine deiner Aufgaben.',
    'Notruf gesperrt während Sendeausfall': 'Notruf gesperrt während des Sendeausfalls!', 'Notrufpult lädt noch': 'Das Notrufpult lädt noch.', 'keine Notrufe mehr': 'Du hast keine Notrufe mehr.',
    'schon aktiv': 'Diese Sabotage läuft schon.', gestört: 'Gestört – warte kurz.', erschöpft: 'Zu erschöpft zum Sprinten.', 'Schutzzone am Käfig': 'Am Käfig darf nicht gefangen werden.' };
  function onRes(a, r) {
    if (!r) return;
    if (!r.ok) { if (r.why && r.why !== 'beschäftigt') UI().toast(WHY[r.why] || ('Geht nicht: ' + r.why), 'bad', 1800); if (AMU.Audio) AMU.Audio.sfx('bad'); return; }
    const d = r.data || {};
    if (d.cams && G) AMU.HUD.cams(d.cams, AMU.HUD.names(G.view));
    if (d.res) UI().toast('🔍 Prüfung: ' + d.res, d.res === 'verdächtig' ? 'bad' : 'good', 4000);
    if (a.a === 'kill' && AMU.Audio) AMU.Audio.sfx('kill');
    if (a.a === 'vent' && AMU.Audio) AMU.Audio.sfx('vent');
    if (d.blocked) UI().toast('🛡️ Der Angriff prallte am Schutzschild ab!', 'warn');
  }

  // ---------------- Partie ----------------
  /** G: { role: 'solo'|'host'|'guest', kind, meId, host?, client?, view, send(a) → Promise } */
  function beginGame(role, startInfo) {
    const host = role === 'guest' ? null : (role === 'solo' ? G && G.host : net.host);
    const kind = startInfo ? startInfo.kind : host.kind;
    const meId = role === 'guest' ? net.client.id : 'h';
    const g = { role, kind, meId, host, client: role === 'guest' ? net.client : null, view: null, ui: null, hud: null, paused: false, results: false, pending: {}, startedAt: Date.now(), settings: startInfo ? startInfo.settings : host.settings };
    g.send = a => {
      if (role !== 'guest') {
        const game = g.host.game; if (!game) return Promise.resolve({ ok: false, why: 'kein Spiel' });
        const clean = AMU.Net.cleanAct(a, g.kind); if (!clean) return Promise.resolve({ ok: false, why: 'aktion' });
        return Promise.resolve(game.act(meId, clean) || { ok: false });
      }
      return new Promise(res => {
        (g.pending[a.a] = g.pending[a.a] || []).push(res);
        net.client.act(a);
        setTimeout(() => { const q = g.pending[a.a]; const i = q ? q.indexOf(res) : -1; if (i >= 0) { q.splice(i, 1); res({ ok: false, why: 'keine Antwort' }); } }, 5000);
      });
    };
    G = g;
    UI().closeModals(); UI().clearScreen();
    if (AMU.Audio) AMU.Audio.music(kind === 'word' ? 'lounge' : 'play');
    const w = ensureWorld();
    const mode = AMU.modeById(g.settings.mode);
    if (kind === 'sim') {
      g.map = AMU.mapById(g.settings.map); g.grid = AMU.Grid.compile(g.map);
      if (w) { w.loadMap(g.map.id); }
      g.hud = AMU.HUD.create(hudEl, { onAction: h => onHud(h), touch, device: () => input ? input.lastDevice() : 'keyboard' });
    } else if (w) w.loadLounge();
    setMenuMode(false);
    if (AMU.Help && AMU.Help.tip) { const tip = AMU.Help.tip(mode.id); if (tip && !(AMU.Save.profile().tut || {})[mode.id]) { UI().toast(tip, 'info', 6000); const p = AMU.Save.profile(); p.tut[mode.id] = 1; AMU.Save.saveProfile(p); } }
    lastT = performance.now();
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function onHud(h) {
    if (h === 'menu') return pauseMenu();
    if (h === 'cancel') return G && G.send({ a: 'cancel' });
    if (h === 'role') return roleInfo();
    onAction(h, 'down');
  }
  function roleInfo() {
    if (!G || !G.view) return;
    const v = G.view, R = AMU.ROLES[v.me.role] || AMU.ROLES.crew, nm = AMU.HUD.names(v);
    UI().modal('<h3 class="ui-h2">' + R.icon + ' Du bist: ' + esc(R.n) + '</h3><p>' + esc(R.desc) + '</p>' + ((v.mates || []).length ? '<p>Dein Team: <b>' + v.mates.map(id => esc(nm[id])).join(', ') + '</b></p>' : '') +
      '<p class="ui-small ui-muted">' + esc(AMU.modeById(v.mode).win) + '</p>');
  }
  function endGame(msg, kind) {
    if (G && G.taskUI) { try { G.taskUI.close(); } catch (e) { /* zu */ } }
    if (G && G.hud) G.hud.destroy();
    if (G && G.host && G.role === 'solo') G.host.game = null;
    G = null;
    if (touch) touch.show(false);
    if (AMU.Audio) AMU.Audio.alarm(false);
    UI().closeModals();
    if (msg) UI().toast(msg, kind || 'warn', 5000);
  }
  function pauseMenu() {
    if (!G || UI().topModal()) return;
    const solo = G.role === 'solo';
    if (solo) G.paused = true;
    input && input.setMode('menu');
    const m = UI().modal('<h3 class="ui-h2">⏸ ' + (solo ? 'Pause' : 'Menü (das Spiel läuft weiter)') + '</h3><div class="amu-menu">' +
      '<button class="ui-btn ui-pri" data-a="go" autofocus>▶ Weiter</button>' +
      (G.kind === 'sim' ? '<button class="ui-btn" data-a="role">🎭 Meine Rolle</button><button class="ui-btn" data-a="map">🗺 Karte</button>' : '') +
      '<button class="ui-btn" data-a="help">📖 Anleitung</button><button class="ui-btn" data-a="settings">⚙ Einstellungen</button>' +
      '<button class="ui-btn ui-bad" data-a="quit">' + (G.role === 'host' ? '✕ Runde beenden (alle zurück in die Lobby)' : G.role === 'guest' ? '✕ Raum verlassen' : '✕ Runde aufgeben') + '</button></div>',
    { onClose: () => { if (G) { G.paused = false; setMenuMode(false); } }, on: (a, v, b, e, mm) => {
      if (a === 'go') mm.close();
      else if (a === 'role') { mm.close(); roleInfo(); }
      else if (a === 'map') { mm.close(); AMU.HUD.openMap(G.view); }
      else if (a === 'help') { mm.close(); AMU.Help && AMU.Help.open(G.settings.mode); }
      else if (a === 'settings') { mm.close(); openSettingsModal(); }
      else if (a === 'quit') UI().confirm(G.role === 'host' ? 'Runde für alle beenden?' : 'Wirklich aufhören?', 'Ja, beenden').then(ok => { if (!ok) return; mm.close(); quitGame(); });
    } });
    return m;
  }
  function quitGame() {
    if (!G) return;
    if (G.role === 'solo') { endGame(); AMU.Menus.main(); }
    else if (G.role === 'host') { endGame(); net.host.toLobby(); showLobby(); }
    else { leaveOnline(); AMU.Menus.main(); }
  }
  function openSettingsModal() {
    if (!AMU.SettingsUI) return;
    const back = () => { if (G) { UI().clearScreen(); G.ui = null; G.uiKey = null; setMenuMode(false); } else AMU.Menus.main(); };
    if (G && G.role === 'solo') G.paused = true;
    AMU.SettingsUI.open({ settings, input, onChange: s => applySettings(s), onBack: () => { if (G) G.paused = false; back(); } });
    setMenuMode(true);
  }
  function applySettings(s) {
    settings = Object.assign(settings, s);
    if (AMU.Audio) AMU.Audio.setVolumes({ master: settings.master, sfx: settings.sfx, music: settings.music });
    if (world && world.setQuality) world.setQuality(settings.quality);
    if (AMU.SettingsUI && AMU.SettingsUI.apply) AMU.SettingsUI.apply(settings);
  }

  // ---------------- Takt ----------------
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(250, now - lastT); lastT = now;
    if (!G) { if (world && world.idle) world.idle(dt / 1000); return; }
    const g = G;
    try {
      if (g.role !== 'guest') {
        const game = g.host.game;
        if (!game) return;
        if (g.kind === 'sim' && !g.paused) { const ax = axis(); game.setInput(g.meId, ax.x, ax.y); }
        if (!g.paused) g.host.tick(dt, Date.now());
        if (!G) return;
        const ev = game.drain(g.meId); if (ev.length) events(ev);
        g.view = game.viewFor(g.meId);
      } else if (g.kind === 'sim' && net && net.client) { const ax = axis(); net.client.input(ax.x, ax.y, Date.now()); }
      if (G === g && g.view) frame(g, dt);
    } catch (e) { console.error(e); if (!g.errShown) { g.errShown = true; UI().toast('Fehler im Spielablauf: ' + (e.message || e), 'bad', 6000); } }
  }
  function axis() {
    if (!input || menuMode || typing || UI().topModal() || (G && G.taskUI)) return { x: 0, y: 0 };
    return input.axis();
  }
  function frame(g, dt) {
    const v = g.view;
    if (world && v.roster) { const rk = v.roster.map(r => r.id + (r.n || '')).join('|'); if (rk !== g.rosterKey) { g.rosterKey = rk; world.setRoster(v.roster); } }
    if (v.result && !g.results) { showResults(g); return; }
    if (g.results) { if (world) renderIdle(g, v, dt); return; }
    if (g.kind === 'word') {
      if (g.uiKey !== 'word') { g.ui = AMU.WordUI.open({ send: g.send, view: v, onMenu: pauseMenu, onTyping: setTyping }); g.uiKey = 'word'; }
      else if (v !== g.lastV) g.ui.update(v);
      if (world) world.updateLounge(loungeState(v), dt / 1000);
      g.lastV = v; return;
    }
    // Missionsmodi
    if (v.phase === 'meeting') {
      if (g.uiKey !== 'meeting') {
        if (g.taskUI) { g.taskUI.close(); g.taskUI = null; }
        UI().closeModals();
        g.ui = AMU.MeetingUI.open({ send: g.send, view: v, onMenu: pauseMenu, onTyping: setTyping }); g.uiKey = 'meeting';
        if (world) world.loadLounge(v.map);
        g.hud.el.hidden = true; if (touch) touch.show(false);
        if (AMU.Audio) AMU.Audio.music('meeting');
      } else if (v !== g.lastV) g.ui.update(v);
      if (world) world.updateLounge(loungeState(v), dt / 1000);
      g.lastV = v; return;
    }
    if (g.uiKey === 'meeting') {
      UI().clearScreen(); g.ui = null; g.uiKey = null; g.hud.el.hidden = false;
      if (world) world.loadMap(v.map);
      if (touch && !menuMode) touch.show(true);
      if (AMU.Audio) AMU.Audio.music('play');
    }
    if (v.phase === 'intro' && g.uiKey !== 'intro') { showIntro(v); g.uiKey = 'intro'; }
    if (v.phase === 'play' && g.uiKey === 'intro') { UI().clearScreen(); g.uiKey = null; }
    g.ctx = AMU.HUD.context(v, g.grid);
    g.hud.update(v, g.ctx);
    taskWindow(g, v);
    if (world) world.update(v, dt / 1000, { meId: g.meId, cam: camMode, camAxis: input ? input.camAxis() : null });
    g.lastV = v;
  }
  function renderIdle(g, v, dt) { if (g.kind === 'word' || v.phase === 'meeting') world.updateLounge(loungeState(v), dt / 1000); else world.update(v, dt / 1000, { meId: g.meId, cam: 'overview' }); }
  function loungeState(v) {
    if (v.kind === 'word') {
      const out = v.roster.filter(r => r.out).map(r => r.id);
      return { seats: v.roster.map(r => r.id), speaker: v.turn, out, dead: [], highlight: v.guess ? v.guess.id : null, phase: v.phase };
    }
    const m = v.meeting || {}, alive = new Set(m.alive || []);
    const last = (m.chat || [])[m.chat ? m.chat.length - 1 : 0];
    return { seats: v.roster.map(r => r.id), speaker: last && v.t - last.t < 2500 ? last.pid : null, out: [], dead: v.roster.filter(r => !alive.has(r.id)).map(r => r.id), highlight: m.result && m.result.ejected, phase: m.phase };
  }
  function setTyping(on) { typing = on; if (input) input.setMode(on ? 'text' : (menuMode ? 'menu' : 'game')); }
  function showIntro(v) {
    const R = AMU.ROLES[v.me.role] || AMU.ROLES.crew, nm = AMU.HUD.names(v), mode = AMU.modeById(v.mode);
    UI().screen('<div class="amu-intro ' + (R.team === 'traitor' || R.team === 'hunter' ? 'bad' : '') + '"><p class="ui-muted">' + mode.icon + ' ' + esc(mode.n) + ' · ' + esc(AMU.mapById(v.map).n) + '</p>' +
      '<div class="amu-introrole">' + R.icon + '</div><h2 class="ui-h1">Du bist <span>' + esc(R.n) + '</span></h2><p>' + esc(R.desc) + '</p>' +
      ((v.mates || []).length ? '<p>Dein Team: <b>' + v.mates.map(id => esc(nm[id])).join(', ') + '</b></p>' : '') +
      (v.ext && v.ext.case ? '<p class="ui-card"><b>' + esc(v.ext.case.n) + '</b><br>' + esc(v.ext.case.intro) + '</p>' : '') +
      '<p class="ui-small ui-muted">Geheim! Nur du siehst deine Rolle.</p></div>', { key: 'intro', cls: 'clear amu-introscr', focus: false });
    if (AMU.Audio) AMU.Audio.sfx('reveal');
  }
  /** Minispiel-Fenster öffnen, wenn der Kern eine Aufgabe/Reparatur gestartet hat (me.busy) */
  function taskWindow(g, v) {
    const b = v.me.busy;
    const want = b && (b.kind === 'task' || b.kind === 'repair') && b.t ? b.kind + ':' + b.t + ':' + b.seed : null;
    if (g.taskKey && g.taskKey !== want) { if (g.taskUI) { const t = g.taskUI; g.taskUI = null; try { t.close(); } catch (e) { /* zu */ } } g.taskKey = null; input && input.setMode(menuMode ? 'menu' : 'game'); }
    if (!want || g.taskKey === want) return;
    g.taskKey = want;
    const wrap = document.createElement('div'); wrap.className = 'amu-taskwrap'; document.body.appendChild(wrap);
    input && input.setMode('task');
    let ui = null;
    const close = () => { wrap.remove(); };
    try {
      ui = AMU.TaskUI.open(b.t, { container: wrap, seed: b.seed, diff: b.diff, lang: lang(), sfx: n => AMU.Audio && AMU.Audio.sfx(n),
        onDone: acts => { g.send({ a: 'task_done', acts }).then(r => { if (r && r.ok) { AMU.Audio && AMU.Audio.sfx('done'); UI().toast(b.kind === 'repair' ? '🔧 Repariert!' : '✔ Aufgabe erledigt', 'good', 1500); } else UI().toast('Aufgabe wurde nicht angenommen (' + ((r && r.why) || '?') + ').', 'bad'); }); },
        onCancel: () => { g.send({ a: 'cancel' }); } });
    } catch (e) { console.error(e); g.send({ a: 'cancel' }); }
    g.taskUI = { close() { try { ui && ui.close(); } catch (e) { /* zu */ } close(); if (G && G.taskKey) { /* Kern meldet Ende */ } } };
  }

  // ---------------- Ereignisse ----------------
  function events(list) {
    const g = G; if (!g) return;
    const v = g.view, nm = v ? AMU.HUD.names(v) : {}, A = AMU.Audio, T = (t, k, ms) => UI().toast(t, k, ms);
    list.forEach(e => {
      switch (e.type) {
        case 'meeting': A && A.sfx('meeting'); A && A.alarm(false); break;
        case 'eject': case 'ejected': A && A.sfx('eject'); break;
        case 'you_out': T('💥 Du wurdest ausgeknipst! Als Geist kannst du weiter Aufgaben erledigen.', 'bad', 5000); A && A.sfx('lose'); break;
        case 'down': if (e.id !== g.meId) A && A.sfx('kill'); break;
        case 'saw': if (e.kind === 'kill') T('👀 Du hast gesehen, wie ' + (nm[e.who] || '?') + ' jemanden ausgeknipst hat!', 'bad', 5000); else if (e.kind === 'vent') T('👀 ' + (nm[e.who] || '?') + ' ist in einem Geheimgang verschwunden!', 'warn', 4500); else if (e.kind === 'attack') T('👀 ' + (nm[e.who] || '?') + ' hat ' + (nm[e.target] || '?') + ' angegriffen!', 'bad', 4500); break;
        case 'sab': A && A.sfx('sab'); T('⚠ Sabotage: ' + ({ lights: 'Licht aus', comms: 'Funkstille – Karte gestört', crit: 'Sendeausfall – schnell an beiden Stationen reparieren!', mixer: 'Mischpult zerstört', tower: 'Sendeturm defekt', doors: 'Türen verriegelt' }[e.sab] || ''), e.sab === 'crit' ? 'bad' : 'warn', 3000); break;
        case 'fixed': A && A.sfx('repair'); T('🔧 Behoben: ' + ({ lights: 'Licht', comms: 'Funk', crit: 'Sendeausfall', mixer: 'Mischpult', tower: 'Sendeturm', doors: 'Türen' }[e.sab] || ''), 'good', 1800); break;
        case 'repair_lost': T('⏱ Zu langsam – beide Stationen müssen fast gleichzeitig repariert werden!', 'warn', 3000); break;
        case 'task': A && A.sfx('done'); break;
        case 'shield_hit': T('🛡️ Ein Angriff prallte am Schutzschild ab!', 'warn', 4000); break;
        case 'shielded': T('🛡️ ' + (nm[e.target] || '?') + ' ist jetzt geschützt.', 'good'); break;
        case 'shifted': T('🦎 Verwandelt in ' + (nm[e.as] || '?'), 'info'); break;
        case 'jammed': T('📡 Du wirst gestört!', 'warn'); break;
        case 'jam_done': T('📡 ' + e.n + ' Person(en) gestört.', 'info'); break;
        case 'scan': T('🔍 ' + (nm[e.target] || '?') + ' wirkt ' + e.res + ' (noch ' + e.left + ' Prüfungen)', e.res === 'verdächtig' ? 'bad' : 'good', 5000); break;
        case 'clue': if (e.clue) { T('🗂 Neue Spur in der Fallakte!', 'good'); A && A.sfx('clue'); } break;
        case 'tampered': T('🧤 Spur manipuliert (noch ' + e.left + ')', 'info'); break;
        case 'funkspruch': T('📻 Funkspruch: ' + (nm[e.id] || '?') + ' ist garantiert unschuldig!', 'good', 6000); break;
        case 'pkg': T('📦 Paket abgeholt – bring es zum Notrufpult.', 'info'); break;
        case 'beacon': A && A.sfx('beacon'); T('📶 Funkbake ' + e.n + '/' + e.need + ' aktiv', 'good', 2000); break;
        case 'exits_soon': T('🚪 Die Ausgänge öffnen in 15 Sekunden!', 'warn', 4000); break;
        case 'exits': T('🚪 Die Ausgänge sind offen – flieht!', 'good', 4000); A && A.sfx('good'); break;
        case 'caught': A && A.sfx('caught'); if (e.id === g.meId) T('🔒 Du wurdest gefangen! Warte auf Befreiung.', 'bad', 5000); break;
        case 'escaped': A && A.sfx('escape'); if (e.id === g.meId) T('🏃 Du bist entkommen!', 'good', 5000); break;
        case 'rescued': A && A.sfx('good'); T('🔓 Gefangene befreit!', 'good'); break;
        case 'pulse_warn': T('📡 Ein Jäger orten gleich alle Flüchtenden – versteck dich!', 'warn', 3000); break;
        case 'search_empty': T('Leer.', 'info', 1200); break;
        case 'notice': if (e.key === 'takeover') T('🤖 ' + (nm[e.id] || '?') + ' ist weg – ein Bot spielt weiter.', 'info'); else if (e.key === 'back') T('👋 ' + (nm[e.id] || '?') + ' ist zurück.', 'info'); break;
        case 'conn': if (!e.on && e.id !== g.meId) T('📶 ' + (nm[e.id] || '?') + ' hat die Verbindung verloren.', 'warn'); break;
        case 'lift': A && A.sfx('door'); break;
        case 'turn': if (e.id === g.meId) { A && A.sfx('tick'); T('✍️ Du bist dran mit deinem Hinweis!', 'good', 2500); } break;
        case 'vote_open': A && A.sfx('vote'); break;
        case 'guess': T(e.ok ? '🎯 Richtig geraten!' : (e.timeout ? '⏱ Zeit abgelaufen.' : '❌ „' + e.text + '“ ist falsch.'), e.ok ? 'warn' : 'info', 3000); break;
        case 'extra_round': T('🔁 Zusatzrunde: noch ein Hinweis von allen!', 'info', 3000); break;
      }
    });
    // Alarm bei kritischer Sabotage
    if (g.kind === 'sim' && A) { const crit = v && v.sab && v.sab.list.some(s => s.type === 'crit'); if (crit !== g.alarm) { g.alarm = crit; A.alarm(!!crit); } }
  }

  // ---------------- Ergebnis ----------------
  function showResults(g) {
    g.results = true;
    const v = g.view, r = v.result, meId = g.meId;
    if (g.taskUI) { g.taskUI.close(); g.taskUI = null; }
    if (g.hud) g.hud.el.hidden = true; if (touch) touch.show(false);
    UI().closeModals(); if (AMU.Audio) { AMU.Audio.alarm(false); AMU.Audio.music(null); }
    const won = (r.winners || []).includes(meId);
    if (AMU.Audio) AMU.Audio.sfx(won ? 'win' : 'lose');
    let ach = { newAch: [] };
    try { if (AMU.Ach) { const me = (r.players || []).find(p => p.id === meId) || {}; ach = AMU.Ach.record({ kind: g.kind, mode: g.settings.mode, online: g.role !== 'solo', won, me: { id: meId, role: me.role, team: me.team, alive: me.alive, st: me.st }, result: r }) || ach; AMU.Ach.sync && AMU.Ach.sync(); } } catch (e) { console.warn(e); }
    if (g.kind === 'word' && r.word) try { AMU.Save.pushRecent(r.word); } catch (e) { /* egal */ }
    const W = { crew: 'Crew', traitor: 'Verräter', neutral: 'Trickser', hunter: 'Jäger', runner: 'Flüchtende', impostor: 'Imposter' };
    const winTeam = g.kind === 'word' ? (r.winner === 'crew' ? 'Die Wissenden' : 'Die Imposter') : (W[r.winner] || r.winner);
    const players = (r.players || []).map(p => {
      const R = g.kind === 'word' ? { icon: p.role === 'impostor' ? '🎭' : '🤫', n: p.role === 'impostor' ? 'Imposter' : 'Wissend' } : (AMU.ROLES[p.role] || { icon: '', n: p.role });
      const st = p.st || {}, w = (r.winners || []).includes(p.id);
      const info = g.kind === 'word' ? (st.clues ? st.clues + (st.clues === 1 ? ' Hinweis' : ' Hinweise') : '') + (p.ejected ? ' · rausgewählt' : '')
        : [st.tasks ? st.tasks + ' Aufgaben' : '', st.kills ? st.kills + '× ausgeknipst' : '', st.reports ? st.reports + '× gemeldet' : '', st.repairs ? st.repairs + ' Reparaturen' : '', st.clues ? st.clues + ' Spuren' : '', st.beacons ? st.beacons + ' Baken' : '', st.rescues ? st.rescues + ' Befreiungen' : '', p.escaped ? 'entkommen' : '', p.alive === false && !p.escaped ? 'raus' : ''].filter(Boolean).join(' · ');
      return '<li class="' + (w ? 'win' : '') + '"><span>' + AMU.UI.badge(p, p.id === meId ? ' <small>(du)</small>' : '') + ' <span class="ui-tag ' + (R.n === 'Verräter' || p.role === 'impostor' || p.team === 'traitor' ? 'bad' : '') + '">' + R.icon + ' ' + esc(R.n) + '</span>' + (p.bot ? ' <small class="ui-muted">🤖</small>' : '') + '</span><small>' + esc(info) + (w ? ' 🏆' : '') + '</small></li>';
    }).join('');
    const extra = g.kind === 'word' ? '<p>Das Wort war: <b class="amu-word">' + esc(r.word) + '</b> (' + esc(r.cat) + ')' + (r.alt ? ' · Imposter-Wort: <b>' + esc(r.alt) + '</b>' : '') + '</p>'
      : '<p class="ui-small ui-muted">Dauer ' + AMU.U.fmtTime(r.dur || 0) + (r.stats ? ' · ' + (r.stats.meetings || 0) + ' Besprechungen · ' + (r.stats.taskDone || 0) + '/' + (r.stats.taskTotal || 0) + ' Aufgaben' : '') + '</p>';
    const btns = g.role === 'solo' ? '<button class="ui-btn ui-big ui-pri" data-a="again" autofocus>🔁 Nochmal</button><button class="ui-btn" data-a="setup">⚙ Regeln ändern</button><button class="ui-btn" data-a="main">🏠 Hauptmenü</button>'
      : g.role === 'host' ? '<button class="ui-btn ui-big ui-pri" data-a="lobby" autofocus>🔁 Zurück in die Lobby</button><button class="ui-btn" data-a="close">✕ Raum schließen</button>'
        : '<p class="ui-muted">Der Gastgeber bringt alle zurück in die Lobby.</p><button class="ui-btn" data-a="leave">✕ Raum verlassen</button>';
    UI().screen('<div class="ui-wrap amu-res"><div class="ui-card amu-reshead ' + (won ? 'ok' : 'bad') + '"><h2 class="ui-h1">' + (won ? '🏆 Gewonnen!' : '😵 Verloren') + '</h2><p><b>' + esc(winTeam) + '</b> gewinnen: ' + esc(r.reason || '') + '</p>' + extra + '</div>' +
      (ach.newAch && ach.newAch.length ? '<div class="ui-card"><h3 class="ui-h2">🏅 Neue Erfolge</h3>' + ach.newAch.map(a => '<p>' + a.icon + ' <b>' + esc(a.title) + '</b> – ' + esc(a.desc) + '</p>').join('') + '</div>' : '') +
      '<div class="ui-card"><h3 class="ui-h2">Alle Rollen</h3><ul class="ui-list amu-reslist">' + players + '</ul></div><div class="ui-row">' + btns + '</div></div>',
    { key: 'results', on: a => {
      if (a === 'again') { const s = g.settings; endGame(); startSolo(s, g.wish || null); }
      else if (a === 'setup') { endGame(); AMU.Menus.soloSetup(); }
      else if (a === 'main') { endGame(); AMU.Menus.main(); }
      else if (a === 'lobby') { endGame(); net.host.toLobby(); showLobby(); }
      else if (a === 'close' || a === 'leave') { leaveOnline(); AMU.Menus.main(); }
    } });
    menuMode = true; input && input.setMode('menu');
  }

  // ---------------- Solo ----------------
  function startSolo(s, wish) {
    s = AMU.cleanSettings(s, null);
    const p = profile();
    const host = new AMU.Net.Host({ settings: s, hostPlayer: { name: p.name, look: p.look }, max: 12 });
    host.fillBots();
    const r = host.start((Math.random() * 1e9) | 0, { filter, recent: AMU.Save.recentWords(), wish: wish ? { pid: 'h', role: wish } : null });
    if (!r.ok) { UI().toast('Start nicht möglich: ' + r.why, 'bad'); return; }
    G = { host };
    beginGame('solo');
    G.wish = wish;
  }

  // ---------------- Online ----------------
  function leaveOnline() {
    if (G) endGame();
    if (net) { try { net.close(); } catch (e) { /* zu */ } }
    if (lobbySt && lobbySt.code && AMU.PublicRooms) AMU.PublicRooms.unpublish(lobbySt.code);
    net = null; lobbySt = null;
  }
  function connecting(text, retry) {
    UI().screen('<div class="ui-wrap"><div class="ui-card"><p>' + esc(text) + '</p><div class="ui-row">' + (retry ? '<button class="ui-btn ui-pri" data-a="retry">🔄 Nochmal versuchen</button>' : '') + '<button class="ui-btn" data-a="back">← Zurück</button></div></div></div>',
      { key: 'connecting', on: a => { if (a === 'back') { leaveOnline(); AMU.Menus.main(); } else if (a === 'retry' && retry) retry(); } });
    setMenuMode(true);
  }
  function hostOnline(s, roomName) {
    leaveOnline();
    const p = profile();
    connecting('🌐 Raum wird erstellt …');
    lobbySt = { role: 'host', lobby: null, meId: 'h', code: null, url: null, qr: null, public: { state: 'unknown', on: false }, roomName };
    net = AMU.Online.host({ name: p.name, look: p.look, settings: s, on: (k, d) => {
      if (k === 'open') {
        Object.assign(lobbySt, { code: d.code, url: d.url, qr: d.qr, lobby: net.host.lobbyState() }); showLobby();
        if (AMU.PublicRooms) AMU.PublicRooms.check().then(st => { if (!lobbySt) return; lobbySt.public.state = st; refreshLobby(); });
      } else if (k === 'lobby') { if (lobbySt) { lobbySt.lobby = d; pubUpdate(); refreshLobby(); } }
      else if (k === 'start') beginGame('host');
      else if (k === 'error') { connecting(d.text, d.retry ? () => hostOnline(s, roomName) : null); }
    } });
  }
  function pubUpdate() {
    const L = lobbySt && lobbySt.lobby; if (!L || !lobbySt.public.on || !AMU.PublicRooms) return;
    AMU.PublicRooms.update({ n: lobbySt.roomName, m: L.settings.mode, c: L.players.filter(p => !p.bot).length, x: L.settings.players });
  }
  function refreshLobby() { if (!G && UI().screenKey() === 'lobby') showLobby(); }
  function showLobby() {
    if (!lobbySt) return AMU.Menus.main();
    if (lobbySt.role === 'host' && net && net.host) lobbySt.lobby = net.host.lobbyState();
    AMU.Menus.keepScroll(() => AMU.Menus.lobby(lobbySt, lobbyAction));
    setMenuMode(true);
  }
  function lobbyAction(a, v) {
    const host = lobbySt.role === 'host' ? net.host : null;
    if (a === 'leave') { UI().confirm('Raum verlassen?', 'Ja, verlassen').then(ok => { if (ok) { leaveOnline(); AMU.Menus.main(); } }); }
    else if (a === 'copy') { const u = lobbySt.url || AMU.Online.shareUrl(lobbySt.code); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => UI().toast('📋 Link kopiert', 'good'), () => UI().modal('<p>Link zum Kopieren:</p><input type="text" readonly value="' + esc(u) + '">')); }
    else if (a === 'share') { navigator.share && navigator.share({ title: 'AnMaCha UNDERCOVER 3D', text: 'Spiel mit! Raumcode ' + lobbySt.code, url: lobbySt.url }).catch(() => {}); }
    else if (a === 'kick' && host) host.kick(v);
    else if (a === 'settings' && host) host.setSettings(v);
    else if (a === 'public' && host) {
      lobbySt.public.on = v;
      if (v) { const L = host.lobbyState(); AMU.PublicRooms.publish(lobbySt.code, { n: lobbySt.roomName, m: L.settings.mode, c: L.players.filter(p => !p.bot).length, x: L.settings.players }).then(ok => { if (!ok) { lobbySt.public.on = false; lobbySt.public.state = AMU.PublicRooms.state(); UI().toast(lobbySt.public.state === 'locked' ? '🔒 Öffentliche Räume: Freischaltung erforderlich.' : 'Konnte den Raum nicht öffentlich listen.', 'bad'); } refreshLobby(); }); }
      else AMU.PublicRooms.unpublish(lobbySt.code);
      refreshLobby();
    } else if (a === 'start' && host) {
      const r = host.start((Math.random() * 1e9) | 0, { filter, recent: AMU.Save.recentWords() });
      if (!r.ok) UI().toast('Start nicht möglich: ' + r.why, 'bad');
      else if (lobbySt.public.on) { lobbySt.public.on = false; AMU.PublicRooms.unpublish(lobbySt.code); }
    } else if (a === 'ready' && net.client) { const me = (lobbySt.lobby.players || []).find(p => p.id === lobbySt.meId); net.client.ready(!(me && me.ready)); }
    else if (a === 'editor') openEditor(showLobby);
  }
  function joinOnline(code, isRetry) {
    leaveOnline();
    const p = profile();
    connecting('🔗 Verbinde mit Raum ' + code + ' …');
    lobbySt = { role: 'guest', lobby: null, meId: null, code };
    net = AMU.Online.join(code, { name: p.name, look: p.look, on: (k, d) => {
      const g = G;
      if (k === 'welcome') { lobbySt.meId = d.id; }
      else if (k === 'lobby') { lobbySt.lobby = d; lobbySt.meId = net.client.id; if (g) endGame(); if (!d.running) { if (UI().screenKey() !== 'lobby') showLobby(); else refreshLobby(); } }
      else if (k === 'start') beginGame('guest', d);
      else if (k === 'view') { if (G) G.view = d; }
      else if (k === 'ev') { if (G) events(d); }
      else if (k === 'res') { if (G && d) { const q = G.pending[d.a]; const res = q && q.shift(); if (res) res({ ok: !!d.ok, why: d.why, data: d.data }); } }
      else if (k === 'kick') { const why = { voll: 'Der Raum ist voll.', 'läuft': 'In diesem Raum läuft gerade eine Runde. Versuche es nach der Runde erneut.', version: 'Andere Spielversion – bitte Seite neu laden.', entfernt: 'Der Gastgeber hat dich entfernt.', anderswo: 'Du bist auf einem anderen Gerät verbunden.' }[d && d.why] || 'Verbindung beendet.'; leaveOnline(); connecting(why, d && d.why === 'läuft' ? () => joinOnline(code) : null); }
      else if (k === 'end') { leaveOnline(); connecting('🏁 Der Gastgeber hat den Raum geschlossen. Die Runde endet ohne Sieger.', null); }
      else if (k === 'lost') { const wasGame = !!G; leaveOnline(); connecting((wasGame ? '📶 Verbindung zum Gastgeber verloren. Die Runde endet ohne Sieger für dich. ' : '📶 Verbindung verloren. ') + 'Du kannst es erneut versuchen – du bekommst deinen Platz zurück, solange der Raum läuft.', () => joinOnline(code, true)); }
      else if (k === 'error') connecting(d.text, d.retry ? () => joinOnline(code, true) : null);
    } });
  }

  // ---------------- Editor / Einstellungen ----------------
  function openEditor(back) {
    if (!AMU.Editor) { UI().toast('Editor nicht geladen.', 'bad'); return; }
    const p = profile();
    AMU.Editor.open({ look: p.look, name: p.name, quality: settings.quality, onSave: (look, name) => {
      const q = AMU.Save.profile(); q.look = look; if (name) q.name = AMU.U.cleanName(name, 16); AMU.Save.saveProfile(q);
      if (net && net.client) net.client.look(q.name, q.look);
      if (net && net.host && !net.host.game) { const h = net.host.players.find(x => x.host); if (h) { h.look = look; h.name = q.name || h.name; net.host.broadcastLobby(); } }
    }, onClose: () => { if (back) back(); } });
  }
  function openSettings(back) {
    if (!AMU.SettingsUI) { UI().toast('Einstellungen nicht geladen.', 'bad'); return; }
    AMU.SettingsUI.open({ settings, input, onChange: s => applySettings(s), onBack: back || AMU.Menus.main });
  }

  // ---------------- Start ----------------
  function init() {
    UI().init();
    hudEl = document.getElementById('hud');
    settings = AMU.Save.settings();
    zoom = settings.zoom || 1;
    if (AMU.SettingsUI && AMU.SettingsUI.apply) AMU.SettingsUI.apply(settings);
    if (AMU.Audio) AMU.Audio.setVolumes({ master: settings.master, sfx: settings.sfx, music: settings.music });
    if (AMU.Input) input = AMU.Input.create({ keys: settings.keys, onAction, onDevice: () => { if (G && G.hud && G.view) G.hud.update(G.view, G.ctx || {}, true); } });
    if (AMU.Touch && AMU.Touch.isTouch()) { touch = AMU.Touch.create(document.getElementById('touch'), {}); if (input) input.attachTouch(touch); touch.show(false); }
    root.addEventListener('resize', () => { if (world) world.resize(root.innerWidth, root.innerHeight); });
    root.addEventListener('beforeunload', () => { if (net) try { net.close(); } catch (e) { /* zu */ } });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.role === 'solo' && !UI().topModal()) pauseMenu(); });
    const q = new URLSearchParams(location.search), join = AMU.Net.normCode(q.get('join') || '');
    if (AMU.Net.validCode(join)) { history.replaceState(null, '', location.pathname); joinOnline(join); }
    else AMU.Menus.main();
    raf = requestAnimationFrame(loop);
  }

  AMU.App = { init, webgl, lang, setMenuMode, lastSettings, saveLastSettings, startSolo, hostOnline, joinOnline, leaveOnline, openSettings, openEditor, filter,
    state: () => ({ inGame: !!G, kind: G && G.kind, role: G && G.role, phase: G && G.view && (G.view.phase), view: G && G.view, menu: menuMode }),
    _game: () => G };
})(typeof window !== 'undefined' ? window : globalThis);

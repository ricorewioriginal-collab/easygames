/* Mahjong 3D – Ablauf: Start, Spielarten, Züge, Sieg, Speichern. */
(function (root) {
  'use strict';
  const E = root.MJEngine, L = root.MJLayouts, F = root.MJFaces, S = root.MJSave, A = root.MJAudio, U = root.MJUI;
  const $ = id => document.getElementById(id);
  let embedded = false; try { embedded = root.top !== root.self; } catch (e) { embedded = true; }

  const app = root.MJApp = {
    embedded, save: null, ui: null, R: null, game: null, mode: null, ref: null, def: null, layout: null,
    playing: false, paused: false, cursor: -1, hover: -1, hint: null, inputKind: 'mouse', atlasCanvas: null,
    blitz: null, timer: 0, lastAction: 0, zenTimer: 0
  };
  const MODE_THEME = { free: 'jade', daily: 'kaiser', blitz: 'drache', zen: 'lotus' };
  const MODE_NAME = { level: 'Reise', free: 'Freies Spiel', daily: 'Tagesrätsel', blitz: 'Zeitjagd', zen: 'Zen' };
  let C = null;   // Farben (nach dem Laden von THREE)

  app.sfx = (n, a) => A.play(n, a);
  app.lastInputKeys = () => app.inputKind === 'keys' || app.inputKind === 'pad';

  // ---------- Datum ----------
  app.dayKey = function (offset) {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + (offset || 0));
    return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  };
  app.today = () => app.dayKey(0);
  app.prevKey = function (key) {
    const d = new Date(+key.slice(0, 4), +key.slice(4, 6) - 1, +key.slice(6, 8), 12); d.setDate(d.getDate() - 1);
    return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  };

  // ---------- Freischaltung ----------
  app.worldOpen = function (w) {
    if (w <= 1) return true;
    return L.LEVELS.filter(l => l.world === w - 1).every(l => app.save.levelDone(l.id));
  };
  app.levelOpen = function (l) {
    if (l.index === 0) return app.worldOpen(l.world);
    return app.save.levelDone(L.LEVELS[l.n - 1].id);
  };
  app.describeCur = function (cur) {
    if (cur.mode === 'level') { const l = L.LEVEL_BY_ID[cur.ref]; return l ? 'Level ' + l.world + '-' + (l.index + 1) : 'Reise'; }
    if (cur.mode === 'free') { const lay = L.BY_ID[cur.layout]; return lay ? lay.name : 'Freies Spiel'; }
    return MODE_NAME[cur.mode] || 'Partie';
  };

  // ---------- Einstellungen anwenden ----------
  function quality() {
    const q = app.save.opt.quality;
    if (q !== 'auto') return q;
    const coarse = root.matchMedia && root.matchMedia('(pointer: coarse)').matches;
    const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
    if (mem <= 2 || cores <= 2) return 'sparsam';
    return coarse ? 'mittel' : 'hoch';
  }
  function buildAtlas() {
    const o = app.save.opt;
    app.atlasCanvas = F.build({ style: o.style, index: o.index });
    if (app.R) app.R.setAtlas(app.atlasCanvas);
  }
  function themeFor() {
    const o = app.save.opt;
    if (o.theme !== 'auto') return o.theme;
    if (app.mode === 'level' && app.def) return L.WORLDS[app.def.world - 1].theme;
    return MODE_THEME[app.mode] || 'jade';
  }
  app.setOpt = function (k, v) {
    app.save.setOpt(k, v);
    const o = app.save.opt;
    if (k === 'sfx') A.setSfx(o.sfx);
    else if (k === 'music') A.setMusic(o.music);
    else if (k === 'style' || k === 'index') buildAtlas();
    else if (k === 'dim' || k === 'showMatch') refreshTints();
    else if (k === 'theme') app.R.setTheme(themeFor());
    else if (k === 'back') app.R.setBack(o.back);
    else if (k === 'pitch') { app.R.setDefaultPitch(o.pitch || 24); if (app.game) app.R.resetView(); }
    else if (k === 'quality') app.R.setQuality(quality());
    else if (k === 'left') $('app').classList.toggle('lefty', !!o.left);
  };

  // ---------- Anzeige ----------
  function refreshTints() {
    const g = app.game, R = app.R; if (!g || !R.bodies) return;
    const o = app.save.opt, sel = g.selected, hint = app.hint;
    const selFace = sel >= 0 ? g.faces[sel] : -1;
    R.setTints(i => {
      if (!g.alive[i]) return null;
      if (i === sel) return C.gold;
      if (hint && (hint[0] === i || hint[1] === i)) return C.hint;
      const free = g.isFree(i);
      if (o.showMatch && sel >= 0 && free && E.matches(selFace, g.faces[i])) return C.match;
      if (i === app.hover && free) return C.hover;
      if (o.dim && !free) return C.dim;
      return null;
    }, i => (i === sel ? 0.1 : 0));
    if (app.cursor >= 0) R.setCursor(app.cursor);
  }
  function updateHud() {
    const g = app.game; if (!g) return;
    const moves = g.moves().length;
    $('hudLeft').textContent = g.remaining();
    $('hudMoves').textContent = moves;
    $('hudMovesBox').classList.toggle('warn', moves === 0 && !g.won());
    $('btnUndo').disabled = !g.canUndo();
    if (app.mode === 'blitz') {
      $('hudScore').textContent = app.blitz.score + g.score;
      $('hudTime').textContent = U.fmtTime(app.blitz.left);
      $('hudTimeBox').classList.toggle('warn', app.blitz.left <= 20);
    } else {
      $('hudScore').textContent = g.score;
      $('hudTime').textContent = U.fmtTime(g.time / 1000);
      $('hudTimeBox').classList.toggle('warn', false);
    }
  }
  function updateMargins() {
    if ($('hud').hidden) return;
    const t = document.querySelector('.hud-top').getBoundingClientRect(), b = $('hudBottom').getBoundingClientRect(), W = root.innerWidth, H = root.innerHeight;
    if (b.height > H * 0.5) {   // Knöpfe als Spalte (Handy quer)
      const right = b.left > W / 2;
      app.R.setMargins({ t: Math.round(t.bottom) + 4, b: 6, l: right ? 6 : Math.round(b.right) + 4, r: right ? Math.round(W - b.left) + 4 : 6 });
    } else app.R.setMargins({ t: Math.round(t.bottom) + 6, b: Math.round(H - b.top) + 4, l: 8, r: 8 });
  }
  function floater(text, x, y) {
    const el = document.createElement('div'); el.className = 'floater'; el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    $('floaters').appendChild(el); setTimeout(() => el.remove(), 950);
  }
  let comboT = 0;
  function showCombo(n) {
    const el = $('combo'); el.textContent = 'Kombo ×' + n + '!'; el.classList.add('on');
    clearTimeout(comboT); comboT = setTimeout(() => el.classList.remove('on'), 1000);
  }
  // Erfolge: nacheinander anzeigen
  const achQueue = []; let achBusy = false;
  function ach(id) {
    const a = app.save.unlock(id); if (!a) return;
    achQueue.push(a); if (!achBusy) nextAch();
  }
  function nextAch() {
    const a = achQueue.shift(); if (!a) { achBusy = false; return; }
    achBusy = true; app.ui.toast(a.icon + ' Erfolg: ' + a.title, 2600); A.play('star', 2);
    setTimeout(nextAch, 2900);
  }

  // ---------- Partie starten ----------
  function startGame(mode, cfg) {
    const layout = L.BY_ID[cfg.layout];
    if (!layout) { app.ui.toast('Layout nicht gefunden'); return false; }
    let game;
    try { game = new E.Game({ layout, seed: cfg.seed, solvable: cfg.solvable !== false, state: cfg.state }); }
    catch (e) { if (cfg.state) { app.save.d.cur = null; app.save.write(); app.ui.toast('Gespeicherte Partie war beschädigt – neue Partie.'); return startGame(mode, Object.assign({}, cfg, { state: null })); } throw e; }
    endTimer();
    app.mode = mode; app.ref = cfg.ref || null; app.def = cfg.def || null; app.layout = layout; app.game = game;
    app.playing = true; app.paused = false; app.spinTok = null; app.stuckLater = false; app.cursor = -1; app.hover = -1; app.hint = null; app.lastAction = performance.now();
    app.ui.closeModal(); app.ui.hideScreens();
    $('hud').hidden = false;
    $('hudTitle').textContent = cfg.title || layout.name;
    $('hudSub').textContent = cfg.sub || (layout.count + ' Steine · ' + layout.layers + ' Ebenen');
    const zen = mode === 'zen';
    $('hudScoreBox').hidden = zen; $('hudTimeBox').hidden = zen;
    $('hudTimeLabel').textContent = mode === 'blitz' ? 'Rest' : 'Zeit';
    $('btnShuffle').disabled = false;
    app.R.setTheme(themeFor());
    app.R.setBoard(layout, game.faces, game.alive);
    updateMargins();
    app.R.resetView(app.save.opt.pitch || 24);
    refreshTints(); updateHud();
    if (!cfg.state) { app.save.d.stats.games++; }
    saveCur();
    if (cfg.state && game.won()) { app.playing = false; setTimeout(() => { if (app.game === game) onWin(); }, 300); return true; }
    startTimer();
    if (!cfg.quiet && game.stuck()) setTimeout(onStuck, 600);
    return true;
  }
  app.startLevel = function (l) {
    const w = L.WORLDS[l.world - 1];
    startGame('level', { layout: l.layout, seed: l.seed, def: l, ref: l.id, title: 'Level ' + l.world + '-' + (l.index + 1) + ' · ' + L.BY_ID[l.layout].name, sub: w.name + ' · ⏱ Ziel ' + U.fmtTime(l.par) });
    if (!app.save.d.stats.wins && l.n === 0) introModal();
  };
  app.startFree = function (layoutId, seed) {
    app.save.d.last.layout = layoutId;
    startGame('free', { layout: layoutId, seed: seed === undefined ? (Date.now() ^ (Math.random() * 1e9)) >>> 0 : seed, ref: layoutId, solvable: app.save.opt.solvable, title: L.BY_ID[layoutId].name });
  };
  app.startDaily = function () {
    const key = app.today(), def = L.dailyFor(key);
    startGame('daily', { layout: def.layout, seed: def.seed, def, ref: key, title: 'Tagesrätsel ' + key.slice(6) + '.' + key.slice(4, 6) + '.', sub: L.BY_ID[def.layout].name + ' · ⏱ Ziel ' + U.fmtTime(def.par) });
  };
  function blitzLayout() {
    const pool = L.LAYOUTS.filter(l => l.count >= 40 && l.count <= 90);
    return pool[Math.floor(Math.random() * pool.length)].id;
  }
  app.startBlitz = function () {
    app.blitz = { left: 150, score: 0, boards: 0 };
    nextBlitz();
  };
  function nextBlitz() {
    startGame('blitz', { layout: blitzLayout(), seed: (Math.random() * 4e9) >>> 0, title: 'Zeitjagd · Brett ' + (app.blitz.boards + 1), sub: 'Jedes Paar +3 s · Brett +30 s', quiet: true });
  }
  app.startZen = function () {
    const pool = L.LAYOUTS.filter(l => l.count >= 50);
    const lay = pool[Math.floor(Math.random() * pool.length)];
    startGame('zen', { layout: lay.id, seed: (Math.random() * 4e9) >>> 0, title: 'Zen · ' + lay.name, sub: 'Ohne Uhr, ohne Punkte – einfach spielen', solvable: app.save.opt.solvable, quiet: true });
  };
  app.resume = function () {
    const cur = app.save.d.cur; if (!cur) return;
    const st = cur.game;
    if (cur.mode === 'level') { const l = L.LEVEL_BY_ID[cur.ref]; if (!l) { app.save.d.cur = null; return; } const w = L.WORLDS[l.world - 1]; startGame('level', { layout: l.layout, seed: l.seed, def: l, ref: l.id, state: st, title: 'Level ' + l.world + '-' + (l.index + 1) + ' · ' + L.BY_ID[l.layout].name, sub: w.name + ' · ⏱ Ziel ' + U.fmtTime(l.par) }); }
    else if (cur.mode === 'daily') { const def = L.dailyFor(cur.ref); startGame('daily', { layout: def.layout, seed: def.seed, def, ref: cur.ref, state: st, title: 'Tagesrätsel ' + cur.ref.slice(6) + '.' + cur.ref.slice(4, 6) + '.' }); }
    else if (cur.mode === 'zen') startGame('zen', { layout: cur.layout, seed: st.seed, state: st, title: 'Zen · ' + (L.BY_ID[cur.layout] || {}).name, sub: 'Ohne Uhr, ohne Punkte – einfach spielen' });
    else startGame('free', { layout: cur.layout, seed: st.seed, ref: cur.layout, state: st, title: (L.BY_ID[cur.layout] || {}).name });
  };
  function saveCur() {
    const g = app.game; if (!g) return;
    if (app.mode === 'blitz' || !app.playing) { if (app.mode === 'blitz') { app.save.d.cur = null; app.save.write(); } return; }
    app.save.d.cur = { mode: app.mode, ref: app.ref, layout: app.layout.id, game: g.toJSON() };
    app.save.write();
  }
  function introModal() {
    app.ui.modal('Willkommen im Jadepalast!', '<p>Tippe <b>zwei gleiche Steine</b> an, die <b>frei</b> sind – dann verschwinden sie.</p><p>Frei heißt: nichts liegt darauf, und <b>links oder rechts</b> ist Platz. Blockierte Steine sind etwas dunkler.</p><p class="muted">Blumen passen zu allen Blumen, Jahreszeiten zu allen Jahreszeiten. Mit 💡 bekommst du einen Tipp.</p>',
      [{ label: 'Los geht’s!', primary: true }], { cancel: null });
  }

  // ---------- Uhr ----------
  function startTimer() {
    endTimer();
    let last = performance.now();
    app.timer = setInterval(() => {
      const now = performance.now(), dt = Math.min(1000, now - last); last = now;
      if (!app.playing || app.paused || document.hidden || app.ui.modalOpen) return;
      const g = app.game; g.time += dt;
      app.save.d.stats.time += dt / 1000;
      if (app.mode === 'zen') { app.save.d.stats.zen += dt / 1000; if (app.save.d.stats.zen >= 1800) ach('zen30'); }
      if (app.mode === 'blitz') {
        const before = Math.ceil(app.blitz.left);
        app.blitz.left -= dt / 1000;
        if (app.blitz.left <= 10 && Math.ceil(app.blitz.left) !== before) A.play('tick');
        if (app.blitz.left <= 0) { app.blitz.left = 0; updateHud(); blitzOver(); return; }
      }
      // Leerlauf-Hilfe in Welt 1 (kostenlos)
      if (app.mode === 'level' && app.def && app.def.world === 1 && !app.hint && now - app.lastAction > 25000) { app.lastAction = now; showHint(true); }
      updateHud();
    }, 250);
  }
  function endTimer() { if (app.timer) { clearInterval(app.timer); app.timer = 0; } }

  // ---------- Züge ----------
  function onTile(i) {
    const g = app.game; if (!g || !app.playing || app.paused || app.spinTok) return;
    app.lastAction = performance.now();
    const res = g.tap(i, g.time);
    if (res.type === 'blocked') { app.R.shake(i); A.play('blocked'); hintBlocked(i); }
    else if (res.type === 'select' || res.type === 'switch') { A.play('select'); if (app.hint && app.hint.indexOf(i) < 0) app.hint = null; }
    else if (res.type === 'deselect') A.play('deselect');
    else if (res.type === 'match') onMatch(res);
    refreshTints(); updateHud();
  }
  let blockedTips = 0;
  function hintBlocked(i) {
    if (blockedTips >= 2 || app.save.d.stats.wins > 2) return;
    blockedTips++;
    const g = app.game, above = g.g.above[i].some(j => g.alive[j]);
    app.ui.toast(above ? 'Auf diesem Stein liegt noch ein anderer.' : 'Dieser Stein ist links und rechts eingeklemmt.');
  }
  function onMatch(res) {
    const g = app.game, R = app.R;
    const pa = R.screenOf(res.a), pb = R.screenOf(res.b);
    R.removePair(res.a, res.b);
    A.play('match', res.combo);
    if (app.mode !== 'zen') floater('+' + res.points, (pa.x + pb.x) / 2, (pa.y + pb.y) / 2);
    if (res.combo >= 2 && app.mode !== 'zen') showCombo(res.combo);
    if (app.mode === 'blitz') app.blitz.left += 3;
    app.hint = null;
    const st = app.save.d.stats; st.pairs++; st.bestCombo = Math.max(st.bestCombo, res.combo);
    ach('paar1'); if (st.pairs >= 500) ach('paar500'); if (st.pairs >= 3000) ach('paar3000');
    if (res.combo >= 5) ach('combo5'); if (res.combo >= 12) ach('combo12');
    if (app.cursor === res.a || app.cursor === res.b) moveCursorNear(pb);
    saveCur();
    if (g.won()) { app.playing = false; endTimer(); setTimeout(onWin, 560); }
    else if (g.stuck()) setTimeout(() => { if (app.game === g && app.playing && g.stuck()) onStuck(); }, 600);
  }
  function showHint(free) {
    const g = app.game; if (!g || !app.playing) return;
    const mv = free ? g.bestMove() : g.hint();
    if (!mv) { onStuck(); return; }
    if (!free) app.save.d.stats.hints++;
    app.hint = mv; A.play('hint');
    if (app.lastInputKeys()) { app.cursor = mv[0]; }
    refreshTints(); updateHud(); saveCur();
    const h = mv;
    setTimeout(() => { if (app.hint === h) { app.hint = null; refreshTints(); } }, 2600);
  }
  app.hintAction = () => { if (app.playing && !app.paused) { app.lastAction = performance.now(); showHint(false); } };
  app.undoAction = function () {
    const g = app.game; if (!g || !app.playing || app.paused || app.spinTok) return;
    const p = g.undo();
    if (!p) { app.ui.toast('Nichts zum Zurücknehmen'); return; }
    app.save.d.stats.undos++;
    if (app.mode === 'blitz') app.blitz.left = Math.max(1, app.blitz.left - 3);   // Zeitbonus des Paars zurücknehmen
    app.hint = null; app.R.restorePair(p[0], p[1]); A.play('undo');
    refreshTints(); updateHud(); saveCur();
  };
  app.shuffleAction = function (free) {
    const g = app.game; if (!g || !app.playing || app.paused || app.spinTok || g.remaining() === 0) return;
    const ok = g.reshuffle(!!free);
    if (!ok) {
      app.ui.modal('Mischen hilft hier nicht', '<p>Die restlichen Steine liegen so übereinander, dass keine Verteilung lösbar ist. Nimm ein paar Züge zurück oder starte neu.</p>',
        [{ label: '↶ Zug zurück', primary: true, fn: () => app.undoAction() }, { label: '🔁 Neu starten', fn: restart }, { label: 'Hauptmenü', fn: toMenu }], { cancel: null });
      return;
    }
    if (!free) app.save.d.stats.shuffles++;
    app.hint = null; g.selected = -1;
    A.play('shuffle');
    const tok = app.spinTok = {};
    app.R.spinAll(() => { if (app.spinTok !== tok) return; app.spinTok = null; if (app.game === g) { app.R.setFaces(g.faces); refreshTints(); } });
    refreshTints(); updateHud(); saveCur();
    if (g.stuck()) setTimeout(onStuck, 900);
  };
  function onStuck() {
    const g = app.game; if (!g || !app.playing || !g.stuck()) return;
    if (app.paused) { app.stuckLater = true; return; }   // nach dem Fortsetzen zeigen
    if (app.mode === 'zen') { app.ui.toast('Keine Paare mehr – ich mische neu 🍵'); app.shuffleAction(true); return; }
    if (app.mode === 'blitz') { app.blitz.left = Math.max(1, app.blitz.left - 10); app.ui.toast('Neu gemischt (−10 s)'); app.shuffleAction(true); return; }
    if (!app.save.opt.autoHint) { updateHud(); return; }
    A.play('stuck');
    app.ui.modal('Keine Paare mehr frei', '<p>Gerade passt kein freies Paar zusammen. Du kannst die restlichen Steine neu mischen (immer lösbar) oder Züge zurücknehmen.</p>', [
      { label: '🔀 Mischen (−50 Punkte)', primary: true, fn: () => app.shuffleAction(false) },
      { label: '↶ Zug zurück', fn: () => app.undoAction() },
      { label: '🔁 Neu starten', fn: restart },
      { label: 'Hauptmenü', fn: toMenu }], { cancel: null });
  }

  // ---------- Sieg ----------
  function onWin() {
    const g = app.game, st = app.save.d.stats, lay = app.layout;
    app.R.fireworks(); A.play('win');
    app.save.d.seen[lay.id] = 1;
    if (Object.keys(app.save.d.seen).length >= L.LAYOUTS.length) ach('alle');
    if (app.mode === 'blitz') {
      app.blitz.score += g.score; app.blitz.boards++; app.blitz.left += 30;
      st.blitzBoards++; if (app.blitz.boards >= 3) ach('blitz3');
      app.ui.toast('Brett geschafft! +30 s'); app.save.write();
      setTimeout(() => { if (app.mode === 'blitz') nextBlitz(); }, 1300);
      return;
    }
    if (app.mode === 'zen') {
      st.wins++; app.save.d.cur = null; app.save.write();
      app.ui.toast('Wunderschön. Das nächste Brett kommt … 🍵');
      setTimeout(() => { if (app.mode === 'zen' && !app.playing) app.startZen(); }, 2200);
      return;
    }
    st.wins++;
    ach('sieg1'); if (st.wins >= 25) ach('sieg25'); if (st.wins >= 100) ach('sieg100');
    const par = app.def ? app.def.par : Math.round(lay.count * 2.2 + 10 * lay.layers);
    const r = g.finish(par);
    const perfect = g.hints === 0 && g.shuffles === 0 && g.undos === 0;
    if (perfect) { st.perfect++; ach('perfekt'); }
    if (lay.id === 'schildkroete') ach('turtle');
    if (lay.count >= 144) { if (!st.fast144 || r.sec < st.fast144) st.fast144 = r.sec; if (r.sec < 240) ach('schnell'); }
    app.save.d.cur = null;
    let stars = 0, extra = '', actions = [];
    if (app.mode === 'level') {
      const l = app.def;
      stars = 1; if (r.sec <= l.par) stars = 2; if (stars === 2 && g.hints === 0 && g.shuffles === 0) stars = 3;
      const rec = app.save.recordLevel(l.id, stars, r.sec, r.score);
      if (rec.newBest && !rec.firstClear) extra = '<p class="newbest">Neuer Bestwert!</p>';
      const tot = app.save.stars(); if (tot >= 50) ach('sterne50'); if (tot >= L.LEVELS.length * 3) ach('sterne144');
      if (L.LEVELS.filter(x => x.world === l.world).every(x => app.save.levelDone(x.id))) ach('welt' + l.world);
      const next = L.LEVELS[l.n + 1];
      if (next && app.levelOpen(next)) actions.push({ label: '▶ Nächstes Level', primary: true, fn: () => app.startLevel(next) });
      else if (!next) extra += '<p class="newbest">Du hast die ganze Reise geschafft! 👑</p>';
      actions.push({ label: '🔁 Nochmal', fn: () => app.startLevel(l) });
      actions.push({ label: '🗺️ Levelübersicht', fn: () => { app.ui.mapWorld = l.world; toMenu('scrLevels'); } });
    } else if (app.mode === 'daily') {
      const d = app.save.d.daily, key = app.ref;
      if (!d.done[key]) {
        d.done[key] = r.score; st.daily++;
        const yesterday = app.prevKey(key);
        d.streak = d.last === yesterday ? d.streak + 1 : (d.last === key ? d.streak : 1);
        d.last = key; d.bestStreak = Math.max(d.bestStreak, d.streak);
        extra = '<p class="newbest">Serie: ' + d.streak + ' Tag' + (d.streak === 1 ? '' : 'e') + ' 🔥</p>';
      } else if (r.score > d.done[key]) d.done[key] = r.score;
      ach('tag1'); if (d.streak >= 7) ach('tag7');
      app.save.recordBest('daily', r.score);
      actions.push({ label: '🏠 Hauptmenü', primary: true, fn: () => toMenu() });
      actions.push({ label: '🀄 Freies Spiel', fn: () => toMenu('scrFree') });
    } else {
      if (app.save.recordBest(lay.id, r.score)) extra = '<p class="newbest">Neuer Bestwert für ' + U.esc(lay.name) + '!</p>';
      actions.push({ label: '▶ Neues Spiel (' + lay.name + ')', primary: true, fn: () => app.startFree(lay.id) });
      actions.push({ label: '🀄 Anderes Layout', fn: () => toMenu('scrFree') });
      actions.push({ label: '🏠 Hauptmenü', fn: () => toMenu() });
    }
    app.save.write(true);
    const starHtml = app.mode === 'level' ? '<div class="big-stars" id="winStars"><span>★</span><span>★</span><span>★</span></div>' : '';
    const body = starHtml + '<div class="res"><span>Zeit</span><b>' + U.fmtTime(r.sec) + '</b><span>Paare</span><b>' + (g.total() / 2) + '</b>' +
      '<span>Beste Kombo</span><b>' + g.bestCombo + '×</b>' + (r.timeBonus ? '<span>Zeitbonus</span><b>+' + r.timeBonus + '</b>' : '') +
      (r.perfect ? '<span>Ohne Hilfe</span><b>+' + r.perfect + '</b>' : '') + '<span class="tot">Punkte</span><b class="tot">' + r.score + '</b></div>' + extra;
    setTimeout(() => {
      app.ui.modal(app.mode === 'level' ? 'Geschafft!' : app.mode === 'daily' ? 'Tagesrätsel gelöst!' : 'Brett abgeräumt!', body, actions, { cancel: () => toMenu() });
      if (stars) [0, 1, 2].forEach(k => setTimeout(() => { const s = document.querySelectorAll('#winStars span')[k]; if (s && k < stars) { s.classList.add('on'); A.play('star', k); } }, 300 + k * 320));
    }, 700);
  }
  function blitzOver() {
    app.playing = false; endTimer();
    const b = app.blitz, total = b.score + app.game.score, bz = app.save.d.blitz, st = app.save.d.stats;
    const nb = total > bz.best;
    bz.best = Math.max(bz.best, total); bz.boards = Math.max(bz.boards, b.boards);
    st.wins += 0; app.save.write(true);
    A.play('stuck');
    app.ui.modal('Zeit abgelaufen!', '<div class="res"><span>Bretter geschafft</span><b>' + b.boards + '</b><span class="tot">Punkte</span><b class="tot">' + total + '</b></div>' + (nb ? '<p class="newbest">Neuer Rekord!</p>' : '<p class="muted">Rekord: ' + bz.best + '</p>'), [
      { label: '🔁 Nochmal', primary: true, fn: () => app.startBlitz() }, { label: '🏠 Hauptmenü', fn: () => toMenu() }], { cancel: () => toMenu() });
  }

  // ---------- Pause / Menü ----------
  function pause() {
    if (!app.playing || app.paused || app.ui.modalOpen) return;
    app.paused = true; saveCur(); app.save.write(true);
    const o = app.save.opt, muted = o.sfx === 0 && o.music === 0;
    app.ui.modal('Pause', '<p class="muted">' + MODE_NAME[app.mode] + ' · ' + U.esc(app.layout.name) + ' · noch ' + app.game.remaining() + ' Steine</p>', [
      { label: '▶ Weiter', primary: true, fn: resume },
      { label: muted ? '🔊 Ton an' : '🔇 Ton aus', fn: () => { toggleMute(); resume(); } },
      { label: '📖 Anleitung', fn: () => { app.paused = false; toMenu('scrGuide'); } },
      { label: '🔁 Neu starten', fn: restart },
      { label: '🏠 Hauptmenü', fn: () => toMenu() }], { cancel: resume });
  }
  function resume() { app.paused = false; app.lastAction = performance.now(); if (app.stuckLater) { app.stuckLater = false; setTimeout(onStuck, 300); } }
  function restart() {
    const m = app.mode;
    if (m === 'level') app.startLevel(app.def);
    else if (m === 'daily') app.startDaily();
    else if (m === 'blitz') app.startBlitz();
    else if (m === 'zen') app.startZen();
    else { const g = app.game; startGame('free', { layout: app.layout.id, seed: g.seed, ref: app.layout.id, solvable: app.save.opt.solvable, title: app.layout.name }); }
  }
  function toMenu(screen) {
    if (app.playing) saveCur();
    app.playing = false; app.paused = false; endTimer();
    if (app.mode === 'blitz') { app.save.d.cur = null; }
    app.save.write(true);
    app.ui.closeModal();
    $('hud').hidden = true;
    app.game = null; app.mode = null;
    menuBackdrop();
    app.ui.show(screen || 'scrMenu');
  }
  app.toMenu = toMenu;
  // Hintergrund der Menüs: ein ruhendes Brett (ein einziges Bild, keine Dauer-Animation)
  function menuBackdrop() {
    const lay = L.BY_ID.schildkroete, g = new E.Game({ layout: lay, seed: 20261024 });
    app.R.setTheme(app.save.opt.theme === 'auto' ? 'jade' : app.save.opt.theme);
    app.R.setMargins({ t: 0, b: 0, l: 0, r: 0 });
    app.R.setBoard(lay, g.faces, g.alive);
    app.R.view.yaw = 0.22; app.R.view.pitch = 0.62; app.R.fit(false);
    app.R.zoomBy(1.15);
  }
  let muteMem = null;
  function toggleMute() {
    const o = app.save.opt;
    if (o.sfx > 0 || o.music > 0) { muteMem = { sfx: o.sfx, music: o.music }; app.setOpt('sfx', 0); app.setOpt('music', 0); app.ui.toast('🔇 Ton aus'); }
    else { const m = muteMem || { sfx: 0.8, music: 0.4 }; app.setOpt('sfx', m.sfx); app.setOpt('music', m.music); app.ui.toast('🔊 Ton an'); }
  }
  function fullscreen() {
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else { const r = el.requestFullscreen || el.webkitRequestFullscreen; if (r) { const p = r.call(el); if (p && p.catch) p.catch(() => {}); } }
    } catch (e) {}
  }

  // ---------- Cursor (Tastatur/Controller) ----------
  function moveCursorNear(p) {
    const g = app.game, free = g.freeList();
    app.cursor = free.length ? app.R.nearest(p.x, p.y, free, 1e5) : -1;
    app.R.setCursor(app.cursor);
  }
  function nav(dir) {
    const g = app.game; if (!g) return;
    const free = g.freeList(); if (!free.length) return;
    if (app.cursor < 0 || !g.alive[app.cursor] || !g.isFree(app.cursor)) {
      const start = g.selected >= 0 ? g.selected : -1;
      if (start >= 0) app.cursor = start;
      else { const r = app.R.gl.domElement.getBoundingClientRect(); app.cursor = app.R.nearest(r.left + r.width / 2, r.top + r.height / 2, free, 1e5); }
      app.R.setCursor(app.cursor); A.play('click'); return;
    }
    const p = app.R.screenOf(app.cursor);
    let best = -1, bs = Infinity;
    for (const i of free) {
      if (i === app.cursor) continue;
      const q = app.R.screenOf(i), dx = q.x - p.x, dy = q.y - p.y;
      let along, perp;
      if (dir === 'left') { along = -dx; perp = Math.abs(dy); } else if (dir === 'right') { along = dx; perp = Math.abs(dy); }
      else if (dir === 'up') { along = -dy; perp = Math.abs(dx); } else { along = dy; perp = Math.abs(dx); }
      if (along < 4) continue;
      const sc = along + perp * 2.5;
      if (sc < bs) { bs = sc; best = i; }
    }
    if (best >= 0) { app.cursor = best; app.R.setCursor(best); A.play('click'); }
  }

  // ---------- Start ----------
  function progress(p, text) { $('loadBar').firstElementChild.style.width = p + '%'; if (text) $('loadText').textContent = text; }
  function fail(msg) { $('loadError').hidden = false; $('loadErrorText').textContent = msg; }
  function webglOk() { try { const c = document.createElement('canvas'); return !!(root.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } }

  function boot() {
    $('btnRetry').onclick = () => location.reload();
    progress(10, 'Spielstand wird geladen …');
    if (!root.THREE) { fail('Die 3D-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.'); return; }
    if (!webglOk()) { fail('Dein Browser oder Gerät unterstützt kein WebGL (3D-Grafik). Bitte einen aktuellen Browser verwenden oder die Hardwarebeschleunigung einschalten.'); return; }
    C = { gold: new THREE.Color(1.0, 0.82, 0.38), hint: new THREE.Color(0.5, 1.0, 0.62), match: new THREE.Color(0.62, 0.86, 1.2), hover: new THREE.Color(1.08, 1.08, 1.0), dim: new THREE.Color(0.64, 0.66, 0.68) };
    app.save = new S.Save();
    app.ui = new U.UI(app);
    const o = app.save.opt;
    $('app').classList.toggle('lefty', !!o.left);
    progress(35, 'Steine werden bemalt …');
    try {
      app.R = new root.MJRender.Renderer($('stage'), {
        quality: quality(),
        onTheme: th => { $('app').style.setProperty('--bg', th.bg); const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', th.mat2); },
        onLost: () => { app.ui.toast('Grafik wurde zurückgesetzt – bitte neu laden, falls nichts mehr angezeigt wird.', 5000); }
      });
    } catch (e) { fail('3D-Grafik konnte nicht gestartet werden: ' + (e && e.message || e)); return; }
    buildAtlas();
    app.R.setBack(o.back); app.R.setDefaultPitch(o.pitch || 24); app.R.setTheme(o.theme === 'auto' ? 'jade' : o.theme);
    A.setSfx(o.sfx); A.setMusic(o.music);
    progress(70, 'Tisch wird gedeckt …');
    bindUi();
    app.input = root.MJInput.create({
      canvas: app.R.gl.domElement,
      inGame: () => !!(app.game && app.playing && !app.paused),
      blocked: () => app.ui.modalOpen,
      tap: tapAt,
      hover: hoverAt,
      pan: (dx, dy) => app.R.panBy(dx, dy),
      zoom: (f, x, y) => app.R.zoomBy(f, x, y),
      rotate: (a, b) => app.R.rotateBy(a, b),
      resetView: () => app.R.resetView(),
      nav, confirm: () => { if (app.cursor >= 0) onTile(app.cursor); else nav('down'); },
      cancel: () => { const g = app.game; if (g && g.selected >= 0) { g.selected = -1; A.play('deselect'); refreshTints(); return true; } return false; },
      hint: app.hintAction, undo: app.undoAction, shuffle: () => app.shuffleAction(false), pause,
      uiNav: d => app.ui.nav(d), uiConfirm: () => app.ui.confirm(), uiBack: () => { if (!app.ui.back() && app.ui.cur === 'scrMenu' && embedded && root.EasyGamesKit) root.EasyGamesKit.close(); },
      mute: toggleMute, fullscreen,
      used: kind => {
        A.unlock();
        if (kind !== app.inputKind) {
          app.inputKind = kind;
          if (kind === 'mouse' || kind === 'touch') { app.cursor = -1; app.R.setCursor(-1); }
        }
      }
    });
    // erste Eingabe schaltet den Ton frei (Browser-Regel)
    ['pointerdown', 'keydown'].forEach(ev => root.addEventListener(ev, () => A.unlock(), { capture: true, passive: true }));
    root.addEventListener('pointerdown', e => { if (e.pointerType) { const k = e.pointerType === 'mouse' ? 'mouse' : 'touch'; if (k !== app.inputKind) { app.inputKind = k; if (app.R) { app.cursor = -1; app.R.setCursor(-1); } } } }, { capture: true, passive: true });
    root.addEventListener('keydown', e => { if (e.key && e.key.indexOf('Arrow') === 0 || e.key === 'Tab') app.inputKind = 'keys'; }, { capture: true });
    root.addEventListener('resize', () => { updateMargins(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { if (app.playing && !app.paused && !app.ui.modalOpen && app.mode !== 'zen') pause(); else saveCur(); app.save.write(true); } });
    root.addEventListener('pagehide', () => { saveCur(); app.save.write(true); });
    if (root.EasyGamesKit && root.EasyGamesKit.back) root.EasyGamesKit.back(() => {
      if (app.ui.modalOpen) { app.ui.back(); return; }
      if (app.playing) { pause(); return; }
      if (!app.ui.back() && embedded) root.EasyGamesKit.close();
    });
    menuBackdrop();
    progress(100, 'Bereit!');
    setTimeout(() => app.ui.show('scrMenu'), 120);
  }

  function tapAt(x, y, type, dbl) {
    const g = app.game, R = app.R; if (!g) return;
    let i = R.pick(x, y);
    if (i >= 0 && g.isFree(i)) { onTile(i); return; }
    const free = g.freeList(), px = R.tilePx();
    if (i < 0) {
      const n = R.nearest(x, y, free, px * 0.6);
      if (n >= 0) { onTile(n); return; }
      if (dbl) { if (R.view.zoom > 1.05) R.fit(false); else R.zoomBy(2, x, y); }
      else if (g.selected >= 0) { g.selected = -1; A.play('deselect'); refreshTints(); }
      return;
    }
    if (type !== 'mouse') { const n = R.nearest(x, y, free, px * 0.45); if (n >= 0) { onTile(n); return; } }
    onTile(i);
  }
  let hoverRaf = 0, hoverXY = null;
  function hoverAt(x, y) {
    hoverXY = [x, y];
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0; if (!app.game) return;
      const i = hoverXY[0] < 0 ? -1 : app.R.pick(hoverXY[0], hoverXY[1]);
      const h = i >= 0 && app.game.isFree(i) ? i : -1;
      app.R.gl.domElement.style.cursor = h >= 0 ? 'pointer' : 'default';
      if (h !== app.hover) { app.hover = h; refreshTints(); }
    });
  }

  function bindUi() {
    document.querySelectorAll('[data-go]').forEach(b => { b.addEventListener('click', () => { A.play('click'); app.ui.show(b.dataset.go); }); });
    document.querySelectorAll('button[data-back]').forEach(b => { b.addEventListener('click', () => app.ui.back()); });
    document.querySelectorAll('[data-sort]').forEach(b => { b.addEventListener('click', () => { app.ui.sort = b.dataset.sort; A.play('click'); app.ui.show('scrFree'); }); });
    $('btnRandomLayout').onclick = () => { const l = L.LAYOUTS[Math.floor(Math.random() * L.LAYOUTS.length)]; A.play('click'); app.startFree(l.id); };
    $('btnContinue').onclick = () => { A.play('click'); app.resume(); };
    $('btnJourney').onclick = () => { A.play('click'); app.ui.show('scrWorlds'); };
    $('btnZen').onclick = () => { A.play('click'); app.startZen(); };
    $('btnFull').onclick = fullscreen;
    $('btnHome').onclick = () => { if (root.EasyGamesKit) root.EasyGamesKit.close(); };
    $('btnPause').onclick = () => { A.play('click'); pause(); };
    $('btnHint').onclick = () => app.hintAction();
    $('btnUndo').onclick = () => app.undoAction();
    $('btnShuffle').onclick = () => app.shuffleAction(false);
    $('btnZoomIn').onclick = () => app.R.zoomBy(1.35);
    $('btnZoomOut').onclick = () => app.R.zoomBy(1 / 1.35);
    $('btnView').onclick = () => app.R.resetView();
    // HUD-Knöpfe behalten den Fokus nicht (sonst löst Leertaste den Knopf statt des Steins aus)
    document.querySelectorAll('#hud button').forEach(b => b.addEventListener('pointerup', () => b.blur()));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);

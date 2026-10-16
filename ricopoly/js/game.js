/*! RicoPoly 3D – Oberfläche und Spielablauf: Menüs, Einstellungen, Charaktereditor, Partie-Steuerung, Dialoge, Tutorial.
 * Spielregeln kommen ausschließlich aus rules.js; die 3D-Darstellung wird aus dem Spielstand rekonstruiert. */
(function () {
  'use strict';
  var R = window.RicoRules, AI = window.RicoAI, W = window.RicoWorlds, C = window.RicoChars, PF = window.RicoProfile, A = window.RicoAudio, I = window.RicoI18n, NET = window.RicoNet, BD = window.RicoBoard;
  var $ = function (id) { return document.getElementById(id); };
  var prof = PF.load(), S = prof.settings, stage = null, M = null, screenStack = [];
  var t = function (k, v) { return I.t(S.lang, k, v); };
  var BOARD = R.BOARD;
  var SESSION = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);   // macht Aktions-IDs nach dem Fortsetzen eindeutig

  // ---------- Hilfen ----------
  function h(tag, cls, html, attrs) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (attrs) for (var k in attrs) { if (k === 'on') for (var ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); else e.setAttribute(k, attrs[k]); } return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fm(v) { return (Math.round(v) || 0).toLocaleString(S.lang === 'en' ? 'en-US' : 'de-DE') + ' RC'; }
  function btn(label, cls, fn, attrs) { var b = h('button', cls || 'btn', label, attrs); b.type = 'button'; b.addEventListener('click', function (e) { A.unlock(); A.sfx('click'); fn(e); }); return b; }
  function sqName(i, s) { return W.sqName((s || (M && M.s) || { world: prof.world }).world, i, S.lang); }
  function pcol(i) { return BD.PCOL[i % 6]; }
  function charName(id) { var c = C.BY[id]; return c ? c[S.lang] || c.de : esc(id); }
  function toast(msg, kind) { var el = h('div', 'toast ' + (kind || ''), esc(msg)); $('toasts').appendChild(el); setTimeout(function () { el.classList.add('out'); }, 2600); setTimeout(function () { el.remove(); }, 3200); }
  function saveProf() { PF.save(prof); }
  function applyLang() { document.documentElement.lang = S.lang; document.querySelectorAll('[data-t]').forEach(function (e) { e.textContent = t(e.getAttribute('data-t')); }); }
  function avatarHTML(p, size) { var a = p && p.avatar || '🙂'; return /^data:image\//.test(a) ? '<img class="ava" style="width:' + size + 'px;height:' + size + 'px" src="' + a + '" alt="">' : '<span class="ava" style="font-size:' + Math.round(size * 0.7) + 'px;width:' + size + 'px;height:' + size + 'px">' + esc(a) + '</span>'; }

  // ---------- Start ----------
  function boot() {
    applyLang();
    A.set({ master: S.master, music: S.music, sfx: S.sfx, mute: S.mute });
    var steps = 0, total = 4, bar = $('loadBar');
    function progress(label) { steps++; bar.style.width = Math.min(100, steps / total * 100) + '%'; $('loadText').textContent = label; }
    progress(t('load.engine'));
    if (!window.THREE || !hasWebGL()) { $('loadText').textContent = t('load.nowebgl'); $('loader').classList.add('fail'); return; }
    try {
      stage = new BD.Stage($('stage'), { quality: S.quality, reduced: S.reduced, particles: S.particles, saver: S.saver, shadows: S.shadows, lang: S.lang,
        onLost: function () { toast(t('gl.lost'), 'warn'); }, onRestored: function () { toast(t('gl.restored')); rebuildScene(); }, rebuild: rebuildScene });
    } catch (e) { $('loadText').textContent = t('load.nowebgl'); $('loader').classList.add('fail'); return; }
    stage.speed = S.speed;
    stage.onPick = function (sq) { if (M) showSquare(sq); };
    progress(t('load.world'));
    stage.buildMenu(prof.world);
    stage.showcase(prof.char, prof.look, 'idle');
    progress(t('load.ready'));
    setTimeout(function () {
      progress(t('load.ready'));
      $('loader').classList.add('done'); setTimeout(function () { $('loader').hidden = true; }, 600);
      if (!prof.name) askName(); else showMenu();
      var room = (location.hash.match(/room=([A-Z0-9]{6})/) || location.search.match(/room=([A-Z0-9]{6})/) || [])[1];
      if (room) joinRoom(room);
    }, 350);
    document.addEventListener('pointerdown', function once() { document.removeEventListener('pointerdown', once); A.unlock(); musicFor(M && M.s ? M.s.world : null); });
    document.addEventListener('keydown', onKey);
    setInterval(clockTick, 1000);
    bindPadCamera();
    window.addEventListener('beforeunload', function () { if (M && M.s && !M.client && M.s.phase !== 'over') autosave(true); });
  }
  function hasWebGL() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } }
  function musicFor(world) { var wd = W.get(world || prof.world); if (world) { A.playSong(wd.music); A.ambience(wd.ambience); } else { A.playSong({ root: 52, scale: [0, 2, 4, 7, 9, 11], tempo: 96, wave: 'triangle' }); A.ambience(null); } }
  function rebuildScene() { if (M && M.s) { stage.buildBoard(M.s.world, S.lang); stage.setPlayers(M.s.players); stage.sync(M.s); } else { stage.buildMenu(prof.world); stage.showcase(prof.char, prof.look); } }

  // ---------- Bildschirme ----------
  function hideAll() { document.querySelectorAll('.screen').forEach(function (s) { s.hidden = true; }); }
  function showMenu() {
    M = null; hideAll(); parkCloud(); $('hud').hidden = true; $('menu').hidden = false; screenStack = [];
    if (!stage.preview || stage.mode !== 'menu') { stage.buildMenu(prof.world); stage.showcase(prof.char, prof.look, 'idle'); }
    musicFor(null);
    var saves = PF.listSaves();
    $('btnContinue').disabled = !saves.length;
    $('menuHello').innerHTML = avatarHTML(prof, 30) + ' <b>' + esc(prof.name || t('guest')) + '</b>';
    applyLang();
  }
  function panel(title, build, opt) {
    hideAll(); $('hud').hidden = true;
    var sc = $('panel'); sc.hidden = false; sc.className = 'screen panel-screen' + (opt && opt.side ? ' side' : '');
    var body = $('panelBody'); parkCloud(); body.innerHTML = ''; $('panelTitle').textContent = title;
    $('panelBack').onclick = function () { A.sfx('click'); if (opt && opt.back) opt.back(); else showMenu(); };
    build(body);
    body.scrollTop = 0;
  }
  function askName() {
    panel(t('profile.create'), function (b) {
      b.appendChild(h('p', 'muted', t('profile.createText')));
      var inp = h('input', 'input', null, { maxlength: 20, placeholder: t('profile.name'), 'aria-label': t('profile.name') }); inp.value = prof.name || '';
      b.appendChild(inp);
      b.appendChild(avatarPicker());
      b.appendChild(btn(t('next'), 'btn primary', function () { prof.name = inp.value.trim().slice(0, 20) || t('player') + ' ' + prof.id.slice(0, 3).toUpperCase(); saveProf(); openChars(true); }));
      b.appendChild(h('div', 'cloudbox', null, { id: 'cloudMount2' }));
      mountCloud('cloudMount2');
    }, { back: function () { prof.name = prof.name || t('guest'); saveProf(); showMenu(); } });
  }
  function avatarPicker() {
    var wrap = h('div', 'avatars'), list = ['🙂', '😎', '🤠', '🧙', '🐉', '🤖', '👑', '🦊', '🐱', '🦄', '🚀', '🎩'];
    list.forEach(function (a) { var b = btn(a, 'chip' + (prof.avatar === a ? ' on' : ''), function () { prof.avatar = a; saveProf(); wrap.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.textContent === a); }); }); wrap.appendChild(b); });
    var up = h('label', 'chip upload', '📷 ' + t('profile.upload')), file = h('input', null, null, { type: 'file', accept: 'image/*' }); file.hidden = true; up.appendChild(file);
    file.addEventListener('change', function () { var f = file.files[0]; if (!f) return; var img = new Image(), url = URL.createObjectURL(f); img.onload = function () { var cv = document.createElement('canvas'); cv.width = cv.height = 96; var x = cv.getContext('2d'), s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 96, 96); prof.avatar = cv.toDataURL('image/jpeg', 0.8); saveProf(); URL.revokeObjectURL(url); toast(t('saved')); }; img.src = url; });
    wrap.appendChild(up);
    return wrap;
  }
  function mountCloud(id) {
    // Google-Anmeldung über die gemeinsame easygames-Cloud (cloud/anmacha-cloud.js). Ohne Netz oder Skript bleibt alles lokal.
    var el = $(id), cloudBox = $('cloudMount'); if (el && cloudBox) el.appendChild(cloudBox);
  }
  function parkCloud() { var c = $('cloudMount'), home = $('cloudHome'); if (c && home && c.parentNode !== home) home.appendChild(c); }

  // ---------- Partie einrichten ----------
  var setup = null;
  function newSetup(kind) {
    var me = { name: prof.name || t('player'), char: prof.char, look: prof.look, human: true };
    var bots = kind === 'hotseat' ? [{ name: t('player') + ' 2', char: 'adventuress', human: true }] : [0, 1, 2].map(function (i) { return { name: ['Robo', 'Merlin', 'Luna', 'Kobo', 'Ritter Rudi'][i], char: ['robot', 'wizard', 'queen', 'goblin', 'knight'][i], human: false, bot: 'medium' }; });
    return { kind: kind, mode: 'classic', world: prof.world, players: [me].concat(bots), cfg: R.config('classic'), timeLimit: 0 };
  }
  function openSetup(kind) {
    setup = newSetup(kind || 'single');
    renderSetup();
  }
  function renderSetup() {
    panel(t(setup.kind === 'hotseat' ? 'menu.local' : 'menu.single'), function (b) {
      // Modus
      b.appendChild(h('h3', null, t('setup.mode')));
      var modes = h('div', 'seg');
      ['classic', 'quick', 'custom'].forEach(function (m) { modes.appendChild(btn(t('mode.' + m), 'segbtn' + (setup.mode === m ? ' on' : ''), function () { setup.mode = m; setup.cfg = R.config(m === 'custom' ? 'classic' : m, m === 'custom' ? setup.cfg : null); renderSetup(); })); });
      b.appendChild(modes);
      b.appendChild(h('p', 'muted small', t('mode.' + setup.mode + '.desc')));
      // Spieler
      b.appendChild(h('h3', null, t('setup.players') + ' (' + setup.players.length + '/6)'));
      var list = h('div', 'plist');
      setup.players.forEach(function (p, i) {
        var row = h('div', 'prow'); row.style.setProperty('--pc', pcol(i));
        var name = h('input', 'input sm', null, { maxlength: 20, 'aria-label': t('profile.name') }); name.value = p.name; name.oninput = function () { p.name = name.value; };
        var ch = h('select', 'input sm', null, { 'aria-label': t('chars.title') });
        C.LIST.forEach(function (c) { var o = h('option', null, esc(c[S.lang]) + (i === 0 && !PF.isUnlocked(prof, c.id) ? ' 🔒' : '')); o.value = c.id; if (i === 0 && !PF.isUnlocked(prof, c.id)) o.disabled = true; if (c.id === p.char) o.selected = true; ch.appendChild(o); });
        ch.onchange = function () { p.char = ch.value; if (i === 0) p.look = ch.value === prof.char ? prof.look : {}; };
        row.appendChild(h('span', 'dot')); row.appendChild(name); row.appendChild(ch);
        if (i > 0) {
          var kind = h('select', 'input sm', null, { 'aria-label': t('setup.kind') });
          [['human', t('setup.human')], ['easy', t('bot.easy')], ['medium', t('bot.medium')], ['hard', t('bot.hard')]].forEach(function (k) { var o = h('option', null, k[1]); o.value = k[0]; if ((p.human ? 'human' : p.bot) === k[0]) o.selected = true; kind.appendChild(o); });
          kind.onchange = function () { p.human = kind.value === 'human'; p.bot = p.human ? null : kind.value; };
          row.appendChild(kind);
          row.appendChild(btn('✕', 'icon', function () { setup.players.splice(i, 1); renderSetup(); }, { 'aria-label': t('remove') }));
        } else row.appendChild(h('span', 'tag', t('setup.you')));
        list.appendChild(row);
      });
      b.appendChild(list);
      if (setup.players.length < 6) {
        var add = h('div', 'row');
        add.appendChild(btn('+ ' + t('setup.addBot'), 'btn sm', function () { var k = setup.players.length; setup.players.push({ name: ['Robo', 'Merlin', 'Luna', 'Kobo', 'Ritter Rudi', 'Nova'][k % 6], char: ['robot', 'wizard', 'queen', 'goblin', 'knight', 'android'][k % 6], human: false, bot: 'medium' }); renderSetup(); }));
        add.appendChild(btn('+ ' + t('setup.addHuman'), 'btn sm', function () { var k = setup.players.length; setup.players.push({ name: t('player') + ' ' + (k + 1), char: ['adventuress', 'pirate', 'detective', 'elf', 'businesswoman', 'king'][k % 6], human: true }); renderSetup(); }));
        b.appendChild(add);
      }
      // Welt
      b.appendChild(h('h3', null, t('setup.world')));
      var ws = h('div', 'worlds');
      W.ORDER.forEach(function (id) { var wd = W.get(id); ws.appendChild(btn('<b>' + wd.icon + ' ' + esc(wd.title[S.lang]) + '</b><small>' + esc(wd.desc[S.lang]) + '</small>', 'wcard ' + id + (setup.world === id ? ' on' : ''), function () { setup.world = id; renderSetup(); })); });
      b.appendChild(ws);
      // Optionen
      if (setup.mode !== 'classic') {
        b.appendChild(h('h3', null, t('setup.options')));
        var g = h('div', 'opts');
        var num = function (key, step) { var w = h('label', 'opt', '<span>' + t('cfg.' + key) + '</span>'), inp = h('input', 'input sm', null, { type: 'number', min: R.LIMITS[key][0], max: R.LIMITS[key][1], step: step || 1 }); inp.value = setup.cfg[key]; inp.onchange = function () { setup.cfg = R.config('classic', Object.assign({}, setup.cfg, (function (o) { o[key] = +inp.value; return o; })({}))); inp.value = setup.cfg[key]; }; w.appendChild(inp); g.appendChild(w); };
        var chk = function (key) { var w = h('label', 'opt chk'), inp = h('input', null, null, { type: 'checkbox' }); inp.checked = !!setup.cfg[key]; inp.onchange = function () { setup.cfg[key] = inp.checked; }; w.appendChild(inp); w.appendChild(h('span', null, t('cfg.' + key))); g.appendChild(w); };
        ['startMoney', 'passGo', 'maxRounds', 'timeLimit', 'turnTimer', 'startProps', 'jailFine', 'houses', 'hotels'].forEach(function (k) { num(k, k === 'startMoney' || k === 'passGo' ? 50 : 1); });
        ['auctions', 'goDouble', 'parkingPot'].forEach(chk);
        b.appendChild(g);
      }
      b.appendChild(btn('▶ ' + t('setup.start'), 'btn primary big', function () {
        var humans = setup.players.filter(function (p) { return p.human; }).length;
        if (setup.players.length < 2) return toast(t('setup.min2'), 'warn');
        if (setup.kind === 'single' && humans > 1) setup.kind = 'hotseat';
        startLocal({ players: setup.players.map(function (p) { return { name: (p.name || '').trim() || t('player'), char: p.char, look: p.look, human: p.human, bot: p.bot }; }), mode: setup.mode === 'custom' ? 'custom' : setup.mode, cfg: setup.cfg, world: setup.world });
      }));
    });
  }

  // ---------- Partie ----------
  function startLocal(o, tutorial) {
    var s = R.newGame({ players: o.players, mode: o.mode, cfg: o.cfg, world: o.world, now: Date.now() });
    if (tutorial) { s.own[1].o = 0; s.own[3].o = 1; s.cfg.auctions = true; }
    M = { s: s, local: true, me: 0, tutorial: !!tutorial, t0: Date.now(), ms: 0, slot: 'auto' };
    enterGame();
  }
  function enterGame() {
    hideAll(); $('menu').hidden = true; $('hud').hidden = false; $('modal').hidden = true;
    var s = M.s;
    M.q = []; M.busy = false; M.view = s; M.lastHuman = -1; M.tipSeen = {}; M.timerStart = Date.now(); M.lastKey = '';
    if (stage.preview) { stage.preview.dispose(); stage.preview = null; }
    stage.buildBoard(s.world, S.lang); stage.setPlayers(s.players); stage.sync(s);
    stage.overview();
    musicFor(s.world);
    $('hudWorld').textContent = W.get(s.world).title[S.lang];
    renderHUD(); renderLog();
    if (M.tutorial) tutorialStart();
    setTimeout(drive, 400);
  }
  function isLocalHuman(p) { if (!M || p < 0 || !M.s.players[p]) return false; if (M.client || M.host) return p === M.seat; return M.s.players[p].human; }
  function holder() {   // Wer bedient gerade das Gerät? (für Besitzverwaltung und Handel)
    var s = M.s, a = R.actor(s);
    if (M.client || M.host) return M.seat;
    if (a >= 0 && s.players[a].human) return a;
    if (M.lastHuman >= 0) return M.lastHuman;
    for (var i = 0; i < s.players.length; i++) if (s.players[i].human && !s.players[i].out) return i;
    return -1;
  }
  function act(a) {
    if (!M) return;
    if (M.s.phase === 'over') return;
    if (a.tid == null && /^(roll|buy|decline|endTurn|payJail|useCard)$/.test(a.type)) a.tid = M.s.turnId;
    if (M.client) { if (!M.client.act(a, M.s.turnId)) toast(t('net.offline'), 'warn'); return; }
    if (M.host) { M.host.act(a); return; }
    a.aid = a.aid || ('l' + SESSION + '-' + (++M.seqA || (M.seqA = 1)));
    var r = R.apply(M.s, a);
    take(r);
  }
  function take(r) {
    if (!r.ok) {
      if (r.state !== M.s) { M.s = r.state; queue(r.events, r.state); }
      if (r.err) { toast(t('err.' + r.err), 'warn'); A.sfx('error'); }
      return;
    }
    if (r.dup) return;
    M.s = r.state;
    queue(r.events, r.state);
    autosave();
  }
  var saveT = 0;
  function autosave(now) {
    if (!M || M.client || M.tutorialNoSave) return;
    clearTimeout(saveT);
    var go = function () {
      if (!M) return;
      var meta = { mode: M.s.mode, world: M.s.world, round: M.s.round, names: M.s.players.map(function (p) { return p.name; }), ms: M.ms + (Date.now() - M.t0), online: !!M.host, tutorial: M.tutorial };
      if (M.host) { meta.net = M.host.core.saveData(); PF.saveGame('host', M.host.core.state, meta); }
      else if (M.s.phase !== 'over') PF.saveGame(M.slot === 'auto' ? 'auto' : M.slot, M.s, meta);
    };
    if (now) go(); else saveT = setTimeout(go, 700);
  }

  // ---------- Ereignisse abspielen ----------
  function queue(events, state) { M.q.push({ ev: events.slice(), s: state }); if (!M.busy) runQ(); }
  function runQ() {
    if (!M) return;
    var item = M.q.shift();
    if (!item) { M.busy = false; M.view = M.s; stage.sync(M.s); renderHUD(); renderLog(); checkAch(); drive(); return; }
    M.busy = true; M.view = item.s;
    var evs = item.ev;
    (function step() {
      if (!M) return;
      var e = evs.shift();
      if (!e) { runQ(); return; }
      if (M.skip) { step(); return; }
      play(e, item.s, step);
    })();
  }
  function skipAnims() {
    if (!M || !M.busy) return;
    M.skip = true; stage.finishAll(); closeCard();
    M.q = []; M.busy = false; M.skip = false; M.view = M.s; stage.sync(M.s); renderHUD(); renderLog(); drive();
  }
  function wait(ms, cb) { setTimeout(cb, M && M.skip ? 0 : ms / (S.speed || 1)); }
  function play(e, s, done) {
    var who = e.p;
    switch (e.e) {
      case 'dice':
        if (e.util) { stage.rollDice(e.d, null, function () { floatText(s.cur, '🎲 ' + (e.d[0] + e.d[1]) + ' ×10'); wait(300, done); }); return; }
        stage.react(who, 'roll', 0.9); stage.follow(who); tip('roll');
        stage.rollDice(e.d, stage.tokens[who] ? stage.tokens[who].ch.group.position : null, function () {
          $('diceResult').textContent = e.d[0] + ' + ' + e.d[1] + ' = ' + (e.d[0] + e.d[1]) + (e.d[0] === e.d[1] ? ' · ' + t('double') : '');
          $('diceResult').classList.add('show'); setTimeout(function () { $('diceResult').classList.remove('show'); }, 1800);
          wait(250, done);
        });
        return;
      case 'move':
        if (e.path.length > 14 || (e.card && e.path.length > 20)) { stage.walk(who, e.path, { fast: true }, done); return; }
        stage.walk(who, e.path, { fast: e.card }, function () { stage.focusOn(e.to); wait(150, done); });
        return;
      case 'jail': stage.toJail(who, function () { tip('jail'); wait(300, done); }); return;
      case 'free': A.sfx('free'); stage.react(who, 'jailReturn', 1.2); if (stage.tokens[who]) stage.tokens[who].jail = false; wait(500, done); return;
      case 'stay': floatText(who, t('log.stay', { n: e.tries })); stage.react(who, 'angry', 1); wait(600, done); return;
      case 'pay': {
        var big = e.amt >= 300;
        if (e.from >= 0 && e.to >= 0) { stage.coinsFlow(e.from, e.to, e.amt); stage.react(e.from, big ? 'angry' : 'pay', 1.1); stage.react(e.to, 'cheer', 1.1); A.sfx(big ? 'bigpay' : 'pay'); }
        else if (e.from < 0) { stage.burst(tokPos(e.to), 'coin', 16 + Math.min(30, e.amt / 20)); stage.react(e.to, 'cheer', 1); A.sfx(e.why === 'go' ? 'coin' : 'bonus'); if (e.why === 'go') tip('go'); }
        else { stage.coinsFlow(e.from, -1, e.amt); stage.react(e.from, big ? 'angry' : 'pay', 1); A.sfx(big ? 'bigpay' : 'pay'); }
        if (e.to >= 0) floatText(e.to, '+' + fm(e.amt), 'plus');
        if (e.from >= 0) floatText(e.from, '−' + fm(e.amt), 'minus');
        wait(big ? 900 : 550, done); return;
      }
      case 'rent': tip('rent'); if (R.BOARD[e.sq].t === 'prop' && R.groupOwned(s, R.BOARD[e.sq].g, e.to) && !s.own[e.sq].h) tip('group'); wait(150, done); return;
      case 'tax': stage.react(who, 'surprised', 1); wait(300, done); return;
      case 'offer': stage.focusOn(e.sq); stage.react(who, 'think', 2); wait(200, done); return;
      case 'buy': case 'sold':
        stage.setOwner(e.sq, e.p, false, true); stage.react(e.p, 'buy', 1.4); A.sfx(e.e === 'sold' ? 'gavel' : 'buy');
        if (isLocalHuman(e.p)) tip('buy');
        floatText(e.p, sqName(e.sq, s)); wait(800, done); return;
      case 'unsold': wait(300, done); return;
      case 'auction': A.sfx('gavel'); stage.focusOn(e.sq); tip('auction'); wait(300, done); return;
      case 'bid': A.sfx('bid'); stage.react(e.p, 'think', 0.8); floatText(e.p, fm(e.amt)); wait(250, done); return;
      case 'pass': floatText(e.p, t('pass')); wait(200, done); return;
      case 'decline': wait(150, done); return;
      case 'build': stage.setBuildings(e.sq, e.h, true); stage.react(e.p, 'cheer', 1); if (isLocalHuman(e.p)) tip('build'); wait(600, done); return;
      case 'sell': stage.setBuildings(e.sq, e.h, false); A.sfx('coin'); wait(300, done); return;
      case 'mortgage': stage.setOwner(e.sq, e.p, true, false); A.sfx('coin'); if (isLocalHuman(e.p)) tip('mortgage'); wait(350, done); return;
      case 'unmortgage': stage.setOwner(e.sq, e.p, false, true); wait(350, done); return;
      case 'card': A.sfx('card'); showCard(e, s, done); return;
      case 'shuffle': wait(100, done); return;
      case 'turn':
        A.sfx('turn'); stage.highlight(e.p); if (S.autoCam) stage.follow(e.p);
        wait(250, done); return;
      case 'offer2': case 'tradeReject': case 'tradeCancel': case 'tradeVoid':
        if (e.e === 'offer2') A.sfx('trade');
        if (e.e === 'tradeReject' && isLocalHuman(e.from)) toast(t('trade.rejected', { name: s.players[e.to].name }));
        if (e.e === 'tradeVoid') toast(t('trade.void'));
        wait(100, done); return;
      case 'trade':
        A.sfx('trade'); stage.react(e.from, 'cheer', 1.2); stage.react(e.to, 'cheer', 1.2);
        toast(t('trade.done', { a: s.players[e.from].name, b: s.players[e.to].name })); tip('trade');
        stage.sync(s); wait(500, done); return;
      case 'bankrupt':
        A.sfx('bankrupt'); stage.react(who, 'lose', 3); stage.burst(tokPos(who), 'smoke', 30); tip('bankrupt');
        toast(t('log.bankrupt', { name: s.players[who].name }), 'warn');
        wait(1600, function () { if (stage.tokens[who]) stage.tokens[who].ch.group.visible = false; done(); }); return;
      case 'win':
        A.sfx('win'); stage.cinematic(true);
        s.players.forEach(function (p, i) { stage.react(i, i === e.p ? 'victory' : 'lose', 99); });
        stage.burst(tokPos(e.p), 'confetti', 80); stage.follow(e.p);
        wait(1800, done); return;
    }
    done();
  }
  function tokPos(i) { var tk = stage.tokens[i]; return tk ? tk.ch.group.position.clone().setY(0.6) : new THREE.Vector3(0, 0.5, 0); }
  function floatText(pi, text, cls) {
    var p = stage.screenPos(pi); if (!p) return;
    var el = h('div', 'float ' + (cls || ''), esc(text)); el.style.left = (p.x * 100) + '%'; el.style.top = (p.y * 100) + '%';
    $('floats').appendChild(el); setTimeout(function () { el.remove(); }, 1500);
  }
  var cardDone = null;
  function showCard(e, s, done) {
    var c = (e.deck === 'chance' ? R.CHANCE : R.CHEST)[e.id], wd = W.get(s.world);
    var box = $('card'); box.className = 'card3d ' + e.deck + ' ' + s.world;
    box.innerHTML = '<div class="inner"><div class="deck">' + esc(wd.deck[e.deck][S.lang]) + '</div><div class="ctext">' + esc(W.cardText(s.world, e.deck, e.id, S.lang, c)) + '</div><div class="cfoot">RicoPoly</div></div>';
    box.hidden = false; requestAnimationFrame(function () { box.classList.add('show'); });
    tip('card');
    var human = isLocalHuman(e.p);
    cardDone = function () { cardDone = null; box.classList.remove('show'); setTimeout(function () { box.hidden = true; }, 250); done(); };
    var ok = h('button', 'btn primary', t('ok')); ok.onclick = function () { if (cardDone) cardDone(); };
    box.querySelector('.inner').appendChild(ok);
    if (!human || M.skip) setTimeout(function () { if (cardDone) cardDone(); }, M.skip ? 0 : (S.think ? 2400 : 1200) / (S.speed || 1));
    else setTimeout(function () { if (cardDone) cardDone(); }, 9000);
  }
  function closeCard() { if (cardDone) cardDone(); }

  // ---------- Steuerung: Bots, Zeitlimits, Hotseat ----------
  function drive() {
    if (!M || M.busy) return;
    clearTimeout(M.botT);
    var s = M.s;
    if (s.phase === 'over') { showResults(); return; }
    renderHUD();
    if (M.client) return;   // Bots und Zeitlimits führt der Gastgeber aus
    if (M.host) { M.host.core.tick(); return; }
    // Angebote an Bots beantworten
    for (var k = 0; k < s.trades.length; k++) {
      var tr = s.trades[k];
      if (!s.players[tr.to].human && s.phase !== 'auction' && s.phase !== 'resolve') { M.botT = setTimeout(function (tr) { return function () { if (M && M.s.trades.some(function (x) { return x.id === tr.id; })) act(AI.respond(M.s, tr.to, tr)); }; }(tr), S.think ? 700 : 120); return; }
    }
    var who = R.actor(s);
    if (who < 0) return;
    if (!s.players[who].human) {
      $('thinking').hidden = !S.think;
      M.botT = setTimeout(function () {
        $('thinking').hidden = true;
        if (!M || M.busy || R.actor(M.s) !== who) return;
        var a = AI.next(M.s, who);
        if (a) act(a);
      }, S.think ? 650 + Math.random() * 450 : 90);
      return;
    }
    $('thinking').hidden = true;
    // Hotseat: Gerät übergeben, wenn ein anderer Mensch dran ist
    var humans = s.players.filter(function (p) { return p.human && !p.out; }).length;
    if (humans > 1 && who !== M.lastHuman && !M.covered) { cover(who, function () { M.lastHuman = who; renderHUD(); showIncoming(); }); return; }
    M.lastHuman = who;
    showIncoming();
    var key = s.turnId + ':' + who + ':' + s.phase;
    if (key !== M.lastKey) { M.lastKey = key; M.timerStart = Date.now(); }
    if (s.phase === 'buy' && s.pending) tipFirst('buyOffer');
  }
  function cover(p, then) {
    var s = M.s; M.covered = true;
    openModal(function (b) {
      b.className = 'modal-body cover';
      b.appendChild(h('div', 'big-ava', '<span style="background:' + pcol(p) + '"></span>'));
      b.appendChild(h('h2', null, t('hot.turn', { name: esc(s.players[p].name) })));
      b.appendChild(h('p', 'muted', t('hot.pass')));
      b.appendChild(btn(t('hot.ready', { name: esc(s.players[p].name) }), 'btn primary big', function () { M.covered = false; closeModal(); then(); }));
    }, true);
  }
  function clockTick() {
    if (!M || M.client || !M.s || M.s.phase === 'over') return;
    var s = M.s;
    // Zeitlimit Schnellspiel
    if (s.cfg.timeLimit && !M.busy) {
      var used = M.ms + (Date.now() - M.t0), left = s.cfg.timeLimit * 60000 - used;
      $('hudClock').textContent = '⏱ ' + fmTime(Math.max(0, left));
      if (left <= 0) { if (M.host) M.host.core.apply({ type: 'timeUp', p: -1, aid: 'time' }, 'host'); else take(R.apply(M.s, { type: 'timeUp', p: -1, aid: 'time' })); return; }
    }
    // Zugtimer für Menschen (lokal); online erledigt das der Gastgeber
    var who = R.actor(s);
    if (s.cfg.turnTimer && who >= 0 && s.players[who].human && !M.busy && !M.host && !M.covered) {
      var rest = s.cfg.turnTimer - (Date.now() - M.timerStart) / 1000;
      $('hudTimer').hidden = false; $('hudTimer').textContent = Math.max(0, Math.ceil(rest)) + 's';
      if (rest <= 0) { var orig = s.players[who].bot; s.players[who].bot = 'easy'; var a = AI.next(s, who); s.players[who].bot = orig; M.timerStart = Date.now(); if (a) { toast(t('timer.auto')); act(a); } }
    } else $('hudTimer').hidden = true;
  }
  function fmTime(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

  // ---------- HUD ----------
  function renderHUD() {
    if (!M) return;
    var s = M.view || M.s, live = M.s, who = R.actor(live);
    $('hudRound').textContent = t('round') + ' ' + s.round + (s.cfg.maxRounds ? '/' + s.cfg.maxRounds : '');
    var pl = $('players'); pl.innerHTML = '';
    s.players.forEach(function (p, i) {
      var card = h('button', 'pcard' + (i === s.cur ? ' cur' : '') + (p.out ? ' out' : '') + (i === who && i !== s.cur ? ' acting' : ''));
      card.style.setProperty('--pc', pcol(i));
      var off = M.netSeats && M.netSeats[i] && !M.netSeats[i].online && p.human;
      card.innerHTML = '<span class="dot"></span><span class="nm">' + esc(p.name) + (p.human ? '' : ' <small>🤖</small>') + (off ? ' <small>📴</small>' : '') + '</span>' +
        '<span class="mn">' + fm(p.money) + '</span><span class="wt">' + t('worth') + ' ' + fm(R.worth(s, i)) + '</span>' +
        (p.jail ? '<span class="badge">' + t('inJail') + '</span>' : '') + (p.cards.length ? '<span class="badge">🎟×' + p.cards.length + '</span>' : '');
      card.onclick = function () { showPlayer(i); };
      pl.appendChild(card);
    });
    var dock = $('dock'); dock.innerHTML = '';
    if (live.phase === 'over') return;
    var local = isLocalHuman(who);
    var status = $('status');
    if (M.busy) { status.textContent = ''; dock.appendChild(btn('⏩ ' + t('skip'), 'btn ghost', skipAnims)); return; }
    var nm = who >= 0 ? live.players[who].name : '';
    status.innerHTML = local ? t('yourTurn', { name: esc(nm) }) : t('waitFor', { name: esc(nm) });
    if (!local) { if (M.client || M.host) addManageButtons(dock); return; }
    var p = live.players[who];
    switch (live.phase) {
      case 'roll':
        if (p.jail) {
          status.innerHTML = t('jail.choose', { name: esc(nm), n: p.jailTurns + 1, max: live.cfg.maxJailTurns });
          dock.appendChild(btn('🎲 ' + t('jail.roll'), 'btn primary', function () { act({ type: 'roll', p: who }); }));
          if (p.money >= live.cfg.jailFine) dock.appendChild(btn(t('jail.pay', { v: fm(live.cfg.jailFine) }), 'btn', function () { act({ type: 'payJail', p: who }); }));
          if (p.cards.length) dock.appendChild(btn('🎟 ' + t('jail.card'), 'btn', function () { act({ type: 'useCard', p: who }); }));
        } else dock.appendChild(btn('🎲 ' + t('roll'), 'btn primary big pulse', function () { act({ type: 'roll', p: who }); }, { id: 'btnRoll' }));
        break;
      case 'buy': {
        var sq = live.pending.sq, b = BOARD[sq];
        status.innerHTML = t('buy.q', { sq: esc(sqName(sq)), v: fm(b.price) });
        dock.appendChild(btn('🏠 ' + t('buy.yes', { v: fm(b.price) }), 'btn primary', function () { act({ type: 'buy', p: who }); }, p.money < b.price ? { disabled: 'disabled' } : null));
        dock.appendChild(btn(live.cfg.auctions ? '🔨 ' + t('buy.auction') : t('buy.no'), 'btn', function () { act({ type: 'decline', p: who }); }));
        dock.appendChild(btn('ℹ', 'btn icon', function () { showSquare(sq); }, { 'aria-label': t('info') }));
        if (p.money < b.price) tipFirst('noMoney');
        break;
      }
      case 'auction': renderAuction(dock, live, who); break;
      case 'debt': {
        var d = live.debts[0], cred = d.to >= 0 ? live.players[d.to].name : t('bank');
        status.innerHTML = t('debt.q', { v: fm(d.amount), to: esc(cred), have: fm(p.money) });
        dock.appendChild(btn('💸 ' + t('debt.pay'), 'btn primary', function () { act({ type: 'payDebt', p: who }); }, p.money < d.amount ? { disabled: 'disabled' } : null));
        dock.appendChild(btn('🏦 ' + t('manage'), 'btn', function () { showManage(who); }));
        dock.appendChild(btn('☠ ' + t('debt.bankrupt'), 'btn danger', function () { confirmBox(t('debt.confirm', { v: fm(R.liquidity(live, who)) }), function () { act({ type: 'bankrupt', p: who }); }); }));
        tipFirst('debt');
        return;
      }
      case 'end':
        dock.appendChild(btn('✔ ' + t('endTurn'), 'btn primary', function () { act({ type: 'endTurn', p: who }); }, { id: 'btnEnd' }));
        break;
    }
    if (live.phase !== 'auction') addManageButtons(dock);
  }
  function addManageButtons(dock) {
    var me = holder(); if (me < 0 || M.s.players[me].out) return;
    dock.appendChild(btn('🏦 ' + t('manage'), 'btn', function () { showManage(me); }));
    dock.appendChild(btn('🤝 ' + t('trade'), 'btn', function () { openTrade(me, null); }));
    var inc = M.s.trades.filter(function (x) { return x.to === me; }).length;
    if (inc) dock.appendChild(btn('📨 ' + t('offers') + ' (' + inc + ')', 'btn attention', function () { showIncoming(true); }));
  }
  function renderAuction(dock, s, who) {
    var a = s.auction, p = s.players[who];
    $('status').innerHTML = t('auction.q', { sq: esc(sqName(a.sq)), v: fm(a.high), name: a.bidder >= 0 ? esc(s.players[a.bidder].name) : '—', who: esc(p.name) });
    [10, 50, 100].forEach(function (inc) {
      var v = Math.max(1, a.high + inc);
      dock.appendChild(btn('+' + inc + ' → ' + fm(v), 'btn', function () { act({ type: 'bid', p: who, amount: v }); }, v > p.money ? { disabled: 'disabled' } : null));
    });
    var custom = h('input', 'input sm num', null, { type: 'number', min: a.high + 1, max: p.money, 'aria-label': t('auction.amount') }); custom.value = Math.min(p.money, a.high + 25);
    dock.appendChild(custom);
    dock.appendChild(btn(t('auction.bid'), 'btn primary', function () { act({ type: 'bid', p: who, amount: +custom.value }); }));
    dock.appendChild(btn(t('pass'), 'btn ghost', function () { act({ type: 'pass', p: who }); }));
    dock.appendChild(btn('ℹ', 'btn icon', function () { showSquare(a.sq); }, { 'aria-label': t('info') }));
  }

  // ---------- Dialoge ----------
  function openModal(build, block) {
    var m = $('modal'), b = $('modalBody'); b.className = 'modal-body'; b.innerHTML = ''; m.hidden = false; m.classList.toggle('block', !!block);
    if (!block) { var x = btn('✕', 'icon close', closeModal, { 'aria-label': t('close') }); b.appendChild(x); }
    build(b);
  }
  function closeModal() { $('modal').hidden = true; if (M) renderHUD(); }
  function confirmBox(text, yes) { openModal(function (b) { b.appendChild(h('p', null, text)); var r = h('div', 'row'); r.appendChild(btn(t('yes'), 'btn danger', function () { closeModal(); yes(); })); r.appendChild(btn(t('no'), 'btn', closeModal)); b.appendChild(r); }); }
  function rentTable(sq) {
    var b = BOARD[sq], rows = '';
    if (b.t === 'prop') { var labels = [t('rent.base'), '1 🏠', '2 🏠', '3 🏠', '4 🏠', '🏨']; b.rent.forEach(function (r, i) { rows += '<tr><td>' + labels[i] + '</td><td>' + fm(r) + '</td></tr>'; }); rows += '<tr><td>' + t('rent.group') + '</td><td>' + fm(b.rent[0] * 2) + '</td></tr><tr><td>' + t('houseCost') + '</td><td>' + fm(b.hc) + '</td></tr>'; }
    else if (b.t === 'rail') R.RAIL_RENT.slice(1).forEach(function (r, i) { rows += '<tr><td>' + t('rent.rails', { n: i + 1 }) + '</td><td>' + fm(r) + '</td></tr>'; });
    else if (b.t === 'util') rows = '<tr><td>' + t('rent.util1') + '</td><td>4× 🎲</td></tr><tr><td>' + t('rent.util2') + '</td><td>10× 🎲</td></tr>';
    if (b.price) rows += '<tr><td>' + t('mortgageValue') + '</td><td>' + fm(b.price / 2) + '</td></tr>';
    return '<table class="rent">' + rows + '</table>';
  }
  function showSquare(sq) {
    var s = M ? M.s : null, b = BOARD[sq], wd = W.get(s ? s.world : prof.world);
    openModal(function (bx) {
      var head = h('div', 'deed-head', '<small>' + esc(t('type.' + b.t)) + '</small><b>' + esc(sqName(sq)) + '</b>');
      if (b.t === 'prop') head.style.background = wd.groups[b.g];
      bx.appendChild(head);
      if (b.price) {
        var o = s.own[sq];
        bx.appendChild(h('p', null, t('price') + ': <b>' + fm(b.price) + '</b> · ' + t('owner') + ': <b>' + (o.o >= 0 ? esc(s.players[o.o].name) : t('bank')) + '</b>' + (o.m ? ' · <span class="neg">' + t('mortgaged') + '</span>' : '') + (o.h ? ' · ' + (o.h === 5 ? '🏨' : o.h + ' 🏠') : '')));
        if (o.o >= 0 && o.o !== s.cur) bx.appendChild(h('p', 'muted', t('rent.now') + ': <b>' + fm(R.rent(s, sq, 7, null)) + '</b>' + (b.t === 'util' ? ' (' + t('rent.at7') + ')' : '')));
        bx.appendChild(h('div', null, rentTable(sq)));
      } else bx.appendChild(h('p', 'muted', t('sqhelp.' + b.t, { v: fm(b.tax || 0), go: fm(s ? s.cfg.passGo : 200), fine: fm(s ? s.cfg.jailFine : 50) })));
    });
  }
  function showPlayer(i) {
    var s = M.s, p = s.players[i];
    openModal(function (b) {
      b.appendChild(h('h2', null, '<span class="dot" style="background:' + pcol(i) + '"></span> ' + esc(p.name)));
      b.appendChild(h('p', null, charName(p.char) + ' · ' + fm(p.money) + ' · ' + t('worth') + ' ' + fm(R.worth(s, i))));
      b.appendChild(propList(s, i, false));
      if (!M.client || i === M.seat) {
        var r = h('div', 'row');
        C.EMOTES.forEach(function (em) { if (isLocalHuman(i)) r.appendChild(btn(t('emote.' + em), 'chip', function () { sendEmote(i, em); closeModal(); })); });
        b.appendChild(r);
      }
    });
  }
  function sendEmote(i, em) { stage.react(i, em, 2.2); if (M.client) M.client.send({ t: 'emote', e: em }); if (M.host) M.host.core.broadcast({ t: 'emote', seat: i, e: em }); }
  function propList(s, i, manage) {
    var wrap = h('div', 'props'), wd = W.get(s.world), any = false;
    for (var g = 0; g < 10; g++) R.GROUPS[g].forEach(function (sq) {
      var o = s.own[sq]; if (o.o !== i) return; any = true;
      var row = h('div', 'proprow' + (o.m ? ' mort' : ''));
      row.style.setProperty('--gc', BOARD[sq].t === 'prop' ? wd.groups[BOARD[sq].g] : '#888');
      row.appendChild(h('span', 'pname', esc(sqName(sq, s)) + ' <small>' + (o.h ? (o.h === 5 ? '🏨' : '🏠×' + o.h) : '') + (o.m ? ' ⛓' : '') + '</small>'));
      if (manage) {
        var ctl = h('span', 'ctl');
        var mk = function (label, type, err, tipKey) { var bt = btn(label, 'btn xs', function () { act({ type: type, p: i, sq: sq }); setTimeout(function () { if (M && !$('modal').hidden) showManage(i); }, 60); }, err ? { disabled: 'disabled', title: t('err.' + err) } : { title: t(tipKey) }); ctl.appendChild(bt); };
        if (BOARD[sq].t === 'prop') { mk('+🏠', 'build', R.buildError(s, i, sq), 'build'); mk('−🏠', 'sell', o.h === 5 ? '' : R.sellError(s, i, sq), 'sell'); }
        if (!o.m) mk('⛓ ' + fm(BOARD[sq].price / 2), 'mortgage', R.mortgageError(s, i, sq), 'mortgage'); else mk('🔓 ' + fm(R.unmortgageCost(sq)), 'unmortgage', R.unmortgageError(s, i, sq), 'unmortgage');
        row.appendChild(ctl);
      }
      row.onclick = function (e) { if (e.target.tagName !== 'BUTTON') showSquare(sq); };
      wrap.appendChild(row);
    });
    if (!any) wrap.appendChild(h('p', 'muted', t('noProps')));
    return wrap;
  }
  function showManage(i) {
    var s = M.s;
    openModal(function (b) {
      b.appendChild(h('h2', null, t('manage') + ' · ' + esc(s.players[i].name)));
      b.appendChild(h('p', 'muted small', t('manage.help', { cash: fm(s.players[i].money), liq: fm(R.liquidity(s, i)), h: s.bank.houses, ho: s.bank.hotels })));
      if (!R.canManage(s, i)) b.appendChild(h('p', 'warn small', t('manage.notNow')));
      b.appendChild(propList(s, i, true));
    });
  }

  // ---------- Handel ----------
  function openTrade(from, prefill) {
    var s = M.s, others = s.players.map(function (p, i) { return i; }).filter(function (i) { return i !== from && !s.players[i].out; });
    if (!others.length) return;
    var st = prefill || { to: others[0], give: { money: 0, props: [], cards: 0 }, get: { money: 0, props: [], cards: 0 } };
    openModal(function (b) {
      b.appendChild(h('h2', null, '🤝 ' + t(st.counter ? 'trade.counter' : 'trade.title')));
      var sel = h('select', 'input', null, { 'aria-label': t('trade.with') });
      others.forEach(function (i) { var o = h('option', null, esc(s.players[i].name)); o.value = i; if (i === st.to) o.selected = true; sel.appendChild(o); });
      sel.disabled = !!st.counter;
      sel.onchange = function () { st.to = +sel.value; st.get = { money: 0, props: [], cards: 0 }; openTrade(from, st); };
      b.appendChild(h('label', 'opt', '<span>' + t('trade.with') + '</span>')).appendChild(sel);
      var cols = h('div', 'tradecols');
      cols.appendChild(side(t('trade.give'), from, st.give));
      cols.appendChild(side(t('trade.get'), st.to, st.get));
      b.appendChild(cols);
      var msg = h('p', 'warn small'); b.appendChild(msg);
      b.appendChild(btn('📨 ' + t('trade.send'), 'btn primary', function () {
        var err = R.tradeError(s, { from: from, to: st.to, give: st.give, get: st.get });
        if (err) { msg.textContent = t('err.' + err); return; }
        if (st.counter) act({ type: 'counter', p: from, id: st.counter, give: st.give, get: st.get }); else act({ type: 'propose', p: from, to: st.to, give: st.give, get: st.get });
        closeModal(); toast(t('trade.sent'));
      }));
      tipFirst('trade');
    });
    function side(title, pi, sd) {
      var c = h('div', 'tcol'); c.appendChild(h('h4', null, esc(title) + ' <small>(' + esc(s.players[pi].name) + ')</small>'));
      var m = h('input', 'input sm', null, { type: 'number', min: 0, max: s.players[pi].money, step: 10, 'aria-label': t('money') }); m.value = sd.money || 0; m.oninput = function () { sd.money = Math.max(0, Math.min(s.players[pi].money, +m.value || 0)); };
      c.appendChild(h('label', 'opt', '<span>' + t('money') + ' (max ' + fm(s.players[pi].money) + ')</span>')).appendChild(m);
      s.own.forEach(function (o, sq) {
        if (!o || o.o !== pi) return;
        var blocked = R.groupHasBuildings(s, BOARD[sq].g);
        var l = h('label', 'opt chk' + (blocked ? ' dis' : '')), cb = h('input', null, null, { type: 'checkbox' }); cb.checked = sd.props.indexOf(sq) >= 0; cb.disabled = blocked;
        cb.onchange = function () { var k = sd.props.indexOf(sq); if (cb.checked && k < 0) sd.props.push(sq); if (!cb.checked && k >= 0) sd.props.splice(k, 1); };
        l.appendChild(cb); l.appendChild(h('span', null, '<i class="sw" style="background:' + (BOARD[sq].t === 'prop' ? W.get(s.world).groups[BOARD[sq].g] : '#888') + '"></i>' + esc(sqName(sq)) + (o.m ? ' ⛓' : '') + (blocked ? ' 🏠' : '')));
        c.appendChild(l);
      });
      if (s.players[pi].cards.length) { var k = h('input', 'input sm', null, { type: 'number', min: 0, max: s.players[pi].cards.length }); k.value = sd.cards || 0; k.oninput = function () { sd.cards = Math.max(0, Math.min(s.players[pi].cards.length, k.value | 0)); }; c.appendChild(h('label', 'opt', '<span>🎟 ' + t('trade.cards') + '</span>')).appendChild(k); }
      return c;
    }
  }
  function sideText(s, sd) {
    var parts = [];
    if (sd.money) parts.push(fm(sd.money));
    sd.props.forEach(function (sq) { parts.push(esc(sqName(sq, s)) + (s.own[sq].m ? ' ⛓' : '')); });
    if (sd.cards) parts.push('🎟×' + sd.cards);
    return parts.length ? parts.join(', ') : '—';
  }
  function showIncoming(force) {
    if (!M || M.busy) return;
    var s = M.s, me = holder(); if (me < 0) return;
    var list = s.trades.filter(function (x) { return x.to === me; });
    if (!list.length || (!force && !$('modal').hidden)) return;
    if (!force && M.shownTrades && list.every(function (x) { return M.shownTrades[x.id]; })) return;
    M.shownTrades = M.shownTrades || {};
    var tr = list[0]; M.shownTrades[tr.id] = 1;
    openModal(function (b) {
      b.appendChild(h('h2', null, '📨 ' + t('trade.incoming', { name: esc(s.players[tr.from].name) })));
      b.appendChild(h('div', 'tradesum', '<div><small>' + t('trade.youGet') + '</small><b>' + sideText(s, tr.give) + '</b></div><div><small>' + t('trade.youGive') + '</small><b>' + sideText(s, tr.get) + '</b></div>'));
      var r = h('div', 'row');
      r.appendChild(btn('✔ ' + t('trade.accept'), 'btn primary', function () { closeModal(); act({ type: 'accept', p: me, id: tr.id }); }));
      r.appendChild(btn('✕ ' + t('trade.reject'), 'btn', function () { closeModal(); act({ type: 'reject', p: me, id: tr.id }); }));
      r.appendChild(btn('↔ ' + t('trade.counter'), 'btn', function () { openTrade(me, { to: tr.from, counter: tr.id, give: { money: tr.get.money, props: tr.get.props.slice(), cards: tr.get.cards }, get: { money: tr.give.money, props: tr.give.props.slice(), cards: tr.give.cards } }); }));
      b.appendChild(r);
    });
  }

  // ---------- Ergebnis ----------
  function showResults() {
    if (!M || M.resultsShown) return;
    M.resultsShown = true;
    var s = M.s, ms = M.ms + (Date.now() - M.t0);
    var me = M.client || M.host ? M.seat : M.me;
    var gained = M.spectator ? [] : PF.recordGame(prof, s, me, { ms: ms, tutorial: M.tutorial });
    if (M.client || M.host) rememberFriends(s);
    // Weltweite Rangliste (Firebase): nur echte Partien des Profilinhabers, Fehler still ignorieren
    if (!M.spectator && !M.tutorial && me >= 0 && s.players[me] && window.RicoFire) window.RicoFire.submit(prof.name || t('guest'), prof.char, s.winner === me).catch(function () {});
    if (!M.client) { if (M.host) PF.deleteSave('host'); else PF.deleteSave(M.slot || 'auto'); }
    var order = R.ranking(s);
    setTimeout(function () {
      openModal(function (b) {
        b.className = 'modal-body results';
        b.appendChild(h('div', 'trophy', '🏆'));
        b.appendChild(h('h2', null, t('win.title', { name: esc(s.players[s.winner].name) })));
        b.appendChild(h('p', 'muted', t('win.reason.' + s.endReason) + ' · ' + t('round') + ' ' + s.round + ' · ' + fmTime(ms)));
        var tbl = '<table class="rank">';
        order.forEach(function (o, k) { var p = s.players[o.i]; tbl += '<tr' + (o.i === me ? ' class="me"' : '') + '><td>' + (k + 1) + '.</td><td><i class="dot" style="background:' + pcol(o.i) + '"></i>' + esc(p.name) + '</td><td>' + (p.out ? t('bankruptShort') : fm(o.w)) + '</td><td class="small">' + t('res.stats', { b: s.stats[o.i].bought, h: s.stats[o.i].built, r: fm(s.stats[o.i].rentGot) }) + '</td></tr>'; });
        b.appendChild(h('div', null, tbl + '</table>'));
        if (gained.length) { var ga = h('div', 'achs'); gained.forEach(function (id) { var a = PF.ACH.filter(function (x) { return x.id === id; })[0]; ga.appendChild(h('div', 'ach on', a.icon + ' <b>' + t('ach.' + id) + '</b>')); }); b.appendChild(h('h3', null, t('ach.new'))); b.appendChild(ga); A.sfx('achievement'); }
        var r = h('div', 'row');
        if (!M.client && !M.host) r.appendChild(btn('↻ ' + t('again'), 'btn primary', function () { var o = { players: s.players.map(function (p) { return { name: p.name, char: p.char, look: p.look, human: p.human, bot: p.bot }; }), mode: s.mode, cfg: s.cfg, world: s.world }; closeModal(); leaveMatch(true); startLocal(o, false); }));
        r.appendChild(btn('⌂ ' + t('toMenu'), 'btn', function () { closeModal(); leaveMatch(); }));
        b.appendChild(r);
      }, true);
    }, M.skip ? 0 : 1500);
  }
  function leaveMatch(silent) {
    if (M) { clearTimeout(M.botT); if (M.client) M.client.close(); if (M.host) M.host.close(); }
    stage.cinematic(false); M = null; $('tutorial').hidden = true;
    if (!silent) { stage.buildMenu(prof.world); stage.showcase(prof.char, prof.look); showMenu(); }
  }
  function checkAch() {
    if (!M || M.spectator) return;
    var me = M.client || M.host ? M.seat : M.me;
    PF.checkLive(prof, M.s, me).forEach(function (id) { var a = PF.ACH.filter(function (x) { return x.id === id; })[0]; toast(a.icon + ' ' + t('ach.unlocked') + ': ' + t('ach.' + id), 'ach'); A.sfx('achievement'); });
    if (M.tutorial) tutorialUpdate();
  }

  // ---------- Pause ----------
  function pauseMenu() {
    if (!M) return;
    openModal(function (b) {
      b.appendChild(h('h2', null, '⏸ ' + t('pause')));
      var c = h('div', 'col');
      c.appendChild(btn('▶ ' + t('resume'), 'btn primary', closeModal));
      if (!M.client && !M.host) ['slot1', 'slot2', 'slot3'].forEach(function (sl, k) { c.appendChild(btn('💾 ' + t('saveSlot', { n: k + 1 }), 'btn', function () { var meta = { mode: M.s.mode, world: M.s.world, round: M.s.round, names: M.s.players.map(function (p) { return p.name; }), ms: M.ms + (Date.now() - M.t0) }; if (PF.saveGame(sl, M.s, meta)) toast(t('saved')); else toast(t('saveFail'), 'warn'); })); });
      c.appendChild(btn('📜 ' + t('log'), 'btn', function () { closeModal(); $('logPanel').hidden = false; renderLog(); }));
      c.appendChild(btn('⚙ ' + t('menu.settings'), 'btn', function () { closeModal(); openSettings(true); }));
      c.appendChild(btn('📖 ' + t('menu.rules'), 'btn', function () { closeModal(); openRules(true); }));
      if (M.code) c.appendChild(h('p', 'muted small', t('net.code') + ': <b>' + M.code + '</b>'));
      c.appendChild(btn('🏳 ' + t('resign'), 'btn danger', function () { confirmBox(t('resign.confirm'), function () { var me = holder(); if (me >= 0) act({ type: 'resign', p: me }); }); }));
      c.appendChild(btn('⌂ ' + t('leave'), 'btn ghost', function () { autosave(true); closeModal(); leaveMatch(); toast(t(M && M.client ? 'net.left' : 'savedAuto')); }));
      b.appendChild(c);
    });
  }
  function overlayBack() { $('panel').hidden = true; $('hud').hidden = false; renderHUD(); }

  // ---------- Protokoll ----------
  function describe(e, s) {
    var n = function (i) { return i >= 0 && s.players[i] ? esc(s.players[i].name) : t('bank'); };
    switch (e.e) {
      case 'dice': return e.util ? t('log.utilDice', { d: e.d.join('+') }) : t('log.dice', { name: n(e.p), d: e.d.join(' + '), sum: e.d[0] + e.d[1] });
      case 'move': return t('log.move', { name: n(e.p), sq: esc(sqName(e.to, s)) });
      case 'pay': return e.from < 0 ? t('log.get', { name: n(e.to), v: fm(e.amt), why: t('why.' + (e.why || 'card')) }) : t('log.pay', { a: n(e.from), b: n(e.to), v: fm(e.amt), why: t('why.' + (e.why || 'card')) });
      case 'buy': return t('log.buy', { name: n(e.p), sq: esc(sqName(e.sq, s)), v: fm(e.amt) });
      case 'sold': return t('log.sold', { name: n(e.p), sq: esc(sqName(e.sq, s)), v: fm(e.amt) });
      case 'unsold': return t('log.unsold', { sq: esc(sqName(e.sq, s)) });
      case 'auction': return t('log.auction', { sq: esc(sqName(e.sq, s)) });
      case 'bid': return t('log.bid', { name: n(e.p), v: fm(e.amt) });
      case 'build': return t('log.build', { name: n(e.p), sq: esc(sqName(e.sq, s)), h: e.h === 5 ? '🏨' : e.h + ' 🏠' });
      case 'sell': return t('log.sell', { name: n(e.p), sq: esc(sqName(e.sq, s)) });
      case 'mortgage': return t('log.mortgage', { name: n(e.p), sq: esc(sqName(e.sq, s)), v: fm(e.amt) });
      case 'unmortgage': return t('log.unmortgage', { name: n(e.p), sq: esc(sqName(e.sq, s)), v: fm(e.amt) });
      case 'card': { var c = (e.deck === 'chance' ? R.CHANCE : R.CHEST)[e.id]; return '🃏 ' + n(e.p) + ': ' + esc(W.cardText(s.world, e.deck, e.id, S.lang, c)); }
      case 'jail': return t('log.jail', { name: n(e.p) });
      case 'free': return t('log.free', { name: n(e.p) });
      case 'stay': return t('log.stay2', { name: n(e.p), n: e.tries });
      case 'turn': return '— ' + t('log.turn', { name: n(e.p) }) + ' —';
      case 'trade': return t('log.trade', { a: n(e.from), b: n(e.to) });
      case 'offer2': return t('log.offer', { a: n(e.from), b: n(e.to) });
      case 'tradeReject': return t('log.reject', { b: n(e.to) });
      case 'bankrupt': return t('log.bankrupt', { name: n(e.p) });
      case 'win': return '🏆 ' + t('win.title', { name: n(e.p) });
      case 'rent': return t('log.rent', { name: n(e.p), sq: esc(sqName(e.sq, s)), v: fm(e.amt), to: n(e.to) });
      case 'tax': return t('log.tax', { name: n(e.p), v: fm(e.amt) });
    }
    return '';
  }
  function renderLog() {
    if (!M || $('logPanel').hidden) return;
    var s = M.s, ul = $('logList'); ul.innerHTML = '';
    s.log.slice(-80).reverse().forEach(function (e) { var d = describe(e, s); if (d && e.e !== 'pay' || (e.e === 'pay' && (e.why === 'go' || e.why === 'card' || e.why === 'interest' || e.why === 'pot'))) { if (d) ul.appendChild(h('li', 'log-' + e.e, d)); } });
  }

  // ---------- Tipps und Tutorial ----------
  function tip(key) {
    if (!M || (!S.tips && !M.tutorial)) return;
    prof.tips = prof.tips || {};
    if (prof.tips[key] && !M.tutorial) return;
    if (M.tipSeen[key]) return;
    M.tipSeen[key] = 1; prof.tips[key] = 1; saveProf();
    var el = $('tip'); el.innerHTML = '<b>💡 ' + t('tip.' + key + '.t') + '</b><span>' + t('tip.' + key) + '</span>';
    el.hidden = false; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.hidden = true; }, 300); }, 7000);
    el.onclick = function () { el.classList.remove('show'); el.hidden = true; };
  }
  function tipFirst(key) { tip(key); }
  var TUT = ['roll', 'buy', 'rent', 'trade', 'build', 'mortgage', 'auction', 'end'];
  function tutorialStart() { M.tut = {}; $('tutorial').hidden = false; tutorialUpdate(); tip('welcome'); }
  function tutorialUpdate() {
    if (!M || !M.tutorial) return;
    var s = M.s, log = s.log, me = 0, done = M.tut;
    log.forEach(function (e) {
      if (e.e === 'dice' && e.p === me) done.roll = 1;
      if ((e.e === 'buy' || e.e === 'sold') && e.p === me) done.buy = 1;
      if (e.e === 'rent' && (e.p === me || e.to === me)) done.rent = 1;
      if (e.e === 'trade' && (e.from === me || e.to === me)) done.trade = 1;
      if (e.e === 'build' && e.p === me) done.build = 1;
      if (e.e === 'mortgage' && e.p === me) done.mortgage = 1;
      if (e.e === 'auction') done.auction = 1;
      if (e.e === 'turn' && e.p !== me) done.end = 1;
    });
    var box = $('tutorial'); box.innerHTML = '<b>🎓 ' + t('tut.title') + '</b>';
    var ul = h('ol'); TUT.forEach(function (k) { ul.appendChild(h('li', done[k] ? 'done' : '', t('tut.' + k))); }); box.appendChild(ul);
    var n = TUT.filter(function (k) { return done[k]; }).length;
    if (n >= 6 && !prof.achievements.tutorial_done) { PF.unlock(prof, 'tutorial_done'); saveProf(); toast('🎓 ' + t('ach.tutorial_done'), 'ach'); }
    box.appendChild(btn(t('tut.hide'), 'btn xs ghost', function () { box.hidden = true; }));
  }

  // ---------- Fortsetzen ----------
  function openResume() {
    panel(t('menu.continue'), function (b) {
      var saves = PF.listSaves();
      if (!saves.length) b.appendChild(h('p', 'muted', t('resume.none')));
      saves.forEach(function (sv) {
        var row = h('div', 'saverow'), m = sv.meta || {}, wd = W.get(sv.s.world);
        row.appendChild(h('div', null, '<b>' + wd.icon + ' ' + t('slot.' + sv.slot) + '</b><small>' + new Date(sv.t).toLocaleString(S.lang) + ' · ' + esc(wd.title[S.lang]) + ' · ' + t('round') + ' ' + sv.s.round + '</small><small>' + esc((m.names || []).join(', ')) + '</small>'));
        row.appendChild(btn('▶ ' + t('resume'), 'btn primary sm', function () { resume(sv.slot); }));
        row.appendChild(btn('🗑', 'btn icon', function () { confirmBox(t('resume.delete'), function () { PF.deleteSave(sv.slot); openResume(); }); }, { 'aria-label': t('delete') }));
        b.appendChild(row);
      });
      b.appendChild(h('p', 'muted small', t('resume.cloud')));
    });
  }
  function resume(slot) {
    var d = PF.loadGame(slot);
    if (!d || d.error) { toast(t('resume.broken'), 'warn'); return; }
    if (slot === 'host' && d.meta && d.meta.net) { hostRoom({ resume: { state: d.s, seats: d.meta.net.seats }, code: d.meta.net.code, isPublic: d.meta.net.pub, ms: d.meta.ms }); return; }
    M = { s: d.s, local: true, me: d.s.players.map(function (p) { return p.human; }).indexOf(true), tutorial: !!(d.meta && d.meta.tutorial), t0: Date.now(), ms: (d.meta && d.meta.ms) || 0, slot: slot };
    enterGame();
    toast(t('resume.ok'));
  }

  // ---------- Online ----------
  function myNet() { prof.netToken = prof.netToken || PF.rid() + PF.rid(); saveProf(); return { name: prof.name || t('guest'), char: prof.char, look: prof.look, token: prof.netToken }; }
  function openOnline() {
    panel(t('menu.online'), function (b) {
      if (!window.Peer && !(window.RicoFire && window.RTCPeerConnection)) { b.appendChild(h('p', 'warn', t('net.nopeer'))); return; }
      b.appendChild(h('p', 'muted', t('net.intro')));
      var r = h('div', 'col');
      r.appendChild(btn('🔒 ' + t('net.createPrivate'), 'btn primary', function () { hostRoom({ isPublic: false }); }));
      r.appendChild(btn('🌍 ' + t('net.createPublic'), 'btn', function () { hostRoom({ isPublic: true }); }));
      b.appendChild(r);
      b.appendChild(h('h3', null, t('net.join')));
      var row = h('div', 'row'), inp = h('input', 'input code', null, { maxlength: 6, placeholder: 'ABC123', 'aria-label': t('net.code'), autocapitalize: 'characters' });
      inp.oninput = function () { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
      row.appendChild(inp); row.appendChild(btn(t('net.joinBtn'), 'btn primary', function () { if (/^[A-Z0-9]{6}$/.test(inp.value)) joinRoom(inp.value); else toast(t('net.badCode'), 'warn'); }));
      b.appendChild(row);
      b.appendChild(h('h3', null, t('net.public')));
      var list = h('div', 'col', '<p class="muted">' + t('net.searching') + '</p>'); b.appendChild(list);
      var search = function () { list.innerHTML = '<p class="muted">' + t('net.searching') + '</p>'; NET.scan(function (rooms) { list.innerHTML = ''; if (!rooms.length) list.appendChild(h('p', 'muted', t('net.noneFound'))); rooms.forEach(function (rm) { var b = btn('', 'btn', function () { joinRoom(rm.code); }); b.textContent = '▶ ' + rm.host + ' · ' + W.get(rm.world).title[S.lang] + ' · ' + t('mode.' + rm.mode) + ' · ' + rm.n + '/' + rm.max; list.appendChild(b); }); list.appendChild(btn('↻ ' + t('net.refresh'), 'btn ghost sm', search)); }); };
      search();
    });
  }
  function hostRoom(o) {
    var me = myNet(), code = o.code || NET.code6();
    M = { s: null, host: null, seat: 0, code: code, t0: Date.now(), ms: o.ms || 0, lobby: null, netSeats: null };
    var mm = M;
    var host = new NET.Host({ code: code, isPublic: !!o.isPublic, me: me, resume: o.resume,
      onOpen: function () { if (mm === M && !mm.s) renderLobby(); },
      onError: function (why) { toast(t('net.err.' + why), 'warn'); },
      onChange: function (ch) {
        if (mm !== M) return;
        if (ch.lobby) { M.lobby = ch.lobby; M.netSeats = ch.lobby.seats; if (!M.s) renderLobby(); else renderHUD(); }
        if (ch.emote) stage.react(ch.emote.seat, ch.emote.e, 2.2);
        if (ch.state) {
          var first = !M.s; M.s = ch.state;
          if (first) { M.view = ch.state; enterGame(); } else { queue(ch.events || [], ch.state); autosave(); }
        }
        if (ch.offline != null && M.s) toast(t('net.playerOff', { name: esc(M.s.players[ch.offline].name) }), 'warn');
        if (ch.rejoin != null && M.s) toast(t('net.playerBack', { name: esc(M.s.players[ch.rejoin].name) }));
      } });
    M.host = host;
    if (o.resume) { M.s = host.core.state; M.netSeats = host.core.lobbyInfo().seats; enterGame(); toast(t('net.resumed', { code: code })); }
    else renderLobby();
  }
  function joinRoom(code) {
    var me = myNet();
    M = { s: null, client: null, seat: -1, code: code, t0: Date.now(), ms: 0, lobby: null };
    var mm = M;
    panel(t('net.lobby') + ' ' + code, function (b) { b.appendChild(h('p', 'muted', t('net.connecting'))); }, { back: function () { leaveMatch(); } });
    M.client = new NET.Client({ code: code, me: me,
      onWelcome: function (w) { if (mm === M) { M.seat = w.seat; prof.lastRoom = { code: code, t: Date.now() }; saveProf(); } },
      onLobby: function (l) { if (mm !== M) return; M.lobby = l; M.netSeats = l.seats; if (!M.s) renderLobby(); else renderHUD(); },
      onState: function (s, ev, start) { if (mm !== M) return; var first = !M.s; M.s = s; if (first) { M.view = s; enterGame(); } else queue(ev, s); },
      onReject: function (err) { toast(t('err.' + err), 'warn'); A.sfx('error'); },
      onEmote: function (seat, e) { stage.react(seat, e, 2.2); },
      onStatus: function (st) { if (mm !== M) return; $('netState').hidden = st === 'online'; if (st === 'online' && M.s) M.client.send({ t: 'sync' }); },
      onError: function (why) { if (mm === M) toast(t('net.err.' + why), 'warn'); } });
  }
  function renderLobby() {
    if (!M || M.s) return;
    var l = M.lobby || (M.host ? M.host.core.lobbyInfo() : null), isHost = !!M.host;
    panel(t('net.lobby') + ' · ' + M.code, function (b) {
      var link = inviteBase() + '#room=' + M.code;
      b.appendChild(h('div', 'codebox', '<small>' + t('net.code') + '</small><b>' + M.code + '</b>'));
      var share = h('div', 'row');
      share.appendChild(btn('🔗 ' + t('net.copyLink'), 'btn sm', function () { copy(link); }));
      if (navigator.share) share.appendChild(btn('📤 ' + t('net.share'), 'btn sm', function () { navigator.share({ title: 'RicoPoly 3D', text: t('net.inviteText', { code: M.code }), url: link }).catch(function () {}); }));
      b.appendChild(share);
      if (!l) { b.appendChild(h('p', 'muted', t('net.connecting'))); return; }
      b.appendChild(h('h3', null, t('setup.players')));
      l.seats.forEach(function (s, i) { b.appendChild(h('div', 'prow', '<span class="dot" style="background:' + pcol(i) + '"></span><b>' + esc(s.name) + '</b> <small>' + esc(charName(s.char)) + '</small> ' + (s.host ? '<span class="tag">' + t('net.host') + '</span>' : '') + (s.ready ? ' <span class="tag ok">✔ ' + t('net.ready') + '</span>' : ' <span class="tag">' + t('net.notReady') + '</span>') + (s.online ? '' : ' 📴'))); });
      l.settings.bots.forEach(function (bt, k) { b.appendChild(h('div', 'prow', '<span class="dot" style="background:' + pcol(l.seats.length + k) + '"></span>🤖 ' + esc(bt.name) + ' <small>' + t('bot.' + bt.level) + '</small>')); });
      b.appendChild(h('p', 'muted small', t('net.settingsNow', { world: W.get(l.settings.world).title[S.lang], mode: t('mode.' + l.settings.mode) })));
      if (isHost) {
        var core = M.host.core, st = core.settings;
        var ws = h('div', 'seg'); W.ORDER.forEach(function (id) { ws.appendChild(btn(W.get(id).icon + ' ' + W.get(id).title[S.lang], 'segbtn' + (st.world === id ? ' on' : ''), function () { core.configure({ world: id }); renderLobby(); })); }); b.appendChild(ws);
        var ms = h('div', 'seg'); ['classic', 'quick'].forEach(function (m) { ms.appendChild(btn(t('mode.' + m), 'segbtn' + (st.mode === m ? ' on' : ''), function () { core.configure({ mode: m, cfg: R.config(m) }); renderLobby(); })); }); b.appendChild(ms);
        var br = h('div', 'row');
        br.appendChild(btn('+ 🤖 ' + t('setup.addBot'), 'btn sm', function () { var bots = st.bots.slice(); if (core.seats.length + bots.length < 6) bots.push({ name: ['Robo', 'Merlin', 'Luna', 'Kobo', 'Nova'][bots.length % 5], level: 'medium', char: ['robot', 'wizard', 'queen', 'goblin', 'android'][bots.length % 5] }); core.configure({ bots: bots }); renderLobby(); }));
        if (st.bots.length) br.appendChild(btn('− 🤖', 'btn sm', function () { core.configure({ bots: st.bots.slice(0, -1) }); renderLobby(); }));
        var tt = h('select', 'input sm', null, { 'aria-label': t('cfg.turnTimer') }); [0, 30, 60, 90, 120].forEach(function (v) { var o = h('option', null, v ? v + 's ' + t('cfg.turnTimer') : t('net.noTimer')); o.value = v; if ((st.cfg.turnTimer || 0) === v) o.selected = true; tt.appendChild(o); });
        tt.onchange = function () { core.configure({ cfg: Object.assign({}, st.cfg, { turnTimer: +tt.value }) }); };
        br.appendChild(tt); b.appendChild(br);
        b.appendChild(btn('▶ ' + t('net.start'), 'btn primary big', function () { if (!core.start()) toast(t('net.cantStart'), 'warn'); }, core.canStart() ? null : { disabled: 'disabled' }));
      } else {
        var mine = l.seats[M.seat];
        b.appendChild(btn(mine && mine.ready ? '✔ ' + t('net.ready') : t('net.setReady'), 'btn primary big', function () { M.client.send({ t: 'ready', v: !(mine && mine.ready) }); }));
      }
    }, { back: function () { leaveMatch(); } });
  }
  // Mehrspieler-Regel (CLAUDE.md): Einladungen zeigen immer auf die easygames-Homepage, nie auf die lokale App-Adresse
  // (appassets…, file:, localhost, LAN) – wie EasyGamesDevice.publicBase in ../device.js und EasyGamesLink in ../cloud/fire-peer.js
  var PUBLIC_URL = 'https://ricorewioriginal-collab.github.io/easygames/ricopoly/';
  function inviteBase() {
    var c = window.EASYGAMES_PUBLIC_BASE;
    return c ? (/\/$/.test(c) ? c : c + '/') + 'ricopoly/' : PUBLIC_URL;
  }
  function copy(text) { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { toast(t('copied')); }).catch(function () { window.prompt(t('net.copyLink'), text); }); }
  function rememberFriends(s) {
    var me = M.seat;
    (M.netSeats || []).forEach(function (seat, i) {
      if (i === me || !s.players[i] || !s.players[i].human) return;
      var f = prof.friends.filter(function (x) { return x.name === seat.name; })[0];
      if (!f) { f = { name: seat.name, char: seat.char, games: 0 }; prof.friends.unshift(f); }
      f.games++; f.last = Date.now(); f.char = seat.char;
    });
    prof.friends = prof.friends.slice(0, 50); saveProf();
  }
  function openFriends() {
    panel(t('menu.friends'), function (b) {
      b.appendChild(h('p', 'muted', t('friends.help')));
      if (!prof.friends.length) b.appendChild(h('p', 'muted', t('friends.none')));
      prof.friends.forEach(function (f, k) {
        var row = h('div', 'saverow');
        row.appendChild(h('div', null, '<b>' + esc(f.name) + '</b><small>' + esc(charName(f.char)) + ' · ' + t('friends.games', { n: f.games }) + (f.last ? ' · ' + new Date(f.last).toLocaleDateString(S.lang) : '') + '</small>'));
        row.appendChild(btn('✉ ' + t('friends.invite'), 'btn sm', function () { hostRoom({ isPublic: false }); toast(t('friends.inviteHint', { name: f.name })); }));
        row.appendChild(btn('🗑', 'btn icon', function () { prof.friends.splice(k, 1); saveProf(); openFriends(); }, { 'aria-label': t('delete') }));
        b.appendChild(row);
      });
      var add = h('div', 'row'), inp = h('input', 'input sm', null, { maxlength: 20, placeholder: t('friends.addName') });
      add.appendChild(inp); add.appendChild(btn('+ ' + t('friends.add'), 'btn sm', function () { var n = inp.value.trim(); if (!n) return; prof.friends.unshift({ name: n, char: 'businessman', games: 0 }); saveProf(); openFriends(); }));
      b.appendChild(add);
      if (prof.lastRoom && Date.now() - prof.lastRoom.t < 864e5) b.appendChild(btn('↩ ' + t('net.rejoin', { code: prof.lastRoom.code }), 'btn', function () { joinRoom(prof.lastRoom.code); }));
    });
  }

  // ---------- Charaktere ----------
  var edit = null;
  function openChars(fromCreate) {
    edit = { char: prof.char, look: Object.assign({}, prof.look) };
    if (stage.mode !== 'menu') stage.buildMenu(prof.world);
    stage.showcase(edit.char, edit.look, 'idle');
    renderChars(fromCreate);
  }
  function renderChars(fromCreate) {
    panel(t('chars.title'), function (b) {
      var grid = h('div', 'chargrid');
      [['human', t('chars.human')], ['fantasy', t('chars.fantasy')], ['scifi', t('chars.scifi')]].forEach(function (gr) {
        grid.appendChild(h('div', 'gh', gr[1]));
        C.LIST.filter(function (c) { return c.group === gr[0]; }).forEach(function (c) {
          var locked = !PF.isUnlocked(prof, c.id);
          grid.appendChild(btn('<i style="background:' + c.c1 + '"></i>' + esc(c[S.lang]) + (locked ? ' 🔒' : ''), 'charbtn' + (edit.char === c.id ? ' on' : '') + (locked ? ' locked' : ''), function () {
            if (locked) { toast(t('chars.locked', { a: t('ach.' + C.LOCKED[c.id]) }), 'warn'); }
            edit.char = c.id; edit.look = {}; stage.showcase(edit.char, edit.look, 'cheer'); renderChars(fromCreate);
          }));
        });
      });
      b.appendChild(grid);
      var L = C.lookOf(edit.char, edit.look), def = C.BY[edit.char];
      var row = function (label, el) { var r = h('label', 'opt', '<span>' + label + '</span>'); r.appendChild(el); b.appendChild(r); };
      ['c1', 'c2'].forEach(function (k) { var inp = h('input', 'color', null, { type: 'color' }); inp.value = L[k]; inp.oninput = function () { edit.look[k] = inp.value; stage.showcase(edit.char, edit.look, 'idle'); }; row(t('chars.' + k), inp); });
      var seg = function (label, n, key, names) { var s = h('div', 'seg'); for (var i = 0; i < n; i++) (function (i) { s.appendChild(btn(names ? names[i] : String(i + 1), 'segbtn' + (L[key] === (names ? C[key === 'acc' ? 'ACCESSORIES' : 'EMOTES'][i] : i) ? ' on' : ''), function () { edit.look[key] = names ? C[key === 'acc' ? 'ACCESSORIES' : 'EMOTES'][i] : i; stage.showcase(edit.char, edit.look, key === 'pose' ? 'victory' : key === 'emote' ? edit.look.emote : 'idle'); renderChars(fromCreate); })); })(i); var r = h('div', 'opt'); r.appendChild(h('span', null, label)); r.appendChild(s); b.appendChild(r); };
      seg(t('chars.outfit'), C.OUTFITS, 'outfit');
      seg(t('chars.acc'), C.ACCESSORIES.length, 'acc', C.ACCESSORIES.map(function (a) { return t('acc.' + a); }));
      seg(t('chars.pose'), C.POSES, 'pose');
      seg(t('chars.emote'), C.EMOTES.length, 'emote', C.EMOTES.map(function (a) { return t('emote.' + a); }));
      b.appendChild(h('h3', null, t('chars.try')));
      var anims = h('div', 'chips');
      C.STATES.concat(C.EMOTES).forEach(function (st) { anims.appendChild(btn(t('anim.' + st), 'chip', function () { if (stage.preview) stage.preview.play(st, { restart: true, dur: /idle|walk|run|jail|victory/.test(st) ? 0 : 2.5, then: 'idle' }); })); });
      b.appendChild(anims);
      var z = h('div', 'row'); z.appendChild(btn('⟲', 'btn icon', function () { stage.rotate(-0.6, 0); }, { 'aria-label': t('rotate') })); z.appendChild(btn('⟳', 'btn icon', function () { stage.rotate(0.6, 0); }, { 'aria-label': t('rotate') })); z.appendChild(btn('＋', 'btn icon', function () { stage.zoom(0.85); }, { 'aria-label': t('zoomIn') })); z.appendChild(btn('－', 'btn icon', function () { stage.zoom(1.15); }, { 'aria-label': t('zoomOut') }));
      b.appendChild(z);
      b.appendChild(h('p', 'muted small', t('chars.hint')));
      b.appendChild(btn('💾 ' + t('chars.save'), 'btn primary', function () {
        if (!PF.isUnlocked(prof, edit.char)) return toast(t('chars.locked', { a: t('ach.' + C.LOCKED[edit.char]) }), 'warn');
        prof.char = edit.char; prof.look = edit.look; saveProf(); toast(t('saved')); if (fromCreate) openWorlds(true); else showMenu();
      }));
    }, { side: true });
  }

  // ---------- Welten ----------
  function openWorlds(fromCreate) {
    panel(t('menu.worlds'), function (b) {
      W.ORDER.forEach(function (id) {
        var wd = W.get(id);
        b.appendChild(btn('<b>' + wd.icon + ' ' + esc(wd.title[S.lang]) + '</b><small>' + esc(wd.desc[S.lang]) + '</small><small class="muted">' + t('worlds.sample', { a: esc(wd.sq[S.lang][39]), b: esc(wd.sq[S.lang][5]) }) + '</small>', 'wcard ' + id + (prof.world === id ? ' on' : ''), function () {
          prof.world = id; saveProf(); stage.buildMenu(id); stage.showcase(prof.char, prof.look, 'cheer'); openWorlds(fromCreate);
        }));
      });
      b.appendChild(btn(fromCreate ? '▶ ' + t('next') : '✔ ' + t('ok'), 'btn primary', function () { if (fromCreate) { showMenu(); tip0('welcomeMenu'); } else showMenu(); }));
    }, { side: true });
  }
  function tip0() { toast(t('tip.welcomeMenu')); }

  // ---------- Erfolge, Rangliste, Profil ----------
  function openAch() {
    panel(t('menu.ach'), function (b) {
      var g = h('div', 'achs');
      PF.ACH.forEach(function (a) { var on = prof.achievements[a.id]; g.appendChild(h('div', 'ach' + (on ? ' on' : ''), '<span class="ic">' + a.icon + '</span><b>' + t('ach.' + a.id) + '</b><small>' + t('ach.' + a.id + '.d') + (on ? ' · ' + new Date(on).toLocaleDateString(S.lang) : '') + '</small>')); });
      b.appendChild(g);
      b.appendChild(h('p', 'muted small', t('ach.cosmetic')));
    });
  }
  function openRank() {
    panel(t('menu.rank'), function (b) {
      var st = prof.stats, rows = [{ name: prof.name || t('guest'), wins: st.wins, games: st.games, me: true }];
      prof.friends.forEach(function (f) { rows.push({ name: f.name, wins: null, games: f.games }); });
      var gl = h('div', null, '<p class="muted small">' + t('rank.loading') + '</p>');
      b.appendChild(h('h3', null, '🌍 ' + t('rank.global'))); b.appendChild(gl);
      if (window.RicoFire) window.RicoFire.top(25).then(function (rows) {
        if (!rows.length) { gl.innerHTML = '<p class="muted small">' + t('rank.globalEmpty') + '</p>'; return; }
        var my = window.RicoFire.myUid(), g = '<table class="rank"><tr><th>#</th><th>' + t('profile.name') + '</th><th>' + t('stats.wins') + '</th><th>' + t('stats.games') + '</th><th>' + t('stats.rate') + '</th></tr>';
        rows.forEach(function (r, k) { g += '<tr' + (r.uid === my ? ' class="me"' : '') + '><td>' + (k + 1) + '</td><td>' + esc(r.name) + ' <small>' + esc(charName(r.char)) + '</small></td><td>' + r.wins + '</td><td>' + r.games + '</td><td>' + (r.games ? Math.round(r.wins / r.games * 100) + ' %' : '–') + '</td></tr>'; });
        gl.innerHTML = g + '</table><p class="muted small">' + t('rank.globalNote') + '</p>';
      }, function () { gl.innerHTML = '<p class="muted small">' + t('rank.globalOff') + '</p>'; });
      else gl.innerHTML = '<p class="muted small">' + t('rank.globalOff') + '</p>';
      b.appendChild(h('h3', null, '👥 ' + t('rank.local')));
      b.appendChild(h('p', 'muted small', t('rank.note')));
      var tbl = '<table class="rank"><tr><th>#</th><th>' + t('profile.name') + '</th><th>' + t('stats.wins') + '</th><th>' + t('stats.games') + '</th><th>' + t('stats.rate') + '</th></tr>';
      rows.sort(function (a, b) { return (b.wins || 0) - (a.wins || 0); }).forEach(function (r, k) { tbl += '<tr' + (r.me ? ' class="me"' : '') + '><td>' + (k + 1) + '</td><td>' + esc(r.name) + '</td><td>' + (r.wins == null ? '–' : r.wins) + '</td><td>' + r.games + '</td><td>' + (r.wins == null || !r.games ? '–' : Math.round(r.wins / r.games * 100) + ' %') + '</td></tr>'; });
      b.appendChild(h('div', null, tbl + '</table>'));
    });
  }
  function fav(obj) { var best = null, n = 0; for (var k in obj) if (obj[k] > n) { n = obj[k]; best = k; } return best; }
  function openProfile() {
    panel(t('menu.profile'), function (b) {
      var st = prof.stats;
      var nameRow = h('div', 'row'), inp = h('input', 'input', null, { maxlength: 20, 'aria-label': t('profile.name') }); inp.value = prof.name;
      nameRow.appendChild(h('span', null, avatarHTML(prof, 44))); nameRow.appendChild(inp); nameRow.appendChild(btn('✔', 'btn sm', function () { prof.name = inp.value.trim().slice(0, 20) || prof.name; saveProf(); toast(t('saved')); }));
      b.appendChild(nameRow);
      b.appendChild(avatarPicker());
      b.appendChild(h('p', 'muted small', t('profile.id') + ': ' + prof.id));
      var grid = h('div', 'stats');
      [['stats.games', st.games], ['stats.wins', st.wins], ['stats.losses', st.losses], ['stats.rate', st.games ? Math.round(st.wins / st.games * 100) + ' %' : '–'], ['stats.time', fmTime(st.playMs)], ['stats.richest', fm(st.highestMoney)], ['stats.streak', st.bestStreak], ['stats.favChar', charName(fav(st.byChar) || prof.char)], ['stats.favWorld', fav(st.byWorld) ? W.get(fav(st.byWorld)).title[S.lang] : '–']].forEach(function (x) { grid.appendChild(h('div', 'stat', '<small>' + t(x[0]) + '</small><b>' + esc(x[1]) + '</b>')); });
      b.appendChild(grid);
      b.appendChild(h('h3', null, t('profile.history')));
      if (!prof.history.length) b.appendChild(h('p', 'muted', t('profile.noHistory')));
      prof.history.slice(0, 10).forEach(function (x) { b.appendChild(h('div', 'hist ' + (x.won ? 'won' : ''), (x.won ? '🏆' : x.place + '.') + ' ' + W.get(x.world).title[S.lang] + ' · ' + t('mode.' + x.mode) + (x.online ? ' 🌐' : '') + ' · ' + fm(x.worth) + ' · <small>' + new Date(x.d).toLocaleDateString(S.lang) + '</small>')); });
      b.appendChild(h('h3', null, t('profile.cloud')));
      var cb = h('div', 'cloudbox', null, { id: 'cloudMount3' }); b.appendChild(cb); mountCloud('cloudMount3');
      b.appendChild(h('p', 'muted small', t('profile.cloudHelp')));
      var r = h('div', 'row');
      r.appendChild(btn('⬇ ' + t('profile.export'), 'btn sm', function () { var blob = new Blob([PF.exportData(prof)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ricopoly-profil.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }));
      r.appendChild(btn('🗑 ' + t('profile.delete'), 'btn sm danger', function () { confirmBox(t('profile.deleteConfirm'), function () { PF.wipe(); prof = PF.load(); S = prof.settings; toast(t('profile.deleted')); askName(); }); }));
      b.appendChild(r);
    });
  }

  // ---------- Einstellungen ----------
  function openSettings(inGame) {
    panel(t('menu.settings'), function (b) {
      var sel = function (key, opts) { var s = h('select', 'input sm', null, { 'aria-label': t('set.' + key) }); opts.forEach(function (o) { var e = h('option', null, t(o[1])); e.value = o[0]; if (String(S[key]) === String(o[0])) e.selected = true; s.appendChild(e); }); s.onchange = function () { S[key] = isNaN(+s.value) || key === 'quality' || key === 'lang' ? s.value : +s.value; changed(key); }; var r = h('label', 'opt', '<span>' + t('set.' + key) + '</span>'); r.appendChild(s); b.appendChild(r); };
      var chk = function (key) { var r = h('label', 'opt chk'), c = h('input', null, null, { type: 'checkbox' }); c.checked = !!S[key]; c.onchange = function () { S[key] = c.checked; changed(key); }; r.appendChild(c); r.appendChild(h('span', null, t('set.' + key))); b.appendChild(r); };
      var range = function (key) { var r = h('label', 'opt', '<span>' + t('set.' + key) + '</span>'), c = h('input', null, null, { type: 'range', min: 0, max: 1, step: 0.05 }); c.value = S[key]; c.oninput = function () { S[key] = +c.value; changed(key); }; r.appendChild(c); b.appendChild(r); };
      b.appendChild(h('h3', null, t('set.general')));
      sel('lang', [['de', 'lang.de'], ['en', 'lang.en']]);
      chk('tips'); chk('think'); chk('autoCam');
      sel('speed', [[0.75, 'speed.slow'], [1, 'speed.normal'], [1.5, 'speed.fast'], [2.5, 'speed.turbo']]);
      b.appendChild(h('h3', null, t('set.graphics')));
      sel('quality', [['auto', 'q.auto'], ['low', 'q.low'], ['medium', 'q.medium'], ['high', 'q.high']]);
      chk('shadows'); chk('particles'); chk('reduced'); chk('saver');
      b.appendChild(h('h3', null, t('set.audio')));
      range('master'); range('music'); range('sfx'); chk('mute');
      var fs = btn('⛶ ' + t('set.fullscreen'), 'btn sm', function () { var d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(function () {}); else if (document.exitFullscreen) document.exitFullscreen(); });
      b.appendChild(fs);
      b.appendChild(h('p', 'muted small', t('set.info', { fps: Math.round(stage.fps || 0), q: t('q.' + stage.q) })));
    }, inGame ? { back: overlayBack } : null);
    function changed(key) {
      saveProf();
      if (key === 'lang') { applyLang(); if (M && M.s) { stage.buildBoard(M.s.world, S.lang); stage.setPlayers(M.s.players); stage.sync(M.s); } openSettings(inGame); }
      if (/quality|shadows|particles|reduced|saver/.test(key)) stage.setOptions({ quality: S.quality, shadows: S.shadows, particles: S.particles, reduced: S.reduced, saver: S.saver });
      if (key === 'quality' && M && M.s) { stage.buildBoard(M.s.world, S.lang); stage.setPlayers(M.s.players); stage.sync(M.s); }
      if (/master|music|sfx|mute/.test(key)) A.set({ master: S.master, music: S.music, sfx: S.sfx, mute: S.mute });
      if (key === 'speed') stage.speed = S.speed;
    }
  }

  // ---------- Regeln ----------
  function openRules(inGame) {
    panel(t('menu.rules'), function (b) {
      if (!inGame) b.appendChild(btn('🎓 ' + t('tut.start'), 'btn primary', function () { startLocal({ players: [{ name: prof.name || t('player'), char: prof.char, look: prof.look, human: true }, { name: 'Robo', char: 'robot', human: false, bot: 'easy' }], mode: 'classic', cfg: R.config('classic'), world: prof.world }, true); }));
      I.rules(S.lang).forEach(function (sec) { var d = h('details', 'rule'); d.appendChild(h('summary', null, sec[0])); d.appendChild(h('div', null, sec[1])); b.appendChild(d); });
      b.appendChild(h('p', 'muted small', t('rules.legal')));
    }, inGame ? { back: overlayBack } : null);
  }

  // ---------- Tastatur, Controller-Kamera ----------
  function onKey(e) {
    if (/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName)) return;
    if (M && !$('hud').hidden && $('modal').hidden) {
      if (e.code === 'Space' || e.code === 'Enter') { var b = $('dock').querySelector('.btn.primary:not([disabled])'); if (b) { e.preventDefault(); b.click(); } }
      else if (e.code === 'Escape' || e.code === 'KeyP') pauseMenu();
      else if (e.code === 'KeyQ' || e.code === 'ArrowLeft') stage.rotate(0.12, 0);
      else if (e.code === 'KeyE' || e.code === 'ArrowRight') stage.rotate(-0.12, 0);
      else if (e.code === 'ArrowUp') stage.rotate(0, -0.06);
      else if (e.code === 'ArrowDown') stage.rotate(0, 0.06);
      else if (e.key === '+' || e.code === 'NumpadAdd') stage.zoom(0.9);
      else if (e.key === '-' || e.code === 'NumpadSubtract') stage.zoom(1.1);
      else if (e.code === 'KeyO') stage.overview();
      else if (e.code === 'KeyS') skipAnims();
      else if (e.code === 'KeyM') { S.mute = !S.mute; A.set({ mute: S.mute }); saveProf(); toast(S.mute ? '🔇' : '🔊'); }
    } else if (e.code === 'Escape' && !$('modal').hidden && !$('modal').classList.contains('block')) closeModal();
  }
  function bindPadCamera() {
    // Rechter Stick wird von gamepad.js als Mauszeiger genutzt; hier: Schultertasten LB/RB drehen (Q/E über gamepad.js), Trigger zoomen
    var last = 0;
    function poll() {
      requestAnimationFrame(poll);
      var pads = navigator.getGamepads ? navigator.getGamepads() : []; var p = pads && (pads[0] || pads[1]); if (!p || !M) return;
      var now = performance.now(); if (now - last < 30) return; last = now;
      var lt = p.buttons[6] ? p.buttons[6].value : 0, rt = p.buttons[7] ? p.buttons[7].value : 0;
      if (lt > 0.2) stage.zoom(1 + lt * 0.03); if (rt > 0.2) stage.zoom(1 - rt * 0.03);
    }
    if (navigator.getGamepads) requestAnimationFrame(poll);
  }

  // ---------- Menü verdrahten ----------
  function wire() {
    var on = function (id, fn) { $(id).addEventListener('click', function () { A.unlock(); A.sfx('click'); fn(); }); };
    on('btnPlay', function () { openSetup('single'); });
    on('btnSingle', function () { openSetup('single'); });
    on('btnLocal', function () { openSetup('hotseat'); });
    on('btnOnline', openOnline);
    on('btnFriends', openFriends);
    on('btnContinue', openResume);
    on('btnChars', function () { openChars(false); });
    on('btnWorlds', function () { openWorlds(false); });
    on('btnAch', openAch);
    on('btnRank', openRank);
    on('btnProfile', openProfile);
    on('btnSettings', function () { openSettings(false); });
    on('btnRules', function () { openRules(false); });
    on('hudMenu', pauseMenu);
    on('hudCam', function () { stage.overview(); });
    on('hudLog', function () { $('logPanel').hidden = !$('logPanel').hidden; renderLog(); });
    on('logClose', function () { $('logPanel').hidden = true; });
    on('modalBg', function () { if (!$('modal').classList.contains('block')) closeModal(); });
    window.addEventListener('keydown', function (e) { if (e.code === 'F11') return; });
  }

  // Für automatisierte Browser-Tests: lesender Zugriff auf den Spielstand
  window.RicoPolyDebug = { state: function () { return M && M.s; }, busy: function () { return !!(M && M.busy); }, act: function (a) { act(a); }, skip: skipAnims, profile: function () { return prof; }, stage: function () { return stage; },
    net: function () { return M && (M.host ? { role: 'host', fire: M.host.fire, conns: Object.keys(M.host.conns) } : M.client ? { role: 'guest', via: M.client.via, seat: M.seat } : null); } };

  document.addEventListener('DOMContentLoaded', function () { wire(); boot(); });
})();

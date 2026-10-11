/* GayLife – Ladebildschirm, Startmenü (Konsolen-Stil) und Pausenmenü.
   Beim Start zeigt #boot echte Ladeschritte, danach kommt das Startmenü. Die Stadt wird erst bei „Spielen“ gebaut.
   Überspringen (für Tests und Direktlinks): window.__GL_SKIP_TITLE = true, ?quick=1 oder ein #join=PIN-Link. */
(function () {
  'use strict';
  var T = GL.start = { active: false, inGames: false }, S = GL.S, scr = 'main', sel = 0, items = [], t0 = Date.now(), tipI = 0, tipT = 0;
  var C = function () { return GL.core; }, q = function (s) { return document.querySelector(s); };
  var TIPS = [
    'Laufen mit WASD, Pfeiltasten oder dem Stick links. Mit E oder der A-Taste sprichst du mit Leuten und betrittst Orte.',
    'Dein Handy (P oder X-Taste) bündelt Nachrichten, Kalender, Dating und die Karte.',
    'Essen, Schlafen und Duschen: Deine Bedürfnisse sinken mit der Zeit, Geld verdienst du mit Jobs.',
    'Mit PIN oder QR-Code besuchst du Freunde in ihrer Stadt.',
    'Dein Spielstand liegt auf diesem Gerät. Im Pausenmenü kannst du jederzeit speichern.',
    'Alle Figuren sind erwachsen und frei erfunden. Ein Nein wird respektiert.'
  ];
  function esc(s) { return C().esc(s); }

  /* ---------- Ladebildschirm ---------- */
  function bootShow(pct, txt) { var b = q('#boot'); b.style.display = 'flex'; b.classList.remove('off'); bootSet(pct, txt); tipRot(); }
  function bootSet(pct, txt) { q('#bootBar').style.width = pct + '%'; if (txt) q('#bootPct').textContent = txt; }
  function tipRot() { var e = q('#bootTip'); e.textContent = TIPS[tipI++ % TIPS.length]; clearInterval(tipT); tipT = setInterval(function () { e.textContent = TIPS[tipI++ % TIPS.length]; }, 2600); }
  function bootHide(now) { var b = q('#boot'); clearInterval(tipT); if (now) { b.style.display = 'none'; return; } b.classList.add('off'); setTimeout(function () { if (b.classList.contains('off')) b.style.display = 'none'; }, 500); }

  /* Spiel starten: Ladebildschirm zeigen, erst nach dem Zeichnen die Stadt bauen. */
  function load(fn) {
    bootShow(25, 'Stadt wird gebaut …');
    setTimeout(function () {
      try { fn(); } catch (e) { if (window.console) console.error(e); }
      bootSet(100, 'Fertig'); setTimeout(function () { bootHide(); }, 250);
    }, 90);
  }

  /* ---------- Startmenü ---------- */
  function el() { return q('#title'); }
  T.show = function () {
    T.active = true; T.inGames = false; scr = 'main'; sel = 0;
    q('#hub').style.display = 'none'; q('#game').style.display = 'none'; q('#world').style.display = 'none';
    var e = el(); e.style.display = 'flex'; render(); requestAnimationFrame(function () { e.classList.remove('off'); });
  };
  function hide() { var e = el(); e.classList.add('off'); e.style.display = 'none'; }
  T.visible = function () { return el().style.display !== 'none'; };

  function play(after) {
    hide(); T.active = false;
    load(function () { C().showHub(); if (after) setTimeout(after, 300); });
  }
  function games() {
    hide(); T.active = false; T.inGames = true; C().menuHub(); backBtn();
  }
  function backBtn() {
    var top = q('#hub .top'); if (!top || q('#glTitle')) return;
    var b = document.createElement('button'); b.className = 'btn sm'; b.id = 'glTitle'; b.textContent = '← Startmenü'; b.style.cssText = 'align-self:flex-start;margin-bottom:8px';
    b.onclick = function () { T.show(); }; top.parentNode.insertBefore(b, top);
  }
  function qName() { return ['Automatisch', 'Niedrig', 'Mittel', 'Hoch'][(S.settings.q | 0) + 1] || 'Automatisch'; }
  function padName() { return S.settings.pad === 1 ? 'Immer an' : S.settings.pad === 0 ? 'Aus' : 'Automatisch'; }
  function setSound() { S.sound = !S.sound; GL.save(); GL.emit('muted'); }

  function menuItems() {
    if (scr === 'set') return [
      { e: S.sound ? '🔊' : '🔇', t: 'Ton', s: S.sound ? 'An' : 'Aus', fn: function () { setSound(); } },
      { e: '🎞️', t: 'Grafik', s: qName() + ' (gilt in der Stadt)', fn: function () { S.settings.q = ((S.settings.q + 2) % 4) - 1; GL.save(); if (GL.W && GL.phone && GL.phone.applyQuality) GL.phone.applyQuality(); } },
      { e: '🕹️', t: 'Touch-Steuerung', s: padName(), fn: function () { S.settings.pad = S.settings.pad === 1 ? 0 : S.settings.pad === 0 ? -1 : 1; GL.save(); if (GL.padSync) GL.padSync(); } },
      { e: '⛶', t: 'Vollbild', s: 'Ein- oder ausschalten', fn: function () { GL.ui.fullscreen(); }, keep: 1 },
      { e: '💾', t: 'Speichern', s: 'Auf diesem Gerät', fn: function () { GL.save(); C().toast('Gespeichert auf diesem Gerät.'); }, keep: 1 },
      { e: '←', t: 'Zurück', fn: function () { scr = 'main'; sel = 4; } }
    ];
    if (scr === 'info') return [{ e: '←', t: 'Zurück', fn: function () { scr = 'main'; sel = 5; } }];
    var r = S.world.intro;
    return [
      { e: '▶', t: r ? 'Weiterspielen' : 'Spiel starten', s: r ? 'Tag ' + S.life.day + ' in Regenbogenkiez' : 'Dein Leben in Regenbogenkiez beginnt', big: 1, fn: function () { play(); }, keep: 1 },
      { e: '👤', t: 'Charakter', s: 'Look, Körperbau, Outfits', fn: function () { hide(); C().editor(); }, keep: 1 },
      { e: '🎮', t: 'Minispiele', s: 'Quiz, Rave, Match und mehr', fn: games, keep: 1 },
      { e: '👥', t: 'Mehrspieler', s: 'Per PIN oder QR-Code', fn: function () { play(function () { if (GL.mp) GL.mp.panel(); }); }, keep: 1 },
      { e: '⚙️', t: 'Einstellungen', s: 'Ton, Grafik, Steuerung', fn: function () { scr = 'set'; sel = 0; } },
      { e: 'ℹ️', t: 'Info & Hilfe', s: 'Steuerung und Hinweise', fn: function () { scr = 'info'; sel = 0; } }
    ];
  }

  function render() {
    var e = el(); items = menuItems(); if (sel >= items.length) sel = items.length - 1;
    var L = C().level(), h = '<div class="tw"><div><div class="tl">GayLife</div><div class="tt">Ein Leben in allen Farben</div>' +
      '<div class="pc"><div class="av">' + C().avatar(S.look) + '</div><div style="min-width:0"><b>' + esc(S.name) + '</b><div class="sub" style="color:var(--mu)">Level ' + L + ' · ✨ ' + C().fmt(S.glitzer) + ' Glitzer</div><div class="sub" style="color:var(--mu)">Tag ' + S.life.day + ' · 💶 ' + C().fmt(S.life.money) + ' €</div></div></div></div><div>';
    if (scr === 'info') h += '<div class="tx"><b>Steuerung</b><br>Tastatur: WASD oder Pfeile laufen, Q/R drehen die Kamera, E oder Enter handeln, P Handy, M Orte, Esc Pause, F Vollbild.<br>Touch: Stick links, vier Tasten rechts (A Aktion, B Orte, X Handy, Y Menü), Kamera durch Wischen.</div>' +
      '<div class="tx" style="margin-top:9px"><b>Hinweise</b><br>GayLife ist ab 18. Alle Figuren sind erwachsen und frei erfunden, Zustimmung zählt, ein Nein wird respektiert. Der Spielstand liegt lokal auf diesem Gerät.</div><div style="height:9px"></div>';
    h += '<div class="mn" id="tmn">' + items.map(function (it, i) {
      return '<button class="mi' + (it.big ? ' big' : '') + (i === sel ? ' sel' : '') + '" data-i="' + i + '"><span class="e">' + it.e + '</span><span><b>' + esc(it.t) + '</b>' + (it.s ? '<small>' + esc(it.s) + '</small>' : '') + '</span></button>';
    }).join('') + '</div></div><div class="ft sv">↑ ↓ wählen · Enter bestätigen · Esc zurück · Ab 18 · Alle Figuren sind frei erfunden</div></div>';
    e.innerHTML = h;
    [].forEach.call(e.querySelectorAll('.mi'), function (b) {
      b.onmouseenter = function () { if (sel !== +b.dataset.i) { sel = +b.dataset.i; mark(); } };
      b.onclick = function () { sel = +b.dataset.i; go(); };
    });
  }
  function mark() { [].forEach.call(el().querySelectorAll('.mi'), function (b, i) { b.classList.toggle('sel', i === sel); }); }
  function go() { var it = items[sel]; if (!it) return; if (C().sfx) C().sfx('tap'); it.fn(); if (T.active && T.visible() && !it.keep) render(); }

  document.addEventListener('keydown', function (e) {
    if (!T.active || !T.visible()) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 's' || k === 'S') { sel = (sel + 1) % items.length; mark(); e.preventDefault(); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') { sel = (sel + items.length - 1) % items.length; mark(); e.preventDefault(); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); go(); }
    else if (k === 'Escape' && scr !== 'main') { scr = 'main'; sel = 0; render(); }
  });

  /* Start: true = Startmenü übernimmt, false = direkt in die Stadt */
  T.boot = function () {
    var skip = window.__GL_SKIP_TITLE || /[?&]quick=1/.test(location.search) || /#join=\d{6}/.test(location.hash);
    if (skip) { bootHide(true); return false; }
    var gl = false; try { gl = !!(window.THREE && document.createElement('canvas').getContext('webgl')); } catch (e) {}
    bootSet(35, 'Spielstand geladen · Level ' + C().level());
    setTimeout(function () {
      bootSet(70, gl ? 'Grafik bereit' : 'Grafik nicht verfügbar, Minispiele laufen trotzdem');
      T.show();
      setTimeout(function () { bootSet(100, 'Bereit'); bootHide(); }, Math.max(150, 1100 - (Date.now() - t0)));
    }, 250);
    return true;
  };

  /* Editor „Fertig“ und Spiele „← Menü“ führen zurück, wo man herkam. */
  GL.on('showHub', function () {
    if (T.active) { T.show(); return true; }
    if (T.inGames) { C().menuHub(); backBtn(); return true; }
  });
  GL.on('enterWorld', function () { T.inGames = false; });

  /* ---------- Pausenmenü (Y-Taste, Esc) ---------- */
  GL.on('pause', function () {
    var W = GL.W; if (!W || !W.on || W.dlg || GL.ui.open()) return;
    GL.ui.menu('Pause', 'Das Spiel läuft im Hintergrund weiter.', [
      { e: '▶', t: 'Weiter', fn: GL.ui.close },
      { e: '👤', t: 'Charakter', s: 'Look ändern', fn: function () { GL.ui.close(); C().editor(); } },
      { e: S.sound ? '🔊' : '🔇', t: 'Ton', s: S.sound ? 'Ausschalten' : 'Einschalten', fn: function () { setSound(); var b = q('#wSnd'); if (b) b.textContent = S.sound ? '🔊' : '🔇'; GL.ui.close(); } },
      { e: '💾', t: 'Speichern', fn: function () { GL.save(); GL.ui.close(); C().toast('Gespeichert auf diesem Gerät.'); } },
      { e: '🏠', t: 'Startmenü', s: 'Speichert und verlässt die Stadt', fn: function () { GL.ui.close(); GL.save(); C().leave(); T.show(); } }
    ], 'pause');
  });
})();

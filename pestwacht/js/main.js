/* Pestwacht · Start und Hauptschleife: Laden, 3D starten, Eingabe verdrahten, feste Simulationsschritte, Autosave, Offline-Zeit. */
(function (root) {
  'use strict';
  const PW = root.PW, U = PW.UI, doc = root.document, $ = s => doc.querySelector(s);
  const AUTOSAVE = 60;           // Sekunden echter Spielzeit
  let last = 0, saveAcc = 0, liveAcc = 0, hiddenAt = 0, pressed = false;
  // Während ein Knopf gedrückt oder ein Eingabefeld aktiv ist, nicht neu zeichnen (sonst gehen Klicks/Schieberegler verloren)
  function busy() { const a = doc.activeElement; return pressed || !!(a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) && a.closest('#modals,#side')); }

  function progress(f, txt) { const b = $('#loadBar'), t = $('#loadTxt'); if (b) b.style.width = Math.round(f * 100) + '%'; if (t && txt) t.textContent = txt; }
  function fail(msg) {
    progress(1, msg);
    const t = $('#loadTxt'); if (t) { t.classList.remove('muted'); t.classList.add('bad'); }
  }

  function boot() {
    doc.title = PW.TITLE + ' – ' + PW.SUBTITLE;
    progress(0.2, 'Starte Oberfläche …');
    U.init();
    progress(0.4, 'Baue 3D-Welt …');
    const stage = $('#stage');
    let ok = false;
    try { ok = PW.R.init(stage, U.opt.quality); } catch (e) { console.error(e); ok = false; }
    if (!ok) { fail('Dein Browser kann kein WebGL (3D) anzeigen. Bitte Hardwarebeschleunigung aktivieren oder einen aktuellen Browser verwenden.'); return; }
    U.applyOpt();
    PW.R.onSfx = n => U.sfx(n);
    progress(0.7, 'Verdrahte Steuerung …');
    PW.Input.init(PW.R.canvas() || stage.querySelector('canvas'), {
      tap: (x, y, dbl, type) => { if (U.S) U.tap(x, y, dbl, type); },
      hover: (x, y) => { if (U.S) U.hover(x, y); },
      drag: () => false,
      key: (code, e) => U.key(code, e),
      blocked: () => !U.S || U.open.length > 0,
      sens: () => U.opt.camSens || 1,
      invertZoom: () => !!U.opt.invertZoom,
      wake: () => { if (PW.Audio) PW.Audio.unlock(); }
    }, U.opt.keys);
    root.addEventListener('resize', () => PW.R.resize());
    doc.addEventListener('pointerdown', e => { pressed = U.pressed = !!e.target.closest('#modals,#side,#banner,#hud'); }, true);
    ['pointerup', 'pointercancel'].forEach(n => doc.addEventListener(n, () => { setTimeout(() => { pressed = U.pressed = false; }, 0); }, true));
    doc.addEventListener('visibilitychange', onVisibility);
    root.addEventListener('pagehide', () => { if (U.S) U.save(true); });
    if (root.EasyGamesKit) root.EasyGamesKit.back(() => { if (U.open.length) U.closeModal(); else if (U.S) U.menu(); else U.A.exit(); });
    progress(1, 'Bereit');
    $('#scrLoad').hidden = true;
    U.title();
    last = performance.now();
    root.requestAnimationFrame(loop);
  }

  // Nach langer Abwesenheit (Tab im Hintergrund) die Zeit wie offline verrechnen
  function onVisibility() {
    if (doc.visibilityState === 'hidden') { hiddenAt = Date.now(); if (U.S) U.save(true); return; }
    const away = hiddenAt ? (Date.now() - hiddenAt) / 1000 : 0; hiddenAt = 0;
    last = performance.now();
    const S = U.S; if (!S || away < 60 || U.battle || S.paused) return;
    const r = PW.Game.offline(S, away);
    if (r && Object.keys(r.gain).length) U.toast('🌙 ' + U.T(r.seconds) + ' verrechnet: ' + Object.keys(r.gain).map(k => PW.RES_INFO[k].icon + (r.gain[k] > 0 ? '+' : '') + U.fmt(r.gain[k])).join(' '), 'gut');
  }

  function loop(now) {
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    const S = U.S;
    try {
      if (S) {
        if (!U.battle) PW.Game.advance(S, dt);
        if (U.P.battleStep) U.P.battleStep(dt);
        if (!pressed) U.hud();
        if (!S.paused && !U.battle && (saveAcc += dt) >= AUTOSAVE) { saveAcc = 0; U.save(true); }
        if ((liveAcc += dt) >= 1 && !busy()) { liveAcc = 0; U.redraw(); U.side(); }
      }
      PW.Input.update(dt);
      PW.R.frame(S, U, dt);
    } catch (e) {
      console.error(e);
      if (!loop._err) { loop._err = 1; U.toast('⚠️ Interner Fehler: ' + e.message + ' – das Spiel läuft weiter, bitte speichern.', 'warn', null, 8000); }
    }
    root.requestAnimationFrame(loop);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})(window);

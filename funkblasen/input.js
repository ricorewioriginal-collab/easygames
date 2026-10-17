/* FUNKBLASEN – Eingabe: Maus, Touch, Tastatur und Gamecontroller (eigene Gamepad-API-Abfrage für analoges Zielen,
 * deshalb wird ../gamepad.js hier bewusst NICHT eingebunden – sonst würde der Controller doppelt reagieren). */
(function (root) {
  'use strict';
  const E = root.FBEngine;

  function create(h) {
    // h: { canvas, renderer, game() -> Session|null, playing() -> bool, aim(ang, visible), fire(), swap(), joker(), pause(), back(), mute(), fullscreen(), nav(dir), activate(), hint(device) }
    const keys = new Set(); let pointer = null, last = 'mouse', hover = false;
    const pads = {}; let navCool = 0;
    const isUI = el => el && el.closest && el.closest('button, a, input, select, [role="dialog"], .hud-btn, .screen:not([hidden]), .modal:not([hidden])');

    function angleAt(cx, cy) {
      const p = h.renderer.clientToField(cx, cy), dx = p.x - E.LAUNCH.x, dy = E.LAUNCH.y - p.y;
      return { ang: E.clampAng(Math.atan2(Math.max(dy, 0.05), dx)), p };
    }
    function nearNext(p) { return Math.hypot(p.x - (E.LAUNCH.x - 4.6), p.y - (E.LAUNCH.y + 0.5)) < 1.6; }
    const cv = h.canvas;
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => {
      if (!h.playing() || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const S = h.game(); if (!S || !S.canAct()) return;
      last = e.pointerType === 'touch' ? 'touch' : 'mouse'; h.hint(last);
      const a = angleAt(e.clientX, e.clientY);
      if (nearNext(a.p)) { h.swap(); return; }                       // Antippen der nächsten Kugel = tauschen
      pointer = { id: e.pointerId, type: e.pointerType };
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      h.aim(a.ang, true); e.preventDefault();
    });
    cv.addEventListener('pointermove', e => {
      if (!h.playing()) return;
      const S = h.game(); if (!S || !S.canAct()) return;
      if (pointer && e.pointerId === pointer.id) { const a = angleAt(e.clientX, e.clientY); h.aim(a.ang, a.p.y < E.LAUNCH.y + 1.2); }
      else if (!pointer && e.pointerType === 'mouse') { hover = true; last = 'mouse'; h.aim(angleAt(e.clientX, e.clientY).ang, true); }
    });
    function endPointer(e, cancel) {
      if (!pointer || e.pointerId !== pointer.id) return;
      const type = pointer.type; pointer = null;
      try { cv.releasePointerCapture(e.pointerId); } catch (err) {}
      if (cancel || !h.playing()) { if (type !== 'mouse') h.aim(null, false); return; }
      const a = angleAt(e.clientX, e.clientY);
      if (a.p.y > E.LAUNCH.y + 1.2) { h.aim(a.ang, false); return; }   // nach unten unter die Kanone gezogen = abbrechen
      h.aim(a.ang, type === 'mouse'); h.fire();
    }
    cv.addEventListener('pointerup', e => endPointer(e, false));
    cv.addEventListener('pointercancel', e => endPointer(e, true));
    cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pointer) { hover = false; } });
    cv.addEventListener('contextmenu', e => e.preventDefault());

    root.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'Shift') keys.add('shift');
      if (h.playing()) {
        const S = h.game();
        if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].indexOf(k) >= 0) { keys.add(k.toLowerCase()); last = 'keys'; h.hint('keys'); e.preventDefault(); return; }
        if ((k === ' ' || k === 'Enter') && !e.repeat) { if (e.target && e.target.tagName === 'BUTTON' && isUI(e.target)) return; e.preventDefault(); if (S && S.canAct()) { h.aim(S.angle, true); h.fire(); } return; }
        if ((k === 't' || k === 'T') && !e.repeat) { h.swap(); return; }
        if ((k === 'j' || k === 'J') && !e.repeat) { h.joker(); return; }
        if ((k === 'p' || k === 'P' || k === 'Escape') && !e.repeat) { e.preventDefault(); h.pause(); return; }
      } else {
        if (k === 'Escape' && !e.repeat) { e.preventDefault(); h.back(); return; }
        if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
          if (e.target && /INPUT|SELECT/.test(e.target.tagName) && (k === 'ArrowLeft' || k === 'ArrowRight')) return;
          e.preventDefault(); h.nav(k.replace('Arrow', '').toLowerCase()); return;
        }
      }
      if ((k === 'm' || k === 'M') && !e.repeat && !(e.target && e.target.tagName === 'INPUT')) h.mute();
      if ((k === 'f' || k === 'F') && !e.repeat && !(e.target && e.target.tagName === 'INPUT')) h.fullscreen();
    });
    root.addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); });
    root.addEventListener('blur', () => { keys.clear(); pointer = null; });

    function update(dt) {
      const S = h.game(), play = h.playing() && S && S.canAct();
      if (play && keys.size) {
        const left = keys.has('arrowleft') || keys.has('a'), right = keys.has('arrowright') || keys.has('d');
        const sp = keys.has('shift') ? 0.45 : 1.25;   // Umschalt = feines Zielen
        if (left !== right) h.aim(S.angle + (left ? 1 : -1) * sp * dt, true);
      }
      pollPads(dt, S, play);
    }
    const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, START: 9, SELECT: 8, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
    function pollPads(dt, S, play) {
      if (!navigator.getGamepads) return;
      let list; try { list = navigator.getGamepads(); } catch (e) { return; }
      navCool = Math.max(0, navCool - dt);
      for (const gp of list) {
        if (!gp || !gp.connected) continue;
        const prev = pads[gp.index] || (pads[gp.index] = []), b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5));
        const pressed = i => b(i) && !prev[i];
        const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
        if (b(0) || b(1) || Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5 || b(12) || b(13) || b(14) || b(15)) { if (last !== 'pad') { last = 'pad'; h.hint('pad'); } }
        if (h.playing()) {
          if (play) {
            const mag = Math.hypot(ax, ay);
            if (mag > 0.55 && ay < -0.25) h.aim(Math.atan2(-ay, ax), true);                 // Stick zeigt direkt die Richtung
            else if (Math.abs(ax) > 0.22) h.aim(S.angle - ax * 1.4 * dt, true);
            if (b(BTN.LEFT)) h.aim(S.angle + 0.9 * dt, true);
            if (b(BTN.RIGHT)) h.aim(S.angle - 0.9 * dt, true);
            if (pressed(BTN.A) || pressed(7)) { h.aim(S.angle, true); h.fire(); }
            if (pressed(BTN.X)) h.swap();
            if (pressed(BTN.Y)) h.joker();
          }
          if (pressed(BTN.START) || pressed(BTN.SELECT)) h.pause();
        } else {
          let dir = null;
          if (b(BTN.UP) || ay < -0.6) dir = 'up'; else if (b(BTN.DOWN) || ay > 0.6) dir = 'down'; else if (b(BTN.LEFT) || ax < -0.6) dir = 'left'; else if (b(BTN.RIGHT) || ax > 0.6) dir = 'right';
          if (dir && navCool <= 0) { h.nav(dir); navCool = 0.22; }
          if (!dir) navCool = 0;
          if (pressed(BTN.A)) h.activate();
          if (pressed(BTN.B) || pressed(BTN.START)) h.back();
        }
        for (let i = 0; i < gp.buttons.length; i++) prev[i] = b(i);
      }
    }
    return { update, get device() { return last; }, get hover() { return hover; }, cancel() { pointer = null; keys.clear(); } };
  }
  root.FBInput = { create };
})(typeof self !== 'undefined' ? self : this);

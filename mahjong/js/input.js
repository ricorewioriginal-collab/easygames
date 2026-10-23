/* Mahjong 3D – Eingabe: Touch (Tippen, Ziehen, zwei Finger zum Zoomen/Drehen), Maus (Klick, Rad, rechte Taste dreht),
 * Tastatur und Gamecontroller (eigene Abfrage, deshalb ohne ../gamepad.js). */
(function (root) {
  'use strict';
  function create(h) {
    // h: { canvas, inGame(), blocked() (Dialog offen), tap(x,y,type), hover(x,y), pan(dx,dy), zoom(f,x,y), rotate(dyaw,dpitch), resetView(),
    //      nav(dir), confirm(), cancel(), hint(), undo(), shuffle(), pause(), uiNav(dir), uiConfirm(), uiBack(), mute(), fullscreen(), used(kind) }
    const cv = h.canvas;
    const ptrs = new Map();
    let gesture = null, lastTap = { t: 0, x: 0, y: 0 };

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function ang(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }

    cv.addEventListener('pointerdown', e => {
      if (!h.inGame() || h.blocked()) return;
      h.used(e.pointerType === 'mouse' ? 'mouse' : 'touch');
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, type: e.pointerType, button: e.button, moved: 0, t: performance.now() });
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        gesture = { d: dist(a, b), a: ang(a, b), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        ptrs.forEach(p => { p.moved = 99; });   // kein Tippen mehr
      }
      e.preventDefault();
    });
    cv.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId);
      if (!p) { if (e.pointerType === 'mouse' && h.inGame() && !h.blocked()) h.hover(e.clientX, e.clientY); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY; p.moved += Math.abs(dx) + Math.abs(dy);
      if (ptrs.size >= 2 && gesture) {
        const [a, b] = [...ptrs.values()];
        const d = dist(a, b), an = ang(a, b), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (gesture.d > 10) h.zoom(d / gesture.d, mx, my);
        let da = an - gesture.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
        h.rotate(-da, 0);
        h.pan(mx - gesture.mx, my - gesture.my);
        gesture = { d, a: an, mx, my };
        return;
      }
      if (p.type === 'mouse' && (p.button === 2 || p.button === 1)) { h.rotate(-dx * 0.006, dy * 0.004); return; }
      if (p.moved > 10) h.pan(dx, dy);
      else if (p.type === 'mouse') h.hover(e.clientX, e.clientY);
    });
    function up(e, cancel) {
      const p = ptrs.get(e.pointerId); if (!p) return;
      ptrs.delete(e.pointerId);
      try { cv.releasePointerCapture(e.pointerId); } catch (x) {}
      if (ptrs.size < 2) gesture = null;
      if (cancel || p.moved > 10 || (p.type === 'mouse' && p.button !== 0)) return;
      const now = performance.now();
      // Doppeltippen auf freie Fläche zoomt (nur Touch); die App entscheidet über tap()
      const dbl = p.type !== 'mouse' && now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
      lastTap = { t: now, x: e.clientX, y: e.clientY };
      h.tap(e.clientX, e.clientY, p.type, dbl);
    }
    cv.addEventListener('pointerup', e => up(e, false));
    cv.addEventListener('pointercancel', e => up(e, true));
    cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !ptrs.size) h.hover(-1, -1); });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('wheel', e => {
      if (!h.inGame() || h.blocked()) return;
      e.preventDefault();
      if (e.ctrlKey) h.zoom(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      else h.zoom(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    }, { passive: false });

    // ---------- Tastatur ----------
    const DIR = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
    root.addEventListener('keydown', e => {
      const k = e.key, t = e.target, typing = t && /INPUT|SELECT|TEXTAREA/.test(t.tagName);
      if (typing && k !== 'Escape') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const game = h.inGame() && !h.blocked();
      if (game) {
        const dk = DIR[k] || DIR[k.toLowerCase && k.toLowerCase()];
        if (dk && !(k.length === 1 && e.shiftKey)) { e.preventDefault(); h.used('keys'); h.nav(dk); return; }
        if ((k === 'Enter' || k === ' ') && !e.repeat) {
          if (t && t.tagName === 'BUTTON' && t.closest('#hud')) return;   // Knopf im HUD hat den Fokus
          e.preventDefault(); h.used('keys'); h.confirm(); return;
        }
        if (e.repeat) return;
        const kl = k.toLowerCase();
        if (kl === 'h') { h.hint(); return; }
        if (kl === 'u' || k === 'Backspace' || (kl === 'z')) { e.preventDefault(); h.undo(); return; }
        if (kl === 'r') { h.shuffle(); return; }
        if (kl === 'p' || k === 'Escape') { e.preventDefault(); if (k === 'Escape' && h.cancel()) return; h.pause(); return; }
        if (k === '+' || k === '=') { h.zoom(1.25); return; }
        if (k === '-' || k === '_') { h.zoom(0.8); return; }
        if (kl === 'q') { h.rotate(-0.15, 0); return; }
        if (kl === 'e') { h.rotate(0.15, 0); return; }
        if (kl === 'v') { h.resetView(); return; }
        if (kl === 'm') { h.mute(); return; }
        if (kl === 'f') { h.fullscreen(); return; }
        return;
      }
      // Menüs und Dialoge
      if (k === 'Escape' && !e.repeat) { e.preventDefault(); h.uiBack(); return; }
      if (k.indexOf('Arrow') === 0) {
        if (t && t.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight')) return;
        e.preventDefault(); h.uiNav(k.slice(5).toLowerCase());
      }
    });

    // ---------- Gamecontroller ----------
    const prev = {};   // je Pad: gedrückte Knöpfe
    let raf = 0, repeat = {}, lastT = 0;
    function anyPad() { const ps = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of ps) if (p && p.connected) return true; return false; }
    function start() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(poll); } }
    root.addEventListener('gamepadconnected', () => { start(); if (h.padConnected) h.padConnected(true); });
    root.addEventListener('gamepaddisconnected', () => { if (h.padConnected) h.padConnected(anyPad()); });
    function poll(now) {
      raf = 0;
      const ps = navigator.getGamepads ? navigator.getGamepads() : [];
      let alive = false;
      const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
      for (const p of ps) {
        if (!p || !p.connected) continue;
        alive = true;
        const st = prev[p.index] || (prev[p.index] = {});
        const btn = i => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5));
        const edge = i => { const d = btn(i); const was = st[i]; st[i] = d; return d && !was; };
        // Richtung: Steuerkreuz oder linker Stick, mit Wiederholung
        const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
        let dir = null;
        if (btn(14) || ax < -0.55) dir = 'left'; else if (btn(15) || ax > 0.55) dir = 'right';
        else if (btn(12) || ay < -0.55) dir = 'up'; else if (btn(13) || ay > 0.55) dir = 'down';
        const r = repeat[p.index] || (repeat[p.index] = { dir: null, t: 0 });
        if (dir !== r.dir) { r.dir = dir; r.t = 0.38; if (dir) fire(dir); }
        else if (dir) { r.t -= dt; if (r.t <= 0) { r.t = 0.13; fire(dir); } }
        const game = h.inGame() && !h.blocked();
        if (edge(0)) { h.used('pad'); game ? h.confirm() : h.uiConfirm(); }
        if (edge(1)) { h.used('pad'); if (game) { if (!h.cancel()) h.pause(); } else h.uiBack(); }
        if (edge(2) && game) h.hint();
        if (edge(3) && game) h.undo();
        if (edge(8) && game) h.shuffle();
        if (edge(9)) { if (game) h.pause(); else h.uiConfirm(); }
        if (edge(10) && game) h.resetView();
        if (game) {
          if (btn(4)) h.rotate(-1.2 * dt, 0);
          if (btn(5)) h.rotate(1.2 * dt, 0);
          const lt = p.buttons[6] ? p.buttons[6].value : 0, rt = p.buttons[7] ? p.buttons[7].value : 0;
          if (lt > 0.2) h.zoom(1 - lt * 1.2 * dt);
          if (rt > 0.2) h.zoom(1 + rt * 1.2 * dt);
          const rx = p.axes[2] || 0, ry = p.axes[3] || 0;
          if (Math.abs(rx) > 0.2 || Math.abs(ry) > 0.2) h.pan(-rx * 500 * dt, -ry * 500 * dt);
        }
        function fire(d) { h.used('pad'); if (h.inGame() && !h.blocked()) h.nav(d); else h.uiNav(d); }
      }
      if (alive) raf = requestAnimationFrame(poll);
    }
    if (anyPad()) start();
    return { stop() { if (raf) cancelAnimationFrame(raf); raf = 0; } };
  }
  root.MJInput = { create };
})(window);

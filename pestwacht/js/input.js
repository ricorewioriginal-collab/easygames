/* Pestwacht · Eingabe: Touch (Wischen, Zwei-Finger-Zoom/Drehen), Maus (Ziehen, Rechtsklick drehen, Rad), Tastatur (frei belegbar),
 * Gamecontroller über ../gamepad.js (linker Stick = WASD, Schultertasten = Q/E, Trigger = Zoom). */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const I = PW.Input = { held: {}, keys: null };
  let el, h, ptrs = new Map(), start = null, moved = false, pinch = null, lastTap = 0;

  I.init = function (canvas, handlers, keys) {
    el = canvas; h = handlers; I.keys = keys;
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && h.hover) h.hover(null); });
    el.addEventListener('wheel', e => { e.preventDefault(); const f = Math.exp((e.deltaY > 0 ? 1 : -1) * Math.min(1, Math.abs(e.deltaY) / 120) * 0.12 * (h.invertZoom && h.invertZoom() ? -1 : 1)); PW.R.zoom(f); }, { passive: false });
    el.addEventListener('contextmenu', e => e.preventDefault());
    root.addEventListener('keydown', kd); root.addEventListener('keyup', e => { I.held[e.code] = false; });
    root.addEventListener('blur', () => { I.held = {}; });
  };
  function sens() { return h.sens ? h.sens() : 1; }
  function down(e) {
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, t: e.pointerType });
    if (h.wake) h.wake();
    if (ptrs.size === 1) { start = { x: e.clientX, y: e.clientY, t: performance.now(), b: e.button }; moved = false; }
    if (ptrs.size === 2) { const [a, b] = Array.from(ptrs.values()); pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; moved = true; }
  }
  function move(e) {
    const p = ptrs.get(e.pointerId);
    if (!p) { if (e.pointerType === 'mouse' && h.hover) h.hover(e.clientX, e.clientY); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 1) {
      if (!moved && start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) moved = true;
      if (!moved) return;
      if (start.b === 2 || start.b === 1) PW.R.rotate(-dx * 0.006 * sens(), dy * 0.004 * sens());
      else if (h.drag && h.drag(e.clientX, e.clientY)) { /* Geistbild ziehen */ }
      else PW.R.pan(dx * sens(), dy * sens());
      if (p.t === 'mouse' && h.hover) h.hover(e.clientX, e.clientY);
    } else if (ptrs.size === 2 && pinch) {
      const [a, b] = Array.from(ptrs.values()), d = Math.hypot(a.x - b.x, a.y - b.y), ang = Math.atan2(b.y - a.y, b.x - a.x), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (d > 10) PW.R.zoom(pinch.d / d);
      let da = ang - pinch.ang; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2;
      PW.R.rotate(-da, 0);
      PW.R.pan((mx - pinch.mx) * sens(), (my - pinch.my) * sens());
      pinch = { d, ang, mx, my };
    }
  }
  function up(e) {
    const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (!p) return;
    if (ptrs.size === 0 && !moved && start && start.b === 0 && performance.now() - start.t < 600) {
      const now = performance.now(), dbl = now - lastTap < 320; lastTap = now;
      if (h.tap) h.tap(e.clientX, e.clientY, dbl, e.pointerType);
    }
    if (ptrs.size === 0 && h.dragEnd) h.dragEnd();
  }
  function kd(e) {
    const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
    if (typing) return;
    I.held[e.code] = true;
    if (h.key && h.key(e.code, e)) { e.preventDefault(); }
  }
  // Dauernd gehaltene Tasten: Kamera
  I.update = function (dt) {
    if (!h || (h.blocked && h.blocked())) return;
    const k = I.keys || {}, H = I.held, s = 520 * dt * sens();
    let px = 0, py = 0;
    if (H[k.up] || H.ArrowUp) py += s; if (H[k.down] || H.ArrowDown) py -= s;
    if (H[k.left] || H.ArrowLeft) px += s; if (H[k.right] || H.ArrowRight) px -= s;
    if (px || py) PW.R.pan(px, py);
    if (H[k.rotL]) PW.R.rotate(1.6 * dt, 0); if (H[k.rotR]) PW.R.rotate(-1.6 * dt, 0);
    if (H.Minus || H.NumpadSubtract) PW.R.zoom(1 + 1.2 * dt); if (H.Equal || H.NumpadAdd || H.BracketRight) PW.R.zoom(1 - 1.2 * dt);
  };
  I.codeName = function (c) {
    if (!c) return '–'; const m = /^Key([A-Z])$/.exec(c); if (m) return m[1]; const d = /^Digit(\d)$/.exec(c); if (d) return d[1];
    return { Space: 'Leertaste', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', Enter: 'Enter', Tab: 'Tab', ShiftLeft: 'Umschalt', Minus: '-', Equal: '+' }[c] || c;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);

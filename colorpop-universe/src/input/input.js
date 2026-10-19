/* ColorPop Universe – Eingabe. Zeiger (Maus, Touch, Stift) auf dem Brett: Hover, Tippen, langes Drücken für die Vorschau,
 * Zwei-Finger- bzw. Mausrad-Zoom. Tastatur: frei belegbare Tasten + feste Pfeile/Enter/Esc; F13–F18 kommen vom Controller
 * (../gamepad.js, siehe data-pad in index.html). Strg/Cmd/Alt-Kürzel des Browsers werden nie abgefangen. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var HOLD_MS = 420, SLOP = 12;

  // h: { tap(i, type), hover(i), hold(i), holdEnd(), enabled() }
  function Input(cv, rend, h) {
    var pts = new Map(), down = null, holdT = 0, pinch = null, self = this;
    this.lastType = 'mouse';
    function clear() { if (holdT) { clearTimeout(holdT); holdT = 0; } }
    cv.addEventListener('pointerdown', function (e) {
      if (!h.enabled()) return;
      self.lastType = e.pointerType || 'mouse';
      if (e.button > 0) return;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {   // Zwei Finger: Zoom statt Tippen
        clear(); down = null; var a = Array.from(pts.values());
        pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1, z: rend.zoom, cx: (a[0].x + a[1].x) / 2, cy: (a[0].y + a[1].y) / 2 };
        h.holdEnd(); return;
      }
      if (pts.size > 2) return;
      var i = rend.cellAt(e.clientX, e.clientY);
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, i: i, held: false, type: e.pointerType };
      clear();
      if (i >= 0) holdT = setTimeout(function () { holdT = 0; if (down && h.enabled()) { down.held = true; h.hold(down.i); } }, HOLD_MS);
      if (e.pointerType !== 'mouse') h.hover(i);
    });
    cv.addEventListener('pointermove', function (e) {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size >= 2) {
        var a = Array.from(pts.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1;
        rend.setZoom(pinch.z * d / pinch.d, pinch.cx, pinch.cy); return;
      }
      if (down && down.id === e.pointerId) {
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > SLOP) {   // gewischt: kein Tippen, Vorschau folgt dem Finger
          clear();
          var j = rend.cellAt(e.clientX, e.clientY);
          if (j !== down.i) { down.i = j; down.moved = true; if (down.held) h.hold(j); else if (e.pointerType !== 'mouse') h.hover(j); }
        }
        return;
      }
      if (e.pointerType === 'mouse' && h.enabled()) h.hover(rend.cellAt(e.clientX, e.clientY));
    });
    function end(e, cancel) {
      pts.delete(e.pointerId);
      if (pinch) { if (pts.size < 2) pinch = null; return; }
      if (!down || down.id !== e.pointerId) return;
      clear();
      var d = down; down = null;
      if (d.held) { h.holdEnd(); return; }   // langes Drücken = nur ansehen, kein Zug
      if (cancel || d.moved) { if (d.type !== 'mouse') h.hover(-1); return; }
      var i = rend.cellAt(e.clientX, e.clientY);
      if (i >= 0 && i === d.i && h.enabled()) h.tap(i, d.type);
      else if (d.type !== 'mouse') h.hover(-1);
    }
    cv.addEventListener('pointerup', function (e) { end(e, false); });
    cv.addEventListener('pointercancel', function (e) { end(e, true); });
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !down) h.hover(-1); });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('wheel', function (e) {
      if (!h.enabled()) return;
      e.preventDefault();
      rend.setZoom(rend.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX, e.clientY);
    }, { passive: false });
  }

  // Taste → Aktion (oder null). keys: frei belegte Codes aus den Einstellungen
  var FIXED = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'confirm', NumpadEnter: 'confirm', Escape: 'back',
    F13: 'hint', F14: 'undo', F15: 'boosterPrev', F16: 'boosterNext', F17: 'pause', F18: 'mute', Backspace: 'back' };
  function keyAction(e, keys) {
    if (e.ctrlKey || e.metaKey || e.altKey) return null;
    var c = e.code || '';
    for (var a in keys) if (keys[a] === c) return a;
    if (FIXED[c]) return FIXED[c];
    if (e.key === 'F13' || e.key === 'F14' || e.key === 'F15' || e.key === 'F16' || e.key === 'F17' || e.key === 'F18') return FIXED[e.key];
    if (/^Digit[1-4]$/.test(c)) return 'booster' + c.slice(5);
    if (c === 'Equal' || c === 'NumpadAdd') return 'zoomIn';
    if (c === 'Minus' || c === 'NumpadSubtract') return 'zoomOut';
    return null;
  }
  CPU.ACTION_NAMES = { up: 'Cursor hoch', down: 'Cursor runter', left: 'Cursor links', right: 'Cursor rechts', confirm: 'Gruppe auswählen', hint: 'Hinweis', undo: 'Rückgängig', restart: 'Neu starten', full: 'Vollbild', pause: 'Pause', mute: 'Ton an/aus' };
  CPU.keyLabel = function (code) {
    if (!code) return '–';
    var m = /^Key([A-Z])$/.exec(code); if (m) return m[1];
    m = /^Digit([0-9])$/.exec(code); if (m) return m[1];
    return { Space: 'Leertaste', Enter: 'Enter', Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ShiftLeft: 'Umschalt', ShiftRight: 'Umschalt', Tab: 'Tab', Backspace: 'Rücktaste' }[code] || code;
  };
  CPU.Input = Input; CPU.keyAction = keyAction;
})(typeof window !== 'undefined' ? window : globalThis);

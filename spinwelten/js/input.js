/* Spinwelten 3D – Eingabe: Tastatur (frei belegbar), Controller (Standard-Layout, Totzone, Hotplug, frei belegbar).
 * Alles wird zu Aktionen ('ok', 'back', 'up', …) zusammengefasst; die App entscheidet je nach Ansicht, was passiert.
 * Controller-Tasten lösen nie zusätzlich synthetische Klicks aus – es gibt nur den einen Aktionsweg. */
(function (SW) {
  'use strict';
  const ACTIONS = ['ok', 'back', 'up', 'down', 'left', 'right', 'action', 'persp', 'tabPrev', 'tabNext', 'multDown', 'multUp', 'zoomIn', 'zoomOut', 'map', 'inv', 'quest', 'pause', 'interact', 'fullscreen'];
  const DEF_KEYS = {
    ok: ['Space', 'Enter', 'NumpadEnter'], back: ['Escape', 'Backspace'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], action: ['KeyX'], persp: ['KeyV'], tabPrev: ['ShiftTab'], tabNext: ['Tab'],
    multDown: ['Minus', 'NumpadSubtract'], multUp: ['Equal', 'BracketRight', 'NumpadAdd'], zoomIn: ['PageUp', 'KeyR'], zoomOut: ['PageDown', 'KeyT'],
    map: ['KeyM'], inv: ['KeyI'], quest: ['KeyQ'], pause: ['KeyP'], interact: ['KeyE'], fullscreen: ['KeyF']
  };
  // Standard-Gamepad: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Back, 9 Start, 12–15 Steuerkreuz
  const DEF_PAD = { ok: [0], back: [1], action: [2], persp: [3], tabPrev: [4], tabNext: [5], multDown: [6], multUp: [7], map: [8], pause: [9], up: [12], down: [13], left: [14], right: [15] };
  const NAMES = {
    ok: ['Bestätigen / Drehen', 'Confirm / Spin'], back: ['Zurück', 'Back'], up: ['Hoch', 'Up'], down: ['Runter', 'Down'], left: ['Links', 'Left'], right: ['Rechts', 'Right'],
    action: ['Auto-Drehen / Aktion', 'Auto-spin / action'], persp: ['Ansicht wechseln', 'Switch view'], tabPrev: ['Vorheriger Reiter', 'Previous tab'], tabNext: ['Nächster Reiter', 'Next tab'],
    multDown: ['Multiplikator −', 'Multiplier −'], multUp: ['Multiplikator +', 'Multiplier +'], zoomIn: ['Heranzoomen', 'Zoom in'], zoomOut: ['Herauszoomen', 'Zoom out'],
    map: ['Himmelsatlas', 'Sky atlas'], inv: ['Sammlung', 'Collection'], quest: ['Aufgabenbuch', 'Quest book'], pause: ['Pause', 'Pause'], interact: ['Interagieren', 'Interact'], fullscreen: ['Vollbild', 'Fullscreen']
  };
  const I = {
    ACTIONS, DEF_KEYS, DEF_PAD, NAMES, keys: null, pad: null, deadzone: 0.25, invertY: false,
    ls: [], axisFn: null, pads: {}, prevBtn: {}, repeat: {}, capture: null, hasPad: false, onPad: null, lastKind: 'pointer'
  };
  function clone(o) { const r = {}; for (const k in o) r[k] = o[k].slice(); return r; }
  I.configure = function (set) {
    I.keys = Object.assign(clone(DEF_KEYS), set && set.keymap ? clone(set.keymap) : {});
    I.pad = Object.assign(clone(DEF_PAD), set && set.padmap ? clone(set.padmap) : {});
    I.deadzone = set && set.deadzone !== undefined ? +set.deadzone : 0.25; I.invertY = !!(set && set.invertY);
  };
  I.on = fn => { I.ls.push(fn); };
  I.ups = []; I.onUp = fn => { I.ups.push(fn); return () => { I.ups = I.ups.filter(f => f !== fn); }; };
  function fireUp(a) { for (const f of I.ups) f(a); }
  function actOf(code) { for (const a of ACTIONS) if (I.keys[a] && I.keys[a].includes(code)) return a; return ''; }
  function fire(a, src) { I.lastKind = src; for (const f of I.ls) if (f(a, src) === true) break; }
  function codeOf(e) { return (e.shiftKey && e.code === 'Tab') ? 'ShiftTab' : e.code; }
  I.keyLabel = function (code) {
    if (!code) return '–';
    return code.replace(/^Key/, '').replace(/^Digit/, '').replace('ShiftTab', '⇧ Tab').replace('Arrow', '').replace('Space', SW.L ? SW.L('Leertaste', 'Space') : 'Space')
      .replace('Escape', 'Esc').replace('Backspace', '⌫').replace('Minus', '−').replace('Equal', '+').replace('BracketRight', ']').replace('Numpad', 'Num ');
  };
  I.padLabel = b => (['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', '▲', '▼', '◀', '▶', 'Home'][b] || ('#' + b));
  function onKey(e) {
    const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    const code = codeOf(e);
    if (I.capture && I.capture.kind === 'key') { e.preventDefault(); const c = I.capture; I.capture = null; c.done(code === 'Escape' ? null : code); return; }
    if (typing) { if (code === 'Escape') { t.blur(); fire('back', 'key'); } return; }
    for (const a of ACTIONS) if (I.keys[a] && I.keys[a].includes(code)) {
      if (['ok', 'tabNext', 'tabPrev', 'up', 'down', 'left', 'right', 'back'].includes(a) || code === 'Space') e.preventDefault();
      if (e.repeat && !['up', 'down', 'left', 'right', 'zoomIn', 'zoomOut'].includes(a)) return;
      fire(a, 'key'); return;
    }
  }
  // Tastatur-Halten für Kamerabewegung (WASD/Pfeile), wird pro Bild abgefragt
  const held = new Set();
  I.held = a => { for (const c of I.keys[a] || []) if (held.has(c)) return true; return false; };
  I.init = function (set) {
    I.configure(set);
    addEventListener('keydown', e => { held.add(codeOf(e)); onKey(e); });
    addEventListener('keyup', e => { held.delete(e.code); const ua = actOf(e.code); if (ua) fireUp(ua); if (e.code === 'Tab') held.delete('ShiftTab'); });
    addEventListener('blur', () => held.clear());
    addEventListener('gamepadconnected', e => { I.hasPad = true; if (I.onPad) I.onPad(true, e.gamepad && e.gamepad.id); });
    addEventListener('gamepaddisconnected', e => { I.prevBtn = {}; I.hasPad = !!list().length; if (I.onPad) I.onPad(false, e.gamepad && e.gamepad.id); });
  };
  function list() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean); } catch (e) { return []; } }
  // pro Bild aufrufen
  I.poll = function (dt) {
    const pads = list(); if (!pads.length) return null;
    const now = performance.now(); let axes = null; I.lastPoll = now;
    for (const p of pads) {
      const prev = I.prevBtn[p.index] || [];
      const cur = p.buttons.map(b => b.pressed || b.value > 0.5);
      if (I.capture && I.capture.kind === 'pad') { const i = cur.findIndex((v, k) => v && !prev[k]); if (i >= 0) { const c = I.capture; I.capture = null; I.prevBtn[p.index] = cur; c.done(i); return null; } }
      for (const a of ACTIONS) for (const b of I.pad[a] || []) {
        if (cur[b] && !prev[b]) { fire(a, 'pad'); I.repeat[a] = now + 420; }
        else if (!cur[b] && prev[b]) fireUp(a);
        else if (cur[b] && ['up', 'down', 'left', 'right'].includes(a) && now > (I.repeat[a] || 0)) { fire(a, 'pad'); I.repeat[a] = now + 140; }
      }
      I.prevBtn[p.index] = cur;
      // linker Stick: Navigation mit Totzone und Wiederholung
      const dz = I.deadzone, ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      const dir = Math.abs(ax) > Math.abs(ay) ? (ax > dz ? 'right' : ax < -dz ? 'left' : '') : (ay > dz ? 'down' : ay < -dz ? 'up' : '');
      const st = I.stick || (I.stick = { dir: '', t: 0 });
      if (dir && (dir !== st.dir || now > st.t)) { fire(dir, 'pad'); st.t = now + (dir !== st.dir ? 380 : 140); }
      st.dir = dir;
      // rechter Stick: Kamera
      const rx = p.axes[2] || 0, ry = p.axes[3] || 0;
      const f = v => (Math.abs(v) < dz ? 0 : (v - Math.sign(v) * dz) / (1 - dz));
      axes = { x: f(rx), y: f(ry) * (I.invertY ? -1 : 1), lt: p.buttons[6] ? p.buttons[6].value : 0, rt: p.buttons[7] ? p.buttons[7].value : 0 };
      I.hasPad = true;
    }
    void dt; return axes;
  };
  // Bei sehr langsamen Bildern (schwache Geräte) zusätzlich zwischendurch abfragen, damit kurze Knopfdrücke nicht verloren gehen
  setInterval(() => { if (I.hasPad && performance.now() - (I.lastPoll || 0) > 45 && !document.hidden) I.poll(0); }, 30);
  // Nächste Taste / nächsten Knopf für eine Aktion abfragen
  I.captureNext = kind => new Promise(res => { I.capture = { kind, done: res }; });
  I.setKey = function (a, code) { if (!code) return; for (const k of ACTIONS) I.keys[k] = I.keys[k].filter(c => c !== code); I.keys[a] = [code].concat((I.keys[a] || []).filter(c => c !== code)).slice(0, 2); };
  I.setPad = function (a, b) { if (b === null || b === undefined) return; for (const k of ACTIONS) if (I.pad[k]) I.pad[k] = I.pad[k].filter(c => c !== b); I.pad[a] = [b]; };
  I.reset = function () { I.keys = clone(DEF_KEYS); I.pad = clone(DEF_PAD); };
  SW.Input = I;
})(globalThis.SW = globalThis.SW || {});

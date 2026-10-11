/* Urwaldlager – Eingabe: Tastatur, Maus (Pointer-Lock oder Ziehen), Touch-Joystick, Touch-Kamera, große Kontext-Tasten */
(function (root) {
  'use strict';
  const I = {
    touch: false, move: { x: 0, y: 0 }, held: {}, edge: {}, look: { dx: 0, dy: 0 }, wheel: 0, sens: 1, invertY: false, lockWanted: false, locked: false,
    layout: null, enabled: true, onPause: null
  };
  const KEYMAP = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', Space: 'jump', KeyE: 'act', Enter: 'act', KeyF: 'act', KeyQ: 'alt', KeyR: 'alt2', ShiftLeft: 'run', ShiftRight: 'run', KeyC: 'crouch', ControlLeft: 'crouch', Tab: 'map', KeyM: 'map', KeyP: 'pause', Escape: 'pause', Digit1: 'n1', Digit2: 'n2', Digit3: 'n3', Digit4: 'n4', Numpad1: 'n1', Numpad2: 'n2', Numpad3: 'n3', Numpad4: 'n4' };
  const keys = {};
  function press(b) { if (!I.held[b]) I.edge[b] = true; I.held[b] = true; }
  function release(b) { I.held[b] = false; }
  I.pressed = b => { const v = !!I.edge[b]; I.edge[b] = false; return v; };
  I.down = b => !!I.held[b];
  I.consumeLook = () => { const l = { dx: I.look.dx, dy: I.look.dy }; I.look.dx = 0; I.look.dy = 0; return l; };
  I.consumeWheel = () => { const w = I.wheel; I.wheel = 0; return w; };
  I.clearEdges = () => { I.edge = {}; };
  I.reset = () => { I.held = {}; I.edge = {}; I.look.dx = I.look.dy = 0; joy.active = false; joy.id = null; updateJoyEl(); Object.keys(keys).forEach(k => { keys[k] = false; }); I.move.x = I.move.y = 0; };
  function typing(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }
  root.addEventListener('keydown', e => {
    if (typing(e)) return; const b = KEYMAP[e.code]; if (!b) return;
    if (b !== 'pause' || e.code !== 'Escape' || !I.locked) e.preventDefault();
    if (e.repeat) return; keys[e.code] = true; press(b);
    if (b === 'pause' && I.onPause) I.onPause();
  });
  root.addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (!b) return; keys[e.code] = false; if (!Object.keys(keys).some(k => keys[k] && KEYMAP[k] === b)) release(b); });
  root.addEventListener('blur', () => I.reset());

  // ---- Maus: Ziehen dreht die Kamera; optional Pointer-Lock in 3D-Szenen
  let canvas = null, drag = null;
  I.attach = function (cv) {
    canvas = cv;
    cv.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return; I.touch = false; document.body.classList.remove('touch');
      if (I.lockWanted && !I.locked && cv.requestPointerLock) { try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (x) { } }
      drag = { x: e.clientX, y: e.clientY };
    });
    root.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      if (I.locked) { I.look.dx += e.movementX * I.sens; I.look.dy += e.movementY * I.sens * (I.invertY ? -1 : 1); }
      else if (drag && (e.buttons & 3)) { I.look.dx += (e.clientX - drag.x) * I.sens * 1.4; I.look.dy += (e.clientY - drag.y) * I.sens * 1.4 * (I.invertY ? -1 : 1); drag.x = e.clientX; drag.y = e.clientY; }
    });
    root.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') drag = null; });
    cv.addEventListener('wheel', e => { I.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerlockchange', () => { const was = I.locked; I.locked = document.pointerLockElement === cv; if (was && !I.locked && I.lockWanted && I.onPause && I.enabled) I.onPause('lock'); });
  };
  I.setLock = want => { I.lockWanted = !!want && !I.touch && I.mouseLock !== false; if (!I.lockWanted && I.locked && document.exitPointerLock) document.exitPointerLock(); };
  I.releaseLock = () => { if (I.locked && document.exitPointerLock) { const w = I.lockWanted; I.lockWanted = false; document.exitPointerLock(); I.lockWanted = w; } };

  // ---- Touch: dynamischer Joystick links, Kamera-Wischen rechts, Tasten
  const pad = document.createElement('div'); pad.id = 'tpad'; pad.innerHTML = '<div id="tjoy"><i></i></div><div id="tbtns"></div>'; let joyEl, knob, btnBox;
  const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0, R: 56 }, lookT = { id: null, x: 0, y: 0 };
  function updateJoyEl() { if (!joyEl) return; joyEl.classList.toggle('on', joy.active); if (joy.active) { joyEl.style.left = joy.ox + 'px'; joyEl.style.top = joy.oy + 'px'; knob.style.transform = `translate(${joy.x * joy.R}px,${joy.y * joy.R}px)`; } }
  I.mount = function (parent) {
    parent.appendChild(pad); joyEl = pad.querySelector('#tjoy'); knob = joyEl.querySelector('i'); btnBox = pad.querySelector('#tbtns');
    pad.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !I.touch) { I.touch = true; document.body.classList.add('touch'); I.setLock(false); } }, true);
    pad.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') { I.touch = false; document.body.classList.remove('touch'); return; }
      const L = I.layout || {}; const btn = e.target.closest('[data-b]');
      if (btn) { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) { } btn.classList.add('on'); btn._pid = e.pointerId; press(btn.dataset.b); return; }
      const w = innerWidth;
      if (L.joy && !joy.active && e.clientX < w * .48) { joy.active = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; updateJoyEl(); return; }
      if (L.look && lookT.id == null) { lookT.id = e.pointerId; lookT.x = e.clientX; lookT.y = e.clientY; lookT.t = performance.now(); lookT.sx = e.clientX; lookT.sy = e.clientY; return; }
      if (L.tap) L.tap(e.clientX, e.clientY);
    });
    root.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === joy.id) { let dx = (e.clientX - joy.ox) / joy.R, dy = (e.clientY - joy.oy) / joy.R; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } if (m > 1.6) { joy.ox += (e.clientX - joy.ox) * .08; joy.oy += (e.clientY - joy.oy) * .08; } joy.x = dx; joy.y = dy; updateJoyEl(); }
      else if (e.pointerId === lookT.id) { I.look.dx += (e.clientX - lookT.x) * I.sens * 2.2; I.look.dy += (e.clientY - lookT.y) * I.sens * 2.2 * (I.invertY ? -1 : 1); lookT.x = e.clientX; lookT.y = e.clientY; }
    });
    const up = e => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId === joy.id) { joy.active = false; joy.id = null; joy.x = joy.y = 0; updateJoyEl(); }
      if (e.pointerId === lookT.id) { const L = I.layout || {}; if (L.tap && performance.now() - lookT.t < 250 && Math.hypot(e.clientX - lookT.sx, e.clientY - lookT.sy) < 12) L.tap(e.clientX, e.clientY); lookT.id = null; }
      btnBox.querySelectorAll('[data-b].on').forEach(b => { if (b._pid === e.pointerId) { b.classList.remove('on'); release(b.dataset.b); } });
    };
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
  };
  // Tasten-Layout: buttons [{id, label, big}] ; joy/look Flags
  I.setLayout = function (L) {
    I.layout = L || null; if (!btnBox) return; I.reset();
    pad.hidden = !L; if (!L) return; pad.classList.toggle('nojoy', !L.joy);
    btnBox.innerHTML = (L.buttons || []).map(b => `<button data-b="${b.id}" class="${b.big ? 'big' : ''} ${b.cls || ''}" ${b.hidden ? 'hidden' : ''}><span>${b.label}</span></button>`).join('');
  };
  I.setButton = (id, label, show) => { if (!btnBox) return; const b = btnBox.querySelector(`[data-b="${id}"]`); if (!b) return; if (label != null) { const s = b.querySelector('span'); if (s.textContent !== label) s.textContent = label; } if (show != null) b.hidden = !show; };
  // pro Frame: Bewegungsvektor aus Tasten + Joystick
  I.poll = function () {
    let x = 0, y = 0; if (I.held.left) x -= 1; if (I.held.right) x += 1; if (I.held.up) y += 1; if (I.held.down) y -= 1;
    if (joy.active) { x += joy.x; y -= joy.y; }
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    I.move.x = x; I.move.y = y; I.move.mag = Math.min(1, m);
    I.joyFull = joy.active && Math.hypot(joy.x, joy.y) > .92;
    return I.move;
  };
  I.detect = () => { I.touch = (root.matchMedia && matchMedia('(pointer:coarse)').matches) || 'ontouchstart' in root; document.body.classList.toggle('touch', I.touch); return I.touch; };
  root.UIn = I;
})(window);

/* Urwaldlager – eine Steuerung für alle Geräte
   Logische Tasten: ok, back, alt, menu, l1, r1, l2, r2, select, start, l3, r3, up/down/left/right (Steuerkreuz)
   Controller (Standard-Layout über ../gamepad.js, Nintendo: A rechts = Bestätigen):
     ok = ✕ / A · back = ○ / B · alt = □ / Y · menu = △ / X · start = Options / + · select = Create / − · L1/R1 · L2/R2 · Sticks
   Tastatur: WASD/Pfeile, Maus, E/Leertaste/Enter = ok, F = alt, Tab = menu, Rücktaste = back, Esc = Pause, Q/R = L1/R1, Z/C = L2/R2, H = select
   Touch: linker Daumen-Stick, rechts wischen = Kamera, große Knöpfe rechts (passen sich Hoch-/Querformat an) */
(function () {
  'use strict';
  const UL = window.UL;
  const BTN = ['ok', 'back', 'alt', 'menu', 'l1', 'r1', 'l2', 'r2', 'select', 'start', 'l3', 'r3', 'up', 'down', 'left', 'right'];
  const KEYS = {
    ok: ['KeyE', 'Space', 'Enter', 'NumpadEnter'], back: ['Backspace'], alt: ['KeyF'], menu: ['Tab', 'KeyM'], l1: ['KeyQ'], r1: ['KeyR'],
    l2: ['KeyZ'], r2: ['KeyC'], select: ['KeyH'], start: ['Escape', 'KeyP'], l3: [], r3: ['KeyV'],
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight']
  };
  const kd = new Set();
  const st = {}; BTN.forEach(b => st[b] = { d: false, p: false, r: false, t: 0, pad: false, touch: false, key: false });
  const In = UL.In = {
    move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, mouse: { dx: 0, dy: 0, wheel: 0 }, run: false, device: UL.touch && !matchMedia('(pointer:fine)').matches ? 'touch' : 'kb',
    padKind: 'xbox', enabled: true, locked: false
  };
  In.down = b => st[b] && st[b].d;
  In.pressed = b => st[b] && st[b].p;
  In.released = b => st[b] && st[b].r;
  In.held = b => st[b] ? st[b].t : 0;
  In.eat = b => { if (b) { if (st[b]) st[b].p = false; } else BTN.forEach(k => st[k].p = false); };

  function setDevice(d) {
    if (In.device === d) return;
    In.device = d;
    document.documentElement.classList.toggle('dev-touch', d === 'touch');
    document.documentElement.classList.toggle('dev-pad', d === 'pad');
    document.documentElement.classList.toggle('dev-kb', d === 'kb');
    UL.emit('device', d);
  }
  In.setDevice = setDevice;

  // ---------- Tastatur & Maus ----------
  const typing = e => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
  addEventListener('keydown', e => {
    if (typing(e)) return;
    kd.add(e.code); setDevice('kb');
    const n = /^(Digit|Numpad)([1-9])$/.exec(e.code); if (n && !e.repeat) In.num = +n[2];
    if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.code) && In.enabled) e.preventDefault();
  });
  addEventListener('keyup', e => kd.delete(e.code));
  addEventListener('blur', () => { kd.clear(); touchBtn.clear(); tapQ.clear(); });
  const canvas = () => document.getElementById('gl');
  let dragging = false;
  addEventListener('mousedown', e => {
    if (e.target !== canvas()) return;
    setDevice('kb'); dragging = true;
    if (In.wantLock && !document.pointerLockElement && canvas().requestPointerLock) { try { canvas().requestPointerLock(); } catch (x) { } }
  });
  addEventListener('mouseup', () => dragging = false);
  addEventListener('mousemove', e => {
    if (document.pointerLockElement || (dragging && e.buttons)) { In.mouse.dx += e.movementX || 0; In.mouse.dy += e.movementY || 0; }
  });
  addEventListener('wheel', e => { if (e.target === canvas()) { In.mouse.wheel += Math.sign(e.deltaY); } }, { passive: true });
  In.unlock = () => { if (document.pointerLockElement) try { document.exitPointerLock(); } catch (e) { } };

  // ---------- Touch ----------
  const touchBtn = new Set(), tapQ = new Set();   // tapQ: kurze Tipper zwischen zwei Bildern gehen nicht verloren
  const stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, lookT = { id: null, x: 0, y: 0 };
  let tdx = 0, tdy = 0;
  // Berührungen auf bedienbaren Flächen (Knöpfe, Fenster, Menü, Antworten) gehören der Oberfläche, alles andere ist Spielfläche
  const UIHIT = 'button, a, input, select, textarea, label, .panel, #cmd, #cap, .qa, #loading:not(.done), #cloudHold';
  function onTouchStart(e) {
    const tg = e.target && e.target.closest ? e.target : null;
    if (tg && tg !== canvas() && !tg.closest('#touchPad') && tg.closest(UIHIT)) return;
    setDevice('touch');
    for (const t of e.changedTouches) {
      const left = t.clientX < innerWidth * (UL.portrait() ? 0.5 : 0.45);
      if (left && stick.id === null) { stick.id = t.identifier; stick.ox = t.clientX; stick.oy = t.clientY; stick.x = stick.y = 0; showStick(true); }
      else if (!left && lookT.id === null) { lookT.id = t.identifier; lookT.x = t.clientX; lookT.y = t.clientY; }
    }
    if (e.cancelable) e.preventDefault();
  }
  function onTouchMove(e) {
    let mine = false;
    for (const t of e.changedTouches) {
      if (t.identifier === stick.id || t.identifier === lookT.id) mine = true;
      if (t.identifier === stick.id) {
        const R = Math.min(70, innerWidth * 0.13);
        let dx = t.clientX - stick.ox, dy = t.clientY - stick.oy; const l = Math.hypot(dx, dy);
        if (l > R * 1.25) { stick.ox += dx / l * (l - R * 1.25); stick.oy += dy / l * (l - R * 1.25); dx = t.clientX - stick.ox; dy = t.clientY - stick.oy; }
        stick.x = UL.clamp(dx / R, -1.25, 1.25); stick.y = UL.clamp(dy / R, -1.25, 1.25); showStick(true);
      } else if (t.identifier === lookT.id) { tdx += t.clientX - lookT.x; tdy += t.clientY - lookT.y; lookT.x = t.clientX; lookT.y = t.clientY; }
    }
    if (mine && e.cancelable) e.preventDefault();   // nur Spiel-Berührungen festhalten – Listen und Fenster bleiben wischbar
  }
  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === stick.id) { stick.id = null; stick.x = stick.y = 0; showStick(false); }
      if (t.identifier === lookT.id) lookT.id = null;
    }
  }
  addEventListener('touchstart', onTouchStart, { passive: false });
  addEventListener('touchmove', onTouchMove, { passive: false });
  addEventListener('touchend', onTouchEnd); addEventListener('touchcancel', onTouchEnd);
  let stickEl = null;
  function showStick(on) {
    stickEl = stickEl || document.getElementById('tStick'); if (!stickEl) return;
    stickEl.style.display = on ? 'block' : 'none';
    if (on) { stickEl.style.left = stick.ox + 'px'; stickEl.style.top = stick.oy + 'px'; stickEl.firstElementChild.style.transform = `translate(${stick.x * 34}px,${stick.y * 34}px)`; }
  }
  // Bildschirm-Knöpfe: data-b="ok|alt|menu|back|start|select|l1|r1"
  function bindTouchButtons() {
    document.querySelectorAll('[data-b]').forEach(el => {
      if (el._b) return; el._b = 1;
      const b = el.dataset.b;
      const on = e => { e.preventDefault(); e.stopPropagation(); setDevice('touch'); touchBtn.add(b); tapQ.add(b); el.classList.add('on'); };
      const off = e => { touchBtn.delete(b); el.classList.remove('on'); };
      el.addEventListener('touchstart', on, { passive: false }); el.addEventListener('touchend', off); el.addEventListener('touchcancel', off);
      el.addEventListener('mousedown', e => { if (e.button === 0) { touchBtn.add(b); el.classList.add('on'); } });
      el.addEventListener('mouseup', off); el.addEventListener('mouseleave', off);
    });
  }
  In.bindTouchButtons = bindTouchButtons;
  // Beschriftung der Touch-Knöpfe je Situation (null = ausblenden)
  In.labels = (map) => {
    for (const b of ['ok', 'alt', 'menu', 'back', 'l1', 'r1', 'r3']) {
      const el = document.querySelector('#touchPad [data-b="' + b + '"]'); if (!el) continue;
      const v = map[b];
      el.hidden = v == null; if (v != null) { const sp = el.querySelector('span'), lw = Math.max(...String(v).split(/\s+/).map(w => w.length)); sp.textContent = v; sp.style.fontSize = lw > 9 ? '9.5px' : lw > 7 ? '11px' : ''; }   // lange Wörter kleiner statt zerhackt
    }
  };

  // ---------- Controller ----------
  let padIdx = -1, lastPadStamp = 0;
  function readPad() {
    let pads = []; try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { }
    let g = null;
    for (let i = 0; i < pads.length; i++) { const p = pads[i]; if (p && p.connected && p.buttons && p.buttons.length >= 10) { if (!g || p.timestamp > g.timestamp) g = p; } }
    return g;
  }
  const DZ = 0.2;
  const dz = (x, y) => { const l = Math.hypot(x, y); if (l < DZ) return [0, 0]; const k = Math.min(1, (l - DZ) / (1 - DZ)) / l; return [x * k, y * k]; };

  In.kind = () => {
    try { if (window.EasyGamesPadNormal && EasyGamesPadNormal.kind) return EasyGamesPadNormal.kind(); } catch (e) { }
    return 'xbox';
  };
  const GLY = {
    xbox: { ok: 'A', back: 'B', alt: 'X', menu: 'Y', l1: 'LB', r1: 'RB', l2: 'LT', r2: 'RT', select: 'View', start: 'Menu', l3: 'L3', r3: 'R3', up: '▲', down: '▼', left: '◀', right: '▶' },
    ps: { ok: '✕', back: '○', alt: '□', menu: '△', l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', select: 'Create', start: 'Options', l3: 'L3', r3: 'R3', up: '▲', down: '▼', left: '◀', right: '▶' },
    switch: { ok: 'A', back: 'B', alt: 'Y', menu: 'X', l1: 'L', r1: 'R', l2: 'ZL', r2: 'ZR', select: '−', start: '+', l3: 'L-Stick', r3: 'R-Stick', up: '▲', down: '▼', left: '◀', right: '▶' }
  };
  const KB = { ok: 'E', back: '⌫', alt: 'F', menu: 'Tab', l1: 'Q', r1: 'R', l2: 'Z', r2: 'C', select: 'H', start: 'Esc', l3: 'Shift', r3: 'V', up: '↑', down: '↓', left: '←', right: '→' };
  const COL = { ps: { ok: '#7fa8ff', back: '#ff6b7a', alt: '#ff8fd8', menu: '#4fe0b0' }, xbox: { ok: '#5bd45b', back: '#ff5b5b', alt: '#4aa8ff', menu: '#ffd23f' }, switch: { ok: '#e9e9e9', back: '#e9e9e9', alt: '#e9e9e9', menu: '#e9e9e9' } };
  // Symbol als HTML (passend zum aktuellen Gerät)
  In.glyph = (b, dev) => {
    dev = dev || In.device;
    if (dev === 'pad') {
      const k = In.kind(), t = (GLY[k] || GLY.xbox)[b] || b, c = (COL[k] || {})[b];
      return `<kbd class="g g-${k}${t.length > 2 ? ' wide' : ''}"${c ? ` style="--gc:${c}"` : ''}>${t}</kbd>`;
    }
    if (dev === 'touch') return '';
    return `<kbd class="g g-kb${KB[b].length > 2 ? ' wide' : ''}">${KB[b]}</kbd>`;
  };

  // ---------- pro Bild ----------
  let lastRealPad = 0;
  In.update = (dt) => {
    const g = readPad();
    const pb = {};
    let ax = [0, 0, 0, 0];
    if (g) {
      for (let i = 0; i < 16; i++) pb[i] = !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
      ax = [g.axes[0] || 0, g.axes[1] || 0, g.axes[2] || 0, g.axes[3] || 0];
      const any = Object.values(pb).some(Boolean) || ax.some(v => Math.abs(v) > 0.35);
      if (any) { lastRealPad = performance.now(); if (In.device !== 'pad') { setDevice('pad'); } }
      In.padKind = In.kind();
    }
    const PADI = { ok: 0, back: 1, alt: 2, menu: 3, l1: 4, r1: 5, l2: 6, r2: 7, select: 8, start: 9, l3: 10, r3: 11, up: 12, down: 13, left: 14, right: 15 };
    for (const b of BTN) {
      const s = st[b];
      const k = KEYS[b].some(c => kd.has(c));
      const p = !!pb[PADI[b]];
      const t = touchBtn.has(b) || tapQ.has(b);
      const d = In.enabled && (k || p || t);
      s.p = d && !s.d; s.r = !d && s.d; s.d = d; s.t = d ? s.t + dt : 0;
    }
    tapQ.clear();
    // Bewegung
    let mx = 0, my = 0;
    if (kd.has('KeyW') || kd.has('ArrowUp')) my -= 1;
    if (kd.has('KeyS') || kd.has('ArrowDown')) my += 1;
    if (kd.has('KeyA') || kd.has('ArrowLeft')) mx -= 1;
    if (kd.has('KeyD') || kd.has('ArrowRight')) mx += 1;
    if (mx || my) { const l = Math.hypot(mx, my); mx /= l; my /= l; }
    const [sx, sy] = dz(ax[0], ax[1]);
    if (Math.abs(sx) + Math.abs(sy) > Math.abs(mx) + Math.abs(my)) { mx = sx; my = sy; }
    if (stick.id !== null) { const l = Math.hypot(stick.x, stick.y); if (l > 0.12) { mx = stick.x / Math.max(1, l); my = stick.y / Math.max(1, l); } }
    if (!In.enabled) mx = my = 0;
    In.move.x = mx; In.move.y = my;
    // Rennen: Shift, L3 umschalten, Stick ganz außen (Touch), Einstellung „immer rennen“
    if (st.l3.p) In.runToggle = !In.runToggle;
    // Touch-Knopf 🏃 (bzw. V) schaltet Dauerrennen um; Controller: B halten oder Stick ganz durchdrücken
    if (st.r3.p) { In.runLatch = !In.runLatch; const rb = document.querySelector('#touchPad [data-b="r3"]'); if (rb) rb.classList.toggle('lit', In.runLatch); }
    const stickFar = stick.id !== null && Math.hypot(stick.x, stick.y) > 0.95;
    const padFar = !!g && Math.hypot(ax[0], ax[1]) > 0.97;
    if (!mx && !my) In.runToggle = false;
    In.run = kd.has('ShiftLeft') || kd.has('ShiftRight') || In.runToggle || In.runLatch || stickFar || padFar || !!pb[1] || UL.settings.autoRun;
    // Kamera
    const [lx, ly] = dz(ax[2], ax[3]);
    const sens = UL.settings.sens || 1, inv = UL.settings.invertY ? -1 : 1;
    In.look.x = (lx * 2.6 * dt + In.mouse.dx * 0.0032 + tdx * 0.006) * sens;
    In.look.y = (ly * 1.8 * dt + In.mouse.dy * 0.0028 + tdy * 0.005) * sens * inv;
    In.zoom = In.mouse.wheel + (st.l2.d ? 4 * dt : 0) - (st.r2.d ? 4 * dt : 0);
    In.mouse.dx = In.mouse.dy = In.mouse.wheel = 0; tdx = tdy = 0;
    In.numNow = In.num || 0; In.num = 0;
    if (!In.enabled) { In.look.x = In.look.y = 0; In.zoom = 0; }
  };
  // Menü-Navigation: Steuerkreuz, linker Stick, Pfeile, WASD → einmalige Schritte mit Wiederholung
  const nav = { x: 0, y: 0, t: 0 };
  In.navStep = (dt) => {
    let x = 0, y = 0;
    if (st.up.d || kd.has('KeyW')) y = -1; else if (st.down.d || kd.has('KeyS')) y = 1;
    if (st.left.d || kd.has('KeyA')) x = -1; else if (st.right.d || kd.has('KeyD')) x = 1;
    const g = readPad();
    if (g) { const [sx, sy] = dz(g.axes[0] || 0, g.axes[1] || 0); if (Math.abs(sy) > 0.6) y = Math.sign(sy); if (Math.abs(sx) > 0.6) x = Math.sign(sx); }
    if (stick.id !== null) { if (Math.abs(stick.y) > 0.6) y = Math.sign(stick.y); if (Math.abs(stick.x) > 0.6) x = Math.sign(stick.x); }
    if (!x && !y) { nav.x = nav.y = 0; nav.t = 0; return null; }
    if (x !== nav.x || y !== nav.y) { nav.x = x; nav.y = y; nav.t = 0.38; return { x, y }; }
    nav.t -= dt; if (nav.t <= 0) { nav.t = 0.12; return { x, y }; }
    return null;
  };
  In.rumble = (ms = 120, s = 0.4, w = 0.6) => {
    const g = readPad(); const a = g && (g.vibrationActuator || (g.raw && g.raw.vibrationActuator));
    if (a && a.playEffect) try { a.playEffect('dual-rumble', { duration: ms, strongMagnitude: s, weakMagnitude: w }); } catch (e) { }
    else if (In.device === 'touch' && navigator.vibrate) try { navigator.vibrate(Math.min(ms, 80)); } catch (e) { }
  };
  document.documentElement.classList.add('dev-' + In.device);
})();

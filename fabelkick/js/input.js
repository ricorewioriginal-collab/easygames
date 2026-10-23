/* FABELKICK 3D – Eingabe: Tastatur, Touch und bis zu 4 Gamecontroller */
'use strict';
(function () {
  const I = FK.Input = {};
  const BTN = ['a', 'b', 'x', 'y', 'lb', 'rb', 'rt', 'start', 'lt'];
  const PADMAP = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, start: 9 };
  const KEYMAP = {
    Space: 'a', KeyK: 'a', KeyJ: 'b', KeyL: 'y', KeyI: 'x', KeyQ: 'lb', KeyE: 'rb', ShiftLeft: 'rt', ShiftRight: 'rt',
    Escape: 'start', KeyP: 'start', KeyF: 'lt'
  };
  const keys = new Set();
  const touchBtn = {};
  const stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  const dev = {}; // id -> {down:{}, prev:{}, mx, my}
  const menuQ = [];
  I.lastType = 'kb'; // 'kb' | 'touch' | 'pad'
  I.onType = null;

  function setType(t) { if (I.lastType !== t) { I.lastType = t; document.body.dataset.input = t; if (I.onType) I.onType(t); } }
  document.body.dataset.input = 'kb';

  // ---------- Tastatur ----------
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    setType('kb');
    keys.add(e.code);
    const nav = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Enter: 'ok', Space: 'ok', Escape: 'back', Backspace: 'back' }[e.code];
    if (nav && !e.repeat) menuQ.push(nav);
    else if (nav && e.repeat && /up|down|left|right/.test(nav)) menuQ.push(nav);
    if (/^Arrow|^Space$/.test(e.code)) e.preventDefault();
    if (FK.onAnyInput) FK.onAnyInput();
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => { keys.clear(); for (const k in touchBtn) touchBtn[k] = false; stick.x = stick.y = 0; });

  // ---------- Touch ----------
  I.bindTouch = (root) => {
    const zone = root.querySelector('#stickZone'), base = root.querySelector('#stickBase'), knob = root.querySelector('#stickKnob');
    const R = 52; stick.base = base;
    const showStick = (x, y) => { base.style.transform = `translate(${x - 60}px,${y - 60}px)`; base.classList.add('on'); };
    zone.addEventListener('touchstart', e => {
      e.preventDefault(); setType('touch');
      const t = e.changedTouches[0]; if (stick.id !== null) return;
      stick.id = t.identifier; stick.ox = t.clientX; stick.oy = t.clientY; stick.x = stick.y = 0;
      showStick(t.clientX, t.clientY); knob.style.transform = 'translate(0px,0px)';
    }, { passive: false });
    const move = e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== stick.id) continue;
        let dx = t.clientX - stick.ox, dy = t.clientY - stick.oy; const l = Math.hypot(dx, dy);
        if (l > R) { dx *= R / l; dy *= R / l; }
        stick.x = dx / R; stick.y = dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`;
      }
    };
    const end = e => {
      for (const t of e.changedTouches) if (t.identifier === stick.id) { stick.id = null; stick.x = stick.y = 0; stick.run = false; base.classList.remove('on', 'sprint'); }
    };
    zone.addEventListener('touchmove', e => { e.preventDefault(); move(e); }, { passive: false });
    zone.addEventListener('touchend', end); zone.addEventListener('touchcancel', end);
    root.querySelectorAll('[data-btn]').forEach(b => {
      const k = b.dataset.btn;
      const on = e => { e.preventDefault(); setType('touch'); touchBtn[k] = true; b.classList.add('down'); if (FK.onAnyInput) FK.onAnyInput(); };
      const off = e => { e.preventDefault(); touchBtn[k] = false; b.classList.remove('down'); };
      b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off, { passive: false }); b.addEventListener('touchcancel', off, { passive: false });
      b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
    });
  };
  addEventListener('touchstart', () => setType('touch'), { passive: true });
  addEventListener('mousedown', () => { if (I.lastType === 'pad') setType('kb'); }, { passive: true });

  // ---------- Gamecontroller ----------
  const padPrevMenu = {};
  function pads() { try { return navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { return []; } }
  I.padCount = () => pads().filter(p => p && p.connected).length;

  // Liste der Eingabegeräte: Tastatur/Touch + jeder Controller
  I.devices = () => {
    const out = [{ id: 'kb', name: 'Tastatur / Touch', icon: '⌨️' }];
    pads().forEach(p => { if (p && p.connected) out.push({ id: 'pad' + p.index, name: 'Controller ' + (p.index + 1), icon: '🎮' }); });
    return out;
  };

  function dz(v) { const a = Math.abs(v); return a < 0.18 ? 0 : Math.sign(v) * (a - 0.18) / 0.82; }

  // Pro Bild aufrufen: aktualisiert alle Geräte
  I.poll = () => {
    const kb = dev.kb || (dev.kb = { down: {}, prev: {}, mx: 0, my: 0 });
    kb.prev = kb.down; kb.down = {};
    for (const k of keys) { const b = KEYMAP[k]; if (b) kb.down[b] = true; }
    for (const k in touchBtn) if (touchBtn[k]) kb.down[k] = true;
    let mx = 0, my = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
    if (stick.id !== null) {
      mx = stick.x; my = stick.y;
      // Touch: Stick ganz an den Rand = Sprint
      const run = Math.hypot(mx, my) > 0.92; if (run) kb.down.rt = true;
      if (stick.base && run !== stick.run) { stick.run = run; stick.base.classList.toggle('sprint', run); }
    }
    const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
    kb.mx = mx; kb.my = my;

    pads().forEach(p => {
      if (!p || !p.connected) return;
      const id = 'pad' + p.index, d = dev[id] || (dev[id] = { down: {}, prev: {}, mx: 0, my: 0 });
      d.prev = d.down; d.down = {};
      for (const b of BTN) { const bt = p.buttons[PADMAP[b]]; if (bt && (bt.pressed || bt.value > 0.4)) d.down[b] = true; }
      let x = dz(p.axes[0] || 0), y = dz(p.axes[1] || 0);
      const B = p.buttons;
      if (B[14] && B[14].pressed) x = -1; if (B[15] && B[15].pressed) x = 1;
      if (B[12] && B[12].pressed) y = -1; if (B[13] && B[13].pressed) y = 1;
      const ll = Math.hypot(x, y); if (ll > 1) { x /= ll; y /= ll; }
      d.mx = x; d.my = y;
      // Menü-Navigation mit Wiederholung
      const m = padPrevMenu[id] || (padPrevMenu[id] = { dir: '', t: 0, btn: {} });
      const dir = Math.abs(x) > 0.55 || Math.abs(y) > 0.55 ? (Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up')) : '';
      const now = performance.now();
      if (dir && (dir !== m.dir || now - m.t > (m.rep ? 140 : 380))) { m.rep = dir === m.dir; m.t = now; menuQ.push(dir); }
      if (!dir) m.rep = false;
      m.dir = dir;
      if (d.down.a && !d.prev.a) menuQ.push('ok');
      if (d.down.b && !d.prev.b) menuQ.push('back');
      if (d.down.start && !d.prev.start) menuQ.push('start');
      if (Object.keys(d.down).length || dir) { setType('pad'); if (FK.onAnyInput) FK.onAnyInput(); }
    });
  };

  I.get = id => dev[id] || { down: {}, prev: {}, mx: 0, my: 0 };
  I.down = (id, b) => !!I.get(id).down[b];
  I.pressed = (id, b) => { const d = I.get(id); return !!d.down[b] && !d.prev[b]; };
  I.released = (id, b) => { const d = I.get(id); return !d.down[b] && !!d.prev[b]; };
  I.anyPressed = id => { const d = I.get(id); for (const k in d.down) if (!d.prev[k]) return k; return null; };
  I.menu = () => menuQ.shift();
  I.clearMenu = () => { menuQ.length = 0; };

  I.rumble = (id, strong, ms) => {
    if (!FK.settings.vibe) return;
    if (id === 'kb') { if (I.lastType === 'touch' && navigator.vibrate) try { navigator.vibrate(ms || 40); } catch (e) { /* */ } return; }
    const p = pads()[+id.slice(3)];
    const a = p && p.vibrationActuator;
    if (a && a.playEffect) a.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: strong || 0.5, weakMagnitude: (strong || 0.5) * 0.6 }).catch(() => {});
  };
})();

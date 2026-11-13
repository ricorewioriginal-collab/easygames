/* AnMaCha – Der Podcast (Offizielles Spiel) – Grundlagen: Hilfsfunktionen, Spielstand, Eingabe (Tastatur, Maus, Touch, Gamecontroller).
   Ein Bedienkonzept für alle Geräte: Bewegen, Springen, Aktion, Ausweichen, Wechsel – alles Weitere im Befehlsmenü. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};

  // ------------------------------------------------------------------ Hilfen
  const U = AMC.U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    damp: (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)),
    rand: (a, b) => a + Math.random() * (b - a),
    irand: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    shuffle: arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    angDiff: (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; },
    seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
    time: s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); },
    esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    $: id => document.getElementById(id),
    fmt: n => Math.round(n).toLocaleString('de-DE'),
    isTouch: () => (typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches) || 'ontouchstart' in root
  };

  // ------------------------------------------------------------------ Spielstand
  const KEY = 'anmachaPodcastTycoon.v4';
  const DEF = () => ({
    v: 4,
    settings: { music: 0.55, sfx: 0.8, radio: 0.75, quality: 'auto', invert: false, sens: 1, shake: true, touchSize: 1, subtitles: true },
    host: 'andrew',
    story: { done: 0, stars: {}, best: {} },
    best: { live: 0, jagd: 0, quiz: 0, race: 0 },
    stats: { funken: 0, drones: 0, shows: 0, listeners: 0, quizWins: 0 },
    fan: 0, owned: [], outfit: { andrew: 'std', marco: 'std' }, quests: {},
    seenIntro: false
  });
  const Save = AMC.Save = {
    data: DEF(),
    load() {
      try {
        const j = JSON.parse(root.localStorage.getItem(KEY) || 'null');
        if (j && j.v === 4) {
          const d = DEF();
          Save.data = Object.assign(d, j, { settings: Object.assign(d.settings, j.settings || {}), story: Object.assign(d.story, j.story || {}), best: Object.assign(d.best, j.best || {}), stats: Object.assign(d.stats, j.stats || {}), outfit: Object.assign(d.outfit, j.outfit || {}) });
        }
      } catch (e) { /* ohne Speicher spielen */ }
      return Save.data;
    },
    save() { try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* voll oder gesperrt */ } },
    reset() { Save.data = DEF(); Save.save(); },
    has(id) { return Save.data.owned.indexOf(id) >= 0; },
    earn(n) { n = Math.max(0, Math.round(n)); Save.data.fan += n; Save.save(); return n; }
  };
  Save.load();

  // ------------------------------------------------------------------ Eingabe
  const BTN = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9, ls: 10, rs: 11, up: 12, down: 13, left: 14, right: 15 };
  const KEYMAP = {
    Space: ['jump', 'ok'], Enter: ['act', 'ok'], NumpadEnter: ['act', 'ok'], KeyE: ['act'], KeyF: ['act'],
    Escape: ['pause', 'back'], Backspace: ['back'], KeyP: ['pause'], KeyQ: ['swap'], Tab: ['swap'],
    KeyC: ['dodge'], ControlLeft: ['dodge'], KeyR: ['radio'], KeyN: ['radioNext'], KeyM: ['radioToggle'],
    ArrowUp: ['up'], ArrowDown: ['down'], ArrowLeft: ['left'], ArrowRight: ['right'],
    KeyW: ['up'], KeyS: ['down'], KeyA: ['left'], KeyD: ['right'],
    Digit1: ['k1'], Digit2: ['k2'], Digit3: ['k3'], Digit4: ['k4'], Digit7: ['k7'], Digit8: ['k8'], Digit9: ['k9'], Digit0: ['k0']
  };
  const PADMAP = { a: ['jump', 'ok'], b: ['back', 'dodge'], x: ['act'], y: ['swap'], rt: ['dodge'], lb: ['radioNext'], lt: ['radioToggle'], start: ['pause'], select: ['radio'], up: ['up'], down: ['down'], left: ['left'], right: ['right'] };

  const I = AMC.Input = {
    move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, zoom: 0,
    sprint: false, jumpHeld: false,
    device: U.isTouch() ? 'touch' : 'kb', padKind: 'xbox',
    keys: new Set(), _hit: new Set(), _next: new Set(),
    padPrev: [], padHits: [[], [], [], []],
    touch: { mx: 0, my: 0, lx: 0, ly: 0, sprint: false },
    mouse: { dx: 0, dy: 0, down: false },
    navRepeat: { dir: '', t: 0 },
    enabled: true
  };
  const setDevice = d => {
    if (I.device === d) return; I.device = d;
    document.documentElement.classList.remove('dev-kb', 'dev-pad', 'dev-touch'); document.documentElement.classList.add('dev-' + d);
    if (AMC.onDevice) AMC.onDevice(d);
  };
  document.documentElement.classList.add('dev-' + I.device);
  I.fire = name => I._next.add(name);
  I.hit = name => I._hit.has(name);
  I.eat = name => I._hit.delete(name);
  I.anyHit = (...names) => names.some(n => I._hit.has(n));

  root.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.code !== 'Escape') return;
    const m = KEYMAP[e.code];
    if (e.isTrusted) setDevice('kb');
    if (!I.keys.has(e.code) && m) m.forEach(I.fire);
    I.keys.add(e.code);
    if (m && /^(Space|Tab|Arrow|Backspace)/.test(e.code)) e.preventDefault();
  });
  root.addEventListener('keyup', e => I.keys.delete(e.code));
  root.addEventListener('blur', () => I.keys.clear());

  // Maus: Ziehen dreht die Kamera, Rad zoomt
  function bindCanvas(cv) {
    let last = null, tid = null;
    cv.addEventListener('mousedown', e => { if (e.button === 0 || e.button === 2) { I.mouse.down = true; last = [e.clientX, e.clientY]; setDevice('kb'); } });
    root.addEventListener('mouseup', () => { I.mouse.down = false; last = null; });
    root.addEventListener('mousemove', e => { if (!last) return; I.mouse.dx += e.clientX - last[0]; I.mouse.dy += e.clientY - last[1]; last = [e.clientX, e.clientY]; });
    cv.addEventListener('wheel', e => { I.zoom += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    // Touch: Wischen auf der Spielfläche dreht die Kamera (Joystick und Knöpfe liegen darüber)
    cv.addEventListener('touchstart', e => { if (!e.isTrusted) return; setDevice('touch'); const t = e.changedTouches[0]; tid = t.identifier; last = [t.clientX, t.clientY]; }, { passive: true });
    cv.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === tid && last) { I.mouse.dx += (t.clientX - last[0]) * 1.4; I.mouse.dy += (t.clientY - last[1]) * 1.4; last = [t.clientX, t.clientY]; } }, { passive: true });
    cv.addEventListener('touchend', e => { for (const t of e.changedTouches) if (t.identifier === tid) { tid = null; last = null; } }, { passive: true });
  }
  I.bindCanvas = bindCanvas;
  root.addEventListener('touchstart', e => { if (e.isTrusted && !document.documentElement.classList.contains('eg-pad')) setDevice('touch'); }, { passive: true, capture: true });

  const pads = () => { try { return Array.from((navigator.getGamepads && navigator.getGamepads()) || []).filter(Boolean); } catch (e) { return []; } };
  const dz = v => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
  I.pads = pads;

  /** Einmal pro Bild: Controller lesen, Ereignisse dieses Bildes festlegen. */
  I.update = function (dt) {
    I._hit = I._next; I._next = new Set();
    let mx = 0, my = 0, lx = 0, ly = 0, sprint = false, jumpHeld = I.keys.has('Space');
    const k = c => I.keys.has(c);
    if (k('KeyA') || k('ArrowLeft')) mx -= 1; if (k('KeyD') || k('ArrowRight')) mx += 1;
    if (k('KeyW') || k('ArrowUp')) my += 1; if (k('KeyS') || k('ArrowDown')) my -= 1;
    if (k('KeyJ')) lx -= 1; if (k('KeyL')) lx += 1; if (k('KeyI')) ly -= 1; if (k('KeyK')) ly += 1;
    if (k('ShiftLeft') || k('ShiftRight')) sprint = true;
    const list = pads();
    list.forEach((p, pi) => {
      const prev = I.padPrev[pi] || [], now = p.buttons.map(b => b && (b.pressed || b.value > 0.5));
      const hits = I.padHits[pi] = [];
      for (const name in BTN) {
        const i = BTN[name];
        if (now[i] && !prev[i]) { hits.push(name); if (pi === 0 || !AMC.multiPad) (PADMAP[name] || []).forEach(n => I._hit.add(n)); setDevice('pad'); I.padKind = /054c|sony|dualsense|dualshock|playstation/i.test(p.id) ? 'ps' : /057e|nintendo|switch|joy-con|pro controller/i.test(p.id) ? 'nin' : 'xbox'; }
      }
      I.padPrev[pi] = now;
      if (pi === 0 || !AMC.multiPad) {
        const ax = p.axes || [];
        const a0 = dz(ax[0] || 0), a1 = dz(ax[1] || 0), a2 = dz(ax[2] || 0), a3 = dz(ax[3] || 0);
        if (a0 || a1 || a2 || a3) setDevice('pad');
        mx += a0; my -= a1; lx += a2 * 1.0; ly += a3 * 1.0;
        if (now[BTN.up]) my += 1; if (now[BTN.down]) my -= 1; if (now[BTN.left]) mx -= 1; if (now[BTN.right]) mx += 1;
        if (now[BTN.rb] || now[BTN.ls]) sprint = true;
        if (now[BTN.a]) jumpHeld = true;
        // Stick als Menü-Richtung (mit Wiederholung)
        const dir = Math.abs(a0) > 0.6 || Math.abs(a1) > 0.6 ? (Math.abs(a0) > Math.abs(a1) ? (a0 > 0 ? 'right' : 'left') : (a1 > 0 ? 'down' : 'up')) : '';
        if (dir) { if (I.navRepeat.dir !== dir) { I._hit.add(dir); I.navRepeat = { dir, t: 0.38 }; } else if ((I.navRepeat.t -= dt) <= 0) { I._hit.add(dir); I.navRepeat.t = 0.12; } }
        else if (pi === 0) I.navRepeat.dir = '';
      }
    });
    // Touch-Joystick
    mx += I.touch.mx; my += I.touch.my; if (I.touch.sprint) sprint = true;
    const len = Math.hypot(mx, my); if (len > 1) { mx /= len; my /= len; }
    I.move.x = mx; I.move.y = my;
    const inv = AMC.Save.data.settings.invert ? -1 : 1, sens = AMC.Save.data.settings.sens || 1;
    I.look.x = (lx * 2.6 * dt + I.mouse.dx * 0.0042) * sens; I.look.y = (ly * 1.8 * dt + I.mouse.dy * 0.0036) * sens * inv;
    I.mouse.dx = 0; I.mouse.dy = 0;
    I.sprint = sprint; I.jumpHeld = jumpHeld || I.touch.jump;
  };
  I.padHit = (pi, name) => (I.padHits[pi] || []).includes(name);
  I.padCount = () => pads().length;

  // Tastensymbole je Gerät
  const GLYPH = {
    xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT', start: '☰', select: '⧉' },
    ps: { a: '✕', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', lt: 'L2', rt: 'R2', start: 'OPTIONS', select: 'SHARE' },
    nin: { a: 'B', b: 'A', x: 'Y', y: 'X', lb: 'L', rb: 'R', lt: 'ZL', rt: 'ZR', start: '+', select: '−' }
  };
  const KB = { a: 'Leertaste', b: 'Esc', x: 'E', y: 'Q', lb: 'N', rb: 'Umschalt', lt: 'M', rt: 'C', start: 'Esc', select: 'R', ok: 'Enter', dpad: 'Pfeile' };
  const TOUCH = { a: '⤴', b: '↩', x: '📣', y: '⇄', lb: '📻', rb: '⏩', lt: '📻', rt: '💨', start: '⏸', select: '📻', ok: 'Tippen', dpad: 'Tippen' };
  /** Kleines Tastensymbol für das aktuelle Gerät. */
  AMC.glyph = function (b) {
    const d = I.device;
    let t = d === 'pad' ? (GLYPH[I.padKind][b] || b.toUpperCase()) : d === 'touch' ? (TOUCH[b] || '') : (KB[b] || b);
    if (d === 'pad' && b === 'ok') t = GLYPH[I.padKind].a;
    if (d === 'pad' && b === 'dpad') t = '✚';
    const col = d === 'pad' && I.padKind === 'xbox' ? ({ a: 'g-a', b: 'g-b', x: 'g-x', y: 'g-y' }[b] || '') : '';
    return '<kbd class="glyph ' + col + (t.length > 2 ? ' wide' : '') + '">' + U.esc(t) + '</kbd>';
  };
  AMC.multiPad = false;
})(typeof window !== 'undefined' ? window : globalThis);

/* AnMaCha UNDERCOVER 3D – Eingabe: Tastatur, Touch und Gamecontroller als gemeinsame Aktionen (eigene Controller-Steuerung,
   deshalb NICHT zusammen mit ../gamepad.js einbinden).
   AMU.Input.create({ keys, onAction(name, phase), onDevice(dev), target }) → inp
     inp.axis() → {x, y} (-1..1, y+ = nach unten), inp.setMode('game'|'menu'|'task'|'text'), inp.mode(), inp.isDown(name)
     inp.camAxis() → {x, y} (rechter Stick), inp.rebind(action, code|[codes]) → Konflikte, inp.conflicts() → [{ code, actions }],
     inp.resetKeys([action]), inp.keys(), inp.keyName(code), inp.lastDevice(), inp.attachTouch(t), inp.menuMove(dir), inp.menuPress(), inp.destroy()
   Menü-/Textmodus melden zusätzlich 'back', 'tabPrev', 'tabNext' (nur 'down').
   Touch: inp.attachTouch(AMU.Touch.create(...)) – Input liest t.axis() und leitet die Touch-Knöpfe an onAction weiter. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  const DEFAULT_KEYS = {
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    use: ['KeyE'], report: ['KeyF'], special: ['Space'], map: ['KeyM'], tasks: ['Tab'], cam: ['KeyQ'],
    chat: ['Enter', 'NumpadEnter'], menu: ['Escape'], vent: ['KeyV'], sab: ['KeyG'], ability: ['KeyT'],
    sprint: ['ShiftLeft', 'ShiftRight'], quick: ['KeyC'], zoomIn: ['Equal', 'NumpadAdd'], zoomOut: ['Minus', 'NumpadSubtract']
  };
  const MOVE = { up: 1, down: 1, left: 1, right: 1 };
  // W3C-Standardlayout: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Back, 9 Start, 10 L3, 11 R3, 12–15 Steuerkreuz
  const PAD_GAME = { 0: 'use', 1: 'special', 2: 'report', 3: 'map', 4: 'cam', 5: 'vent', 6: 'sab', 7: 'sprint', 8: 'tasks', 9: 'menu', 12: 'quick', 14: 'zoomOut', 15: 'zoomIn' };
  const PAD_TASK = { 0: 'Enter', 1: 'Escape', 2: 'Space', 4: 'PageDown', 5: 'PageUp' };
  const KEYINFO = { Enter: ['Enter', 13], Escape: ['Escape', 27], Space: [' ', 32], PageUp: ['PageUp', 33], PageDown: ['PageDown', 34],
    ArrowLeft: ['ArrowLeft', 37], ArrowUp: ['ArrowUp', 38], ArrowRight: ['ArrowRight', 39], ArrowDown: ['ArrowDown', 40] };
  const DIRKEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  const DIRS = ['up', 'down', 'left', 'right'];
  const NAMES = { Space: 'Leertaste', ArrowUp: 'Pfeil hoch', ArrowDown: 'Pfeil runter', ArrowLeft: 'Pfeil links', ArrowRight: 'Pfeil rechts',
    ShiftLeft: 'Umschalt', ShiftRight: 'Umschalt rechts', ControlLeft: 'Strg', ControlRight: 'Strg rechts', AltLeft: 'Alt', AltRight: 'Alt Gr',
    MetaLeft: 'Windows', MetaRight: 'Windows rechts', Tab: 'Tab', Enter: 'Eingabe', NumpadEnter: 'Eingabe (Ziffernblock)', Escape: 'Esc',
    Backspace: 'Rücktaste', Delete: 'Entf', Insert: 'Einfg', Home: 'Pos1', End: 'Ende', PageUp: 'Bild hoch', PageDown: 'Bild runter',
    CapsLock: 'Feststelltaste', ContextMenu: 'Menütaste', NumpadAdd: 'Ziffernblock +', NumpadSubtract: 'Ziffernblock -',
    NumpadMultiply: 'Ziffernblock *', NumpadDivide: 'Ziffernblock /', NumpadDecimal: 'Ziffernblock ,' };
  // Beschriftung ohne Layout-API: deutsches bzw. US-Layout
  const DE = { KeyZ: 'Y', KeyY: 'Z', Equal: '´', Minus: 'ß', Slash: '-', BracketRight: '+', BracketLeft: 'Ü', Semicolon: 'Ö', Quote: 'Ä',
    Backquote: '^', Backslash: '#', IntlBackslash: '<', Comma: ',', Period: '.' };
  const US = { Equal: '=', Minus: '-', Slash: '/', BracketRight: ']', BracketLeft: '[', Semicolon: ';', Quote: "'", Backquote: '`', Backslash: '\\',
    IntlBackslash: '\\', Comma: ',', Period: '.' };
  const FOCUSABLE = 'button, [tabindex]:not([tabindex="-1"]), input, select, textarea, a[href]';
  const TEXTY = /^(text|search|email|number|password|url|tel)$/;
  let layout = null, layoutAsked = false;   // navigator.keyboard.getLayoutMap() (falls vorhanden)

  function isTyping(el) {
    if (!el || !el.tagName) return false;
    if (el.isContentEditable || el.tagName === 'TEXTAREA') return true;
    return el.tagName === 'INPUT' && TEXTY.test((el.type || 'text').toLowerCase());
  }
  function injectCss(doc) {
    if (!doc || doc.getElementById('amu-input-css')) return;
    const s = doc.createElement('style'); s.id = 'amu-input-css';
    s.textContent = '.amu-focus{outline:3px solid #ff9a2e!important;outline-offset:2px;box-shadow:0 0 0 5px #ff9a2e33,0 0 14px #ff9a2eaa!important}';
    (doc.head || doc.documentElement).appendChild(s);
  }

  function keyName(code) {
    code = String(code || '');
    if (NAMES[code]) return NAMES[code];
    const lk = layout && layout.get && layout.get(code);
    if (lk) return lk.length === 1 ? lk.toUpperCase() : lk;
    let m = /^Key([A-Z])$/.exec(code);
    const de = !root.navigator || /^de/i.test(root.navigator.language || 'de');
    if (m) return de && DE[code] ? DE[code] : m[1];
    if ((m = /^Digit(\d)$/.exec(code))) return m[1];
    if ((m = /^Numpad(\d)$/.exec(code))) return 'Ziffernblock ' + m[1];
    if (/^F\d{1,2}$/.test(code)) return code;
    return (de ? DE[code] : US[code]) || US[code] || code;
  }

  function create(opts) {
    opts = opts || {};
    const win = opts.target || root, doc = root.document, nav = root.navigator;
    let keys = {}, codeMap = {}, mode = 'game', dev = (root.matchMedia && root.matchMedia('(pointer:coarse)').matches) ? 'touch' : 'keyboard', touch = null, focusEl = null, dead = false;
    const held = new Set(), downActs = new Set(), mine = new WeakSet();
    for (const a in DEFAULT_KEYS) keys[a] = DEFAULT_KEYS[a].slice();
    if (opts.keys) for (const a in opts.keys) keys[a] = [].concat(opts.keys[a]).filter(Boolean);
    function remap() { codeMap = {}; for (const a in keys) for (const c of keys[a]) (codeMap[c] = codeMap[c] || []).push(a); }   // Code -> [Aktionen]
    remap();

    if (!layoutAsked && nav && nav.keyboard && nav.keyboard.getLayoutMap) {
      layoutAsked = true;
      try { nav.keyboard.getLayoutMap().then(m => { layout = m; }, () => {}); } catch (e) { /* egal */ }
    }

    function fire(name, phase) {
      if (phase === 'down') { if (downActs.has(name)) return; downActs.add(name); }
      else { if (!downActs.has(name)) return; downActs.delete(name); }
      if (opts.onAction) { try { opts.onAction(name, phase); } catch (e) { if (root.console) console.error(e); } }
    }
    function sendOne(name) { if (opts.onAction) { try { opts.onAction(name, 'down'); } catch (e) { if (root.console) console.error(e); } } }
    const sendBack = () => sendOne('back');
    function setDev(d) { if (d === dev) return; dev = d; if (opts.onDevice) { try { opts.onDevice(d); } catch (e) { if (root.console) console.error(e); } } }
    function releaseAll() { held.clear(); for (const a of Array.from(downActs)) fire(a, 'up'); padRelease(); }

    // ---------- Menü-Fokus (räumlich) ----------
    function visible(e) { return !!(e.getClientRects && e.getClientRects().length) && root.getComputedStyle(e).visibility !== 'hidden'; }
    function focusRoot() {
      if (!doc) return null;
      const all = doc.querySelectorAll('[data-amu-focus-root]');
      for (let i = all.length - 1; i >= 0; i--) if (visible(all[i])) return all[i];
      return null;
    }
    function focusables(r) { return Array.from(r.querySelectorAll(FOCUSABLE)).filter(e => !e.disabled && !e.closest('[inert],[aria-hidden="true"]') && visible(e)); }
    function setFocus(e) {
      if (focusEl && focusEl !== e) focusEl.classList.remove('amu-focus');
      focusEl = e || null;
      if (!e) return;
      injectCss(doc); e.classList.add('amu-focus');
      try { e.focus({ preventScroll: true }); } catch (x) { /* egal */ }
      if (e.scrollIntoView) { try { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { /* egal */ } }
    }
    function clearFocus() { if (focusEl) focusEl.classList.remove('amu-focus'); focusEl = null; }
    function current(r, els) {
      if (focusEl && focusEl.isConnected && r.contains(focusEl) && els.includes(focusEl)) return focusEl;
      const a = doc.activeElement;
      return a && r.contains(a) && els.includes(a) ? a : null;
    }
    function menuMove(dir) {
      const r = focusRoot(); if (!r) return false;
      const els = focusables(r); if (!els.length) return false;
      const cur = current(r, els);
      if (!cur) { setFocus(r.querySelector('[data-amu-default]:not([disabled])') || els[0]); return true; }
      const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
      let best = null, bs = Infinity;
      for (const e of els) {
        if (e === cur) continue;
        const b = e.getBoundingClientRect(), dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy;
        const main = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx;
        const side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
        if (main < 4) continue;
        const sc = main + side * 2; if (sc < bs) { bs = sc; best = e; }
      }
      if (!best) { const i = els.indexOf(cur); best = els[(i + (dir === 'down' || dir === 'right' ? 1 : -1) + els.length) % els.length]; }
      setFocus(best);
      return true;
    }
    function menuPress() {
      const r = focusRoot();
      const e = focusEl && focusEl.isConnected && !focusEl.disabled && r && r.contains(focusEl) ? focusEl : null;
      if (!e) return false;
      if (e.tagName === 'SELECT' && e.options.length) {   // Auswahlliste: nächster Eintrag
        e.selectedIndex = (e.selectedIndex + 1) % e.options.length;
        e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (isTyping(e)) { try { e.focus(); } catch (x) { /* egal */ } }
      else e.click();
      return true;
    }

    // ---------- Tastatur ----------
    function onKeyDown(e) {
      if (dead || mine.has(e)) return;
      setDev('keyboard');
      const typing = isTyping(e.target) || isTyping(doc && doc.activeElement);
      const code = e.code;
      let acts = codeMap[code];
      if (code === 'Escape' && !(acts || []).includes('menu')) acts = (acts || []).concat('menu');   // Esc wirkt immer
      const act = acts && acts[0];
      if (mode === 'task') return;   // Mini-Aufgaben lesen die Tastatur selbst
      if (mode === 'text' || (typing && mode === 'game')) {
        if (code === 'Escape') { e.preventDefault(); if (!e.repeat) sendBack(); }
        return;
      }
      if (mode === 'menu') {
        const d = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[code];
        if (d) { if (!typing && menuMove(d)) e.preventDefault(); return; }
        if (code === 'Enter' || code === 'NumpadEnter') { if (!e.repeat && !typing && menuPress()) e.preventDefault(); return; }
        if (code === 'Escape') { e.preventDefault(); if (!e.repeat) sendBack(); }
        return;
      }
      // Spiel
      if (code === 'Space' || code === 'Tab' || /^Arrow/.test(code) || (act && act !== 'menu' && !e.ctrlKey && !e.metaKey && !e.altKey)) e.preventDefault();
      if (!act || e.ctrlKey || e.metaKey) return;
      held.add(code);
      if (!e.repeat) for (const a of acts) if (!MOVE[a]) fire(a, 'down');
    }
    function onKeyUp(e) {
      if (dead || mine.has(e)) return;
      held.delete(e.code);
      const acts = (codeMap[e.code] || []).concat(e.code === 'Escape' ? ['menu'] : []);
      for (const a of acts) if (!MOVE[a] && !(keys[a] || []).some(c => held.has(c))) fire(a, 'up');
    }
    function onBlur() { releaseAll(); }
    function onPointer(e) {
      if (!e.isTrusted) return;
      if (e.pointerType === 'touch' || e.pointerType === 'pen') setDev('touch'); else setDev('keyboard');
      if (focusEl && e.pointerType === 'mouse') clearFocus();
    }

    // ---------- Gamecontroller ----------
    let running = false, raf = 0, prev = null, fresh = true, padIdx = -1, padAxis = { x: 0, y: 0 }, camAxis = { x: 0, y: 0 };
    const padHeldKeys = new Set(), rep = {};
    function standardPads() {
      let l; try { l = nav.getGamepads ? nav.getGamepads() || [] : []; } catch (e) { l = []; }
      const a = [];
      for (let i = 0; i < l.length; i++) { const p = l[i]; if (p && p.connected !== false && p.mapping === 'standard') a.push(p); }
      return a;
    }
    function readPad(p) {
      const A = p.axes || [], s = { b: [], ax: A[0] || 0, ay: A[1] || 0, rx: A[2] || 0, ry: A[3] || 0, any: false };
      for (let i = 0; i < 16; i++) { const b = p.buttons[i]; s.b[i] = !!(b && (b.pressed || b.value > 0.5)); if (s.b[i]) s.any = true; }
      if (Math.max(Math.abs(s.ax), Math.abs(s.ay), Math.abs(s.rx), Math.abs(s.ry)) > 0.5) s.any = true;
      return s;
    }
    function synth(code, down, repeat) {
      if (!doc) return;
      const ki = KEYINFO[code] || [code, 0];
      let ev;
      try { ev = new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ki[0], code: code, keyCode: ki[1], which: ki[1], repeat: !!repeat, bubbles: true, cancelable: true, composed: true }); }
      catch (e) { return; }
      try { if (ev.keyCode !== ki[1]) { Object.defineProperty(ev, 'keyCode', { get: () => ki[1] }); Object.defineProperty(ev, 'which', { get: () => ki[1] }); } } catch (e) { /* egal */ }
      mine.add(ev);
      if (down) padHeldKeys.add(code); else padHeldKeys.delete(code);
      let t = doc.activeElement; if (!t || t === doc.body || t === doc.documentElement) t = doc;
      t.dispatchEvent(ev);
    }
    function padRelease() {
      for (const c of Array.from(padHeldKeys)) synth(c, false);
      for (const d in rep) delete rep[d];
      padAxis = { x: 0, y: 0 }; camAxis = { x: 0, y: 0 }; fresh = true;
    }
    function dirsOf(s) {   // Steuerkreuz oder linker Stick (nur Hauptrichtung)
      const o = { up: s.b[12], down: s.b[13], left: s.b[14], right: s.b[15] };
      const ax = s.ax, ay = s.ay;
      if (Math.max(Math.abs(ax), Math.abs(ay)) > 0.5) {
        if (Math.abs(ax) > Math.abs(ay)) o[ax < 0 ? 'left' : 'right'] = true; else o[ay < 0 ? 'up' : 'down'] = true;
      }
      return o;
    }
    function frame(now) {
      raf = 0;
      if (!running || dead) return;
      const list = standardPads();
      if (!list.length) { stopPad(); return; }
      raf = root.requestAnimationFrame(frame);
      if (doc && doc.hidden) return;
      // aktiver Controller: der zuletzt benutzte, sonst der erste
      let p = list.find(q => q.index === padIdx), s = p && readPad(p);
      if (!p || !s.any) for (const q of list) { if (q === p) continue; const qs = readPad(q); if (qs.any) { p = q; s = qs; break; } }
      if (!p) { p = list[0]; s = readPad(p); }
      if (p.index !== padIdx) {   // Wechsel: alte Eingaben lösen, neue Drücke zählen sofort
        const was = padIdx; padIdx = p.index;
        if (was >= 0) { padRelease(); for (const i in PAD_GAME) fire(PAD_GAME[i], 'up'); fresh = false; prev = { b: [], ax: 0, ay: 0, rx: 0, ry: 0, any: false }; }
      }
      const pv = prev; prev = s;
      if (fresh || !pv) { fresh = false; return; }   // erster Durchlauf nach Start/Moduswechsel: nur merken
      if (s.any && !pv.any) setDev('pad');
      if (mode === 'game') {
        padAxis = stick(s.ax, s.ay); camAxis = stick(s.rx, s.ry);
        for (const i in PAD_GAME) {
          if (s.b[i] && !pv.b[i]) fire(PAD_GAME[i], 'down');
          else if (!s.b[i] && pv.b[i]) fire(PAD_GAME[i], 'up');
        }
        return;
      }
      padAxis = { x: 0, y: 0 }; camAxis = { x: 0, y: 0 };
      if (mode === 'text') { if (s.b[1] && !pv.b[1]) sendBack(); return; }
      const d = dirsOf(s), pd = dirsOf(pv);
      for (const dir of DIRS) {
        if (d[dir] && !pd[dir]) { rep[dir] = now + 380; dirDo(dir, true, false); }
        else if (!d[dir] && pd[dir]) { delete rep[dir]; dirDo(dir, false); }
        else if (d[dir] && rep[dir] && now >= rep[dir]) { rep[dir] = now + 110; dirDo(dir, true, true); }
      }
      if (mode === 'menu') {
        if (s.b[0] && !pv.b[0]) menuPress();
        if ((s.b[1] && !pv.b[1]) || (s.b[9] && !pv.b[9])) sendBack();
        if (s.b[4] && !pv.b[4]) sendOne('tabPrev');
        if (s.b[5] && !pv.b[5]) sendOne('tabNext');
      } else if (mode === 'task') {
        for (const i in PAD_TASK) {
          if (s.b[i] && !pv.b[i]) synth(PAD_TASK[i], true);
          else if (!s.b[i] && pv.b[i]) synth(PAD_TASK[i], false);
        }
      }
    }
    function stick(x, y) {   // runde Totzone 0,2, Länge ≤ 1
      const m = Math.hypot(x, y);
      if (m < 0.2) return { x: 0, y: 0 };
      const k = Math.min(1, (m - 0.2) / 0.8) / m; return { x: x * k, y: y * k };
    }
    function dirDo(dir, down, repeat) {
      if (mode === 'menu') { if (down) menuMove(dir); }
      else if (mode === 'task') synth(DIRKEY[dir], down, repeat);
    }
    function startPad() {
      if (running || dead || !root.requestAnimationFrame || !standardPads().length) return;
      running = true; prev = null; fresh = true; raf = root.requestAnimationFrame(frame);
    }
    function stopPad() {
      running = false; if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf); raf = 0;
      prev = null; padRelease();
      for (const i in PAD_GAME) fire(PAD_GAME[i], 'up');
    }
    function onPadOff() { if (!standardPads().length) stopPad(); }

    // ---------- Touch-Anbindung ----------
    function attachTouch(t) {
      touch = t || null;
      if (t && t.bind) t.bind((id, phase) => { setDev('touch'); if (mode === 'game') fire(id, phase); else if (phase === 'up') fire(id, 'up'); });
      return inp;
    }

    const L = [];
    function on(t, type, fn, cap) { if (t && t.addEventListener) { t.addEventListener(type, fn, cap); L.push([t, type, fn, cap]); } }
    on(win, 'keydown', onKeyDown, false);
    on(win, 'keyup', onKeyUp, false);
    on(win, 'blur', onBlur, false);
    on(win, 'pointerdown', onPointer, true);
    on(win, 'gamepadconnected', startPad, false);
    on(win, 'gamepaddisconnected', onPadOff, false);
    if (doc) on(doc, 'visibilitychange', () => { if (doc.hidden) releaseAll(); }, false);
    startPad();

    const inp = {
      axis() {
        if (mode !== 'game') return { x: 0, y: 0 };
        let x = 0, y = 0;
        const k = a => (keys[a] || []).some(c => held.has(c)) ? 1 : 0;
        x += k('right') - k('left'); y += k('down') - k('up');
        if (touch && touch.axis) { const t = touch.axis(); x += t.x || 0; y += t.y || 0; }
        x += padAxis.x; y += padAxis.y;
        const m = Math.hypot(x, y);
        if (m > 1) { x /= m; y /= m; }
        return { x, y };
      },
      camAxis: () => mode === 'game' ? { x: camAxis.x, y: camAxis.y } : { x: 0, y: 0 },
      setMode(m) {
        if (m === mode || !/^(game|menu|task|text)$/.test(m)) return inp;
        releaseAll(); mode = m;
        if (m !== 'menu') clearFocus();
        return inp;
      },
      mode: () => mode,
      isDown: name => downActs.has(name),
      rebind(action, code) {
        if (!action || !code) return false;
        const old = keys[action] || [];
        keys[action] = Array.isArray(code) ? code.filter(Boolean) : [code].concat(old.slice(1).filter(c => c !== code));
        held.clear(); remap();
        return inp.conflicts().filter(c => c.actions.includes(action));   // [] = ohne Konflikt
      },
      keys() { const o = {}; for (const a in keys) o[a] = keys[a].slice(); return o; },
      conflicts() { const o = []; for (const c in codeMap) if (codeMap[c].length > 1) o.push({ code: c, actions: codeMap[c].slice() }); return o; },
      resetKeys(action) {   // ohne Argument: alle Tasten zurück
        if (action) { if (DEFAULT_KEYS[action]) keys[action] = DEFAULT_KEYS[action].slice(); }
        else { keys = {}; for (const a in DEFAULT_KEYS) keys[a] = DEFAULT_KEYS[a].slice(); }
        held.clear(); remap();
      },
      keyName,
      lastDevice: () => dev,
      attachTouch,
      menuMove, menuPress,
      focused: () => focusEl,
      pads: () => standardPads().length,
      destroy() {
        if (dead) return;
        releaseAll(); stopPad(); dead = true; clearFocus();
        for (const [t, type, fn, cap] of L) t.removeEventListener(type, fn, cap);
        L.length = 0;
        if (touch && touch.bind) touch.bind(null);
        touch = null;
      }
    };
    return inp;
  }

  AMU.Input = { create, DEFAULT_KEYS, PAD_GAME, PAD_TASK, keyName, isTyping };
})(typeof window !== 'undefined' ? window : globalThis);

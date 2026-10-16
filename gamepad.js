/*!
 * gamepad.js – Gamecontroller für alle easygames-Spiele (keine Abhängigkeiten)
 *
 *   <script src="../gamepad.js" defer></script>
 *   <script src="../gamepad.js" data-pad="a=Space y=KeyR ls=wasd" defer></script>   // eigene Belegung
 *
 * Macht aus Controller-Eingaben das, was die Spiele schon verstehen:
 *   - Steuerkreuz und linker Stick = Pfeiltasten (ls=wasd: Stick = W A S D), A = Enter, B = Escape, X = Leertaste,
 *     Y = E, LB = Q, RB = E, Start = P, Select = M (jede Taste per data-pad änderbar, "-" = nichts;
 *     a=Space/Enter: erst Leertaste, und nur wenn das Spiel sie nicht verarbeitet, zusätzlich Enter – z. B. Springen im Spiel, Bestätigen im Menü)
 *   - Menüs ohne Pfeiltasten-Steuerung: Das Steuerkreuz springt zwischen sichtbaren Knöpfen (Leuchtrahmen), A klickt.
 *     Das passiert nur, wenn das Spiel die Pfeiltaste selbst nicht verarbeitet (kein preventDefault, keine sofortige Änderung
 *     an der Seite); data-pad="nonav" schaltet es ab.
 *   - Rechter Stick = Mauszeiger; solange er sichtbar ist, klickt A (gedrückt halten = ziehen). rs=stay: Zeiger bleibt sichtbar
 *     (für Spiele, die man fast nur per Klick spielt), rs=qe: rechter Stick = Q/E statt Zeiger, rs=none: aus.
 * Ohne angeschlossenen Controller läuft nichts mit (keine Schleife, kein Overlay).
 * Spiele mit eigener Controller-Steuerung binden die Datei nicht ein, damit nichts doppelt reagiert.
 * API: EasyGamesPad.enabled(false) hält alles an, EasyGamesPad.map zeigt die Belegung.
 */
(function (root) {
  'use strict';
  var doc = root.document, nav = root.navigator;
  if (!doc || !nav || !nav.getGamepads || root.EasyGamesPad) return;

  // Standard-Belegung (W3C "standard"-Layout: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Select, 9 Start, 10 L3, 11 R3, 12–15 Steuerkreuz)
  var NAMES = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9, l3: 10, r3: 11 };
  var MAP = { a: 'Enter', b: 'Escape', x: 'Space', y: 'KeyE', lb: 'KeyQ', rb: 'KeyE', lt: '', rt: '', select: 'KeyM', start: 'KeyP', l3: '', r3: '' };
  var opt = { ls: 'arrows', rs: 'cursor', nav: true };
  var DIRS = { arrows: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], wasd: ['KeyW', 'KeyS', 'KeyA', 'KeyD'], qe: ['', '', 'KeyQ', 'KeyE'] };

  var me = doc.currentScript;
  (((me && me.getAttribute('data-pad')) || '') + ' ' + (root.EASYGAMES_PAD || '')).split(/\s+/).forEach(function (t) {
    if (!t) return;
    if (t === 'nonav') { opt.nav = false; return; }
    var kv = t.split('='), k = kv[0], v = kv[1] === '-' ? '' : (kv[1] || '');
    if (k in MAP) MAP[k] = v; else if (k === 'ls' || k === 'rs') opt[k] = v || 'none';
  });

  // ---------- Tastatur-Ereignisse ----------
  var KEYS = { Enter: ['Enter', 13], Escape: ['Escape', 27], Space: [' ', 32], Tab: ['Tab', 9], Backspace: ['Backspace', 8], Delete: ['Delete', 46],
    ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39],
    ShiftLeft: ['Shift', 16], ControlLeft: ['Control', 17], Equal: ['+', 187], Minus: ['-', 189] };
  function keyInfo(code) {
    if (KEYS[code]) return KEYS[code];
    var m = /^Key([A-Z])$/.exec(code); if (m) return [m[1].toLowerCase(), m[1].charCodeAt(0)];
    m = /^Digit([0-9])$/.exec(code); if (m) return [m[1], 48 + +m[1]];
    return [code, 0];
  }
  var held = {};   // code -> Anzahl Tasten, die ihn gerade halten
  function send(code, down) {
    if (!code) return false;
    if (down) { held[code] = (held[code] || 0) + 1; if (held[code] > 1) return false; }
    else { if (!held[code]) return false; if (--held[code] > 0) return false; delete held[code]; }
    var ki = keyInfo(code), t = doc.activeElement;
    if (!t || t === doc.documentElement || t.tagName === 'IFRAME') t = doc.body || doc.documentElement;
    var ev;
    try { ev = new KeyboardEvent(down ? 'keydown' : 'keyup', { key: ki[0], code: code, keyCode: ki[1], which: ki[1], bubbles: true, cancelable: true, composed: true, shiftKey: code === 'ShiftLeft' && down }); }
    catch (e) { return false; }
    try { if (ev.keyCode !== ki[1]) { Object.defineProperty(ev, 'keyCode', { get: function () { return ki[1]; } }); Object.defineProperty(ev, 'which', { get: function () { return ki[1]; } }); } } catch (e) {}
    // Hat das Spiel die Taste verarbeitet? preventDefault, Fokuswechsel oder sofortige Änderung an der Seite zählen als „ja“.
    var mo = null, before = doc.activeElement;
    if (down && root.MutationObserver && doc.body) { mo = new MutationObserver(function () {}); mo.observe(doc.body, { subtree: true, childList: true, attributes: true, characterData: true }); }
    t.dispatchEvent(ev);
    var changed = mo ? mo.takeRecords().length > 0 : false; if (mo) mo.disconnect();
    if (doc.activeElement !== before) changed = true;
    // wie eine echte Tastatur: Enter auf einem fokussierten Knopf/Link löst ihn aus (synthetische Ereignisse tun das sonst nicht)
    if (down && code === 'Enter' && !ev.defaultPrevented && t === doc.activeElement && t.isConnected !== false && !t.disabled &&
        (/^(BUTTON|A|SUMMARY)$/.test(t.tagName) || (t.tagName === 'INPUT' && /^(button|submit|reset|checkbox|radio|image)$/.test(t.type)))) {
      if (t.tagName !== 'A' || t.hasAttribute('href')) { try { t.click(); } catch (e) {} return true; }
    }
    return ev.defaultPrevented || changed;
  }
  function releaseAll() { for (var c in held) { held[c] = 1; send(c, false); } held = {}; }

  // ---------- Overlays (erst bei Bedarf angelegt) ----------
  var cursor = null, ring = null;
  function el(css) { var d = doc.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;display:none;' + css; (doc.body || doc.documentElement).appendChild(d); return d; }
  function show(d, on) { if (d) d.style.display = on ? 'block' : 'none'; }

  // ---------- Mauszeiger am rechten Stick ----------
  var cx = -1, cy = -1, cursorUntil = 0, mouseDown = false, downEl = null;
  var STAY = opt.rs === 'stay';
  function cursorOn(now) { return now < cursorUntil || mouseDown; }
  function pointer(type, x, y) {
    var t = doc.elementFromPoint(x, y); if (!t) return null;
    var down = type === 'down', up = type === 'up', base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: down || (mouseDown && !up) ? 1 : 0, view: root };
    try { if (root.PointerEvent) t.dispatchEvent(new PointerEvent('pointer' + type, mix(base, { pointerId: 1, pointerType: 'mouse', isPrimary: true }))); } catch (e) {}
    try { t.dispatchEvent(new MouseEvent('mouse' + type, base)); } catch (e) {}
    return t;
  }
  function mix(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function click(t, x, y) {
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') { try { t.focus(); } catch (e) {} }
    try { t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, view: root })); } catch (e) {}
  }
  function moveCursor(dx, dy, now) {
    var w = root.innerWidth, h = root.innerHeight;
    if (cx < 0) { cx = w / 2; cy = h / 2; }
    cx = Math.max(0, Math.min(w - 1, cx + dx)); cy = Math.max(0, Math.min(h - 1, cy + dy));
    if (!cursor) cursor = el('width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid #fff;background:rgba(255,200,0,.55);box-shadow:0 0 0 2px #000,0 0 12px rgba(255,200,0,.9);');
    cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; show(cursor, true);
    cursorUntil = STAY ? Infinity : now + 4000; clearRing();
    pointer('move', cx, cy);
  }

  // ---------- Knopf-Navigation mit dem Steuerkreuz ----------
  var SEL = 'button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=menuitem],[role=tab],[role=option],[role=link],[onclick],[tabindex]:not([tabindex="-1"])';
  var focusEl = null;
  function usable(e) {
    if (e === cursor || e === ring || e.disabled) return null;
    var r = e.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.right < 0 || r.top > root.innerHeight || r.left > root.innerWidth) return null;
    var x = Math.min(Math.max(r.left + r.width / 2, 0), root.innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 0), root.innerHeight - 1);
    var hit = doc.elementFromPoint(x, y);
    if (!hit || (hit !== e && !e.contains(hit) && !hit.contains(e))) return null;   // verdeckt (z. B. von einem Fenster darüber)
    return { e: e, r: r, x: x, y: y };
  }
  function candidates() {
    var out = [], seen = [], all = doc.querySelectorAll(SEL), i, c;
    for (i = 0; i < all.length; i++) if ((c = usable(all[i]))) { out.push(c); seen.push(all[i]); }
    // Elemente, die nur per Klick-Handler reagieren, erkennt man am Hand-Zeiger (nur das äußerste zählt)
    var any = doc.body ? doc.body.getElementsByTagName('*') : [];
    for (i = 0; i < any.length && i < 4000; i++) {
      var e = any[i]; if (seen.indexOf(e) >= 0 || e.tagName === 'CANVAS') continue;
      var cs = root.getComputedStyle(e); if (cs.cursor !== 'pointer' || cs.visibility === 'hidden') continue;
      var p = e.parentElement; if (p && root.getComputedStyle(p).cursor === 'pointer') continue;
      if ((c = usable(e))) out.push(c);
    }
    return out;
  }
  function pick(dir) {
    var list = candidates(); if (!list.length) return null;
    var cur = focusEl && usable(focusEl), best = null, bestScore = Infinity, i, c;
    if (!cur) {   // erster Druck: oberster, dann linkester Knopf
      for (i = 0; i < list.length; i++) { c = list[i]; var s = Math.round(c.r.top / 8) * 1e5 + c.r.left; if (s < bestScore) { bestScore = s; best = c; } }
      return best;
    }
    var vx = [0, 0, -1, 1][dir], vy = [-1, 1, 0, 0][dir];
    for (i = 0; i < list.length; i++) {
      c = list[i]; if (c.e === cur.e || c.e.contains(cur.e) || cur.e.contains(c.e)) continue;
      var dx = c.x - cur.x, dy = c.y - cur.y, along = dx * vx + dy * vy, across = Math.abs(dx * vy - dy * vx);
      if (along <= 2) continue;
      var score = along + across * 2.5; if (score < bestScore) { bestScore = score; best = c; }
    }
    return best || cur;
  }
  function drawRing() {
    if (!focusEl) return;
    var c = usable(focusEl); if (!c) { clearRing(); return; }
    if (!ring) ring = el('border:3px solid #ffd400;border-radius:10px;box-shadow:0 0 0 2px #000,0 0 18px rgba(255,212,0,.85);box-sizing:border-box;');
    ring.style.transform = 'translate(' + (c.r.left - 5) + 'px,' + (c.r.top - 5) + 'px)'; ring.style.width = (c.r.width + 10) + 'px'; ring.style.height = (c.r.height + 10) + 'px'; show(ring, true);
  }
  function clearRing() { focusEl = null; show(ring, false); }
  function navigate(dir) {
    var c = pick(dir); if (!c) return;
    focusEl = c.e; drawRing(); cursorUntil = 0; show(cursor, false);
    try { if (c.e.scrollIntoView) c.e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
  }
  function activate() {
    var c = focusEl && usable(focusEl); if (!c) { clearRing(); return false; }
    if (c.e.tagName === 'SELECT' && c.e.options.length) {   // Auswahlliste lässt sich nicht per Skript aufklappen: A nimmt den nächsten Eintrag
      c.e.selectedIndex = (c.e.selectedIndex + 1) % c.e.options.length;
      c.e.dispatchEvent(new Event('input', { bubbles: true })); c.e.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    pointer('down', c.x, c.y); pointer('up', c.x, c.y); click(c.e, c.x, c.y);
    root.setTimeout(drawRing, 50);
    return true;
  }

  // ---------- Abfrage-Schleife (läuft nur, solange ein Controller da ist) ----------
  var enabled = true, running = false, last = 0, prev = {}, aMode = '', navRep = {}, lsDirs = DIRS[opt.ls] || null, rsDirs = DIRS[opt.rs] || null;
  function pads() { var a = [], l; try { l = nav.getGamepads() || []; } catch (e) { l = []; } for (var i = 0; i < l.length; i++) if (l[i] && l[i].connected !== false) a.push(l[i]); return a; }
  function state(list) {
    var s = { b: [], ls: [0, 0, 0, 0], rs: [0, 0], d: [0, 0, 0, 0] };
    list.forEach(function (gp) {
      for (var i = 0; i < 12; i++) { var b = gp.buttons[i]; if (b && (b.pressed || b.value > 0.5)) s.b[i] = 1; }
      for (i = 0; i < 4; i++) { b = gp.buttons[12 + i]; if (b && b.pressed) s.d[i] = 1; }
      var ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
      if (ay < -0.5) s.ls[0] = 1; if (ay > 0.5) s.ls[1] = 1; if (ax < -0.5) s.ls[2] = 1; if (ax > 0.5) s.ls[3] = 1;
      if (Math.abs(rx) > Math.abs(s.rs[0])) s.rs[0] = rx; if (Math.abs(ry) > Math.abs(s.rs[1])) s.rs[1] = ry;
    });
    return s;
  }
  function frame(now) {
    if (!running) return;
    var list = pads();
    if (!list.length) { stop(); return; }
    root.requestAnimationFrame(frame);
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
    if (!enabled || doc.hidden) return;
    var s = state(list), p = prev, i;
    prev = s;
    if (!p.b) return;   // erster Durchlauf: nur Zustand merken, damit ein schon gedrückter Knopf nichts auslöst

    // Steuerkreuz: Pfeiltasten; wenn das Spiel sie nicht verarbeitet -> Knopf-Navigation (mit Wiederholung beim Halten)
    for (i = 0; i < 4; i++) {
      if (s.d[i] && !p.d[i]) {
        var used = send(DIRS.arrows[i], true);
        if (opt.nav && !used) { navigate(i); navRep[i] = now + 400; } else if (used) clearRing();
      } else if (!s.d[i] && p.d[i]) { send(DIRS.arrows[i], false); delete navRep[i]; }
      else if (s.d[i] && navRep[i] && now >= navRep[i] && focusEl) { navigate(i); navRep[i] = now + 140; }
    }
    // linker Stick
    for (i = 0; i < 4; i++) {
      if (s.ls[i] && !p.ls[i]) { if (lsDirs) send(lsDirs[i], true); clearRing(); }
      else if (!s.ls[i] && p.ls[i] && lsDirs) send(lsDirs[i], false);
    }
    // rechter Stick: Mauszeiger oder Tasten
    var rx = s.rs[0], ry = s.rs[1], mag = Math.sqrt(rx * rx + ry * ry);
    if (opt.rs === 'cursor' || STAY) {
      if (mag > 0.18) { var sp = 1100 * Math.pow(Math.min(1, (mag - 0.18) / 0.82), 2) / mag; moveCursor(rx * sp * dt, ry * sp * dt, now); }
      else if (cursor && !cursorOn(now)) show(cursor, false);
    } else if (rsDirs) {
      var r = [ry < -0.5, ry > 0.5, rx < -0.5, rx > 0.5], pr = p.rk || [];
      for (i = 0; i < 4; i++) if (rsDirs[i] && r[i] !== !!pr[i]) send(rsDirs[i], r[i]);
      s.rk = r;
    }
    // Knöpfe
    for (i = 0; i < 12; i++) {
      var name = BTN[i], code = MAP[name];
      if (s.b[i] && !p.b[i]) {
        if (i === 0 && cursor && cursorOn(now)) { aMode = 'mouse'; mouseDown = true; downEl = pointer('down', cx, cy); continue; }
        if (i === 0 && focusEl && activate()) { aMode = 'nav'; continue; }
        if (i === 0) aMode = 'key';
        var alt = (code || '').split('/');
        alt2[i] = !send(alt[0], true) && alt[1] ? alt[1] : '';
        if (alt2[i]) send(alt2[i], true);
      } else if (!s.b[i] && p.b[i]) {
        if (i === 0 && aMode === 'mouse') { mouseDown = false; var up = pointer('up', cx, cy); if (up && downEl && (up === downEl || up.contains(downEl) || downEl.contains(up))) click(up, cx, cy); downEl = null; if (!STAY) cursorUntil = now + 4000; aMode = ''; continue; }
        if (i === 0 && aMode === 'nav') { aMode = ''; continue; }
        if (i === 0) aMode = '';
        send((code || '').split('/')[0], false);
        if (alt2[i]) { send(alt2[i], false); alt2[i] = ''; }
      }
    }
    if (focusEl) drawRing();
  }
  var BTN = [], alt2 = []; for (var n in NAMES) BTN[NAMES[n]] = n;
  function start() {
    if (running || !pads().length) return;
    running = true; last = 0; prev = {}; root.requestAnimationFrame(frame);
  }
  function stop() { running = false; releaseAll(); clearRing(); show(cursor, false); mouseDown = false; prev = {}; }

  root.addEventListener('gamepadconnected', start);
  root.addEventListener('gamepaddisconnected', function () { if (!pads().length) stop(); });
  root.addEventListener('blur', releaseAll);
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) releaseAll(); });
  // echte Maus/Touch-Eingabe: Leuchtrahmen und Zeiger ausblenden
  root.addEventListener('pointerdown', function (e) { if (e.isTrusted) { clearRing(); cursorUntil = 0; show(cursor, false); } }, true);
  start();   // Controller, der schon vor dem Laden verbunden war

  root.EasyGamesPad = {
    version: 1, map: MAP, options: opt,
    enabled: function (on) { if (on === undefined) return enabled; enabled = !!on; if (!enabled) { releaseAll(); clearRing(); show(cursor, false); } return enabled; }
  };
})(window);

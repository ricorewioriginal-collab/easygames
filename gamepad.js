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
 *   - Rechter Stick / A tippen auch für Touch-Spiele: neben Zeiger- und Maus-Ereignissen kommen echte Touch-Ereignisse (wie am Handy).
 *   - Einheitlich für alle Spiele: Beschriftung und Bildschirm-Knöpfe je Eintrag – name=Taste[/Ersatz][:Text][@Selektor],
 *     z. B. data-pad="a=KeyJ/Enter:Angriff@#bAtk b=Space:Ausweichen x=:Springen@#jump up=ArrowUp:Befehl right=Enter:Ausführen".
 *     :Text erscheint in der Controller-Belegung (beim ersten Controller-Einsatz und mit Select + Start), @Selektor zeigt das
 *     Knopf-Symbol (A/B/X/Y …) auf dem Bildschirm-Knopf; ohne Taste drückt der Controller-Knopf ihn (für Touch-Knöpfe).
 *     up=/down=/left=/right= belegen das Steuerkreuz einzeln (Standard: Pfeiltasten).
 *     Nur Texte: data-pad-labels="a=Springen; b=Zurück; dpad=Auswählen; ls=Laufen" (gleiche Namen, dazu dpad, ls, rs).
 *     data-pad="info": für Spiele mit eigener Controller-Steuerung – nichts wird nachgeahmt, nur Belegung, Symbole und Controller-Modus.
 *   - Controller-Modus: <html class="eg-pad"> und Ereignis „easygames:pad“ ({detail:{on}}) – Spiele können ihre Touch-Oberfläche
 *     dann gegen Controller-Hinweise tauschen. EasyGamesPad.active(), .legend() ([[Symbol, Text, Name]]), .showLegend(ms).
 * Alle Controller-Arten: navigator.getGamepads() liefert immer das Standard-Layout (Xbox-Anordnung), auch bei Pads ohne
 *   „standard“-Zuordnung (Steuerkreuz als Achse/Hat, Trigger als Achse, Ruhelage-Abgleich gegen Stick-Drift) und mit eigener
 *   Belegung aus der Windows-App (window.EASYGAMES_PADMAPS) oder localStorage „easygames-padmaps“ ({ "<Pad-ID>": Belegung }).
 *   Davon profitieren auch Spiele mit eigener Controller-Steuerung: Die Apps spielen nur diesen Teil in jede Seite ein
 *   (window.EASYGAMES_PAD_NORMAL_ONLY = 1 vor der Datei). API: EasyGamesPadNormal.raw(), .std(pad), .maps(), .setMap(id, map|null).
 * Ohne angeschlossenen Controller läuft nichts mit (keine Schleife, kein Overlay).
 * Spiele mit eigener Controller-Steuerung binden die Datei nicht ein, damit nichts doppelt reagiert.
 * API: EasyGamesPad.enabled(false) hält alles an, EasyGamesPad.focus(el) setzt den Leuchtrahmen, EasyGamesPad.map zeigt die Belegung.
 */
(function (root) {
  'use strict';
  var doc = root.document, nav = root.navigator;
  if (!nav || !nav.getGamepads) return;

  // ---------- Jeder Controller im Standard-Layout ----------
  // Belegung je Pad: { b: [17 Quellen], a: [4 Quellen] }; Quelle Knopf: {b:i} | {a:i,s:±1} (Achse über die Hälfte) | {h:i,d:0–3} (Hat hoch/runter/links/rechts);
  // Quelle Achse: {a:i,inv:true?} | {n:Quelle, p:Quelle} (zwei Knöpfe als Achse). Fehlende Einträge (oder null) = wie das Pad sie liefert.
  if (!root.EasyGamesPadNormal) (function () {
    var rawGet = nav.getGamepads.bind(nav), rest = {}, KEY = 'easygames-padmaps', cache = {};
    function maps() {
      var m = {}, k, ls = null;
      try { ls = JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (e) { }
      if (ls && typeof ls === 'object') for (k in ls) m[k] = ls[k];
      var host = root.EASYGAMES_PADMAPS;
      if (host && typeof host === 'object') for (k in host) m[k] = host[k];   // Windows-App: Einstellungen der App gelten überall
      return m;
    }
    var M = maps();
    root.addEventListener('storage', function (e) { if (e.key === KEY) M = maps(); });
    // Hat-Schalter (Chrome bei Pads ohne Standard-Zuordnung): -1 hoch … 1 hoch-links, Ruhe ≈ 1.29
    function hat(v) {
      if (v === undefined || Math.abs(v) > 1.05) return [0, 0, 0, 0];
      var k = Math.round((v + 1) * 3.5);   // 0 hoch, 1 hoch-rechts, 2 rechts, … 7 hoch-links
      return [k === 7 || k <= 1 ? 1 : 0, k >= 3 && k <= 5 ? 1 : 0, k >= 5 && k <= 7 ? 1 : 0, k >= 1 && k <= 3 ? 1 : 0];
    }
    function btn(v) { return { pressed: v > 0.5, touched: v > 0.05, value: v }; }
    function srcBtn(gp, q, R) {
      if (!q) return 0;
      if (q.b !== undefined) { var b = gp.buttons[q.b]; return b ? (b.pressed ? Math.max(b.value || 0, 1) : b.value || 0) : 0; }
      if (q.a !== undefined) { var v = (gp.axes[q.a] || 0) - (R[q.a] || 0); return Math.max(0, Math.min(1, v * q.s)); }
      if (q.h !== undefined) return hat(gp.axes[q.h])[q.d] ? 1 : 0;
      return 0;
    }
    function srcAxis(gp, q, R) {
      if (!q) return 0;
      if (q.a !== undefined) { var v = (gp.axes[q.a] || 0) - (Math.abs(R[q.a] || 0) < 0.3 ? R[q.a] || 0 : 0); v = Math.max(-1, Math.min(1, v)); return q.inv ? -v : v; }
      if (q.n || q.p) return srcBtn(gp, q.p, R) - srcBtn(gp, q.n, R);
      return 0;
    }
    // Ohne Standard-Zuordnung: übliche Abweichungen erkennen (Steuerkreuz als Hat oder Achsen 6/7, Trigger als Achsen mit Ruhelage -1)
    function auto(gp, R) {
      var n = gp.axes.length, b = [], a, i, hatAx = -1, trigAx = n >= 6 && R[2] < -0.9 && R[5] < -0.9;
      for (i = 0; i < n; i++) if (Math.abs(R[i]) > 1.05) { hatAx = i; break; }
      for (i = 0; i < 17; i++) b[i] = i < gp.buttons.length ? { b: i } : null;
      if (trigAx) { b[6] = { a: 2, s: 0.5 }; b[7] = { a: 5, s: 0.5 }; }
      if (hatAx >= 0) for (i = 0; i < 4; i++) b[12 + i] = { h: hatAx, d: i };
      else if (gp.buttons.length < 13 && n >= 8) { b[12] = { a: 7, s: -1 }; b[13] = { a: 7, s: 1 }; b[14] = { a: 6, s: -1 }; b[15] = { a: 6, s: 1 }; }
      a = [{ a: 0 }, { a: 1 }, trigAx ? { a: 3 } : n > 2 && hatAx !== 2 ? { a: 2 } : null, trigAx ? { a: 4 } : n > 3 && hatAx !== 3 ? { a: 3 } : null];
      return { b: b, a: a };
    }
    function std(gp) {
      if (!gp) return gp;
      var user = M[gp.id];
      if (!user && gp.mapping === 'standard') return gp;
      var key = gp.index + '|' + gp.id, R = rest[key], i;
      if (!R) { R = rest[key] = []; for (i = 0; i < gp.axes.length; i++) R[i] = gp.axes[i] || 0; }   // Ruhelage beim ersten Blick
      var base = gp.mapping === 'standard' ? null : (cache[key] || (cache[key] = auto(gp, R))), map = user || base, out = { b: [], a: [] };
      for (i = 0; i < 17; i++) {
        var q = map.b && map.b[i] != null ? map.b[i] : base ? base.b[i] : { b: i };
        out.b[i] = btn(srcBtn(gp, q, R));
      }
      for (i = 0; i < 4; i++) {
        var qa = map.a && map.a[i] != null ? map.a[i] : base ? base.a[i] : { a: i };
        out.a[i] = srcAxis(gp, qa, R);
      }
      return { id: gp.id, index: gp.index, connected: gp.connected, timestamp: gp.timestamp, mapping: 'standard', buttons: out.b, axes: out.a,
        vibrationActuator: gp.vibrationActuator, hapticActuators: gp.hapticActuators, raw: gp };
    }
    // Virtueller Controller (z. B. TikTok-Steuerung im Stream-Overlay): erscheint wie ein echtes Standard-Pad
    var virt = null, troll = {};
    function flip(g) { var b = g.buttons.slice(), t; t = b[12]; b[12] = b[13]; b[13] = t; t = b[14]; b[14] = b[15]; b[15] = t;
      return { id: g.id, index: g.index, connected: g.connected, timestamp: g.timestamp, mapping: 'standard', buttons: b, axes: g.axes.map(function (v) { return -v; }), vibrationActuator: g.vibrationActuator }; }
    function fire(type) { try { var ev = new Event(type); Object.defineProperty(ev, 'gamepad', { value: virt }); root.dispatchEvent(ev); } catch (e) { } }
    function list() {
      var l, o = []; try { l = rawGet() || []; } catch (e) { l = []; }
      for (var i = 0; i < l.length; i++) o[i] = l[i] ? std(l[i]) : null;
      if (virt) { if (o[virt.index]) virt.index = Math.max(4, o.length); while (o.length < virt.index) o.push(null); o[virt.index] = virt; }
      if (troll.invert) for (i = 0; i < o.length; i++) if (o[i] && o[i] !== virt) o[i] = flip(o[i]);   // TikTok-Streich: Steuerung des Spielers vertauscht
      if (troll.block) for (i = 0; i < o.length; i++) if (o[i] && o[i] !== virt) o[i] = { id: o[i].id, index: o[i].index, connected: true, timestamp: o[i].timestamp, mapping: 'standard',   // Steuerung weg
        buttons: o[i].buttons.map(function () { return { pressed: false, touched: false, value: 0 }; }), axes: o[i].axes.map(function () { return 0; }) };
      return o;
    }
    try { Object.defineProperty(nav, 'getGamepads', { value: list, configurable: true, writable: true }); } catch (e) { return; }
    // gamepadconnected liefert ebenfalls das Standard-Layout (für Spiele, die e.gamepad.mapping prüfen)
    ['gamepadconnected', 'gamepaddisconnected'].forEach(function (t) {
      root.addEventListener(t, function (e) { try { if (e.gamepad && !e.gamepad.raw) Object.defineProperty(e, 'gamepad', { value: std(e.gamepad) }); } catch (x) { } }, true);
    });
    root.EasyGamesPadNormal = {
      version: 1, raw: function () { try { return rawGet() || []; } catch (e) { return []; } }, std: std, auto: auto,
      maps: function () { return maps(); },
      /** Virtueller Controller an/aus; press(i, wert) drückt Knopf i (0–16), axis(i, wert) setzt Achse i (0–3). */
      virtual: function (on) {
        if (on && !virt) { virt = { id: 'easygames virtueller Controller (STANDARD GAMEPAD)', index: 3, connected: true, mapping: 'standard', timestamp: 0, buttons: [], axes: [0, 0, 0, 0] }; for (var i = 0; i < 17; i++) virt.buttons[i] = btn(0); fire('gamepadconnected'); }
        else if (!on && virt) { virt.connected = false; fire('gamepaddisconnected'); virt = null; }
        return virt;
      },
      troll: troll,   // { invert: true } vertauscht, { block: true } sperrt die Steuerung echter Controller (TikTok-Streiche)
      press: function (i, v) { this.virtual(true); virt.buttons[i] = btn(v); virt.timestamp = root.performance ? root.performance.now() : Date.now(); },
      axis: function (i, v) { this.virtual(true); virt.axes[i] = Math.max(-1, Math.min(1, v)); virt.timestamp = root.performance ? root.performance.now() : Date.now(); },
      setMap: function (id, map) {
        var m = {}; try { m = JSON.parse(root.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { }
        if (map) m[id] = map; else delete m[id];
        try { root.localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { }
        M = maps(); cache = {}; rest = {};
      }
    };
  })();
  if (root.EASYGAMES_PAD_NORMAL_ONLY) { try { delete root.EASYGAMES_PAD_NORMAL_ONLY; } catch (e) { root.EASYGAMES_PAD_NORMAL_ONLY = 0; } return; }
  if (!doc || root.EasyGamesPad) return;

  // Standard-Belegung (W3C "standard"-Layout: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Select, 9 Start, 10 L3, 11 R3, 12–15 Steuerkreuz)
  var NAMES = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9, l3: 10, r3: 11 };
  var MAP = { a: 'Enter', b: 'Escape', x: 'Space', y: 'KeyE', lb: 'KeyQ', rb: 'KeyE', lt: '', rt: '', select: 'KeyM', start: 'KeyP', l3: '', r3: '' };
  var opt = { ls: 'arrows', rs: 'cursor', nav: true };
  var DIRS = { arrows: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], wasd: ['KeyW', 'KeyS', 'KeyA', 'KeyD'], qe: ['', '', 'KeyQ', 'KeyE'] };

  // Steuerkreuz (Standard: Pfeiltasten; up=/down=/left=/right= ändern einzelne Richtungen), Beschriftungen und Bildschirm-Knöpfe
  var DPAD = DIRS.arrows.slice(), DN = { up: 0, down: 1, left: 2, right: 3 }, LABEL = {}, BIND = {};
  var me = doc.currentScript;
  // Eintrag: name=Taste[/Ersatz][:Beschriftung][@Knopf-Selektor] – z. B. a=KeyJ/Enter:Angriff@#bAtk (Unterstrich = Leerzeichen).
  // Ohne Taste (a=:Springen@#jump) drückt der Controller-Knopf den Bildschirm-Knopf (Touch-Spiele).
  (((me && me.getAttribute('data-pad')) || '') + ' ' + (root.EASYGAMES_PAD || '')).split(/\s+/).forEach(function (t) {
    if (!t) return;
    if (t === 'nonav') { opt.nav = false; return; }
    if (t === 'info') return;
    var i = t.indexOf('='); if (i < 0) return;
    var k = t.slice(0, i), v = t.slice(i + 1), at = v.indexOf('@'), sel = '';
    if (at >= 0) { sel = v.slice(at + 1); v = v.slice(0, at); }
    var c = v.indexOf(':'); if (c >= 0) { if (v.slice(c + 1)) LABEL[k] = v.slice(c + 1).replace(/_/g, ' '); v = v.slice(0, c); }
    if (v === '-') v = '';
    if (sel) BIND[k] = sel;
    if (k in MAP) MAP[k] = v; else if (k in DN) DPAD[DN[k]] = v; else if (k === 'ls' || k === 'rs') opt[k] = v || 'none';
  });
  // Nur Beschriftungen (auch für Spiele mit eigener Controller-Steuerung): data-pad-labels="a=Springen; b=Zurück; dpad=Auswählen"
  (((me && me.getAttribute('data-pad-labels')) || '')).split(';').forEach(function (t) {
    var i = t.indexOf('='); if (i < 0) return;
    var k = t.slice(0, i).trim().toLowerCase(), v = t.slice(i + 1).trim(); if (k && v) LABEL[k] = v;
  });
  // data-pad="info": keine Tasten-/Knopf-Nachahmung (das Spiel steuert selbst), nur Controller-Modus, Belegung und Knopf-Symbole
  if (/(^|\s)info(\s|$)/.test((me && me.getAttribute('data-pad')) || '')) opt.info = true;

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
  // Touch wie am Handy: touchstart/-move/-end gehen immer an das Element, auf dem der Finger aufgesetzt hat. Verhindert das Spiel
  // touchstart/touchend (preventDefault), entfallen wie im Browser die nachgeahmten Maus-Ereignisse und der Klick.
  var HAS_TOUCH = typeof root.Touch === 'function' && typeof root.TouchEvent === 'function', touchEl = null, touchEat = false;
  function touch(type, t, x, y) {
    if (!HAS_TOUCH || !t) return false;
    try {
      var tp = new root.Touch({ identifier: 1, target: t, clientX: x, clientY: y, screenX: x, screenY: y, pageX: x + (root.pageXOffset || 0), pageY: y + (root.pageYOffset || 0), radiusX: 8, radiusY: 8, force: 1 });
      var on = type === 'end' ? [] : [tp];
      var ev = new root.TouchEvent('touch' + type, { bubbles: true, cancelable: true, composed: true, touches: on, targetTouches: on, changedTouches: [tp], view: root });
      t.dispatchEvent(ev);
      return ev.defaultPrevented;
    } catch (e) { return false; }
  }
  function pointer(type, x, y) {
    var t = doc.elementFromPoint(x, y); if (!t) return null;
    var down = type === 'down', up = type === 'up', base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: down || (mouseDown && !up) ? 1 : 0, view: root };
    try { if (root.PointerEvent) t.dispatchEvent(new PointerEvent('pointer' + type, mix(base, { pointerId: 1, pointerType: 'mouse', isPrimary: true }))); } catch (e) {}
    var eat = false;
    if (down) { touchEl = t; touchEat = touch('start', t, x, y); eat = touchEat; }
    else if (up) { if (touchEl) { eat = touch('end', touchEl, x, y) || touchEat; touchEl = null; } }
    else if (touchEl && mouseDown) touch('move', touchEl, x, y);
    if (!eat) try { t.dispatchEvent(new MouseEvent('mouse' + type, base)); } catch (e) {}
    pointer.ate = eat;
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
    mouseDown = true; pointer('down', c.x, c.y); pointer('up', c.x, c.y); mouseDown = false; if (!pointer.ate) click(c.e, c.x, c.y);
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
    if (!padOn && (s.b.length || s.d.join('') !== '0000' || s.ls.join('') !== '0000' || Math.abs(s.rs[0]) > 0.4 || Math.abs(s.rs[1]) > 0.4)) setPad(true);
    if (padOn && now > badgeT) { badgeT = now + 400; drawBadges(); }
    if (s.b[8] && s.b[9] && !(p.b[8] && p.b[9])) { legend(legendEl && legendEl.style.display === 'block' ? 0 : 8000); releaseAll(); return; }   // Select + Start: Belegung zeigen
    if (opt.info) return;   // Spiel mit eigener Controller-Steuerung: nichts nachahmen

    // Steuerkreuz: Pfeiltasten; wenn das Spiel sie nicht verarbeitet -> Knopf-Navigation (mit Wiederholung beim Halten)
    for (i = 0; i < 4; i++) {
      if (s.d[i] && !p.d[i]) {
        var used = send(DPAD[i], true);
        if (opt.nav && !used) { navigate(i); navRep[i] = now + 400; } else if (used) clearRing();
      } else if (!s.d[i] && p.d[i]) { send(DPAD[i], false); delete navRep[i]; }
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
        if (!code && BIND[name]) { pressEl(i, BIND[name], true); continue; }
        var alt = (code || '').split('/');
        alt2[i] = !send(alt[0], true) && alt[1] ? alt[1] : '';
        if (alt2[i]) send(alt2[i], true);
      } else if (!s.b[i] && p.b[i]) {
        if (i === 0 && aMode === 'mouse') { var up = pointer('up', cx, cy); mouseDown = false; if (up && downEl && !pointer.ate && (up === downEl || up.contains(downEl) || downEl.contains(up))) click(up, cx, cy); downEl = null; if (!STAY) cursorUntil = now + 4000; aMode = ''; continue; }
        if (i === 0 && aMode === 'nav') { aMode = ''; continue; }
        if (i === 0) aMode = '';
        if (bound[i]) { pressEl(i, '', false); continue; }
        send((code || '').split('/')[0], false);
        if (alt2[i]) { send(alt2[i], false); alt2[i] = ''; }
      }
    }
    if (focusEl) drawRing();
  }
  var BTN = [], alt2 = []; for (var n in NAMES) BTN[NAMES[n]] = n;

  // ---------- Controller-Modus: Klasse eg-pad am <html>, Ereignis easygames:pad, Knopf-Symbole und Belegung ----------
  // Spiele können damit ihre Touch-Oberfläche gegen Controller-Hinweise tauschen (html.eg-pad … bzw. addEventListener('easygames:pad')).
  var padOn = false, badgeT = 0, badges = {}, legendEl = null, legendShown = false, legendTimer = 0, bound = {};
  var GLYPH = { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT', select: '⧉', start: '☰', l3: 'L3', r3: 'R3', up: '↑', down: '↓', left: '←', right: '→', dpad: '✚', ls: 'L-Stick', rs: 'R-Stick' };
  var GCOL = { a: '#16a34a', b: '#dc2626', x: '#2563eb', y: '#d97706' };
  function setPad(on) {
    if (on === padOn) return;
    padOn = on;
    try { doc.documentElement.classList.toggle('eg-pad', on); } catch (e) {}
    try { root.dispatchEvent(new CustomEvent('easygames:pad', { detail: { on: on } })); } catch (e) {}
    drawBadges();
    if (on && !legendShown && Object.keys(LABEL).length) { legendShown = true; legend(7000); }
    if (!on) legend(0);
  }
  function legendList() {
    var out = [], k;
    ['ls', 'rs', 'dpad', 'up', 'down', 'left', 'right'].concat(BTN).forEach(function (k) { if (LABEL[k]) out.push([GLYPH[k] || k, LABEL[k], k]); });
    return out;
  }
  function legend(ms) {
    clearTimeout(legendTimer);
    if (!ms) { show(legendEl, false); return; }
    var l = legendList(); if (!l.length) return;
    if (!legendEl) legendEl = el('left:50%;top:auto;bottom:16px;transform:translateX(-50%);max-width:92vw;padding:10px 14px;border-radius:14px;background:rgba(8,10,20,.9);color:#fff;font:600 13px/1.55 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5);text-align:left;columns:2 220px;column-gap:20px');
    legendEl.innerHTML = '<div style="column-span:all;font-size:11px;letter-spacing:.06em;color:#7ff3ff;margin-bottom:4px">🎮 CONTROLLER · Select + Start blendet ein/aus</div>' +
      l.map(function (x) { return '<div style="break-inside:avoid;white-space:nowrap"><b style="display:inline-block;min-width:26px;padding:0 5px;margin-right:6px;border-radius:7px;text-align:center;background:' + (GCOL[x[2]] || '#334155') + '">' + x[0] + '</b>' + x[1].replace(/</g, '&lt;') + '</div>'; }).join('');
    show(legendEl, true);
    legendTimer = root.setTimeout(function () { show(legendEl, false); }, ms);
  }
  function drawBadges() {
    for (var k in BIND) {
      var e = null; try { e = doc.querySelector(BIND[k]); } catch (x) {}
      var b = badges[k], c = padOn && e && usable(e);
      if (!c) { show(b, false); continue; }
      if (!b) { b = badges[k] = el('min-width:20px;height:20px;padding:0 4px;margin:-6px 0 0 -14px;border-radius:10px;border:2px solid #fff;color:#fff;font:800 11px/16px system-ui,sans-serif;text-align:center;box-sizing:border-box;box-shadow:0 2px 6px rgba(0,0,0,.5);background:' + (GCOL[k] || '#334155')); b.textContent = GLYPH[k] || k; }
      b.style.transform = 'translate(' + Math.round(c.r.right) + 'px,' + Math.round(c.r.top) + 'px)'; show(b, true);
    }
  }
  // Controller-Knopf drückt einen Bildschirm-Knopf (Halten = gedrückt halten, wie mit dem Finger)
  function pressEl(i, sel, down) {
    if (down) {
      var e = null; try { e = doc.querySelector(sel); } catch (x) {}
      var c = e && usable(e); if (!c) return;
      bound[i] = c; mouseDown = true; pointer('down', c.x, c.y);
    } else if (bound[i]) {
      var c2 = bound[i]; delete bound[i];
      var up = pointer('up', c2.x, c2.y); mouseDown = false;
      if (up && !pointer.ate) click(up, c2.x, c2.y);
    }
  }
  function start() {
    if (running || !pads().length) return;
    running = true; last = 0; prev = {}; root.requestAnimationFrame(frame);
  }
  function stop() { running = false; releaseAll(); clearRing(); show(cursor, false); mouseDown = false; prev = {}; setPad(false); }

  root.addEventListener('gamepadconnected', start);
  root.addEventListener('gamepaddisconnected', function () { if (!pads().length) stop(); });
  root.addEventListener('blur', releaseAll);
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) releaseAll(); });
  // echte Maus/Touch-Eingabe: Leuchtrahmen und Zeiger ausblenden
  root.addEventListener('pointerdown', function (e) { if (e.isTrusted) { clearRing(); cursorUntil = 0; show(cursor, false); setPad(false); } }, true);
  start();   // Controller, der schon vor dem Laden verbunden war

  root.EasyGamesPad = {
    version: 3, map: MAP, dpad: DPAD, labels: LABEL, binds: BIND, options: opt,
    enabled: function (on) { if (on === undefined) return enabled; enabled = !!on; if (!enabled) { releaseAll(); clearRing(); show(cursor, false); } return enabled; },
    // Leuchtrahmen auf einen bestimmten Knopf setzen (z. B. die erste Taste einer Bildschirmtastatur)
    focus: function (el) { if (!el) return; focusEl = el; if (running) drawRing(); },
    // Controller-Modus (wird gerade mit dem Controller gespielt?) und Belegung mit Beschriftungen: [[Symbol, Text, Name], …]
    active: function () { return padOn; },
    legend: legendList,
    showLegend: function (ms) { legend(ms === undefined ? 8000 : ms); }
  };
})(window);

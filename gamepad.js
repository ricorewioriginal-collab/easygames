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
 *   - Textfelder: Bildschirm-Tastatur öffnet sich von selbst, sobald ein Textfeld mit dem Controller gewählt wird (oder das Spiel
 *     eins öffnet): Steuerkreuz/Stick wählt, A tippt, B löscht (bei leerem Feld: zu), X Leerzeichen, Y groß, LB/RB Cursor,
 *     Select 123, Start fertig (Enter).
 *   - Spiele mit eigener Controller-Steuerung (info): Fenster in der Bildmitte, die das Spiel nicht selbst bedient (z. B. „Game Over“),
 *     steuert gamepad.js – Steuerkreuz/Stick wählt, A klickt, B „Zurück/Schließen“.
 *   - Menüs ohne Pfeiltasten-Steuerung: Das Steuerkreuz springt zwischen sichtbaren Knöpfen (Leuchtrahmen), A klickt.
 *     Das passiert nur, wenn das Spiel die Pfeiltaste selbst nicht verarbeitet (kein preventDefault, keine sofortige Änderung
 *     an der Seite); data-pad="nonav" schaltet es ab.
 *   - Rechter Stick = Mauszeiger; solange er sichtbar ist, klickt A (gedrückt halten = ziehen). rs=stay: Zeiger bleibt sichtbar
 *     (für Spiele, die man fast nur per Klick spielt), rs=qe: rechter Stick = Q/E statt Zeiger, rs=scroll: scrollen, rs=none: aus.
 *     Auf Seiten mit längerem Inhalt und in scrollbaren Menüs/Listen (Leuchtrahmen aktiv) scrollt der rechte Stick von selbst;
 *     in Fenstern von Spielen mit eigener Steuerung (info) ebenso.
 *   - Rechter Stick / A tippen auch für Touch-Spiele: neben Zeiger- und Maus-Ereignissen kommen echte Touch-Ereignisse (wie am Handy).
 *   - Einheitlich für alle Spiele: Beschriftung und Bildschirm-Knöpfe je Eintrag – name=Taste[/Ersatz][:Text][@Selektor],
 *     z. B. data-pad="a=KeyJ/Enter:Angriff@#bAtk b=Space:Ausweichen x=:Springen@#jump up=ArrowUp:Befehl right=Enter:Ausführen".
 *     :Text erscheint in der Controller-Belegung (beim ersten Controller-Einsatz und mit Select + Start), @Selektor zeigt das
 *     Knopf-Symbol (A/B/X/Y …) auf dem Bildschirm-Knopf; Select + Start öffnet „Controller-Belegung“ (je Spiel umbelegbar, wirkt auch
 *     in Spielen mit eigener Steuerung, gespeichert unter easygames-remap:<Ordner>); ohne Taste drückt der Controller-Knopf ihn (für Touch-Knöpfe).
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
    // Umbelegung je Spiel (Fenster „Controller-Belegung“, Select + Start): { logischer Knopf: echter Knopf }, gespeichert pro Spiel-Ordner.
    // Wirkt hier in der Normalisierung, also in allen Spielen – auch in solchen mit eigener Controller-Steuerung.
    var RKEY = 'easygames-remap:' + String(root.location && root.location.pathname || '').replace(/[^\/]*$/, ''), remap = {}, hold = false;
    try { remap = JSON.parse(root.localStorage.getItem(RKEY) || '{}') || {}; } catch (e) { remap = {}; }
    function remapped(g) {
      var b = g.buttons.slice(), k, any = false;
      for (k in remap) { var p = g.buttons[remap[k]]; if (p) { b[+k] = p; any = true; } }
      return any ? { id: g.id, index: g.index, connected: g.connected, timestamp: g.timestamp, mapping: 'standard', buttons: b, axes: g.axes, vibrationActuator: g.vibrationActuator, hapticActuators: g.hapticActuators, raw: g.raw } : g;
    }
    function stdList() { var l, o = []; try { l = rawGet() || []; } catch (e) { l = []; } for (var i = 0; i < l.length; i++) o[i] = l[i] ? std(l[i]) : null; return o; }
    function flip(g) { var b = g.buttons.slice(), t; t = b[12]; b[12] = b[13]; b[13] = t; t = b[14]; b[14] = b[15]; b[15] = t;
      return { id: g.id, index: g.index, connected: g.connected, timestamp: g.timestamp, mapping: 'standard', buttons: b, axes: g.axes.map(function (v) { return -v; }), vibrationActuator: g.vibrationActuator }; }
    function fire(type) { try { var ev = new Event(type); Object.defineProperty(ev, 'gamepad', { value: virt }); root.dispatchEvent(ev); } catch (e) { } }
    function list() {
      var o = stdList(), i;
      for (i = 0; i < o.length; i++) if (o[i]) o[i] = remapped(o[i]);
      if (virt) { if (o[virt.index]) virt.index = Math.max(4, o.length); while (o.length < virt.index) o.push(null); o[virt.index] = virt; }
      if (troll.invert) for (i = 0; i < o.length; i++) if (o[i] && o[i] !== virt) o[i] = flip(o[i]);   // TikTok-Streich: Steuerung des Spielers vertauscht
      if (troll.block || hold) for (i = 0; i < o.length; i++) if (o[i] && o[i] !== virt) o[i] = { id: o[i].id, index: o[i].index, connected: true, timestamp: o[i].timestamp, mapping: 'standard',   // Steuerung weg
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
      /** Umbelegung dieses Spiels: remap() liest, remap(obj) speichert ({} = Standard); physical() = Pads ohne Umbelegung/Sperre; hold(on) sperrt das Spiel. */
      remap: function (m) { if (m === undefined) return remap; remap = m || {}; try { if (Object.keys(remap).length) root.localStorage.setItem(RKEY, JSON.stringify(remap)); else root.localStorage.removeItem(RKEY); } catch (e) { } return remap; },
      physical: stdList,
      hold: function (on) { hold = !!on; },
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
    var hm = /^hud=(select|l3|r3|off)$/.exec(t); if (hm) { opt.hud = hm[1]; return; }
    if (t === 'dlg=off') { opt.dlg = false; return; }   // Spiel führt selbst durch alle seine Fenster: keine Fenster-Hilfe   // Taste zum Halten für die Bildschirm-Knöpfe (info-Spiele), Standard Select
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
  function pointer(type, x, y, noTouch) {
    var t = doc.elementFromPoint(x, y); if (!t) return null;
    var down = type === 'down', up = type === 'up', base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons: down || (mouseDown && !up) ? 1 : 0, view: root };
    try { if (root.PointerEvent) t.dispatchEvent(new PointerEvent('pointer' + type, mix(base, { pointerId: 1, pointerType: 'mouse', isPrimary: true }))); } catch (e) {}
    var eat = false;
    if (noTouch) { touchEl = null; }   // Knopf mit dem Leuchtrahmen: wie ein Mausklick, kein Finger (sonst schalten Spiele auf Touch-Bedienung um)
    else if (down) { touchEl = t; touchEat = touch('start', t, x, y); eat = touchEat; }
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
  var scopeEl = null;   // Fenster, auf das die Knopf-Navigation gerade beschränkt ist (Dialog-Hilfe)
  function candidates() {
    var base = scopeEl && scopeEl.isConnected ? scopeEl : doc;
    var out = [], seen = [], all = base.querySelectorAll(SEL), i, c;
    for (i = 0; i < all.length; i++) if ((c = usable(all[i]))) { out.push(c); seen.push(all[i]); }
    // Elemente, die nur per Klick-Handler reagieren, erkennt man am Hand-Zeiger (nur das äußerste zählt)
    var any = base === doc ? (doc.body ? doc.body.getElementsByTagName('*') : []) : base.getElementsByTagName('*');
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
  // Nichts mehr in dieser Richtung sichtbar: Fenster/Seite ein Stück weiterscrollen (Knöpfe unterhalb des sichtbaren Bereichs, z. B. Spielstand-Bereich)
  function scrollOn(dir) {
    if (dir > 1) return false;
    var e = focusEl, sc = null;
    for (; e && e !== doc.body && e !== doc.documentElement; e = e.parentElement) {
      var cs = root.getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4) { sc = e; break; }
    }
    if (!sc && scopeEl) { for (e = scopeEl; e && e !== doc.body; e = e.parentElement) { var c2 = root.getComputedStyle(e); if (/(auto|scroll)/.test(c2.overflowY) && e.scrollHeight > e.clientHeight + 4) { sc = e; break; } } }
    sc = sc || doc.scrollingElement || doc.documentElement;
    var before = sc.scrollTop, h = sc === doc.scrollingElement || sc === doc.documentElement ? root.innerHeight : sc.clientHeight;
    sc.scrollTop += (dir === 0 ? -1 : 1) * Math.max(80, h * 0.6);
    return sc.scrollTop !== before;
  }
  // Rechter Stick scrollt: nächster scrollbare Bereich am Leuchtrahmen bzw. in der Bildmitte, sonst die Seite
  function scrollBox(from) {
    for (var e = from; e && e !== doc.body && e !== doc.documentElement; e = e.parentElement) {
      var cs = root.getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (e.scrollHeight > e.clientHeight + 4 || e.scrollWidth > e.clientWidth + 4)) return e;
    }
    return doc.scrollingElement || doc.documentElement;
  }
  function pageScrolls() { var se = doc.scrollingElement || doc.documentElement; return se.scrollHeight > root.innerHeight + 40; }
  function stickScroll(rx, ry, dt) {
    var m = Math.sqrt(rx * rx + ry * ry); if (m < 0.2) return false;
    var f = 1500 * Math.pow(Math.min(1, (m - 0.2) / 0.8), 1.6) * dt / m;
    var at = focusEl || (scopeEl && scopeEl.isConnected ? scopeEl : doc.elementFromPoint(root.innerWidth / 2, root.innerHeight / 2)), el = scrollBox(at), t0 = el.scrollTop, l0 = el.scrollLeft;
    el.scrollTop += ry * f; el.scrollLeft += rx * f;
    if (el.scrollTop === t0 && el.scrollLeft === l0 && at) {   // nichts zu scrollen: Mausrad nachahmen (Spiele mit eigenem Scrollen, z. B. Listen im Canvas)
      var r = at.getBoundingClientRect ? at.getBoundingClientRect() : { left: 0, top: 0, width: root.innerWidth, height: root.innerHeight };
      try { at.dispatchEvent(new WheelEvent('wheel', { deltaX: rx * f, deltaY: ry * f, deltaMode: 0, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, cancelable: true })); } catch (x) { }
    }
    if (focusEl) root.setTimeout(drawRing, 0);
    return true;
  }
  function navigate(dir) {
    var c = pick(dir); if (!c && focusEl && scrollOn(dir)) c = pick(dir);
    if (!c) return;
    focusEl = c.e; drawRing(); cursorUntil = 0; show(cursor, false);
    try { if (c.e.scrollIntoView) c.e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
  }
  function activate() {
    var c = focusEl && usable(focusEl); if (!c) { clearRing(); return false; }
    if (oskField(c.e)) { try { c.e.focus(); } catch (x) {} oskOpen(c.e); return true; }
    if (c.e.tagName === 'SELECT' && c.e.options.length) {   // Auswahlliste lässt sich nicht per Skript aufklappen: A nimmt den nächsten Eintrag
      c.e.selectedIndex = (c.e.selectedIndex + 1) % c.e.options.length;
      c.e.dispatchEvent(new Event('input', { bubbles: true })); c.e.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    mouseDown = true; pointer('down', c.x, c.y, true); pointer('up', c.x, c.y, true); mouseDown = false; if (!pointer.ate) click(c.e, c.x, c.y);
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
    if (osk) { oskTick(now); return; }
    if (menu) { menuTick(now); return; }
    var s = state(list), p = prev, i;
    prev = s;
    if (!p.b) return;   // erster Durchlauf: nur Zustand merken, damit ein schon gedrückter Knopf nichts auslöst
    if (!padOn && (s.b.length || s.d.join('') !== '0000' || s.ls.join('') !== '0000' || Math.abs(s.rs[0]) > 0.4 || Math.abs(s.rs[1]) > 0.4)) setPad(true);
    if (padOn && now > badgeT) { badgeT = now + 400; drawBadges(); }
    if (s.b[8] && s.b[9] && !(p.b[8] && p.b[9])) { releaseAll(); menuOpen(); return; }   // Select + Start: Belegung ansehen und ändern
    if (now > oskScanT) { oskScanT = now + 300; if (oskScan()) return; }   // neu erschienenes Textfeld (Name, Code …) → Tastatur
    if (opt.info && !dlg && opt.hud !== 'off') {   // Select (bzw. hud=l3/r3) gedrückt halten: Knöpfe auf dem Bildschirm (Tasche, Menü, Karte …) mit dem Controller wählen
      var HB = { select: 8, l3: 10, r3: 11 }[opt.hud || 'select'];
      if (s.b[HB] && !p.b[HB]) selT = now;
      if (!s.b[HB] || s.b[9]) selT = 0;
      else if (selT && now - selT > 500) { selT = 0; hudMode(); return; }
    }
    if (opt.info && opt.dlg !== false && now > dlgT) { dlgT = now + 250; dlgCheck(); }   // Fenster des Spiels (z. B. „Game Over“), das die eigene Controller-Steuerung nicht kennt
    if (dlg) { dlgTick(now); return; }
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
    // Seiten mit längerem Inhalt und Menüs/Listen im Spiel (Leuchtrahmen aktiv): rechter Stick scrollt, sonst ist er der Mauszeiger
    if (opt.rs === 'scroll' || (opt.rs === 'cursor' && !STAY && !cursorOn(now) && (pageScrolls() || (focusEl && scrollBox(focusEl) !== (doc.scrollingElement || doc.documentElement))))) stickScroll(rx, ry, dt);
    else if (opt.rs === 'cursor' || STAY) {
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
  var NORM = root.EasyGamesPadNormal, REMAPPABLE = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11];
  function physOf(i) { var m = NORM && NORM.remap ? NORM.remap() : {}; return m[i] !== undefined ? +m[i] : i; }
  function legendList() {
    var out = [];
    ['ls', 'rs', 'dpad', 'up', 'down', 'left', 'right'].concat(BTN).forEach(function (k) {
      if (!LABEL[k]) return;
      var g = k in NAMES ? BTN[physOf(NAMES[k])] : k;   // nach Umbelegung: Symbol des echten Knopfs
      out.push([GLYPH[g] || g, LABEL[k], g]);
    });
    return out;
  }
  // ---------- Fenster „Controller-Belegung“: ansehen und je Spiel umbelegen ----------
  var menu = null;
  function physState() { var b = [], l = NORM && NORM.physical ? NORM.physical() : pads(); l.forEach(function (g) { if (!g) return; for (var i = 0; i < 17; i++) if (g.buttons[i] && g.buttons[i].pressed) b[i] = 1; var ay = g.axes[1] || 0; if (ay < -0.6) b[12] = 1; if (ay > 0.6) b[13] = 1; }); return b; }
  function menuRows() {
    var rows = [];
    REMAPPABLE.forEach(function (i) { var k = BTN[i]; if (LABEL[k]) rows.push({ i: i, k: k }); });
    rows.push({ act: 'reset' }, { act: 'close' });
    return rows;
  }
  function menuOpen() {
    legendBox(); clearTimeout(legendTimer);
    if (NORM && NORM.hold) NORM.hold(true);
    menu = { sel: 0, wait: -1, prev: physState(), rep: 0 }; drawMenu();
  }
  function menuClose() { menu = null; if (NORM && NORM.hold && !dlg) NORM.hold(false); show(legendEl, false); prev = {}; drawBadges(); }
  function assign(L, P) {
    var m = {}, k, cur = NORM.remap(); for (k in cur) m[k] = +cur[k];
    var oldP = physOf(L), L2 = -1;
    REMAPPABLE.forEach(function (i) { if (physOf(i) === P) L2 = i; });
    m[L] = P; if (L2 >= 0 && L2 !== L) m[L2] = oldP;
    for (k in m) if (+k === m[k]) delete m[k];
    NORM.remap(m);
  }
  function drawMenu() {
    var rows = menuRows(), h = '<div style="column-span:all;font-size:11px;letter-spacing:.06em;color:#7ff3ff;margin-bottom:6px">🎮 CONTROLLER-BELEGUNG · dieses Spiel</div>';
    h += rows.map(function (r, n) {
      var on = n === menu.sel, st = 'display:flex;gap:10px;align-items:center;justify-content:space-between;padding:4px 8px;border-radius:9px;' + (on ? 'background:#ffd400;color:#111' : '');
      if (r.act) return '<div style="' + st + '">' + (r.act === 'reset' ? '↺ Standard-Belegung' : '✕ Schließen') + '</div>';
      var g = BTN[physOf(r.i)], txt = menu.wait === r.i ? '<i>Neuen Knopf drücken …</i>' : '<b style="display:inline-block;min-width:26px;padding:0 5px;border-radius:7px;text-align:center;color:#fff;background:' + (GCOL[g] || '#334155') + '">' + (GLYPH[g] || g) + '</b>';
      return '<div style="' + st + '"><span>' + LABEL[r.k].replace(/</g, '&lt;') + '</span>' + txt + '</div>';
    }).join('');
    h += '<div style="margin-top:6px;font-size:11px;opacity:.7">✚ wählen · A ändern · B schließen</div>';
    legendEl.style.columns = 'auto'; legendEl.style.minWidth = '260px'; legendEl.innerHTML = h; show(legendEl, true);
  }
  function menuTick(now) {
    var b = physState(), pv = menu.prev, hit = function (i) { return b[i] && !pv[i]; }, rows = menuRows();
    menu.prev = b;
    if (menu.wait >= 0) {
      for (var i = 0; i < REMAPPABLE.length; i++) if (hit(REMAPPABLE[i])) { assign(menu.wait, REMAPPABLE[i]); menu.wait = -1; drawMenu(); return; }
      if (hit(8) || hit(9)) { menu.wait = -1; drawMenu(); }
      return;
    }
    if ((b[8] && b[9]) && !(pv[8] && pv[9])) { menuClose(); return; }
    var d = hit(12) ? -1 : hit(13) ? 1 : 0;
    if (d) { menu.sel = (menu.sel + d + rows.length) % rows.length; drawMenu(); return; }
    if (hit(1)) { menuClose(); return; }
    if (hit(0)) {
      var r = rows[menu.sel];
      if (r.act === 'close') menuClose();
      else if (r.act === 'reset') { NORM.remap({}); drawMenu(); }
      else { menu.wait = r.i; drawMenu(); }
    }
  }
  // ---------- Bildschirm-Tastatur für Textfelder (erst bei Bedarf angelegt) ----------
  var osk = null, oskEl = null, oskScanT = 0, oskVis = null;
  var OSK_ROWS = { abc: ['1234567890ß', 'qwertzuiopü', 'asdfghjklöä', '⇧yxcvbnm-.⌫'], sym: ['1234567890ß', '!?@#&()":;\'', '+-*/=%€$_,.', '⇧<>[]{}~^|⌫'] };
  function oskField(e) {
    if (!e || e.disabled || e.readOnly) return false;
    if (e.isContentEditable) return true;
    return e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && /^(text|search|email|url|tel|password|number|)$/.test(e.type || ''));
  }
  function oskKeys() {
    var rows = OSK_ROWS[osk.mode].map(function (r) { var x = 0; return r.split('').map(function (ch) { var k = { x: x++, w: 1, k: ch === '⇧' ? 'shift' : ch === '⌫' ? 'bs' : 'ch', t: ch }; return k; }); });
    rows.push([{ x: 0, w: 2, k: 'mode', t: osk.mode === 'abc' ? '&123' : 'abc' }, { x: 2, w: 5, k: 'space', t: 'Leerzeichen' }, { x: 7, w: 1, k: 'left', t: '◀' }, { x: 8, w: 1, k: 'right', t: '▶' }, { x: 9, w: 2, k: 'ok', t: '✓ Fertig' }]);
    return rows;
  }
  function oskEsc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function oskSel(e) { var s = null, t = null; try { s = e.selectionStart; t = e.selectionEnd; } catch (x) { } if (s == null) s = t = e.value.length; return [s, t]; }
  function oskSet(e, v, pos, type, data) {
    var proto = e.tagName === 'TEXTAREA' ? root.HTMLTextAreaElement.prototype : root.HTMLInputElement.prototype, d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(e, v); else e.value = v;   // auch für Seiten, die den Wert selbst verwalten
    try { e.setSelectionRange(pos, pos); } catch (x) { }
    var ev; try { ev = new root.InputEvent('input', { bubbles: true, inputType: type, data: data }); } catch (x) { ev = new Event('input', { bubbles: true }); }
    e.dispatchEvent(ev);
  }
  function oskInput(type, ch) {
    var e = osk.el;
    if (e.isContentEditable) { try { doc.execCommand(type === 'bs' ? 'delete' : 'insertText', false, ch); } catch (x) { } return; }
    var v = e.value, st = oskSel(e), a = st[0], b = st[1];
    if (type === 'bs') { if (a === b) { if (!a) return; a--; } oskSet(e, v.slice(0, a) + v.slice(b), a, 'deleteContentBackward', null); return; }
    if (type === 'move') { var n = Math.max(0, Math.min(v.length, (ch < 0 ? a : b) + ch)); try { e.setSelectionRange(n, n); } catch (x) { } return; }
    if (e.type === 'number' && !/[0-9.,\-]/.test(ch)) return;
    if (e.maxLength > 0 && v.length - (b - a) + ch.length > e.maxLength) return;
    oskSet(e, v.slice(0, a) + ch + v.slice(b), a + ch.length, 'insertText', ch);
  }
  function oskPress(k) {
    if (k.k === 'ch') { oskInput('ch', osk.shift ? k.t.toUpperCase() : k.t); if (osk.shift === 1) osk.shift = 0; }
    else if (k.k === 'bs') oskInput('bs');
    else if (k.k === 'space') oskInput('ch', ' ');
    else if (k.k === 'left' || k.k === 'right') oskInput('move', k.k === 'left' ? -1 : 1);
    else if (k.k === 'shift') osk.shift = osk.shift ? 0 : 1;
    else if (k.k === 'mode') { osk.mode = osk.mode === 'abc' ? 'sym' : 'abc'; }
    else if (k.k === 'ok') { oskDone(); return; }
    oskDraw();
  }
  function oskDone() {   // wie Enter auf einer echten Tastatur: Spiel bekommt Enter, dann change; danach Fokus weg, damit das Steuerkreuz wieder das Spiel steuert
    var e = osk.el; oskClose();
    var handled = send('Enter', true); send('Enter', false);
    try { e.dispatchEvent(new Event('change', { bubbles: true })); } catch (x) { }
    if (!handled && e.form && e.form.requestSubmit && e.isConnected) { try { e.form.requestSubmit(); } catch (x) { } }
    if (doc.activeElement === e) { try { e.blur(); } catch (x) { } }
  }
  function oskOpen(e) {
    if (osk && osk.el === e) return;
    if (!oskEl) {
      oskEl = el('left:50%;top:auto;bottom:10px;transform:translateX(-50%);width:min(780px,96vw);box-sizing:border-box;padding:10px;border-radius:16px;background:rgba(8,10,20,.96);color:#fff;font:600 16px/1 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.6);pointer-events:auto');
      oskEl.addEventListener('pointerdown', function (ev) {   // auch mit Maus/Finger bedienbar, ohne dass das Textfeld den Fokus verliert
        ev.preventDefault(); ev.stopPropagation(); var t = ev.target.closest && ev.target.closest('[data-r]'); if (!t || !osk) return;
        osk.r = +t.getAttribute('data-r'); osk.i = +t.getAttribute('data-i'); oskPress(oskKeys()[osk.r][osk.i]);
      });
    }
    releaseAll(); clearRing();
    osk = { el: e, r: 1, i: 0, mode: e.type === 'number' || e.type === 'tel' ? 'sym' : 'abc', shift: 0, prev: oskState(), dir: '', next: 0 };
    if (NORM && NORM.hold) NORM.hold(true);
    if (!e.isContentEditable) { try { var L = e.value.length; e.setSelectionRange(L, L); } catch (x) { } }   // Cursor ans Ende (vorgegebener Text)
    oskDraw(); show(oskEl, true);
  }
  function oskClose() { if (!osk) return; osk = null; oskVis = null; show(oskEl, false); if (NORM && NORM.hold && !menu && !dlg) NORM.hold(false); prev = {}; }
  function oskState() {
    var b = [], ax = 0, ay = 0, l = NORM && NORM.physical ? NORM.physical().concat(pads()) : pads();   // echte Pads (auch während das Spiel gesperrt ist) und der virtuelle
    l.forEach(function (g) {
      if (!g) return; for (var i = 0; i < 16; i++) if (g.buttons[i] && g.buttons[i].pressed) b[i] = 1;
      if (Math.abs(g.axes[0] || 0) > Math.abs(ax)) ax = g.axes[0] || 0; if (Math.abs(g.axes[1] || 0) > Math.abs(ay)) ay = g.axes[1] || 0;
    });
    b.dir = b[12] || ay < -0.5 ? 'u' : b[13] || ay > 0.5 ? 'd' : b[14] || ax < -0.5 ? 'l' : b[15] || ax > 0.5 ? 'r' : '';
    return b;
  }
  function oskMove(d) {
    var rows = oskKeys(), k = rows[osk.r][osk.i];
    if (d === 'l' || d === 'r') { osk.i = (osk.i + (d === 'l' ? -1 : 1) + rows[osk.r].length) % rows[osk.r].length; return; }
    var c = k.x + k.w / 2; osk.r = (osk.r + (d === 'u' ? -1 : 1) + rows.length) % rows.length;
    var best = 0, bd = 99; rows[osk.r].forEach(function (q, n) { var dd = Math.abs(q.x + q.w / 2 - c); if (dd < bd) { bd = dd; best = n; } }); osk.i = best;
  }
  function oskTick(now) {
    var e = osk.el;
    if (!e.isConnected || !e.getClientRects().length || e.disabled) { oskClose(); return; }   // Feld weg (Fenster geschlossen)
    var b = oskState(), pv = osk.prev, hit = function (i) { return b[i] && !pv[i]; }, rows = oskKeys(); osk.prev = b;
    if (b.dir !== pv.dir) { osk.next = now + 260; if (b.dir) { oskMove(b.dir); oskDraw(); } }
    else if (b.dir && now > osk.next) { osk.next = now + 90; oskMove(b.dir); oskDraw(); }
    if (hit(0)) oskPress(rows[osk.r][Math.min(osk.i, rows[osk.r].length - 1)]);
    else if (hit(1)) { if (!(e.isContentEditable ? e.textContent : e.value)) { oskClose(); try { e.blur(); } catch (x) { } return; } oskInput('bs'); oskDraw(); osk.bs = now + 450; }   // B bei leerem Feld: abbrechen
    else if (b[1] && pv[1] && now > osk.bs) { osk.bs = now + 60; oskInput('bs'); oskDraw(); }   // B halten: schnell löschen
    else if (hit(2)) { oskInput('ch', ' '); oskDraw(); }
    else if (hit(3)) { osk.shift = osk.shift ? 0 : 1; oskDraw(); }
    else if (hit(4) || hit(5)) { oskInput('move', hit(4) ? -1 : 1); oskDraw(); }
    else if (hit(8)) { osk.mode = osk.mode === 'abc' ? 'sym' : 'abc'; oskDraw(); }
    else if (hit(9)) oskDone();
  }
  function oskDraw() {
    if (!osk) return;
    var e = osk.el, rows = oskKeys(), v = e.isContentEditable ? e.textContent : e.value, st = e.isContentEditable ? [v.length] : oskSel(e);
    if (e.type === 'password') v = v.replace(/./g, '•');
    osk.i = Math.min(osk.i, rows[osk.r].length - 1);
    var ph = !v && e.placeholder ? '<span style="opacity:.45">' + oskEsc(e.placeholder) + '</span>' : '';
    var h = '<div style="padding:9px 11px;margin-bottom:8px;border-radius:10px;background:#1b2033;font:500 17px/1.35 system-ui,sans-serif;white-space:pre-wrap;word-break:break-all;min-height:23px">'
      + oskEsc(v.slice(0, st[0])) + '<span style="display:inline-block;width:2px;height:1.1em;vertical-align:-2px;background:#ffd400"></span>' + oskEsc(v.slice(st[0])) + ph + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(11,1fr);gap:5px">';
    rows.forEach(function (r, ri) {
      r.forEach(function (k, ki) {
        var on = ri === osk.r && ki === osk.i, t = k.k === 'ch' && osk.shift ? k.t.toUpperCase() : k.t;
        if (k.k === 'shift' && osk.shift) t = '⬆';
        h += '<div data-r="' + ri + '" data-i="' + ki + '" style="grid-column:span ' + k.w + ';padding:11px 0;text-align:center;border-radius:8px;cursor:pointer;' + (on ? 'background:#ffd400;color:#111' : k.k === 'ch' ? 'background:#2a3048' : 'background:#3a4160') + '">' + oskEsc(t) + '</div>';
      });
    });
    oskEl.innerHTML = h + '</div><div style="margin-top:8px;font:600 11px/1.4 system-ui,sans-serif;color:#9aa3bd;text-align:center">A Taste · B löschen · X Leerzeichen · Y groß · LB/RB Cursor · Select &amp;123 · Start fertig</div>';
  }
  function oskScan() {   // Textfelder, die gerade sichtbar geworden sind (Spiel öffnet ein Eingabefenster)
    var now = [], all = doc.querySelectorAll('input,textarea,[contenteditable=""],[contenteditable=true]'), fresh = null, a = doc.activeElement, i;
    for (i = 0; i < all.length; i++) if (oskField(all[i]) && usable(all[i])) now.push(all[i]);
    if (oskVis) for (i = 0; i < now.length && !fresh; i++) if (oskVis.indexOf(now[i]) < 0) fresh = now[i];
    oskVis = now;
    if (!fresh || menu || (a && a !== doc.body && oskField(a))) return false;
    try { fresh.focus({ preventScroll: true }); } catch (x) { } oskOpen(fresh); return true;
  }
  doc.addEventListener('focusin', function (ev) { if (padOn && enabled && running && !menu && oskField(ev.target)) oskOpen(ev.target); });
  root.addEventListener('pointerdown', function (ev) { if (osk && ev.isTrusted && oskEl && !oskEl.contains(ev.target)) oskClose(); }, true);   // Maus/Finger daneben: echte Tastatur übernimmt
  // ---------- Dialog-Hilfe (Spiele mit eigener Controller-Steuerung, data-pad="info") ----------
  // Liegt in der Bildmitte ein Fenster mit Knöpfen (kein Spielbild) und hat das Spiel den Fokus nicht selbst hineingesetzt, übernimmt
  // gamepad.js: Steuerkreuz/Stick wählt (Leuchtrahmen), A klickt, B nimmt „Zurück/Schließen/Menü“. Das Spiel sieht den Controller solange nicht.
  var dlg = null, dlgT = 0, BACK_RX = /zur(ü|ue)ck|schlie(ß|ss)en|abbrechen|weiter spielen|fortsetzen|nein|^\s*[✕×x]\s*$/i;
  function overlayAt() {
    var el = doc.elementFromPoint(root.innerWidth / 2, root.innerHeight / 2);
    if (!el || el === doc.body || el === doc.documentElement || el.tagName === 'CANVAS' || el.tagName === 'IFRAME' || el.tagName === 'VIDEO') return null;
    var box = null;
    for (var e = el; e && e !== doc.body && e !== doc.documentElement; e = e.parentElement) {
      var any = e.querySelectorAll(SEL), ok = 0;
      for (var i = 0; i < any.length && !ok; i++) if (usable(any[i])) ok = 1;
      if (ok) { box = e; break; }
    }
    if (!box) return null;
    var r = box.getBoundingClientRect(); if (r.width * r.height > 0.92 * root.innerWidth * root.innerHeight) return null;   // ganzer Bildschirm = Spiel-Oberfläche (HUD), kein Fenster
    var a = doc.activeElement; if (a && a !== doc.body && box.contains(a)) return null;   // das Spiel führt selbst durch sein Fenster
    if (box.querySelector('[class*="focus" i]:not(button:focus)') && !box.querySelector(':focus')) { var fx = box.querySelector('[class*="focus" i]'); if (fx && fx.getClientRects().length) return null; }   // eigene Markierung des Spiels (z. B. .gp-focus) – nicht doppelt steuern
    return box;
  }
  function dlgCheck() {
    if (dlg && dlg.manual) return;
    var b = overlayAt();
    if (b === (dlg && dlg.el)) return;
    if (dlg && !b) { dlg = null; scopeEl = null; clearRing(); if (NORM && NORM.hold && !menu && !osk) NORM.hold(false); prev = {}; return; }
    releaseAll(); scopeEl = b;
    dlg = { el: b, prev: oskState(), next: 0 };
    if (NORM && NORM.hold) NORM.hold(true);
    var c = pick(0); if (c) { focusEl = c.e; drawRing(); }   // gleich den ersten Knopf wählen: A klickt sofort
  }
  var selT = 0, hudTip = null;
  function hudEnd() { dlg = null; scopeEl = null; clearRing(); show(hudTip, false); if (NORM && NORM.hold && !menu && !osk) NORM.hold(false); prev = {}; dlgT = 0; }
  function hudMode() {
    releaseAll(); scopeEl = null;
    var c = pick(0); if (!c) return;
    dlg = { el: doc.body, manual: true, prev: oskState(), next: 0 };
    if (NORM && NORM.hold) NORM.hold(true);
    focusEl = c.e; drawRing();
    if (!hudTip) hudTip = el('left:50%;top:12px;transform:translateX(-50%);padding:7px 14px;border-radius:12px;background:rgba(8,10,20,.9);color:#fff;font:600 13px/1.4 system-ui,sans-serif');
    hudTip.textContent = '🎮 Knöpfe auf dem Bildschirm: ✚/Stick wählen · A drücken · B zurück ins Spiel'; show(hudTip, true);
  }
  function dlgTick(now) {
    var dt0 = Math.min(0.05, dlg.t ? (now - dlg.t) / 1000 : 0.016); dlg.t = now;
    try { var pl = NORM && NORM.physical ? NORM.physical() : pads(), sx = 0, sy = 0; pl.forEach(function (g) { if (!g) return; if (Math.abs(g.axes[2] || 0) > Math.abs(sx)) sx = g.axes[2] || 0; if (Math.abs(g.axes[3] || 0) > Math.abs(sy)) sy = g.axes[3] || 0; }); stickScroll(sx, sy, dt0); } catch (x) { }   // rechter Stick scrollt im Fenster
    if (dlg.manual) {
      var mb = oskState(), mp = dlg.prev, mh = function (i) { return mb[i] && !mp[i]; }; dlg.prev = mb;
      var MD = { u: 0, d: 1, l: 2, r: 3 };
      if (mb.dir !== mp.dir) { dlg.next = now + 320; if (mb.dir) navigate(MD[mb.dir]); }
      else if (mb.dir && now > dlg.next) { dlg.next = now + 150; navigate(MD[mb.dir]); }
      if (mh(0)) { if (focusEl && activate()) root.setTimeout(function () { if (dlg && dlg.manual && !(focusEl && usable(focusEl))) { var c = pick(0); if (c) { focusEl = c.e; drawRing(); } } }, 120); return; }   // drücken und weiter wählen (z. B. „Mehr“ öffnet weitere Knöpfe); B zurück ins Spiel
      if (mh(1)) hudEnd();
      return;
    }
    if (!dlg.el.isConnected || !dlg.el.getClientRects().length) { dlgCheck(); return; }
    var b = oskState(), pv = dlg.prev, hit = function (i) { return b[i] && !pv[i]; }; dlg.prev = b;
    var D = { u: 0, d: 1, l: 2, r: 3 };
    if (b.dir !== pv.dir) { dlg.next = now + 320; if (b.dir) navigate(D[b.dir]); }
    else if (b.dir && now > dlg.next) { dlg.next = now + 150; navigate(D[b.dir]); }
    if (hit(0) || hit(9)) { if (!(focusEl && activate())) { var c = pick(0); if (c) { focusEl = c.e; drawRing(); } } dlgT = 0; return; }
    if (hit(1)) {
      var list = candidates(), back = null;
      for (var i = 0; i < list.length && !back; i++) if (BACK_RX.test(list[i].e.textContent || list[i].e.getAttribute('aria-label') || '')) back = list[i];
      if (back) { focusEl = back.e; activate(); dlgT = 0; }
    }
  }
  function legendBox() { if (!legendEl) legendEl = el('left:50%;top:auto;bottom:16px;transform:translateX(-50%);max-width:92vw;padding:10px 14px;border-radius:14px;background:rgba(8,10,20,.9);color:#fff;font:600 13px/1.55 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5);text-align:left;columns:2 220px;column-gap:20px'); return legendEl; }
  function legend(ms) {
    clearTimeout(legendTimer);
    if (!ms) { show(legendEl, false); return; }
    var l = legendList(); if (!l.length) return;
    legendBox();
    legendEl.style.columns = '2 220px'; legendEl.style.minWidth = '';
    legendEl.innerHTML = '<div style="column-span:all;font-size:11px;letter-spacing:.06em;color:#7ff3ff;margin-bottom:4px">🎮 CONTROLLER · Select + Start: Belegung ändern' + (opt.info && opt.hud !== 'off' ? ' · ' + ({ l3: 'L3', r3: 'R3' }[opt.hud] || 'Select') + ' halten: Knöpfe auf dem Bildschirm' : '') + '</div>' +
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
      var gk = k in NAMES ? BTN[physOf(NAMES[k])] : k; b.textContent = GLYPH[gk] || gk; b.style.background = GCOL[gk] || '#334155';
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
  function stop() { if (osk) oskClose(); if (hudTip) show(hudTip, false); if (dlg) { dlg = null; scopeEl = null; if (NORM && NORM.hold && !menu) NORM.hold(false); } running = false; releaseAll(); clearRing(); show(cursor, false); mouseDown = false; prev = {}; setPad(false); }

  root.addEventListener('gamepadconnected', start);
  root.addEventListener('gamepaddisconnected', function () { if (!pads().length) stop(); });
  root.addEventListener('blur', releaseAll);
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) releaseAll(); });
  // echte Maus/Touch-Eingabe: Leuchtrahmen und Zeiger ausblenden
  root.addEventListener('pointerdown', function (e) { if (e.isTrusted) { clearRing(); cursorUntil = 0; show(cursor, false); setPad(false); } }, true);
  start();   // Controller, der schon vor dem Laden verbunden war
  root.setInterval(start, 1000);   // falls das Verbindungs-Ereignis fehlt (z. B. Fenster hatte beim Verbinden keinen Fokus, Bluetooth-Controller wacht auf)

  root.EasyGamesPad = {
    version: 3, map: MAP, dpad: DPAD, labels: LABEL, binds: BIND, options: opt,
    enabled: function (on) { if (on === undefined) return enabled; enabled = !!on; if (!enabled) { releaseAll(); clearRing(); show(cursor, false); } return enabled; },
    // Leuchtrahmen auf einen bestimmten Knopf setzen (z. B. die erste Taste einer Bildschirmtastatur)
    focus: function (el) { if (!el) return; focusEl = el; if (running) drawRing(); },
    // Controller-Modus (wird gerade mit dem Controller gespielt?) und Belegung mit Beschriftungen: [[Symbol, Text, Name], …]
    active: function () { return padOn; },
    legend: legendList,
    showLegend: function (ms) { legend(ms === undefined ? 8000 : ms); },
    openMenu: function () { menuOpen(); }
  };
})(window);

/* GayLife – Gamecontroller in der Stadt (PlayStation, Switch, Xbox und andere Pads über die Browser-Gamepad-API).
   In der freien Stadt steuert diese Datei selbst: linker Stick läuft analog, rechter Stick dreht und zoomt die Kamera,
   R2/ZR sprintet, ✕/B (Bestätigen) Aktion, ○/A (Zurück) Orte, □/Y Handy, △/X Menü, L1/R1 drehen, R3 Kamera hinter die Figur.
   Menüs (Startmenü, Pause, Orte, Handy, Look-Editor, Dialoge mit Auswahl) führt diese Datei ebenfalls: Steuerkreuz/Stick wählt (gelber Rahmen),
   Bestätigen klickt, Zurück geht eine Ebene zurück oder schließt, rechter Stick scrollt. Nur in den alten Minispielen (#hub/#game) und für die
   Bildschirm-Tastatur in Textfeldern übernimmt ../gamepad.js.
   Symbole passen sich dem Controller an (✕○□△ bei PlayStation, B/A/Y/X und ZR bei Switch, A/B/X/Y bei Xbox).
   Ohne angeschlossenen Controller läuft keine Schleife. */
(function () {
  'use strict';
  var P = GL.pad = { on: false, analog: false, world: false, kind: 'xbox' };
  if (!navigator.getGamepads) return;
  var raf = 0, prev = null, took = false, setJ = false, last = 0;
  var DZ = 0.2;
  function q(s) { return document.querySelector(s); }
  function vis(e) { return !!e && e.style.display !== 'none' && e.style.display !== ''; }

  function pads() { var l; try { l = navigator.getGamepads() || []; } catch (e) { l = []; } var o = []; for (var i = 0; i < l.length; i++) if (l[i] && l[i].connected !== false) o.push(l[i]); return o; }
  /* Zustand aller Pads zusammengefasst: Knöpfe 0–15 (Standard-Layout, Bestätigen ist schon richtig getauscht), Sticks, Trigger */
  function state() {
    var s = { b: [], lx: 0, ly: 0, rx: 0, ry: 0, rt: 0, any: false }, l = pads();
    l.forEach(function (g) {
      for (var i = 0; i < 16; i++) { var b = g.buttons[i]; if (b && (b.pressed || b.value > 0.5)) { s.b[i] = 1; s.any = true; } }
      var a = g.axes || [];
      if (Math.abs(a[0] || 0) > Math.abs(s.lx)) s.lx = a[0]; if (Math.abs(a[1] || 0) > Math.abs(s.ly)) s.ly = a[1];
      if (Math.abs(a[2] || 0) > Math.abs(s.rx)) s.rx = a[2]; if (Math.abs(a[3] || 0) > Math.abs(s.ry)) s.ry = a[3];
      var t = g.buttons[7]; if (t) s.rt = Math.max(s.rt, t.value || (t.pressed ? 1 : 0));
    });
    if (Math.hypot(s.lx, s.ly) > DZ || Math.hypot(s.rx, s.ry) > DZ) s.any = true;
    s.n = l.length; return s;
  }

  /* Freie Stadt: Welt sichtbar, kein Fenster offen. Ein Dialog mit nur „Weiter“ zählt mit (Bestätigen blättert weiter). */
  function overlay() {
    var m = q('#modal'), mp = q('#maps'), t = q('#title'), g = q('#game'), d = q('#dlg');
    if (m && m.style.display === 'block') return true;
    if (mp && mp.style.display === 'block') return true;
    if (GL.phone && GL.phone.isOpen()) return true;
    if (GL.ui && GL.ui.fading) return true;
    if (t && vis(t)) return true;
    if (g && g.style.display === 'block') return true;
    if (d && d.style.display !== 'none' && d.style.display && d.querySelectorAll('button').length > 1) return true;
    return false;
  }
  function inWorld() { var W = GL.W, w = q('#world'); return !!(W && W.on && w && w.style.display === 'block' && !overlay()); }
  P.inWorld = inWorld;

  function key(k, code) { try { document.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: code, bubbles: true, cancelable: true })); document.dispatchEvent(new KeyboardEvent('keyup', { key: k, code: code, bubbles: true })); } catch (e) { } }
  P.rumble = function (ms, st) {
    pads().forEach(function (g) { var v = g.vibrationActuator || (g.raw && g.raw.vibrationActuator); try { if (v && v.playEffect) v.playEffect('dual-rumble', { duration: ms || 60, strongMagnitude: st || 0.35, weakMagnitude: (st || 0.35) * 0.6 }); } catch (e) { } });
  };
  function gpApi() { return window.EasyGamesPad; }
  function handOver(mine) {
    var E = gpApi(); if (!E || !E.enabled) return;
    if (mine && E.enabled()) E.enabled(false);
    if (!mine && !E.enabled()) E.enabled(true);
  }

  /* ---------- Menüs ---------- */
  function shown(e) { if (!e) return false; var cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden'; }
  function root() {   // oberstes offenes Fenster
    var m = q('#modal'); if (m && m.style.display === 'block') return { k: 'modal', e: m };
    var t = q('#title'); if (t && vis(t) && !t.classList.contains('off')) return { k: 'title', e: t };
    var mp = q('#maps'); if (mp && mp.style.display === 'block') return { k: 'maps', e: mp };
    if (GL.phone && GL.phone.isOpen()) return { k: 'phone', e: q('#phone') };
    var d = q('#dlg'); if (d && vis(d) && d.style.display !== 'none' && d.querySelectorAll('button').length > 1) return { k: 'dlg', e: d };
    return null;
  }
  function minigame() { var h = q('#hub'), g = q('#game'), w = q('#world'); return !(w && w.style.display === 'block') && ((g && g.style.display === 'block') || (h && h.style.display !== 'none' && h.innerHTML !== '')); }
  var SEL = 'button,a[href],input,select,textarea,[data-app],[data-i],.pill,.sw,[role=button]';
  function items(r) {
    var out = []; [].forEach.call(r.querySelectorAll(SEL), function (e) {
      if (e.disabled || e.closest('[data-pad-skip]')) return;
      var b = e.getBoundingClientRect(); if (b.width < 6 || b.height < 6 || !shown(e)) return;
      if (out.some(function (o) { return o.contains(e); })) return;
      out.push(e);
    }); return out;
  }
  var cur = null, curSig = '';
  function sig(e) { return e.id || (e.dataset && (e.dataset.app || e.dataset.i || e.dataset.p || e.dataset.q)) || (e.textContent || '').trim().slice(0, 40); }
  function mark(e) {
    if (cur && cur !== e) cur.classList.remove('gfocus');
    cur = e; curSig = e ? sig(e) : '';
    if (e) { e.classList.add('gfocus'); try { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { } }
  }
  P.focused = function () { return cur; };
  function refind(list) {
    if (cur && cur.isConnected && list.indexOf(cur) >= 0) return cur;
    for (var i = 0; i < list.length; i++) if (curSig && sig(list[i]) === curSig) { mark(list[i]); return cur; }
    var f = null; list.some(function (e) { if (/\bpri\b|\bsel\b/.test(e.className) && e.id !== 'mx') { f = e; return true; } });
    if (!f) f = list.filter(function (e) { return !/^(mx|pclose|pback)$/.test(e.id); })[0] || list[0];
    mark(f || null); return cur;
  }
  function step(list, dir) {
    var c = refind(list); if (!c) return;
    var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, vx = [0, 0, -1, 1][dir], vy = [-1, 1, 0, 0][dir], best = null, bs = 1e9;
    list.forEach(function (e) {
      if (e === c) return; var b = e.getBoundingClientRect(), dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy, al = dx * vx + dy * vy, ac = Math.abs(dx * vy - dy * vx);
      if (al <= 2) return; var sc = al + ac * 2.5; if (sc < bs) { bs = sc; best = e; }
    });
    if (best) { mark(best); if (GL.core && GL.core.sfx) GL.core.sfx('tap'); }
  }
  function scroller(e) { for (; e && e !== document.body; e = e.parentElement) { var cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2) return e; } return null; }
  function back(r) {
    if (r.k === 'phone') { if (GL.phone.app() !== 'home') GL.phone.go('home'); else GL.phone.close(); return; }
    if (r.k === 'maps') { var x = q('#mx'); if (x) x.click(); else GL.ui.close(); return; }
    if (r.k === 'title') { key('Escape', 'Escape'); return; }
    var bb = null; [].forEach.call(r.e.querySelectorAll('button'), function (b) { if (!bb && /^\W*(fertig|zurück|schließen|abbrechen|ok)\W*$/i.test((b.textContent || '').trim())) bb = b; });
    if (bb) bb.click();
  }
  var osk = null;   // Textfeld, in dem gerade die Bildschirm-Tastatur von gamepad.js läuft
  function menuFrame(r, s, p, dt, now) {
    function hit(i) { return s.b[i] && !p.b[i]; }
    var d = [s.b[12] || s.ly < -0.55, s.b[13] || s.ly > 0.55, s.b[14] || s.lx < -0.55, s.b[15] || s.lx > 0.55];
    if (r.k === 'title') {   // Startmenü hat eigene Auswahl (Pfeiltasten, Enter, Esc)
      for (var j = 0; j < 2; j++) if (d[j] && (!p.d || !p.d[j] || now > rep)) { key(j ? 'ArrowDown' : 'ArrowUp', j ? 'ArrowDown' : 'ArrowUp'); rep = now + (p.d && p.d[j] ? 140 : 380); }
      s.d = d; if (cur) mark(null);
      if (hit(0)) key('Enter', 'Enter');
      if (hit(1)) key('Escape', 'Escape');
      return;
    }
    var list = items(r.e); if (!list.length) { s.d = d; return; }
    refind(list);
    for (var i = 0; i < 4; i++) if (d[i] && (!p.d || !p.d[i] || now > rep)) { step(list, i); rep = now + (p.d && p.d[i] ? 140 : 380); }
    s.d = d;
    if (hit(0) && cur) {
      if (/^(INPUT|TEXTAREA)$/.test(cur.tagName) && !/^(button|checkbox|radio|range|color)$/.test(cur.type)) { osk = cur; took = false; handOver(false); cur.focus(); }
      else cur.click();
      P.rumble(30, 0.2);
    }
    if (hit(1)) back(r);
    if (hit(9)) { if (r.k === 'phone') GL.phone.close(); else if (r.k === 'maps') GL.ui.close(); }
    if (hit(2) && r.k === 'phone') GL.phone.close();
    var ry = Math.abs(s.ry) > DZ ? s.ry : 0, sc = ry && scroller(cur || r.e);
    if (sc) sc.scrollTop += ry * dt * 900;
  }
  var rep = 0;

  function frame(ts) {
    raf = 0;
    var s = state();
    if (!s.n) { stop(); return; }
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016); last = ts;
    if (s.any && !P.on) { P.on = true; sync(); }
    var W = GL.W, world = inWorld(), r = world ? null : root();
    if (world !== P.world) { P.world = world; sync(); }
    if (osk) { if (document.activeElement === osk && osk.isConnected) { prev = s; return; } osk = null; prev = s; }   // Bildschirm-Tastatur offen
    var mine = world || !!r || !minigame();
    if (!mine) {
      clearMove(W); if (cur) mark(null);
      // Zurück an gamepad.js erst, wenn alles losgelassen ist – sonst würde ein noch gehaltener Knopf dort sofort klicken
      if (took) { if (!s.any) { took = false; handOver(false); } }
      prev = s; return;
    }
    if (!took) { took = true; handOver(true); prev = s; }   // gehaltene Knöpfe beim Wechsel lösen nichts aus
    var p = prev || { b: [] }; prev = s;
    if (!world) { clearMove(W); if (r) menuFrame(r, s, p, dt, ts); else if (cur) mark(null); return; }
    if (cur) mark(null);
    function hit(i) { return s.b[i] && !p.b[i]; }
    // Laufen: linker Stick analog (Totzone rund, danach weich), Steuerkreuz digital
    var lx = s.lx, ly = s.ly, lm = Math.hypot(lx, ly);
    if (lm > DZ) { var k = Math.min(1, (lm - DZ) / (1 - DZ)) / lm; lx *= k; ly *= k; } else { lx = ly = 0; }
    var dx = (s.b[15] ? 1 : 0) - (s.b[14] ? 1 : 0), dy = (s.b[13] ? 1 : 0) - (s.b[12] ? 1 : 0);
    if (dx || dy) { lx = dx; ly = dy; }
    if (lx || ly) { W.jx = lx; W.jz = -ly; setJ = true; P.analog = true; } else clearMove(W);
    // Sprinten: R2/ZR (analog) oder L3 gedrückt halten
    W.run = s.rt > 0.25 || s.b[10] ? 1 + 0.6 * Math.max(s.b[10] ? 1 : 0, Math.min(1, s.rt * 1.4)) : 1;
    // Kamera: rechter Stick, L1/R1
    var rx = Math.abs(s.rx) > DZ ? s.rx : 0, ry = Math.abs(s.ry) > DZ ? s.ry : 0;
    if (rx) W.camYaw -= rx * dt * 2.6;
    if (s.b[4]) W.camYaw += dt * 1.8; if (s.b[5]) W.camYaw -= dt * 1.8;
    if (ry) W.zoom = Math.max(0.6, Math.min(1.5, (W.zoom || 1) + ry * dt * 0.9));
    if (hit(11)) { W.camYaw = W.yaw + Math.PI; W.zoom = 1; }
    // Knöpfe
    if (hit(0)) { key('e', 'KeyE'); P.rumble(40, 0.25); }
    if (W.dlg) return;
    if (hit(1)) GL.emit('openMap');
    if (hit(2) && GL.phone) GL.phone.toggle();
    if (hit(3) || hit(9)) GL.emit('pause');
    if (hit(8)) key('m', 'KeyM');
  }
  function clearMove(W) { if (setJ && W) { W.jx = W.jz = 0; } setJ = false; P.analog = false; if (W && W.run && W.run !== 1) W.run = 1; }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; clearMove(GL.W); if (took) { took = false; handOver(false); } if (P.on) { P.on = false; P.world = false; sync(); } }
  P.start = start;

  /* ---------- Symbole und Hinweisleiste ---------- */
  function kind() { var N = window.EasyGamesPadNormal; return N && N.kind ? N.kind() : 'xbox'; }
  function gl(k) { var E = gpApi(); return E && E.glyph ? E.glyph(k) : k.toUpperCase(); }
  var COL = { ps: { a: '#3b82f6', b: '#ef4444', x: '#ec4899', y: '#22c55e' }, xbox: { a: '#16a34a', b: '#dc2626', x: '#2563eb', y: '#d97706' }, switch: { a: '#475569', b: '#475569', x: '#475569', y: '#475569' } };
  function chip(k, txt) { var c = (COL[P.kind] || COL.xbox)[k] || '#334155'; return '<span class="pk"><b style="background:' + c + '">' + gl(k) + '</b>' + txt + '</span>'; }
  P.glyph = gl;
  function sync() {
    P.kind = kind();
    var w = q('#world'); if (!w) return;
    w.classList.toggle('gp', P.on);
    var h = q('#padh');
    if (!h) { h = document.createElement('div'); h.id = 'padh'; w.appendChild(h); }
    h.innerHTML = P.on ? chip('a', 'Aktion') + chip('b', 'Orte') + chip('x', 'Handy') + chip('y', 'Menü') + chip('rt', 'Sprinten') + '<span class="pk"><b style="background:#334155">R</b>Kamera</span>' : '';
    var a = q('#act'); if (a) a.dataset.g = P.on ? gl('a') : '';
  }
  P.sync = sync;

  window.addEventListener('gamepadconnected', start);
  window.addEventListener('gamepaddisconnected', function () { if (!pads().length) stop(); });
  window.addEventListener('easygames:pad', function (e) { if (e.detail && e.detail.on) start(); });
  GL.on('worldBuilt', function () { sync(); if (pads().length) start(); });
  // Chrome meldet Pads erst nach dem ersten Knopfdruck; schon verbundene (Neuladen) hier aufnehmen
  setTimeout(function () { if (pads().length) start(); }, 500);
})();

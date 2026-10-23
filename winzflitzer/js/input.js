// Winzflitzer 3D – Eingabe: Tastatur (2 Spieler), Gamecontroller (Gamepad API), Touch (Stick oder Tasten)
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var keys = new Set(), pressed = [], padPrev = {};
  var KA = { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], fire: ['Enter', 'ShiftRight', 'ControlRight', 'Period', 'NumpadEnter', 'Numpad0'] };
  var KB = { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], fire: ['Space', 'ShiftLeft', 'KeyQ', 'KeyE'] };
  var GAMEKEYS = new Set([].concat(KA.up, KA.down, KA.left, KA.right, KB.up, KB.down, KB.left, KB.right, ['Space']));
  function any(list) { for (var i = 0; i < list.length; i++) if (keys.has(list[i])) return true; return false; }
  function typing(e) { var t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }

  addEventListener('keydown', function (e) {
    if (typing(e)) return;
    if (GAMEKEYS.has(e.code) && WF.Input.capture) e.preventDefault();
    if (!e.repeat) pressed.push(e.code);
    keys.add(e.code);
  });
  addEventListener('keyup', function (e) { keys.delete(e.code); });
  addEventListener('blur', function () { keys.clear(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) keys.clear(); });

  function pads() { try { return navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return []; } }
  function dz(v) { var a = Math.abs(v); if (a < 0.18) return 0; return Math.sign(v) * (a - 0.18) / 0.82; }
  function btn(p, i) { var b = p.buttons[i]; return b ? (b.pressed || b.value > 0.4) : false; }
  function bval(p, i) { var b = p.buttons[i]; return b ? Math.max(b.value || 0, b.pressed ? 1 : 0) : 0; }

  // ---------- Touch
  var touch = { on: false, el: null, stick: { id: -1, x: 0, y: 0, cx: 0, cy: 0 }, btn: {}, mode: 'dir' };
  function buildTouch(root) {
    var el = document.createElement('div'); el.id = 'touch';
    el.innerHTML = '<div class="tStick" id="tStickZone"><div class="tBase" id="tBase"><div class="tKnob" id="tKnob"></div></div></div>' +
      '<div class="tSteer"><button class="tb" data-b="left">◀</button><button class="tb" data-b="right">▶</button></div>' +
      '<div class="tBtns"><button class="tb fire" data-b="fire">💥</button><button class="tb brake" data-b="brake">BREMSE</button><button class="tb gas" data-b="gas">GAS</button></div>';
    root.appendChild(el); touch.el = el;
    var zone = el.querySelector('#tStickZone'), base = el.querySelector('#tBase'), knob = el.querySelector('#tKnob'), R = 52;
    function move(e) {
      var s = touch.stick, dx = e.clientX - s.cx, dy = e.clientY - s.cy, d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      s.x = dx / R; s.y = dy / R; knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }
    zone.addEventListener('pointerdown', function (e) {
      e.preventDefault(); var s = touch.stick; s.id = e.pointerId; var r = zone.getBoundingClientRect();
      s.cx = e.clientX; s.cy = e.clientY; base.style.left = (e.clientX - r.left) + 'px'; base.style.top = (e.clientY - r.top) + 'px'; base.classList.add('on');
      try { zone.setPointerCapture(e.pointerId); } catch (er) {} move(e);
    });
    zone.addEventListener('pointermove', function (e) { if (e.pointerId === touch.stick.id) move(e); });
    function up(e) { if (e.pointerId !== touch.stick.id) return; var s = touch.stick; s.id = -1; s.x = s.y = 0; knob.style.transform = ''; base.classList.remove('on'); base.style.left = base.style.top = ''; }
    zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up); zone.addEventListener('lostpointercapture', up);
    el.querySelectorAll('[data-b]').forEach(function (b) {
      var k = b.getAttribute('data-b'), ids = new Set();
      function set() { touch.btn[k] = ids.size > 0; b.classList.toggle('on', ids.size > 0); }
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); ids.add(e.pointerId); try { b.setPointerCapture(e.pointerId); } catch (er) {} set(); if (k === 'fire') pressed.push('TouchFire'); });
      var u = function (e) { ids.delete(e.pointerId); set(); };
      b.addEventListener('pointerup', u); b.addEventListener('pointercancel', u); b.addEventListener('lostpointercapture', u);
    });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  WF.Input = {
    capture: false,
    keys: keys,
    // gesammelte Tastendrücke seit dem letzten Aufruf (für Menüs und Beitreten)
    takePressed: function () { var p = pressed; pressed = []; return p; },
    pads: pads,
    padEdges: function () { // neue Knopfdrücke je Controller: [{i, b}]
      var out = [], P = pads();
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; if (!p) continue;
        var prev = padPrev[i] || (padPrev[i] = {}), ax = p.axes || [];
        var st = { 0: btn(p, 0), 1: btn(p, 1), 2: btn(p, 2), 3: btn(p, 3), 9: btn(p, 9), 8: btn(p, 8), 12: btn(p, 12) || ax[1] < -0.6, 13: btn(p, 13) || ax[1] > 0.6, 14: btn(p, 14) || ax[0] < -0.6, 15: btn(p, 15) || ax[0] > 0.6, 5: btn(p, 5), 7: btn(p, 7) };
        for (var k in st) { if (st[k] && !prev[k]) out.push({ i: i, b: +k }); prev[k] = st[k]; }
      }
      return out;
    },
    touchOn: function (on, mode, gun) {
      if (on && !touch.el) buildTouch(document.body);
      touch.on = on; touch.mode = mode || 'dir';
      if (touch.el) { touch.el.hidden = !on; touch.el.className = 'm-' + touch.mode + (gun ? ' gun' : ''); }
      if (!on) { touch.stick.id = -1; touch.stick.x = touch.stick.y = 0; touch.btn = {}; }
    },
    // Zustand eines Geräts: kbA, kbB, kb (beide), pad0…3, touch
    read: function (dev, out, opts) {
      out.thr = 0; out.steer = 0; out.fire = false; out.dir = null; out.brake = false;
      if (dev === 'kb' || dev === 'kbA' || dev === 'kbB') {
        var sets = dev === 'kb' ? [KA, KB] : [dev === 'kbA' ? KA : KB];
        sets.forEach(function (K) {
          if (any(K.up)) out.thr = 1; if (any(K.down)) out.thr = out.thr > 0 ? 0 : -1;
          if (any(K.left)) out.steer -= 1; if (any(K.right)) out.steer += 1;
          if (any(K.fire)) out.fire = true;
        });
        out.steer = WF.clamp(out.steer, -1, 1);
        if (dev === 'kb' && keys.has('Space')) out.fire = true;
      } else if (dev.indexOf('pad') === 0) {
        var p = pads()[+dev.slice(3)]; if (!p) return out;
        var ax = p.axes || [], x = dz(ax[0] || 0), y = dz(ax[1] || 0);
        if (btn(p, 14)) x = -1; if (btn(p, 15)) x = 1; if (btn(p, 12)) y = -1; if (btn(p, 13)) y = 1;
        var gas = Math.max(btn(p, 0) ? 1 : 0, bval(p, 7)), br = Math.max(btn(p, 1) ? 1 : 0, bval(p, 6));
        out.fire = btn(p, 2) || btn(p, 5) || btn(p, 3);
        if (opts && opts.padMode === 'dir' && Math.hypot(x, y) > 0.3) {
          out.dir = [x, y]; out.brake = br > 0.3;
          if (gas > 0.1) out.dir = [x / Math.hypot(x, y), y / Math.hypot(x, y)];
        } else { out.steer = x; out.thr = gas > 0.05 ? gas : (br > 0.05 ? -br : 0); }
      } else if (dev === 'touch') {
        var s = touch.stick, b = touch.btn;
        out.fire = !!b.fire;
        if (touch.mode === 'dir') {
          if (s.id >= 0 && Math.hypot(s.x, s.y) > 0.2) { out.dir = [s.x, s.y]; out.brake = !!b.brake; }
          else if (b.brake) out.thr = -1; else if (b.gas) out.thr = 1;
        } else {
          out.steer = (b.right ? 1 : 0) - (b.left ? 1 : 0); out.thr = b.gas ? 1 : (b.brake ? -1 : 0);
          if (opts && opts.autoGas && !b.brake) out.thr = 1;
        }
      }
      return out;
    }
  };
  // Lenkrichtung: rechts = im Uhrzeigersinn aus Fahrersicht (siehe physics.js: steer > 0 verringert den Winkel)
})();

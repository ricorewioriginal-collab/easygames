// Winzflitzer 3D – Eingabe: Tastatur (2 Spieler), Gamecontroller (PlayStation, Switch, Xbox über die Gamepad API), Touch
// Immer voll manuell: Gas, Bremse und Lenkung kommen nur vom Spieler.
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var keys = new Set(), pressed = [], padPrev = {};
  // Spieler A (Pfeile) und B (WASD); bei einem Spieler gelten beide Sätze
  var KA = { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], drift: ['ShiftRight', 'ControlRight', 'Slash', 'Numpad1'], fire: ['Enter', 'NumpadEnter', 'Numpad0', 'Period'] };
  var KB = { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], drift: ['Space', 'ShiftLeft'], fire: ['KeyQ', 'KeyE', 'KeyF'] };
  var GAMEKEYS = new Set([].concat(KA.up, KA.down, KA.left, KA.right, KB.up, KB.down, KB.left, KB.right, ['Space']));
  function any(list) { for (var i = 0; i < list.length; i++) if (keys.has(list[i])) return true; return false; }
  function typing(e) { var t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }

  // zuletzt benutztes Gerät: bestimmt die Knopf-Hinweise (Controller-Symbole, Tasten oder Touch)
  var lastDev = matchMedia('(pointer: coarse)').matches ? 'touch' : 'kb';
  function used(d) { if (d !== lastDev) { lastDev = d; try { document.documentElement.setAttribute('data-inp', d); dispatchEvent(new Event('wf:input')); } catch (e) {} } }
  try { document.documentElement.setAttribute('data-inp', lastDev); } catch (e) {}

  addEventListener('keydown', function (e) {
    if (typing(e)) return;
    if (GAMEKEYS.has(e.code) && WF.Input.capture) e.preventDefault();
    if (!e.repeat) pressed.push(e.code);
    keys.add(e.code); used('kb');
  });
  addEventListener('keyup', function (e) { keys.delete(e.code); });
  addEventListener('blur', function () { keys.clear(); });
  addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') used('touch'); else if (e.pointerType === 'mouse' && lastDev === 'touch') used('kb'); }, true);
  document.addEventListener('visibilitychange', function () { if (document.hidden) keys.clear(); });

  function pads() { try { return navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return []; } }
  // Totzone mit weicher Kennlinie: kleine Ausschläge lenken fein, voller Ausschlag voll
  function dz(v) { var a = Math.abs(v); if (a < 0.14) return 0; a = (a - 0.14) / 0.86; return Math.sign(v) * Math.min(1, a * (0.45 + 0.55 * a)); }
  function btn(p, i) { var b = p.buttons[i]; return b ? (b.pressed || b.value > 0.4) : false; }
  function bval(p, i) { var b = p.buttons[i]; return b ? Math.max(b.value || 0, b.pressed ? 1 : 0) : 0; }

  // ---------- Controller-Art und Knopf-Symbole (PlayStation ✕○□△, Nintendo Switch A B X Y, Xbox)
  function norm() { return window.EasyGamesPadNormal || null; }
  function kind() {
    if (WF.Input && WF.Input.forceKind) return WF.Input.forceKind;
    var n = norm(); if (n && n.kind) try { return n.kind(); } catch (e) {}
    var P = pads();
    for (var i = 0; i < P.length; i++) if (P[i]) { var id = String(P[i].id || '');
      if (/054c|playstation|dualsense|dualshock|wireless controller/i.test(id)) return 'ps';
      if (/057e|nintendo|pro controller|joy-?con/i.test(id)) return 'switch'; return 'xbox'; }
    return 'xbox';
  }
  function swapped() { var n = norm(); try { return !!(n && n.swapped && n.swapped()); } catch (e) { return false; } }
  // logische Knöpfe (Standard-Layout nach gamepad.js): 0 Bestätigen/Gas, 1 Zurück/Bremse, 2 Drift, 3 Schießen, 4 L1, 5 R1, 6 L2, 7 R2, 8 Select, 9 Start
  function label(i, kk) {
    var k = kk || kind();
    if (k === 'ps') return [['✕', 'ps-x'], ['○', 'ps-o'], ['□', 'ps-s'], ['△', 'ps-t'], ['L1'], ['R1'], ['L2'], ['R2'], ['Create'], ['Options']][i] || ['?'];
    if (k === 'switch') { var sw = kk ? true : swapped() || !norm(); return [[sw ? 'A' : 'B'], [sw ? 'B' : 'A'], ['Y'], ['X'], ['L'], ['R'], ['ZL'], ['ZR'], ['−'], ['+']][i] || ['?']; }
    return [['A', 'xb-a'], ['B', 'xb-b'], ['X', 'xb-x'], ['Y', 'xb-y'], ['LB'], ['RB'], ['LT'], ['RT'], ['View'], ['Menu']][i] || ['?'];
  }
  function padGlyph(i, kk) { var l = label(i, kk), k = kk || kind(), round = i <= 3; return '<i class="g g-' + k + (round ? ' r' : ' w') + (l[1] ? ' ' + l[1] : '') + '">' + l[0] + '</i>'; }
  function key(t) { return '<i class="g k">' + t + '</i>'; }
  // Hinweis für eine Aktion – passend zum zuletzt benutzten Gerät
  var ACT = {
    ok: [[0], ['Enter']], back: [[1], ['Esc']], gas: [[0, 7], ['↑']], brake: [[1, 6], ['↓']], steer: [['ls'], ['←', '→']], drift: [[2, 4], ['Leertaste']],
    fire: [[3, 5], ['Enter']], pause: [[9], ['Esc']], cam: [[8], ['C']], tabs: [[4, 5], ['Q', 'E']], move: [['dpad'], ['↑', '↓', '←', '→']], join: [[0], ['↑ / W']]
  };
  function glyph(act, dev, kk) {
    var a = ACT[act]; if (!a) return '';
    if ((dev || lastDev) === 'pad') return a[0].map(function (i) { return i === 'ls' ? '<i class="g w stick">L</i>' : i === 'dpad' ? '<i class="g w">✚</i>' : padGlyph(i, kk); }).join('');
    return a[1].map(key).join('');
  }

  // ---------- Touch: links lenken (Tasten oder Lenk-Schieber), rechts Gas, Bremse, Drift, Schießen – Finger darf zwischen Knöpfen gleiten
  var touch = { on: false, el: null, mode: 'keys', steer: 0, btn: {} };
  function buildTouch(root) {
    var el = document.createElement('div'); el.id = 'touch';
    el.innerHTML = '<div class="tSteerZone" id="tSteerZone"><div class="tArrow l">◀</div><div class="tArrow r">▶</div>' +
      '<div class="tSlider"><div class="tKnob" id="tKnob"></div></div></div>' +
      '<div class="tPedals" id="tPedals"><button class="tb fire" data-b="fire">💥</button><button class="tb drift" data-b="drift">DRIFT</button>' +
      '<button class="tb brake" data-b="brake">BREMSE</button><button class="tb gas" data-b="gas">GAS</button></div>';
    root.appendChild(el); touch.el = el;
    // Lenken: eine Fläche, linke/rechte Hälfte (Tasten) oder stufenlos (Schieber)
    var zone = el.querySelector('#tSteerZone'), knob = el.querySelector('#tKnob'), ids = {}, arrows = zone.querySelectorAll('.tArrow');
    function steerFrom() {
      var r = zone.getBoundingClientRect(), cx = r.left + r.width / 2, v = 0, n = 0;
      for (var k in ids) { var dx = ids[k] - cx; v += touch.mode === 'stick' ? WF.clamp(dx / (r.width * 0.34), -1, 1) : (dx < 0 ? -1 : 1); n++; }
      touch.steer = n ? WF.clamp(v, -1, 1) : 0;
      arrows[0].classList.toggle('on', touch.steer < -0.2); arrows[1].classList.toggle('on', touch.steer > 0.2);
      knob.style.transform = 'translateX(' + (touch.steer * r.width * 0.34) + 'px)';
    }
    zone.addEventListener('pointerdown', function (e) { e.preventDefault(); ids[e.pointerId] = e.clientX; try { zone.setPointerCapture(e.pointerId); } catch (er) {} steerFrom(); });
    zone.addEventListener('pointermove', function (e) { if (e.pointerId in ids) { ids[e.pointerId] = e.clientX; steerFrom(); } });
    function zup(e) { if (e.pointerId in ids) { delete ids[e.pointerId]; steerFrom(); } }
    zone.addEventListener('pointerup', zup); zone.addEventListener('pointercancel', zup); zone.addEventListener('lostpointercapture', zup);
    // Pedale: jeder Finger gehört dem Knopf, über dem er gerade ist
    var ped = el.querySelector('#tPedals'), bs = Array.prototype.slice.call(ped.querySelectorAll('[data-b]')), own = {};
    function hit(x, y) {
      var best = null, bd = 1e9;
      bs.forEach(function (b) { if (!b.offsetParent) return; var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(x - cx, y - cy) - r.width / 2;
        if (d < 22 && d < bd) { bd = d; best = b.getAttribute('data-b'); } });
      return best;
    }
    function sync() { var on = {}; for (var k in own) if (own[k]) on[own[k]] = true; bs.forEach(function (b) { var k = b.getAttribute('data-b'), was = touch.btn[k]; touch.btn[k] = !!on[k]; b.classList.toggle('on', !!on[k]); if (k === 'fire' && on[k] && !was) pressed.push('TouchFire'); }); }
    ped.addEventListener('pointerdown', function (e) { e.preventDefault(); own[e.pointerId] = hit(e.clientX, e.clientY); try { ped.setPointerCapture(e.pointerId); } catch (er) {} sync(); });
    ped.addEventListener('pointermove', function (e) { if (e.pointerId in own) { own[e.pointerId] = hit(e.clientX, e.clientY); sync(); } });
    function pup(e) { if (e.pointerId in own) { delete own[e.pointerId]; sync(); } }
    ped.addEventListener('pointerup', pup); ped.addEventListener('pointercancel', pup); ped.addEventListener('lostpointercapture', pup);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  WF.Input = {
    capture: false,
    keys: keys,
    get last() { return lastDev; },
    kind: kind, glyph: glyph, padGlyph: padGlyph,
    // gesammelte Tastendrücke seit dem letzten Aufruf (für Menüs und Beitreten)
    takePressed: function () { var p = pressed; pressed = []; return p; },
    pads: pads,
    padEdges: function () { // neue Knopfdrücke je Controller: [{i, b}]
      var out = [], P = pads();
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; if (!p) continue;
        var prev = padPrev[i] || (padPrev[i] = {}), ax = p.axes || [];
        var st = { 0: btn(p, 0), 1: btn(p, 1), 2: btn(p, 2), 3: btn(p, 3), 4: btn(p, 4), 5: btn(p, 5), 6: btn(p, 6), 7: btn(p, 7), 8: btn(p, 8), 9: btn(p, 9),
          12: btn(p, 12) || ax[1] < -0.6, 13: btn(p, 13) || ax[1] > 0.6, 14: btn(p, 14) || ax[0] < -0.6, 15: btn(p, 15) || ax[0] > 0.6 };
        for (var k in st) { if (st[k] && !prev[k]) { out.push({ i: i, b: +k }); used('pad'); } prev[k] = st[k]; }
      }
      return out;
    },
    // Rütteln (DualSense, DualShock, Switch Pro und Xbox, sofern der Browser es kann)
    rumble: function (dev, strong, weak, ms) {
      if (!WF.Input.vibrate) return;
      var P = pads(), list = dev === 'any' ? P : [P[+String(dev).slice(3)]];
      for (var i = 0; i < list.length; i++) { var p = list[i], va = p && (p.vibrationActuator || (p.raw && p.raw.vibrationActuator)); if (!va || !va.playEffect) continue;
        try { va.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: Math.min(1, strong), weakMagnitude: Math.min(1, weak) }).catch(function () {}); } catch (e) {} }
    },
    vibrate: true,
    touchOn: function (on, mode, gun) {
      if (on && !touch.el) buildTouch(document.body);
      touch.on = on; touch.mode = mode === 'stick' ? 'stick' : 'keys';
      if (touch.el) { touch.el.hidden = !on; touch.el.className = 'm-' + touch.mode + (gun ? ' gun' : ''); }
      if (!on) { touch.steer = 0; touch.btn = {}; }
    },
    // Zustand eines Geräts: kbA, kbB, kb (beide), pad0…3, touch → thr (−1…1), steer (−1…1), hb (Drift), fire
    read: function (dev, out) {
      out.thr = 0; out.steer = 0; out.fire = false; out.hb = false; out.analog = false;
      if (dev === 'kb' || dev === 'kbA' || dev === 'kbB') {
        var sets = dev === 'kb' ? [KA, KB] : [dev === 'kbA' ? KA : KB], up = false, down = false;
        sets.forEach(function (K) {
          if (any(K.up)) up = true; if (any(K.down)) down = true;
          if (any(K.left)) out.steer -= 1; if (any(K.right)) out.steer += 1;
          if (any(K.fire)) out.fire = true; if (any(K.drift)) out.hb = true;
        });
        out.thr = up && down ? 0 : up ? 1 : down ? -1 : 0;
        out.steer = WF.clamp(out.steer, -1, 1);
      } else if (dev.indexOf('pad') === 0) {
        var p = pads()[+dev.slice(3)]; if (!p) return out;
        var ax = p.axes || [], x = dz(ax[0] || 0);
        if (btn(p, 14)) x = -1; else if (btn(p, 15)) x = 1; else out.analog = x !== 0;
        var gas = Math.max(btn(p, 0) ? 1 : 0, bval(p, 7)), br = Math.max(btn(p, 1) ? 1 : 0, bval(p, 6));
        out.steer = x;
        out.thr = gas > 0.05 && br > 0.05 ? (gas > br ? gas : -br) : gas > 0.05 ? gas : (br > 0.05 ? -br : 0);
        out.hb = btn(p, 2) || btn(p, 4);
        out.fire = btn(p, 3) || btn(p, 5);
        if (out.thr || out.steer || out.hb) used('pad');
      } else if (dev === 'touch') {
        var b = touch.btn;
        out.steer = touch.steer; out.analog = touch.mode === 'stick';
        out.thr = b.gas && b.brake ? 0 : b.gas ? 1 : (b.brake ? -1 : 0);
        out.hb = !!b.drift; out.fire = !!b.fire;
      }
      return out;
    }
  };
  // Lenkrichtung: rechts = im Uhrzeigersinn aus Fahrersicht (siehe physics.js: steer > 0 verringert den Winkel)
})();

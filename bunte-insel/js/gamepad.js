'use strict';
/* Bunte Insel – Controller (Gamepad) 🎮: für Fernseher, Konsole, Computer und Tablet mit Xbox-/PlayStation-/Switch-Pad oder Handy-Pad per Bluetooth/Kabel.
   Wird automatisch erkannt (Gamepad-API) und eingerichtet: Standard-Belegung sofort, bei unbekannten Pads führt eine kurze Einrichtung („Drücke A …“) durch; gespeichert pro Pad.
   Spiel: linker Stick laufen/fahren, rechter Stick Kamera, A Aktion, B Springen/Turbo, X Hauen/zweite Aktion/Sirene, Y Hallo/Hupe, Trigger Gas/Bremse, Start Pause, Select Aufgaben,
   Steuerkreuz Menüs (Wohin, Spaß, Tasche, Aufgaben), LB Kamera. Menüs: Steuerkreuz/Stick bewegt die Markierung, A drückt, B zurück. Mini-Spiele: Stick/Steuerkreuz = Pfeiltasten, A = Leertaste. */
BI.createGamepad = function (G) {
  const { inp, cam, P, say } = G, $ = id => document.getElementById(id), K = { pad: null, mapping: null, wiz: null }, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const STD = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, sel: 8, start: 9, du: 12, dd: 13, dl: 14, dr: 15, lx: 0, ly: 1, rx: 2, ry: 3 };
  const NAMES = [['a', 'A  (Aktion)'], ['b', 'B  (Springen)'], ['x', 'X  (Hauen / zweite Aktion)'], ['y', 'Y  (Hallo / Hupe)'], ['start', 'START  (Pause)']];
  const LEGEND = '🎮 Controller: <b>Linker Stick</b> laufen/fahren · <b>Rechter Stick</b> Kamera · <b>A</b> Aktion · <b>B</b> Springen/Turbo · <b>X</b> Hauen/zweite Aktion · <b>Y</b> Hallo/Hupe · <b>RT/LT</b> Gas/Bremse · <b>Start</b> Pause · <b>Select</b> Aufgaben · <b>Steuerkreuz</b> ↑Wohin ←Spaß →Tasche ↓Aufgaben · <b>LB</b> Kamera · In Menüs: Steuerkreuz bewegt, <b>A</b> drückt, <b>B</b> zurück';
  const key = id => 'bi-gp-' + id.slice(0, 40);
  const load = id => { try { const m = JSON.parse(localStorage.getItem(key(id)) || 'null'); return m && typeof m === 'object' ? m : null; } catch (e) { return null; } };
  const save = (id, m) => { try { localStorage.setItem(key(id), JSON.stringify(m)); } catch (e) { } };
  const pads = () => { try { return (navigator.getGamepads && navigator.getGamepads()) || []; } catch (e) { return []; } };
  const live = () => { for (const g of pads()) if (g && g.connected) return g; return null; };
  /* ---------- Erkennung + Einrichtung ---------- */
  function setup(g) {
    K.pad = g.index; K.id = g.id; document.body.classList.add('gamepad'); const help = $('gpHelp'); if (help) { help.hidden = false; help.innerHTML = LEGEND; }
    const short = (g.id || 'Controller').replace(/\(.*?\)|Vendor:.*|Product:.*/g, '').trim().slice(0, 28) || 'Controller';
    const saved = load(g.id);
    if (saved) { K.mapping = saved; say('🎮 ' + short + ' erkannt – deine Belegung ist geladen.', 3600); }
    else if (g.mapping === 'standard') { K.mapping = Object.assign({}, STD); say('🎮 ' + short + ' erkannt und eingerichtet! Pause-Menü zeigt die Belegung.', 4800); }
    else { K.mapping = Object.assign({}, STD); startWizard(g, short); }
    if (G.onPad) G.onPad(true);
  }
  function startWizard(g, short) {
    const w = K.wiz = { step: 0, got: {}, el: document.createElement('div'), t: 0, base: [] }; w.el.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(10,12,34,.88);color:#fff;font-family:Fredoka,system-ui,sans-serif;text-align:center';
    w.el.innerHTML = '<div style="padding:24px;max-width:560px"><div style="font-size:30px;font-weight:800">🎮 ' + short + ' einrichten</div><div id="gpWz" style="font-size:24px;margin:16px 0"></div><div style="font-size:16px;opacity:.8">Drücke die gefragte Taste.</div></div>'; document.body.appendChild(w.el); w.base = Array.from(g.buttons, b => !!b.pressed); wizText();
  }
  const wizText = () => { const w = K.wiz; if (!w) return; $('gpWz').textContent = w.step < NAMES.length ? 'Drücke ' + NAMES[w.step][1] : 'Fertig!'; };
  function wizUpdate(g) {
    const w = K.wiz; if (!w) return false; const now = Array.from(g.buttons, b => !!b.pressed);
    for (let i = 0; i < now.length; i++) if (now[i] && !w.base[i] && w.step < NAMES.length) { if (Object.values(w.got).includes(i)) continue; w.got[NAMES[w.step][0]] = i; w.step++; wizText(); if (w.step >= NAMES.length) { K.mapping = Object.assign({}, STD, w.got); save(g.id, K.mapping); setTimeout(() => { if (K.wiz) { K.wiz.el.remove(); K.wiz = null; say('🎮 Controller eingerichtet und gespeichert!', 3200); } }, 700); } break; }
    w.base = now; return true;
  }
  addEventListener('gamepadconnected', e => { if (e.gamepad && K.pad == null) setup(e.gamepad); });
  addEventListener('gamepaddisconnected', e => { if (e.gamepad && e.gamepad.index === K.pad) { K.pad = null; document.body.classList.remove('gamepad'); const h = $('gpHelp'); if (h) h.hidden = true; if (K.wiz) { K.wiz.el.remove(); K.wiz = null; } G.setStick(0, 0); inp.turbo = inp.up = inp.down = inp.horn = false; say('🎮 Controller getrennt – mit der Tastatur oder dem Touch-Bildschirm geht es weiter.', 3600); } });
  /* ---------- Hilfen ---------- */
  const dz = (x, y, d) => { const l = Math.hypot(x, y); if (l < d) return [0, 0]; const k = (l - d) / (1 - d) / l; return [x * k, y * k]; };
  const prev = {}; let rep = 0;
  const edge = (name, down) => { const was = !!prev[name]; prev[name] = down; return down && !was; };
  const fire = (code, type) => { try { window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true })); } catch (e) { } };
  const kheld = {}; const keyHold = (code, on) => { if (!!kheld[code] === on) return; kheld[code] = on; fire(code, on ? 'keydown' : 'keyup'); };
  const click = id => { const b = $(id); if (b && !b.hidden) b.click(); };
  /* ---------- Menü-Navigation: Markierung springt zum nächsten sichtbaren, nicht verdeckten Knopf in Richtung des Sticks ---------- */
  let cur = null;
  const cands = () => { const out = []; for (const e of document.querySelectorAll('button, a[href], input, select, [role=button], .mbtn, .pill, .big')) { if (e.disabled || e.hidden || !e.offsetParent) continue; const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; const t = document.elementFromPoint(clamp(r.left + r.width / 2, 0, innerWidth - 1), clamp(r.top + r.height / 2, 0, innerHeight - 1)); if (t && (t === e || e.contains(t) || t.contains(e))) out.push(e); } return out; };
  function mark(e) { if (cur && cur !== e) cur.classList.remove('gp-focus'); cur = e; if (e) { e.classList.add('gp-focus'); try { e.scrollIntoView({ block: 'nearest' }); } catch (x) { } } }
  function nav(dx, dy) {
    const L = cands(); if (!L.length) return; if (!cur || !L.includes(cur)) { const first = $('bStart') && L.includes($('bStart')) ? $('bStart') : L[0]; mark(first); return; }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2; let best = null, bs = 1e12;
    for (const e of L) { if (e === cur) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2 - ax, y = r.top + r.height / 2 - ay, f = x * dx + y * dy; if (f < 4) continue; const side = Math.abs(x * dy - y * dx), sc = f + side * 2.2; if (sc < bs) { bs = sc; best = e; } }
    if (best) mark(best);
  }
  K.dbg = { get mapping() { return K.mapping; }, nav, cands, get cur() { return cur; } };
  /* ---------- Jedes Bild ---------- */
  K.update = function (dt) {
    const g = K.pad == null ? null : pads()[K.pad]; if (!g || !g.connected) { if (K.pad == null) { const l = live(); if (l && (l.buttons.some(b => b.pressed) || l.axes.some(a => Math.abs(a) > .5))) setup(l); } return; }
    if (wizUpdate(g)) return;
    const M = K.mapping || STD, btn = n => { const b = g.buttons[M[n]]; return b ? (b.pressed || b.value > .5) : false; }, tv = n => { const b = g.buttons[M[n]]; return b ? b.value : 0; }, ax = i => g.axes[i] || 0;
    const [lx, ly] = dz(ax(M.lx), ax(M.ly), .2), [rx, ry] = dz(ax(M.rx), ax(M.ry), .2);
    const dl = btn('dl'), dr = btn('dr'), du = btn('du'), dd = btn('dd'), st = G.state(), busy = G.busy(), mini = G.mini && G.mini();
    /* Mini-Spiele: Pfeiltasten + Leertaste */
    if (mini && st === 'play') {
      keyHold('ArrowLeft', lx < -.5 || dl); keyHold('ArrowRight', lx > .5 || dr); keyHold('ArrowUp', ly < -.5 || du); keyHold('ArrowDown', ly > .5 || dd); keyHold('Space', btn('a')); if (edge('b', btn('b'))) { fire('Escape', 'keydown'); fire('Escape', 'keyup'); } return;
    }
    for (const c of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']) if (kheld[c]) keyHold(c, false);
    /* Menüs / Fenster: Markierung bewegen */
    if (st !== 'play' || busy) {
      G.setStick(0, 0); inp.turbo = inp.up = inp.down = inp.horn = false; rep -= dt;
      const mx = Math.abs(lx) > .5 || dl || dr ? (lx > .5 || dr ? 1 : -1) : 0, my = Math.abs(ly) > .5 || du || dd ? (ly > .5 || dd ? 1 : -1) : 0;
      if ((mx || my) && rep <= 0) { rep = prev.mv ? .16 : .38; prev.mv = true; if (Math.abs(ly) >= Math.abs(lx) && my || !mx) nav(0, my); else nav(mx, 0); } else if (!mx && !my) { prev.mv = false; rep = 0; }
      if (edge('a', btn('a'))) { if (cur && cur.offsetParent) cur.click(); else nav(0, 1); }
      if (edge('b', btn('b'))) { const ex = $('mgExit'); if (ex && ex.offsetParent) ex.click(); else { fire('Escape', 'keydown'); fire('Escape', 'keyup'); } }
      if (edge('start', btn('start'))) { if (st === 'menu') click('bStart'); else click('bResume'); }
      cur && !cur.offsetParent && mark(null); return;
    }
    if (cur) mark(null);
    /* Spielen */
    const veh = P.veh, trig = tv('rt') - tv('lt'); let sx = lx, sy = -ly; if (veh && Math.abs(trig) > .06 && Math.abs(sy) < .15) sy = trig;
    G.setStick(sx, sy);
    if (rx || ry) { cam.yaw -= rx * dt * 2.7; cam.pitch = clamp(cam.pitch + ry * dt * 1.5, .12, 1.3); cam.idle = 0; if (cam.ego && veh) cam.egoOff = clamp((cam.egoOff || 0) - rx * dt * 2.7, -1.7, 1.7); }
    if (edge('a', btn('a'))) inp.act = true;
    { const b = btn('b'); if (edge('b', b)) { if (veh) inp.turbo = true; inp.up = true; if (!veh) inp.jump = true; } else if (!b && prev.bb) { inp.turbo = false; inp.up = false; } prev.bb = b; }
    { const x = btn('x'); if (edge('x', x)) { inp.aux = true; inp.down = true; } else if (!x && prev.xx) inp.down = false; prev.xx = x; }
    { const y = btn('y'); if (edge('y', y)) { inp.horn = true; inp.hornEdge = true; } else if (!y && prev.yy) inp.horn = false; prev.yy = y; }
    if (edge('start', btn('start'))) click('bPause'); if (edge('sel', btn('sel'))) click('bLog'); if (edge('lb', btn('lb'))) click('bCam');
    if (edge('du', du)) click('bGuide'); if (edge('dl', dl)) click('bFun'); if (edge('dr', dr)) click('bPack'); if (edge('dd', dd)) click('bLog'); if (edge('rb', btn('rb'))) click('bPack');
  };
  const st = document.createElement('style'); st.textContent = '.gp-focus{outline:5px solid #fff!important;outline-offset:3px;box-shadow:0 0 0 9px #ff7a1a,0 0 22px 12px rgba(255,200,60,.6)!important;border-radius:16px;position:relative;z-index:5}'; document.head.appendChild(st);
  return K;
};

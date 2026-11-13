'use strict';
/* Bunte Insel – Controller (Gamepad) 🎮: für Fernseher, Konsole, Computer und Tablet mit Xbox-/PlayStation-/Switch-Pad oder Handy-Pad per Bluetooth/Kabel.
   Wird automatisch erkannt (Gamepad-API) und eingerichtet: Standard-Belegung sofort, bei unbekannten Pads führt eine kurze Einrichtung („Drücke A …“) durch; gespeichert pro Pad.
   Spiel: linker Stick laufen/fahren, rechter Stick Kamera, A Aktion, B Springen/Turbo, X Hauen/zweite Aktion/Sirene, Y Hallo/Hupe, Trigger Gas/Bremse, Start Pause, Select Aufgaben,
   Steuerkreuz Menüs (Wohin, Spaß, Tasche, Aufgaben), LB Kamera. Menüs: Steuerkreuz/Stick bewegt die Markierung, A drückt, B zurück. Mini-Spiele: Tasten-Spiele Stick/Steuerkreuz = Pfeiltasten, A = Leertaste; Tipp-Spiele Finger-Zeiger (Stick bewegt, A tippt, halten = ziehen). */
/* Konsolen-Gefühl: Controller-Art wird erkannt (PlayStation ✕○□△, Switch A/B/X/Y – A rechts = Bestätigen tauscht ../gamepad.js –, Xbox), Tastensymbole an den Bildschirm-Knöpfen
   und in der Hinweisleiste unten, ALLE Tasten belegt (L3 Rennen, R3 Kamera hinter dich, L2 Kamera-Abstand, R2 Rennen/Gas, Home/PS Insel-Menü, Touchpad/Aufnahme Karte),
   in Menüs L1/R1 = Seite wechseln, rechter Stick = blättern, Vibration bei Sternen und Aktionen (abschaltbar). Einstellungen: localStorage bi-gp-opt. */
BI.GP_GLYPH = {
  ps: { a: '✕', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', lt: 'L2', rt: 'R2', sel: 'SHARE', start: 'OPTIONS', l3: 'L3', r3: 'R3', home: 'PS', pad: 'TOUCH', name: 'PlayStation' },
  nin: { a: 'A', b: 'B', x: 'Y', y: 'X', lb: 'L', rb: 'R', lt: 'ZL', rt: 'ZR', sel: '−', start: '+', l3: 'L-Stick', r3: 'R-Stick', home: '⌂', pad: '◉', name: 'Nintendo Switch' },
  xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT', sel: 'VIEW', start: 'MENU', l3: 'LS', r3: 'RS', home: 'XBOX', pad: 'SHARE', name: 'Xbox / PC' }
};
BI.gpKind = id => { id = String(id || '').toLowerCase(); if (/054c|playstation|dualshock|dualsense|wireless controller|ps[345]/.test(id)) return 'ps'; if (/057e|nintendo|switch|pro controller|joy-?con/.test(id)) return 'nin'; return 'xbox'; };
BI.createGamepad = function (G) {
  const { inp, cam, P, say } = G, $ = id => document.getElementById(id), K = { pad: null, mapping: null, wiz: null, kind: 'xbox' }, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const STD = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, sel: 8, start: 9, l3: 10, r3: 11, du: 12, dd: 13, dl: 14, dr: 15, home: 16, pad: 17, lx: 0, ly: 1, rx: 2, ry: 3 };
  /* Switch: Bestätigen liegt rechts – das tauscht schon ../gamepad.js (easygames-weit) in navigator.getGamepads(), hier nur die Symbole */
  const OPT = (() => { try { return Object.assign({ layout: 'auto', rumble: true, hints: true }, JSON.parse(localStorage.getItem('bi-gp-opt') || '{}')); } catch (e) { return { layout: 'auto', rumble: true, hints: true }; } })();
  K.opt = OPT; K.setOpt = (k, v) => { OPT[k] = v; try { localStorage.setItem('bi-gp-opt', JSON.stringify(OPT)); } catch (e) { } if (k === 'layout' && K.pad != null) { const g = pads()[K.pad]; if (g) applyKind(g, true); } paintGlyphs(); };
  K.glyph = n => (BI.GP_GLYPH[K.kind] || BI.GP_GLYPH.xbox)[n] || n.toUpperCase();
  function applyKind(g, force) {
    const kind = OPT.layout !== 'auto' ? OPT.layout : BI.gpKind(g.id); K.kind = kind;
    if (force || !K.mapping || K.mapping._auto) { K.mapping = Object.assign({}, STD, { _auto: 1 }); }
    document.body.classList.remove('gp-ps', 'gp-nin', 'gp-xbox'); document.body.classList.add('gp-' + kind); paintGlyphs();
  }
  function paintGlyphs() {
    for (const [id, k] of [['bAct', 'a'], ['bJump', 'b'], ['bAux', 'x'], ['bHorn', 'y']]) { const e = $(id); if (e) { e.dataset.k = K.pad != null ? K.glyph(k) : k.toUpperCase(); e.dataset.gk = k; } }
    const help = $('gpHelp'); if (help && K.pad != null) help.innerHTML = legend();
  }
  K.rumble = function (ms, weak, strong) {
    if (!OPT.rumble || K.pad == null) return; const g = pads()[K.pad], va = g && g.vibrationActuator;
    try { if (va && va.playEffect) va.playEffect(va.type || 'dual-rumble', { duration: ms || 80, weakMagnitude: weak == null ? .4 : weak, strongMagnitude: strong == null ? .2 : strong }).catch(() => { }); } catch (e) { }
  };
  const NAMES = [['a', 'A  (Aktion)'], ['b', 'B  (Springen)'], ['x', 'X  (Hauen / zweite Aktion)'], ['y', 'Y  (Hallo / Hupe)'], ['start', 'START  (Pause)']];
  const legend = () => { const g = K.glyph; return '🎮 ' + BI.GP_GLYPH[K.kind].name + ': <b>Linker Stick</b> laufen/fahren · <b>' + g('l3') + '</b> / <b>' + g('rt') + '</b> rennen · <b>Rechter Stick</b> Kamera · <b>' + g('r3') + '</b> Kamera hinter dich · <b>' + g('lt') + '</b> Kamera-Abstand · <b>' + g('a') + '</b> Aktion · <b>' + g('b') + '</b> Springen/Turbo · <b>' + g('x') + '</b> zweite Aktion · <b>' + g('y') + '</b> dritte Aktion/Hupe · <b>' + g('rt') + '/' + g('lt') + '</b> im Fahrzeug Gas/Bremse · <b>' + g('start') + '</b> Insel-Menü · <b>' + g('home') + '</b> Insel-Menü · <b>' + g('sel') + '</b> Aufgaben · <b>' + g('pad') + '</b> Karte · <b>Steuerkreuz</b> ↑Wohin ←Spaß →Tasche ↓Aufgaben · <b>' + g('lb') + '</b> Ego-Kamera · <b>' + g('rb') + '</b> Rucksack · In Menüs: Stick/Steuerkreuz bewegt, <b>' + g('a') + '</b> wählt, <b>' + g('b') + '</b> zurück, <b>' + g('lb') + '/' + g('rb') + '</b> Seite, rechter Stick blättert'; };
  const key = id => 'bi-gp-' + id.slice(0, 40);
  const load = id => { try { const m = JSON.parse(localStorage.getItem(key(id)) || 'null'); return m && typeof m === 'object' ? m : null; } catch (e) { return null; } };
  const save = (id, m) => { try { localStorage.setItem(key(id), JSON.stringify(m)); } catch (e) { } };
  const pads = () => { try { return (navigator.getGamepads && navigator.getGamepads()) || []; } catch (e) { return []; } };
  const live = () => { for (const g of pads()) if (g && g.connected) return g; return null; };
  /* ---------- Erkennung + Einrichtung ---------- */
  function setup(g) {
    K.pad = g.index; K.id = g.id; document.body.classList.add('gamepad'); const help = $('gpHelp'); if (help) help.hidden = false;
    const short = (g.id || 'Controller').replace(/\(.*?\)|Vendor:.*|Product:.*/g, '').trim().slice(0, 28) || 'Controller';
    const saved = load(g.id);
    K.mapping = null; applyKind(g); const nm = BI.GP_GLYPH[K.kind].name;
    if (saved) { K.mapping = Object.assign({}, STD, saved); say('🎮 ' + short + ' erkannt – deine Belegung ist geladen.', 3600); }
    else if (g.mapping === 'standard') { say('🎮 ' + nm + '-Controller erkannt! ' + K.glyph('a') + ' = Aktion, ' + K.glyph('b') + ' = Springen, ' + K.glyph('start') + ' = Insel-Menü.', 4800); }
    else startWizard(g, short);
    K.rumble(180, .5, .3); if (G.onPad) G.onPad(true);
    if (G.onPad) G.onPad(true);
  }
  function startWizard(g, short) {
    const w = K.wiz = { step: 0, got: {}, el: document.createElement('div'), t: 0, base: [] }; w.el.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(10,12,34,.88);color:#fff;font-family:Fredoka,system-ui,sans-serif;text-align:center';
    w.el.innerHTML = '<div style="padding:24px;max-width:560px"><div style="font-size:30px;font-weight:800">🎮 ' + short + ' einrichten</div><div id="gpWz" style="font-size:24px;margin:16px 0"></div><div style="font-size:16px;opacity:.8">Drücke die gefragte Taste.</div></div>'; document.body.appendChild(w.el); w.base = Array.from(g.buttons, b => !!b.pressed); wizText();
  }
  const wizText = () => { const w = K.wiz; if (!w) return; $('gpWz').textContent = w.step < NAMES.length ? 'Drücke ' + NAMES[w.step][1] : 'Fertig!'; };
  function wizUpdate(g) {
    const w = K.wiz; if (!w) return false; const now = Array.from(g.buttons, b => !!b.pressed);
    for (let i = 0; i < now.length; i++) if (now[i] && !w.base[i] && w.step < NAMES.length) { if (Object.values(w.got).includes(i)) continue; w.got[NAMES[w.step][0]] = i; w.step++; wizText(); if (w.step >= NAMES.length) { K.mapping = Object.assign({}, STD, w.got); save(g.id, w.got); setTimeout(() => { if (K.wiz) { K.wiz.el.remove(); K.wiz = null; say('🎮 Controller eingerichtet und gespeichert!', 3200); } }, 700); } break; }
    w.base = now; return true;
  }
  addEventListener('gamepadconnected', e => { if (e.gamepad && K.pad == null) setup(e.gamepad); });
  addEventListener('gamepaddisconnected', e => { if (e.gamepad && e.gamepad.index === K.pad) { K.pad = null; document.body.classList.remove('gamepad'); const h = $('gpHelp'); if (h) h.hidden = true; if (K.wiz) { K.wiz.el.remove(); K.wiz = null; } G.setStick(0, 0); inp.turbo = inp.up = inp.down = inp.horn = false; paintGlyphs(); gpBar(null); say('🎮 Controller getrennt – mit der Tastatur oder dem Touch-Bildschirm geht es weiter.', 3600); } });
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
  K.rewire = function () { const g = K.pad == null ? null : pads()[K.pad]; if (!g || !g.connected) { say('🎮 Kein Controller verbunden – schließe einen an und drücke eine Taste.', 3600); return; } try { localStorage.removeItem(key(g.id)); } catch (e) { } K.mapping = null; applyKind(g, true); startWizard(g, (g.id || 'Controller').replace(/\(.*?\)|Vendor:.*|Product:.*/g, '').trim().slice(0, 28) || 'Controller'); };
  K.dbg = { get mapping() { return K.mapping; }, nav, cands, get cur() { return cur; }, applyKind, legend };
  /* ---------- Finger-Zeiger für Tipp-Mini-Spiele: Zeiger-Ereignisse direkt auf die Mini-Spiel-Fläche (wie ein Finger) ---------- */
  const F = { x: -1, y: -1, down: false, el: null, idle: 0 };
  function fingerEv(type) {
    const cv = $('mgCanvas'); if (!cv) return;
    try { cv.dispatchEvent(new PointerEvent(type, { pointerId: 77, pointerType: 'mouse', isPrimary: true, clientX: F.x, clientY: F.y, button: 0, buttons: F.down ? 1 : 0, bubbles: true, cancelable: true })); } catch (e) { }
  }
  function finger(mx, my, press, dt, off) {
    if (off) { if (F.down) { F.down = false; fingerEv('pointerup'); } if (F.el) F.el.style.display = 'none'; F.x = -1; return; }
    if (F.x < 0) { F.x = innerWidth / 2; F.y = innerHeight / 2; }
    if (!F.el) { F.el = document.createElement('div'); F.el.setAttribute('aria-hidden', 'true'); F.el.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:4px solid #fff;background:rgba(255,122,26,.45);box-shadow:0 0 0 2px #000,0 0 16px rgba(255,200,60,.9);pointer-events:none;z-index:99999'; document.body.appendChild(F.el); }
    const sp = Math.min(innerWidth, innerHeight) * 1.35, moved = Math.abs(mx) > .02 || Math.abs(my) > .02;
    if (moved) { F.x = clamp(F.x + mx * Math.abs(mx) * sp * dt * .85 + mx * sp * dt * .25, 0, innerWidth - 1); F.y = clamp(F.y + my * Math.abs(my) * sp * dt * .85 + my * sp * dt * .25, 0, innerHeight - 1); fingerEv('pointermove'); }
    if (press && !F.down) { F.down = true; fingerEv('pointerdown'); } else if (!press && F.down) { F.down = false; fingerEv('pointerup'); }
    F.el.style.display = 'block'; F.el.style.transform = 'translate(' + F.x + 'px,' + F.y + 'px) scale(' + (F.down ? .8 : 1) + ')';
  }
  /* ---------- Hinweisleiste unten (wie auf der Konsole): zeigt, was die Tasten gerade tun ---------- */
  let barEl = null, barTxt = '', barT = 0;
  function gpBar(items) {
    const txt = items && OPT.hints ? items.map(([k, t]) => '<span class="gpk gk-' + k + '">' + K.glyph(k) + '</span>' + t).join('') : '';
    if (txt === barTxt) return; barTxt = txt; if (!barEl) { barEl = document.createElement('div'); barEl.id = 'gpBar'; barEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(barEl); }
    barEl.innerHTML = txt; barEl.hidden = !txt;
  }
  K.bar = gpBar;
  const lab = id => { const e = $(id); if (!e || e.hidden || !e.offsetParent) return null; const s = e.querySelector('small'); return (s ? s.textContent : e.textContent).trim().slice(0, 18); };
  function playBar(veh) {
    const L = []; const a = lab('bAct'), x = lab('bAux'), y = lab('bHorn'), b = lab('bJump');
    if (a) L.push(['a', a]); if (b) L.push(['b', b]); if (x) L.push(['x', x]); if (y) L.push(['y', y]);
    if (veh) L.push(['rt', 'Gas']); else L.push(['rt', 'Rennen']); L.push(['start', 'Menü']); return L;
  }
  /* ---------- Jedes Bild ---------- */
  K.update = function (dt) {
    const g = K.pad == null ? null : pads()[K.pad]; if (!g || !g.connected) { if (K.pad == null) { const l = live(); if (l && (l.buttons.some(b => b.pressed) || l.axes.some(a => Math.abs(a) > .5))) setup(l); } return; }
    if (wizUpdate(g)) return;
    const M = K.mapping || STD, btn = n => { const b = g.buttons[M[n]]; return b ? (b.pressed || b.value > .5) : false; }, tv = n => { const b = g.buttons[M[n]]; return b ? b.value : 0; }, ax = i => g.axes[i] || 0;
    const [lx, ly] = dz(ax(M.lx), ax(M.ly), .2), [rx, ry] = dz(ax(M.rx), ax(M.ry), .2);
    const dl = btn('dl'), dr = btn('dr'), du = btn('du'), dd = btn('dd'), st = G.state(), busy = G.busy(), mini = G.mini && G.mini();
    /* Mini-Spiele: Tasten-Spiele bekommen Pfeiltasten + Leertaste; Tipp-Spiele (Ballons, Wichtel, Memory, Werfen …) einen Finger-Zeiger:
       Stick/Steuerkreuz bewegen ihn, A tippt (halten = ziehen). Tasten-Spiele, die auch Tippen kennen: rechter Stick + X. */
    if (mini && st === 'play') {
      const gm = (G.miniGame && G.miniGame()) || {}, keys = !!gm.keydown, taps = !!(gm.tap || gm.move);
      if (keys) { keyHold('ArrowLeft', lx < -.5 || dl); keyHold('ArrowRight', lx > .5 || dr); keyHold('ArrowUp', ly < -.5 || du); keyHold('ArrowDown', ly > .5 || dd); keyHold('Space', btn('a')); }
      if (taps) {
        let mx = keys ? rx : (Math.abs(rx) > Math.abs(lx) ? rx : lx), my = keys ? ry : (Math.abs(ry) > Math.abs(ly) ? ry : ly);
        if (!keys) { if (dl) mx = -1; if (dr) mx = 1; if (du) my = -1; if (dd) my = 1; }
        const tapBtn = keys ? btn('x') : btn('a');
        finger(mx, my, tapBtn, dt);
      } else finger(0, 0, false, dt, true);
      if (edge('b', btn('b'))) { fire('Escape', 'keydown'); fire('Escape', 'keyup'); } gpBar([['a', keys ? 'Aktion' : 'Tippen'], ['b', 'Beenden']]); return;
    }
    finger(0, 0, false, dt, true);
    for (const c of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']) if (kheld[c]) keyHold(c, false);
    /* Menüs / Fenster: Markierung bewegen */
    if (st !== 'play' || busy) {
      G.setStick(0, 0); inp.turbo = inp.up = inp.down = inp.horn = false; rep -= dt;
      const mx = Math.abs(lx) > .5 || dl || dr ? (lx > .5 || dr ? 1 : -1) : 0, my = Math.abs(ly) > .5 || du || dd ? (ly > .5 || dd ? 1 : -1) : 0;
      if ((mx || my) && rep <= 0) { rep = prev.mv ? .16 : .38; prev.mv = true; if (Math.abs(ly) >= Math.abs(lx) && my || !mx) nav(0, my); else nav(mx, 0); } else if (!mx && !my) { prev.mv = false; rep = 0; }
      if (edge('a', btn('a'))) { if (cur && cur.offsetParent) cur.click(); else nav(0, 1); }
      if (edge('b', btn('b'))) { const ex = $('mgExit'); if (ex && ex.offsetParent) ex.click(); else { fire('Escape', 'keydown'); fire('Escape', 'keyup'); } }
      if (edge('start', btn('start')) || edge('home', btn('home'))) { if (st === 'menu') click('bStart'); else if (!busy) click('bResume'); else { fire('Escape', 'keydown'); fire('Escape', 'keyup'); } }
      if (edge('lb', btn('lb'))) dispatchEvent(new CustomEvent('bi-gp-tab', { detail: -1 })); if (edge('rb', btn('rb'))) dispatchEvent(new CustomEvent('bi-gp-tab', { detail: 1 }));
      if (Math.abs(ry) > .1) { let sc = cur && cur.parentElement; while (sc && sc !== document.body && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement; if (sc && sc !== document.body) sc.scrollTop += ry * dt * 900; }
      cur && !cur.offsetParent && mark(null);
      barT -= dt; if (barT <= 0) { barT = .25; gpBar(st === 'menu' ? [['a', 'Auswählen'], ['start', 'Spielen']] : [['a', 'Auswählen'], ['b', 'Zurück'], ['lb', ''], ['rb', 'Seite']]); }
      return;
    }
    if (cur) mark(null);
    /* Spielen */
    const veh = P.veh, trig = tv('rt') - tv('lt'); let sx = lx, sy = -ly; if (veh && Math.abs(trig) > .06 && Math.abs(sy) < .15) sy = trig;
    G.setStick(sx, sy);
    if (rx || ry) { cam.yaw -= rx * dt * 2.7; cam.pitch = clamp(cam.pitch + ry * dt * 1.5, .12, 1.3); cam.idle = 0; if (cam.ego && veh) cam.egoOff = clamp((cam.egoOff || 0) - rx * dt * 2.7, -1.7, 1.7); }
    /* Auftrag im Fahrzeug (✔ Ja / ✖ Nein): A nimmt an, B lehnt ab */
    { const of = $('mOffer'); if (of && !of.hidden && of.offsetParent) { if (edge('a', btn('a'))) { click('mYes'); return; } if (edge('b', btn('b'))) { click('mNo'); prev.bb = true; return; } } }
    if (edge('a', btn('a'))) { inp.act = true; K.rumble(40, .25, 0); }
    { const b = btn('b'); if (edge('b', b)) { if (veh) inp.turbo = true; inp.up = true; if (!veh) inp.jump = true; } else if (!b && prev.bb) { inp.turbo = false; inp.up = false; } prev.bb = b; }
    { const x = btn('x'); if (edge('x', x)) { inp.aux = true; inp.down = true; } else if (!x && prev.xx) inp.down = false; prev.xx = x; }
    { const y = btn('y'); if (edge('y', y)) { inp.horn = true; inp.hornEdge = true; } else if (!y && prev.yy) inp.horn = false; prev.yy = y; }
    if (edge('start', btn('start')) || edge('home', btn('home'))) click('bPause'); if (edge('sel', btn('sel'))) click('bLog'); if (edge('lb', btn('lb'))) click('bCam');
    if (edge('pad', btn('pad'))) { const m = $('mini'); if (m) m.click(); }
    /* Rennen: L3 schaltet um (wie auf der Konsole), R2 gedrückt halten; im Fahrzeug ist R2 Gas */
    if (edge('l3', btn('l3'))) K.runLock = !K.runLock; if (veh) K.runLock = false;
    { const run = !veh && (K.runLock || tv('rt') > .35); if (run !== !!prev.run) { inp.turbo = run; prev.run = run; } }
    if (edge('r3', btn('r3'))) { cam.yaw = P.h + Math.PI; cam.idle = 0; K.rumble(40, .2, 0); }
    if (!veh && edge('lt', tv('lt') > .5)) cam.zoom = cam.zoom > 1.3 ? .75 : cam.zoom + .35;
    barT -= dt; if (barT <= 0) { barT = .25; gpBar(playBar(veh)); }
    if (edge('du', du)) click('bGuide'); if (edge('dl', dl)) click('bFun'); if (edge('dr', dr)) click('bPack'); if (edge('dd', dd)) click('bLog'); if (edge('rb', btn('rb'))) click('bPack');
  };
  const st = document.createElement('style'); st.textContent = '#gpBar{position:fixed;left:50%;bottom:max(6px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;display:flex;gap:14px;align-items:center;padding:5px 14px;border-radius:999px;background:rgba(18,24,48,.72);color:#fff;font:700 13px Fredoka,system-ui,sans-serif;pointer-events:none;white-space:nowrap;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}#gpBar[hidden]{display:none}#gpBar .gpk{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 5px;margin-right:5px;border-radius:11px;background:#fff;color:#1c2540;font-size:12px;font-weight:900}.gp-ps #gpBar .gk-a{color:#3d7bff}.gp-ps #gpBar .gk-b{color:#e8453c}.gp-ps #gpBar .gk-x{color:#e86ab8}.gp-ps #gpBar .gk-y{color:#2fb07a}.gp-xbox #gpBar .gk-a{background:#4cc05a;color:#fff}.gp-xbox #gpBar .gk-b{background:#e8453c;color:#fff}.gp-xbox #gpBar .gk-x{background:#3f8cff;color:#fff}.gp-xbox #gpBar .gk-y{background:#ffc83a}body.gamepad .abtn::after{display:flex!important;width:auto;min-width:22px;height:22px;padding:0 4px;font-size:13px;top:-6px;left:-6px;box-shadow:0 1px 3px rgba(0,0,0,.4)}.gp-ps .abtn[data-gk=a]::after{color:#3d7bff}.gp-ps .abtn[data-gk=b]::after{color:#e8453c}.gp-ps .abtn[data-gk=x]::after{color:#e86ab8}.gp-ps .abtn[data-gk=y]::after{color:#2fb07a}.gp-xbox .abtn[data-gk=a]::after{background:#4cc05a;color:#fff}.gp-xbox .abtn[data-gk=b]::after{background:#e8453c;color:#fff}.gp-xbox .abtn[data-gk=x]::after{background:#3f8cff;color:#fff}.gp-xbox .abtn[data-gk=y]::after{background:#ffc83a}body.gamepad #joy{opacity:0;pointer-events:none}body.gamepad #gpBar~#rpgDlg,body.gamepad.dlgOpen #gpBar{bottom:auto;top:max(6px,env(safe-area-inset-top))}.gp-focus{outline:5px solid #fff!important;outline-offset:3px;box-shadow:0 0 0 9px #ff7a1a,0 0 22px 12px rgba(255,200,60,.6)!important;border-radius:16px;position:relative;z-index:5}'; document.head.appendChild(st);
  paintGlyphs();
  return K;
};

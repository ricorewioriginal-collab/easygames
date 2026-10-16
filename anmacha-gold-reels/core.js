'use strict';
/* AnMaCha Casino – Grundlagen: Speicher & Guthaben, Sound (im Browser erzeugt), Eingabe (Touch, Maus, Tastatur, Gamepad), Dialoge. */
(function (G) {
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmt = n => Math.round(n).toLocaleString('de-DE');
  const short = n => (n >= 1e6 ? (n / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Mio' : n >= 1e4 ? (n / 1e3).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + 'k' : fmt(n));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Speicher (Schlüssel beginnen mit „agr“, damit der Cloud-Speicher sie mitnimmt) ----------
  const KEY = 'agrCasino', START = 10000;
  const data = { bal: START, snd: true, turbo: false, bets: {}, best: 0, rounds: 0, daily: '', chip: 1 };
  try {
    const old = localStorage.getItem(KEY);
    if (old) Object.assign(data, JSON.parse(old));
    else { const legacy = JSON.parse(localStorage.getItem('agr') || 'null'); if (legacy && legacy.bal >= 0) { data.bal = Math.round(legacy.bal); data.snd = legacy.snd !== false; } }
  } catch (e) { /* leerer Start */ }
  if (!(data.bal >= 0) || !isFinite(data.bal)) data.bal = START;
  let saveT = 0;
  const persist = () => { clearTimeout(saveT); saveT = 0; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* privater Modus */ } };
  const save = () => { if (!saveT) saveT = setTimeout(persist, 400); };
  addEventListener('pagehide', persist); document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });

  // Guthaben: Gewinne werden sofort gutgeschrieben; die Anzeige darf hinterherlaufen (pending), bis die Animation fertig ist
  const listeners = new Set();
  const wallet = {
    START,
    get bal() { return data.bal; },
    shown: data.bal,
    can: x => data.bal >= x,
    take(x) { if (x <= 0 || data.bal < x) return false; data.bal -= x; wallet.shown = Math.min(wallet.shown, data.bal); data.rounds++; save(); wallet.emit(); return true; },
    give(x, hold) { if (x <= 0) return; data.bal += Math.round(x); if (!hold) wallet.shown = data.bal; if (x > data.best) data.best = Math.round(x); save(); wallet.emit(); },
    reveal(x) { wallet.shown = x == null ? data.bal : Math.min(data.bal, wallet.shown + x); wallet.emit(); },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    emit() { listeners.forEach(f => f(wallet.shown)); },
    refill() { data.bal += START; wallet.shown = data.bal; save(); wallet.emit(); }
  };

  // ---------- Sound (WebAudio, alles synthetisch) ----------
  let ac = null, master = null, noiseBuf = null, whirr = null;
  const sound = {
    get on() { return data.snd; },
    set on(v) { data.snd = !!v; save(); if (master) master.gain.value = v ? 0.55 : 0; if (!v) sound.whirr(false); },
    unlock() {
      if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
      const AC = G.AudioContext || G.webkitAudioContext; if (!AC) return;
      try { ac = new AC(); } catch (e) { return; }
      master = ac.createGain(); master.gain.value = data.snd ? 0.55 : 0; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    },
    tone(f, t0, dur, type, vol, f2) {
      if (!ac || !data.snd) return; const t = ac.currentTime + (t0 || 0);
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    },
    noise(t0, dur, freq, q, vol) {
      if (!ac || !data.snd) return; const t = ac.currentTime + (t0 || 0);
      const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
      const g = ac.createGain(); g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
    },
    whirr(on) {
      if (!ac) return;
      if (on && data.snd && !whirr) {
        const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
        const g = ac.createGain(); g.gain.value = 0.05; s.connect(f); f.connect(g); g.connect(master); s.start(); whirr = { s, g };
      } else if (!on && whirr) { const w = whirr; whirr = null; try { w.g.gain.setTargetAtTime(0, ac.currentTime, 0.03); w.s.stop(ac.currentTime + 0.15); } catch (e) { /* schon gestoppt */ } }
    },
    play(name, arg) {
      if (!ac || !data.snd) return;
      const T = sound.tone, N = sound.noise;
      switch (name) {
        case 'click': T(880, 0, 0.05, 'square', 0.05); break;
        case 'nav': T(660, 0, 0.03, 'sine', 0.05); break;
        case 'spin': T(220, 0, 0.12, 'sawtooth', 0.06, 440); break;
        case 'stop': T(150, 0, 0.09, 'sine', 0.25, 55); N(0, 0.05, 3000, 2, 0.06); break;
        case 'tease': T(520, 0, 0.25, 'triangle', 0.08, 1040); break;
        case 'win': { const s = [523, 659, 784, 1047]; s.forEach((f, i) => T(f, i * 0.07, 0.16, 'triangle', 0.12)); break; }
        case 'line': T(784 + (arg || 0) * 60, 0, 0.12, 'triangle', 0.08); break;
        case 'coin': T(1568, 0, 0.06, 'square', 0.05); T(2093, 0.05, 0.08, 'square', 0.05); break;
        case 'count': T(1200 + Math.random() * 300, 0, 0.04, 'square', 0.03); break;
        case 'big': { const s = [392, 523, 659, 784, 1047, 1319, 1568]; s.forEach((f, i) => { T(f, i * 0.09, 0.3, 'sawtooth', 0.07); T(f / 2, i * 0.09, 0.3, 'triangle', 0.08); }); break; }
        case 'feature': for (let i = 0; i < 8; i++) T(400 + i * 120, i * 0.06, 0.12, 'square', 0.06); break;
        case 'lose': T(300, 0, 0.18, 'triangle', 0.08, 180); break;
        case 'card': N(0, 0.08, 4500, 1.2, 0.18); break;
        case 'chip': T(2400, 0, 0.03, 'square', 0.05); N(0, 0.04, 6000, 3, 0.1); break;
        case 'ball': N(0, 0.05, 3500 + Math.random() * 1500, 6, 0.12); break;
        case 'tick': N(0, 0.025, 5000, 4, 0.15); break;
        case 'lock': T(988, 0, 0.1, 'triangle', 0.14); T(1319, 0.06, 0.16, 'triangle', 0.12); break;
      }
    }
  };
  addEventListener('pointerdown', () => sound.unlock(), { passive: true });
  addEventListener('keydown', () => sound.unlock());

  // ---------- Eingabe ----------
  let screen = null;           // aktive Bildschirm-Steuerung { root, primary, secondary, betDown, betUp, info, back, key }
  const modals = [];
  let focused = null;
  const navRoot = () => (modals.length ? modals[modals.length - 1].el : screen && screen.root);
  const visible = e => { if (e.disabled || e.hidden || e.closest('[hidden]')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight + 400; };
  const candidates = () => { const r = navRoot(); return r ? [...r.querySelectorAll('[data-nav]')].filter(visible) : []; };
  const setFocus = (e, scroll) => {
    if (focused) focused.classList.remove('kfocus');
    focused = e || null;
    if (focused) { focused.classList.add('kfocus'); if (scroll !== false) focused.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
  };
  const ensureFocus = () => {
    const c = candidates();
    if (focused && c.includes(focused)) return focused;
    const pref = c.find(e => e.hasAttribute('data-default')) || c[0];
    setFocus(pref); return pref;
  };
  const move = dir => {
    const c = candidates(); if (!c.length) return;
    if (!focused || !c.includes(focused)) { ensureFocus(); return; }
    const a = focused.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bd = Infinity;
    for (const e of c) {
      if (e === focused) continue;
      const b = e.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2, dx = bx - ax, dy = by - ay;
      const main = dir === 'left' ? -dx : dir === 'right' ? dx : dir === 'up' ? -dy : dy;
      const side = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
      if (main <= 4) continue;
      const d = main + side * 2.2;
      if (d < bd) { bd = d; best = e; }
    }
    if (best) { setFocus(best); sound.play('nav'); }
  };
  const activate = () => { const f = ensureFocus(); if (f) { f.classList.add('press'); setTimeout(() => f.classList.remove('press'), 120); f.click(); } };
  const act = (name, ev) => {
    if (modals.length) {
      const m = modals[modals.length - 1];
      if (name === 'back') { if (m.onBack) m.onBack(); return true; }
      if (name === 'primary' || name === 'activate') { activate(); return true; }
      return false;
    }
    if (!screen) return false;
    if (name === 'activate') { if (focused && candidates().includes(focused)) activate(); else if (screen.primary) screen.primary(); return true; }
    if (screen[name]) { screen[name](ev); return true; }
    return false;
  };
  const kbdMode = on => document.body.classList.toggle('kbd', on);
  addEventListener('pointerdown', () => kbdMode(false), { passive: true });
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (screen && screen.key && !modals.length && screen.key(e)) { e.preventDefault(); return; }
    const k = e.key;
    let handled = true;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') { kbdMode(true); move(k.slice(5).toLowerCase()); }
    else if (k === 'Enter') { kbdMode(true); act('activate'); }
    else if (k === ' ') act('primary');
    else if (k === 'Escape' || k === 'Backspace') act('back');
    else if (k === '+' || k === '=') act('betUp');
    else if (k === '-') act('betDown');
    else if (k === 'i' || k === 'I') act('info');
    else if (k === 'a' || k === 'A') act('secondary');
    else if (k === 'm' || k === 'M') G.Casino && G.Casino.toggleSound();
    else handled = false;
    if (handled) e.preventDefault();
  });

  // Gamepad: nur abfragen, wenn einer verbunden ist
  const pads = { active: false, prev: [], rep: {}, raf: 0 };
  const BTN = { 0: 'activate', 1: 'back', 2: 'secondary', 3: 'info', 4: 'betDown', 5: 'betUp', 7: 'primary', 9: 'primary', 8: 'mute' };
  const pollPads = now => {
    pads.raf = 0;
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    let any = false;
    for (const gp of list) {
      if (!gp || !gp.connected) continue; any = true;
      const prev = pads.prev[gp.index] || [];
      const pressed = gp.buttons.map(b => b.pressed || b.value > 0.5);
      for (const i in BTN) if (pressed[i] && !prev[i]) {
        kbdMode(true); sound.unlock();
        if (BTN[i] === 'mute') { if (G.Casino) G.Casino.toggleSound(); } else act(BTN[i]);
      }
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const dirs = { up: pressed[12] || ay < -0.55, down: pressed[13] || ay > 0.55, left: pressed[14] || ax < -0.55, right: pressed[15] || ax > 0.55 };
      for (const d in dirs) {
        const key = gp.index + d;
        if (dirs[d]) {
          if (!pads.rep[key]) { pads.rep[key] = now + 380; kbdMode(true); if (!(screen && screen.pad && !modals.length && screen.pad(d))) move(d); }
          else if (now > pads.rep[key]) { pads.rep[key] = now + 130; if (!(screen && screen.pad && !modals.length && screen.pad(d))) move(d); }
        } else delete pads.rep[key];
      }
      pads.prev[gp.index] = pressed;
    }
    pads.active = any;
    if (any) pads.raf = requestAnimationFrame(pollPads);
  };
  addEventListener('gamepadconnected', () => { if (!pads.raf) pads.raf = requestAnimationFrame(pollPads); toast('🎮 Controller verbunden'); });
  addEventListener('gamepaddisconnected', () => { pads.prev = []; pads.rep = {}; });

  const input = {
    setScreen(s) { screen = s; setFocus(null); if (document.body.classList.contains('kbd')) setTimeout(ensureFocus, 50); },
    focus: setFocus, ensureFocus, move,
    get screen() { return screen; }
  };

  // ---------- Dialoge & Hinweise ----------
  function modal(html, opt) {
    opt = opt || {};
    return new Promise(res => {
      const wrap = el('div', 'modal' + (opt.cls ? ' ' + opt.cls : '')); const box = el('div', 'mbox glass', html); wrap.appendChild(box);
      const btns = el('div', 'mbtns');
      (opt.buttons || [{ label: 'OK', value: true }]).forEach((b, i) => {
        const x = el('button', 'btn' + (b.cls ? ' ' + b.cls : (i === 0 ? ' gold' : '')), b.label); x.setAttribute('data-nav', ''); if (i === 0) x.setAttribute('data-default', '');
        x.onclick = () => close(b.value); btns.appendChild(x);
      });
      box.appendChild(btns);
      const m = { el: wrap, onBack: () => close(opt.backValue != null ? opt.backValue : null) };
      function close(v) { const i = modals.indexOf(m); if (i >= 0) modals.splice(i, 1); wrap.remove(); setFocus(null); if (document.body.classList.contains('kbd')) setTimeout(ensureFocus, 30); sound.play('click'); res(v); }
      m.close = close; modals.push(m); document.body.appendChild(wrap); setFocus(null);
      if (opt.onOpen) opt.onOpen(box, close);
      if (document.body.classList.contains('kbd')) ensureFocus();
      wrap.addEventListener('click', e => { if (e.target === wrap && opt.dismiss !== false) close(opt.backValue != null ? opt.backValue : null); });
    });
  }
  // eigene Ebene (z. B. Big Win) in die Eingabe einreihen; liefert eine Funktion zum Entfernen
  function layer(elm, onBack) {
    const m = { el: elm, onBack }; modals.push(m); setFocus(null);
    if (document.body.classList.contains('kbd')) setTimeout(ensureFocus, 30);
    return () => { const i = modals.indexOf(m); if (i >= 0) modals.splice(i, 1); setFocus(null); if (document.body.classList.contains('kbd')) setTimeout(ensureFocus, 30); };
  }
  let toastT = 0;
  function toast(msg, ms) {
    let t = $('#toast'); if (!t) { t = el('div', 'toast'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms || 2200);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  G.CasinoCore = { $, el, fmt, short, clamp, esc, data, save, persist, wallet, sound, input, modal, layer, toast, wait, get modalOpen() { return modals.length > 0; } };
})(window);

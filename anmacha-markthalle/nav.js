'use strict';
/* Konsolen-Bedienung für Marktrausch – ein Fokus für alle Fenster, egal ob Tastatur, Controller (über ../gamepad.js, das die
   Knöpfe als Tasten schickt) oder TV-Fernbedienung (Pfeile, OK, Zurück):
     Steuerkreuz/Stick/Pfeile wählen räumlich, A/Enter/OK bestätigt, B/Esc/Zurück schließt, LB/RB bzw. Q/E wechseln Reiter,
     Tab springt der Reihe nach. Ein Leuchtrahmen zeigt die Auswahl, unten stehen die passenden Knopf-Hinweise
     (Kenney Input Prompts, CC0 – je nach Controller Xbox, PlayStation oder Switch; sonst Tastenkappen).
   Maus und Touch funktionieren unverändert; der Rahmen erscheint erst wieder bei Tasten- oder Controller-Eingabe.
   Das Hauptmenü (menu.js) führt sich selbst. */
(() => {
  const G = window.__amh; if (!G) return;
  const $ = id => document.getElementById(id), B = document.body, H = document.documentElement;
  // Fenster von oben nach unten: das oberste sichtbare bekommt den Fokus
  const LAYERS = [
    { id: 'namebox', sel: '#namebox', first: '#nok' },
    { id: 'idov', sel: '#idov' },
    { id: 'payov', sel: '#payov', first: '[data-a="pd"]' },
    { id: 'cardov', sel: '#cardov', first: '[data-k="1"]' },
    { id: 'sum', sel: '#sum', first: '#nd' },
    { id: 'panel', sel: '#panel', back: '#px' },
    { id: 'more', sel: '#more', back: '[data-m="x"]' },
    { id: 'card', sel: '#card', back: '[data-a="cx"]', when: () => B.classList.contains('cardnav') && !G.building() }
  ];
  const FOC = 'button,input:not([type=hidden]),select,textarea,a[href],.sw,[tabindex]:not([tabindex="-1"])';
  let L = null, cur = null, curSig = '', curRect = null, navOn = false, raf = 0;

  // ---------- Töne (Kenney UI Audio, CC0) ----------
  const SND = {}; let AC = null;
  function snd(n) {
    if (!G.sound()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const play = buf => { const s = AC.createBufferSource(), g = AC.createGain(); g.gain.value = n === 'move' ? .35 : .5; s.buffer = buf; s.connect(g); g.connect(AC.destination); s.start(); };
      if (SND[n] && SND[n].buf) return play(SND[n].buf);
      if (!SND[n]) SND[n] = { p: fetch('assets/sfx/' + n + '.mp3').then(r => r.arrayBuffer()).then(a => new Promise((ok, no) => AC.decodeAudioData(a, ok, no))).then(b => { SND[n].buf = b; return b; }).catch(() => null) };
      SND[n].p.then(b => { if (b && n !== 'move') play(b); });
    } catch (e) { }
  }

  // ---------- Hilfen ----------
  const vis = e => !!e && e.isConnected && e.getClientRects().length > 0 && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden';
  const sig = e => e ? [e.tagName, e.id, e.dataset.a, e.dataset.v, e.dataset.p, e.dataset.n, e.dataset.k, e.dataset.m, e.dataset.i].join('|') : '';
  const typing = e => !!e && (e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/.test(e.type)));
  function items() { return L ? [...L.el.querySelectorAll(FOC)].filter(vis) : []; }
  function layer() {
    if (B.classList.contains('mm')) return null;
    for (const d of LAYERS) { const el = document.querySelector(d.sel); if (el && !el.hidden && vis(el) && (!d.when || d.when())) return Object.assign({ el }, d); }
    return null;
  }
  function firstOf(l) {
    const list = items();
    if (l.first) { const f = l.el.querySelector(l.first); if (f && vis(f)) return f; }
    const ok = e => !e.disabled && !e.closest('.tabs') && !e.matches(l.back || 'x-none');
    return list.find(e => e.classList.contains('go') && ok(e)) || list.find(e => ok(e) && e.tagName === 'BUTTON') || list.find(ok) || list[0] || null;
  }
  function setCur(e, quiet) {
    if (cur && cur !== e) cur.classList.remove('nav-focus');
    cur = e || null; curSig = sig(cur);
    if (!cur) { curRect = null; return; }
    cur.classList.add('nav-focus'); curRect = cur.getBoundingClientRect();
    if (navOn) try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { }
    if (!quiet) snd('move');
  }
  // Fenster neu gezeichnet (refresh): dieselbe Schaltfläche wiederfinden, sonst die nächstgelegene
  function restore() {
    const list = items(); if (!list.length) { setCur(null); return; }
    const same = list.filter(e => sig(e) === curSig);
    const near = (l) => { if (!curRect || !l.length) return l[0]; const cx = curRect.left + curRect.width / 2, cy = curRect.top + curRect.height / 2; let b = l[0], bd = Infinity; l.forEach(e => { const r = e.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy); if (d < bd) { bd = d; b = e; } }); return b; };
    setCur(near(same.length ? same : list), true);
  }
  function sync() {
    raf = 0; const l = layer();
    if (!l) { if (cur) cur.classList.remove('nav-focus'); L = null; cur = null; if (!$('card') || $('card').hidden) B.classList.remove('cardnav'); bar(); return; }
    if (!L || L.el !== l.el) { L = l; if (cur) cur.classList.remove('nav-focus'); cur = null; setCur(firstOf(l), true); }
    else if (!cur || !cur.isConnected || !L.el.contains(cur) || !vis(cur)) restore();
    else if (!cur.classList.contains('nav-focus')) cur.classList.add('nav-focus');
    bar();
  }
  const later = () => { if (!raf) raf = requestAnimationFrame(sync); };
  new MutationObserver(later).observe(B, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class'] });

  // ---------- Räumliche Auswahl ----------
  function move(dir) {   // 0 hoch, 1 runter, 2 links, 3 rechts
    const list = items(); if (!list.length) return;
    if (!cur || !list.includes(cur)) { setCur(firstOf(L)); return; }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    const gap = (p0, p1, q0, q1) => Math.max(0, Math.max(p0, q0) - Math.min(p1, q1));
    let best = null, bs = Infinity;
    for (const e of list) {
      if (e === cur) continue; const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let main, side;
      if (dir === 0) { if (cy >= ay - 2 || r.top >= a.top) continue; main = Math.max(0, a.top - r.bottom); side = gap(r.left, r.right, a.left, a.right); }
      else if (dir === 1) { if (cy <= ay + 2 || r.bottom <= a.bottom) continue; main = Math.max(0, r.top - a.bottom); side = gap(r.left, r.right, a.left, a.right); }
      else if (dir === 2) { if (cx >= ax - 2 || r.left >= a.left) continue; main = Math.max(0, a.left - r.right); side = gap(r.top, r.bottom, a.top, a.bottom); }
      else { if (cx <= ax + 2 || r.right <= a.right) continue; main = Math.max(0, r.left - a.right); side = gap(r.top, r.bottom, a.top, a.bottom); }
      const s = main + side * 4 + (dir < 2 ? Math.abs(cx - ax) : Math.abs(cy - ay)) * .05;
      if (s < bs) { bs = s; best = e; }
    }
    if (best) { setCur(best); return; }
    // nichts mehr in dieser Richtung: Text darunter/darüber lesbar machen (lange Fenster scrollen)
    if (dir < 2) { const sc = scroller(cur); if (sc) sc.scrollBy({ top: (dir ? 1 : -1) * Math.max(80, sc.clientHeight * .4), behavior: 'smooth' }); }
  }
  function scroller(e) { for (let p = e && e.parentElement; p && p !== B; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 4) return p; } return null; }
  function step(d) { const list = items(); if (!list.length) return; const i = list.indexOf(cur); setCur(list[(i + d + list.length) % list.length]); }
  function tab(d) {
    const t = L && L.el.querySelector('.tabs'); if (!t) return false;
    const bs = [...t.querySelectorAll('button')].filter(vis); if (bs.length < 2) return false;
    const i = Math.max(0, bs.findIndex(b => b.classList.contains('on'))), n = bs[(i + d + bs.length) % bs.length];
    setCur(n, true); curSig = sig(n); n.click(); snd('tab'); later(); return true;
  }
  function activate(e) {
    if (!e) return;
    if (e.disabled) { G.sfx.bad(); return; }
    if (typing(e) || e.tagName === 'SELECT') { e.focus(); return; }   // gamepad.js öffnet dazu die Bildschirmtastatur
    if (e.tagName === 'INPUT' && e.type === 'range') return;
    snd('ok'); e.click(); later();
  }
  function back() {
    const b = L && L.back && L.el.querySelector(L.back);
    if (b && vis(b)) { snd('back'); b.click(); later(); return true; }
    return false;
  }
  function range(e, d) { const st = +e.step || 1, v = Math.max(+e.min || 0, Math.min(+e.max || 100, +e.value + d * Math.max(st, 5))); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }

  // ---------- Eingabe ----------
  const BACKKEYS = ['GoBack', 'BrowserBack', 'Back'], isBack = e => BACKKEYS.includes(e.key) || e.keyCode === 10009 || e.keyCode === 461;
  function setNav(on) { if (on === navOn) return; navOn = on; B.classList.toggle('navkb', on); if (on && cur) try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { } bar(); }
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // TV-Fernbedienung „Zurück“ wirkt wie Esc (Fenster zu, sonst Pausemenü)
    if (isBack(e)) { e.preventDefault(); e.stopImmediatePropagation(); setNav(true); if (!L || !back()) { const k = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true }); (document.activeElement || B).dispatchEvent(k); } return; }
    if (B.classList.contains('mm')) return;
    sync(); if (!L) return;
    const k = e.key, ae = document.activeElement, inField = typing(ae) && L.el.contains(ae), pad = !e.isTrusted;
    const eat = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    // Textfeld: hoch/runter/Tab verlassen es, Enter bestätigt, Esc verlässt nur das Feld
    if (inField) {
      if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'Tab' || k === 'Enter' || k === 'Escape') {
        eat(); ae.blur(); setNav(true); if (cur !== ae) setCur(ae, true);
        if (k === 'ArrowUp') move(0); else if (k === 'ArrowDown' || k === 'Enter') move(1); else if (k === 'Tab') step(e.shiftKey ? -1 : 1);
      }
      return;
    }
    if (L.id === 'cardov' && (/^[0-9]$/.test(k) || k === 'Backspace' || k === 'Delete' || k === 'Escape' || (k === 'Enter' && e.isTrusted))) return;   // Terminal: Ziffern/Enter von der Tastatur direkt (game.js)
    const dir = { ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3 }[k];
    if (dir !== undefined) {
      eat(); if (!navOn) { setNav(true); if (cur) return; }
      if (cur && cur.tagName === 'INPUT' && cur.type === 'range' && dir > 1) { range(cur, dir === 2 ? -1 : 1); return; }
      move(dir); return;
    }
    if (k === 'Enter' || k === ' ') { eat(); if (e.repeat) return; setNav(true); activate(cur); return; }
    if (k === 'Tab') { eat(); setNav(true); step(e.shiftKey ? -1 : 1); return; }
    if (k === 'Home' || k === 'End') { eat(); const l = items(); setNav(true); setCur(k === 'Home' ? l[0] : l[l.length - 1]); return; }
    // Reiter: LB/RB (vom Controller als V/R), Q/E, Bild↑/Bild↓
    const kl = (k || '').toLowerCase();
    if (k === 'PageUp' || (kl === 'q' && !pad) || (kl === 'v' && pad)) { if (tab(-1)) eat(); return; }
    if (k === 'PageDown' || (kl === 'e' && !pad) || (kl === 'r' && pad)) { if (tab(1)) eat(); return; }
    if (k === 'Escape' || (k === 'Backspace' && L.id !== 'cardov')) { if (L.back) { eat(); if (!e.repeat) back(); } return; }
    if (L.id === 'card' && kl === 'f') { eat(); if (!e.repeat) back(); }   // Y/F nochmal: Karte zu
    if (L.id === 'more' && kl === 'c') { eat(); if (!e.repeat) back(); }   // X/C nochmal: Befehlsmenü zu

  }, true);
  // Tasten, die der Fokus verarbeitet hat, auch beim Loslassen schlucken (sonst löst ein Knopf mit echtem Fokus doppelt aus)
  addEventListener('keyup', e => { if (L && !B.classList.contains('mm') && (e.key === ' ' || e.key === 'Enter') && !typing(document.activeElement)) e.preventDefault(); }, true);
  // Maus/Touch: Rahmen ausblenden, Mauszeiger setzt die Auswahl mit (Wechsel zur Tastatur geht dort weiter)
  addEventListener('pointerdown', e => { if (e.isTrusted && !B.classList.contains('tv')) setNav(false); }, true);
  addEventListener('pointermove', e => {
    if (!e.isTrusted || e.pointerType !== 'mouse' || !L) return;
    if (navOn && !B.classList.contains('tv') && (Math.abs(e.movementX) + Math.abs(e.movementY) > 6)) setNav(false);
    const t = e.target.closest && e.target.closest(FOC); if (t && t !== cur && L.el.contains(t)) setCur(t, true);
  }, { passive: true });
  addEventListener('easygames:pad', e => { if (e.detail && e.detail.on) setNav(true); bar(); });
  // Linker Stick wählt in Fenstern und im Hauptmenü wie das Steuerkreuz (im Spiel läuft man damit – gamepad.js schickt ihn
  // dort bewusst nicht als Pfeiltasten), gehaltene Richtung wiederholt; rechter Stick scrollt lange Fenster.
  let rep = { d: -1, t: 0 }, padT = 0;
  function padLoop(t) {
    requestAnimationFrame(padLoop); if (t - padT < 30) return; const dt = Math.min(.1, (t - padT) / 1000); padT = t;
    const mm = B.classList.contains('mm'); if (!L && !mm) { rep.d = -1; return; }
    let l = []; try { l = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; } catch (e) { }
    if (!l.length) return;
    let x = 0, y = 0, rx = 0, ry = 0, dp = -1;
    l.forEach(g => { const a = g.axes || [], b = g.buttons || []; if (Math.abs(a[0] || 0) > Math.abs(x)) x = a[0]; if (Math.abs(a[1] || 0) > Math.abs(y)) y = a[1]; if (Math.abs(a[3] || 0) > Math.abs(ry)) ry = a[3]; if (Math.abs(a[2] || 0) > Math.abs(rx)) rx = a[2]; for (let i = 12; i < 16; i++) if (b[i] && b[i].pressed) dp = [0, 1, 2, 3][i - 12]; });
    const st = L && L.id === 'card' ? -1 : Math.max(Math.abs(x), Math.abs(y)) > .6 ? (Math.abs(y) >= Math.abs(x) ? (y < 0 ? 0 : 1) : (x < 0 ? 2 : 3)) : -1;
    const d = st >= 0 ? st : dp, fromStick = st >= 0;
    if (d < 0) rep.d = -1;
    else if (d !== rep.d) { rep = { d, t: t + 380 }; if (fromStick) fire(d, mm); }   // Steuerkreuz: erster Druck kommt als Taste von gamepad.js
    else if (t >= rep.t) { rep.t = t + 120; fire(d, mm); }
    if (!mm && L && Math.abs(ry) > .25) { const sc = scroller(cur || L.el.querySelector(FOC)) || (L.el.querySelector('#pb')); if (sc) sc.scrollTop += ry * dt * 900; }
  }
  function fire(d, mm) {
    const k = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][d];
    if (mm) { (document.activeElement || B).dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true, cancelable: true })); return; }
    setNav(true); if (cur && cur.tagName === 'INPUT' && cur.type === 'range' && d > 1) range(cur, d === 2 ? -1 : 1); else move(d);
  }
  requestAnimationFrame(padLoop);

  // ---------- Knopf-Hinweise (unten) ----------
  const IMG = {
    xbox: { A: 'xbox_a', B: 'xbox_b', X: 'xbox_x', Y: 'xbox_y', LB: 'xbox_lb', RB: 'xbox_rb', LT: 'xbox_lt', '⧉': 'xbox_view', '☰': 'xbox_menu', '✚': 'xbox_dpad', 'L-Stick': 'xbox_stick_l', 'R-Stick': 'xbox_stick_r' },
    ps: { '✕': 'ps_cross', '○': 'ps_circle', '□': 'ps_square', '△': 'ps_triangle', L1: 'ps_l1', R1: 'ps_r1', L2: 'ps_l2', Create: 'ps_create', Options: 'ps_options', '✚': 'ps_dpad', 'L-Stick': 'ps_stick_l' },
    switch: { A: 'sw_a', B: 'sw_b', X: 'sw_x', Y: 'sw_y', L: 'sw_l', R: 'sw_r', ZL: 'sw_zl', '+': 'sw_plus', '−': 'sw_minus', '✚': 'sw_dpad', 'L-Stick': 'sw_stick_l' }
  };
  const padOn = () => !!(window.EasyGamesPad && EasyGamesPad.active());
  function glyph(p, kb) {
    if (padOn() && p) {
      const N = window.EasyGamesPadNormal, kind = N && N.kind ? N.kind() : 'xbox', t = EasyGamesPad.glyph(p), f = (IMG[kind] || IMG.xbox)[t];
      return f ? `<img class="gl" src="assets/prompts/${f}.svg" alt="${t}">` : `<kbd>${t}</kbd>`;
    }
    return kb ? `<kbd>${kb}</kbd>` : '';
  }
  G.glyph = glyph;
  function prompts() {
    const kn = G.keyName;
    if (L) {
      const l = [['dpad', '↑↓←→', 'Wählen'], ['a', 'Enter', L.id === 'sum' ? 'Weiter' : 'Auswählen']];
      if (L.el.querySelector('.tabs')) l.push(['lb', 'Q', ''], ['rb', 'E', 'Reiter']);
      if (L.back) l.push(['b', 'Esc', L.id === 'card' ? 'Zurück ins Spiel' : 'Schließen']);
      if (L.id === 'cardov') l.push([null, '0–9', 'Betrag']);
      return l;
    }
    if (!(padOn() || B.classList.contains('tv'))) return null;
    if (!padOn()) return [['dpad', '↑↓←→', 'Laufen'], [null, 'OK', 'Aktion'], [null, 'Zurück', 'Menü & Befehle'], [null, 'Tab', 'Befehle']];   // TV-Fernbedienung / Tastatur am TV
    if (G.building()) return [['dpad', '↑↓←→', 'Feld wählen'], ['a', 'Enter', 'Setzen'], ['rb', kn('r'), 'Drehen'], ['b', 'Esc', 'Fertig']];
    return [['x', kn('c'), 'Befehle'], ['a', kn('e'), 'Aktion'], ['y', kn('f'), 'Ansehen'], ['lb', kn('v'), 'Ansicht'], ['select', kn('o'), G.phaseLabel()], ['start', 'Esc', 'Pause']];
  }
  const nb = document.createElement('div'); nb.id = 'navbar'; nb.setAttribute('aria-hidden', 'true'); nb.hidden = true; B.appendChild(nb); let nbH = '';
  function bar() {
    const on = !B.classList.contains('mm') && (navOn || padOn() || B.classList.contains('tv')), l = on ? prompts() : null;
    const h = l ? l.map(([p, kb, t]) => `<span>${glyph(p, kb)}${t ? `<b>${t}</b>` : ''}</span>`).join('') : '';
    if (h !== nbH) { nbH = h; nb.innerHTML = h; }
    nb.hidden = !h; B.classList.toggle('navbar', !!h); nb.classList.toggle('ingame', !!h && !L);
  }
  setInterval(() => { if (!L) bar(); }, 700);   // Phase/Baumodus/Controller-Art im Spiel aktuell halten
  G.nav = { sync, on: () => navOn, set: setNav };
  sync();
})();

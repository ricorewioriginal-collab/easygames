'use strict';
/* Konsolen-Bedienung für alle Menüs: Gamepad (PlayStation, Nintendo, Xbox), Tastatur und TV-Fernbedienung.
   Ein Leuchtrahmen wandert mit Steuerkreuz/Stick/Pfeiltasten über die Knöpfe der obersten Ebene, Bestätigen klickt,
   Zurück drückt den sichtbaren .nav-back-Knopf, L/R blättert durch Reiter ([data-tabs]). Dazu Tastensymbole je Controller-Art
   und Vibration (Gamepad-Rumble bzw. Handy-Vibration). Ohne Controller läuft keine Schleife. */
const Nav = self.Nav = (() => {
  const LAYERS = ['err', 'pause', 'res', 'top', 'joinBox', 'lobby', 'opts', 'menu'];
  // Schlüssel nach Position (Standard-Layout): a unten, b rechts, x links, y oben
  const GLYPH = {
    xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', l: 'LB', r: 'RB', lt: 'LT', rt: 'RT', st: '☰', se: '⧉', name: 'Xbox' },
    ps: { a: '✕', b: '○', x: '□', y: '△', l: 'L1', r: 'R1', lt: 'L2', rt: 'R2', st: 'OPTIONS', se: 'SHARE', name: 'PlayStation' },
    nin: { a: 'B', b: 'A', x: 'Y', y: 'X', l: 'L', r: 'R', lt: 'ZL', rt: 'ZR', st: '+', se: '−', name: 'Nintendo' }
  };
  let style = 'xbox', cur = null, ring = false, mode = 'touch', loop = 0, last = {}, rep = { dir: '', t: 0 }, racing = () => false, hintFn = null;
  const styleOf = id => /054c|playstation|dualsense|dualshock|ps[345]|wireless controller/i.test(id) ? 'ps' : /057e|nintendo|pro controller|joy-?con|switch/i.test(id) ? 'nin' : 'xbox';
  const pads = () => { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean); } catch (e) { return []; } };
  // Nintendo: Bestätigen rechts (A), Zurück unten (B) – wie an der Switch; sonst unten bestätigen
  const confirmIdx = () => style === 'nin' ? 1 : 0, backIdx = () => style === 'nin' ? 0 : 1;
  const vis = el => { if (!el || el.hidden || el.disabled) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && el.offsetParent !== null; };
  function scope() {
    for (const id of LAYERS) { const el = document.getElementById(id); if (el && !el.hidden) return el; }
    return null;
  }
  const items = sc => sc ? Array.from(sc.querySelectorAll('button,input,summary,[data-nav]')).filter(vis) : [];
  function setMode(m) {
    if (mode === m) return; mode = m; document.documentElement.classList.toggle('nav-pad', m === 'pad'); document.documentElement.classList.toggle('nav-key', m === 'key');
    if (m === 'touch') blur(); hints();
  }
  function blur() { if (cur) cur.classList.remove('pf'); cur = null; ring = false; }
  function focus(el) {
    if (!el) return; if (cur && cur !== el) cur.classList.remove('pf'); cur = el; ring = true; el.classList.add('pf');
    try { if (el.tagName !== 'INPUT') el.focus({ preventScroll: true }); } catch (e) {}
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(false); }
    if (window.AUD && AUD.sfx && AUD.sfx.tick) AUD.sfx.tick();
  }
  // Erster sinnvoller Knopf: [data-nav-first] / ausgewählter Eintrag (.on) / großer Hauptknopf
  function first(sc) {
    const its = items(sc); return its.find(e => e.matches('[data-nav-first]')) || its.find(e => e.classList.contains('on') && !e.closest('[data-tabs]')) || its.find(e => e.classList.contains('big')) || its[0];
  }
  function ensure() { const sc = scope(); if (!sc) { blur(); return null; } if (!cur || !sc.contains(cur) || !vis(cur)) focus(first(sc)); return sc; }
  function move(dir) {
    const sc = scope(); if (!sc) return;
    if (!ring || !cur || !sc.contains(cur) || !vis(cur)) { focus(first(sc)); return; }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, dx = dir === 'l' ? -1 : dir === 'r' ? 1 : 0, dy = dir === 'u' ? -1 : dir === 'd' ? 1 : 0;
    let best = null, bs = 1e9;
    for (const el of items(sc)) {
      if (el === cur) continue; const b = el.getBoundingClientRect();
      // Abstand zur nächsten Kante in Bewegungsrichtung, quer dazu gewichtet
      const bx = Math.max(b.left, Math.min(ax, b.right)), by = Math.max(b.top, Math.min(ay, b.bottom));
      const px = dx ? (dx > 0 ? b.left - a.right : a.left - b.right) : 0, py = dy ? (dy > 0 ? b.top - a.bottom : a.top - b.bottom) : 0;
      const main = dx ? px : py; if (main < -4) continue;
      const cross = dx ? Math.abs(by - ay) : Math.abs(bx - ax), s = Math.max(0, main) + cross * 2.2;
      if (s < bs) { bs = s; best = el; }
    }
    if (best) focus(best);
    else { const sl = cur.closest('.scrollx,[data-scroll]'); if (sl) sl.scrollBy({ left: dx * 200, top: dy * 200, behavior: 'smooth' }); }
  }
  function activate() {
    const sc = ensure(); if (!sc || !cur) return;
    if (cur.tagName === 'INPUT') { try { cur.focus(); cur.select && cur.select(); } catch (e) {} if (window.EasyGamesPad) try { EasyGamesPad.enabled(true); EasyGamesPad.focus && EasyGamesPad.focus(cur); } catch (e) {} return; }
    cur.click(); setTimeout(() => { const s2 = scope(); if (s2 && (!cur || !s2.contains(cur) || !vis(cur))) focus(first(s2)); hints(); }, 60);
  }
  function back() {
    const sc = scope(); if (!sc) return false; const b = Array.from(sc.querySelectorAll('.nav-back')).filter(vis).pop();
    if (b) { b.click(); if (window.AUD && AUD.sfx && AUD.sfx.back) AUD.sfx.back(); setTimeout(() => { const s2 = scope(); if (s2) focus(first(s2)); hints(); }, 60); return true; } return false;
  }
  function tab(d) {
    const sc = scope(); if (!sc) return; const t = Array.from(sc.querySelectorAll('[data-tabs]')).find(vis); if (!t) return;
    const bs = Array.from(t.querySelectorAll('button')).filter(vis), i = bs.findIndex(b => b.classList.contains('on')), n = bs[(Math.max(0, i) + d + bs.length) % bs.length];
    if (n) { n.click(); if (window.AUD && AUD.sfx && AUD.sfx.tick) AUD.sfx.tick(); setTimeout(() => { const s2 = scope(); if (s2) focus(first(s2)); hints(); }, 60); }
  }
  function start() { const sc = scope(); if (!sc) return; const b = Array.from(sc.querySelectorAll('[data-nav-start]')).find(vis); if (b) { b.click(); setTimeout(() => { const s2 = scope(); if (s2) focus(first(s2)); hints(); }, 60); } }
  // Tastensymbol als HTML (für Hinweise in Menü und HUD)
  const glyph = k => { const g = GLYPH[style]; return `<kbd class="gl gl-${style} gk-${k}">${g[k]}</kbd>`; };
  function hints() {
    const el = document.getElementById('navHints'); if (!el) return; const sc = scope();
    if (mode === 'touch' || !sc || racing()) { if (!el.hidden) el.hidden = true; return; }
    const kk = mode === 'key', K = s => `<kbd class="gl gl-key">${s}</kbd>`, out = [];
    out.push([kk ? K('⏎') : glyph(style === 'nin' ? 'b' : 'a'), 'Auswählen']);
    if (Array.from(sc.querySelectorAll('.nav-back')).some(vis)) out.push([kk ? K('Esc') : glyph(style === 'nin' ? 'a' : 'b'), 'Zurück']);
    if (Array.from(sc.querySelectorAll('[data-tabs]')).some(vis)) out.push([kk ? K('Q') + K('E') : glyph('l') + glyph('r'), 'Seite']);
    if (Array.from(sc.querySelectorAll('[data-nav-start]')).some(vis)) out.push([kk ? K('Space') : glyph('st'), 'Los']);
    if (hintFn) hintFn(out, kk);
    const html = out.map(([g, t]) => `<span>${g}${t}</span>`).join(''); if (el.innerHTML !== html) el.innerHTML = html; if (el.hidden) el.hidden = false;
  }
  // Vibration: alle (oder ein bestimmtes) Gamepad, sonst Handy
  function rumble(strong, weak, ms, padIndex) {
    let any = false;
    for (const p of pads()) { if (padIndex != null && p.index !== padIndex) continue; const v = p.vibrationActuator; if (v && v.playEffect) { any = true; try { const r = v.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }); if (r && r.catch) r.catch(() => {}); } catch (e) {} } }
    if (!any && padIndex == null && mode === 'touch' && navigator.vibrate) try { navigator.vibrate(Math.round(ms * Math.max(strong, weak))); } catch (e) {}
  }
  // ---------------------------------------------------------------- Gamepad-Schleife (nur mit Controller)
  const pr = (p, i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5));
  function poll(now) {
    loop = 0; const ps = pads(); if (!ps.length) return;
    loop = requestAnimationFrame(poll);
    let dir = '', press = {};
    for (const p of ps) {
      const o = last[p.index] || (last[p.index] = {}), ax = p.axes || [], x = ax[0] || 0, y = ax[1] || 0;
      const d = pr(p, 12) || y < -0.6 ? 'u' : pr(p, 13) || y > 0.6 ? 'd' : pr(p, 14) || x < -0.6 ? 'l' : pr(p, 15) || x > 0.6 ? 'r' : '';
      if (d) dir = d;
      for (const i of [0, 1, 2, 3, 4, 5, 8, 9]) { const v = pr(p, i); if (v && !o[i]) { press[i] = 1; style = styleOf(p.id); } o[i] = v; }
    }
    if (racing()) { rep.dir = ''; return; }
    if (Object.keys(press).length || dir) setMode('pad');
    if (dir) { if (dir !== rep.dir) { rep.dir = dir; rep.t = now + 380; move(dir); } else if (now > rep.t) { rep.t = now + 110; move(dir); } } else rep.dir = '';
    const inInput = document.activeElement && document.activeElement.tagName === 'INPUT';
    if (inInput) return;   // Bildschirm-Tastatur von gamepad.js ist dran
    if (press[confirmIdx()]) activate();
    else if (press[backIdx()]) back();
    if (press[4]) tab(-1); if (press[5]) tab(1);
    if (press[9]) start();
    if (Object.keys(press).length) hints();
  }
  const kick = () => { if (!loop && pads().length) loop = requestAnimationFrame(poll); };
  function init(o) {
    racing = o.racing || racing; hintFn = o.hints || null;
    addEventListener('gamepadconnected', e => { style = styleOf(e.gamepad.id); kick(); });
    kick(); setInterval(kick, 1000);   // manche Browser melden bereits verbundene Pads erst nach einem Tastendruck
    addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.pointerType === 'mouse' || e.pointerType === 'pen') setMode('touch'); }, true);
    addEventListener('keydown', e => {
      if (racing()) return; const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
      const map = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' };
      if (typing) return;
      const sc = scope(); if (!sc) return;
      const hasStart = Array.from(sc.querySelectorAll('[data-nav-start]')).some(vis), stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
      if (map[e.key]) { stop(); setMode('key'); move(map[e.key]); hints(); }
      else if (e.key === 'Enter' || (e.key === ' ' && !hasStart)) { if (e.repeat) return stop(); stop(); setMode('key'); if (ring && cur) activate(); else ensure(); }
      else if (e.key === ' ') { stop(); if (!e.repeat) { setMode('key'); start(); } }
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack' || e.keyCode === 10009 || e.keyCode === 461) { if (e.repeat) return; setMode('key'); if (back()) stop(); }
      else if ((e.key === 'q' || e.key === 'Q' || e.key === 'PageUp') && !e.repeat) { setMode('key'); tab(-1); }
      else if ((e.key === 'e' || e.key === 'E' || e.key === 'PageDown') && !e.repeat) { setMode('key'); tab(1); }
    }, true);
    // Neue Ebenen (Fenster auf/zu): Rahmen neu setzen, wenn Controller/Tastatur aktiv
    new MutationObserver(recs => { if (mode !== 'touch' && !racing() && recs.some(r => r.target.id !== 'navHints')) { ensure(); hints(); } }).observe(document.body, { attributes: true, attributeFilter: ['hidden'], subtree: true });
  }
  return { init, rumble, glyph, hints, focus, refresh: () => { if (mode !== 'touch') { ensure(); hints(); } }, get style() { return style; }, set style(s) { if (GLYPH[s]) style = s; }, get mode() { return mode; }, styleOf, GLYPH };
})();
if (typeof module !== 'undefined') module.exports = Nav;

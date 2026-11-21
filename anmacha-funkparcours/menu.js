/* Titanparcours – Ladebildschirm, Hauptmenü und Navigation im Konsolen-Stil:
   Kachel-Reihe mit Info-Feld, Pfeiltasten/Enter/Esc (Q/E bzw. Bild↑/↓ = Reiter), Gamepad (Steuerkreuz/Stick, A = OK, B = Zurück, Start = Pause), Maus und Touch.
   In Dialogen, Karten und der Einrichtung springt der Fokus mit den Pfeiltasten zwischen den Knöpfen. */
const $ = id => document.getElementById(id);
const TIPS = ['<b>Länger halten</b> = höher springen, kurz tippen = kleiner Hüpfer.', 'An der <b>Steilwand</b> zählt Tempo: voll anlaufen, kurz vor der Wand springen.', 'An den <b>Hangelstangen</b> greift dein Läufer von selbst – mit Sprung geht es schneller weiter.', '<b>Bruchplatten</b> geben kurz nach dem Betreten nach – nicht stehen bleiben!', 'Der <b>Geist</b> zeigt dir die bisherige Bestzeit.', 'Bis zu <b>4 Handys</b> lassen sich als Steuer-Pads koppeln.', 'Am <b>Seil</b> loslassen, wenn es nach vorn schwingt – dann fliegst du am weitesten.', 'Auf den <b>Drehwalzen</b> einfach weiterlaufen, sie schieben zurück. Drüberspringen ist schneller, aber riskant.', 'An der <b>Steilwand</b> hast du drei Versuche.', 'Mit <b>Gamepad</b> wie auf der Konsole: Stick laufen, A springen, B ducken, Start = Pause.', 'Unter <b>Rollstämmen</b> und durch den <b>Tunnel</b> kommst du nur geduckt – mit Anlauf rutschst du durch.', 'An der <b>Lachsleiter</b> im Takt springen: zu früh gedrückt, und die Stange rutscht eine Sprosse ab.', 'Knapp verfehlte Kanten erwischt dein Läufer noch – trotzdem lieber sauber springen.'];
const pads = () => (navigator.getGamepads ? [...navigator.getGamepads()].filter(g => g && g.connected) : []);
// Kachel-Symbole (Linien, wie in Konsolen-Menüs)
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICON = {
  show: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>'),
  train: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3M19 6l1.5-1.5"/>'),
  chars: svg('<circle cx="9" cy="7.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="8.5" r="2.6"/><path d="M16.5 14.2A5 5 0 0 1 21.5 19"/>'),
  pair: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  rules: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5M9 8h7M9 11.5h5"/>'),
  sound: svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>'),
  home: svg('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  pad: svg('<path d="M6.5 7h11a4.5 4.5 0 0 1 4.3 5.8l-1.3 4.4a2.6 2.6 0 0 1-4.4 1L14 16h-4l-2.1 2.2a2.6 2.6 0 0 1-4.4-1l-1.3-4.4A4.5 4.5 0 0 1 6.5 7z"/><path d="M7 10v3M5.5 11.5h3"/><circle cx="16" cy="10.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="12.5" r=".6" fill="currentColor"/>')
};
const FOCUSABLE = 'button:not([disabled]):not([hidden]),input:not([disabled]),a[href]';

export function createUI({ SFX, Audio_, touch, onMenu, panel, onPause, custom = {} }) {
  // ------------------------------------------------------------ Ladebildschirm
  let tipI = (Math.random() * TIPS.length) | 0, tipTimer = 0, started = false, onStartCb = null;
  const showTip = () => { const el = $('bootTip'); el.classList.remove('in'); void el.offsetWidth; el.innerHTML = TIPS[tipI++ % TIPS.length]; el.classList.add('in'); };
  const boot = {
    progress(pct, msg) { pct = Math.max(0, Math.min(100, pct)); $('bootBar').style.width = pct + '%'; $('bootPct').textContent = Math.round(pct) + ' %'; if (msg) $('bootMsg').textContent = msg; if (!tipTimer) { showTip(); tipTimer = setInterval(showTip, 3800); } },
    ready(onStart) {
      boot.progress(100, 'Bereit'); onStartCb = onStart; const B = $('boot'); B.classList.add('ready'); const st = $('bootStart'); st.textContent = touch ? 'Tippe zum Starten' : 'Drücke eine beliebige Taste'; st.hidden = false;
      addEventListener('keydown', startKey, true); B.addEventListener('pointerdown', start);
    },
    get open() { return !started; },
    hide() { started = true; clearInterval(tipTimer); removeEventListener('keydown', startKey, true); const B = $('boot'); B.classList.add('out'); setTimeout(() => { B.hidden = true; }, 500); }
  };
  function startKey(e) { if (e.repeat || e.code === 'Tab' || /^(Shift|Control|Alt|Meta)/.test(e.key)) return; e.preventDefault(); e.stopImmediatePropagation(); start(); }
  function start() { if (started || !onStartCb) return; Audio_.unlock(); SFX.go(); boot.hide(); onStartCb(); }

  // ------------------------------------------------------------ Hauptmenü
  const items = [...document.querySelectorAll('#cmNav .cm-it')]; let focus = 0;
  items.forEach(b => { const ic = b.querySelector('.ic'); if (ic && !ic.innerHTML) ic.innerHTML = ICON[b.dataset.m] || ''; });
  $('cmPad').innerHTML = ICON.pad;
  const clock = () => { const d = new Date(); $('cmClock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  clock(); setInterval(clock, 15000);
  const menuOpen = () => !$('menu').hidden && started;
  function setFocus(i, quiet) {
    focus = (i + items.length) % items.length; items.forEach((b, k) => b.classList.toggle('on', k === focus));
    if (document.activeElement !== items[focus] && menuOpen()) items[focus].focus({ preventScroll: true });
    const nav = $('cmNav'), it = items[focus];   // Kachel weich in den sichtbaren Bereich schieben (Reihe scrollt seitlich, Raster auf dem Handy nach unten)
    if (menuOpen() && nav.scrollWidth > nav.clientWidth + 2) nav.scrollTo({ left: Math.max(0, it.offsetLeft - nav.clientWidth * 0.3), behavior: quiet ? 'auto' : 'smooth' });
    const p = $('cmPanel'); p.innerHTML = panel(items[focus].dataset.m); p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
    if (!quiet) SFX.click();
  }
  items.forEach((b, k) => {
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && k !== focus) setFocus(k); });
    b.addEventListener('focus', () => { if (k !== focus) setFocus(k, true); });
    b.addEventListener('click', () => { Audio_.unlock(); if (k !== focus) setFocus(k, true); SFX.click(); onMenu(b.dataset.m); });
  });
  $('cmPanel').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { SFX.click(); onMenu(b.dataset.go); } });
  $('cmKeys').innerHTML = touch ? '' : '<span class="k-key"><kbd>←</kbd><kbd>→</kbd> Auswählen · <kbd>Enter</kbd> Bestätigen · <kbd>Esc</kbd> Zurück</span><span class="k-pad"><kbd class="gp">✚</kbd> Auswählen · <kbd class="gp a">A</kbd> Bestätigen · <kbd class="gp b">B</kbd> Zurück</span>';
  const menu = { show(id) { const i = items.findIndex(b => b.dataset.m === id); setFocus(i >= 0 ? i : focus, true); }, refresh() { setFocus(focus, true); }, get focus() { return items[focus].dataset.m; } };

  // ------------------------------------------------------------ Navigation in Dialogen und Bildschirmen
  // Ebene von oben nach unten: Dialoge, Karte, Einrichtung, Menü. Liefert [Container, Zurück-Knopf].
  function layer() {
    for (const [id, back] of [['err', null], ['pause', 'bResume'], ['rules', 'rulesOk'], ['pair', 'bPairOk'], ['pick', 'bPickOk'], ['card', null], ['setup', 'bSetBack']]) { const el = $(id); if (el && !el.hidden) return [el, back]; }
    return null;
  }
  function nav(k) {
    if (!started) return false;
    if (menuOpen() && !layer()) { if (k === 'up' || k === 'left') { setFocus(focus - 1); return true; } if (k === 'down' || k === 'right') { setFocus(focus + 1); return true; } if (k === 'ok') { items[focus].click(); return true; } return k === 'back'; }
    const L = layer(); if (!L) return false; const [el, back] = L;
    if (custom[el.id] && custom[el.id](k)) return true;   // eigene Navigation (z. B. Figurenwahl: Karussell + Spiele-Reiter)
    if (k === 'lb' || k === 'rb') return false;
    if (k === 'back') { if (back && $(back)) { $(back).click(); return true; } return false; }
    const list = [...el.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null); if (!list.length) return false;
    const cur = list.indexOf(document.activeElement);
    if (k === 'ok') { (cur >= 0 ? list[cur] : list[0]).click(); return true; }
    const d = k === 'up' || k === 'left' ? -1 : 1, nx = cur < 0 ? (d > 0 ? 0 : list.length - 1) : (cur + d + list.length) % list.length; list[nx].focus(); SFX.click(); return true;
  }
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', Space: 'ok', Escape: 'back', PageUp: 'lb', PageDown: 'rb', KeyQ: 'lb', KeyE: 'rb' };
  addEventListener('keydown', e => {
    const k = KEYS[e.code]; if (!k) return; const t = e.target, typing = t && /INPUT|TEXTAREA/.test(t.tagName);
    if (typing && (k === 'left' || k === 'right' || (k === 'ok' && e.code === 'Space'))) return;
    if (typing && (k === 'lb' || k === 'rb')) return;
    if (!menuOpen() && !layer()) return;                  // im Lauf: Tasten gehören dem Spiel
    if (nav(k)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // ------------------------------------------------------------ Gamepad wie auf der Konsole (Xbox-Anordnung, gamepad.js gleicht andere Pads an)
  // Lauf: Stick/Steuerkreuz laufen, A/Y springen, B oder Stick runter ducken, X/RB/RT greifen, Start = Pause. Bits wie Tastatur: 1 links, 2 rechts, 4 Sprung, 8 Ducken, 16 Greifen.
  let prev = {}, rep = 0, hadPad = false;
  function gamepad(dt, playing) {
    const ps = pads(); if (!!ps.length !== hadPad) { hadPad = !!ps.length; $('cmPad').hidden = !hadPad; } if (!ps.length) { prev = {}; return 0; }
    let m = 0; const st = { up: 0, down: 0, left: 0, right: 0, ok: 0, back: 0, start: 0, lb: 0, rb: 0, any: 0 };
    for (const gp of ps) {
      const bt = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      st.up |= bt(12) || ay < -0.6; st.down |= bt(13) || ay > 0.6; st.left |= bt(14) || ax < -0.5; st.right |= bt(15) || ax > 0.5; st.ok |= bt(0); st.back |= bt(1) || bt(8); st.start |= bt(9); st.lb |= bt(4); st.rb |= bt(5); st.any |= gp.buttons.some(b => b.pressed);
      const back = document.documentElement.classList.contains('fp-back'), f = back ? ax - ay : ax;   // von hinten: Stick/Steuerkreuz hoch = vorwärts, runter = zurück
      if (bt(14) || f < -0.3 || (back && bt(13))) m |= 1; if (bt(15) || f > 0.3 || (back && bt(12))) m |= 2; if (bt(0) || bt(3)) m |= 4; if (bt(1) || (!back && (bt(13) || ay > 0.55))) m |= 8; if (bt(2) || bt(5) || bt(7)) m |= 16;   // X, RB, RT = Greifen
    }
    if (st.any && !prev.any) document.documentElement.classList.add('fp-pad');
    if (!started) { if (st.any && !prev.any && onStartCb) start(); prev = st; return 0; }
    const sp = st.start && !prev.start;
    if (playing) { if (sp && onPause) onPause(); }
    else {
      rep -= dt; for (const k of ['up', 'down', 'left', 'right']) if (st[k] && (!prev[k] || rep <= 0)) { nav(k); rep = prev[k] ? 0.16 : 0.4; }
      for (const k of ['ok', 'back', 'lb', 'rb']) if (st[k] && !prev[k]) nav(k);
      if (sp) { if (!$('pause').hidden) nav('back'); else nav('ok'); }
    }
    prev = st; return playing ? m : 0;
  }
  // Vibration (wo der Browser sie kann): stark/schwach 0–1, Dauer in ms
  function rumble(strong, weak, ms) {
    for (const gp of pads()) { const a = gp.vibrationActuator; try { if (a && a.playEffect) a.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {}); } catch (e) {} }
  }
  // Letztes Eingabegerät: Hinweise zeigen Tasten oder Gamepad-Knöpfe
  addEventListener('keydown', () => document.documentElement.classList.remove('fp-pad'), true);
  addEventListener('pointerdown', () => document.documentElement.classList.remove('fp-pad'), true);
  return { boot, menu, gamepad, nav, rumble };
}

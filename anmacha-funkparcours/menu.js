/* Funkparcours – Ladebildschirm, Hauptmenü und Navigation im Konsolen-Stil:
   Fokus-Liste mit Info-Feld, Pfeiltasten/Enter/Esc, Gamepad (Steuerkreuz/Stick, A = OK, B = Zurück, Start), Maus und Touch.
   In Dialogen, Karten und der Einrichtung springt der Fokus mit den Pfeiltasten zwischen den Knöpfen. */
const $ = id => document.getElementById(id);
const TIPS = ['<b>Länger halten</b> = höher springen, kurz tippen = kleiner Hüpfer.', 'An der <b>Steilwand</b> zählt Tempo: voll anlaufen, kurz vor der Wand springen.', 'An den <b>Hangelstangen</b> greift dein Läufer von selbst – mit Sprung geht es schneller weiter.', '<b>Bruchplatten</b> geben kurz nach dem Betreten nach – nicht stehen bleiben!', 'Der <b>Geist</b> zeigt dir die bisherige Bestzeit.', 'Bis zu <b>4 Handys</b> lassen sich als Steuer-Pads koppeln.', 'Ein <b>Gamepad</b> funktioniert in Menü und Lauf: Steuerkreuz laufen, A springen.', 'Knapp verfehlte Kanten erwischt dein Läufer noch – trotzdem lieber sauber springen.'];
const pads = () => (navigator.getGamepads ? [...navigator.getGamepads()].filter(g => g && g.connected) : []);
const FOCUSABLE = 'button:not([disabled]):not([hidden]),input:not([disabled]),a[href]';

export function createUI({ SFX, Audio_, touch, onMenu, panel }) {
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
  const menuOpen = () => !$('menu').hidden && started;
  function setFocus(i, quiet) {
    focus = (i + items.length) % items.length; items.forEach((b, k) => b.classList.toggle('on', k === focus));
    if (document.activeElement !== items[focus] && menuOpen()) items[focus].focus({ preventScroll: true });
    const p = $('cmPanel'); p.innerHTML = panel(items[focus].dataset.m); p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
    if (!quiet) SFX.click();
  }
  items.forEach((b, k) => {
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && k !== focus) setFocus(k); });
    b.addEventListener('focus', () => { if (k !== focus) setFocus(k, true); });
    b.addEventListener('click', () => { Audio_.unlock(); if (k !== focus) setFocus(k, true); SFX.click(); onMenu(b.dataset.m); });
  });
  $('cmPanel').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { SFX.click(); onMenu(b.dataset.go); } });
  $('cmKeys').innerHTML = touch ? '' : '<kbd>↑</kbd><kbd>↓</kbd> Auswählen · <kbd>Enter</kbd> Bestätigen · <kbd>Esc</kbd> Zurück · 🎮 Gamepad';
  const menu = { show(id) { const i = items.findIndex(b => b.dataset.m === id); setFocus(i >= 0 ? i : focus, true); }, refresh() { setFocus(focus, true); }, get focus() { return items[focus].dataset.m; } };

  // ------------------------------------------------------------ Navigation in Dialogen und Bildschirmen
  // Ebene von oben nach unten: Dialoge, Karte, Einrichtung, Menü. Liefert [Container, Zurück-Knopf].
  function layer() {
    for (const [id, back] of [['err', null], ['rules', 'rulesOk'], ['pair', 'bPairOk'], ['pick', 'bPickOk'], ['card', null], ['setup', 'bSetBack']]) { const el = $(id); if (el && !el.hidden) return [el, back]; }
    return null;
  }
  function nav(k) {
    if (!started) return false;
    if (menuOpen() && !layer()) { if (k === 'up') { setFocus(focus - 1); return true; } if (k === 'down') { setFocus(focus + 1); return true; } if (k === 'ok') { items[focus].click(); return true; } return k === 'back'; }
    const L = layer(); if (!L) return false; const [el, back] = L;
    if (k === 'back') { if (back && $(back)) { $(back).click(); return true; } return false; }
    const list = [...el.querySelectorAll(FOCUSABLE)].filter(x => x.offsetParent !== null); if (!list.length) return false;
    const cur = list.indexOf(document.activeElement);
    if (k === 'ok') { (cur >= 0 ? list[cur] : list[0]).click(); return true; }
    const d = k === 'up' || k === 'left' ? -1 : 1, nx = cur < 0 ? (d > 0 ? 0 : list.length - 1) : (cur + d + list.length) % list.length; list[nx].focus(); SFX.click(); return true;
  }
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', Space: 'ok', Escape: 'back' };
  addEventListener('keydown', e => {
    const k = KEYS[e.code]; if (!k) return; const t = e.target, typing = t && /INPUT|TEXTAREA/.test(t.tagName);
    if (typing && (k === 'left' || k === 'right' || (k === 'ok' && e.code === 'Space'))) return;
    if (menuOpen() && !layer() && (k === 'left' || k === 'right')) return;
    if (!menuOpen() && !layer()) return;                  // im Lauf: Tasten gehören dem Spiel
    if (nav(k)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // ------------------------------------------------------------ Gamepad: Menü-Navigation + Spiel-Eingabe (Bits wie Tastatur: 1 links, 2 rechts, 4 Sprung)
  let prev = {}, rep = 0;
  function gamepad(dt, playing) {
    const ps = pads(); if (!ps.length) { prev = {}; return 0; }
    let m = 0; const st = { up: 0, down: 0, left: 0, right: 0, ok: 0, back: 0, any: 0 };
    for (const gp of ps) {
      const bt = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      st.up |= bt(12) || ay < -0.6; st.down |= bt(13) || ay > 0.6; st.left |= bt(14) || ax < -0.5; st.right |= bt(15) || ax > 0.5; st.ok |= bt(0) || bt(9); st.back |= bt(1) || bt(8); st.any |= gp.buttons.some(b => b.pressed);
      if (bt(14) || ax < -0.35) m |= 1; if (bt(15) || ax > 0.35) m |= 2; if (bt(0) || bt(2) || bt(3)) m |= 4;
    }
    if (!started) { if (st.any && !prev.any && onStartCb) start(); prev = st; return 0; }
    if (!playing) {
      rep -= dt; for (const k of ['up', 'down', 'left', 'right']) if (st[k] && (!prev[k] || rep <= 0)) { nav(k); rep = prev[k] ? 0.16 : 0.4; }
      for (const k of ['ok', 'back']) if (st[k] && !prev[k]) nav(k);
    }
    prev = st; return playing ? m : 0;
  }
  return { boot, menu, gamepad, nav };
}

// Eine Eingabe-Schicht für Tastatur, Controller und Touch.
// Das Spiel versteht weiterhin nur seine Standardtasten (KeyJ, KeyE, Space …); hier passiert nur:
//  - Tastatur frei belegbar: eine eigene Taste wird vor dem Spiel auf die Standardtaste übersetzt (gespeichert in localStorage „zotik_keys“).
//  - Controller: ../gamepad.js schickt die Standardtasten (Belegung per data-pad, Symbole, Umbelegen, Belegung zeigen).
//  - Hinweise passend zum Gerät: Controller-Symbol (✕ ○ □ △ / A B X Y), Tastenname oder auf dem Handy gar keine Taste.
export const ACTIONS = [
  ['up', 'Vorwärts', 'KeyW'], ['left', 'Links', 'KeyA'], ['down', 'Rückwärts', 'KeyS'], ['right', 'Rechts', 'KeyD'],
  ['atk', 'Angriff · Befehl ausführen', 'KeyJ'], ['jump', 'Springen', 'Space'], ['dodge', 'Ausweichen', 'ShiftLeft'], ['block', 'Block halten', 'KeyB'],
  ['use', 'Aktion · Sprechen · Öffnen', 'KeyE'], ['lock', 'Ziel erfassen', 'KeyQ'], ['react', 'Reaktion ▲', 'KeyF'], ['call', 'Rufen', 'KeyT'],
  ['sk1', 'Fähigkeit 1', 'Digit1'], ['sk2', 'Fähigkeit 2 · Lichtstoß', 'Digit2'], ['potion', 'Heiltrank', 'KeyR'], ['form', 'Rissform', 'KeyG'],
  ['tool', 'Werkzeug benutzen', 'KeyC'], ['toolnext', 'Werkzeug wechseln', 'KeyX'], ['naut', 'Nautilux', 'KeyV'], ['menu', 'Menü', 'Escape']
];
const TOUCHICON = { atk: '⚔️', jump: '⤴', dodge: '💨', block: '💨', use: '✋', lock: '🎯', react: '✋', call: '📋', sk1: '✨', sk2: '✨', potion: '🧪', form: '🌀', tool: '⟡', toolnext: '⟡', naut: '✋', menu: '☰' };
const KEY = 'zotik_keys';
const keyName = c => !c ? '–' : c === 'Space' ? 'Leertaste' : /^Shift/.test(c) ? 'Shift' : /^Control/.test(c) ? 'Strg' : /^Alt/.test(c) ? 'Alt' : c === 'Escape' ? 'Esc' : c === 'Enter' ? '⏎' : c === 'Backspace' ? '⌫' : c === 'Tab' ? 'Tab'
  : /^Key/.test(c) ? c.slice(3) : /^Digit/.test(c) ? c.slice(5) : /^Numpad/.test(c) ? 'Num ' + c.slice(6) : /^Arrow/.test(c) ? { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }[c] : c;

export function createInput({ touchDev, toast }) {
  let map = {};   // Aktion → eigene Taste (nur Abweichungen von der Standardtaste)
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o && typeof o === 'object') map = o; } catch (e) { }
  const def = id => (ACTIONS.find(a => a[0] === id) || [])[2];
  const code = id => map[id] || def(id);
  let rev = {};   // eigene Taste → Standardtaste
  const rebuild = () => { rev = {}; for (const [id, , d] of ACTIONS) if (map[id] && map[id] !== d) rev[map[id]] = d; };
  rebuild();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) { } rebuild(); };

  // Zuletzt benutztes Gerät: Controller (gamepad.js setzt html.eg-pad), Touch oder Tastatur
  let last = touchDev ? 'touch' : 'kb', waitFor = null;
  addEventListener('pointerdown', e => { if (!e.isTrusted) return; if (e.pointerType === 'touch') last = 'touch'; else if (e.pointerType === 'mouse') last = 'kb'; }, true);
  // Tastatur: eigene Taste → Standardtaste (nur echte Tastendrücke; gamepad.js schickt schon die Standardtasten)
  const tr = e => {
    if (!e.isTrusted) return; last = 'kb';
    if (waitFor) { if (e.type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); const cb = waitFor; waitFor = null; cb(e.code); } return; }
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const d = rev[e.code]; if (!d || d === e.code) return;
    e.preventDefault(); e.stopImmediatePropagation();
    (t || document).dispatchEvent(new KeyboardEvent(e.type, { code: d, key: d, repeat: e.repeat, bubbles: true, cancelable: true }));
  };
  addEventListener('keydown', tr, true); addEventListener('keyup', tr, true);

  const padOn = () => document.documentElement.classList.contains('eg-pad') && !!window.EasyGamesPad;
  const mode = () => padOn() ? 'pad' : last;
  // Controller-Knopf, auf dem die Standardtaste der Aktion liegt (aus der data-pad-Belegung von gamepad.js)
  const PADALT = { naut: 'call', toolnext: 'call', tool: 'call', form: 'form', potion: 'potion' };   // ohne eigenen Knopf: über „Rufen“ (Kommandomenü)
  const padBtn = (id, alt) => { const P = window.EasyGamesPad, d = def(id); if (!P || !P.map) return null;
    for (const k in P.map) if (String(P.map[k] || '').split('/').includes(d)) return k;
    if (P.dpad) { const i = P.dpad.indexOf(d); if (i >= 0) return ['up', 'down', 'left', 'right'][i]; } return !alt && PADALT[id] && PADALT[id] !== id ? padBtn(PADALT[id], 1) : null; };
  // Hinweis-Text für eine Aktion: Controller-Symbol, Tastenname oder (Touch) Bildschirm-Symbol
  function hint(id) { const m = mode();
    if (m === 'pad') { const b = padBtn(id); return b ? (window.EasyGamesPad.glyph ? EasyGamesPad.glyph(b) : b.toUpperCase()) : ''; }
    if (m === 'touch') return TOUCHICON[id] || '';
    return keyName(code(id)); }
  const badge = id => { const h = hint(id); return h ? `<b class="kh">${h}</b> ` : ''; };

  // Optionen: 🎮 Controller (gamepad.js) und ⌨️ Tastatur (frei belegbar; auf Handys ohne Tastatur ausgeblendet)
  function optionsHTML() {
    const N = window.EasyGamesPadNormal, P = window.EasyGamesPad; let h = '';
    if (P) { const st = N && N.style ? N.style() : 'auto', cf = N && N.confirm ? N.confirm() : 'auto';
      const sel = (id, v, o) => `<select class="cpb" id="${id}">${o.map(([k, t]) => `<option value="${k}"${k === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
      h += `<h3>🎮 Controller</h3><div class="row"><span>Symbole</span><span>${sel('padSty', st, [['auto', 'Automatisch'], ['xbox', 'Xbox (A B X Y)'], ['ps', 'PlayStation (✕ ○ □ △)'], ['switch', 'Switch (B A Y X)']])}</span></div>`
        + `<div class="row"><span>Bestätigen</span><span>${sel('padConf', cf, [['auto', 'Automatisch'], ['bottom', 'Knopf unten (PlayStation/Xbox)'], ['right', 'Knopf rechts (Switch)']])}</span></div>`
        + `<div class="row"><span>Knöpfe</span><span><button class="cpb" id="padMap">Knöpfe belegen</button> <button class="cpb" id="padLeg">Belegung zeigen</button></span></div>`; }
    if (!touchDev || matchMedia('(any-pointer:fine)').matches) {
      h += `<h3>⌨️ Tastatur</h3><p style="color:var(--dim);font-size:13px">Taste antippen, dann die neue Taste drücken (Esc bricht ab).</p>`
        + ACTIONS.map(([id, t]) => `<div class="row"><span>${t}</span><span><button class="cpb kbd" data-k="${id}">${keyName(code(id))}</button></span></div>`).join('')
        + `<div class="row"><span></span><span><button class="cpb" id="kbReset">Standard</button></span></div>`; }
    return h;
  }
  function bindOptions(c, redraw) {
    const N = window.EasyGamesPadNormal, P = window.EasyGamesPad, q = s => c.querySelector(s);
    const after = () => { if (P && padOn()) P.showLegend(5000); redraw(); };
    if (q('#padSty')) q('#padSty').onchange = e => { if (N && N.style) N.style(e.target.value); after(); };
    if (q('#padConf')) q('#padConf').onchange = e => { if (N && N.confirm) N.confirm(e.target.value); after(); };
    const here = () => { try { return [...navigator.getGamepads()].some(Boolean); } catch (e) { return false; } };
    const need = fn => () => { if (!P || !here()) return toast('🎮 Schließ zuerst einen Controller an (USB oder Bluetooth) und drück einen Knopf.'); fn(); };
    if (q('#padMap')) q('#padMap').onclick = need(() => P.openMenu());
    if (q('#padLeg')) q('#padLeg').onclick = need(() => P.showLegend(8000));
    c.querySelectorAll('.kbd').forEach(b => b.onclick = () => { b.textContent = 'Taste …'; waitFor = k => {
      if (k !== 'Escape') { const id = b.dataset.k; for (const a in map) if (map[a] === k) delete map[a];
        const other = ACTIONS.find(a => a[0] !== id && code(a[0]) === k); if (other) map[other[0]] = code(id);   // Tasten tauschen statt doppelt
        if (k === def(id)) delete map[id]; else map[id] = k; save(); }
      redraw(); }; });
    if (q('#kbReset')) q('#kbReset').onclick = () => { map = {}; save(); redraw(); };
  }
  return { hint, badge, mode, code, keyName, optionsHTML, bindOptions, waiting: () => !!waitFor };
}

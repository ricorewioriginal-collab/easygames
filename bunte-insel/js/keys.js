'use strict';
/* Bunte Insel – Tastenbelegung ⌨️: am Computer kann jede Aktion frei auf eine andere Taste gelegt werden (Pause-Menü → „Tasten & Controller belegen“).
   Läuft als Übersetzer vor dem Spiel: die gedrückte Taste wird in die Standardtaste der Aktion umgewandelt, das Spiel selbst bleibt unverändert. Wird gespeichert (pro Gerät). */
BI.KEY_ACTIONS = [
  ['up', '⬆️ Vorwärts', 'KeyW'], ['down', '⬇️ Rückwärts', 'KeyS'], ['left', '⬅️ Links', 'KeyA'], ['right', '➡️ Rechts', 'KeyD'], ['act', '✋ Aktion / Einsteigen / Reden', 'KeyE'],
  ['jump', '⤒ Springen / Hupe', 'Space'], ['turbo', '🏃 Rennen / Turbo', 'ShiftLeft'], ['aux', '👊 Hauen / Sirene / zweite Aktion', 'KeyF'], ['hello', '👋 Hallo / Hupe', 'KeyH'], ['dive', '⬇ Sinken / Runter', 'KeyX'],
  ['camL', '↺ Kamera links', 'KeyQ'], ['camR', '↻ Kamera rechts', 'KeyR'], ['ego', '📷 Ego-Kamera', 'KeyV'], ['zoom', '🔍 Kamera-Abstand', 'KeyC'], ['bag', '🎒 Rucksack', 'KeyI'], ['build', '🧱 Bauen', 'KeyB'],
  ['night', '🌙 Tag / Nacht', 'KeyN'], ['sound', '🔊 Ton an/aus', 'KeyM'], ['pause', '⏸ Pause', 'KeyP']
];
BI.keyLabel = c => c ? c.replace(/^Key/, '').replace(/^Digit/, '').replace('Space', 'Leertaste').replace('ShiftLeft', 'Shift links').replace('ShiftRight', 'Shift rechts').replace('ControlLeft', 'Strg links').replace('ControlRight', 'Strg rechts').replace('AltLeft', 'Alt links').replace('AltRight', 'Alt rechts').replace('ArrowUp', '↑').replace('ArrowDown', '↓').replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('Enter', 'Enter').replace('Backquote', '^').replace('Semicolon', 'Ö').replace('Quote', 'Ä').replace('BracketLeft', 'Ü').replace('Comma', ',').replace('Period', '.').replace('Minus', 'ß').replace(/^Numpad/, 'Num ') : '–';
BI.createKeys = function (G) {
  const K = { bound: {}, listening: null, map: {} }, ACT = BI.KEY_ACTIONS, $ = id => document.getElementById(id), FORBID = /^(Escape|Tab|F\d+|MetaLeft|MetaRight|ContextMenu|CapsLock|PrintScreen)$/;
  const LS = 'bi-keys';
  const load = () => { try { const o = JSON.parse(localStorage.getItem(LS) || '{}'); for (const [id, , d] of ACT) K.bound[id] = typeof o[id] === 'string' && o[id] ? o[id] : d; } catch (e) { for (const [id, , d] of ACT) K.bound[id] = d; } };
  const store = () => { try { const o = {}; for (const [id, , d] of ACT) if (K.bound[id] !== d) o[id] = K.bound[id]; localStorage.setItem(LS, JSON.stringify(o)); } catch (e) { } };
  /* Übersetzungstabelle: gedrückte Taste → Standardtaste der Aktion ('' = gesperrt, weil die Aktion woanders liegt) */
  function build() { const m = {}; for (const [id, , d] of ACT) if (K.bound[id] !== d) m[K.bound[id]] = d; for (const [id, , d] of ACT) if (K.bound[id] !== d && m[d] === undefined) m[d] = ''; K.map = m; }
  K.assign = function (id, code) {
    if (FORBID.test(code)) return false; const a = ACT.find(q => q[0] === id); if (!a) return false; const old = K.bound[id], other = ACT.find(q => q[0] !== id && K.bound[q[0]] === code);
    if (other) K.bound[other[0]] = old; K.bound[id] = code; store(); build(); return true;
  };
  K.reset = function () { for (const [id, , d] of ACT) K.bound[id] = d; store(); build(); };
  K.isDefault = () => ACT.every(([id, , d]) => K.bound[id] === d);
  const same = e => ({ code: e.code, key: e.key, repeat: e.repeat, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, altKey: e.altKey, bubbles: true, cancelable: true });
  const onKey = type => e => {
    if (e._bi) return;
    if (K.listening) { if (type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); const cb = K.listening; K.listening = null; cb(e.code); } else e.stopImmediatePropagation(); return; }
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const to = K.map[e.code]; if (to === undefined) return;
    e.stopImmediatePropagation(); e.preventDefault(); if (!to) return;
    const ne = new KeyboardEvent(type, Object.assign(same(e), { code: to, key: to.replace(/^Key/, '').toLowerCase() })); ne._bi = true; (t && t !== document ? t : window).dispatchEvent(ne);
  };
  window.addEventListener('keydown', onKey('keydown'), true); window.addEventListener('keyup', onKey('keyup'), true);
  /* ---------- Fenster ---------- */
  let panel = null;
  function draw() {
    const box = panel.firstChild; box.innerHTML = '<div style="font-size:26px;font-weight:900;color:#2a3a6a;margin-bottom:6px">⌨️ Tasten belegen</div><div style="font-size:14px;color:#556;margin-bottom:8px">Tippe auf eine Taste und drücke dann die neue Taste. Esc bricht ab. Pfeiltasten gehen immer zum Laufen.</div>';
    const list = document.createElement('div'); list.style.cssText = 'max-height:52vh;overflow:auto;text-align:left'; box.appendChild(list);
    for (const [id, nm] of ACT) { const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid #e6e9f5'; const b = document.createElement('button'); b.type = 'button'; const wait = K.wait === id; b.textContent = wait ? 'Drücke eine Taste …' : BI.keyLabel(K.bound[id]); b.style.cssText = 'min-width:130px;border-radius:12px;border:3px solid ' + (wait ? '#ff7a1a' : '#4da3ff') + ';background:' + (wait ? '#fff3d0' : '#fff') + ';padding:6px 10px;font:800 16px inherit;cursor:pointer'; b.setAttribute('aria-label', nm + ': ' + BI.keyLabel(K.bound[id]) + ' – ändern');
      b.onclick = () => { K.wait = id; K.listening = code => { K.wait = null; if (!K.assign(id, code)) G.say('Diese Taste geht nicht 🙂', 1800); draw(); }; draw(); };
      const l = document.createElement('span'); l.style.cssText = 'flex:1;font-weight:700;font-size:15px'; l.textContent = nm; if (K.bound[id] !== ACT.find(q => q[0] === id)[2]) l.textContent += ' ✎'; r.append(l, b); list.appendChild(r); }
    const row = document.createElement('div'); row.style.cssText = 'margin-top:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap';
    const mk = (t, f, c) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = 'border-radius:14px;border:3px solid ' + c + ';background:#fff;padding:8px 14px;font:800 15px inherit;cursor:pointer'; b.onclick = f; row.appendChild(b); };
    mk('↺ Standard', () => { K.reset(); draw(); }, '#e0902a'); if (G.pad) mk('🎮 Controller neu einrichten', () => { close(); G.pad.rewire(); }, '#9a6af0'); mk('✔ Fertig', close, '#4cd07d'); box.appendChild(row);
  }
  function close() { K.listening = null; K.wait = null; if (panel) { panel.remove(); panel = null; } }
  K.open = function () {
    close(); panel = document.createElement('div'); panel.style.cssText = 'position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.6);font-family:Fredoka,system-ui,sans-serif'; const box = document.createElement('div'); box.style.cssText = 'background:#fffaf0;border:6px solid #4da3ff;border-radius:24px;padding:14px 16px;width:min(94vw,520px);text-align:center'; panel.appendChild(box); document.body.appendChild(panel); draw();
  };
  K.dbg = { get map() { return K.map; } };
  load(); build();
  return K;
};

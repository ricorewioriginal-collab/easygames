/* AnMaCha UNDERCOVER 3D – Einstellungen (Bildschirm).
   AMU.SettingsUI.open({ settings, input, onChange(settings), onBack }) – Audio, Grafik, Bedienung (Tasten neu belegen), Barrierefreiheit,
   Sprache, Daten zurücksetzen. Speichert über AMU.Save.saveSettings und ruft onChange(settings) bei jeder Änderung.
   AMU.SettingsUI.apply(settings) setzt Textgröße (--fs) und „Bewegung reduzieren“ (body.rm) – auch beim App-Start nutzbar. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const GA_KEY = 'anmacha-gameach.anmacha-undercover';
  const LABELS = { up: 'Nach oben', down: 'Nach unten', left: 'Nach links', right: 'Nach rechts', use: 'Benutzen / Aufgabe', report: 'Melden',
    kill: 'Ausknipsen / Fangen', special: 'Spezial (Ausknipsen, Fangen)', tasks: 'Aufgabenliste', cam: 'Kamera drehen', vent: 'Geheimgang', sab: 'Sabotage', ability: 'Fähigkeit', sprint: 'Sprinten', map: 'Karte', chat: 'Chat',
    menu: 'Menü / Pause', zoomIn: 'Heranzoomen', zoomOut: 'Herauszoomen', quick: 'Schnellnachricht' };
  const PAD_NAMES = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'Zurück', 9: 'Start', 10: 'L3', 11: 'R3', 12: 'Steuerkreuz ↑', 13: 'Steuerkreuz ↓', 14: 'Steuerkreuz ←', 15: 'Steuerkreuz →' };
  const VOL = [['master', 'Gesamtlautstärke'], ['sfx', 'Effekte'], ['music', 'Musik']];

  const CSS = '.uic-set .ui-card{display:flex;flex-direction:column;gap:6px}.uic-set .ui-field>label{display:flex;justify-content:space-between;gap:8px}' +
    '.uic-set .ui-field>label b{color:var(--tx)}.uic-opt{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;min-height:44px}' +
    '.uic-opt>span{flex:1 1 160px}.uic-keys li>span{flex:1;min-width:0}.uic-keys li small{display:block;color:var(--mu);font-size:13px}' +
    '.uic-keys .ui-btn{flex:0 0 auto;min-width:96px}.uic-wait{background:var(--warn)!important;color:#1b1206!important}' +
    '.uic-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.uic-head .ui-h1{flex:1;min-width:0}.uic-set p{margin:2px 0}';
  function css() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('amu-uic-css');
    if (!el) { el = document.createElement('style'); el.id = 'amu-uic-css'; (document.head || document.documentElement).appendChild(el); }
    if (!el.dataset.set) { el.dataset.set = '1'; el.textContent += CSS; }
  }
  const esc = s => AMU.UI.esc(s);
  const clone = o => JSON.parse(JSON.stringify(o));
  const defKeys = () => (AMU.Input && AMU.Input.DEFAULT_KEYS) ? clone(AMU.Input.DEFAULT_KEYS) : {};

  function apply(s) {
    if (typeof document === 'undefined' || !s) return;
    document.documentElement.style.setProperty('--fs', String(Math.max(0.85, Math.min(1.4, +s.textSize || 1))));
    if (document.body) document.body.classList.toggle('rm', !!s.reduceMotion);
  }
  function audio(s) { if (AMU.Audio && AMU.Audio.setVolumes) { try { AMU.Audio.setVolumes({ master: s.master, sfx: s.sfx, music: s.music }); } catch (e) { /* egal */ } } }

  function open(opt) {
    opt = opt || {}; css();
    const S = AMU.Save, UI = AMU.UI;
    let s = Object.assign({}, S ? S.settings() : {}, opt.settings ? clone(opt.settings) : {});
    if (!s.lang) s.lang = S ? S.profile().lang || 'de' : 'de';
    const input = opt.input && opt.input.rebind ? opt.input : null;
    let keys = input && input.keys ? input.keys() : Object.assign(defKeys(), s.keys || {});
    let cap = null, el = null;
    const kn = c => input && input.keyName ? input.keyName(c) : AMU.Input && AMU.Input.keyName ? AMU.Input.keyName(c) : String(c).replace(/^Key/, '');

    function commit() { if (S) S.saveSettings(s); if (opt.onChange) { try { opt.onChange(s); } catch (e) { /* egal */ } } }
    const onoff = (k, v) => UI.seg(k, [['0', 'Aus'], ['1', 'An']], v ? '1' : '0');
    const opt1 = (label, ctl, hint) => '<div class="uic-opt"><span>' + label + (hint ? '<br><small class="ui-muted">' + hint + '</small>' : '') + '</span>' + ctl + '</div>';
    const range = (k, label, val, lo, hi, step) => '<div class="ui-field"><label for="uic-' + k + '">' + label + ' <b data-out="' + k + '">' + val + ' %</b></label>' +
      '<input type="range" id="uic-' + k + '" data-k="' + k + '" min="' + lo + '" max="' + hi + '" step="' + step + '" value="' + val + '"></div>';
    function keyList() {
      return Object.keys(keys).map(a => '<li><span>' + esc(LABELS[a] || a) + '<small>' + ((keys[a] || []).map(c => esc(kn(c))).join(' · ') || '–') + '</small></span>' +
        '<button class="ui-btn ui-sm" data-a="rebind" data-v="' + esc(a) + '" aria-label="' + esc((LABELS[a] || a) + ' neu belegen') + '">Ändern</button></li>').join('');
    }
    function padText() {
      const P = (AMU.Input && AMU.Input.PAD_GAME) || {};
      const l = Object.keys(P).filter(i => PAD_NAMES[i] && LABELS[P[i]]).map(i => PAD_NAMES[i] + ': ' + LABELS[P[i]]);
      return 'Linker Stick: laufen. ' + (l.length ? l.join(' · ') + '. ' : '') + 'In Menüs bewegt der Stick oder das Steuerkreuz die Auswahl, A bestätigt, B geht zurück.';
    }
    function html() {
      return '<div class="ui-wrap uic-set"><div class="uic-head"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h1 class="ui-h1">⚙️ Einstellungen</h1></div>' +
        '<section class="ui-card"><h2 class="ui-h2">🔊 Audio</h2>' + VOL.map(v => range(v[0], v[1], Math.round(s[v[0]] * 100), 0, 100, 5)).join('') + '</section>' +
        '<section class="ui-card"><h2 class="ui-h2">🖥️ Grafik</h2>' +
        opt1('Qualität', UI.seg('quality', [['auto', 'Automatisch'], ['low', 'Niedrig'], ['mid', 'Mittel'], ['high', 'Hoch']], s.quality), 'Niedrig spart Akku auf älteren Handys.') +
        range('zoom', 'Kamera-Zoom', Math.round(s.zoom * 100), 70, 160, 5) + '</section>' +
        '<section class="ui-card"><h2 class="ui-h2">🎮 Bedienung</h2><p class="ui-muted ui-small">Aktion wählen, dann die neue Taste drücken (Esc bricht ab). Esc öffnet immer das Menü.</p>' +
        '<ul class="ui-list uic-keys">' + keyList() + '</ul><div class="ui-row"><button class="ui-btn ui-sm" data-a="resetKeys">↺ Standardtasten</button></div>' +
        '<p><b>Controller:</b> ' + esc(padText()) + '</p>' +
        '<p><b>Touch:</b> Links ein schwebender Stick zum Laufen, rechts runde Aktionsknöpfe – der große Knopf ist „Benutzen“, die anderen erscheinen, wenn sie gerade möglich sind.</p></section>' +
        '<section class="ui-card"><h2 class="ui-h2">♿ Barrierefreiheit</h2>' + range('textSize', 'Textgröße', Math.round(s.textSize * 100), 85, 140, 5) +
        opt1('Bewegung reduzieren', onoff('reduceMotion', s.reduceMotion), 'Weniger Animationen und Übergänge.') +
        opt1('Farbhilfe', onoff('colorAid', s.colorAid), 'Zeigt Symbole und Namen neben den Farben.') +
        opt1('Namensschilder', onoff('names', s.names), 'Namen über den Figuren anzeigen.') + '</section>' +
        '<section class="ui-card"><h2 class="ui-h2">🌍 Sprache</h2>' + opt1('Sprache', UI.seg('lang', [['de', 'Deutsch'], ['en', 'English (teilweise)']], s.lang),
          'Englisch betrifft nur Titel und Namen von Modi und Rollen.') + '</section>' +
        '<section class="ui-card"><h2 class="ui-h2">🗑️ Daten</h2><p class="ui-muted ui-small">Löscht Profil, Figur, Einstellungen, Statistik und Erfolge dieses Spiels auf diesem Gerät.</p>' +
        '<div class="ui-row"><button class="ui-btn ui-bad" data-a="wipe">Daten zurücksetzen</button></div></section></div>';
    }
    function setSeg(name, val) {
      el.querySelectorAll('[data-seg="' + name + '"] .ui-segb').forEach(b => {
        const on = b.dataset.v === name + ':' + val; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on));
      });
    }
    function refreshKeys() { const ul = el.querySelector('.uic-keys'); if (ul) ul.innerHTML = keyList(); }
    function stopCap() {
      if (!cap) return;
      root.removeEventListener('keydown', cap.h, true); clearTimeout(cap.t);
      const b = cap.btn; cap = null;
      if (b && b.isConnected) { b.textContent = 'Ändern'; b.classList.remove('uic-wait'); }
    }
    function rebind(action, code) {
      const prev = Object.keys(keys).find(a => a !== action && (keys[a] || []).includes(code));
      if (input) { input.rebind(action, code); keys = input.keys(); }
      else {   // gleiche Regel wie input.rebind: neue Taste zuerst, Taste woanders entfernen
        for (const a in keys) keys[a] = keys[a].filter(c => c !== code);
        keys[action] = [code].concat((keys[action] || []).slice(1).filter(c => c !== code));
      }
      s.keys = clone(keys); commit();
      UI.toast('„' + (LABELS[action] || action) + '“: ' + kn(code) + (prev ? ' (bei „' + (LABELS[prev] || prev) + '“ entfernt)' : ''), 'good');
      refreshKeys();
      const b = el.querySelector('[data-a="rebind"][data-v="' + action + '"]'); if (b) b.focus();
    }
    function startCap(action, btn) {
      stopCap();
      btn.textContent = 'Taste drücken …'; btn.classList.add('uic-wait');
      const h = e => {
        e.preventDefault(); e.stopImmediatePropagation();
        if (e.repeat || !e.code) return;
        if (e.code === 'Escape') { stopCap(); return; }
        stopCap(); rebind(action, e.code);
      };
      cap = { h, btn, t: setTimeout(stopCap, 8000) };
      root.addEventListener('keydown', h, true);
    }
    function resetInput(d) { if (input.resetKeys) input.resetKeys(); else Object.keys(d).forEach(a => input.rebind(a, d[a].slice())); }
    function resetKeys() {
      const d = defKeys();
      if (input) { resetInput(d); keys = input.keys(); } else keys = d;
      s.keys = null; commit(); refreshKeys(); UI.toast('Standardtasten wiederhergestellt', 'good');
    }
    async function wipe() {
      const ok = await UI.confirm('Alle Daten von AnMaCha UNDERCOVER 3D auf diesem Gerät löschen? Profil, Figur, Einstellungen, Statistik und Erfolge gehen verloren.', 'Löschen', 'Abbrechen');
      if (!ok) return;
      try {
        const ls = root.localStorage, P = (S && S.P) || 'anmachaUndercover.', del = [];
        for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && (k.indexOf(P) === 0 || k === GA_KEY)) del.push(k); }
        del.forEach(k => ls.removeItem(k));
      } catch (e) { /* kein Speicher */ }
      s = S ? S.settings() : s; s.lang = 'de';
      if (input) { resetInput(defKeys()); keys = input.keys(); } else keys = defKeys();
      apply(s); audio(s);
      if (opt.onChange) { try { opt.onChange(s); } catch (e) { /* egal */ } }
      render(); UI.toast('Alle Daten wurden gelöscht', 'good');
    }
    function onInput(e, final) {
      const t = e.target; if (!t || !t.dataset || !t.dataset.k) return;
      const k = t.dataset.k, v = +t.value;
      const out = el.querySelector('[data-out="' + k + '"]'); if (out) out.textContent = v + ' %';
      s[k] = v / 100;
      if (k === 'master' || k === 'sfx' || k === 'music') audio(s);
      if (k === 'textSize') apply(s);
      if (final) commit();
    }
    function on(a, v, b) {
      if (a === 'back') { stopCap(); if (opt.onBack) opt.onBack(s); return; }
      if (a === 'rebind') return startCap(v, b);
      if (a === 'resetKeys') return resetKeys();
      if (a === 'wipe') return wipe();
      if (a === 'seg' && v) {
        const i = v.indexOf(':'), k = v.slice(0, i), val = v.slice(i + 1);
        if (k === 'quality' && ['auto', 'low', 'mid', 'high'].includes(val)) s.quality = val;
        else if (k === 'lang' && (val === 'de' || val === 'en')) {
          s.lang = val;
          if (S) { const p = S.profile(); p.lang = val; S.saveProfile(p); }
        } else if (['reduceMotion', 'colorAid', 'names'].includes(k)) s[k] = val === '1';
        else return;
        setSeg(k, val); apply(s); commit();
      }
    }
    function render() {
      el = UI.screen(html(), { on, key: 'settings', onLeave: stopCap });
      el.addEventListener('input', e => onInput(e, false));
      el.addEventListener('change', e => onInput(e, true));
      return el;
    }
    return render();
  }

  AMU.SettingsUI = { open, apply, LABELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.SettingsUI;
})(typeof window !== 'undefined' ? window : globalThis);

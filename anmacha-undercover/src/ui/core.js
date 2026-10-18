/* AnMaCha UNDERCOVER 3D – Oberflächen-Grundbausteine: Bildschirme, Fenster, Hinweise, sichere HTML-Ausgabe.
   AMU.UI.screen(html, {cls})     ersetzt den Inhalt von #ui (ein Bildschirm, Fokus-Wurzel für Controller)
   AMU.UI.modal(html, {cls, onClose, closable}) → { el, close() }   Fenster über allem (eigene Fokus-Wurzel)
   AMU.UI.toast(text, kind, ms)   kurze Meldung oben;  AMU.UI.confirm(text, yes, no) → Promise<boolean>
   Klicks auf [data-a] gehen an den beim Bildschirm/Fenster übergebenen handler(action, value, el). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const esc = s => AMU.U.esc(s);
  let uiEl = null, toastEl = null, current = null;
  const modals = [];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function init() { uiEl = document.getElementById('ui'); toastEl = document.getElementById('toasts'); }
  function bindActions(el, handler) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b || !el.contains(b) || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      if (AMU.Audio) AMU.Audio.sfx('click');
      handler && handler(b.dataset.a, b.dataset.v, b, e);
    });
  }
  function focusFirst(el) {
    const f = el.querySelector('[autofocus]') || el.querySelector('.ui-pri') || el.querySelector('button:not([disabled]), [tabindex="0"], input, select');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  }
  /** Bildschirm wechseln */
  function screen(html, opt) {
    opt = opt || {}; if (!uiEl) init();
    if (current && current.onLeave) { try { current.onLeave(); } catch (e) { /* egal */ } }
    uiEl.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'ui-screen ' + (opt.cls || '');
    el.setAttribute('data-amu-focus-root', '');
    el.innerHTML = html;
    uiEl.appendChild(el);
    bindActions(el, opt.on);
    current = { el, onLeave: opt.onLeave, key: opt.key || null };
    if (opt.focus !== false) focusFirst(el);
    return el;
  }
  function clearScreen() { if (!uiEl) init(); if (current && current.onLeave) { try { current.onLeave(); } catch (e) { /* egal */ } } uiEl.innerHTML = ''; current = null; }
  function screenKey() { return current && current.key; }
  /** Fenster über dem Spiel */
  function modal(html, opt) {
    opt = opt || {};
    const wrap = document.createElement('div');
    wrap.className = 'ui-modal-wrap';
    wrap.innerHTML = '<div class="ui-modal ' + (opt.cls || '') + '" role="dialog" aria-modal="true" data-amu-focus-root>' +
      (opt.closable === false ? '' : '<button class="ui-x" data-a="__close" aria-label="Schließen">✕</button>') + html + '</div>';
    document.body.appendChild(wrap);
    const box = wrap.firstChild;
    const m = {
      el: box, wrap, closed: false,
      close(v) { if (m.closed) return; m.closed = true; wrap.remove(); const i = modals.indexOf(m); if (i >= 0) modals.splice(i, 1); if (opt.onClose) opt.onClose(v); }
    };
    bindActions(box, (a, v, b, e) => { if (a === '__close') m.close(); else if (opt.on) opt.on(a, v, b, e, m); });
    if (opt.closable !== false) wrap.addEventListener('pointerdown', e => { if (e.target === wrap) m.close(); });
    modals.push(m);
    focusFirst(box);
    return m;
  }
  function topModal() { return modals[modals.length - 1] || null; }
  function closeModals() { modals.slice().forEach(m => m.close()); }
  function toast(text, kind, ms) {
    if (!toastEl) init(); if (!toastEl) return;
    const t = document.createElement('div');
    t.className = 'ui-toast ' + (kind || 'info');
    t.textContent = text;
    toastEl.appendChild(t);
    while (toastEl.children.length > 4) toastEl.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms || 3200);
  }
  function confirm(text, yes, no) {
    return new Promise(res => {
      const m = modal('<p class="ui-confirm">' + esc(text) + '</p><div class="ui-row"><button class="ui-btn ui-pri" data-a="yes" autofocus>' + esc(yes || 'Ja') + '</button><button class="ui-btn" data-a="no">' + esc(no || 'Abbrechen') + '</button></div>',
        { on: a => { m.close(a === 'yes'); }, onClose: v => res(v === true) });
    });
  }
  /** Kleine Helfer für Formulare */
  function seg(name, items, val) {
    return '<div class="ui-seg" role="radiogroup" data-seg="' + esc(name) + '">' + items.map(it =>
      '<button class="ui-segb' + (String(it[0]) === String(val) ? ' on' : '') + '" data-a="seg" data-v="' + esc(name + ':' + it[0]) + '" role="radio" aria-checked="' + (String(it[0]) === String(val)) + '">' + it[1] + '</button>').join('') + '</div>';
  }
  function stepper(name, val, lo, hi, step, fmt) {
    const f = fmt || (x => x);
    return '<div class="ui-step"><button class="ui-btn ui-sm" data-a="step" data-v="' + esc(name) + ':-' + step + '" aria-label="weniger">−</button><b>' + esc(f(val)) + '</b><button class="ui-btn ui-sm" data-a="step" data-v="' + esc(name) + ':' + step + '" aria-label="mehr">+</button></div>';
  }
  function lookColor(look) { const C = AMU.COSMETICS, c = C && look && C.colors.find(x => x.id === look.color); return c ? c.hex : '#29d3ff'; }
  /** Kleines Abzeichen (Farbpunkt + Symbol + Name) */
  function badge(p, extra) {
    return '<span class="ui-badge"><i style="background:' + lookColor(p.look) + '">' + esc(p.sym || '') + '</i>' + esc(p.n || p.name || '?') + (extra || '') + '</span>';
  }
  AMU.UI = { init, screen, clearScreen, screenKey, modal, topModal, closeModals, toast, confirm, seg, stepper, badge, lookColor, esc, $, $$, bindActions, focusFirst };
})(typeof window !== 'undefined' ? window : globalThis);

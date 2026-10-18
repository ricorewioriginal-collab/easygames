/* Spinwelten 3D – DOM-Bausteine: Elemente, Hinweise, Dialoge, Fenster mit Reitern, Fokus-Navigation für Tastatur/Controller. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en);
  function h(tag, a, kids) {
    const e = document.createElement(tag);
    if (a) for (const k in a) {
      const v = a[k]; if (v === undefined || v === null || v === false) continue;
      if (k === 'cls') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v === true ? '' : v);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(c => { if (c === null || c === undefined || c === false) return; e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c); });
    return e;
  }
  function btn(label, fn, cls, attrs) { const b = h('button', Object.assign({ cls: 'btn ' + (cls || ''), type: 'button' }, attrs || {}), label); b.addEventListener('click', e => { e.stopPropagation(); if (b.disabled) return; if (SW.Audio) SW.Audio.sfx('click'); fn(e); }); return b; }
  const root = () => document.getElementById('ui');
  const UI = { h, btn, L };
  // Hinweise oben
  UI.toast = function (text, ms) {
    let box = document.getElementById('toasts'); if (!box) { box = h('div', { id: 'toasts', 'aria-live': 'polite' }); root().appendChild(box); }
    const t = h('div', { cls: 'toast' }, text); box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, ms || 2600);
  };
  UI.reward = function (main, sub) {
    let r = document.getElementById('reward'); if (!r) { r = h('div', { id: 'reward', 'aria-live': 'polite' }); root().appendChild(r); }
    r.className = ''; r.innerHTML = ''; r.appendChild(document.createTextNode(main)); if (sub) r.appendChild(h('small', null, sub));
    void r.offsetWidth; r.className = 'pop';
  };
  // Dialog: { title, text, html, img, buttons:[{label, cls, fn, keep}], onClose, noClose }
  let dlgStack = [];
  UI.dialog = function (o) {
    const wrap = h('div', { id: 'dlg', role: 'dialog', 'aria-modal': 'true' });
    const box = h('div', { cls: 'box' });
    if (o.img) box.appendChild(h('img', { cls: 'who', src: o.img, alt: '' }));
    if (o.title) box.appendChild(h('h3', null, o.title));
    if (o.text) String(o.text).split('\n').forEach(p => box.appendChild(h('p', null, p)));
    if (o.node) box.appendChild(o.node);
    const acts = h('div', { cls: 'acts' });
    const close = () => { if (!wrap.parentNode) return; wrap.remove(); dlgStack = dlgStack.filter(x => x !== api); if (o.onClose) o.onClose(); UI.refocus(); };
    (o.buttons || [{ label: L('Weiter', 'Continue'), cls: 'gold' }]).forEach(b => acts.appendChild(btn(b.label, () => { if (!b.keep) close(); if (b.fn) b.fn(); }, b.cls)));
    box.appendChild(acts); wrap.appendChild(box);
    if (!o.noClose) wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    root().appendChild(wrap);
    const api = { close, back: o.noClose ? null : close, el: wrap };
    dlgStack.push(api);
    setTimeout(() => { const f = acts.querySelector('button'); if (f && SW.Input && SW.Input.lastKind !== 'pointer') f.focus(); }, 30);
    return api;
  };
  UI.hasDialog = () => dlgStack.length > 0;
  UI.closeDialogs = () => { dlgStack.slice().forEach(d => d.close()); };
  // Fenster mit Reitern: tabs [{ id, label, render(body, ctx) }]
  let sheet = null;
  // Das Cloud-Feld (anmacha-cloud, data-mount) wird in Fenster eingehängt und vor dem Leeren gerettet
  function rescue() { const c = document.getElementById('cloudBox'), hold = document.getElementById('cloudHold'); if (c && hold && c.parentNode !== hold) hold.appendChild(c); }
  UI.sheet = function (title, tabs, start, onClose) {
    UI.closeSheet(true);
    const wrap = h('div', { id: 'sheet' }), box = h('div', { cls: 'box', role: 'dialog', 'aria-label': title });
    const head = h('div', { cls: 'head' }, [h('h2', null, title), btn('✕', () => UI.closeSheet(), 'ghost small', { 'aria-label': L('Schließen', 'Close') })]);
    const st = h('div', { cls: 'stabs', role: 'tablist' }), body = h('div', { cls: 'body' });
    box.appendChild(head); if (tabs.length > 1) box.appendChild(st); box.appendChild(body); wrap.appendChild(box);
    wrap.addEventListener('click', e => { if (e.target === wrap) UI.closeSheet(); });
    root().appendChild(wrap);
    sheet = { wrap, body, tabs, cur: null, st, onClose, title };
    const show = id => {
      const t = tabs.find(x => x.id === id) || tabs[0]; sheet.cur = t.id;
      st.querySelectorAll('.btn').forEach(b => b.classList.toggle('on', b.dataset.id === t.id));
      rescue(); body.innerHTML = ''; body.scrollTop = 0; t.render(body, { rerender: () => show(t.id), show });
    };
    tabs.forEach(t => { const b = btn(t.label, () => show(t.id), 'small', { 'data-id': t.id, role: 'tab' }); st.appendChild(b); });
    sheet.show = show; show(start || tabs[0].id);
    if (SW.Input && SW.Input.lastKind !== 'pointer') setTimeout(() => { const f = body.querySelector('button,select,input'); if (f) f.focus(); }, 30);
    return sheet;
  };
  UI.closeSheet = function (silent) { rescue(); if (!sheet) return; const s = sheet; sheet = null; s.wrap.remove(); if (!silent && s.onClose) s.onClose(); UI.refocus(); };
  UI.sheetOpen = () => !!sheet;
  UI.rerender = () => { if (sheet) sheet.show(sheet.cur); };
  UI.tab = d => { if (!sheet || sheet.tabs.length < 2) return false; const i = sheet.tabs.findIndex(t => t.id === sheet.cur); sheet.show(sheet.tabs[(i + d + sheet.tabs.length) % sheet.tabs.length].id); return true; };
  // Fokus-Navigation
  UI.layer = function () {
    if (dlgStack.length) return dlgStack[dlgStack.length - 1].el;
    if (sheet) return sheet.wrap;
    return UI.baseLayer ? UI.baseLayer() : root();
  };
  function focusables(layer) {
    return Array.from(layer.querySelectorAll('button:not([disabled]),select,input,[data-nav]')).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
  }
  UI.move = function (dir) {
    const layer = UI.layer(); if (!layer) return false;
    const els = focusables(layer); if (!els.length) return false;
    document.body.classList.add('kbd');
    const cur = layer.contains(document.activeElement) && els.includes(document.activeElement) ? document.activeElement : null;
    if (!cur) { els[0].focus(); els[0].scrollIntoView({ block: 'nearest' }); return true; }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bd = 1e9;
    for (const e of els) {
      if (e === cur) continue; const b = e.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2, dx = bx - ax, dy = by - ay;
      const ok = dir === 'left' ? dx < -4 : dir === 'right' ? dx > 4 : dir === 'up' ? dy < -4 : dy > 4; if (!ok) continue;
      const main = dir === 'left' || dir === 'right' ? Math.abs(dx) : Math.abs(dy), side = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
      const d = main + side * 2.2; if (d < bd) { bd = d; best = e; }
    }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    return true;
  };
  UI.activate = function () {
    const layer = UI.layer(), a = document.activeElement;
    if (layer && a && layer.contains(a) && a !== document.body) {
      if (a.tagName === 'INPUT' && a.type === 'checkbox') { a.click(); return true; }
      if (a.tagName === 'SELECT') { const o = a.options; a.selectedIndex = (a.selectedIndex + 1) % o.length; a.dispatchEvent(new Event('change')); return true; }
      if (a.tagName === 'INPUT' && a.type === 'range') { const st = +a.step || 0.1; a.value = +a.value + st > +a.max ? a.min : +a.value + st; a.dispatchEvent(new Event('input')); return true; }
      a.click(); return true;
    }
    return false;
  };
  UI.back = function () {
    if (dlgStack.length) { const d = dlgStack[dlgStack.length - 1]; if (d.back) d.back(); return true; }
    if (sheet) { UI.closeSheet(); return true; }
    return false;
  };
  UI.refocus = function () { if (SW.Input && SW.Input.lastKind !== 'pointer') setTimeout(() => { const l = UI.layer(); const f = l && focusables(l)[0]; if (f && !l.contains(document.activeElement)) f.focus(); }, 30); };
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  // Fortschrittsbalken
  UI.prog = (v, n) => h('div', { cls: 'prog' }, h('i', { style: 'width:' + Math.round(Math.min(1, n ? v / n : 0) * 100) + '%' }));
  // Belohnungstext
  UI.rwText = function (rw) {
    if (!rw) return '';
    const p = [];
    if (rw.coins) p.push('🪙 ' + SW.fmt(rw.coins)); if (rw.spins) p.push('⚡ ' + rw.spins); if (rw.relics) p.push('🔷 ' + rw.relics);
    if (rw.chest) p.push('🎁 ' + SW.tx(SW.CHESTS[rw.chest].name)); if (rw.snacks) p.push('🍪 ' + rw.snacks);
    return p.join('  ');
  };
  // Hervorhebung (Tutorial)
  let hlEl = null;
  UI.hl = function (el) { if (hlEl) hlEl.classList.remove('hl'); hlEl = el || null; if (hlEl) hlEl.classList.add('hl'); };
  SW.UI = UI;
})(globalThis.SW = globalThis.SW || {});

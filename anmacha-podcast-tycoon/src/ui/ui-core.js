/* Oberfläche – Grundbausteine: Fenster (Panels), Hinweise, Dialoge mit Sprecher, Auswahl, Bestätigung, Tastatur-Fokus. */
(function (root) {
  'use strict';
  const PT = root.PT; const esc = PT.esc;
  const UI = PT.UI = PT.UI || {};
  const $ = (sel, r) => (r || document).querySelector(sel);
  UI.$ = $; UI.$$ = (sel, r) => Array.from((r || document).querySelectorAll(sel));
  UI.el = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  UI.layer = () => $('#ui');
  UI.money = v => PT.money(Math.round(v));

  // ── Fenster ───────────────────────────────────────────────
  const stack = [];
  UI.isOpen = () => stack.length > 0 || !!$('.pt-dlg') || !!(PT.Harness && PT.Harness.current);
  UI.top = () => stack[stack.length - 1] || null;
  /** opts: { wide, cls, onClose, noClose, icon } → { root, body, foot, close, set(html) } */
  UI.panel = function (title, html, opts) {
    opts = opts || {};
    const p = UI.el('<section class="pt-panel ' + (opts.wide ? 'wide ' : '') + (opts.cls || '') + '" role="dialog" aria-label="' + esc(title) + '"><header><h2>' + (opts.icon ? opts.icon + ' ' : '') + esc(title) + '</h2>' + (opts.noClose ? '' : '<button class="pt-x" aria-label="Schließen">✕</button>') + '</header><div class="pt-body"></div><footer class="pt-foot"></footer></section>');
    const shade = UI.el('<div class="pt-shade"></div>'); shade.appendChild(p); UI.layer().appendChild(shade);
    const api = {
      root: p, body: $('.pt-body', p), foot: $('.pt-foot', p),
      set(h) { api.body.innerHTML = h; UI.focusFirst(p); return api; },
      footer(h) { api.foot.innerHTML = h || ''; return api; },
      close(v) { const i = stack.indexOf(api); if (i < 0) return; stack.splice(i, 1); shade.remove(); if (opts.onClose) opts.onClose(v); }
    };
    if (!opts.noClose) $('.pt-x', p).onclick = () => api.close();
    shade.addEventListener('pointerdown', e => { if (e.target === shade && !opts.noClose && !opts.modal) api.close(); });
    stack.push(api); api.set(html || ''); PT.Audio && PT.Audio.fx('click');
    return api;
  };
  UI.closeAll = () => { while (stack.length) stack[stack.length - 1].close(); };
  UI.focusFirst = function (r) { setTimeout(() => { const b = r.querySelector('[data-primary]') || r.querySelector('button:not([disabled]):not(.pt-x), input, select'); if (b && document.activeElement && !r.contains(document.activeElement)) b.focus({ preventScroll: true }); }, 30); };
  /** Klick-Delegation: data-act="name" → handlers[name](element, event) */
  UI.bind = function (rootEl, handlers) {
    rootEl.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || !rootEl.contains(b) || b.disabled) return; const f = handlers[b.dataset.act]; if (f) { e.preventDefault(); f(b, e); } });
  };

  // ── Hinweise ──────────────────────────────────────────────
  UI.toast = function (text, type, ms) {
    const box = $('#toasts'); if (!box) return;
    const t = UI.el('<div class="pt-toast ' + (type || 'info') + '">' + esc(text) + '</div>'); box.appendChild(t);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms || 3200);
  };

  // ── Dialog mit Sprecher ──────────────────────────────────
  const PEOPLE = () => { const m = {}; PT.DATA.hosts.forEach(h => { m[h.id] = h; }); PT.DATA.npcs.forEach(n => { m[n.id] = n; }); return m; };
  UI.person = function (id) {
    const p = PEOPLE()[id]; if (p) return p;
    const g = PT.DATA.guests.find(x => x.id === id); return g || { id, name: id === 'player' ? 'Du' : id, look: { shirt: '#888' } };
  };
  UI.avatar = function (id, size) {
    const p = UI.person(id), L = p.look || {}, s = size || 48;
    const beard = L.beard ? '<path d="M14 30 Q24 44 34 30 L34 34 Q24 46 14 34Z" fill="' + L.beard + '"/>' : '';
    const glasses = L.glasses ? '<g fill="none" stroke="#111" stroke-width="1.6"><circle cx="19" cy="24" r="3.6"/><circle cx="29" cy="24" r="3.6"/><path d="M22.6 24h2.8"/></g>' : '';
    const cap = L.cap ? '<path d="M12 18 Q24 6 36 18 L40 19 L12 19Z" fill="' + L.cap + '"/>' : '';
    const mask = L.mask ? '<rect x="14" y="20" width="20" height="8" rx="3" fill="#111"/>' : '';
    const badge = p.id === 'marco' || p.id === 'andrew' ? '<path d="M30 40 l5 3 -5 3z" fill="#ff8a1e"/>' : '';
    return '<svg class="pt-av" width="' + s + '" height="' + s + '" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#1b2142"/><path d="M8 48 Q8 36 24 36 Q40 36 40 48Z" fill="' + (L.shirt || '#555') + '"/>' + badge +
      '<circle cx="24" cy="24" r="11" fill="' + (L.skin || '#f0c8a8') + '"/><path d="M13 22 Q13 11 24 11 Q35 11 35 22 Q31 15 24 16 Q17 15 13 22Z" fill="' + (L.hair || '#3b2a1e') + '"/>' + beard + glasses + cap + mask +
      '<circle cx="20" cy="24" r="1.4" fill="#111"/><circle cx="28" cy="24" r="1.4" fill="#111"/><path d="M20 30 Q24 33 28 30" stroke="#111" stroke-width="1.4" fill="none"/></svg>';
  };
  /** Dialogzeilen [[sprecher, text], …] nacheinander zeigen. Gibt Promise zurück. */
  UI.dialogue = function (lines, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      lines = (lines || []).filter(l => l && l[1]); if (!lines.length) { resolve(); return; }
      const d = UI.el('<div class="pt-dlg" role="dialog"><div class="pt-dlg-in"><div class="pt-dlg-av"></div><div class="pt-dlg-tx"><b class="pt-dlg-name"></b>' + (opts.title ? '<span class="pt-dlg-title">' + esc(opts.title) + '</span>' : '') + '<p></p></div></div><button class="pt-dlg-next" aria-label="Weiter">▶</button><button class="pt-dlg-skip">Überspringen</button></div>');
      UI.layer().appendChild(d);
      let i = 0, timer = 0, full = false;
      const p = $('p', d);
      function show() {
        const [who, text] = lines[i], person = UI.person(who);
        $('.pt-dlg-av', d).innerHTML = UI.avatar(who, 64); $('.pt-dlg-name', d).textContent = person.name || who;
        let n = 0; full = false; clearInterval(timer);
        const fast = UI.settings && UI.settings.reducedMotion;
        if (fast) { p.textContent = text; full = true; return; }
        timer = setInterval(() => { n += 2; p.textContent = text.slice(0, n); if (n % 6 === 0 && PT.Audio) PT.Audio.blip(who === 'marco' || who === 'andrew' ? who : 240 + (who.length * 23) % 120); if (n >= text.length) { clearInterval(timer); full = true; } }, 22);
      }
      function next() { if (!full) { clearInterval(timer); p.textContent = lines[i][1]; full = true; return; } i++; if (i >= lines.length) done(); else show(); }
      function done() { clearInterval(timer); removeEventListener('keydown', key, true); d.remove(); resolve(); }
      function key(e) { if (['Enter', 'Space', 'KeyE', 'NumpadEnter'].includes(e.code)) { e.preventDefault(); e.stopPropagation(); next(); } else if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); done(); } }
      d.addEventListener('click', e => { if (e.target.closest('.pt-dlg-skip')) done(); else next(); });
      addEventListener('keydown', key, true); show();
    });
  };
  /** Auswahl als Fenster: options = [{label, desc, disabled}] → Promise(index | -1) */
  UI.choose = function (title, text, options, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const pnl = UI.panel(title, '<p>' + esc(text || '') + '</p><div class="pt-list">' + options.map((o, i) => '<button class="pt-opt" data-act="pick" data-i="' + i + '"' + (o.disabled ? ' disabled' : '') + (i === 0 ? ' data-primary' : '') + '><b>' + esc(o.label) + '</b>' + (o.desc ? '<small>' + esc(o.desc) + '</small>' : '') + '</button>').join('') + '</div>', { noClose: !!opts.noClose, onClose: v => resolve(v == null ? -1 : v), icon: opts.icon });
      UI.bind(pnl.root, { pick: b => pnl.close(+b.dataset.i) });
    });
  };
  UI.confirm = (title, text, yes, no) => UI.choose(title, text, [{ label: yes || 'Ja' }, { label: no || 'Abbrechen' }]).then(i => i === 0);
  UI.bar = (v, max, cls) => '<span class="pt-bar ' + (cls || '') + '"><i style="width:' + PT.clamp(Math.round(v / (max || 100) * 100), 0, 100) + '%"></i></span>';
  UI.stars = n => '★★★★★'.slice(0, n) + '<span class="dim">' + '★★★★★'.slice(n) + '</span>';
  if (typeof module !== 'undefined' && module.exports) module.exports = UI;
})(typeof window !== 'undefined' ? window : globalThis);

/* Urwaldlager – Oberfläche: Fenster mit Controller-/Tastatur-/Touch-Navigation, Kommandomenü, Moderations-Einblendungen, HUD */
(function () {
  'use strict';
  const UL = window.UL, In = UL.In, esc = UL.esc;
  const UI = UL.UI = {};
  const $ = s => document.querySelector(s);
  UI.$ = $;

  // ---------- Sprachausgabe der Moderatoren (optional, Einstellungen) ----------
  const Voice = UL.Voice = {
    ok: 'speechSynthesis' in window, voices: [],
    pick() { if (!this.ok) return; this.voices = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang)); },
    say(text, who) {
      if (!this.ok || !UL.settings.voice || UL.bot) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/[„“”"*]/g, ''));
        u.lang = 'de-DE'; const p = UL.D.VOICE[who] || {}; u.pitch = p.pitch || 1; u.rate = (p.rate || 1) * 1.05; u.volume = 0.9;
        if (!this.voices.length) this.pick();
        if (this.voices.length) { const v = this.voices; u.voice = who === 'lotte' ? (v.find(x => /female|frau|anna|petra|katja|helena|marlene|vicki/i.test(x.name)) || v[0]) : (v.find(x => /male|mann|markus|yannick|stefan|hans|conrad/i.test(x.name)) || v[v.length > 1 ? 1 : 0]); }
        speechSynthesis.speak(u);
      } catch (e) { }
    },
    stop() { if (this.ok) try { speechSynthesis.cancel(); } catch (e) { } }
  };
  if (Voice.ok) { Voice.pick(); try { speechSynthesis.onvoiceschanged = () => Voice.pick(); } catch (e) { } }

  // ---------- Fenster-Stapel mit Navigation ----------
  const stack = [];
  UI.stack = stack;
  UI.blocking = () => stack.length > 0;
  UI.open = (html, opts = {}) => {
    const el = document.createElement('div');
    el.className = 'panel ' + (opts.cls || '');
    el.innerHTML = html;
    $('#panels').appendChild(el);
    const p = { el, opts, sel: -1, items: [] };
    stack.push(p);
    UI.refresh(p);
    if (opts.focus != null) UI.focus(p, opts.focus); else UI.focus(p, 0);
    el.addEventListener('mousemove', e => { const it = e.target.closest('[data-nav]'); if (it && p.items.includes(it)) UI.focus(p, p.items.indexOf(it), true); });
    In.unlock();
    return p;
  };
  UI.refresh = (p = UI.top()) => {
    if (!p) return;
    p.items = Array.from(p.el.querySelectorAll('button, [data-nav], input, select')).filter(x => !x.disabled && x.offsetParent !== null && !x.closest('[hidden]'));
    p.items.forEach(x => x.setAttribute('data-nav', ''));
  };
  UI.top = () => stack[stack.length - 1];
  UI.close = (p = UI.top()) => {
    const i = stack.indexOf(p); if (i < 0) return;
    stack.splice(i, 1); p.el.classList.add('out'); setTimeout(() => p.el.remove(), 180);
    if (p.opts.onClose) p.opts.onClose();
    const t = UI.top(); if (t) { UI.refresh(t); UI.focus(t, Math.max(0, t.sel)); }
  };
  UI.closeAll = () => { while (stack.length) UI.close(); };
  UI.focus = (p, i, fromMouse) => {
    if (!p.items.length) { p.sel = -1; return; }
    i = UL.clamp(i, 0, p.items.length - 1);
    p.items.forEach(x => x.classList.remove('sel'));
    p.sel = i; const it = p.items[i]; it.classList.add('sel');
    if (!fromMouse) { try { it.focus({ preventScroll: true }); } catch (e) { } it.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    if (p.opts.onFocus) p.opts.onFocus(it);
  };
  // räumlich nächstes Element in Richtung d
  function moveSel(p, d) {
    if (!p.items.length) return;
    const cur = p.items[p.sel] || p.items[0], a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = -1, bs = 1e9;
    p.items.forEach((it, i) => {
      if (i === p.sel) return;
      const b = it.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2, dx = bx - ax, dy = by - ay;
      const along = d.x ? dx * d.x : dy * d.y, side = d.x ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) return;
      const s = along + side * 2.2; if (s < bs) { bs = s; best = i; }
    });
    if (best < 0) { // umlaufen in Listen
      if (d.y) best = d.y > 0 ? 0 : p.items.length - 1; else return;
    }
    UI.focus(p, best);
    UL.Audio && UL.Audio.sfx('tick');
  }
  UI.update = (dt) => {
    const p = UI.top(); if (!p) return false;
    const it = p.items[p.sel];
    const d = In.navStep(dt);
    if (d) {
      if (it && it.type === 'range' && d.x) { it.value = +it.value + d.x * (+it.step || 1); it.dispatchEvent(new Event('input', { bubbles: true })); }
      else if (it && it.tagName === 'SELECT' && d.x) { it.selectedIndex = UL.clamp(it.selectedIndex + d.x, 0, it.options.length - 1); it.dispatchEvent(new Event('change', { bubbles: true })); }
      else moveSel(p, d);
    }
    if (In.pressed('l1') && p.opts.onTab) p.opts.onTab(-1);
    if (In.pressed('r1') && p.opts.onTab) p.opts.onTab(1);
    if (In.pressed('ok') && it && In.device !== 'touch') {
      if (it.tagName === 'INPUT' && it.type === 'text') { it.focus(); }
      else { UL.Audio && UL.Audio.sfx('ok'); it.click(); }
    }
    if ((In.pressed('back') || (In.pressed('start') && p.opts.startCloses)) && p.opts.onBack) { UL.Audio && UL.Audio.sfx('back'); p.opts.onBack(); }
    return true;
  };

  // Auswahl-Fenster → Promise
  UI.choose = (title, text, options, opts = {}) => new Promise(res => {
    const who = opts.who ? `<div class="who">${opts.icon || ''} ${esc(opts.who)}</div>` : '';
    const html = `<div class="box ${opts.wide ? 'wide' : ''}">${who}${title ? `<h2>${esc(title)}</h2>` : ''}${text ? `<p class="txt">${text}</p>` : ''}
      <div class="opts">${options.map((o, i) => `<button class="opt" data-i="${i}" ${o.disabled ? 'disabled' : ''}><b>${o.icon ? o.icon + ' ' : ''}${esc(o.label)}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`).join('')}</div>
      ${opts.cancel ? `<div class="foot">${In.glyph('back')} ${esc(opts.cancel)}</div>` : ''}</div>`;
    const p = UI.open(html, { cls: 'choice ' + (opts.cls || ''), onBack: opts.cancel ? () => { UI.close(p); res(null); } : null });
    p.el.querySelectorAll('.opt').forEach(b => b.onclick = () => { UI.close(p); res(options[+b.dataset.i].value !== undefined ? options[+b.dataset.i].value : +b.dataset.i); });
  });
  UI.alert = (title, text, btn = 'Weiter') => UI.choose(title, text, [{ label: btn, value: true }]);

  // ---------- Moderation / Sprecher-Einblendung (unteres Drittel) ----------
  const PORTRAIT = { lotte: '🎤', mats: '🎙️', doc: '🩺', off: '📞', camp: '🔥' };
  UI.say = (who, text, opts = {}) => new Promise(res => {
    const cap = $('#cap');
    const name = opts.name || (UL.D.HOSTS.find(h => h.id === who) || {}).name || (who === 'doc' ? UL.D.DOC.name : who === 'off' ? 'Stimme aus dem Off' : who);
    cap.innerHTML = `<div class="cap-in ${who}"><div class="cap-who">${PORTRAIT[who] || opts.icon || '💬'} ${esc(name)}</div><div class="cap-txt">${esc(text)}</div><div class="cap-go">${In.glyph('ok')}<span>${In.device === 'touch' ? 'Tippen' : 'Weiter'}</span></div></div>`;
    cap.hidden = false;
    if (opts.voice !== false && (who === 'lotte' || who === 'mats' || who === 'doc')) Voice.say(text, who);
    const minT = 0.35, auto = opts.auto != null ? opts.auto : Math.min(9, 2.2 + text.length * 0.055) * (UL.bot ? 0.05 : 1);
    let t = 0, done = false;
    const fin = () => { if (done) return; done = true; cap.hidden = true; cap.onclick = null; UI._cap = null; Voice.stop(); res(); };
    cap.onclick = () => { if (t > minT) fin(); };
    UI._cap = { tick(dt) { t += dt; if (t > minT && (In.pressed('ok') || In.pressed('back'))) { In.eat('ok'); fin(); } if (auto && t > auto) fin(); }, fin };
  });
  UI.sayAll = async (lines, vars = {}) => { for (const [who, txt] of lines) await UI.say(who, UI.fmt(txt, vars)); };
  UI.fmt = (s, v) => String(s).replace(/\{(\w)\}/g, (m, k) => v[k] != null ? v[k] : m);
  UI.mod = async (key, vars = {}, all = false) => {
    const L = UL.D.MOD[key]; if (!L) return;
    if (all) return UI.sayAll(L, vars);
    const [who, txt] = UL.pick(L); return UI.say(who, UI.fmt(txt, vars));
  };

  // ---------- Kommandomenü (wie in Action-Rollenspielen) ----------
  const cmd = UI.cmdState = { list: [], sel: 0, key: '' };
  UI.cmd = (list) => {
    const key = list.map(c => c.id + c.label).join('|');
    if (key === cmd.key) { cmd.list = list; return; }
    const prevId = cmd.list[cmd.sel] && cmd.list[cmd.sel].id, prevIds = new Set(cmd.list.map(c => c.id));
    cmd.list = list; cmd.key = key;
    const fresh = list.findIndex(c => c.hot && !prevIds.has(c.id)), keep = list.findIndex(c => c.id === prevId);
    cmd.sel = fresh >= 0 ? fresh : keep >= 0 ? keep : Math.max(0, list.findIndex(c => c.hot));
    drawCmd();
  };
  function drawCmd() {
    const el = $('#cmd'); if (!el) return;
    if (!cmd.list.length) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<div class="cmd-h">KOMMANDO <span>${In.device === 'pad' ? In.glyph('up') + In.glyph('down') : In.device === 'kb' ? '<kbd class="g g-kb">1–' + Math.min(9, cmd.list.length) + '</kbd>' : ''}</span></div>` +
      cmd.list.map((c, i) => `<button class="cmd-i ${i === cmd.sel ? 'sel' : ''} ${c.hot ? 'hot' : ''}" data-i="${i}"><i>${c.icon || '▸'}</i><span>${esc(c.label)}</span>${i === cmd.sel ? `<em>${In.glyph('ok')}</em>` : ''}</button>`).join('');
    el.querySelectorAll('.cmd-i').forEach(b => {
      b.onclick = (e) => { cmd.sel = +b.dataset.i; drawCmd(); cmd.fire = true; };
    });
  }
  UI.drawCmd = drawCmd;
  // pro Bild im Spiel: liefert das ausgeführte Kommando (oder null)
  UI.cmdTick = () => {
    if (!cmd.list.length) return null;
    let ch = false;
    if (In.pressed('up')) { cmd.sel = (cmd.sel + cmd.list.length - 1) % cmd.list.length; ch = true; }
    if (In.pressed('down')) { cmd.sel = (cmd.sel + 1) % cmd.list.length; ch = true; }
    if (In.numNow && In.numNow <= cmd.list.length) { cmd.sel = In.numNow - 1; drawCmd(); return cmd.list[cmd.sel]; }
    if (ch) { drawCmd(); UL.Audio && UL.Audio.sfx('tick'); }
    if (cmd.fire) { cmd.fire = false; return cmd.list[cmd.sel]; }
    if (In.pressed('ok')) return cmd.list[cmd.sel];
    return null;
  };
  UL.on('device', () => { drawCmd(); UI.hint(UI._hint || {}); });

  // ---------- Tasten-Hinweise + Touch-Beschriftung ----------
  UI.hint = (map) => {
    UI._hint = map;
    const el = $('#hint'); if (!el) return;
    const parts = [];
    for (const k of ['move', 'look', 'ok', 'alt', 'menu', 'back', 'l1', 'r1', 'start', 'select']) {
      if (!map[k]) continue;
      if (k === 'move') parts.push(`<span>${In.device === 'pad' ? '<kbd class="g g-' + In.kind() + ' wide">L</kbd>' : In.device === 'kb' ? '<kbd class="g g-kb wide">WASD</kbd>' : '🕹️'} ${esc(map[k])}</span>`);
      else if (k === 'look') parts.push(`<span>${In.device === 'pad' ? '<kbd class="g g-' + In.kind() + ' wide">R</kbd>' : In.device === 'kb' ? '<kbd class="g g-kb wide">Maus</kbd>' : '👆'} ${esc(map[k])}</span>`);
      else if (In.device !== 'touch') parts.push(`<span>${In.glyph(k)} ${esc(map[k])}</span>`);
    }
    el.innerHTML = parts.join('');
    el.hidden = !parts.length || !UL.settings.hints;
    In.labels({ ok: map.okT || map.ok || null, alt: map.altT || map.alt || null, menu: map.menuT || map.menu || null, back: map.backT || map.back || null, l1: map.l1T || null, r1: map.r1T || null });
  };

  // ---------- HUD ----------
  UI.hud = (html) => { const el = $('#hud'); el.innerHTML = html; el.hidden = !html; };
  UI.toast = (text, icon = '✨', ms = 2600) => {
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<i>${icon}</i>${esc(text)}`;
    $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), ms); setTimeout(() => t.remove(), ms + 400);
  };
  UI.banner = (big, small, ms = 2200) => new Promise(res => {
    const b = $('#banner'); b.innerHTML = `<div class="bn-in"><div class="bn-big">${esc(big)}</div>${small ? `<div class="bn-small">${esc(small)}</div>` : ''}</div>`; b.hidden = false;
    b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
    UL.after(ms / 1000 * (UL.bot ? 0.1 : 1), () => { b.hidden = true; res(); });
  });
  UI.fade = (on, sec = 0.4) => new Promise(res => { const f = $('#fade'); f.style.transitionDuration = sec + 's'; f.classList.toggle('on', on); UL.after(sec * (UL.bot ? 0.1 : 1), res); });

  UI.tickOverlay = (dt) => { if (UI._cap) UI._cap.tick(dt); };
})();

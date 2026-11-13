/* AnMaCha – Der Podcast – Oberfläche: Menüs (mit Controller, Tastatur, Touch, Fernbedienung), Dialoge, Touch-Steuerung,
   Radio-&-Podcast-Fenster, Titelanzeige, Hinweise. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, I = AMC.Input;
  const UI = AMC.UI = { stack: [], faces: {}, pointerHeld: false };

  // ------------------------------------------------------------------ Bilder
  UI.podLogo = 'img/podcast-logo.jpg';   // offizielles Podcast-Logo (Marco & Andrew)
  UI.logoUrl = () => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#111218" stroke="#ff8a1e" stroke-width="6"/><path d="M47 35 L88 60 L47 85Z" fill="#ff8a1e"/></svg>');
  UI.face = id => UI.faces[id] || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#17181d"/><circle cx="50" cy="42" r="22" fill="#f0c8a8"/><path d="M28 38 Q50 8 72 38" fill="' + (id === 'marco' ? '#6b4528' : '#c9844a') + '"/>' + (id === 'marco' ? '<path d="M30 48 Q50 82 70 48 Q60 62 50 62 Q40 62 30 48Z" fill="#6b4528"/>' : '') + '<circle cx="50" cy="84" r="8" fill="#ff8a1e"/></svg>');

  // ------------------------------------------------------------------ Hinweise
  UI.toast = function (text, ms) {
    const box = U.$('toasts'), t = U.el('div', 'toast glass', text); box.appendChild(t);
    setTimeout(() => t.classList.add('out'), ms || 2600); setTimeout(() => t.remove(), (ms || 2600) + 400);
  };
  let bubbleT = null;
  UI.bubble = function (name, text, reward) {
    let b = U.$('bubble'); if (!b) { b = U.el('div', 'bubble glass'); b.id = 'bubble'; document.body.appendChild(b); }
    b.innerHTML = '<b>' + U.esc(name) + '</b><p>' + U.esc(text) + '</p>' + (reward ? '<small>' + U.esc(reward) + '</small>' : '');
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
    clearTimeout(bubbleT); bubbleT = setTimeout(() => b.classList.remove('on'), 4200);
  };

  // ------------------------------------------------------------------ Bildschirme mit Navigation
  /** Neuer Bildschirm. o: { cls, back(), onKey(name) }. Fokussierbar: [data-nav] */
  UI.open = function (html, o) {
    o = o || {};
    const el = U.el('div', 'screen ' + (o.cls || ''), html); el.setAttribute('role', 'dialog');
    U.$('ui').appendChild(el);
    const prev = UI.top(); if (prev && !o.overlay) prev.el.classList.add('under');
    const s = { el, o, focus: null };
    UI.stack.push(s);
    el.addEventListener('click', e => { const b = e.target.closest('[data-nav]'); if (b && el.contains(b)) setFocus(s, b, true); });
    requestAnimationFrame(() => el.classList.add('in'));
    const first = el.querySelector('[data-first]') || el.querySelector('[data-nav]:not([disabled])');
    if (first) setFocus(s, first);
    return s;
  };
  UI.close = function (s) {
    s = s || UI.top(); if (!s) return;
    UI.stack = UI.stack.filter(x => x !== s);
    const nt = UI.top(); if (nt) nt.el.classList.remove('under');
    s.el.classList.remove('in'); s.el.classList.add('out'); setTimeout(() => s.el.remove(), 220);
  };
  UI.closeAll = () => { while (UI.stack.length) UI.close(); };
  UI.top = () => UI.stack[UI.stack.length - 1];
  UI.isOpen = () => UI.stack.length > 0;
  function setFocus(s, b, silent) {
    if (!b) return;
    if (s.focus) s.focus.classList.remove('focus');
    s.focus = b; b.classList.add('focus');
    if (!silent) { b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    try { b.focus({ preventScroll: true }); } catch (e) { /* egal */ }
  }
  UI.focus = (b) => { const s = UI.top(); if (s) setFocus(s, b); };
  function spatial(s, dir) {
    const all = Array.from(s.el.querySelectorAll('[data-nav]')).filter(b => !b.disabled && b.offsetParent !== null);
    if (!all.length) return;
    const cur = s.focus && all.includes(s.focus) ? s.focus : null;
    if (!cur) return setFocus(s, all[0]);
    const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bd = 1e9;
    for (const b of all) {
      if (b === cur) continue;
      const q = b.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, dx = x - cx, dy = y - cy;
      const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
      if (!ok) continue;
      const main = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx), side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
      const d = main + side * 2.2;
      if (d < bd) { bd = d; best = b; }
    }
    if (!best && (dir === 'down' || dir === 'up')) { const i = all.indexOf(cur); best = all[(i + (dir === 'down' ? 1 : all.length - 1)) % all.length]; }
    if (best) { setFocus(s, best); AMC.Audio.sfx('move'); }
  }
  /** Pro Bild: Navigation im obersten Bildschirm. Liefert true, wenn ein Menü die Eingabe verbraucht hat. */
  UI.update = function () {
    const s = UI.top(); if (!s) return false;
    if (s.o.onKey && s.o.onKey()) return true;
    const f = s.focus;
    const range = f && f.tagName === 'INPUT' && f.type === 'range';
    for (const d of ['up', 'down', 'left', 'right']) if (I.hit(d)) {
      if (range && (d === 'left' || d === 'right')) { const st = +f.step || 0.05; f.value = U.clamp(+f.value + (d === 'left' ? -st : st), +f.min, +f.max); f.dispatchEvent(new Event('input', { bubbles: true })); AMC.Audio.sfx('tick'); }
      else spatial(s, d);
      break;
    }
    if (I.hit('ok') && f) { if (!range) { AMC.Audio.sfx('ok'); f.click(); } }
    else if (I.hit('back') || (I.hit('pause') && s.o.pauseCloses)) { if (s.o.back) { AMC.Audio.sfx('back'); s.o.back(); } }
    else if (I.hit('radio') && !s.o.noRadio) UI.radio();
    else if (I.hit('radioNext')) AMC.Media.cycle(1);
    else if (I.hit('radioToggle')) AMC.Media.toggle();
    return true;
  };
  // Enter auf fokussiertem Knopf löst sonst doppelt aus (Browser-Klick + unser ok)
  ['keydown', 'keyup'].forEach(ev => root.addEventListener(ev, e => { if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') && document.activeElement && document.activeElement.closest && (document.activeElement.closest('.screen') || document.activeElement.closest('.show-ui') || document.activeElement.closest('.quiz-ui'))) e.preventDefault(); }, true));

  // ------------------------------------------------------------------ Dialoge (Story)
  /** lines: [[who,text]], who: a | m | n | Name. Fertig → cb() */
  UI.dialog = function (lines, cb) {
    let i = 0, typing = null, full = '';
    const fill = t => t.replace('{x}', AMC.glyph('x')).replace('{a}', AMC.glyph('a')).replace('{rb}', AMC.glyph('rb')).replace('{rt}', AMC.glyph('rt'));
    const s = UI.open('<div class="dlg glass"><img class="dlg-face" alt=""><div class="dlg-body"><b class="dlg-name"></b><p class="dlg-txt"></p><div class="dlg-foot"><button type="button" class="btn small" data-nav id="dlgSkip">Überspringen</button><button type="button" class="btn primary small" data-nav data-first id="dlgNext">Weiter ' + AMC.glyph('a') + '</button></div></div></div>', { cls: 'dlg-screen', back: () => done(), noRadio: false });
    const el = s.el, face = el.querySelector('.dlg-face'), name = el.querySelector('.dlg-name'), txt = el.querySelector('.dlg-txt');
    function show() {
      const [w, t] = lines[i], H = w === 'a' ? D.HOSTS.andrew : w === 'm' ? D.HOSTS.marco : w === 'r' ? D.HOSTS.rico : null;
      face.src = H ? UI.face(H.id) : UI.podLogo; name.textContent = H ? H.name : w === 'n' ? 'Erzähler' : w;
      el.querySelector('.dlg').style.setProperty('--hc', H ? H.color : '#8fa0c8');
      full = fill(U.esc(t)); txt.innerHTML = '';
      let k = 0; clearInterval(typing);
      typing = setInterval(() => { k += 2; if (k >= t.length) { clearInterval(typing); typing = null; txt.innerHTML = full; return; } txt.textContent = t.slice(0, k).replace(/\{\w*\}?$/, '').replace(/\{\w+\}/g, '…'); }, 16);
      if (H) AMC.Audio.sfx('talk');
      if (AMC.Studio && AMC.Studio.react && AMC.Studio.mode === 'menu') AMC.Studio.react(w, t);
    }
    function nextLine() { if (typing) { clearInterval(typing); typing = null; txt.innerHTML = full; return; } i++; if (i >= lines.length) done(); else show(); }
    function done() { clearInterval(typing); if (AMC.Studio && AMC.Studio.react) AMC.Studio.react(null); if (!s.closed) { s.closed = true; UI.close(s); cb && cb(); } }
    el.querySelector('#dlgNext').onclick = nextLine; el.querySelector('#dlgSkip').onclick = done;
    el.addEventListener('pointerdown', e => { if (!e.target.closest('button')) nextLine(); });
    s.o.onKey = () => { if (I.hit('jump') || I.hit('act')) { nextLine(); return true; } return false; };
    show();
    return s;
  };

  // ------------------------------------------------------------------ Bestätigen
  UI.confirm = function (text, yes, no) {
    const s = UI.open('<div class="panel glass small"><p class="big">' + text + '</p><div class="row"><button class="btn" data-nav id="cNo">Abbrechen</button><button class="btn primary" data-nav data-first id="cYes">Ja</button></div></div>', { back: () => { UI.close(s); no && no(); } });
    s.el.querySelector('#cYes').onclick = () => { UI.close(s); yes && yes(); };
    s.el.querySelector('#cNo').onclick = () => { UI.close(s); no && no(); };
  };

  // ------------------------------------------------------------------ Radio & Podcast
  UI.radio = function () {
    if (UI.stack.some(s => s.o.cls === 'radio-screen')) return;
    const M = AMC.Media;
    M.refresh();
    const st = D.STATIONS.map(s => '<button type="button" class="st-item" data-nav data-st="' + s.slug + '" style="--c:' + s.color + '"><span class="st-ic">' + s.icon + '</span><span><b>' + U.esc(s.name) + '</b><small>' + U.esc(s.desc) + '</small></span><span class="st-eq"><i></i><i></i><i></i></span></button>').join('');
    const s = UI.open(
      '<div class="panel glass wide radio"><header><h2>📻 Radio &amp; Podcast</h2><button class="btn small" data-nav id="rClose">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<div class="np-card" id="rNow"></div>' +
      '<div class="r-ctl"><button class="btn" data-nav id="rPrev">⏮</button><button class="btn primary" data-nav data-first id="rPlay">▶ Abspielen</button><button class="btn" data-nav id="rNext">⏭</button><button class="btn" data-nav id="rBack">-30 s</button><button class="btn" data-nav id="rFwd">+30 s</button>' +
      '<label class="vol">🔈<input type="range" min="0" max="1" step="0.05" data-nav id="rVol" aria-label="Lautstärke Radio und Podcast"></label></div>' +
      '<div class="r-tabs"><button class="tab on" data-nav data-tab="pod">🎙️ AnMaCha – Der Podcast</button><button class="tab" data-nav data-tab="st">📻 Die Sender (13)</button></div>' +
      '<div class="r-list" id="rPod"></div><div class="r-list" id="rSt" hidden>' + st + '</div>' +
      '<p class="src">Podcast: offizieller Feed von <a href="' + D.PODCAST.page + '" target="_blank" rel="noopener">anmacha.de</a> · Sender live über <a href="https://laut.fm" target="_blank" rel="noopener">laut.fm</a> · auch in der RicoReWi Radio App. Spielmusik pausiert, solange Radio läuft.</p></div>',
      { cls: 'radio-screen', back: () => close(), noRadio: true });
    const el = s.el;
    function close() { unsub(); UI.close(s); }
    function renderPod() {
      el.querySelector('#rPod').innerHTML = M.episodes.map((e, i) => '<button type="button" class="ep-item' + (M.kind === 'podcast' && M.ep === i ? ' on' : '') + '" data-nav data-ep="' + i + '"><span class="ep-nr">' + U.esc(e.nr) + '</span><span><b>' + U.esc(e.title) + '</b><small>' + (e.date ? e.date.split('-').reverse().join('.') + ' · ' : '') + (e.dur ? Math.round(e.dur / 60) + ' Min.' : '') + (e.desc ? ' · ' + U.esc(e.desc) : '') + '</small></span><span class="st-eq"><i></i><i></i><i></i></span></button>').join('');
      el.querySelectorAll('[data-ep]').forEach(b => b.onclick = () => M.playEpisode(+b.dataset.ep));
    }
    function renderNow() {
      const L = M.label(), on = M.active();
      el.querySelector('#rNow').innerHTML = '<div class="np-art' + (on ? ' on' : '') + '"><img src="' + UI.logoUrl() + '" alt=""></div><div class="np-txt"><small>' + U.esc(L.src) + (M.loading ? ' · verbinde …' : on ? ' · läuft' : ' · gestoppt') + '</small><b>' + U.esc(L.main) + '</b><span>' + U.esc(L.sub || '') + '</span>' + (M.err ? '<em>' + U.esc(M.err) + '</em>' : '') +
        (M.kind === 'podcast' && M.dur ? '<i class="np-bar"><em style="width:' + (M.pos / M.dur * 100) + '%"></em></i>' : '') + '</div>';
      el.querySelector('#rPlay').textContent = on ? '⏹ Stopp' : '▶ Abspielen';
      el.querySelectorAll('[data-st]').forEach(b => b.classList.toggle('on', M.kind === 'radio' && M.slug === b.dataset.st && on));
      el.querySelectorAll('[data-ep]').forEach(b => b.classList.toggle('on', M.kind === 'podcast' && M.ep === +b.dataset.ep && on));
      ['rBack', 'rFwd'].forEach(id => (el.querySelector('#' + id).disabled = M.kind !== 'podcast'));
    }
    let lastLen = M.episodes.length;
    const unsub = M.subscribe(() => { if (M.episodes.length !== lastLen) { lastLen = M.episodes.length; renderPod(); } renderNow(); });
    renderPod(); renderNow();
    el.querySelector('#rClose').onclick = close;
    el.querySelector('#rPlay').onclick = () => { if (!M.kind) M.playEpisode(0); else M.toggle(); };
    el.querySelector('#rNext').onclick = () => (M.kind === 'podcast' ? M.next() : M.cycle(1));
    el.querySelector('#rPrev').onclick = () => (M.kind === 'podcast' ? M.playEpisode((M.ep - 1 + M.episodes.length) % M.episodes.length) : M.cycle(-1));
    el.querySelector('#rBack').onclick = () => M.seek(-30); el.querySelector('#rFwd').onclick = () => M.seek(30);
    const vol = el.querySelector('#rVol'); vol.value = AMC.Save.data.settings.radio; vol.oninput = () => { M.setVolume(vol.value); AMC.Save.save(); };
    el.querySelectorAll('[data-st]').forEach(b => b.onclick = () => M.playStation(b.dataset.st));
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { el.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); el.querySelector('#rPod').hidden = b.dataset.tab !== 'pod'; el.querySelector('#rSt').hidden = b.dataset.tab !== 'st'; });
    return s;
  };

  // ------------------------------------------------------------------ Titelanzeige (Jetzt läuft)
  function nowPlaying() {
    const M = AMC.Media, el = U.$('nowplaying');
    if (!M.kind || (!M.active() && !M.err)) { el.hidden = true; return; }
    const L = M.label();
    el.hidden = false; el.classList.toggle('err', !!M.err);
    el.innerHTML = '<span class="np-eq' + (M.playing ? ' on' : '') + '"><i></i><i></i><i></i></span><span class="np-t"><b>' + U.esc(M.err || L.main) + '</b><small>' + U.esc(L.src) + (L.sub && !M.err ? ' · ' + U.esc(L.sub) : '') + '</small></span><span class="np-k">' + AMC.glyph('lb') + '</span>';
  }
  UI.initNowPlaying = function () {
    AMC.Media.subscribe(nowPlaying);
    U.$('nowplaying').addEventListener('click', () => UI.radio());
    AMC.onSong = M => { if (AMC.Play && AMC.Play.active) UI.toast('📻 ' + M.station().name + ': ' + (M.artist ? M.artist + ' – ' : '') + M.title, 3200); };
  };

  // ------------------------------------------------------------------ Touch-Steuerung (ein Satz Knöpfe, wie am Controller)
  const held = {};
  UI.touchHeld = k => !!held[k];
  UI.buildTouch = function () {
    const t = U.$('touch');
    t.innerHTML = '<div class="stick" id="tStick"><i id="tKnob"></i></div>' +
      '<div class="tbtns"><button type="button" class="tb tb-x" data-k="x" aria-label="Schallwelle / Sprechen">📣</button><button type="button" class="tb tb-a" data-k="a" aria-label="Springen">⤴</button>' +
      '<button type="button" class="tb tb-b" data-k="b" aria-label="Ausweichen">💨</button><button type="button" class="tb tb-y" data-k="y" aria-label="Andrew/Marco wechseln">⇄</button></div>' +
      '<div class="ttop"><button type="button" class="tb small" data-k="radio" aria-label="Radio">📻</button><button type="button" class="tb small" data-k="pause" aria-label="Pause">⏸</button></div>';
    const stick = U.$('tStick'), knob = U.$('tKnob');
    let id = null, cx = 0, cy = 0;
    const R = 52;
    stick.addEventListener('touchstart', e => { e.preventDefault(); const p = e.changedTouches[0]; id = p.identifier; const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; move(p); }, { passive: false });
    stick.addEventListener('touchmove', e => { e.preventDefault(); for (const p of e.changedTouches) if (p.identifier === id) move(p); }, { passive: false });
    const end = e => { for (const p of e.changedTouches) if (p.identifier === id) { id = null; I.touch.mx = I.touch.my = 0; knob.style.transform = ''; } };
    stick.addEventListener('touchend', end); stick.addEventListener('touchcancel', end);
    function move(p) { let dx = p.clientX - cx, dy = p.clientY - cy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; I.touch.mx = dx / R; I.touch.my = -dy / R; }
    const MAP = { a: 'jump', x: 'act', b: 'dodge', y: 'swap', radio: 'radio', pause: 'pause' };
    t.querySelectorAll('.tb').forEach(b => {
      const k = b.dataset.k;
      b.addEventListener('touchstart', e => { e.preventDefault(); held[k] = true; if (k === 'a') I.touch.jump = true; I.fire(MAP[k]); if (k === 'a' || k === 'x') I.fire('ok'); b.classList.add('down'); }, { passive: false });
      const up = e => { e.preventDefault(); held[k] = false; if (k === 'a') I.touch.jump = false; b.classList.remove('down'); };
      b.addEventListener('touchend', up); b.addEventListener('touchcancel', up);
      b.addEventListener('click', () => { if (I.device !== 'touch') I.fire(MAP[k]); });
    });
  };
  UI.showTouch = on => { const t = U.$('touch'); t.hidden = !(on && I.device === 'touch'); };
  root.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.sh-mini')) UI.pointerHeld = true; });
  root.addEventListener('pointerup', () => { UI.pointerHeld = false; });
  root.addEventListener('pointercancel', () => { UI.pointerHeld = false; });
})(typeof window !== 'undefined' ? window : globalThis);

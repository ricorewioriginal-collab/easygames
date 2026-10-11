/* Urwaldlager – Prüfungs-Host: Einführung, Countdown, HUD, Pause, Abbruch, 2D/3D-Szenen, Teststeuerung (Bot) */
(function (root) {
  'use strict';
  const E = root.UE, I = root.UIn, THREE = root.THREE;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const snd = () => root.USnd || new Proxy({}, { get: () => () => { } });
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const T = { defs: {}, order: [], active: null, bot: false };
  T.def = d => { T.defs[d.id] = d; if (!T.order.includes(d.id)) T.order.push(d.id); };
  T.list = () => T.order.map(id => T.defs[id]).filter(d => !d.hidden);

  // ---- DOM
  let box, hudEl, cv2, c2, cdEl, banner, introEl, pauseEl;
  function dom() {
    if (box) return; const ui = document.getElementById('ui') || document.body;
    box = document.createElement('div'); box.id = 'trial'; box.hidden = true;
    box.innerHTML = `<canvas id="t2d" hidden></canvas>
      <div id="thud"><div class="tl"><b id="tName"></b><small id="tPart"></small></div>
        <div class="tc"><div class="ttime"><i id="tTimeBar"></i><span id="tTime"></span></div><div id="tStars" class="tstars"></div></div>
        <div class="tr"><button class="tbtn" data-t="pause" aria-label="Pause">❚❚</button><button class="tbtn raus" data-t="quit">🔔 Raus</button></div>
        <div id="tMeters"></div><div id="tHint"></div></div>
      <div id="tToast"></div><div id="tCd"></div><div id="tBanner"></div>
      <div id="tIntro" class="ovl" hidden></div><div id="tPause" class="ovl" hidden></div>`;
    ui.appendChild(box); hudEl = box.querySelector('#thud'); cv2 = box.querySelector('#t2d'); c2 = cv2.getContext('2d'); cdEl = box.querySelector('#tCd'); banner = box.querySelector('#tBanner'); introEl = box.querySelector('#tIntro'); pauseEl = box.querySelector('#tPause');
    box.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b || !T.active) return; snd().click(); const a = b.dataset.t; if (a === 'pause') pause(true); else if (a === 'quit') askQuit(); else if (a === 'resume') pause(false); else if (a === 'quitYes') quit(); else if (a === 'go') begin(); else if (a === 'back') cancel(); });
  }
  function hudApi(R) {
    const starsEl = box.querySelector('#tStars'), timeEl = box.querySelector('#tTime'), barEl = box.querySelector('#tTimeBar'), mEl = box.querySelector('#tMeters'), hintEl = box.querySelector('#tHint'), toastEl = box.querySelector('#tToast');
    let shown = -1, toastT = 0, meters = {};
    starsEl.innerHTML = Array.from({ length: R.max }, () => '<i>★</i>').join('');
    mEl.innerHTML = ''; hintEl.textContent = ''; timeEl.textContent = ''; barEl.style.width = '100%';
    return {
      stars(n) { n = clamp(Math.floor(n), 0, R.max); R.stars = n; if (n === shown) return; if (n > shown && shown >= 0) snd().star(); shown = n; starsEl.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i < n)); },
      time(sec, frac) { const t = Math.max(0, Math.ceil(sec)); const s = sec == null ? '' : (t >= 60 ? Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') : t + ' s'); if (timeEl.textContent !== s) timeEl.textContent = s; if (frac != null) { barEl.style.width = (clamp(frac, 0, 1) * 100).toFixed(1) + '%'; barEl.classList.toggle('low', frac < .25); } },
      meter(id, frac, label, color) {
        let m = meters[id]; if (!m) { m = meters[id] = document.createElement('div'); m.className = 'tmeter'; m.innerHTML = '<span></span><div><i></i></div>'; mEl.appendChild(m); m._s = m.querySelector('span'); m._i = m.querySelector('i'); }
        if (frac == null) { m.hidden = true; return; } m.hidden = false; if (label != null && m._s.textContent !== label) m._s.textContent = label; m._i.style.width = (clamp(frac, 0, 1) * 100).toFixed(1) + '%'; if (color) m._i.style.background = color;
      },
      hint(t) { t = t || ''; if (hintEl.textContent !== t) hintEl.textContent = t; },
      toast(t, kind) { toastEl.textContent = t; toastEl.className = 'show ' + (kind || ''); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.className = ''; }, 1400); },
      part(t) { box.querySelector('#tPart').textContent = t || ''; }
    };
  }

  // ---- Lauf
  let R = null; // aktueller Lauf
  function makeCtx(def, opts) {
    const ctx = {
      THREE, E, I, S: snd(), def, opts, level: opts.level == null ? 1 : opts.level, handi: clamp(opts.handi || 0, 0, .6), max: opts.max || 6, short: !!opts.short, final: !!opts.final, who: opts.who || {},
      touch: I.touch, W: E.W, H: E.H, stars: 0, t: 0, done: false, _resize: [],
      onResize(f) { ctx._resize.push(f); }, figure: (look, o) => E.Figure(look, o)
    };
    ctx.diff = clamp([.18, .5, .8][ctx.level] + ctx.handi * .35 + (ctx.final ? .1 : 0), 0, 1);
    ctx.finish = (stars, reason) => finish(stars, reason);
    return ctx;
  }
  T.start = function (id, opts, done) {
    dom(); const def = T.defs[id]; if (!def) throw new Error('Prüfung unbekannt: ' + id);
    if (T.active) end(true);
    opts = opts || {}; R = { def, opts, done, max: opts.max || 6, stars: 0, phase: 'intro', inst: null, ctx: null, t: 0, prevMode: E.mode };
    T.active = R; box.hidden = false; hudEl.hidden = true; cv2.hidden = true; banner.className = ''; cdEl.textContent = '';
    box.querySelector('#tName').textContent = def.e + ' ' + def.name; box.querySelector('#tPart').textContent = opts.partLabel || '';
    const how = I.touch ? (def.how.touch || def.how.pc) : (def.how.pc || def.how.touch);
    const lv = ['Leicht', 'Normal', 'Schwer'][opts.level == null ? 1 : opts.level];
    introEl.innerHTML = `<div class="card cen tintro"><span class="kind ${def.kind}">${esc(opts.partLabel || def.kind.toUpperCase() + '-PRÜFUNG')}</span><h2>${def.e} ${esc(def.name)}</h2>${opts.who && opts.who.name ? `<p class="h">Kandidat: <b>${esc(opts.who.name)}</b></p>` : ''}<p>${def.desc}</p>
      <div class="ctrl"><b>${I.touch ? '📱 Steuerung' : '⌨️ Steuerung'}</b><p>${how}</p></div><p class="h">Ziel: bis zu <b>${R.max} Sterne</b> · Schwierigkeit: ${lv}${opts.handi > .2 ? ' · erschöpft (schwerer)' : ''} · Abbruch jederzeit mit „🔔 Raus“ – die Sterne bis dahin zählen.</p>
      <div class="row c"><button class="btn go big" data-t="go">Los geht’s ▶</button>${opts.cancelable ? '<button class="btn" data-t="back">Zurück</button>' : ''}</div></div>`;
    introEl.hidden = false; pauseEl.hidden = true; I.setLayout(null); I.setLock(false);
    if (T.bot) setTimeout(() => { if (R && R.phase === 'intro') begin(); }, 50);
  };
  function begin() {
    if (!R || R.phase !== 'intro') return; introEl.hidden = true; hudEl.hidden = false; R.hud = hudApi(R);
    const def = R.def, ctx = R.ctx = makeCtx(def, R.opts); ctx.hud = R.hud; R.hud.stars(0);
    if (def.mode === '3d') {
      ctx.scene = new THREE.Scene(); ctx.camera = new THREE.PerspectiveCamera(def.fov || 65, E.W / E.H, .05, def.far || 220); cv2.hidden = true;
      ctx.lights = (o) => { o = o || {}; const h = new THREE.HemisphereLight(o.sky || 0xcfe8ff, o.ground || 0x2a3a1a, o.hemi == null ? .8 : o.hemi); ctx.scene.add(h); const d = new THREE.DirectionalLight(o.sun || 0xfff2d6, o.dir == null ? .8 : o.dir); d.position.set(5, 12, 4); ctx.scene.add(d); ctx.scene.add(d.target); return { hemi: h, sun: d }; };
    } else {
      cv2.hidden = false; ctx.c = c2; ctx.canvas = cv2; fit2d();
    }
    I.setLayout(def.controls === false ? null : Object.assign({ joy: def.mode === '3d', look: def.mode === '3d' }, def.controls || {}));
    I.setLock(def.mode === '3d' && def.lock !== false);
    try { R.inst = def.create(ctx); } catch (err) { console.error(err); R.phase = 'over'; finishNow({ stars: 0, error: String(err) }); return; }
    R.phase = 'count'; R.cd = T.bot ? .05 : 3.2;
    E.setMode({ update: step, render, scene: def.mode === '3d' ? ctx.scene : null, camera: ctx.camera });
    snd().drum && snd().drum();
  }
  function fit2d() { if (!R || !R.ctx || !R.ctx.c) return; const dpr = Math.min(2, root.devicePixelRatio || 1) * (E.q.level === 'low' ? .75 : 1); const w = E.W, h = E.H; cv2.width = Math.round(w * dpr); cv2.height = Math.round(h * dpr); cv2.style.width = w + 'px'; cv2.style.height = h + 'px'; c2.setTransform(dpr, 0, 0, dpr, 0, 0); R.ctx.W = w; R.ctx.H = h; R.ctx.dpr = dpr; if (R.inst && R.inst.resize) R.inst.resize(w, h); }
  E.onResize.push(() => { if (!R || !R.ctx) return; if (R.ctx.camera) E.fitCamera(R.ctx.camera); R.ctx.W = E.W; R.ctx.H = E.H; if (R.def.mode === '2d') fit2d(); else if (R.inst && R.inst.resize) R.inst.resize(E.W, E.H); R.ctx._resize.forEach(f => f(E.W, E.H)); });
  // 2D-Zeiger
  function ptr(type) { return e => { if (!R || !R.inst || !R.inst.pointer || R.phase !== 'play') return; if (type === 'down') { e.preventDefault(); try { cv2.setPointerCapture(e.pointerId); } catch (x) { } } const r = cv2.getBoundingClientRect(); R.inst.pointer(type, e.clientX - r.left, e.clientY - r.top, e.pointerId); }; }
  let ptrBound = false;
  function bindPtr() { if (ptrBound) return; ptrBound = true; cv2.addEventListener('pointerdown', ptr('down')); cv2.addEventListener('pointermove', ptr('move')); cv2.addEventListener('pointerup', ptr('up')); cv2.addEventListener('pointercancel', ptr('up')); cv2.addEventListener('touchstart', e => e.preventDefault(), { passive: false }); }

  function step(dt) {
    if (!R || !R.inst) return; const ctx = R.ctx;
    if (R.phase === 'count') { R.cd -= dt; const n = Math.ceil(R.cd - .2); const t = n > 0 ? String(n) : 'LOS!'; if (cdEl.textContent !== t) { cdEl.textContent = t; cdEl.className = 'show'; if (n > 0) snd().reveal && snd().reveal(); } if (R.cd <= 0) { R.phase = 'play'; setTimeout(() => { if (cdEl.textContent === 'LOS!') cdEl.className = ''; }, 500); I.clearEdges(); } if (R.inst.idle) R.inst.idle(dt); return; }
    if (R.phase === 'play') {
      if (T.bot && R.inst.bot) applyBot(R.inst.bot(dt, ctx));
      I.poll(); ctx.t += dt; R.t += dt; ctx.touch = I.touch;
      R.inst.update(dt);
      if (T.bot) { I.held = {}; I.botMove = null; }
      return;
    }
    if (R.phase === 'over') { R.overT -= dt; if (R.inst.idle) R.inst.idle(dt); if (R.overT <= 0) { R.phase = 'closing'; finishNow(R.result); } }
  }
  function applyBot(b) {
    if (!b) return; I.botMove = b.move || null; I.held = Object.assign({}, b.hold || {}); (b.press || []).forEach(k => { I.edge[k] = true; I.held[k] = true; });
    if (b.look) { I.look.dx += b.look.dx || 0; I.look.dy += b.look.dy || 0; }
    (b.pointer || []).forEach(p => R.inst.pointer && R.inst.pointer(p[0], p[1], p[2], p[3] || 1));
  }
  const _poll = I.poll; I.poll = function () { const m = _poll(); if (I.botMove) { m.x = I.botMove.x || 0; m.y = I.botMove.y || 0; m.mag = Math.min(1, Math.hypot(m.x, m.y)); } return m; };
  function render(r) {
    if (!R || !R.inst) return;
    if (R.def.mode === '3d') { r.render(R.ctx.scene, R.ctx.camera); }
    else { const c = c2; c.save(); try { R.inst.draw(c, R.ctx); } finally { c.restore(); } }
  }
  function finish(stars, reason) {
    if (!R || R.phase === 'over' || R.phase === 'closing') return; stars = clamp(Math.round(stars), 0, R.max);
    R.hud.stars(stars); R.phase = 'over'; R.overT = T.bot ? .05 : 1.6; R.result = { stars, max: R.max, reason: reason || 'done', time: R.t, id: R.def.id, details: R.inst && R.inst.details ? R.inst.details() : null };
    const txt = reason === 'abort' ? 'Abgebrochen' : reason === 'time' ? 'Zeit abgelaufen!' : reason === 'fail' ? 'Vorbei!' : stars >= R.max ? 'Alle Sterne!' : 'Geschafft!';
    banner.textContent = txt + ` · ${stars}/${R.max} ★`; banner.className = 'show ' + (stars >= R.max * .67 ? 'good' : stars ? '' : 'bad');
    I.setLayout(null); I.setLock(false); snd()[stars >= R.max * .67 ? 'win' : stars ? 'star' : 'lose']();
  }
  function finishNow(res) { const r = R; end(false); if (r && r.done) r.done(res || { stars: 0, max: r.max }); }
  function end(silent) {
    if (!R) return; const r = R; R = null; T.active = null;
    try { if (r.inst && r.inst.dispose) r.inst.dispose(); } catch (e) { console.error(e); }
    if (r.ctx && r.ctx.scene) { E.dispose(r.ctx.scene); }
    I.setLayout(null); I.setLock(false); I.botMove = null; box.hidden = true; introEl.hidden = true; pauseEl.hidden = true; cv2.hidden = true; banner.className = ''; cdEl.className = '';
    E.paused = false; if (silent) return;
    if (r.prevMode && E.mode && E.mode.update === step) E.setMode(r.prevMode);
  }
  function cancel() { if (!R) return; const r = R; end(false); if (r.opts.onCancel) r.opts.onCancel(); }
  function pause(on) {
    if (!R || (R.phase !== 'play' && R.phase !== 'count')) { if (!on && R) { pauseEl.hidden = true; E.paused = false; } return; }
    E.paused = on; pauseEl.hidden = !on; I.reset();
    if (on) { I.releaseLock(); pauseEl.innerHTML = `<div class="card cen"><h2>⏸ Pause</h2><p class="h">${esc(R.def.name)} – Zeit steht still.</p><div class="row c"><button class="btn go big" data-t="resume">Weiter ▶</button><button class="btn red" data-t="quitYes">🔔 Abbrechen</button></div></div>`; }
    else I.setLock(R.def.mode === '3d' && R.def.lock !== false);
  }
  function askQuit() {
    if (!R || R.phase !== 'play' && R.phase !== 'count') return; E.paused = true; I.releaseLock();
    pauseEl.innerHTML = `<div class="card cen"><h2>🔔 Wirklich abbrechen?</h2><p>„Urwald, ich will raus!“ – bisher gesammelte Sterne (${R.stars}) zählen, aber das Publikum sieht einen Abbruch nicht gern.</p><div class="row c"><button class="btn" data-t="resume">Weitermachen</button><button class="btn red big" data-t="quitYes">Raus hier!</button></div></div>`;
    pauseEl.hidden = false;
  }
  function quit() { if (!R) return; pauseEl.hidden = true; E.paused = false; finish(R.stars, 'abort'); }
  T.pause = () => pause(true); T.isRunning = () => !!R && (R.phase === 'play' || R.phase === 'count');
  T.abort = () => quit();
  T.forceEnd = stars => { if (!R) return; if (R.phase === 'intro') begin(); finish(stars == null ? R.stars : stars, 'done'); };
  T.state = () => R ? { id: R.def.id, phase: R.phase, stars: R.stars, t: R.t, dbg: R.inst && R.inst.debug ? R.inst.debug() : null } : null;
  I.onPause = I.onPause || null;
  T.onKeyPause = () => { if (R && (R.phase === 'play' || R.phase === 'count')) { pause(!E.paused); return true; } return false; };

  // Mehrteilige Prüfungen (Finale): Teile nacheinander, Sterne addiert
  T.sequence = function (parts, opts, done) {
    const res = []; let i = 0;
    const next = () => {
      if (i >= parts.length) { const stars = res.reduce((a, r) => a + r.stars, 0), max = res.reduce((a, r) => a + r.max, 0); done({ stars, max, parts: res, aborted: res.some(r => r.reason === 'abort') }); return; }
      const p = parts[i]; T.start(p.id, Object.assign({}, opts, { max: p.max || 3, short: true, partLabel: (opts.seqLabel || 'TEIL') + ' ' + (i + 1) + ' VON ' + parts.length }), r => { res.push(r); i++; if (r.reason === 'abort') { while (i < parts.length) { res.push({ stars: 0, max: parts[i].max || 3, reason: 'abort', id: parts[i].id }); i++; } } next(); });
    };
    next();
  };
  T.init = () => { dom(); bindPtr(); };
  // gemeinsame Zeichen-Helfer für 2D-Prüfungen
  T.draw = {
    rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
    star(c, x, y, r, rot, a) { c.save(); if (a != null) c.globalAlpha = a; c.beginPath(); for (let i = 0; i < 10; i++) { const an = (rot || 0) + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .46 : r; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.closePath(); const g = c.createLinearGradient(x, y - r, x, y + r); g.addColorStop(0, '#fff6b0'); g.addColorStop(1, '#ffb300'); c.fillStyle = g; c.fill(); c.lineWidth = Math.max(1, r * .1); c.strokeStyle = '#a86a00'; c.stroke(); c.restore(); },
    text(c, s, x, y, size, col, align, wt) { c.font = `${wt || 800} ${size}px Inter,system-ui,"Segoe UI",Roboto,Arial,sans-serif`; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = col || '#fff'; c.fillText(s, x, y); },
    emoji(c, s, x, y, size) { c.font = `${size}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
  };
  // gemeinsame 3D-Helfer
  T.make = {
    starMesh() { if (!T._starGeo) { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? .19 : .42; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, -Math.sin(a) * r); } T._starGeo = new THREE.ExtrudeGeometry(s, { depth: .1, bevelEnabled: false }); T._starGeo.translate(0, 0, -.05); T._starGeo.userData.shared = true; T._starMat = new THREE.MeshLambertMaterial({ color: 0xffc928, emissive: 0x7a5200 }); T._starMat.userData.shared = true; } return new THREE.Mesh(T._starGeo, T._starMat); }
  };
  root.UTrials = T;
})(window);

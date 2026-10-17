/* Minispiel-Rahmen: BEREIT → SPIELEN → GEWONNEN/VERLOREN → BELOHNUNG → ZURÜCK.
   Pause, Neustart, Schwierigkeit, Bildschirmtasten, Tastenbelegung, Klänge, geteilte 3D-Szene, lokal reihum (gleicher Seed). */
(function (root) {
  'use strict';
  const PT = root.PT, MG = PT.MG;
  const W = 960, H = 540, DT = 1 / 60;
  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    Space: 'a', Enter: 'a', NumpadEnter: 'a', KeyE: 'b', KeyQ: 'b', Backspace: 'b', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Numpad1: '1', Numpad2: '2', Numpad3: '3', Numpad4: '4' };
  const TOUCH_LABEL = { left: '◀', right: '▶', up: '▲', down: '▼', a: 'A', b: 'B', 1: '1', 2: '2', 3: '3', 4: '4' };
  const esc = PT.esc;
  let current = null;
  // Gerät mit Touch als Hauptbedienung? (bestimmt Reihenfolge der Steuerungstexte und den Einblendetext)
  const isTouch = () => !!(root.matchMedia && root.matchMedia('(pointer: coarse)').matches);
  /** Ziel-Satz je Stufe: def.goal (Text oder Funktion(stufe)), sonst der Kurztext. */
  const goalOf = (def, d) => (typeof def.goal === 'function' ? def.goal(d) : def.goal) || def.short;
  /** Einblendung in den ersten Sekunden: def.tip = Text oder { key, touch, y } (y = logische Höhe 0..540). */
  const tipOf = (def, st) => { const t = typeof def.tip === 'function' ? def.tip(st) : def.tip; if (!t) return ''; return typeof t === 'string' ? t : (isTouch() ? t.touch || t.key : t.key || t.touch); };
  function helpHtml(def, d) {
    const c = def.controls, touch = isTouch();
    const ctl = (touch ? [['👆', c.touch], ['⌨️', c.key]] : [['⌨️', c.key], ['🖱️', c.mouse || c.touch]]).concat(c.pad ? [['🎮', c.pad]] : []);
    return '<p class="pt-mg-goal"><span>🎯 Ziel:</span> <b data-goal>' + esc(goalOf(def, d)) + '</b></p>' +
      (def.pic ? '<div class="pt-mg-pic" aria-hidden="true">' + def.pic + '</div>' : '') +
      (def.how ? '<h3 class="pt-mg-h">So geht’s</h3><ol class="pt-mg-how">' + def.how.map(r => '<li>' + esc(r) + '</li>').join('') + '</ol>' : '') +
      '<p class="pt-mg-ctl">' + ctl.map(x => x[0] + ' ' + esc(x[1])).join('<br>') + '</p>';
  }

  function fit(w, h) { const s = Math.min(w / W, h / H); const cw = Math.floor(W * s), ch = Math.floor(H * s); return { x: Math.floor((w - cw) / 2), y: Math.floor((h - ch) / 2), w: cw, h: ch, s }; }

  /**
   * opts: { id, difficulty, seed, players:[{name}], allowDiff, world, title, reward(res) → [Zeilen], onDone(res|null), keymap }
   * res: { id, won, score, detail, difficulty, results:[{name, won, score, detail}] }
   */
  function run(opts) {
    if (current) current.close(null);
    const def = MG.get(opts.id); if (!def) { opts.onDone && opts.onDone(null); return null; }
    const players = (opts.players && opts.players.length ? opts.players : [{ name: 'Du' }]).slice(0, def.multi && def.multi.local ? (def.multi.max || 4) : 1);
    let diff = opts.difficulty == null ? 1 : opts.difficulty, seed = (opts.seed >>> 0) || ((Date.now() % 1e9) >>> 0);
    const keymap = Object.assign({}, KEYMAP, opts.keymap || {});
    const box = document.createElement('div'); box.className = 'pt-mg';
    box.innerHTML = '<canvas class="pt-mg-cv"></canvas><div class="pt-mg-flash"></div><div class="pt-mg-tip" hidden></div><div class="pt-mg-rot">📱↻ Quer halten = größeres Spielfeld</div><div class="pt-mg-bar"><span class="pt-mg-title"></span><button class="pt-mg-pause" aria-label="Pause">⏸</button></div><div class="pt-mg-touch"></div><div class="pt-mg-card" hidden></div>';
    document.body.appendChild(box); document.body.classList.add('pt-mg-on');
    const cv = box.querySelector('.pt-mg-cv'), flash = box.querySelector('.pt-mg-flash'), tip = box.querySelector('.pt-mg-tip'), g = cv.getContext('2d'), card = box.querySelector('.pt-mg-card'), touch = box.querySelector('.pt-mg-touch');
    box.querySelector('.pt-mg-title').textContent = def.icon + ' ' + def.name;
    let phase = 'ready', st = null, h3 = null, turn = 0, results = [], acc = 0, last = 0, raf = 0, endT = 0, rect = fit(innerWidth, innerHeight), dpr = 1;
    const is3d = def.render === '3d' && opts.world && opts.world.mgScene;
    const held = {};
    let tipT = 0;

    function layout() {
      rect = fit(innerWidth, innerHeight); dpr = Math.min(2, root.devicePixelRatio || 1);
      Object.assign(cv.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.w + 'px', height: rect.h + 'px' });
      Object.assign(flash.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.w + 'px', height: rect.h + 'px' });
      // Hochkant mit Platz unter dem Spielfeld: Einblendung darunter statt über das kleine Spielfeld
      const ty = def.tip && def.tip.y != null ? def.tip.y : 300, below = innerHeight - rect.y - rect.h > 150;
      tip.style.top = Math.round(below ? rect.y + rect.h + 70 : rect.y + ty / H * rect.h) + 'px';
      cv.width = Math.round(rect.w * dpr); cv.height = Math.round(rect.h * dpr);
      if (is3d) opts.world.resize(innerWidth, innerHeight);
    }
    function send(a) { if (phase === 'play' && st && st.status === 'playing') { a.p = turn; def.input(st, a); } }
    function key(k, down) { if (held[k] === down) return; held[k] = down; send({ type: 'key', key: k, down }); }
    // Bildschirmtasten
    const keys = (def.touch || []).filter(k => TOUCH_LABEL[k]);
    const dirs = keys.filter(k => ['left', 'right', 'up', 'down'].includes(k)), acts = keys.filter(k => !dirs.includes(k));
    touch.innerHTML = '<div class="pt-mg-dpad">' + dirs.map(k => '<button data-k="' + k + '" class="k-' + k + '">' + TOUCH_LABEL[k] + '</button>').join('') + '</div><div class="pt-mg-acts">' + acts.map(k => '<button data-k="' + k + '">' + TOUCH_LABEL[k] + '</button>').join('') + '</div>';
    touch.querySelectorAll('button').forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); b.classList.add('on'); key(k, true); }, off = e => { e.preventDefault(); b.classList.remove('on'); key(k, false); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    });
    // Zeiger auf der Spielfläche
    let ptrDown = false;
    const toLogical = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
    const onPtr = phaseName => e => {
      // Bewegung nur bei gedrückter Taste/Finger weiterleiten – sonst lenkt ein ruhender Mauszeiger Fahrzeuge/Regler ungewollt (def.hover = Ausnahme)
      if (phase !== 'play') return; if (phaseName === 'move' && !ptrDown && !def.hover) return;
      if (phaseName === 'down') { ptrDown = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } }
      if (phaseName === 'up') ptrDown = false;
      const p = toLogical(e); send({ type: 'pointer', phase: phaseName, x: PT.clamp(p.x, 0, W), y: PT.clamp(p.y, 0, H) }); e.preventDefault();
    };
    cv.addEventListener('pointerdown', onPtr('down')); cv.addEventListener('pointermove', onPtr('move')); cv.addEventListener('pointerup', onPtr('up')); cv.addEventListener('pointercancel', onPtr('up'));
    function onKey(e) {
      if (e.repeat && e.type === 'keydown') { if (KEYMAP[e.code]) e.preventDefault(); return; }
      if (e.code === 'Escape' || e.code === 'KeyP') { if (e.type === 'keydown') { if (phase === 'play') pause(); else if (phase === 'pause') resume(); } e.preventDefault(); return; }
      if (phase !== 'play') { if (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space')) { const b = card.querySelector('[data-primary]'); if (b) { b.click(); e.preventDefault(); } } return; }
      const k = keymap[e.code]; if (!k) return; e.preventDefault(); key(k, e.type === 'keydown');
    }
    addEventListener('keydown', onKey); addEventListener('keyup', onKey); addEventListener('resize', layout);
    const onVis = () => { if (document.hidden && phase === 'play') pause(); }; document.addEventListener('visibilitychange', onVis);
    box.querySelector('.pt-mg-pause').onclick = () => { if (phase === 'play') pause(); else if (phase === 'pause') resume(); };

    function showCard(html) { card.innerHTML = html; card.hidden = false; const p = card.querySelector('[data-primary]'); if (p) setTimeout(() => p.focus(), 30); }
    function ready() {
      phase = 'ready'; teardown3d();
      const multi = players.length > 1;
      showCard('<div class="pt-mg-in"><h2><span class="pt-mg-ico2">' + def.icon + '</span> ' + esc(def.name) + '</h2>' +
        (opts.title ? '<p class="pt-mg-ctx">' + esc(opts.title) + '</p>' : '') +
        (def.how ? '' : '<p class="pt-mg-short">' + esc(def.short) + '</p>') + helpHtml(def, diff) +
        (isTouch() && innerHeight > innerWidth ? '<p class="pt-mg-ctx">📱↻ Tipp: Handy quer halten – dann ist das Spielfeld größer.</p>' : '') +
        '<details class="pt-mg-more"><summary>Alle Regeln</summary><ul class="pt-mg-rules">' + def.rules.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul></details>' +
        (opts.allowDiff !== false ? '<div class="pt-mg-diff" role="group" aria-label="Schwierigkeit">' + MG.DIFF.map((n, i) => '<button data-d="' + i + '" class="' + (i === diff ? 'sel' : '') + '">' + n + '</button>').join('') + '</div>' : '<p class="pt-mg-ctx">Stufe: ' + MG.DIFF[diff] + '</p>') +
        (multi ? '<p class="pt-mg-turn">Reihum mit gleichem Ablauf: ' + players.map((p, i) => (i === turn ? '<b>' + esc(p.name) + '</b>' : esc(p.name))).join(' · ') + '</p>' : '') +
        '<div class="pt-mg-btns"><button data-primary class="pri">' + (multi ? '▶ ' + esc(players[turn].name) + ' startet' : '▶ Los geht’s') + '</button>' + (opts.onDone ? '<button data-act="quit">Zurück</button>' : '') + '</div></div>');
      card.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { diff = +b.dataset.d; card.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('sel', x === b)); card.querySelector('[data-goal]').textContent = goalOf(def, diff); }; });
      card.querySelector('[data-primary]').onclick = start;
      const q = card.querySelector('[data-act="quit"]'); if (q) q.onclick = () => close(null);
    }
    function start() {
      card.hidden = true; Object.keys(held).forEach(k => { held[k] = false; });
      st = def.init({ difficulty: diff, seed, players, turn });
      if (is3d) { h3 = def.setup3d(opts.world.mgScene(), st); opts.world.setCamMode && opts.world.setCamMode('mg'); }
      phase = 'play'; acc = 0; last = performance.now(); endT = 0; PT.Audio && PT.Audio.fx('whoosh');
      const tt = tipOf(def, st); tip.hidden = !tt; tip.textContent = tt; tip.classList.remove('go'); clearTimeout(tipT);
      if (tt) { void tip.offsetWidth; tip.classList.add('go'); tipT = setTimeout(() => tip.classList.remove('go'), 5200); }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function pause() {
      phase = 'pause';
      showCard('<div class="pt-mg-in"><h2>⏸ Pause</h2>' + helpHtml(def, diff) + '<div class="pt-mg-btns col"><button data-primary class="pri" data-act="go">Weiter</button><button data-act="restart">Neu starten</button><button data-act="giveup">Aufgeben</button></div></div>');
      card.querySelector('[data-act="go"]').onclick = resume;
      card.querySelector('[data-act="restart"]').onclick = () => { teardown3d(); start(); };
      card.querySelector('[data-act="giveup"]').onclick = () => { teardown3d(); results[turn] = { name: players[turn].name, won: false, score: 0, detail: 'Aufgegeben.' }; finishTurn(); };
    }
    function resume() { card.hidden = true; phase = 'play'; last = performance.now(); }
    function teardown3d() { if (h3 && def.dispose3d) { try { def.dispose3d(h3); } catch (e) { /* weiter */ } } h3 = null; }
    function loop(now) {
      raf = 0; if (!box.isConnected) return;
      if (phase === 'play' && st) {
        const fdt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
        if (st.status === 'playing') { acc += fdt; while (acc >= DT && st.status === 'playing') { def.update(st, DT); acc -= DT; } }
        else { endT += fdt; if (endT > 0.9) { const r = def.result(st); results[turn] = { name: players[turn].name, won: !!r.won, score: r.score | 0, detail: r.detail }; teardown3d(); finishTurn(); } }
      }
      if (st) {
        if (is3d && h3) { def.draw3d(h3, st, DT); opts.world.renderMg(); }
        g.setTransform(rect.w * dpr / W, 0, 0, rect.h * dpr / H, 0, 0);
        if (is3d) g.clearRect(0, 0, W, H);
        try { def.draw2d(g, st); } catch (e) { /* Zeichenfehler dürfen das Spiel nicht stoppen */ }
        if (st.fx && st.fx.length && st.status === 'playing') { // kurzes Farbsignal bei richtig/falsch
          const f = st.fx.map(x => typeof x === 'string' ? x : '');
          const k = f.some(x => x === 'bad' || x === 'buzz') ? 'bad' : f.some(x => x === 'good' || x === 'coin') ? 'good' : '';
          if (k) { flash.className = 'pt-mg-flash'; void flash.offsetWidth; flash.className = 'pt-mg-flash ' + k; }
        }
        if (PT.Audio) PT.Audio.drain(st.fx); else if (st.fx) st.fx.length = 0;
      }
      if (box.isConnected) raf = requestAnimationFrame(loop);
    }
    function finishTurn() {
      tip.hidden = true;
      if (turn < players.length - 1) {
        phase = 'between'; const r = results[turn];
        showCard('<div class="pt-mg-in"><h2>' + (r.won ? '🎉 ' : '') + esc(r.name) + ': ' + r.score + ' Punkte</h2><p>' + esc(r.detail) + '</p><div class="pt-mg-btns"><button data-primary class="pri">▶ ' + esc(players[turn + 1].name) + ' ist dran</button></div></div>');
        card.querySelector('[data-primary]').onclick = () => { turn++; start(); };
        return;
      }
      phase = 'result';
      const best = results.slice().sort((a, b) => b.score - a.score)[0], me = results[0];
      const res = { id: def.id, won: players.length > 1 ? best.won : me.won, score: players.length > 1 ? best.score : me.score, detail: players.length > 1 ? best.name + ' gewinnt mit ' + best.score + ' Punkten.' : me.detail, difficulty: diff, results: results.slice() };
      const lines = opts.reward ? (opts.reward(res) || []) : [];
      PT.Audio && PT.Audio.fx(res.won ? 'win' : 'lose');
      const table = players.length > 1 ? '<ol class="pt-mg-rank">' + results.slice().sort((a, b) => b.score - a.score).map(r => '<li><b>' + esc(r.name) + '</b> ' + r.score + (r.won ? ' ✓' : '') + '</li>').join('') + '</ol>' : '';
      showCard('<div class="pt-mg-in"><div class="pt-mg-ico">' + (res.won ? '🏆' : '😵') + '</div><h2>' + (res.won ? 'Geschafft!' : 'Nicht geschafft') + '</h2><p class="pt-mg-score">' + res.score + ' / 100</p><p class="pt-mg-why">' + esc(res.detail) + '</p>' + (res.won || players.length > 1 ? '' : '<p class="pt-mg-need">🎯 Ziel war: ' + esc(goalOf(def, diff)) + '</p>') + table +
        (lines.length ? '<ul class="pt-mg-rew">' + lines.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' : '') +
        '<div class="pt-mg-btns"><button data-primary class="pri" data-act="done">Weiter</button><button data-act="again">Nochmal</button></div></div>');
      card.querySelector('[data-act="done"]').onclick = () => close(res);
      card.querySelector('[data-act="again"]').onclick = () => { turn = 0; results = []; seed = (seed * 1664525 + 1013904223) >>> 0; ready(); };
      opts._lastRes = res;
    }
    let closed = false;
    function close(res) {
      if (closed) return; closed = true;
      teardown3d(); if (raf) cancelAnimationFrame(raf); raf = 0;
      removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('resize', layout); document.removeEventListener('visibilitychange', onVis);
      if (is3d && opts.world.setCamMode) opts.world.setCamMode('follow');
      box.remove(); current = null; document.body.classList.remove('pt-mg-on');
      if (opts.onDone) opts.onDone(res);
    }
    layout(); ready();
    current = { close, get phase() { return phase; }, get state() { return st; } };
    return current;
  }
  PT.Harness = { run, fit, KEYMAP, get current() { return current; } };
})(typeof window !== 'undefined' ? window : globalThis);

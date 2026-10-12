'use strict';
/* Bunte Insel – Mini-Spiele für die Kleinen 🧒 (ab ca. 4 Jahren, ohne Lesen): große Bilder, nur Antippen, kein Verlieren.
   Jede Insel hat ihr eigenes Spiel am Spielautomaten (BI.EXTRA_ARCADES unten), alle laufen im Mini-Spiel-Rahmen (mini.js) und auch „Mit Freunden“ (gleicher Startwert).
   Vier Bausteine, viele Welten:
   • Tipp-Jagd  – Dinge schweben/fallen/steigen, antippen (🦋 Schmetterlinge, 🥚 Drachen-Eier, 🎣 Fische, ⭐ Sternschnuppen, 🎵 Noten, 🫧 Blasen)
   • Such-Bild  – ein Bild oben zeigen, das gleiche unten antippen (🌈 Farben, 🐶 Fellretter-Tiere, 🔷 Formen, 🔥 Elemente)
   • Ring-Fang  – im richtigen Moment antippen (🎠 Karussell-Ringe)
   • Ampel-Held 🚦 (Reaktion, Stadt) und Elfmeter ⚽ (Fußball-Arena). */
(BI.MINI_EXT = BI.MINI_EXT || []).push(function (M, h) {
  const A = h.A, snd = n => { try { A[n] && A[n](); } catch (e) { } }, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const bubble = (c, x, y, r, col) => { c.fillStyle = col || 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); };

  /* =====================  Tipp-Jagd  ===================== */
  const hunt = cfg => {
    const G = {}; let it, t, sp, combo, shake;
    G.init = function () { it = []; t = 0; sp = 0; combo = 0; shake = 0; };
    G.resize = function () { };
    const size = () => Math.min(h.W(), h.H()) * (cfg.size || .15);
    function spawn() {
      const W = h.W(), H = h.H(), s = size(), bad = cfg.bad && h.rnd() < .2, k = 1 + Math.min(.7, t / 90), e = (bad ? cfg.bad : cfg.good)[(h.rnd() * (bad ? cfg.bad : cfg.good).length) | 0];
      const o = { e, bad, s: s * (bad ? 1 : .9 + h.rnd() * .3), ph: h.rnd() * 6.3, x: 0, y: 0, vx: 0, vy: 0, t: 0, a: 0 };
      if (cfg.motion === 'fall') { o.x = W * (.1 + h.rnd() * .8); o.y = -s; o.vy = H * .17 * k; } else if (cfg.motion === 'rise') { o.x = W * (.1 + h.rnd() * .8); o.y = H + s; o.vy = -H * .16 * k; }
      else if (cfg.motion === 'drift') { const d = h.rnd() < .5 ? 1 : -1; o.x = d > 0 ? -s : W + s; o.y = H * (.25 + h.rnd() * .5); o.vx = d * W * .16 * k; }
      else { const d = h.rnd() < .5 ? 1 : -1; o.x = d > 0 ? -s : W + s; o.y = H * (.2 + h.rnd() * .55); o.vx = d * W * .14 * k; o.vy = (h.rnd() - .5) * H * .1; }
      it.push(o);
    }
    G.tap = function (x, y) {
      for (let i = it.length - 1; i >= 0; i--) { const o = it[i]; if (Math.hypot(x - o.x, y - o.y) < o.s * .85) {
        if (o.bad) { snd('bonk'); combo = 0; shake = .4; h.burst(o.x, o.y, 5, ['#999', '#ccc']); it.splice(i, 1); return; }
        combo++; h.add(1 + (combo % 5 === 0 ? 1 : 0), o.x, o.y); h.burst(o.x, o.y, 10, cfg.fx || ['#ffe27a', '#fff', '#8fd8ff', '#ff8fc8']); snd('ding'); it.splice(i, 1); return; } }
      combo = 0;
    };
    G.update = function (dt) {
      t += dt; shake = Math.max(0, shake - dt); sp -= dt; const gap = Math.max(.5, 1.05 - t * .012); if (sp <= 0 && it.length < 9) { sp = gap * (.7 + h.rnd() * .6); spawn(); }
      const W = h.W(), H = h.H();
      for (const o of it) { o.t += dt; o.x += o.vx * dt + Math.sin(o.t * 2.2 + o.ph) * (cfg.motion === 'flutter' ? 0 : 22) * dt; o.y += o.vy * dt + (cfg.motion === 'drift' || cfg.motion === 'flutter' ? Math.sin(o.t * 3 + o.ph) * H * .12 * dt : 0); o.a = Math.sin(o.t * 4 + o.ph) * .25; }
      it = it.filter(o => o.x > -o.s * 2 && o.x < W + o.s * 2 && o.y > -o.s * 2 && o.y < H + o.s * 2);
    };
    G.dbg = () => ({ it, spawn, tapAt: (x, y) => G.tap(x, y) });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(); h.bg(cfg.bg[0], cfg.bg[1]); if (cfg.ground) { c.fillStyle = cfg.ground; c.fillRect(0, H * .9, W, H); }
      if (cfg.deco) cfg.deco(c, W, H, t);
      for (const o of it) h.emoji(o.e, o.x + (shake && o.bad ? Math.sin(t * 60) * 4 : 0), o.y, o.s, o.a);
      /* Erklärung ohne Wörter: Bild + Daumen / gesperrt */
      const s = Math.min(W, H) * .08; bubble(c, W / 2 - s * 2.2, H - s * 1.3, s * .9); h.emoji(cfg.good[0], W / 2 - s * 2.2, H - s * 1.3, s); h.emoji('👆', W / 2 - s * .9, H - s * 1.3, s * .9);
      if (cfg.bad) { bubble(c, W / 2 + s * .9, H - s * 1.3, s * .9); h.emoji(cfg.bad[0], W / 2 + s * .9, H - s * 1.3, s); h.emoji('🚫', W / 2 + s * 2.2, H - s * 1.3, s * .9); }
    };
    return G;
  };

  /* =====================  Such-Bild  ===================== */
  const match = cfg => {
    const G = {}; let opts, target, wait, tries, t, round;
    const lay = () => { const W = h.W(), H = h.H(), n = opts.length, s = Math.min(W / (n + .6), H * .24); return opts.map((o, i) => ({ x: W * (i + .5) / n, y: H * (.62 + (i % 2) * .1), s })); };
    function next() { round++; const n = Math.min(4, 2 + (round > 2 ? 1 : 0) + (round > 6 ? 1 : 0)), pool = cfg.set.slice().sort(() => h.rnd() - .5); opts = pool.slice(0, n); target = opts[(h.rnd() * n) | 0]; opts = opts.sort(() => h.rnd() - .5); wait = 0; tries = 0; }
    G.init = function () { t = 0; round = 0; next(); };
    G.resize = function () { };
    G.tap = function (x, y) {
      if (wait > 0) return; const L = lay();
      for (let i = 0; i < L.length; i++) if (Math.hypot(x - L[i].x, y - L[i].y) < L[i].s * .7) {
        if (opts[i] === target) { h.add(tries ? 1 : 2, L[i].x, L[i].y); h.burst(L[i].x, L[i].y, 14, ['#ffe27a', '#fff', '#8fd8ff', '#ff8fc8']); snd('ding'); wait = .9; } else { tries++; snd('bonk'); }
        return; }
    };
    G.update = function (dt) { t += dt; if (wait > 0) { wait -= dt; if (wait <= 0) next(); } };
    G.dbg = () => ({ opts, target, next, lay });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(); h.bg(cfg.bg[0], cfg.bg[1]); if (cfg.deco) cfg.deco(c, W, H, t);
      const ts = Math.min(W, H) * .24; bubble(c, W / 2, H * .24, ts * .72, 'rgba(255,255,255,.8)'); cfg.draw(c, target, W / 2, H * .24, ts);
      h.emoji('👇', W / 2, H * .43, Math.min(W, H) * .09);
      const L = lay(); for (let i = 0; i < opts.length; i++) { const o = L[i], bob = Math.sin(t * 2 + i) * 6; bubble(c, o.x, o.y + bob, o.s * .62, 'rgba(255,255,255,.65)'); cfg.draw(c, opts[i], o.x, o.y + bob, o.s * .8); }
    };
    return G;
  };
  const drawEmoji = (c, o, x, y, s) => h.emoji(o, x, y, s);
  const drawDot = (c, o, x, y, s) => { c.fillStyle = o; c.beginPath(); c.arc(x, y, s * .42, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; c.stroke(); };

  /* =====================  Ring-Fang (Karussell)  ===================== */
  const rings = () => {
    const G = {}; let t, x, dir, zone, round, wait, msg, msgT;
    const bar = () => { const W = h.W(), H = h.H(); return { x0: W * .12, x1: W * .88, y: H * .62, h: H * .12 }; };
    G.init = function () { t = 0; round = 0; wait = 0; msg = ''; msgT = 0; next(); };
    function next() { round++; const b = bar(), wdt = (b.x1 - b.x0) * Math.max(.1, .26 - round * .012); zone = { c: b.x0 + wdt / 2 + h.rnd() * ((b.x1 - b.x0) - wdt), w: wdt }; x = b.x0; dir = 1; wait = 0; }
    G.resize = function () { };
    G.tap = function () {
      if (wait > 0) return; const b = bar(), d = Math.abs(x - zone.c); wait = .9;
      if (d < zone.w / 2) { const gold = d < zone.w * .15; h.add(gold ? 3 : 2, x, b.y - 60); h.burst(x, b.y, 16, ['#ffd23f', '#fff', '#ff8fc8']); snd(gold ? 'fanfare' : 'ding'); msg = gold ? '⭐' : '👍'; } else { snd('bonk'); msg = '🙂'; } msgT = .8;
    };
    G.update = function (dt) { t += dt; msgT = Math.max(0, msgT - dt); const b = bar(); if (wait > 0) { wait -= dt; if (wait <= 0) next(); return; } x += dir * (b.x1 - b.x0) * (.5 + Math.min(.5, round * .04)) * dt; if (x > b.x1) { x = b.x1; dir = -1; } if (x < b.x0) { x = b.x0; dir = 1; } };
    G.dbg = () => ({ zone, get x() { return x; }, set x(v) { x = v; }, bar, tapNow: () => G.tap() });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(), b = bar(); h.bg('#ffd6f0', '#ffe9b8');
      for (let i = 0; i < 12; i++) { c.fillStyle = ['#ff5a8a', '#ffd23f', '#4da3ff', '#4cd07d'][i % 4]; c.beginPath(); c.moveTo(i * W / 11, 0); c.lineTo(i * W / 11 + W / 22, H * .12); c.lineTo(i * W / 11 + W / 11, 0); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(b.x0, b.y, b.x1 - b.x0, b.h); c.fillStyle = '#7fe08a'; c.fillRect(zone.c - zone.w / 2, b.y, zone.w, b.h); h.emoji('⭕', zone.c, b.y + b.h / 2, b.h * 1.3);
      h.emoji('🐴', x, b.y - b.h * .2, b.h * 1.8); h.emoji('👆', W / 2, H * .85, Math.min(W, H) * .1);
      if (msgT > 0) h.emoji(msg, W / 2, H * .35, Math.min(W, H) * .2);
    };
    return G;
  };

  /* =====================  Ampel-Held (Stadt)  ===================== */
  const ampel = () => {
    const G = {}; let st, t, tw, car, round, msg, msgT;
    G.init = function () { round = 0; st = 'red'; t = 0; tw = 1.5; car = 0; msg = ''; msgT = 0; };
    G.resize = function () { };
    G.tap = function () {
      if (st === 'green') { const r = Math.max(0, 1.2 - t); h.add(r > .8 ? 3 : 2, h.W() / 2, h.H() * .35); h.burst(h.W() / 2, h.H() * .4, 16, ['#4cd07d', '#fff', '#ffe27a']); snd('ding'); st = 'go'; t = 0; msg = '👍'; msgT = .8; }
      else if (st === 'red') { snd('bonk'); msg = '✋'; msgT = .8; }
    };
    G.update = function (dt) {
      t += dt; msgT = Math.max(0, msgT - dt);
      if (st === 'red' && t > tw) { st = 'green'; t = 0; } else if (st === 'green' && t > 1.6) { st = 'red'; t = 0; tw = 1.2 + h.rnd() * 2; } else if (st === 'go') { car += dt; if (t > 1.1) { st = 'red'; t = 0; tw = 1.2 + h.rnd() * 2; round++; } }
    };
    G.dbg = () => ({ get st() { return st; }, set st(v) { st = v; } });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(); h.bg('#9fdcff', '#d8f0ff'); c.fillStyle = '#4a4f5c'; c.fillRect(0, H * .72, W, H * .2); c.fillStyle = '#fff'; for (let i = 0; i < 9; i++) c.fillRect(i * W / 8 + ((car * 120) % (W / 8)) * -1 + W / 16, H * .81, W / 20, 6);
      const px = W * .5, py = H * .08, ph = H * .5; c.fillStyle = '#2a2f3a'; c.fillRect(px - 8, py + ph * .8, 16, H * .72 - py - ph * .8); c.fillStyle = '#16191f'; rr(c, px - ph * .17, py, ph * .34, ph * .85, 14); c.fill();
      [['red', '#ff3b3b'], ['yellow', '#ffd23f'], ['green', '#4cd07d']].forEach(([n, col], i) => { const on = n === 'red' ? st === 'red' : n === 'green' ? (st === 'green' || st === 'go') : false; c.fillStyle = on ? col : 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(px, py + ph * (.17 + i * .27), ph * .105, 0, 6.283); c.fill(); });
      const cx = st === 'go' ? W * (.1 + t * .9) : W * .1; h.emoji('🚗', cx, H * .8, Math.min(W, H) * .16, 0); if (st === 'red') h.emoji('🛑', W * .3, H * .6, Math.min(W, H) * .1); h.emoji('👆', W * .85, H * .45, Math.min(W, H) * .1);
      if (msgT > 0) h.emoji(msg, W * .2, H * .35, Math.min(W, H) * .18);
    };
    const rr = (c, x, y, w, hh, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, hh, r); else c.rect(x, y, w, hh); };
    return G;
  };

  /* =====================  Elfmeter (Fußball-Arena)  ===================== */
  const elfer = () => {
    const G = {}; let shots, ball, keeper, wait, msg, msgT, t, stage;
    const goal = () => { const W = h.W(), H = h.H(); return { x0: W * .2, x1: W * .8, y0: H * .2, y1: H * .62 }; };
    G.init = function () { shots = 5; stage = 'aim'; ball = null; keeper = { x: h.W() / 2, y: goal().y1 - 40 }; wait = 0; msg = ''; msgT = 0; t = 0; };
    G.resize = function () { };
    G.tap = function (x, y) {
      if (stage !== 'aim' || shots <= 0) return; const g = goal(), W = h.W(), H = h.H();
      const col = h.rnd(), kx = col < .34 ? g.x0 + (g.x1 - g.x0) * .17 : col < .67 ? (g.x0 + g.x1) / 2 : g.x0 + (g.x1 - g.x0) * .83;
      ball = { sx: W / 2, sy: H * .88, tx: clamp(x, g.x0 - 40, g.x1 + 40), ty: clamp(y, g.y0 - 40, g.y1), p: 0, kx, ky: g.y1 - (g.y1 - g.y0) * (h.rnd() < .5 ? .25 : .5) }; stage = 'fly'; shots--; snd('whoosh');
    };
    G.update = function (dt) {
      t += dt; msgT = Math.max(0, msgT - dt); const g = goal();
      if (stage === 'fly') { ball.p = Math.min(1, ball.p + dt * 1.8); keeper.x += (ball.kx - keeper.x) * Math.min(1, dt * 7); keeper.y += (ball.ky - keeper.y) * Math.min(1, dt * 7);
        if (ball.p >= 1) { const bx = ball.tx, by = ball.ty, inGoal = bx > g.x0 && bx < g.x1 && by > g.y0 && by < g.y1, saved = Math.hypot(bx - keeper.x, by - keeper.y) < (g.x1 - g.x0) * .15;
          if (!inGoal) { msg = '😮'; snd('bonk'); } else if (saved) { msg = '🧤'; snd('bonk'); } else { const corner = bx < g.x0 + (g.x1 - g.x0) * .2 || bx > g.x1 - (g.x1 - g.x0) * .2; h.add(corner ? 4 : 3, bx, by - 40); h.burst(bx, by, 24, ['#ffd23f', '#fff', '#4cd07d', '#ff8fc8']); snd('fanfare'); msg = '⚽ TOR!'; }
          msgT = 1.2; stage = 'wait'; wait = 1.3; } }
      else if (stage === 'wait') { wait -= dt; if (wait <= 0) { if (shots <= 0) { M.over = true; return; } stage = 'aim'; ball = null; keeper.x = h.W() / 2; keeper.y = g.y1 - 40; } }
      else keeper.x = h.W() / 2 + Math.sin(t * 2) * (g.x1 - g.x0) * .12;
    };
    G.dbg = () => ({ get stage() { return stage; }, goal, shots: () => shots, shoot: (x, y, kx) => { G.tap(x, y); if (ball && kx != null) { ball.kx = kx; ball.ky = y; } } });
    G.draw = function () {
      const c = h.ctx(), W = h.W(), H = h.H(), g = goal(); h.bg('#9fdcff', '#7fd65c'); c.fillStyle = '#4cb85a'; c.fillRect(0, g.y1, W, H);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; for (let x = g.x0; x <= g.x1; x += 28) { c.beginPath(); c.moveTo(x, g.y0); c.lineTo(x, g.y1); c.stroke(); } for (let y = g.y0; y <= g.y1; y += 28) { c.beginPath(); c.moveTo(g.x0, y); c.lineTo(g.x1, y); c.stroke(); }
      c.strokeStyle = '#fff'; c.lineWidth = 12; c.strokeRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
      h.emoji('🧤', keeper.x, keeper.y, Math.min(W, H) * .17);
      if (ball) { const p = ball.p, e = 1 - (1 - p) * (1 - p), bx = ball.sx + (ball.tx - ball.sx) * e, by = ball.sy + (ball.ty - ball.sy) * e - Math.sin(p * Math.PI) * H * .08; h.emoji('⚽', bx, by, Math.min(W, H) * (.14 - .06 * p)); } else h.emoji('⚽', W / 2, H * .88, Math.min(W, H) * .14);
      for (let i = 0; i < shots; i++) h.emoji('⚽', 40 + i * 38, H - 36, 30); if (stage === 'aim') h.emoji('👆', W / 2, H * .72, Math.min(W, H) * .1);
      if (msgT > 0) h.text(msg, W / 2, H * .42, Math.min(70, W / 8), '#fff');
    };
    return G;
  };

  /* =====================  Registrieren  ===================== */
  /* =====================  Burger braten 🍔 (Schwammi-Bucht, Knusper-Krabbe)  ===================== */
  const burger = () => {
    const G = {}; let order, stack, grill, t, msg, msgT, mist, served, flash;
    const KEYS = ['cheese', 'salad', 'tomato'], EM = { patty: '🥩', cheese: '🧀', salad: '🥬', tomato: '🍅' };
    const geo = () => { const W = h.W(), H = h.H(), s = Math.min(W / 5.4, H * .15, 96); return { W, H, s, by: H - s * .75, bx: i => W / 2 + (i - 1.5) * s * 1.15, gx: i => W * .26 + i * s * 1.5, gy: H * .5, px: W * .74, py: H * .62 }; };
    const newOrder = () => { const n = 2 + Math.min(2, served >> 1), o = []; for (let i = 0; i < n; i++) o.push(i === 0 || h.rnd() < .45 ? 'patty' : KEYS[(h.rnd() * 3) | 0]); order = o; stack = []; mist = 0; };
    G.init = function () { served = 0; t = 0; msg = ''; msgT = 0; flash = 0; grill = [{ t: 0, w: 0 }, { t: -1.4, w: 0 }]; newOrder(); };
    G.resize = function () { };
    const say = (m, d) => { msg = m; msgT = d || 1; };
    const need = () => order[stack.length];
    function add(k, x, y) { if (stack.length >= order.length) { say('🍞!', .8); return false; } if (need() === k) { stack.push(k); snd('pop'); h.burst(x, y, 6, ['#ffe27a', '#fff']); return true; } mist++; snd('bonk'); say('😅 ' + EM[need()] + ' kommt zuerst!', 1.1); return false; }
    G.tap = function (x, y) {
      const g = geo();
      for (let i = 0; i < 2; i++) if (Math.hypot(x - g.gx(i), y - g.gy) < g.s * .8) { const p = grill[i]; if (p.t < 0) return; if (p.t < 2.2) { say('🥩 noch roh …', .8); snd('bonk'); return; } if (p.t > 5.4) { p.t = -1.6; say('🔥 verbrannt!', .9); snd('bonk'); return; } if (add('patty', g.gx(i), g.gy)) { p.t = -1.6; } return; }
      for (let i = 0; i < 3; i++) if (Math.abs(x - g.bx(i)) < g.s * .56 && Math.abs(y - g.by) < g.s * .62) { add(KEYS[i], g.bx(i), g.by); return; }
      if (Math.abs(x - g.bx(3)) < g.s * .56 && Math.abs(y - g.by) < g.s * .62) {
        if (stack.length < order.length) { say('Noch nicht fertig!', .9); snd('bonk'); return; }
        const pts = 3 + (mist === 0 ? 1 : 0); served++; h.add(pts, g.px, g.py - 80); h.burst(g.px, g.py - 40, 22, ['#ffd23f', '#fff', '#ff8fc8']); snd('ding'); say(mist === 0 ? '🌟 Perfekt!' : '😋 Lecker!', 1.1); flash = .5; newOrder();
      }
    };
    G.update = function (dt) { t += dt; msgT = Math.max(0, msgT - dt); flash = Math.max(0, flash - dt); for (const p of grill) { p.t += dt; if (p.t > 7.2) p.t = -1.2; } };
    G.dbg = () => ({ get order() { return order; }, get stack() { return stack; }, grill, tapAt: (x, y) => G.tap(x, y), geo });
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#ffe9b8', '#ffb27a'); c.fillStyle = '#6a3a1a'; c.fillRect(0, H * .36, W, H * .04); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(0, 0, W, H * .3);
      /* Bestellung (oben): Brötchen – Zutaten – Brötchen */
      const os = Math.min(W / (order.length + 3), H * .12), ox = W / 2 - (order.length + 1) * os * .55; h.emoji('🍞', ox, H * .14, os);
      order.forEach((k, i) => { const done = i < stack.length, cur = i === stack.length; if (cur) { c.fillStyle = 'rgba(255,210,63,.7)'; c.beginPath(); c.arc(ox + (i + 1) * os * 1.1, H * .14, os * .62, 0, 6.283); c.fill(); } h.emoji(EM[k], ox + (i + 1) * os * 1.1, H * .14, os * (done ? .7 : 1)); if (done) h.emoji('✅', ox + (i + 1) * os * 1.1 + os * .3, H * .14 + os * .3, os * .45); }); h.emoji('🍞', ox + (order.length + 1) * os * 1.1, H * .14, os);
      /* Grill */
      c.fillStyle = '#2a2d36'; c.fillRect(g.gx(0) - g.s, g.gy - g.s * .8, g.gx(1) - g.gx(0) + g.s * 2, g.s * 1.6);
      grill.forEach((p, i) => { const x = g.gx(i), y = g.gy; c.fillStyle = '#ff7a2a'; c.globalAlpha = .35 + .2 * Math.sin(t * 8 + i); c.fillRect(x - g.s * .7, y + g.s * .55, g.s * 1.4, g.s * .12); c.globalAlpha = 1; if (p.t < 0) { h.emoji('🫧', x, y, g.s * .6); return; } const col = p.t < 2.2 ? '#e87a7a' : p.t < 5.4 ? '#a05a2a' : '#222'; c.fillStyle = col; c.beginPath(); c.arc(x, y, g.s * .55, 0, 6.283); c.fill(); if (p.t >= 2.2 && p.t <= 5.4) { c.strokeStyle = '#4cd07d'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, g.s * .66, 0, 6.283); c.stroke(); } h.emoji(p.t > 5.4 ? '🔥' : '🥩', x, y, g.s * .7); if (p.t >= 2.2 && p.t <= 5.4) h.emoji('👆', x + g.s * .5, y + g.s * .6, g.s * .5); });
      /* Teller mit dem Burger */
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(g.px, g.py + g.s * .5, g.s * 1.1, g.s * .28, 0, 0, 6.283); c.fill(); h.emoji('🍞', g.px, g.py + g.s * .35 - 4, g.s * .8); stack.forEach((k, i) => h.emoji(EM[k], g.px, g.py + g.s * .1 - i * g.s * .28, g.s * .8)); if (stack.length >= order.length) h.emoji('🍞', g.px, g.py + g.s * .1 - stack.length * g.s * .28 - 6, g.s * .8);
      /* Zutaten-Knöpfe */
      KEYS.concat(['bun']).forEach((k, i) => { const x = g.bx(i); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(x, g.by, g.s * .52, 0, 6.283); c.fill(); h.emoji(k === 'bun' ? '🍞' : EM[k], x, g.by, g.s * .8); });
      if (msgT > 0) h.text(msg, W / 2, H * .3, Math.min(44, W / 12), '#fff');
      if (flash > 0) { c.fillStyle = 'rgba(255,255,255,' + flash * .5 + ')'; c.fillRect(0, 0, W, H); }
    };
    return G;
  };

  /* =====================  Uralte Höhle 🕳️ (Rätsel-Insel): immer neue Stockwerke im Nebel  ===================== */
  const cave = () => {
    const G = {}; const N = 5; let floor, tiles, hx, hy, hearts, t, msg, msgT, shake;
    const geo = () => { const W = h.W(), H = h.H(), s = Math.min(W * .9 / N, H * .66 / N); return { W, H, s, x0: W / 2 - s * N / 2, y0: H * .2 }; };
    const build = () => {
      tiles = []; for (let y = 0; y < N; y++) { tiles.push([]); for (let x = 0; x < N; x++) tiles[y].push('e'); } hx = 0; hy = N - 1;
      const free = () => { for (let k = 0; k < 60; k++) { const x = (h.rnd() * N) | 0, y = (h.rnd() * N) | 0; if (tiles[y][x] === 'e' && Math.abs(x - hx) + Math.abs(y - hy) > 1) return [x, y]; } return null; };
      let q = null; for (let k = 0; k < 60; k++) { const x = (h.rnd() * N) | 0, y = (h.rnd() * N) | 0; if (Math.abs(x - hx) + Math.abs(y - hy) >= 5) { q = [x, y]; break; } } q = q || [N - 1, 0]; tiles[q[1]][q[0]] = 's';
      for (let i = 0; i < 2; i++) { const f = free(); if (f) tiles[f[1]][f[0]] = 'c'; } for (let i = 0; i < Math.min(5, 2 + (floor >> 1)); i++) { const f = free(); if (f) tiles[f[1]][f[0]] = 'm'; } if (h.rnd() < .35) { const f = free(); if (f) tiles[f[1]][f[0]] = 'p'; }
    };
    G.init = function () { floor = 1; hearts = 3; t = 0; msg = ''; msgT = 0; shake = 0; build(); };
    G.resize = function () { };
    const say = (m, d) => { msg = m; msgT = d || 1; };
    function step(nx, ny) {
      hx = nx; hy = ny; const k = tiles[ny][nx], g0 = geo(), cx = g0.x0 + (nx + .5) * g0.s, cy = g0.y0 + (ny + .5) * g0.s;
      if (k === 'c') { tiles[ny][nx] = 'e'; h.add(1, cx, cy); snd('ding'); say('🎁 +1', .7); }
      else if (k === 'm') { tiles[ny][nx] = 'e'; hearts--; shake = .4; snd('bonk'); say('💥 Autsch!', .8); if (hearts <= 0) { M.over = true; } }
      else if (k === 'p') { tiles[ny][nx] = 'e'; hearts = Math.min(3, hearts + 1); snd('pop'); say('🧪 +❤️', .8); }
      else if (k === 's') { h.add(3, cx, cy); snd('star'); floor++; say('🪜 Stockwerk ' + floor + '!', 1); build(); }
    }
    G.tap = function (x, y) {
      const g = geo(), tx = Math.floor((x - g.x0) / g.s), ty = Math.floor((y - g.y0) / g.s); if (tx < 0 || ty < 0 || tx >= N || ty >= N || (tx === hx && ty === hy)) return;
      const dx = tx - hx, dy = ty - hy; if (Math.abs(dx) >= Math.abs(dy)) step(hx + Math.sign(dx), hy); else step(hx, hy + Math.sign(dy));
    };
    G.update = function (dt) { t += dt; msgT = Math.max(0, msgT - dt); shake = Math.max(0, shake - dt); };
    G.dbg = () => ({ get tiles() { return tiles; }, get hero() { return [hx, hy]; }, get floor() { return floor; }, get hearts() { return hearts; }, geo, tapTile: (x, y) => { const g = geo(); G.tap(g.x0 + (x + .5) * g.s, g.y0 + (y + .5) * g.s); } });
    G.draw = function () {
      const c = h.ctx(), g = geo(), W = g.W, H = g.H; h.bg('#2a2438', '#4a3a58'); const sh = shake > 0 ? Math.sin(t * 80) * 5 : 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const px = g.x0 + x * g.s + sh, py = g.y0 + y * g.s, seen = Math.abs(x - hx) + Math.abs(y - hy) <= 2; c.fillStyle = seen ? ((x + y) % 2 ? '#7a6a8a' : '#8a7a9a') : '#3a2e48'; c.fillRect(px + 2, py + 2, g.s - 4, g.s - 4); const k = tiles[y][x];
        if (x === hx && y === hy) h.emoji('🦸', px + g.s / 2, py + g.s / 2, g.s * .8); else if (!seen) h.emoji('❔', px + g.s / 2, py + g.s / 2, g.s * .45); else if (k !== 'e') h.emoji({ c: '🎁', m: '👾', s: '🪜', p: '🧪' }[k], px + g.s / 2, py + g.s / 2, g.s * .72); }
      for (let i = 0; i < 3; i++) h.emoji(i < hearts ? '❤️' : '🖤', W / 2 - 50 + i * 50, H * .1, Math.min(48, W / 10)); h.text('Stockwerk ' + floor, W / 2, H * .94, Math.min(34, W / 14), '#ffe9a0'); if (msgT > 0) h.text(msg, W / 2, H * .17, Math.min(40, W / 12), '#fff');
    };
    return G;
  };

  const W3 = (key, g, icon, name, help, zone, goal) => h.register(key, g, { icon, name, help, dur: 45, goal: goal || 14, zone, kids: 1 });
  W3('schmetterling_insel', hunt({ good: ['🦋', '🐞', '🐝'], bad: ['🕷️'], motion: 'flutter', bg: ['#bff2ff', '#a8e88c'], ground: '#7fd65c' }), '🦋', 'Schmetterlinge fangen', 'Tippe die Schmetterlinge an! Die Spinne lässt du in Ruhe.', 'insel');
  W3('ampel_stadt', ampel(), '🚦', 'Ampel-Held', 'Wenn die Ampel grün ist: schnell tippen, dann fährt das Auto los! Bei Rot wartest du.', 'stadt', 10);
  W3('ringe_park', rings(), '🎠', 'Karussell-Ringe', 'Tippe, wenn das Pferdchen über dem goldenen Ring ist!', 'park', 12);
  W3('farben_regenbogen', match({ set: ['#ff3b3b', '#ff9a2e', '#ffe14a', '#4cd07d', '#3fa0ff', '#9b4de0', '#ff8fc8'], bg: ['#ffd6f0', '#d6f0ff'], draw: drawDot }), '🌈', 'Farben-Suche', 'Welche Farbe ist oben? Tippe die gleiche Farbe unten an!', 'regenbogen', 12);
  W3('angeln_dampfer', hunt({ good: ['🐟', '🐠', '🐡'], bad: ['👢'], motion: 'drift', bg: ['#bfe8ff', '#2f9ad8'], fx: ['#9fe3ff', '#fff'] }), '🎣', 'Fische fangen', 'Tippe die Fische an! Den alten Stiefel lässt du liegen.', 'dampfer');
  W3('eier_drachen', hunt({ good: ['🥚', '🪺'], bad: ['🔥'], motion: 'fall', bg: ['#ffb27a', '#7a4a8a'], fx: ['#ffd23f', '#ff8a1f'] }), '🥚', 'Drachen-Eier', 'Fang die Eier, bevor sie fallen! Das Feuer lässt du in Ruhe.', 'drachen');
  W3('welpen_pups', match({ set: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'], bg: ['#d6f0ff', '#fff4c8'], draw: drawEmoji }), '🐶', 'Welpen-Suche', 'Welches Tier ist oben? Tippe das gleiche Tier unten an!', 'fellretter');
  W3('elfmeter_fussball', elfer(), '⚽', 'Elfmeter', 'Tippe ins Tor, wohin du schießen willst! Der Torwart springt.', 'fussball', 9);
  W3('formen_bauland', match({ set: ['🟥', '🟦', '🟩', '🟨', '🔺', '⭕', '⭐', '🔷'], bg: ['#ffe9b8', '#d6f0ff'], draw: drawEmoji }), '🔷', 'Formen-Suche', 'Welche Form ist oben? Tippe die gleiche Form unten an!', 'bauland');
  W3('noten_radio', hunt({ good: ['🎵', '🎶', '🎸'], bad: ['🔇'], motion: 'fall', bg: ['#2a2f6a', '#6a3aa0'], fx: ['#6ad0ff', '#ff5ab4', '#fff'] }), '🎵', 'Noten-Fang', 'Fang die bunten Noten! Den stummen Lautsprecher lässt du in Ruhe.', 'radio');
  W3('elemente_zotik', match({ set: ['🔥', '💧', '🌿', '✨', '🌑', '⚡'], bg: ['#2a2a6a', '#6a4aa8'], draw: drawEmoji }), '🔥', 'Zauber-Suche', 'Welcher Zauber ist oben? Tippe den gleichen unten an!', 'zotik');
  W3('sterne_maerchen', hunt({ good: ['⭐', '🌟', '💫'], bad: ['☁️'], motion: 'fall', bg: ['#1c1f5a', '#a86ad8'], fx: ['#ffe27a', '#fff'] }), '⭐', 'Sternschnuppen', 'Fang die Sterne, die vom Himmel fallen! Die graue Wolke lässt du ziehen.', 'maerchen');
  W3('schatten_schluessel', hunt({ good: ['👾', '🌑', '👻'], bad: ['❤️'], motion: 'drift', bg: ['#1a1030', '#4a2a8a'], fx: ['#ffe27a', '#fff', '#b48aff'] }), '🗝️', 'Schatten-Jagd', 'Tippe die Dunkelwichtel an! Das rote Herz lässt du in Ruhe.', 'schluessel');
  W3('reise_schluessel', hunt({ good: ['⭐', '💎', '✨'], bad: ['☄️'], motion: 'fall', bg: ['#050a30', '#3a2a8a'], fx: ['#9ad8ff', '#fff', '#ffe27a'] }), '🚀', 'Weltenreise', 'Flieg mit dem Sternenschiff! Fang Sterne und Kristalle – dem Meteor weichst du aus.', 'schluessel');
  W3('burger_krabbe', burger(), '🍔', 'Burger braten', 'Brate das Fleisch (tippe, wenn es einen grünen Ring hat) und stapele die Zutaten in der Reihenfolge der Bestellung. Zum Schluss das Brötchen!', 'schwamm', 12);
  W3('hoehle_raetsel', cave(), '🕳️', 'Uralte Höhle', 'Tippe auf ein Feld, um dorthin zu laufen. Im Nebel liegen Truhen 🎁 und Schleimis 👾 – finde die Treppe 🪜!', 'raetsel', 14);
  W3('blasen_atlantis', hunt({ good: ['🫧', '🐚', '🦀'], bad: ['🪼'], motion: 'rise', bg: ['#0e3a5a', '#35d6e0'], fx: ['#9fe3ff', '#fff'] }), '🫧', 'Blasen-Pop', 'Tippe die Blasen und Muscheln an! Die Qualle lässt du in Ruhe.', 'atlantis');
});

/* Jedes dieser Spiele bekommt einen Spielautomaten nahe dem Eingang seiner Insel. Gebaut am Ende der Welt (world.js), wenn man freie Plätze prüfen kann. */
BI.EXTRA_ARCADES = [
  { kind: 'schmetterling_insel', at: () => ({ x: -14, z: 36, c: { x: 0, z: 0, R: 150 } }), body: 0x3fae5a, top: 0xffd23f },
  { kind: 'ampel_stadt', at: () => ({ x: 12, z: -226, c: BI.CITY }), body: 0x3a4a6a, top: 0xff5a5a },
  { kind: 'ringe_park', at: () => ({ x: 238, z: 8, c: BI.PARK }), body: 0xff8fc8, top: 0xffd23f },
  { kind: 'farben_regenbogen', at: () => ({ x: -246, z: 34, c: BI.RAINBOW }), body: 0x9b4de0, top: 'rainbow' },
  { kind: 'angeln_dampfer', at: () => ({ x: BI.DAMPF.x + 30, z: BI.DAMPF.z + 12, c: BI.DAMPF }), body: 0x2f7ad8, top: 0xdddddd },
  { kind: 'eier_drachen', at: () => ({ x: 108, z: 238, c: BI.DRACHEN }), body: 0xe0602a, top: 0xffd23f },
  { kind: 'welpen_pups', at: () => ({ x: -80, z: 234, c: BI.PUPS }), body: 0x2d6be0, top: 0xff7a1a },
  { kind: 'elfmeter_fussball', at: () => { const F = BI.FUSSBALL; return { x: F.entry.x - F.ux * 6, z: F.entry.z - F.uz * 6, c: F }; }, body: 0x2fae5a, top: 0xffffff },
  { kind: 'formen_bauland', at: () => { const B = BI.BAULAND; return { x: B.entry.x - B.uz * 10, z: B.entry.z + B.ux * 10, c: B }; }, body: 0xff9a2e, top: 0x3f8cff },
  { kind: 'noten_radio', at: () => { const R = BI.RADIO, B = R.bridge; return { x: B.bx, z: B.bz, c: R }; }, body: 0x1a1f5a, top: 0x6ad0ff },
  { kind: 'sterne_maerchen', at: () => { const M = BI.MAERCHEN, p = M.at(-40, 12); return { x: p.x, z: p.z, c: M }; }, body: 0x6a2a9a, top: 0xffd23f },
  { kind: 'schatten_schluessel', at: () => { const S = BI.SCHLUESSEL, p = S.at(-66, -4); return { x: p.x, z: p.z, c: S }; }, body: 0x2a1a5a, top: 0xffd23f },
  { kind: 'reise_schluessel', at: () => { const S = BI.SCHLUESSEL, p = S.at(-4, 38); return { x: p.x, z: p.z, c: S }; }, body: 0x1a3a8a, top: 0xff7a3a },
  { kind: 'elemente_zotik', at: () => { const Z = BI.ZOTIK; return { x: Z.x + 8, z: Z.bridge.z1 + 14, c: Z }; }, body: 0x2a2a6a, top: 0xb48aff }
];
/* Platz suchen: nahe am Wunschpunkt, frei und auf der richtigen Insel; Automat schaut zum Weltmittelpunkt der Hauptinsel */
BI.buildExtraArcades = function (c) {
  const { W, st, lamp } = c, taken = (W.spots.arcades || []).slice(), list = BI.EXTRA_ARCADES.concat(BI.EXTRA_ARCADES2 || []);
  for (const e of list) {
    const a = e.at(), I = a.c; let best = null;
    for (let r = 0; r <= 24 && !best; r += 2) for (let k = 0; k < (r ? 12 : 1) && !best; k++) { const an = k / 12 * Math.PI * 2, x = a.x + Math.sin(an) * r, z = a.z + Math.cos(an) * r;
      if (Math.hypot(x - I.x, z - I.z) > I.R - 7 || !W.free(x, z, 2.2) || taken.some(t => Math.hypot(t.x - x, t.z - z) < 4)) continue; best = { x, z }; }
    if (!best) continue; taken.push(best);
    const tx = I.x, tz = I.z, yaw = Math.atan2(tx - best.x, tz - best.z) + Math.PI * (e.flip ? 1 : 0);
    BI.buildArcades({ W, st, lamp, only: [{ kind: e.kind, x: best.x, z: best.z, yaw, body: e.body, top: e.top }] });
  }
};

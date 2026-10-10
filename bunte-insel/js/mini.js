'use strict';
/* Bunte Insel – Mini-Spiele (2D, ein Finger genügt): Ballon-Pop, Wackel-Wichtel, Memory, Sternenfänger.
   Alleine oder mit Freunden: gleicher Startwert (seed) = gleiche Ballons/Karten bei allen, danach werden nur die Punkte verglichen.
   Solange ein Mini-Spiel läuft, wird die 3D-Welt nicht gezeichnet (spart Akku). */
BI.createMini = function (G) {
  const A = G.A, cv = document.getElementById('mgCanvas'), ctx = cv.getContext('2d');
  const M = { active: false, kind: '', score: 0, t: 0, dur: 0, over: false, onEnd: null, onScore: null, others: () => '', info: null };
  const FONT = 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  let W = 0, H = 0, dpr = 1, rnd = Math.random, game = null, parts = [], pops = [], lastScore = -1, sendT = 0, endT = 0;
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', () => { if (M.active) { resize(); if (game && game.resize) game.resize(); } });
  const emoji = (e, x, y, s, a) => { ctx.save(); ctx.translate(x, y); if (a) ctx.rotate(a); ctx.font = Math.round(s) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, s * .06); ctx.restore(); };
  const text = (t, x, y, s, col, al) => { ctx.font = 'bold ' + Math.round(s) + 'px Fredoka, ' + FONT; ctx.textAlign = al || 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = Math.max(3, s / 6); ctx.strokeStyle = '#16335e'; ctx.lineJoin = 'round'; ctx.strokeText(t, x, y); ctx.fillStyle = col || '#fff'; ctx.fillText(t, x, y); };
  const bg = (c1, c2) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  const burst = (x, y, n, cols) => { for (let i = 0; i < n; i++) { const a = rnd() * 6.283, s = 80 + rnd() * 220; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, t: 0, c: cols[i % cols.length], r: 3 + rnd() * 5 }); } };
  const pop = (txt, x, y, col) => pops.push({ txt, x, y, t: 0, col: col || '#ffe27a' });
  const add = (n, x, y) => { M.score += n; pop('+' + n, x, y); };
  const COLS = ['#ff5a5a', '#4da3ff', '#ffd23f', '#4cd07d', '#b36bff', '#ff8fc8', '#ff8a1f'];

  /* ---------- Ballon-Pop ---------- */
  const POP = {
    init() { this.b = []; this.sp = .3; },
    update(dt) {
      this.sp -= dt; if (this.sp <= 0) { this.sp = Math.max(.3, .85 - M.t * .012); const r = Math.min(W, H) * (.07 + rnd() * .04), k = rnd(); this.b.push({ x: r + rnd() * (W - 2 * r), y: H + r, r, vy: H * (.14 + rnd() * .12 + M.t * .002), c: COLS[(rnd() * COLS.length) | 0], ph: rnd() * 6, kind: k < .08 ? 'face' : k < .2 ? 'gold' : 'n' }); }
      for (const b of this.b) { b.y -= b.vy * dt; b.ph += dt * 2; }
      this.b = this.b.filter(b => b.y > -b.r * 2);
    },
    draw() {
      bg('#8fd8ff', '#e6f7ff'); ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 4; i++) { const x = ((i * 310 + M.t * 12) % (W + 200)) - 100, y = 70 + i * 55; ctx.beginPath(); ctx.ellipse(x, y, 60, 22, 0, 0, 6.283); ctx.ellipse(x + 40, y + 6, 46, 18, 0, 0, 6.283); ctx.fill(); }
      for (const b of this.b) {
        const x = b.x + Math.sin(b.ph) * 8; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, b.y + b.r * 1.15); ctx.quadraticCurveTo(x + 10, b.y + b.r * 1.9, x - 4, b.y + b.r * 2.6); ctx.stroke();
        ctx.fillStyle = b.kind === 'face' ? '#ffd23f' : b.kind === 'gold' ? '#ffcf2e' : b.c; ctx.beginPath(); ctx.ellipse(x, b.y, b.r, b.r * 1.18, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(x - b.r * .35, b.y - b.r * .4, b.r * .22, b.r * .34, .5, 0, 6.283); ctx.fill();
        if (b.kind === 'face') { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x - b.r * .3, b.y - b.r * .1, b.r * .1, 0, 6.283); ctx.arc(x + b.r * .3, b.y - b.r * .1, b.r * .1, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, b.y + b.r * .15, b.r * .35, .2, 2.9); ctx.stroke(); }
        else if (b.kind === 'gold') emoji('⭐', x, b.y, b.r * .9);
      }
    },
    tap(x, y) {
      for (let i = this.b.length - 1; i >= 0; i--) { const b = this.b[i], bx = b.x + Math.sin(b.ph) * 8; if (Math.hypot(x - bx, (y - b.y) / 1.18) < b.r * 1.3) { this.b.splice(i, 1); const v = b.kind === 'face' ? 5 : b.kind === 'gold' ? 3 : 1; add(v, bx, b.y); burst(bx, b.y, 10, [b.c, '#fff', '#ffe27a']); A.pop(); if (b.kind === 'face') A.giggle && A.giggle(); return; } }
    }
  };

  /* ---------- Wackel-Wichtel ---------- */
  const MOLE = {
    init() { this.h = []; for (let i = 0; i < 9; i++) this.h.push({ up: 0, e: '', v: 0, hit: 0 }); this.sp = .5; this.lay(); },
    resize() { this.lay(); },
    lay() { const s = Math.min(W / 3.4, (H - 130) / 3.4); this.s = s; this.ox = W / 2 - s; this.oy = H / 2 + 20 - s; },
    pos(i) { return [this.ox + (i % 3) * this.s, this.oy + ((i / 3) | 0) * this.s]; },
    update(dt) {
      this.sp -= dt; const free = this.h.map((q, i) => q.up <= 0 && q.hit <= 0 ? i : -1).filter(i => i >= 0);
      if (this.sp <= 0 && free.length) { this.sp = Math.max(.42, .85 - M.t * .01); const q = this.h[free[(rnd() * free.length) | 0]], k = rnd(); q.up = Math.max(.8, 1.5 - M.t * .012); q.d = q.up; q.v = k < .1 ? 3 : 1; q.e = k < .1 ? '👑' : ['🧸', '🐰', '🐻', '🐸', '🐥', '🦊'][(rnd() * 6) | 0]; q.hit = 0; }
      for (const q of this.h) { if (q.up > 0) q.up -= dt; if (q.hit > 0) q.hit -= dt; }
    },
    draw() {
      bg('#8fe39a', '#4cb85d'); const s = this.s;
      for (let i = 0; i < 9; i++) {
        const [x, y] = this.pos(i), q = this.h[i]; ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.ellipse(x, y + s * .22, s * .38, s * .16, 0, 0, 6.283); ctx.fill();
        if (q.up > 0 || q.hit > 0) { const k = q.hit > 0 ? q.hit / .35 : Math.min(1, q.up / .25, (q.d - q.up) / .2 + .01); ctx.save(); ctx.beginPath(); ctx.rect(x - s * .5, y - s * .8, s, s * 1.02); ctx.clip(); emoji(q.e, x, y + s * .22 - s * .55 * Math.min(1, k), s * .62, q.hit > 0 ? (1 - k) * .5 : 0); ctx.restore(); }
        ctx.fillStyle = '#4a321c'; ctx.beginPath(); ctx.ellipse(x, y + s * .24, s * .38, s * .12, 0, 0, 3.1416); ctx.fill();
      }
    },
    tap(x, y) {
      let best = -1, bd = 1e9; for (let i = 0; i < 9; i++) { const [px, py] = this.pos(i), d = Math.hypot(x - px, y - py); if (d < this.s * .55 && d < bd && this.h[i].up > 0) { best = i; bd = d; } }
      if (best >= 0) { const q = this.h[best], [px, py] = this.pos(best); q.up = 0; q.hit = .35; add(q.v, px, py - this.s * .4); burst(px, py, 9, ['#ffe27a', '#fff', '#ff8fc8']); A.bonk ? A.bonk() : A.pop(); }
    }
  };

  /* ---------- Memory ---------- */
  const EMO = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🐥', '🦄', '🐢', '🐙', '🚗', '🚁', '⚽', '🍎', '🍓', '🎈'];
  const MEM = {
    init() { const pool = EMO.slice(); for (let i = pool.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; } const six = pool.slice(0, 6), deck = six.concat(six); for (let i = deck.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [deck[i], deck[j]] = [deck[j], deck[i]]; } this.c = deck.map(e => ({ e, f: 0, m: false })); this.sel = []; this.wait = 0; this.miss = 0; this.found = 0; this.lay(); },
    resize() { this.lay(); },
    lay() { const land = W > H, cols = land ? 4 : 3, rows = 12 / cols, pad = 12, s = Math.min((W - pad * 2) / cols, (H - 120) / rows); this.cols = cols; this.s = s; this.ox = W / 2 - s * cols / 2; this.oy = H / 2 + 24 - s * rows / 2; },
    update(dt) {
      for (const c of this.c) c.f += ((c.m || this.sel.includes(c) ? 1 : 0) - c.f) * Math.min(1, dt * 12);
      if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) { const [a, b] = this.sel; if (a.e === b.e) { a.m = b.m = true; this.found++; M.score = this.calc(); A.ding(); } else this.miss++; this.sel = []; if (this.found >= 6) { M.score = this.calc(); M.over = true; } } }
      if (!M.over) M.score = this.calc();
    },
    calc() { return Math.max(0, Math.round(this.found * 20 + Math.max(0, 60 - M.t * .6) - this.miss * 2)); },
    draw() {
      bg('#ffd9a8', '#ffb7c8'); const s = this.s;
      this.c.forEach((c, i) => {
        const x = this.ox + (i % this.cols) * s + s / 2, y = this.oy + ((i / this.cols) | 0) * s + s / 2, w = s * .86, k = Math.abs(Math.cos(c.f * 3.1416)), face = c.f > .5;
        ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(.05, k), 1); ctx.fillStyle = face ? (c.m ? '#d9ffd9' : '#fff') : '#4da3ff'; ctx.strokeStyle = '#16335e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2, -w / 2, w, w, w * .16) : ctx.rect(-w / 2, -w / 2, w, w); ctx.fill(); ctx.stroke();
        if (face) emoji(c.e, 0, 0, w * .6); else { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = 'bold ' + Math.round(w * .5) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0); } ctx.restore();
      });
    },
    tap(x, y) {
      if (this.wait > 0 || this.sel.length >= 2) return; const i = this.c.findIndex((c, j) => { const cx = this.ox + (j % this.cols) * this.s, cy = this.oy + ((j / this.cols) | 0) * this.s; return x > cx && x < cx + this.s && y > cy && y < cy + this.s; });
      if (i < 0) return; const c = this.c[i]; if (c.m || this.sel.includes(c)) return; this.sel.push(c); A.pop(); if (this.sel.length === 2) this.wait = .75;
    }
  };

  /* ---------- Sternenfänger ---------- */
  const CATCH = {
    init() { this.x = W / 2; this.tx = W / 2; this.f = []; this.sp = .3; this.key = 0; },
    resize() { this.tx = W / 2; },
    update(dt) {
      this.x += (this.tx - this.x) * Math.min(1, dt * 14); if (this.key) { this.tx = Math.max(40, Math.min(W - 40, this.tx + this.key * W * .9 * dt)); }
      this.sp -= dt; if (this.sp <= 0) { this.sp = Math.max(.32, .8 - M.t * .01); const k = rnd(), r = Math.min(W, H) * .05; this.f.push({ x: r + rnd() * (W - 2 * r), y: -r, vy: H * (.28 + rnd() * .1 + M.t * .004), e: k < .12 ? '💎' : k < .3 ? '🍬' : k < .6 ? '🍎' : '⭐', v: k < .12 ? 3 : k < .3 ? 2 : 1, r, a: rnd() * 6 }); }
      const by = H - 70, bw = Math.min(W * .22, 150);
      for (const q of this.f) { q.y += q.vy * dt; q.a += dt * 3; if (!q.done && q.y > by - 30 && q.y < by + 30 && Math.abs(q.x - this.x) < bw / 2 + q.r * .4) { q.done = true; add(q.v, q.x, by - 40); burst(q.x, by - 10, 8, ['#ffe27a', '#fff', '#8fd8ff']); A.star(); } }
      this.f = this.f.filter(q => !q.done && q.y < H + 60);
    },
    draw() {
      bg('#2b2f7a', '#6b4fc0'); ctx.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, (i * 53 + M.t * 6) % H, 2, 2);
      for (const q of this.f) emoji(q.e, q.x, q.y, q.r * 2, Math.sin(q.a) * .3);
      const by = H - 70, bw = Math.min(W * .22, 150); emoji('🧺', this.x, by, bw * .95);
    },
    tap(x) { this.tx = Math.max(40, Math.min(W - 40, x)); },
    move(x) { this.tx = Math.max(40, Math.min(W - 40, x)); },
    keydown(c) { if (c === 'ArrowLeft' || c === 'KeyA') this.key = -1; else if (c === 'ArrowRight' || c === 'KeyD') this.key = 1; },
    keyup(c) { if ((c === 'ArrowLeft' || c === 'KeyA') && this.key < 0 || (c === 'ArrowRight' || c === 'KeyD') && this.key > 0) this.key = 0; }
  };

  /* ---------- Lern-Spiele mit Sprachausgabe: Zahlen-Zauber, Farben-Quiz, Tierstimmen (8 Fragen, 3 Antworten) ---------- */
  const NUMW = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
  const THINGS = [['🍎', 'Äpfel'], ['⭐', 'Sterne'], ['🎈', 'Ballons'], ['🐟', 'Fische'], ['🚗', 'Autos'], ['🌸', 'Blumen'], ['🐥', 'Küken']];
  const COLN = [['rot', '#e0382b'], ['blau', '#2d6be0'], ['gelb', '#ffd23f'], ['grün', '#2fae5a'], ['orange', '#ff8a1f'], ['lila', '#9b4fd8'], ['rosa', '#ff8fc8'], ['braun', '#8a5a33'], ['schwarz', '#23262d'], ['weiß', '#ffffff']];
  const ANI = [['Kuh', '🐮', 'moo'], ['Schaf', '🐑', 'baa'], ['Hund', '🐶', 'bark'], ['Ente', '🦆', 'quack'], ['Katze', '🐱', 'meow'], ['Frosch', '🐸', 'ribbit'], ['Schwein', '🐷', 'oink']];
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const QUIZ = {
    init(kind) { this.kind = kind; this.r = 0; this.tries = 0; this.wait = 0; this.shake = [0, 0, 0]; this.pulse = 0; this.next(); },
    resize() { },
    lay() { const bw = Math.min(W * .29, 230), gap = W * .025, x0 = (W - 3 * bw - 2 * gap) / 2, h = Math.min(H * .27, 190); return [0, 1, 2].map(i => ({ x: x0 + i * (bw + gap), y: H * .66, w: bw, h })); },
    next() {
      this.r++; if (this.r > 8) { M.over = true; return; } this.tries = 0; this.wait = 0; this.pulse = 0; const k = this.kind; let ans;
      if (k === 'count') { const n = 1 + ((rnd() * Math.min(10, 3 + this.r)) | 0), th = THINGS[(rnd() * THINGS.length) | 0], pts = []; for (let t = 0; t < 300 && pts.length < n; t++) { const p = [.12 + rnd() * .76, .2 + rnd() * .34]; if (pts.every(q => Math.hypot((q[0] - p[0]) * W, (q[1] - p[1]) * H) > Math.min(W, H) * .11)) pts.push(p); } this.n = pts.length; this.pts = pts; this.th = th; const d = new Set([this.n]); while (d.size < 3) { const c = Math.max(1, Math.min(10, this.n + ((rnd() * 5) | 0) - 2)); d.add(c); } ans = shuf([...d]); this.ans = ans.map(v => ({ v, ok: v === this.n })); this.say = 'Wie viele ' + th[1] + ' siehst du?'; }
      else if (k === 'colors') { const pool = COLN.slice(0, Math.min(10, 4 + this.r)), c = pool[(rnd() * pool.length) | 0], d = new Set([c]); while (d.size < 3) d.add(pool[(rnd() * pool.length) | 0]); this.c = c; this.ans = shuf([...d]).map(v => ({ v, ok: v === c })); this.say = 'Wo ist ' + c[0] + '?'; }
      else { const a = ANI[(rnd() * ANI.length) | 0], d = new Set([a]); while (d.size < 3) d.add(ANI[(rnd() * ANI.length) | 0]); this.a = a; this.ans = shuf([...d]).map(v => ({ v, ok: v === a })); this.say = 'Wer macht so?'; }
      this.ask();
    },
    ask() { if (this.kind === 'animals') { A[this.a[2]] && A[this.a[2]](); setTimeout(() => { if (M.active && game === this) A[this.a[2]] && A[this.a[2]](); }, 700); setTimeout(() => { if (M.active && game === this) A.speak && A.speak(this.say); }, 1500); } else A.speak && A.speak(this.say); },
    update(dt) { for (let i = 0; i < 3; i++) this.shake[i] = Math.max(0, this.shake[i] - dt * 3); if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) this.next(); } if (this.tries >= 2) this.pulse += dt; },
    draw() {
      bg(this.kind === 'colors' ? '#fff3c4' : this.kind === 'animals' ? '#c9f0c2' : '#cfe9ff', '#ffffff'); const k = this.kind;
      text('Frage ' + Math.min(8, this.r) + ' / 8', W - 20, 34, 24, '#fff', 'right');
      if (k === 'count') { text('Wie viele ' + this.th[0] + '?', W / 2, H * .12, Math.min(44, W / 12), '#fff'); this.pts.forEach(p => emoji(this.th[0], p[0] * W, p[1] * H, Math.min(W, H) * .1)); }
      else if (k === 'colors') { text('Wo ist ' + this.c[0].toUpperCase() + '?', W / 2, H * .2, Math.min(64, W / 8), this.c[1] === '#ffffff' ? '#cfd8e8' : this.c[1]); emoji('🔊', W / 2, H * .42, Math.min(W, H) * .16); }
      else { text('Wer macht so?', W / 2, H * .16, Math.min(48, W / 10), '#fff'); emoji('🔊', W / 2, H * .4, Math.min(W, H) * .2); }
      this.lay().forEach((b, i) => {
        const a = this.ans[i], sh = Math.sin(this.shake[i] * 30) * this.shake[i] * 14, hl = this.tries >= 2 && a.ok ? 1 + Math.sin(this.pulse * 8) * .06 : 1, good = this.wait > 0 && a.ok;
        ctx.save(); ctx.translate(b.x + b.w / 2 + sh, b.y + b.h / 2); ctx.scale(hl, hl); ctx.fillStyle = good ? '#d9ffd9' : '#fff'; ctx.strokeStyle = good ? '#2fae5a' : '#16335e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 24) : ctx.rect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.fill(); ctx.stroke();
        if (k === 'count') text(String(a.v), 0, 6, b.h * .62, '#ff7a1f'); else if (k === 'colors') { ctx.fillStyle = a.v[1]; ctx.strokeStyle = '#16335e'; ctx.beginPath(); ctx.arc(0, 0, Math.min(b.w, b.h) * .34, 0, 6.283); ctx.fill(); ctx.stroke(); } else emoji(a.v[1], 0, 0, b.h * .6);
        ctx.restore();
      });
    },
    tap(x, y) {
      if (this.wait > 0) return; if (y < H * .6) { this.ask(); return; }
      const i = this.lay().findIndex(b => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h); if (i < 0) return; const a = this.ans[i], b = this.lay()[i];
      if (a.ok) { add(this.tries === 0 ? 2 : 1, b.x + b.w / 2, b.y); burst(b.x + b.w / 2, b.y + b.h / 2, 14, ['#ffe27a', '#fff', '#8fd8ff', '#ff8fc8']); A.ding(); this.wait = 1.1; const w = this.kind === 'count' ? 'Richtig! ' + NUMW[this.n] : this.kind === 'colors' ? 'Richtig! ' + this.c[0] : 'Richtig! ' + this.a[0]; A.speak && A.speak(w); }
      else { this.tries++; this.shake[i] = 1; A.bonk(); if (this.tries === 1) A.speak && A.speak('Fast! Probier es nochmal.'); }
    }
  };
  const mkQuiz = kind => Object.assign(Object.create(QUIZ), { init() { QUIZ.init.call(this, kind); } });
  const GAMES = { pop: POP, mole: MOLE, memory: MEM, catch: CATCH, count: mkQuiz('count'), colors: mkQuiz('colors'), animals: mkQuiz('animals') };
  M.GAMES = { pop: { icon: '🎈', name: 'Ballon-Pop', help: 'Tippe die Ballons an – gelbe Gesichter und Sterne geben extra Punkte!', dur: 45, goal: 25 }, mole: { icon: '🧸', name: 'Wackel-Wichtel', help: 'Tippe die Wichtel an, bevor sie sich verstecken – Kronen zählen dreifach!', dur: 40, goal: 22 }, memory: { icon: '🧩', name: 'Memory', help: 'Finde alle Paare – schnell und mit wenig Fehlern gibt es mehr Punkte.', dur: 120, goal: 70 }, count: { icon: '🔢', name: 'Zahlen-Zauber', help: 'Zähl die Dinge und tippe die richtige Zahl – du hörst die Frage!', dur: 150, goal: 8 }, colors: { icon: '🌈', name: 'Farben-Quiz', help: 'Wo ist ROT? Tippe die richtige Farbe an – mit Sprachausgabe.', dur: 150, goal: 8 }, animals: { icon: '🐮', name: 'Tierstimmen', help: 'Hör gut zu: Welches Tier macht dieses Geräusch?', dur: 150, goal: 8 }, catch: { icon: '🧺', name: 'Sternenfänger', help: 'Zieh den Korb hin und her und fang alles, was fällt: Sterne, Äpfel, Bonbons, Diamanten!', dur: 45, goal: 25 } };

  /* ---------- Steuerung ---------- */
  const px = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; };
  let down = false;
  cv.addEventListener('pointerdown', e => { if (!M.active || M.over) return; e.preventDefault(); A.resume(); down = true; const [x, y] = px(e); game.tap && game.tap(x, y); try { cv.setPointerCapture(e.pointerId); } catch (x2) { } });
  cv.addEventListener('pointermove', e => { if (!M.active || M.over) return; const [x] = px(e); if (game.move && (down || e.pointerType === 'mouse')) game.move(x); });
  const up = () => { down = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  addEventListener('keydown', e => { if (M.active && game && game.keydown) game.keydown(e.code); }); addEventListener('keyup', e => { if (M.active && game && game.keyup) game.keyup(e.code); });

  /* ---------- Ablauf ---------- */
  M.start = function (kind, seed, dur) {
    if (!GAMES[kind]) return false; game = GAMES[kind]; M.kind = kind; rnd = BI.rng(seed | 0 || 12345); M.score = 0; M.t = 0; M.dur = dur || M.GAMES[kind].dur; M.over = false; M.active = true; parts = []; pops = []; lastScore = -1; sendT = 0; endT = 0; down = false;
    cv.hidden = false; resize(); game.init(); return true;
  };
  M.cur = () => game;
  M.stop = function () { M.active = false; cv.hidden = true; game = null; };
  M.update = function (dt) {
    if (!M.active) return; if (dt > .1) dt = .1; if (!M.over) { M.t += dt; game.update(dt); if (M.t >= M.dur) { M.over = true; } }
    for (const p of parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; } parts = parts.filter(p => p.t < .7);
    for (const p of pops) p.t += dt; pops = pops.filter(p => p.t < .9);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); game.draw();
    for (const p of parts) { ctx.globalAlpha = 1 - p.t / .7; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1;
    for (const p of pops) { ctx.globalAlpha = 1 - p.t / .9; text(p.txt, p.x, p.y - p.t * 60, 34, p.col); } ctx.globalAlpha = 1;
    const left = Math.max(0, Math.ceil(M.dur - M.t)); text('⭐ ' + M.score, 20, 34, 30, '#ffe27a', 'left'); text('⏱ ' + (M.kind === 'memory' ? Math.floor(M.t) : left), W / 2, 34, 30, '#fff'); const o = M.others(); if (o) text(o, W / 2, H - 22, 20, '#fff');
    if (M.over) { endT += dt; text('Super!', W / 2, H / 2, 64, '#ffe27a'); if (endT > .9 && M.onEnd) { const f = M.onEnd; M.onEnd = null; f({ kind: M.kind, score: M.score }); } }
    else if (M.onScore && M.score !== lastScore) { sendT -= dt; if (sendT <= 0 || M.score > lastScore) { sendT = .3; lastScore = M.score; M.onScore(M.score); } }
  };
  return M;
};
